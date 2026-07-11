import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://krasavitsa.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    ["", 1],
    ["/care", 0.9],
    ["/blog", 0.8],
    ["/about", 0.65],
    ["/profile", 0.65],
    ["/privacy", 0.3],
    ["/personal-data", 0.3],
    ["/terms", 0.3],
  ] as const;

  return routes.map(([route, priority]) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  }));
}
