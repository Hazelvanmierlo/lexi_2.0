import { useTranslations, useLocale } from "next-intl";
import { Btn } from "@/components/ui/btn";
import { NlFlag, BeFlag } from "@/components/nav/flag";
import { AnimatedPhoneMock } from "./animated-phone-mock";
import { ParentPingCard } from "./parent-ping-card";
import { Check } from "lucide-react";

export function Hero() {
  const t = useTranslations("hero");
  const trust = useTranslations("hero.trust");
  const locale = useLocale();
  const Flag = locale === "nl-BE" ? BeFlag : NlFlag;
  return (
    <section className="px-5 py-10 md:py-16">
      <div className="mx-auto grid max-w-[1200px] min-[1700px]:max-w-[1500px] min-[1700px]:ml-[1.5vw] min-[1700px]:mr-auto items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-sm text-ink-2">
            <Flag className="h-3 w-5" decorative />
            {t("kicker")}
          </span>
          <h1 className="mt-6 max-w-[600px] font-display text-[clamp(38px,5.6vw,64px)] font-bold leading-[1.02] tracking-tighter text-ink text-balance">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-2 md:text-xl">{t("subhead")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Btn href="/signup">{t("ctaTrial")}</Btn>
            <Btn href="/probeer" variant="ghost">{t("ctaTry")}</Btn>
          </div>
          <p className="mt-4 font-display text-base font-bold text-ink">
            {t("price")}
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-ok" />{trust("noCard")}</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-ok" />{trust("monthly")}</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-ok" />{trust("wholeFamily")}</li>
          </ul>
        </div>
        <div className="relative">
          {/* Dotted radial backdrop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, oklch(90% 0.012 260) 1.2px, transparent 1.2px)",
              backgroundSize: "22px 22px",
              maskImage:
                "radial-gradient(circle at center, black 50%, transparent 78%)",
              WebkitMaskImage:
                "radial-gradient(circle at center, black 50%, transparent 78%)",
            }}
          />
          <div className="relative mx-auto max-w-[480px]">
            <AnimatedPhoneMock />
            <div className="absolute -bottom-4 right-2 hidden w-[220px] md:block">
              <ParentPingCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
