# CLAUDE.md — Lexi.kids production build

This file is your standing instructions for building **Lexi.kids** — a Dutch/Belgian adaptive learning platform for children in groep 1 t/m 8 — from the design references in `design_handoff_lexi_kids/`.

You are working with a small product team. The designs are final. Your job is to ship them as a real product.

---

## How to start every session

1. Read `design_handoff_lexi_kids/README.md` end to end. It is the source of truth for scope, tokens, routes, data model, and acceptance criteria.
2. Open `design_handoff_lexi_kids/design/Lexi.kids v3.html` in a browser to see the live design before touching any code.
3. Skim the v3 JSX in `design_handoff_lexi_kids/design/src/v3/` for the component you're about to implement. Lift exact values (colors, spacing, copy, layout). Do not re-invent.
4. Confirm your build plan with the user **before** writing code on a new feature.

---

## Stack (use these exact choices unless the user overrides)

- **Framework:** Next.js 14 App Router + TypeScript (strict)
- **Styling:** Tailwind CSS, with the OKLCH tokens from README §6 wired as CSS variables in `app/globals.css`. Configure `tailwind.config.ts` to expose them as `bg-bg`, `text-ink`, `border-line`, etc.
- **Fonts:** `next/font` for Bricolage Grotesque (display), Geist (body), JetBrains Mono (numerics)
- **Components:** Build atoms from the v3 JSX. Use Radix UI primitives only for popovers, dialogs, accordions, and dropdowns.
- **State:** Server Components for `/`, `/shop`, `/probeer`. Client components for `/ouder`, `/kind/*`, `/admin/*`. Zustand for kid-session state. Server Actions for mutations.
- **Auth:** Clerk. Households as organizations; parents as users; kids as Clerk-managed sub-profiles or our own `Kid` rows linked by `householdId`.
- **DB:** Postgres + Prisma. Schema in README §10. Run `prisma migrate dev` for changes; never edit the SQL by hand.
- **Payments:** Stripe Subscriptions for the 3 tiers; Stripe Checkout for shop one-offs. Webhook at `/api/stripe/webhook`.
- **i18n:** `next-intl` with `nl-NL` (default) and `nl-BE`. **Do not** use English; this product is Dutch-only.
- **Analytics:** PostHog. Event names in README §11 are the contract — match them exactly.
- **Testing:** Vitest for units; Playwright for the signup→trial→quiz-play happy path.
- **Hosting:** Vercel. Postgres on Neon or Supabase. Media on Vercel Blob.

---

## Translating the prototype to production

The v3 JSX uses inline `style={{ ... }}` because it runs in-browser via Babel. **Do not preserve inline styles in production.** Translate every component to Tailwind classes that resolve to the same OKLCH values.

| Prototype pattern | Production pattern |
|---|---|
| `style={{padding:'48px 20px'}}` | `className="px-5 py-12"` (and confirm Tailwind spacing scale matches) |
| `style={{background:'var(--card)'}}` | `className="bg-card"` (token defined in tailwind config) |
| `oklch(66% 0.17 35)` literal | CSS variable `--primary` referenced as `bg-primary` |
| `localStorage.getItem('lexi-v3-state')` | Real session via Clerk + DB |
| `window.TWEAK_DEFAULTS` | Drop entirely |
| `<script type="text/babel">` | Drop. This is design-time only. |

---

## What "done" looks like for each surface

Reference README §13 for the full acceptance checklist. Per-surface highlights:

**`/` Landing:** matches v3 visually at 1280px and 375px. Region picker works. All CTAs route correctly. Lighthouse ≥ 90 perf, ≥ 95 a11y.

**`/signup`:** real email + password (Clerk). Creates Household + Parent + first Kid. Starts 14-day Stripe trial without requiring a card.

**`/ouder`:** lists all kids in the household. This week's minutes, streak, mastery per subject, and weekly gespreksstarter. "Beheer abonnement" links to Stripe Customer Portal.

**`/kind`:** kid-friendly. Coins balance. Today's recommended quizzes (3–4). Game-type tiles. Avatar/room customization spending coins. **44px minimum hit target.** No parent chrome.

**`/kind/spelen/[quizId]`:** orchestrates uitleg → 10 questions → eindscherm. Records a `Session` row. Increments `Kid.coins`. Fires the analytics events from README §11.

**`/admin/quizzen`:** content team can CRUD quizzes, pick game type, author 10 questions per quiz, publish. Admin role gated by Clerk role.

**`/shop`:** 3 subscriptions + 3 bundles + 15 workbooks + Cito-pakket. Filters work. Cart persists. Stripe Checkout completes orders.

---

## House rules

1. **Dutch copy is non-negotiable.** Don't add English fallbacks. If a string is missing in `nl-BE`, fall back to `nl-NL`.
2. **OKLCH everywhere.** Don't quietly downgrade to hex; modern browsers support OKLCH and we want the gamut.
3. **No emoji as UI.** The prototype uses `🌍` etc. as placeholders — replace with Lucide icons before shipping.
4. **No new dependencies without asking.** Stack list above is the budget.
5. **Match the design exactly.** If something looks off in your build, the design is right and your build is wrong — until the user says otherwise.
6. **Server-render the marketing site.** No client-side hydration of static content. Lighthouse will catch it.
7. **Preserve the brand voice in copy.** Warm, parent-respectful, slightly Dutch-direct. Don't add American marketing fluff.
8. **Kid-product safety:** no third-party scripts on `/kind/*`. No external links from kid surfaces. Analytics goes through our own first-party endpoint.
9. **Accessibility floors:** keyboard nav on every interactive element, visible focus rings, alt text on every image, prefers-reduced-motion respected on celebrations.
10. **Commit etiquette:** Conventional Commits. One feature per branch. PRs reference the README section they implement (e.g. "implements README §7.4 — kid home").

---

## When you're stuck

- The design is the source of truth — re-open the v3 HTML.
- Check `design/src/v3/Landing.v3.jsx` for any region/copy question.
- Check `design/src/v3/GameQuestions.v3.jsx` for game-type mechanics.
- README §14 lists open product questions — flag these to the user; do not invent answers.

---

## First prompt to the user

When you start a fresh session, propose a build plan in this order:

1. Tooling: Next.js skeleton + Tailwind tokens + fonts + Prisma + Clerk + Stripe placeholder
2. Marketing: `/` landing (server-rendered), `/probeer`, `/shop`
3. Auth + signup → `/ouder`
4. Kid product: `/kind` + `/kind/spelen/[quizId]` + the 5 game types
5. Admin: `/admin/quizzen`
6. Stripe: subscriptions + shop checkout + webhooks
7. Analytics + Playwright happy-path test
8. Polish + Lighthouse pass

Ship phase 1 before starting phase 2. Ask before skipping ahead.
