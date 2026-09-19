-- ── World Boss — rozbudowa systemu ─────────────────────────────────────────────

-- Statystyki bojowe i mechaniki bossa
ALTER TABLE world_boss
  ADD COLUMN IF NOT EXISTS sa           INT     DEFAULT 110   COMMENT 'Szansa ataku (celność)',
  ADD COLUMN IF NOT EXISTS ac           INT     DEFAULT 20    COMMENT 'Unik/obrona',
  ADD COLUMN IF NOT EXISTS absorbcja    INT     DEFAULT 80    COMMENT 'Absorpcja obrażeń',
  ADD COLUMN IF NOT EXISTS mabsorbcja   INT     DEFAULT 40    COMMENT 'Absorpcja magii',
  ADD COLUMN IF NOT EXISTS obrazenia_min INT    DEFAULT 80    COMMENT 'Minimalne obrażenia bossa',
  ADD COLUMN IF NOT EXISTS obrazenia_max INT    DEFAULT 200   COMMENT 'Maksymalne obrażenia bossa',
  ADD COLUMN IF NOT EXISTS ck           INT     DEFAULT 10    COMMENT 'Szansa na krytyk (%)',
  ADD COLUMN IF NOT EXISTS ckf          INT     DEFAULT 200   COMMENT 'Siła krytu (%)',
  ADD COLUMN IF NOT EXISTS unik         INT     DEFAULT 5     COMMENT 'Szansa unika (%)',
  ADD COLUMN IF NOT EXISTS poziom       INT     DEFAULT 50    COMMENT 'Poziom bossa',
  ADD COLUMN IF NOT EXISTS czas_zycia_min INT   DEFAULT 60   COMMENT 'Czas życia w minutach (timer)',
  ADD COLUMN IF NOT EXISTS data_ucieczki DATETIME DEFAULT NULL COMMENT 'Kiedy boss ucieknie',
  ADD COLUMN IF NOT EXISTS odpornosci   JSON    DEFAULT NULL  COMMENT 'Mnożniki per profesja {"Mag":1.3,"Wojownik":0.8}',
  ADD COLUMN IF NOT EXISTS zdolnosci_specjalne JSON DEFAULT NULL COMMENT '[{typ,prog,wyzwolona}]',
  ADD COLUMN IF NOT EXISTS aktywna_tarcza TINYINT DEFAULT 0  COMMENT '1=tarcza aktywna',
  ADD COLUMN IF NOT EXISTS tarcza_do    BIGINT  DEFAULT 0    COMMENT 'unix ts wygaśnięcia tarczy',
  ADD COLUMN IF NOT EXISTS relikwia_id  INT     DEFAULT NULL  COMMENT 'przedmiot_loot.id dla top DPS';

-- Śledzenie sesji gracza z bossem (HP, debuffs)
ALTER TABLE world_boss_uczestnicy
  ADD COLUMN IF NOT EXISTS gildia_id    INT         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gildia_nazwa VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hero_hp      INT         DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hero_hp_max  INT         DEFAULT 0,
  ADD COLUMN IF NOT EXISTS debuff_session JSON       DEFAULT NULL COMMENT '{"hero":[],"mob":[]}';

-- Historia zabójstw bossów per gracz (achievementy)
CREATE TABLE IF NOT EXISTS worldboss_kills (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  postac_id    INT          NOT NULL,
  boss_id      INT          NOT NULL,
  boss_nazwa   VARCHAR(100) NOT NULL,
  obrazenia_zadane BIGINT   DEFAULT 0,
  top_dps      TINYINT      DEFAULT 0,
  data         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pk (postac_id, boss_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Wkład gildii w boss fight
CREATE TABLE IF NOT EXISTS worldboss_gildie (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  boss_id         INT          NOT NULL,
  gildia_id       INT          NOT NULL,
  gildia_nazwa    VARCHAR(100) NOT NULL,
  obrazenia_laczne BIGINT      DEFAULT 0,
  UNIQUE KEY uq_bg (boss_id, gildia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Kolumna sumarycznych kill bossów na postaci
ALTER TABLE postac
  ADD COLUMN IF NOT EXISTS boss_kills INT DEFAULT 0;

-- Wkład w bossów per członek gildii
ALTER TABLE gildia_czlonkowie
  ADD COLUMN IF NOT EXISTS wklad_boss_dmg BIGINT DEFAULT 0;

-- Domyślne zdolności specjalne dla istniejących bossów (jeśli NULL)
UPDATE world_boss SET zdolnosci_specjalne = JSON_ARRAY(
  JSON_OBJECT('typ','sluzy',   'prog',0.50,'wyzwolona',0),
  JSON_OBJECT('typ','tarcza',  'prog',0.35,'wyzwolona',0),
  JSON_OBJECT('typ','regeneracja','prog',0.20,'wyzwolona',0)
) WHERE zdolnosci_specjalne IS NULL;
