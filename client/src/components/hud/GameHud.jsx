// Ekran rozgrywki (komputer): górny pasek, panel bohatera, śledzenie zadań,
// dolny pasek z kulami HP/EN i skrótami. Oprawa: ciemny kamień + złote ramki.
import { useEffect, useState } from 'react';
import { api } from '../../api';
import { C, fmtNum } from '../../ui/kit';

const G = {
  gold: '#e7c158', goldHi: '#f7e3a4', goldDim: '#96793a', bronze: '#7a5f2a',
  text: '#e8e2d4', muted: '#9a9182', dim: '#5e584c',
  hp: '#8e1f18', hpHi: '#e5624c',
  en: '#1b3f8f', enHi: '#4b8ef0',
  exp: '#9a7422', expHi: '#f0d071',
  serif: "'Cinzel','Palatino Linotype',Palatino,serif",
  stone: 'linear-gradient(180deg,#221d18 0%,#17130f 45%,#0d0b09 100%)',
  stoneSoft: 'linear-gradient(180deg,#1d1914 0%,#120f0c 100%)',
};

// ── Ozdobna ramka z rombami w rogach ─────────────────────────────────────────
function Corner({ pos }) {
  const [v, h] = pos;
  return (
    <span style={{
      position: 'absolute', [v]: -3, [h]: -3, width: 6, height: 6,
      transform: 'rotate(45deg)', background: G.gold, boxShadow: `0 0 6px ${G.gold}aa`,
      pointerEvents: 'none',
    }} />
  );
}

export function Ornate({ children, style, pad = 10, soft }) {
  return (
    <div style={{
      position: 'relative',
      background: soft ? G.stoneSoft : G.stone,
      border: `1px solid ${G.bronze}`,
      borderRadius: 4,
      padding: pad,
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 22px rgba(0,0,0,0.6)',
      ...style,
    }}>
      <Corner pos={['top', 'left']} /><Corner pos={['top', 'right']} />
      <Corner pos={['bottom', 'left']} /><Corner pos={['bottom', 'right']} />
      {children}
    </div>
  );
}

function Rule({ w = '100%' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: w, margin: '6px 0' }}>
      <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${G.bronze})` }} />
      <span style={{ width: 5, height: 5, transform: 'rotate(45deg)', border: `1px solid ${G.goldDim}` }} />
      <span style={{ flex: 1, height: 1, background: `linear-gradient(270deg, transparent, ${G.bronze})` }} />
    </div>
  );
}

export function expInfo(postac) {
  const lvl = postac?.poziom || 1;
  const a = lvl > 1 ? Math.pow(lvl - 1, 4) + 10 : 0;
  const b = Math.pow(lvl, 4) + 10;
  const pct = Math.max(0, Math.min(100, ((Number(postac?.exp) - a) / (b - a)) * 100));
  return { pct, a, b };
}

// ── Pasek z połyskiem ────────────────────────────────────────────────────────
function Bar({ value, max, from, to, label, height = 14 }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div style={{
      position: 'relative', height, flex: 1, overflow: 'hidden', borderRadius: 2,
      background: 'linear-gradient(180deg,#08070a,#121016)',
      border: '1px solid #000',
      boxShadow: `inset 0 2px 5px rgba(0,0,0,0.9), 0 0 0 1px ${G.bronze}55`,
    }}>
      <div style={{
        width: `${pct}%`, height: '100%', position: 'relative',
        background: `linear-gradient(180deg, ${to} 0%, ${from} 60%, #000 190%)`,
        boxShadow: `0 0 12px ${to}55`, transition: 'width .3s',
      }}>
        <span style={{
          position: 'absolute', inset: '0 0 55% 0',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.28), transparent)',
        }} />
      </div>
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        fontSize: Math.max(9, height - 5), color: '#fff', fontWeight: 600,
        textShadow: '0 1px 2px #000, 0 0 6px rgba(0,0,0,0.9)', letterSpacing: 0.3,
      }}>{label ?? `${fmtNum(value)} / ${fmtNum(max)}`}</div>
    </div>
  );
}

// ── Górny pasek ──────────────────────────────────────────────────────────────
export function TopBar({ postac, mapa, worldState, tokens, onAuction, onRanking, onMail, onSettings, unread }) {
  const exp = expInfo(postac);
  const [zegar, setZegar] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setZegar(new Date()), 20000);
    return () => clearInterval(id);
  }, []);

  const Sep = () => <span style={{ width: 1, alignSelf: 'stretch', margin: '2px 4px', background: `linear-gradient(180deg,transparent,${G.bronze},transparent)` }} />;

  const btn = (icon, label, onClick, badge) => (
    <button onClick={onClick} title={label} style={{
      display: 'flex', alignItems: 'center', gap: 7, padding: '7px 11px', cursor: 'pointer',
      background: 'transparent', border: '1px solid transparent', borderRadius: 4,
      color: G.muted, fontSize: 12.5, fontFamily: G.serif, position: 'relative', letterSpacing: 0.4,
    }}
      onMouseEnter={e => { e.currentTarget.style.color = G.goldHi; e.currentTarget.style.background = 'rgba(231,193,88,0.08)'; e.currentTarget.style.borderColor = `${G.bronze}`; }}
      onMouseLeave={e => { e.currentTarget.style.color = G.muted; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>{label}
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: 3, right: 3, minWidth: 15, height: 15, borderRadius: 8,
          background: '#a8281c', border: '1px solid #e5624c', color: '#fff', fontSize: 9,
          display: 'grid', placeItems: 'center', padding: '0 3px',
        }}>{badge}</span>
      )}
    </button>
  );

  const pill = (icon, value, color) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', whiteSpace: 'nowrap',
      background: 'linear-gradient(180deg,#191510,#0d0b08)', border: `1px solid ${G.bronze}`,
      borderRadius: 999, color, fontSize: 12.5, fontWeight: 600,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
    }}>{icon} {value}</span>
  );

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', flexShrink: 0,
      background: 'linear-gradient(180deg,#1d1811 0%,#12100c 60%,#0a0907 100%)',
      borderBottom: `2px solid ${G.bronze}`,
      boxShadow: '0 6px 18px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      fontFamily: C.font, position: 'relative', zIndex: 70,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, paddingRight: 6 }}>
        <span style={{
          fontFamily: G.serif, fontSize: 19, letterSpacing: 4, fontWeight: 700,
          background: 'linear-gradient(180deg,#f7e3a4,#d8ab3d 60%,#9a7526)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>VELDORIA</span>
        <span style={{ fontFamily: G.serif, fontSize: 7, letterSpacing: 4, color: G.goldDim, marginTop: 2 }}>ONLINE RPG</span>
      </div>
      <Sep />

      <div style={{
        width: 30, height: 38, flexShrink: 0, imageRendering: 'pixelated', borderRadius: 3,
        border: `1px solid ${G.bronze}`, background: '#0c0a08',
        backgroundImage: `url(/assets/${postac.obrazek})`, backgroundPosition: 'center -2px', backgroundRepeat: 'no-repeat',
      }} />
      <span style={{ color: G.text, fontSize: 13, whiteSpace: 'nowrap', fontFamily: G.serif }}>
        Lv. {postac.poziom} <b style={{ color: G.goldHi }}>{postac.nazwa}</b>
      </span>
      <span style={{
        padding: '3px 10px', borderRadius: 999, fontSize: 11, whiteSpace: 'nowrap',
        background: 'linear-gradient(180deg,rgba(168,40,28,0.35),rgba(80,18,12,0.35))',
        border: '1px solid rgba(229,98,76,0.5)', color: '#ffb0a0',
      }}>{postac.profesja}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 170, maxWidth: 300, flex: 1 }}>
        <Bar value={exp.pct} max={100} from={G.exp} to={G.expHi} height={12} label={`${exp.pct.toFixed(2)}%`} />
      </div>

      {pill('🪙', fmtNum(postac.zloto), G.goldHi)}
      {tokens > 0 && pill('💎', fmtNum(tokens), '#e88ad8')}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
        {btn('🏪', 'Aukcja', onAuction)}
        {btn('🏆', 'Ranking', onRanking)}
        {btn('✉', 'Poczta', onMail, unread)}
        {btn('⚙', 'Ustawienia', onSettings)}
        <Sep />
        <span style={{ color: G.muted, fontSize: 12.5, whiteSpace: 'nowrap', fontFamily: G.serif }}>
          {worldState?.pora === 'noc' ? '🌙' : worldState?.pora === 'swit' ? '🌅' : worldState?.pora === 'zmierzch' ? '🌇' : '☀'}{' '}
          {zegar.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
        </span>

      </div>
    </header>
  );
}

// ── Lewy panel bohatera ──────────────────────────────────────────────────────
export function HeroPanel({ postac, actions, footer }) {
  const exp = expInfo(postac);
  const [hov, setHov] = useState(null);

  const stats = [
    ['⚔', 'Atak', `${postac.obrazenia_min} – ${postac.obrazenia_max}`],
    ['🛡', 'Obrona', postac.ac ?? 0],
    ['💪', 'Siła', postac.sila ?? 0],
    ['🏹', 'Zręczność', postac.zrecznosc ?? 0],
    ['🧠', 'Inteligencja', postac.intelekt ?? 0],
    ['🎯', 'Celność', postac.sa ?? 0],
  ];

  return (
    <aside style={{
      width: 238, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 9,
      padding: '10px 10px 14px', overflowY: 'auto',
      background: 'linear-gradient(180deg,#171309 0%,#0f0c08 55%,#080706 100%)',
      borderRight: `2px solid ${G.bronze}`,
      boxShadow: 'inset -10px 0 24px rgba(0,0,0,0.55)',
      fontFamily: C.font,
    }}>
      {/* Portret */}
      <Ornate pad={11} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{
          position: 'relative', width: 84, height: 94, display: 'grid', placeItems: 'center',
          background: 'radial-gradient(ellipse at 50% 88%, rgba(231,193,88,0.22), rgba(6,5,4,0.95) 68%)',
          border: `1px solid ${G.goldDim}`, borderRadius: 3,
          boxShadow: `inset 0 0 22px rgba(0,0,0,0.9), 0 0 16px rgba(231,193,88,0.12)`,
        }}>
          <Corner pos={['top', 'left']} /><Corner pos={['top', 'right']} />
          <Corner pos={['bottom', 'left']} /><Corner pos={['bottom', 'right']} />
          <div style={{
            width: 32, height: 48, transform: 'scale(1.85)', imageRendering: 'pixelated',
            backgroundImage: `url(/assets/${postac.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.8))',
          }} />
        </div>
        <div style={{ fontFamily: G.serif, fontSize: 19, color: G.goldHi, letterSpacing: 1, textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
          {postac.nazwa}
        </div>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          <span style={{ color: G.muted, fontSize: 12, fontFamily: G.serif }}>Lv. {postac.poziom}</span>
          <span style={{
            padding: '2px 9px', borderRadius: 999, fontSize: 10,
            background: 'linear-gradient(180deg,rgba(168,40,28,0.35),rgba(80,18,12,0.35))',
            border: '1px solid rgba(229,98,76,0.5)', color: '#ffb0a0',
          }}>{postac.profesja}</span>
        </div>
      </Ornate>

      {/* Paski */}
      <Ornate pad={11} soft style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {[
          ['HP', postac.zycie, postac.zycie_max, G.hp, G.hpHi, '#ff9b8b', null],
          ['EN', postac.energia ?? 0, postac.energia_max ?? 100, G.en, G.enHi, '#8fbaff', null],
          ['EXP', exp.pct, 100, G.exp, G.expHi, G.gold, `${exp.pct.toFixed(2)}%`],
        ].map(([label, v, m, from, to, col, txt]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 28, color: col, fontSize: 10.5, fontFamily: G.serif, letterSpacing: 0.5 }}>{label}</span>
            <Bar value={v} max={m} from={from} to={to} label={txt} />
          </div>
        ))}
      </Ornate>

      {/* Statystyki */}
      <Ornate pad="10px 12px" soft>
        <div style={{ fontFamily: G.serif, fontSize: 10, letterSpacing: 3, color: G.goldDim, textAlign: 'center' }}>STATYSTYKI</div>
        <Rule />
        {stats.map(([icon, label, val]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3.5px 0', fontSize: 12 }}>
            <span style={{ width: 16, textAlign: 'center', opacity: 0.85 }}>{icon}</span>
            <span style={{ color: G.muted }}>{label}</span>
            <span style={{ flex: 1, height: 1, background: 'repeating-linear-gradient(90deg, rgba(231,193,88,0.18) 0 2px, transparent 2px 5px)' }} />
            <span style={{ color: G.text, fontWeight: 700, fontFamily: G.serif }}>{val}</span>
          </div>
        ))}
      </Ornate>

      {/* Menu */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {actions.map(a => (
          <button key={a.label} onClick={a.onClick}
            onMouseEnter={() => setHov(a.label)} onMouseLeave={() => setHov(null)}
            title={a.skrot ? `${a.label} (${a.skrot})` : a.label}
            style={{
              position: 'relative', padding: '7px 8px', cursor: 'pointer', borderRadius: 4,
              display: 'flex', alignItems: 'center', gap: 7, textAlign: 'left', minWidth: 0,
              background: hov === a.label ? 'linear-gradient(180deg,#2c2418,#171208)' : G.stone,
              border: `1px solid ${hov === a.label ? G.gold : G.bronze}`,
              boxShadow: hov === a.label
                ? `0 0 14px rgba(231,193,88,0.25), inset 0 0 0 1px rgba(0,0,0,0.7)`
                : 'inset 0 0 0 1px rgba(0,0,0,0.7)',
              color: hov === a.label ? G.goldHi : G.text,
              fontSize: 11, fontFamily: G.serif, letterSpacing: 0.3,
              transition: 'all .12s',
            }}>
            <span style={{ fontSize: 15, width: 18, textAlign: 'center', flexShrink: 0, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.7))' }}>{a.icon}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.label}</span>
            {a.skrot && (
              <span style={{ position: 'absolute', top: 2, right: 4, fontSize: 8, color: G.dim }}>{a.skrot}</span>
            )}
            {a.uwaga && <span style={{
              position: 'absolute', top: 5, left: 6, width: 7, height: 7, borderRadius: '50%',
              background: G.gold, boxShadow: `0 0 8px ${G.gold}`,
            }} />}
          </button>
        ))}
      </div>

      {/* Czat pod przyciskami menu — zajmuje resztę wysokości panelu */}
      {footer && <div style={{ flex: 1, minHeight: 250, display: 'flex', flexDirection: 'column' }}>{footer}</div>}
    </aside>
  );
}

// ── Lokalizacja pod minimapą ─────────────────────────────────────────────────
export function LocationBox({ mapa, postac }) {
  return (
    <Ornate pad="8px 12px" soft style={{ textAlign: 'center', minWidth: 150 }}>
      <div style={{ fontFamily: G.serif, fontSize: 13, color: G.goldHi, letterSpacing: 1 }}>{mapa?.nazwa}</div>
      <div style={{ color: G.muted, fontSize: 11, marginTop: 2 }}>X: {postac.x} &nbsp; Y: {postac.y}</div>
    </Ornate>
  );
}

// ── Śledzenie zadań ──────────────────────────────────────────────────────────
const QUEST_MARK = {
  kill:     { icon: '!', bg: 'rgba(168,40,28,0.25)', bd: '#e5624c', fg: '#ff9b8b' },
  location: { icon: '?', bg: 'rgba(40,120,60,0.25)', bd: '#5fd07a', fg: '#9be8ac' },
  item:     { icon: '!', bg: 'rgba(231,193,88,0.2)', bd: G.gold, fg: G.goldHi },
};

export function QuestTracker({ onOpen }) {
  const [quests, setQuests] = useState([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = () => api.quests.list()
      .then(r => { if (alive && Array.isArray(r)) setQuests(r.filter(q => q.status === 'aktywny')); })
      .catch(() => {});
    load();
    const id = setInterval(load, 20000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <Ornate pad={0} style={{ overflow: 'hidden', fontFamily: C.font }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
        background: 'linear-gradient(90deg, rgba(231,193,88,0.16), rgba(231,193,88,0.02))',
        border: 'none', borderBottom: `1px solid ${G.bronze}`, cursor: 'pointer',
        color: G.goldHi, fontFamily: G.serif, fontSize: 13, letterSpacing: 0.5,
      }}>
        Aktywne zadania ({quests.length})
        <span style={{ marginLeft: 'auto', color: G.muted, fontSize: 11 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ maxHeight: 230, overflowY: 'auto' }}>
          {quests.length === 0 && (
            <div style={{ padding: '14px 12px', color: G.dim, fontSize: 12 }}>Brak aktywnych zadań</div>
          )}
          {quests.map(q => {
            const m = QUEST_MARK[q.typ] || QUEST_MARK.item;
            return (
              <button key={q.quest_id} onClick={onOpen} style={{
                width: '100%', textAlign: 'left', display: 'flex', gap: 9, padding: '9px 12px',
                background: 'none', border: 'none', borderBottom: '1px solid rgba(231,193,88,0.07)', cursor: 'pointer',
              }}>
                <span style={{
                  width: 20, height: 20, flexShrink: 0, borderRadius: 3, display: 'grid', placeItems: 'center',
                  background: m.bg, border: `1px solid ${m.bd}`, color: m.fg, fontSize: 12, fontWeight: 'bold',
                }}>{m.icon}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', color: G.text, fontSize: 12.5, fontFamily: G.serif }}>{q.nazwa}</span>
                  <span style={{ display: 'block', color: G.muted, fontSize: 11, marginTop: 1 }}>
                    {q.typ === 'kill' ? `Pokonaj: ${q.postep}/${q.cel_ilosc}` : (q.opis?.slice(0, 46) || 'W toku')}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Ornate>
  );
}

// ── Kula zasobu w ozdobnej oprawie ───────────────────────────────────────────
function Orb({ value, max, from, to, label, size = 104 }) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const frame = size + 22;
  return (
    <div title={`${label}: ${value} / ${max}`} style={{ position: 'relative', width: frame, height: frame, flexShrink: 0, zIndex: 2 }}>
      {/* zewnętrzna obręcz z nitami */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 30%, #3a2f1f, #120e09 70%)',
        border: `2px solid ${G.goldDim}`,
        boxShadow: `0 12px 28px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,255,255,0.08), 0 0 0 1px #000, 0 0 18px ${to}22`,
      }} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
        <span key={a} style={{
          position: 'absolute', left: '50%', top: '50%', width: a % 90 ? 5 : 8, height: a % 90 ? 5 : 8,
          transform: `translate(-50%,-50%) rotate(${a}deg) translateY(${-frame / 2 + 6}px) rotate(45deg)`,
          background: a % 90 ? G.goldDim : G.gold, boxShadow: `0 0 5px ${G.gold}88`,
        }} />
      ))}
      {/* szklana kula */}
      <div style={{
        position: 'absolute', inset: 11, borderRadius: '50%', overflow: 'hidden', background: '#07060a',
        border: `2px solid ${G.bronze}`, boxShadow: 'inset 0 0 22px rgba(0,0,0,0.95), 0 0 0 1px #000',
      }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: `${pct * 100}%`,
          background: `radial-gradient(ellipse at 50% 0%, ${to} 0%, ${to} 30%, ${from} 95%)`,
          boxShadow: `0 0 30px ${to}, inset 0 6px 14px rgba(255,255,255,0.22)`, transition: 'height .35s',
        }} />
        <span style={{
          position: 'absolute', top: '7%', left: '18%', width: '48%', height: '30%', borderRadius: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0))', pointerEvents: 'none',
        }} />
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: 'inset 0 -12px 20px rgba(0,0,0,0.7)', pointerEvents: 'none' }} />
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 13, fontWeight: 700,
          textShadow: '0 1px 3px #000, 0 0 8px rgba(0,0,0,0.9)', fontFamily: G.serif, textAlign: 'center', lineHeight: 1.1,
        }}>{fmtNum(value)}<br /><span style={{ fontSize: 9.5, opacity: 0.8 }}>/ {fmtNum(max)}</span></div>
      </div>
    </div>
  );
}

// Pojedyncze pole paska (kwadratowe lub okrągłe) z klawiszem pod spodem
function BarSlot({ k, title, onClick, children, count, round, active, dim, badge }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <button onClick={onClick} title={title} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
        width: 48, height: 48, borderRadius: round ? '50%' : 3, cursor: 'pointer', position: 'relative', padding: 0,
        background: active ? 'radial-gradient(circle at 50% 35%, #5a4520, #1d160b)' : 'linear-gradient(180deg,#221c14,#0a0907)',
        border: `1px solid ${active || hov ? G.gold : G.bronze}`,
        boxShadow: active ? `0 0 14px ${G.gold}66` : 'inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -8px 12px rgba(0,0,0,0.7), 0 0 0 1px #000',
        display: 'grid', placeItems: 'center', color: G.text, fontSize: 22, opacity: dim ? 0.45 : 1,
        transform: hov ? 'translateY(-1px)' : 'none', transition: 'all .1s',
      }}>
        {children}
        {count != null && (
          <span style={{ position: 'absolute', right: 3, bottom: 1, fontSize: 11, color: '#fff', fontWeight: 700, textShadow: '0 1px 2px #000, 0 0 3px #000' }}>{count}</span>
        )}
        {badge && <span style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: '50%', background: '#5fd07a', boxShadow: '0 0 6px #5fd07a' }} />}
      </button>
      <span style={{ fontSize: 10, color: G.muted, fontFamily: G.serif, lineHeight: 1 }}>{k}</span>
    </div>
  );
}

// ── Dolny pasek: kule HP/EN, umiejętności 1–4, mikstury F1–F3, skróty ────────
export function BottomBar({ postac, potions = [], onUsePotion, skills = [], onSkill, extras = [] }) {
  const Sep = () => <span style={{ width: 1, alignSelf: 'stretch', margin: '4px 5px 16px', background: `linear-gradient(180deg,transparent,${G.goldDim},transparent)` }} />;
  return (
    <div style={{ display: 'flex', alignItems: 'center', fontFamily: C.font }}>
      <Orb value={postac.zycie} max={postac.zycie_max} from={G.hp} to={G.hpHi} label="Życie" />

      <div style={{
        position: 'relative', margin: '0 -16px', padding: '9px 28px 5px', display: 'flex', alignItems: 'flex-start', gap: 6,
        background: 'linear-gradient(180deg,#221c14 0%,#15110c 55%,#0b0907 100%)',
        borderTop: `2px solid ${G.goldDim}`, borderBottom: `2px solid ${G.goldDim}`,
        boxShadow: '0 10px 24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px #000',
      }}>
        {[0, 1, 2, 3].map(i => {
          const s = skills[i];
          return (
            <BarSlot key={`s${i}`} k={String(i + 1)} onClick={() => onSkill?.(i)} dim={!s}
              title={s ? `${s.name} — ${s.desc} (EN ${s.cost}). Kliknij, aby zaatakować; w walce klawisz ${i + 1} użyje umiejętności.` : 'Brak umiejętności'}>
              {s ? <span style={{ color: '#f7c77a', filter: 'drop-shadow(0 0 5px rgba(247,160,90,0.7))', fontFamily: G.serif }}>{s.icon}</span> : <span style={{ color: G.dim, fontSize: 14 }}>—</span>}
            </BarSlot>
          );
        })}
        <Sep />
        {[0, 1, 2].map(i => {
          const p = potions[i];
          return (
            <BarSlot key={`p${i}`} k={`F${i + 1}`} dim={!p} count={p ? (p.ilosc || 1) : null}
              title={p ? `${p.nazwa} (F${i + 1})` : 'Brak mikstury'} onClick={() => p && onUsePotion?.(p)}>
              {p ? (
                <span style={{
                  width: 32, height: 32, imageRendering: 'pixelated', display: 'block',
                  backgroundImage: `url(/assets/${p.obrazek})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                }} />
              ) : <span style={{ color: G.dim, fontSize: 14 }}>—</span>}
            </BarSlot>
          );
        })}
        {extras.length > 0 && <Sep />}
        {extras.map(x => (
          <BarSlot key={x.label} k={x.k} round title={x.label} onClick={x.onClick} active={x.active} badge={x.badge}>
            <span style={{ fontSize: 20, filter: 'drop-shadow(0 1px 2px #000)' }}>{x.icon}</span>
          </BarSlot>
        ))}
      </div>

      <Orb value={postac.energia ?? 0} max={postac.energia_max ?? 100} from={G.en} to={G.enHi} label="Energia" />
    </div>
  );
}

// ── Szybki dostęp (prawy dolny róg) ──────────────────────────────────────────
export function QuickAccess({ items = [] }) {
  const [hov, setHov] = useState(null);
  return (
    <Ornate pad={6} style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 170 }}>
      {items.map(it => (
        <button key={it.label} onClick={it.onClick}
          onMouseEnter={() => setHov(it.label)} onMouseLeave={() => setHov(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px', cursor: 'pointer',
            background: hov === it.label ? 'rgba(231,193,88,0.1)' : 'transparent',
            border: `1px solid ${hov === it.label ? G.bronze : 'transparent'}`, borderRadius: 3,
            color: hov === it.label ? G.goldHi : G.text, fontFamily: G.serif, fontSize: 12.5, textAlign: 'left',
          }}>
          <span style={{
            width: 20, height: 20, display: 'grid', placeItems: 'center', flexShrink: 0,
            border: `1px solid ${G.bronze}`, borderRadius: 3, background: '#0c0a08',
            color: G.gold, fontSize: 10, fontWeight: 700, fontFamily: C.font,
          }}>{it.skrot}</span>
          <span style={{ fontSize: 15 }}>{it.icon}</span>
          {it.label}
        </button>
      ))}
    </Ornate>
  );
}

export { G as hudColors };

// ── Komunikat administratora na środku ekranu (socket: admin_announce) ───────
export function AdminAnnounce({ socket }) {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    if (!socket) return;
    let timer;
    const on = (m) => {
      setMsg(m);
      clearTimeout(timer);
      timer = setTimeout(() => setMsg(null), 8000);
      if (m.sound) {
        try {
          const ac = new (window.AudioContext || window.webkitAudioContext)();
          [660, 880].forEach((f, i) => {
            const o = ac.createOscillator(), g = ac.createGain();
            o.frequency.value = f; o.type = 'triangle';
            g.gain.setValueAtTime(0.0001, ac.currentTime + i * 0.18);
            g.gain.exponentialRampToValueAtTime(0.18, ac.currentTime + i * 0.18 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + i * 0.18 + 0.35);
            o.connect(g).connect(ac.destination);
            o.start(ac.currentTime + i * 0.18); o.stop(ac.currentTime + i * 0.18 + 0.4);
          });
        } catch { /* przeglądarka blokuje dźwięk bez interakcji — pomijamy */ }
      }
    };
    socket.on('admin_announce', on);
    return () => { socket.off('admin_announce', on); clearTimeout(timer); };
  }, [socket]);

  if (!msg) return null;
  return (
    <div onClick={() => setMsg(null)} style={{
      position: 'fixed', left: '50%', top: '22%', transform: 'translateX(-50%)', zIndex: 990,
      width: 'min(620px, calc(100vw - 32px))', cursor: 'pointer', animation: 'annIn .35s ease-out',
    }}>
      <Ornate pad="16px 22px" style={{ textAlign: 'center', boxShadow: '0 0 40px rgba(231,193,88,0.25), 0 20px 50px rgba(0,0,0,0.8)' }}>
        <div style={{ fontFamily: G.serif, fontSize: 12, letterSpacing: 4, color: G.goldDim, marginBottom: 6 }}>📢 KOMUNIKAT SERWERA</div>
        <div style={{ fontFamily: G.serif, fontSize: 19, color: G.goldHi, lineHeight: 1.4, textShadow: '0 2px 6px #000' }}>{msg.message}</div>
        {msg.from && <div style={{ fontSize: 11.5, color: G.muted, marginTop: 8 }}>— {msg.from}</div>}
      </Ornate>
      <style>{`@keyframes annIn{from{opacity:0;transform:translate(-50%,-14px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
    </div>
  );
}
