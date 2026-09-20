// Strona główna Veldorii — ekran powitalny przed logowaniem.
import { useEffect, useState } from 'react';
import { S, pageBg, vignette, goldBtn, ghostBtn, Diamond, Ornament, Logo, OnlineBadge } from './siteStyle';

// Tylko pozycje, które naprawdę gdzieś prowadzą
const NAV = [
  { id: 'klasy', label: 'Klasy' },
  { id: 'swiat', label: 'Świat' },
];

const CLASS_ICON = {
  Wojownik: '⚔', Paladyn: '🛡', 'Tancerz Ostrzy': '🗡',
  Lowca: '🏹', Tropiciel: '🧭', Mag: '🔮',
};

const PILLS = [
  { icon: '⚔', label: 'Walka',       color: '#e5624c' },
  { icon: '🧭', label: 'Eksploracja', color: '#4b9cff' },
  { icon: '⚒', label: 'Crafting',    color: '#5fd07a' },
];

function useNarrow(bp = 860) {
  const [n, setN] = useState(typeof window !== 'undefined' && window.innerWidth < bp);
  useEffect(() => {
    const on = () => setN(window.innerWidth < bp);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [bp]);
  return n;
}

function Stat({ icon, value, label, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px' }}>
      <span style={{ fontSize: 22, opacity: 0.85 }}>{icon}</span>
      <div>
        <div style={{ fontFamily: S.serif, fontSize: 20, color: S.text, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 11, color: S.muted, fontFamily: S.sans }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: S.dim, fontFamily: S.sans }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function Landing({ stats, classes = [], onPlay, onLogin, onSection }) {
  const narrow = useNarrow();

  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: S.text, fontFamily: S.sans, overflowX: 'hidden' }}>
      <div style={pageBg} />
      <div style={vignette} />

      {/* Pasek górny */}
      <header style={{
        position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', gap: 18,
        padding: narrow ? '12px 14px' : '14px 28px',
        borderBottom: `1px solid ${S.lineSoft}`, background: 'rgba(5,8,16,0.72)', backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Diamond size={6} />
          <span style={{ fontFamily: S.serif, fontSize: 19, letterSpacing: 3, color: S.gold }}>VELDORIA</span>
          <Diamond size={6} />
        </div>

        {!narrow && (
          <nav style={{ display: 'flex', gap: 26, marginLeft: 30 }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => document.getElementById(n.id)?.scrollIntoView({ behavior: 'smooth' })} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontFamily: S.serif, fontSize: 14, color: S.muted, letterSpacing: 0.5,
              }}>{n.label}</button>
            ))}
          </nav>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: narrow ? 8 : 16 }}>
          {!narrow && <OnlineBadge online={stats?.online} />}
          <button onClick={onLogin} style={{ ...ghostBtn(), whiteSpace: 'nowrap', padding: narrow ? '9px 12px' : undefined }}>
            Zaloguj się
          </button>
          <button onClick={onPlay} style={{ ...goldBtn(), whiteSpace: 'nowrap', padding: narrow ? '9px 14px' : undefined }}>
            ⚔ {narrow ? 'Graj' : 'Graj teraz'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <main style={{
        position: 'relative', zIndex: 2,
        minHeight: narrow ? 'auto' : 'calc(100vh - 66px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: narrow ? '38px 16px 28px' : '10px 60px 40px',
        maxWidth: 1500, margin: '0 auto',
      }}>
        {/* Blok powitalny na środku strony */}
        <div style={{ maxWidth: 820, width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <Ornament>Klasyczne RPG online</Ornament>
          </div>

          <h1 style={{
            margin: 0, textAlign: 'center',
            fontFamily: S.serif, fontWeight: 700,
            fontSize: narrow ? 52 : 92, lineHeight: 1, letterSpacing: narrow ? 4 : 8,
            background: 'linear-gradient(180deg,#fdf1c8 0%,#e7c158 45%,#a87f2b 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 6px 26px rgba(216,171,61,0.35))',
          }}>VELDORIA</h1>

          <p style={{
            margin: '16px 0 26px', textAlign: 'center',
            fontFamily: S.serif, fontSize: narrow ? 15 : 19, color: S.text, opacity: 0.92,
          }}>Odkryj świat pełen przygód, magii i niebezpieczeństw.</p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={onPlay} style={goldBtn(true)}>⚔ Rozpocznij przygodę →</button>
            <button onClick={onLogin} style={ghostBtn(true)}>👤 Zaloguj się</button>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20, justifyContent: 'center' }}>
            {PILLS.map(p => (
              <span key={p.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 999,
                background: 'rgba(8,12,22,0.78)', border: `1px solid ${S.lineSoft}`,
                color: S.text, fontSize: 13,
              }}>
                <span style={{ color: p.color }}>{p.icon}</span>{p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Pasek statystyk */}
        <div id="swiat" style={{
          marginTop: narrow ? 30 : 56, alignSelf: 'center',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          padding: '16px 10px', borderRadius: 14,
          background: 'rgba(7,10,20,0.8)', border: `1px solid ${S.lineSoft}`, backdropFilter: 'blur(6px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}>
          <Stat icon="👥" value={stats?.online ?? 0} label="Graczy online" />
          <span style={{ width: 1, background: S.lineSoft, margin: '4px 0' }} />
          <Stat icon="🌍" value="Rozległy świat" label="Miasta • Lochy • Dzikie tereny" />
          <span style={{ width: 1, background: S.lineSoft, margin: '4px 0' }} />
          <Stat icon="🛡" value={`${classes.length || 6} klas`} label="Wybierz swoją drogę" />
          <span style={{ width: 1, background: S.lineSoft, margin: '4px 0' }} />
          <Stat icon="⚔" value={stats?.total ?? 0} label="Założonych kont" />
        </div>
      </main>

      {/* Klasy */}
      {classes.length > 0 && (
        <section id="klasy" style={{
          position: 'relative', zIndex: 2, padding: narrow ? '36px 14px' : '56px 28px',
          background: 'linear-gradient(180deg, rgba(4,7,14,0.6), rgba(4,7,14,0.92))',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 10 }}><Ornament>Wybierz swoją drogę</Ornament></div>
          <h2 style={{
            textAlign: 'center', margin: '12px 0 26px', fontFamily: S.serif, fontWeight: 700,
            fontSize: narrow ? 26 : 36, letterSpacing: 4, color: S.gold,
          }}>KLASY POSTACI</h2>
          <div style={{
            display: 'grid', gap: 14, maxWidth: 1100, margin: '0 auto',
            gridTemplateColumns: `repeat(auto-fit, minmax(${narrow ? 240 : 320}px, 1fr))`,
          }}>
            {classes.map(c => (
              <div key={c.name} style={{
                display: 'flex', gap: 14, alignItems: 'flex-start', padding: 16,
                background: 'rgba(8,12,22,0.8)', border: `1px solid ${S.lineSoft}`, borderRadius: 12,
              }}>
                <div style={{
                  width: 52, height: 52, flexShrink: 0, display: 'grid', placeItems: 'center',
                  borderRadius: 10, border: `1px solid ${S.line}`, background: 'rgba(4,7,14,0.7)', fontSize: 22,
                }}>{CLASS_ICON[c.name] || '✦'}</div>
                <div>
                  <div style={{ fontFamily: S.serif, fontSize: 18, color: S.gold }}>{c.name}</div>
                  <div style={{ color: S.muted, fontSize: 12.5, margin: '3px 0 8px' }}>{c.opis}</div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 11, color: S.dim }}>
                    <span>💪 siła {c.sila}</span><span>🏹 zręczność {c.zrecznosc}</span><span>🧠 intelekt {c.intelekt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 26 }}>
            <button onClick={onPlay} style={goldBtn(true)}>⚔ Rozpocznij przygodę →</button>
          </div>
        </section>
      )}

      {/* Stopka */}
      <footer style={{
        position: 'relative', zIndex: 2, padding: '14px 20px', textAlign: 'center',
        borderTop: `1px solid ${S.lineSoft}`, background: 'rgba(5,8,16,0.8)',
        color: S.dim, fontSize: 11, letterSpacing: 2, fontFamily: S.serif,
      }}>
        WIĘCEJ NIŻ GRA <span style={{ color: S.goldDim }}>◆</span> TO TWÓJ ŚWIAT
      </footer>
    </div>
  );
}
