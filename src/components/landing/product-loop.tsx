import { useTranslations } from "next-intl";
import { SectionIntro } from "@/components/ui/section-intro";

type Item = { time: string; step: string; title: string; body: string };

export function ProductLoop() {
  const t = useTranslations("productLoop");
  const items = t.raw("items") as Item[];
  return (
    <section id="hoe" className="bg-bg-2 px-5 py-10 md:py-16">
      <div className="mx-auto max-w-[1200px] min-[1700px]:max-w-[1500px] min-[1700px]:ml-[1.5vw] min-[1700px]:mr-auto">
        <SectionIntro
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead")}
        />
        <ul className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.time}
              className="rounded-lexi-lg border border-line bg-card p-6 shadow-lexi-sm"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-ink px-2 py-1 font-mono text-xs font-semibold tabular-nums text-white">
                  {item.time}
                </span>
                <span className="font-mono text-xs text-ink-3">{item.step}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
