import { useTranslations } from "next-intl";
import { WorkbookCard } from "./workbook-card";

type Workbook = {
  id: string;
  slug: string;
  title: string;
  subject: string;
  groep: string;
  price: string;
  symbol: string;
  tint: string;
  highlightsCount?: number;
};

export function WerkboekenGrid({ workbooks }: { workbooks: Workbook[] }) {
  const t = useTranslations("shop.sections");
  return (
    <section>
      <h2 className="font-display text-xl font-bold uppercase tracking-wider text-ink-2">
        {t("werkboeken")}
      </h2>
      {workbooks.length === 0 ? (
        <p className="mt-4 rounded-lexi border border-line bg-card p-6 text-center text-ink-2">
          Geen werkboeken gevonden voor deze filter.
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {workbooks.map((w) => (
            <li key={w.id}>
              <WorkbookCard {...w} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
