// Wybór postaci po zalogowaniu.
import { useState, useEffect } from 'react';
import { S, pageBg, vignette, panel, goldBtn, ghostBtn, Diamond, Ornament, Logo, OnlineBadge } from './siteStyle';

const MAX_SLOTS = 3;

const PROF_COLOR = {
  Wojownik: '#e5624c', Paladyn: '#f0c24b', 'Tancerz Ostrzy': '#c07ae0',
  Lowca: '#5fd07a', Tropiciel: '#4bb3a6', Mag: '#4b9cff',
};

function useNarrow(bp = 900) {
  const [n, setN] = useState(typeof window !== 'undefined' && window.innerWidth < bp);
  useEffect(() => {
    const on = () => setN(window.innerWidth < bp);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [bp]);
  return n;
}

// Progi doświadczenia jak na serwerze: poziom^4 + 10
function expPct(ch) {
  const lvl = ch.poziom || 1;
  const a = lvl > 1 ? Math.pow(lvl - 1, 4) + 10 : 0;
  const b = Math.pow(lvl, 4) + 10;
  return Math.max(0, Math.min(100, Math.round(((Number(ch.exp) - a) / (b - a)) * 100)));
}

function Bar({ pct, color, glow }) {
  return (
    <div style={{ flex: 1, height: 7, background: 'rgba(0,0,0,0.6)', borderRadius: 4, overflow: 'hidden', border: `1px solid ${S.lineSoft}` }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, boxShadow: `0 0 8px ${glow}`, transition: 'width .3s' }} />
    </div>
  );
}

function CharCard({ ch, mapName, onEnter, onDelete, busy }) {
  const [hover, setHover] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const hpPct = ch.zycie_max > 0 ? Math.round((ch.zycie / ch.zycie_max) * 100) : 0;
  const color = PROF_COLOR[ch.profesja] || S.gold;

  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        ...panel, width: '100%', maxWidth: 340, padding: 16, boxSizing: 'border-box',
        border: `1px solid ${hover ? S.gold : S.line}`,
        boxShadow: hover ? '0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(231,193,88,0.25)' : panel.boxShadow,
        transition: 'border-color .15s, box-shadow .15s, transform .15s',
        transform: hover ? 'translateY(-3px)' : 'none',
      }}
    >
      {/* Sprite na cokole */}
      <div style={{
        position: 'relative', height: 150, borderRadius: 10, marginBottom: 12,
        background: 'radial-gradient(ellipse at 50% 95%, rgba(231,193,88,0.16), rgba(4,7,14,0.9) 65%)',
        border: `1px solid ${S.lineSoft}`, display: 'grid', placeItems: 'center', overflow: 'hidden',
      }}>
        {ch.ranga === 'GameAdmin' && (
          <span style={{
            position: 'absolute', top: 8, left: 8, padding: '3px 8px', borderRadius: 999,
            background: 'rgba(229,98,76,0.18)', border: '1px solid rgba(229,98,76,0.5)',
            color: '#ff8b78', fontSize: 10, fontWeight: 'bold',
          }}>★ ADMIN</span>
        )}
        {ch.zalogowany ? (
          <span style={{
            position: 'absolute', top: 8, right: 8, padding: '3px 8px', borderRadius: 999,
            background: 'rgba(95,208,122,0.14)', border: '1px solid rgba(95,208,122,0.45)',
            color: S.green, fontSize: 10,
          }}>● Online</span>
        ) : null}
        <div style={{
          width: 32, height: 48, transform: 'scale(2.1)', transformOrigin: 'center',
          backgroundImage: `url(/assets/${ch.obrazek})`, backgroundPosition: '0 0',
          backgroundRepeat: 'no-repeat', imageRendering: 'pixelated',
          filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.8))',
        }} />
      </div>

      <div style={{ textAlign: 'center', fontFamily: S.serif, fontSize: 22, color: S.text }}>{ch.nazwa}</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '6px 0 12px' }}>
        <span style={{
          padding: '3px 10px', borderRadius: 999, fontSize: 11,
          background: `${color}1f`, border: `1px solid ${color}66`, color,
        }}>{ch.profesja}</span>
        <span style={{
          padding: '3px 10px', borderRadius: 999, fontSize: 11,
          background: 'rgba(231,193,88,0.12)', border: `1px solid ${S.line}`, color: S.gold,
        }}>Lv. {ch.poziom}</span>
        {ch.prestige > 0 && (
          <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, background: 'rgba(192,122,224,0.15)', border: '1px solid rgba(192,122,224,0.45)', color: '#d9a7f0' }}>
            ✦ {ch.prestige}
          </span>
        )}
      </div>

      {mapName && (
        <div style={{ textAlign: 'center', color: S.muted, fontSize: 12, marginBottom: 10 }}>📍 {mapName}</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ color: '#ff8b78', fontSize: 11, width: 26 }}>HP</span>
        <Bar pct={hpPct} color="linear-gradient(90deg,#8e2f22,#e5624c)" glow="rgba(229,98,76,0.5)" />
        <span style={{ color: S.muted, fontSize: 11, width: 56, textAlign: 'right' }}>{ch.zycie}/{ch.zycie_max}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ color: S.green, fontSize: 11, width: 26 }}>EXP</span>
        <Bar pct={expPct(ch)} color="linear-gradient(90deg,#2f6a3a,#5fd07a)" glow="rgba(95,208,122,0.45)" />
        <span style={{ color: S.muted, fontSize: 11, width: 56, textAlign: 'right' }}>{expPct(ch)}%</span>
      </div>

      {confirm ? (
        <div>
          <div style={{ color: '#ffb3a6', fontSize: 12, textAlign: 'center', marginBottom: 8 }}>
            Usunąć „{ch.nazwa}" bezpowrotnie?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { onDelete(ch.id); setConfirm(false); }} style={{
              ...ghostBtn(), flex: 1, color: '#ff8b78', borderColor: 'rgba(229,98,76,0.5)',
            }}>Tak, usuń</button>
            <button onClick={() => setConfirm(false)} style={{ ...ghostBtn(), flex: 1 }}>Anuluj</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onEnter(ch.id)} disabled={busy} style={{ ...goldBtn(), flex: 1, opacity: busy ? 0.6 : 1 }}>
            ▶ Wejdź do gry
          </button>
          <button onClick={() => setConfirm(true)} title="Usuń postać" style={{ ...ghostBtn(), padding: '11px 14px' }}>🗑</button>
        </div>
      )}
    </div>
  );
}

function EmptySlot({ onCreate }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onCreate}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', maxWidth: 340, minHeight: 386, boxSizing: 'border-box', borderRadius: 14, cursor: 'pointer',
        background: hover ? 'rgba(231,193,88,0.06)' : 'rgba(6,9,18,0.5)',
        border: `1px dashed ${hover ? S.gold : S.line}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
        color: S.muted, fontFamily: S.sans, transition: 'all .15s',
      }}
    >
      <span style={{
        width: 54, height: 54, borderRadius: '50%', display: 'grid', placeItems: 'center',
        border: `1px dashed ${hover ? S.gold : S.line}`, color: S.gold, fontSize: 26,
      }}>+</span>
      <span style={{ fontFamily: S.serif, fontSize: 19, color: S.text }}>Nowa postać</span>
      <span style={{ fontSize: 12, maxWidth: 190, textAlign: 'center' }}>
        Stwórz nowego bohatera i rozpocznij przygodę
      </span>
    </button>
  );
}

export default function CharacterSelect({
  chars = [], me, stats, mapNames = {}, onEnterGame, onCreate, onDelete, onLogout, onHome, onAdmin, loading, error,
}) {
  const narrow = useNarrow();
  const medium = useNarrow(1100);
  const slots = Math.max(MAX_SLOTS, chars.length);
  const canCreate = chars.length < MAX_SLOTS;

  const menu = (
    <div style={{ ...panel, padding: 16, width: narrow ? '100%' : 230, alignSelf: 'flex-start' }}>
      <div style={{ color: S.dim, fontSize: 10, letterSpacing: 3 }}>KONTO</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 14px' }}>
        <span style={{ fontSize: 20 }}>{me?.isAdmin ? '👑' : '🛡'}</span>
        <div>
          <div style={{ fontFamily: S.serif, fontSize: 17, color: S.gold }}>{me?.login || '—'}</div>
          <div style={{ color: S.muted, fontSize: 11 }}>
            {me?.isAdmin ? 'Administrator' : 'Gracz'} · {chars.length} {chars.length === 1 ? 'postać' : 'postaci'}
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: S.lineSoft, margin: '4px 0 12px' }} />
      {me?.isAdmin && (
        <button onClick={onAdmin} style={{
          ...ghostBtn(), width: '100%', marginBottom: 8,
          color: '#ff8b78', borderColor: 'rgba(229,98,76,0.45)',
        }}>★ Panel administratora</button>
      )}
      <button onClick={onHome} style={{ ...ghostBtn(), width: '100%', marginBottom: 8 }}>← Strona główna</button>
      <button onClick={onLogout} style={{ ...ghostBtn(), width: '100%', color: '#ff8b78', borderColor: 'rgba(229,98,76,0.4)' }}>
        ⎋ Wyloguj się
      </button>
    </div>
  );

  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: S.text, fontFamily: S.sans }}>
      <div style={pageBg} />
      <div style={vignette} />

      <header style={{
        position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center',
        padding: narrow ? '14px 14px 0' : '18px 28px 0',
      }}>
        <Logo size={narrow ? 18 : 22} sub={narrow ? null : 'ONLINE RPG'} />
        <div style={{ marginLeft: 'auto' }}><OnlineBadge online={stats?.online} /></div>
      </header>

      <main style={{
        position: 'relative', zIndex: 2, maxWidth: 1360, margin: '0 auto',
        padding: narrow ? '18px 14px 40px' : '26px 28px 50px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 6 }}><Ornament>Wybierz bohatera</Ornament></div>
        <h1 style={{
          textAlign: 'center', margin: '10px 0 4px', fontFamily: S.serif, fontWeight: 700,
          fontSize: narrow ? 30 : 44, letterSpacing: narrow ? 3 : 6,
          background: 'linear-gradient(180deg,#fdf1c8,#e7c158 55%,#a87f2b)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>TWOJE POSTACIE</h1>
        <p style={{ textAlign: 'center', color: S.muted, fontSize: 13, margin: '0 0 24px' }}>
          Każda historia ma swój początek…
        </p>

        {error && (
          <div style={{
            maxWidth: 520, margin: '0 auto 18px', padding: '10px 14px', borderRadius: 9, textAlign: 'center',
            background: 'rgba(120,30,20,0.28)', border: '1px solid rgba(229,98,76,0.45)', color: '#ffb3a6', fontSize: 13,
          }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexDirection: narrow ? 'column' : 'row' }}>
          {menu}
          <div style={{
            // trzy kafelki obok siebie (na telefonie jeden pod drugim)
            flex: 1, minWidth: 0, display: 'grid', gap: 18,
            gridTemplateColumns: narrow ? 'minmax(0, 340px)' : `repeat(${medium ? 2 : 3}, minmax(0, 1fr))`,
            justifyContent: narrow ? 'center' : 'stretch', justifyItems: 'center',
          }}>
            {chars.map(ch => (
              <CharCard key={ch.id} ch={ch} mapName={mapNames[ch.mapa]}
                        onEnter={onEnterGame} onDelete={onDelete} busy={loading} />
            ))}
            {Array.from({ length: Math.max(0, slots - chars.length) }, (_, i) => (
              <EmptySlot key={`e${i}`} onCreate={canCreate ? onCreate : undefined} />
            ))}
          </div>
        </div>

        {canCreate && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 26 }}>
            <button onClick={onCreate} style={{ ...ghostBtn(true), minWidth: 320 }}>+ Stwórz nową postać</button>
          </div>
        )}
      </main>

      <footer style={{
        position: 'relative', zIndex: 2, padding: '14px 20px', textAlign: 'center',
        borderTop: `1px solid ${S.lineSoft}`, color: S.dim, fontSize: 11, letterSpacing: 2, fontFamily: S.serif,
      }}>
        VELDORIA <Diamond size={5} style={{ margin: '0 8px' }} /> Odkryj świat na nowo
      </footer>
    </div>
  );
}
