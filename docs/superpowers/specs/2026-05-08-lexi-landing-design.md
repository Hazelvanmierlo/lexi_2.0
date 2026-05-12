# Lexi.kids — Landing Page (`/`) Design

**Date:** 2026-05-08
**Phase:** 2 of the Lexi.kids build (per `CLAUDE.md` §"First prompt to the user")
**Scope:** Production port of the full v3 marketing landing — 12 sections + nav + footer + region picker — into the Next.js scaffold from Phase 1.
**Source of truth:**
- Visual design: `design_handoff/design/Lexi.kids v3.html`
- Component reference: `design_handoff/design/src/v3/Landing.v3.jsx` and `design_handoff/design/src/v3/Nav.v3.jsx`
- Spec: `design_handoff/README.md` §6 (tokens), §7.1 (page-by-page), §9 (region)
- Standing rules: `CLAUDE.md` (repo root)

## Goal

Ship a server-rendered, region-aware Dutch marketing landing page at `/` that:

1. Renders pixel-close to `design_handoff/design/Lexi.kids v3.html` at 1280px and 375px widths.
2. Switches between `nl-NL` and `nl-BE` via the nav region picker — strings, flag, curriculum framework (SEO vs ZILL), and class-label terminology (groep vs leerjaar) all swap.
3. Sets the foundation for `next-intl`-based localization across the rest of the product (auth, dashboard, kid surfaces, shop).
4. Hits Lighthouse Performance ≥ 90 and Accessibility ≥ 95 on `/`.

## Non-goals (deferred to later phases)

- `/signup`, `/probeer`, `/shop`, `/ouder`, `/kind`, `/admin/*` — Phase 3+. Hero and footer CTAs link to the future URLs (which will 404 until those phases ship).
- Real testimonials or user counts — placeholder "in beta — eerste gezinnen" copy from prototype is shipped as-is.
- Hero variants `direct` and `play` — only `samen` ships per `design_handoff/README.md` §7.1.
- Tweaks panel — design-time only, dropped per `CLAUDE.md` §Translating the prototype.
- PostHog event wiring — its own dedicated analytics phase.
- Framer Motion or any animation library — pure CSS keyframes only.
- BE URL prefix (`/be/...`) — single canonical URL with cookie-based locale; BE prefix can be added later if Belgian SEO demands it.

## Architecture

A single server-rendered route at `src/app/page.tsx` composes 12 section components. Locale (`nl-NL` | `nl-BE`) is read per-request from a cookie via `next-intl` middleware; all copy and region-conditional values flow from the locale to the section components as props.

The only client islands are:
- `<RegionPicker>` in the nav — dropdown + form-action that writes the locale cookie and triggers `revalidatePath('/')`.
- `<Faq>` accordion — Radix UI primitive (Radix is already approved in `CLAUDE.md` §Stack).

Everything else is HTML rendered on the server. No client hydration of the static sections, satisfying `CLAUDE.md` §House rules #6 ("Server-render the marketing site").

## Decisions locked in (with rationale)

| Decision | Choice | Why |
|---|---|---|
| Coverage | Full landing in one phase | User's call after seeing the three scoping options. |
| Hero variant | `samen` only | `design_handoff/README.md` §7.1: "Ship samen — it's the differentiator vs Squla." |
| New deps | `next-intl`, `lucide-react`, `@radix-ui/react-accordion` | next-intl required by `CLAUDE.md` §Stack; lucide-react required by §House rule #3 (replace prototype emojis); Radix accordion is the FAQ primitive per §Stack. |
| Animation | Pure CSS keyframes | User chose option 2 in brainstorming. ProductLoop becomes a 3-frame fade sequence; RewardLoop uses a CSS animation pipeline. |
| i18n routing | Cookie-based, no URL prefix | Single canonical URL for shareable links and beta SEO. Cookie: `lexi-locale`. |
| PostHog | Deferred | Its own phase covering events across all surfaces. |
| Testimonials | Prototype placeholder copy | `design_handoff/README.md` §7.1: "Do not invent user counts." Marked with TODO comment in code for swap when real testimonials arrive. |
| Future CTAs | Real URLs even if they 404 | `/signup`, `/probeer`, `/shop` will exist soon; better than placeholder pages. |

## File structure

```
src/
├── app/
│   ├── layout.tsx                        # MODIFY: wrap children with NextIntlClientProvider
│   ├── page.tsx                          # MODIFY: replace placeholder with composed sections
│   └── _landing.css                      # NEW: ProductLoop + RewardLoop keyframes
├── components/
│   ├── nav/
│   │   ├── nav.tsx                       # NEW: server component, top-level shell
│   │   ├── region-picker.tsx             # NEW: "use client", form-action dropdown
│   │   └── flag.tsx                      # NEW: SVG flag (NL / BE), no external image
│   ├── landing/
│   │   ├── hero.tsx                      # NEW: samen variant
│   │   ├── hero-product-frame.tsx        # NEW: live-question UI to the right of the hero
│   │   ├── product-loop.tsx              # NEW: 3-frame CSS-animated strip
│   │   ├── samen-modus.tsx               # NEW: parent-phone + kid-tablet pairing
│   │   ├── reward-loop.tsx               # NEW: coins → avatar → goodies
│   │   ├── subjects.tsx                  # NEW: 5-subject grid, region-aware
│   │   ├── seo-proof.tsx                 # NEW: SEO leerlijn (NL) / ZILL (BE)
│   │   ├── parent-dashboard-preview.tsx  # NEW: warm "zondagavond op de bank"
│   │   ├── trust.tsx                     # NEW: 3 placeholder testimonials
│   │   ├── pricing.tsx                   # NEW: 3 tier cards
│   │   ├── faq.tsx                       # NEW: "use client", Radix accordion
│   │   ├── final-cta.tsx                 # NEW
│   │   └── footer.tsx                    # NEW
│   └── ui/
│       ├── section-intro.tsx             # NEW: eyebrow / title / lead helper
│       └── btn.tsx                       # NEW: primary / ghost button atoms
├── i18n/
│   ├── request.ts                        # NEW: next-intl request config
│   └── locale-cookie.ts                  # NEW: get/set helpers
├── messages/
│   ├── nl-NL.json                        # NEW: all landing copy
│   └── nl-BE.json                        # NEW: BE-specific overrides; falls back to NL
└── lib/
    └── set-locale-action.ts              # NEW: server action — write cookie + revalidate
```

Each section component is small (~50–150 lines) and pure: takes locale-derived props, renders HTML. No `useState`, no effects, no internal data fetching — except the two client islands (`region-picker.tsx`, `faq.tsx`).

## Components — responsibilities

### `nav.tsx` (server)
Renders the top bar: brand mark on the left, nav links (`Producten`, `Prijzen`, `Voor scholen`, `Inloggen`), and `<RegionPicker>` on the right. Sticky on scroll. ~80 lines.

### `region-picker.tsx` ("use client")
Flag button + dropdown of two `<RegionOption>` rows. Click triggers a form action that calls the `setLocale` server action. Closed-state shows current flag; open-state shows both options with active checkmark. ~70 lines.

### `flag.tsx` (server)
Plain SVG of NL or BE flag. Two exports (`<NlFlag />`, `<BeFlag />`). Replaces prototype's emoji `🇳🇱`/`🇧🇪` per `CLAUDE.md` §House rule #3. ~30 lines each.

### `hero.tsx` (server)
Two-column layout. Left: kicker pill (flag + tagline), h1 (Bricolage Grotesque, `clamp(38px, 5.6vw, 64px)`), subhead, two CTAs (`Start 14 dagen gratis` primary → `/signup`; `Probeer een vraag` ghost → `/probeer`), price snippet ("vanaf €11,95/mo"), trust bullets ("geen creditcard", "per maand opzegbaar", "hele gezin"). Right: `<HeroProductFrame />`. Region-aware: groep/leerjaar terminology, NL/BE flag in kicker. ~120 lines.

### `hero-product-frame.tsx` (server)
Card showing a static example question with answer choices and a Lexi mascot. Static rendering — no animation, no real interactivity. The prototype's `<HeroProductFrame>` showed live UI; this MVP shows a single curated example, captioned "Voorbeeldvraag — Rekenen, groep 5". Faithful to design colors and spacing. ~100 lines.

### `product-loop.tsx` (server + CSS keyframes)
Three frames stacked at the same position; CSS animation cycles which one is visible (12s loop, 4s per frame, fade transitions). Frame 1: question. Frame 2: correct-answer feedback. Frame 3: coin reward. The animation respects `prefers-reduced-motion: reduce` (per `CLAUDE.md` §House rule #9 — falls back to showing all three side-by-side). ~90 lines.

### `samen-modus.tsx` (server)
The differentiator section. Two-up illustration: parent phone on the left ("Vraag uitleggen"), kid tablet on the right ("Antwoord geven"). SVG-based illustration — no external image asset. Copy explains the parent-kid pairing. ~110 lines.

### `reward-loop.tsx` (server + CSS keyframes)
Three-step horizontal flow: coins icon → avatar item icon → physical goodie icon. Subtle staggered fade-in on scroll (using CSS `@keyframes` + `animation-delay`, no JS observer). ~80 lines.

### `subjects.tsx` (server)
Five-tile grid: Rekenen, Taal, Lezen, Wereld, Engels. Each tile uses a different subject color from the palette (`teal`, `sun`, `plum`, `ok`, `primary`). Region-aware text: "Voor groep 1 t/m 8" (NL) / "Voor leerjaar 1 t/m 6" (BE). ~70 lines.

### `seo-proof.tsx` (server)
Region-conditional. NL: "SEO leerlijn 2026" framing with parent-benefit copy ("Je kind oefent precies wat de juf volgende week toetst") and a row-by-row breakdown by subject. BE: "ZILL" framing. Same component, different message keys. ~120 lines.

### `parent-dashboard-preview.tsx` (server)
Warm full-width card mocking the parent dashboard with a sample gespreksstarter. SVG-illustrated, not a real screenshot. ~90 lines.

### `trust.tsx` (server)
Three testimonial cards with placeholder copy from `design_handoff/design/src/v3/Landing.v3.jsx` `TrustV3` (lines 603–649). Heading: "in beta — eerste gezinnen". TODO comment in source flags these for replacement when real testimonials arrive. ~70 lines.

### `pricing.tsx` (server)
Three cards: Maandelijks (€11,95), Jaarlijks (€119, "besparing" badge), Gezinsabonnement (€19,95, "max 4 kinderen"). CTAs route to `/signup?plan=monthly`, `?plan=yearly`, `?plan=family` respectively. ~110 lines.

### `faq.tsx` ("use client")
Six accordion items via `@radix-ui/react-accordion`. Region-aware: copy mentions SEO/ZILL and groep/leerjaar based on locale. ~90 lines.

### `final-cta.tsx` (server)
One full-width banner with a single big CTA → `/signup`, plus a smaller "Probeer eerst een vraag" ghost link → `/probeer`. ~50 lines.

### `footer.tsx` (server)
Four-column footer: Producten, Voor ouders, Bedrijf, Juridisch. Region-aware company line (`Lexi.kids B.V. — Amsterdam` for NL; `Lexi.kids — Antwerpen` for BE). All sub-links point at TBD URLs that 404 until later phases. ~80 lines.

### `section-intro.tsx` (server)
Helper for the eyebrow + h2 + lead pattern shared by 6+ sections. Props: `eyebrow`, `title`, `lead`, `center?`. ~30 lines.

### `btn.tsx` (server)
`<PrimaryButton>` and `<GhostButton>` atoms. Both render as `<a>` if `href` prop given, `<button>` otherwise. Tailwind classes only — translates the prototype's `btnV3` inline-style object (`design_handoff/design/src/v3/Landing.v3.jsx:227`) to utility classes. ~40 lines.

## Data flow

1. Request → `src/i18n/request.ts` (next-intl request handler) → reads `lexi-locale` cookie via `cookies()` → falls back to `nl-NL` if absent. No middleware needed because we're not using URL-prefix locales.
2. `request.ts` loads `src/messages/<locale>.json` for the resolved locale.
3. `src/app/layout.tsx` → wraps children with `<NextIntlClientProvider>` so client islands (RegionPicker, FAQ) can read translations too.
4. `src/app/page.tsx` (server) → calls `useTranslations()` and passes localized strings + locale-derived values (groep vs leerjaar, NL/BE flag, SEO vs ZILL framing) down to each section component.
5. User clicks a flag in `<RegionPicker>` → `<form action={setLocale}>` → server action writes `lexi-locale` cookie + `revalidatePath('/')` → page re-renders with new locale.

No region state in React. The cookie is the single source of truth.

## Locale message contract (`src/messages/<locale>.json`)

Top-level keys mirror the section components:

```json
{
  "nav": { "products": "...", "pricing": "...", ... },
  "hero": { "kicker": "...", "title": "...", "subhead": "...", ... },
  "productLoop": { ... },
  "samenModus": { ... },
  "rewardLoop": { ... },
  "subjects": { "title": "...", "items": { "rekenen": "...", ... } },
  "seoProof": { ... },
  "parentDashboard": { ... },
  "trust": { "heading": "in beta — eerste gezinnen", "testimonials": [ ... ] },
  "pricing": { ... },
  "faq": { "items": [ /* 6 entries: { "q": "...", "a": "..." } */ ] },
  "finalCta": { ... },
  "footer": { ... },
  "common": {
    "groep": "groep",        // BE override: "leerjaar"
    "groepRange": "1 t/m 8", // BE override: "1 t/m 6"
    "curriculum": "SEO leerlijn 2026", // BE override: "ZILL"
    "company": "Lexi.kids B.V. — Amsterdam"  // BE override: "Lexi.kids — Antwerpen"
  }
}
```

`nl-BE.json` only contains keys that differ from `nl-NL.json`; next-intl's fallback chain handles the rest. Per `CLAUDE.md` §House rule #1: "If a string is missing in nl-BE, fall back to nl-NL."

## Error handling

- Cookie present but invalid (e.g., `nl-FR`) → middleware ignores, falls back to `nl-NL`.
- next-intl message key missing → next-intl logs to dev console and renders the key string. Dev catches; production gets the same fallback.
- Server action `setLocale` called with invalid locale → returns silently without writing cookie. The dropdown only emits valid locales, so this is a defense-in-depth check.
- All section components receive *only* their messages namespace via `useTranslations('hero')`-style scoped hooks — a missing key in one section can't crash an unrelated one.

## Testing

This is the first sub-project that ships real features, so it's also where the test infra lands.

### Vitest (unit)
- `src/i18n/locale-cookie.test.ts` — cookie get/set, invalid-locale fallback, default to nl-NL.
- `src/components/landing/section-intro.test.tsx` — renders eyebrow/title/lead correctly; respects `center` prop.
- `src/lib/set-locale-action.test.ts` — writes cookie, calls revalidatePath, ignores invalid input.

Coverage target: every helper in `src/i18n/`, `src/lib/`. Section components are tested via Playwright, not unit tests.

### Playwright (E2E happy path)
One spec file: `tests/e2e/landing.spec.ts`. Steps:
1. Navigate to `/`.
2. Assert "groep 1 t/m 8" copy is visible (NL default).
3. Open RegionPicker, click "België".
4. Assert "leerjaar 1 t/m 6" copy is now visible.
5. Click hero "Start 14 dagen gratis" CTA. Assert URL is `/signup` (will 404 — that's OK; we're testing routing, not the destination).
6. Open the FAQ — assert at least one accordion item expands.

Run command: `npm run test:e2e`.

### Lighthouse CI
- Tool: `@lhci/cli` (devDep).
- Local script: `npm run lighthouse` runs against `http://localhost:3000/` after `npm run build && npm run start`.
- Gates: Performance ≥ 90, Accessibility ≥ 95 (per `CLAUDE.md` §What done looks like).
- CI integration deferred until GitHub Actions exists.

### Visual regression (manual)
After build succeeds, open `http://localhost:3000` at 1280px and 375px widths and compare side-by-side with `design_handoff/design/Lexi.kids v3.html` open in another tab. Documented in the implementation plan as a final-task checklist.

## Acceptance checklist

- [ ] All 12 sections render in order on `/` matching the v3 prototype at 1280px and 375px.
- [ ] Region picker switches NL ↔ BE; copy in hero, subjects, seo-proof, footer all updates.
- [ ] Locale persists across reloads via `lexi-locale` cookie.
- [ ] All hero, pricing, and final CTAs route to `/signup` (or `/probeer` for the ghost button).
- [ ] FAQ accordion items expand/collapse with keyboard and screen reader.
- [ ] No emoji used as UI — flags are SVG, decorative icons are Lucide.
- [ ] `prefers-reduced-motion: reduce` disables ProductLoop and RewardLoop animations.
- [ ] Vitest suite passes.
- [ ] Playwright happy-path spec passes.
- [ ] `npm run build` succeeds with no TypeScript errors.
- [ ] Lighthouse Performance ≥ 90 and Accessibility ≥ 95 on `/` (run locally).
- [ ] No emojis or English fallback strings in source — all copy in `src/messages/<locale>.json`.

## Open questions for later phases (not blocking this one)

- **Real testimonials.** When does the product team have three quotes worth shipping? Until then, the placeholder copy is in source with a TODO comment.
- **`/be` URL prefix for SEO.** If Belgian organic traffic suffers, revisit. Easy refactor: add next-intl's `localePrefix: 'as-needed'` to middleware, regenerate sitemaps.
- **Hero variants `direct` and `play`.** A/B test once we have analytics + a sample size. Variants left as comments inside `hero.tsx` for quick reactivation.
- **Animation upgrade path.** If pure CSS feels flat in user testing, Framer Motion stays the documented next step. ProductLoop and RewardLoop are the candidates.
