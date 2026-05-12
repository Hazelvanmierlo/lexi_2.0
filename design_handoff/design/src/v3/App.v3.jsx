const AppV3 = () => {
  const saved = (() => { try { return JSON.parse(localStorage.getItem('lexi-v3-state') || '{}'); } catch { return {}; } })();
  const [route, setRoute] = React.useState(saved.route || 'landing');
  const [tweakOpen, setTweakOpen] = React.useState(false);
  const defaults = window.TWEAK_DEFAULTS || {};
  const [tweakValues, setTweakValues] = React.useState({
    lexiStyle: defaults.lexiStyle || 'bot',
    accent: defaults.accent || 'coral',
    region: saved.region || defaults.region || 'NL',
    heroVariant: defaults.heroVariant || 'samen',
    showPriceInHero: defaults.showPriceInHero !== false,
    showSamenModus: defaults.showSamenModus !== false,
  });

  const setTweak = (k, v) => setTweakValues(prev => ({ ...prev, [k]: v }));
  const setRegion = (r) => setTweak('region', r);

  React.useEffect(() => {
    const map = {
      coral: { primary:'oklch(66% 0.17 35)', ink:'oklch(38% 0.15 35)', soft:'oklch(94% 0.04 35)' },
      teal:  { primary:'oklch(62% 0.15 185)', ink:'oklch(34% 0.12 185)', soft:'oklch(94% 0.035 185)' },
      plum:  { primary:'oklch(55% 0.18 305)', ink:'oklch(35% 0.14 305)', soft:'oklch(95% 0.03 305)' },
      forest:{ primary:'oklch(55% 0.14 145)', ink:'oklch(32% 0.12 145)', soft:'oklch(94% 0.04 145)' },
    };
    const c = map[tweakValues.accent] || map.coral;
    document.documentElement.style.setProperty('--primary', c.primary);
    document.documentElement.style.setProperty('--primary-ink', c.ink);
    document.documentElement.style.setProperty('--primary-soft', c.soft);
  }, [tweakValues.accent]);

  React.useEffect(() => {
    try { localStorage.setItem('lexi-v3-state', JSON.stringify({ route, region: tweakValues.region })); } catch {}
  }, [route, tweakValues.region]);

  React.useEffect(() => { window.scrollTo(0, 0); }, [route]);

  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweakOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweakOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type:'__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const [activeGame, setActiveGame] = React.useState(null);
  const [gameCtx, setGameCtx] = React.useState({});
  const openGame = (id, ctx = {}) => { setActiveGame(id); setGameCtx(ctx); setRoute('kid-play'); };

  const label =
    route === 'landing' ? '01 Landing v3' :
    route === 'signup' ? '02 Signup' :
    route === 'dashboard' ? '03 Ouder dashboard' :
    route === 'question' ? '04 Question' :
    route === 'game' ? '05 Game' :
    route === 'kid' ? '06 Kind home' :
    route === 'kid-play' ? '07 Kind speelt' :
    route === 'admin' ? '08 Admin quizzen' :
    route === 'shop' ? '09 Shop' : '99';

  return (
    <div data-screen-label={label}>
      <NavV3 route={route} setRoute={setRoute} region={tweakValues.region} setRegion={setRegion} />
      {route === 'landing' && <LandingV3 setRoute={setRoute} lexiStyle={tweakValues.lexiStyle} region={tweakValues.region} tweaks={tweakValues} />}
      {route === 'signup' && <Signup setRoute={setRoute} lexiStyle={tweakValues.lexiStyle} />}
      {route === 'dashboard' && <Dashboard setRoute={setRoute} lexiStyle={tweakValues.lexiStyle} />}
      {route === 'question' && <Question setRoute={setRoute} lexiStyle={tweakValues.lexiStyle} />}
      {route === 'game' && <LexiGame setRoute={setRoute} />}
      {route === 'kid' && <KidHome setRoute={setRoute} lexiStyle={tweakValues.lexiStyle} openGame={openGame} />}
      {route === 'kid-play' && <KidGamePlay id={activeGame || 'mc'} setRoute={setRoute} lexiStyle={tweakValues.lexiStyle} quizTitle={gameCtx.quizTitle} customExplain={gameCtx.customExplain} group={gameCtx.group} />}
      {route === 'admin' && <AdminQuiz setRoute={setRoute} />}
      {route === 'shop' && <Shop setRoute={setRoute} />}
      <TweaksV3 open={tweakOpen} setOpen={setTweakOpen} values={tweakValues} setValues={setTweakValues} />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<AppV3 />);
