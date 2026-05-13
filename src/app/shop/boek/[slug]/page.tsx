import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BookDetail } from "@/components/shop/book-detail";
import { RelatedBooks } from "@/components/shop/related-books";
import { ShopHeader } from "@/components/shop/shop-header";
import { CartPill } from "@/components/shop/cart-pill";
import { TrustSignals } from "@/components/shop/trust-signals";
import { Breadcrumb } from "@/components/shop/breadcrumb";
import { StickyAddToCart } from "@/components/shop/sticky-add-to-cart";
import { breadcrumbFor } from "@/lib/breadcrumb";
import type { DbWorkbookSku } from "@/lib/db-types";

export const dynamic = "force-dynamic";

/**
 * "Klanten kochten ook" recommendation algorithm (spec §5):
 * 1. Different subject, same groep → up to 3
 * 2. Same subject, neighbouring groep (±1) → fill to 3
 * 3. Any other active workbook (excluding current) → fill to 3
 */
async function getCustomerAlsoBought(current: DbWorkbookSku): Promise<DbWorkbookSku[]> {
  const groepNum = Number.parseInt(current.groepBucket, 10);
  const recs: DbWorkbookSku[] = [];
  const seen = new Set<string>([current.id]);

  // Tier 1: different subject, same groep
  const tier1 = (await db.workbookSku.findMany({
    where: {
      active: true,
      groepBucket: current.groepBucket,
      subject: { not: current.subject },
    },
    take: 3,
  })) as DbWorkbookSku[];
  for (const w of tier1) {
    if (recs.length >= 3) break;
    if (seen.has(w.id)) continue;
    recs.push(w);
    seen.add(w.id);
  }

  // Tier 2: same subject, neighbouring groep
  if (recs.length < 3 && Number.isFinite(groepNum)) {
    const neighbours = [groepNum - 1, groepNum + 1].filter((n) => n >= 1 && n <= 8).map(String);
    if (neighbours.length > 0) {
      const tier2 = (await db.workbookSku.findMany({
        where: {
          active: true,
          subject: current.subject,
          groepBucket: { in: neighbours },
        },
        take: 3,
      })) as DbWorkbookSku[];
      for (const w of tier2) {
        if (recs.length >= 3) break;
        if (seen.has(w.id)) continue;
        recs.push(w);
        seen.add(w.id);
      }
    }
  }

  // Tier 3: any other active workbook
  if (recs.length < 3) {
    const tier3 = (await db.workbookSku.findMany({
      where: { active: true, id: { notIn: Array.from(seen) } },
      take: 3,
    })) as DbWorkbookSku[];
    for (const w of tier3) {
      if (recs.length >= 3) break;
      recs.push(w);
      seen.add(w.id);
    }
  }

  return recs;
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = (await db.workbookSku.findUnique({
    where: { slug },
  })) as DbWorkbookSku | null;
  if (!book) notFound();

  const [related, alsoBought] = await Promise.all([
    db.workbookSku.findMany({
      where: {
        active: true,
        groepBucket: book.groepBucket,
        subject: book.subject,
        slug: { not: book.slug },
      },
      take: 3,
    }) as Promise<DbWorkbookSku[]>,
    getCustomerAlsoBought(book),
  ]);

  const crumbs = breadcrumbFor(`/shop/boek/${slug}`, {
    bookTitle: book.title,
    bookSubject: book.subject,
    bookGroep: book.groepBucket,
  });

  return (
    <>
      <ShopHeader />
      <main id="main-content" className="mx-auto max-w-[1100px] px-5 py-8 pb-28 md:pb-10">
        <Breadcrumb crumbs={crumbs} />
        <div className="mt-6">
          <BookDetail book={book} />
        </div>
        <div className="mt-10">
          <TrustSignals />
        </div>
        {related.length > 0 ? <RelatedBooks books={related} groep={book.groepBucket} /> : null}
        {alsoBought.length > 0 ? (
          <RelatedBooks books={alsoBought} title="Klanten kochten ook" />
        ) : null}
      </main>
      <StickyAddToCart book={book} />
      <CartPill />
    </>
  );
}
