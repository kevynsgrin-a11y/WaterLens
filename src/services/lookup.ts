import {
  DwellingType,
  Env,
  LookupResult,
  MatchTier,
} from "../types";
import {
  DISCLAIMER_AFFILIATE,
  DISCLAIMER_MEDICAL,
  DISCLAIMER_PLUMBING,
  DISCLAIMER_TIER3,
  ENGINE_VERSION,
} from "../config/constants";
import { cacheKeys, getJson, putJson, ttl } from "../lib/cache";
import { geocode } from "../lib/geocode";
import { resolvePws } from "./spatial";
import { getSdwisProfile } from "./sdwis";
import { matchFilters } from "./setcover";

// -----------------------------------------------------------------------------
// End-to-end address lookup orchestration (§3 workflow, §22 output contract):
//
//   address -> geocode C(lat,lon) -> TEMM resolve PWSID -> SDWIS profile ->
//   set-cover filter match -> unified JSON payload.
//
// The entire payload is cached in KV keyed by (normalized address, dwelling type)
// so repeated neighborhood lookups avoid redundant spatial + Envirofacts work.
// -----------------------------------------------------------------------------

function nowIso(): string {
  return new Date().toISOString();
}

function buildDisclaimers(tier: MatchTier): string[] {
  const out = [DISCLAIMER_MEDICAL, DISCLAIMER_PLUMBING, DISCLAIMER_AFFILIATE];
  if (tier === MatchTier.MODELED || tier === MatchTier.NONE) {
    out.splice(1, 0, DISCLAIMER_TIER3);
  }
  return out;
}

function emptyUtilityResult(
  address: string,
  dwelling: DwellingType,
  normalized: string | null,
  coordinate: { lat: number; lon: number } | null,
  match: LookupResult["match"]
): LookupResult {
  return {
    query: { address, normalized_address: normalized, dwelling_type: dwelling },
    coordinate,
    match,
    utility: null,
    detected_contaminants: [],
    active_violations: [],
    recommended_filters: [],
    data_freshness: { sdwis_fetched_at: null, generated_at: nowIso() },
    disclaimers: buildDisclaimers(match.tier),
    meta: { cache_hit: false, engine_version: ENGINE_VERSION },
  };
}

export async function runLookup(
  env: Env,
  address: string,
  dwelling: DwellingType = "UNKNOWN"
): Promise<LookupResult> {
  const cacheKey = cacheKeys.lookup(address, dwelling);
  const cached = await getJson<LookupResult>(env, cacheKey);
  if (cached) {
    return { ...cached, meta: { ...cached.meta, cache_hit: true } };
  }

  // 1. Geocode.
  const geo = await geocode(env, address);
  if (!geo) {
    return emptyUtilityResult(address, dwelling, null, null, {
      pwsid: null,
      tier: MatchTier.NONE,
      confidence: 0,
      tierLabel: "Unmatched",
      requiresLabTestWarning: true,
    });
  }

  // 2. TEMM spatial resolve.
  const match = await resolvePws(env, geo);
  if (!match.pwsid) {
    const result = emptyUtilityResult(
      address,
      dwelling,
      geo.matched_address,
      geo.coordinate,
      match
    );
    await putJson(env, cacheKey, result, ttl(env, "lookup"));
    return result;
  }

  // 3. SDWIS municipal profile (D1 + KV cache-through).
  const profile = await getSdwisProfile(env, match.pwsid);

  // 4. Constrained set-cover filter match against health-goal exceedances.
  const recommended = await matchFilters(env, profile.detections, dwelling);

  // 5. Assemble the output contract.
  const result: LookupResult = {
    query: {
      address,
      normalized_address: geo.matched_address,
      dwelling_type: dwelling,
    },
    coordinate: geo.coordinate,
    match,
    utility: profile.utility,
    detected_contaminants: profile.detections
      .filter((d) => d.exceeds_health_goal)
      .sort((a, b) => (b.mcl_ratio ?? 0) - (a.mcl_ratio ?? 0)),
    active_violations: profile.violations,
    recommended_filters: recommended,
    data_freshness: {
      sdwis_fetched_at: profile.fetched_at,
      generated_at: nowIso(),
    },
    disclaimers: buildDisclaimers(match.tier),
    meta: { cache_hit: false, engine_version: ENGINE_VERSION },
  };

  await putJson(env, cacheKey, result, ttl(env, "lookup"));
  return result;
}
