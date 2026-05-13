import "@testing-library/jest-dom/vitest";
import { config as loadEnv } from "dotenv";
import path from "node:path";

// Load .env.local so DB-backed tests can reach Supabase. We load .env.local
// first (developer-specific overrides) then fall back to .env. Variables that
// already exist in process.env are not overwritten (CI parity).
loadEnv({ path: path.resolve(__dirname, ".env.local") });
loadEnv({ path: path.resolve(__dirname, ".env") });

// Default secrets for tests that exercise modules requiring them. Real values
// live in .env.local for local dev; CI / contributors without those vars still
// get deterministic test runs.
if (!process.env.COOKIE_SECRET) {
  process.env.COOKIE_SECRET = Buffer.alloc(32, 1).toString("base64");
}
