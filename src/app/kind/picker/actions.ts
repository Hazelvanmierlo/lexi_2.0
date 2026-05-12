"use server";

import { redirect } from "next/navigation";
import { currentHousehold } from "@/lib/auth";
import { setKidCookie } from "@/lib/kid-cookie";

export async function pickKid(formData: FormData): Promise<void> {
  const kidId = formData.get("kidId");
  if (typeof kidId !== "string" || !kidId) redirect("/kind/picker");

  const household = await currentHousehold();
  if (!household) redirect("/login?next=/kind");

  const valid = household.kids.some((k) => k.id === kidId);
  if (!valid) redirect("/kind/picker");

  await setKidCookie(kidId);
  redirect("/kind");
}
