import type { Metadata } from "next";
import AddressSearch from "@/components/AddressSearch";
import { Container, Section } from "@/components/ui";
import { ConfidenceBanner } from "@/components/results/ConfidenceBanner";
import { ContaminantMatrix } from "@/components/results/ContaminantMatrix";
import { Disclaimers } from "@/components/results/Disclaimers";
import { EmptyState } from "@/components/results/EmptyState";
import { FilterCarousel } from "@/components/results/FilterCarousel";
import { NitrateNotice } from "@/components/results/NitrateNotice";
import { UtilityHeader } from "@/components/results/UtilityHeader";
import { ViolationsList } from "@/components/results/ViolationsList";
import { MatchTier } from "@/lib/constants";
import { runLookup } from "@/lib/lookup";
import type { DwellingType } from "@/lib/types";

export const dynamic = "force-dynamic";

const MIN_ADDRESS_LENGTH = 5;

type SearchParams = { [key: string]: string | string[] | undefined };

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function parseDwelling(value: string | string[] | undefined): DwellingType {
  const v = firstParam(value);
  if (v === "SINGLE_FAMILY" || v === "MULTI_FAMILY_RENTAL" || v === "UNKNOWN") return v;
  return "UNKNOWN";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParams;
}): Promise<Metadata> {
  const address = firstParam(searchParams?.address).trim();
  const title = address ? `Water report for ${address}` : "Water report";
  return {
    title,
    // The results page is dynamic and address-specific; keep it out of the index.
    robots: { index: false, follow: false },
  };
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const address = firstParam(searchParams?.address).trim();
  const dwelling = parseDwelling(searchParams?.dwelling_type);

  // --- State 0: no / too-short address — friendly prompt. -------------------
  if (address.length < MIN_ADDRESS_LENGTH) {
    return (
      <Section>
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">
              Water report
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              Enter an address to see its water report
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-600">
              We identify the public water system that supplies a given address, the contaminants it
              reports against federal limits, and the filters independently certified to remove them.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-2xl">
            <AddressSearch variant="compact" initialAddress={address} initialDwelling={dwelling} />
          </div>
        </Container>
      </Section>
    );
  }

  const result = await runLookup(address, dwelling);
  const matched = result.utility != null && result.match.tier !== MatchTier.NONE;
  const hasExceedances = result.detected_contaminants.length > 0;

  return (
    <Section>
      <Container>
        {/* Search-another-address affordance */}
        <div className="mb-8 flex flex-col gap-3 border-b border-ink-100 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-500">Report for</p>
            <p className="mt-0.5 truncate text-sm font-medium text-ink-800">
              {result.query.normalized_address ?? result.query.address}
            </p>
          </div>
          <div className="w-full sm:max-w-md">
            <AddressSearch
              variant="compact"
              initialAddress={result.query.address}
              initialDwelling={result.query.dwelling_type}
            />
          </div>
        </div>

        {matched && result.utility ? (
          <div className="space-y-10">
            <UtilityHeader utility={result.utility} freshness={result.data_freshness} />

            <ConfidenceBanner
              match={result.match}
              multiSystemWarning={result.multi_system_warning}
              multiSystemCount={result.multi_system_count}
            />

            {hasExceedances ? (
              <>
                <NitrateNotice warning={result.nitrate_warning} />
                <ContaminantMatrix detections={result.detected_contaminants} />
              </>
            ) : (
              <EmptyState variant="clean" utilityName={result.utility.name} />
            )}

            <ViolationsList violations={result.active_violations} />

            {/* Commercial hardware always follows the objective data (§13). */}
            <FilterCarousel filters={result.recommended_filters} />

            <Disclaimers disclaimers={result.disclaimers} />
          </div>
        ) : (
          <div className="space-y-10">
            <EmptyState variant="no-match" />
            <Disclaimers disclaimers={result.disclaimers} />
          </div>
        )}
      </Container>
    </Section>
  );
}
