"use client";

import { useState } from "react";
import type { CatapultPayload } from "@/lib/quiz-schemas";

// "Tap to fire" catapult.
//
// 4 answer targets across the top, a catapult at the bottom. The kid taps a
// target to aim + launch in one go. A ball animates up the screen along a
// curve to the picked target, then the parent calls onAnswer().
//
// Touch- and keyboard-friendly: every target is a real <button>, so tab + space
// works and screen readers see them as radios.

type Stage = { kind: "ready" } | { kind: "flying"; targetIdx: number };

const FLIGHT_MS = 700;

export function CatapultGame({
  payload,
  onAnswer,
  locked,
}: {
  payload: CatapultPayload;
  onAnswer: (idx: number) => void;
  locked: boolean;
}) {
  const [stage, setStage] = useState<Stage>({ kind: "ready" });

  function fire(idx: number) {
    if (locked || stage.kind === "flying") return;
    setStage({ kind: "flying", targetIdx: idx });
    window.setTimeout(() => {
      setStage({ kind: "ready" });
      onAnswer(idx);
    }, FLIGHT_MS);
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold tracking-tight text-ink md:text-2xl">
        {payload.q}
      </h2>

      <div className="relative mt-6 overflow-hidden rounded-lexi-lg border border-line-2 bg-bg-2 p-4 pb-2">
        {/* Targets */}
        <ul
          className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4"
          role="radiogroup"
          aria-label={payload.q}
        >
          {payload.options.map((opt, i) => (
            <li key={`${i}-${opt}`}>
              <button
                type="button"
                role="radio"
                aria-checked={false}
                disabled={locked || stage.kind === "flying"}
                onClick={() => fire(i)}
                className="flex w-full items-center justify-center rounded-lexi border-2 border-ink bg-card px-3 py-4 text-center font-display text-lg font-bold text-ink shadow-lexi-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                data-target-idx={i}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>

        {/* Flight area + catapult */}
        <div className="relative mt-6 h-32">
          {/* dotted trajectory hint */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 top-1 bottom-10 rounded-full border border-dashed border-line-2"
          />
          {/* catapult body */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
          >
            <CatapultSvg />
          </div>

          {/* ball */}
          {stage.kind === "flying" && (
            <Ball
              key={stage.targetIdx}
              targetCount={payload.options.length}
              targetIdx={stage.targetIdx}
            />
          )}
        </div>
      </div>
      {!locked && stage.kind === "ready" && (
        <p className="mt-3 text-xs text-ink-3">
          Tik op het juiste antwoord — Lexi mikt de katapult voor je.
        </p>
      )}
    </div>
  );
}

function Ball({
  targetCount,
  targetIdx,
}: {
  targetCount: number;
  targetIdx: number;
}) {
  // Map target index (0..n-1) to a left% position centred over its column.
  const left = ((targetIdx + 0.5) / targetCount) * 100;
  return (
    <span
      aria-hidden="true"
      className="catapult-ball pointer-events-none absolute bottom-8 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-primary shadow-lexi-sm"
      style={{ ["--target-left" as string]: `${left}%` }}
    />
  );
}

function CatapultSvg() {
  return (
    <svg
      width="80"
      height="48"
      viewBox="0 0 80 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 44 L40 12 L72 44"
        stroke="oklch(22% 0.025 260)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 44 L72 44"
        stroke="oklch(22% 0.025 260)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="40" cy="12" r="5" fill="oklch(57% 0.16 35)" stroke="oklch(22% 0.025 260)" strokeWidth="2" />
    </svg>
  );
}
