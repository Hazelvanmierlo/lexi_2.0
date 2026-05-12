// Adaptive quiz recommender — picks the next N quizzes a kid should play.
//
// Pure function (no I/O). The page loads all the inputs from Prisma and asks
// recommend() to order them. Three rules, blended into a score per quiz:
//
//   1. WEAKEST SUBJECTS FIRST.    Lower mastery = higher priority. Reasoning:
//      the kid should oefenen what they don't know yet, not coast on what
//      they're already good at. A subject with no MasteryRecord at all is
//      treated as 0.5 (the seeded default).
//
//   2. AVOID RECENTLY PLAYED.     A quiz played in the last 24 hours is
//      heavily de-prioritised (push to the end). Reasoning: don't make the
//      kid grind the same quiz twice in a day — there's no learning gain.
//
//   3. PREFER STALE SUBJECTS.     A subject the kid hasn't touched in 7+ days
//      gets a small priority boost. Reasoning: spaced practice beats
//      cramming, and we want to keep all five vakken in rotation.
//
// Tunables are constants at the top so we can adjust without changing logic.

import type { Subject } from "@/generated/prisma/enums";

const MASTERY_DEFAULT = 0.5;
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h
const STALE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const COOLDOWN_PENALTY = 1_000; // huge — sinks the quiz to the bottom
const STALE_BONUS = -0.2; // small — pulls a quiz forward

export type RecommendInput = {
  /** All currently-LIVE quizzes available to the kid (already filtered by region/groep). */
  availableQuizzes: ReadonlyArray<{
    id: string;
    subject: Subject;
  }>;
  /** The kid's current mastery rows. Subjects without a row are treated as default. */
  masteryRecords: ReadonlyArray<{
    subject: Subject;
    score: number;
    lastSeenAt: Date;
  }>;
  /**
   * The kid's recent sessions grouped per quiz. Only need the most recent start
   * per quiz — anything earlier is irrelevant to the recency rules.
   */
  recentSessionsByQuiz: ReadonlyMap<string, Date>;
  /** Reference "now" — pass in for deterministic testing. */
  now: Date;
  /** How many quizzes to return (default 5). */
  limit?: number;
};

export type Recommended = {
  quizId: string;
  /** Lower score = higher priority. Mostly useful for tests / debugging. */
  priority: number;
  subject: Subject;
};

export function recommend(input: RecommendInput): Recommended[] {
  const masteryMap = new Map<Subject, number>();
  const lastSubjectSeen = new Map<Subject, Date>();
  for (const m of input.masteryRecords) {
    masteryMap.set(m.subject, m.score);
    lastSubjectSeen.set(m.subject, m.lastSeenAt);
  }

  const nowMs = input.now.getTime();

  const scored = input.availableQuizzes.map((q): Recommended => {
    const mastery = masteryMap.get(q.subject) ?? MASTERY_DEFAULT;

    // Lower mastery → smaller (better) priority value.
    let priority = mastery;

    // 24h cooldown for this specific quiz.
    const lastPlayed = input.recentSessionsByQuiz.get(q.id);
    if (lastPlayed && nowMs - lastPlayed.getTime() < COOLDOWN_MS) {
      priority += COOLDOWN_PENALTY;
    }

    // Stale subject bonus (subject not touched in 7+ days).
    const lastSubject = lastSubjectSeen.get(q.subject);
    if (!lastSubject || nowMs - lastSubject.getTime() >= STALE_MS) {
      priority += STALE_BONUS;
    }

    return { quizId: q.id, priority, subject: q.subject };
  });

  scored.sort((a, b) => a.priority - b.priority);

  const limit = input.limit ?? 5;
  return scored.slice(0, limit);
}
