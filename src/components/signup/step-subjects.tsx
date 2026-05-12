"use client";

import { useTranslations } from "next-intl";
import { CheckboxCard } from "@/components/ui/checkbox-card";
import type { FormState } from "./form-state";

type Props = { form: FormState; setForm: (next: FormState) => void };

const KEYS = ["rekenen", "taal", "lezen", "wereld", "engels"] as const;

export function StepSubjects({ form, setForm }: Props) {
  const t = useTranslations("signup.subjects.items");
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {KEYS.map((k) => (
        <li key={k}>
          <CheckboxCard
            name={`subject-${k}`}
            label={t(k)}
            checked={form.subjects[k]}
            onChange={(e) =>
              setForm({
                ...form,
                subjects: { ...form.subjects, [k]: e.target.checked } as FormState["subjects"],
              })
            }
          />
        </li>
      ))}
    </ul>
  );
}
