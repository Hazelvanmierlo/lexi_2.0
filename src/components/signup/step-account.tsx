"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import type { FormState } from "./form-state";

type Props = { form: FormState; setForm: (next: FormState) => void };

export function StepAccount({ form, setForm }: Props) {
  const f = useTranslations("signup.account.fields");
  return (
    <div className="space-y-4">
      <Input
        name="name"
        type="text"
        required
        label={f("name.label")}
        placeholder={f("name.placeholder")}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        name="email"
        type="email"
        required
        label={f("email.label")}
        placeholder={f("email.placeholder")}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <Input
        name="password"
        type="password"
        required
        minLength={8}
        label={f("password.label")}
        placeholder={f("password.placeholder")}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
    </div>
  );
}
