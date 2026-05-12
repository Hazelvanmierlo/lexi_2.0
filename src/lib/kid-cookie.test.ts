import { describe, it, expect, beforeAll } from "vitest";
import { signKidId, verifyKidId } from "./kid-cookie";

beforeAll(() => {
  process.env.COOKIE_SECRET = "test-secret-thirty-two-bytes-of-base64===";
});

describe("kid-cookie sign/verify", () => {
  it("round-trips a kidId", () => {
    const token = signKidId("kid_123", new Date("2026-05-12T10:00:00Z"));
    const result = verifyKidId(token, new Date("2026-05-12T10:00:00Z"));
    expect(result).toBe("kid_123");
  });

  it("rejects tampered tokens", () => {
    const token = signKidId("kid_123", new Date("2026-05-12T10:00:00Z"));
    const tampered = token.slice(0, -2) + "AA";
    expect(verifyKidId(tampered, new Date("2026-05-12T10:00:00Z"))).toBeNull();
  });

  it("rejects expired tokens (>8h old)", () => {
    const token = signKidId("kid_123", new Date("2026-05-12T10:00:00Z"));
    const result = verifyKidId(token, new Date("2026-05-12T18:01:00Z"));
    expect(result).toBeNull();
  });

  it("accepts tokens within 8h sliding window", () => {
    const token = signKidId("kid_123", new Date("2026-05-12T10:00:00Z"));
    const result = verifyKidId(token, new Date("2026-05-12T17:59:00Z"));
    expect(result).toBe("kid_123");
  });

  it("rejects malformed tokens", () => {
    expect(verifyKidId("not-a-token", new Date())).toBeNull();
    expect(verifyKidId("", new Date())).toBeNull();
    expect(verifyKidId("a.b", new Date())).toBeNull();
  });
});
