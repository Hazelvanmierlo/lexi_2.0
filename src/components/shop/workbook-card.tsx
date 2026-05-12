import { useTranslations } from "next-intl";

type Props = {
  id: string;
  title: string;
  groep: string;
  price: string;
  symbol: string;
  tint: string;
};

export function WorkbookCard({ title, groep, price, symbol, tint }: Props) {
  const t = useTranslations("shop.card");
  return (
    <article className="flex flex-col overflow-hidden rounded-lexi-lg border border-line bg-card shadow-lexi-sm">
      <div className={`flex items-center justify-center ${tint} aspect-square text-7xl font-display font-bold text-ink`} aria-hidden="true">
        {symbol}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">{t("groepLabel")} {groep}</p>
        <h3 className="mt-1 font-display text-sm font-bold text-ink line-clamp-2">{title}</h3>
        <p className="mt-3 font-display text-lg font-bold text-ink">{price}</p>
        <button
          type="button"
          className="mt-3 rounded-lexi border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t("addToCart")}
        </button>
      </div>
    </article>
  );
}
