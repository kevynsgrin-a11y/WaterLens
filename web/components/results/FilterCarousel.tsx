import Link from "next/link";
import { Badge } from "@/components/ui";
import { DISCLAIMER_AFFILIATE } from "@/lib/constants";
import { contaminantName } from "@/lib/data";
import { FORM_FACTOR_LABEL, standardLabel, usd } from "@/lib/format";
import type { RecommendedFilter } from "@/lib/types";

function VerifiedPartnerBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-verdant-200 bg-verdant-50 px-2.5 py-0.5 text-xs font-medium text-verdant-700">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3 5 6v5.2c0 4.3 3 8.2 7 9.3 4-1.1 7-5 7-9.3V6l-7-3Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="m9 12 2 2 4-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Verified Partner
    </span>
  );
}

function neutralizesLine(codes: string[]): string {
  const names = codes.map(contaminantName);
  if (names.length <= 4) return names.join(", ");
  return `${names.slice(0, 4).join(", ")} +${names.length - 4} more`;
}

function FilterCard({ filter }: { filter: RecommendedFilter }) {
  const standards = [...filter.certified_standards];
  return (
    <article className="flex w-[19rem] shrink-0 snap-start flex-col rounded-2xl border border-ink-200 bg-white p-5 shadow-card transition-shadow hover:shadow-lift sm:w-auto sm:shrink">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{filter.brand}</p>
          <h3 className="mt-0.5 text-base font-semibold leading-snug text-ink-900">{filter.model}</h3>
        </div>
        <VerifiedPartnerBadge />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-600">
        <span>{FORM_FACTOR_LABEL[filter.form_factor]}</span>
        <span aria-hidden="true" className="text-ink-300">
          •
        </span>
        <span className="font-mono font-semibold text-ink-900">{usd(filter.price_usd)}</span>
      </div>

      {standards.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Certifications</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {standards.map((s) => (
              <Badge key={s} tone="verdant">
                {standardLabel(s)}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {filter.neutralizes.length > 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-700">
          <span className="font-medium text-ink-800">Neutralizes:</span>{" "}
          {neutralizesLine(filter.neutralizes)}
        </p>
      ) : null}

      {filter.capacity_gallons != null ? (
        <p className="mt-2 text-xs text-ink-500">
          Rated capacity{" "}
          <span className="font-mono">{filter.capacity_gallons.toLocaleString("en-US")}</span> gallons
        </p>
      ) : null}

      <div className="mt-auto pt-5">
        {filter.affiliate_url ? (
          <Link
            href={filter.affiliate_url}
            rel="sponsored noopener"
            target="_blank"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:ring-brand-400"
          >
            View verified product
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function FilterCarousel({ filters }: { filters: RecommendedFilter[] }) {
  if (filters.length === 0) return null;

  return (
    <section
      aria-labelledby="filters-heading"
      className="rounded-2xl border border-ink-200 bg-ink-50/60 p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              Recommended hardware
            </span>
            <Badge tone="verdant">Affiliate</Badge>
          </div>
          <h2 id="filters-heading" className="mt-1 text-2xl font-semibold text-ink-900 sm:text-3xl">
            Filters certified for these contaminants
          </h2>
        </div>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">
        Each product below holds independently verified NSF/ANSI health certifications covering every
        contaminant flagged above. Ranking reflects certification coverage and fit for your dwelling,
        never commercial arrangement.
      </p>

      <div className="mt-6 grid grid-flow-col auto-cols-[19rem] grid-rows-1 gap-4 overflow-x-auto pb-2 snap-x sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
        {filters.map((f) => (
          <FilterCard key={f.id} filter={f} />
        ))}
      </div>

      <p className="mt-6 border-t border-ink-200 pt-4 text-xs leading-relaxed text-ink-500">
        {DISCLAIMER_AFFILIATE}
      </p>
    </section>
  );
}
