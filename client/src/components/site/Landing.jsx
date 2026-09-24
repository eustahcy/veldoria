// Strona główna Veldorii — ekran powitalny przed logowaniem.
import { useEffect, useState } from 'react';
import { S, pageBg, vignette, goldBtn, ghostBtn, Diamond, Ornament, Logo, OnlineBadge } from './siteStyle';
import {
  IconSword, IconShield, IconDagger, IconBow, IconCompass, IconSparkles, IconHammer,
  IconUser, IconUsers, IconGlobe, IconMuscle, IconCrosshair, IconBrain,
} from '../../Icons';

// Tylko pozycje, które naprawdę gdzieś prowadzą
const NAV = [
  { id: 'klasy', label: 'Klasy' },
  { id: 'swiat', label: 'Świat' },
];

const CLASS_ICON = {
  Wojownik: IconSword, Paladyn: IconShield, 'Tancerz Ostrzy': IconDagger,
  Lowca: IconBow, Tropiciel: IconCompass, Mag: IconSparkles,
};

const PILLS = [
  { Icon: IconSword,   label: 'Walka',       color: '#e5624c' },
  { Icon: IconCompass, label: 'Eksploracja', color: '#4b9cff' },
  { Icon: IconHammer,  label: 'Crafting',    color: '#5fd07a' },
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

function Stat({ Icon, value, label, sub, compact }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 9 : 12, padding: compact ? 0 : '0 22px', minWidth: 0 }}>
      <span style={{ color: S.gold, opacity: 0.9, flexShrink: 0, display: 'flex' }}>
        <Icon size={compact ? 18 : 22} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: S.serif, fontSize: compact ? 16 : 20, color: S.text, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
        <div style={{ fontSize: compact ? 10.5 : 11, color: S.muted, fontFamily: S.sans, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: S.dim, fontFamily: S.sans }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function Landing({ stats, classes = [], onPlay, onLogin, onSection }) {
  const narrow = useNarrow();

  return (
    <div className="vh-min" style={{ position: 'relative', color: S.text, fontFamily: S.sans, overflowX: 'hidden' }}>
      <div style={pageBg} />
      <div style={vignette} />

      {/* Pasek górny */}
      <header style={{
        position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', gap: 18,
        padding: narrow ? 'calc(12px + var(--safe-t)) calc(14px + var(--safe-r)) 12px calc(14px + var(--safe-l))' : '14px 28px',
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
            <IconSword size={12} /> {narrow ? 'Graj' : 'Graj teraz'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <main style={{
        position: 'relative', zIndex: 2,
        minHeight: narrow ? 'auto' : 'calc(100dvh - 66px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: narrow ? '26px 16px 20px' : '10px 60px 40px',
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
            <button onClick={onPlay} style={goldBtn(true)}><IconSword size={15} /> Rozpocznij przygodę →</button>
            <button onClick={onLogin} style={ghostBtn(true)}><IconUser size={15} /> Zaloguj się</button>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20, justifyContent: 'center' }}>
            {PILLS.map(p => (
              <span key={p.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 999,
                background: 'rgba(8,12,22,0.78)', border: `1px solid ${S.lineSoft}`,
                color: S.text, fontSize: 13,
              }}>
                <span style={{ color: p.color, display: 'inline-flex' }}><p.Icon size={15} /></span>{p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Pasek statystyk */}
        <div id="swiat" style={{
          marginTop: narrow ? 18 : 56, alignSelf: 'center', width: narrow ? '100%' : 'auto', boxSizing: 'border-box',
          display: narrow ? 'grid' : 'flex', gridTemplateColumns: narrow ? '1fr 1fr' : undefined,
          flexWrap: 'wrap', justifyContent: 'center', gap: narrow ? 10 : 0,
          padding: narrow ? 14 : '16px 10px', borderRadius: 14,
          background: 'rgba(7,10,20,0.8)', border: `1px solid ${S.lineSoft}`, backdropFilter: 'blur(6px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}>
          <Stat compact={narrow} Icon={IconUsers} value={stats?.online ?? 0} label="Graczy online" />
          {!narrow && <span style={{ width: 1, background: S.lineSoft, margin: '4px 0' }} />}
          <Stat compact={narrow} Icon={IconSword} value={stats?.total ?? 0} label="Założonych kont" />
          {!narrow && <span style={{ width: 1, background: S.lineSoft, margin: '4px 0' }} />}
          <Stat compact={narrow} Icon={IconShield} value={`${classes.length || 6} klas`} label="Wybierz swoją drogę" />
          {!narrow && <span style={{ width: 1, background: S.lineSoft, margin: '4px 0' }} />}
          <Stat compact={narrow} Icon={IconGlobe} value="Rozległy świat" label={narrow ? 'Miasta i lochy' : 'Miasta • Lochy • Dzikie tereny'} />
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
                  borderRadius: 10, border: `1px solid ${S.line}`, background: 'rgba(4,7,14,0.7)', color: S.gold,
                }}>{(() => { const I = CLASS_ICON[c.name] || IconSparkles; return <I size={24} />; })()}</div>
                <div>
                  <div style={{ fontFamily: S.serif, fontSize: 18, color: S.gold }}>{c.name}</div>
                  <div style={{ color: S.muted, fontSize: 12.5, margin: '3px 0 8px' }}>{c.opis}</div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 11, color: S.dim }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconMuscle size={12} /> siła {c.sila}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconCrosshair size={12} /> zręczność {c.zrecznosc}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconBrain size={12} /> intelekt {c.intelekt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 26 }}>
            <button onClick={onPlay} style={goldBtn(true)}><IconSword size={15} /> Rozpocznij przygodę →</button>
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
