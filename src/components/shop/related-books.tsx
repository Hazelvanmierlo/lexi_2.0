import { WorkbookCard } from "./workbook-card";
import { centsToEuro } from "@/lib/mappings";
import type { DbWorkbookSku } from "@/lib/db-types";

type Props = {
  books: DbWorkbookSku[];
  /** Used when `title` isn't supplied (legacy "Andere boeken voor groep N"). */
  groep?: string;
  /** Custom section title — e.g. "Klanten kochten ook". */
  title?: string;
};

export function RelatedBooks({ books, groep, title }: Props) {
  if (!books.length) return null;
  const heading = title ?? (groep ? `Andere boeken voor groep ${groep}` : "Andere boeken");
  return (
    <section className="mt-16" data-test="related-books">
      <h2 className="font-display text-xl font-bold uppercase tracking-wider text-ink-2">
        {heading}
      </h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {books.map((b) => (
          <li key={b.id}>
            <WorkbookCard
              id={b.id}
              slug={b.slug}
              title={b.title}
              subject={b.subject}
              groep={b.groepBucket}
              price={centsToEuro(b.priceCents)}
              priceCents={b.priceCents}
              symbol={b.coverSymbol}
              tint={b.tint}
              highlightsCount={
                Array.isArray(b.highlights) ? (b.highlights as unknown[]).length : 0
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
