// Kreator zawartości gry: przedmioty, potwory, NPC i skórki postaci.
// Wgrane ikony są automatycznie dopasowywane do rozmiarów używanych przez grę
// (skalowanie „nearest neighbour”, żeby piksel-art pozostał ostry).
import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';
import { hudColors as G } from './hud/GameHud';
import { TYPE_LABEL, RARITY, rarityOf } from '../ui/kit';

const FONT = "'Trebuchet MS', Verdana, sans-serif";

// Rozmiary grafik w grze
export const ROZMIARY = {
  item: { w: 32, h: 32, opis: 'ikona przedmiotu 32×32' },
  mob: { w: 48, h: 48, opis: 'potwór do 48×48' },
  npc: { w: 32, h: 48, opis: 'NPC 32×48' },
  skin: { w: 128, h: 192, opis: 'skórka 4×4 klatki po 32×48' },
};

// ── Dopasowanie obrazka ──────────────────────────────────────────────────────
// Mały obrazek powiększamy całkowitą krotnością (ostre piksele), duży zmniejszamy
// z zachowaniem proporcji i wyśrodkowujemy na przezroczystym płótnie.
export function dopasujObraz(img, docW, docH) {
  const plotno = document.createElement('canvas');
  plotno.width = docW; plotno.height = docH;
  const ctx = plotno.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;
  let skala = Math.min(docW / sw, docH / sh);
  if (skala > 1) skala = Math.max(1, Math.floor(skala));      // powiększamy całkowicie
  const w = Math.max(1, Math.round(sw * skala));
  const h = Math.max(1, Math.round(sh * skala));
  ctx.drawImage(img, Math.floor((docW - w) / 2), Math.floor((docH - h) / 2), w, h);
  return plotno;
}

// Skórka postaci: arkusz 4 kolumny (klatki chodu) × 4 wiersze (kierunki).
// Gdy ktoś wgra pojedynczą sylwetkę, powielamy ją na cały arkusz.
export function zbudujArkuszSkorki(img) {
  const { w: AW, h: AH } = ROZMIARY.skin;
  const sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;
  const plotno = document.createElement('canvas');
  plotno.width = AW; plotno.height = AH;
  const ctx = plotno.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const proporcjaArkusza = Math.abs(sw / sh - AW / AH) < 0.12;
  if (proporcjaArkusza) { ctx.drawImage(img, 0, 0, AW, AH); return { plotno, arkusz: true }; }

  const klatka = dopasujObraz(img, AW / 4, AH / 4);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) ctx.drawImage(klatka, c * (AW / 4), r * (AH / 4));
  return { plotno, arkusz: false };
}

const wczytajObraz = (plik) => new Promise((ok, err) => {
  const url = URL.createObjectURL(plik);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); ok(img); };
  img.onerror = () => { URL.revokeObjectURL(url); err(new Error('Nie udało się wczytać obrazka')); };
  img.src = url;
});
const doBloba = (plotno) => new Promise(ok => plotno.toBlob(ok, 'image/png'));

// ── Elementy interfejsu ──────────────────────────────────────────────────────
const pole = {
  width: '100%', boxSizing: 'border-box', padding: '9px 10px', borderRadius: 3,
  background: '#0b0907', color: G.text, border: `1px solid ${G.bronze}`, fontSize: 13, fontFamily: FONT, outline: 'none',
};
function Pole({ label, children, szer }) {
  return (
    <label style={{ display: 'block', minWidth: 0, gridColumn: szer ? `span ${szer}` : undefined }}>
      <div style={{ color: G.muted, fontSize: 12, marginBottom: 4 }}>{label}</div>
      {children}
    </label>
  );
}
const Liczba = ({ v, on, min, max, krok }) => (
  <input type="number" value={v} min={min} max={max} step={krok || 1} onChange={e => on(e.target.value === '' ? '' : Number(e.target.value))} style={pole} />
);
const Tekst = ({ v, on, ph }) => <input value={v} placeholder={ph} onChange={e => on(e.target.value)} style={pole} />;
const Wybor = ({ v, on, opcje }) => (
  <select value={v} onChange={e => on(e.target.value)} style={pole}>
    {opcje.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
  </select>
);
function Przycisk({ children, onClick, tone, disabled, style }) {
  const red = tone === 'red', green = tone === 'green';
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '10px 16px', borderRadius: 3, cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? '#0e0c0a' : red ? 'linear-gradient(180deg,#3a1410,#1a0907)' : green ? 'linear-gradient(180deg,#14301c,#0b1a10)' : 'linear-gradient(180deg,#4a3818,#241a0b)',
      border: `1px solid ${disabled ? '#3a3122' : red ? '#a8281c' : green ? '#2f6b3a' : G.gold}`,
      color: disabled ? G.dim : red ? '#ff8b78' : green ? '#9be8ac' : G.goldHi,
      fontFamily: G.serif, fontSize: 13.5, ...style,
    }}>{children}</button>
  );
}
function Karta({ tytul, ikona, children, prawo }) {
  return (
    <div style={{ background: 'linear-gradient(180deg,#1a1611,#100d0a)', border: `1px solid ${G.bronze}aa`, borderRadius: 5, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px 9px', borderBottom: `1px solid ${G.bronze}55` }}>
        <span style={{ fontSize: 17, color: G.gold }}>{ikona}</span>
        <span style={{ fontFamily: G.serif, fontSize: 15, color: G.goldHi, flex: 1 }}>{tytul}</span>
        {prawo}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

// ── Wybór ikony: wgranie pliku albo istniejąca grafika ───────────────────────
function WyborIkony({ kategoria, wartosc, onZmiana, info }) {
  const [lista, setLista] = useState([]);
  const [szukaj, setSzukaj] = useState('');
  const [stan, setStan] = useState('');
  const [podglad, setPodglad] = useState(null);
  const plikRef = useRef(null);
  const rozmiar = ROZMIARY[kategoria === 'skin' ? 'skin' : kategoria] || ROZMIARY.item;

  const odswiez = useCallback(() => {
    const kat = kategoria === 'skin' ? 'avatar' : kategoria;
    fetch(`/api/assets/list/${kat}`, { credentials: 'include' })
      .then(r => r.json()).then(r => Array.isArray(r) && setLista(r)).catch(() => {});
  }, [kategoria]);
  useEffect(() => { odswiez(); }, [odswiez]);

  const wgraj = async (e) => {
    const plik = e.target.files?.[0];
    if (!plik) return;
    setStan('Dopasowuję ikonę…');
    try {
      const img = await wczytajObraz(plik);
      let plotno, uwaga = '';
      if (kategoria === 'skin') {
        const r = zbudujArkuszSkorki(img);
        plotno = r.plotno;
        uwaga = r.arkusz ? '' : ' (pojedyncza sylwetka powielona na cały arkusz)';
      } else {
        plotno = dopasujObraz(img, rozmiar.w, rozmiar.h);
      }
      const blob = await doBloba(plotno);
      const fd = new FormData();
      const nazwaPliku = plik.name.replace(/\.[^.]+$/, '') + '.png';
      fd.append('file', blob, nazwaPliku);
      const kat = kategoria === 'skin' ? 'avatar' : kategoria;
      const r = await fetch(`/api/assets/upload/${kat}`, { method: 'POST', credentials: 'include', body: fd });
      const dane = await r.json();
      if (dane?.ok) {
        onZmiana(dane.path);
        setPodglad(plotno.toDataURL());
        setStan(`Wgrano ${img.naturalWidth}×${img.naturalHeight} → ${plotno.width}×${plotno.height}${uwaga}`);
        odswiez();
      } else setStan(dane?.error || 'Nie udało się wgrać pliku');
    } catch (err) { setStan(err.message); }
    if (plikRef.current) plikRef.current.value = '';
  };

  const widoczne = lista.filter(f => !szukaj || (f.name || f).toLowerCase().includes(szukaj.toLowerCase())).slice(0, 60);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
        <div style={{
          width: 72, height: 72, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 4,
          background: 'radial-gradient(ellipse at 50% 30%, rgba(231,193,88,0.12), #0b0907 70%)', border: `1px solid ${G.bronze}`,
        }}>
          {wartosc || podglad ? (
            <span style={{
              width: 56, height: 56, imageRendering: 'pixelated', display: 'block',
              backgroundImage: `url(${podglad || `/assets/${wartosc}`})`, backgroundSize: 'contain',
              backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
            }} />
          ) : <span style={{ color: G.dim, fontSize: 11 }}>brak</span>}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <input ref={plikRef} type="file" accept=".png,.gif,.jpg,.jpeg,.webp" onChange={wgraj} style={{ ...pole, padding: 7 }} />
          <div style={{ color: G.dim, fontSize: 11.5, marginTop: 4 }}>
            Docelowo {rozmiar.opis}. {info || 'Za małe grafiki powiększamy całkowitą krotnością, za duże zmniejszamy z zachowaniem proporcji.'}
          </div>
          {stan && <div style={{ color: '#9be8ac', fontSize: 12, marginTop: 4 }}>{stan}</div>}
        </div>
      </div>

      <input value={szukaj} onChange={e => setSzukaj(e.target.value)} placeholder="Szukaj wśród wgranych grafik…" style={{ ...pole, marginBottom: 8 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: 6, maxHeight: 190, overflowY: 'auto' }}>
        {widoczne.map(f => {
          const sciezka = f.path || f;
          const wybrana = wartosc === sciezka;
          return (
            <button key={sciezka} onClick={() => { onZmiana(sciezka); setPodglad(null); }} title={sciezka} style={{
              height: 52, padding: 0, cursor: 'pointer', borderRadius: 3, background: '#0b0907',
              border: `2px solid ${wybrana ? G.gold : G.bronze}`,
              backgroundImage: `url(/assets/${sciezka})`, backgroundSize: 'contain',
              backgroundPosition: 'center', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated',
            }} />
          );
        })}
      </div>
      <input value={wartosc || ''} onChange={e => onZmiana(e.target.value)} placeholder="ścieżka grafiki" style={{ ...pole, marginTop: 8, fontSize: 12 }} />
    </div>
  );
}

// ── Kreator przedmiotów ──────────────────────────────────────────────────────
const PUSTY_ITEM = {
  nazwa: '', typ: 'BronJednoreczna', klasa: 'normal', obrazek: '', wym_poziom: 1,
  obr_min: 0, obr_max: 0, obr_mag: 0, ac: 0, acm: 0, zycie: 0, mana: 0,
  sila: 0, zrecznosc: 0, intelekt: 0, ck: 0, unik: 0, blok: 0, absorbcja: 0, przebicie: 0, sa: 0,
  wartosc_kupna: 100, wartosc_sprzedazy: 50, opis: '',
};
const BONUSY = [
  ['obr_min', 'Atak od'], ['obr_max', 'Atak do'], ['obr_mag', 'Atak magiczny'],
  ['ac', 'Obrona'], ['acm', 'Obrona magiczna'], ['absorbcja', 'Absorpcja'],
  ['zycie', 'Życie'], ['mana', 'Mana'], ['sa', 'Celność'],
  ['sila', 'Siła'], ['zrecznosc', 'Zręczność'], ['intelekt', 'Intelekt'],
  ['ck', 'Krytyk %'], ['unik', 'Unik'], ['blok', 'Blok'], ['przebicie', 'Przebicie'],
];

function KreatorPrzedmiotow({ sklepy, flash }) {
  const [item, setItem] = useState(PUSTY_ITEM);
  const [gdzie, setGdzie] = useState('loot');
  const [sklep, setSklep] = useState(sklepy[0]?.shop ?? 1);
  const [lista, setLista] = useState([]);
  const [edycja, setEdycja] = useState(null);

  const zm = (k, v) => setItem(p => ({ ...p, [k]: v }));

  const odswiez = useCallback(() => {
    if (gdzie === 'loot') api.world.itemsLoot().then(r => Array.isArray(r) && setLista(r)).catch(() => {});
    else api.world.shopItems(sklep).then(r => Array.isArray(r) && setLista(r)).catch(() => {});
  }, [gdzie, sklep]);
  useEffect(() => { odswiez(); }, [odswiez]);

  const zapisz = async () => {
    if (!item.nazwa.trim()) return flash('Podaj nazwę przedmiotu', false);
    if (!item.obrazek) return flash('Wybierz albo wgraj ikonę', false);
    const dane = { ...item, sklep };
    const r = edycja
      ? (gdzie === 'loot' ? await api.world.updateItemLoot(edycja, dane) : await api.world.updateShopItem(edycja, dane))
      : (gdzie === 'loot' ? await api.world.createItemLoot(dane) : await api.world.createShopItem(dane));
    if (r?.ok) { flash(edycja ? 'Zapisano zmiany' : `Dodano „${item.nazwa}"`); setItem(PUSTY_ITEM); setEdycja(null); odswiez(); }
    else flash(r?.error || 'Nie udało się zapisać', false);
  };

  const usun = async (id) => {
    if (!window.confirm('Usunąć przedmiot?')) return;
    const r = gdzie === 'loot' ? await api.world.deleteItemLoot(id) : await api.world.deleteShopItem(id);
    if (r?.ok) { flash('Usunięto'); if (edycja === id) { setEdycja(null); setItem(PUSTY_ITEM); } odswiez(); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 14, alignItems: 'start' }}>
      <Karta ikona="🎁" tytul={edycja ? 'Edycja przedmiotu' : 'Nowy przedmiot'}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Pole label="Nazwa" szer={2}><Tekst v={item.nazwa} on={v => zm('nazwa', v)} ph="np. Miecz Świtu" /></Pole>
          <Pole label="Wymagany poziom"><Liczba v={item.wym_poziom} on={v => zm('wym_poziom', v)} min={0} /></Pole>
          <Pole label="Typ"><Wybor v={item.typ} on={v => zm('typ', v)} opcje={Object.entries(TYPE_LABEL)} /></Pole>
          <Pole label="Rzadkość"><Wybor v={item.klasa} on={v => zm('klasa', v)} opcje={Object.entries(RARITY).map(([k, r]) => [k, r.label])} /></Pole>
          <Pole label="Cena kupna"><Liczba v={item.wartosc_kupna} on={v => { zm('wartosc_kupna', v); zm('wartosc_sprzedazy', Math.floor((v || 0) / 2)); }} min={0} /></Pole>
        </div>

        <div style={{ margin: '14px 0 8px', color: G.goldDim, fontFamily: G.serif, fontSize: 13, letterSpacing: 1 }}>BONUSY</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {BONUSY.map(([k, l]) => <Pole key={k} label={l}><Liczba v={item[k]} on={v => zm(k, v)} /></Pole>)}
        </div>

        <div style={{ margin: '14px 0 8px', color: G.goldDim, fontFamily: G.serif, fontSize: 13, letterSpacing: 1 }}>IKONA</div>
        <WyborIkony kategoria="item" wartosc={item.obrazek} onZmiana={v => zm('obrazek', v)} />

        <Pole label="Opis (widoczny w grze)"><textarea value={item.opis} onChange={e => zm('opis', e.target.value)} rows={2} style={{ ...pole, resize: 'vertical', marginTop: 10 }} /></Pole>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14, flexWrap: 'wrap' }}>
          <Wybor v={gdzie} on={v => { setGdzie(v); setEdycja(null); }} opcje={[['loot', 'Zapisz do puli łupów'], ['sklep', 'Zapisz do sklepu']]} />
          {gdzie === 'sklep' && (
            <Wybor v={sklep} on={v => setSklep(Number(v))} opcje={sklepy.map(s => [s.shop, `Sklep #${s.shop} — ${s.nazwa}`])} />
          )}
          <Przycisk onClick={zapisz} tone="green" style={{ marginLeft: 'auto' }}>{edycja ? 'Zapisz zmiany' : 'Dodaj przedmiot'}</Przycisk>
          {edycja && <Przycisk onClick={() => { setEdycja(null); setItem(PUSTY_ITEM); }}>Anuluj</Przycisk>}
        </div>
      </Karta>

      <Karta ikona="📋" tytul={gdzie === 'loot' ? 'Pula łupów' : `Towary sklepu #${sklep}`} prawo={<span style={{ color: G.muted, fontSize: 12 }}>{lista.length}</span>}>
        <div style={{ maxHeight: 560, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {lista.length === 0 && <div style={{ color: G.dim, fontSize: 13 }}>Pusto.</div>}
          {lista.map(it => {
            const r = rarityOf(it);
            return (
              <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 9px', borderRadius: 3, background: 'rgba(0,0,0,0.3)', border: `1px solid ${G.bronze}66` }}>
                <span style={{ width: 28, height: 28, flexShrink: 0, imageRendering: 'pixelated', backgroundImage: `url(/assets/${it.obrazek})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', color: r.color, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.nazwa}</span>
                  <span style={{ display: 'block', color: G.muted, fontSize: 11.5 }}>
                    poz. {it.wym_poziom} · {TYPE_LABEL[it.typ] || it.typ}
                    {it.obr_min > 0 ? ` · atak ${it.obr_min}–${it.obr_max}` : ''}{it.ac > 0 ? ` · obrona ${it.ac}` : ''}
                  </span>
                </span>
                <button onClick={() => { setItem({ ...PUSTY_ITEM, ...it }); setEdycja(it.id); }} title="Edytuj"
                  style={{ background: 'none', border: `1px solid ${G.bronze}`, borderRadius: 3, color: G.goldHi, cursor: 'pointer', padding: '5px 8px', fontSize: 12 }}>✎</button>
                <button onClick={() => usun(it.id)} title="Usuń"
                  style={{ background: 'none', border: '1px solid #a8281c', borderRadius: 3, color: '#ff8b78', cursor: 'pointer', padding: '5px 8px', fontSize: 12 }}>✕</button>
              </div>
            );
          })}
        </div>
      </Karta>
    </div>
  );
}

// ── Kreator potworów ─────────────────────────────────────────────────────────
const PUSTY_MOB = { nazwa: '', obrazek: '', poziom: 1, zycie_max: 40, obr_min: 2, obr_max: 5, ac: 0, exp: 12, respawn_time: 60, x: 32, y: 40 };

function KreatorPotworow({ mapa, flash }) {
  const [mob, setMob] = useState(PUSTY_MOB);
  const [lista, setLista] = useState([]);
  const [edycja, setEdycja] = useState(null);
  const zm = (k, v) => setMob(p => ({ ...p, [k]: v }));

  const odswiez = useCallback(() => {
    if (mapa?.id) api.world.mobs(mapa.id).then(r => Array.isArray(r) && setLista(r)).catch(() => {});
  }, [mapa]);
  useEffect(() => { odswiez(); }, [odswiez]);

  // podpowiedź statystyk pod poziom — łatwiej trzymać balans
  const podpowiedz = () => {
    const l = Number(mob.poziom) || 1;
    setMob(p => ({ ...p, zycie_max: 26 + l * 16, obr_min: 1 + l * 2, obr_max: 3 + l * 3, ac: l * 2, exp: 7 + l * 6, respawn_time: 45 + l * 5 }));
  };

  const zapisz = async () => {
    if (!mob.nazwa.trim()) return flash('Podaj nazwę potwora', false);
    if (!mapa?.id) return flash('Brak mapy', false);
    const dane = { ...mob, mapa: mapa.id, obrazek: mob.obrazek || 'mob/krolik.gif' };
    const r = edycja ? await api.world.updateMob(edycja, dane) : await api.world.createMob(dane);
    if (r?.ok) { flash(edycja ? 'Zapisano potwora' : `Dodano „${mob.nazwa}"`); setMob(PUSTY_MOB); setEdycja(null); odswiez(); }
    else flash(r?.error || 'Nie udało się zapisać', false);
  };
  const usun = async (id) => {
    if (!window.confirm('Usunąć potwora z mapy?')) return;
    const r = await api.world.deleteMob(id);
    if (r?.ok) { flash('Usunięto'); odswiez(); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 14, alignItems: 'start' }}>
      <Karta ikona="👾" tytul={edycja ? 'Edycja potwora' : 'Nowy potwór'}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Pole label="Nazwa" szer={2}><Tekst v={mob.nazwa} on={v => zm('nazwa', v)} ph="np. Leśny Wilk" /></Pole>
          <Pole label="Poziom"><Liczba v={mob.poziom} on={v => zm('poziom', v)} min={1} /></Pole>
          <Pole label="Życie"><Liczba v={mob.zycie_max} on={v => zm('zycie_max', v)} min={1} /></Pole>
          <Pole label="Atak od"><Liczba v={mob.obr_min} on={v => zm('obr_min', v)} min={0} /></Pole>
          <Pole label="Atak do"><Liczba v={mob.obr_max} on={v => zm('obr_max', v)} min={0} /></Pole>
          <Pole label="Obrona"><Liczba v={mob.ac} on={v => zm('ac', v)} min={0} /></Pole>
          <Pole label="Doświadczenie"><Liczba v={mob.exp} on={v => zm('exp', v)} min={0} /></Pole>
          <Pole label="Respawn (s)"><Liczba v={mob.respawn_time} on={v => zm('respawn_time', v)} min={5} /></Pole>
          <Pole label="Pozycja X"><Liczba v={mob.x} on={v => zm('x', v)} min={0} max={mapa?.maks_x ?? 63} /></Pole>
          <Pole label="Pozycja Y"><Liczba v={mob.y} on={v => zm('y', v)} min={0} max={mapa?.maks_y ?? 63} /></Pole>
        </div>
        <div style={{ marginTop: 8 }}><Przycisk onClick={podpowiedz}>⚖ Dobierz statystyki do poziomu</Przycisk></div>

        <div style={{ margin: '14px 0 8px', color: G.goldDim, fontFamily: G.serif, fontSize: 13, letterSpacing: 1 }}>GRAFIKA</div>
        <WyborIkony kategoria="mob" wartosc={mob.obrazek} onZmiana={v => zm('obrazek', v)} />

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <Przycisk onClick={zapisz} tone="green">{edycja ? 'Zapisz zmiany' : 'Dodaj potwora'}</Przycisk>
          {edycja && <Przycisk onClick={() => { setEdycja(null); setMob(PUSTY_MOB); }}>Anuluj</Przycisk>}
        </div>
      </Karta>

      <Karta ikona="📋" tytul="Potwory na mapie" prawo={<span style={{ color: G.muted, fontSize: 12 }}>{lista.length}</span>}>
        <div style={{ maxHeight: 560, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {lista.length === 0 && <div style={{ color: G.dim, fontSize: 13 }}>Brak potworów.</div>}
          {lista.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 9px', borderRadius: 3, background: 'rgba(0,0,0,0.3)', border: `1px solid ${G.bronze}66` }}>
              <span style={{ width: 28, height: 28, flexShrink: 0, imageRendering: 'pixelated', backgroundImage: `url(/assets/${m.obrazek})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', color: G.text, fontSize: 13 }}>{m.nazwa}</span>
                <span style={{ display: 'block', color: G.muted, fontSize: 11.5 }}>poz. {m.poziom} · {m.zycie_max} HP · ({m.x},{m.y})</span>
              </span>
              <button onClick={() => { setMob({ ...PUSTY_MOB, ...m }); setEdycja(m.id); }} style={{ background: 'none', border: `1px solid ${G.bronze}`, borderRadius: 3, color: G.goldHi, cursor: 'pointer', padding: '5px 8px', fontSize: 12 }}>✎</button>
              <button onClick={() => usun(m.id)} style={{ background: 'none', border: '1px solid #a8281c', borderRadius: 3, color: '#ff8b78', cursor: 'pointer', padding: '5px 8px', fontSize: 12 }}>✕</button>
            </div>
          ))}
        </div>
      </Karta>
    </div>
  );
}

// ── Kreator NPC ──────────────────────────────────────────────────────────────
const PUSTY_NPC = { nazwa: '', obrazek: '', x: 32, y: 28, shop: 0 };

function KreatorNpc({ mapa, flash }) {
  const [npc, setNpc] = useState(PUSTY_NPC);
  const [lista, setLista] = useState([]);
  const [edycja, setEdycja] = useState(null);
  const zm = (k, v) => setNpc(p => ({ ...p, [k]: v }));

  const odswiez = useCallback(() => {
    if (mapa?.id) api.world.npcs(mapa.id).then(r => Array.isArray(r) && setLista(r)).catch(() => {});
  }, [mapa]);
  useEffect(() => { odswiez(); }, [odswiez]);

  const zapisz = async () => {
    if (!npc.nazwa.trim()) return flash('Podaj nazwę NPC', false);
    if (!mapa?.id) return flash('Brak mapy', false);
    const dane = { ...npc, mapa: mapa.id, obrazek: npc.obrazek || 'npc/unil.gif' };
    const r = edycja ? await api.world.updateNpc(edycja, dane) : await api.world.createNpc(dane);
    if (r?.ok) { flash(edycja ? 'Zapisano NPC' : `Dodano „${npc.nazwa}"`); setNpc(PUSTY_NPC); setEdycja(null); odswiez(); }
    else flash(r?.error || 'Nie udało się zapisać', false);
  };
  const usun = async (id) => {
    if (!window.confirm('Usunąć NPC?')) return;
    const r = await api.world.deleteNpc(id);
    if (r?.ok) { flash('Usunięto'); odswiez(); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 14, alignItems: 'start' }}>
      <Karta ikona="🧍" tytul={edycja ? 'Edycja NPC' : 'Nowy NPC'}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Pole label="Nazwa" szer={3}><Tekst v={npc.nazwa} on={v => zm('nazwa', v)} ph="np. Kowal Bran" /></Pole>
          <Pole label="Pozycja X"><Liczba v={npc.x} on={v => zm('x', v)} min={0} max={mapa?.maks_x ?? 63} /></Pole>
          <Pole label="Pozycja Y"><Liczba v={npc.y} on={v => zm('y', v)} min={0} max={mapa?.maks_y ?? 63} /></Pole>
          <Pole label="Numer sklepu (0 = brak)"><Liczba v={npc.shop} on={v => zm('shop', v)} min={0} /></Pole>
        </div>

        <div style={{ margin: '14px 0 8px', color: G.goldDim, fontFamily: G.serif, fontSize: 13, letterSpacing: 1 }}>GRAFIKA</div>
        <WyborIkony kategoria="npc" wartosc={npc.obrazek} onZmiana={v => zm('obrazek', v)} />

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <Przycisk onClick={zapisz} tone="green">{edycja ? 'Zapisz zmiany' : 'Dodaj NPC'}</Przycisk>
          {edycja && <Przycisk onClick={() => { setEdycja(null); setNpc(PUSTY_NPC); }}>Anuluj</Przycisk>}
        </div>
        <div style={{ color: G.dim, fontSize: 11.5, marginTop: 8 }}>
          NPC z numerem sklepu otwiera handel — towary dodasz w zakładce „Przedmioty”, wybierając ten sam numer.
        </div>
      </Karta>

      <Karta ikona="📋" tytul="NPC na mapie" prawo={<span style={{ color: G.muted, fontSize: 12 }}>{lista.length}</span>}>
        <div style={{ maxHeight: 560, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {lista.length === 0 && <div style={{ color: G.dim, fontSize: 13 }}>Brak NPC.</div>}
          {lista.map(n => (
            <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 9px', borderRadius: 3, background: 'rgba(0,0,0,0.3)', border: `1px solid ${G.bronze}66` }}>
              <span style={{ width: 24, height: 34, flexShrink: 0, imageRendering: 'pixelated', backgroundImage: `url(/assets/${n.obrazek})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', color: G.text, fontSize: 13 }}>{n.nazwa}</span>
                <span style={{ display: 'block', color: G.muted, fontSize: 11.5 }}>({n.x},{n.y}){n.shop > 0 ? ` · sklep #${n.shop}` : ''}</span>
              </span>
              <button onClick={() => { setNpc({ ...PUSTY_NPC, ...n }); setEdycja(n.id); }} style={{ background: 'none', border: `1px solid ${G.bronze}`, borderRadius: 3, color: G.goldHi, cursor: 'pointer', padding: '5px 8px', fontSize: 12 }}>✎</button>
              <button onClick={() => usun(n.id)} style={{ background: 'none', border: '1px solid #a8281c', borderRadius: 3, color: '#ff8b78', cursor: 'pointer', padding: '5px 8px', fontSize: 12 }}>✕</button>
            </div>
          ))}
        </div>
      </Karta>
    </div>
  );
}

// ── Skórki postaci ───────────────────────────────────────────────────────────
const KLASY = ['Wojownik', 'Paladyn', 'Tancerz Ostrzy', 'Lowca', 'Tropiciel', 'Mag'];

function KreatorSkorek({ flash }) {
  const [obrazek, setObrazek] = useState('');
  const [klasa, setKlasa] = useState(KLASY[0]);
  const [gracz, setGracz] = useState('');
  const [gracze, setGracze] = useState([]);

  useEffect(() => {
    api.adminDash.players().then(r => Array.isArray(r) && setGracze(r)).catch(() => {});
  }, []);

  const przypiszKlasie = async () => {
    if (!obrazek) return flash('Najpierw wybierz skórkę', false);
    const r = await fetch('/api/admin/set-class-skin', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profesja: klasa, obrazek }),
    }).then(x => x.json()).catch(() => null);
    r?.ok ? flash(`Skórka klasy ${klasa} ustawiona (${r.zmienione} postaci)`) : flash(r?.error || 'Nie udało się', false);
  };

  const przypiszGraczowi = async () => {
    if (!obrazek) return flash('Najpierw wybierz skórkę', false);
    if (!gracz) return flash('Wybierz postać', false);
    const r = await api.adminDash.setPlayerSkin(Number(gracz), obrazek);
    r?.ok ? flash('Skórka ustawiona') : flash(r?.error || 'Nie udało się', false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 14, alignItems: 'start' }}>
      <Karta ikona="🎨" tytul="Skórka postaci">
        <WyborIkony kategoria="skin" wartosc={obrazek} onZmiana={setObrazek}
          info="Arkusz ruchu to 4 klatki × 4 kierunki (128×192). Pojedynczą sylwetkę powielimy na cały arkusz — postać będzie stała w miejscu podczas chodzenia." />
      </Karta>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Karta ikona="🛡" tytul="Przypisz do klasy">
          <Pole label="Klasa"><Wybor v={klasa} on={setKlasa} opcje={KLASY.map(k => [k, k])} /></Pole>
          <Przycisk onClick={przypiszKlasie} tone="green" style={{ marginTop: 10 }}>Ustaw wszystkim postaciom tej klasy</Przycisk>
        </Karta>
        <Karta ikona="👤" tytul="Przypisz jednej postaci">
          <Pole label="Postać">
            <Wybor v={gracz} on={setGracz} opcje={[['', '— wybierz —'], ...gracze.map(g => [String(g.id), `${g.nazwa} (poz. ${g.poziom}, ${g.profesja})`])]} />
          </Pole>
          <Przycisk onClick={przypiszGraczowi} tone="green" style={{ marginTop: 10 }}>Ustaw skórkę postaci</Przycisk>
        </Karta>
      </div>
    </div>
  );
}

// ── Całość ───────────────────────────────────────────────────────────────────
const ZAKLADKI = [
  { id: 'przedmioty', ikona: '🎁', label: 'Przedmioty' },
  { id: 'potwory', ikona: '👾', label: 'Potwory' },
  { id: 'npc', ikona: '🧍', label: 'NPC' },
  { id: 'skorki', ikona: '🎨', label: 'Skórki postaci' },
];

export default function Kreator() {
  const [zakladka, setZakladka] = useState('przedmioty');
  const [mapa, setMapa] = useState(null);
  const [sklepy, setSklepy] = useState([]);
  const [komunikat, setKomunikat] = useState(null);

  const flash = (text, ok = true) => { setKomunikat({ text, ok }); setTimeout(() => setKomunikat(null), 3200); };

  useEffect(() => {
    api.world.maps().then(r => Array.isArray(r) && r[0] && setMapa(r[0])).catch(() => {});
  }, []);
  useEffect(() => {
    if (!mapa?.id) return;
    api.world.npcs(mapa.id).then(r => {
      if (!Array.isArray(r)) return;
      const s = r.filter(n => n.shop > 0).map(n => ({ shop: n.shop, nazwa: n.nazwa }));
      setSklepy(s.length ? s : [{ shop: 1, nazwa: 'domyślny' }]);
    }).catch(() => setSklepy([{ shop: 1, nazwa: 'domyślny' }]));
  }, [mapa]);

  return (
    <div style={{ fontFamily: FONT, color: G.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {ZAKLADKI.map(z => {
          const on = zakladka === z.id;
          return (
            <button key={z.id} onClick={() => setZakladka(z.id)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 3, cursor: 'pointer',
              background: on ? 'linear-gradient(180deg,#4a3818,#241a0b)' : 'linear-gradient(180deg,#1b1712,#0d0b08)',
              border: `1px solid ${on ? G.gold : G.bronze}`, color: on ? G.goldHi : G.muted, fontFamily: G.serif, fontSize: 14,
            }}>
              <span style={{ fontSize: 16 }}>{z.ikona}</span>{z.label}
            </button>
          );
        })}
        <span style={{ marginLeft: 'auto', color: G.muted, fontSize: 12.5 }}>
          {mapa ? `Mapa: ${mapa.nazwa} (${mapa.maks_x + 1}×${mapa.maks_y + 1})` : 'Wczytywanie mapy…'}
        </span>
      </div>

      {komunikat && (
        <div style={{
          padding: '10px 14px', borderRadius: 3, marginBottom: 12, fontSize: 13.5,
          border: `1px solid ${komunikat.ok ? '#2f6b3a' : '#a8281c'}`,
          background: komunikat.ok ? 'rgba(95,208,122,0.1)' : 'rgba(168,40,28,0.15)',
          color: komunikat.ok ? '#9be8ac' : '#ff9b8b',
        }}>{komunikat.ok ? '✓' : '✕'} {komunikat.text}</div>
      )}

      {zakladka === 'przedmioty' && <KreatorPrzedmiotow sklepy={sklepy} flash={flash} />}
      {zakladka === 'potwory' && <KreatorPotworow mapa={mapa} flash={flash} />}
      {zakladka === 'npc' && <KreatorNpc mapa={mapa} flash={flash} />}
      {zakladka === 'skorki' && <KreatorSkorek flash={flash} />}
    </div>
  );
}
