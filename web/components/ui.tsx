import Link from "next/link";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Shared design-system primitives (see DESIGN.md). Import these everywhere;
// do not re-implement surfaces, badges, or buttons.
// -----------------------------------------------------------------------------

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mx-auto w-full max-w-content px-6", className)}>
      {children}
    </div>
  );
}

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cx("py-16 sm:py-24", className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">
      {children}
    </p>
  );
}

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  return (
    <Tag
      className={cx(
        "rounded-2xl border border-ink-100 bg-white shadow-card",
        className
      )}
    >
      {children}
    </Tag>
  );
}

type Tone = "brand" | "verdant" | "ink" | "caution";
const toneMap: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 border-brand-200",
  verdant: "bg-verdant-50 text-verdant-700 border-verdant-200",
  ink: "bg-ink-100 text-ink-700 border-ink-200",
  caution: "bg-caution-50 text-caution-800 border-caution-200",
};

export function Badge({
  children,
  tone = "ink",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneMap[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Pill({ children, tone = "ink" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs",
        toneMap[tone]
      )}
    >
      {children}
    </span>
  );
}

export function Stat({
  value,
  label,
  sub,
}: {
  value: ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <div>
      <div className="font-mono text-3xl font-semibold text-ink-900">{value}</div>
      <div className="mt-1 text-sm font-medium text-ink-700">{label}</div>
      {sub ? <div className="mt-0.5 text-xs text-ink-500">{sub}</div> : null}
    </div>
  );
}

type ButtonProps = {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  disabled?: boolean;
};

const variantMap = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 shadow-sm focus-visible:ring-brand-400",
  secondary:
    "bg-white text-brand-700 border border-brand-200 hover:border-brand-300 hover:bg-brand-50",
  ghost: "text-brand-700 hover:bg-brand-50",
} as const;

export function Button({
  children,
  href,
  type = "button",
  variant = "primary",
  className,
  disabled,
}: ButtonProps) {
  const cls = cx(
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none",
    variantMap[variant],
    className
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled}>
      {children}
    </button>
  );
}

/**
 * Accessible, CSS-only tooltip for data provenance (§13). Wrap the trigger;
 * pass the definition as `content`. Works on hover and keyboard focus.
 */
export function Tooltip({
  children,
  content,
}: {
  children: ReactNode;
  content: ReactNode;
}) {
  return (
    <span className="group relative inline-flex cursor-help items-center border-b border-dotted border-ink-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-400" tabIndex={0}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-lg border border-ink-200 bg-white p-3 text-left text-xs font-normal leading-relaxed text-ink-700 opacity-0 shadow-lift transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
