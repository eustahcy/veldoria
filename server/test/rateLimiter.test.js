const test = require('node:test');
const assert = require('node:assert/strict');
const { createLimiter, _buckets } = require('../src/middleware/rateLimiter');

function call(limiter, req) {
  let status = 200, nextCalled = false;
  const res = {
    set() { return this; },
    status(s) { status = s; return this; },
    json() { return this; },
  };
  limiter({ baseUrl: '/api/auth', path: '/login', ip: '1.2.3.4', session: {}, ...req }, res, () => { nextCalled = true; });
  return nextCalled ? 200 : status;
}

test.beforeEach(() => _buckets.clear());

test('limiter: żądania bez sesji postaci są limitowane po IP (wcześniej omijały limiter)', () => {
  const lim = createLimiter(3, 60_000);
  assert.deepEqual([1, 2, 3, 4].map(() => call(lim, {})), [200, 200, 200, 429]);
});

test('limiter: różne IP mają osobne liczniki', () => {
  const lim = createLimiter(1, 60_000);
  assert.equal(call(lim, { ip: '1.1.1.1' }), 200);
  assert.equal(call(lim, { ip: '2.2.2.2' }), 200);
  assert.equal(call(lim, { ip: '1.1.1.1' }), 429);
});

test('limiter: zalogowana postać ma licznik per postać', () => {
  const lim = createLimiter(1, 60_000);
  assert.equal(call(lim, { session: { postacId: 1 } }), 200);
  assert.equal(call(lim, { session: { postacId: 2 } }), 200);
  assert.equal(call(lim, { session: { postacId: 1 } }), 429);
});

test('limiter: byIp ignoruje postać — zmiana postaci nie resetuje licznika logowania', () => {
  const lim = createLimiter(1, 60_000, { byIp: true });
  assert.equal(call(lim, { session: { postacId: 1 } }), 200);
  assert.equal(call(lim, { session: { postacId: 2 } }), 429);
});

test('limiter: ta sama ścieżka w różnych routerach ma osobne liczniki', () => {
  const lim = createLimiter(1, 60_000);
  const s = { session: { postacId: 1 }, path: '/action' };
  assert.equal(call(lim, { ...s, baseUrl: '/api/combat' }), 200);
  assert.equal(call(lim, { ...s, baseUrl: '/api/other' }), 200);
});

test('limiter: licznik resetuje się po oknie czasowym', async () => {
  const lim = createLimiter(1, 20);
  assert.equal(call(lim, {}), 200);
  assert.equal(call(lim, {}), 429);
  await new Promise(r => setTimeout(r, 30));
  assert.equal(call(lim, {}), 200);
});
