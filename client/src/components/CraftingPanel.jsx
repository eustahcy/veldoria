import { useState, useEffect, useCallback } from 'react';
import { IconHammer, IconBox } from '../Icons';
import { api } from '../api';

const RARITY_COLORS = {
  pospolity: '#6B7280',
  rzadki:    '#e7c158',
  epicki:    '#8B5CF6',
};
const RARITY_LABELS = {
  pospolity: 'Pospolity',
  rzadki:    'Rzadki',
  epicki:    'Epicki',
};

const TAB_STYLE_BASE = {
  padding: '6px 14px', fontSize: 10, cursor: 'pointer',
  border: '1px solid rgba(200,146,42,0.3)', borderRadius: 3,
  fontFamily: '"Palatino Linotype",Palatino,serif',
  letterSpacing: '0.5px', transition: 'all 0.15s',
};

export default function CraftingPanel({ onClose, postac }) {
  const [tab, setTab]         = useState('surowce');
  const [materials, setMats]  = useState([]);
  const [recipes, setRecs]    = useState([]);
  const [inventory, setInv]   = useState([]);
  const [selectedItem, setSel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mats, recs, inv] = await Promise.all([
        api.craft.materials(),
        api.craft.recipes(),
        api.items.inventory(),
      ]);
      if (Array.isArray(mats)) setMats(mats);
      if (Array.isArray(recs)) setRecs(recs);
      if (Array.isArray(inv))  setInv(inv.filter(i => i.zalozony === 0));
    } catch(_) {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleCraft = async (recipeId) => {
    const r = await api.craft.create(recipeId);
    if (r.ok) { showMsg(r.msg || 'Stworzono!', true); load(); }
    else showMsg(r.error || 'Błąd craftu', false);
  };

  const handleUpgrade = async () => {
    if (!selectedItem) return;
    const r = await api.craft.upgrade(selectedItem.id);
    if (r.ok) {
      showMsg(r.msg || (r.success ? 'Ulepszenie udane!' : 'Nieudane — materiały utracone'), r.success);
      load();
      setSel(null);
    } else showMsg(r.error || 'Błąd', false);
  };

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 200, fontFamily: 'Verdana,sans-serif',
  };
  const panel = {
    width: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
    background: 'linear-gradient(160deg,rgba(20,16,12,0.99),rgba(12,10,8,0.99))',
    border: '1px solid rgba(200,146,42,0.35)', borderRadius: 6,
    boxShadow: '0 8px 40px rgba(0,0,0,0.85)',
  };

  const upgradeLevels = [90, 75, 60, 40, 20];
  const selMatch = selectedItem ? selectedItem.nazwa.match(/ \+(\d+)$/) : null;
  const selLevel = selMatch ? parseInt(selMatch[1]) : 0;
  const nextChance = selLevel < 5 ? upgradeLevels[selLevel] : null;

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={panel}>
        {/* Header */}
        <div style={{
          padding: '10px 14px', borderBottom: '1px solid rgba(200,146,42,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ color: '#E8B84B', fontSize: 13, fontWeight: 'bold', fontFamily: '"Palatino Linotype",Palatino,serif', letterSpacing: '1px' }}>
            <IconHammer size={14} /> Kowal & Rzemiosło
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B5530', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, padding: '8px 14px 0', borderBottom: '1px solid rgba(200,146,42,0.15)' }}>
          {[['surowce','Surowce'],['receptury','Receptury'],['ulepszanie','Ulepszanie']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              ...TAB_STYLE_BASE,
              background: tab === t ? 'rgba(200,146,42,0.15)' : 'transparent',
              color: tab === t ? '#E8B84B' : '#6B5530',
              borderBottom: tab === t ? '2px solid #e7c158' : '2px solid transparent',
            }}>{label}</button>
          ))}
        </div>

        {/* Message bar */}
        {msg && (
          <div style={{ padding: '6px 14px', fontSize: 10, color: msg.ok ? '#4ADE80' : '#F87171', background: msg.ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)' }}>
            {msg.text}
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          {loading && <div style={{ color: '#6B5530', fontSize: 11, textAlign: 'center', padding: 20 }}>Ładowanie...</div>}

          {/* ── SUROWCE ──────────────────────────────────────────────────────── */}
          {!loading && tab === 'surowce' && (
            <div>
              {materials.length === 0 && (
                <div style={{ color: '#4A3828', fontSize: 11, textAlign: 'center', padding: 20 }}>
                  Brak surowców. Pokonaj potwory, aby je zdobyć!
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {materials.map(m => (
                  <div key={m.surowiec_id} style={{
                    background: 'rgba(200,146,42,0.04)', border: `1px solid ${RARITY_COLORS[m.rzadkosc] || '#444'}`,
                    borderRadius: 4, padding: '8px 6px', textAlign: 'center', position: 'relative',
                  }}>
                    <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'center', color: '#9a9182' }}><IconBox size={22} /></div>
                    <div style={{ fontSize: 9, color: '#e8e2d4', lineHeight: 1.3 }}>{m.nazwa}</div>
                    <div style={{ fontSize: 8, color: RARITY_COLORS[m.rzadkosc], marginTop: 2 }}>{RARITY_LABELS[m.rzadkosc]}</div>
                    <div style={{
                      position: 'absolute', top: 3, right: 5,
                      background: '#e7c158', color: '#0A0600', fontSize: 8, fontWeight: 'bold',
                      borderRadius: 8, padding: '1px 5px',
                    }}>{m.ilosc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RECEPTURY ────────────────────────────────────────────────────── */}
          {!loading && tab === 'receptury' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recipes.length === 0 && (
                <div style={{ color: '#4A3828', fontSize: 11, textAlign: 'center', padding: 20 }}>
                  Brak dostępnych receptur dla twojego poziomu.
                </div>
              )}
              {recipes.map(r => (
                <div key={r.id} style={{
                  background: 'rgba(200,146,42,0.04)', border: `1px solid ${r.canCraft ? 'rgba(74,222,128,0.3)' : 'rgba(200,146,42,0.15)'}`,
                  borderRadius: 4, padding: '8px 10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <span style={{ color: '#E8B84B', fontSize: 11, fontWeight: 'bold' }}>{r.nazwa}</span>
                      {r.item_nazwa && r.item_nazwa !== r.nazwa && (
                        <span style={{ color: '#8A7050', fontSize: 9, marginLeft: 6 }}>→ {r.item_nazwa}</span>
                      )}
                      <span style={{ color: '#5A4020', fontSize: 8, marginLeft: 8 }}>Poz.{r.wymagany_poziom}</span>
                    </div>
                    <button
                      onClick={() => handleCraft(r.id)}
                      disabled={!r.canCraft}
                      style={{
                        padding: '3px 10px', fontSize: 9, cursor: r.canCraft ? 'pointer' : 'not-allowed',
                        background: r.canCraft ? 'rgba(74,222,128,0.15)' : 'rgba(50,40,20,0.3)',
                        color: r.canCraft ? '#4ADE80' : '#4A3828',
                        border: `1px solid ${r.canCraft ? 'rgba(74,222,128,0.4)' : 'rgba(80,60,20,0.3)'}`,
                        borderRadius: 3, fontFamily: 'Verdana,sans-serif',
                      }}
                    >Stwórz</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(r.ingredients || []).map(ing => (
                      <span key={ing.surowiec_id} style={{
                        fontSize: 8, padding: '2px 6px', borderRadius: 8,
                        background: ing.wystarczy ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                        color: ing.wystarczy ? '#4ADE80' : '#F87171',
                        border: `1px solid ${ing.wystarczy ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                      }}>
                        {ing.nazwa}: {ing.posiadam}/{ing.potrzebna}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ULEPSZANIE ───────────────────────────────────────────────────── */}
          {!loading && tab === 'ulepszanie' && (
            <div>
              <div style={{ color: '#8A7050', fontSize: 9, marginBottom: 8 }}>
                Koszt ulepszenia: Kryształy Magii. Szanse: +1=90%, +2=75%, +3=60%, +4=40%, +5=20%.
                Na niepowodzenie materiały są tracone, przedmiot pozostaje.
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ color: '#6B5530', fontSize: 9, marginBottom: 4 }}>Wybierz przedmiot z plecaka:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, maxHeight: 200, overflow: 'auto' }}>
                  {inventory.filter(i => i.typ !== 'Ryba').map(item => {
                    const matchLvl = item.nazwa.match(/ \+(\d+)$/);
                    const lvl = matchLvl ? parseInt(matchLvl[1]) : 0;
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSel(isSelected ? null : item)}
                        style={{
                          padding: '6px 8px', cursor: 'pointer', borderRadius: 3,
                          background: isSelected ? 'rgba(200,146,42,0.15)' : 'rgba(200,146,42,0.04)',
                          border: `1px solid ${isSelected ? 'rgba(200,146,42,0.6)' : 'rgba(200,146,42,0.15)'}`,
                        }}
                      >
                        <div style={{ color: '#e8e2d4', fontSize: 9 }}>{item.nazwa}</div>
                        <div style={{ color: '#6B5530', fontSize: 8, marginTop: 2 }}>{item.typ} — {lvl < 5 ? `+${lvl}` : 'MAX'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedItem && (
                <div style={{ padding: 10, background: 'rgba(200,146,42,0.06)', border: '1px solid rgba(200,146,42,0.2)', borderRadius: 4 }}>
                  <div style={{ color: '#E8B84B', fontSize: 11, marginBottom: 6 }}>{selectedItem.nazwa}</div>
                  {selLevel < 5 ? (
                    <>
                      <div style={{ color: '#e8e2d4', fontSize: 9, marginBottom: 4 }}>
                        Ulepsz do: <span style={{ color: '#E8B84B' }}>+{selLevel + 1}</span> &nbsp;|&nbsp;
                        Szansa: <span style={{ color: nextChance >= 60 ? '#4ADE80' : nextChance >= 40 ? '#e7c158' : '#F87171' }}>{nextChance}%</span>
                      </div>
                      <div style={{ color: '#8A7050', fontSize: 8, marginBottom: 8 }}>
                        Koszt: {Math.max(1, Math.floor((selectedItem.wartosc_sprzedazy || 50) / 25))}x Kryształ Magii
                      </div>
                      <div style={{ color: '#F87171', fontSize: 8, marginBottom: 8 }}>
                        Materiały przepadają nawet przy niepowodzeniu!
                      </div>
                      <button onClick={handleUpgrade} style={{
                        padding: '5px 16px', background: 'rgba(200,146,42,0.15)', color: '#E8B84B',
                        border: '1px solid rgba(200,146,42,0.5)', borderRadius: 3, cursor: 'pointer',
                        fontSize: 10, fontFamily: 'Verdana,sans-serif',
                      }}>
                        Ulepsz ({nextChance}% szansy)
                      </button>
                    </>
                  ) : (
                    <div style={{ color: '#e7c158', fontSize: 10 }}>Ten przedmiot jest na maksymalnym poziomie ulepszenia (+5).</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
