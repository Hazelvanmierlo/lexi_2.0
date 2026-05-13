import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { currentHousehold } from "@/lib/auth";
import { PinPad } from "@/components/kind-picker/pin-pad";
import { verifyPinAction } from "./actions";

export const dynamic = "force-dynamic";

type Params = { kidId: string };
type SearchParams = { error?: string };

export default async function KidPinEntryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { kidId } = await params;
  const { error } = await searchParams;

  const household = await currentHousehold();
  if (!household) redirect("/login?next=/kind");

  const kid = household.kids.find((k) => k.id === kidId);
  if (!kid) redirect("/kind/picker");

  return (
    <main id="main-content" className="min-h-screen bg-bg px-5 py-12">
      <div className="mx-auto max-w-[480px]">
        <Link
          href="/kind/picker"
          className="mb-6 inline-flex items-center gap-1 text-sm text-ink-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Terug
        </Link>

        <h1 className="mb-2 text-center font-display text-3xl font-bold text-ink">
          PIN van {kid.name}
        </h1>
        <p className="mb-8 text-center text-sm text-ink-2">
          Toets de viercijferige code in om te beginnen.
        </p>

        {error === "1" && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-2 rounded-lexi border border-sun bg-sun-soft px-4 py-3 text-sm text-ink"
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <span>Foute PIN. Probeer opnieuw.</span>
          </div>
        )}

        <form action={verifyPinAction} className="rounded-lexi-lg border border-line bg-card p-6 shadow-lexi">
          <input type="hidden" name="kidId" value={kidId} />
          <PinPad name="pin" />
        </form>
      </div>
    </main>
  );
}
