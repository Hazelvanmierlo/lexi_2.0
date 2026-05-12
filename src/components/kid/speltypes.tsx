import { useTranslations } from "next-intl";
import { CircleDot, Keyboard, MoveUpRight, ArrowLeftRight, AlignJustify, type LucideIcon } from "lucide-react";

type SpeltypeId = "mc" | "type" | "catapult" | "match" | "drag-order";

const ORDER: SpeltypeId[] = ["mc", "type", "catapult", "match", "drag-order"];

const ICON: Record<SpeltypeId, LucideIcon> = {
  mc:           CircleDot,
  type:         Keyboard,
  catapult:     MoveUpRight,
  match:        ArrowLeftRight,
  "drag-order": AlignJustify,
};

export function Speltypes() {
  const t = useTranslations("kid.speltypes");
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
          {t("title")}
        </h2>
        <span className="font-mono text-xs text-ink-3">{t("subtitle")}</span>
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {ORDER.map((id) => {
          const Icon = ICON[id];
          return (
            <li key={id}>
              <button
                type="button"
                className="flex w-full flex-col items-center rounded-lexi-lg bg-primary-soft px-4 py-7 text-center transition-colors hover:bg-primary-soft/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lexi-lg bg-[oklch(88%_0.06_35)] text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 font-display text-lg font-bold text-ink">
                  {t(`items.${id}.name`)}
                </p>
                <p className="mt-1 text-sm text-ink-3">
                  {t(`items.${id}.desc`)}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
