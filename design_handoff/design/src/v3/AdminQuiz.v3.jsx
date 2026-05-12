// AdminQuiz.v3.jsx — admin/leerkracht-view, selecteert speltype per quiz/toets

const AdminQuiz = ({ setRoute }) => {
  const [quizzes, setQuizzes] = React.useState([
    { id:'q1', title:'Tafels van 3 en 5',  subj:'Rekenen', group:'5', game:'mc',      len:10, status:'live' },
    { id:'q2', title:'Spelling: -d of -t', subj:'Taal',    group:'6', game:'catapult', len:8,  status:'live' },
    { id:'q3', title:'Engelse dieren',     subj:'Engels',  group:'5', game:'match',    len:12, status:'concept' },
    { id:'q4', title:'Breuken op volgorde',subj:'Rekenen', group:'6', game:'order',    len:6,  status:'live' },
    { id:'q5', title:'Werkwoord intypen',  subj:'Taal',    group:'4', game:'type',    len:10, status:'concept' },
  ]);
  const [editing, setEditing] = React.useState(null);

  const editQuiz = quizzes.find(q => q.id === editing);

  return (
    <main style={{maxWidth:1200, margin:'0 auto', padding:'24px 20px 80px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:24}}>
        <div>
          <p style={{margin:'0 0 4px', fontSize:12, color:'var(--ink-3)', fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.06em'}}>Admin · content</p>
          <h2 style={{margin:0, fontSize:28, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.02em'}}>Quizzen & toetsen</h2>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button onClick={() => setRoute('kid')} style={{padding:'8px 12px', borderRadius:8, background:'var(--bg-2)', border:'1px solid var(--line)', fontSize:13, cursor:'pointer'}}>Bekijk als kind →</button>
          <button style={{padding:'8px 12px', borderRadius:8, background:'var(--ink)', color:'white', border:0, fontSize:13, fontWeight:600, cursor:'pointer'}}>+ Nieuwe quiz</button>
        </div>
      </div>

      {/* table */}
      <div style={{background:'white', border:'1.5px solid var(--line)', borderRadius:'var(--radius-lg)', overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:'2.5fr 1fr 0.6fr 1.4fr 0.7fr 0.9fr 0.6fr', padding:'12px 18px', borderBottom:'1px solid var(--line)', background:'var(--bg-2)', fontSize:11, fontFamily:'JetBrains Mono', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.06em', gap:12}}>
          <span>Titel</span><span>Vak</span><span>Groep</span><span>Speltype</span><span>Vragen</span><span>Status</span><span></span>
        </div>
        {quizzes.map((q, idx) => {
          const g = (window.GAMES || []).find(x => x.id === q.game);
          return (
            <div key={q.id} style={{display:'grid', gridTemplateColumns:'2.5fr 1fr 0.6fr 1.4fr 0.7fr 0.9fr 0.6fr', padding:'14px 18px', borderBottom: idx < quizzes.length-1 ? '1px solid var(--line-2)' : 'none', alignItems:'center', gap:12, fontSize:14}}>
              <div style={{fontWeight:500}}>{q.title}</div>
              <div style={{color:'var(--ink-2)'}}>{q.subj}</div>
              <div style={{fontFamily:'JetBrains Mono', color:'var(--ink-2)', fontSize:13}}>{q.group}</div>
              <div style={{display:'inline-flex', alignItems:'center', gap:8, padding:'4px 10px', background:'var(--bg-2)', borderRadius:8, border:'1px solid var(--line-2)', justifySelf:'start', fontSize:13}}>
                <span style={{fontSize:14}}>{g?.icon}</span> {g?.name}
              </div>
              <div style={{fontFamily:'JetBrains Mono', color:'var(--ink-2)', fontSize:13}}>{q.len}</div>
              <div>
                <span style={{padding:'3px 9px', borderRadius:999, fontSize:11, fontWeight:600,
                  background: q.status === 'live' ? 'var(--ok-soft)' : 'var(--sun-soft)',
                  color: q.status === 'live' ? 'var(--ok)' : 'oklch(40% 0.13 80)',
                }}>{q.status === 'live' ? '● live' : '◌ concept'}</span>
              </div>
              <div style={{justifySelf:'end'}}>
                <button onClick={() => setEditing(q.id)} style={{padding:'6px 12px', borderRadius:8, background:'white', border:'1.5px solid var(--line)', fontSize:12, fontWeight:500, cursor:'pointer'}}>
                  Bewerk
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* edit panel */}
      {editQuiz && (
        <EditPanel
          quiz={editQuiz}
          onClose={() => setEditing(null)}
          onSave={(next) => {
            setQuizzes(qs => qs.map(q => q.id === next.id ? next : q));
            setEditing(null);
          }}
        />
      )}
    </main>
  );
};

const EditPanel = ({ quiz, onClose, onSave }) => {
  const [draft, setDraft] = React.useState(quiz);
  const update = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(20,20,40,0.4)', zIndex:200, display:'grid', placeItems:'center', padding:20}} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{background:'white', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-lg)', maxWidth:760, width:'100%', maxHeight:'90vh', overflow:'auto'}}>
        <div style={{padding:'18px 24px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <p style={{margin:0, fontSize:11, color:'var(--ink-3)', fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.06em'}}>Bewerk quiz</p>
            <h3 style={{margin:'2px 0 0', fontSize:20, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.01em'}}>{draft.title}</h3>
          </div>
          <button onClick={onClose} style={{background:'none', border:0, fontSize:22, color:'var(--ink-3)', cursor:'pointer', lineHeight:1}}>×</button>
        </div>

        <div style={{padding:24, display:'grid', gap:22}}>
          <Field label="Titel">
            <input value={draft.title} onChange={e => update('title', e.target.value)} style={inp}/>
          </Field>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14}}>
            <Field label="Vak">
              <select value={draft.subj} onChange={e => update('subj', e.target.value)} style={inp}>
                {['Rekenen','Taal','Engels','Wereld','Lezen'].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Groep">
              <select value={draft.group} onChange={e => update('group', e.target.value)} style={inp}>
                {['1','2','3','4','5','6','7','8'].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Aantal vragen">
              <input type="number" min={1} max={50} value={draft.len} onChange={e => update('len', +e.target.value)} style={inp}/>
            </Field>
          </div>

          <Field label="Speltype" sub="Hoe wordt deze quiz aan het kind gepresenteerd?">
            <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:10}} className="game-pick-grid">
              {(window.GAMES || []).map(g => {
                const active = draft.game === g.id;
                return (
                  <button key={g.id} onClick={() => update('game', g.id)} style={{
                    background: active ? 'var(--primary-soft)' : 'white',
                    border:'2px solid ' + (active ? 'var(--primary)' : 'var(--line)'),
                    borderRadius:12, padding:'14px 10px', textAlign:'center', cursor:'pointer',
                    fontFamily:'Geist',
                  }}>
                    <div style={{fontSize:24, marginBottom:6}}>{g.icon}</div>
                    <p style={{margin:'0 0 3px', fontSize:13, fontWeight:600, color:active ? 'var(--primary-ink)' : 'var(--ink)'}}>{g.name}</p>
                    <p style={{margin:0, fontSize:11, color:'var(--ink-3)', lineHeight:1.3}}>{g.age}</p>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Voorbeeld" sub="Zo ziet de quiz eruit voor het kind">
            <div style={{padding:18, background:'var(--bg-2)', borderRadius:12, border:'1px solid var(--line-2)'}}>
              <GamePreview id={draft.game} />
            </div>
          </Field>

          <Field label="Status">
            <div style={{display:'flex', gap:8}}>
              {[{v:'concept', l:'Concept'},{v:'live', l:'Live zetten'}].map(o => (
                <button key={o.v} onClick={() => update('status', o.v)} style={{
                  padding:'10px 16px', borderRadius:10,
                  border:'1.5px solid ' + (draft.status === o.v ? 'var(--ink)' : 'var(--line)'),
                  background: draft.status === o.v ? 'var(--ink)' : 'white',
                  color: draft.status === o.v ? 'white' : 'var(--ink)',
                  fontWeight:600, fontSize:13, cursor:'pointer',
                }}>{o.l}</button>
              ))}
            </div>
          </Field>
        </div>

        <div style={{padding:'16px 24px', borderTop:'1px solid var(--line)', display:'flex', justifyContent:'flex-end', gap:10, background:'var(--bg-2)'}}>
          <button onClick={onClose} style={{padding:'10px 16px', borderRadius:10, background:'white', border:'1.5px solid var(--line)', cursor:'pointer', fontWeight:500, fontSize:14}}>Annuleren</button>
          <button onClick={() => onSave(draft)} style={{padding:'10px 16px', borderRadius:10, background:'var(--ink)', color:'white', border:0, cursor:'pointer', fontWeight:600, fontSize:14}}>Opslaan</button>
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) { .game-pick-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  );
};

const Field = ({ label, sub, children }) => (
  <div>
    <label style={{display:'block', fontSize:13, fontWeight:600, color:'var(--ink)', marginBottom: sub ? 2 : 8}}>{label}</label>
    {sub && <p style={{margin:'0 0 10px', fontSize:12, color:'var(--ink-3)'}}>{sub}</p>}
    {children}
  </div>
);

const inp = {
  width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid var(--line)',
  fontFamily:'Geist', fontSize:14, background:'white', color:'var(--ink)',
};

window.AdminQuiz = AdminQuiz;
