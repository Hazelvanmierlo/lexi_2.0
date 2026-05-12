# Lexi.kids — `/admin/quizzen` UI Mock (Phase 5-UI) Plan

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** `/admin/quizzen` page with a "Quizzen & toetsen" table of 5 hardcoded quiz rows.

**Spec:** `docs/superpowers/specs/2026-05-11-lexi-admin-ui-design.md`

## Executor notes
- Working dir `C:\Users\thoma\lexi_2.0`. No git commits.

---

### Task 1: Add `admin` namespace to `nl-NL.json`

Add this block as a sibling of `kid` (comma-separated):

```json
"admin": {
  "title": "Admin · Content",
  "breadcrumb": "Admin · Content",
  "quizzen": {
    "title": "Quizzen & toetsen",
    "viewAsKid": "Bekijk als kind →",
    "newQuiz": "+ Nieuwe quiz",
    "edit": "Bewerk",
    "columns": {
      "title":    "Quiz",
      "subject":  "Vak",
      "groep":    "Groep",
      "gameType": "Speeltype",
      "questions": "Vragen",
      "status":   "Status"
    },
    "status": {
      "live":    "Live",
      "concept": "Concept"
    }
  }
}
```

Verify:
```bash
npm run build
```

---

### Task 2: AdminHeader

`src/components/admin/admin-header.tsx`:

```tsx
import Link from "next/link";
import { Menu } from "lucide-react";
import { MascotImage } from "@/components/ui/mascot";

export function AdminHeader() {
  return (
    <header className="border-b border-line-2 bg-card">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <MascotImage style="bot" age="kid" size={28} decorative className="h-7 w-7" />
          <span className="font-display text-lg font-bold tracking-tight text-ink">Lexi.kids</span>
        </Link>
        <button
          type="button"
          aria-label="Menu"
          className="rounded-lexi border border-line bg-card p-2 text-ink hover:bg-bg-2"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
```

Build:
```bash
npm run build
```

---

### Task 3: QuizRow + QuizTable

#### `src/components/admin/quiz-row.tsx`

```tsx
import { useTranslations } from "next-intl";
import Link from "next/link";

type Status = "live" | "concept";

export type AdminQuiz = {
  id: string;
  title: string;
  subject: string;
  groep: number;
  gameType: "mc" | "type" | "match" | "drag-order";
  questions: number;
  status: Status;
};

const STATUS_CHIP: Record<Status, string> = {
  live:    "bg-ok-soft text-ink",
  concept: "bg-sun-soft text-ink",
};

export function QuizRow({ quiz }: { quiz: AdminQuiz }) {
  const t = useTranslations("admin.quizzen");
  const gt = useTranslations("kid.gameType");
  return (
    <tr className="border-t border-line-2">
      <td className="px-3 py-3 text-sm font-medium text-ink">{quiz.title}</td>
      <td className="px-3 py-3 text-sm text-ink-2">{quiz.subject}</td>
      <td className="px-3 py-3 text-sm font-mono text-ink-2">{quiz.groep}</td>
      <td className="px-3 py-3 text-sm text-ink-2">{gt(quiz.gameType)}</td>
      <td className="px-3 py-3 text-sm font-mono text-ink-2">{quiz.questions}</td>
      <td className="px-3 py-3">
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CHIP[quiz.status]}`}>
          {t(`status.${quiz.status}`)}
        </span>
      </td>
      <td className="px-3 py-3 text-right">
        <Link
          href={`/admin/quizzen/${quiz.id}`}
          className="rounded-lexi border border-line bg-card px-3 py-1 text-xs font-medium text-ink hover:bg-bg-2"
        >
          {t("edit")}
        </Link>
      </td>
    </tr>
  );
}
```

#### `src/components/admin/quiz-table.tsx`

```tsx
import { useTranslations } from "next-intl";
import Link from "next/link";
import { QuizRow, type AdminQuiz } from "./quiz-row";

type Props = { quizzes: AdminQuiz[] };

export function QuizTable({ quizzes }: Props) {
  const t = useTranslations("admin.quizzen");
  const col = useTranslations("admin.quizzen.columns");
  return (
    <section>
      <p className="font-mono text-xs uppercase tracking-wider text-ink-2">
        {useTranslations("admin")("breadcrumb")}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">{t("title")}</h1>
        <div className="flex items-center gap-3">
          <Link href="/kind" className="text-sm text-ink-2 hover:text-ink">
            {t("viewAsKid")}
          </Link>
          <Link
            href="/admin/quizzen/nieuw"
            className="inline-flex items-center rounded-lexi bg-primary px-4 py-2 text-sm font-medium text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t("newQuiz")}
          </Link>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto rounded-lexi-lg border border-line bg-card">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-ink-2">
              <th className="px-3 py-3 font-medium">{col("title")}</th>
              <th className="px-3 py-3 font-medium">{col("subject")}</th>
              <th className="px-3 py-3 font-medium">{col("groep")}</th>
              <th className="px-3 py-3 font-medium">{col("gameType")}</th>
              <th className="px-3 py-3 font-medium">{col("questions")}</th>
              <th className="px-3 py-3 font-medium">{col("status")}</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q) => <QuizRow key={q.id} quiz={q} />)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

Note: calling `useTranslations` inside JSX is a hack — refactor: move it to a normal `const breadcrumb = useTranslations("admin")("breadcrumb")` declaration at the top of the function. Fix that:

Replace the line `{useTranslations("admin")("breadcrumb")}` with `{breadcrumb}` and add `const breadcrumb = useTranslations("admin")("breadcrumb");` at the top of the function alongside `t` and `col`.

Build:
```bash
npm run build
```

---

### Task 4: `/admin/quizzen` page

`src/app/admin/quizzen/page.tsx`:

```tsx
import { AdminHeader } from "@/components/admin/admin-header";
import { QuizTable } from "@/components/admin/quiz-table";
import type { AdminQuiz } from "@/components/admin/quiz-row";

const QUIZZES: AdminQuiz[] = [
  { id: "q1", title: "Tafels van 5 en 6",     subject: "Rekenen", groep: 5, gameType: "mc",         questions: 10, status: "live"    },
  { id: "q2", title: "Spelling — d of t",     subject: "Taal",    groep: 6, gameType: "type",       questions: 10, status: "concept" },
  { id: "q3", title: "Engelse dieren",        subject: "Engels",  groep: 7, gameType: "match",      questions: 10, status: "live"    },
  { id: "q4", title: "Breuken op volgorde",   subject: "Rekenen", groep: 6, gameType: "drag-order", questions: 10, status: "live"    },
  { id: "q5", title: "Werkwoordspelling",     subject: "Taal",    groep: 7, gameType: "type",       questions: 10, status: "concept" },
];

export default function AdminQuizzenPage() {
  return (
    <>
      <AdminHeader />
      <main id="main-content" className="mx-auto max-w-[1200px] px-5 py-10">
        <QuizTable quizzes={QUIZZES} />
      </main>
    </>
  );
}
```

Build:
```bash
npm run build
```

Expected: `/admin/quizzen` in route table.

---

### Task 5: E2E + Lighthouse acceptance

#### `tests/e2e/admin.spec.ts`

```ts
import { test, expect } from "@playwright/test";

test("admin quizzen — table renders with rows + new-quiz CTA", async ({ page }) => {
  await page.goto("/admin/quizzen");
  await expect(page.getByRole("heading", { name: /Quizzen & toetsen/ })).toBeVisible();
  await expect(page.getByText("Tafels van 5 en 6")).toBeVisible();
  await expect(page.getByText("Engelse dieren")).toBeVisible();
  await expect(page.getByText("Werkwoordspelling")).toBeVisible();
  await expect(page.getByRole("link", { name: /\+ Nieuwe quiz/ })).toBeVisible();
});
```

#### Modify `.lighthouserc.cjs` `collect.url`

Add `"http://localhost:3000/admin/quizzen"` to the array.

#### Run full battery

```bash
npm run build && npm test && npm run test:e2e && npm run lighthouse
```

Expected: clean, 14/14 unit, 5/5 E2E, all 4 URLs pass gates.

Cleanup node processes. Report. No commits.
