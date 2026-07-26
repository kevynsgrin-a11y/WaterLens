import type { HistoryPoint } from "@/lib/types";

/**
 * Compact sample-history trace for a single contaminant, sized to sit in a card
 * header. Shows direction of travel — the thing a single reading cannot convey —
 * with the federal limit drawn as a dashed reference so the trend is legible
 * against the standard, not just against itself.
 */
export function Sparkline({
  points,
  mcl,
  label,
}: {
  /** Oldest first. At least two points, or nothing renders. */
  points: HistoryPoint[];
  mcl: number | null;
  label: string;
}) {
  if (points.length < 2) return null;

  const W = 132;
  const H = 40;
  const PAD = 4;

  const values = points.map((p) => p.value);
  const candidates = mcl != null && mcl > 0 ? [...values, mcl] : values;
  const min = Math.min(...candidates, 0);
  const max = Math.max(...candidates);
  const span = max - min || 1;

  const x = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);

  const line = points.map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${PAD},${H - PAD} ${line} ${(W - PAD).toFixed(1)},${H - PAD}`;

  const first = points[0].value;
  const last = points[points.length - 1].value;
  const direction = last > first ? "rising" : last < first ? "falling" : "flat";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-10 w-[8.25rem] shrink-0"
      role="img"
      aria-label={`${label} sample history, ${points.length} samples, ${direction}: ${points
        .map((p) => `${p.value} on ${p.sample_date}`)
        .join(", ")}.`}
    >
      <defs>
        <linearGradient id={`spark-${label.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a93c1" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#4a93c1" stopOpacity="0" />
        </linearGradient>
      </defs>

      {mcl != null && mcl > 0 ? (
        <line
          x1={PAD}
          y1={y(mcl)}
          x2={W - PAD}
          y2={y(mcl)}
          className="stroke-ink-400 dark:stroke-white/40"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      ) : null}

      <polyline points={area} fill={`url(#spark-${label.replace(/\W/g, "")})`} stroke="none" />
      <polyline
        points={line}
        fill="none"
        className="stroke-brand-500 dark:stroke-brand-300"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={x(points.length - 1)}
        cy={y(last)}
        r="2.75"
        className="fill-brand-600 dark:fill-brand-200"
      />
    </svg>
  );
}
