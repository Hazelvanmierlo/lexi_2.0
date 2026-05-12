import { useTranslations } from "next-intl";
import { SubscriptionCard } from "./subscription-card";

type Sub = { id: string; badge: string; name: string; price: string; interval: string; body: string };

export function AbonnementenSection({ subs }: { subs: Sub[] }) {
  const t = useTranslations("shop.sections");
  return (
    <section>
      <h2 className="font-display text-xl font-bold uppercase tracking-wider text-ink-2">{t("abonnementen")}</h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-3">
        {subs.map((s) => (
          <li key={s.id}><SubscriptionCard {...s} /></li>
        ))}
      </ul>
    </section>
  );
}
