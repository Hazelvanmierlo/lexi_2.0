# Lexi.kids — Cart, Checkout, Uitblinker Signup, Book Mockup: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Ship a working cart + checkout flow, real Uitblinker signup form, realistic SVG book mockup, and a payment-provider hook ready for Mollie/Pay.nl. Spec at [`2026-05-13-lexi-cart-checkout-design.md`](../specs/2026-05-13-lexi-cart-checkout-design.md).

**Architecture:** Cart state in React Context + localStorage. Schema: `ShopOrder` gains guest-checkout columns; `paymentSessionId` rename. New pages: `/winkelmand`, `/afrekenen`, `/bestelling/[orderId]/bedankt`, real `/shop/uitblinker/aanmelden`. New components: `<BookMockup>`, `<TrustSignals>`, `<CartToast>`, cart line-item editors. New library: `src/lib/payment.ts` stub.

**Tech Stack:** Same. No new npm deps.

---

## File inventory

| Path | New / Modify | Purpose |
|---|---|---|
| `prisma/schema.prisma` | Modify | `ShopOrder` rename + new columns |
| `src/lib/cart.ts` | New | Pure cart reducer + Zod schemas for line items |
| `src/lib/cart.test.ts` | New | Unit tests |
| `src/lib/cart-context.tsx` | New | Context provider + localStorage sync + toast bus |
| `src/lib/payment.ts` | New | Stub `createPaymentSession` |
| `src/lib/payment.test.ts` | New | Unit tests for stub shape |
| `src/components/shop/book-mockup.tsx` | New | SVG book illustration |
| `src/components/shop/cart-pill.tsx` | Modify | Read from context; show count; animate |
| `src/components/shop/cart-toast.tsx` | New | Top-right slide-in toast |
| `src/components/shop/trust-signals.tsx` | New | 4-icon row |
| `src/components/shop/workbook-card.tsx` | Modify | Use BookMockup; add primary "In winkelmand" button |
| `src/components/shop/book-detail.tsx` | Modify | Use hero BookMockup; primary CTA + add to cart |
| `src/components/shop/related-books.tsx` | Modify | Same — use BookMockup |
| `src/app/layout.tsx` | Modify | Wrap with `<CartProvider>` |
| `src/app/winkelmand/page.tsx` | New | Cart page |
| `src/components/winkelmand/cart-line-item.tsx` | New | Single line item with qty controls or subscription summary |
| `src/components/winkelmand/cart-summary.tsx` | New | Subtotal + shipping + total |
| `src/app/afrekenen/page.tsx` | New | Checkout page |
| `src/app/afrekenen/actions.ts` | New | `placeOrder` server action |
| `src/app/bestelling/[orderId]/bedankt/page.tsx` | New | Thank-you page |
| `src/app/shop/uitblinker/aanmelden/page.tsx` | Modify | Replace placeholder with real form |
| `src/app/shop/page.tsx` | Modify | Add trust signals row |
| `src/app/shop/boek/[slug]/page.tsx` | Modify | Add trust signals + book mockup |
| `src/components/nav/nav.tsx` | Modify | Mount CartPill |
| `tests/e2e/cart-checkout.spec.ts` | New | E2E for the full flow |

---

## Phase 0 — Schema

### Task 1: Modify `ShopOrder` for guest checkout

**File:** `prisma/schema.prisma`

Apply per spec §2:
- Rename `stripeSessionId` → `paymentSessionId` (still unique nullable)
- Make `householdId` nullable; change relation to optional
- Add `customerEmail` (required), `customerName` (required), `shippingLine1` (required), `shippingPostcode` (required), `shippingCity` (required), `shippingLine2` (optional), `shippingCents` (default 0), `paymentProvider` (optional)
- Indexes: `[customerEmail, createdAt]`, `[householdId, createdAt]`

Run `npx prisma db push --accept-data-loss` (no live order data). Run `npx prisma generate`.

Commit:
```bash
git commit -m "feat(shop): ShopOrder accepts guest checkout + payment-provider abstraction"
```

---

## Phase 1 — Pure libraries

### Task 2: `cart.ts` reducer + Zod schemas

**Files:** `src/lib/cart.ts`, `src/lib/cart.test.ts`

Define `CartItem` discriminated union (workbook vs uitblinker per spec §2). Pure functions:
- `addWorkbook(items, sku, qty)` — merges if slug exists
- `addUitblinker(items, item)` — replaces existing uitblinker (only one allowed per cart for v1)
- `setQty(items, idx, qty)` — clamp 1-99; qty 0 removes
- `remove(items, idx)`
- `subtotalCents(items)`
- `itemCount(items)` — sum of qty for workbooks + 1 for uitblinker

Tests cover each function with edge cases (add same workbook twice merges; setQty 0 removes; etc.).

```ts
export type WorkbookItem = {
  kind: "workbook";
  slug: string;
  title: string;
  priceCents: number;
  qty: number;
};

export type UitblinkerItem = {
  kind: "uitblinker";
  kidName: string;
  subject: "TAAL" | "REKENEN" | "LEZEN";
  priceCents: number;
  shipping: {
    name: string;
    line1: string;
    postcode: string;
    city: string;
  };
};

export type CartItem = WorkbookItem | UitblinkerItem;
```

Commit:
```bash
git commit -m "feat(cart): pure reducer + types for cart state"
```

### Task 3: `payment.ts` stub

**Files:** `src/lib/payment.ts`, `src/lib/payment.test.ts`

Per spec §6. Stub returns `{ paymentSessionId, provider: "stub", redirectUrl: null }`. Test asserts the shape.

Commit:
```bash
git commit -m "feat(payment): stub createPaymentSession ready for Mollie/Pay.nl swap"
```

---

## Phase 2 — Cart context + UI primitives

### Task 4: `<CartProvider>` + `<CartToast>` + persistence

**File:** `src/lib/cart-context.tsx`

```tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
// import reducer functions from "./cart"

const CART_KEY = "lexi_cart_v1";

type ToastState = { id: number; message: string };

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {}
  }, [items, hydrated]);

  const showToast = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
    window.setTimeout(() => setToast(null), 2000);
  }, []);

  // ... addWorkbook / addUitblinker / setQty / remove / clear, each calls showToast on add
  // ... compute itemCount, subtotalCents

  return (
    <CartContext.Provider value={...}>
      {children}
      {toast && <CartToast key={toast.id} message={toast.message} />}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
```

`<CartToast>`: client component, slide-in from top-right via CSS keyframes (define in `globals.css`).

Wire into root layout (`src/app/layout.tsx`). The CartProvider goes inside `<ClerkProvider>` (or wrapping it, doesn't matter — both work, but tucked inside the body wrap).

Commit:
```bash
git commit -m "feat(cart): React Context + localStorage persistence + toast"
```

### Task 5: `<CartPill>` reads from context

**File:** `src/components/shop/cart-pill.tsx`

Replace placeholder content with:
```tsx
"use client";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function CartPill() {
  const { itemCount } = useCart();
  if (itemCount === 0) return null;
  return (
    <Link
      href="/winkelmand"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-white shadow-lexi transition hover:opacity-95"
    >
      <ShoppingCart className="h-5 w-5" />
      <span className="font-semibold">{itemCount}</span>
      <span className="text-sm">in winkelmand</span>
    </Link>
  );
}
```

Make sure it's mounted on the shop pages where it was before. Add to nav too: a smaller variant at the top-right? Simpler: keep the fixed bottom-right pill for the whole shop area only. Mount in nav as a small inline icon for global visibility — `<CartPillNav />` as a separate component if cleanest.

Commit:
```bash
git commit -m "feat(cart): CartPill reads count from context"
```

### Task 6: `<TrustSignals>` component

**File:** `src/components/shop/trust-signals.tsx`

```tsx
import { Truck, Clock, RotateCcw, Lock } from "lucide-react";

const ITEMS = [
  { icon: Truck,    label: "Gratis bezorging vanaf € 25" },
  { icon: Clock,    label: "Voor 22:00 besteld, morgen in huis" },
  { icon: RotateCcw,label: "14 dagen bedenktijd" },
  { icon: Lock,     label: "Veilig betalen" },
];

export function TrustSignals() {
  return (
    <ul className="grid grid-cols-2 gap-4 rounded-lexi-lg border border-line bg-card p-4 md:grid-cols-4">
      {ITEMS.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2 text-sm text-ink-2">
          <Icon className="h-4 w-4 text-ok" aria-hidden="true" />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
```

Mount on `/shop`, `/shop/boek/[slug]`, `/winkelmand`, `/afrekenen`.

Commit:
```bash
git commit -m "feat(shop): trust signals row component"
```

---

## Phase 3 — Book mockup

### Task 7: `<BookMockup>` SVG component

**File:** `src/components/shop/book-mockup.tsx`

Per spec §4. Props `{ title; subject: Subject; groep: string; tint: string; symbol: string; size?: "card" | "hero" }`. Output: an inline `<svg>` with cover + spine + giant symbol + wrapped title + groep badge.

Hardcoded OKLCH triples per subject (cover/spine/text):
```ts
const PALETTE: Record<string, { cover: string; spine: string; text: string }> = {
  TAAL:    { cover: "oklch(85% 0.08 35)",  spine: "oklch(72% 0.10 35)",  text: "oklch(20% 0.05 35)"  },
  REKENEN: { cover: "oklch(88% 0.06 195)", spine: "oklch(76% 0.08 195)", text: "oklch(22% 0.04 195)" },
  LEZEN:   { cover: "oklch(90% 0.08 90)",  spine: "oklch(78% 0.10 90)",  text: "oklch(22% 0.05 90)"  },
};
```

Size variants:
- `card`: 160×220 viewBox, used in grid
- `hero`: 280×380 viewBox, used in detail page

Implement title text wrapping: split on space, max 2 lines, ~12 chars each. If single title fits use one line, else split. (Pure JS line-break helper inline.)

Drop shadow via SVG `<filter>` for depth.

Commit:
```bash
git commit -m "feat(shop): SVG book mockup component with spine + cover"
```

### Task 8: Wire BookMockup into existing components

**Files:** `workbook-card.tsx`, `book-detail.tsx`, `related-books.tsx`

Replace the existing flat tint div with `<BookMockup ... />`. For `book-detail.tsx`, swap the hero placeholder. Make sure props pass through (title, subject, groep, tint, symbol).

Commit:
```bash
git commit -m "feat(shop): use BookMockup in card, detail, related"
```

---

## Phase 4 — Pages: cart, checkout, thank-you

### Task 9: WorkbookCard + BookDetail get primary "In winkelmand" CTA

**Files:** `workbook-card.tsx`, `book-detail.tsx`

WorkbookCard: replace the existing outlined button with a primary CTA. Use the cart context's `addWorkbook`. The card link to detail still works (button has its own click handler).

Issue: WorkbookCard is currently a server component (it has no `"use client"`). To use `useCart`, it needs to be client. Two options:
(a) Convert WorkbookCard to client component
(b) Split: keep server card for the static part, embed a small `<AddToCartButton client>` inside

For simplicity: convert WorkbookCard to client component. It doesn't do any server-only work.

```tsx
"use client";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
// ...

export function WorkbookCard({ slug, title, subject, groep, price, priceCents, tint, symbol }: Props) {
  const { addWorkbook } = useCart();
  return (
    <article ...>
      <Link href={`/shop/boek/${slug}`}>
        <BookMockup ... />
      </Link>
      <div>
        <p>...</p>
        <h3>{title}</h3>
        <p>{price}</p>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); addWorkbook({ slug, title, priceCents }, 1); }}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lexi bg-primary px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <ShoppingCart className="h-4 w-4" />
          In winkelmand
        </button>
      </div>
    </article>
  );
}
```

Add `priceCents` to the props passed from `ShopPage` → `WerkboekenGrid` → `WorkbookCard`.

BookDetail: same — primary CTA + `useCart()`. Add a small "Op voorraad" indicator.

Commit:
```bash
git commit -m "feat(cart): primary add-to-cart CTAs wired via useCart"
```

### Task 10: `/winkelmand` page + line items + summary

**Files:**
- `src/app/winkelmand/page.tsx`
- `src/components/winkelmand/cart-line-item.tsx`
- `src/components/winkelmand/cart-summary.tsx`

Cart page is a client component (reads context). Empty state: mascot + "Je winkelmand is nog leeg" + CTA back to shop.

Each line item shows BookMockup at small size or a placeholder for Uitblinker (mascot card). Qty controls only for workbooks. Remove button (Lucide `X`).

Cart summary: subtotal, shipping (free if subtotal ≥ €25 else €4,95), total. Below: "Naar afrekenen →" button → `/afrekenen`. Above: TrustSignals.

Commit:
```bash
git commit -m "feat(cart): /winkelmand page with line items + summary"
```

### Task 11: `/afrekenen` page + place-order action

**Files:**
- `src/app/afrekenen/page.tsx`
- `src/app/afrekenen/actions.ts`

Page reads cart from context (client component). Renders form left + sticky summary right. Submit calls `placeOrder` server action with form data + items snapshot.

Server action:
```ts
"use server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createPaymentSession } from "@/lib/payment";
import { CartItem } from "@/lib/cart";

const PlaceOrderInput = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  shippingLine1: z.string().min(1),
  shippingLine2: z.string().optional(),
  shippingPostcode: z.string().regex(/^\d{4}\s?[A-Za-z]{2}$/),
  shippingCity: z.string().min(1),
  items: z.array(z.any()),    // validated in detail below
});

export async function placeOrder(raw: z.infer<typeof PlaceOrderInput>) {
  const parsed = PlaceOrderInput.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  // Re-validate items shape + re-fetch prices from DB to avoid tampering
  const validated: CartItem[] = [];
  let subtotalCents = 0;
  for (const it of parsed.data.items) {
    if (it.kind === "workbook") {
      const sku = await db.workbookSku.findUnique({ where: { slug: it.slug } });
      if (!sku) continue;
      const qty = Math.max(1, Math.min(99, Number(it.qty) || 1));
      validated.push({ kind: "workbook", slug: sku.slug, title: sku.title, priceCents: sku.priceCents, qty });
      subtotalCents += sku.priceCents * qty;
    } else if (it.kind === "uitblinker") {
      // priceCents from server constant, NOT client
      const { UITBLINKER_PRICE_CENTS } = await import("@/lib/uitblinker");
      validated.push({
        kind: "uitblinker",
        kidName: String(it.kidName ?? "").slice(0, 100),
        subject: it.subject,
        priceCents: UITBLINKER_PRICE_CENTS,
        shipping: it.shipping,
      });
      subtotalCents += UITBLINKER_PRICE_CENTS;
    }
  }

  if (validated.length === 0) return { ok: false, errors: { _form: ["Winkelmand is leeg"] } };

  const shippingCents = subtotalCents >= 2500 ? 0 : 495;
  const totalCents = subtotalCents + shippingCents;

  const order = await db.shopOrder.create({
    data: {
      customerName:     parsed.data.customerName,
      customerEmail:    parsed.data.customerEmail,
      shippingLine1:    parsed.data.shippingLine1,
      shippingLine2:    parsed.data.shippingLine2 ?? null,
      shippingPostcode: parsed.data.shippingPostcode,
      shippingCity:     parsed.data.shippingCity,
      items:            validated as never,
      totalCents,
      shippingCents,
      status:           "pending",
    },
  }) as { id: string };

  const pay = await createPaymentSession({
    orderId: order.id,
    amountCents: totalCents,
    customerEmail: parsed.data.customerEmail,
    description: `Lexi.kids bestelling ${order.id.slice(0, 8)}`,
  });

  await db.shopOrder.update({
    where: { id: order.id },
    data: { paymentSessionId: pay.paymentSessionId, paymentProvider: pay.provider },
  });

  return { ok: true, orderId: order.id, redirectUrl: pay.redirectUrl };
}
```

Page's submit handler: call `placeOrder`, if `result.ok` → `router.push(result.redirectUrl ?? '/bestelling/${result.orderId}/bedankt')` + clear cart.

Commit:
```bash
git commit -m "feat(checkout): /afrekenen page + placeOrder server action with price re-validation"
```

### Task 12: `/bestelling/[orderId]/bedankt` thank-you page

**File:** `src/app/bestelling/[orderId]/bedankt/page.tsx`

Server component. Reads order from DB by id. Renders confirmation. If order not found → 404.

```tsx
const order = await db.shopOrder.findUnique({ where: { id: orderId } });
if (!order) notFound();
const items = order.items as CartItem[];
const hasUitblinker = items.some((i) => i.kind === "uitblinker");
```

Display:
- Bestellingsnummer: `ORD-${order.id.slice(0,8)}`
- Totaal in euros
- Customer email
- "Je werkboek is morgen in huis" (or Uitblinker copy)
- Link "Verder winkelen →"

Commit:
```bash
git commit -m "feat(checkout): thank-you page with order summary"
```

---

## Phase 5 — Uitblinker real signup

### Task 13: Replace `/shop/uitblinker/aanmelden` placeholder with real form

**File:** `src/app/shop/uitblinker/aanmelden/page.tsx`

Convert to client component (uses cart context to add the item). Form fields per spec §5:
- Naam van je kind
- Onderwerp (radio: Taal / Rekenen / Begrijpend Lezen)
- Ontvangername, straat+nr, postcode, plaats

Validate via Zod schema imported from `src/lib/cart.ts`. On submit:
```tsx
addUitblinker({ kidName, subject, priceCents: UITBLINKER_PRICE_CENTS, shipping: {...} });
router.push("/winkelmand");
```

Field errors inline. Postcode regex `^\d{4}\s?[A-Za-z]{2}$`.

Commit:
```bash
git commit -m "feat(uitblinker): real aanmelden form that adds subscription to cart"
```

---

## Phase 6 — Nav integration + final polish

### Task 14: Mount CartProvider in root layout + inline cart icon in nav

**Files:** `src/app/layout.tsx`, `src/components/nav/nav.tsx`

Wrap the existing root tree with `<CartProvider>` (inside body). Add a small `<NavCartIcon>` (client component reading `useCart`) in the nav near the trial CTA — shows the ShoppingCart icon with count when > 0.

Commit:
```bash
git commit -m "feat(cart): mount CartProvider + nav cart icon"
```

---

## Phase 7 — E2E

### Task 15: Playwright tests

**File:** `tests/e2e/cart-checkout.spec.ts`

Tests:
1. Anonymous: add workbook to cart → `/winkelmand` shows it → fill `/afrekenen` form → submit → `/bestelling/.../bedankt` loads
2. Anonymous: `/shop/uitblinker/aanmelden` form valid → redirects to `/winkelmand` with the subscription line item
3. Bad postcode rejected at checkout
4. Empty cart shows empty state

Commit:
```bash
git commit -m "test(checkout): E2E for cart + checkout + uitblinker signup"
```

---

## Self-review

Spec items × tasks:
- §1 DoD 1 (add to cart from card+detail) → T9
- §1 DoD 2 (localStorage persistence) → T4
- §1 DoD 3 (`/winkelmand`) → T10
- §1 DoD 4 (`/afrekenen` form + ShopOrder create) → T11
- §1 DoD 5 (`/bedankt`) → T12
- §1 DoD 6 (Uitblinker real signup) → T13
- §1 DoD 7 (BookMockup) → T7+T8
- §1 DoD 8 (trust signals) → T6+T10+T11
- §1 DoD 9 (payment stub) → T3
- §1 DoD 10 (cart cleared after order) → T11 client-side

Known gaps:
- Order confirmation email — deferred
- Order history in `/ouder` — deferred
- Real Mollie/Pay.nl — deferred (the hook is in place)

---

**15 tasks. Estimated implementation: ~6-9 hours.**
