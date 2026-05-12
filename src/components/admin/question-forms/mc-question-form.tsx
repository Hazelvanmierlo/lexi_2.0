"use client";

import { useState } from "react";

type McPayload = {
  q: string;
  options: string[];
  correctIdx: number;
};

function asMc(initial: unknown): McPayload {
  const p = (initial as Partial<McPayload>) ?? {};
  return {
    q: typeof p.q === "string" ? p.q : "",
    options: Array.isArray(p.options) && p.options.length === 4
      ? p.options.map((o) => String(o))
      : ["", "", "", ""],
    correctIdx:
      typeof p.correctIdx === "number" && p.correctIdx >= 0 && p.correctIdx <= 3
        ? p.correctIdx
        : 0,
  };
}

export function McQuestionForm({
  initial,
  onSave,
}: {
  initial: unknown;
  onSave: (payload: McPayload) => void;
}) {
  const [p, setP] = useState<McPayload>(() => asMc(initial));

  function setOption(i: number, v: string) {
    setP((prev) => ({
      ...prev,
      options: prev.options.map((o, idx) => (idx === i ? v : o)),
    }));
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-ink">Vraag</span>
        <input
          value={p.q}
          onChange={(e) => setP({ ...p, q: e.target.value })}
          className="mt-1.5 w-full rounded-lexi border border-line bg-card px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <div>
        <span className="text-sm font-semibold text-ink">Opties (kies het juiste antwoord)</span>
        <ul className="mt-1.5 space-y-2">
          {p.options.map((opt, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctIdx"
                checked={p.correctIdx === i}
                onChange={() => setP({ ...p, correctIdx: i })}
                aria-label={`Optie ${i + 1} is goed`}
              />
              <input
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder={`Optie ${i + 1}`}
                className="flex-1 rounded-lexi border border-line bg-card px-3 py-2 outline-none focus:border-ink"
              />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <button
          type="button"
          onClick={() => onSave(p)}
          className="rounded-lexi bg-ink px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Vraag opslaan
        </button>
      </div>
    </div>
  );
}
