"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { validatePayload, type GameType } from "@/lib/quiz-schemas";
import {
  gradeAndScore,
  computeSessionFinalState,
  type PerQuestionEntry,
} from "@/lib/quiz-session";
import type { Subject } from "@/generated/prisma/enums";

// ─── input shapes ─────────────────────────────────────────────────────────

const StartInput = z.object({
  quizId: z.string().min(1),
  kidId: z.string().min(1),
});

const SubmitInput = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  /** The kid's answer. Shape depends on the quiz's gameType — server validates. */
  answer: z.unknown(),
  msSpent: z.number().int().min(0).max(15 * 60 * 1000),
});

const FinishInput = z.object({
  sessionId: z.string().min(1),
});

export type StartResult = {
  sessionId: string;
  totalQuestions: number;
};

export type SubmitResult = {
  correct: boolean;
  coinsAwarded: number;
  /** Aggregate so far. */
  correctCount: number;
  totalAnswered: number;
};

export type FinishResult = {
  correctCount: number;
  total: number;
  coinsEarned: number;
  completionBonus: number;
  totalCoins: number;
};

// ─── start a session ───────────────────────────────────────────────────────

export async function startSession(input: z.infer<typeof StartInput>): Promise<StartResult> {
  const { quizId, kidId } = StartInput.parse(input);

  const quiz = (await db.quiz.findFirst({
    where: { id: quizId, status: "LIVE" },
    select: { id: true, _count: { select: { questions: true } } },
  })) as { id: string; _count: { questions: number } } | null;

  if (!quiz) throw new Error(`Quiz "${quizId}" is not live or does not exist`);
  if (quiz._count.questions === 0)
    throw new Error(`Quiz "${quizId}" has no questions`);

  const kid = (await db.kid.findUnique({
    where: { id: kidId },
    select: { id: true },
  })) as { id: string } | null;
  if (!kid) throw new Error(`Kid "${kidId}" does not exist`);

  const session = (await db.session.create({
    data: {
      kidId,
      quizId,
      status: "IN_PROGRESS",
      perQuestion: [],
    },
    select: { id: true },
  })) as { id: string };

  return { sessionId: session.id, totalQuestions: quiz._count.questions };
}

// ─── submit one answer ─────────────────────────────────────────────────────

export async function submitAnswer(input: z.infer<typeof SubmitInput>): Promise<SubmitResult> {
  const { sessionId, questionId, answer, msSpent } = SubmitInput.parse(input);

  type SessionRow = {
    id: string;
    status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
    correctCount: number;
    coinsEarned: number;
    perQuestion: unknown;
    quiz: { gameType: GameType };
  };

  const session = (await db.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      status: true,
      correctCount: true,
      coinsEarned: true,
      perQuestion: true,
      quiz: { select: { gameType: true } },
    },
  })) as SessionRow | null;

  if (!session) throw new Error(`Session "${sessionId}" not found`);
  if (session.status !== "IN_PROGRESS")
    throw new Error(`Session is not in progress (status: ${session.status})`);

  const priorEntries = Array.isArray(session.perQuestion)
    ? (session.perQuestion as PerQuestionEntry[])
    : [];

  const question = (await db.question.findUnique({
    where: { id: questionId },
    select: { id: true, order: true, payload: true },
  })) as
    | { id: string; order: number; payload: unknown }
    | null;
  if (!question) throw new Error(`Question "${questionId}" not found`);

  const payload = validatePayload(session.quiz.gameType, question.payload);

  const graded = gradeAndScore({
    gameType: session.quiz.gameType,
    payload,
    questionId,
    questionOrder: question.order,
    answer,
    msSpent,
    priorEntries,
  });

  if (graded.reused) {
    return {
      correct: graded.correct,
      coinsAwarded: graded.coinsAwarded,
      correctCount: session.correctCount,
      totalAnswered: priorEntries.length,
    };
  }

  const nextPerQuestion = [...priorEntries, graded.newEntry];
  const newCorrectCount =
    session.correctCount + (graded.correct ? 1 : 0);

  await db.session.update({
    where: { id: sessionId },
    data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      perQuestion: nextPerQuestion as any,
      correctCount: newCorrectCount,
      coinsEarned: session.coinsEarned + graded.coinsAwarded,
    },
  });

  return {
    correct: graded.correct,
    coinsAwarded: graded.coinsAwarded,
    correctCount: newCorrectCount,
    totalAnswered: nextPerQuestion.length,
  };
}

// ─── finish a session ──────────────────────────────────────────────────────

export async function finishSession(input: z.infer<typeof FinishInput>): Promise<FinishResult> {
  const { sessionId } = FinishInput.parse(input);

  type SessionRow = {
    id: string;
    status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
    kidId: string;
    correctCount: number;
    coinsEarned: number;
    perQuestion: unknown;
    quiz: { subject: Subject; _count: { questions: number } };
  };

  const session = (await db.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      status: true,
      kidId: true,
      correctCount: true,
      coinsEarned: true,
      perQuestion: true,
      quiz: {
        select: {
          subject: true,
          _count: { select: { questions: true } },
        },
      },
    },
  })) as SessionRow | null;

  if (!session) throw new Error(`Session "${sessionId}" not found`);

  const totalQuestions = session.quiz._count.questions;
  const answeredCount = Array.isArray(session.perQuestion)
    ? (session.perQuestion as PerQuestionEntry[]).length
    : 0;

  // Prior mastery for the quiz's subject (null if no record yet).
  type MasteryRow = { score: number; sessionsCount: number };
  const priorMastery = (await db.masteryRecord.findUnique({
    where: {
      kidId_subject: { kidId: session.kidId, subject: session.quiz.subject },
    },
    select: { score: true, sessionsCount: true },
  })) as MasteryRow | null;

  const final = computeSessionFinalState({
    totalQuestions,
    correctCount: session.correctCount,
    coinsEarnedSoFar: session.coinsEarned,
    answeredCount,
    mastery: {
      prevScore: priorMastery?.score ?? null,
      prevSessionsCount: priorMastery?.sessionsCount ?? 0,
    },
  });

  if (session.status === "IN_PROGRESS") {
    await db.session.update({
      where: { id: sessionId },
      data: {
        status: final.finalStatus,
        finishedAt: new Date(),
        coinsEarned: final.totalSessionCoins,
      },
    });

    if (final.finalStatus === "COMPLETED") {
      await db.kid.update({
        where: { id: session.kidId },
        data: { coins: { increment: final.walletDelta } },
      });

      await db.masteryRecord.upsert({
        where: {
          kidId_subject: {
            kidId: session.kidId,
            subject: session.quiz.subject,
          },
        },
        update: {
          score: final.mastery.score,
          sessionsCount: final.mastery.sessionsCount,
          lastSeenAt: new Date(),
        },
        create: {
          kidId: session.kidId,
          subject: session.quiz.subject,
          score: final.mastery.score,
          sessionsCount: final.mastery.sessionsCount,
          lastSeenAt: new Date(),
        },
      });
    }
  }

  return {
    correctCount: session.correctCount,
    total: totalQuestions,
    coinsEarned: session.coinsEarned,
    completionBonus: final.bonus,
    totalCoins: final.totalSessionCoins,
  };
}
