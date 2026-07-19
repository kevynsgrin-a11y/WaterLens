import { Badge, Pill } from "@/components/ui";
import { FORM_FACTOR_LABEL, standardLabel, usd } from "@/lib/format";
import { standardTone, type RegistryEntry } from "@/lib/registry";

// -----------------------------------------------------------------------------
// RegistryTable — presentational table for the Filter Certification Registry.
// Derivation lives in lib/registry.ts; this component only renders.
// -----------------------------------------------------------------------------

function StandardBadges({ entry }: { entry: RegistryEntry }) {
  if (entry.standards.length === 0) {
    return <span className="text-sm text-ink-400">No certifications on file</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {entry.standards.map((s) => (
        <Badge key={s} tone={standardTone(s)}>
          {standardLabel(s)}
        </Badge>
      ))}
    </div>
  );
}

function Assessment({ entry }: { entry: RegistryEntry }) {
  if (entry.deceptiveMarketingRisk) {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-medium text-caution-800">
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 flex-none rounded-full bg-caution-500"
        />
        Materials-only — no verified health reduction
      </span>
    );
  }
  if (entry.healthCertified) {
    return (
      <span className="text-sm text-ink-700">
        Health-certified for{" "}
        <span className="font-semibold text-verdant-700">
          {entry.healthContaminants.length}
        </span>{" "}
        contaminant{entry.healthContaminants.length === 1 ? "" : "s"}
      </span>
    );
  }
  return <span className="text-sm text-ink-500">Aesthetic reduction only</span>;
}

export function RegistryTable({ entries }: { entries: RegistryEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-100 shadow-card">
      <table className="w-full min-w-[56rem] border-collapse bg-white text-left">
        <caption className="sr-only">
          Filter Certification Registry: brand, model, SKU, form factor, verified
          NSF/ANSI standards, price, and health-reduction assessment for every
          catalogued filter.
        </caption>
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50/70">
            <th
              scope="col"
              className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink-500"
            >
              Filter
            </th>
            <th
              scope="col"
              className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink-500"
            >
              SKU
            </th>
            <th
              scope="col"
              className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink-500"
            >
              Form factor
            </th>
            <th
              scope="col"
              className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink-500"
            >
              Verified standards
            </th>
            <th
              scope="col"
              className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-500"
            >
              Price
            </th>
            <th
              scope="col"
              className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink-500"
            >
              Assessment
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const { filter } = entry;
            return (
              <tr
                key={filter.id}
                className="border-b border-ink-100 align-top last:border-0 hover:bg-ink-50/50"
              >
                <th scope="row" className="px-5 py-4 font-normal">
                  <div className="font-semibold text-ink-900">{filter.brand}</div>
                  <div className="text-sm text-ink-600">{filter.model}</div>
                  {entry.certifiers.length > 0 ? (
                    <div className="mt-1 text-xs text-ink-400">
                      Certified by {entry.certifiers.join(", ")}
                    </div>
                  ) : null}
                </th>
                <td className="px-5 py-4">
                  <Pill tone="ink">{filter.sku}</Pill>
                </td>
                <td className="px-5 py-4 text-sm text-ink-700">
                  {FORM_FACTOR_LABEL[filter.form_factor]}
                </td>
                <td className="px-5 py-4">
                  <StandardBadges entry={entry} />
                </td>
                <td className="px-5 py-4 text-right font-mono text-sm text-ink-800">
                  {usd(filter.price_usd)}
                </td>
                <td className="px-5 py-4">
                  <Assessment entry={entry} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
