import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Geist } from "next/font/google";

import { SiteFooter } from "~/app/_components/marketing/site-footer";
import { SiteHeader } from "~/app/_components/marketing/site-header";
import { site } from "~/content/site";
import { JsonLd, organizationLd, siteUrl, websiteLd } from "~/lib/seo";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name}: tiny tasks to beat laziness`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: "/",
    title: `${site.name}: tiny tasks to beat laziness`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name}: tiny tasks to beat laziness`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  icons: [
    { rel: "icon", url: "/icon.svg", type: "image/svg+xml" },
    { rel: "icon", url: "/favicon.ico", sizes: "any" },
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="flex min-h-screen flex-col bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
        <JsonLd data={[organizationLd, websiteLd]} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <SiteHeader />
        <TRPCReactProvider>
          <main id="main" className="flex-1">
            {children}
          </main>
        </TRPCReactProvider>
        <SiteFooter />
      </body>
    </html>
  );
}
