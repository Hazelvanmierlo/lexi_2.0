"use client";

import { useState, useTransition } from "react";
import { HelpCircle, X } from "lucide-react";
import { useHint, type UseHintResult } from "@/app/kind/spelen/actions";

/**
 * Per-question hint affordance. First tap charges HINT_COST coins server-
 * side; subsequent taps re-open the same modal for free. If the question has
 * no hint authored, the action returns { ok: false, reason: "no-hint" } and
 * we show a friendly message — the coin is NOT spent (server enforces).
 */
export function HintButton({
  sessionId,
  questionId,
  onCoinsCharged,
}: {
  sessionId: string;
  questionId: string;
  onCoinsCharged?: (newBalance: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState<UseHintResult | null>(null);
  const [pending, startTx] = useTransition();

  function handleOpen() {
    if (hint?.ok) {
      setOpen(true);
      return;
    }
    startTx(async () => {
      const r = await useHint({ sessionId, questionId });
      setHint(r);
      setOpen(true);
      if (r.ok) onCoinsCharged?.(r.newCoinsBalance);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={pending}
        aria-label="Toon hint"
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:bg-bg-2 disabled:opacity-50"
      >
        <HelpCircle className="h-4 w-4" />
        Hint
      </button>
      {open && hint && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Hint"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-lexi-lg border border-line bg-card p-5 shadow-lexi-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Sluit"
              className="absolute right-2 top-2 rounded-full p-1.5 text-ink-3 hover:bg-bg-2"
            >
              <X className="h-4 w-4" />
            </button>
            {hint.ok ? (
              <>
                <p className="font-mono text-xs uppercase tracking-wider text-ink-3">
                  Hint · −{hint.coinsCharged} munten
                </p>
                <p className="mt-2 font-display text-lg font-medium text-ink">
                  {hint.hint}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-2">
                {hint.reason === "no-hint"
                  ? "Er is geen hint voor deze vraag."
                  : hint.reason === "already-used"
                    ? "Je hebt de hint al gezien."
                    : "Deze quiz is al klaar."}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
