# Lexi.kids — Cart, Checkout, Uitblinker Signup, Book Mockup

**Date:** 2026-05-13
**Status:** Approved design, ready for implementation
**Depends on:** existing `WorkbookSku` (24 books seeded) + `UitblinkerSubscription` model + `ShopOrder` table from earlier specs.

---

## Context

Today's `/shop` looks like a catalogue but acts like a brochure: "In winkelmandje" is visual-only, the cart pill is dead state, `/shop/uitblinker/aanmelden` is a literal placeholder, and the workbook "covers" are flat tint+symbol rectangles. Conversion-wise the page underdelivers — no trust signals, no actually-prominent CTA, no urgency.

This spec ships a fully working purchase flow up to but excluding real payment-provider integration. Mollie or Pay.nl plugs in later as a one-function swap.

---

## §1 — Goals & success criteria

### What ships

1. **Realistic book mockup** — SVG-based component with spine, cover, title, groep badge, subject symbol; replaces the flat tint block on both the shop card and the detail page.
2. **Working cart** — React Context + `localStorage` persistence; survives reloads; supports workbook items and one Uitblinker subscription item.
3. **Cart pill** — header chip showing item count; tap opens `/winkelmand`.
4. **`/winkelmand`** — line items, qty control on workbooks, remove, subtotal, shipping, total, prominent "Naar afrekenen" CTA.
5. **`/afrekenen`** — minimal checkout form: name, email, street+number, postcode, city. Order summary on the right. Submit creates a `ShopOrder` row and redirects to `/bestelling/[orderId]/bedankt`.
6. **`/bestelling/[orderId]/bedankt`** — confirmation page with order number, what happens next, link back to shop.
7. **Real Uitblinker signup** at `/shop/uitblinker/aanmelden` — pick subject + provide kid's first name + shipping address; adds to cart as a subscription item; checkout flows through the same `/afrekenen`.
8. **Trust signals** — "Gratis bezorging vanaf € 25" banner on shop pages; "Morgen in huis" + "14 dagen retour" mini-badges on detail page.
9. **Conversion polish** — primary-styled add-to-cart button (not outlined); +1 toast on add; cart pill animates on increment.
10. **Payment provider hook** — abstract `createPaymentSession(order)` function in `src/lib/payment.ts`. v1 implementation is a stub that just marks the order `pending` and returns a fake session id. Real Mollie/Pay.nl integration replaces this one function.

### Definition of done

| # | Statement |
|---|---|
| 1 | Tapping "In winkelmandje" on `/shop/boek/taal-groep-3` adds 1 workbook to cart; CartPill in nav updates to "1"; toast "Toegevoegd aan winkelmand" appears. |
| 2 | Cart persists across page reloads (localStorage). |
| 3 | `/winkelmand` shows the line items with qty +/- and remove buttons; subtotal updates live. |
| 4 | At `/afrekenen`, submitting the minimum-fields form (name + email + 4 address fields) creates a `ShopOrder` row in the DB with status `"pending"` and items array reflecting cart contents. |
| 5 | After submit, the user lands on `/bestelling/[orderId]/bedankt` showing the order number and total. |
| 6 | `/shop/uitblinker/aanmelden` is a real form. Submitting adds an `UITBLINKER` line item to the cart and redirects to `/winkelmand`. |
| 7 | Each workbook card and the detail-page hero shows a **rendered book** (SVG mock with spine + cover + title) instead of a flat coloured rectangle. |
| 8 | The shop, cart, and detail pages each show a trust-signal row ("Gratis bezorging vanaf € 25", "Morgen in huis", "14 dagen retour"). |
| 9 | `src/lib/payment.ts` exports `createPaymentSession(order)` that today returns `{ paymentSessionId: "stub_..." }`; the order is created in DB with `paymentProvider: null`. |
| 10 | Cart is empty after successful order placement. |

### Out of scope

- **Real Mollie/Pay.nl integration.** Wired via the `createPaymentSession` hook in a follow-up.
- **Order confirmation email.** Stub for later.
- **Order history on `/ouder`.** Stub for later.
- **Discount codes, gift cards, VAT registration.** Future.
- **Logged-in cart sync.** Cart is localStorage-only for v1; logging in doesn't merge an anonymous cart. Acceptable for v1 since most flows are anonymous-buyer-first.
- **Stock / inventory tracking.** Not modelled.

---

## §2 — Data model

### `ShopOrder` (modify — relax for guest checkout)

```prisma
model ShopOrder {
  id                 String     @id @default(cuid())
  householdId        String?                              // NEW — nullable (guest checkout)
  household          Household? @relation(fields: [householdId], references: [id])
  customerEmail      String                                // NEW — always required
  customerName       String                                // NEW
  shippingLine1      String                                // NEW
  shippingPostcode   String                                // NEW
  shippingCity       String                                // NEW
  shippingLine2      String?                               // NEW — optional
  paymentSessionId   String?    @unique                    // RENAMED from stripeSessionId
  paymentProvider    String?                               // NEW — "mollie" | "paynl" | null for stub
  items              Json                                  // existing
  totalCents         Int                                   // existing
  shippingCents      Int        @default(0)                // NEW
  status             String     @default("pending")        // existing
  createdAt          DateTime   @default(now())            // existing
  updatedAt          DateTime   @updatedAt                 // existing

  @@index([customerEmail, createdAt])
  @@index([householdId, createdAt])
}
```

**`items` JSON shape** (validated by Zod in `src/lib/cart.ts`):

```ts
type CartItem =
  | { kind: "workbook"; slug: string; title: string; priceCents: number; qty: number }
  | { kind: "uitblinker"; kidName: string; subject: "TAAL" | "REKENEN" | "LEZEN"; priceCents: number };
```

(`uitblinker` has no `qty` — implicitly 1; subscription per kid.)

---

## §3 — Cart system

### State management

`src/lib/cart-context.tsx` — React Context provider:

```tsx
type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  addWorkbook: (sku: { slug: string; title: string; priceCents: number }, qty?: number) => void;
  addUitblinker: (item: { kidName: string; subject: Subject; priceCents: number }) => void;
  setQty: (idx: number, qty: number) => void;
  remove: (idx: number) => void;
  clear: () => void;
};
```

Persistence: `useEffect` syncs `items` to `localStorage[LEXI_CART_KEY]` on every change; provider hydrates from localStorage on mount (client-only).

Provider is mounted in the **root layout** so any page can read/write cart state.

### Toast on add

A simple `<CartToast>` mounted next to the provider. When `addWorkbook`/`addUitblinker` is called, the provider also calls a `showToast("Toegevoegd aan winkelmand")` exposed via the context. Toast auto-dismisses after 2s. CSS-only slide-in from top-right.

### CartPill (in nav)

`src/components/shop/cart-pill.tsx` — pure presentational, reads from cart context. Renders a Lucide `ShoppingCart` + item count when > 0, hidden when empty. Tap → `Link href="/winkelmand"`. Animates on count change (small bounce).

---

## §4 — Book mockup component

**`src/components/shop/book-mockup.tsx`** — server component, props `{ title; subject; groep; tint; symbol; size?: "card" | "hero" }`.

Renders an SVG that visually approximates a children's workbook:

```
┌─────────────────────────────────┐
│  ╔═══════════════════════════╗  │
│  ║░░░║                       ║  │   spine = darker shade of tint
│  ║░░░║   {subject symbol}    ║  │   front cover = tint
│  ║░░░║   {large symbol}      ║  │
│  ║░░░║                       ║  │
│  ║░░░║   {title}             ║  │   white display-font title
│  ║░░░║                       ║  │
│  ║░░░║         [G3]          ║  │   groep badge bottom-right
│  ╚═══════════════════════════╝  │
└─────────────────────────────────┘
```

Two size variants:
- `card`: ~150×200px, used in grid + related cards
- `hero`: ~280×380px, used on detail page

Implementation: a single inline `<svg viewBox="0 0 200 280">` with:
- `<rect>` background = cover tint
- `<rect>` spine on left, fill = darker tint (use `oklch(from var(--c) calc(l * 0.85) c h)` if supported, else hardcoded shadow)
- `<text>` for title — wrap manually if needed (split on space, max 2 lines)
- `<text>` for the giant subject symbol ("A", "∑", "B") — top centre
- `<rect>` + `<text>` for groep badge — bottom-right corner with rounded shape
- Subtle box-shadow filter for depth

For colour: derive 3 values from the existing `tint` class — read the corresponding CSS variable. Easier: hardcode 3 OKLCH triples in code keyed by subject:
- TAAL → primary range
- REKENEN → teal range
- LEZEN → sun range (warmer)

The mockup is purely SVG — no external image. Works on all browsers, no flash, no broken-image risk.

---

## §5 — Pages

### `/shop` — add trust signals + better card

After the filter bar and before the grid, add:

```tsx
<TrustSignals>
  <Item icon={Truck}      label="Gratis bezorging vanaf € 25" />
  <Item icon={Clock}      label="Voor 22:00 besteld, morgen in huis" />
  <Item icon={RotateCcw}  label="14 dagen bedenktijd" />
  <Item icon={Lock}       label="Veilig betalen" />
</TrustSignals>
```

WorkbookCard upgrades:
- Replace the flat `<div className={tint} ...>{symbol}</div>` with `<BookMockup ... size="card" />`
- Add a primary-styled "In winkelmandje" button (Lucide `ShoppingCart` + "In winkelmand"). Stop the propagation so the card's link still works for cover-tap-to-detail; the button does its own onClick.
- Optimistic +1 toast via cart context.

### `/shop/boek/[slug]` — checkout-ready detail

Replace the flat cover with `<BookMockup size="hero" />`. Right-side rail keeps title, price, highlights but the CTA changes:

```tsx
<Btn onClick={() => addWorkbook(book)} primary large>
  <ShoppingCart /> In winkelmandje
</Btn>
<p className="mt-2 text-xs text-ink-2">
  Morgen in huis · Gratis bezorging vanaf € 25
</p>
```

Below CTA: a small `<Stock>` indicator — "Op voorraad" with a Lucide `CheckCircle2`. (No actual stock tracking; always renders "op voorraad" for v1.)

### `/shop/uitblinker/aanmelden` — real form

Three-step inline form (no wizard — all on one page for v1):

```
1. Voor wie?
   [Naam van je kind]      (text input)

2. Welk onderwerp focust het op?
   ( ) Taal   ( ) Rekenen   ( ) Begrijpend Lezen

3. Waar mag het naartoe?
   [Naam ontvanger]
   [Straat + nr]
   [Postcode]  [Plaats]

[Aanmelden — € 19,95/maand →]
```

Submit → `addUitblinker(...)` → redirect to `/winkelmand`.

Form validation: all fields required; postcode regex `^\d{4}\s?[A-Za-z]{2}$` (Dutch postcode). Inline errors below each field.

### `/winkelmand` — cart page

```
┌─────────────────────────────────────────────────────────┐
│  H1: Je winkelmand                                      │
├─────────────────────────────────────────────────────────┤
│  [Line item 1: BookMockup · Title · €16,95 · qty [-1+] · X]│
│  [Line item 2: BookMockup · Title · €16,95 · qty [-1+] · X]│
│  [Line item 3: Uitblinker  · Sara — Rekenen · €19,95/mnd · X]│
├─────────────────────────────────────────────────────────┤
│              Subtotaal:           € 53,85               │
│              Verzendkosten:       Gratis (>€25)         │
│              Totaal:              € 53,85               │
├─────────────────────────────────────────────────────────┤
│  [ Naar afrekenen → ]   primary, large                  │
├─────────────────────────────────────────────────────────┤
│  Trust signals row                                      │
└─────────────────────────────────────────────────────────┘
```

Empty state: a friendly mascot + "Je winkelmand is nog leeg" + "Bekijk werkboeken →" link.

Subscription items (Uitblinker) have no qty — show as fixed quantity 1 with no -/+ controls.

### `/afrekenen` — checkout

Left side: form. Right side: order summary (sticky on desktop).

```
H1: Afrekenen

Stap 1 — Hoe heet je en waar mailen we de bevestiging naartoe?
  [Naam]
  [E-mailadres]

Stap 2 — Bezorgadres
  [Straat + huisnummer]
  [Adresregel 2 (optioneel)]
  [Postcode]  [Plaats]

[ ] Ik ga akkoord met de voorwaarden (link)

[ Bestelling plaatsen → ]
```

On submit (server action):
1. Validate with Zod
2. Compute totals server-side from current cart items + the latest workbook prices (re-fetch SKU prices to prevent client tampering)
3. Call `createPaymentSession(orderShape)` — returns `{ paymentSessionId: "stub_..." }`
4. Create `ShopOrder` row with status `"pending"` + paymentSessionId + paymentProvider `null`
5. Clear cart (server returns a redirect; client clears localStorage on success)
6. Redirect to `/bestelling/[orderId]/bedankt`

If validation fails, return field errors to render inline.

### `/bestelling/[orderId]/bedankt` — confirmation

```
H1: Bedankt voor je bestelling!

Bestelnummer: ORD-{first-8-of-id}
Totaal:       € 53,85

Hierna:
1. We sturen je een mail naar {customerEmail}
2. Je werkboek is morgen in huis
3. Vragen? Mail naar hallo@lexi.kids

[Verder winkelen →]
```

For Uitblinker line items in the order, the copy adapts: "Je eerste Uitblinker voor {kidName} wordt deze maand gemaakt en verstuurd."

---

## §6 — Payment provider hook

`src/lib/payment.ts`:

```ts
export type CreatePaymentInput = {
  orderId: string;
  amountCents: number;
  customerEmail: string;
  description: string;
};

export type CreatePaymentResult = {
  paymentSessionId: string;
  provider: "stub" | "mollie" | "paynl";
  /** Redirect URL if the provider needs a hosted checkout; null for stub. */
  redirectUrl: string | null;
};

export async function createPaymentSession(
  input: CreatePaymentInput,
): Promise<CreatePaymentResult> {
  // v1: stub. Real implementation flips on MOLLIE_API_KEY / PAYNL_TOKEN env vars.
  return {
    paymentSessionId: `stub_${input.orderId}_${Date.now()}`,
    provider: "stub",
    redirectUrl: null,
  };
}
```

Future Mollie:

```ts
if (process.env.MOLLIE_API_KEY) {
  const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
  const payment = await mollie.payments.create({
    amount: { currency: "EUR", value: (input.amountCents / 100).toFixed(2) },
    description: input.description,
    redirectUrl: `${process.env.APP_URL}/bestelling/${input.orderId}/bedankt`,
    webhookUrl:  `${process.env.APP_URL}/api/payment-webhook`,
    metadata: { orderId: input.orderId },
  });
  return { paymentSessionId: payment.id, provider: "mollie", redirectUrl: payment.getCheckoutUrl() };
}
```

Plug-and-play. One function.

---

## §7 — Trust signals

`src/components/shop/trust-signals.tsx` — 4-column horizontal row, each item Lucide icon + 1-line label. Compact, ~64px tall. Rendered on:
- `/shop` (above the workbook grid)
- `/shop/boek/[slug]` (below price block)
- `/winkelmand` (below subtotal block)
- `/afrekenen` (footer)

---

## §8 — Testing strategy

**Unit (Vitest):**
- `src/lib/cart.test.ts` — pure cart-state reducer (add/remove/setQty/clear, subtotal calc, item-count calc)
- `src/lib/payment.test.ts` — stub returns expected shape

**E2E (Playwright):**
- Add a workbook to cart → CartPill shows "1" → /winkelmand shows the item → checkout form → submit with valid data → bedankt page
- Add Uitblinker → cart has subscription line item → submit → order has uitblinker in items JSON
- Empty cart shows mascot + CTA
- Bad postcode is rejected

---

## §9 — Rollout

Additive: new pages, new context provider, schema column additions (all nullable defaults or with safe defaults). Existing flows unaffected.

**Deploy:**
1. `prisma db push` for schema changes
2. Ship the code
3. Smoke test: add to cart, /winkelmand, /afrekenen, place order, /bedankt
4. Cart pill should appear in nav across all pages

**Rollback:** revert the branch; the new pages disappear but DB has the new columns (harmless — they're nullable).

---

## Open items / known tensions

1. **`paymentSessionId` rename** from `stripeSessionId` is technically a breaking schema change. Today no production data exists. Future ops should know about the rename.
2. **`createPaymentSession` stub creates fake order without taking money.** Acceptable v1 because no Mollie/Pay.nl wired — real Stripe stage was always going to be a separate plug-in. Status stays "pending" forever; the future webhook flips it to "paid".
3. **Cart is anonymous-only.** A logged-in parent's cart isn't synced to their household. Trade-off: simpler. Some products do "merge anon cart into account on login" — defer.
4. **Postcode validation Dutch-only.** Will need extension for BE if Lexi BE-store opens. Defer.
5. **Cart toast is global state.** Two rapid adds = two toasts queued. Acceptable for v1.
6. **No quantity cap on workbook items.** Add a 99 cap if needed; defer.
