import type { GeocodeResult } from "./geocode";

// -----------------------------------------------------------------------------
// Offline fallback gazetteer.
//
// The primary geocoder is the US Census onelineaddress service — public domain
// and authoritative, but a government endpoint with real maintenance windows and
// no SLA. When it is slow, rate-limited, or down, every lookup on the site dies
// at the front door, including the marquee example addresses advertised on the
// landing page. That is the worst possible first impression.
//
// This table resolves the ZIP codes and city names that fall inside our bundled
// TEMM demo boundaries so the flagship path always produces a real report. It is
// deliberately narrow: it covers only the demo coverage areas, is clearly marked
// as approximate in the result, and never masks a genuine "no coverage" answer
// for an address outside it.
// -----------------------------------------------------------------------------

interface GazetteerEntry {
  /** Representative point inside the corresponding demo service polygon. */
  lat: number;
  lon: number;
  /** Human-readable locality used for the normalized-address echo. */
  city: string;
  state: string;
  state_fips: string;
  zips: string[];
  /** Lowercase city tokens accepted in free-text matching. */
  aliases: string[];
}

const ENTRIES: GazetteerEntry[] = [
  {
    lat: 43.0125,
    lon: -83.6875,
    city: "Flint",
    state: "MI",
    state_fips: "26",
    zips: [
      "48501", "48502", "48503", "48504", "48505", "48506", "48507",
      "48401", "48532", "48551", "48552", "48553", "48554", "48555",
      "48556", "48557", "48559",
    ],
    aliases: ["flint"],
  },
  {
    lat: 40.7357,
    lon: -74.1724,
    city: "Newark",
    state: "NJ",
    state_fips: "34",
    zips: [
      "07101", "07102", "07103", "07104", "07105", "07106", "07107",
      "07108", "07112", "07114", "07175", "07184", "07188", "07189",
      "07191", "07192", "07193", "07195", "07198", "07199",
    ],
    aliases: ["newark"],
  },
  {
    lat: 30.2672,
    lon: -97.7431,
    city: "Austin",
    state: "TX",
    state_fips: "48",
    zips: [
      "78701", "78702", "78703", "78704", "78705", "78712", "78721",
      "78722", "78723", "78731", "78741", "78751", "78752", "78756",
      "78757", "78758",
    ],
    aliases: ["austin", "clear springs"],
  },
];

const BY_ZIP = new Map<string, GazetteerEntry>();
for (const e of ENTRIES) for (const z of e.zips) BY_ZIP.set(z, e);

function toResult(e: GazetteerEntry, zip: string | null): GeocodeResult {
  return {
    coordinate: { lat: e.lat, lon: e.lon },
    // Marked approximate so the UI never implies rooftop-level precision from a
    // locality-centroid match.
    matched_address: `${e.city}, ${e.state}${zip ? ` ${zip}` : ""} (approximate)`,
    place_name: e.city,
    state_fips: e.state_fips,
    zip: zip ?? e.zips[0],
    approximate: true,
  };
}

function extractZip(s: string): string | null {
  const m = s.match(/\b(\d{5})(?:-\d{4})?\b/);
  return m ? m[1] : null;
}

/**
 * Best-effort offline resolution for an address string. ZIP match wins over a
 * city-name match, because a ZIP is unambiguous and a bare city name is not.
 * Returns null for anything outside the bundled demo coverage — callers then
 * continue to the live registry path or the honest empty state.
 */
export function gazetteerLookup(address: string): GeocodeResult | null {
  const zip = extractZip(address);
  if (zip) {
    const hit = BY_ZIP.get(zip);
    if (hit) return toResult(hit, zip);
  }

  const haystack = address.toLowerCase();
  for (const e of ENTRIES) {
    for (const alias of e.aliases) {
      // Require a word boundary so "Newark Street, Dallas TX" does not match.
      const re = new RegExp(`(^|[^a-z])${alias}([^a-z]|$)`, "i");
      if (re.test(haystack)) {
        // Only accept a city match when the state also appears, or when no
        // other state token is present at all.
        const stateRe = new RegExp(`(^|[^a-z])${e.state}([^a-z]|$)`, "i");
        if (stateRe.test(address)) return toResult(e, zip);
      }
    }
  }
  return null;
}
