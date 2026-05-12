// Shop.v3.jsx — webshop met boeken + abonnementen, groep 1-8 filter

const Shop = ({ setRoute, openCart }) => {
  const [group, setGroup] = React.useState('alle');
  const [tab, setTab] = React.useState('alle'); // alle | boeken | abos | bundels
  const [cart, setCart] = React.useState([]);

  const products = [
    // ABONNEMENTEN
    { id:'abo-m', kind:'abo', title:'Lexi.kids Maandelijks', sub:'Per maand opzegbaar', group:[1,2,3,4,5,6,7,8], price:11.95, period:'/mnd', tag:'meest gekozen', color:'primary', desc:'Volledige toegang voor 1 kind. 14 dagen gratis proberen, geen creditcard.' },
    { id:'abo-j', kind:'abo', title:'Lexi.kids Jaarlijks', sub:'2 maanden gratis', group:[1,2,3,4,5,6,7,8], price:119, period:'/jaar', tag:'beste deal', color:'sun', desc:'Voordeligste optie. Alles inclusief, plus toegang tot oefenboeken digitaal.' },
    { id:'abo-g', kind:'abo', title:'Gezinsabonnement', sub:'Tot 4 kinderen', group:[1,2,3,4,5,6,7,8], price:19.95, period:'/mnd', tag:null, color:'plum', desc:'Eén account, vier kindprofielen. Ideaal voor gezinnen.' },

    // BOEKEN groep 1-2
    { id:'b-12-1', kind:'boek', title:'Letters & Klanken', group:[1,2], price:12.95, pages:64, vak:'Taal', cover:'A' },
    { id:'b-12-2', kind:'boek', title:'Tellen tot 20',     group:[1,2], price:12.95, pages:56, vak:'Rekenen', cover:'∑' },
    { id:'b-12-3', kind:'boek', title:'Vormen & Kleuren',  group:[1,2], price:11.50, pages:48, vak:'Wereld', cover:'◐' },

    // BOEKEN groep 3-4
    { id:'b-34-1', kind:'boek', title:'Lezen Stap 1',         group:[3,4], price:13.95, pages:80, vak:'Lezen', cover:'✎' },
    { id:'b-34-2', kind:'boek', title:'Tafels van 1 t/m 10', group:[3,4], price:13.95, pages:72, vak:'Rekenen', cover:'×' },
    { id:'b-34-3', kind:'boek', title:'Spelling Basis',       group:[3,4], price:13.95, pages:80, vak:'Taal', cover:'A' },
    { id:'b-34-4', kind:'boek', title:'Engels: First Words', group:[3,4], price:14.95, pages:64, vak:'Engels', cover:'EN' },

    // BOEKEN groep 5-6
    { id:'b-56-1', kind:'boek', title:'Breuken & Kommagetallen', group:[5,6], price:14.95, pages:96, vak:'Rekenen', cover:'½' },
    { id:'b-56-2', kind:'boek', title:'Werkwoordspelling',        group:[5,6], price:14.95, pages:88, vak:'Taal', cover:'A' },
    { id:'b-56-3', kind:'boek', title:'Aardrijkskunde Nederland', group:[5,6], price:15.95, pages:104, vak:'Wereld', cover:'◐' },
    { id:'b-56-4', kind:'boek', title:'Begrijpend Lezen',          group:[5,6], price:14.95, pages:96, vak:'Lezen', cover:'✎' },

    // BOEKEN groep 7-8
    { id:'b-78-1', kind:'boek', title:'Cito Voorbereiding Rekenen', group:[7,8], price:17.95, pages:120, vak:'Rekenen', cover:'∑', tag:'Cito-toets' },
    { id:'b-78-2', kind:'boek', title:'Cito Voorbereiding Taal',     group:[7,8], price:17.95, pages:120, vak:'Taal', cover:'A', tag:'Cito-toets' },
    { id:'b-78-3', kind:'boek', title:'Engels Grammatica',           group:[7,8], price:15.95, pages:96, vak:'Engels', cover:'EN' },
    { id:'b-78-4', kind:'boek', title:'Topografie Wereld',           group:[7,8], price:16.95, pages:112, vak:'Wereld', cover:'◐' },

    // BUNDELS
    { id:'bn-1', kind:'bundel', title:'Compleet pakket groep 3-4', group:[3,4], price:39.95, oldPrice:55.85, items:'4 boeken + 1 mnd abo', color:'teal' },
    { id:'bn-2', kind:'bundel', title:'Compleet pakket groep 5-6', group:[5,6], price:44.95, oldPrice:60.80, items:'4 boeken + 1 mnd abo', color:'teal' },
    { id:'bn-3', kind:'bundel', title:'Cito-pakket groep 7-8',     group:[7,8], price:49.95, oldPrice:68.80, items:'4 boeken + 2 mnd abo', color:'sun' },
  ];

  const filtered = products.filter(p => {
    if (tab === 'boeken' && p.kind !== 'boek') return false;
    if (tab === 'abos' && p.kind !== 'abo') return false;
    if (tab === 'bundels' && p.kind !== 'bundel') return false;
    if (group !== 'alle' && !p.group.includes(+group)) return false;
    return true;
  });

  const abos = filtered.filter(p => p.kind === 'abo');
  const bundels = filtered.filter(p => p.kind === 'bundel');
  const boeken = filtered.filter(p => p.kind === 'boek');

  const addToCart = (p) => setCart([...cart, p]);
  const cartTotal = cart.reduce((s, p) => s + p.price, 0);

  return (
    <div style={{background:'var(--bg)'}}>
      {/* hero band */}
      <div style={{background:'linear-gradient(180deg, oklch(95% 0.05 35) 0%, var(--bg) 100%)', padding:'40px 20px 28px'}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <p style={{margin:'0 0 6px', fontSize:13, fontFamily:'JetBrains Mono', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.1em'}}>Shop · oefenmateriaal & abonnementen</p>
          <h1 style={{margin:0, fontSize:42, fontFamily:'Bricolage Grotesque', fontWeight:700, letterSpacing:'-0.03em', maxWidth:680}}>Boeken en digitaal oefenen voor groep 1 t/m 8</h1>
          <p style={{margin:'10px 0 0', fontSize:17, color:'var(--ink-2)', maxWidth:620, lineHeight:1.5}}>
            Combineer fysieke werkboeken met een abonnement op Lexi — kinderen leren beter als ze afwisselen tussen schrift en scherm.
          </p>
        </div>
      </div>

      <main style={{maxWidth:1100, margin:'0 auto', padding:'0 20px 80px'}}>
        {/* filters */}
        <div style={{display:'flex', gap:18, alignItems:'flex-start', flexWrap:'wrap', borderBottom:'1px solid var(--line)', padding:'18px 0', marginBottom:24}}>
          <Filter label="Categorie">
            {[
              {v:'alle', l:'Alles'},
              {v:'abos', l:'Abonnementen'},
              {v:'boeken', l:'Werkboeken'},
              {v:'bundels', l:'Bundels'},
            ].map(o => (
              <FilterBtn key={o.v} active={tab===o.v} onClick={() => setTab(o.v)}>{o.l}</FilterBtn>
            ))}
          </Filter>
          <Filter label="Groep">
            <FilterBtn active={group==='alle'} onClick={() => setGroup('alle')}>Alle</FilterBtn>
            {[1,2,3,4,5,6,7,8].map(g => (
              <FilterBtn key={g} active={group === String(g)} onClick={() => setGroup(String(g))}>Groep {g}</FilterBtn>
            ))}
          </Filter>
        </div>

        {/* abonnementen */}
        {abos.length > 0 && (
          <Section title="Abonnementen" sub="Onbeperkt oefenen, alle vakken, alle groepen — opzegbaar per maand">
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}} className="abo-grid">
              {abos.map(p => <AboCard key={p.id} p={p} onAdd={() => addToCart(p)} />)}
            </div>
          </Section>
        )}

        {/* bundels */}
        {bundels.length > 0 && (
          <Section title="Bundels" sub="Werkboeken én digitaal toegang in één pakket — voordeliger">
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}} className="abo-grid">
              {bundels.map(p => <BundleCard key={p.id} p={p} onAdd={() => addToCart(p)} />)}
            </div>
          </Section>
        )}

        {/* boeken per groep-bucket */}
        {boeken.length > 0 && (
          <Section title="Werkboeken" sub={group === 'alle' ? 'Per leeftijdsgroep' : `Voor groep ${group}`}>
            {group === 'alle' ? (
              <BooksByGroup boeken={boeken} addToCart={addToCart} />
            ) : (
              <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}} className="boek-grid">
                {boeken.map(p => <BookCard key={p.id} p={p} onAdd={() => addToCart(p)} />)}
              </div>
            )}
          </Section>
        )}

        {filtered.length === 0 && (
          <div style={{padding:60, textAlign:'center', color:'var(--ink-3)'}}>
            <p style={{fontSize:18, margin:0}}>Geen producten gevonden voor deze combinatie.</p>
            <button onClick={() => { setGroup('alle'); setTab('alle'); }} style={{marginTop:14, padding:'10px 16px', borderRadius:10, background:'var(--ink)', color:'white', border:0, fontWeight:600, cursor:'pointer'}}>
              Reset filters
            </button>
          </div>
        )}
      </main>

      {/* cart pill */}
      {cart.length > 0 && (
        <div style={{position:'fixed', bottom:20, right:20, zIndex:50}}>
          <button style={{
            display:'flex', alignItems:'center', gap:12,
            padding:'14px 20px', borderRadius:999,
            background:'var(--ink)', color:'white', border:0,
            fontFamily:'Geist', fontSize:15, fontWeight:600, cursor:'pointer',
            boxShadow:'var(--shadow-lg)',
          }}>
            <span>🛒 {cart.length} item{cart.length>1?'s':''}</span>
            <span style={{padding:'4px 10px', background:'rgba(255,255,255,0.15)', borderRadius:999, fontFamily:'JetBrains Mono', fontSize:14}}>
              €{cartTotal.toFixed(2)}
            </span>
            <span>→</span>
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 920px) {
          .abo-grid { grid-template-columns: 1fr !important; }
          .boek-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};

const Section = ({ title, sub, children }) => (
  <section style={{marginBottom:48}}>
    <div style={{marginBottom:18}}>
      <h2 style={{margin:0, fontSize:24, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.02em'}}>{title}</h2>
      {sub && <p style={{margin:'4px 0 0', fontSize:14, color:'var(--ink-3)'}}>{sub}</p>}
    </div>
    {children}
  </section>
);

const Filter = ({ label, children }) => (
  <div>
    <p style={{margin:'0 0 8px', fontSize:11, fontFamily:'JetBrains Mono', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em'}}>{label}</p>
    <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>{children}</div>
  </div>
);

const FilterBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding:'7px 12px', borderRadius:8,
    border:'1.5px solid ' + (active ? 'var(--ink)' : 'var(--line)'),
    background: active ? 'var(--ink)' : 'white',
    color: active ? 'white' : 'var(--ink-2)',
    fontSize:13, fontWeight:500, cursor:'pointer',
  }}>{children}</button>
);

const AboCard = ({ p, onAdd }) => {
  const colorMap = {
    primary: { bg:'var(--primary-soft)', border:'var(--primary)', text:'var(--primary-ink)' },
    sun:     { bg:'var(--sun-soft)',     border:'oklch(70% 0.14 80)', text:'oklch(40% 0.13 80)' },
    plum:    { bg:'var(--plum-soft)',    border:'var(--plum)', text:'oklch(38% 0.14 305)' },
  };
  const c = colorMap[p.color] || colorMap.primary;
  return (
    <article style={{background:'white', border:'2px solid ' + (p.tag === 'meest gekozen' ? 'var(--ink)' : 'var(--line)'), borderRadius:'var(--radius-lg)', padding:24, position:'relative', display:'flex', flexDirection:'column'}}>
      {p.tag && (
        <span style={{position:'absolute', top:-10, left:24, padding:'4px 10px', background:c.bg, color:c.text, border:'1.5px solid '+c.border, borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.06em'}}>{p.tag}</span>
      )}
      <h3 style={{margin:'4px 0 4px', fontSize:20, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.01em'}}>{p.title}</h3>
      <p style={{margin:'0 0 14px', fontSize:13, color:'var(--ink-3)'}}>{p.sub}</p>
      <div style={{margin:'4px 0 14px', display:'flex', alignItems:'baseline', gap:4}}>
        <span style={{fontFamily:'Bricolage Grotesque', fontSize:38, fontWeight:700, letterSpacing:'-0.02em'}}>€{p.price.toFixed(2).replace('.',',')}</span>
        <span style={{color:'var(--ink-3)', fontSize:14}}>{p.period}</span>
      </div>
      <p style={{margin:'0 0 18px', fontSize:14, color:'var(--ink-2)', lineHeight:1.55, flex:1}}>{p.desc}</p>
      <button onClick={onAdd} style={{padding:'12px 18px', borderRadius:12, background: p.tag === 'meest gekozen' ? 'var(--ink)' : 'white', color: p.tag === 'meest gekozen' ? 'white' : 'var(--ink)', border: p.tag === 'meest gekozen' ? 0 : '1.5px solid var(--line)', fontWeight:600, fontSize:14, cursor:'pointer', textAlign:'center'}}>
        Kies dit abonnement
      </button>
    </article>
  );
};

const BundleCard = ({ p, onAdd }) => (
  <article style={{background:'white', border:'2px solid var(--teal)', borderRadius:'var(--radius-lg)', padding:22, position:'relative', display:'flex', flexDirection:'column'}}>
    <span style={{position:'absolute', top:-10, left:22, padding:'4px 10px', background:'var(--teal-soft)', color:'oklch(34% 0.12 185)', border:'1.5px solid var(--teal)', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.06em'}}>bundel</span>
    <p style={{margin:'4px 0 4px', fontSize:11, fontFamily:'JetBrains Mono', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em'}}>Groep {p.group.join(' & ')}</p>
    <h3 style={{margin:'0 0 10px', fontSize:18, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.01em'}}>{p.title}</h3>
    <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:8}}>
      <span style={{fontFamily:'Bricolage Grotesque', fontSize:30, fontWeight:700}}>€{p.price.toFixed(2).replace('.',',')}</span>
      <span style={{color:'var(--ink-3)', fontSize:14, textDecoration:'line-through'}}>€{p.oldPrice.toFixed(2).replace('.',',')}</span>
    </div>
    <p style={{margin:'0 0 16px', fontSize:13, color:'var(--ink-2)', flex:1}}>{p.items}</p>
    <button onClick={onAdd} style={{padding:'10px 16px', borderRadius:10, background:'var(--ink)', color:'white', border:0, fontWeight:600, fontSize:13, cursor:'pointer'}}>In winkelmand</button>
  </article>
);

const BooksByGroup = ({ boeken, addToCart }) => {
  const buckets = [
    { label:'Groep 1-2', g:[1,2], color:'oklch(94% 0.05 95)' },
    { label:'Groep 3-4', g:[3,4], color:'oklch(94% 0.04 155)' },
    { label:'Groep 5-6', g:[5,6], color:'oklch(94% 0.04 220)' },
    { label:'Groep 7-8', g:[7,8], color:'oklch(94% 0.04 305)' },
  ];
  return (
    <>
      {buckets.map(b => {
        const items = boeken.filter(p => p.group.some(g => b.g.includes(g)));
        if (items.length === 0) return null;
        return (
          <div key={b.label} style={{marginBottom:30}}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
              <span style={{padding:'4px 12px', background:b.color, borderRadius:999, fontSize:13, fontWeight:600, color:'var(--ink)', border:'1px solid var(--line-2)'}}>{b.label}</span>
              <span style={{fontSize:12, color:'var(--ink-3)', fontFamily:'JetBrains Mono'}}>{items.length} boeken</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}} className="boek-grid">
              {items.map(p => <BookCard key={p.id} p={p} onAdd={() => addToCart(p)} />)}
            </div>
          </div>
        );
      })}
    </>
  );
};

const BookCard = ({ p, onAdd }) => {
  const vakColors = {
    Rekenen:'var(--primary-soft)', Taal:'var(--teal-soft)', Lezen:'var(--ok-soft)', Wereld:'var(--sun-soft)', Engels:'var(--plum-soft)',
  };
  return (
    <article style={{background:'white', border:'1.5px solid var(--line)', borderRadius:14, padding:14, display:'flex', flexDirection:'column'}}>
      {/* cover */}
      <div style={{aspectRatio:'3/4', background:vakColors[p.vak]||'var(--bg-2)', borderRadius:10, border:'1px solid var(--line-2)', display:'grid', placeItems:'center', marginBottom:12, position:'relative'}}>
        <div style={{position:'absolute', top:8, left:8, padding:'2px 8px', background:'rgba(255,255,255,0.85)', borderRadius:6, fontSize:10, fontFamily:'JetBrains Mono', color:'var(--ink-2)', textTransform:'uppercase', letterSpacing:'0.06em'}}>
          Gr {p.group.join('-')}
        </div>
        {p.tag && <div style={{position:'absolute', top:8, right:8, padding:'2px 8px', background:'var(--ink)', color:'white', borderRadius:6, fontSize:10, fontWeight:700}}>{p.tag}</div>}
        <span style={{fontFamily:'Bricolage Grotesque', fontSize:54, fontWeight:700, color:'var(--ink-2)', opacity:0.6}}>{p.cover}</span>
      </div>
      <p style={{margin:'0 0 2px', fontSize:11, fontFamily:'JetBrains Mono', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em'}}>{p.vak}</p>
      <h4 style={{margin:'0 0 4px', fontSize:15, fontFamily:'Bricolage Grotesque', fontWeight:600, letterSpacing:'-0.01em', lineHeight:1.25, flex:1}}>{p.title}</h4>
      <p style={{margin:'0 0 10px', fontSize:12, color:'var(--ink-3)'}}>{p.pages} pagina's</p>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <span style={{fontFamily:'Bricolage Grotesque', fontSize:18, fontWeight:700}}>€{p.price.toFixed(2).replace('.',',')}</span>
        <button onClick={onAdd} style={{padding:'7px 12px', borderRadius:8, background:'var(--ink)', color:'white', border:0, fontWeight:600, fontSize:12, cursor:'pointer'}}>+ In mand</button>
      </div>
    </article>
  );
};

window.Shop = Shop;
