const Signup = ({ setRoute, lexiStyle }) => {
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    parentName: '', email: '', password: '',
    childName: '', childAge: '8', region: 'NL',
    subjects: ['Rekenen', 'Taal'],
    plan: 'monthly',
  });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const steps = ['Account', 'Je kind', 'Vakken', 'Abonnement'];

  const next = () => step < 3 ? setStep(step + 1) : setRoute('dashboard');
  const back = () => step > 0 ? setStep(step - 1) : setRoute('landing');

  return (
    <main style={{minHeight:'calc(100vh - 64px)', padding:'40px 20px', background:'var(--bg-2)'}}>
      <div style={{maxWidth:980, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:32, alignItems:'start'}} className="signup-grid">
        {/* Left info panel */}
        <aside style={{background:'white', borderRadius:'var(--radius-lg)', border:'1.5px solid var(--line)', padding:28, position:'sticky', top:88}} className="signup-aside">
          <div style={{display:'grid', placeItems:'center', marginBottom:20}}>
            <Lexi style={lexiStyle} size={140} />
          </div>
          <h2 style={{margin:'0 0 8px', fontSize:22, letterSpacing:'-0.02em'}}>14 dagen gratis proberen</h2>
          <p style={{margin:'0 0 20px', color:'var(--ink-2)', fontSize:14, lineHeight:1.55}}>Daarna €11,95 per maand voor het hele gezin. Opzegbaar per maand.</p>
          <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:10}}>
            {['Adaptieve oefeningen', 'Alle vakken inbegrepen', 'Ouder-dashboard', 'Geen advertenties'].map((t,i) => (
              <li key={i} style={{display:'flex', gap:10, alignItems:'center', fontSize:14}}>
                <span style={{width:18, height:18, borderRadius:'50%', background:'var(--ok-soft)', color:'var(--ok)', display:'grid', placeItems:'center', fontSize:11}}>✓</span>
                {t}
              </li>
            ))}
          </ul>
        </aside>

        {/* Form */}
        <div style={{background:'white', borderRadius:'var(--radius-lg)', border:'1.5px solid var(--line)', padding:32}}>
          {/* Stepper */}
          <div style={{display:'flex', gap:6, marginBottom:28}}>
            {steps.map((s,i) => (
              <div key={i} style={{flex:1}}>
                <div style={{height:4, borderRadius:2, background: i <= step ? 'var(--primary)' : 'var(--line-2)', transition:'background .3s'}}/>
                <p style={{margin:'8px 0 0', fontSize:11, fontFamily:'JetBrains Mono', color: i === step ? 'var(--ink)' : 'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.06em'}}>
                  {String(i+1).padStart(2,'0')} {s}
                </p>
              </div>
            ))}
          </div>

          {step === 0 && <Step0 data={data} set={set} />}
          {step === 1 && <Step1 data={data} set={set} />}
          {step === 2 && <Step2 data={data} set={set} />}
          {step === 3 && <Step3 data={data} set={set} />}

          <div style={{display:'flex', justifyContent:'space-between', marginTop:32, gap:12}}>
            <button onClick={back} style={{background:'none', border:'1.5px solid var(--line)', padding:'12px 18px', borderRadius:10, fontWeight:500, fontSize:14, fontFamily:'Geist'}}>
              {step === 0 ? 'Annuleren' : 'Terug'}
            </button>
            <button onClick={next} style={{background:'var(--ink)', color:'white', border:0, padding:'12px 22px', borderRadius:10, fontWeight:600, fontSize:14, fontFamily:'Geist', display:'inline-flex', gap:8, alignItems:'center'}}>
              {step === 3 ? 'Start proefperiode' : 'Volgende'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 820px) {
          .signup-grid { grid-template-columns: 1fr !important; }
          .signup-aside { position: relative !important; top: 0 !important; }
        }
      `}</style>
    </main>
  );
};

const fieldStyle = {
  width:'100%', padding:'12px 14px', border:'1.5px solid var(--line)',
  borderRadius:10, fontSize:15, fontFamily:'Geist', background:'white',
  outline:'none',
};
const labelStyle = { display:'block', fontSize:13, fontWeight:500, marginBottom:6, color:'var(--ink)' };

const Step0 = ({ data, set }) => (
  <div>
    <h3 style={{margin:'0 0 6px', fontSize:24, letterSpacing:'-0.02em'}}>Maak je ouder-account</h3>
    <p style={{margin:'0 0 24px', color:'var(--ink-2)', fontSize:14}}>Zo kun je de voortgang van je kind volgen.</p>
    <div style={{display:'grid', gap:16}}>
      <div><label style={labelStyle}>Jouw naam</label><input style={fieldStyle} value={data.parentName} onChange={e => set('parentName', e.target.value)} placeholder="Marieke de Vries"/></div>
      <div><label style={labelStyle}>E-mailadres</label><input type="email" style={fieldStyle} value={data.email} onChange={e => set('email', e.target.value)} placeholder="marieke@voorbeeld.nl"/></div>
      <div><label style={labelStyle}>Wachtwoord</label><input type="password" style={fieldStyle} value={data.password} onChange={e => set('password', e.target.value)} placeholder="Minimaal 8 tekens"/></div>
    </div>
  </div>
);

const Step1 = ({ data, set }) => (
  <div>
    <h3 style={{margin:'0 0 6px', fontSize:24, letterSpacing:'-0.02em'}}>Vertel ons over je kind</h3>
    <p style={{margin:'0 0 24px', color:'var(--ink-2)', fontSize:14}}>Je kunt later meer kinderen toevoegen.</p>
    <div style={{display:'grid', gap:16}}>
      <div><label style={labelStyle}>Naam van je kind</label><input style={fieldStyle} value={data.childName} onChange={e => set('childName', e.target.value)} placeholder="Noah"/></div>
      <div>
        <label style={labelStyle}>Groep</label>
        <div style={{display:'grid', gridTemplateColumns:'repeat(8, 1fr)', gap:6}}>
          {[1,2,3,4,5,6,7,8].map(g => (
            <button key={g} onClick={() => set('childAge', String(g))} style={{
              padding:'10px 0', borderRadius:8, border: '1.5px solid ' + (data.childAge === String(g) ? 'var(--ink)' : 'var(--line)'),
              background: data.childAge === String(g) ? 'var(--ink)' : 'white', color: data.childAge === String(g) ? 'white' : 'var(--ink)',
              fontFamily:'Bricolage Grotesque', fontWeight:600, fontSize:14,
            }}>{g}</button>
          ))}
        </div>
      </div>
      <div>
        <label style={labelStyle}>Regio</label>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          {[{v:'NL', t:'Nederland', sub:'SEO leerlijn'},{v:'BE', t:'België', sub:'Vlaamse eindtermen'}].map(o => (
            <button key={o.v} onClick={() => set('region', o.v)} style={{
              textAlign:'left', padding:'14px 16px', borderRadius:10,
              border:'1.5px solid ' + (data.region === o.v ? 'var(--ink)' : 'var(--line)'),
              background: data.region === o.v ? 'var(--primary-soft)' : 'white',
            }}>
              <p style={{margin:0, fontWeight:600}}>{o.t}</p>
              <p style={{margin:'2px 0 0', fontSize:12, color:'var(--ink-3)'}}>{o.sub}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Step2 = ({ data, set }) => {
  const all = ['Rekenen', 'Taal', 'Begrijpend lezen', 'Engels', 'Wereldoriëntatie', 'Studievaardigheden'];
  const toggle = (s) => {
    const has = data.subjects.includes(s);
    set('subjects', has ? data.subjects.filter(x => x !== s) : [...data.subjects, s]);
  };
  return (
    <div>
      <h3 style={{margin:'0 0 6px', fontSize:24, letterSpacing:'-0.02em'}}>Waar wil je mee beginnen?</h3>
      <p style={{margin:'0 0 24px', color:'var(--ink-2)', fontSize:14}}>Je kunt altijd meer vakken aanzetten.</p>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
        {all.map(s => (
          <button key={s} onClick={() => toggle(s)} style={{
            textAlign:'left', padding:'14px 16px', borderRadius:10,
            border:'1.5px solid ' + (data.subjects.includes(s) ? 'var(--ink)' : 'var(--line)'),
            background: data.subjects.includes(s) ? 'var(--primary-soft)' : 'white',
            display:'flex', justifyContent:'space-between', alignItems:'center',
          }}>
            <span style={{fontWeight:500, fontSize:14}}>{s}</span>
            <span style={{
              width:20, height:20, borderRadius:6, border:'1.5px solid ' + (data.subjects.includes(s) ? 'var(--ink)' : 'var(--line)'),
              background: data.subjects.includes(s) ? 'var(--ink)' : 'white', color:'white',
              display:'grid', placeItems:'center', fontSize:12,
            }}>{data.subjects.includes(s) ? '✓' : ''}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const Step3 = ({ data, set }) => {
  const plans = [
    { v:'monthly', label:'Maandelijks', price:'€11,95', per:'/maand', sub:'Opzegbaar per maand' },
    { v:'yearly', label:'Jaarlijks', price:'€99', per:'/jaar', sub:'Bespaar €44 (2 maanden gratis)', best:true },
  ];
  return (
    <div>
      <h3 style={{margin:'0 0 6px', fontSize:24, letterSpacing:'-0.02em'}}>Kies je abonnement</h3>
      <p style={{margin:'0 0 24px', color:'var(--ink-2)', fontSize:14}}>Eerste 14 dagen gratis. Geen kosten tot je proefperiode afloopt.</p>
      <div style={{display:'grid', gap:10}}>
        {plans.map(p => (
          <button key={p.v} onClick={() => set('plan', p.v)} style={{
            textAlign:'left', padding:'20px', borderRadius:12, position:'relative',
            border:'1.5px solid ' + (data.plan === p.v ? 'var(--ink)' : 'var(--line)'),
            background: data.plan === p.v ? 'var(--primary-soft)' : 'white',
            display:'flex', justifyContent:'space-between', alignItems:'center', gap:16,
          }}>
            {p.best && <span style={{position:'absolute', top:-10, right:16, fontSize:11, padding:'3px 10px', background:'var(--ink)', color:'white', borderRadius:999, fontWeight:600}}>Beste deal</span>}
            <div>
              <p style={{margin:0, fontWeight:600, fontSize:16}}>{p.label}</p>
              <p style={{margin:'4px 0 0', fontSize:13, color:'var(--ink-3)'}}>{p.sub}</p>
            </div>
            <div style={{textAlign:'right'}}>
              <p style={{margin:0, fontFamily:'Bricolage Grotesque', fontSize:24, fontWeight:600, letterSpacing:'-0.02em'}}>{p.price}<span style={{fontSize:13, color:'var(--ink-3)', fontWeight:500}}>{p.per}</span></p>
            </div>
          </button>
        ))}
      </div>
      <div style={{marginTop:20, padding:14, background:'var(--bg-2)', borderRadius:10, fontSize:13, color:'var(--ink-2)'}}>
        Geen creditcard nodig voor de proefperiode — we vragen pas betaalgegevens na 14 dagen.
      </div>
    </div>
  );
};

window.Signup = Signup;
