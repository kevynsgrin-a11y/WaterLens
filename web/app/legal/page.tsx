import type { Metadata } from "next";
import { Container, Section, Card, Eyebrow, Badge } from "@/components/ui";
import { Prose, H2, Lead } from "@/components/institutional/Prose";
import {
  DISCLAIMER_MEDICAL,
  DISCLAIMER_PLUMBING,
  DISCLAIMER_TIER3,
  DISCLAIMER_AFFILIATE,
} from "@/lib/constants";

export function generateMetadata(): Metadata {
  const title = "Legal & disclosures";
  const description =
    "WaterQualityLens disclosures in plain language: our medical, plumbing-limitation, and mapping-confidence disclaimers, our FTC affiliate disclosure, and short Terms and Privacy summaries.";
  return {
    title,
    description,
    alternates: { canonical: "/legal" },
    openGraph: {
      title: `${title} · WaterQualityLens`,
      description,
      type: "article",
    },
  };
}

type Disclosure = {
  id: string;
  n: string;
  heading: string;
  tone: "brand" | "verdant" | "caution" | "ink";
  badge: string;
  text: string;
  context: string;
};

const DISCLOSURES: Disclosure[] = [
  {
    id: "medical",
    n: "01",
    heading: "Medical disclaimer",
    tone: "brand",
    badge: "Not medical advice",
    text: DISCLAIMER_MEDICAL,
    context:
      "We report engineering measurements and hardware certifications — not health verdicts. Nothing here diagnoses exposure or predicts a toxicological outcome. For questions about your health, consult a licensed medical professional.",
  },
  {
    id: "plumbing",
    n: "02",
    heading: "Plumbing-limitation disclaimer",
    tone: "brand",
    badge: "System-level data",
    text: DISCLAIMER_PLUMBING,
    context:
      "Utility data describes the water as it leaves the system, not as it arrives at your faucet. Contamination introduced by your home's own pipes — a legacy lead service line, for instance — is invisible to system-level records. A point-of-use lab test is the only way to see it.",
  },
  {
    id: "mapping",
    n: "03",
    heading: "Mapping-confidence disclaimer",
    tone: "caution",
    badge: "Tier 3 · Modeled",
    text: DISCLAIMER_TIER3,
    context:
      "When an address resolves only to a modeled radius, the underlying map is uncertain — so we say so. Confirm the utility name on your water bill, and consider a lab test before acting on a low-confidence match.",
  },
  {
    id: "affiliate",
    n: "04",
    heading: "FTC affiliate disclosure",
    tone: "verdant",
    badge: "Verified Partner",
    text: DISCLAIMER_AFFILIATE,
    context:
      "Some hardware and lab-test links are affiliate placements, and we may earn a commission. Those links are clearly marked “Verified Partner,” and a product only appears after qualifying on the relevant NSF/ANSI health certification. Commercial ranking never reorders the science.",
  },
];

function toneAccent(tone: Disclosure["tone"]): string {
  switch (tone) {
    case "brand":
      return "before:bg-brand-400";
    case "verdant":
      return "before:bg-verdant-400";
    case "caution":
      return "before:bg-caution-400";
    case "ink":
      return "before:bg-ink-300";
  }
}

export default function LegalPage() {
  return (
    <>
      {/* Hero */}
      <Section className="bg-hero bg-grid">
        <Container>
          <div className="max-w-3xl animate-fade-up">
            <Eyebrow>Legal &amp; disclosures</Eyebrow>
            <h1 className="text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
              What we promise, and what we cannot
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-600">
              Transparency is part of the product, so our disclosures are written
              to be read — not buried. Each one below states the limit plainly and
              explains, in ordinary language, why it exists and what it means for
              you.
            </p>
          </div>
        </Container>
      </Section>

      {/* Disclosures */}
      <Section aria-labelledby="disclosures-h" className="pt-0">
        <Container>
          <h2 id="disclosures-h" className="sr-only">
            Disclaimers and disclosures
          </h2>
          <div className="grid gap-6">
            {DISCLOSURES.map((d) => (
              <Card
                key={d.id}
                as="article"
                className={`relative overflow-hidden p-7 before:absolute before:inset-y-0 before:left-0 before:w-1 sm:p-8 ${toneAccent(
                  d.tone
                )}`}
              >
                <div
                  id={d.id}
                  className="scroll-mt-24"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-ink-300">
                      {d.n}
                    </span>
                    <h3 className="text-xl font-semibold text-ink-900">
                      {d.heading}
                    </h3>
                  </div>
                  <Badge tone={d.tone}>{d.badge}</Badge>
                </div>

                <blockquote className="mt-5 border-l-2 border-ink-200 pl-4 text-base leading-relaxed text-ink-800">
                  {d.text}
                </blockquote>

                <p className="mt-5 max-w-[65ch] text-sm leading-relaxed text-ink-600">
                  {d.context}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Terms summary */}
      <Section id="terms" aria-labelledby="terms-h" className="bg-ink-50">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Eyebrow>Terms of use</Eyebrow>
              <H2 id="terms-h">In short</H2>
              <p className="mt-4 text-sm leading-relaxed text-ink-500">
                A plain-language summary. It describes how the service is meant to
                be used and does not replace formal terms.
              </p>
            </div>
            <Prose>
              <p>
                WaterQualityLens is an informational tool. It aggregates public
                municipal water data and independent product certifications to
                help you understand your water and your filtration options. It is
                provided <strong>as is</strong>, for general information, and does
                not constitute professional, legal, or medical advice.
              </p>
              <ul>
                <li>
                  Use the service for personal, non-commercial research and
                  decision-making about water quality and filtration.
                </li>
                <li>
                  Verify anything consequential — especially a low-confidence
                  match — against your water bill and, where appropriate, a
                  laboratory test.
                </li>
                <li>
                  Data is sourced from third parties and public records; we
                  present it faithfully but cannot guarantee it is complete or
                  free of the source&rsquo;s own errors.
                </li>
              </ul>
            </Prose>
          </div>
        </Container>
      </Section>

      {/* Privacy summary */}
      <Section id="privacy" aria-labelledby="privacy-h">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Eyebrow>Privacy</Eyebrow>
              <H2 id="privacy-h">Anonymous by default</H2>
              <p className="mt-4 text-sm leading-relaxed text-ink-500">
                A plain-language summary of how we treat your data.
              </p>
            </div>
            <Prose>
              <p>
                The core lookup is designed to be used{" "}
                <strong>anonymously</strong>. You do not need an account to check
                an address, and we do not require you to create one to see your
                results.
              </p>
              <ul>
                <li>
                  <strong>No accounts for the core tool.</strong> Looking up an
                  address does not create a profile tied to your identity.
                </li>
                <li>
                  <strong>Address handling.</strong> An address is used to resolve
                  the serving water system and return your report; it is not sold.
                </li>
                <li>
                  <strong>Affiliate links.</strong> When you follow a
                  &ldquo;Verified Partner&rdquo; link, the destination retailer or
                  lab operates under its own privacy practices, not ours.
                </li>
              </ul>
            </Prose>
          </div>
        </Container>
      </Section>
    </>
  );
}
