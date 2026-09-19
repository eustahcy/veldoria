// Ekran rozgrywki (komputer): górny pasek, panel bohatera, kolumna z minimapą
// i zadaniami, dolny pasek z kulami HP/EN i skrótami.
import { useEffect, useState } from 'react';
import { api } from '../../api';
import { C, fmtNum } from '../../ui/kit';

const G = {
  gold: '#e7c158', goldDim: '#96793a',
  bg: 'rgba(10,9,14,0.92)',
  bgSoft: 'rgba(18,16,22,0.9)',
  line: 'rgba(231,193,88,0.25)',
  lineSoft: 'rgba(231,193,88,0.12)',
  text: '#e8e2d4', muted: '#9a9182', dim: '#5e584c',
  hp: '#c0392b', hpHi: '#e5624c',
  en: '#2a62c4', enHi: '#4b8ef0',
  exp: '#d8ab3d', expHi: '#f0d071',
  serif: "'Cinzel','Palatino Linotype',Palatino,serif",
};

const frame = {
  background: G.bg,
  border: `1px solid ${G.line}`,
  borderRadius: 8,
  boxShadow: '0 10px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
};

export function expInfo(postac) {
  const lvl = postac?.poziom || 1;
  const a = lvl > 1 ? Math.pow(lvl - 1, 4) + 10 : 0;
  const b = Math.pow(lvl, 4) + 10;
  const pct = Math.max(0, Math.min(100, ((Number(postac?.exp) - a) / (b - a)) * 100));
  return { pct, a, b };
}

function Bar({ value, max, from, to, label, height = 13, showText = true }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div style={{
      position: 'relative', height, flex: 1, borderRadius: 3, overflow: 'hidden',
      background: '#0a0a0c', border: '1px solid rgba(0,0,0,0.9)',
      boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.8)',
    }}>
      <div style={{
        width: `${pct}%`, height: '100%',
        background: `linear-gradient(180deg, ${to} 0%, ${from} 55%, ${from} 100%)`,
        boxShadow: `0 0 10px ${to}66`, transition: 'width .3s',
      }} />
      {showText && (
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          fontSize: height - 4, color: '#fff', textShadow: '0 1px 2px #000', fontWeight: 600,
        }}>{label ?? `${fmtNum(value)} / ${fmtNum(max)}`}</div>
      )}
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

  const btn = (icon, label, onClick, badge) => (
    <button onClick={onClick} title={label} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', cursor: 'pointer',
      background: 'transparent', border: `1px solid transparent`, borderRadius: 6,
      color: G.muted, fontSize: 12, fontFamily: G.serif, position: 'relative',
    }}
      onMouseEnter={e => { e.currentTarget.style.color = G.gold; e.currentTarget.style.borderColor = G.lineSoft; }}
      onMouseLeave={e => { e.currentTarget.style.color = G.muted; e.currentTarget.style.borderColor = 'transparent'; }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>{label}
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: 2, right: 2, minWidth: 15, height: 15, borderRadius: 8,
          background: '#c0392b', color: '#fff', fontSize: 9, display: 'grid', placeItems: 'center', padding: '0 3px',
        }}>{badge}</span>
      )}
    </button>
  );

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '6px 14px', flexShrink: 0,
      background: 'linear-gradient(180deg,#14121a,#0b0a0f)',
      borderBottom: `1px solid ${G.line}`, fontFamily: C.font,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 12, borderRight: `1px solid ${G.lineSoft}` }}>
        <span style={{ fontFamily: G.serif, fontSize: 17, letterSpacing: 3, color: G.gold }}>VELDORIA</span>
      </div>

      <div style={{
        width: 26, height: 34, flexShrink: 0, imageRendering: 'pixelated',
        backgroundImage: `url(/assets/${postac.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat',
      }} />
      <span style={{ color: G.text, fontSize: 13, whiteSpace: 'nowrap' }}>
        Lv. {postac.poziom} <b style={{ color: G.gold }}>{postac.nazwa}</b>
      </span>
      <span style={{
        padding: '2px 9px', borderRadius: 999, fontSize: 11, whiteSpace: 'nowrap',
        background: 'rgba(192,57,43,0.18)', border: '1px solid rgba(229,98,76,0.45)', color: '#ff9a88',
      }}>{postac.profesja}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 190, maxWidth: 260, flex: 1 }}>
        <Bar value={exp.pct} max={100} from={G.exp} to={G.expHi} height={11} label={`${exp.pct.toFixed(2)}%`} />
      </div>

      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: G.gold, fontSize: 13, whiteSpace: 'nowrap' }}>
        🪙 {fmtNum(postac.zloto)}
      </span>
      {tokens > 0 && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e06ad0', fontSize: 13 }}>💎 {fmtNum(tokens)}</span>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
        {btn('🏪', 'Aukcja', onAuction)}
        {btn('🏆', 'Ranking', onRanking)}
        {btn('✉', 'Poczta', onMail, unread)}
        {btn('⚙', 'System', onSettings)}
        <span style={{ marginLeft: 10, color: G.muted, fontSize: 12 }}>
          {worldState?.pora === 'noc' ? '🌙' : worldState?.pora === 'swit' ? '🌅' : worldState?.pora === 'zmierzch' ? '🌇' : '☀'}{' '}
          {zegar.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span style={{
          marginLeft: 8, padding: '3px 10px', borderRadius: 6, fontSize: 11,
          border: `1px solid ${G.lineSoft}`, color: G.muted,
        }}>{mapa?.nazwa || 'Veldoria'}</span>
      </div>
    </header>
  );
}

// ── Lewy panel bohatera ──────────────────────────────────────────────────────
export function HeroPanel({ postac, actions }) {
  const exp = expInfo(postac);
  const en = postac.energia ?? 0;
  const enMax = postac.energia_max ?? 100;

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
      width: 236, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10,
      padding: 10, overflowY: 'auto',
      background: 'linear-gradient(180deg,#14121a,#0b0a0f)', borderRight: `1px solid ${G.line}`,
      fontFamily: C.font,
    }}>
      {/* Portret */}
      <div style={{ ...frame, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 86, height: 96, display: 'grid', placeItems: 'center', borderRadius: 8,
          background: 'radial-gradient(ellipse at 50% 90%, rgba(231,193,88,0.18), rgba(6,6,10,0.9) 70%)',
          border: `1px solid ${G.line}`,
        }}>
          <div style={{
            width: 32, height: 48, transform: 'scale(1.7)', imageRendering: 'pixelated',
            backgroundImage: `url(/assets/${postac.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat',
          }} />
        </div>
        <div style={{ fontFamily: G.serif, fontSize: 18, color: G.text }}>{postac.nazwa}</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ color: G.muted, fontSize: 12 }}>Lv. {postac.poziom}</span>
          <span style={{
            padding: '2px 8px', borderRadius: 999, fontSize: 10,
            background: 'rgba(192,57,43,0.18)', border: '1px solid rgba(229,98,76,0.45)', color: '#ff9a88',
          }}>{postac.profesja}</span>
        </div>
      </div>

      {/* Paski */}
      <div style={{ ...frame, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 26, color: '#ff8b78', fontSize: 11 }}>HP</span>
          <Bar value={postac.zycie} max={postac.zycie_max} from={G.hp} to={G.hpHi} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 26, color: '#7fb0ff', fontSize: 11 }}>EN</span>
          <Bar value={en} max={enMax} from={G.en} to={G.enHi} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 26, color: G.gold, fontSize: 11 }}>EXP</span>
          <Bar value={exp.pct} max={100} from={G.exp} to={G.expHi} label={`${exp.pct.toFixed(2)}%`} />
        </div>
      </div>

      {/* Statystyki */}
      <div style={{ ...frame, padding: '8px 10px' }}>
        {stats.map(([icon, label, val]) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0',
            borderBottom: `1px solid rgba(255,255,255,0.03)`, fontSize: 12,
          }}>
            <span style={{ width: 16, textAlign: 'center', opacity: 0.8 }}>{icon}</span>
            <span style={{ flex: 1, color: G.muted }}>{label}</span>
            <span style={{ color: G.text, fontWeight: 600 }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        {actions.map(a => (
          <button key={a.label} onClick={a.onClick} title={a.skrot ? `${a.label} (${a.skrot})` : a.label} style={{
            ...frame, padding: '10px 4px', cursor: 'pointer', position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: G.text, fontSize: 11, fontFamily: C.font,
            borderColor: a.uwaga ? 'rgba(231,193,88,0.6)' : G.line,
          }}>
            <span style={{ fontSize: 17 }}>{a.icon}</span>{a.label}
            {a.uwaga && <span style={{
              position: 'absolute', top: 4, right: 6, width: 7, height: 7, borderRadius: '50%',
              background: G.gold, boxShadow: `0 0 6px ${G.gold}`,
            }} />}
          </button>
        ))}
      </div>
    </aside>
  );
}

// ── Prawa kolumna: minimapa + zadania ────────────────────────────────────────
export function QuestTracker({ onOpen }) {
  const [quests, setQuests] = useState([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = () => api.quests.list().then(r => { if (alive && Array.isArray(r)) setQuests(r.filter(q => q.status === 'aktywny')); }).catch(() => {});
    load();
    const id = setInterval(load, 20000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <div style={{ ...frame, overflow: 'hidden', fontFamily: C.font }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
        background: 'linear-gradient(90deg, rgba(231,193,88,0.12), transparent)',
        border: 'none', borderBottom: `1px solid ${G.lineSoft}`, cursor: 'pointer',
        color: G.gold, fontFamily: G.serif, fontSize: 13,
      }}>
        Aktywne zadania ({quests.length})
        <span style={{ marginLeft: 'auto', color: G.muted, fontSize: 11 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ maxHeight: 210, overflowY: 'auto' }}>
          {quests.length === 0 && (
            <div style={{ padding: '12px 10px', color: G.dim, fontSize: 12 }}>Brak aktywnych zadań</div>
          )}
          {quests.map(q => (
            <button key={q.quest_id} onClick={onOpen} style={{
              width: '100%', textAlign: 'left', display: 'flex', gap: 8, padding: '8px 10px',
              background: 'none', border: 'none', borderBottom: `1px solid rgba(255,255,255,0.03)`, cursor: 'pointer',
            }}>
              <span style={{
                width: 18, height: 18, flexShrink: 0, borderRadius: 4, display: 'grid', placeItems: 'center',
                background: 'rgba(231,193,88,0.15)', color: G.gold, fontSize: 11, fontWeight: 'bold',
              }}>!</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', color: G.text, fontSize: 12.5 }}>{q.nazwa}</span>
                <span style={{ display: 'block', color: G.muted, fontSize: 11 }}>
                  {q.typ === 'kill' ? `Pokonaj: ${q.postep}/${q.cel_ilosc}` : q.opis?.slice(0, 44) || 'W toku'}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Dolny pasek: kule + sloty ────────────────────────────────────────────────
function Orb({ value, max, from, to, label }) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <div title={`${label}: ${value}/${max}`} style={{
      width: 72, height: 72, borderRadius: '50%', position: 'relative', flexShrink: 0,
      background: '#0a0a0c', border: `2px solid ${G.line}`, overflow: 'hidden',
      boxShadow: '0 6px 20px rgba(0,0,0,0.7), inset 0 0 16px rgba(0,0,0,0.9)',
    }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: `${pct * 100}%`,
        background: `linear-gradient(180deg, ${to}, ${from})`, transition: 'height .3s',
        boxShadow: `0 0 18px ${to}88`,
      }} />
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        color: '#fff', fontSize: 11, fontWeight: 700, textShadow: '0 1px 3px #000',
      }}>{Math.round(pct * 100)}%</div>
    </div>
  );
}

export function BottomBar({ postac, potions = [], onUsePotion, shortcuts = [] }) {
  const exp = expInfo(postac);
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 60,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 18,
      padding: '0 16px 10px', pointerEvents: 'none', fontFamily: C.font,
    }}>
      <div style={{ pointerEvents: 'auto' }}>
        <Orb value={postac.zycie} max={postac.zycie_max} from={G.hp} to={G.hpHi} label="Życie" />
      </div>

      <div style={{ pointerEvents: 'auto', ...frame, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {shortcuts.map((s, i) => (
            <button key={s.label} onClick={s.onClick} title={`${s.label} (${s.skrot || i + 1})`} style={{
              width: 46, height: 46, borderRadius: 6, cursor: 'pointer', position: 'relative',
              background: 'linear-gradient(180deg,#1b1922,#0d0c11)', border: `1px solid ${G.lineSoft}`,
              color: G.text, fontSize: 19, display: 'grid', placeItems: 'center',
            }}>
              {s.icon}
              <span style={{ position: 'absolute', bottom: 1, right: 3, fontSize: 8, color: G.dim }}>{s.skrot || i + 1}</span>
            </button>
          ))}
          <span style={{ width: 1, background: G.lineSoft, margin: '2px 4px' }} />
          {potions.slice(0, 4).map(p => (
            <button key={p.id} onClick={() => onUsePotion?.(p)} title={p.nazwa} style={{
              width: 46, height: 46, borderRadius: 6, cursor: 'pointer', position: 'relative',
              background: 'linear-gradient(180deg,#1b1922,#0d0c11)', border: `1px solid ${G.lineSoft}`,
              display: 'grid', placeItems: 'center',
            }}>
              <span style={{
                width: 30, height: 30, imageRendering: 'pixelated',
                backgroundImage: `url(/assets/${p.obrazek})`, backgroundSize: 'contain',
                backgroundPosition: 'center', backgroundRepeat: 'no-repeat', display: 'block',
              }} />
              {p.ilosc > 1 && (
                <span style={{ position: 'absolute', bottom: 1, left: 3, fontSize: 9, color: G.text, textShadow: '0 1px 2px #000' }}>{p.ilosc}</span>
              )}
            </button>
          ))}
        </div>
        <Bar value={exp.pct} max={100} from={G.exp} to={G.expHi} height={8} label={`${exp.pct.toFixed(2)}%`} />
      </div>

      <div style={{ pointerEvents: 'auto' }}>
        <Orb value={postac.energia ?? 0} max={postac.energia_max ?? 100} from={G.en} to={G.enHi} label="Energia" />
      </div>
    </div>
  );
}

export { frame as hudFrame, G as hudColors };
