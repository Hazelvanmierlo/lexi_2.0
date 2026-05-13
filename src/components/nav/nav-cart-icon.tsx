"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";

/**
 * Small inline cart icon for the top nav. Shows a badge with the count once
 * the cart hydrates. Always renders (with no badge) before hydration so
 * server and client markup match.
 */
export function NavCartIcon() {
  const { itemCount, hydrated } = useCart();
  const show = hydrated && itemCount > 0;
  return (
    <Link
      href="/winkelmand"
      aria-label={show ? `Winkelmand (${itemCount})` : "Winkelmand"}
      className="relative inline-flex items-center justify-center rounded-lexi border border-line bg-card p-2 text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      {show ? (
        <span
          data-test="nav-cart-count"
          className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold leading-none text-white tabular-nums"
        >
          {itemCount}
        </span>
      ) : null}
    </Link>
  );
}
