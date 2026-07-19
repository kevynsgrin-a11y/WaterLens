export function NitrateNotice({ warning }: { warning: string | null }) {
  if (!warning) return null;

  return (
    <aside
      className="rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:p-6"
      aria-label="Nitrate treatment guidance"
    >
      <div className="flex items-start gap-4">
        <span className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 11v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="7.8" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="0.9" />
          </svg>
        </span>
        <div>
          <h3 className="text-base font-semibold text-brand-800">
            Treatment note: nitrate requires reverse osmosis
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-700">{warning}</p>
        </div>
      </div>
    </aside>
  );
}
