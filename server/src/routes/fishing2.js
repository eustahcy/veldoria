'use strict';
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { requireSession } = require('../middleware/auth');
const { logError, serverError } = require('../game/log');
const { giveItem } = require('../game/inventory');

// ── Konfiguracja wędek ────────────────────────────────────────────────────────
const RODS = {
  bambusowa: { waitMult: 1.0, forceMult: 1.0, rareMult: 1.0,   minLvl: 1  },
  drewniana: { waitMult: 0.85,forceMult: 1.0, rareMult: 1.05,  minLvl: 3  },
  stalowa:   { waitMult: 0.8, forceMult: 1.2, rareMult: 1.1,   minLvl: 6  },
  karbonowa: { waitMult: 0.65,forceMult: 1.3, rareMult: 1.2,   minLvl: 10 },
  mistyczna: { waitMult: 0.55,forceMult: 1.5, rareMult: 1.8,   minLvl: 15 },
};

// ── Ryby (fallback jeśli baza pusta) ─────────────────────────────────────────
const FISH_FALLBACK = [
  { id:'k1', nazwa:'Karaś',       rzadkosc:'pospolita',  rozmiar:'mały',    exp_reward:5,  reakcja_ms:1800, fish_hp:3,  pora_dnia:'kazda', pogoda:'kazda'      },
  { id:'k2', nazwa:'Okoń',        rzadkosc:'pospolita',  rozmiar:'średni',  exp_reward:8,  reakcja_ms:1500, fish_hp:4,  pora_dnia:'dzien', pogoda:'kazda'      },
  { id:'k3', nazwa:'Płoć',        rzadkosc:'pospolita',  rozmiar:'mały',    exp_reward:5,  reakcja_ms:2000, fish_hp:3,  pora_dnia:'kazda', pogoda:'kazda'      },
  { id:'k4', nazwa:'Leszcz',      rzadkosc:'pospolita',  rozmiar:'średni',  exp_reward:7,  reakcja_ms:1600, fish_hp:4,  pora_dnia:'kazda', pogoda:'kazda'      },
  { id:'k5', nazwa:'Szczupak',    rzadkosc:'rzadka',     rozmiar:'duży',    exp_reward:20, reakcja_ms:1200, fish_hp:6,  pora_dnia:'swit',  pogoda:'kazda'      },
  { id:'k6', nazwa:'Karp',        rzadkosc:'rzadka',     rozmiar:'duży',    exp_reward:18, reakcja_ms:1300, fish_hp:7,  pora_dnia:'noc',   pogoda:'pochmurno'  },
  { id:'k7', nazwa:'Sum',         rzadkosc:'rzadka',     rozmiar:'b.duży',  exp_reward:25, reakcja_ms:1000, fish_hp:8,  pora_dnia:'noc',   pogoda:'kazda'      },
  { id:'k8', nazwa:'Łosoś',       rzadkosc:'epicka',     rozmiar:'b.duży',  exp_reward:50, reakcja_ms:900,  fish_hp:10, pora_dnia:'kazda', pogoda:'deszcz'     },
  { id:'k9', nazwa:'Pstrąg',      rzadkosc:'epicka',     rozmiar:'duży',    exp_reward:45, reakcja_ms:1000, fish_hp:9,  pora_dnia:'swit',  pogoda:'kazda'      },
  { id:'k10',nazwa:'Smoczy Pstrąg',rzadkosc:'legendarna',rozmiar:'ogromny', exp_reward:200,reakcja_ms:700,  fish_hp:15, pora_dnia:'noc',   pogoda:'burza'      },
  { id:'k11',nazwa:'Złota Ryba',  rzadkosc:'legendarna', rozmiar:'mały',    exp_reward:300,reakcja_ms:600,  fish_hp:12, pora_dnia:'swit',  pogoda:'kazda'      },
  { id:'k12',nazwa:'Ryba Widmo',  rzadkosc:'epicka',     rozmiar:'średni',  exp_reward:80, reakcja_ms:800,  fish_hp:11, pora_dnia:'noc',   pogoda:'kazda'      },
];

const RARITY_WEIGHT = { pospolita:60, rzadka:25, epicka:12, legendarna:3 };
const RARITY_CLR    = { pospolita:'normal', rzadka:'unique', epicka:'heroic', legendarna:'legendary' };

// ── Sesje w pamięci (krótkotrwałe) ───────────────────────────────────────────
const sessions = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) if (now - s.createdAt > 60000) sessions.delete(id);
}, 15000);

// ── Helper: pobierz lub utwórz ekwipunek wędkarski ───────────────────────────
async function getEquip(postacId) {
  const [[row]] = await db.query('SELECT * FROM fishing_ekwipunek WHERE postac_id=?', [postacId]);
  if (row) return row;
  await db.query('INSERT IGNORE INTO fishing_ekwipunek(postac_id) VALUES(?)', [postacId]);
  return { postac_id: postacId, wedka: 'bambusowa', poziom: 1, exp: 0 };
}

// ── Helper: dobierz rybę uwzględniając porę dnia / pogodę / rareMult ─────────
function selectFish(fishList, pora, pogoda, fishingLvl, rareMult) {
  const filtered = fishList.filter(f => {
    if (f.pora_dnia && f.pora_dnia !== 'kazda' && f.pora_dnia !== pora) return false;
    if (f.pogoda && f.pogoda !== 'kazda' && f.pogoda !== pogoda) return false;
    return true;
  });
  const pool = filtered.length > 0 ? filtered : fishList;

  const weighted = [];
  for (const f of pool) {
    let w = (RARITY_WEIGHT[f.rzadkosc] || 10);
    if (f.rzadkosc === 'rzadka')    w = Math.round(w * rareMult);
    if (f.rzadkosc === 'epicka')    w = Math.round(w * rareMult * rareMult);
    if (f.rzadkosc === 'legendarna')w = Math.round(w * rareMult * rareMult * rareMult);
    // Wyższy poziom wędkarski = mniejsza szansa na pospolitą
    if (f.rzadkosc === 'pospolita' && fishingLvl > 5) w = Math.max(5, w - fishingLvl * 2);
    for (let i = 0; i < Math.max(1, w); i++) weighted.push(f);
  }
  return weighted[Math.floor(Math.random() * weighted.length)];
}

// ── Helper: oblicz poziom wędkarski na podstawie EXP ─────────────────────────
function calcFishingLvl(exp) {
  // 1→2: 50 exp, każdy kolejny +80 exp
  let lvl = 1, needed = 50;
  while (exp >= needed && lvl < 20) { exp -= needed; lvl++; needed += 80; }
  return { lvl, expInLvl: exp, expToNext: needed };
}

// ── POST /fishing2/cast — rzuć wędkę ─────────────────────────────────────────
router.post('/cast', requireSession, async (req, res) => {
  try {
    const postacId = req.session.postacId;

    // Zamknij poprzednią sesję
    for (const [id, s] of sessions) { if (s.postacId === postacId) sessions.delete(id); }

    const equip   = await getEquip(postacId);
    const rod     = RODS[equip.wedka] || RODS.bambusowa;
    const fishLvl = calcFishingLvl(equip.exp).lvl;

    // Pora dnia i pogoda
    const [[postac]] = await db.query('SELECT mapa FROM postac WHERE id=?', [postacId]);
    const worldState  = require('../game/worldCycle').getState?.() || { pora:'dzien', pogoda:'pogodnie' };
    const pora   = worldState.pora   || 'dzien';
    const pogoda = worldState.pogoda || 'pogodnie';

    // Wybierz rybę
    let fishList = FISH_FALLBACK;
    try {
      const [dbFish] = await db.query('SELECT * FROM ryby WHERE min_poziom <= ?', [fishLvl * 3 + 1]);
      if (dbFish.length >= 3) fishList = dbFish;
    } catch (e) { logError('fishing2:105')(e); }

    const fish = selectFish(fishList, pora, pogoda, fishLvl, rod.rareMult);

    // Czas oczekiwania: 4-15s, skrócony wędką i poziomem
    const baseWait = (4000 + Math.floor(Math.random() * 11000));
    const waitMs   = Math.max(1500, Math.round(baseWait * rod.waitMult * (1 - fishLvl * 0.02)));

    // Czas reakcji na branie
    const reactionMs = Math.max(600, (fish.reakcja_ms || 1500) - fishLvl * 20);

    // HP ryby (siła) i HP żyłki (zależnie od wędki)
    const fishHp   = (fish.fish_hp || 5) + Math.floor(fishLvl / 3);
    const lineHp   = Math.round(8 * rod.forceMult);

    const sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2);
    sessions.set(sessionId, {
      postacId, fish, fishHp, lineHpMax: lineHp,
      waitMs, reactionMs,
      createdAt: Date.now(),
      phase: 'waiting',   // waiting → bite → pulling → done
      biteAt: Date.now() + waitMs,
    });

    res.json({ ok: true, sessionId, waitMs, reactionMs, fish: { nazwa: fish.nazwa, rzadkosc: fish.rzadkosc, rozmiar: fish.rozmiar || 'średni' } });
  } catch(e) { res.json({ ok: false, error: serverError(e, 'fishing2') }); }
});

// ── POST /fishing2/bite — zareaguj na branie ──────────────────────────────────
router.post('/bite', requireSession, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const s = sessions.get(sessionId);
    if (!s || s.postacId !== req.session.postacId)
      return res.json({ ok: false, error: 'Brak sesji' });

    const now = Date.now();

    if (s.phase === 'done') return res.json({ ok: false, error: 'Sesja zakończona' });

    // Za wcześnie
    if (now < s.biteAt) {
      s.phase = 'done';
      sessions.delete(sessionId);
      return res.json({ ok: false, missed: true, tooEarly: true, msg: 'Za szybko! Ryba odpłynęła.' });
    }

    // Za późno (po oknie reakcji)
    if (now > s.biteAt + s.reactionMs) {
      s.phase = 'done';
      sessions.delete(sessionId);
      return res.json({ ok: false, missed: true, tooLate: true, msg: 'Za późno! Ryba uciekła.' });
    }

    // Trafiona reakcja — przejdź do wyciągania
    s.phase = 'pulling';
    s.currentFishHp = s.fishHp;
    s.currentLineHp = s.lineHpMax;
    s.lastPull      = now;
    s.nextFishPull  = now + 800 + Math.floor(Math.random() * 600);

    res.json({
      ok: true,
      phase: 'pulling',
      fishHp:    s.currentFishHp,
      fishHpMax: s.fishHp,
      lineHp:    s.currentLineHp,
      lineHpMax: s.lineHpMax,
      fish: { nazwa: s.fish.nazwa, rzadkosc: s.fish.rzadkosc, rozmiar: s.fish.rozmiar },
    });
  } catch(e) { res.json({ ok: false, error: serverError(e, 'fishing2') }); }
});

// ── POST /fishing2/pull — szarpnij wędką ──────────────────────────────────────
router.post('/pull', requireSession, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const s = sessions.get(sessionId);
    if (!s || s.postacId !== req.session.postacId)
      return res.json({ ok: false, error: 'Brak sesji' });
    if (s.phase !== 'pulling')
      return res.json({ ok: false, error: 'Nie trwa wyciąganie' });

    const now = Date.now();

    // Anti-spam: min 400ms między szarpnięciami
    if (now - (s.lastPull || 0) < 400)
      return res.json({ ok: false, error: 'Za szybko!' });
    s.lastPull = now;

    // Gracz szarpie → zmniejsza HP ryby
    const equip = await getEquip(req.session.postacId);
    const rod   = RODS[equip.wedka] || RODS.bambusowa;
    const fishLvl = calcFishingLvl(equip.exp).lvl;
    const playerDmg = 1 + Math.floor(fishLvl / 5) + (rod.forceMult > 1 ? 1 : 0);
    s.currentFishHp = Math.max(0, s.currentFishHp - playerDmg);

    // Ryba szarpie żyłkę (jeśli czas minął od ostatniego szarpnięcia ryby)
    let fishPulled = false;
    let fishDmg    = 0;
    if (now >= s.nextFishPull) {
      fishDmg        = 1 + Math.floor(Math.random() * 2);
      s.currentLineHp = Math.max(0, s.currentLineHp - fishDmg);
      s.nextFishPull  = now + 600 + Math.floor(Math.random() * 800);
      fishPulled = true;
    }

    // Sprawdź wynik
    if (s.currentFishHp <= 0) {
      // Ryba złapana!
      s.phase = 'done';
      sessions.delete(sessionId);
      const result = await catchFish(s.fish, s.postacId, equip, fishLvl);
      return res.json({ ok: true, caught: true, ...result,
        fishHp:0, lineHp:s.currentLineHp, lineHpMax:s.lineHpMax, fishPulled, fishDmg });
    }

    if (s.currentLineHp <= 0) {
      // Żyłka pękła
      s.phase = 'done';
      sessions.delete(sessionId);
      return res.json({ ok: true, escaped: true, msg: 'Żyłka pękła! Ryba uciekła.',
        fishHp:s.currentFishHp, lineHp:0, lineHpMax:s.lineHpMax });
    }

    res.json({
      ok: true, caught: false, escaped: false,
      fishHp:    s.currentFishHp,
      fishHpMax: s.fishHp,
      lineHp:    s.currentLineHp,
      lineHpMax: s.lineHpMax,
      fishPulled, fishDmg,
      playerDmg,
    });
  } catch(e) { res.json({ ok: false, error: serverError(e, 'fishing2') }); }
});

// ── Pomocnicza: zarejestruj złowioną rybę ────────────────────────────────────
async function catchFish(fish, postacId, equip, fishLvl) {
  try {
    // Wstaw rybę do plecaka jako przedmiot
    const klasa   = RARITY_CLR[fish.rzadkosc] || 'normal';
    const wartosc = { pospolita:5, rzadka:25, epicka:100, legendarna:500 }[fish.rzadkosc] || 10;
    // Wcześniej .catch(() => {}) — przy błędzie ryba znikała bez śladu
    await giveItem(db, postacId, {
      nazwa: fish.nazwa, klasa, typ: 'Ryba', obrazek: 'ryby/ryba.gif', wym_poziom: 1,
      wartosc_sprzedazy: wartosc, ilosc: 1, opis: `${fish.rozmiar || 'średni'} · ${fish.rzadkosc}`,
    });

    // EXP wędkarski
    const expGain = fish.exp_reward || 10;
    await db.query(
      'INSERT INTO fishing_ekwipunek(postac_id,exp) VALUES(?,?) ON DUPLICATE KEY UPDATE exp=exp+?',
      [postacId, expGain, expGain]
    ).catch(logError('fishing2:259'));

    // Historia
    await db.query(
      'INSERT INTO fishing_historia(postac_id,ryba_nazwa,rzadkosc,rozmiar,wedka) VALUES(?,?,?,?,?)',
      [postacId, fish.nazwa, fish.rzadkosc, fish.rozmiar||'średni', equip.wedka]
    ).catch(logError('fishing2:265'));

    // Sprawdź nowy poziom wędkarski
    const [[eq2]] = await db.query('SELECT exp FROM fishing_ekwipunek WHERE postac_id=?', [postacId]).catch(()=>[[null]]);
    const newLvlData = calcFishingLvl(eq2?.exp || 0);

    // Bonus losowy: co 20 połowów szansa na znalezisko
    const bonus = Math.random() < 0.08 ? randomBonus() : null;
    if (bonus) {
      await db.query('UPDATE postac SET zloto=zloto+? WHERE id=?', [bonus.gold, postacId]).catch(logError('fishing2:274'));
    }

    return {
      fish: { nazwa: fish.nazwa, rzadkosc: fish.rzadkosc, rozmiar: fish.rozmiar, klasa },
      expGain,
      newFishingLvl: newLvlData.lvl,
      lvlUp: newLvlData.lvl > fishLvl,
      bonus,
    };
  } catch(e) {
    logError('fishing2:catchFish')(e);
    return { fish: { nazwa: fish.nazwa, rzadkosc: fish.rzadkosc }, expGain: 0 };
  }
}

function randomBonus() {
  const roll = Math.random();
  if (roll < 0.5)  return { type: 'gold', gold: 10 + Math.floor(Math.random()*40), label: '💰 Monety w rybie!' };
  if (roll < 0.75) return { type: 'pearl', gold: 80, label: '🔮 Perła!' };
  return { type: 'gem', gold: 200, label: '💎 Klejnot!' };
}

// ── POST /fishing2/cancel — anuluj sesję ─────────────────────────────────────
router.post('/cancel', requireSession, async (req, res) => {
  const { sessionId } = req.body;
  const s = sessions.get(sessionId);
  if (s && s.postacId === req.session.postacId) sessions.delete(sessionId);
  res.json({ ok: true });
});

// ── GET /fishing2/status — stan sesji ────────────────────────────────────────
router.get('/status', requireSession, async (req, res) => {
  const { sessionId } = req.query;
  const s = sessions.get(sessionId);
  if (!s || s.postacId !== req.session.postacId) return res.json({ active: false });
  const now = Date.now();
  res.json({
    active: true,
    phase: s.phase,
    timeUntilBite: Math.max(0, s.biteAt - now),
    reactionMs: s.reactionMs,
    fishHp:    s.currentFishHp,
    fishHpMax: s.fishHp,
    lineHp:    s.currentLineHp,
    lineHpMax: s.lineHpMax,
  });
});

// ── GET /fishing2/equipment — poziom i wędka ──────────────────────────────────
router.get('/equipment', requireSession, async (req, res) => {
  try {
    const equip = await getEquip(req.session.postacId);
    const lvlData = calcFishingLvl(equip.exp);
    res.json({ ...equip, ...lvlData, rods: RODS });
  } catch(e) { res.json({}); }
});

// ── POST /fishing2/upgrade-rod — kup lepszą wędkę ────────────────────────────
router.post('/upgrade-rod', requireSession, async (req, res) => {
  try {
    const { wedka } = req.body;
    if (!RODS[wedka]) return res.json({ ok: false, error: 'Nieznana wędka' });

    const equip   = await getEquip(req.session.postacId);
    const lvlData = calcFishingLvl(equip.exp);
    const rod     = RODS[wedka];
    if (lvlData.lvl < rod.minLvl)
      return res.json({ ok: false, error: `Wymagany poziom wędkarski ${rod.minLvl}` });

    const prices = { bambusowa:0, drewniana:200, stalowa:800, karbonowa:2500, mistyczna:10000 };
    const price  = prices[wedka] || 0;
    const [[postac]] = await db.query('SELECT zloto FROM postac WHERE id=?', [req.session.postacId]);
    if (postac.zloto < price) return res.json({ ok:false, error:`Potrzebujesz ${price}g` });

    await db.query('UPDATE postac SET zloto=zloto-? WHERE id=?', [price, req.session.postacId]);
    await db.query('UPDATE fishing_ekwipunek SET wedka=? WHERE postac_id=?', [wedka, req.session.postacId]);
    res.json({ ok: true, wedka, goldSpent: price });
  } catch(e) { res.json({ ok:false, error: serverError(e, 'fishing2') }); }
});

// ── GET /fishing2/history ─────────────────────────────────────────────────────
router.get('/history', requireSession, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM fishing_historia WHERE postac_id=? ORDER BY data DESC LIMIT 30',
      [req.session.postacId]
    );
    res.json(rows);
  } catch(e) { res.json([]); }
});

module.exports = router;
