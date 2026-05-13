"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ShopHeader } from "@/components/shop/shop-header";
import { Input } from "@/components/ui/input";
import { RadioCard } from "@/components/ui/radio-card";
import { useCart } from "@/lib/cart-context";
import { UITBLINKER_PRICE_CENTS, UITBLINKER_INTERVAL_LABEL } from "@/lib/uitblinker";
import { centsToEuro } from "@/lib/mappings";
import { UitblinkerItemSchema, type Subject } from "@/lib/cart";

type Errors = Record<string, string>;

const SUBJECT_OPTIONS: { value: Subject; label: string; description: string }[] = [
  { value: "TAAL", label: "Taal", description: "Spelling, woordenschat, grammatica" },
  { value: "REKENEN", label: "Rekenen", description: "Sommen, breuken, redactie" },
  { value: "LEZEN", label: "Begrijpend Lezen", description: "Tekstbegrip, woordbetekenis" },
];

export default function UitblinkerAanmeldenPage() {
  const router = useRouter();
  const { addUitblinker } = useCart();
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const kidName = String(fd.get("kidName") ?? "").trim();
    const subject = String(fd.get("subject") ?? "") as Subject;
    const shipName = String(fd.get("shipName") ?? "").trim();
    const shipLine1 = String(fd.get("shipLine1") ?? "").trim();
    const shipPostcode = String(fd.get("shipPostcode") ?? "").trim();
    const shipCity = String(fd.get("shipCity") ?? "").trim();

    const candidate = {
      kind: "uitblinker" as const,
      kidName,
      subject,
      priceCents: UITBLINKER_PRICE_CENTS,
      shipping: { name: shipName, line1: shipLine1, postcode: shipPostcode, city: shipCity },
    };

    const parsed = UitblinkerItemSchema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        const key =
          path === "kidName"
            ? "kidName"
            : path === "subject"
              ? "subject"
              : path === "shipping.name"
                ? "shipName"
                : path === "shipping.line1"
                  ? "shipLine1"
                  : path === "shipping.postcode"
                    ? "shipPostcode"
                    : path === "shipping.city"
                      ? "shipCity"
                      : path;
        if (!fieldErrors[key]) fieldErrors[key] = friendlyMessage(key, issue.message);
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    startTransition(() => {
      addUitblinker({
        kidName: parsed.data.kidName,
        subject: parsed.data.subject,
        priceCents: parsed.data.priceCents,
        shipping: parsed.data.shipping,
      });
      router.push("/winkelmand");
    });
  }

  return (
    <>
      <ShopHeader />
      <main
        id="main-content"
        className="mx-auto max-w-[720px] px-5 py-10"
      >
        <nav className="mb-6">
          <Link
            href="/shop/uitblinker"
            className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-ink-2 hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Terug naar Uitblinker
          </Link>
        </nav>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Meld je aan voor Uitblinker
        </h1>
        <p className="mt-3 text-ink-2">
          {centsToEuro(UITBLINKER_PRICE_CENTS)} per maand — {UITBLINKER_INTERVAL_LABEL}.
        </p>

        <form
          onSubmit={onSubmit}
          noValidate
          data-test="uitblinker-form"
          className="mt-8 space-y-10"
        >
          <section>
            <h2 className="font-display text-lg font-bold text-ink">1. Voor wie?</h2>
            <div className="mt-3">
              <Input
                label="Naam van je kind"
                name="kidName"
                type="text"
                required
                placeholder="Bijv. Sara"
                data-test="ub-kidname"
              />
              <FieldError msg={errors.kidName} />
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              2. Welk onderwerp focust het op?
            </h2>
            <fieldset className="mt-3">
              <legend className="sr-only">Kies een onderwerp</legend>
              <div className="space-y-3">
                {SUBJECT_OPTIONS.map((opt) => (
                  <RadioCard
                    key={opt.value}
                    name="subject"
                    value={opt.value}
                    label={opt.label}
                    description={opt.description}
                    data-test={`ub-subject-${opt.value.toLowerCase()}`}
                    defaultChecked={opt.value === "TAAL"}
                  />
                ))}
              </div>
              <FieldError msg={errors.subject} />
            </fieldset>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              3. Waar mag het naartoe?
            </h2>
            <div className="mt-3 space-y-3">
              <Input
                label="Naam ontvanger"
                name="shipName"
                type="text"
                required
                autoComplete="name"
                data-test="ub-shipname"
              />
              <FieldError msg={errors.shipName} />
              <Input
                label="Straat + huisnummer"
                name="shipLine1"
                type="text"
                required
                autoComplete="address-line1"
                data-test="ub-shipline1"
              />
              <FieldError msg={errors.shipLine1} />
              <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                <div>
                  <Input
                    label="Postcode"
                    name="shipPostcode"
                    type="text"
                    required
                    autoComplete="postal-code"
                    placeholder="1011 AB"
                    data-test="ub-shippostcode"
                  />
                  <FieldError msg={errors.shipPostcode} />
                </div>
                <div>
                  <Input
                    label="Plaats"
                    name="shipCity"
                    type="text"
                    required
                    autoComplete="address-level2"
                    data-test="ub-shipcity"
                  />
                  <FieldError msg={errors.shipCity} />
                </div>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={pending}
            data-test="ub-submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lexi bg-primary px-5 py-3 text-base font-semibold text-white shadow-lexi-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
          >
            Aanmelden — {centsToEuro(UITBLINKER_PRICE_CENTS)}/maand
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </form>
      </main>
    </>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-primary">
      {msg}
    </p>
  );
}

function friendlyMessage(key: string, _raw: string): string {
  switch (key) {
    case "kidName":
      return "Vul de naam van je kind in";
    case "subject":
      return "Kies een onderwerp";
    case "shipName":
      return "Vul de naam van de ontvanger in";
    case "shipLine1":
      return "Vul straat en huisnummer in";
    case "shipPostcode":
      return "Postcode is ongeldig (bv. 1011 AB)";
    case "shipCity":
      return "Vul je plaats in";
    default:
      return "Controleer dit veld";
  }
}
