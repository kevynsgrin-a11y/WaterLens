import type { MetadataRoute } from "next";
import { CONTAMINANTS, DEMO_SYSTEMS } from "@/lib/data";
import { demoProfile } from "@/lib/lookup";
import { SITE_URL } from "@/lib/site";

/**
 * Mirror of the entity-page SEO quality gate (§9). Kept deliberately in step
 * with app/pws/[pwsid]/page.tsx — a page in the sitemap that serves `noindex`
 * is a crawl-budget leak and a Search Console error.
 */
function pwsIndexable(pwsid: string): boolean {
  const profile = demoProfile(pwsid);
  if (!profile) return false;
  return profile.detections.length >= 1 && profile.history.length >= 2;
}

/** Newest sample date on a system, so lastModified reflects the data, not the build. */
function pwsLastModified(pwsid: string): Date {
  const profile = demoProfile(pwsid);
  const dates = [
    ...(profile?.detections ?? []).map((d) => d.sample_date),
    ...(profile?.history ?? []).map((h) => h.sample_date),
  ].filter((d): d is string => Boolean(d));
  if (dates.length === 0) return new Date();
  return new Date(`${dates.sort().at(-1)}T00:00:00Z`);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/registry`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/contaminants`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/pws`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/methodology`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/legal`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const contaminantRoutes: MetadataRoute.Sitemap = CONTAMINANTS.map((c) => ({
    url: `${SITE_URL}/contaminants/${c.code}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const pwsRoutes: MetadataRoute.Sitemap = DEMO_SYSTEMS.filter((d) =>
    pwsIndexable(d.system.pwsid)
  ).map((d) => ({
    url: `${SITE_URL}/pws/${d.system.pwsid}`,
    lastModified: pwsLastModified(d.system.pwsid),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...contaminantRoutes, ...pwsRoutes];
}
