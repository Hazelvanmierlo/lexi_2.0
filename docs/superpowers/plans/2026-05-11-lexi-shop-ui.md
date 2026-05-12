# Lexi.kids — `/shop` UI Mock (Phase 6-UI) Plan

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** `/shop` page matching `shop.png`. Header + heading + filter chips + Abonnementen section + Bundels section + Werkboeken grid + sticky cart pill.

**Spec:** `docs/superpowers/specs/2026-05-11-lexi-shop-ui-design.md`

## Executor notes
- Working dir `C:\Users\thoma\lexi_2.0`. No git commits.

---

### Task 1: Messages

Add to `nl-NL.json` (sibling of `admin`, comma-separated):

```json
"shop": {
  "title": "Shop",
  "breadcrumb": "Shop · Bundels & Abonnementen",
  "heading": {
    "title": "Boeken en digitaal oefenen voor groep 1 t/m 8",
    "lead": "Combineer fysieke werkboeken met een abonnement op Lexi — kinderen leren beter als ze afwisselen tussen scherm en schrift."
  },
  "filters": {
    "category": {
      "label": "Categorie",
      "all": "Alles",
      "abonnementen": "Abonnementen",
      "werkboeken": "Werkboeken",
      "bundels": "Bundels"
    },
    "groep": {
      "label": "Groep",
      "all": "Alle"
    }
  },
  "sections": {
    "abonnementen": "Abonnementen",
    "bundels":      "Bundels",
    "werkboeken":   "Werkboeken"
  },
  "card": {
    "addToCart":  "In winkelmandje",
    "choosePlan": "Sluit af",
    "groepLabel": "Groep"
  },
  "cart": {
    "label": "Winkelmandje",
    "empty": "0 items · €0,00"
  }
}
```

Build:
```bash
npm run build
```

---

### Task 2: Bundle all shop components in one dispatch

Create the directory `src/components/shop/`, then create all files:

#### `shop-header.tsx`

```tsx
import Link from "next/link";
import { Menu } from "lucide-react";
import { MascotImage } from "@/components/ui/mascot";

export function ShopHeader() {
  return (
    <header className="border-b border-line-2 bg-card">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <MascotImage style="bot" age="kid" size={28} decorative className="h-7 w-7" />
          <span className="font-display text-lg font-bold tracking-tight text-ink">Lexi.kids</span>
        </Link>
        <button type="button" aria-label="Menu" className="rounded-lexi border border-line bg-card p-2 text-ink hover:bg-bg-2">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
```

#### `shop-heading.tsx`

```tsx
import { useTranslations } from "next-intl";

export function ShopHeading() {
  const t = useTranslations("shop");
  const h = useTranslations("shop.heading");
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-ink-2">{t("breadcrumb")}</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink text-balance md:text-5xl">
        {h("title")}
      </h1>
      <p className="mt-3 max-w-2xl text-ink-2 md:text-lg">{h("lead")}</p>
    </div>
  );
}
```

#### `filter-bar.tsx`

```tsx
"use client";

import { useTranslations } from "next-intl";

export function FilterBar() {
  const cat = useTranslations("shop.filters.category");
  const grp = useTranslations("shop.filters.groep");
  const CATEGORIES = [cat("all"), cat("abonnementen"), cat("werkboeken"), cat("bundels")];
  const GROEP_OPTS = [grp("all"), "1", "2", "3", "4", "5", "6", "7", "8"];

  return (
    <div className="space-y-3">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">{cat("label")}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {CATEGORIES.map((c, i) => (
            <li key={c}>
              <button
                type="button"
                className={`rounded-full border px-3 py-1 text-sm font-medium ${
                  i === 0
                    ? "border-primary bg-primary-soft text-primary-ink"
                    : "border-line bg-card text-ink-2 hover:bg-bg-2"
                }`}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">{grp("label")}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {GROEP_OPTS.map((g, i) => (
            <li key={g}>
              <button
                type="button"
                className={`rounded-full border px-3 py-1 text-sm font-medium ${
                  i === 0
                    ? "border-primary bg-primary-soft text-primary-ink"
                    : "border-line bg-card text-ink-2 hover:bg-bg-2"
                }`}
              >
                {g}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

#### `subscription-card.tsx`

```tsx
import { useTranslations } from "next-intl";

type Props = {
  id: string;
  badge: string;
  name: string;
  price: string;
  interval: string;
  body: string;
};

export function SubscriptionCard({ badge, name, price, interval, body }: Props) {
  const t = useTranslations("shop.card");
  return (
    <article className="flex flex-col rounded-lexi-lg border border-line bg-card p-6 shadow-lexi-sm">
      <span className="inline-flex w-fit items-center rounded-full bg-sun-soft px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-ink">
        {badge}
      </span>
      <h3 className="mt-3 font-display text-xl font-bold text-ink">{name}</h3>
      <p className="mt-3">
        <span className="font-display text-3xl font-bold text-ink">{price}</span>
        <span className="ml-2 text-sm text-ink-2">{interval}</span>
      </p>
      <p className="mt-3 flex-1 text-sm text-ink-2">{body}</p>
      <button
        type="button"
        className="mt-6 rounded-lexi bg-primary px-4 py-2 text-sm font-medium text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {t("choosePlan")}
      </button>
    </article>
  );
}
```

#### `abonnementen-section.tsx`

```tsx
import { useTranslations } from "next-intl";
import { SubscriptionCard } from "./subscription-card";

type Sub = { id: string; badge: string; name: string; price: string; interval: string; body: string };

export function AbonnementenSection({ subs }: { subs: Sub[] }) {
  const t = useTranslations("shop.sections");
  return (
    <section>
      <h2 className="font-display text-xl font-bold uppercase tracking-wider text-ink-2">{t("abonnementen")}</h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {subs.map((s) => (
          <li key={s.id}><SubscriptionCard {...s} /></li>
        ))}
      </ul>
    </section>
  );
}
```

#### `bundle-card.tsx`

```tsx
import { useTranslations } from "next-intl";

type Props = {
  id: string;
  badge: string;
  name: string;
  price: string;
  original: string;
  body: string;
};

export function BundleCard({ badge, name, price, original, body }: Props) {
  const t = useTranslations("shop.card");
  return (
    <article className="flex flex-col rounded-lexi-lg border border-line bg-card p-6 shadow-lexi-sm">
      <span className="inline-flex w-fit items-center rounded-full bg-teal-soft px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-ink">
        {badge}
      </span>
      <h3 className="mt-3 font-display text-lg font-bold text-ink">{name}</h3>
      <p className="mt-3">
        <span className="font-display text-3xl font-bold text-ink">{price}</span>
        <span className="ml-2 text-sm text-ink-2 line-through">{original}</span>
      </p>
      <p className="mt-3 flex-1 text-sm text-ink-2">{body}</p>
      <button
        type="button"
        className="mt-6 rounded-lexi bg-primary px-4 py-2 text-sm font-medium text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {t("addToCart")}
      </button>
    </article>
  );
}
```

#### `bundles-section.tsx`

```tsx
import { useTranslations } from "next-intl";
import { BundleCard } from "./bundle-card";

type Bundle = { id: string; badge: string; name: string; price: string; original: string; body: string };

export function BundlesSection({ bundles }: { bundles: Bundle[] }) {
  const t = useTranslations("shop.sections");
  return (
    <section>
      <h2 className="font-display text-xl font-bold uppercase tracking-wider text-ink-2">{t("bundels")}</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {bundles.map((b) => (
          <li key={b.id}><BundleCard {...b} /></li>
        ))}
      </ul>
    </section>
  );
}
```

#### `workbook-card.tsx`

```tsx
import { useTranslations } from "next-intl";

type Props = {
  id: string;
  title: string;
  groep: string;
  price: string;
  symbol: string;
  tint: string;
};

export function WorkbookCard({ title, groep, price, symbol, tint }: Props) {
  const t = useTranslations("shop.card");
  return (
    <article className="flex flex-col overflow-hidden rounded-lexi-lg border border-line bg-card shadow-lexi-sm">
      <div className={`flex items-center justify-center ${tint} aspect-square text-7xl font-display font-bold text-ink`} aria-hidden="true">
        {symbol}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">{t("groepLabel")} {groep}</p>
        <h3 className="mt-1 font-display text-sm font-bold text-ink line-clamp-2">{title}</h3>
        <p className="mt-3 font-display text-lg font-bold text-ink">{price}</p>
        <button
          type="button"
          className="mt-3 rounded-lexi border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t("addToCart")}
        </button>
      </div>
    </article>
  );
}
```

#### `werkboeken-grid.tsx`

```tsx
import { useTranslations } from "next-intl";
import { WorkbookCard } from "./workbook-card";

type Workbook = { id: string; title: string; subject: string; groep: string; price: string; symbol: string; tint: string };

export function WerkboekenGrid({ workbooks }: { workbooks: Workbook[] }) {
  const t = useTranslations("shop.sections");
  return (
    <section>
      <h2 className="font-display text-xl font-bold uppercase tracking-wider text-ink-2">{t("werkboeken")}</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {workbooks.map((w) => (
          <li key={w.id}><WorkbookCard {...w} /></li>
        ))}
      </ul>
    </section>
  );
}
```

#### `cart-pill.tsx`

```tsx
"use client";

import { useTranslations } from "next-intl";
import { ShoppingCart } from "lucide-react";

export function CartPill() {
  const t = useTranslations("shop.cart");
  return (
    <button
      type="button"
      aria-label={t("label")}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-white shadow-lexi-lg hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <ShoppingCart className="h-5 w-5" />
      <span>{t("empty")}</span>
    </button>
  );
}
```

Build:
```bash
npm run build
```

---

### Task 3: `/shop` page composition

`src/app/shop/page.tsx`:

```tsx
import { ShopHeader } from "@/components/shop/shop-header";
import { ShopHeading } from "@/components/shop/shop-heading";
import { FilterBar } from "@/components/shop/filter-bar";
import { AbonnementenSection } from "@/components/shop/abonnementen-section";
import { BundlesSection } from "@/components/shop/bundles-section";
import { WerkboekenGrid } from "@/components/shop/werkboeken-grid";
import { CartPill } from "@/components/shop/cart-pill";

const SUBSCRIPTIONS = [
  { id: "sub-monthly", badge: "POPULAIR", name: "Lexi.kids Maandelijks", price: "€11,95", interval: "per maand", body: "Volledige toegang. Eerste 14 dagen gratis proberen." },
  { id: "sub-yearly",  badge: "VOORDELIG", name: "Lexi.kids Jaarlijks",  price: "€119",   interval: "per jaar",  body: "2 maanden gratis ten opzichte van maandelijks." },
];

const BUNDLES = [
  { id: "bundle-3-4", badge: "BUNDEL", name: "Compleet pakket groep 3-4", price: "€39,95", original: "€51,80", body: "5 werkboeken + 1 maand abonnement" },
  { id: "bundle-5-6", badge: "BUNDEL", name: "Compleet pakket groep 5-6", price: "€44,95", original: "€56,80", body: "5 werkboeken + 1 maand abonnement" },
];

const WORKBOOKS = [
  { id: "wb-1",  title: "Letters leren — groep 1",     subject: "taal",    groep: "1-2", price: "€12,30", symbol: "A",  tint: "bg-teal-soft" },
  { id: "wb-2",  title: "Tellen tot 20",               subject: "rekenen", groep: "1-2", price: "€12,30", symbol: "Σ",  tint: "bg-teal-soft" },
  { id: "wb-3",  title: "Lezen Stap 1",                subject: "lezen",   groep: "1-2", price: "€13,95", symbol: "L",  tint: "bg-teal-soft" },
  { id: "wb-4",  title: "Tafels van 1 t/m 10",         subject: "rekenen", groep: "3-4", price: "€13,95", symbol: "Σ",  tint: "bg-sun-soft" },
  { id: "wb-5",  title: "Werkwoordspelling",           subject: "taal",    groep: "3-4", price: "€14,95", symbol: "A",  tint: "bg-sun-soft" },
  { id: "wb-6",  title: "Breuken & Kommagetallen",     subject: "rekenen", groep: "3-4", price: "€14,95", symbol: "½",  tint: "bg-sun-soft" },
  { id: "wb-7",  title: "Cito Voorbereiding Rekenen",  subject: "rekenen", groep: "5-6", price: "€17,95", symbol: "Σ",  tint: "bg-plum-soft" },
  { id: "wb-8",  title: "Cito Voorbereiding Taal",     subject: "taal",    groep: "5-6", price: "€17,95", symbol: "A",  tint: "bg-plum-soft" },
  { id: "wb-9",  title: "Begrijpend lezen",            subject: "lezen",   groep: "5-6", price: "€15,95", symbol: "L",  tint: "bg-plum-soft" },
  { id: "wb-10", title: "Cito Eindtoets pakket",       subject: "rekenen", groep: "7-8", price: "€24,95", symbol: "Σ",  tint: "bg-primary-soft" },
  { id: "wb-11", title: "Engels woordenschat",         subject: "engels",  groep: "7-8", price: "€16,95", symbol: "EN", tint: "bg-ok-soft" },
  { id: "wb-12", title: "Wereldoriëntatie",            subject: "wereld",  groep: "7-8", price: "€17,95", symbol: "W",  tint: "bg-plum-soft" },
];

export default function ShopPage() {
  return (
    <>
      <ShopHeader />
      <main id="main-content" className="mx-auto max-w-[1200px] space-y-12 px-5 py-10">
        <ShopHeading />
        <FilterBar />
        <AbonnementenSection subs={SUBSCRIPTIONS} />
        <BundlesSection bundles={BUNDLES} />
        <WerkboekenGrid workbooks={WORKBOOKS} />
      </main>
      <CartPill />
    </>
  );
}
```

Build:
```bash
npm run build
```

---

### Task 4: E2E + Lighthouse

#### `tests/e2e/shop.spec.ts`

```ts
import { test, expect } from "@playwright/test";

test("shop — sections + workbooks + cart pill visible", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.getByRole("heading", { name: /Boeken en digitaal oefenen/ })).toBeVisible();
  await expect(page.getByText("Lexi.kids Maandelijks")).toBeVisible();
  await expect(page.getByText("Lexi.kids Jaarlijks")).toBeVisible();
  await expect(page.getByText(/Compleet pakket groep 3-4/)).toBeVisible();
  await expect(page.getByText("Tafels van 1 t/m 10")).toBeVisible();
  await expect(page.getByLabel(/Winkelmandje/)).toBeVisible();
});
```

#### Modify `.lighthouserc.cjs`: add `"http://localhost:3000/shop"` to `collect.url`.

#### Run

```bash
npm run build && npm test && npm run test:e2e && npm run lighthouse
```

Expected:
- build clean (6 routes)
- 14/14 unit
- 6 e2e
- lighthouse passes 5 URLs

Cleanup node. Report. No commits.
