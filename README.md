# Veldoria — kod gry

Przeglądarkowe MMORPG w stylu Margonema: serwer Node/Express + socket.io,
klient React/Vite, baza MariaDB. To repozytorium zawiera **sam kod** — bez
grafik gry.

## Co jest w środku

| Katalog | Zawartość |
|---|---|
| `server/` | API, logika walki, ekonomia, świat, migracje, socket.io |
| `client/` | interfejs gry (React), własny silnik kafli 2D, edytor map, panel admina |
| `deploy/` | Dockerfile, docker-compose, skrypty instalacji i aktualizacji, panel VPS |
| `tools/atlas/` | narzędzia do budowy atlasu kafli z arkusza grafik |
| `docs/` | notatki projektowe |

## Grafiki

Grafik gry (sprite'y, atlas kafli, tła) **nie ma w repozytorium** — to cudze
prawa autorskie, więc nie rozpowszechniamy ich publicznie. Serwer serwuje je
z katalogu montowanego jako wolumen:

```
/assets  ->  $ASSETS_DIR  (domyślnie /opt/veldoria/data/assets)
```

Żeby uruchomić grę lokalnie lub na własnym serwerze, podłóż tam własny zestaw
grafik o takiej strukturze:

```
assets/
  kafle/atlas.png     # atlas kafli i obiektów (budowany z tools/atlas)
  avatar/ mob/ npc/ przedmiot/ guild/   # sprite'y postaci, potworów, NPC, itemów
```

Silnik kafli działa też bez atlasu — wtedy rysuje teren i obiekty kodem
(`client/src/engine/tiles2d.js`), więc świat jest grywalny od razu.

Atlas budujemy narzędziami z `tools/atlas/` (patrz tamtejszy README) i wgrywamy
na serwer do `assets/kafle/atlas.png`. `deploy/update.sh` nie kopiuje już grafik
z repo — jeśli ich w drzewie nie ma, zostawia zawartość wolumenu bez zmian.

## Uruchomienie lokalne

```bash
# serwer
cd server && npm install && cp .env.example .env   # uzupełnij dane bazy
node src/index.js

# klient
cd client && npm install && npm run dev
```

## Instalacja na serwerze

```bash
sudo sh deploy/install.sh          # docker compose: gra + baza + panel
sudo sh deploy/update.sh           # aktualizacja z GitHuba i restart
```

Panel administracyjny VPS-a stoi domyślnie na porcie `9798`, gra na `3002`.

## Współpraca

Pull requesty mile widziane. Zgłoszenia błędów i pomysłów — przez Issues.
