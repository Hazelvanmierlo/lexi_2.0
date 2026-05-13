import Link from "next/link";
import { db } from "@/lib/db";
import { ShopHeader } from "@/components/shop/shop-header";
import { ShopHeading } from "@/components/shop/shop-heading";
import { FilterBar } from "@/components/shop/filter-bar";
import { UitblinkerHero } from "@/components/shop/uitblinker-hero";
import { WerkboekenGrid } from "@/components/shop/werkboeken-grid";
import { CartPill } from "@/components/shop/cart-pill";
import { TrustSignals } from "@/components/shop/trust-signals";
import { centsToEuro } from "@/lib/mappings";
import { applyShopFilters, parseShopFilters } from "@/lib/shop-filter";
import type { DbWorkbookSku } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseShopFilters(sp);

  const workbooks = (await db.workbookSku.findMany({
    where: { active: true },
    orderBy: [{ subject: "asc" }, { groepBucket: "asc" }],
  })) as DbWorkbookSku[];

  const filtered = applyShopFilters(workbooks, filters);

  const workbooksUi = filtered.map((w) => ({
    id: w.id,
    slug: w.slug,
    title: w.title,
    subject: w.subject, // DB key — BookMockup keys palette by this
    groep: w.groepBucket,
    price: centsToEuro(w.priceCents),
    priceCents: w.priceCents,
    symbol: w.coverSymbol,
    tint: w.tint,
    highlightsCount: Array.isArray(w.highlights) ? (w.highlights as unknown[]).length : 0,
  }));

  return (
    <>
      <ShopHeader />
      <main id="main-content" className="mx-auto max-w-[1200px] space-y-10 px-5 py-10">
        <ShopHeading />
        <TrustSignals />
        <FilterBar />
        <UitblinkerHero />
        <WerkboekenGrid workbooks={workbooksUi} />
        <p className="text-center text-sm text-ink-2">
          Op zoek naar de Lexi-app?{" "}
          <Link href="/word-lid" className="font-medium text-ink underline hover:text-primary">
            Word lid →
          </Link>
        </p>
      </main>
      <CartPill />
    </>
  );
}
