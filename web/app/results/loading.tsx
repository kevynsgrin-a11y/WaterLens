import { Container, Section } from "@/components/ui";

// -----------------------------------------------------------------------------
// First paint for /results. The shape here mirrors app/results/page.tsx exactly —
// full-bleed verdict banner, sticky report nav, a [1fr_360px] identity row with
// the service-area map beside it, contaminant cards, then the filter grid — so
// the real report lands into the same boxes instead of reflowing the page.
//
// The blanket pulse is replaced by a single slow sweep per block: a translucent
// gradient travelling across each placeholder, gated behind motion-safe.
// -----------------------------------------------------------------------------

type BarTone = "base" | "inverse";

const barSurface: Record<BarTone, string> = {
  base: "bg-ink-100 dark:bg-white/10",
  inverse: "bg-white/10",
};

const barSheen: Record<BarTone, string> = {
  base: "via-white/70 dark:via-white/10",
  inverse: "via-white/20",
};

function Bar({
  className = "",
  tone = "base",
}: {
  className?: string;
  tone?: BarTone;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded ${barSurface[tone]} ${className}`}
      aria-hidden="true"
    >
      <span
        className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent ${barSheen[tone]} motion-safe:animate-shimmer`}
      />
    </div>
  );
}

function SkeletonPanel({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl bg-surface-raised p-5 shadow-card ring-1 ring-ink-900/[0.055] sm:p-6 dark:ring-white/10 ${className}`}
    >
      {children}
    </div>
  );
}

/** Mirrors one ContaminantMatrix card: title row, scale, provenance grid. */
function SkeletonContaminantCard() {
  return (
    <SkeletonPanel>
      <div className="flex items-center justify-between gap-4">
        <Bar className="h-6 w-40" />
        <Bar className="h-6 w-32 rounded-full" />
      </div>
      <Bar className="mt-4 h-4 w-full max-w-xl" />
      <Bar className="mt-5 h-2.5 w-full rounded-full" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Bar className="h-9" />
        <Bar className="h-9" />
        <Bar className="h-9" />
        <Bar className="h-9" />
        <Bar className="h-9" />
      </div>
    </SkeletonPanel>
  );
}

export default function ResultsLoading() {
  return (
    <div className="bg-surface-sunken" role="status" aria-live="polite">
      <span className="sr-only">Loading your water report…</span>

      {/* Verdict banner — full-bleed navy, stated first. */}
      <Container className="pt-6 sm:pt-8">
        <div className="relative -mx-6 overflow-hidden bg-brand-950 px-6 py-10 sm:rounded-3xl sm:py-12">
          <div
            className="bg-grid pointer-events-none absolute inset-0 opacity-[0.5]"
            aria-hidden="true"
          />
          <div className="relative">
            <Bar tone="inverse" className="h-3 w-56 max-w-full" />
            <Bar tone="inverse" className="mt-4 h-9 w-[34rem] max-w-full sm:h-11" />
            <Bar tone="inverse" className="mt-3 h-9 w-96 max-w-full sm:h-11" />
            <Bar tone="inverse" className="mt-5 h-4 w-full max-w-2xl" />
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-white/15 pt-6 sm:grid-cols-4">
              <Bar tone="inverse" className="h-12" />
              <Bar tone="inverse" className="h-12" />
              <Bar tone="inverse" className="h-12" />
              <Bar tone="inverse" className="h-12" />
            </div>
          </div>
        </div>
      </Container>

      {/* Sticky report nav. */}
      <div className="sticky top-16 z-30 border-b border-hairline bg-surface-base/85 backdrop-blur">
        <Container className="flex h-12 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <Bar className="h-4 w-44 max-w-[40vw]" />
            <Bar className="h-5 w-24 rounded-md" />
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <Bar className="h-4 w-24" />
            <Bar className="h-4 w-20" />
            <Bar className="h-4 w-16" />
          </div>
        </Container>
      </div>

      <Section density="tight">
        <Container>
          {/* Report-for row + report actions. */}
          <div className="mb-8 flex flex-col gap-4 border-b border-hairline pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 space-y-2">
              <Bar className="h-3 w-24" />
              <Bar className="h-5 w-72 max-w-full" />
              <Bar className="h-3 w-56 max-w-full" />
            </div>
            <div className="flex shrink-0 gap-3">
              <Bar className="h-10 w-32 rounded-xl" />
              <Bar className="h-10 w-32 rounded-xl" />
            </div>
          </div>

          <div className="space-y-10">
            {/* Identity row: utility header + confidence banner | service map. */}
            <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
              <div className="space-y-6">
                <div>
                  <Bar className="h-4 w-48" />
                  <Bar className="mt-3 h-10 w-96 max-w-full" />
                  <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                    <Bar className="h-10" />
                    <Bar className="h-10" />
                    <Bar className="h-10" />
                    <Bar className="h-10" />
                  </div>
                </div>
                <SkeletonPanel>
                  <div className="flex items-start gap-4">
                    <Bar className="h-6 w-6 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <Bar className="h-5 w-44" />
                        <Bar className="h-5 w-32 rounded-full" />
                      </div>
                      <Bar className="mt-3 h-4 w-full" />
                      <Bar className="mt-2 h-4 w-4/5" />
                    </div>
                  </div>
                </SkeletonPanel>
              </div>

              {/* Service-area map card. */}
              <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-raised shadow-card">
                <Bar className="h-[240px] w-full rounded-none" />
                <div className="border-t border-hairline p-4">
                  <Bar className="h-3 w-full" />
                  <Bar className="mt-2 h-3 w-2/3" />
                </div>
              </div>
            </div>

            {/* Contaminant cards. */}
            <div className="space-y-4">
              <Bar className="h-8 w-72 max-w-full" />
              <Bar className="h-4 w-full max-w-2xl" />
              <SkeletonContaminantCard />
              <SkeletonContaminantCard />
            </div>

            {/* Filter grid. */}
            <div>
              <Bar className="h-8 w-80 max-w-full" />
              <Bar className="mt-3 h-4 w-full max-w-2xl" />
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SkeletonPanel className="h-64">
                  <Bar className="h-5 w-32" />
                  <Bar className="mt-4 h-4 w-full" />
                  <Bar className="mt-2 h-4 w-3/4" />
                </SkeletonPanel>
                <SkeletonPanel className="h-64">
                  <Bar className="h-5 w-32" />
                  <Bar className="mt-4 h-4 w-full" />
                  <Bar className="mt-2 h-4 w-3/4" />
                </SkeletonPanel>
                <SkeletonPanel className="h-64">
                  <Bar className="h-5 w-32" />
                  <Bar className="mt-4 h-4 w-full" />
                  <Bar className="mt-2 h-4 w-3/4" />
                </SkeletonPanel>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
