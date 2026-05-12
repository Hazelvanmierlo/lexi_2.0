"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown } from "lucide-react";
import { setLocale } from "@/lib/set-locale-action";
import { NlFlag, BeFlag } from "./flag";

type Locale = "nl-NL" | "nl-BE";

const OPTIONS: { value: Locale; flag: typeof NlFlag; labelKey: "netherlands" | "belgium" }[] = [
  { value: "nl-NL", flag: NlFlag, labelKey: "netherlands" },
  { value: "nl-BE", flag: BeFlag, labelKey: "belgium" },
];

export function RegionPicker() {
  const t = useTranslations("nav");
  const current = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const Active = current === "nl-NL" ? NlFlag : BeFlag;

  function choose(value: Locale) {
    setOpen(false);
    startTransition(() => {
      setLocale(value);
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("selectRegion")}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lexi border border-line bg-card px-3 py-2 text-sm text-ink-2 hover:bg-bg-2"
      >
        <Active />
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-lexi border border-line bg-card shadow-lexi"
        >
          {OPTIONS.map(({ value, flag: F, labelKey }) => (
            <li key={value}>
              <button
                type="button"
                onClick={() => choose(value)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-bg-2 ${
                  value === current ? "bg-primary-soft" : ""
                }`}
              >
                <F />
                <span className="flex-1 text-ink">{t(labelKey)}</span>
                {value === current && <Check className="h-4 w-4 text-primary-ink" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
