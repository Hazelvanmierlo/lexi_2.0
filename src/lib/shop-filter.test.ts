import { describe, it, expect } from "vitest";
import { applyShopFilters, parseShopFilters } from "./shop-filter";

type WB = {
  subject: "REKENEN" | "TAAL" | "LEZEN";
  groepBucket: string;
  id: string;
  priceCents?: number;
  sortOrder?: number;
  createdAt?: Date;
  title?: string;
  description?: string;
};
const sample: WB[] = [
  { id: "1", subject: "TAAL", groepBucket: "1", priceCents: 1695, sortOrder: 11 },
  { id: "2", subject: "TAAL", groepBucket: "5", priceCents: 1895, sortOrder: 51 },
  { id: "3", subject: "REKENEN", groepBucket: "5", priceCents: 1495, sortOrder: 52 },
  { id: "4", subject: "LEZEN", groepBucket: "8", priceCents: 1595, sortOrder: 83 },
];

const defaults = { sort: "popular" as const };

describe("applyShopFilters", () => {
  it("returns everything when filters are 'all'", () => {
    expect(
      applyShopFilters(sample, { subject: "all", groep: "all", ...defaults }),
    ).toHaveLength(4);
  });
  it("filters by single subject (array)", () => {
    const r = applyShopFilters(sample, { subject: ["TAAL"], groep: "all", ...defaults });
    expect(r.map((w) => w.id).sort()).toEqual(["1", "2"]);
  });
  it("filters by single groep (array)", () => {
    const r = applyShopFilters(sample, { subject: "all", groep: ["5"], ...defaults });
    expect(r.map((w) => w.id).sort()).toEqual(["2", "3"]);
  });
  it("filters by both", () => {
    expect(
      applyShopFilters(sample, { subject: ["REKENEN"], groep: ["5"], ...defaults }),
    ).toHaveLength(1);
  });
  it("subject filter is case-insensitive (URL params lowercase)", () => {
    const r = applyShopFilters(sample, { subject: ["taal"], groep: "all", ...defaults });
    expect(r.map((w) => w.id).sort()).toEqual(["1", "2"]);
  });
  it("supports multi-select subjects", () => {
    const r = applyShopFilters(sample, {
      subject: ["taal", "rekenen"],
      groep: "all",
      ...defaults,
    });
    expect(r.map((w) => w.id).sort()).toEqual(["1", "2", "3"]);
  });
  it("supports multi-select groeps", () => {
    const r = applyShopFilters(sample, {
      subject: "all",
      groep: ["5", "8"],
      ...defaults,
    });
    expect(r.map((w) => w.id).sort()).toEqual(["2", "3", "4"]);
  });
  it("empty subject array returns nothing", () => {
    expect(applyShopFilters(sample, { subject: [], groep: "all", ...defaults })).toHaveLength(0);
  });
  it("empty groep array returns nothing", () => {
    expect(applyShopFilters(sample, { subject: "all", groep: [], ...defaults })).toHaveLength(0);
  });
  it("sort: popular orders by sortOrder ascending", () => {
    const r = applyShopFilters(sample, { subject: "all", groep: "all", sort: "popular" });
    expect(r.map((w) => w.id)).toEqual(["1", "2", "3", "4"]);
  });
  it("sort: price-asc orders cheapest first", () => {
    const r = applyShopFilters(sample, { subject: "all", groep: "all", sort: "price-asc" });
    expect(r.map((w) => w.id)).toEqual(["3", "4", "1", "2"]);
  });
  it("sort: price-desc orders most expensive first", () => {
    const r = applyShopFilters(sample, { subject: "all", groep: "all", sort: "price-desc" });
    expect(r.map((w) => w.id)).toEqual(["2", "1", "4", "3"]);
  });
  it("sort: recent orders newest first", () => {
    const dated: WB[] = [
      { id: "a", subject: "TAAL", groepBucket: "1", createdAt: new Date("2026-01-01") },
      { id: "b", subject: "TAAL", groepBucket: "2", createdAt: new Date("2026-03-01") },
      { id: "c", subject: "TAAL", groepBucket: "3", createdAt: new Date("2026-02-01") },
    ];
    const r = applyShopFilters(dated, { subject: "all", groep: "all", sort: "recent" });
    expect(r.map((w) => w.id)).toEqual(["b", "c", "a"]);
  });
  it("q-text search matches title (case-insensitive substring)", () => {
    const titled: WB[] = [
      { id: "1", subject: "TAAL", groepBucket: "1", title: "Taal groep 1" },
      { id: "2", subject: "REKENEN", groepBucket: "2", title: "Rekenen groep 2" },
    ];
    const r = applyShopFilters(titled, {
      subject: "all",
      groep: "all",
      sort: "popular",
      q: "rEkE",
    });
    expect(r.map((w) => w.id)).toEqual(["2"]);
  });
  it("q-text search matches description", () => {
    const desced: WB[] = [
      { id: "1", subject: "TAAL", groepBucket: "1", title: "x", description: "alles over Cito" },
      { id: "2", subject: "TAAL", groepBucket: "2", title: "y", description: "alles over IEP" },
    ];
    const r = applyShopFilters(desced, {
      subject: "all",
      groep: "all",
      sort: "popular",
      q: "cito",
    });
    expect(r.map((w) => w.id)).toEqual(["1"]);
  });
});

describe("parseShopFilters", () => {
  it("returns 'all' defaults when params are missing", () => {
    const f = parseShopFilters({});
    expect(f.subject).toBe("all");
    expect(f.groep).toBe("all");
    expect(f.sort).toBe("popular");
    expect(f.q).toBeUndefined();
  });
  it("parses single subject as a 1-item array (multi-select shape)", () => {
    const f = parseShopFilters({ subject: "taal" });
    expect(f.subject).toEqual(["taal"]);
  });
  it("splits comma-separated subjects", () => {
    const f = parseShopFilters({ subject: "taal,rekenen" });
    expect(f.subject).toEqual(["taal", "rekenen"]);
  });
  it("splits comma-separated groeps", () => {
    const f = parseShopFilters({ groep: "3,4,5" });
    expect(f.groep).toEqual(["3", "4", "5"]);
  });
  it("'all' literal stays 'all'", () => {
    const f = parseShopFilters({ subject: "all", groep: "all" });
    expect(f.subject).toBe("all");
    expect(f.groep).toBe("all");
  });
  it("empty string falls back to 'all'", () => {
    const f = parseShopFilters({ subject: "", groep: "" });
    expect(f.subject).toBe("all");
    expect(f.groep).toBe("all");
  });
  it("parses sort if valid; falls back to popular", () => {
    expect(parseShopFilters({ sort: "price-asc" }).sort).toBe("price-asc");
    expect(parseShopFilters({ sort: "garbage" }).sort).toBe("popular");
  });
  it("trims q-text and drops empty", () => {
    expect(parseShopFilters({ q: "  taal  " }).q).toBe("taal");
    expect(parseShopFilters({ q: "   " }).q).toBeUndefined();
  });
});
