import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, Container, Eyebrow, Pill, Section } from "@/components/ui";
import { CONTAMINANTS } from "@/lib/data";
import { formatUnit, formatValue } from "@/lib/format";
import type { ContaminantDefinition } from "@/lib/types";

export const metadata: Metadata = {
  title: "Drinking Water Contaminant Glossary",
  description:
    "A plain-language reference for the drinking water contaminants tracked under the EPA Safe Drinking Water Act — legal limits (MCL), health goals (MCLG), units, and documented health effects for lead, PFAS, arsenic, nitrate, disinfection byproducts, and more.",
  alternates: { canonical: "/contaminants" },
};

function firstSentence(text?: string): string {
  if (!text) return "";
  const match = text.match(/^[^.]*\./);
  return (match ? match[0] : text).trim();
}

function limitText(c: ContaminantDefinition): string {
  const unit = formatUnit(c.unit);
  if (c.mcl == null) return "No federal MCL";
  return `${formatValue(c.mcl, unit)} MCL`;
}

function goalText(c: ContaminantDefinition): string {
  const unit = formatUnit(c.unit);
  if (c.health_goal == null) return "—";
  return c.health_goal === 0 ? "0 (no safe level)" : formatValue(c.health_goal, unit);
}

export default function ContaminantsIndexPage() {
  // Group by category, preserving priority-first ordering within each group.
  const groups = new Map<string, ContaminantDefinition[]>();
  for (const c of CONTAMINANTS) {
    const arr = groups.get(c.category) ?? [];
    arr.push(c);
    groups.set(c.category, arr);
  }
  const ordered = [...groups.entries()].map(
    ([category, items]) =>
      [
        category,
        [...items].sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9)),
      ] as const
  );

  return (
    <>
      <Section className="bg-ink-50 pb-10">
        <Container>
          <div className="max-w-3xl animate-fade-up">
            <Eyebrow>Reference</Eyebrow>
            <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">
              Drinking water contaminant glossary
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-600">
              A plain-language reference for the contaminants regulated under the
              federal Safe Drinking Water Act. Each entry lists the contaminant&rsquo;s
              legal limit, its health goal, the reporting unit, and what long-term
              exposure is associated with — sourced from EPA and state primacy-agency
              documentation.
            </p>
          </div>

          <Card className="mt-8 max-w-3xl p-6">
            <h2 className="text-base font-semibold text-ink-900">
              MCL vs. MCLG — two different numbers
            </h2>
            <dl className="mt-4 space-y-4 text-sm leading-relaxed text-ink-600">
              <div>
                <dt className="font-semibold text-ink-800">
                  MCL — Maximum Contaminant Level
                </dt>
                <dd>
                  The enforceable legal limit a utility may not exceed. It is set as
                  close to the health goal as is feasible given available treatment
                  technology and cost.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-800">
                  MCLG / health goal — Maximum Contaminant Level Goal
                </dt>
                <dd>
                  The non-enforceable level below which there is no known or expected
                  health risk. For carcinogens such as lead, arsenic, and several
                  PFAS, the health goal is <span className="font-mono">0</span> — meaning
                  no exposure is considered risk-free, even when a system is legally
                  compliant.
                </dd>
              </div>
            </dl>
          </Card>
        </Container>
      </Section>

      <Section className="py-14">
        <Container>
          <div className="space-y-14">
            {ordered.map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-ink-900">
                    {category}
                  </h2>
                  <span className="text-sm text-ink-400">
                    {items.length} contaminant{items.length === 1 ? "" : "s"}
                  </span>
                </div>

                <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((c) => (
                    <Card
                      as="li"
                      key={c.code}
                      className="group transition-shadow hover:shadow-lift"
                    >
                      <Link
                        href={`/contaminants/${c.code}`}
                        className="flex h-full flex-col p-6 outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-2xl"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-semibold text-ink-900 group-hover:text-brand-700">
                            {c.name}
                          </h3>
                          <Pill tone="ink">{c.code}</Pill>
                        </div>
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">
                          {firstSentence(c.health_effects)}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <Badge tone="brand">{limitText(c)}</Badge>
                          <span className="text-xs text-ink-500">
                            Goal: {goalText(c)}
                          </span>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
