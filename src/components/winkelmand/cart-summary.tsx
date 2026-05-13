"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { centsToEuro } from "@/lib/mappings";
import { shippingCents } from "@/lib/cart";

type Props = {
  subtotalCents: number;
  /** If true, hide checkout CTA (e.g. on the checkout page itself). */
  hideCheckoutCta?: boolean;
};

export function CartSummary({ subtotalCents, hideCheckoutCta = false }: Props) {
  const shipping = shippingCents(subtotalCents);
  const total = subtotalCents + shipping;
  const freeShipMet = subtotalCents >= 2500;

  return (
    <aside
      data-test="cart-summary"
      className="rounded-lexi-lg border border-line bg-card p-5"
    >
      <h2 className="font-display text-lg font-bold text-ink">Overzicht</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink-2">Subtotaal</dt>
          <dd className="font-mono font-medium text-ink tabular-nums">
            {centsToEuro(subtotalCents)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-2">Verzendkosten</dt>
          <dd className="font-mono font-medium text-ink tabular-nums">
            {shipping === 0 ? "Gratis" : centsToEuro(shipping)}
          </dd>
        </div>
        {!freeShipMet ? (
          <p className="text-xs text-ink-2">
            Nog {centsToEuro(2500 - subtotalCents)} tot gratis bezorging.
          </p>
        ) : null}
      </dl>
      <hr className="my-4 border-line" />
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-bold text-ink">Totaal</p>
        <p
          className="font-display text-2xl font-bold text-ink tabular-nums"
          data-test="cart-total"
        >
          {centsToEuro(total)}
        </p>
      </div>
      {!hideCheckoutCta ? (
        <Link
          href="/afrekenen"
          data-test="cart-checkout"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lexi bg-primary px-5 py-3 text-base font-semibold text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Naar afrekenen
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      ) : null}
    </aside>
  );
}
