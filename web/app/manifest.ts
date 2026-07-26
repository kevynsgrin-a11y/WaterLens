import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WaterQualityLens — address-level tap water quality intelligence",
    short_name: "WaterQualityLens",
    description:
      "Identify the public water system serving a US address, review the contaminants it reports against federal limits with full provenance, and match the retail filters independently NSF/ANSI-certified to remove them.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7f9",
    theme_color: "#1b3e59",
    categories: ["utilities", "reference", "health"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
