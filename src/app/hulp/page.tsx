import { Mail } from "lucide-react";
import { ShopHeader } from "@/components/shop/shop-header";
import { Breadcrumb } from "@/components/shop/breadcrumb";
import { breadcrumbFor } from "@/lib/breadcrumb";

export const dynamic = "force-static";

export default function HulpPage() {
  return (
    <>
      <ShopHeader />
      <main
        id="main-content"
        className="mx-auto max-w-[720px] space-y-6 px-5 py-8"
      >
        <Breadcrumb crumbs={breadcrumbFor("/hulp")} />
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Klantenservice
        </h1>
        <p className="text-ink-2">
          Heb je een vraag over een bestelling, je abonnement of een Lexi-werkboek? We helpen je
          graag verder. Onze klantenservice komt binnenkort online — tot die tijd zijn we
          bereikbaar via e-mail.
        </p>
        <a
          href="mailto:hallo@lexi.kids"
          className="inline-flex items-center gap-2 rounded-lexi bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          Mail hallo@lexi.kids
        </a>
        <section className="rounded-lexi border border-line bg-card p-5">
          <h2 className="font-display text-lg font-bold text-ink">Vaak gestelde vragen</h2>
          <dl className="mt-4 space-y-4 text-sm text-ink">
            <div>
              <dt className="font-medium">Wanneer wordt mijn bestelling geleverd?</dt>
              <dd className="mt-1 text-ink-2">
                Voor 22:00 besteld? Dan ligt je werkboek de volgende werkdag in huis.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Hoe pauzeer of stop ik mijn Uitblinker-abonnement?</dt>
              <dd className="mt-1 text-ink-2">
                Log in op je oudershboard en kies &laquo;Beheer abonnement&raquo;.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Werkt Lexi ook op de tablet of telefoon?</dt>
              <dd className="mt-1 text-ink-2">
                Ja — de Lexi-app werkt op tablet, telefoon en computer. Een installatie is niet
                nodig.
              </dd>
            </div>
          </dl>
        </section>
      </main>
    </>
  );
}
