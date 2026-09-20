// Edytor map dla autorskiego silnika kafli.
// Malujemy teren i obiekty wprost na mapie, a zmiany lecą na serwer zapisem
// różnicowym (ten sam format co dotąd: [{x,y,t,o,blok}]), więc kolizje i podgląd
// na żywo u graczy działają bez dodatkowej roboty.
import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';
import { hudColors as G } from './hud/GameHud';
import {
  TILE, TERENY, OBIEKTY, GRUPY_OBIEKTOW, TEREN_PO_ID, OBIEKT_PO_ID, TEREN_DOMYSLNY,
  rysujKafelTerenu, rysujKafelObiektu, rysujPodgladObiektu, blokujeKafel,
  OBJ_W, OBJ_H, OBJ_OX, OBJ_OY,
} from '../engine/tiles2d';

const FONT = "'Trebuchet MS', Verdana, sans-serif";
const NARZEDZIA = [
  { id: 'pedzel', ikona: '🖌', nazwa: 'Pędzel' },
  { id: 'wypelnij', ikona: '🪣', nazwa: 'Wypełnij' },
  { id: 'gumka', ikona: '🧽', nazwa: 'Gumka' },
  { id: 'pipeta', ikona: '💧', nazwa: 'Pipeta' },
];

// Mały podgląd kafla w palecie
function Probka({ tid, oid, wybrany, onClick, tytul }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);
    // sprite obiektu bywa wyższy niż kafel — rysujemy go w całości, wyśrodkowany
    rysujPodgladObiektu(ctx, oid, tid || TEREN_DOMYSLNY);
  }, [tid, oid]);
  return (
    <button onClick={onClick} title={tytul} style={{
      width: 44, height: 44, padding: 0, cursor: 'pointer', borderRadius: 3, overflow: 'hidden',
      border: `2px solid ${wybrany ? G.gold : G.bronze}`,
      boxShadow: wybrany ? `0 0 12px rgba(231,193,88,0.4)` : 'none', background: '#0b0907',
    }}>
      <canvas ref={ref} width={OBJ_W} height={OBJ_H}
        style={{ width: 40, height: Math.round(40 * OBJ_H / OBJ_W), marginTop: -Math.round((40 * OBJ_H / OBJ_W - 40) / 2), display: 'block', imageRendering: 'pixelated' }} />
    </button>
  );
}

export default function MapEditor2D() {
  const [mapy, setMapy] = useState([]);
  const [mapaId, setMapaId] = useState(null);
  const [mapa, setMapa] = useState(null);
  const [kafle, setKafle] = useState({});
  const [narzedzie, setNarzedzie] = useState('pedzel');
  const [zakladka, setZakladka] = useState('teren');
  const [terenSel, setTerenSel] = useState('trawa');
  const [obiektSel, setObiektSel] = useState('drzewo');
  const [rozmiar, setRozmiar] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [kamera, setKamera] = useState({ x: 0, y: 0 });
  const [pokazSiatke, setPokazSiatke] = useState(true);
  const [pokazKolizje, setPokazKolizje] = useState(false);
  const [zapis, setZapis] = useState('');
  const [wczytywanie, setWczytywanie] = useState(false);

  const plotnoRef = useRef(null);
  const boxRef = useRef(null);
  const zmianyRef = useRef(new Map());     // x,y -> {x,y,t,o,blok}
  const historiaRef = useRef([]);          // cofanie: [{klucz: poprzedniKafel}]
  const malujeRef = useRef(false);
  const przesuwaRef = useRef(null);
  const stanRef = useRef({ kafle, kamera, zoom, mapa });
  stanRef.current = { kafle, kamera, zoom, mapa };

  // ── Dane ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    api.world.maps().then(r => {
      if (!Array.isArray(r)) return;
      setMapy(r);
      setMapaId(prev => prev ?? r[0]?.id ?? null);
    }).catch(() => {});
  }, []);

  const wczytaj = useCallback((id) => {
    if (!id) return;
    setWczytywanie(true);
    api.world.tiles(id).then(r => {
      if (r && !r.error) { setMapa(r); setKafle(r.kafle || {}); zmianyRef.current.clear(); historiaRef.current = []; }
      setWczytywanie(false);
    }).catch(() => setWczytywanie(false));
  }, []);
  useEffect(() => { wczytaj(mapaId); }, [mapaId, wczytaj]);

  // ── Rysowanie ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let id;
    const rysuj = () => {
      const c = plotnoRef.current, box = boxRef.current;
      const { kafle: kf, kamera: kam, zoom: z, mapa: m } = stanRef.current;
      if (c && box && m) {
        const w = box.clientWidth, h = box.clientHeight;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
          c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
          c.style.width = `${w}px`; c.style.height = `${h}px`;
        }
        const ctx = c.getContext('2d');
        ctx.setTransform(dpr * z, 0, 0, dpr * z, 0, 0);
        ctx.imageSmoothingEnabled = false;
        const widokW = w / z, widokH = h / z;
        ctx.fillStyle = '#0b0907';
        ctx.fillRect(0, 0, widokW, widokH);

        const x0 = Math.max(0, Math.floor(kam.x / TILE) - 1);
        const y0 = Math.max(0, Math.floor(kam.y / TILE) - 1);
        const x1 = Math.min(m.maks_x, x0 + Math.ceil(widokW / TILE) + 2);
        const y1 = Math.min(m.maks_y, y0 + Math.ceil(widokH / TILE) + 2);
        const anim = performance.now();
        for (let y = y0; y <= y1; y++)
          for (let x = x0; x <= x1; x++)
            rysujKafelTerenu(ctx, x * TILE - kam.x, y * TILE - kam.y, kf, x, y, anim);
        for (let y = y0; y <= y1; y++)
          for (let x = x0; x <= x1; x++)
            rysujKafelObiektu(ctx, x * TILE - kam.x, y * TILE - kam.y, kf, x, y, anim);

        if (pokazKolizje) {
          ctx.fillStyle = 'rgba(220,60,40,0.35)';
          for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
            if (blokujeKafel(kf[`${x},${y}`])) ctx.fillRect(x * TILE - kam.x, y * TILE - kam.y, TILE, TILE);
          }
        }
        if (pokazSiatke && z >= 0.75) {
          ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1 / z;
          ctx.beginPath();
          for (let x = x0; x <= x1 + 1; x++) { ctx.moveTo(x * TILE - kam.x, y0 * TILE - kam.y); ctx.lineTo(x * TILE - kam.x, (y1 + 1) * TILE - kam.y); }
          for (let y = y0; y <= y1 + 1; y++) { ctx.moveTo(x0 * TILE - kam.x, y * TILE - kam.y); ctx.lineTo((x1 + 1) * TILE - kam.x, y * TILE - kam.y); }
          ctx.stroke();
        }
        // obrys mapy
        ctx.strokeStyle = G.gold; ctx.lineWidth = 2 / z;
        ctx.strokeRect(-kam.x, -kam.y, (m.maks_x + 1) * TILE, (m.maks_y + 1) * TILE);
      }
      id = requestAnimationFrame(rysuj);
    };
    id = requestAnimationFrame(rysuj);
    return () => cancelAnimationFrame(id);
  }, [pokazSiatke, pokazKolizje]);

  // ── Malowanie ──────────────────────────────────────────────────────────────
  const kafelZEkranu = (e) => {
    const box = boxRef.current.getBoundingClientRect();
    const { kamera: kam, zoom: z } = stanRef.current;
    return {
      x: Math.floor(((e.clientX - box.left) / z + kam.x) / TILE),
      y: Math.floor(((e.clientY - box.top) / z + kam.y) / TILE),
    };
  };

  const zapiszZmiane = (x, y, nowy, poprzedni, cofka) => {
    cofka[`${x},${y}`] = poprzedni ? { ...poprzedni } : null;
    zmianyRef.current.set(`${x},${y}`, {
      x, y,
      t: nowy?.t ?? null,
      o: nowy?.o ?? null,
      blok: blokujeKafel(nowy),
    });
  };

  const maluj = useCallback((x, y, cofka) => {
    const m = stanRef.current.mapa;
    if (!m || x < 0 || y < 0 || x > m.maks_x || y > m.maks_y) return;
    setKafle(prev => {
      const nast = { ...prev };
      const r = Math.floor(rozmiar / 2);
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        const px = x + dx, py = y + dy;
        if (px < 0 || py < 0 || px > m.maks_x || py > m.maks_y) continue;
        const k = `${px},${py}`;
        const stary = nast[k];
        let nowy;
        if (narzedzie === 'gumka') nowy = { t: stary?.t || TEREN_DOMYSLNY };
        else if (zakladka === 'teren') nowy = { ...(stary || {}), t: terenSel };
        else nowy = { t: stary?.t || TEREN_DOMYSLNY, o: obiektSel };
        if (stary && stary.t === nowy.t && stary.o === nowy.o) continue;
        nast[k] = nowy;
        zapiszZmiane(px, py, nowy, stary, cofka);
      }
      return nast;
    });
  }, [narzedzie, zakladka, terenSel, obiektSel, rozmiar]);

  const wypelnij = useCallback((x, y) => {
    const { kafle: kf, mapa: m } = stanRef.current;
    if (!m) return;
    const start = kf[`${x},${y}`] || {};
    const celT = start.t || TEREN_DOMYSLNY, celO = start.o || null;
    const nowyT = zakladka === 'teren' ? terenSel : celT;
    const nowyO = zakladka === 'teren' ? celO : obiektSel;
    if (celT === nowyT && celO === nowyO) return;
    const cofka = {};
    const nast = { ...kf };
    const stos = [[x, y]];
    const widziane = new Set([`${x},${y}`]);
    let ile = 0;
    while (stos.length && ile < 20000) {
      const [cx, cy] = stos.pop();
      const k = `${cx},${cy}`;
      const kafel = nast[k] || {};
      if ((kafel.t || TEREN_DOMYSLNY) !== celT || (kafel.o || null) !== celO) continue;
      const nowy = { t: nowyT, ...(nowyO ? { o: nowyO } : {}) };
      zapiszZmiane(cx, cy, nowy, nast[k], cofka);
      nast[k] = nowy;
      ile++;
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nx = cx + dx, ny = cy + dy, nk = `${nx},${ny}`;
        if (widziane.has(nk) || nx < 0 || ny < 0 || nx > m.maks_x || ny > m.maks_y) continue;
        widziane.add(nk); stos.push([nx, ny]);
      }
    }
    historiaRef.current.push(cofka);
    setKafle(nast);
    setZapis(`Wypełniono ${ile} kafli — pamiętaj o zapisie`);
  }, [zakladka, terenSel, obiektSel]);

  const onDown = (e) => {
    if (!mapa) return;
    if (e.button === 1 || e.button === 2 || e.shiftKey) {       // przesuwanie widoku
      przesuwaRef.current = { mx: e.clientX, my: e.clientY, ...stanRef.current.kamera };
      return;
    }
    const { x, y } = kafelZEkranu(e);
    if (narzedzie === 'pipeta') {
      const k = stanRef.current.kafle[`${x},${y}`];
      if (k?.o && zakladka === 'obiekty') setObiektSel(k.o);
      else if (k?.t) { setTerenSel(k.t); setZakladka('teren'); }
      return;
    }
    if (narzedzie === 'wypelnij') { wypelnij(x, y); return; }
    malujeRef.current = { cofka: {} };
    maluj(x, y, malujeRef.current.cofka);
  };

  const onMove = (e) => {
    if (przesuwaRef.current) {
      const p = przesuwaRef.current;
      setKamera({ x: p.x - (e.clientX - p.mx) / stanRef.current.zoom, y: p.y - (e.clientY - p.my) / stanRef.current.zoom });
      return;
    }
    if (!malujeRef.current) return;
    const { x, y } = kafelZEkranu(e);
    maluj(x, y, malujeRef.current.cofka);
  };

  const onUp = () => {
    przesuwaRef.current = null;
    if (malujeRef.current) {
      historiaRef.current.push(malujeRef.current.cofka);
      malujeRef.current = false;
      if (zmianyRef.current.size) setZapis(`${zmianyRef.current.size} zmian — pamiętaj o zapisie`);
    }
  };

  const cofnij = () => {
    const cofka = historiaRef.current.pop();
    if (!cofka) return;
    setKafle(prev => {
      const nast = { ...prev };
      for (const [k, stary] of Object.entries(cofka)) {
        const [x, y] = k.split(',').map(Number);
        if (stary) nast[k] = stary; else delete nast[k];
        zmianyRef.current.set(k, { x, y, t: stary?.t ?? null, o: stary?.o ?? null, blok: blokujeKafel(stary) });
      }
      return nast;
    });
    setZapis('Cofnięto — pamiętaj o zapisie');
  };

  const zapiszNaSerwer = async () => {
    if (!mapaId || !zmianyRef.current.size) { setZapis('Brak zmian do zapisania'); return; }
    const patch = [...zmianyRef.current.values()];
    setZapis(`Zapisuję ${patch.length} kafli…`);
    const r = await api.world.saveTiles(mapaId, { patch }).catch(() => null);
    if (r?.ok) { zmianyRef.current.clear(); setZapis(`Zapisano. Kafli na mapie: ${r.count}`); }
    else setZapis(r?.error || 'Zapis nieudany');
  };

  // skróty klawiszowe
  useEffect(() => {
    const fn = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === 'b') setNarzedzie('pedzel');
      if (e.key === 'g') setNarzedzie('wypelnij');
      if (e.key === 'e') setNarzedzie('gumka');
      if (e.key === 'i') setNarzedzie('pipeta');
      if (e.key === 'k') setPokazKolizje(v => !v);
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); cofnij(); }
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); zapiszNaSerwer(); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  });

  const przycisk = (aktywny) => ({
    padding: '8px 12px', borderRadius: 3, cursor: 'pointer', whiteSpace: 'nowrap',
    background: aktywny ? 'linear-gradient(180deg,#4a3818,#241a0b)' : 'linear-gradient(180deg,#1b1712,#0d0b08)',
    border: `1px solid ${aktywny ? G.gold : G.bronze}`, color: aktywny ? G.goldHi : G.muted,
    fontFamily: G.serif, fontSize: 13,
  });

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', fontFamily: FONT, color: G.text }}>
      {/* Pasek narzędzi */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, flexWrap: 'wrap', borderBottom: `1px solid ${G.bronze}88`, flexShrink: 0 }}>
        <select value={mapaId ?? ''} onChange={e => setMapaId(Number(e.target.value))} style={{
          padding: '8px 10px', borderRadius: 3, background: '#0b0907', color: G.text, border: `1px solid ${G.bronze}`, fontSize: 13,
        }}>
          {mapy.map(m => <option key={m.id} value={m.id}>#{m.id} {m.nazwa}</option>)}
        </select>
        {NARZEDZIA.map(n => (
          <button key={n.id} onClick={() => setNarzedzie(n.id)} style={przycisk(narzedzie === n.id)} title={n.nazwa}>
            {n.ikona} {n.nazwa}
          </button>
        ))}
        <span style={{ color: G.muted, fontSize: 12.5, marginLeft: 6 }}>Pędzel:</span>
        {[1, 3, 5, 9].map(r => (
          <button key={r} onClick={() => setRozmiar(r)} style={{ ...przycisk(rozmiar === r), padding: '8px 10px' }}>{r}×{r}</button>
        ))}
        <button onClick={cofnij} style={przycisk(false)}>↶ Cofnij</button>
        <button onClick={() => setPokazSiatke(v => !v)} style={przycisk(pokazSiatke)}>Siatka</button>
        <button onClick={() => setPokazKolizje(v => !v)} style={przycisk(pokazKolizje)}>Kolizje</button>
        <span style={{ color: G.muted, fontSize: 12.5 }}>Zoom:</span>
        <button onClick={() => setZoom(z => Math.max(0.4, z / 1.25))} style={przycisk(false)}>−</button>
        <span style={{ color: G.text, fontSize: 12.5, width: 44, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(3, z * 1.25))} style={przycisk(false)}>+</button>
        <button onClick={zapiszNaSerwer} style={{ ...przycisk(true), marginLeft: 'auto', padding: '9px 18px' }}>💾 Zapisz mapę</button>
        {zapis && <span style={{ color: G.muted, fontSize: 12.5 }}>{zapis}</span>}
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {/* Paleta */}
        <div style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${G.bronze}88`, overflowY: 'auto', padding: 10, background: '#0e0c09' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <button onClick={() => setZakladka('teren')} style={{ ...przycisk(zakladka === 'teren'), flex: 1 }}>Teren</button>
            <button onClick={() => setZakladka('obiekty')} style={{ ...przycisk(zakladka === 'obiekty'), flex: 1 }}>Obiekty</button>
          </div>

          {zakladka === 'teren' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {TERENY.map(t => (
                <Probka key={t.id} tid={t.id} wybrany={terenSel === t.id} tytul={t.nazwa}
                  onClick={() => { setTerenSel(t.id); setNarzedzie(n => (n === 'pipeta' ? 'pedzel' : n)); }} />
              ))}
            </div>
          )}

          {zakladka === 'obiekty' && GRUPY_OBIEKTOW.map(gr => (
            <div key={gr} style={{ marginBottom: 12 }}>
              <div style={{ color: G.goldDim, fontFamily: G.serif, fontSize: 12, letterSpacing: 1.5, margin: '6px 0' }}>{gr.toUpperCase()}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {OBIEKTY.filter(o => o.grupa === gr).map(o => (
                  <Probka key={o.id} tid={terenSel} oid={o.id} wybrany={obiektSel === o.id} tytul={`${o.nazwa}${o.blok ? ' (blokuje)' : ''}`}
                    onClick={() => { setObiektSel(o.id); setNarzedzie(n => (n === 'pipeta' ? 'pedzel' : n)); }} />
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${G.bronze}55`, color: G.muted, fontSize: 11.5, lineHeight: 1.7 }}>
            Wybrane: <b style={{ color: G.goldHi }}>{zakladka === 'teren' ? TEREN_PO_ID[terenSel]?.nazwa : OBIEKT_PO_ID[obiektSel]?.nazwa}</b><br />
            Skróty: B pędzel, G wypełnianie, E gumka, I pipeta, K kolizje,<br />
            Ctrl+Z cofnij, Ctrl+S zapis. Przeciąganie prawym (lub Shift) przesuwa mapę.
          </div>
        </div>

        {/* Płótno */}
        <div ref={boxRef} style={{ flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden', background: '#0b0907', cursor: narzedzie === 'pipeta' ? 'copy' : 'crosshair' }}
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
          onContextMenu={e => e.preventDefault()}
          onWheel={e => setZoom(z => Math.max(0.4, Math.min(3, z * (e.deltaY < 0 ? 1.1 : 0.9))))}>
          <canvas ref={plotnoRef} style={{ position: 'absolute', left: 0, top: 0, imageRendering: 'pixelated' }} />
          {wczytywanie && (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: G.muted, fontFamily: G.serif }}>Wczytywanie mapy…</div>
          )}
          {mapa && (
            <div style={{
              position: 'absolute', left: 10, bottom: 10, padding: '6px 12px', borderRadius: 3,
              background: 'rgba(10,8,6,0.85)', border: `1px solid ${G.bronze}`, color: G.muted, fontSize: 12,
            }}>
              {mapa.nazwa} · {mapa.maks_x + 1}×{mapa.maks_y + 1} kafli · narysowanych: {Object.keys(kafle).length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
