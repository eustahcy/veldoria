// Okno rozmowy z NPC: menu z kartami, sklep, zadania, świątynia i tablica gildii.
// Oprawa: ozdobna złota rama, scena z tłem mapy i dymek z wypowiedzią.
import { useState, useEffect } from 'react';
import { api } from '../api';
import { hudColors as G } from './hud/GameHud';
import { rarityOf, typeLabel, fmtNum } from '../ui/kit';

const FONT = "'Trebuchet MS', Verdana, sans-serif";
const TILE_BG = 56; // skala tła sceny (px na kafel mapy)

const STAT_KEYS = [
  ['obr_min', 'Atak', i => `${i.obr_min}–${i.obr_max}`],
  ['obr_mag', 'Magia', i => `+${i.obr_mag}`],
  ['ac', 'Obrona', i => `+${i.ac}`],
  ['zycie', 'Życie', i => `+${i.zycie}`],
  ['sa', 'Celność', i => `+${i.sa}`],
  ['sila', 'Siła', i => `+${i.sila}`],
  ['zrecznosc', 'Zręczność', i => `+${i.zrecznosc}`],
  ['intelekt', 'Intelekt', i => `+${i.intelekt}`],
  ['ck', 'Krytyk', i => `+${i.ck}%`],
  ['unik', 'Unik', i => `+${i.unik}`],
  ['leczenie', 'Leczenie', i => `+${i.leczenie}`],
  ['mana', 'Mana', i => `+${i.mana}`],
  ['mikstura_leczenie', 'Leczy', i => `${i.mikstura_leczenie} HP`],
];
const SLOT_TYPES = {
  BronJednoreczna: 'weapon', BronDwureczna: 'weapon', BronPomocnicza: 'weapon',
  Laska: 'weapon', Rozdzka: 'weapon', BronDystansowa: 'weapon',
  Helm: 'helm', Zbroja: 'armor', Tarcza: 'shield', Rekawice: 'gloves',
  Buty: 'boots', Pierscien: 'ring', Naszyjnik: 'neck', Talizman: 'tali',
};
const getStats = (item) => STAT_KEYS.map(([k, label, fmt]) => (item[k] ? { label, val: fmt(item) } : null)).filter(Boolean);

// ── Ozdobniki ────────────────────────────────────────────────────────────────
const Corner = ({ v, h }) => (
  <span style={{
    position: 'absolute', [v]: 6, [h]: 6, width: 26, height: 26, pointerEvents: 'none',
    [`border${v === 'top' ? 'Top' : 'Bottom'}`]: `2px solid ${G.gold}`,
    [`border${h === 'left' ? 'Left' : 'Right'}`]: `2px solid ${G.gold}`,
    borderRadius: v === 'top' ? (h === 'left' ? '6px 0 0 0' : '0 6px 0 0') : (h === 'left' ? '0 0 0 6px' : '0 0 6px 0'),
    opacity: 0.75,
  }} />
);
const Diamond = ({ size = 10, style }) => (
  <span style={{ width: size, height: size, transform: 'rotate(45deg)', border: `1.5px solid ${G.gold}`, display: 'inline-block', flexShrink: 0, ...style }} />
);
const Rule = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '9px 0' }}>
    <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${G.bronze})` }} />
    <Diamond size={6} />
    <span style={{ flex: 1, height: 1, background: `linear-gradient(270deg,transparent,${G.bronze})` }} />
  </div>
);

function NavBtn({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 4, cursor: 'pointer', whiteSpace: 'nowrap',
      background: active ? 'linear-gradient(180deg,#4a3818,#241a0b)' : 'linear-gradient(180deg,#1b1712,#0d0b08)',
      border: `1px solid ${active ? G.gold : G.bronze}`,
      boxShadow: active ? `0 0 14px rgba(231,193,88,0.25), inset 0 0 0 1px ${G.gold}44` : 'inset 0 1px 0 rgba(255,255,255,0.05)',
      color: active ? G.goldHi : G.muted, fontFamily: G.serif, fontSize: 14,
    }}>{children}</button>
  );
}

function Gold({ children, onClick, disabled, tone, style }) {
  const red = tone === 'red', green = tone === 'green';
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '10px 18px', borderRadius: 3, cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? '#0e0c0a' : red ? 'linear-gradient(180deg,#3a1410,#1a0907)' : green ? 'linear-gradient(180deg,#14301c,#0b1a10)' : 'linear-gradient(180deg,#4a3818,#241a0b)',
      border: `1px solid ${disabled ? '#3a3122' : red ? '#a8281c' : green ? '#2f6b3a' : G.gold}`,
      color: disabled ? G.dim : red ? '#ff8b78' : green ? '#9be8ac' : G.goldHi,
      fontFamily: G.serif, fontSize: 13.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...style,
    }}>{children}</button>
  );
}

// ── Karta wyboru w menu ──────────────────────────────────────────────────────
function MenuCard({ icon, label, sub, desc, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '22px 16px 18px',
      background: hov ? 'linear-gradient(180deg,#241d14,#100d0a)' : 'linear-gradient(180deg,#191510,#0c0a08)',
      border: `1px solid ${hov ? G.gold : G.bronze}`, borderRadius: 5, cursor: 'pointer', textAlign: 'center', minWidth: 0,
      boxShadow: hov ? '0 0 22px rgba(231,193,88,0.18), inset 0 0 0 1px rgba(231,193,88,0.2)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      transition: 'all .14s',
    }}>
      <Corner v="top" h="left" /><Corner v="top" h="right" /><Corner v="bottom" h="left" /><Corner v="bottom" h="right" />
      <span style={{ fontSize: 46, lineHeight: 1, filter: `drop-shadow(0 0 12px rgba(231,193,88,${hov ? 0.5 : 0.25}))` }}>{icon}</span>
      <span style={{ fontFamily: G.serif, fontSize: 21, color: G.goldHi, marginTop: 6 }}>{label}</span>
      <span style={{ color: G.muted, fontSize: 12.5 }}>{sub}</span>
      <span style={{ color: G.text, fontSize: 12.5, lineHeight: 1.5, marginTop: 6, opacity: 0.85 }}>{desc}</span>
      <span style={{
        width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', marginTop: 10,
        border: `1px solid ${hov ? G.gold : G.bronze}`, color: hov ? G.goldHi : G.gold, fontSize: 15,
        boxShadow: hov ? `0 0 14px rgba(231,193,88,0.35)` : 'none',
      }}>›</span>
    </button>
  );
}

// ── Kafelek towaru ───────────────────────────────────────────────────────────
function ShopCard({ item, selected, canAfford, onClick }) {
  const r = rarityOf(item);
  return (
    <button onClick={onClick} title={item.nazwa} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '9px 5px', minWidth: 0,
      borderRadius: 4, cursor: 'pointer', position: 'relative',
      background: selected ? 'radial-gradient(ellipse at 50% 30%, rgba(231,193,88,0.18), #0d0b08 72%)' : `radial-gradient(ellipse at 50% 20%, ${r.color}14, #0b0907 74%)`,
      border: `1px solid ${selected ? G.gold : r.color + '77'}`,
      boxShadow: selected ? `0 0 14px rgba(231,193,88,0.3)` : 'inset 0 2px 8px rgba(0,0,0,0.8)',
      opacity: canAfford ? 1 : 0.55,
    }}>
      <span style={{ width: 40, height: 40, backgroundImage: `url(/assets/${item.obrazek})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated' }} />
      <span style={{ fontSize: 11, color: r.color, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nazwa}</span>
      <span style={{ fontSize: 12, color: canAfford ? G.goldHi : '#ff8b78', fontFamily: G.serif }}>🪙 {fmtNum(item.wartosc_kupna || 0)}</span>
    </button>
  );
}

// ── Szczegóły towaru ─────────────────────────────────────────────────────────
function ShopDetail({ item, equippedItem, gold, onBuy, buying, msg, msgType, narrow }) {
  if (!item) return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: G.dim, fontSize: 13, padding: 20, textAlign: 'center' }}>
      Wybierz towar z lewej strony
    </div>
  );
  const r = rarityOf(item);
  const price = item.wartosc_kupna || 0;
  const canAfford = gold >= price;
  const stats = getStats(item);
  const cmp = equippedItem ? getStats(equippedItem) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ display: 'flex', gap: 12, padding: 14, borderBottom: `1px solid ${G.bronze}55` }}>
        <div style={{
          width: 62, height: 78, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 4,
          background: `radial-gradient(ellipse at 50% 30%, ${r.color}22, #0b0907 72%)`, border: `1px solid ${r.color}99`,
        }}>
          <span style={{ width: 42, height: 42, backgroundImage: `url(/assets/${item.obrazek})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: G.serif, fontSize: 16, color: r.color, lineHeight: 1.2 }}>{item.nazwa}</div>
          <div style={{ color: G.muted, fontSize: 12, marginTop: 3 }}>{r.label} · {typeLabel(item.typ)}</div>
          {item.wym_poziom > 0 && <div style={{ color: '#f0a24b', fontSize: 12, marginTop: 2 }}>Od poziomu {item.wym_poziom}</div>}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 14 }}>
        {equippedItem && (
          <div style={{ fontSize: 12, color: G.muted, marginBottom: 8 }}>
            Porównanie z założonym: <span style={{ color: rarityOf(equippedItem).color }}>{equippedItem.nazwa}</span>
          </div>
        )}
        {stats.length === 0 && <div style={{ color: G.dim, fontSize: 12.5 }}>Brak statystyk.</div>}
        {stats.map(({ label, val }) => {
          const c = cmp.find(x => x.label === label);
          const a = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
          const b = c ? parseFloat(String(c.val).replace(/[^0-9.-]/g, '')) : null;
          const diff = b !== null && !isNaN(a) && !isNaN(b) ? a - b : null;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 13 }}>
              <span style={{ color: G.muted }}>{label}</span>
              <span style={{ flex: 1, height: 1, background: 'repeating-linear-gradient(90deg, rgba(231,193,88,0.14) 0 2px, transparent 2px 5px)' }} />
              <span style={{ color: '#8fb8ff' }}>{val}</span>
              {diff !== null && diff !== 0 && <span style={{ color: diff > 0 ? '#9be8ac' : '#ff8b78', fontSize: 11.5 }}>{diff > 0 ? '▲' : '▼'}{Math.abs(diff)}</span>}
            </div>
          );
        })}
        {item.opis && (
          <div style={{ marginTop: 10, padding: '8px 10px', borderLeft: `2px solid ${G.bronze}`, background: 'rgba(0,0,0,0.35)', color: G.muted, fontSize: 12.5, fontStyle: 'italic', lineHeight: 1.5 }}>
            {item.opis}
          </div>
        )}
      </div>

      {msg && (
        <div style={{ padding: '8px 14px', fontSize: 12.5, color: msgType === 'err' ? '#ff9b8b' : '#9be8ac', background: msgType === 'err' ? 'rgba(168,40,28,0.15)' : 'rgba(95,208,122,0.1)' }}>{msg}</div>
      )}

      <div style={{ padding: narrow ? 10 : 14, borderTop: `1px solid ${G.bronze}55`, flexShrink: 0 }}>
        <Gold onClick={onBuy} disabled={!canAfford || buying} style={{ width: '100%' }}>
          🛒 {buying ? 'Kupuję…' : canAfford ? `Kup za ${fmtNum(price)} złota` : `Brakuje ${fmtNum(price - gold)} złota`}
        </Gold>
      </div>
    </div>
  );
}

// ── Główne okno ──────────────────────────────────────────────────────────────
export default function NpcDialog({ npc, postac, mapa, onClose, onBought, onQuestReward }) {
  const [view, setView] = useState('menu');
  const [shopItems, setShopItems] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [selItem, setSelItem] = useState(null);
  const [gold, setGold] = useState(Number(postac.zloto));
  const [filter, setFilter] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('ok');
  const [buying, setBuying] = useState(false);
  const [npcQuests, setNpcQuests] = useState({ give: [], turnin: [], active: [] });
  const [templeData, setTempleData] = useState(null);
  const [guildData, setGuildData] = useState(null);
  const [narrow, setNarrow] = useState(() => window.innerWidth < 900);

  // typ 3 = kapłanka/świątynia, typ 5 = tablica gildii
  const isTemple = npc.typ === 3;
  const isGuildBoard = npc.typ === 5;

  useEffect(() => {
    const fn = () => setNarrow(window.innerWidth < 900);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  useEffect(() => {
    const on = (e) => { if (e.key === 'Escape') (view === 'menu' ? onClose() : setView('menu')); };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [view, onClose]);

  useEffect(() => {
    if (npc.shop > 0) {
      api.items.shop(npc.shop).then(items => Array.isArray(items) && setShopItems(items));
      api.items.inventory().then(inv => Array.isArray(inv) && setInventory(inv));
    }
    api.quests.forNpc(npc.id).then(r => r && !r.error && setNpcQuests(r));
    if (isTemple) api.items.templeStatus().then(d => d && setTempleData(d));
    if (isGuildBoard) api.items.guildBoard().then(d => d && setGuildData(d));
  }, [npc.id, npc.shop, isTemple, isGuildBoard]);

  const flash = (t, type = 'ok') => { setMsg(t); setMsgType(type); setTimeout(() => setMsg(''), 2500); };

  const acceptQuest = async q => {
    const r = await api.quests.accept(q.id);
    r.ok ? (flash(`Zadanie przyjęte: ${q.nazwa}`), api.quests.forNpc(npc.id).then(x => x && !x.error && setNpcQuests(x))) : flash(r.error || 'Błąd', 'err');
  };
  const turninQuest = async q => {
    const r = await api.quests.turnin(q.quest_id || q.id);
    if (r.ok) {
      const parts = [];
      if (r.rewards?.exp) parts.push(`+${r.rewards.exp} EXP`);
      if (r.rewards?.zloto) parts.push(`+${r.rewards.zloto} złota`);
      if (r.levelUp) parts.push(`☆ Poziom ${r.newLevel}!`);
      flash(parts.join(' · ') || 'Nagrody odebrane!');
      onQuestReward?.(parts.join(' · ') || 'Nagrody odebrane!');
      api.quests.forNpc(npc.id).then(x => x && !x.error && setNpcQuests(x));
    } else flash(r.error || 'Błąd', 'err');
  };
  const buy = async () => {
    if (!selItem || buying) return;
    setBuying(true);
    try {
      const res = await api.items.buy(selItem.id, npc.shop);
      if (res.ok) {
        setGold(res.zloto ?? (gold - (selItem.wartosc_kupna || 0)));
        flash(`Kupiono: ${selItem.nazwa}`);
        onBought?.();
        api.items.inventory().then(inv => Array.isArray(inv) && setInventory(inv));
      } else flash(res.error || 'Błąd zakupu', 'err');
    } catch { flash('Błąd połączenia', 'err'); }
    finally { setBuying(false); }
  };
  const templeHeal = async () => {
    const r = await api.items.templeHeal();
    if (r.ok) { flash('Uleczony! Życie przywrócone do pełni.'); setTempleData(prev => ({ ...prev, canHeal: false, cooldownMins: 30 })); onBought?.(); }
    else flash(r.error || 'Błąd', 'err');
  };

  const hasQuests = npcQuests.give.length + npcQuests.turnin.length + npcQuests.active.length > 0;
  const equippedForItem = selItem ? inventory.find(i => i.zalozony === 1 && SLOT_TYPES[i.typ] === SLOT_TYPES[selItem.typ]) : null;
  const allCats = shopItems ? [...new Set(shopItems.map(i => i.typ))].sort() : [];
  const filtered = (shopItems || []).filter(i =>
    (catFilter === 'all' || i.typ === catFilter) && (!filter || i.nazwa.toLowerCase().includes(filter.toLowerCase())));

  const rola = npc.shop > 0 ? `Kupiec · Sklep #${npc.shop}` : isTemple ? 'Kapłanka Światła' : isGuildBoard ? 'Tablica gildii' : 'Mieszkaniec Veldorii';
  const motto = npc.shop > 0 ? 'Dobre towary, lepsze podróże'
    : isTemple ? 'Światło strzeże wędrowców'
      : isGuildBoard ? 'Chwała należy do wytrwałych'
        : 'Świat Veldorii czeka na śmiałych';
  const powitanie = npc.shop > 0
    ? 'Czym mogę Ci służyć? Mam najlepsze towary z całej Veldorii. Rozejrzyj się spokojnie.'
    : isTemple ? 'Niech Światło Świątyni oczyści twoje rany, podróżniku.'
      : isGuildBoard ? 'Tu wiszą wieści o gildiach i ich zmaganiach.'
        : 'Strzegę tego miejsca i pomagam podróżnikom. Świat Veldorii bywa niebezpieczny.';

  const W = (mapa?.maks_x ?? 0) + 1, H = (mapa?.maks_y ?? 0) + 1;

  const nav = [
    ['menu', '🏠', 'Menu'],
    npc.shop > 0 && ['shop', '🛒', 'Sklep'],
    hasQuests && ['quests', '📜', 'Zadania'],
    isTemple && ['temple', '✦', 'Uzdrowienie'],
    isGuildBoard && ['guild', '⚜', 'Gildie'],
    ['talk', '💬', 'Rozmowa'],
  ].filter(Boolean);

  const menuCards = [
    npc.shop > 0 && { icon: '🧰', label: 'Sklep', sub: 'Przeglądaj towary', desc: 'Sprawdź dostępne przedmioty i zaopatrz się w najlepszy sprzęt.', fn: () => setView('shop') },
    hasQuests && { icon: '📜', label: 'Zadania', sub: `${npcQuests.give.length} nowych · ${npcQuests.turnin.length} do oddania`, desc: 'Przyjmij nowe zlecenia albo odbierz nagrodę za wykonane.', fn: () => setView('quests') },
    isTemple && { icon: '✦', label: 'Uzdrowienie', sub: templeData?.canHeal ? 'Dostępne teraz' : `Za ${templeData?.cooldownMins ?? '?'} min`, desc: 'Poproś o przywrócenie pełni życia mocą Światła.', fn: () => setView('temple') },
    isGuildBoard && { icon: '⚜', label: 'Tablica gildii', sub: 'Rankingi i wojny', desc: 'Sprawdź najsilniejsze gildie świata i trwające wojny.', fn: () => setView('guild') },
    { icon: '💬', label: 'Rozmowa', sub: 'Pogadaj z NPC', desc: 'Dowiedz się więcej, posłuchaj plotek lub zapytaj o okolicę.', fn: () => setView('talk') },
    { icon: '👋', label: 'Do widzenia', sub: 'Zamknij dialog', desc: 'Na razie to wszystko. Do zobaczenia!', fn: onClose },
  ].filter(Boolean);

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 640, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: narrow ? 0 : 20, fontFamily: FONT, color: G.text,
    }}>
      <div style={{
        width: 1080, maxWidth: '100%', height: narrow ? '100%' : 'min(860px, 100%)', position: 'relative',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: 'linear-gradient(180deg,#15120e,#0b0907)',
        border: narrow ? 'none' : `1px solid ${G.gold}`, borderRadius: narrow ? 0 : 6,
        boxShadow: narrow ? 'none' : `0 0 0 1px #000, 0 0 0 5px #120e09, 0 0 0 6px ${G.bronze}, 0 30px 80px rgba(0,0,0,0.9)`,
        paddingTop: narrow ? 'env(safe-area-inset-top, 0px)' : 0, paddingBottom: narrow ? 'env(safe-area-inset-bottom, 0px)' : 0,
      }}>
        {!narrow && <><Corner v="top" h="left" /><Corner v="top" h="right" /><Corner v="bottom" h="left" /><Corner v="bottom" h="right" /></>}

        {/* ── Nagłówek ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: narrow ? 10 : 16, padding: narrow ? '10px 12px' : '14px 22px', flexShrink: 0,
          borderBottom: `1px solid ${G.bronze}`, background: 'linear-gradient(180deg,#1f1a13,#110e0a)',
        }}>
          <div style={{
            width: narrow ? 46 : 62, height: narrow ? 56 : 76, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 3,
            background: 'radial-gradient(ellipse at 50% 80%, rgba(231,193,88,0.2), #0b0907 72%)', border: `1px solid ${G.goldDim}`,
          }}>
            <span style={{
              width: npc.szerokosc || 32, height: npc.dlugosc || 48, transform: `scale(${narrow ? 1 : 1.35})`, imageRendering: 'pixelated',
              backgroundImage: `url(/assets/${npc.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat',
            }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: G.serif, fontSize: narrow ? 18 : 26, color: G.goldHi, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{npc.nazwa}</div>
            <div style={{ color: G.muted, fontSize: narrow ? 12 : 14 }}>{rola}</div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {nav.map(([v, ic, l]) => (
              <NavBtn key={v} active={view === v} onClick={() => { setView(v); setSelItem(null); }}>
                <span style={{ fontSize: 15 }}>{ic}</span>{!narrow && l}
              </NavBtn>
            ))}
          </div>
          {view === 'shop' && !narrow && (
            <span style={{ padding: '8px 14px', borderRadius: 999, border: `1px solid ${G.bronze}`, background: 'linear-gradient(180deg,#191510,#0d0b08)', color: G.goldHi, fontSize: 14, whiteSpace: 'nowrap' }}>
              🪙 {fmtNum(gold)}
            </span>
          )}
          <button onClick={onClose} aria-label="Zamknij" style={{
            width: 40, height: 40, flexShrink: 0, borderRadius: 3, cursor: 'pointer',
            background: 'rgba(0,0,0,0.35)', border: `1px solid ${G.bronze}`, color: G.goldHi, fontSize: 19,
          }}>✕</button>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {/* ── MENU ── */}
          {view === 'menu' && (
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {/* Scena z dymkiem */}
              <div style={{
                position: 'relative', height: narrow ? 210 : 300, flexShrink: 0, overflow: 'hidden',
                borderBottom: `1px solid ${G.bronze}`, background: 'linear-gradient(180deg,#241b12,#120d09)',
              }}>
                {mapa?.obrazek && (
                  <div style={{
                    position: 'absolute', left: '50%', top: '55%', width: W * TILE_BG, height: H * TILE_BG,
                    transform: `translate(${-((npc.x ?? 0) + 0.5) * TILE_BG}px, ${-((npc.y ?? 0) + 0.5) * TILE_BG}px)`,
                    backgroundImage: `url(/assets/${mapa.obrazek})`, backgroundSize: '100% 100%',
                    imageRendering: 'pixelated', filter: 'brightness(0.5) saturate(0.85) blur(1px)',
                  }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 70%, transparent 25%, rgba(0,0,0,0.75) 100%)' }} />

                {/* NPC na scenie */}
                <div style={{ position: 'absolute', left: narrow ? '18%' : '15%', bottom: 18, transform: 'translateX(-50%)', display: 'grid', placeItems: 'center' }}>
                  <span style={{
                    position: 'absolute', bottom: -8, width: 84, height: 22, borderRadius: '50%',
                    background: `radial-gradient(ellipse, ${G.gold}33, transparent 70%)`, border: `1px solid ${G.gold}66`,
                  }} />
                  <span style={{
                    width: npc.szerokosc || 32, height: npc.dlugosc || 48, transform: `scale(${narrow ? 2.2 : 3})`, transformOrigin: 'bottom center',
                    imageRendering: 'pixelated', backgroundImage: `url(/assets/${npc.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat',
                    filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.8))', display: 'block',
                  }} />
                </div>

                {/* Dymek */}
                <div style={{
                  position: 'absolute', right: narrow ? 10 : 30, top: narrow ? 14 : 34, width: narrow ? 'calc(100% - 130px)' : '58%',
                  padding: narrow ? '12px 14px' : '18px 22px', borderRadius: 5,
                  background: 'linear-gradient(180deg,rgba(24,20,15,0.96),rgba(12,10,8,0.96))',
                  border: `1px solid ${G.gold}`, boxShadow: '0 0 0 1px #000, 0 14px 34px rgba(0,0,0,0.7)',
                }}>
                  <span style={{
                    position: 'absolute', left: -9, top: 32, width: 0, height: 0,
                    borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderRight: `9px solid ${G.gold}`,
                  }} />
                  <div style={{ fontFamily: G.serif, fontSize: narrow ? 17 : 22, color: G.goldHi }}>Witaj, podróżniku!</div>
                  <Rule />
                  <div style={{ fontSize: narrow ? 13 : 15, lineHeight: 1.65, color: G.text }}>{powitanie}</div>
                </div>
              </div>

              {/* Karty wyboru */}
              <div style={{
                flex: 1, display: 'grid', gap: narrow ? 10 : 16, padding: narrow ? 12 : '20px 22px',
                gridTemplateColumns: narrow ? '1fr' : 'repeat(3, minmax(0, 1fr))', alignContent: 'start',
              }}>
                {menuCards.map(c => <MenuCard key={c.label} icon={c.icon} label={c.label} sub={c.sub} desc={c.desc} onClick={c.fn} />)}
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '10px 16px', flexShrink: 0,
                borderTop: `1px solid ${G.bronze}55`, color: G.goldDim, fontFamily: G.serif, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase',
              }}>
                <Diamond size={6} />{motto}<Diamond size={6} />
              </div>
            </div>
          )}

          {/* ── SKLEP ── */}
          {view === 'shop' && (
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: narrow ? 'column' : 'row' }}>
              <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', borderRight: narrow ? 'none' : `1px solid ${G.bronze}55` }}>
                <div style={{ display: 'flex', gap: 8, padding: 12, flexShrink: 0, alignItems: 'center' }}>
                  <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Szukaj towaru…" style={{
                    flex: 1, minWidth: 0, padding: '9px 12px', borderRadius: 3, background: '#0b0907', color: G.text,
                    border: `1px solid ${G.bronze}`, fontSize: 13, outline: 'none', fontFamily: FONT,
                  }} />
                  {narrow && <span style={{ color: G.goldHi, fontSize: 13, whiteSpace: 'nowrap' }}>🪙 {fmtNum(gold)}</span>}
                </div>
                {allCats.length > 1 && (
                  <div style={{ display: 'flex', gap: 6, padding: '0 12px 10px', overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none' }}>
                    {[['all', `Wszystko (${shopItems?.length || 0})`], ...allCats.map(c => [c, `${typeLabel(c)} (${shopItems.filter(i => i.typ === c).length})`])].map(([k, l]) => (
                      <button key={k} onClick={() => { setCatFilter(k); setSelItem(null); }} style={{
                        padding: '6px 12px', borderRadius: 3, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                        background: catFilter === k ? 'linear-gradient(180deg,#4a3818,#241a0b)' : 'linear-gradient(180deg,#17130f,#0c0a08)',
                        border: `1px solid ${catFilter === k ? G.gold : G.bronze}`, color: catFilter === k ? G.goldHi : G.muted,
                        fontFamily: G.serif, fontSize: 12.5,
                      }}>{l}</button>
                    ))}
                  </div>
                )}
                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 12px 12px' }}>
                  {shopItems === null && <div style={{ color: G.dim, textAlign: 'center', padding: 30 }}>Wczytywanie towarów…</div>}
                  {shopItems?.length === 0 && <div style={{ color: G.dim, textAlign: 'center', padding: 30 }}>Sklep jest pusty.</div>}
                  {shopItems?.length > 0 && filtered.length === 0 && <div style={{ color: G.dim, textAlign: 'center', padding: 30 }}>Brak wyników.</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${narrow ? 92 : 104}px, 1fr))`, gap: 8 }}>
                    {filtered.map(item => (
                      <ShopCard key={item.id} item={item} selected={selItem?.id === item.id}
                        canAfford={gold >= (item.wartosc_kupna || 0)}
                        onClick={() => setSelItem(selItem?.id === item.id ? null : item)} />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ width: narrow ? 'auto' : 320, flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: narrow ? 220 : 0, borderTop: narrow ? `1px solid ${G.bronze}55` : 'none' }}>
                <ShopDetail item={selItem} equippedItem={equippedForItem} gold={gold} onBuy={buy} buying={buying} msg={msg} msgType={msgType} narrow={narrow} />
              </div>
            </div>
          )}

          {/* ── ZADANIA ── */}
          {view === 'quests' && (
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: narrow ? 12 : '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {msg && <div style={{ padding: '9px 12px', borderRadius: 3, fontSize: 13, background: msgType === 'err' ? 'rgba(168,40,28,0.15)' : 'rgba(95,208,122,0.1)', color: msgType === 'err' ? '#ff9b8b' : '#9be8ac' }}>{msg}</div>}

              {npcQuests.turnin.length > 0 && (
                <div>
                  <div style={{ fontFamily: G.serif, color: '#9be8ac', fontSize: 14, letterSpacing: 1, marginBottom: 8 }}>★ Do oddania</div>
                  {npcQuests.turnin.map(q => (
                    <div key={q.id} style={{ padding: 14, marginBottom: 8, borderRadius: 4, background: 'linear-gradient(180deg,rgba(20,48,28,0.55),rgba(11,26,16,0.6))', border: '1px solid #2f6b3a' }}>
                      <div style={{ fontFamily: G.serif, fontSize: 16, color: '#9be8ac' }}>{q.nazwa}</div>
                      <div style={{ color: G.text, fontSize: 13, margin: '6px 0 10px', lineHeight: 1.55 }}>{q.tekst_koniec || q.opis}</div>
                      <div style={{ display: 'flex', gap: 14, fontSize: 13, marginBottom: 10 }}>
                        {q.nagroda_exp > 0 && <span style={{ color: '#67e8f9' }}>+{fmtNum(q.nagroda_exp)} EXP</span>}
                        {q.nagroda_zloto > 0 && <span style={{ color: G.goldHi }}>🪙 {fmtNum(q.nagroda_zloto)}</span>}
                      </div>
                      <Gold tone="green" onClick={() => turninQuest(q)}>Odbierz nagrody →</Gold>
                    </div>
                  ))}
                </div>
              )}

              {npcQuests.give.length > 0 && (
                <div>
                  <div style={{ fontFamily: G.serif, color: G.goldHi, fontSize: 14, letterSpacing: 1, marginBottom: 8 }}>! Nowe zadania</div>
                  {npcQuests.give.map(q => (
                    <div key={q.id} style={{ padding: 14, marginBottom: 8, borderRadius: 4, background: 'linear-gradient(180deg,#1b1712,#0d0b08)', border: `1px solid ${G.bronze}` }}>
                      <div style={{ fontFamily: G.serif, fontSize: 16, color: G.goldHi }}>{q.nazwa}</div>
                      <div style={{ color: G.text, fontSize: 13, margin: '6px 0 10px', lineHeight: 1.55 }}>{q.tekst_start || q.opis}</div>
                      <div style={{ display: 'flex', gap: 14, fontSize: 13, marginBottom: 10, flexWrap: 'wrap' }}>
                        {q.nagroda_exp > 0 && <span style={{ color: '#67e8f9' }}>+{fmtNum(q.nagroda_exp)} EXP</span>}
                        {q.nagroda_zloto > 0 && <span style={{ color: G.goldHi }}>🪙 {fmtNum(q.nagroda_zloto)}</span>}
                        <span style={{ color: G.muted }}>Cel: {q.cel_ilosc}×</span>
                      </div>
                      <Gold onClick={() => acceptQuest(q)}>Przyjmij zadanie</Gold>
                    </div>
                  ))}
                </div>
              )}

              {npcQuests.active.length > 0 && (
                <div>
                  <div style={{ fontFamily: G.serif, color: G.muted, fontSize: 14, letterSpacing: 1, marginBottom: 8 }}>⋯ W trakcie</div>
                  {npcQuests.active.map(q => (
                    <div key={q.id} style={{ padding: 12, marginBottom: 6, borderRadius: 4, background: 'rgba(0,0,0,0.3)', border: `1px solid ${G.bronze}66` }}>
                      <div style={{ color: G.text, fontFamily: G.serif, fontSize: 14, marginBottom: 6 }}>{q.nazwa}</div>
                      <div style={{ height: 8, borderRadius: 3, background: '#08070a', border: '1px solid #000', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (q.postep / q.cel_ilosc) * 100)}%`, height: '100%', background: `linear-gradient(180deg,${G.expHi},${G.exp})` }} />
                      </div>
                      <div style={{ color: G.muted, fontSize: 12, marginTop: 4 }}>{q.postep} / {q.cel_ilosc}</div>
                    </div>
                  ))}
                </div>
              )}

              {!hasQuests && <div style={{ color: G.dim, textAlign: 'center', padding: 40 }}>Ten NPC nie ma dla ciebie zadań.</div>}
            </div>
          )}

          {/* ── ROZMOWA ── */}
          {view === 'talk' && (
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: narrow ? 14 : '26px 26px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              <div style={{ maxWidth: 680, width: '100%' }}>
                <div style={{
                  position: 'relative', padding: narrow ? '14px 16px' : '20px 24px', borderRadius: 5,
                  background: 'linear-gradient(180deg,rgba(24,20,15,0.96),rgba(12,10,8,0.96))', border: `1px solid ${G.gold}`,
                }}>
                  <div style={{ fontFamily: G.serif, fontSize: 19, color: G.goldHi }}>{npc.nazwa}</div>
                  <Rule />
                  <div style={{ fontSize: 14.5, lineHeight: 1.7, color: G.text }}>
                    {powitanie}
                    {npc.shop > 0 && <><br /><br />Jeśli szukasz sprzętu — zajrzyj do mojego sklepu. Ceny uczciwe, towar sprawdzony.</>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                  {npc.shop > 0 && <Gold onClick={() => setView('shop')}>🛒 Przejdź do sklepu</Gold>}
                  {hasQuests && <Gold onClick={() => setView('quests')}>📜 Pokaż zadania</Gold>}
                  <Gold onClick={() => setView('menu')}>← Wróć do menu</Gold>
                </div>
              </div>
            </div>
          )}

          {/* ── ŚWIĄTYNIA ── */}
          {view === 'temple' && (
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 26, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 52, color: '#9be8ac', filter: 'drop-shadow(0 0 16px rgba(95,208,122,0.5))' }}>✦</span>
              <div style={{ maxWidth: 520, textAlign: 'center', fontSize: 14.5, lineHeight: 1.7, color: G.text }}>
                Niech Światło Świątyni oczyści twoje rany.<br />Kapłanka jest gotowa, by cię uleczyć.
              </div>
              {msg && <div style={{ color: msgType === 'err' ? '#ff9b8b' : '#9be8ac', fontSize: 13.5 }}>{msg}</div>}
              {templeData?.canHeal
                ? <Gold tone="green" onClick={templeHeal} style={{ padding: '12px 34px', fontSize: 15 }}>✦ Ulecz mnie (bezpłatnie)</Gold>
                : <div style={{ color: G.muted, fontSize: 13.5 }}>Kolejne uzdrowienie za <b style={{ color: G.goldHi }}>{templeData?.cooldownMins ?? '?'} min</b>.</div>}
              <div style={{ color: G.dim, fontSize: 12 }}>Darmowe leczenie odnawia się co 30 minut.</div>
            </div>
          )}

          {/* ── TABLICA GILDII ── */}
          {view === 'guild' && (
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: narrow ? 12 : '18px 22px' }}>
              <div style={{ fontFamily: G.serif, color: G.goldHi, fontSize: 16, marginBottom: 12 }}>⚜ Ranking gildii</div>
              {!guildData && <div style={{ color: G.dim, textAlign: 'center', padding: 30 }}>Wczytywanie…</div>}
              {guildData?.topGuilds?.length === 0 && <div style={{ color: G.dim, textAlign: 'center', padding: 30 }}>Brak gildii w świecie Veldorii.</div>}
              {(guildData?.topGuilds || []).map((g, i) => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 6, borderRadius: 4, background: 'rgba(0,0,0,0.3)', border: `1px solid ${G.bronze}66` }}>
                  <span style={{ fontFamily: G.serif, fontSize: 17, color: i < 3 ? G.goldHi : G.muted, width: 28 }}>{i + 1}.</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: G.goldHi, fontFamily: G.serif, fontSize: 14.5 }}>{g.nazwa}</div>
                    <div style={{ color: G.muted, fontSize: 12.5 }}>Poziom {g.poziom} · {g.czlonkowie} członków</div>
                  </div>
                  <span style={{ color: '#67e8f9', fontSize: 13 }}>{fmtNum(g.laczne_kille || 0)} zabójstw</span>
                </div>
              ))}
              {guildData?.recentWars?.length > 0 && (
                <>
                  <div style={{ fontFamily: G.serif, color: '#ff9b8b', fontSize: 15, margin: '16px 0 8px' }}>⚔ Trwające wojny</div>
                  {guildData.recentWars.map((w, i) => (
                    <div key={i} style={{ padding: '9px 12px', marginBottom: 6, borderRadius: 4, background: 'rgba(58,20,16,0.4)', border: '1px solid #a8281c66', fontSize: 13 }}>
                      <b style={{ color: '#ff9b8b' }}>{w.atakujacy_nazwa}</b> przeciw <b style={{ color: '#6fb2ff' }}>{w.bronicy_nazwa}</b>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
