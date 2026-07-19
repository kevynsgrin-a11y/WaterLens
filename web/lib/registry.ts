// -----------------------------------------------------------------------------
// Registry derivation helpers (owned by the entity-pages workstream).
// Turns the flat FILTER_CLAIMS table into per-filter certification summaries for
// the Filter Certification Registry and the contaminant entity pages.
// -----------------------------------------------------------------------------

import { FILTERS, FILTER_CLAIMS, FILTER_BY_ID } from "./data";
import {
  HEALTH_STANDARDS,
  NON_HEALTH_STANDARDS,
  OBSOLETE_STANDARDS,
} from "./constants";
import type { Filter, NsfStandard } from "./types";

const HEALTH = new Set<string>(HEALTH_STANDARDS);
const NON_HEALTH = new Set<string>(NON_HEALTH_STANDARDS);
const OBSOLETE = new Set<string>(OBSOLETE_STANDARDS);

// Canonical display order for standards on a badge row.
const STANDARD_ORDER: NsfStandard[] = ["42", "53", "58", "401", "372", "P473"];

export interface RegistryEntry {
  filter: Filter;
  /** Distinct verified standards this filter holds, in canonical order. */
  standards: NsfStandard[];
  /** Distinct contaminant codes reduced under a health standard (53/58/401). */
  healthContaminants: string[];
  /** Number of distinct verified health-standard claims. */
  healthClaimCount: number;
  /** Certifying bodies referenced across this filter's claims (e.g. NSF, WQA). */
  certifiers: string[];
  /** Holds at least one health standard (53/58/401). */
  healthCertified: boolean;
  /** Holds ONLY non-health standards (42/372) and no health standard. */
  deceptiveMarketingRisk: boolean;
}

/** Build the certification summary for a single filter id. */
export function registryEntry(filterId: number): RegistryEntry | null {
  const filter = FILTER_BY_ID.get(filterId);
  if (!filter) return null;

  const claims = FILTER_CLAIMS.filter((c) => c.filter_id === filterId && c.verified);

  const standardSet = new Set<NsfStandard>();
  const healthContaminantSet = new Set<string>();
  const certifierSet = new Set<string>();
  let healthClaimCount = 0;

  for (const claim of claims) {
    standardSet.add(claim.standard);
    certifierSet.add(claim.certifier);
    if (HEALTH.has(claim.standard)) {
      healthContaminantSet.add(claim.contaminant_code);
      healthClaimCount += 1;
    }
  }

  const standards = STANDARD_ORDER.filter((s) => standardSet.has(s));
  const healthCertified = standards.some((s) => HEALTH.has(s));
  const holdsAnyStandard = standards.length > 0;
  const holdsOnlyNonHealth =
    holdsAnyStandard && standards.every((s) => NON_HEALTH.has(s));

  return {
    filter,
    standards,
    healthContaminants: [...healthContaminantSet],
    healthClaimCount,
    certifiers: [...certifierSet].sort(),
    healthCertified,
    deceptiveMarketingRisk: holdsOnlyNonHealth && !healthCertified,
  };
}

/** Build registry entries for every filter, health-certified first. */
export function buildRegistry(): RegistryEntry[] {
  return FILTERS.map((f) => registryEntry(f.id))
    .filter((e): e is RegistryEntry => e !== null)
    .sort((a, b) => {
      // Health-certified rows lead; then by breadth of health coverage; then brand.
      if (a.healthCertified !== b.healthCertified) return a.healthCertified ? -1 : 1;
      if (b.healthContaminants.length !== a.healthContaminants.length) {
        return b.healthContaminants.length - a.healthContaminants.length;
      }
      return a.filter.brand.localeCompare(b.filter.brand);
    });
}

/** Tone for a standard badge: health standards read verdant, material/aesthetic ink. */
export function standardTone(s: NsfStandard): "verdant" | "ink" | "caution" {
  if (OBSOLETE.has(s)) return "caution";
  if (HEALTH.has(s)) return "verdant";
  return "ink";
}
