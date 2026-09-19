import { useState, useEffect, useRef, useCallback } from 'react';

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
function LandingScreen({ stats, classes, onDirectLogin, onDirectRegister }) {
  const w = useW();
  const sm = w < 640;
  const xs = w < 400;
  const [mode, setMode]   = useState('home');  // home | login | register
  const [hover, setHover] = useState(null);

  // Login
  const [lLogin,  setLLogin]  = useState('');
  const [lPass,   setLPass]   = useState('');
  const [lRemem,  setLRemem]  = useState(false);
  const [lErr,    setLErr]    = useState('');
  const [lLoad,   setLLoad]   = useState(false);

  // Register
  const [rLogin,  setRLogin]  = useState('');
  const [rPass,   setRPass]   = useState('');
  const [rPass2,  setRPass2]  = useState('');
  const [rErr,    setRErr]    = useState('');
  const [rLoad,   setRLoad]   = useState(false);

  const passMismatch = rPass2 && rPass !== rPass2;

  const doLogin = async e => {
    e.preventDefault(); setLErr(''); setLLoad(true);
    try {
      const r = await apiFetch('POST','/auth/login',{login:lLogin.trim(),haslo:lPass,rememberMe:lRemem});
      r.ok ? onDirectLogin(r.isAdmin) : setLErr(r.error||'Błąd logowania');
    } finally { setLLoad(false); }
  };

  const doRegister = async e => {
    e.preventDefault(); setRErr(''); setRLoad(true);
    try {
      const r = await apiFetch('POST','/auth/register',{login:rLogin.trim(),haslo:rPass,powtorzHaslo:rPass2});
      r.ok ? onDirectRegister() : setRErr(r.error||'Błąd rejestracji');
    } finally { setRLoad(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', position:'relative', zIndex:1 }}>

      {/* ── Top bar ── */}
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, height:sm?48:44, display:'flex', alignItems:'center', justifyContent:'space-between', padding:`0 ${sm?14:24}px`, background:'rgba(4,8,15,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(200,150,40,0.12)' }}>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <span style={{ color:'rgba(200,150,40,0.85)', fontSize:sm?12:13, fontFamily:SERIF, fontWeight:700, letterSpacing:sm?2:3 }}>VELDORIA</span>
          {!sm && <><span style={{ color:'rgba(200,150,40,0.2)', fontSize:10 }}>◈</span><span style={{ color:'rgba(200,150,40,0.4)', fontSize:9, letterSpacing:1 }}>Online RPG</span></>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:sm?10:20 }}>
          {stats && !xs && (
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:9 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:stats.online>0?'#40D060':'#404060', boxShadow:stats.online>0?'0 0 6px #40D060':'none', display:'inline-block' }} />
              <span style={{ color:stats.online>0?'#40D060':'rgba(200,150,40,0.4)' }}>{stats.online||0} online</span>
            </div>
          )}
          <div style={{ display:'flex', gap:sm?6:8 }}>
            <button onClick={()=>setMode('login')} style={{ padding:sm?'7px 14px':'6px 18px', background:'transparent', border:'1px solid rgba(200,150,40,0.3)', borderRadius:5, color:'rgba(200,150,40,0.8)', fontSize:sm?11:10, fontFamily:SERIF, cursor:'pointer' }}>
              Zaloguj
            </button>
            <button onClick={()=>setMode('register')} style={{ padding:sm?'7px 14px':'6px 18px', background:'rgba(160,100,10,0.25)', border:'1px solid rgba(200,150,40,0.45)', borderRadius:5, color:'#E8C040', fontSize:sm?11:10, fontFamily:SERIF, cursor:'pointer' }}>
              {xs ? 'Rejestracja' : 'Zarejestruj'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:`${sm?56:72}px ${sm?16:20}px ${sm?40:60}px`, minHeight:'100vh' }}>
        <div style={{ animation:'fadeUp .8s ease both' }}>
          <Rune style={{ opacity:.5, marginBottom:sm?10:16 }} />
          <div style={{ fontSize:sm?8:10, letterSpacing:sm?'4px':'8px', color:'rgba(200,150,40,0.55)', textTransform:'uppercase', marginBottom:sm?8:12, fontFamily:SERIF }}>
            ◈ Klasyczne RPG Online ◈
          </div>
          <h1 style={{
            margin:'0 0 8px',
            fontSize:`clamp(${xs?36:44}px,${sm?14:9}vw,110px)`,
            fontWeight:900, letterSpacing:`clamp(${xs?6:10}px,${sm?2:2.5}vw,28px)`,
            fontFamily:SERIF, lineHeight:1,
            background:'linear-gradient(135deg, #6A4010 0%, #C89030 25%, #F0D060 45%, #E8C040 55%, #B07020 75%, #7A5020 100%)',
            backgroundClip:'text', WebkitBackgroundClip:'text', color:'transparent',
            backgroundSize:'200% auto', animation:'shimmer 4s linear infinite',
          }}>VELDORIA</h1>
          <p style={{ margin:`0 0 ${sm?20:32}px`, color:'rgba(180,160,120,0.7)', fontSize:sm?11:14, letterSpacing:'1.5px', fontFamily:SERIF, fontStyle:'italic' }}>
            Odkryj świat pełen magii, niebezpieczeństw i chwały
          </p>

          {/* Feature badges */}
          <div style={{ display:'flex', gap:6, justifyContent:'center', flexWrap:'wrap', marginBottom:sm?28:48 }}>
            {([['⚔','Walka'],['🗺','Świat'],['✨','6 klas'],['👥','Gildie'],['🏰','Dungeony'],['🎣','Wędka']]
              .filter((_,i) => xs ? i<3 : true))
              .map(([icon,label])=>(
                <span key={label} style={{ padding:`${sm?4:5}px ${sm?10:14}px`, borderRadius:20, fontSize:sm?10:9, fontFamily:SANS, background:'rgba(15,22,40,0.8)', border:'1px solid rgba(200,150,40,0.18)', color:'rgba(180,155,100,0.85)', backdropFilter:'blur(10px)' }}>
                  {icon} {label}
                </span>
              ))
            }
          </div>

          {/* CTA buttons */}
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexDirection:sm?'column':'row', alignItems:'center', width:sm?'100%':'auto', maxWidth:sm?320:'none' }}>
            <button onClick={()=>setMode('register')} style={{
              padding:sm?'13px 0':'14px 40px', borderRadius:8, cursor:'pointer', width:sm?'100%':'auto',
              background:'linear-gradient(135deg,rgba(140,90,10,0.8),rgba(180,120,20,0.6))',
              border:'1px solid rgba(220,170,50,0.5)', color:'#F0D060',
              fontSize:sm?13:14, fontWeight:700, fontFamily:SERIF, letterSpacing:'1.5px',
              boxShadow:'0 8px 32px rgba(180,130,20,0.25)',
            }}>⚔ Zacznij Przygodę</button>
            <button onClick={()=>setMode('login')} style={{
              padding:sm?'13px 0':'14px 40px', borderRadius:8, cursor:'pointer', width:sm?'100%':'auto',
              background:'rgba(8,14,28,0.7)', border:'1px solid rgba(200,150,40,0.25)',
              color:'rgba(200,150,40,0.8)', fontSize:sm?13:14, fontFamily:SERIF, letterSpacing:'1.5px',
              backdropFilter:'blur(10px)',
            }}>Zaloguj się</button>
          </div>
        </div>
      </div>

      {/* ── Class showcase ── */}
      {!xs && (
        <div style={{ padding:`0 ${sm?12:20}px 60px`, zIndex:1 }}>
          <Divider label="Wybierz ścieżkę" />
          <div style={{ maxWidth:900, margin:'16px auto 0', display:'grid', gridTemplateColumns:`repeat(auto-fill,minmax(${sm?100:130}px,1fr))`, gap:8 }}>
            {Object.entries(CLASS_DATA).map(([name,{icon,col,sila,zrecznosc,intelekt,lore}])=>{
              const hov = hover===name;
              return (
                <div key={name} onMouseEnter={()=>setHover(name)} onMouseLeave={()=>setHover(null)}
                  onClick={()=>setHover(hov?null:name)}
                  style={{
                    padding:'14px 10px', borderRadius:10, textAlign:'center', cursor:'default',
                    background: hov ? `linear-gradient(170deg,${col}18,rgba(8,14,28,0.95))` : 'rgba(8,14,28,0.7)',
                    border:`1px solid ${hov?col+'50':'rgba(200,150,40,0.1)'}`,
                    boxShadow: hov ? `0 8px 24px rgba(0,0,0,0.6), 0 0 16px ${col}18` : 'none',
                    transform: hov ? 'translateY(-4px)' : 'none',
                    transition:'all .2s', backdropFilter:'blur(10px)',
                  }}>
                  <div style={{ fontSize:22, marginBottom:5, filter:hov?`drop-shadow(0 0 8px ${col})`:'none' }}>{icon}</div>
                  <div style={{ color: hov?col:'rgba(180,155,100,0.7)', fontWeight:700, fontSize:10, fontFamily:SERIF, marginBottom:hov?5:0 }}>{name}</div>
                  {hov && !sm && <>
                    <div style={{ fontSize:7.5, color:'rgba(160,140,100,0.65)', lineHeight:1.5, marginBottom:7 }}>{lore}</div>
                    <StatBar label="STR" val={sila}      color="#E05050" />
                    <StatBar label="DEX" val={zrecznosc} color="#50C060" />
                    <StatBar label="INT" val={intelekt}  color="#9070F0" />
                  </>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Login/Register modal ── */}
      {(mode==='login'||mode==='register') && (
        <div onClick={e=>e.target===e.currentTarget&&setMode('home')}
          style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(2,5,12,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:sm?'flex-end':'center', justifyContent:'center', padding:sm?0:16 }}>
          <div style={{
            width:'100%', maxWidth:sm?'100%':440,
            borderRadius:sm?'16px 16px 0 0':14, overflow:'hidden',
            background:'linear-gradient(170deg,rgba(12,18,36,0.99),rgba(6,10,22,0.99))',
            border:`1px solid rgba(200,150,40,0.22)`,
            boxShadow:'0 -8px 40px rgba(0,0,0,0.8)',
            animation:'fadeUp .25s ease both',
            maxHeight:sm?'90vh':'auto', overflowY:sm?'auto':'visible',
          }}>
            <div style={{ height:3, background: mode==='login' ? 'linear-gradient(90deg,transparent,#C8920A,transparent)' : 'linear-gradient(90deg,transparent,#20A040,transparent)' }} />
            {/* Drag handle on mobile */}
            {sm && <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 4px' }}><div style={{ width:36, height:4, borderRadius:2, background:'rgba(200,150,40,0.3)' }} /></div>}

            <div style={{ padding:sm?'16px 20px 28px':'28px 32px 32px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div>
                  <div style={{ color:'#E8D080', fontWeight:700, fontSize:sm?16:18, fontFamily:SERIF }}>
                    {mode==='login' ? '⚔ Powrót do Veldorii' : '🌿 Dołącz do Veldorii'}
                  </div>
                  <div style={{ color:'rgba(200,150,40,0.45)', fontSize:9, marginTop:2 }}>
                    {mode==='login' ? 'Zaloguj się na swoje konto' : 'Utwórz konto za darmo'}
                  </div>
                </div>
                <button onClick={()=>setMode('home')} style={{ background:'none', border:'none', color:'rgba(200,150,40,0.4)', cursor:'pointer', fontSize:22, lineHeight:1, padding:6 }}>✕</button>
              </div>

              <div style={{ display:'flex', background:'rgba(4,8,20,0.6)', borderRadius:7, padding:3, marginBottom:18 }}>
                {[['login','⚔ Logowanie'],['register','🌿 Rejestracja']].map(([k,l])=>(
                  <button key={k} onClick={()=>setMode(k)} style={{
                    flex:1, padding:'9px 4px', borderRadius:5, cursor:'pointer',
                    background: mode===k ? 'rgba(200,150,40,0.18)' : 'transparent',
                    border:`1px solid ${mode===k?'rgba(200,150,40,0.38)':'transparent'}`,
                    color: mode===k ? '#E8C040' : 'rgba(200,150,40,0.4)',
                    fontSize:sm?11:10, fontWeight:700, fontFamily:SERIF, transition:'all .15s',
                  }}>{l}</button>
                ))}
              </div>

              {mode==='login' && (
                <form onSubmit={doLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <Field label="Login" value={lLogin} onChange={e=>setLLogin(e.target.value)} placeholder="Twój login" autoComplete="username" autoFocus />
                  <Field label="Hasło" type="password" value={lPass} onChange={e=>setLPass(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
                  <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' }}>
                    <div onClick={()=>setLRemem(m=>!m)} style={{ width:18, height:18, borderRadius:3, flexShrink:0, background:lRemem?'rgba(200,150,40,0.2)':'rgba(8,14,28,0.8)', border:`1px solid ${lRemem?'rgba(200,150,40,0.5)':'rgba(200,150,40,0.15)'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {lRemem && <span style={{ color:'#E8C040', fontSize:11 }}>✓</span>}
                    </div>
                    <span style={{ fontSize:10, color:'rgba(200,150,40,0.45)' }}>Pamiętaj mnie 30 dni</span>
                  </label>
                  <Err msg={lErr} />
                  <Btn type="submit" disabled={lLoad} variant="gold" style={{ padding:'13px' }}>{lLoad?'Logowanie…':'⚔ Wejdź do Veldorii'}</Btn>
                  <div style={{ textAlign:'center', fontSize:10, color:'rgba(200,150,40,0.3)' }}>
                    Brak konta?{' '}
                    <button type="button" onClick={()=>setMode('register')} style={{ background:'none', border:'none', color:'#50C070', cursor:'pointer', fontSize:10, textDecoration:'underline', fontFamily:SERIF }}>Zarejestruj się</button>
                  </div>
                </form>
              )}

              {mode==='register' && (
                <form onSubmit={doRegister} style={{ display:'flex', flexDirection:'column', gap:13 }}>
                  <Field label="Login" value={rLogin} onChange={e=>setRLogin(e.target.value)} placeholder="3–24 znaków" autoComplete="username" autoFocus hint={rLogin.trim().length>0?`${rLogin.trim().length}/24`:''} />
                  <Field label="Hasło" type="password" value={rPass} onChange={e=>setRPass(e.target.value)} placeholder="Minimum 4 znaki" autoComplete="new-password" />
                  <Field label="Powtórz hasło" type="password" value={rPass2} onChange={e=>setRPass2(e.target.value)} placeholder="••••••••" autoComplete="new-password" error={passMismatch?'Hasła się nie zgadzają':null} hint={rPass2&&!passMismatch?'✓ Hasła pasują':null} />
                  <Err msg={rErr} />
                  <Btn type="submit" disabled={rLoad||!!passMismatch} variant="green" style={{ padding:'13px' }}>{rLoad?'Tworzenie konta…':'🌿 Utwórz konto'}</Btn>
                  <div style={{ textAlign:'center', fontSize:10, color:'rgba(200,150,40,0.3)' }}>
                    Masz już konto?{' '}
                    <button type="button" onClick={()=>setMode('login')} style={{ background:'none', border:'none', color:'#E8C040', cursor:'pointer', fontSize:10, textDecoration:'underline', fontFamily:SERIF }}>Zaloguj się</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CHARACTER SLOT
// ═════════════════════════════════════════════════════════════════════════════
function CharSlot({ char, selected, onSelect, onCreate, onDelete, compact }) {
  const [hov, setHov]     = useState(false);
  const [del, setDel]     = useState(false);
  const minH = compact ? 200 : 300;

  const fmt = n => { n=Number(n)||0; return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(n); };

  if (!char) return (
    <button onClick={onCreate} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        minHeight:minH, borderRadius:12, cursor:'pointer',
        background: hov?'rgba(12,20,38,0.9)':'rgba(6,12,24,0.6)',
        border:`2px dashed rgba(200,150,40,${hov?.3:.12})`,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:compact?8:12,
        transition:'all .2s', transform:hov?'translateY(-3px)':'none',
        backdropFilter:'blur(10px)', padding:'12px 8px',
      }}>
      <div style={{ width:compact?44:60, height:compact?44:60, borderRadius:'50%', border:`2px dashed rgba(200,150,40,${hov?.45:.2})`, display:'flex', alignItems:'center', justifyContent:'center', background:hov?'rgba(200,150,40,0.08)':'transparent', transition:'all .2s' }}>
        <span style={{ fontSize:compact?22:30, color:`rgba(200,150,40,${hov?.7:.3})`, lineHeight:1 }}>+</span>
      </div>
      <div style={{ color:`rgba(200,150,40,${hov?.75:.4})`, fontSize:compact?11:14, fontFamily:SERIF }}>Nowa Postać</div>
    </button>
  );

  const cls    = CLASS_DATA[char.profesja] || { col:'#C8920A', icon:'⚔' };
  const hpPct  = char.zycie_max>0 ? Math.min(100,(char.zycie/char.zycie_max)*100) : 0;
  const hpCol  = hpPct>50?'#40C060':hpPct>25?'#E0A030':'#E04040';
  const lvl    = char.poziom;
  const e1     = lvl>1 ? Math.pow(lvl-1,4)+10 : 0;
  const e2     = Math.pow(lvl,4)+10;
  const xpPct  = (e2-e1)>0 ? Math.min(100,((char.exp-e1)/(e2-e1))*100) : 0;
  const active = selected || hov;
  const hH     = compact ? 56 : 72;

  return (
    <div style={{ position:'relative' }} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <button onClick={()=>onSelect(char.id)} style={{
        position:'relative', width:'100%', minHeight:minH, borderRadius:12,
        cursor:'pointer', padding:0, overflow:'hidden', display:'block',
        background: selected ? `linear-gradient(170deg, ${cls.col}22, rgba(6,12,24,0.98))` : `linear-gradient(170deg, rgba(10,16,30,0.95), rgba(6,12,24,0.98))`,
        border:`${selected?2:1}px solid ${selected?cls.col+'80':hov?cls.col+'30':'rgba(200,150,40,0.12)'}`,
        boxShadow: selected ? `0 0 40px ${cls.col}28, 0 16px 40px rgba(0,0,0,0.7)` : hov ? `0 10px 32px rgba(0,0,0,0.6)` : 'none',
        transition:'all .22s', transform:active?`translateY(${compact?-2:-4}px)`:'none',
        backdropFilter:'blur(12px)',
      }}>
        {/* Header */}
        <div style={{ height:hH, background:`linear-gradient(180deg, ${cls.col}28 0%, transparent 100%)`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          <div style={{ fontSize:compact?24:34, filter:active?`drop-shadow(0 0 14px ${cls.col})`:'none', transition:'filter .2s' }}>{cls.icon}</div>
          {selected && <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 50% 0%, ${cls.col}18, transparent 70%)` }} />}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${cls.col}60,transparent)` }} />
        </div>

        <div style={{ padding:compact?'10px 12px 12px':'14px 16px 16px' }}>
          {char.prestige>0 && (
            <div style={{ position:'absolute', top:8, left:8, padding:'1px 7px', borderRadius:8, background:'rgba(200,146,42,0.15)', border:'1px solid rgba(200,146,42,0.4)' }}>
              <span style={{ color:'#E8B848', fontSize:7, fontWeight:700 }}>✦ P{char.prestige}</span>
            </div>
          )}

          {/* Avatar */}
          {!compact && (
            <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
              <div style={{ width:52, height:72, backgroundImage:`url(/assets/${char.obrazek})`, backgroundPosition:'0 0', backgroundRepeat:'no-repeat', imageRendering:'pixelated', transform:'scale(1.4)', transformOrigin:'bottom center', filter:active?`drop-shadow(0 0 10px ${cls.col}90)`:'none', transition:'filter .2s' }} />
            </div>
          )}

          {/* Name */}
          <div style={{ textAlign:'center', marginBottom:compact?6:8 }}>
            <div style={{ color:selected?'#F0D870':hov?'#E8D070':'#C0B090', fontWeight:700, fontSize:compact?13:15, fontFamily:SERIF, letterSpacing:compact?0:1, marginBottom:3 }}>{char.nazwa}</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, justifyContent:'center', flexWrap:'wrap' }}>
              <span style={{ padding:'2px 7px', borderRadius:8, background:`${cls.col}22`, border:`1px solid ${cls.col}40`, color:cls.col, fontSize:8, fontWeight:700 }}>{char.profesja}</span>
              <span style={{ color:'#F0C840', fontSize:compact?10:11, fontWeight:700 }}>Lv.{char.poziom}</span>
            </div>
          </div>

          {!compact && <div style={{ textAlign:'center', color:'#D0A830', fontSize:9, marginBottom:8 }}>🪙 {fmt(char.zloto)}g</div>}

          {/* HP bar */}
          <div style={{ marginBottom:4 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
              <span style={{ fontSize:7, color:'rgba(200,150,40,0.4)' }}>❤ HP</span>
              <span style={{ fontSize:7, color:hpCol }}>{char.zycie}/{char.zycie_max}</span>
            </div>
            <div style={{ height:5, background:'rgba(0,0,0,0.5)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ width:`${hpPct}%`, height:'100%', background:`linear-gradient(90deg,${hpCol}99,${hpCol})`, borderRadius:3 }} />
            </div>
          </div>

          {/* EXP bar */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
              <span style={{ fontSize:7, color:'rgba(200,150,40,0.4)' }}>✦ EXP</span>
              <span style={{ fontSize:7, color:'#50D080' }}>{Math.round(xpPct)}%</span>
            </div>
            <div style={{ height:3, background:'rgba(0,0,0,0.5)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ width:`${xpPct}%`, height:'100%', background:'linear-gradient(90deg,#1A5020,#40C060)', borderRadius:2 }} />
            </div>
          </div>
        </div>
      </button>

      {!del
        ? <button onClick={e=>{e.stopPropagation();setDel(true)}} style={{ position:'absolute', bottom:10, right:10, background:'none', border:'none', color:'rgba(200,80,80,0.35)', cursor:'pointer', fontSize:13, opacity:hov?1:0, transition:'opacity .2s', padding:4 }} title="Usuń">🗑</button>
        : <div style={{ position:'absolute', inset:0, background:'rgba(4,6,16,0.96)', borderRadius:12, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10 }}>
            <div style={{ color:'#F07070', fontSize:11, textAlign:'center', fontFamily:SERIF, padding:'0 12px' }}>Usunąć <b>{char.nazwa}</b>?</div>
            <div style={{ color:'rgba(200,150,40,0.4)', fontSize:9 }}>Nie można cofnąć.</div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>onDelete(char.id)} style={{ padding:'6px 16px', background:'rgba(60,8,8,0.8)', color:'#F07070', border:'1px solid rgba(200,60,60,0.4)', borderRadius:6, cursor:'pointer', fontSize:10, fontFamily:SERIF }}>Usuń</button>
              <button onClick={()=>setDel(false)} style={{ padding:'6px 16px', background:'rgba(8,14,28,0.8)', color:'rgba(200,150,40,0.6)', border:'1px solid rgba(200,150,40,0.2)', borderRadius:6, cursor:'pointer', fontSize:10, fontFamily:SERIF }}>Anuluj</button>
            </div>
          </div>
      }
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CHARACTER SELECT SCREEN
// ═════════════════════════════════════════════════════════════════════════════
function CharacterSelect({ chars, onEnterGame, onCreate, onDelete, onLogout, isAdmin, onAdminPanel, loading, error }) {
  const w = useW();
  const sm = w < 640;
  const xs = w < 420;
  const [sel, setSel] = useState(null);
  const chosen = chars.find(c=>c.id===sel);
  const cls    = chosen ? (CLASS_DATA[chosen.profesja]||{col:'#C8920A'}) : null;
  const slots  = [chars[0]||null, chars[1]||null, chars[2]||null];
  // On phones: 3 compact cards in a row; tablets+: normal grid
  const compact = xs;

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:`${sm?20:28}px ${sm?12:20}px`, position:'relative', zIndex:1 }}>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:sm?20:28, animation:'fadeUp .5s ease both' }}>
        {!sm && <Rune style={{ opacity:.35, marginBottom:10 }} />}
        <div style={{ fontSize:sm?7:8, letterSpacing:sm?'4px':'6px', color:'rgba(200,150,40,0.5)', textTransform:'uppercase', marginBottom:6, fontFamily:SERIF }}>◈ Wybierz bohatera ◈</div>
        <h2 style={{ margin:'0 0 5px', color:'#F0D870', fontSize:sm?22:30, fontFamily:SERIF, fontWeight:700, letterSpacing:sm?2:4 }}>Twoje Postacie</h2>
        <p style={{ margin:0, color:'rgba(200,150,40,0.35)', fontSize:9, fontStyle:'italic', fontFamily:SERIF }}>{chars.length}/3 miejsc</p>
      </div>

      {/* Slot grid */}
      <div style={{
        width:'100%', maxWidth:sm?480:900,
        display:'grid',
        gridTemplateColumns: compact
          ? 'repeat(3,1fr)'
          : sm ? 'repeat(auto-fill,minmax(180px,1fr))' : 'repeat(auto-fill,minmax(240px,1fr))',
        gap: compact ? 8 : sm ? 10 : 16,
        marginBottom: sm ? 16 : 24,
        animation:'fadeUp .6s ease .1s both',
      }}>
        {slots.map((char,i)=>(
          <CharSlot key={i} char={char} selected={sel===char?.id} onSelect={setSel} onCreate={onCreate} onDelete={onDelete} compact={compact} />
        ))}
      </div>

      {error && <div style={{ marginBottom:12, width:'100%', maxWidth:sm?480:900 }}><Err msg={error} /></div>}

      {/* Action strip */}
      <div style={{ width:'100%', maxWidth:sm?480:540, display:'flex', flexDirection:'column', gap:sm?8:10, animation:'fadeUp .7s ease .2s both' }}>
        {/* Enter button */}
        <button onClick={()=>onEnterGame(sel)} disabled={!sel||loading} style={{
          padding:sm?'13px':'15px', borderRadius:9, cursor:(!sel||loading)?'not-allowed':'pointer',
          background: (!sel||loading)
            ? 'rgba(8,14,28,0.5)'
            : cls ? `linear-gradient(135deg,${cls.col}30,rgba(8,14,28,0.9))` : 'rgba(140,90,10,0.3)',
          border:`1px solid ${(!sel||loading)?'rgba(200,150,40,0.08)':cls?cls.col+'55':'rgba(200,150,40,0.4)'}`,
          color:(!sel||loading)?'rgba(200,150,40,0.2)':cls?cls.col:'#E8C040',
          fontSize:sm?12:13, fontWeight:700, fontFamily:SERIF, letterSpacing:'1px',
          boxShadow:(!sel||loading)?'none':cls?`0 8px 28px ${cls.col}22`:'0 8px 28px rgba(200,140,20,0.15)',
          transition:'all .2s',
        }}>
          {loading ? 'Wchodzę do świata…' : sel ? `⚔ Graj jako ${chosen?.nazwa}` : '— Wybierz postać —'}
        </button>

        <Divider />

        <div style={{ display:'flex', gap:8 }}>
          {isAdmin && (
            <button onClick={onAdminPanel} style={{ flex:1, padding:'10px', background:'rgba(40,6,6,0.6)', border:'1px solid rgba(200,60,60,0.25)', borderRadius:8, cursor:'pointer', color:'#E06060', fontSize:sm?10:10, fontWeight:700, fontFamily:SERIF }}>
              🛡 Admin
            </button>
          )}
          <button onClick={onLogout} style={{ flex:1, padding:'10px', background:'rgba(8,14,28,0.6)', border:'1px solid rgba(200,150,40,0.1)', borderRadius:8, cursor:'pointer', color:'rgba(200,150,40,0.4)', fontSize:10, fontFamily:SERIF }}>
            🚪 Wyloguj się
          </button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CREATE CHARACTER SCREEN
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
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:`${sm?16:24}px ${sm?12:20}px`, position:'relative', zIndex:1 }}>

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
  const [screen, setScreen] = useState('loading'); // loading|landing|charselect|create
  const [stats,  setStats]  = useState(null);
  const [classes,setClasses]= useState([]);
  const [chars,  setChars]  = useState([]);
  const [isAdmin,setIsAdmin]= useState(false);
  const [selErr, setSelErr] = useState('');
  const [selLoad,setSelLoad]= useState(false);

  const refreshChars = useCallback(async () => {
    const r = await apiFetch('GET','/auth/my-characters');
    if (Array.isArray(r)) setChars(r);
  }, []);

  useEffect(() => {
    apiFetch('GET','/auth/stats').then(s => s && !s.error && setStats(s)).catch(()=>{});
    apiFetch('GET','/auth/classes').then(c => Array.isArray(c) && setClasses(c)).catch(()=>{});
    setScreen('landing');
  }, []);

  const handleDirectLogin = async (admin) => {
    setIsAdmin(!!admin);
    await refreshChars();
    setScreen('charselect');
  };

  const handleDirectRegister = async () => {
    setIsAdmin(false);
    await refreshChars();
    setScreen('charselect');
  };

  const enterGame = async (charId) => {
    if (!charId) return;
    setSelErr(''); setSelLoad(true);
    try {
      const r = await apiFetch('POST','/auth/select-character',{postacId:charId});
      r.ok ? onLogin() : setSelErr(r.error||'Błąd wyboru postaci');
    } finally { setSelLoad(false); }
  };

  const deleteChar = async (charId) => {
    await apiFetch('POST','/auth/delete-character',{postacId:charId,confirm:'USUŃ'});
    await refreshChars();
  };

  if (screen==='loading') return (
    <>
      <Background />
      <div style={{ position:'relative', zIndex:1, height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
        <Rune style={{ opacity:.4, animation:'spin 8s linear infinite' }} />
        <div style={{ color:'rgba(200,150,40,0.5)', fontSize:11, fontFamily:SERIF, letterSpacing:3 }}>Łączenie z Veldorią…</div>
      </div>
    </>
  );

  return (
    <>
      <Background />
      {screen==='landing'    && <LandingScreen stats={stats} classes={classes} onDirectLogin={handleDirectLogin} onDirectRegister={handleDirectRegister} />}
      {screen==='charselect' && <CharacterSelect chars={chars} onEnterGame={enterGame} onCreate={()=>setScreen('create')} onDelete={deleteChar} onLogout={async()=>{await apiFetch('POST','/auth/logout');setChars([]);setScreen('landing');}} isAdmin={isAdmin} onAdminPanel={()=>{}} loading={selLoad} error={selErr} />}
      {screen==='create'     && <CreateCharacter classes={classes} onBack={()=>setScreen('charselect')} onSuccess={async()=>{await refreshChars();setScreen('charselect');}} />}
    </>
  );
}
