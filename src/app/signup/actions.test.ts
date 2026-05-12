import { describe, it, expect, vi, beforeEach } from "vitest";

const fakeClerkClient = {
  users: {
    createUser: vi.fn(async ({ emailAddress }: { emailAddress: string[] }) => ({
      id: `clerk_user_${emailAddress[0]}`,
    })),
    deleteUser: vi.fn(async () => undefined),
  },
};

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: async () => fakeClerkClient,
}));

vi.mock("next/headers", () => ({
  headers: async () => new Map([
    ["x-forwarded-for", "1.2.3.4"],
    ["user-agent", "vitest"],
  ]),
  cookies: async () => ({ set: vi.fn(), get: vi.fn(), delete: vi.fn() }),
}));

import { submitSignup } from "./actions";
import { db } from "@/lib/db";

describe("submitSignup", () => {
  const email = `test+${Date.now()}@lexi.test`;

  beforeEach(async () => {
    vi.clearAllMocks();
    await db.kid.deleteMany({ where: { household: { ownerEmail: email } } });
    await db.parent.deleteMany({ where: { email } });
    await db.household.deleteMany({ where: { ownerEmail: email } });
  });

  it("creates Household + Parent + Kid + KidConsent in one transaction", async () => {
    const result = await submitSignup({
      email,
      password: "supersecret1",
      kidName: "Pim",
      kidGroep: 3,
      plan: "monthly",
      region: "NL",
      consent: true,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const hh = await db.household.findUnique({ where: { id: result.householdId } });
    expect(hh).not.toBeNull();
    expect(hh!.subscriptionStatus).toBe("TRIALING");

    const parents = await db.parent.findMany({ where: { householdId: result.householdId } });
    expect(parents).toHaveLength(1);
    expect(parents[0].role).toBe("PARENT");

    const kids = await db.kid.findMany({ where: { householdId: result.householdId } });
    expect(kids).toHaveLength(1);
    expect(kids[0].name).toBe("Pim");
    expect(kids[0].groep).toBe(3);

    const consents = await db.kidConsent.findMany({ where: { kidId: result.kidId } });
    expect(consents).toHaveLength(1);
    expect(consents[0].ipAddress).toBe("1.2.3.4");
  });
});
