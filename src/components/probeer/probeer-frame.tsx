"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, X, RotateCcw } from "lucide-react";
import { Btn } from "@/components/ui/btn";
import { MascotImage } from "@/components/ui/mascot";

type Stage = "asking" | "answered" | "rewarded";

export function ProbeerFrame() {
  const t = useTranslations("probeer");
  const options = t.raw("options") as string[];
  const correctIdx = t.raw("correctIdx") as number;
  const [stage, setStage] = useState<Stage>("asking");
  const [picked, setPicked] = useState<number | null>(null);

  const handlePick = (i: number) => {
    if (stage !== "asking") return;
    setPicked(i);
    setStage("answered");
    if (i === correctIdx) {
      setTimeout(() => setStage("rewarded"), 900);
    }
  };

  const handleReset = () => {
    setPicked(null);
    setStage("asking");
  };

  const isCorrect = picked === correctIdx;

  return (
    <div className="relative">
      {/* Phone frame */}
      <div className="mx-auto w-full max-w-[340px] rounded-[36px] border border-line bg-card p-3 shadow-lexi-lg">
        <div className="rounded-lexi-lg bg-card p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-primary-ink">
            {t("subject")}
          </p>
          <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-ink">
            {t("question")}
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-2">
            {options.map((opt, i) => {
              const isPicked = picked === i;
              const isThisCorrect = i === correctIdx;
              const showAsCorrect = stage !== "asking" && isThisCorrect;
              const showAsWrong = stage !== "asking" && isPicked && !isThisCorrect;
              return (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => handlePick(i)}
                    disabled={stage !== "asking"}
                    className={`flex w-full items-center justify-between rounded-lexi border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                      showAsCorrect
                        ? "border-ok bg-ok-soft text-ink"
                        : showAsWrong
                        ? "border-primary bg-primary-soft text-primary-ink"
                        : "border-line bg-bg-2 text-ink hover:border-primary"
                    } ${stage !== "asking" ? "cursor-default" : "cursor-pointer"}`}
                    aria-pressed={isPicked}
                  >
                    <span>{opt}</span>
                    {showAsCorrect && <Check className="h-4 w-4 text-ok" />}
                    {showAsWrong && <X className="h-4 w-4 text-primary" />}
                  </button>
                </li>
              );
            })}
          </ul>

          {stage === "asking" && (
            <p className="mt-4 text-center text-xs text-ink-3">{t("feedbackTry")}</p>
          )}
          {stage === "answered" && (
            <p
              className={`mt-4 rounded-lexi px-3 py-2 text-center text-sm font-medium ${
                isCorrect ? "bg-ok-soft text-ink" : "bg-primary-soft text-primary-ink"
              }`}
            >
              {isCorrect ? t("feedbackOk") : t("feedbackTry")}
            </p>
          )}
        </div>
      </div>

      {/* Reward overlay */}
      {stage === "rewarded" && (
        <div
          key="reward"
          className="lexi-fade-up absolute inset-0 mx-auto flex w-full max-w-[340px] flex-col items-center justify-center rounded-[36px] bg-primary-soft/95 p-6 text-center backdrop-blur-sm"
        >
          <MascotImage
            style="bot"
            age="hero"
            size={96}
            decorative
            motion="float"
            className="h-24 w-24"
          />
          <p className="mt-3 font-display text-xl font-bold text-ink">{t("rewardTitle")}</p>
          <p className="mt-2 text-sm text-ink-2">{t("rewardSub")}</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Btn href="/signup">{t("ctaSignup")}</Btn>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-1.5 rounded-lexi border border-line bg-card px-3 py-2 text-sm font-medium text-ink hover:bg-bg-2"
            >
              <RotateCcw className="h-4 w-4" /> {t("again")}
            </button>
          </div>
        </div>
      )}

      {/* Reset for wrong attempts */}
      {stage === "answered" && !isCorrect && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lexi border border-line bg-card px-3 py-2 text-sm font-medium text-ink hover:bg-bg-2"
          >
            <RotateCcw className="h-4 w-4" /> {t("again")}
          </button>
        </div>
      )}
    </div>
  );
}
