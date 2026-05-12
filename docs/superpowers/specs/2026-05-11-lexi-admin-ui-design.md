# Lexi.kids — `/admin/quizzen` UI Mock (Phase 5-UI) Design

**Date:** 2026-05-11
**Target visual:** `Downloads/website Lexi 2.0 (1)/pages/admin.png`
**Phase:** 5-UI — visual-only admin table. No CRUD, no real auth gate.

## Goal

A `/admin/quizzen` route showing a "Quizzen & toetsen" table with hardcoded quiz rows (title, subject, groep, game type, question count, status), a "+ Nieuwe quiz" CTA, and a "Bekijk als kind" link. Matches the table layout in `admin.png`.

## Non-goals

- Real CRUD
- Role gate (Clerk admin role)
- "+ Nieuwe quiz" actually creating a quiz — links to a future `/admin/quizzen/nieuw` that 404s
- Inline editing
- Search / filter
- Pagination

## Architecture

Server Component renders hardcoded array of quizzes through an `<AdminQuizTable>` component. No state.

## Components

```
src/app/admin/quizzen/page.tsx              # server, hardcoded quiz data
src/components/admin/
  admin-header.tsx                          # server — brand + (placeholder) admin menu
  quiz-table.tsx                            # server — section title + actions + table
  quiz-row.tsx                              # server — single row
```

## Hardcoded mock data (in `page.tsx`)

```ts
const QUIZZES = [
  { id: "q1", title: "Tafels van 5 en 6",     subject: "Rekenen", groep: 5, gameType: "mc",         questions: 10, status: "live"    },
  { id: "q2", title: "Spelling — d of t",     subject: "Taal",    groep: 6, gameType: "type",       questions: 10, status: "concept" },
  { id: "q3", title: "Engelse dieren",        subject: "Engels",  groep: 7, gameType: "match",      questions: 10, status: "live"    },
  { id: "q4", title: "Breuken op volgorde",   subject: "Rekenen", groep: 6, gameType: "drag-order", questions: 10, status: "live"    },
  { id: "q5", title: "Werkwoordspelling",     subject: "Taal",    groep: 7, gameType: "type",       questions: 10, status: "concept" },
];
```

## i18n keys (`admin` namespace)

```
admin.title (page title)
admin.breadcrumb = "Admin · Content"
admin.quizzen.{title, viewAsKid, newQuiz}
admin.quizzen.columns = { title: "Quiz", subject: "Vak", groep: "Groep", gameType: "Speeltype", questions: "Vragen", status: "Status" }
admin.quizzen.status.{live, concept}
admin.quizzen.edit = "Bewerk"
```

Reuse existing `kid.gameType.*` keys for game-type labels (we already have those from Phase 4).

## Testing

- Playwright `tests/e2e/admin.spec.ts`: navigate `/admin/quizzen`, assert "Quizzen & toetsen" heading + at least 5 rows visible + "+ Nieuwe quiz" link.
- Add `/admin/quizzen` to `.lighthouserc.cjs`.

## Files

```
ADD:
  src/app/admin/quizzen/page.tsx
  src/components/admin/admin-header.tsx
  src/components/admin/quiz-table.tsx
  src/components/admin/quiz-row.tsx
  tests/e2e/admin.spec.ts

MODIFY:
  src/messages/nl-NL.json   (add admin namespace)
  .lighthouserc.cjs         (add admin URL)
```
