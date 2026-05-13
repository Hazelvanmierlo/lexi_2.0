import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { BookDetail } from "@/components/shop/book-detail";
import { RelatedBooks } from "@/components/shop/related-books";
import { ShopHeader } from "@/components/shop/shop-header";
import { CartPill } from "@/components/shop/cart-pill";
import type { DbWorkbookSku } from "@/lib/db-types";

export const dynamic = "force-dynamic";

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

  const related = (await db.workbookSku.findMany({
    where: {
      active: true,
      groepBucket: book.groepBucket,
      slug: { not: book.slug },
    },
    take: 3,
  })) as DbWorkbookSku[];

  return (
    <>
      <ShopHeader />
      <main id="main-content" className="mx-auto max-w-[1100px] px-5 py-10">
        <nav className="mb-6 font-mono text-xs uppercase tracking-wider text-ink-2">
          <Link href="/shop" className="hover:text-ink">
            Shop
          </Link>
          <span> / Werkboeken / {book.title}</span>
        </nav>
        <BookDetail book={book} />
        <RelatedBooks books={related} groep={book.groepBucket} />
      </main>
      <CartPill />
    </>
  );
}
