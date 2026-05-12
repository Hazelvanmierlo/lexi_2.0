# Lexi.kids — Design Handoff for Production

> **Hand this folder to Claude Code (or any developer).** It contains the full HTML design references, a Claude-Code-ready prompt (`CLAUDE.md`), and this README that tells the developer exactly what to build.

---

## 0. About the design files in this bundle

The files under `design/` are **design references created in HTML/JSX**. They are **prototypes**, not production code. Their purpose is to communicate:

- the visual language (colors, type, spacing, motion)
- the information architecture and page composition
- the interaction patterns and screen flows
- the copy (Dutch, parent-facing)

**Your job is to recreate these designs in a real production stack** — using the conventions of the target codebase, real auth, a real database, real payments, real i18n. **Do not ship the HTML files as-is.** They are React components rendered in-browser via Babel — fine for design review, not for production.

---

## 1. What Lexi.kids is

A **Dutch/Belgian adaptive learning platform for children in groep 1 t/m 8** (NL) / leerjaar 1 t/m 6 (BE). Parent-facing brand. Kid-facing product. Direct competitor to Squla.

**Three audiences, three surfaces:**

| Audience | Surface | Goal |
|---|---|---|
| Parents (NL/BE) | Marketing site, signup, parent dashboard, shop | Convert. Show value. Sell subscriptions + workbooks. |
| Children (6–12) | Kid home, mini-games, quiz play | Engage. Make oefenen feel like spelen. |
| Admins / content team | Admin quiz editor | Author quizzes, assign game type per quiz. |

---

## 2. Fidelity

**High fidelity.** Colors, typography, spacing, copy, and interactions are final. Recreate pixel-perfectly using the codebase's existing libraries — but reproduce the visual outcome exactly. Where the bundled HTML uses inline styles, translate to the codebase's styling system (CSS modules / Tailwind / styled-components / etc.).

---

## 3. Recommended stack

If no codebase exists yet:

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS with custom tokens (mapped to the OKLCH values below) + CSS variables for theming
- **Components:** Headless primitives from Radix UI; build the rest from the JSX in `design/src/v3/`
- **State:** React Server Components for marketing pages; client components for interactive surfaces (kid game, parent dashboard, admin)
- **Auth:** Clerk or Auth.js — must support **household accounts** (1 paying parent, 1–4 kid sub-profiles)
- **DB:** Postgres + Prisma. Schema sketched in §10.
- **Payments:** Stripe Subscriptions (€11,95/mo, €119/yr, €19,95/mo gezinsabonnement) + Stripe Checkout for one-off shop items
- **i18n:** `next-intl` with `nl-NL` and `nl-BE` locales — region affects copy, curriculum framing (SEO vs ZILL), groep vs leerjaar terminology
- **Hosting:** Vercel
- **Analytics:** PostHog (events listed in §11)

---

## 4. Files in this bundle

```
design_handoff_lexi_kids/
├── README.md                        ← you are here
├── CLAUDE.md                        ← drop into the new repo root, run claude with this
└── design/
    ├── Lexi.kids v3.html            ← entry point — open this to see the live design
    └── src/
        ├── Lexi.jsx                 ← Lexi mascot (multiple visual styles)
        ├── Signup.jsx               ← signup flow
        ├── Dashboard.jsx            ← ouder dashboard
        ├── Question.jsx             ← single-question demo
        ├── Game.jsx                 ← legacy game shell (v2)
        └── v3/                      ← v3 — this is the canonical design
            ├── App.v3.jsx           ← root, routing, tweak state
            ├── Nav.v3.jsx           ← header + region picker (NL/BE)
            ├── Landing.v3.jsx       ← marketing homepage (10 sections)
            ├── Shop.v3.jsx          ← shop + werkboeken + bundles
            ├── KidHome.v3.jsx       ← kid account home
            ├── GameShell.v3.jsx     ← uitleg → 10 vragen → eindscherm
            ├── Games.v3.jsx         ← game type previews / index
            ├── GameQuestions.v3.jsx ← 5 game type implementations
            ├── AdminQuiz.v3.jsx     ← admin: author quizzes, pick game type
            └── Tweaks.v3.jsx        ← in-design tweak panel (skip in production)
```

> **Open `design/Lexi.kids v3.html` directly in a browser** to interact with the prototype. The Tweaks panel (bottom-right toggle) lets you switch hero variants, region, accent color, and Lexi style.

---

## 5. Routes / pages to build

Map the v3 route names to production URLs:

| v3 route | Production URL | Notes |
|---|---|---|
| `landing` | `/` | Marketing homepage. Public. |
| `signup` | `/signup` | Email + password + child name + groep. 14-day trial, no card. |
| `dashboard` | `/ouder` | Parent dashboard. Requires auth. |
| `kid` | `/kind` | Kid home. Requires kid sub-profile. |
| `kid-play` | `/kind/spelen/[quizId]` | Active quiz session. |
| `admin` | `/admin/quizzen` | Admin-only. Quiz authoring. |
| `shop` | `/shop` | Public catalog, auth required at checkout. |
| `question` | `/probeer` | Single-question demo for marketing. |

---

## 6. Design tokens

All colors are **OKLCH**. Map them to your system as CSS variables. From `Lexi.kids v3.html`:

```css
:root {
  /* Surfaces */
  --bg:        oklch(98% 0.012 85);     /* warm off-white */
  --bg-2:      oklch(96% 0.018 85);     /* slightly deeper */
  --card:      #ffffff;

  /* Ink (text) */
  --ink:       oklch(22% 0.025 260);    /* near-black, cool */
  --ink-2:     oklch(40% 0.02 260);     /* secondary */
  --ink-3:     oklch(60% 0.015 260);    /* tertiary / muted */

  /* Lines */
  --line:      oklch(90% 0.012 260);    /* default border */
  --line-2:    oklch(94% 0.01 260);     /* subtle divider */

  /* Brand — coral (default accent, swappable via Tweaks) */
  --primary:      oklch(66% 0.17 35);
  --primary-ink:  oklch(38% 0.15 35);
  --primary-soft: oklch(94% 0.04 35);

  /* Subject palette — used on werkboek covers, subject chips */
  --teal:      oklch(68% 0.12 185);  --teal-soft: oklch(94% 0.035 185);
  --sun:       oklch(85% 0.15 95);   --sun-soft:  oklch(96% 0.05 95);
  --plum:      oklch(55% 0.14 305);  --plum-soft: oklch(95% 0.03 305);
  --ok:        oklch(60% 0.14 155);  --ok-soft:   oklch(94% 0.04 155);

  /* Geometry */
  --radius:    14px;
  --radius-lg: 22px;

  /* Shadows — warm undertone */
  --shadow-sm: 0 1px 2px rgba(20,20,40,0.04), 0 1px 1px rgba(20,20,40,0.03);
  --shadow:    0 8px 28px -12px rgba(40,20,10,0.12), 0 2px 6px rgba(40,20,10,0.04);
  --shadow-lg: 0 30px 60px -30px rgba(40,20,10,0.22), 0 12px 20px -12px rgba(40,20,10,0.08);
}
```

**Accent variants** (Tweaks panel — let parents pick a theme later if you want, otherwise hardcode coral):

| Name | --primary | --primary-ink | --primary-soft |
|---|---|---|---|
| coral (default) | `oklch(66% 0.17 35)` | `oklch(38% 0.15 35)` | `oklch(94% 0.04 35)` |
| teal | `oklch(62% 0.15 185)` | `oklch(34% 0.12 185)` | `oklch(94% 0.035 185)` |
| plum | `oklch(55% 0.18 305)` | `oklch(35% 0.14 305)` | `oklch(95% 0.03 305)` |
| forest | `oklch(55% 0.14 145)` | `oklch(32% 0.12 145)` | `oklch(94% 0.04 145)` |

### Typography

| Role | Family | Weights used |
|---|---|---|
| Display / headings (`h1`–`h3`, `.display`) | **Bricolage Grotesque** | 600, 700, 800 |
| Body | **Geist** | 400, 500, 600, 700 |
| Mono (numbers, ids, prices in admin) | **JetBrains Mono** | 400, 500 |

Headings: `letter-spacing: -0.02em`, `text-wrap: balance`, `font-weight: 600`.
Hero h1: `font-size: clamp(38px, 5.6vw, 64px)`, line-height 1.02, tracking `-0.03em`.

### Spacing & rhythm

- Section vertical padding: `64–80px` desktop, `40–56px` mobile
- Container max-width: `1200px` for marketing, `1100px` for app surfaces
- Card padding: `20–28px`
- Button padding: `12px 18px` (primary), `10px 14px` (ghost)
- Border radius: `14px` (cards, buttons), `22px` (large feature cards), `999px` (pills)

---

## 7. Page-by-page spec

### 7.1 `/` — Landing (parent-facing marketing)

Source: `design/src/v3/Landing.v3.jsx` (10 sections, top to bottom):

1. **Hero** — kicker pill (region flag + tagline) → h1 → subhead → CTAs (`Start 14 dagen gratis` primary, `Probeer een vraag` ghost) → price snippet (€11,95/mo) → trust bullets (geen creditcard, per maand opzegbaar, hele gezin) → product loop frame on the right showing live question UI.
   - **Three hero variants** controlled by Tweaks: `samen` (default), `direct`, `play`. Ship **`samen`** — it's the differentiator vs Squla.
2. **Product loop** — animated 3-frame strip showing question → answer feedback → reward.
3. **Samen-modus** — parent phone + kid tablet pairing. **This is the core differentiator. Keep it.**
4. **Reward loop** — coins → avatar items → real-world goodies.
5. **Subjects** — Rekenen / Taal / Lezen / Wereld / Engels grid. Region-aware: NL says "groep", BE says "leerjaar".
6. **SEO leerlijn proof** (NL) / **ZILL** (BE) — parent-benefit framing first ("Je kind oefent precies wat de juf volgende week toetst"), curriculum framework as proof underneath.
7. **Ouder-dashboard preview** — light + warm, "zondagavond op de bank" framing, sample gespreksstarter card.
8. **Trust** — "in beta — eerste gezinnen" copy, 3 testimonials. **Do not invent user counts.** Replace with real numbers when you have them.
9. **Pricing** — 3 cards: Maandelijks €11,95, Jaarlijks €119 (besparing badge), Gezinsabonnement €19,95 (max 4 kinderen).
10. **FAQ** — 6–8 accordion items. Region-aware copy (SEO/ZILL, groep/leerjaar).
11. **Final CTA + Footer**.

### 7.2 `/signup` — Signup flow

Source: `design/src/Signup.jsx`. Two-step: parent email/password → first child (name + groep). 14-day trial, no card required. After signup → `/ouder`.

### 7.3 `/ouder` — Parent dashboard

Source: `design/src/Dashboard.jsx`. Shows:
- Per-child progress cards (name, groep, this week's minutes, current streak)
- Weekly gespreksstarter (one question to discuss at the table)
- Subject-level mastery (Rekenen / Taal / Lezen / Wereld)
- Subscription status + manage billing link

### 7.4 `/kind` — Kid home

Source: `design/src/v3/KidHome.v3.jsx`. Kid-friendly surface:
- Avatar + coin balance + level
- "Vandaag oefenen" — today's recommended quizzes (3–4 cards)
- "Spellen" — game-type tiles (5 mini-games)
- "Wereld" — avatar/room customization with earned coins
- Big, friendly buttons; min hit target **44px**; warm coral primary; no parent-style chrome

### 7.5 `/kind/spelen/[quizId]` — Active quiz

Source: `design/src/v3/GameShell.v3.jsx` orchestrates:

1. **Uitleg-scherm** — Lexi explains the quiz topic in 1–2 sentences (admin-authored `customExplain` field). Big "Start" button.
2. **10 vragen** — rendered by the chosen game type (see §8).
3. **Eindscherm** — coins earned, correctness summary, Lexi feedback, "Nog een keer" + "Terug naar home".

State to track per session: question index, correct count, coins earned, time per question.

### 7.6 `/admin/quizzen` — Admin

Source: `design/src/v3/AdminQuiz.v3.jsx`. Lets content team:
- Create / edit quizzes
- Set `title`, `subject`, `groep`, `customExplain` (the uitleg shown to the kid)
- **Pick the game type** per quiz (mc / type / catapult / match / drag-order)
- Add 10 questions with answer keys

### 7.7 `/shop` — Shop

Source: `design/src/v3/Shop.v3.jsx`. Three sections:
- **Abonnementen** (3 cards — same as pricing block on landing)
- **Bundels** — werkboek + abo combos per groep, struck-through prijs
- **Werkboeken** — 15 items across 4 groep-buckets (1-2, 3-4, 5-6, 7-8); each bucket has its own accent color; subjects: Rekenen / Taal / Lezen / Wereld / Engels; Cito-pakket for groep 7-8

Filters: category (Alles / Abonnementen / Werkboeken / Bundels) + groep (Alle / 1–8). Sticky cart pill bottom-right with item count + total.

---

## 8. Game types (the 5 mini-games)

Source: `design/src/v3/GameQuestions.v3.jsx`. Each game is a **renderer for a single question** that calls `onAnswer(isCorrect)` when the kid commits. `GameShell.v3.jsx` wraps any of them with the 10-question loop.

| id | name | mechanic | data shape |
|---|---|---|---|
| `mc` | Multiple choice | Tap 1 of 4 options | `{ q: string, options: string[4], correctIdx: 0..3 }` |
| `type` | Intypen | Type the answer, fuzzy match | `{ q: string, answer: string, accept?: string[] }` |
| `catapult` | Katapult | Drag-aim katapult, release to fire ball at correct answer floating in 4 targets | `{ q: string, options: string[4], correctIdx: 0..3 }` |
| `match` | Match-paren | Drag pairs together (5 pairs per question) | `{ q: string, pairs: [{l: string, r: string}][5] }` |
| `drag-order` | Slepen & sorteren | Drag items into correct sequence | `{ q: string, items: string[], correctOrder: string[] }` |

**Animation budget:** 200–400ms transitions, ease-out for entries, ease-in for exits. Right-answer animation: small celebration (coin pop, gentle shake). Wrong-answer: red border pulse, no harsh sound.

**Accessibility:** keyboard support for MC and Type. Catapult and Match must have a non-drag fallback (tap-to-select).

---

## 9. Region (NL / BE)

Region picker lives in the nav (flag dropdown). Persist to localStorage in the prototype; in production, persist to user profile + cookie for unauth visitors.

| String | NL | BE |
|---|---|---|
| Class label | "groep" | "leerjaar" |
| Range | 1 t/m 8 | 1 t/m 6 |
| Curriculum framework | SEO leerlijn 2026 | ZILL |
| Currency | EUR | EUR |
| Footer note | "Lexi.kids B.V. — Amsterdam" | "Lexi.kids — Antwerpen" |

All region-conditional copy lives in `Landing.v3.jsx`, `Nav.v3.jsx`, `Shop.v3.jsx`. Search for `region === 'BE'` to find every branch.

---

## 10. Suggested data model

```prisma
model Household {
  id              String   @id @default(cuid())
  ownerEmail      String   @unique
  region          Region   @default(NL)
  stripeCustomerId String?
  subscriptionTier Tier?
  trialEndsAt     DateTime?
  createdAt       DateTime @default(now())
  parents         Parent[]
  kids            Kid[]
}

enum Region { NL BE }
enum Tier   { MONTHLY YEARLY FAMILY }

model Parent {
  id          String   @id @default(cuid())
  householdId String
  household   Household @relation(fields: [householdId], references: [id])
  email       String   @unique
  passwordHash String
}

model Kid {
  id          String   @id @default(cuid())
  householdId String
  household   Household @relation(fields: [householdId], references: [id])
  name        String
  groep       Int       // 1..8 (NL) or 1..6 (BE)
  avatar      Json      // unlocked items + current outfit
  coins       Int       @default(0)
  sessions    Session[]
}

model Quiz {
  id            String   @id @default(cuid())
  title         String
  subject       Subject
  groep         Int
  region        Region
  gameType      GameType
  customExplain String   // shown on uitleg-scherm
  questions     Question[]
  publishedAt   DateTime?
}

enum Subject  { REKENEN TAAL LEZEN WERELD ENGELS }
enum GameType { MC TYPE CATAPULT MATCH DRAG_ORDER }

model Question {
  id        String   @id @default(cuid())
  quizId    String
  quiz      Quiz     @relation(fields: [quizId], references: [id])
  order     Int
  payload   Json     // shape depends on Quiz.gameType — see §8
}

model Session {
  id            String   @id @default(cuid())
  kidId         String
  kid           Kid      @relation(fields: [kidId], references: [id])
  quizId        String
  startedAt     DateTime @default(now())
  finishedAt    DateTime?
  correctCount  Int      @default(0)
  coinsEarned   Int      @default(0)
  perQuestion   Json     // [{questionId, correct, msSpent}]
}

model ShopOrder {
  id              String   @id @default(cuid())
  householdId     String
  stripeSessionId String   @unique
  items           Json     // [{sku, qty, priceCents}]
  totalCents      Int
  status          String
  createdAt       DateTime @default(now())
}
```

---

## 11. Analytics events

Wire these on day one — the conversion funnel needs them.

**Marketing**
- `landing_viewed` (variant: samen | direct | play)
- `cta_clicked` (location: hero | pricing | final | nav)
- `pricing_viewed`
- `region_switched` (from, to)

**Signup**
- `signup_step_1_completed`
- `signup_step_2_completed`
- `trial_started`

**Kid product**
- `quiz_started` (quizId, gameType, kidId)
- `quiz_question_answered` (quizId, qIdx, correct, msSpent)
- `quiz_completed` (quizId, correctCount, coinsEarned)
- `coins_spent` (item, cost)

**Parent**
- `parent_dashboard_viewed`
- `gesprekstarter_clicked`
- `billing_managed`

**Shop**
- `shop_viewed` (filter)
- `shop_item_added` (sku)
- `shop_checkout_started` (totalCents)
- `shop_checkout_completed` (totalCents)

---

## 12. What NOT to copy from the prototype

- **Tweaks panel** (`design/src/v3/Tweaks.v3.jsx`) — design-time only. Leave out of production. (Optional: keep accent-color switcher as a kid-facing personalization.)
- **localStorage state** in `App.v3.jsx` — replace with real auth + server state.
- **Inline `style={{}}`** — translate to your styling system.
- **Babel-in-browser** (`<script type="text/babel">`) — only used for the design preview.
- **Hardcoded testimonial numbers** — replace with real ones or remove.
- **`window.TWEAK_DEFAULTS`** — not relevant in production.

---

## 13. Acceptance checklist

- [ ] Landing renders pixel-close to `design/Lexi.kids v3.html` at 1280px and 375px widths
- [ ] Region picker switches all NL/BE strings; persists across reloads
- [ ] Signup → trial → parent dashboard flow works end-to-end with real auth
- [ ] All 5 game types are playable with keyboard fallback
- [ ] Admin can author a quiz with 10 questions, pick a game type, set uitleg, and publish
- [ ] Kid can play a published quiz; coins increment; session is persisted
- [ ] Stripe Checkout works for the 3 subscription SKUs and at least one shop item
- [ ] All analytics events from §11 fire
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95 on `/`
- [ ] No copyright issues — all imagery is original or licensed (Lexi mascot is original)

---

## 14. Open questions for the product team

(Things the design didn't pin down — flag these to the team before building.)

1. **Family account model.** Is the gezinsabonnement strictly 4 kids, or is it "household, no per-kid limit"?
2. **Adaptive engine.** The marketing claims "Lexi past elke vraag aan op het niveau van je kind." How is difficulty actually selected? Per-quiz pre-defined? Or runtime ELO-style adjustment from session history?
3. **Teacher / school tier.** Squla has school accounts; we don't show one. Is that a phase-2 product?
4. **Workbook fulfillment.** Shop sells physical werkboeken. Print-on-demand partner, or stocked inventory?
5. **Cito-pakket.** Licensing — is the Cito brand allowed, or do we need to call it "eindtoets-oefenpakket"?
6. **Parent-kid pairing for Samen-modus.** Does the parent need a separate companion app, or is it a web view on phone while kid is on tablet?
7. **GDPR / kids privacy.** Below-13 consent flow needs a separate spec — not designed yet.

---

## 15. Quickstart for the developer

```bash
# 1. Open the design references
open "design_handoff_lexi_kids/design/Lexi.kids v3.html"

# 2. In the new repo root, drop CLAUDE.md from this bundle
cp design_handoff_lexi_kids/CLAUDE.md ./CLAUDE.md

# 3. Start a Claude Code session
claude

# 4. First prompt: "Read CLAUDE.md and the design references in design_handoff_lexi_kids/. Then propose a build plan."
```

The `CLAUDE.md` in this bundle is the prompt — Claude Code will read it on every session in this repo and follow its instructions.
