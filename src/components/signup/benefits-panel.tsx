import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { MascotImage } from "@/components/ui/mascot";

export function BenefitsPanel() {
  const t = useTranslations("signup.benefits");
  const items = t.raw("items") as string[];
  return (
    <aside className="md:sticky md:top-24 md:self-start">
      <div className="rounded-lexi-lg border border-line bg-card p-8 shadow-lexi-sm">
        <div className="mx-auto flex w-fit">
          <MascotImage style="bot" age="kid" size={200} decorative className="h-auto w-[200px]" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-ink">
          {t("title")}
        </h2>
        <p className="mt-2 text-ink-2">{t("sub")}</p>
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-ink">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
