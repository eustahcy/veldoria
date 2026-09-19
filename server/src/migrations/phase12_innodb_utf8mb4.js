// Phase 12: MyISAM → InnoDB oraz utf8 → utf8mb4
//
// Dlaczego:
//  - MyISAM ignoruje transakcje (START TRANSACTION / ROLLBACK nic nie robią),
//    więc db.withTransaction() chroni dane dopiero po tej migracji.
//  - utf8 w MySQL/MariaDB to 3 bajty — emoji w czacie/nazwach nie da się zapisać.
//
// Użycie (z katalogu server/):
//   node src/migrations/phase12_innodb_utf8mb4.js          — tylko pokazuje plan
//   node src/migrations/phase12_innodb_utf8mb4.js --apply  — wykonuje zmiany
//
// PRZED --apply zrób kopię bazy, np.:
//   mysqldump -u <user> -p <baza> > backup-przed-phase12.sql
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../db');

const APPLY = process.argv.includes('--apply');
const TARGET_COLLATION = 'utf8mb4_polish_ci';

async function run() {
  const [[{ dbName }]] = await db.query('SELECT DATABASE() AS dbName');
  const [tables] = await db.query(
    `SELECT TABLE_NAME AS name, ENGINE AS engine, TABLE_COLLATION AS coll
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
     ORDER BY TABLE_NAME`
  );

  const plan = [];
  for (const t of tables) {
    if (t.engine !== 'InnoDB') plan.push({ table: t.name, sql: `ALTER TABLE \`${t.name}\` ENGINE=InnoDB`, what: `${t.engine} → InnoDB` });
    if (!String(t.coll || '').startsWith('utf8mb4')) {
      plan.push({
        table: t.name,
        sql: `ALTER TABLE \`${t.name}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE ${TARGET_COLLATION}`,
        what: `${t.coll} → ${TARGET_COLLATION}`,
      });
    }
  }
  // Herb gildii — kod (admin/assets) zapisuje gilde.obrazek, a kolumny nie było
  plan.push({
    table: 'gilde',
    sql: 'ALTER TABLE gilde ADD COLUMN IF NOT EXISTS obrazek VARCHAR(255) DEFAULT NULL',
    what: 'kolumna obrazek (herb gildii)',
  });

  console.log(`Baza: ${dbName} — tabel: ${tables.length}, operacji: ${plan.length}\n`);
  for (const p of plan) console.log(`  ${p.table.padEnd(28)} ${p.what}`);

  if (!APPLY) {
    console.log('\nTryb podglądu. Zrób backup bazy i uruchom ponownie z --apply.');
    return 0;
  }

  console.log('\nWykonuję...');
  await db.query(`ALTER DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE ${TARGET_COLLATION}`);
  const failed = [];
  for (const p of plan) {
    try {
      await db.query(p.sql);
      console.log(`  OK    ${p.table} — ${p.what}`);
    } catch (e) {
      failed.push(p);
      console.error(`  BŁĄD  ${p.table} — ${p.what}: ${e.message}`);
    }
  }
  console.log(failed.length
    ? `\nZakończono z błędami (${failed.length}). Pozostałe tabele przekonwertowane — migrację można uruchomić ponownie.`
    : '\nPhase 12 zakończona.');
  return failed.length ? 1 : 0;
}

run()
  .then(code => process.exit(code))
  .catch(e => { console.error(e); process.exit(1); });
