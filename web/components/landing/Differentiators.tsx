import { Container, Section, Card, Eyebrow, Badge } from "@/components/ui";

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

type Row = {
  dimension: string;
  ours: string;
  others: string;
};

const ROWS: Row[] = [
  {
    dimension: "Location precision",
    ours: "Address-level utility boundaries (point-in-polygon)",
    others: "ZIP codes, which routinely span several different utilities",
  },
  {
    dimension: "How limits are set",
    ours: "EPA legal limits (MCLs) shown plainly, with sample provenance",
    others: "Proprietary thresholds well below any regulatory standard",
  },
  {
    dimension: "Filter verification",
    ours: "SKU-level, independent NSF/ANSI certification for each contaminant",
    others: "Broad brand affiliate links, not verified per-contaminant SKUs",
  },
  {
    dimension: "Commercial incentive",
    ours: "Vendor-agnostic — we don’t manufacture or sell any filter",
    others: "Some diagnostic sites sell the very filter they recommend",
  },
];

export function Differentiators() {
  return (
    <Section id="why-different">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>Why we&rsquo;re different</Eyebrow>
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
            An auditor&rsquo;s standard, not an advocacy pitch
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-600">
            Most water-quality tools are built to alarm or to sell. We report the
            public record against the legal standard and point you to
            independently verified hardware &mdash; whoever makes it. Here is how
            that compares to the common approaches.
          </p>
        </div>

        {/* Comparison table (md and up) */}
        <div className="mt-10 hidden overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card md:block">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              WaterQualityLens compared with common water-quality tools
            </caption>
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50">
                <th scope="col" className="w-1/4 px-6 py-4 text-sm font-semibold text-ink-700">
                  Dimension
                </th>
                <th scope="col" className="w-2/5 px-6 py-4">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                    <Badge tone="verdant">WaterQualityLens</Badge>
                  </span>
                </th>
                <th scope="col" className="px-6 py-4 text-sm font-semibold text-ink-500">
                  Common approaches
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.dimension} className="border-b border-ink-100 last:border-0 align-top">
                  <th scope="row" className="px-6 py-5 text-sm font-medium text-ink-700">
                    {row.dimension}
                  </th>
                  <td className="px-6 py-5">
                    <div className="flex gap-2.5 text-sm text-ink-800">
                      <span className="mt-0.5 shrink-0 text-verdant-600" aria-hidden="true">
                        <CheckIcon />
                      </span>
                      <span>{row.ours}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2.5 text-sm text-ink-500">
                      <span className="mt-0.5 shrink-0 text-ink-400" aria-hidden="true">
                        <DashIcon />
                      </span>
                      <span>{row.others}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stacked cards (mobile) */}
        <div className="mt-8 grid gap-4 md:hidden">
          {ROWS.map((row) => (
            <Card key={row.dimension} className="p-5">
              <p className="text-sm font-semibold text-ink-700">{row.dimension}</p>
              <div className="mt-3 flex gap-2.5 text-sm text-ink-800">
                <span className="mt-0.5 shrink-0 text-verdant-600" aria-hidden="true">
                  <CheckIcon />
                </span>
                <span>{row.ours}</span>
              </div>
              <div className="mt-2.5 flex gap-2.5 text-sm text-ink-500">
                <span className="mt-0.5 shrink-0 text-ink-400" aria-hidden="true">
                  <DashIcon />
                </span>
                <span>{row.others}</span>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
