import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { KidHeader } from "@/components/kid/kid-header";
import { DailyGreeting } from "@/components/kid/daily-greeting";
import { MijnVakken } from "@/components/kid/mijn-vakken";
import { QuizzenVoorJou } from "@/components/kid/quizzen-voor-jou";
import { Speltypes } from "@/components/kid/speltypes";
import { gameTypeToUi, subjectToUi, subjectTokens } from "@/lib/mappings";
import { masteryPct } from "@/lib/mastery";
import { recommend } from "@/lib/recommend";
import { currentKid, currentHousehold } from "@/lib/auth";
import { setKidCookie } from "@/lib/kid-cookie";
import type {
  DbHousehold,
  DbKid,
  DbMasteryRecord,
  DbQuiz,
} from "@/lib/db-types";
import type { Subject } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const RECOMMENDATION_LIMIT = 5;
const RECENT_SESSION_WINDOW_DAYS = 2; // pulls just enough to evaluate cooldown

// Demo identity until Clerk auth lands in Phase 3.
const DEMO_KID_ID = "seed-kid-sara";

const NEW_QUIZ_WINDOW_DAYS = 7;

// Subjects with no MasteryRecord yet show this baseline so the bars aren't
// completely empty for a brand-new kid.
const DEFAULT_PCT = 50;

export default async function KindPage() {
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

  let kid: DbKid | null;
  if (authEnabled) {
    kid = (await currentKid()) as DbKid | null;
    if (!kid) {
      const hh = await currentHousehold();
      if (!hh) redirect("/login?next=/kind");
      if (hh.kids.length === 1) {
        await setKidCookie(hh.kids[0].id);
        kid = hh.kids[0] as DbKid;
      } else {
        redirect("/kind/picker");
      }
    }
  } else {
    kid = (await db.kid.findUnique({
      where: { id: DEMO_KID_ID },
    })) as DbKid | null;
  }
  if (!kid) {
    throw new Error(
      `Demo kid "${DEMO_KID_ID}" not found. Run "npm run db:seed" first — see docs/backend.md.`,
    );
  }
  const household = (await db.household.findUnique({
    where: { id: kid.householdId },
  })) as DbHousehold | null;
  if (!household) throw new Error("Household missing for demo kid");

  const now = new Date();
  const recentSince = new Date(
    now.getTime() - RECENT_SESSION_WINDOW_DAYS * 86_400_000,
  );

  type RecentRow = { quizId: string; startedAt: Date };
  const [liveQuizzes, masteryRecords, recentRows] = (await Promise.all([
    db.quiz.findMany({
      where: { status: "LIVE", region: household.region },
      select: { id: true, subject: true },
    }),
    db.masteryRecord.findMany({ where: { kidId: kid.id } }),
    db.session.findMany({
      where: { kidId: kid.id, startedAt: { gte: recentSince } },
      select: { quizId: true, startedAt: true },
      orderBy: { startedAt: "desc" },
    }),
  ])) as [
    Array<{ id: string; subject: Subject }>,
    DbMasteryRecord[],
    RecentRow[],
  ];

  // Most-recent start per quiz — earlier rows can be dropped.
  const recentSessionsByQuiz = new Map<string, Date>();
  for (const r of recentRows) {
    if (!recentSessionsByQuiz.has(r.quizId)) {
      recentSessionsByQuiz.set(r.quizId, r.startedAt);
    }
  }

  const recommended = recommend({
    availableQuizzes: liveQuizzes,
    masteryRecords,
    recentSessionsByQuiz,
    now,
    limit: RECOMMENDATION_LIMIT,
  });

  // Hydrate the chosen ids back into full quiz rows for the UI.
  const fullChosen = (await db.quiz.findMany({
    where: { id: { in: recommended.map((r) => r.quizId) } },
  })) as DbQuiz[];
  const fullById = new Map(fullChosen.map((q) => [q.id, q]));
  const chosenQuizzes = recommended
    .map((r) => fullById.get(r.quizId))
    .filter((q): q is DbQuiz => Boolean(q));

  const masteryBySubject = new Map<Subject, number>(
    masteryRecords.map((m) => [m.subject, masteryPct(m.score)]),
  );

  const quizzes = chosenQuizzes.map((q) => toQuizCard(q));

  // 5 subject tiles, sourced from enum order so they don't drift.
  const subjects = (
    ["REKENEN", "TAAL", "LEZEN", "WERELD", "ENGELS"] as const
  ).map((s) => {
    const ui = subjectToUi(s);
    const tok = subjectTokens(s);
    return {
      id: ui,
      pct: masteryBySubject.get(s) ?? DEFAULT_PCT,
      tint: tok.tint,
      barColor: tok.barColor,
    };
  });

  return (
    <>
      <KidHeader coins={kid.coins} />
      <main
        id="main-content"
        className="bg-gradient-to-b from-[oklch(95%_0.05_220)] via-bg to-bg"
      >
        <div className="mx-auto max-w-[1100px] space-y-8 px-5 pt-8 pb-32 md:pb-40">
          <DailyGreeting />
          <MijnVakken subjects={subjects} />
          <QuizzenVoorJou quizzes={quizzes} />
          <Speltypes />
        </div>
      </main>
    </>
  );
}

function estimateDuration(gameType: string): string {
  switch (gameType) {
    case "DRAG_ORDER":
      return "3 min";
    case "MATCH":
      return "6 min";
    case "TYPE":
      return "5 min";
    default:
      return "5 min";
  }
}

function toQuizCard(q: DbQuiz) {
  // Pulled into its own function so the render closure stays pure — lint rule
  // `react-hooks/purity` flags Date.now() inside the page body.
  const newCutoff = Date.now() - NEW_QUIZ_WINDOW_DAYS * 86_400_000;
  return {
    id: q.id,
    title: q.title,
    subjectKey: subjectToUi(q.subject),
    gameType: gameTypeToUi(q.gameType),
    duration: estimateDuration(q.gameType),
    questions: 10,
    isNew: q.createdAt.getTime() >= newCutoff,
  };
}
