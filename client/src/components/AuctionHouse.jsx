import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const KLASA_COLOR = {
  unique:    '#DAA520',
  heroic:    '#2090FE',
  legendary: '#FA9A20',
  artefact:  '#f0032a',
  normal:    '#CDD4AA',
};

function fmtTime(ts) {
  const diff = new Date(ts) - Date.now();
  if (diff <= 0) return 'Wygasła';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function fmtGold(n) {
  n = Number(n) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function AuctionCard({ a, onBuy, canBuy }) {
  const item  = a.item || {};
  const color = KLASA_COLOR[item.klasa] || KLASA_COLOR.normal;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 8px', marginBottom: 4,
      background: 'rgba(4,8,4,0.6)',
      border: `1px solid ${color}22`,
      borderRadius: 5,
    }}>
      {/* Item icon */}
      <div style={{
        width: 36, height: 36, flexShrink: 0,
        border: `1px solid ${color}44`,
        borderRadius: 3, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {item.obrazek ? (
          <img src={`/assets/${item.obrazek}`} alt={item.nazwa}
            style={{ width: 32, height: 32, imageRendering: 'pixelated', objectFit: 'contain' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : <span style={{ fontSize: 18 }}>📦</span>}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color, fontSize: 10, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.nazwa || 'Nieznany'}
        </div>
        <div style={{ color: '#5A6840', fontSize: 8 }}>
          {a.sprzedawca_nazwa} · wygasa: {fmtTime(a.data_wygasniecia)}
          {item.wym_poziom > 0 && ` · Poz.${item.wym_poziom}+`}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ color: '#E8D070', fontWeight: 'bold', fontSize: 11 }}>
          {fmtGold(a.cena)} 💰
        </div>
        {canBuy && (
          <button onClick={() => onBuy(a.id)} style={{
            marginTop: 2, padding: '2px 8px',
            background: 'rgba(74,122,42,0.25)', color: '#4ADE80',
            border: '1px solid rgba(74,122,42,0.4)', borderRadius: 3,
            cursor: 'pointer', fontSize: 9, fontWeight: 'bold',
          }}>Kup</button>
        )}
        {!canBuy && (
          <div style={{ fontSize: 8, color: '#5A3830', marginTop: 2 }}>Twoja</div>
        )}
      </div>
    </div>
  );
}

export default function AuctionHouse({ onClose, postac, socket }) {
  const [tab,      setTab]      = useState('browse');
  const [aukcje,   setAukcje]   = useState([]);
  const [myAukcje, setMyAukcje] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [flash,    setFlash]    = useState('');
  const [filters,  setFilters]  = useState({ search: '', typ: '', klasa: '', sort: 'nowe' });

  // List form state
  const [listItem,  setListItem]  = useState(null);  // przedmiot from inventory
  const [listCena,  setListCena]  = useState('');
  const [listHours, setListHours] = useState(24);
  const [inventory, setInventory] = useState([]);

  const showFlash = useCallback((msg, isErr) => {
    setFlash({ msg, err: !!isErr });
    setTimeout(() => setFlash(''), 3000);
  }, []);

  // Load auction list
  const loadAukcje = useCallback(async (f = filters) => {
    setLoading(true);
    const params = {};
    if (f.search) params.search = f.search;
    if (f.typ)    params.typ = f.typ;
    if (f.klasa)  params.klasa = f.klasa;
    if (f.sort)   params.sort = f.sort;
    const r = await api.auction.list(params).catch(() => ({ aukcje: [] }));
    setAukcje(r.aukcje || []);
    setLoading(false);
  }, [filters]);

  const loadMyAukcje = useCallback(async () => {
    const r = await api.auction.my().catch(() => ({ aukcje: [] }));
    setMyAukcje(r.aukcje || []);
  }, []);

  const loadInventory = useCallback(async () => {
    const r = await api.items.inventory().catch(() => ({ items: [] }));
    setInventory((r.items || []).filter(i => !i.zalozony));
  }, []);

  useEffect(() => {
    if (tab === 'browse') loadAukcje(filters);
    if (tab === 'my') loadMyAukcje();
    if (tab === 'list') loadInventory();
  }, [tab]);

  // Socket listener — notify when own item is sold
  useEffect(() => {
    if (!socket) return;
    const onSold = ({ itemNazwa, cena, kupiec }) => {
      showFlash(`Sprzedano: ${itemNazwa} za ${fmtGold(cena)} złota (${kupiec})`);
      if (tab === 'my') loadMyAukcje();
    };
    socket.on('auction_sold', onSold);
    return () => socket.off('auction_sold', onSold);
  }, [socket, tab, loadMyAukcje, showFlash]);

  const handleBuy = async (id) => {
    const r = await api.auction.buy(id).catch(() => ({ ok: false, error: 'Błąd sieci' }));
    if (r.ok) {
      showFlash('Zakupiono przedmiot!');
      loadAukcje(filters);
    } else {
      showFlash(r.error || 'Błąd', true);
    }
  };

  const handleCancelMy = async (id) => {
    const r = await api.auction.cancel(id).catch(() => ({ ok: false }));
    if (r.ok) { showFlash('Anulowano aukcję, przedmiot wrócił do plecaka'); loadMyAukcje(); }
    else showFlash(r.error || 'Błąd', true);
  };

  const handleList = async () => {
    if (!listItem || !listCena || Number(listCena) < 1) {
      return showFlash('Wybierz przedmiot i podaj cenę', true);
    }
    const r = await api.auction.post({
      przedmiot_id: listItem.id, cena: Number(listCena), godziny: listHours,
    }).catch(() => ({ ok: false }));
    if (r.ok) {
      showFlash('Wystawiono na aukcję!');
      setListItem(null); setListCena('');
      loadInventory();
    } else {
      showFlash(r.error || 'Błąd', true);
    }
  };

  const handleFilterSearch = () => loadAukcje(filters);

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    fontFamily: 'Verdana,sans-serif',
  };
  const box = {
    width: 580, maxWidth: '98vw', height: '82vh', maxHeight: 680,
    background: 'linear-gradient(160deg,rgba(10,16,7,0.99),rgba(6,10,4,0.99))',
    border: '1px solid rgba(200,150,32,0.25)', borderRadius: 10,
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '0 12px 60px rgba(0,0,0,0.9)',
  };
  const inputSt = {
    padding: '4px 8px', background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(200,150,32,0.25)', borderRadius: 4,
    color: '#CDD4AA', fontSize: 10, outline: 'none',
  };
  const selectSt = { ...inputSt, cursor: 'pointer' };

  const TABS = [
    { key: 'browse', label: '🔍 Przeglądaj' },
    { key: 'my',     label: '📜 Moje aukcje' },
    { key: 'list',   label: '+ Wystaw' },
  ];

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={box}>
        {/* Header */}
        <div style={{
          padding: '8px 14px', background: 'rgba(8,13,5,0.8)',
          borderBottom: '1px solid rgba(200,150,32,0.2)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>🏪</span>
          <span style={{ color: '#E8B84B', fontWeight: 'bold', fontSize: 13 }}>Dom Aukcyjny</span>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#5A6840', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        {/* Flash message */}
        {flash && (
          <div style={{
            padding: '4px 12px', fontSize: 10,
            color: flash.err ? '#F87171' : '#4ADE80',
            background: flash.err ? 'rgba(80,10,10,0.5)' : 'rgba(6,40,20,0.5)',
          }}>{flash.msg}</div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(200,150,32,0.15)', background: 'rgba(4,6,3,0.3)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: '7px 4px', background: 'none',
              border: 'none', borderBottom: tab === t.key ? '2px solid #C8940A' : '2px solid transparent',
              color: tab === t.key ? '#E8B84B' : '#3A4828',
              cursor: 'pointer', fontSize: 10, fontWeight: tab === t.key ? 'bold' : 'normal',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>

          {/* BROWSE TAB */}
          {tab === 'browse' && (
            <>
              {/* Filters */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                <input
                  placeholder="Szukaj nazwy..."
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleFilterSearch()}
                  style={{ ...inputSt, flex: 1, minWidth: 120 }}
                />
                <select value={filters.klasa} onChange={e => setFilters(f => ({ ...f, klasa: e.target.value }))} style={selectSt}>
                  <option value="">Każda klasa</option>
                  <option value="normal">Normal</option>
                  <option value="heroic">Heroic</option>
                  <option value="unique">Unique</option>
                  <option value="legendary">Legendary</option>
                  <option value="artefact">Artefact</option>
                </select>
                <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))} style={selectSt}>
                  <option value="nowe">Najnowsze</option>
                  <option value="cena_asc">Cena ↑</option>
                  <option value="cena_desc">Cena ↓</option>
                </select>
                <button onClick={handleFilterSearch} style={{
                  padding: '4px 12px', background: 'rgba(200,150,32,0.2)', color: '#C8940A',
                  border: '1px solid rgba(200,150,32,0.4)', borderRadius: 4, cursor: 'pointer', fontSize: 9,
                }}>Szukaj</button>
              </div>

              {loading && <div style={{ textAlign: 'center', color: '#5A6840', fontSize: 11, padding: 20 }}>Ładowanie...</div>}
              {!loading && aukcje.length === 0 && (
                <div style={{ textAlign: 'center', color: '#3A4828', fontSize: 10, padding: 30 }}>Brak aktywnych aukcji</div>
              )}
              {aukcje.map(a => (
                <AuctionCard
                  key={a.id} a={a}
                  onBuy={handleBuy}
                  canBuy={a.sprzedawca_id !== postac?.id}
                />
              ))}
            </>
          )}

          {/* MY AUCTIONS TAB */}
          {tab === 'my' && (
            <>
              {myAukcje.length === 0 && (
                <div style={{ textAlign: 'center', color: '#3A4828', fontSize: 10, padding: 30 }}>
                  Nie masz aktywnych aukcji
                </div>
              )}
              {myAukcje.map(a => {
                const item  = a.item || {};
                const color = KLASA_COLOR[item.klasa] || KLASA_COLOR.normal;
                return (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 8px', marginBottom: 4,
                    background: 'rgba(4,8,4,0.6)', border: `1px solid ${color}22`, borderRadius: 5,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color, fontSize: 10, fontWeight: 'bold' }}>{item.nazwa}</div>
                      <div style={{ fontSize: 8, color: '#5A6840' }}>
                        {fmtGold(a.cena)} 💰 · wygasa: {fmtTime(a.data_wygasniecia)}
                        {' · '}<span style={{ color: a.status === 'aktywna' ? '#4ADE80' : '#F87171' }}>{a.status}</span>
                      </div>
                    </div>
                    {a.status === 'aktywna' && (
                      <button onClick={() => handleCancelMy(a.id)} style={{
                        padding: '2px 8px', background: 'rgba(180,30,30,0.2)', color: '#F87171',
                        border: '1px solid rgba(180,30,30,0.4)', borderRadius: 3,
                        cursor: 'pointer', fontSize: 9,
                      }}>Anuluj</button>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* LIST TAB */}
          {tab === 'list' && (
            <div>
              <div style={{ fontSize: 9, color: '#5A6840', marginBottom: 8 }}>Wybierz przedmiot z plecaka:</div>

              {/* Inventory grid */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                {inventory.length === 0 && (
                  <div style={{ color: '#3A4828', fontSize: 10 }}>Plecak pusty</div>
                )}
                {inventory.map(item => {
                  const color   = KLASA_COLOR[item.klasa] || KLASA_COLOR.normal;
                  const selected = listItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setListItem(item)}
                      title={item.nazwa}
                      style={{
                        width: 40, height: 40, cursor: 'pointer',
                        border: `1px solid ${selected ? color : color+'44'}`,
                        borderRadius: 3,
                        background: selected ? `${color}22` : 'rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                      {item.obrazek ? (
                        <img src={`/assets/${item.obrazek}`} alt={item.nazwa}
                          style={{ width: 36, height: 36, imageRendering: 'pixelated', objectFit: 'contain' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : <span style={{ fontSize: 16 }}>📦</span>}
                    </div>
                  );
                })}
              </div>

              {/* Selected item info */}
              {listItem && (
                <div style={{
                  padding: '5px 8px', marginBottom: 8, borderRadius: 4,
                  background: 'rgba(200,150,32,0.08)',
                  border: '1px solid rgba(200,150,32,0.2)',
                  color: KLASA_COLOR[listItem.klasa] || '#CDD4AA', fontSize: 10,
                }}>
                  Wybrany: {listItem.nazwa} ({listItem.klasa})
                </div>
              )}

              {/* Price + hours */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 8, color: '#5A6840', marginBottom: 2 }}>Cena (złoto):</div>
                  <input
                    type="number" min="1"
                    value={listCena}
                    onChange={e => setListCena(e.target.value)}
                    placeholder="np. 1000"
                    style={{ ...inputSt, width: 100 }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 8, color: '#5A6840', marginBottom: 2 }}>Czas (godziny):</div>
                  <select value={listHours} onChange={e => setListHours(Number(e.target.value))} style={selectSt}>
                    {[1, 2, 4, 8, 12, 24, 48].map(h => (
                      <option key={h} value={h}>{h}h</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleList} style={{
                  padding: '6px 16px', marginTop: 14,
                  background: 'rgba(74,122,42,0.25)', color: '#4ADE80',
                  border: '1px solid rgba(74,122,42,0.4)', borderRadius: 4,
                  cursor: 'pointer', fontSize: 10, fontWeight: 'bold',
                }}>
                  Wystaw na aukcji
                </button>
              </div>

              <div style={{ fontSize: 8, color: '#3A4828', fontStyle: 'italic' }}>
                Przedmiot zostanie usunięty z plecaka do momentu sprzedaży lub anulowania.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
