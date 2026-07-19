"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { DwellingType } from "@/lib/types";

const DWELLINGS: { value: DwellingType; label: string }[] = [
  { value: "SINGLE_FAMILY", label: "I own a home" },
  { value: "MULTI_FAMILY_RENTAL", label: "I rent" },
  { value: "UNKNOWN", label: "Not sure" },
];

const EXAMPLES = [
  { label: "Flint, MI", address: "1600 S Saginaw St, Flint, MI 48503" },
  { label: "Newark, NJ", address: "920 Broad St, Newark, NJ 07102" },
  { label: "Austin, TX", address: "301 W 2nd St, Austin, TX 78701" },
];

export default function AddressSearch({
  variant = "hero",
  initialAddress = "",
  initialDwelling = "UNKNOWN",
}: {
  variant?: "hero" | "compact";
  initialAddress?: string;
  initialDwelling?: DwellingType;
}) {
  const router = useRouter();
  const [address, setAddress] = useState(initialAddress);
  const [dwelling, setDwelling] = useState<DwellingType>(initialDwelling);
  const [pending, startTransition] = useTransition();

  function go(addr: string, dw: DwellingType = dwelling) {
    const a = addr.trim();
    if (a.length < 5) return;
    const qs = new URLSearchParams({ address: a, dwelling_type: dw });
    startTransition(() => router.push(`/results?${qs.toString()}`));
  }

  return (
    <div className={variant === "hero" ? "w-full max-w-2xl" : "w-full"}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(address);
        }}
        className="rounded-2xl border border-ink-200 bg-white p-2 shadow-lift"
        role="search"
        aria-label="Water system address lookup"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 px-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-ink-400">
              <path d="M12 21s-6.5-5.7-6.5-10.2A6.5 6.5 0 0 1 18.5 10.8C18.5 15.3 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="10.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <label htmlFor="wql-address" className="sr-only">
              Residential address or ZIP code
            </label>
            <input
              id="wql-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              inputMode="text"
              autoComplete="street-address"
              placeholder="Enter your home address or ZIP code"
              className="w-full bg-transparent py-3 text-base text-ink-900 placeholder:text-ink-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={pending || address.trim().length < 5}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {pending ? "Checking…" : "Check my water"}
          </button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <fieldset className="flex items-center gap-1.5">
          <legend className="sr-only">Dwelling type</legend>
          {DWELLINGS.map((d) => (
            <button
              key={d.value}
              type="button"
              aria-pressed={dwelling === d.value}
              onClick={() => setDwelling(d.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                dwelling === d.value
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-ink-200 bg-white text-ink-500 hover:border-ink-300"
              }`}
            >
              {d.label}
            </button>
          ))}
        </fieldset>
      </div>

      {variant === "hero" && (
        <p className="mt-4 text-sm text-ink-500">
          Try an example:{" "}
          {EXAMPLES.map((ex, i) => (
            <span key={ex.label}>
              <button
                type="button"
                onClick={() => {
                  setAddress(ex.address);
                  go(ex.address);
                }}
                className="font-medium text-brand-600 underline-offset-2 hover:underline"
              >
                {ex.label}
              </button>
              {i < EXAMPLES.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
