import { Container, Section, Card, Badge, IconTile, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import type { ReactNode } from "react";

function PinIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s-6.5-5.7-6.5-10.2A6.5 6.5 0 0 1 18.5 10.8C18.5 15.3 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3h9l3 3v15H6V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12h6M9 15.5h6M9 8.5h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

type Step = {
  n: string;
  title: ReactNode;
  body: ReactNode;
  icon: ReactNode;
  tag: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "Enter your address",
    icon: <PinIcon />,
    tag: "Point-in-polygon",
    body: (
      <>
        We geocode your address and resolve the public water system that serves
        it using TEMM utility-boundary polygons &mdash; not a ZIP code. Every
        match is graded on a three-tier confidence scale, so you always know how
        certain the result is.
      </>
    ),
  },
  {
    n: "02",
    title: "See your utility’s reported contaminants",
    icon: <ReportIcon />,
    tag: "Full provenance",
    body: (
      <>
        We surface the contaminants your utility has reported to the EPA, each
        shown with its sample date, testing agency, unit, and the legal maximum
        contaminant level (MCL). Every number carries its source &mdash; no naked
        figures, no proprietary scores.
      </>
    ),
  },
  {
    n: "03",
    title: "Get the exact certified filters",
    icon: <FilterIcon />,
    tag: "SKU-level",
    body: (
      <>
        We match the specific retail filter SKUs that hold independent NSF/ANSI
        certification for your contaminants &mdash; and flag the standards that
        don&rsquo;t apply, like carbon filters that cannot remove nitrate. The
        recommendation follows the data, never the other way around.
      </>
    ),
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" tone="sunken">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="From an address to a verified answer in three steps"
            lede="The same deterministic pipeline runs for every address: identify the system, read the record, match the hardware. No account, no upsell in the way of the data."
          />
        </Reveal>

        <Reveal delay={80}>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <Card as="li" key={step.n} className="flex flex-col p-7">
                <div className="flex items-center justify-between">
                  <IconTile>{step.icon}</IconTile>
                  <span className="font-mono text-sm font-semibold text-ink-500 dark:text-ink-400">
                    {step.n}
                  </span>
                </div>
                <h3 className="mt-5 text-title-2 text-ink-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                  {step.body}
                </p>
                <div className="mt-5">
                  <Badge tone="brand">{step.tag}</Badge>
                </div>
              </Card>
            ))}
          </ol>
        </Reveal>
      </Container>
    </Section>
  );
}
