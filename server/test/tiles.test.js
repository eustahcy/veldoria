const test = require('node:test');
const assert = require('node:assert/strict');
const { parseTiles, applyTilePatch } = require('../src/game/tiles');

test('parseTiles: pusty/uszkodzony JSON daje pusty zbiór', () => {
  assert.deepEqual(parseTiles(null), {});
  assert.deepEqual(parseTiles(''), {});
  assert.deepEqual(parseTiles('to nie json'), {});
  assert.deepEqual(parseTiles('[1,2]'), {}, 'tablica to nie zbiór kafli');
  assert.deepEqual(parseTiles('{"1,2":{"t":"trawa"}}'), { '1,2': { t: 'trawa' } });
  assert.deepEqual(parseTiles({ '0,0': { t: 'bruk' } }), { '0,0': { t: 'bruk' } }, 'obiekt przechodzi bez zmian');
});

test('malowanie terenu i stawianie obiektu na tym samym polu', () => {
  const k = {};
  applyTilePatch(k, [{ x: 3, y: 4, t: 'bruk' }], { maks_x: 10, maks_y: 10 });
  applyTilePatch(k, [{ x: 3, y: 4, o: 'drzewo' }], { maks_x: 10, maks_y: 10 });
  assert.deepEqual(k['3,4'], { t: 'bruk', o: 'drzewo' }, 'obiekt nie kasuje terenu');
});

test('null usuwa pojedyncze pole, a puste pole znika ze zbioru', () => {
  const k = { '1,1': { t: 'trawa', o: 'dom' } };
  applyTilePatch(k, [{ x: 1, y: 1, o: null }], {});
  assert.deepEqual(k['1,1'], { t: 'trawa' }, 'usunięto tylko obiekt');
  applyTilePatch(k, [{ x: 1, y: 1, t: null }], {});
  assert.equal('1,1' in k, false, 'puste pole usunięte ze zbioru');
});

test('pominięte pole nie zmienia istniejącej wartości', () => {
  const k = { '2,2': { t: 'piasek', o: 'beczka' } };
  applyTilePatch(k, [{ x: 2, y: 2, t: 'woda' }], {});
  assert.deepEqual(k['2,2'], { t: 'woda', o: 'beczka' });
});

test('odrzuca pola poza mapą i błędne współrzędne', () => {
  const k = {};
  const applied = applyTilePatch(k, [
    { x: -1, y: 0, t: 'trawa' },
    { x: 0, y: -5, t: 'trawa' },
    { x: 99, y: 0, t: 'trawa' },
    { x: 0, y: 99, t: 'trawa' },
    { x: 1.5, y: 2, t: 'trawa' },
    { x: 'a', y: 'b', t: 'trawa' },
    { x: 5, y: 5, t: 'trawa' },
  ], { maks_x: 10, maks_y: 10 });
  assert.equal(applied, 1);
  assert.deepEqual(Object.keys(k), ['5,5']);
});

test('krawędź mapy (maks_x, maks_y) jest dozwolona', () => {
  const k = {};
  applyTilePatch(k, [{ x: 10, y: 10, t: 'trawa' }], { maks_x: 10, maks_y: 10 });
  assert.deepEqual(k['10,10'], { t: 'trawa' });
});

test('identyfikator kafla jest przycinany (ochrona przed śmieciami z klienta)', () => {
  const k = {};
  applyTilePatch(k, [{ x: 0, y: 0, t: 'x'.repeat(200) }], {});
  assert.equal(k['0,0'].t.length, 32);
});

test('patch inny niż tablica nic nie psuje', () => {
  const k = { '0,0': { t: 'trawa' } };
  assert.equal(applyTilePatch(k, null, {}), 0);
  assert.equal(applyTilePatch(k, 'bzdura', {}), 0);
  assert.deepEqual(k, { '0,0': { t: 'trawa' } });
});
