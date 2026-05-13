"use server";

import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { setKidCookie } from "@/lib/kid-cookie";

const SignupInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  kidName: z.string().min(1),
  kidGroep: z.number().int().min(1).max(8),
  plan: z.enum(["monthly", "yearly", "family"]),
  region: z.enum(["NL", "BE"]).default("NL"),
  consent: z.literal(true),
});

const TIER_BY_PLAN = {
  monthly: "MONTHLY",
  yearly: "YEARLY",
  family: "FAMILY",
} as const;

export type SignupResult =
  | { ok: true; householdId: string; kidId: string }
  | { ok: false; error: string };

export async function submitSignup(input: z.infer<typeof SignupInput>): Promise<SignupResult> {
  const parsed = SignupInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input" };
  }
  const data = parsed.data;

  // 1. Create Clerk user.
  const client = await clerkClient();
  let clerkUserId: string;
  try {
    const user = await client.users.createUser({
      emailAddress: [data.email],
      password: data.password,
    });
    clerkUserId = user.id;
  } catch {
    return { ok: false, error: "Kon account niet aanmaken" };
  }

  // 2. DB transaction — Household + Parent + Kid + KidConsent.
  // Stripe customer creation is deferred to a separate spec; we just record
  // trialEndsAt locally.
  const hdrs = await headers();
  const ipAddress =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
  const userAgent = hdrs.get("user-agent") ?? "unknown";

  try {
    const result = await db.$transaction(async (tx) => {
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const household = await tx.household.create({
        data: {
          ownerEmail: data.email,
          region: data.region,
          subscriptionTier: TIER_BY_PLAN[data.plan],
          subscriptionStatus: "TRIALING",
          trialEndsAt,
        },
        select: { id: true },
      });
      const parent = await tx.parent.create({
        data: {
          householdId: household.id,
          clerkUserId,
          email: data.email,
          role: "PARENT",
        },
        select: { id: true },
      });
      const kid = await tx.kid.create({
        data: {
          householdId: household.id,
          name: data.kidName,
          groep: data.kidGroep,
          avatar: {},
        },
        select: { id: true },
      });
      await tx.kidConsent.create({
        data: {
          kidId: kid.id,
          parentEmail: data.email,
          ipAddress,
          userAgent,
        },
      });
      return { householdId: household.id, kidId: kid.id, parentId: parent.id };
    });

    await setKidCookie(result.kidId);
    return { ok: true, householdId: result.householdId, kidId: result.kidId };
  } catch (err) {
    // Roll back Clerk user — never leave a half-created identity.
    try {
      await client.users.deleteUser(clerkUserId);
    } catch {
      // Best-effort cleanup; surfaces in observability if Clerk is down.
    }
    return { ok: false, error: "Kon huishouden niet opslaan" };
  }
}
