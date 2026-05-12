// Server-authoritative coin economy.
//
// The kid client tells the server: "I answered question X, here's my answer,
// I spent N ms". The server grades the answer (lib/quiz-schemas.ts) and then
// calls coinsFor() to decide the reward. The client never decides coin totals.
//
// Tuning knobs are intentionally in code (not config) so that future changes
// to the curve are a code review, not a runtime knob.

export type CoinInput = {
  correct: boolean;
  /** Time the kid spent on the question, ms. */
  msSpent: number;
  /**
   * Optional streak bonus multiplier from the session, e.g. 1.0 for first
   * correct, 1.25 after 3 in a row. The session manager computes this; the
   * coin helper just applies it.
   */
  streakBonus?: number;
};

const BASE_REWARD = 8; // coins for a normal correct answer
const SPEED_BONUS_MAX = 4; // extra coins when answered very fast
const SPEED_BONUS_THRESHOLD_MS = 4_000; // under this = full speed bonus
const SPEED_BONUS_FLOOR_MS = 15_000; // over this = no speed bonus
const MAX_STREAK_BONUS = 2.0; // hard cap on streak multiplier

export function coinsFor(input: CoinInput): number {
  if (!input.correct) return 0;
  const speed = speedBonus(input.msSpent);
  const subtotal = BASE_REWARD + speed;
  const streak = Math.min(MAX_STREAK_BONUS, Math.max(1, input.streakBonus ?? 1));
  return Math.round(subtotal * streak);
}

function speedBonus(msSpent: number): number {
  if (!Number.isFinite(msSpent) || msSpent <= 0) return 0;
  if (msSpent <= SPEED_BONUS_THRESHOLD_MS) return SPEED_BONUS_MAX;
  if (msSpent >= SPEED_BONUS_FLOOR_MS) return 0;
  // linear ramp between threshold and floor
  const t =
    (SPEED_BONUS_FLOOR_MS - msSpent) /
    (SPEED_BONUS_FLOOR_MS - SPEED_BONUS_THRESHOLD_MS);
  return Math.round(SPEED_BONUS_MAX * t);
}

/**
 * Streak multiplier for the Nth consecutive correct answer in a session.
 * 1.00 first correct, 1.25 after 3, 1.50 after 6, 2.00 after 10+.
 */
export function streakMultiplier(consecutiveCorrect: number): number {
  if (consecutiveCorrect <= 1) return 1.0;
  if (consecutiveCorrect < 3) return 1.0;
  if (consecutiveCorrect < 6) return 1.25;
  if (consecutiveCorrect < 10) return 1.5;
  return 2.0;
}

/** Completion bonus awarded when a session is finished. */
export function completionBonus(correctCount: number, total: number): number {
  if (total <= 0) return 0;
  if (correctCount === total) return 25; // perfect quiz
  if (correctCount >= Math.ceil(total * 0.8)) return 12;
  if (correctCount >= Math.ceil(total * 0.5)) return 5;
  return 0;
}

/**
 * Returns how many of the most recent entries are correct, in a row.
 *   countTrailingCorrect([{correct: true}, {correct: false}, {correct: true}, {correct: true}])
 *   → 2
 * Used by the quiz session action to compute the live streak before grading
 * the current answer.
 */
export function countTrailingCorrect(
  entries: ReadonlyArray<{ correct: boolean }>,
): number {
  let n = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].correct) n++;
    else break;
  }
  return n;
}
