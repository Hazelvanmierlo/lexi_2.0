// KidHome.v3.jsx — kindaccount with vakken, recent quizzes, and game previews

const KidHome = ({ setRoute, lexiStyle, openGame }) => {
  const subjects = [
    { id:'rek', name:'Rekenen', color:'var(--primary-soft)', ink:'var(--primary-ink)', icon:'∑', pct:72 },
    { id:'taal', name:'Taal', color:'var(--teal-soft)', ink:'oklch(38% 0.12 185)', icon:'A', pct:61 },
    { id:'lez', name:'Lezen', color:'var(--ok-soft)', ink:'oklch(38% 0.12 155)', icon:'✎', pct:88 },
    { id:'wo', name:'Wereld', color:'var(--sun-soft)', ink:'oklch(45% 0.12 80)', icon:'◐', pct:34 },
    { id:'eng', name:'Engels', color:'var(--plum-soft)', ink:'oklch(38% 0.12 305)', icon:'EN', pct:45 },
  ];
  const quizzes = (window.QUIZZES_DEFAULT || [
    { id:'q1', title:'Tafels van 3 en 5',  subj:'Rekenen', game:'mc',       len:10, mins:5, new:false },
    { id:'q2', title:'Spelling: -d of -t', subj:'Taal',    game:'catapult', len:10, mins:5, new:true },
    { id:'q3', title:'Engelse dieren',     subj:'Engels',  game:'match',    len:10, mins:6, new:false },
    { id:'q4', title:'Breuken op volgorde',subj:'Rekenen', game:'order',    len:6,  mins:3, new:true },
    { id:'q5', title:'Werkwoord intypen',  subj:'Taal',    game:'type',     len:10, mins:6, new:false },
  ]);

  const startQuiz = (q) => openGame(q.game, { quizTitle: q.title, customExplain: q.customExplain, group: q.group });

  return (
    <div style={{background:'linear-gradient(180deg, oklch(95% 0.05 220) 0%, var(--bg) 320px)'}}>
      <main style={{maxWidth:1100, margin:'0 auto', padding:'24px 20px 80px'}}>
        {/* greeting card */}
        <div style={{display:'grid', gridTemplateColumns:'auto 1fr auto', gap:18, alignItems:'center', background:'white', border:'1.5px solid var(--line)', borderRadius:'var(--radius-lg)', padding:'18px 22px', boxShadow:'var(--shadow)'}}>
          <Lexi style={lexiStyle} size={72} />
          <div>
            <p style={{margin:'0 0 2px', fontSize:13, color:'var(--ink-3)', fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.06em'}}>Hoi Sara!</p>
            <h2 style={{margin:0, fontSize:24, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.02em'}}>Klaar voor de quiz van vandaag?</h2>
          </div>
          <div style={{display:'flex', gap:14, alignItems:'center'}}>
            <CoinBadge n={428} />
            <button onClick={() => setRoute('admin')} style={{
              padding:'8px 12px', borderRadius:8, background:'var(--bg-2)', border:'1px solid var(--line)',
              fontSize:12, color:'var(--ink-2)', cursor:'pointer',
            }}>Admin →</button>
          </div>
        </div>

        {/* subjects */}
        <h3 style={{margin:'32px 0 14px', fontSize:18, fontFamily:'Bricolage Grotesque', fontWeight:600}}>Mijn vakken</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:12}} className="kid-subj-grid">
          {subjects.map(s => (
            <button key={s.id} style={{
              background:'white', border:'1.5px solid var(--line)', borderRadius:14, padding:16,
              textAlign:'left', cursor:'pointer',
            }}>
              <div style={{width:42, height:42, borderRadius:10, background:s.color, color:s.ink, display:'grid', placeItems:'center', fontFamily:'Bricolage Grotesque', fontWeight:700, fontSize:18, marginBottom:10, border:'1px solid var(--line-2)'}}>
                {s.icon}
              </div>
              <p style={{margin:'0 0 6px', fontSize:14, fontWeight:600}}>{s.name}</p>
              <div style={{height:5, borderRadius:3, background:'var(--line-2)'}}>
                <div style={{height:'100%', width: s.pct+'%', background:'var(--primary)', borderRadius:3}}/>
              </div>
              <p style={{margin:'6px 0 0', fontSize:11, color:'var(--ink-3)', fontFamily:'JetBrains Mono'}}>{s.pct}%</p>
            </button>
          ))}
        </div>

        {/* quizzes — each with the game type baked in */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', margin:'40px 0 14px'}}>
          <h3 style={{margin:0, fontSize:18, fontFamily:'Bricolage Grotesque', fontWeight:600}}>Quizzen voor jou</h3>
          <span style={{fontSize:12, color:'var(--ink-3)', fontFamily:'JetBrains Mono'}}>elke quiz heeft z'n eigen spel</span>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:14}} className="quiz-grid">
          {quizzes.map(q => {
            const g = (window.GAMES || []).find(x => x.id === q.game);
            return (
              <article key={q.id} style={{background:'white', border:'1.5px solid var(--line)', borderRadius:'var(--radius-lg)', padding:18, display:'grid', gridTemplateColumns:'1fr auto', gap:14, alignItems:'start'}}>
                <div>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                    <span style={{padding:'2px 8px', background:'var(--bg-2)', border:'1px solid var(--line-2)', borderRadius:6, fontSize:11, color:'var(--ink-2)'}}>{q.subj}</span>
                    {q.new && <span style={{padding:'2px 8px', background:'var(--sun)', color:'var(--ink)', borderRadius:6, fontSize:11, fontWeight:600}}>nieuw</span>}
                  </div>
                  <h4 style={{margin:'0 0 6px', fontSize:17, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.01em'}}>{q.title}</h4>
                  <p style={{margin:'0 0 12px', fontSize:13, color:'var(--ink-3)', fontFamily:'JetBrains Mono'}}>
                    {g?.icon} {g?.name} · {q.len} vragen · ±{q.mins} min
                  </p>
                  <button onClick={() => startQuiz(q)} style={{
                    padding:'8px 14px', borderRadius:8, background:'var(--ink)', color:'white',
                    border:0, fontWeight:600, fontSize:13, cursor:'pointer',
                  }}>Start →</button>
                </div>
                <div style={{width:170, padding:12, background:'var(--bg-2)', borderRadius:12, border:'1px solid var(--line-2)'}}>
                  <GamePreview id={q.game} compact />
                </div>
              </article>
            );
          })}
        </div>

        {/* games library */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', margin:'40px 0 14px'}}>
          <h3 style={{margin:0, fontSize:18, fontFamily:'Bricolage Grotesque', fontWeight:600}}>Speltypes</h3>
          <span style={{fontSize:12, color:'var(--ink-3)', fontFamily:'JetBrains Mono'}}>tik om te proberen</span>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:10}} className="kid-game-grid">
          {(window.GAMES || []).map(g => (
            <button key={g.id} onClick={() => openGame(g.id)} style={{
              background:'white', border:'1.5px solid var(--line)', borderRadius:14, padding:'16px 12px',
              textAlign:'center', cursor:'pointer',
            }}>
              <div style={{width:44, height:44, margin:'0 auto 10px', borderRadius:12, background:'var(--primary-soft)', color:'var(--primary-ink)', display:'grid', placeItems:'center', fontSize:22, border:'1px solid var(--line-2)'}}>{g.icon}</div>
              <p style={{margin:'0 0 4px', fontSize:14, fontWeight:600}}>{g.name}</p>
              <p style={{margin:0, fontSize:11, color:'var(--ink-3)'}}>{g.desc}</p>
            </button>
          ))}
        </div>
      </main>
      <style>{`
        @media (max-width: 920px) {
          .kid-subj-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .quiz-grid { grid-template-columns: 1fr !important; }
          .kid-game-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};

const CoinBadge = ({ n }) => (
  <div style={{display:'inline-flex', alignItems:'center', gap:8, padding:'8px 12px', background:'var(--sun-soft)', border:'1px solid var(--sun)', borderRadius:999}}>
    <span style={{width:18, height:18, borderRadius:'50%', background:'var(--sun)', border:'1.5px solid oklch(60% 0.14 80)', display:'grid', placeItems:'center', fontSize:10, fontWeight:700, color:'oklch(40% 0.13 80)'}}>m</span>
    <span style={{fontFamily:'Bricolage Grotesque', fontWeight:700, fontSize:15}}>{n}</span>
  </div>
);

/* Full-screen game player */
const KidGamePlay = ({ id, setRoute, lexiStyle, quizTitle, customExplain, group }) => {
  const game = (window.GAMES || []).find(g => g.id === id);
  const isPlayable = ['mc','catapult','match'].includes(id);

  if (isPlayable && window.GameShell) {
    return <GameShell
      gameId={id}
      quizTitle={quizTitle || (game?.name || 'Quiz')}
      customExplain={customExplain}
      group={group}
      lexiStyle={lexiStyle}
      onExit={() => setRoute('kid')}
    />;
  }

  // fallback: preview-only games (Type, Order)
  return (
    <main style={{maxWidth:760, margin:'0 auto', padding:'24px 20px 80px'}}>
      <button onClick={() => setRoute('kid')} style={{
        background:'none', border:'1.5px solid var(--line)', borderRadius:8,
        padding:'8px 12px', cursor:'pointer', fontSize:13, marginBottom:18,
      }}>← Terug</button>
      <div style={{background:'white', border:'1.5px solid var(--line)', borderRadius:'var(--radius-lg)', padding:24, boxShadow:'var(--shadow)'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:18}}>
          <Lexi style={lexiStyle} size={48} />
          <div>
            <p style={{margin:0, fontSize:11, color:'var(--ink-3)', fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.06em'}}>Speltype · preview</p>
            <h2 style={{margin:0, fontSize:20, fontFamily:'Bricolage Grotesque', fontWeight:600}}>{game?.name || 'Speel'}</h2>
          </div>
        </div>
        <GamePreview id={id} />
        <p style={{margin:'18px 0 0', fontSize:13, color:'var(--ink-3)', textAlign:'center', fontStyle:'italic'}}>
          Volledige speelversie volgt — voorlopig een interactieve voorbeeld.
        </p>
      </div>
    </main>
  );
};

window.KidHome = KidHome;
window.KidGamePlay = KidGamePlay;
