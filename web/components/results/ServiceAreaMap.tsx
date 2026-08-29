import type { Coordinate, Polygon } from "@/lib/types";

// -----------------------------------------------------------------------------
// Evidence for the Tier-1 claim.
//
// The confidence banner asserts "this address falls inside the mapped service
// boundary" and stakes 100% confidence on it. This draws that boundary and the
// resolved point so the claim is shown rather than asserted. Pure inline SVG on
// the polygon we already hold — no tiles, no network, no map library.
// -----------------------------------------------------------------------------

const W = 480;
const H = 320;
const PAD = 0.1; // fraction of span

export function ServiceAreaMap({
  boundary,
  point,
  utilityName,
}: {
  boundary: Polygon;
  point: Coordinate | null;
  utilityName: string;
}) {
  const ring = boundary.rings[0];
  if (!ring || ring.length < 3) return null;

  const lons = ring.map(([lon]) => lon);
  const lats = ring.map(([, lat]) => lat);
  let minLon = Math.min(...lons);
  let maxLon = Math.max(...lons);
  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);

  // Keep the point in frame even if it sits just outside the drawn ring.
  if (point) {
    minLon = Math.min(minLon, point.lon);
    maxLon = Math.max(maxLon, point.lon);
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
  }

  const lonSpan = maxLon - minLon || 0.01;
  const latSpan = maxLat - minLat || 0.01;
  const padLon = lonSpan * PAD;
  const padLat = latSpan * PAD;
  minLon -= padLon;
  maxLon += padLon;
  minLat -= padLat;
  maxLat += padLat;

  // Equirectangular with a cos(lat) correction so shapes are not stretched.
  const midLat = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const kx = Math.cos(midLat);
  const spanX = (maxLon - minLon) * kx;
  const spanY = maxLat - minLat;
  // Fit the larger dimension, centre the other.
  const scale = Math.min(W / spanX, H / spanY);
  const offX = (W - spanX * scale) / 2;
  const offY = (H - spanY * scale) / 2;

  const px = (lon: number) => offX + (lon - minLon) * kx * scale;
  const py = (lat: number) => offY + (maxLat - lat) * scale;

  const points = ring.map(([lon, lat]) => `${px(lon).toFixed(1)},${py(lat).toFixed(1)}`).join(" ");

  return (
    <figure className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card dark:border-white/10 dark:bg-surface-raised">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full bg-brand-50/40 dark:bg-brand-950/40"
        role="img"
        aria-label={`Service-area map for ${utilityName}. The mapped boundary is drawn as a filled polygon${
          point ? ", with the looked-up address marked inside it" : ""
        }.`}
      >
        <defs>
          <pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path
              d="M32 0H0V32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.08"
            />
          </pattern>
        </defs>

        <rect
          width={W}
          height={H}
          fill="url(#map-grid)"
          className="text-brand-800 dark:text-brand-200"
        />

        <polygon
          points={points}
          className="fill-brand-200/55 stroke-brand-500 dark:fill-brand-400/20 dark:stroke-brand-300"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />

        {point ? (
          <g>
            {/* Crosshair rules to the frame edge — this is a survey plate, not
                a slippy map, so the projection is stated rather than implied. */}
            <g
              className="text-verdant-500 dark:text-verdant-300"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 5"
              opacity="0.5"
            >
              <line x1={px(point.lon)} y1={0} x2={px(point.lon)} y2={H} />
              <line x1={0} y1={py(point.lat)} x2={W} y2={py(point.lat)} />
            </g>
            <circle
              cx={px(point.lon)}
              cy={py(point.lat)}
              r="18"
              className="fill-none stroke-verdant-500 dark:stroke-verdant-300"
              strokeWidth="1.25"
              strokeDasharray="3 4"
            />
            <circle
              cx={px(point.lon)}
              cy={py(point.lat)}
              r="5.5"
              className="fill-verdant-500 stroke-white dark:fill-verdant-300 dark:stroke-brand-950"
              strokeWidth="2.5"
            />
            <text
              x={px(point.lon) + 26}
              y={py(point.lat) + 4}
              className="fill-ink-600 font-mono dark:fill-ink-200"
              fontSize="11"
              letterSpacing="0.06em"
            >
              {point.lat.toFixed(3)}, {point.lon.toFixed(3)}
            </text>
          </g>
        ) : null}

        {/* Frame + extent readout */}
        <rect
          x="0.5"
          y="0.5"
          width={W - 1}
          height={H - 1}
          fill="none"
          className="text-ink-200 dark:text-white/15"
          stroke="currentColor"
        />
        <text
          x="10"
          y="18"
          className="fill-ink-500 font-mono dark:fill-ink-400"
          fontSize="10"
          letterSpacing="0.08em"
        >
          TEMM SERVICE AREA
        </text>
        <text
          x={W - 10}
          y={H - 10}
          textAnchor="end"
          className="fill-ink-500 font-mono dark:fill-ink-400"
          fontSize="10"
          letterSpacing="0.08em"
        >
          {maxLat.toFixed(2)}N {Math.abs(minLon).toFixed(2)}W — {minLat.toFixed(2)}N{" "}
          {Math.abs(maxLon).toFixed(2)}W
        </text>
      </svg>
      <figcaption className="border-t border-ink-100 px-4 py-3 text-xs leading-relaxed text-ink-600 dark:border-white/10 dark:text-ink-300">
        Mapped service-area boundary for{" "}
        <span className="font-medium text-ink-800 dark:text-ink-100">{utilityName}</span>
        {point ? ", with your geocoded address resolved inside it." : "."} Boundary geometry is
        schematic, drawn from the TEMM service-area layer.
      </figcaption>
    </figure>
  );
}
