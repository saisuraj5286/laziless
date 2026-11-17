import Link from "next/link";

import { Logo } from "~/app/_components/marketing/site-header";
import { nav, site } from "~/content/site";

export function SiteFooter() {
  const socials = Object.entries(site.social).filter(([, url]) => url);

  return (
    <footer className="mt-24 border-t border-stone-200 dark:border-stone-800">
      <div className="page-x grid gap-8 py-12 sm:grid-cols-[50%_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-stone-500 sm:w-[70%] dark:text-stone-400">{site.tagline}</p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          <Link href="/demo" className="hover:text-emerald-600">Try the demo</Link>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-emerald-600">
              {item.label}
            </Link>
          ))}
          <Link href="/privacy" className="hover:text-emerald-600">Privacy</Link>
        </nav>

        <div className="flex flex-col gap-2 text-sm">
          {site.contactEmail && (
            <a href={`mailto:${site.contactEmail}`} className="hover:text-emerald-600">
              {site.contactEmail}
            </a>
          )}
          {socials.map(([name, url]) => (
            <a key={name} href={url} rel="me noopener" target="_blank" className="capitalize hover:text-emerald-600">
              {name}
            </a>
          ))}
          <p className="text-stone-500 dark:text-stone-400">
            Laziless is a wellbeing tool, not medical advice.
          </p>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} {site.name}
      </p>
    </footer>
  );
}
