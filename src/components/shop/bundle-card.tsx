import { useTranslations } from "next-intl";

type Props = {
  id: string;
  badge: string;
  name: string;
  price: string;
  original: string;
  body: string;
};

export function BundleCard({ badge, name, price, original, body }: Props) {
  const t = useTranslations("shop.card");
  return (
    <article className="flex flex-col rounded-lexi-lg border border-line bg-card p-6 shadow-lexi-sm">
      <span className="inline-flex w-fit items-center rounded-full bg-teal-soft px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-ink">
        {badge}
      </span>
      <h3 className="mt-3 font-display text-lg font-bold text-ink">{name}</h3>
      <p className="mt-3">
        <span className="font-display text-3xl font-bold text-ink">{price}</span>
        <span className="ml-2 text-sm text-ink-2 line-through">{original}</span>
      </p>
      <p className="mt-3 flex-1 text-sm text-ink-2">{body}</p>
      <button
        type="button"
        className="mt-6 rounded-lexi bg-primary px-4 py-2 text-sm font-medium text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {t("addToCart")}
      </button>
    </article>
  );
}
