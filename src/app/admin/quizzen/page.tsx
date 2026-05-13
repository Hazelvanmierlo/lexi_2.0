import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { QuizTable } from "@/components/admin/quiz-table";
import type { AdminQuiz } from "@/components/admin/quiz-row";
import { gameTypeToUi, subjectLabel } from "@/lib/mappings";
import type { DbQuizWithCount } from "@/lib/db-types";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminQuizzenPage() {
  if (process.env.NEXT_PUBLIC_AUTH_ENABLED === "true") {
    await requireAdmin();
  }
  const rows = (await db.quiz.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: { _count: { select: { questions: true } } },
  })) as DbQuizWithCount[];

  const quizzes: AdminQuiz[] = rows.map((q) => ({
    id: q.id,
    title: q.title,
    subject: subjectLabel(q.subject),
    groep: q.groep,
    gameType: gameTypeToUi(q.gameType),
    questions: q._count.questions,
    status: q.status === "LIVE" ? "live" : "concept",
  }));

  return (
    <>
      <AdminHeader />
      <main id="main-content" className="mx-auto max-w-[1200px] px-5 py-10">
        <QuizTable quizzes={quizzes} />
      </main>
    </>
  );
}
