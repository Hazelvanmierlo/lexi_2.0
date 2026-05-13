"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";

/**
 * Bottom-right floating pill. Visible only when the cart has items
 * (and after client hydration so SSR / CSR markup matches).
 */
export function CartPill() {
  const { itemCount, hydrated } = useCart();
  if (!hydrated || itemCount === 0) return null;
  return (
    <Link
      href="/winkelmand"
      aria-label={`Naar winkelmand met ${itemCount} ${itemCount === 1 ? "artikel" : "artikelen"}`}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-white shadow-lexi transition hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      <span className="font-semibold tabular-nums">{itemCount}</span>
      <span className="text-sm">in winkelmand</span>
    </Link>
  );
}
