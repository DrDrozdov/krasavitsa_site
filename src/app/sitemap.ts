import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://krasavitsa-ai.ru";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    ["", 1],
    ["/care", 0.9],
    ["/scanner", 0.85],
    ["/blog", 0.8],
    ["/about", 0.65],
    ["/profile", 0.65],
    ["/privacy", 0.3],
    ["/cookies", 0.3],
    ["/personal-data", 0.3],
    ["/terms", 0.3],
  ] as const;

  const staticRoutes: MetadataRoute.Sitemap = routes.map(([route, priority]) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  }));

  const journalRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  return [...staticRoutes, ...journalRoutes];
}
