"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import type { ShopFilters } from "@/lib/shop-filter";

const SUBJECT_OPTIONS = [
  { value: "taal", label: "Taal", count: 8 },
  { value: "rekenen", label: "Rekenen", count: 8 },
  { value: "lezen", label: "Begrijpend Lezen", count: 8 },
];

const GROEP_OPTIONS = [
  { value: "1", count: 3 },
  { value: "2", count: 3 },
  { value: "3", count: 3 },
  { value: "4", count: 3 },
  { value: "5", count: 3 },
  { value: "6", count: 3 },
  { value: "7", count: 3 },
  { value: "8", count: 3 },
];

function arraysToCsv(values: string[]): string {
  return values.join(",");
}

function toggleSet(current: string[], value: string, checked: boolean): string[] {
  if (checked) {
    return current.includes(value) ? current : [...current, value];
  }
  return current.filter((v) => v !== value);
}

/**
 * Desktop left filter sidebar. Multi-select checkboxes for subject + groep.
 * URL: ?subject=taal,rekenen&groep=3,4 (comma-separated). Reset returns to /shop.
 */
export function FilterSidebar({ filters }: { filters: ShopFilters }) {
  const router = useRouter();
  const subjects = filters.subject === "all" ? [] : filters.subject;
  const groeps = filters.groep === "all" ? [] : filters.groep;

  function onSubjectChange(value: string, checked: boolean) {
    const next = toggleSet(subjects, value, checked);
    const sp = new URLSearchParams();
    if (next.length) sp.set("subject", arraysToCsv(next));
    if (groeps.length) sp.set("groep", arraysToCsv(groeps));
    if (filters.sort && filters.sort !== "popular") sp.set("sort", filters.sort);
    if (filters.q) sp.set("q", filters.q);
    const qs = sp.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop");
  }

  function onGroepChange(value: string, checked: boolean) {
    const next = toggleSet(groeps, value, checked);
    const sp = new URLSearchParams();
    if (subjects.length) sp.set("subject", arraysToCsv(subjects));
    if (next.length) sp.set("groep", arraysToCsv(next));
    if (filters.sort && filters.sort !== "popular") sp.set("sort", filters.sort);
    if (filters.q) sp.set("q", filters.q);
    const qs = sp.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop");
  }

  return (
    <aside aria-label="Filters" data-test="filter-sidebar" className="space-y-4">
      <h2 className="font-mono text-xs uppercase tracking-wider text-ink-2">Filters</h2>

      <details open className="rounded-lexi border border-line bg-card">
        <summary className="cursor-pointer list-none px-4 py-3 font-display text-sm font-bold text-ink">
          Onderwerp
        </summary>
        <ul className="space-y-1 px-4 pb-3">
          {SUBJECT_OPTIONS.map((s) => (
            <li key={s.value}>
              <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink hover:bg-bg-2">
                <input
                  type="checkbox"
                  data-test={`filter-subject-${s.value}`}
                  checked={subjects.includes(s.value)}
                  onChange={(e) => onSubjectChange(s.value, e.target.checked)}
                  className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                />
                <span className="flex-1">{s.label}</span>
                <span className="text-xs text-ink-2 tabular-nums">({s.count})</span>
              </label>
            </li>
          ))}
        </ul>
      </details>

      <details open className="rounded-lexi border border-line bg-card">
        <summary className="cursor-pointer list-none px-4 py-3 font-display text-sm font-bold text-ink">
          Groep
        </summary>
        <ul className="space-y-1 px-4 pb-3">
          {GROEP_OPTIONS.map((g) => (
            <li key={g.value}>
              <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink hover:bg-bg-2">
                <input
                  type="checkbox"
                  data-test={`filter-groep-${g.value}`}
                  checked={groeps.includes(g.value)}
                  onChange={(e) => onGroepChange(g.value, e.target.checked)}
                  className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                />
                <span className="flex-1">Groep {g.value}</span>
                <span className="text-xs text-ink-2 tabular-nums">({g.count})</span>
              </label>
            </li>
          ))}
        </ul>
      </details>

      {(subjects.length > 0 || groeps.length > 0 || filters.q) ? (
        <Link
          href="/shop"
          data-test="filter-reset"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset filters
        </Link>
      ) : null}
    </aside>
  );
}
