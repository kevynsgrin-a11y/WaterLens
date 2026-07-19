import { Container, Section, Stat, Card, Eyebrow } from "@/components/ui";
import { CONTAMINANTS, FILTERS } from "@/lib/data";

const STATS: { value: string; label: string; sub: string }[] = [
  {
    value: `${CONTAMINANTS.length}`,
    label: "Regulated contaminants tracked",
    sub: "Metals, PFAS, VOCs, DBPs, nitrate & more",
  },
  {
    value: "5",
    label: "NSF/ANSI standards audited",
    sub: "42 · 53 · 58 · 401 · 372 — kept distinct",
  },
  {
    value: `${FILTERS.length}`,
    label: "Verified filter SKUs",
    sub: "Certification checked per contaminant",
  },
  {
    value: "3-tier",
    label: "Address-mapping confidence",
    sub: "Explicit, matched or modeled — always labeled",
  },
];

export function CoverageStats() {
  return (
    <Section id="coverage" className="bg-ink-50">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>Coverage &amp; rigor</Eyebrow>
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
            Grounded in public data and independent standards
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-600">
            Every figure below is verifiable. We track regulated contaminants,
            audit the NSF/ANSI standards that actually govern removal, and grade
            each address match on a transparent confidence scale.
          </p>
        </div>

        <Card className="mt-10 p-8 sm:p-10">
          <ul className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((s) => (
              <li key={s.label}>
                <Stat value={s.value} label={s.label} sub={s.sub} />
              </li>
            ))}
          </ul>
        </Card>
      </Container>
    </Section>
  );
}
