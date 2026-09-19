// Phase 13: uzupełnienie schematu bazy.
//
// Kod gry używa ~40 tabel i kilkunastu kolumn, których nie tworzył żaden plik
// w repozytorium (powstawały ręcznie w bazie deweloperskiej). Ta migracja
// odtwarza je na podstawie zapytań w kodzie, tak żeby świeża instalacja
// (margonem.sql + phase4..phase13) dawała grywalną grę.
//
// Idempotentna: CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS / INSERT IGNORE.
// Uruchom PO phase12 (InnoDB), z katalogu server/:
//   node src/migrations/phase13_schema_uzupelnienie.js
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../db');

const T = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci';

const STEPS = [
  // ── Konta i postać ─────────────────────────────────────────────────────────
  ['accounts', `CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(24) NOT NULL UNIQUE,
    haslo VARCHAR(255) NOT NULL,
    data_rejestracji TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ${T}`],
  ['postac: kolumny', `ALTER TABLE postac
    ADD COLUMN IF NOT EXISTS account_id INT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS ranga VARCHAR(20) NOT NULL DEFAULT 'Gracz',
    ADD COLUMN IF NOT EXISTS czas_gry INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS aktywny_tytul INT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS event_tokeny INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS zloto_zarobione BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS ostatnie_logowanie DATETIME DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS boss_kills INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS komentarze_wylaczone TINYINT NOT NULL DEFAULT 0`],
  ['postac: indeksy', `ALTER TABLE postac ADD INDEX IF NOT EXISTS idx_account (account_id), ADD INDEX IF NOT EXISTS idx_mapa_online (mapa, zalogowany)`],
  ['prestige_log', `CREATE TABLE IF NOT EXISTS prestige_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postac_id INT NOT NULL, stary_poziom INT, prestige_numer INT,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ${T}`],
  ['profil_komentarze', `CREATE TABLE IF NOT EXISTS profil_komentarze (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profil_postac_id INT NOT NULL, autor_postac_id INT NOT NULL,
    autor_nazwa VARCHAR(100), tresc VARCHAR(500),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_profil (profil_postac_id)
  ) ${T}`],

  // ── Tytuły i osiągnięcia ───────────────────────────────────────────────────
  ['tytuly', `CREATE TABLE IF NOT EXISTS tytuly (
    id INT AUTO_INCREMENT PRIMARY KEY,
    klucz VARCHAR(50) UNIQUE, nazwa VARCHAR(100), opis VARCHAR(300), ikona VARCHAR(10),
    bonus_typ VARCHAR(50) DEFAULT NULL, bonus_wartosc INT DEFAULT 0, zrodlo VARCHAR(50)
  ) ${T}`],
  ['postac_tytuly', `CREATE TABLE IF NOT EXISTS postac_tytuly (
    postac_id INT NOT NULL, tytul_id INT NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (postac_id, tytul_id)
  ) ${T}`],
  ['osiagniecia', `CREATE TABLE IF NOT EXISTS osiagniecia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    klucz VARCHAR(50) UNIQUE, nazwa VARCHAR(100), opis VARCHAR(300), ikona VARCHAR(10),
    warunek_typ VARCHAR(30) NOT NULL, warunek_wartosc INT NOT NULL DEFAULT 1,
    nagroda_exp INT DEFAULT 0, nagroda_gold INT DEFAULT 0
  ) ${T}`],
  ['postac_osiagniecia', `CREATE TABLE IF NOT EXISTS postac_osiagniecia (
    postac_id INT NOT NULL, osiagniecie_id INT NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (postac_id, osiagniecie_id)
  ) ${T}`],

  // ── Questy ─────────────────────────────────────────────────────────────────
  ['questy: kolumny', `ALTER TABLE questy
    ADD COLUMN IF NOT EXISTS lancuch_id INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS kolejnosc INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS czas_limit INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS ukryty TINYINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS ukryty_warunek TEXT,
    ADD COLUMN IF NOT EXISTS reset_typ VARCHAR(20) DEFAULT 'brak',
    ADD COLUMN IF NOT EXISTS wymaga_party INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS nagrody_wybor TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS typ_ranking TINYINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS skalowanie TINYINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS frakcja_id INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS wyklucza_frakcje INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS wyzwalacz VARCHAR(30) DEFAULT '',
    ADD COLUMN IF NOT EXISTS wskazowki TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS zakonczenie VARCHAR(30) DEFAULT 'neutralne'`],
  // Kod używa obu nazw kolumny z datą przyjęcia (data_przyj w SELECT, data_przyjecia w INSERT)
  ['postac_questy: kolumny', `ALTER TABLE postac_questy
    ADD COLUMN IF NOT EXISTS data_przyjecia DATETIME DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS nagroda_wybrana VARCHAR(100) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS zakonczenie VARCHAR(30) DEFAULT NULL`],
  ['postac_questy_history', `CREATE TABLE IF NOT EXISTS postac_questy_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postac_id INT NOT NULL, quest_id INT NOT NULL, quest_nazwa VARCHAR(150),
    zakonczenie VARCHAR(30), data_ukonczenia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_postac (postac_id)
  ) ${T}`],
  ['quest_chain', `CREATE TABLE IF NOT EXISTS quest_chain (
    id INT AUTO_INCREMENT PRIMARY KEY, nazwa VARCHAR(150), opis TEXT
  ) ${T}`],
  ['frakcje', `CREATE TABLE IF NOT EXISTS frakcje (
    id INT AUTO_INCREMENT PRIMARY KEY, nazwa VARCHAR(100), opis TEXT,
    ikona VARCHAR(10), kolor VARCHAR(20)
  ) ${T}`],
  ['postac_reputacja', `CREATE TABLE IF NOT EXISTS postac_reputacja (
    postac_id INT NOT NULL, frakcja_id INT NOT NULL, punkty INT NOT NULL DEFAULT 0,
    PRIMARY KEY (postac_id, frakcja_id)
  ) ${T}`],
  ['quest_ranking', `CREATE TABLE IF NOT EXISTS quest_ranking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quest_id INT NOT NULL, postac_id INT NOT NULL, postac_nazwa VARCHAR(100),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_quest_postac (quest_id, postac_id)
  ) ${T}`],
  ['server_events', `CREATE TABLE IF NOT EXISTS server_events (
    id INT AUTO_INCREMENT PRIMARY KEY, typ VARCHAR(50) NOT NULL UNIQUE,
    aktywny TINYINT DEFAULT 0, data_start DATETIME DEFAULT NULL, data_koniec DATETIME DEFAULT NULL
  ) ${T}`],

  // ── Świat ──────────────────────────────────────────────────────────────────
  ['serwer_pora', `CREATE TABLE IF NOT EXISTS serwer_pora (
    id INT PRIMARY KEY DEFAULT 1,
    pora VARCHAR(20) DEFAULT 'dzien', pogoda VARCHAR(20) DEFAULT 'pogodnie',
    zmiana_o TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ${T}`],
  ['eventy_sezonowe', `CREATE TABLE IF NOT EXISTS eventy_sezonowe (
    id INT AUTO_INCREMENT PRIMARY KEY, nazwa VARCHAR(100), typ VARCHAR(20),
    data_start DATE, data_koniec DATE, aktywny TINYINT DEFAULT 0,
    opis VARCHAR(500), kolor VARCHAR(20)
  ) ${T}`],
  ['event_sklep', `CREATE TABLE IF NOT EXISTS event_sklep (
    id INT AUTO_INCREMENT PRIMARY KEY, event_id INT NOT NULL, przedmiot_id INT,
    cena_gold INT DEFAULT 0, cena_token INT DEFAULT 0, limit_sztuk INT DEFAULT 0
  ) ${T}`],
  ['offline_progress', `CREATE TABLE IF NOT EXISTS offline_progress (
    id INT AUTO_INCREMENT PRIMARY KEY, postac_id INT NOT NULL UNIQUE, mapa_id INT,
    data_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP, data_koniec DATETIME,
    status VARCHAR(20) DEFAULT 'aktywny',
    wynik_exp INT DEFAULT 0, wynik_gold INT DEFAULT 0, wynik_kills INT DEFAULT 0,
    wynik_items TEXT
  ) ${T}`],

  // ── Handel i ekonomia ──────────────────────────────────────────────────────
  ['handel_sesje', `CREATE TABLE IF NOT EXISTS handel_sesje (
    id INT AUTO_INCREMENT PRIMARY KEY, gracz1_id INT NOT NULL, gracz2_id INT NOT NULL,
    gracz1_gold INT DEFAULT 0, gracz2_gold INT DEFAULT 0,
    gracz1_confirm TINYINT DEFAULT 0, gracz2_confirm TINYINT DEFAULT 0,
    status ENUM('aktywna','zakonczona','anulowana') DEFAULT 'aktywna',
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_g1 (gracz1_id, status), INDEX idx_g2 (gracz2_id, status)
  ) ${T}`],
  ['handel_przedmioty', `CREATE TABLE IF NOT EXISTS handel_przedmioty (
    id INT AUTO_INCREMENT PRIMARY KEY, sesja_id INT NOT NULL, gracz_id INT NOT NULL, przedmiot_id INT NOT NULL,
    INDEX idx_sesja (sesja_id)
  ) ${T}`],
  ['podatki_log', `CREATE TABLE IF NOT EXISTS podatki_log (
    id INT AUTO_INCREMENT PRIMARY KEY, gildia_id INT, mapa_id INT,
    zrodlo VARCHAR(20), kwota INT, data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ${T}`],
  // worldEditor usuwa wpisy paczek po id, a tabela z dumpa nie miała klucza
  ['paczka_przedmiot: id', `ALTER TABLE paczka_przedmiot ADD COLUMN IF NOT EXISTS id INT AUTO_INCREMENT PRIMARY KEY FIRST`],

  // ── Gildie (z migrate-guild.js, bez kluczy obcych) ─────────────────────────
  ['gilde: kolumny', `ALTER TABLE gilde
    ADD COLUMN IF NOT EXISTS ogloszenie VARCHAR(1000) DEFAULT '',
    ADD COLUMN IF NOT EXISTS skarbiec INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS otwarta TINYINT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS lvl INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS poziom INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS gildia_exp BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS terytorium_mapa INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS obrazek VARCHAR(255) DEFAULT NULL`],
  ['gildia_czlonkowie: kolumny', `ALTER TABLE gildia_czlonkowie
    ADD COLUMN IF NOT EXISTS wklad_gold INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS wklad_kills INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS wklad_exp BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS wklad_boss_dmg BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS data_dolaczenia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS niestandardowa_ranga VARCHAR(50) DEFAULT NULL`],
  ['gildia_rangi', `CREATE TABLE IF NOT EXISTS gildia_rangi (
    id INT AUTO_INCREMENT PRIMARY KEY, gildia_id INT NOT NULL, nazwa VARCHAR(50) NOT NULL,
    poziom TINYINT DEFAULT 0, moze_zapraszac TINYINT DEFAULT 0, moze_kickowac TINYINT DEFAULT 0,
    moze_skarbiec TINYINT DEFAULT 0, INDEX idx_gildia (gildia_id)
  ) ${T}`],
  ['gildia_podania', `CREATE TABLE IF NOT EXISTS gildia_podania (
    id INT AUTO_INCREMENT PRIMARY KEY, gildia_id INT NOT NULL, postac_id INT NOT NULL,
    postac_nazwa VARCHAR(100), tresc VARCHAR(500) DEFAULT '',
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('oczekuje','zaakceptowano','odrzucono') DEFAULT 'oczekuje',
    UNIQUE KEY uniq_app (gildia_id, postac_id, status)
  ) ${T}`],
  ['gildia_skarbiec_log', `CREATE TABLE IF NOT EXISTS gildia_skarbiec_log (
    id INT AUTO_INCREMENT PRIMARY KEY, gildia_id INT NOT NULL, postac_id INT NOT NULL,
    postac_nazwa VARCHAR(100), typ ENUM('wplata','wyplata') NOT NULL, kwota INT NOT NULL,
    opis VARCHAR(200) DEFAULT '', data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ${T}`],
  ['gildia_bonusy', `CREATE TABLE IF NOT EXISTS gildia_bonusy (
    id INT AUTO_INCREMENT PRIMARY KEY, gildia_id INT NOT NULL UNIQUE,
    bonus_exp TINYINT DEFAULT 0, bonus_healing TINYINT DEFAULT 0,
    bonus_crit TINYINT DEFAULT 0, bonus_defense TINYINT DEFAULT 0
  ) ${T}`],
  ['gildia_wojny', `CREATE TABLE IF NOT EXISTS gildia_wojny (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gildia_atakujaca INT NOT NULL, nazwa_atakujacej VARCHAR(75),
    gildia_broniac INT NOT NULL, nazwa_broniacej VARCHAR(75),
    data_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP, data_koniec TIMESTAMP NULL,
    punkty_atakujaca INT DEFAULT 0, punkty_broniac INT DEFAULT 0,
    bonus_exp_zwyciezcy INT DEFAULT 10,
    status ENUM('aktywna','zakonczona') DEFAULT 'aktywna'
  ) ${T}`],
  ['gildia_relacje', `CREATE TABLE IF NOT EXISTS gildia_relacje (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gildia1_id INT NOT NULL, gildia1_nazwa VARCHAR(75),
    gildia2_id INT NOT NULL, gildia2_nazwa VARCHAR(75),
    typ ENUM('przymierze','wrogosc') NOT NULL, data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_rel (gildia1_id, gildia2_id)
  ) ${T}`],
  ['gildia_misje', `CREATE TABLE IF NOT EXISTS gildia_misje (
    id INT AUTO_INCREMENT PRIMARY KEY, gildia_id INT NOT NULL,
    nazwa VARCHAR(100), opis VARCHAR(500),
    typ ENUM('kill','gold_collect','members_online') DEFAULT 'kill',
    cel_ilosc INT DEFAULT 100, postep INT DEFAULT 0,
    nagroda_gold INT DEFAULT 500, nagroda_exp INT DEFAULT 200,
    data_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP, data_koniec TIMESTAMP NULL,
    status ENUM('aktywna','zakonczona','wygasla') DEFAULT 'aktywna'
  ) ${T}`],
  ['gildia_terytorium', `CREATE TABLE IF NOT EXISTS gildia_terytorium (
    mapa_id INT PRIMARY KEY, gildia_id INT NOT NULL, gildia_nazwa VARCHAR(75),
    data_zajecia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    podatek_pct TINYINT DEFAULT 3, przychod_total BIGINT DEFAULT 0
  ) ${T}`],
  ['gildia_rajdy', `CREATE TABLE IF NOT EXISTS gildia_rajdy (
    id INT AUTO_INCREMENT PRIMARY KEY, gildia_id INT NOT NULL, gildia_nazwa VARCHAR(75),
    min_czlonkow INT DEFAULT 3, nagroda_gold INT DEFAULT 1000, nagroda_exp INT DEFAULT 500,
    status ENUM('aktywny','zakończony') DEFAULT 'aktywny',
    data_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP, data_koniec TIMESTAMP NULL,
    uczestnicy TEXT
  ) ${T}`],

  // ── World boss ─────────────────────────────────────────────────────────────
  ['world_boss', `CREATE TABLE IF NOT EXISTS world_boss (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nazwa VARCHAR(100) NOT NULL, obrazek VARCHAR(200),
    mapa_id INT NOT NULL, x_pos INT DEFAULT 30, y_pos INT DEFAULT 30,
    zycie BIGINT NOT NULL DEFAULT 0, zycie_max BIGINT NOT NULL,
    poziom INT DEFAULT 50,
    status VARCHAR(20) NOT NULL DEFAULT 'oczekuje',
    data_pojawienia DATETIME NULL, data_smierci DATETIME NULL,
    sa INT DEFAULT 110, ac INT DEFAULT 20, absorbcja INT DEFAULT 80, mabsorbcja INT DEFAULT 40,
    obrazenia_min INT DEFAULT 80, obrazenia_max INT DEFAULT 200,
    ck INT DEFAULT 10, ckf INT DEFAULT 200, unik INT DEFAULT 5,
    czas_zycia_min INT DEFAULT 60, data_ucieczki DATETIME DEFAULT NULL,
    odpornosci JSON DEFAULT NULL, zdolnosci_specjalne JSON DEFAULT NULL,
    aktywna_tarcza TINYINT DEFAULT 0, tarcza_do BIGINT DEFAULT 0,
    relikwia_id INT DEFAULT NULL
  ) ${T}`],
  ['world_boss_uczestnicy', `CREATE TABLE IF NOT EXISTS world_boss_uczestnicy (
    boss_id INT NOT NULL, postac_id INT NOT NULL, postac_nazwa VARCHAR(100),
    obrazenia_zadane BIGINT DEFAULT 0,
    gildia_id INT DEFAULT NULL, gildia_nazwa VARCHAR(100) DEFAULT NULL,
    hero_hp INT DEFAULT 0, hero_hp_max INT DEFAULT 0, debuff_session JSON DEFAULT NULL,
    PRIMARY KEY (boss_id, postac_id)
  ) ${T}`],
  ['worldboss_kills', `CREATE TABLE IF NOT EXISTS worldboss_kills (
    id INT AUTO_INCREMENT PRIMARY KEY, postac_id INT NOT NULL, boss_id INT NOT NULL,
    boss_nazwa VARCHAR(100) NOT NULL, obrazenia_zadane BIGINT DEFAULT 0, top_dps TINYINT DEFAULT 0,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_pk (postac_id, boss_id)
  ) ${T}`],
  ['worldboss_gildie', `CREATE TABLE IF NOT EXISTS worldboss_gildie (
    id INT AUTO_INCREMENT PRIMARY KEY, boss_id INT NOT NULL, gildia_id INT NOT NULL,
    gildia_nazwa VARCHAR(100) NOT NULL, obrazenia_laczne BIGINT DEFAULT 0,
    UNIQUE KEY uq_bg (boss_id, gildia_id)
  ) ${T}`],

  // ── Lochy v1 ───────────────────────────────────────────────────────────────
  ['dungeony_szablony', `CREATE TABLE IF NOT EXISTS dungeony_szablony (
    id INT AUTO_INCREMENT PRIMARY KEY, nazwa VARCHAR(100), opis VARCHAR(300),
    min_poziom INT DEFAULT 1, max_poziom INT DEFAULT 500,
    min_graczy INT DEFAULT 1, max_graczy INT DEFAULT 5,
    czas_limit_min INT DEFAULT 30,
    nagroda_exp_base INT DEFAULT 1000, nagroda_gold_base INT DEFAULT 500
  ) ${T}`],
  ['dungeony_sesje', `CREATE TABLE IF NOT EXISTS dungeony_sesje (
    id INT AUTO_INCREMENT PRIMARY KEY, szablon_id INT, mapa_id INT,
    status VARCHAR(20) DEFAULT 'aktywna',
    data_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP, data_koniec DATETIME NULL,
    seed INT, ukonczone TINYINT DEFAULT 0
  ) ${T}`],
  ['dungeony_gracze', `CREATE TABLE IF NOT EXISTS dungeony_gracze (
    sesja_id INT NOT NULL, postac_id INT NOT NULL,
    dolaczyl TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (sesja_id, postac_id)
  ) ${T}`],

  // ── Wędkarstwo ─────────────────────────────────────────────────────────────
  ['postac_wedkarstwo: kolumny', `ALTER TABLE postac_wedkarstwo
    ADD COLUMN IF NOT EXISTS wedka VARCHAR(20) DEFAULT 'bambusowa',
    ADD COLUMN IF NOT EXISTS exp_wedkarstwo INT DEFAULT 0`],
  ['fishing_catches', `CREATE TABLE IF NOT EXISTS fishing_catches (
    id INT AUTO_INCREMENT PRIMARY KEY, postac_id INT NOT NULL, ryba_nazwa VARCHAR(100),
    rzadkosc VARCHAR(20), wartosc INT, wedka VARCHAR(20),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_postac (postac_id)
  ) ${T}`],
  ['fishing_ekwipunek', `CREATE TABLE IF NOT EXISTS fishing_ekwipunek (
    postac_id INT PRIMARY KEY, wedka VARCHAR(20) DEFAULT 'bambusowa', poziom INT DEFAULT 1, exp INT DEFAULT 0
  ) ${T}`],
  ['fishing_historia', `CREATE TABLE IF NOT EXISTS fishing_historia (
    id INT AUTO_INCREMENT PRIMARY KEY, postac_id INT NOT NULL, ryba_nazwa VARCHAR(100),
    rzadkosc VARCHAR(20), rozmiar VARCHAR(20), wedka VARCHAR(20),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_postac (postac_id)
  ) ${T}`],

  // ── Dane startowe ──────────────────────────────────────────────────────────
  ['seed: serwer_pora', `INSERT IGNORE INTO serwer_pora (id, pora, pogoda) VALUES (1, 'dzien', 'pogodnie')`],
  // Cron spawnu w index.js losuje bossy o id 1, 2, 3
  ['seed: world_boss', `INSERT IGNORE INTO world_boss
    (id, nazwa, obrazek, mapa_id, x_pos, y_pos, zycie, zycie_max, poziom, status,
     sa, ac, absorbcja, mabsorbcja, obrazenia_min, obrazenia_max, ck, ckf, unik, czas_zycia_min, odpornosci)
    VALUES
    (1, 'Zulek Szalony', 'mob/heroes/zulek.gif', 6, 47, 31, 20000, 20000, 20, 'oczekuje',
     100, 15, 10, 5, 25, 60, 8, 180, 5, 60, NULL),
    (2, 'Karmazynowy Rycerz', 'mob/heroes/karmazyn.gif', 11, 47, 31, 60000, 60000, 30, 'oczekuje',
     110, 25, 25, 15, 45, 110, 10, 200, 6, 60, JSON_OBJECT('Mag', 1.2, 'Wojownik', 0.9)),
    (3, 'Mnich Upadły', 'mob/heroes/mnich-zly.gif', 48, 31, 31, 150000, 150000, 55, 'oczekuje',
     120, 35, 45, 30, 80, 200, 12, 220, 8, 90, JSON_OBJECT('Paladyn', 1.2, 'Mag', 0.85))`],
  ['seed: tytuly', `INSERT IGNORE INTO tytuly (klucz, nazwa, opis, ikona, bonus_typ, bonus_wartosc, zrodlo) VALUES
    ('pierwsze_prestige', 'Odrodzony', 'Pierwsza reinkarnacja postaci', '🔄', 'bonus_exp_pct', 5, 'prestige'),
    ('pogromca_bossow', 'Pogromca Bossów', 'Pokonaj world bossa', '🐉', 'ck', 2, 'osiagniecie'),
    ('weteran', 'Weteran', 'Osiągnij 50 poziom', '⚔', 'ac', 5, 'osiagniecie'),
    ('lowca', 'Łowca Potworów', 'Pokonaj 500 potworów', '🏹', 'ck', 1, 'osiagniecie'),
    ('bogacz', 'Bogacz', 'Zgromadź 100 000 złota', '💰', NULL, 0, 'osiagniecie')`],
  ['seed: osiagniecia', `INSERT IGNORE INTO osiagniecia (klucz, nazwa, opis, ikona, warunek_typ, warunek_wartosc, nagroda_exp, nagroda_gold) VALUES
    ('kills_10',   'Pierwsza krew',     'Pokonaj 10 potworów',    '🗡', 'kills', 10, 50, 50),
    ('kills_100',  'Myśliwy',           'Pokonaj 100 potworów',   '🏹', 'kills', 100, 500, 300),
    ('kills_500',  'Łowca potworów',    'Pokonaj 500 potworów',   '💀', 'kills', 500, 3000, 1500),
    ('kills_2000', 'Rzeźnik',           'Pokonaj 2000 potworów',  '☠', 'kills', 2000, 15000, 5000),
    ('level_10',   'Adept',             'Osiągnij 10 poziom',     '⭐', 'level', 10, 0, 200),
    ('level_25',   'Doświadczony',      'Osiągnij 25 poziom',     '🌟', 'level', 25, 0, 1000),
    ('level_50',   'Weteran',           'Osiągnij 50 poziom',     '👑', 'level', 50, 0, 5000),
    ('quests_1',   'Pierwsze zlecenie', 'Ukończ 1 zadanie',       '📜', 'quests_done', 1, 100, 50),
    ('quests_10',  'Poszukiwacz przygód','Ukończ 10 zadań',       '🗺', 'quests_done', 10, 1000, 500),
    ('gold_10k',   'Oszczędny',         'Miej 10 000 złota',      '💰', 'gold_earned', 10000, 500, 0),
    ('gold_100k',  'Bogacz',            'Miej 100 000 złota',     '💎', 'gold_earned', 100000, 5000, 0)`],
  ['seed: frakcje', `INSERT IGNORE INTO frakcje (id, nazwa, opis, ikona, kolor) VALUES
    (1, 'Straż Ithan', 'Obrońcy miasta i jego mieszkańców.', '🛡', '#60A5FA'),
    (2, 'Zakon Światła', 'Kapłani i paladyni strzegący starej wiary.', '✨', '#FCD34D'),
    (3, 'Bractwo Cienia', 'Łowcy nagród działający poza prawem.', '🗡', '#A78BFA')`],
  ['seed: dungeony_szablony', `INSERT IGNORE INTO dungeony_szablony (id, nazwa, opis, min_poziom, czas_limit_min) VALUES
    (1, 'Zapomniane Katakumby', 'Losowo generowany labirynt pełen strażników.', 5, 30),
    (2, 'Głębiny Opactwa', 'Trudniejszy labirynt dla doświadczonych.', 25, 40)`],
];

// Kolumna z polską literą w nazwie (phase11) — kod używa `pietro_obecne`
async function fixDungeonColumn() {
  const [cols] = await db.query("SHOW COLUMNS FROM dungeon_sesje2 LIKE 'pi%tro_obecne'");
  if (cols.some(c => c.Field === 'pietro_obecne')) return 'już poprawna';
  if (!cols.length) return 'brak tabeli/kolumny — pominięto';
  await db.query('ALTER TABLE dungeon_sesje2 CHANGE `piętro_obecne` `pietro_obecne` INT DEFAULT 1');
  return 'zmieniono nazwę';
}

async function run() {
  let ok = 0, fail = 0;
  for (const [label, sql] of STEPS) {
    try {
      await db.query(sql);
      ok++;
      console.log(`  OK    ${label}`);
    } catch (e) {
      fail++;
      console.error(`  BŁĄD  ${label}: ${e.message}`);
    }
  }
  try {
    console.log(`  OK    dungeon_sesje2.pietro_obecne: ${await fixDungeonColumn()}`);
  } catch (e) {
    fail++;
    console.error(`  BŁĄD  dungeon_sesje2.pietro_obecne: ${e.message}`);
  }
  console.log(`\nPhase 13: ${ok} OK, ${fail} błędów`);
  return fail ? 1 : 0;
}

run()
  .then(code => process.exit(code))
  .catch(e => { console.error(e); process.exit(1); });
