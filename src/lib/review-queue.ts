// Review-queue helper.
//
// At the end of a normal quiz run, we re-show the questions the kid got
// wrong as a brief review round. This file owns the "which question next?"
// decision so the QuizPlayer state machine stays small.

/** Returns the index of the next failed question to retry, or null if none remain. */
export function nextReviewQuestionIdx(
  failedIndices: ReadonlyArray<number>,
  alreadyReviewedIndices: ReadonlyArray<number>,
): number | null {
  const reviewed = new Set(alreadyReviewedIndices);
  for (const idx of failedIndices) {
    if (!reviewed.has(idx)) return idx;
  }
  return null;
}
