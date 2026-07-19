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
  Tooltip,
} from "@/components/ui";
import { TrendLine } from "@/components/entities/TrendLine";
import { demoProfile } from "@/lib/lookup";
import { matchFilters } from "@/lib/engine";
import { CONTAMINANT_BY_CODE, contaminantName, DEMO_SYSTEMS } from "@/lib/data";
import {
  FORM_FACTOR_LABEL,
  formatDate,
  formatUnit,
  formatValue,
  standardLabel,
  usd,
} from "@/lib/format";
import { DISCLAIMER_AFFILIATE, DISCLAIMER_PLUMBING } from "@/lib/constants";
import type { Detection, RecommendedFilter, Violation } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return DEMO_SYSTEMS.map((d) => ({ pwsid: d.system.pwsid }));
}

const SOURCE_LABEL: Record<string, string> = {
  SW: "Surface water",
  GW: "Groundwater",
  GU: "Groundwater under surface influence",
};

interface Assessment {
  exceedances: Detection[];
  recommendations: RecommendedFilter[];
  indexable: boolean;
}

function assess(profile: NonNullable<ReturnType<typeof demoProfile>>): Assessment {
  const exceedances = profile.detections.filter((d) => d.exceeds_mcl);
  const recommendations = matchFilters(profile.detections, "UNKNOWN");
  const indexable =
    exceedances.length > 0 &&
    profile.history.length > 0 &&
    recommendations.length >= 3;
  return { exceedances, recommendations, indexable };
}

// --- Metadata ---------------------------------------------------------------

export function generateMetadata({
  params,
}: {
  params: { pwsid: string };
}): Metadata {
  const profile = demoProfile(params.pwsid.toUpperCase());
  if (!profile) {
    return { title: "Water system not found", robots: { index: false, follow: true } };
  }

  const u = profile.utility;
  const place = [u.county ? `${u.county} County` : null, u.state].filter(Boolean).join(", ");
  const { exceedances, indexable } = assess(profile);
  const headline = exceedances[0]
    ? `${exceedances[0].name} reported at ${formatValue(
        exceedances[0].value,
        formatUnit(exceedances[0].unit)
      )}`
    : "reported contaminant levels";

  const title = `${u.name} Water Quality (${u.pwsid})`;
  const description = `Contaminants reported by ${u.name}${
    place ? ` in ${place}` : ""
  } to the EPA — ${headline}, each with its sample date, testing agency, and legal limit, plus the specific NSF/ANSI-certified filters proven to reduce them.`;

  return {
    title,
    description,
    alternates: { canonical: `/pws/${u.pwsid}` },
    openGraph: { title: `${title} · WaterQualityLens`, description },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
  };
}

// --- Local presentational pieces --------------------------------------------

function statusBadge(d: Detection) {
  if (d.exceeds_mcl) return <Badge tone="caution">Above MCL</Badge>;
  if (d.exceeds_health_goal) return <Badge tone="brand">Above health goal</Badge>;
  return <Badge tone="verdant">Within limits</Badge>;
}

function ContaminantRow({ d }: { d: Detection }) {
  const unit = formatUnit(d.unit);
  return (
    <tr className="border-b border-ink-100 align-top last:border-0">
      <th scope="row" className="px-5 py-4 font-normal">
        {d.health_effects ? (
          <Tooltip content={d.health_effects}>
            <span className="font-semibold text-ink-900">{d.name}</span>
          </Tooltip>
        ) : (
          <span className="font-semibold text-ink-900">{d.name}</span>
        )}
        <div className="mt-1 text-xs text-ink-500">{d.category}</div>
      </th>
      <td className="px-5 py-4">
        <div className="font-mono text-sm font-semibold text-ink-900">
          {formatValue(d.value, unit)}
        </div>
        {statusBadge(d)}
      </td>
      <td className="px-5 py-4 font-mono text-sm text-ink-700">
        {d.mcl != null ? formatValue(d.mcl, unit) : "No federal MCL"}
      </td>
      <td className="px-5 py-4 font-mono text-sm text-ink-700">
        {d.health_goal != null ? formatValue(d.health_goal, unit) : "—"}
      </td>
      <td className="px-5 py-4 text-sm text-ink-700">{formatDate(d.sample_date)}</td>
      <td className="px-5 py-4 text-sm text-ink-700">
        {d.sampling_agency ?? "—"}
        <div className="mt-0.5 text-xs text-ink-400">{d.source}</div>
      </td>
    </tr>
  );
}

function ViolationCard({ v }: { v: Violation }) {
  const name = v.contaminant_code ? contaminantName(v.contaminant_code) : "General compliance";
  return (
    <Card as="li" className="p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={v.is_health_based ? "caution" : "ink"}>
          {v.is_health_based ? "Health-based" : "Monitoring"}
        </Badge>
        <Badge tone="ink">{v.violation_category}</Badge>
        <Pill tone="ink">{v.violation_id}</Pill>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-ink-900">{name}</h3>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-ink-500">Began</dt>
          <dd className="font-medium text-ink-800">{formatDate(v.begin_date)}</dd>
        </div>
        <div>
          <dt className="text-ink-500">Status</dt>
          <dd className="font-medium text-ink-800">{v.status ?? "—"}</dd>
        </div>
      </dl>
    </Card>
  );
}

function RecommendationCard({ r }: { r: RecommendedFilter }) {
  return (
    <Card as="li" className="flex flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-brand-700">{r.brand}</div>
          <h3 className="text-lg font-semibold text-ink-900">{r.model}</h3>
        </div>
        <Badge tone="verdant">Verified Partner</Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill tone="ink">{r.sku}</Pill>
        <span className="text-sm text-ink-600">{FORM_FACTOR_LABEL[r.form_factor]}</span>
        <span className="font-mono text-sm font-semibold text-ink-900">
          {usd(r.price_usd)}
        </span>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Certified to reduce
        </div>
        <p className="mt-1 text-sm text-ink-700">
          {r.neutralizes.map((c) => contaminantName(c)).join(", ")}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {r.certified_standards.map((s) => (
            <Badge key={s} tone="verdant">
              {standardLabel(s)}
            </Badge>
          ))}
        </div>
      </div>

      {r.affiliate_url ? (
        <div className="mt-5 pt-1">
          <Button href={r.affiliate_url} variant="secondary" className="w-full">
            View at retailer
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

// --- Page -------------------------------------------------------------------

export default function PwsPage({ params }: { params: { pwsid: string } }) {
  const profile = demoProfile(params.pwsid.toUpperCase());
  if (!profile) notFound();

  const u = profile.utility;
  const { exceedances, recommendations } = assess(profile);
  const place = [u.county ? `${u.county} County` : null, u.state].filter(Boolean).join(", ");

  // History grouped by contaminant, latest-heavy series first.
  const historyByCode = new Map<string, typeof profile.history>();
  for (const h of profile.history) {
    const arr = historyByCode.get(h.code) ?? [];
    arr.push(h);
    historyByCode.set(h.code, arr);
  }
  const trends = [...historyByCode.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <>
      {/* Header */}
      <Section className="bg-ink-50 pb-10">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-500">
            <Link href="/" className="hover:text-brand-700">
              Home
            </Link>
            <span className="mx-2 text-ink-300">/</span>
            <span className="text-ink-700">Water systems</span>
          </nav>

          <div className="animate-fade-up">
            <Eyebrow>Public water system</Eyebrow>
            <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">
              {u.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
              Contaminants this utility reported to the EPA Safe Drinking Water
              Information System, shown with full provenance — sample date, testing
              agency, unit, and the legal maximum contaminant level. Data reflects
              utility-level reporting and cannot detect contamination introduced by
              your home&rsquo;s own plumbing.
            </p>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <dt className="sr-only">PWSID</dt>
              <dd>
                <Stat value={<span className="text-2xl">{u.pwsid}</span>} label="EPA system ID" />
              </dd>
            </div>
            <div>
              <dt className="sr-only">Location</dt>
              <dd>
                <Stat value={<span className="text-2xl">{u.state ?? "—"}</span>} label={place || "Location"} />
              </dd>
            </div>
            <div>
              <dt className="sr-only">Population served</dt>
              <dd>
                <Stat
                  value={u.population_served ? u.population_served.toLocaleString("en-US") : "—"}
                  label="Population served"
                />
              </dd>
            </div>
            <div>
              <dt className="sr-only">Primary source</dt>
              <dd>
                <Stat
                  value={
                    <span className="text-2xl">
                      {u.primary_source ?? "—"}
                    </span>
                  }
                  label="Primary source"
                  sub={u.primary_source ? SOURCE_LABEL[u.primary_source] : undefined}
                />
              </dd>
            </div>
          </dl>

          <p className="mt-8 text-xs text-ink-500">
            Data as of {formatDate(profile.fetched_at)} · Source: EPA SDWIS / state
            primacy agency
          </p>
        </Container>
      </Section>

      {/* Reported contaminants */}
      <Section id="contaminants" className="py-14">
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
            Reported contaminants
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-600">
            Every value is compared against its federal maximum contaminant level
            (MCL) — the enforceable legal limit — and its health goal (MCLG), the
            level at which no known health effects occur. Hover a contaminant name
            for its documented health effects.
          </p>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-ink-100 shadow-card">
            <table className="w-full min-w-[52rem] border-collapse bg-white text-left">
              <caption className="sr-only">
                Contaminants reported by {u.name}, with measured value, legal MCL,
                health goal, sample date, and testing agency.
              </caption>
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/70">
                  {["Contaminant", "Reported value", "Legal MCL", "Health goal (MCLG)", "Sampled", "Agency"].map(
                    (h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink-500"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {profile.detections.map((d) => (
                  <ContaminantRow key={d.code} d={d} />
                ))}
              </tbody>
            </table>
          </div>

          {exceedances.length > 0 ? (
            <p className="mt-4 text-sm text-ink-600">
              {exceedances.length} contaminant{exceedances.length === 1 ? "" : "s"}{" "}
              exceeded the federal MCL in the most recent reporting period.
            </p>
          ) : (
            <p className="mt-4 text-sm text-ink-600">
              No reported contaminant exceeded its federal MCL in the most recent
              reporting period.
            </p>
          )}
        </Container>
      </Section>

      {/* Trends */}
      {trends.length > 0 ? (
        <Section id="trends" className="bg-ink-50 py-14">
          <Container>
            <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
              Sampling trends over time
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-600">
              How reported concentrations have moved across recent sampling
              periods. The dashed amber line marks the federal MCL for reference.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {trends.map(([code, series]) => {
                const def = CONTAMINANT_BY_CODE.get(code);
                const name = def?.name ?? code;
                const unit = series[0]?.unit ?? def?.unit ?? "";
                return (
                  <Card key={code} className="p-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-lg font-semibold text-ink-900">{name}</h3>
                      <span className="text-xs font-medium text-ink-500">
                        {formatUnit(unit)}
                      </span>
                    </div>
                    <div className="mt-4">
                      <TrendLine
                        points={series.map((s) => ({
                          sample_date: s.sample_date,
                          value: s.value,
                        }))}
                        unit={unit}
                        label={name}
                        mcl={def?.mcl ?? null}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Active violations */}
      {profile.violations.length > 0 ? (
        <Section id="violations" className="py-14">
          <Container>
            <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
              Active violations
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-600">
              Formal violations this system has on record with its state primacy
              agency. Health-based violations concern contaminant levels; monitoring
              violations concern reporting or testing procedure.
            </p>
            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              {profile.violations.map((v) => (
                <ViolationCard key={v.violation_id} v={v} />
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <Section id="filters" className="bg-ink-50 py-14">
          <Container>
            <div className="max-w-2xl">
              <Eyebrow>Certified filtration</Eyebrow>
              <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
                Filters certified for these contaminants
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink-600">
                Each filter below holds independent NSF/ANSI health certification
                for every contaminant this system reported above its health goal.
                Products are surfaced by certification match, not commercial
                arrangement.
              </p>
            </div>

            <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((r) => (
                <RecommendationCard key={r.id} r={r} />
              ))}
            </ul>

            <p className="mt-8 max-w-3xl text-xs leading-relaxed text-ink-500">
              {DISCLAIMER_AFFILIATE}
            </p>
          </Container>
        </Section>
      ) : null}

      {/* Plumbing disclaimer */}
      <Section className="py-14">
        <Container>
          <Card className="border-brand-100 bg-brand-50/50 p-6">
            <h2 className="text-base font-semibold text-ink-900">
              A note on your home&rsquo;s plumbing
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-600">
              {DISCLAIMER_PLUMBING}
            </p>
            <div className="mt-4">
              <Button href="/methodology" variant="ghost">
                How we source and grade this data →
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}
