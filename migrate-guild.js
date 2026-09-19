require('dotenv').config({ path: require('path').join(__dirname, 'server/.env') });
const db = require('./server/src/db');

async function run() {
  const stmts = [
    `ALTER TABLE gilde ADD COLUMN IF NOT EXISTS ogloszenie VARCHAR(1000) DEFAULT ''`,
    `ALTER TABLE gilde ADD COLUMN IF NOT EXISTS skarbiec INT DEFAULT 0`,
    `ALTER TABLE gilde ADD COLUMN IF NOT EXISTS otwarta TINYINT DEFAULT 1`,
    `ALTER TABLE gilde ADD COLUMN IF NOT EXISTS lvl INT DEFAULT 1`,
    `ALTER TABLE gilde ADD COLUMN IF NOT EXISTS gildia_exp BIGINT DEFAULT 0`,
    `ALTER TABLE gilde ADD COLUMN IF NOT EXISTS terytorium_mapa INT DEFAULT 0`,

    `ALTER TABLE gildia_czlonkowie ADD COLUMN IF NOT EXISTS wklad_gold INT DEFAULT 0`,
    `ALTER TABLE gildia_czlonkowie ADD COLUMN IF NOT EXISTS wklad_kills INT DEFAULT 0`,
    `ALTER TABLE gildia_czlonkowie ADD COLUMN IF NOT EXISTS wklad_exp BIGINT DEFAULT 0`,
    `ALTER TABLE gildia_czlonkowie ADD COLUMN IF NOT EXISTS data_dolaczenia TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    `ALTER TABLE gildia_czlonkowie ADD COLUMN IF NOT EXISTS niestandardowa_ranga VARCHAR(50) DEFAULT NULL`,

    `CREATE TABLE IF NOT EXISTS gildia_rangi (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gildia_id INT NOT NULL,
      nazwa VARCHAR(50) NOT NULL,
      poziom TINYINT DEFAULT 0,
      moze_zapraszac TINYINT DEFAULT 0,
      moze_kickowac TINYINT DEFAULT 0,
      moze_skarbiec TINYINT DEFAULT 0,
      FOREIGN KEY (gildia_id) REFERENCES gilde(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS gildia_podania (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gildia_id INT NOT NULL,
      postac_id INT NOT NULL,
      postac_nazwa VARCHAR(100),
      tresc VARCHAR(500) DEFAULT '',
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('oczekuje','zaakceptowano','odrzucono') DEFAULT 'oczekuje',
      UNIQUE KEY uniq_app (gildia_id, postac_id, status)
    )`,

    `CREATE TABLE IF NOT EXISTS gildia_skarbiec_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gildia_id INT NOT NULL,
      postac_id INT NOT NULL,
      postac_nazwa VARCHAR(100),
      typ ENUM('wplata','wyplata') NOT NULL,
      kwota INT NOT NULL,
      opis VARCHAR(200) DEFAULT '',
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS gildia_bonusy (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gildia_id INT NOT NULL UNIQUE,
      bonus_exp TINYINT DEFAULT 0,
      bonus_healing TINYINT DEFAULT 0,
      bonus_crit TINYINT DEFAULT 0,
      bonus_defense TINYINT DEFAULT 0,
      FOREIGN KEY (gildia_id) REFERENCES gilde(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS gildia_wojny (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gildia_atakujaca INT NOT NULL,
      nazwa_atakujacej VARCHAR(75),
      gildia_broniac INT NOT NULL,
      nazwa_broniacej VARCHAR(75),
      data_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      data_koniec TIMESTAMP NULL,
      punkty_atakujaca INT DEFAULT 0,
      punkty_broniac INT DEFAULT 0,
      bonus_exp_zwyciezcy INT DEFAULT 10,
      status ENUM('aktywna','zakonczona') DEFAULT 'aktywna'
    )`,

    `CREATE TABLE IF NOT EXISTS gildia_relacje (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gildia1_id INT NOT NULL,
      gildia1_nazwa VARCHAR(75),
      gildia2_id INT NOT NULL,
      gildia2_nazwa VARCHAR(75),
      typ ENUM('przymierze','wrogosc') NOT NULL,
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_rel (gildia1_id, gildia2_id)
    )`,

    `CREATE TABLE IF NOT EXISTS gildia_misje (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gildia_id INT NOT NULL,
      nazwa VARCHAR(100),
      opis VARCHAR(500),
      typ ENUM('kill','gold_collect','members_online') DEFAULT 'kill',
      cel_ilosc INT DEFAULT 100,
      postep INT DEFAULT 0,
      nagroda_gold INT DEFAULT 500,
      nagroda_exp INT DEFAULT 200,
      data_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      data_koniec TIMESTAMP NULL,
      status ENUM('aktywna','zakonczona','wygasla') DEFAULT 'aktywna'
    )`,

    `CREATE TABLE IF NOT EXISTS gildia_terytorium (
      mapa_id INT PRIMARY KEY,
      gildia_id INT NOT NULL,
      gildia_nazwa VARCHAR(75),
      data_zajecia TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS gildia_rajdy (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gildia_id INT NOT NULL,
      gildia_nazwa VARCHAR(75),
      min_czlonkow INT DEFAULT 3,
      nagroda_gold INT DEFAULT 1000,
      nagroda_exp INT DEFAULT 500,
      status ENUM('aktywny','zakończony') DEFAULT 'aktywny',
      data_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      data_koniec TIMESTAMP NULL,
      uczestnicy TEXT DEFAULT '[]'
    )`,
  ];

  let ok = 0, fail = 0;
  for (const sql of stmts) {
    try {
      await db.query(sql);
      ok++;
      console.log('OK:', sql.slice(0, 60).replace(/\s+/g, ' ').trim());
    } catch (e) {
      fail++;
      console.warn('SKIP:', e.message.slice(0, 100));
    }
  }
  console.log(`\nDone: ${ok} OK, ${fail} skipped/failed`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
