"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Check, X } from "lucide-react";
import type { DragOrderPayload } from "@/lib/quiz-schemas";

export type DragOrderReveal = { correctOrder: string[] };

// Tap-to-reorder with up/down arrows on each row. Keyboard-friendly out of
// the box (every arrow is a real button). True drag-and-drop is a polish
// item — not needed to grade the answer.
export function DragOrderGame({
  payload,
  onAnswer,
  locked,
  reveal,
}: {
  payload: DragOrderPayload;
  onAnswer: (answer: string[]) => void;
  locked: boolean;
  reveal?: DragOrderReveal;
}) {
  const [order, setOrder] = useState<string[]>(payload.items);

  function swap(i: number, j: number) {
    if (locked) return;
    if (j < 0 || j >= order.length) return;
    setOrder((prev) => {
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold tracking-tight text-ink md:text-2xl">
        {payload.q}
      </h2>
      <ol className="mt-5 space-y-2">
        {order.map((item, i) => {
          const isCorrectPos =
            locked && reveal ? reveal.correctOrder[i] === item : false;
          const isWrongPos = locked && reveal && !isCorrectPos;
          const correctIdx =
            locked && reveal ? reveal.correctOrder.indexOf(item) : -1;
          return (
            <li
              key={item}
              className={`flex items-center justify-between rounded-lexi border px-4 py-3 transition-colors ${
                isCorrectPos
                  ? "border-ok bg-ok-soft"
                  : isWrongPos
                    ? "border-primary bg-primary-soft"
                    : "border-line bg-card"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-xs text-ink-3">{i + 1}.</span>
                <span className="font-display text-base font-medium text-ink">
                  {item}
                </span>
                {isCorrectPos && (
                  <Check className="h-4 w-4 text-ok" aria-hidden="true" />
                )}
                {isWrongPos && correctIdx >= 0 && (
                  <span className="flex items-center gap-1 text-xs font-mono text-primary-ink">
                    <X className="h-4 w-4 text-primary" aria-hidden="true" />
                    hoort op #{correctIdx + 1}
                  </span>
                )}
              </span>
              {!locked && (
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Schuif "${item}" omhoog`}
                    disabled={locked || i === 0}
                    onClick={() => swap(i, i - 1)}
                    className="rounded-lexi border border-line bg-card p-1.5 text-ink hover:bg-bg-2 disabled:opacity-40"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Schuif "${item}" omlaag`}
                    disabled={locked || i === order.length - 1}
                    onClick={() => swap(i, i + 1)}
                    className="rounded-lexi border border-line bg-card p-1.5 text-ink hover:bg-bg-2 disabled:opacity-40"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {!locked && (
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            disabled={locked}
            onClick={() => onAnswer(order)}
            className="rounded-lexi bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            Check
          </button>
        </div>
      )}
    </div>
  );
}
