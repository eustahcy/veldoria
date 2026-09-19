// Phase 16: godzina wysłania wiadomości czatu (wyświetlana w oknie czatu).
require('dotenv').config({ path: require('path').join(__dirname, '../../.env'), quiet: true });
const db = require('../db');

async function run() {
  await db.query('ALTER TABLE chat ADD COLUMN IF NOT EXISTS czas DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
  console.log('Phase 16: chat.czas gotowe.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
