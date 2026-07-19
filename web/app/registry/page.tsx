import type { Metadata } from "next";
import { Badge, Card, Container, Eyebrow, Section, Stat } from "@/components/ui";
import { RegistryTable } from "@/components/entities/RegistryTable";
import { buildRegistry, standardTone } from "@/lib/registry";
import { CERTIFICATIONS } from "@/lib/data";
import { standardLabel } from "@/lib/format";
import type { NsfStandard } from "@/lib/types";

export const metadata: Metadata = {
  title: "Filter Certification Registry",
  description:
    "An independent registry of household water filters and the NSF/ANSI standards each one actually holds — distinguishing verified health-reduction certifications (53, 58, 401) from materials-only claims (42, 372) and the retired P473 PFAS standard.",
  alternates: { canonical: "/registry" },
};

const STANDARD_ORDER: NsfStandard[] = ["42", "53", "58", "401", "372", "P473"];

export default function RegistryPage() {
  const entries = buildRegistry();
  const healthCount = entries.filter((e) => e.healthCertified).length;
  const riskCount = entries.filter((e) => e.deceptiveMarketingRisk).length;

  return (
    <>
      <Section className="bg-ink-50 pb-10">
        <Container>
          <div className="max-w-3xl animate-fade-up">
            <Eyebrow>Independent reference</Eyebrow>
            <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">
              Filter Certification Registry
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-600">
              Not every &ldquo;certified&rdquo; filter reduces contaminants. An
              NSF/ANSI certification is only as meaningful as the specific standard
              behind it — and some standards cover only taste or manufacturing
              materials, not health-related reduction. This registry lists every
              filter we track alongside the standards it has actually earned, so a
              materials-only claim can never read as a health claim.
            </p>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <dt className="sr-only">Filters catalogued</dt>
              <dd>
                <Stat value={entries.length} label="Filters catalogued" />
              </dd>
            </div>
            <div>
              <dt className="sr-only">Health-certified</dt>
              <dd>
                <Stat
                  value={healthCount}
                  label="Health-certified"
                  sub="Hold NSF/ANSI 53, 58, or 401"
                />
              </dd>
            </div>
            <div>
              <dt className="sr-only">Materials-only</dt>
              <dd>
                <Stat
                  value={riskCount}
                  label="Materials-only"
                  sub="No verified health reduction"
                />
              </dd>
            </div>
          </dl>
        </Container>
      </Section>

      {/* Standards explainer */}
      <Section className="py-14">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
              What each NSF/ANSI standard actually certifies
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-600">
              The number after &ldquo;NSF/ANSI&rdquo; determines what a filter is
              verified to do. Two of these standards make no health claim at all.
            </p>
          </div>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STANDARD_ORDER.map((s) => {
              const info = CERTIFICATIONS[s];
              const tone = standardTone(s);
              return (
                <Card as="li" key={s} className="flex flex-col p-6">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={tone}>{standardLabel(s)}</Badge>
                    <span className="text-xs font-medium text-ink-500">
                      {info.is_obsolete
                        ? "Retired"
                        : info.is_health
                        ? "Health"
                        : "Materials / aesthetic"}
                    </span>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">
                    {info.description}
                  </p>
                </Card>
              );
            })}
          </ul>

          <Card className="mt-8 border-caution-200 bg-caution-50 p-6">
            <h3 className="text-base font-semibold text-caution-900">
              How &ldquo;lead-free&rdquo; can mislead
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-caution-900">
              A product can hold NSF/ANSI 42 (chlorine, taste, and odor) and NSF/ANSI
              372 (lead-free materials) without ever being tested to reduce a single
              health-related contaminant. NSF/ANSI 372 certifies only that the
              filter&rsquo;s own components contain negligible lead — it is a
              manufacturing-content standard, not a water-treatment claim. Rows below
              flagged &ldquo;materials-only&rdquo; hold these standards and no health
              standard; the label is a factual description of scope, not a judgment of
              the product.
            </p>
          </Card>
        </Container>
      </Section>

      {/* Registry table */}
      <Section className="bg-ink-50 py-14">
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
            The registry
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-600">
            Health-certified filters are listed first. Standards shown in teal are
            health-reduction certifications; standards shown in slate are
            materials-only or aesthetic.
          </p>

          <div className="mt-8">
            <RegistryTable entries={entries} />
          </div>

          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-ink-500">
            Certification data reflects manufacturer listings verified against the
            NSF, WQA, and IAPMO public certification databases. A filter&rsquo;s
            presence in this registry is not an endorsement; inclusion of affiliate
            links never affects how a product is described or ordered.
          </p>
        </Container>
      </Section>
    </>
  );
}
