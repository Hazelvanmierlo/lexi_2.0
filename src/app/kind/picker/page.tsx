import { redirect } from "next/navigation";
import { currentHousehold } from "@/lib/auth";
import { ageBandFor } from "@/lib/engagement";
import { AvatarTile } from "@/components/kind-picker/avatar-tile";
import { pickKid } from "./actions";

export const dynamic = "force-dynamic";

export default async function PickerPage() {
  const household = await currentHousehold();
  if (!household) redirect("/login?next=/kind");
  if (household.kids.length === 0) redirect("/ouder");

  return (
    <main id="main-content" className="min-h-screen bg-bg px-5 py-12">
      <div className="mx-auto max-w-[900px]">
        <h1 className="mb-8 text-center font-display text-3xl font-bold text-ink">
          Wie speelt er?
        </h1>
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {household.kids.map((kid) => (
            <li key={kid.id}>
              <form action={pickKid}>
                <input type="hidden" name="kidId" value={kid.id} />
                <AvatarTile
                  name={kid.name}
                  groep={kid.groep}
                  band={ageBandFor(kid.groep)}
                />
              </form>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
