# Lexi.kids — Landing Page Redo (Phase 2a) Design

**Date:** 2026-05-11
**Phase:** 2a — visual redo of the landing page (`/`) to match the new screenshot design from `Downloads/website Lexi 2.0 (1)/pages/landing.png`.
**Source of truth:**
- Target visual: `Downloads/website Lexi 2.0 (1)/pages/landing.png`
- Mascot assets: `Downloads/lexi-avatars/avatars/{bot,classic,owl}/{seed,baby,kid,teen,hero}-{transparent,bg}.{png,svg}`, copied into `public/avatars/...`
- Existing code: the Phase 2 landing build at `src/app/page.tsx` + `src/components/{nav,landing,ui}/`

## Goal

Replace four sections, add two new ones, delete five obsolete files, and integrate the Lexi mascot — so `/` matches the new screenshot's visual language while preserving the existing i18n + region picker + accessibility work.

## Decisions locked in

| Decision | Choice | Why |
|---|---|---|
| Pricing tiers | **2** (Maandelijks €11,95 + Jaarlijks €119), both whole-family | Matches the screenshot; resolves the open conflict between hero "Hele gezin" promise and the prior 3-tier model |
| Hero right column | **Mascot in a soft-tinted panel** (`bot/hero-transparent.svg`) | Screenshot shows the brand character, not a UI mockup |
| Mascot style/age default | `bot` style, `hero` age | User approved during brainstorming |
| RewardLoop | **Deleted entirely** | Not present in the new screenshot |
| FinalCta | **Deleted** — replaced by the new SubscribeWidget | The screenshot puts an inline subscribe card where FinalCta used to be |
| Animation | **None** in the new design — drop `_landing.css` keyframes (ProductLoop and RewardLoop are gone) | Simplifies the layer and keeps the page Lighthouse-friendly |
| Chart | **Static HTML/CSS bars** in `<ProgressChartCard>` — no chart library | Same as the SeoProof rows pattern; YAGNI on recharts |
| Subscribe widget submit | **`<a href="/signup?email=...">` link**, not a form action | UI-only phase; real signup creation is Phase 3 |

## Non-goals (deferred)

- Real signup, real auth, real DB (Phase 3+)
- Avatar swap UI / kid-side customization (Phase 4)
- A/B testing the hero variant
- Replacing the mascot with an animated illustration
- A real chart library — if the static bars prove insufficient later, we'll revisit

## Architecture

Same Server-Component-first model as Phase 2: page is server-rendered, locale read from cookie via `next-intl` request handler, two client islands stay (`<RegionPicker>` and `<Faq>`). The mascot is rendered via `next/image` `<Image>` for automatic optimization (`/avatars/bot/hero-transparent.svg` is in `public/`).

## Section order (`src/app/page.tsx`)

```
<Nav />
<main id="main-content">
  <Hero />                  // rewrite: new headline, mascot panel
  <FeatureGrid />           // new: "Zo zit Lexi.kids in elkaar" 3-column
  <SamenModus />            // rewrite: paired phone+tablet illustration
  <ProgressChartCard />     // new (replaces ParentDashboardPreview)
  <Subjects />              // keep
  <SeoProof />              // keep
  <SubscribeWidget />       // new: inline email capture → /signup?email=
  <Trust />                 // keep
  <Pricing />               // rewrite: 2 tiers
  <Faq />                   // keep
</main>
<Footer />
```

## Components

### `<MascotImage>` (new, shared atom)

`src/components/ui/mascot.tsx`. Server component. Props: `{ style?: "bot" | "classic" | "owl"; age?: "seed" | "baby" | "kid" | "teen" | "hero"; size: number; className?: string; alt?: string; decorative?: boolean }`. Defaults: `style="bot"`, `age="hero"`. Renders `<Image>` from `next/image` pointing at `/avatars/${style}/${age}-transparent.svg` with `width={size} height={size}` and either `alt={alt}` or `aria-hidden="true"` when `decorative`.

### `<Hero>` (rewrite)

Two-column layout at `md:grid-cols-2`. Left column: kicker pill with flag + `t("hero.kicker")`, h1 with the new title, subhead, two CTAs (`/signup` primary, `/probeer` ghost), three trust bullets with Check icons. Right column: a soft `bg-primary-soft` rounded panel (`rounded-lexi-lg`) containing `<MascotImage style="bot" age="hero" size={320} decorative />` centered. ~110 lines.

### `<FeatureGrid>` (new)

`src/components/landing/feature-grid.tsx`. Server. Renders `<SectionIntro>` ("Zo zit Lexi.kids in elkaar") above a 3-column grid of three feature cards. Each card has an icon-in-tinted-square (Lucide), h3 title, body paragraph. Content keys:

- `featureGrid.items.kwartier.{title,body}` — "Eén kwartier per dag" + body about 15-min sessions; icon `Clock`
- `featureGrid.items.aangepast.{title,body}` — "Aangepast aan je kind" + body about adaptive engine; icon `Sparkles`
- `featureGrid.items.samen.{title,body}` — "Samen leren, niet alleen oefenen" + body about parent-kid pairing; icon `Heart`

`md:grid-cols-3`, gap-6, each card `rounded-lexi-lg border border-line bg-card p-6 shadow-lexi-sm`. ~80 lines.

### `<SamenModus>` (rewrite, same filename)

`src/components/landing/samen-modus.tsx`. Two-column. Left: `<SectionIntro>` "Een kwartier samen leren. Geen huiswerkgevecht." + 3-item numbered ladder (mono `01 / 02 / 03` eyebrow each, short body). Right: paired-device illustration via inline SVG-styled `<div>`s:
- Phone-shaped (340px tall, narrow) tilted right, `bg-teal-soft` rounded-[40px] border, contains a static mini-card showing parent UI: "HINT VOOR JOU" eyebrow + short tip
- Tablet-shaped (wider, shorter, behind/below phone) `bg-sun-soft` rounded-[28px] border, contains a static mini-card showing kid UI: "Vul de zin aan:" + 4 chip options

Both devices use `bg-card` inner panels with shadow. No real screenshots — pure layout boxes. ~150 lines.

### `<ProgressChartCard>` (new — replaces `<ParentDashboardPreview>`)

`src/components/landing/progress-chart-card.tsx`. Server. Single full-width card section. Inside the card:
- Top row: mascot avatar (small, `<MascotImage age="kid" size={48} decorative />` in a colored circle) + "Sara · groep 5" header + "Weekrapport — week 12" eyebrow
- Stats strip: 3 chips (`Geoefend 47 min`, `Streak 12 dagen`, `Niveaus omhoog 2`)
- Progress rows: 4 subject rows, each `<row>` = label + topic + percentage value + horizontal bar (CSS `<div>` with `style={{ width: ${pct}% }}`)
- Optional bottom small link: "Bekijk het volledige dashboard →" (routes to `/ouder` which doesn't exist yet — 404, that's OK)

The component must use `useTranslations("progressChart")`. Region-aware via `common.groep` interpolation. ~130 lines.

### `<Subjects>` (keep)

No code changes. Already region-aware via `common.groep`/`groepRange`. Visual polish optional in this phase.

### `<SeoProof>` (keep)

No code changes.

### `<SubscribeWidget>` (new)

`src/components/landing/subscribe-widget.tsx`. Server (renders a static form whose submit is a regular link). Card with:
- h2 "Probeer Lexi 14 dagen gratis."
- subline "Geen creditcard nodig. Per maand opzegbaar."
- inline `<form>` containing `<input type="email" required>` + `<Btn href="/signup">Start gratis</Btn>`

The form has no `action` — submit is just visual; the Btn link routes to `/signup`. We don't capture the email yet (Phase 3 wires real signup). Add a `noValidate` and rely on browser email validation if the user types something. ~70 lines.

### `<Trust>` (keep)

No code changes. Already has BE-localized testimonials.

### `<Pricing>` (rewrite — 2 tiers)

`src/components/landing/pricing.tsx`. Rewrite removes the `family` tier. New `TIERS = ["monthly", "yearly"] as const`. Feature list for both tiers includes "Alle kinderen in het gezin" so the hero `trust.wholeFamily` promise holds. Yearly stays the featured tier with the "Voordeligst" badge. Each CTA routes to `/signup?plan=monthly` or `/signup?plan=yearly`. ~100 lines.

### `<Faq>` (keep)

Remove FAQ item #5 ("Hoeveel kinderen kunnen op één account?") since 2-tier pricing removes the family-tier story. Replace with one that fits the new pricing: "Wat zit er in het gezinsabonnement?" → "Alle kinderen in het gezin krijgen toegang. Geen extra kosten per kind." (Or simpler: drop item 5 entirely; 5 items instead of 6.) Decision: **drop item 5**, leaving 5 FAQ items.

## Locale message changes

### Remove

- `productLoop.*` (entire namespace)
- `rewardLoop.*` (entire namespace)
- `parentDashboard.*` (entire namespace)
- `finalCta.*` (entire namespace)
- `pricing.tiers.family.*` (sub-keys)
- `faq.items[4]` (the family-tier question — "Hoeveel kinderen kunnen op één account?"; index 4, the 5th item)

### Add

- `hero.title` → "Het oefenprogramma waar je kind zelf om vraagt." (new value; BE override too)
- `featureGrid.eyebrow` / `title` / `items.{kwartier,aangepast,samen}.{title,body}`
- `samenModus.steps.{one,two,three}.{eyebrow,title,body}` (3-item ladder)
- `progressChart.{eyebrow,title,lead,reportLabel,kidName,group,stats.{minutes,streak,levels}.{label,value},rows[4].{label,topic,pct}}` — note `pct` is numeric, read via `t.raw()`
- `subscribe.{title,sub,placeholder,cta}`

### Modify

- `pricing.tiers` reduced to `monthly` + `yearly`; both feature lists updated to include "Alle kinderen in het gezin"
- `nav.ctaTrial` unchanged
- `hero.subhead` unchanged

### BE overrides (`nl-BE.json`) cleanup

- Remove `parentDashboard.*` override (block goes away)
- Remove `hero.frame.subject` override (HeroProductFrame is deleted; no frame namespace anymore)
- Update `hero.title` for BE
- Add BE overrides where the new copy includes groep/leerjaar terminology

## Data flow

Identical to Phase 2. Request → next-intl request handler → reads `lexi-locale` cookie → deep-merges nl-BE over nl-NL → server components consume scoped `useTranslations(...)`. Mascot images are served from `public/avatars/` by Next's static asset handler; `next/image` adds responsive `srcset` for the PNG variant (we use SVG so srcset doesn't apply — Next just serves the file).

## Error handling

- Mascot SVG missing → broken image in dev; production would 404 the asset. We're shipping files into `public/avatars/` in Task 1 of the plan, so this is a deploy-time concern, not runtime.
- Email input on SubscribeWidget — no validation logic, just `type="email" required`. Phase 3 will replace this with a real handler.
- Existing fallback chains (locale, message keys) unchanged.

## Testing

- Vitest: unchanged. The four existing test files (`locale-cookie`, `set-locale-action`, `btn`, `section-intro`) continue to pass — none of those components are modified.
- Playwright happy path (`tests/e2e/landing.spec.ts`): all assertions survive. The "Voor groep 1 t/m 8" subjects text + region picker + FAQ first item + hero CTA `href="/signup"` all still apply after the redo.
- Lighthouse: target ≥ 0.9 perf, ≥ 0.95 a11y. Risks: mascot image is 1024×1024 PNG ~80kB — using the SVG variant is better. Will set `loading="eager"` only on the hero mascot (others lazy).

## Files

```
ADD:
  src/components/ui/mascot.tsx
  src/components/landing/feature-grid.tsx
  src/components/landing/progress-chart-card.tsx
  src/components/landing/subscribe-widget.tsx

DELETE:
  src/components/landing/hero-product-frame.tsx
  src/components/landing/product-loop.tsx
  src/components/landing/parent-dashboard-preview.tsx
  src/components/landing/reward-loop.tsx
  src/components/landing/final-cta.tsx
  src/app/_landing.css

MODIFY:
  src/components/landing/hero.tsx           (rewrite body)
  src/components/landing/samen-modus.tsx    (rewrite body)
  src/components/landing/pricing.tsx        (2 tiers)
  src/components/landing/faq.tsx            (no code change, but messages drop item 5)
  src/app/page.tsx                          (reorder + new imports)
  src/app/globals.css                       (remove `@import "./_landing.css"` line)
  src/messages/nl-NL.json                   (remove + add + modify keys)
  src/messages/nl-BE.json                   (cleanup overrides for removed namespaces)
```

## Acceptance checklist

- [ ] `/` renders 10 sections in the order listed in §"Section order".
- [ ] Mascot SVG visible in hero right column.
- [ ] Pricing shows exactly 2 cards; "Voordeligst" badge on yearly only.
- [ ] FeatureGrid renders 3 columns at md+, single column on mobile.
- [ ] ProgressChartCard shows mascot avatar + 4 progress rows with horizontal bars.
- [ ] SubscribeWidget email input + Start gratis link routes to `/signup`.
- [ ] All BE→NL region switching still works on every section.
- [ ] `npm run build` clean, `npm test` 14/14, `npm run test:e2e` 1/1, Lighthouse ≥ 0.9 perf / ≥ 0.95 a11y.
- [ ] No unused `_landing.css` imports.
- [ ] Visual sanity check vs `landing.png` at 1280px + 375px.
