import { Coordinate, Env } from "../types";
import { cacheKeys, getJson, putJson, ttl } from "./cache";
import { fetchJson, withRetry } from "./http";

// -----------------------------------------------------------------------------
// Address geocoding (§12: "geocoded to precise latitude and longitude C(lat,lon)").
//
// Uses the U.S. Census Bureau geocoder — public domain, no API key, and it also
// returns the TIGER geographies (place / county subdivision) that back the Tier 2
// proxy match. Results are cached in KV for 30 days (§15).
// -----------------------------------------------------------------------------

export interface GeocodeResult {
  coordinate: Coordinate;
  matched_address: string;
  /** TIGER place GEOID (state+place FIPS) used for Tier 2 proxy matching. */
  place_geoid: string | null;
  place_name: string | null;
  state_fips: string | null;
  county_fips: string | null;
}

interface CensusMatch {
  coordinates: { x: number; y: number };
  matchedAddress: string;
  geographies?: Record<string, Array<Record<string, string>>>;
}

interface CensusResponse {
  result: { addressMatches: CensusMatch[] };
}

function extractGeographies(match: CensusMatch): {
  place_geoid: string | null;
  place_name: string | null;
  state_fips: string | null;
  county_fips: string | null;
} {
  const geos = match.geographies ?? {};
  const places =
    geos["Incorporated Places"] ??
    geos["Census Designated Places"] ??
    geos["County Subdivisions"] ??
    [];
  const place = places[0];
  const counties = geos["Counties"] ?? [];
  const county = counties[0];
  const states = geos["States"] ?? [];
  const state = states[0];

  return {
    place_geoid: place?.GEOID ?? null,
    place_name: place?.NAME ?? null,
    state_fips: state?.STATE ?? place?.STATE ?? county?.STATE ?? null,
    county_fips: county?.GEOID ?? null,
  };
}

export async function geocode(
  env: Env,
  address: string
): Promise<GeocodeResult | null> {
  const key = cacheKeys.geocode(address);
  const cached = await getJson<GeocodeResult>(env, key);
  if (cached) return cached;

  const params = new URLSearchParams({
    address,
    benchmark: "Public_AR_Current",
    vintage: "Current_Current",
    layers: "all",
    format: "json",
  });
  const url = `${env.CENSUS_GEOCODER_BASE}/geographies/onelineaddress?${params.toString()}`;

  let data: CensusResponse;
  try {
    data = await withRetry(() => fetchJson<CensusResponse>(url), 3, 400);
  } catch {
    return null;
  }

  const match = data.result?.addressMatches?.[0];
  if (!match) return null;

  const geo = extractGeographies(match);
  const result: GeocodeResult = {
    // Census returns x=lon, y=lat.
    coordinate: { lat: match.coordinates.y, lon: match.coordinates.x },
    matched_address: match.matchedAddress,
    ...geo,
  };

  await putJson(env, key, result, ttl(env, "geocode"));
  return result;
}
