const NavV3 = ({ route, setRoute, region, setRegion }) => {
  const [open, setOpen] = React.useState(false);
  const [regionOpen, setRegionOpen] = React.useState(false);
  const links = [
    { label: 'Hoe het werkt', anchor: '#hoe' },
    { label: 'Samen oefenen', anchor: '#samen' },
    { label: 'Vakken', anchor: '#vakken' },
    { label: 'Shop', anchor: '__shop' },
    { label: 'Prijs', anchor: '#prijs' },
    { label: 'FAQ', anchor: '#faq' },
  ];
  const go = (anchor) => {
    if (anchor === '__shop') { setRoute('shop'); setOpen(false); return; }
    if (route !== 'landing') setRoute('landing');
    setOpen(false);
    setTimeout(() => {
      const el = document.querySelector(anchor);
      if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' });
    }, 60);
  };

  return (
    <header style={navV3.header}>
      <div style={navV3.inner}>
        <button onClick={() => setRoute('landing')} style={navV3.brand}>
          <span style={navV3.mark}>
            <svg viewBox="0 0 24 24" width="22" height="22">
              <circle cx="12" cy="12" r="10" fill="oklch(66% 0.17 35)" stroke="oklch(22% 0.025 260)" strokeWidth="2"/>
              <circle cx="9" cy="11" r="1.6" fill="oklch(22% 0.025 260)"/>
              <circle cx="15" cy="11" r="1.6" fill="oklch(22% 0.025 260)"/>
              <path d="M9 15 Q12 17 15 15" fill="none" stroke="oklch(22% 0.025 260)" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </span>
          <span style={{fontFamily:'Bricolage Grotesque', fontWeight:700, fontSize:20, letterSpacing:'-0.02em'}}>Lexi<span style={{color:'var(--primary)'}}>.kids</span></span>
        </button>

        <nav style={navV3.links} className="nav-desktop">
          {links.map((l,i) => (
            <button key={i} onClick={() => go(l.anchor)} style={navV3.link}>{l.label}</button>
          ))}
        </nav>

        <div style={navV3.ctas} className="nav-desktop">
          <button onClick={() => setRoute('kid')} style={{...navV3.link, color:'var(--ink-2)'}} title="Demo: kindaccount">Kind</button>
          <button onClick={() => setRoute('admin')} style={{...navV3.link, color:'var(--ink-2)'}} title="Demo: admin">Admin</button>
          <RegionPicker region={region} setRegion={setRegion} open={regionOpen} setOpen={setRegionOpen} />
          <button onClick={() => setRoute('signup')} style={navV3.ghost}>Inloggen</button>
          <button onClick={() => setRoute('signup')} style={navV3.primary}>Start gratis</button>
        </div>

        <button onClick={() => setOpen(!open)} style={navV3.burger} className="nav-mobile" aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></> : <><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></>}
          </svg>
        </button>
      </div>

      {open && (
        <div style={navV3.mobilePanel}>
          {links.map((l,i) => (
            <button key={i} onClick={() => go(l.anchor)} style={navV3.mobileLink}>{l.label}</button>
          ))}
          <div style={{display:'flex', gap:8, padding:'10px 0'}}>
            <FlagButton code="NL" active={region==='NL'} onClick={() => setRegion('NL')} expanded />
            <FlagButton code="BE" active={region==='BE'} onClick={() => setRegion('BE')} expanded />
          </div>
          <div style={{height:1, background:'var(--line)', margin:'8px 0'}} />
          <button onClick={() => { setOpen(false); setRoute('signup'); }} style={navV3.mobileLink}>Inloggen</button>
          <button onClick={() => { setOpen(false); setRoute('signup'); }} style={{...navV3.primary, width:'100%', justifyContent:'center'}}>Start gratis proef</button>
        </div>
      )}

      <style>{`
        @media (max-width: 920px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
        @media (min-width: 921px) {
          .nav-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
};

const RegionPicker = ({ region, setRegion, open, setOpen }) => (
  <div style={{position:'relative'}}>
    <button onClick={() => setOpen(!open)} style={{
      display:'inline-flex', alignItems:'center', gap:8,
      background:'white', border:'1.5px solid var(--line)',
      padding:'7px 10px 7px 8px', borderRadius:10, cursor:'pointer',
      fontFamily:'Geist', fontSize:13, fontWeight:500, color:'var(--ink)',
    }} aria-haspopup="listbox" aria-expanded={open}>
      <Flag code={region} size={20} />
      <span style={{fontFamily:'JetBrains Mono', fontSize:12, letterSpacing:'0.04em'}}>{region}</span>
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 5 6 8 9 5"/></svg>
    </button>
    {open && (
      <div role="listbox" style={{
        position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:50,
        background:'white', border:'1.5px solid var(--line)', borderRadius:12,
        boxShadow:'var(--shadow-lg)', padding:6, minWidth:180,
      }}>
        <RegionOption code="NL" label="Nederland" sub="SEO leerlijn 2026" active={region==='NL'} onClick={() => { setRegion('NL'); setOpen(false); }} />
        <RegionOption code="BE" label="Vlaanderen" sub="Eindtermen ZILL" active={region==='BE'} onClick={() => { setRegion('BE'); setOpen(false); }} />
      </div>
    )}
  </div>
);

const RegionOption = ({ code, label, sub, active, onClick }) => (
  <button onClick={onClick} role="option" aria-selected={active} style={{
    display:'flex', alignItems:'center', gap:10, width:'100%',
    background: active ? 'var(--bg-2)' : 'none',
    border:0, padding:'8px 10px', borderRadius:8, cursor:'pointer',
    fontFamily:'Geist', textAlign:'left',
  }}>
    <Flag code={code} size={22} />
    <div style={{flex:1, minWidth:0}}>
      <div style={{fontSize:13, fontWeight:600, color:'var(--ink)'}}>{label}</div>
      <div style={{fontSize:11, color:'var(--ink-3)'}}>{sub}</div>
    </div>
    {active && <span style={{color:'var(--ok)', fontSize:14}}>✓</span>}
  </button>
);

const FlagButton = ({ code, active, onClick, expanded }) => (
  <button onClick={onClick} style={{
    display:'inline-flex', alignItems:'center', gap:8,
    border:'1.5px solid ' + (active ? 'var(--ink)' : 'var(--line)'),
    background: active ? 'var(--bg-2)' : 'white',
    padding: expanded ? '8px 12px' : '6px 8px',
    borderRadius:10, cursor:'pointer', flex: expanded ? 1 : 'none',
  }}>
    <Flag code={code} size={20} />
    <span style={{fontFamily:'JetBrains Mono', fontSize:12, fontWeight:600}}>{code}</span>
  </button>
);

const Flag = ({ code, size = 20 }) => {
  // 3:2 aspect, rounded
  const w = size, h = Math.round(size * 0.7);
  if (code === 'NL') {
    return (
      <svg width={w} height={h} viewBox="0 0 30 21" style={{borderRadius:3, display:'block', boxShadow:'0 0 0 1px rgba(0,0,0,0.08)'}}>
        <rect width="30" height="7" fill="#AE1C28"/>
        <rect y="7" width="30" height="7" fill="#FFFFFF"/>
        <rect y="14" width="30" height="7" fill="#21468B"/>
      </svg>
    );
  }
  if (code === 'BE') {
    return (
      <svg width={w} height={h} viewBox="0 0 30 21" style={{borderRadius:3, display:'block', boxShadow:'0 0 0 1px rgba(0,0,0,0.08)'}}>
        <rect width="10" height="21" fill="#000000"/>
        <rect x="10" width="10" height="21" fill="#FAE042"/>
        <rect x="20" width="10" height="21" fill="#ED2939"/>
      </svg>
    );
  }
  return null;
};

const navV3 = {
  header: {
    position: 'sticky', top: 0, zIndex: 40,
    background: 'color-mix(in oklab, var(--bg) 90%, transparent)',
    backdropFilter: 'saturate(140%) blur(10px)',
    borderBottom: '1px solid var(--line)',
  },
  inner: {
    maxWidth: 1200, margin: '0 auto', padding: '12px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
  },
  brand: { display:'flex', alignItems:'center', gap:10, background:'none', border:0, padding:0, cursor:'pointer' },
  mark: {
    width: 34, height: 34, borderRadius: 10, background: 'var(--sun-soft)',
    display:'grid', placeItems:'center', border: '1.5px solid var(--line)',
  },
  links: { display:'flex', gap: 4 },
  link: {
    background:'none', border:0, padding:'8px 12px', borderRadius: 8,
    color: 'var(--ink-2)', fontSize: 14, fontWeight: 500, cursor:'pointer',
  },
  ctas: { display:'flex', gap: 8, alignItems:'center' },
  ghost: {
    background:'none', border:'1.5px solid var(--line)', padding:'9px 14px',
    borderRadius: 10, fontWeight: 500, color: 'var(--ink)', fontSize: 14, cursor:'pointer',
  },
  primary: {
    background: 'var(--ink)', color: 'white', border: 0, padding: '10px 16px',
    borderRadius: 10, fontWeight: 600, fontSize: 14, display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer',
  },
  burger: {
    display:'none', background:'none', border:'1.5px solid var(--line)',
    borderRadius: 10, padding: 8, color: 'var(--ink)', cursor:'pointer',
  },
  mobilePanel: {
    borderTop: '1px solid var(--line)', padding: '10px 20px 14px',
    display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--bg)',
  },
  mobileLink: {
    textAlign:'left', background:'none', border:0, padding:'10px 6px',
    color: 'var(--ink)', fontSize: 15, fontWeight: 500, borderBottom: '1px solid var(--line-2)', cursor:'pointer',
  },
};

window.NavV3 = NavV3;
window.Flag = Flag;
