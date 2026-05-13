// Pure filter logic for the shop index — subject × groep × sort × q.
//
// Subject comparison is case-insensitive because URL query params arrive
// lowercase ("taal"), while the DB enum is uppercase ("TAAL").
//
// Multi-select: subject and groep accept either the literal "all" or an array
// of values. URL form: ?subject=taal,rekenen splits on comma at parse time.

export type SortOrder = "popular" | "price-asc" | "price-desc" | "recent";

export type ShopFilters = {
  subject: "all" | string[];
  groep: "all" | string[];
  sort: SortOrder;
  q?: string;
};

export type ShopSearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseMulti(value: string | string[] | undefined): "all" | string[] {
  const v = firstParam(value);
  if (v === undefined || v === null || v === "" || v === "all") return "all";
  // Split on comma; trim whitespace; drop empties; lowercase.
  const parts = v
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (parts.length === 0) return "all";
  return parts;
}

function parseSort(value: string | string[] | undefined): SortOrder {
  const v = firstParam(value);
  if (v === "price-asc" || v === "price-desc" || v === "recent" || v === "popular") return v;
  return "popular";
}

export function parseShopFilters(searchParams: ShopSearchParams): ShopFilters {
  const q = firstParam(searchParams.q);
  return {
    subject: parseMulti(searchParams.subject),
    groep: parseMulti(searchParams.groep),
    sort: parseSort(searchParams.sort),
    q: q && q.trim().length > 0 ? q.trim() : undefined,
  };
}

type Sortable = {
  subject: string;
  groepBucket: string;
  priceCents?: number;
  sortOrder?: number;
  createdAt?: Date | string;
  title?: string;
  description?: string;
};

export function applyShopFilters<T extends Sortable>(workbooks: T[], filters: ShopFilters): T[] {
  // Filter
  const subjects =
    filters.subject === "all" ? null : filters.subject.map((s) => s.toLowerCase());
  const groeps = filters.groep === "all" ? null : filters.groep.map((g) => g.toString());

  const filtered = workbooks.filter((w) => {
    if (subjects !== null) {
      if (subjects.length === 0) return false;
      if (!subjects.includes(w.subject.toLowerCase())) return false;
    }
    if (groeps !== null) {
      if (groeps.length === 0) return false;
      if (!groeps.includes(w.groepBucket)) return false;
    }
    if (filters.q) {
      const needle = filters.q.toLowerCase();
      const title = (w.title ?? "").toLowerCase();
      const desc = (w.description ?? "").toLowerCase();
      if (!title.includes(needle) && !desc.includes(needle)) return false;
    }
    return true;
  });

  // Sort. We sort a copy so the input array isn't mutated.
  const sorted = [...filtered];
  switch (filters.sort) {
    case "price-asc":
      sorted.sort((a, b) => (a.priceCents ?? 0) - (b.priceCents ?? 0));
      break;
    case "price-desc":
      sorted.sort((a, b) => (b.priceCents ?? 0) - (a.priceCents ?? 0));
      break;
    case "recent":
      sorted.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
      break;
    case "popular":
    default:
      sorted.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      break;
  }
  return sorted;
}
