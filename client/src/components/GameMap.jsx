import { useEffect, useRef, useState, memo } from 'react';
import { T } from '../theme';
import WorldOverlay from './WorldOverlay';
import { czyMapaKaflowa, rysujKafelTerenu, rysujKafelObiektu, TILE as KAFEL, ZAPAS_KAFLI } from '../engine/tiles2d';

const TILE   = KAFEL;
const HERO_W = 32;
const HERO_H = 48;
const RANKA       = { GameAdmin:'#f44', GameMaster:'#f90', Moderator:'#4af' };
const RANKA_LABEL = { GameAdmin:'★ GA', GameMaster:'✦ GM', Moderator:'◈ Mod' };

function Sprite({ src, w, h, kier = 0, step = 0 }) {
  return (
    <div style={{
      width:w, height:h,
      backgroundImage:`url(${src})`,
      backgroundPosition:`${-step*w}px ${-kier*h}px`,
      backgroundRepeat:'no-repeat', imageRendering:'pixelated',
    }} />
  );
}

function ChatBubble({ text }) {
  return (
    <div style={{
      background:'linear-gradient(160deg,rgba(16,26,10,0.97),rgba(8,14,5,0.97))',
      color:'#E8D070', border:'1px solid rgba(200,150,32,0.6)', borderRadius:8,
      padding:'5px 10px', fontSize:11, maxWidth:200, wordBreak:'break-word',
      pointerEvents:'none', boxShadow:'0 3px 16px rgba(0,0,0,0.85)',
      whiteSpace:'pre-wrap', lineHeight:1.4, animation:'bubblePop 0.15s ease-out',
      fontFamily:'"Palatino Linotype",Palatino,serif', position:'relative',
    }}>
      {text}
      <div style={{ position:'absolute', bottom:-5, left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'5px solid rgba(16,26,10,0.97)' }} />
      <div style={{ position:'absolute', bottom:-7, left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'6px solid transparent', borderRight:'6px solid transparent', borderTop:'6px solid rgba(200,150,32,0.6)' }} />
    </div>
  );
}

const SH = '1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000';

function NameTag({ name, level, rankColor, rankLabel, guildTag, tytulNazwa, prestige }) {
  return (
    <div style={{ textAlign:'center', pointerEvents:'none', textShadow:SH }}>
      {rankColor && (
        <div style={{ color:rankColor, fontSize:8, fontWeight:'bold', textShadow:`0 0 6px ${rankColor}` }}>
          {rankLabel}
        </div>
      )}
      {guildTag && (
        <div style={{ color:'#A0C8FF', fontSize:8, fontWeight:'bold' }}>
          &lt;{guildTag}&gt;
        </div>
      )}
      {tytulNazwa && (
        <div style={{ color:'#FFD700', fontSize:9, fontWeight:'bold', letterSpacing:'0.3px', textShadow:'0 0 6px rgba(255,215,0,0.5),'+SH }}>
          {tytulNazwa}
        </div>
      )}
      <div style={{ color:'#FFFFFF', fontWeight:'bold', fontSize:9, display:'flex', alignItems:'center', gap:3, justifyContent:'center', whiteSpace:'nowrap' }}>
        {prestige > 0 && <span style={{ color:'#22D3EE', fontSize:8, fontWeight:'bold' }}>✦{prestige}</span>}
        {name}
        <span style={{ color:'#FCD34D', fontSize:8 }}>Lv.{level}</span>
      </div>
    </div>
  );
}

// ── Memoized world entities — only re-renders when mobs/npcs/players change ──
const WorldEntities = memo(function WorldEntities({ mobs, npcs, players, chatBubbles, onMobClick, onNpcClick, onPlayerClick }) {
  return (
    <>
      {mobs.map(mob => {
        const w = mob.szerokosc||24, h = mob.dlugosc||32;
        const pct = mob.zycie_max>0 ? mob.zycie/mob.zycie_max : 1;
        const hc = pct>.5?'#50a050':pct>.25?'#a07030':'#a03030';
        return (
          <div key={mob.id} data-entity="mob"
            onClick={e=>{e.stopPropagation();onMobClick(mob);}}
            style={{
              position:'absolute', left:0, top:0, width:w, height:h,
              transform:`translate(${mob.x*TILE}px,${mob.y*TILE}px)`,
              transition:'transform 0.32s linear', willChange:'transform',
              cursor:'crosshair', zIndex:20,
            }}
          >
            <Sprite src={`/assets/${mob.obrazek}`} w={w} h={h} />
            <div style={lbl}>
              <span style={{ color:'#f0a060', fontSize:9 }}>{mob.nazwa}</span>
              <span style={{ color:T.textMuted, fontSize:8 }}> poz.{mob.poziom}</span>
            </div>
            <div style={{ position:'absolute', bottom:-5, left:0, right:0, height:3, background:'rgba(0,0,0,0.5)', borderRadius:2 }}>
              <div style={{ width:`${pct*100}%`, height:'100%', background:hc, borderRadius:2, transition:'width 0.3s' }} />
            </div>
          </div>
        );
      })}

      {npcs.map(npc => {
        const w = npc.szerokosc||32, h = npc.dlugosc||48;
        return (
          <div key={`npc_${npc.id}`} data-entity="npc"
            onClick={e=>{e.stopPropagation();onNpcClick?.(npc);}}
            style={{
              position:'absolute', left:0, top:0, width:w, height:h,
              transform:`translate(${npc.x*TILE}px,${npc.y*TILE}px)`,
              cursor:'pointer', zIndex:18,
            }}
          >
            <Sprite src={`/assets/${npc.obrazek}`} w={w} h={h} />
            <div style={lbl}>
              <span style={{ color:T.gold, fontSize:9 }}>{npc.nazwa}</span>
              {npc.shop>0 && <span style={{ fontSize:8, color:'#60A5FA' }}> ▣</span>}
            </div>
            {chatBubbles[npc.nazwa] && <ChatBubble text={chatBubbles[npc.nazwa]} />}
          </div>
        );
      })}

      {players.map(p => {
        const rc = RANKA[p.ranga];
        return (
          <div key={`p_${p.id}`} data-entity="player"
            onClick={e=>{e.stopPropagation();onPlayerClick(p);}}
            style={{
              position:'absolute', left:0, top:0, width:HERO_W, height:HERO_H,
              transform:`translate(${p.x*TILE}px,${p.y*TILE}px)`,
              transition:'transform 0.22s linear', willChange:'transform',
              cursor:'pointer', zIndex:25,
            }}
          >
            <Sprite src={`/assets/${p.obrazek}`} w={HERO_W} h={HERO_H} kier={p._kier || 0} step={p._step || 0} />
            <div style={{ position:'absolute', bottom:'100%', left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:3, pointerEvents:'none' }}>
              {chatBubbles[p.nazwa] && <ChatBubble text={chatBubbles[p.nazwa]} />}
              <NameTag name={p.nazwa} level={p.poziom} rankColor={rc} rankLabel={RANKA_LABEL[p.ranga]} guildTag={p.gildia_tag} tytulNazwa={p.tytul_nazwa} prestige={p.prestige} />
            </div>
          </div>
        );
      })}
    </>
  );
});

export default function GameMap({
  state, direction, animStep, chatBubbles={}, tiles,
  onMobClick, onPlayerClick, onNpcClick, onMapClick, isMobile,
  worldState = {},
}) {
  const containerRef = useRef(null);
  const kaflowe = czyMapaKaflowa(tiles, state?.mapa);
  const [size, setSize] = useState({ w:window.innerWidth, h:window.innerHeight });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const update = () => {
      if (containerRef.current)
        setSize({ w:containerRef.current.offsetWidth, h:containerRef.current.offsetHeight });
    };
    update();
    window.addEventListener('resize', update);
    const t = setTimeout(() => setReady(true), 60);
    return () => { window.removeEventListener('resize', update); clearTimeout(t); };
  }, []);

  const { postac, mapa, mobs, npcs, players } = state;
  const plotnoRef = useRef(null);
  const swiatRef = useRef(null);
  const kamRef = useRef(null);
  const widokRef = useRef({ ox: 0, oy: 0, w: 0, h: 0 });

  const cx = Math.floor((size.w - HERO_W) / 2);
  const cy = Math.floor((size.h - HERO_H) / 2);

  const mapW = (mapa.maks_x + 1) * TILE;
  const mapH = (mapa.maks_y + 1) * TILE;

  // ── Kamera z martwą strefą ────────────────────────────────────────────
  // Bohater chodzi po ekranie wewnątrz prostokąta na środku widoku; mapa rusza
  // się dopiero, gdy z niego wyjdzie. Bez tego postać stoi w miejscu, a wrażenie
  // jest takie, jakby to świat jeździł pod nogami.
  const strefaX = Math.max(0, Math.min(size.w / 2 - TILE * 2, TILE * 6));
  const strefaY = Math.max(0, Math.min(size.h / 2 - TILE * 2, TILE * 4));
  const klucz = `${mapa.id}|${postac.x},${postac.y}|${size.w}x${size.h}`;
  if (kamRef.current?.klucz !== klucz) {
    const hx = postac.x * TILE, hy = postac.y * TILE;
    const nowaMapa = !kamRef.current || kamRef.current.mapaId !== mapa.id;
    let nox, noy;
    if (nowaMapa) {
      // wejście na mapę (także po teleporcie) — ustawiamy bohatera na środku
      nox = cx - hx; noy = cy - hy;
    } else {
      nox = kamRef.current.ox; noy = kamRef.current.oy;
      const ekranX = hx + nox, ekranY = hy + noy;
      if (ekranX < cx - strefaX) nox = cx - strefaX - hx;
      if (ekranX > cx + strefaX) nox = cx + strefaX - hx;
      if (ekranY < cy - strefaY) noy = cy - strefaY - hy;
      if (ekranY > cy + strefaY) noy = cy + strefaY - hy;
    }
    nox = mapW >= size.w ? Math.min(0, Math.max(size.w - mapW, nox)) : Math.floor((size.w - mapW) / 2);
    noy = mapH >= size.h ? Math.min(0, Math.max(size.h - mapH, noy)) : Math.floor((size.h - mapH) / 2);
    kamRef.current = { klucz, mapaId: mapa.id, ox: Math.round(nox), oy: Math.round(noy) };
  }
  const { ox, oy } = kamRef.current;

  const heroX = Math.round(postac.x * TILE + ox);
  const heroY = Math.round(postac.y * TILE + oy);

  widokRef.current = { ox, oy, w: size.w, h: size.h };

  // Rysowanie mapy autorskim silnikiem — tylko kafle widoczne na ekranie
  useEffect(() => {
    if (!kaflowe) return;
    let id;
    const rysuj = () => {
      const c = plotnoRef.current;
      let { ox: vx, oy: vy } = widokRef.current;
      const { w, h } = widokRef.current;
      // Świat (moby, NPC, bohater) przesuwa się animacją CSS — kafle czytają jej
      // bieżący stan, żeby teren nie „przeskakiwał" przed resztą sceny.
      const el = swiatRef.current;
      if (el) {
        const t = getComputedStyle(el).transform;
        if (t && t !== 'none') {
          const m = new DOMMatrixReadOnly(t);
          vx = Math.round(m.m41); vy = Math.round(m.m42);
        }
      }
      if (c && w && h) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
          c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
          c.style.width = `${w}px`; c.style.height = `${h}px`;
        }
        const ctx = c.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#10150d';
        ctx.fillRect(0, 0, w, h);
        const x0 = Math.max(0, Math.floor(-vx / TILE) - 1);
        const y0 = Math.max(0, Math.floor(-vy / TILE) - 1);
        const x1 = Math.min(mapa.maks_x, x0 + Math.ceil(w / TILE) + 2);
        const y1 = Math.min(mapa.maks_y, y0 + Math.ceil(h / TILE) + 2);
        const anim = performance.now();
        for (let y = y0; y <= y1; y++)
          for (let x = x0; x <= x1; x++)
            rysujKafelTerenu(ctx, Math.round(x * TILE + vx), Math.round(y * TILE + vy), tiles, x, y, anim);
        // obiekty z zapasem: wysoki sprite (drzewo, dom) stoi nizej, a widac go wyzej
        const ox0 = Math.max(0, x0 - 2), ox1 = Math.min(mapa.maks_x, x1 + 2);
        const oy1 = Math.min(mapa.maks_y, y1 + ZAPAS_KAFLI);
        for (let y = y0; y <= oy1; y++)
          for (let x = ox0; x <= ox1; x++)
            rysujKafelObiektu(ctx, Math.round(x * TILE + vx), Math.round(y * TILE + vy), tiles, x, y, anim);
      }
      id = requestAnimationFrame(rysuj);
    };
    id = requestAnimationFrame(rysuj);
    return () => cancelAnimationFrame(id);
  }, [kaflowe, tiles, mapa.maks_x, mapa.maks_y]);

  const handleClick = (e) => {
    if (e.target.getAttribute('data-entity')) return;
    const rect = containerRef.current.getBoundingClientRect();
    const tileX = Math.floor((e.clientX - rect.left - ox) / TILE);
    const tileY = Math.floor((e.clientY - rect.top  - oy) / TILE);
    if (tileX >= 0 && tileY >= 0 && tileX <= mapa.maks_x && tileY <= mapa.maks_y)
      onMapClick?.(tileX, tileY);
  };

  return (
    <div ref={containerRef} onClick={handleClick}
      style={{ position:'relative', width:'100%', height:'100%', overflow:'hidden', background:T.bgDeep, cursor:'crosshair' }}
    >
      {/* Warstwa kafli (autorski silnik) — rysowana pod światem */}
      {kaflowe && (
        <canvas ref={plotnoRef} style={{ position:'absolute', left:0, top:0, imageRendering:'pixelated', pointerEvents:'none' }} />
      )}

      {/* ── SCROLLING WORLD ──────────────────────────────────────────────── */}
      <div ref={swiatRef} style={{
        position:'absolute', left:0, top:0,
        transform:`translate(${ox}px,${oy}px)`,
        transition: ready ? 'transform 215ms linear' : 'none',
        willChange:'transform',
      }}>
        {/* Tło mapy — obrazek tylko dla map bez kafli */}
        {!kaflowe && (
          <div style={{
            position:'absolute', left:0, top:0, width:mapW, height:mapH,
            backgroundImage:`url(/assets/${mapa.obrazek})`,
            backgroundRepeat:'no-repeat', imageRendering:'pixelated',
            backgroundSize:`${mapW}px ${mapH}px`,
          }} />
        )}

        {/* Walk target */}
        {state._walkTarget && (
          <div style={{
            position:'absolute',
            left:state._walkTarget.x*TILE+6, top:state._walkTarget.y*TILE+6,
            width:TILE-12, height:TILE-12,
            border:`2px solid ${T.gold}99`, borderRadius:4, pointerEvents:'none', zIndex:5,
          }} />
        )}

        {/* Entities: memoized, only re-renders when mobs/npcs/players change */}
        <WorldEntities
          mobs={mobs} npcs={npcs} players={players}
          chatBubbles={chatBubbles}
          onMobClick={onMobClick} onNpcClick={onNpcClick} onPlayerClick={onPlayerClick}
        />
      </div>
      {/* ── END SCROLLING WORLD ──────────────────────────────────────────── */}

      {/* Map edge fog */}
      {[
        ox > 0 && { left:0, top:0, right:0, height: Math.min(size.h, oy+8), background:`linear-gradient(to bottom, ${T.bgDeep} 0%, ${T.bgDeep} 60%, transparent 100%)` },
        oy+mapH < size.h && { left:0, bottom:0, right:0, height: Math.min(size.h, size.h-(oy+mapH)+8), background:`linear-gradient(to top, ${T.bgDeep} 0%, ${T.bgDeep} 60%, transparent 100%)` },
        ox > 0 && { top:0, left:0, bottom:0, width: Math.min(size.w, ox+8), background:`linear-gradient(to right, ${T.bgDeep} 0%, ${T.bgDeep} 60%, transparent 100%)` },
        ox+mapW < size.w && { top:0, right:0, bottom:0, width: Math.min(size.w, size.w-(ox+mapW)+8), background:`linear-gradient(to left, ${T.bgDeep} 0%, ${T.bgDeep} 60%, transparent 100%)` },
      ].filter(Boolean).map((style, i) => (
        <div key={i} style={{ position:'absolute', pointerEvents:'none', zIndex:28, ...style }} />
      ))}

      {/* Vignette */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:29,
        background:'radial-gradient(ellipse at center, transparent 50%, rgba(4,3,1,0.55) 100%)',
      }} />

      {/* Weather / time of day */}
      <WorldOverlay pora={worldState.pora} pogoda={worldState.pogoda} />

      {/* ── HERO — GPU-accelerated via transform ─────────────────────────── */}
      <div style={{
        position:'absolute', left:0, top:0,
        width:HERO_W, height:HERO_H,
        zIndex:70, pointerEvents:'none',
        transform:`translate(${heroX}px,${heroY}px)`,
        transition: ready ? 'transform 215ms linear' : 'none',
        willChange:'transform',
      }}>
        <Sprite src={`/assets/${postac.obrazek}`} w={HERO_W} h={HERO_H} kier={direction} step={animStep} />
        <div style={{ position:'absolute', bottom:'100%', left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:3, pointerEvents:'none' }}>
          {chatBubbles[postac.nazwa] && <ChatBubble text={chatBubbles[postac.nazwa]} />}
          <NameTag
            name={postac.nazwa} level={postac.poziom}
            rankColor={RANKA[postac.ranga]} rankLabel={RANKA_LABEL[postac.ranga]}
            guildTag={postac.gildia_tag} tytulNazwa={postac.tytul_nazwa}
            prestige={postac.prestige}
          />
        </div>
      </div>

      {isMobile && (
        <div style={{ position:'absolute', top:54, right:8, color:T.textDim, fontSize:9, pointerEvents:'none', zIndex:40 }}>
          ({postac.x},{postac.y})
        </div>
      )}
    </div>
  );
}

const lbl = {
  position:'absolute', bottom:'100%', left:'50%', transform:'translateX(-50%)',
  textAlign:'center', pointerEvents:'none',
  textShadow:'1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000',
};
