const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { requireSession } = require('../middleware/auth');
const { collectTax } = require('../game/taxes');
const { listAuction, buyAuction, cancelAuction } = require('../game/economy');
const { logError } = require('../game/log');

// Auto-create table (idempotent — already done in migration but safe to repeat)
(async () => {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS aukcje (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sprzedawca_id INT NOT NULL,
      sprzedawca_nazwa VARCHAR(100),
      przedmiot_snapshot TEXT NOT NULL,
      cena INT NOT NULL,
      data_wystawienia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      data_wygasniecia TIMESTAMP NOT NULL,
      status ENUM('aktywna','sprzedana','wygasla','anulowana') DEFAULT 'aktywna',
      kupiec_id INT DEFAULT NULL,
      kupiec_nazwa VARCHAR(100) DEFAULT NULL
    ) ENGINE=InnoDB`);
  } catch (e) { logError('auction:init')(e); }
})();

// GET /auction?typ=&klasa=&search=&cena_min=&cena_max=&sort=
router.get('/', requireSession, async (req, res, next) => {
  try {
    const { typ, klasa, search, cena_min, cena_max, sort } = req.query;
    let where = "status='aktywna' AND data_wygasniecia > NOW()";
    const params = [];

    if (typ) { where += ' AND JSON_UNQUOTE(JSON_EXTRACT(przedmiot_snapshot,"$.typ"))=?'; params.push(typ); }
    if (klasa) { where += ' AND JSON_UNQUOTE(JSON_EXTRACT(przedmiot_snapshot,"$.klasa"))=?'; params.push(klasa); }
    if (search) { where += ' AND JSON_UNQUOTE(JSON_EXTRACT(przedmiot_snapshot,"$.nazwa")) LIKE ?'; params.push(`%${search}%`); }
    if (cena_min) { where += ' AND cena>=?'; params.push(Number(cena_min)); }
    if (cena_max) { where += ' AND cena<=?'; params.push(Number(cena_max)); }

    let order = 'data_wystawienia DESC';
    if (sort === 'cena_asc')  order = 'cena ASC';
    if (sort === 'cena_desc') order = 'cena DESC';
    if (sort === 'nowe')      order = 'data_wystawienia DESC';

    const [rows] = await db.query(
      `SELECT id, sprzedawca_nazwa, przedmiot_snapshot, cena, data_wystawienia, data_wygasniecia
       FROM aukcje WHERE ${where} ORDER BY ${order} LIMIT 50`,
      params
    );

    const aukcje = rows.map(r => ({
      ...r,
      item: JSON.parse(r.przedmiot_snapshot),
    }));
    res.json({ aukcje });
  } catch (e) { next(e); }
});

// GET /auction/my — my active auctions
router.get('/my', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [rows] = await db.query(
      "SELECT id, przedmiot_snapshot, cena, data_wystawienia, data_wygasniecia, status FROM aukcje WHERE sprzedawca_id=? ORDER BY data_wystawienia DESC LIMIT 30",
      [postacId]
    );
    const aukcje = rows.map(r => ({ ...r, item: JSON.parse(r.przedmiot_snapshot) }));
    res.json({ aukcje });
  } catch (e) { next(e); }
});

// POST /auction/list — put item up for auction
router.post('/list', requireSession, async (req, res, next) => {
  try {
    const { przedmiot_id, cena, godziny } = req.body;
    res.json(await listAuction(db, req.session.postacId, przedmiot_id, cena, godziny));
  } catch (e) { next(e); }
});

// POST /auction/buy/:id — buy auction immediately
router.post('/buy/:id', requireSession, async (req, res, next) => {
  try {
    const result = await buyAuction(db, req.session.postacId, parseInt(req.params.id, 10));
    if (!result.ok) return res.json(result);
    const { auction, snap, buyer } = result;

    // Collect tax — use seller's current map
    const [[seller]] = await db.query('SELECT mapa FROM postac WHERE id=?', [auction.sprzedawca_id]);
    await collectTax(seller?.mapa || 1, auction.cena, 'aukcja');

    // Notify seller if online
    const { io: ioRef } = req.app.locals;
    if (ioRef) {
      ioRef.to(`player_${auction.sprzedawca_id}`).emit('auction_sold', {
        itemNazwa: snap.nazwa,
        cena: auction.cena,
        kupiec: buyer.nazwa,
      });
    }

    res.json({ ok: true });
  } catch (e) { next(e); }
});

// POST /auction/cancel/:id — cancel own auction
router.post('/cancel/:id', requireSession, async (req, res, next) => {
  try {
    res.json(await cancelAuction(db, req.session.postacId, parseInt(req.params.id, 10)));
  } catch (e) { next(e); }
});

module.exports = router;
