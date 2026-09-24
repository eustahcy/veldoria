#!/bin/bash
# Instalacja / aktualizacja Veldorii na VPS.
# Użycie (jako root):  bash install.sh /tmp/veldoria-app.tar.gz
# Bezpieczne do ponownego uruchomienia: nie nadpisuje .env, bazy ani wgranych grafik.
set -euo pipefail

TARBALL="${1:?Podaj ścieżkę do paczki z kodem}"
BASE=/opt/veldoria
PUBLIC_IP="${PUBLIC_IP:-$(hostname -I | awk '{print $1}')}"
APP_PORT="${APP_PORT:-3002}"
PANEL_PORT="${PANEL_PORT:-9798}"

echo "== 1/6 Kod"
mkdir -p "$BASE/app" "$BASE/backups" "$BASE/data"
rm -rf "$BASE/app.new" && mkdir "$BASE/app.new"
tar xzf "$TARBALL" -C "$BASE/app.new"
rm -rf "$BASE/app.old"; [ -d "$BASE/app" ] && mv "$BASE/app" "$BASE/app.old"
mv "$BASE/app.new" "$BASE/app"

echo "== 2/6 Grafiki gry (/assets)"
if [ ! -d "$BASE/data/assets" ]; then
  if [ -d "$BASE/app/original/MAEGONEM_pliki" ]; then
    cp -a "$BASE/app/original/MAEGONEM_pliki" "$BASE/data/assets"
  else
    mkdir -p "$BASE/data/assets"
    echo "UWAGA: repo nie zawiera grafik — wgraj je do $BASE/data/assets (patrz README)."
  fi
  echo "   skopiowano"
else
  # Nowe pliki z paczki dokładamy, istniejących (w tym wgranych przez panel admina) nie ruszamy
  [ -d "$BASE/app/original/MAEGONEM_pliki" ] && cp -an "$BASE/app/original/MAEGONEM_pliki/." "$BASE/data/assets/" || true
  echo "   uzupełniono brakujące"
fi
chown -R 1000:1000 "$BASE/data/assets"   # użytkownik "node" w kontenerze

echo "== 3/6 Konfiguracja (.env)"
if [ ! -f "$BASE/.env" ]; then
  rnd() { head -c 48 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c "$1"; }
  cat > "$BASE/.env" <<EOF
DB_NAME=oldmargonem
DB_USER=veldoria
DB_PASS=$(rnd 32)
DB_ROOT_PASS=$(rnd 32)
SESSION_SECRET=$(rnd 64)
CLIENT_URL=http://$PUBLIC_IP:$APP_PORT
APP_PORT=$APP_PORT
ASSETS_DIR=$BASE/data/assets
EOF
  echo "   utworzono (losowe hasła)"
else
  echo "   istnieje — bez zmian"
fi
chmod 600 "$BASE/.env"

echo "== 4/6 Obraz i baza"
COMPOSE=(docker compose -f "$BASE/app/deploy/docker-compose.yml" --env-file "$BASE/.env")
"${COMPOSE[@]}" build app
"${COMPOSE[@]}" up -d db
for i in $(seq 1 60); do
  [ "$(docker inspect -f '{{.State.Health.Status}}' veldoria-db-1 2>/dev/null)" = healthy ] && break
  sleep 2
done
echo "   baza: $(docker inspect -f '{{.State.Health.Status}}' veldoria-db-1)"

echo "== 5/6 Gra"
TABLES=$(docker exec veldoria-db-1 sh -c 'mariadb -N -uroot -p"$MARIADB_ROOT_PASSWORD" -e "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=\"$MARIADB_DATABASE\""')
if [ "$TABLES" = "0" ]; then
  echo "   pusta baza — inicjalizacja"
  VELDORIA_DIR="$BASE" sh "$BASE/app/deploy/init-db.sh"
else
  "${COMPOSE[@]}" up -d app
fi

echo "== 6/6 Panel"
mkdir -p "$BASE/panel"
cp "$BASE/app/deploy/panel/app.py" "$BASE/panel/app.py"
if [ ! -x "$BASE/panel/venv/bin/gunicorn" ]; then
  python3 -m venv "$BASE/panel/venv"
  "$BASE/panel/venv/bin/pip" install -q -r "$BASE/app/deploy/panel/requirements.txt"
fi
if [ ! -f /etc/veldoria-panel.env ]; then
  PANEL_PASS=$(head -c 48 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 16)
  HASH=$("$BASE/panel/venv/bin/python" -c "import sys; sys.path.insert(0,'$BASE/panel'); import app; print(app.hash_password(sys.argv[1]))" "$PANEL_PASS")
  cat > /etc/veldoria-panel.env <<EOF
VELDORIA_DIR=$BASE
PANEL_PORT=$PANEL_PORT
GAME_PORT=$APP_PORT
PANEL_SECRET_KEY=$(head -c 48 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 64)
PANEL_PASSWORD_HASH=$HASH
EOF
  chmod 600 /etc/veldoria-panel.env
  echo "   HASŁO PANELU (zapisz, nie zostanie pokazane ponownie): $PANEL_PASS"
fi
cp "$BASE/app/deploy/panel/veldoria-panel.service" "$BASE/app/deploy/panel/veldoria-backup.service" \
   "$BASE/app/deploy/panel/veldoria-backup.timer" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now veldoria-backup.timer >/dev/null
systemctl enable veldoria-panel >/dev/null
systemctl restart veldoria-panel

echo
echo "Gra:   http://$PUBLIC_IP:$APP_PORT"
echo "Panel: http://$PUBLIC_IP:$PANEL_PORT"
