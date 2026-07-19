import Link from "next/link";
import { Container } from "@/components/ui";
import { Logo } from "./Logo";

const links = [
  { href: "/registry", label: "Filter Registry" },
  { href: "/contaminants", label: "Contaminants" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-600 transition-colors hover:text-brand-700"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/#lookup"
          className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Check my address
        </Link>
      </Container>
    </header>
  );
}
