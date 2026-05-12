import { describe, it, expect } from "vitest";
import {
  validatePayload,
  safeValidatePayload,
  gradeAnswer,
  type GameType,
} from "./quiz-schemas";

describe("validatePayload — MC", () => {
  const valid = {
    q: "Welk getal is 7 × 8?",
    options: ["54", "56", "58", "62"],
    correctIdx: 1,
  };

  it("accepts a well-formed MC payload", () => {
    expect(() => validatePayload("MC", valid)).not.toThrow();
  });

  it("rejects MC with wrong number of options", () => {
    const r = safeValidatePayload("MC", { ...valid, options: ["A", "B", "C"] });
    expect(r.ok).toBe(false);
  });

  it("rejects MC with correctIdx out of range", () => {
    const r = safeValidatePayload("MC", { ...valid, correctIdx: 4 });
    expect(r.ok).toBe(false);
  });

  it("rejects MC with empty question", () => {
    const r = safeValidatePayload("MC", { ...valid, q: "" });
    expect(r.ok).toBe(false);
  });
});

describe("validatePayload — TYPE", () => {
  it("accepts answer + optional accept list", () => {
    expect(() =>
      validatePayload("TYPE", { q: "Stam + t?", answer: "wandelt" }),
    ).not.toThrow();
    expect(() =>
      validatePayload("TYPE", {
        q: "Stam + t?",
        answer: "wandelt",
        accept: ["wandeld"],
      }),
    ).not.toThrow();
  });

  it("rejects when answer is missing", () => {
    const r = safeValidatePayload("TYPE", { q: "Stam + t?" });
    expect(r.ok).toBe(false);
  });
});

describe("validatePayload — MATCH", () => {
  it("accepts exactly 5 pairs", () => {
    const payload = {
      q: "Match elke hond met het juiste woord",
      pairs: [
        { l: "dog", r: "hond" },
        { l: "cat", r: "kat" },
        { l: "bird", r: "vogel" },
        { l: "horse", r: "paard" },
        { l: "fish", r: "vis" },
      ],
    };
    expect(() => validatePayload("MATCH", payload)).not.toThrow();
  });

  it("rejects fewer than 5 pairs", () => {
    const r = safeValidatePayload("MATCH", {
      q: "Match",
      pairs: [
        { l: "a", r: "1" },
        { l: "b", r: "2" },
      ],
    });
    expect(r.ok).toBe(false);
  });
});

describe("validatePayload — DRAG_ORDER", () => {
  it("accepts when correctOrder is a permutation of items", () => {
    expect(() =>
      validatePayload("DRAG_ORDER", {
        q: "Zet op volgorde",
        items: ["1/8", "1/4", "1/2", "3/4"],
        correctOrder: ["1/8", "1/4", "1/2", "3/4"],
      }),
    ).not.toThrow();
  });

  it("rejects when correctOrder has different items", () => {
    const r = safeValidatePayload("DRAG_ORDER", {
      q: "Zet op volgorde",
      items: ["1/8", "1/4", "1/2", "3/4"],
      correctOrder: ["1/8", "1/4", "1/2", "1/1"],
    });
    expect(r.ok).toBe(false);
  });

  it("rejects when sizes mismatch", () => {
    const r = safeValidatePayload("DRAG_ORDER", {
      q: "Zet op volgorde",
      items: ["a", "b", "c"],
      correctOrder: ["a", "b"],
    });
    expect(r.ok).toBe(false);
  });
});

describe("gradeAnswer", () => {
  it("MC: correctIdx match", () => {
    const p = { q: "?", options: ["a", "b", "c", "d"], correctIdx: 2 };
    expect(gradeAnswer("MC", p, 2)).toBe(true);
    expect(gradeAnswer("MC", p, 1)).toBe(false);
    expect(gradeAnswer("MC", p, "2")).toBe(false); // strict number
  });

  it("CATAPULT: identical to MC", () => {
    const p = { q: "?", options: ["a", "b", "c", "d"], correctIdx: 0 };
    expect(gradeAnswer("CATAPULT", p, 0)).toBe(true);
    expect(gradeAnswer("CATAPULT", p, 3)).toBe(false);
  });

  it("TYPE: case- and whitespace-insensitive, NL locale", () => {
    const p = { q: "?", answer: "Wandelt" };
    expect(gradeAnswer("TYPE", p, "wandelt")).toBe(true);
    expect(gradeAnswer("TYPE", p, "  WANDELT ")).toBe(true);
    expect(gradeAnswer("TYPE", p, "wandeld")).toBe(false);
  });

  it("TYPE: accept list allows extra spellings", () => {
    const p = { q: "?", answer: "Lopen", accept: ["loopt"] };
    expect(gradeAnswer("TYPE", p, "loopt")).toBe(true);
  });

  it("MATCH: order-insensitive set comparison", () => {
    const p = {
      q: "?",
      pairs: [
        { l: "a", r: "1" },
        { l: "b", r: "2" },
        { l: "c", r: "3" },
        { l: "d", r: "4" },
        { l: "e", r: "5" },
      ],
    };
    const shuffled = [...p.pairs].reverse();
    expect(gradeAnswer("MATCH", p, shuffled)).toBe(true);
    const wrong = [...p.pairs.slice(0, 4), { l: "e", r: "WRONG" }];
    expect(gradeAnswer("MATCH", p, wrong)).toBe(false);
  });

  it("DRAG_ORDER: exact sequence required", () => {
    const p = {
      q: "?",
      items: ["1", "2", "3"],
      correctOrder: ["1", "2", "3"],
    };
    expect(gradeAnswer("DRAG_ORDER", p, ["1", "2", "3"])).toBe(true);
    expect(gradeAnswer("DRAG_ORDER", p, ["1", "3", "2"])).toBe(false);
  });

  it.each(["MC", "TYPE", "CATAPULT", "MATCH", "DRAG_ORDER"] as GameType[])(
    "%s: hostile non-matching answer returns false",
    (gameType) => {
      const minimal: Record<GameType, unknown> = {
        MC: { q: "?", options: ["a", "b", "c", "d"], correctIdx: 0 },
        TYPE: { q: "?", answer: "x" },
        CATAPULT: { q: "?", options: ["a", "b", "c", "d"], correctIdx: 0 },
        MATCH: {
          q: "?",
          pairs: [
            { l: "a", r: "1" },
            { l: "b", r: "2" },
            { l: "c", r: "3" },
            { l: "d", r: "4" },
            { l: "e", r: "5" },
          ],
        },
        DRAG_ORDER: {
          q: "?",
          items: ["a", "b"],
          correctOrder: ["a", "b"],
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(gradeAnswer(gameType, minimal[gameType] as any, { evil: true })).toBe(
        false,
      );
    },
  );
});
