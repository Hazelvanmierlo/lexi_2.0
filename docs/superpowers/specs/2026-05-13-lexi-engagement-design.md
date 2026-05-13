# Lexi.kids — Engagement Layer + Content Analytics

**Date:** 2026-05-13
**Status:** Approved design (brainstormed in conversation 2026-05-12 → 2026-05-13), ready for implementation plan
**Depends on:** `2026-05-12-lexi-auth-design.md` (needs a real `kidId` from authenticated household)

---

## Context

Today's adaptive engine has a per-subject EWMA mastery score, a three-rule recommender (weakest-subject-first, 24h per-quiz cooldown, 7-day stale-subject bonus), and a coin economy. It captures rich per-question data in `Session.perQuestion` JSON: question id, correct flag, ms spent, coins awarded.

That raw data is currently unused by the UI. Kids see a coin balance and recommended quizzes. Parents see a basic dashboard. Admins see a quiz list. None of the surfaces show **how the kid is actually doing this week**, no one can spot **a broken question**, and there's no growth signal beyond mastery percentages that saturate quickly.

This spec adds two things, in two phases sharing one foundation:

- **Phase A — Kid engagement layer**: weekly minutes of focused practice as the primary progress metric, daily streak with grace days, age-banded surfaces, drop-off resume.
- **Phase B — Content analytics**: per-question + per-quiz aggregates on `/admin/quizzen` so the content team can find broken / too-hard / too-easy questions from real data.

Anchored on five product decisions confirmed in brainstorming:

1. **Streak philosophy:** healthy habit with grace days, never anxiety / shaming language.
2. **Age bands:** two — `klein` (groep 1-4, ages 4-8) and `groot` (groep 5-8, ages 9-12).
3. **Primary metric:** minutes of focused practice (the "north star").
4. **Analytics depth (phase 1):** per-question + per-quiz aggregates only. No per-kid drill-down. No cohort splits yet.
5. **Architecture:** write-through aggregation. Two new materialised tables updated inside `finishSession()`.

---

## §1 — Goals & success criteria

### What ships (Phase A then B)

1. A kid-facing engagement loop on `/kind` centered on weekly minutes of focused practice, two age bands, healthy-habit streak with grace days.
2. A parent-visible weekly summary surface in `/ouder` (week progress + 7-day sparkline + streak chip).
3. A drop-off / resume mechanism: abandoned sessions resume from where the kid stopped.
4. A content-team analytics view on `/admin/quizzen` — per-question stats (% correct, avg time, abandonment rate, distractor breakdown for MC) and per-quiz stats (completion rate, avg minutes, perfect-score %).
5. A shared write-through foundation: `DailyKidStat` and `QuestionStat` tables maintained inside `finishSession()` in one transaction.

### Definition of done (functional)

| # | Statement |
|---|---|
| 1 | A kid in `klein` (groep 1-4) and a kid in `groot` (groep 5-8) each see appropriately-sized weekly goals and age-appropriate copy on `/kind`. |
| 2 | Streak counter shows current day count + grace-days-remaining; never displays "streak in danger" or any pressure language. |
| 3 | A kid who abandons a session mid-quiz can resume from the same question on next visit (within 30 min). |
| 4 | After a kid finishes one session, `DailyKidStat` and `QuestionStat` both have correct rows (verified via integration test). |
| 5 | Parent in `/ouder` sees per-kid weekly minutes, vs goal, vs last week, plus a 7-day mini-chart. |
| 6 | `/admin/quizzen` shows per-question % correct, avg seconds, abandonment rate; ≥1 "needs attention" flag fires when a question's % correct is below a configurable threshold over ≥50 attempts. |
| 7 | No new tables expose PII beyond what `Kid` already does. Admin queries never join to `Kid.name` (only `Kid.groep` for cohort aggregation if added later). |

### Out of scope (deferred to separate specs)

- Per-skill mastery / Knowledge Tracing (a topic column on `Question` + per-skill BKT).
- Item difficulty calibration / Item Response Theory.
- Push notifications, email reminders.
- Leaderboards, social features, friend invites.
- Per-kid drill-down in admin analytics (privacy escalation; defer until justified).
- Cohort splits (region × groep × subject) in admin analytics (defer until data volume warrants).
- Parent-set custom weekly goals (defer; ship system defaults by age band first).

---

## §2 — Data model & "focused minutes" definition

### New tables (additions only — no changes to existing rows)

```prisma
model DailyKidStat {
  id                String   @id @default(cuid())
  kidId             String
  kid               Kid      @relation(fields: [kidId], references: [id], onDelete: Cascade)
  date              DateTime @db.Date   // local day in Europe/Amsterdam
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
  abandonsAfter    Int      @default(0)         // session quit immediately after this Q
  distractorCounts Json     @default("{}")      // MC only: {"0": 12, "1": 4, "2": 28, "3": 7}
  updatedAt        DateTime @updatedAt
}
```

### Definition of "focused minutes" — the metric the whole product hangs on

Raw `msSpent` per question can be polluted by kids walking away from the device (30s of thinking vs. 5 min on the toilet). We cap:

```
focusedMsForQuestion  = min(msSpent, FOCUSED_CAP_MS)   // FOCUSED_CAP_MS = 90s
focusedMsForSession   = sum of focusedMsForQuestion across answered questions
DailyKidStat.focusedMs += focusedMsForSession  (regardless of session status, as long as ≥1 question answered)
```

Why 90s flat (not per age band):
- Pure server-side; no client snooping required (kid-product safety rule).
- Catches the obvious walk-away case (>90s on a single question is almost certainly not real practice).
- Tunable in one constant. Per-age-band variation is a future refinement.

### Timezone handling

A kid practicing at 23:30 local time is credited to that calendar day, not midnight UTC. `DailyKidStat.date` is `@db.Date` (no time component) in `Europe/Amsterdam`. Helper `localDateFor(now: Date): string` returns `"2026-05-13"` etc. Handles both NL and BE since both are in CET/CEST year-round.

### Write path (write-through, atomic)

`finishSession()` runs in **one transaction**:

1. Existing logic (compute final state, update `Session` row, increment `Kid.coins`, upsert `MasteryRecord`).
2. Compute `focusedMsForSession` from the session's `perQuestion` array (apply the 90s cap per entry).
3. Upsert `DailyKidStat` for `(kidId, localDateFor(now))`: add `focusedMs` + counts; `sessionsCompleted += 1` if final status is COMPLETED, `sessionsStarted += 1` always.
4. For each `perQuestion` entry: upsert `QuestionStat` for that `questionId`:
   - `attempts += 1`
   - `correctCount += entry.correct ? 1 : 0`
   - `focusedMsSum += focusedMsForQuestion`
   - For MC questions: increment `distractorCounts[chosenIndex]` by 1
   - If this was the last answered question AND session status is ABANDONED: `abandonsAfter += 1`

If the transaction fails, **nothing changes** — including the existing coin grant and mastery update. Single point of consistency.

### Stale-session sweeper

Today's schema has `SessionStatus.ABANDONED` but nothing sets it — sessions stay `IN_PROGRESS` forever if a kid quits. New path: at the start of `startSession()`, sweep this kid's `IN_PROGRESS` sessions older than 30 min, mark them `ABANDONED`, and write their stats. No cron job required; piggybacks on the kid's next session start. Sessions that are abandoned but still within 30 min are not swept — those are eligible for resume.

### Resume path

When a kid lands on `/kind`, the server checks for one `IN_PROGRESS` session for that kid where `startedAt > now - 30 min`. If present, the `ResumeCard` renders at the top of the recommended quizzes list. Tapping it routes to `/kind/spelen/{quizId}`, which uses the existing `Session.perQuestion` length to resume from question N+1.

---

## §3 — Phase A: kid engagement layer

### 3.1 Age band primitive

The `ageBandFor(groep)` function already lives in `src/lib/engagement.ts` (shipped in the auth spec). Phase A extends `engagement.ts` with band defaults:

```ts
export type AgeBand = "klein" | "groot";

export function ageBandFor(groep: number): AgeBand {
  return groep <= 4 ? "klein" : "groot";
}

export const AGE_BAND_DEFAULTS = {
  klein: { weeklyMinutes: 60, dailyMinuteThreshold: 5,  graceTokensPerWeek: 2 },
  groot: { weeklyMinutes: 90, dailyMinuteThreshold: 10, graceTokensPerWeek: 2 },
} as const;
```

`groep` is already on `Kid`. No new column. A parent override (`Kid.weeklyMinutesGoal Int?`) is a phase-B add when we wire `/ouder` controls — not in this spec.

### 3.2 Weekly goal + week progress

The "north star": minutes of focused practice.

**Backend helper** in `src/lib/engagement.ts`:

```ts
export async function weekProgressFor(kidId: string, now: Date): Promise<WeekProgress>
// Returns:
//   { weekStart: Date, weeklyGoalMs, focusedMsThisWeek,
//     daysThisWeek: Array<{ date: string, focusedMs: number, hitDailyThreshold: boolean }>(length 7),
//     pctOfGoal: number }
```

Implementation: read up to 7 `DailyKidStat` rows for the kid where `date >= mondayLocal(now)` and `date <= sundayLocal(now)`. Sum `focusedMs`. Cheap query (single index hit on `[kidId, date(Desc)]`, ≤7 rows). Missing days are zero-filled.

**UI on `/kind`** — new `<WeekProgress>` section above `<MijnVakken>`:

- **Klein** (4-8yo): big rounded card titled "Deze week", a 7-day filled-star row (one star per day that hit threshold), big primary-tint progress bar, mascot says "Goed bezig!" when ≥ 50% of goal.
- **Groot** (9-12yo): smaller card titled "Week {ISO-weeknummer}", numeric `{actual} / {goal} min`, slimmer bar, no mascot. Subtle delta vs last week: "+4 min".

### 3.3 Streak — concrete rules

**Counting:**
- A day "counts" if `focusedMs ≥ dailyMinuteThreshold` for that local day.
- Streak = number of counted days in a row, looking backward from **yesterday**.
  Rationale for "yesterday, not today": today's day isn't finished yet — we never "break" today. Avoids "I haven't played today, did I lose my streak?" anxiety.

**Grace tokens (the anti-pressure mechanism):**
- Kid starts each ISO-week (Monday 00:00 local) with `graceTokensPerWeek` tokens (= 2 for both bands).
- When evaluating the streak, a missed day in the lookback window auto-spends one token. If a token is available, the missed day doesn't break the streak. If 0 available at the gap, the streak resets at that gap.
- Tokens are computed, not stored — pure function of `DailyKidStat` rows + current ISO week.

**Copy rules (hard constraints, enforced by code-review on i18n strings):**
- Never use: "danger", "gevaar", "verlies", "broken", "verbroken", "in gevaar".
- Never show a count-down clock or "play before midnight" CTA.
- Show "x dagen op rij" and remaining grace tokens as a small subtle indicator, not a hero number.
- When streak resets: forward-facing copy ("Klaar voor een nieuwe reeks?") — never "you lost your streak" framing.

**Pure logic, fully unit-testable:**

```ts
// src/lib/streak.ts (no I/O, no Date.now — `now` injected)
export function computeStreak(
  days: ReadonlyArray<{ date: string; focusedMs: number }>,  // sorted asc
  cfg: { dailyMinuteThreshold: number; graceTokensPerWeek: number },
  now: Date,
): { streak: number; graceTokensLeft: number; dailyHit: boolean[] }
```

Unit tests must cover: exact-threshold hit, just-missed (zero ms), 1 grace token catches a gap, 2 gaps with 1 token left → reset, week boundary resets tokens, empty input returns 0/full-tokens.

### 3.4 Drop-off resume

- Schema already has `Session.status = IN_PROGRESS`.
- On `/kind` load (server): query for one IN_PROGRESS session for the kid where `startedAt > now - 30 min`. Limit 1, order by `startedAt DESC`.
- If present, render `<ResumeCard>` at top of `<QuizzenVoorJou>`: "Je was bezig met: {quizTitle}. Verder?" — links to `/kind/spelen/{quizId}`.
- Quiz player at `/kind/spelen/[quizId]` already reads `Session.perQuestion` and resumes from `perQuestion.length`.
- On `startSession()` for the same kid (any quiz): the stale-session sweep from §2 fires.

### 3.5 Parent surface in `/ouder`

Per-kid panel gets three new elements:

1. **Week progress bar**: `Sara — 32 / 90 min deze week`. Same data as on `/kind`.
2. **7-day sparkline**: tiny inline SVG, 7 vertical bars of daily focused minutes. Visual at a glance. ~80px wide × 24px tall.
3. **Streak chip**: Lucide `Flame` icon + "4 dagen op rij". Plus a separate small chip with Lucide `Coins` icon + "2 reserve" showing remaining grace tokens — parent-visible only, not on `/kind`. Helps parent understand "why isn't the streak broken if Sara missed yesterday?" (No emoji as UI — CLAUDE.md rule.)

No new copy decisions for parents — keep existing CLAUDE.md tone (warm, parent-respectful, slightly Dutch-direct).

### 3.6 i18n keys (delta)

Adds ~25 new keys under:
- `kid.weekProgress.{klein,groot}.{title,actualOfGoal,delta,deltaMore,deltaLess}`
- `kid.streak.{daysInARow,graceTokensLeft,resetCta}`
- `kid.resume.{title,cta}`
- `ouder.weekly.{title,minutesOfGoal,sparkAriaLabel,streakChip,graceChip}`

Klein/Groot get sibling sub-trees where copy differs. Falls back nl-BE → nl-NL per existing convention.

---

## §4 — Phase B: admin analytics dashboard

### 4.1 What the content team needs to answer

In priority order:
1. **Which questions are broken?** (% correct < 25% over ≥50 attempts → likely wrong key or ambiguous)
2. **Which questions are too easy?** (% correct > 95% over ≥50 attempts → no learning value)
3. **Which questions are too hard?** (% correct 25-50% over ≥50 attempts → may need a hint or simplification)
4. **Where do kids drop off in a quiz?** (which question id has the highest `abandonsAfter`)
5. **Which MC distractors are misleading?** (a non-correct distractor with > 30% pick rate is interesting — points to a misconception worth a hint)

The dashboard surfaces these without needing the content team to do their own queries.

### 4.2 List view: `/admin/quizzen`

Existing columns: title, subject, groep, status, gameType, question count.
Add three new aggregate columns sourced from `DailyKidStat` + `QuestionStat`:

| Column | Computed from | Display |
|---|---|---|
| Attempts | `SUM(QuestionStat.attempts)` across the quiz's questions | "1,240" |
| Completion % | `COUNT(Session WHERE status=COMPLETED) / COUNT(Session WHERE status IN (COMPLETED, ABANDONED))` for this quiz | "84%" |
| Health flag | Worst-case across the quiz's questions: `attempts ≥ 50 AND correctPct < 25` | Lucide `Flag` icon (red tint) |

### 4.3 Detail view: `/admin/quizzen/[id]`

Existing fields stay (title, metadata, questions list, editor).
Add a new **"Statistieken"** section above the questions list, showing per-question rows:

| Question (order + first line of payload) | Attempts | % Correct | Avg sec | Abandons | Distractors (MC only) | Flag |
|---|---|---|---|---|---|---|
| 1. 7 + 5 = ? | 234 | 96% | 4.2s | 0 | A:5 B:9 **C:225** D:0 (correct: C) | Easy |
| 2. ... | ... | ... | ... | ... | ... | |
| 5. 12 × 4 = ? | 198 | **22%** | 18.7s | 47 | A:42 B:**112** C:32 D:12 (correct: D) | Flag (Broken) |

Cells with attention-worthy values are visually distinguished (red border for flags, amber for warnings, no styling for healthy). Hover/title text explains the rule (e.g. "Lager dan 25% goed over meer dan 50 pogingen — controleer antwoord-sleutel").

### 4.4 Health-flag thresholds

Constants in `src/lib/quiz-health.ts` (pure, testable):

```ts
export const HEALTH = {
  MIN_ATTEMPTS_FOR_FLAGS: 50,
  BROKEN_BELOW_PCT: 25,    // % correct under this → broken flag
  HARD_BELOW_PCT: 50,      // between BROKEN and HARD → hard flag
  EASY_ABOVE_PCT: 95,      // % correct over this → easy flag
  ABANDON_RATE_FLAG: 0.20, // attempts vs abandonsAfter ratio
};

export type QuestionHealth = "broken" | "hard" | "easy" | "abandon-hotspot" | "ok" | "insufficient-data";

export function questionHealth(stat: {
  attempts: number;
  correctCount: number;
  abandonsAfter: number;
}): QuestionHealth
```

Thresholds tunable; current values from common practice in adaptive-learning literature.

### 4.5 No per-kid data on admin surfaces

The privacy guarantee (DoD #7): admin queries select from `QuestionStat` (no `kidId` column) and aggregated `Session` data (`SELECT status, COUNT(*) GROUP BY status WHERE quizId=...`). Never joined to `Kid`.

If future cohort splits land (groep × region), they'd join to `Kid` only for grouping (never selecting `Kid.name` or `Kid.id`) and would enforce a `min-N` threshold (e.g. ≥10 kids in cohort) before rendering.

---

## §5 — Privacy, testing, rollout

### 5.1 Privacy

- All new tables (`DailyKidStat`, `QuestionStat`) belong to existing GDPR scope — they're derived from `Session` data that's already covered by `KidConsent`.
- `DailyKidStat.kidId` is `ON DELETE CASCADE` → kid deletion removes daily stats automatically.
- `QuestionStat.questionId` is `ON DELETE CASCADE` → question deletion removes its stats automatically.
- No external services touched. Pure first-party data flow.
- `/kind/*` Clerk-free rule: stays intact. The engagement layer is server-rendered; the `<WeekProgress>` and `<ResumeCard>` components are Server Components.

### 5.2 Testing strategy

**Unit (Vitest):**

| File | Coverage |
|---|---|
| `src/lib/engagement.test.ts` | Extend existing with `AGE_BAND_DEFAULTS` access and `weekProgressFor()` pure-helper logic (with a fake DB layer or by extracting the sum-and-zero-fill into a pure helper). |
| `src/lib/streak.test.ts` | `computeStreak` — all cases in §3.3. |
| `src/lib/quiz-health.test.ts` | `questionHealth` — boundary cases for each flag threshold. |
| `src/lib/focused-ms.test.ts` | Cap behaviour at 90s; per-question to per-session aggregation. |

**Integration (Vitest + real Supabase):**

| Test | Coverage |
|---|---|
| `finishSession` writes stats | After one completed session, `DailyKidStat` and `QuestionStat` both have correct values (focusedMs cap applied, MC distractor counts incremented). |
| `finishSession` is atomic | Force a stats write to fail; assert `Kid.coins` and `MasteryRecord` did NOT update. |
| Stale-session sweeper | Create an IN_PROGRESS session 31 min old; call `startSession`; assert old session is now ABANDONED with stats written. |
| Resume window | Create IN_PROGRESS session 5 min old; assert `/kind` shows ResumeCard. |

**E2E (Playwright):**

| Test | Coverage |
|---|---|
| Klein kid sees Klein week progress | Seed kid with `groep=2` and 18 focused minutes this week; assert `/kind` shows "18 / 60 min" with star row. |
| Groot kid sees Groot week progress | Seed kid with `groep=7` and 32 focused minutes this week; assert numeric format + delta. |
| Streak with grace token | Seed `DailyKidStat` rows showing a 4-day streak with one gap; assert UI shows "4 dagen op rij" + "1 reserve". |
| Admin sees per-question stats | Seed `QuestionStat` rows including a broken question; assert flag renders on `/admin/quizzen` and `/admin/quizzen/[id]`. |

### 5.3 Rollout / migration plan

This work is **additive** — new tables, new endpoints, new UI sections. No flag-gating needed (unlike the auth cutover). The new UI sections are gated by "do the new tables have rows yet?" — empty tables render an empty state gracefully.

**Order of deploys:**

1. Land the schema migration (`prisma db push`) — both tables, both new sets of columns.
2. Land the write-through aggregation in `finishSession()` — silent for users, just starts filling the tables.
3. Wait one day for tables to accumulate real data from existing kids.
4. Land the UI surfaces (`<WeekProgress>`, `<ResumeCard>`, parent panel, admin stats).
5. Smoke test.

**Backfill (optional, recommended):**

A one-off script `scripts/backfill-engagement-stats.ts` that walks all completed `Session` rows in the last 90 days and replays the aggregation. Run once after step 1 lands. This lets the UI show real history immediately rather than "no data yet" for existing users.

**Rollback:**

- The new tables can stay; they have no impact when nothing reads from them.
- The UI sections can be hidden via a single env flag `NEXT_PUBLIC_ENGAGEMENT_UI=true` if needed. Default true; flip false to hide UI without touching the write path. (Yes, this is a flag — justified because UI rollout decoupling from data accumulation is a real operational need. Remove flag in a follow-up PR once stable.)

---

## Open items / known tensions

1. **`FOCUSED_CAP_MS` = 90s flat.** Reasonable starting point; younger kids may genuinely think slower. If post-launch data shows >15% of Klein questions hit the cap, lower the value or split per band. Tunable in one constant.

2. **No rate limit on stats writes.** A flood of completed sessions for one kid would update `DailyKidStat` many times in a row (each session = one upsert). Postgres handles this fine; flag if write contention becomes a real issue.

3. **`distractorCounts` JSON grows unboundedly per MC question.** For 4-option MC, the JSON has at most 4 keys. For drag-order or match, no distractor tracking. Bounded by question type — no risk.

4. **No A/B testing infrastructure here.** When we want to test "does the streak chip improve retention", we'll need a feature-flag-aware way to ship variant UIs. Out of scope for this spec.

5. **Klein/Groot are binary** — a kid in groep 4 (age 7-8) might be developmentally between bands. We accept the simplification for v1; per-kid override is a phase-B add when parents want it.

---

## What ships next after this

1. **Item difficulty calibration / IRT** — uses `QuestionStat.attempts` + `correctCount` to build a difficulty estimate per question and use it in `recommend()`. Builds directly on the foundation from this spec.
2. **Per-skill mastery (Knowledge Tracing)** — adds `Question.topic` + `MasteryRecord.topic`. Bigger lift, but the engagement and analytics surfaces from this spec stay relevant (just slice by topic instead of subject).
3. **Spaced repetition for individual items** — when a kid gets question X wrong, queue it for resurfacing in N days following SM-2 logic. Uses `QuestionStat` + per-kid `Session.perQuestion` history.

Each gets its own design doc.
