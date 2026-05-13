"use server";

import { redirect } from "next/navigation";
import { currentHousehold } from "@/lib/auth";
import { db } from "@/lib/db";
import { setKidCookie } from "@/lib/kid-cookie";
import { verifyPin } from "@/lib/pin";

export async function verifyPinAction(formData: FormData): Promise<void> {
  const kidId = formData.get("kidId");
  const pin = formData.get("pin");

  if (typeof kidId !== "string" || !kidId) redirect("/kind/picker");
  if (typeof pin !== "string") redirect(`/kind/picker/${kidId}/pin?error=1`);

  const household = await currentHousehold();
  if (!household) redirect("/login?next=/kind");

  const valid = household.kids.some((k) => k.id === kidId);
  if (!valid) redirect("/kind/picker");

  const row = (await db.kid.findUnique({
    where: { id: kidId },
    select: { pinHash: true },
  })) as { pinHash: string | null } | null;
  const storedHash = row?.pinHash;

  // If the PIN was cleared between picker tap and submit, treat as no-PIN
  // and let them in (consistent with the picker action's fast path).
  if (storedHash && !verifyPin(pin, storedHash)) {
    redirect(`/kind/picker/${kidId}/pin?error=1`);
  }

  await setKidCookie(kidId);
  redirect("/kind");
}
