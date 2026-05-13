import { redirect } from "next/navigation";
import { currentHousehold } from "@/lib/auth";
import { db } from "@/lib/db";
import { ageBandFor } from "@/lib/engagement";
import { AvatarTile } from "@/components/kind-picker/avatar-tile";
import { pickKid } from "./actions";

export const dynamic = "force-dynamic";

export default async function PickerPage() {
  const household = await currentHousehold();
  if (!household) redirect("/login?next=/kind");
  if (household.kids.length === 0) redirect("/ouder");

  // Look up which kids have a PIN set, without leaking the hash to the client.
  // `currentHousehold()` doesn't expose pinHash; do a focused secondary query.
  const pinRows = (await db.kid.findMany({
    where: { householdId: household.id },
    select: { id: true, pinHash: true },
  })) as Array<{ id: string; pinHash: string | null }>;
  const pinSetById = new Map(pinRows.map((r) => [r.id, Boolean(r.pinHash)]));

  return (
    <main
      id="main-content"
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[oklch(97%_0.03_60)] via-bg to-bg px-5 py-14 md:py-20"
    >
      {/* Soft dot texture for warmth without noise. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, oklch(60% 0.02 60 / 0.18) 1px, transparent 1.5px)",
          backgroundSize: "26px 26px",
        }}
      />

      <div className="mx-auto max-w-[1100px]">
        <div className="mb-12 text-center md:mb-16">
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Wie speelt er?
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.22em] text-ink-2">
            Tik op je foto om te beginnen
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-8 md:gap-y-14 lg:grid-cols-4">
          {household.kids.map((kid) => (
            <li key={kid.id} className="flex justify-center">
              <form action={pickKid} className="w-full max-w-[220px]">
                <input type="hidden" name="kidId" value={kid.id} />
                <AvatarTile
                  kidId={kid.id}
                  name={kid.name}
                  groep={kid.groep}
                  band={ageBandFor(kid.groep)}
                  pinSet={pinSetById.get(kid.id) ?? false}
                />
              </form>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
