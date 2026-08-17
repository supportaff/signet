import type { MetadataRoute } from "next";
import { GUIDES, TOOLS } from "@/lib/catalog";
import { site } from "@/lib/site";

const routes: { path: string; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/generate", changeFrequency: "weekly", priority: 0.95 },
  { path: "/tools", changeFrequency: "weekly", priority: 0.9 },
  ...TOOLS.map((tool) => ({
    path: tool.href,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  })),
  { path: "/guides", changeFrequency: "weekly", priority: 0.85 },
  ...GUIDES.map((guide) => ({
    path: guide.href,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  })),
  { path: "/pricing", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${site.canonical}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
