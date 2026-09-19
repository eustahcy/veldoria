// Izometryczny edytor mapy — malowanie terenu i stawianie obiektów na żywo.
// Zmiany zapisują się różnicowo (co ~600 ms) i lecą socketem do innych na mapie.
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { api } from '../api';
import { getSocket } from '../hooks/useSocket';
import { C } from '../ui/kit';
import {
  TILE_W, TILE_H, isoToScreen, screenToIso, drawTerrain, drawObject,
  TERRAIN, OBJECTS, OBJECT_GROUPS, OBJECT_BY_ID, TERRAIN_BY_ID, DEFAULT_TERRAIN, tileBlocks,
} from '../ui/iso';

const BRUSHES = [1, 2, 3, 5];
const key = (x, y) => `${x},${y}`;

export default function IsoMapEditor({ mapId }) {
  const socket = getSocket();
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);
  const tilesRef  = useRef({});           // { "x,y": {t,o} } — źródło prawdy dla rysowania
  const pendingRef = useRef(new Map());   // niezapisane zmiany
  const saveTimer = useRef(null);
  const undoRef   = useRef([]);           // stos cofania: [{ key, prev }]
  const dragRef   = useRef(null);

  const [mapa, setMapa]       = useState(null);
  const [tool, setTool]       = useState('teren');     // teren | obiekt | guma | pipeta
  const [terrain, setTerrain] = useState(DEFAULT_TERRAIN);
  const [object, setObject]   = useState(OBJECTS[0].id);
  const [brush, setBrush]     = useState(1);
  const [grid, setGrid]       = useState(true);
  const [syncBlok, setSyncBlok] = useState(true);   // czy malowanie ustawia blokady przejścia
  const [iso, setIso]         = useState(false);
  const [cam, setCam]         = useState({ x: 0, y: 0, z: 1 });
  const [hover, setHover]     = useState(null);
  const [status, setStatus]   = useState('');
  const [count, setCount]     = useState(0);
  const [tick, setTick]       = useState(0);           // wymusza przerysowanie

  const redraw = useCallback(() => setTick(t => t + 1), []);

  // ── Wczytanie mapy ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapId) return;
    let alive = true;
    setStatus('Wczytywanie…');
    api.world.tiles(mapId).then(r => {
      if (!alive || !r || r.error) return setStatus(r?.error || 'Błąd wczytywania');
      tilesRef.current = r.kafle || {};
      setMapa(r);
      setIso(!!r.iso);
      setCount(Object.keys(r.kafle || {}).length);
      setCam({ x: 0, y: 0, z: 1 });
      setStatus('');
      redraw();
    });
    return () => { alive = false; };
  }, [mapId, redraw]);

  // ── Zmiany od innych edytorów ──────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !mapId) return;
    if (!socket.connected) socket.connect();
    socket.emit('join_edit', mapId);
    const on = ({ mapa_id, patch }) => {
      if (Number(mapa_id) !== Number(mapId) || !Array.isArray(patch)) return;
      for (const p of patch) applyPatch(p, tilesRef.current);
      setCount(Object.keys(tilesRef.current).length);
      redraw();
    };
    socket.on('map_tiles', on);
    return () => socket.off('map_tiles', on);
  }, [socket, mapId, redraw]);

  function applyPatch(p, store) {
    const k = key(p.x, p.y);
    const cur = store[k] || {};
    const next = {};
    const t = p.t === null ? undefined : (p.t ?? cur.t);
    const o = p.o === null ? undefined : (p.o ?? cur.o);
    if (t) next.t = t;
    if (o) next.o = o;
    if (next.t || next.o) store[k] = next; else delete store[k];
  }

  // ── Zapis ──────────────────────────────────────────────────────────────────
  const flushSave = useCallback(async (isoFlag) => {
    const patch = [...pendingRef.current.values()];
    pendingRef.current.clear();
    if (!patch.length && isoFlag === undefined) return;
    setStatus('Zapisywanie…');
    const r = await api.world.saveTiles(mapId, { patch, ...(isoFlag === undefined ? {} : { iso: isoFlag }) });
    if (r?.ok) { setCount(r.count); setStatus('Zapisano ✓'); setTimeout(() => setStatus(s => s === 'Zapisano ✓' ? '' : s), 1200); }
    else setStatus(r?.error || 'Błąd zapisu');
  }, [mapId]);

  const queue = useCallback((p) => {
    pendingRef.current.set(key(p.x, p.y), p);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => flushSave(), 600);
  }, [flushSave]);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  // ── Malowanie ──────────────────────────────────────────────────────────────
  const paintAt = useCallback((cx, cy, record = true) => {
    if (!mapa) return;
    const r = brush - 1;
    const touched = [];
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        const x = cx + dx, y = cy + dy;
        if (x < 0 || y < 0 || x > mapa.maks_x || y > mapa.maks_y) continue;
        if (brush > 2 && Math.hypot(dx, dy) > r + 0.2) continue;

        const k = key(x, y);
        const prev = tilesRef.current[k] ? { ...tilesRef.current[k] } : null;
        let p = null;
        if (tool === 'teren')       p = { x, y, t: terrain };
        else if (tool === 'obiekt') p = { x, y, o: object };
        else if (tool === 'guma')   p = { x, y, t: null, o: null };
        if (!p) continue;

        // Blokady przejścia aktualizują się razem z kaflem (można wyłączyć)
        if (syncBlok) {
          const after = { ...(prev || {}), ...(p.t === null ? { t: undefined } : p.t ? { t: p.t } : {}), ...(p.o === null ? { o: undefined } : p.o ? { o: p.o } : {}) };
          p.blok = tileBlocks(after);
        }

        applyPatch(p, tilesRef.current);
        queue(p);
        touched.push({ k, prev });
      }
    }
    if (record && touched.length) undoRef.current.push(touched);
    if (undoRef.current.length > 60) undoRef.current.shift();
    setCount(Object.keys(tilesRef.current).length);
    redraw();
  }, [mapa, brush, tool, terrain, object, queue, redraw, syncBlok]);

  const undo = useCallback(() => {
    const step = undoRef.current.pop();
    if (!step) return;
    for (const { k, prev } of step) {
      const [x, y] = k.split(',').map(Number);
      if (prev) tilesRef.current[k] = prev; else delete tilesRef.current[k];
      pendingRef.current.set(k, { x, y, t: prev?.t ?? null, o: prev?.o ?? null });
    }
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => flushSave(), 300);
    setCount(Object.keys(tilesRef.current).length);
    redraw();
  }, [flushSave, redraw]);

  const fillAll = useCallback(async () => {
    if (!mapa || !window.confirm(`Wypełnić całą mapę terenem „${TERRAIN_BY_ID[terrain].nazwa}"? Obiekty zostają.`)) return;
    const patch = [];
    for (let x = 0; x <= mapa.maks_x; x++) {
      for (let y = 0; y <= mapa.maks_y; y++) {
        const p = { x, y, t: terrain };
        applyPatch(p, tilesRef.current);
        patch.push(p);
      }
    }
    redraw();
    setStatus('Zapisywanie…');
    const r = await api.world.saveTiles(mapId, { patch });
    setStatus(r?.ok ? 'Zapisano ✓' : (r?.error || 'Błąd zapisu'));
    if (r?.ok) setCount(r.count);
  }, [mapa, terrain, mapId, redraw]);

  const clearAll = useCallback(async () => {
    if (!mapa || !window.confirm('Usunąć WSZYSTKIE kafle tej mapy? Tej operacji nie można cofnąć.')) return;
    const patch = [];
    for (const k of Object.keys(tilesRef.current)) {
      const [x, y] = k.split(',').map(Number);
      patch.push({ x, y, t: null, o: null });
    }
    tilesRef.current = {};
    redraw();
    const r = await api.world.saveTiles(mapId, { patch });
    setStatus(r?.ok ? 'Wyczyszczono' : (r?.error || 'Błąd zapisu'));
    setCount(0);
  }, [mapa, mapId, redraw]);

  // ── Rysowanie kanwy ────────────────────────────────────────────────────────
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !mapa) return;
    const ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== w * dpr || cv.height !== h * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0d0f12';
    ctx.fillRect(0, 0, w, h);

    const originX = w / 2 + cam.x;
    const originY = 60 + cam.y;
    ctx.save();
    ctx.translate(originX, originY);
    ctx.scale(cam.z, cam.z);

    const anim = Date.now();
    const store = tilesRef.current;

    // Kolejność malarza: po (x+y) rosnąco
    for (let s = 0; s <= mapa.maks_x + mapa.maks_y; s++) {
      for (let x = Math.max(0, s - mapa.maks_y); x <= Math.min(s, mapa.maks_x); x++) {
        const y = s - x;
        const { sx, sy } = isoToScreen(x, y);
        // odcięcie poza widokiem
        const px = sx * cam.z + originX, py = sy * cam.z + originY;
        if (px < -TILE_W * 2 * cam.z || px > w + TILE_W * 2 * cam.z || py < -160 * cam.z || py > h + 120 * cam.z) continue;

        const tile = store[key(x, y)];
        drawTerrain(ctx, sx, sy, tile?.t || DEFAULT_TERRAIN, { x, y, anim });
        if (!tile?.t) {   // nieomalowane pole — przygaszone
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.beginPath();
          ctx.moveTo(sx, sy - TILE_H / 2); ctx.lineTo(sx + TILE_W / 2, sy);
          ctx.lineTo(sx, sy + TILE_H / 2); ctx.lineTo(sx - TILE_W / 2, sy);
          ctx.closePath(); ctx.fill();
        }
        if (grid) {
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.beginPath();
          ctx.moveTo(sx, sy - TILE_H / 2); ctx.lineTo(sx + TILE_W / 2, sy);
          ctx.lineTo(sx, sy + TILE_H / 2); ctx.lineTo(sx - TILE_W / 2, sy);
          ctx.closePath(); ctx.stroke();
        }
        if (tile?.o) drawObject(ctx, sx, sy, tile.o, { anim });
      }
    }

    // Podświetlenie pod kursorem (obrys pędzla)
    if (hover) {
      const r = brush - 1;
      ctx.strokeStyle = tool === 'guma' ? '#ff6b5a' : '#e8c05a';
      ctx.lineWidth = 2;
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (brush > 2 && Math.hypot(dx, dy) > r + 0.2) continue;
          const x = hover.x + dx, y = hover.y + dy;
          if (x < 0 || y < 0 || x > mapa.maks_x || y > mapa.maks_y) continue;
          const { sx, sy } = isoToScreen(x, y);
          ctx.beginPath();
          ctx.moveTo(sx, sy - TILE_H / 2); ctx.lineTo(sx + TILE_W / 2, sy);
          ctx.lineTo(sx, sy + TILE_H / 2); ctx.lineTo(sx - TILE_W / 2, sy);
          ctx.closePath(); ctx.stroke();
        }
      }
    }
    ctx.restore();
  }, [tick, cam, hover, grid, brush, tool, mapa]);

  // Animacja wody/ognia
  useEffect(() => {
    const id = setInterval(redraw, 420);
    return () => clearInterval(id);
  }, [redraw]);

  // ── Wejście myszy / dotyku ─────────────────────────────────────────────────
  const toTile = useCallback((clientX, clientY) => {
    const cv = canvasRef.current;
    const r = cv.getBoundingClientRect();
    const originX = r.width / 2 + cam.x, originY = 60 + cam.y;
    const sx = (clientX - r.left - originX) / cam.z;
    const sy = (clientY - r.top - originY) / cam.z;
    return screenToIso(sx, sy);
  }, [cam]);

  const onDown = (e) => {
    if (!mapa) return;
    const isPan = e.button === 1 || e.button === 2 || e.shiftKey || e.ctrlKey;
    const t = toTile(e.clientX, e.clientY);
    if (isPan) { dragRef.current = { pan: true, x: e.clientX, y: e.clientY, cam: { ...cam } }; return; }
    if (tool === 'pipeta') {
      const tile = tilesRef.current[key(t.x, t.y)];
      if (tile?.o) { setObject(tile.o); setTool('obiekt'); }
      else if (tile?.t) { setTerrain(tile.t); setTool('teren'); }
      return;
    }
    dragRef.current = { paint: true, last: null };
    paintAt(t.x, t.y);
  };

  const onMove = (e) => {
    if (!mapa) return;
    const d = dragRef.current;
    if (d?.pan) {
      setCam(c => ({ ...c, x: d.cam.x + (e.clientX - d.x), y: d.cam.y + (e.clientY - d.y) }));
      return;
    }
    const t = toTile(e.clientX, e.clientY);
    if (!hover || hover.x !== t.x || hover.y !== t.y) setHover(t);
    if (d?.paint && (!d.last || d.last.x !== t.x || d.last.y !== t.y)) {
      d.last = t;
      paintAt(t.x, t.y);
    }
  };

  const onUp = () => { dragRef.current = null; };

  const onWheel = (e) => {
    e.preventDefault();
    setCam(c => ({ ...c, z: Math.min(2.5, Math.max(0.25, c.z * (e.deltaY > 0 ? 0.9 : 1.1))) }));
  };

  // Dotyk: jeden palec maluje, dwa przesuwają
  const touchRef = useRef(null);
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      touchRef.current = { pan: true, x: e.touches[0].clientX, y: e.touches[0].clientY, cam: { ...cam } };
    } else if (e.touches.length === 1) {
      const t = toTile(e.touches[0].clientX, e.touches[0].clientY);
      touchRef.current = { paint: true, last: t };
      paintAt(t.x, t.y);
    }
  };
  const onTouchMove = (e) => {
    const d = touchRef.current;
    if (!d) return;
    e.preventDefault();
    if (d.pan && e.touches.length >= 1) {
      setCam(c => ({ ...c, x: d.cam.x + (e.touches[0].clientX - d.x), y: d.cam.y + (e.touches[0].clientY - d.y) }));
    } else if (d.paint) {
      const t = toTile(e.touches[0].clientX, e.touches[0].clientY);
      if (d.last.x !== t.x || d.last.y !== t.y) { d.last = t; paintAt(t.x, t.y); }
    }
  };
  const onTouchEnd = () => { touchRef.current = null; };

  // Skróty klawiszowe
  useEffect(() => {
    const on = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
      else if (e.key === '1') setTool('teren');
      else if (e.key === '2') setTool('obiekt');
      else if (e.key === '3') setTool('guma');
      else if (e.key === '4') setTool('pipeta');
      else if (e.key === 'g') setGrid(g => !g);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [undo]);

  const blocked = useMemo(
    () => Object.values(tilesRef.current).filter(tileBlocks).length,
    [tick] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!mapId) return <div style={{ padding: 20, color: C.textMuted }}>Wybierz mapę powyżej.</div>;

  const S = {
    btn: (on) => ({
      padding: '6px 10px', fontSize: 11, cursor: 'pointer', borderRadius: 5, fontFamily: C.font,
      background: on ? 'rgba(232,192,90,0.15)' : C.bgSlot,
      color: on ? C.gold : C.textMuted,
      border: `1px solid ${on ? C.bronze : C.line}`,
    }),
    label: { color: C.goldDim, fontSize: 10, letterSpacing: 1, margin: '10px 0 4px' },
  };

  return (
    <div style={{ display: 'flex', gap: 10, height: '100%', minHeight: 420, fontFamily: C.font }}>
      {/* Paleta */}
      <div style={{ width: 210, flexShrink: 0, overflowY: 'auto', paddingRight: 4 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[['teren', '🖌 Teren'], ['obiekt', '🌲 Obiekt'], ['guma', '🧽 Guma'], ['pipeta', '💧 Pipeta']].map(([id, l]) => (
            <button key={id} onClick={() => setTool(id)} style={S.btn(tool === id)}>{l}</button>
          ))}
        </div>

        <div style={S.label}>PĘDZEL</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {BRUSHES.map(b => <button key={b} onClick={() => setBrush(b)} style={S.btn(brush === b)}>{b}×{b}</button>)}
        </div>

        <div style={S.label}>TEREN</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 4 }}>
          {TERRAIN.map(t => (
            <button key={t.id} onClick={() => { setTerrain(t.id); setTool('teren'); }}
              style={{ ...S.btn(terrain === t.id && tool === 'teren'), display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left' }}>
              <span style={{ width: 14, height: 14, background: t.top, border: '1px solid rgba(0,0,0,0.5)', borderRadius: 3, flexShrink: 0 }} />
              {t.nazwa}
            </button>
          ))}
        </div>

        {OBJECT_GROUPS.map(g => (
          <div key={g}>
            <div style={S.label}>{g.toUpperCase()}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 4 }}>
              {OBJECTS.filter(o => o.grupa === g).map(o => (
                <button key={o.id} onClick={() => { setObject(o.id); setTool('obiekt'); }}
                  style={{ ...S.btn(object === o.id && tool === 'obiekt'), display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left' }}>
                  <span style={{ fontSize: 14 }}>{o.glyph || '🧱'}</span>{o.nazwa}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Kanwa */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={undo} style={S.btn(false)}>↩ Cofnij</button>
          <button onClick={() => setGrid(g => !g)} style={S.btn(grid)}>▦ Siatka</button>
          <button onClick={() => setCam(c => ({ ...c, z: Math.min(2.5, c.z * 1.2) }))} style={S.btn(false)}>＋</button>
          <button onClick={() => setCam(c => ({ ...c, z: Math.max(0.25, c.z / 1.2) }))} style={S.btn(false)}>－</button>
          <button onClick={() => setCam({ x: 0, y: 0, z: 1 })} style={S.btn(false)}>⌖ Wyśrodkuj</button>
          <button onClick={fillAll} style={S.btn(false)}>🪣 Wypełnij mapę</button>
          <button onClick={clearAll} style={{ ...S.btn(false), color: C.bad, borderColor: 'rgba(255,90,74,0.4)' }}>🗑 Wyczyść</button>
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, color: syncBlok ? C.ok : C.textMuted, fontSize: 11, marginLeft: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={syncBlok} onChange={e => setSyncBlok(e.target.checked)} />
            Ustawiaj blokady przejścia
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, color: iso ? C.ok : C.textMuted, fontSize: 11, cursor: 'pointer' }}>
            <input type="checkbox" checked={iso} onChange={e => { setIso(e.target.checked); flushSave(e.target.checked); }} />
            Widok izometryczny w grze
          </label>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: status.startsWith('Błąd') ? C.bad : C.textMuted }}>
            {status || `kafli: ${count} · blokujących: ${blocked}`}
          </span>
        </div>

        <div ref={wrapRef} style={{ flex: 1, minHeight: 320, border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block', cursor: tool === 'pipeta' ? 'crosshair' : 'pointer', touchAction: 'none' }}
            onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={() => { onUp(); setHover(null); }}
            onContextMenu={e => e.preventDefault()}
            onWheel={onWheel}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          />
          <div style={{
            position: 'absolute', left: 8, bottom: 8, padding: '4px 8px', borderRadius: 5,
            background: 'rgba(0,0,0,0.6)', color: C.textMuted, fontSize: 10, pointerEvents: 'none',
          }}>
            {mapa ? `${mapa.nazwa} · ${mapa.maks_x + 1}×${mapa.maks_y + 1}` : ''} {hover ? `· pole ${hover.x},${hover.y}` : ''}
            {' · '}przeciąganie z Shift = przesuwanie, kółko = zoom
          </div>
        </div>
      </div>
    </div>
  );
}
