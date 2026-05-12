import { useTranslations } from "next-intl";
import Link from "next/link";

type Status = "live" | "concept";

export type AdminQuiz = {
  id: string;
  title: string;
  subject: string;
  groep: number;
  gameType: "mc" | "type" | "match" | "drag-order" | "catapult";
  questions: number;
  status: Status;
};

const STATUS_CHIP: Record<Status, string> = {
  live:    "bg-ok-soft text-ink",
  concept: "bg-sun-soft text-ink",
};

export function QuizRow({ quiz }: { quiz: AdminQuiz }) {
  const t = useTranslations("admin.quizzen");
  const gt = useTranslations("kid.gameType");
  return (
    <tr className="border-t border-line-2">
      <td className="px-3 py-3 text-sm font-medium text-ink">{quiz.title}</td>
      <td className="px-3 py-3 text-sm text-ink-2">{quiz.subject}</td>
      <td className="px-3 py-3 text-sm font-mono text-ink-2">{quiz.groep}</td>
      <td className="px-3 py-3 text-sm text-ink-2">{gt(quiz.gameType)}</td>
      <td className="px-3 py-3 text-sm font-mono text-ink-2">{quiz.questions}</td>
      <td className="px-3 py-3">
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CHIP[quiz.status]}`}>
          {t(`status.${quiz.status}`)}
        </span>
      </td>
      <td className="px-3 py-3 text-right">
        <Link
          href={`/admin/quizzen/${quiz.id}`}
          className="rounded-lexi border border-line bg-card px-3 py-1 text-xs font-medium text-ink hover:bg-bg-2"
        >
          {t("edit")}
        </Link>
      </td>
    </tr>
  );
}
