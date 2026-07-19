import Link from "next/link";

const LAB_TEST_URL = "https://affil.waterqualitylens.com/tap-score";

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.5 12 2.4 2.4 4.6-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({
  variant,
  utilityName,
}: {
  variant: "clean" | "no-match";
  utilityName?: string | null;
}) {
  const clean = variant === "clean";

  return (
    <div className="animate-fade-up rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-card sm:p-12">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
          clean ? "bg-verdant-50 text-verdant-600" : "bg-brand-50 text-brand-600"
        }`}
      >
        {clean ? <CheckIcon /> : <SearchIcon />}
      </div>

      <h2 className="mx-auto mt-6 max-w-xl text-2xl font-semibold text-ink-900">
        {clean
          ? "No reported contaminant exceedances"
          : "We couldn't confirm your water system"}
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-ink-600">
        {clean ? (
          <>
            {utilityName ? <span className="font-medium text-ink-800">{utilityName}</span> : "This system"}{" "}
            has no contaminants on record above a federal limit or health-based goal in the most
            recent reporting we could retrieve. This reflects utility-level monitoring only.
          </>
        ) : (
          <>
            We couldn&rsquo;t match this address to a public water system in our coverage or the EPA
            registry. Confirm the utility name printed on your most recent water bill, then search
            again. A point-of-use lab test is the most reliable way to learn what is in your tap.
          </>
        )}
      </p>

      {clean ? (
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-500">
          Utility data cannot detect contamination introduced by your home&rsquo;s own plumbing, such
          as a legacy lead service line. If you want certainty for your specific tap, a lab test is
          the only way to verify it.
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={LAB_TEST_URL}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:ring-brand-400"
        >
          Order a Tap Score lab test
        </Link>
        {!clean ? (
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
          >
            Search a different address
          </Link>
        ) : null}
      </div>
    </div>
  );
}
