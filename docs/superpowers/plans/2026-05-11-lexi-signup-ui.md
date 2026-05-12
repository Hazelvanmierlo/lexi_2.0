# Lexi.kids — `/signup` UI Mock (Phase 3-UI) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]` checkboxes.

**Goal:** Build a `/signup` route as a 4-step wizard UI mock (Account → Kind → Vakken → Abonnement → Welkom) matching `Downloads/website Lexi 2.0 (1)/pages/signup.png`. No auth, no DB, no payments — pure state-machine UI.

**Architecture:** Server-rendered page chrome (Nav + BenefitsPanel + Footer); single `<SignupWizard>` client island owns step state + form state. Submitting a step advances; "Voltooien" on step 4 swaps the right column to a static `<Welcome>` view. Form state lives in `useState`, not persisted anywhere.

**Tech Stack:** Existing. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-05-11-lexi-signup-ui-design.md`
**Target visual:** `C:\Users\thoma\Downloads\website Lexi 2.0 (1)\pages\signup.png`

---

## Executor notes

- Working dir: `C:\Users\thoma\lexi_2.0`. No git commits.
- All copy via `useTranslations`. Brand name "Lexi.kids" is the only allowed hardcoded user-facing string.
- Mascot at `/avatars/bot/{kid,hero}-transparent.svg`. Use `MascotImage` atom from `@/components/ui/mascot`.
- Existing design tokens: `bg-bg`, `bg-bg-2`, `bg-card`, `text-ink`, `text-ink-2`, `border-line`, `bg-primary`, `bg-primary-soft`, `text-primary-ink`, `text-ok`, `rounded-lexi`, `rounded-lexi-lg`, `shadow-lexi`, `shadow-lexi-sm`, `font-display`, `font-sans`.

---

### Task 1: Add `signup` namespace to message files

**Files:**
- Modify: `src/messages/nl-NL.json` (add `signup` block alongside existing namespaces)
- Modify: `src/messages/nl-BE.json` (add `signup` block with overrides)

- [ ] **Step 1: Read current `nl-NL.json`, then add the `signup` block at the end (before the closing `}`)**

```json
,
  "signup": {
    "title": "Aanmelden",
    "benefits": {
      "title": "14 dagen gratis proberen",
      "sub": "Daarna €11,95 per maand voor het hele gezin. Per maand opzegbaar.",
      "items": ["Adaptieve oefeningen", "Alle vakken inbegrepen", "Ouder-dashboard", "Geen advertenties"]
    },
    "steps": [
      { "label": "Account",    "title": "Maak je ouder-account",       "sub": "Zo kun je de voortgang van je kind volgen." },
      { "label": "Je kind",    "title": "Vertel ons over je kind",     "sub": "We passen Lexi aan op het niveau." },
      { "label": "Vakken",     "title": "Welke vakken wil je volgen?", "sub": "Vink uit wat niet hoeft. Je kan dit later aanpassen." },
      { "label": "Abonnement", "title": "Kies een abonnement",         "sub": "14 dagen gratis. Daarna afgeschreven, opzegbaar per maand." }
    ],
    "actions": { "back": "Vorige", "cancel": "Annuleren", "next": "Volgende", "finish": "Voltooien" },
    "account": {
      "fields": {
        "name":     { "label": "Jouw naam",     "placeholder": "Marieke de Vries" },
        "email":    { "label": "E-mailadres",   "placeholder": "marieke@voorbeeld.nl" },
        "password": { "label": "Wachtwoord",    "placeholder": "Minimaal 8 tekens" }
      }
    },
    "kid": {
      "fields": {
        "name":  { "label": "Naam van je kind", "placeholder": "Liv" },
        "year":  { "label": "Geboortejaar" },
        "groep": { "label": "Groep" }
      }
    },
    "subjects": {
      "items": {
        "rekenen": "Rekenen",
        "taal":    "Taal",
        "lezen":   "Lezen",
        "wereld":  "Wereldoriëntatie",
        "engels":  "Engels"
      }
    },
    "subscription": {
      "tiers": {
        "monthly": { "name": "Maandelijks", "price": "€11,95", "interval": "per maand", "body": "Per maand opzegbaar." },
        "yearly":  { "name": "Jaarlijks",   "price": "€119",   "interval": "per jaar",  "body": "2 maanden gratis." }
      },
      "badge": "Voordeligst"
    },
    "welcome": {
      "title": "Welkom bij Lexi.kids!",
      "sub":   "Je account is aangemaakt. Open je dashboard om te beginnen.",
      "cta":   "Open je dashboard"
    }
  }
```

(Place inside the existing top-level JSON object — comma-prefixed since it goes after `"faq": { ... }`. After this edit, the file should still be valid JSON.)

- [ ] **Step 2: Add BE override to `nl-BE.json`**

Add to the existing top-level JSON object (preserve everything that's there):

```json
,
  "signup": {
    "kid": {
      "fields": {
        "groep": { "label": "Leerjaar" }
      }
    }
  }
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: clean (no component references the new keys yet).

---

### Task 2: UI atoms — Input, Select, CheckboxCard, RadioCard

**Files:**
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/select.tsx`
- Create: `src/components/ui/checkbox-card.tsx`
- Create: `src/components/ui/radio-card.tsx`

- [ ] **Step 1: Create `src/components/ui/input.tsx`**

```tsx
import type { ComponentPropsWithoutRef } from "react";

type Props = ComponentPropsWithoutRef<"input"> & { label: string };

export function Input({ label, id, className, ...rest }: Props) {
  const inputId = id ?? `input-${rest.name ?? Math.random().toString(36).slice(2)}`;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={inputId}
        {...rest}
        className="mt-1 w-full rounded-lexi border border-line bg-card px-3 py-2 text-ink placeholder:text-ink-2 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
      />
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/ui/select.tsx`**

```tsx
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = ComponentPropsWithoutRef<"select"> & {
  label: string;
  children: ReactNode;
};

export function Select({ label, id, className, children, ...rest }: Props) {
  const selectId = id ?? `select-${rest.name ?? Math.random().toString(36).slice(2)}`;
  return (
    <div className={className}>
      <label htmlFor={selectId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={selectId}
        {...rest}
        className="mt-1 w-full rounded-lexi border border-line bg-card px-3 py-2 text-ink focus:outline-2 focus:outline-offset-2 focus:outline-primary"
      >
        {children}
      </select>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/ui/checkbox-card.tsx`**

```tsx
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = ComponentPropsWithoutRef<"input"> & {
  label: string;
  description?: ReactNode;
};

export function CheckboxCard({ label, description, id, className, ...rest }: Props) {
  const cid = id ?? `cb-${rest.name ?? Math.random().toString(36).slice(2)}`;
  return (
    <label
      htmlFor={cid}
      className={`flex cursor-pointer items-start gap-3 rounded-lexi border border-line bg-card p-4 hover:bg-bg-2 has-[:checked]:border-primary has-[:checked]:bg-primary-soft ${className ?? ""}`}
    >
      <input type="checkbox" id={cid} {...rest} className="mt-0.5 h-4 w-4 accent-primary" />
      <span className="flex-1">
        <span className="block font-medium text-ink">{label}</span>
        {description && <span className="mt-1 block text-sm text-ink-2">{description}</span>}
      </span>
    </label>
  );
}
```

- [ ] **Step 4: Create `src/components/ui/radio-card.tsx`**

```tsx
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = ComponentPropsWithoutRef<"input"> & {
  label: string;
  description?: ReactNode;
  badge?: string;
};

export function RadioCard({ label, description, badge, id, className, ...rest }: Props) {
  const rid = id ?? `r-${rest.name}-${rest.value}`;
  return (
    <label
      htmlFor={rid}
      className={`flex cursor-pointer items-start gap-3 rounded-lexi-lg border p-5 has-[:checked]:border-primary has-[:checked]:bg-primary-soft ${className ?? "border-line bg-card"}`}
    >
      <input type="radio" id={rid} {...rest} className="mt-1 h-4 w-4 accent-primary" />
      <span className="flex-1">
        <span className="flex items-center gap-2">
          <span className="font-display text-lg font-bold text-ink">{label}</span>
          {badge && (
            <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
              {badge}
            </span>
          )}
        </span>
        {description && <span className="mt-1 block text-sm text-ink-2">{description}</span>}
      </span>
    </label>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

---

### Task 3: BenefitsPanel (server)

**Files:**
- Create: `src/components/signup/benefits-panel.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { MascotImage } from "@/components/ui/mascot";

export function BenefitsPanel() {
  const t = useTranslations("signup.benefits");
  const items = t.raw("items") as string[];
  return (
    <aside className="md:sticky md:top-24 md:self-start">
      <div className="rounded-lexi-lg border border-line bg-card p-8 shadow-lexi-sm">
        <div className="mx-auto flex w-fit">
          <MascotImage style="bot" age="kid" size={200} decorative className="h-auto w-[200px]" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-ink">
          {t("title")}
        </h2>
        <p className="mt-2 text-ink-2">{t("sub")}</p>
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-ink">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

---

### Task 4: StepIndicator (client)

**Files:**
- Create: `src/components/signup/step-indicator.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

type Props = { activeStep: 1 | 2 | 3 | 4 };

export function StepIndicator({ activeStep }: Props) {
  const t = useTranslations("signup.steps");
  const labels = [t("0.label"), t("1.label"), t("2.label"), t("3.label")];
  return (
    <ol className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-wider">
      {labels.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === activeStep;
        const isDone = stepNum < activeStep;
        return (
          <li
            key={label}
            className={`flex items-center gap-2 ${
              isActive ? "text-primary-ink font-semibold"
                : isDone ? "text-ok"
                : "text-ink-3"
            }`}
          >
            {isDone ? (
              <Check className="h-3 w-3" />
            ) : (
              <span className="font-mono">{String(stepNum).padStart(2, "0")}</span>
            )}
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

---

### Task 5: Step content components

**Files:**
- Create: `src/components/signup/step-account.tsx`
- Create: `src/components/signup/step-kid.tsx`
- Create: `src/components/signup/step-subjects.tsx`
- Create: `src/components/signup/step-subscription.tsx`
- Create: `src/components/signup/welcome.tsx`

All five components share a `FormState` type for the wizard's form data. Each step receives `{ form, setForm }` props.

- [ ] **Step 1: Create the FormState type as a shared module first**

`src/components/signup/form-state.ts`:

```ts
export type FormState = {
  name: string;
  email: string;
  password: string;
  kidName: string;
  kidYear: string;
  kidGroep: string;
  subjects: { rekenen: boolean; taal: boolean; lezen: boolean; wereld: boolean; engels: boolean };
  plan: "monthly" | "yearly";
};

export const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  password: "",
  kidName: "",
  kidYear: "",
  kidGroep: "",
  subjects: { rekenen: true, taal: true, lezen: true, wereld: true, engels: true },
  plan: "monthly",
};
```

- [ ] **Step 2: Create `step-account.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import type { FormState } from "./form-state";

type Props = { form: FormState; setForm: (next: FormState) => void };

export function StepAccount({ form, setForm }: Props) {
  const f = useTranslations("signup.account.fields");
  return (
    <div className="space-y-4">
      <Input
        name="name"
        type="text"
        required
        label={f("name.label")}
        placeholder={f("name.placeholder")}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        name="email"
        type="email"
        required
        label={f("email.label")}
        placeholder={f("email.placeholder")}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <Input
        name="password"
        type="password"
        required
        minLength={8}
        label={f("password.label")}
        placeholder={f("password.placeholder")}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
    </div>
  );
}
```

- [ ] **Step 3: Create `step-kid.tsx`**

```tsx
"use client";

import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { FormState } from "./form-state";

type Props = { form: FormState; setForm: (next: FormState) => void };

export function StepKid({ form, setForm }: Props) {
  const f = useTranslations("signup.kid.fields");
  const locale = useLocale();
  const maxGroep = locale === "nl-BE" ? 6 : 8;
  // Current year is 2026; ages 5-12 → birth years 2014-2021
  const years = Array.from({ length: 8 }, (_, i) => 2021 - i);
  const groepRange = Array.from({ length: maxGroep }, (_, i) => i + 1);
  return (
    <div className="space-y-4">
      <Input
        name="kidName"
        type="text"
        required
        label={f("name.label")}
        placeholder={f("name.placeholder")}
        value={form.kidName}
        onChange={(e) => setForm({ ...form, kidName: e.target.value })}
      />
      <Select
        name="kidYear"
        required
        label={f("year.label")}
        value={form.kidYear}
        onChange={(e) => setForm({ ...form, kidYear: e.target.value })}
      >
        <option value="">—</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </Select>
      <Select
        name="kidGroep"
        required
        label={f("groep.label")}
        value={form.kidGroep}
        onChange={(e) => setForm({ ...form, kidGroep: e.target.value })}
      >
        <option value="">—</option>
        {groepRange.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </Select>
    </div>
  );
}
```

- [ ] **Step 4: Create `step-subjects.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { CheckboxCard } from "@/components/ui/checkbox-card";
import type { FormState } from "./form-state";

type Props = { form: FormState; setForm: (next: FormState) => void };

const KEYS = ["rekenen", "taal", "lezen", "wereld", "engels"] as const;
type SubjectKey = (typeof KEYS)[number];

export function StepSubjects({ form, setForm }: Props) {
  const t = useTranslations("signup.subjects.items");
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {KEYS.map((k) => (
        <li key={k}>
          <CheckboxCard
            name={`subject-${k}`}
            label={t(k)}
            checked={form.subjects[k]}
            onChange={(e) =>
              setForm({
                ...form,
                subjects: { ...form.subjects, [k]: e.target.checked } as FormState["subjects"],
              })
            }
          />
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 5: Create `step-subscription.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { RadioCard } from "@/components/ui/radio-card";
import type { FormState } from "./form-state";

type Props = { form: FormState; setForm: (next: FormState) => void };

const PLANS = ["monthly", "yearly"] as const;

export function StepSubscription({ form, setForm }: Props) {
  const tier = useTranslations("signup.subscription.tiers");
  const badge = useTranslations("signup.subscription").raw("badge") as string;
  return (
    <ul className="space-y-4">
      {PLANS.map((p) => (
        <li key={p}>
          <RadioCard
            name="plan"
            value={p}
            checked={form.plan === p}
            onChange={() => setForm({ ...form, plan: p })}
            label={`${tier(`${p}.name`)} — ${tier(`${p}.price`)} ${tier(`${p}.interval`)}`}
            description={tier(`${p}.body`)}
            badge={p === "yearly" ? badge : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 6: Create `welcome.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Btn } from "@/components/ui/btn";
import { MascotImage } from "@/components/ui/mascot";

export function Welcome() {
  const t = useTranslations("signup.welcome");
  return (
    <div className="text-center">
      <div className="mx-auto flex w-fit">
        <MascotImage style="bot" age="hero" size={280} decorative className="h-auto w-[280px]" />
      </div>
      <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink">{t("title")}</h2>
      <p className="mt-3 text-ink-2">{t("sub")}</p>
      <div className="mt-8">
        <Btn href="/ouder">{t("cta")}</Btn>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Verify build**

```bash
npm run build
```

---

### Task 6: SignupWizard (client orchestrator)

**Files:**
- Create: `src/components/signup/signup-wizard.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Btn } from "@/components/ui/btn";
import { StepIndicator } from "./step-indicator";
import { StepAccount } from "./step-account";
import { StepKid } from "./step-kid";
import { StepSubjects } from "./step-subjects";
import { StepSubscription } from "./step-subscription";
import { Welcome } from "./welcome";
import { INITIAL_FORM, type FormState } from "./form-state";

type Step = 1 | 2 | 3 | 4 | "welcome";

export function SignupWizard() {
  const search = useSearchParams();
  const router = useRouter();
  const steps = useTranslations("signup.steps");
  const actions = useTranslations("signup.actions");

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  // Prefill email from ?email= query param on mount
  useEffect(() => {
    const email = search.get("email");
    if (email) setForm((f) => ({ ...f, email }));
  }, [search]);

  if (step === "welcome") {
    return (
      <div className="rounded-lexi-lg border border-line bg-card p-8 shadow-lexi md:p-12">
        <Welcome />
      </div>
    );
  }

  const idx = step - 1;
  const isLast = step === 4;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLast) setStep("welcome");
    else setStep((step + 1) as Step);
  }

  function onBack() {
    if (step === 1) router.push("/");
    else setStep((step - 1) as Step);
  }

  return (
    <div className="rounded-lexi-lg border border-line bg-card p-8 shadow-lexi md:p-12">
      <StepIndicator activeStep={step} />
      <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
        {steps(`${idx}.title`)}
      </h2>
      <p className="mt-2 text-ink-2">{steps(`${idx}.sub`)}</p>
      <form onSubmit={onSubmit} className="mt-6">
        {step === 1 && <StepAccount form={form} setForm={setForm} />}
        {step === 2 && <StepKid form={form} setForm={setForm} />}
        {step === 3 && <StepSubjects form={form} setForm={setForm} />}
        {step === 4 && <StepSubscription form={form} setForm={setForm} />}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lexi border border-line bg-card px-4 py-2 text-sm text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {step === 1 ? actions("cancel") : actions("back")}
          </button>
          <Btn>{isLast ? actions("finish") : actions("next")}</Btn>
        </div>
      </form>
    </div>
  );
}
```

Note: `<Btn>` without `href` renders a `<button>`. With no explicit `type` it defaults to `type="submit"` inside the form, which triggers `onSubmit`.

- [ ] **Step 2: Verify build**

```bash
npm run build
```

---

### Task 7: `/signup` route page

**Files:**
- Create: `src/app/signup/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { Nav } from "@/components/nav/nav";
import { Footer } from "@/components/landing/footer";
import { BenefitsPanel } from "@/components/signup/benefits-panel";
import { SignupWizard } from "@/components/signup/signup-wizard";

export default function SignupPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="bg-bg-2 px-5 py-12 md:py-20">
        <div className="mx-auto grid max-w-[1100px] gap-8 md:grid-cols-[1fr_1.4fr]">
          <BenefitsPanel />
          <SignupWizard />
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: route table now includes `/signup`.

---

### Task 8: Playwright E2E for signup

**Files:**
- Create: `tests/e2e/signup.spec.ts`

- [ ] **Step 1: Create the spec**

```ts
import { test, expect } from "@playwright/test";

test("signup wizard — step 1 → step 2", async ({ page }) => {
  await page.goto("/signup");

  // Step 1 visible: account fields
  await expect(page.getByLabel(/Jouw naam/)).toBeVisible();
  await expect(page.getByLabel(/E-mailadres/)).toBeVisible();
  await expect(page.getByLabel(/Wachtwoord/)).toBeVisible();

  // Fill step 1
  await page.getByLabel(/Jouw naam/).fill("Marieke");
  await page.getByLabel(/E-mailadres/).fill("marieke@example.nl");
  await page.getByLabel(/Wachtwoord/).fill("hunter2hunter2");

  // Click Volgende → step 2
  await page.getByRole("button", { name: /Volgende/ }).click();

  // Step 2 visible: kid name field
  await expect(page.getByLabel(/Naam van je kind/)).toBeVisible();
});

test("signup — ?email= query prefills the email input", async ({ page }) => {
  await page.goto("/signup?email=prefilled%40example.nl");
  await expect(page.getByLabel(/E-mailadres/)).toHaveValue("prefilled@example.nl");
});
```

- [ ] **Step 2: Run the test**

```bash
npm run test:e2e
```

Expected: 3 passing (existing landing test + 2 new signup tests).

---

### Task 9: Final acceptance

**Files:** none.

- [ ] **Step 1: Build**

```bash
npm run build
```

Expected: clean. `/` and `/signup` both in route table.

- [ ] **Step 2: Unit tests**

```bash
npm test
```

Expected: 14/14 still (no test files changed).

- [ ] **Step 3: E2E**

```bash
npm run test:e2e
```

Expected: 3 passing.

- [ ] **Step 4: Lighthouse on `/signup`**

Modify `.lighthouserc.cjs` collect.url temporarily to include `/signup` (additive), then run:

```bash
npm run lighthouse
```

Expected: both `/` and `/signup` pass perf ≥ 0.9 and a11y ≥ 0.95 (median of 3 runs).

After verifying, revert the lighthouserc change (we don't want every Lighthouse run to test both pages forever — keep `/` as the canonical baseline). Actually, scratch that — leaving both URLs in is fine; it's strictly more coverage. Keep the change.

- [ ] **Step 5: Cleanup**

```bash
taskkill //F //IM node.exe
```
(PowerShell: `Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force`)

- [ ] **Step 6: STOP — controller continues to next phase**

Report Status. Do not git commit.

---

## Self-review notes

- **Spec coverage:** Every component in the spec has a task — UI atoms T2, BenefitsPanel T3, StepIndicator T4, step components T5, SignupWizard T6, page T7. Messages T1. E2E T8. Acceptance T9.
- **Placeholders:** None. All code shown.
- **Type consistency:** `FormState` defined in T5/Step1; consumed by T5/2-5 and T6. Step type `1 | 2 | 3 | 4 | "welcome"` defined locally in `signup-wizard.tsx`. `StepIndicator` props prop type matches: `activeStep: 1|2|3|4`. The wizard guards with `if (step === "welcome")` before passing to StepIndicator so the type narrows. Verified.
