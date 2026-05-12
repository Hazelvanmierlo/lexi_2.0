"use client";

import { useTranslations } from "next-intl";

export function FilterBar() {
  const cat = useTranslations("shop.filters.category");
  const grp = useTranslations("shop.filters.groep");
  const CATEGORIES = [cat("all"), cat("abonnementen"), cat("werkboeken"), cat("bundels")];
  const GROEP_OPTS = [grp("all"), "1", "2", "3", "4", "5", "6", "7", "8"];

  return (
    <div className="space-y-3">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">{cat("label")}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {CATEGORIES.map((c, i) => (
            <li key={c}>
              <button
                type="button"
                className={`rounded-full border px-3 py-1 text-sm font-medium ${
                  i === 0
                    ? "border-primary bg-primary-soft text-primary-ink"
                    : "border-line bg-card text-ink-2 hover:bg-bg-2"
                }`}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">{grp("label")}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {GROEP_OPTS.map((g, i) => (
            <li key={g}>
              <button
                type="button"
                className={`rounded-full border px-3 py-1 text-sm font-medium ${
                  i === 0
                    ? "border-primary bg-primary-soft text-primary-ink"
                    : "border-line bg-card text-ink-2 hover:bg-bg-2"
                }`}
              >
                {g}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
