"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

type Props = { activeStep: 1 | 2 | 3 | 4 };

export function StepIndicator({ activeStep }: Props) {
  const t = useTranslations("signup.steps");
  const labels = [t("0.label"), t("1.label"), t("2.label"), t("3.label")];
  return (
    <ol className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-wider">
      {labels.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === activeStep;
        const isDone = stepNum < activeStep;
        return (
          <li
            key={label}
            className={`flex items-center gap-2 ${
              isActive ? "text-primary-ink font-semibold"
                : isDone ? "text-ok"
                : "text-ink-3"
            }`}
          >
            {isDone ? (
              <Check className="h-3 w-3" />
            ) : (
              <span className="font-mono">{String(stepNum).padStart(2, "0")}</span>
            )}
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
