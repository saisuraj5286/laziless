import { type MetadataRoute } from "next";

import { absoluteUrl } from "~/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/features", priority: 0.8, changeFrequency: "monthly" },
    { path: "/demo", priority: 0.8, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  ];
  const lastModified = new Date();
  return pages.map((p) => ({ url: absoluteUrl(p.path), lastModified, ...p }));
}
