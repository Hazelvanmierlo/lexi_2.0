"use client";

import { useState } from "react";

type TypePayload = {
  q: string;
  answer: string;
  accept?: string[];
};

function asType(initial: unknown): TypePayload {
  const p = (initial as Partial<TypePayload>) ?? {};
  return {
    q: typeof p.q === "string" ? p.q : "",
    answer: typeof p.answer === "string" ? p.answer : "",
    accept: Array.isArray(p.accept) ? p.accept.map(String) : [],
  };
}

export function TypeQuestionForm({
  initial,
  onSave,
}: {
  initial: unknown;
  onSave: (payload: TypePayload) => void;
}) {
  const [p, setP] = useState<TypePayload>(() => asType(initial));
  const [acceptText, setAcceptText] = useState((p.accept ?? []).join(", "));

  function save() {
    const accept = acceptText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({ q: p.q, answer: p.answer, ...(accept.length ? { accept } : {}) });
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
      <label className="block">
        <span className="text-sm font-semibold text-ink">Antwoord</span>
        <input
          value={p.answer}
          onChange={(e) => setP({ ...p, answer: e.target.value })}
          className="mt-1.5 w-full rounded-lexi border border-line bg-card px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-ink">
          Ook goed (komma-gescheiden)
        </span>
        <input
          value={acceptText}
          onChange={(e) => setAcceptText(e.target.value)}
          placeholder="bv. wandeld, wandelt-"
          className="mt-1.5 w-full rounded-lexi border border-line bg-card px-3 py-2 outline-none focus:border-ink"
        />
        <span className="mt-1 block text-xs text-ink-3">
          Hoofdletters en omringende spaties worden automatisch genegeerd.
        </span>
      </label>
      <div>
        <button
          type="button"
          onClick={save}
          className="rounded-lexi bg-ink px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Vraag opslaan
        </button>
      </div>
    </div>
  );
}
