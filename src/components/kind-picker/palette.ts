// Deterministic per-kid colour palette and mascot. A given kid.id always
// resolves to the same tile colour and the same mascot, so kids can recognise
// "mijn tegel" across sessions. Five colour variants + six mascot variants ⇒
// 30 distinct visual combos.

export type TilePalette = {
  /** Tailwind class for the circle background tint. */
  bg: string;
  /** Tailwind class fragment for the focus-visible ring colour. */
  ring: string;
  /** OKLCH colour string for the chromatic drop-shadow. */
  shadow: string;
};

const PALETTES: TilePalette[] = [
  // Primary — warm orange-coral
  { bg: "bg-primary-soft", ring: "ring-primary",     shadow: "oklch(78% 0.16 35 / 0.45)" },
  // Teal — calm water
  { bg: "bg-teal-soft",    ring: "ring-teal-400",    shadow: "oklch(78% 0.12 195 / 0.40)" },
  // Sun — playful yellow
  { bg: "bg-sun-soft",     ring: "ring-amber-400",   shadow: "oklch(86% 0.14 95 / 0.45)" },
  // Plum — quiet violet
  { bg: "bg-plum-soft",    ring: "ring-purple-400",  shadow: "oklch(78% 0.12 320 / 0.40)" },
  // Ok — fresh green
  { bg: "bg-ok-soft",      ring: "ring-emerald-400", shadow: "oklch(80% 0.13 150 / 0.40)" },
];

type Mascot = {
  style: "bot" | "classic" | "owl";
  age: "kid" | "hero";
};

const MASCOTS: Mascot[] = [
  { style: "bot",     age: "kid"  },
  { style: "bot",     age: "hero" },
  { style: "classic", age: "kid"  },
  { style: "classic", age: "hero" },
  { style: "owl",     age: "kid"  },
  { style: "owl",     age: "hero" },
];

function stableHash(input: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    h = ((h * 31) >>> 0) + input.charCodeAt(i);
    h = h >>> 0;
  }
  return h;
}

export function paletteFor(kidId: string): TilePalette {
  return PALETTES[stableHash(kidId, 0x9E3779B1) % PALETTES.length];
}

export function mascotFor(kidId: string): Mascot {
  return MASCOTS[stableHash(kidId, 0x85EBCA77) % MASCOTS.length];
}
