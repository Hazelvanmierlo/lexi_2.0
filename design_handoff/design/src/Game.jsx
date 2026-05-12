// LexiGame — "Vang het juiste antwoord"
// Drie Lexi-stijlen (Cirkel / Uil / Robot) bewegen over het speelveld, elk met een antwoord.
// Kind tikt op de Lexi die het goede antwoord draagt. Adaptief: sneller bij goed, rustiger bij fout.

const LEXI_STYLES = ['classic', 'owl', 'bot'];
const STYLE_LABELS = { classic: 'Cirkel', owl: 'Uil', bot: 'Robot' };

const QUESTIONS = [
  { q: 'Hoeveel is 6 × 7?', opts: ['42', '36', '48'], correct: 0, subj: 'Rekenen', goal: 'REK-4.2 · Tafels' },
  { q: 'Welk woord is goed gespeld?', opts: ['fietst', 'fiets', 'viets'], correct: 0, subj: 'Taal', goal: 'TAAL-5.2 · Werkwoordspelling' },
  { q: 'Wat is de hoofdstad van België?', opts: ['Antwerpen', 'Brussel', 'Brugge'], correct: 1, subj: 'Wereldoriëntatie', goal: 'WO-5.1 · Topografie' },
  { q: 'Hoeveel is ½ + ¼?', opts: ['¾', '⅔', '⅖'], correct: 0, subj: 'Rekenen', goal: 'REK-5.4 · Breuken optellen' },
  { q: 'Welk woord rijmt op "maan"?', opts: ['boom', 'baan', 'been'], correct: 1, subj: 'Taal', goal: 'TAAL-3.1 · Rijm' },
  { q: 'Hoeveel is 144 ÷ 12?', opts: ['11', '12', '14'], correct: 1, subj: 'Rekenen', goal: 'REK-6.3 · Delen' },
  { q: 'Welk dier is een roofdier?', opts: ['konijn', 'vos', 'schaap'], correct: 1, subj: 'Natuur', goal: 'WO-4.2 · Dierenrijk' },
  { q: 'Hoe schrijf je "hij rent"?', opts: ['hij rennt', 'hij rent', 'hij rend'], correct: 1, subj: 'Taal', goal: 'TAAL-5.2 · Werkwoordspelling' },
];

const LexiGame = ({ setRoute }) => {
  const [phase, setPhase] = React.useState('intro'); // intro | playing | result
  const [round, setRound] = React.useState(0);
  const [score, setScore] = React.useState({ correct: 0, total: 0, streak: 0, xp: 0 });
  const [level, setLevel] = React.useState(1); // adaptive 1..5
  const [feedback, setFeedback] = React.useState(null); // {ok, msg}
  const [floaters, setFloaters] = React.useState([]); // +XP pops

  const q = QUESTIONS[round % QUESTIONS.length];

  // Shuffle style→answer mapping per round
  const mapping = React.useMemo(() => {
    const styles = [...LEXI_STYLES].sort(() => Math.random() - 0.5);
    return q.opts.map((opt, i) => ({ style: styles[i], answer: opt, isCorrect: i === q.correct }));
  }, [round]);

  const speed = 1 + level * 0.35; // adaptive speed multiplier
  const runners = mapping.length;

  const pick = (entry) => {
    if (feedback) return;
    const ok = entry.isCorrect;
    const xpGain = ok ? 10 + level * 5 : 0;
    setFeedback({ ok, msg: ok ? `+${xpGain} XP — goed!` : `Bijna — het juiste antwoord was "${q.opts[q.correct]}".` });
    setScore(s => ({
      correct: s.correct + (ok ? 1 : 0),
      total: s.total + 1,
      streak: ok ? s.streak + 1 : 0,
      xp: s.xp + xpGain,
    }));
    setLevel(l => Math.max(1, Math.min(5, l + (ok ? 1 : -1))));
    if (ok) {
      const id = Date.now();
      setFloaters(f => [...f, { id, x: 50 + Math.random() * 40, xp: xpGain }]);
      setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1200);
    }
    setTimeout(() => {
      setFeedback(null);
      if (score.total + 1 >= 8) setPhase('result');
      else setRound(r => r + 1);
    }, 1400);
  };

  const start = () => {
    setPhase('playing');
    setRound(0);
    setScore({ correct: 0, total: 0, streak: 0, xp: 0 });
    setLevel(1);
    setFeedback(null);
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-2)', padding: '32px 20px 60px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <button onClick={() => setRoute('dashboard')} style={{ background: 'none', border: 0, color: 'var(--ink-2)', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Stoppen
          </button>
          <div style={{ display: 'flex', gap: 14, fontSize: 13, color: 'var(--ink-2)', fontFamily: 'JetBrains Mono', flexWrap: 'wrap' }}>
            <span>ronde <b style={{ color: 'var(--ink)' }}>{score.total + (phase === 'result' ? 0 : 1)}/8</b></span>
            <span>·</span>
            <span style={{ color: 'var(--ok)' }}>{score.correct} goed</span>
            <span>·</span>
            <span>niveau {level}</span>
            <span>·</span>
            <span style={{ color: 'var(--primary)' }}>{score.xp} XP</span>
          </div>
        </div>

        {/* Intro */}
        {phase === 'intro' && <GameIntro start={start} />}

        {/* Playing */}
        {phase === 'playing' && (
          <div style={{ background: 'white', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            {/* Question */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <p className="mono" style={{ margin: 0, fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{q.subj} · {q.goal}</p>
                <h2 style={{ margin: '6px 0 0', fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{q.q}</h2>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} style={{ width: 20, height: 4, borderRadius: 2, background: i < score.total ? 'var(--primary)' : 'var(--line)' }} />
                ))}
              </div>
            </div>

            {/* Playfield */}
            <Playfield mapping={mapping} pick={pick} speed={speed} disabled={!!feedback} feedback={feedback} floaters={floaters} />

            {/* Legend */}
            <div style={{ padding: '14px 28px', borderTop: '1px solid var(--line-2)', background: 'var(--bg-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-2)' }}>Tik op de Lexi met het juiste antwoord.</p>
              {score.streak >= 2 && (
                <span style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--sun-soft)', fontSize: 12, fontWeight: 600, color: 'oklch(45% 0.14 80)' }}>🔥 {score.streak} op rij</span>
              )}
            </div>
          </div>
        )}

        {/* Result */}
        {phase === 'result' && <GameResult score={score} start={start} setRoute={setRoute} />}
      </div>
    </main>
  );
};

const GameIntro = ({ start }) => (
  <div style={{ background: 'white', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '48px 32px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
    <p className="mono" style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mini-spel</p>
    <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', letterSpacing: '-0.02em', margin: '8px 0 12px', lineHeight: 1.05 }}>Vang het juiste antwoord.</h1>
    <p style={{ margin: '0 auto 32px', maxWidth: 520, color: 'var(--ink-2)', fontSize: 16 }}>
      Drie Lexi's rennen over het speelveld. Tik op de Lexi die het juiste antwoord vasthoudt. Hoe vaker je het goed hebt, hoe sneller ze gaan.
    </p>
    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
      {LEXI_STYLES.map(s => (
        <div key={s} style={{ display: 'grid', placeItems: 'center', gap: 6 }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--bg-2)', border: '1.5px solid var(--line)', display: 'grid', placeItems: 'center' }}>
            <Lexi style={s} size={74} />
          </div>
          <p className="mono" style={{ margin: 0, fontSize: 11, color: 'var(--ink-3)' }}>{STYLE_LABELS[s]}</p>
        </div>
      ))}
    </div>
    <button onClick={start} style={{ background: 'var(--ink)', color: 'white', border: 0, padding: '16px 28px', borderRadius: 14, fontWeight: 600, fontSize: 16, display: 'inline-flex', gap: 10, alignItems: 'center', fontFamily: 'Geist', cursor: 'pointer' }}>
      Start het spel
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
    </button>
  </div>
);

const Playfield = ({ mapping, pick, speed, disabled, feedback, floaters }) => {
  const n = mapping.length;
  return (
    <div style={{ position: 'relative', height: 360, background: 'linear-gradient(180deg, oklch(97% 0.02 200), oklch(94% 0.04 95))', overflow: 'hidden' }}>
      {/* ground */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 80, background: 'linear-gradient(180deg, transparent, oklch(92% 0.04 135) 40%)' }} />
      {/* dotted track lines */}
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, right: 0,
          top: `${(i + 1) * (100 / (n + 1))}%`,
          borderTop: '1.5px dashed oklch(85% 0.02 260)', opacity: 0.5,
        }} />
      ))}
      {/* clouds */}
      <Cloud x="10%" y="12%" />
      <Cloud x="70%" y="22%" s={0.8} />
      <Cloud x="42%" y="6%" s={1.1} />

      {/* runners */}
      {mapping.map((m, i) => (
        <Runner
          key={i + '-' + m.answer}
          entry={m}
          row={i}
          rows={n}
          speed={speed * (0.85 + i * 0.1)}
          onClick={() => pick(m)}
          disabled={disabled}
          flash={feedback ? (m.isCorrect ? 'ok' : (feedback && !feedback.ok ? null : null)) : null}
        />
      ))}

      {/* feedback overlay */}
      {feedback && (
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)',
        }}>
          <div style={{
            background: feedback.ok ? 'var(--ok)' : 'var(--ink)', color: 'white',
            padding: '16px 24px', borderRadius: 14, fontFamily: 'Bricolage Grotesque',
            fontWeight: 600, fontSize: 20, boxShadow: 'var(--shadow-lg)',
            display: 'inline-flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>{feedback.ok ? '🎉' : '💡'}</span>
            {feedback.msg}
          </div>
        </div>
      )}

      {/* XP floaters */}
      {floaters.map(f => (
        <div key={f.id} style={{
          position: 'absolute', left: f.x + '%', top: '50%',
          color: 'var(--primary)', fontWeight: 700, fontFamily: 'Bricolage Grotesque',
          fontSize: 28, animation: 'xp-rise 1.2s ease-out forwards', pointerEvents: 'none',
        }}>+{f.xp}</div>
      ))}

      <style>{`
        @keyframes xp-rise { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-80px); opacity: 0; } }
        @keyframes run-left { from { left: 102%; } to { left: -20%; } }
        @keyframes run-bounce { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(2deg); } }
      `}</style>
    </div>
  );
};

const Runner = ({ entry, row, rows, speed, onClick, disabled }) => {
  const top = `${((row + 1) * (100 / (rows + 1))) - 8}%`;
  const dur = 7 / speed; // seconds to cross
  const delay = row * 0.8;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        position: 'absolute', top, left: '102%',
        background: 'none', border: 0, padding: 0, cursor: disabled ? 'default' : 'pointer',
        animation: `run-left ${dur}s linear ${delay}s infinite`,
        transformOrigin: 'center',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        animation: 'run-bounce 0.5s ease-in-out infinite',
      }}>
        <Lexi style={entry.style} size={72} float={false} />
        <div style={{
          background: 'white', border: '2px solid var(--ink)', borderRadius: 14,
          padding: '8px 14px', boxShadow: 'var(--shadow)',
          fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 20,
          letterSpacing: '-0.01em', color: 'var(--ink)', whiteSpace: 'nowrap',
        }}>{entry.answer}</div>
      </div>
    </button>
  );
};

const Cloud = ({ x, y, s = 1 }) => (
  <svg width={70 * s} height={32 * s} viewBox="0 0 70 32" style={{ position: 'absolute', left: x, top: y, opacity: 0.8 }}>
    <ellipse cx="20" cy="20" rx="18" ry="10" fill="white"/>
    <ellipse cx="38" cy="16" rx="16" ry="12" fill="white"/>
    <ellipse cx="52" cy="20" rx="14" ry="9" fill="white"/>
  </svg>
);

const GameResult = ({ score, start, setRoute }) => {
  const pct = Math.round((score.correct / Math.max(1, score.total)) * 100);
  const tier = pct >= 90 ? { t: 'Superster', c: 'var(--ok)' } : pct >= 70 ? { t: 'Goed bezig', c: 'var(--primary)' } : pct >= 50 ? { t: 'Je leert snel', c: 'var(--teal)' } : { t: 'Oefenen maakt sterk', c: 'var(--sun)' };
  return (
    <div style={{ background: 'white', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '48px 32px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'grid', placeItems: 'center', marginBottom: 20 }}>
        <Lexi style="classic" size={140} />
      </div>
      <p className="mono" style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ronde afgelopen</p>
      <h1 style={{ fontSize: 'clamp(30px, 5vw, 44px)', letterSpacing: '-0.02em', margin: '6px 0 8px', color: tier.c }}>{tier.t}!</h1>
      <p style={{ margin: '0 0 28px', color: 'var(--ink-2)', fontSize: 16 }}>Je had <b style={{ color: 'var(--ink)' }}>{score.correct} van {score.total}</b> goed ({pct}%).</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 520, margin: '0 auto 32px' }}>
        {[
          { l: 'XP verdiend', v: score.xp },
          { l: 'Beste reeks', v: score.streak },
          { l: 'Eindniveau', v: Math.max(1, Math.min(5, 1 + Math.floor(pct / 20))) },
        ].map((s, i) => (
          <div key={i} style={{ padding: 16, background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--line-2)' }}>
            <p style={{ margin: 0, fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>{s.v}</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)' }}>{s.l}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={start} style={{ background: 'var(--ink)', color: 'white', border: 0, padding: '14px 22px', borderRadius: 12, fontWeight: 600, fontSize: 15, fontFamily: 'Geist', cursor: 'pointer' }}>Opnieuw spelen</button>
        <button onClick={() => setRoute('dashboard')} style={{ background: 'white', color: 'var(--ink)', border: '1.5px solid var(--line)', padding: '14px 22px', borderRadius: 12, fontWeight: 600, fontSize: 15, fontFamily: 'Geist', cursor: 'pointer' }}>Terug naar dashboard</button>
      </div>
    </div>
  );
};

window.LexiGame = LexiGame;
