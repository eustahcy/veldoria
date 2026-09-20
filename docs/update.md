# WorldEditor — Plan Rozbudowy

## Stan bazowy
- `WorldEditor.jsx` — 6 zakładek: Edytor mapy, Wrogowie, NPC, Portale, Przedmioty, Loot paczki
- API: `/world/*` — maps, mobs, npcs, portals, blockers, items-loot, shop-items, loot-packs
- Kanwa (MapTileEditor): tryby blocker/podgląd, overlay mobów/NPC/portali

---

## Faza 1 — Quick wins (czysto frontend, brak zmian API)
- [x] **1.1 Klonowanie moba/NPC** ✅ — przycisk "📋 Klonuj" w akcjach moba/NPC; duplikuje z nazwą `(kopia)` i offsetem +2 X
- [x] **1.2 Loot probability bars** ✅ — wizualna belka % dla każdego wpisu w paczce loot; zielona≥50%, żółta≥15%, czerwona<15%; sortowanie od najwyższej
- [x] **1.3 Level scaling preview** ✅ — przycisk "📊 Podgląd" otwiera kartę ze sliderem 1–500; mnożnik = previewLevel / mob.poziom; pokazuje skalowane HP/ATK avg/AC/EXP z oryginalnym w podpisie; pasek mnożnika (zielony<1× żółty=1× czerwony>2×)

---

## Faza 2 — Integracja z kanwą
- [x] **2.1 Canvas → pick X,Y** ✅ — przycisk "📍 Ustaw na mapie" / "📍 Mapa" w MobEditor/NpcEditor; zielony baner na kanwie; kliknięcie kafla wraca z X,Y i przełącza zakładkę z powrotem

---

## Faza 3 — Wyszukiwanie i nawigacja
- [x] **3.1 Globalny search** ✅ — nowa zakładka "🔍 Szukaj"; wpisanie + Enter/przycisk → równoległe zapytania do wszystkich map; wyniki pogrupowane po mapie; kliknięcie → setMapId + setTab

---

## Faza 4 — Operacje masowe
- [x] **4.1 Multi-select + bulk delete** ✅ — checkboxy na liście mobów/NPC; nagłówek "zaznacz wszystko"; `Usuń zaznaczone (N)` z potwierdzeniem; autoczyści sel jeśli usunięty
- [x] **4.2 Bulk-edit respawn/loot** ✅ — panel `☑ Zaznaczono N z M` z polami respawn\_time + paczka; puste pole = bez zmian; `Zastosuj do zaznaczonych`; NPC ma tylko bulk delete

---

## Faza 5 — Export / Import / Szablony
- [x] **5.1 Export mapy do JSON** ✅ — przycisk "⬇ Eksportuj JSON" w pasku narzędzi mapy; pobiera mobs+npcs+portals+blockers; plik `mapa_ID_Nazwa.json`
- [x] **5.2 Import mapy z JSON** ✅ — "⬆ Importuj JSON" otwiera plik; podgląd liczby obiektów; tryb "➕ Dodaj" lub "🔄 Zastąp wszystko" (usuwa istniejące przed dodaniem); potwierdź → `✓ Importuj do mapy #N`
- [x] **5.3 Szablony mobów** ✅ — "💾 Szablon" przy edycji moba zapisuje do localStorage (`mob_templates_v1`, max 20); "📋 Z szablonu (N)" przy dodawaniu otwiera picker; kliknięcie wypełnia formularz; usuwanie pojedynczych szablonów

---

## Faza 6 — Historia i zaawansowane
- [x] **6.1 Undo/Redo (Ctrl+Z)** ✅ — `undoStack useRef` + `execUndoRef` (stable keyboard handler); Ctrl+Z cofa ostatnią akcję; save/del/bulkDelete pushują wpisy; przycisk "↩ Cofnij (N)" w MobEditor + NpcEditor
- [x] **6.2 Edytor stref (Zones)** ✅ — migracja `strefy TEXT` na tabeli `mapa`; `PUT /world/maps/:id`; tryb 🟩 Strefy; drag-to-draw (mousedown→up); dashed preview; 5 typów (no\_pvp, safe, danger, event, fog); panel z listą + formularz; renderowanie na kanwie; info panel w trybie podgląd

---

## Postęp
| Faza | Status |
|------|--------|
| 1 — Quick wins | 3/3 ✅ |
| 2 — Kanwa pick | 1/1 ✅ |
| 3 — Search | 1/1 ✅ |
| 4 — Bulk ops | 2/2 ✅ |
| 5 — Export/Import | 3/3 ✅ |
| 6 — Zaawansowane | 2/2 ✅ |
