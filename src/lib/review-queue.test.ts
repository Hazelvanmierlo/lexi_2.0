import { describe, it, expect } from "vitest";
import { nextReviewQuestionIdx } from "./review-queue";

describe("nextReviewQuestionIdx", () => {
  it("returns null when no failed questions", () => {
    expect(nextReviewQuestionIdx([], [])).toBeNull();
  });

  it("returns the first failed question index", () => {
    expect(nextReviewQuestionIdx([2, 5], [])).toBe(2);
  });

  it("skips already-reviewed (and now-correct) questions", () => {
    expect(nextReviewQuestionIdx([2, 5], [2])).toBe(5);
  });

  it("returns null when all failed have been reviewed", () => {
    expect(nextReviewQuestionIdx([2, 5], [2, 5])).toBeNull();
  });
});
