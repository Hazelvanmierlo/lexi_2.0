// Games.v3.jsx — 5 mini-game previews. Each is a small interactive demo.
// Exports: GAMES (registry), GamePreview (renders a chosen game)

const GAMES = [
  { id:'mc',       name:'Multiple choice', icon:'◉', desc:'4 opties, instant feedback', subjects:['rekenen','taal','wo','engels'], age:'groep 1–8' },
  { id:'type',     name:'Intypen',         icon:'⌨', desc:'Open antwoord, spelling-tolerant', subjects:['rekenen','taal'], age:'groep 3–8' },
  { id:'catapult', name:'Katapult',        icon:'⤴', desc:'Schiet op het juiste antwoord', subjects:['rekenen','taal'], age:'groep 3–6' },
  { id:'match',   name:'Match-paren',      icon:'⇄', desc:'Sleep paren bij elkaar', subjects:['taal','wo','engels'], age:'groep 2–8' },
  { id:'order',   name:'Sorteer',          icon:'☰', desc:'Zet in juiste volgorde', subjects:['rekenen','taal','wo'], age:'groep 3–8' },
];

const GamePreview = ({ id, compact = false }) => {
  if (id === 'mc')       return <MCGame compact={compact} />;
  if (id === 'type')     return <TypeGame compact={compact} />;
  if (id === 'catapult') return <CatapultGame compact={compact} />;
  if (id === 'match')    return <MatchGame compact={compact} />;
  if (id === 'order')    return <OrderGame compact={compact} />;
  return null;
};

/* ---------- 1. MULTIPLE CHOICE ---------- */
const MCGame = ({ compact }) => {
  const [pick, setPick] = React.useState(null);
  const correct = 1;
  const opts = ['12', '15', '18', '21'];
  return (
    <GameFrame compact={compact} title="3 × 5 = ?">
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
        {opts.map((o,i) => {
          const isPick = pick === i;
          const ok = isPick && i === correct;
          const wrong = isPick && i !== correct;
          return (
            <button key={i} onClick={() => setPick(i)} style={{
              padding: compact ? '10px' : '14px', borderRadius:10,
              border:'1.5px solid ' + (ok ? 'var(--ok)' : wrong ? 'oklch(60% 0.18 25)' : 'var(--line)'),
              background: ok ? 'var(--ok-soft)' : wrong ? 'oklch(95% 0.04 25)' : 'white',
              fontFamily:'Bricolage Grotesque', fontSize: compact ? 16 : 20, fontWeight:600,
              color: ok ? 'var(--ok)' : wrong ? 'oklch(40% 0.18 25)' : 'var(--ink)',
              cursor:'pointer', transition:'all .2s',
            }}>{o}</button>
          );
        })}
      </div>
    </GameFrame>
  );
};

/* ---------- 2. TYPEN ---------- */
const TypeGame = ({ compact }) => {
  const [val, setVal] = React.useState('');
  const ok = val.trim() === 'paard';
  return (
    <GameFrame compact={compact} title="Type het woord. Een dier met 4 poten en manen.">
      <div style={{display:'flex', gap:8}}>
        <input value={val} onChange={e => setVal(e.target.value)} placeholder="..." style={{
          flex:1, padding: compact ? '10px 12px' : '14px 16px',
          borderRadius:10, border:'1.5px solid ' + (ok ? 'var(--ok)' : 'var(--line)'),
          fontFamily:'Bricolage Grotesque', fontSize: compact ? 16 : 20, fontWeight:600,
          background: ok ? 'var(--ok-soft)' : 'white', color: ok ? 'var(--ok)' : 'var(--ink)',
          outline:'none',
        }}/>
        <button onClick={() => setVal(val)} style={{
          padding: compact ? '10px 12px' : '14px 16px', borderRadius:10, border:0,
          background:'var(--ink)', color:'white', fontWeight:600, cursor:'pointer', fontSize:14,
        }}>Check</button>
      </div>
      {ok && <p style={{margin:'8px 0 0', color:'var(--ok)', fontSize:13, fontWeight:500}}>✓ Goed!</p>}
    </GameFrame>
  );
};

/* ---------- 3. KATAPULT ---------- */
const CatapultGame = ({ compact }) => {
  const [hit, setHit] = React.useState(null);
  const [aim, setAim] = React.useState(0);
  const targets = [
    { l:'huis', x:20 },
    { l:'huiz', x:50 },
    { l:'huijs', x:80 },
  ];
  const correct = 0;
  React.useEffect(() => {
    const id = setInterval(() => setAim(a => (a + 1) % 3), 700);
    return () => clearInterval(id);
  }, []);
  const fire = (i) => setHit(i);
  return (
    <GameFrame compact={compact} title="Schiet op de juiste spelling: meervoud van 'huis'? (klik!)">
      <div style={{position:'relative', height: compact ? 120 : 160, background:'linear-gradient(180deg, oklch(92% 0.04 220), oklch(96% 0.02 100))', borderRadius:10, overflow:'hidden', border:'1px solid var(--line-2)'}}>
        {/* ground */}
        <div style={{position:'absolute', left:0, right:0, bottom:0, height:'30%', background:'oklch(82% 0.06 130)'}}/>
        {/* targets */}
        {targets.map((t,i) => {
          const isHit = hit === i;
          const isCorrect = i === correct;
          return (
            <button key={i} onClick={() => fire(i)} style={{
              position:'absolute', left: t.x + '%', bottom: '35%', transform:'translateX(-50%)',
              width: compact ? 50 : 64, height: compact ? 38 : 48,
              border:'2px solid var(--ink)', borderRadius:8,
              background: isHit ? (isCorrect ? 'var(--ok)' : 'oklch(60% 0.18 25)') : 'oklch(85% 0.15 95)',
              color: isHit ? 'white' : 'var(--ink)',
              fontFamily:'Bricolage Grotesque', fontWeight:700, fontSize: compact ? 13 : 15,
              cursor:'pointer', transition:'all .25s',
              animation: isHit ? 'cat-shake .3s ease-out' : 'none',
            }}>{t.l}</button>
          );
        })}
        {/* catapult */}
        <div style={{position:'absolute', left: 6 + aim * 4 + '%', bottom: '32%', fontSize: compact ? 22 : 28, transition:'left .5s'}}>⚙</div>
        <style>{`@keyframes cat-shake { 0%,100% { transform: translateX(-50%) rotate(0); } 50% { transform: translateX(-50%) rotate(-8deg) scale(1.05); } }`}</style>
      </div>
    </GameFrame>
  );
};

/* ---------- 4. MATCH-PAREN ---------- */
const MatchGame = ({ compact }) => {
  const pairs = [
    { l:'cat',  r:'kat' },
    { l:'dog',  r:'hond' },
    { l:'bird', r:'vogel' },
  ];
  const [matched, setMatched] = React.useState({});
  const [pickL, setPickL] = React.useState(null);
  const [pickR, setPickR] = React.useState(null);

  React.useEffect(() => {
    if (pickL !== null && pickR !== null) {
      if (pickL === pickR) {
        setMatched(m => ({ ...m, [pickL]: true }));
      }
      const id = setTimeout(() => { setPickL(null); setPickR(null); }, 400);
      return () => clearTimeout(id);
    }
  }, [pickL, pickR]);

  const cell = (label, idx, side, isPick, isMatched) => (
    <button key={side+idx} onClick={() => { if (!isMatched) (side==='l' ? setPickL : setPickR)(idx); }}
      style={{
        padding: compact ? '8px 10px' : '12px 14px', borderRadius:10,
        border:'1.5px solid ' + (isMatched ? 'var(--ok)' : isPick ? 'var(--ink)' : 'var(--line)'),
        background: isMatched ? 'var(--ok-soft)' : isPick ? 'var(--bg-2)' : 'white',
        color: isMatched ? 'var(--ok)' : 'var(--ink)',
        fontFamily:'Bricolage Grotesque', fontWeight:600, fontSize: compact ? 14 : 16,
        cursor: isMatched ? 'default' : 'pointer',
      }}>{label}</button>
  );

  return (
    <GameFrame compact={compact} title="Sleep de paren bij elkaar (Engels → Nederlands)">
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
        <div style={{display:'grid', gap:6}}>
          {pairs.map((p,i) => cell(p.l, i, 'l', pickL === i, matched[i]))}
        </div>
        <div style={{display:'grid', gap:6}}>
          {[2,0,1].map((i, k) => cell(pairs[i].r, i, 'r', pickR === i, matched[i]))}
        </div>
      </div>
    </GameFrame>
  );
};

/* ---------- 5. SORTEER / VOLGORDE ---------- */
const OrderGame = ({ compact }) => {
  const correct = ['1/8','1/4','1/2','3/4'];
  const [order, setOrder] = React.useState(['3/4','1/2','1/8','1/4']);
  const swap = (i) => {
    if (i === order.length - 1) return;
    const next = [...order];
    [next[i], next[i+1]] = [next[i+1], next[i]];
    setOrder(next);
  };
  const isOk = order.join() === correct.join();
  return (
    <GameFrame compact={compact} title="Zet van klein naar groot (klik om te swappen →)">
      <div style={{display:'flex', gap:6}}>
        {order.map((v,i) => (
          <React.Fragment key={i}>
            <div style={{
              flex:1, padding: compact ? '10px' : '14px', textAlign:'center',
              borderRadius:10, border:'1.5px solid ' + (isOk ? 'var(--ok)' : 'var(--line)'),
              background: isOk ? 'var(--ok-soft)' : 'white',
              fontFamily:'Bricolage Grotesque', fontWeight:700, fontSize: compact ? 16 : 20,
              color: isOk ? 'var(--ok)' : 'var(--ink)',
            }}>{v}</div>
            {i < order.length-1 && (
              <button onClick={() => swap(i)} style={{
                background:'none', border:'1.5px solid var(--line)', borderRadius:8, cursor:'pointer',
                padding:'0 8px', color:'var(--ink-3)', fontSize:14,
              }}>⇄</button>
            )}
          </React.Fragment>
        ))}
      </div>
    </GameFrame>
  );
};

/* ---------- frame ---------- */
const GameFrame = ({ title, children, compact }) => (
  <div style={{display:'grid', gap: compact ? 10 : 14}}>
    <p style={{margin:0, fontSize: compact ? 12 : 14, color:'var(--ink-2)', fontWeight:500}}>{title}</p>
    {children}
  </div>
);

window.GAMES = GAMES;
window.GamePreview = GamePreview;
