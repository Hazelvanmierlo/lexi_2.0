"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentHousehold } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPin } from "@/lib/pin";

function backToPin(kidId: string, err?: string): never {
  const qs = err ? `?error=${encodeURIComponent(err)}` : "";
  redirect(`/ouder/kind/${kidId}/pin${qs}`);
}

async function assertKidInHousehold(kidId: string): Promise<void> {
  const household = await currentHousehold();
  if (!household) redirect("/login?next=/ouder");
  const valid = household.kids.some((k) => k.id === kidId);
  if (!valid) redirect("/ouder");
}

export async function setPin(formData: FormData): Promise<void> {
  const kidId = formData.get("kidId");
  const pin = formData.get("pin");
  const confirm = formData.get("confirm");

  if (typeof kidId !== "string" || !kidId) redirect("/ouder");
  await assertKidInHousehold(kidId);

  if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) backToPin(kidId, "format");
  if (typeof confirm !== "string" || pin !== confirm) backToPin(kidId, "mismatch");

  const hash = hashPin(pin as string);

  await db.kid.update({
    where: { id: kidId },
    data: { pinHash: hash, pinSetAt: new Date() },
  });

  revalidatePath(`/ouder/kind/${kidId}/pin`);
  revalidatePath("/ouder");
  redirect(`/ouder/kind/${kidId}/pin?ok=set`);
}

export async function clearPin(formData: FormData): Promise<void> {
  const kidId = formData.get("kidId");
  if (typeof kidId !== "string" || !kidId) redirect("/ouder");
  await assertKidInHousehold(kidId);

  await db.kid.update({
    where: { id: kidId },
    data: { pinHash: null, pinSetAt: null },
  });

  revalidatePath(`/ouder/kind/${kidId}/pin`);
  revalidatePath("/ouder");
  redirect(`/ouder/kind/${kidId}/pin?ok=cleared`);
}
