const test = require('node:test');
const assert = require('node:assert/strict');
const { createFakeDb } = require('./helpers/fakeDb');
const {
  listAuction, buyAuction, cancelAuction, expireAuction, executeTrade,
} = require('../src/game/economy');

const SELLER = 1, BUYER_A = 2, BUYER_B = 3;

function worldWithAuction({ cena = 100, buyerGold = 500 } = {}) {
  return createFakeDb({
    postac: [
      { id: SELLER,  nazwa: 'Sprzedawca', zloto: 0 },
      { id: BUYER_A, nazwa: 'KupiecA',    zloto: buyerGold },
      { id: BUYER_B, nazwa: 'KupiecB',    zloto: buyerGold },
    ],
    aukcje: [{
      id: 1, sprzedawca_id: SELLER, sprzedawca_nazwa: 'Sprzedawca', cena, status: 'aktywna',
      przedmiot_snapshot: JSON.stringify({ nazwa: 'Miecz', typ: 'Bron', klasa: 'unikat', obr_min: 10, obr_max: 20, mnoznik: 150 }),
    }],
  });
}

const itemsNamed = (db, nazwa) => db.tables.przedmiot_postac.filter(i => i.nazwa === nazwa);
const gold = (db, id) => db.tables.postac.find(p => p.id === id).zloto;

// ── Aukcje ───────────────────────────────────────────────────────────────────

test('kupno aukcji: przedmiot trafia do kupującego, złoto do sprzedawcy', async () => {
  const db = worldWithAuction();
  const r = await buyAuction(db, BUYER_A, 1);
  assert.equal(r.ok, true);
  assert.equal(gold(db, BUYER_A), 400);
  assert.equal(gold(db, SELLER), 100);
  const [miecz] = itemsNamed(db, 'Miecz');
  assert.equal(miecz.postac, BUYER_A);
  assert.equal(miecz.mnoznik, 150, 'snapshot zachowuje pełne statystyki');
});

test('kupno aukcji: dwóch kupujących naraz — tylko jeden dostaje przedmiot, drugi odzyskuje złoto', async () => {
  const db = worldWithAuction();
  const [a, b] = await Promise.all([buyAuction(db, BUYER_A, 1), buyAuction(db, BUYER_B, 1)]);

  assert.equal([a, b].filter(r => r.ok).length, 1);
  assert.equal(itemsNamed(db, 'Miecz').length, 1, 'brak duplikacji przedmiotu');
  assert.equal(gold(db, SELLER), 100, 'sprzedawca zapłacony raz');
  assert.equal(gold(db, BUYER_A) + gold(db, BUYER_B), 900, 'przegrany dostał zwrot');
});

test('kupno aukcji: ten sam kupujący klika dwa razy — płaci raz', async () => {
  const db = worldWithAuction();
  await Promise.all([buyAuction(db, BUYER_A, 1), buyAuction(db, BUYER_A, 1)]);
  assert.equal(gold(db, BUYER_A), 400);
  assert.equal(itemsNamed(db, 'Miecz').length, 1);
});

test('kupno aukcji: za mało złota — nic się nie zmienia', async () => {
  const db = worldWithAuction({ cena: 1000, buyerGold: 50 });
  const r = await buyAuction(db, BUYER_A, 1);
  assert.equal(r.ok, false);
  assert.equal(gold(db, BUYER_A), 50);
  assert.equal(db.tables.aukcje[0].status, 'aktywna');
  assert.equal(itemsNamed(db, 'Miecz').length, 0);
});

test('kupno własnej aukcji jest zablokowane', async () => {
  const db = worldWithAuction();
  const r = await buyAuction(db, SELLER, 1);
  assert.equal(r.ok, false);
});

test('anulowanie i kupno naraz — w grze istnieje dokładnie jeden przedmiot', async () => {
  const db = worldWithAuction();
  await Promise.all([cancelAuction(db, SELLER, 1), buyAuction(db, BUYER_A, 1)]);

  const miecze = itemsNamed(db, 'Miecz');
  assert.equal(miecze.length, 1, 'brak duplikacji przez anulowanie');
  // Złoto zgadza się z tym, kto dostał przedmiot
  if (miecze[0].postac === BUYER_A) {
    assert.equal(gold(db, BUYER_A), 400);
    assert.equal(gold(db, SELLER), 100);
  } else {
    assert.equal(gold(db, BUYER_A), 500);
    assert.equal(gold(db, SELLER), 0);
  }
});

test('wygaśnięcie i kupno naraz — w grze istnieje dokładnie jeden przedmiot', async () => {
  const db = worldWithAuction();
  await Promise.all([expireAuction(db, 1), buyAuction(db, BUYER_A, 1)]);
  assert.equal(itemsNamed(db, 'Miecz').length, 1);
});

test('anulować może tylko sprzedawca', async () => {
  const db = worldWithAuction();
  const r = await cancelAuction(db, BUYER_A, 1);
  assert.equal(r.ok, false);
  assert.equal(db.tables.aukcje[0].status, 'aktywna');
  assert.equal(itemsNamed(db, 'Miecz').length, 0);
});

test('wystawienie tego samego przedmiotu dwa razy naraz tworzy jedną aukcję', async () => {
  const db = createFakeDb({
    postac: [{ id: SELLER, nazwa: 'Sprzedawca', zloto: 0 }],
    przedmiot_postac: [{ id: 7, postac: SELLER, nazwa: 'Tarcza', zalozony: 0 }],
  });
  const results = await Promise.all([
    listAuction(db, SELLER, 7, 50, 24),
    listAuction(db, SELLER, 7, 50, 24),
  ]);
  assert.equal(results.filter(r => r.ok).length, 1);
  assert.equal(db.tables.aukcje.length, 1);
  assert.equal(db.tables.przedmiot_postac.length, 0);
});

test('wystawienie: odrzuca cenę niecałkowitą, zerową i ponad zakres INT', async () => {
  const db = createFakeDb({
    postac: [{ id: SELLER, nazwa: 'S', zloto: 0 }],
    przedmiot_postac: [{ id: 7, postac: SELLER, nazwa: 'Tarcza', zalozony: 0 }],
  });
  for (const cena of [0, -5, 1.5, 'abc', 3_000_000_000]) {
    const r = await listAuction(db, SELLER, 7, cena, 24);
    assert.equal(r.ok, false, `cena ${cena}`);
  }
  assert.equal(db.tables.przedmiot_postac.length, 1);
});

test('wystawienie założonego przedmiotu jest zablokowane', async () => {
  const db = createFakeDb({
    postac: [{ id: SELLER, nazwa: 'S', zloto: 0 }],
    przedmiot_postac: [{ id: 7, postac: SELLER, nazwa: 'Tarcza', zalozony: 1 }],
  });
  const r = await listAuction(db, SELLER, 7, 50, 24);
  assert.equal(r.ok, false);
  assert.equal(db.tables.aukcje.length, 0);
});

// ── Handel ───────────────────────────────────────────────────────────────────

function worldWithTrade(overrides = {}) {
  return createFakeDb({
    postac: [
      { id: 1, nazwa: 'Ala', zloto: 1000 },
      { id: 2, nazwa: 'Ola', zloto: 1000 },
    ],
    przedmiot_postac: [
      { id: 11, postac: 1, nazwa: 'Hełm Ali', zalozony: 0 },
      { id: 22, postac: 2, nazwa: 'Buty Oli', zalozony: 0 },
    ],
    handel_sesje: [{
      id: 5, gracz1_id: 1, gracz2_id: 2, gracz1_gold: 300, gracz2_gold: 0,
      gracz1_confirm: 1, gracz2_confirm: 1, status: 'aktywna',
    }],
    handel_przedmioty: [
      { sesja_id: 5, gracz_id: 1, przedmiot_id: 11 },
      { sesja_id: 5, gracz_id: 2, przedmiot_id: 22 },
    ],
    ...overrides,
  });
}

test('handel: wymiana przedmiotów i złota', async () => {
  const db = worldWithTrade();
  const r = await executeTrade(db, 5);
  assert.equal(r.ok, true);
  assert.equal(gold(db, 1), 700);
  assert.equal(gold(db, 2), 1300);
  assert.equal(db.tables.przedmiot_postac.find(i => i.id === 11).postac, 2);
  assert.equal(db.tables.przedmiot_postac.find(i => i.id === 22).postac, 1);
  assert.equal(db.tables.handel_sesje[0].status, 'zakonczona');
});

test('handel: obaj potwierdzają jednocześnie — wymiana wykonuje się raz', async () => {
  const db = worldWithTrade();
  const [a, b] = await Promise.all([executeTrade(db, 5), executeTrade(db, 5)]);
  assert.equal([a, b].filter(r => r.ok).length, 1);
  assert.equal([a, b].filter(r => r.alreadyDone).length, 1);
  assert.equal(gold(db, 1), 700, 'złoto przelane raz');
  assert.equal(gold(db, 2), 1300);
});

test('handel: przedmiot z oferty sprzedany w międzyczasie — anulowanie bez przelewu złota', async () => {
  const db = worldWithTrade();
  db.tables.przedmiot_postac = db.tables.przedmiot_postac.filter(i => i.id !== 11); // Ala go sprzedała
  const r = await executeTrade(db, 5);
  assert.equal(r.ok, false);
  assert.match(r.reason, /nie jest już dostępny/);
  assert.equal(gold(db, 1), 1000);
  assert.equal(gold(db, 2), 1000);
  assert.equal(db.tables.przedmiot_postac.find(i => i.id === 22).postac, 2, 'przedmiot Oli nie przeszedł');
  assert.equal(db.tables.handel_sesje[0].status, 'anulowana');
});

test('handel: przedmiot z oferty został w międzyczasie założony — anulowanie', async () => {
  const db = worldWithTrade();
  db.tables.przedmiot_postac.find(i => i.id === 11).zalozony = 1;
  const r = await executeTrade(db, 5);
  assert.equal(r.ok, false);
  assert.equal(db.tables.przedmiot_postac.find(i => i.id === 11).postac, 1);
});

test('handel: za mało złota — anulowanie bez zmian', async () => {
  const db = worldWithTrade();
  db.tables.postac.find(p => p.id === 1).zloto = 100; // oferuje 300
  const r = await executeTrade(db, 5);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'Za mało złota');
  assert.equal(gold(db, 1), 100);
  assert.equal(gold(db, 2), 1000);
  assert.equal(db.tables.przedmiot_postac.find(i => i.id === 11).postac, 1);
});

test('handel: bez obu potwierdzeń nic się nie dzieje', async () => {
  const db = worldWithTrade();
  db.tables.handel_sesje[0].gracz2_confirm = 0;
  const r = await executeTrade(db, 5);
  assert.equal(r.alreadyDone, true);
  assert.equal(gold(db, 1), 1000);
  assert.equal(db.tables.handel_sesje[0].status, 'aktywna');
});
