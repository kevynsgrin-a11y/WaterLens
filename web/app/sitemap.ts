import type { MetadataRoute } from "next";
import { CONTAMINANTS, DEMO_SYSTEMS } from "@/lib/data";
import { demoProfile } from "@/lib/lookup";
import { matchFilters } from "@/lib/engine";

const BASE = "https://waterqualitylens.com";

/** Mirror of the entity-page SEO quality gate (§9). */
function pwsIndexable(pwsid: string): boolean {
  const profile = demoProfile(pwsid);
  if (!profile) return false;
  const exceedances = profile.detections.filter((d) => d.exceeds_mcl).length;
  const recommendations = matchFilters(profile.detections, "UNKNOWN").length;
  return exceedances > 0 && profile.history.length > 0 && recommendations >= 3;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/registry`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/contaminants`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/methodology`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/legal`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const contaminantRoutes: MetadataRoute.Sitemap = CONTAMINANTS.map((c) => ({
    url: `${BASE}/contaminants/${c.code}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const pwsRoutes: MetadataRoute.Sitemap = DEMO_SYSTEMS.filter((d) =>
    pwsIndexable(d.system.pwsid)
  ).map((d) => ({
    url: `${BASE}/pws/${d.system.pwsid}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...contaminantRoutes, ...pwsRoutes];
}
