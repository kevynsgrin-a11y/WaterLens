/**
 * Single source of truth for the canonical origin. Previously this string was
 * duplicated across layout.tsx, sitemap.ts and robots.ts, so a deploy to a
 * different host silently emitted three inconsistent sets of URLs.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://waterqualitylens.com"
).replace(/\/$/, "");

export const SITE_NAME = "WaterQualityLens";
