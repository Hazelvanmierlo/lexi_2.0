import { useTranslations } from "next-intl";
import { Smartphone, Tablet } from "lucide-react";
import { SectionIntro } from "@/components/ui/section-intro";

export function SamenModus() {
  const t = useTranslations("samenModus");
  const steps = useTranslations("samenModus.steps");
  const scene = useTranslations("samenModus.scene");
  const kidOptions = scene.raw("kidOptions") as string[];
  return (
    <section id="samen" className="px-5 py-10 md:py-16">
      <div className="mx-auto max-w-[1200px] min-[1700px]:max-w-[1500px] min-[1700px]:ml-[1.5vw] min-[1700px]:mr-auto">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
        <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-2">
          <ul className="space-y-8">
            {(["one", "two", "three"] as const).map((k) => (
              <li key={k}>
                <p className="font-mono text-sm uppercase tracking-wider text-primary-ink">{steps(`${k}.eyebrow`)}</p>
                <h3 className="mt-2 font-display text-xl font-bold text-ink md:text-2xl">{steps(`${k}.title`)}</h3>
                <p className="mt-2 text-ink-2">{steps(`${k}.body`)}</p>
              </li>
            ))}
          </ul>
          <div className="relative h-[480px]">
            {/* Tablet — kid view (back, larger, bg-sun-soft) */}
            <div className="absolute right-0 top-12 w-[88%] rounded-[28px] border border-line bg-sun-soft p-3 shadow-lexi-lg">
              <div className="rounded-lexi-lg bg-card p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-2">
                  <Tablet className="h-4 w-4" />
                  {scene("kidLabel")}
                </div>
                <p className="mt-3 font-display text-lg font-bold text-ink">{scene("kidQuestion")}</p>
                <ul className="mt-4 grid grid-cols-2 gap-2">
                  {kidOptions.map((opt, i) => (
                    <li
                      key={opt}
                      className={`rounded-lexi border px-3 py-2 text-center text-sm font-medium ${
                        i === 1
                          ? "border-primary bg-primary-soft text-primary-ink"
                          : "border-line bg-bg-2 text-ink-2"
                      }`}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Phone — parent view (front, smaller, bg-teal-soft, tilted) */}
            <div className="absolute left-0 top-0 w-[58%] rotate-[-4deg] rounded-[36px] border border-line bg-teal-soft p-3 shadow-lexi-lg">
              <div className="rounded-lexi-lg bg-card p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-2">
                  <Smartphone className="h-4 w-4" />
                  {scene("parentLabel")}
                </div>
                <p className="mt-3 text-sm text-ink">{scene("parentHint")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
