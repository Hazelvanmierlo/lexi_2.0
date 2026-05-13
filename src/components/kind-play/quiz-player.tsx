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
import type { Reveal } from "@/lib/quiz-session";
import { nextReviewQuestionIdx } from "@/lib/review-queue";
import { McGame } from "./games/mc-game";
import { TypeGame } from "./games/type-game";
import { MatchGame } from "./games/match-game";
import { DragOrderGame } from "./games/drag-order-game";
import { CatapultGame } from "./games/catapult-game";
import { HintButton } from "./hint-button";

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
  | {
      kind: "playing";
      sessionId: string;
      index: number;
      startedAt: number;
      isReview: boolean;
    }
  | {
      kind: "feedback";
      sessionId: string;
      index: number;
      result: SubmitResult;
      lastInput?: string;
      isReview: boolean;
    }
  | { kind: "review-intro"; sessionId: string; reviewIdx: number }
  | { kind: "finishing"; sessionId: string }
  | { kind: "done"; summary: FinishResult };

// Max review questions per session — even if more than 3 fail, we cap it so
// the round stays short.
const REVIEW_CAP = 3;

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
  const [failedIdx, setFailedIdx] = useState<number[]>([]);
  const [reviewedIdx, setReviewedIdx] = useState<number[]>([]);

  const total = quiz.questions.length;

  function onStart() {
    setError(null);
    setStage({ kind: "starting" });
    setFailedIdx([]);
    setReviewedIdx([]);
    startTx(async () => {
      try {
        const s = await startSession({ quizId: quiz.id, kidId });
        setStage({
          kind: "playing",
          sessionId: s.sessionId,
          index: 0,
          startedAt: Date.now(),
          isReview: false,
        });
      } catch (e) {
        setError((e as Error).message);
        setStage({ kind: "uitleg" });
      }
    });
  }

  function onAnswer(answer: unknown) {
    if (stage.kind !== "playing") return;
    const { sessionId, index, startedAt, isReview } = stage;
    const question = quiz.questions[index];
    const msSpent = Date.now() - startedAt;
    const lastInput = typeof answer === "string" ? answer : undefined;

    setError(null);
    startTx(async () => {
      try {
        const result = await submitAnswer({
          sessionId,
          questionId: question.id,
          answer,
          msSpent,
          isReview,
        });
        if (!result.correct && !isReview) {
          setFailedIdx((prev) =>
            prev.includes(index) ? prev : [...prev, index],
          );
        }
        setStage({
          kind: "feedback",
          sessionId,
          index,
          result,
          lastInput,
          isReview,
        });
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function onNext() {
    if (stage.kind !== "feedback") return;
    const { sessionId, index, isReview } = stage;

    // After a review answer: mark reviewed, then pick next review or finish.
    if (isReview) {
      const nextReviewed = reviewedIdx.includes(index)
        ? reviewedIdx
        : [...reviewedIdx, index];
      setReviewedIdx(nextReviewed);
      // Cap reached → straight to finish.
      if (nextReviewed.length >= REVIEW_CAP) {
        return finishNow(sessionId);
      }
      const next = nextReviewQuestionIdx(failedIdx, nextReviewed);
      if (next === null) {
        return finishNow(sessionId);
      }
      setStage({ kind: "review-intro", sessionId, reviewIdx: next });
      return;
    }

    const next = index + 1;
    if (next < total) {
      setStage({
        kind: "playing",
        sessionId,
        index: next,
        startedAt: Date.now(),
        isReview: false,
      });
      return;
    }

    // First pass complete — start review round if any questions failed.
    const reviewNext = nextReviewQuestionIdx(failedIdx, reviewedIdx);
    if (reviewNext !== null && reviewedIdx.length < REVIEW_CAP) {
      setStage({ kind: "review-intro", sessionId, reviewIdx: reviewNext });
      return;
    }
    finishNow(sessionId);
  }

  function finishNow(sessionId: string) {
    setStage({ kind: "finishing", sessionId });
    startTx(async () => {
      try {
        const summary = await finishSession({ sessionId });
        setStage({ kind: "done", summary });
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function startReviewQuestion() {
    if (stage.kind !== "review-intro") return;
    setStage({
      kind: "playing",
      sessionId: stage.sessionId,
      index: stage.reviewIdx,
      startedAt: Date.now(),
      isReview: true,
    });
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

  if (stage.kind === "review-intro") {
    return (
      <article
        key={`review-intro-${stage.reviewIdx}`}
        className="question-enter mt-8 rounded-lexi-lg border border-line bg-card p-8 text-center shadow-lexi md:p-10"
      >
        <p className="font-mono text-xs uppercase tracking-wider text-ink-3">
          Even oefenen
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
          Nog een keer vraag {stage.reviewIdx + 1}
        </h2>
        <p className="mt-3 text-ink-2">
          Deze ging net niet helemaal goed — geen druk, geen munten op het spel.
        </p>
        <button
          type="button"
          onClick={startReviewQuestion}
          autoFocus
          className="mt-6 inline-flex items-center rounded-lexi bg-primary px-6 py-3 text-base font-semibold text-white shadow-lexi-sm hover:opacity-90"
        >
          Oké, ik probeer het →
        </button>
      </article>
    );
  }

  if (stage.kind === "playing") {
    const question = quiz.questions[stage.index];
    return (
      <article
        key={`q-${stage.index}-${stage.isReview ? "rv" : "fp"}`}
        className="question-enter mt-8 rounded-lexi-lg border border-line bg-card p-6 shadow-lexi md:p-8"
      >
        <ProgressBar
          current={stage.index + 1}
          total={total}
          isReview={stage.isReview}
        />
        <div className="mb-3 flex justify-end">
          <HintButton
            sessionId={stage.sessionId}
            questionId={question.id}
          />
        </div>
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
        key={`q-${stage.index}-${stage.isReview ? "rv" : "fp"}-fb`}
        className="mt-8 rounded-lexi-lg border border-line bg-card p-6 shadow-lexi md:p-8"
      >
        <ProgressBar
          current={stage.index + 1}
          total={total}
          isReview={stage.isReview}
        />
        <GameSwitch
          gameType={quiz.gameTypeDb}
          payload={question.payload}
          onAnswer={() => {}}
          locked
          reveal={stage.result.reveal}
          lastInput={stage.lastInput}
        />
        <FeedbackBar
          result={stage.result}
          onNext={onNext}
          isReview={stage.isReview}
        />
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

function ProgressBar({
  current,
  total,
  isReview,
}: {
  current: number;
  total: number;
  isReview: boolean;
}) {
  const pct = (current / total) * 100;
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between font-mono text-xs text-ink-3">
        <span>
          {isReview ? "oefenronde" : `vraag ${current} / ${total}`}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line-2">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${
            isReview ? "bg-plum" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FeedbackBar({
  result,
  onNext,
  isReview,
}: {
  result: SubmitResult;
  onNext: () => void;
  isReview: boolean;
}) {
  return (
    <div
      className={`relative mt-5 flex items-center justify-between gap-3 rounded-lexi border px-4 py-3 ${
        result.correct
          ? "border-ok bg-ok-soft text-ink"
          : "border-primary bg-primary-soft text-primary-ink"
      }`}
    >
      {result.correct && !isReview && <Confetti />}
      <span className="relative flex items-center gap-2 text-sm font-semibold">
        {result.correct ? (
          <>
            <Check className="h-4 w-4 text-ok" />
            {isReview
              ? "Nu goed!"
              : `Goed! +${result.coinsAwarded} munten`}
            {!isReview && result.coinsAwarded > 0 && <CoinPop />}
          </>
        ) : (
          <>
            <X className="h-4 w-4 text-primary" />
            {isReview ? "Bijna! Kijk de juiste hierboven." : "Probeer de volgende"}
          </>
        )}
      </span>
      <button
        type="button"
        onClick={onNext}
        autoFocus
        className="rounded-lexi bg-ink px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Volgende →
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
  reveal,
  lastInput,
}: {
  gameType: GameType;
  payload: AnyPayload;
  onAnswer: (answer: unknown) => void;
  locked: boolean;
  reveal?: Reveal;
  lastInput?: string;
}) {
  switch (gameType) {
    case "MC":
      return (
        <McGame
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          payload={payload as any}
          onAnswer={onAnswer}
          locked={locked}
          reveal={
            reveal?.kind === "MC"
              ? { correctIdx: reveal.correctIdx, chosenIdx: reveal.chosenIdx }
              : undefined
          }
        />
      );
    case "CATAPULT":
      return (
        <CatapultGame
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          payload={payload as any}
          onAnswer={onAnswer}
          locked={locked}
          reveal={
            reveal?.kind === "CATAPULT"
              ? { correctIdx: reveal.correctIdx, chosenIdx: reveal.chosenIdx }
              : undefined
          }
        />
      );
    case "TYPE":
      return (
        <TypeGame
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          payload={payload as any}
          onAnswer={onAnswer}
          locked={locked}
          reveal={
            reveal?.kind === "TYPE"
              ? { correctText: reveal.correctText }
              : undefined
          }
          lastInput={lastInput}
        />
      );
    case "MATCH":
      return (
        <MatchGame
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          payload={payload as any}
          onAnswer={onAnswer}
          locked={locked}
          reveal={
            reveal?.kind === "MATCH"
              ? { correctPairs: reveal.correctPairs }
              : undefined
          }
        />
      );
    case "DRAG_ORDER":
      return (
        <DragOrderGame
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          payload={payload as any}
          onAnswer={onAnswer}
          locked={locked}
          reveal={
            reveal?.kind === "DRAG_ORDER"
              ? { correctOrder: reveal.correctOrder }
              : undefined
          }
        />
      );
  }
}
