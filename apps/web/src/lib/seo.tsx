import { type Metadata } from "next";

import { faqs, site } from "~/content/site";
import { env } from "~/env";

export const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

export const absoluteUrl = (path = "/") => `${siteUrl}${path === "/" ? "" : path}`;

/** Per-page metadata with canonical URL and matching Open Graph / Twitter tags. */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", siteName: site.name },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Renders structured data. `<` is escaped so content can't break out of the tag. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const sameAs = Object.values(site.social).filter(Boolean);

export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: site.name,
  url: siteUrl,
  logo: `${siteUrl}/icon.svg`,
  description: site.description,
  ...(sameAs.length ? { sameAs } : {}),
};

export const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: site.name,
  url: siteUrl,
  description: site.description,
  inLanguage: "en",
  publisher: { "@id": `${siteUrl}/#organization` },
};

export const softwareAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: site.name,
  url: absoluteUrl("/demo"),
  description: site.description,
  applicationCategory: "HealthApplication",
  operatingSystem: "Any (web browser)",
  browserRequirements: "Requires JavaScript. Notifications need a modern browser.",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@id": `${siteUrl}/#organization` },
};

export const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
