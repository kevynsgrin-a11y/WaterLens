import { MatchTier } from "./constants";
import { Detection, FormFactor, NsfStandard } from "./types";

/** Pretty-print a numeric measurement without trailing float noise. */
export function formatValue(value: number, unit: string): string {
  const n =
    value >= 100 ? value.toFixed(0) : value >= 1 ? value.toFixed(2).replace(/\.?0+$/, "") : value.toPrecision(2);
  return `${n} ${unit}`;
}

export function formatUnit(unit: string): string {
  return unit.replace("ug/L", "µg/L");
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00Z" : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function tierTone(tier: MatchTier): "verdant" | "brand" | "caution" | "ink" {
  switch (tier) {
    case MatchTier.EXPLICIT:
      return "verdant";
    case MatchTier.MATCHED:
      return "brand";
    case MatchTier.MODELED:
      return "caution";
    default:
      return "ink";
  }
}

export const FORM_FACTOR_LABEL: Record<FormFactor, string> = {
  PITCHER: "Pitcher",
  FAUCET: "Faucet mount",
  COUNTERTOP_RO: "Countertop RO",
  UNDERSINK_RO: "Under-sink RO",
  WHOLE_HOUSE: "Whole-house",
  REFRIGERATOR: "Refrigerator",
};

export function standardLabel(s: NsfStandard): string {
  return `NSF/ANSI ${s}`;
}

export function usd(v: number | null): string {
  if (v == null) return "—";
  return v % 1 === 0 ? `$${v.toFixed(0)}` : `$${v.toFixed(2)}`;
}

export function slugPwsid(pwsid: string): string {
  return pwsid.toUpperCase();
}

// -----------------------------------------------------------------------------
// Severity presentation. Escalation is carried by WEIGHT and INVERSION, never by
// hue — DESIGN.md reserves amber for mapping ambiguity and forbids alarm reds.
// Both /results and /pws must call this so the same fact never renders two ways.
// -----------------------------------------------------------------------------

export type SeverityLevel = "within" | "goal" | "mcl";

export function severityLevel(d: Detection): SeverityLevel {
  if (d.exceeds_mcl) return "mcl";
  if (d.exceeds_health_goal) return "goal";
  return "within";
}

export function severityLabel(d: Detection): string {
  switch (severityLevel(d)) {
    case "mcl":
      return "Above federal limit";
    case "goal":
      return "Above health guideline";
    default:
      return "Within limits";
  }
}

/** Chip classes for a detection's severity. */
export function severityChipClass(d: Detection): string {
  switch (severityLevel(d)) {
    case "mcl":
      return "border-transparent bg-brand-800 text-white dark:bg-brand-300 dark:text-brand-950";
    case "goal":
      return "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-300/30 dark:bg-brand-300/10 dark:text-brand-200";
    default:
      return "border-verdant-200 bg-verdant-50 text-verdant-700 dark:border-verdant-300/30 dark:bg-verdant-300/10 dark:text-verdant-200";
  }
}

/** "1.8×" — how far past the federal limit a detection sits. */
export function formatRatio(ratio: number | null): string | null {
  if (ratio == null || !Number.isFinite(ratio)) return null;
  return `${ratio >= 10 ? ratio.toFixed(0) : ratio.toFixed(ratio >= 1 ? 1 : 2)}×`;
}

/** Whole days elapsed since an ISO date, or null when unparseable. */
export function daysSince(iso: string | null, now: Date): number | null {
  if (!iso) return null;
  const t = Date.parse(iso.length <= 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(t)) return null;
  const days = Math.floor((now.getTime() - t) / 86_400_000);
  return days >= 0 ? days : null;
}
