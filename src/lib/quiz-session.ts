// Pure business logic for quiz sessions.
//
// The server action in src/app/kind/spelen/actions.ts owns the I/O — loading
// the session row, writing it back, crediting the kid's coins. The actual
// rules of the game live here, where they can be tested without mocking
// Prisma.
//
// Two entry points:
//   gradeAndScore         — called per answer
//   computeSessionFinalState — called when the kid finishes the quiz

import {
  coinsFor,
  countTrailingCorrect,
  streakMultiplier,
  completionBonus,
} from "./coins";
import {
  gradeAnswer,
  type AnyPayload,
  type CatapultPayload,
  type DragOrderPayload,
  type GameType,
  type MatchPayload,
  type McPayload,
  type TypePayload,
} from "./quiz-schemas";
import { computeMasteryUpdate } from "./mastery";

export type PerQuestionEntry = {
  questionId: string;
  order: number;
  correct: boolean;
  msSpent: number;
  coinsAwarded: number;
  /** True when the kid used the hint on this question. */
  hintUsed?: boolean;
};

// ─── reveal payload ────────────────────────────────────────────────────────
//
// After grading, the server tells the client what the correct answer was so
// the game UI can render reveal feedback (green correct, red chosen-wrong).
export type Reveal =
  | { kind: "MC"; correctIdx: number; chosenIdx: number | null }
  | { kind: "CATAPULT"; correctIdx: number; chosenIdx: number | null }
  | { kind: "TYPE"; correctText: string }
  | { kind: "DRAG_ORDER"; correctOrder: string[] }
  | { kind: "MATCH"; correctPairs: Array<{ l: string; r: string }> };

function buildReveal(
  gameType: GameType,
  payload: AnyPayload,
  answer: unknown,
): Reveal {
  switch (gameType) {
    case "MC": {
      const p = payload as McPayload;
      return {
        kind: "MC",
        correctIdx: p.correctIdx,
        chosenIdx: typeof answer === "number" ? answer : null,
      };
    }
    case "CATAPULT": {
      const p = payload as CatapultPayload;
      return {
        kind: "CATAPULT",
        correctIdx: p.correctIdx,
        chosenIdx: typeof answer === "number" ? answer : null,
      };
    }
    case "TYPE": {
      const p = payload as TypePayload;
      return { kind: "TYPE", correctText: p.answer };
    }
    case "DRAG_ORDER": {
      const p = payload as DragOrderPayload;
      return { kind: "DRAG_ORDER", correctOrder: p.correctOrder };
    }
    case "MATCH": {
      const p = payload as MatchPayload;
      return { kind: "MATCH", correctPairs: p.pairs };
    }
  }
}

// ─── per-answer scoring ────────────────────────────────────────────────────

export type GradeInput = {
  gameType: GameType;
  payload: AnyPayload;
  questionId: string;
  questionOrder: number;
  answer: unknown;
  msSpent: number;
  /** Existing per-question entries already recorded in this session. */
  priorEntries: PerQuestionEntry[];
};

export type GradeResult = {
  /** True if the kid got it right. */
  correct: boolean;
  /** How many coins the answer earned (0 if wrong). */
  coinsAwarded: number;
  /** New per-question entry to append to the session. */
  newEntry: PerQuestionEntry;
  /** Whether this submission was a re-submit (idempotent). */
  reused: boolean;
  /**
   * The same entry already-recorded entry if reused = true; useful for the
   * caller to skip a DB write entirely.
   */
  existingEntry?: PerQuestionEntry;
  /** Canonical-answer reveal so the client can render the feedback UI. */
  reveal: Reveal;
};

export type GradeOptions = {
  /**
   * Review-round answer (during the end-of-quiz retry phase). Reviews never
   * award coins and don't bump the session correctCount — see actions.ts.
   */
  isReview?: boolean;
};

export function gradeAndScore(
  input: GradeInput,
  options: GradeOptions = {},
): GradeResult {
  const reveal = buildReveal(input.gameType, input.payload, input.answer);

  // Idempotency — if this question was already answered (or has a hint-only
  // stub), return its recorded result instead of re-grading on resubmission.
  // We still want to allow a stub (hintUsed: true, correct: false placeholder
  // with msSpent 0) to be REPLACED by a real answer, so distinguish here.
  const prior = input.priorEntries.find(
    (e) => e.questionId === input.questionId,
  );
  const isHintStub =
    !!prior && prior.hintUsed === true && prior.msSpent === 0;

  if (prior && !isHintStub) {
    return {
      correct: prior.correct,
      coinsAwarded: prior.coinsAwarded,
      newEntry: prior,
      reused: true,
      existingEntry: prior,
      reveal,
    };
  }

  const correct = gradeAnswer(input.gameType, input.payload, input.answer);

  // Streak counts the run going into this answer. If the kid was on 4 and
  // gets this one right, the multiplier reflects the new run of 5. Reviews
  // don't earn coins, so they don't enter the streak math either.
  const trailing = countTrailingCorrect(input.priorEntries);
  const newRun = correct ? trailing + 1 : 0;
  const multiplier = streakMultiplier(newRun);

  const coinsAwarded =
    correct && !options.isReview
      ? coinsFor({
          correct: true,
          msSpent: input.msSpent,
          streakBonus: multiplier,
        })
      : 0;

  const newEntry: PerQuestionEntry = {
    questionId: input.questionId,
    order: input.questionOrder,
    correct,
    msSpent: input.msSpent,
    coinsAwarded,
    // Preserve hint flag if the kid used one before answering.
    ...(prior?.hintUsed ? { hintUsed: true } : {}),
  };

  return { correct, coinsAwarded, newEntry, reused: false, reveal };
}

// ─── finish-session computation ────────────────────────────────────────────

export type FinishInput = {
  /** Total questions in the quiz. */
  totalQuestions: number;
  correctCount: number;
  coinsEarnedSoFar: number;
  /** How many entries are in perQuestion (to detect partials). */
  answeredCount: number;
  /** Current mastery state for the kid × this subject, if any. */
  mastery: { prevScore: number | null; prevSessionsCount: number };
};

export type FinishResult = {
  /** Whether the kid completed all questions, or abandoned partway. */
  finalStatus: "COMPLETED" | "ABANDONED";
  /** Completion bonus, only awarded on COMPLETED. */
  bonus: number;
  /**
   * Total coins to write back to the session row (sum of per-question coins
   * plus bonus if COMPLETED).
   */
  totalSessionCoins: number;
  /** Amount to add to Kid.coins (0 if ABANDONED). */
  walletDelta: number;
  /** Mastery update to apply — only meaningful on COMPLETED. */
  mastery: { score: number; sessionsCount: number };
};

export function computeSessionFinalState(input: FinishInput): FinishResult {
  const final: "COMPLETED" | "ABANDONED" =
    input.answeredCount >= input.totalQuestions ? "COMPLETED" : "ABANDONED";

  if (final !== "COMPLETED") {
    return {
      finalStatus: "ABANDONED",
      bonus: 0,
      totalSessionCoins: input.coinsEarnedSoFar,
      walletDelta: 0,
      mastery: {
        score: input.mastery.prevScore ?? 0.5,
        sessionsCount: input.mastery.prevSessionsCount,
      },
    };
  }

  const bonus = completionBonus(input.correctCount, input.totalQuestions);
  const totalSessionCoins = input.coinsEarnedSoFar + bonus;
  const masteryUpdate = computeMasteryUpdate({
    prevScore: input.mastery.prevScore,
    prevSessionsCount: input.mastery.prevSessionsCount,
    correct: input.correctCount,
    total: input.totalQuestions,
  });

  return {
    finalStatus: "COMPLETED",
    bonus,
    totalSessionCoins,
    walletDelta: totalSessionCoins,
    mastery: masteryUpdate,
  };
}
