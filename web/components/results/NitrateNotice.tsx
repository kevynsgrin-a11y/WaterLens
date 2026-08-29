export function NitrateNotice({ warning }: { warning: string | null }) {
  if (!warning) return null;

  return (
    <aside
      className="rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:p-6 dark:border-brand-300/25 dark:bg-brand-300/10"
      // This notice sits between two <h2> report sections, so its own heading is
      // an <h2> (kept at its original visual size) and labels the aside.
      aria-labelledby="nitrate-notice-heading"
    >
      <div className="flex items-start gap-4">
        <span className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 11v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="7.8" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="0.9" />
          </svg>
        </span>
        <div>
          <h2
            id="nitrate-notice-heading"
            className="text-base font-semibold text-brand-800 dark:text-brand-200"
          >
            Treatment note: nitrate requires reverse osmosis
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-ink-200">
            {warning}
          </p>
        </div>
      </div>
    </aside>
  );
}
