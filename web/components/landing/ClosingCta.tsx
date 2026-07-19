import AddressSearch from "@/components/AddressSearch";
import { Container, Section } from "@/components/ui";

export function ClosingCta() {
  return (
    <Section id="get-started" className="bg-brand-900">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            See your water&rsquo;s record in under a minute
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-brand-100">
            Enter your address to identify your utility, review what it reports,
            and find the exact certified filters for your contaminants. Free, and
            no account required.
          </p>

          <div className="mx-auto mt-8 max-w-xl text-left">
            <AddressSearch variant="compact" />
          </div>

          <p className="mx-auto mt-6 max-w-xl text-xs leading-relaxed text-brand-200">
            WaterQualityLens aggregates public water-system engineering data and
            hardware certifications. It does not diagnose exposure, predict health
            outcomes, or provide medical advice.
          </p>
        </div>
      </Container>
    </Section>
  );
}
