import { Coordinate, Polygon, Ring } from "./types";

const EARTH_RADIUS_KM = 6371.0088;
const rad = (d: number) => (d * Math.PI) / 180;

export function haversineKm(a: Coordinate, b: Coordinate): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function pointInRing(p: Coordinate, ring: Ring): boolean {
  const x = p.lon;
  const y = p.lat;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (xi === x && yi === y) return true;
    const intersects =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function pointInPolygon(p: Coordinate, poly: Polygon): boolean {
  if (!poly.rings.length) return false;
  const [outer, ...holes] = poly.rings;
  if (!pointInRing(p, outer)) return false;
  return !holes.some((h) => pointInRing(p, h));
}

export function boundingBox(poly: Polygon): [number, number, number, number] {
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  for (const ring of poly.rings) {
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
  p: Coordinate,
  [minLon, minLat, maxLon, maxLat]: [number, number, number, number]
): boolean {
  return p.lon >= minLon && p.lon <= maxLon && p.lat >= minLat && p.lat <= maxLat;
}
