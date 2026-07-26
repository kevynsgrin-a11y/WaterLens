/**
 * Section transition. Two offset sine curves so a band change reads as a water
 * line rather than a butt-joint. `from` is the colour of the section above;
 * the divider paints that colour down onto the section below.
 *
 * Purely decorative — hidden from assistive tech.
 */
export function WaveDivider({
  className = "",
  flip = false,
}: {
  /** Tailwind text-* class supplying the fill via currentColor. */
  className?: string;
  /** Mirror vertically when transitioning the other direction. */
  flip?: boolean;
}) {
  return (
    <div className={`pointer-events-none relative ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1440 72"
        preserveAspectRatio="none"
        className={`block h-[42px] w-full sm:h-[56px] ${flip ? "rotate-180" : ""}`}
      >
        <path
          d="M0,30 C180,64 360,64 540,42 C720,20 900,4 1080,14 C1260,24 1380,44 1440,52 L1440,72 L0,72 Z"
          fill="currentColor"
          opacity="0.45"
        />
        <path
          d="M0,44 C180,72 380,66 560,52 C740,38 920,22 1100,28 C1280,34 1390,52 1440,60 L1440,72 L0,72 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
