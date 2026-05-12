# Lexi.kids — `/signup` Wizard UI Mock (Phase 3-UI) Design

**Date:** 2026-05-11
**Phase:** 3-UI — visual-only signup wizard. No real auth, DB, or payments. Backend phases come later.
**Target visual:** `Downloads/website Lexi 2.0 (1)/pages/signup.png`
**Mascot assets:** already in `public/avatars/`

## Goal

A `/signup` route that visually matches `signup.png`: left column with mascot + plan benefits, right column with a 4-step wizard (Account → Kind → Vakken → Abonnement). Each step shows different form fields. Submitting the last step shows a static "Welkom!" success state. No data is persisted, no auth happens — that's Phase 3-backend.

## Non-goals

- Real auth (Clerk)
- Form validation beyond browser native (`required`, `type="email"`)
- Real password hashing
- DB writes
- Stripe trial
- Server actions for form submit (final phase wires these)
- Step indicator click-to-jump (sequential only)

## Architecture

`/signup/page.tsx` is a Server Component rendering: Nav (shared), the left "benefits panel" (server, just markup), and the `<SignupWizard>` client component on the right. Wizard owns step state via `useState`. URL search param `?email=…` (passed from landing SubscribeWidget) pre-fills the email field. Each step renders different inputs; "Volgende" advances; "Vorige" goes back; final "Voltooien" swaps to a success view inside the same card.

## Component tree

```
/signup/page.tsx                                  # server
  <Nav />
  <main id="main-content">
    <section> (two-column at md+)
      <BenefitsPanel />                           # server
      <SignupWizard />                            # client
    </section>
  </main>
  <Footer />
```

```
src/components/signup/
  benefits-panel.tsx     # server — mascot + heading + bullets
  signup-wizard.tsx      # client — step state, submit handlers, next/back buttons
  step-indicator.tsx     # client (since wizard passes activeStep prop) — 4-pill row
  step-account.tsx       # client — name/email/password inputs
  step-kid.tsx           # client — kid name/year/groep
  step-subjects.tsx      # client — 5 checkboxes
  step-subscription.tsx  # client — 2 radio cards (monthly/yearly)
  welcome.tsx            # server — success state inside the same card

src/components/ui/
  input.tsx              # styled <input> wrapper
  select.tsx             # styled <select> wrapper
  checkbox-card.tsx      # styled checkbox-as-card
  radio-card.tsx         # styled radio-as-card (used by step-subscription)
```

## Components — what each does

### `<BenefitsPanel>` (server)
Sticky on md+ desktop. Contents:
- `<MascotImage style="bot" age="kid" size={200} decorative />`
- h2 from `signup.benefits.title` ("14 dagen gratis proberen")
- p from `signup.benefits.sub` ("Daarna €11,95 per maand voor het hele gezin. Per maand opzegbaar.")
- ul with 4 list items from `signup.benefits.items[]` — each row has a green `<Check>` icon
- All copy via `useTranslations("signup.benefits")`

### `<SignupWizard>` ("use client")
Owns:
- `step: 1 | 2 | 3 | 4 | "welcome"` (useState, default 1 unless `?email` query implies start at step 1)
- `form: { name, email, password, kidName, kidYear, kidGroep, subjects: string[], plan }` (useState)
- Reads `useSearchParams()` for `email` query param on mount → seeds `form.email`

Renders:
- `<StepIndicator activeStep={step === "welcome" ? 4 : step} />`
- Step title h2 + sub p from `signup.steps[step - 1].{title, sub}` (skip when "welcome")
- Step body: `<StepAccount />` / `<StepKid />` / `<StepSubjects />` / `<StepSubscription />` / `<Welcome />`
- Step footer: "Annuleren" (ghost, only on step 1, links to `/`) / "Vorige" (ghost, step 2-4) + "Volgende" (primary, step 1-3) / "Voltooien" (primary, step 4)

State transitions:
- step 1-3 + "Volgende" → step++
- step 2-4 + "Vorige" → step--
- step 4 + "Voltooien" → step = "welcome"
- step 1 + "Annuleren" → router.push("/")

No validation beyond HTML5 `required` — if user clicks Volgende with empty required fields, browser blocks submit naturally because the wizard wraps each step in `<form onSubmit={advance}>`.

### `<StepIndicator>` (client)
Horizontal row of 4 pills. Each pill: `<span>` with number prefix (01-04) + label. Active pill has primary text color + underline; completed pills have `text-ok` checkmark prefix; future pills are `text-ink-3`. Reads labels from `signup.steps[i].label`.

Pills are *not* clickable in this phase — strictly sequential.

### `<StepAccount>`, `<StepKid>`, `<StepSubjects>`, `<StepSubscription>` (all client)
Pure form fragments. Take props `{ form, setForm }` where `form` and `setForm` are the wizard's state. No internal state. Each step's wrapper is a `<form id="signup-step-<n>" onSubmit={advance}>`.

- StepAccount: 3 inputs (name text, email email, password password)
- StepKid: 1 input (name) + 1 select (year, 2014-2021 = 5-12 year olds in 2026), 1 select (groep 1-8 or leerjaar 1-6 depending on locale)
- StepSubjects: 5 `<CheckboxCard>`s (rekenen, taal, lezen, wereld, engels), all default-checked
- StepSubscription: 2 `<RadioCard>`s (monthly €11,95, yearly €119 with "Voordeligst" badge), default monthly

### `<Welcome>` (server)
Static success view. Mascot (`bot/hero`, 280px), h2 ("Welkom bij Lexi.kids!"), p ("Je account is aangemaakt. Open je dashboard om te beginnen."), `<Btn href="/ouder">Open je dashboard</Btn>`. The dashboard URL will 404 — fine, it's Phase 4+ territory.

### `<Input>`, `<Select>`, `<CheckboxCard>`, `<RadioCard>` (ui atoms, new)
Pure visual wrappers around native `<input>`/`<select>`. Tailwind styling matching the rest of the design system. No formik/react-hook-form. Props: `{ label, error?, ...inputProps }`. `<CheckboxCard>` and `<RadioCard>` wrap a hidden native input + a styled `<label>` so keyboard selection and `required` validation still work.

## i18n keys (added to `nl-NL.json`)

```
signup.title (page title)
signup.benefits.title = "14 dagen gratis proberen"
signup.benefits.sub   = "Daarna €11,95 per maand voor het hele gezin. Per maand opzegbaar."
signup.benefits.items = ["Adaptieve oefeningen", "Alle vakken inbegrepen", "Ouder-dashboard", "Geen advertenties"]

signup.steps = [
  { "label": "Account",    "title": "Maak je ouder-account",         "sub": "Zo kun je de voortgang van je kind volgen." },
  { "label": "Je kind",    "title": "Vertel ons over je kind",       "sub": "We passen Lexi aan op het niveau." },
  { "label": "Vakken",     "title": "Welke vakken wil je volgen?",   "sub": "Vink uit wat niet hoeft. Je kan dit later aanpassen." },
  { "label": "Abonnement", "title": "Kies een abonnement",           "sub": "14 dagen gratis. Daarna afgeschreven, opzegbaar per maand." }
]

signup.actions = { back: "Vorige", cancel: "Annuleren", next: "Volgende", finish: "Voltooien" }

signup.account.fields = {
  name:     { label: "Jouw naam",     placeholder: "Marieke de Vries" },
  email:    { label: "E-mailadres",   placeholder: "marieke@voorbeeld.nl" },
  password: { label: "Wachtwoord",    placeholder: "Minimaal 8 tekens" }
}

signup.kid.fields = {
  name:  { label: "Naam van je kind",   placeholder: "Liv" },
  year:  { label: "Geboortejaar" },
  groep: { label: "Groep" }   // BE override: "Leerjaar"
}

signup.subjects.items = {
  rekenen: "Rekenen",
  taal:    "Taal",
  lezen:   "Lezen",
  wereld:  "Wereldoriëntatie",
  engels:  "Engels"
}

signup.subscription = {
  tiers: { 
    monthly: { name: "Maandelijks", price: "€11,95", interval: "per maand", body: "Per maand opzegbaar." },
    yearly:  { name: "Jaarlijks",   price: "€119",   interval: "per jaar",  body: "2 maanden gratis." }
  },
  badge: "Voordeligst"
}

signup.welcome = {
  title: "Welkom bij Lexi.kids!",
  sub:   "Je account is aangemaakt. Open je dashboard om te beginnen.",
  cta:   "Open je dashboard"
}
```

BE overrides: `signup.kid.fields.groep.label = "Leerjaar"`. Year/groep options computed from `common.groepRange` so they auto-adapt 1-8 (NL) ↔ 1-6 (BE).

## Data flow

1. User lands on `/signup?email=…` from SubscribeWidget.
2. `SignupWizard` mounts; `useSearchParams()` reads `email`; useState initializes `form.email` to that value.
3. User fills step 1 → click "Volgende" → submit handler validates via browser, advances `step` state.
4. Repeats for steps 2-4. Form state accumulates in `form`.
5. Step 4 + "Voltooien" → `step = "welcome"`. Form state is *not* persisted (no localStorage, no server action) — closing the tab loses everything. That's fine for the mock.
6. "Open je dashboard" → routes to `/ouder` (404 in this phase).

## Error handling

- Empty required fields → browser native `:invalid` styling + tooltip on submit attempt. No custom error UI.
- Invalid email → same.
- No try/catch needed — no async / network calls happen.

## Testing

- Vitest: no new unit tests. The wizard is pure state-machine glue around forms; testing useState is not productive. Re-add unit tests when real auth + form validation lands in Phase 3-backend.
- Playwright: extend `tests/e2e/landing.spec.ts` with a small additional test in a new file `tests/e2e/signup.spec.ts`:
  - Navigate `/signup`.
  - Assert step 1 form fields visible.
  - Fill name/email/password.
  - Click "Volgende".
  - Assert step 2 visible (kid name field).
  - Done. Don't walk through all 4 steps — that's not the value here.
- Lighthouse: run once against `/signup`, target ≥0.9 perf / ≥0.95 a11y.

## Files

```
ADD:
  src/app/signup/page.tsx
  src/components/signup/benefits-panel.tsx
  src/components/signup/signup-wizard.tsx
  src/components/signup/step-indicator.tsx
  src/components/signup/step-account.tsx
  src/components/signup/step-kid.tsx
  src/components/signup/step-subjects.tsx
  src/components/signup/step-subscription.tsx
  src/components/signup/welcome.tsx
  src/components/ui/input.tsx
  src/components/ui/select.tsx
  src/components/ui/checkbox-card.tsx
  src/components/ui/radio-card.tsx
  tests/e2e/signup.spec.ts

MODIFY:
  src/messages/nl-NL.json  (add signup namespace)
  src/messages/nl-BE.json  (signup.kid.fields.groep override)
```

## Acceptance checklist

- [ ] `/signup` renders with Nav on top, two-column body, Footer at bottom.
- [ ] Mascot visible in left column, benefits + bullets below.
- [ ] Step indicator shows 4 pills, "01 Account" active by default.
- [ ] Step 1 fields: Jouw naam / E-mailadres / Wachtwoord.
- [ ] `?email=` query param prefills email on step 1.
- [ ] Volgende advances step; Vorige goes back; Annuleren on step 1 routes to `/`.
- [ ] Step 4 + Voltooien shows Welkom view inside the same card.
- [ ] BE locale: "Leerjaar" label on step 2; groep range 1-6.
- [ ] `npm run build` clean; `npm test` 14/14; `npm run test:e2e` 2/2 (existing landing + new signup); Lighthouse ≥0.9/≥0.95 on `/signup`.
