import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { QuizEditor } from "@/components/admin/quiz-editor";
import type { DbQuiz } from "@/lib/db-types";
import type { GameType } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type DbQuestion = {
  id: string;
  order: number;
  payload: unknown;
};

type QuizWithQuestions = DbQuiz & { questions: DbQuestion[] };

export default async function QuizEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const quiz = (await db.quiz.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  })) as QuizWithQuestions | null;

  if (!quiz) notFound();

  return (
    <>
      <AdminHeader />
      <main id="main-content" className="mx-auto max-w-[980px] px-5 py-10">
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">
          <Link href="/admin/quizzen" className="hover:text-ink">
            Admin · Content
          </Link>{" "}
          / {quiz.title}
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
          {quiz.title}
        </h1>

        <QuizEditor
          quiz={{
            id: quiz.id,
            title: quiz.title,
            subject: quiz.subject,
            groep: quiz.groep,
            region: quiz.region,
            gameType: quiz.gameType as GameType,
            customExplain: quiz.customExplain,
            status: quiz.status,
          }}
          questions={quiz.questions.map((q) => ({
            id: q.id,
            order: q.order,
            payload: q.payload,
          }))}
        />
      </main>
    </>
  );
}
