import "server-only";
import {
  DISCLAIMER_AFFILIATE,
  DISCLAIMER_MEDICAL,
  DISCLAIMER_PLUMBING,
  DISCLAIMER_TIER3,
  ENGINE_VERSION,
  MatchTier,
  NITRATE_CODES,
  NITRATE_WARNING,
  TIER_CONFIDENCE,
} from "./constants";
import { DEMO_BY_PWSID } from "./data";
import { buildDetection, matchFilters, resolveSpatial } from "./engine";
import { geocode } from "./geocode";
import * as ef from "./envirofacts";
import {
  Detection,
  DwellingType,
  HistoryPoint,
  LookupResult,
  Polygon,
  SpatialMatch,
  Violation,
  WaterSystem,
} from "./types";

const nowIso = () => new Date().toISOString();

function disclaimers(tier: MatchTier): string[] {
  const out = [DISCLAIMER_MEDICAL, DISCLAIMER_PLUMBING, DISCLAIMER_AFFILIATE];
  if (tier === MatchTier.MODELED || tier === MatchTier.NONE) out.splice(1, 0, DISCLAIMER_TIER3);
  return out;
}

function nitrate(dets: Detection[]): string | null {
  return dets.some((d) => NITRATE_CODES.has(d.code) && d.exceeds_health_goal)
    ? NITRATE_WARNING
    : null;
}

/** Rich profile for a bundled demo system (also used by entity pages). */
export function demoProfile(pwsid: string): {
  utility: WaterSystem;
  detections: Detection[];
  violations: Violation[];
  history: { code: string; value: number; unit: string; sample_date: string }[];
  fetched_at: string;
} | null {
  const d = DEMO_BY_PWSID.get(pwsid);
  if (!d) return null;
  const detections = d.detections
    .map((r) => buildDetection({ ...r, agency: r.agency, source: "SDWIS_LCR" }))
    .filter((x): x is Detection => Boolean(x));
  const violations: Violation[] = d.violations.map((v) => ({ ...v, pwsid, violation_code: null }));
  return {
    utility: d.system,
    detections,
    violations,
    history: d.history,
    fetched_at: "2026-07-01T00:00:00Z",
  };
}

interface AssembleExtras {
  history?: HistoryPoint[];
  serviceBoundary?: Polygon | null;
}

function assemble(
  query: LookupResult["query"],
  coordinate: LookupResult["coordinate"],
  match: SpatialMatch,
  utility: WaterSystem | null,
  detections: Detection[],
  violations: Violation[],
  dwelling: DwellingType,
  resolution: LookupResult["meta"]["resolution"],
  fetched_at: string | null,
  multiCount: number,
  extras: AssembleExtras = {}
): LookupResult {
  const exceedances = detections
    .filter((d) => d.exceeds_health_goal)
    .sort((a, b) => (b.mcl_ratio ?? 0) - (a.mcl_ratio ?? 0));
  // Only carry history for contaminants actually surfaced in this report.
  const shown = new Set(exceedances.map((d) => d.code));
  const history = (extras.history ?? [])
    .filter((h) => shown.has(h.code))
    .sort((a, b) => a.sample_date.localeCompare(b.sample_date));
  return {
    query,
    coordinate,
    match,
    utility,
    detected_contaminants: exceedances,
    history,
    service_boundary: extras.serviceBoundary ?? null,
    active_violations: violations,
    recommended_filters: matchFilters(detections, dwelling),
    nitrate_warning: nitrate(exceedances),
    multi_system_warning: multiCount > 1,
    multi_system_count: multiCount,
    data_freshness: { sdwis_fetched_at: fetched_at, generated_at: nowIso() },
    disclaimers: disclaimers(match.tier),
    meta: { cache_hit: false, engine_version: ENGINE_VERSION, resolution },
  };
}

function empty(
  query: LookupResult["query"],
  coordinate: LookupResult["coordinate"],
  resolution: LookupResult["meta"]["resolution"]
): LookupResult {
  const match: SpatialMatch = {
    pwsid: null,
    tier: MatchTier.NONE,
    confidence: 0,
    tierLabel: "Unmatched",
    requiresLabTestWarning: true,
  };
  return assemble(query, coordinate, match, null, [], [], query.dwelling_type, resolution, null, 0);
}

function extractZip(s: string): string | null {
  const m = s.match(/\b(\d{5})(?:-\d{4})?\b/);
  return m ? m[1] : null;
}

export async function runLookup(
  address: string,
  dwelling: DwellingType = "UNKNOWN"
): Promise<LookupResult> {
  const geo = await geocode(address);
  const query = {
    address,
    normalized_address: geo?.matched_address ?? null,
    dwelling_type: dwelling,
  };

  // 1. Geocoded — try bundled TEMM boundaries first (rich, instant).
  if (geo) {
    const match = resolveSpatial(geo.coordinate);
    if (match.pwsid) {
      const prof = demoProfile(match.pwsid)!;
      return assemble(
        query, geo.coordinate, match, prof.utility, prof.detections,
        prof.violations, dwelling, "TEMM", prof.fetched_at, 1,
        { history: prof.history, serviceBoundary: DEMO_BY_PWSID.get(match.pwsid)?.boundary ?? null }
      );
    }
    // 2. Outside demo coverage — live Envirofacts ZIP fallback.
    const zip = geo.zip ?? extractZip(address);
    if (zip) return zipFallback(query, geo.coordinate, zip, dwelling);
    return empty(query, geo.coordinate, "NONE");
  }

  // 3. Geocode failed — try ZIP in the raw input.
  const zip = extractZip(address);
  if (zip) return zipFallback(query, null, zip, dwelling);
  return empty(query, null, "NONE");
}

async function zipFallback(
  query: LookupResult["query"],
  coordinate: LookupResult["coordinate"],
  zip: string,
  dwelling: DwellingType
): Promise<LookupResult> {
  const pwsids = await ef.fetchPwsidsForZip(zip);
  if (pwsids.length === 0) return empty(query, coordinate, "NONE");

  // Prefer the largest system by population.
  const systems = (await Promise.all(pwsids.slice(0, 8).map((p) => ef.fetchSystem(p)))).filter(
    (x): x is WaterSystem => Boolean(x)
  );
  systems.sort((a, b) => (b.population_served ?? 0) - (a.population_served ?? 0));
  const primary = systems[0];
  if (!primary) return empty(query, coordinate, "NONE");

  const violations = await ef.fetchHealthViolations(primary.pwsid);
  const match: SpatialMatch = {
    pwsid: primary.pwsid,
    tier: MatchTier.MATCHED,
    confidence: TIER_CONFIDENCE[MatchTier.MATCHED],
    tierLabel: "ZIP Registry (multi-system possible)",
    requiresLabTestWarning: pwsids.length > 1,
  };
  // Live path exposes verified violations; sample-level detections require the
  // full weekly ingestion (backend), so recommendations key off violation codes.
  return assemble(
    query, coordinate, match, primary, [], violations, dwelling, "ZIP_REGISTRY",
    nowIso(), pwsids.length
  );
}
