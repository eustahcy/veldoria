// Kafle izometryczne mapy: { "x,y": { t: teren, o: obiekt } }.
// Zapis jest różnicowy — klient wysyła tylko zmienione pola.

const MAX_TILES = 40000;

function parseTiles(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

/**
 * Nakłada listę zmian na zbiór kafli (mutuje `kafle`).
 * Wpis { x, y, t, o }: pominięte pole = bez zmian, null = usuń.
 * Zwraca liczbę zastosowanych zmian.
 */
function applyTilePatch(kafle, patch, { maks_x = 1e6, maks_y = 1e6 } = {}) {
  if (!Array.isArray(patch)) return 0;
  let applied = 0;
  for (const p of patch) {
    const x = Number(p?.x), y = Number(p?.y);
    if (!Number.isInteger(x) || !Number.isInteger(y)) continue;
    if (x < 0 || y < 0 || x > maks_x || y > maks_y) continue;

    const k = `${x},${y}`;
    const cur = kafle[k] || {};
    const t = p.t === null ? undefined : (p.t ?? cur.t);
    const o = p.o === null ? undefined : (p.o ?? cur.o);
    // "p" = kafel zajęty przez obiekt większy niż jeden kafel (dom, brama).
    // Grafikę rysuje kafel z "o", a te wokół trzymają tylko informację o zajęciu.
    const pole = p.p === null ? undefined : (p.p ?? cur.p);

    const next = {};
    if (t) next.t = String(t).slice(0, 32);
    if (o) next.o = String(o).slice(0, 32);
    if (pole) next.p = String(pole).slice(0, 32);

    if (next.t || next.o || next.p) kafle[k] = next;
    else delete kafle[k];
    applied++;
  }
  return applied;
}

module.exports = { parseTiles, applyTilePatch, MAX_TILES };
