import { Container, Section, Card, Eyebrow, Badge, Button } from "@/components/ui";
import type { ReactNode } from "react";

type Standard = {
  code: string;
  title: string;
  body: ReactNode;
  tone: "verdant" | "brand" | "ink" | "caution";
  tag: string;
};

const STANDARDS: Standard[] = [
  {
    code: "NSF 42",
    title: "Aesthetic, not health",
    tone: "ink",
    tag: "Taste & odor",
    body: (
      <>
        Reduces chlorine taste, odor, and particulates. It makes water more
        pleasant &mdash; but a 42-only filter is not certified to remove any
        health contaminant.
      </>
    ),
  },
  {
    code: "NSF 53",
    title: "Health contaminants",
    tone: "brand",
    tag: "Lead · VOCs · PFAS",
    body: (
      <>
        The core health standard for point-of-use carbon filters: lead, many
        VOCs, cysts, and (post-P473) PFAS reduction &mdash; verified to defined
        limits.
      </>
    ),
  },
  {
    code: "NSF 58",
    title: "Reverse osmosis",
    tone: "verdant",
    tag: "Nitrate · arsenic · total PFAS",
    body: (
      <>
        Governs reverse-osmosis systems that remove dissolved inorganics carbon
        cannot &mdash; nitrate, arsenic, hexavalent chromium, and total PFAS.
      </>
    ),
  },
  {
    code: "NSF 372",
    title: "Lead-free materials",
    tone: "caution",
    tag: "Often misread",
    body: (
      <>
        Certifies the filter&rsquo;s own materials are lead-free &mdash; a
        manufacturing claim, not a removal claim. It is frequently displayed to
        imply lead removal it does not provide.
      </>
    ),
  },
];

export function EducationTeaser() {
  return (
    <Section id="learn">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>The distinction that drives everything</Eyebrow>
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
            Not all certifications mean what the box implies
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-600">
            The NSF/ANSI standard printed on a filter tells you what it is
            actually proven to do. Confusing an aesthetic or materials standard
            for a health one is the single most common way shoppers overpay for
            protection they don&rsquo;t get.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STANDARDS.map((s) => (
            <Card key={s.code} className="flex flex-col p-6 transition-shadow hover:shadow-lift">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-semibold text-ink-900">
                  {s.code}
                </span>
                <Badge tone={s.tone}>{s.tag}</Badge>
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink-900">
                {s.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">
                {s.body}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href="/registry" variant="primary">
            Explore the Filter Registry
          </Button>
          <Button href="/contaminants" variant="secondary">
            Contaminant glossary
          </Button>
        </div>
      </Container>
    </Section>
  );
}
