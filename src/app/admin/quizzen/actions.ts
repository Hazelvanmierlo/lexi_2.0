"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { validatePayload, type GameType } from "@/lib/quiz-schemas";
import { requireAdmin } from "@/lib/auth";

const DEMO_ADMIN_ID = "seed-parent-demo";

async function requireAdminUserId(): Promise<string> {
  if (process.env.NEXT_PUBLIC_AUTH_ENABLED === "true") {
    const parent = await requireAdmin();
    return parent.clerkUserId;
  }
  // Demo path — preserved for cutover rollback.
  const parent = (await db.parent.findUnique({
    where: { id: DEMO_ADMIN_ID },
    select: { id: true, role: true, clerkUserId: true },
  })) as { id: string; role: "PARENT" | "ADMIN"; clerkUserId: string } | null;
  if (!parent) throw new Error("Admin parent not found — seed the DB first.");
  if (parent.role !== "ADMIN") throw new Error("Not authorised.");
  return parent.clerkUserId;
}

async function writeAudit(input: {
  actorUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  diff?: unknown;
}) {
  await db.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      diff: (input.diff ?? {}) as any,
    },
  });
}

// ─── Zod inputs ────────────────────────────────────────────────────────────

const CreateQuizInput = z.object({
  title: z.string().min(1).max(120),
  subject: z.enum(["REKENEN", "TAAL", "LEZEN", "WERELD", "ENGELS"]),
  groep: z.number().int().min(1).max(8),
  region: z.enum(["NL", "BE"]),
  gameType: z.enum(["MC", "TYPE", "CATAPULT", "MATCH", "DRAG_ORDER"]),
  customExplain: z.string().max(800).default(""),
});

const UpdateQuizInput = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120).optional(),
  subject: z
    .enum(["REKENEN", "TAAL", "LEZEN", "WERELD", "ENGELS"])
    .optional(),
  groep: z.number().int().min(1).max(8).optional(),
  region: z.enum(["NL", "BE"]).optional(),
  gameType: z
    .enum(["MC", "TYPE", "CATAPULT", "MATCH", "DRAG_ORDER"])
    .optional(),
  customExplain: z.string().max(800).optional(),
});

const SetStatusInput = z.object({
  id: z.string().min(1),
  status: z.enum(["LIVE", "CONCEPT"]),
});

const UpsertQuestionInput = z.object({
  quizId: z.string().min(1),
  /** Pass undefined to insert; pass an id to update. */
  questionId: z.string().optional(),
  order: z.number().int().min(1).max(50),
  /** Validated server-side against the quiz's gameType. */
  payload: z.unknown(),
});

const RemoveQuestionInput = z.object({
  questionId: z.string().min(1),
});

// ─── actions ───────────────────────────────────────────────────────────────

export async function createQuiz(input: z.infer<typeof CreateQuizInput>) {
  const data = CreateQuizInput.parse(input);
  const actor = await requireAdminUserId();

  const created = (await db.quiz.create({
    data: {
      title: data.title,
      subject: data.subject,
      groep: data.groep,
      region: data.region,
      gameType: data.gameType,
      customExplain: data.customExplain,
      status: "CONCEPT",
    },
    select: { id: true },
  })) as { id: string };

  await writeAudit({
    actorUserId: actor,
    action: "quiz.create",
    targetType: "Quiz",
    targetId: created.id,
    diff: data,
  });

  revalidatePath("/admin/quizzen");
  redirect(`/admin/quizzen/${created.id}`);
}

export async function updateQuiz(input: z.infer<typeof UpdateQuizInput>) {
  const data = UpdateQuizInput.parse(input);
  const actor = await requireAdminUserId();

  const { id, ...rest } = data;
  if (Object.keys(rest).length === 0) return;

  await db.quiz.update({ where: { id }, data: rest });

  await writeAudit({
    actorUserId: actor,
    action: "quiz.update",
    targetType: "Quiz",
    targetId: id,
    diff: rest,
  });

  revalidatePath("/admin/quizzen");
  revalidatePath(`/admin/quizzen/${id}`);
}

export async function setQuizStatus(input: z.infer<typeof SetStatusInput>) {
  const { id, status } = SetStatusInput.parse(input);
  const actor = await requireAdminUserId();

  // If publishing, refuse unless every question's payload validates.
  if (status === "LIVE") {
    type Row = { gameType: GameType; questions: Array<{ payload: unknown }> };
    const quiz = (await db.quiz.findUnique({
      where: { id },
      select: {
        gameType: true,
        questions: { select: { payload: true } },
      },
    })) as Row | null;
    if (!quiz) throw new Error("Quiz not found");
    if (quiz.questions.length === 0)
      throw new Error("Voeg minstens één vraag toe voor je live zet.");
    quiz.questions.forEach((q, i) => {
      try {
        validatePayload(quiz.gameType, q.payload);
      } catch (err) {
        throw new Error(
          `Vraag ${i + 1} klopt niet: ${(err as Error).message}`,
        );
      }
    });
  }

  await db.quiz.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "LIVE" ? new Date() : null,
    },
  });

  await writeAudit({
    actorUserId: actor,
    action: status === "LIVE" ? "quiz.publish" : "quiz.unpublish",
    targetType: "Quiz",
    targetId: id,
    diff: { status },
  });

  revalidatePath("/admin/quizzen");
  revalidatePath(`/admin/quizzen/${id}`);
}

export async function deleteQuiz(input: { id: string }) {
  const id = z.string().min(1).parse(input.id);
  const actor = await requireAdminUserId();

  await db.quiz.delete({ where: { id } });

  await writeAudit({
    actorUserId: actor,
    action: "quiz.delete",
    targetType: "Quiz",
    targetId: id,
  });

  revalidatePath("/admin/quizzen");
  redirect("/admin/quizzen");
}

export async function upsertQuestion(
  input: z.infer<typeof UpsertQuestionInput>,
) {
  const { quizId, questionId, order, payload } =
    UpsertQuestionInput.parse(input);
  const actor = await requireAdminUserId();

  // Load gameType so we can validate the payload shape.
  const quiz = (await db.quiz.findUnique({
    where: { id: quizId },
    select: { gameType: true },
  })) as { gameType: GameType } | null;
  if (!quiz) throw new Error("Quiz not found");

  // This will throw a useful Zod error if the payload doesn't match — the
  // page surface should catch and present the message.
  const validated = validatePayload(quiz.gameType, payload);

  let resultId: string;
  if (questionId) {
    await db.question.update({
      where: { id: questionId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { order, payload: validated as any },
    });
    resultId = questionId;
  } else {
    const created = (await db.question.create({
      data: {
        quizId,
        order,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload: validated as any,
      },
      select: { id: true },
    })) as { id: string };
    resultId = created.id;
  }

  await writeAudit({
    actorUserId: actor,
    action: questionId ? "question.update" : "question.create",
    targetType: "Question",
    targetId: resultId,
    diff: { quizId, order },
  });

  revalidatePath(`/admin/quizzen/${quizId}`);
  return resultId;
}

export async function removeQuestion(
  input: z.infer<typeof RemoveQuestionInput>,
) {
  const { questionId } = RemoveQuestionInput.parse(input);
  const actor = await requireAdminUserId();

  const q = (await db.question.findUnique({
    where: { id: questionId },
    select: { quizId: true },
  })) as { quizId: string } | null;
  if (!q) return;

  await db.question.delete({ where: { id: questionId } });

  await writeAudit({
    actorUserId: actor,
    action: "question.delete",
    targetType: "Question",
    targetId: questionId,
    diff: { quizId: q.quizId },
  });

  revalidatePath(`/admin/quizzen/${q.quizId}`);
}
