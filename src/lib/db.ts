// Prisma client singleton — survives Next.js dev HMR by stashing the instance
// on globalThis. Always import the client from here, never from the generated
// folder directly.
//
// Prisma 7 requires a driver adapter rather than a URL on the client; we use
// the official Postgres adapter. The connection URL itself is read from
// process.env.DATABASE_URL inside the adapter.

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makeClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local — see docs/backend.md.",
    );
  }
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
