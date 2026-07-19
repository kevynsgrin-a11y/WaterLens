import { Badge } from "@/components/ui";
import { contaminantName } from "@/lib/data";
import { formatDate } from "@/lib/format";
import type { Violation } from "@/lib/types";

function statusTone(status: string | null): "verdant" | "brand" | "ink" {
  const s = (status ?? "").toLowerCase();
  if (s.includes("unaddressed") || s.includes("open")) return "brand";
  if (s.includes("resolved") || s.includes("returned") || s.includes("addressed")) {
    return "verdant";
  }
  return "ink";
}

export function ViolationsList({ violations }: { violations: Violation[] }) {
  const healthBased = violations.filter((v) => v.is_health_based);
  if (healthBased.length === 0) return null;

  return (
    <section aria-labelledby="violations-heading">
      <h2 id="violations-heading" className="text-2xl font-semibold text-ink-900 sm:text-3xl">
        Active health-based violations
      </h2>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-600">
        Formal violations of a federal health standard currently on record for this system, as
        reported to the EPA Safe Drinking Water Information System.
      </p>

      <ul className="mt-6 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        {healthBased.map((v) => {
          const name = v.contaminant_code ? contaminantName(v.contaminant_code) : "Unspecified contaminant";
          return (
            <li
              key={v.violation_id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4 sm:px-6"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-sm font-semibold text-ink-900">{name}</span>
                  {v.violation_category ? <Badge tone="ink">{v.violation_category}</Badge> : null}
                </div>
                <p className="mt-1 text-xs text-ink-500">
                  Began {formatDate(v.begin_date)}
                  {v.violation_id ? ` · Ref ${v.violation_id}` : ""}
                </p>
              </div>
              {v.status ? <Badge tone={statusTone(v.status)}>{v.status}</Badge> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
