import { useTranslations } from "next-intl";
import { Coins } from "lucide-react";
import { MascotImage } from "@/components/ui/mascot";

type Props = { coins: number };

export function KidHeader({ coins }: Props) {
  const t = useTranslations("kid.header");
  return (
    <header className="border-b border-line-2 bg-card">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <MascotImage style="bot" age="kid" size={36} decorative className="h-9 w-9" />
          <span className="font-display text-lg font-bold tracking-tight text-ink">Lexi.kids</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-sun-soft px-3 py-1.5 text-sm font-semibold text-ink">
            <Coins className="h-4 w-4" />
            <span>{coins}</span>
            <span className="text-xs font-medium text-ink-2">{t("coins")}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft" aria-label={t("avatar")}>
            <MascotImage style="bot" age="kid" size={28} decorative className="h-7 w-7" />
          </div>
        </div>
      </div>
    </header>
  );
}
