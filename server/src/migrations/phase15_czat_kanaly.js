// Phase 15: kanały czatu (lokalny / globalny / handel).
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../db');

async function run() {
  await db.query("ALTER TABLE chat ADD COLUMN IF NOT EXISTS kanal VARCHAR(12) NOT NULL DEFAULT 'lokalny'");
  await db.query('ALTER TABLE chat ADD INDEX IF NOT EXISTS idx_kanal (kanal, id)');
  console.log('Phase 15: chat.kanal gotowe.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
