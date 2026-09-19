// Rzut izometryczny + zestaw kafli.
//
// Kafle są na razie rysowane w kodzie (romby + proste bryły), żeby edytor działał
// bez kupionych grafik. Po zakupie pakietu wystarczy dopisać `src: 'iso/…png'`
// w definicji — renderer użyje obrazka zamiast rysowania.

export const TILE_W = 64;   // szerokość rombu
export const TILE_H = 32;   // wysokość rombu

export const isoToScreen = (x, y) => ({ sx: (x - y) * (TILE_W / 2), sy: (x + y) * (TILE_H / 2) });

// Ekran → kafel (odwrócenie rzutu; sx,sy względem środka kafla 0,0)
export function screenToIso(sx, sy) {
  const fx = sx / (TILE_W / 2), fy = sy / (TILE_H / 2);
  return { x: Math.floor((fy + fx) / 2), y: Math.floor((fy - fx) / 2) };
}

// ── Teren ────────────────────────────────────────────────────────────────────
// top/left/right = kolory górnej ściany i boków (boki widać na krawędziach mapy)
export const TERRAIN = [
  { id: 'trawa',   nazwa: 'Trawa',       top: '#4a7a35', alt: '#54853c' },
  { id: 'trawa2',  nazwa: 'Trawa sucha', top: '#7d8a3c', alt: '#879444' },
  { id: 'ziemia',  nazwa: 'Ziemia',      top: '#6b4b2e', alt: '#745234' },
  { id: 'droga',   nazwa: 'Droga',       top: '#8a7350', alt: '#937c58' },
  { id: 'bruk',    nazwa: 'Bruk',        top: '#6e6e75', alt: '#7a7a82' },
  { id: 'piasek',  nazwa: 'Piasek',      top: '#c9b077', alt: '#d3bb84' },
  { id: 'deski',   nazwa: 'Deski',       top: '#8a5f33', alt: '#97683a' },
  { id: 'kamien',  nazwa: 'Skała',       top: '#5b5f63', alt: '#666a6f' },
  { id: 'snieg',   nazwa: 'Śnieg',       top: '#d8e2ea', alt: '#e6eef4' },
  { id: 'woda',    nazwa: 'Woda',        top: '#2f6aa8', alt: '#3579bd', woda: true, blok: true },
  { id: 'lawa',    nazwa: 'Lawa',        top: '#c2481c', alt: '#e0602a', woda: true, blok: true },
];
export const TERRAIN_BY_ID = Object.fromEntries(TERRAIN.map(t => [t.id, t]));
export const DEFAULT_TERRAIN = 'trawa';

// ── Obiekty ──────────────────────────────────────────────────────────────────
// h = wysokość bryły w pikselach (rysowana nad kaflem), blok = blokuje przejście
export const OBJECTS = [
  { id: 'drzewo',   nazwa: 'Drzewo',   glyph: '🌲', h: 46, blok: true,  grupa: 'Natura' },
  { id: 'drzewo2',  nazwa: 'Dąb',      glyph: '🌳', h: 46, blok: true,  grupa: 'Natura' },
  { id: 'krzak',    nazwa: 'Krzak',    glyph: '🌿', h: 20, blok: false, grupa: 'Natura' },
  { id: 'kwiaty',   nazwa: 'Kwiaty',   glyph: '🌼', h: 14, blok: false, grupa: 'Natura' },
  { id: 'glaz',     nazwa: 'Głaz',     glyph: '🪨', h: 24, blok: true,  grupa: 'Natura' },
  { id: 'pniak',    nazwa: 'Pniak',    glyph: '🪵', h: 16, blok: true,  grupa: 'Natura' },

  { id: 'dom',      nazwa: 'Dom',      glyph: '🏠', h: 62, blok: true,  grupa: 'Budynki' },
  { id: 'chata',    nazwa: 'Chata',    glyph: '🛖', h: 54, blok: true,  grupa: 'Budynki' },
  { id: 'kuznia',   nazwa: 'Kuźnia',   glyph: '⚒',  h: 54, blok: true,  grupa: 'Budynki' },
  { id: 'wieza',    nazwa: 'Wieża',    glyph: '🗼', h: 78, blok: true,  grupa: 'Budynki' },
  { id: 'zamek',    nazwa: 'Zamek',    glyph: '🏰', h: 78, blok: true,  grupa: 'Budynki' },
  { id: 'namiot',   nazwa: 'Stragan',  glyph: '⛺', h: 44, blok: true,  grupa: 'Budynki' },
  { id: 'studnia',  nazwa: 'Studnia',  glyph: '🕳', h: 26, blok: true,  grupa: 'Budynki' },

  { id: 'mur',      nazwa: 'Mur',      wall: '#7b7b82', h: 40, blok: true, grupa: 'Konstrukcje' },
  { id: 'plot',     nazwa: 'Płot',     wall: '#8a5f33', h: 24, blok: true, grupa: 'Konstrukcje' },
  { id: 'brama',    nazwa: 'Brama',    glyph: '🚪', h: 44, blok: true,  grupa: 'Konstrukcje' },
  { id: 'schody',   nazwa: 'Schody',   glyph: '🪜', h: 22, blok: false, grupa: 'Konstrukcje' },
  { id: 'most',     nazwa: 'Most',     wall: '#9a7040', h: 6, blok: false, grupa: 'Konstrukcje' },

  { id: 'beczka',   nazwa: 'Beczka',   glyph: '🛢', h: 22, blok: true,  grupa: 'Dekoracje' },
  { id: 'skrzynia', nazwa: 'Skrzynia', glyph: '📦', h: 20, blok: true,  grupa: 'Dekoracje' },
  { id: 'ognisko',  nazwa: 'Ognisko',  glyph: '🔥', h: 22, blok: true,  grupa: 'Dekoracje' },
  { id: 'latarnia', nazwa: 'Latarnia', glyph: '🏮', h: 40, blok: true,  grupa: 'Dekoracje' },
  { id: 'wozek',    nazwa: 'Wóz',      glyph: '🛺', h: 30, blok: true,  grupa: 'Dekoracje' },
  { id: 'tablica',  nazwa: 'Tablica',  glyph: '📜', h: 26, blok: true,  grupa: 'Dekoracje' },
];
export const OBJECT_BY_ID = Object.fromEntries(OBJECTS.map(o => [o.id, o]));
export const OBJECT_GROUPS = [...new Set(OBJECTS.map(o => o.grupa))];

// ── Rysowanie ────────────────────────────────────────────────────────────────
function diamond(ctx, cx, cy) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - TILE_H / 2);
  ctx.lineTo(cx + TILE_W / 2, cy);
  ctx.lineTo(cx, cy + TILE_H / 2);
  ctx.lineTo(cx - TILE_W / 2, cy);
  ctx.closePath();
}

// Deterministyczny "szum" — ten sam kafel zawsze wygląda tak samo
const noise = (x, y) => ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1 + 1) % 1;

export function drawTerrain(ctx, cx, cy, terrainId, { x = 0, y = 0, anim = 0 } = {}) {
  const t = TERRAIN_BY_ID[terrainId] || TERRAIN_BY_ID[DEFAULT_TERRAIN];
  const n = noise(x, y);
  let fill = n > 0.5 ? t.top : t.alt;
  if (t.woda) {
    const wave = Math.sin(anim / 500 + (x + y) * 0.7) * 0.5 + 0.5;
    fill = wave > 0.5 ? t.top : t.alt;
  }
  diamond(ctx, cx, cy);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function drawObject(ctx, cx, cy, objectId, { anim = 0 } = {}) {
  const o = OBJECT_BY_ID[objectId];
  if (!o) return;

  if (o.wall) {
    // Bryła (mur/płot/most) — górna ściana + dwa boki
    const h = o.h;
    ctx.fillStyle = o.wall;
    ctx.beginPath();
    ctx.moveTo(cx - TILE_W / 2, cy);
    ctx.lineTo(cx, cy + TILE_H / 2);
    ctx.lineTo(cx, cy + TILE_H / 2 - h);
    ctx.lineTo(cx - TILE_W / 2, cy - h);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.moveTo(cx + TILE_W / 2, cy);
    ctx.lineTo(cx, cy + TILE_H / 2);
    ctx.lineTo(cx, cy + TILE_H / 2 - h);
    ctx.lineTo(cx + TILE_W / 2, cy - h);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    diamond(ctx, cx, cy - h); ctx.fill();
    return;
  }

  // Cień pod obiektem
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, TILE_W * 0.28, TILE_H * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const size = Math.min(o.h + 8, 54);
  ctx.font = `${size}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const bob = o.id === 'ognisko' ? Math.sin(anim / 180) * 2 : 0;
  ctx.fillText(o.glyph, cx, cy + 8 + bob);
}

// Czy kafel blokuje ruch (teren lub obiekt)
export function tileBlocks(tile) {
  if (!tile) return false;
  if (tile.o && OBJECT_BY_ID[tile.o]?.blok) return true;
  if (tile.t && TERRAIN_BY_ID[tile.t]?.blok) return true;
  return false;
}

// Nakłada zmiany kafli (ten sam format co na serwerze) — używane przez edytor i grę.
export function applyTilePatch(store, patch) {
  for (const p of patch || []) {
    const k = `${p.x},${p.y}`;
    const cur = store[k] || {};
    const t = p.t === null ? undefined : (p.t ?? cur.t);
    const o = p.o === null ? undefined : (p.o ?? cur.o);
    const next = {};
    if (t) next.t = t;
    if (o) next.o = o;
    if (next.t || next.o) store[k] = next; else delete store[k];
  }
  return store;
}
