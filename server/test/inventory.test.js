const test = require('node:test');
const assert = require('node:assert/strict');
const { equipError, normalizeItem, giveItem, itemSnapshot, ITEM_COLUMNS } = require('../src/game/inventory');

// ── Wymagania ekwipunku ──────────────────────────────────────────────────────

test('equip: za niski poziom', () => {
  assert.match(equipError({ poziom: 5, profesja: 'Mag' }, { wym_poziom: 10 }), /poziom: 10/);
});

test('equip: poziom równy wymaganemu wystarcza', () => {
  assert.equal(equipError({ poziom: 10, profesja: 'Mag' }, { wym_poziom: 10 }), null);
});

test('equip: brak flag profesji = przedmiot dla każdego', () => {
  for (const profesja of ['Wojownik', 'Paladyn', 'Tancerz Ostrzy', 'Lowca', 'Tropiciel', 'Mag']) {
    assert.equal(equipError({ poziom: 1, profesja }, { wym_poziom: 0 }), null, profesja);
  }
});

test('equip: flagi prof1..prof6 w kolejności z oryginalnego ekwipunek.php', () => {
  const order = ['Wojownik', 'Paladyn', 'Tancerz Ostrzy', 'Lowca', 'Tropiciel', 'Mag'];
  order.forEach((profesja, i) => {
    const item = { [`prof${i + 1}`]: 1 };
    assert.equal(equipError({ poziom: 1, profesja }, item), null, `${profesja} może prof${i + 1}`);
    const other = order[(i + 1) % order.length];
    assert.match(equipError({ poziom: 1, profesja: other }, item), /profesja/, `${other} nie może prof${i + 1}`);
  });
});

test('equip: przedmiot dla kilku klas', () => {
  const item = { prof1: 1, prof2: 1 }; // Wojownik + Paladyn
  assert.equal(equipError({ poziom: 1, profesja: 'Paladyn' }, item), null);
  assert.match(equipError({ poziom: 1, profesja: 'Mag' }, item), /Wojownik, Paladyn/);
});

test('equip: flagi jako stringi z bazy ("1"/"0") też działają', () => {
  assert.match(equipError({ poziom: 1, profesja: 'Mag' }, { prof1: '1', prof6: '0' }), /Wojownik/);
});

// ── Tworzenie przedmiotów ────────────────────────────────────────────────────

test('normalizeItem: wartości domyślne jak w dotychczasowym kodzie', () => {
  const row = normalizeItem({ nazwa: 'Ryba' });
  assert.equal(row.klasa, 'normal');
  assert.equal(row.ckf, 120);
  assert.equal(row.ckm, 120);
  assert.equal(row.ilosc, 1);
  assert.equal(row.opis, '');
  assert.equal(row.obr_min, 0);
});

test('normalizeItem: 0 w ckf traktowane jak brak (zgodnie z dawnym `|| 120`)', () => {
  assert.equal(normalizeItem({ ckf: 0 }).ckf, 120);
  assert.equal(normalizeItem({ ckf: 180 }).ckf, 180);
});

test('normalizeItem: ignoruje kolumny spoza listy (np. id, postac z szablonu)', () => {
  const row = normalizeItem({ id: 99, postac: 5, zalozony: 1, nazwa: 'X' });
  assert.equal(row.id, undefined);
  assert.equal(row.postac, undefined);
  assert.equal(row.zalozony, undefined);
});

test('giveItem: liczba kolumn = liczba wartości, zawsze niezałożony', async () => {
  let captured;
  const db = { query: async (sql, params) => { captured = { sql, params }; return [{ insertId: 42 }]; } };
  const id = await giveItem(db, 7, { nazwa: 'Topór', mnoznik: 150, prof1: 1 }, { wartosc_sprzedazy: 25 });

  assert.equal(id, 42);
  const cols = captured.sql.match(/\(([^)]+)\) VALUES/)[1].split(',');
  const placeholders = captured.sql.match(/VALUES \(([^)]+)\)/)[1].split(',');
  assert.equal(cols.length, placeholders.length);
  assert.equal(cols.length, captured.params.length);

  const val = (c) => captured.params[cols.indexOf(c)];
  assert.equal(val('postac'), 7);
  assert.equal(val('zalozony'), 0);
  assert.equal(val('mnoznik'), 150, 'mnożnik nie ginie (błąd dawnej nagrody za quest)');
  assert.equal(val('prof1'), 1, 'flagi profesji nie giną');
  assert.equal(val('wartosc_sprzedazy'), 25, 'override działa');
});

test('itemSnapshot: zawiera wszystkie statystyki przedmiotu', () => {
  const snap = itemSnapshot({ nazwa: 'A', mnoznik: 3, prof2: 1, id: 5, postac: 9 });
  assert.deepEqual(Object.keys(snap).sort(), [...ITEM_COLUMNS].sort());
  assert.equal(snap.mnoznik, 3);
  assert.equal(snap.prof2, 1);
});
