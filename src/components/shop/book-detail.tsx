"use client";

import { CheckCircle2, ShoppingCart } from "lucide-react";
import { centsToEuro, subjectLabel } from "@/lib/mappings";
import { renderMarkdown } from "@/lib/markdown";
import { BookHighlights } from "./book-highlights";
import { BookMockup } from "./book-mockup";
import { useCart } from "@/lib/cart-context";
import type { DbWorkbookSku } from "@/lib/db-types";

function highlightsArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

export function BookDetail({ book }: { book: DbWorkbookSku }) {
  const highlights = highlightsArray(book.highlights);
  const blocks = renderMarkdown(book.description);
  const subjLabel = subjectLabel(book.subject);
  const { addWorkbook } = useCart();

  return (
    <article>
      {/* Hero: cover left, meta right */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex w-full items-center justify-center rounded-lexi-lg border border-line bg-bg-2 p-6">
          <div className="w-full max-w-[320px]">
            <BookMockup
              title={book.title}
              subject={book.subject}
              groep={book.groepBucket}
              symbol={book.coverSymbol}
              size="hero"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-line bg-card px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-ink-2">
              {subjLabel}
            </span>
            <span className="inline-flex items-center rounded-full border border-line bg-card px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-ink-2">
              Groep {book.groepBucket}
            </span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
            {book.title}
          </h1>
          <p className="mt-4 font-display text-4xl font-bold text-ink">
            {centsToEuro(book.priceCents)}
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-ok">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Op voorraad
          </p>
          <button
            type="button"
            data-test="add-to-cart-detail"
            onClick={() =>
              addWorkbook(
                { slug: book.slug, title: book.title, priceCents: book.priceCents },
                1,
              )
            }
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lexi bg-primary px-5 py-3 text-base font-semibold text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:w-auto"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            In winkelmandje
          </button>
          <p className="mt-2 text-xs text-ink-2">
            Morgen in huis · Gratis bezorging vanaf € 25
          </p>

          {highlights.length > 0 ? (
            <div className="mt-6">
              <p className="font-mono text-xs uppercase tracking-wider text-ink-2">Highlights</p>
              <div className="mt-2">
                <BookHighlights items={highlights} />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Description */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-ink-2">
          Over dit boek
        </h2>
        <div className="mt-4 space-y-4 text-ink">
          {blocks.map((b, i) =>
            b.kind === "p" ? (
              <p key={i} className="leading-relaxed">
                {b.text}
              </p>
            ) : (
              <ul key={i} className="ml-6 list-disc space-y-1">
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            ),
          )}
        </div>
      </section>

      {/* Voor wie */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-ink-2">
          Voor wie is dit boek?
        </h2>
        <p className="mt-4 text-ink">
          Groep {book.groepBucket} — kinderen die de basis van {subjLabel.toLowerCase()} willen
          oefenen, zelfstandig of met een ouder erbij.
        </p>
      </section>

      {/* Specs */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-ink-2">
          Specificaties
        </h2>
        <dl className="mt-4 divide-y divide-line rounded-lexi border border-line bg-card">
          <div className="flex justify-between px-4 py-3 text-sm">
            <dt className="text-ink-2">Onderwerp</dt>
            <dd className="font-medium text-ink">{subjLabel}</dd>
          </div>
          <div className="flex justify-between px-4 py-3 text-sm">
            <dt className="text-ink-2">Groep</dt>
            <dd className="font-medium text-ink">{book.groepBucket}</dd>
          </div>
          <div className="flex justify-between px-4 py-3 text-sm">
            <dt className="text-ink-2">Pagina&apos;s</dt>
            <dd className="font-medium text-ink">{book.pages}</dd>
          </div>
          {book.isbn ? (
            <div className="flex justify-between px-4 py-3 text-sm">
              <dt className="text-ink-2">ISBN</dt>
              <dd className="font-mono text-ink">{book.isbn}</dd>
            </div>
          ) : null}
        </dl>
      </section>
    </article>
  );
}
