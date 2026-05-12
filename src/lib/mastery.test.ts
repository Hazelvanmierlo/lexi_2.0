import { describe, it, expect } from "vitest";
import { computeMasteryUpdate, masteryPct, EWMA_ALPHA } from "./mastery";

describe("computeMasteryUpdate", () => {
  it("first session: takes the session score as the new mastery", () => {
    const r = computeMasteryUpdate({
      prevScore: null,
      prevSessionsCount: 0,
      correct: 8,
      total: 10,
    });
    expect(r.score).toBeCloseTo(0.8);
    expect(r.sessionsCount).toBe(1);
  });

  it("first session even when seeded with the 0.5 default replaces it", () => {
    const r = computeMasteryUpdate({
      prevScore: 0.5,
      prevSessionsCount: 0,
      correct: 10,
      total: 10,
    });
    expect(r.score).toBe(1);
    expect(r.sessionsCount).toBe(1);
  });

  it("subsequent session: EWMA blends old and new", () => {
    // prev 0.6, this session 0.4 → 0.3*0.4 + 0.7*0.6 = 0.54
    const r = computeMasteryUpdate({
      prevScore: 0.6,
      prevSessionsCount: 3,
      correct: 4,
      total: 10,
    });
    expect(r.score).toBeCloseTo(EWMA_ALPHA * 0.4 + (1 - EWMA_ALPHA) * 0.6);
    expect(r.sessionsCount).toBe(4);
  });

  it("clamps to [0,1] on extreme blends", () => {
    const r1 = computeMasteryUpdate({
      prevScore: 0,
      prevSessionsCount: 1,
      correct: 0,
      total: 10,
    });
    expect(r1.score).toBe(0);
    const r2 = computeMasteryUpdate({
      prevScore: 1,
      prevSessionsCount: 1,
      correct: 10,
      total: 10,
    });
    expect(r2.score).toBe(1);
  });

  it("zero-question session does not move the score", () => {
    const r = computeMasteryUpdate({
      prevScore: 0.7,
      prevSessionsCount: 2,
      correct: 0,
      total: 0,
    });
    expect(r.score).toBe(0.7);
    expect(r.sessionsCount).toBe(2);
  });

  it("non-finite prevScore falls back to the default", () => {
    const r = computeMasteryUpdate({
      prevScore: Number.NaN,
      prevSessionsCount: 5,
      correct: 5,
      total: 10,
    });
    // first-session replacement path doesn't fire (prevSessionsCount > 0), but
    // the EWMA computation should still produce a finite result because the
    // clamp protects against NaN.
    expect(Number.isFinite(r.score)).toBe(true);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(1);
  });
});

describe("masteryPct", () => {
  it("rounds to nearest integer percent", () => {
    expect(masteryPct(0)).toBe(0);
    expect(masteryPct(1)).toBe(100);
    expect(masteryPct(0.876)).toBe(88);
    expect(masteryPct(0.875)).toBe(88); // banker's-round-ish; Math.round gives 88
  });

  it("clamps out-of-range inputs", () => {
    expect(masteryPct(-1)).toBe(0);
    expect(masteryPct(2)).toBe(100);
  });
});
