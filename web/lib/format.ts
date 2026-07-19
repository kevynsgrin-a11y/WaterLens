import { MatchTier } from "./constants";
import { FormFactor, NsfStandard } from "./types";

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
