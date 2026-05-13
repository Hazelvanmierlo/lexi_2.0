import { Sparkles, Gift, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    title: "Adaptief",
    body: "Het werkboek past zich elke maand aan op de antwoorden van je kind in de Lexi-app. Geen één boekje is hetzelfde.",
  },
  {
    icon: Gift,
    title: "Cadeau-gevoel",
    body: "Papier, niet alweer een scherm. Een eigen pakketje in de bus — kinderen kijken er elke maand naar uit.",
  },
  {
    icon: XCircle,
    title: "Opzegbaar",
    body: "Maand-op-maand. Geen jaarcontract, geen verborgen kosten. Stoppen kan altijd in één klik.",
  },
];

export function UitblinkerFeatureGrid() {
  return (
    <ul className="grid gap-6 md:grid-cols-3">
      {FEATURES.map((f) => {
        const Icon = f.icon;
        return (
          <li
            key={f.title}
            className="rounded-lexi-lg border border-line bg-card p-6 shadow-lexi-sm"
          >
            <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
            <h3 className="mt-3 font-display text-lg font-bold text-ink">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{f.body}</p>
          </li>
        );
      })}
    </ul>
  );
}
