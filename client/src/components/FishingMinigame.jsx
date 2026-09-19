import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:     'linear-gradient(170deg,rgba(3,9,20,0.98),rgba(2,6,15,0.99))',
  card:   'rgba(5,12,26,0.94)',
  border: 'rgba(34,120,210,0.2)',
  gold:   '#E8B84B', goldDim: '#8A6820',
  text:   '#C8D8EC', muted: '#3A5878', dim: '#1A3050',
  green:  '#3DD68C', red: '#F07070', blue: '#5AA8F8',
  cyan:   '#20CBE8', purple: '#A07AF0', orange: '#F09040',
};
const FF = '"Segoe UI",Verdana,sans-serif';
const RARITYC = { pospolita:'#7A8898', rzadka:'#C8940A', epicka:'#9060E0', legendarna:'#E04040' };
const RARITYL = { pospolita:'Pospolita', rzadka:'Rzadka', epicka:'Epicka', legendarna:'Legendarna' };

// ── Komponenty UI ─────────────────────────────────────────────────────────────
function Panel({ children, style = {} }) {
  return <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 14, ...style }}>{children}</div>;
}

function Btn({ children, onClick, disabled, variant = 'gold', style = {} }) {
  const vars = {
    gold:   [T.gold,   'rgba(200,146,40,0.14)', 'rgba(200,146,40,0.4)'],
    green:  [T.green,  'rgba(40,190,110,0.12)',  'rgba(40,190,110,0.35)'],
    red:    [T.red,    'rgba(220,60,60,0.12)',   'rgba(220,60,60,0.35)'],
    blue:   [T.blue,   'rgba(60,140,230,0.12)',  'rgba(60,140,230,0.35)'],
    ghost:  [T.muted,  'rgba(5,12,26,0.4)',      T.border],
    danger: ['#F87171','rgba(220,38,38,0.14)',   'rgba(220,38,38,0.4)'],
  };
  const [col, bg, bd] = vars[variant] || vars.gold;
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      padding: '7px 16px', borderRadius: 5, cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 10, fontFamily: FF, fontWeight: 700, letterSpacing: '0.3px',
      border: `1px solid ${bd}`, background: disabled ? 'rgba(5,12,26,0.3)' : bg,
      color: disabled ? T.dim : col, opacity: disabled ? 0.5 : 1,
      transition: 'all .1s', userSelect: 'none', ...style,
    }}>{children}</button>
  );
}

function Bar({ value, max, colorA, colorB, label, h = 10 }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const color = colorB && pct > 70
    ? `linear-gradient(90deg,${colorA},${colorB})`
    : colorA;
  return (
    <div>
      {label && <div style={{ color: T.muted, fontSize: 7.5, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>}
      <div style={{ height: h, background: 'rgba(0,0,0,0.45)', borderRadius: h, overflow: 'hidden', border: `1px solid ${T.border}` }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: h, transition: 'width .15s', boxShadow: `0 0 6px ${colorA}88` }} />
      </div>
    </div>
  );
}

// ── Animowana spławka ─────────────────────────────────────────────────────────
function Bobber({ bite }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <style>{`
        @keyframes fm-bob   { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-9px) rotate(4deg)} }
        @keyframes fm-shake { 0%,100%{transform:translateX(0) rotate(0)} 20%{transform:translateX(-5px) rotate(-6deg)} 60%{transform:translateX(5px) rotate(6deg)} }
        @keyframes fm-ripple{ 0%{transform:scale(0);opacity:.5} 100%{transform:scale(2.2);opacity:0} }
        @keyframes fm-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(1.12)} }
      `}</style>
      <span style={{
        fontSize: 38, display: 'inline-block',
        animation: bite ? 'fm-shake .25s ease-in-out infinite' : 'fm-bob 1.6s ease-in-out infinite',
        filter: bite ? 'drop-shadow(0 0 8px #3DD68C)' : 'none',
      }}>🪝</span>
      {!bite && [0, 0.55, 1.1].map(d => (
        <div key={d} style={{
          position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
          width: 22, height: 8, borderRadius: '50%',
          border: `1px solid rgba(90,168,248,0.35)`,
          animation: 'fm-ripple 1.8s ease-out infinite',
          animationDelay: `${d}s`,
          pointerEvents: 'none',
        }} />
      ))}
    </div>
  );
}

// ── Pasek napięcia (walka z rybą) ─────────────────────────────────────────────
function TensionMeter({ tension, tensionMax, fishHp, fishHpMax }) {
  const tPct  = tensionMax > 0 ? (tension / tensionMax) * 100 : 0;
  const fPct  = fishHpMax > 0 ? (fishHp  / fishHpMax)  * 100 : 0;
  const tColor = tPct > 80 ? T.red : tPct > 55 ? T.orange : T.green;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ color: T.muted, fontSize: 8, textTransform: 'uppercase', letterSpacing: '.7px' }}>Napięcie żyłki</span>
          <span style={{ color: tColor, fontSize: 9, fontWeight: 700 }}>{Math.round(tPct)}%</span>
        </div>
        <div style={{ height: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 6, overflow: 'hidden', border: `1px solid ${T.border}` }}>
          <div style={{ height: '100%', width: `${tPct}%`, background: `linear-gradient(90deg,${T.green},${tColor})`, transition: 'width .1s', boxShadow: `0 0 8px ${tColor}99` }} />
        </div>
        {tPct > 85 && <div style={{ color: T.red, fontSize: 8, marginTop: 2, animation: 'fm-pulse .5s ease-in-out infinite' }}>⚠ Żyłka prawie pęka! Odpuść!</div>}
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ color: T.muted, fontSize: 8, textTransform: 'uppercase', letterSpacing: '.7px' }}>HP ryby</span>
          <span style={{ color: T.blue, fontSize: 9, fontWeight: 700 }}>{fishHp}/{fishHpMax}</span>
        </div>
        <div style={{ height: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 6, overflow: 'hidden', border: `1px solid ${T.border}` }}>
          <div style={{ height: '100%', width: `${fPct}%`, background: `linear-gradient(90deg,${T.blue},${T.cyan})`, transition: 'width .15s', boxShadow: `0 0 6px ${T.blue}88` }} />
        </div>
      </div>
    </div>
  );
}

// ── Tab: Wędki ────────────────────────────────────────────────────────────────
function EquipTab({ equip, onBuy, msg }) {
  if (!equip) return <div style={{ color: T.muted, fontSize: 10, textAlign: 'center', padding: 20 }}>Ładowanie...</div>;
  const { rods = {}, wedka, lvl, expInLvl, expToNext } = equip;
  const rodKeys = ['bambusowa', 'drewniana', 'stalowa', 'karbonowa', 'mistyczna'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Panel>
        <div style={{ fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 6 }}>Poziom Wędkarski</div>
        <div style={{ color: T.gold, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Poziom {lvl}</div>
        <Bar value={expInLvl} max={expToNext} colorA={T.gold} label={`${expInLvl} / ${expToNext} EXP`} h={8} />
      </Panel>
      {rodKeys.map(key => {
        const r = rods[key]; if (!r) return null;
        const owned   = wedka === key || r.cena === 0;
        const canBuy  = lvl >= r.minLvl && !owned;
        const locked  = lvl < r.minLvl;
        const active  = wedka === key;
        return (
          <Panel key={key} style={{ border: active ? `1px solid ${T.gold}` : `1px solid ${T.border}`, opacity: locked ? 0.5 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: active ? T.gold : T.text, fontSize: 11, fontWeight: 700 }}>
                  {active ? '✦ ' : ''}{r.label}
                  {active && <span style={{ color: T.gold, fontSize: 8, marginLeft: 6 }}>(aktywna)</span>}
                </div>
                <div style={{ color: T.muted, fontSize: 8, marginTop: 3 }}>
                  Czas ↓{Math.round((1 - r.waitMult) * 100)}% · Rarity ×{r.rareMult.toFixed(2)} · Linia {r.lineTough}HP · Wymagany poz. {r.minLvl}
                </div>
              </div>
              {!owned && !locked && (
                <Btn variant="gold" onClick={() => onBuy(key)} style={{ fontSize: 9 }}>
                  {r.cena}g
                </Btn>
              )}
              {owned && <span style={{ color: T.green, fontSize: 9 }}>✔ Posiadasz</span>}
              {locked && <span style={{ color: T.dim, fontSize: 9 }}>🔒 Poz. {r.minLvl}</span>}
            </div>
          </Panel>
        );
      })}
      {msg && <div style={{ color: msg.ok ? T.green : T.red, fontSize: 9, textAlign: 'center' }}>{msg.text}</div>}
    </div>
  );
}

// ── Tab: Historia / Ranking ───────────────────────────────────────────────────
function StatsTab({ stats, ranking }) {
  const [tab, setTab] = useState('hist');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[['hist','Historia'], ['rank','Ranking']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: '5px 0', borderRadius: 5, fontSize: 9, fontWeight: 700, fontFamily: FF,
            background: tab === k ? 'rgba(90,168,248,0.15)' : 'transparent',
            border: `1px solid ${tab === k ? T.blue : T.border}`,
            color: tab === k ? T.blue : T.muted, cursor: 'pointer',
          }}>{l}</button>
        ))}
      </div>
      {tab === 'hist' && (
        <div>
          {(stats?.history || []).length === 0
            ? <div style={{ color: T.muted, fontSize: 9, textAlign: 'center', padding: 16 }}>Brak połowów w historii.</div>
            : (stats.history || []).map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', borderBottom: `1px solid ${T.dim}` }}>
                <span style={{ color: RARITYC[h.rzadkosc] || T.muted, fontSize: 9, fontWeight: 700 }}>{h.ryba_nazwa}</span>
                <span style={{ color: T.gold, fontSize: 8 }}>{h.wartosc}g</span>
              </div>
            ))
          }
        </div>
      )}
      {tab === 'rank' && (
        <div>
          {(ranking || []).map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderBottom: `1px solid ${T.dim}` }}>
              <span style={{ color: i < 3 ? T.gold : T.muted, fontSize: 10, fontWeight: 700, minWidth: 18 }}>{i+1}.</span>
              <span style={{ color: T.text, fontSize: 9, flex: 1 }}>{r.nazwa}</span>
              <span style={{ color: T.cyan, fontSize: 9 }}>{r.ryby_zlapane} ryb</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Główny komponent ──────────────────────────────────────────────────────────
export default function FishingMinigame({ onClose, postac }) {
  const [tab,     setTab]     = useState('catch');
  const [phase,   setPhase]   = useState('idle'); // idle|casting|waiting|bite|fighting|result
  const [session, setSession] = useState(null);
  const [fight,   setFight]   = useState(null); // { fishHp, fishHpMax, tension, tensionMax, fish }
  const [result,  setResult]  = useState(null);
  const [stats,   setStats]   = useState(null);
  const [ranking, setRanking] = useState([]);
  const [equip,   setEquip]   = useState(null);
  const [equipMsg,setEquipMsg]= useState(null);
  const [waitPct, setWaitPct] = useState(0);
  const [busy,    setBusy]    = useState(false);

  const biteTimerRef   = useRef(null);
  const escapeTimerRef = useRef(null);
  const waitRafRef     = useRef(null);
  const waitStartRef   = useRef(0);
  const waitDurRef     = useRef(1);
  const sessionRef     = useRef(null);

  // Załaduj dane
  const loadStats   = useCallback(() => api.fishing.stats().then(s => s && !s.error && setStats(s)).catch(() => {}), []);
  const loadEquip   = useCallback(() => api.fishing.equipment().then(e => e && !e.error && setEquip(e)).catch(() => {}), []);
  const loadRanking = useCallback(() => api.fishing.ranking().then(r => Array.isArray(r) && setRanking(r)).catch(() => {}), []);

  useEffect(() => { loadStats(); loadEquip(); loadRanking(); }, []);

  useEffect(() => {
    sessionRef.current = session;
    return () => {
      clearTimeout(biteTimerRef.current);
      clearTimeout(escapeTimerRef.current);
      cancelAnimationFrame(waitRafRef.current);
    };
  }, [session]);

  // Animacja paska oczekiwania
  const startWaitAnim = (durMs) => {
    waitStartRef.current = performance.now();
    waitDurRef.current   = durMs;
    const tick = () => {
      const el = performance.now() - waitStartRef.current;
      setWaitPct(Math.min(100, (el / durMs) * 100));
      if (el < durMs) waitRafRef.current = requestAnimationFrame(tick);
    };
    waitRafRef.current = requestAnimationFrame(tick);
  };

  // ── RZUĆ WĘDKĘ ───────────────────────────────────────────────────────────
  const doCast = useCallback(async () => {
    if (busy) return;
    setBusy(true); setPhase('casting'); setResult(null); setFight(null); setWaitPct(0);
    const r = await api.fishing.cast({});
    setBusy(false);
    if (!r.ok) { setPhase('idle'); return; }
    setSession(r);
    setPhase('waiting');
    startWaitAnim(r.waitMs);

    // Po waitMs: pokaż "branie"
    biteTimerRef.current = setTimeout(() => {
      cancelAnimationFrame(waitRafRef.current);
      setWaitPct(100);
      setPhase('bite');

      // Jeśli za długo — ryba ucieka
      escapeTimerRef.current = setTimeout(() => {
        api.fishing.cancel({ sessionId: sessionRef.current?.sessionId }).catch(() => {});
        setPhase('result');
        setResult({ ok: false, msg: 'Za późno! Ryba uciekła.' });
      }, r.reactionMs);
    }, r.waitMs);
  }, [busy]);

  // ── ZAREAGUJ NA BRANIE ────────────────────────────────────────────────────
  const doHook = useCallback(async () => {
    if (phase !== 'bite') return;
    clearTimeout(escapeTimerRef.current);
    setBusy(true);
    const r = await api.fishing.catch({ sessionId: session?.sessionId });
    setBusy(false);
    if (r.ok && r.phase === 'fighting') {
      setFight({ fishHp: r.fishHp, fishHpMax: r.fishHpMax, tension: r.tension, tensionMax: r.tensionMax, fish: r.fish, fishDmg: r.fishDmg });
      setPhase('fighting');
    } else if (r.missed) {
      setPhase('result');
      setResult({ ok: false, msg: r.msg || 'Chybiona reakcja!' });
    }
  }, [phase, session]);

  // ── HOLUJ ─────────────────────────────────────────────────────────────────
  const doReel = useCallback(async () => {
    if (phase !== 'fighting' || busy) return;
    const r = await api.fishing.reel({ sessionId: session?.sessionId });
    if (!r.ok) return;
    if (r.caught) {
      setPhase('result');
      setResult({ ok: true, fish: r.fish, expGain: r.expGain, lvlUp: r.lvlUp, bonus: r.bonus, newFishingLvl: r.newFishingLvl });
      loadStats(); loadEquip();
    } else if (r.escaped) {
      setPhase('result');
      setResult({ ok: false, msg: r.msg });
    } else {
      setFight(prev => ({ ...prev, fishHp: r.fishHp, tension: r.tension }));
    }
  }, [phase, session, busy]);

  // ── ODPUŚĆ ────────────────────────────────────────────────────────────────
  const doRelax = useCallback(async () => {
    if (phase !== 'fighting') return;
    const r = await api.fishing.relax({ sessionId: session?.sessionId });
    if (!r.ok) return;
    if (r.escaped) {
      setPhase('result');
      setResult({ ok: false, msg: r.msg });
    } else {
      setFight(prev => ({ ...prev, fishHp: r.fishHp, tension: r.tension }));
    }
  }, [phase, session]);

  // ── SPRZEDAJ ─────────────────────────────────────────────────────────────
  const doSell = useCallback(async () => {
    const r = await api.fishing.sellAll();
    if (r.ok) {
      setResult(prev => ({ ...prev, soldMsg: `Sprzedano ${r.count} ryb za ${r.gold}g!` }));
      loadStats();
    }
  }, []);

  // ── KUP WĘDKĘ ────────────────────────────────────────────────────────────
  const doBuyRod = useCallback(async (wedka) => {
    const r = await api.fishing.upgradeRod({ wedka });
    setEquipMsg({ ok: r.ok, text: r.ok ? `Zakupiono: ${r.label}!` : r.error });
    if (r.ok) { loadEquip(); loadStats(); setTimeout(() => setEquipMsg(null), 3000); }
  }, []);

  const fishRar = fight?.fish?.rzadkosc;
  const resRar  = result?.fish?.rzadkosc;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', bottom: 76, left: '50%', transform: 'translateX(-50%)',
      width: 320, maxHeight: '80vh', zIndex: 200, fontFamily: FF,
      background: T.bg, border: `1px solid ${T.border}`,
      borderRadius: 12, boxShadow: '0 12px 50px rgba(0,0,0,0.92)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div style={{ padding: '9px 14px', borderBottom: `1px solid ${T.border}`, background: 'rgba(3,8,18,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 15 }}>🎣</span>
          <span style={{ color: T.gold, fontSize: 11, fontWeight: 700 }}>Wędkarstwo</span>
          {stats && <span style={{ color: T.muted, fontSize: 8 }}>Złapanych: <b style={{ color: T.blue }}>{stats.ryby_zlapane || 0}</b></span>}
          {stats?.zloty_haczyk ? <span style={{ color: T.gold, fontSize: 8 }}>✦</span> : null}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 16 }}>✕</button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        {[['catch','🎣 Łowienie'], ['equip','🎽 Wędka'], ['hist','📋 Statystyki']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: '6px 0', fontSize: 8, fontWeight: 700, fontFamily: FF,
            background: tab === k ? 'rgba(90,168,248,0.1)' : 'transparent',
            border: 'none',
            borderBottom: tab === k ? `2px solid ${T.blue}` : '2px solid transparent',
            color: tab === k ? T.blue : T.muted, cursor: 'pointer',
          }}>{l}</button>
        ))}
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>

        {/* ─── TAB: ŁOWIENIE ─── */}
        {tab === 'catch' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* IDLE */}
            {phase === 'idle' && (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <Bobber bite={false} />
                {stats && (
                  <div style={{ color: T.muted, fontSize: 9 }}>
                    Wędka: <b style={{ color: T.gold }}>{stats.rodLabel || 'Bambusowa'}</b>
                    {' · '}Poz. <b style={{ color: T.blue }}>{stats.fishingLvl || 1}</b>
                    {stats.bagFish > 0 && <> · W plecaku: <b style={{ color: T.green }}>{stats.bagFish} ryb ({stats.bagValue}g)</b></>}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Btn onClick={doCast} variant="gold" style={{ fontSize: 11, padding: '9px 22px' }}>🎣 Zarzuć</Btn>
                  {stats?.bagFish > 0 && <Btn onClick={doSell} variant="green">💰 Sprzedaj ryby</Btn>}
                </div>
              </div>
            )}

            {/* CASTING */}
            {phase === 'casting' && (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎣</div>
                <div style={{ color: T.goldDim, fontSize: 10 }}>Zarzucam...</div>
              </div>
            )}

            {/* WAITING */}
            {phase === 'waiting' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
                <Bobber bite={false} />
                <div style={{ color: T.muted, fontSize: 9 }}>Czekaj na branie...</div>
                <div style={{ width: '100%' }}>
                  <Bar value={waitPct} max={100} colorA={T.blue} label="Oczekiwanie" h={9} />
                </div>
                <Btn onClick={async () => { clearTimeout(biteTimerRef.current); cancelAnimationFrame(waitRafRef.current); await api.fishing.cancel({ sessionId: session?.sessionId }); setPhase('idle'); }} variant="ghost" style={{ fontSize: 8 }}>Anuluj</Btn>
              </div>
            )}

            {/* BITE */}
            {phase === 'bite' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                <Bobber bite={true} />
                <div style={{ color: T.green, fontSize: 15, fontWeight: 700, animation: 'fm-pulse .4s ease-in-out infinite' }}>⬆ BRANIE!</div>
                <Btn onClick={doHook} variant="green" style={{ fontSize: 13, padding: '12px 40px', width: '100%' }} disabled={busy}>
                  🎣 HOLUJ!
                </Btn>
                <div style={{ color: T.muted, fontSize: 8 }}>Kliknij natychmiast!</div>
              </div>
            )}

            {/* FIGHTING */}
            {phase === 'fighting' && fight && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 28 }}>🐟</span>
                  <div style={{ color: RARITYC[fishRar] || T.muted, fontSize: 11, fontWeight: 700 }}>
                    {fight.fish?.nazwa}
                  </div>
                  <div style={{ color: T.muted, fontSize: 8 }}>{RARITYL[fishRar] || ''}</div>
                </div>
                <TensionMeter
                  tension={fight.tension} tensionMax={fight.tensionMax}
                  fishHp={fight.fishHp} fishHpMax={fight.fishHpMax}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn onClick={doReel} variant="blue" style={{ flex: 2, fontSize: 11, padding: '10px 0' }}>
                    💪 HOLUJ
                  </Btn>
                  <Btn onClick={doRelax} variant="ghost" style={{ flex: 1, fontSize: 10, padding: '10px 0' }}>
                    😮‍💨 Odpuść
                  </Btn>
                </div>
                <div style={{ color: T.dim, fontSize: 8, textAlign: 'center' }}>
                  Holuj aby wciągać rybę · Odpuść gdy napięcie rośnie
                </div>
              </div>
            )}

            {/* RESULT */}
            {phase === 'result' && result && (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                {result.ok && result.fish ? (
                  <>
                    <div>
                      <span style={{ fontSize: 42 }}>🐟</span>
                      <div style={{ color: RARITYC[resRar] || T.muted, fontSize: 14, fontWeight: 700, marginTop: 6 }}>{result.fish.nazwa}</div>
                      <div style={{ color: RARITYC[resRar] || T.muted, fontSize: 9 }}>{RARITYL[resRar] || ''} · {result.fish.wartosc}g</div>
                    </div>
                    {result.lvlUp && <div style={{ color: T.gold, fontSize: 10, fontWeight: 700 }}>⭐ Poziom wędkarski {result.newFishingLvl}!</div>}
                    {result.bonus && <div style={{ color: T.purple, fontSize: 10 }}>{result.bonus.label} +{result.bonus.gold}g</div>}
                    {result.soldMsg && <div style={{ color: T.green, fontSize: 9 }}>{result.soldMsg}</div>}
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 36 }}>😞</span>
                    <div style={{ color: T.red, fontSize: 11, fontWeight: 700 }}>{result.msg}</div>
                    {result.soldMsg && <div style={{ color: T.green, fontSize: 9 }}>{result.soldMsg}</div>}
                  </>
                )}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 4 }}>
                  <Btn onClick={doCast} variant="gold">🎣 Ponów</Btn>
                  {stats?.bagFish > 0 && <Btn onClick={doSell} variant="green" style={{ fontSize: 9 }}>💰 Sprzedaj</Btn>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: WĘDKA ─── */}
        {tab === 'equip' && <EquipTab equip={equip} onBuy={doBuyRod} msg={equipMsg} />}

        {/* ─── TAB: STATYSTYKI ─── */}
        {tab === 'hist' && <StatsTab stats={stats} ranking={ranking} />}
      </div>
    </div>
  );
}
