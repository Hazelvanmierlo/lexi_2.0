import { useTranslations } from "next-intl";
import Link from "next/link";
import { Clock, FileText } from "lucide-react";
import { McPreview } from "./previews/mc-preview";
import { TypePreview } from "./previews/type-preview";
import { MatchPreview } from "./previews/match-preview";
import { DragOrderPreview } from "./previews/drag-order-preview";

type GameType = "mc" | "type" | "match" | "drag-order";

type Props = {
  id: string;
  title: string;
  subjectKey: "rekenen" | "taal" | "lezen" | "engels" | "wereld";
  subjectLabel: string;
  gameType: GameType;
  duration: string;
  questions: number;
  isNew?: boolean;
};

const PREVIEW: Record<GameType, () => React.JSX.Element> = {
  "mc": McPreview,
  "type": TypePreview,
  "match": MatchPreview,
  "drag-order": DragOrderPreview,
};

const SUBJECT_CHIP: Record<Props["subjectKey"], string> = {
  rekenen: "bg-teal-soft text-ink",
  taal:    "bg-primary-soft text-primary-ink",
  lezen:   "bg-sun-soft text-ink",
  engels:  "bg-ok-soft text-ink",
  wereld:  "bg-plum-soft text-ink",
};

export function QuizCard({ id, title, subjectKey, subjectLabel, gameType, duration, questions, isNew }: Props) {
  const t = useTranslations("kid.quizCard");
  const gt = useTranslations("kid.gameType");
  const Preview = PREVIEW[gameType];
  return (
    <article className="grid items-stretch gap-4 rounded-lexi-lg border border-line bg-card p-5 shadow-lexi-sm sm:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full px-2 py-0.5 font-medium ${SUBJECT_CHIP[subjectKey]}`}>{subjectLabel}</span>
          <span className="rounded-full bg-bg-2 px-2 py-0.5 font-medium text-ink-2">{gt(gameType)}</span>
          {isNew && (
            <span className="rounded-full bg-sun px-2 py-0.5 font-bold uppercase tracking-wider text-ink">
              {t("newBadge")}
            </span>
          )}
        </div>
        <h3 className="mt-3 font-display text-lg font-bold text-ink md:text-xl">{title}</h3>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{duration}</span>
          <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{questions} {t("questionsLabel")}</span>
        </div>
        <Link
          href={`/kind/spelen/${id}`}
          className="mt-auto inline-flex w-fit items-center rounded-lexi bg-primary px-4 py-2 text-sm font-medium text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t("start")}
        </Link>
      </div>
      <div className="rounded-lexi border border-line-2 bg-bg-2 p-3">
        <Preview />
      </div>
    </article>
  );
}
