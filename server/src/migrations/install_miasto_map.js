// Generator mapy „Osada Veldoria” — miasto z obrzeżami do expienia 1–5 lv.
// Mapa jest rysowana autorskim silnikiem kafli (mapa.kafle), więc nie potrzebuje
// grafiki tła. Skrypt tworzy też NPC, potwory, przejścia i kolizje.
//
// Uruchamiaj z katalogu projektu:  node server/src/migrations/install_miasto_map.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true });
const db = require('../db');

const NAZWA = 'Osada Veldoria';
const W = 64, H = 64;                 // rozmiar mapy w kaflach
const SPAWN = { x: 32, y: 26 };       // rynek
const BRAMA = { x: 32, y: 35 };       // brama południowa

// Kafle blokujące (te same reguły co w silniku po stronie gracza)
const TEREN_BLOK = new Set(['woda', 'lawa']);
const OBIEKT_BLOK = new Set([
  'drzewo', 'drzewo2', 'glaz', 'pniak', 'mur', 'dach', 'dach2', 'sciana', 'drzwi', 'okno',
  'plot', 'studnia', 'beczka', 'skrzynia', 'ognisko', 'latarnia', 'stragan', 'tablica', 'posag', 'ruiny', 'grob',
]);

// ── Płótno mapy ──────────────────────────────────────────────────────────────
const kafle = {};
const klucz = (x, y) => `${x},${y}`;
const wKafle = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
const ustaw = (x, y, t, o) => {
  if (!wKafle(x, y)) return;
  const k = kafle[klucz(x, y)] || {};
  if (t !== undefined) k.t = t;
  if (o !== undefined) { if (o === null) delete k.o; else k.o = o; }
  kafle[klucz(x, y)] = k;
};
const teren = (x, y) => kafle[klucz(x, y)]?.t;
const obiekt = (x, y) => kafle[klucz(x, y)]?.o;
const prostokat = (x0, y0, x1, y1, t, o) => {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) ustaw(x, y, t, o);
};
const ramka = (x0, y0, x1, y1, o) => {
  for (let x = x0; x <= x1; x++) { ustaw(x, y0, undefined, o); ustaw(x, y1, undefined, o); }
  for (let y = y0; y <= y1; y++) { ustaw(x0, y, undefined, o); ustaw(x1, y, undefined, o); }
};
// powtarzalny „los” — mapa zawsze wygląda tak samo
let ziarno = 20260920;
const los = () => { ziarno = (ziarno * 1103515245 + 12345) % 2147483648; return ziarno / 2147483648; };
const losInt = (a, b) => a + Math.floor(los() * (b - a + 1));

// ── 1. Podkład: łąka, lasy na obrzeżach ──────────────────────────────────────
prostokat(0, 0, W - 1, H - 1, 'trawa');
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (los() < 0.16) ustaw(x, y, 'trawa2');
}

// gęsty las wzdłuż krawędzi mapy (naturalna granica świata)
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const odKrawedzi = Math.min(x, y, W - 1 - x, H - 1 - y);
  if (odKrawedzi <= 1 || (odKrawedzi <= 3 && los() < 0.65)) ustaw(x, y, 'trawa', los() < 0.5 ? 'drzewo' : 'drzewo2');
}

// ── 2. Jezioro na zachodzie ──────────────────────────────────────────────────
const jez = { cx: 13, cy: 47, rx: 9, ry: 7 };
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const d = ((x - jez.cx) / jez.rx) ** 2 + ((y - jez.cy) / jez.ry) ** 2;
  if (d < 1) ustaw(x, y, 'woda', null);
  else if (d < 1.35) { ustaw(x, y, 'piasek', null); if (los() < 0.25) ustaw(x, y, undefined, 'trzcina'); }
}

// strumień wypływający z jeziora na wschód
prostokat(20, 46, 24, 46, 'woda', null);

// ── 3. Miasto: mur, bramy, ulice ─────────────────────────────────────────────
const M = { x0: 15, y0: 6, x1: 48, y1: 35 };
prostokat(M.x0 + 1, M.y0 + 1, M.x1 - 1, M.y1 - 1, 'ziemia');
ramka(M.x0, M.y0, M.x1, M.y1, 'mur');
// bramy: południowa (główna), zachodnia i wschodnia
for (const [bx, by] of [[BRAMA.x, M.y1], [BRAMA.x - 1, M.y1], [M.x0, 20], [M.x0, 21], [M.x1, 20], [M.x1, 21]]) {
  ustaw(bx, by, 'bruk', 'brama');
}

// główne ulice
prostokat(BRAMA.x - 2, M.y0 + 1, BRAMA.x + 1, M.y1 - 1, 'bruk', null);   // pionowa
prostokat(M.x0 + 1, 20, M.x1 - 1, 21, 'bruk', null);                     // pozioma
// rynek
prostokat(26, 22, 38, 30, 'bruk', null);
ustaw(SPAWN.x, SPAWN.y, 'bruk', null);
ustaw(31, 25, 'bruk', 'studnia');
ustaw(35, 24, 'bruk', 'posag');
for (const [sx, sy] of [[28, 23], [28, 29], [37, 29], [27, 27]]) ustaw(sx, sy, 'bruk', 'stragan');
for (const [lx, ly] of [[26, 22], [38, 22], [26, 30], [38, 30], [30, 34], [33, 34], [30, 8], [33, 8]]) ustaw(lx, ly, undefined, 'latarnia');
ustaw(29, 31, 'bruk', 'tablica');

// ── 4. Domy w mieście ────────────────────────────────────────────────────────
// dom: ściany + dach + drzwi od strony ulicy; zwraca środek wejścia
function dom(x0, y0, szer, wys, dachTyp = 'dach') {
  const x1 = x0 + szer - 1, y1 = y0 + wys - 1;
  prostokat(x0, y0, x1, y1, 'deski', 'sciana');
  prostokat(x0, y0, x1, y0 + Math.max(0, Math.floor(wys / 2) - 1), 'deski', dachTyp);
  const dx = x0 + Math.floor(szer / 2);
  ustaw(dx, y1, 'deski', 'drzwi');
  if (szer >= 4) { ustaw(x0 + 1, y1, 'deski', 'okno'); ustaw(x1 - 1, y1, 'deski', 'okno'); }
  return { x: dx, y: y1 + 1 };
}

const domy = [
  [17, 8, 6, 5, 'dach'], [24, 8, 5, 5, 'dach2'], [36, 8, 6, 5, 'dach'], [43, 8, 5, 5, 'dach2'],
  [17, 15, 5, 4, 'dach2'], [24, 15, 4, 4, 'dach'], [40, 15, 6, 4, 'dach'],
  [17, 24, 6, 5, 'dach'], [17, 31, 5, 3, 'dach2'],
  [41, 24, 6, 5, 'dach2'], [41, 31, 5, 3, 'dach'],
];
for (const [x, y, w, h, d] of domy) dom(x, y, w, h, d);

// ogródki i płoty przy domach
for (const [x, y, w, h] of domy) {
  if (los() < 0.6) {
    const gx = x, gy = y + h + 1;
    prostokat(gx, gy, gx + w - 1, gy, 'ziemia', null);
    for (let i = 0; i < w; i++) if (los() < 0.5) ustaw(gx + i, gy, 'ziemia', 'kwiaty');
  }
}

// ── 6. Pola uprawne na wschodzie ─────────────────────────────────────────────
for (let p = 0; p < 3; p++) {
  const fx = 44 + (p % 2) * 8, fy = 40 + Math.floor(p / 2) * 9;
  prostokat(fx, fy, fx + 6, fy + 6, 'ziemia', null);
  ramka(fx - 1, fy - 1, fx + 7, fy + 7, 'plot');
  for (let y = fy; y <= fy + 6; y += 2) for (let x = fx; x <= fx + 6; x++) if (los() < 0.7) ustaw(x, y, 'ziemia', 'krzak');
  ustaw(fx + 3, fy + 7, 'ziemia', null);   // wejście na pole
}
ustaw(43, 39, 'trawa', 'stragan');
ustaw(44, 38, 'trawa', 'ognisko');

// ── 7. Ruiny na północnym wschodzie ──────────────────────────────────────────
prostokat(54, 6, 61, 14, 'kamien', null);
for (let i = 0; i < 16; i++) ustaw(losInt(54, 61), losInt(6, 14), 'kamien', los() < 0.6 ? 'ruiny' : 'grob');
ustaw(57, 15, 'kamien', 'ognisko');

// ── 8. Zagajniki na obrzeżach ────────────────────────────────────────────────
for (const [cx, cy, r] of [[8, 14, 6], [10, 30, 5], [24, 55, 6], [40, 58, 5], [56, 44, 5], [50, 30, 4]]) {
  for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
    const d = Math.hypot(x - cx, y - cy);
    if (d <= r && los() < 0.55 - d * 0.04 + 0.25) {
      if (teren(x, y) === 'woda' || teren(x, y) === 'bruk' || teren(x, y) === 'droga' || obiekt(x, y)) continue;
      ustaw(x, y, 'trawa', los() < 0.6 ? 'drzewo' : 'drzewo2');
    }
  }
}
// ── 9. Drogi (na końcu, żeby przecinały płoty i zagajniki) ───────────────────
const DROGI = [
  [BRAMA.x - 1, M.y1 + 1, BRAMA.x, 58],   // z bramy na południe
  [20, 44, BRAMA.x, 45],                  // na zachód, do jeziora
  [BRAMA.x, 50, 51, 51],                  // na wschód, do pól
  [52, 8, 53, 30],                        // wzdłuż muru na północ
  [49, 20, 53, 21],                       // od wschodniej bramy
  [44, 47, 51, 48],                       // miedza między polami
];
for (const [x0, y0, x1, y1] of DROGI) prostokat(x0, y0, x1, y1, 'droga', null);
for (let x = 20; x <= 24; x++) ustaw(x, 45, 'droga', 'most');   // most nad strumieniem

// pojedyncze głazy, krzaki i kwiaty
for (let i = 0; i < 150; i++) {
  const x = losInt(2, W - 3), y = losInt(2, H - 3);
  if (obiekt(x, y) || ['woda', 'bruk', 'droga', 'deski'].includes(teren(x, y))) continue;
  const r = los();
  ustaw(x, y, undefined, r < 0.25 ? 'glaz' : r < 0.5 ? 'pniak' : r < 0.78 ? 'krzak' : 'kwiaty');
}

// obozowisko przy drodze (miejsce na odpoczynek)
prostokat(26, 47, 29, 49, 'ziemia', null);
ustaw(27, 48, 'ziemia', 'ognisko');
ustaw(29, 47, 'ziemia', 'beczka');
ustaw(26, 49, 'ziemia', 'skrzynia');

// ── 9. Zapis do bazy ─────────────────────────────────────────────────────────
const NPC = [
  { obrazek: 'npc/makatara.gif',     x: 29, y: 24, shop: 1,  nazwa: 'Mara Kupcowa',      poziom: 5,  typ: 0 },
  { obrazek: 'npc/psorkajarenia.gif',x: 34, y: 28, shop: 10, nazwa: 'Jarenia Zielarka',  poziom: 6,  typ: 0 },
  { obrazek: 'npc/straznik.gif',     x: 33, y: 34, shop: 0,  nazwa: 'Strażnik Bramy',    poziom: 12, typ: 0 },
  { obrazek: 'npc/unil.gif',         x: 24, y: 21, shop: 0,  nazwa: 'Unil Wędrowiec',    poziom: 4,  typ: 0 },
  { obrazek: 'npc/sir-galien.gif',   x: 39, y: 21, shop: 0,  nazwa: 'Sir Galien',        poziom: 15, typ: 0 },
  { obrazek: 'npc/teleporter.gif',   x: 31, y: 33, shop: 0,  nazwa: 'Mistrz Portali',    poziom: 20, typ: 0 },
];

// Potwory 1–5 lv: im dalej od bramy, tym mocniejsze
const GATUNKI = [
  { poziom: 1, nazwa: 'Dziki Królik', obrazek: 'mob/krolik.gif',      ile: 10, obszar: [22, 36, 42, 50] },
  { poziom: 2, nazwa: 'Polny Szczur', obrazek: 'mob/szczur.gif',      ile: 10, obszar: [40, 36, 60, 56] },
  { poziom: 3, nazwa: 'Leśny Pająk',  obrazek: 'mob/pajak.gif',       ile: 9,  obszar: [3, 10, 16, 36] },
  { poziom: 4, nazwa: 'Szary Wilk',   obrazek: 'mob/szary-wilk.gif',  ile: 8,  obszar: [16, 50, 46, 61] },
  { poziom: 5, nazwa: 'Leśna Żmija',  obrazek: 'mob/zmija.gif',       ile: 7,  obszar: [48, 6, 62, 30] },
];
const statyMoba = (lvl) => ({
  zycie: 26 + lvl * 16, sa: 88 + lvl, ac: lvl * 2,
  obr_min: 1 + lvl * 2, obr_max: 3 + lvl * 3, exp: 7 + lvl * 6, respawn_time: 45 + lvl * 5,
});

const wolne = (x, y) => {
  const k = kafle[klucz(x, y)];
  if (!k) return false;
  if (TEREN_BLOK.has(k.t) || OBIEKT_BLOK.has(k.o)) return false;
  return true;
};

// Kafle, do których gracz naprawdę dojdzie z rynku — tylko tam stawiamy potwory
function osiagalne() {
  const zbior = new Set([klucz(SPAWN.x, SPAWN.y)]);
  const kolejka = [[SPAWN.x, SPAWN.y]];
  while (kolejka.length) {
    const [x, y] = kolejka.shift();
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = x + dx, ny = y + dy, k = klucz(nx, ny);
      if (zbior.has(k) || !wKafle(nx, ny) || !wolne(nx, ny)) continue;
      zbior.add(k); kolejka.push([nx, ny]);
    }
  }
  return zbior;
}

async function main() {
  // mapa
  const [[istnieje]] = await db.query('SELECT id FROM mapa WHERE nazwa=? LIMIT 1', [NAZWA]);
  let mapId;
  if (istnieje) {
    mapId = istnieje.id;
    await db.query('UPDATE mapa SET pvp=0, obrazek=?, maks_x=?, maks_y=?, dead_map=?, dead_x=?, dead_y=? WHERE id=?',
      ['', W - 1, H - 1, mapId, SPAWN.x, SPAWN.y, mapId]);
    console.log(`Mapa „${NAZWA}" już istnieje — aktualizuję ID ${mapId}.`);
  } else {
    const [r] = await db.query(
      'INSERT INTO mapa (nazwa,pvp,obrazek,maks_x,maks_y,dead_map,dead_x,dead_y) VALUES (?,?,?,?,?,?,?,?)',
      [NAZWA, 0, '', W - 1, H - 1, 1, SPAWN.x, SPAWN.y]);
    mapId = r.insertId;
    await db.query('UPDATE mapa SET dead_map=? WHERE id=?', [mapId, mapId]);
    console.log(`Utworzono mapę „${NAZWA}" — ID ${mapId}.`);
  }
  await db.query('UPDATE mapa SET iso=0, kafle=? WHERE id=?', [JSON.stringify(kafle), mapId]);
  console.log(`Zapisano ${Object.keys(kafle).length} kafli.`);

  // czyścimy zawartość mapy
  await db.query('DELETE FROM blokadaprzejscia WHERE mapa=?', [mapId]);
  await db.query('DELETE FROM npc WHERE mapa=?', [mapId]);
  await db.query('DELETE FROM mob WHERE mapa=?', [mapId]);
  await db.query('DELETE FROM mapa_przenies WHERE mapa=?', [mapId]);

  // NPC — pod nimi kafel musi być przechodni dla gracza obok
  for (const n of NPC) {
    ustaw(n.x, n.y, undefined, null);
    await db.query(
      `INSERT INTO npc (obrazek,mapa,x,y,shop,nazwa,poziom,typ,procentodsprzedazy,szerokosc,dlugosc,cena,max_sprzedaz)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [n.obrazek, mapId, n.x, n.y, n.shop, n.nazwa, n.poziom, n.typ, 100, 32, 48, 100, 15000]);
  }

  // potwory — tylko na polach osiągalnych z rynku
  const dostepne = osiagalne();
  let ileMobow = 0;
  for (const g of GATUNKI) {
    const s = statyMoba(g.poziom);
    const [x0, y0, x1, y1] = g.obszar;
    let dodane = 0, prob = 0;
    while (dodane < g.ile && prob < 900) {
      prob++;
      const x = losInt(x0, x1), y = losInt(y0, y1);
      if (!wolne(x, y) || !dostepne.has(klucz(x, y))) continue;
      await db.query(
        `INSERT INTO mob (obrazek,mapa,x,y,nazwa,poziom,typ,szerokosc,dlugosc,zycie,zycie_max,sa,ac,acm,obr_min,obr_max,exp,respawn_time,respawn)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [g.obrazek, mapId, x, y, g.nazwa, g.poziom, 0, 32, 32, s.zycie, s.zycie, s.sa, s.ac, 0, s.obr_min, s.obr_max, s.exp, s.respawn_time, 0]);
      dodane++; ileMobow++;
    }
  }
  console.log(`Dodano ${ileMobow} potworów (poziomy 1–5).`);

  // przejścia: brama południowa ↔ Ithan
  await db.query(
    'INSERT INTO mapa_przenies (nazwa_mapy,mapa,x,y,do_mapa,do_x,do_y) VALUES (?,?,?,?,?,?,?)',
    [NAZWA, mapId, BRAMA.x, 58, 1, 32, 43]);
  await db.query('DELETE FROM mapa_przenies WHERE mapa=1 AND do_mapa=?', [mapId]);
  await db.query(
    'INSERT INTO mapa_przenies (nazwa_mapy,mapa,x,y,do_mapa,do_x,do_y) VALUES (?,?,?,?,?,?,?)',
    ['Ithan', 1, 32, 44, mapId, BRAMA.x, 57]);

  // kolizje z kafli
  const blokady = [];
  for (const [k, v] of Object.entries(kafle)) {
    if (TEREN_BLOK.has(v.t) || OBIEKT_BLOK.has(v.o)) {
      const [x, y] = k.split(',').map(Number);
      blokady.push([mapId, x, y]);
    }
  }
  for (let i = 0; i < blokady.length; i += 500) {
    const part = blokady.slice(i, i + 500);
    await db.query(`INSERT INTO blokadaprzejscia (mapa,x,y) VALUES ${part.map(() => '(?,?,?)').join(',')}`, part.flat());
  }
  console.log(`Zapisano ${blokady.length} pól kolizji.`);

  // mapa startowa
  const cfg = { starting_map: String(mapId), starting_x: String(SPAWN.x), starting_y: String(SPAWN.y), dead_respawn_map: String(mapId) };
  for (const [k, v] of Object.entries(cfg)) {
    await db.query(
      'INSERT INTO server_config (config_key, config_value) VALUES (?,?) ON DUPLICATE KEY UPDATE config_value=VALUES(config_value)',
      [k, v]);
  }
  console.log('Ustawiono mapę startową na', NAZWA, SPAWN);
  console.log(`ID mapy: ${mapId}. Zrestartuj serwer, żeby odświeżyć pamięć map.`);
}

module.exports = { kafle, NAZWA, W, H, SPAWN, BRAMA, NPC, GATUNKI, TEREN_BLOK, OBIEKT_BLOK };

if (require.main === module) {
  main().then(() => process.exit(0)).catch(e => { console.error('Nieudana instalacja mapy:', e); process.exit(1); });
}
