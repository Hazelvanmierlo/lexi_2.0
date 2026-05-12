import { useTranslations } from "next-intl";
import { Nav } from "@/components/nav/nav";
import { Footer } from "@/components/landing/footer";
import { ProbeerFrame } from "@/components/probeer/probeer-frame";

export default function ProbeerPage() {
  const t = useTranslations("probeer");
  return (
    <>
      <Nav />
      <main id="main-content" className="bg-bg-2 px-5 py-12 md:py-20">
        <div className="mx-auto grid max-w-[1100px] gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-3">
              {t("kicker")}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink text-balance md:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-md text-ink-2 md:text-lg">{t("intro")}</p>
          </div>
          <div>
            <ProbeerFrame />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
