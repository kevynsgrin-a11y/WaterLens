import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Container,
  Eyebrow,
  Pill,
  Section,
  Stat,
} from "@/components/ui";
import {
  CONTAMINANTS,
  CONTAMINANT_BY_CODE,
  FILTER_BY_ID,
  FILTER_CLAIMS,
} from "@/lib/data";
import { HEALTH_STANDARDS, NITRATE_CODES, NITRATE_WARNING } from "@/lib/constants";
import { FORM_FACTOR_LABEL, formatUnit, formatValue, standardLabel, usd } from "@/lib/format";
import type { ContaminantDefinition, Filter, NsfStandard } from "@/lib/types";

export const dynamicParams = false;

const HEALTH = new Set<string>(HEALTH_STANDARDS);

export function generateStaticParams() {
  return CONTAMINANTS.map((c) => ({ code: c.code }));
}

interface VerifiedFilter {
  filter: Filter;
  standards: NsfStandard[];
  certifiers: string[];
}

/** Filters holding a verified HEALTH-standard claim for this contaminant. */
function verifiedFiltersFor(code: string): VerifiedFilter[] {
  const byFilter = new Map<number, { standards: Set<NsfStandard>; certifiers: Set<string> }>();
  for (const claim of FILTER_CLAIMS) {
    if (claim.contaminant_code !== code || !claim.verified) continue;
    if (!HEALTH.has(claim.standard)) continue;
    const entry = byFilter.get(claim.filter_id) ?? {
      standards: new Set<NsfStandard>(),
      certifiers: new Set<string>(),
    };
    entry.standards.add(claim.standard);
    entry.certifiers.add(claim.certifier);
    byFilter.set(claim.filter_id, entry);
  }

  const out: VerifiedFilter[] = [];
  for (const [filterId, entry] of byFilter) {
    const filter = FILTER_BY_ID.get(filterId);
    if (!filter || !filter.active) continue;
    out.push({
      filter,
      standards: [...entry.standards].sort(),
      certifiers: [...entry.certifiers].sort(),
    });
  }
  // Broadest certification first, then price ascending.
  return out.sort(
    (a, b) =>
      b.standards.length - a.standards.length ||
      (a.filter.price_usd ?? Infinity) - (b.filter.price_usd ?? Infinity)
  );
}

function unitLabel(c: ContaminantDefinition): string {
  return formatUnit(c.unit);
}

export function generateMetadata({
  params,
}: {
  params: { code: string };
}): Metadata {
  const c = CONTAMINANT_BY_CODE.get(params.code.toUpperCase());
  if (!c) {
    return { title: "Contaminant not found", robots: { index: false, follow: true } };
  }
  const unit = unitLabel(c);
  const limit =
    c.mcl != null ? `federal MCL ${formatValue(c.mcl, unit)}` : "no federal MCL set";
  const description = `${c.name} in drinking water — ${limit}, health goal ${
    c.health_goal === 0 ? "0 (no safe level)" : c.health_goal != null ? formatValue(c.health_goal, unit) : "not set"
  }, and the NSF/ANSI-certified filters independently verified to reduce it.`;

  return {
    title: `${c.name} in Drinking Water`,
    description,
    alternates: { canonical: `/contaminants/${c.code}` },
    openGraph: { title: `${c.name} in Drinking Water · WaterQualityLens`, description },
  };
}

export default function ContaminantPage({ params }: { params: { code: string } }) {
  const c = CONTAMINANT_BY_CODE.get(params.code.toUpperCase());
  if (!c) notFound();

  const unit = unitLabel(c);
  const verified = verifiedFiltersFor(c.code);
  const isNitrate = NITRATE_CODES.has(c.code);

  return (
    <>
      <Section className="bg-ink-50 pb-10">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-500">
            <Link href="/contaminants" className="hover:text-brand-700">
              Contaminant glossary
            </Link>
            <span className="mx-2 text-ink-300">/</span>
            <span className="text-ink-700">{c.name}</span>
          </nav>

          <div className="max-w-3xl animate-fade-up">
            <div className="flex items-center gap-3">
              <Eyebrow>{c.category}</Eyebrow>
              <Pill tone="ink">{c.code}</Pill>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">
              {c.name}
            </h1>
            {c.health_effects ? (
              <p className="mt-5 text-base leading-relaxed text-ink-600">
                {c.health_effects}
              </p>
            ) : null}
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <dt className="sr-only">Maximum contaminant level</dt>
              <dd>
                <Stat
                  value={c.mcl != null ? formatValue(c.mcl, unit) : "None"}
                  label="Legal MCL"
                  sub="Enforceable federal limit"
                />
              </dd>
            </div>
            <div>
              <dt className="sr-only">Health goal</dt>
              <dd>
                <Stat
                  value={
                    c.health_goal != null ? formatValue(c.health_goal, unit) : "—"
                  }
                  label="Health goal (MCLG)"
                  sub={c.health_goal === 0 ? "No safe exposure level" : "No known health risk"}
                />
              </dd>
            </div>
            <div>
              <dt className="sr-only">Category</dt>
              <dd>
                <Stat value={<span className="text-2xl">{c.category}</span>} label="Category" />
              </dd>
            </div>
            <div>
              <dt className="sr-only">Reporting unit</dt>
              <dd>
                <Stat value={<span className="text-2xl">{unit}</span>} label="Reporting unit" />
              </dd>
            </div>
          </dl>
        </Container>
      </Section>

      {isNitrate ? (
        <Section className="py-8">
          <Container>
            <Card className="border-caution-200 bg-caution-50 p-6">
              <div className="flex items-center gap-2">
                <Badge tone="caution">Reverse osmosis required</Badge>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-caution-900">
                {NITRATE_WARNING}
              </p>
            </Card>
          </Container>
        </Section>
      ) : null}

      <Section className={isNitrate ? "pt-6 pb-14" : "py-14"}>
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>Certified reduction</Eyebrow>
            <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
              Filters verified to reduce {c.name}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-600">
              These filters hold an independent NSF/ANSI <strong>health</strong>{" "}
              certification (Standard 53, 58, or 401) specifically for {c.name}.
              Certification against a health standard means an accredited lab verified
              the filter reduces this contaminant — a materials-only claim such as NSF
              42 or 372 does not.
            </p>
          </div>

          {verified.length > 0 ? (
            <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {verified.map(({ filter, standards, certifiers }) => (
                <Card as="li" key={filter.id} className="flex flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-brand-700">
                        {filter.brand}
                      </div>
                      <h3 className="text-lg font-semibold text-ink-900">
                        {filter.model}
                      </h3>
                    </div>
                    <Badge tone="verdant">Verified Partner</Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Pill tone="ink">{filter.sku}</Pill>
                    <span className="text-sm text-ink-600">
                      {FORM_FACTOR_LABEL[filter.form_factor]}
                    </span>
                    <span className="font-mono text-sm font-semibold text-ink-900">
                      {usd(filter.price_usd)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {standards.map((s) => (
                      <Badge key={s} tone="verdant">
                        {standardLabel(s)}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-ink-500">
                    Certified by {certifiers.join(", ")}
                  </p>

                  {filter.affiliate_url ? (
                    <div className="mt-5 pt-1">
                      <Button
                        href={filter.affiliate_url}
                        variant="secondary"
                        className="w-full"
                      >
                        View at retailer
                      </Button>
                    </div>
                  ) : null}
                </Card>
              ))}
            </ul>
          ) : (
            <Card className="mt-8 p-6">
              <p className="text-sm leading-relaxed text-ink-600">
                No filter in our registry currently holds an independent NSF/ANSI
                health certification specifically for {c.name}.{" "}
                {isNitrate
                  ? "Reverse-osmosis systems certified to NSF/ANSI 58 are the appropriate treatment; see the registry for RO options."
                  : "For contaminants without a certified point-of-use option, treatment at the utility level or a physical lab test is the appropriate next step."}
              </p>
              <div className="mt-4">
                <Button href="/registry" variant="secondary">
                  Browse the Filter Certification Registry →
                </Button>
              </div>
            </Card>
          )}

          <p className="mt-8 max-w-3xl text-xs leading-relaxed text-ink-500">
            Hardware links are affiliate placements marked &ldquo;Verified
            Partner.&rdquo; Products appear here solely because they hold an
            independently verified NSF/ANSI health certification for {c.name};
            commercial arrangements never affect this list.
          </p>
        </Container>
      </Section>
    </>
  );
}
