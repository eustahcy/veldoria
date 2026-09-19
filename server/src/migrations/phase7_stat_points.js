const db = require('../db');

async function run() {
  console.log('Running Phase 7 migration: stat points...');

  // Free distributable stat points earned each level-up (3 per level)
  await db.query(`ALTER TABLE postac ADD COLUMN IF NOT EXISTS wolne_punkty_stat INT DEFAULT 0`);

  console.log('Phase 7 migration complete!');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
