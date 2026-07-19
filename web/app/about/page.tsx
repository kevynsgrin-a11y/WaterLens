import type { Metadata } from "next";
import { Container, Section, Card, Eyebrow, Badge } from "@/components/ui";
import { Prose, H2, Lead } from "@/components/institutional/Prose";

export function generateMetadata(): Metadata {
  const title = "About";
  const description =
    "WaterQualityLens exists to close the trust gap between municipal water data and the people who drink it — an objective, vendor-agnostic auditor, not an alarmist advocacy group or a hardware vendor.";
  return {
    title,
    description,
    alternates: { canonical: "/about" },
    openGraph: {
      title: `${title} · WaterQualityLens`,
      description,
      type: "article",
    },
  };
}

const IS: string[] = [
  "An objective, vendor-agnostic auditor of public water data",
  "A faithful reader of what utilities already report to the EPA",
  "Transparent about confidence, provenance, and every recommendation",
];

const IS_NOT: string[] = [
  "A medical tool — we do not diagnose exposure or predict health outcomes",
  "An alarmist advocacy group trading on fear",
  "A hardware vendor — we sell no filters of our own",
];

const AUDIENCES: { group: string; who: string; need: string }[] = [
  {
    group: "Households making a decision",
    who: "Parents, expecting families, and renters",
    need: "A clear, non-alarmist read on what is in the water and which certified filter — if any — actually addresses it.",
  },
  {
    group: "Property professionals",
    who: "Homebuyers, realtors, and property managers",
    need: "Defensible, address-level documentation with provenance they can share and stand behind during a transaction.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <Section className="bg-hero bg-grid">
        <Container>
          <div className="max-w-3xl animate-fade-up">
            <Eyebrow>About</Eyebrow>
            <h1 className="text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
              Closing the trust gap between water data and the people who drink
              it
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-600">
              The information needed to understand your tap water already exists
              — it is just buried in federal databases, written for engineers,
              and surrounded by companies with something to sell. We translate
              that public record into a clear, honest answer, and we do it
              without selling you the hardware.
            </p>
          </div>
        </Container>
      </Section>

      {/* Mission */}
      <Section id="mission" aria-labelledby="mission-h" className="pt-0">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <H2 id="mission-h">Our mission</H2>
            </div>
            <Prose>
              <p>
                Utilities test their water and report the results to the EPA. In
                principle, anyone can look those results up. In practice, the
                data lives in systems most people will never open, in a format
                that assumes you already understand maximum contaminant levels,
                sampling regimes, and certification standards.
              </p>
              <p>
                WaterQualityLens exists to close that gap. We take the same
                public municipal data and present it plainly — every value with
                its source, every uncertainty labeled, every recommendation
                traceable to an independent certification. Our measure of success
                is simple: you leave knowing more than you did, and trusting that
                what you were told is exactly what the record says.
              </p>
            </Prose>
          </div>
        </Container>
      </Section>

      {/* What we are / are not */}
      <Section id="what-we-are" aria-labelledby="what-we-are-h" className="bg-ink-50">
        <Container>
          <div className="max-w-2xl">
            <H2 id="what-we-are-h">What we are — and what we are not</H2>
            <Lead className="mt-4">
              Objectivity is easier to claim than to keep. These boundaries are
              how we hold ourselves to it.
            </Lead>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card className="p-7">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-verdant-50 text-verdant-600"
                  aria-hidden="true"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="m5 12.5 4.5 4.5L19 7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h3 className="text-lg font-semibold text-ink-900">We are</h3>
              </div>
              <ul className="mt-5 space-y-3">
                {IS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-relaxed text-ink-700"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-verdant-500"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-7">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-ink-500"
                  aria-hidden="true"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 12h10"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <h3 className="text-lg font-semibold text-ink-900">
                  We are not
                </h3>
              </div>
              <ul className="mt-5 space-y-3">
                {IS_NOT.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-relaxed text-ink-700"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Audiences */}
      <Section id="audiences" aria-labelledby="audiences-h">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>Who we serve</Eyebrow>
            <H2 id="audiences-h">Built for people making real decisions</H2>
            <Lead className="mt-4">
              Different people arrive with different stakes. The data is the same;
              what changes is why it matters.
            </Lead>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {AUDIENCES.map((a) => (
              <Card key={a.group} className="flex flex-col p-7">
                <Badge tone="brand">{a.group}</Badge>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">
                  {a.who}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">
                  {a.need}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Editorial independence */}
      <Section
        id="independence"
        aria-labelledby="independence-h"
        className="bg-ink-50"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Eyebrow>Editorial independence</Eyebrow>
              <H2 id="independence-h">Our commitment</H2>
            </div>
            <Prose>
              <p>
                We fund the product through contextual affiliate hardware links
                and lab-test referrals — and we keep those revenues from ever
                touching the science. Affiliate placements are clearly marked{" "}
                <strong>&ldquo;Verified Partner&rdquo;</strong>, and a product
                can only appear after it has independently qualified on the
                relevant NSF/ANSI health certification for a detected
                contaminant. Commercial ranking never overrides the data.
              </p>
              <p>
                Display advertising is restricted, and it never appears between
                the address input and the data it returns. The path from your
                question to the objective answer stays clear of anything we are
                paid to show. If a recommendation would not survive scrutiny on
                the certification alone, it does not run.
              </p>
            </Prose>
          </div>
        </Container>
      </Section>
    </>
  );
}
