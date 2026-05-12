import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Btn } from "@/components/ui/btn";
import { SectionIntro } from "@/components/ui/section-intro";

const TIERS = ["monthly", "yearly"] as const;

export function Pricing() {
  const t = useTranslations("pricing");
  const tier = useTranslations("pricing.tiers");
  return (
    <section id="prijzen" className="px-5 py-10 md:py-16">
      <div className="mx-auto max-w-[1200px] min-[1700px]:max-w-[1500px] min-[1700px]:ml-[1.5vw] min-[1700px]:mr-auto">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} center />
        <ul className="mx-auto mt-12 grid max-w-3xl gap-6 md:mt-16 md:grid-cols-2">
          {TIERS.map((id) => {
            const features = tier.raw(`${id}.features`) as string[];
            const badge = tier(`${id}.badge`);
            const featured = id === "yearly";
            return (
              <li
                key={id}
                className={`flex flex-col rounded-lexi-lg border p-8 ${
                  featured
                    ? "border-primary bg-card shadow-lexi"
                    : "border-line bg-card shadow-lexi-sm"
                }`}
              >
                {badge && (
                  <span className="mb-3 inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                    {badge}
                  </span>
                )}
                <h3 className="font-display text-xl font-bold text-ink">{tier(`${id}.name`)}</h3>
                <p className="mt-3">
                  <span className="font-display text-4xl font-bold text-ink">{tier(`${id}.price`)}</span>
                  <span className="ml-2 text-sm text-ink-2">{tier(`${id}.interval`)}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Btn href={`/signup?plan=${id}`} className="mt-8 w-full">
                  {t("ctaTrial")}
                </Btn>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
