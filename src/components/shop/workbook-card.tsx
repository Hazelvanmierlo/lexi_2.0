import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  id: string;
  slug: string;
  title: string;
  groep: string;
  price: string;
  symbol: string;
  tint: string;
  highlightsCount?: number;
};

export function WorkbookCard({ slug, title, groep, price, symbol, tint, highlightsCount }: Props) {
  const t = useTranslations("shop.card");
  return (
    <article
      data-test="workbook-card"
      className="flex flex-col overflow-hidden rounded-lexi-lg border border-line bg-card shadow-lexi-sm transition hover:-translate-y-0.5 hover:shadow-lexi"
    >
      <Link
        href={`/shop/boek/${slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <div
          className={`flex items-center justify-center ${tint} aspect-square text-7xl font-display font-bold text-ink`}
          aria-hidden="true"
        >
          {symbol}
        </div>
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
        <Link
          href={`/shop/boek/${slug}`}
          className="mt-3 inline-flex items-center justify-center gap-1 rounded-lexi border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Bekijk boek <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
