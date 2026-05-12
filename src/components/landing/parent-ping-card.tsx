import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";

export function ParentPingCard() {
  const t = useTranslations("hero.parentPing");
  return (
    <div className="rotate-[2deg] rounded-lexi-lg border border-line bg-card p-4 shadow-lexi-lg">
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-primary-ink">
        <MessageCircle className="h-3 w-3" />
        {t("kicker")}
      </div>
      <p className="mt-2 max-w-[220px] text-sm text-ink">{t("body")}</p>
    </div>
  );
}
