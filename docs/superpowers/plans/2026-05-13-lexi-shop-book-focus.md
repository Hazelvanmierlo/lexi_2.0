# Lexi.kids — Shop Book Focus + Uitblinker: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Refocus `/shop` on workbooks + Uitblinker, ship a junioreinstein-style per-book detail page, move digital subscriptions to `/word-lid`, and prepare schema for adaptive Uitblinker subscriptions. Spec at [`2026-05-13-lexi-shop-book-focus-design.md`](../specs/2026-05-13-lexi-shop-book-focus-design.md).

**Architecture:** Server-rendered shop index with client-state filter bar; per-book detail at `/shop/boek/[slug]`; Uitblinker landing at `/shop/uitblinker`; digital tiers move to `/word-lid`. Schema additions: `WorkbookSku` enriched with content fields; new `UitblinkerSubscription` model. Reseed produces 24 books.

**Tech Stack:** Same as before. No new npm deps.

---

## File inventory

| Path | New / Modify | Purpose |
|---|---|---|
| `prisma/schema.prisma` | Modify | `WorkbookSku` enrichment; `UitblinkerSubscription` model; inverse relations on `Kid`/`Household` |
| `prisma/seed.ts` | Modify | Replace 15 workbooks with 24 (3 subjects × 8 groeps); rich content |
| `src/lib/uitblinker.ts` | New | `UITBLINKER_PRICE_CENTS`, `UITBLINKER_INTERVAL`, copy constants |
| `src/lib/markdown.ts` | New | Minimal markdown → JSX (paragraphs + bullet lists) |
| `src/lib/markdown.test.ts` | New | Unit tests |
| `src/lib/shop-filter.ts` | New | Pure filter logic — `applyFilters(workbooks, {subject, groep})` |
| `src/lib/shop-filter.test.ts` | New | Unit tests |
| `src/app/shop/page.tsx` | Modify | New layout: hero, filters, 24-workbook grid, Uitblinker hero card |
| `src/components/shop/uitblinker-hero.tsx` | New | The Uitblinker card on the shop index |
| `src/components/shop/workbook-card.tsx` | Modify | Card now links to detail page; shows highlights count, real cover styling |
| `src/components/shop/filter-bar.tsx` | Modify | Make filters functional (client state, URL query sync) |
| `src/components/shop/werkboeken-grid.tsx` | Modify | Accept filtered workbooks; show empty state when nothing matches |
| `src/components/shop/abonnementen-section.tsx` | Modify | Move out of shop; lift content into the new `/word-lid` page |
| `src/components/shop/bundles-section.tsx` | Delete | Bundles deprecated for v1 — remove from shop (kept SKU in DB for later) |
| `src/app/shop/boek/[slug]/page.tsx` | New | Per-book detail page |
| `src/components/shop/book-detail.tsx` | New | Hero (cover, price, highlights) + description + specs + related |
| `src/components/shop/book-highlights.tsx` | New | Lucide `Check`-prefixed list |
| `src/components/shop/related-books.tsx` | New | 3-card mini-grid |
| `src/app/shop/uitblinker/page.tsx` | New | Uitblinker landing |
| `src/app/shop/uitblinker/aanmelden/page.tsx` | New | "Binnenkort beschikbaar" placeholder |
| `src/components/shop/uitblinker-feature-grid.tsx` | New | 3-feature grid for the landing page |
| `src/app/word-lid/page.tsx` | New | Lifted from current Abonnementen — 3 tiers + features list + trial CTA |
| `src/components/nav/nav.tsx` | Modify | Add "Word lid" link in nav (or move existing CTA) |
| `src/messages/nl-NL.json` | Modify | New i18n keys for shop, book detail, uitblinker, word-lid |
| `src/messages/nl-BE.json` | Modify | Overrides only if needed |
| `tests/e2e/shop.spec.ts` | Modify | Update for the new 24-book grid + filter + detail page |

---

## Phase 0 — Pure helpers (TDD)

### Task 1: `markdown.ts` — minimal renderer

**Files:** `src/lib/markdown.ts`, `src/lib/markdown.test.ts`

- [ ] **Step 1: Tests**

```ts
import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders a paragraph", () => {
    const out = renderMarkdown("Hallo wereld.");
    expect(out).toEqual([{ kind: "p", text: "Hallo wereld." }]);
  });

  it("renders multiple paragraphs split by blank line", () => {
    const out = renderMarkdown("Een.\n\nTwee.");
    expect(out).toEqual([
      { kind: "p", text: "Een." },
      { kind: "p", text: "Twee." },
    ]);
  });

  it("renders a bullet list", () => {
    const out = renderMarkdown("- één\n- twee\n- drie");
    expect(out).toEqual([
      { kind: "ul", items: ["één", "twee", "drie"] },
    ]);
  });

  it("mixes paragraphs and lists", () => {
    const out = renderMarkdown("Para.\n\n- a\n- b\n\nAnder.");
    expect(out).toEqual([
      { kind: "p", text: "Para." },
      { kind: "ul", items: ["a", "b"] },
      { kind: "p", text: "Ander." },
    ]);
  });
});
```

- [ ] **Step 2: Implement**

```ts
// src/lib/markdown.ts
export type Block =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

export function renderMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  const chunks = source.trim().split(/\n\s*\n+/);
  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0 && lines.every((l) => l.startsWith("- "))) {
      blocks.push({ kind: "ul", items: lines.map((l) => l.slice(2).trim()) });
    } else {
      blocks.push({ kind: "p", text: lines.join(" ") });
    }
  }
  return blocks;
}
```

- [ ] **Step 3: Run + commit**

```bash
npx vitest run src/lib/markdown.test.ts
git add src/lib/markdown.ts src/lib/markdown.test.ts
git commit -m "feat(shop): minimal markdown renderer for book descriptions"
```

---

### Task 2: `shop-filter.ts` — pure filter

**Files:** `src/lib/shop-filter.ts`, `src/lib/shop-filter.test.ts`

- [ ] **Step 1: Tests**

```ts
import { describe, it, expect } from "vitest";
import { applyShopFilters } from "./shop-filter";

type WB = { subject: "REKENEN" | "TAAL" | "LEZEN"; groepBucket: string; id: string };
const sample: WB[] = [
  { id: "1", subject: "TAAL", groepBucket: "1" },
  { id: "2", subject: "TAAL", groepBucket: "5" },
  { id: "3", subject: "REKENEN", groepBucket: "5" },
  { id: "4", subject: "LEZEN", groepBucket: "8" },
];

describe("applyShopFilters", () => {
  it("returns everything when filters are 'all'", () => {
    expect(applyShopFilters(sample, { subject: "all", groep: "all" })).toHaveLength(4);
  });
  it("filters by subject", () => {
    const r = applyShopFilters(sample, { subject: "TAAL", groep: "all" });
    expect(r.map((w) => w.id)).toEqual(["1", "2"]);
  });
  it("filters by groep", () => {
    const r = applyShopFilters(sample, { subject: "all", groep: "5" });
    expect(r.map((w) => w.id).sort()).toEqual(["2", "3"]);
  });
  it("filters by both", () => {
    expect(applyShopFilters(sample, { subject: "REKENEN", groep: "5" })).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Implement + commit**

---

## Phase 1 — Schema + reseed

### Task 3: Enrich `WorkbookSku` + add `UitblinkerSubscription`

**Files:** `prisma/schema.prisma`

- [ ] **Step 1: Edit schema**

Add to `WorkbookSku`:
```prisma
  slug          String   @unique
  description   String
  pages         Int      @default(64)
  isbn          String?  @unique
  coverImageUrl String?
  highlights    Json     @default("[]")
```

Add new model:
```prisma
model UitblinkerSubscription {
  id               String   @id @default(cuid())
  householdId      String
  household        Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  kidId            String    @unique
  kid              Kid       @relation(fields: [kidId], references: [id], onDelete: Cascade)
  subject          Subject
  startedAt        DateTime  @default(now())
  pausedAt         DateTime?
  stripePriceId    String?
  stripeSubId      String?
  shippingName     String
  shippingLine1    String
  shippingPostcode String
  shippingCity     String

  @@index([householdId])
}
```

Inverse relations:
- `Household` gets `uitblinkers UitblinkerSubscription[]`
- `Kid` gets `uitblinker UitblinkerSubscription?`

- [ ] **Step 2: Push + generate**

```bash
npx prisma db push
npx prisma generate
```

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(shop): enrich WorkbookSku + add UitblinkerSubscription model"
```

---

### Task 4: Rewrite seed to produce 24 workbooks

**Files:** `prisma/seed.ts`

- [ ] **Step 1: Find existing seedShopCatalogue (or equivalent)**

Replace its workbook section with a generated loop:

```ts
const SUBJECTS = [
  { key: "TAAL",    label: "Taal",              symbol: "A",  tint: "bg-primary-soft" },
  { key: "REKENEN", label: "Rekenen",           symbol: "∑",  tint: "bg-teal-soft" },
  { key: "LEZEN",   label: "Begrijpend Lezen",  symbol: "B",  tint: "bg-sun-soft" },
] as const;

const HIGHLIGHTS = [
  "64 pagina's oefenstof",
  "Uitlegvideo's via QR-code bij elke opgave",
  "Past bij Cito, IEP en ROUTE 8",
  "Ontwikkeld door ervaren leerkrachten",
];

function descriptionFor(label: string, n: number): string {
  return `Dit werkboek is ontwikkeld voor leerlingen in groep ${n} en sluit aan op het reguliere basisschoolprogramma. Met heldere oefeningen, korte uitleg en stap-voor-stap voorbeelden bouwt je kind zelfvertrouwen op in ${label.toLowerCase()}.

Het boek behandelt de belangrijkste onderwerpen voor groep ${n}. Elke opgave heeft een QR-code naar een korte uitlegvideo, zodat een vastgelopen oefening nooit een blokkade wordt.

Geschikt voor zelfstandig oefenen na schooltijd of als aanvulling op huiswerk. Past bij de Cito-, IEP- en ROUTE 8-toetsen.`;
}

await tx.workbookSku.deleteMany({});
for (const s of SUBJECTS) {
  for (let n = 1; n <= 8; n++) {
    const slug = `${s.key.toLowerCase()}-groep-${n}`;
    await tx.workbookSku.create({
      data: {
        slug,
        title: `${s.label} groep ${n}`,
        subject: s.key,
        groepBucket: String(n),
        priceCents: 1695,
        coverSymbol: s.symbol,
        tint: s.tint,
        description: descriptionFor(s.label, n),
        pages: 64,
        isbn: `9789493${String(218833 + n + (s.key === "TAAL" ? 0 : s.key === "REKENEN" ? 100 : 200)).padStart(6, "0")}`,
        highlights: HIGHLIGHTS,
      },
    });
  }
}
```

- [ ] **Step 2: Run seed**

```bash
npm run db:seed
```

Expected output: confirms 24 workbooks created.

- [ ] **Step 3: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat(shop): seed 24 workbooks (3 subjects × 8 groeps)"
```

---

## Phase 2 — Shop index redesign

### Task 5: `uitblinker.ts` constants + `UitblinkerHero` component

**Files:**
- `src/lib/uitblinker.ts` (new)
- `src/components/shop/uitblinker-hero.tsx` (new)

- [ ] **Step 1: Constants**

```ts
// src/lib/uitblinker.ts
export const UITBLINKER_PRICE_CENTS = 1995;
export const UITBLINKER_INTERVAL_LABEL = "Per maand, opzegbaar";
```

- [ ] **Step 2: Hero component**

```tsx
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { centsToEuro } from "@/lib/mappings";
import { UITBLINKER_PRICE_CENTS } from "@/lib/uitblinker";

export function UitblinkerHero() {
  return (
    <Link
      href="/shop/uitblinker"
      className="relative block overflow-hidden rounded-lexi-lg border border-primary/30 bg-gradient-to-br from-primary-soft via-sun-soft to-card p-8 shadow-lexi transition hover:-translate-y-0.5 md:p-12"
    >
      <div className="flex items-start gap-3">
        <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary-ink">
          Uitblinker
        </p>
      </div>
      <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
        Elke maand een werkboek op maat in je brievenbus.
      </h2>
      <p className="mt-3 max-w-prose text-ink-2 md:text-lg">
        Lexi volgt wat je kind kan én nog moet oefenen, en maakt elke maand een uniek werkboek op papier.
        Vanaf <strong>{centsToEuro(UITBLINKER_PRICE_CENTS)}</strong>/maand — opzegbaar.
      </p>
      <span className="mt-6 inline-flex items-center gap-2 rounded-lexi bg-ink px-5 py-2.5 text-sm font-semibold text-white">
        Hoe werkt het? <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/uitblinker.ts src/components/shop/uitblinker-hero.tsx
git commit -m "feat(shop): Uitblinker hero card + constants"
```

---

### Task 6: Functional filter bar (client state + URL sync)

**Files:** `src/components/shop/filter-bar.tsx`

- [ ] **Step 1: Convert to controlled client component**

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const SUBJECTS = [
  { value: "all",     label: "Alle onderwerpen" },
  { value: "taal",    label: "Taal" },
  { value: "rekenen", label: "Rekenen" },
  { value: "lezen",   label: "Begrijpend Lezen" },
];
const GROEPS = ["all", "1", "2", "3", "4", "5", "6", "7", "8"];

export function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const subject = params.get("subject") ?? "all";
  const groep = params.get("groep") ?? "all";

  function update(key: "subject" | "groep", value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop");
  }

  return (
    <div className="space-y-3">
      {/* Subject pills */}
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">Onderwerp</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <li key={s.value}>
              <button
                type="button"
                onClick={() => update("subject", s.value)}
                className={`rounded-full border px-3 py-1 text-sm font-medium ${
                  subject === s.value
                    ? "border-primary bg-primary-soft text-primary-ink"
                    : "border-line bg-card text-ink-2 hover:bg-bg-2"
                }`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Groep pills */}
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">Groep</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {GROEPS.map((g) => (
            <li key={g}>
              <button
                type="button"
                onClick={() => update("groep", g)}
                className={`rounded-full border px-3 py-1 text-sm font-medium ${
                  groep === g
                    ? "border-primary bg-primary-soft text-primary-ink"
                    : "border-line bg-card text-ink-2 hover:bg-bg-2"
                }`}
              >
                {g === "all" ? "Alle groepen" : g}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shop/filter-bar.tsx
git commit -m "feat(shop): functional filter bar with URL state"
```

---

### Task 7: Update workbook card to link to detail page

**Files:** `src/components/shop/workbook-card.tsx`

- [ ] **Step 1: Edit**

Wrap the card in a Next `<Link href={`/shop/boek/${slug}`}>`. Replace the bare button with a styled link-as-button. Show a tiny highlights count chip if present (Lucide `Check` + "{n} kenmerken").

Accept `slug` as a prop; thread through from the grid.

- [ ] **Step 2: Commit**

---

### Task 8: Shop index page redesign

**Files:** `src/app/shop/page.tsx`, `src/components/shop/werkboeken-grid.tsx`

- [ ] **Step 1: Apply filter to query**

In `ShopPage` read `searchParams` props:
```tsx
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; groep?: string }>;
}) {
  const params = await searchParams;
  const filters = {
    subject: (params.subject ?? "all").toLowerCase(),
    groep: params.groep ?? "all",
  };
  // ...
}
```

Use `applyShopFilters` after the DB query (DB returns all 24; filter in code so URL changes don't require a refetch on the same params via cache).

- [ ] **Step 2: New page layout**

```tsx
return (
  <>
    <ShopHeader />
    <main id="main-content" className="mx-auto max-w-[1200px] space-y-10 px-5 py-10">
      <ShopHeading />
      <FilterBar />
      <UitblinkerHero />
      <WerkboekenGrid workbooks={filteredUi} />
      <p className="text-center text-sm text-ink-2">
        Op zoek naar de Lexi-app? <Link href="/word-lid" className="underline">Word lid →</Link>
      </p>
    </main>
    <CartPill />
  </>
);
```

Remove the `<AbonnementenSection>` and `<BundlesSection>` imports + JSX from this file.

- [ ] **Step 3: Grid handles empty state**

In `werkboeken-grid.tsx`:
```tsx
{workbooks.length === 0 && (
  <p className="mt-4 rounded-lexi border border-line bg-card p-6 text-center text-ink-2">
    Geen werkboeken gevonden voor deze filter.
  </p>
)}
```

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add src/app/shop/page.tsx src/components/shop/werkboeken-grid.tsx
git commit -m "feat(shop): refocus index on books + Uitblinker hero; abonnementen moved to /word-lid"
```

---

## Phase 3 — Per-book detail page

### Task 9: `/shop/boek/[slug]/page.tsx` + `<BookDetail>` + `<RelatedBooks>`

**Files:**
- `src/app/shop/boek/[slug]/page.tsx` (new)
- `src/components/shop/book-detail.tsx` (new)
- `src/components/shop/book-highlights.tsx` (new)
- `src/components/shop/related-books.tsx` (new)

- [ ] **Step 1: The route**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { BookDetail } from "@/components/shop/book-detail";
import { RelatedBooks } from "@/components/shop/related-books";
import { ShopHeader } from "@/components/shop/shop-header";
import type { DbWorkbookSku } from "@/lib/db-types";
import { centsToEuro, subjectToUi } from "@/lib/mappings";

export const dynamic = "force-dynamic";

export default async function BookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = (await db.workbookSku.findUnique({ where: { slug } })) as DbWorkbookSku | null;
  if (!book) notFound();

  const related = (await db.workbookSku.findMany({
    where: { groepBucket: book.groepBucket, slug: { not: book.slug }, active: true },
    take: 3,
  })) as DbWorkbookSku[];

  return (
    <>
      <ShopHeader />
      <main id="main-content" className="mx-auto max-w-[1100px] px-5 py-10">
        <nav className="mb-6 font-mono text-xs uppercase tracking-wider text-ink-2">
          <Link href="/shop" className="hover:text-ink">Shop</Link>
          <span> / Werkboek / {book.title}</span>
        </nav>
        <BookDetail book={book} />
        <RelatedBooks books={related} />
      </main>
    </>
  );
}
```

- [ ] **Step 2: `BookDetail` component**

Renders the spec layout: cover left (tint+symbol or coverImageUrl when present), right-side meta (title, price, highlights, "In winkelmandje" button placeholder), then below the description (rendered via `renderMarkdown`), then specs table, then `<RelatedBooks>` is rendered by the parent.

`highlights` is `Json` — cast to `string[]` and render via `<BookHighlights>`.

- [ ] **Step 3: `BookHighlights`**

Lucide `Check` prefix + text per item. Compact, no fancy decoration.

- [ ] **Step 4: `RelatedBooks`**

Renders 3 `<WorkbookCard>` in a small grid. Heading: "Andere boeken voor groep {N}".

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src/app/shop/boek src/components/shop/book-detail.tsx src/components/shop/book-highlights.tsx src/components/shop/related-books.tsx
git commit -m "feat(shop): per-book detail page with rich description + specs + related"
```

---

## Phase 4 — Uitblinker landing

### Task 10: `/shop/uitblinker/page.tsx` + feature grid + aanmelden placeholder

**Files:**
- `src/app/shop/uitblinker/page.tsx` (new)
- `src/app/shop/uitblinker/aanmelden/page.tsx` (new placeholder)
- `src/components/shop/uitblinker-feature-grid.tsx` (new)

- [ ] **Step 1: Landing page**

Structure per spec §3. Hero (mascot + headline + CTA), "Hoe werkt het?" (3-step list), feature grid (3 features: Adaptief / Cadeau-gevoel / Opzegbaar), "Wat ontvang je?" (illustration + bullets), FAQ accordion (3-5 items hardcoded), bottom CTA. Mascot via `<MascotImage style="bot" age="hero" />`.

- [ ] **Step 2: Aanmelden placeholder**

Simple `"use server"` page with "Binnenkort beschikbaar" message, link back to `/shop/uitblinker`.

- [ ] **Step 3: Feature grid**

3-column responsive grid, each with Lucide icon (`Sparkles`, `Gift`, `XCircle`) + heading + 1-paragraph body.

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add src/app/shop/uitblinker src/components/shop/uitblinker-feature-grid.tsx
git commit -m "feat(shop): Uitblinker landing page + aanmelden placeholder"
```

---

## Phase 5 — `/word-lid` + nav

### Task 11: `/word-lid` page

**Files:** `src/app/word-lid/page.tsx`

- [ ] **Step 1: Server component**

Read SubscriptionSku rows from DB. Render 3 tier cards (lift the existing `<AbonnementenSection>` markup or rewrite cleaner). Add a feature-list section ("Wat is inbegrepen?"). CTA "Start 14 dagen gratis" → `/signup`.

Re-use `<Nav>` and `<Footer>` from existing landing.

- [ ] **Step 2: Commit**

```bash
git add src/app/word-lid/page.tsx
git commit -m "feat(shop): /word-lid page for digital subscriptions"
```

---

### Task 12: Update nav

**Files:** `src/components/nav/nav.tsx`

- [ ] **Step 1: Wire "Word lid"**

Existing nav already has links — find where to add or modify. Per the spec: nav's "Probeer 14 dagen gratis" CTA on the landing stays on `/signup`; in-nav add a new "Word lid" link pointing at `/word-lid`. Where it fits:
```tsx
const links = [
  // ...
  { label: t("wordLid"), href: "/word-lid" },
  { label: t("shop"),    href: "/shop" },
  // ...
];
```

- [ ] **Step 2: i18n key**

Add `nav.wordLid: "Word lid"` to `src/messages/nl-NL.json`.

- [ ] **Step 3: Commit**

```bash
git add src/components/nav/nav.tsx src/messages/nl-NL.json
git commit -m "feat(nav): add /word-lid link"
```

---

## Phase 6 — Tests

### Task 13: E2E updates

**Files:** `tests/e2e/shop.spec.ts`

- [ ] **Step 1: Update existing tests + add new**

```ts
test("/shop shows 24 workbooks + Uitblinker hero", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.locator("text=Uitblinker")).toBeVisible();
  await expect(page.locator("[data-test='workbook-card']")).toHaveCount(24);
});

test("filtering by ?subject=taal shows 8 workbooks", async ({ page }) => {
  await page.goto("/shop?subject=taal");
  await expect(page.locator("[data-test='workbook-card']")).toHaveCount(8);
});

test("/shop/boek/taal-groep-3 renders detail page", async ({ page }) => {
  await page.goto("/shop/boek/taal-groep-3");
  await expect(page.locator("h1")).toContainText("Taal groep 3");
  await expect(page.locator("text=Specificaties")).toBeVisible();
});

test("/shop/uitblinker loads", async ({ page }) => {
  await page.goto("/shop/uitblinker");
  await expect(page.locator("text=Elke maand een werkboek op maat")).toBeVisible();
});

test("/word-lid shows 3 tier cards", async ({ page }) => {
  await page.goto("/word-lid");
  await expect(page.locator("[data-test='tier-card']")).toHaveCount(3);
});
```

(Workbook card needs `data-test='workbook-card'` attribute added; tier card likewise.)

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/shop.spec.ts src/components/shop/workbook-card.tsx
git commit -m "test(shop): E2E for new shop layout + book detail + /word-lid"
```

---

## Self-review

- **Spec DoD coverage:**
  - 24-workbook grid + Uitblinker hero + /word-lid footer link: T8, T5, T11 ✓
  - Functional filters: T6, T8 ✓
  - Per-book detail page: T9 ✓
  - /shop/uitblinker: T10 ✓
  - /word-lid: T11 ✓
  - Nav update: T12 ✓
  - Schema enrichments: T3 ✓
  - Reseed 24 books: T4 ✓
- **Open concerns:**
  - Cart-pill remains visual-only (no Stripe yet — flagged in spec).
  - `/shop/uitblinker/aanmelden` is a placeholder.
  - Book covers are tint+symbol placeholders.
  - i18n keys (T12 only adds `nav.wordLid`); other Dutch strings in new pages are inline (could be lifted to i18n later for the BE override).

---

**13 tasks. Estimated implementation: ~5-7 hours.**
