"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { nav } from "~/content/site";

/**
 * Phone/tablet menu. Built on <details> so it works without JavaScript; the
 * effects just close it after navigating, on Escape, or on an outside tap.
 */
export function MobileMenu() {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  useEffect(() => {
    const close = (e: Event) => {
      const el = ref.current;
      if (!el?.open) return;
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !el.contains(e.target as Node)) {
        el.open = false;
      }
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, []);

  return (
    <details ref={ref} className="relative md:hidden">
      <summary
        className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-xl text-2xl hover:bg-stone-100 dark:hover:bg-stone-900"
        aria-label="Open menu"
      >
        ☰
      </summary>
      <nav
        aria-label="Mobile"
        className="absolute right-0 mt-2 flex w-[min(16rem,calc(100vw-2rem))] flex-col rounded-2xl border border-stone-200 bg-white p-2 shadow-xl dark:border-stone-800 dark:bg-stone-900"
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-4 py-3 text-base font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/demo"
          className="mt-1 rounded-lg bg-emerald-600 px-4 py-3 text-center text-base font-bold text-white"
        >
          Try the demo
        </Link>
      </nav>
    </details>
  );
}
