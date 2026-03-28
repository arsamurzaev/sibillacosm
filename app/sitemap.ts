import type { MetadataRoute } from "next";
import { getActiveCities } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const cities = await getActiveCities();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/training`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...cities.map((city, index) => ({
      url: `${siteUrl}/prices/${city.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: index === 0 ? 0.9 : 0.8,
    })),
  ];
}
