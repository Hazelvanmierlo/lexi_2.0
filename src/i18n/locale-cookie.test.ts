import { describe, expect, it } from "vitest";
import { isValidLocale, DEFAULT_LOCALE, LOCALES } from "./locale-cookie";

describe("locale-cookie", () => {
  it("DEFAULT_LOCALE is nl-NL", () => {
    expect(DEFAULT_LOCALE).toBe("nl-NL");
  });

  it("LOCALES contains nl-NL and nl-BE", () => {
    expect(LOCALES).toEqual(["nl-NL", "nl-BE"]);
  });

  it("isValidLocale accepts nl-NL and nl-BE", () => {
    expect(isValidLocale("nl-NL")).toBe(true);
    expect(isValidLocale("nl-BE")).toBe(true);
  });

  it("isValidLocale rejects other strings", () => {
    expect(isValidLocale("en")).toBe(false);
    expect(isValidLocale("nl")).toBe(false);
    expect(isValidLocale("")).toBe(false);
    expect(isValidLocale(undefined)).toBe(false);
  });
});
