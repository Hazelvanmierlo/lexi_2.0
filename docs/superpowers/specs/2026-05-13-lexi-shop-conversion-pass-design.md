# Lexi.kids — Shop Conversion Pass

**Date:** 2026-05-13
**Status:** Approved design
**References:** Bol.com category pages, Coolblue product pages, Baymard Institute large-scale e-commerce UX research, GoodUI A/B test catalog.

---

## Context

Today's `/shop` works (cart + checkout shipped earlier today) but reads as a brochure, not a store. The `<ShopHeader>` is brand + dummy hamburger; there's no search, no left sidebar on desktop, no sort dropdown, no urgency, no payment logos, no breadcrumb depth. Bol.com / Coolblue patterns and Baymard research all point at the same gaps.

This spec adds the **conversion-optimized e-commerce shell** around the existing book catalogue. No new product or pricing logic — purely shell + navigation + trust layer.

---

## §1 — Goals & success criteria

### What ships (9 items, prioritised)

1. **Rich shop header** — brand, persistent search, free-shipping bar, account/customer-service/cart icons, desktop category sub-bar.
2. **Left filter sidebar on desktop** — replaces the top pill-filters on viewports ≥ md. Categories are collapsible. Mobile keeps pills.
3. **Cart drawer** — right-side slide-in that opens automatically when an item is added; contains line items + subtotal + "Naar afrekenen" + "Verder winkelen". Replaces today's auto-navigate-to-/winkelmand-only flow.
4. **Sort dropdown** above the grid: Populariteit (default), Prijs ↑, Prijs ↓, Recent toegevoegd.
5. **Sticky add-to-cart bar on mobile** on `/shop/boek/[slug]` — bottom-of-viewport bar with price + add-to-cart button while user scrolls description.
6. **Breadcrumb depth** — `Lexi > Shop > Werkboeken > Taal > Groep 3` (or appropriate path per page).
7. **Stock + urgency on cards** — each WorkbookCard shows "Op voorraad · morgen in huis" inline, not only in trust signals.
8. **"Klanten kochten ook"** — 3-card recommendation strip on detail pages (algorithm: same groep, different subject; fallback: same subject, neighbouring groep).
9. **Payment logos** — iDEAL, Mastercard, Visa, Bancontact in checkout + cart footer.

### Definition of done

| # | Statement |
|---|---|
| 1 | `<ShopHeader>` shows brand, search input, free-shipping bar, account/klantenservice/cart icons; desktop also shows category sub-bar. |
| 2 | On viewports ≥ md, `/shop` renders a left-sidebar filter (subject + groep); mobile keeps the pill filters above the grid. URL state remains the canonical filter source. |
| 3 | Tapping "In winkelmand" anywhere opens the cart drawer (right slide-in) with the new item highlighted. Drawer has "Verder winkelen" (closes drawer) + "Naar afrekenen" (`/afrekenen`). |
| 4 | A sort dropdown above the grid changes the order of the visible workbooks; selection persists in URL (`?sort=popular|price-asc|price-desc|recent`). |
| 5 | `/shop/boek/[slug]` on mobile shows a sticky bottom bar with price + add-to-cart while scrolling the description below the fold. |
| 6 | Every shop page renders a breadcrumb of at least 3 levels where applicable. |
| 7 | Each WorkbookCard shows a single-line "Op voorraad · morgen in huis" beneath the price. |
| 8 | `/shop/boek/[slug]` shows a "Klanten kochten ook" strip below the existing "Andere boeken voor groep N". |
| 9 | `/winkelmand` and `/afrekenen` footers include the four payment-method logos. |

### Out of scope (deferred)

- **Real reviews system.** Adding fake ratings is unethical and risks GDPR misrepresentation; skipped until post-launch when real review collection is possible.
- **Wishlist / save for later.** Anonymous browsers can't keep state across sessions without account; defer to post-account-system.
- **Quick-view modal.** Detail page is one click; adds complexity for marginal lift on a 24-SKU shop.
- **Q&A section.** Content-team load; defer until content team has bandwidth.
- **Recently viewed.** localStorage trail, defer.
- **Newsletter signup.** Out of this spec; lands later with email infrastructure.

---

## §2 — Header structure

```
┌───────────────────────────────────────────────────────────────────────────┐
│  TOP BAR (compact, 32px high)                                             │
│  📞 Vragen? Mail hallo@lexi.kids   │   Gratis verzending vanaf € 25       │
├───────────────────────────────────────────────────────────────────────────┤
│  MAIN HEADER (64-72px high)                                               │
│  [LOGO Lexi.kids]   [ search input wide centre ]   [account] [help] [🛒2] │
├───────────────────────────────────────────────────────────────────────────┤
│  CATEGORY BAR (desktop only, 48px high)                                   │
│  Werkboeken: [Taal] [Rekenen] [Begrijpend Lezen]  ·  Uitblinker  ·  Word lid│
└───────────────────────────────────────────────────────────────────────────┘
```

### Top bar
- Left: contact (Lucide `Mail` + "Mail hallo@lexi.kids", links to `mailto:hallo@lexi.kids`)
- Right: free-shipping bar with Lucide `Truck`

### Main header
- **Brand** stays as today (mascot + wordmark) — clickable, returns to `/`
- **Search**: text input with Lucide `Search` icon, placeholder "Zoek een werkboek of onderwerp…", focus ring matches Lexi primary. Submits a `GET /shop?q=...` query string. Backend filter logic gains text matching on title + description.
- **Account icon**: Lucide `UserCircle`. If `currentParent()` resolves → "Mijn account" tooltip + links to `/ouder`. Else → "Inloggen" + links to `/login`.
- **Help icon**: Lucide `HelpCircle`. Links to `/hulp` (placeholder route, see §6).
- **Cart icon**: Lucide `ShoppingCart` + count badge. Tap → opens cart drawer.

### Category bar (desktop only, hidden on mobile)
- Three workbook subject links (clicking sets the `subject` URL filter): Taal · Rekenen · Begrijpend Lezen
- Separator dot
- Uitblinker link → `/shop/uitblinker`
- Word lid link → `/word-lid`

### Mobile
- Top bar collapses to just the shipping promise
- Main header: brand + search trigger icon (opens search overlay) + cart icon
- Hamburger menu reveals: category list + account + help + word lid

---

## §3 — Left filter sidebar (desktop)

On `/shop` at viewport ≥ md:

```
┌──────────────────┬──────────────────────────────────────────────┐
│ FILTERS          │  Sort:  [Populariteit ▼]      24 werkboeken  │
│                  │                                              │
│ ▼ Onderwerp      │  [Card] [Card] [Card] [Card]                 │
│   ☐ Taal (8)     │                                              │
│   ☐ Rekenen (8)  │  [Card] [Card] [Card] [Card]                 │
│   ☐ Lezen (8)    │                                              │
│                  │                                              │
│ ▼ Groep          │                                              │
│   ☐ Groep 1 (3)  │                                              │
│   ☐ Groep 2 (3)  │                                              │
│   ...            │                                              │
│   ☐ Groep 8 (3)  │                                              │
│                  │                                              │
│ [Reset filters]  │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

- Each filter group is a collapsible `<details>` element (no JS needed for expand/collapse — works server-side too).
- Checkboxes (not radio) — supports multi-select.
- Counts in parens reflect how many items match the OTHER filters (faceted search). For v1 we display total counts (ignoring co-selection) to keep server-side rendering cheap; faceted accuracy is a polish item.
- URL state: `?subject=taal,rekenen&groep=3,4&sort=popular` (comma-separated for multi-select).
- "Reset filters" link clears all params.

**Mobile**: filter sidebar collapses to a "Filter" button at top (Lucide `SlidersHorizontal`); tap opens a full-screen sheet with the same filter groups. Today's pill-filters remain as a secondary path on the desktop view's mobile fallback (so the data flow is identical — just different UI).

**Filter helper extension:** `applyShopFilters` accepts arrays now:
```ts
type ShopFilters = {
  subject: "all" | string[];  // string[] for multi-select
  groep: "all" | string[];
  sort: "popular" | "price-asc" | "price-desc" | "recent";
  q?: string;
};
```

"Populariteit" sort uses a stub field on WorkbookSku (`sortOrder Int @default(0)`) — for v1 hardcode an order at seed time (e.g. Taal G3, Taal G5, Rekenen G3, etc. — based on what's plausibly most-bought). Later replaced by real order-history aggregation.

---

## §4 — Cart drawer

A right-side slide-in panel. Mounted in the root layout alongside `<CartToast>`.

```tsx
type CartDrawerState = "closed" | "open";
```

State lives in the CartProvider. Adding an item auto-opens the drawer (in place of the toast for that interaction — or alongside; pick one for v1: auto-open the drawer, drop the toast for add events; keep toast for non-add notifications). Drawer auto-closes after 4 seconds of no interaction OR can be closed manually.

```
┌─────────────────────────────────────┐
│  Winkelmand (2)             [X]     │
├─────────────────────────────────────┤
│  [BookMockup small]  Taal groep 3   │
│                      €16,95         │
│                      [-1+] [×]      │
├─────────────────────────────────────┤
│  [BookMockup small]  Rekenen gr 5   │
│                      €16,95         │
│                      [-1+] [×]      │
├─────────────────────────────────────┤
│  Subtotaal       € 33,90            │
│  Verzending      Gratis             │
│  Totaal          € 33,90            │
├─────────────────────────────────────┤
│  [ Naar afrekenen → ]   primary     │
│  [ Verder winkelen ]    secondary   │
├─────────────────────────────────────┤
│  iDEAL · Mastercard · Visa · BCMC   │
└─────────────────────────────────────┘
```

- Width: 400px desktop; full width mobile (with backdrop)
- Click outside or `Esc` key closes
- Same line-item component as `/winkelmand` (DRY)
- Empty state inside drawer is hidden — drawer just closes if cart becomes empty

The full `/winkelmand` page remains for direct navigation and for users who clicked the cart icon (not the auto-open trigger).

---

## §5 — Sort, breadcrumbs, stock, "Klanten kochten ook"

### Sort dropdown

`<select>` element above the grid (server-rendered, no JS-only). Options: Populariteit · Prijs ↑ · Prijs ↓ · Recent toegevoegd. Sets `?sort=` in URL.

Implementation: `applyShopFilters` now sorts in addition to filtering. `recent` sorts by `createdAt desc`. `popular` sorts by the new `sortOrder` field. `price-asc/desc` sorts by `priceCents`.

### Breadcrumbs

A `<Breadcrumb>` component reading `pathname` + (optional) override. Renders pipe-or-chevron separated links.

- `/shop` → `Lexi > Shop`
- `/shop?subject=taal` → `Lexi > Shop > Taal`
- `/shop/boek/taal-groep-3` → `Lexi > Shop > Taal > Groep 3 > Taal groep 3`
- `/shop/uitblinker` → `Lexi > Shop > Uitblinker`
- `/word-lid` → `Lexi > Word lid`
- `/winkelmand` → `Lexi > Winkelmand`
- `/afrekenen` → `Lexi > Winkelmand > Afrekenen`

### Stock + urgency on card

Beneath the price on every `<WorkbookCard>`:
```tsx
<p className="mt-1 flex items-center gap-1 text-xs text-ok">
  <CheckCircle2 className="h-3 w-3" />
  Op voorraad — voor 22:00 besteld, morgen in huis
</p>
```

For v1, every workbook shows "Op voorraad" (no stock tracking). Once stock is implemented, conditional render.

### "Klanten kochten ook" on detail page

New section below "Andere boeken voor groep N":

```tsx
<RelatedBooks
  title="Klanten kochten ook"
  books={recommendations}
/>
```

Algorithm for `recommendations`:
1. Query: `subject != current.subject AND groepBucket == current.groepBucket` → take up to 3
2. If < 3 results: `subject == current.subject AND groepBucket IN [current ± 1]` → fill to 3
3. If still < 3: any active workbook excluding current → fill

For v1, this is sufficient. Real personalized recommendations require order-history.

---

## §6 — Mobile sticky add-to-cart

On `/shop/boek/[slug]`, append at the bottom of the page:

```tsx
<div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card p-3 shadow-lexi md:hidden">
  <div className="mx-auto flex max-w-[600px] items-center justify-between gap-3">
    <div>
      <p className="font-display text-lg font-bold text-ink">{price}</p>
      <p className="text-xs text-ink-2">Op voorraad</p>
    </div>
    <button onClick={addToCart} className="rounded-lexi bg-primary px-4 py-2.5 text-sm font-semibold text-white">
      <ShoppingCart /> In winkelmand
    </button>
  </div>
</div>
```

Only renders on mobile (md:hidden). Desktop hides this; the in-page CTA in the right rail remains the primary add-to-cart action.

`pb-24` added to the page body on mobile so content doesn't hide under the bar.

---

## §7 — Payment logos

`<PaymentLogos>` component — a horizontal row of inline SVGs (no external deps):
- iDEAL
- Mastercard
- Visa
- Bancontact

Use simplified SVG marks (not the official brand assets — for v1 we render approximate logos via SVG, brand-acceptable since this is dev/staging). Real brand SVGs go in `/public/payment/{name}.svg` when we wire actual providers.

Rendered in:
- Cart drawer footer
- `/winkelmand` summary block footer
- `/afrekenen` footer of summary sidebar
- `/shop` page footer (subtle)

---

## §8 — Schema additions

`WorkbookSku` gets a `sortOrder Int @default(0)` for popularity ordering. Seed assigns increasing integers based on the spec's heuristic ordering (Taal first for younger groeps tends to be highest sold in real Junior-Einstein-like shops).

No other schema changes.

---

## §9 — Testing strategy

**Unit:**
- `src/lib/shop-filter.test.ts` extended — multi-select arrays, sort variants, q-text-search
- `src/lib/breadcrumb.test.ts` — pathname → breadcrumb segments

**E2E:**
- Adding to cart opens drawer; drawer closes on backdrop click; "Naar afrekenen" navigates
- Filter sidebar checkbox on desktop filters the grid; URL reflects state
- Sort dropdown changes order
- Mobile sticky bar on detail page is visible and adds to cart
- Breadcrumb on detail page shows 5 levels

---

## §10 — Rollout

Additive — no breaking changes. `<ShopHeader>` is rewritten in place. Other pages (`/`, `/probeer`) keep using the existing `<Nav>` component.

**Deploy steps:**
1. `prisma db push` for `sortOrder` field
2. Re-seed (24 workbooks get new sortOrder values)
3. Ship code

**Rollback:** revert the branch; `sortOrder` field stays (harmless default 0).

---

## Open items / known tensions

1. **Faceted filter counts are not co-selection-accurate** (filter group counts ignore other selected filters). Fixing requires per-permutation queries — defer until shop has > 50 SKUs.
2. **Search is title + description only** — no synonym matching, no typo tolerance on search yet. Acceptable v1; Lexi search volume will be tiny initially.
3. **`/hulp` is a placeholder route** showing "Klantenservice komt binnenkort. Mail ons: hallo@lexi.kids". Real help center is post-launch.
4. **Payment logos are approximated SVGs** until brand assets are licensed and dropped in `/public/payment/`.
5. **Cart-drawer auto-open replaces the toast** for add events. Toast remains for other notifications. Trade-off: drawer is more disruptive than toast but better for cart-awareness.
