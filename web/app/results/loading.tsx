import { Container, Section } from "@/components/ui";

function Line({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-ink-100 ${className}`} />;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <Line className="h-5 w-40" />
        <Line className="h-5 w-28 rounded-full" />
      </div>
      <Line className="mt-4 h-4 w-full max-w-xl" />
      <Line className="mt-5 h-2.5 w-full rounded-full" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Line className="h-9" />
        <Line className="h-9" />
        <Line className="h-9" />
        <Line className="h-9" />
      </div>
    </div>
  );
}

export default function ResultsLoading() {
  return (
    <Section>
      <Container>
        <div
          className="animate-pulse space-y-10"
          aria-busy="true"
          aria-label="Loading water report"
        >
          {/* Search bar row */}
          <div className="flex flex-col gap-3 border-b border-ink-100 pb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Line className="h-3 w-20" />
              <Line className="h-4 w-56" />
            </div>
            <Line className="h-12 w-full rounded-2xl sm:max-w-md" />
          </div>

          {/* Utility header */}
          <div>
            <Line className="h-3 w-40" />
            <Line className="mt-3 h-9 w-80 max-w-full" />
            <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Line className="h-10" />
              <Line className="h-10" />
              <Line className="h-10" />
              <Line className="h-10" />
            </div>
          </div>

          {/* Confidence banner */}
          <Line className="h-24 w-full rounded-2xl" />

          {/* Contaminant matrix */}
          <div className="space-y-4">
            <Line className="h-8 w-72 max-w-full" />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          {/* Filter block */}
          <div className="rounded-2xl border border-ink-200 bg-ink-50/60 p-7">
            <Line className="h-8 w-80 max-w-full" />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Line className="h-64 rounded-2xl bg-white" />
              <Line className="h-64 rounded-2xl bg-white" />
              <Line className="h-64 rounded-2xl bg-white" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
