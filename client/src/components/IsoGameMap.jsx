// Izometryczny widok świata — używany dla map z włączonym `iso`.
// Teren i obiekty rysuje kanwa (kolejność malarza), postacie/moby/NPC to warstwa
// DOM nad nią, dzięki czemu działają kliknięcia, nicki i dymki czatu.
import { useEffect, useRef, useState, memo } from 'react';
import { T } from '../theme';
import WorldOverlay from './WorldOverlay';
import { TILE_W, TILE_H, isoToScreen, screenToIso, drawTerrain, drawObject, DEFAULT_TERRAIN } from '../ui/iso';

const HERO_W = 32, HERO_H = 48;
const RANKA       = { GameAdmin: '#f44', GameMaster: '#f90', Moderator: '#4af' };
const RANKA_LABEL = { GameAdmin: '★ GA', GameMaster: '✦ GM', Moderator: '◈ Mod' };

function Sprite({ src, w, h, kier = 0, step = 0 }) {
  return (
    <div style={{
      width: w, height: h,
      backgroundImage: `url(${src})`,
      backgroundPosition: `${-step * w}px ${-kier * h}px`,
      backgroundRepeat: 'no-repeat', imageRendering: 'pixelated',
    }} />
  );
}

function Tag({ children, color = '#CDD4AA', size = 10 }) {
  return (
    <div style={{
      color, fontSize: size, fontWeight: 'bold', whiteSpace: 'nowrap',
      textShadow: '1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000',
    }}>{children}</div>
  );
}

function Bubble({ text }) {
  return (
    <div style={{
      background: 'rgba(8,14,5,0.95)', color: '#E8D070',
      border: '1px solid rgba(200,150,32,0.6)', borderRadius: 8,
      padding: '4px 8px', fontSize: 11, maxWidth: 180, whiteSpace: 'pre-wrap',
      boxShadow: '0 3px 16px rgba(0,0,0,0.85)', marginBottom: 2,
    }}>{text}</div>
  );
}

// Jedna postać/mob/NPC na mapie
const Entity = memo(function Entity({ e, kind, sx, sy, onClick, bubble, children }) {
  return (
    <div
      data-entity="1"
      onClick={(ev) => { ev.stopPropagation(); onClick?.(e); }}
      style={{
        position: 'absolute', left: 0, top: 0,
        transform: `translate(${Math.round(sx - HERO_W / 2)}px, ${Math.round(sy - HERO_H + TILE_H / 2)}px)`,
        width: HERO_W, height: HERO_H,
        zIndex: Math.max(1, Math.round(sy)),   // głębokość w obrębie warstwy postaci
        cursor: onClick ? 'pointer' : 'default',
        pointerEvents: 'auto',
        transition: 'transform 215ms linear',
      }}
    >
      {/* cień pod postacią */}
      <div style={{
        position: 'absolute', left: '50%', bottom: -4, transform: 'translateX(-50%)',
        width: 26, height: 12, borderRadius: '50%', background: 'rgba(0,0,0,0.38)',
        filter: 'blur(1px)', pointerEvents: 'none',
      }} />
      <Sprite src={`/assets/${e.obrazek}`} w={HERO_W} h={HERO_H} kier={kind === 'hero' ? e._kier || 0 : 0} step={kind === 'hero' ? e._step || 0 : 0} />
      <div style={{
        position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none',
      }}>
        {bubble && <Bubble text={bubble} />}
        {children}
      </div>
    </div>
  );
});

export default function IsoGameMap({
  state, direction, animStep, chatBubbles = {},
  onMobClick, onPlayerClick, onNpcClick, onMapClick, isMobile,
  worldState = {}, tiles = {},
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [animTick, setAnimTick] = useState(0);

  const { postac, mapa, mobs = [], npcs = [], players = [] } = state;

  useEffect(() => {
    const update = () => wrapRef.current && setSize({ w: wrapRef.current.offsetWidth, h: wrapRef.current.offsetHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Animacja wody/ognia
  useEffect(() => {
    const id = setInterval(() => setAnimTick(t => t + 1), 450);
    return () => clearInterval(id);
  }, []);

  // Kamera: bohater na środku ekranu
  const hero = isoToScreen(postac.x, postac.y);
  const originX = Math.round(size.w / 2 - hero.sx);
  const originY = Math.round(size.h / 2 - hero.sy);

  // ── Kanwa: teren + obiekty ─────────────────────────────────────────────────
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (cv.width !== size.w * dpr || cv.height !== size.h * dpr) {
      cv.width = size.w * dpr; cv.height = size.h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0b0d10';
    ctx.fillRect(0, 0, size.w, size.h);
    ctx.save();
    ctx.translate(originX, originY);

    const anim = Date.now();
    for (let s = 0; s <= mapa.maks_x + mapa.maks_y; s++) {
      for (let x = Math.max(0, s - mapa.maks_y); x <= Math.min(s, mapa.maks_x); x++) {
        const y = s - x;
        const { sx, sy } = isoToScreen(x, y);
        const px = sx + originX, py = sy + originY;
        if (px < -TILE_W || px > size.w + TILE_W || py < -140 || py > size.h + 100) continue;
        const tile = tiles[`${x},${y}`];
        if (!tile) continue;                       // nieomalowane pole = pustka
        drawTerrain(ctx, sx, sy, tile.t || DEFAULT_TERRAIN, { x, y, anim });
        if (tile.o) drawObject(ctx, sx, sy, tile.o, { anim });
      }
    }
    ctx.restore();
  }, [tiles, size, originX, originY, mapa.maks_x, mapa.maks_y, animTick]);

  // ── Kliknięcie w kafel ─────────────────────────────────────────────────────
  const handleClick = (e) => {
    if (e.target.getAttribute('data-entity')) return;
    const r = wrapRef.current.getBoundingClientRect();
    const t = screenToIso(e.clientX - r.left - originX, e.clientY - r.top - originY);
    if (t.x >= 0 && t.y >= 0 && t.x <= mapa.maks_x && t.y <= mapa.maks_y) onMapClick?.(t.x, t.y);
  };

  const pos = (x, y) => {
    const { sx, sy } = isoToScreen(x, y);
    return { sx: sx + originX, sy: sy + originY };
  };

  return (
    <div ref={wrapRef} onClick={handleClick}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#0b0d10', cursor: 'crosshair' }}>

      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* Cel marszu */}
      {state._walkTarget && (() => {
        const { sx, sy } = pos(state._walkTarget.x, state._walkTarget.y);
        return (
          <div style={{
            position: 'absolute', left: sx - TILE_W / 2, top: sy - TILE_H / 2,
            width: TILE_W, height: TILE_H, pointerEvents: 'none', zIndex: 5,
            background: 'rgba(232,192,90,0.18)',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          }} />
        );
      })()}

      {/* Warstwa postaci — własny kontekst układania, żeby nie przebijała okien */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', isolation: 'isolate' }}>
      {/* NPC */}
      {npcs.map(n => {
        const { sx, sy } = pos(n.x, n.y);
        return (
          <Entity key={`n${n.id}`} e={n} kind="npc" sx={sx} sy={sy} onClick={onNpcClick} bubble={chatBubbles[n.nazwa]}>
            <Tag color="#7ec8ff">{n.nazwa}</Tag>
          </Entity>
        );
      })}

      {/* Moby */}
      {mobs.map(m => {
        const { sx, sy } = pos(m.x, m.y);
        const hpPct = m.zycie_max > 0 ? Math.max(0, m.zycie / m.zycie_max) : 1;
        return (
          <Entity key={`m${m.id}`} e={m} kind="mob" sx={sx} sy={sy} onClick={onMobClick}>
            <Tag color="#ff8f7a" size={9}>{m.nazwa} <span style={{ color: '#d8c98a' }}>{m.poziom}</span></Tag>
            <div style={{ width: 30, height: 3, background: '#300', border: '1px solid #000', marginTop: 1 }}>
              <div style={{ width: `${hpPct * 100}%`, height: '100%', background: '#c23a2e' }} />
            </div>
          </Entity>
        );
      })}

      {/* Inni gracze */}
      {players.map(p => {
        const { sx, sy } = pos(p.x, p.y);
        return (
          <Entity key={`p${p.id}`} e={p} kind="player" sx={sx} sy={sy} onClick={onPlayerClick} bubble={chatBubbles[p.nazwa]}>
            {p.tytul_nazwa && <Tag color="#E8D070" size={9}>{p.tytul_ikona} {p.tytul_nazwa}</Tag>}
            <Tag color={RANKA[p.ranga] || '#CDD4AA'}>
              {RANKA_LABEL[p.ranga] ? `${RANKA_LABEL[p.ranga]} ` : ''}{p.gildia_tag ? `[${p.gildia_tag}] ` : ''}{p.nazwa} <span style={{ color: '#8fa08a' }}>{p.poziom}</span>
            </Tag>
          </Entity>
        );
      })}

      {/* Bohater */}
      {(() => {
        const { sx, sy } = pos(postac.x, postac.y);
        const hero = { ...postac, _kier: direction, _step: animStep };
        return (
          <Entity key="hero" e={hero} kind="hero" sx={sx} sy={sy} bubble={chatBubbles[postac.nazwa]}>
            <Tag color={RANKA[postac.ranga] || '#E8D070'}>
              {postac.gildia_tag ? `[${postac.gildia_tag}] ` : ''}{postac.nazwa} <span style={{ color: '#8fa08a' }}>{postac.poziom}</span>
            </Tag>
          </Entity>
        );
      })()}

      </div>
      {/* Winieta + pogoda */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30,
        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(4,3,1,0.6) 100%)',
      }} />
      <WorldOverlay pora={worldState.pora} pogoda={worldState.pogoda} />

      {isMobile && (
        <div style={{ position: 'absolute', top: 54, right: 8, color: T.textDim, fontSize: 9, pointerEvents: 'none', zIndex: 40 }}>
          ({postac.x},{postac.y})
        </div>
      )}
    </div>
  );
}
