import AddressSearch from "@/components/AddressSearch";
import { Container, Eyebrow } from "@/components/ui";

function ShieldCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3 5 6v5.2c0 4.3 3 8.2 7 9.3 4-1.1 7-5 7-9.3V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m9 12 2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Hero() {
  return (
    <section
      id="lookup"
      aria-labelledby="hero-heading"
      className="bg-hero relative overflow-hidden scroll-mt-16"
    >
      <div className="bg-grid absolute inset-0" aria-hidden="true" />
      <Container className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-3xl animate-fade-up text-center">
          <Eyebrow>Address-level water quality intelligence</Eyebrow>
          <h1
            id="hero-heading"
            className="text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl"
          >
            Know exactly what&rsquo;s in your tap water &mdash; and precisely
            what removes it.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-600">
            Enter your home address. We identify the public water system that
            actually supplies it, show the contaminants that utility reports
            against the federal legal limits, and match the exact retail filters
            independently certified to remove them. No fear, no guesswork &mdash;
            just the record.
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl animate-fade-up justify-center">
          <AddressSearch variant="hero" />
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-500">
          <span className="inline-flex items-center gap-2">
            <span className="text-verdant-500">
              <ShieldCheck />
            </span>
            Built on EPA SDWIS public data
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="text-verdant-500">
              <ShieldCheck />
            </span>
            Independent NSF/ANSI verification
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="text-verdant-500">
              <ShieldCheck />
            </span>
            Vendor-agnostic recommendations
          </span>
        </div>
      </Container>
    </section>
  );
}
