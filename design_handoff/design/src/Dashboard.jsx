const Dashboard = ({ setRoute, lexiStyle }) => {
  const [tab, setTab] = React.useState('overview');
  const child = { name:'Noah', group:5, streak:12, minutesWeek:47, xp:2340 };

  return (
    <main style={{background:'var(--bg-2)', minHeight:'calc(100vh - 64px)'}}>
      {/* Page head */}
      <section style={{background:'white', borderBottom:'1px solid var(--line)'}}>
        <div style={{maxWidth:1200, margin:'0 auto', padding:'32px 20px 20px'}}>
          <p className="mono" style={{margin:0, fontSize:12, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em'}}>Ouder-dashboard</p>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'end', marginTop:6, flexWrap:'wrap', gap:16}}>
            <h1 style={{margin:0, fontSize:36, letterSpacing:'-0.02em'}}>Hoi Marieke — Noah oefent goed deze week.</h1>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              <button onClick={() => setRoute('game')} style={{background:'var(--primary)', color:'white', border:0, padding:'12px 18px', borderRadius:10, fontWeight:600, fontSize:14, display:'inline-flex', gap:8, alignItems:'center', cursor:'pointer'}}>
                <span style={{fontSize:16}}>🎮</span> Speel Lexi-spel
              </button>
              <button onClick={() => setRoute('question')} style={{background:'var(--ink)', color:'white', border:0, padding:'12px 20px', borderRadius:10, fontWeight:600, fontSize:14, display:'inline-flex', gap:8, alignItems:'center', cursor:'pointer'}}>
                Oefenen als Noah
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </div>
          {/* Child chip + stats */}
          <div style={{display:'flex', alignItems:'center', gap:16, marginTop:24, flexWrap:'wrap'}}>
            <div style={{display:'flex', alignItems:'center', gap:10, padding:'6px 14px 6px 6px', background:'var(--bg-2)', borderRadius:999, border:'1.5px solid var(--line)'}}>
              <div style={{width:32, height:32, borderRadius:'50%', overflow:'hidden', background:'white', display:'grid', placeItems:'center'}}>
                <Lexi style={lexiStyle} size={30} float={false} animate={false}/>
              </div>
              <span style={{fontWeight:600, fontSize:14}}>{child.name}</span>
              <span className="mono" style={{fontSize:11, color:'var(--ink-3)'}}>Groep {child.group}</span>
            </div>
            <div style={{display:'flex', gap:20, flexWrap:'wrap', fontSize:13, color:'var(--ink-2)'}}>
              <span>🔥 <b style={{color:'var(--ink)'}}>{child.streak}</b> dagen op rij</span>
              <span>⏱ <b style={{color:'var(--ink)'}}>{child.minutesWeek} min</b> deze week</span>
              <span>⭐ <b style={{color:'var(--ink)'}}>{child.xp}</b> XP totaal</span>
            </div>
          </div>
          <div style={{display:'flex', gap:2, marginTop:24, borderBottom:'1px solid var(--line)', overflowX:'auto', marginBottom:-1}}>
            {[
              {v:'overview', l:'Overzicht'},
              {v:'progress', l:'Voortgang per vak'},
              {v:'activity', l:'Activiteit'},
              {v:'seo', l:'SEO leerlijn'},
              {v:'plan', l:'Abonnement'},
            ].map(t => (
              <button key={t.v} onClick={() => setTab(t.v)} style={{
                background:'none', border:0, padding:'12px 16px', fontSize:14, fontWeight:500,
                color: tab === t.v ? 'var(--ink)' : 'var(--ink-3)',
                borderBottom: tab === t.v ? '2px solid var(--primary)' : '2px solid transparent',
                whiteSpace:'nowrap',
              }}>{t.l}</button>
            ))}
          </div>
        </div>
      </section>

      <section style={{maxWidth:1200, margin:'0 auto', padding:'32px 20px 80px'}}>
        {tab === 'overview' && <OverviewTab setRoute={setRoute} />}
        {tab === 'progress' && <ProgressTab />}
        {tab === 'activity' && <ActivityTab />}
        {tab === 'seo' && <SeoTab />}
        {tab === 'plan' && <PlanTab setRoute={setRoute} />}
      </section>
    </main>
  );
};

const Card = ({ children, title, action, style = {} }) => (
  <div style={{background:'white', border:'1.5px solid var(--line)', borderRadius:'var(--radius-lg)', padding:24, ...style}}>
    {(title || action) && (
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, gap:12}}>
        {title && <h3 style={{margin:0, fontSize:16, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.01em'}}>{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

const OverviewTab = ({ setRoute }) => (
  <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:20}} className="dash-grid">
    <div style={{display:'grid', gap:20}}>
      {/* Week activity */}
      <Card title="Deze week" action={<span className="mono" style={{fontSize:11, color:'var(--ink-3)'}}>min/dag</span>}>
        <div style={{display:'flex', alignItems:'end', justifyContent:'space-between', gap:8, height:140}}>
          {['M','D','W','D','V','Z','Z'].map((d,i) => {
            const v = [8, 12, 0, 14, 6, 4, 3][i];
            const max = 20;
            return (
              <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8}}>
                <div style={{width:'100%', height:`${(v/max)*100}%`, background: v === 0 ? 'var(--line)' : 'var(--primary)', borderRadius: '6px 6px 0 0', minHeight: v ? 4 : 0, position:'relative'}}>
                  {v > 0 && <span style={{position:'absolute', top:-18, left:'50%', transform:'translateX(-50%)', fontSize:11, fontFamily:'JetBrains Mono', color:'var(--ink-2)'}}>{v}</span>}
                </div>
                <span style={{fontSize:12, color:'var(--ink-3)'}}>{d}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Subject progress */}
      <Card title="Voortgang per vak" action={<a href="#" style={{fontSize:13, color:'var(--ink-2)'}}>Alles bekijken →</a>}>
        <div style={{display:'grid', gap:14}}>
          {[
            {s:'Rekenen', pct:72, level:'Groep 5 · niveau 3', color:'var(--primary)', delta:'+4% deze week'},
            {s:'Taal', pct:61, level:'Groep 5 · niveau 2', color:'var(--teal)', delta:'+2% deze week'},
            {s:'Begrijpend lezen', pct:88, level:'Groep 5 · niveau 5', color:'var(--ok)', delta:'stabiel'},
            {s:'Engels', pct:34, level:'Groep 5 · niveau 1', color:'var(--plum)', delta:'nog niet begonnen'},
          ].map((r,i) => (
            <div key={i}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:6, alignItems:'baseline', gap:12}}>
                <div>
                  <span style={{fontWeight:600, fontSize:14}}>{r.s}</span>
                  <span style={{fontSize:12, color:'var(--ink-3)', marginLeft:10}}>{r.level}</span>
                </div>
                <span style={{fontSize:12, color:'var(--ink-3)'}}>{r.delta}</span>
              </div>
              <div style={{height:8, borderRadius:4, background:'var(--line-2)', overflow:'hidden'}}>
                <div style={{height:'100%', width:r.pct+'%', background:r.color, borderRadius:4}}/>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights */}
      <Card title="Wat valt op">
        <div style={{display:'grid', gap:10}}>
          <Insight tone="ok" title="Breuken gaan goed." body="Noah maakt 92% van breuk-vragen in één keer goed — klaar voor de volgende stap." />
          <Insight tone="warn" title="Spelling open/gesloten lettergrepen." body="Hier blijft het hangen. Lexi herhaalt deze week extra vragen hierover." />
          <Insight tone="info" title="Engels staat nog uit." body="Wil je dit aanzetten? Lexi begint dan met een rustige startmeting." />
        </div>
      </Card>
    </div>

    {/* Right column */}
    <div style={{display:'grid', gap:20, alignContent:'start'}}>
      <Card>
        <p style={{margin:'0 0 6px', fontSize:12, color:'var(--ink-3)', fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.08em'}}>Volgend doel</p>
        <h4 style={{margin:'0 0 4px', fontFamily:'Bricolage Grotesque', fontSize:18, letterSpacing:'-0.01em'}}>Breuken optellen</h4>
        <p style={{margin:'0 0 14px', fontSize:13, color:'var(--ink-2)'}}>REK-5.4 · Groep 5, periode 2</p>
        <div style={{height:8, borderRadius:4, background:'var(--line-2)', overflow:'hidden', marginBottom:8}}>
          <div style={{height:'100%', width:'42%', background:'var(--primary)', borderRadius:4}}/>
        </div>
        <p style={{margin:0, fontSize:12, color:'var(--ink-3)'}} className="mono">42% — nog ±40 vragen</p>
      </Card>

      <Card title="Deze maand">
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          {[
            {l:'Minuten', v:'182'},
            {l:'Vragen', v:'864'},
            {l:'Doelen +', v:'7'},
            {l:'Niveaus +', v:'2'},
          ].map((s,i) => (
            <div key={i} style={{padding:14, background:'var(--bg-2)', borderRadius:10}}>
              <p style={{margin:0, fontFamily:'Bricolage Grotesque', fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>{s.v}</p>
              <p style={{margin:0, fontSize:12, color:'var(--ink-3)'}}>{s.l}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h4 style={{margin:'0 0 4px', fontFamily:'Bricolage Grotesque', fontSize:18, letterSpacing:'-0.01em'}}>Weekrapport</h4>
        <p style={{margin:'0 0 14px', fontSize:13, color:'var(--ink-2)'}}>Klaar op zondag · per e-mail én hier.</p>
        <button onClick={() => setRoute('question')} style={{width:'100%', background:'var(--bg-2)', border:'1.5px solid var(--line)', padding:'10px 14px', borderRadius:10, fontWeight:500, fontSize:14, fontFamily:'Geist'}}>Open laatste rapport</button>
      </Card>
    </div>

    <style>{`
      @media (max-width: 860px) { .dash-grid { grid-template-columns: 1fr !important; } }
    `}</style>
  </div>
);

const Insight = ({ tone, title, body }) => {
  const colors = {
    ok: { bg:'var(--ok-soft)', dot:'var(--ok)' },
    warn: { bg:'var(--sun-soft)', dot:'oklch(70% 0.14 70)' },
    info: { bg:'var(--teal-soft)', dot:'var(--teal)' },
  }[tone];
  return (
    <div style={{padding:14, background:colors.bg, borderRadius:10, display:'flex', gap:12, alignItems:'start'}}>
      <span style={{width:8, height:8, borderRadius:'50%', background:colors.dot, marginTop:8, flexShrink:0}}/>
      <div>
        <p style={{margin:0, fontSize:14, fontWeight:600}}>{title}</p>
        <p style={{margin:'2px 0 0', fontSize:13, color:'var(--ink-2)', lineHeight:1.5}}>{body}</p>
      </div>
    </div>
  );
};

const ProgressTab = () => (
  <div style={{display:'grid', gap:20}}>
    <Card title="Alle leerdoelen · Groep 5">
      <div style={{display:'grid', gap:10}}>
        {[
          {c:'REK-5.1', t:'Decimale getallen lezen', pct:92, state:'beheerst'},
          {c:'REK-5.2', t:'Kommagetallen optellen', pct:78, state:'bezig'},
          {c:'REK-5.3', t:'Breuken vergelijken', pct:100, state:'beheerst'},
          {c:'REK-5.4', t:'Breuken optellen', pct:42, state:'bezig'},
          {c:'REK-5.5', t:'Verhoudingstabel', pct:18, state:'start'},
          {c:'TAAL-5.1', t:'Open/gesloten lettergrepen', pct:54, state:'bezig'},
          {c:'TAAL-5.2', t:'Werkwoordspelling', pct:70, state:'bezig'},
          {c:'BL-5.1', t:'Hoofdgedachte tekst', pct:95, state:'beheerst'},
        ].map((r,i) => (
          <div key={i} style={{display:'grid', gridTemplateColumns:'100px 1fr 120px 80px', gap:12, alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--line-2)'}}>
            <span className="mono" style={{fontSize:12, color:'var(--ink-3)'}}>{r.c}</span>
            <span style={{fontSize:14}}>{r.t}</span>
            <div style={{height:6, borderRadius:3, background:'var(--line-2)'}}>
              <div style={{height:'100%', width:r.pct+'%', background: r.state==='beheerst'?'var(--ok)':'var(--primary)', borderRadius:3}}/>
            </div>
            <span className="mono" style={{fontSize:12, color:'var(--ink-2)', textAlign:'right'}}>{r.pct}%</span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const ActivityTab = () => (
  <Card title="Sessies · laatste 14 dagen">
    <div style={{display:'grid', gap:8}}>
      {Array.from({length:10}).map((_,i) => {
        const subj = ['Rekenen','Taal','Begrijpend lezen','Engels'][i%4];
        return (
          <div key={i} style={{display:'grid', gridTemplateColumns:'80px 1fr 100px 80px 80px', gap:12, alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--line-2)', fontSize:13}}>
            <span className="mono" style={{color:'var(--ink-3)'}}>14 apr</span>
            <span>{subj}</span>
            <span style={{color:'var(--ink-2)'}}>{20+i*3} vragen</span>
            <span style={{color:'var(--ink-2)'}}>{12+i} min</span>
            <span style={{color:'var(--ok)', fontWeight:600}}>{75+i}%</span>
          </div>
        );
      })}
    </div>
  </Card>
);

const SeoTab = () => (
  <Card title="SEO leerlijn koppeling · Groep 5">
    <p style={{margin:'0 0 18px', color:'var(--ink-2)', fontSize:14, maxWidth:640}}>Elke oefening bij Lexi is gekoppeld aan een officieel SEO-leerdoel. Zo zie je hoe Noah zich verhoudt tot wat de basisschool verwacht in periode 2.</p>
    <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10}}>
      {[
        {d:'Getalbegrip', pct:88},
        {d:'Bewerkingen', pct:72},
        {d:'Meten', pct:46},
        {d:'Verhoudingen', pct:22},
        {d:'Spelling', pct:64},
        {d:'Lezen', pct:90},
        {d:'Woordenschat', pct:58},
        {d:'Taalbeschouwing', pct:41},
      ].map((r,i)=>(
        <div key={i} style={{padding:14, border:'1px solid var(--line-2)', borderRadius:10}}>
          <p style={{margin:'0 0 10px', fontSize:13, fontWeight:500}}>{r.d}</p>
          <div style={{height:6, borderRadius:3, background:'var(--line-2)'}}>
            <div style={{height:'100%', width:r.pct+'%', background: r.pct>=80?'var(--ok)':'var(--primary)', borderRadius:3}}/>
          </div>
          <p style={{margin:'8px 0 0', fontSize:11, color:'var(--ink-3)', fontFamily:'JetBrains Mono'}}>{r.pct}%</p>
        </div>
      ))}
    </div>
  </Card>
);

const PlanTab = ({ setRoute }) => (
  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}} className="dash-grid">
    <Card title="Huidig abonnement">
      <p style={{margin:'0 0 4px', fontFamily:'Bricolage Grotesque', fontSize:24, fontWeight:600}}>Gezin Maandelijks</p>
      <p style={{margin:'0 0 20px', color:'var(--ink-2)', fontSize:14}}>€11,95 · volgende afschrijving 28 april 2026</p>
      <button style={{background:'none', border:'1.5px solid var(--line)', padding:'10px 14px', borderRadius:10, fontSize:14, fontWeight:500, marginRight:8}}>Wijzig naar jaarlijks</button>
      <button style={{background:'none', border:'1.5px solid var(--line)', padding:'10px 14px', borderRadius:10, fontSize:14, fontWeight:500, color:'var(--ink-2)'}}>Pauzeer</button>
    </Card>
    <Card title="Kinderen op dit account">
      <div style={{display:'grid', gap:10}}>
        <div style={{padding:14, border:'1px solid var(--line-2)', borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div><p style={{margin:0, fontWeight:600, fontSize:14}}>Noah</p><p style={{margin:0, fontSize:12, color:'var(--ink-3)'}}>Groep 5</p></div>
          <span className="mono" style={{fontSize:12, color:'var(--ok)'}}>actief</span>
        </div>
        <button style={{background:'var(--bg-2)', border:'1.5px dashed var(--line)', padding:'14px', borderRadius:10, fontSize:14, color:'var(--ink-2)'}}>+ Kind toevoegen</button>
      </div>
    </Card>
  </div>
);

window.Dashboard = Dashboard;
