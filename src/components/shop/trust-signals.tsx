import { Clock, Lock, RotateCcw, Truck } from "lucide-react";

const ITEMS = [
  { icon: Truck, label: "Gratis bezorging vanaf € 25" },
  { icon: Clock, label: "Voor 22:00 besteld, morgen in huis" },
  { icon: RotateCcw, label: "14 dagen bedenktijd" },
  { icon: Lock, label: "Veilig betalen" },
] as const;

export function TrustSignals() {
  return (
    <ul
      data-test="trust-signals"
      className="grid grid-cols-2 gap-4 rounded-lexi-lg border border-line bg-card p-4 md:grid-cols-4"
    >
      {ITEMS.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2 text-sm text-ink-2">
          <Icon className="h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
