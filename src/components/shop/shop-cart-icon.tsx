"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";

/**
 * Cart icon for the shop header. Click opens the cart drawer (instead of
 * navigating to /winkelmand like the global nav variant).
 */
export function ShopCartIcon({ withLabel = false }: { withLabel?: boolean }) {
  const { itemCount, hydrated, openDrawer } = useCart();
  const show = hydrated && itemCount > 0;
  return (
    <button
      type="button"
      data-test="shop-cart-icon"
      onClick={openDrawer}
      aria-label={show ? `Open winkelmand (${itemCount})` : "Open winkelmand"}
      className="relative inline-flex items-center gap-2 rounded-lexi border border-line bg-card p-2 text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      {withLabel ? <span className="hidden text-sm font-medium md:inline">Winkelmand</span> : null}
      {show ? (
        <span
          data-test="shop-cart-count"
          className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold leading-none text-white tabular-nums"
        >
          {itemCount}
        </span>
      ) : null}
    </button>
  );
}
