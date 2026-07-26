import { Coordinate } from "./types";
import { gazetteerLookup } from "./gazetteer";

// US Census Bureau geocoder — public domain, no key. Returns coordinates and
// the TIGER geographies used for proxy resolution.

export interface GeocodeResult {
  coordinate: Coordinate;
  matched_address: string;
  place_name: string | null;
  state_fips: string | null;
  zip: string | null;
  /** True when the point is a locality centroid, not a rooftop-level match. */
  approximate?: boolean;
}

interface CensusMatch {
  coordinates: { x: number; y: number };
  matchedAddress: string;
  addressComponents?: { zip?: string };
  geographies?: Record<string, Array<Record<string, string>>>;
}

export async function geocode(address: string): Promise<GeocodeResult | null> {
  const live = await geocodeCensus(address);
  if (live) return live;
  // Census is a no-SLA government endpoint; when it is unreachable, fall back to
  // the bundled gazetteer so demo-coverage addresses still resolve (see
  // gazetteer.ts). Returns null outside that coverage — no silent guessing.
  return gazetteerLookup(address);
}

async function geocodeCensus(address: string): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({
    address,
    benchmark: "Public_AR_Current",
    vintage: "Current_Current",
    layers: "all",
    format: "json",
  });
  const url = `https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?${params}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: { addressMatches?: CensusMatch[] } };
    const m = data.result?.addressMatches?.[0];
    if (!m) return null;
    const geos = m.geographies ?? {};
    const place = (geos["Incorporated Places"] ?? geos["Census Designated Places"] ?? [])[0];
    const state = (geos["States"] ?? [])[0];
    return {
      coordinate: { lat: m.coordinates.y, lon: m.coordinates.x },
      matched_address: m.matchedAddress,
      place_name: place?.NAME ?? null,
      state_fips: state?.STATE ?? null,
      zip: m.addressComponents?.zip ?? null,
    };
  } catch {
    return null;
  }
}
