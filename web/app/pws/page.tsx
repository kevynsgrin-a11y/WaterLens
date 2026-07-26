import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Container,
  Eyebrow,
  Pill,
  Section,
  SectionHeading,
} from "@/components/ui";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { DEMO_SYSTEMS } from "@/lib/data";
import { demoProfile } from "@/lib/lookup";
import { formatDate, severityChipClass } from "@/lib/format";
import { DISCLAIMER_PLUMBING } from "@/lib/constants";
import type { Detection } from "@/lib/types";

const TITLE = "Water Systems Directory";
const DESCRIPTION =
  "Every public water system with a published record in WaterQualityLens — utility name, EPA PWSID, county, population served, and how many reported contaminants sit above their federal maximum contaminant level, each traceable to its sample date and testing agency.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pws" },
  openGraph: {
    title: `${TITLE} · WaterQualityLens`,
    description: DESCRIPTION,
    url: "/pws",
    type: "website",
  },
};

const SOURCE_LABEL: Record<string, string> = {
  SW: "Surface water",
  GW: "Groundwater",
  GU: "Groundwater under surface influence",
};

interface DirectoryEntry {
  pwsid: string;
  name: string;
  place: string;
  population: number | null;
  primarySource: string | null;
  reported: number;
  exceedances: Detection[];
  fetchedAt: string | null;
}

function buildDirectory(): DirectoryEntry[] {
  return DEMO_SYSTEMS.map(({ system }) => {
    const profile = demoProfile(system.pwsid);
    const detections = profile?.detections ?? [];
    return {
      pwsid: system.pwsid,
      name: system.name,
      place: [system.county ? `${system.county} County` : null, system.state]
        .filter(Boolean)
        .join(", "),
      population: system.population_served,
      primarySource: system.primary_source,
      reported: detections.length,
      exceedances: detections.filter((d) => d.exceeds_mcl),
      fetchedAt: profile?.fetched_at ?? null,
    };
  }).sort((a, b) => (b.population ?? 0) - (a.population ?? 0));
}

function SystemCard({ entry }: { entry: DirectoryEntry }) {
  const above = entry.exceedances.length;
  const worst = entry.exceedances[0];

  return (
    <Card as="li" interactive className="overflow-hidden">
      <Link
        href={`/pws/${entry.pwsid}`}
        className="flex h-full flex-col p-6 no-underline"
      >
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <h3 className="text-title-2 text-ink-900 dark:text-white">{entry.name}</h3>
          <Pill tone="ink">{entry.pwsid}</Pill>
        </div>

        <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
          {entry.place || "Location not reported"}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">
              Population served
            </dt>
            <dd className="mt-0.5 font-mono font-semibold text-ink-900 dark:text-white">
              {entry.population ? entry.population.toLocaleString("en-US") : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">
              Primary source
            </dt>
            <dd className="mt-0.5 font-medium text-ink-800 dark:text-ink-100">
              {entry.primarySource
                ? (SOURCE_LABEL[entry.primarySource] ?? entry.primarySource)
                : "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-hairline pt-4">
          {above > 0 && worst ? (
            <Badge className={severityChipClass(worst)}>
              {above} contaminant{above === 1 ? "" : "s"} above the federal limit
            </Badge>
          ) : (
            <Badge tone="verdant">All reported values within federal limits</Badge>
          )}
          <span className="text-xs text-ink-500 dark:text-ink-400">
            {entry.reported} reported contaminant{entry.reported === 1 ? "" : "s"}
          </span>
        </div>

        {entry.fetchedAt ? (
          <p className="mt-4 text-xs text-ink-500 dark:text-ink-400">
            Data as of {formatDate(entry.fetchedAt)} · EPA SDWIS / state primacy agency
          </p>
        ) : null}

        <span className="mt-4 text-sm font-semibold text-brand-700 dark:text-brand-200">
          View the full record
          <span aria-hidden="true"> →</span>
        </span>
      </Link>
    </Card>
  );
}

export default function PwsIndexPage() {
  const entries = buildDirectory();
  const totalAbove = entries.reduce((n, e) => n + e.exceedances.length, 0);

  return (
    <>
      <Section tone="sunken" density="default" className="pb-12">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Water systems" }]} />

          <div className="mt-6 max-w-3xl animate-fade-up">
            <Eyebrow>Directory</Eyebrow>
            <h1 className="text-display-2">Water systems</h1>
            <p className="mt-5 text-lede text-ink-600 dark:text-ink-300">
              Every public water system with a published record in
              WaterQualityLens. Each entry links to the contaminants that utility
              reported to the EPA Safe Drinking Water Information System, shown
              with full provenance — sample date, testing agency, unit, and the
              legal maximum contaminant level.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              Coverage is expanding. If your utility is not listed yet, a lookup by
              address can still resolve your system from the federal registry.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/" variant="primary" size="md">
              Look up your address
            </Button>
            <Button href="/contaminants" variant="secondary" size="md">
              Contaminant glossary
            </Button>
          </div>
        </Container>
      </Section>

      <Section id="systems" density="default">
        <Container>
          <SectionHeading
            id="systems-heading"
            eyebrow="Published records"
            title={`${entries.length} water system${entries.length === 1 ? "" : "s"}`}
            lede={
              totalAbove > 0
                ? `Across these systems, ${totalAbove} reported contaminant${
                    totalAbove === 1 ? "" : "s"
                  } currently sit above a federal maximum contaminant level. Counts reflect the most recent reporting period held for each system.`
                : "No reported contaminant across these systems currently sits above a federal maximum contaminant level."
            }
          />

          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <SystemCard key={entry.pwsid} entry={entry} />
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="sunken" density="tight">
        <Container>
          <Card className="p-6">
            <h2 className="text-title-2">What this directory does not cover</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              {DISCLAIMER_PLUMBING}
            </p>
            <div className="mt-4">
              <Button href="/methodology" variant="ghost" size="sm">
                How we source and grade this data
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}
