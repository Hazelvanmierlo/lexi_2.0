import { Calculator, Type, BookOpen, Globe, Languages, type LucideIcon } from "lucide-react";

type Props = {
  id: "rekenen" | "taal" | "lezen" | "engels" | "wereld";
  label: string;
  pct: number;
  tint: string;
  barColor: string;
};

const ICON: Record<Props["id"], LucideIcon> = {
  rekenen: Calculator,
  taal: Type,
  lezen: BookOpen,
  engels: Languages,
  wereld: Globe,
};

export function SubjectTile({ id, label, pct, tint, barColor }: Props) {
  const Icon = ICON[id];
  return (
    <div className={`rounded-lexi-lg border border-line ${tint} p-4`}>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-ink" />
        <span className="font-display text-base font-bold text-ink">{label}</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-card/60">
        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
