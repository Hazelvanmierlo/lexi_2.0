import { useTranslations } from "next-intl";
import { Btn } from "@/components/ui/btn";
import { MascotImage } from "@/components/ui/mascot";

export function Welcome() {
  const t = useTranslations("signup.welcome");
  return (
    <div className="text-center">
      <div className="mx-auto flex w-fit">
        <MascotImage style="bot" age="hero" size={280} decorative className="h-auto w-[280px]" />
      </div>
      <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink">{t("title")}</h2>
      <p className="mt-3 text-ink-2">{t("sub")}</p>
      <div className="mt-8">
        <Btn href="/ouder">{t("cta")}</Btn>
      </div>
    </div>
  );
}
