// Landing v3 — parent-first, demo-led, samen-leren positioning
// Sections: Hero (with price + product loop) → Demo → Samen-modus → Reward loop →
//           Subjects → SEO leerlijn (proof) → Ouder-dashboard → Trust → Pricing → FAQ → CTA

const LandingV3 = ({ setRoute, lexiStyle, region, tweaks }) => {
  return (
    <main>
      <HeroV3 setRoute={setRoute} lexiStyle={lexiStyle} region={region} variant={tweaks.heroVariant} showPrice={tweaks.showPriceInHero} />
      <ProductLoop />
      {tweaks.showSamenModus && <SamenModus lexiStyle={lexiStyle} />}
      <RewardLoop lexiStyle={lexiStyle} />
      <SubjectsV3 region={region} />
      <SEOProof region={region} />
      <ParentDashboardV3 setRoute={setRoute} />
      <TrustV3 region={region} />
      <PricingV3 setRoute={setRoute} region={region} />
      <FAQV3 region={region} />
      <FinalCTAV3 setRoute={setRoute} lexiStyle={lexiStyle} />
      <FooterV3 region={region} />
    </main>
  );
};

/* ---------- HERO ---------- */
const HeroV3 = ({ setRoute, lexiStyle, region, variant, showPrice }) => {
  const headlines = {
    samen: { kicker: 'Samen oefenen, niet erbij zitten', h: 'Het oefenprogramma waar je kind\u00A0zélf om vraagt.', sub: 'Lexi past elke vraag aan op het niveau van je kind. Jij krijgt elke week één gespreksstarter — om samen aan tafel te bespreken, niet om te controleren.' },
    direct: { kicker: 'Adaptief oefenen voor groep 1 t/m 8', h: 'Jouw kind oefent precies wat de juf\u00A0volgende\u00A0week toetst.', sub: 'Lexi.kids beweegt mee met het tempo en niveau van je kind, en koppelt elke vraag aan de leerdoelen van groep 1 t/m 8.' },
    play: { kicker: 'Geen huiswerk-app, een leeravontuur', h: 'Oefenen voelt als spelen. De\u00A0vooruitgang is\u00A0echt.', sub: 'Quizzen, mini-games en een wereld die meegroeit met je kind. Onder de motorkap: een adaptief leersysteem dat de moeilijkheidsgraad live bijstuurt.' },
  };
  const copy = headlines[variant] || headlines.samen;

  return (
    <section style={{padding:'48px 20px 24px', position:'relative', overflow:'hidden'}}>
      <div style={{maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1.05fr 0.95fr', gap:48, alignItems:'center'}} className="hero-grid">
        <div>
          <div style={{display:'inline-flex', alignItems:'center', gap:8, padding:'6px 12px', borderRadius:999, background:'white', border:'1px solid var(--line)', fontSize:13, color:'var(--ink-2)', marginBottom:18}}>
            <Flag code={region} size={16} />
            <span>{copy.kicker}</span>
          </div>
          <h1 style={{fontSize:'clamp(38px, 5.6vw, 64px)', lineHeight:1.02, margin:'0 0 18px', letterSpacing:'-0.03em'}}>
            {copy.h.split('\n').map((line,i) => <span key={i}>{line}<br/></span>)}
          </h1>
          <p style={{fontSize:18, color:'var(--ink-2)', maxWidth:540, margin:'0 0 26px', lineHeight:1.55}}>
            {copy.sub}
          </p>

          <div style={{display:'flex', gap:12, flexWrap:'wrap', marginBottom:20, alignItems:'center'}}>
            <button onClick={() => setRoute('signup')} style={btnV3.primary}>
              Start 14 dagen gratis
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button onClick={() => setRoute('question')} style={btnV3.ghost}>Probeer een vraag →</button>
            {showPrice && (
              <div style={{display:'inline-flex', alignItems:'baseline', gap:6, paddingLeft:8, marginLeft:4, borderLeft:'1px solid var(--line)'}}>
                <span style={{fontFamily:'Bricolage Grotesque', fontWeight:600, fontSize:22, letterSpacing:'-0.02em'}}>€11,95</span>
                <span style={{fontSize:13, color:'var(--ink-3)'}}>/ maand · hele gezin</span>
              </div>
            )}
          </div>

          <ul style={{display:'flex', flexWrap:'wrap', gap:'10px 20px', padding:0, margin:0, listStyle:'none', fontSize:13, color:'var(--ink-2)'}}>
            {['Geen creditcard nodig', 'Per maand opzegbaar', 'Voor alle kinderen in het gezin'].map((t,i) => (
              <li key={i} style={{display:'flex', alignItems:'center', gap:8}}>
                <span style={{width:14, height:14, borderRadius:'50%', background:'var(--ok-soft)', color:'var(--ok)', display:'grid', placeItems:'center', fontSize:9}}>✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <HeroProductFrame lexiStyle={lexiStyle} />
      </div>
      <style>{`
        @media (max-width: 920px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </section>
  );
};

/* A small, real product frame — phone with a question being answered */
const HeroProductFrame = ({ lexiStyle }) => {
  const [step, setStep] = React.useState(0); // 0 question, 1 selected, 2 correct, 3 reward
  React.useEffect(() => {
    const seq = [0, 1, 2, 3];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % seq.length;
      setStep(seq[i]);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{position:'relative', display:'grid', placeItems:'center', minHeight:460}}>
      {/* dotted backdrop */}
      <div style={{position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at center, var(--line) 1.2px, transparent 1.2px)', backgroundSize:'22px 22px', maskImage:'radial-gradient(circle at center, black 50%, transparent 78%)', WebkitMaskImage:'radial-gradient(circle at center, black 50%, transparent 78%)'}}/>

      {/* Phone */}
      <div style={{
        position:'relative', width:300, height:540,
        background:'oklch(22% 0.025 260)', borderRadius:36, padding:10,
        boxShadow:'var(--shadow-lg)',
      }}>
        <div style={{width:'100%', height:'100%', background:'white', borderRadius:28, overflow:'hidden', display:'flex', flexDirection:'column'}}>
          {/* status */}
          <div style={{padding:'12px 18px 6px', display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--ink-3)', fontFamily:'JetBrains Mono'}}>
            <span>9:41</span>
            <span>Lexi · Rekenen</span>
          </div>
          {/* progress */}
          <div style={{padding:'8px 18px'}}>
            <div style={{height:5, borderRadius:3, background:'var(--line-2)', overflow:'hidden'}}>
              <div style={{height:'100%', width:'70%', background:'var(--primary)', transition:'width .4s'}}/>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginTop:4, fontSize:10, color:'var(--ink-3)', fontFamily:'JetBrains Mono'}}>
              <span>vraag 7 / 10</span>
              <span>niveau 4</span>
            </div>
          </div>

          {/* question */}
          <div style={{padding:'14px 18px 0', flex:1, display:'flex', flexDirection:'column'}}>
            <p style={{margin:0, fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.06em'}}>Breuken vergelijken</p>
            <h3 style={{margin:'4px 0 12px', fontSize:18, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.01em'}}>
              Welk deel is groter?
            </h3>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12}}>
              <Slice frac="3/4" filled={3} total={4} />
              <Slice frac="2/3" filled={2} total={3} />
            </div>

            <div style={{display:'grid', gap:6}}>
              {['3 / 4', '2 / 3', 'Even groot'].map((opt, i) => {
                const isPick = i === 0;
                const showFeedback = step >= 1;
                const showCorrect = step >= 2;
                let bg = 'white', border = '1.5px solid var(--line)', col = 'var(--ink)';
                if (showFeedback && isPick && showCorrect) { bg = 'var(--ok-soft)'; border = '1.5px solid var(--ok)'; col = 'var(--ok)'; }
                else if (showFeedback && isPick) { bg = 'var(--bg-2)'; border = '1.5px solid var(--ink)'; }
                return (
                  <div key={i} style={{
                    padding:'10px 12px', borderRadius:10, background:bg, border, color:col,
                    fontSize:14, fontWeight:500, display:'flex', justifyContent:'space-between', alignItems:'center',
                    transition:'all .25s',
                  }}>
                    <span>{opt}</span>
                    {showFeedback && isPick && showCorrect && <span style={{fontSize:14}}>✓</span>}
                  </div>
                );
              })}
            </div>

            <div style={{flex:1}}/>
          </div>

          {/* Reward overlay */}
          {step === 3 && (
            <div style={{position:'absolute', inset:10, background:'rgba(255,255,255,0.96)', borderRadius:28, display:'grid', placeItems:'center', animation:'reward-in .3s ease-out'}}>
              <div style={{textAlign:'center'}}>
                <div style={{width:90, height:90, margin:'0 auto 12px', display:'grid', placeItems:'center'}}>
                  <Lexi style={lexiStyle} size={90} float={false} />
                </div>
                <p style={{margin:'0 0 4px', fontSize:13, color:'var(--ink-3)', fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.08em'}}>+12 munten</p>
                <p style={{margin:0, fontSize:18, fontFamily:'Bricolage Grotesque', fontWeight:600}}>Goed bezig!</p>
                <div style={{display:'inline-flex', gap:6, marginTop:14, padding:'6px 12px', borderRadius:999, background:'var(--sun-soft)', border:'1px solid var(--sun)', fontSize:12, fontWeight:600, color:'oklch(40% 0.13 80)'}}>
                  <span>★</span> Nieuw avatar-onderdeel ontgrendeld
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* parent ping card */}
      <div style={{
        position:'absolute', right:-8, bottom:30, width:230,
        background:'white', border:'1.5px solid var(--line)', borderRadius:14,
        padding:14, boxShadow:'var(--shadow)',
      }} className="parent-ping">
        <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
          <div style={{width:24, height:24, borderRadius:8, background:'var(--ink)', color:'white', display:'grid', placeItems:'center', fontSize:11, fontWeight:600}}>L</div>
          <span style={{fontSize:11, color:'var(--ink-3)', fontFamily:'JetBrains Mono'}}>aan papa · zojuist</span>
        </div>
        <p style={{margin:0, fontSize:13, lineHeight:1.45, color:'var(--ink)'}}>
          Sara had moeite met breuken vergelijken. Vraag haar vanavond: <i>"Wat is groter, ½ pizza of ⅔ pizza?"</i>
        </p>
      </div>

      <style>{`
        @keyframes reward-in { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        @media (max-width: 920px) {
          .parent-ping { right: 0 !important; bottom: -12px !important; }
        }
      `}</style>
    </div>
  );
};

const Slice = ({ frac, filled, total }) => {
  const slices = Array.from({length: total});
  const r = 30;
  return (
    <div style={{padding:10, border:'1px solid var(--line-2)', borderRadius:10, display:'flex', alignItems:'center', gap:10}}>
      <svg width="56" height="56" viewBox="-32 -32 64 64">
        {slices.map((_, i) => {
          const a0 = (i / total) * Math.PI * 2 - Math.PI / 2;
          const a1 = ((i + 1) / total) * Math.PI * 2 - Math.PI / 2;
          const x0 = r * Math.cos(a0), y0 = r * Math.sin(a0);
          const x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);
          const large = (a1 - a0) > Math.PI ? 1 : 0;
          return (
            <path key={i} d={`M0 0 L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`}
              fill={i < filled ? 'oklch(85% 0.15 95)' : 'white'}
              stroke="oklch(22% 0.025 260)" strokeWidth="1.5"/>
          );
        })}
      </svg>
      <span style={{fontFamily:'Bricolage Grotesque', fontWeight:600, fontSize:18}}>{frac}</span>
    </div>
  );
};

const btnV3 = {
  primary: {
    background:'var(--ink)', color:'white', border:0,
    padding:'14px 22px', borderRadius: 12, fontWeight: 600, fontSize: 16,
    display:'inline-flex', alignItems:'center', gap:10, cursor:'pointer',
  },
  ghost: {
    background:'white', color:'var(--ink)', border:'1.5px solid var(--line)',
    padding:'14px 20px', borderRadius: 12, fontWeight: 600, fontSize: 15, cursor:'pointer',
  },
};

/* ---------- PRODUCT LOOP — what 15 minutes look like ---------- */
const ProductLoop = () => {
  const steps = [
    { t: '0:00', title: 'Lexi groet je kind', body: 'Korte intro, herkenbare avatar. Geen pop-ups, geen reclame.' },
    { t: '0:30', title: '10 vragen, allemaal op niveau', body: 'Multiple choice, intypen, slepen, schieten — afwisseling per vraag.' },
    { t: '5:00', title: 'Mini-game als beloning', body: 'Twee minuten ontspanning. Geen gokkast-mechaniek; gewoon leuk.' },
    { t: '12:00', title: 'Eén bericht voor jou', body: 'Lexi stuurt je één concrete gespreksstarter — niet meer dan dat.' },
  ];
  return (
    <section id="hoe" style={{padding:'80px 20px', background:'var(--bg-2)', borderTop:'1px solid var(--line-2)', borderBottom:'1px solid var(--line-2)'}}>
      <div style={{maxWidth:1200, margin:'0 auto'}}>
        <SectionIntroV3 eyebrow="Een doordeweekse avond" title="Zo ziet 15 minuten met Lexi eruit." lead="Geen losse oefenboekjes, geen YouTube. Eén vast moment per dag — kort, voorspelbaar en altijd op het juiste niveau." />
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginTop:40, position:'relative'}} className="loop-grid">
          {steps.map((s,i) => (
            <article key={i} style={{
              background:'white', border:'1.5px solid var(--line)', borderRadius:'var(--radius)',
              padding:'22px 20px', position:'relative',
            }}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:14}}>
                <span style={{padding:'3px 8px', background:'var(--ink)', color:'white', borderRadius:6, fontSize:11, fontFamily:'JetBrains Mono', fontWeight:500}}>{s.t}</span>
                <span style={{fontSize:11, color:'var(--ink-3)', fontFamily:'JetBrains Mono'}}>stap {i+1}</span>
              </div>
              <h4 style={{margin:'0 0 8px', fontSize:17, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.01em'}}>{s.title}</h4>
              <p style={{margin:0, fontSize:14, color:'var(--ink-2)', lineHeight:1.5}}>{s.body}</p>
            </article>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 920px) { .loop-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 520px) { .loop-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
};

/* ---------- SAMEN-MODUS — the differentiator ---------- */
const SamenModus = ({ lexiStyle }) => (
  <section id="samen" style={{padding:'96px 20px'}}>
    <div style={{maxWidth:1200, margin:'0 auto'}}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:56, alignItems:'center'}} className="samen-grid">
        <div>
          <div style={{display:'inline-flex', alignItems:'center', gap:8, padding:'6px 12px', borderRadius:999, background:'var(--sun-soft)', border:'1px solid var(--sun)', fontSize:13, color:'oklch(40% 0.13 80)', marginBottom:18, fontWeight:600}}>
            <span style={{width:6, height:6, borderRadius:'50%', background:'oklch(40% 0.13 80)'}}/>
            Nieuw — Samen-modus
          </div>
          <h2 style={{fontSize:'clamp(32px, 4.4vw, 48px)', letterSpacing:'-0.02em', margin:'0 0 18px', lineHeight:1.05}}>
            Een kwartier samen leren. Geen huiswerkgevecht.
          </h2>
          <p style={{fontSize:17, color:'var(--ink-2)', margin:'0 0 24px', lineHeight:1.55}}>
            Open Samen-modus en jullie spelen een ronde samen — Lexi op de tablet van je kind, een kleine hint-kaart op jouw telefoon. Jij hoeft niet te weten wat een "kommagetal" is. Lexi vertelt het.
          </p>
          <ul style={{listStyle:'none', padding:0, margin:'0 0 28px', display:'grid', gap:14}}>
            {[
              { h:'Hint zonder spoiler', b:'Jij ziet hoe je kunt helpen. Niet wát het antwoord is.' },
              { h:'Eén gespreksstarter per week', b:'Concrete vragen om aan tafel te bespreken — geen rapportage.' },
              { h:'Geen schermtijd erbij', b:'Samen-modus duurt zo lang als jullie samen willen. Klaar is klaar.' },
            ].map((it,i) => (
              <li key={i} style={{display:'flex', gap:14, alignItems:'start'}}>
                <span style={{flexShrink:0, width:28, height:28, borderRadius:'50%', background:'var(--ink)', color:'white', display:'grid', placeItems:'center', fontSize:13, fontWeight:600, marginTop:2}}>{i+1}</span>
                <div>
                  <p style={{margin:'0 0 2px', fontSize:16, fontWeight:600, fontFamily:'Bricolage Grotesque', letterSpacing:'-0.01em'}}>{it.h}</p>
                  <p style={{margin:0, fontSize:14, color:'var(--ink-2)', lineHeight:1.5}}>{it.b}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <SamenScene lexiStyle={lexiStyle} />
      </div>
    </div>
    <style>{`
      @media (max-width: 920px) {
        .samen-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
      }
    `}</style>
  </section>
);

const SamenScene = ({ lexiStyle }) => (
  <div style={{position:'relative', minHeight:460}}>
    {/* tablet */}
    <div style={{
      position:'absolute', top:20, left:0, width:'78%', aspectRatio:'4/3',
      background:'oklch(22% 0.025 260)', borderRadius:18, padding:8,
      boxShadow:'var(--shadow-lg)',
    }}>
      <div style={{width:'100%', height:'100%', background:'white', borderRadius:12, padding:'16px 20px', display:'flex', flexDirection:'column'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
          <span style={{fontSize:11, color:'var(--ink-3)', fontFamily:'JetBrains Mono'}}>SAMEN MET PAPA</span>
          <span style={{padding:'2px 8px', background:'var(--sun-soft)', color:'oklch(40% 0.13 80)', borderRadius:999, fontSize:10, fontWeight:600}}>RONDE 3 / 5</span>
        </div>
        <p style={{margin:'4px 0 12px', fontSize:13, color:'var(--ink-3)'}}>Vul de zin aan</p>
        <h4 style={{margin:'0 0 14px', fontFamily:'Bricolage Grotesque', fontSize:'clamp(16px, 1.4vw, 20px)', fontWeight:600, letterSpacing:'-0.01em', lineHeight:1.3}}>
          De hond <span style={{background:'var(--sun)', padding:'0 6px', borderRadius:4}}>______</span> over het hek.
        </h4>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6}}>
          {['springt', 'sprong', 'spring', 'gesprongen'].map((w,i) => (
            <div key={i} style={{padding:'8px 10px', border:'1.5px solid ' + (i===0?'var(--ok)':'var(--line)'), borderRadius:8, fontSize:13, fontWeight:500, color:i===0?'var(--ok)':'var(--ink)', background:i===0?'var(--ok-soft)':'white'}}>
              {w}
            </div>
          ))}
        </div>
        <div style={{flex:1}}/>
        <div style={{display:'flex', alignItems:'center', gap:8, paddingTop:10, borderTop:'1px solid var(--line-2)', marginTop:10}}>
          <Lexi style={lexiStyle} size={32} float={false} animate={false} />
          <p style={{margin:0, fontSize:11, color:'var(--ink-2)'}}>"Wat denk jij, Sara?"</p>
        </div>
      </div>
    </div>

    {/* phone with hint */}
    <div style={{
      position:'absolute', right:0, bottom:10, width:230,
      background:'oklch(22% 0.025 260)', borderRadius:24, padding:6,
      boxShadow:'var(--shadow-lg)',
    }}>
      <div style={{background:'white', borderRadius:18, padding:'14px 14px 16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12, paddingBottom:10, borderBottom:'1px solid var(--line-2)'}}>
          <div style={{width:22, height:22, borderRadius:7, background:'var(--ink)', color:'white', display:'grid', placeItems:'center', fontSize:10, fontWeight:600}}>L</div>
          <p style={{margin:0, fontSize:11, fontFamily:'JetBrains Mono', color:'var(--ink-3)'}}>HINT VOOR JOU</p>
        </div>
        <p style={{margin:'0 0 8px', fontSize:13, fontWeight:600, color:'var(--ink)'}}>Persoonsvorm in de tegenwoordige tijd.</p>
        <p style={{margin:'0 0 12px', fontSize:12, color:'var(--ink-2)', lineHeight:1.5}}>Tip: vraag <i>"De hond doet het nu, welk woord past?"</i></p>
        <div style={{padding:'8px 10px', background:'var(--bg-2)', borderRadius:8, fontSize:11, color:'var(--ink-3)', fontFamily:'JetBrains Mono'}}>
          ✓ goed antwoord = "springt"
        </div>
      </div>
    </div>
  </div>
);

/* ---------- REWARD LOOP ---------- */
const RewardLoop = ({ lexiStyle }) => {
  const [phase, setPhase] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setPhase(p => (p + 1) % 3), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{padding:'80px 20px', background:'var(--bg-2)', borderTop:'1px solid var(--line-2)', borderBottom:'1px solid var(--line-2)'}}>
      <div style={{maxWidth:1200, margin:'0 auto'}}>
        <SectionIntroV3 eyebrow="Beloningen die kloppen" title="Munten verdienen, geen rookgordijn." lead="We laten kinderen vooruitgang voelen — maar zonder oneindige badge-streams die alleen verslavend zijn. Wat je kind verdient, kan het ook ergens aan uitgeven." />

        <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr', gap:18, marginTop:40}} className="reward-grid">
          <div style={{background:'white', border:'1.5px solid var(--line)', borderRadius:'var(--radius-lg)', padding:28, position:'relative', overflow:'hidden'}}>
            <p style={{margin:'0 0 4px', fontSize:12, fontFamily:'JetBrains Mono', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em'}}>Stap 1</p>
            <h4 style={{margin:'0 0 10px', fontSize:20, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.01em'}}>Oefenen verdient munten</h4>
            <p style={{margin:'0 0 18px', fontSize:14, color:'var(--ink-2)', lineHeight:1.5}}>Geen punten voor opklikken. Munten alleen voor goed doordachte antwoorden — meer voor moeilijkere vragen.</p>
            <div style={{display:'flex', gap:6, alignItems:'end'}}>
              {[3, 5, 8, 12, 15].map((v,i) => (
                <div key={i} style={{flex:1}}>
                  <div style={{height: v * 6, background: i === phase ? 'var(--primary)' : 'oklch(88% 0.06 35)', borderRadius:'4px 4px 0 0', transition:'background .3s'}}/>
                  <p style={{margin:'4px 0 0', textAlign:'center', fontSize:10, fontFamily:'JetBrains Mono', color:'var(--ink-3)'}}>+{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:'white', border:'1.5px solid var(--line)', borderRadius:'var(--radius-lg)', padding:28}}>
            <p style={{margin:'0 0 4px', fontSize:12, fontFamily:'JetBrains Mono', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em'}}>Stap 2</p>
            <h4 style={{margin:'0 0 10px', fontSize:20, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.01em'}}>Avatar groeit mee</h4>
            <p style={{margin:'0 0 18px', fontSize:14, color:'var(--ink-2)', lineHeight:1.5}}>Onderdelen ontgrendelen, niet kopen met echt geld. Geen lootboxes, geen FOMO.</p>
            <div style={{display:'grid', placeItems:'center', padding:'10px 0'}}>
              <div style={{display:'grid', placeItems:'center', position:'relative'}}>
                <Lexi style={lexiStyle} size={120} />
                {phase >= 1 && (
                  <div style={{position:'absolute', top:-6, right:-10, padding:'3px 8px', background:'var(--ok)', color:'white', borderRadius:999, fontSize:10, fontWeight:600, animation:'reward-in .3s ease-out'}}>+ hoed</div>
                )}
              </div>
            </div>
          </div>

          <div style={{background:'white', border:'1.5px solid var(--line)', borderRadius:'var(--radius-lg)', padding:28}}>
            <p style={{margin:'0 0 4px', fontSize:12, fontFamily:'JetBrains Mono', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em'}}>Stap 3</p>
            <h4 style={{margin:'0 0 10px', fontSize:20, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.01em'}}>Echte goodies</h4>
            <p style={{margin:'0 0 18px', fontSize:14, color:'var(--ink-2)', lineHeight:1.5}}>Kinderen kunnen munten inwisselen voor stickers, posters of een boekje — opgestuurd naar huis.</p>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              {[
                { l:'Sticker-set', c:'200' },
                { l:'Poster', c:'600' },
                { l:'Werkboekje', c:'1200' },
              ].map((g,i) => (
                <div key={i} style={{padding:'8px 10px', borderRadius:8, background:'var(--bg-2)', border:'1px solid var(--line-2)', fontSize:12, fontWeight:500}}>
                  {g.l} <span style={{color:'var(--primary)', fontFamily:'JetBrains Mono', fontSize:11}}>· {g.c}m</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 920px) { .reward-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
};

/* ---------- SUBJECTS ---------- */
const SubjectsV3 = ({ region }) => {
  const list = [
    { icon: '∑', name: 'Rekenen', topics: 'Getallen, meten, verhoudingen', color: 'var(--primary-soft)', ink: 'var(--primary-ink)' },
    { icon: 'A', name: 'Taal', topics: 'Spelling, begrijpend lezen, woordenschat', color: 'var(--teal-soft)', ink: 'oklch(38% 0.12 185)' },
    { icon: '◐', name: 'Wereldoriëntatie', topics: 'Aardrijkskunde, geschiedenis, natuur', color: 'var(--sun-soft)', ink: 'oklch(45% 0.12 80)' },
    { icon: 'EN', name: 'Engels', topics: 'Woordenschat, lezen, luisteren', color: 'var(--plum-soft)', ink: 'oklch(38% 0.12 305)' },
    { icon: '✎', name: 'Begrijpend lezen', topics: 'Tekst, hoofdzaak, inferenties', color: 'var(--ok-soft)', ink: 'oklch(38% 0.12 155)' },
    { icon: '★', name: 'Studievaardigheden', topics: 'Tabellen, grafieken, informatie', color: '#F4E9FF', ink: 'oklch(40% 0.14 295)' },
  ];
  return (
    <section id="vakken" style={{padding:'96px 20px'}}>
      <div style={{maxWidth:1200, margin:'0 auto'}}>
        <SectionIntroV3 eyebrow="Vakken" title="Alles wat op school aan bod komt." lead={region === 'BE' ? 'Afgestemd op de Vlaamse eindtermen en het ZILL-leerplan. Van kleuterklas tot het 6de leerjaar.' : 'Afgestemd op de Nederlandse SEO leerlijn. Van kleuterklas tot groep 8.'} />
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, marginTop:48}} className="subj-grid">
          {list.map((s,i) => (
            <div key={i} style={{background:'white', borderRadius:'var(--radius)', border:'1.5px solid var(--line)', padding:24, display:'flex', gap:16, alignItems:'start'}}>
              <div style={{
                width:52, height:52, borderRadius:14, flexShrink:0,
                background: s.color, color: s.ink,
                display:'grid', placeItems:'center',
                fontFamily:'Bricolage Grotesque', fontWeight:700, fontSize:22,
                border: '1.5px solid var(--line)',
              }}>{s.icon}</div>
              <div>
                <h4 style={{margin:'2px 0 4px', fontSize:18, fontFamily:'Bricolage Grotesque', fontWeight:600}}>{s.name}</h4>
                <p style={{margin:0, fontSize:14, color:'var(--ink-2)'}}>{s.topics}</p>
                <p style={{margin:'10px 0 0', fontSize:12, color:'var(--ink-3)', fontFamily:'JetBrains Mono'}}>
                  {region === 'BE' ? '1ste – 6de leerjaar' : 'groep 1–8'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 920px) { .subj-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 520px) { .subj-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
};

/* ---------- SEO leerlijn — REFRAMED as parent benefit ---------- */
const SEOProof = ({ region }) => (
  <section id="seo" style={{padding:'96px 20px', background:'var(--bg-2)', borderTop:'1px solid var(--line-2)', borderBottom:'1px solid var(--line-2)'}}>
    <div style={{maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:56, alignItems:'center'}} className="seo-grid">
      <div>
        <p className="mono" style={{fontSize:12, letterSpacing:'0.08em', color:'var(--ink-3)', textTransform:'uppercase', margin:'0 0 10px'}}>{region === 'BE' ? 'ZILL eindtermen' : 'SEO leerlijn 2026'}</p>
        <h2 style={{fontSize:'clamp(30px, 4vw, 44px)', letterSpacing:'-0.02em', margin:'0 0 18px', lineHeight:1.05}}>
          Je kind oefent precies wat de juf volgende week toetst.
        </h2>
        <p style={{fontSize:17, color:'var(--ink-2)', margin:'0 0 22px', lineHeight:1.55}}>
          Elke vraag bij Lexi is gekoppeld aan een leerdoel uit {region === 'BE' ? 'het ZILL-leerplan' : 'de SEO leerlijn'}. Dezelfde leerdoelen die op het rapport staan — zo zie je in één oogopslag waar je kind staat ten opzichte van wat school verwacht.
        </p>
        <ul style={{listStyle:'none', padding:0, margin:'0 0 20px', display:'grid', gap:10}}>
          {[
            'Eén-op-één gekoppeld aan rapportonderdelen',
            'Per leerdoel zichtbaar wat goed gaat',
            'Beoordeeld door leerkrachten uit het basisonderwijs',
          ].map((t,i) => (
            <li key={i} style={{display:'flex', gap:12, alignItems:'start', fontSize:15}}>
              <span style={{flexShrink:0, width:20, height:20, borderRadius:'50%', background:'var(--ink)', color:'white', display:'grid', placeItems:'center', fontSize:11, marginTop:2}}>✓</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{background:'white', borderRadius:'var(--radius-lg)', border:'1.5px solid var(--line)', padding:24, boxShadow:'var(--shadow)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, paddingBottom:14, borderBottom:'1px solid var(--line-2)'}}>
          <div>
            <p style={{margin:0, fontSize:12, color:'var(--ink-3)', fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.08em'}}>Rapport · groep 5, periode 2</p>
            <p style={{margin:'2px 0 0', fontFamily:'Bricolage Grotesque', fontWeight:600, fontSize:17}}>Sara · Rekenen</p>
          </div>
          <span style={{padding:'4px 10px', borderRadius:999, background:'var(--ok-soft)', color:'var(--ok)', fontSize:12, fontWeight:600}}>Op koers</span>
        </div>
        {[
          { l:'REK-5.1', t:'Decimale getallen lezen', pct:92, c:'var(--ok)' },
          { l:'REK-5.2', t:'Kommagetallen optellen', pct:78, c:'var(--primary)' },
          { l:'REK-5.3', t:'Breuken vergelijken', pct:100, c:'var(--ok)' },
          { l:'REK-5.4', t:'Breuken optellen', pct:42, c:'var(--sun)' },
          { l:'REK-5.5', t:'Verhoudingstabel', pct:18, c:'var(--line)', m:true },
        ].map((r,i) => (
          <SeoRowV3 key={i} {...r} />
        ))}
      </div>
    </div>
    <style>{`
      @media (max-width: 920px) { .seo-grid { grid-template-columns: 1fr !important; gap: 36px !important; } }
    `}</style>
  </section>
);

const SeoRowV3 = ({ l, t, pct, c, m }) => (
  <div style={{padding:'10px 0', borderBottom:'1px solid var(--line-2)'}}>
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:6}}>
      <div style={{display:'flex', gap:10, alignItems:'baseline', minWidth:0, flex:1}}>
        <span className="mono" style={{fontSize:11, color:'var(--ink-3)'}}>{l}</span>
        <span style={{fontSize:14, color: m ? 'var(--ink-3)' : 'var(--ink)', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{t}</span>
      </div>
      <span className="mono" style={{fontSize:12, color:'var(--ink-2)'}}>{pct}%</span>
    </div>
    <div style={{height:6, borderRadius:3, background:'var(--line-2)'}}>
      <div style={{height:'100%', width:pct+'%', background:c, borderRadius:3, transition:'width .4s'}}/>
    </div>
  </div>
);

/* ---------- PARENT DASHBOARD — warmer, weekend framing ---------- */
const ParentDashboardV3 = ({ setRoute }) => (
  <section id="dashboard" style={{padding:'96px 20px'}}>
    <div style={{maxWidth:1200, margin:'0 auto'}}>
      <SectionIntroV3 eyebrow="Ouder-dashboard" title="Zondagavond op de bank, met een kop thee." lead="Eén overzichtelijk weekrapport. Geen pushmeldingen, geen ranglijsten, geen schuldgevoel. Wel concrete aanknopingspunten voor het gesprek met je kind." />

      <div style={{marginTop:40, background:'white', borderRadius:'var(--radius-lg)', border:'1.5px solid var(--line)', boxShadow:'var(--shadow)', overflow:'hidden', maxWidth:1000, marginInline:'auto'}}>
        <div style={{padding:'14px 20px', borderBottom:'1px solid var(--line-2)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--bg-2)'}}>
          <div>
            <p style={{margin:0, fontSize:12, color:'var(--ink-3)', fontFamily:'JetBrains Mono'}}>WEEKRAPPORT · WEEK 12</p>
            <p style={{margin:'2px 0 0', fontFamily:'Bricolage Grotesque', fontSize:17, fontWeight:600}}>Sara had een goede week.</p>
          </div>
          <span style={{padding:'4px 10px', borderRadius:999, background:'white', border:'1px solid var(--line)', fontSize:12, color:'var(--ink-2)'}}>3 min lezen</span>
        </div>

        <div style={{padding:24, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14}} className="dash-stats">
          {[
            { l:'Geoefend', v:'47 min', d:'+12 min', up:true },
            { l:'Goed', v:'218 / 264', d:'83%', up:true },
            { l:'Niveaus omhoog', v:'2', d:'Rekenen, Taal', up:true },
          ].map((s,i) => (
            <div key={i} style={{padding:16, border:'1px solid var(--line-2)', borderRadius:12}}>
              <p style={{margin:0, fontSize:12, color:'var(--ink-3)'}}>{s.l}</p>
              <p style={{margin:'6px 0 4px', fontSize:24, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.02em'}}>{s.v}</p>
              <p style={{margin:0, fontSize:12, color: s.up ? 'var(--ok)' : 'var(--ink-3)'}}>{s.d}</p>
            </div>
          ))}
        </div>

        <div style={{padding:'0 24px 24px'}}>
          <div style={{padding:18, background:'var(--bg-2)', borderRadius:12, display:'flex', gap:14, alignItems:'start'}}>
            <div style={{flexShrink:0, width:36, height:36, borderRadius:10, background:'var(--sun-soft)', border:'1px solid var(--sun)', display:'grid', placeItems:'center', fontSize:18}}>💬</div>
            <div>
              <p style={{margin:'0 0 4px', fontSize:13, fontFamily:'JetBrains Mono', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.06em'}}>Gespreksstarter</p>
              <p style={{margin:0, fontSize:15, color:'var(--ink)', lineHeight:1.5}}>
                <i>"Sara, wat is een breuk eigenlijk? Kun je het me uitleggen met een pizza?"</i> — ze heeft hier deze week veel mee geoefend en is er trots op.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{textAlign:'center', marginTop:32}}>
        <button onClick={() => setRoute('dashboard')} style={btnV3.ghost}>
          Bekijk het volledige dashboard →
        </button>
      </div>
    </div>
    <style>{`
      @media (max-width: 720px) { .dash-stats { grid-template-columns: 1fr !important; } }
    `}</style>
  </section>
);

/* ---------- TRUST — only honest claims ---------- */
const TrustV3 = ({ region }) => {
  const quotes = [
    { q: 'Mijn dochter vroeg zélf of ze nog even kon oefenen. Dat had ik niet zien aankomen.', who: 'Marieke', role: 'Moeder, groep 6', city: 'Utrecht' },
    { q: 'De gespreksstarter op zondag werkt voor ons echt. Geen "hoe was school?" meer waar je niets uitkrijgt.', who: 'Tim', role: 'Vader, groep 4', city: 'Gent' },
    { q: 'Veel rustiger in beeld dan andere apps. Geen blinkende badges, wel echt oefenen.', who: 'Sanne', role: 'Moeder, groep 8', city: 'Haarlem' },
  ];
  return (
    <section style={{padding:'80px 20px', background:'var(--bg-2)', borderTop:'1px solid var(--line-2)'}}>
      <div style={{maxWidth:1200, margin:'0 auto'}}>
        <div style={{textAlign:'center', marginBottom:36}}>
          <p className="mono" style={{margin:'0 0 8px', fontSize:12, letterSpacing:'0.08em', color:'var(--ink-3)', textTransform:'uppercase'}}>In beta — sinds januari 2026</p>
          <h2 style={{margin:0, fontSize:'clamp(26px, 3.4vw, 36px)', letterSpacing:'-0.02em'}}>
            Ervaringen van de eerste {region === 'BE' ? 'Vlaamse' : 'Nederlandse'} gezinnen.
          </h2>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}} className="test-grid">
          {quotes.map((t,i) => (
            <figure key={i} style={{margin:0, background:'white', border:'1.5px solid var(--line)', borderRadius:'var(--radius-lg)', padding:24}}>
              <div style={{display:'flex', gap:2, marginBottom:12}}>
                {[0,1,2,3,4].map(k => <span key={k} style={{color:'var(--sun)', fontSize:14}}>★</span>)}
              </div>
              <blockquote style={{margin:0, fontSize:16, fontFamily:'Bricolage Grotesque', fontWeight:500, letterSpacing:'-0.01em', lineHeight:1.4}}>
                "{t.q}"
              </blockquote>
              <figcaption style={{marginTop:16, display:'flex', alignItems:'center', gap:10}}>
                <div style={{width:32, height:32, borderRadius:'50%', background:`oklch(${70 + i*4}% 0.08 ${40 + i*80})`, display:'grid', placeItems:'center', fontWeight:600, color:'white', fontSize:13}}>
                  {t.who[0]}
                </div>
                <div>
                  <p style={{margin:0, fontSize:13, fontWeight:600}}>{t.who}</p>
                  <p style={{margin:0, fontSize:12, color:'var(--ink-3)'}}>{t.role} · {t.city}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <p style={{textAlign:'center', margin:'24px 0 0', fontSize:13, color:'var(--ink-3)'}}>
          Volledige testimonial-set en methodologie op de <a href="#" style={{color:'var(--ink)'}}>onderzoekspagina</a>.
        </p>
      </div>
      <style>{`
        @media (max-width: 920px) { .test-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
};

/* ---------- PRICING ---------- */
const PricingV3 = ({ setRoute, region }) => (
  <section id="prijs" style={{padding:'96px 20px'}}>
    <div style={{maxWidth:980, margin:'0 auto'}}>
      <SectionIntroV3 eyebrow="Prijs" title="Eén prijs, het hele gezin." lead="Geen losse abonnementen per kind. Geen jaarcontract. Per maand opzegbaar — echt." center />

      <div style={{marginTop:40, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}} className="pricing-grid">
        <div style={{background:'white', border:'1.5px solid var(--line)', borderRadius:'var(--radius-lg)', padding:32}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:18}}>
            <div>
              <p style={{margin:'0 0 4px', fontSize:13, fontFamily:'JetBrains Mono', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.06em'}}>Maandelijks</p>
              <h3 style={{margin:0, fontSize:22, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.01em'}}>Gezinsplan</h3>
            </div>
            <span style={{padding:'3px 8px', background:'var(--bg-2)', borderRadius:6, fontSize:11, color:'var(--ink-2)'}}>Populair</span>
          </div>
          <div style={{display:'flex', alignItems:'baseline', gap:6, marginBottom:18}}>
            <span style={{fontFamily:'Bricolage Grotesque', fontWeight:600, fontSize:48, letterSpacing:'-0.03em'}}>€11,95</span>
            <span style={{fontSize:14, color:'var(--ink-3)'}}>/ maand</span>
          </div>
          <ul style={{listStyle:'none', padding:0, margin:'0 0 24px', display:'grid', gap:8}}>
            {['Alle kinderen in het gezin', 'Alle vakken, groep 1 t/m 8', 'Ouder-dashboard + samen-modus', 'Per maand opzegbaar'].map((t,i) => (
              <li key={i} style={{display:'flex', gap:10, alignItems:'center', fontSize:14, color:'var(--ink-2)'}}>
                <span style={{width:16, height:16, borderRadius:'50%', background:'var(--ok-soft)', color:'var(--ok)', display:'grid', placeItems:'center', fontSize:9}}>✓</span>
                {t}
              </li>
            ))}
          </ul>
          <button onClick={() => setRoute('signup')} style={{...btnV3.primary, width:'100%', justifyContent:'center'}}>
            Start 14 dagen gratis
          </button>
          <p style={{margin:'12px 0 0', fontSize:12, color:'var(--ink-3)', textAlign:'center'}}>Geen creditcard nodig.</p>
        </div>

        <div style={{background:'var(--ink)', color:'white', borderRadius:'var(--radius-lg)', padding:32, position:'relative'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:18}}>
            <div>
              <p style={{margin:'0 0 4px', fontSize:13, fontFamily:'JetBrains Mono', color:'oklch(70% 0.05 260)', textTransform:'uppercase', letterSpacing:'0.06em'}}>Per jaar</p>
              <h3 style={{margin:0, fontSize:22, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.01em'}}>Gezinsplan jaar</h3>
            </div>
            <span style={{padding:'3px 8px', background:'var(--sun)', color:'oklch(22% 0.025 260)', borderRadius:6, fontSize:11, fontWeight:600}}>2 mnd gratis</span>
          </div>
          <div style={{display:'flex', alignItems:'baseline', gap:6, marginBottom:6}}>
            <span style={{fontFamily:'Bricolage Grotesque', fontWeight:600, fontSize:48, letterSpacing:'-0.03em'}}>€119</span>
            <span style={{fontSize:14, color:'oklch(75% 0.04 260)'}}>/ jaar</span>
          </div>
          <p style={{margin:'0 0 18px', fontSize:13, color:'oklch(75% 0.04 260)'}}>≈ €9,92 per maand · bespaar €24,40</p>
          <ul style={{listStyle:'none', padding:0, margin:'0 0 24px', display:'grid', gap:8}}>
            {['Alles uit gezinsplan', '2 maanden cadeau', 'Voorrang op nieuwe vakken', 'Geld terug binnen 30 dagen'].map((t,i) => (
              <li key={i} style={{display:'flex', gap:10, alignItems:'center', fontSize:14, color:'oklch(85% 0.02 260)'}}>
                <span style={{width:16, height:16, borderRadius:'50%', background:'oklch(35% 0.05 260)', color:'var(--sun)', display:'grid', placeItems:'center', fontSize:9}}>✓</span>
                {t}
              </li>
            ))}
          </ul>
          <button onClick={() => setRoute('signup')} style={{...btnV3.primary, width:'100%', justifyContent:'center', background:'white', color:'var(--ink)'}}>
            Kies jaarplan
          </button>
        </div>
      </div>

      <p style={{textAlign:'center', margin:'24px 0 0', fontSize:13, color:'var(--ink-3)'}}>
        {region === 'BE' ? 'Inclusief 21% btw · prijzen in euro.' : 'Inclusief 21% btw · prijzen in euro.'}
      </p>
    </div>
    <style>{`
      @media (max-width: 720px) { .pricing-grid { grid-template-columns: 1fr !important; } }
    `}</style>
  </section>
);

/* ---------- FAQ ---------- */
const FAQV3 = ({ region }) => {
  const [open, setOpen] = React.useState(0);
  const items = [
    { q: 'Wat kost het precies?', a: '€11,95 per maand voor alle kinderen in het gezin samen, of €119 per jaar (twee maanden voordeel). Eerste 14 dagen gratis, daarna per maand opzegbaar.' },
    { q: 'Voor welke leeftijd is Lexi?', a: region === 'BE' ? 'Voor kinderen van 4 tot 12 jaar — kleuterklas tot het 6de leerjaar.' : 'Voor kinderen van 4 tot 12 jaar — groep 1 tot en met groep 8.' },
    { q: 'Hoe werkt het samen oefenen?', a: 'In Samen-modus speelt je kind op tablet of computer; jij krijgt op je telefoon korte hint-kaarten. Geen rapport, geen controle — gewoon hulp wanneer je kind het vraagt. Je hoeft de stof niet te kennen.' },
    { q: 'Hoe weet Lexi wat moeilijk is voor mijn kind?', a: 'Na elke vraag past Lexi het niveau aan. Verkeerd antwoord? Volgende vraag een treetje makkelijker. Drie keer goed achter elkaar? Een treetje moeilijker. Zo blijft oefenen passend en frustratie weg.' },
    { q: 'Wie maakt de vragen?', a: 'Leerkrachten uit het basisonderwijs. Elke vraag wordt door minstens één andere docent gereviewd voordat hij in de app verschijnt.' },
    { q: 'Wat met privacy?', a: 'We verzamelen alleen wat nodig is voor het leerproces. Geen advertenties, geen doorverkoop. AVG-conform, data staat in Nederland. Ouders kunnen alle data inzien of verwijderen.' },
    { q: 'Werkt het ook offline?', a: 'Een dagdeel oefenen kan offline (de app cached vragen). Voor het samen-modus hint-kanaal is wel internet nodig.' },
  ];
  return (
    <section id="faq" style={{padding:'96px 20px', background:'var(--bg-2)', borderTop:'1px solid var(--line-2)'}}>
      <div style={{maxWidth:780, margin:'0 auto'}}>
        <SectionIntroV3 eyebrow="Veelgestelde vragen" title="Wat ouders ons vragen." center />
        <div style={{marginTop:32, background:'white', border:'1.5px solid var(--line)', borderRadius:'var(--radius-lg)', overflow:'hidden'}}>
          {items.map((it,i) => (
            <div key={i} style={{borderBottom: i < items.length-1 ? '1px solid var(--line-2)' : 'none'}}>
              <button onClick={() => setOpen(open === i ? -1 : i)} style={{
                width:'100%', textAlign:'left', background:'none', border:0, padding:'18px 22px', cursor:'pointer',
                display:'flex', justifyContent:'space-between', alignItems:'center', gap:16,
                fontSize:16, fontFamily:'Bricolage Grotesque', fontWeight:600, color:'var(--ink)',
              }}>
                <span>{it.q}</span>
                <span style={{
                  width:26, height:26, borderRadius:'50%', background:'var(--bg-2)', border:'1px solid var(--line)',
                  display:'grid', placeItems:'center', flexShrink:0,
                  transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)', transition:'transform .2s',
                }}>+</span>
              </button>
              {open === i && (
                <div style={{padding:'0 22px 20px', color:'var(--ink-2)', fontSize:14.5, lineHeight:1.6}}>{it.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------- FINAL CTA ---------- */
const FinalCTAV3 = ({ setRoute, lexiStyle }) => (
  <section style={{padding:'96px 20px'}}>
    <div style={{
      maxWidth:1100, margin:'0 auto',
      background:'linear-gradient(135deg, oklch(94% 0.04 35), oklch(96% 0.04 95))',
      borderRadius:'var(--radius-lg)', border:'1.5px solid var(--line)',
      padding:'56px 40px', position:'relative', overflow:'hidden',
      display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:32, alignItems:'center',
    }} className="cta-box">
      <div>
        <h2 style={{fontSize:'clamp(30px, 4vw, 42px)', letterSpacing:'-0.02em', margin:'0 0 14px', lineHeight:1.05}}>14 dagen gratis. Daarna €11,95 — of niets.</h2>
        <p style={{fontSize:17, color:'var(--ink-2)', margin:'0 0 26px', maxWidth:520}}>Twee minuten registratie. Geen creditcard. Stop wanneer je wilt.</p>
        <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
          <button onClick={() => setRoute('signup')} style={btnV3.primary}>
            Start gratis proef
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <button onClick={() => setRoute('question')} style={btnV3.ghost}>Probeer een vraag</button>
        </div>
      </div>
      <div style={{display:'grid', placeItems:'center'}} className="cta-lexi">
        <Lexi style={lexiStyle} size={200} />
      </div>
    </div>
    <style>{`
      @media (max-width: 720px) {
        .cta-box { grid-template-columns: 1fr !important; }
        .cta-lexi { order: -1; }
      }
    `}</style>
  </section>
);

/* ---------- FOOTER ---------- */
const FooterV3 = ({ region }) => (
  <footer style={{padding:'60px 20px 40px', borderTop:'1px solid var(--line)'}}>
    <div style={{maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr', gap:32}} className="footer-grid">
      <div>
        <div style={{fontFamily:'Bricolage Grotesque', fontWeight:700, fontSize:22, marginBottom:12}}>Lexi<span style={{color:'var(--primary)'}}>.kids</span></div>
        <p style={{margin:'0 0 16px', fontSize:14, color:'var(--ink-2)', maxWidth:340}}>
          Adaptief oefenen voor groep 1 t/m 8 — gemaakt in Nederland, voor gezinnen in Nederland en Vlaanderen.
        </p>
        <div style={{display:'inline-flex', alignItems:'center', gap:8, padding:'6px 10px', background:'var(--bg-2)', borderRadius:8, fontSize:12, color:'var(--ink-2)'}}>
          <Flag code={region} size={16} />
          Je ziet inhoud voor {region === 'BE' ? 'Vlaanderen' : 'Nederland'}
        </div>
      </div>
      <FooterColV3 title="Product" items={['Hoe het werkt', 'Samen-modus', 'Vakken', 'Prijs']} />
      <FooterColV3 title="Bedrijf" items={['Over ons', 'Leerkrachten', 'Pers', 'Werken bij']} />
      <FooterColV3 title="Hulp" items={['FAQ', 'Contact', 'Privacy', 'Voorwaarden']} />
    </div>
    <div style={{maxWidth:1200, margin:'40px auto 0', paddingTop:24, borderTop:'1px solid var(--line-2)', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12, fontSize:13, color:'var(--ink-3)'}}>
      <span>© 2026 Lexi.kids BV · Amsterdam</span>
      <span className="mono">v3.0</span>
    </div>
    <style>{`
      @media (max-width: 920px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
      @media (max-width: 520px) { .footer-grid { grid-template-columns: 1fr !important; } }
    `}</style>
  </footer>
);

const FooterColV3 = ({ title, items }) => (
  <div>
    <h5 style={{margin:'0 0 14px', fontSize:13, fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--ink-3)', fontWeight:500}}>{title}</h5>
    <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:8}}>
      {items.map((t,i) => <li key={i}><a href="#" style={{color:'var(--ink)', textDecoration:'none', fontSize:14}}>{t}</a></li>)}
    </ul>
  </div>
);

/* ---------- shared ---------- */
const SectionIntroV3 = ({ eyebrow, title, lead, center }) => (
  <div style={{maxWidth:720, ...(center ? {margin:'0 auto', textAlign:'center'} : {})}}>
    {eyebrow && <p className="mono" style={{margin:'0 0 12px', fontSize:12, letterSpacing:'0.08em', color:'var(--ink-3)', textTransform:'uppercase'}}>{eyebrow}</p>}
    <h2 style={{fontSize:'clamp(28px, 3.6vw, 40px)', letterSpacing:'-0.02em', margin:'0 0 14px', lineHeight:1.05, color:'var(--ink)'}}>{title}</h2>
    {lead && <p style={{margin:0, fontSize:17, color:'var(--ink-2)', ...(center ? {maxWidth:640, marginInline:'auto'} : {maxWidth:640}), lineHeight:1.55}}>{lead}</p>}
  </div>
);

window.LandingV3 = LandingV3;
