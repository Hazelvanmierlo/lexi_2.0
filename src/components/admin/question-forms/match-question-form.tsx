"use client";

import { useState } from "react";

type Pair = { l: string; r: string };
type MatchPayload = { q: string; pairs: Pair[] };

function asMatch(initial: unknown): MatchPayload {
  const p = (initial as Partial<MatchPayload>) ?? {};
  const pairs: Pair[] = Array.isArray(p.pairs)
    ? p.pairs.slice(0, 5).map((pp) => ({
        l: typeof pp?.l === "string" ? pp.l : "",
        r: typeof pp?.r === "string" ? pp.r : "",
      }))
    : [];
  while (pairs.length < 5) pairs.push({ l: "", r: "" });
  return { q: typeof p.q === "string" ? p.q : "", pairs };
}

export function MatchQuestionForm({
  initial,
  onSave,
}: {
  initial: unknown;
  onSave: (payload: MatchPayload) => void;
}) {
  const [p, setP] = useState<MatchPayload>(() => asMatch(initial));

  function setPair(i: number, key: "l" | "r", v: string) {
    setP((prev) => ({
      ...prev,
      pairs: prev.pairs.map((pp, idx) => (idx === i ? { ...pp, [key]: v } : pp)),
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
        <span className="text-sm font-semibold text-ink">5 paren</span>
        <ul className="mt-1.5 space-y-2">
          {p.pairs.map((pp, i) => (
            <li key={i} className="grid grid-cols-2 gap-2">
              <input
                value={pp.l}
                onChange={(e) => setPair(i, "l", e.target.value)}
                placeholder={`Links ${i + 1}`}
                className="rounded-lexi border border-line bg-card px-3 py-2 outline-none focus:border-ink"
              />
              <input
                value={pp.r}
                onChange={(e) => setPair(i, "r", e.target.value)}
                placeholder={`Rechts ${i + 1}`}
                className="rounded-lexi border border-line bg-card px-3 py-2 outline-none focus:border-ink"
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
