import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export interface Crumb {
  label: string;
  /** Omit on the final crumb — it is the current page. */
  href?: string;
}

/**
 * Breadcrumb trail plus the matching BreadcrumbList JSON-LD, built from one
 * array so the visible trail and the structured data can never disagree.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${SITE_URL}${c.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center text-sm text-ink-500 dark:text-ink-400">
          {items.map((c, i) => (
            <li key={c.label} className="flex items-center">
              {i > 0 ? (
                <span aria-hidden="true" className="mx-2 text-ink-400 dark:text-ink-500">
                  /
                </span>
              ) : null}
              {c.href ? (
                <Link
                  href={c.href}
                  className="transition-colors hover:text-brand-700 dark:hover:text-brand-200"
                >
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink-700 dark:text-ink-200">
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
