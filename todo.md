# Veldoria — Plan Rozbudowy

Każda faza jest **niezależna** i można ją wdrożyć w dowolnej kolejności.
Zależności wewnętrzne zaznaczono przy podpunktach.

---

## FAZA 1 — Progresja i Tożsamość Postaci
> *Bez zewnętrznych zależności. Czysto addytywne — nie zmienia istniejącej rozgrywki.*

### [12] System Tytułów
**Cel:** Gracz odblokuje tytuły przez questy/osiągnięcia/PvP. Tytuł wyświetlany pod nickiem na mapie i profilu.

**Baza danych:**
```sql
CREATE TABLE tytuly (
  id INT AUTO_INCREMENT PRIMARY KEY,
  klucz VARCHAR(50) UNIQUE,
  nazwa VARCHAR(100),
  opis VARCHAR(300),
  ikona VARCHAR(10),
  bonus_typ VARCHAR(50) DEFAULT NULL,   -- 'exp','gold','hp','atk' lub NULL
  bonus_wartosc INT DEFAULT 0,
  zrodlo VARCHAR(50)                    -- 'quest','osiagniecie','pvp','event'
);
CREATE TABLE postac_tytuly (
  postac_id INT, tytul_id INT, data TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (postac_id, tytul_id)
);
ALTER TABLE postac ADD COLUMN aktywny_tytul INT DEFAULT NULL;
```

**Backend (`routes/character.js`):**
- `GET  /character/titles`           — lista moich tytułów (zdobyte + wszystkie)
- `POST /character/titles/:id/equip` — aktyw tytuł (ustaw `aktywny_tytul`)
- `POST /character/titles/grant`     — wewnętrzna: nadaj tytuł (woła się z questów/osiągnięć)

**Integracje:**
- `routes/quests.js` → przy turnin questu z `nagroda_tytul` → call `grantTitle()`
- `routes/quests.js` → `checkAchievements()` → jeśli osiągnięcie → `grantTitle()`
- `game/stats.js` → dołącz `aktywny_tytul` do `safePostac`
- `routes/game.js` → dołącz `tytul` do danych graczy na mapie

**Frontend:**
- `CharPanel.jsx` → sekcja "Tytuły" pod statystykami: lista + przycisk "Aktywuj"
- `GameMap.jsx` → czwarta linia nad nickiem (pod klanem): tytuł w kolorze złotym kursywą
- `PlayerProfile.jsx` → sekcja z tytułami gracza

**Seed — 20 tytułów startowych:**
```
Obrońca Werbinu (quest chain), Łowca Szczurów (10 kills szczur),
Poszukiwacz Przygód (10 questów), Pogromca Goblinów (50 goblin kills),
Mistrz Areny (10 PvP wins), Nieśmiertelny (prestige), Odkrywca (30 map),
Koneser (wybierz nagrodę 5x), Wybrany Zakonu (rep frakcja 1 max) itd.
```

---

### [14] Rozbudowany Profil Gracza
**Cel:** Publiczna strona profilu z pełnymi statystykami, osiągnięciami, tytułami, historią PvP.

**Baza danych:**
```sql
ALTER TABLE postac ADD COLUMN IF NOT EXISTS czas_gry INT DEFAULT 0;      -- sekundy online
ALTER TABLE postac ADD COLUMN IF NOT EXISTS zloto_zarobione BIGINT DEFAULT 0;
ALTER TABLE postac ADD COLUMN IF NOT EXISTS deaths INT DEFAULT 0;
ALTER TABLE postac ADD COLUMN IF NOT EXISTS komentarze_wylaczone TINYINT DEFAULT 0;
CREATE TABLE profil_komentarze (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profil_postac_id INT NOT NULL,
  autor_postac_id INT NOT NULL,
  autor_nazwa VARCHAR(100),
  tresc VARCHAR(500),
  data TIMESTAMP DEFAULT NOW()
);
```

**Backend (`routes/social.js`):**
- `GET  /social/profile/:id`            — pełny profil (rozszerz istniejący endpoint)
- `POST /social/profile/comment/:id`    — dodaj komentarz do profilu
- `DELETE /social/profile/comment/:cid` — usuń swój komentarz
- `PUT  /social/profile/privacy`        — wyłącz komentarze

**Integracje:**
- `server/src/index.js` → socket `disconnect` → aktualizuj `czas_gry` (czas sesji)
- `routes/combat.js` → przy exp gain → `zloto_zarobione += loot_value`
- `routes/character.js` → przy śmierci postaci → `deaths += 1`

**Frontend (`PlayerProfile.jsx` — przepisać):**
- Sekcja Hero: avatar, nick, klasa, poziom, gildia, aktywny tytuł
- Zakładka Statystyki: kills, deaths, K/D ratio, czas gry, złoto zarobione, questy
- Zakładka Osiągnięcia: siatka kart (odblokowane kolorowe, zablokowane szare)
- Zakładka Tytuły: lista z datami zdobycia
- Zakładka PvP: ostatnie 10 walk (z kim, wynik, data)
- Sekcja Komentarze: formularz + lista

---

### [13] System Prestige / Reinkarnacja
**Cel:** Po osiągnięciu poz. 100 — restart do poz. 1 z permanentnym bonusem +5% do wszystkich statystyk.

**Baza danych:**
```sql
ALTER TABLE postac ADD COLUMN IF NOT EXISTS prestige INT DEFAULT 0;
ALTER TABLE postac ADD COLUMN IF NOT EXISTS prestige_bonus_pct TINYINT DEFAULT 0;
CREATE TABLE prestige_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postac_id INT,
  stary_poziom INT,
  data TIMESTAMP DEFAULT NOW()
);
```

**Backend (`routes/character.js`):**
- `GET  /character/prestige-info` — czy mogę zrobić prestige (poziom >= 100), podgląd co zachowam
- `POST /character/prestige`      — wykonaj prestige:
  1. Sprawdź poziom >= 100
  2. Zachowaj: złoto ×50%, eq ze slotów, tytuły, osiągnięcia, gildia
  3. Reset: poziom=1, exp=0, statystyki bazowe klasy, plecak opróżniony
  4. `prestige += 1`, `prestige_bonus_pct += 5` (max 50%)
  5. Nadaj tytuł "Wcielony" (prestige 1), "Starożytny" (prestige 5), "Bóg" (prestige 10)
  6. Insertuj do `prestige_log`

**Integracje:**
- `game/stats.js` → w `computeStats()` dodaj `prestige_bonus_pct` do wszystkich mnożników

**Frontend:**
- `CharPanel.jsx` → przycisk "Prestige ✦" widoczny tylko przy poz. 100 (pulsujący złoty)
- Modal potwierdzenia z listą co zostaje / co ginie
- Odznaka prestige przy nicku na mapie: `⁽¹⁾` przy nicku gdy prestige >= 1

---

## FAZA 2 — Atmosfera i Świat Żywy
> *Czysto wizualne + lekkie mechaniki. Nie wymaga zmian w innych systemach.*

### [4] Pogoda i Pora Dnia
**Cel:** Cykl dzień/noc (30 min), pogoda (2h). Efekty wizualne + drobne modyfikatory walki.

**Baza danych:**
```sql
CREATE TABLE serwer_pora (
  id INT PRIMARY KEY DEFAULT 1,
  pora VARCHAR(20) DEFAULT 'dzien',      -- 'dzien','zmierzch','noc','swit'
  pogoda VARCHAR(20) DEFAULT 'pogodnie', -- 'pogodnie','deszcz','mgla','burza'
  zmiana_o TIMESTAMP DEFAULT NOW()
);
```

**Backend:**
- `GET /game/world-state` — publiczny endpoint: `{ pora, pogoda, czas_do_zmiany }`
- `server/src/index.js` → `setInterval` co 60s sprawdza czas i aktualizuje `serwer_pora`:
  - Co 30 min zmiana pory dnia (dzien → zmierzch → noc → swit → dzien)
  - Co 2h losowanie pogody (70% pogodnie, 15% deszcz, 10% mgła, 5% burza)
  - Broadcast socket `world_state_change` do wszystkich połączonych

**Integracje:**
- `routes/combat.js` → modyfikatory zależne od pogody:
  - deszcz: `-10%` do `sa` (celność)
  - burza: `-15%` do `sa`, `+10%` do `obr_mag`
  - mgła: `-20%` do zasięgu skill (nie walki)
- `routes/game.js` → nocne moby (pole `nocny TINYINT` w tabeli `mob`): respawnują tylko nocą

**Frontend:**
- `GameMap.jsx` → overlay div na całą mapę z `opacity:0.0–0.4`:
  - noc: ciemny granat `rgba(0,0,30,0.35)`
  - zmierzch/swit: ciepły pomarańcz `rgba(80,40,0,0.2)`
  - deszcz: niebieskawa zasłona + animowany CSS deszcz (pseudoelement `::after`)
  - mgła: biały overlay `rgba(220,220,255,0.15)` + blur filtr `2px`
  - burza: deszcz + piorunowa błyskawica (losowy flash co 10-30s)
- `HUD.jsx` → ikona pory/pogody w górnym pasku (np. ☀️🌙🌧⛈🌫)
- `useSocket` → nasłuchuje `world_state_change`, aktualizuje state

---

### [11] Sezonowe Eventy
**Cel:** 4 eventy rocznie, unikalne questy, moby i sklep sezonowy.

**Baza danych:**
```sql
CREATE TABLE eventy_sezonowe (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nazwa VARCHAR(100),
  typ VARCHAR(20),        -- 'zima','wiosna','lato','jesien'
  data_start DATE,
  data_koniec DATE,
  aktywny TINYINT DEFAULT 0,
  opis VARCHAR(500),
  kolor VARCHAR(20)
);
CREATE TABLE event_sklep (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT,
  przedmiot_id INT,
  cena_gold INT,
  cena_event_token INT DEFAULT 0,
  limit_sztuk INT DEFAULT 0     -- 0=bez limitu
);
ALTER TABLE postac ADD COLUMN IF NOT EXISTS event_tokeny INT DEFAULT 0;
```

**Backend (`routes/events.js` — nowy plik):**
- `GET  /events/active`               — aktywny event + opis
- `GET  /events/shop`                 — lista przedmiotów w sklepie eventowym
- `POST /events/shop/buy`             — kup za event tokeny lub złoto
- `POST /events/admin/activate`       — admin aktywuje event (GameAdmin)

**Integracje:**
- `routes/quests.js` → questy z `wyzwalacz='event_zima'` etc. są dostępne tylko gdy event aktywny
- `routes/combat.js` → eventowe moby (tabela `mob` z `event_typ VARCHAR(20)`) dropują event tokeny
- `server/src/index.js` → `cron` co północ sprawdza datę i auto-aktywuje/deaktywuje eventy

**Frontend:**
- `Game.jsx` → baner eventu na górze mapy (złoty pasek z nazwą eventu) gdy aktywny
- `QuestPanel.jsx` → zakładka "Event" pojawia się tylko podczas aktywnego eventu
- `NpcDialog.jsx` → specjalny NPC eventowy (Event Merchant) ze sklepem sezonowym
- **Seed eventów:** Zimowe Święto (1-15.01), Przebudzenie Wiosny (20.03-5.04), Letni Turniej (21.06-5.07), Jesienne Żniwa (23.09-10.10)

---

## FAZA 3 — Ekonomia Graczy
> *Każdy podpunkt niezależny. Podatki wymagają działającego systemu terytoriów gildii.*

### [7] Handel Gracz-Gracz
**Cel:** Okno handlu — obaj gracze wkładają items/złoto, obaj potwierdzają.

**Baza danych:**
```sql
CREATE TABLE handel_sesje (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gracz1_id INT, gracz2_id INT,
  gracz1_gold INT DEFAULT 0, gracz2_gold INT DEFAULT 0,
  gracz1_confirm TINYINT DEFAULT 0, gracz2_confirm TINYINT DEFAULT 0,
  status ENUM('aktywna','zakonczona','anulowana') DEFAULT 'aktywna',
  data TIMESTAMP DEFAULT NOW()
);
CREATE TABLE handel_przedmioty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sesja_id INT, gracz_id INT, przedmiot_id INT
);
```

**Backend — przez socket.io (realtime):**
```
Emity klienta:     trade_request, trade_accept, trade_cancel,
                   trade_add_item, trade_remove_item, trade_set_gold, trade_confirm, trade_unconfirm
Emity serwera:     trade_request_received, trade_started, trade_updated,
                   trade_completed, trade_cancelled, trade_error
```
- Przy `trade_completed`: atomowa transakcja DB — zamień przedmioty i złoto między graczami
- Walidacja: gracz musi być online i na tej samej mapie (odległość ≤ 3 kafelki)

**Frontend (`TradeModal.jsx` — nowy komponent):**
- Dwa panele (Ja / Partner) — każdy widzi co druga strona oferuje
- Siatka slotów na items (max 8 per strona) + pole złota
- Przycisk "Potwierdź" (zielony gdy obaj potwierdzili)
- Zielony tick przy nicku gdy potwierdził, szary gdy nie
- `PlayerProfile.jsx` → przycisk "Handluj" (jeśli na tej samej mapie)
- `Game.jsx` → socket listenery dla trade events

---

### [6] Dom Aukcyjny
**Cel:** Gracze wystawiają przedmioty na sprzedaż, inni kupują przez interfejs.

**Baza danych:**
```sql
CREATE TABLE aukcje (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sprzedawca_id INT, sprzedawca_nazwa VARCHAR(100),
  przedmiot_id INT,                        -- ID z tabeli postac_przedmiot
  przedmiot_snapshot TEXT,                 -- JSON kopia danych itemu
  cena INT NOT NULL,
  data_wystawienia TIMESTAMP DEFAULT NOW(),
  data_wygasniecia TIMESTAMP,
  status ENUM('aktywna','sprzedana','wygasla','anulowana') DEFAULT 'aktywna',
  kupiec_id INT DEFAULT NULL,
  kupiec_nazwa VARCHAR(100) DEFAULT NULL
);
CREATE TABLE aukcje_historia_cen (
  przedmiot_nazwa VARCHAR(100),
  cena INT, data TIMESTAMP DEFAULT NOW()
);
```

**Backend (`routes/auction.js` — nowy plik):**
- `GET    /auction`                       — lista aktywnych aukcji (filtr: typ, klasa, nazwa, cena_min/max)
- `GET    /auction/my`                    — moje wystawione aukcje
- `POST   /auction/list`                  — wystaw przedmiot `{przedmiot_id, cena, godziny: 1-48}`
- `POST   /auction/buy/:id`              — kup natychmiast
- `POST   /auction/cancel/:id`           — anuluj swoją aukcję (item wraca)
- `GET    /auction/price-history/:nazwa`  — historia cen danego przedmiotu (ostatnie 30 dni)

**Integracje:**
- `server/src/index.js` → `cron` co godzinę → wygasaj aukcje po terminie, items wracają do sprzedawcy (przez `postac_przedmioty` lub wiadomość prywatną)
- Prowizja od sprzedaży: 5% złota do skarbca gildii kontrolującej terytorium mapy `mapa_id=1` (Aeldar)

**Frontend (`AuctionHouse.jsx` — nowy komponent, lazy-loaded):**
- Zakładka "Przeglądaj": siatka kart przedmiotów z filtrem + sort (cena ASC/DESC, nowe)
- Zakładka "Moje aukcje": lista z przyciskiem anuluj
- Zakładka "Wystaw": wybierz z plecaka → ustaw cenę → czas wystawienia
- Wykres historii cen (prosty sparkline SVG)
- Dostępny przez hotbar lub NPC "Makler" w Aeldar

---

### [8] Podatki i Ekonomia Terytorialna
**Cel:** Gildia kontrolująca terytorium pobiera % od transakcji na tej mapie.
*(Wymaga: działającego `gildia_terytorium` z Fazy Gildii)*

**Baza danych:**
```sql
ALTER TABLE gildia_terytorium ADD COLUMN IF NOT EXISTS podatek_pct TINYINT DEFAULT 3;
ALTER TABLE gildia_terytorium ADD COLUMN IF NOT EXISTS przychod_total BIGINT DEFAULT 0;
CREATE TABLE podatki_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gildia_id INT, mapa_id INT,
  zrodlo ENUM('aukcja','sklep_npc','handel'),
  kwota INT, data TIMESTAMP DEFAULT NOW()
);
```

**Backend:**
- Funkcja `collectTax(mapaId, kwota, zrodlo)` — sprawdza właściciela terytorium, pobiera %, wrzuca do `gilde.skarbiec`, loguje
- `routes/auction.js` → przy każdej sprzedaży: `collectTax(1, cena*0.05, 'aukcja')`
- `routes/items.js` → przy zakupie od NPC: `collectTax(postac.mapa, cena*0.02, 'sklep_npc')`
- `routes/social.js` → `GET /guild/territory/income` — przychód z podatków dla mojej gildii

**Frontend:**
- `GuildPanel.jsx` → zakładka Terytorium → sekcja "Przychód z podatków" z logiem

---

## FAZA 4 — Nowe Mechaniki Rozgrywki
> *Każdy podpunkt niezależny. Craft wymaga surowców z mobów.*

### [5] System Craftu
**Cel:** Zbieranie surowców, receptury, tworzenie i ulepszanie przedmiotów.

**Baza danych:**
```sql
CREATE TABLE surowce (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nazwa VARCHAR(100), opis VARCHAR(300),
  obrazek VARCHAR(200), rzadkosc ENUM('pospolity','rzadki','epicki') DEFAULT 'pospolity'
);
CREATE TABLE mob_surowce (
  mob_typ VARCHAR(100),   -- nazwa moba lub '*' dla wszystkich
  surowiec_id INT, szansa INT DEFAULT 20  -- % szansa
);
CREATE TABLE postac_surowce (
  postac_id INT, surowiec_id INT, ilosc INT DEFAULT 0,
  PRIMARY KEY (postac_id, surowiec_id)
);
CREATE TABLE receptury (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nazwa VARCHAR(100), opis VARCHAR(300),
  przedmiot_wynikowy_id INT,
  wynik_ilosc INT DEFAULT 1,
  wymagany_poziom INT DEFAULT 1,
  czas_craftu_s INT DEFAULT 5,
  aktywna TINYINT DEFAULT 1
);
CREATE TABLE receptury_skladniki (
  receptura_id INT, surowiec_id INT, ilosc INT
);
CREATE TABLE postac_receptury (
  postac_id INT, receptura_id INT,
  PRIMARY KEY (postac_id, receptura_id)
);
```

**Backend (`routes/craft.js` — nowy plik):**
- `GET  /craft/materials`          — moje surowce ze stanami magazynowymi
- `GET  /craft/recipes`            — receptury (znane + nieznane z zaznaczeniem)
- `POST /craft/create/:recepturaId` — stwórz przedmiot (odejmij surowce, dodaj item)
- `POST /craft/upgrade/:itemId`    — ulepsz item (+1 do +5): losowa szansa sukcesu (90/75/60/40/20%), na fail item nie ginie ale traci materiały

**Integracje:**
- `routes/combat.js` → po zabiciu moba → losuj surowce wg `mob_surowce` → `postac_surowce`
- Receptury zdobywane przez: questy (nagroda), znalezienie (loot), zakup od NPC

**Frontend (`CraftingPanel.jsx` — nowy komponent):**
- Zakładka Surowce: siatka z ilościami i paska rzadkości
- Zakładka Receptury: lista + filtr, kliknij → widok składników z moimi stanami
- Przycisk "Stwórz" (zablokowany jeśli brak składników)
- Zakładka Ulepszanie: wybierz item z plecaka → wybierz materiał wzmacniający → pasek ryzyka
- Dostępny przez NPC Kowal lub hotbar [C]

---

### [10] Wędkarstwo
**Cel:** Minigra przy wodzie — złap rybę poprzez timing-click.

**Baza danych:**
```sql
CREATE TABLE ryby (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nazwa VARCHAR(100), obrazek VARCHAR(200),
  rzadkosc ENUM('pospolita','rzadka','epicka','legendarna') DEFAULT 'pospolita',
  min_poziom INT DEFAULT 1,
  efekt_typ VARCHAR(50) DEFAULT NULL,   -- 'hp_regen','exp_bonus','craft_material' lub NULL
  efekt_wartosc INT DEFAULT 0,
  wartosc_sprzedazy INT DEFAULT 10,
  dostepna_na_mapach VARCHAR(200) DEFAULT '*'  -- JSON array ID map lub '*'
);
CREATE TABLE postac_wedkarstwo (
  postac_id INT PRIMARY KEY,
  ryby_zlapane INT DEFAULT 0,
  najrzadsza_ryba INT DEFAULT NULL,
  zloty_haczyk TINYINT DEFAULT 0  -- odblokowany po 100 rybach
);
CREATE TABLE wedkarstwo_ranking (
  postac_id INT PRIMARY KEY, postac_nazwa VARCHAR(100),
  ryby_total INT DEFAULT 0, punkty INT DEFAULT 0
);
```

**Backend (`routes/fishing.js` — nowy plik):**
- `GET  /fishing/spot-check`           — sprawdź czy kafelek jest wodą (można łowić)
- `POST /fishing/cast`                 — zarzuć wędkę: serwer losuje czas oczekiwania (3-15s) i rybę
- `POST /fishing/catch`               — gracz kliknął w czasie okna (±1.5s): sukces → ryba do plecaka
- `POST /fishing/sell-all`            — sprzedaj wszystkie ryby za złoto
- `GET  /fishing/ranking`             — top 20 wędkarzy
- `GET  /fishing/my-stats`            — moje statystyki wędkarskie

**Integracje:**
- `routes/combat.js` → przy użyciu ryby jako konsumabla → efekt (hp_regen/exp_bonus)
- Specjalne ryby są składnikami receptur craftowych (Faza 4)
- Wędka jako przedmiot w plecaku (wymagana do łowienia)

**Frontend:**
- `FishingMinigame.jsx` — komponent overlay gdy gracz kliknie "Łów" przy wodzie:
  - Animowany spławik (CSS animation kołysanie)
  - Po losowym czasie: spławik "tonie" — pojawia się okno 3s
  - Klik w oknie → animacja złowienia + toast z nazwą ryby
  - Miss → toast "Ryba uciekła!"
- `GameMap.jsx` → kafelki wody klikalne gdy gracz ma wędkę w plecaku
- `RightPanel.jsx` → zakładka "Ranking Wędkarzy"

---

### [1] System Umiejętności Pasywnych (Drzewko Talentów)
**Cel:** Drzewko talentów per klasa (3 ścieżki × 5 umiejętności). Punkty za każdy poziom.

**Baza danych:**
```sql
CREATE TABLE talenty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  klasa VARCHAR(50),
  sciezka VARCHAR(50),         -- np. 'tarcza','atak','berserk'
  pozycja INT,                 -- 1-5 w ścieżce
  nazwa VARCHAR(100),
  opis VARCHAR(300),
  ikona VARCHAR(10),
  efekt_typ VARCHAR(50),       -- 'bonus_ac','bonus_dmg','bonus_hp','bonus_crit' etc.
  efekt_wartosc_per_lvl INT,   -- wartość na każdy poziom talentu
  max_poziom INT DEFAULT 5,
  wymaga_talent_id INT DEFAULT NULL,  -- poprzedni talent w ścieżce
  wymaga_sciezka_punkty INT DEFAULT 0 -- min. punktów w ścieżce
);
CREATE TABLE postac_talenty (
  postac_id INT, talent_id INT, poziom INT DEFAULT 0,
  PRIMARY KEY (postac_id, talent_id)
);
ALTER TABLE postac ADD COLUMN IF NOT EXISTS punkty_talentow INT DEFAULT 0;
```

**Backend (`routes/talents.js` — nowy plik):**
- `GET  /talents/tree`        — drzewo talentów dla mojej klasy + moje punkty w każdym
- `POST /talents/invest`      — zainwestuj punkt w talent `{talent_id}` (sprawdź prereqs)
- `POST /talents/reset`       — reset wszystkich talentów (koszt: 1000g × prestige_level + 500g)
- `GET  /talents/preview/:id` — podgląd efektów talentu

**Integracje:**
- `game/stats.js` → `computeStats()` pobiera talenty gracza i dodaje bonusy do statystyk
- `routes/auth.js` → przy awansie na poziom → `punkty_talentow += 1`

**Frontend (`TalentTree.jsx` — nowy komponent):**
- 3 kolumny (ścieżki), 5 rzędów (poziomy)
- Każdy talent: hexagonalna karta z ikoną, tooltipem (opis + efekt na każdy lvl)
- Linie łączące talenty w ścieżce
- Zaznaczenie: szary (niedostępny), ciemny (dostępny), złoty (zainwestowany)
- Przycisk "+" przy dostępnym talencie
- Licznik punktów na górze: "Dostępne punkty: 3"
- Dostępny przez `CharPanel.jsx` → zakładka "Talenty [T]"

**Seed talentów dla każdej klasy (18 per klasa × 6 klas = 108 talentów):**
- Wojownik: Ścieżka Tarczy (AC,blok,kontra) / Ścieżka Miecza (dmg,crit,przebicie) / Ścieżka Weterana (HP,regen,resist)
- Mag: Ogień/Lód/Błyskawica
- Paladyn: Święta Tarcza/Uzdrowienie/Kara
- itd.

---

## FAZA 5 — Zawartość Endgame
> *Każdy podpunkt niezależny. Bossowie i dungeony wymagają działającej walki i questów.*

### [9] System Bossów Świata (World Boss)
**Cel:** Co 6h pojawia się boss na losowej mapie. Nagroda dla top 5 DPS + wszyscy uczestnicy.

**Baza danych:**
```sql
CREATE TABLE world_boss (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nazwa VARCHAR(100), obrazek VARCHAR(200),
  mapa_id INT, x INT, y INT,
  zycie BIGINT, zycie_max BIGINT,
  poziom INT DEFAULT 50,
  status ENUM('oczekuje','aktywny','martwy') DEFAULT 'oczekuje',
  data_pojawienia TIMESTAMP,
  data_smierci TIMESTAMP NULL
);
CREATE TABLE world_boss_uczestnicy (
  boss_id INT, postac_id INT, postac_nazwa VARCHAR(100),
  obrazenia_zadane BIGINT DEFAULT 0,
  PRIMARY KEY (boss_id, postac_id)
);
CREATE TABLE world_boss_nagrody (
  id INT AUTO_INCREMENT PRIMARY KEY,
  boss_id INT, postac_id INT, typ VARCHAR(20),
  exp INT, gold INT, data TIMESTAMP DEFAULT NOW()
);
```

**Backend (`routes/worldboss.js` + server/src/index.js):**
- `GET  /worldboss/active`        — aktywny boss (pozycja, HP%, timer)
- `POST /worldboss/attack`        — zadaj obrażenia (używa mechaniki walki)
- `GET  /worldboss/leaderboard`   — ranking obrażeń aktywnego bossa
- `GET  /worldboss/history`       — ostatnie 10 bossów + nagrody
- `cron co 6h` → wybierz losową mapę (maks_x>40), utwórz bossa, broadcast socket `world_boss_spawned`
- Po śmierci: sortuj uczestników wg DMG → top 5 dostaje unikalny loot, wszyscy dostają exp/gold

**Integracje:**
- `server/src/index.js` → socket broadcast `world_boss_spawned` (ogłoszenie na czacie globalnym)
- `routes/combat.js` → specjalna akcja `attack_world_boss`
- Loot bossów: unikalne przedmioty tylko z world bossów (nowe rekordy w `przedmiot_loot`)

**Frontend:**
- `WorldBossUI.jsx` — floating panel w prawym górnym rogu (gdy boss aktywny):
  - Nazwa bossa + pasek HP + % HP
  - "Moje obrażenia: 12,450" + pozycja w rankingu
  - Przycisk "Teleportuj do bossa" (kosztuje 50g, przenosi na mapę bossa)
- Toast globalny przy spawnie: "⚔ [Boss] Smok Czarnej Nocy pojawił się na mapie Uroczysko!"
- `RightPanel.jsx` → sekcja World Boss gdy aktywny

---

### [2] Dungeony Instancyjne
**Cel:** Losowo generowana lochownia dla drużyny. Skalowanie do poziomu grupy, timer 30 min, unikalne looty.

**Baza danych:**
```sql
CREATE TABLE dungeony_szablony (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nazwa VARCHAR(100), opis VARCHAR(300),
  min_poziom INT DEFAULT 1, max_poziom INT DEFAULT 500,
  min_graczy INT DEFAULT 1, max_graczy INT DEFAULT 5,
  rozmiar_x INT DEFAULT 20, rozmiar_y INT DEFAULT 20,
  czas_limit_min INT DEFAULT 30,
  boss_mob_id INT,
  nagroda_exp_base INT DEFAULT 1000,
  nagroda_gold_base INT DEFAULT 500
);
CREATE TABLE dungeony_sesje (
  id INT AUTO_INCREMENT PRIMARY KEY,
  szablon_id INT,
  mapa_id INT,                 -- tymczasowa mapa tworzona w tabeli 'mapa'
  status ENUM('aktywna','zakonczona','wygasla') DEFAULT 'aktywna',
  data_start TIMESTAMP DEFAULT NOW(),
  data_koniec TIMESTAMP NULL,
  seed INT,                    -- ziarno do generatora losowego
  ukonczone TINYINT DEFAULT 0
);
CREATE TABLE dungeony_gracze (
  sesja_id INT, postac_id INT, dolaczyl TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (sesja_id, postac_id)
);
```

**Backend (`routes/dungeons.js` — nowy plik):**
- `POST /dungeons/create` `{szablon_id}` — stwórz sesję:
  1. Utwórz tymczasową mapę w tabeli `mapa` (unikalne ID)
  2. Wygeneruj układ (blokery) wg seeda
  3. Umieść moby skalowane do poziomu lidera
  4. Teleportuj twórcę na mapę
- `POST /dungeons/join/:sesjaId` — dołącz do sesji (teleport)
- `POST /dungeons/leave`         — opuść dungeon (teleport z powrotem)
- `GET  /dungeons/active`        — aktywna sesja dla mnie
- `GET  /dungeons/list`          — dostępne szablony
- Cron co 5 min → wygasaj sesje po 30 min, usuń tymczasowe mapy, teleportuj pozostałych graczy

**Generowanie mapy:**
```javascript
function generateDungeon(seed, sizeX, sizeY) {
  // Prosty algorytm Drunk Walk / BSP
  // Zwraca tablicę blokerów [{x,y}] tworzących ściany
  // Korytarze między pokojami zawsze przejezdne
  // Punkt wejścia: (1,1), Boss: (sizeX-2, sizeY-2)
}
```

**Frontend:**
- `DungeonFinder.jsx` — panel wyboru dungeona:
  - Lista szablonów z wymogami poziomu/graczy
  - Aktywna sesja jeśli już trwa
  - Timer do końca sesji
- `Game.jsx` → specjalny HUD na dungeon mapie: timer, postęp (Zabici: 5/20), przycisk wyjścia
- Minimap pokazuje układ dungeona po odkryciu kafelków

---

### [15] Offline Progress / Autofarming
**Cel:** Gracz ustawia autofarming na wybranej mapie max 2h. Po powrocie widzi raport.

**Baza danych:**
```sql
CREATE TABLE offline_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postac_id INT UNIQUE,
  mapa_id INT,
  data_start TIMESTAMP DEFAULT NOW(),
  data_koniec TIMESTAMP,
  status ENUM('aktywny','zakończony') DEFAULT 'aktywny',
  wynik_exp INT DEFAULT 0,
  wynik_gold INT DEFAULT 0,
  wynik_kills INT DEFAULT 0,
  wynik_items TEXT DEFAULT '[]'  -- JSON lista zdobytych items
);
```

**Backend (`routes/offline.js` — nowy plik):**
- `POST /offline/start` `{mapa_id, godziny: 1-2}` — zacznij autofarming:
  - Sprawdź: gracz online, mapa istnieje, poziom gracza ≥ poziom mobów
  - Oznacz `zalogowany=2` (offline farm), ustaw timer
- `POST /offline/collect` — zbierz wyniki (gdy gracz wróci):
  - Oblicz wyniki wg czasu i statystyk mapy (avg exp/kill × kills/h)
  - Dodaj exp/gold/items do postaci
  - Ustaw `zalogowany=0`
- `GET  /offline/status`  — czy aktywne, ile czasu zostało, podgląd szacunkowych wyników

**Serwer (background job):**
```javascript
// Co minutę przetwarzaj aktywne sesje offline
setInterval(async () => {
  const [sessions] = await db.query(
    "SELECT * FROM offline_progress WHERE status='aktywny' AND data_koniec < NOW()"
  );
  for (const s of sessions) {
    await finalizeOfflineSession(s);
  }
}, 60_000);
```

**Logika kalkulacji (`finalizeOfflineSession`):**
1. Pobierz moby na mapie — oblicz `avg_exp = AVG(mob.exp)`, `avg_gold = AVG(loot_value)`
2. `kills_per_hour = 30` (hardcoded, zbalansować)
3. Uwzględnij modyfikatory serwera (xp_multiplier, loot_chance)
4. Losowo wybierz items z paczek loot (z prawdopodobieństwem × czas)
5. Zapisz wyniki w `offline_progress`, dodaj do postaci

**Frontend:**
- `OfflineProgress.jsx` — modal przy logowaniu jeśli sesja zakończona:
  - Raport: "+1,250 EXP · +340g · 47 kills · 2 przedmioty"
  - Animacja "leci do tobołka"
  - Przycisk "Odbierz wszystko"
- `CharPanel.jsx` → przycisk "Autofarming" pod statystykami (aktywny/nieaktywny toggle)
- Gdy autofarming aktywny: pasek postępu z timerem w CharPanel

---

## Podsumowanie faz

| Faza | Funkcje | Złożoność | Zależności |
|------|---------|-----------|------------|
| **1** — Progresja i Tożsamość | Tytuły, Profil, Prestige | Średnia | Brak |
| **2** — Atmosfera | Pogoda/Pora dnia, Eventy sezonowe | Niska | Brak |
| **3** — Ekonomia | Handel P2P, Aukcje, Podatki | Wysoka | Podatki → Terytoria gildii |
| **4** — Nowe Mechaniki | Craft, Wędkarstwo, Talenty | Wysoka | Craft → surowce z walki |
| **5** — Endgame | World Boss, Dungeony, Offline | Bardzo wysoka | Walka, Questy |

### Kolejność sugerowana
```
Faza 2 → Faza 1 → Faza 3 → Faza 4 → Faza 5
```
*(Atmosfera najprostsza do wdrożenia i nie blokuje niczego. Prestige i Tytuły wzmacniają resztę.)*
