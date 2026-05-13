// Type-tolerance helpers for TYPE-game grading.
//
// Kids in groep 1-8 are still learning to spell. Strict equality on the
// canonical answer feels punitive when the intent is clear. We accept:
//   - case differences ("Hond" == "hond")
//   - leading / trailing / collapsed whitespace
//   - diacritics ("café" == "cafe")
//   - single-character typos (Levenshtein distance 1) for answers of
//     length >= 4
//
// We do NOT tolerate typos when:
//   - the answer is purely numeric (math: 43 != 42)
//   - the answer is shorter than 4 characters (too risky — "ja" vs "je")

const NUMERIC = /^[0-9]+$/;

export function normaliseAnswer(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const m = a.length;
  const n = b.length;
  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1, // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

export function normaliseAndCompare(input: string, canonical: string): boolean {
  const a = normaliseAnswer(input);
  const b = normaliseAnswer(canonical);
  if (a === b) return true;
  // Numeric -> exact only
  if (NUMERIC.test(a) || NUMERIC.test(b)) return false;
  // Short answers -> exact only
  if (b.length < 4) return false;
  return levenshtein(a, b) <= 1;
}
