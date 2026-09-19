const db = require('../db');

async function run() {
  console.log('Running Phase 6 migration: zones...');
  await db.query(`ALTER TABLE mapa ADD COLUMN IF NOT EXISTS strefy TEXT DEFAULT NULL`);
  console.log('Phase 6 migration complete!');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
