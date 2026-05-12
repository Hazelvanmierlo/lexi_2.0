const TweaksV3 = ({ open, setOpen, values, setValues }) => {
  if (!open) return null;
  const update = (k, v) => {
    const next = { ...values, [k]: v };
    setValues(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
  };

  const Section = ({ label, children }) => (
    <div style={{borderTop:'1px solid var(--line-2)', paddingTop:14}}>
      <p style={{margin:'0 0 8px', fontSize:11, fontFamily:'JetBrains Mono', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--ink-3)'}}>{label}</p>
      {children}
    </div>
  );
  const Seg = ({ k, options }) => (
    <div style={{display:'grid', gridTemplateColumns:`repeat(${options.length}, 1fr)`, gap:6}}>
      {options.map(o => (
        <button key={o.v} onClick={() => update(k, o.v)} style={{
          padding:'8px 6px', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer',
          border:'1.5px solid ' + (values[k] === o.v ? 'var(--ink)' : 'var(--line)'),
          background: values[k] === o.v ? 'var(--ink)' : 'white',
          color: values[k] === o.v ? 'white' : 'var(--ink)', fontFamily:'Geist',
        }}>{o.l}</button>
      ))}
    </div>
  );
  const Toggle = ({ k, label }) => (
    <label style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13, padding:'4px 0', cursor:'pointer'}}>
      <span>{label}</span>
      <span onClick={() => update(k, !values[k])} style={{
        width:36, height:20, borderRadius:999, background: values[k] ? 'var(--ink)' : 'var(--line)',
        position:'relative', transition:'background .2s', cursor:'pointer',
      }}>
        <span style={{position:'absolute', top:2, left: values[k] ? 18 : 2, width:16, height:16, borderRadius:'50%', background:'white', transition:'left .2s'}}/>
      </span>
    </label>
  );

  return (
    <div style={{
      position:'fixed', bottom:20, right:20, zIndex:100, width:300,
      background:'white', borderRadius:16, border:'1.5px solid var(--line)',
      boxShadow:'var(--shadow-lg)', fontFamily:'Geist',
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom:'1px solid var(--line-2)'}}>
        <p style={{margin:0, fontWeight:600, fontFamily:'Bricolage Grotesque', fontSize:15, letterSpacing:'-0.01em'}}>Tweaks</p>
        <button onClick={() => setOpen(false)} style={{background:'none', border:0, color:'var(--ink-3)', fontSize:18, cursor:'pointer', lineHeight:1}}>×</button>
      </div>
      <div style={{padding:16, display:'grid', gap:14, maxHeight:'70vh', overflowY:'auto'}}>
        <Section label="Hero-variant">
          <Seg k="heroVariant" options={[
            {v:'samen', l:'Samen'}, {v:'direct', l:'Direct'}, {v:'play', l:'Speels'},
          ]} />
          <p style={{margin:'8px 0 0', fontSize:11, color:'var(--ink-3)'}}>
            {values.heroVariant === 'samen' && 'Nadruk op samen leren — Squla\'s zwakke plek.'}
            {values.heroVariant === 'direct' && 'Nadruk op concrete schoolaansluiting (toets/leerdoel).'}
            {values.heroVariant === 'play' && 'Nadruk op gamification & avontuur.'}
          </p>
        </Section>

        <Section label="Homepage-elementen">
          <Toggle k="showPriceInHero" label="Prijs in hero tonen" />
          <Toggle k="showSamenModus" label="Samen-modus sectie" />
        </Section>

        <Section label="Lexi-stijl">
          <Seg k="lexiStyle" options={[
            {v:'classic', l:'Cirkel'}, {v:'owl', l:'Uil'}, {v:'bot', l:'Robot'},
          ]} />
        </Section>

        <Section label="Accent">
          <div style={{display:'flex', gap:8}}>
            {[
              {v:'coral', c:'oklch(66% 0.17 35)'},
              {v:'teal', c:'oklch(62% 0.15 185)'},
              {v:'plum', c:'oklch(55% 0.18 305)'},
              {v:'forest', c:'oklch(55% 0.14 145)'},
            ].map(o => (
              <button key={o.v} onClick={() => update('accent', o.v)} style={{
                width:32, height:32, borderRadius:'50%', background:o.c, cursor:'pointer',
                border: '2px solid ' + (values.accent === o.v ? 'var(--ink)' : 'transparent'),
                outline: values.accent === o.v ? '1px solid var(--line)' : 'none',
              }} aria-label={o.v}/>
            ))}
          </div>
        </Section>

        <Section label="Regio">
          <Seg k="region" options={[{v:'NL', l:'🇳🇱 NL'}, {v:'BE', l:'🇧🇪 BE'}]} />
        </Section>
      </div>
    </div>
  );
};

window.TweaksV3 = TweaksV3;
