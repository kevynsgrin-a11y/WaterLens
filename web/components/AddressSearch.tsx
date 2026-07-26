"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
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

const MIN_LENGTH = 5;

export default function AddressSearch({
  variant = "hero",
  align = "center",
  tone = "light",
  initialAddress = "",
  initialDwelling = "UNKNOWN",
}: {
  variant?: "hero" | "compact";
  align?: "start" | "center";
  /** `dark` re-styles the chrome for use on an inverse band. */
  tone?: "light" | "dark";
  initialAddress?: string;
  initialDwelling?: DwellingType;
}) {
  const router = useRouter();
  const [address, setAddress] = useState(initialAddress);
  const [dwelling, setDwelling] = useState<DwellingType>(initialDwelling);
  const [error, setError] = useState<string | null>(null);
  const [pendingExample, setPendingExample] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const errorId = useId();
  const inputId = useId();

  useEffect(() => {
    if (!pending) setPendingExample(null);
  }, [pending]);

  function go(addr: string, dw: DwellingType = dwelling) {
    const a = addr.trim();
    // Validate on submit rather than disabling the control — a primary CTA that
    // renders greyed-out on first paint reads as broken.
    if (a.length < MIN_LENGTH) {
      setError("Enter a street address with a city, or a 5-digit ZIP code.");
      document.getElementById(inputId)?.focus();
      return;
    }
    setError(null);
    const qs = new URLSearchParams({ address: a, dwelling_type: dw });
    startTransition(() => router.push(`/results?${qs.toString()}`));
  }

  const dark = tone === "dark";

  return (
    <div className={variant === "hero" ? "w-full max-w-2xl" : "w-full"}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(address);
        }}
        className={`rounded-2xl border p-2 transition-[border-color,box-shadow] duration-200 focus-within:ring-2 focus-within:ring-brand-400/40 ${
          dark
            ? "border-white/15 bg-white/[0.07] focus-within:border-brand-300"
            : `border-ink-200 bg-surface-raised focus-within:border-brand-300 dark:border-white/15 ${
                variant === "hero" ? "shadow-lift" : "shadow-card"
              }`
        }`}
        role="search"
        aria-label="Water system address lookup"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="group flex flex-1 items-center gap-3 px-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className={`shrink-0 transition-colors ${
                dark ? "text-brand-200/70" : "text-ink-400"
              }`}
            >
              <path d="M12 21s-6.5-5.7-6.5-10.2A6.5 6.5 0 0 1 18.5 10.8C18.5 15.3 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="10.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <label htmlFor={inputId} className="sr-only">
              Residential address or ZIP code
            </label>
            <input
              id={inputId}
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (error) setError(null);
              }}
              inputMode="text"
              autoComplete="street-address"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              placeholder="Home address or ZIP"
              className={`w-full bg-transparent py-3 text-base focus:outline-none ${
                dark
                  ? "text-white placeholder:text-brand-200/60"
                  : "text-ink-900 placeholder:text-ink-500 dark:text-white dark:placeholder:text-ink-400"
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-brand-700 active:scale-[0.97] disabled:opacity-60 motion-reduce:active:scale-100 dark:bg-brand-500 dark:hover:bg-brand-400"
          >
            {pending ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
                Checking…
              </>
            ) : (
              "Check my water"
            )}
          </button>
        </div>
      </form>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className={`mt-2 text-sm ${dark ? "text-caution-200" : "text-caution-800 dark:text-caution-200"}`}
        >
          {error}
        </p>
      ) : null}

      <div
        className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 ${
          align === "center" ? "justify-center" : "justify-start"
        }`}
      >
        <fieldset className="flex flex-wrap items-center gap-1.5">
          <legend
            className={`mb-1.5 w-full text-xs ${
              align === "center" ? "text-center" : ""
            } ${dark ? "text-brand-200/80" : "text-ink-500 dark:text-ink-400"}`}
          >
            Dwelling type — tailors the hardware guidance
          </legend>
          {DWELLINGS.map((d) => (
            <button
              key={d.value}
              type="button"
              aria-pressed={dwelling === d.value}
              onClick={() => setDwelling(d.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] motion-reduce:active:scale-100 ${
                dwelling === d.value
                  ? dark
                    ? "border-brand-300/60 bg-brand-300/15 text-white"
                    : "border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-300/40 dark:bg-brand-300/10 dark:text-brand-200"
                  : dark
                    ? "border-white/20 bg-white/[0.04] text-brand-100 hover:border-white/35"
                    : "border-ink-200 bg-surface-raised text-ink-600 hover:border-ink-300 dark:border-white/15 dark:text-ink-300"
              }`}
            >
              {d.label}
            </button>
          ))}
        </fieldset>
      </div>

      {variant === "hero" && (
        <p
          className={`mt-4 text-sm ${align === "center" ? "text-center" : ""} ${
            dark ? "text-brand-200/80" : "text-ink-500 dark:text-ink-400"
          }`}
        >
          Try an example:{" "}
          {EXAMPLES.map((ex, i) => (
            <span key={ex.label}>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setAddress(ex.address);
                  setPendingExample(ex.label);
                  go(ex.address);
                }}
                className={`font-medium underline-offset-2 transition-colors hover:underline disabled:opacity-50 disabled:no-underline ${
                  dark ? "text-brand-200" : "text-brand-600 dark:text-brand-300"
                }`}
              >
                {ex.label}
                {pendingExample === ex.label ? (
                  <span
                    aria-hidden="true"
                    className="ml-1.5 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent align-[-1px]"
                  />
                ) : null}
              </button>
              {i < EXAMPLES.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
