-- ── Nowy system walki turowej ─────────────────────────────────────────────────

-- Postać: nowe statystyki bojowe
ALTER TABLE postac
  ADD COLUMN IF NOT EXISTS szybkosc     INT  DEFAULT 10  COMMENT 'Inicjatywa w walce',
  ADD COLUMN IF NOT EXISTS energia      INT  DEFAULT 100 COMMENT 'Obecna energia (EN)',
  ADD COLUMN IF NOT EXISTS energia_max  INT  DEFAULT 100 COMMENT 'Maks energia',
  ADD COLUMN IF NOT EXISTS en_regen     INT  DEFAULT 15  COMMENT 'Regen EN na turę',
  ADD COLUMN IF NOT EXISTS furia        INT  DEFAULT 0   COMMENT 'Pasek furii 0-100',
  ADD COLUMN IF NOT EXISTS combat_state JSON DEFAULT NULL COMMENT 'Stan aktywnej walki';

-- Mob: nowe statystyki
ALTER TABLE mob
  ADD COLUMN IF NOT EXISTS szybkosc    INT         DEFAULT 8           COMMENT 'Inicjatywa moba',
  ADD COLUMN IF NOT EXISTS pattern     VARCHAR(20) DEFAULT 'standard'  COMMENT 'Wzorzec AI',
  ADD COLUMN IF NOT EXISTS en_max      INT         DEFAULT 50          COMMENT 'Maks EN moba',
  ADD COLUMN IF NOT EXISTS en_current  INT         DEFAULT 50          COMMENT 'Obecne EN moba',
  ADD COLUMN IF NOT EXISTS szerokosc   INT         DEFAULT 24          COMMENT 'Szerokość sprite',
  ADD COLUMN IF NOT EXISTS dlugosc     INT         DEFAULT 32          COMMENT 'Wysokość sprite';

-- Ustaw sensowne szybkości dla istniejących mobów na podstawie poziomu
UPDATE mob SET szybkosc = GREATEST(3, LEAST(25, FLOOR(poziom * 0.8 + 4)))
WHERE szybkosc = 8;

-- Typy AI na podstawie rodzaju moba
UPDATE mob SET pattern = 'aggressive'  WHERE nazwa LIKE '%Boss%' OR nazwa LIKE '%Lider%';
UPDATE mob SET pattern = 'berserker'   WHERE nazwa LIKE '%Berserk%' OR nazwa LIKE '%Szał%';
UPDATE mob SET pattern = 'debuffer'    WHERE nazwa LIKE '%Czarowni%' OR nazwa LIKE '%Szaman%' OR nazwa LIKE '%Mag%';
UPDATE mob SET pattern = 'defensive'   WHERE nazwa LIKE '%Pancerz%' OR nazwa LIKE '%Strażni%';
