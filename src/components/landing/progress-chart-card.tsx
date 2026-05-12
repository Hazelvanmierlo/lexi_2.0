import { useTranslations } from "next-intl";
import { SectionIntro } from "@/components/ui/section-intro";
import { MascotImage } from "@/components/ui/mascot";

type Row = { label: string; topic: string; pct: number };

export function ProgressChartCard() {
  const t = useTranslations("progressChart");
  const stats = useTranslations("progressChart.stats");
  const common = useTranslations("common");
  const rows = t.raw("rows") as Row[];
  return (
    <section className="bg-bg-2 px-5 py-10 md:py-16">
      <div className="mx-auto max-w-[1200px] min-[1700px]:max-w-[1500px] min-[1700px]:ml-[1.5vw] min-[1700px]:mr-auto">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} center />
        <div className="mt-12 rounded-lexi-lg border border-line bg-card p-6 shadow-lexi md:mt-16 md:p-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft">
              <MascotImage style="bot" age="kid" size={40} decorative className="h-10 w-10" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs uppercase tracking-wider text-primary-ink">{t("reportLabel")}</p>
              <h3 className="mt-1 font-display text-xl font-bold text-ink md:text-2xl">
                {t("kidName")} — {common("groep")} 5
              </h3>
            </div>
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {(["minutes", "streak", "levels"] as const).map((k) => (
              <li key={k} className="rounded-lexi border border-line bg-bg-2 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-ink-2">{stats(`${k}.label`)}</p>
                <p className="mt-1 font-display text-lg font-bold text-ink">{stats(`${k}.value`)}</p>
              </li>
            ))}
          </ul>
          <ul className="mt-6 divide-y divide-line-2">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{r.label}</p>
                  <p className="text-sm text-ink-2">{r.topic}</p>
                </div>
                <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-bg-2 sm:block">
                  <div className="h-full bg-primary" style={{ width: `${r.pct}%` }} />
                </div>
                <p className="font-mono text-sm tabular-nums text-ink-2">{r.pct}%</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-medium text-primary-ink">
            <a href="/ouder" className="hover:underline">{t("viewAll")}</a>
          </p>
        </div>
      </div>
    </section>
  );
}
