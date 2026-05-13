"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { centsToEuro } from "@/lib/mappings";
import type { DbWorkbookSku } from "@/lib/db-types";

/**
 * Mobile-only sticky bar at the bottom of the book detail page: shows price +
 * "In winkelmand" while the user scrolls the description. Desktop hides this
 * (md:hidden); the in-page primary CTA in the right column remains.
 *
 * Detail page body adds pb-24 (or larger) so the bar doesn't cover content.
 */
export function StickyAddToCart({ book }: { book: DbWorkbookSku }) {
  const { addWorkbook } = useCart();
  return (
    <div
      data-test="sticky-add-to-cart"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card p-3 shadow-lexi md:hidden"
    >
      <div className="mx-auto flex max-w-[600px] items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold text-ink tabular-nums">
            {centsToEuro(book.priceCents)}
          </p>
          <p className="text-xs text-ok">Op voorraad</p>
        </div>
        <button
          type="button"
          data-test="sticky-add-button"
          onClick={() =>
            addWorkbook({ slug: book.slug, title: book.title, priceCents: book.priceCents }, 1)
          }
          className="inline-flex items-center gap-2 rounded-lexi bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" /> In winkelmand
        </button>
      </div>
    </div>
  );
}
