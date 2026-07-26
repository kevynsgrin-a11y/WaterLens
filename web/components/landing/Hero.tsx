import AddressSearch from "@/components/AddressSearch";
import { Container, Eyebrow } from "@/components/ui";
import { HeroPlate } from "./HeroPlate";

export function Hero() {
  return (
    <section
      id="lookup"
      aria-labelledby="hero-heading"
      className="bg-hero relative overflow-hidden scroll-mt-16"
    >
      <div className="bg-grid absolute inset-0" aria-hidden="true" />

      <Container className="relative py-8 sm:py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Copy + the primary action */}
          <div className="lg:col-span-6">
            <div className="stagger">
              <Eyebrow>Address-level water quality intelligence</Eyebrow>

              <h1
                id="hero-heading"
                className="max-w-[20ch] text-display-1 text-ink-900 dark:text-white"
              >
                Know exactly what&rsquo;s in your tap water
                <span className="block text-brand-600 dark:text-brand-300">
                  and precisely what removes it.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-600 sm:mt-6 sm:text-lede dark:text-ink-300">
                Enter your address. We identify the utility that actually serves
                it, what it reports against federal limits, and the filters
                certified to remove it.
              </p>

              <div className="mt-6 sm:mt-8">
                <AddressSearch variant="hero" align="start" />
              </div>
            </div>
          </div>

          {/* The signature plate */}
          <div className="animate-fade-up lg:col-span-6 lg:pl-6 [animation-delay:300ms]">
            <HeroPlate />
          </div>
        </div>
      </Container>
    </section>
  );
}
