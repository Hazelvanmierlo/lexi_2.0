"use client";

import { Minus, Plus, X } from "lucide-react";
import { BookMockup } from "@/components/shop/book-mockup";
import { useCart } from "@/lib/cart-context";
import { centsToEuro } from "@/lib/mappings";
import type { CartItem } from "@/lib/cart";
import { MascotImage } from "@/components/ui/mascot";

type Props = {
  item: CartItem;
  idx: number;
  /** Tighter layout for the cart drawer (smaller mockup, less padding). */
  compact?: boolean;
};

export function CartLineItem({ item, idx, compact = false }: Props) {
  const { setQty, remove } = useCart();
  const padClass = compact ? "p-3" : "p-4";
  const gapClass = compact ? "gap-3" : "gap-4";
  const mockupWidthClass = compact ? "w-14" : "w-20";
  const titleSizeClass = compact ? "text-sm" : "text-base";
  const priceSizeClass = compact ? "text-base" : "text-lg";

  if (item.kind === "workbook") {
    const lineTotal = item.priceCents * item.qty;
    return (
      <li
        data-test="cart-line-workbook"
        className={`flex ${gapClass} rounded-lexi border border-line bg-card ${padClass}`}
      >
        <div className={`${mockupWidthClass} shrink-0`}>
          <BookMockup
            title={item.title}
            subject="TAAL"
            groep="-"
            symbol={item.title.charAt(0).toUpperCase()}
            size="card"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-display ${titleSizeClass} font-bold text-ink`}>{item.title}</h3>
            <button
              type="button"
              onClick={() => remove(idx)}
              aria-label="Verwijder uit winkelmand"
              data-test="cart-line-remove"
              className="rounded p-1 text-ink-2 hover:bg-bg-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className={`mt-1 ${compact ? "text-xs" : "text-sm"} text-ink-2`}>
            {centsToEuro(item.priceCents)} per stuk
          </p>
          <div className={`mt-auto flex items-center justify-between ${compact ? "pt-2" : "pt-3"}`}>
            <div className="inline-flex items-center rounded-lexi border border-line">
              <button
                type="button"
                onClick={() => setQty(idx, item.qty - 1)}
                aria-label="Aantal verlagen"
                data-test="cart-qty-minus"
                className={`${compact ? "p-1.5" : "p-2"} text-ink-2 hover:bg-bg-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span
                aria-live="polite"
                className="min-w-8 px-2 text-center font-mono text-sm font-medium text-ink tabular-nums"
              >
                {item.qty}
              </span>
              <button
                type="button"
                onClick={() => setQty(idx, item.qty + 1)}
                aria-label="Aantal verhogen"
                data-test="cart-qty-plus"
                className={`${compact ? "p-1.5" : "p-2"} text-ink-2 hover:bg-bg-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className={`font-display ${priceSizeClass} font-bold text-ink`}>
              {centsToEuro(lineTotal)}
            </p>
          </div>
        </div>
      </li>
    );
  }

  // Uitblinker
  const subjLabelMap: Record<string, string> = {
    TAAL: "Taal",
    REKENEN: "Rekenen",
    LEZEN: "Begrijpend Lezen",
  };
  const ubBoxSizeClass = compact ? "h-20 w-14" : "h-28 w-20";
  const mascotSize = compact ? 40 : 56;
  return (
    <li
      data-test="cart-line-uitblinker"
      className={`flex ${gapClass} rounded-lexi border border-line bg-card ${padClass}`}
    >
      <div
        className={`flex ${ubBoxSizeClass} shrink-0 items-center justify-center rounded-lexi bg-primary-soft`}
      >
        <MascotImage
          style="bot"
          age="kid"
          size={mascotSize}
          decorative
          className={compact ? "h-10 w-10" : "h-14 w-14"}
        />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-display ${titleSizeClass} font-bold text-ink`}>
            Uitblinker — {item.kidName}
          </h3>
          <button
            type="button"
            onClick={() => remove(idx)}
            aria-label="Verwijder uit winkelmand"
            data-test="cart-line-remove"
            className="rounded p-1 text-ink-2 hover:bg-bg-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className={`mt-1 ${compact ? "text-xs" : "text-sm"} text-ink-2`}>
          {subjLabelMap[item.subject] ?? item.subject} · Per maand, opzegbaar
        </p>
        {!compact ? (
          <p className="mt-1 text-sm text-ink-2">
            Bezorgen op: {item.shipping.line1}, {item.shipping.postcode} {item.shipping.city}
          </p>
        ) : null}
        <div className={`mt-auto flex items-center justify-end ${compact ? "pt-2" : "pt-3"}`}>
          <p className={`font-display ${priceSizeClass} font-bold text-ink`}>
            {centsToEuro(item.priceCents)}
            <span className="ml-1 text-sm font-normal text-ink-2">/maand</span>
          </p>
        </div>
      </div>
    </li>
  );
}
