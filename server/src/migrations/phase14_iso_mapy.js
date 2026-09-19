// Phase 14: kafle izometryczne map.
//
// mapa.kafle — JSON { "x,y": { t: "teren", o: "obiekt" } }, rysowany przez
// edytor izometryczny i klienta. mapa.iso = 1 włącza widok izometryczny dla mapy.
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../db');

async function run() {
  await db.query(`ALTER TABLE mapa
    ADD COLUMN IF NOT EXISTS kafle LONGTEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS iso TINYINT NOT NULL DEFAULT 0`);
  console.log('Phase 14: mapa.kafle + mapa.iso gotowe.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
