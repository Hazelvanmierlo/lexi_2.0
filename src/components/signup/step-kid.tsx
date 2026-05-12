"use client";

import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { FormState } from "./form-state";

type Props = { form: FormState; setForm: (next: FormState) => void };

export function StepKid({ form, setForm }: Props) {
  const f = useTranslations("signup.kid.fields");
  const locale = useLocale();
  const maxGroep = locale === "nl-BE" ? 6 : 8;
  const years = Array.from({ length: 8 }, (_, i) => 2021 - i);
  const groepRange = Array.from({ length: maxGroep }, (_, i) => i + 1);
  return (
    <div className="space-y-4">
      <Input
        name="kidName"
        type="text"
        required
        label={f("name.label")}
        placeholder={f("name.placeholder")}
        value={form.kidName}
        onChange={(e) => setForm({ ...form, kidName: e.target.value })}
      />
      <Select
        name="kidYear"
        required
        label={f("year.label")}
        value={form.kidYear}
        onChange={(e) => setForm({ ...form, kidYear: e.target.value })}
      >
        <option value="">—</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </Select>
      <Select
        name="kidGroep"
        required
        label={f("groep.label")}
        value={form.kidGroep}
        onChange={(e) => setForm({ ...form, kidGroep: e.target.value })}
      >
        <option value="">—</option>
        {groepRange.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </Select>
    </div>
  );
}
