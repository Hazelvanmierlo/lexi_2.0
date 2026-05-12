"use client";

import type { McPayload } from "@/lib/quiz-schemas";

export function McGame({
  payload,
  onAnswer,
  locked,
}: {
  payload: McPayload;
  onAnswer: (answer: number) => void;
  locked: boolean;
}) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold tracking-tight text-ink md:text-2xl">
        {payload.q}
      </h2>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={payload.q}>
        {payload.options.map((opt, i) => (
          <li key={`${i}-${opt}`}>
            <button
              type="button"
              role="radio"
              aria-checked={false}
              disabled={locked}
              onClick={() => onAnswer(i)}
              className="flex w-full items-center justify-between rounded-lexi border-2 border-line bg-card px-4 py-3 text-left text-base font-medium text-ink transition-colors hover:border-ink hover:bg-bg-2 disabled:opacity-60"
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
