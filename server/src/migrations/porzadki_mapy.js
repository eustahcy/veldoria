// Zostawia w świecie tylko jedną mapę (domyślnie „Osada Veldoria”) i sprząta po reszcie:
// przenosi postacie na spawn, kasuje moby, NPC, przejścia i kolizje usuniętych map.
//
// Uruchamiaj z katalogu projektu:  node server/src/migrations/porzadki_mapy.js [nazwa mapy]
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true });
const db = require('../db');

const NAZWA = process.argv[2] || 'Osada Veldoria';

async function main() {
  const [[mapa]] = await db.query('SELECT id, nazwa, maks_x, maks_y FROM mapa WHERE nazwa=? LIMIT 1', [NAZWA]);
  if (!mapa) throw new Error(`Nie ma mapy „${NAZWA}" — najpierw ją wygeneruj`);

  const spawnX = Number((await db.query("SELECT config_value v FROM server_config WHERE config_key='starting_x'"))[0][0]?.v) || Math.floor(mapa.maks_x / 2);
  const spawnY = Number((await db.query("SELECT config_value v FROM server_config WHERE config_key='starting_y'"))[0][0]?.v) || Math.floor(mapa.maks_y / 2);

  const [inne] = await db.query('SELECT id, nazwa FROM mapa WHERE id<>?', [mapa.id]);
  console.log(`Zostaje: #${mapa.id} ${mapa.nazwa}. Do usunięcia: ${inne.length} map.`);

  // 1. Postacie z innych map lądują na spawnie
  const [p] = await db.query('UPDATE postac SET mapa=?, x=?, y=? WHERE mapa<>?', [mapa.id, spawnX, spawnY, mapa.id]);
  console.log(`Przeniesiono postaci: ${p.affectedRows}`);

  // 2. Zawartość pozostałych map
  for (const [tabela, kolumna] of [['mob', 'mapa'], ['npc', 'mapa'], ['blokadaprzejscia', 'mapa'], ['mapa_przenies', 'mapa']]) {
    const [r] = await db.query(`DELETE FROM ${tabela} WHERE ${kolumna}<>?`, [mapa.id]);
    console.log(`  ${tabela}: usunięto ${r.affectedRows}`);
  }
  // przejścia prowadzące donikąd (np. brama do skasowanej mapy)
  const [r2] = await db.query('DELETE FROM mapa_przenies WHERE do_mapa<>?', [mapa.id]);
  console.log(`  przejścia do usuniętych map: ${r2.affectedRows}`);

  // 3. Same mapy
  const [r3] = await db.query('DELETE FROM mapa WHERE id<>?', [mapa.id]);
  console.log(`  mapy: usunięto ${r3.affectedRows}`);

  // 4. Ustawienia świata wskazują na jedyną mapę
  for (const [k, v] of Object.entries({
    starting_map: String(mapa.id), starting_x: String(spawnX), starting_y: String(spawnY), dead_respawn_map: String(mapa.id),
  })) {
    await db.query(
      'INSERT INTO server_config (config_key, config_value) VALUES (?,?) ON DUPLICATE KEY UPDATE config_value=VALUES(config_value)', [k, v]);
  }
  await db.query('UPDATE mapa SET dead_map=?, dead_x=?, dead_y=? WHERE id=?', [mapa.id, spawnX, spawnY, mapa.id]);

  const [[ile]] = await db.query('SELECT COUNT(*) c FROM mapa');
  console.log(`Gotowe. Map w świecie: ${ile.c}. Zrestartuj serwer, żeby odświeżyć pamięć map.`);
}

main().then(() => process.exit(0)).catch(e => { console.error('Porządki nieudane:', e.message); process.exit(1); });
