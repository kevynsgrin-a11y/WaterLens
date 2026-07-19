import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Prose — hand-styled long-form typography (NOT @tailwindcss/typography).
// Constrained measure (~65ch) with a deliberate heading/paragraph/list rhythm
// tuned to the ink/brand tokens (see DESIGN.md). Wrap institutional copy in
// <Prose>…</Prose> and compose paragraphs, <H2>, and <Lead> inside it.
// -----------------------------------------------------------------------------

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Long-form content wrapper. Applies a refined vertical rhythm and a readable
 * measure to plain HTML children (p, ul, ol, h3, a, strong…) without a plugin.
 */
export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "max-w-[65ch] text-base leading-relaxed text-ink-600",
        // Paragraph rhythm
        "[&_p]:mt-5 [&_p:first-child]:mt-0",
        // Emphasis
        "[&_strong]:font-semibold [&_strong]:text-ink-800",
        "[&_em]:italic",
        // Inline links
        "[&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline [&_a]:decoration-brand-200 [&_a]:decoration-1 [&_a]:underline-offset-2 hover:[&_a]:decoration-brand-400",
        // Sub-headings inside prose
        "[&_h3]:mt-10 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-ink-900",
        "[&_h3+p]:mt-3",
        // Lists
        "[&_ul]:mt-5 [&_ul]:space-y-2.5 [&_ul]:pl-0",
        "[&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:space-y-2.5 [&_ol]:pl-5 [&_ol]:marker:font-mono [&_ol]:marker:text-ink-400",
        // Unordered list items get a custom brand marker
        "[&_ul>li]:relative [&_ul>li]:pl-6",
        "[&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-[0.6em] [&_ul>li]:before:h-1.5 [&_ul>li]:before:w-1.5 [&_ul>li]:before:rounded-full [&_ul>li]:before:bg-brand-300",
        // Definitions / code
        "[&_code]:rounded [&_code]:bg-ink-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-ink-800",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Section heading with an anchor id, sized for institutional pages. Sits
 * outside the constrained measure so it can align with wider layouts.
 */
export function H2({
  children,
  id,
  className,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={cx(
        "scroll-mt-24 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl",
        className
      )}
    >
      {children}
    </h2>
  );
}

/** Introductory lead paragraph — slightly larger, calmer color. */
export function Lead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cx(
        "max-w-[60ch] text-lg leading-relaxed text-ink-600",
        className
      )}
    >
      {children}
    </p>
  );
}
