const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireSession } = require('../middleware/auth');
const { logError, serverError } = require('../game/log');

async function finalizeOfflineSession(sess, dbConn) {
  try {
    const [mobs] = await dbConn.query('SELECT AVG(exp) as avg_exp, AVG(obr_max) as avg_gold FROM mob WHERE mapa=? LIMIT 50', [sess.mapa_id]);
    const avgExp = mobs[0]?.avg_exp || 20;
    const avgGold = Math.floor((mobs[0]?.avg_gold || 5) * 0.3);

    const startTime = new Date(sess.data_start);
    const endTime = new Date(Math.min(new Date(sess.data_koniec), Date.now()));
    const hoursElapsed = Math.max(0, (endTime - startTime) / 3600000);
    const kills = Math.floor(hoursElapsed * 30);
    const expGained = Math.floor(kills * avgExp);
    const goldGained = Math.floor(kills * avgGold);

    await dbConn.query(
      "UPDATE offline_progress SET wynik_exp=?, wynik_gold=?, wynik_kills=?, status='zakończony' WHERE postac_id=?",
      [expGained, goldGained, kills, sess.postac_id]
    );
  } catch (e) { logError('offline:24')(e); }
}

// POST /offline/start { mapa_id, godziny }
router.post('/start', requireSession, async (req, res) => {
  try {
    const { mapa_id, godziny } = req.body;
    const hours = Math.max(0.5, Math.min(2, parseFloat(godziny) || 1));
    const postacId = req.session.postacId;

    const [[existing]] = await db.query("SELECT id FROM offline_progress WHERE postac_id=? AND status='aktywny'", [postacId]);
    if (existing) return res.json({ ok: false, error: 'Już trwa autofarming' });

    const [[mapa]] = await db.query('SELECT id FROM mapa WHERE id=?', [mapa_id]);
    if (!mapa) return res.json({ ok: false, error: 'Mapa nie istnieje' });

    const koniec = new Date(Date.now() + hours * 3600 * 1000);
    await db.query('DELETE FROM offline_progress WHERE postac_id=?', [postacId]);
    await db.query(
      'INSERT INTO offline_progress (postac_id,mapa_id,data_koniec) VALUES (?,?,?)',
      [postacId, mapa_id, koniec]
    );

    res.json({ ok: true, expires: koniec, godziny: hours });
  } catch (e) {
    res.json({ ok: false, error: serverError(e, 'offline') });
  }
});

// POST /offline/collect — collect results
router.post('/collect', requireSession, async (req, res) => {
  try {
    const postacId = req.session.postacId;
    const [[sess]] = await db.query('SELECT * FROM offline_progress WHERE postac_id=?', [postacId]);
    if (!sess) return res.json({ ok: false, error: 'Brak sesji' });

    if (sess.status === 'aktywny' && new Date(sess.data_koniec) > new Date()) {
      return res.json({ ok: false, error: 'Sesja jeszcze trwa', remaining: new Date(sess.data_koniec) - Date.now() });
    }

    // If still active (just finished), compute results now
    if (sess.status === 'aktywny') {
      await finalizeOfflineSession(sess, db);
      const [[updated]] = await db.query('SELECT wynik_exp, wynik_gold, wynik_kills FROM offline_progress WHERE postac_id=?', [postacId]);
      if (updated) {
        sess.wynik_exp = updated.wynik_exp;
        sess.wynik_gold = updated.wynik_gold;
        sess.wynik_kills = updated.wynik_kills;
      }
    }

    // Apply rewards
    await db.query('UPDATE postac SET exp=exp+?, zloto=zloto+? WHERE id=?', [sess.wynik_exp, sess.wynik_gold, postacId]);
    await db.query('DELETE FROM offline_progress WHERE postac_id=?', [postacId]);

    res.json({ ok: true, exp: sess.wynik_exp, gold: sess.wynik_gold, kills: sess.wynik_kills });
  } catch (e) {
    res.json({ ok: false, error: serverError(e, 'offline') });
  }
});

// GET /offline/status
router.get('/status', requireSession, async (req, res) => {
  try {
    const [[sess]] = await db.query('SELECT * FROM offline_progress WHERE postac_id=?', [req.session.postacId]);
    if (!sess) return res.json(null);
    const now = new Date();
    const koniec = new Date(sess.data_koniec);
    const done = koniec <= now || sess.status === 'zakończony';
    if (done && sess.status === 'aktywny') {
      await finalizeOfflineSession(sess, db);
      const [[updated]] = await db.query('SELECT wynik_exp, wynik_gold, wynik_kills FROM offline_progress WHERE postac_id=?', [req.session.postacId]);
      if (updated) {
        sess.wynik_exp = updated.wynik_exp;
        sess.wynik_gold = updated.wynik_gold;
        sess.wynik_kills = updated.wynik_kills;
      }
    }
    res.json({ ...sess, done, remaining: Math.max(0, koniec - now) });
  } catch (e) {
    res.json(null);
  }
});

module.exports = router;
module.exports.finalizeOfflineSession = finalizeOfflineSession;
