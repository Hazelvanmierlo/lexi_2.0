import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { KidHeader } from "@/components/kid/kid-header";
import { QuizPlayer } from "@/components/kind-play/quiz-player";
import { validatePayload } from "@/lib/quiz-schemas";
import { gameTypeToUi, subjectToUi } from "@/lib/mappings";
import type { DbKid, DbQuiz } from "@/lib/db-types";
import type { GameType } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

// Demo kid identity until Clerk auth lands.
const DEMO_KID_ID = "seed-kid-sara";

type DbQuestion = {
  id: string;
  order: number;
  payload: unknown;
};

type QuizWithQuestions = DbQuiz & { questions: DbQuestion[] };

export default async function QuizPlayPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;

  const [quiz, kid] = (await Promise.all([
    db.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { order: "asc" } } },
    }),
    db.kid.findUnique({ where: { id: DEMO_KID_ID } }),
  ])) as [QuizWithQuestions | null, DbKid | null];

  if (!quiz) notFound();
  if (!kid) {
    throw new Error(
      `Demo kid "${DEMO_KID_ID}" not found. Run "npm run db:seed" first.`,
    );
  }
  if (quiz.status !== "LIVE") {
    // Allow admins to preview drafts via ?preview=1 — wire when auth ships.
    notFound();
  }

  // Validate every payload up front so the player never has to handle bad
  // server data at runtime. Bad payloads are a content-team / DB integrity
  // bug we want to surface early.
  const questions = quiz.questions.map((q) => ({
    id: q.id,
    order: q.order,
    payload: validatePayload(quiz.gameType, q.payload),
  }));

  return (
    <>
      <KidHeader coins={kid.coins} />
      <main
        id="main-content"
        className="bg-gradient-to-b from-[oklch(95%_0.05_220)] via-bg to-bg min-h-[calc(100vh-72px)]"
      >
        <div className="mx-auto max-w-[860px] px-5 pt-6 pb-20">
          <Link
            href="/kind"
            className="inline-flex items-center gap-1 rounded-lexi border border-line bg-card px-3 py-1.5 text-sm text-ink-2 hover:text-ink"
          >
            ← Terug
          </Link>

          <QuizPlayer
            quiz={{
              id: quiz.id,
              title: quiz.title,
              subject: subjectToUi(quiz.subject),
              gameType: gameTypeToUi(quiz.gameType),
              gameTypeDb: quiz.gameType as GameType,
              customExplain: quiz.customExplain,
              questions,
            }}
            kidId={kid.id}
          />
        </div>
      </main>
    </>
  );
}
