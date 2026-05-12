# Lexi.kids — `/kind` UI Mock (Phase 4-UI) Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** `/kind` page visually matching `kid.png` — KidHeader + DailyGreeting + MijnVakken + 4 QuizCards with game-type previews. Pure server-rendered with hardcoded mock data.

**Spec:** `docs/superpowers/specs/2026-05-11-lexi-kid-ui-design.md`

## Executor notes
- Working dir `C:\Users\thoma\lexi_2.0`. No git commits.
- Use existing tokens. Mascot via `MascotImage` atom.

---

### Task 1: Add `kid` namespace to messages

**Files:** `src/messages/nl-NL.json` (append `kid` block)

- [ ] **Step 1: Add this block to `nl-NL.json` as a sibling to other top-level keys**

```json
"kid": {
  "title": "Lexi.kids",
  "header": {
    "coins": "munten",
    "avatar": "Avatar"
  },
  "greeting": {
    "title": "Klaar voor de quiz van vandaag?",
    "sub": "Verdien munten met goed antwoorden.",
    "cta": "Start"
  },
  "mijnVakken": { "title": "Mijn vakken" },
  "quizzen":    { "title": "Quizzen voor jou" },
  "quizCard":   { "start": "Start", "durationLabel": "min", "questionsLabel": "vragen" },
  "gameType": {
    "mc":         "Multiple choice",
    "type":       "Intypen",
    "match":      "Match-paren",
    "drag-order": "Slepen & sorteren"
  },
  "subjects": {
    "rekenen": "Rekenen",
    "taal":    "Taal",
    "lezen":   "Lezen",
    "engels":  "Engels",
    "wereld":  "Wereld"
  }
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

---

### Task 2: Game-type preview components (4 in one task)

**Files:**
- Create: `src/components/kid/previews/mc-preview.tsx`
- Create: `src/components/kid/previews/type-preview.tsx`
- Create: `src/components/kid/previews/match-preview.tsx`
- Create: `src/components/kid/previews/drag-order-preview.tsx`

These are decorative static previews. Each takes no props.

- [ ] **Step 1: `mc-preview.tsx`**

```tsx
const OPTIONS = ["12", "24", "30", "35"];

export function McPreview() {
  return (
    <ul aria-hidden="true" className="grid grid-cols-2 gap-2">
      {OPTIONS.map((o, i) => (
        <li
          key={o}
          className={`flex items-center justify-center rounded-lexi border px-3 py-2 text-sm font-medium ${
            i === 1
              ? "border-primary bg-primary-soft text-primary-ink"
              : "border-line bg-bg-2 text-ink-2"
          }`}
        >
          {o}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: `type-preview.tsx`**

```tsx
export function TypePreview() {
  return (
    <div aria-hidden="true" className="flex items-center rounded-lexi border border-line bg-card px-3 py-2">
      <span className="font-mono text-base text-ink">loo</span>
      <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-primary" />
      <span className="ml-auto text-xs text-ink-3">→</span>
    </div>
  );
}
```

- [ ] **Step 3: `match-preview.tsx`**

```tsx
const PAIRS = [
  { l: "dog", r: "hond", tone: "bg-primary-soft" },
  { l: "cat", r: "kat", tone: "bg-teal-soft" },
  { l: "bird", r: "vogel", tone: "bg-sun-soft" },
];

export function MatchPreview() {
  return (
    <ul aria-hidden="true" className="grid grid-cols-2 gap-1.5">
      {PAIRS.flatMap((p, i) => [
        <li key={`${i}-l`} className={`rounded-lexi ${p.tone} px-2 py-1 text-center text-xs font-medium text-ink`}>{p.l}</li>,
        <li key={`${i}-r`} className={`rounded-lexi ${p.tone} px-2 py-1 text-center text-xs font-medium text-ink`}>{p.r}</li>,
      ])}
    </ul>
  );
}
```

- [ ] **Step 4: `drag-order-preview.tsx`**

```tsx
import { GripVertical } from "lucide-react";

const ITEMS = ["1/2", "1/4", "3/4", "1/3"];

export function DragOrderPreview() {
  return (
    <ul aria-hidden="true" className="space-y-1.5">
      {ITEMS.map((it) => (
        <li key={it} className="flex items-center gap-2 rounded-lexi border border-line bg-card px-2 py-1.5">
          <GripVertical className="h-3 w-3 text-ink-3" />
          <span className="font-mono text-sm text-ink">{it}</span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 5: Build**

```bash
npm run build
```

---

### Task 3: QuizCard

**Files:** `src/components/kid/quiz-card.tsx`

- [ ] **Step 1: Create**

```tsx
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Clock, FileText } from "lucide-react";
import { McPreview } from "./previews/mc-preview";
import { TypePreview } from "./previews/type-preview";
import { MatchPreview } from "./previews/match-preview";
import { DragOrderPreview } from "./previews/drag-order-preview";

type GameType = "mc" | "type" | "match" | "drag-order";

type Props = {
  id: string;
  title: string;
  subjectKey: "rekenen" | "taal" | "lezen" | "engels" | "wereld";
  subjectLabel: string;
  gameType: GameType;
  duration: string;
  questions: number;
};

const PREVIEW: Record<GameType, () => React.JSX.Element> = {
  "mc": McPreview,
  "type": TypePreview,
  "match": MatchPreview,
  "drag-order": DragOrderPreview,
};

const SUBJECT_CHIP: Record<Props["subjectKey"], string> = {
  rekenen: "bg-teal-soft text-ink",
  taal:    "bg-primary-soft text-primary-ink",
  lezen:   "bg-sun-soft text-ink",
  engels:  "bg-ok-soft text-ink",
  wereld:  "bg-plum-soft text-ink",
};

export function QuizCard({ id, title, subjectKey, subjectLabel, gameType, duration, questions }: Props) {
  const t = useTranslations("kid.quizCard");
  const gt = useTranslations("kid.gameType");
  const Preview = PREVIEW[gameType];
  return (
    <article className="grid items-stretch gap-4 rounded-lexi-lg border border-line bg-card p-5 shadow-lexi-sm sm:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full px-2 py-0.5 font-medium ${SUBJECT_CHIP[subjectKey]}`}>{subjectLabel}</span>
          <span className="rounded-full bg-bg-2 px-2 py-0.5 font-medium text-ink-2">{gt(gameType)}</span>
        </div>
        <h3 className="mt-3 font-display text-lg font-bold text-ink md:text-xl">{title}</h3>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{duration}</span>
          <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{questions} {t("questionsLabel")}</span>
        </div>
        <Link
          href={`/kind/spelen/${id}`}
          className="mt-auto inline-flex w-fit items-center rounded-lexi bg-primary px-4 py-2 text-sm font-medium text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t("start")}
        </Link>
      </div>
      <div className="rounded-lexi border border-line-2 bg-bg-2 p-3">
        <Preview />
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

---

### Task 4: KidHeader

**Files:** `src/components/kid/kid-header.tsx`

```tsx
import { useTranslations } from "next-intl";
import { Coins } from "lucide-react";
import { MascotImage } from "@/components/ui/mascot";

type Props = { coins: number };

export function KidHeader({ coins }: Props) {
  const t = useTranslations("kid.header");
  return (
    <header className="border-b border-line-2 bg-card">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <MascotImage style="bot" age="kid" size={36} decorative className="h-9 w-9" />
          <span className="font-display text-lg font-bold tracking-tight text-ink">Lexi.kids</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-sun-soft px-3 py-1.5 text-sm font-semibold text-ink">
            <Coins className="h-4 w-4" />
            <span>{coins}</span>
            <span className="text-xs font-medium text-ink-2">{t("coins")}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft" aria-label={t("avatar")}>
            <MascotImage style="bot" age="kid" size={28} decorative className="h-7 w-7" />
          </div>
        </div>
      </div>
    </header>
  );
}
```

- [ ] Build:
```bash
npm run build
```

---

### Task 5: DailyGreeting + MijnVakken + SubjectTile + QuizzenVoorJou

**Files:**
- `src/components/kid/daily-greeting.tsx`
- `src/components/kid/mijn-vakken.tsx`
- `src/components/kid/subject-tile.tsx`
- `src/components/kid/quizzen-voor-jou.tsx`

- [ ] **`daily-greeting.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { MascotImage } from "@/components/ui/mascot";

export function DailyGreeting() {
  const t = useTranslations("kid.greeting");
  return (
    <section className="rounded-lexi-lg border border-primary bg-primary-soft p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <MascotImage style="bot" age="hero" size={80} decorative className="h-20 w-20 shrink-0" />
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold text-ink sm:text-xl">{t("title")}</h2>
          <p className="mt-1 text-sm text-ink-2">{t("sub")}</p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **`subject-tile.tsx`**

```tsx
import { Calculator, Type, BookOpen, Globe, Languages, type LucideIcon } from "lucide-react";

type Props = {
  id: "rekenen" | "taal" | "lezen" | "engels" | "wereld";
  label: string;
  pct: number;
  tint: string;
  barColor: string;
};

const ICON: Record<Props["id"], LucideIcon> = {
  rekenen: Calculator,
  taal: Type,
  lezen: BookOpen,
  engels: Languages,
  wereld: Globe,
};

export function SubjectTile({ id, label, pct, tint, barColor }: Props) {
  const Icon = ICON[id];
  return (
    <div className={`rounded-lexi-lg border border-line ${tint} p-4`}>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-ink" />
        <span className="font-display text-base font-bold text-ink">{label}</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-card/60">
        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
```

- [ ] **`mijn-vakken.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { SubjectTile } from "./subject-tile";

type Subject = {
  id: "rekenen" | "taal" | "lezen" | "engels" | "wereld";
  pct: number;
  tint: string;
  barColor: string;
};

type Props = { subjects: Subject[] };

export function MijnVakken({ subjects }: Props) {
  const t = useTranslations("kid.mijnVakken");
  const s = useTranslations("kid.subjects");
  return (
    <section>
      <h2 className="font-display text-base font-bold uppercase tracking-wider text-ink-2">
        {t("title")}
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-3">
        {subjects.map((sub) => (
          <li key={sub.id}>
            <SubjectTile id={sub.id} label={s(sub.id)} pct={sub.pct} tint={sub.tint} barColor={sub.barColor} />
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **`quizzen-voor-jou.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { QuizCard } from "./quiz-card";

type Quiz = {
  id: string;
  title: string;
  subjectKey: "rekenen" | "taal" | "lezen" | "engels" | "wereld";
  gameType: "mc" | "type" | "match" | "drag-order";
  duration: string;
  questions: number;
};

type Props = { quizzes: Quiz[] };

export function QuizzenVoorJou({ quizzes }: Props) {
  const t = useTranslations("kid.quizzen");
  const s = useTranslations("kid.subjects");
  return (
    <section>
      <h2 className="font-display text-base font-bold uppercase tracking-wider text-ink-2">
        {t("title")}
      </h2>
      <ul className="mt-3 space-y-4">
        {quizzes.map((q) => (
          <li key={q.id}>
            <QuizCard
              id={q.id}
              title={q.title}
              subjectKey={q.subjectKey}
              subjectLabel={s(q.subjectKey)}
              gameType={q.gameType}
              duration={q.duration}
              questions={q.questions}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] Build:
```bash
npm run build
```

---

### Task 6: `/kind` page

**Files:** `src/app/kind/page.tsx`

```tsx
import { KidHeader } from "@/components/kid/kid-header";
import { DailyGreeting } from "@/components/kid/daily-greeting";
import { MijnVakken } from "@/components/kid/mijn-vakken";
import { QuizzenVoorJou } from "@/components/kid/quizzen-voor-jou";

const KID = { coins: 120 };

const SUBJECTS = [
  { id: "rekenen" as const, pct: 78, tint: "bg-teal-soft", barColor: "bg-teal" },
  { id: "taal"    as const, pct: 64, tint: "bg-primary-soft", barColor: "bg-primary" },
  { id: "lezen"   as const, pct: 71, tint: "bg-sun-soft", barColor: "bg-sun" },
];

const QUIZZES = [
  { id: "tafels-5-6",     title: "Tafels van 5 en 6",       subjectKey: "rekenen" as const, gameType: "mc"         as const, duration: "5 min", questions: 10 },
  { id: "spelling-dt",    title: "Spelling — d of t",       subjectKey: "taal"    as const, gameType: "type"       as const, duration: "8 min", questions: 10 },
  { id: "engelse-dieren", title: "Engelse dieren",          subjectKey: "engels"  as const, gameType: "match"      as const, duration: "6 min", questions: 10 },
  { id: "breuken-volg",   title: "Breuken op volgorde",     subjectKey: "rekenen" as const, gameType: "drag-order" as const, duration: "7 min", questions: 10 },
];

export default function KindPage() {
  return (
    <>
      <KidHeader coins={KID.coins} />
      <main id="main-content" className="mx-auto max-w-[1100px] space-y-8 px-5 py-8">
        <DailyGreeting />
        <MijnVakken subjects={SUBJECTS} />
        <QuizzenVoorJou quizzes={QUIZZES} />
      </main>
    </>
  );
}
```

- [ ] Build:
```bash
npm run build
```

Expected: `/kind` in route table.

---

### Task 7: Playwright E2E

**Files:** `tests/e2e/kid.spec.ts`

```ts
import { test, expect } from "@playwright/test";

test("kid home — header, greeting, quizzes visible", async ({ page }) => {
  await page.goto("/kind");

  // Coin counter
  await expect(page.getByText(/120/).first()).toBeVisible();

  // Greeting
  await expect(page.getByRole("heading", { name: /Klaar voor de quiz van vandaag\?/ })).toBeVisible();

  // Mijn vakken section
  await expect(page.getByText(/Mijn vakken/i)).toBeVisible();

  // At least 4 quiz titles
  await expect(page.getByText("Tafels van 5 en 6")).toBeVisible();
  await expect(page.getByText(/Spelling — d of t/)).toBeVisible();
  await expect(page.getByText("Engelse dieren")).toBeVisible();
  await expect(page.getByText("Breuken op volgorde")).toBeVisible();

  // Start link routes to /kind/spelen/<id>
  const firstStart = page.getByRole("link", { name: /^Start$/ }).first();
  await expect(firstStart).toHaveAttribute("href", "/kind/spelen/tafels-5-6");
});
```

- [ ] Run:
```bash
npm run test:e2e
```
Expected: 4 passing (1 landing + 2 signup + 1 kid).

---

### Task 8: Final acceptance

- [ ] **Step 1: Modify `.lighthouserc.cjs`**: add `"http://localhost:3000/kind"` to `collect.url`.

- [ ] **Step 2:**
```bash
npm run build && npm test && npm run test:e2e && npm run lighthouse
```

Expected: build clean, tests 14/14, e2e 4/4, lighthouse passes both gates for all 3 URLs.

- [ ] **Step 3:** Cleanup node. Report. No commits.
