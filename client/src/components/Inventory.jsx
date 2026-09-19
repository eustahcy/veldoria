import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import {
  IconSword, IconBag, IconShield, IconHeart, IconZap, IconRun,
  IconBrain, IconX, IconCheck, IconCoin, IconTrendingUp,
} from '../Icons';

// ── Rarity ────────────────────────────────────────────────────────────────────
const RC = {
  unique:   '#DAA520', heroic: '#2090FE', legendary: '#FA9A20',
  artefact: '#f0032a', upgraded: '#FFD700', normal: '#4A6A4A',
};
const RL = {
  unique: 'Unikat', heroic: 'Heroiczny', legendary: 'Legendarny',
  artefact: 'Artefakt', upgraded: 'Ulepszony',
};

const ALL_WEAPONS = ['BronJednoreczna','BronDwureczna','BronPomocnicza','Laska','Rozdzka','BronDystansowa'];

const DOLL_SLOTS = [
  { id:'tali',   types:['Talizman'],  label:'Talizman', col:1, row:1 },
  { id:'helm',   types:['Helm'],      label:'Hełm',     col:2, row:1 },
  { id:'neck',   types:['Naszyjnik'], label:'Naszyjnik',col:3, row:1 },
  { id:'weapon', types:ALL_WEAPONS,   label:'Broń',     col:1, row:2 },
  { id:'armor',  types:['Zbroja'],    label:'Zbroja',   col:2, row:2 },
  { id:'shield', types:['Tarcza'],    label:'Tarcza',   col:3, row:2 },
  { id:'gloves', types:['Rekawice'],  label:'Rękawice', col:1, row:3 },
  { id:'ring',   types:['Pierscien'], label:'Pierścień',col:3, row:3 },
  { id:'boots',  types:['Buty'],      label:'Buty',     col:2, row:4 },
  { id:'arrows', types:['Strzaly'],   label:'Strzały',  col:3, row:4 },
];

const STAT_KEYS = [
  ['obr_min','ATK',    i=>`${i.obr_min}–${i.obr_max}`],
  ['obr_mag','Mag',    i=>`+${i.obr_mag}`],
  ['ac',     'AC',     i=>`+${i.ac}`],
  ['acm',    'ACM',    i=>`+${i.acm}`],
  ['zycie',  'HP',     i=>`+${i.zycie}`],
  ['sa',     'SA%',    i=>`+${i.sa}`],
  ['sila',   'STR',    i=>`+${i.sila}`],
  ['zrecznosc','DEX',  i=>`+${i.zrecznosc}`],
  ['intelekt','INT',   i=>`+${i.intelekt}`],
  ['wszystkie_cechy','Cechy',i=>`+${i.wszystkie_cechy}`],
  ['ck',     'Kryt%',  i=>`+${i.ck}`],
  ['unik',   'Unik',   i=>`+${i.unik}`],
  ['blok',   'Blok',   i=>`+${i.blok}`],
  ['leczenie','Lecz',  i=>`+${i.leczenie}`],
  ['mana',   'Mana',   i=>`+${i.mana}`],
  ['mikstura_leczenie','Leczy',i=>`${i.mikstura_leczenie}HP`],
];

function getStats(item) {
  return STAT_KEYS.map(([k, label, fmt]) => {
    const v = item[k];
    if (!v || v === 0) return null;
    return { label, val: fmt(item) };
  }).filter(Boolean);
}

function fmtNum(n) {
  n = Number(n) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

// ── Item sprite ───────────────────────────────────────────────────────────────
function ItemSprite({ src, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      backgroundImage: `url(/assets/${src})`,
      backgroundPosition: '0 0', backgroundRepeat: 'no-repeat',
      imageRendering: 'pixelated',
    }} />
  );
}

// ── Slot cell ─────────────────────────────────────────────────────────────────
const SLOT_SIZE = 60;

function SlotCell({ slot, item, selected, onSelect, onUnequip }) {
  const color = item ? (RC[item.klasa] || RC.normal) : 'rgba(200,150,32,0.08)';
  return (
    <div
      onClick={() => item && onSelect(item)}
      title={slot.label}
      style={{
        gridColumn: slot.col, gridRow: slot.row,
        width: SLOT_SIZE, height: SLOT_SIZE,
        background: item
          ? `linear-gradient(145deg,rgba(12,20,8,0.95),rgba(6,12,4,0.95))`
          : 'rgba(6,10,4,0.4)',
        border: `1px solid ${selected ? '#6CB83A' : item ? color + '70' : 'rgba(200,150,32,0.1)'}`,
        borderRadius: 8,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: item ? 'pointer' : 'default',
        position: 'relative', overflow: 'hidden',
        boxShadow: selected
          ? `0 0 0 2px #C8940A, 0 0 14px rgba(200,150,32,0.35)`
          : item ? `inset 0 0 0 1px ${color}20` : 'none',
        transition: 'all 0.12s',
      }}
    >
      {item ? (
        <>
          {/* Rarity glow */}
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, ${color}12 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <ItemSprite src={item.obrazek} size={36} />
          <div style={{ fontSize: 6, color, textAlign: 'center', lineHeight: 1, maxWidth: SLOT_SIZE - 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 2px', marginTop: 2 }}>
            {item.nazwa}
          </div>
          {/* Rarity strip at bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
          <button
            onClick={e => { e.stopPropagation(); onUnequip(item); }}
            style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.75)', border: 'none', color: '#888', fontSize: 8, cursor: 'pointer', lineHeight: 1, padding: '1px 3px', borderRadius: 3 }}
          >✕</button>
        </>
      ) : (
        <span style={{ fontSize: 7, color: '#2A3820', textAlign: 'center', lineHeight: 1.3 }}>{slot.label}</span>
      )}
    </div>
  );
}

// ── Bag cell ──────────────────────────────────────────────────────────────────
function BagCell({ item, selected, onClick }) {
  const color = RC[item.klasa] || RC.normal;
  return (
    <div onClick={onClick} title={item.nazwa} style={{
      width: 56, height: 56,
      background: selected
        ? 'rgba(74,122,42,0.2)'
        : 'linear-gradient(145deg,rgba(10,16,6,0.9),rgba(6,10,4,0.9))',
      border: `1px solid ${selected ? '#6CB83A' : color + '55'}`,
      borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', position: 'relative', transition: 'all 0.1s',
      boxShadow: selected ? '0 0 10px rgba(200,150,32,0.35)' : 'none',
    }}>
      <ItemSprite src={item.obrazek} size={36} />
      {/* Bottom color strip */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: color, borderRadius: '0 0 6px 6px' }} />
      {item.wym_poziom > 0 && (
        <span style={{ position: 'absolute', top: 2, left: 3, fontSize: 6, color: '#FCD34D', fontWeight: 'bold', textShadow: '0 0 3px #000' }}>{item.wym_poziom}</span>
      )}
      {item.ilosc > 1 && (
        <span style={{ position: 'absolute', bottom: 4, right: 3, fontSize: 6, color: '#E8D070', fontWeight: 'bold', textShadow: '0 0 3px #000' }}>×{item.ilosc}</span>
      )}
    </div>
  );
}

// ── Stat row with diff ────────────────────────────────────────────────────────
function StatDiff({ label, val, diff }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 6px', borderRadius: 3, background: 'rgba(8,13,5,0.4)', gap: 4 }}>
      <span style={{ color: '#4A5A30', fontSize: 8 }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: diff > 0 ? '#4ADE80' : diff < 0 ? '#F87171' : '#CDD4AA', fontWeight: 'bold', fontSize: 9 }}>
        {val}
        {diff !== null && diff !== 0 && <span style={{ fontSize: 7 }}>{diff > 0 ? '▲' : '▼'}</span>}
      </span>
    </div>
  );
}

// ── Item detail panel ─────────────────────────────────────────────────────────
function ItemDetail({ item, compareItem, postac, onEquip, onUnequip, onSell, onUse }) {
  if (!item) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#2A3820' }}>
      <div style={{ fontSize: 40, opacity: 0.3 }}>🎒</div>
      <div style={{ fontSize: 10, color: '#3A4828' }}>Kliknij przedmiot aby zobaczyć szczegóły</div>
    </div>
  );

  const color    = RC[item.klasa] || '#CDD4AA';
  const stats    = getStats(item);
  const cmpStats = compareItem ? getStats(compareItem) : [];
  const isEq     = item.zalozony === 1;
  const canEquip = !['Konsupcyjne', 'Neutralne'].includes(item.typ);
  const canUse   = item.typ === 'Konsupcyjne';
  const meetsLvl = !item.wym_poziom || (postac?.poziom >= item.wym_poziom);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Item header */}
      <div style={{
        padding: '12px 14px', flexShrink: 0,
        background: `linear-gradient(135deg, ${color}0A, rgba(8,13,5,0.6))`,
        borderBottom: `1px solid ${color}22`,
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {/* Icon frame */}
          <div style={{
            width: 56, height: 56, flexShrink: 0, borderRadius: 8,
            background: `linear-gradient(145deg, rgba(12,20,8,0.95), rgba(6,12,4,0.95))`,
            border: `2px solid ${color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            boxShadow: `0 0 16px ${color}22, inset 0 0 8px rgba(0,0,0,0.5)`,
          }}>
            <ItemSprite src={item.obrazek} size={40} />
            {isEq && (
              <div style={{ position: 'absolute', top: -6, left: -6, background: '#4A7A2A', color: '#E8D070', fontSize: 7, fontWeight: 'bold', borderRadius: 4, padding: '2px 4px', boxShadow: '0 0 6px rgba(74,122,42,0.6)' }}>EQ</div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color, fontWeight: 'bold', fontSize: 13, lineHeight: 1.2, marginBottom: 2 }}>{item.nazwa}</div>
            {RL[item.klasa] && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 9999, marginBottom: 4 }}>
                <span style={{ color, fontSize: 8, fontWeight: 'bold' }}>★ {RL[item.klasa]}</span>
              </div>
            )}
            <div style={{ color: '#5A6840', fontSize: 9 }}>{item.typ}</div>
            {item.wym_poziom > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, fontSize: 9, color: meetsLvl ? '#4ADE80' : '#EF4444' }}>
                {meetsLvl ? '✓' : '✗'} Min. poziom {item.wym_poziom}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compare hint */}
      {compareItem && (
        <div style={{ padding: '4px 14px', background: 'rgba(200,150,32,0.06)', borderBottom: '1px solid rgba(200,150,32,0.08)', fontSize: 8, color: '#7A8A5A' }}>
          Porównujesz z założonym: <span style={{ color: '#C8940A', fontWeight: 'bold' }}>{compareItem.nazwa}</span>
        </div>
      )}

      {/* Stats */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
        {stats.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 6px' }}>
            {stats.map(({ label, val }) => {
              const cmp     = cmpStats.find(c => c.label === label);
              const numVal  = parseFloat(val.replace(/[^0-9.-]/g, ''));
              const numCmp  = cmp ? parseFloat(cmp.val.replace(/[^0-9.-]/g, '')) : null;
              const diff    = numCmp !== null && !isNaN(numVal) && !isNaN(numCmp) ? numVal - numCmp : null;
              return <StatDiff key={label} label={label} val={val} diff={diff} />;
            })}
          </div>
        ) : (
          <div style={{ color: '#2A3820', fontSize: 9, textAlign: 'center', paddingTop: 16 }}>Brak statystyk</div>
        )}
        {item.opis && (
          <div style={{ marginTop: 10, color: '#7A8A5A', fontSize: 9, fontStyle: 'italic', padding: '6px 8px', background: 'rgba(8,13,5,0.5)', borderRadius: 5, lineHeight: 1.5, borderLeft: '2px solid rgba(200,150,32,0.2)' }}>
            {item.opis}
          </div>
        )}
        {item.wartosc_sprzedazy > 0 && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, color: '#FCD34D', fontSize: 9 }}>
            <IconCoin size={11} /> Wartość sprzedaży: <strong>{fmtNum(item.wartosc_sprzedazy)}g</strong>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(200,150,32,0.1)', display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
        {isEq ? (
          <button onClick={() => onUnequip(item)} style={actionBtn('#C8940A', 'rgba(15,32,20,0.9)', 'rgba(200,150,32,0.4)')}>
            ↩ Zdejmij
          </button>
        ) : canEquip ? (
          <button onClick={() => onEquip(item)} disabled={!meetsLvl} style={actionBtn('#4ADE80', 'rgba(6,40,20,0.9)', 'rgba(34,197,94,0.4)', !meetsLvl)}>
            <IconCheck size={11} /> Załóż
          </button>
        ) : null}
        {canUse && (
          <button onClick={() => onUse(item)} style={actionBtn('#E8D070', 'rgba(50,30,8,0.9)', 'rgba(200,150,32,0.55)')}>
            <IconHeart size={11} /> Użyj
          </button>
        )}
        {!isEq && item.wartosc_sprzedazy > 0 && (
          <button onClick={() => onSell(item)} style={actionBtn('#F87171', 'rgba(30,5,5,0.9)', 'rgba(220,38,38,0.4)')}>
            Sprzedaj {fmtNum(item.wartosc_sprzedazy)}g
          </button>
        )}
      </div>
    </div>
  );
}

function actionBtn(color, bg, border, disabled = false) {
  return {
    flex: 1, padding: '7px 8px',
    background: disabled ? 'rgba(8,13,5,0.4)' : bg,
    color: disabled ? '#3A4828' : color,
    border: `1px solid ${disabled ? 'rgba(200,150,32,0.1)' : border}`,
    borderRadius: 5, cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 10, fontWeight: 'bold',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    opacity: disabled ? 0.5 : 1,
  };
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Inventory({ onClose, onRefresh, postac }) {
  const [items,   setItems]   = useState([]);
  const [tab,     setTab]     = useState('doll');
  const [sel,     setSel]     = useState(null);
  const [filter,  setFilter]  = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [sort,    setSort]    = useState('typ');
  const [msg,     setMsg]     = useState('');
  const [msgType, setMsgType] = useState('ok');

  const load = useCallback(async () => {
    const data = await api.items.inventory();
    if (Array.isArray(data)) {
      setItems(data);
      setSel(prev => prev ? data.find(i => i.id === prev.id) || null : null);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (t, type = 'ok') => { setMsg(t); setMsgType(type); setTimeout(() => setMsg(''), 2500); };

  const equip   = async i => {
    const r = await api.items.equip(i.id, 'zaloz');
    if (r?.error) { flash(`✗ ${r.error}`); return; }
    await load(); onRefresh?.(); flash(`✓ Założono: ${i.nazwa}`);
  };
  const unequip = async i => { await api.items.equip(i.id, 'zdejmij'); await load(); onRefresh?.(); flash(`↩ Zdjęto: ${i.nazwa}`); };
  const use     = async i => { const r = await api.character.heal(); await load(); onRefresh?.(); flash(r?.healed ? `+${r.healed} HP` : `Użyto: ${i.nazwa}`); };
  const sell    = async i => {
    if (!window.confirm(`Sprzedać „${i.nazwa}" za ${i.wartosc_sprzedazy}g?`)) return;
    await api.items.sell(i.id);
    setSel(null); await load(); onRefresh?.(); flash(`Sprzedano za ${fmtNum(i.wartosc_sprzedazy)}g`);
  };

  const equipped      = items.filter(i => i.zalozony === 1);
  const bag           = items.filter(i => i.zalozony === 0);
  const equippedFor   = slot => equipped.find(i => slot.types.includes(i.typ)) || null;

  const compareItem = sel?.zalozony === 0
    ? equipped.find(i => {
        const sa = DOLL_SLOTS.find(s => s.types.includes(i.typ));
        const sb = DOLL_SLOTS.find(s => s.types.includes(sel.typ));
        return sa && sb && sa.id === sb.id;
      }) || null
    : null;

  const allCats = [...new Set(bag.map(i => i.typ))].sort();
  const bagFiltered = bag
    .filter(i =>
      (catFilter === 'all' || i.typ === catFilter) &&
      (!filter || i.nazwa.toLowerCase().includes(filter.toLowerCase()))
    )
    .sort((a, b) =>
      sort === 'poziom' ? (b.wym_poziom || 0) - (a.wym_poziom || 0)
      : sort === 'nazwa' ? a.nazwa.localeCompare(b.nazwa)
      : a.typ.localeCompare(b.typ)
    );

  const CHAR_STATS = [
    [<IconSword size={9} />, `${postac.obrazenia_min}–${postac.obrazenia_max}`, 'ATK', '#F87171'],
    [<IconShield size={9} />, postac.ac || 0, 'AC', '#C8940A'],
    [<IconHeart size={9} />, `${postac.zycie}/${postac.zycie_max}`, 'HP', '#4ADE80'],
    [<IconZap size={9} />, postac.sila, 'STR', '#FDE68A'],
    [<IconRun size={9} />, postac.zrecznosc, 'DEX', '#86EFAC'],
    [<IconBrain size={9} />, postac.intelekt, 'INT', '#A5B4FC'],
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{
        background: 'linear-gradient(160deg,rgba(8,14,5,0.99),rgba(4,8,2,0.99))',
        border: '1px solid rgba(200,150,32,0.22)',
        borderRadius: 12, width: 800, maxWidth: '99vw',
        height: '90vh', maxHeight: 680,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 20px 80px rgba(0,0,0,0.9), inset 0 1px 0 rgba(232,192,48,0.06)',
        fontFamily: 'Verdana,sans-serif',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: '1px solid rgba(200,150,32,0.12)', background: 'rgba(4,8,2,0.6)', flexShrink: 0 }}>
          <span style={{ fontSize: 16 }}>🎒</span>
          <span style={{ color: '#E8D070', fontWeight: 'bold', fontSize: 13 }}>Ekwipunek</span>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 1, marginLeft: 8 }}>
            {[['doll', `Postać`, <IconSword size={10} />], ['bag', `Plecak (${bag.length})`, <IconBag size={10} />]].map(([t, l, icon]) => (
              <button key={t} onClick={() => { setTab(t); setSel(null); }} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px',
                background: tab === t ? 'rgba(200,150,32,0.1)' : 'none',
                border: 'none', borderBottom: tab === t ? '2px solid #C8940A' : '2px solid transparent',
                cursor: 'pointer', fontSize: 10,
                color: tab === t ? '#E8D070' : '#5A6840',
                fontWeight: tab === t ? 'bold' : 'normal',
                fontFamily: 'Verdana,sans-serif',
              }}>
                <span style={{ color: tab === t ? '#C8940A' : '#3A4828' }}>{icon}</span>{l}
              </button>
            ))}
          </div>
          {/* Flash */}
          {msg && (
            <span style={{
              fontSize: 9, padding: '2px 9px', borderRadius: 9999,
              color: msgType === 'ok' ? '#4ADE80' : '#F87171',
              background: msgType === 'ok' ? 'rgba(6,50,30,0.6)' : 'rgba(50,6,6,0.6)',
              border: `1px solid ${msgType === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>{msg}</span>
          )}
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#5A6840', cursor: 'pointer', display: 'flex' }}>
            <IconX size={17} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

          {/* LEFT */}
          <div style={{ width: 370, flexShrink: 0, borderRight: '1px solid rgba(200,150,32,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* ── DOLL TAB ── */}
            {tab === 'doll' && (
              <>
                {/* Char summary strip */}
                <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(200,150,32,0.08)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <div style={{
                      width: 36, height: 52, flexShrink: 0,
                      backgroundImage: `url(/assets/${postac.obrazek})`,
                      backgroundPosition: '0 0', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated',
                      border: '1px solid rgba(200,150,32,0.35)', borderRadius: 4,
                      boxShadow: '0 0 10px rgba(200,150,32,0.15)',
                      background: `rgba(8,13,5,0.8) url(/assets/${postac.obrazek}) 0 0 no-repeat`,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#E8D070', fontWeight: 'bold', fontSize: 11 }}>{postac.nazwa}</div>
                      <div style={{ color: '#5A6840', fontSize: 9 }}>{postac.profesja} · <span style={{ color: '#FCD34D' }}>poz.{postac.poziom}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3, color: '#FCD34D', fontSize: 9 }}>
                        <IconCoin size={10} /> {fmtNum(postac.zloto)}g
                      </div>
                    </div>
                  </div>
                  {/* Stat grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3 }}>
                    {CHAR_STATS.map(([icon, v, label, c], i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(8,13,5,0.5)', borderRadius: 4, padding: '3px 6px', border: '1px solid rgba(200,150,32,0.07)' }}>
                        <span style={{ color: '#3A4828' }}>{icon}</span>
                        <div>
                          <div style={{ color: '#3A4828', fontSize: 6, lineHeight: 1 }}>{label}</div>
                          <div style={{ color: c, fontSize: 8, fontWeight: 'bold', lineHeight: 1 }}>{v}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Paper doll */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(3,${SLOT_SIZE}px)`, gridTemplateRows: `repeat(4,${SLOT_SIZE}px)`, gap: 5 }}>
                    {DOLL_SLOTS.map(slot => (
                      <SlotCell
                        key={slot.id} slot={slot}
                        item={equippedFor(slot)}
                        selected={sel?.id === equippedFor(slot)?.id}
                        onSelect={setSel} onUnequip={unequip}
                      />
                    ))}
                    {/* Center avatar (col2, row3) */}
                    <div style={{ gridColumn: 2, gridRow: 3, width: SLOT_SIZE, height: SLOT_SIZE, background: 'rgba(8,13,5,0.3)', border: '1px solid rgba(200,150,32,0.07)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 32, height: 48, backgroundImage: `url(/assets/${postac.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', filter: 'drop-shadow(0 0 5px rgba(200,150,32,0.4))' }} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── BAG TAB ── */}
            {tab === 'bag' && (
              <>
                {/* Toolbar */}
                <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(200,150,32,0.08)', flexShrink: 0, display: 'flex', gap: 5 }}>
                  <input
                    value={filter} onChange={e => setFilter(e.target.value)}
                    placeholder="🔍 Szukaj w plecaku..."
                    style={{ flex: 1, padding: '5px 8px', background: 'rgba(8,13,5,0.7)', color: '#CDD4AA', border: '1px solid rgba(200,150,32,0.2)', borderRadius: 5, fontSize: 9, outline: 'none', fontFamily: 'inherit' }}
                  />
                  <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '5px 4px', background: 'rgba(8,13,5,0.7)', color: '#CDD4AA', border: '1px solid rgba(200,150,32,0.2)', borderRadius: 5, fontSize: 9, outline: 'none' }}>
                    <option value="typ">Typ</option>
                    <option value="poziom">Poz.</option>
                    <option value="nazwa">A–Z</option>
                  </select>
                </div>
                {/* Categories */}
                {allCats.length > 1 && (
                  <div style={{ display: 'flex', gap: 2, padding: '4px 8px', overflowX: 'auto', borderBottom: '1px solid rgba(200,150,32,0.06)', flexShrink: 0 }}>
                    {[['all', `Wszystko (${bag.length})`], ...allCats.map(c => [c, `${c} (${bag.filter(i => i.typ === c).length})`])].map(([k, l]) => (
                      <button key={k} onClick={() => { setCatFilter(k); setSel(null); }} style={{
                        padding: '3px 9px', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 8, whiteSpace: 'nowrap',
                        color: catFilter === k ? '#E8D070' : '#5A6840',
                        borderBottom: catFilter === k ? '2px solid #C8940A' : '2px solid transparent',
                        fontWeight: catFilter === k ? 'bold' : 'normal',
                        fontFamily: 'inherit',
                      }}>{l}</button>
                    ))}
                  </div>
                )}
                {/* Grid */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
                  {bagFiltered.length === 0 ? (
                    <div style={{ color: '#2A3820', textAlign: 'center', paddingTop: 28, fontSize: 10 }}>
                      {filter ? `Brak wyników dla „${filter}"` : 'Plecak pusty'}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {bagFiltered.map(item => (
                        <BagCell
                          key={item.id} item={item}
                          selected={sel?.id === item.id}
                          onClick={() => setSel(sel?.id === item.id ? null : item)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* RIGHT — detail */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <ItemDetail
              item={sel} compareItem={compareItem} postac={postac}
              onEquip={equip} onUnequip={unequip} onSell={sell} onUse={use}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
