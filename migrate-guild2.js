require('dotenv').config({ path: require('path').join(__dirname, 'server/.env') });
const db = require('./server/src/db');

async function run() {
  const stmts = [
    `CREATE TABLE IF NOT EXISTS gildia_rangi (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gildia_id INT NOT NULL,
      nazwa VARCHAR(50) NOT NULL,
      poziom TINYINT DEFAULT 0,
      moze_zapraszac TINYINT DEFAULT 0,
      moze_kickowac TINYINT DEFAULT 0,
      moze_skarbiec TINYINT DEFAULT 0
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci`,

    `CREATE TABLE IF NOT EXISTS gildia_bonusy (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gildia_id INT NOT NULL UNIQUE,
      bonus_exp TINYINT DEFAULT 0,
      bonus_healing TINYINT DEFAULT 0,
      bonus_crit TINYINT DEFAULT 0,
      bonus_defense TINYINT DEFAULT 0
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci`,
  ];

  for (const sql of stmts) {
    try {
      await db.query(sql);
      console.log('OK:', sql.slice(0, 60).replace(/\s+/g, ' ').trim());
    } catch (e) {
      console.warn('FAIL:', e.message.slice(0, 120));
    }
  }
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
