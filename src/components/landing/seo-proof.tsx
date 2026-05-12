import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

type Tone = "ok" | "primary" | "sun" | "muted";
type Row = { code: string; label: string; pct: number; tone: Tone };

const TONE_BAR: Record<Tone, string> = {
  ok:      "bg-ok",
  primary: "bg-primary",
  sun:     "bg-sun",
  muted:   "bg-line",
};

export function SeoProof() {
  const t = useTranslations("seoProof");
  const bullets = t.raw("bullets") as string[];
  const rows = t.raw("rows") as Row[];
  return (
    <section className="bg-bg-2 px-5 py-10 md:py-16">
      <div className="mx-auto grid max-w-[1200px] min-[1700px]:max-w-[1500px] min-[1700px]:ml-[1.5vw] min-[1700px]:mr-auto items-center gap-12 md:grid-cols-2">
        {/* Left: copy + checklist */}
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-ink-3">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink text-balance md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-ink-2 md:text-lg">{t("lead")}</p>
          <ul className="mt-6 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="text-ink">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: report card */}
        <div className="rounded-lexi-lg border border-line bg-card p-6 shadow-lexi md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-ink-3">
                {t("report.kicker")}
              </p>
              <p className="mt-1 font-display text-lg font-bold text-ink">
                {t("report.kid")}
              </p>
            </div>
            <span className="rounded-full bg-ok-soft px-3 py-1 text-xs font-semibold text-ink">
              {t("report.status")}
            </span>
          </div>
          <ul className="mt-5 space-y-3">
            {rows.map((r) => (
              <li key={r.code}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-baseline gap-3">
                    <span className="font-mono text-xs text-ink-3">{r.code}</span>
                    <span className="truncate text-sm text-ink">{r.label}</span>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-ink-2">
                    {r.pct}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-2">
                  <div
                    className={`h-full ${TONE_BAR[r.tone]}`}
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
