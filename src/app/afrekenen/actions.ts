"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { createPaymentSession } from "@/lib/payment";
import { UITBLINKER_PRICE_CENTS } from "@/lib/uitblinker";
import { shippingCents, type CartItem } from "@/lib/cart";

const ShippingFieldsSchema = z.object({
  customerName: z.string().min(1, "Vul je naam in").max(100),
  customerEmail: z.string().email("Vul een geldig e-mailadres in"),
  shippingLine1: z.string().min(1, "Vul je straat en huisnummer in").max(200),
  shippingLine2: z.string().max(200).optional(),
  shippingPostcode: z
    .string()
    .regex(/^\d{4}\s?[A-Za-z]{2}$/, "Postcode is ongeldig (bv. 1011 AB)"),
  shippingCity: z.string().min(1, "Vul je woonplaats in").max(100),
});

const RawItemSchema = z.unknown();

const PlaceOrderInputSchema = ShippingFieldsSchema.extend({
  items: z.array(RawItemSchema),
});

export type PlaceOrderInput = z.infer<typeof PlaceOrderInputSchema>;

export type PlaceOrderResult =
  | { ok: true; orderId: string; redirectUrl: string | null }
  | { ok: false; errors: Record<string, string[]> };

/**
 * Creates a ShopOrder row, gets a payment session, returns redirect info.
 *
 * Item prices are re-fetched from the DB (workbooks) or read from the server
 * constant (uitblinker) — never trusted from the client.
 */
export async function placeOrder(raw: unknown): Promise<PlaceOrderResult> {
  const parsed = PlaceOrderInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  // Re-validate items + recompute prices from authoritative sources.
  const validated: CartItem[] = [];
  let subtotalCents = 0;

  for (const it of parsed.data.items) {
    if (!it || typeof it !== "object") continue;
    const kind = (it as { kind?: string }).kind;

    if (kind === "workbook") {
      const slug = (it as { slug?: unknown }).slug;
      const qtyRaw = (it as { qty?: unknown }).qty;
      if (typeof slug !== "string") continue;
      const sku = (await db.workbookSku.findUnique({ where: { slug } })) as {
        slug: string;
        title: string;
        priceCents: number;
      } | null;
      if (!sku) continue;
      const qty = Math.max(1, Math.min(99, Math.round(Number(qtyRaw) || 1)));
      validated.push({
        kind: "workbook",
        slug: sku.slug,
        title: sku.title,
        priceCents: sku.priceCents,
        qty,
      });
      subtotalCents += sku.priceCents * qty;
    } else if (kind === "uitblinker") {
      const item = it as {
        kidName?: unknown;
        subject?: unknown;
        shipping?: unknown;
      };
      const subject = item.subject;
      if (subject !== "TAAL" && subject !== "REKENEN" && subject !== "LEZEN") continue;
      const shipping = item.shipping as
        | { name?: unknown; line1?: unknown; postcode?: unknown; city?: unknown }
        | undefined;
      if (
        !shipping ||
        typeof shipping.name !== "string" ||
        typeof shipping.line1 !== "string" ||
        typeof shipping.postcode !== "string" ||
        typeof shipping.city !== "string"
      ) {
        continue;
      }
      const kidName = typeof item.kidName === "string" ? item.kidName.slice(0, 100) : "";
      if (!kidName) continue;
      validated.push({
        kind: "uitblinker",
        kidName,
        subject,
        priceCents: UITBLINKER_PRICE_CENTS,
        shipping: {
          name: shipping.name.slice(0, 100),
          line1: shipping.line1.slice(0, 200),
          postcode: shipping.postcode,
          city: shipping.city.slice(0, 100),
        },
      });
      subtotalCents += UITBLINKER_PRICE_CENTS;
    }
  }

  if (validated.length === 0) {
    return { ok: false, errors: { _form: ["Je winkelmand is leeg"] } };
  }

  const shipCents = shippingCents(subtotalCents);
  const totalCents = subtotalCents + shipCents;

  // Create order — householdId stays null for guest checkout.
  const order = (await db.shopOrder.create({
    data: {
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      shippingLine1: parsed.data.shippingLine1,
      shippingLine2: parsed.data.shippingLine2 ?? null,
      shippingPostcode: parsed.data.shippingPostcode,
      shippingCity: parsed.data.shippingCity,
      items: validated as never,
      totalCents,
      shippingCents: shipCents,
      status: "pending",
    },
  })) as { id: string };

  const pay = await createPaymentSession({
    orderId: order.id,
    amountCents: totalCents,
    customerEmail: parsed.data.customerEmail,
    description: `Lexi.kids bestelling ${order.id.slice(0, 8)}`,
  });

  await db.shopOrder.update({
    where: { id: order.id },
    data: {
      paymentSessionId: pay.paymentSessionId,
      paymentProvider: pay.provider === "stub" ? null : pay.provider,
    },
  });

  return { ok: true, orderId: order.id, redirectUrl: pay.redirectUrl };
}
