# Lexi.kids — Landing Animation Pass (Phase 2b) Plan

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Match the landing spec more closely — animated phone mock, parent-ping card, ProductLoop (4 numbered cards), RewardLoop (3-phase cycle), FinalCTA on cream. Replaces FeatureGrid + SubscribeWidget.

**Spec:** `docs/superpowers/specs/2026-05-11-lexi-landing-animation-pass-design.md`

## Executor notes
- Working dir `C:\Users\thoma\lexi_2.0`. No git commits.
- Use existing tokens. New CSS classes go in `_landing.css` (recreate).

---

### Task 1: Token tweaks + recreate `_landing.css`

#### Step 1: `src/app/globals.css`

Update these four tokens inside `@theme { ... }`:

- `--color-primary: oklch(60% 0.16 35);` (was `oklch(58% 0.18 35)`)
- `--color-ok: oklch(58% 0.14 155);` (was `oklch(48% 0.16 155)`)
- `--color-bg: oklch(99% 0.005 95);` (was `oklch(98% 0.012 85)`)
- `--color-ink-3: oklch(55% 0.015 260);` (was `oklch(60% 0.015 260)`)

At the very end of `globals.css`, add (or re-add):
```css
@import "./_landing.css";
```

#### Step 2: Create `src/app/_landing.css`

```css
/* _landing.css — landing-only keyframes + reduced-motion gates */

@keyframes lexi-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.lexi-fade-up { animation: lexi-fade-up 300ms ease-out both; }

@media (prefers-reduced-motion: reduce) {
  .lexi-fade-up { animation: none !important; opacity: 1 !important; transform: none !important; }
}
```

#### Step 3: Build
```bash
npm run build
```

Watch: the `--color-ok` darken might regress contrast on `ProgressChartCard` delta spans. If lhci later fails, we deal with it then (the spec value is canonical).

---

### Task 2: Update messages

#### `src/messages/nl-NL.json` changes

Remove:
- `featureGrid.*` (entire namespace)
- `subscribe.*` (entire namespace)

Add (sibling to other top-level keys):

```json
"hero": {
  /* keep all existing hero keys, but ALSO add these subkeys: */
  "frame": {
    "question": "Welk getal hoort hier?",
    "options": ["1/2", "1/4", "1/3", "3/4"],
    "correctIdx": 3,
    "feedback": "Goed gedaan!",
    "reward": {
      "title": "+12 munten · Goed bezig!",
      "sub": "Nieuw avatar-onderdeel ontgrendeld."
    }
  },
  "parentPing": {
    "kicker": "Bericht voor jou",
    "body": "Sara had moeite met breuken vergelijken. Vraag haar vanavond: 'Wat is meer: 3/4 of 2/3?'"
  }
}
```

(Note: the existing `hero` namespace already has `kicker`, `title`, `subhead`, `ctaTrial`, `ctaTry`, `price`, `trust.*`. Merge in `frame` and `parentPing` without disturbing existing keys.)

```json
"productLoop": {
  "eyebrow": "Hoe het werkt",
  "title": "Zo gaat een kwartier oefenen.",
  "items": [
    { "eyebrow": "01", "title": "Vraag",  "body": "Lexi stelt een vraag op het niveau van je kind." },
    { "eyebrow": "02", "title": "Probeer", "body": "Je kind kiest of typt een antwoord. Direct feedback." },
    { "eyebrow": "03", "title": "Beloon", "body": "Munten en avatar-items voor goede antwoorden." },
    { "eyebrow": "04", "title": "Samen",  "body": "Een gespreksstarter voor jullie aan tafel." }
  ]
},
"rewardLoop": {
  "eyebrow": "Belonen",
  "title": "Munten worden échte cadeaus.",
  "lead": "Digitaal én op de mat — wat je kind verdient, kan ze ook uitgeven.",
  "phases": [
    { "title": "Munten verzamelen", "body": "Voor goede antwoorden krijgt je kind munten." },
    { "title": "Avatar-items kopen", "body": "Hoeden, diertjes, kamerstijlen voor de mascotte." },
    { "title": "Echte cadeaus", "body": "Stickers, posters, mini-werkboeken. Binnenkort." }
  ]
},
"finalCta": {
  "title": "Begin vanavond. Veertien dagen gratis.",
  "sub": "Geen creditcard. Per maand opzegbaar.",
  "ctaTrial": "Start 14 dagen gratis",
  "ctaTry": "Probeer een vraag"
}
```

Build:
```bash
npm run build
```

---

### Task 3: `<AnimatedPhoneMock>` (client)

`src/components/landing/animated-phone-mock.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { MascotImage } from "@/components/ui/mascot";

export function AnimatedPhoneMock() {
  const t = useTranslations("hero.frame");
  const reward = useTranslations("hero.frame.reward");
  const options = t.raw("options") as string[];
  const correctIdx = t.raw("correctIdx") as number;
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = setInterval(() => {
      setStep((s) => ((s + 1) % 4) as 0 | 1 | 2 | 3);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const selected = step >= 1;
  const correct = step >= 2;
  const showReward = step === 3;

  return (
    <div className="relative">
      {/* Phone frame */}
      <div className="mx-auto w-full max-w-[280px] rounded-[36px] border border-line bg-card p-3 shadow-lexi-lg">
        <div className="rounded-lexi-lg bg-card p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-primary-ink">
            Rekenen · groep 5
          </p>
          <p className="mt-3 font-display text-lg font-bold text-ink">{t("question")}</p>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {options.map((opt, i) => {
              const isCorrect = i === correctIdx;
              const isHighlighted = isCorrect && selected;
              const isMarkedCorrect = isCorrect && correct;
              return (
                <li
                  key={opt}
                  className={`flex items-center justify-center gap-1 rounded-lexi border px-3 py-2 text-sm font-medium transition-colors ${
                    isMarkedCorrect
                      ? "border-ok bg-ok-soft text-ink"
                      : isHighlighted
                      ? "border-primary bg-primary-soft text-primary-ink"
                      : "border-line bg-bg-2 text-ink-2"
                  }`}
                >
                  {opt}
                  {isMarkedCorrect && <Check className="h-4 w-4 text-ok" />}
                </li>
              );
            })}
          </ul>
          {correct && !showReward && (
            <p className="mt-3 rounded-lexi bg-ok-soft px-3 py-2 text-center text-xs font-medium text-ink">
              {t("feedback")}
            </p>
          )}
        </div>
      </div>

      {/* Reward overlay */}
      {showReward && (
        <div
          className="lexi-fade-up absolute inset-0 mx-auto flex w-full max-w-[280px] flex-col items-center justify-center rounded-[36px] bg-primary-soft/95 p-6 text-center backdrop-blur-sm"
          key={`reward-${step}`}
        >
          <MascotImage style="bot" age="hero" size={80} decorative className="h-20 w-20" />
          <p className="mt-3 font-display text-lg font-bold text-ink">{reward("title")}</p>
          <p className="mt-2 text-sm text-ink-2">{reward("sub")}</p>
        </div>
      )}
    </div>
  );
}
```

Build:
```bash
npm run build
```

---

### Task 4: `<ParentPingCard>` (server)

`src/components/landing/parent-ping-card.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";

export function ParentPingCard() {
  const t = useTranslations("hero.parentPing");
  return (
    <div className="rotate-[2deg] rounded-lexi-lg border border-line bg-card p-4 shadow-lexi-lg">
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-primary-ink">
        <MessageCircle className="h-3 w-3" />
        {t("kicker")}
      </div>
      <p className="mt-2 max-w-[220px] text-sm text-ink">{t("body")}</p>
    </div>
  );
}
```

Build:
```bash
npm run build
```

---

### Task 5: Rewrite `<Hero>` to use the new pieces

Overwrite `src/components/landing/hero.tsx`:

```tsx
import { useTranslations, useLocale } from "next-intl";
import { Btn } from "@/components/ui/btn";
import { NlFlag, BeFlag } from "@/components/nav/flag";
import { AnimatedPhoneMock } from "./animated-phone-mock";
import { ParentPingCard } from "./parent-ping-card";
import { Check } from "lucide-react";

export function Hero() {
  const t = useTranslations("hero");
  const trust = useTranslations("hero.trust");
  const locale = useLocale();
  const Flag = locale === "nl-BE" ? BeFlag : NlFlag;
  return (
    <section className="px-5 py-16 md:py-24">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 md:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-sm text-ink-2">
            <Flag className="h-3 w-5" decorative />
            {t("kicker")}
          </span>
          <h1 className="mt-6 font-display text-[clamp(38px,5.6vw,64px)] font-bold leading-[1.02] tracking-tighter text-ink text-balance">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-2 md:text-xl">{t("subhead")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Btn href="/signup">{t("ctaTrial")}</Btn>
            <Btn href="/probeer" variant="ghost">{t("ctaTry")}</Btn>
          </div>
          <p className="mt-4 text-sm text-ink-2">{t("price")}</p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-ok" />{trust("noCard")}</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-ok" />{trust("monthly")}</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-ok" />{trust("wholeFamily")}</li>
          </ul>
        </div>
        <div className="relative flex items-center justify-center rounded-lexi-lg bg-primary-soft p-8 md:p-12">
          <AnimatedPhoneMock />
          <div className="absolute -bottom-4 -right-4 hidden md:block">
            <ParentPingCard />
          </div>
        </div>
      </div>
    </section>
  );
}
```

Build:
```bash
npm run build
```

---

### Task 6: New `<ProductLoop>` (4 numbered cards)

`src/components/landing/product-loop.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { MessageCircleQuestion, MousePointerClick, Coins, Users } from "lucide-react";
import { SectionIntro } from "@/components/ui/section-intro";

const ICONS = [MessageCircleQuestion, MousePointerClick, Coins, Users] as const;
const TINTS = [
  "bg-teal-soft text-ink",
  "bg-sun-soft text-ink",
  "bg-primary-soft text-primary-ink",
  "bg-plum-soft text-ink",
];

type Item = { eyebrow: string; title: string; body: string };

export function ProductLoop() {
  const t = useTranslations("productLoop");
  const items = t.raw("items") as Item[];
  return (
    <section className="bg-bg-2 px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} center />
        <ul className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <li
                key={item.eyebrow}
                className="rounded-lexi-lg border border-line bg-card p-6 shadow-lexi-sm"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-lexi-lg ${TINTS[i]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-4 font-mono text-xs uppercase tracking-wider text-primary-ink">{item.eyebrow}</p>
                <h3 className="mt-1 font-display text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-2">{item.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

Build:
```bash
npm run build
```

---

### Task 7: `<RewardLoop>` (client cycle)

`src/components/landing/reward-loop.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Coins, Sparkles, Gift, type LucideIcon } from "lucide-react";
import { SectionIntro } from "@/components/ui/section-intro";

type Phase = { title: string; body: string };

const ICONS: LucideIcon[] = [Coins, Sparkles, Gift];
const TINTS = ["bg-sun-soft", "bg-plum-soft", "bg-ok-soft"];

export function RewardLoop() {
  const t = useTranslations("rewardLoop");
  const phases = t.raw("phases") as Phase[];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = setInterval(() => {
      setActive((a) => (a + 1) % phases.length);
    }, 2200);
    return () => clearInterval(id);
  }, [phases.length]);

  return (
    <section className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} center />
        <ul className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
          {phases.map((p, i) => {
            const Icon = ICONS[i];
            const isActive = i === active;
            return (
              <li
                key={p.title}
                className={`rounded-lexi-lg border p-6 transition-all duration-300 ${
                  isActive
                    ? "border-primary bg-card shadow-lexi scale-[1.02]"
                    : "border-line bg-card opacity-60"
                }`}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-lexi-lg ${TINTS[i]}`}>
                  <Icon className="h-7 w-7 text-ink" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{p.title}</h3>
                <p className="mt-2 text-sm text-ink-2">{p.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

Build:
```bash
npm run build
```

---

### Task 8: `<FinalCta>` (restore)

`src/components/landing/final-cta.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { Btn } from "@/components/ui/btn";

export function FinalCta() {
  const t = useTranslations("finalCta");
  return (
    <section className="bg-bg-2 px-5 py-16 md:py-24">
      <div className="mx-auto max-w-3xl rounded-lexi-lg border border-primary bg-card p-10 text-center shadow-lexi md:p-16">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink text-balance md:text-5xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-ink-2 md:text-lg">{t("sub")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Btn href="/signup">{t("ctaTrial")}</Btn>
          <Btn href="/probeer" variant="ghost">{t("ctaTry")}</Btn>
        </div>
      </div>
    </section>
  );
}
```

Build:
```bash
npm run build
```

---

### Task 9: Delete `feature-grid.tsx` + `subscribe-widget.tsx`

```bash
rm "src/components/landing/feature-grid.tsx"
rm "src/components/landing/subscribe-widget.tsx"
```

Build (will fail until page.tsx is updated in next task).

---

### Task 10: Rewrite `src/app/page.tsx` with new section order

```tsx
import { Nav } from "@/components/nav/nav";
import { Hero } from "@/components/landing/hero";
import { ProductLoop } from "@/components/landing/product-loop";
import { SamenModus } from "@/components/landing/samen-modus";
import { RewardLoop } from "@/components/landing/reward-loop";
import { ProgressChartCard } from "@/components/landing/progress-chart-card";
import { Subjects } from "@/components/landing/subjects";
import { SeoProof } from "@/components/landing/seo-proof";
import { Trust } from "@/components/landing/trust";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <ProductLoop />
        <SamenModus />
        <RewardLoop />
        <ProgressChartCard />
        <Subjects />
        <SeoProof />
        <Trust />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
```

Build:
```bash
npm run build
```

Expected: clean.

---

### Task 11: Final acceptance

```bash
npm run build && npm test && npm run test:e2e && npm run lighthouse
```

Expected: 14/14 unit, 6/6 E2E, all 5 URLs pass Lighthouse.

Cleanup node. Report. No commits.
