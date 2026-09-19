// Phase 4 DB Migration: Crafting, Fishing, Talents
const db = require('../db');

async function run() {
  console.log('Running Phase 4 migrations...');

  // ── CRAFTING TABLES ───────────────────────────────────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS surowce (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nazwa VARCHAR(100) NOT NULL,
      opis VARCHAR(300) DEFAULT '',
      obrazek VARCHAR(200) DEFAULT 'items/default.gif',
      rzadkosc ENUM('pospolity','rzadki','epicki') DEFAULT 'pospolity'
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS mob_surowce (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mob_nazwa VARCHAR(100) DEFAULT '*',
      surowiec_id INT NOT NULL,
      szansa INT DEFAULT 20
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS postac_surowce (
      postac_id INT NOT NULL,
      surowiec_id INT NOT NULL,
      ilosc INT DEFAULT 0,
      PRIMARY KEY (postac_id, surowiec_id)
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS receptury (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nazwa VARCHAR(100) NOT NULL,
      opis VARCHAR(300) DEFAULT '',
      przedmiot_wynikowy_id INT NOT NULL,
      wynik_ilosc INT DEFAULT 1,
      wymagany_poziom INT DEFAULT 1,
      czas_craftu_s INT DEFAULT 5,
      aktywna TINYINT DEFAULT 1
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS receptury_skladniki (
      receptura_id INT NOT NULL,
      surowiec_id INT NOT NULL,
      ilosc INT DEFAULT 1
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS postac_receptury (
      postac_id INT NOT NULL,
      receptura_id INT NOT NULL,
      PRIMARY KEY (postac_id, receptura_id)
    )
  `);

  // ── FISHING TABLES ────────────────────────────────────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS ryby (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nazwa VARCHAR(100) NOT NULL,
      rzadkosc ENUM('pospolita','rzadka','epicka','legendarna') DEFAULT 'pospolita',
      min_poziom INT DEFAULT 1,
      efekt_typ VARCHAR(50) DEFAULT NULL,
      efekt_wartosc INT DEFAULT 0,
      wartosc_sprzedazy INT DEFAULT 10,
      surowiec_ilosc INT DEFAULT 1
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS postac_wedkarstwo (
      postac_id INT PRIMARY KEY,
      ryby_zlapane INT DEFAULT 0,
      zloty_haczyk TINYINT DEFAULT 0
    )
  `);

  // ── TALENT TABLES ─────────────────────────────────────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS talenty (
      id INT AUTO_INCREMENT PRIMARY KEY,
      klasa VARCHAR(50) NOT NULL,
      sciezka VARCHAR(50) NOT NULL,
      pozycja INT DEFAULT 1,
      nazwa VARCHAR(100) NOT NULL,
      opis VARCHAR(300) DEFAULT '',
      ikona VARCHAR(10) DEFAULT '⭐',
      efekt_typ VARCHAR(50) DEFAULT NULL,
      efekt_wartosc_per_lvl INT DEFAULT 1,
      max_poziom INT DEFAULT 5,
      wymaga_talent_id INT DEFAULT NULL,
      wymaga_sciezka_punkty INT DEFAULT 0
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS postac_talenty (
      postac_id INT NOT NULL,
      talent_id INT NOT NULL,
      poziom INT DEFAULT 0,
      PRIMARY KEY (postac_id, talent_id)
    )
  `);
  await db.query(`
    ALTER TABLE postac ADD COLUMN IF NOT EXISTS punkty_talentow INT DEFAULT 0
  `);

  console.log('Tables created OK');

  // ── SEED SUROWCE ─────────────────────────────────────────────────────────────
  await db.query(`
    INSERT IGNORE INTO surowce (id,nazwa,opis,rzadkosc) VALUES
    (1,'Kość Szczura','Zebrana z pokonanego szczura','pospolity'),
    (2,'Skóra Goblina','Wytrzymała skóra goblina','pospolity'),
    (3,'Kryształ Magii','Świecący kryształ pełen energii','rzadki'),
    (4,'Pióro Orła','Lekkie pióro nocnego orła','rzadki'),
    (5,'Zęby Wilka','Ostre zęby wilka','pospolity'),
    (6,'Rdzeń Bazyliszka','Trujący rdzeń bazyliszka','epicki'),
    (7,'Łuska Żmii','Twarda łuska żmii','pospolity'),
    (8,'Sierść Kotolaka','Miękka sierść kotolaka','rzadki'),
    (9,'Pazur Pająka','Ostry pazur dużego pająka','pospolity'),
    (10,'Esencja Mroku','Mroczna esencja z podziemi','epicki')
  `);
  await db.query(`
    INSERT IGNORE INTO mob_surowce (mob_nazwa,surowiec_id,szansa) VALUES
    ('Szczur',1,40),('Stary Szczur',1,60),
    ('Goblin',2,35),('Goblin Zbójca',2,50),('Goblin Łucznik',2,60),
    ('Zając',4,25),('Szybki Zając',4,40),
    ('Żmija',7,45),
    ('Kotolak',8,30),
    ('*',3,5)
  `);
  console.log('Surowce seeded OK');

  // ── SEED RYBY ─────────────────────────────────────────────────────────────────
  await db.query(`
    INSERT IGNORE INTO ryby (id,nazwa,rzadkosc,min_poziom,efekt_typ,efekt_wartosc,wartosc_sprzedazy) VALUES
    (1,'Karaś','pospolita',1,NULL,0,5),
    (2,'Szczupak','pospolita',1,NULL,0,10),
    (3,'Karp','pospolita',1,'hp_regen',20,8),
    (4,'Pstrąg','rzadka',5,NULL,0,25),
    (5,'Łosoś','rzadka',5,'exp_bonus',10,40),
    (6,'Złota Ryba','epicka',15,NULL,0,200),
    (7,'Ryba Roczna','epicka',10,'hp_regen',100,150),
    (8,'Smok Wody','legendarna',30,NULL,0,1000)
  `);
  console.log('Ryby seeded OK');

  // ── SEED TALENTY ─────────────────────────────────────────────────────────────
  // Wojownik IDs 1-15
  const talentData = [
    // Wojownik — Ścieżka Tarczy (IDs 1-5)
    [1,'Wojownik','tarcza',1,'Hartowanie Tarczy','Zwiększa pancerz z wyposażonej tarczy','🛡','bonus_ac',2,5,null,0],
    [2,'Wojownik','tarcza',2,'Blok Mistrza','Zwiększa szansę na blok ataku','🛡','bonus_blok',3,5,1,2],
    [3,'Wojownik','tarcza',3,'Regeneracja Bojowa','Regeneruje HP po walce','💚','hp_regen',5,5,2,4],
    [4,'Wojownik','tarcza',4,'Wytrzymałość','Zwiększa maksymalne HP','❤️','bonus_hp',20,5,3,6],
    [5,'Wojownik','tarcza',5,'Kontratak','Szansa na kontratak przy blokowaniu','⚡','kontra',2,5,4,8],
    // Wojownik — Ścieżka Miecza (IDs 6-10)
    [6,'Wojownik','miecz',1,'Precyzja Ostrza','Zwiększa obrażenia od broni','⚔️','bonus_dmg',2,5,null,0],
    [7,'Wojownik','miecz',2,'Krytyczny Cios','Zwiększa szansę na cios krytyczny','💥','bonus_crit',1,5,6,2],
    [8,'Wojownik','miecz',3,'Przebicie Pancerza','Ignoruje część pancerza wroga','🗡','bonus_przebicie',3,5,7,4],
    [9,'Wojownik','miecz',4,'Podwójny Atak','Szansa na zadanie dodatkowego ciosu','⚔️','bonus_dmg',3,5,8,6],
    [10,'Wojownik','miecz',5,'Weteran Bitew','Zwiększa zdobywane doświadczenie','⭐','bonus_exp',3,5,9,8],
    // Wojownik — Ścieżka Weterana (IDs 11-15)
    [11,'Wojownik','weteran',1,'Zbroja Weterana','Pasywnie zwiększa pancerz','🛡','bonus_ac',1,5,null,0],
    [12,'Wojownik','weteran',2,'Stara Krew','Zwiększa maksymalne punkty życia','❤️','bonus_hp',30,5,11,2],
    [13,'Wojownik','weteran',3,'Szybkość Ataku','Zwiększa szybkość ataku','⚡','bonus_sa',2,5,12,4],
    [14,'Wojownik','weteran',4,'Dobra Kondycja','Zwiększa efektywność leczenia','💊','bonus_hp',15,5,13,6],
    [15,'Wojownik','weteran',5,'Druhna Śmierci','Raz na 5 min przeżyjesz śmiertelny cios','💀','bonus_hp',50,5,14,8],
    // Mag IDs 16-30
    [16,'Mag','ogien',1,'Ogniste Szczyty','Zwiększa obrażenia magiczne','🔥','bonus_obr_mag',3,5,null,0],
    [17,'Mag','ogien',2,'Pieczęć Ognia','Zwiększa szansę na cios krytyczny magii','💥','bonus_crit',2,5,16,2],
    [18,'Mag','ogien',3,'Penetracja Magii','Ignoruje część odporności magicznej','✨','bonus_przebicie',5,5,17,4],
    [19,'Mag','ogien',4,'Żar Wulkanu','Zwiększa obrażenia magiczne z ogniem','🌋','bonus_obr_mag',5,5,18,6],
    [20,'Mag','ogien',5,'Mistrz Ognia','Zwiększa zdobywane doświadczenie','⭐','bonus_exp',5,5,19,8],
    // Mag — Ścieżka Lodu (IDs 21-25)
    [21,'Mag','lod',1,'Lodowy Dotyk','Spowalnia wrogów','❄️','bonus_ac',2,5,null,0],
    [22,'Mag','lod',2,'Lodowa Tarcza','Absorpcja obrażeń fizycznych','🧊','bonus_ac',3,5,21,2],
    [23,'Mag','lod',3,'Mur Lodu','Tarcza lodowa absorbuje obrażenia','🧊','bonus_hp',15,5,22,4],
    [24,'Mag','lod',4,'Mróz','Zwiększa punkty życia','❄️','bonus_hp',15,5,23,6],
    [25,'Mag','lod',5,'Mana Lodowa','Zwiększa manę i odporność','🔮','bonus_hp',20,5,24,8],
    // Mag — Ścieżka Błyskawicy (IDs 26-30)
    [26,'Mag','blyskawica',1,'Iskra','Zwiększa szybkość ataku','⚡','bonus_sa',3,5,null,0],
    [27,'Mag','blyskawica',2,'Piorun','Szansa na dodatkowy cios','⚡','bonus_dmg',2,5,26,2],
    [28,'Mag','blyskawica',3,'Łańcuch Błyskawic','Zwiększa obrażenia','🌩','bonus_dmg',3,5,27,4],
    [29,'Mag','blyskawica',4,'Uderzenie Groma','Zwiększa obrażenia krytyczne','💥','bonus_crit',1,5,28,6],
    [30,'Mag','blyskawica',5,'Władca Burz','Zwiększa szybkość ataku','⚡','bonus_sa',4,5,29,8],
    // Paladyn IDs 31-45
    [31,'Paladyn','swiety',1,'Święta Tarcza','Zwiększa pancerz i ochronę','⛨','bonus_ac',2,5,null,0],
    [32,'Paladyn','swiety',2,'Błogosławiony Blok','Zwiększa szansę na blok','🛡','bonus_blok',3,5,31,2],
    [33,'Paladyn','swiety',3,'Boska Ochrona','Zwiększa maksymalne HP','❤️','bonus_hp',25,5,32,4],
    [34,'Paladyn','swiety',4,'Aura Światła','Zwiększa pancerz','⭐','bonus_ac',3,5,33,6],
    [35,'Paladyn','swiety',5,'Bastion Wiary','Zwiększa wszystkie obrony','🛡','bonus_hp',40,5,34,8],
    // Paladyn — Uzdrowienie (IDs 36-40)
    [36,'Paladyn','uzdrowienie',1,'Dotyk Uzdrowiciela','Zwiększa efektywność leczenia','💊','bonus_hp',20,5,null,0],
    [37,'Paladyn','uzdrowienie',2,'Błogosławieństwo','Zwiększa HP regenerowane w walce','💚','hp_regen',10,5,36,2],
    [38,'Paladyn','uzdrowienie',3,'Święte Słowo','Zwiększa moc leczenia','✨','bonus_hp',30,5,37,4],
    [39,'Paladyn','uzdrowienie',4,'Odrodzenie','Zwiększa szybkość ataku','⚡','bonus_sa',2,5,38,6],
    [40,'Paladyn','uzdrowienie',5,'Boskie Odrodzenie','Zwiększa maksymalne HP','❤️','bonus_hp',50,5,39,8],
    // Paladyn — Kara (IDs 41-45)
    [41,'Paladyn','kara',1,'Kara Boska','Zwiększa obrażenia od ataków','⚔️','bonus_dmg',2,5,null,0],
    [42,'Paladyn','kara',2,'Krucjata','Zwiększa obrażenia krytyczne','💥','bonus_crit',1,5,41,2],
    [43,'Paladyn','kara',3,'Sąd Ostateczny','Zwiększa obrażenia magiczne','✨','bonus_obr_mag',3,5,42,4],
    [44,'Paladyn','kara',4,'Zemsta Niebios','Zwiększa przebicie pancerza','🗡','bonus_przebicie',3,5,43,6],
    [45,'Paladyn','kara',5,'Gniew Boga','Zwiększa doświadczenie','⭐','bonus_exp',4,5,44,8],
    // Tancerz Ostrzy IDs 46-60
    [46,'Tancerz Ostrzy','szybkosc',1,'Taniec Ostrzy','Zwiększa szybkość ataku','⚡','bonus_sa',3,5,null,0],
    [47,'Tancerz Ostrzy','szybkosc',2,'Wirujący Miecz','Szansa na dodatkowy cios','⚔️','bonus_dmg',2,5,46,2],
    [48,'Tancerz Ostrzy','szybkosc',3,'Błyskawiczny Taniec','Zwiększa szansę na cios krytyczny','💥','bonus_crit',2,5,47,4],
    [49,'Tancerz Ostrzy','szybkosc',4,'Maestria Tańca','Zwiększa przebicie','🗡','bonus_przebicie',3,5,48,6],
    [50,'Tancerz Ostrzy','szybkosc',5,'Śmiertelny Taniec','Zwiększa obrażenia','⚔️','bonus_dmg',4,5,49,8],
    // Tancerz Ostrzy — Unik (IDs 51-55)
    [51,'Tancerz Ostrzy','unik',1,'Zwinność','Zwiększa szansę na unik','🌬','bonus_ac',2,5,null,0],
    [52,'Tancerz Ostrzy','unik',2,'Krok Widma','Zwiększa szybkość','⚡','bonus_sa',2,5,51,2],
    [53,'Tancerz Ostrzy','unik',3,'Cień Mgły','Zwiększa pancerz','🌑','bonus_ac',3,5,52,4],
    [54,'Tancerz Ostrzy','unik',4,'Niewidzialny Ruch','Zwiększa obrażenia po uniku','🗡','bonus_dmg',3,5,53,6],
    [55,'Tancerz Ostrzy','unik',5,'Mistrz Cieni','Zwiększa wszystkie statystyki','⭐','bonus_hp',30,5,54,8],
    // Tancerz Ostrzy — Trucizna (IDs 56-60)
    [56,'Tancerz Ostrzy','trucizna',1,'Trujące Ostrze','Zwiększa obrażenia truciznowe','☠️','bonus_dmg',2,5,null,0],
    [57,'Tancerz Ostrzy','trucizna',2,'Jad Węża','Zwiększa obrażenia od trucizny','🐍','bonus_dmg',3,5,56,2],
    [58,'Tancerz Ostrzy','trucizna',3,'Maź Śmierci','Zwiększa obrażenia krytyczne','💀','bonus_crit',2,5,57,4],
    [59,'Tancerz Ostrzy','trucizna',4,'Mgła Trujących Oparów','Zwiększa przebicie pancerza','☠️','bonus_przebicie',4,5,58,6],
    [60,'Tancerz Ostrzy','trucizna',5,'Truciciel Mistrzowski','Zwiększa doświadczenie','⭐','bonus_exp',4,5,59,8],
    // Lowca IDs 61-75
    [61,'Lowca','luk',1,'Precyzyjny Strzał','Zwiększa obrażenia od łuku','🏹','bonus_dmg',2,5,null,0],
    [62,'Lowca','luk',2,'Szybka Salwa','Zwiększa szybkość ataku','⚡','bonus_sa',3,5,61,2],
    [63,'Lowca','luk',3,'Celne Oko','Zwiększa szansę na cios krytyczny','👁','bonus_crit',2,5,62,4],
    [64,'Lowca','luk',4,'Przebijający Grot','Ignoruje część pancerza','🗡','bonus_przebicie',4,5,63,6],
    [65,'Lowca','luk',5,'Mistrz Łucznik','Zwiększa obrażenia','⭐','bonus_dmg',4,5,64,8],
    // Lowca — Pułapki (IDs 66-70)
    [66,'Lowca','pulapki',1,'Strefa Pułapek','Zwiększa pancerz defensywnie','🪤','bonus_ac',2,5,null,0],
    [67,'Lowca','pulapki',2,'Sideł Mistrza','Zwiększa HP','❤️','bonus_hp',20,5,66,2],
    [68,'Lowca','pulapki',3,'Błyskawiczna Pułapka','Zwiększa szybkość','⚡','bonus_sa',2,5,67,4],
    [69,'Lowca','pulapki',4,'Sieć Śmierci','Zwiększa obrażenia','🗡','bonus_dmg',3,5,68,6],
    [70,'Lowca','pulapki',5,'Mistrz Pułapek','Zwiększa exp','⭐','bonus_exp',4,5,69,8],
    // Lowca — Zwierzę (IDs 71-75)
    [71,'Lowca','zwierze',1,'Towarzysz','Zwiększa obrażenia','🐺','bonus_dmg',2,5,null,0],
    [72,'Lowca','zwierze',2,'Wierny Towarzysz','Zwiększa HP','❤️','bonus_hp',25,5,71,2],
    [73,'Lowca','zwierze',3,'Rój Bestii','Zwiększa atak','⚔️','bonus_dmg',3,5,72,4],
    [74,'Lowca','zwierze',4,'Duch Lasu','Zwiększa crit','💥','bonus_crit',2,5,73,6],
    [75,'Lowca','zwierze',5,'Pan Zwierząt','Zwiększa exp','⭐','bonus_exp',5,5,74,8],
    // Tropiciel IDs 76-90
    [76,'Tropiciel','sledzenie',1,'Tropienie','Zwiększa szansę na krytyczny','🔍','bonus_crit',1,5,null,0],
    [77,'Tropiciel','sledzenie',2,'Niewidoczny Krok','Zwiększa szybkość','⚡','bonus_sa',2,5,76,2],
    [78,'Tropiciel','sledzenie',3,'Ukrycie','Zwiększa pancerz','🌑','bonus_ac',3,5,77,4],
    [79,'Tropiciel','sledzenie',4,'Zasadzka','Zwiększa obrażenia z zaskoczenia','🗡','bonus_dmg',4,5,78,6],
    [80,'Tropiciel','sledzenie',5,'Mistrz Zasadzek','Zwiększa exp','⭐','bonus_exp',4,5,79,8],
    // Tropiciel — Lesnictwo (IDs 81-85)
    [81,'Tropiciel','lesnictwo',1,'Zielarstwo','Zwiększa HP','🌿','bonus_hp',20,5,null,0],
    [82,'Tropiciel','lesnictwo',2,'Ziołolecznictwo','Zwiększa regenerację HP','💊','hp_regen',5,5,81,2],
    [83,'Tropiciel','lesnictwo',3,'Las Ochronny','Zwiększa pancerz','🌲','bonus_ac',2,5,82,4],
    [84,'Tropiciel','lesnictwo',4,'Siła Natury','Zwiększa HP','❤️','bonus_hp',30,5,83,6],
    [85,'Tropiciel','lesnictwo',5,'Strażnik Lasu','Zwiększa HP max','🌲','bonus_hp',50,5,84,8],
    // Tropiciel — Sabotaż (IDs 86-90)
    [86,'Tropiciel','sabotaz',1,'Podstęp','Zwiększa obrażenia','🗡','bonus_dmg',2,5,null,0],
    [87,'Tropiciel','sabotaz',2,'Trucizna Sabotażysty','Zwiększa obrażenia od trucizny','☠️','bonus_dmg',3,5,86,2],
    [88,'Tropiciel','sabotaz',3,'Bomb Dymna','Zwiększa szybkość ucieczki','⚡','bonus_sa',2,5,87,4],
    [89,'Tropiciel','sabotaz',4,'Mistrzowski Sabotaż','Zwiększa przebicie','🗡','bonus_przebicie',4,5,88,6],
    [90,'Tropiciel','sabotaz',5,'Cień Sabotażu','Zwiększa exp','⭐','bonus_exp',4,5,89,8],
  ];

  for (const row of talentData) {
    const [id,klasa,sciezka,pozycja,nazwa,opis,ikona,efekt_typ,efekt_wartosc_per_lvl,max_poziom,wymaga_talent_id,wymaga_sciezka_punkty] = row;
    await db.query(
      `INSERT IGNORE INTO talenty (id,klasa,sciezka,pozycja,nazwa,opis,ikona,efekt_typ,efekt_wartosc_per_lvl,max_poziom,wymaga_talent_id,wymaga_sciezka_punkty)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id,klasa,sciezka,pozycja,nazwa,opis,ikona,efekt_typ,efekt_wartosc_per_lvl,max_poziom,wymaga_talent_id,wymaga_sciezka_punkty]
    );
  }

  console.log('Talenty seeded OK');
  console.log('Phase 4 migration complete!');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
