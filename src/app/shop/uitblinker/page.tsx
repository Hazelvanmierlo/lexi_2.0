import Link from "next/link";
import { ArrowRight, Mail, BookOpen, PenLine } from "lucide-react";
import { ShopHeader } from "@/components/shop/shop-header";
import { UitblinkerFeatureGrid } from "@/components/shop/uitblinker-feature-grid";
import { MascotImage } from "@/components/ui/mascot";
import { centsToEuro } from "@/lib/mappings";
import { UITBLINKER_PRICE_CENTS, UITBLINKER_INTERVAL_LABEL } from "@/lib/uitblinker";

const STEPS = [
  {
    n: "1",
    title: "Kies een onderwerp",
    body: "Taal, Rekenen of Begrijpend Lezen. Je kunt later altijd wisselen.",
  },
  {
    n: "2",
    title: "Lexi volgt je kind",
    body: "Tijdens het oefenen in de app houdt Lexi bij wat je kind al kan en waar het nog stagneert.",
  },
  {
    n: "3",
    title: "Elke maand een uniek boek",
    body: "Wij printen en versturen een persoonlijk werkboek. Bij jou in de bus binnen 5 werkdagen.",
  },
];

const FAQ = [
  {
    q: "Wanneer komt het eerste boek?",
    a: "Binnen 7 werkdagen na aanmelden. Daarna elke maand op dezelfde dag.",
  },
  {
    q: "Kan ik tussendoor van onderwerp wisselen?",
    a: "Ja. Via je ouder-dashboard kun je het volgende boek op een ander onderwerp instellen.",
  },
  {
    q: "Is een Lexi-abonnement nodig?",
    a: "Niet verplicht, maar wel aangeraden — het werkboek wordt sterker aangepast als Lexi ziet wat je kind oefent.",
  },
  {
    q: "Hoe zeg ik op?",
    a: "Met één klik in je ouder-dashboard. Je betaalt nooit voor een boek dat nog niet verstuurd is.",
  },
];

export default function UitblinkerLandingPage() {
  return (
    <>
      <ShopHeader />
      <main id="main-content" className="mx-auto max-w-[1100px] space-y-20 px-5 py-12">
        {/* Breadcrumb */}
        <nav className="font-mono text-xs uppercase tracking-wider text-ink-2">
          <Link href="/shop" className="hover:text-ink">
            Shop
          </Link>
          <span> / Uitblinker</span>
        </nav>

        {/* Hero */}
        <section className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary-ink">
              Uitblinker
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
              Een werkboek op maat. Elke maand in je brievenbus.
            </h1>
            <p className="mt-4 max-w-prose text-lg text-ink-2">
              Lexi volgt wat je kind kan én nog moet oefenen, en maakt elke maand een uniek werkboek
              op papier. Geen scherm, wel gericht oefenen.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/shop/uitblinker/aanmelden"
                className="inline-flex items-center gap-2 rounded-lexi bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Aanmelden vanaf {centsToEuro(UITBLINKER_PRICE_CENTS)}/maand
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <span className="inline-flex items-center text-sm text-ink-2">
                {UITBLINKER_INTERVAL_LABEL}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <MascotImage style="bot" age="hero" size={280} decorative />
          </div>
        </section>

        {/* Hoe werkt het */}
        <section>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Hoe werkt het?
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="rounded-lexi-lg border border-line bg-card p-6 shadow-lexi-sm"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft font-display text-lg font-bold text-primary-ink">
                  {s.n}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Waarom */}
        <section>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Waarom Uitblinker?
          </h2>
          <div className="mt-6">
            <UitblinkerFeatureGrid />
          </div>
        </section>

        {/* Wat ontvang je */}
        <section className="grid items-center gap-10 md:grid-cols-2">
          <div className="rounded-lexi-lg border border-line bg-gradient-to-br from-sun-soft to-primary-soft p-10">
            <div className="flex items-center gap-4 text-ink">
              <BookOpen className="h-10 w-10" aria-hidden="true" />
              <PenLine className="h-10 w-10" aria-hidden="true" />
              <Mail className="h-10 w-10" aria-hidden="true" />
            </div>
            <p className="mt-6 font-display text-xl font-bold text-ink">Uitblinker pakket</p>
            <p className="mt-1 text-sm text-ink-2">Elke maand opnieuw, alleen voor jouw kind.</p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
              Wat ontvang je?
            </h2>
            <ul className="mt-4 space-y-3 text-ink">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Een uniek werkboek van ~32 pagina&apos;s, volledig in kleur.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Stevig papier, kindvriendelijk lettertype, lekker formaat (A5).</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>QR-codes naar uitlegvideo&apos;s wanneer je kind vastloopt.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Een briefje van Lexi met wat dit boek deze maand oefent.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Veelgestelde vragen
          </h2>
          <ul className="mt-6 divide-y divide-line rounded-lexi-lg border border-line bg-card">
            {FAQ.map((item) => (
              <li key={item.q}>
                <details className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base font-bold text-ink">
                    {item.q}
                    <span
                      className="ml-4 text-ink-2 transition group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-2">{item.a}</p>
                </details>
              </li>
            ))}
          </ul>
        </section>

        {/* Bottom CTA */}
        <section className="rounded-lexi-lg border border-primary/30 bg-gradient-to-br from-primary-soft via-sun-soft to-card p-10 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Probeer Uitblinker
          </h2>
          <p className="mx-auto mt-3 max-w-prose text-ink-2">
            Vanaf {centsToEuro(UITBLINKER_PRICE_CENTS)}/maand. Geen contract. Stop wanneer je wilt.
          </p>
          <Link
            href="/shop/uitblinker/aanmelden"
            className="mt-6 inline-flex items-center gap-2 rounded-lexi bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Aanmelden <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </main>
    </>
  );
}
