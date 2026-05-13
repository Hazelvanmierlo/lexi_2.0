"use client";

import { useEffect, useRef, useState } from "react";
import { Delete } from "lucide-react";

/**
 * On-screen 4-digit PIN pad for the kid profile picker.
 *
 * The component renders a hidden `<input name>` plus 4 display boxes and a
 * 10-key + backspace grid. As the kid taps digits we update local state,
 * sync the hidden input, and auto-submit the enclosing form on the 4th digit.
 * The keyboard (number row + Backspace) still works as a fallback for
 * accessibility, but no physical keyboard is required.
 *
 * Designed to be dropped inside a server-action `<form action={...}>`.
 */
export function PinPad({ name = "pin" }: { name?: string }) {
  const [digits, setDigits] = useState<string>("");
  const hiddenRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const submittedRef = useRef(false);

  // Find the enclosing form once mounted. We submit it programmatically
  // once 4 digits have been entered.
  useEffect(() => {
    if (hiddenRef.current) {
      formRef.current = hiddenRef.current.form;
    }
  }, []);

  // Auto-submit when we hit 4 digits.
  useEffect(() => {
    if (digits.length === 4 && !submittedRef.current && formRef.current) {
      submittedRef.current = true;
      // Tiny delay so the 4th digit visibly lands before nav.
      const id = setTimeout(() => formRef.current?.requestSubmit(), 80);
      return () => clearTimeout(id);
    }
  }, [digits]);

  // Keyboard fallback: number row + Backspace.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        pushDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        popDigit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pushDigit(d: string) {
    setDigits((prev) => (prev.length >= 4 ? prev : prev + d));
  }
  function popDigit() {
    setDigits((prev) => prev.slice(0, -1));
    submittedRef.current = false; // allow re-submit if user is editing
  }

  const filled = digits.length;

  return (
    <div className="flex flex-col items-center gap-6">
      <input
        ref={hiddenRef}
        type="hidden"
        name={name}
        value={digits}
        readOnly
      />

      {/* Display boxes */}
      <div
        className="flex gap-3"
        role="group"
        aria-label="PIN-invoer"
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            aria-hidden="true"
            className={`flex h-14 w-12 items-center justify-center rounded-lexi border-2 ${
              i < filled ? "border-primary bg-primary-soft" : "border-line bg-card"
            } font-display text-2xl font-bold text-ink`}
          >
            {i < filled ? "•" : ""}
          </div>
        ))}
      </div>

      {/* 10-key grid */}
      <div className="grid w-full max-w-[280px] grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => pushDigit(String(n))}
            className="min-h-[56px] rounded-lexi border border-line bg-card font-display text-xl font-bold text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {n}
          </button>
        ))}
        <div aria-hidden="true" />
        <button
          type="button"
          onClick={() => pushDigit("0")}
          className="min-h-[56px] rounded-lexi border border-line bg-card font-display text-xl font-bold text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          0
        </button>
        <button
          type="button"
          onClick={popDigit}
          aria-label="Wis laatste cijfer"
          className="flex min-h-[56px] items-center justify-center rounded-lexi border border-line bg-card text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Delete className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
