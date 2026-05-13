"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShopHeader } from "@/components/shop/shop-header";
import { TrustSignals } from "@/components/shop/trust-signals";
import { Breadcrumb } from "@/components/shop/breadcrumb";
import { CartSummary } from "@/components/winkelmand/cart-summary";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-context";
import { centsToEuro } from "@/lib/mappings";
import { breadcrumbFor } from "@/lib/breadcrumb";
import { placeOrder } from "./actions";

type Errors = Record<string, string[]>;

export default function AfrekenenPage() {
  const router = useRouter();
  const { items, subtotalCents, hydrated, clear } = useCart();
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      customerName: String(fd.get("customerName") ?? ""),
      customerEmail: String(fd.get("customerEmail") ?? ""),
      shippingLine1: String(fd.get("shippingLine1") ?? ""),
      shippingLine2: String(fd.get("shippingLine2") ?? "") || undefined,
      shippingPostcode: String(fd.get("shippingPostcode") ?? ""),
      shippingCity: String(fd.get("shippingCity") ?? ""),
      items,
    };
    startTransition(async () => {
      const result = await placeOrder(payload);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      // Clear cart on success; navigate to thank-you (or payment redirect).
      clear();
      router.push(result.redirectUrl ?? `/bestelling/${result.orderId}/bedankt`);
    });
  }

  if (hydrated && items.length === 0) {
    return (
      <>
        <ShopHeader />
        <main id="main-content" className="mx-auto max-w-[640px] px-5 py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-ink">Je winkelmand is leeg</h1>
          <p className="mt-3 text-ink-2">
            Voeg eerst werkboeken of een Uitblinker-abonnement toe.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-lexi bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lexi-sm hover:opacity-90"
          >
            Bekijk werkboeken
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <ShopHeader />
      <main id="main-content" className="mx-auto max-w-[1100px] px-5 py-8">
        <Breadcrumb crumbs={breadcrumbFor("/afrekenen")} />
        <nav className="mt-4 mb-6">
          <Link
            href="/winkelmand"
            className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-ink-2 hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Terug naar winkelmand
          </Link>
        </nav>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Afrekenen
        </h1>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_340px]">
          <form
            data-test="checkout-form"
            onSubmit={onSubmit}
            noValidate
            className="space-y-8"
          >
            <section>
              <h2 className="font-display text-lg font-bold text-ink">Stap 1 — Jouw gegevens</h2>
              <div className="mt-4 space-y-3">
                <Input
                  label="Naam"
                  name="customerName"
                  type="text"
                  required
                  autoComplete="name"
                  data-test="field-name"
                />
                <FieldError errors={errors.customerName} />
                <Input
                  label="E-mailadres"
                  name="customerEmail"
                  type="email"
                  required
                  autoComplete="email"
                  data-test="field-email"
                />
                <FieldError errors={errors.customerEmail} />
              </div>
            </section>
            <section>
              <h2 className="font-display text-lg font-bold text-ink">Stap 2 — Bezorgadres</h2>
              <div className="mt-4 space-y-3">
                <Input
                  label="Straat + huisnummer"
                  name="shippingLine1"
                  type="text"
                  required
                  autoComplete="address-line1"
                  data-test="field-line1"
                />
                <FieldError errors={errors.shippingLine1} />
                <Input
                  label="Adresregel 2 (optioneel)"
                  name="shippingLine2"
                  type="text"
                  autoComplete="address-line2"
                />
                <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                  <div>
                    <Input
                      label="Postcode"
                      name="shippingPostcode"
                      type="text"
                      required
                      autoComplete="postal-code"
                      placeholder="1011 AB"
                      data-test="field-postcode"
                    />
                    <FieldError errors={errors.shippingPostcode} />
                  </div>
                  <div>
                    <Input
                      label="Plaats"
                      name="shippingCity"
                      type="text"
                      required
                      autoComplete="address-level2"
                      data-test="field-city"
                    />
                    <FieldError errors={errors.shippingCity} />
                  </div>
                </div>
              </div>
            </section>

            {errors._form ? (
              <p role="alert" className="text-sm text-primary">
                {errors._form.join(", ")}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              data-test="submit-order"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lexi bg-primary px-5 py-3 text-base font-semibold text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 md:w-auto"
            >
              {pending ? "Bezig met plaatsen..." : `Bestelling plaatsen · ${centsToEuro(subtotalCents)}`}
            </button>
            <p className="text-xs text-ink-2">
              Door op &laquo;Bestelling plaatsen&raquo; te klikken ga je akkoord met onze
              voorwaarden. Je ontvangt een bevestiging per e-mail.
            </p>
          </form>

          <div className="space-y-6">
            <CartSummary subtotalCents={subtotalCents} hideCheckoutCta />
            <TrustSignals />
          </div>
        </div>
      </main>
    </>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-primary">
      {errors[0]}
    </p>
  );
}
