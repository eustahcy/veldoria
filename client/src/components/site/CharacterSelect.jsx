// Wybór postaci po zalogowaniu.
import { useState, useEffect, useRef } from 'react';
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

function CharCard({ ch, mapName, onEnter, onDelete, busy, narrow }) {
  const [hover, setHover] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const hpPct = ch.zycie_max > 0 ? Math.round((ch.zycie / ch.zycie_max) * 100) : 0;
  const color = PROF_COLOR[ch.profesja] || S.gold;

  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        ...panel, width: '100%', maxWidth: narrow ? 520 : 340, padding: narrow ? 12 : 16, boxSizing: 'border-box',
        border: `1px solid ${hover ? S.gold : S.line}`,
        boxShadow: hover ? '0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(231,193,88,0.25)' : panel.boxShadow,
        transition: 'border-color .15s, box-shadow .15s, transform .15s',
        transform: hover ? 'translateY(-3px)' : 'none',
      }}
    >
      <div style={{ display: narrow ? 'flex' : 'block', gap: 12, alignItems: 'stretch' }}>
      {/* Sprite na cokole */}
      <div style={{
        position: 'relative', height: narrow ? 132 : 150, width: narrow ? 118 : 'auto', flexShrink: 0,
        borderRadius: 10, marginBottom: narrow ? 0 : 12,
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

      <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ textAlign: narrow ? 'left' : 'center', fontFamily: S.serif, fontSize: narrow ? 19 : 22, color: S.text }}>{ch.nazwa}</div>
      <div style={{ display: 'flex', justifyContent: narrow ? 'flex-start' : 'center', flexWrap: 'wrap', gap: 8, margin: '6px 0 10px' }}>
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
        <div style={{ textAlign: narrow ? 'left' : 'center', color: S.muted, fontSize: 12, marginBottom: 10 }}>📍 {mapName}</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ color: '#ff8b78', fontSize: 11, width: 26 }}>HP</span>
        <Bar pct={hpPct} color="linear-gradient(90deg,#8e2f22,#e5624c)" glow="rgba(229,98,76,0.5)" />
        <span style={{ color: S.muted, fontSize: 11, width: 56, textAlign: 'right' }}>{ch.zycie}/{ch.zycie_max}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: narrow ? 0 : 14 }}>
        <span style={{ color: S.green, fontSize: 11, width: 26 }}>EXP</span>
        <Bar pct={expPct(ch)} color="linear-gradient(90deg,#2f6a3a,#5fd07a)" glow="rgba(95,208,122,0.45)" />
        <span style={{ color: S.muted, fontSize: 11, width: 56, textAlign: 'right' }}>{expPct(ch)}%</span>
      </div>
      </div>
      </div>
      <div style={{ height: narrow ? 12 : 0 }} />

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



// ── Scena wyboru postaci (desktop) ──────────────────────────────────────────
// Po lewej opis klasy wybranej postaci, na środku bohaterowie na podeście,
// po prawej lista postaci i wolne sloty.
const IKONA_KLASY = {
  Wojownik: '⚔', Paladyn: '✚', 'Tancerz Ostrzy': '⚡', Lowca: '🏹', Tropiciel: '🧭', Mag: '✦',
};

function PasekStatu({ etykieta, pct, wartosc, kolor, glow }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
      <span style={{ color: S.muted, fontSize: 11, width: 42, letterSpacing: 1 }}>{etykieta}</span>
      <Bar pct={pct} color={kolor} glow={glow} />
      <span style={{ color: S.text, fontSize: 12, width: 58, textAlign: 'right' }}>{wartosc}</span>
    </div>
  );
}

function Scena({ chars, slots, classes, mapNames, onEnter, onDelete, onCreate, busy, canCreate, konto }) {
  const [wybrany, setWybrany] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const idx = Math.min(wybrany, Math.max(0, chars.length - 1));
  const ch = chars[idx];
  const puste = Math.max(0, slots - chars.length);
  const klasa = classes?.find(c => c.name === ch?.profesja);
  const kolor = ch ? (PROF_COLOR[ch.profesja] || S.gold) : S.gold;

  useEffect(() => { setConfirm(false); }, [idx]);

  const maks = ch ? Math.max(ch.sila || 0, ch.zrecznosc || 0, ch.intelekt || 0, 10) : 10;

  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'stretch', width: '100%', minHeight: 520 }}>

      {/* ── Lewa kolumna: klasa wybranej postaci ── */}
      <div style={{ ...panel, width: 272, flexShrink: 0, padding: 18, display: 'flex', flexDirection: 'column' }}>
        {ch ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22, color: kolor }}>{IKONA_KLASY[ch.profesja] || '◆'}</span>
              <span style={{ fontFamily: S.serif, fontSize: 21, letterSpacing: 2, color: S.gold, textTransform: 'uppercase' }}>
                {ch.profesja}
              </span>
            </div>
            <div style={{ color: S.muted, fontSize: 12.5, lineHeight: 1.6, marginBottom: 16, minHeight: 72 }}>
              {klasa?.opis || 'Bohater Veldorii, gotowy na własną historię.'}
            </div>
            <PasekStatu etykieta="PŻ" pct={ch.zycie_max > 0 ? Math.round((ch.zycie / ch.zycie_max) * 100) : 0}
              wartosc={`${ch.zycie}/${ch.zycie_max}`} kolor="linear-gradient(90deg,#8e2f22,#e5624c)" glow="rgba(229,98,76,0.5)" />
            <PasekStatu etykieta="EXP" pct={expPct(ch)} wartosc={`${expPct(ch)}%`}
              kolor="linear-gradient(90deg,#2f6a3a,#5fd07a)" glow="rgba(95,208,122,0.45)" />
            <PasekStatu etykieta="SIŁA" pct={Math.round(((ch.sila || 0) / maks) * 100)} wartosc={ch.sila ?? '—'}
              kolor="linear-gradient(90deg,#2b5c8f,#4b9cff)" glow="rgba(75,156,255,0.45)" />
            <PasekStatu etykieta="ZRĘ" pct={Math.round(((ch.zrecznosc || 0) / maks) * 100)} wartosc={ch.zrecznosc ?? '—'}
              kolor="linear-gradient(90deg,#3f7a44,#7ad07a)" glow="rgba(122,208,122,0.4)" />
            <PasekStatu etykieta="INT" pct={Math.round(((ch.intelekt || 0) / maks) * 100)} wartosc={ch.intelekt ?? '—'}
              kolor="linear-gradient(90deg,#6b3f9a,#c07ae0)" glow="rgba(192,122,224,0.45)" />

            {mapNames[ch.mapa] && (
              <div style={{ paddingTop: 14, color: S.muted, fontSize: 12 }}>
                📍 {mapNames[ch.mapa]}
              </div>
            )}
          </>
        ) : (
          <div style={{ margin: '30px 0', textAlign: 'center', color: S.muted, fontSize: 13 }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>🛡</div>
            Nie masz jeszcze żadnej postaci.<br />Wybierz wolny slot po prawej.
          </div>
        )}
        {konto && <div style={{ marginTop: 'auto', paddingTop: 16 }}>{konto}</div>}
      </div>

      {/* ── Środek: podest z bohaterami ── */}
      <div style={{
        flex: 1, minWidth: 0, position: 'relative', borderRadius: 16, overflow: 'hidden',
        border: `1px solid ${S.lineSoft}`, background: 'linear-gradient(180deg, rgba(4,7,14,0.25), rgba(4,7,14,0.72))',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '28px 20px 34px',
      }}>
        {/* poświata podestu */}
        <div style={{
          position: 'absolute', left: '50%', bottom: 18, transform: 'translateX(-50%)',
          width: 'min(88%, 620px)', height: 118, borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(231,193,88,0.22), rgba(231,193,88,0.06) 55%, transparent 72%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', left: '50%', bottom: 44, transform: 'translateX(-50%)',
          width: 'min(80%, 560px)', height: 3,
          background: 'linear-gradient(90deg, transparent, rgba(231,193,88,0.5), transparent)',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 'clamp(10px, 3vw, 44px)', position: 'relative', zIndex: 1, maxWidth: '100%' }}>
          {chars.length === 0 && (
            <div style={{ color: S.muted, fontSize: 14, paddingBottom: 40 }}>Pusta arena — stwórz pierwszego bohatera</div>
          )}
          {chars.map((c, i) => {
            const akt = i === idx;
            return (
              <button key={c.id} onClick={() => setWybrany(i)} title={c.nazwa}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                  transition: 'opacity .18s',
                  opacity: akt ? 1 : 0.6,
                }}
              >
                {/* sprite rośnie w górę od podłogi, więc pudełko ma stałą wysokość */}
                <div style={{ height: 212, display: 'grid', alignItems: 'end', justifyItems: 'center' }}>
                  <div style={{
                    width: 32, height: 48, transform: `scale(${akt ? 4 : 3})`, transformOrigin: 'bottom center',
                    backgroundImage: `url(/assets/${c.obrazek})`, backgroundPosition: '0 0',
                    backgroundRepeat: 'no-repeat', imageRendering: 'pixelated',
                    filter: akt ? 'drop-shadow(0 12px 16px rgba(0,0,0,0.85))' : 'drop-shadow(0 8px 12px rgba(0,0,0,0.8)) saturate(0.7)',
                  }} />
                </div>
                {/* banner z imieniem */}
                <div style={{
                  padding: '6px 16px', borderRadius: 8, minWidth: 130, textAlign: 'center',
                  background: akt ? 'linear-gradient(180deg, rgba(231,193,88,0.16), rgba(4,7,14,0.88))' : 'rgba(4,7,14,0.7)',
                  border: `1px solid ${akt ? 'rgba(231,193,88,0.55)' : S.lineSoft}`,
                  boxShadow: akt ? '0 0 22px rgba(231,193,88,0.18)' : 'none',
                }}>
                  <div style={{ fontFamily: S.serif, fontSize: 15, color: akt ? S.gold : S.text }}>{c.nazwa}</div>
                  <div style={{ color: S.muted, fontSize: 11 }}>Lv. {c.poziom}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Prawa kolumna: lista postaci ── */}
      <div style={{ ...panel, width: 296, flexShrink: 0, padding: 16, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14, color: S.gold }}>
          <span style={{ opacity: 0.6 }}>⟶</span>
          <span style={{ fontFamily: S.serif, fontSize: 13, letterSpacing: 3 }}>TWOJE POSTACIE</span>
          <span style={{ opacity: 0.6 }}>⟵</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {chars.map((c, i) => {
            const akt = i === idx;
            const kol = PROF_COLOR[c.profesja] || S.gold;
            return (
              <button key={c.id} onClick={() => setWybrany(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', minHeight: 62,
                  borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  background: akt ? 'rgba(231,193,88,0.09)' : 'rgba(6,9,18,0.55)',
                  border: `1px solid ${akt ? 'rgba(231,193,88,0.6)' : S.lineSoft}`,
                  boxShadow: akt ? '0 0 18px rgba(231,193,88,0.12)' : 'none',
                  transition: 'background .15s, border-color .15s',
                }}
              >
                <span style={{
                  width: 38, height: 44, flexShrink: 0, borderRadius: 7, overflow: 'hidden',
                  background: 'radial-gradient(ellipse at 50% 95%, rgba(231,193,88,0.16), rgba(4,7,14,0.9) 70%)',
                  border: `1px solid ${S.lineSoft}`, display: 'grid', placeItems: 'center',
                }}>
                  <span style={{
                    width: 32, height: 48, transform: 'scale(0.86)', transformOrigin: 'center',
                    backgroundImage: `url(/assets/${c.obrazek})`, backgroundPosition: '0 0',
                    backgroundRepeat: 'no-repeat', imageRendering: 'pixelated',
                  }} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: S.serif, fontSize: 15, color: akt ? S.gold : S.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.nazwa}
                  </span>
                  <span style={{ display: 'block', color: S.muted, fontSize: 11 }}>Lv. {c.poziom}</span>
                </span>
                <span style={{ color: kol, fontSize: 16, flexShrink: 0 }}>{IKONA_KLASY[c.profesja] || '◆'}</span>
                {!!c.zalogowany && <span style={{ color: S.green, fontSize: 10, flexShrink: 0 }}>●</span>}
              </button>
            );
          })}

          {Array.from({ length: puste }, (_, i) => (
            <button key={`p${i}`} onClick={canCreate ? onCreate : undefined} disabled={!canCreate}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', minHeight: 62,
                borderRadius: 10, cursor: canCreate ? 'pointer' : 'default', textAlign: 'left',
                background: 'rgba(6,9,18,0.35)', border: `1px dashed ${S.line}`, color: S.muted,
                opacity: canCreate ? 1 : 0.55,
              }}
            >
              <span style={{
                width: 38, height: 44, flexShrink: 0, borderRadius: 7, display: 'grid', placeItems: 'center',
                border: `1px dashed ${S.line}`, color: S.gold, fontSize: 20,
              }}>+</span>
              <span style={{ fontFamily: S.serif, fontSize: 14 }}>Pusty slot</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          {confirm && ch ? (
            <>
              <div style={{ color: '#ffb3a6', fontSize: 12, textAlign: 'center', marginBottom: 8 }}>
                Usunąć „{ch.nazwa}" bezpowrotnie?
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { onDelete(ch.id); setConfirm(false); }}
                  style={{ ...ghostBtn(), flex: 1, minHeight: 46, color: '#ff8b78', borderColor: 'rgba(229,98,76,0.5)' }}>Tak, usuń</button>
                <button onClick={() => setConfirm(false)} style={{ ...ghostBtn(), flex: 1, minHeight: 46 }}>Anuluj</button>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => ch && onEnter(ch.id)} disabled={!ch || busy}
                style={{ ...goldBtn(), width: '100%', minHeight: 52, fontSize: 15, opacity: (!ch || busy) ? 0.55 : 1 }}>
                ▶ Wejdź do gry
              </button>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                <button onClick={() => ch && setConfirm(true)} disabled={!ch} title="Usuń postać" aria-label="Usuń postać"
                  style={{ ...ghostBtn(), minHeight: 44, padding: '0 22px', opacity: ch ? 1 : 0.45 }}>🗑</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Karuzela postaci (telefon) ───────────────────────────────────────────────
// Trzy karty jedna pod drugą to na telefonie 1000 px przewijania, więc
// pokazujemy jedną postać naraz: strzałki, kropki i przesuwanie palcem.
function Karuzela({ chars, slots, mapNames, onEnter, onDelete, onCreate, busy, canCreate }) {
  const puste = Math.max(0, slots - chars.length);
  const strony = [...chars.map(ch => ({ typ: 'postac', ch })), ...Array.from({ length: puste }, () => ({ typ: 'pusty' }))];
  const [idx, setIdx] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const dotyk = useRef(null);

  const ile = strony.length || 1;
  const teraz = Math.min(idx, ile - 1);
  const strona = strony[teraz] || { typ: 'pusty' };
  const skocz = (o) => { setConfirm(false); setIdx((teraz + o + ile) % ile); };

  useEffect(() => { if (idx > ile - 1) setIdx(0); }, [ile, idx]);

  const zacznij = (e) => { dotyk.current = e.touches[0]?.clientX ?? null; };
  const skoncz = (e) => {
    if (dotyk.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? dotyk.current) - dotyk.current;
    dotyk.current = null;
    if (Math.abs(dx) > 45) skocz(dx < 0 ? 1 : -1);
  };

  const Strzalka = ({ kier }) => (
    <button
      onClick={() => skocz(kier)}
      aria-label={kier > 0 ? 'Następna postać' : 'Poprzednia postać'}
      style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        [kier > 0 ? 'right' : 'left']: 2, width: 46, height: 46, zIndex: 2,
        display: ile > 1 ? 'grid' : 'none', placeItems: 'center',
        background: 'rgba(6,9,18,0.55)', border: `1px solid ${S.line}`, borderRadius: 12,
        color: S.gold, fontSize: 22, cursor: 'pointer', fontFamily: S.serif,
      }}
    >{kier > 0 ? '›' : '‹'}</button>
  );

  const ch = strona.ch;
  const color = ch ? (PROF_COLOR[ch.profesja] || S.gold) : S.gold;

  return (
    <div style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}>
      {/* Scena ze sprite'em */}
      <div
        onTouchStart={zacznij} onTouchEnd={skoncz}
        style={{
          position: 'relative', height: 198, borderRadius: 16, overflow: 'hidden',
          border: `1px solid ${S.lineSoft}`, display: 'grid', placeItems: 'center',
          background: 'radial-gradient(ellipse at 50% 92%, rgba(231,193,88,0.18), rgba(4,7,14,0.92) 68%)',
        }}
      >
        <Strzalka kier={-1} />
        <Strzalka kier={1} />

        {ch ? (
          <>
            {ch.ranga === 'GameAdmin' && (
              <span style={{
                position: 'absolute', top: 10, left: 10, padding: '3px 9px', borderRadius: 999,
                background: 'rgba(229,98,76,0.18)', border: '1px solid rgba(229,98,76,0.5)',
                color: '#ff8b78', fontSize: 10, fontWeight: 'bold',
              }}>★ ADMIN</span>
            )}
            {!!ch.zalogowany && (
              <span style={{
                position: 'absolute', top: 10, right: 10, padding: '3px 9px', borderRadius: 999,
                background: 'rgba(95,208,122,0.14)', border: '1px solid rgba(95,208,122,0.45)',
                color: S.green, fontSize: 10,
              }}>● Online</span>
            )}
            <div style={{
              width: 32, height: 48, transform: 'scale(2.7)', transformOrigin: 'center',
              backgroundImage: `url(/assets/${ch.obrazek})`, backgroundPosition: '0 0',
              backgroundRepeat: 'no-repeat', imageRendering: 'pixelated',
              filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.85))',
            }} />
          </>
        ) : (
          <div style={{ display: 'grid', placeItems: 'center', gap: 10, color: S.muted }}>
            <span style={{
              width: 62, height: 62, borderRadius: '50%', display: 'grid', placeItems: 'center',
              border: `1px dashed ${S.line}`, color: S.gold, fontSize: 28,
            }}>+</span>
            <span style={{ fontFamily: S.serif, fontSize: 17, color: S.text }}>Pusty slot</span>
          </div>
        )}
      </div>

      {/* Kropki */}
      {ile > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7, margin: '9px 0 10px' }}>
          {strony.map((st, i) => (
            <button key={i} onClick={() => { setConfirm(false); setIdx(i); }}
              aria-label={`Postać ${i + 1}`}
              style={{
                width: i === teraz ? 20 : 8, height: 8, borderRadius: 999, padding: 0, cursor: 'pointer',
                background: i === teraz ? S.gold : 'rgba(231,193,88,0.25)',
                border: 'none', transition: 'width .18s, background .18s',
              }} />
          ))}
        </div>
      )}

      {/* Karta z danymi */}
      <div style={{ ...panel, padding: 14, boxSizing: 'border-box' }}>
        {ch ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: S.serif, fontSize: 21, color: S.text }}>{ch.nazwa}</span>
              <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, background: `${color}1f`, border: `1px solid ${color}66`, color }}>{ch.profesja}</span>
              <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, background: 'rgba(231,193,88,0.12)', border: `1px solid ${S.line}`, color: S.gold }}>Lv. {ch.poziom}</span>
              {ch.prestige > 0 && (
                <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, background: 'rgba(192,122,224,0.15)', border: '1px solid rgba(192,122,224,0.45)', color: '#d9a7f0' }}>✦ {ch.prestige}</span>
              )}
            </div>
            {mapNames[ch.mapa] && (
              <div style={{ color: S.muted, fontSize: 12, margin: '8px 0 10px' }}>📍 {mapNames[ch.mapa]}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ color: '#ff8b78', fontSize: 11, width: 26 }}>HP</span>
              <Bar pct={ch.zycie_max > 0 ? Math.round((ch.zycie / ch.zycie_max) * 100) : 0}
                   color="linear-gradient(90deg,#8e2f22,#e5624c)" glow="rgba(229,98,76,0.5)" />
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
                  <button onClick={() => { onDelete(ch.id); setConfirm(false); }} style={{ ...ghostBtn(), flex: 1, minHeight: 46, color: '#ff8b78', borderColor: 'rgba(229,98,76,0.5)' }}>Tak, usuń</button>
                  <button onClick={() => setConfirm(false)} style={{ ...ghostBtn(), flex: 1, minHeight: 46 }}>Anuluj</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => onEnter(ch.id)} disabled={busy} style={{ ...goldBtn(), flex: 1, minHeight: 50, opacity: busy ? 0.6 : 1 }}>
                  ▶ Wejdź do gry
                </button>
                <button onClick={() => setConfirm(true)} title="Usuń postać" aria-label="Usuń postać" style={{ ...ghostBtn(), minHeight: 50, padding: '0 16px' }}>🗑</button>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontFamily: S.serif, fontSize: 19, color: S.text, marginBottom: 4 }}>Utwórz nową postać</div>
            <div style={{ color: S.muted, fontSize: 12, marginBottom: 14 }}>
              Wolne miejsce w drużynie — wybierz klasę i rozpocznij nową historię.
            </div>
            <button onClick={canCreate ? onCreate : undefined} disabled={!canCreate}
              style={{ ...goldBtn(), width: '100%', minHeight: 50, opacity: canCreate ? 1 : 0.5 }}>
              + Stwórz postać
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function EmptySlot({ onCreate, narrow }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onCreate}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', maxWidth: narrow ? 520 : 340, minHeight: narrow ? 92 : 386,
        padding: narrow ? '14px 16px' : 0, boxSizing: 'border-box', borderRadius: 14, cursor: 'pointer',
        background: hover ? 'rgba(231,193,88,0.06)' : 'rgba(6,9,18,0.5)',
        border: `1px dashed ${hover ? S.gold : S.line}`,
        display: 'flex', flexDirection: narrow ? 'row' : 'column',
        alignItems: 'center', justifyContent: narrow ? 'flex-start' : 'center', gap: narrow ? 14 : 12,
        color: S.muted, fontFamily: S.sans, transition: 'all .15s', textAlign: narrow ? 'left' : 'center',
      }}
    >
      <span style={{
        width: narrow ? 46 : 54, height: narrow ? 46 : 54, flexShrink: 0,
        borderRadius: '50%', display: 'grid', placeItems: 'center',
        border: `1px dashed ${hover ? S.gold : S.line}`, color: S.gold, fontSize: narrow ? 22 : 26,
      }}>+</span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: narrow ? 2 : 12, alignItems: narrow ? 'flex-start' : 'center' }}>
        <span style={{ fontFamily: S.serif, fontSize: narrow ? 17 : 19, color: S.text }}>Nowa postać</span>
        <span style={{ fontSize: 12, maxWidth: 190 }}>
          Stwórz nowego bohatera i rozpocznij przygodę
        </span>
      </span>
    </button>
  );
}

export default function CharacterSelect({
  chars = [], me, stats, mapNames = {}, classes = [], onEnterGame, onCreate, onDelete, onLogout, onHome, onAdmin, loading, error,
}) {
  const narrow = useNarrow();
  const medium = useNarrow(1100);
  const slots = Math.max(MAX_SLOTS, chars.length);
  const canCreate = chars.length < MAX_SLOTS;

  const menu = (
    <div style={{ ...panel, padding: 14, width: '100%', alignSelf: 'flex-start', boxShadow: 'none', background: 'rgba(6,9,18,0.45)' }}>
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
      <div style={{ display: narrow ? 'flex' : 'block', gap: 8 }}>
        {me?.isAdmin && (
          <button onClick={onAdmin} style={{
            ...ghostBtn(), flex: 1, width: narrow ? 'auto' : '100%', marginBottom: narrow ? 0 : 8,
            padding: narrow ? '9px 8px' : undefined, fontSize: narrow ? 12 : undefined,
            color: '#ff8b78', borderColor: 'rgba(229,98,76,0.45)',
          }}>★ {narrow ? 'Panel' : 'Panel administratora'}</button>
        )}
        <button onClick={onHome} style={{
          ...ghostBtn(), flex: 1, width: narrow ? 'auto' : '100%', marginBottom: narrow ? 0 : 8,
          padding: narrow ? '9px 8px' : undefined, fontSize: narrow ? 12 : undefined,
        }}>← {narrow ? 'Strona' : 'Strona główna'}</button>
        <button onClick={onLogout} style={{
          ...ghostBtn(), flex: 1, width: narrow ? 'auto' : '100%', color: '#ff8b78', borderColor: 'rgba(229,98,76,0.4)',
          padding: narrow ? '9px 8px' : undefined, fontSize: narrow ? 12 : undefined,
        }}>⎋ {narrow ? 'Wyloguj' : 'Wyloguj się'}</button>
      </div>
    </div>
  );

  return (
    <div className="vh-min" style={{ position: 'relative', color: S.text, fontFamily: S.sans }}>
      <div style={pageBg} />
      <div style={vignette} />

      <header style={{
        position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center',
        padding: narrow ? 'calc(14px + var(--safe-t)) calc(14px + var(--safe-r)) 0 calc(14px + var(--safe-l))' : '18px 28px 0',
      }}>
        <Logo size={narrow ? 18 : 22} sub={narrow ? null : 'ONLINE RPG'} />
        <div style={{ marginLeft: 'auto' }}><OnlineBadge online={stats?.online} /></div>
      </header>

      <main style={{
        position: 'relative', zIndex: 2, maxWidth: 1360, margin: '0 auto',
        padding: narrow ? '16px 14px calc(34px + var(--safe-b))' : '26px 28px 50px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 6 }}><Ornament>Wybierz bohatera</Ornament></div>
        <h1 style={{
          textAlign: 'center', margin: '10px 0 4px', fontFamily: S.serif, fontWeight: 700,
          fontSize: narrow ? 26 : 44, letterSpacing: narrow ? 2 : 6,
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
          {narrow && menu}
          {narrow ? (
            <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
              <Karuzela
                chars={chars} slots={slots} mapNames={mapNames} busy={loading} canCreate={canCreate}
                onEnter={onEnterGame} onDelete={onDelete} onCreate={onCreate}
              />
            </div>
          ) : (
            <div style={{ flex: 1, minWidth: 0 }}>
              <Scena
                chars={chars} slots={slots} classes={classes} mapNames={mapNames}
                busy={loading} canCreate={canCreate} konto={menu}
                onEnter={onEnterGame} onDelete={onDelete} onCreate={onCreate}
              />
            </div>
          )}
        </div>

        {canCreate && !narrow && (
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
