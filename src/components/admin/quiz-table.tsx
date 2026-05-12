import { useTranslations } from "next-intl";
import Link from "next/link";
import { QuizRow, type AdminQuiz } from "./quiz-row";

type Props = { quizzes: AdminQuiz[] };

export function QuizTable({ quizzes }: Props) {
  const t = useTranslations("admin.quizzen");
  const col = useTranslations("admin.quizzen.columns");
  const breadcrumb = useTranslations("admin")("breadcrumb");
  return (
    <section>
      <p className="font-mono text-xs uppercase tracking-wider text-ink-2">{breadcrumb}</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">{t("title")}</h1>
        <div className="flex items-center gap-3">
          <Link href="/kind" className="text-sm text-ink-2 hover:text-ink">
            {t("viewAsKid")}
          </Link>
          <Link
            href="/admin/quizzen/nieuw"
            className="inline-flex items-center rounded-lexi bg-primary px-4 py-2 text-sm font-medium text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t("newQuiz")}
          </Link>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto rounded-lexi-lg border border-line bg-card">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-ink-2">
              <th className="px-3 py-3 font-medium">{col("title")}</th>
              <th className="px-3 py-3 font-medium">{col("subject")}</th>
              <th className="px-3 py-3 font-medium">{col("groep")}</th>
              <th className="px-3 py-3 font-medium">{col("gameType")}</th>
              <th className="px-3 py-3 font-medium">{col("questions")}</th>
              <th className="px-3 py-3 font-medium">{col("status")}</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q) => <QuizRow key={q.id} quiz={q} />)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
