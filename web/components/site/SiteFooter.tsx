import Link from "next/link";
import { Container } from "@/components/ui";
import { Logo } from "./Logo";
import { DISCLAIMER_MEDICAL } from "@/lib/constants";

const groups = [
  {
    title: "Product",
    links: [
      { href: "/#lookup", label: "Address lookup" },
      { href: "/registry", label: "Filter Certification Registry" },
      { href: "/contaminants", label: "Contaminant glossary" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/methodology", label: "Methodology" },
      { href: "/about", label: "About" },
      { href: "/legal", label: "Legal & disclosures" },
    ],
  },
  {
    title: "Data sources",
    links: [
      { href: "/methodology#sources", label: "EPA SDWIS / Envirofacts" },
      { href: "/methodology#sources", label: "TEMM service boundaries" },
      { href: "/registry", label: "NSF / WQA certifications" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              Address-level water quality intelligence — objective municipal data
              matched to independently certified filtration.
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="text-sm font-semibold text-ink-900">{g.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-500 transition-colors hover:text-brand-700"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-ink-100 pt-8">
          <p className="max-w-3xl text-xs leading-relaxed text-ink-400">
            {DISCLAIMER_MEDICAL}
          </p>
          <div className="mt-4 flex flex-col justify-between gap-2 text-xs text-ink-400 sm:flex-row">
            <span>© {new Date().getFullYear()} WaterQualityLens. All rights reserved.</span>
            <span>
              Some hardware links are affiliate placements, clearly marked
              “Verified Partner.” Commercial ranking never overrides data.
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
