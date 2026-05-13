// Pure cart state — used by the React Context provider in cart-context.tsx
// and re-validated server-side in src/app/afrekenen/actions.ts.
//
// Two item kinds:
//  - "workbook"   has qty, can be merged on slug, qty clamps [1..99]
//  - "uitblinker" is a per-kid monthly subscription, implicit qty 1, only
//    ONE per cart for v1
//
// All functions here are pure; they receive items and return a new array.

import { z } from "zod";

export type Subject = "TAAL" | "REKENEN" | "LEZEN";

export type WorkbookItem = {
  kind: "workbook";
  slug: string;
  title: string;
  priceCents: number;
  qty: number;
};

export type ShippingAddress = {
  name: string;
  line1: string;
  postcode: string;
  city: string;
};

export type UitblinkerItem = {
  kind: "uitblinker";
  kidName: string;
  subject: Subject;
  priceCents: number;
  shipping: ShippingAddress;
};

export type CartItem = WorkbookItem | UitblinkerItem;

// ─── Zod schemas (validated on the server boundary in actions.ts) ────────────

export const ShippingAddressSchema = z.object({
  name: z.string().min(1).max(100),
  line1: z.string().min(1).max(200),
  postcode: z.string().regex(/^\d{4}\s?[A-Za-z]{2}$/),
  city: z.string().min(1).max(100),
});

export const WorkbookItemSchema = z.object({
  kind: z.literal("workbook"),
  slug: z.string().min(1),
  title: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  qty: z.number().int().min(1).max(99),
});

export const UitblinkerItemSchema = z.object({
  kind: z.literal("uitblinker"),
  kidName: z.string().min(1).max(100),
  subject: z.enum(["TAAL", "REKENEN", "LEZEN"]),
  priceCents: z.number().int().nonnegative(),
  shipping: ShippingAddressSchema,
});

export const CartItemSchema = z.discriminatedUnion("kind", [
  WorkbookItemSchema,
  UitblinkerItemSchema,
]);

// ─── pure operations ────────────────────────────────────────────────────────

export function addWorkbook(
  items: CartItem[],
  sku: { slug: string; title: string; priceCents: number },
  qty: number = 1,
): CartItem[] {
  const clampedQty = clampQty(qty);
  const existingIdx = items.findIndex(
    (it): it is WorkbookItem => it.kind === "workbook" && it.slug === sku.slug,
  );
  if (existingIdx >= 0) {
    const next = items.slice();
    const existing = next[existingIdx] as WorkbookItem;
    next[existingIdx] = { ...existing, qty: clampQty(existing.qty + clampedQty) };
    return next;
  }
  return [...items, { kind: "workbook", slug: sku.slug, title: sku.title, priceCents: sku.priceCents, qty: clampedQty }];
}

export function addUitblinker(items: CartItem[], item: Omit<UitblinkerItem, "kind">): CartItem[] {
  // Replace any existing uitblinker; only one allowed per cart in v1.
  const without = items.filter((it) => it.kind !== "uitblinker");
  return [...without, { kind: "uitblinker", ...item }];
}

export function setQty(items: CartItem[], idx: number, qty: number): CartItem[] {
  if (idx < 0 || idx >= items.length) return items;
  const target = items[idx];
  if (target.kind !== "workbook") return items;
  if (qty <= 0) return remove(items, idx);
  const next = items.slice();
  next[idx] = { ...target, qty: clampQty(qty) };
  return next;
}

export function remove(items: CartItem[], idx: number): CartItem[] {
  if (idx < 0 || idx >= items.length) return items;
  return items.filter((_, i) => i !== idx);
}

export function subtotalCents(items: CartItem[]): number {
  return items.reduce((sum, it) => {
    if (it.kind === "workbook") return sum + it.priceCents * it.qty;
    return sum + it.priceCents;
  }, 0);
}

export function itemCount(items: CartItem[]): number {
  return items.reduce((n, it) => n + (it.kind === "workbook" ? it.qty : 1), 0);
}

/** Free shipping at €25+, else €4,95. */
export function shippingCents(subtotal: number): number {
  return subtotal >= 2500 ? 0 : 495;
}

function clampQty(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(99, Math.round(n)));
}
