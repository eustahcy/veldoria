const db = require('../db');

async function run() {
  console.log('Running Phase 8 migration: prestige columns...');

  await db.query(`ALTER TABLE postac ADD COLUMN IF NOT EXISTS prestige INT DEFAULT 0`);
  await db.query(`ALTER TABLE postac ADD COLUMN IF NOT EXISTS prestige_bonus_pct INT DEFAULT 0`);

  console.log('Phase 8 migration complete!');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
