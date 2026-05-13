// One-off: swap the seeded demo Clerk user's primary email to a
// `+clerk_test@example.com` pattern so the dev-instance verification flow
// auto-accepts code "424242" without sending real emails.
//
// Run once via:  npx tsx scripts/patch-demo-to-test-email.ts
//
// After this runs:
//   - Sign in with NEW_EMAIL / OLD password
//   - When asked for a verification code, type 424242
//   - Clerk accepts it without sending a real email

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { createClerkClient } from "@clerk/backend";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

const OLD_EMAIL = "demo@lexi.kids";
const NEW_EMAIL = "demo+clerk_test@example.com";
const SEED_PARENT_ID = "seed-parent-demo";

async function main() {
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

  const list = await clerk.users.getUserList({ emailAddress: [OLD_EMAIL] });
  if (list.data.length === 0) {
    console.log(`No Clerk user with ${OLD_EMAIL} — already migrated?`);
    await db.$disconnect();
    return;
  }
  const user = list.data[0];

  const oldEmailObj = user.emailAddresses.find((e) => e.emailAddress === OLD_EMAIL);

  // Add the test email
  const newEmailObj = await clerk.emailAddresses.createEmailAddress({
    userId: user.id,
    emailAddress: NEW_EMAIL,
    verified: true,
    primary: true,
  });
  console.log(`Added + set primary: ${NEW_EMAIL}`);

  // Remove the old email
  if (oldEmailObj) {
    await clerk.emailAddresses.deleteEmailAddress(oldEmailObj.id);
    console.log(`Removed: ${OLD_EMAIL}`);
  }

  // Sync our DB
  await db.parent.update({
    where: { id: SEED_PARENT_ID },
    data: { email: NEW_EMAIL },
  });
  const parent = await db.parent.findUnique({
    where: { id: SEED_PARENT_ID },
    select: { householdId: true },
  });
  if (parent) {
    await db.household.update({
      where: { id: parent.householdId },
      data: { ownerEmail: NEW_EMAIL },
    });
  }

  console.log(`✓ Done. Sign in with: ${NEW_EMAIL} / Lexi-demo-1234! / verification code: 424242`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
