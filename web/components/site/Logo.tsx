import Link from "next/link";

/** Wordmark + droplet-in-lens glyph. Thin-line, clinical (DESIGN.md). */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 font-semibold tracking-tight text-ink-900 ${className ?? ""}`}
      aria-label="WaterQualityLens home"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="13" cy="13" r="8.5" stroke="#2b76a6" strokeWidth="1.6" />
        <path
          d="M13 8.5c1.9 2.2 3 3.9 3 5.4a3 3 0 1 1-6 0c0-1.5 1.1-3.2 3-5.4Z"
          fill="#348465"
        />
        <path d="m19.5 19.5 4 4" stroke="#2b76a6" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="text-[1.05rem]">
        WaterQuality<span className="text-brand-600">Lens</span>
      </span>
    </Link>
  );
}
