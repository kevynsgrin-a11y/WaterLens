import { describe, expect, it } from "vitest";
import { gazetteerLookup } from "../web/lib/gazetteer";
import { pointInPolygon } from "../web/lib/geo";
import { DEMO_BY_PWSID } from "../web/lib/data";

// The Census geocoder is a no-SLA government endpoint. When it is unreachable,
// this offline table is the only thing keeping the landing page's own advertised
// example addresses from dead-ending on "we couldn't confirm your water system".
// These tests pin that guarantee.

describe("offline gazetteer fallback", () => {
  const CASES: Array<[string, string]> = [
    ["1600 S Saginaw St, Flint, MI 48503", "MI0002360"],
    ["920 Broad St, Newark, NJ 07102", "NJ0714001"],
    ["301 W 2nd St, Austin, TX 78701", "TX0610001"],
  ];

  it.each(CASES)("resolves %s inside the demo service boundary", (address, pwsid) => {
    const hit = gazetteerLookup(address);
    expect(hit).not.toBeNull();

    const boundary = DEMO_BY_PWSID.get(pwsid)!.boundary;
    expect(pointInPolygon(hit!.coordinate, boundary)).toBe(true);
  });

  it("marks locality-centroid matches as approximate", () => {
    const hit = gazetteerLookup("1600 S Saginaw St, Flint, MI 48503");
    expect(hit?.approximate).toBe(true);
    expect(hit?.matched_address).toContain("approximate");
  });

  it("resolves a bare ZIP inside demo coverage", () => {
    expect(gazetteerLookup("48503")?.place_name).toBe("Flint");
  });

  it("returns null outside demo coverage rather than guessing", () => {
    expect(gazetteerLookup("1 Infinite Loop, Cupertino, CA 95014")).toBeNull();
    expect(gazetteerLookup("99999")).toBeNull();
  });

  it("does not match a city name that appears without its state", () => {
    // "Newark Street" in another state must not resolve to Newark, NJ.
    expect(gazetteerLookup("400 Newark Street, Dallas, TX")).toBeNull();
  });
});
