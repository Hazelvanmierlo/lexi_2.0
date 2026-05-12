"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SectionIntro } from "@/components/ui/section-intro";
import { MascotImage } from "@/components/ui/mascot";

type Phase = { step: string; title: string; body: string };
type Goody = { label: string; cost: string };

const BARS = [3, 5, 8, 12, 15];

export function RewardLoop() {
  const t = useTranslations("rewardLoop");
  const phases = t.raw("phases") as Phase[];
  const goodies = t.raw("goodies") as Goody[];
  const unlockLabel = t("unlockLabel");
  const barPrefix = t("barLabelPrefix");

  const [active, setActive] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const node = rootRef.current;
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => setIsTabVisible(!document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (!isVisible || !isTabVisible) return;
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = setInterval(() => {
      setActive((a) => (a + 1) % phases.length);
    }, 2200);
    return () => clearInterval(id);
  }, [isVisible, isTabVisible, phases.length]);

  return (
    <section ref={rootRef} className="px-5 py-10 md:py-16">
      <div className="mx-auto max-w-[1200px] min-[1700px]:max-w-[1500px] min-[1700px]:ml-[1.5vw] min-[1700px]:mr-auto">
        <SectionIntro eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} center />

        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-[1.2fr_1fr_1fr]">
          {/* Panel 1 — Munten verdienen (animated bar chart) */}
          <article className="rounded-lexi-lg border border-line bg-card p-7">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-3">{phases[0].step}</p>
            <h3 className="mt-1 font-display text-xl font-bold text-ink">{phases[0].title}</h3>
            <p className="mt-2 text-sm text-ink-2">{phases[0].body}</p>
            <div className="mt-6 flex items-end gap-2">
              {BARS.map((v, i) => (
                <div key={v} className="flex-1">
                  <div
                    className={`rounded-t-md transition-colors duration-300 ${
                      i === active ? "bg-primary" : "bg-[oklch(88%_0.06_35)]"
                    }`}
                    style={{ height: v * 6 }}
                    aria-hidden="true"
                  />
                  <p className="mt-1 text-center font-mono text-[10px] text-ink-3">{barPrefix}{v}</p>
                </div>
              ))}
            </div>
          </article>

          {/* Panel 2 — Avatar groeit mee (mascot + unlock badge) */}
          <article className="rounded-lexi-lg border border-line bg-card p-7">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-3">{phases[1].step}</p>
            <h3 className="mt-1 font-display text-xl font-bold text-ink">{phases[1].title}</h3>
            <p className="mt-2 text-sm text-ink-2">{phases[1].body}</p>
            <div className="mt-4 grid place-items-center">
              <div className="relative">
                <MascotImage
                  style="bot"
                  age="hero"
                  size={120}
                  decorative
                  motion="float"
                  className="h-[120px] w-[120px]"
                />
                {active >= 1 && (
                  <span className="lexi-pop-in absolute -right-2 -top-2 rounded-full bg-ok px-2 py-1 text-[11px] font-semibold leading-none text-white shadow-lexi">
                    {unlockLabel}
                  </span>
                )}
              </div>
            </div>
          </article>

          {/* Panel 3 — Echte goodies (price tiles) */}
          <article className="rounded-lexi-lg border border-line bg-card p-7">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-3">{phases[2].step}</p>
            <h3 className="mt-1 font-display text-xl font-bold text-ink">{phases[2].title}</h3>
            <p className="mt-2 text-sm text-ink-2">{phases[2].body}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {goodies.map((g) => (
                <li
                  key={g.label}
                  className="rounded-lexi border border-line-2 bg-bg-2 px-3 py-2 text-xs"
                >
                  <span className="font-medium text-ink">{g.label}</span>
                  <span className="ml-1 font-mono text-[11px] text-primary">· {g.cost}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
