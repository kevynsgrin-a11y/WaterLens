import { describe, expect, it } from "vitest";
import {
  buildEfUrl,
  isViolationActive,
  parseEnvirofactsDate,
} from "../src/lib/envirofacts";
import { extractZip } from "../src/services/lookup";

describe("buildEfUrl", () => {
  it("assembles a rows-paginated Envirofacts URL", () => {
    const url = buildEfUrl(
      "https://data.epa.gov/efservice",
      "SDWA_VIOLATIONS_ENFORCEMENT",
      "PWSID",
      "MI0002360",
      "rows",
      "0:100"
    );
    expect(url).toBe(
      "https://data.epa.gov/efservice/SDWA_VIOLATIONS_ENFORCEMENT/PWSID/MI0002360/rows/0:100/JSON"
    );
  });

  it("strips a trailing slash on the base", () => {
    expect(buildEfUrl("https://x/", "T", "JSON").startsWith("https://x/T")).toBe(true);
  });
});

describe("parseEnvirofactsDate", () => {
  it("normalizes MM/DD/YYYY with a time component", () => {
    expect(parseEnvirofactsDate("05/15/2026 00:00:00")).toBe("2026-05-15");
  });

  it("zero-pads single-digit months/days", () => {
    expect(parseEnvirofactsDate("3/7/2025")).toBe("2025-03-07");
  });

  it("passes through ISO dates", () => {
    expect(parseEnvirofactsDate("2026-06-01 12:00:00")).toBe("2026-06-01");
  });

  it("returns null for empty/garbage", () => {
    expect(parseEnvirofactsDate(null)).toBeNull();
    expect(parseEnvirofactsDate("   ")).toBeNull();
    expect(parseEnvirofactsDate("13/40")).toBeNull();
  });
});

describe("isViolationActive", () => {
  it("treats returned-to-compliance as resolved", () => {
    expect(isViolationActive({ COMPLIANCE_STATUS_CODE: "R" })).toBe(false);
  });

  it("treats withdrawn as resolved", () => {
    expect(isViolationActive({ COMPLIANCE_STATUS_CODE: "W" })).toBe(false);
  });

  it("treats a populated RTC_DATE as resolved", () => {
    expect(isViolationActive({ RTC_DATE: "01/01/2025" })).toBe(false);
  });

  it("treats an open violation as active", () => {
    expect(isViolationActive({ COMPLIANCE_STATUS_CODE: "O", RTC_DATE: "" })).toBe(true);
    expect(isViolationActive({})).toBe(true);
  });
});

describe("extractZip", () => {
  it("pulls a 5-digit ZIP from a full address", () => {
    expect(extractZip("1600 Saginaw St, Flint, MI 48503")).toBe("48503");
  });

  it("handles ZIP+4", () => {
    expect(extractZip("123 Main St, Newark, NJ 07105-1234")).toBe("07105");
  });

  it("returns null when no ZIP present", () => {
    expect(extractZip("Main St, Newark, NJ")).toBeNull();
  });
});
