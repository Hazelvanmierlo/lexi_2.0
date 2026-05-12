import { useTranslations } from "next-intl";
import { BundleCard } from "./bundle-card";

type Bundle = { id: string; badge: string; name: string; price: string; original: string; body: string };

export function BundlesSection({ bundles }: { bundles: Bundle[] }) {
  const t = useTranslations("shop.sections");
  return (
    <section>
      <h2 className="font-display text-xl font-bold uppercase tracking-wider text-ink-2">{t("bundels")}</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {bundles.map((b) => (
          <li key={b.id}><BundleCard {...b} /></li>
        ))}
      </ul>
    </section>
  );
}
