'use strict';
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { requireSession } = require('../middleware/auth');
const { logError, serverError } = require('../game/log');
const { giveItem } = require('../game/inventory');

// ── Wędki ─────────────────────────────────────────────────────────────────────
const RODS = {
  bambusowa: { label: 'Bambusowa', tier: 1, waitMult: 1.0, rareMult: 1.0,   fishDmg: 1, lineTough: 8,  minLvl: 1,  cena: 0    },
  drewniana: { label: 'Drewniana', tier: 2, waitMult: 0.85,rareMult: 1.05,  fishDmg: 2, lineTough: 11, minLvl: 3,  cena: 300  },
  stalowa:   { label: 'Stalowa',   tier: 3, waitMult: 0.70,rareMult: 1.12,  fishDmg: 3, lineTough: 15, minLvl: 6,  cena: 1200 },
  karbonowa: { label: 'Karbonowa', tier: 4, waitMult: 0.55,rareMult: 1.25,  fishDmg: 4, lineTough: 20, minLvl: 10, cena: 4000 },
  mistyczna: { label: 'Mistyczna', tier: 5, waitMult: 0.40,rareMult: 1.80,  fishDmg: 6, lineTough: 30, minLvl: 15, cena: 15000},
};

// ── Pule ryb per strefa mapy ──────────────────────────────────────────────────
// Ryby są wybierane zależnie od poziomu postaci (przybliżona strefa)
const FISH_POOL = [
  // [nazwa, rzadkosc, minLvl, wartosc, fish_hp, exp_reward]
  ['Karaś',        'pospolita', 1,   5,   2, 4 ],
  ['Płoć',         'pospolita', 1,   6,   2, 4 ],
  ['Okoń',         'pospolita', 1,   8,   3, 5 ],
  ['Leszcz',       'pospolita', 3,   10,  3, 5 ],
  ['Lin',          'pospolita', 3,   9,   3, 5 ],
  ['Szczupak',     'rzadka',    5,   30,  5, 12],
  ['Karp',         'rzadka',    5,   28,  5, 11],
  ['Sum',          'rzadka',    8,   45,  6, 15],
  ['Sandacz',      'rzadka',    8,   40,  6, 14],
  ['Pstrąg',       'rzadka',    5,   35,  5, 13],
  ['Łosoś',        'epicka',    12,  120, 9, 30],
  ['Ryba Roczna',  'epicka',    10,  150, 8, 28],
  ['Złota Ryba',   'epicka',    15,  200, 10,40],
  ['Ryba Widmo',   'epicka',    18,  180, 10,35],
  ['Smok Wody',    'legendarna',25,  1000,15,100],
  ['Smoczy Pstrąg','legendarna',20,  800, 14,90 ],
  ['Ryba Losu',    'legendarna',30,  1500,18,150],
];

const RARITY_WEIGHT  = { pospolita: 55, rzadka: 28, epicka: 13, legendarna: 4 };
const RARITY_COLOR   = { pospolita: 'normal', rzadka: 'unique', epicka: 'heroic', legendarna: 'legendary' };

// ── Sesje (w pamięci, krótkotrwałe) ──────────────────────────────────────────
const sessions = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.createdAt > 90000) sessions.delete(id);
  }
}, 20000);

// ── Helper: poziom wędkarski z EXP ───────────────────────────────────────────
function fishingLevel(exp) {
  let lvl = 1, need = 60;
  while (exp >= need && lvl < 20) { exp -= need; lvl++; need = Math.floor(need * 1.4); }
  return { lvl, expInLvl: exp, expToNext: need };
}

// ── Helper: pobierz lub utwórz rekord wędkarstwa ──────────────────────────────
async function getRecord(postacId) {
  const [[r]] = await db.query('SELECT * FROM postac_wedkarstwo WHERE postac_id=?', [postacId]);
  if (r) return r;
  await db.query(
    'INSERT IGNORE INTO postac_wedkarstwo(postac_id,ryby_zlapane,zloty_haczyk,wedka,exp_wedkarstwo) VALUES(?,0,0,"bambusowa",0)',
    [postacId]
  );
  return { postac_id: postacId, ryby_zlapane: 0, zloty_haczyk: 0, wedka: 'bambusowa', exp_wedkarstwo: 0 };
}

// ── Helper: dobierz rybę ──────────────────────────────────────────────────────
function pickFish(charLevel, rareMult) {
  const eligible = FISH_POOL.filter(f => f[2] <= charLevel);
  const pool = eligible.length >= 3 ? eligible : FISH_POOL.slice(0, 5);

  const weighted = [];
  for (const f of pool) {
    let w = RARITY_WEIGHT[f[1]] || 10;
    if (f[1] === 'rzadka')    w = Math.round(w * rareMult);
    if (f[1] === 'epicka')    w = Math.round(w * rareMult * rareMult);
    if (f[1] === 'legendarna')w = Math.round(w * rareMult * rareMult * rareMult);
    for (let i = 0; i < Math.max(1, w); i++) weighted.push(f);
  }
  return weighted[Math.floor(Math.random() * weighted.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/fishing/cast — zarzuć wędkę
// ─────────────────────────────────────────────────────────────────────────────
router.post('/cast', requireSession, async (req, res) => {
  try {
    const postacId = req.session.postacId;

    // Zamknij poprzednie sesje tego gracza
    for (const [id, s] of sessions) { if (s.postacId === postacId) sessions.delete(id); }

    const [[postac]] = await db.query('SELECT poziom FROM postac WHERE id=?', [postacId]);
    const rec    = await getRecord(postacId);
    const rod    = RODS[rec.wedka] || RODS.bambusowa;
    const fLvl   = fishingLevel(rec.exp_wedkarstwo || 0).lvl;

    // Czas oczekiwania: 3–13s, skrócony przez wędkę i poziom
    const baseWait = 3000 + Math.floor(Math.random() * 10000);
    const waitMs   = Math.max(1200, Math.round(baseWait * rod.waitMult * (1 - fLvl * 0.025)));
    // Okno reakcji: 1.2–2.5s (trudniejsze ryby mają mniejsze okno)
    const reactionMs = Math.max(700, 2500 - fLvl * 60);

    const fish = pickFish(postac.poziom, rod.rareMult);

    const sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    sessions.set(sessionId, {
      postacId,
      fish,
      waitMs,
      reactionMs,
      biteAt: Date.now() + waitMs,
      createdAt: Date.now(),
      phase: 'waiting',
      rod: rec.wedka,
      fLvl,
    });

    res.json({ ok: true, sessionId, waitMs, reactionMs });
  } catch (e) { res.json({ ok: false, error: serverError(e, 'fishing') }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/fishing/catch — reaguj na branie (trigger catch minigame)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/catch', requireSession, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const postacId = req.session.postacId;
    const s = sessions.get(sessionId);

    if (!s || s.postacId !== postacId) return res.json({ ok: false, missed: true, reason: 'no_session' });
    if (s.phase !== 'waiting') return res.json({ ok: false, missed: true, reason: 'wrong_phase' });

    const now = Date.now();
    if (now < s.biteAt)                  { sessions.delete(sessionId); return res.json({ ok: false, missed: true, reason: 'too_early',  msg: 'Za szybko! Ryba odpłynęła.' }); }
    if (now > s.biteAt + s.reactionMs)   { sessions.delete(sessionId); return res.json({ ok: false, missed: true, reason: 'too_late',   msg: 'Za późno! Ryba uciekła.' }); }

    const rod    = RODS[s.rod] || RODS.bambusowa;
    const fish   = s.fish;
    const fishHp = (fish[4] || 5) + Math.floor(s.fLvl / 4); // fish HP

    s.phase      = 'fighting';
    s.fishHp     = fishHp;
    s.fishHpMax  = fishHp;
    s.tension    = 0;
    s.tensionMax = rod.lineTough;
    s.fishDmg    = rod.fishDmg;
    s.lastPull   = now;
    s.fightStart = now;

    res.json({
      ok: true,
      phase: 'fighting',
      fish: { nazwa: fish[0], rzadkosc: fish[1] },
      fishHp, fishHpMax: fishHp,
      tension: 0, tensionMax: rod.lineTough,
      fishDmg: rod.fishDmg,
    });
  } catch (e) { res.json({ ok: false, error: serverError(e, 'fishing') }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/fishing/reel — szarpnij/holuj podczas walki
// ─────────────────────────────────────────────────────────────────────────────
router.post('/reel', requireSession, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const postacId = req.session.postacId;
    const s = sessions.get(sessionId);

    if (!s || s.postacId !== postacId) return res.json({ ok: false, error: 'Brak sesji' });
    if (s.phase !== 'fighting')         return res.json({ ok: false, error: 'Nie ma walki' });

    const now = Date.now();
    if (now - (s.lastPull || 0) < 350) return res.json({ ok: false, error: 'Za szybko!' });
    s.lastPull = now;

    // Gracz holuje: −1 HP ryby, +2 napięcia
    s.fishHp  = Math.max(0, s.fishHp - 1);
    s.tension = Math.min(s.tensionMax, s.tension + 2);

    // Ryba szarpie: +1 napięcia (co ~1.2s)
    const timeSinceFightStart = now - s.fightStart;
    const expectedFishPulls = Math.floor(timeSinceFightStart / 1200);
    const appliedFishPulls  = s.appliedFishPulls || 0;
    const newPulls = expectedFishPulls - appliedFishPulls;
    if (newPulls > 0) {
      s.tension = Math.min(s.tensionMax, s.tension + newPulls);
      s.appliedFishPulls = expectedFishPulls;
    }

    // Napięcie spada gdy nie holujemy (każde 2s bez holowania −1)
    // (handled on client side via /tension-tick)

    if (s.fishHp <= 0) {
      s.phase = 'done';
      sessions.delete(sessionId);
      return doFinishCatch(res, postacId, s, true);
    }

    if (s.tension >= s.tensionMax) {
      s.phase = 'done';
      sessions.delete(sessionId);
      return res.json({
        ok: true, escaped: true,
        msg: 'Żyłka pękła! Ryba uciekła.',
        fishHp: s.fishHp, tension: s.tensionMax, tensionMax: s.tensionMax,
      });
    }

    res.json({ ok: true, caught: false, escaped: false, fishHp: s.fishHp, fishHpMax: s.fishHpMax, tension: s.tension, tensionMax: s.tensionMax });
  } catch (e) { res.json({ ok: false, error: serverError(e, 'fishing') }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/fishing/relax — odpuść holowanie (zmniejsz napięcie)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/relax', requireSession, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const s = sessions.get(sessionId);
    if (!s || s.postacId !== req.session.postacId || s.phase !== 'fighting')
      return res.json({ ok: false });

    s.tension = Math.max(0, s.tension - 1);

    // Fish auto-pulls
    const now = Date.now();
    const timeSince = now - s.fightStart;
    const expected  = Math.floor(timeSince / 1200);
    const applied   = s.appliedFishPulls || 0;
    const newPulls  = expected - applied;
    if (newPulls > 0) {
      s.tension = Math.min(s.tensionMax, s.tension + newPulls);
      s.appliedFishPulls = expected;
    }

    if (s.tension >= s.tensionMax) {
      s.phase = 'done';
      sessions.delete(sessionId);
      return res.json({ ok: true, escaped: true, msg: 'Ryba uciekła!' });
    }

    res.json({ ok: true, fishHp: s.fishHp, fishHpMax: s.fishHpMax, tension: s.tension, tensionMax: s.tensionMax });
  } catch (e) { res.json({ ok: false }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/fishing/cancel — anuluj
// ─────────────────────────────────────────────────────────────────────────────
router.post('/cancel', requireSession, async (req, res) => {
  const { sessionId } = req.body;
  const s = sessions.get(sessionId);
  if (s && s.postacId === req.session.postacId) sessions.delete(sessionId);
  res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// Zapisz złowioną rybę
// ─────────────────────────────────────────────────────────────────────────────
async function doFinishCatch(res, postacId, s, won) {
  if (!won) {
    return res.json({ ok: true, escaped: true, msg: 'Ryba uciekła!', fishHp: s.fishHp, tension: s.tensionMax, tensionMax: s.tensionMax });
  }
  try {
    const fish    = s.fish; // [nazwa, rzadkosc, minLvl, wartosc, fish_hp, exp_reward]
    const klasa   = RARITY_COLOR[fish[1]] || 'normal';
    const wartosc = fish[3];
    const expGain = fish[5] || 10;

    // Wcześniej .catch(() => {}) — przy błędzie ryba znikała bez śladu
    await giveItem(db, postacId, {
      nazwa: fish[0], klasa, typ: 'Ryba', obrazek: 'items/fish.gif', wym_poziom: 1,
      wartosc_sprzedazy: wartosc, ilosc: 1, opis: `${fish[1]} ryba`,
    });

    // EXP wędkarski
    await db.query(
      'INSERT INTO postac_wedkarstwo(postac_id,ryby_zlapane,exp_wedkarstwo) VALUES(?,1,?) ON DUPLICATE KEY UPDATE ryby_zlapane=ryby_zlapane+1, exp_wedkarstwo=exp_wedkarstwo+?',
      [postacId, expGain, expGain]
    );

    // Historia
    await db.query(
      'INSERT INTO fishing_catches(postac_id,ryba_nazwa,rzadkosc,wartosc,wedka) VALUES(?,?,?,?,?)',
      [postacId, fish[0], fish[1], wartosc, s.rod]
    ).catch(logError('fishing:292'));

    // Złoty haczyk
    const [[rec]] = await db.query('SELECT ryby_zlapane, exp_wedkarstwo FROM postac_wedkarstwo WHERE postac_id=?', [postacId]);
    if (rec && rec.ryby_zlapane >= 100)
      await db.query('UPDATE postac_wedkarstwo SET zloty_haczyk=1 WHERE postac_id=?', [postacId]).catch(logError('fishing:297'));

    const lvlData = fishingLevel(rec?.exp_wedkarstwo || 0);
    const oldLvl  = fishingLevel((rec?.exp_wedkarstwo || 0) - expGain).lvl;

    // Bonus losowy (10% szansa)
    let bonus = null;
    if (Math.random() < 0.10) {
      const roll = Math.random();
      if (roll < 0.55) bonus = { type: 'gold',  gold: 10 + Math.floor(Math.random() * 50),  label: '💰 Monety w rybie!' };
      else if (roll < 0.80) bonus = { type: 'pearl', gold: 100, label: '🔮 Perła!' };
      else bonus = { type: 'gem', gold: 250, label: '💎 Klejnot!' };
      if (bonus) await db.query('UPDATE postac SET zloto=zloto+? WHERE id=?', [bonus.gold, postacId]).catch(logError('fishing:309'));
    }

    return res.json({
      ok: true, caught: true,
      fish: { nazwa: fish[0], rzadkosc: fish[1], wartosc, klasa },
      expGain, newFishingLvl: lvlData.lvl, lvlUp: lvlData.lvl > oldLvl,
      bonus,
    });
  } catch (e) {
    logError('fishing:catch')(e);
    return res.json({ ok: true, caught: true, fish: { nazwa: s.fish[0], rzadkosc: s.fish[1] }, expGain: 0 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/fishing/sell-all — sprzedaj wszystkie ryby
// ─────────────────────────────────────────────────────────────────────────────
router.post('/sell-all', requireSession, async (req, res) => {
  try {
    const postacId = req.session.postacId;
    const [fish] = await db.query(
      "SELECT id, wartosc_sprzedazy FROM przedmiot_postac WHERE postac=? AND typ='Ryba' AND zalozony=0",
      [postacId]
    );
    if (!fish.length) return res.json({ ok: true, gold: 0, count: 0 });

    const total = fish.reduce((s, f) => s + (f.wartosc_sprzedazy || 0), 0);
    const ids   = fish.map(f => f.id);
    await db.query(`DELETE FROM przedmiot_postac WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
    await db.query('UPDATE postac SET zloto=zloto+? WHERE id=?', [total, postacId]);
    res.json({ ok: true, gold: total, count: fish.length });
  } catch (e) { res.json({ ok: false, error: serverError(e, 'fishing') }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/fishing/stats — statystyki
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', requireSession, async (req, res) => {
  try {
    const postacId = req.session.postacId;
    const rec = await getRecord(postacId);
    const lvl = fishingLevel(rec.exp_wedkarstwo || 0);
    const rod = RODS[rec.wedka] || RODS.bambusowa;

    const [history] = await db.query(
      'SELECT ryba_nazwa, rzadkosc, wartosc, wedka, data FROM fishing_catches WHERE postac_id=? ORDER BY data DESC LIMIT 10',
      [postacId]
    ).catch(() => [[]]);

    const [inBag] = await db.query(
      "SELECT COUNT(*) as cnt, SUM(wartosc_sprzedazy) as total FROM przedmiot_postac WHERE postac=? AND typ='Ryba'",
      [postacId]
    );

    res.json({
      ryby_zlapane: rec.ryby_zlapane || 0,
      zloty_haczyk: rec.zloty_haczyk || 0,
      wedka: rec.wedka || 'bambusowa',
      rodLabel: rod.label,
      fishingLvl: lvl.lvl, expInLvl: lvl.expInLvl, expToNext: lvl.expToNext,
      history,
      bagFish: inBag[0]?.cnt || 0, bagValue: inBag[0]?.total || 0,
    });
  } catch (e) { res.json({}); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/fishing/ranking — top 10
// ─────────────────────────────────────────────────────────────────────────────
router.get('/ranking', requireSession, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pw.postac_id, p.nazwa, pw.ryby_zlapane, pw.zloty_haczyk, pw.exp_wedkarstwo
       FROM postac_wedkarstwo pw
       JOIN postac p ON p.id=pw.postac_id
       ORDER BY pw.ryby_zlapane DESC LIMIT 10`
    );
    res.json(rows);
  } catch (e) { res.json([]); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/fishing/equipment — wędka i poziom wędkarski
// ─────────────────────────────────────────────────────────────────────────────
router.get('/equipment', requireSession, async (req, res) => {
  try {
    const rec  = await getRecord(req.session.postacId);
    const lvl  = fishingLevel(rec.exp_wedkarstwo || 0);
    const rod  = RODS[rec.wedka] || RODS.bambusowa;
    res.json({ wedka: rec.wedka, rod, ...lvl, rods: RODS });
  } catch (e) { res.json({}); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/fishing/upgrade-rod — kup lepszą wędkę
// ─────────────────────────────────────────────────────────────────────────────
router.post('/upgrade-rod', requireSession, async (req, res) => {
  try {
    const { wedka } = req.body;
    const rod = RODS[wedka];
    if (!rod) return res.json({ ok: false, error: 'Nieznana wędka' });

    const postacId = req.session.postacId;
    const rec = await getRecord(postacId);
    const lvl = fishingLevel(rec.exp_wedkarstwo || 0);

    if (lvl.lvl < rod.minLvl) return res.json({ ok: false, error: `Wymagany poziom wędkarski ${rod.minLvl}` });
    if (rod.cena === 0) return res.json({ ok: false, error: 'Tę wędkę masz od początku' });

    const [[postac]] = await db.query('SELECT zloto FROM postac WHERE id=?', [postacId]);
    if (postac.zloto < rod.cena) return res.json({ ok: false, error: `Potrzebujesz ${rod.cena} złota` });

    await db.query('UPDATE postac SET zloto=zloto-? WHERE id=?', [rod.cena, postacId]);
    await db.query('UPDATE postac_wedkarstwo SET wedka=? WHERE postac_id=?', [wedka, postacId]);
    res.json({ ok: true, wedka, goldSpent: rod.cena, label: rod.label });
  } catch (e) { res.json({ ok: false, error: serverError(e, 'fishing') }); }
});

module.exports = router;
