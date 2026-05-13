import Link from "next/link";
import { HelpCircle, Mail, Search, Truck, UserCircle } from "lucide-react";
import { MascotImage } from "@/components/ui/mascot";
import { ShopCartIcon } from "./shop-cart-icon";

/**
 * Three-level shop header.
 * - Top bar (32px): contact + free-shipping promise
 * - Main header (~70px): brand · search · account · help · cart
 * - Category bar (48px, desktop only): subject anchors + Uitblinker + Word lid
 *
 * Sync component (works in both server and client pages). The account link
 * points to /ouder — Clerk middleware handles the unauthenticated redirect
 * to /login on visit. This keeps the header usable in `"use client"` pages
 * like /winkelmand and /afrekenen.
 */
export function ShopHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line-2 bg-card">
      {/* Top bar */}
      <div className="border-b border-line-2 bg-bg-2 text-xs text-ink-2">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-1.5">
          <a
            href="mailto:hallo@lexi.kids"
            className="hidden items-center gap-1.5 hover:text-ink sm:inline-flex"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            Vragen? Mail hallo@lexi.kids
          </a>
          <p className="inline-flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
            Gratis verzending vanaf € 25
          </p>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-5 py-3 md:gap-6">
        <Link
          href="/"
          aria-label="Lexi.kids home"
          className="flex shrink-0 items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <MascotImage style="bot" age="kid" size={32} decorative className="h-8 w-8" />
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            Lexi.kids
          </span>
        </Link>

        {/* Search (desktop) */}
        <form
          action="/shop"
          method="GET"
          role="search"
          className="hidden flex-1 md:block"
        >
          <label className="relative block">
            <span className="sr-only">Zoek werkboeken</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              data-test="shop-search-input"
              placeholder="Zoek een werkboek of onderwerp…"
              className="w-full rounded-lexi border border-line bg-card py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-2 focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </label>
        </form>

        <nav className="ml-auto flex items-center gap-2" aria-label="Account en winkelmand">
          <Link
            href="/ouder"
            aria-label="Mijn account"
            className="inline-flex items-center gap-1.5 rounded-lexi border border-line bg-card p-2 text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <UserCircle className="h-5 w-5" aria-hidden="true" />
            <span className="hidden text-sm font-medium md:inline">Account</span>
          </Link>
          <Link
            href="/hulp"
            aria-label="Klantenservice"
            className="inline-flex items-center gap-1.5 rounded-lexi border border-line bg-card p-2 text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
            <span className="hidden text-sm font-medium md:inline">Hulp</span>
          </Link>
          <ShopCartIcon withLabel />
        </nav>
      </div>

      {/* Mobile search */}
      <div className="border-t border-line-2 bg-card px-5 pb-3 pt-1 md:hidden">
        <form action="/shop" method="GET" role="search">
          <label className="relative block">
            <span className="sr-only">Zoek werkboeken</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              placeholder="Zoek een werkboek…"
              className="w-full rounded-lexi border border-line bg-card py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-2 focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </label>
        </form>
      </div>

      {/* Category bar (desktop only) */}
      <div className="hidden border-t border-line-2 bg-card md:block">
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-5 py-2 text-sm">
          <span className="font-medium text-ink-2">Werkboeken:</span>
          <ul className="flex items-center gap-1">
            <li>
              <Link
                href="/shop?subject=taal"
                className="rounded-full px-3 py-1 font-medium text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Taal
              </Link>
            </li>
            <li>
              <Link
                href="/shop?subject=rekenen"
                className="rounded-full px-3 py-1 font-medium text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Rekenen
              </Link>
            </li>
            <li>
              <Link
                href="/shop?subject=lezen"
                className="rounded-full px-3 py-1 font-medium text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Begrijpend Lezen
              </Link>
            </li>
          </ul>
          <span className="text-line-2" aria-hidden="true">
            ·
          </span>
          <Link
            href="/shop/uitblinker"
            className="rounded-full px-3 py-1 font-medium text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Uitblinker
          </Link>
          <span className="text-line-2" aria-hidden="true">
            ·
          </span>
          <Link
            href="/word-lid"
            className="rounded-full px-3 py-1 font-medium text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Word lid
          </Link>
        </div>
      </div>
    </header>
  );
}
