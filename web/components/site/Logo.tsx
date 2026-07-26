import Link from "next/link";

/**
 * Wordmark + droplet-in-lens glyph. Thin-line, clinical (DESIGN.md).
 *
 * The mark carries no hardcoded hexes: the lens and its handle inherit
 * `currentColor` from the link, and the droplet takes a Tailwind `fill-*` token.
 * Both re-colour under `dark:` so the glyph themes with the rest of the chrome.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 font-semibold tracking-tight text-ink-900 dark:text-white ${className ?? ""}`}
      aria-label="WaterQualityLens home"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
        className="shrink-0 text-brand-600 dark:text-brand-300"
      >
        <circle
          cx="13"
          cy="13"
          r="8.5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M13 8.5c1.9 2.2 3 3.9 3 5.4a3 3 0 1 1-6 0c0-1.5 1.1-3.2 3-5.4Z"
          className="fill-verdant-600 dark:fill-verdant-300"
        />
        <path
          d="m19.5 19.5 4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[1.05rem]">
        WaterQuality
        <span className="text-brand-600 dark:text-brand-300">Lens</span>
      </span>
    </Link>
  );
}
