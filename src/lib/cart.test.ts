import { describe, it, expect } from "vitest";
import {
  addWorkbook,
  addUitblinker,
  setQty,
  remove,
  subtotalCents,
  itemCount,
  shippingCents,
  CartItem,
  CartItemSchema,
} from "./cart";

const SKU_A = { slug: "taal-groep-3", title: "Taal Groep 3", priceCents: 1695 };
const SKU_B = { slug: "rekenen-groep-3", title: "Rekenen Groep 3", priceCents: 1695 };

const SHIPPING = { name: "Sara Jansen", line1: "Hoofdstraat 1", postcode: "1011AB", city: "Amsterdam" };

describe("cart - addWorkbook", () => {
  it("adds a new workbook with qty 1 by default", () => {
    const items = addWorkbook([], SKU_A);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ kind: "workbook", slug: SKU_A.slug, qty: 1 });
  });

  it("merges qty when adding the same slug twice", () => {
    let items: CartItem[] = [];
    items = addWorkbook(items, SKU_A, 1);
    items = addWorkbook(items, SKU_A, 2);
    expect(items).toHaveLength(1);
    expect((items[0] as { qty: number }).qty).toBe(3);
  });

  it("keeps different slugs as separate lines", () => {
    let items: CartItem[] = [];
    items = addWorkbook(items, SKU_A);
    items = addWorkbook(items, SKU_B);
    expect(items).toHaveLength(2);
  });

  it("clamps qty between 1 and 99", () => {
    let items = addWorkbook([], SKU_A, 9999);
    expect((items[0] as { qty: number }).qty).toBe(99);
    items = addWorkbook([], SKU_A, 0);
    expect((items[0] as { qty: number }).qty).toBe(1);
  });
});

describe("cart - addUitblinker", () => {
  const item = { kidName: "Sara", subject: "TAAL" as const, priceCents: 1995, shipping: SHIPPING };

  it("adds a uitblinker item", () => {
    const items = addUitblinker([], item);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ kind: "uitblinker", kidName: "Sara" });
  });

  it("replaces any existing uitblinker (only one allowed)", () => {
    let items = addUitblinker([], item);
    items = addUitblinker(items, { ...item, kidName: "Lev", subject: "REKENEN" });
    expect(items.filter((it) => it.kind === "uitblinker")).toHaveLength(1);
    expect((items[0] as { kidName: string }).kidName).toBe("Lev");
  });

  it("keeps workbook items when replacing uitblinker", () => {
    let items: CartItem[] = addWorkbook([], SKU_A);
    items = addUitblinker(items, item);
    items = addUitblinker(items, { ...item, kidName: "Lev" });
    expect(items.filter((it) => it.kind === "workbook")).toHaveLength(1);
    expect(items.filter((it) => it.kind === "uitblinker")).toHaveLength(1);
  });
});

describe("cart - setQty", () => {
  it("changes the qty of a workbook line", () => {
    const items = addWorkbook([], SKU_A, 2);
    const next = setQty(items, 0, 5);
    expect((next[0] as { qty: number }).qty).toBe(5);
  });

  it("removes the line when qty <= 0", () => {
    const items = addWorkbook([], SKU_A);
    const next = setQty(items, 0, 0);
    expect(next).toHaveLength(0);
  });

  it("ignores out-of-range indices", () => {
    const items = addWorkbook([], SKU_A);
    expect(setQty(items, 99, 5)).toEqual(items);
  });

  it("clamps to 99", () => {
    const items = addWorkbook([], SKU_A);
    const next = setQty(items, 0, 9999);
    expect((next[0] as { qty: number }).qty).toBe(99);
  });

  it("does nothing for uitblinker items (no qty)", () => {
    const items = addUitblinker([], {
      kidName: "Sara",
      subject: "TAAL",
      priceCents: 1995,
      shipping: SHIPPING,
    });
    const next = setQty(items, 0, 5);
    expect(next).toEqual(items);
  });
});

describe("cart - remove", () => {
  it("removes the item at idx", () => {
    let items = addWorkbook([], SKU_A);
    items = addWorkbook(items, SKU_B);
    const next = remove(items, 0);
    expect(next).toHaveLength(1);
    expect((next[0] as { slug: string }).slug).toBe(SKU_B.slug);
  });

  it("ignores invalid idx", () => {
    const items = addWorkbook([], SKU_A);
    expect(remove(items, 5)).toEqual(items);
    expect(remove(items, -1)).toEqual(items);
  });
});

describe("cart - subtotalCents", () => {
  it("returns 0 for empty", () => {
    expect(subtotalCents([])).toBe(0);
  });

  it("sums workbooks * qty", () => {
    let items = addWorkbook([], SKU_A, 2); // 2 * 1695 = 3390
    items = addWorkbook(items, SKU_B, 1); // + 1695 = 5085
    expect(subtotalCents(items)).toBe(5085);
  });

  it("adds uitblinker price once", () => {
    const items = addUitblinker([], {
      kidName: "Sara",
      subject: "TAAL",
      priceCents: 1995,
      shipping: SHIPPING,
    });
    expect(subtotalCents(items)).toBe(1995);
  });
});

describe("cart - itemCount", () => {
  it("sums qty for workbooks", () => {
    let items = addWorkbook([], SKU_A, 2);
    items = addWorkbook(items, SKU_B, 3);
    expect(itemCount(items)).toBe(5);
  });

  it("counts uitblinker as 1", () => {
    const items = addUitblinker([], {
      kidName: "Sara",
      subject: "TAAL",
      priceCents: 1995,
      shipping: SHIPPING,
    });
    expect(itemCount(items)).toBe(1);
  });
});

describe("cart - shippingCents", () => {
  it("returns 495 when subtotal < 2500", () => {
    expect(shippingCents(0)).toBe(495);
    expect(shippingCents(2499)).toBe(495);
  });

  it("returns 0 at or above 2500", () => {
    expect(shippingCents(2500)).toBe(0);
    expect(shippingCents(9999)).toBe(0);
  });
});

describe("cart - CartItemSchema validation", () => {
  it("accepts a valid workbook item", () => {
    const r = CartItemSchema.safeParse({
      kind: "workbook",
      slug: "taal-groep-3",
      title: "Taal Groep 3",
      priceCents: 1695,
      qty: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects bad postcode in uitblinker shipping", () => {
    const r = CartItemSchema.safeParse({
      kind: "uitblinker",
      kidName: "Sara",
      subject: "TAAL",
      priceCents: 1995,
      shipping: { name: "Sara", line1: "X 1", postcode: "ABC", city: "X" },
    });
    expect(r.success).toBe(false);
  });
});
