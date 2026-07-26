/**
 * On-page navigation for the long institutional documents. A sticky rail from
 * `lg` up; a horizontally-scrolling chip row below that, so a 10,000px page is
 * navigable on a phone too.
 *
 * Server component — anchors and CSS sticky only.
 */
export interface TocItem {
  id: string;
  label: string;
}

export function TableOfContents({
  items,
  className = "",
}: {
  items: TocItem[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page" className={className} data-print-hide>
      {/* Mobile: chip rail */}
      <div
        className="-mx-6 overflow-x-auto px-6 pb-1 lg:hidden"
        tabIndex={0}
        role="region"
        aria-label="On this page, scrollable"
      >
        <ul className="flex w-max gap-2">
          {items.map((i) => (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                className="inline-flex whitespace-nowrap rounded-full border border-ink-200 bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700 dark:border-white/15 dark:text-ink-300 dark:hover:text-brand-200"
              >
                {i.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop: sticky rail */}
      <div className="hidden lg:sticky lg:top-24 lg:block">
        <p className="text-eyebrow uppercase text-ink-500 dark:text-ink-400">On this page</p>
        <ul className="mt-3 space-y-1 border-l border-hairline">
          {items.map((i) => (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-ink-600 transition-colors hover:border-brand-400 hover:text-brand-700 dark:text-ink-300 dark:hover:text-brand-200"
              >
                {i.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
