// Lexi — an original shape-based mascot. Three styles.
// classic: round cream body with warm face + star on cheek
// owl:     stacked ovals, big eyes, tufted head
// bot:     rounded square head with antenna

const Lexi = ({ style = 'classic', size = 160, mood = 'happy', animate = true, className = '', float = true }) => {
  const t = Date.now();
  const blink = animate;
  const a = { 'data-lexi': style };

  const wrap = {
    width: size,
    height: size,
    display: 'inline-block',
    position: 'relative',
    animation: float && animate ? 'lexi-float 4.2s ease-in-out infinite' : 'none',
  };

  return (
    <div className={`lexi ${className}`} style={wrap} {...a}>
      <style>{`
        @keyframes lexi-float { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-8px) rotate(1deg)} }
        @keyframes lexi-blink { 0%,92%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.08)} }
        @keyframes lexi-wave  { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(14deg)} }
        @keyframes lexi-sparkle { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.1)} }
        .lexi-eye { transform-origin: center; animation: ${blink ? 'lexi-blink 4.6s infinite' : 'none'}; }
        .lexi-hand { transform-origin: 28px 62px; animation: ${animate ? 'lexi-wave 2.6s ease-in-out infinite' : 'none'}; }
        .lexi-sparkle { animation: ${animate ? 'lexi-sparkle 2.2s ease-in-out infinite' : 'none'}; transform-origin: center; }
      `}</style>
      {style === 'classic' && <LexiClassic mood={mood} />}
      {style === 'owl' && <LexiOwl mood={mood} />}
      {style === 'bot' && <LexiBot mood={mood} />}
    </div>
  );
};

const LexiClassic = () => (
  <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
    {/* shadow */}
    <ellipse cx="60" cy="110" rx="34" ry="4" fill="rgba(40,20,10,0.12)" />
    {/* body */}
    <circle cx="60" cy="62" r="44" fill="oklch(95% 0.04 60)" stroke="oklch(22% 0.025 260)" strokeWidth="2.5" />
    {/* cheeks */}
    <circle cx="38" cy="72" r="6" fill="oklch(82% 0.12 30)" opacity="0.7" />
    <circle cx="82" cy="72" r="6" fill="oklch(82% 0.12 30)" opacity="0.7" />
    {/* eyes */}
    <g>
      <ellipse className="lexi-eye" cx="48" cy="58" rx="4" ry="6" fill="oklch(22% 0.025 260)" />
      <ellipse className="lexi-eye" cx="72" cy="58" rx="4" ry="6" fill="oklch(22% 0.025 260)" />
      <circle cx="49.5" cy="56" r="1.4" fill="#fff" />
      <circle cx="73.5" cy="56" r="1.4" fill="#fff" />
    </g>
    {/* smile */}
    <path d="M50 76 Q60 84 70 76" fill="none" stroke="oklch(22% 0.025 260)" strokeWidth="2.5" strokeLinecap="round" />
    {/* star cheek */}
    <g className="lexi-sparkle">
      <path d="M96 40 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="oklch(85% 0.15 95)" stroke="oklch(22% 0.025 260)" strokeWidth="1.5" strokeLinejoin="round"/>
    </g>
    {/* waving hand */}
    <g className="lexi-hand">
      <circle cx="20" cy="66" r="8" fill="oklch(66% 0.17 35)" stroke="oklch(22% 0.025 260)" strokeWidth="2"/>
    </g>
    {/* tuft */}
    <path d="M55 20 Q60 10 65 20" fill="oklch(95% 0.04 60)" stroke="oklch(22% 0.025 260)" strokeWidth="2.5" strokeLinejoin="round"/>
  </svg>
);

const LexiOwl = () => (
  <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
    <ellipse cx="60" cy="110" rx="34" ry="4" fill="rgba(40,20,10,0.12)" />
    {/* body */}
    <ellipse cx="60" cy="72" rx="38" ry="36" fill="oklch(68% 0.12 185)" stroke="oklch(22% 0.025 260)" strokeWidth="2.5" />
    {/* belly */}
    <ellipse cx="60" cy="80" rx="22" ry="22" fill="oklch(95% 0.04 60)" stroke="oklch(22% 0.025 260)" strokeWidth="2" />
    {/* tufts */}
    <path d="M30 42 L38 28 L44 42 Z" fill="oklch(68% 0.12 185)" stroke="oklch(22% 0.025 260)" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M76 42 L82 28 L90 42 Z" fill="oklch(68% 0.12 185)" stroke="oklch(22% 0.025 260)" strokeWidth="2.5" strokeLinejoin="round"/>
    {/* eyes disk */}
    <circle cx="46" cy="58" r="13" fill="#fff" stroke="oklch(22% 0.025 260)" strokeWidth="2.5" />
    <circle cx="74" cy="58" r="13" fill="#fff" stroke="oklch(22% 0.025 260)" strokeWidth="2.5" />
    <g>
      <circle className="lexi-eye" cx="46" cy="58" r="5" fill="oklch(22% 0.025 260)" />
      <circle className="lexi-eye" cx="74" cy="58" r="5" fill="oklch(22% 0.025 260)" />
      <circle cx="47.5" cy="56" r="1.4" fill="#fff" />
      <circle cx="75.5" cy="56" r="1.4" fill="#fff" />
    </g>
    {/* beak */}
    <path d="M55 70 L60 78 L65 70 Z" fill="oklch(66% 0.17 35)" stroke="oklch(22% 0.025 260)" strokeWidth="2" strokeLinejoin="round"/>
    {/* wing waving */}
    <g className="lexi-hand" style={{transformOrigin:'28px 72px'}}>
      <ellipse cx="22" cy="78" rx="9" ry="14" fill="oklch(68% 0.12 185)" stroke="oklch(22% 0.025 260)" strokeWidth="2"/>
    </g>
    <g className="lexi-sparkle">
      <path d="M98 36 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5 z" fill="oklch(85% 0.15 95)" stroke="oklch(22% 0.025 260)" strokeWidth="1.2" strokeLinejoin="round"/>
    </g>
  </svg>
);

const LexiBot = () => (
  <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
    <ellipse cx="60" cy="110" rx="34" ry="4" fill="rgba(40,20,10,0.12)" />
    {/* antenna */}
    <line x1="60" y1="22" x2="60" y2="10" stroke="oklch(22% 0.025 260)" strokeWidth="2.5" strokeLinecap="round"/>
    <circle className="lexi-sparkle" cx="60" cy="8" r="4" fill="oklch(85% 0.15 95)" stroke="oklch(22% 0.025 260)" strokeWidth="2"/>
    {/* head */}
    <rect x="20" y="22" width="80" height="72" rx="22" fill="oklch(55% 0.14 305)" stroke="oklch(22% 0.025 260)" strokeWidth="2.5"/>
    {/* screen */}
    <rect x="30" y="40" width="60" height="34" rx="10" fill="oklch(95% 0.04 60)" stroke="oklch(22% 0.025 260)" strokeWidth="2"/>
    {/* eyes */}
    <g>
      <rect className="lexi-eye" x="44" y="52" width="7" height="10" rx="3" fill="oklch(22% 0.025 260)" />
      <rect className="lexi-eye" x="69" y="52" width="7" height="10" rx="3" fill="oklch(22% 0.025 260)" />
    </g>
    {/* mouth */}
    <path d="M48 68 Q60 74 72 68" fill="none" stroke="oklch(22% 0.025 260)" strokeWidth="2.5" strokeLinecap="round"/>
    {/* body base */}
    <rect x="44" y="94" width="32" height="10" rx="4" fill="oklch(55% 0.14 305)" stroke="oklch(22% 0.025 260)" strokeWidth="2"/>
    {/* waving arm */}
    <g className="lexi-hand" style={{transformOrigin:'24px 60px'}}>
      <rect x="10" y="56" width="16" height="8" rx="4" fill="oklch(55% 0.14 305)" stroke="oklch(22% 0.025 260)" strokeWidth="2"/>
      <circle cx="10" cy="60" r="6" fill="oklch(66% 0.17 35)" stroke="oklch(22% 0.025 260)" strokeWidth="2"/>
    </g>
  </svg>
);

window.Lexi = Lexi;
