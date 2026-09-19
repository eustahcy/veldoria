#!/bin/sh
# Inicjalizacja pustej bazy Veldorii: zrzut bazowy + wszystkie migracje po kolei.
# Uruchamiane przez install.sh tylko gdy baza jest pusta. Ręcznie:
#   VELDORIA_DIR=/opt/veldoria sh /opt/veldoria/app/deploy/init-db.sh
set -eu
DIR="${VELDORIA_DIR:-/opt/veldoria}"
COMPOSE="docker compose -f $DIR/app/deploy/docker-compose.yml --env-file $DIR/.env"
sql() { $COMPOSE exec -T db sh -c 'exec mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE"'; }
node_mig() { echo "== $1"; $COMPOSE run --rm -T app node "server/src/migrations/$1.js"; }

echo "== zrzut bazowy (margonem.sql)"
sql < "$DIR/app/server/margonem.sql"
for m in phase4 phase6_zones phase7_stat_points phase8_prestige phase11_dungeons; do node_mig "$m"; done
echo "== phase10_combat.sql"; sql < "$DIR/app/server/src/migrations/phase10_combat.sql"
# Uruchomienie gry tworzy tabele zakładane w kodzie (questy, gilde, aukcje...) — potrzebne przed phase12/13
$COMPOSE up -d app && sleep 8
echo "== phase12 (InnoDB + utf8mb4)"; $COMPOSE run --rm -T app node server/src/migrations/phase12_innodb_utf8mb4.js --apply
node_mig phase13_schema_uzupelnienie
node_mig phase14_iso_mapy
echo "== phase9_worldboss.sql"; sql < "$DIR/app/server/src/migrations/phase9_worldboss.sql"
$COMPOSE restart app
echo "Baza gotowa."
