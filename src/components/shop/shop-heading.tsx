import { useTranslations } from "next-intl";

export function ShopHeading() {
  const t = useTranslations("shop");
  const h = useTranslations("shop.heading");
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-ink-2">{t("breadcrumb")}</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink text-balance md:text-5xl">
        {h("title")}
      </h1>
      <p className="mt-3 max-w-2xl text-ink-2 md:text-lg">{h("lead")}</p>
    </div>
  );
}
