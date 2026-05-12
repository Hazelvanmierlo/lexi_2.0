// Per-subject mastery, updated after each completed quiz session.
//
// Model: Exponentially-Weighted Moving Average (EWMA) of session correctness.
// Score is in [0, 1]; we display it as a percentage on the kid + parent
// dashboards.
//
//   new_score = α · session_score + (1 − α) · old_score
//
// We use α = 0.3 — a balance between responsiveness (recent sessions matter)
// and stability (one bad day shouldn't tank a kid's mastery to zero).
//
// The very first session for a (kid, subject) replaces the default 0.5 starting
// score one-shot rather than averaging it in, so the displayed number reflects
// what the kid actually did rather than dragging through the seeded value.

export const EWMA_ALPHA = 0.3;
const DEFAULT_SCORE = 0.5;
const MIN_TOTAL_QUESTIONS = 1; // sessions with no questions don't move mastery

export type MasteryUpdate = {
  /** Existing rolling score, or null if there's no record yet. */
  prevScore: number | null;
  /** How many sessions have contributed so far (not counting this one). */
  prevSessionsCount: number;
  /** Correct count from the session just finished. */
  correct: number;
  /** Total questions in the session. */
  total: number;
};

export type MasteryComputeResult = {
  /** Updated rolling score in [0, 1]. */
  score: number;
  /** Updated session count (= prev + 1). */
  sessionsCount: number;
};

export function computeMasteryUpdate(input: MasteryUpdate): MasteryComputeResult {
  if (input.total < MIN_TOTAL_QUESTIONS) {
    return {
      score: clamp01(input.prevScore ?? DEFAULT_SCORE),
      sessionsCount: input.prevSessionsCount,
    };
  }
  const sessionScore = clamp01(input.correct / input.total);
  if (input.prevScore === null || input.prevSessionsCount === 0) {
    // First contribution — replace the seeded default outright.
    return { score: sessionScore, sessionsCount: 1 };
  }
  const next =
    EWMA_ALPHA * sessionScore + (1 - EWMA_ALPHA) * input.prevScore;
  return {
    score: clamp01(next),
    sessionsCount: input.prevSessionsCount + 1,
  };
}

/** Convert a 0..1 score to an integer percentage for display. */
export function masteryPct(score: number): number {
  return Math.round(clamp01(score) * 100);
}

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return DEFAULT_SCORE;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}
