import AddressSearch from "@/components/AddressSearch";
import { Container, Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { WaveDivider } from "@/components/graphics/WaveDivider";

export function ClosingCta() {
  return (
    <>
      {/* Seam from the sunken education band into the closing dark band. */}
      <div className="bg-surface-sunken">
        <WaveDivider className="text-brand-950" />
      </div>

      {/* tone="inverse" already carries `on-dark`, which re-colours the focus
          ring offset so it stays visible against the navy. */}
      <Section id="get-started" tone="inverse" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid" aria-hidden="true" />
        <Container className="relative">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <SectionHeading
                tone="inverse"
                align="center"
                title="See your water’s record in under a minute"
                lede="Enter your address to identify your utility, review what it reports, and find the exact certified filters for your contaminants. Free, and no account required."
              />
            </Reveal>

            <Reveal delay={80}>
              <div className="mx-auto mt-8 max-w-xl">
                <AddressSearch variant="compact" tone="dark" align="center" />
              </div>

              <p className="mx-auto mt-6 max-w-xl text-center text-xs leading-relaxed text-brand-200">
                WaterQualityLens aggregates public water-system engineering data
                and hardware certifications. It does not diagnose exposure,
                predict health outcomes, or provide medical advice.
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
