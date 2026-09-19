import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api';
import { C, WEAPON_TYPES, typeLabel, fmtNum, useIsNarrow } from '../ui/kit';
import { Frame, Slot, ItemCard, Btn } from '../ui/Frame';

const DOLL_SLOTS = [
  { id: 'helm',   types: ['Helm'],       label: 'Hełm' },
  { id: 'neck',   types: ['Naszyjnik'],  label: 'Naszyjnik' },
  { id: 'tali',   types: ['Talizman'],   label: 'Talizman' },
  { id: 'weapon', types: WEAPON_TYPES,   label: 'Broń' },
  { id: 'armor',  types: ['Zbroja'],     label: 'Zbroja' },
  { id: 'shield', types: ['Tarcza'],     label: 'Tarcza' },
  { id: 'gloves', types: ['Rekawice'],   label: 'Rękawice' },
  { id: 'boots',  types: ['Buty'],       label: 'Buty' },
  { id: 'ring',   types: ['Pierscien'],  label: 'Pierścień' },
  { id: 'arrows', types: ['Strzaly'],    label: 'Strzały' },
];

const MIN_BAG_SLOTS = 24;

function Chip({ label, value, color }) {
  return (
    <div style={{
      background: C.bgSlot, border: `1px solid ${C.line}`, borderRadius: 5,
      padding: '3px 7px', minWidth: 58,
    }}>
      <div style={{ color: C.textDim, fontSize: 9, lineHeight: 1.2 }}>{label}</div>
      <div style={{ color: color || C.text, fontSize: 12, fontWeight: 'bold', lineHeight: 1.2 }}>{value}</div>
    </div>
  );
}

export default function Inventory({ onClose, onRefresh, postac }) {
  const narrow = useIsNarrow();
  const [items, setItems]     = useState([]);
  const [sel, setSel]         = useState(null);
  const [filter, setFilter]   = useState('');
  const [cat, setCat]         = useState('all');
  const [sort, setSort]       = useState('typ');
  const [msg, setMsg]         = useState(null);

  const load = useCallback(async () => {
    const data = await api.items.inventory();
    if (Array.isArray(data)) {
      setItems(data);
      setSel(prev => (prev ? data.find(i => i.id === prev.id) || null : null));
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 2600); };

  const equip = async (i) => {
    const r = await api.items.equip(i.id, 'zaloz');
    if (r?.error) return flash(r.error, false);
    await load(); onRefresh?.(); flash(`Założono: ${i.nazwa}`);
  };
  const unequip = async (i) => {
    const r = await api.items.equip(i.id, 'zdejmij');
    if (r?.error) return flash(r.error, false);
    await load(); onRefresh?.(); flash(`Zdjęto: ${i.nazwa}`);
  };
  const use = async (i) => {
    const r = await api.character.heal();
    await load(); onRefresh?.();
    flash(r?.healed ? `Wyleczono +${r.healed} HP` : `Użyto: ${i.nazwa}`);
  };
  const sell = async (i) => {
    if (!window.confirm(`Sprzedać „${i.nazwa}" za ${i.wartosc_sprzedazy}?`)) return;
    const r = await api.items.sell(i.id);
    if (r?.error) return flash(r.error, false);
    setSel(null); await load(); onRefresh?.(); flash(`Sprzedano za ${fmtNum(i.wartosc_sprzedazy)}`);
  };

  const equipped = useMemo(() => items.filter(i => i.zalozony === 1), [items]);
  const bag      = useMemo(() => items.filter(i => i.zalozony !== 1), [items]);
  const inSlot   = (slot) => equipped.find(i => slot.types.includes(i.typ)) || null;

  const compare = sel && sel.zalozony !== 1
    ? equipped.find(e => {
        const a = DOLL_SLOTS.find(s => s.types.includes(e.typ));
        const b = DOLL_SLOTS.find(s => s.types.includes(sel.typ));
        return a && b && a.id === b.id;
      }) || null
    : null;

  const cats = useMemo(() => [...new Set(bag.map(i => i.typ))].sort(), [bag]);
  const shown = useMemo(() => bag
    .filter(i => (cat === 'all' || i.typ === cat) && (!filter || i.nazwa.toLowerCase().includes(filter.toLowerCase())))
    .sort((a, b) => sort === 'poziom' ? (b.wym_poziom || 0) - (a.wym_poziom || 0)
      : sort === 'nazwa' ? a.nazwa.localeCompare(b.nazwa, 'pl')
      : (a.typ || '').localeCompare(b.typ || '', 'pl')),
  [bag, cat, filter, sort]);

  const canEquip = sel && !['Konsupcyjne', 'Neutralne', 'Ryba'].includes(sel.typ);
  const actions = sel && (
    <>
      {sel.zalozony === 1
        ? <Btn onClick={() => unequip(sel)} tone="gold">↩ Zdejmij</Btn>
        : canEquip && <Btn onClick={() => equip(sel)} tone="green">⚔ Załóż</Btn>}
      {sel.typ === 'Konsupcyjne' && <Btn onClick={() => use(sel)} tone="green">🧪 Użyj</Btn>}
      {sel.zalozony !== 1 && sel.wartosc_sprzedazy > 0 &&
        <Btn onClick={() => sell(sel)} tone="red">Sprzedaj {fmtNum(sel.wartosc_sprzedazy)}</Btn>}
      {narrow && <Btn onClick={() => setSel(null)} tone="plain">Zamknij</Btn>}
    </>
  );

  const goldBadge = (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px',
      background: C.bgSlot, border: `1px solid ${C.bronze}`, borderRadius: 999,
      color: C.gold, fontSize: 13, fontWeight: 'bold',
    }}>🪙 {fmtNum(postac?.zloto)}</span>
  );

  // ── Panel postaci + ekwipunek ──────────────────────────────────────────────
  const dollPanel = (
    <section style={{ padding: 12, borderRight: narrow ? 'none' : `1px solid ${C.line}`, flexShrink: 0, width: narrow ? '100%' : 300 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <div style={{
          width: 46, height: 58, background: C.bgSlot, border: `1px solid ${C.bronze}`, borderRadius: 6,
          backgroundImage: `url(/assets/${postac?.obrazek})`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated', flexShrink: 0,
        }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ color: C.gold, fontWeight: 'bold', fontSize: 14 }}>{postac?.nazwa}</div>
          <div style={{ color: C.textMuted, fontSize: 11 }}>{postac?.profesja} · poziom {postac?.poziom}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        <Chip label="Atak"   value={`${postac?.obrazenia_min ?? 0}–${postac?.obrazenia_max ?? 0}`} color="#ff9a7a" />
        <Chip label="Pancerz" value={postac?.ac ?? 0} color={C.gold} />
        <Chip label="Życie"  value={`${postac?.zycie ?? 0}/${postac?.zycie_max ?? 0}`} color={C.ok} />
        <Chip label="Siła"   value={postac?.sila ?? 0} />
        <Chip label="Zręczność" value={postac?.zrecznosc ?? 0} />
        <Chip label="Intelekt"  value={postac?.intelekt ?? 0} />
      </div>

      <div style={{ color: C.goldDim, fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>ZAŁOŻONE</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
        {DOLL_SLOTS.map(s => {
          const it = inSlot(s);
          return (
            <Slot
              key={s.id} item={it} label={s.label} size={narrow ? 52 : 50}
              selected={!!it && sel?.id === it.id}
              onClick={() => it && setSel(sel?.id === it.id ? null : it)}
              style={{ width: '100%' }}
            />
          );
        })}
      </div>
    </section>
  );

  // ── Plecak ─────────────────────────────────────────────────────────────────
  const emptyCount = Math.max(0, MIN_BAG_SLOTS - shown.length);
  const bagPanel = (
    <section style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 6, padding: 10, borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
        <input
          value={filter} onChange={e => setFilter(e.target.value)} placeholder="Szukaj…"
          style={{
            flex: 1, minWidth: 0, padding: '7px 9px', background: C.bgSlot, color: C.text,
            border: `1px solid ${C.line}`, borderRadius: 6, fontSize: 12, outline: 'none', fontFamily: C.font,
          }}
        />
        <select value={sort} onChange={e => setSort(e.target.value)} style={{
          padding: '7px 6px', background: C.bgSlot, color: C.text,
          border: `1px solid ${C.line}`, borderRadius: 6, fontSize: 12, fontFamily: C.font,
        }}>
          <option value="typ">Typ</option>
          <option value="poziom">Poziom</option>
          <option value="nazwa">A–Z</option>
        </select>
      </div>

      {cats.length > 1 && (
        <div style={{ display: 'flex', gap: 4, padding: '6px 10px', overflowX: 'auto', borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
          {[['all', `Wszystko (${bag.length})`], ...cats.map(c => [c, `${typeLabel(c)} (${bag.filter(i => i.typ === c).length})`])].map(([k, l]) => (
            <button key={k} onClick={() => setCat(k)} style={{
              padding: '4px 10px', whiteSpace: 'nowrap', cursor: 'pointer', fontSize: 11, fontFamily: C.font,
              background: cat === k ? 'rgba(232,192,90,0.12)' : 'transparent',
              color: cat === k ? C.gold : C.textMuted,
              border: `1px solid ${cat === k ? C.bronze : 'transparent'}`, borderRadius: 999,
            }}>{l}</button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(54px, 1fr))', gap: 6 }}>
          {shown.map(it => (
            <Slot
              key={it.id} item={it} size={54} count={it.ilosc}
              selected={sel?.id === it.id}
              onClick={() => setSel(sel?.id === it.id ? null : it)}
              style={{ width: '100%' }}
            />
          ))}
          {Array.from({ length: emptyCount }, (_, i) => (
            <Slot key={`e${i}`} size={54} style={{ width: '100%' }} />
          ))}
        </div>
        {bag.length === 0 && (
          <div style={{ color: C.textDim, fontSize: 12, textAlign: 'center', padding: '18px 0' }}>Plecak jest pusty</div>
        )}
      </div>
    </section>
  );

  return (
    <Frame
      title="Ekwipunek" icon="🎒" onClose={onClose} narrow={narrow} width={940}
      right={<>
        {msg && (
          <span style={{
            fontSize: 11, padding: '4px 9px', borderRadius: 999,
            color: msg.ok ? C.ok : C.bad,
            border: `1px solid ${msg.ok ? 'rgba(111,216,111,0.4)' : 'rgba(255,90,74,0.4)'}`,
            background: 'rgba(0,0,0,0.35)',
          }}>{msg.text}</span>
        )}
        {goldBadge}
      </>}
      style={{ height: narrow ? '100%' : 620 }}
    >
      <div style={{
        display: 'flex', flexDirection: narrow ? 'column' : 'row',
        flex: 1, minHeight: 0, overflowY: narrow ? 'auto' : 'hidden',
      }}>
        {dollPanel}
        {bagPanel}

        {/* Karta przedmiotu: kolumna na dużym ekranie */}
        {!narrow && (
          <aside style={{ width: 290, flexShrink: 0, borderLeft: `1px solid ${C.line}`, padding: 10, overflowY: 'auto' }}>
            {sel
              ? <ItemCard item={sel} compare={compare} postac={postac} actions={actions} />
              : <div style={{ color: C.textDim, fontSize: 12, textAlign: 'center', paddingTop: 40 }}>
                  Wybierz przedmiot, aby zobaczyć szczegóły
                </div>}
          </aside>
        )}
      </div>

      {/* Karta przedmiotu: wysuwana z dołu na telefonie */}
      {narrow && sel && (
        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 210,
          padding: 8, background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.85) 22%)',
          maxHeight: '72%', overflowY: 'auto',
        }}>
          <ItemCard item={sel} compare={compare} postac={postac} actions={actions} />
        </div>
      )}
    </Frame>
  );
}
