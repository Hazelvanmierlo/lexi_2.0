import Link from "next/link";
import { db } from "@/lib/db";
import { ShopHeader } from "@/components/shop/shop-header";
import { ShopHeading } from "@/components/shop/shop-heading";
import { UitblinkerHero } from "@/components/shop/uitblinker-hero";
import { WerkboekenGrid } from "@/components/shop/werkboeken-grid";
import { CartPill } from "@/components/shop/cart-pill";
import { TrustSignals } from "@/components/shop/trust-signals";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { FilterMobileSheet } from "@/components/shop/filter-mobile-sheet";
import { SortSelect } from "@/components/shop/sort-select";
import { Breadcrumb } from "@/components/shop/breadcrumb";
import { centsToEuro } from "@/lib/mappings";
import { applyShopFilters, parseShopFilters } from "@/lib/shop-filter";
import { breadcrumbFor } from "@/lib/breadcrumb";
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
  })) as DbWorkbookSku[];

  const filtered = applyShopFilters(workbooks, filters);

  const workbooksUi = filtered.map((w) => ({
    id: w.id,
    slug: w.slug,
    title: w.title,
    subject: w.subject,
    groep: w.groepBucket,
    price: centsToEuro(w.priceCents),
    priceCents: w.priceCents,
    symbol: w.coverSymbol,
    tint: w.tint,
    highlightsCount: Array.isArray(w.highlights) ? (w.highlights as unknown[]).length : 0,
  }));

  // First-subject breadcrumb hint (when only one subject is selected).
  const breadcrumbSubject =
    filters.subject !== "all" && filters.subject.length === 1 ? filters.subject[0] : undefined;
  const crumbs = breadcrumbFor("/shop", { subject: breadcrumbSubject });

  return (
    <>
      <ShopHeader />
      <main id="main-content" className="mx-auto max-w-[1200px] space-y-10 px-5 py-8">
        <Breadcrumb crumbs={crumbs} />
        <ShopHeading />
        <UitblinkerHero />
        <TrustSignals />

        <div className="md:grid md:grid-cols-[260px_1fr] md:gap-8">
          <FilterSidebar filters={filters} />
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-ink-2" data-test="result-count">
                {workbooksUi.length} {workbooksUi.length === 1 ? "werkboek" : "werkboeken"}
              </p>
              <div className="flex items-center gap-3">
                <FilterMobileSheet filters={filters} resultCount={workbooksUi.length} />
                <SortSelect filters={filters} />
              </div>
            </div>
            <WerkboekenGrid workbooks={workbooksUi} />
          </section>
        </div>

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
