import { useState, useEffect } from 'react';
import { api } from '../api';
import {
  IconCart, IconChat, IconX, IconCheck, IconArrowLeft, IconCoin, IconScroll,
} from '../Icons';

// ── Rarity ─────────────────────────────────────────────────────────────────────
const RC = {
  unique: '#DAA520', heroic: '#2090FE', legendary: '#FA9A20',
  artefact: '#f0032a', upgraded: '#FFD700', normal: '#3A5A7A',
};
const RL = {
  unique: 'Unikat', heroic: 'Heroiczny', legendary: 'Legendarny',
  artefact: 'Artefakt', upgraded: 'Ulepszony',
};

const STAT_KEYS = [
  ['obr_min', 'ATK',   i => `${i.obr_min}–${i.obr_max}`],
  ['obr_mag', 'Mag',   i => `+${i.obr_mag}`],
  ['ac',      'AC',    i => `+${i.ac}`],
  ['zycie',   'HP',    i => `+${i.zycie}`],
  ['sa',      'SA%',   i => `+${i.sa}`],
  ['sila',    'STR',   i => `+${i.sila}`],
  ['zrecznosc', 'DEX', i => `+${i.zrecznosc}`],
  ['intelekt',  'INT', i => `+${i.intelekt}`],
  ['ck',      'Kryt%', i => `+${i.ck}`],
  ['unik',    'Unik',  i => `+${i.unik}`],
  ['leczenie','Lecz',  i => `+${i.leczenie}`],
  ['mana',    'Mana',  i => `+${i.mana}`],
  ['mikstura_leczenie', 'Leczy', i => `${i.mikstura_leczenie}HP`],
];

const SLOT_TYPES = {
  BronJednoreczna: 'weapon', BronDwureczna: 'weapon', BronPomocnicza: 'weapon',
  Laska: 'weapon', Rozdzka: 'weapon', BronDystansowa: 'weapon',
  Helm: 'helm', Zbroja: 'armor', Tarcza: 'shield', Rekawice: 'gloves',
  Buty: 'boots', Pierscien: 'ring', Naszyjnik: 'neck', Talizman: 'tali',
};

function fmtNum(n) {
  n = Number(n) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function getStats(item) {
  return STAT_KEYS.map(([k, label, fmt]) => {
    const v = item[k];
    if (!v || v === 0) return null;
    return { label, val: fmt(item) };
  }).filter(Boolean);
}

// ── Shop item grid card ────────────────────────────────────────────────────────
function ShopCard({ item, selected, canAfford, onClick }) {
  const color = RC[item.klasa] || RC.normal;
  const price = item.wartosc_kupna || 0;
  return (
    <div onClick={onClick} title={item.nazwa} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '8px 5px', borderRadius: 8, cursor: 'pointer',
      background: selected
        ? `linear-gradient(145deg,rgba(12,28,8,0.95),rgba(8,18,4,0.95))`
        : 'rgba(8,13,5,0.55)',
      border: `1px solid ${selected ? '#6CB83A' : color + '40'}`,
      boxShadow: selected ? `0 0 12px rgba(200,150,32,0.3), 0 0 0 1px #C8940A` : 'none',
      transition: 'all 0.12s', position: 'relative', minWidth: 0,
    }}>
      {/* Rarity top accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${color},transparent)`, borderRadius: '8px 8px 0 0' }} />
      {/* Sprite */}
      <div style={{ width: 40, height: 40, backgroundImage: `url(/assets/${item.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', marginBottom: 4 }} />
      {/* Name */}
      <div style={{ fontSize: 7, color: selected ? color : '#8A9A6A', textAlign: 'center', lineHeight: 1.2, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 2px' }}>
        {item.nazwa}
      </div>
      {/* Price */}
      <div style={{ fontSize: 8, fontWeight: 'bold', color: canAfford ? '#FCD34D' : '#EF4444', marginTop: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconCoin size={8} /> {fmtNum(price)}
      </div>
      {!canAfford && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', borderRadius: 8, pointerEvents: 'none' }} />
      )}
    </div>
  );
}

// ── Item detail sidebar ────────────────────────────────────────────────────────
function ShopDetail({ item, equippedItem, gold, onBuy, buying, msgType, msg }) {
  if (!item) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#2A3820' }}>
      <div style={{ fontSize: 36, opacity: 0.3 }}>🛒</div>
      <div style={{ fontSize: 10, color: '#3A4828' }}>Wybierz przedmiot ze sklepu</div>
    </div>
  );

  const color    = RC[item.klasa] || '#CDD4AA';
  const price    = item.wartosc_kupna || 0;
  const canAfford = gold >= price;
  const stats    = getStats(item);
  const cmpStats = equippedItem ? getStats(equippedItem) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Item header */}
      <div style={{ padding: '12px 14px', flexShrink: 0, background: `linear-gradient(135deg,${color}0A,rgba(8,13,5,0.6))`, borderBottom: `1px solid ${color}22` }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 60, height: 60, flexShrink: 0, borderRadius: 9,
            background: 'linear-gradient(145deg,rgba(12,20,8,0.95),rgba(6,12,4,0.95))',
            border: `2px solid ${color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px ${color}22`,
          }}>
            <div style={{ width: 42, height: 42, backgroundImage: `url(/assets/${item.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color, fontWeight: 'bold', fontSize: 13, lineHeight: 1.2, marginBottom: 3 }}>{item.nazwa}</div>
            {RL[item.klasa] && (
              <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 7px', background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 9999, marginBottom: 4 }}>
                <span style={{ color, fontSize: 8, fontWeight: 'bold' }}>★ {RL[item.klasa]}</span>
              </div>
            )}
            <div style={{ color: '#5A6840', fontSize: 9 }}>{item.typ}</div>
            {item.wym_poziom > 0 && <div style={{ color: '#F59E0B', fontSize: 9, marginTop: 2 }}>Min. poziom {item.wym_poziom}</div>}
          </div>
        </div>
      </div>

      {/* Compare hint */}
      {equippedItem && (
        <div style={{ padding: '4px 14px', background: 'rgba(200,150,32,0.06)', borderBottom: '1px solid rgba(200,150,32,0.08)', fontSize: 8, color: '#7A8A5A' }}>
          Porównanie z założonym: <span style={{ color: '#C8940A', fontWeight: 'bold' }}>{equippedItem.nazwa}</span>
        </div>
      )}

      {/* Stats */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
        {stats.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 6px' }}>
            {stats.map(({ label, val }) => {
              const cmp    = cmpStats.find(c => c.label === label);
              const numVal = parseFloat(val.replace(/[^0-9.-]/g, ''));
              const numCmp = cmp ? parseFloat(cmp.val.replace(/[^0-9.-]/g, '')) : null;
              const diff   = numCmp !== null && !isNaN(numVal) && !isNaN(numCmp) ? numVal - numCmp : null;
              return (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 6px', borderRadius: 3, background: 'rgba(8,13,5,0.4)' }}>
                  <span style={{ color: '#4A5A30', fontSize: 8 }}>{label}</span>
                  <span style={{ color: diff > 0 ? '#4ADE80' : diff < 0 ? '#F87171' : '#CDD4AA', fontWeight: 'bold', fontSize: 9 }}>
                    {val}{diff !== null && diff !== 0 && <span style={{ fontSize: 7 }}>{diff > 0 ? ' ▲' : ' ▼'}</span>}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: '#2A3820', fontSize: 9, textAlign: 'center', paddingTop: 12 }}>Brak statystyk</div>
        )}
        {item.opis && (
          <div style={{ marginTop: 10, color: '#7A8A5A', fontSize: 9, fontStyle: 'italic', padding: '6px 8px', background: 'rgba(8,13,5,0.5)', borderRadius: 5, lineHeight: 1.5, borderLeft: '2px solid rgba(200,150,32,0.2)' }}>
            {item.opis}
          </div>
        )}
      </div>

      {/* Flash */}
      {msg && (
        <div style={{ padding: '4px 14px', fontSize: 9, color: msgType === 'err' ? '#F87171' : '#4ADE80', background: msgType === 'err' ? 'rgba(50,6,6,0.5)' : 'rgba(6,50,20,0.5)', borderTop: `1px solid ${msgType === 'err' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}` }}>
          {msg}
        </div>
      )}

      {/* Buy button */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(200,150,32,0.1)', flexShrink: 0 }}>
        <button onClick={onBuy} disabled={!canAfford || buying} style={{
          width: '100%', padding: '11px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: canAfford && !buying ? 'linear-gradient(135deg,rgba(74,122,42,0.35),rgba(14,28,10,0.4))' : 'rgba(8,13,5,0.4)',
          border: `1px solid ${canAfford ? 'rgba(200,150,32,0.45)' : 'rgba(200,150,32,0.1)'}`,
          borderRadius: 7, cursor: canAfford && !buying ? 'pointer' : 'not-allowed',
          color: canAfford ? '#E8D070' : '#3A4828',
          fontSize: 12, fontWeight: 'bold',
          boxShadow: canAfford ? '0 0 14px rgba(200,150,32,0.12)' : 'none',
          fontFamily: 'Verdana,sans-serif',
        }}>
          <IconCart size={13} />
          {buying ? 'Kupuję…'
            : canAfford ? `Kup za ${fmtNum(price)}g`
            : `Za mało złota (brakuje ${fmtNum(price - gold)}g)`}
        </button>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function NpcDialog({ npc, postac, onClose, onBought, onQuestReward }) {
  const [view,        setView]      = useState('menu');
  const [shopItems,   setShopItems] = useState(null);
  const [inventory,   setInventory] = useState([]);
  const [selItem,     setSelItem]   = useState(null);
  const [gold,        setGold]      = useState(Number(postac.zloto));
  const [filter,      setFilter]    = useState('');
  const [catFilter,   setCatFilter] = useState('all');
  const [msg,         setMsg]       = useState('');
  const [msgType,     setMsgType]   = useState('ok');
  const [buying,      setBuying]    = useState(false);
  const [npcQuests,   setNpcQuests] = useState({ give: [], turnin: [], active: [] });
  // Special NPC states
  const [templeData,  setTempleData]= useState(null);
  const [guildData,   setGuildData] = useState(null);
  const [portalData,  setPortalData]= useState(null);

  // typ 3 = kapłanka/świątynia, typ 5 = tablica gildii/ogłoszeń
  const isTemple    = npc.typ === 3;
  const isGuildBoard= npc.typ === 5;
  // Portal boss — NPC przy (31,12) mapa 1 (Strażnik Bramy Bossa — możemy go dodać później)
  // Detect by position proximity to boss portal coords

  useEffect(() => {
    if (npc.shop > 0) {
      api.items.shop(npc.shop).then(items => Array.isArray(items) && setShopItems(items));
      api.items.inventory().then(inv => Array.isArray(inv) && setInventory(inv));
    }
    api.quests.forNpc(npc.id).then(r => r && !r.error && setNpcQuests(r));
    if (isTemple)     api.items.templeStatus().then(d => d && setTempleData(d));
    if (isGuildBoard) api.items.guildBoard().then(d => d && setGuildData(d));
  }, [npc.id, npc.shop, isTemple, isGuildBoard]);

  const flash = (t, type = 'ok') => { setMsg(t); setMsgType(type); setTimeout(() => setMsg(''), 2500); };

  const acceptQuest = async q => {
    const r = await api.quests.accept(q.id);
    r.ok ? (flash(`Quest przyjęty: ${q.nazwa}`), api.quests.forNpc(npc.id).then(r => r && !r.error && setNpcQuests(r))) : flash(r.error || 'Błąd', 'err');
  };

  const turninQuest = async q => {
    const r = await api.quests.turnin(q.quest_id || q.id);
    if (r.ok) {
      const parts = [];
      if (r.rewards?.exp)   parts.push(`+${r.rewards.exp} EXP`);
      if (r.rewards?.zloto) parts.push(`+${r.rewards.zloto}g`);
      if (r.levelUp)        parts.push(`☆ Poziom ${r.newLevel}!`);
      flash(parts.join(' · ') || 'Nagrody odebrane!');
      onQuestReward?.(parts.join(' · ') || 'Nagrody odebrane!');
      api.quests.forNpc(npc.id).then(r => r && !r.error && setNpcQuests(r));
    } else flash(r.error || 'Błąd', 'err');
  };

  const buy = async () => {
    if (!selItem || buying) return;
    setBuying(true);
    try {
      const res = await api.items.buy(selItem.id, npc.shop);
      if (res.ok) {
        const newGold = res.zloto ?? (gold - (selItem.wartosc_kupna || 0));
        setGold(newGold);
        flash(`✓ Kupiono: ${selItem.nazwa}`);
        onBought?.();
        api.items.inventory().then(inv => Array.isArray(inv) && setInventory(inv));
      } else flash(res.error || 'Błąd zakupu', 'err');
    } catch { flash('Błąd połączenia', 'err'); }
    finally { setBuying(false); }
  };

  const hasQuests = npcQuests.give.length + npcQuests.turnin.length + npcQuests.active.length > 0;

  const templeHeal = async () => {
    const r = await api.items.templeHeal();
    if (r.ok) {
      flash(`✦ Uleczony! Życie przywrócone do pełni.`);
      setTempleData(prev => ({ ...prev, canHeal: false, cooldownMins: 30 }));
      onBought?.();
    } else flash(r.error || 'Błąd', 'err');
  };
  const equippedForItem = selItem
    ? inventory.find(i => i.zalozony === 1 && SLOT_TYPES[i.typ] === SLOT_TYPES[selItem.typ])
    : null;

  const allCats   = shopItems ? [...new Set(shopItems.map(i => i.typ))].sort() : [];
  const filtered  = (shopItems || []).filter(i =>
    (catFilter === 'all' || i.typ === catFilter) &&
    (!filter || i.nazwa.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{
        width: 720, maxWidth: '99vw', height: '85vh', maxHeight: 620,
        background: 'linear-gradient(160deg,rgba(8,14,5,0.99),rgba(4,8,2,0.99))',
        border: '1px solid rgba(200,150,32,0.22)', borderRadius: 12,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 20px 80px rgba(0,0,0,0.9)',
        fontFamily: 'Verdana,sans-serif',
      }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(4,8,2,0.6)', borderBottom: '1px solid rgba(200,150,32,0.12)', flexShrink: 0 }}>
          {/* NPC portrait */}
          <div style={{
            width: 40, height: 52, flexShrink: 0,
            backgroundImage: `url(/assets/${npc.obrazek})`,
            backgroundPosition: '0 0', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated',
            border: '1px solid rgba(200,150,32,0.3)', borderRadius: 4,
            background: `rgba(8,13,5,0.8) url(/assets/${npc.obrazek}) 0 0 no-repeat`,
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ color: '#E8D070', fontWeight: 'bold', fontSize: 13 }}>{npc.nazwa}</div>
            <div style={{ color: '#5A6840', fontSize: 9 }}>{npc.shop > 0 ? `Kupiec · Sklep #${npc.shop}` : 'NPC'}</div>
          </div>
          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: 3 }}>
            {[
              ['menu', '🏠 Menu'],
              npc.shop > 0 && ['shop', '🛒 Sklep'],
              hasQuests && ['quests', `📜 Questy`],
              isTemple && ['temple', '✦ Uzdrowienie'],
              isGuildBoard && ['guild', '⚜ Gildie'],
              ['talk', '💬 Rozmowa'],
            ].filter(Boolean).map(([v, l]) => (
              <button key={v} onClick={() => { setView(v); setSelItem(null); }} style={{
                padding: '4px 10px', background: view === v ? 'rgba(200,150,32,0.15)' : 'rgba(8,13,5,0.6)',
                border: `1px solid ${view === v ? 'rgba(200,150,32,0.5)' : 'rgba(200,150,32,0.15)'}`,
                borderRadius: 5, cursor: 'pointer', color: view === v ? '#E8D070' : '#5A6840',
                fontSize: 9, fontWeight: view === v ? 'bold' : 'normal',
                fontFamily: 'Verdana,sans-serif',
              }}>{l}</button>
            ))}
          </div>
          {view !== 'menu' && (
            <button onClick={() => setView('menu')} style={{ padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer', color: '#5A6840', display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, fontFamily: 'Verdana,sans-serif' }}>
              <IconArrowLeft size={10} /> Wróć
            </button>
          )}
          {view === 'shop' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'rgba(250,200,80,0.07)', border: '1px solid rgba(250,200,80,0.2)', borderRadius: 5 }}>
              <IconCoin size={12} />
              <span style={{ color: '#FCD34D', fontWeight: 'bold', fontSize: 11 }}>{fmtNum(gold)}g</span>
            </div>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5A6840', cursor: 'pointer', display: 'flex' }}>
            <IconX size={17} />
          </button>
        </div>

        {/* ── MENU ── */}
        {view === 'menu' && (
          <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ color: '#CDD4AA', fontSize: 11, lineHeight: 1.65, padding: '10px 14px', background: 'rgba(8,13,5,0.5)', borderRadius: 8, borderLeft: '3px solid rgba(200,150,32,0.3)' }}>
              Witaj, podróżniku! Czym mogę Ci służyć?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 8, marginTop: 4 }}>
              {[
                npc.shop > 0 && { icon: '🛒', label: 'Sklep', sub: 'Przeglądaj towary', color: '#60A5FA', fn: () => setView('shop') },
                hasQuests && { icon: '📜', label: 'Questy', sub: `${npcQuests.give.length} nowych · ${npcQuests.turnin.length} do oddania`, color: '#FCD34D', fn: () => setView('quests') },
                isTemple && { icon: '✦', label: 'Uzdrowienie', sub: templeData?.canHeal ? 'Darmowe leczenie dostępne!' : `Dostępne za ${templeData?.cooldownMins || '?'} min`, color: '#34D399', fn: () => setView('temple') },
                isGuildBoard && { icon: '⚜', label: 'Tablica Gildii', sub: 'Rankingi i informacje', color: '#F59E0B', fn: () => setView('guild') },
                { icon: '💬', label: 'Rozmowa', sub: 'Pogadaj z NPC', color: '#818CF8', fn: () => setView('talk') },
                { icon: '👋', label: 'Do widzenia', sub: 'Zamknij dialog', color: '#5A6840', fn: onClose },
              ].filter(Boolean).map(({ icon, label, sub, color, fn }) => (
                <button key={label} onClick={fn} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                  background: 'rgba(8,13,5,0.55)', border: `1px solid ${color}28`,
                  borderRadius: 9, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.12s',
                }}>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
                  <div>
                    <div style={{ color: '#CDD4AA', fontWeight: 'bold', fontSize: 11 }}>{label}</div>
                    <div style={{ color: '#5A6840', fontSize: 8, marginTop: 1 }}>{sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── QUESTS ── */}
        {view === 'quests' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Turn-in */}
            {npcQuests.turnin.length > 0 && (
              <div>
                <div style={{ color: '#4ADE80', fontSize: 8, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6 }}>★ Do oddania</div>
                {npcQuests.turnin.map(q => (
                  <div key={q.id} style={{ padding: '10px 12px', background: 'rgba(6,40,20,0.4)', border: '1px solid rgba(34,197,94,0.28)', borderRadius: 8, marginBottom: 6, borderLeft: '3px solid #22C55E' }}>
                    <div style={{ color: '#4ADE80', fontWeight: 'bold', fontSize: 11, marginBottom: 3 }}>{q.nazwa}</div>
                    <div style={{ color: '#7A8A5A', fontSize: 9, lineHeight: 1.4, marginBottom: 7 }}>{q.tekst_koniec || q.opis}</div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 9, marginBottom: 8 }}>
                      {q.nagroda_exp > 0  && <span style={{ color: '#06B6D4' }}>+{q.nagroda_exp} EXP</span>}
                      {q.nagroda_zloto > 0 && <span style={{ color: '#FCD34D' }}>+{q.nagroda_zloto}g</span>}
                    </div>
                    <button onClick={() => turninQuest(q)} style={{ padding: '6px 14px', background: 'rgba(6,40,20,0.8)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 5, cursor: 'pointer', fontSize: 9, fontWeight: 'bold', fontFamily: 'Verdana,sans-serif' }}>
                      Odbierz nagrody →
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Available */}
            {npcQuests.give.length > 0 && (
              <div>
                <div style={{ color: '#FCD34D', fontSize: 8, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6 }}>! Dostępne questy</div>
                {npcQuests.give.map(q => (
                  <div key={q.id} style={{ padding: '10px 12px', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(250,200,80,0.2)', borderRadius: 8, marginBottom: 6, borderLeft: '3px solid #FCD34D' }}>
                    <div style={{ color: '#FCD34D', fontWeight: 'bold', fontSize: 11, marginBottom: 3 }}>{q.nazwa}</div>
                    <div style={{ color: '#CDD4AA', fontSize: 9, lineHeight: 1.5, marginBottom: 7 }}>{q.tekst_start || q.opis}</div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 9, marginBottom: 8 }}>
                      {q.nagroda_exp > 0  && <span style={{ color: '#06B6D4' }}>+{q.nagroda_exp} EXP</span>}
                      {q.nagroda_zloto > 0 && <span style={{ color: '#FCD34D' }}>+{q.nagroda_zloto}g</span>}
                      <span style={{ color: '#5A6840' }}>Cel: {q.cel_ilosc}×</span>
                    </div>
                    <button onClick={() => acceptQuest(q)} style={{ padding: '6px 14px', background: 'rgba(74,122,42,0.3)', color: '#E8D070', border: '1px solid rgba(200,150,32,0.4)', borderRadius: 5, cursor: 'pointer', fontSize: 9, fontWeight: 'bold', fontFamily: 'Verdana,sans-serif' }}>
                      Przyjmij quest
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Active (info) */}
            {npcQuests.active.length > 0 && (
              <div>
                <div style={{ color: '#C8940A', fontSize: 8, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6 }}>⋯ W trakcie</div>
                {npcQuests.active.map(q => (
                  <div key={q.id} style={{ padding: '8px 12px', background: 'rgba(8,13,5,0.5)', border: '1px solid rgba(200,150,32,0.1)', borderRadius: 7, marginBottom: 5 }}>
                    <div style={{ color: '#CDD4AA', fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>{q.nazwa}</div>
                    <div style={{ height: 5, background: 'rgba(0,0,0,0.4)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (q.postep / q.cel_ilosc) * 100)}%`, height: '100%', background: '#6CB83A', borderRadius: 3 }} />
                    </div>
                    <div style={{ color: '#5A6840', fontSize: 8, marginTop: 3 }}>{q.postep}/{q.cel_ilosc}</div>
                  </div>
                ))}
              </div>
            )}
            {npcQuests.give.length === 0 && npcQuests.turnin.length === 0 && npcQuests.active.length === 0 && (
              <div style={{ color: '#2A3820', textAlign: 'center', paddingTop: 30, fontSize: 10 }}>Ten NPC nie ma dla ciebie questów</div>
            )}
          </div>
        )}

        {/* ── TALK ── */}
        {view === 'talk' && (
          <div style={{ padding: '20px' }}>
            <div style={{ color: '#CDD4AA', fontSize: 11, lineHeight: 1.75, padding: '14px 16px', background: 'rgba(8,13,5,0.5)', borderRadius: 8, borderLeft: '3px solid rgba(200,150,32,0.3)', marginBottom: 12 }}>
              Jestem {npc.nazwa}. Strzegę tego miejsca i pomagam podróżnikom.<br />
              Świat Veldorii jest niebezpieczny, ale dla dzielnych — pełen skarbów!
            </div>
            {npc.shop > 0 && (
              <button onClick={() => setView('shop')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(74,122,42,0.15)', border: '1px solid rgba(200,150,32,0.3)', borderRadius: 6, cursor: 'pointer', color: '#C8940A', fontSize: 10, fontFamily: 'Verdana,sans-serif' }}>
                <IconCart size={12} /> Przejdź do sklepu
              </button>
            )}
          </div>
        )}

        {/* ── ŚWIĄTYNIA ── */}
        {view === 'temple' && (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <div style={{ fontSize: 40 }}>✦</div>
            <div style={{ color: '#CDD4AA', fontSize: 11, textAlign: 'center', lineHeight: 1.7, padding: '12px 16px', background: 'rgba(8,13,5,0.5)', borderRadius: 8, borderLeft: '3px solid rgba(52,211,153,0.4)' }}>
              Niech Światło Świątyni oczyści twoje rany.<br />
              Kapłanka Elara jest gotowa, by cię uleczyć.
            </div>
            {msg && <div style={{ color: msgType === 'err' ? '#F87171' : '#34D399', fontSize: 10, fontWeight: 'bold' }}>{msg}</div>}
            {templeData?.canHeal
              ? <button onClick={templeHeal} style={{ padding: '10px 32px', background: 'rgba(6,50,30,0.6)', color: '#34D399', border: '1px solid rgba(52,211,153,0.4)', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 'bold', fontFamily: 'Verdana,sans-serif' }}>
                  ✦ Ulecz mnie (bezpłatnie)
                </button>
              : <div style={{ color: '#5A6840', fontSize: 10, textAlign: 'center' }}>
                  Możesz skorzystać z uzdrowienia za <b style={{ color: '#FCD34D' }}>{templeData?.cooldownMins || '?'} min</b>.
                </div>
            }
            <div style={{ color: '#3A5030', fontSize: 8, textAlign: 'center' }}>Darmowe leczenie odnawia się co 30 minut</div>
          </div>
        )}

        {/* ── TABLICA GILDII ── */}
        {view === 'guild' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
            <div style={{ color: '#F59E0B', fontSize: 9, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>⚜ Ranking Gildii</div>
            {!guildData && <div style={{ color: '#2A3820', fontSize: 10, textAlign: 'center', padding: 20 }}>Ładowanie...</div>}
            {guildData?.topGuilds?.length === 0 && <div style={{ color: '#2A3820', fontSize: 10, textAlign: 'center', padding: 20 }}>Brak gildii w świecie Veldorii.</div>}
            {(guildData?.topGuilds || []).map((g, i) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(8,13,5,0.5)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 7, marginBottom: 6 }}>
                <span style={{ color: i < 3 ? '#F59E0B' : '#5A6840', fontSize: 13, fontWeight: 'bold', minWidth: 22 }}>{i+1}.</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#E8D070', fontSize: 10, fontWeight: 'bold' }}>{g.nazwa}</div>
                  <div style={{ color: '#5A6840', fontSize: 8 }}>Poz. {g.poziom} · {g.czlonkowie} członków</div>
                </div>
                <div style={{ color: '#06B6D4', fontSize: 9 }}>{g.laczne_kille || 0} kill</div>
              </div>
            ))}
            {guildData?.recentWars?.length > 0 && (
              <>
                <div style={{ color: '#F87171', fontSize: 9, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '14px 0 8px' }}>⚔ Trwające Wojny</div>
                {guildData.recentWars.map((w, i) => (
                  <div key={i} style={{ padding: '7px 12px', background: 'rgba(30,5,5,0.5)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 6, marginBottom: 5, fontSize: 9, color: '#CDD4AA' }}>
                    <b style={{ color: '#F87171' }}>{w.atakujacy_nazwa}</b> vs <b style={{ color: '#60A5FA' }}>{w.bronicy_nazwa}</b>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── SHOP ── */}
        {view === 'shop' && (
          <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {/* LEFT: items */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(200,150,32,0.1)', minWidth: 0 }}>
              {/* Search */}
              <div style={{ padding: '7px 10px', borderBottom: '1px solid rgba(200,150,32,0.08)', flexShrink: 0 }}>
                <input value={filter} onChange={e => setFilter(e.target.value)}
                  placeholder="🔍 Szukaj…"
                  style={{ width: '100%', padding: '5px 9px', background: 'rgba(8,13,5,0.7)', color: '#CDD4AA', border: '1px solid rgba(200,150,32,0.2)', borderRadius: 5, fontSize: 9, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              {/* Categories */}
              {allCats.length > 1 && (
                <div style={{ display: 'flex', gap: 2, padding: '4px 8px', overflowX: 'auto', borderBottom: '1px solid rgba(200,150,32,0.06)', flexShrink: 0 }}>
                  {[['all', `Wszystko (${shopItems?.length || 0})`], ...allCats.map(c => [c, `${c} (${shopItems?.filter(i => i.typ === c).length || 0})`])].map(([k, l]) => (
                    <button key={k} onClick={() => { setCatFilter(k); setSelItem(null); }} style={{
                      padding: '3px 9px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 8, whiteSpace: 'nowrap',
                      color: catFilter === k ? '#E8D070' : '#5A6840',
                      borderBottom: catFilter === k ? '2px solid #C8940A' : '2px solid transparent',
                      fontWeight: catFilter === k ? 'bold' : 'normal', fontFamily: 'inherit',
                    }}>{l}</button>
                  ))}
                </div>
              )}
              {/* Items grid */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
                {shopItems === null && <div style={{ color: '#2A3820', textAlign: 'center', paddingTop: 24, fontSize: 10 }}>Ładowanie sklepu…</div>}
                {shopItems?.length === 0 && <div style={{ color: '#2A3820', textAlign: 'center', paddingTop: 24, fontSize: 10 }}>Sklep jest pusty</div>}
                {filtered.length === 0 && shopItems?.length > 0 && <div style={{ color: '#2A3820', textAlign: 'center', paddingTop: 24, fontSize: 10 }}>Brak wyników</div>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(80px,1fr))', gap: 5 }}>
                  {filtered.map(item => (
                    <ShopCard
                      key={item.id} item={item}
                      selected={selItem?.id === item.id}
                      canAfford={gold >= (item.wartosc_kupna || 0)}
                      onClick={() => setSelItem(selItem?.id === item.id ? null : item)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: detail */}
            <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <ShopDetail
                item={selItem}
                equippedItem={equippedForItem}
                gold={gold}
                onBuy={buy}
                buying={buying}
                msg={msg}
                msgType={msgType}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
