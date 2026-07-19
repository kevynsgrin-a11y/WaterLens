import Link from "next/link";
import { Pill } from "@/components/ui";
import { formatDate, slugPwsid } from "@/lib/format";
import type { WaterSystem } from "@/lib/types";

function primarySourceLabel(code: string | null): string | null {
  if (!code) return null;
  const c = code.toUpperCase();
  if (c === "SW" || c === "SWP") return "Surface water";
  if (c === "GW" || c === "GWP") return "Groundwater";
  if (c === "GU") return "Groundwater under surface influence";
  return code;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink-800">{children}</dd>
    </div>
  );
}

export function UtilityHeader({
  utility,
  freshness,
}: {
  utility: WaterSystem;
  freshness: { sdwis_fetched_at: string | null; generated_at: string };
}) {
  const place = [utility.county ? `${utility.county} County` : null, utility.state]
    .filter(Boolean)
    .join(", ");
  const source = primarySourceLabel(utility.primary_source);
  const asOf = freshness.sdwis_fetched_at ?? freshness.generated_at;

  return (
    <header className="animate-fade-up">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">
        Supplying water system
      </p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          {utility.name}
        </h1>
        <Link
          href={`/pws/${slugPwsid(utility.pwsid)}`}
          className="inline-flex rounded-md focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label={`View full profile for water system ${utility.pwsid}`}
        >
          <Pill tone="brand">{utility.pwsid}</Pill>
        </Link>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
        {place ? <Field label="Location">{place}</Field> : null}
        {utility.population_served != null ? (
          <Field label="Population served">
            <span className="font-mono">{utility.population_served.toLocaleString("en-US")}</span>
          </Field>
        ) : null}
        {source ? <Field label="Primary source">{source}</Field> : null}
        <Field label="Utility data as of">{formatDate(asOf)}</Field>
      </dl>
    </header>
  );
}
