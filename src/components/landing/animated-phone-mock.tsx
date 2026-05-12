"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { MascotImage } from "@/components/ui/mascot";

type Stage = "asking" | "picked" | "correct" | "rewarded";

function subscribeReducedMotion(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getReducedMotionServer = () => false;

const SLICES = [
  { frac: "3/4", filled: 3, total: 4 },
  { frac: "2/3", filled: 2, total: 3 },
];

export function AnimatedPhoneMock() {
  const t = useTranslations("hero.frame");
  const reward = useTranslations("hero.frame.reward");
  const options = t.raw("options") as string[];
  const correctIdx = t.raw("correctIdx") as number;

  const [stage, setStage] = useState<Stage>("asking");
  const [picked, setPicked] = useState<number | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);

  const [isVisible, setIsVisible] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getReducedMotionServer,
  );

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

  // Auto-cycle the demo: asking → picked (3/4) → correct → rewarded → reset.
  // Skipped when reducedMotion is on — the snapshot is derived at render time instead.
  useEffect(() => {
    if (!autoPlay || !isVisible || !isTabVisible || reducedMotion) return;
    const id = setInterval(() => {
      setStage((s) => {
        if (s === "asking")   { setPicked(correctIdx); return "picked"; }
        if (s === "picked")   { return "correct"; }
        if (s === "correct")  { return "rewarded"; }
        setPicked(null);
        return "asking";
      });
    }, 1700);
    return () => clearInterval(id);
  }, [autoPlay, isVisible, isTabVisible, reducedMotion, correctIdx]);

  const handlePick = (i: number) => {
    setAutoPlay(false);
    setPicked(i);
    if (i === correctIdx) {
      setStage("picked");
      setTimeout(() => setStage("correct"), 450);
      setTimeout(() => setStage("rewarded"), 1500);
      setTimeout(() => {
        setPicked(null);
        setStage("asking");
        setAutoPlay(true);
      }, 3500);
    } else {
      setStage("picked");
      setTimeout(() => {
        setPicked(null);
        setStage("asking");
        setAutoPlay(true);
      }, 1500);
    }
  };

  // When reducedMotion is on and no interaction is in progress, derive the
  // "correct" snapshot at render time so the demo isn't blank.
  const isResting = stage === "asking" && picked === null;
  const displayStage = reducedMotion && isResting ? "correct" : stage;
  const displayPicked = reducedMotion && isResting ? correctIdx : picked;

  const showFeedback = displayStage === "picked" || displayStage === "correct" || displayStage === "rewarded";
  const showCorrectMark = displayStage === "correct" || displayStage === "rewarded";

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-[300px]">
      {/* Phone frame — dark bezel, content-driven height */}
      <div className="rounded-[44px] bg-[oklch(22%_0.025_260)] p-3 shadow-lexi-lg">
        <div className="relative overflow-hidden rounded-[34px] bg-card">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-4 pb-1 font-mono text-[11px] text-ink-3">
            <span>{t("statusTime")}</span>
            <span>{t("statusLabel")}</span>
          </div>

          {/* Progress bar */}
          <div className="px-5 pt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-line-2">
              <div className="h-full w-[70%] rounded-full bg-primary transition-[width] duration-300" />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[10px] text-ink-3">
              <span>{t("progressLabel")}</span>
              <span>{t("levelLabel")}</span>
            </div>
          </div>

          {/* Question body */}
          <div className="px-5 pt-4 pb-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-3">
              {t("topic")}
            </p>
            <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-ink">
              {t("question")}
            </h3>

            {/* Pie chart slices */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {SLICES.map((s) => (
                <div
                  key={s.frac}
                  className="flex items-center gap-2 rounded-lexi border border-line-2 p-2"
                >
                  <PieSlice filled={s.filled} total={s.total} />
                  <span className="font-display text-base font-bold text-ink">{s.frac}</span>
                </div>
              ))}
            </div>

            {/* Options */}
            <ul className="mt-4 space-y-2" role="radiogroup" aria-label={t("question")}>
              {options.map((opt, i) => {
                const isPicked = displayPicked === i;
                const isThisCorrect = i === correctIdx;
                const showOk = showCorrectMark && isPicked && isThisCorrect;
                const showSelected = showFeedback && isPicked && !showOk;
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isPicked}
                      onClick={() => handlePick(i)}
                      className={`flex w-full items-center justify-between rounded-lexi border px-3.5 py-3 text-sm font-medium transition-colors ${
                        showOk
                          ? "border-ok bg-ok-soft text-ink"
                          : showSelected
                          ? "border-ink bg-bg-2 text-ink"
                          : "border-line bg-card text-ink hover:border-ink hover:bg-bg-2"
                      }`}
                    >
                      <span>{opt}</span>
                      {showOk && <Check className="h-4 w-4 text-ok" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Reward overlay (covers entire phone screen) */}
          {displayStage === "rewarded" && (
            <div
              className="lexi-fade-up absolute inset-0 flex flex-col items-center justify-center bg-card/95 p-6 text-center backdrop-blur-sm"
              key="reward"
            >
              <MascotImage
                style="bot"
                age="hero"
                size={112}
                decorative
                motion="float"
                className="h-28 w-28"
              />
              <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-ink-3">
                {reward("title").split(" · ")[0]}
              </p>
              <p className="mt-1 font-display text-xl font-bold text-ink">
                {reward("title").split(" · ")[1] ?? reward("title")}
              </p>
              <p className="mt-4 rounded-full bg-sun-soft px-3 py-1 text-xs font-semibold text-ink">
                ★ {reward("sub")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PieSlice({ filled, total }: { filled: number; total: number }) {
  const r = 22;
  const paths: string[] = [];
  for (let i = 0; i < total; i++) {
    const a0 = (i / total) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / total) * Math.PI * 2 - Math.PI / 2;
    const x0 = r * Math.cos(a0);
    const y0 = r * Math.sin(a0);
    const x1 = r * Math.cos(a1);
    const y1 = r * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    paths.push(`M0 0 L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`);
  }
  return (
    <svg
      aria-hidden="true"
      width="44"
      height="44"
      viewBox="-24 -24 48 48"
      className="shrink-0"
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={i < filled ? "oklch(85% 0.15 95)" : "white"}
          stroke="oklch(22% 0.025 260)"
          strokeWidth="1.4"
        />
      ))}
    </svg>
  );
}
