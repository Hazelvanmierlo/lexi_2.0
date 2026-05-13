# Lexi.kids — Shop Book Focus + Uitblinker

**Date:** 2026-05-13
**Status:** Approved design, ready for implementation
**Reference:** [junioreinstein.nl](https://webshop.junioreinstein.nl/) — Dutch educational publisher with strong product-detail-page pattern

---

## Context

Today's shop has three top-level sections (Abonnementen, Bundels, Werkboeken) all on one page. The 15 workbook SKUs lack real covers (just tint+symbol), filters don't work (no client state), and there's no per-book detail page or pedagogical context. Comparison with junioreinstein.nl exposes the gap: their product cards show selling-bullets and link to rich detail pages with description, content breakdown, and social proof.

**This spec refocuses the shop on books.** Two product lines:

1. **Werkboeken** — one-off purchase. 24 books total: Taal × groep 1-8, Rekenen × groep 1-8, Begrijpend Lezen × groep 1-8.
2. **Uitblinker** — monthly subscription. Each month a kid receives a **physical workbook on demand**, adapted to their answers in the Lexi app.

Digital subscriptions (the existing MONTHLY/YEARLY/FAMILY tiers giving Lexi-app access) move to a separate `/word-lid` page. They remain part of the product, just out of the book shop.

---

## §1 — Goals & success criteria

### What ships

1. **Shop index page** (`/shop`) — book-focused: 24-workbook grid with working filters (subject × groep), Uitblinker hero card, optional bundles section (de-emphasized).
2. **Per-book detail page** (`/shop/boek/[slug]`) — junioreinstein-style layout: cover, price, expandable description, pedagogical highlights, "Voor wie", specs (ISBN, pagina's, groep), add-to-cart CTA, related books.
3. **Uitblinker landing page** (`/shop/uitblinker`) — explains the concept, monthly delivery, adaptive-on-answers, sign-up CTA per kid.
4. **`/word-lid` page** — the existing Abonnementen content extracted: 3 tiers + trial CTA.
5. **Nav update** — nav's "Word lid" link points at `/word-lid`; shop link unchanged.
6. **Schema enrichments** — `WorkbookSku` gains `slug`, `description`, `pages`, `isbn`, `highlights`, `coverImageUrl`. New `UitblinkerSubscription` model.
7. **Reseed** — 24 workbook SKUs (replacing the existing 15) with placeholder Dutch description copy ready for the content team to refine.

### Definition of done

| # | Statement |
|---|---|
| 1 | `/shop` shows the 24 workbooks in a grid plus a prominent Uitblinker hero card and an "Of word lid" footer-link to `/word-lid`. |
| 2 | The shop's subject + groep filters actually filter the visible workbooks (client-side state). |
| 3 | Tapping a workbook card navigates to `/shop/boek/[slug]` where the kid + parent see a rich detail page modeled on the junioreinstein pattern. |
| 4 | `/shop/uitblinker` describes the product and has an "Aanmelden" CTA per kid (links to a future `/shop/uitblinker/aanmelden` flow — placeholder for v1). |
| 5 | `/word-lid` shows the 3 digital tiers and has a "Start gratis proefperiode" CTA pointing at `/signup`. |
| 6 | Nav-bar "Word lid" link points at `/word-lid`. The on-page CTA "Probeer 14 dagen gratis" on `/` still points at `/signup`. |
| 7 | Existing seed-quiz + auth + admin flows continue to work — only Shop pages and SubscriptionSku/UitblinkerSubscription/WorkbookSku schema are touched. |

### Out of scope (deferred specs)

- **Actual cart + Stripe checkout** — flagged in the Stripe spec (separate).
- **Uitblinker book generation** — adaptive logic that picks topics + prints a unique book per kid per month. Big spec. v1 only ships the storefront + signup CTA; fulfillment doesn't exist yet.
- **Book covers as real images** — placeholder design (tint + symbol) stays for v1; design team supplies real covers later. `coverImageUrl` field is added so it's a content swap, not a code change.
- **Reviews / star ratings.**
- **Search.**

---

## §2 — Data model

### `WorkbookSku` (modify — enrich existing)

```prisma
model WorkbookSku {
  id            String   @id @default(cuid())
  slug          String   @unique          // NEW — URL-safe id, e.g. "taal-groep-3"
  title         String
  subject       Subject
  groepBucket   String                    // existing — keep "1" through "8" (was buckets like "1-2"; this spec moves to single-groep)
  priceCents    Int
  stripePriceId String?  @unique
  coverSymbol   String
  tint          String
  // NEW fields:
  description   String   @db.Text         // markdown body for the detail page
  pages         Int      @default(64)
  isbn          String?  @unique
  coverImageUrl String?                   // optional — null falls back to symbol+tint render
  highlights    Json     @default("[]")   // string[] — 3-5 selling bullets
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())

  @@index([groepBucket, subject])
  @@index([subject, groepBucket])
}
```

**Migration plan:** Drop existing 15 SKUs, reseed 24 with the new shape. No live data to preserve (pre-launch).

**`groepBucket` semantics change:** today the field is `"1-2"`, `"3-4"`, etc. After this spec it's a single digit `"1"`, `"2"`, ..., `"8"`. We rename the column conceptually but keep the field name to minimize churn — value space changes only.

### `UitblinkerSubscription` (new)

```prisma
model UitblinkerSubscription {
  id            String   @id @default(cuid())
  householdId   String
  household     Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  kidId         String   @unique          // one Uitblinker per kid
  kid           Kid       @relation(fields: [kidId], references: [id], onDelete: Cascade)
  subject       Subject                    // primary focus (kid can change later)
  startedAt     DateTime  @default(now())
  pausedAt      DateTime?
  stripePriceId String?                    // populated when Stripe wired
  stripeSubId   String?                    // active subscription id in Stripe
  shippingName  String                     // delivery address — captured at signup
  shippingLine1 String
  shippingPostcode String
  shippingCity  String

  @@index([householdId])
}
```

**Note:** the shipping fields live here, not on `Household`, because Uitblinker is per-kid (different kids can ship to different grandparents, e.g.). Per-Household shared address is a future polish.

### Constants in code (no DB table needed for v1)

`src/lib/uitblinker.ts`:
```ts
export const UITBLINKER_PRICE_CENTS = 1995;    // € 19,95 / maand
export const UITBLINKER_INTERVAL = "Per maand, opzegbaar";
```

When Stripe wires up, we add a `UitblinkerSku` table or reuse `SubscriptionSku` with a new `Tier.UITBLINKER` enum. Out of scope here.

---

## §3 — Page structure

### `/shop` — book grid + Uitblinker hero

```
┌─────────────────────────────────────────────────────────────┐
│  Lexi.kids breadcrumb  /  Shop                              │
├─────────────────────────────────────────────────────────────┤
│  H1: De Lexi-boekenshop                                     │
│  Lead: Werkboeken voor groep 1 t/m 8 + Uitblinker op maat   │
├─────────────────────────────────────────────────────────────┤
│  Filterbar:  [Onderwerp v]  [Groep v]                       │
├─────────────────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║  UITBLINKER HERO CARD                                 ║  │
│  ║  Elke maand een werkboek op maat                      ║  │
│  ║  → CTA "Hoe werkt het?" → /shop/uitblinker           ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
├─────────────────────────────────────────────────────────────┤
│  H2: Werkboeken                                             │
│  Grid (4 cols desktop, 2 cols mobile):                      │
│    [Taal G1] [Taal G2] [Taal G3] [Taal G4]                  │
│    [Taal G5] [Taal G6] [Taal G7] [Taal G8]                  │
│    [Rekenen G1] [Rekenen G2] ...                            │
│    [Begrijpend Lezen G1] ...                                │
├─────────────────────────────────────────────────────────────┤
│  Soft footer: "Op zoek naar de Lexi-app? → Word lid"        │
└─────────────────────────────────────────────────────────────┘
```

**Filter behaviour:** client-side state. Selecting `Taal` + `Groep 5` shows only 1 card (Taal-G5). Selecting "Alle" on either axis shows everything in that axis. Filters persist in URL as `?subject=taal&groep=5` so cards are linkable.

### `/shop/boek/[slug]` — per-book detail page

```
┌─────────────────────────────────────────────────────────────┐
│  Lexi.kids  /  Shop  /  Werkboeken  /  Taal groep 3         │
├──────────────────────────────────┬──────────────────────────┤
│                                  │                          │
│  ┌─────────────────────────┐    │  H1: Taal groep 3        │
│  │                         │    │  Subject + groep chip    │
│  │   COVER (tint + sym)    │    │                          │
│  │                         │    │  € 16,95                 │
│  │                         │    │  [In winkelmandje]       │
│  │                         │    │  Bezorging: gratis vanaf │
│  │                         │    │     € 25                 │
│  └─────────────────────────┘    │                          │
│                                  │  Highlights:             │
│                                  │  ✓ 64 pagina's oefenstof │
│                                  │  ✓ Begeleidende uitleg-  │
│                                  │     video's via QR-code  │
│                                  │  ✓ Geschreven door       │
│                                  │     ervaren docenten     │
│                                  │  ✓ Past bij Cito en IEP  │
│                                  │                          │
├──────────────────────────────────┴──────────────────────────┤
│                                                             │
│  H2: Over dit boek                                          │
│  {description — markdown rendered: paragraphs, lists, etc.} │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  H2: Voor wie is dit boek?                                  │
│  Groep 3 (6-7 jaar) — kinderen die ...                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  H2: Specificaties                                          │
│  ├ Onderwerp:   Taal                                        │
│  ├ Groep:       3                                           │
│  ├ Pagina's:    64                                          │
│  └ ISBN:        9789493...                                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  H2: Andere boeken voor groep 3                             │
│  Grid: 3 cards (Rekenen G3, Begrijpend Lezen G3, Taal G4)   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Rendering:** server component. `description` field is markdown; render via a small inline renderer (no new dep needed — split on `\n\n` for paragraphs and `\n- ` for bullets). Skip headings inside description; the page itself supplies the structure.

**Related books rule:** 3 books with the same groep, excluding the current one. If groep has < 4 books total, fall back to same subject across grades.

### `/shop/uitblinker` — landing page

```
┌─────────────────────────────────────────────────────────────┐
│  Hero: "Een werkboek op maat. Elke maand in je brievenbus." │
│  Mascot illustration + CTA "Aanmelden vanaf € 19,95/maand"  │
├─────────────────────────────────────────────────────────────┤
│  H2: Hoe werkt het?                                         │
│   1. Kies een onderwerp (Taal / Rekenen / Begrijpend Lezen) │
│   2. Lexi volgt wat je kind kan en nog moet oefenen         │
│   3. Elke maand krijgt je kind een uniek werkboek per post  │
├─────────────────────────────────────────────────────────────┤
│  H2: Waarom Uitblinker?                                     │
│  3-column features:                                         │
│   ├ "Adaptief"  — past zich aan op de antwoorden van je kind│
│   ├ "Cadeau-gevoel" — papier, niet alweer een scherm        │
│   └ "Opzegbaar"  — maand-op-maand, geen contract           │
├─────────────────────────────────────────────────────────────┤
│  H2: Wat ontvang je?                                        │
│  Mock spread or illustration of an Uitblinker boekje        │
│  Bulletjes: kleur, ~32 pag, materiaal, etc.                 │
├─────────────────────────────────────────────────────────────┤
│  H2: Veelgestelde vragen                                    │
│  (3-5 expandable rows)                                      │
├─────────────────────────────────────────────────────────────┤
│  Bottom CTA: "Aanmelden →" → /shop/uitblinker/aanmelden     │
│  (placeholder route for v1; signup wizard is a future spec) │
└─────────────────────────────────────────────────────────────┘
```

The Aanmelden route shows a "Binnenkort beschikbaar" placeholder for v1.

### `/word-lid` — digital tiers

Lifted from the current `<AbonnementenSection>`:

```
┌─────────────────────────────────────────────────────────────┐
│  H1: Word lid van Lexi                                      │
│  Lead: Toegang tot de adaptieve oefenapp voor groep 1-8     │
├─────────────────────────────────────────────────────────────┤
│  [Maandelijks card]  [Jaarlijks card]  [Familie card]      │
│  Each shows: badge, name, price, interval, body, CTA        │
├─────────────────────────────────────────────────────────────┤
│  H2: Wat is inbegrepen?                                     │
│  ✓ Adaptieve quizzen voor alle onderwerpen                  │
│  ✓ Voortgang per kind                                       │
│  ✓ Ouder-dashboard                                          │
│  ✓ Geen advertenties, kid-veilig                            │
├─────────────────────────────────────────────────────────────┤
│  CTA: "Start 14 dagen gratis" → /signup                     │
└─────────────────────────────────────────────────────────────┘
```

---

## §4 — Seed content (24 workbooks)

3 subjects × 8 groeps = 24 SKUs. Generic Dutch placeholder copy ready for content team to refine.

**Title pattern:** `"{Subject} groep {N}"` → "Taal groep 3", "Rekenen groep 7".

**Slug pattern:** `"{subject}-groep-{n}"` lowercase → "taal-groep-3", "rekenen-groep-7".

**Price:** € 16,95 for all v1 SKUs. Refine later by complexity / page count.

**Description template (per book, ~150 words):**
> Dit werkboek is ontwikkeld voor leerlingen in groep {N} en sluit aan op het reguliere basisschoolprogramma. Met heldere oefeningen, korte uitleg en stap-voor-stap voorbeelden bouwt je kind zelfvertrouwen op in {subject_label_lowercase}.
>
> Het boek behandelt onder andere {subject_topics}. Elke opgave heeft een QR-code naar een korte uitlegvideo, zodat een vastgelopen oefening nooit een blokkade wordt.
>
> Geschikt voor zelfstandig oefenen na schooltijd of als aanvulling op huiswerk. Past bij de Cito-, IEP- en ROUTE 8-toetsen.

**Highlights template (4 bullets per book):**
- `"64 pagina's oefenstof"`
- `"Uitlegvideo's via QR-code bij elke opgave"`
- `"Past bij Cito, IEP en ROUTE 8"`
- `"Ontwikkeld door ervaren leerkrachten"`

**Symbol per subject:** Taal → `"A"`, Rekenen → `"∑"`, Begrijpend Lezen → `"B"`. Tints alternate by groep within subject so the grid has visual rhythm.

**ISBN:** synthetic for v1: `9789493${pad6Digits}`. Real ISBNs come from print partner later.

---

## §5 — Testing strategy

**Unit (Vitest):**
- `src/lib/markdown.test.ts` — the small markdown renderer (paragraphs + lists)
- `src/lib/shop-filter.test.ts` — filter logic (subject × groep)

**E2E (Playwright):**
- `/shop` loads with 24 workbooks
- Filtering by `?subject=taal` shows 8 workbooks (one per groep)
- Filtering by `?subject=rekenen&groep=3` shows 1 workbook
- `/shop/boek/taal-groep-3` renders the detail page with highlights + description
- `/shop/uitblinker` loads and CTA links to the placeholder aanmelden route
- `/word-lid` shows 3 tier cards + signup CTA

---

## §6 — Rollout

Single-PR shipable. All schema changes are additive (new columns, new table). Existing seed data is replaced.

**Pre-deploy:**
1. Schema change + `npx prisma db push` against Supabase
2. Reseed via `npm run db:seed` (script rewritten to produce 24 workbooks)
3. Shop redesign + new pages live behind the existing routes (no flag needed — pages don't exist yet so the change is purely additive)

**Rollback:** revert the branch; the old shop is gone but the new pages are too — no harm to existing users (no live shop today).

---

## Open items / known tensions

1. **`groepBucket` field name** is misleading after this spec (values become single digits). Keep the name for now; rename in a separate refactor when convenient.
2. **No actual checkout flow.** "In winkelmandje" buttons are visual-only in v1. The cart-pill from the current shop renders but doesn't persist anything. Stripe spec covers this.
3. **No real book covers.** Tint+symbol fallback; design team supplies real covers later via `coverImageUrl`.
4. **Uitblinker fulfillment** is intentionally absent. The storefront markets the product; actual book generation + print + ship is a multi-week spec on its own.
5. **`/shop/uitblinker/aanmelden` is a placeholder route.** Real Uitblinker subscription creation needs Stripe wired and the print partner integration. Placeholder shows "Binnenkort beschikbaar".
6. **Markdown renderer is minimal** (paragraphs + bullets). If content team wants links, bold, or richer formatting, swap to `react-markdown` (~30kb dep). Defer until content team complains.
