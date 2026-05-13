# Lexi.kids — Engagement Layer + Content Analytics: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the engagement layer (weekly minutes north-star + healthy streak + drop-off resume) and content-team analytics dashboard, both backed by a write-through aggregation foundation. Spec at [`docs/superpowers/specs/2026-05-13-lexi-engagement-design.md`](../specs/2026-05-13-lexi-engagement-design.md).

**Architecture:** Two new Prisma tables (`DailyKidStat`, `QuestionStat`) updated atomically inside `finishSession()`. Pure-logic helpers (`focused-ms`, `local-date`, `streak`, `quiz-health`, `engagement`) each in their own small file, all unit-tested. UI added incrementally: `<WeekProgress>` + streak chip + `<ResumeCard>` on `/kind`; week bar + sparkline + streak/grace chips on `/ouder`; per-question stats table on `/admin/quizzen/[id]`. Optional `NEXT_PUBLIC_ENGAGEMENT_UI` flag for decoupled rollout.

**Tech Stack:** Next.js 16 App Router + TypeScript, Prisma 7 + Supabase Postgres, Vitest, Playwright, Lucide icons, next-intl.

---

## Deviations / open assumptions

- **Backfill is included** as Task 16; the spec lists it as "optional, recommended". Treat as part of the rollout to give existing users non-empty stats from day one.
- **`NEXT_PUBLIC_ENGAGEMENT_UI` flag** included in Task 17 per the spec's rollback option. Default `true` so the UI ships; flip false to hide while keeping the write path.

## File inventory

| Path | New / Modify | Purpose |
|---|---|---|
| `prisma/schema.prisma` | Modify | Add `DailyKidStat` + `QuestionStat`. |
| `src/lib/focused-ms.ts` | New | `focusedMsForEntry(msSpent)` (cap at 90s) + `focusedMsForSession(entries)`. |
| `src/lib/focused-ms.test.ts` | New | Unit tests for cap + aggregation. |
| `src/lib/local-date.ts` | New | `localDateFor(now)` returns `YYYY-MM-DD` in Europe/Amsterdam; `mondayLocal(now)`, `sundayLocal(now)`. |
| `src/lib/local-date.test.ts` | New | DST-boundary + year-boundary cases. |
| `src/lib/streak.ts` | New | `computeStreak(days, cfg, now)` pure function. |
| `src/lib/streak.test.ts` | New | Unit tests (all spec §3.3 cases). |
| `src/lib/quiz-health.ts` | New | `questionHealth(stat)` returns flag enum. |
| `src/lib/quiz-health.test.ts` | New | Boundary cases for each flag. |
| `src/lib/engagement.ts` | Modify | Add `AGE_BAND_DEFAULTS` + `weekProgressFor(kidId, now)` + types. |
| `src/lib/engagement.test.ts` | Modify | Extend with defaults access + `weekProgressFor` pure-helper tests. |
| `src/app/kind/spelen/actions.ts` | Modify | Add stats upserts inside `finishSession` transaction; add stale-session sweep at `startSession` start. |
| `src/app/kind/spelen/actions.test.ts` | New | Integration: stats write + atomicity + sweep. |
| `src/components/kid/week-progress.tsx` | New | Klein/Groot age-banded variant rendering. |
| `src/components/kid/streak-chip.tsx` | New | Lucide Flame + N dagen op rij. |
| `src/components/kid/resume-card.tsx` | New | Resume CTA card. |
| `src/app/kind/page.tsx` | Modify | Add WeekProgress + StreakChip + ResumeCard sections; load `weekProgressFor` + `computeStreak` data; check IN_PROGRESS session. |
| `src/components/ouder/kid-week-panel.tsx` | New | Per-kid panel with progress bar + sparkline + chips. |
| `src/components/ouder/sparkline.tsx` | New | Tiny inline SVG 7-bar chart. |
| `src/app/ouder/page.tsx` | Modify | Render the new per-kid panels. |
| `src/components/admin/quiz-stats-row.tsx` | New | Single-question stats row for admin detail. |
| `src/app/admin/quizzen/page.tsx` | Modify | Add attempts + completion % + health flag columns. |
| `src/app/admin/quizzen/[id]/page.tsx` | Modify | Add "Statistieken" section above questions list. |
| `src/messages/nl-NL.json` | Modify | Add ~25 i18n keys under `kid.weekProgress.*`, `kid.streak.*`, `kid.resume.*`, `ouder.weekly.*`, `admin.stats.*`. |
| `src/messages/nl-BE.json` | Modify | Add any nl-BE overrides (e.g. "deze week" vs "deze week" — likely identical for v1; explicit override only where needed). |
| `scripts/backfill-engagement-stats.ts` | New | Replay completed Sessions, populate DailyKidStat + QuestionStat. |
| `package.json` | Modify | Add `db:backfill-engagement` script. |
| `tests/e2e/engagement.spec.ts` | New | Klein + Groot week progress + streak with grace + admin stats rendering. |

---

## Phase 0 — Schema & branch hygiene

### Task 1: Add `DailyKidStat` + `QuestionStat` to Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Edit schema**

In `prisma/schema.prisma`, after the existing `Session` model (or anywhere coherent), add:

```prisma
model DailyKidStat {
  id                String   @id @default(cuid())
  kidId             String
  kid               Kid      @relation(fields: [kidId], references: [id], onDelete: Cascade)
  date              DateTime @db.Date
  focusedMs         Int      @default(0)
  sessionsStarted   Int      @default(0)
  sessionsCompleted Int      @default(0)
  questionsAnswered Int      @default(0)
  correctAnswered   Int      @default(0)

  @@unique([kidId, date])
  @@index([kidId, date(sort: Desc)])
}

model QuestionStat {
  questionId       String   @id
  question         Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  attempts         Int      @default(0)
  correctCount     Int      @default(0)
  focusedMsSum     BigInt   @default(0)
  abandonsAfter    Int      @default(0)
  distractorCounts Json     @default("{}")
  updatedAt        DateTime @updatedAt
}
```

Also add **inverse relations** to existing models:

In `model Kid { ... }` add:
```prisma
  dailyStats   DailyKidStat[]
```

In `model Question { ... }` add:
```prisma
  stat         QuestionStat?
```

- [ ] **Step 2: Push schema**

Run:
```bash
npx prisma db push
```

Expected: "Your database is now in sync with your Prisma schema."

- [ ] **Step 3: Regenerate client**

```bash
npx prisma generate
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(engagement): add DailyKidStat and QuestionStat tables"
```

---

## Phase 1 — Pure libraries (TDD-first)

### Task 2: `focused-ms.ts` — cap helper

**Files:**
- Create: `src/lib/focused-ms.ts`, `src/lib/focused-ms.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/focused-ms.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { focusedMsForEntry, focusedMsForSession, FOCUSED_CAP_MS } from "./focused-ms";

describe("focused-ms", () => {
  it("FOCUSED_CAP_MS equals 90s", () => {
    expect(FOCUSED_CAP_MS).toBe(90_000);
  });

  it("returns msSpent when below cap", () => {
    expect(focusedMsForEntry({ msSpent: 30_000 })).toBe(30_000);
  });

  it("caps at FOCUSED_CAP_MS when above", () => {
    expect(focusedMsForEntry({ msSpent: 300_000 })).toBe(90_000);
  });

  it("returns 0 for negative or NaN", () => {
    expect(focusedMsForEntry({ msSpent: -1 })).toBe(0);
    expect(focusedMsForEntry({ msSpent: Number.NaN })).toBe(0);
  });

  it("sums and caps across entries in focusedMsForSession", () => {
    const entries = [{ msSpent: 30_000 }, { msSpent: 200_000 }, { msSpent: 0 }];
    expect(focusedMsForSession(entries)).toBe(30_000 + 90_000 + 0);
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

```bash
npx vitest run src/lib/focused-ms.test.ts
```

- [ ] **Step 3: Implement**

`src/lib/focused-ms.ts`:
```ts
export const FOCUSED_CAP_MS = 90_000;

export function focusedMsForEntry(entry: { msSpent: number }): number {
  const ms = entry.msSpent;
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.min(ms, FOCUSED_CAP_MS);
}

export function focusedMsForSession(entries: ReadonlyArray<{ msSpent: number }>): number {
  return entries.reduce((sum, e) => sum + focusedMsForEntry(e), 0);
}
```

- [ ] **Step 4: Run, verify PASS, commit**

```bash
npx vitest run src/lib/focused-ms.test.ts
git add src/lib/focused-ms.ts src/lib/focused-ms.test.ts
git commit -m "feat(engagement): focused-ms cap helper"
```

---

### Task 3: `local-date.ts` — Europe/Amsterdam day helpers

**Files:**
- Create: `src/lib/local-date.ts`, `src/lib/local-date.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/local-date.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { localDateFor, mondayLocal, sundayLocal } from "./local-date";

describe("local-date", () => {
  it("returns local date in Europe/Amsterdam", () => {
    // 22:00 UTC on 2026-05-13 = 00:00 local on 2026-05-14 (CEST = UTC+2)
    expect(localDateFor(new Date("2026-05-13T22:00:00Z"))).toBe("2026-05-14");
    // 21:00 UTC on 2026-05-13 = 23:00 local on 2026-05-13
    expect(localDateFor(new Date("2026-05-13T21:00:00Z"))).toBe("2026-05-13");
  });

  it("mondayLocal returns the Monday of the week", () => {
    // 2026-05-13 is a Wednesday; Monday = 2026-05-11
    expect(localDateFor(mondayLocal(new Date("2026-05-13T12:00:00Z")))).toBe("2026-05-11");
  });

  it("sundayLocal returns the Sunday of the week", () => {
    expect(localDateFor(sundayLocal(new Date("2026-05-13T12:00:00Z")))).toBe("2026-05-17");
  });

  it("handles year boundaries correctly", () => {
    // 2026-12-31 23:30 UTC = 2027-01-01 00:30 local
    expect(localDateFor(new Date("2026-12-31T23:30:00Z"))).toBe("2027-01-01");
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Implement**

`src/lib/local-date.ts`:
```ts
const TZ = "Europe/Amsterdam";

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "2026-05-13" for the local day in Europe/Amsterdam. */
export function localDateFor(now: Date): string {
  return dateFmt.format(now);
}

function partsFor(now: Date): { y: number; m: number; d: number } {
  const [y, m, d] = localDateFor(now).split("-").map(Number);
  return { y, m, d };
}

function utcMidnightOfLocalDate(y: number, m: number, d: number): Date {
  // Construct UTC midnight for the given local Y-M-D, then offset back to make it 00:00 in Amsterdam.
  // Simpler approach: build a date string and parse with TZ-aware Intl.
  const guess = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  // Adjust by Amsterdam's offset on that date (1h winter, 2h summer)
  const offsetMin = amsterdamOffsetMinutes(guess);
  return new Date(guess.getTime() - offsetMin * 60_000);
}

function amsterdamOffsetMinutes(d: Date): number {
  const local = new Date(d.toLocaleString("en-US", { timeZone: TZ }));
  const utc = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }));
  return (local.getTime() - utc.getTime()) / 60_000;
}

/** Returns a Date pointing at Monday 00:00 local of the week containing `now`. */
export function mondayLocal(now: Date): Date {
  const { y, m, d } = partsFor(now);
  // Use UTC math to find day of week, then shift
  const baseUtc = Date.UTC(y, m - 1, d);
  const dow = new Date(baseUtc).getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysBackToMonday = dow === 0 ? 6 : dow - 1;
  const targetUtc = baseUtc - daysBackToMonday * 86_400_000;
  const tt = new Date(targetUtc);
  return utcMidnightOfLocalDate(tt.getUTCFullYear(), tt.getUTCMonth() + 1, tt.getUTCDate());
}

/** Returns a Date pointing at Sunday 23:59:59.999 local of the week containing `now`. */
export function sundayLocal(now: Date): Date {
  const mon = mondayLocal(now);
  // 6 days + 23:59:59.999 later
  return new Date(mon.getTime() + 6 * 86_400_000 + 86_399_999);
}
```

(Note: the `localDateFor` function uses `Intl.DateTimeFormat` with `en-CA` locale which yields ISO-style `YYYY-MM-DD` — the cleanest cross-platform way to get a local date in a specific TZ.)

- [ ] **Step 4: Run, verify PASS, commit**

```bash
npx vitest run src/lib/local-date.test.ts
git add src/lib/local-date.ts src/lib/local-date.test.ts
git commit -m "feat(engagement): local-date helpers for Europe/Amsterdam"
```

---

### Task 4: `streak.ts` — pure streak + grace-token logic

**Files:**
- Create: `src/lib/streak.ts`, `src/lib/streak.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/streak.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { computeStreak } from "./streak";

const cfg = { dailyMinuteThreshold: 5, graceTokensPerWeek: 2 };

function days(focusedMs: number[], startDate = "2026-05-07"): { date: string; focusedMs: number }[] {
  // Generate consecutive dates starting from startDate
  return focusedMs.map((ms, i) => {
    const d = new Date(`${startDate}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    return { date: d.toISOString().slice(0, 10), focusedMs: ms };
  });
}

describe("computeStreak", () => {
  const today = new Date("2026-05-13T12:00:00Z"); // Wednesday

  it("returns 0 for empty input", () => {
    expect(computeStreak([], cfg, today)).toEqual({
      streak: 0,
      graceTokensLeft: 2,
      dailyHit: [],
    });
  });

  it("counts consecutive days meeting threshold (looking back from yesterday)", () => {
    // last 6 days, all hit threshold (5 min = 300_000 ms)
    const input = days([300_000, 300_000, 300_000, 300_000, 300_000, 300_000]);
    const r = computeStreak(input, cfg, today);
    expect(r.streak).toBe(5); // yesterday and 4 before = 5; today not counted
  });

  it("a missed day spends a grace token", () => {
    // Mon-Tue play, Wed gap, Thu-Tue play; today is Wed (so streak looks back from Tue)
    const input = days([300_000, 300_000, 0, 300_000, 300_000, 300_000, 300_000]);
    const r = computeStreak(input, cfg, today);
    expect(r.streak).toBeGreaterThan(0);
    expect(r.graceTokensLeft).toBe(1);
  });

  it("two gaps with one token left → streak resets at second gap", () => {
    // simulate two missed days in the lookback
    const input = days([300_000, 0, 300_000, 0, 300_000, 300_000]);
    const r = computeStreak(input, cfg, today);
    // First gap eats one token; second gap → reset
    expect(r.streak).toBeLessThan(4);
  });

  it("ISO week boundary refreshes tokens", () => {
    // 14 days, with a gap in week 1 and a gap in week 2 — both should be absorbed (1 per week)
    const input = days([
      300_000, 300_000, 300_000, 0, 300_000, 300_000, 300_000, // week 1
      300_000, 300_000, 0, 300_000, 300_000, 300_000, 300_000, // week 2
    ], "2026-05-04"); // Monday
    const r = computeStreak(input, cfg, new Date("2026-05-18T12:00:00Z"));
    expect(r.streak).toBeGreaterThanOrEqual(10); // both gaps absorbed
  });

  it("dailyHit array matches input length", () => {
    const input = days([300_000, 0, 300_000]);
    const r = computeStreak(input, cfg, today);
    expect(r.dailyHit).toEqual([true, false, true]);
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Implement**

`src/lib/streak.ts`:
```ts
import { localDateFor } from "./local-date";

export type StreakInput = ReadonlyArray<{ date: string; focusedMs: number }>;
export type StreakConfig = { dailyMinuteThreshold: number; graceTokensPerWeek: number };

export type StreakResult = {
  /** Consecutive days hitting threshold, looking back from yesterday. */
  streak: number;
  /** Tokens available for the current ISO week. */
  graceTokensLeft: number;
  /** Per-input-row: did focusedMs meet the daily threshold? */
  dailyHit: boolean[];
};

const MS_IN_DAY = 86_400_000;

function isoWeekKey(dateStr: string): string {
  // YYYY-Www — used only for token-bucket boundaries.
  const d = new Date(`${dateStr}T12:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7; // Monday=0
  const thursday = new Date(d.getTime() + (3 - day) * MS_IN_DAY);
  const y = thursday.getUTCFullYear();
  const yearStart = new Date(Date.UTC(y, 0, 1));
  const weekNo = 1 + Math.round(
    ((thursday.getTime() - yearStart.getTime()) / MS_IN_DAY - 3 + ((yearStart.getUTCDay() + 6) % 7)) / 7,
  );
  return `${y}-W${String(weekNo).padStart(2, "0")}`;
}

export function computeStreak(
  days: StreakInput,
  cfg: StreakConfig,
  now: Date,
): StreakResult {
  const thresholdMs = cfg.dailyMinuteThreshold * 60_000;
  const dailyHit = days.map((d) => d.focusedMs >= thresholdMs);

  // Determine "yesterday" in local time
  const yesterdayDate = new Date(now.getTime() - MS_IN_DAY);
  const yesterdayKey = localDateFor(yesterdayDate);
  const todayKey = localDateFor(now);
  const currentWeek = isoWeekKey(todayKey);

  // Count tokens left for current week — start at full, subtract any spent on gaps within the current week
  // For simplicity we recompute by walking the input in chronological order, bucketed by week.

  // Sort defensively
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  // Walk forward, maintaining per-week token balance + a "stop streak" flag
  let streak = 0;
  let tokensLeftCurrentWeek = cfg.graceTokensPerWeek;
  const weekTokens = new Map<string, number>();

  // Build a date → hit map for quick lookup
  const hitByDate = new Map<string, boolean>();
  for (const d of sorted) {
    const ms = d.focusedMs;
    hitByDate.set(d.date, ms >= thresholdMs);
  }

  // Walk backward from yesterday day by day, looking up hit status
  let cursor = new Date(yesterdayDate);
  while (true) {
    const key = localDateFor(cursor);
    const wk = isoWeekKey(key);
    if (!weekTokens.has(wk)) weekTokens.set(wk, cfg.graceTokensPerWeek);

    const hit = hitByDate.get(key) ?? false;
    if (hit) {
      streak += 1;
      cursor = new Date(cursor.getTime() - MS_IN_DAY);
      continue;
    }
    // Missed day — try to spend a token from this week's bucket
    const left = weekTokens.get(wk) ?? 0;
    if (left > 0) {
      weekTokens.set(wk, left - 1);
      cursor = new Date(cursor.getTime() - MS_IN_DAY);
      continue;
    }
    // No tokens — streak breaks here
    break;
  }

  tokensLeftCurrentWeek = weekTokens.get(currentWeek) ?? cfg.graceTokensPerWeek;

  return { streak, graceTokensLeft: tokensLeftCurrentWeek, dailyHit };
}
```

- [ ] **Step 4: Run, verify PASS, commit**

```bash
npx vitest run src/lib/streak.test.ts
git add src/lib/streak.ts src/lib/streak.test.ts
git commit -m "feat(engagement): pure streak + grace-token logic"
```

---

### Task 5: `quiz-health.ts` — flag thresholds

**Files:**
- Create: `src/lib/quiz-health.ts`, `src/lib/quiz-health.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/quiz-health.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { questionHealth, HEALTH } from "./quiz-health";

describe("questionHealth", () => {
  it("returns insufficient-data below MIN_ATTEMPTS", () => {
    expect(questionHealth({ attempts: 10, correctCount: 5, abandonsAfter: 0 })).toBe("insufficient-data");
  });

  it("flags broken when correctPct < BROKEN_BELOW_PCT", () => {
    expect(questionHealth({ attempts: 100, correctCount: 20, abandonsAfter: 0 })).toBe("broken");
  });

  it("flags hard between BROKEN and HARD", () => {
    expect(questionHealth({ attempts: 100, correctCount: 40, abandonsAfter: 0 })).toBe("hard");
  });

  it("flags easy when correctPct > EASY_ABOVE_PCT", () => {
    expect(questionHealth({ attempts: 100, correctCount: 97, abandonsAfter: 0 })).toBe("easy");
  });

  it("flags abandon-hotspot when abandon ratio above threshold", () => {
    // 100 attempts, 30 abandons (30%) and healthy correctPct = abandon-hotspot wins
    expect(questionHealth({ attempts: 100, correctCount: 80, abandonsAfter: 30 })).toBe("abandon-hotspot");
  });

  it("returns ok otherwise", () => {
    expect(questionHealth({ attempts: 100, correctCount: 80, abandonsAfter: 5 })).toBe("ok");
  });

  it("HEALTH constants have spec values", () => {
    expect(HEALTH.MIN_ATTEMPTS_FOR_FLAGS).toBe(50);
    expect(HEALTH.BROKEN_BELOW_PCT).toBe(25);
    expect(HEALTH.HARD_BELOW_PCT).toBe(50);
    expect(HEALTH.EASY_ABOVE_PCT).toBe(95);
    expect(HEALTH.ABANDON_RATE_FLAG).toBeCloseTo(0.20);
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Implement**

`src/lib/quiz-health.ts`:
```ts
export const HEALTH = {
  MIN_ATTEMPTS_FOR_FLAGS: 50,
  BROKEN_BELOW_PCT: 25,
  HARD_BELOW_PCT: 50,
  EASY_ABOVE_PCT: 95,
  ABANDON_RATE_FLAG: 0.20,
} as const;

export type QuestionHealth =
  | "broken"
  | "hard"
  | "easy"
  | "abandon-hotspot"
  | "ok"
  | "insufficient-data";

export function questionHealth(stat: {
  attempts: number;
  correctCount: number;
  abandonsAfter: number;
}): QuestionHealth {
  if (stat.attempts < HEALTH.MIN_ATTEMPTS_FOR_FLAGS) return "insufficient-data";
  const pct = (stat.correctCount / stat.attempts) * 100;
  const abandonRate = stat.abandonsAfter / stat.attempts;
  if (abandonRate >= HEALTH.ABANDON_RATE_FLAG) return "abandon-hotspot";
  if (pct < HEALTH.BROKEN_BELOW_PCT) return "broken";
  if (pct < HEALTH.HARD_BELOW_PCT) return "hard";
  if (pct > HEALTH.EASY_ABOVE_PCT) return "easy";
  return "ok";
}
```

- [ ] **Step 4: Run, verify PASS, commit**

```bash
git add src/lib/quiz-health.ts src/lib/quiz-health.test.ts
git commit -m "feat(engagement): question health flag helper"
```

---

### Task 6: Extend `engagement.ts` with defaults + `weekProgressFor`

**Files:**
- Modify: `src/lib/engagement.ts`, `src/lib/engagement.test.ts`

- [ ] **Step 1: Extend file**

Append to `src/lib/engagement.ts`:
```ts
import { db } from "@/lib/db";
import { localDateFor, mondayLocal, sundayLocal } from "./local-date";

export const AGE_BAND_DEFAULTS = {
  klein: { weeklyMinutes: 60, dailyMinuteThreshold: 5, graceTokensPerWeek: 2 },
  groot: { weeklyMinutes: 90, dailyMinuteThreshold: 10, graceTokensPerWeek: 2 },
} as const;

export type WeekProgress = {
  weekStart: string;        // YYYY-MM-DD (Monday)
  weeklyGoalMs: number;
  focusedMsThisWeek: number;
  daysThisWeek: Array<{ date: string; focusedMs: number; hitDailyThreshold: boolean }>;
  pctOfGoal: number;
};

export async function weekProgressFor(
  kidId: string,
  groep: number,
  now: Date = new Date(),
): Promise<WeekProgress> {
  const band = ageBandFor(groep);
  const cfg = AGE_BAND_DEFAULTS[band];
  const weeklyGoalMs = cfg.weeklyMinutes * 60_000;
  const thresholdMs = cfg.dailyMinuteThreshold * 60_000;

  const monday = mondayLocal(now);
  const sunday = sundayLocal(now);

  type Row = { date: Date; focusedMs: number };
  const rows = (await db.dailyKidStat.findMany({
    where: { kidId, date: { gte: monday, lte: sunday } },
    select: { date: true, focusedMs: true },
    orderBy: { date: "asc" },
  })) as Row[];

  // Build 7-day window, zero-filling missing days
  const daysThisWeek: WeekProgress["daysThisWeek"] = [];
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getTime() + i * 86_400_000);
    const key = localDateFor(d);
    const row = rows.find((r) => localDateFor(r.date) === key);
    const ms = row?.focusedMs ?? 0;
    total += ms;
    daysThisWeek.push({ date: key, focusedMs: ms, hitDailyThreshold: ms >= thresholdMs });
  }

  return {
    weekStart: localDateFor(monday),
    weeklyGoalMs,
    focusedMsThisWeek: total,
    daysThisWeek,
    pctOfGoal: Math.min(100, Math.round((total / weeklyGoalMs) * 100)),
  };
}
```

- [ ] **Step 2: Extend tests**

Append to `src/lib/engagement.test.ts`:
```ts
import { AGE_BAND_DEFAULTS } from "./engagement";

describe("AGE_BAND_DEFAULTS", () => {
  it("klein has 60 weekly minutes, 5 daily threshold, 2 grace tokens", () => {
    expect(AGE_BAND_DEFAULTS.klein).toEqual({
      weeklyMinutes: 60,
      dailyMinuteThreshold: 5,
      graceTokensPerWeek: 2,
    });
  });

  it("groot has 90 weekly minutes, 10 daily threshold, 2 grace tokens", () => {
    expect(AGE_BAND_DEFAULTS.groot).toEqual({
      weeklyMinutes: 90,
      dailyMinuteThreshold: 10,
      graceTokensPerWeek: 2,
    });
  });
});
```

(Integration test for `weekProgressFor` lands in Task 7 alongside stats-writing tests.)

- [ ] **Step 3: Run + commit**

```bash
npx vitest run src/lib/engagement.test.ts
git add src/lib/engagement.ts src/lib/engagement.test.ts
git commit -m "feat(engagement): AGE_BAND_DEFAULTS and weekProgressFor"
```

---

## Phase 2 — Write-through aggregation

### Task 7: Add stats writes to `finishSession` + stale-session sweep to `startSession`

**Files:**
- Modify: `src/app/kind/spelen/actions.ts`
- Create: `src/app/kind/spelen/actions.test.ts`

This is the biggest task — the heart of the write-through aggregation. The agent dispatching this should read the existing `actions.ts` thoroughly first.

- [ ] **Step 1: Read existing actions.ts**

The file has three exports: `startSession`, `submitAnswer`, `finishSession`. We're modifying `startSession` (add sweep) and `finishSession` (add stats inside the existing transaction). `submitAnswer` is untouched.

- [ ] **Step 2: Add stale-session sweep to `startSession`**

At the top of `startSession`, before creating a new session row, add:
```ts
// Sweep this kid's stale IN_PROGRESS sessions (>30 min old).
const STALE_MS = 30 * 60 * 1000;
const staleCutoff = new Date(Date.now() - STALE_MS);

const stale = await db.session.findMany({
  where: {
    kidId,
    status: "IN_PROGRESS",
    startedAt: { lt: staleCutoff },
  },
  select: { id: true, perQuestion: true, quizId: true, startedAt: true },
});

for (const s of stale) {
  // Mark abandoned + write stats for the partial session
  const entries = Array.isArray(s.perQuestion) ? (s.perQuestion as Array<{ questionId: string; correct: boolean; msSpent: number }>) : [];
  await writeStatsForSession({
    sessionId: s.id,
    kidId,
    quizId: s.quizId,
    startedAt: s.startedAt,
    entries,
    finalStatus: "ABANDONED",
  });
  await db.session.update({
    where: { id: s.id },
    data: { status: "ABANDONED", finishedAt: new Date() },
  });
}
```

- [ ] **Step 3: Add the shared stats helper**

Add a private function in the same file (or a new helper at `src/lib/engagement-stats.ts` — pick based on size after writing):

```ts
async function writeStatsForSession(input: {
  sessionId: string;
  kidId: string;
  quizId: string;
  startedAt: Date;
  entries: Array<{ questionId: string; correct: boolean; msSpent: number }>;
  finalStatus: "COMPLETED" | "ABANDONED";
}) {
  // Imported at top of file:
  // import { localDateFor } from "@/lib/local-date";
  // import { focusedMsForEntry } from "@/lib/focused-ms";
  // import { validatePayload } from "@/lib/quiz-schemas";  // already imported

  if (input.entries.length === 0) return;

  const focusedMs = input.entries.reduce((sum, e) => sum + focusedMsForEntry(e), 0);
  const correctAnswered = input.entries.filter((e) => e.correct).length;
  const date = new Date(localDateFor(input.startedAt) + "T12:00:00Z"); // a noon-UTC anchor representing the local day

  // 1. DailyKidStat upsert
  await db.dailyKidStat.upsert({
    where: { kidId_date: { kidId: input.kidId, date } },
    update: {
      focusedMs: { increment: focusedMs },
      sessionsStarted: { increment: 1 },
      sessionsCompleted: { increment: input.finalStatus === "COMPLETED" ? 1 : 0 },
      questionsAnswered: { increment: input.entries.length },
      correctAnswered: { increment: correctAnswered },
    },
    create: {
      kidId: input.kidId,
      date,
      focusedMs,
      sessionsStarted: 1,
      sessionsCompleted: input.finalStatus === "COMPLETED" ? 1 : 0,
      questionsAnswered: input.entries.length,
      correctAnswered,
    },
  });

  // 2. Per-question QuestionStat upserts
  // For MC distractor tracking, we need to know the chosen index — entries should already carry this from the gradeAndScore step. If not, skip distractor tracking for now (acceptable v1).
  for (let i = 0; i < input.entries.length; i++) {
    const e = input.entries[i];
    const isLastAnswered = i === input.entries.length - 1;
    const abandonAfter = isLastAnswered && input.finalStatus === "ABANDONED" ? 1 : 0;

    await db.questionStat.upsert({
      where: { questionId: e.questionId },
      update: {
        attempts: { increment: 1 },
        correctCount: { increment: e.correct ? 1 : 0 },
        focusedMsSum: { increment: BigInt(focusedMsForEntry(e)) },
        abandonsAfter: { increment: abandonAfter },
      },
      create: {
        questionId: e.questionId,
        attempts: 1,
        correctCount: e.correct ? 1 : 0,
        focusedMsSum: BigInt(focusedMsForEntry(e)),
        abandonsAfter: abandonAfter,
      },
    });
  }
}
```

(Distractor tracking is deferred to a follow-up task. The current `perQuestion` JSON shape doesn't surface the chosen distractor index cleanly — adding it requires touching the grading step. Acceptable for v1.)

- [ ] **Step 4: Wire into `finishSession`**

Inside the existing `finishSession`, after the existing logic that updates the session and increments coins:

```ts
const entries = Array.isArray(session.perQuestion)
  ? (session.perQuestion as Array<{ questionId: string; correct: boolean; msSpent: number }>)
  : [];

await writeStatsForSession({
  sessionId,
  kidId: session.kidId,
  quizId,
  startedAt: session.startedAt,  // make sure this is selected in the existing findUnique
  entries,
  finalStatus: final.finalStatus,
});
```

Make sure to select `startedAt` in the `findUnique` at the top of `finishSession`.

**Atomic note:** the existing logic in `finishSession` uses individual `db.session.update`, `db.kid.update`, `db.masteryRecord.upsert` calls — not a `$transaction`. To keep stats truly atomic with the existing writes, wrap everything from "if (session.status === 'IN_PROGRESS')" through the stats write inside a `db.$transaction(async (tx) => { ... })` block. Inside the transaction, swap `db` for `tx`. This is a non-trivial refactor; do it carefully.

- [ ] **Step 5: Integration test**

`src/app/kind/spelen/actions.test.ts`:
- Creates a kid + quiz + 3 questions in test DB
- Calls `startSession` → `submitAnswer` × 3 → `finishSession`
- Asserts:
  - `DailyKidStat` for `(kidId, today)` has `focusedMs > 0`, `sessionsCompleted: 1`, `questionsAnswered: 3`, `correctAnswered` matches submissions
  - `QuestionStat` for each questionId has `attempts: 1`, `correctCount` matches
- Separate test: forced failure mid-stats-write → assert `Kid.coins` did NOT update
- Separate test: stale-session sweep — create a 31-min-old IN_PROGRESS session, call `startSession`, assert it's now ABANDONED + stats written

- [ ] **Step 6: Run + commit**

```bash
npm run build
npx vitest run src/app/kind/spelen/actions.test.ts
git add src/app/kind/spelen/actions.ts src/app/kind/spelen/actions.test.ts
git commit -m "feat(engagement): write DailyKidStat + QuestionStat in finishSession; stale-session sweep in startSession"
```

---

## Phase 3 — Kid UI (`/kind`)

### Task 8: `<WeekProgress>` component (Klein/Groot variants)

**Files:**
- Create: `src/components/kid/week-progress.tsx`

- [ ] **Step 1: Implement**

Props: `{ band: AgeBand; weeklyGoalMs: number; focusedMsThisWeek: number; daysThisWeek: ...; pctOfGoal: number }`.

For `klein` band: large rounded card, "Deze week" title, 7 stars (filled when `hitDailyThreshold`), tall progress bar, mascot "Goed bezig!" appearing when pctOfGoal ≥ 50.

For `groot` band: smaller card, "Week {ISO weeknummer}" title, numeric `{actual} / {goal} min`, slimmer bar, delta vs last week shown subtle.

Use existing tailwind tokens (`bg-card`, `border-line`, `bg-primary-soft`, etc. — match the patterns in `mijn-vakken.tsx`).

Use Lucide `Star` icon for filled day markers (klein band).

- [ ] **Step 2: Commit**

```bash
git add src/components/kid/week-progress.tsx
git commit -m "feat(kid): WeekProgress component with klein and groot variants"
```

---

### Task 9: `<StreakChip>` component

**Files:**
- Create: `src/components/kid/streak-chip.tsx`

- [ ] **Step 1: Implement**

Props: `{ streak: number }`. Renders a small chip with Lucide `Flame` icon + "{streak} dagen op rij" using i18n key `kid.streak.daysInARow`. If `streak === 0`, render forward-facing "Klaar voor een nieuwe reeks?" (i18n key `kid.streak.resetCta`). Plus a separate small chip for grace tokens? Re-check spec — grace chip on kid surface is **only** for parents. Kid sees only the streak chip.

- [ ] **Step 2: Commit**

```bash
git add src/components/kid/streak-chip.tsx
git commit -m "feat(kid): StreakChip component"
```

---

### Task 10: `<ResumeCard>` component + `/kind/page.tsx` integration

**Files:**
- Create: `src/components/kid/resume-card.tsx`
- Modify: `src/app/kind/page.tsx`

- [ ] **Step 1: ResumeCard**

Props: `{ quizId: string; quizTitle: string }`. Renders a primary-tinted card with "Je was bezig met: {quizTitle}" + a CTA link to `/kind/spelen/{quizId}`. Lucide `Play` icon.

- [ ] **Step 2: Integrate into /kind/page.tsx**

After resolving `kid`, before computing recommendations:

```ts
// Load week progress + streak
const weekProgress = await weekProgressFor(kid.id, kid.groep, now);
const dailyStatsForStreak = await db.dailyKidStat.findMany({
  where: { kidId: kid.id, date: { gte: new Date(now.getTime() - 30 * 86_400_000) } },
  select: { date: true, focusedMs: true },
  orderBy: { date: "asc" },
});
const streak = computeStreak(
  dailyStatsForStreak.map((d) => ({ date: localDateFor(d.date), focusedMs: d.focusedMs })),
  AGE_BAND_DEFAULTS[ageBandFor(kid.groep)],
  now,
);

// Check for resumable session
const RESUME_WINDOW_MS = 30 * 60 * 1000;
const resumable = (await db.session.findFirst({
  where: { kidId: kid.id, status: "IN_PROGRESS", startedAt: { gte: new Date(now.getTime() - RESUME_WINDOW_MS) } },
  orderBy: { startedAt: "desc" },
  select: { id: true, quizId: true, quiz: { select: { title: true } } },
})) as { id: string; quizId: string; quiz: { title: string } } | null;
```

Render order in the JSX:
1. `<KidHeader coins={kid.coins} />`
2. `<DailyGreeting />`
3. `<WeekProgress band={...} {...weekProgress} />`
4. `<StreakChip streak={streak.streak} />`
5. `{resumable && <ResumeCard quizId={resumable.quizId} quizTitle={resumable.quiz.title} />}`
6. `<MijnVakken subjects={subjects} />`
7. `<QuizzenVoorJou quizzes={quizzes} />`
8. `<Speltypes />`

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/components/kid/resume-card.tsx src/app/kind/page.tsx
git commit -m "feat(kid): wire WeekProgress, StreakChip, ResumeCard into /kind"
```

---

## Phase 4 — Parent UI (`/ouder`)

### Task 11: `<Sparkline>` + `<KidWeekPanel>` + integrate into `/ouder`

**Files:**
- Create: `src/components/ouder/sparkline.tsx`
- Create: `src/components/ouder/kid-week-panel.tsx`
- Modify: `src/app/ouder/page.tsx`

- [ ] **Step 1: Sparkline**

`src/components/ouder/sparkline.tsx`: tiny SVG component. Props: `{ values: number[]; max?: number; ariaLabel: string }`. Renders 7 vertical bars (assume length-7 input). Each bar height proportional to `values[i] / max`. 80px wide × 24px tall. No axis labels.

- [ ] **Step 2: KidWeekPanel**

Props: `{ kid, weekProgress, streak, graceTokensLeft }`. Renders:
- Kid name (existing)
- Progress bar: `{actualMin} / {goalMin} min deze week`
- Sparkline of 7-day focused minutes
- Streak chip + grace-tokens chip side-by-side (Lucide `Flame` + Lucide `Coins`)

- [ ] **Step 3: Integrate into /ouder/page.tsx**

For each kid in `household.kids`:
- Call `weekProgressFor(kid.id, kid.groep)`
- Read last ~30 days of `DailyKidStat` for streak computation
- Compute streak via `computeStreak`
- Render `<KidWeekPanel kid={kid} weekProgress={...} streak={...} graceTokensLeft={...} />`

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add src/components/ouder/sparkline.tsx src/components/ouder/kid-week-panel.tsx src/app/ouder/page.tsx
git commit -m "feat(ouder): per-kid week panel with sparkline and streak chips"
```

---

### Task 12: i18n keys

**Files:**
- Modify: `src/messages/nl-NL.json`
- Modify: `src/messages/nl-BE.json` (only entries that differ)

- [ ] **Step 1: Add keys to nl-NL.json**

Under top-level:
```jsonc
"kid": {
  ...existing...,
  "weekProgress": {
    "klein": {
      "title": "Deze week",
      "actualOfGoal": "{actual} van {goal} minuten",
      "encourage": "Goed bezig!"
    },
    "groot": {
      "title": "Week {weekNumber}",
      "actualOfGoal": "{actual} / {goal} min",
      "delta": "{sign}{n} vergeleken met vorige week"
    }
  },
  "streak": {
    "daysInARow": "{n} dagen op rij",
    "resetCta": "Klaar voor een nieuwe reeks?"
  },
  "resume": {
    "title": "Je was bezig met:",
    "cta": "Verder spelen"
  }
},
"ouder": {
  ...existing...,
  "weekly": {
    "title": "Deze week",
    "minutesOfGoal": "{actual} / {goal} min",
    "sparkAriaLabel": "Dagelijks oefenen, laatste 7 dagen",
    "streakChip": "{n} dagen op rij",
    "graceChip": "{n} reserve"
  }
},
"admin": {
  ...existing...,
  "stats": {
    "attempts": "Pogingen",
    "completionPct": "Voltooid %",
    "healthFlag": "Aandacht",
    "section": "Statistieken",
    "perQuestion": {
      "attempts": "Pogingen",
      "correctPct": "% Goed",
      "avgSec": "Gem. tijd",
      "abandons": "Stops",
      "distractors": "Antwoorden"
    },
    "healthLabel": {
      "broken": "Mogelijk kapot",
      "hard": "Te moeilijk",
      "easy": "Te makkelijk",
      "abandon-hotspot": "Veel stops",
      "ok": "OK",
      "insufficient-data": "Nog te weinig data"
    }
  }
}
```

- [ ] **Step 2: nl-BE.json — overrides only**

Only add keys that differ from nl-NL. For v1, this is likely empty (Dutch in NL and BE is similar for these strings). Leave the file structurally as before.

- [ ] **Step 3: Commit**

```bash
git add src/messages/nl-NL.json src/messages/nl-BE.json
git commit -m "feat(i18n): add keys for engagement layer + admin stats"
```

---

## Phase 5 — Admin analytics (`/admin/quizzen`)

### Task 13: Per-quiz aggregate columns on `/admin/quizzen` list

**Files:**
- Modify: `src/app/admin/quizzen/page.tsx`
- Create: `src/components/admin/quiz-aggregate-cell.tsx`

- [ ] **Step 1: Fetch aggregates**

In `AdminQuizzenPage`:
```ts
// For each quiz, aggregate from QuestionStat and Session
const quizIds = rows.map((q) => q.id);
const questionStats = (await db.questionStat.findMany({
  where: { question: { quizId: { in: quizIds } } },
  select: { questionId: true, attempts: true, correctCount: true, abandonsAfter: true, question: { select: { quizId: true } } },
})) as Array<{ questionId: string; attempts: number; correctCount: number; abandonsAfter: number; question: { quizId: string } }>;

const sessionAgg = await db.session.groupBy({
  by: ["quizId", "status"],
  where: { quizId: { in: quizIds }, status: { in: ["COMPLETED", "ABANDONED"] } },
  _count: { _all: true },
});

// Build a map quizId → { attempts, completionPct, healthFlag }
```

Pass these aggregates as additional fields on `AdminQuiz` (extend the type) and render in the existing QuizTable.

- [ ] **Step 2: Update QuizTable component**

Add three columns: Attempts, Completion %, Health flag (Lucide `Flag` with red tint when needed). Make them sortable later — out of scope.

- [ ] **Step 3: Build + commit**

```bash
git add src/app/admin/quizzen/page.tsx src/components/admin/quiz-table.tsx src/components/admin/quiz-row.tsx
git commit -m "feat(admin): per-quiz aggregate columns on /admin/quizzen"
```

---

### Task 14: Per-question Statistieken section on `/admin/quizzen/[id]`

**Files:**
- Modify: `src/app/admin/quizzen/[id]/page.tsx`
- Create: `src/components/admin/quiz-stats-row.tsx`

- [ ] **Step 1: Fetch per-question stats**

```ts
const questionStats = (await db.questionStat.findMany({
  where: { question: { quizId: id } },
  orderBy: { question: { order: "asc" } },
  select: { questionId: true, attempts: true, correctCount: true, focusedMsSum: true, abandonsAfter: true, distractorCounts: true },
})) as Array<{ questionId: string; attempts: number; correctCount: number; focusedMsSum: bigint; abandonsAfter: number; distractorCounts: unknown }>;
```

- [ ] **Step 2: Render the Statistieken section**

Above the existing questions list:

```tsx
<section className="mt-6">
  <h2 className="font-display text-lg font-bold">Statistieken</h2>
  <table className="mt-3 w-full text-sm">
    <thead>
      <tr><th>Vraag</th><th>Pogingen</th><th>% Goed</th><th>Gem. tijd</th><th>Stops</th><th>Aandacht</th></tr>
    </thead>
    <tbody>
      {questionStats.map((s, i) => <QuizStatsRow key={s.questionId} order={i + 1} stat={s} />)}
    </tbody>
  </table>
</section>
```

`QuizStatsRow` computes the avg seconds (`focusedMsSum / attempts / 1000`), determines flag via `questionHealth`, and renders with appropriate styling (red tint for `broken`/`abandon-hotspot`, amber for `hard`/`easy`).

- [ ] **Step 3: Build + commit**

```bash
git add src/app/admin/quizzen/[id]/page.tsx src/components/admin/quiz-stats-row.tsx
git commit -m "feat(admin): per-question stats section on /admin/quizzen/[id]"
```

---

## Phase 6 — Operational

### Task 15: Backfill script

**Files:**
- Create: `scripts/backfill-engagement-stats.ts`
- Modify: `package.json` (add `db:backfill-engagement`)

- [ ] **Step 1: Write the script**

Walks all `Session` rows where `status` is COMPLETED or ABANDONED in the last 90 days. For each, replays the `writeStatsForSession` logic (extract that helper into `src/lib/engagement-stats.ts` so both the action and the script can import it).

Idempotency: before running, **truncate** `DailyKidStat` and `QuestionStat`. The script is replayable.

- [ ] **Step 2: Add npm script**

In `package.json` scripts:
```json
"db:backfill-engagement": "tsx scripts/backfill-engagement-stats.ts"
```

- [ ] **Step 3: Operator step — DEFERRED**

Operator runs `npm run db:backfill-engagement` once after the schema migration and write-through are in production. NOT part of this task.

- [ ] **Step 4: Commit**

```bash
git add scripts/backfill-engagement-stats.ts package.json src/lib/engagement-stats.ts
git commit -m "chore(engagement): backfill script for DailyKidStat + QuestionStat"
```

---

### Task 16: `NEXT_PUBLIC_ENGAGEMENT_UI` flag

**Files:**
- Modify: `.env.example` (add flag with default `true`)
- Modify: `src/app/kind/page.tsx` (wrap WeekProgress + StreakChip + ResumeCard in `engagementUiEnabled` check)
- Modify: `src/app/ouder/page.tsx` (wrap KidWeekPanel addition in same check)
- Modify: `src/app/admin/quizzen/page.tsx` (wrap aggregate columns in check)
- Modify: `src/app/admin/quizzen/[id]/page.tsx` (wrap Statistieken section in check)

- [ ] **Step 1: Add flag** at top of each modified file:
```ts
const engagementUiEnabled = process.env.NEXT_PUBLIC_ENGAGEMENT_UI !== "false";
```
(Default-true means it's on unless explicitly disabled.)

- [ ] **Step 2: Wrap relevant JSX** with `{engagementUiEnabled && (...)}`.

- [ ] **Step 3: Add to `.env.example`**:
```
# Engagement UI rollout flag — set false to hide the new surfaces while keeping the write path live
NEXT_PUBLIC_ENGAGEMENT_UI=true
```

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(engagement): NEXT_PUBLIC_ENGAGEMENT_UI flag for decoupled UI rollout"
```

---

## Phase 7 — E2E

### Task 17: Playwright tests

**Files:**
- Create: `tests/e2e/engagement.spec.ts`

- [ ] **Step 1: Write tests**

```ts
import { test, expect } from "@playwright/test";

const FLAG_ON = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

test.describe("engagement E2E", () => {
  test.skip(!FLAG_ON, "AUTH_ENABLED is false");

  test("klein kid (groep 2) sees Klein week progress", async ({ page }) => {
    // Seed via SQL or via the admin path before this test, OR rely on seed-kid-sara
    // For v1 simplicity, just hit the page as the seeded admin and check rendering
    // ...
  });

  test("groot kid (groep 7) sees Groot week progress", async ({ page }) => {
    // ...
  });

  test("admin sees Statistieken on quiz detail", async ({ page }) => {
    await page.goto("/admin/quizzen");
    // expect attempts column to render
    await expect(page.locator("text=Pogingen")).toBeVisible();
  });
});
```

(Login-required scenarios depend on the Clerk test user — defer detailed assertions if those aren't reliably available yet.)

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/engagement.spec.ts
git commit -m "test(engagement): E2E coverage for week progress and admin stats"
```

---

## Self-review against spec

- §1 DoD 1-7: all covered (klein/groot UI: T8+T10; streak: T9+T10; resume: T10; stats writes: T7; parent panel: T11; admin flags: T13+T14; privacy via aggregate-only queries: T13+T14).
- §2 schema + focused-ms + tz + write path: T1, T2, T3, T7.
- §3 engagement: T6, T8, T9, T10, T12.
- §4 admin: T13, T14.
- §5 privacy: enforced in T13+T14 queries; tests in T7 and T17; rollout via T15+T16.

**Known gaps (accepted for v1):**
- Distractor tracking on MC questions is **deferred** — needs the `submitAnswer` flow to record the chosen index in `perQuestion`. Captured as a future follow-up.
- E2E coverage for logged-in flows is light — same Clerk-test-user gap from the auth plan.
- Mobile responsive review of the new UI is deferred to a polish task.

---

Plan complete and saved to `docs/superpowers/plans/2026-05-13-lexi-engagement.md`.

**Implementation has NOT started.** This plan needs a fresh session to execute — 17 tasks, several of them substantial (especially T7 — the write-through aggregation refactor). Recommended execution mode: **subagent-driven-development**.
