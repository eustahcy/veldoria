import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { api } from '../api';
import AdminApp, { GoldBtn } from './admin/AdminApp';
import { adminTabs } from './AdminPanel';

const WorldEditor = lazy(() => import('./WorldEditor'));
const QuestEditor = lazy(() => import('./QuestEditor'));

// ── Design system ─────────────────────────────────────────────────────────────
const T = {
  bg:       '#0b0907',
  surface:  'rgba(24,20,15,0.98)',
  card:     'linear-gradient(180deg,#1a1611,#100d0a)',
  raised:   'rgba(30,25,18,0.98)',
  border:   'rgba(122,95,42,0.6)',
  borderHi: '#e7c158',
  gold:     '#f7e3a4',
  goldDim:  '#e7c158',
  text:     '#e8e2d4',
  muted:    '#9a9182',
  dim:      '#6b6456',
  red:      '#ff7a68',
  green:    '#5fd07a',
  blue:     '#6fb2ff',
  amber:    '#f0a24b',
  purple:   '#c79bff',
  cyan:     '#5ec8ff',
};

const FF = "'Trebuchet MS', Verdana, sans-serif";
const FS = "'Cinzel','Palatino Linotype',Palatino,serif";

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

// ── SERWERY ─────────────────────────────────────────────────────────────────
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

// ── PANEL NA STRONIE (bez wchodzenia do gry) ──────────────────────────────────
export default function AdminDashboard({ onEnterGame, onLogout }) {
  const [loadErr, setLoadErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [me,      setMe]      = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true); setLoadErr(null);
    try {
      // Ustawia sesję admina, gdy panel otwierany jest bez wchodzenia do gry
      const who = await api.adminDash.sessionCheck();
      if (!who?.isAdmin) { setLoadErr('To konto nie ma postaci z rangą GameAdmin'); return; }
      const list = await api.adminDash.players().catch(() => []);
      const mine = Array.isArray(list) ? list.find(p => p.id === who.postacId) : null;
      setMe({ id: who.postacId, nazwa: mine?.nazwa || 'Administrator', ranga: mine?.ranga || 'GameAdmin', mapa: mine?.mapa || 1 });
      const sv = await api.adminDash.status();
      if (!sv || sv.error) { setLoadErr(sv?.error || 'Brak uprawnień'); return; }
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

  const lazyPane = (el) => (
    <Suspense fallback={<div style={{ flex: 1, display: 'grid', placeItems: 'center', color: T.muted }}>Ładowanie…</div>}>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>{el}</div>
    </Suspense>
  );
  const tabs = adminTabs({ myId: me?.id, currentMap: me?.mapa || 1 });
  tabs.splice(4, 0,
    { id: 'world',   icon: '🧱', label: 'Edytor map', sub: 'Malowanie i kolizje', render: () => lazyPane(<WorldEditor />), fill: true },
    { id: 'quests',  icon: '📜', label: 'Questy',     sub: 'Tworzenie zadań',     render: () => lazyPane(<QuestEditor />), fill: true },
  );
  tabs.push({ id: 'servers', icon: '🌐', label: 'Serwery', sub: 'Lista serwerów gry', render: () => <ServersTab />, legacy: true });

  return (
    <AdminApp
      standalone
      me={me}
      tabs={tabs}
      onLogout={onLogout}
      headerExtra={<GoldBtn onClick={onEnterGame} style={{ padding: '8px 14px', fontSize: 13 }}>⚔ Wejdź do gry</GoldBtn>}
    />
  );
}
