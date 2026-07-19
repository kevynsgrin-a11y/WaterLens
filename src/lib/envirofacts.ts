// -----------------------------------------------------------------------------
// Low-level EPA Envirofacts client. Envirofacts is a federal public-domain REST
// service that returns SDWA_* tables as JSON. This module centralizes URL
// building, timeout/retry, and the two robustness details the naive client
// misses: (1) Envirofacts wraps errors in a NON-array object, and (2) its dates
// arrive as MM/DD/YYYY (or YYYY-MM-DD) with a time component.
// -----------------------------------------------------------------------------

const REQUEST_TIMEOUT_MS = 8_000;
const USER_AGENT =
  "WaterQualityLens/1.0 (data.epa.gov lookup; contact: api@waterqualitylens.com)";

/**
 * Build an Envirofacts REST URL:
 *   {base}/{TABLE}/{COL}/{VAL}/.../rows/0:100/JSON
 */
export function buildEfUrl(base: string, ...segments: string[]): string {
  return [base.replace(/\/$/, ""), ...segments, "JSON"].join("/");
}

/**
 * Fetch an Envirofacts table as an array of rows. Returns [] on any failure
 * (timeout, non-2xx, or a non-array error payload) so callers never crash on
 * EPA-side hiccups — the ingestion job logs and moves on (§18 resilience).
 */
export async function fetchEfRows<T>(url: string): Promise<T[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json", "user-agent": USER_AGENT },
    });
    if (!res.ok) return [];
    const data = await res.json();
    // Envirofacts returns an error OBJECT (not an array) on bad queries.
    if (!Array.isArray(data)) return [];
    return data as T[];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Normalize an Envirofacts date string to ISO `YYYY-MM-DD`.
 * Handles `MM/DD/YYYY [HH:MM:SS]` and `YYYY-MM-DD [HH:MM:SS]`.
 */
export function parseEnvirofactsDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (trimmed === "") return null;

  if (trimmed.includes("/")) {
    const datePart = trimmed.split(" ")[0];
    const parts = datePart.split("/");
    if (parts.length !== 3) return null;
    const [month, day, year] = parts;
    if (!month || !day || !year) return null;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return trimmed.split(" ")[0] ?? null;
}

/**
 * A violation is still active (unresolved) unless it has returned to compliance
 * ('R'), been withdrawn ('W'), or has a populated return-to-compliance date.
 */
export function isViolationActive(v: {
  COMPLIANCE_STATUS_CODE?: string | null;
  RTC_DATE?: string | null;
}): boolean {
  const status = (v.COMPLIANCE_STATUS_CODE ?? "").toUpperCase();
  if (status === "R" || status === "W") return false;
  if (v.RTC_DATE && v.RTC_DATE.trim() !== "") return false;
  return true;
}
