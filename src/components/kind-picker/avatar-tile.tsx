import type { AgeBand } from "@/lib/engagement";

type Props = { name: string; groep: number; band: AgeBand };

export function AvatarTile({ name, groep, band }: Props) {
  const tileClass =
    band === "klein"
      ? "p-6 text-lg"
      : "p-4 text-base";
  return (
    <button
      type="submit"
      className={`flex w-full min-h-[120px] flex-col items-center justify-center gap-3 rounded-lexi-lg border border-line bg-card shadow-lexi hover:bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${tileClass}`}
    >
      <div
        aria-hidden="true"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft font-display text-2xl font-bold text-primary-ink"
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <span className="font-display font-bold text-ink">{name}</span>
      <span className="font-mono text-xs uppercase tracking-wider text-ink-2">
        Groep {groep}
      </span>
    </button>
  );
}
