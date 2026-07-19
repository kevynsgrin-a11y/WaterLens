import { formatDate, formatUnit, formatValue } from "@/lib/format";

// -----------------------------------------------------------------------------
// TrendLine — a small, dependency-free inline-SVG line chart for a single
// contaminant's sampling history. Calm brand/teal line + dots, with an optional
// dashed MCL reference line. No external charting libraries (DESIGN.md).
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
const VW = 480;
const VH = 150;
const PAD = { top: 16, right: 20, bottom: 30, left: 46 };
const PLOT_W = VW - PAD.left - PAD.right;
const PLOT_H = VH - PAD.top - PAD.bottom;

function ts(iso: string): number {
  return new Date(iso.length <= 10 ? iso + "T00:00:00Z" : iso).getTime();
}

export function TrendLine({ points, unit, label, mcl }: TrendLineProps) {
  const data = [...points].sort((a, b) => ts(a.sample_date) - ts(b.sample_date));
  const prettyUnit = formatUnit(unit);

  if (data.length === 0) {
    return (
      <p className="text-sm text-ink-500">No time-series samples available.</p>
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

  const areaPath =
    data.length > 1
      ? `${linePath} L${px(data.length - 1).toFixed(1)},${(PAD.top + PLOT_H).toFixed(
          1
        )} L${px(0).toFixed(1)},${(PAD.top + PLOT_H).toFixed(1)} Z`
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

  const titleId = `trend-${(label ?? "series").replace(/\s+/g, "-").toLowerCase()}`;
  const yTickVals = [yMax, yMax / 2, 0];
  const mclY = hasMcl ? y(mcl as number) : 0;

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
                stroke="#eceef2"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={gy + 3}
                textAnchor="end"
                className="fill-ink-400"
                fontSize={10}
                fontFamily="var(--font-mono, monospace)"
              >
                {v >= 100 ? v.toFixed(0) : v.toFixed(v < 1 ? 2 : 1)}
              </text>
            </g>
          );
        })}

        {/* MCL reference line */}
        {hasMcl ? (
          <g>
            <line
              x1={PAD.left}
              x2={VW - PAD.right}
              y1={mclY}
              y2={mclY}
              stroke="#bd7817"
              strokeWidth={1.4}
              strokeDasharray="5 4"
            />
            <text
              x={VW - PAD.right}
              y={mclY - 5}
              textAnchor="end"
              className="fill-caution-700"
              fontSize={10}
              fontWeight={600}
            >
              MCL {formatValue(mcl as number, prettyUnit)}
            </text>
          </g>
        ) : null}

        {/* Area fill */}
        {areaPath ? <path d={areaPath} fill="#eff8f4" opacity={0.7} /> : null}

        {/* Trend line */}
        {data.length > 1 ? (
          <path
            d={linePath}
            fill="none"
            stroke="#348465"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {/* Dots + x labels */}
        {data.map((d, i) => {
          const cx = px(i);
          const cy = y(d.value);
          const above = hasMcl && d.value > (mcl as number);
          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={3.6}
                fill={above ? "#bd7817" : "#276a51"}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
              <text
                x={cx}
                y={VH - 10}
                textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
                className="fill-ink-500"
                fontSize={10}
              >
                {new Date(
                  d.sample_date.length <= 10 ? d.sample_date + "T00:00:00Z" : d.sample_date
                ).toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                  timeZone: "UTC",
                })}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">{description}</figcaption>
    </figure>
  );
}
