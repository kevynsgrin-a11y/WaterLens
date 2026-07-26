import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Differentiators } from "@/components/landing/Differentiators";
import { CoverageStats } from "@/components/landing/CoverageStats";
import { EducationTeaser } from "@/components/landing/EducationTeaser";
import { ClosingCta } from "@/components/landing/ClosingCta";

export const metadata: Metadata = {
  title: "WaterQualityLens — What’s in your tap water, and what removes it",
  description:
    "Enter your US home address to identify the public water system that serves it, see the contaminants it reports against federal legal limits, and get the exact retail filters independently NSF/ANSI-certified to remove them. Vendor-agnostic, provenance-first, no fear-based ratings.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "WaterQualityLens — Address-level tap water quality intelligence",
    description:
      "Identify your public water system by address, review the contaminants it reports with full provenance, and match the exact NSF-certified filters proven to remove them.",
    url: "/",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does WaterQualityLens find my water system?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We geocode your address and resolve the supplying public water system using TEMM utility-boundary polygons with point-in-polygon matching, then grade the result on a three-tier confidence scale. This is more precise than ZIP-code matching, because a single ZIP code can cross several different utilities.",
      },
    },
    {
      "@type": "Question",
      name: "Where does the contaminant data come from?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Contaminant reports come from EPA SDWIS public data. Each value is shown with its sample date, testing agency, unit, and the federal maximum contaminant level (MCL), so every figure carries its source.",
      },
    },
    {
      "@type": "Question",
      name: "How are the recommended filters chosen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We match retail filter SKUs that hold independent NSF/ANSI certification for your specific contaminants. We are vendor-agnostic — we do not manufacture or sell filters — and commercial ranking never overrides the certification data.",
      },
    },
    {
      "@type": "Question",
      name: "Does WaterQualityLens make medical claims?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. We report water-system engineering data and hardware certifications. We do not diagnose exposure, predict health outcomes, or provide medical advice.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/*
        Tonal cadence — the sections below the hero deliberately alternate their
        Section `tone` so the page never presents a flat run of identical bands:

          TrustStrip      base     (credibility rule under the hero)
          HowItWorks      sunken
          Differentiators base
          CoverageStats   inverse  (dark data band, wave seam either side)
          EducationTeaser sunken
          ClosingCta      inverse  (dark closing band, wave seam above)

        Reordering or re-toning these will collapse the rhythm — adjust the tones
        together, not one section in isolation.
      */}
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <Differentiators />
      <CoverageStats />
      <EducationTeaser />
      <ClosingCta />
    </>
  );
}
