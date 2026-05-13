import { WorkbookCard } from "./workbook-card";
import { centsToEuro } from "@/lib/mappings";
import type { DbWorkbookSku } from "@/lib/db-types";

export function RelatedBooks({ books, groep }: { books: DbWorkbookSku[]; groep: string }) {
  if (!books.length) return null;
  return (
    <section className="mt-16">
      <h2 className="font-display text-xl font-bold uppercase tracking-wider text-ink-2">
        Andere boeken voor groep {groep}
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
