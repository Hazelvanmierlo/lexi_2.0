"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { MatchPayload } from "@/lib/quiz-schemas";

// Tap-to-pair: tap a left item, then tap a right item to pair them. Already-
// paired items lock. When all 5 pairs are made, auto-submit the answer.
// Keyboard-friendly (every chip is a real button).
export function MatchGame({
  payload,
  onAnswer,
  locked,
}: {
  payload: MatchPayload;
  onAnswer: (answer: Array<{ l: string; r: string }>) => void;
  locked: boolean;
}) {
  const [leftPicked, setLeftPicked] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Array<{ l: string; r: string }>>([]);

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

  // Auto-submit when all pairs are made.
  useEffect(() => {
    if (pairs.length === payload.pairs.length) {
      onAnswer(pairs);
    }
  }, [pairs, payload.pairs.length, onAnswer]);

  function pickRight(r: string) {
    if (!leftPicked || locked || usedR.has(r)) return;
    setPairs((prev) => [...prev, { l: leftPicked, r }]);
    setLeftPicked(null);
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
            return (
              <li key={p.l}>
                <button
                  type="button"
                  disabled={locked || used}
                  onClick={() => setLeftPicked(picked ? null : p.l)}
                  className={`w-full rounded-lexi border-2 px-4 py-2.5 text-left font-medium transition-colors ${
                    used
                      ? "border-ok bg-ok-soft text-ink"
                      : picked
                        ? "border-ink bg-bg-2 text-ink"
                        : "border-line bg-card text-ink hover:border-ink hover:bg-bg-2"
                  } disabled:opacity-60`}
                >
                  <span className="flex items-center justify-between">
                    {p.l}
                    {used && <Check className="h-4 w-4 text-ok" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="space-y-2">
          {rightOrder.map((r) => {
            const used = usedR.has(r);
            return (
              <li key={r}>
                <button
                  type="button"
                  disabled={locked || used || !leftPicked}
                  onClick={() => pickRight(r)}
                  className={`w-full rounded-lexi border-2 px-4 py-2.5 text-left font-medium transition-colors ${
                    used
                      ? "border-ok bg-ok-soft text-ink"
                      : "border-line bg-card text-ink hover:border-ink hover:bg-bg-2"
                  } disabled:opacity-60`}
                >
                  <span className="flex items-center justify-between">
                    {r}
                    {used && <Check className="h-4 w-4 text-ok" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {!locked && (
        <p className="mt-3 text-xs text-ink-3">
          {leftPicked
            ? `Gekozen: ${leftPicked} — kies nu de match.`
            : `Tik eerst links, dan rechts.`}
        </p>
      )}
    </div>
  );
}
