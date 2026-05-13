// Per-kid 4-digit PIN hashing for the profile picker.
//
// Storage format: `N:salt_b64:hash_b64`
//   - N: scrypt cost parameter (default 16384 = 2^14)
//   - salt: 16 random bytes, base64
//   - hash: 32 bytes of scrypt output, base64
//
// Uses node:crypto.scryptSync so we don't add a dependency. N=16384 is fast
// enough for a request-time verify (a few ms) but slow enough that brute
// forcing 10_000 candidates offline against a leaked hash is non-trivial.
//
// Note: this is per-kid PIN protection inside an already-authenticated
// household, not a primary auth factor. A leaked hash leaks the PIN; a
// leaked PIN only gates access from within the household.

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const N = 16384; // 2^14 — fast enough for a PIN, slow enough vs brute force
const KEYLEN = 32;
const SALTLEN = 16;

export function hashPin(pin: string): string {
  if (!/^\d{4}$/.test(pin)) throw new Error("PIN must be exactly 4 digits");
  const salt = randomBytes(SALTLEN);
  const hash = scryptSync(pin, salt, KEYLEN, { N });
  return `${N}:${salt.toString("base64")}:${hash.toString("base64")}`;
}

export function verifyPin(pin: string, encoded: string): boolean {
  if (!/^\d{4}$/.test(pin)) return false;
  const parts = encoded.split(":");
  if (parts.length !== 3) return false;
  const [nStr, saltB64, hashB64] = parts;
  const n = parseInt(nStr, 10);
  if (!Number.isFinite(n)) return false;
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  if (expected.length === 0 || salt.length === 0) return false;
  let candidate: Buffer;
  try {
    candidate = scryptSync(pin, salt, expected.length, { N: n });
  } catch {
    return false;
  }
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
