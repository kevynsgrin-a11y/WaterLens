import { Badge, Tooltip } from "@/components/ui";
import {
  daysSince,
  formatDate,
  formatRatio,
  formatUnit,
  formatValue,
  severityChipClass,
  severityLabel,
} from "@/lib/format";
import type { Detection, HistoryPoint, Violation } from "@/lib/types";
import { Sparkline } from "./Sparkline";

function measured(d: Detection): string {
  return formatValue(d.value, formatUnit(d.unit));
}

function limitText(value: number | null, unit: string): string {
  if (value == null) return "No numeric limit";
  if (value === 0) return "0 — any detection";
  return formatValue(value, formatUnit(unit));
}

/**
 * Where a reading sits relative to its legal limit.
 *
 * The limit is pinned at the midpoint of the track. Below it the scale is
 * linear (0→1×); above it, log-compressed (1×→10×) so a 1.2× and an 8× reading
 * remain visibly different instead of both saturating the bar. The over-limit
 * segment is hatched so "past the line" is legible without color alarm.
 */
const MID = 50;

function scalePos(ratio: number): number {
  if (ratio <= 0) return 0;
  if (ratio <= 1) return ratio * MID;
  return Math.min(100, MID + (Math.log10(ratio) / 1) * MID);
}

function ExceedanceScale({ d }: { d: Detection }) {
  const ratio = d.mcl != null && d.mcl > 0 ? (d.mcl_ratio ?? d.value / d.mcl) : null;

  if (ratio == null) {
    return (
      <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-300">
        This contaminant carries a zero-tolerance standard (maximum contaminant level of 0).
        Any confirmed detection is, by definition, an exceedance.
      </p>
    );
  }

  const pos = scalePos(ratio);
  const pctOfLimit = Math.round(ratio * 100);
  const overflow = ratio > 10;

  return (
    <div>
      <div
        className="relative h-2.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-white/10"
        role="img"
        aria-label={`${d.name} measured at ${measured(d)} — ${pctOfLimit}% of the ${limitText(
          d.mcl,
          d.unit
        )} federal limit.`}
      >
        {/* Sub-limit portion */}
        <div
          className="absolute inset-y-0 left-0 bg-brand-300 dark:bg-brand-400/70"
          style={{ width: `${Math.min(pos, MID)}%` }}
        />
        {/* Over-limit portion — hatched, so severity reads without alarm hue */}
        {pos > MID ? (
          <div
            className="absolute inset-y-0 bg-brand-700 dark:bg-brand-300"
            style={{
              left: `${MID}%`,
              width: `${pos - MID}%`,
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 5px)",
            }}
          />
        ) : null}
        {/* The legal limit, drawn last so nothing buries it */}
        <div
          className="absolute -inset-y-0.5 w-0.5 bg-ink-700 dark:bg-white"
          style={{ left: `${MID}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
        <span aria-hidden="true">
          <span className="font-mono font-medium text-ink-700 dark:text-ink-200">
            {pctOfLimit}%
          </span>{" "}
          of the federal limit
          {overflow ? " (scale capped at 10×)" : ""}
        </span>
        <span aria-hidden="true" className="tabular-nums">
          Legal limit (MCL) {limitText(d.mcl, d.unit)}
        </span>
      </div>
    </div>
  );
}

function Provenance({ d }: { d: Detection }) {
  const goal =
    d.health_goal == null
      ? "—"
      : d.health_goal === 0
        ? "0 (no known safe level)"
        : formatValue(d.health_goal, formatUnit(d.unit));

  const cells: Array<[string, string]> = [
    ["Measured", measured(d)],
    ["Legal limit (MCL)", limitText(d.mcl, d.unit)],
    ["Health goal (MCLG)", goal],
    ["Sampled", formatDate(d.sample_date)],
    ["Reported by", d.sampling_agency ?? "the reporting utility"],
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-hairline pt-4 text-sm sm:grid-cols-5">
      {cells.map(([label, value], i) => (
        <div key={label}>
          <dt className="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">
            {label}
          </dt>
          <dd
            className={`mt-0.5 text-ink-800 dark:text-ink-100 ${
              i < 3 ? "font-mono" : ""
            } ${i === 0 ? "font-semibold text-ink-900 dark:text-white" : ""}`}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ViolationStrip({ v, now }: { v: Violation; now: Date }) {
  const days = daysSince(v.begin_date, now);
  return (
    <div className="-mx-5 -mb-5 mt-5 rounded-b-2xl border-t border-brand-200 bg-brand-50/70 px-5 py-3 text-sm text-brand-900 sm:-mx-6 sm:-mb-6 sm:px-6 dark:border-brand-300/25 dark:bg-brand-300/10 dark:text-brand-100">
      <span className="font-medium">Formal MCL violation on record</span>
      {v.begin_date ? (
        <>
          {" "}
          since {formatDate(v.begin_date)}
          {days != null ? ` — ${days} days` : ""}
        </>
      ) : null}
      {v.status ? `, ${v.status.toLowerCase()}` : ""} · Ref {v.violation_id}
    </div>
  );
}

function ContaminantRow({
  d,
  history,
  violation,
  now,
}: {
  d: Detection;
  history: HistoryPoint[];
  violation: Violation | undefined;
  now: Date;
}) {
  const ratioText = formatRatio(d.mcl_ratio);
  const series = history.filter((h) => h.code === d.code);

  return (
    <article
      id={`contaminant-${d.code}`}
      className="scroll-mt-24 rounded-2xl bg-surface-raised p-5 shadow-card ring-1 ring-ink-900/[0.055] sm:p-6 dark:ring-white/10"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h3 className="text-title-2 text-ink-900 dark:text-white">{d.name}</h3>
            <Badge tone="ink">{d.category}</Badge>
          </div>
          {ratioText && d.exceeds_mcl ? (
            <p className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-semibold tabular-nums text-ink-900 dark:text-white">
                {ratioText}
              </span>
              <span className="text-sm text-ink-500 dark:text-ink-400">
                the federal limit
              </span>
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-4">
          {series.length >= 2 ? (
            <Sparkline points={series} mcl={d.mcl} label={d.name} />
          ) : null}
          <Badge className={severityChipClass(d)}>{severityLabel(d)}</Badge>
        </div>
      </div>

      <div className="mt-5">
        <ExceedanceScale d={d} />
      </div>

      <div className="mt-5">
        <Provenance d={d} />
      </div>

      {d.health_effects ? (
        <div className="mt-4 border-l-2 border-ink-200 pl-4 dark:border-white/15">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">
            <Tooltip content="The health basis on which the EPA sets this contaminant's legal limit. Reported verbatim from the regulatory record — it is not a diagnosis or a prediction about any individual.">
              EPA health-effects basis
            </Tooltip>
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            {d.health_effects}
          </p>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-ink-500 dark:text-ink-400">
        Source: {d.source} · Unit {formatUnit(d.unit)}
      </p>

      {violation ? <ViolationStrip v={violation} now={now} /> : null}
    </article>
  );
}

export function ContaminantMatrix({
  detections,
  history = [],
  violations = [],
  generatedAt,
}: {
  detections: Detection[];
  history?: HistoryPoint[];
  violations?: Violation[];
  /** ISO timestamp from the result, so "days open" is not clock-dependent. */
  generatedAt?: string;
}) {
  if (detections.length === 0) return null;

  const now = generatedAt ? new Date(generatedAt) : new Date();
  const violationByCode = new Map(
    violations.filter((v) => v.contaminant_code).map((v) => [v.contaminant_code as string, v])
  );

  return (
    <section aria-labelledby="contaminants-heading" className="scroll-mt-24" id="exceedances">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="contaminants-heading" className="text-title-1">
            Reported exceedances
          </h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-600 dark:text-ink-300">
            Contaminants your utility reported above a federal limit or health-based goal,
            ordered by severity. Every value carries its sample date, testing agency, and
            legal reference.
          </p>
        </div>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          {detections.length} {detections.length === 1 ? "contaminant" : "contaminants"}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {detections.map((d) => (
          <ContaminantRow
            key={d.code}
            d={d}
            history={history}
            violation={violationByCode.get(d.code)}
            now={now}
          />
        ))}
      </div>
    </section>
  );
}
