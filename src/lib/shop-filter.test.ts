import { describe, it, expect } from "vitest";
import { applyShopFilters } from "./shop-filter";

type WB = { subject: "REKENEN" | "TAAL" | "LEZEN"; groepBucket: string; id: string };
const sample: WB[] = [
  { id: "1", subject: "TAAL", groepBucket: "1" },
  { id: "2", subject: "TAAL", groepBucket: "5" },
  { id: "3", subject: "REKENEN", groepBucket: "5" },
  { id: "4", subject: "LEZEN", groepBucket: "8" },
];

describe("applyShopFilters", () => {
  it("returns everything when filters are 'all'", () => {
    expect(applyShopFilters(sample, { subject: "all", groep: "all" })).toHaveLength(4);
  });
  it("filters by subject", () => {
    const r = applyShopFilters(sample, { subject: "TAAL", groep: "all" });
    expect(r.map((w) => w.id)).toEqual(["1", "2"]);
  });
  it("filters by groep", () => {
    const r = applyShopFilters(sample, { subject: "all", groep: "5" });
    expect(r.map((w) => w.id).sort()).toEqual(["2", "3"]);
  });
  it("filters by both", () => {
    expect(applyShopFilters(sample, { subject: "REKENEN", groep: "5" })).toHaveLength(1);
  });
  it("subject filter is case-insensitive (URL params lowercase)", () => {
    const r = applyShopFilters(sample, { subject: "taal", groep: "all" });
    expect(r.map((w) => w.id)).toEqual(["1", "2"]);
  });
});
