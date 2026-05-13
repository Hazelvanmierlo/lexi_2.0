import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { ShopHeader } from "@/components/shop/shop-header";

export default function UitblinkerAanmeldenPage() {
  return (
    <>
      <ShopHeader />
      <main
        id="main-content"
        className="mx-auto flex max-w-[640px] flex-col items-center px-5 py-20 text-center"
      >
        <Construction className="h-12 w-12 text-primary" aria-hidden="true" />
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink">
          Binnenkort beschikbaar
        </h1>
        <p className="mt-3 max-w-prose text-ink-2">
          We zetten de laatste puntjes op de Uitblinker-aanmelding. Wil je als eerste weten wanneer
          we live gaan? Mail dan{" "}
          <a href="mailto:hallo@lexi.kids" className="underline">
            hallo@lexi.kids
          </a>
          .
        </p>
        <Link
          href="/shop/uitblinker"
          className="mt-8 inline-flex items-center gap-2 rounded-lexi border border-line bg-card px-5 py-2.5 text-sm font-medium text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Terug naar Uitblinker
        </Link>
      </main>
    </>
  );
}
