import { useState, useEffect, useRef, useCallback } from 'react';
import { lazy, Suspense } from 'react';
import Landing from './site/Landing';
import AuthScreen from './site/AuthScreen';
import CharacterSelect from './site/CharacterSelect';
const AdminDashboard = lazy(() => import('./AdminDashboard'));

// ── API helper ────────────────────────────────────────────────────────────────
async function apiFetch(method, path, body) {
  const res = await fetch('/api' + path, {
    method, credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SERIF = '"Cinzel","Palatino Linotype",Palatino,serif';
const SANS  = '"Segoe UI",system-ui,sans-serif';

// ── Responsive hook ───────────────────────────────────────────────────────────
function useW() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return w;
}

const CLASS_DATA = {
  Wojownik:         { icon: '⚔',  col: '#E05050', sila:8,  zrecznosc:4,  intelekt:2,  lore: 'Nieustraszony obrońca — stal i krew, ból i chwała.' },
  Paladyn:          { icon: '🛡',  col: '#F0A030', sila:6,  zrecznosc:4,  intelekt:5,  lore: 'Boskie ostrze i święta tarcza. Bóg jest jego mieczem.' },
  'Tancerz Ostrzy': { icon: '🗡',  col: '#D060B0', sila:5,  zrecznosc:9,  intelekt:2,  lore: 'Cień i ostrze. Śmierć, zanim ją zobaczysz.' },
  Lowca:            { icon: '🏹',  col: '#50C060', sila:3,  zrecznosc:8,  intelekt:4,  lore: 'Oko sokoła, serce wilka. Strzała nie chybia.' },
  Tropiciel:        { icon: '🌿',  col: '#30B0A0', sila:4,  zrecznosc:7,  intelekt:4,  lore: 'Las jest domem. Potwory — przeznaczeniem.' },
  Mag:              { icon: '✨',  col: '#9070F0', sila:2,  zrecznosc:3,  intelekt:10, lore: 'Ogień, lód i piorun — żywioły śpiewają jego imię.' },
};

// ── Animated background ────────────────────────────────────────────────────────
function Background() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: '#04080F' }}>
      <style>{`
        @keyframes drift1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(3%,2%) scale(1.04)} 66%{transform:translate(-2%,3%) scale(0.97)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-4%,-2%) scale(1.06)} 66%{transform:translate(3%,-1%) scale(0.95)} }
        @keyframes drift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(2%,-3%) scale(1.03)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
        @keyframes glow   { 0%,100%{opacity:.55} 50%{opacity:.85} }
        @keyframes pulse  { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes sparks { 0%{transform:translateY(0) scale(1);opacity:.9} 100%{transform:translateY(-120px) scale(0);opacity:0} }
        @keyframes slideIn{ from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:none} }
        @keyframes card3d { 0%,100%{transform:perspective(600px) rotateY(-6deg) rotateX(2deg)} 50%{transform:perspective(600px) rotateY(6deg) rotateX(-2deg)} }
        @keyframes shimmer{ 0%{background-position:-200% center} 100%{background-position:200% center} }
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&display=swap');
      `}</style>

      {/* Deep nebula layers */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 120% 80% at 20% 30%, rgba(80,30,120,0.35) 0%, transparent 60%)', animation:'drift1 18s ease-in-out infinite' }} />
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 100% 60% at 80% 70%, rgba(20,60,120,0.3) 0%, transparent 55%)', animation:'drift2 24s ease-in-out infinite' }} />
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 90% at 50% 50%, rgba(80,40,10,0.25) 0%, transparent 50%)', animation:'drift3 30s ease-in-out infinite' }} />

      {/* Horizontal mist bands */}
      <div style={{ position:'absolute', top:'40%', left:0, right:0, height:2, background:'linear-gradient(90deg,transparent 0%,rgba(200,150,40,0.08) 30%,rgba(200,150,40,0.18) 50%,rgba(200,150,40,0.08) 70%,transparent 100%)', animation:'glow 6s ease-in-out infinite' }} />
      <div style={{ position:'absolute', top:'60%', left:0, right:0, height:1, background:'linear-gradient(90deg,transparent 0%,rgba(120,80,180,0.12) 40%,rgba(120,80,180,0.2) 50%,rgba(120,80,180,0.12) 60%,transparent 100%)', animation:'glow 9s ease-in-out infinite 3s' }} />

      {/* Star field */}
      {Array.from({length:60},(_,i)=>{
        const x=Math.random()*100, y=Math.random()*100;
        const s=Math.random()*.8+.3, d=Math.random()*8;
        const gold=Math.random()>.65;
        return <div key={i} style={{ position:'absolute', left:`${x}%`, top:`${y}%`, width:s, height:s, borderRadius:'50%', background: gold?'#E8C050':'#8090B8', opacity:.5+Math.random()*.5, animation:`glow ${3+d}s ease-in-out infinite ${d}s` }} />;
      })}

      {/* Vignette */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(2,4,10,0.85) 100%)' }} />
    </div>
  );
}

// ── Rune ornament ─────────────────────────────────────────────────────────────
function Rune({ style = {} }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={style}>
      <circle cx="24" cy="24" r="22" stroke="rgba(200,150,40,0.25)" strokeWidth="1"/>
      <circle cx="24" cy="24" r="16" stroke="rgba(200,150,40,0.15)" strokeWidth="1" strokeDasharray="3 4"/>
      <path d="M24 2 L24 46 M2 24 L46 24 M7 7 L41 41 M41 7 L7 41" stroke="rgba(200,150,40,0.08)" strokeWidth="1"/>
      <circle cx="24" cy="24" r="3" fill="rgba(200,150,40,0.4)"/>
    </svg>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'8px 0' }}>
      <div style={{ flex:1, height:1, background:'linear-gradient(to right,transparent,rgba(200,150,40,0.3))' }} />
      {label && <span style={{ color:'rgba(200,150,40,0.5)', fontSize:9, letterSpacing:'3px', textTransform:'uppercase', fontFamily:SERIF }}>{label}</span>}
      {!label && <span style={{ color:'rgba(200,150,40,0.4)', fontSize:12 }}>✦</span>}
      <div style={{ flex:1, height:1, background:'linear-gradient(to left,transparent,rgba(200,150,40,0.3))' }} />
    </div>
  );
}

// ── Input field ───────────────────────────────────────────────────────────────
function Field({ label, type='text', value, onChange, placeholder, hint, error, autoFocus, autoComplete }) {
  const [foc, setFoc] = useState(false);
  return (
    <div>
      <div style={{ fontSize:8, color:'rgba(200,150,40,0.7)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:6, fontFamily:SERIF }}>{label}</div>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        autoFocus={autoFocus} autoComplete={autoComplete}
        onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
        style={{
          width:'100%', padding:'11px 14px', boxSizing:'border-box',
          background: foc ? 'rgba(15,25,45,0.95)' : 'rgba(8,14,28,0.8)',
          border:`1px solid ${error?'rgba(220,60,60,0.6)':foc?'rgba(200,150,40,0.55)':'rgba(200,150,40,0.15)'}`,
          borderRadius:6, color:'#E8E0CC', fontSize:13, outline:'none',
          fontFamily:SANS, transition:'all .15s',
          boxShadow: foc ? `0 0 0 3px rgba(200,150,40,0.08), inset 0 1px 0 rgba(200,150,40,0.05)` : 'none',
        }}
      />
      {error && <div style={{ fontSize:8, color:'#F07070', marginTop:4 }}>{error}</div>}
      {hint && !error && <div style={{ fontSize:8, color:'rgba(200,150,40,0.4)', marginTop:4 }}>{hint}</div>}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
function Btn({ children, onClick, type='button', disabled, variant='gold', style={} }) {
  const v = {
    gold:   { c:'#E8C040', bg:'rgba(160,100,10,0.25)', bd:'rgba(200,150,40,0.45)', sh:'rgba(200,150,40,0.2)' },
    green:  { c:'#50D080', bg:'rgba(20,80,30,0.3)',    bd:'rgba(50,180,80,0.4)',   sh:'rgba(50,180,80,0.15)' },
    red:    { c:'#F07070', bg:'rgba(80,10,10,0.35)',   bd:'rgba(200,60,60,0.4)',   sh:'rgba(200,60,60,0.15)' },
    ghost:  { c:'rgba(200,150,40,0.55)', bg:'transparent', bd:'rgba(200,150,40,0.15)', sh:'none' },
  }[variant] || {};
  return (
    <button type={type} onClick={disabled?undefined:onClick} disabled={disabled} style={{
      width:'100%', padding:'12px 20px', borderRadius:7, cursor:disabled?'not-allowed':'pointer',
      background: disabled?'rgba(8,14,28,0.5)':v.bg,
      border:`1px solid ${disabled?'rgba(200,150,40,0.08)':v.bd}`,
      color: disabled?'rgba(200,150,40,0.25)':v.c,
      fontSize:12, fontWeight:700, fontFamily:SERIF, letterSpacing:'1px',
      boxShadow: disabled?'none':`0 4px 20px ${v.sh}, inset 0 1px 0 rgba(255,255,255,0.04)`,
      transition:'all .15s', userSelect:'none', ...style,
    }}>{children}</button>
  );
}

// ── Error box ─────────────────────────────────────────────────────────────────
function Err({ msg }) {
  if (!msg) return null;
  return <div style={{ padding:'9px 12px', background:'rgba(60,8,8,0.6)', border:'1px solid rgba(200,60,60,0.3)', borderLeft:'3px solid #C04040', borderRadius:6, color:'#F07070', fontSize:10 }}>{msg}</div>;
}

// ── Stat bar ──────────────────────────────────────────────────────────────────
function StatBar({ label, val, max=10, color }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
      <span style={{ width:26, fontSize:7.5, color:'rgba(200,150,40,0.5)', textAlign:'right', letterSpacing:'.5px' }}>{label}</span>
      <div style={{ flex:1, height:4, background:'rgba(0,0,0,0.4)', borderRadius:2, overflow:'hidden' }}>
        <div style={{ width:`${(val/max)*100}%`, height:'100%', background:color, borderRadius:2, boxShadow:`0 0 6px ${color}80` }} />
      </div>
      <span style={{ width:14, fontSize:8, color, fontWeight:700 }}>{val}</span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// LANDING SCREEN
// ═════════════════════════════════════════════════════════════════════════════
function CreateCharacter({ classes, onBack, onSuccess }) {
  const w = useW();
  const sm = w < 640;
  const xs = w < 420;
  const [step,    setStep]    = useState(1);
  const [klasa,   setKlasa]   = useState('');
  const [nazwa,   setNazwa]   = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [hov,     setHov]     = useState(null);

  const selCls = CLASS_DATA[klasa];
  const col    = selCls?.col || '#C8920A';

  const submit = async e => {
    e.preventDefault();
    if (!klasa) { setError('Wybierz klasę postaci'); return; }
    if (!nazwa.trim()) { setError('Podaj imię bohatera'); return; }
    setError(''); setLoading(true);
    try {
      const r = await apiFetch('POST','/auth/create-character',{nazwa:nazwa.trim(),profesja:klasa});
      r.ok ? onSuccess() : setError(r.error||'Błąd tworzenia postaci');
    } finally { setLoading(false); }
  };

  const cls = classes.find(c=>c.name===klasa);

  return (
    <div className="vh-min" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:`calc(${sm?16:24}px + var(--safe-t)) ${sm?12:20}px calc(${sm?16:24}px + var(--safe-b))`, position:'relative', zIndex:1 }}>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:sm?16:24 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:'rgba(200,150,40,0.45)', cursor:'pointer', fontSize:10, fontFamily:SERIF, marginBottom:10 }}>← Powrót</button>
        <div style={{ fontSize:7.5, letterSpacing:'5px', color:'rgba(200,150,40,0.5)', textTransform:'uppercase', marginBottom:6, fontFamily:SERIF }}>◈ Nowa Postać ◈</div>
        <h2 style={{ margin:0, color:'#F0D870', fontSize:sm?20:26, fontFamily:SERIF, fontWeight:700, letterSpacing:sm?2:3 }}>Stwórz Bohatera</h2>
      </div>

      {/* Step indicator */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:sm?20:28 }}>
        {[{n:1,l:'Klasa',i:'⚔'},{n:2,l:'Imię',i:'📜'}].map(({n,l,i})=>(
          <div key={n} style={{ display:'flex', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, background:step>=n?'rgba(140,90,10,0.3)':'rgba(8,14,28,0.8)', border:`1px solid ${step>=n?'rgba(200,150,40,0.5)':'rgba(200,150,40,0.1)'}`, boxShadow:step>=n?'0 0 14px rgba(200,150,40,0.2)':'none', transition:'all .25s', flexShrink:0 }}>{step>n?'✓':i}</div>
              <span style={{ fontSize:sm?9:10, color:step===n?'#C8920A':'rgba(200,150,40,0.3)', fontFamily:SERIF }}>{l}</span>
            </div>
            {n<2 && <div style={{ width:24, height:1, background:'rgba(200,150,40,0.12)', margin:'0 6px' }} />}
          </div>
        ))}
      </div>

      {/* Step 1: class selection */}
      {step===1 && (
        <div style={{ width:'100%', maxWidth:sm?480:860 }}>
          <div style={{ display:'grid', gridTemplateColumns:xs?'repeat(2,1fr)':sm?'repeat(3,1fr)':'repeat(auto-fill,minmax(190px,1fr))', gap:xs?8:10, marginBottom:16 }}>
            {classes.map(c=>{
              const d = CLASS_DATA[c.name]||{};
              const sel = klasa===c.name;
              const h   = hov===c.name;
              const active = sel||h;
              return (
                <button key={c.name} onClick={()=>setKlasa(c.name)} onMouseEnter={()=>setHov(c.name)} onMouseLeave={()=>setHov(null)}
                  style={{
                    borderRadius:10, padding:xs?'14px 8px':'18px 12px', cursor:'pointer', textAlign:'center',
                    background: sel ? `linear-gradient(170deg,${d.col}1C,rgba(8,14,28,0.97))` : h ? 'rgba(10,16,30,0.9)' : 'rgba(6,10,20,0.75)',
                    border:`${sel?2:1}px solid ${sel?d.col+'60':h?d.col+'25':'rgba(200,150,40,0.1)'}`,
                    boxShadow: sel ? `0 0 24px ${d.col}20, 0 8px 28px rgba(0,0,0,0.6)` : 'none',
                    transform: active ? 'translateY(-3px)' : 'none',
                    transition:'all .18s', backdropFilter:'blur(10px)', position:'relative', overflow:'hidden',
                  }}>
                  {sel && <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${d.col},transparent)` }} />}
                  <div style={{ fontSize:xs?22:26, marginBottom:6, filter:active?`drop-shadow(0 0 10px ${d.col})`:'none', transition:'filter .2s' }}>{d.icon||'⚔'}</div>
                  {c.obrazek && !xs && <div style={{ width:28, height:42, backgroundImage:`url(/assets/${c.obrazek})`, backgroundPosition:'0 0', backgroundRepeat:'no-repeat', imageRendering:'pixelated', margin:'0 auto 8px', filter:sel?`drop-shadow(0 0 7px ${d.col}90)`:'none' }} />}
                  <div style={{ color:sel?d.col:h?'rgba(200,180,130,0.9)':'rgba(160,140,100,0.7)', fontWeight:700, fontSize:xs?10:12, marginBottom:5, fontFamily:SERIF }}>{c.name}</div>
                  {!xs && <div style={{ fontSize:7.5, color:'rgba(150,130,90,0.6)', lineHeight:1.5, marginBottom:8, minHeight:xs?0:24 }}>{d.lore}</div>}
                  <StatBar label="STR" val={c.sila||d.sila||0}       color="#E05050" />
                  <StatBar label="DEX" val={c.zrecznosc||d.zrecznosc||0} color="#50C060" />
                  <StatBar label="INT" val={c.intelekt||d.intelekt||0}   color="#9070F0" />
                  {sel && <div style={{ marginTop:8, color:d.col, fontSize:8, fontWeight:700, fontFamily:SERIF }}>✓ Wybrano</div>}
                </button>
              );
            })}
          </div>
          <Err msg={error} />
          <div style={{ display:'flex', gap:8, maxWidth:480, margin:'0 auto' }}>
            <Btn onClick={onBack} variant="ghost" style={{ width:'auto', padding:'11px 20px', flex:'0 0 auto' }}>← Wróć</Btn>
            <Btn onClick={()=>{if(!klasa){setError('Wybierz klasę');return;}setError('');setStep(2);}} variant="gold">Dalej →</Btn>
          </div>
        </div>
      )}

      {/* Step 2: name */}
      {step===2 && (
        <div style={{ width:'100%', maxWidth:sm?'100%':480 }}>
          <div style={{ borderRadius:12, overflow:'hidden', background:'linear-gradient(170deg,rgba(10,16,30,0.97),rgba(6,10,20,0.98))', border:`1px solid ${col}30`, boxShadow:`0 0 30px ${col}12, 0 20px 50px rgba(0,0,0,0.7)` }}>
            <div style={{ height:3, background:`linear-gradient(90deg,transparent,${col},transparent)` }} />
            <div style={{ padding:sm?'20px 18px 24px':'28px 32px' }}>

              {selCls && cls && (
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, padding:'12px 14px', borderRadius:10, background:`linear-gradient(135deg,${col}10,rgba(8,14,28,0.8))`, border:`1px solid ${col}28` }}>
                  <div style={{ fontSize:24, filter:`drop-shadow(0 0 7px ${col}60)` }}>{selCls.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:col, fontWeight:700, fontSize:14, fontFamily:SERIF }}>{klasa}</div>
                    {!xs && <div style={{ color:'rgba(150,130,90,0.6)', fontSize:8, marginTop:2 }}>{selCls.lore}</div>}
                  </div>
                  <button onClick={()=>setStep(1)} style={{ padding:'5px 10px', background:'rgba(8,14,28,0.8)', border:`1px solid ${col}20`, borderRadius:6, cursor:'pointer', color:'rgba(200,150,40,0.5)', fontSize:9, fontFamily:SERIF, flexShrink:0 }}>← Zmień</button>
                </div>
              )}

              <div style={{ marginBottom:16 }}>
                <h3 style={{ margin:'0 0 3px', color:'#F0D870', fontSize:sm?14:16, fontFamily:SERIF }}>Nadaj imię bohaterowi</h3>
                <p style={{ margin:0, color:'rgba(200,150,40,0.35)', fontSize:9, fontStyle:'italic', fontFamily:SERIF }}>Widoczne publicznie · 3–24 znaki</p>
              </div>

              <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:13 }}>
                <Field label="Imię postaci" value={nazwa} onChange={e=>setNazwa(e.target.value)} placeholder="np. Gwendolin, Thorvald…" hint={nazwa.trim().length>0?`${nazwa.trim().length}/24 znaków`:''} autoFocus />
                <Err msg={error} />
                <div style={{ display:'flex', gap:8 }}>
                  <Btn onClick={()=>setStep(1)} variant="ghost" style={{ flex:'0 0 auto', width:'auto', padding:'11px 18px' }}>← Wróć</Btn>
                  <Btn type="submit" disabled={loading} variant="gold">{loading?'Tworzenie…':'⚔ Utwórz'}</Btn>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ═════════════════════════════════════════════════════════════════════════════
export default function Login({ onLogin }) {
  const [screen,  setScreen]  = useState('landing'); // landing | auth | charselect | create
  const [authMode, setAuthMode] = useState('login');
  const [stats,   setStats]   = useState(null);
  const [classes, setClasses] = useState([]);
  const [chars,   setChars]   = useState([]);
  const [me,      setMe]      = useState(null);
  const [mapNames, setMapNames] = useState({});
  const [selErr,  setSelErr]  = useState('');
  const [selLoad, setSelLoad] = useState(false);

  const refreshChars = useCallback(async () => {
    const [list, who] = await Promise.all([
      apiFetch('GET', '/auth/my-characters'),
      apiFetch('GET', '/auth/me'),
    ]);
    if (Array.isArray(list)) setChars(list);
    if (who && !who.error) setMe(who);
  }, []);

  useEffect(() => {
    apiFetch('GET', '/auth/stats').then(s => s && !s.error && setStats(s)).catch(() => {});
    apiFetch('GET', '/auth/classes').then(c => Array.isArray(c) && setClasses(c)).catch(() => {});
    apiFetch('GET', '/game/map-list').then(m => {
      if (Array.isArray(m)) setMapNames(Object.fromEntries(m.map(x => [x.id, x.nazwa])));
    }).catch(() => {});
    // Sesja mogła przetrwać (rememberMe) — wtedy od razu wybór postaci
    apiFetch('GET', '/auth/me').then(who => {
      if (who && !who.error) { setMe(who); refreshChars(); setScreen('charselect'); }
    }).catch(() => {});
  }, [refreshChars]);

  const afterAuth = async () => {
    await refreshChars();
    setScreen('charselect');
  };

  const enterGame = async (charId) => {
    if (!charId) return;
    setSelErr(''); setSelLoad(true);
    try {
      const r = await apiFetch('POST', '/auth/select-character', { postacId: charId });
      r.ok ? onLogin() : setSelErr(r.error || 'Nie udało się wejść do gry');
    } finally { setSelLoad(false); }
  };

  const deleteChar = async (charId) => {
    const r = await apiFetch('POST', '/auth/delete-character', { postacId: charId, confirm: 'USUŃ' });
    if (r?.error) setSelErr(r.error);
    await refreshChars();
  };

  if (screen === 'auth') return (
    <AuthScreen
      mode={authMode} stats={stats} apiFetch={apiFetch}
      onBack={() => setScreen('landing')}
      onDone={afterAuth}
    />
  );

  if (screen === 'admin') return (
    <Suspense fallback={<div style={{ padding: 30, color: '#e7c158', fontFamily: 'serif' }}>Wczytywanie panelu…</div>}>
      <AdminDashboard
        onEnterGame={() => setScreen('charselect')}
        onLogout={async () => {
          await apiFetch('POST', '/auth/logout');
          setChars([]); setMe(null); setScreen('landing');
        }}
      />
    </Suspense>
  );

  if (screen === 'charselect') return (
    <CharacterSelect
      chars={chars} me={me} stats={stats} mapNames={mapNames}
      onEnterGame={enterGame}
      onCreate={() => setScreen('create')}
      onDelete={deleteChar}
      onHome={() => setScreen('landing')}
      onAdmin={() => setScreen('admin')}
      onLogout={async () => {
        await apiFetch('POST', '/auth/logout');
        setChars([]); setMe(null); setScreen('landing');
      }}
      loading={selLoad} error={selErr}
    />
  );

  if (screen === 'create') return (
    <>
      <Background />
      <CreateCharacter
        classes={classes}
        onBack={() => setScreen('charselect')}
        onSuccess={async () => { await refreshChars(); setScreen('charselect'); }}
      />
    </>
  );

  return (
    <Landing
      stats={stats} classes={classes}
      onPlay={() => { setAuthMode(me ? 'login' : 'register'); setScreen(me ? 'charselect' : 'auth'); }}
      onLogin={() => { setAuthMode('login'); setScreen(me ? 'charselect' : 'auth'); }}
      onSection={() => { setAuthMode('register'); setScreen('auth'); }}
    />
  );
}
