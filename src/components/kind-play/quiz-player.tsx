"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MascotImage } from "@/components/ui/mascot";
import { Check, X, RotateCcw } from "lucide-react";
import {
  startSession,
  submitAnswer,
  finishSession,
  type SubmitResult,
  type FinishResult,
} from "@/app/kind/spelen/actions";
import type { GameType } from "@/generated/prisma/enums";
import type { GameTypeUi, SubjectUi } from "@/lib/mappings";
import type { AnyPayload } from "@/lib/quiz-schemas";
import { McGame } from "./games/mc-game";
import { TypeGame } from "./games/type-game";
import { MatchGame } from "./games/match-game";
import { DragOrderGame } from "./games/drag-order-game";
import { CatapultGame } from "./games/catapult-game";

type QuizQuestion = {
  id: string;
  order: number;
  payload: AnyPayload;
};

export type QuizPlayerInput = {
  id: string;
  title: string;
  subject: SubjectUi;
  gameType: GameTypeUi;
  gameTypeDb: GameType;
  customExplain: string;
  questions: QuizQuestion[];
};

type Stage =
  | { kind: "uitleg" }
  | { kind: "starting" }
  | { kind: "playing"; sessionId: string; index: number; startedAt: number }
  | {
      kind: "feedback";
      sessionId: string;
      index: number;
      result: SubmitResult;
    }
  | { kind: "finishing"; sessionId: string }
  | { kind: "done"; summary: FinishResult };

export function QuizPlayer({
  quiz,
  kidId,
}: {
  quiz: QuizPlayerInput;
  kidId: string;
}) {
  const [stage, setStage] = useState<Stage>({ kind: "uitleg" });
  const [, startTx] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const total = quiz.questions.length;

  function onStart() {
    setError(null);
    setStage({ kind: "starting" });
    startTx(async () => {
      try {
        const s = await startSession({ quizId: quiz.id, kidId });
        setStage({
          kind: "playing",
          sessionId: s.sessionId,
          index: 0,
          startedAt: Date.now(),
        });
      } catch (e) {
        setError((e as Error).message);
        setStage({ kind: "uitleg" });
      }
    });
  }

  function onAnswer(answer: unknown) {
    if (stage.kind !== "playing") return;
    const { sessionId, index, startedAt } = stage;
    const question = quiz.questions[index];
    const msSpent = Date.now() - startedAt;

    setError(null);
    startTx(async () => {
      try {
        const result = await submitAnswer({
          sessionId,
          questionId: question.id,
          answer,
          msSpent,
        });
        setStage({ kind: "feedback", sessionId, index, result });
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function onNext() {
    if (stage.kind !== "feedback") return;
    const next = stage.index + 1;
    if (next >= total) {
      setStage({ kind: "finishing", sessionId: stage.sessionId });
      startTx(async () => {
        try {
          const summary = await finishSession({ sessionId: stage.sessionId });
          setStage({ kind: "done", summary });
        } catch (e) {
          setError((e as Error).message);
          setStage({
            kind: "feedback",
            sessionId: stage.sessionId,
            index: stage.index,
            result: stage.result,
          });
        }
      });
    } else {
      setStage({
        kind: "playing",
        sessionId: stage.sessionId,
        index: next,
        startedAt: Date.now(),
      });
    }
  }

  // ─── render ────────────────────────────────────────────────────────────

  if (stage.kind === "uitleg" || stage.kind === "starting") {
    return (
      <article className="mt-8 rounded-lexi-lg border border-line bg-card p-8 shadow-lexi md:p-10">
        <div className="flex items-center gap-4">
          <MascotImage
            style="bot"
            age="hero"
            size={72}
            decorative
            motion="float"
            className="h-[72px] w-[72px]"
          />
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-3">
              {quiz.subject} · {total} vragen
            </p>
            <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
              {quiz.title}
            </h1>
          </div>
        </div>
        {quiz.customExplain && (
          <p className="mt-5 max-w-prose text-ink-2">{quiz.customExplain}</p>
        )}
        {error && (
          <p className="mt-4 rounded-lexi bg-primary-soft px-3 py-2 text-sm text-primary-ink">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={onStart}
          disabled={stage.kind === "starting"}
          className="mt-6 inline-flex items-center rounded-lexi bg-primary px-6 py-3 text-base font-semibold text-white shadow-lexi-sm hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {stage.kind === "starting" ? "Even geduld…" : "Start →"}
        </button>
      </article>
    );
  }

  if (stage.kind === "playing") {
    const question = quiz.questions[stage.index];
    return (
      <article
        key={`q-${stage.index}`}
        className="question-enter mt-8 rounded-lexi-lg border border-line bg-card p-6 shadow-lexi md:p-8"
      >
        <ProgressBar current={stage.index + 1} total={total} />
        <GameSwitch
          gameType={quiz.gameTypeDb}
          payload={question.payload}
          onAnswer={onAnswer}
          locked={false}
        />
        {error && (
          <p className="mt-4 rounded-lexi bg-primary-soft px-3 py-2 text-sm text-primary-ink">
            {error}
          </p>
        )}
      </article>
    );
  }

  if (stage.kind === "feedback") {
    const question = quiz.questions[stage.index];
    return (
      <article
        key={`q-${stage.index}-fb`}
        className="mt-8 rounded-lexi-lg border border-line bg-card p-6 shadow-lexi md:p-8"
      >
        <ProgressBar current={stage.index + 1} total={total} />
        <GameSwitch
          gameType={quiz.gameTypeDb}
          payload={question.payload}
          onAnswer={() => {}}
          locked
        />
        <FeedbackBar result={stage.result} onNext={onNext} isLast={stage.index + 1 >= total} />
      </article>
    );
  }

  if (stage.kind === "finishing") {
    return (
      <article className="mt-8 rounded-lexi-lg border border-line bg-card p-8 text-center shadow-lexi">
        <p className="text-ink-2">We tellen de munten…</p>
      </article>
    );
  }

  // done
  return (
    <article className="mt-8 rounded-lexi-lg border border-primary bg-primary-soft p-8 text-center shadow-lexi md:p-12">
      <MascotImage
        style="bot"
        age="hero"
        size={120}
        decorative
        motion="float"
        className="mx-auto h-[120px] w-[120px]"
      />
      <p className="mt-4 font-mono text-xs uppercase tracking-wider text-ink-3">
        +{stage.summary.totalCoins} munten
      </p>
      <h2 className="mt-1 font-display text-3xl font-bold text-ink">
        {stage.summary.correctCount === stage.summary.total
          ? "Helemaal goed!"
          : stage.summary.correctCount >= Math.ceil(stage.summary.total * 0.8)
            ? "Goed bezig!"
            : "Bijna!"}
      </h2>
      <p className="mt-2 text-ink-2">
        {stage.summary.correctCount} van {stage.summary.total} goed
        {stage.summary.completionBonus > 0
          ? ` · bonus +${stage.summary.completionBonus}`
          : null}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/kind"
          className="inline-flex items-center rounded-lexi bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Terug naar home
        </Link>
        <button
          type="button"
          onClick={() => setStage({ kind: "uitleg" })}
          className="inline-flex items-center gap-1.5 rounded-lexi border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink hover:bg-bg-2"
        >
          <RotateCcw className="h-4 w-4" />
          Nog een keer
        </button>
      </div>
    </article>
  );
}

// ─── sub-components ────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between font-mono text-xs text-ink-3">
        <span>
          vraag {current} / {total}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line-2">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FeedbackBar({
  result,
  onNext,
  isLast,
}: {
  result: SubmitResult;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <div
      className={`relative mt-5 flex items-center justify-between gap-3 rounded-lexi border px-4 py-3 ${
        result.correct
          ? "border-ok bg-ok-soft text-ink"
          : "border-primary bg-primary-soft text-primary-ink"
      }`}
    >
      {result.correct && <Confetti />}
      <span className="relative flex items-center gap-2 text-sm font-semibold">
        {result.correct ? (
          <>
            <Check className="h-4 w-4 text-ok" />
            Goed! +{result.coinsAwarded} munten
            <CoinPop />
          </>
        ) : (
          <>
            <X className="h-4 w-4 text-primary" />
            Probeer de volgende
          </>
        )}
      </span>
      <button
        type="button"
        onClick={onNext}
        autoFocus
        className="rounded-lexi bg-ink px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        {isLast ? "Klaar →" : "Volgende →"}
      </button>
    </div>
  );
}

function CoinPop() {
  return (
    <span
      aria-hidden="true"
      className="coin-pop pointer-events-none absolute -top-2 left-6 inline-flex h-4 w-4 items-center justify-center rounded-full bg-sun text-[10px] font-bold text-ink shadow-lexi-sm"
    >
      m
    </span>
  );
}

function Confetti() {
  const bits = [
    { color: "bg-primary", dx: "-22px", dy: "-30px", delay: "0ms" },
    { color: "bg-sun", dx: "0px", dy: "-40px", delay: "60ms" },
    { color: "bg-ok", dx: "20px", dy: "-28px", delay: "30ms" },
    { color: "bg-plum", dx: "-12px", dy: "-44px", delay: "120ms" },
    { color: "bg-teal", dx: "16px", dy: "-46px", delay: "90ms" },
  ];
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-3 top-2"
    >
      {bits.map((b, i) => (
        <span
          key={i}
          className={`confetti-bit absolute h-1.5 w-1.5 rounded-full ${b.color}`}
          style={
            {
              ["--dx" as string]: b.dx,
              ["--dy" as string]: b.dy,
              animationDelay: b.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

function GameSwitch({
  gameType,
  payload,
  onAnswer,
  locked,
}: {
  gameType: GameType;
  payload: AnyPayload;
  onAnswer: (answer: unknown) => void;
  locked: boolean;
}) {
  switch (gameType) {
    case "MC":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <McGame payload={payload as any} onAnswer={onAnswer} locked={locked} />;
    case "CATAPULT":
      return (
        <CatapultGame
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          payload={payload as any}
          onAnswer={onAnswer}
          locked={locked}
        />
      );
    case "TYPE":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <TypeGame payload={payload as any} onAnswer={onAnswer} locked={locked} />;
    case "MATCH":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <MatchGame payload={payload as any} onAnswer={onAnswer} locked={locked} />;
    case "DRAG_ORDER":
      return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <DragOrderGame payload={payload as any} onAnswer={onAnswer} locked={locked} />
      );
  }
}
