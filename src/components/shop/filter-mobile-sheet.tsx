"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { ShopFilters } from "@/lib/shop-filter";

const SUBJECT_OPTIONS = [
  { value: "taal", label: "Taal" },
  { value: "rekenen", label: "Rekenen" },
  { value: "lezen", label: "Begrijpend Lezen" },
];

const GROEP_VALUES = ["1", "2", "3", "4", "5", "6", "7", "8"];

function csv(values: string[]): string {
  return values.join(",");
}

/**
 * Mobile-only filter trigger + full-screen sheet. Renders both the "Filter"
 * button (md:hidden) and a slide-up dialog with the same checkbox structure
 * as the desktop sidebar. Submitting applies via router.replace.
 */
export function FilterMobileSheet({
  filters,
  resultCount,
}: {
  filters: ShopFilters;
  resultCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subjects, setSubjects] = useState<string[]>(
    filters.subject === "all" ? [] : filters.subject,
  );
  const [groeps, setGroeps] = useState<string[]>(
    filters.groep === "all" ? [] : filters.groep,
  );

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Reset draft state to URL state every time the sheet opens.
  useEffect(() => {
    if (!open) return;
    setSubjects(filters.subject === "all" ? [] : filters.subject);
    setGroeps(filters.groep === "all" ? [] : filters.groep);
  }, [open, filters.subject, filters.groep]);

  const filterCount =
    (filters.subject === "all" ? 0 : filters.subject.length) +
    (filters.groep === "all" ? 0 : filters.groep.length);

  function toggle(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  function apply() {
    const sp = new URLSearchParams();
    if (subjects.length) sp.set("subject", csv(subjects));
    if (groeps.length) sp.set("groep", csv(groeps));
    if (filters.sort && filters.sort !== "popular") sp.set("sort", filters.sort);
    if (filters.q) sp.set("q", filters.q);
    const qs = sp.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop");
    setOpen(false);
  }

  function reset() {
    setSubjects([]);
    setGroeps([]);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-test="filter-mobile-trigger"
        className="inline-flex items-center gap-2 rounded-lexi border border-line bg-card px-4 py-2 text-sm font-medium text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filter
        {filterCount > 0 ? (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-none text-white tabular-nums">
            {filterCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Sluit filters"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-ink/30"
          />
          <div
            role="dialog"
            aria-label="Filters"
            data-test="filter-mobile-sheet"
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-lexi-lg bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line p-5">
              <h2 className="font-display text-lg font-bold text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Sluiten"
                className="rounded p-1 text-ink-2 hover:bg-bg-2 hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <section>
                <h3 className="font-display text-sm font-bold text-ink">Onderwerp</h3>
                <ul className="mt-2 space-y-1">
                  {SUBJECT_OPTIONS.map((s) => (
                    <li key={s.value}>
                      <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm text-ink hover:bg-bg-2">
                        <input
                          type="checkbox"
                          checked={subjects.includes(s.value)}
                          onChange={() => setSubjects((prev) => toggle(prev, s.value))}
                          className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                        />
                        {s.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="mt-6">
                <h3 className="font-display text-sm font-bold text-ink">Groep</h3>
                <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                  {GROEP_VALUES.map((g) => (
                    <li key={g}>
                      <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm text-ink hover:bg-bg-2">
                        <input
                          type="checkbox"
                          checked={groeps.includes(g)}
                          onChange={() => setGroeps((prev) => toggle(prev, g))}
                          className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                        />
                        Groep {g}
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            <div className="flex gap-2 border-t border-line p-5">
              <button
                type="button"
                onClick={reset}
                className="flex-1 rounded-lexi border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink hover:bg-bg-2"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={apply}
                data-test="filter-mobile-apply"
                className="flex-[2] rounded-lexi bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lexi-sm hover:opacity-90"
              >
                Toepassen ({resultCount})
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
