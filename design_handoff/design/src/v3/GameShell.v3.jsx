// GameShell.v3.jsx — full playable game flow: intro → explain → play → end
// Wraps a game body that exposes { questions, renderQuestion } via QUESTIONS + GAME_BODIES registry

const COIN_PER_CORRECT = 5;

const GameShell = ({ gameId, quizTitle, customExplain, group = '5', onExit, lexiStyle }) => {
  const [phase, setPhase] = React.useState('explain'); // explain | play | end
  const [qIdx, setQIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState([]); // {correct, idx}
  const [coinBurst, setCoinBurst] = React.useState(0);

  const questions = (window.QUESTIONS || {})[gameId] || [];
  const total = questions.length;
  const correctCount = answers.filter(a => a.correct).length;
  const coinsEarned = correctCount * COIN_PER_CORRECT;
  const isYoung = ['1','2','3'].includes(String(group));

  const onAnswer = (correct) => {
    setAnswers(a => [...a, { correct, idx: qIdx }]);
    if (correct) setCoinBurst(b => b + 1);
    setTimeout(() => {
      if (qIdx + 1 >= total) setPhase('end');
      else setQIdx(qIdx + 1);
    }, 650);
  };

  return (
    <div style={{position:'fixed', inset:0, background:'linear-gradient(180deg, oklch(95% 0.05 220), oklch(96% 0.03 100))', zIndex:100, overflow:'auto'}}>
      {/* top bar */}
      <div style={{position:'sticky', top:0, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', borderBottom:'1px solid var(--line)', padding:'10px 18px', display:'flex', alignItems:'center', gap:14, zIndex:5}}>
        <button onClick={onExit} style={{background:'none', border:'1.5px solid var(--line)', borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:13}}>← Stop</button>
        <div style={{flex:1, display:'flex', gap:3}}>
          {Array.from({length: total}).map((_, i) => {
            const a = answers[i];
            const isNow = i === qIdx && phase === 'play';
            return <div key={i} style={{
              flex:1, height:6, borderRadius:3,
              background: a ? (a.correct ? 'var(--ok)' : 'oklch(70% 0.15 25)') : isNow ? 'var(--ink)' : 'var(--line-2)',
              transition:'all .3s',
            }}/>;
          })}
        </div>
        <CoinBadgeAnim n={coinsEarned} burst={coinBurst} />
      </div>

      {phase === 'explain' && (
        <ExplainFlow gameId={gameId} customExplain={customExplain} isYoung={isYoung} lexiStyle={lexiStyle} onStart={() => setPhase('play')} />
      )}

      {phase === 'play' && questions[qIdx] && (
        <PlayPhase
          gameId={gameId}
          q={questions[qIdx]}
          qIdx={qIdx}
          total={total}
          quizTitle={quizTitle}
          lexiStyle={lexiStyle}
          onAnswer={onAnswer}
        />
      )}

      {phase === 'end' && (
        <EndScreen
          quizTitle={quizTitle}
          total={total}
          correct={correctCount}
          coins={coinsEarned}
          lexiStyle={lexiStyle}
          onAgain={() => { setQIdx(0); setAnswers([]); setCoinBurst(0); setPhase('explain'); }}
          onExit={onExit}
        />
      )}
    </div>
  );
};

/* ---------- EXPLAIN FLOW (steps + TTS + demo) ---------- */
const DEFAULT_EXPLAIN = {
  mc: {
    steps: [
      { text: 'Lees de vraag rustig door.', icon: '👀' },
      { text: 'Kies één van de vier antwoorden.', icon: '◉' },
      { text: 'Goed antwoord wordt groen, fout wordt rood.', icon: '✓' },
    ],
    demo: 'mc',
  },
  catapult: {
    steps: [
      { text: 'Lees de vraag bovenaan.', icon: '👀' },
      { text: 'Sleep de katapult om te richten.', icon: '↔' },
      { text: 'Laat los om te schieten naar het juiste antwoord!', icon: '⤴' },
    ],
    demo: 'catapult',
  },
  match: {
    steps: [
      { text: 'Je ziet twee rijen met woordjes.', icon: '⇅' },
      { text: 'Tik er één links, dan één rechts.', icon: '◉' },
      { text: 'Horen ze bij elkaar? Dan blijven ze groen!', icon: '✓' },
    ],
    demo: 'match',
  },
};

const ExplainFlow = ({ gameId, customExplain, isYoung, lexiStyle, onStart }) => {
  const data = customExplain && customExplain.steps?.length ? customExplain : DEFAULT_EXPLAIN[gameId] || DEFAULT_EXPLAIN.mc;
  const [step, setStep] = React.useState(0);
  const [speaking, setSpeaking] = React.useState(false);

  const speak = (text) => {
    try {
      window.speechSynthesis?.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'nl-NL'; u.rate = 0.95; u.pitch = 1.1;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis?.speak(u);
    } catch { setSpeaking(false); }
  };

  React.useEffect(() => {
    if (isYoung) speak(data.steps[step].text);
    return () => { try { window.speechSynthesis?.cancel(); } catch {} };
  }, [step, isYoung]);

  const isLast = step >= data.steps.length - 1;
  const next = () => isLast ? onStart() : setStep(step + 1);
  const skip = () => onStart();

  return (
    <main style={{maxWidth:760, margin:'0 auto', padding:'40px 20px 80px'}}>
      <div style={{textAlign:'center', marginBottom:30}}>
        <div style={{display:'inline-block', position:'relative'}}>
          <Lexi style={lexiStyle} size={isYoung ? 130 : 100} />
          {speaking && <SpeakerWave />}
        </div>
        <p style={{margin:'14px 0 4px', fontSize:12, fontFamily:'JetBrains Mono', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em'}}>Stap {step + 1} van {data.steps.length}</p>
      </div>

      <div style={{background:'white', borderRadius:'var(--radius-lg)', border:'2px solid var(--line)', padding: isYoung ? 30 : 26, boxShadow:'var(--shadow-lg)', textAlign:'center'}}>
        <div style={{fontSize: isYoung ? 80 : 56, marginBottom:16, lineHeight:1}}>{data.steps[step].icon}</div>
        <p style={{margin:'0 0 24px', fontSize: isYoung ? 26 : 22, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.01em', lineHeight:1.3}}>
          {data.steps[step].text}
        </p>

        {/* TTS button */}
        <button onClick={() => speak(data.steps[step].text)} style={{
          display:'inline-flex', alignItems:'center', gap:8,
          padding:'10px 16px', borderRadius:999,
          background: speaking ? 'var(--primary-soft)' : 'var(--bg-2)',
          border:'1.5px solid ' + (speaking ? 'var(--primary)' : 'var(--line)'),
          fontSize:14, fontWeight:500, cursor:'pointer', marginBottom:18,
          color: speaking ? 'var(--primary-ink)' : 'var(--ink)',
        }}>
          <span style={{fontSize:18}}>{speaking ? '◉' : '🔊'}</span> {speaking ? 'Lexi praat...' : 'Lees voor'}
        </button>

        <div style={{display:'flex', gap:10, justifyContent:'center'}}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={shellBtn.ghost}>← Terug</button>
          )}
          <button onClick={next} style={{...shellBtn.primary, fontSize: isYoung ? 18 : 16, padding: isYoung ? '14px 28px' : '12px 22px'}}>
            {isLast ? 'Start! ▶' : 'Volgende →'}
          </button>
        </div>
      </div>

      <div style={{textAlign:'center', marginTop:18}}>
        <button onClick={skip} style={{background:'none', border:0, color:'var(--ink-3)', fontSize:13, textDecoration:'underline', cursor:'pointer'}}>
          Ik weet hoe het werkt — sla over
        </button>
      </div>
    </main>
  );
};

const SpeakerWave = () => (
  <span style={{
    position:'absolute', right:-6, top:-6, width:30, height:30, borderRadius:'50%',
    background:'var(--primary)', color:'white', display:'grid', placeItems:'center',
    fontSize:14, animation:'pulse-wave 1s ease-out infinite', boxShadow:'0 0 0 0 var(--primary)',
  }}>
    ♪
    <style>{`@keyframes pulse-wave { 0% { box-shadow: 0 0 0 0 oklch(66% 0.17 35 / 0.5); } 100% { box-shadow: 0 0 0 14px oklch(66% 0.17 35 / 0); } }`}</style>
  </span>
);

/* ---------- PLAY PHASE ---------- */
const PlayPhase = ({ gameId, q, qIdx, total, quizTitle, lexiStyle, onAnswer }) => {
  const [feedback, setFeedback] = React.useState(null); // 'correct' | 'wrong'

  const handle = (correct) => {
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => { setFeedback(null); onAnswer(correct); }, 600);
  };

  const Body = (window.GAME_BODIES || {})[gameId];

  return (
    <main style={{maxWidth:760, margin:'0 auto', padding:'24px 20px 80px'}}>
      <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:18}}>
        <div style={{flex:1}}>
          <p style={{margin:0, fontSize:11, fontFamily:'JetBrains Mono', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em'}}>
            {quizTitle} · vraag {qIdx + 1} van {total}
          </p>
        </div>
      </div>

      <div style={{background:'white', borderRadius:'var(--radius-lg)', border:'2px solid var(--line)', padding:24, boxShadow:'var(--shadow-lg)', position:'relative'}}>
        {Body && <Body q={q} onAnswer={handle} disabled={!!feedback} />}

        {feedback && <FeedbackOverlay kind={feedback} lexiStyle={lexiStyle} />}
      </div>
    </main>
  );
};

const FeedbackOverlay = ({ kind, lexiStyle }) => {
  const messages = {
    correct: ['Top!', 'Goed zo!', 'Yes!', 'Geweldig!', 'Lekker bezig!'],
    wrong:   ['Bijna!', 'Probeer de volgende!', 'Niet erg!', 'Doorgaan!'],
  };
  const msg = messages[kind][Math.floor(Math.random() * messages[kind].length)];
  return (
    <div style={{
      position:'absolute', inset:0, borderRadius:'var(--radius-lg)',
      background: kind === 'correct' ? 'oklch(94% 0.08 155 / 0.92)' : 'oklch(94% 0.06 25 / 0.92)',
      display:'grid', placeItems:'center', backdropFilter:'blur(2px)',
      animation:'fb-in .25s ease-out',
    }}>
      <div style={{textAlign:'center'}}>
        <Lexi style={lexiStyle} size={100} mood={kind === 'correct' ? 'happy' : 'thinking'} />
        <p style={{margin:'12px 0 0', fontSize:32, fontFamily:'Bricolage Grotesque', fontWeight:700, color: kind === 'correct' ? 'var(--ok)' : 'oklch(45% 0.15 25)', letterSpacing:'-0.02em'}}>{msg}</p>
        {kind === 'correct' && <div style={{marginTop:8, fontSize:18, fontFamily:'Bricolage Grotesque', fontWeight:700, color:'oklch(45% 0.13 80)'}}>+{COIN_PER_CORRECT} 🪙</div>}
      </div>
      <style>{`@keyframes fb-in { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};

/* ---------- END SCREEN ---------- */
const EndScreen = ({ quizTitle, total, correct, coins, lexiStyle, onAgain, onExit }) => {
  const pct = Math.round((correct / total) * 100);
  const great = pct >= 80;
  return (
    <main style={{maxWidth:560, margin:'0 auto', padding:'48px 20px'}}>
      <div style={{textAlign:'center'}}>
        <div style={{position:'relative', display:'inline-block'}}>
          <Lexi style={lexiStyle} size={140} mood="happy" />
          <ConfettiBurst />
        </div>
        <p style={{margin:'14px 0 6px', fontSize:13, fontFamily:'JetBrains Mono', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em'}}>{quizTitle}</p>
        <h2 style={{margin:0, fontSize:36, fontFamily:'Bricolage Grotesque', fontWeight:700, letterSpacing:'-0.02em'}}>
          {great ? 'Wat goed!' : 'Goed gedaan!'}
        </h2>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, margin:'30px 0'}}>
        <Stat big={`${correct}/${total}`} label="Goed beantwoord" tone="ok" />
        <Stat big={`+${coins}`} label="Munten verdiend" tone="sun" suffix="🪙" />
      </div>

      <div style={{display:'flex', gap:10, justifyContent:'center'}}>
        <button onClick={onAgain} style={shellBtn.ghost}>↻ Nog een keer</button>
        <button onClick={onExit} style={shellBtn.primary}>Klaar →</button>
      </div>
    </main>
  );
};

const Stat = ({ big, label, tone, suffix }) => (
  <div style={{
    background:'white', border:'1.5px solid var(--line)', borderRadius:'var(--radius-lg)',
    padding:'20px 16px', textAlign:'center', boxShadow:'var(--shadow-sm)',
  }}>
    <div style={{fontSize:36, fontFamily:'Bricolage Grotesque', fontWeight:700, letterSpacing:'-0.02em',
      color: tone === 'ok' ? 'var(--ok)' : tone === 'sun' ? 'oklch(45% 0.13 80)' : 'var(--ink)'}}>
      {big}{suffix && <span style={{fontSize:24, marginLeft:4}}>{suffix}</span>}
    </div>
    <p style={{margin:'2px 0 0', fontSize:12, color:'var(--ink-3)'}}>{label}</p>
  </div>
);

const ConfettiBurst = () => {
  const bits = Array.from({length: 14}).map((_, i) => ({
    a: (i / 14) * 360,
    color: ['var(--primary)', 'var(--sun)', 'var(--ok)', 'var(--teal)', 'var(--plum)'][i % 5],
    delay: (i % 5) * 0.05,
  }));
  return (
    <>
      <style>{`
        @keyframes confetti-pop {
          0% { transform: translate(-50%, -50%) rotate(var(--a)) translateY(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) rotate(var(--a)) translateY(-90px); opacity: 0; }
        }
      `}</style>
      <div style={{position:'absolute', inset:0, pointerEvents:'none'}}>
        {bits.map((b, i) => (
          <span key={i} style={{
            position:'absolute', left:'50%', top:'40%',
            width:9, height:9, borderRadius:2, background:b.color,
            ['--a']: b.a + 'deg',
            animation: `confetti-pop 1.2s ease-out ${b.delay}s infinite`,
          }}/>
        ))}
      </div>
    </>
  );
};

/* ---------- COIN BADGE WITH BURST ---------- */
const CoinBadgeAnim = ({ n, burst }) => {
  const [pop, setPop] = React.useState(false);
  React.useEffect(() => {
    if (burst > 0) {
      setPop(true);
      const id = setTimeout(() => setPop(false), 500);
      return () => clearTimeout(id);
    }
  }, [burst]);
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:7, padding:'6px 12px',
      background:'var(--sun-soft)', border:'1.5px solid var(--sun)', borderRadius:999,
      transform: pop ? 'scale(1.15)' : 'scale(1)', transition:'transform .2s',
    }}>
      <span style={{
        width:18, height:18, borderRadius:'50%', background:'var(--sun)',
        border:'1.5px solid oklch(60% 0.14 80)', display:'grid', placeItems:'center',
        fontSize:10, fontWeight:700, color:'oklch(40% 0.13 80)',
      }}>m</span>
      <span style={{fontFamily:'Bricolage Grotesque', fontWeight:700, fontSize:14}}>{n}</span>
    </div>
  );
};

const shellBtn = {
  primary: { padding:'12px 22px', borderRadius:12, background:'var(--ink)', color:'white', border:0, fontWeight:700, fontSize:16, cursor:'pointer' },
  ghost:   { padding:'12px 22px', borderRadius:12, background:'white', color:'var(--ink)', border:'1.5px solid var(--line)', fontWeight:600, fontSize:15, cursor:'pointer' },
};

window.GameShell = GameShell;
