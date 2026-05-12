import { describe, it, expect } from "vitest";
import {
  coinsFor,
  streakMultiplier,
  completionBonus,
  countTrailingCorrect,
} from "./coins";

describe("coinsFor", () => {
  it("wrong answer earns zero", () => {
    expect(coinsFor({ correct: false, msSpent: 2_000 })).toBe(0);
    expect(coinsFor({ correct: false, msSpent: 0 })).toBe(0);
  });

  it("correct + fast pays full speed bonus", () => {
    expect(coinsFor({ correct: true, msSpent: 2_500 })).toBe(8 + 4);
  });

  it("correct + slow pays no speed bonus", () => {
    expect(coinsFor({ correct: true, msSpent: 20_000 })).toBe(8);
  });

  it("correct in the middle of the ramp scales linearly", () => {
    // ~9.5s, halfway between 4s and 15s → ~half the speed bonus
    expect(coinsFor({ correct: true, msSpent: 9_500 })).toBe(8 + 2);
  });

  it("streak multiplier scales subtotal", () => {
    expect(coinsFor({ correct: true, msSpent: 2_000, streakBonus: 1.5 })).toBe(
      Math.round((8 + 4) * 1.5),
    );
  });

  it("streak multiplier is capped at 2.0", () => {
    expect(coinsFor({ correct: true, msSpent: 2_000, streakBonus: 5 })).toBe(
      Math.round((8 + 4) * 2),
    );
  });
});

describe("streakMultiplier", () => {
  it("first two correct: no bonus", () => {
    expect(streakMultiplier(1)).toBe(1.0);
    expect(streakMultiplier(2)).toBe(1.0);
  });

  it("3-5 in a row: 1.25x", () => {
    expect(streakMultiplier(3)).toBe(1.25);
    expect(streakMultiplier(5)).toBe(1.25);
  });

  it("6-9 in a row: 1.5x", () => {
    expect(streakMultiplier(6)).toBe(1.5);
    expect(streakMultiplier(9)).toBe(1.5);
  });

  it("10+ in a row: 2x", () => {
    expect(streakMultiplier(10)).toBe(2.0);
    expect(streakMultiplier(50)).toBe(2.0);
  });
});

describe("completionBonus", () => {
  it("perfect quiz: 25 coins", () => {
    expect(completionBonus(10, 10)).toBe(25);
  });

  it("80%+ scores: 12 coins", () => {
    expect(completionBonus(8, 10)).toBe(12);
    expect(completionBonus(9, 10)).toBe(12);
  });

  it("50%+ scores: 5 coins", () => {
    expect(completionBonus(5, 10)).toBe(5);
    expect(completionBonus(7, 10)).toBe(5);
  });

  it("below 50%: 0 coins", () => {
    expect(completionBonus(4, 10)).toBe(0);
    expect(completionBonus(0, 10)).toBe(0);
  });
});

describe("countTrailingCorrect", () => {
  it("returns 0 for empty history", () => {
    expect(countTrailingCorrect([])).toBe(0);
  });

  it("returns full length when everything is correct", () => {
    expect(
      countTrailingCorrect([{ correct: true }, { correct: true }, { correct: true }]),
    ).toBe(3);
  });

  it("returns 0 when the last entry is wrong", () => {
    expect(
      countTrailingCorrect([
        { correct: true },
        { correct: true },
        { correct: false },
      ]),
    ).toBe(0);
  });

  it("counts only the trailing run, not earlier streaks", () => {
    expect(
      countTrailingCorrect([
        { correct: true },
        { correct: true },
        { correct: true },
        { correct: false },
        { correct: true },
        { correct: true },
      ]),
    ).toBe(2);
  });
});
