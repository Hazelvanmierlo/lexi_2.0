import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { db } from "@/lib/db";
import { Nav } from "@/components/nav/nav";
import { Footer } from "@/components/landing/footer";
import { centsToEuro } from "@/lib/mappings";
import type { DbSubscriptionSku } from "@/lib/db-types";

export const dynamic = "force-dynamic";

const INCLUDED = [
  "Adaptieve quizzen voor alle onderwerpen",
  "Voortgang per kind, per onderwerp",
  "Ouder-dashboard met weekoverzicht",
  "Geen advertenties — volledig kid-veilig",
  "Onbeperkt aantal sessies",
  "Werkt op telefoon, tablet en computer",
];

export default async function WordLidPage() {
  const subs = (await db.subscriptionSku.findMany({
    orderBy: { priceCents: "asc" },
  })) as DbSubscriptionSku[];

  return (
    <>
      <Nav />
      <main id="main-content" className="mx-auto max-w-[1200px] space-y-16 px-5 py-12">
        {/* Heading */}
        <header className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary-ink">
            Lexi-app
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Word lid van Lexi
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-2">
            Toegang tot de adaptieve oefenapp voor groep 1 t/m 8. Eén kind, het hele gezin — kies
            wat past.
          </p>
        </header>

        {/* Tier cards */}
        {subs.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-3">
            {subs.map((s) => (
              <li
                key={s.id}
                data-test="tier-card"
                className="flex flex-col rounded-lexi-lg border border-line bg-card p-6 shadow-lexi-sm"
              >
                <span className="inline-flex w-fit items-center rounded-full bg-sun-soft px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-ink">
                  {s.badge}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold text-ink">{s.title}</h3>
                <p className="mt-3">
                  <span className="font-display text-3xl font-bold text-ink">
                    {centsToEuro(s.priceCents)}
                  </span>
                  <span className="ml-2 text-sm text-ink-2">{s.intervalLabel}</span>
                </p>
                <p className="mt-3 flex-1 text-sm text-ink-2">{s.body}</p>
                <Link
                  href="/signup"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lexi bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Kies dit abonnement <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lexi border border-line bg-card p-6 text-center text-ink-2">
            Abonnementen worden binnenkort getoond.
          </p>
        )}

        {/* Wat is inbegrepen */}
        <section>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Wat is inbegrepen?
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {INCLUDED.map((line) => (
              <li key={line} className="flex items-start gap-2 text-ink">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-ok" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="rounded-lexi-lg border border-primary/30 bg-gradient-to-br from-primary-soft via-sun-soft to-card p-10 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
            14 dagen gratis proberen
          </h2>
          <p className="mx-auto mt-3 max-w-prose text-ink-2">
            Geen creditcard nodig. Stop op elk moment binnen de proefperiode zonder kosten.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-lexi bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Start 14 dagen gratis <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
