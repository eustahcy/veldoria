# Atlas grafik kafli

Stąd bierze się `client/src/engine/atlas.js` (współrzędne sprite'ów) oraz
`original/MAEGONEM_pliki/kafle/atlas.png` (jeden obrazek ze wszystkimi kaflami
i obiektami). Silnik `client/src/engine/tiles2d.js` rysuje z atlasu wszystko,
co ma przypisany sprite, a resztę dalej rysuje kodem.

## Skąd pochodzą grafiki

`zrodlo/arkusz.png` to arkusz z sześcioma zestawami (podłoże, budynki,
dekoracje, roślinność, mury, wnętrza). Kafel w źródle ma ok. 60 px, my
skalujemy do 32 px.

## Jak przebudować atlas

Potrzebny lokalny serwer HTTP i puppeteer (patrz `tnij.js` / `atlas.js`).

1. `python -m http.server 8777` w katalogu z `arkusz.png` i plikami `*.html`
2. `node tnij.js` — tnie arkusz na pojedyncze sprite'y (usuwa szachownicę
   przezroczystości, cień zamienia na półprzezroczystą czerń) → `wyciete/`
3. w `wybor.js` wybierasz, które sprite'y wchodzą do gry i ile kafli zajmują
4. `node atlas.js` — skaluje, wyrównuje jasność wariantów terenu, pakuje
   w jeden PNG i zapisuje `atlas.png` + `atlas.js`

## Podmiana na inny zestaw grafik

Jeśli pojawią się oryginalne pliki PNG zestawu (zamiast arkusza poglądowego),
wystarczy podmienić źródło i powtórzyć kroki 2–4 — identyfikatory sprite'ów
w `wybor.js` i w silniku zostają te same.
