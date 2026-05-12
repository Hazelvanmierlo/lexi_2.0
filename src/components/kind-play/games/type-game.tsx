"use client";

import { useState } from "react";
import type { TypePayload } from "@/lib/quiz-schemas";

export function TypeGame({
  payload,
  onAnswer,
  locked,
}: {
  payload: TypePayload;
  onAnswer: (answer: string) => void;
  locked: boolean;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (locked || value.trim().length === 0) return;
        onAnswer(value);
      }}
    >
      <h2 className="font-display text-xl font-bold tracking-tight text-ink md:text-2xl">
        {payload.q}
      </h2>
      <div className="mt-5 flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={locked}
          autoFocus
          autoComplete="off"
          spellCheck="false"
          className="flex-1 rounded-lexi border border-line bg-card px-4 py-3 font-display text-lg text-ink outline-none focus:border-ink disabled:opacity-60"
          aria-label="Antwoord"
        />
        <button
          type="submit"
          disabled={locked || value.trim().length === 0}
          className="rounded-lexi bg-ink px-5 py-3 text-base font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          Check
        </button>
      </div>
    </form>
  );
}
