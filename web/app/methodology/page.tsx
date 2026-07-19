import type { Metadata } from "next";
import { Container, Section, Card, Eyebrow, Badge, Pill } from "@/components/ui";
import { Prose, H2, Lead } from "@/components/institutional/Prose";
import { TierExplainer } from "@/components/institutional/TierExplainer";

export function generateMetadata(): Metadata {
  const title = "Methodology";
  const description =
    "Exactly how WaterQualityLens resolves an address to its public water system, sources contaminant data from EPA SDWIS, and matches only genuinely certified filters to each hazard.";
  return {
    title,
    description,
    alternates: { canonical: "/methodology" },
    openGraph: {
      title: `${title} · WaterQualityLens`,
      description,
      type: "article",
    },
  };
}

const SOURCES: {
  name: string;
  role: string;
  license: string;
  tone: "brand" | "verdant" | "ink";
}[] = [
  {
    name: "EPA Safe Drinking Water Information System (SDWIS)",
    role: "Utility-reported contaminant occurrence, violations, and system inventory, retrieved via the Envirofacts REST API.",
    license: "US Government public domain",
    tone: "brand",
  },
  {
    name: "EPA community water system service-area boundaries",
    role: "The July 2024 release of explicit utility service-area polygons used for Tier 1 point-in-polygon resolution.",
    license: "US Government public domain",
    tone: "brand",
  },
  {
    name: "SimpleLab TEMM spatial layers",
    role: "Tiered Explicit, Match, Model layers that augment boundary coverage for Tier 2 proxy and Tier 3 modeled matches.",
    license: "MIT License (open source)",
    tone: "verdant",
  },
  {
    name: "NSF/ANSI, WQA, and IAPMO certification registries",
    role: "Independent product certifications that back the filter database — curated and quarterly-audited against the source registries.",
    license: "Curated from public certification listings",
    tone: "verdant",
  },
];

const STANDARDS: {
  code: string;
  label: string;
  health: "health" | "aesthetic" | "material" | "retired";
  note: string;
}[] = [
  {
    code: "NSF 53",
    label: "Health effects",
    health: "health",
    note: "Lead, VOCs, chromium, and (post-2022) PFAS. Satisfies a health hazard.",
  },
  {
    code: "NSF 58",
    label: "Reverse osmosis",
    health: "health",
    note: "Dissolved inorganics, arsenic, nitrate, and total PFAS. The only class that satisfies nitrate.",
  },
  {
    code: "NSF 401",
    label: "Emerging compounds",
    health: "health",
    note: "Trace pharmaceuticals and emerging contaminants. Satisfies a health hazard.",
  },
  {
    code: "NSF 42",
    label: "Aesthetic",
    health: "aesthetic",
    note: "Taste, odor, and chlorine — not a health claim. Isolated from hazard matching.",
  },
  {
    code: "NSF 372",
    label: "Lead-free materials",
    health: "material",
    note: "Certifies the device is made of lead-free materials — not that it removes lead.",
  },
  {
    code: "P473",
    label: "Retired 2022",
    health: "retired",
    note: "Folded into NSF 53 and 58; never treated as a standalone qualification.",
  },
];

function healthBadge(kind: (typeof STANDARDS)[number]["health"]) {
  switch (kind) {
    case "health":
      return <Badge tone="verdant">Qualifies</Badge>;
    case "aesthetic":
      return <Badge tone="ink">Aesthetic only</Badge>;
    case "material":
      return <Badge tone="ink">Materials only</Badge>;
    case "retired":
      return <Badge tone="ink">Retired</Badge>;
  }
}

export default function MethodologyPage() {
  return (
    <>
      {/* Hero */}
      <Section className="bg-hero bg-grid pb-8 sm:pb-12">
        <Container>
          <div className="max-w-3xl animate-fade-up">
            <Eyebrow>Methodology</Eyebrow>
            <h1 className="text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
              How we turn a street address into a defensible answer
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-600">
              WaterQualityLens is an auditor, not an advocate. Every result is
              produced by the same deterministic pipeline: resolve the water
              system, read its public record, and match only hardware that is
              independently certified for the specific hazards found. This page
              documents each step and the confidence we attach to it.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <Badge tone="brand">Point-in-polygon resolution</Badge>
              <Badge tone="verdant">Full data provenance</Badge>
              <Badge tone="ink">Constrained set-cover matching</Badge>
            </div>
          </div>
        </Container>
      </Section>

      {/* 1 — Address to PWS */}
      <Section id="resolution" aria-labelledby="resolution-h" className="pt-8 sm:pt-12">
        <Container>
          <div className="max-w-2xl">
            <p className="mb-3 font-mono text-sm font-semibold text-ink-300">
              01
            </p>
            <H2 id="resolution-h">Resolving your address to a water system</H2>
            <Lead className="mt-4">
              The supplier that serves your tap is a geographic fact, not a ZIP
              code. We geocode the address and test it against real utility
              service-area geometry using the three-tier TEMM approach — Tiered
              Explicit, Match, Model.
            </Lead>
          </div>

          <Prose className="mt-6">
            <p>
              First we attempt an <strong>explicit boundary</strong> match: a
              point-in-polygon test that checks whether the geocoded coordinate
              falls inside a published EPA service-area polygon. When it does,
              the serving public water system (PWS) is known with certainty. When
              no polygon covers the point, we fall back to a{" "}
              <strong>matched proxy</strong> — the most probable system inferred
              from TEMM layers and corroborating identifiers — and, only as a
              last resort, to a <strong>modeled radius</strong> that infers the
              likely supplier from nearby systems.
            </p>
            <p>
              Each outcome carries an explicit confidence score, and that score
              is surfaced in the report rather than hidden. We would rather tell
              you a match is uncertain than present a precise-looking answer we
              cannot stand behind.
            </p>
          </Prose>

          <div className="mt-10">
            <TierExplainer />
          </div>

          <Card className="mt-8 flex flex-col gap-3 border-caution-200 bg-caution-50 p-6 sm:flex-row sm:items-start">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-caution-100 text-caution-700"
              aria-hidden="true"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8.5v4.5M12 16h.01"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </span>
            <p className="text-sm leading-relaxed text-caution-900">
              <strong className="font-semibold">A Tier 3 modeled match</strong>{" "}
              is the one case where the map itself is uncertain. Those reports
              open with an amber banner recommending a physical lab test and
              asking you to confirm the utility name printed on your water bill.
            </p>
          </Card>
        </Container>
      </Section>

      {/* 2 — Data sourcing & freshness */}
      <Section id="data" aria-labelledby="data-h" className="bg-ink-50">
        <Container>
          <div className="max-w-2xl">
            <p className="mb-3 font-mono text-sm font-semibold text-ink-300">
              02
            </p>
            <H2 id="data-h">Where the contaminant data comes from</H2>
            <Lead className="mt-4">
              We do not test water or generate our own measurements. We
              faithfully report what your utility has already submitted to the
              federal government — with its origin attached to every value.
            </Lead>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Prose>
              <p>
                Occurrence data is drawn from the{" "}
                <strong>
                  EPA Safe Drinking Water Information System (SDWIS)
                </strong>{" "}
                through the Envirofacts REST API — a US Government public-domain
                source. We ingest updates on a weekly cadence so newly published
                sampling results and violation records appear without long lags.
              </p>
              <p>
                Provenance is a first-class requirement, not a footnote. Every
                contaminant value in a report carries the four facts you need to
                judge it for yourself:
              </p>
              <ul>
                <li>
                  <strong>Sample date</strong> — when the measurement was taken.
                </li>
                <li>
                  <strong>Testing agency</strong> — who reported it.
                </li>
                <li>
                  <strong>Unit</strong> — the measured concentration and its
                  units.
                </li>
                <li>
                  <strong>Legal MCL</strong> — the federal maximum contaminant
                  level for context.
                </li>
              </ul>
              <p>
                A number without its source is not information we are willing to
                show. Where a utility has reported nothing for a contaminant, we
                say so plainly rather than implying absence is proof of safety.
              </p>
            </Prose>

            <div className="flex flex-col gap-4">
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-ink-900">
                  Ingestion at a glance
                </h3>
                <dl className="mt-4 space-y-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-ink-600">Primary source</dt>
                    <dd className="text-right text-sm font-medium text-ink-900">
                      EPA SDWIS
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-ink-600">Access</dt>
                    <dd className="text-right text-sm font-medium text-ink-900">
                      Envirofacts REST API
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-ink-600">Refresh cadence</dt>
                    <dd className="text-right">
                      <Pill tone="verdant">Weekly</Pill>
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-sm text-ink-600">Per-value provenance</dt>
                    <dd className="text-right">
                      <Pill tone="brand">Always shown</Pill>
                    </dd>
                  </div>
                </dl>
              </Card>
              <Card className="border-ink-100 bg-white p-6">
                <p className="text-sm leading-relaxed text-ink-600">
                  Utility data is aggregated at the water-system level. It cannot
                  see the plumbing inside your home — a legacy lead service line,
                  for example. Where that limitation matters, we say so and point
                  to a point-of-use lab test.
                </p>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* 3 — Filter matching */}
      <Section id="matching" aria-labelledby="matching-h">
        <Container>
          <div className="max-w-2xl">
            <p className="mb-3 font-mono text-sm font-semibold text-ink-300">
              03
            </p>
            <H2 id="matching-h">Matching filters to hazards, honestly</H2>
            <Lead className="mt-4">
              Recommending hardware is a coverage problem, not a marketing one.
              We solve a constrained set-cover: find the smallest set of
              genuinely certified products that addresses every health hazard in
              your report — and eliminate anything that only appears to help.
            </Lead>
          </div>

          <Prose className="mt-6">
            <p>
              The constraints are strict, and they are what make the answer
              trustworthy:
            </p>
            <ul>
              <li>
                Only <strong>NSF/ANSI 53, 58, and 401</strong> certifications can
                satisfy a health hazard. A product must carry a relevant
                health-effects certification to be eligible at all.
              </li>
              <li>
                <strong>NSF 42, NSF 372, and the retired P473</strong> are
                isolated from hazard matching. Aesthetic, materials, and obsolete
                certifications never count toward removing a contaminant.
              </li>
              <li>
                <strong>Nitrate is reverse-osmosis only.</strong> Carbon-based
                pitcher, faucet, and under-sink filters cannot remove it; only
                NSF 58 (or specific ion-exchange) systems qualify.
              </li>
              <li>
                <strong>Partial matches are eliminated.</strong> A product that
                covers some but not all of your hazards is not offered as if it
                were a complete solution.
              </li>
            </ul>
            <p>
              The result is a short, defensible set of options in which the
              recommendation follows the data. Commercial considerations never
              reorder scientific fit; a "Verified Partner" affiliate link earns
              its place only after it has qualified on the certification.
            </p>
          </Prose>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                How each certification standard is treated in filter matching
              </caption>
              <thead>
                <tr className="border-b border-ink-200">
                  <th
                    scope="col"
                    className="py-3 pr-4 font-semibold text-ink-900"
                  >
                    Standard
                  </th>
                  <th
                    scope="col"
                    className="py-3 pr-4 font-semibold text-ink-900"
                  >
                    Scope
                  </th>
                  <th
                    scope="col"
                    className="py-3 pr-4 font-semibold text-ink-900"
                  >
                    Treatment
                  </th>
                  <th
                    scope="col"
                    className="py-3 font-semibold text-ink-900"
                  >
                    What it means
                  </th>
                </tr>
              </thead>
              <tbody>
                {STANDARDS.map((s) => (
                  <tr
                    key={s.code}
                    className="border-b border-ink-100 align-top"
                  >
                    <td className="py-4 pr-4">
                      <Pill tone={s.health === "health" ? "verdant" : "ink"}>
                        {s.code}
                      </Pill>
                    </td>
                    <td className="py-4 pr-4 text-ink-700">{s.label}</td>
                    <td className="py-4 pr-4">{healthBadge(s.health)}</td>
                    <td className="py-4 text-ink-600">{s.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      {/* 4 — Data & licensing */}
      <Section id="sources" aria-labelledby="sources-h" className="bg-ink-50">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>Data &amp; licensing</Eyebrow>
            <H2 id="sources-h">The sources behind every report</H2>
            <Lead className="mt-4">
              We build on public, auditable data and open standards. Here is
              exactly what powers the product and how each source is licensed.
            </Lead>
          </div>

          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {SOURCES.map((src) => (
              <Card as="li" key={src.name} className="flex flex-col p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-semibold text-ink-900">
                    {src.name}
                  </h3>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">
                  {src.role}
                </p>
                <div className="mt-5">
                  <Badge tone={src.tone}>{src.license}</Badge>
                </div>
              </Card>
            ))}
          </ul>

          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-ink-500">
            Address-to-system mapping uses the July 2024 EPA community water
            system service-area boundaries, augmented by SimpleLab&rsquo;s
            open-source TEMM layers. Certification data is curated from the
            NSF/ANSI, WQA, and IAPMO registries and audited quarterly. We report
            municipal engineering data only; WaterQualityLens is not a medical
            device.
          </p>
        </Container>
      </Section>
    </>
  );
}
