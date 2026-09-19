'use strict';
const db = require('../db');

async function run() {
  console.log('Migracja dungeonów v2...');

  // ── Tabele ──────────────────────────────────────────────────────────────────
  await db.query(`CREATE TABLE IF NOT EXISTS dungeon_def (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nazwa       VARCHAR(100) NOT NULL,
    opis        TEXT,
    typ         VARCHAR(30) DEFAULT 'loch',
    min_poziom  INT DEFAULT 1,
    max_graczy  INT DEFAULT 4,
    pietra      INT DEFAULT 3,
    czas_limit_min INT DEFAULT 30,
    image       VARCHAR(150) DEFAULT 'mapy/zniszcze-opactwo.2.png',
    exp_base    INT DEFAULT 500,
    gold_base   INT DEFAULT 200,
    loot_boss   JSON DEFAULT NULL,
    aktywny     TINYINT DEFAULT 1
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await db.query(`CREATE TABLE IF NOT EXISTS dungeon_floor_def (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    dungeon_id      INT NOT NULL,
    floor_num       INT NOT NULL,
    typ             VARCHAR(20) DEFAULT 'arena',
    nazwa           VARCHAR(100),
    mob_count       INT DEFAULT 5,
    mob_level_bonus INT DEFAULT 0,
    INDEX idx_dfd (dungeon_id, floor_num)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await db.query(`CREATE TABLE IF NOT EXISTS dungeon_sesje2 (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    dungeon_id      INT NOT NULL,
    mapa_id         INT NOT NULL,
    status          VARCHAR(20) DEFAULT 'aktywna',
    trudnosc        VARCHAR(20) DEFAULT 'normalny',
    \`piętro_obecne\` INT DEFAULT 1,
    modyfikatory    JSON,
    cele_ukonczone  JSON DEFAULT '[]',
    zgony           INT DEFAULT 0,
    data_start      DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_wygasniecia DATETIME,
    czas_ukonczenia INT DEFAULT NULL,
    wynik           VARCHAR(2) DEFAULT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await db.query(`CREATE TABLE IF NOT EXISTS dungeon_gracze2 (
    sesja_id     INT NOT NULL,
    postac_id    INT NOT NULL,
    postac_nazwa VARCHAR(100),
    zgony        INT DEFAULT 0,
    dolaczono    DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sesja_id, postac_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await db.query(`CREATE TABLE IF NOT EXISTS dungeon_floor_state (
    sesja_id      INT NOT NULL,
    floor_num     INT NOT NULL,
    mob_ids       JSON,
    total         INT DEFAULT 0,
    boss_mob_id   INT DEFAULT NULL,
    boss_hp       INT DEFAULT NULL,
    boss_max_hp   INT DEFAULT NULL,
    boss_faza     TINYINT DEFAULT 1,
    chest_claimed TINYINT DEFAULT 0,
    status        VARCHAR(20) DEFAULT 'aktywne',
    PRIMARY KEY (sesja_id, floor_num)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await db.query(`CREATE TABLE IF NOT EXISTS dungeon_cooldowns (
    postac_id  INT NOT NULL,
    dungeon_id INT NOT NULL,
    trudnosc   VARCHAR(20) NOT NULL,
    wygasa     DATETIME,
    PRIMARY KEY (postac_id, dungeon_id, trudnosc)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await db.query(`CREATE TABLE IF NOT EXISTS dungeon_historia (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    postac_id    INT NOT NULL,
    dungeon_id   INT NOT NULL,
    trudnosc     VARCHAR(20),
    wynik        VARCHAR(2),
    czas_s       INT,
    zgony        INT DEFAULT 0,
    exp_zdobyte  INT DEFAULT 0,
    gold_zdobyte INT DEFAULT 0,
    data         DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_dh (postac_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  console.log('Tabele OK');

  // ── Seed dungeonów ───────────────────────────────────────────────────────────
  await db.query('DELETE FROM dungeon_floor_def WHERE dungeon_id IN (SELECT id FROM dungeon_def)');
  await db.query('DELETE FROM dungeon_def');

  const dungeons = [
    { nazwa:'Krypty Grozy',          opis:'Opuszczone krypty pełne nieumarłych strażników.',    typ:'loch',     min:1,  floors:3, limit:25, exp:400,  gold:150, image:'mapy/zniszcze-opactwo.2.png' },
    { nazwa:'Ruiny Starożytnych Magów', opis:'Zaczarowane ruiny kryjące sekrety zaklęć.',       typ:'ruiny',    min:12, floors:4, limit:30, exp:800,  gold:300, image:'mapy/zniszcze-opactwo.2.png' },
    { nazwa:'Wulkaniczne Komnaty',   opis:'Płonące pieczary zamieszkałe przez ogniste golemy.', typ:'wulkan',   min:25, floors:4, limit:35, exp:1400, gold:500, image:'mapy/zniszcze-opactwo.2.png' },
    { nazwa:'Lodowe Jaskinie',       opis:'Zamarznięte korytarze gdzie czas stoi w miejscu.',   typ:'mrozny',   min:40, floors:5, limit:40, exp:2200, gold:800, image:'mapy/zniszcze-opactwo.2.png' },
    { nazwa:'Mechaniczne Podziemia', opis:'Starożytna fabryka z niszczycielskimi golemami.',    typ:'podziemia',min:60, floors:5, limit:45, exp:3500, gold:1200, image:'mapy/zniszcze-opactwo.2.png' },
  ];

  for (const d of dungeons) {
    const [r] = await db.query(
      'INSERT INTO dungeon_def(nazwa,opis,typ,min_poziom,pietra,czas_limit_min,exp_base,gold_base,image) VALUES(?,?,?,?,?,?,?,?,?)',
      [d.nazwa,d.opis,d.typ,d.min,d.floors,d.limit,d.exp,d.gold,d.image]
    );
    const id = r.insertId;
    const floorTypes = getFloorTypes(d.floors);
    for (let i=0; i<floorTypes.length; i++) {
      const ft = floorTypes[i];
      await db.query(
        'INSERT INTO dungeon_floor_def(dungeon_id,floor_num,typ,nazwa,mob_count,mob_level_bonus) VALUES(?,?,?,?,?,?)',
        [id, i+1, ft.typ, ft.nazwa, ft.mob_count, ft.level_bonus]
      );
    }
    console.log(`  Dungeon: ${d.nazwa} (${d.floors} pięter)`);
  }

  console.log('Seed OK. Migracja zakończona.');
  process.exit(0);
}

function getFloorTypes(total) {
  const templates = {
    3: [
      { typ:'arena',    nazwa:'Wejście',         mob_count:5, level_bonus:0 },
      { typ:'elite',    nazwa:'Sala Strażnika',   mob_count:4, level_bonus:1 },
      { typ:'boss',     nazwa:'Komnata Władcy',   mob_count:1, level_bonus:3 },
    ],
    4: [
      { typ:'arena',    nazwa:'Pierwsza Komnata', mob_count:5, level_bonus:0 },
      { typ:'shrine',   nazwa:'Kaplica',          mob_count:0, level_bonus:0 },
      { typ:'elite',    nazwa:'Elitarni Strażnicy',mob_count:5,level_bonus:2 },
      { typ:'boss',     nazwa:'Sala Bossa',        mob_count:1, level_bonus:4 },
    ],
    5: [
      { typ:'arena',    nazwa:'Przedsionek',      mob_count:5, level_bonus:0 },
      { typ:'treasure', nazwa:'Skarbiec',          mob_count:0, level_bonus:0 },
      { typ:'elite',    nazwa:'Sala Elity',        mob_count:6, level_bonus:2 },
      { typ:'shrine',   nazwa:'Kaplica Siły',      mob_count:0, level_bonus:0 },
      { typ:'boss',     nazwa:'Trono Sala',        mob_count:1, level_bonus:5 },
    ],
  };
  return templates[total] || templates[3];
}

run().catch(e => { console.error(e.message); process.exit(1); });
