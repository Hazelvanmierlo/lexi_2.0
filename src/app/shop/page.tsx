import { db } from "@/lib/db";
import { ShopHeader } from "@/components/shop/shop-header";
import { ShopHeading } from "@/components/shop/shop-heading";
import { FilterBar } from "@/components/shop/filter-bar";
import { AbonnementenSection } from "@/components/shop/abonnementen-section";
import { BundlesSection } from "@/components/shop/bundles-section";
import { WerkboekenGrid } from "@/components/shop/werkboeken-grid";
import { CartPill } from "@/components/shop/cart-pill";
import { centsToEuro, subjectToUi } from "@/lib/mappings";
import type {
  DbSubscriptionSku,
  DbBundleSku,
  DbWorkbookSku,
} from "@/lib/db-types";

export const dynamic = "force-dynamic";

const TIER_LABEL = {
  MONTHLY: "Maandelijks",
  YEARLY: "Jaarlijks",
  FAMILY: "Gezinsabonnement",
} as const;

export default async function ShopPage() {
  const [subs, bundles, workbooks] = (await Promise.all([
    db.subscriptionSku.findMany({ orderBy: { priceCents: "asc" } }),
    db.bundleSku.findMany({
      where: { active: true },
      orderBy: { groepBucket: "asc" },
    }),
    db.workbookSku.findMany({
      where: { active: true },
      orderBy: [{ groepBucket: "asc" }, { subject: "asc" }],
    }),
  ])) as [DbSubscriptionSku[], DbBundleSku[], DbWorkbookSku[]];

  const subscriptionsUi = subs.map((s) => ({
    id: s.id,
    badge: s.badge,
    name: s.title,
    price: centsToEuro(s.priceCents),
    interval: s.intervalLabel,
    body: s.body,
  }));

  const bundlesUi = bundles.map((b) => ({
    id: b.id,
    badge: "BUNDEL",
    name: b.title,
    price: centsToEuro(b.priceCents),
    original: centsToEuro(b.originalCents),
    body: b.body,
  }));

  const workbooksUi = workbooks.map((w) => ({
    id: w.id,
    title: w.title,
    subject: subjectToUi(w.subject),
    groep: w.groepBucket,
    price: centsToEuro(w.priceCents),
    symbol: w.coverSymbol,
    tint: w.tint,
  }));

  return (
    <>
      <ShopHeader />
      <main id="main-content" className="mx-auto max-w-[1200px] space-y-12 px-5 py-10">
        <ShopHeading />
        <FilterBar />
        <AbonnementenSection subs={subscriptionsUi} />
        <BundlesSection bundles={bundlesUi} />
        <WerkboekenGrid workbooks={workbooksUi} />
      </main>
      <CartPill />
    </>
  );
}

// Avoid the unused warning when TIER_LABEL is re-exported elsewhere.
export { TIER_LABEL };
