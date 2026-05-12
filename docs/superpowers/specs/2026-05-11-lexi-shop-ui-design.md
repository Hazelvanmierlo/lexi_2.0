# Lexi.kids — `/shop` UI Mock (Phase 6-UI) Design

**Date:** 2026-05-11
**Target visual:** `Downloads/website Lexi 2.0 (1)/pages/shop.png`
**Phase:** 6-UI — visual-only shop. No real cart, no Stripe checkout. Backend phases later.

## Goal

A `/shop` route matching `shop.png`: shop header, page title + lead, filter chips (category + groep, **static — not functional**), Abonnementen section (2 subscription cards), Bundels section (2 bundle cards), Werkboeken grid (12 workbook cards), and a sticky cart pill bottom-right.

## Non-goals

- Real cart state
- Real Stripe checkout
- Working filters
- Pagination
- Search

## Architecture

Server Component renders hardcoded arrays for subscriptions, bundles, workbooks. Sticky cart pill is a small client component (only because the floating position uses `position: fixed` — but it shows hardcoded "0 items"). All copy via `useTranslations("shop")`.

## Component tree

```
src/app/shop/page.tsx                          # server, hardcoded arrays
src/components/shop/
  shop-header.tsx                              # server — minimal header
  shop-heading.tsx                             # server — title + lead
  filter-bar.tsx                               # client — static chips, current selection visual only
  abonnementen-section.tsx                     # server — wraps 2 SubscriptionCards
  subscription-card.tsx                        # server
  bundles-section.tsx                          # server — wraps BundleCards
  bundle-card.tsx                              # server
  werkboeken-grid.tsx                          # server — wraps WorkbookCards
  workbook-card.tsx                            # server
  cart-pill.tsx                                # client — sticky bottom-right
```

## Hardcoded mock data (in `page.tsx`)

```ts
const SUBSCRIPTIONS = [
  { id: "sub-monthly", badge: "POPULAIR", name: "Lexi.kids Maandelijks", price: "€11,95", interval: "per maand", body: "Volledige toegang. Eerste 14 dagen gratis proberen.", cta: "Sluit af" },
  { id: "sub-yearly",  badge: "VOORDELIG", name: "Lexi.kids Jaarlijks",  price: "€119",   interval: "per jaar",  body: "2 maanden gratis ten opzichte van maandelijks.", cta: "Sluit af" },
];

const BUNDLES = [
  { id: "bundle-3-4", badge: "BUNDEL", name: "Compleet pakket groep 3-4", price: "€39,95", original: "€51,80", body: "5 werkboeken + 1 maand abonnement", cta: "In winkelmandje" },
  { id: "bundle-5-6", badge: "BUNDEL", name: "Compleet pakket groep 5-6", price: "€44,95", original: "€56,80", body: "5 werkboeken + 1 maand abonnement", cta: "In winkelmandje" },
];

const WORKBOOKS = [
  // groep 1-2 — teal
  { id: "wb-1", title: "Letters leren — groep 1", subject: "taal", groep: "1-2", price: "€12,30", symbol: "A", tint: "bg-teal-soft" },
  { id: "wb-2", title: "Tellen tot 20",          subject: "rekenen", groep: "1-2", price: "€12,30", symbol: "Σ", tint: "bg-teal-soft" },
  { id: "wb-3", title: "Lezen Stap 1",            subject: "lezen", groep: "1-2", price: "€13,95", symbol: "📖", tint: "bg-teal-soft" },
  // groep 3-4 — sun
  { id: "wb-4", title: "Tafels van 1 t/m 10",     subject: "rekenen", groep: "3-4", price: "€13,95", symbol: "Σ", tint: "bg-sun-soft" },
  { id: "wb-5", title: "Werkwoordspelling",       subject: "taal", groep: "3-4", price: "€14,95", symbol: "A", tint: "bg-sun-soft" },
  { id: "wb-6", title: "Breuken & Kommagetallen", subject: "rekenen", groep: "3-4", price: "€14,95", symbol: "½", tint: "bg-sun-soft" },
  // groep 5-6 — plum
  { id: "wb-7",  title: "Cito Voorbereiding Rekenen", subject: "rekenen", groep: "5-6", price: "€17,95", symbol: "Σ", tint: "bg-plum-soft" },
  { id: "wb-8",  title: "Cito Voorbereiding Taal",    subject: "taal", groep: "5-6", price: "€17,95", symbol: "A", tint: "bg-plum-soft" },
  { id: "wb-9",  title: "Begrijpend lezen",           subject: "lezen", groep: "5-6", price: "€15,95", symbol: "📖", tint: "bg-plum-soft" },
  // groep 7-8 — primary
  { id: "wb-10", title: "Cito Eindtoets pakket",     subject: "rekenen", groep: "7-8", price: "€24,95", symbol: "Σ", tint: "bg-primary-soft" },
  { id: "wb-11", title: "Engels woordenschat",        subject: "engels", groep: "7-8", price: "€16,95", symbol: "EN", tint: "bg-ok-soft" },
  { id: "wb-12", title: "Wereldoriëntatie",           subject: "wereld", groep: "7-8", price: "€17,95", symbol: "🌍", tint: "bg-plum-soft" },
];
```

## Filter chips (static)

Category: Alles / Abonnementen / Werkboeken / Bundels — first one ("Alles") shown active. Clicking does nothing in this phase (no `<button>` action handlers — they're just visual `<button type="button">` with state ignored).

Groep: Alle / 1 / 2 / 3 / 4 / 5 / 6 / 7 / 8 — first one active.

## CartPill

Bottom-right fixed pill with `bg-primary text-white`, `shopping-cart` icon, "0 items · €0,00". Renders with `position: fixed bottom-6 right-6 z-50`. Client component (needs `"use client"` because the fixed position interacts with body scroll — not strictly required, but the eventual real cart will use state, so keep client now).

## i18n keys (`shop` namespace)

```
shop.title
shop.breadcrumb = "Shop · Bundels & Abonnementen"
shop.heading.{title, lead}  // "Boeken en digitaal oefenen voor groep 1 t/m 8" + lead
shop.filters.{category, groep, all}.{labels}
shop.sections.{abonnementen, bundels, werkboeken}.title
shop.card.{addToCart, choosePlan}
shop.cart.{label, empty}
```

## Files

```
ADD:
  src/app/shop/page.tsx
  src/components/shop/shop-header.tsx
  src/components/shop/shop-heading.tsx
  src/components/shop/filter-bar.tsx
  src/components/shop/abonnementen-section.tsx
  src/components/shop/subscription-card.tsx
  src/components/shop/bundles-section.tsx
  src/components/shop/bundle-card.tsx
  src/components/shop/werkboeken-grid.tsx
  src/components/shop/workbook-card.tsx
  src/components/shop/cart-pill.tsx
  tests/e2e/shop.spec.ts

MODIFY:
  src/messages/nl-NL.json
  .lighthouserc.cjs    (add /shop URL)
```
