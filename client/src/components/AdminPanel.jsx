/**
 * AdminPanel — in-game floating admin panel (modal overlay)
 * Used by admin players while already logged in to the game.
 */
import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import AssetsTab from './AssetsTab';
import AdminApp from './admin/AdminApp';
import AdminOverview from './admin/AdminOverview';

// ── Design tokens ─────────────────────────────────────────────────────────────
// Ta sama paleta co reszta interfejsu: ciemny kamień, brąz, złoto
const T = {
  bg:      'linear-gradient(180deg,#15120e,#0b0907)',
  surface: 'rgba(24,20,15,0.98)',
  card:    'linear-gradient(180deg,#1a1611,#100d0a)',
  border:  'rgba(122,95,42,0.6)',
  borderH: '#e7c158',
  gold:    '#f7e3a4', goldDim: '#e7c158',
  text:    '#e8e2d4', muted: '#9a9182', dim: '#6b6456',
  red: '#ff7a68', green: '#5fd07a', blue: '#6fb2ff',
  amber: '#f0a24b', purple: '#c79bff', cyan: '#5ec8ff',
};
const FF = "'Trebuchet MS', Verdana, sans-serif";
const FS = "'Cinzel','Palatino Linotype',Palatino,serif";

const RCOLOR = { GameAdmin: '#EF4444', GameMaster: '#F59E0B', Moderator: '#60A5FA', Gracz: T.dim };

// ── Shared micro-components ───────────────────────────────────────────────────
function Chip({ color, children }) {
  return <span style={{ padding: '1px 8px', borderRadius: 9999, background: `${color}18`, border: `1px solid ${color}44`, color, fontSize: 8, fontWeight: 'bold', whiteSpace: 'nowrap' }}>{children}</span>;
}

function Toast({ msg, ok }) {
  if (!msg) return null;
  const c = ok ? T.green : T.red;
  return (
    <div style={{ padding: '7px 12px', borderRadius: 7, fontSize: 10, background: ok ? 'rgba(6,40,16,0.8)' : 'rgba(50,4,4,0.8)', border: `1px solid ${c}44`, color: c, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <span>{ok ? '✓' : '✕'}</span> {msg}
    </div>
  );
}

function SInput({ value, onChange, placeholder, type = 'text', style = {} }) {
  const [foc, setFoc] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      style={{ padding: '7px 10px', background: 'rgba(6,10,4,0.8)', color: T.text, border: `1px solid ${foc ? T.borderH : T.border}`, borderRadius: 5, fontSize: 10, outline: 'none', fontFamily: FF, width: '100%', boxSizing: 'border-box', transition: 'border-color .12s', ...style }}
    />
  );
}

function SBtn({ children, onClick, variant = 'default', disabled, style = {}, wide }) {
  const v = { default: [T.gold, 'linear-gradient(180deg,#4a3818,#241a0b)', T.borderH], danger: [T.red, 'rgba(50,4,4,0.7)', 'rgba(239,68,68,0.4)'], success: [T.green, 'rgba(6,40,20,0.7)', 'rgba(34,197,94,0.4)'], ghost: [T.muted, 'rgba(8,13,5,0.4)', T.border], blue: [T.blue, 'rgba(29,78,216,0.2)', 'rgba(59,130,246,0.4)'] }[variant] || [];
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: '5px 12px', borderRadius: 5, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 10, fontWeight: 'bold', border: `1px solid ${v[2]}`, background: disabled ? 'rgba(6,10,4,0.3)' : v[1], color: disabled ? T.dim : v[0], opacity: disabled ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', transition: 'all .12s', fontFamily: FF, width: wide ? '100%' : undefined, justifyContent: wide ? 'center' : undefined, ...style }}>{children}</button>
  );
}

function SCard({ children, style = {} }) {
  return <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', ...style }}>{children}</div>;
}

function SHead({ icon, title, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', background: T.surface, borderBottom: `1px solid ${T.border}` }}>
      {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
      <span style={{ fontSize: 8, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', color: color || T.goldDim, fontFamily: FS }}>{title}</span>
    </div>
  );
}

function SLabel({ children }) {
  return <div style={{ fontSize: 8, color: T.dim, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontFamily: FS }}>{children}</div>;
}

function StatBadge({ label, value, color }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 7, padding: '8px 10px', textAlign: 'center' }}>
      <div style={{ fontSize: 7, color: T.dim, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontFamily: FS }}>{label}</div>
      <div style={{ color: color || T.gold, fontSize: 18, fontWeight: 'bold', lineHeight: 1, fontFamily: FS }}>{value ?? '–'}</div>
    </div>
  );
}

// ── STATS TAB ─────────────────────────────────────────────────────────────────
function StatsTab({ myPostac }) {
  const [stats,  setStats]  = useState(null);
  const [status, setStatus] = useState(null);
  const [maps,   setMaps]   = useState([]);
  const [tpMap,  setTpMap]  = useState('');
  const [tpX,    setTpX]    = useState('');
  const [tpY,    setTpY]    = useState('');
  const [flash,  setFlash]  = useState(null);

  useEffect(() => {
    api.adminDash.stats().then(setStats);
    api.adminDash.status().then(setStatus);
    api.adminDash.maps().then(r => Array.isArray(r) && setMaps(r));
  }, []);

  const msg = (m, ok = true) => { setFlash({ m, ok }); setTimeout(() => setFlash(null), 3000); };
  const fmt = s => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m}m`; };
  const maint = status?.config?.maintenance === '1' || status?.config?.maintenance === true;

  if (!stats) return <div style={{ padding: 20, color: T.muted, textAlign: 'center', fontSize: 10 }}>Ładowanie...</div>;

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {flash && <Toast msg={flash.m} ok={flash.ok} />}

      {/* Server pill */}
      {status && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`, flexWrap: 'wrap' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: maint ? T.red : T.green, boxShadow: `0 0 6px ${maint ? T.red : T.green}` }} />
          <span style={{ color: T.gold, fontWeight: 'bold', fontSize: 11, fontFamily: FS }}>{status.config?.name || 'Veldoria'}</span>
          {maint && <Chip color={T.red}>KONSERWACJA</Chip>}
          <span style={{ color: T.muted, fontSize: 9, marginLeft: 'auto' }}>⏱ {fmt(status.uptime || 0)} · 💾 {status.memMB || '?'}MB</span>
          <span style={{ color: T.green, fontWeight: 'bold', fontSize: 10 }}>⚡ {status.online || 0} online</span>
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7 }}>
        <StatBadge label="Online"    value={stats.online}   color={T.green} />
        <StatBadge label="Konta"     value={stats.accounts} color={T.blue} />
        <StatBadge label="Postacie"  value={stats.total}    color={T.gold} />
        <StatBadge label="Bany"      value={stats.banned}   color={T.red} />
        <StatBadge label="Moby"      value={stats.mobs}     color={T.amber} />
        <StatBadge label="Mapy"      value={stats.maps}     color={T.cyan} />
        <StatBadge label="Wiadomości" value={stats.msgs}    color={T.muted} />
        <StatBadge label="Itemy"     value={stats.items}    color={T.purple} />
      </div>

      {/* Multipliers */}
      {status && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
          {[['EXP ×', status.config?.xp || 1, T.cyan], ['Loot ×', status.config?.loot || 1, T.amber], ['PvP', status.config?.pvp === '1' ? 'ON' : 'OFF', status.config?.pvp === '1' ? T.red : T.muted]].map(([l, v, c]) => (
            <div key={l} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, padding: '7px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 7, color: T.dim, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: FS }}>{l}</div>
              <div style={{ color: c, fontSize: 14, fontWeight: 'bold', fontFamily: FS }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Teleport self */}
      <SCard>
        <SHead icon="⚡" title="Teleportuj siebie" color={T.cyan} />
        <div style={{ padding: '10px 12px', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '0 0 auto', minWidth: 130 }}>
            <SLabel>Mapa</SLabel>
            <select value={tpMap} onChange={e => setTpMap(e.target.value)}
              style={{ width: '100%', padding: '7px 8px', background: 'rgba(6,10,4,0.8)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 9, outline: 'none', fontFamily: FF }}>
              <option value="">— wybierz —</option>
              {maps.map(m => <option key={m.id} value={m.id}>#{m.id} {m.nazwa}</option>)}
            </select>
          </div>
          <div><SLabel>X</SLabel><SInput type="number" value={tpX} onChange={e => setTpX(e.target.value)} placeholder="X" style={{ width: 60 }} /></div>
          <div><SLabel>Y</SLabel><SInput type="number" value={tpY} onChange={e => setTpY(e.target.value)} placeholder="Y" style={{ width: 60 }} /></div>
          <SBtn variant="blue" onClick={async () => {
            if (!tpMap) { msg('Wybierz mapę', false); return; }
            const r = await api.adminDash.teleportSelf(parseInt(tpMap), parseInt(tpX) || 35, parseInt(tpY) || 35);
            r.ok ? msg('Teleportowano! Wyjdź z panelu.') : msg(r.error || 'Błąd', false);
          }}>⚡ Teleportuj</SBtn>
        </div>
      </SCard>
    </div>
  );
}

// ── PLAYERS TAB ───────────────────────────────────────────────────────────────
function PlayersTab({ myId }) {
  const [players,     setPlayers]     = useState([]);
  const [sel,         setSel]         = useState(null);
  const [search,      setSearch]      = useState('');
  const [rank,        setRank]        = useState('Gracz');
  const [gold,        setGold]        = useState('');
  const [level,       setLevel]       = useState('');
  const [prestige,    setPrestige]    = useState('');
  const [selKlasa,    setSelKlasa]    = useState('');
  const [itemSearch,  setItemSearch]  = useState('');
  const [itemResults, setItemResults] = useState([]);
  const [selItem,     setSelItem]     = useState(null);
  const [tpMap,       setTpMap]       = useState('');
  const [tpX,         setTpX]         = useState('');
  const [tpY,         setTpY]         = useState('');
  const [flash,       setFlash]       = useState(null);

  const load = useCallback(async q => { const r = await api.adminDash.players(q); Array.isArray(r) && setPlayers(r); }, []);
  useEffect(() => { load(''); }, [load]);
  const msg = (m, ok = true) => { setFlash({ m, ok }); setTimeout(() => setFlash(null), 4000); };
  const safeCall = async (fn) => { try { return await fn(); } catch (e) { msg(e?.message || 'Błąd połączenia', false); return null; } };

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* List */}
      <div style={{ width: 195, flexShrink: 0, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 8, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: T.dim }}>🔍</span>
            <input value={search} onChange={e => { setSearch(e.target.value); load(e.target.value); }}
              placeholder="Szukaj gracza..."
              style={{ width: '100%', padding: '6px 8px 6px 26px', background: 'rgba(6,10,4,0.8)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 9, outline: 'none', fontFamily: FF, boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
          {players.map(pl => (
            <div key={pl.id} onClick={() => { setSel(pl); setRank(pl.ranga); setSelKlasa(''); setSelItem(null); setItemResults([]); }}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', cursor: 'pointer', background: sel?.id === pl.id ? 'rgba(74,122,42,0.12)' : 'transparent', borderBottom: `1px solid ${T.border}1A`, borderLeft: `3px solid ${sel?.id === pl.id ? T.goldDim : 'transparent'}`, transition: 'background .1s' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: pl.zalogowany ? T.green : '#374151', flexShrink: 0, boxShadow: pl.zalogowany ? `0 0 4px ${T.green}` : 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: T.text, fontSize: 10, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.nazwa}</div>
                <div style={{ fontSize: 8 }}><span style={{ color: RCOLOR[pl.ranga] || T.muted }}>{pl.ranga}</span><span style={{ color: T.dim }}> · {pl.poziom}</span></div>
              </div>
              {pl.ban && <span style={{ color: T.red, fontSize: 7, border: `1px solid ${T.red}44`, borderRadius: 3, padding: '1px 4px' }}>BAN</span>}
            </div>
          ))}
          {players.length === 0 && <div style={{ color: T.dim, textAlign: 'center', padding: 16, fontSize: 9 }}>Brak graczy</div>}
        </div>
      </div>

      {/* Detail */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8, WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
        {/* Sticky toast — widoczny nawet gdy panel jest przewinięty */}
        {flash && (
          <div style={{ position: 'sticky', top: 0, zIndex: 20 }}>
            <Toast msg={flash.m} ok={flash.ok} />
          </div>
        )}
        {!sel ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: T.dim, gap: 8 }}>
            <span style={{ fontSize: 32, opacity: 0.2 }}>👤</span>
            <span style={{ fontSize: 10 }}>Wybierz gracza z listy</span>
          </div>
        ) : (
          <>
            {/* Player card */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', background: T.surface, borderRadius: 8, border: `1px solid ${T.border}` }}>
              <div style={{ width: 28, height: 42, flexShrink: 0, backgroundImage: `url(/assets/${sel.obrazek || 'avatar/m_bd28.gif'})`, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', border: `1px solid ${T.border}`, borderRadius: 3, background: `rgba(6,10,4,0.8) url(/assets/${sel.obrazek || 'avatar/m_bd28.gif'}) no-repeat` }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                  <span style={{ color: T.gold, fontWeight: 'bold', fontSize: 12, fontFamily: FS }}>{sel.nazwa}</span>
                  <Chip color={RCOLOR[sel.ranga] || T.muted}>{sel.ranga}</Chip>
                  {sel.ban && <Chip color={T.red}>⛔ BAN</Chip>}
                </div>
                <div style={{ color: T.muted, fontSize: 9, marginTop: 2 }}>ID:{sel.id} · {sel.profesja} · poz.{sel.poziom}</div>
                <div style={{ color: T.dim, fontSize: 8, marginTop: 1 }}>HP:{sel.zycie}/{sel.zycie_max} · 💰{sel.zloto}g · 📍Mapa {sel.mapa} ({sel.x},{sel.y})</div>
              </div>
            </div>

            {/* Rank */}
            <SCard>
              <SHead icon="🎖" title="Zmień rangę" />
              <div style={{ padding: '8px 10px', display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                {['Gracz', 'Moderator', 'GameMaster', 'GameAdmin'].map(r => (
                  <button key={r} onClick={() => setRank(r)} style={{ padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 9, fontWeight: 'bold', fontFamily: FF, background: rank === r ? `${RCOLOR[r] || T.gold}1A` : 'rgba(6,10,4,0.5)', border: `1px solid ${rank === r ? (RCOLOR[r] || T.gold) + '55' : T.border}`, color: rank === r ? (RCOLOR[r] || T.gold) : T.muted, transition: 'all .1s' }}>{r}</button>
                ))}
                <SBtn onClick={async () => {
                  const r = await api.adminDash.setRank(sel.id, rank);
                  r.ok ? (setSel(s => ({ ...s, ranga: rank })), msg('Ranga zmieniona!'), load(search)) : msg(r.error, false);
                }} disabled={sel.id === myId} style={{ marginLeft: 'auto' }}>✓ Ustaw</SBtn>
              </div>
            </SCard>

            {/* Class */}
            {(() => {
              const KLASY = [
                { id: 'Wojownik',       color: '#C0392B' },
                { id: 'Paladyn',        color: '#F39C12' },
                { id: 'Mag',            color: '#8E44AD' },
                { id: 'Lowca',          color: '#27AE60' },
                { id: 'Tropiciel',      color: '#16A085' },
                { id: 'Tancerz Ostrzy', color: '#E74C3C' },
              ];
              const cur = selKlasa || sel.profesja;
              return (
                <SCard>
                  <SHead icon="⚔" title="Zmień klasę" color="#F59E0B" />
                  <div style={{ padding: '8px 10px', display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                    {KLASY.map(k => (
                      <button key={k.id} onClick={() => setSelKlasa(k.id)}
                        style={{ padding: '4px 9px', borderRadius: 5, cursor: 'pointer', fontSize: 9, fontWeight: 'bold', fontFamily: FF, background: cur === k.id ? `${k.color}22` : 'rgba(6,10,4,0.5)', border: `1px solid ${cur === k.id ? k.color + '66' : T.border}`, color: cur === k.id ? k.color : T.muted, transition: 'all .1s' }}>
                        {k.id}
                      </button>
                    ))}
                    <SBtn onClick={async () => {
                      const k = selKlasa || sel.profesja;
                      const r = await safeCall(() => api.adminDash.setClass(sel.id, k));
                      if (!r) return;
                      r.ok ? (setSel(s => ({ ...s, profesja: k })), setSelKlasa(''), msg(`Klasa: ${k}!`), load(search)) : msg(r.error || 'Błąd', false);
                    }} disabled={!selKlasa || selKlasa === sel.profesja} style={{ marginLeft: 'auto' }}>✓ Zmień</SBtn>
                  </div>
                </SCard>
              );
            })()}

            {/* Resources */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
              <SCard>
                <SHead icon="💰" title="Dodaj złoto" color="#FCD34D" />
                <div style={{ padding: '8px 10px', display: 'flex', gap: 5 }}>
                  <SInput type="number" value={gold} onChange={e => setGold(e.target.value)} placeholder="Ilość" style={{ flex: 1 }} />
                  <SBtn onClick={async () => { const r = await api.adminDash.giveGold(sel.id, parseInt(gold) || 0); r.ok ? (msg(`+${gold}g!`), setGold('')) : msg(r.error, false); }}>+</SBtn>
                </div>
              </SCard>
              <SCard>
                <SHead icon="⬆" title="Poziom" color={T.cyan} />
                <div style={{ padding: '8px 10px', display: 'flex', gap: 5 }}>
                  <SInput type="number" value={level} onChange={e => setLevel(e.target.value)} placeholder="1–500" style={{ flex: 1 }} />
                  <SBtn onClick={async () => { const r = await api.adminDash.setLevel(sel.id, parseInt(level) || 1); r.ok ? (setSel(s => ({ ...s, poziom: parseInt(level) })), msg(`Poz.${level}!`), setLevel(''), load(search)) : msg(r.error, false); }}>Set</SBtn>
                </div>
              </SCard>
              <SCard>
                <SHead icon="✦" title="Prestige" color="#22D3EE" />
                <div style={{ padding: '8px 10px', display: 'flex', gap: 5 }}>
                  <SInput type="number" value={prestige} onChange={e => setPrestige(e.target.value)} placeholder={`0–20 (${sel.prestige ?? '?'})`} style={{ flex: 1 }} />
                  <SBtn onClick={async () => { const p = parseInt(prestige); const r = await safeCall(() => api.adminDash.setPrestige(sel.id, p || 0)); if (!r) return; r.ok ? (setSel(s => ({ ...s, prestige: p || 0 })), msg(`✦ Prestige ${p}!`), setPrestige(''), load(search)) : msg(r.error || 'Błąd', false); }}>Set</SBtn>
                </div>
              </SCard>
            </div>

            {/* Give item */}
            <SCard>
              <SHead icon="🎒" title="Przyznaj przedmiot" color={T.purple} />
              <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  <SInput value={itemSearch} onChange={e => setItemSearch(e.target.value)}
                    placeholder="Szukaj przedmiotu…"
                    onKeyDown={async e => { if (e.key === 'Enter') { const r = await api.adminDash.items(itemSearch); Array.isArray(r) && setItemResults(r); } }}
                    style={{ flex: 1 }} />
                  <SBtn onClick={async () => { const r = await api.adminDash.items(itemSearch); Array.isArray(r) && setItemResults(r); }}>🔍</SBtn>
                </div>
                {itemResults.length > 0 && (
                  <div style={{ maxHeight: 110, overflowY: 'auto', border: `1px solid ${T.border}`, borderRadius: 5 }}>
                    {itemResults.map(it => (
                      <div key={it.id} onClick={() => setSelItem(it)}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 9px', cursor: 'pointer', borderBottom: `1px solid ${T.border}1A`, background: selItem?.id === it.id ? 'rgba(139,92,246,0.12)' : 'transparent', WebkitTapHighlightColor: 'transparent' }}>
                        <span style={{ color: { unique:'#DAA520', heroic:'#2090FE', legendary:'#FA9A20', artefact:'#f0032a', upgraded:'#FFD700' }[it.klasa] || T.muted, fontSize: 9, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.nazwa}</span>
                        <span style={{ color: T.dim, fontSize: 8, flexShrink: 0 }}>{it.typ}</span>
                        <span style={{ color: T.dim, fontSize: 8, flexShrink: 0 }}>poz.{it.wym_poziom}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selItem && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: T.text, fontSize: 9, flex: 1 }}>✓ {selItem.nazwa}</span>
                    <SBtn variant="default" onClick={async () => {
                      const r = await api.adminDash.giveItem(sel.id, selItem.id);
                      r.ok ? (msg(`Przyznano: ${selItem.nazwa}!`), setSelItem(null)) : msg(r.error || 'Błąd', false);
                    }}>🎒 Przyznaj</SBtn>
                    <SBtn variant="ghost" onClick={() => setSelItem(null)} style={{ padding: '4px 7px' }}>✕</SBtn>
                  </div>
                )}
              </div>
            </SCard>

            {/* Teleport */}
            <SCard>
              <SHead icon="⚡" title="Teleportuj" color={T.cyan} />
              <div style={{ padding: '8px 10px', display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <SInput type="number" value={tpMap} onChange={e => setTpMap(e.target.value)} placeholder="Mapa" style={{ width: 58, flex: 'none' }} />
                <SInput type="number" value={tpX} onChange={e => setTpX(e.target.value)} placeholder="X" style={{ width: 50, flex: 'none' }} />
                <SInput type="number" value={tpY} onChange={e => setTpY(e.target.value)} placeholder="Y" style={{ width: 50, flex: 'none' }} />
                <SBtn variant="blue" onClick={async () => { const r = await api.adminDash.teleport(sel.id, parseInt(tpMap) || 1, parseInt(tpX) || 35, parseInt(tpY) || 35); r.ok ? msg('Teleportowano!') : msg(r.error, false); }}>⚡ Tp</SBtn>
                <SBtn onClick={async () => { const r = await api.adminDash.gotoPlayer(sel.id); r.ok ? msg(`Idź do ${sel.nazwa}`) : msg(r.error, false); }} style={{ background: 'rgba(6,60,30,0.3)', borderColor: 'rgba(34,197,94,0.4)', color: T.green }}>🧭</SBtn>
                <SBtn onClick={async () => { const r = await api.adminDash.pullPlayer(sel.id); r.ok ? msg(`Przyciągnięto`) : msg(r.error, false); }} style={{ background: 'rgba(80,40,4,0.3)', borderColor: 'rgba(249,115,22,0.4)', color: '#FB923C' }}>🧲</SBtn>
              </div>
            </SCard>

            {/* Quick actions */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <SBtn variant="success" onClick={async () => { const r = await api.adminDash.healPlayer(sel.id); r.ok ? msg('Uleczono!') : msg(r.error || 'Błąd leczenia', false); }}>❤ Ulecz</SBtn>
              <SBtn variant="ghost"   onClick={async () => { const r = await api.adminDash.kickPlayer(sel.id); r.ok && (msg('Kicknięto!'), load(search)); }}>🦵 Kick</SBtn>
              {!sel.ban ? (
                <SBtn variant="danger" disabled={sel.id === myId} onClick={async () => {
                  const reason = prompt('Powód bana:') || '';
                  const r = await api.adminDash.banPlayer(sel.id, reason);
                  r.ok && (setSel(s => ({ ...s, ban: 1 })), msg('Zbanowano!'), load(search));
                }}>⛔ Zbanuj</SBtn>
              ) : (
                <SBtn variant="success" onClick={async () => { const r = await api.adminDash.unbanPlayer(sel.id); r.ok && (setSel(s => ({ ...s, ban: 0 })), msg('Odbanowano!'), load(search)); }}>✓ Odbanuj</SBtn>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── MOBS TAB ──────────────────────────────────────────────────────────────────
function MobsTab({ currentMap }) {
  const [mobs,  setMobs]  = useState([]);
  const [flash, setFlash] = useState(null);
  const load = () => fetch(`/api/admin/mobs/${currentMap}`, { credentials: 'include' }).then(r => r.json()).then(setMobs);
  useEffect(() => { load(); }, [currentMap]);
  const msg = (m, ok = true) => { setFlash({ m, ok }); setTimeout(() => setFlash(null), 2500); };
  const alive = mobs.filter(m => m.zycie > 0).length;

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {flash && <Toast msg={flash.m} ok={flash.ok} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ color: T.muted, fontSize: 10 }}>Mapa {currentMap} · <span style={{ color: T.green }}>{alive}</span> żywe · <span style={{ color: T.red }}>{mobs.length - alive}</span> martwe</span>
        <SBtn onClick={async () => { await api.adminDash.resetMobs(currentMap); msg('Respawn mapy!'); load(); }}>↺ Respawn mapy</SBtn>
        <SBtn variant="danger" onClick={async () => { if (!window.confirm('Respawn WSZYSTKICH mobów?')) return; await api.adminDash.resetAllMobs(); msg('Globalny respawn!'); load(); }}>⚡ Globalny</SBtn>
      </div>
      <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
        {mobs.map(mob => {
          const pct = mob.zycie_max > 0 ? mob.zycie / mob.zycie_max : 0;
          const hc  = pct > 0.5 ? T.green : pct > 0 ? T.amber : T.red;
          return (
            <div key={mob.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 8px', background: T.card, borderRadius: 6, border: `1px solid ${T.border}` }}>
              <div style={{ width: 18, height: 18, backgroundImage: `url(/assets/${mob.obrazek})`, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: mob.zycie > 0 ? T.text : T.dim, fontSize: 10 }}>{mob.nazwa}</span>
                  <span style={{ color: T.dim, fontSize: 8 }}>poz.{mob.poziom} ({mob.x},{mob.y})</span>
                </div>
                <div style={{ height: 3, background: 'rgba(0,0,0,0.4)', borderRadius: 2, marginTop: 3, width: '50%' }}>
                  <div style={{ width: `${pct * 100}%`, height: '100%', background: hc, borderRadius: 2, transition: 'width .3s' }} />
                </div>
              </div>
              <span style={{ fontSize: 8, color: T.muted }}>{mob.zycie}/{mob.zycie_max}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SERVER CONFIG TAB ─────────────────────────────────────────────────────────
function ServerTab() {
  const [cfg,   setCfg]   = useState([]);
  const [vals,  setVals]  = useState({});
  const [flash, setFlash] = useState(null);
  const QUICK = ['xp_multiplier', 'loot_chance', 'respawn_multiplier', 'maintenance_mode', 'pvp_enabled', 'registration_enabled', 'announcement'];

  useEffect(() => {
    api.adminDash.config().then(r => { if (Array.isArray(r)) { setCfg(r); const v = {}; r.forEach(c => v[c.key] = c.value); setVals(v); } });
  }, []);

  const msg = (m, ok = true) => { setFlash({ m, ok }); setTimeout(() => setFlash(null), 3000); };
  const quick = cfg.filter(c => QUICK.includes(c.key));

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1 }}>
      {flash && <Toast msg={flash.m} ok={flash.ok} />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {quick.map(c => (
          <div key={c.key} style={{ gridColumn: c.type === 'textarea' ? '1/-1' : 'auto' }}>
            <SLabel>{c.label}</SLabel>
            {c.type === 'boolean' ? (
              <div style={{ display: 'flex', gap: 5 }}>
                {[['1', 'Tak', T.green], ['0', 'Nie', T.red]].map(([v, l, col]) => (
                  <button key={v} onClick={() => setVals(p => ({ ...p, [c.key]: v }))} style={{ padding: '5px 14px', borderRadius: 5, cursor: 'pointer', fontSize: 9, fontWeight: 'bold', fontFamily: FF, background: vals[c.key] === v ? `${col}18` : 'rgba(6,10,4,0.5)', border: `1px solid ${vals[c.key] === v ? col + '55' : T.border}`, color: vals[c.key] === v ? col : T.muted }}>{l}</button>
                ))}
              </div>
            ) : c.type === 'textarea' ? (
              <textarea value={vals[c.key] || ''} onChange={e => setVals(p => ({ ...p, [c.key]: e.target.value }))} rows={3}
                style={{ width: '100%', padding: '7px 9px', background: 'rgba(6,10,4,0.8)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 10, outline: 'none', resize: 'vertical', fontFamily: FF, boxSizing: 'border-box' }} />
            ) : (
              <SInput type={c.type === 'number' ? 'number' : 'text'} value={vals[c.key] || ''} onChange={e => setVals(p => ({ ...p, [c.key]: e.target.value }))} />
            )}
          </div>
        ))}
      </div>
      <SBtn variant="success" wide style={{ padding: '10px', fontSize: 11 }} onClick={async () => {
        const r = await api.adminDash.saveConfig(vals);
        r.ok ? msg('Ustawienia zapisane!') : msg(r.error, false);
      }}>✓ Zapisz ustawienia</SBtn>
    </div>
  );
}

// ── CHAT TAB ──────────────────────────────────────────────────────────────────
function ChatTab() {
  const [msgs,  setMsgs]  = useState([]);
  const [bc,    setBc]    = useState('');
  const [flash, setFlash] = useState(null);
  const load = () => fetch('/api/admin/chat', { credentials: 'include' }).then(r => r.json()).then(setMsgs);
  useEffect(() => { load(); }, []);
  const msg = (m, ok = true) => { setFlash({ m, ok }); setTimeout(() => setFlash(null), 2500); };

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      {flash && <Toast msg={flash.m} ok={flash.ok} />}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <SInput value={bc} onChange={e => setBc(e.target.value)} placeholder="Ogłoszenie systemowe..." style={{ flex: 1 }} />
        <SBtn variant="blue" onClick={async () => { const r = await api.adminDash.broadcast(bc); r.ok ? (setBc(''), msg('Wysłano!'), load()) : msg(r.error, false); }}>⚡ Wyślij</SBtn>
        <SBtn variant="danger" onClick={async () => { if (!window.confirm('Wyczyścić cały czat?')) return; await fetch('/api/admin/clear-chat', { method: 'POST', credentials: 'include' }); setMsgs([]); msg('Wyczyszczono!'); }}>Wyczyść</SBtn>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
        {msgs.length === 0 && <div style={{ color: T.dim, textAlign: 'center', padding: 16, fontSize: 10, fontStyle: 'italic' }}>Brak wiadomości na czacie</div>}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 7, padding: '4px 8px', background: T.card, borderRadius: 4, fontSize: 10 }}>
            <span style={{ color: T.goldDim, fontWeight: 'bold', flexShrink: 0 }}>[{m.kto}]</span>
            <span style={{ color: T.muted }}>{m.tresc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AUDIT TAB ─────────────────────────────────────────────────────────────────
const AUDIT_ACT = {
  ban:            T.red,      unban:          T.green,    kick:           T.amber,
  config_update:  T.gold,     config_change:  T.gold,
  set_rank:       T.purple,
  teleport:       T.cyan,     teleport_self:  T.cyan,     goto_player:    T.cyan,     pull_player: T.cyan,
  give_gold:      '#FCD34D',  give_exp:       '#A78BFA',
  set_level:      '#60A5FA',  set_prestige:   '#22D3EE',  set_class: '#F59E0B',
  heal:           T.green,
  reset_mobs:     T.amber,    reset_all_mobs: T.red,
  server_create:  T.green,    server_update:  T.amber,    server_delete:  T.red,
};
const AUDIT_ICON = {
  ban: '⛔', unban: '✓', kick: '🦵',
  config_update: '⚙', config_change: '⚙',
  set_rank: '🎖',
  teleport: '⚡', teleport_self: '⚡', goto_player: '🧭', pull_player: '🧲',
  give_gold: '💰', give_exp: '⭐',
  set_level: '⬆', set_prestige: '✦', set_class: '⚔',
  heal: '❤', reset_mobs: '↺', reset_all_mobs: '↺',
  server_create: '🖥', server_update: '🖥', server_delete: '🖥',
};
const AUDIT_LABEL = {
  ban: 'Zbanowanie', unban: 'Odbanowanie', kick: 'Kick',
  config_update: 'Konfiguracja', config_change: 'Konfiguracja',
  set_rank: 'Zmiana rangi',
  teleport: 'Teleport', teleport_self: 'Teleport (własny)', goto_player: 'Idź do gracza', pull_player: 'Przyciągnij',
  give_gold: 'Dodaj złoto', give_exp: 'Dodaj EXP',
  set_level: 'Zmień poziom', set_prestige: 'Zmień prestige', set_class: 'Zmień klasę',
  heal: 'Uleczenie',
  reset_mobs: 'Reset mobów', reset_all_mobs: 'Reset globalny',
  server_create: 'Serwer: dodanie', server_update: 'Serwer: edycja', server_delete: 'Serwer: usunięcie',
};

function AuditTab() {
  const [logs,       setLogs]       = useState([]);
  const [filter,     setFilter]     = useState('');
  const [adminFilt,  setAdminFilt]  = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRef,    setLastRef]    = useState(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    const params = {};
    if (filter)    params.action = filter;
    if (adminFilt) params.admin  = adminFilt;
    const r = await api.adminDash.auditLog(params);
    if (Array.isArray(r)) setLogs(r);
    setLastRef(new Date());
    setRefreshing(false);
  }, [filter, adminFilt]);

  useEffect(() => { load(); }, [load]);

  const fmtTime = d => {
    const dt = new Date(d);
    const now = new Date();
    const sameDay = dt.toDateString() === now.toDateString();
    return sameDay
      ? dt.toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : dt.toLocaleDateString('pl', { day: '2-digit', month: '2-digit' }) + ' ' + dt.toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' });
  };

  const actionTypes = [...new Set(logs.map(l => l.action))].sort();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{ padding: '7px 10px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: '4px 7px', background: 'rgba(6,10,4,0.8)', color: filter ? T.gold : T.muted, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 9, outline: 'none', fontFamily: FF }}>
          <option value="">Wszystkie akcje</option>
          {actionTypes.map(a => <option key={a} value={a}>{AUDIT_LABEL[a] || a} ({logs.filter(l => l.action === a).length})</option>)}
        </select>
        <input value={adminFilt} onChange={e => setAdminFilt(e.target.value)} placeholder="Admin…"
          style={{ width: 80, padding: '4px 7px', background: 'rgba(6,10,4,0.8)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 9, outline: 'none', fontFamily: FF }} />
        <button onClick={load} disabled={refreshing}
          style={{ padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 9, fontFamily: FF, background: 'rgba(6,10,4,0.6)', border: `1px solid ${T.border}`, color: T.muted }}>
          {refreshing ? '⏳' : '↺'} Odśwież
        </button>
        <span style={{ color: T.dim, fontSize: 8, marginLeft: 'auto' }}>
          {logs.length} wpisów{lastRef ? ` · ${lastRef.toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}
        </span>
      </div>

      {/* Log list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 3, WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
        {logs.length === 0 && <div style={{ color: T.dim, textAlign: 'center', padding: 20, fontSize: 10 }}>📋 Brak wpisów</div>}
        {logs.map(l => {
          const col  = AUDIT_ACT[l.action]  || T.muted;
          const icon = AUDIT_ICON[l.action] || '·';
          const lbl  = AUDIT_LABEL[l.action] || l.action;
          return (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 9px', background: T.card, borderRadius: 6, border: `1px solid ${T.border}`, borderLeft: `3px solid ${col}` }}>
              <span style={{ fontSize: 13, flexShrink: 0, width: 16, textAlign: 'center' }}>{icon}</span>
              <span style={{ color: T.dim, fontSize: 7, flexShrink: 0, minWidth: 52 }}>{fmtTime(l.created_at)}</span>
              <span style={{ color: T.goldDim, fontSize: 9, fontWeight: 'bold', flexShrink: 0, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.admin_name}</span>
              <span style={{ color: col, fontSize: 9, flexShrink: 0 }}>{lbl}</span>
              {l.target && <span style={{ color: T.gold, fontSize: 9 }}>→ {l.target}</span>}
              {l.details && <span style={{ color: T.dim, fontSize: 8, marginLeft: 'auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{l.details}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAPS TAB ──────────────────────────────────────────────────────────────────
function MapsTab() {
  const [maps, setMaps] = useState([]);
  useEffect(() => { api.adminDash.maps().then(r => Array.isArray(r) && setMaps(r)); }, []);

  return (
    <div style={{ padding: 10 }}>
      <div style={{ color: T.muted, fontSize: 10, marginBottom: 8 }}>
        Łącznie <span style={{ color: T.gold, fontWeight: 'bold' }}>{maps.length}</span> map
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 360, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
        {maps.map(m => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: T.card, borderRadius: 6, border: `1px solid ${T.border}` }}>
            <span style={{ color: T.dim, fontSize: 8, width: 22, flexShrink: 0, textAlign: 'right' }}>#{m.id}</span>
            <span style={{ color: T.text, fontSize: 10, flex: 1, fontWeight: 'bold', fontFamily: FS }}>{m.nazwa}</span>
            <span style={{ color: T.muted, fontSize: 8 }}>{m.maks_x + 1}×{m.maks_y + 1}</span>
            <span style={{ color: T.green, fontSize: 8 }}>{m.cnt} mobów</span>
            {m.dead > 0 && <span style={{ color: T.red, fontSize: 8 }}>{m.dead}☠</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── EVENTS & BOSS TAB ─────────────────────────────────────────────────────────
function EventsBossTab() {
  const [bossData,  setBossData]  = useState(null);
  const [events,    setEvents]    = useState([]);
  const [flash,     setFlash]     = useState(null);
  const [spawning,  setSpawning]  = useState(false);

  const msg = (m, ok=true) => { setFlash({ m, ok }); setTimeout(()=>setFlash(null), 3500); };

  const load = async () => {
    const [b, ev] = await Promise.all([
      api.adminDash.bossStatus().catch(()=>null),
      api.adminDash.eventsList().catch(()=>[]),
    ]);
    setBossData(b);
    setEvents(Array.isArray(ev) ? ev : []);
  };
  useEffect(() => { load(); }, []);

  const BOSS_STATUS_CLR = { aktywny:'#4ADE80', martwy:'#6B7280', uciekl:'#F59E0B', oczekuje:'#C8940A' };

  const hpPct = bossData?.active
    ? Math.round((bossData.active.zycie / bossData.active.zycie_max) * 100)
    : 0;

  return (
    <div style={{ padding:12, display:'flex', flexDirection:'column', gap:12 }}>
      {flash && <Toast msg={flash.m} ok={flash.ok} />}

      {/* ── WORLD BOSS ── */}
      <SCard>
        <SHead icon="💀" title="World Boss" color="#F87171" />
        <div style={{ padding:'10px 12px', display:'flex', flexDirection:'column', gap:8 }}>

          {/* Aktywny boss */}
          {bossData?.active ? (
            <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:7, padding:'8px 10px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ color:'#F87171', fontWeight:'bold', fontSize:11 }}>💀 {bossData.active.nazwa}</span>
                <span style={{ fontSize:9, color:'#4ADE80', fontWeight:'bold' }}>AKTYWNY</span>
              </div>
              <div style={{ height:8, background:'rgba(60,10,10,0.6)', borderRadius:4, overflow:'hidden', marginBottom:4 }}>
                <div style={{ width:`${hpPct}%`, height:'100%', background:'#E53E3E', borderRadius:4, transition:'width 0.3s' }}/>
              </div>
              <div style={{ fontSize:8, color:'rgba(200,100,100,0.6)', marginBottom:8 }}>
                HP: {Number(bossData.active.zycie).toLocaleString()} / {Number(bossData.active.zycie_max).toLocaleString()} ({hpPct}%)
              </div>
              <SBtn variant="danger" onClick={async () => {
                if (!confirm(`Usunąć bossa ${bossData.active.nazwa}?`)) return;
                const r = await api.adminDash.killBoss();
                r.ok ? (msg('Boss usunięty!'), load()) : msg(r.error||'Błąd', false);
              }}>⚔ Usuń bossa</SBtn>
            </div>
          ) : (
            <div style={{ color:T.dim, fontSize:10 }}>Brak aktywnego bossa.</div>
          )}

          {/* Lista bossów do spawnu */}
          <SLabel>Dostępne bossyы</SLabel>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {(bossData?.bosses||[]).map(boss => {
              const stClr = BOSS_STATUS_CLR[boss.status] || '#6B7280';
              const isActive = boss.status === 'aktywny';
              return (
                <div key={boss.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', background:T.card, border:`1px solid ${T.border}`, borderRadius:6 }}>
                  <span style={{ color:stClr, fontSize:8, fontWeight:'bold', minWidth:52 }}>● {boss.status}</span>
                  <span style={{ color:T.text, fontSize:10, flex:1, fontWeight:'bold' }}>{boss.nazwa}</span>
                  <span style={{ color:T.muted, fontSize:8 }}>Lv.{boss.poziom||'?'} · HP:{Number(boss.zycie_max||0).toLocaleString()}</span>
                  <SBtn
                    disabled={isActive || !!bossData?.active || spawning}
                    onClick={async () => {
                      setSpawning(true);
                      const r = await api.adminDash.spawnBoss(boss.id);
                      r.ok ? (msg(`Boss ${boss.nazwa} przywołany!`), load()) : msg(r.error||'Błąd', false);
                      setSpawning(false);
                    }}
                  >⚡ Przywołaj</SBtn>
                </div>
              );
            })}
          </div>

          {/* Ulecz wszystkich */}
          <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:8 }}>
            <SBtn variant="success" onClick={async () => {
              const r = await api.adminDash.healAll();
              r.ok ? msg(`Uleczono ${r.healed} graczy!`) : msg(r.error||'Błąd', false);
            }}>❤ Ulecz wszystkich online</SBtn>
          </div>
        </div>
      </SCard>

      {/* ── EVENTY ── */}
      <SCard>
        <SHead icon="🎉" title="Eventy Sezonowe" color="#FBBF24" />
        <div style={{ padding:'10px 12px', display:'flex', flexDirection:'column', gap:6 }}>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <SBtn variant="ghost" onClick={async () => {
              const r = await api.adminDash.deactivateEvent();
              r.ok ? (msg('Wszystkie eventy wyłączone'), load()) : msg(r.error||'Błąd', false);
            }}>⛔ Wyłącz wszystkie</SBtn>
          </div>
          {events.length === 0 && (
            <div style={{ color:T.dim, fontSize:10, textAlign:'center', padding:10 }}>
              Brak eventów w bazie (tabela eventy_sezonowe)
            </div>
          )}
          {events.map(ev => (
            <div key={ev.id} style={{
              display:'flex', alignItems:'center', gap:8, padding:'8px 10px',
              background: ev.aktywny ? 'rgba(251,191,36,0.08)' : T.card,
              border:`1px solid ${ev.aktywny ? 'rgba(251,191,36,0.35)' : T.border}`,
              borderRadius:7,
            }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:ev.kolor||'#C8940A', flexShrink:0 }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:ev.aktywny?'#FBBF24':T.text, fontWeight:'bold', fontSize:10 }}>{ev.nazwa}</div>
                {ev.opis && <div style={{ color:T.muted, fontSize:8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ev.opis}</div>}
                {(ev.data_start||ev.data_koniec) && (
                  <div style={{ color:T.dim, fontSize:7 }}>{ev.data_start} → {ev.data_koniec}</div>
                )}
              </div>
              {ev.aktywny
                ? <Chip color="#4ADE80">AKTYWNY</Chip>
                : (
                  <SBtn onClick={async () => {
                    const r = await api.adminDash.activateEvent(ev.id);
                    r.ok ? (msg(`Event "${ev.nazwa}" aktywowany!`), load()) : msg(r.error||'Błąd', false);
                  }}>▶ Aktywuj</SBtn>
                )
              }
            </div>
          ))}
        </div>
      </SCard>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
// Zakładki wspólne dla panelu w grze i na stronie (AdminDashboard dokłada własne)
export { StatsTab, PlayersTab, MobsTab, MapsTab, ServerTab, ChatTab, AuditTab, EventsBossTab };

export function adminTabs({ myId, currentMap }) {
  return [
    { id: 'overview', icon: '🏠', label: 'Serwer',  sub: 'Status i informacje',        render: (ctx) => <AdminOverview ctx={ctx} /> },
    { id: 'players',  icon: '👥', label: 'Gracze',  sub: 'Zarządzanie graczami',       render: () => <PlayersTab myId={myId} />, fill: true, legacy: true },
    { id: 'mobs',     icon: '👾', label: 'Moby',    sub: 'Respawn i podgląd',          render: () => <MobsTab currentMap={currentMap} />, legacy: true },
    { id: 'maps',     icon: '🗺', label: 'Mapy',    sub: 'Zarządzanie mapami',         render: () => <MapsTab />, legacy: true },
    { id: 'config',   icon: '⚙️', label: 'Config',  sub: 'Ustawienia serwera',         render: () => <ServerTab />, legacy: true },
    { id: 'chat',     icon: '💬', label: 'Czat',    sub: 'Wiadomości i komunikacja',   render: () => <ChatTab />, fill: true, legacy: true },
    { id: 'audit',    icon: '📋', label: 'Logi',    sub: 'Historia zdarzeń',           render: () => <AuditTab />, legacy: true },
    { id: 'assets',   icon: '🗃', label: 'Assety',  sub: 'Zarządzanie plikami',        render: () => <AssetsTab />, fill: true, legacy: true },
    { id: 'events',   icon: '⚡', label: 'Eventy',  sub: 'Eventy i bossy',             render: () => <EventsBossTab />, legacy: true },
  ];
}

export default function AdminPanel({ postac, onClose, onLogout }) {
  return (
    <AdminApp
      me={{ nazwa: postac.nazwa, ranga: postac.ranga }}
      tabs={adminTabs({ myId: postac.id, currentMap: postac.mapa })}
      onClose={onClose}
      onLogout={onLogout}
    />
  );
}
