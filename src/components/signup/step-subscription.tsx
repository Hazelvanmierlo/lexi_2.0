"use client";

import { useTranslations } from "next-intl";
import { RadioCard } from "@/components/ui/radio-card";
import type { FormState } from "./form-state";

type Props = { form: FormState; setForm: (next: FormState) => void };

const PLANS = ["monthly", "yearly"] as const;

export function StepSubscription({ form, setForm }: Props) {
  const tier = useTranslations("signup.subscription.tiers");
  const sub = useTranslations("signup.subscription");
  const badge = sub("badge");
  return (
    <>
      <ul className="space-y-4">
        {PLANS.map((p) => (
          <li key={p}>
            <RadioCard
              name="plan"
              value={p}
              checked={form.plan === p}
              onChange={() => setForm({ ...form, plan: p })}
              label={`${tier(`${p}.name`)} — ${tier(`${p}.price`)} ${tier(`${p}.interval`)}`}
              description={tier(`${p}.body`)}
              badge={p === "yearly" ? badge : undefined}
            />
          </li>
        ))}
      </ul>
      {/* TODO(legal): finalise consent wording before production launch — spec §5.1 */}
      <label className="mt-6 flex items-start gap-2 text-sm text-ink-2">
        <input
          type="checkbox"
          required
          checked={form.consent}
          onChange={(e) => setForm({ ...form, consent: e.target.checked })}
          className="mt-1"
        />
        <span>
          Ik ben ouder of voogd van {form.kidName || "dit kind"} en geef toestemming
          voor het bewaren van naam, groep, oefenresultaten en spelgeschiedenis.{" "}
          <a href="/privacy" className="underline">Privacybeleid</a>.
        </span>
      </label>
    </>
  );
}
