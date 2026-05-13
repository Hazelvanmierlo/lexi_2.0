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

  it("Levenshtein-1 tolerance for length >= 4", () => {
    expect(normaliseAndCompare("hund", "hond")).toBe(true); // 1 substitution
    expect(normaliseAndCompare("hond", "honde")).toBe(true); // 1 insertion
    expect(normaliseAndCompare("honds", "hond")).toBe(true); // 1 insertion
    expect(normaliseAndCompare("hnd", "hond")).toBe(true); // 1 deletion
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
