import type { MetadataRoute } from "next";
import { CITIES, SPORTS, cityToSlug } from "@/lib/constants";

const SITE = "https://iminplay.com";

/**
 * Static sitemap covering the public surface. Game and profile pages
 * aren't enumerated here — they move too fast and we'd rather let
 * inbound links + /c/ + /u/ discovery drive crawl.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const base: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const cities: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${SITE}/c/${cityToSlug(c)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // City × top sports combinations — good for SEO ("pickup football
  // Cape Town" etc.)
  const combos: MetadataRoute.Sitemap = CITIES.flatMap((c) =>
    SPORTS.slice(0, 4).map((s) => ({
      url: `${SITE}/c/${cityToSlug(c)}?sport=${s.id}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  );

  return [...base, ...cities, ...combos];
}
