# Lexi.kids — Landing Redo (Phase 2a) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Redo the landing page (`/`) to match `Downloads/website Lexi 2.0 (1)/pages/landing.png`: new hero with Lexi mascot, new FeatureGrid section, refreshed SamenModus with device illustration, new ProgressChartCard, new SubscribeWidget, 2-tier Pricing (drop family), removal of ProductLoop / RewardLoop / FinalCta / ParentDashboardPreview.

**Architecture:** Server-rendered route. `<MascotImage>` shared atom wraps `next/image` pointing at `public/avatars/{style}/{age}-transparent.svg`. Keep next-intl cookie-based locale + deep-merge fallback (Phase 2 infra). Two client islands stay (`<RegionPicker>`, `<Faq>`).

**Tech Stack:** Existing — Next.js 16 App Router, Tailwind 4, next-intl, lucide-react, Radix accordion. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-05-11-lexi-landing-redo-design.md`
**Target image:** `C:\Users\thoma\Downloads\website Lexi 2.0 (1)\pages\landing.png`
**Mascot assets:** `C:\Users\thoma\lexi_2.0\public\avatars\{bot,classic,owl}\{seed,baby,kid,teen,hero}-{transparent,bg}.{png,svg}` (already copied in)

---

## Executor notes

- Working dir: `C:\Users\thoma\lexi_2.0`. Commands assume this CWD.
- **NO git commits.** User manages git manually.
- Tailwind 4 tokens already wired — use `bg-bg`, `text-ink`, `text-ink-2`, `bg-card`, `border-line`, `bg-primary`, `bg-primary-soft`, `text-primary-ink`, `bg-teal-soft`, `bg-sun-soft`, `bg-plum-soft`, `bg-ok-soft`, `rounded-lexi`, `rounded-lexi-lg`, `shadow-lexi`, `shadow-lexi-sm`, `font-display`, `font-sans`.
- All copy must come from `src/messages/<locale>.json`. No hardcoded user-facing strings except brand "Lexi.kids".
- Mascot images live at `/avatars/<style>/<age>-transparent.svg` (e.g. `/avatars/bot/hero-transparent.svg`).
- After each task: `npm run build` to verify compile. Final task runs the full battery (build + unit tests + e2e + lighthouse).

---

### Task 1: Cleanup obsolete files and CSS

**Files:**
- Delete: `src/components/landing/hero-product-frame.tsx`
- Delete: `src/components/landing/product-loop.tsx`
- Delete: `src/components/landing/parent-dashboard-preview.tsx`
- Delete: `src/components/landing/reward-loop.tsx`
- Delete: `src/components/landing/final-cta.tsx`
- Delete: `src/app/_landing.css`
- Modify: `src/app/globals.css` (remove the `@import "./_landing.css";` line)
- Modify: `src/app/page.tsx` (TEMPORARY — remove imports + JSX for the deleted components so build still passes; Task 10 rewrites this file completely)

- [ ] **Step 1: Delete the 6 obsolete files**

```bash
rm "src/components/landing/hero-product-frame.tsx"
rm "src/components/landing/product-loop.tsx"
rm "src/components/landing/parent-dashboard-preview.tsx"
rm "src/components/landing/reward-loop.tsx"
rm "src/components/landing/final-cta.tsx"
rm "src/app/_landing.css"
```

- [ ] **Step 2: Remove the `_landing.css` import from `globals.css`**

Read `src/app/globals.css`. Find the line `@import "./_landing.css";` (it's near the end, after the `body { ... }` block). Delete that single line. Leave the rest of the file untouched.

- [ ] **Step 3: Temporarily neuter `page.tsx`**

Read `src/app/page.tsx` first. Replace its content with this temporary stub — it removes references to deleted components so the build doesn't break between tasks:

```tsx
import { Nav } from "@/components/nav/nav";
import { Hero } from "@/components/landing/hero";
import { SamenModus } from "@/components/landing/samen-modus";
import { Subjects } from "@/components/landing/subjects";
import { SeoProof } from "@/components/landing/seo-proof";
import { Trust } from "@/components/landing/trust";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <SamenModus />
        <Subjects />
        <SeoProof />
        <Trust />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
```

(Task 10 finalizes the section order with the new components.)

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: "Compiled successfully". `/` still listed in routes.

---

### Task 2: Update message files for the new section structure

**Files:**
- Modify: `src/messages/nl-NL.json` (overwrite)
- Modify: `src/messages/nl-BE.json` (overwrite)

**Why:** Remove now-obsolete namespaces (`productLoop`, `rewardLoop`, `parentDashboard`, `finalCta`, `pricing.tiers.family`), update `hero.title`, drop `faq.items[4]`, and add new namespaces (`featureGrid`, `progressChart`, `subscribe`) plus rewritten `samenModus`. Doing it all in one task avoids partial-state JSON during the rebuild.

- [ ] **Step 1: Overwrite `src/messages/nl-NL.json`**

```json
{
  "nav": {
    "selectRegion": "Kies regio",
    "netherlands": "Nederland",
    "belgium": "België",
    "products": "Producten",
    "pricing": "Prijzen",
    "signIn": "Inloggen",
    "ctaTrial": "Start 14 dagen gratis"
  },
  "common": {
    "company": "Lexi.kids B.V. — Amsterdam",
    "groep": "groep",
    "groepRange": "1 t/m 8",
    "curriculum": "SEO leerlijn 2026"
  },
  "footer": {
    "products": "Producten",
    "forParents": "Voor ouders",
    "company": "Bedrijf",
    "legal": "Juridisch",
    "links": {
      "landing": "Lexi.kids",
      "shop": "Shop",
      "tryQuestion": "Probeer een vraag",
      "pricing": "Prijzen",
      "blog": "Blog",
      "about": "Over ons",
      "contact": "Contact",
      "terms": "Voorwaarden",
      "privacy": "Privacybeleid",
      "cookies": "Cookies"
    },
    "tagline": "Slim oefenen voor groep 1 t/m 8.",
    "copyright": "© 2026 Lexi.kids. Alle rechten voorbehouden."
  },
  "hero": {
    "kicker": "Voor ouders in Nederland",
    "title": "Het oefenprogramma waar je kind zelf om vraagt.",
    "subhead": "Vijftien minuten per dag. Aangepast aan het niveau van je kind. Met jou als coach, niet als opvoeder achter de schermen.",
    "ctaTrial": "Start 14 dagen gratis",
    "ctaTry": "Probeer een vraag",
    "price": "vanaf €11,95 / maand",
    "trust": {
      "noCard": "Geen creditcard",
      "monthly": "Per maand opzegbaar",
      "wholeFamily": "Hele gezin"
    }
  },
  "featureGrid": {
    "eyebrow": "Zo werkt het",
    "title": "Zo zit Lexi.kids in elkaar.",
    "items": {
      "kwartier": {
        "title": "Eén kwartier per dag",
        "body": "Korte sessies van vijftien minuten — lang genoeg om iets te leren, kort genoeg om vol te houden."
      },
      "aangepast": {
        "title": "Aangepast aan je kind",
        "body": "Lexi kiest de volgende vraag op het niveau van je kind. Zonder dat het kind het door heeft."
      },
      "samen": {
        "title": "Samen, niet alleen",
        "body": "Jij krijgt de uitleg op je telefoon. Je kind speelt op de tablet. Een gespreksstarter voor aan tafel."
      }
    }
  },
  "samenModus": {
    "eyebrow": "Samen-modus",
    "title": "Een kwartier samen leren. Geen huiswerkgevecht.",
    "lead": "Zondagavond, koffie. Vijftien minuten later weet jullie allebei waar het deze week om gaat.",
    "steps": {
      "one": { "eyebrow": "01", "title": "Hint zonder spoiler", "body": "Lexi geeft jou de uitleg en context, niet het antwoord. Jij stelt de vraag in eigen woorden." },
      "two": { "eyebrow": "02", "title": "Eén gespreksstarter per week", "body": "Een open vraag voor aan tafel, geen toets. Voor als jullie even niet over school willen praten." },
      "three": { "eyebrow": "03", "title": "Geen schermtijd erbij", "body": "Vervangt iets dat ze al doen. Jouw kwartier coachen telt niet als extra schermtijd." }
    },
    "scene": {
      "parentLabel": "Op je telefoon",
      "parentHint": "Hint voor jou: leg uit dat een kwart een halve helft is.",
      "kidLabel": "Op de tablet",
      "kidQuestion": "Welk getal hoort hier?",
      "kidOptions": ["1/2", "1/4", "1/3", "3/4"]
    }
  },
  "progressChart": {
    "eyebrow": "Voor jou",
    "title": "Je kind in beeld op zondagavond.",
    "lead": "Geen schoolportaal-look. Eén kaart per week, met wat ze deden en één gespreksstarter.",
    "reportLabel": "Weekrapport — week 12",
    "kidName": "Sara",
    "stats": {
      "minutes": { "label": "Geoefend", "value": "47 min" },
      "streak": { "label": "Streak", "value": "12 dagen" },
      "levels": { "label": "Niveaus omhoog", "value": "2" }
    },
    "rows": [
      { "label": "Rekenen — tafels",     "topic": "Tafel van 7, 8", "pct": 78 },
      { "label": "Taal — werkwoorden",   "topic": "Stam + t / d",   "pct": 64 },
      { "label": "Lezen — begrijpend",   "topic": "Hoofdgedachte",  "pct": 71 },
      { "label": "Wereld — geschiedenis","topic": "Romeinen",       "pct": 55 }
    ],
    "viewAll": "Bekijk het volledige dashboard →"
  },
  "subjects": {
    "eyebrow": "Vakken",
    "title": "Alles wat ze op school zien — slim verpakt.",
    "lead": "Voor {groep} {groepRange}.",
    "items": {
      "rekenen": { "title": "Rekenen", "body": "Tafels, breuken, verhaaltjessommen — gepacificeerd in stappen." },
      "taal":    { "title": "Taal", "body": "Woordenschat, spelling, grammatica zonder droge invuloefeningen." },
      "lezen":   { "title": "Lezen", "body": "Begrijpend lezen met korte teksten en open vragen." },
      "wereld":  { "title": "Wereldoriëntatie", "body": "Aardrijkskunde, geschiedenis, natuur — verkennend." },
      "engels":  { "title": "Engels", "body": "Vanaf groep 7 in NL, vanaf leerjaar 5 in BE." }
    }
  },
  "seoProof": {
    "eyebrow": "Bewezen leerlijn",
    "title": "Je kind oefent precies wat de juf volgende week toetst.",
    "lead": "Lexi volgt de SEO leerlijn 2026 — dezelfde leerdoelen die ook op school worden getoetst.",
    "rows": [
      { "label": "Rekenen — getalbegrip",   "topic": "Tafels van 6, 7, 8", "pct": 78 },
      { "label": "Taal — werkwoordspelling", "topic": "Stam + t / d",       "pct": 64 },
      { "label": "Lezen — begrijpend",       "topic": "Hoofdgedachte vinden", "pct": 71 },
      { "label": "Wereld — geschiedenis",    "topic": "Romeinse tijd",      "pct": 55 }
    ],
    "footnote": "Percentages tonen voltooid van het thema voor groep 6."
  },
  "subscribe": {
    "title": "Probeer Lexi 14 dagen gratis.",
    "sub": "Geen creditcard nodig. Per maand opzegbaar.",
    "placeholder": "jouw@email.nl",
    "cta": "Start gratis"
  },
  "trust": {
    "eyebrow": "Eerste gezinnen",
    "title": "Lexi is nog in beta — en dit zeggen de eerste ouders.",
    "lead": "Echte testimonials komen zodra we genoeg verhalen hebben. Onderstaande citaten zijn voorlopig.",
    "testimonials": [
      { "quote": "Mijn dochter zat er deze week vrijwilig elke dag voor. Dat zegt genoeg.", "author": "Marieke", "context": "Moeder van Liv (groep 5)" },
      { "quote": "De gespreksstarter aan tafel werkt verrassend goed.", "author": "Joris", "context": "Vader van Tijn (groep 7)" },
      { "quote": "Eindelijk iets digitaals dat niet aanvoelt als saaie schoolwerk.", "author": "Anouk", "context": "Moeder van Sara (leerjaar 4)" }
    ]
  },
  "pricing": {
    "eyebrow": "Prijzen",
    "title": "Eén prijs, het hele gezin.",
    "lead": "Eerste 14 dagen gratis. Per maand opzegbaar.",
    "ctaTrial": "Start 14 dagen gratis",
    "tiers": {
      "monthly":  { "name": "Maandelijks", "price": "€11,95", "interval": "per maand", "features": ["Alle kinderen in het gezin", "Alle vakken", "Voortgangsdashboard", "Per maand opzegbaar"], "badge": "" },
      "yearly":   { "name": "Jaarlijks",   "price": "€119",   "interval": "per jaar",  "features": ["Alle kinderen in het gezin", "Alle vakken", "Voortgangsdashboard", "2 maanden gratis"], "badge": "Voordeligst" }
    }
  },
  "faq": {
    "eyebrow": "Veelgestelde vragen",
    "title": "Wat mensen vragen.",
    "items": [
      { "q": "Voor welke leeftijden is Lexi.kids?", "a": "Voor groep 1 t/m 8 (NL) en leerjaar 1 t/m 6 (BE), grofweg 4 tot 12 jaar." },
      { "q": "Volgt Lexi de schoolleerlijn?", "a": "Ja — we volgen de SEO leerlijn 2026 in Nederland en het ZILL-leerplan in België." },
      { "q": "Heb ik een creditcard nodig om te starten?", "a": "Nee. De eerste 14 dagen zijn gratis en vragen geen betaalgegevens." },
      { "q": "Kan ik per maand opzeggen?", "a": "Ja, op elk moment, zonder uitleg." },
      { "q": "Werkt het op tablet en telefoon?", "a": "Ja. We adviseren tablet voor het kind en telefoon voor de ouder (Samen-modus)." }
    ]
  }
}
```

- [ ] **Step 2: Overwrite `src/messages/nl-BE.json`**

```json
{
  "common": {
    "company": "Lexi.kids — Antwerpen",
    "groep": "leerjaar",
    "groepRange": "1 t/m 6",
    "curriculum": "ZILL"
  },
  "footer": {
    "tagline": "Slim oefenen voor leerjaar 1 t/m 6."
  },
  "hero": {
    "kicker": "Voor ouders in België",
    "title": "Het oefenprogramma waar je kind zelf om vraagt."
  },
  "samenModus": {
    "scene": {
      "kidQuestion": "Welk getal hoort hier?"
    }
  },
  "progressChart": {
    "rows": [
      { "label": "Rekenen — tafels",     "topic": "Tafel van 7, 8", "pct": 78 },
      { "label": "Taal — werkwoorden",   "topic": "Stam + t / d",   "pct": 64 },
      { "label": "Lezen — begrijpend",   "topic": "Hoofdgedachte",  "pct": 71 },
      { "label": "Wereld — geschiedenis","topic": "Romeinen",       "pct": 55 }
    ]
  },
  "seoProof": {
    "title": "Jouw kind oefent precies wat de juf of meester volgende week toetst.",
    "lead": "Lexi volgt het ZILL-leerplan — dezelfde leerdoelen die ook op school worden getoetst.",
    "footnote": "Percentages tonen voltooid van het thema voor leerjaar 4."
  },
  "trust": {
    "testimonials": [
      { "quote": "Mijn dochter zat er deze week vrijwilig elke dag voor. Dat zegt genoeg.", "author": "Marieke", "context": "Moeder van Liv (leerjaar 3)" },
      { "quote": "De gespreksstarter aan tafel werkt verrassend goed.", "author": "Joris", "context": "Vader van Tijn (leerjaar 5)" },
      { "quote": "Eindelijk iets digitaals dat niet aanvoelt als saaie schoolwerk.", "author": "Anouk", "context": "Moeder van Sara (leerjaar 4)" }
    ]
  }
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: clean. (Components referencing removed keys may render empty until rewritten in later tasks; that's OK — JSON shape is valid.)

---

### Task 3: `<MascotImage>` atom

**Files:**
- Create: `src/components/ui/mascot.tsx`

- [ ] **Step 1: Create `src/components/ui/mascot.tsx`**

```tsx
import Image from "next/image";

type Style = "bot" | "classic" | "owl";
type Age = "seed" | "baby" | "kid" | "teen" | "hero";

type Props = {
  style?: Style;
  age?: Age;
  size: number;
  className?: string;
  alt?: string;
  decorative?: boolean;
  priority?: boolean;
};

export function MascotImage({
  style = "bot",
  age = "hero",
  size,
  className,
  alt,
  decorative = false,
  priority = false,
}: Props) {
  const src = `/avatars/${style}/${age}-transparent.svg`;
  if (decorative) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
        priority={priority}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt ?? "Lexi"}
      width={size}
      height={size}
      className={className}
      priority={priority}
    />
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

---

### Task 4: Hero rewrite

**Files:**
- Modify: `src/components/landing/hero.tsx` (overwrite)

- [ ] **Step 1: Read current `src/components/landing/hero.tsx`, then overwrite with:**

```tsx
import { useTranslations, useLocale } from "next-intl";
import { Btn } from "@/components/ui/btn";
import { NlFlag, BeFlag } from "@/components/nav/flag";
import { MascotImage } from "@/components/ui/mascot";
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
          <MascotImage style="bot" age="hero" size={360} priority decorative className="h-auto w-full max-w-[360px]" />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Mascot at `/avatars/bot/hero-transparent.svg` must load. If 404, recopy the assets from `Downloads/lexi-avatars/avatars` to `public/avatars` and retry.

---

### Task 5: FeatureGrid (new)

**Files:**
- Create: `src/components/landing/feature-grid.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useTranslations } from "next-intl";
import { Clock, Sparkles, Heart } from "lucide-react";
import { SectionIntro } from "@/components/ui/section-intro";

const ITEMS = [
  { key: "kwartier" as const, Icon: Clock, tint: "bg-teal-soft text-ink" },
  { key: "aangepast" as const, Icon: Sparkles, tint: "bg-plum-soft text-ink" },
  { key: "samen" as const, Icon: Heart, tint: "bg-primary-soft text-primary-ink" },
];

export function FeatureGrid() {
  const t = useTranslations("featureGrid");
  const items = useTranslations("featureGrid.items");
  return (
    <section className="bg-bg-2 px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} center />
        <ul className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3">
          {ITEMS.map((item) => (
            <li
              key={item.key}
              className="rounded-lexi-lg border border-line bg-card p-6 shadow-lexi-sm md:p-8"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lexi-lg ${item.tint}`}>
                <item.Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-ink">{items(`${item.key}.title`)}</h3>
              <p className="mt-2 text-ink-2">{items(`${item.key}.body`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

---

### Task 6: SamenModus rewrite (paired device illustration)

**Files:**
- Modify: `src/components/landing/samen-modus.tsx` (overwrite)

- [ ] **Step 1: Read current file, then overwrite**

```tsx
import { useTranslations } from "next-intl";
import { Smartphone, Tablet } from "lucide-react";
import { SectionIntro } from "@/components/ui/section-intro";

export function SamenModus() {
  const t = useTranslations("samenModus");
  const steps = useTranslations("samenModus.steps");
  const scene = useTranslations("samenModus.scene");
  const kidOptions = scene.raw("kidOptions") as string[];
  return (
    <section className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
        <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-2">
          <ul className="space-y-8">
            {(["one", "two", "three"] as const).map((k) => (
              <li key={k}>
                <p className="font-mono text-sm uppercase tracking-wider text-primary-ink">{steps(`${k}.eyebrow`)}</p>
                <h3 className="mt-2 font-display text-xl font-bold text-ink md:text-2xl">{steps(`${k}.title`)}</h3>
                <p className="mt-2 text-ink-2">{steps(`${k}.body`)}</p>
              </li>
            ))}
          </ul>
          <div className="relative h-[480px]">
            {/* Tablet — kid view (back, larger, bg-sun-soft) */}
            <div className="absolute right-0 top-12 w-[88%] rounded-[28px] border border-line bg-sun-soft p-3 shadow-lexi-lg">
              <div className="rounded-lexi-lg bg-card p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-2">
                  <Tablet className="h-4 w-4" />
                  {scene("kidLabel")}
                </div>
                <p className="mt-3 font-display text-lg font-bold text-ink">{scene("kidQuestion")}</p>
                <ul className="mt-4 grid grid-cols-2 gap-2">
                  {kidOptions.map((opt, i) => (
                    <li
                      key={opt}
                      className={`rounded-lexi border px-3 py-2 text-center text-sm font-medium ${
                        i === 1
                          ? "border-primary bg-primary-soft text-primary-ink"
                          : "border-line bg-bg-2 text-ink-2"
                      }`}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Phone — parent view (front, smaller, bg-teal-soft, tilted) */}
            <div className="absolute left-0 top-0 w-[58%] rotate-[-4deg] rounded-[36px] border border-line bg-teal-soft p-3 shadow-lexi-lg">
              <div className="rounded-lexi-lg bg-card p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-2">
                  <Smartphone className="h-4 w-4" />
                  {scene("parentLabel")}
                </div>
                <p className="mt-3 text-sm text-ink">{scene("parentHint")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

---

### Task 7: ProgressChartCard (new)

**Files:**
- Create: `src/components/landing/progress-chart-card.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useTranslations } from "next-intl";
import { SectionIntro } from "@/components/ui/section-intro";
import { MascotImage } from "@/components/ui/mascot";

type Row = { label: string; topic: string; pct: number };

export function ProgressChartCard() {
  const t = useTranslations("progressChart");
  const stats = useTranslations("progressChart.stats");
  const common = useTranslations("common");
  const rows = t.raw("rows") as Row[];
  return (
    <section className="bg-bg-2 px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} center />
        <div className="mt-12 rounded-lexi-lg border border-line bg-card p-6 shadow-lexi md:mt-16 md:p-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft">
              <MascotImage style="bot" age="kid" size={40} decorative className="h-10 w-10" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs uppercase tracking-wider text-primary-ink">{t("reportLabel")}</p>
              <h3 className="mt-1 font-display text-xl font-bold text-ink md:text-2xl">
                {t("kidName")} — {common("groep")} 5
              </h3>
            </div>
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {(["minutes", "streak", "levels"] as const).map((k) => (
              <li key={k} className="rounded-lexi border border-line bg-bg-2 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-ink-2">{stats(`${k}.label`)}</p>
                <p className="mt-1 font-display text-lg font-bold text-ink">{stats(`${k}.value`)}</p>
              </li>
            ))}
          </ul>
          <ul className="mt-6 divide-y divide-line-2">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{r.label}</p>
                  <p className="text-sm text-ink-2">{r.topic}</p>
                </div>
                <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-bg-2 sm:block">
                  <div className="h-full bg-primary" style={{ width: `${r.pct}%` }} />
                </div>
                <p className="font-mono text-sm tabular-nums text-ink-2">{r.pct}%</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-medium text-primary-ink">
            <a href="/ouder" className="hover:underline">{t("viewAll")}</a>
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

---

### Task 8: SubscribeWidget (new)

**Files:**
- Create: `src/components/landing/subscribe-widget.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useTranslations } from "next-intl";

export function SubscribeWidget() {
  const t = useTranslations("subscribe");
  return (
    <section className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-3xl rounded-lexi-lg border border-line bg-card p-8 shadow-lexi md:p-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink text-balance md:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-2 text-ink-2">{t("sub")}</p>
        <form
          action="/signup"
          method="get"
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="subscribe-email" className="sr-only">
            {t("placeholder")}
          </label>
          <input
            id="subscribe-email"
            type="email"
            name="email"
            required
            placeholder={t("placeholder")}
            className="flex-1 rounded-lexi border border-line bg-bg-2 px-4 py-3 text-ink placeholder:text-ink-2 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          />
          <button
            type="submit"
            className="rounded-lexi bg-primary px-5 py-3 font-medium text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t("cta")}
          </button>
        </form>
      </div>
    </section>
  );
}
```

(`method="get" action="/signup"` makes the form submit to `/signup?email=...` — UI-only redirect; real signup is Phase 3.)

- [ ] **Step 2: Verify build**

```bash
npm run build
```

---

### Task 9: Pricing rewrite (2 tiers)

**Files:**
- Modify: `src/components/landing/pricing.tsx` (overwrite)

- [ ] **Step 1: Overwrite**

```tsx
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Btn } from "@/components/ui/btn";
import { SectionIntro } from "@/components/ui/section-intro";

const TIERS = ["monthly", "yearly"] as const;

export function Pricing() {
  const t = useTranslations("pricing");
  const tier = useTranslations("pricing.tiers");
  return (
    <section id="prijzen" className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} center />
        <ul className="mx-auto mt-12 grid max-w-3xl gap-6 md:mt-16 md:grid-cols-2">
          {TIERS.map((id) => {
            const features = tier.raw(`${id}.features`) as string[];
            const badge = tier(`${id}.badge`);
            const featured = id === "yearly";
            return (
              <li
                key={id}
                className={`flex flex-col rounded-lexi-lg border p-8 ${
                  featured
                    ? "border-primary bg-card shadow-lexi"
                    : "border-line bg-card shadow-lexi-sm"
                }`}
              >
                {badge && (
                  <span className="mb-3 inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                    {badge}
                  </span>
                )}
                <h3 className="font-display text-xl font-bold text-ink">{tier(`${id}.name`)}</h3>
                <p className="mt-3">
                  <span className="font-display text-4xl font-bold text-ink">{tier(`${id}.price`)}</span>
                  <span className="ml-2 text-sm text-ink-2">{tier(`${id}.interval`)}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Btn href={`/signup?plan=${id}`} className="mt-8 w-full">
                  {t("ctaTrial")}
                </Btn>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

---

### Task 10: Compose `page.tsx` with new section order

**Files:**
- Modify: `src/app/page.tsx` (overwrite)

- [ ] **Step 1: Overwrite**

```tsx
import { Nav } from "@/components/nav/nav";
import { Hero } from "@/components/landing/hero";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { SamenModus } from "@/components/landing/samen-modus";
import { ProgressChartCard } from "@/components/landing/progress-chart-card";
import { Subjects } from "@/components/landing/subjects";
import { SeoProof } from "@/components/landing/seo-proof";
import { SubscribeWidget } from "@/components/landing/subscribe-widget";
import { Trust } from "@/components/landing/trust";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <FeatureGrid />
        <SamenModus />
        <ProgressChartCard />
        <Subjects />
        <SeoProof />
        <SubscribeWidget />
        <Trust />
        <Pricing />
        <Faq />
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

---

### Task 11: Final acceptance

**Files:** none. Verification only.

- [ ] **Step 1: Production build**

```bash
npm run build
```

Expected: clean. `/` route listed.

- [ ] **Step 2: Unit tests**

```bash
npm test
```

Expected: 14/14 across 4 files (no test files were modified).

- [ ] **Step 3: Playwright E2E**

```bash
npm run test:e2e
```

Expected: 1/1 — the existing spec's assertions all survive the redo (subjects lead text, region switch, FAQ first item, hero CTA `href`).

- [ ] **Step 4: Lighthouse**

```bash
npm run lighthouse
```

Expected: Performance ≥ 0.9, Accessibility ≥ 0.95. If perf regresses below 0.9, the mascot SVG file size is the most likely culprit — check `/avatars/bot/hero-transparent.svg` size and consider switching `priority={false}` everywhere or using a smaller width.

- [ ] **Step 5: Dev-server visual smoke**

```bash
npm run dev
```

Wait for "Ready in". Curl with cookie to spot-check both locales:

```bash
curl -s http://localhost:3000 | grep -o "Het oefenprogramma\|Lexi.kids\|Maandelijks\|Jaarlijks\|Probeer Lexi 14 dagen"
```

Should return at least one occurrence of each. Then:

```bash
curl -s -b "lexi-locale=nl-BE" http://localhost:3000 | grep -o "leerjaar 1 t/m 6\|Lexi.kids — Antwerpen"
```

Should return both. Cleanup node processes after.

- [ ] **Step 6: STOP — hand back to user**

Post a short message:
> Phase 2a complete. Landing page now matches the new screenshot design — mascot in hero, FeatureGrid, refreshed SamenModus with device illustration, ProgressChartCard, SubscribeWidget, 2-tier pricing. Open `http://localhost:3000` in your browser to see it. Next phase: `/signup` mock.

Do not git commit. Do not start Phase 3 unprompted (the controller decides).

---

## Self-review notes

- **Spec coverage:** Every component in spec §"Components" has a task (Mascot T3, Hero T4, FeatureGrid T5, SamenModus T6, ProgressChartCard T7, SubscribeWidget T8, Pricing T9). Deletes in T1. Message changes in T2. Compose in T10. Verify in T11.
- **Placeholders:** None. All code shown verbatim. No "TBD" / "TODO" in implementation steps.
- **Type consistency:** `MascotImage` `Props` type defined in T3; consumed in T4 (Hero) and T7 (ProgressChartCard) with valid prop combinations. Message namespace keys (`featureGrid`, `samenModus.scene`, `progressChart.rows`, `subscribe`, `pricing.tiers` with 2 entries) added in T2 and consumed in T5-T9 — keys consistent.
- **FAQ:** No code change needed; T2 already drops the 5th item from the messages. The component reads `t.raw("items")` and renders whatever's there.
