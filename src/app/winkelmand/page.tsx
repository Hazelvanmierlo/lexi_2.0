"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShopHeader } from "@/components/shop/shop-header";
import { TrustSignals } from "@/components/shop/trust-signals";
import { CartLineItem } from "@/components/winkelmand/cart-line-item";
import { CartSummary } from "@/components/winkelmand/cart-summary";
import { MascotImage } from "@/components/ui/mascot";
import { useCart } from "@/lib/cart-context";

export default function WinkelmandPage() {
  const { items, subtotalCents, hydrated } = useCart();

  return (
    <>
      <ShopHeader />
      <main id="main-content" className="mx-auto max-w-[1100px] px-5 py-10">
        <nav className="mb-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-ink-2 hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Verder winkelen
          </Link>
        </nav>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Je winkelmand
        </h1>

        {!hydrated ? (
          <p className="mt-8 text-sm text-ink-2">Laden...</p>
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
            <ul className="space-y-4" data-test="cart-items">
              {items.map((it, idx) => (
                <CartLineItem
                  key={
                    it.kind === "workbook" ? `wb-${it.slug}-${idx}` : `ub-${it.kidName}-${idx}`
                  }
                  item={it}
                  idx={idx}
                />
              ))}
            </ul>
            <div className="space-y-6">
              <CartSummary subtotalCents={subtotalCents} />
              <TrustSignals />
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function EmptyCart() {
  return (
    <div
      data-test="cart-empty"
      className="mt-12 flex flex-col items-center text-center"
    >
      <MascotImage style="bot" age="kid" size={96} decorative className="h-24 w-24" />
      <h2 className="mt-6 font-display text-xl font-bold text-ink">Je winkelmand is nog leeg</h2>
      <p className="mt-2 max-w-prose text-ink-2">
        Bekijk onze werkboeken of meld je aan voor een Uitblinker-abonnement.
      </p>
      <Link
        href="/shop"
        className="mt-6 inline-flex items-center gap-2 rounded-lexi bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Bekijk werkboeken
      </Link>
    </div>
  );
}
