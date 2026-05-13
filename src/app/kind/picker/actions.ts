"use server";

import { redirect } from "next/navigation";
import { currentHousehold } from "@/lib/auth";
import { db } from "@/lib/db";
import { setKidCookie } from "@/lib/kid-cookie";

export async function pickKid(formData: FormData): Promise<void> {
  const kidId = formData.get("kidId");
  if (typeof kidId !== "string" || !kidId) redirect("/kind/picker");

  const household = await currentHousehold();
  if (!household) redirect("/login?next=/kind");

  const valid = household.kids.some((k) => k.id === kidId);
  if (!valid) redirect("/kind/picker");

  // If this kid is PIN-protected, divert to the PIN entry page instead of
  // setting the cookie directly. The hash itself never leaves the server.
  const row = (await db.kid.findUnique({
    where: { id: kidId },
    select: { pinHash: true },
  })) as { pinHash: string | null } | null;
  if (row?.pinHash) {
    redirect(`/kind/picker/${kidId}/pin`);
  }

  await setKidCookie(kidId);
  redirect("/kind");
}
