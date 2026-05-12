// GameQuestions.v3.jsx — question banks + playable game bodies for MC, Catapult, Match

const QUESTIONS = {
  mc: [
    { prompt: '3 × 5 = ?',           opts: ['12', '15', '18', '21'],            correct: 1 },
    { prompt: '7 + 8 = ?',           opts: ['13', '14', '15', '16'],            correct: 2 },
    { prompt: 'Hoofdstad van Nederland?', opts: ['Rotterdam','Amsterdam','Utrecht','Den Haag'], correct: 1 },
    { prompt: '12 ÷ 4 = ?',          opts: ['2', '3', '4', '6'],                correct: 1 },
    { prompt: 'Welk woord is een werkwoord?', opts: ['huis','rennen','blauw','snel'], correct: 1 },
    { prompt: '9 × 6 = ?',           opts: ['54', '45', '56', '64'],            correct: 0 },
    { prompt: 'Welk dier legt eieren?', opts: ['hond','kip','koe','schaap'],   correct: 1 },
    { prompt: '100 - 37 = ?',        opts: ['53', '63', '73', '67'],            correct: 1 },
    { prompt: 'Hoeveel zijden heeft een driehoek?', opts: ['2','3','4','5'],   correct: 1 },
    { prompt: 'Welk woord rijmt op "boom"?', opts: ['fiets','kat','droom','huis'], correct: 2 },
  ],
  catapult: [
    { prompt: 'Meervoud van "huis"?',     opts: ['huizen','huisen','huisses'], correct: 0 },
    { prompt: 'Hoe schrijf je het?',      opts: ['paard','paart','paardt'],     correct: 0 },
    { prompt: 'Hij _ naar school',        opts: ['fietst','fiets','fiestd'],   correct: 0 },
    { prompt: '7 × 8 = ?',                opts: ['56','54','64'],               correct: 0 },
    { prompt: 'Verleden tijd van "lopen"?', opts: ['liep','loopte','loopde'],  correct: 0 },
    { prompt: 'Meervoud van "kind"?',     opts: ['kinderen','kindes','kinden'], correct: 0 },
    { prompt: '6 × 9 = ?',                opts: ['54','56','45'],               correct: 0 },
    { prompt: 'Hoe schrijf je het?',      opts: ['vriend','vrient','vriendt'], correct: 0 },
    { prompt: 'Zij _ een liedje',         opts: ['zingt','zingd','zinkt'],     correct: 0 },
    { prompt: '11 × 7 = ?',               opts: ['77','78','67'],               correct: 0 },
  ],
  match: [
    { prompt: 'Engels → Nederlands', pairs: [['cat','kat'],['dog','hond'],['bird','vogel']] },
    { prompt: 'Engels → Nederlands', pairs: [['house','huis'],['tree','boom'],['water','water']] },
    { prompt: 'Hoofdsteden',         pairs: [['Frankrijk','Parijs'],['Duitsland','Berlijn'],['Spanje','Madrid']] },
    { prompt: 'Sommen',              pairs: [['3+4','7'],['5×2','10'],['9-3','6']] },
    { prompt: 'Engels → Nederlands', pairs: [['red','rood'],['blue','blauw'],['green','groen']] },
    { prompt: 'Synoniemen',          pairs: [['blij','vrolijk'],['groot','reusachtig'],['snel','vlug']] },
    { prompt: 'Sommen',              pairs: [['8+8','16'],['4×5','20'],['12-4','8']] },
    { prompt: 'Engels → Nederlands', pairs: [['day','dag'],['night','nacht'],['week','week']] },
    { prompt: 'Tegenstellingen',     pairs: [['warm','koud'],['groot','klein'],['licht','donker']] },
    { prompt: 'Hoofdsteden',         pairs: [['België','Brussel'],['Italië','Rome'],['Portugal','Lissabon']] },
  ],
};

/* =============== MULTIPLE CHOICE BODY =============== */
const MCBody = ({ q, onAnswer, disabled }) => {
  const [pick, setPick] = React.useState(null);
  React.useEffect(() => { setPick(null); }, [q]);
  const choose = (i) => {
    if (disabled || pick !== null) return;
    setPick(i);
    onAnswer(i === q.correct);
  };
  return (
    <div>
      <p style={{margin:'0 0 22px', fontSize:28, fontFamily:'Bricolage Grotesque', fontWeight:600, textAlign:'center', letterSpacing:'-0.01em'}}>{q.prompt}</p>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
        {q.opts.map((o, i) => {
          const isPick = pick === i;
          const ok = isPick && i === q.correct;
          const wrong = isPick && i !== q.correct;
          return (
            <button key={i} onClick={() => choose(i)} disabled={disabled} style={{
              padding:'18px', borderRadius:12,
              border:'2px solid ' + (ok ? 'var(--ok)' : wrong ? 'oklch(60% 0.18 25)' : 'var(--line)'),
              background: ok ? 'var(--ok-soft)' : wrong ? 'oklch(95% 0.04 25)' : 'white',
              fontFamily:'Bricolage Grotesque', fontSize:22, fontWeight:600,
              color: ok ? 'var(--ok)' : wrong ? 'oklch(40% 0.18 25)' : 'var(--ink)',
              cursor: disabled ? 'default' : 'pointer', transition:'all .15s',
            }}>{o}</button>
          );
        })}
      </div>
    </div>
  );
};

/* =============== CATAPULT BODY (drag-aim, release-fire) =============== */
const CatapultBody = ({ q, onAnswer, disabled }) => {
  const SVG_W = 700, SVG_H = 360;
  const PIVOT = { x: 110, y: 295 };
  const ARM_LEN = 90;
  const REST_ANGLE = -55;
  const GROUND_Y = 305;

  const [angle, setAngle] = React.useState(REST_ANGLE);
  const [dragging, setDragging] = React.useState(false);
  const [proj, setProj] = React.useState(null);
  const [hit, setHit] = React.useState(null);
  const [fired, setFired] = React.useState(false);
  const svgRef = React.useRef(null);
  const animRef = React.useRef(null);

  // 3 targets standing on the ground, evenly spaced
  const targets = q.opts.map((label, i) => {
    const w = 110, h = 70;
    const startX = 280;
    const gap = 30;
    return {
      label,
      x: startX + i * (w + gap),
      y: GROUND_Y - h,
      w, h,
      cx: startX + i * (w + gap) + w / 2,
      cy: GROUND_Y - h / 2,
      correct: i === q.correct,
    };
  });

  // reset on new question
  React.useEffect(() => {
    setAngle(REST_ANGLE); setProj(null); setHit(null); setFired(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, [q]);

  const svgPoint = (clientX, clientY) => {
    const svg = svgRef.current; if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (SVG_W / rect.width),
      y: (clientY - rect.top) * (SVG_H / rect.height),
    };
  };

  const pointerToAngle = (clientX, clientY) => {
    const p = svgPoint(clientX, clientY);
    const dx = p.x - PIVOT.x, dy = p.y - PIVOT.y;
    let a = Math.atan2(dy, dx) * 180 / Math.PI;
    // clamp to upper-right quadrant: -85 (almost straight up) to -8 (almost flat right)
    a = Math.max(-85, Math.min(-8, a));
    return a;
  };

  const onDown = (e) => {
    if (disabled || fired) return;
    e.preventDefault();
    setDragging(true);
    const p = e.touches ? e.touches[0] : e;
    setAngle(pointerToAngle(p.clientX, p.clientY));
  };

  React.useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      e.preventDefault();
      const p = e.touches ? e.touches[0] : e;
      setAngle(pointerToAngle(p.clientX, p.clientY));
    };
    const up = () => {
      setDragging(false);
      fire();
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [dragging, angle]);

  const fire = () => {
    if (fired) return;
    setFired(true);
    const rad = angle * Math.PI / 180;
    const speed = 22;
    let vx = Math.cos(rad) * speed;
    let vy = Math.sin(rad) * speed;
    // launch from the bucket position
    const armX = PIVOT.x + Math.cos(rad) * ARM_LEN;
    const armY = PIVOT.y + Math.sin(rad) * ARM_LEN;
    let x = armX, y = armY;
    const g = 0.55;

    const step = () => {
      x += vx; y += vy; vy += g;
      // collision check (per-target rect)
      let hitIdx = null;
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        if (x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h) {
          hitIdx = i; break;
        }
      }
      // off-screen / hit ground beyond targets
      if (hitIdx !== null) {
        setProj({ x, y });
        setHit(hitIdx);
        setTimeout(() => onAnswer(targets[hitIdx].correct), 550);
        return;
      }
      if (y > GROUND_Y || x > SVG_W + 20 || x < -20) {
        setProj({ x: Math.min(Math.max(x, 0), SVG_W), y: GROUND_Y });
        // miss = wrong answer
        setTimeout(() => onAnswer(false), 550);
        return;
      }
      setProj({ x, y });
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  };

  React.useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  const armX2 = PIVOT.x + Math.cos(angle * Math.PI/180) * ARM_LEN;
  const armY2 = PIVOT.y + Math.sin(angle * Math.PI/180) * ARM_LEN;

  // trajectory preview while dragging
  const traj = React.useMemo(() => {
    if (!dragging) return [];
    const rad = angle * Math.PI / 180;
    const speed = 22;
    let vx = Math.cos(rad) * speed;
    let vy = Math.sin(rad) * speed;
    let x = armX2, y = armY2;
    const g = 0.55;
    const pts = [];
    for (let i = 0; i < 50; i++) {
      x += vx; y += vy; vy += g;
      if (y > GROUND_Y + 5 || x > SVG_W) break;
      if (i % 2 === 0) pts.push({ x, y });
    }
    return pts;
  }, [angle, dragging, armX2, armY2]);

  return (
    <div>
      <p style={{margin:'0 0 10px', fontSize:22, fontFamily:'Bricolage Grotesque', fontWeight:600, textAlign:'center', letterSpacing:'-0.01em'}}>{q.prompt}</p>
      <p style={{margin:'0 0 12px', fontSize:13, textAlign:'center', color: dragging ? 'var(--primary)' : 'var(--ink-3)', fontFamily:'JetBrains Mono', fontWeight: dragging ? 600 : 400}}>
        {fired ? '💥 schot afgevuurd!' : dragging ? '↻ richt en laat los om te schieten' : '👆 sleep de katapult-arm of het oranje balletje'}
      </p>
      <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{
        width:'100%', height:'auto', borderRadius:14,
        background:'linear-gradient(180deg, oklch(86% 0.06 220) 0%, oklch(94% 0.04 100) 60%, oklch(80% 0.08 130) 100%)',
        cursor: dragging ? 'grabbing' : (fired ? 'default' : 'grab'),
        userSelect:'none', touchAction:'none',
      }}>
        {/* clouds */}
        <ellipse cx="120" cy="50" rx="40" ry="12" fill="white" opacity="0.7"/>
        <ellipse cx="500" cy="80" rx="50" ry="14" fill="white" opacity="0.7"/>

        {/* ground */}
        <rect x="0" y={GROUND_Y} width={SVG_W} height={SVG_H - GROUND_Y} fill="oklch(72% 0.10 130)"/>
        <rect x="0" y={GROUND_Y - 3} width={SVG_W} height="5" fill="oklch(78% 0.12 130)"/>

        {/* targets */}
        {targets.map((t, i) => {
          const isHit = hit === i;
          return (
            <g key={i} style={{
              transition:'all .25s',
              transform: isHit ? `translate(0, 8px) rotate(-6deg)` : 'none',
              transformOrigin: `${t.cx}px ${t.cy}px`,
            }}>
              {/* post */}
              <rect x={t.cx - 3} y={t.y + t.h} width="6" height={GROUND_Y - (t.y + t.h)} fill="oklch(40% 0.05 60)"/>
              {/* sign */}
              <rect x={t.x} y={t.y} width={t.w} height={t.h} rx="10"
                fill={isHit ? (t.correct ? 'oklch(72% 0.16 155)' : 'oklch(68% 0.18 25)') : 'oklch(88% 0.16 95)'}
                stroke="oklch(22% 0.025 260)" strokeWidth="2.5"/>
              <text x={t.cx} y={t.cy + 7} textAnchor="middle"
                fill={isHit ? 'white' : 'oklch(22% 0.025 260)'}
                style={{fontFamily:'Bricolage Grotesque', fontSize: t.label.length > 6 ? 18 : 22, fontWeight:700}}>
                {t.label}
              </text>
            </g>
          );
        })}

        {/* trajectory preview */}
        {traj.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="white" stroke="oklch(22% 0.025 260)" strokeWidth="1" opacity={0.7 - i * 0.012}/>
        ))}

        {/* catapult base */}
        <rect x={PIVOT.x - 32} y={PIVOT.y} width="64" height="18" fill="oklch(40% 0.06 60)" rx="4"/>
        <polygon points={`${PIVOT.x-26},${PIVOT.y+18} ${PIVOT.x+26},${PIVOT.y+18} ${PIVOT.x+16},${PIVOT.y+30} ${PIVOT.x-16},${PIVOT.y+30}`} fill="oklch(32% 0.05 60)"/>

        {/* catapult arm */}
        <line x1={PIVOT.x} y1={PIVOT.y} x2={armX2} y2={armY2} stroke="oklch(35% 0.06 60)" strokeWidth="11" strokeLinecap="round"/>

        {/* drag handle / projectile pocket — bigger & easier to grab */}
        {!fired && (
          <g onMouseDown={onDown} onTouchStart={onDown} style={{ cursor: dragging ? 'grabbing' : 'grab' }}>
            {/* invisible larger hit area */}
            <circle cx={armX2} cy={armY2} r="28" fill="rgba(0,0,0,0.001)"/>
            <circle cx={armX2} cy={armY2} r="16" fill="oklch(60% 0.16 35)" stroke="oklch(22% 0.025 260)" strokeWidth="2.5"/>
            {dragging && <circle cx={armX2} cy={armY2} r="22" fill="none" stroke="oklch(60% 0.16 35)" strokeWidth="2" opacity="0.5"/>}
          </g>
        )}

        {/* pivot */}
        <circle cx={PIVOT.x} cy={PIVOT.y} r="6" fill="oklch(22% 0.025 260)"/>

        {/* projectile in flight */}
        {fired && proj && <circle cx={proj.x} cy={proj.y} r="11" fill="oklch(60% 0.14 35)" stroke="oklch(22% 0.025 260)" strokeWidth="2"/>}

        {/* invisible drag overlay covers full SVG so user can drag from anywhere when started */}
        {dragging && <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="rgba(0,0,0,0)" style={{pointerEvents:'none'}}/>}
      </svg>
    </div>
  );
};

/* =============== MATCH BODY =============== */
const MatchBody = ({ q, onAnswer, disabled }) => {
  const pairs = q.pairs;
  const [matched, setMatched] = React.useState({});
  const [pickL, setPickL] = React.useState(null);
  const [pickR, setPickR] = React.useState(null);
  const [shake, setShake] = React.useState(null);

  // shuffle right column
  const rightOrder = React.useMemo(() => {
    const idx = pairs.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }, [q]);

  React.useEffect(() => { setMatched({}); setPickL(null); setPickR(null); }, [q]);

  React.useEffect(() => {
    if (pickL !== null && pickR !== null) {
      if (pickL === pickR) {
        const next = { ...matched, [pickL]: true };
        setMatched(next);
        setPickL(null); setPickR(null);
        if (Object.keys(next).length === pairs.length) {
          setTimeout(() => onAnswer(true), 600);
        }
      } else {
        setShake(`${pickL}-${pickR}`);
        const id = setTimeout(() => { setPickL(null); setPickR(null); setShake(null); }, 500);
        return () => clearTimeout(id);
      }
    }
  }, [pickL, pickR]);

  const tile = (label, idx, side, isPick, isMatched, isShake) => (
    <button key={side+idx} onClick={() => {
      if (disabled || isMatched) return;
      (side === 'l' ? setPickL : setPickR)(idx);
    }} style={{
      padding:'16px 14px', borderRadius:12,
      border:'2px solid ' + (isMatched ? 'var(--ok)' : isPick ? 'var(--ink)' : 'var(--line)'),
      background: isMatched ? 'var(--ok-soft)' : isPick ? 'var(--bg-2)' : 'white',
      color: isMatched ? 'var(--ok)' : 'var(--ink)',
      fontFamily:'Bricolage Grotesque', fontWeight:600, fontSize:18,
      cursor: isMatched || disabled ? 'default' : 'pointer',
      animation: isShake ? 'match-shake .4s' : 'none',
      transition:'all .15s',
    }}>{label}</button>
  );

  return (
    <div>
      <p style={{margin:'0 0 18px', fontSize:22, fontFamily:'Bricolage Grotesque', fontWeight:600, textAlign:'center', letterSpacing:'-0.01em'}}>{q.prompt}</p>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <div style={{display:'grid', gap:10}}>
          {pairs.map((p, i) => tile(p[0], i, 'l', pickL === i, matched[i],
            shake && shake.startsWith(i + '-')))}
        </div>
        <div style={{display:'grid', gap:10}}>
          {rightOrder.map((origIdx) => tile(pairs[origIdx][1], origIdx, 'r',
            pickR === origIdx, matched[origIdx],
            shake && shake.endsWith('-' + origIdx)))}
        </div>
      </div>
      <style>{`@keyframes match-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`}</style>
    </div>
  );
};

window.QUESTIONS = QUESTIONS;
window.GAME_BODIES = { mc: MCBody, catapult: CatapultBody, match: MatchBody };
