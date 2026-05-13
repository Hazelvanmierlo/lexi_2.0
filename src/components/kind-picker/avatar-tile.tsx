import { Lock } from "lucide-react";
import type { AgeBand } from "@/lib/engagement";
import { MascotImage } from "@/components/ui/mascot";
import { paletteFor, mascotFor } from "./palette";

type Props = {
  kidId: string;
  name: string;
  groep: number;
  band: AgeBand;
  pinSet: boolean;
};

export function AvatarTile({ kidId, name, groep, band, pinSet }: Props) {
  const palette = paletteFor(kidId);
  const mascot = mascotFor(kidId);
  const isKlein = band === "klein";

  // Two-tier sizing: klein is larger and friendlier; groot is tighter.
  const circleSize = isKlein
    ? "h-44 w-44 md:h-52 md:w-52"
    : "h-36 w-36 md:h-44 md:w-44";
  const mascotPixel = isKlein ? 220 : 180;
  const nameSize = isKlein ? "text-2xl md:text-3xl" : "text-lg md:text-xl";

  return (
    <button
      type="submit"
      aria-label={`Speel als ${name}, groep ${groep}${pinSet ? " (PIN nodig)" : ""}`}
      className="group flex w-full flex-col items-center gap-4 rounded-3xl bg-transparent p-2 focus:outline-none"
    >
      <div
        className={`relative flex ${circleSize} items-center justify-center rounded-full ${palette.bg} transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-[1.04] group-focus-visible:ring-4 group-focus-visible:ring-offset-2 ${palette.ring}`}
        style={{
          boxShadow: `0 22px 36px -14px ${palette.shadow}, 0 6px 12px -4px ${palette.shadow}`,
        }}
      >
        <MascotImage
          style={mascot.style}
          age={mascot.age}
          size={mascotPixel}
          decorative
          className="h-[78%] w-auto object-contain transition-transform duration-300 ease-out group-hover:scale-[1.08] group-hover:-rotate-2"
        />
        {pinSet && (
          <span
            aria-hidden="true"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-lexi-sm ring-1 ring-line"
          >
            <Lock className="h-4 w-4 text-ink" />
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <span
          className={`font-display font-bold tracking-tight text-ink ${nameSize} transition-colors duration-200 group-hover:text-primary`}
        >
          {name}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-2">
          Groep {groep}
        </span>
      </div>
    </button>
  );
}
