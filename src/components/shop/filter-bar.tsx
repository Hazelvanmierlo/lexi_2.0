"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SUBJECTS = [
  { value: "all",     label: "Alle onderwerpen" },
  { value: "taal",    label: "Taal" },
  { value: "rekenen", label: "Rekenen" },
  { value: "lezen",   label: "Begrijpend Lezen" },
];

const GROEPS = ["all", "1", "2", "3", "4", "5", "6", "7", "8"];

export function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const subject = params.get("subject") ?? "all";
  const groep = params.get("groep") ?? "all";

  function update(key: "subject" | "groep", value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop");
  }

  return (
    <div className="space-y-3">
      {/* Subject pills */}
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">Onderwerp</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <li key={s.value}>
              <button
                type="button"
                onClick={() => update("subject", s.value)}
                aria-pressed={subject === s.value}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  subject === s.value
                    ? "border-primary bg-primary-soft text-primary-ink"
                    : "border-line bg-card text-ink-2 hover:bg-bg-2"
                }`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Groep pills */}
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">Groep</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {GROEPS.map((g) => (
            <li key={g}>
              <button
                type="button"
                onClick={() => update("groep", g)}
                aria-pressed={groep === g}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  groep === g
                    ? "border-primary bg-primary-soft text-primary-ink"
                    : "border-line bg-card text-ink-2 hover:bg-bg-2"
                }`}
              >
                {g === "all" ? "Alle groepen" : g}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
