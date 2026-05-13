import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { currentHousehold } from "@/lib/auth";
import { db } from "@/lib/db";
import { Nav } from "@/components/nav/nav";
import { Footer } from "@/components/landing/footer";
import { setPin, clearPin } from "./actions";

export const dynamic = "force-dynamic";

type Params = { kidId: string };
type SearchParams = { error?: string; ok?: string };

const NL_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

function formatDate(d: Date | null | undefined): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("nl-NL", NL_DATE).format(d);
}

export default async function ParentKidPinPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { kidId } = await params;
  const { error, ok } = await searchParams;

  const household = await currentHousehold();
  if (!household) redirect("/login?next=/ouder");

  const kid = household.kids.find((k) => k.id === kidId);
  if (!kid) redirect("/ouder");

  const row = (await db.kid.findUnique({
    where: { id: kidId },
    select: { pinHash: true, pinSetAt: true },
  })) as { pinHash: string | null; pinSetAt: Date | null } | null;

  const isSet = Boolean(row?.pinHash);
  const sinceLabel = isSet && row?.pinSetAt
    ? `Ingesteld op ${formatDate(row.pinSetAt)}`
    : "Niet ingesteld";

  return (
    <>
      <Nav />
      <main id="main-content" className="bg-bg-2">
        <div className="mx-auto max-w-[640px] px-5 py-10 md:py-16">
          <Link
            href="/ouder"
            className="mb-6 inline-flex items-center gap-1 text-sm text-ink-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Terug naar overzicht
          </Link>

          <header className="mb-6">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-3">
              PIN beheren
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
              PIN van {kid.name}
            </h1>
            <p className="mt-2 text-sm text-ink-2">
              Een PIN voorkomt dat broers of zussen per ongeluk inloggen op het profiel van {kid.name}.
            </p>
          </header>

          {/* Feedback banners */}
          {error === "format" && (
            <Banner tone="danger" icon={<AlertCircle className="h-4 w-4" />}>
              De PIN moet uit precies 4 cijfers bestaan.
            </Banner>
          )}
          {error === "mismatch" && (
            <Banner tone="danger" icon={<AlertCircle className="h-4 w-4" />}>
              De twee ingevoerde codes komen niet overeen.
            </Banner>
          )}
          {ok === "set" && (
            <Banner tone="ok" icon={<CheckCircle2 className="h-4 w-4" />}>
              PIN opgeslagen.
            </Banner>
          )}
          {ok === "cleared" && (
            <Banner tone="ok" icon={<CheckCircle2 className="h-4 w-4" />}>
              PIN verwijderd.
            </Banner>
          )}

          {/* Status */}
          <section className="mb-6 flex items-center gap-3 rounded-lexi-lg border border-line bg-card p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-base font-bold text-ink">
                {isSet ? "PIN ingesteld" : "Geen PIN"}
              </p>
              <p className="text-sm text-ink-2">{sinceLabel}</p>
            </div>
          </section>

          {/* Set / change form */}
          <section className="mb-6 rounded-lexi-lg border border-line bg-card p-6 shadow-lexi">
            <h2 className="font-display text-lg font-bold text-ink">
              {isSet ? "Wijzig PIN" : "Stel PIN in"}
            </h2>
            <p className="mt-1 text-sm text-ink-2">
              Vier cijfers. Schrijf hem op een veilige plek — je kunt hem later wijzigen of wissen.
            </p>
            <form action={setPin} className="mt-4 flex flex-col gap-4">
              <input type="hidden" name="kidId" value={kidId} />

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">Nieuwe PIN</span>
                <input
                  type="password"
                  name="pin"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  minLength={4}
                  autoComplete="new-password"
                  required
                  className="w-32 rounded-lexi border border-line bg-bg px-3 py-2 font-mono text-lg tracking-widest text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">Bevestig PIN</span>
                <input
                  type="password"
                  name="confirm"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  minLength={4}
                  autoComplete="new-password"
                  required
                  className="w-32 rounded-lexi border border-line bg-bg px-3 py-2 font-mono text-lg tracking-widest text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                />
              </label>

              <button
                type="submit"
                className="inline-flex w-fit items-center rounded-lexi bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {isSet ? "Wijzig PIN" : "Stel PIN in"}
              </button>
            </form>
          </section>

          {/* Clear form (only if set) */}
          {isSet && (
            <section className="rounded-lexi-lg border border-line bg-card p-6">
              <h2 className="font-display text-lg font-bold text-ink">Wis PIN</h2>
              <p className="mt-1 text-sm text-ink-2">
                Hierna kan iedereen in het huishouden weer direct op {kid.name}&apos;s tegel tikken.
              </p>
              <form action={clearPin} className="mt-4">
                <input type="hidden" name="kidId" value={kidId} />
                <button
                  type="submit"
                  className="inline-flex w-fit items-center rounded-lexi border border-line bg-card px-4 py-2 text-sm font-medium text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Wis PIN
                </button>
              </form>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Banner({
  tone,
  icon,
  children,
}: {
  tone: "ok" | "danger";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const cls =
    tone === "ok"
      ? "border-ok bg-ok-soft text-ink"
      : "border-sun bg-sun-soft text-ink";
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`mb-6 flex items-center gap-2 rounded-lexi border px-4 py-3 text-sm ${cls}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
