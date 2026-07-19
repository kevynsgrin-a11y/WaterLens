import { describe, expect, it } from "vitest";
import {
  boundingBox,
  haversineKm,
  inBoundingBox,
  parsePolygon,
  pointInPolygon,
} from "../src/lib/geo";
import { Polygon } from "../src/types";

// A unit square around Flint, MI (matches seeds/demo.sql).
const flint: Polygon = {
  rings: [
    [
      [-83.78, 42.95],
      [-83.6, 42.95],
      [-83.6, 43.08],
      [-83.78, 43.08],
      [-83.78, 42.95],
    ],
  ],
};

describe("haversineKm", () => {
  it("returns ~0 for identical points", () => {
    expect(haversineKm({ lat: 43, lon: -83 }, { lat: 43, lon: -83 })).toBeCloseTo(0, 5);
  });

  it("computes a known distance (NYC -> LA ~3936 km)", () => {
    const d = haversineKm(
      { lat: 40.7128, lon: -74.006 },
      { lat: 34.0522, lon: -118.2437 }
    );
    expect(d).toBeGreaterThan(3900);
    expect(d).toBeLessThan(3970);
  });

  it("is symmetric", () => {
    const a = { lat: 43.0125, lon: -83.6875 };
    const b = { lat: 40.7357, lon: -74.1724 };
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 9);
  });
});

describe("pointInPolygon", () => {
  it("detects a point inside the polygon (Flint centroid)", () => {
    expect(pointInPolygon({ lat: 43.0125, lon: -83.6875 }, flint)).toBe(true);
  });

  it("rejects a point outside the polygon", () => {
    expect(pointInPolygon({ lat: 40.0, lon: -74.0 }, flint)).toBe(false);
  });

  it("treats vertices as inside", () => {
    expect(pointInPolygon({ lat: 42.95, lon: -83.78 }, flint)).toBe(true);
  });

  it("respects holes (donut polygon)", () => {
    const donut: Polygon = {
      rings: [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
        [
          [4, 4],
          [6, 4],
          [6, 6],
          [4, 6],
          [4, 4],
        ],
      ],
    };
    expect(pointInPolygon({ lat: 1, lon: 1 }, donut)).toBe(true); // in outer, outside hole
    expect(pointInPolygon({ lat: 5, lon: 5 }, donut)).toBe(false); // inside hole
  });
});

describe("boundingBox / inBoundingBox", () => {
  it("computes the correct bbox", () => {
    expect(boundingBox(flint)).toEqual([-83.78, 42.95, -83.6, 43.08]);
  });

  it("bbox pre-filter matches interior points and rejects far ones", () => {
    const bbox = boundingBox(flint);
    expect(inBoundingBox({ lat: 43.0, lon: -83.7 }, bbox)).toBe(true);
    expect(inBoundingBox({ lat: 10, lon: 10 }, bbox)).toBe(false);
  });
});

describe("parsePolygon", () => {
  it("parses a GeoJSON Polygon string", () => {
    const p = parsePolygon(
      '{"type":"Polygon","coordinates":[[[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]]]}'
    );
    expect(p).not.toBeNull();
    expect(pointInPolygon({ lat: 0, lon: 0 }, p!)).toBe(true);
  });

  it("parses the {rings:[...]} shape", () => {
    const p = parsePolygon('{"rings":[[[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]]]}');
    expect(p).not.toBeNull();
  });

  it("returns null for garbage / null input", () => {
    expect(parsePolygon(null)).toBeNull();
    expect(parsePolygon("not json")).toBeNull();
  });
});
