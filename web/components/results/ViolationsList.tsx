import { Badge } from "@/components/ui";
import { CONTAMINANT_BY_CODE, contaminantName } from "@/lib/data";
import { formatDate } from "@/lib/format";
import type { Violation } from "@/lib/types";

/**
 * An open federal violation is the most consequential fact on the page, so an
 * unaddressed one gets the inverted solid chip — outranking a certification
 * badge on weight, not on hue.
 */
function statusChipClass(status: string | null): string {
  const s = (status ?? "").toLowerCase();
  if (s.includes("unaddressed") || s.includes("open")) {
    return "border-transparent bg-brand-800 text-white dark:bg-brand-300 dark:text-brand-950";
  }
  if (s.includes("resolved") || s.includes("returned") || s.includes("addressed")) {
    return "bg-verdant-50 text-verdant-700 border-verdant-200 dark:bg-verdant-300/10 dark:text-verdant-200 dark:border-verdant-300/25";
  }
  return "bg-ink-100 text-ink-700 border-ink-200 dark:bg-white/10 dark:text-ink-200 dark:border-white/15";
}

export function ViolationsList({ violations }: { violations: Violation[] }) {
  const healthBased = violations.filter((v) => v.is_health_based);
  if (healthBased.length === 0) return null;

  return (
    <section aria-labelledby="violations-heading" id="violations" className="scroll-mt-32">
      <h2 id="violations-heading" className="text-title-1">
        Active health-based violations
      </h2>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-600 dark:text-ink-300">
        Formal violations of a federal health standard currently on record for this system, as
        reported to the EPA Safe Drinking Water Information System.
      </p>

      <ul className="mt-6 divide-y divide-hairline overflow-hidden rounded-2xl bg-surface-raised shadow-card ring-1 ring-ink-900/[0.055] dark:ring-white/10">
        {healthBased.map((v) => {
          const name = v.contaminant_code
            ? contaminantName(v.contaminant_code)
            : "Unspecified contaminant";
          // Link back to the matching contaminant card when one is on the page.
          const anchor =
            v.contaminant_code && CONTAMINANT_BY_CODE.has(v.contaminant_code)
              ? `#contaminant-${v.contaminant_code}`
              : null;

          return (
            <li
              key={v.violation_id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4 sm:px-6"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {anchor ? (
                    <a
                      href={anchor}
                      className="text-sm font-semibold text-brand-700 underline-offset-2 hover:underline dark:text-brand-200"
                    >
                      {name}
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-ink-900 dark:text-white">
                      {name}
                    </span>
                  )}
                  {v.violation_category ? <Badge tone="ink">{v.violation_category}</Badge> : null}
                </div>
                <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                  Began {formatDate(v.begin_date)}
                  {v.violation_id ? ` · Ref ${v.violation_id}` : ""}
                </p>
              </div>
              {v.status ? (
                <Badge className={statusChipClass(v.status)}>{v.status}</Badge>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
