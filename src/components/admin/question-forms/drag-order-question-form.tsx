"use client";

import { useState } from "react";

type DragOrderPayload = {
  q: string;
  items: string[];
  correctOrder: string[];
};

function asDragOrder(initial: unknown): { q: string; orderText: string } {
  const p = (initial as Partial<DragOrderPayload>) ?? {};
  const items = Array.isArray(p.correctOrder)
    ? p.correctOrder.map(String).filter(Boolean)
    : [];
  return {
    q: typeof p.q === "string" ? p.q : "",
    orderText: items.join("\n"),
  };
}

export function DragOrderQuestionForm({
  initial,
  onSave,
}: {
  initial: unknown;
  onSave: (payload: DragOrderPayload) => void;
}) {
  const [q, setQ] = useState(() => asDragOrder(initial).q);
  const [orderText, setOrderText] = useState(
    () => asDragOrder(initial).orderText,
  );

  function save() {
    const items = orderText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({ q, items, correctOrder: items });
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-ink">Vraag</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mt-1.5 w-full rounded-lexi border border-line bg-card px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-ink">
          Items in juiste volgorde (één per regel)
        </span>
        <textarea
          value={orderText}
          onChange={(e) => setOrderText(e.target.value)}
          rows={6}
          placeholder="1/8&#10;1/4&#10;1/2&#10;3/4"
          className="mt-1.5 w-full rounded-lexi border border-line bg-card px-3 py-2 font-mono text-sm outline-none focus:border-ink"
        />
        <span className="mt-1 block text-xs text-ink-3">
          De volgorde hierboven is het juiste antwoord. Het kind ziet ze
          gehusseld.
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
