import { useEffect, useRef, useState, useCallback } from 'react';
import { IconMap } from '../Icons';

const CELL = 3;   // px per tile
const TILE = 28;  // game tile size

// ── draw helpers ──────────────────────────────────────────────────────────────
function drawMap(canvas, state, pulse) {
  if (!canvas || !state?.mapa) return;
  const { postac, mapa, mobs, npcs, portals, blockers } = state;
  const W = mapa.maks_x + 1, H = mapa.maks_y + 1;

  if (canvas.width !== W * CELL || canvas.height !== H * CELL) {
    canvas.width  = W * CELL;
    canvas.height = H * CELL;
  }
  const ctx = canvas.getContext('2d');

  // Base fill
  ctx.fillStyle = '#060D1A';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Map bg image
  if (mapa.obrazek) {
    const img = new Image();
    img.src = `/assets/${mapa.obrazek}`;
    const doOverlay = () => overlay(ctx, W, H, postac, mobs, npcs, portals, blockers, pulse);
    img.onload  = () => { ctx.drawImage(img, 0, 0, W * CELL, H * CELL); doOverlay(); };
    img.onerror = doOverlay;
    if (img.complete && img.naturalWidth) { ctx.drawImage(img, 0, 0, W * CELL, H * CELL); doOverlay(); }
    else if (!img.complete) return; // wait for onload
  } else {
    overlay(ctx, W, H, postac, mobs, npcs, portals, blockers, pulse);
  }
}

function overlay(ctx, W, H, postac, mobs, npcs, portals, blockers, pulse) {
  // Dark tint
  ctx.fillStyle = 'rgba(3,6,14,0.5)';
  ctx.fillRect(0, 0, W * CELL, H * CELL);

  // Blockers (very subtle)
  ctx.fillStyle = 'rgba(239,68,68,0.22)';
  (blockers || []).forEach(b => ctx.fillRect(b.x * CELL, b.y * CELL, CELL, CELL));

  // Portals
  ctx.fillStyle = 'rgba(167,139,250,0.92)';
  (portals || []).forEach(p => ctx.fillRect(p.x * CELL - 0.5, p.y * CELL - 0.5, CELL + 1, CELL + 1));

  // NPCs
  ctx.fillStyle = '#4ADE80';
  (npcs || []).forEach(n => ctx.fillRect(n.x * CELL, n.y * CELL, CELL, CELL));

  // Mobs
  (mobs || []).forEach(m => {
    ctx.fillStyle = m.zycie > 0 ? 'rgba(251,146,60,0.88)' : 'rgba(80,40,0,0.25)';
    ctx.fillRect(m.x * CELL, m.y * CELL, CELL, CELL);
  });

  // Viewport rect
  const vw = Math.ceil(window.innerWidth  / TILE / 2);
  const vh = Math.ceil(window.innerHeight / TILE / 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(
    Math.max(0, postac.x - vw) * CELL, Math.max(0, postac.y - vh) * CELL,
    Math.min(W - Math.max(0, postac.x - vw), vw * 2) * CELL,
    Math.min(H - Math.max(0, postac.y - vh), vh * 2) * CELL,
  );

  // Hero glow
  const hx = postac.x * CELL + CELL / 2;
  const hy = postac.y * CELL + CELL / 2;
  const alpha = 0.2 + 0.35 * ((Math.sin(pulse * 0.07) + 1) / 2);
  const grad  = ctx.createRadialGradient(hx, hy, 0, hx, hy, CELL * 4);
  grad.addColorStop(0, `rgba(96,165,250,${alpha})`);
  grad.addColorStop(1, 'rgba(96,165,250,0)');
  ctx.beginPath(); ctx.arc(hx, hy, CELL * 4, 0, Math.PI * 2);
  ctx.fillStyle = grad; ctx.fill();

  // Hero dot
  ctx.beginPath(); ctx.arc(hx, hy, CELL + 1, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.strokeStyle = '#60A5FA'; ctx.lineWidth = 1.5; ctx.stroke();
}

// ── Component ─────────────────────────────────────────────────────────────────
const EXPANDED_MAX = 260;

export default function Minimap({ state, size = 72, right = 8 }) {
  const canvasRef  = useRef(null);
  const wrapRef    = useRef(null);
  const dragRef    = useRef(null);
  const pulseRef   = useRef(0);
  const rafRef     = useRef(null);
  const imgCacheRef = useRef({});   // cache last-drawn map src

  const [expanded,  setExpanded]  = useState(false);
  const [pos,       setPos]       = useState(null);
  const [dragging,  setDragging]  = useState(false);

  // ── Animation loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loop = () => {
      pulseRef.current++;
      drawMap(canvasRef.current, state, pulseRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [state]);

  // ── Drag ────────────────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    const wrap = wrapRef.current; if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    dragRef.current = { sx: e.clientX, sy: e.clientY, ol: rect.left, ot: rect.top };
    setDragging(false);
    wrap.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.sx;
    const dy = e.clientY - dragRef.current.sy;
    if (!dragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) setDragging(true);
    const wrap = wrapRef.current; if (!wrap) return;
    const pw = wrap.parentElement?.offsetWidth  || window.innerWidth;
    const ph = wrap.parentElement?.offsetHeight || window.innerHeight;
    setPos({
      left: Math.max(0, Math.min(pw - wrap.offsetWidth,  dragRef.current.ol + dx)),
      top:  Math.max(0, Math.min(ph - wrap.offsetHeight, dragRef.current.ot + dy)),
    });
  }, [dragging]);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    setTimeout(() => setDragging(false), 0);
  }, []);

  const handleTap = useCallback((e) => {
    if (dragging) return;
    e.stopPropagation();
    setExpanded(v => !v);
  }, [dragging]);

  if (!state?.mapa) return null;
  const { mapa, postac } = state;
  const W = (mapa.maks_x + 1) * CELL;
  const H = (mapa.maks_y + 1) * CELL;
  const scale = Math.min(1, EXPANDED_MAX / Math.max(W, H));
  const cw = Math.round(W * scale);
  const ch = Math.round(H * scale);

  // Compact circle canvas scale
  const CIRCLE = size; // średnica (desktop podaje większą)
  const cs = Math.min(1, CIRCLE / Math.max(W, H));
  const ccw = Math.round(W * cs);
  const cch = Math.round(H * cs);

  const posStyle = pos
    ? { position: 'absolute', left: pos.left, top: pos.top }
    : { position: 'absolute', top: 8, right };   // domyślnie w prawym górnym rogu (można przeciągnąć)

  const GOLD   = 'rgba(200,150,32,0.75)';
  const GOLDDIM = 'rgba(200,150,32,0.3)';
  const BG     = 'rgba(3,6,14,0.92)';
  const BLUE   = 'rgba(96,165,250,0.6)';

  return (
    <div
      ref={wrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ ...posStyle, zIndex: 54, userSelect: 'none', touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }}
    >
      {!expanded ? (
        /* ── COMPACT CIRCLE ── */
        <div onClick={handleTap} style={{ position: 'relative', width: CIRCLE, height: CIRCLE, cursor: 'pointer' }}>
          {/* Gold ring */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `2px solid ${GOLD}`,
            boxShadow: `0 0 0 1px rgba(0,0,0,0.6), 0 0 14px rgba(200,150,32,0.18), 0 4px 18px rgba(0,0,0,0.85)`,
            zIndex: 2, pointerEvents: 'none',
          }} />
          {/* Inner dark ring */}
          <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.5)', zIndex: 2, pointerEvents: 'none' }} />
          {/* Canvas clipped to circle */}
          <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', overflow: 'hidden', background: '#060D1A' }}>
            <canvas
              ref={canvasRef}
              style={{ display: 'block', width: CIRCLE - 4, height: CIRCLE - 4, imageRendering: 'pixelated' }}
            />
          </div>
          {/* Kompas: litery na obręczy */}
          {[
            ['N', { top: 2, left: '50%', transform: 'translateX(-50%)' }],
            ['S', { bottom: 2, left: '50%', transform: 'translateX(-50%)' }],
            ['W', { left: 4, top: '50%', transform: 'translateY(-50%)' }],
            ['E', { right: 4, top: '50%', transform: 'translateY(-50%)' }],
          ].map(([l, p]) => (
            <div key={l} style={{
              position: 'absolute', ...p,
              color: '#f7e3a4', fontSize: size > 100 ? 11 : 7, fontWeight: 'bold', zIndex: 3, pointerEvents: 'none',
              fontFamily: "'Cinzel','Palatino Linotype',serif",
              textShadow: '0 1px 3px #000, 0 0 6px rgba(0,0,0,0.9)',
            }}>{l}</div>
          ))}
          {/* Expand hint */}
          <div style={{
            position: 'absolute', bottom: 3, right: 5,
            color: GOLDDIM, fontSize: 7, zIndex: 3, pointerEvents: 'none',
          }}>⊞</div>
        </div>
      ) : (
        /* ── EXPANDED PANEL ── */
        <div style={{
          background: BG, border: `1px solid ${GOLD}`,
          borderRadius: 10, overflow: 'hidden',
          boxShadow: `0 0 0 1px rgba(0,0,0,0.6), 0 0 20px rgba(200,150,32,0.12), 0 8px 36px rgba(0,0,0,0.9)`,
          fontFamily: 'Verdana,sans-serif',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '4px 9px',
            background: 'rgba(4,8,18,0.85)',
            borderBottom: `1px solid ${GOLDDIM}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ display: 'flex' }}><IconMap size={11} /></span>
              <span style={{ fontSize: 9, color: GOLD, letterSpacing: '0.5px', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {mapa.nazwa}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <span style={{ color: BLUE, fontSize: 8 }}>{postac.x},{postac.y}</span>
              <button onClick={e => { e.stopPropagation(); setExpanded(false); }}
                style={{ background: 'none', border: 'none', color: GOLDDIM, cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: '1px 4px' }}>
                ✕
              </button>
            </div>
          </div>

          {/* Canvas area with compass overlay */}
          <div onClick={handleTap} style={{ position: 'relative', cursor: 'pointer' }}>
            <canvas
              ref={!expanded ? canvasRef : canvasRef}
              style={{ display: 'block', width: cw, height: ch, imageRendering: 'pixelated' }}
            />
            {/* Compass rose */}
            <div style={{ position: 'absolute', bottom: 6, right: 7, pointerEvents: 'none', textAlign: 'center', lineHeight: 1.1 }}>
              <div style={{ color: GOLD, fontSize: 8, fontWeight: 'bold' }}>N</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 7 }}>
                <span style={{ color: GOLDDIM, fontSize: 7 }}>W</span>
                <span style={{ color: GOLDDIM, fontSize: 7 }}>E</span>
              </div>
              <div style={{ color: GOLDDIM, fontSize: 7 }}>S</div>
            </div>
            {/* Click to minimize hint */}
            <div style={{ position: 'absolute', top: 4, right: 6, color: GOLDDIM, fontSize: 8, pointerEvents: 'none' }}>⊟</div>
          </div>

          {/* Legend footer */}
          <div style={{
            display: 'flex', gap: 8, padding: '3px 9px', flexWrap: 'wrap',
            background: 'rgba(4,8,18,0.8)', borderTop: `1px solid ${GOLDDIM}`,
            alignItems: 'center',
          }}>
            {[
              ['#FFFFFF',              '●', 'Ty'],
              ['rgba(251,146,60,0.9)', '■', 'Mob'],
              ['#4ADE80',              '■', 'NPC'],
              ['rgba(167,139,250,0.9)','◆', 'Portal'],
            ].map(([c, s, l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ color: c, fontSize: 8 }}>{s}</span>
                <span style={{ color: GOLDDIM, fontSize: 7 }}>{l}</span>
              </span>
            ))}
            <span style={{ marginLeft: 'auto', color: BLUE, fontSize: 8 }}>
              {mapa.maks_x + 1}×{mapa.maks_y + 1}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
