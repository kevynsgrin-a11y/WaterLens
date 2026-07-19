import { Badge, Tooltip } from "@/components/ui";
import { formatDate, formatUnit, formatValue } from "@/lib/format";
import type { Detection } from "@/lib/types";

/** Position of the MCL reference line within the ratio track (percent). */
const MCL_POS = 62;

function measured(d: Detection): string {
  return formatValue(d.value, formatUnit(d.unit));
}

function limitText(value: number | null, unit: string): string {
  if (value == null) return "No numeric limit";
  if (value === 0) return "0 — any detection";
  return formatValue(value, formatUnit(unit));
}

function RatioBar({ d }: { d: Detection }) {
  const ratio = d.mcl != null && d.mcl > 0 ? d.value / d.mcl : null;

  if (ratio == null) {
    return (
      <p className="text-sm leading-relaxed text-ink-600">
        This contaminant carries a zero-tolerance standard (maximum contaminant level of 0). Any
        confirmed detection is, by definition, an exceedance.
      </p>
    );
  }

  const fillPct = Math.min(ratio * MCL_POS, 100);
  const pctOfLimit = Math.round(ratio * 100);
  // Calm palette only — deeper municipal blue when at/above the limit; never red.
  const fill = d.exceeds_mcl ? "bg-brand-600" : "bg-brand-400";
  const label = `${d.name} measured at ${measured(d)}, ${pctOfLimit}% of the ${limitText(
    d.mcl,
    d.unit
  )} federal limit.`;

  return (
    <div>
      <div
        className="relative h-2.5 w-full rounded-full bg-ink-100"
        role="img"
        aria-label={label}
      >
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${fill}`}
          style={{ width: `${fillPct}%` }}
        />
        <div
          className="absolute -inset-y-1 w-px bg-ink-400"
          style={{ left: `${MCL_POS}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs text-ink-500">
        <span aria-hidden="true">
          <span className="font-mono font-medium text-ink-700">{pctOfLimit}%</span> of the federal
          limit
        </span>
        <span aria-hidden="true" className="tabular-nums">
          Legal limit (MCL) {limitText(d.mcl, d.unit)}
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ d }: { d: Detection }) {
  if (d.exceeds_mcl) {
    return <Badge tone="brand">Above federal limit</Badge>;
  }
  return <Badge tone="ink">Above health guideline</Badge>;
}

function Provenance({ d }: { d: Detection }) {
  const goal =
    d.health_goal == null
      ? "—"
      : d.health_goal === 0
        ? "0 (no known safe level)"
        : formatValue(d.health_goal, formatUnit(d.unit));

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-ink-100 pt-4 text-sm sm:grid-cols-4">
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Measured</dt>
        <dd className="mt-0.5 font-mono font-semibold text-ink-900">{measured(d)}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Legal limit (MCL)</dt>
        <dd className="mt-0.5 font-mono text-ink-800">{limitText(d.mcl, d.unit)}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Health goal</dt>
        <dd className="mt-0.5 font-mono text-ink-800">{goal}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Sampled</dt>
        <dd className="mt-0.5 text-ink-800">{formatDate(d.sample_date)}</dd>
      </div>
    </dl>
  );
}

function ContaminantRow({ d }: { d: Detection }) {
  const agency = d.sampling_agency ?? "the reporting utility";

  return (
    <article className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {d.health_effects ? (
              <Tooltip
                content={
                  <span>
                    <span className="block font-semibold text-ink-900">{d.name}</span>
                    <span className="mt-1 block">{d.health_effects}</span>
                  </span>
                }
              >
                <h3 className="text-base font-semibold text-ink-900">{d.name}</h3>
              </Tooltip>
            ) : (
              <h3 className="text-base font-semibold text-ink-900">{d.name}</h3>
            )}
            <Badge tone="ink">{d.category}</Badge>
          </div>
        </div>
        <StatusBadge d={d} />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-700">
        {agency} reported {d.name.toLowerCase()} at{" "}
        <span className="font-mono font-medium text-ink-900">{measured(d)}</span>
        {d.sample_date ? ` on ${formatDate(d.sample_date)}` : ""}
        {d.mcl != null && d.mcl > 0
          ? d.exceeds_mcl
            ? ` — above the ${limitText(d.mcl, d.unit)} federal limit.`
            : ` — below the ${limitText(d.mcl, d.unit)} federal limit but above the health-based goal.`
          : "."}
      </p>

      <div className="mt-4">
        <RatioBar d={d} />
      </div>

      <div className="mt-5">
        <Provenance d={d} />
      </div>

      <p className="mt-3 text-xs text-ink-500">
        Source: {d.source}
        {d.sampling_agency ? ` · Reported by ${d.sampling_agency}` : ""} · Unit{" "}
        {formatUnit(d.unit)}
      </p>
    </article>
  );
}

export function ContaminantMatrix({ detections }: { detections: Detection[] }) {
  if (detections.length === 0) return null;

  return (
    <section aria-labelledby="contaminants-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="contaminants-heading" className="text-2xl font-semibold text-ink-900 sm:text-3xl">
            Reported exceedances
          </h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-600">
            Contaminants your utility reported above a federal limit or health-based goal, ordered by
            severity. Every value carries its sample date, testing agency, and legal reference.
          </p>
        </div>
        <p className="text-sm text-ink-500">
          {detections.length} {detections.length === 1 ? "contaminant" : "contaminants"}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {detections.map((d) => (
          <ContaminantRow key={d.code} d={d} />
        ))}
      </div>
    </section>
  );
}
