import { describe, it, expect } from "vitest";
import { recommend } from "./recommend";

const NOW = new Date("2026-05-11T12:00:00Z");
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

describe("recommend — weakest subjects first", () => {
  it("orders by mastery low → high", () => {
    const result = recommend({
      availableQuizzes: [
        { id: "rk", subject: "REKENEN" },
        { id: "tl", subject: "TAAL" },
        { id: "lz", subject: "LEZEN" },
      ],
      masteryRecords: [
        {
          subject: "REKENEN",
          score: 0.9,
          lastSeenAt: new Date(NOW.getTime() - 10 * DAY),
        },
        {
          subject: "TAAL",
          score: 0.4,
          lastSeenAt: new Date(NOW.getTime() - 10 * DAY),
        },
        {
          subject: "LEZEN",
          score: 0.7,
          lastSeenAt: new Date(NOW.getTime() - 10 * DAY),
        },
      ],
      recentSessionsByQuiz: new Map(),
      now: NOW,
    });
    expect(result.map((r) => r.quizId)).toEqual(["tl", "lz", "rk"]);
  });

  it("treats subjects without a mastery row as the seeded default (0.5)", () => {
    const result = recommend({
      availableQuizzes: [
        { id: "high", subject: "REKENEN" },
        { id: "unseen", subject: "ENGELS" },
      ],
      masteryRecords: [
        {
          subject: "REKENEN",
          score: 0.9,
          lastSeenAt: new Date(NOW.getTime() - 10 * DAY),
        },
      ],
      recentSessionsByQuiz: new Map(),
      now: NOW,
    });
    // "unseen" comes first because 0.5 default < 0.9 mastery, then "high".
    // BUT "unseen" also gets the stale-subject bonus (no record means it's
    // older than 7 days), so the gap is even wider.
    expect(result[0].quizId).toBe("unseen");
  });
});

describe("recommend — 24h cooldown", () => {
  it("a quiz played 1h ago is pushed to the bottom", () => {
    const result = recommend({
      availableQuizzes: [
        { id: "fresh", subject: "REKENEN" },
        { id: "recent", subject: "TAAL" },
      ],
      // TAAL is weaker → would normally win
      masteryRecords: [
        {
          subject: "REKENEN",
          score: 0.9,
          lastSeenAt: new Date(NOW.getTime() - 10 * DAY),
        },
        {
          subject: "TAAL",
          score: 0.3,
          lastSeenAt: new Date(NOW.getTime() - 10 * DAY),
        },
      ],
      // …but the TAAL quiz was played 1h ago, so cooldown sinks it.
      recentSessionsByQuiz: new Map([
        ["recent", new Date(NOW.getTime() - HOUR)],
      ]),
      now: NOW,
    });
    expect(result[0].quizId).toBe("fresh");
    expect(result[1].quizId).toBe("recent");
  });

  it("a quiz played 25h ago is no longer in cooldown", () => {
    const result = recommend({
      availableQuizzes: [
        { id: "old", subject: "TAAL" },
        { id: "new", subject: "REKENEN" },
      ],
      masteryRecords: [
        {
          subject: "REKENEN",
          score: 0.9,
          lastSeenAt: new Date(NOW.getTime() - 10 * DAY),
        },
        {
          subject: "TAAL",
          score: 0.3,
          lastSeenAt: new Date(NOW.getTime() - 10 * DAY),
        },
      ],
      recentSessionsByQuiz: new Map([
        ["old", new Date(NOW.getTime() - 25 * HOUR)],
      ]),
      now: NOW,
    });
    // TAAL is weaker AND no longer in cooldown → wins.
    expect(result[0].quizId).toBe("old");
  });
});

describe("recommend — stale-subject bonus", () => {
  it("a subject not touched in 8 days gets a priority boost over a 2-day-old one", () => {
    const result = recommend({
      availableQuizzes: [
        { id: "stale", subject: "WERELD" },
        { id: "recent", subject: "REKENEN" },
      ],
      masteryRecords: [
        // same mastery so only staleness differs
        {
          subject: "WERELD",
          score: 0.6,
          lastSeenAt: new Date(NOW.getTime() - 8 * DAY),
        },
        {
          subject: "REKENEN",
          score: 0.6,
          lastSeenAt: new Date(NOW.getTime() - 2 * DAY),
        },
      ],
      recentSessionsByQuiz: new Map(),
      now: NOW,
    });
    expect(result[0].quizId).toBe("stale");
  });
});

describe("recommend — limit", () => {
  it("respects the limit argument", () => {
    const result = recommend({
      availableQuizzes: Array.from({ length: 10 }, (_, i) => ({
        id: `q${i}`,
        subject: "REKENEN" as const,
      })),
      masteryRecords: [],
      recentSessionsByQuiz: new Map(),
      now: NOW,
      limit: 3,
    });
    expect(result).toHaveLength(3);
  });

  it("defaults to 5", () => {
    const result = recommend({
      availableQuizzes: Array.from({ length: 8 }, (_, i) => ({
        id: `q${i}`,
        subject: "TAAL" as const,
      })),
      masteryRecords: [],
      recentSessionsByQuiz: new Map(),
      now: NOW,
    });
    expect(result).toHaveLength(5);
  });
});
