// Realistic-ish SVG book mockup. Server component.
//
// Replaces the flat tint+symbol placeholder with a layered cover + spine +
// giant subject symbol + wrapped title + groep badge. Pure SVG so it renders
// instantly, scales to any size, and has no broken-image risk.
//
// Spec: docs/superpowers/specs/2026-05-13-lexi-cart-checkout-design.md §4

export type BookMockupSubject = "TAAL" | "REKENEN" | "LEZEN" | "WERELD" | "ENGELS";

export type BookMockupSize = "card" | "hero";

type Props = {
  title: string;
  subject: string; // accept any DB string; falls back to neutral palette
  groep: string;
  symbol: string;
  size?: BookMockupSize;
};

type Palette = { cover: string; spine: string; pages: string; text: string; badge: string };

const PALETTE: Record<BookMockupSubject, Palette> = {
  TAAL: {
    cover: "oklch(85% 0.08 35)",
    spine: "oklch(64% 0.12 35)",
    pages: "oklch(96% 0.02 35)",
    text: "oklch(22% 0.05 35)",
    badge: "oklch(38% 0.10 35)",
  },
  REKENEN: {
    cover: "oklch(88% 0.06 195)",
    spine: "oklch(64% 0.11 195)",
    pages: "oklch(96% 0.02 195)",
    text: "oklch(22% 0.04 195)",
    badge: "oklch(38% 0.10 195)",
  },
  LEZEN: {
    cover: "oklch(90% 0.08 145)",
    spine: "oklch(60% 0.12 145)",
    pages: "oklch(97% 0.02 145)",
    text: "oklch(22% 0.05 145)",
    badge: "oklch(36% 0.10 145)",
  },
  WERELD: {
    cover: "oklch(90% 0.10 90)",
    spine: "oklch(70% 0.13 90)",
    pages: "oklch(97% 0.03 90)",
    text: "oklch(22% 0.05 90)",
    badge: "oklch(38% 0.10 90)",
  },
  ENGELS: {
    cover: "oklch(86% 0.07 305)",
    spine: "oklch(60% 0.12 305)",
    pages: "oklch(96% 0.02 305)",
    text: "oklch(22% 0.05 305)",
    badge: "oklch(38% 0.10 305)",
  },
};

const NEUTRAL: Palette = {
  cover: "oklch(90% 0.02 260)",
  spine: "oklch(65% 0.04 260)",
  pages: "oklch(96% 0.01 260)",
  text: "oklch(22% 0.02 260)",
  badge: "oklch(38% 0.04 260)",
};

const SIZE: Record<BookMockupSize, { className: string; viewBox: string }> = {
  card: { className: "w-full aspect-[5/7]", viewBox: "0 0 200 280" },
  hero: { className: "w-full aspect-[5/7]", viewBox: "0 0 200 280" },
};

/** Split a title into max-2 lines, each roughly <= 14 chars. */
function wrapTitle(title: string): string[] {
  const trimmed = title.trim();
  if (trimmed.length <= 14) return [trimmed];
  const words = trimmed.split(/\s+/);
  if (words.length === 1) return [trimmed.slice(0, 14), trimmed.slice(14, 28)];
  let line1 = "";
  let line2 = "";
  for (const w of words) {
    if (!line1.length || (line1.length + 1 + w.length <= 14 && !line2.length)) {
      line1 = line1 ? `${line1} ${w}` : w;
    } else {
      line2 = line2 ? `${line2} ${w}` : w;
    }
  }
  // If line1 still empty fall back.
  if (!line1) return [trimmed];
  return line2 ? [line1, line2.slice(0, 18)] : [line1];
}

export function BookMockup({ title, subject, groep, symbol, size = "card" }: Props) {
  const key = subject.toUpperCase() as BookMockupSubject;
  const palette = PALETTE[key] ?? NEUTRAL;
  const { className, viewBox } = SIZE[size];
  const lines = wrapTitle(title);
  const filterId = `bm-shadow-${size}`;

  return (
    <svg
      viewBox={viewBox}
      className={className}
      role="img"
      aria-label={`Omslag van ${title}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Book body group with shadow */}
      <g filter={`url(#${filterId})`}>
        {/* Page edges peeking out on the right */}
        <rect x="186" y="14" width="6" height="252" rx="1" fill={palette.pages} />
        <line x1="190" y1="20" x2="190" y2="260" stroke={palette.spine} strokeOpacity="0.25" strokeWidth="0.5" />

        {/* Front cover */}
        <rect x="20" y="10" width="170" height="260" rx="6" fill={palette.cover} />

        {/* Spine left strip */}
        <rect x="20" y="10" width="22" height="260" rx="6" fill={palette.spine} />
        <rect x="36" y="10" width="6" height="260" fill={palette.spine} opacity="0.5" />

        {/* Subtle inner cover border */}
        <rect
          x="48"
          y="22"
          width="134"
          height="236"
          rx="3"
          fill="none"
          stroke={palette.text}
          strokeOpacity="0.10"
          strokeWidth="1"
        />

        {/* Giant subject symbol (top center of cover area) */}
        <text
          x="115"
          y="120"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontWeight="800"
          fontSize="90"
          fill={palette.text}
          opacity="0.85"
        >
          {symbol}
        </text>

        {/* Title text — wrapped to 1 or 2 lines */}
        <g>
          {lines.length === 1 ? (
            <text
              x="115"
              y="200"
              textAnchor="middle"
              fontFamily="var(--font-display)"
              fontWeight="700"
              fontSize="14"
              fill={palette.text}
            >
              {lines[0]}
            </text>
          ) : (
            <>
              <text
                x="115"
                y="196"
                textAnchor="middle"
                fontFamily="var(--font-display)"
                fontWeight="700"
                fontSize="13"
                fill={palette.text}
              >
                {lines[0]}
              </text>
              <text
                x="115"
                y="214"
                textAnchor="middle"
                fontFamily="var(--font-display)"
                fontWeight="700"
                fontSize="13"
                fill={palette.text}
              >
                {lines[1]}
              </text>
            </>
          )}
        </g>

        {/* Groep badge — bottom right */}
        <g>
          <rect x="138" y="234" width="44" height="22" rx="11" fill={palette.badge} />
          <text
            x="160"
            y="249"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontWeight="600"
            fontSize="10"
            fill="white"
            letterSpacing="0.5"
          >
            GROEP {groep}
          </text>
        </g>
      </g>
    </svg>
  );
}
