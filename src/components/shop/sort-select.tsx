"use client";

import { useRouter } from "next/navigation";
import type { ShopFilters, SortOrder } from "@/lib/shop-filter";

const OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "popular", label: "Populariteit" },
  { value: "price-asc", label: "Prijs (laag → hoog)" },
  { value: "price-desc", label: "Prijs (hoog → laag)" },
  { value: "recent", label: "Recent toegevoegd" },
];

/**
 * Native <select> that controls ?sort= in the URL. Preserves all other
 * filters (subject/groep/q) via router.replace.
 */
export function SortSelect({ filters }: { filters: ShopFilters }) {
  const router = useRouter();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.currentTarget.value as SortOrder;
    const sp = new URLSearchParams();
    if (filters.subject !== "all" && filters.subject.length)
      sp.set("subject", filters.subject.join(","));
    if (filters.groep !== "all" && filters.groep.length) sp.set("groep", filters.groep.join(","));
    if (next !== "popular") sp.set("sort", next);
    if (filters.q) sp.set("q", filters.q);
    const qs = sp.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop");
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-ink-2">
      <span className="hidden sm:inline">Sorteer:</span>
      <select
        data-test="sort-select"
        value={filters.sort}
        onChange={onChange}
        className="rounded-lexi border border-line bg-card px-2.5 py-1.5 text-sm font-medium text-ink focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
