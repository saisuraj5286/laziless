import { type MetadataRoute } from "next";

import { absoluteUrl, siteUrl } from "~/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // Allow all crawlers, including AI/answer-engine bots, on public pages.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
