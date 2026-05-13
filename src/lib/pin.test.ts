import { describe, it, expect } from "vitest";
import { hashPin, verifyPin } from "./pin";

describe("pin hash/verify", () => {
  it("hashPin returns the N:salt:hash format", () => {
    const encoded = hashPin("1234");
    const parts = encoded.split(":");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe("16384");
    // salt and hash are base64; should decode to non-empty buffers
    expect(Buffer.from(parts[1], "base64").length).toBeGreaterThan(0);
    expect(Buffer.from(parts[2], "base64").length).toBe(32);
  });

  it("round-trip: verifyPin accepts the correct PIN", () => {
    const encoded = hashPin("4271");
    expect(verifyPin("4271", encoded)).toBe(true);
  });

  it("verifyPin rejects the wrong PIN", () => {
    const encoded = hashPin("1234");
    expect(verifyPin("1235", encoded)).toBe(false);
    expect(verifyPin("0000", encoded)).toBe(false);
    expect(verifyPin("4321", encoded)).toBe(false);
  });

  it("verifyPin rejects malformed encoded strings", () => {
    expect(verifyPin("1234", "")).toBe(false);
    expect(verifyPin("1234", "not-a-hash")).toBe(false);
    expect(verifyPin("1234", "16384:onlytwo")).toBe(false);
    expect(verifyPin("1234", "16384:a:b:c")).toBe(false);
    expect(verifyPin("1234", "notanumber:abc:def")).toBe(false);
  });

  it("hashPin rejects non-4-digit input", () => {
    expect(() => hashPin("123")).toThrow();
    expect(() => hashPin("12345")).toThrow();
    expect(() => hashPin("12a4")).toThrow();
    expect(() => hashPin("")).toThrow();
    expect(() => hashPin("abcd")).toThrow();
  });

  it("verifyPin rejects non-4-digit PIN even with valid hash", () => {
    const encoded = hashPin("1234");
    expect(verifyPin("123", encoded)).toBe(false);
    expect(verifyPin("12345", encoded)).toBe(false);
    expect(verifyPin("12a4", encoded)).toBe(false);
    expect(verifyPin("", encoded)).toBe(false);
  });

  it("produces a distinct hash for each call (random salt)", () => {
    const a = hashPin("1234");
    const b = hashPin("1234");
    expect(a).not.toBe(b);
    expect(verifyPin("1234", a)).toBe(true);
    expect(verifyPin("1234", b)).toBe(true);
  });
});
