# Theme A: Pedagogical Correctness — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Land Theme A of the Games UX Overhaul ([spec](../specs/2026-05-13-lexi-games-overhaul-design.md)) — the six pedagogically-critical fixes: correct-answer reveal, typo tolerance, per-question hints, review queue, MC in-game feedback, Match per-pair feedback.

**Architecture:** Pure-logic helpers added first (typo-tolerance, review-queue). `SubmitResult` extended with a `reveal` payload. `submitAnswer` server action returns the canonical correct answer alongside the existing fields. Game components consume `reveal` data when locked. New `review` phase in QuizPlayer state machine. Hint button on every question card with -3 coin cost.

**Tech Stack:** Same as before — Next.js 16 App Router, TypeScript, Vitest, Tailwind. No new npm deps.

---

## File inventory

| Path | New / Modify | Purpose |
|---|---|---|
| `src/lib/type-tolerance.ts` | New | `normaliseAndCompare(input, canonical)` |
| `src/lib/type-tolerance.test.ts` | New | Unit tests for normalisation + Levenshtein-1 |
| `src/lib/review-queue.test.ts` | New | Unit tests for review-round computation |
| `src/lib/review-queue.ts` | New | Pure helper to compute review questions |
| `src/lib/quiz-schemas.ts` | Modify | Add `hint?: string` to every payload variant |
| `src/lib/quiz-session.ts` | Modify | `gradeAndScore` returns `reveal` payload; uses type-tolerance for TYPE |
| `src/app/kind/spelen/actions.ts` | Modify | `SubmitResult` extends with `reveal`; signal `hintUsed` from a new `useHint` action |
| `src/components/kind-play/quiz-player.tsx` | Modify | Add review phase to state machine; pass `reveal` to game components; render hint button |
| `src/components/kind-play/games/mc-game.tsx` | Modify | When `locked`, render correct/chosen states from `reveal` |
| `src/components/kind-play/games/catapult-game.tsx` | Modify | Same — show correct + chosen target |
| `src/components/kind-play/games/type-game.tsx` | Modify | When `locked`, show kid's input struck + canonical in green |
| `src/components/kind-play/games/match-game.tsx` | Modify | Per-pair correctness feedback during play + final "Klaar?" button |
| `src/components/kind-play/games/drag-order-game.tsx` | Modify | When `locked`, annotate positions with correct/wrong |
| `src/components/kind-play/hint-button.tsx` | New | Tap → modal with hint, -3 coins on first open |
| `tests/e2e/games-theme-a.spec.ts` | New | E2E: wrong MC shows correct option; type-tolerance accepts typo |

---

## Phase 0 — Pure helpers (TDD)

### Task 1: `type-tolerance.ts` — normalise + Levenshtein

**Files:**
- Create: `src/lib/type-tolerance.ts`
- Create: `src/lib/type-tolerance.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from "vitest";
import { normaliseAndCompare, normaliseAnswer } from "./type-tolerance";

describe("normaliseAnswer", () => {
  it("trims and lowercases", () => {
    expect(normaliseAnswer("  Hond  ")).toBe("hond");
  });
  it("collapses internal whitespace", () => {
    expect(normaliseAnswer("een   grote   hond")).toBe("een grote hond");
  });
  it("strips diacritics", () => {
    expect(normaliseAnswer("naïef")).toBe("naief");
    expect(normaliseAnswer("café")).toBe("cafe");
  });
});

describe("normaliseAndCompare", () => {
  it("exact match (after normalisation) returns true", () => {
    expect(normaliseAndCompare("Hond", "hond")).toBe(true);
    expect(normaliseAndCompare("  café  ", "cafe")).toBe(true);
  });

  it("Levenshtein-1 tolerance for length ≥ 4", () => {
    expect(normaliseAndCompare("hund", "hond")).toBe(true);   // 1 substitution
    expect(normaliseAndCompare("hond", "honde")).toBe(true);  // 1 insertion
    expect(normaliseAndCompare("honds", "hond")).toBe(true);  // 1 insertion
    expect(normaliseAndCompare("hnd", "hond")).toBe(true);    // 1 deletion
  });

  it("Levenshtein-2+ does NOT match", () => {
    expect(normaliseAndCompare("hand", "kont")).toBe(false);
  });

  it("answers shorter than 4 require exact match", () => {
    expect(normaliseAndCompare("je", "ja")).toBe(false);
    expect(normaliseAndCompare("ja", "ja")).toBe(true);
    expect(normaliseAndCompare("nee", "nee")).toBe(true);
    expect(normaliseAndCompare("ney", "nee")).toBe(false);
  });

  it("numeric-only answers require exact match", () => {
    expect(normaliseAndCompare("43", "42")).toBe(false);
    expect(normaliseAndCompare("42", "42")).toBe(true);
    expect(normaliseAndCompare(" 42 ", "42")).toBe(true);
  });

  it("multi-word answers tolerate one off-by-one", () => {
    expect(normaliseAndCompare("een grote hond", "een grote hund")).toBe(true);
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

```bash
npx vitest run src/lib/type-tolerance.test.ts
```

- [ ] **Step 3: Implement**

```ts
// src/lib/type-tolerance.ts

const NUMERIC = /^[0-9]+$/;

export function normaliseAnswer(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const m = a.length;
  const n = b.length;
  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,           // deletion
        curr[j - 1] + 1,       // insertion
        prev[j - 1] + cost,    // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

export function normaliseAndCompare(input: string, canonical: string): boolean {
  const a = normaliseAnswer(input);
  const b = normaliseAnswer(canonical);
  if (a === b) return true;
  // Numeric → exact only
  if (NUMERIC.test(a) || NUMERIC.test(b)) return false;
  // Short answers → exact only
  if (b.length < 4) return false;
  return levenshtein(a, b) <= 1;
}
```

- [ ] **Step 4: Run PASS, commit**

```bash
git add src/lib/type-tolerance.ts src/lib/type-tolerance.test.ts
git commit -m "feat(games): type-tolerance helper (Levenshtein-1, normalisation)"
```

---

### Task 2: `review-queue.ts` — failed-question round computation

**Files:**
- Create: `src/lib/review-queue.ts`
- Create: `src/lib/review-queue.test.ts`

- [ ] **Step 1: Tests**

```ts
import { describe, it, expect } from "vitest";
import { nextReviewQuestionIdx } from "./review-queue";

describe("nextReviewQuestionIdx", () => {
  it("returns null when no failed questions", () => {
    expect(nextReviewQuestionIdx([], [])).toBeNull();
  });

  it("returns the first failed question index", () => {
    expect(nextReviewQuestionIdx([2, 5], [])).toBe(2);
  });

  it("skips already-reviewed (and now-correct) questions", () => {
    expect(nextReviewQuestionIdx([2, 5], [2])).toBe(5);
  });

  it("returns null when all failed have been reviewed", () => {
    expect(nextReviewQuestionIdx([2, 5], [2, 5])).toBeNull();
  });
});
```

- [ ] **Step 2: Implement**

```ts
// src/lib/review-queue.ts

/** Returns the index of the next failed question to retry, or null if none remain. */
export function nextReviewQuestionIdx(
  failedIndices: ReadonlyArray<number>,
  alreadyReviewedIndices: ReadonlyArray<number>,
): number | null {
  const reviewed = new Set(alreadyReviewedIndices);
  for (const idx of failedIndices) {
    if (!reviewed.has(idx)) return idx;
  }
  return null;
}
```

- [ ] **Step 3: Run + commit**

```bash
git add src/lib/review-queue.ts src/lib/review-queue.test.ts
git commit -m "feat(games): review-queue helper for spaced retrieval within session"
```

---

## Phase 1 — Schema + grading

### Task 3: Extend `quiz-schemas.ts` with `hint?: string`

**Files:**
- Modify: `src/lib/quiz-schemas.ts`

- [ ] **Step 1: Read existing file to understand the Zod discriminated union shape**

- [ ] **Step 2: Add `hint: z.string().optional()` to all five payload schemas**

```ts
const McPayload = z.object({
  q: z.string(),
  options: z.array(z.string()),
  correct: z.number().int().min(0),
  hint: z.string().optional(),
});
const TypePayload = z.object({
  q: z.string(),
  answer: z.string(),
  hint: z.string().optional(),
});
const CatapultPayload = z.object({
  q: z.string(),
  options: z.array(z.string()),
  correct: z.number().int().min(0),
  hint: z.string().optional(),
});
const MatchPayload = z.object({
  q: z.string(),
  pairs: z.array(z.object({ l: z.string(), r: z.string() })),
  hint: z.string().optional(),
});
const DragOrderPayload = z.object({
  q: z.string(),
  items: z.array(z.string()),
  correctOrder: z.array(z.string()),
  hint: z.string().optional(),
});
```

(Adjust to match the actual field names in the existing file; the principle is "add a `hint?: string` to every payload variant.")

- [ ] **Step 3: Build + commit**

```bash
npm run build  # should pass — only adds optional fields
git add src/lib/quiz-schemas.ts
git commit -m "feat(games): per-question optional hint field on all payload schemas"
```

---

### Task 4: Extend `gradeAndScore` to return `reveal` + use type-tolerance for TYPE

**Files:**
- Modify: `src/lib/quiz-session.ts`

- [ ] **Step 1: Read existing file — locate `gradeAndScore`**

- [ ] **Step 2: For TYPE gameType, swap strict equality for `normaliseAndCompare`**

Find the TYPE branch in the grading switch. Replace:
```ts
case "TYPE":
  isCorrect = String(answer).trim() === payload.answer;
  // ...
```

with:
```ts
case "TYPE":
  isCorrect = typeof answer === "string" && normaliseAndCompare(answer, payload.answer);
  // ...
```

Import at top:
```ts
import { normaliseAndCompare } from "./type-tolerance";
```

- [ ] **Step 3: Build reveal payload**

After the grading switch, before returning, build a `reveal` object describing what the correct answer was:

```ts
type Reveal =
  | { kind: "mc"; correctIndex: number; chosenIndex: number | null }
  | { kind: "catapult"; correctIndex: number; chosenIndex: number | null }
  | { kind: "type"; correctText: string }
  | { kind: "drag-order"; correctOrder: string[] }
  | { kind: "match"; correctPairs: Array<{ l: string; r: string }> };

let reveal: Reveal;
switch (gameType) {
  case "MC":
    reveal = { kind: "mc", correctIndex: payload.correct, chosenIndex: typeof answer === "number" ? answer : null };
    break;
  case "CATAPULT":
    reveal = { kind: "catapult", correctIndex: payload.correct, chosenIndex: typeof answer === "number" ? answer : null };
    break;
  case "TYPE":
    reveal = { kind: "type", correctText: payload.answer };
    break;
  case "DRAG_ORDER":
    reveal = { kind: "drag-order", correctOrder: payload.correctOrder };
    break;
  case "MATCH":
    reveal = { kind: "match", correctPairs: payload.pairs };
    break;
}
```

Add `reveal` to the function's return object.

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add src/lib/quiz-session.ts
git commit -m "feat(games): gradeAndScore returns reveal payload; TYPE uses type-tolerance"
```

---

### Task 5: Extend `SubmitResult` and pass `reveal` through

**Files:**
- Modify: `src/app/kind/spelen/actions.ts`

- [ ] **Step 1: Add `reveal` to `SubmitResult` type**

```ts
export type SubmitResult = {
  correct: boolean;
  coinsAwarded: number;
  correctCount: number;
  totalAnswered: number;
  reveal: Reveal;
};
```

(Import or re-declare `Reveal` from `quiz-session.ts`.)

- [ ] **Step 2: Propagate `graded.reveal` into the return**

In `submitAnswer`, both the early `if (graded.reused)` return and the main return need to include `reveal: graded.reveal`.

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/app/kind/spelen/actions.ts
git commit -m "feat(games): SubmitResult exposes reveal to client"
```

---

## Phase 2 — Hint server action + cost

### Task 6: `useHint` server action — record cost + return hint text

**Files:**
- Modify: `src/app/kind/spelen/actions.ts`

- [ ] **Step 1: Add the action**

```ts
const UseHintInput = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
});

export type UseHintResult =
  | { ok: true; hint: string; coinsCharged: number; newCoinsBalance: number }
  | { ok: false; reason: "no-hint" | "already-used" | "session-done" };

const HINT_COST = 3;

export async function useHint(input: z.infer<typeof UseHintInput>): Promise<UseHintResult> {
  const { sessionId, questionId } = UseHintInput.parse(input);

  // ...load session + question
  // If session.status !== "IN_PROGRESS" → return { ok: false, reason: "session-done" }
  // Read payload.hint || customExplain || null
  // If null → { ok: false, reason: "no-hint" }
  // Read perQuestion; find entry for this question. If entry.hintUsed → { ok: false, reason: "already-used" }
  // Mark entry.hintUsed = true (insert a stub entry if not yet answered; that's fine — kid asked for hint BEFORE answering)
  // Decrement kid.coins by HINT_COST (clamp at 0)
  // Return the hint text + new balance
}
```

Implement fully — read the existing `submitAnswer` for the patterns. The kid-coins decrement happens via `db.kid.update({ data: { coins: { decrement: HINT_COST } } })`.

If the kid hasn't answered the question yet, `perQuestion` has no entry; we add a stub `{ questionId, hintUsed: true, ...placeholder }` so the cost is tracked.

- [ ] **Step 2: Update `Session.perQuestion` JSON type**

Wherever `PerQuestionEntry` is defined (likely `src/lib/quiz-session.ts`), add `hintUsed?: boolean`.

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/app/kind/spelen/actions.ts src/lib/quiz-session.ts
git commit -m "feat(games): useHint action with coin cost"
```

---

## Phase 3 — Game components: show reveal when locked

### Task 7: MC reveal — correct green, kid's wrong red

**Files:**
- Modify: `src/components/kind-play/games/mc-game.tsx`

- [ ] **Step 1: Accept new `reveal` prop**

```tsx
type Props = {
  payload: McPayload;
  onAnswer: (answer: number) => void;
  locked: boolean;
  reveal?: { correctIndex: number; chosenIndex: number | null };
};
```

- [ ] **Step 2: Style options based on reveal state**

When `locked && reveal`:
- Option at `correctIndex`: green border + green-soft bg + Lucide `Check` icon
- Option at `chosenIndex` (if `chosenIndex !== correctIndex`): red border + red-soft bg + Lucide `X` icon
- Other options: dimmed, normal

```tsx
function classFor(i: number): string {
  if (!locked || !reveal) return "border-line bg-card hover:border-ink hover:bg-bg-2";
  if (i === reveal.correctIndex) return "border-ok bg-ok-soft";
  if (i === reveal.chosenIndex) return "border-primary bg-primary-soft";
  return "border-line bg-card opacity-60";
}
```

(Use Lucide `Check` for correct, `X` for wrong; conditionally rendered in the option button.)

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/components/kind-play/games/mc-game.tsx
git commit -m "feat(games): MC reveals correct + wrong selection on lock"
```

---

### Task 8: Catapult reveal

**Files:**
- Modify: `src/components/kind-play/games/catapult-game.tsx`

Same pattern as MC: when `locked && reveal`, paint the correct target green + chosen target red.

- [ ] **Step 1: Accept `reveal` prop with same shape as MC.**

- [ ] **Step 2: Color the target buttons based on reveal state (same `classFor` pattern).**

- [ ] **Step 3: Build + commit**

```bash
git add src/components/kind-play/games/catapult-game.tsx
git commit -m "feat(games): Catapult reveals correct target on lock"
```

---

### Task 9: Type reveal — strike-through + canonical answer

**Files:**
- Modify: `src/components/kind-play/games/type-game.tsx`

- [ ] **Step 1: Accept reveal prop**

```tsx
type Props = {
  payload: TypePayload;
  onAnswer: (answer: string) => void;
  locked: boolean;
  reveal?: { correctText: string };
  lastInput?: string;  // pass the kid's submitted input so we can show it
};
```

- [ ] **Step 2: Render reveal block when locked**

Below the input (which becomes disabled on lock):
```tsx
{locked && reveal && (
  <div className="mt-3 space-y-1">
    {lastInput && lastInput !== reveal.correctText && (
      <p className="text-sm text-ink-2 line-through opacity-60">{lastInput}</p>
    )}
    <p className="font-display text-base font-semibold text-ok">
      {reveal.correctText}
    </p>
  </div>
)}
```

- [ ] **Step 3: Plumb `lastInput`** — the QuizPlayer needs to remember the kid's last input so it can pass it back when rendering the locked reveal. Use a ref or state slot in QuizPlayer.

- [ ] **Step 4: Build + commit**

```bash
git add src/components/kind-play/games/type-game.tsx
git commit -m "feat(games): Type reveals canonical answer + kid's input on lock"
```

---

### Task 10: DragOrder reveal — annotate positions

**Files:**
- Modify: `src/components/kind-play/games/drag-order-game.tsx`

- [ ] **Step 1: Accept reveal prop**

```tsx
reveal?: { correctOrder: string[] };
```

- [ ] **Step 2: When locked, each row gets an indicator**

For each item in `order` at position `i`: compare against `reveal.correctOrder[i]`. If match: green check + "OK". If mismatch: red X + "Hoort op {position-of-this-item-in-correctOrder}".

```tsx
{locked && reveal && (
  isInCorrectPosition
    ? <Check className="h-4 w-4 text-ok" />
    : <span className="flex items-center gap-1 text-xs text-primary">
        <X className="h-4 w-4" />
        Hoort op #{reveal.correctOrder.indexOf(item) + 1}
      </span>
)}
```

- [ ] **Step 3: Build + commit**

```bash
git add src/components/kind-play/games/drag-order-game.tsx
git commit -m "feat(games): DragOrder annotates correct/wrong positions on lock"
```

---

### Task 11: Match — per-pair feedback during play + "Klaar?" button + reveal

**Files:**
- Modify: `src/components/kind-play/games/match-game.tsx`

The biggest game change in Theme A. Three sub-changes:

- [ ] **Step 1: Per-pair feedback DURING play**

After each pairing attempt (left + right tap), determine if the pair is correct:
```ts
const isCorrect = payload.pairs.some((p) => p.l === leftPicked && p.r === r);
```

If correct: pair goes into `pairs` state (as today), both items render in green.
If wrong: pair flashes red briefly (CSS animation, 400ms), then BOTH items return to unpicked state — neither is consumed.

State change: introduce a transient `lastWrong: { l, r } | null` that triggers the flash for 400ms then clears via `setTimeout`.

- [ ] **Step 2: Drop auto-submit on last pair; add explicit "Klaar?" button**

Remove the `useEffect` that auto-calls `onAnswer` on `pairs.length === payload.pairs.length`. Replace with:
```tsx
{pairs.length === payload.pairs.length && !locked && (
  <button
    type="button"
    onClick={() => onAnswer(pairs)}
    className="..."
  >
    Klaar? <ArrowRight className="h-4 w-4" />
  </button>
)}
```

Add a tap-to-unpair affordance: tapping an already-paired item splits the pair.

- [ ] **Step 3: Reveal correct pairs on lock**

```tsx
reveal?: { correctPairs: Array<{ l: string; r: string }> };
```

When locked, render the correct pairs side-by-side with lines/arrows. Simpler: show a list "Goede paren:" beneath the play area listing each correct pair. Use Lucide `ArrowRight` between l and r.

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add src/components/kind-play/games/match-game.tsx
git commit -m "feat(games): Match per-pair feedback + Klaar? confirm + reveal on lock"
```

---

## Phase 4 — Quiz player: thread reveal + review queue + hint

### Task 12: Hint button

**Files:**
- Create: `src/components/kind-play/hint-button.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useState, useTransition } from "react";
import { HelpCircle, X } from "lucide-react";
import { useHint, type UseHintResult } from "@/app/kind/spelen/actions";

export function HintButton({
  sessionId,
  questionId,
  onCoinsCharged,
}: {
  sessionId: string;
  questionId: string;
  onCoinsCharged: (newBalance: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState<UseHintResult | null>(null);
  const [, startTx] = useTransition();

  function open_() {
    if (hint?.ok) {
      setOpen(true);
      return;
    }
    startTx(async () => {
      const r = await useHint({ sessionId, questionId });
      setHint(r);
      setOpen(true);
      if (r.ok) onCoinsCharged(r.newCoinsBalance);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={open_}
        aria-label="Toon hint"
        className="rounded-full bg-card p-2 text-ink-2 hover:bg-bg-2"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
      {open && hint && (
        <div role="dialog" aria-modal="true" className="...modal styling...">
          {hint.ok ? (
            <>
              <p className="text-sm text-ink-3">−{hint.coinsCharged} munten</p>
              <p className="font-display text-lg text-ink">{hint.hint}</p>
            </>
          ) : (
            <p>{hint.reason === "no-hint" ? "Geen hint beschikbaar." : "Hint al gebruikt."}</p>
          )}
          <button onClick={() => setOpen(false)} aria-label="Sluit"><X /></button>
        </div>
      )}
    </>
  );
}
```

(Modal styling — keep simple; existing Lexi card patterns.)

- [ ] **Step 2: Commit**

```bash
git add src/components/kind-play/hint-button.tsx
git commit -m "feat(games): hint button with coin-cost server action"
```

---

### Task 13: Wire hint button + reveal + review into `QuizPlayer`

**Files:**
- Modify: `src/components/kind-play/quiz-player.tsx`

This is the biggest single edit. Read the file first, then make these changes:

- [ ] **Step 1: Extend the `Stage` type with `review`**

```ts
type Stage =
  | { kind: "uitleg" }
  | { kind: "starting" }
  | { kind: "playing"; sessionId: string; index: number; startedAt: number; isReview?: boolean }
  | { kind: "feedback"; sessionId: string; index: number; result: SubmitResult; lastInput?: string }
  | { kind: "review-intro"; sessionId: string; reviewIdx: number }
  | { kind: "finishing"; sessionId: string }
  | { kind: "done"; summary: FinishResult };
```

- [ ] **Step 2: Track failed-question indices + reviewed indices**

Add state:
```ts
const [failedIdx, setFailedIdx] = useState<number[]>([]);
const [reviewedIdx, setReviewedIdx] = useState<number[]>([]);
```

In `onAnswer` after the server response:
```ts
if (!result.correct) {
  setFailedIdx((prev) => prev.includes(stage.index) ? prev : [...prev, stage.index]);
}
```

- [ ] **Step 3: Pass `reveal` + `lastInput` to game in feedback phase**

In the feedback render:
```tsx
<GameSwitch
  gameType={quiz.gameTypeDb}
  payload={question.payload}
  reveal={stage.result.reveal}
  lastInput={stage.lastInput}  // for type-game
  onAnswer={() => {}}
  locked
/>
```

Update `GameSwitch` to accept and forward these.

- [ ] **Step 4: Render hint button on `playing` phase**

In the playing-stage render block, before `<GameSwitch>`:
```tsx
<div className="mb-3 flex justify-end">
  <HintButton
    sessionId={stage.sessionId}
    questionId={question.id}
    onCoinsCharged={(newBalance) => setCoinsHeader(newBalance)}
  />
</div>
```

(`setCoinsHeader` — see D.7 in the spec; for Theme A, just log the new balance; D.7 wires up the header.)

- [ ] **Step 5: Implement review phase in `onNext`**

After the last regular question (Q10), call `nextReviewQuestionIdx(failedIdx, reviewedIdx)`:
- If returns null: go to `finishing` stage as today.
- If returns an index: go to a `review-intro` stage that briefly shows "Even oefenen — vraag {N}" for 1.5s, then transitions to `playing` for that index (with `isReview: true`).

After answering a review question: don't add to failedIdx (already failed; we don't want infinite review loops). Add the index to `reviewedIdx`. Loop until exhausted OR 3 reviews done (use `reviewedIdx.length >= 3` as cap).

The review-question `playing` state DOES grade via server (so QuestionStat aggregates pick it up), but coin awards should be zero for review. Server-side: extend `submitAnswer` with an optional `noCoins` flag, or compute `isReview` from session state. Simpler approach: client passes `isReview` flag, server respects it.

```ts
const result = await submitAnswer({
  sessionId,
  questionId: question.id,
  answer,
  msSpent,
  isReview: stage.isReview === true,
});
```

Server: if `isReview === true`, force `coinsAwarded: 0` regardless of correctness.

- [ ] **Step 6: Build + commit**

```bash
npm run build
git add src/components/kind-play/quiz-player.tsx src/app/kind/spelen/actions.ts
git commit -m "feat(games): wire reveal + hint + review queue into QuizPlayer"
```

---

## Phase 5 — Tests

### Task 14: E2E for Theme A

**Files:**
- Create: `tests/e2e/games-theme-a.spec.ts`

- [ ] **Step 1: Write tests**

```ts
import { test, expect } from "@playwright/test";

const FLAG_ON = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

test.describe("Games Theme A", () => {
  test.skip(!FLAG_ON, "AUTH_ENABLED is false");

  test("MC wrong answer reveals the correct option in green", async ({ page }) => {
    // Log in as seeded demo
    // Navigate to /kind/spelen/{seed-MC-quiz}
    // Click Start
    // Click a wrong option
    // Wait for feedback bar
    // Assert: an option with class containing "border-ok" exists (the correct one)
    // Assert: an option with class containing "border-primary" exists (the chosen wrong one)
  });

  test("Type accepts typo-1 answer as correct", async ({ page }) => {
    // ...navigate to a TYPE quiz
    // Type answer with one wrong character (e.g. "hund" for "hond")
    // Submit
    // Assert: feedback bar shows "Goed!" (and shows the canonical answer)
  });
});
```

(Test setup needs a logged-in Clerk session — same constraint as the auth E2E. Acceptable to skip these tests in CI for v1 and run them manually.)

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/games-theme-a.spec.ts
git commit -m "test(games): E2E for Theme A reveal + type-tolerance"
```

---

## Self-review

- **Spec coverage:**
  - A.1 correct-answer reveal: T7-T11 ✓
  - A.2 typo tolerance: T1, T4 ✓
  - A.3 per-question hint: T3 (schema), T6 (action), T12 (button), T13 (wire) ✓
  - A.4 review queue: T2 (helper), T13 (state machine) ✓
  - A.5 MC visual feedback during play: T7 ✓
  - A.6 Match per-pair feedback: T11 ✓

- **Known gaps:**
  - The `lastInput` plumbing in T9 + T13 is non-trivial — need to capture the kid's submitted text BEFORE the input is disabled. Handle in T13 step 3.
  - Review questions in T13 step 5 require a server-side `isReview` honored in `submitAnswer`. Easy add; flag in implementation.
  - E2E tests gated by Clerk login — same constraint as auth E2E.

---

**14 tasks. Estimated implementation time:** ~6-8 hours via subagent flow.
