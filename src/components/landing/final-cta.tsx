import { useTranslations } from "next-intl";
import { Btn } from "@/components/ui/btn";
import { MascotImage } from "@/components/ui/mascot";

export function FinalCta() {
  const t = useTranslations("finalCta");
  return (
    <section className="bg-bg-2 px-5 py-10 md:py-16">
      <div className="mx-auto grid max-w-[1100px] gap-8 rounded-lexi-lg border border-primary bg-primary-soft p-10 shadow-lexi md:grid-cols-[1.5fr_1fr] md:items-center md:p-14">
        <div className="text-center md:text-left">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink text-balance md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-ink-2 md:text-lg">{t("sub")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            <Btn href="/signup">{t("ctaTrial")}</Btn>
            <Btn href="/probeer" variant="ghost">{t("ctaTry")}</Btn>
          </div>
        </div>
        <div className="order-first grid place-items-center md:order-none">
          <MascotImage
            style="bot"
            age="hero"
            size={200}
            decorative
            motion="float"
            className="h-[200px] w-[200px]"
          />
        </div>
      </div>
    </section>
  );
}
