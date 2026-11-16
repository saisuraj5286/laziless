import Link from "next/link";

import { MobileMenu } from "~/app/_components/marketing/mobile-menu";
import { nav } from "~/content/site";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2.5 text-[clamp(1.5rem,2.2vw,2.25rem)] font-extrabold tracking-tight"
      aria-label="Laziless home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG */}
      <img src="/icon.svg" alt="" width={40} height={40} className="h-[1.3em] w-[1.3em]" />
      <span>
        lazi<span className="text-emerald-600">less</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-stone-50/85 backdrop-blur dark:border-stone-800/70 dark:bg-stone-950/85">
      <div className="page-x flex h-16 items-center justify-between gap-4 sm:h-20 lg:h-24">
        <Logo />

        {/* Tablet landscape and up. */}
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-base font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 lg:px-4 lg:text-lg dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/demo"
            className="ml-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-base font-bold whitespace-nowrap text-white transition hover:bg-emerald-700 lg:ml-3 lg:px-6 lg:py-3 lg:text-lg"
          >
            Try the demo
          </Link>
        </nav>

        {/* Phones and portrait tablets. */}
        <MobileMenu />
      </div>
    </header>
  );
}
