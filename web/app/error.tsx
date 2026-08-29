"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary. Without this, any thrown error inside a route
 * segment surfaces Next's default error screen — off-brand and uninformative.
 * Voice stays clinical: state what happened, what it does not mean, what to do.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for server-side log aggregation without leaking to the user.
    console.error("Route error:", error);
  }, [error]);

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-content px-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">
            Something went wrong
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            We couldn&rsquo;t finish building this report
          </h1>
          <p className="mx-auto mt-4 text-base leading-relaxed text-ink-600">
            This is a fault on our side, not a finding about your water. No
            conclusion should be drawn from this screen. Try again — if it keeps
            happening, the underlying public data source may be temporarily
            unavailable.
          </p>

          {error.digest ? (
            <p className="mt-4 font-mono text-xs text-ink-500">
              Reference: {error.digest}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              Back to the address lookup
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
