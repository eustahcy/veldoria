// Phase 17: opis widoczny na profilu gracza ("Informacje dodatkowe").
require('dotenv').config({ path: require('path').join(__dirname, '../../.env'), quiet: true });
const db = require('../db');

async function run() {
  await db.query("ALTER TABLE postac ADD COLUMN IF NOT EXISTS opis VARCHAR(300) NOT NULL DEFAULT ''");
  console.log('Phase 17: postac.opis gotowe.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
