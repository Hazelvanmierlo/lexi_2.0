import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Mail, Package } from "lucide-react";
import { db } from "@/lib/db";
import { ShopHeader } from "@/components/shop/shop-header";
import { centsToEuro } from "@/lib/mappings";
import type { CartItem } from "@/lib/cart";

export const dynamic = "force-dynamic";

export default async function BedanktPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = (await db.shopOrder.findUnique({ where: { id: orderId } })) as
    | {
        id: string;
        customerEmail: string;
        customerName: string;
        totalCents: number;
        items: unknown;
      }
    | null;
  if (!order) notFound();

  const items = Array.isArray(order.items) ? (order.items as CartItem[]) : [];
  const uitblinker = items.find((it): it is Extract<CartItem, { kind: "uitblinker" }> =>
    it.kind === "uitblinker",
  );
  const hasWorkbook = items.some((it) => it.kind === "workbook");
  const orderNumber = `ORD-${order.id.slice(0, 8).toUpperCase()}`;

  return (
    <>
      <ShopHeader />
      <main id="main-content" className="mx-auto max-w-[720px] px-5 py-12">
        <div className="rounded-lexi-lg border border-line bg-card p-8 text-center shadow-lexi-sm">
          <CheckCircle2 className="mx-auto h-14 w-14 text-ok" aria-hidden="true" />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Bedankt voor je bestelling!
          </h1>
          <p className="mt-3 text-ink-2">
            We hebben je bestelling ontvangen, {order.customerName}.
          </p>

          <dl className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-y-3 text-left text-sm">
            <dt className="text-ink-2">Bestelnummer</dt>
            <dd
              className="text-right font-mono font-medium text-ink"
              data-test="order-number"
            >
              {orderNumber}
            </dd>
            <dt className="text-ink-2">Totaal</dt>
            <dd className="text-right font-mono font-medium text-ink tabular-nums">
              {centsToEuro(order.totalCents)}
            </dd>
            <dt className="text-ink-2">Bevestiging naar</dt>
            <dd className="text-right font-medium text-ink break-all">
              {order.customerEmail}
            </dd>
          </dl>
        </div>

        <section className="mt-8 rounded-lexi-lg border border-line bg-card p-6">
          <h2 className="font-display text-lg font-bold text-ink">Hierna</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                We sturen je een bevestiging naar{" "}
                <span className="font-medium">{order.customerEmail}</span>.
              </span>
            </li>
            {hasWorkbook ? (
              <li className="flex items-start gap-3">
                <Package className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span>Je werkboek is morgen in huis.</span>
              </li>
            ) : null}
            {uitblinker ? (
              <li className="flex items-start gap-3">
                <Package className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  Je eerste Uitblinker voor {uitblinker.kidName} wordt deze maand gemaakt en
                  verstuurd.
                </span>
              </li>
            ) : null}
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                Vragen? Mail naar{" "}
                <a href="mailto:hallo@lexi.kids" className="underline">
                  hallo@lexi.kids
                </a>
                .
              </span>
            </li>
          </ul>
        </section>

        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-lexi border border-line bg-card px-5 py-2.5 text-sm font-medium text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Verder winkelen
          </Link>
        </div>
      </main>
    </>
  );
}
