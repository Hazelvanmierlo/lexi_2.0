import { useTranslations } from "next-intl";
import { MascotImage } from "@/components/ui/mascot";

export function DailyGreeting() {
  const t = useTranslations("kid.greeting");
  return (
    <section className="rounded-lexi-lg border border-line bg-card p-5 shadow-lexi-sm sm:p-6">
      <div className="flex items-center gap-4">
        <MascotImage
          style="bot"
          age="hero"
          size={72}
          decorative
          motion="float"
          className="h-[72px] w-[72px] shrink-0"
        />
        <div className="flex-1">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-3">{t("kicker")}</p>
          <h2 className="mt-0.5 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {t("title")}
          </h2>
        </div>
      </div>
    </section>
  );
}
