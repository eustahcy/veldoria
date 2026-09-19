// Ekran ekwipunku: pasek zakładek, lalka postaci, plecak, karta przedmiotu.
// Nakładka jest lekko przezroczysta — HUD gry (czat, kule, minimapa) zostaje widoczny.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api';
import { rarityOf, typeLabel, itemStats, headline, fmtNum, useIsNarrow, WEAPON_TYPES } from '../ui/kit';
import { Ornate, hudColors as G } from './hud/GameHud';

const FONT = "'Trebuchet MS', Verdana, sans-serif";
const PROFESJE = ['Wojownik', 'Paladyn', 'Tancerz Ostrzy', 'Lowca', 'Tropiciel', 'Mag'];

// Rozkład slotów wokół postaci (kolumna, wiersz)
export const DOLL = [
  { id: 'armor',  types: ['Zbroja'],    label: 'Zbroja',    col: 1, row: 1 },
  { id: 'weapon', types: WEAPON_TYPES,  label: 'Broń',      col: 1, row: 2 },
  { id: 'gloves', types: ['Rekawice'],  label: 'Rękawice',  col: 1, row: 3 },
  { id: 'ring',   types: ['Pierscien'], label: 'Pierścień', col: 1, row: 4 },
  { id: 'helm',   types: ['Helm'],      label: 'Hełm',      col: 2, row: 1 },
  { id: 'tali',   types: ['Talizman'],  label: 'Talizman',  col: 2, row: 4 },
  { id: 'neck',   types: ['Naszyjnik'], label: 'Naszyjnik', col: 3, row: 1 },
  { id: 'shield', types: ['Tarcza'],    label: 'Tarcza',    col: 3, row: 2 },
  { id: 'boots',  types: ['Buty'],      label: 'Buty',      col: 3, row: 3 },
  { id: 'arrows', types: ['Strzaly'],   label: 'Strzały',   col: 3, row: 4 },
];
export const GEAR = DOLL.flatMap(d => d.types);

export const CATS = [
  { id: 'all',   label: 'Wszystko',  test: () => true },
  { id: 'gear',  label: 'Ekwipunek', test: i => GEAR.includes(i.typ) },
  { id: 'mikst', label: 'Mikstury',  test: i => i.typ === 'Konsupcyjne' },
  { id: 'inne',  label: 'Inne',      test: i => !GEAR.includes(i.typ) && i.typ !== 'Konsupcyjne' },
];

export function expPct(p) {
  const lvl = p?.poziom || 1;
  const a = lvl > 1 ? Math.pow(lvl - 1, 4) + 10 : 0;
  const b = Math.pow(lvl, 4) + 10;
  return Math.max(0, Math.min(100, ((Number(p?.exp) - a) / (b - a)) * 100));
}

// ── Elementy ─────────────────────────────────────────────────────────────────
function Title({ children, onClose }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9, padding: '0 2px 10px', marginBottom: 12,
      borderBottom: `1px solid ${G.bronze}`,
    }}>
      <span style={{ width: 8, height: 8, transform: 'rotate(45deg)', border: `1.5px solid ${G.gold}` }} />
      <span style={{ fontFamily: G.serif, fontSize: 17, color: G.goldHi, letterSpacing: 0.6 }}>{children}</span>
      {onClose && (
        <button onClick={onClose} style={{
          marginLeft: 'auto', background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 15,
        }}>✕</button>
      )}
    </div>
  );
}

export function Icon({ item, size }) {
  return (
    <span style={{
      width: size, height: size, display: 'block', imageRendering: 'pixelated',
      backgroundImage: `url(/assets/${item.obrazek})`, backgroundSize: 'contain',
      backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
      filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.75))',
    }} />
  );
}

export function Slot({ item, size = 62, selected, label, onClick, dim }) {
  const r = item ? rarityOf(item) : null;
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      title={item ? item.nazwa : label}
      style={{
        width: '100%', aspectRatio: '1', minWidth: 0, maxWidth: size, position: 'relative', padding: 0,
        display: 'grid', placeItems: 'center', cursor: item ? 'pointer' : 'default',
        background: selected
          ? 'radial-gradient(ellipse at 50% 40%, rgba(231,193,88,0.18), #0d0b08 70%)'
          : `radial-gradient(ellipse at 50% 20%, ${r ? r.color + '1c' : 'rgba(255,255,255,0.03)'}, #0b0907 72%)`,
        border: `1px solid ${selected ? G.gold : hov && item ? G.goldDim : r && item.klasa !== 'normal' ? r.color + '88' : G.bronze + 'aa'}`,
        borderRadius: 4,
        boxShadow: selected
          ? `0 0 0 1px ${G.gold}, 0 0 16px rgba(231,193,88,0.35), inset 0 0 12px rgba(0,0,0,0.8)`
          : 'inset 0 2px 8px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.04)',
        opacity: dim ? 0.45 : 1,
        transition: 'border-color .1s',
      }}>
      {item ? <Icon item={item} size="64%" /> : (
        <span style={{ fontSize: 9, color: G.dim, textAlign: 'center', padding: 2 }}>{label}</span>
      )}
      {item?.ilosc > 1 && (
        <span style={{
          position: 'absolute', right: 4, bottom: 2, fontSize: 11, fontWeight: 700, color: '#fff',
          textShadow: '0 1px 2px #000, 0 0 4px #000',
        }}>{item.ilosc}</span>
      )}
      {item?.zalozony === 1 && (
        <span style={{ position: 'absolute', left: 4, top: 2, fontSize: 10, color: '#8fd67a', textShadow: '0 1px 2px #000' }}>✓</span>
      )}
    </button>
  );
}

export function Bar({ pct, from, to, height = 10 }) {
  return (
    <div style={{
      flex: 1, height, borderRadius: 2, overflow: 'hidden', background: '#08070a',
      border: '1px solid #000', boxShadow: `inset 0 2px 4px rgba(0,0,0,0.9), 0 0 0 1px ${G.bronze}55`,
    }}>
      <div style={{
        width: `${pct}%`, height: '100%', position: 'relative',
        background: `linear-gradient(180deg, ${to}, ${from})`, boxShadow: `0 0 10px ${to}66`,
      }}>
        <span style={{ position: 'absolute', inset: '0 0 55% 0', background: 'linear-gradient(180deg, rgba(255,255,255,0.3), transparent)' }} />
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, disabled, tone }) {
  const col = tone === 'red' ? '#ff8b78' : tone === 'green' ? '#9be8ac' : G.goldHi;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '8px 18px', minWidth: 92, borderRadius: 3, cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? '#0e0c0a' : 'linear-gradient(180deg,#2a2217,#120e09)',
      border: `1px solid ${disabled ? '#3a3122' : G.bronze}`,
      color: disabled ? G.dim : col, fontFamily: G.serif, fontSize: 13, letterSpacing: 0.4,
      boxShadow: disabled ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.07)',
    }}>{children}</button>
  );
}

// ── Karta przedmiotu ─────────────────────────────────────────────────────────
export function ItemDetails({ item, compare, postac }) {
  if (!item) {
    return <div style={{ color: G.dim, fontSize: 13, textAlign: 'center', padding: '40px 10px' }}>
      Wybierz przedmiot, aby zobaczyć szczegóły
    </div>;
  }
  const r = rarityOf(item);
  const head = headline(item);
  const stats = itemStats(item).filter(s => !(head && s.key === 'ac' && head.label === 'PANCERZ'));
  const cmp = compare ? itemStats(compare) : [];
  const meetsLvl = !item.wym_poziom || postac.poziom >= item.wym_poziom;
  const prof = PROFESJE.filter((_, i) => Number(item[`prof${i + 1}`]) === 1);
  const meetsProf = !prof.length || prof.includes(postac.profesja);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 76, height: 96, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 4,
          background: `radial-gradient(ellipse at 50% 30%, ${r.color}22, #0b0907 70%)`,
          border: `1px solid ${r.color}99`, boxShadow: 'inset 0 0 14px rgba(0,0,0,0.85)',
        }}>
          <Icon item={item} size={54} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: G.serif, fontSize: 17, color: r.color, lineHeight: 1.2 }}>{item.nazwa}</div>
          <div style={{ color: G.muted, fontSize: 12, marginTop: 3 }}>{r.label} · {typeLabel(item.typ)}</div>
          {item.wym_poziom > 0 && (
            <div style={{ color: meetsLvl ? G.muted : '#ff7a68', fontSize: 12, marginTop: 2 }}>Od poziomu: {item.wym_poziom}</div>
          )}
          {head && (
            <div style={{ fontSize: 13, marginTop: 8 }}>
              <span style={{ color: G.muted }}>{head.label === 'ATAK' ? 'Wartość ataku: ' : 'Pancerz: '}</span>
              <span style={{ color: '#8fe07a', fontWeight: 700 }}>{head.value}</span>
            </div>
          )}
        </div>
      </div>

      {stats.length > 0 && (
        <div style={{ padding: '10px 0', borderTop: `1px solid ${G.bronze}66`, borderBottom: `1px solid ${G.bronze}66` }}>
          {stats.map(s => {
            const c = cmp.find(x => x.key === s.key);
            const diff = compare ? s.num - (c?.num || 0) : 0;
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, padding: '2px 0', color: '#8fb8ff' }}>
                <span>{s.label} {s.value}</span>
                {compare && diff !== 0 && (
                  <span style={{ marginLeft: 'auto', color: diff > 0 ? '#8fe07a' : '#ff7a68', fontSize: 11 }}>
                    {diff > 0 ? '▲' : '▼'}{Math.abs(diff)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ padding: '10px 0', color: G.muted, fontSize: 12.5, lineHeight: 1.6 }}>
        <div style={{ color: G.goldDim }}>[ Do ubrania ]</div>
        <div style={{ color: meetsProf ? G.text : '#ff7a68' }}>{prof.length ? prof.join(', ') : 'Wszystkie klasy'}</div>
      </div>

      {compare && (
        <div style={{ fontSize: 11.5, color: G.dim, marginBottom: 8 }}>
          Porównanie z założonym: <span style={{ color: rarityOf(compare).color }}>{compare.nazwa}</span>
        </div>
      )}

      {item.opis && (
        <div style={{
          padding: '8px 10px', borderLeft: `2px solid ${G.bronze}`, background: 'rgba(0,0,0,0.35)',
          color: G.muted, fontSize: 12, fontStyle: 'italic', lineHeight: 1.5, marginBottom: 8,
        }}>{item.opis}</div>
      )}

      {item.wartosc_sprzedazy > 0 && (
        <div style={{ color: G.gold, fontSize: 12.5 }}>🪙 Wartość sprzedaży: <b>{fmtNum(item.wartosc_sprzedazy)}</b></div>
      )}
    </div>
  );
}

// ── Pasek zakładek u góry ────────────────────────────────────────────────────
const NAV = [
  { id: 'mapa',     icon: '🗺', label: 'Mapa' },
  { id: 'postac',   icon: '🧍', label: 'Postać' },
  { id: 'ekwipunek', icon: '🎒', label: 'Ekwipunek' },
  { id: 'talenty',  icon: '⭐', label: 'Talenty' },
  { id: 'zadania',  icon: '📜', label: 'Zadania' },
  { id: 'gildia',   icon: '⚜', label: 'Gildia' },
  { id: 'aukcja',   icon: '🏪', label: 'Aukcja' },
];

function TopNav({ postac, onNavigate, onClose, narrow }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', gap: 4, padding: narrow ? '0 8px' : '0 16px',
      background: 'linear-gradient(180deg,#1d1811 0%,#12100c 60%,#0a0907 100%)',
      borderBottom: `2px solid ${G.bronze}`, boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
      minHeight: 54, overflowX: 'auto', flexShrink: 0,
    }}>
      {!narrow && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', lineHeight: 1, paddingRight: 14 }}>
            <span style={{
              fontFamily: G.serif, fontSize: 19, letterSpacing: 4, fontWeight: 700,
              background: 'linear-gradient(180deg,#f7e3a4,#d8ab3d 60%,#9a7526)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>VELDORIA</span>
            <span style={{ fontFamily: G.serif, fontSize: 7, letterSpacing: 4, color: G.goldDim, marginTop: 3 }}>ONLINE RPG</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 16px', borderLeft: `1px solid ${G.bronze}55`, borderRight: `1px solid ${G.bronze}55` }}>
            <span style={{
              width: 26, height: 36, imageRendering: 'pixelated',
              backgroundImage: `url(/assets/${postac.obrazek})`, backgroundPosition: 'center -2px', backgroundRepeat: 'no-repeat',
            }} />
            <span style={{ color: G.text, fontFamily: G.serif, fontSize: 13, whiteSpace: 'nowrap' }}>Lv. {postac.poziom} {postac.nazwa}</span>
            <span style={{
              padding: '2px 9px', borderRadius: 999, fontSize: 11, whiteSpace: 'nowrap',
              background: 'rgba(168,40,28,0.3)', border: '1px solid rgba(229,98,76,0.5)', color: '#ffb0a0',
            }}>{postac.profesja}</span>
          </div>
        </>
      )}
      {NAV.map(n => {
        const on = n.id === 'ekwipunek';
        return (
          <button key={n.id} onClick={() => (n.id === 'mapa' ? onClose() : on ? null : onNavigate?.(n.id))} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px', cursor: 'pointer', whiteSpace: 'nowrap',
            background: on ? 'linear-gradient(180deg,rgba(231,193,88,0.2),rgba(231,193,88,0.05))' : 'transparent',
            border: 'none', borderLeft: on ? `1px solid ${G.bronze}` : '1px solid transparent',
            borderRight: on ? `1px solid ${G.bronze}` : '1px solid transparent',
            borderBottom: on ? `2px solid ${G.gold}` : '2px solid transparent',
            color: on ? G.goldHi : G.muted, fontFamily: G.serif, fontSize: 13.5,
          }}>
            <span style={{ fontSize: 15 }}>{n.icon}</span>{n.label}
          </button>
        );
      })}
      <button onClick={onClose} title="Zamknij (Esc)" style={{
        marginLeft: 'auto', padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer',
        color: G.muted, fontSize: 20,
      }}>✕</button>
    </div>
  );
}

// ── Główny komponent ─────────────────────────────────────────────────────────
export default function Inventory({ onClose, onRefresh, postac, onNavigate }) {
  const narrow = useIsNarrow(980);
  const [items, setItems] = useState([]);
  const [sel, setSel] = useState(null);
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState('typ');
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    const data = await api.items.inventory();
    if (Array.isArray(data)) {
      setItems(data);
      setSel(prev => (prev ? data.find(i => i.id === prev.id) || null : null));
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const on = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [onClose]);

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 2600); };
  const after = async (r, okText) => {
    if (r?.error || r?.ok === false) return flash(r.error || 'Nie udało się', false);
    await load(); onRefresh?.(); flash(okText);
  };

  const equipped = useMemo(() => items.filter(i => i.zalozony === 1), [items]);
  const bag = useMemo(() => items.filter(i => i.zalozony !== 1), [items]);
  const inSlot = (d) => equipped.find(i => d.types.includes(i.typ)) || null;

  const shown = useMemo(() => {
    const c = CATS.find(x => x.id === cat) || CATS[0];
    return bag.filter(c.test).sort((a, b) =>
      sort === 'poziom' ? (b.wym_poziom || 0) - (a.wym_poziom || 0)
        : sort === 'nazwa' ? a.nazwa.localeCompare(b.nazwa, 'pl')
          : sort === 'rzadkosc' ? (rarityOf(b).label).localeCompare(rarityOf(a).label, 'pl')
            : (a.typ || '').localeCompare(b.typ || '', 'pl'));
  }, [bag, cat, sort]);

  const compare = sel && sel.zalozony !== 1
    ? equipped.find(e => {
        const a = DOLL.find(d => d.types.includes(e.typ));
        const b = DOLL.find(d => d.types.includes(sel.typ));
        return a && b && a.id === b.id;
      }) || null
    : null;

  const cols = narrow ? 5 : 7;
  const emptyCount = Math.max(0, Math.ceil(Math.max(shown.length, cols * 5) / cols) * cols - shown.length);
  const exp = expPct(postac);

  // Akcje dolnego paska
  const isGear = sel && GEAR.includes(sel.typ);
  const actUse = async () => {
    if (!sel) return;
    if (sel.typ === 'Konsupcyjne') return after(await api.items.use(sel.id), `Wypito: ${sel.nazwa}`);
    if (isGear && sel.zalozony !== 1) return after(await api.items.equip(sel.id, 'zaloz'), `Założono: ${sel.nazwa}`);
    if (sel.zalozony === 1) return after(await api.items.equip(sel.id, 'zdejmij'), `Zdjęto: ${sel.nazwa}`);
  };
  const actSell = async () => {
    if (!sel || !window.confirm(`Sprzedać „${sel.nazwa}" za ${sel.wartosc_sprzedazy}?`)) return;
    const r = await api.items.sell(sel.id);
    if (!r?.error) setSel(null);
    after(r, `Sprzedano za ${fmtNum(sel.wartosc_sprzedazy)}`);
  };
  const actDrop = async () => {
    if (!sel || !window.confirm(`Wyrzucić „${sel.nazwa}"? Przedmiot zniknie bezpowrotnie.`)) return;
    const r = await api.items.drop(sel.id);
    if (r?.ok) setSel(null);
    after(r, `Wyrzucono: ${sel.nazwa}`);
  };
  const useLabel = !sel ? 'Użyj' : sel.typ === 'Konsupcyjne' ? 'Użyj' : sel.zalozony === 1 ? 'Zdejmij' : isGear ? 'Załóż' : 'Użyj';
  const canUse = sel && (sel.typ === 'Konsupcyjne' || isGear);

  // ── Kolumny ────────────────────────────────────────────────────────────────
  const heroPanel = (
    <Ornate pad={16} style={{ width: narrow ? '100%' : 330, flexShrink: 0, alignSelf: 'flex-start' }}>
      <Title>Twój Bohater</Title>
      <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 64px', gridTemplateRows: 'repeat(4, 64px)', gap: 8 }}>
        {DOLL.map(d => {
          const it = inSlot(d);
          return (
            <div key={d.id} style={{ gridColumn: d.col, gridRow: d.row, display: 'grid', placeItems: 'center' }}>
              <Slot item={it} label={d.label} size={64} selected={!!it && sel?.id === it.id}
                    onClick={() => it && setSel(sel?.id === it.id ? null : it)} />
            </div>
          );
        })}
        <div style={{
          gridColumn: 2, gridRow: '2 / 4', borderRadius: 4, display: 'grid', placeItems: 'center',
          background: 'radial-gradient(ellipse at 50% 85%, rgba(231,193,88,0.2), #0b0907 70%)',
          border: `1px solid ${G.bronze}`, boxShadow: 'inset 0 0 18px rgba(0,0,0,0.9)',
        }}>
          <span style={{
            width: 32, height: 48, transform: 'scale(2.5)', imageRendering: 'pixelated',
            backgroundImage: `url(/assets/${postac.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat',
            filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.8))',
          }} />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <div style={{ fontFamily: G.serif, fontSize: 20, color: G.goldHi }}>{postac.nazwa}</div>
        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
          <span style={{ color: G.muted, fontFamily: G.serif, fontSize: 13 }}>Lv. {postac.poziom}</span>
          <span style={{
            padding: '2px 10px', borderRadius: 999, fontSize: 11,
            background: 'rgba(168,40,28,0.3)', border: '1px solid rgba(229,98,76,0.5)', color: '#ffb0a0',
          }}>{postac.profesja}</span>
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 12.5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: G.muted, marginBottom: 5 }}>
          <span>Doświadczenie</span><span style={{ color: G.text }}>{exp.toFixed(2)}%</span>
        </div>
        <Bar pct={exp} from={G.exp} to={G.expHi} />
        {[
          ['HP', postac.zycie, postac.zycie_max, G.hp, G.hpHi, '#ff9b8b'],
          ['EN', postac.energia ?? 0, postac.energia_max ?? 100, G.en, G.enHi, '#8fbaff'],
        ].map(([l, v, m, f, t, c]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 9 }}>
            <span style={{ width: 24, color: c, fontFamily: G.serif }}>{l}</span>
            <Bar pct={m > 0 ? (v / m) * 100 : 0} from={f} to={t} />
            <span style={{ width: 90, textAlign: 'right', color: c }}>{fmtNum(v)} / {fmtNum(m)}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <Title>Statystyki</Title>
        {[
          ['⚔', 'Atak', `${postac.obrazenia_min} – ${postac.obrazenia_max}`],
          ['🛡', 'Obrona', postac.ac ?? 0],
          ['💪', 'Siła', postac.sila ?? 0],
          ['🏹', 'Zręczność', postac.zrecznosc ?? 0],
          ['🧠', 'Inteligencja', postac.intelekt ?? 0],
          ['🎯', 'Celność', postac.sa ?? 0],
        ].map(([ic, l, v]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, padding: '3px 0' }}>
            <span style={{ width: 16, textAlign: 'center', opacity: 0.8 }}>{ic}</span>
            <span style={{ color: G.muted, flex: 1 }}>{l}</span>
            <span style={{ color: G.text, fontFamily: G.serif }}>{v}</span>
          </div>
        ))}
        <button onClick={() => onNavigate?.('postac')} style={{
          width: '100%', marginTop: 12, padding: '9px', cursor: 'pointer', borderRadius: 3,
          background: 'linear-gradient(180deg,#2a2217,#120e09)', border: `1px solid ${G.bronze}`,
          color: G.goldHi, fontFamily: G.serif, fontSize: 13,
        }}>Szczegóły postaci</button>
      </div>
    </Ornate>
  );

  const bagPanel = (
    <Ornate pad={16} style={{ flex: 1, minWidth: 0, alignSelf: 'flex-start' }}>
      <Title>Ekwipunek</Title>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {CATS.map(c => {
          const on = cat === c.id;
          const n = bag.filter(c.test).length;
          return (
            <button key={c.id} onClick={() => setCat(c.id)} style={{
              padding: '7px 16px', borderRadius: 3, cursor: 'pointer',
              background: on ? 'linear-gradient(180deg,rgba(231,193,88,0.25),rgba(231,193,88,0.06))' : 'linear-gradient(180deg,#17130f,#0c0a08)',
              border: `1px solid ${on ? G.gold : G.bronze + 'aa'}`,
              color: on ? G.goldHi : G.muted, fontFamily: G.serif, fontSize: 13,
            }}>{c.label} <span style={{ opacity: 0.6, fontSize: 11 }}>{n}</span></button>
          );
        })}
        <span style={{ marginLeft: 'auto', color: G.muted, fontSize: 12.5 }}>🎒 {bag.length} przedm.</span>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{
          padding: '7px 8px', borderRadius: 3, background: '#0c0a08', color: G.goldHi,
          border: `1px solid ${G.bronze}`, fontFamily: G.serif, fontSize: 12.5,
        }}>
          <option value="typ">Sortuj: typ</option>
          <option value="poziom">Sortuj: poziom</option>
          <option value="rzadkosc">Sortuj: rzadkość</option>
          <option value="nazwa">Sortuj: A–Z</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10, maxHeight: narrow ? 'none' : 'calc(100vh - 330px)', overflowY: 'auto', paddingRight: 2 }}>
        {shown.map(it => (
          <Slot key={it.id} item={it} size={96} selected={sel?.id === it.id}
                onClick={() => setSel(sel?.id === it.id ? null : it)} />
        ))}
        {Array.from({ length: emptyCount }, (_, i) => <Slot key={`e${i}`} size={96} />)}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 16, paddingTop: 14,
        borderTop: `1px solid ${G.bronze}66`,
      }}>
        <span style={{ color: G.goldHi, fontSize: 14, whiteSpace: 'nowrap' }}>🪙 {fmtNum(postac.zloto)}</span>
        {postac.event_tokeny > 0 && <span style={{ color: '#e88ad8', fontSize: 14 }}>💎 {fmtNum(postac.event_tokeny)}</span>}
        {msg && <span style={{ fontSize: 12, color: msg.ok ? '#9be8ac' : '#ff8b78' }}>{msg.text}</span>}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <ActionBtn onClick={actUse} disabled={!canUse} tone="green">{useLabel}</ActionBtn>
          <ActionBtn onClick={actSell} disabled={!sel || sel.zalozony === 1 || !(sel.wartosc_sprzedazy > 0)}>Sprzedaj</ActionBtn>
          <ActionBtn onClick={actDrop} disabled={!sel || sel.zalozony === 1} tone="red">Wyrzuć</ActionBtn>
        </div>
      </div>
    </Ornate>
  );

  const detailPanel = (
    <Ornate pad={16} style={{ width: narrow ? '100%' : 330, flexShrink: 0, alignSelf: 'flex-start' }}>
      <ItemDetails item={sel} compare={compare} postac={postac} />
    </Ornate>
  );

  return (
    <div style={{
      // nad kontrolkami mobilnymi (do 500), pod powiadomieniami (999)
      position: 'fixed', inset: 0, zIndex: 600, display: 'flex', flexDirection: 'column',
      background: 'rgba(4,3,2,0.55)', fontFamily: FONT, color: G.text,
    }}>
      <TopNav postac={postac} onNavigate={onNavigate} onClose={onClose} narrow={narrow} />
      <div style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        display: 'flex', flexDirection: narrow ? 'column' : 'row', alignItems: narrow ? 'stretch' : 'flex-start',
        gap: 18, padding: narrow ? 10 : '22px 26px 200px',
      }}>
        {heroPanel}
        {bagPanel}
        {detailPanel}
      </div>
    </div>
  );
}
