import { Env } from "../types";
import {
  fetchLcrSamplesFromEnvirofacts,
  fetchSystemFromEnvirofacts,
  fetchViolationsFromEnvirofacts,
} from "../services/sdwis";
import { getContaminantDefs } from "../services/sdwis";
import { parseEnvirofactsDate } from "../lib/envirofacts";

// -----------------------------------------------------------------------------
// Weekly SDWIS ingestion (§18 mitigation: "Scrape SDWIS data weekly into
// proprietary D1 rather than executing live API calls per user query").
//
// The cron ingests the set of PWSIDs currently tracked (any PWS referenced by a
// stored boundary/centroid or saved address). For each system it refreshes the
// water_systems row, upserts violations, and derives contaminant detections from
// LCR samples. Every run records an ingestion_log row for freshness reporting.
// -----------------------------------------------------------------------------

/** PWSIDs the platform actively serves: boundaries + centroids + saved addresses. */
async function trackedPwsids(env: Env, limit: number): Promise<string[]> {
  const { results } = await env.DB.prepare(
    `SELECT pwsid FROM (
        SELECT pwsid FROM pws_boundaries
        UNION SELECT pwsid FROM pws_centroids
        UNION SELECT pwsid FROM saved_addresses
        UNION SELECT pwsid FROM water_systems
     )
     ORDER BY pwsid
     LIMIT ?1`
  )
    .bind(limit)
    .all<{ pwsid: string }>();
  return (results ?? []).map((r) => r.pwsid);
}

async function ingestSystem(env: Env, pwsid: string): Promise<void> {
  const contaminantDefs = await getContaminantDefs(env);
  const nowIso = new Date().toISOString();

  // 1. Water system metadata.
  const system = await fetchSystemFromEnvirofacts(env, pwsid);
  if (system) {
    await env.DB.prepare(
      `INSERT INTO water_systems
          (pwsid, name, state, county, population_served, pws_type, primary_source, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
       ON CONFLICT(pwsid) DO UPDATE SET
          name = excluded.name,
          state = excluded.state,
          county = excluded.county,
          population_served = excluded.population_served,
          pws_type = excluded.pws_type,
          primary_source = excluded.primary_source,
          updated_at = excluded.updated_at`
    )
      .bind(
        system.pwsid,
        system.name,
        system.state,
        system.county,
        system.population_served,
        system.pws_type,
        system.primary_source,
        nowIso
      )
      .run();
  }

  // 2. Violations (health-based flag preserved for alerting).
  const violations = await fetchViolationsFromEnvirofacts(env, pwsid);
  for (const v of violations) {
    await env.DB.prepare(
      `INSERT INTO violations
          (pwsid, violation_id, contaminant_code, violation_code, violation_category,
           is_health_based, begin_date, status, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
       ON CONFLICT(pwsid, violation_id) DO UPDATE SET
          status = excluded.status,
          is_health_based = excluded.is_health_based`
    )
      .bind(
        v.pwsid,
        v.violation_id,
        v.contaminant_code,
        v.violation_code,
        v.violation_category,
        v.is_health_based ? 1 : 0,
        v.begin_date,
        v.status,
        nowIso
      )
      .run();
  }

  // 3. Contaminant detections derived from LCR samples. We keep only the most
  //    recent measured value per contaminant code (temporal freshness — §3).
  const samples = await fetchLcrSamplesFromEnvirofacts(env, pwsid);
  const latestByCode = new Map<
    string,
    { value: number; unit: string; date: string | null }
  >();
  for (const s of samples) {
    const code = s.CONTAMINANT_CODE;
    const value = s.SAMPLE_MEASURE ? Number(s.SAMPLE_MEASURE) : NaN;
    if (!code || Number.isNaN(value)) continue;
    if (!contaminantDefs.has(code)) continue; // only definitions we can interpret
    const date = parseEnvirofactsDate(s.SAMPLING_END_DATE);
    const existing = latestByCode.get(code);
    if (!existing || (date ?? "") > (existing.date ?? "")) {
      latestByCode.set(code, { value, unit: s.UNIT_OF_MEASURE ?? "", date });
    }
  }

  for (const [code, d] of latestByCode) {
    await env.DB.prepare(
      `INSERT INTO detections
          (pwsid, contaminant_code, value, unit, sample_date, sampling_agency, source, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
       ON CONFLICT(pwsid, contaminant_code) DO UPDATE SET
          value = excluded.value,
          unit = excluded.unit,
          sample_date = excluded.sample_date,
          updated_at = excluded.updated_at`
    )
      .bind(pwsid, code, d.value, d.unit, d.date, "SDWIS", "SDWIS_LCR", nowIso)
      .run();
  }

  // 4. Freshness log + invalidate the cached SDWIS profile for this system.
  await env.DB.prepare(
    `INSERT INTO ingestion_log (pwsid, violations, detections, fetched_at)
       VALUES (?1, ?2, ?3, ?4)`
  )
    .bind(pwsid, violations.length, latestByCode.size, nowIso)
    .run();

  await env.CACHE.delete(`sdwis:${pwsid.toUpperCase()}`);
}

export interface IngestSummary {
  attempted: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

/** Entry point invoked by the weekly cron trigger. */
export async function runSdwisIngestion(
  env: Env,
  maxSystems = 500
): Promise<IngestSummary> {
  const pwsids = await trackedPwsids(env, maxSystems);
  const summary: IngestSummary = {
    attempted: pwsids.length,
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  for (const pwsid of pwsids) {
    try {
      await ingestSystem(env, pwsid);
      summary.succeeded++;
    } catch (err) {
      summary.failed++;
      if (summary.errors.length < 20) {
        summary.errors.push(`${pwsid}: ${(err as Error).message}`);
      }
    }
  }

  return summary;
}
