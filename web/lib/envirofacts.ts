import { Violation, WaterSystem } from "./types";

// -----------------------------------------------------------------------------
// Best-effort live EPA Envirofacts fallback for addresses outside the bundled
// demo boundaries. Gives real system identity + health-violation presence
// nationwide. Wrapped in timeouts; any failure degrades gracefully to null.
// -----------------------------------------------------------------------------

const BASE = "https://data.epa.gov/efservice";
const TIMEOUT = 7000;

async function ef<T>(url: string): Promise<T[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: "application/json",
        "user-agent": "WaterQualityLens/1.0 (+https://waterqualitylens.com)",
      },
      next: { revalidate: 86400 },
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as T[]) : [];
  } catch {
    return [];
  }
}

export async function fetchPwsidsForZip(zip: string): Promise<string[]> {
  const rows = await ef<{ PWSID: string }>(
    `${BASE}/SDWA_GEOGRAPHIC_AREAS/GEO_TYPE/ZP/GEO_ID/${encodeURIComponent(zip)}/rows/0:50/JSON`
  );
  return [...new Set(rows.map((r) => r.PWSID).filter(Boolean))];
}

export async function fetchSystem(pwsid: string): Promise<WaterSystem | null> {
  const rows = await ef<{
    PWSID: string; PWS_NAME?: string; STATE_CODE?: string; COUNTY_SERVED?: string;
    POPULATION_SERVED_COUNT?: string; PWS_TYPE_CODE?: string; PRIMARY_SOURCE_CODE?: string;
  }>(`${BASE}/SDWA_PUB_WATER_SYSTEMS/PWSID/${encodeURIComponent(pwsid)}/JSON`);
  const r = rows[0];
  if (!r) return null;
  return {
    pwsid: r.PWSID,
    name: r.PWS_NAME ?? pwsid,
    state: r.STATE_CODE ?? null,
    county: r.COUNTY_SERVED ?? null,
    population_served: r.POPULATION_SERVED_COUNT ? Number(r.POPULATION_SERVED_COUNT) : null,
    pws_type: r.PWS_TYPE_CODE ?? null,
    primary_source: r.PRIMARY_SOURCE_CODE ?? null,
  };
}

function parseDate(s?: string | null): string | null {
  if (!s) return null;
  const t = s.trim();
  if (!t) return null;
  if (t.includes("/")) {
    const [d] = t.split(" ");
    const [m, dd, y] = d.split("/");
    if (m && dd && y) return `${y}-${m.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return t.split(" ")[0] ?? null;
}

export async function fetchHealthViolations(pwsid: string): Promise<Violation[]> {
  const rows = await ef<{
    PWSID: string; VIOLATION_ID?: string; CONTAMINANT_CODE?: string; VIOLATION_CODE?: string;
    VIOLATION_CATEGORY_CODE?: string; NON_COMPL_PER_BEGIN_DATE?: string;
    COMPLIANCE_STATUS_CODE?: string; RTC_DATE?: string;
  }>(
    `${BASE}/SDWA_VIOLATIONS_ENFORCEMENT/PWSID/${encodeURIComponent(pwsid)}/IS_HEALTH_BASED_IND/Y/rows/0:50/JSON`
  );
  return rows
    .map((r) => {
      const status = (r.COMPLIANCE_STATUS_CODE ?? "").toUpperCase();
      const resolved = status === "R" || status === "W" || Boolean(r.RTC_DATE?.trim());
      return {
        pwsid: r.PWSID,
        violation_id: r.VIOLATION_ID ?? "",
        contaminant_code: r.CONTAMINANT_CODE ?? null,
        violation_code: r.VIOLATION_CODE ?? null,
        violation_category: r.VIOLATION_CATEGORY_CODE ?? null,
        is_health_based: true,
        begin_date: parseDate(r.NON_COMPL_PER_BEGIN_DATE),
        status: resolved ? "Resolved" : "Unaddressed",
      } as Violation;
    })
    .filter((v) => v.status !== "Resolved");
}
