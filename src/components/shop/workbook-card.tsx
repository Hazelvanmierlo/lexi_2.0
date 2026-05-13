"use client";

import Link from "next/link";
import { Check, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { BookMockup } from "./book-mockup";
import { StockLine } from "./stock-line";
import { useCart } from "@/lib/cart-context";

type Props = {
  id: string;
  slug: string;
  title: string;
  subject: string;
  groep: string;
  price: string;
  priceCents: number;
  symbol: string;
  tint: string;
  highlightsCount?: number;
};

export function WorkbookCard({
  slug,
  title,
  subject,
  groep,
  price,
  priceCents,
  symbol,
  highlightsCount,
}: Props) {
  const t = useTranslations("shop.card");
  const { addWorkbook } = useCart();
  return (
    <article
      data-test="workbook-card"
      className="flex flex-col overflow-hidden rounded-lexi-lg border border-line bg-card shadow-lexi-sm transition hover:-translate-y-0.5 hover:shadow-lexi"
    >
      <Link
        href={`/shop/boek/${slug}`}
        className="block bg-bg-2 p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <BookMockup title={title} subject={subject} groep={groep} symbol={symbol} size="card" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">
          {t("groepLabel")} {groep}
        </p>
        <h3 className="mt-1 font-display text-sm font-bold text-ink line-clamp-2">
          <Link href={`/shop/boek/${slug}`} className="hover:underline">
            {title}
          </Link>
        </h3>
        {highlightsCount && highlightsCount > 0 ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-ink-2">
            <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
            {highlightsCount} kenmerken
          </p>
        ) : null}
        <p className="mt-3 font-display text-lg font-bold text-ink">{price}</p>
        <div className="mt-1">
          <StockLine short />
        </div>
        <button
          type="button"
          data-test="add-to-cart"
          onClick={(e) => {
            e.preventDefault();
            addWorkbook({ slug, title, priceCents }, 1);
          }}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lexi bg-primary px-3 py-2 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          In winkelmand
        </button>
      </div>
    </article>
  );
}
