import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { centsToEuro } from "@/lib/mappings";
import { UITBLINKER_PRICE_CENTS } from "@/lib/uitblinker";

export function UitblinkerHero() {
  return (
    <Link
      href="/shop/uitblinker"
      className="relative block overflow-hidden rounded-lexi-lg border border-primary/30 bg-gradient-to-br from-primary-soft via-sun-soft to-card p-8 shadow-lexi transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:p-12"
    >
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary-ink">
          Uitblinker
        </p>
      </div>
      <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
        Elke maand een werkboek op maat in je brievenbus.
      </h2>
      <p className="mt-3 max-w-prose text-ink-2 md:text-lg">
        Lexi volgt wat je kind kan én nog moet oefenen, en maakt elke maand een uniek werkboek op
        papier. Vanaf <strong>{centsToEuro(UITBLINKER_PRICE_CENTS)}</strong>/maand — opzegbaar.
      </p>
      <span className="mt-6 inline-flex items-center gap-2 rounded-lexi bg-ink px-5 py-2.5 text-sm font-semibold text-white">
        Hoe werkt het? <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
