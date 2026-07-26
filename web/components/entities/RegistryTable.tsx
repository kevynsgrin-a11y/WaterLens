import Link from "next/link";
import { Badge, Pill } from "@/components/ui";
import { CERTIFICATIONS, contaminantName } from "@/lib/data";
import { FORM_FACTOR_LABEL, standardLabel, usd } from "@/lib/format";
import type { RegistryEntry } from "@/lib/registry";
import type { NsfStandard } from "@/lib/types";

// -----------------------------------------------------------------------------
// RegistryTable — presentational table for the Filter Certification Registry.
// Derivation lives in lib/registry.ts; this component only renders.
//
// Certification scope must never be carried by hue alone (DESIGN.md), so every
// standard badge prints its scope word — "Health", "Materials", "Retired" —
// alongside the standard number. The legend on /registry mirrors this wording.
// -----------------------------------------------------------------------------

/** The one caption string, reused as the scroll region's accessible name. */
export const REGISTRY_CAPTION =
  "Filter Certification Registry: brand, model, SKU, form factor, verified NSF/ANSI standards, price, and health-reduction assessment for every catalogued filter.";

export type StandardKind = "Health" | "Materials" | "Retired";

/** The scope word printed inside every standard badge. */
export function standardKind(s: NsfStandard): StandardKind {
  const info = CERTIFICATIONS[s];
  if (info.is_obsolete) return "Retired";
  return info.is_health ? "Health" : "Materials";
}

/**
 * Badge tone for a standard. Health standards read verdant; everything else is
 * neutral ink — amber is reserved for mapping ambiguity, not for a withdrawn
 * standard. The scope word, not the hue, carries the meaning.
 */
export function standardBadgeTone(s: NsfStandard): "verdant" | "ink" {
  return CERTIFICATIONS[s].is_health ? "verdant" : "ink";
}

/** "NSF/ANSI 53 · Health" — number plus non-colour scope qualifier. */
export function StandardBadge({ standard }: { standard: NsfStandard }) {
  return (
    <Badge tone={standardBadgeTone(standard)}>
      <span className="font-mono">{standardLabel(standard)}</span>
      <span aria-hidden="true" className="opacity-40">
        ·
      </span>
      <span className="font-normal">{standardKind(standard)}</span>
    </Badge>
  );
}

function StandardBadges({ entry }: { entry: RegistryEntry }) {
  if (entry.standards.length === 0) {
    return (
      <span className="text-sm text-ink-500 dark:text-ink-400">
        No certifications on file
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {entry.standards.map((s) => (
        <StandardBadge key={s} standard={s} />
      ))}
    </div>
  );
}

/** The named contaminants a filter is health-certified to reduce, cross-linked. */
function HealthContaminants({ codes }: { codes: string[] }) {
  const named = codes
    .map((code) => ({ code, name: contaminantName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const shown = named.slice(0, 3);
  const rest = named.length - shown.length;

  return (
    <p className="mt-1.5 text-xs leading-relaxed text-ink-600 dark:text-ink-300">
      {shown.map((c, i) => (
        <span key={c.code}>
          {i > 0 ? <span aria-hidden="true">, </span> : null}
          <Link
            href={`/contaminants/${c.code}`}
            className="underline decoration-ink-300 underline-offset-2 transition-colors hover:text-brand-700 hover:decoration-brand-400 dark:decoration-ink-500 dark:hover:text-brand-200"
          >
            {c.name}
          </Link>
        </span>
      ))}
      {rest > 0 ? (
        <span className="text-ink-500 dark:text-ink-400"> +{rest} more</span>
      ) : null}
    </p>
  );
}

function Assessment({ entry }: { entry: RegistryEntry }) {
  if (entry.deceptiveMarketingRisk) {
    return (
      <span className="inline-flex items-start gap-2 text-sm font-medium text-ink-700 dark:text-ink-200">
        {/* Hollow ring, not a filled dot — shape differs as well as colour. */}
        <span
          aria-hidden="true"
          className="mt-1.5 inline-block h-2 w-2 flex-none rounded-full ring-1 ring-ink-500 dark:ring-ink-400"
        />
        <span>Materials-only — no verified health reduction</span>
      </span>
    );
  }
  if (entry.healthCertified) {
    const n = entry.healthContaminants.length;
    return (
      <div>
        <span className="inline-flex items-start gap-2 text-sm text-ink-700 dark:text-ink-200">
          <span
            aria-hidden="true"
            className="mt-1.5 inline-block h-2 w-2 flex-none rounded-full bg-verdant-500 dark:bg-verdant-300"
          />
          <span>
            Health-certified for{" "}
            <span className="font-semibold text-verdant-700 dark:text-verdant-200">
              {n}
            </span>{" "}
            contaminant{n === 1 ? "" : "s"}
          </span>
        </span>
        <HealthContaminants codes={entry.healthContaminants} />
      </div>
    );
  }
  return (
    <span className="text-sm text-ink-600 dark:text-ink-300">
      Aesthetic reduction only
    </span>
  );
}

const TH =
  "px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-ink-300";

export function RegistryTable({ entries }: { entries: RegistryEntry[] }) {
  return (
    <div
      // A horizontally scrolling container with no focusable descendants is
      // unreachable by keyboard unless it is itself a tab stop (WCAG 2.1.1).
      tabIndex={0}
      role="region"
      aria-label={REGISTRY_CAPTION}
      className="overflow-x-auto rounded-2xl border border-hairline shadow-card outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400"
    >
      <table className="w-full min-w-[60rem] border-collapse bg-surface-raised text-left">
        <caption className="sr-only">{REGISTRY_CAPTION}</caption>
        <thead>
          <tr className="border-b border-hairline bg-surface-sunken">
            <th scope="col" className={TH}>
              Filter
            </th>
            <th scope="col" className={TH}>
              SKU
            </th>
            <th scope="col" className={TH}>
              Form factor
            </th>
            <th scope="col" className={TH}>
              Verified standards
            </th>
            <th scope="col" className={`${TH} text-right`}>
              Price
            </th>
            <th scope="col" className={TH}>
              Assessment
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const { filter } = entry;
            return (
              <tr
                key={filter.id}
                className="border-b border-hairline align-top transition-colors last:border-0 hover:bg-ink-50/60 dark:hover:bg-white/[0.04]"
              >
                <th scope="row" className="px-5 py-4 font-normal">
                  <div className="font-semibold text-ink-900 dark:text-white">
                    {filter.brand}
                  </div>
                  <div className="text-sm text-ink-600 dark:text-ink-300">
                    {filter.model}
                  </div>
                  {entry.certifiers.length > 0 ? (
                    <div className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                      Certified by {entry.certifiers.join(", ")}
                    </div>
                  ) : null}
                </th>
                <td className="px-5 py-4">
                  <Pill tone="ink">{filter.sku}</Pill>
                </td>
                <td className="px-5 py-4 text-sm text-ink-700 dark:text-ink-200">
                  {FORM_FACTOR_LABEL[filter.form_factor]}
                </td>
                <td className="px-5 py-4">
                  <StandardBadges entry={entry} />
                </td>
                <td className="px-5 py-4 text-right font-mono text-sm text-ink-800 dark:text-ink-100">
                  {usd(filter.price_usd)}
                </td>
                <td className="px-5 py-4">
                  <Assessment entry={entry} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
