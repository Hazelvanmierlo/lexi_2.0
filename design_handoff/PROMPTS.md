# PROMPTS.md — Copy-paste prompts for Claude Code

Run these in order. Wait for Claude to finish each phase, review, commit, then paste the next.

---

## Phase 0 — Kickoff (paste once at the start)

```
Read CLAUDE.md and design_handoff_lexi_kids/README.md end to end.
Then open design_handoff_lexi_kids/design/Lexi.kids v3.html in your head
(it's an HTML file with inline React via Babel) and skim the JSX
in design_handoff_lexi_kids/design/src/v3/.

After you've done that, summarize back to me in 5 bullets:
  - the product
  - the three audiences and their surfaces
  - the stack you'll use
  - the 8 build phases
  - any open questions you have before we start

Do not write code yet. Wait for me to confirm before phase 1.
```

---

## Phase 1 — Tooling skeleton

```
Phase 1: scaffold the Next.js 14 + TypeScript project per CLAUDE.md.

Tasks:
  1. pnpm create next-app . (App Router, TypeScript, Tailwind, ESLint, src/ dir, no Turbopack)
  2. Wire the OKLCH tokens from README §6 into app/globals.css as CSS variables,
     then expose them in tailwind.config.ts (bg, bg-2, card, ink, ink-2, ink-3,
     line, line-2, primary, primary-ink, primary-soft, teal, sun, plum, ok,
     plus the radius and shadow tokens).
  3. Set up next/font for Bricolage Grotesque (display), Geist (body),
     JetBrains Mono (mono). Wire to .display, body, .mono utility classes.
  4. Install Prisma; create prisma/schema.prisma using README §10.
     Use Postgres. Run prisma migrate dev with a local dev DB
     (docker-compose.yml with postgres:16 is fine).
  5. Install @clerk/nextjs and stripe — env-var placeholders only, no real keys.
  6. Install next-intl; configure nl-NL (default) and nl-BE locales.
     Stub messages files at messages/nl-NL.json and messages/nl-BE.json.
  7. Install posthog-js; create lib/analytics.ts that exports a typed track()
     matching the event names in README §11.
  8. Set up Vitest + Playwright with one smoke test each.
  9. Add scripts: dev, build, lint, typecheck, test, test:e2e, db:push, db:studio.

Commit as: chore: scaffold next.js + tailwind + prisma + clerk + stripe

Stop when done. Do not start phase 2.
```

---

## Phase 2 — Marketing surfaces

```
Phase 2: build the public marketing surfaces.

Reference: design_handoff_lexi_kids/design/src/v3/Landing.v3.jsx,
Nav.v3.jsx, Shop.v3.jsx. README §7.1, §7.7, §9.

Tasks:
  1. Build app/(marketing)/layout.tsx with the Nav (region picker included).
     Region persists to a cookie; default NL.
  2. Build app/(marketing)/page.tsx — the 10-section landing. Server-rendered.
     Translate every inline style{} from Landing.v3.jsx to Tailwind classes
     using the tokens from phase 1. Match the design exactly.
     Ship the "samen" hero variant (the differentiator vs Squla).
  3. Build app/(marketing)/probeer/page.tsx — single MC question demo,
     reuses the MC game type from phase 4 prep work.
  4. Build app/(marketing)/shop/page.tsx — full catalog from Shop.v3.jsx.
     Filters work. Cart in Zustand, persisted to localStorage.
  5. Wire all NL/BE region branches. groep vs leerjaar. SEO vs ZILL. Etc.
  6. Fire analytics events: landing_viewed, cta_clicked, pricing_viewed,
     region_switched, shop_viewed, shop_item_added.
  7. Lighthouse: target ≥90 perf, ≥95 a11y on /. Fix what's needed.

Commit as: feat(marketing): landing + shop + probeer + region picker

Stop when done.
```

---

## Phase 3 — Auth + signup + parent dashboard

```
Phase 3: real auth and the parent surface.

Reference: design/src/Signup.jsx, design/src/Dashboard.jsx, README §7.2, §7.3, §10.

Tasks:
  1. Wire Clerk (real keys via env). Households as Clerk organizations;
     Parent rows in our DB linked by Clerk userId.
  2. Build app/signup/page.tsx — two-step (parent email/password → first child).
     Creates Household + Parent + first Kid. Starts 14-day Stripe trial WITHOUT
     a card (Stripe trial_period_days, no payment_method).
  3. Build app/(parent)/ouder/page.tsx — Dashboard.jsx but real data:
     per-kid cards, this week's minutes, streak, subject mastery,
     weekly gespreksstarter. Manage billing → Stripe Customer Portal.
  4. Add middleware to gate /ouder/** behind Clerk auth.
  5. Server Actions for any mutation (add kid, edit kid name).
  6. Analytics: signup_step_1_completed, signup_step_2_completed,
     trial_started, parent_dashboard_viewed, gesprekstarter_clicked.
  7. Playwright happy path: signup → trial → dashboard renders with kid.

Commit as: feat(parent): auth + signup + ouder dashboard
```

---

## Phase 4 — Kid product + 5 game types

```
Phase 4: the kid surface and quiz play.

Reference: design/src/v3/KidHome.v3.jsx, GameShell.v3.jsx, GameQuestions.v3.jsx,
README §7.4, §7.5, §8.

Tasks:
  1. Build app/(kid)/kind/page.tsx — kid home. Avatar, coins, today's quizzes,
     game tiles, world customization. 44px minimum hit target. No parent chrome.
     Gate behind a kid-profile selector (Clerk lets you pick the active sub-profile).
  2. Build the 5 game type components in src/components/games/:
     - MultipleChoice.tsx (mc)
     - TypeAnswer.tsx (type) — fuzzy match with accept[] list
     - Catapult.tsx (catapult) — drag-aim, release-fire. Tap fallback.
     - MatchPairs.tsx (match) — drag pairs. Tap-pair fallback.
     - DragOrder.tsx (drag-order) — drag to reorder. Up/down arrow fallback.
     Each accepts { question, onAnswer(correct: boolean) }.
  3. Build app/(kid)/kind/spelen/[quizId]/page.tsx — uitleg → 10 vragen →
     eindscherm. Renders the quiz's gameType. Persists a Session row.
     Increments Kid.coins on completion.
  4. Right-answer celebration: coin pop + gentle shake, ≤400ms,
     respects prefers-reduced-motion.
  5. Wrong-answer feedback: red border pulse, no sound.
  6. Keyboard support on MC and Type.
  7. Analytics: quiz_started, quiz_question_answered, quiz_completed, coins_spent.

Commit as: feat(kid): home + 5 game types + quiz play loop
```

---

## Phase 5 — Admin authoring

```
Phase 5: admin can author quizzes.

Reference: design/src/v3/AdminQuiz.v3.jsx, README §7.6.

Tasks:
  1. Add admin role on Clerk; gate /admin/** behind it.
  2. Build app/(admin)/admin/quizzen/page.tsx — list + create + edit.
     Fields: title, subject, groep, region, gameType, customExplain,
     10 questions with payload shapes from README §8.
  3. Per-game-type question editors that match the runtime data shape exactly.
     A switch on gameType — wrong shape = won't save.
  4. Publish toggle. Only published quizzes appear on /kind.
  5. Server Actions for all CRUD; revalidate /kind paths on publish.

Commit as: feat(admin): quiz authoring with per-game-type editors
```

---

## Phase 6 — Stripe (subscriptions + shop)

```
Phase 6: real money.

Reference: README §10 (ShopOrder), §3 (Stripe).

Tasks:
  1. Create 3 subscription products in Stripe (Maandelijks €11,95,
     Jaarlijks €119, Gezinsabonnement €19,95). Sync price IDs to env.
  2. Wire signup trial to MONTHLY tier by default; let parents upgrade
     from /ouder/abonnement.
  3. Shop checkout: Stripe Checkout one-off for werkboeken + bundles.
     Persist ShopOrder row. Email receipt via Stripe.
  4. Webhook at /api/stripe/webhook — handle:
     customer.subscription.{created, updated, deleted},
     checkout.session.completed, invoice.payment_failed.
  5. Customer Portal link on /ouder for self-serve cancel + payment method.
  6. Analytics: shop_checkout_started, shop_checkout_completed, billing_managed.

Commit as: feat(billing): stripe subscriptions + shop checkout + webhooks
```

---

## Phase 7 — Analytics + E2E happy path

```
Phase 7: observability and the green-light test.

Tasks:
  1. Audit every event from README §11 — confirm it fires with the right props.
     Add a dev-only console logger that prints every track() call so we can verify.
  2. Playwright E2E:
     - landing → signup → trial starts
     - parent sees kid on dashboard
     - kid plays a published MC quiz end-to-end → coins increment
     - parent buys a workbook via shop checkout (use Stripe test mode)
  3. Add a basic /api/health endpoint for uptime checks.
  4. Sentry (optional, ask first) for error reporting.

Commit as: test: e2e happy path + analytics audit
```

---

## Phase 8 — Polish + Lighthouse

```
Phase 8: ship-ready polish.

Tasks:
  1. Lighthouse on / ≥90 perf, ≥95 a11y, ≥95 SEO. Fix until green.
  2. Lighthouse on /kind ≥90 a11y. (Perf less critical — auth-gated.)
  3. Add Open Graph + Twitter card images for /.
  4. Add robots.txt + sitemap.xml. Block /kind/**, /ouder/**, /admin/**.
  5. Add 404 + 500 pages styled to match the brand.
  6. Run through README §13 acceptance checklist; tick every box.
  7. Verify all open questions in README §14 have either been answered
     by the team or are explicitly logged as TODO with a tracking issue.

Commit as: chore: lighthouse + polish + 404/500 pages
```

---

## Common ad-hoc prompts

**When the design and your code disagree:**
```
The design in design_handoff_lexi_kids/design/src/v3/<file>.jsx shows X.
Your implementation shows Y. The design is the source of truth.
Re-read the JSX and match it.
```

**When you want to add a tweak/variant:**
```
Add a Tweaks-panel-style toggle for <thing> on /<route>.
Reference design/src/v3/Tweaks.v3.jsx for the pattern but DO NOT ship
the iframe postMessage protocol — that's design-time only. Use a
client-side toggle persisted to localStorage instead.
```

**When something feels too AI-generated:**
```
Re-read README §12 ("What NOT to copy") and the brand voice notes
in CLAUDE.md house rule #7. Rewrite this section without filler,
without round-number stats, without American marketing fluff.
Dutch-direct, parent-respectful, warm.
```
