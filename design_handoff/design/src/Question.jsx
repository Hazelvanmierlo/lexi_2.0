const Question = ({ setRoute, lexiStyle }) => {
  const questions = [
    {
      subject: 'Rekenen',
      goal: 'REK-5.4 · Breuken optellen',
      level: 3,
      prompt: 'Hoeveel is ¼ + 2⁄4?',
      options: [
        { id:'a', text:'2⁄8', correct:false, why:'Tellers optellen, noemer blijft gelijk — niet beide optellen.' },
        { id:'b', text:'3⁄4', correct:true, why:'Bij gelijke noemer: tel alleen de tellers op. 1 + 2 = 3, dus 3⁄4.' },
        { id:'c', text:'3⁄8', correct:false, why:'De noemer verandert niet als die al gelijk is.' },
        { id:'d', text:'1', correct:false, why:'Dat zou ¼ + ¾ zijn — niet deze som.' },
      ],
    },
    {
      subject: 'Rekenen',
      goal: 'REK-5.4 · Breuken optellen',
      level: 3,
      prompt: 'Welke breuk is gelijk aan ½?',
      options: [
        { id:'a', text:'2⁄3', correct:false, why:'2⁄3 is groter dan ½.' },
        { id:'b', text:'3⁄6', correct:true, why:'3⁄6 vereenvoudigt naar ½.' },
        { id:'c', text:'4⁄6', correct:false, why:'4⁄6 is ⅔.' },
        { id:'d', text:'2⁄5', correct:false, why:'2⁄5 is iets minder dan de helft.' },
      ],
    },
  ];

  const [idx, setIdx] = React.useState(0);
  const [picked, setPicked] = React.useState(null);
  const [score, setScore] = React.useState({ correct:0, total:0 });
  const q = questions[idx];

  const pick = (o) => {
    if (picked) return;
    setPicked(o);
    setScore(s => ({ correct: s.correct + (o.correct ? 1 : 0), total: s.total + 1 }));
  };
  const nextQ = () => {
    setPicked(null);
    setIdx((idx + 1) % questions.length);
  };

  return (
    <main style={{minHeight:'calc(100vh - 64px)', background:'var(--bg-2)', padding:'32px 20px 80px'}}>
      <div style={{maxWidth:760, margin:'0 auto'}}>
        {/* Top status bar */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12}}>
          <button onClick={() => setRoute('dashboard')} style={{background:'none', border:0, color:'var(--ink-2)', fontSize:14, display:'inline-flex', alignItems:'center', gap:6}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Stoppen
          </button>
          <div style={{display:'flex', gap:16, alignItems:'center', fontSize:13, color:'var(--ink-2)', fontFamily:'JetBrains Mono'}}>
            <span>vraag {score.total + 1}</span>
            <span>·</span>
            <span style={{color:'var(--ok)'}}>{score.correct} goed</span>
            <span>·</span>
            <span>niveau {q.level}</span>
          </div>
        </div>

        {/* Progress */}
        <div style={{display:'flex', gap:4, marginBottom:32}}>
          {Array.from({length:8}).map((_,i) => (
            <div key={i} style={{flex:1, height:4, borderRadius:2, background: i <= score.total ? 'var(--primary)' : 'var(--line)'}}/>
          ))}
        </div>

        {/* Question card */}
        <div style={{background:'white', border:'1.5px solid var(--line)', borderRadius:'var(--radius-lg)', padding:'40px 32px', boxShadow:'var(--shadow)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:20, gap:16}}>
            <div>
              <p className="mono" style={{margin:0, fontSize:12, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em'}}>{q.subject}</p>
              <p style={{margin:'4px 0 0', fontSize:13, color:'var(--ink-2)'}}>{q.goal}</p>
            </div>
            <div style={{width:72, height:72, flexShrink:0}}>
              <Lexi style={lexiStyle} size={72} float={!picked} />
            </div>
          </div>

          <h2 style={{fontSize:'clamp(28px, 4vw, 40px)', letterSpacing:'-0.02em', lineHeight:1.15, margin:'8px 0 28px'}}>
            {q.prompt}
          </h2>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}} className="q-options">
            {q.options.map((o,i) => {
              const isPicked = picked && picked.id === o.id;
              const showCorrect = picked && o.correct;
              const state = !picked ? 'idle' : isPicked ? (o.correct ? 'correct' : 'wrong') : showCorrect ? 'hint' : 'dim';
              const s = {
                idle: { border:'var(--line)', bg:'white', ink:'var(--ink)' },
                correct: { border:'var(--ok)', bg:'var(--ok-soft)', ink:'var(--ink)' },
                wrong: { border:'oklch(60% 0.2 25)', bg:'oklch(96% 0.04 25)', ink:'var(--ink)' },
                hint: { border:'var(--ok)', bg:'var(--ok-soft)', ink:'var(--ink)' },
                dim: { border:'var(--line)', bg:'white', ink:'var(--ink-3)' },
              }[state];
              return (
                <button key={o.id} onClick={() => pick(o)} disabled={!!picked} style={{
                  textAlign:'left', padding:'18px 20px', borderRadius:14,
                  border:'2px solid ' + s.border, background:s.bg, color:s.ink,
                  fontFamily:'Geist', fontSize:17, fontWeight:500,
                  display:'flex', alignItems:'center', gap:14, cursor: picked ? 'default' : 'pointer',
                  transition: 'border-color .2s, background .2s',
                }}>
                  <span style={{
                    width:30, height:30, borderRadius:8, display:'grid', placeItems:'center',
                    background:'white', border:'1.5px solid ' + s.border,
                    fontFamily:'JetBrains Mono', fontSize:13, fontWeight:600,
                  }}>{o.id.toUpperCase()}</span>
                  <span style={{fontFamily:'Bricolage Grotesque', fontWeight:600, fontSize:22, letterSpacing:'-0.01em'}}>{o.text}</span>
                  {state === 'correct' && <span style={{marginLeft:'auto', color:'var(--ok)', fontWeight:700}}>✓</span>}
                  {state === 'wrong' && <span style={{marginLeft:'auto', color:'oklch(55% 0.2 25)', fontWeight:700}}>✕</span>}
                  {state === 'hint' && !isPicked && <span style={{marginLeft:'auto', fontSize:11, padding:'2px 8px', borderRadius:999, background:'var(--ok)', color:'white', fontWeight:600}}>juist</span>}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {picked && (
            <div style={{
              marginTop:24, padding:'18px 20px', borderRadius:14,
              background: picked.correct ? 'var(--ok-soft)' : 'var(--sun-soft)',
              border: '1.5px solid ' + (picked.correct ? 'oklch(80% 0.14 155)' : 'oklch(85% 0.12 80)'),
              display:'flex', gap:14, alignItems:'start',
            }}>
              <span style={{fontSize:22, marginTop:-2}}>{picked.correct ? '🎉' : '💡'}</span>
              <div style={{flex:1}}>
                <p style={{margin:0, fontWeight:600, fontSize:15}}>
                  {picked.correct ? 'Goed gedaan!' : 'Bijna — kijk even mee.'}
                </p>
                <p style={{margin:'4px 0 0', fontSize:14, color:'var(--ink-2)', lineHeight:1.55}}>{picked.why}</p>
              </div>
            </div>
          )}

          {/* Next button */}
          <div style={{display:'flex', justifyContent:'flex-end', marginTop:24}}>
            {picked && (
              <button onClick={nextQ} style={{background:'var(--ink)', color:'white', border:0, padding:'14px 24px', borderRadius:12, fontWeight:600, fontSize:15, display:'inline-flex', gap:10, alignItems:'center'}}>
                Volgende vraag
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            )}
          </div>
        </div>

        {/* Footer helper */}
        <p style={{textAlign:'center', marginTop:20, fontSize:13, color:'var(--ink-3)'}}>
          Gekoppeld aan <span className="mono">{q.goal}</span> · Lexi past de moeilijkheid aan op basis van je antwoord.
        </p>
      </div>

      <style>{`
        @media (max-width: 600px) { .q-options { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  );
};

window.Question = Question;
