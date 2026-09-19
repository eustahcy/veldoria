#!/bin/sh
# Kopia bazy Veldorii → /opt/veldoria/backups/veldoria-RRRRMMDD-GGMMSS.sql.gz
# Używane przez panel i przez codzienny timer systemd. Zostawia 30 najnowszych.
set -eu
DIR="${VELDORIA_DIR:-/opt/veldoria}"
OUT="$DIR/backups"
mkdir -p "$OUT"
NAME="veldoria-$(date +%Y%m%d-%H%M%S).sql.gz"
TMP="$OUT/.$NAME.part"
docker compose -f "$DIR/app/deploy/docker-compose.yml" --env-file "$DIR/.env" exec -T db \
  sh -c 'exec mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" --single-transaction --routines --triggers "$MARIADB_DATABASE"' \
  | gzip -9 > "$TMP"
mv "$TMP" "$OUT/$NAME"
ls -1t "$OUT"/veldoria-*.sql.gz | tail -n +31 | xargs -r rm -f
echo "$OUT/$NAME"
