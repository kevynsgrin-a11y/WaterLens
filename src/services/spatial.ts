import { Coordinate, Env, MatchTier, Polygon, SpatialMatch } from "../types";
import { TIER_CONFIDENCE, TIER_LABEL } from "../config/constants";
import {
  boundingBox,
  haversineKm,
  inBoundingBox,
  parsePolygon,
  pointInPolygon,
} from "../lib/geo";
import { GeocodeResult } from "../lib/geocode";

// -----------------------------------------------------------------------------
// TEMM deterministic spatial join (§12 / §22).
//
//   Tier 1 (EXPLICIT): C intersects an explicit verified utility service polygon
//                       -> exact PWSID, confidence 1.0
//   Tier 2 (MATCHED):   C intersects a TIGER place polygon matched to a utility
//                       proxy -> proxy PWSID, confidence 0.85
//   Tier 3 (MODELED):   Haversine d from C to nearest modeled centroid; if
//                       d < R_model -> modeled PWSID, confidence 0.50
//
// The hierarchy short-circuits: the first tier that resolves wins. This mirrors
// "prioritizing the highest fidelity data" from §12.
// -----------------------------------------------------------------------------

interface BoundaryRow {
  pwsid: string;
  tier: string; // 'EXPLICIT' | 'MATCHED' (Tier 1/2 polygons)
  geometry: string; // GeoJSON string
}

interface CentroidRow {
  pwsid: string;
  centroid_lat: number;
  centroid_lon: number;
  model_radius_km: number | null;
}

function unmatched(): SpatialMatch {
  return {
    pwsid: null,
    tier: MatchTier.NONE,
    confidence: TIER_CONFIDENCE[MatchTier.NONE],
    tierLabel: TIER_LABEL[MatchTier.NONE],
    requiresLabTestWarning: true,
  };
}

function buildMatch(
  pwsid: string,
  tier: MatchTier,
  distanceKm?: number
): SpatialMatch {
  return {
    pwsid,
    tier,
    confidence: TIER_CONFIDENCE[tier],
    tierLabel: TIER_LABEL[tier],
    distanceKm,
    // Tier 3 modeled matches (and no-matches) require the yellow warning banner (§13).
    requiresLabTestWarning: tier === MatchTier.MODELED,
  };
}

/**
 * Tier 1 & 2 both operate on stored polygons; they differ only by the `tier`
 * column and thus the confidence emitted. We evaluate explicit polygons first,
 * then matched proxies, using a cheap bounding-box pre-filter before the ray cast.
 */
async function polygonMatch(
  env: Env,
  point: Coordinate,
  tierFilter: "EXPLICIT" | "MATCHED",
  placeGeoid: string | null
): Promise<{ pwsid: string; geometry: Polygon } | null> {
  // For MATCHED (Tier 2) we can constrain candidates by the geocoded TIGER place.
  const stmt =
    tierFilter === "MATCHED" && placeGeoid
      ? env.DB.prepare(
          `SELECT pwsid, tier, geometry FROM pws_boundaries
             WHERE tier = ?1 AND place_geoid = ?2`
        ).bind(tierFilter, placeGeoid)
      : env.DB.prepare(
          `SELECT pwsid, tier, geometry FROM pws_boundaries
             WHERE tier = ?1
               AND ?2 BETWEEN min_lon AND max_lon
               AND ?3 BETWEEN min_lat AND max_lat`
        ).bind(tierFilter, point.lon, point.lat);

  const { results } = await stmt.all<BoundaryRow>();
  if (!results?.length) return null;

  for (const row of results) {
    const poly = parsePolygon(row.geometry);
    if (!poly) continue;
    if (!inBoundingBox(point, boundingBox(poly))) continue;
    if (pointInPolygon(point, poly)) {
      return { pwsid: row.pwsid, geometry: poly };
    }
  }
  return null;
}

/**
 * Tier 3: nearest modeled centroid within the model radius R_model (Haversine).
 * When a per-system radius is stored we honour it; otherwise the global default
 * MODEL_RADIUS_KM from wrangler vars is used.
 */
async function centroidMatch(
  env: Env,
  point: Coordinate,
  state_fips: string | null
): Promise<SpatialMatch | null> {
  const defaultRadius = Number(env.MODEL_RADIUS_KM) || 15;

  // Coarse candidate window (~2x radius in degrees) to bound the scan.
  const degWindow = (defaultRadius / 111) * 2;
  const stmt = env.DB.prepare(
    `SELECT pwsid, centroid_lat, centroid_lon, model_radius_km
       FROM pws_centroids
      WHERE centroid_lat BETWEEN ?1 AND ?2
        AND centroid_lon BETWEEN ?3 AND ?4`
  ).bind(
    point.lat - degWindow,
    point.lat + degWindow,
    point.lon - degWindow,
    point.lon + degWindow
  );

  const { results } = await stmt.all<CentroidRow>();
  if (!results?.length) return null;

  let best: { pwsid: string; d: number } | null = null;
  for (const row of results) {
    const d = haversineKm(point, {
      lat: row.centroid_lat,
      lon: row.centroid_lon,
    });
    const rModel = row.model_radius_km ?? defaultRadius;
    if (d < rModel && (best === null || d < best.d)) {
      best = { pwsid: row.pwsid, d };
    }
  }

  if (!best) return null;
  // state_fips is currently informational; reserved for future disambiguation.
  void state_fips;
  return buildMatch(best.pwsid, MatchTier.MODELED, Number(best.d.toFixed(3)));
}

/**
 * Resolve a geocoded address to a PWSID using the strict TEMM hierarchy.
 */
export async function resolvePws(
  env: Env,
  geo: GeocodeResult
): Promise<SpatialMatch> {
  const point = geo.coordinate;

  // Tier 1 — explicit verified polygon.
  const explicit = await polygonMatch(env, point, "EXPLICIT", geo.place_geoid);
  if (explicit) return buildMatch(explicit.pwsid, MatchTier.EXPLICIT);

  // Tier 2 — TIGER place proxy polygon.
  const matched = await polygonMatch(env, point, "MATCHED", geo.place_geoid);
  if (matched) return buildMatch(matched.pwsid, MatchTier.MATCHED);

  // Tier 3 — modeled centroid radius.
  const modeled = await centroidMatch(env, point, geo.state_fips);
  if (modeled) return modeled;

  return unmatched();
}
