// Wspólna obsługa przedmiotów postaci — jedno miejsce zamiast kilkunastu
// skopiowanych INSERT INTO przedmiot_postac.

// Kolumny przedmiotu kopiowane z szablonu (przedmiot_loot / przedmiot_sklep / snapshot aukcji)
const ITEM_COLUMNS = [
  'nazwa', 'klasa', 'typ', 'obrazek', 'wym_poziom',
  'prof1', 'prof2', 'prof3', 'prof4', 'prof5', 'prof6',
  'wartosc_sprzedazy',
  'zycie', 'sa', 'ac', 'acm', 'obr_min', 'obr_max', 'mnoznik', 'mnoznik_typ',
  'sila', 'zrecznosc', 'intelekt', 'wszystkie_cechy', 'ck', 'ckf', 'ckm',
  'acp', 'absorbcja', 'mabsorbcja', 'leczenie', 'unik', 'blok', 'energia', 'mana',
  'przebicie', 'obr_mag', 'obr_poi', 'glebokarana', 'atak_gr', 'kontra',
  'obnizac', 'obnizacm', 'obnizsa', 'zycie_za_sile',
  'ilosc', 'mikstura_leczenie', 'pelne_leczenie', 'opis',
];

const STRING_COLUMNS = new Set(['nazwa', 'klasa', 'typ', 'obrazek', 'opis']);

// Wartości domyślne zgodne z dotychczasowym kodem (ckf/ckm=120, klasa 'normal', ilosc 1)
const DEFAULTS = { klasa: 'normal', ckf: 120, ckm: 120, ilosc: 1 };

function normalizeItem(item) {
  const row = {};
  for (const col of ITEM_COLUMNS) {
    const v = item[col];
    if (v !== undefined && v !== null && v !== '' && !(v === 0 && col in DEFAULTS)) {
      row[col] = v;
    } else if (col in DEFAULTS) {
      row[col] = DEFAULTS[col];
    } else {
      row[col] = STRING_COLUMNS.has(col) ? '' : 0;
    }
  }
  return row;
}

/**
 * Daje postaci przedmiot. `db` może być pulą albo połączeniem w transakcji.
 * `overrides` nadpisuje pojedyncze pola (np. { wartosc_sprzedazy: 50 }).
 * Zwraca id nowego przedmiotu.
 */
async function giveItem(db, postacId, item, overrides = {}) {
  const row = normalizeItem({ ...item, ...overrides });
  const cols = ['postac', ...ITEM_COLUMNS, 'zalozony'];
  const vals = [postacId, ...ITEM_COLUMNS.map(c => row[c]), 0];
  const [res] = await db.query(
    `INSERT INTO przedmiot_postac (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
    vals
  );
  return res.insertId;
}

// Pola zapisywane w snapshocie aukcji — pełny zestaw, żeby przedmiot nie tracił statystyk
function itemSnapshot(item) {
  const snap = {};
  for (const col of ITEM_COLUMNS) snap[col] = item[col] ?? null;
  return snap;
}

// prof1..prof6 w kolejności z oryginalnego ekwipunek.php
const PROF_FLAGS = {
  prof1: 'Wojownik',
  prof2: 'Paladyn',
  prof3: 'Tancerz Ostrzy',
  prof4: 'Lowca',
  prof5: 'Tropiciel',
  prof6: 'Mag',
};

/**
 * Czy postać może założyć przedmiot. Zwraca null gdy tak, albo komunikat błędu.
 * Brak ustawionych flag prof* = przedmiot dla każdej klasy.
 */
function equipError(postac, item) {
  if ((item.wym_poziom || 0) > (postac.poziom || 0)) {
    return `Wymagany poziom: ${item.wym_poziom}`;
  }
  const allowed = Object.entries(PROF_FLAGS)
    .filter(([flag]) => Number(item[flag]) === 1)
    .map(([, prof]) => prof);
  if (allowed.length && !allowed.includes(postac.profesja)) {
    return `Wymagana profesja: ${allowed.join(', ')}`;
  }
  return null;
}

module.exports = { ITEM_COLUMNS, giveItem, itemSnapshot, equipError, normalizeItem, PROF_FLAGS };
