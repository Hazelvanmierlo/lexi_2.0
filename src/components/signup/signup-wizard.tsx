"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Btn } from "@/components/ui/btn";
import { StepIndicator } from "./step-indicator";
import { StepAccount } from "./step-account";
import { StepKid } from "./step-kid";
import { StepSubjects } from "./step-subjects";
import { StepSubscription } from "./step-subscription";
import { Welcome } from "./welcome";
import { INITIAL_FORM, type FormState } from "./form-state";
import { submitSignup } from "@/app/signup/actions";

type Step = 1 | 2 | 3 | 4 | "welcome";

export function SignupWizard() {
  const search = useSearchParams();
  const router = useRouter();
  const steps = useTranslations("signup.steps");
  const actions = useTranslations("signup.actions");

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  useEffect(() => {
    const email = search.get("email");
    if (email) setForm((f) => ({ ...f, email }));
  }, [search]);

  if (step === "welcome") {
    return (
      <div className="rounded-lexi-lg border border-line bg-card p-8 shadow-lexi md:p-12">
        <Welcome />
      </div>
    );
  }

  const idx = step - 1;
  const isLast = step === 4;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLast) {
      const n = step as 1 | 2 | 3;
      setStep((n + 1) as Step);
      return;
    }
    // Final step: call the server action.
    if (process.env.NEXT_PUBLIC_AUTH_ENABLED !== "true") {
      // Demo path — current behaviour, no DB write.
      setStep("welcome");
      return;
    }
    const groep = parseInt(form.kidGroep, 10);
    const result = await submitSignup({
      email: form.email,
      password: form.password,
      kidName: form.kidName,
      kidGroep: Number.isFinite(groep) ? groep : 1,
      plan: form.plan,
      region: "NL",
      consent: form.consent as true,
    });
    if (result.ok) {
      router.push("/kind");
    } else {
      alert(result.error);
    }
  }

  function onBack() {
    if (step === 1) {
      router.push("/");
      return;
    }
    const n = step as 2 | 3 | 4;
    setStep((n - 1) as Step);
  }

  return (
    <div className="rounded-lexi-lg border border-line bg-card p-8 shadow-lexi md:p-12">
      <StepIndicator activeStep={step} />
      <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
        {steps(`${idx}.title`)}
      </h2>
      <p className="mt-2 text-ink-2">{steps(`${idx}.sub`)}</p>
      <form onSubmit={onSubmit} className="mt-6">
        {step === 1 && <StepAccount form={form} setForm={setForm} />}
        {step === 2 && <StepKid form={form} setForm={setForm} />}
        {step === 3 && <StepSubjects form={form} setForm={setForm} />}
        {step === 4 && <StepSubscription form={form} setForm={setForm} />}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lexi border border-line bg-card px-4 py-2 text-sm text-ink hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {step === 1 ? actions("cancel") : actions("back")}
          </button>
          <Btn>{isLast ? actions("finish") : actions("next")}</Btn>
        </div>
      </form>
    </div>
  );
}
