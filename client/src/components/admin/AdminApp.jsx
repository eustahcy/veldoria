// Wspólna oprawa panelu administratora (w grze i na stronie): nagłówek z logo,
// boczne menu z opisami, pasek stanu na dole. Na telefonie menu zamienia się
// w przewijany pasek ikon, a okno zajmuje cały ekran.
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';

export const A = {
  gold: '#e7c158', goldHi: '#f7e3a4', goldDim: '#96793a', bronze: '#7a5f2a',
  text: '#e8e2d4', muted: '#9a9182', dim: '#5e584c',
  green: '#5fd07a', red: '#ff7a68', blue: '#6fb2ff', purple: '#c79bff', amber: '#f0a24b', cyan: '#5ec8ff',
  serif: "'Cinzel','Palatino Linotype',Palatino,serif",
  font: "'Trebuchet MS', Verdana, sans-serif",
  panel: 'linear-gradient(180deg,#1a1611 0%,#110e0b 100%)',
};

export function useNarrow(bp = 900) {
  const [n, setN] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setN(window.innerWidth < bp);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return n;
}

// Karta z nagłówkiem (ikona, tytuł, podtytuł) — podstawowy blok przeglądu
export function Box({ icon, title, sub, children, style, pad = 14, right }) {
  return (
    <div style={{
      background: A.panel, border: `1px solid ${A.bronze}aa`, borderRadius: 4, minWidth: 0,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 6px 18px rgba(0,0,0,0.35)', ...style,
    }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${pad - 2}px ${pad}px 10px`, borderBottom: `1px solid ${A.bronze}55` }}>
          {icon && <span style={{ fontSize: 22, color: A.gold, width: 28, textAlign: 'center', filter: 'drop-shadow(0 0 6px rgba(231,193,88,0.35))' }}>{icon}</span>}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: A.serif, fontSize: 15.5, color: A.goldHi }}>{title}</div>
            {sub && <div style={{ fontSize: 12, color: A.muted, marginTop: 1 }}>{sub}</div>}
          </div>
          {right}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}

export function GoldBtn({ children, onClick, disabled, style, tone }) {
  const red = tone === 'red';
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '11px 16px', borderRadius: 3, cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? '#0e0c0a' : red ? 'linear-gradient(180deg,#3a1410,#1a0907)' : 'linear-gradient(180deg,#4a3818,#241a0b)',
      border: `1px solid ${disabled ? '#3a3122' : red ? '#a8281c' : A.gold}`, color: disabled ? A.dim : red ? '#ff8b78' : A.goldHi,
      fontFamily: A.serif, fontSize: 14, letterSpacing: 0.4,
      boxShadow: disabled ? 'none' : `0 0 12px ${red ? 'rgba(168,40,28,0.25)' : 'rgba(231,193,88,0.18)'}, inset 0 1px 0 rgba(255,255,255,0.1)`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...style,
    }}>{children}</button>
  );
}

const fmtUptime = (s = 0) => {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
};

function Clock({ withDate }) {
  const [t, setT] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  if (!withDate) return t.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return (
    <div style={{ textAlign: 'center', lineHeight: 1.25 }}>
      <div style={{ color: A.text, fontSize: 14 }}>{t.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</div>
      <div style={{ color: A.muted, fontSize: 11.5 }}>{t.toLocaleDateString('pl-PL')}</div>
    </div>
  );
}

const HeadBtn = ({ children, onClick, title }) => (
  <button onClick={onClick} title={title} aria-label={title} style={{
    width: 38, height: 38, borderRadius: 3, cursor: 'pointer', background: 'rgba(0,0,0,0.35)',
    border: `1px solid ${A.bronze}`, color: A.goldHi, fontSize: 17, display: 'grid', placeItems: 'center',
  }}>{children}</button>
);

/**
 * tabs: [{ id, icon, label, sub, render: (ctx) => JSX, fill?: bool }]
 * me:   { nazwa, ranga }
 */
export default function AdminApp({ tabs, me, onClose, onLogout, headerExtra, initial = 'overview', standalone }) {
  const narrow = useNarrow(900);
  const [tab, setTab] = useState(initial);
  const [status, setStatus] = useState(null);
  const [max, setMax] = useState(standalone);

  const loadStatus = useCallback(() => {
    api.adminDash.status().then(s => { if (s && !s.error) setStatus(s); }).catch(() => {});
  }, []);
  useEffect(() => { loadStatus(); const id = setInterval(loadStatus, 15000); return () => clearInterval(id); }, [loadStatus]);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && onClose && !standalone) onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose, standalone]);

  const cur = tabs.find(t => t.id === tab) || tabs[0];
  const full = narrow || max;
  const online = status?.online ?? 0;
  const maint = !!status?.config?.maintenance;

  const ctx = { status, reloadStatus: loadStatus, go: setTab, me, narrow };

  const logo = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {!narrow && <span style={{ color: A.goldDim, fontSize: 13 }}>✧</span>}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
        <span style={{
          fontFamily: A.serif, fontSize: narrow ? 17 : 25, letterSpacing: narrow ? 3 : 6, fontWeight: 700,
          background: 'linear-gradient(180deg,#f7e3a4,#d8ab3d 60%,#9a7526)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>VELDORIA</span>
        <span style={{ fontFamily: A.serif, fontSize: narrow ? 6.5 : 8, letterSpacing: 4, color: A.goldDim, marginTop: 3 }}>ONLINE RPG</span>
      </div>
      {!narrow && <span style={{ color: A.goldDim, fontSize: 13 }}>✧</span>}
    </div>
  );

  const nav = narrow ? (
    <div style={{ display: 'flex', overflowX: 'auto', gap: 4, padding: '6px 8px', borderBottom: `1px solid ${A.bronze}88`, background: '#0d0b08', flexShrink: 0, scrollbarWidth: 'none' }}>
      {tabs.map(t => {
        const on = t.id === cur.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flexShrink: 0, minWidth: 66, padding: '7px 8px', borderRadius: 3, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: on ? 'linear-gradient(180deg,rgba(231,193,88,0.22),rgba(231,193,88,0.05))' : 'transparent',
            border: `1px solid ${on ? A.gold : 'transparent'}`, color: on ? A.goldHi : A.muted, fontFamily: A.serif, fontSize: 11,
          }}>
            <span style={{ fontSize: 19 }}>{t.icon}</span>{t.label}
          </button>
        );
      })}
      {onLogout && (
        <button onClick={onLogout} style={{
          flexShrink: 0, minWidth: 66, padding: '7px 8px', borderRadius: 3, cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          background: 'transparent', border: '1px solid transparent', color: '#ff8b78', fontFamily: A.serif, fontSize: 11,
        }}><span style={{ fontSize: 19 }}>⇥</span>Wyloguj</button>
      )}
    </div>
  ) : (
    <aside style={{ width: 232, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${A.bronze}88`, background: 'linear-gradient(180deg,#14110d,#0c0a08)', overflowY: 'auto' }}>
      <div style={{ padding: '10px 10px 0', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {tabs.map(t => {
          const on = t.id === cur.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 13, padding: '10px 12px', borderRadius: 3, cursor: 'pointer', textAlign: 'left',
              background: on ? 'linear-gradient(90deg,rgba(231,193,88,0.2),rgba(231,193,88,0.04))' : 'transparent',
              border: `1px solid ${on ? A.gold : 'transparent'}`, boxShadow: on ? '0 0 14px rgba(231,193,88,0.15)' : 'none',
              borderBottom: on ? `1px solid ${A.gold}` : `1px solid ${A.bronze}33`,
            }}>
              <span style={{ fontSize: 22, width: 28, textAlign: 'center', filter: on ? 'drop-shadow(0 0 6px rgba(231,193,88,0.5))' : 'none' }}>{t.icon}</span>
              <span>
                <span style={{ display: 'block', fontFamily: A.serif, fontSize: 14.5, color: on ? A.goldHi : A.text }}>{t.label}</span>
                {t.sub && <span style={{ display: 'block', fontSize: 11.5, color: A.muted, marginTop: 1 }}>{t.sub}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1, minHeight: 16 }} />
      {onLogout && (
        <div style={{ padding: '0 12px 12px' }}>
          <GoldBtn tone="red" onClick={onLogout} style={{ width: '100%', fontSize: 13.5 }}>⇥ Wyloguj się</GoldBtn>
        </div>
      )}
      <div style={{ padding: '12px 16px 14px', borderTop: `1px solid ${A.bronze}55`, fontSize: 12, color: A.muted, lineHeight: 1.8 }}>
        <div style={{ color: A.dim, marginBottom: 4 }}>Informacje o serwerze</div>
        <div>🖥 {status?.config?.name || 'Veldoria'}</div>
        <div>👤 {me?.ranga || 'GameAdmin'} - {me?.nazwa || '—'}</div>
        <div>💾 {status?.memMB ?? '—'} MB pamięci</div>
        <div>🕒 Czas: <Clock /></div>
      </div>
    </aside>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: standalone ? '#0a0806' : 'rgba(0,0,0,0.72)', backdropFilter: standalone ? 'none' : 'blur(3px)',
      padding: full ? 0 : 24, fontFamily: A.font, color: A.text,
    }}>
      <div style={{
        width: full ? '100%' : 'min(1500px, 100%)', height: full ? '100%' : 'min(920px, 100%)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(180deg,#15120e,#0b0907)',
        border: full ? 'none' : `1px solid ${A.goldDim}`, borderRadius: full ? 0 : 6,
        boxShadow: full ? 'none' : `0 0 0 1px #000, 0 0 0 4px #120e09, 0 0 0 5px ${A.bronze}, 0 30px 80px rgba(0,0,0,0.9)`,
        paddingTop: narrow ? 'env(safe-area-inset-top, 0px)' : 0, paddingBottom: narrow ? 'env(safe-area-inset-bottom, 0px)' : 0,
      }}>
        {/* ── Nagłówek ── */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: narrow ? 10 : 22, padding: narrow ? '9px 12px' : '14px 22px', flexShrink: 0,
          borderBottom: `1px solid ${A.bronze}`, background: 'linear-gradient(180deg,#1f1a13,#110e0a)',
        }}>
          {!narrow && logo}
          {!narrow && <span style={{ width: 1, alignSelf: 'stretch', background: `linear-gradient(180deg,transparent,${A.bronze},transparent)` }} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
            {!narrow && <span style={{ fontSize: 30, filter: 'drop-shadow(0 0 8px rgba(231,193,88,0.35))' }}>🛡️</span>}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: A.serif, fontSize: narrow ? 14 : 18, color: A.goldHi, letterSpacing: narrow ? 1 : 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{narrow ? 'PANEL ADMINA' : 'PANEL ADMINISTRATORA'}</div>
              <div style={{ fontSize: narrow ? 11 : 13, color: A.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me?.nazwa || '—'} - {me?.ranga || 'GameAdmin'}</div>
            </div>
          </div>
          {headerExtra}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: narrow ? '6px' : '6px 14px', borderRadius: 999, flexShrink: 0,
            border: `1px solid ${maint ? '#a8281c' : '#2f6b3a'}`, background: maint ? 'rgba(168,40,28,0.15)' : 'rgba(95,208,122,0.08)',
            color: maint ? A.red : A.green, fontSize: 13,
          }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: maint ? A.red : A.green, boxShadow: `0 0 8px ${maint ? A.red : A.green}` }} />
            {!narrow && (maint ? 'Konserwacja' : 'Live')}
          </span>
          {!narrow && <Clock withDate />}
          {!narrow && !standalone && <HeadBtn title={max ? 'Pomniejsz' : 'Pełny ekran'} onClick={() => setMax(m => !m)}>{max ? '⤡' : '⤢'}</HeadBtn>}
          {onClose && <HeadBtn title="Zamknij" onClick={onClose}>✕</HeadBtn>}
        </header>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: narrow ? 'column' : 'row' }}>
          {nav}
          <main style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {cur.fill ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', zoom: cur.legacy ? (narrow ? 1.12 : 1.25) : undefined }}>
                {cur.render(ctx)}
              </div>
            ) : (
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
                <div style={{ padding: narrow ? 10 : '16px 20px', zoom: cur.legacy ? (narrow ? 1.12 : 1.25) : undefined }}>
                  {cur.render(ctx)}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* ── Pasek stanu ── */}
        {!narrow && (
          <footer style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '9px 22px', borderTop: `1px solid ${A.bronze}88`, fontSize: 12.5, color: A.muted, flexShrink: 0, background: '#0d0b08' }}>
            <span style={{ color: maint ? A.red : A.green }}>● {maint ? 'Tryb konserwacji' : 'Serwer online'}</span>
            <span>👥 {online} gracz(y) online</span>
            <span>⏱ Uptime: {fmtUptime(status?.uptime)}</span>
            {!standalone && <span style={{ marginLeft: 'auto', color: A.dim }}>Esc — zamknij</span>}
          </footer>
        )}
      </div>
    </div>
  );
}
