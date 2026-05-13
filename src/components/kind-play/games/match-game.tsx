"use client";

import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import type { MatchPayload } from "@/lib/quiz-schemas";

export type MatchReveal = { correctPairs: Array<{ l: string; r: string }> };

// Tap-to-pair: tap a left item, then tap a right item to pair them. If the
// pair is correct it locks (green); if wrong it briefly flashes red then
// releases BOTH items so the kid can try again — no penalty either way.
// When all 5 pairs are made, the kid presses "Klaar?" to submit.
//
// Tap an already-paired left item to break the pair.
export function MatchGame({
  payload,
  onAnswer,
  locked,
  reveal,
}: {
  payload: MatchPayload;
  onAnswer: (answer: Array<{ l: string; r: string }>) => void;
  locked: boolean;
  reveal?: MatchReveal;
}) {
  const [leftPicked, setLeftPicked] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Array<{ l: string; r: string }>>([]);
  const [lastWrong, setLastWrong] = useState<{ l: string; r: string } | null>(
    null,
  );

  // Build a stable shuffled right-side order per question.
  const [rightOrder] = useState(() => {
    const r = payload.pairs.map((p) => p.r);
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  });

  const usedL = new Set(pairs.map((p) => p.l));
  const usedR = new Set(pairs.map((p) => p.r));
  const allDone = pairs.length === payload.pairs.length;

  function pickLeft(l: string) {
    if (locked) return;
    if (usedL.has(l)) {
      // Tap a paired left to unpair it.
      setPairs((prev) => prev.filter((p) => p.l !== l));
      setLeftPicked(null);
      return;
    }
    setLeftPicked((cur) => (cur === l ? null : l));
  }

  function pickRight(r: string) {
    if (!leftPicked || locked || usedR.has(r)) return;
    const isCorrect = payload.pairs.some(
      (p) => p.l === leftPicked && p.r === r,
    );
    if (isCorrect) {
      setPairs((prev) => [...prev, { l: leftPicked, r }]);
      setLeftPicked(null);
    } else {
      const wrong = { l: leftPicked, r };
      setLastWrong(wrong);
      setLeftPicked(null);
      window.setTimeout(() => {
        setLastWrong((cur) =>
          cur && cur.l === wrong.l && cur.r === wrong.r ? null : cur,
        );
      }, 400);
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold tracking-tight text-ink md:text-2xl">
        {payload.q}
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <ul className="space-y-2">
          {payload.pairs.map((p) => {
            const used = usedL.has(p.l);
            const picked = leftPicked === p.l;
            const flashing = lastWrong?.l === p.l;
            return (
              <li key={p.l}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => pickLeft(p.l)}
                  className={`w-full rounded-lexi border-2 px-4 py-2.5 text-left font-medium transition-colors disabled:opacity-60 ${
                    flashing
                      ? "match-flash-wrong border-primary bg-primary-soft text-primary-ink"
                      : used
                        ? "border-ok bg-ok-soft text-ink"
                        : picked
                          ? "border-ink bg-bg-2 text-ink"
                          : "border-line bg-card text-ink hover:border-ink hover:bg-bg-2"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    {p.l}
                    {used && <Check className="h-4 w-4 text-ok" />}
                    {flashing && <X className="h-4 w-4 text-primary" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="space-y-2">
          {rightOrder.map((r) => {
            const used = usedR.has(r);
            const flashing = lastWrong?.r === r;
            return (
              <li key={r}>
                <button
                  type="button"
                  disabled={locked || used || !leftPicked || flashing}
                  onClick={() => pickRight(r)}
                  className={`w-full rounded-lexi border-2 px-4 py-2.5 text-left font-medium transition-colors disabled:opacity-60 ${
                    flashing
                      ? "match-flash-wrong border-primary bg-primary-soft text-primary-ink"
                      : used
                        ? "border-ok bg-ok-soft text-ink"
                        : "border-line bg-card text-ink hover:border-ink hover:bg-bg-2"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    {r}
                    {used && <Check className="h-4 w-4 text-ok" />}
                    {flashing && <X className="h-4 w-4 text-primary" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {!locked && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-ink-3">
            {leftPicked
              ? `Gekozen: ${leftPicked} — kies nu de match.`
              : usedL.size > 0
                ? `Tik een paar opnieuw om los te koppelen.`
                : `Tik eerst links, dan rechts.`}
          </p>
          {allDone && (
            <button
              type="button"
              onClick={() => onAnswer(pairs)}
              className="inline-flex items-center gap-1.5 rounded-lexi bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Klaar? <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      {locked && reveal && (
        <div className="mt-5 rounded-lexi border border-line bg-bg-2 p-3">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-3">
            Goede paren
          </p>
          <ul className="mt-2 space-y-1">
            {reveal.correctPairs.map((p) => (
              <li
                key={`${p.l}|${p.r}`}
                className="flex items-center gap-2 text-sm font-medium text-ink"
              >
                <span>{p.l}</span>
                <ArrowRight className="h-3.5 w-3.5 text-ink-3" aria-hidden="true" />
                <span>{p.r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
