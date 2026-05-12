import { useTranslations } from "next-intl";
import { QuizCard } from "./quiz-card";

type Quiz = {
  id: string;
  title: string;
  subjectKey: "rekenen" | "taal" | "lezen" | "engels" | "wereld";
  gameType: "mc" | "type" | "match" | "drag-order" | "catapult";
  duration: string;
  questions: number;
  isNew?: boolean;
};

type Props = { quizzes: Quiz[] };

export function QuizzenVoorJou({ quizzes }: Props) {
  const t = useTranslations("kid.quizzen");
  const s = useTranslations("kid.subjects");
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-base font-bold uppercase tracking-wider text-ink-2">
          {t("title")}
        </h2>
        <span className="font-mono text-xs text-ink-3">{t("subtitle")}</span>
      </div>
      <ul className="mt-3 grid gap-4 md:grid-cols-2">
        {quizzes.map((q) => (
          <li key={q.id}>
            <QuizCard
              id={q.id}
              title={q.title}
              subjectKey={q.subjectKey}
              subjectLabel={s(q.subjectKey)}
              gameType={q.gameType}
              duration={q.duration}
              questions={q.questions}
              isNew={q.isNew}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
