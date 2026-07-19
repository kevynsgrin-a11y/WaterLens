import {
  ContaminantDefinition,
  Detection,
  Env,
  Violation,
  WaterSystem,
} from "../types";
import {
  HEALTH_BASED_VIOLATION_CATEGORIES,
  SDWA_TABLES,
} from "../config/constants";
import { cacheKeys, getJson, putJson, ttl } from "../lib/cache";
import {
  buildEfUrl,
  fetchEfRows,
  isViolationActive,
  parseEnvirofactsDate,
} from "../lib/envirofacts";

// -----------------------------------------------------------------------------
// SDWIS municipal layer (§10, §22).
//
// The EPA Envirofacts Data Service exposes the SDWA_* tables in public domain.
// Per §18 (API Rate Limiting mitigation) we do NOT hit Envirofacts live on every
// user query: the weekly cron ingests into D1, and reads are served from D1 with
// a KV-cached JSON payload in front. `fetchSystemFromEnvirofacts` is used only by
// the ingestion job (and as a cold-start fallback).
// -----------------------------------------------------------------------------

const MAX_ROWS = 100;

function efUrl(env: Env, table: string, column: string, value: string): string {
  // Envirofacts REST shape: /efservice/<TABLE>/<COLUMN>/<VALUE>/rows/0:100/JSON
  return buildEfUrl(
    env.ENVIROFACTS_BASE,
    table,
    column,
    encodeURIComponent(value),
    "rows",
    `0:${MAX_ROWS}`
  );
}

// ---- Raw Envirofacts row shapes (subset of columns we consume) --------------

interface EfGeographicArea {
  PWSID: string;
  STATE_SERVED?: string;
}

interface EfWaterSystem {
  PWSID: string;
  PWS_NAME?: string;
  PWS_TYPE_CODE?: string;
  PRIMARY_SOURCE_CODE?: string;
  POPULATION_SERVED_COUNT?: string;
  STATE_CODE?: string;
  COUNTY_SERVED?: string;
}

interface EfViolation {
  PWSID: string;
  VIOLATION_ID?: string;
  CONTAMINANT_CODE?: string;
  VIOLATION_CODE?: string;
  VIOLATION_CATEGORY_CODE?: string;
  IS_HEALTH_BASED_IND?: string;
  NON_COMPL_PER_BEGIN_DATE?: string;
  VIOLATION_STATUS?: string;
  COMPLIANCE_STATUS_CODE?: string;
  RTC_DATE?: string;
}

interface EfLcrSample {
  PWSID: string;
  CONTAMINANT_CODE?: string;
  SAMPLE_MEASURE?: string;
  UNIT_OF_MEASURE?: string;
  SAMPLING_END_DATE?: string;
}

// ---- Envirofacts fetchers (ingestion side) ----------------------------------

/**
 * Resolve a 5-digit ZIP to PWSIDs via the official SDWA_GEOGRAPHIC_AREAS
 * registry (§22 municipal layer). Tries GEO_ID first, then ANSI_ENTITY_CODE.
 * Used as a coarse fallback when address geocoding fails — a ZIP can span
 * multiple systems, so callers must surface a multi-system warning.
 */
export async function fetchPwsidsForZip(env: Env, zip: string): Promise<string[]> {
  const attempt = async (column: string) => {
    const rows = await fetchEfRows<EfGeographicArea>(
      buildEfUrl(
        env.ENVIROFACTS_BASE,
        SDWA_TABLES.GEOGRAPHIC_AREAS,
        "GEO_TYPE",
        "ZP",
        column,
        encodeURIComponent(zip),
        "rows",
        `0:${MAX_ROWS}`
      )
    );
    return rows.map((r) => r.PWSID).filter(Boolean);
  };

  const primary = await attempt("GEO_ID");
  const pwsids = primary.length > 0 ? primary : await attempt("ANSI_ENTITY_CODE");
  return [...new Set(pwsids)];
}

export async function fetchSystemFromEnvirofacts(
  env: Env,
  pwsid: string
): Promise<WaterSystem | null> {
  const rows = await fetchEfRows<EfWaterSystem>(
    efUrl(env, SDWA_TABLES.WATER_SYSTEM, "PWSID", pwsid)
  );
  const r = rows[0];
  if (!r) return null;
  return {
    pwsid: r.PWSID,
    name: r.PWS_NAME ?? pwsid,
    state: r.STATE_CODE ?? null,
    county: r.COUNTY_SERVED ?? null,
    population_served: r.POPULATION_SERVED_COUNT
      ? Number(r.POPULATION_SERVED_COUNT)
      : null,
    pws_type: r.PWS_TYPE_CODE ?? null,
    primary_source: r.PRIMARY_SOURCE_CODE ?? null,
  };
}

export async function fetchViolationsFromEnvirofacts(
  env: Env,
  pwsid: string
): Promise<Violation[]> {
  const rows = await fetchEfRows<EfViolation>(
    efUrl(env, SDWA_TABLES.VIOLATIONS, "PWSID", pwsid)
  );
  return rows.map((r) => ({
    pwsid: r.PWSID,
    violation_id: r.VIOLATION_ID ?? "",
    contaminant_code: r.CONTAMINANT_CODE ?? null,
    violation_code: r.VIOLATION_CODE ?? null,
    violation_category: r.VIOLATION_CATEGORY_CODE ?? null,
    is_health_based:
      r.IS_HEALTH_BASED_IND === "Y" ||
      HEALTH_BASED_VIOLATION_CATEGORIES.has(r.VIOLATION_CATEGORY_CODE ?? ""),
    begin_date: parseEnvirofactsDate(r.NON_COMPL_PER_BEGIN_DATE),
    // Prefer the structured compliance status; fall back to any status string.
    status: isViolationActive(r) ? r.VIOLATION_STATUS ?? "Unaddressed" : "Resolved",
  }));
}

export async function fetchLcrSamplesFromEnvirofacts(
  env: Env,
  pwsid: string
): Promise<EfLcrSample[]> {
  return fetchEfRows<EfLcrSample>(
    efUrl(env, SDWA_TABLES.LCR_SAMPLES, "PWSID", pwsid)
  );
}

// ---- D1 read side (serves user queries) -------------------------------------

export async function getWaterSystem(
  env: Env,
  pwsid: string
): Promise<WaterSystem | null> {
  return env.DB.prepare(
    `SELECT pwsid, name, state, county, population_served, pws_type, primary_source
       FROM water_systems WHERE pwsid = ?1`
  )
    .bind(pwsid)
    .first<WaterSystem>();
}

export async function getContaminantDefs(
  env: Env
): Promise<Map<string, ContaminantDefinition>> {
  const { results } = await env.DB.prepare(
    `SELECT code, name, category, mcl, health_goal, unit FROM contaminants`
  ).all<ContaminantDefinition>();
  const map = new Map<string, ContaminantDefinition>();
  for (const c of results ?? []) map.set(c.code, c);
  return map;
}

/**
 * Detected contaminants for a PWS, joined against contaminant definitions so we
 * can compute MCL / health-goal exceedance (§22: "exceeding public health goals").
 */
export async function getDetections(
  env: Env,
  pwsid: string
): Promise<Detection[]> {
  const { results } = await env.DB.prepare(
    `SELECT d.contaminant_code AS code,
            c.name            AS name,
            c.category        AS category,
            d.value           AS value,
            d.unit            AS unit,
            c.mcl             AS mcl,
            c.health_goal     AS health_goal,
            d.sample_date     AS sample_date,
            d.sampling_agency AS sampling_agency,
            d.source          AS source
       FROM detections d
       JOIN contaminants c ON c.code = d.contaminant_code
      WHERE d.pwsid = ?1`
  )
    .bind(pwsid)
    .all<{
      code: string;
      name: string;
      category: string;
      value: number;
      unit: string;
      mcl: number | null;
      health_goal: number | null;
      sample_date: string | null;
      sampling_agency: string | null;
      source: string;
    }>();

  return (results ?? []).map((r) => {
    const exceeds_mcl = r.mcl != null && r.value > r.mcl;
    // When no distinct health goal is published, fall back to the MCL.
    const goal = r.health_goal ?? r.mcl;
    const exceeds_health_goal = goal != null && r.value > goal;
    return {
      code: r.code,
      name: r.name,
      category: r.category,
      value: r.value,
      unit: r.unit,
      mcl: r.mcl,
      health_goal: r.health_goal,
      mcl_ratio: r.mcl != null && r.mcl > 0 ? Number((r.value / r.mcl).toFixed(3)) : null,
      exceeds_mcl,
      exceeds_health_goal,
      sample_date: r.sample_date,
      sampling_agency: r.sampling_agency,
      source: r.source,
    };
  });
}

export async function getActiveViolations(
  env: Env,
  pwsid: string
): Promise<Violation[]> {
  const { results } = await env.DB.prepare(
    `SELECT pwsid, violation_id, contaminant_code, violation_code,
            violation_category, is_health_based, begin_date, status
       FROM violations
      WHERE pwsid = ?1 AND (status IS NULL OR status != 'Resolved')
      ORDER BY begin_date DESC
      LIMIT 100`
  )
    .bind(pwsid)
    .all<{
      pwsid: string;
      violation_id: string;
      contaminant_code: string | null;
      violation_code: string | null;
      violation_category: string | null;
      is_health_based: number;
      begin_date: string | null;
      status: string | null;
    }>();

  return (results ?? []).map((r) => ({
    ...r,
    is_health_based: Boolean(r.is_health_based),
  }));
}

/** Timestamp of the most recent successful SDWIS ingestion for a PWS. */
export async function getSdwisFreshness(
  env: Env,
  pwsid: string
): Promise<string | null> {
  const row = await env.DB.prepare(
    `SELECT fetched_at FROM ingestion_log WHERE pwsid = ?1 ORDER BY fetched_at DESC LIMIT 1`
  )
    .bind(pwsid)
    .first<{ fetched_at: string }>();
  return row?.fetched_at ?? null;
}

/**
 * Cache-through read of the full SDWIS profile for a PWS. The KV payload lets a
 * whole neighborhood share one materialized profile (§15).
 */
export interface SdwisProfile {
  utility: WaterSystem | null;
  detections: Detection[];
  violations: Violation[];
  fetched_at: string | null;
}

export async function getSdwisProfile(
  env: Env,
  pwsid: string
): Promise<SdwisProfile> {
  const key = cacheKeys.sdwis(pwsid);
  const cached = await getJson<SdwisProfile>(env, key);
  if (cached) return cached;

  const [utility, detections, violations, fetched_at] = await Promise.all([
    getWaterSystem(env, pwsid),
    getDetections(env, pwsid),
    getActiveViolations(env, pwsid),
    getSdwisFreshness(env, pwsid),
  ]);

  const profile: SdwisProfile = { utility, detections, violations, fetched_at };
  await putJson(env, key, profile, ttl(env, "sdwis"));
  return profile;
}
