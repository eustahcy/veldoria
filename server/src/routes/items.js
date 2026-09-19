const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireSession } = require('../middleware/auth');
const { giveItem, equipError } = require('../game/inventory');
const { clampStoredHp, computeStats } = require('../game/stats');
const { collectTax } = require('../game/taxes');
const { logError, serverError } = require('../game/log');

// GET /api/items/inventory — character's items
router.get('/inventory', requireSession, async (req, res, next) => {
  try {
    const [items] = await db.query(
      'SELECT * FROM przedmiot_postac WHERE postac = ? ORDER BY id DESC',
      [req.session.postacId]
    );
    res.json(items);
  } catch (e) { next(e); }
});

// POST /api/items/equip — equip/unequip item
router.post('/equip', requireSession, async (req, res, next) => {
  try {
    const { itemId, action } = req.body; // action: 'zaloz' | 'zdejmij'
    const zalozony = action === 'zaloz' ? 1 : 0;
    const postacId = req.session.postacId;

    const [[item]] = await db.query(
      'SELECT * FROM przedmiot_postac WHERE id = ? AND postac = ?',
      [itemId, postacId]
    );
    if (!item) return res.status(404).json({ error: 'Przedmiot nie istnieje' });

    if (zalozony === 1) {
      // Wymagania poziomu i profesji — wcześniej sprawdzał je tylko klient
      const [[postac]] = await db.query('SELECT poziom, profesja FROM postac WHERE id = ?', [postacId]);
      const err = equipError(postac, item);
      if (err) return res.status(400).json({ ok: false, error: err });

      // Unequip same slot
      await db.query(
        'UPDATE przedmiot_postac SET zalozony = 0 WHERE postac = ? AND typ = ? AND zalozony = 1',
        [postacId, item.typ]
      );
    }

    await db.query(
      'UPDATE przedmiot_postac SET zalozony = ? WHERE id = ? AND postac = ?',
      [zalozony, itemId, postacId]
    );

    await clampStoredHp(db, postacId);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// POST /api/items/sell — sell item to get gold
router.post('/sell', requireSession, async (req, res, next) => {
  try {
    const { itemId } = req.body;
    const postacId = req.session.postacId;

    const [[item]] = await db.query(
      'SELECT id, wartosc_sprzedazy FROM przedmiot_postac WHERE id = ? AND postac = ? AND zalozony = 0',
      [itemId, postacId]
    );
    if (!item) return res.status(404).json({ error: 'Nie można sprzedać' });

    // Złoto tylko dla żądania, które faktycznie usunęło przedmiot —
    // dwa równoległe /sell tego samego przedmiotu nie dadzą podwójnej zapłaty
    const [del] = await db.query(
      'DELETE FROM przedmiot_postac WHERE id = ? AND postac = ? AND zalozony = 0',
      [item.id, postacId]
    );
    if (del.affectedRows !== 1) return res.status(404).json({ error: 'Nie można sprzedać' });

    const gold = item.wartosc_sprzedazy || 0;
    await db.query('UPDATE postac SET zloto = zloto + ? WHERE id = ?', [gold, postacId]);

    res.json({ ok: true, gold });
  } catch (e) { next(e); }
});

// POST /api/items/use — wypij miksturę poza walką
router.post('/use', requireSession, async (req, res, next) => {
  try {
    const { itemId } = req.body;
    const postacId = req.session.postacId;

    const [[item]] = await db.query(
      "SELECT * FROM przedmiot_postac WHERE id=? AND postac=? AND typ='Konsupcyjne'",
      [itemId, postacId]
    );
    if (!item) return res.json({ ok: false, error: 'Nie masz takiego przedmiotu' });

    const [[raw]] = await db.query('SELECT * FROM postac WHERE id=?', [postacId]);
    if (!raw) return res.json({ ok: false, error: 'Brak postaci' });
    const stats = await computeStats(db, raw);
    if (raw.zycie >= stats.zycie_max) return res.json({ ok: false, error: 'Masz pełne życie' });

    // Usunięcie warunkowe — dwa kliknięcia naraz nie wypiją jednej mikstury dwa razy
    const [del] = await db.query('DELETE FROM przedmiot_postac WHERE id=? AND postac=?', [item.id, postacId]);
    if (del.affectedRows !== 1) return res.json({ ok: false, error: 'Nie masz takiego przedmiotu' });

    const heal = item.pelne_leczenie ? stats.zycie_max : (item.mikstura_leczenie || 0);
    const nowe = Math.min(stats.zycie_max, raw.zycie + heal);
    await db.query('UPDATE postac SET zycie=? WHERE id=?', [nowe, postacId]);

    res.json({ ok: true, zycie: nowe, zycie_max: stats.zycie_max, wyleczono: nowe - raw.zycie, nazwa: item.nazwa });
  } catch (e) { next(e); }
});

// GET /api/items/shop/:shopId — shop inventory
router.get('/shop/:shopId', requireSession, async (req, res, next) => {
  try {
    const [[postac]] = await db.query('SELECT x, y, mapa FROM postac WHERE id = ?', [req.session.postacId]);
    if (!postac) return res.status(404).json({ error: 'Brak postaci' });

    // Verify NPC with this shop is adjacent
    const [[npc]] = await db.query(
      'SELECT id FROM npc WHERE shop = ? AND mapa = ? AND ABS(x - ?) <= 2 AND ABS(y - ?) <= 2 LIMIT 1',
      [req.params.shopId, postac.mapa, postac.x, postac.y]
    );
    if (!npc) return res.status(403).json({ error: 'Zbyt daleko od kupca' });

    const [items] = await db.query(
      'SELECT * FROM przedmiot_sklep WHERE sklep = ?',
      [req.params.shopId]
    );
    res.json(items);
  } catch (e) { next(e); }
});

// POST /api/items/buy — buy item from shop
router.post('/buy', requireSession, async (req, res, next) => {
  try {
    const { itemId, shopId } = req.body;

    const [[postac]] = await db.query('SELECT id, mapa, x, y FROM postac WHERE id = ?', [req.session.postacId]);
    if (!postac) return res.status(404).json({ error: 'Brak postaci' });

    const [[npc]] = await db.query(
      'SELECT id FROM npc WHERE shop = ? AND mapa = ? AND ABS(x - ?) <= 2 AND ABS(y - ?) <= 2 LIMIT 1',
      [shopId, postac.mapa, postac.x, postac.y]
    );
    if (!npc) return res.status(403).json({ error: 'Zbyt daleko od kupca' });

    const [[item]] = await db.query('SELECT * FROM przedmiot_sklep WHERE id = ? AND sklep = ?', [itemId, shopId]);
    if (!item) return res.status(404).json({ error: 'Brak towaru' });

    const price = item.wartosc_kupna || 0;

    // Złoto pobierane warunkowo (zloto >= cena) — równoległe zakupy nie zejdą poniżej zera
    const bought = await db.withTransaction(async (conn) => {
      const [upd] = await conn.query(
        'UPDATE postac SET zloto = zloto - ? WHERE id = ? AND zloto >= ?',
        [price, postac.id, price]
      );
      if (upd.affectedRows !== 1) return false;
      await giveItem(conn, postac.id, item, { wartosc_sprzedazy: Math.floor(price / 2) });
      return true;
    });
    if (!bought) return res.json({ ok: false, error: 'Za mało złota' });

    // Collect territorial tax on NPC purchase
    collectTax(postac.mapa, price, 'sklep_npc').catch(logError('items:buy:tax'));

    const [[after]] = await db.query('SELECT zloto FROM postac WHERE id = ?', [postac.id]);
    res.json({ ok: true, zloto: Number(after.zloto) });
  } catch (e) { next(e); }
});

// ── POST /api/items/temple-heal — leczenie w Świątyni (cooldown 30 min) ──────
const templeCooldowns = new Map(); // postacId → timestamp

router.post('/temple-heal', requireSession, async (req, res) => {
  try {
    const postacId = req.session.postacId;
    const COOLDOWN_MS = 30 * 60 * 1000;
    const last = templeCooldowns.get(postacId) || 0;
    const remaining = COOLDOWN_MS - (Date.now() - last);

    // Musi być blisko NPC Kapłanki (npc id=19, mapa 5)
    const [[postac]] = await db.query('SELECT * FROM postac WHERE id=?', [postacId]);
    if (!postac) return res.json({ ok: false, error: 'Brak postaci' });
    if (postac.mapa !== 5) return res.json({ ok: false, error: 'Musisz być w Świątyni Światła' });

    const [[elara]] = await db.query('SELECT x,y FROM npc WHERE id=19 LIMIT 1');
    if (elara) {
      const dist = Math.max(Math.abs(postac.x - elara.x), Math.abs(postac.y - elara.y));
      if (dist > 3) return res.json({ ok: false, error: 'Podejdź bliżej Kapłanki Elary' });
    }

    if (remaining > 0) {
      const mins = Math.ceil(remaining / 60000);
      return res.json({ ok: false, error: `Możesz skorzystać z leczenia za ${mins} min`, cooldownMs: remaining });
    }

    const { computeStats } = require('../game/stats');
    const computed = await computeStats(db, postac);
    await db.query('UPDATE postac SET zycie=? WHERE id=?', [computed.zycie_max, postacId]);
    templeCooldowns.set(postacId, Date.now());

    res.json({ ok: true, zycie: computed.zycie_max, nextHealIn: COOLDOWN_MS });
  } catch(e) { res.json({ ok: false, error: serverError(e, 'items') }); }
});

// ── GET /api/items/temple-status — stan cooldownu świątyni ───────────────────
router.get('/temple-status', requireSession, async (req, res) => {
  const last = templeCooldowns.get(req.session.postacId) || 0;
  const remaining = Math.max(0, 30 * 60 * 1000 - (Date.now() - last));
  res.json({ canHeal: remaining === 0, cooldownMs: remaining, cooldownMins: Math.ceil(remaining / 60000) });
});

// ── GET /api/items/boss-portal — sprawdź czy boss jest aktywny ───────────────
router.get('/boss-portal', requireSession, async (req, res) => {
  try {
    const [[boss]] = await db.query("SELECT id,nazwa,mapa_id,zycie,zycie_max FROM world_boss WHERE status='aktywny' LIMIT 1");
    if (!boss) return res.json({ active: false, msg: 'Brak aktywnego World Bossa.' });

    const [[postac]] = await db.query('SELECT mapa,x,y FROM postac WHERE id=?', [req.session.postacId]);
    // Portal na mapie 1, pozycja (31,12)
    if (postac.mapa !== 1) return res.json({ active: true, boss, canUse: false, msg: 'Portal jest na głównej mapie.' });
    const dist = Math.max(Math.abs(postac.x - 31), Math.abs(postac.y - 12));
    if (dist > 3) return res.json({ active: true, boss, canUse: false, msg: 'Podejdź bliżej portalu (31,12).' });

    res.json({ active: true, boss, canUse: true });
  } catch(e) { res.json({ active: false }); }
});

// ── POST /api/items/use-boss-portal — teleport do world bossa ─────────────────
router.post('/use-boss-portal', requireSession, async (req, res) => {
  try {
    const [[boss]] = await db.query("SELECT id,mapa_id FROM world_boss WHERE status='aktywny' LIMIT 1");
    if (!boss) return res.json({ ok: false, error: 'Brak aktywnego World Bossa' });

    const postacId = req.session.postacId;
    const [[postac]] = await db.query('SELECT mapa,x,y FROM postac WHERE id=?', [postacId]);
    if (postac.mapa !== 1) return res.json({ ok: false, error: 'Musisz być przy portalu w Veldorii' });

    const bossMap = boss.mapa_id || 1;
    await db.query('UPDATE postac SET mapa=?,x=30,y=30 WHERE id=?', [bossMap, postacId]);
    res.json({ ok: true, mapa: bossMap, x: 30, y: 30 });
  } catch(e) { res.json({ ok: false, error: serverError(e, 'items') }); }
});

// ── GET /api/items/guild-board — dane tablicy gildii ─────────────────────────
router.get('/guild-board', requireSession, async (req, res) => {
  try {
    const [topGuilds] = await db.query(
      `SELECT g.id, g.nazwa, g.poziom, g.opis,
              COUNT(gc.postac_id) as czlonkowie,
              SUM(gc.wklad_kills) as laczne_kille
       FROM gilde g
       LEFT JOIN gildia_czlonkowie gc ON gc.gildia_id=g.id
       GROUP BY g.id ORDER BY czlonkowie DESC, laczne_kille DESC LIMIT 10`
    ).catch(() => [[]]);

    const [recentWars] = await db.query(
      `SELECT gw.*, g1.nazwa as atakujacy_nazwa, g2.nazwa as bronicy_nazwa
       FROM gildia_wojny gw
       LEFT JOIN gilde g1 ON g1.id=gw.gildia_atakujaca
       LEFT JOIN gilde g2 ON g2.id=gw.gildia_broniac
       ORDER BY gw.id DESC LIMIT 5`
    ).catch(() => [[]]);

    res.json({ topGuilds, recentWars });
  } catch(e) { res.json({ topGuilds: [], recentWars: [] }); }
});

// ── GET /api/items/event-zone — status strefy eventowej ──────────────────────
router.get('/event-zone', requireSession, async (req, res) => {
  try {
    const [[ev]] = await db.query("SELECT * FROM eventy_sezonowe WHERE aktywny=1 LIMIT 1").catch(() => [[null]]);
    res.json({ active: !!ev, event: ev || null });
  } catch(e) { res.json({ active: false }); }
});

module.exports = router;
