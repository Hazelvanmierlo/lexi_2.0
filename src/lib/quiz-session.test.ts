import { describe, it, expect } from "vitest";
import {
  gradeAndScore,
  computeSessionFinalState,
  type PerQuestionEntry,
} from "./quiz-session";

// ─── gradeAndScore ─────────────────────────────────────────────────────────

const McPayload = (correctIdx = 0) => ({
  q: "What's 1+1?",
  options: ["2", "3", "4", "5"],
  correctIdx,
});

describe("gradeAndScore — correctness", () => {
  it("MC: marks the right index correct and pays coins", () => {
    const r = gradeAndScore({
      gameType: "MC",
      payload: McPayload(0),
      questionId: "q1",
      questionOrder: 1,
      answer: 0,
      msSpent: 3_000,
      priorEntries: [],
    });
    expect(r.correct).toBe(true);
    expect(r.coinsAwarded).toBeGreaterThan(0);
    expect(r.reused).toBe(false);
  });

  it("MC: marks the wrong index wrong and pays zero", () => {
    const r = gradeAndScore({
      gameType: "MC",
      payload: McPayload(0),
      questionId: "q1",
      questionOrder: 1,
      answer: 2,
      msSpent: 3_000,
      priorEntries: [],
    });
    expect(r.correct).toBe(false);
    expect(r.coinsAwarded).toBe(0);
  });

  it("TYPE: case-insensitive, NL locale", () => {
    const r = gradeAndScore({
      gameType: "TYPE",
      payload: { q: "?", answer: "Wandelt" },
      questionId: "q1",
      questionOrder: 1,
      answer: "  wandelt  ",
      msSpent: 5_000,
      priorEntries: [],
    });
    expect(r.correct).toBe(true);
  });
});

describe("gradeAndScore — idempotency", () => {
  const earlier: PerQuestionEntry = {
    questionId: "q1",
    order: 1,
    correct: true,
    msSpent: 2_500,
    coinsAwarded: 17,
  };

  it("returns the recorded entry when the same question is re-submitted", () => {
    const r = gradeAndScore({
      gameType: "MC",
      payload: McPayload(0),
      questionId: "q1",
      questionOrder: 1,
      answer: 1, // would normally be wrong, but should reuse
      msSpent: 9_000,
      priorEntries: [earlier],
    });
    expect(r.reused).toBe(true);
    expect(r.correct).toBe(true);
    expect(r.coinsAwarded).toBe(17);
    expect(r.existingEntry).toBe(earlier);
  });
});

describe("gradeAndScore — streak", () => {
  function buildPriorRun(n: number, allCorrect = true): PerQuestionEntry[] {
    return Array.from({ length: n }, (_, i) => ({
      questionId: `prior-${i}`,
      order: i + 1,
      correct: allCorrect,
      msSpent: 3_000,
      coinsAwarded: 10,
    }));
  }

  it("with 2 prior correct, the 3rd correct earns the 1.25x streak multiplier", () => {
    const r2 = gradeAndScore({
      gameType: "MC",
      payload: McPayload(0),
      questionId: "qX",
      questionOrder: 3,
      answer: 0,
      msSpent: 2_500, // full speed bonus → base 8 + 4 = 12
      priorEntries: buildPriorRun(2),
    });
    // run goes to 3 → 1.25x. 12 × 1.25 = 15.
    expect(r2.coinsAwarded).toBe(15);
  });

  it("after 9 prior correct, the 10th gets the 2x cap", () => {
    const r = gradeAndScore({
      gameType: "MC",
      payload: McPayload(0),
      questionId: "qX",
      questionOrder: 10,
      answer: 0,
      msSpent: 2_000,
      priorEntries: buildPriorRun(9),
    });
    expect(r.coinsAwarded).toBe(24); // (8+4) * 2
  });

  it("a wrong answer breaks the streak — coins zero, no multiplier", () => {
    const r = gradeAndScore({
      gameType: "MC",
      payload: McPayload(0),
      questionId: "qX",
      questionOrder: 5,
      answer: 1,
      msSpent: 2_000,
      priorEntries: buildPriorRun(4),
    });
    expect(r.correct).toBe(false);
    expect(r.coinsAwarded).toBe(0);
  });
});

// ─── computeSessionFinalState ──────────────────────────────────────────────

describe("computeSessionFinalState — COMPLETED", () => {
  it("perfect quiz: bonus 25, mastery 1.0, walletDelta = sum", () => {
    const r = computeSessionFinalState({
      totalQuestions: 10,
      correctCount: 10,
      coinsEarnedSoFar: 120,
      answeredCount: 10,
      mastery: { prevScore: null, prevSessionsCount: 0 },
    });
    expect(r.finalStatus).toBe("COMPLETED");
    expect(r.bonus).toBe(25);
    expect(r.totalSessionCoins).toBe(145);
    expect(r.walletDelta).toBe(145);
    expect(r.mastery.score).toBe(1);
    expect(r.mastery.sessionsCount).toBe(1);
  });

  it("80% quiz: bonus 12", () => {
    const r = computeSessionFinalState({
      totalQuestions: 10,
      correctCount: 8,
      coinsEarnedSoFar: 80,
      answeredCount: 10,
      mastery: { prevScore: 0.6, prevSessionsCount: 2 },
    });
    expect(r.bonus).toBe(12);
    expect(r.totalSessionCoins).toBe(92);
    expect(r.walletDelta).toBe(92);
    // EWMA: 0.3 * 0.8 + 0.7 * 0.6 = 0.66
    expect(r.mastery.score).toBeCloseTo(0.66);
    expect(r.mastery.sessionsCount).toBe(3);
  });

  it("below 50%: no bonus, mastery still moves", () => {
    const r = computeSessionFinalState({
      totalQuestions: 10,
      correctCount: 3,
      coinsEarnedSoFar: 24,
      answeredCount: 10,
      mastery: { prevScore: 0.7, prevSessionsCount: 4 },
    });
    expect(r.bonus).toBe(0);
    expect(r.walletDelta).toBe(24);
    // 0.3 * 0.3 + 0.7 * 0.7 = 0.58
    expect(r.mastery.score).toBeCloseTo(0.58);
  });
});

describe("computeSessionFinalState — ABANDONED", () => {
  it("partial play: no bonus, no wallet credit, mastery untouched", () => {
    const r = computeSessionFinalState({
      totalQuestions: 10,
      correctCount: 4,
      coinsEarnedSoFar: 35,
      answeredCount: 6, // didn't finish
      mastery: { prevScore: 0.65, prevSessionsCount: 7 },
    });
    expect(r.finalStatus).toBe("ABANDONED");
    expect(r.bonus).toBe(0);
    expect(r.walletDelta).toBe(0);
    expect(r.totalSessionCoins).toBe(35); // unchanged
    expect(r.mastery.score).toBe(0.65); // unchanged
    expect(r.mastery.sessionsCount).toBe(7); // unchanged
  });

  it("ABANDONED with no prior mastery falls back to the seed default", () => {
    const r = computeSessionFinalState({
      totalQuestions: 10,
      correctCount: 0,
      coinsEarnedSoFar: 0,
      answeredCount: 0,
      mastery: { prevScore: null, prevSessionsCount: 0 },
    });
    expect(r.finalStatus).toBe("ABANDONED");
    expect(r.mastery.score).toBe(0.5);
  });
});
