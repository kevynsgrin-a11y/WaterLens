import Link from "next/link";
import { Container } from "@/components/ui";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/registry", label: "Filter Registry" },
  { href: "/contaminants", label: "Contaminants" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface-base/85 backdrop-blur">
      <Container className="relative flex h-16 items-center justify-between gap-3">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-600 transition-colors hover:text-brand-700 dark:text-ink-300 dark:hover:text-brand-200"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />

          {/* Full label from sm up; a compact icon button below it, so the CTA
              can never wrap into the wordmark on a narrow phone. */}
          <Link
            href="/#lookup"
            className="hidden whitespace-nowrap rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-brand-700 active:scale-[0.97] motion-reduce:active:scale-100 sm:inline-flex dark:bg-brand-500 dark:hover:bg-brand-400"
          >
            Check my water
          </Link>
          <Link
            href="/#lookup"
            aria-label="Check my water"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 sm:hidden dark:bg-brand-500"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 21s-6.5-5.7-6.5-10.2A6.5 6.5 0 0 1 18.5 10.8C18.5 15.3 12 21 12 21Z"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle cx="12" cy="10.5" r="2.4" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </Link>

          <MobileNav links={links} />
        </div>
      </Container>
    </header>
  );
}
