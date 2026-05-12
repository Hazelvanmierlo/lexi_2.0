# Lexi.kids — Landing Animation Pass (Phase 2b) Design

**Date:** 2026-05-11
**Source:** `Downloads/website Lexi 2.0 (2)/handoff-landing/LANDING_PAGE_SPEC.md` + `landing-fullpage.png`
**Phase:** 2b — bring the animated bits the spec calls out + restore deleted sections.

## Goal

Bring the existing landing page closer to the spec by:
1. Replacing the static hero panel with an animated phone mock (4-state cycle) + parent-ping card overlay.
2. Replacing FeatureGrid with ProductLoop (4 numbered "what happens in 15-min session" cards).
3. Bringing back RewardLoop (3-phase auto-cycling animation: coins → avatar → FOMO).
4. Replacing SubscribeWidget with FinalCTA on cream background, two CTAs.
5. Tweaking color tokens to match the spec exactly.

## Token diffs

| Token | Mine (current) | Spec | Action |
|---|---|---|---|
| `--color-primary` | `oklch(58% 0.18 35)` | `oklch(60% 0.16 35)` | adjust |
| `--color-ok` | `oklch(48% 0.16 155)` | `oklch(58% 0.14 155)` | revert toward spec |
| `--color-bg` | `oklch(98% 0.012 85)` | `oklch(99% 0.005 95)` | adjust |
| `--color-ink-3` | `oklch(60% 0.015 260)` | `oklch(55% 0.015 260)` | darken slightly |

Risk: darkening `--color-ok` reverses the earlier Lighthouse contrast fix on the "+12 min" delta spans in ProgressChartCard. Verify at acceptance; if it regresses, swap `text-ok` for `text-primary-ink` on those spans (already passes).

## Section order (new)

```
<Nav />
<main>
  <Hero />                  // rewrite — animated phone mock + parent-ping
  <ProductLoop />           // new — 4 numbered cards (replaces FeatureGrid)
  <SamenModus />            // keep
  <RewardLoop />            // restore — 3-phase cycle, client
  <ProgressChartCard />     // keep
  <Subjects />              // keep
  <SeoProof />              // keep
  <Trust />                 // keep
  <Pricing />               // keep
  <Faq />                   // keep
  <FinalCta />              // restore — cream banner with 2 CTAs (replaces SubscribeWidget)
</main>
<Footer />
```

(Total sections in `<main>`: 10, same count as before. Just different mix.)

## New / changed components

### `<AnimatedPhoneMock>` (client)
`src/components/landing/animated-phone-mock.tsx`. `"use client"`. `useState<0|1|2|3>(0)` + `useEffect` with `setInterval(2000)`. Renders a phone-shaped frame `bg-card` with:
- State 0: question text "Welk getal hoort hier?" + 2×2 option grid with `1/2`, `1/4`, `1/3`, `3/4` all in neutral border.
- State 1: same but `3/4` highlighted `border-primary bg-primary-soft`.
- State 2: same as state 1 plus a green check `text-ok` icon next to `3/4`, plus a small `bg-ok-soft` panel below saying "Goed gedaan!".
- State 3: a slide-in reward overlay with `lexi-fade-up` animation: mascot (`bot/hero`, 80px), "+12 munten · Goed bezig!", "Nieuw avatar-onderdeel ontgrendeld."

Respect `prefers-reduced-motion: reduce` — if set, freeze on state 0 (skip the interval).

### `<ParentPingCard>` (server)
`src/components/landing/parent-ping-card.tsx`. Static `position: absolute` card placed bottom-right relative to the hero phone wrapper. Content: small mono kicker "Bericht voor jou", body "Sara had moeite met breuken vergelijken. Vraag haar vanavond: 'Wat is meer: 3/4 of 2/3?'". Uses `bg-card` + `shadow-lexi-lg` + `rounded-lexi-lg` + tilted slightly with `rotate-[2deg]`.

### `<Hero>` (rewrite)
Left column unchanged — kicker, h1, subhead, two CTAs, price snippet, trust bullets. Right column now contains a `relative` wrapper with:
- `<AnimatedPhoneMock />` centered inside a `bg-primary-soft` panel (keeps the same colored background)
- `<ParentPingCard />` absolutely positioned bottom-right, overlapping the phone

### `<ProductLoop>` (new — restored with new shape)
`src/components/landing/product-loop.tsx`. Server. 4 numbered cards in a grid with `<SectionIntro>` above. Each card has:
- Mono eyebrow `01` / `02` / `03` / `04`
- Lucide icon in tinted square
- h3 title
- Body paragraph

Content (from spec §"15-min session"):
1. **Vraag** — Lexi stelt een vraag op het niveau van je kind.
2. **Probeer** — Je kind kiest of typt een antwoord. Direct feedback.
3. **Beloon** — Munten en avatar-items voor goede antwoorden.
4. **Samen** — Een gespreksstarter voor aan tafel.

### `<RewardLoop>` (restore)
`src/components/landing/reward-loop.tsx`. `"use client"` because of the cycle. `useState<0|1|2>(0)` with `setInterval(2200)`. 3 stacked phases visible at once on desktop (cards side-by-side, each one "active" when its index matches the cycle by getting `border-primary` + scale-up; others dimmed). Or alternative: single card that swaps content. Going with the simpler "highlight the active card" — visible content is the same shape always, just emphasis cycles. Respects `prefers-reduced-motion`.

Phases:
1. Coins — "Munten verzamelen" — `Coins` icon
2. Avatar — "Avatar-items kopen" — `Sparkles` icon
3. Goodies (FOMO) — "Echte cadeaus" — `Gift` icon, with a small "BINNENKORT" badge

### `<FinalCta>` (restore)
`src/components/landing/final-cta.tsx`. Server. Cream `bg-bg-2` section with a centered card: h2 "Begin vanavond. Veertien dagen gratis.", subline, two CTAs ("Start 14 dagen gratis" → `/signup`, "Probeer een vraag" → `/probeer`). Same as the previous deleted FinalCta.

### `<SubscribeWidget>` — **delete**
No longer in the section order.

### `<FeatureGrid>` — **delete**
Replaced by ProductLoop.

## i18n changes

Add to `nl-NL.json`:
- `hero.frame.{question, options[], correctIdx, feedback, reward.{title, sub}}` (for animated mock content)
- `hero.parentPing.{kicker, body}`
- `productLoop.{eyebrow, title, items[4].{eyebrow, title, body}}`
- `rewardLoop.{eyebrow, title, lead, phases[3].{title, body}}`
- `finalCta.{title, sub, ctaTrial, ctaTry}`

Remove from `nl-NL.json`:
- `featureGrid.*`
- `subscribe.*`

BE overrides: only where strings differ (mostly groep/leerjaar in productLoop body wording — likely not needed).

## Animation timing summary

| Element | Mechanism | Period |
|---|---|---|
| AnimatedPhoneMock cycle | `setInterval` | 2000ms / 4 states = 8s loop |
| RewardLoop phase cycle | `setInterval` | 2200ms / 3 phases = 6.6s loop |
| Reward overlay slide-in | CSS keyframe `lexi-fade-up` (existing) | 300ms |
| Mascot float | (skipped this phase) | — |

`_landing.css` already has `lexi-fade-up`. Add a new `_landing.css` (file currently deleted in Phase 2a — bring it back) with reduced-motion gating for the new client cycles. The cycle itself is JS, so JS already needs to check `window.matchMedia("(prefers-reduced-motion: reduce)")` and skip the interval when true.

## Files

```
ADD:
  src/app/_landing.css                        (recreate; reduced-motion gating + keyframes for slide-in)
  src/components/landing/animated-phone-mock.tsx  (client)
  src/components/landing/parent-ping-card.tsx     (server)
  src/components/landing/product-loop.tsx         (server — different shape than the old deleted one)
  src/components/landing/reward-loop.tsx          (client — restored)
  src/components/landing/final-cta.tsx            (server — restored)

DELETE:
  src/components/landing/feature-grid.tsx
  src/components/landing/subscribe-widget.tsx

MODIFY:
  src/components/landing/hero.tsx
  src/app/page.tsx
  src/app/globals.css           (tweak tokens + restore `@import "./_landing.css"`)
  src/messages/nl-NL.json
  src/messages/nl-BE.json       (cleanup any orphaned keys)
```

## Testing impact

- Existing E2E `landing.spec.ts` still works (Subjects lead text, region switch, FAQ, hero CTA href).
- Add no new tests in this pass; the animations are visual and don't have deterministic assertions worth writing as E2E.
- Build clean + Lighthouse ≥ 0.9 perf / ≥ 0.95 a11y on `/` (the client cycles add small JS payload; monitor TBT).

## Open risks

- The animated phone mock content (4 states) inflates the Hero component. Likely 150+ lines including markup. Acceptable.
- Adding `setInterval` everywhere might bump Lighthouse TBT. If LCP/TBT regress: ensure both cycles short-circuit under `prefers-reduced-motion` AND when the page is hidden (`document.visibilityState !== "visible"`).
