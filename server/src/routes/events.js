const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { requireSession } = require('../middleware/auth');
const { serverError } = require('../game/log');
const { giveItem } = require('../game/inventory');

// Auto-check active events by date and by aktywny flag
async function getActiveEvent() {
  try {
    // First try manually activated
    const [[manual]] = await db.query(
      "SELECT * FROM eventy_sezonowe WHERE aktywny=1 LIMIT 1"
    );
    if (manual) return manual;
    // Then try auto by date
    const [[auto]] = await db.query(
      "SELECT * FROM eventy_sezonowe WHERE CURDATE() BETWEEN data_start AND data_koniec LIMIT 1"
    );
    return auto || null;
  } catch (_) { return null; }
}

// GET /api/events/active
router.get('/active', async (req, res) => {
  try {
    const event = await getActiveEvent();
    if (!event) return res.json({ active: false });
    // Also get shop items count
    const [[shopCount]] = await db.query(
      'SELECT COUNT(*) as cnt FROM event_sklep WHERE event_id=?',
      [event.id]
    ).catch(() => [[{ cnt: 0 }]]);
    res.json({ active: true, event, shopCount: shopCount?.cnt || 0 });
  } catch (e) { res.status(500).json({ error: serverError(e, 'events') }); }
});

// GET /api/events/shop
router.get('/shop', requireSession, async (req, res) => {
  try {
    const event = await getActiveEvent();
    if (!event) return res.json({ items: [], event: null });
    const [items] = await db.query(
      `SELECT es.*, p.nazwa, p.obrazek, p.typ
       FROM event_sklep es
       LEFT JOIN przedmiot_loot p ON p.id = es.przedmiot_id
       WHERE es.event_id = ?`,
      [event.id]
    ).catch(() => [[]]);
    res.json({ items, event });
  } catch (e) { res.status(500).json({ error: serverError(e, 'events') }); }
});

// POST /api/events/shop/buy
router.post('/shop/buy', requireSession, async (req, res) => {
  try {
    const { event_id, przedmiot_id } = req.body;
    const postacId = req.session.postacId;

    const [[shopItem]] = await db.query(
      'SELECT * FROM event_sklep WHERE event_id=? AND przedmiot_id=?',
      [event_id, przedmiot_id]
    );
    if (!shopItem) return res.json({ ok: false, error: 'Przedmiot niedostępny' });

    const [[postac]] = await db.query(
      'SELECT zloto, event_tokeny FROM postac WHERE id=?',
      [postacId]
    );
    if (!postac) return res.json({ ok: false, error: 'Brak postaci' });

    const goldCost  = shopItem.cena_gold  > 0 ? shopItem.cena_gold  : 0;
    const tokenCost = shopItem.cena_token > 0 ? shopItem.cena_token : 0;
    if (postac.zloto < goldCost) return res.json({ ok: false, error: 'Za mało złota' });
    if ((postac.event_tokeny || 0) < tokenCost) return res.json({ ok: false, error: 'Za mało tokenów eventowych' });

    const [src] = shopItem.przedmiot_id
      ? await db.query('SELECT * FROM przedmiot_loot WHERE id=?', [shopItem.przedmiot_id])
      : [[]];

    // Złoto i tokeny pobierane jednym warunkowym UPDATE — wcześniej przy braku
    // tokenów złoto było już pobrane, a równoległe zakupy mogły zejść poniżej zera
    const bought = await db.withTransaction(async (conn) => {
      const [pay] = await conn.query(
        `UPDATE postac SET zloto=zloto-?, event_tokeny=COALESCE(event_tokeny,0)-?
         WHERE id=? AND zloto>=? AND COALESCE(event_tokeny,0)>=?`,
        [goldCost, tokenCost, postacId, goldCost, tokenCost]
      );
      if (pay.affectedRows !== 1) return false;
      if (src[0]) await giveItem(conn, postacId, src[0], { typ: src[0].typ || 'Inne', ilosc: 1 });
      return true;
    });
    if (!bought) return res.json({ ok: false, error: 'Za mało złota lub tokenów eventowych' });

    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: serverError(e, 'events') }); }
});

// POST /api/events/admin/activate
router.post('/admin/activate', requireSession, async (req, res) => {
  try {
    const [[postac]] = await db.query('SELECT ranga FROM postac WHERE id=?', [req.session.postacId]);
    if (!postac || !['GameAdmin', 'GameMaster'].includes(postac.ranga))
      return res.status(403).json({ error: 'Brak uprawnień' });

    const { event_id, aktywny } = req.body;
    // Deactivate all first
    await db.query('UPDATE eventy_sezonowe SET aktywny=0');
    if (aktywny) {
      await db.query('UPDATE eventy_sezonowe SET aktywny=1 WHERE id=?', [event_id]);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: serverError(e, 'events') }); }
});

module.exports = router;
