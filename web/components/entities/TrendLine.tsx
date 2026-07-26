import { formatDate, formatUnit, formatValue } from "@/lib/format";

// -----------------------------------------------------------------------------
// TrendLine — a dependency-free inline-SVG line chart for a single contaminant's
// sampling history. Calm verdant line, gradient area, dashed MCL reference line,
// and a per-point readout that appears on hover or keyboard focus. No charting
// library and no client JavaScript (DESIGN.md).
// -----------------------------------------------------------------------------

export interface TrendPoint {
  sample_date: string;
  value: number;
}

interface TrendLineProps {
  points: TrendPoint[];
  unit: string;
  label?: string;
  mcl?: number | null;
}

// Fixed viewBox; the SVG scales fluidly via width:100% on the wrapper.
const VW = 880;
const VH = 300;
const PAD = { top: 24, right: 28, bottom: 40, left: 60 };
const PLOT_W = VW - PAD.left - PAD.right;
const PLOT_H = VH - PAD.top - PAD.bottom;

// The chart lives in a half-width card, so one user unit lands at roughly 0.55
// CSS px. Every glyph size below is therefore quoted in user units at that
// scale: FS_AXIS 22 ≈ 12 CSS px, which is the legible floor. Writing a literal
// "11" here would render as ~6 px and fail the same contrast/legibility bar the
// old fill-ink-400 labels failed.
const FS_AXIS = 22;
const FS_MCL = 21;
const FS_CHIP = 22;
const CHIP_H = 34;
const CHIP_CHAR_W = 11.6;

const AXIS_TEXT = "fill-ink-500 dark:fill-ink-400";

function ts(iso: string): number {
  return new Date(iso.length <= 10 ? iso + "T00:00:00Z" : iso).getTime();
}

function shortDate(iso: string): string {
  return new Date(iso.length <= 10 ? iso + "T00:00:00Z" : iso).toLocaleDateString(
    "en-US",
    { month: "short", year: "2-digit", timeZone: "UTC" }
  );
}

export function TrendLine({ points, unit, label, mcl }: TrendLineProps) {
  const data = [...points].sort((a, b) => ts(a.sample_date) - ts(b.sample_date));
  const prettyUnit = formatUnit(unit);

  if (data.length === 0) {
    return (
      <p className="text-sm text-ink-500 dark:text-ink-400">
        No time-series samples available.
      </p>
    );
  }

  const values = data.map((d) => d.value);
  const times = data.map((d) => ts(d.sample_date));
  const hasMcl = typeof mcl === "number" && mcl > 0;

  const dataMax = Math.max(...values, hasMcl ? (mcl as number) : -Infinity);
  const yMax = dataMax * 1.15 || 1;
  const yMin = 0;

  const tMin = times[0];
  const tMax = times[times.length - 1];
  const tSpan = tMax - tMin || 1;

  const x = (t: number) => PAD.left + ((t - tMin) / tSpan) * PLOT_W;
  const y = (v: number) =>
    PAD.top + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;

  // For a single sample, center it horizontally.
  const px = (i: number) =>
    data.length === 1 ? PAD.left + PLOT_W / 2 : x(times[i]);

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${y(d.value).toFixed(1)}`)
    .join(" ");

  const baseline = (PAD.top + PLOT_H).toFixed(1);
  const areaPath =
    data.length > 1
      ? `${linePath} L${px(data.length - 1).toFixed(1)},${baseline} L${px(0).toFixed(
          1
        )},${baseline} Z`
      : "";

  const first = data[0];
  const last = data[data.length - 1];
  const delta = last.value - first.value;
  const direction =
    data.length < 2
      ? "a single reported sample"
      : delta > 0
      ? "an upward trend"
      : delta < 0
      ? "a downward trend"
      : "a flat trend";

  const relToMcl = hasMcl
    ? last.value > (mcl as number)
      ? `, above the ${formatValue(mcl as number, prettyUnit)} maximum contaminant level`
      : `, below the ${formatValue(mcl as number, prettyUnit)} maximum contaminant level`
    : "";

  const description = `${label ? label + ": " : ""}${direction} across ${
    data.length
  } sample${data.length === 1 ? "" : "s"} from ${formatDate(
    first.sample_date
  )} to ${formatDate(last.sample_date)}; latest value ${formatValue(
    last.value,
    prettyUnit
  )}${relToMcl}.`;

  const slug = (label ?? "series").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const titleId = `trend-${slug}`;
  const gradientId = `trend-fill-${slug}`;

  const yTickVals = [yMax, (yMax * 2) / 3, yMax / 3, 0];
  const mclY = hasMcl ? y(mcl as number) : 0;

  // Thin out x labels so they never collide; the ends are always labelled.
  const labelStride = Math.max(1, Math.ceil(data.length / 6));

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        className="h-auto w-full overflow-visible"
        role="img"
        aria-labelledby={titleId}
        preserveAspectRatio="xMidYMid meet"
      >
        <title id={titleId}>{description}</title>

        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="currentColor"
              stopOpacity={0.22}
              className="text-verdant-500 dark:text-verdant-300"
            />
            <stop
              offset="100%"
              stopColor="currentColor"
              stopOpacity={0}
              className="text-verdant-500 dark:text-verdant-300"
            />
          </linearGradient>
        </defs>

        {/* Y gridlines + labels */}
        {yTickVals.map((v, i) => {
          const gy = y(v);
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={VW - PAD.right}
                y1={gy}
                y2={gy}
                className="stroke-ink-100 dark:stroke-white/10"
                strokeWidth={1.5}
              />
              <text
                x={PAD.left - 12}
                y={gy + FS_AXIS * 0.34}
                textAnchor="end"
                className={AXIS_TEXT}
                fontSize={FS_AXIS}
                fontFamily="var(--font-mono, monospace)"
              >
                {v >= 100 ? v.toFixed(0) : v.toFixed(v < 1 ? 2 : 1)}
              </text>
            </g>
          );
        })}

        {/* MCL reference line — neutral ink, labelled in words so the meaning
            never rests on a colour. */}
        {hasMcl ? (
          <g>
            <line
              x1={PAD.left}
              x2={VW - PAD.right}
              y1={mclY}
              y2={mclY}
              className="stroke-ink-500 dark:stroke-ink-400"
              strokeWidth={2.4}
              strokeDasharray="9 7"
            />
            <text
              x={VW - PAD.right}
              y={mclY - 10}
              textAnchor="end"
              className="fill-ink-600 dark:fill-ink-300"
              fontSize={FS_MCL}
              fontWeight={600}
            >
              MCL {formatValue(mcl as number, prettyUnit)}
            </text>
          </g>
        ) : null}

        {/* Area fill */}
        {areaPath ? <path d={areaPath} fill={`url(#${gradientId})`} /> : null}

        {/* Trend line */}
        {data.length > 1 ? (
          <path
            d={linePath}
            fill="none"
            className="stroke-verdant-500 dark:stroke-verdant-300"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {/* Dots + x labels */}
        {data.map((d, i) => {
          const cx = px(i);
          const cy = y(d.value);
          const terminal = i === data.length - 1;
          const showLabel =
            i === 0 || terminal || i % labelStride === 0;
          return (
            <g key={`pt-${i}`}>
              {terminal ? (
                <circle
                  cx={cx}
                  cy={cy}
                  r={17}
                  className="fill-verdant-500/15 dark:fill-verdant-300/20"
                />
              ) : null}
              <circle
                cx={cx}
                cy={cy}
                r={terminal ? 8.2 : 6.2}
                className="fill-verdant-600 stroke-surface-raised dark:fill-verdant-300"
                strokeWidth={2.8}
              />
              {showLabel ? (
                <text
                  x={cx}
                  y={VH - 12}
                  textAnchor={
                    i === 0 ? "start" : terminal ? "end" : "middle"
                  }
                  className={AXIS_TEXT}
                  fontSize={FS_AXIS}
                >
                  {shortDate(d.sample_date)}
                </text>
              ) : null}
            </g>
          );
        })}

        {/* Per-point readouts. Drawn last so a chip is never buried, and driven
            purely by :hover / :focus-within — no client JavaScript. */}
        {data.map((d, i) => {
          const cx = px(i);
          const cy = y(d.value);
          const text = `${formatValue(d.value, prettyUnit)} · ${formatDate(
            d.sample_date
          )}`;
          const w = text.length * CHIP_CHAR_W + 22;
          const chipX = Math.min(
            Math.max(cx - w / 2, PAD.left),
            VW - PAD.right - w
          );
          const above = cy - 20 - CHIP_H >= PAD.top;
          const chipY = above ? cy - 20 - CHIP_H : cy + 20;

          return (
            <g key={`hit-${i}`} className="group">
              {/* Enlarged, invisible hit area — also the keyboard stop. */}
              <circle
                cx={cx}
                cy={cy}
                r={24}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${formatValue(d.value, prettyUnit)} on ${formatDate(
                  d.sample_date
                )}`}
                className="cursor-default outline-none"
              />
              <circle
                cx={cx}
                cy={cy}
                r={13}
                fill="none"
                strokeWidth={3}
                className="stroke-verdant-500/45 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 dark:stroke-verdant-300/50"
              />
              <g
                aria-hidden="true"
                className="pointer-events-none opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
              >
                <rect
                  x={chipX}
                  y={chipY}
                  width={w}
                  height={CHIP_H}
                  rx={9}
                  className="fill-ink-900/95 dark:fill-white/95"
                />
                <text
                  x={chipX + w / 2}
                  y={chipY + CHIP_H / 2 + FS_CHIP * 0.35}
                  textAnchor="middle"
                  fontSize={FS_CHIP}
                  fontFamily="var(--font-mono, monospace)"
                  className="fill-white dark:fill-ink-900"
                >
                  {text}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Deliberately NOT a repeat of the SVG title — that sentence is already
          the chart's accessible name. This is the provenance/legend strip. */}
      <figcaption className="mt-2 text-xs leading-relaxed text-ink-500 dark:text-ink-400">
        {data.length} sample{data.length === 1 ? "" : "s"} ·{" "}
        {shortDate(first.sample_date)} – {shortDate(last.sample_date)} · values in{" "}
        {prettyUnit}
        {hasMcl
          ? ` · dashed line = federal MCL ${formatValue(
              mcl as number,
              prettyUnit
            )}`
          : ""}
      </figcaption>
    </figure>
  );
}
