"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { CartLineItem } from "@/components/winkelmand/cart-line-item";
import { PaymentLogos } from "@/components/shop/payment-logos";
import { centsToEuro } from "@/lib/mappings";

/**
 * Right-side slide-in cart panel. Mounted globally in <CartProvider> so any
 * page (and the floating cart icon) can open it via openDrawer().
 *
 * - 400px wide on desktop; full width on mobile with backdrop
 * - Esc + backdrop click close
 * - Body scroll locked while open
 */
export function CartDrawer() {
  const { items, subtotalCents, drawerOpen, closeDrawer } = useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", onKey);
    // Lock body scroll while drawer is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  return (
    <div data-test="cart-drawer-root">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Sluit winkelmand"
        onClick={closeDrawer}
        className="fixed inset-0 z-40 bg-ink/30"
      />
      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Winkelmand"
        data-test="cart-drawer"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="font-display text-lg font-bold text-ink">
            Winkelmand ({items.length})
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Sluit winkelmand"
            data-test="cart-drawer-close"
            className="rounded p-1 text-ink-2 hover:bg-bg-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <ul className="flex-1 space-y-3 overflow-y-auto p-5" data-test="cart-drawer-items">
          {items.length === 0 ? (
            <li>
              <p className="py-12 text-center text-ink-2">Je winkelmand is leeg.</p>
            </li>
          ) : (
            items.map((it, idx) => (
              <CartLineItem
                key={it.kind === "workbook" ? `wb-${it.slug}-${idx}` : `ub-${it.kidName}-${idx}`}
                item={it}
                idx={idx}
                compact
              />
            ))
          )}
        </ul>

        {/* Footer */}
        <div className="space-y-3 border-t border-line p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-2">Subtotaal</span>
            <span
              className="font-display text-lg font-bold text-ink tabular-nums"
              data-test="cart-drawer-subtotal"
            >
              {centsToEuro(subtotalCents)}
            </span>
          </div>
          <Link
            href="/afrekenen"
            onClick={closeDrawer}
            data-test="cart-drawer-checkout"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lexi bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Naar afrekenen <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={closeDrawer}
            data-test="cart-drawer-continue"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lexi border border-line bg-card px-5 py-2.5 text-sm font-medium text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Verder winkelen
          </button>
          <PaymentLogos />
        </div>
      </aside>
    </div>
  );
}
