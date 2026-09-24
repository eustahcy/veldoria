#!/bin/sh
# Aktualizacja gry z GitHuba: pull (tylko fast-forward) → grafiki → przebudowa i restart.
# Używane przez panel (przycisk "Aktualizuj z GitHuba").
set -eu
DIR="${VELDORIA_DIR:-/opt/veldoria}"
export GIT_SSH_COMMAND="ssh -i $DIR/deploy_key -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
cd "$DIR/app"

OLD=$(git rev-parse --short HEAD)
git fetch --quiet origin main
if [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ]; then
  echo "Brak nowych zmian na GitHubie (wersja $OLD)."
  exit 0
fi
echo "Nowe commity:"
git log --oneline HEAD..origin/main
# --ff-only: nigdy nie nadpisuje lokalnych zmian na serwerze — jeśli jakieś są, zatrzymuje się
git merge --ff-only origin/main

# Grafiki: publiczne repo ich nie zawiera, więc kopiujemy tylko jeśli są w drzewie.
# Wgranych w grze nie ruszamy (-n), a atlas kafli nadpisujemy zawsze, bo jest
# generowany razem z kodem i musi pasować do wersji silnika.
GRAFIKI="$DIR/app/original/MAEGONEM_pliki"
if [ -d "$GRAFIKI" ]; then
  cp -an "$GRAFIKI/." "$DIR/data/assets/"
  if [ -d "$GRAFIKI/kafle" ]; then
    mkdir -p "$DIR/data/assets/kafle"
    cp -a "$GRAFIKI/kafle/." "$DIR/data/assets/kafle/"
  fi
  chown -R 1000:1000 "$DIR/data/assets"
else
  echo "Repo bez grafik — zostawiam zawartość $DIR/data/assets bez zmian."
fi

docker compose -f "$DIR/app/deploy/docker-compose.yml" --env-file "$DIR/.env" up -d --build app
echo "Zaktualizowano: $OLD → $(git rev-parse --short HEAD)"
