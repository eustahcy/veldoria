// Wgranie nowej grafiki Ithan (paczka veldoria_map): obrazek mapy, kolizje z
// collision.json, mapa startowa i przeniesienie wszystkich postaci na spawn.
// Uruchamiaj z katalogu projektu:  node server/src/migrations/install_ithan_map.js
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true });
const db = require('../db');

const MAP_ID = 1;                                  // Ithan — ta sama siatka 64×96
const MAP_NAME = 'Ithan';
const IMAGE_REL = 'mapy/veldoria-ithan.png';
const IMAGE_PATH = path.join(__dirname, '../../../original/MAEGONEM_pliki', IMAGE_REL);
const COLLISION_PATH = path.join(__dirname, 'ithan-collision.json');
const SPAWN = { x: 32, y: 42 };

async function main() {
  if (!fs.existsSync(IMAGE_PATH)) throw new Error(`Brak grafiki mapy: ${IMAGE_PATH}`);
  const col = JSON.parse(fs.readFileSync(COLLISION_PATH, 'utf8'));
  const grid = col.values;
  if (!Array.isArray(grid) || !Array.isArray(grid[0])) throw new Error('Nieprawidłowy plik kolizji');
  const H = grid.length, W = grid[0].length;
  console.log(`Kolizje: siatka ${W}×${H}, blokad w pliku: ${grid.flat().filter(Boolean).length}`);

  const [[mapa]] = await db.query('SELECT * FROM mapa WHERE id=?', [MAP_ID]);
  if (!mapa) throw new Error(`Mapa ${MAP_ID} nie istnieje`);

  await db.query('UPDATE mapa SET nazwa=?, obrazek=?, maks_x=?, maks_y=?, dead_map=?, dead_x=?, dead_y=? WHERE id=?',
    [MAP_NAME, IMAGE_REL, W - 1, H - 1, MAP_ID, SPAWN.x, SPAWN.y, MAP_ID]);
  try { await db.query('UPDATE mapa SET iso=0, kafle=NULL WHERE id=?', [MAP_ID]); } catch (_) { /* kolumny iso nie ma w starych bazach */ }

  // Pola zajęte przez NPC, moby i przejścia muszą być przechodnie
  const [npcs]    = await db.query('SELECT x, y FROM npc WHERE mapa=?', [MAP_ID]);
  const [moby]    = await db.query('SELECT x, y FROM mob WHERE mapa=?', [MAP_ID]);
  const [portale] = await db.query('SELECT x, y FROM mapa_przenies WHERE mapa=?', [MAP_ID]);

  const wolne = (x, y) => { if (grid[y] && grid[y][x]) { grid[y][x] = 0; return 1; } return 0; };
  let odblokowane = 0;
  for (const o of [...npcs, ...moby, ...portale, SPAWN]) {
    odblokowane += wolne(o.x, o.y);
    // przy NPC/mobie przyda się przynajmniej jedno wolne pole obok
    const sasiedzi = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(([dx, dy]) => [o.x + dx, o.y + dy])
      .filter(([x, y]) => x >= 0 && y >= 0 && x < W && y < H);
    if (sasiedzi.every(([x, y]) => grid[y][x])) odblokowane += wolne(...sasiedzi[0]);
  }
  console.log(`Odblokowane pola pod NPC/mobami/przejściami: ${odblokowane}`);

  await db.query('DELETE FROM blokadaprzejscia WHERE mapa=?', [MAP_ID]);
  const wiersze = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (grid[y][x]) wiersze.push([MAP_ID, x, y]);
  for (let i = 0; i < wiersze.length; i += 500) {
    const part = wiersze.slice(i, i + 500);
    await db.query(`INSERT INTO blokadaprzejscia (mapa,x,y) VALUES ${part.map(() => '(?,?,?)').join(',')}`, part.flat());
  }
  console.log(`Zapisano ${wiersze.length} pól kolizji.`);

  // Mapa startowa i miejsce odrodzenia
  const cfg = { starting_map: String(MAP_ID), starting_x: String(SPAWN.x), starting_y: String(SPAWN.y), dead_respawn_map: String(MAP_ID) };
  for (const [k, v] of Object.entries(cfg)) {
    await db.query(
      'INSERT INTO server_config (config_key, config_value) VALUES (?,?) ON DUPLICATE KEY UPDATE config_value=VALUES(config_value)',
      [k, v]
    );
  }
  console.log('Mapa startowa ustawiona na Ithan', SPAWN);

  // Wszystkie postacie lądują na spawnie
  const [res] = await db.query('UPDATE postac SET mapa=?, x=?, y=? WHERE 1', [MAP_ID, SPAWN.x, SPAWN.y]);
  console.log(`Przeniesiono postaci: ${res.affectedRows}`);
  console.log('Gotowe. Zrestartuj serwer gry, żeby odświeżyć pamięć map.');
}

main().then(() => process.exit(0)).catch(e => { console.error('Instalacja mapy nieudana:', e); process.exit(1); });
