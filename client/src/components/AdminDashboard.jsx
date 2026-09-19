import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { api } from '../api';
import AssetsTab from './AssetsTab';

const WorldEditor = lazy(() => import('./WorldEditor'));
const QuestEditor = lazy(() => import('./QuestEditor'));

// ── Design system ─────────────────────────────────────────────────────────────
const T = {
  bg:       '#070C06',
  surface:  'rgba(10,16,8,0.98)',
  card:     'rgba(14,22,10,0.95)',
  raised:   'rgba(18,28,14,0.98)',
  border:   'rgba(200,150,32,0.14)',
  borderHi: 'rgba(200,150,32,0.4)',
  gold:     '#E8D070',
  goldDim:  '#C8940A',
  text:     '#CDD4AA',
  muted:    '#6A7A50',
  dim:      '#3A4828',
  red:      '#F87171',
  green:    '#4ADE80',
  blue:     '#60A5FA',
  amber:    '#FBBF24',
  purple:   '#A78BFA',
  cyan:     '#22D3EE',
};

const FF = 'Verdana,sans-serif';
const FS = '"Palatino Linotype",Palatino,serif';

// ── Shared components ─────────────────────────────────────────────────────────
function Chip({ color, children }) {
  return (
    <span style={{ padding: '2px 9px', borderRadius: 9999, background: `${color}18`, border: `1px solid ${color}44`, color, fontSize: 9, fontWeight: 'bold', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {children}
    </span>
  );
}

function Toast({ msg, ok }) {
  if (!msg) return null;
  const c = ok ? T.green : T.red;
  return (
    <div style={{ padding: '8px 14px', borderRadius: 8, fontSize: 11, background: ok ? 'rgba(6,50,20,0.8)' : 'rgba(50,4,4,0.8)', border: `1px solid ${c}44`, color: c, display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
      <span style={{ fontSize: 14 }}>{ok ? '✓' : '✕'}</span> {msg}
    </div>
  );
}

function SInput({ value, onChange, placeholder, type = 'text', style = {} }) {
  const [foc, setFoc] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      style={{ padding: '8px 11px', background: 'rgba(6,10,4,0.8)', color: T.text, border: `1px solid ${foc ? T.borderHi : T.border}`, borderRadius: 6, fontSize: 11, outline: 'none', fontFamily: FF, width: '100%', boxSizing: 'border-box', transition: 'border-color .15s', ...style }}
    />
  );
}

function SBtn({ children, onClick, variant = 'default', disabled, style = {}, wide }) {
  const v = {
    default: { bg: 'rgba(74,122,42,0.2)', c: T.gold,   bd: T.borderHi },
    danger:  { bg: 'rgba(50,4,4,0.7)',    c: T.red,    bd: 'rgba(239,68,68,0.4)' },
    success: { bg: 'rgba(6,40,20,0.7)',   c: T.green,  bd: 'rgba(34,197,94,0.35)' },
    ghost:   { bg: 'rgba(8,13,5,0.4)',    c: T.muted,  bd: T.border },
    blue:    { bg: 'rgba(29,78,216,0.2)', c: T.blue,   bd: 'rgba(59,130,246,0.4)' },
  }[variant] || {};
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '7px 14px', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 10, fontWeight: 'bold', border: `1px solid ${v.bd}`,
      background: disabled ? 'rgba(8,13,5,0.3)' : v.bg,
      color: disabled ? T.dim : v.c, opacity: disabled ? 0.55 : 1,
      display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
      transition: 'all .12s', fontFamily: FF,
      width: wide ? '100%' : undefined, justifyContent: wide ? 'center' : undefined,
      ...style,
    }}>{children}</button>
  );
}

function SCard({ children, style = {}, color }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${color ? color + '25' : T.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: color ? `0 0 20px ${color}0A` : 'none', ...style }}>
      {children}
    </div>
  );
}

function SCardHead({ icon, title, action, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: T.raised, borderBottom: `1px solid ${T.border}` }}>
      {icon && <span style={{ color: color || T.goldDim, fontSize: 14 }}>{icon}</span>}
      <span style={{ fontSize: 9, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', color: color || T.goldDim, fontFamily: FS }}>{title}</span>
      {action && <div style={{ marginLeft: 'auto' }}>{action}</div>}
    </div>
  );
}

function StatCard({ label, value, color = T.gold, sub, icon, trend }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 8, color: T.dim, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6, fontFamily: FS }}>{label}</div>
          <div style={{ color, fontSize: 26, fontWeight: 'bold', lineHeight: 1, fontFamily: FS }}>{value ?? '–'}</div>
          {sub && <div style={{ color: T.muted, fontSize: 9, marginTop: 4 }}>{sub}</div>}
        </div>
        {icon && <span style={{ fontSize: 22, opacity: 0.4 }}>{icon}</span>}
      </div>
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 8, fontSize: 9, color: trend >= 0 ? T.green : T.red }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

function SLabel({ children }) {
  return <div style={{ fontSize: 9, color: T.dim, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5, fontFamily: FS }}>{children}</div>;
}

// ── OVERVIEW TAB ──────────────────────────────────────────────────────────────
function OverviewTab({ stats, status, onRefresh }) {
  if (!stats || !status) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: 11 }}>Ładowanie danych...</div>
  );

  const fmt = s => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m}m`; };
  const maint = status.config?.maintenance === '1' || status.config?.maintenance === true;

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Server status bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: T.raised, borderRadius: 10, border: `1px solid ${T.border}`, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: maint ? T.red : T.green, boxShadow: `0 0 8px ${maint ? T.red : T.green}` }} />
          <span style={{ color: T.gold, fontWeight: 'bold', fontSize: 13, fontFamily: FS }}>{status.config?.name || 'Veldoria'}</span>
          {maint && <Chip color={T.red}>KONSERWACJA</Chip>}
        </div>
        <div style={{ display: 'flex', gap: 16, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {[
            ['⏱ Uptime', fmt(status.uptime || 0), T.cyan],
            ['💾 RAM', `${status.memMB || '?'}MB`, T.blue],
            ['⚡ Online', status.online || 0, T.green],
          ].map(([l, v, c]) => (
            <div key={l} style={{ fontSize: 10, color: T.muted }}>
              {l}: <span style={{ color: c, fontWeight: 'bold' }}>{v}</span>
            </div>
          ))}
        </div>
        <SBtn onClick={onRefresh} variant="ghost" style={{ padding: '5px 10px', fontSize: 9 }}>↻ Odśwież</SBtn>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 }}>
        <StatCard label="Online"      value={stats.online}    color={T.green}  sub="graczy teraz"      icon="🟢" />
        <StatCard label="Konta"       value={stats.accounts}  color={T.blue}   sub="zarejestrowanych"  icon="👤" />
        <StatCard label="Postacie"    value={stats.total}     color={T.gold}   sub="łącznie"           icon="⚔" />
        <StatCard label="Zbanowani"   value={stats.banned}    color={T.red}    sub="kont"              icon="🚫" />
        <StatCard label="Moby"        value={stats.mobs}      color={T.amber}  sub={`${stats.deadMobs || 0} martwych`} icon="👾" />
        <StatCard label="Mapy"        value={stats.maps}      color={T.cyan}   sub="lokacji"           icon="🗺" />
        <StatCard label="Wiadomości"  value={stats.msgs}      color={T.muted}  sub="na czacie"         icon="💬" />
        <StatCard label="Przedmioty"  value={stats.items}     color={T.purple} sub="w bazie"           icon="🎒" />
      </div>

      {/* Config multipliers row */}
      <div>
        <div style={{ fontSize: 9, color: T.dim, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10, fontFamily: FS }}>Konfiguracja serwera</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 8 }}>
          {[
            ['Mnożnik EXP',     `×${status.config?.xp || 1}`,      T.cyan],
            ['Szansa Loot',     `×${status.config?.loot || 1}`,    T.amber],
            ['Mnożnik Respawn', `×${status.config?.respawn || 1}`, T.purple],
            ['Tryb PvP',        status.config?.pvp === '1' ? 'WŁĄCZONY' : 'WYŁĄCZONY', status.config?.pvp === '1' ? T.red : T.muted],
            ['Rejestracja',     status.config?.registration_enabled === '0' ? 'ZABLOKOWANA' : 'OTWARTA', status.config?.registration_enabled === '0' ? T.red : T.green],
          ].map(([l, v, c]) => (
            <div key={l} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: T.dim, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontFamily: FS }}>{l}</div>
              <div style={{ color: c, fontSize: 15, fontWeight: 'bold', fontFamily: FS }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcement */}
      {status.config?.announcement && (
        <SCard color={T.amber}>
          <SCardHead icon="📢" title="Aktualne ogłoszenie" color={T.amber} />
          <div style={{ padding: '10px 14px', color: T.text, fontSize: 11, fontStyle: 'italic' }}>
            {status.config.announcement}
          </div>
        </SCard>
      )}
    </div>
  );
}

// ── SETTINGS TAB ──────────────────────────────────────────────────────────────
function SettingsTab({ config, onSaved }) {
  const [form,      setForm]      = useState({});
  const [flash,     setFlash]     = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [broadcast, setBroadcast] = useState('');

  useEffect(() => {
    if (!config) return;
    const obj = {};
    config.forEach(c => { obj[c.key] = c.value; });
    setForm(obj);
  }, [config]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const msg = (m, ok = true) => { setFlash({ m, ok }); setTimeout(() => setFlash(null), 3000); };

  const save = async () => {
    setSaving(true);
    try {
      const r = await api.adminDash.saveConfig(form);
      r.ok ? (msg('Ustawienia zapisane!'), onSaved?.()) : msg(r.error || 'Błąd', false);
    } finally { setSaving(false); }
  };

  const sendBroadcast = async () => {
    if (!broadcast.trim()) return;
    const r = await api.adminDash.broadcast(broadcast);
    r.ok ? (msg('Ogłoszenie wysłane!'), setBroadcast('')) : msg(r.error, false);
  };

  if (!config) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>Ładowanie...</div>;

  const cfgMap = Object.fromEntries(config.map(c => [c.key, c]));

  const GROUPS = [
    { title: 'Ogólne',           icon: '⚙', keys: ['server_name', 'server_description', 'announcement'] },
    { title: 'Rozgrywka',        icon: '⚔', keys: ['xp_multiplier', 'loot_chance', 'respawn_multiplier', 'gold_multiplier', 'heal_cost', 'max_level'] },
    { title: 'Start postaci',    icon: '🗺', keys: ['starting_gold', 'starting_map', 'starting_x', 'starting_y', 'dead_respawn_map'] },
    { title: 'Dostęp i bezp.',   icon: '🛡', keys: ['maintenance_mode', 'maintenance_message', 'registration_enabled', 'pvp_enabled', 'max_players'] },
  ];

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', flex: 1 }}>
      {flash && <Toast msg={flash.m} ok={flash.ok} />}

      {/* Broadcast */}
      <SCard>
        <SCardHead icon="📢" title="Ogłoszenie natychmiastowe" color={T.amber} />
        <div style={{ padding: '12px 14px', display: 'flex', gap: 8 }}>
          <SInput value={broadcast} onChange={e => setBroadcast(e.target.value)} placeholder="Wpisz ogłoszenie dla wszystkich graczy online..." style={{ flex: 1 }} />
          <SBtn onClick={sendBroadcast} variant="blue">⚡ Wyślij</SBtn>
        </div>
      </SCard>

      {GROUPS.map(g => (
        <SCard key={g.title}>
          <SCardHead icon={g.icon} title={g.title} />
          <div style={{ padding: '12px 14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12 }}>
            {g.keys.filter(k => cfgMap[k]).map(k => {
              const c = cfgMap[k];
              return (
                <div key={k} style={{ gridColumn: c.type === 'textarea' ? '1/-1' : 'auto' }}>
                  <SLabel>{c.label}</SLabel>
                  {c.type === 'boolean' ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[['1', 'Tak', T.green], ['0', 'Nie', T.red]].map(([v, l, col]) => (
                        <button key={v} onClick={() => set(k, v)} style={{
                          padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: 'bold',
                          background: form[k] === v ? `${col}1A` : 'rgba(8,13,5,0.5)',
                          border: `1px solid ${form[k] === v ? col + '55' : T.border}`,
                          color: form[k] === v ? col : T.muted, fontFamily: FF,
                        }}>{l}</button>
                      ))}
                    </div>
                  ) : c.type === 'textarea' ? (
                    <textarea value={form[k] || ''} onChange={e => set(k, e.target.value)} rows={3}
                      style={{ width: '100%', padding: '8px 11px', background: 'rgba(6,10,4,0.8)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 11, outline: 'none', resize: 'vertical', fontFamily: FF, boxSizing: 'border-box' }} />
                  ) : (
                    <SInput type={c.type === 'number' ? 'number' : 'text'} value={form[k] || ''} onChange={e => set(k, e.target.value)} />
                  )}
                </div>
              );
            })}
          </div>
        </SCard>
      ))}

      <SBtn onClick={save} disabled={saving} variant="success" wide style={{ padding: '12px', fontSize: 12 }}>
        {saving ? '⏳ Zapisuję...' : '✓ Zapisz wszystkie ustawienia'}
      </SBtn>
    </div>
  );
}

// ── SERVERS TAB ───────────────────────────────────────────────────────────────
function ServersTab() {
  const [servers,  setServers]  = useState([]);
  const [creating, setCreating] = useState(false);
  const [form,     setForm]     = useState({ name: '', description: '', port: 3003 });
  const [flash,    setFlash]    = useState(null);
  const load  = useCallback(() => api.adminDash.servers().then(s => Array.isArray(s) && setServers(s)), []);
  useEffect(() => { load(); }, [load]);
  const msg = (m, ok = true) => { setFlash({ m, ok }); setTimeout(() => setFlash(null), 3000); };
  const STATUS = { active: [T.green, 'Aktywny'], maintenance: [T.amber, 'Konserwacja'], offline: [T.muted, 'Offline'] };

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {flash && <Toast msg={flash.m} ok={flash.ok} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: T.gold, fontSize: 14, fontFamily: FS }}>Serwery ({servers.length})</h3>
        <SBtn onClick={() => setCreating(c => !c)} variant={creating ? 'ghost' : 'default'}>{creating ? '✕ Anuluj' : '+ Nowy serwer'}</SBtn>
      </div>

      {creating && (
        <SCard color={T.green}>
          <SCardHead icon="+" title="Nowy serwer" color={T.green} />
          <div style={{ padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><SLabel>Nazwa</SLabel><SInput value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="np. Veldoria #2" /></div>
            <div><SLabel>Port</SLabel><SInput type="number" value={form.port} onChange={e => setForm(p => ({ ...p, port: parseInt(e.target.value) }))} /></div>
            <div style={{ gridColumn: '1/-1' }}><SLabel>Opis</SLabel><SInput value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Opis serwera..." /></div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
              <SBtn onClick={async () => {
                const r = await api.adminDash.createServer(form);
                r.ok ? (load(), setCreating(false), setForm({ name: '', description: '', port: 3003 }), msg('Serwer utworzony!')) : msg(r.error, false);
              }} variant="success">✓ Utwórz</SBtn>
            </div>
          </div>
        </SCard>
      )}

      {servers.map(srv => {
        const [col, lbl] = STATUS[srv.status] || [T.muted, srv.status];
        return (
          <SCard key={srv.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: col, boxShadow: `0 0 8px ${col}`, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: T.gold, fontWeight: 'bold', fontSize: 12, fontFamily: FS }}>{srv.name}</div>
                <div style={{ color: T.muted, fontSize: 9, marginTop: 2 }}>Port: {srv.port} · {lbl}{srv.description ? ` · ${srv.description}` : ''}</div>
              </div>
              {srv.id === 1 ? (
                <Chip color={T.green}>AKTYWNY</Chip>
              ) : (
                <div style={{ display: 'flex', gap: 5 }}>
                  {['active', 'maintenance', 'offline'].map(s => (
                    <button key={s} onClick={async () => { await api.adminDash.updateServer(srv.id, { status: s }); load(); }} style={{
                      padding: '3px 8px', fontSize: 9, borderRadius: 5, cursor: 'pointer', fontFamily: FF,
                      background: srv.status === s ? `${STATUS[s][0]}18` : 'rgba(8,13,5,0.5)',
                      border: `1px solid ${srv.status === s ? STATUS[s][0] + '55' : T.border}`,
                      color: srv.status === s ? STATUS[s][0] : T.muted,
                    }}>{STATUS[s][1]}</button>
                  ))}
                  <SBtn variant="danger" style={{ padding: '3px 8px' }} onClick={async () => {
                    if (!window.confirm(`Usunąć serwer "${srv.name}"?`)) return;
                    await api.adminDash.deleteServer(srv.id); load(); msg('Usunięto serwer');
                  }}>✕</SBtn>
                </div>
              )}
            </div>
          </SCard>
        );
      })}
    </div>
  );
}

// ── PLAYERS TAB ───────────────────────────────────────────────────────────────
function PlayersTab() {
  const [players, setPlayers] = useState([]);
  const [sel,     setSel]     = useState(null);
  const [search,  setSearch]  = useState('');
  const [flash,   setFlash]   = useState(null);
  const [form,    setForm]    = useState({ rank: 'Gracz', gold: '', level: '', tpMap: '', tpX: '', tpY: '' });
  const [maps,    setMaps]    = useState([]);

  const load = useCallback(async q => { const r = await api.adminDash.players(q); Array.isArray(r) && setPlayers(r); }, []);
  useEffect(() => { load(''); api.adminDash.maps().then(r => Array.isArray(r) && setMaps(r)); }, [load]);
  const msg = (m, ok = true) => { setFlash({ m, ok }); setTimeout(() => setFlash(null), 3000); };
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const RCOLOR = { GameAdmin: '#EF4444', GameMaster: '#F59E0B', Moderator: '#60A5FA', Gracz: T.dim };

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

      {/* Player list */}
      <div style={{ width: 250, flexShrink: 0, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.dim, fontSize: 12 }}>🔍</span>
            <input value={search} onChange={e => { setSearch(e.target.value); load(e.target.value); }}
              placeholder="Szukaj gracza..." style={{ width: '100%', padding: '8px 10px 8px 28px', background: 'rgba(6,10,4,0.8)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 10, outline: 'none', fontFamily: FF, boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {players.map(pl => (
            <div key={pl.id} onClick={() => { setSel(pl); set('rank', pl.ranga); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', transition: 'background .1s', background: sel?.id === pl.id ? 'rgba(74,122,42,0.12)' : 'transparent', borderBottom: `1px solid ${T.border}22`, borderLeft: `3px solid ${sel?.id === pl.id ? T.goldDim : 'transparent'}` }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: pl.zalogowany ? T.green : '#374151', flexShrink: 0, boxShadow: pl.zalogowany ? `0 0 5px ${T.green}` : 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: T.text, fontSize: 10, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.nazwa}</div>
                <div style={{ fontSize: 8, marginTop: 1 }}>
                  <span style={{ color: RCOLOR[pl.ranga] || T.muted }}>{pl.ranga}</span>
                  <span style={{ color: T.dim }}> · poz.{pl.poziom}</span>
                </div>
              </div>
              {pl.ban && <Chip color={T.red}>BAN</Chip>}
            </div>
          ))}
          {players.length === 0 && <div style={{ color: T.dim, textAlign: 'center', padding: 20, fontSize: 10 }}>Brak graczy</div>}
        </div>
      </div>

      {/* Detail panel */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {flash && <Toast msg={flash.m} ok={flash.ok} />}
        {!sel ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: T.dim, gap: 10 }}>
            <span style={{ fontSize: 40, opacity: 0.2 }}>👤</span>
            <span style={{ fontSize: 11 }}>Wybierz gracza z listy</span>
          </div>
        ) : (
          <>
            {/* Player header card */}
            <SCard color={RCOLOR[sel.ranga]}>
              <div style={{ padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 36, height: 52, flexShrink: 0, backgroundImage: `url(/assets/${sel.obrazek || 'avatar/m_bd28.gif'})`, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', border: `1px solid ${T.border}`, borderRadius: 4, background: `rgba(6,10,4,0.8) url(/assets/${sel.obrazek || 'avatar/m_bd28.gif'}) no-repeat` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ color: T.gold, fontWeight: 'bold', fontSize: 15, fontFamily: FS }}>{sel.nazwa}</span>
                    <Chip color={RCOLOR[sel.ranga] || T.muted}>{sel.ranga}</Chip>
                    {sel.ban && <Chip color={T.red}>⛔ ZBANOWANY</Chip>}
                  </div>
                  <div style={{ color: T.muted, fontSize: 9, marginTop: 4 }}>
                    ID: {sel.id} · {sel.profesja} · poz.{sel.poziom}
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ color: T.dim, fontSize: 9 }}>HP: <span style={{ color: T.text }}>{sel.zycie}/{sel.zycie_max}</span></span>
                    <span style={{ color: T.dim, fontSize: 9 }}>💰 <span style={{ color: '#FCD34D' }}>{sel.zloto}g</span></span>
                    <span style={{ color: T.dim, fontSize: 9 }}>📍 Mapa {sel.mapa} ({sel.x},{sel.y})</span>
                  </div>
                </div>
              </div>
            </SCard>

            {/* Rank change */}
            <SCard>
              <SCardHead icon="🎖" title="Zmień rangę" />
              <div style={{ padding: '10px 14px', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {['Gracz', 'Moderator', 'GameMaster', 'GameAdmin'].map(r => (
                  <button key={r} onClick={() => set('rank', r)} style={{
                    padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: 'bold', fontFamily: FF,
                    background: form.rank === r ? `${RCOLOR[r] || T.gold}1A` : 'rgba(8,13,5,0.5)',
                    border: `1px solid ${form.rank === r ? (RCOLOR[r] || T.gold) + '55' : T.border}`,
                    color: form.rank === r ? (RCOLOR[r] || T.gold) : T.muted, transition: 'all .1s',
                  }}>{r}</button>
                ))}
                <SBtn onClick={async () => {
                  const r = await api.adminDash.setRank(sel.id, form.rank);
                  r.ok ? (setSel(s => ({ ...s, ranga: form.rank })), msg('Ranga zmieniona!'), load(search)) : msg(r.error, false);
                }} style={{ marginLeft: 'auto' }}>✓ Ustaw</SBtn>
              </div>
            </SCard>

            {/* Resources */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <SCard>
                <SCardHead icon="💰" title="Dodaj złoto" color="#FCD34D" />
                <div style={{ padding: '10px 12px', display: 'flex', gap: 6 }}>
                  <SInput type="number" value={form.gold} onChange={e => set('gold', e.target.value)} placeholder="Ilość złota" style={{ flex: 1 }} />
                  <SBtn onClick={async () => {
                    const r = await api.adminDash.giveGold(sel.id, parseInt(form.gold) || 0);
                    r.ok ? (msg(`+${form.gold}g dodane!`), set('gold', '')) : msg(r.error, false);
                  }}>+G</SBtn>
                </div>
              </SCard>
              <SCard>
                <SCardHead icon="⬆" title="Ustaw poziom" color={T.cyan} />
                <div style={{ padding: '10px 12px', display: 'flex', gap: 6 }}>
                  <SInput type="number" value={form.level} onChange={e => set('level', e.target.value)} placeholder="1–500" style={{ flex: 1 }} />
                  <SBtn onClick={async () => {
                    const r = await api.adminDash.setLevel(sel.id, parseInt(form.level) || 1);
                    r.ok ? (msg(`Poziom ustawiony!`), set('level', ''), load(search)) : msg(r.error, false);
                  }}>Ustaw</SBtn>
                </div>
              </SCard>
            </div>

            {/* Teleport */}
            <SCard>
              <SCardHead icon="⚡" title="Teleportuj gracza" color={T.cyan} />
              <div style={{ padding: '10px 14px' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  <div style={{ flex: '0 0 auto' }}>
                    <SLabel>Mapa</SLabel>
                    <select value={form.tpMap} onChange={e => set('tpMap', e.target.value)}
                      style={{ padding: '7px 8px', background: 'rgba(6,10,4,0.8)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 10, outline: 'none', fontFamily: FF, minWidth: 130 }}>
                      <option value="">— wybierz —</option>
                      {maps.map(m => <option key={m.id} value={m.id}>#{m.id} {m.nazwa}</option>)}
                    </select>
                  </div>
                  <div><SLabel>X</SLabel><SInput type="number" value={form.tpX} onChange={e => set('tpX', e.target.value)} placeholder="X" style={{ width: 65 }} /></div>
                  <div><SLabel>Y</SLabel><SInput type="number" value={form.tpY} onChange={e => set('tpY', e.target.value)} placeholder="Y" style={{ width: 65 }} /></div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <SBtn onClick={async () => {
                    const r = await api.adminDash.teleport(sel.id, parseInt(form.tpMap) || 1, parseInt(form.tpX) || 35, parseInt(form.tpY) || 35);
                    r.ok ? msg('Teleportowano!') : msg(r.error, false);
                  }} variant="blue">📍 Teleportuj</SBtn>
                  <SBtn onClick={async () => {
                    const r = await api.adminDash.gotoPlayer(sel.id);
                    r.ok ? msg(`Teleportowano do ${sel.nazwa}! Wyjdź z panelu.`) : msg(r.error, false);
                  }} style={{ background: 'rgba(6,80,40,0.3)', borderColor: 'rgba(34,197,94,0.4)', color: T.green }}>
                    🧭 Idź do gracza
                  </SBtn>
                  <SBtn onClick={async () => {
                    const r = await api.adminDash.pullPlayer(sel.id);
                    r.ok ? msg(`Przyciągnięto ${sel.nazwa}!`) : msg(r.error, false);
                  }} style={{ background: 'rgba(100,50,6,0.3)', borderColor: 'rgba(249,115,22,0.4)', color: '#FB923C' }}>
                    🧲 Przyciągnij
                  </SBtn>
                </div>
              </div>
            </SCard>

            {/* Quick actions */}
            <SCard>
              <SCardHead icon="⚡" title="Szybkie akcje" />
              <div style={{ padding: '10px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <SBtn variant="success" onClick={async () => { const r = await api.adminDash.healPlayer(sel.id); r.ok && msg('Gracz uleczony!'); }}>❤ Ulecz HP</SBtn>
                <SBtn variant="ghost" onClick={async () => { const r = await api.adminDash.kickPlayer(sel.id); r.ok && (msg('Kicknięto!'), load(search)); }}>🦵 Wyrzuć (kick)</SBtn>
                {!sel.ban ? (
                  <SBtn variant="danger" onClick={async () => {
                    const reason = prompt('Powód bana:') || '';
                    const r = await api.adminDash.banPlayer(sel.id, reason);
                    r.ok && (setSel(s => ({ ...s, ban: 1 })), msg('Zbanowano!'), load(search));
                  }}>⛔ Zbanuj</SBtn>
                ) : (
                  <SBtn variant="success" onClick={async () => {
                    const r = await api.adminDash.unbanPlayer(sel.id);
                    r.ok && (setSel(s => ({ ...s, ban: 0 })), msg('Odbanowano!'), load(search));
                  }}>✓ Odbanuj</SBtn>
                )}
              </div>
            </SCard>
          </>
        )}
      </div>
    </div>
  );
}

// ── AUDIT TAB ─────────────────────────────────────────────────────────────────
function AuditTab() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.adminDash.auditLog().then(r => Array.isArray(r) && setLogs(r)); }, []);

  const ACT = {
    ban: T.red, unban: T.green, kick: T.amber, config_change: T.gold,
    set_rank: T.purple, teleport: T.cyan, give_gold: '#FCD34D',
    give_exp: '#86EFAC', clear_chat: T.red, broadcast: T.gold,
    server_create: T.green,
  };
  const ACT_ICON = {
    ban: '⛔', unban: '✓', kick: '🦵', config_change: '⚙',
    set_rank: '🎖', teleport: '⚡', give_gold: '💰', broadcast: '📢',
  };

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {logs.length === 0 && (
        <div style={{ color: T.dim, textAlign: 'center', padding: 40, fontSize: 11 }}>📋 Brak wpisów w logach</div>
      )}
      {logs.map(l => (
        <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', background: T.card, borderRadius: 7, border: `1px solid ${T.border}`, borderLeft: `3px solid ${ACT[l.action] || T.muted}` }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>{ACT_ICON[l.action] || '·'}</span>
          <span style={{ color: T.dim, fontSize: 8, flexShrink: 0, minWidth: 50 }}>{new Date(l.created_at).toLocaleTimeString('pl')}</span>
          <span style={{ color: T.goldDim, fontSize: 10, fontWeight: 'bold', flexShrink: 0 }}>{l.admin_name}</span>
          <span style={{ color: ACT[l.action] || T.muted, fontSize: 10, fontWeight: 'bold' }}>{l.action}</span>
          {l.target && <span style={{ color: T.gold, fontSize: 10 }}>→ {l.target}</span>}
          {l.details && <span style={{ color: T.dim, fontSize: 9, marginLeft: 'auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{l.details}</span>}
        </div>
      ))}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Przegląd',   icon: '📊' },
  { id: 'settings',  label: 'Ustawienia', icon: '⚙' },
  { id: 'servers',   label: 'Serwery',    icon: '🌐' },
  { id: 'players',   label: 'Gracze',     icon: '👥' },
  { id: 'assets',    label: 'Assety',     icon: '🖼' },
  { id: 'world',     label: 'Edytor Map', icon: '🗺' },
  { id: 'quests',    label: 'Questy',     icon: '📜' },
  { id: 'audit',     label: 'Logi',       icon: '📋' },
];

export default function AdminDashboard({ onEnterGame, onLogout }) {
  const [tab,     setTab]     = useState('overview');
  const [stats,   setStats]   = useState(null);
  const [status,  setStatus]  = useState(null);
  const [config,  setConfig]  = useState(null);
  const [loadErr, setLoadErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobile,  setMobile]  = useState(() => window.innerWidth < 700);

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 700);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true); setLoadErr(null);
    try {
      // Ustawia sesję admina, gdy panel otwierany jest bez wchodzenia do gry
      const who = await api.adminDash.sessionCheck();
      if (!who?.isAdmin) { setLoadErr('To konto nie ma postaci z rangą GameAdmin'); return; }
      const [st, sv, cfg] = await Promise.all([api.adminDash.stats(), api.adminDash.status(), api.adminDash.config()]);
      if (st.error || sv.error) { setLoadErr(st.error || sv.error || 'Brak uprawnień'); return; }
      setStats(st); setStatus(sv);
      if (Array.isArray(cfg)) setConfig(cfg);
    } catch (e) { setLoadErr('Błąd połączenia: ' + e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: FF }}>
      <span style={{ color: T.red, fontSize: 22 }}>🛡</span>
      <div style={{ color: T.red, fontWeight: 'bold', fontSize: 14, letterSpacing: '2px' }}>PANEL ADMINISTRATORA</div>
      <div style={{ width: 200, height: 2, background: 'rgba(200,150,32,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '60%', background: `linear-gradient(90deg,${T.goldDim},${T.gold})`, animation: 'dash 1s ease infinite' }} />
      </div>
      <div style={{ color: T.muted, fontSize: 10 }}>Ładowanie panelu...</div>
      <style>{`@keyframes dash{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
    </div>
  );

  if (loadErr) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, fontFamily: FF, padding: '0 20px' }}>
      <span style={{ fontSize: 40 }}>⚠️</span>
      <div style={{ color: T.red, fontWeight: 'bold', fontSize: 14 }}>Błąd Panelu Admina</div>
      <div style={{ color: T.text, fontSize: 11, padding: '10px 16px', background: 'rgba(50,4,4,0.6)', border: `1px solid ${T.red}44`, borderRadius: 8, maxWidth: 400, textAlign: 'center' }}>{loadErr}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <SBtn onClick={loadAll}>↻ Spróbuj ponownie</SBtn>
        <SBtn onClick={onEnterGame} variant="ghost">⚔ Wejdź do gry</SBtn>
        <SBtn onClick={onLogout} variant="danger">Wyloguj</SBtn>
      </div>
    </div>
  );

  const maint = status?.config?.maintenance === '1' || status?.config?.maintenance === true;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: T.bg, display: 'flex', flexDirection: 'column', fontFamily: FF }}>

      {/* ── TOPBAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: mobile ? '8px 14px' : '10px 22px', flexShrink: 0, background: T.surface, borderBottom: `1px solid ${T.border}`, boxShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ color: T.red, fontSize: 18 }}>🛡</span>
          {!mobile && (
            <div>
              <div style={{ color: T.red, fontWeight: 'bold', fontSize: 13, letterSpacing: '1.5px' }}>ADMIN PANEL</div>
              <div style={{ color: T.dim, fontSize: 8, letterSpacing: '1px' }}>VELDORIA · ZARZĄDZANIE</div>
            </div>
          )}
          {mobile && <span style={{ color: T.red, fontWeight: 'bold', fontSize: 12 }}>ADMIN</span>}
        </div>

        {/* Server status pill */}
        {status && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 12px', background: 'rgba(8,13,5,0.6)', border: `1px solid ${T.border}`, borderRadius: 20 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: maint ? T.red : T.green, boxShadow: `0 0 6px ${maint ? T.red : T.green}` }} />
            {!mobile && <span style={{ color: T.goldDim, fontSize: 10, fontWeight: 'bold' }}>{status.config?.name || 'Veldoria'}</span>}
            <span style={{ color: T.green, fontSize: 10, fontWeight: 'bold' }}>{status.online || 0} online</span>
            {maint && <Chip color={T.red}>MAINT</Chip>}
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <SBtn onClick={onEnterGame} style={{ padding: mobile ? '6px 10px' : '7px 16px' }}>
            ⚔ {mobile ? 'Gra' : 'Wejdź do gry'}
          </SBtn>
          <SBtn onClick={onLogout} variant="danger" style={{ padding: mobile ? '6px 10px' : '7px 14px' }}>
            {mobile ? '✕' : 'Wyloguj'}
          </SBtn>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: mobile ? 'column' : 'row' }}>

        {/* Mobile: top tabs */}
        {mobile && (
          <div style={{ display: 'flex', flexShrink: 0, overflowX: 'auto', background: T.surface, borderBottom: `1px solid ${T.border}`, WebkitOverflowScrolling: 'touch' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '7px 10px', border: 'none', flexShrink: 0, cursor: 'pointer', fontSize: 8, color: tab === t.id ? T.gold : T.muted, fontWeight: tab === t.id ? 'bold' : 'normal', borderBottom: `2px solid ${tab === t.id ? T.goldDim : 'transparent'}`, background: tab === t.id ? 'rgba(74,122,42,0.07)' : 'transparent', minHeight: 48, minWidth: 52, fontFamily: FF }}>
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                <span style={{ whiteSpace: 'nowrap', fontSize: 7 }}>{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Desktop: left sidebar */}
        {!mobile && (
          <div style={{ width: 172, flexShrink: 0, background: T.surface, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 16px', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 11, color: tab === t.id ? T.gold : T.muted, fontWeight: tab === t.id ? 'bold' : 'normal', borderLeft: `3px solid ${tab === t.id ? T.goldDim : 'transparent'}`, background: tab === t.id ? 'rgba(74,122,42,0.08)' : 'transparent', transition: 'all .12s', fontFamily: FF }}>
                <span style={{ fontSize: 15 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ padding: '8px 10px', borderTop: `1px solid ${T.border}` }}>
              <SBtn onClick={loadAll} variant="ghost" wide style={{ fontSize: 9, padding: '5px' }}>↻ Odśwież dane</SBtn>
            </div>
          </div>
        )}

        {/* Content — minHeight:0 required on every flex child for iOS scroll */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {tab === 'overview' && <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}><OverviewTab stats={stats} status={status} onRefresh={loadAll} /></div>}
          {tab === 'settings' && <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column' }}><SettingsTab config={config} onSaved={loadAll} /></div>}
          {tab === 'servers'  && <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}><ServersTab /></div>}
          {tab === 'players'  && <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}><PlayersTab /></div>}
          {tab === 'assets'   && <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}><AssetsTab /></div>}
          {tab === 'audit'    && <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}><AuditTab /></div>}
          {tab === 'world' && (
            <Suspense fallback={<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>Ładowanie edytora...</div>}>
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><WorldEditor /></div>
            </Suspense>
          )}
          {tab === 'quests' && (
            <Suspense fallback={<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>Ładowanie...</div>}>
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><QuestEditor /></div>
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
