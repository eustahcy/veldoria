// Test gry "jak gracz": rejestracja, postać, ruch, walka v1/v2, world boss, loch,
// sklep, ekwipunek, gildia, aukcja, wędkowanie + wszystkie widoki. Zbiera błędy serwera.
// Użycie (z katalogu projektu, po npm install):  node deploy/playtest.js http://148.113.237.210:3002
// Zakłada konto bot_xxxxxx i na koniec usuwa jego postać (konto zostaje w tabeli accounts).
const BASE = (process.argv[2] || 'http://148.113.237.210:3002') + '/api';
const io = require('socket.io-client');

let cookie = '';
const results = [];
const fails = [];

async function call(method, path, body, { quiet = false } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const set = res.headers.get('set-cookie');
  if (set) cookie = set.split(';')[0];
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  const err = data && !Array.isArray(data) && (data.error || (data.ok === false && (data.error || 'ok:false')));
  const serverErr = res.status >= 500 || (typeof err === 'string' && /Błąd serwera|Server error/i.test(err));
  const line = `${method.padEnd(6)} ${path.padEnd(42)} ${res.status}${err ? '  → ' + err : ''}`;
  results.push(line);
  if (serverErr || res.status === 404) fails.push(line);
  if (!quiet) console.log((serverErr ? '✗ ' : '  ') + line);
  return { status: res.status, data };
}

// ── Mapa i ruch ──────────────────────────────────────────────────────────────
function pathTo(state, targets) {
  const { postac, mapa, blockers, npcs, mobs } = state;
  const blocked = new Set([...blockers, ...npcs, ...mobs].map(b => `${b.x},${b.y}`));
  const goal = new Set(targets.map(t => `${t.x},${t.y}`));
  const start = `${postac.x},${postac.y}`;
  if (goal.has(start)) return [];
  const prev = new Map([[start, null]]);
  const q = [[postac.x, postac.y]];
  const dirs = [['prawo', 1, 0], ['lewo', -1, 0], ['dol', 0, 1], ['gora', 0, -1]];
  while (q.length) {
    const [x, y] = q.shift();
    for (const [d, dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
      if (nx < 0 || ny < 0 || nx > mapa.maks_x || ny > mapa.maks_y || prev.has(k) || blocked.has(k)) continue;
      prev.set(k, [`${x},${y}`, d]);
      if (goal.has(k)) {
        const path = []; let c = k;
        while (prev.get(c)) { const [p, dd] = prev.get(c); path.unshift(dd); c = p; }
        return path;
      }
      q.push([nx, ny]);
    }
  }
  return null;
}

const around = (t, r = 1) => {
  const out = [];
  for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) if (dx || dy) out.push({ x: t.x + dx, y: t.y + dy });
  return out;
};

async function walk(path) {
  for (const d of path) {
    const r = await call('POST', '/game/move', { direction: d }, { quiet: true });
    if (!r.data?.ok) return false;
    if (r.data.teleported) return 'teleport';
  }
  return true;
}

async function main() {
  const login = 'bot_' + Math.random().toString(36).slice(2, 8);
  console.log(`\n=== Konto ${login}`);
  await call('GET', '/auth/stats');
  await call('GET', '/auth/classes');
  await call('POST', '/auth/register', { login, haslo: 'testhaslo1', powtorzHaslo: 'testhaslo1' });
  await call('POST', '/auth/login', { login, haslo: 'testhaslo1' });
  const cc = await call('POST', '/auth/create-character', { nazwa: 'Bot ' + login.slice(4), profesja: 'Wojownik' });
  await call('GET', '/auth/my-characters');
  await call('POST', '/auth/select-character', { postacId: cc.data?.id });

  // Socket jak prawdziwy klient
  const sock = io(BASE.replace('/api', ''), { extraHeaders: { Cookie: cookie }, transports: ['websocket'] });
  const sockOk = await new Promise(r => { sock.on('connect', () => r(true)); setTimeout(() => r(false), 5000); });
  console.log(`  socket.io: ${sockOk ? 'połączony' : 'BRAK POŁĄCZENIA'}`);
  if (!sockOk) fails.push('socket.io: brak połączenia');

  console.log('\n=== Świat');
  let st = (await call('GET', '/game/state')).data;
  if (!st?.postac) { console.log('Brak stanu gry — przerywam'); return finish(sock, null); }
  sock.emit('join_map', st.postac.mapa);
  console.log(`  mapa ${st.mapa.id} "${st.mapa.nazwa}", pozycja ${st.postac.x},${st.postac.y}, HP ${st.postac.zycie}/${st.postac.zycie_max}, mobów: ${st.mobs.length}, NPC: ${st.npcs.length}`);

  // Czat przez socket
  const chatBack = new Promise(r => { sock.on('chat_message', m => r(m)); setTimeout(() => r(null), 3000); });
  sock.emit('chat_message', { tresc: 'test bota' });
  console.log(`  czat socket: ${(await chatBack) ? 'wiadomość wróciła' : 'BRAK ECHA'}`);

  // ── Walka v1 ──
  console.log('\n=== Walka (v1 /combat/action)');
  let fights = 0, wins = 0;
  for (let attempt = 0; attempt < 6 && wins < 3; attempt++) {
    st = (await call('GET', '/game/state', null, { quiet: true })).data;
    const weak = st.mobs.filter(m => m.poziom <= st.postac.poziom + 1)
      .sort((a, b) => Math.abs(a.x - st.postac.x) + Math.abs(a.y - st.postac.y) - (Math.abs(b.x - st.postac.x) + Math.abs(b.y - st.postac.y)));
    const mob = weak[attempt % Math.max(1, weak.length)];
    if (!mob) { console.log('  brak słabego moba na mapie'); break; }
    const path = pathTo(st, around(mob));
    if (!path) { console.log(`  brak ścieżki do ${mob.nazwa} (${mob.x},${mob.y})`); continue; }
    const w = await walk(path);
    if (w !== true) { console.log(`  marsz przerwany (${w})`); continue; }
    fights++;
    let r;
    for (let turn = 0; turn < 80; turn++) {
      r = (await call('POST', '/combat/action', { mobId: mob.id, action: 'attack' }, { quiet: true })).data;
      if (!r?.ok || r.status !== 'ongoing') break;
      await new Promise(res => setTimeout(res, 220)); // limit 5 akcji/s
    }
    const res = r?.status || r?.error;
    if (r?.status === 'won') wins++;
    console.log(`  ${mob.nazwa} (lvl ${mob.poziom}) → ${res}${r?.expGained ? `, +${r.expGained} exp` : ''}${r?.loot ? `, loot: ${r.loot.nazwa}` : ''}${r?.levelUp ? ', AWANS!' : ''}`);
    if (r?.status === 'lost') break;
  }
  if (!wins) fails.push('walka v1: brak zwycięstwa');

  // ── Walka v2 ──
  console.log('\n=== Walka (v2 /combat/start2 + turn2)');
  st = (await call('GET', '/game/state', null, { quiet: true })).data;
  const mob2 = st.mobs.filter(m => m.poziom <= st.postac.poziom + 1)
    .sort((a, b) => Math.abs(a.x - st.postac.x) + Math.abs(a.y - st.postac.y) - (Math.abs(b.x - st.postac.x) + Math.abs(b.y - st.postac.y)))[0];
  if (mob2) {
    const p2 = pathTo(st, around(mob2));
    if (p2 && await walk(p2) === true) {
      const s2 = await call('POST', '/combat/start2', { mobId: mob2.id });
      let r2;
      for (let turn = 0; turn < 60 && s2.data?.ok; turn++) {
        r2 = (await call('POST', '/combat/turn2', { mobId: mob2.id, action: 'attack' }, { quiet: true })).data;
        if (!r2?.ok || r2.status !== 'ongoing') break;
        await new Promise(res => setTimeout(res, 350));
      }
      console.log(`  ${mob2.nazwa} → ${r2?.status || r2?.error}${r2?.expGained ? `, +${r2.expGained} exp` : ''}`);
      await call('GET', '/combat/state2');
    }
  }

  // ── World boss ──
  console.log('\n=== World boss');
  const wb = (await call('GET', '/worldboss/active')).data;
  console.log(`  aktywny: ${wb?.id ? `${wb.nazwa} HP ${wb.zycie}/${wb.zycie_max}` : 'nie'}`);
  if (wb?.id) {
    let last;
    for (let i = 0; i < 6; i++) {
      last = (await call('POST', '/worldboss/boss-attack', null, { quiet: true })).data;
      if (!last?.ok) break;
      await new Promise(r => setTimeout(r, 400));
    }
    console.log(`  6 ataków → ${last?.ok ? `boss HP ${last.bossHp ?? last.boss_hp ?? '?'}, moje HP ${last.heroHp ?? '?'}` : last?.error}`);
    await call('GET', '/worldboss/my-session');
    await call('GET', `/worldboss/leaderboard/${wb.id}`);
  }

  // ── Loch v2 ──
  console.log('\n=== Loch v2');
  const dl = (await call('GET', '/dungeons2/list')).data;
  const dlist = Array.isArray(dl) ? dl : (dl?.dungeons || []);
  const dun = dlist.sort((a, b) => (a.min_poziom || 0) - (b.min_poziom || 0))[0];
  if (dun) {
    const en = await call('POST', '/dungeons2/enter', { dungeon_id: dun.id, trudnosc: 'normalny' });
    console.log(`  wejście do "${dun.nazwa}" (min. poz. ${dun.min_poziom}): ${en.data?.ok ? 'OK' : en.data?.error}`);
    if (en.data?.ok) { await call('GET', '/dungeons2/active'); await call('POST', '/dungeons2/leave'); }
  }

  // ── Ekwipunek, sklep ──
  console.log('\n=== Ekwipunek i sklep');
  st = (await call('GET', '/game/state', null, { quiet: true })).data;
  console.log(`  poziom ${st.postac.poziom}, exp ${st.postac.exp}, złoto ${st.postac.zloto}, HP ${st.postac.zycie}/${st.postac.zycie_max}`);
  let inv = (await call('GET', '/items/inventory')).data || [];
  const shopNpc = st.npcs.find(n => n.shop > 0);
  if (shopNpc) {
    const p = pathTo(st, around(shopNpc, 2));
    if (p && await walk(p) === true) {
      const shop = (await call('GET', `/items/shop/${shopNpc.shop}`)).data || [];
      const cheap = Array.isArray(shop) ? shop.filter(i => (i.wartosc_kupna || 0) <= st.postac.zloto).sort((a, b) => a.wartosc_kupna - b.wartosc_kupna)[0] : null;
      console.log(`  sklep NPC "${shopNpc.nazwa}": ${shop.length} towarów, najtańszy: ${cheap ? `${cheap.nazwa} (${cheap.wartosc_kupna}g)` : 'brak w budżecie'}`);
      if (cheap) await call('POST', '/items/buy', { itemId: cheap.id, shopId: shopNpc.shop });
      const expensive = Array.isArray(shop) ? shop.find(i => (i.wartosc_kupna || 0) > st.postac.zloto) : null;
      if (expensive) {
        const r = await call('POST', '/items/buy', { itemId: expensive.id, shopId: shopNpc.shop });
        console.log(`  zakup ponad budżet odrzucony: ${r.data?.ok === false ? 'TAK' : 'NIE'}`);
      }
    }
  } else console.log('  brak NPC ze sklepem na mapie');
  inv = (await call('GET', '/items/inventory')).data || [];
  console.log(`  plecak: ${inv.map(i => i.nazwa).join(', ') || 'pusty'}`);
  const wearable = inv.find(i => !['Konsupcyjne', 'Neutralne'].includes(i.typ) && !i.zalozony);
  if (wearable) {
    const r = await call('POST', '/items/equip', { itemId: wearable.id, action: 'zaloz' });
    console.log(`  załóż "${wearable.nazwa}" (wym. poz. ${wearable.wym_poziom}): ${r.data?.ok ? 'OK' : r.data?.error}`);
    await call('POST', '/items/equip', { itemId: wearable.id, action: 'zdejmij' });
  }
  const toSell = inv.find(i => !i.zalozony);
  if (toSell) await call('POST', '/items/sell', { itemId: toSell.id });

  // ── Wszystkie widoki gracza (GET) ──
  console.log('\n=== Widoki (GET)');
  const pid = st.postac.id;
  for (const p of ['/game/world-state', '/game/map-list', '/chat', '/character/skills', '/character/friends',
    '/character/pvp-history', '/character/outfits', '/character/titles', '/character/prestige-info',
    `/social/profile/${pid}`, '/social/guild/my', '/social/guild/list', '/social/guild/ranking',
    '/social/guild/territory/all', '/social/messages', '/social/messages/unread-count', '/social/friends',
    '/trade/session', '/craft/materials', '/craft/recipes', '/fishing/stats', '/fishing/ranking',
    '/fishing/equipment', '/talents/tree', '/talents/available-points', '/auction?', '/auction/my',
    '/worldboss/active', '/worldboss/my-session', '/worldboss/achievements', '/worldboss/history',
    '/worldboss/leaderboard/1', '/worldboss/ranking/1', '/dungeons/list', '/dungeons/active',
    '/dungeons2/list', '/dungeons2/active', '/dungeons2/history', '/offline/status', '/quests',
    '/quests/chains', '/quests/daily', '/quests/weekly', '/quests/reputation', '/quests/history',
    '/quests/achievements', '/quests/events/active', '/events/active', '/events/shop',
    '/items/temple-status', '/items/boss-portal', '/items/guild-board', '/items/event-zone',
    `/combat/mob-info/${st.mobs[0]?.id || 1}`, ...st.npcs.slice(0, 3).map(n => `/quests/npc/${n.id}`)]) {
    await call('GET', p);
  }

  // ── Akcje ──
  console.log('\n=== Akcje');
  await call('POST', '/quests/achievements/check');
  await call('POST', '/character/pvp-toggle');
  await call('POST', '/character/pvp-toggle');
  if (st.postac.wolne_punkty_stat > 0) await call('POST', '/character/assign-stat', { stat: 'sila' });
  await call('POST', '/social/guild/create', { nazwa: 'Gildia ' + login.slice(4), tag: login.slice(4, 8).toUpperCase() });
  await call('GET', '/social/guild/my');
  await call('GET', '/social/guild/buffs');
  await call('GET', '/social/guild/treasury/log');
  await call('GET', '/social/guild/contributions');
  await call('GET', '/social/guild/relations');
  await call('GET', '/social/guild/raid/active');
  await call('GET', '/social/guild/war/active');
  await call('GET', '/social/guild/quest/active');
  await call('POST', '/social/guild/leave');
  await call('POST', `/social/profile/comment/${pid}`, { tresc: 'komentarz testowy' });
  inv = (await call('GET', '/items/inventory', null, { quiet: true })).data || [];
  const aItem = inv.find(i => !i.zalozony);
  if (aItem) {
    await call('POST', '/auction/list', { przedmiot_id: aItem.id, cena: 10, godziny: 1 });
    const my = (await call('GET', '/auction/my')).data?.aukcje || [];
    if (my[0]) await call('POST', `/auction/cancel/${my[0].id}`);
  }
  await call('POST', '/fishing/cast', {});
  await call('POST', '/fishing/cancel', {});
  await call('POST', '/items/temple-heal');

  return finish(sock, cc.data?.id, login);
}

async function finish(sock, postacId, login) {
  sock?.close();
  if (postacId) {
    await call('POST', '/auth/delete-character', { postacId, confirm: 'USUŃ' });
    await call('POST', '/auth/logout');
  }
  console.log(`\n=== WYNIK: ${results.length} wywołań, problemów: ${fails.length}`);
  for (const f of fails) console.log('  ✗ ' + f);
  console.log(`LOGIN=${login || ''}`);
  process.exit(0);
}

main().catch(e => { console.error('BOT PADŁ:', e); process.exit(1); });
