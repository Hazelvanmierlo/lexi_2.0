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
import { gradeAnswer, type AnyPayload, type GameType } from "./quiz-schemas";
import { computeMasteryUpdate } from "./mastery";

export type PerQuestionEntry = {
  questionId: string;
  order: number;
  correct: boolean;
  msSpent: number;
  coinsAwarded: number;
};

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
};

export function gradeAndScore(input: GradeInput): GradeResult {
  // Idempotency — if this question was already answered, return its recorded
  // result instead of grading again. This makes the action safe to retry.
  const prior = input.priorEntries.find(
    (e) => e.questionId === input.questionId,
  );
  if (prior) {
    return {
      correct: prior.correct,
      coinsAwarded: prior.coinsAwarded,
      newEntry: prior,
      reused: true,
      existingEntry: prior,
    };
  }

  const correct = gradeAnswer(input.gameType, input.payload, input.answer);

  // Streak counts the run going into this answer. If the kid was on 4 and
  // gets this one right, the multiplier reflects the new run of 5.
  const trailing = countTrailingCorrect(input.priorEntries);
  const newRun = correct ? trailing + 1 : 0;
  const multiplier = streakMultiplier(newRun);

  const coinsAwarded = correct
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
  };

  return { correct, coinsAwarded, newEntry, reused: false };
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
