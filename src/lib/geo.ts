import { Coordinate, Polygon, Ring } from "../types";

const EARTH_RADIUS_KM = 6371.0088;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Haversine great-circle distance in kilometers (§12 Tier 3 assessment).
 * Used to measure distance d from coordinate C to a modeled utility centroid.
 */
export function haversineKm(a: Coordinate, b: Coordinate): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Ray-casting point-in-ring test. `ring` vertices are [lon, lat] (GeoJSON order).
 * Returns true when the point falls inside the ring (boundary treated as inside).
 */
function pointInRing(point: Coordinate, ring: Ring): boolean {
  const x = point.lon;
  const y = point.lat;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    // Point exactly on a vertex counts as inside.
    if (xi === x && yi === y) return true;

    const intersects =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

/**
 * Point-in-polygon supporting holes. The first ring is the outer boundary;
 * subsequent rings are holes. A point inside the outer ring but inside any hole
 * is considered outside the polygon.
 */
export function pointInPolygon(point: Coordinate, polygon: Polygon): boolean {
  if (polygon.rings.length === 0) return false;

  const [outer, ...holes] = polygon.rings;
  if (!pointInRing(point, outer)) return false;

  for (const hole of holes) {
    if (pointInRing(point, hole)) return false;
  }

  return true;
}

/**
 * Axis-aligned bounding box of a polygon: [minLon, minLat, maxLon, maxLat].
 * Cheap pre-filter so we only run the O(n) ray cast on plausible candidates.
 */
export function boundingBox(polygon: Polygon): [number, number, number, number] {
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;

  for (const ring of polygon.rings) {
    for (const [lon, lat] of ring) {
      if (lon < minLon) minLon = lon;
      if (lat < minLat) minLat = lat;
      if (lon > maxLon) maxLon = lon;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return [minLon, minLat, maxLon, maxLat];
}

export function inBoundingBox(
  point: Coordinate,
  bbox: [number, number, number, number]
): boolean {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return (
    point.lon >= minLon &&
    point.lon <= maxLon &&
    point.lat >= minLat &&
    point.lat <= maxLat
  );
}

/** Parse a stored GeoJSON-ish geometry string into a Polygon. Tolerant of nulls. */
export function parsePolygon(geojson: string | null): Polygon | null {
  if (!geojson) return null;
  try {
    const g = JSON.parse(geojson);
    // Accept either {rings:[...]} or raw GeoJSON Polygon {type,coordinates}.
    if (Array.isArray(g?.rings)) return { rings: g.rings as Ring[] };
    if (g?.type === "Polygon" && Array.isArray(g.coordinates)) {
      return { rings: g.coordinates as Ring[] };
    }
    if (g?.type === "MultiPolygon" && Array.isArray(g.coordinates)) {
      // Flatten: treat every outer ring as a candidate; holes preserved per part.
      const rings: Ring[] = [];
      for (const part of g.coordinates as Ring[][]) {
        for (const ring of part) rings.push(ring);
      }
      return { rings };
    }
    return null;
  } catch {
    return null;
  }
}
