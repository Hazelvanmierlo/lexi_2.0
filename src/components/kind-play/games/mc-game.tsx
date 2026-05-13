"use client";

import { Check, X } from "lucide-react";
import type { McPayload } from "@/lib/quiz-schemas";

export type McReveal = { correctIdx: number; chosenIdx: number | null };

export function McGame({
  payload,
  onAnswer,
  locked,
  reveal,
}: {
  payload: McPayload;
  onAnswer: (answer: number) => void;
  locked: boolean;
  reveal?: McReveal;
}) {
  function classFor(i: number): string {
    if (!locked || !reveal) {
      return "border-line bg-card text-ink hover:border-ink hover:bg-bg-2";
    }
    if (i === reveal.correctIdx) {
      return "border-ok bg-ok-soft text-ink";
    }
    if (i === reveal.chosenIdx) {
      return "border-primary bg-primary-soft text-primary-ink";
    }
    return "border-line bg-card text-ink opacity-60";
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold tracking-tight text-ink md:text-2xl">
        {payload.q}
      </h2>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={payload.q}>
        {payload.options.map((opt, i) => {
          const showCorrect = locked && reveal && i === reveal.correctIdx;
          const showWrong =
            locked &&
            reveal &&
            reveal.chosenIdx === i &&
            reveal.chosenIdx !== reveal.correctIdx;
          return (
            <li key={`${i}-${opt}`}>
              <button
                type="button"
                role="radio"
                aria-checked={false}
                disabled={locked}
                onClick={() => onAnswer(i)}
                className={`flex w-full items-center justify-between rounded-lexi border-2 px-4 py-3 text-left text-base font-medium transition-colors disabled:cursor-default ${classFor(i)}`}
              >
                <span>{opt}</span>
                {showCorrect && <Check className="h-5 w-5 text-ok" aria-hidden="true" />}
                {showWrong && <X className="h-5 w-5 text-primary" aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
