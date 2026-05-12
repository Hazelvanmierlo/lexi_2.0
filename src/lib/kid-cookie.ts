import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_TTL_MS = 8 * 60 * 60 * 1000; // 8h sliding window
export const KID_COOKIE_NAME = "lexi_pk";

function secret(): Buffer {
  const s = process.env.COOKIE_SECRET;
  if (!s) throw new Error("COOKIE_SECRET is not set");
  return Buffer.from(s, "base64");
}

function hmac(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Returns `<kidId>.<issuedAtMs>.<hmac>` (base64url, dot-separated). */
export function signKidId(kidId: string, now: Date): string {
  const issuedAt = now.getTime().toString(36);
  const payload = `${kidId}.${issuedAt}`;
  return `${payload}.${hmac(payload)}`;
}

/** Returns kidId if valid + within TTL; null otherwise. */
export function verifyKidId(token: string, now: Date): string | null {
  if (typeof token !== "string" || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [kidId, issuedAt, mac] = parts;
  const expected = hmac(`${kidId}.${issuedAt}`);
  const macBuf = Buffer.from(mac, "base64url");
  const expBuf = Buffer.from(expected, "base64url");
  if (macBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(macBuf, expBuf)) return null;
  const issuedAtMs = parseInt(issuedAt, 36);
  if (!Number.isFinite(issuedAtMs)) return null;
  if (now.getTime() - issuedAtMs > COOKIE_TTL_MS) return null;
  return kidId;
}

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: COOKIE_TTL_MS / 1000,
};

export async function setKidCookie(kidId: string, now: Date = new Date()): Promise<void> {
  const jar = await cookies();
  jar.set(KID_COOKIE_NAME, signKidId(kidId, now), COOKIE_OPTS);
}

export async function readKidCookie(now: Date = new Date()): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(KID_COOKIE_NAME)?.value;
  if (!raw) return null;
  return verifyKidId(raw, now);
}

export async function clearKidCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(KID_COOKIE_NAME);
}
