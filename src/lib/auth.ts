import { auth as clerkAuth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readKidCookie } from "@/lib/kid-cookie";

export type ParentRow = {
  id: string;
  householdId: string;
  clerkUserId: string;
  email: string;
  role: "PARENT" | "ADMIN";
};

export type KidRow = {
  id: string;
  householdId: string;
  name: string;
  groep: number;
  avatar: unknown;
  coins: number;
};

export type HouseholdWithKids = {
  id: string;
  region: "NL" | "BE";
  kids: KidRow[];
};

/** Returns the DB Parent row for the current Clerk session, or null. */
export async function currentParent(): Promise<ParentRow | null> {
  const { userId } = await clerkAuth();
  if (!userId) return null;
  return (await db.parent.findUnique({
    where: { clerkUserId: userId },
    select: {
      id: true, householdId: true, clerkUserId: true, email: true, role: true,
    },
  })) as ParentRow | null;
}

/** Returns the household for the current parent, including all kids. */
export async function currentHousehold(): Promise<HouseholdWithKids | null> {
  const parent = await currentParent();
  if (!parent) return null;
  return (await db.household.findUnique({
    where: { id: parent.householdId },
    select: {
      id: true,
      region: true,
      kids: {
        select: {
          id: true, householdId: true, name: true, groep: true,
          avatar: true, coins: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })) as HouseholdWithKids | null;
}

/** Returns the picked kid if valid + in current household, else null. */
export async function currentKid(): Promise<KidRow | null> {
  const household = await currentHousehold();
  if (!household) return null;
  const pickedId = await readKidCookie();
  if (!pickedId) return null;
  return household.kids.find((k) => k.id === pickedId) ?? null;
}

/** Redirects to /ouder if not admin; returns the parent row otherwise. */
export async function requireAdmin(): Promise<ParentRow> {
  const parent = await currentParent();
  if (!parent || parent.role !== "ADMIN") redirect("/ouder");
  return parent;
}
