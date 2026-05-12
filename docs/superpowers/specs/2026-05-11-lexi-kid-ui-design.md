# Lexi.kids — `/kind` Kid Home UI Mock (Phase 4-UI) Design

**Date:** 2026-05-11
**Phase:** 4-UI — visual-only kid home. No game logic, no real session persistence. Backend phases later.
**Target visual:** `Downloads/website Lexi 2.0 (1)/pages/kid.png`

## Goal

A `/kind` route that matches `kid.png`: kid-friendly header with coin counter + mascot avatar, daily greeting card, subject progress tiles, and a list of quiz cards each with a game-type preview embedded inside. Pure visual mock — clicking "Start" on a quiz routes to `/kind/spelen/<id>` which 404s.

## Non-goals

- Game logic (no scoring, no question flow)
- Real coin/avatar/session state
- Real kid auth
- Game-type playable previews — only static, illustrative
- All 5 game types per README §8 — we ship 4 representative previews (MC, type, match, drag-order); catapult deferred (too physics-heavy to mock visually)

## Architecture

`/kind/page.tsx` is a Server Component rendering hardcoded mock data. No state, no interactivity except hover effects and route clicks. All copy via `useTranslations("kid")`. Mascot via existing `MascotImage` atom.

## Component tree

```
/kind/page.tsx                                    # server, hardcoded mock data
  <KidHeader />                                   # server — brand + coin counter
  <main>
    <DailyGreeting />                             # server — mascot + greeting card
    <MijnVakken />                                # server — 3 subject tiles with progress
    <QuizzenVoorJou />                            # server — list of QuizCards
  </main>
```

```
src/components/kid/
  kid-header.tsx        # server — Lexi.kids logo + coin pill + avatar circle
  daily-greeting.tsx    # server — purple-soft card with mascot + "Klaar voor de quiz?"
  mijn-vakken.tsx       # server — 3 subject tiles with progress bars
  subject-tile.tsx      # server — single subject tile component
  quizzen-voor-jou.tsx  # server — section wrapper for the quiz list
  quiz-card.tsx         # server — single quiz card with embedded preview
  previews/
    mc-preview.tsx           # 2x2 grid mock
    type-preview.tsx         # text input mock
    match-preview.tsx        # 2-column pair mock
    drag-order-preview.tsx   # horizontal items mock
```

## Hardcoded mock data

In `kid/page.tsx`:

```ts
const KID = { name: "Sara", coins: 120 };
const SUBJECTS = [
  { id: "rekenen", label: "Rekenen", pct: 78, tint: "bg-teal-soft", barColor: "bg-teal" },
  { id: "taal",    label: "Taal",    pct: 64, tint: "bg-primary-soft", barColor: "bg-primary" },
  { id: "lezen",   label: "Lezen",   pct: 71, tint: "bg-sun-soft", barColor: "bg-sun" },
];
const QUIZZES = [
  { id: "tafels-5-6",  title: "Tafels van 5 en 6",          subject: "Rekenen", gameType: "mc",         duration: "5 min", questions: 10 },
  { id: "spelling-dt", title: "Spelling — d of t",          subject: "Taal",    gameType: "type",       duration: "8 min", questions: 10 },
  { id: "engelse-dieren", title: "Engelse dieren",          subject: "Engels",  gameType: "match",      duration: "6 min", questions: 10 },
  { id: "breuken",     title: "Breuken op volgorde",        subject: "Rekenen", gameType: "drag-order", duration: "7 min", questions: 10 },
];
```

## Components — what each does

### `<KidHeader>` (server)
Sticky top bar. Three regions: brand mark "Lexi.kids" (left, with small mascot), coin pill (center-right), avatar circle (right). Coin pill: yellow `bg-sun-soft` rounded pill with `Coins` icon + number. Avatar circle: 36px circle with mascot `bot/kid` image.

### `<DailyGreeting>` (server)
Full-width card with `bg-primary-soft`. Layout: mascot left (`bot/hero`, ~80px), greeting copy right ("Klaar voor de quiz van vandaag?"). Big "Start" button below or to the side.

### `<MijnVakken>` (server)
Section titled "Mijn vakken". Grid of `<SubjectTile>`s.

### `<SubjectTile>` (server)
Tile with subject icon (Lucide based on subject id), label, and a small progress bar at the bottom showing `pct` filled with `barColor`.

### `<QuizzenVoorJou>` (server)
Section titled "Quizzen voor jou" (or "Quizzen vandaag"). Maps over `QUIZZES` to render `<QuizCard>`s.

### `<QuizCard>` (server)
Horizontal card. Left side: subject chip (`bg-<subject>-soft text-<subject>-ink`), title, metadata (duration, questions), "Start" button. Right side: a 200×140-ish preview rendered by one of `<McPreview>`, `<TypePreview>`, `<MatchPreview>`, `<DragOrderPreview>` based on `gameType`. The preview is static, decorative, no interactivity.

### Game-type previews (all server, all decorative)

- `<McPreview>`: 2×2 grid of 4 option chips (e.g., "12", "24", "30", "35"), one highlighted in `bg-primary-soft border-primary`.
- `<TypePreview>`: a labeled text input with a partial value typed and a cursor (just an underscore character), e.g., "loo_".
- `<MatchPreview>`: 2 columns of 3 cards each ("dog/hond", "cat/kat", "bird/vogel") with one pair connected via a soft line (or just colored backgrounds matching).
- `<DragOrderPreview>`: a row of 4 chips with grip icons ("1/2", "1/4", "3/4", "1/3"), suggesting they can be reordered.

## i18n keys (added to `nl-NL.json`)

```
kid.title (page title)
kid.greeting.title = "Klaar voor de quiz van vandaag?"
kid.greeting.sub   = "Verdien munten met goed antwoorden."
kid.greeting.cta   = "Start"
kid.mijnVakken.title = "Mijn vakken"
kid.quizzen.title = "Quizzen voor jou"
kid.quizCard.{start, durationLabel, questionsLabel}
kid.gameType.{mc, type, match, drag-order}.{label}
kid.subjects.{rekenen, taal, lezen, engels, wereld}  // reused as chips
```

BE overrides as needed (limited — most copy is region-neutral kid-facing words).

## Data flow

None. Page is fully server-rendered from hardcoded constants. Real session/coins/quizzes come in Phase 4-backend.

## Testing

- No new Vitest. Components are pure render.
- Playwright: one new spec `tests/e2e/kid.spec.ts`:
  - Navigate `/kind`.
  - Assert "Klaar voor de quiz van vandaag?" visible.
  - Assert at least 4 quiz card titles visible.
  - Assert coin counter shows "120".
- Lighthouse: add `/kind` to `.lighthouserc.cjs` `collect.url`. Target perf ≥ 0.9, a11y ≥ 0.95.

## Files

```
ADD:
  src/app/kind/page.tsx
  src/components/kid/kid-header.tsx
  src/components/kid/daily-greeting.tsx
  src/components/kid/mijn-vakken.tsx
  src/components/kid/subject-tile.tsx
  src/components/kid/quizzen-voor-jou.tsx
  src/components/kid/quiz-card.tsx
  src/components/kid/previews/mc-preview.tsx
  src/components/kid/previews/type-preview.tsx
  src/components/kid/previews/match-preview.tsx
  src/components/kid/previews/drag-order-preview.tsx
  tests/e2e/kid.spec.ts

MODIFY:
  src/messages/nl-NL.json   (add `kid` namespace)
  src/messages/nl-BE.json   (no overrides needed unless any string is region-specific)
  .lighthouserc.cjs         (add /kind URL)
```
