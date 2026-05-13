// One-off operational script: creates a Clerk user for the seeded demo
// parent and links Parent.clerkUserId so the demo account works with
// AUTH_ENABLED=true. Idempotent: skips if the Clerk user already exists.

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClerkClient } from "@clerk/backend";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

const SEED_PARENT_ID = "seed-parent-demo";
const SEED_EMAIL = "demo@lexi.kids";
const SEED_PASSWORD = "Lexi-demo-1234!";

async function main() {
  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
  });

  let userId: string;
  const existing = await clerk.users.getUserList({ emailAddress: [SEED_EMAIL] });
  if (existing.data.length > 0) {
    userId = existing.data[0].id;
    console.log(`Clerk user already exists: ${userId}`);
  } else {
    const created = await clerk.users.createUser({
      emailAddress: [SEED_EMAIL],
      password: SEED_PASSWORD,
    });
    userId = created.id;
    console.log(`Created Clerk user: ${userId}`);
  }

  await db.parent.update({
    where: { id: SEED_PARENT_ID },
    data: { clerkUserId: userId, role: "ADMIN", email: SEED_EMAIL },
  });
  console.log(`Linked Parent ${SEED_PARENT_ID} → Clerk ${userId} (role ADMIN)`);

  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
