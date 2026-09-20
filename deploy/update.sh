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

# Nowe grafiki z repo dokładamy do wolumenu (istniejących i wgranych w grze nie ruszamy)
cp -an "$DIR/app/original/MAEGONEM_pliki/." "$DIR/data/assets/"
# Atlas kafli jest generowany z repo (a nie wgrywany w grze), wiec ten jeden
# katalog nadpisujemy zawsze — inaczej gra zostaje ze stara grafika.
mkdir -p "$DIR/data/assets/kafle"
cp -a "$DIR/app/original/MAEGONEM_pliki/kafle/." "$DIR/data/assets/kafle/"
chown -R 1000:1000 "$DIR/data/assets"

docker compose -f "$DIR/app/deploy/docker-compose.yml" --env-file "$DIR/.env" up -d --build app
echo "Zaktualizowano: $OLD → $(git rev-parse --short HEAD)"
