import { describe, it, expect } from "vitest";
import { breadcrumbFor } from "./breadcrumb";

describe("breadcrumbFor", () => {
  it("/shop renders Lexi > Shop with last unlinked", () => {
    const c = breadcrumbFor("/shop");
    expect(c.map((x) => x.label)).toEqual(["Lexi", "Shop"]);
    expect(c[0].href).toBe("/");
    expect(c[c.length - 1].href).toBeNull();
  });

  it("/shop?subject=taal renders Lexi > Shop > Taal", () => {
    const c = breadcrumbFor("/shop", { subject: "taal" });
    expect(c.map((x) => x.label)).toEqual(["Lexi", "Shop", "Taal"]);
    expect(c[1].href).toBe("/shop");
    expect(c[2].href).toBeNull();
  });

  it("/shop/boek/[slug] renders 5 segments with book context", () => {
    const c = breadcrumbFor("/shop/boek/taal-groep-3", {
      bookTitle: "Taal groep 3",
      bookSubject: "TAAL",
      bookGroep: "3",
    });
    expect(c.map((x) => x.label)).toEqual([
      "Lexi",
      "Shop",
      "Taal",
      "Groep 3",
      "Taal groep 3",
    ]);
    expect(c[2].href).toBe("/shop?subject=taal");
    expect(c[3].href).toBeNull();
    expect(c[4].href).toBeNull();
  });

  it("/shop/boek/[slug] without context falls back to Werkboeken", () => {
    const c = breadcrumbFor("/shop/boek/unknown");
    expect(c.map((x) => x.label)).toContain("Werkboeken");
  });

  it("/shop/uitblinker", () => {
    const c = breadcrumbFor("/shop/uitblinker");
    expect(c.map((x) => x.label)).toEqual(["Lexi", "Shop", "Uitblinker"]);
  });

  it("/winkelmand", () => {
    const c = breadcrumbFor("/winkelmand");
    expect(c.map((x) => x.label)).toEqual(["Lexi", "Winkelmand"]);
    expect(c[c.length - 1].href).toBeNull();
  });

  it("/afrekenen", () => {
    const c = breadcrumbFor("/afrekenen");
    expect(c.map((x) => x.label)).toEqual(["Lexi", "Winkelmand", "Afrekenen"]);
    expect(c[1].href).toBe("/winkelmand");
  });

  it("/word-lid", () => {
    const c = breadcrumbFor("/word-lid");
    expect(c.map((x) => x.label)).toEqual(["Lexi", "Word lid"]);
  });

  it("/hulp", () => {
    const c = breadcrumbFor("/hulp");
    expect(c.map((x) => x.label)).toEqual(["Lexi", "Klantenservice"]);
  });

  it("trailing slash is normalised", () => {
    expect(breadcrumbFor("/shop/").map((x) => x.label)).toEqual(["Lexi", "Shop"]);
  });
});
