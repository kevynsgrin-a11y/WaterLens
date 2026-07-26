import { Container, Pill } from "@/components/ui";

/**
 * Wayfinding for a long report. Keeps the utility identity on screen while the
 * user scrolls, and gives the filter recommendations — several screens down —
 * a direct route. Pure CSS sticky plus anchors; no client JS.
 */
export function ReportNav({
  utilityName,
  pwsid,
  exceedances,
  violations,
  filters,
}: {
  utilityName: string;
  pwsid: string;
  exceedances: number;
  violations: number;
  filters: number;
}) {
  const items = [
    { href: "#exceedances", label: "Exceedances", count: exceedances },
    { href: "#violations", label: "Violations", count: violations },
    { href: "#filters", label: "Filters", count: filters },
  ].filter((i) => i.count > 0);

  if (items.length === 0) return null;

  return (
    <div
      className="sticky top-16 z-30 border-b border-hairline bg-surface-base/85 backdrop-blur"
      data-print-hide
    >
      <Container className="flex h-12 items-center justify-between gap-4 overflow-x-auto">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">
            {utilityName}
          </span>
          <Pill tone="brand">{pwsid}</Pill>
        </div>
        <nav aria-label="Report sections" className="flex shrink-0 items-center gap-4">
          {items.map((i) => (
            <a
              key={i.href}
              href={i.href}
              className="whitespace-nowrap text-sm text-ink-600 transition-colors hover:text-brand-700 dark:text-ink-300 dark:hover:text-brand-200"
            >
              {i.label}{" "}
              <span className="font-mono text-xs text-ink-500 dark:text-ink-400">
                ({i.count})
              </span>
            </a>
          ))}
        </nav>
      </Container>
    </div>
  );
}
