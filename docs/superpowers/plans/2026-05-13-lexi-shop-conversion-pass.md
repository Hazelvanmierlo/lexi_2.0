# Lexi.kids — Shop Conversion Pass: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Bring `/shop` up to Bol.com / Coolblue conversion standards. Spec at [`2026-05-13-lexi-shop-conversion-pass-design.md`](../specs/2026-05-13-lexi-shop-conversion-pass-design.md).

**Architecture:** ShopHeader gets a tri-level structure (top bar + main header + category bar); ShopPage gains a `<aside>` filter sidebar at md+; cart drawer mounts in root layout and is controlled by CartProvider state; sort + multi-select filtering goes through `applyShopFilters`.

**Tech Stack:** Same. No new npm deps.

---

## File inventory

| Path | New / Modify | Purpose |
|---|---|---|
| `prisma/schema.prisma` | Modify | Add `WorkbookSku.sortOrder Int @default(0)` |
| `prisma/seed.ts` | Modify | Assign sortOrder to the 24 workbooks |
| `src/lib/shop-filter.ts` | Modify | Multi-select arrays + sort + q-text |
| `src/lib/shop-filter.test.ts` | Modify | Cover new shape |
| `src/lib/breadcrumb.ts` | New | Path → breadcrumb segments |
| `src/lib/breadcrumb.test.ts` | New | Unit tests |
| `src/lib/cart-context.tsx` | Modify | Drawer state; `openDrawer`/`closeDrawer`; auto-open on add |
| `src/components/shop/shop-header.tsx` | Modify | Rich header (rewrite) |
| `src/components/shop/cart-drawer.tsx` | New | Right slide-in panel |
| `src/components/shop/payment-logos.tsx` | New | SVG row |
| `src/components/shop/filter-sidebar.tsx` | New | Desktop left sidebar (collapsible groups) |
| `src/components/shop/filter-mobile-sheet.tsx` | New | Mobile full-screen filter sheet |
| `src/components/shop/sort-select.tsx` | New | `<select>` controlling `?sort=` |
| `src/components/shop/breadcrumb.tsx` | New | Renders breadcrumb segments |
| `src/components/shop/stock-line.tsx` | New | "Op voorraad · morgen in huis" line for cards |
| `src/components/shop/sticky-add-to-cart.tsx` | New | Mobile detail-page bottom bar |
| `src/components/shop/cart-pill.tsx` | Modify | Hide on cart drawer open; otherwise unchanged |
| `src/components/shop/workbook-card.tsx` | Modify | Use `<StockLine>` beneath price; data-attr for popularity sort |
| `src/components/shop/book-detail.tsx` | Modify | Mobile padding + sticky bar; "Klanten kochten ook" |
| `src/components/shop/related-books.tsx` | Modify | Accept `title` prop |
| `src/app/shop/page.tsx` | Modify | Desktop sidebar layout; sort dropdown above grid; breadcrumb |
| `src/app/shop/boek/[slug]/page.tsx` | Modify | Breadcrumb; "Klanten kochten ook" query |
| `src/app/winkelmand/page.tsx` | Modify | Breadcrumb; payment logos in summary footer |
| `src/app/afrekenen/page.tsx` | Modify | Breadcrumb; payment logos in summary sidebar |
| `src/app/layout.tsx` | Modify | Mount `<CartDrawer>` |
| `src/app/hulp/page.tsx` | New | Klantenservice placeholder |
| `tests/e2e/shop-conversion.spec.ts` | New | E2E for sidebar + drawer + sort + sticky bar |

---

## Phase 0 — Schema + helpers

### Task 1: Add `sortOrder` to `WorkbookSku`

**Files:** `prisma/schema.prisma`, `prisma/seed.ts`

In schema, add `sortOrder Int @default(0)` to `WorkbookSku`. Run `npx prisma db push` + `npx prisma generate`.

In seed, after creating each workbook, set sortOrder. Heuristic: for popularity sort, prioritise lower groeps for Taal/Rekenen and middle groeps for Lezen. Simple v1: `sortOrder = groep * 10 + subjectOrder` where subjectOrder is 1/2/3 for Taal/Rekenen/Lezen. Lower is "more popular". Run seed.

Commit:
```bash
git commit -m "feat(shop): WorkbookSku.sortOrder for popularity sort"
```

### Task 2: Extend `shop-filter.ts` for multi-select + sort + q-text

**Files:** `src/lib/shop-filter.ts`, `src/lib/shop-filter.test.ts`

New shape:
```ts
export type ShopFilters = {
  subject: "all" | string[];
  groep: "all" | string[];
  sort: "popular" | "price-asc" | "price-desc" | "recent";
  q?: string;
};

export function parseShopFilters(searchParams: Record<string, string | undefined>): ShopFilters { ... }
export function applyShopFilters<T>(items: T[], filters: ShopFilters): T[] { ... }
```

Multi-select: subject/groep accept `"all"` OR an array (comma-separated string from URL: `parseShopFilters` splits on comma; "all" means no filter on that axis).

Sort:
- `popular`: ascending `sortOrder`
- `price-asc`: ascending `priceCents`
- `price-desc`: descending `priceCents`
- `recent`: descending `createdAt`

Text search: `q` matches `title` or `description` (case-insensitive substring).

Tests cover each branch + edge cases (`subject: []` returns nothing; empty array vs "all"). Add ~10 new tests.

Commit:
```bash
git commit -m "feat(shop): multi-select filter + sort + q-text search"
```

### Task 3: `breadcrumb.ts`

**Files:** `src/lib/breadcrumb.ts`, `src/lib/breadcrumb.test.ts`

Pure function:
```ts
export type Crumb = { label: string; href: string | null };
export function breadcrumbFor(pathname: string, params?: Record<string, string>): Crumb[];
```

Handle: `/shop`, `/shop?subject=X`, `/shop/boek/[slug]`, `/shop/uitblinker`, `/winkelmand`, `/afrekenen`, `/word-lid`, `/hulp`.

Tests cover each route.

Commit:
```bash
git commit -m "feat(shop): breadcrumb helper"
```

---

## Phase 1 — Cart drawer + provider state

### Task 4: Extend CartProvider with drawer state

**File:** `src/lib/cart-context.tsx`

Add to context value:
```ts
drawerOpen: boolean;
openDrawer: () => void;
closeDrawer: () => void;
```

`addWorkbook` / `addUitblinker` also call `openDrawer()`. The toast is suppressed when drawer opens (the drawer is its own affordance).

Auto-close: `useEffect` watching `drawerOpen` schedules a timeout of 6 seconds to close, cleared if user interacts (the drawer has its own mouse/touch listeners).

Commit:
```bash
git commit -m "feat(cart): drawer state in provider; auto-open on add"
```

### Task 5: `<CartDrawer>` component

**File:** `src/components/shop/cart-drawer.tsx`

Right slide-in panel, 400px wide on desktop, full-width on mobile with backdrop. Header (title + close), body (line items), footer (subtotal + CTA + payment logos).

`"use client"` — uses `useCart()`. Renders when `drawerOpen` is true. Background backdrop click + Esc key closes.

Use the existing `<CartLineItem>` from `/winkelmand` (DRY).

Implementation pattern:
```tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { CartLineItem } from "@/components/winkelmand/cart-line-item";
import { PaymentLogos } from "@/components/shop/payment-logos";
import { centsToEuro } from "@/lib/mappings";

export function CartDrawer() {
  const { items, subtotalCents, drawerOpen, closeDrawer } = useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;
  return (
    <>
      {/* Backdrop */}
      <div onClick={closeDrawer} className="fixed inset-0 z-40 bg-ink/30" />
      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Winkelmand"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="font-display text-lg font-bold text-ink">
            Winkelmand ({items.length})
          </h2>
          <button type="button" onClick={closeDrawer} aria-label="Sluiten">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-ink-2">Je winkelmand is leeg.</p>
          ) : items.map((it, i) => <CartLineItem key={i} item={it} index={i} compact />)}
        </div>

        {/* Footer */}
        <div className="border-t border-line p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-2">Subtotaal</span>
            <span className="font-display text-lg font-bold text-ink">{centsToEuro(subtotalCents)}</span>
          </div>
          <Link
            href="/afrekenen"
            onClick={closeDrawer}
            className="flex items-center justify-center gap-2 rounded-lexi bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lexi-sm hover:opacity-90"
          >
            Naar afrekenen <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={closeDrawer}
            className="flex w-full items-center justify-center gap-2 rounded-lexi border border-line bg-card px-5 py-2.5 text-sm font-medium text-ink hover:bg-bg-2"
          >
            <ShoppingCart className="h-4 w-4" /> Verder winkelen
          </button>
          <PaymentLogos />
        </div>
      </aside>
    </>
  );
}
```

`<CartLineItem>` may need a `compact` mode (smaller BookMockup, denser layout). Modify accordingly.

Mount `<CartDrawer />` inside `<CartProvider>` body in `layout.tsx` (alongside `<CartToast>`).

Commit:
```bash
git commit -m "feat(cart): right-side drawer with auto-open on add"
```

### Task 6: `<PaymentLogos>` component

**File:** `src/components/shop/payment-logos.tsx`

Inline SVG row, ~32px high. iDEAL (pink/blue squiggle), Mastercard (red+yellow circles), Visa (blue/yellow), Bancontact (yellow+blue). Approximated marks — not the official brand SVGs. Add `title` and `aria-label` per logo.

Commit:
```bash
git commit -m "feat(shop): payment logo row (iDEAL, Mastercard, Visa, Bancontact)"
```

---

## Phase 2 — Header + sidebar

### Task 7: Rewrite `<ShopHeader>`

**File:** `src/components/shop/shop-header.tsx`

Implement the three-level structure from spec §2. Top bar + main header + category bar (desktop only). The category bar uses anchor links to `/shop?subject=taal` etc.

Search input: a `<form action="/shop" method="GET">` with `<input name="q">`. Submitting navigates.

Account icon: server-rendered — call `currentParent()` from `@/lib/auth`. Returns `null` when not logged in (icon links to /login), or a Parent (icon links to /ouder).

Cart icon + count: a small `<NavCartIcon>` client component reading `useCart()` — same pattern as the existing nav cart icon. On click, calls `openDrawer()`.

Mobile collapses per spec §2.

Commit:
```bash
git commit -m "feat(shop): rich shop header with search, account, help, cart"
```

### Task 8: `<FilterSidebar>` + `<FilterMobileSheet>`

**Files:**
- `src/components/shop/filter-sidebar.tsx` (new)
- `src/components/shop/filter-mobile-sheet.tsx` (new)

Both consume the same URL state. Sidebar uses native `<details>` for collapsing — works server-side, accessible by default.

Multi-select via `<input type="checkbox">` whose name+value form the URL via the parent `<form>` element. Submit (on change) navigates to `/shop?subject=...&groep=...`.

For UX: an auto-submit on checkbox change is best; achieved via `<form>` with `onChange={(e) => e.currentTarget.requestSubmit()}` or a small `"use client"` wrapper.

Counts in parens (faceted): for v1 just show the totals (8 for Taal/Rekenen/Lezen; 3 for each groep). Static.

Reset link: `<Link href="/shop">Reset filters</Link>`.

Mobile sheet: full-screen overlay with the same checkbox structure + "Toepassen (N werkboeken)" button + "Annuleer" link. Mounted in `/shop` and triggered by a "Filter" button on the mobile filter row.

Commit:
```bash
git commit -m "feat(shop): left filter sidebar (desktop) + mobile sheet"
```

### Task 9: `<SortSelect>` + `<Breadcrumb>` + `<StockLine>`

**Files:**
- `src/components/shop/sort-select.tsx`
- `src/components/shop/breadcrumb.tsx`
- `src/components/shop/stock-line.tsx`

SortSelect: native `<select>` inside a `<form action="/shop" method="GET">` with auto-submit on change. Preserve other URL params (use hidden inputs).

Breadcrumb: takes `crumbs: Crumb[]` from `breadcrumbFor(pathname)`. Renders separated by `›` (chevron). Last crumb is plain text (no link).

StockLine: small Lucide `CheckCircle2` + "Op voorraad · morgen in huis" in `text-ok`. Used in WorkbookCard.

Commit:
```bash
git commit -m "feat(shop): SortSelect, Breadcrumb, StockLine components"
```

---

## Phase 3 — Page wiring

### Task 10: Rewrite `/shop` page

**File:** `src/app/shop/page.tsx`

Replace existing layout:
```
<ShopHeader />
<main>
  <Breadcrumb />
  <ShopHeading />
  <UitblinkerHero />
  <TrustSignals />
  <div className="md:grid md:grid-cols-[260px_1fr] md:gap-8">
    <FilterSidebar />  {/* desktop */}
    <section>
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-2">{n} werkboeken</p>
        <SortSelect />
      </div>
      <FilterMobileSheetTrigger /> {/* mobile only */}
      <WerkboekenGrid workbooks={filtered} />
    </section>
  </div>
  <Link href="/word-lid">...</Link>
</main>
<CartPill />
```

Update the searchParams parsing to use `parseShopFilters` (multi-select via comma split).

Commit:
```bash
git commit -m "feat(shop): index page with sidebar + sort + breadcrumb"
```

### Task 11: Breadcrumb on book detail + "Klanten kochten ook"

**File:** `src/app/shop/boek/[slug]/page.tsx`

Render `<Breadcrumb>` near the top. Query "Klanten kochten ook" recommendations per spec §5 algorithm. Render `<RelatedBooks title="Klanten kochten ook" books={recommendations} />` after the existing "Andere boeken voor groep N".

Update `<RelatedBooks>` to accept a `title` prop.

Commit:
```bash
git commit -m "feat(shop): breadcrumb + Klanten kochten ook on detail page"
```

### Task 12: WorkbookCard with StockLine

**File:** `src/components/shop/workbook-card.tsx`

Beneath the price, render `<StockLine />`. Adjust card padding if needed for the extra line.

Commit:
```bash
git commit -m "feat(shop): stock urgency line on workbook card"
```

### Task 13: Mobile sticky add-to-cart on detail

**Files:**
- `src/components/shop/sticky-add-to-cart.tsx` (new)
- `src/app/shop/boek/[slug]/page.tsx` (modify)

Implement per spec §6. Sticky bottom bar `md:hidden`. Add `pb-24 md:pb-0` to the detail page body so content doesn't hide.

Commit:
```bash
git commit -m "feat(shop): mobile sticky add-to-cart on book detail"
```

### Task 14: Breadcrumbs + payment logos on /winkelmand, /afrekenen, /word-lid

**Files:** modify the four pages

Add `<Breadcrumb>` to each. Add `<PaymentLogos>` to:
- `<CartSummary>` (existing component, append at bottom)
- `/afrekenen` summary sidebar (already has CartSummary)

Commit:
```bash
git commit -m "feat(shop): breadcrumbs + payment logos on cart, checkout, word-lid"
```

### Task 15: `/hulp` placeholder

**File:** `src/app/hulp/page.tsx`

Simple page with title "Klantenservice", brief copy "Heb je een vraag? Mail ons op hallo@lexi.kids" + link + breadcrumb.

Commit:
```bash
git commit -m "feat(shop): /hulp customer service placeholder"
```

### Task 16: Mount `<CartDrawer>` in root layout

**File:** `src/app/layout.tsx`

Inside `<CartProvider>`, add `<CartDrawer />` so it's always available.

Commit:
```bash
git commit -m "feat(cart): mount CartDrawer globally"
```

---

## Phase 4 — Tests

### Task 17: E2E for conversion features

**File:** `tests/e2e/shop-conversion.spec.ts`

Tests:
- Adding to cart opens drawer (right-side panel visible)
- Backdrop click closes drawer
- Esc key closes drawer
- Drawer "Verder winkelen" closes without nav
- Drawer "Naar afrekenen" navigates to /afrekenen
- Filter sidebar visible on desktop (use `setViewportSize`)
- Sort dropdown changes order; URL reflects `?sort=`
- Mobile sticky bar visible on detail page when viewport is mobile
- Breadcrumb has 5 segments on book detail
- "Klanten kochten ook" renders 3 cards on detail page

Commit:
```bash
git commit -m "test(shop): E2E for conversion pass (drawer, sidebar, sort, sticky)"
```

---

## Self-review

Spec coverage:
- §1 DoD 1 (rich header) → T7
- §1 DoD 2 (sidebar) → T8
- §1 DoD 3 (drawer) → T4+T5
- §1 DoD 4 (sort) → T2+T9+T10
- §1 DoD 5 (sticky add) → T13
- §1 DoD 6 (breadcrumb) → T3+T9+T11+T14
- §1 DoD 7 (stock line) → T9+T12
- §1 DoD 8 (klanten kochten) → T11
- §1 DoD 9 (payment logos) → T6+T14

Known gaps:
- Faceted counts inaccurate (spec known tension #1).
- Payment logos are approximated SVGs (spec known tension #4).

---

**17 tasks. Estimated implementation: ~7-9 hours.**
