import { describe, expect, it } from "vitest";
import { isFullCover, neutralizationSet } from "../src/services/setcover";
import { NsfStandard } from "../src/types";

type Claim = { filter_id: number; standard: NsfStandard; contaminant_code: string };

describe("neutralizationSet — certification isolation", () => {
  it("includes contaminants only from health standards (53/58/401)", () => {
    const claims: Claim[] = [
      { filter_id: 1, standard: "53", contaminant_code: "PB90" },
      { filter_id: 1, standard: "58", contaminant_code: "PFOA" },
      { filter_id: 1, standard: "401", contaminant_code: "2984" },
    ];
    const { codes, standards } = neutralizationSet(claims);
    expect([...codes].sort()).toEqual(["2984", "PB90", "PFOA"]);
    expect([...standards].sort()).toEqual(["401", "53", "58"]);
  });

  it("isolates NSF 42 (aesthetic) — never credited with a health contaminant", () => {
    const claims: Claim[] = [
      { filter_id: 5, standard: "42", contaminant_code: "2950" },
      { filter_id: 5, standard: "42", contaminant_code: "PB90" }, // even if mislabeled
    ];
    const { codes } = neutralizationSet(claims);
    expect(codes.size).toBe(0);
  });

  it("isolates NSF 372 (lead-free materials) — the Pureline deception case", () => {
    const claims: Claim[] = [
      { filter_id: 7, standard: "42", contaminant_code: "2950" },
      { filter_id: 7, standard: "372", contaminant_code: "PB90" },
    ];
    const { codes } = neutralizationSet(claims);
    expect(codes.has("PB90")).toBe(false);
  });

  it("ignores retired P473", () => {
    const claims: Claim[] = [
      { filter_id: 9, standard: "P473", contaminant_code: "PFOA" },
    ];
    const { codes } = neutralizationSet(claims);
    expect(codes.size).toBe(0);
  });
});

describe("isFullCover — D ⊆ ⋃ N_c", () => {
  it("true when the filter covers the entire hazard set", () => {
    const hazards = new Set(["PB90", "PFOA"]);
    const neutralized = new Set(["PB90", "PFOA", "CR6"]);
    expect(isFullCover(hazards, neutralized)).toBe(true);
  });

  it("false when a single hazard is uncovered (partial SKU eliminated)", () => {
    const hazards = new Set(["PB90", "CR6"]);
    const neutralized = new Set(["PB90"]); // Brita Elite: lead yes, chromium-6 no
    expect(isFullCover(hazards, neutralized)).toBe(false);
  });

  it("empty hazard set is trivially covered", () => {
    expect(isFullCover(new Set(), new Set())).toBe(true);
  });
});
