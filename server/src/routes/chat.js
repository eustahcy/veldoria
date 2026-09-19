const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireSession } = require('../middleware/auth');
const { chatMeta } = require('../game/chatMeta');

const KANALY = ['lokalny', 'globalny', 'handel'];

// GET /api/chat — ostatnie wiadomości: lokalne z tej mapy + globalne i handlowe
router.get('/', requireSession, async (req, res, next) => {
  try {
    const [[postac]] = await db.query('SELECT mapa, id FROM postac WHERE id = ?', [req.session.postacId]);
    if (!postac) return res.json([]);
    const [rows] = await db.query(
      `SELECT c.kto, c.tresc, c.kanal, c.czas, p.poziom, p.prestige, g.tag AS gildia
       FROM chat c
       LEFT JOIN postac p ON p.id = c.postac_id
       LEFT JOIN gildia_czlonkowie gm ON gm.postac_id = c.postac_id
       LEFT JOIN gilde g ON g.id = gm.gildia_id
       WHERE c.kanal IN ('globalny','handel','system') OR (c.kanal = 'lokalny' AND c.mapa_id = ?)
       ORDER BY c.id DESC LIMIT 40`,
      [postac.mapa]
    );
    res.json(rows.reverse());
  } catch (e) { next(e); }
});

// POST /api/chat — zapasowa wysyłka, gdy socket nie działa
router.post('/', requireSession, async (req, res, next) => {
  try {
    const { tresc } = req.body;
    const kanal = KANALY.includes(req.body.kanal) ? req.body.kanal : 'lokalny';
    if (!tresc || !tresc.trim()) return res.json({ ok: false });

    const now = Math.floor(Date.now() / 1000);
    const [[postac]] = await db.query('SELECT * FROM postac WHERE id = ?', [req.session.postacId]);
    if (!postac) return res.json({ ok: false });
    if (postac.zablokowany_chat > now) return res.json({ ok: false, error: 'Chat zablokowany' });

    // Komendy moderacji — po randze (wcześniej były przypięte do postaci o id 3)
    if (['GameAdmin', 'GameMaster', 'Moderator'].includes(postac.ranga)) {
      const logoutMatch = tresc.match(/^\/logout\s+(.+)/);
      if (logoutMatch) {
        const [[target]] = await db.query('SELECT id FROM postac WHERE nazwa = ?', [logoutMatch[1]]);
        if (target) await db.query('UPDATE postac SET zalogowany = 0 WHERE id = ?', [target.id]);
        return res.json({ ok: true, admin: true });
      }
      const blockMatch = tresc.match(/^\/blockchat\s+(.+)/);
      if (blockMatch) {
        await db.query('UPDATE postac SET zablokowany_chat = ? WHERE nazwa = ?', [now + 43200, blockMatch[1]]);
        return res.json({ ok: true, admin: true });
      }
    }

    const text = tresc.trim().slice(0, 250);
    await db.query(
      'INSERT INTO chat (kto, tresc, mapa_id, postac_id, kanal) VALUES (?, ?, ?, ?, ?)',
      [postac.nazwa, text, postac.mapa, postac.id, kanal]
    );
    const io = req.app.locals.io;
    const msg = { kto: postac.nazwa, tresc: text, kanal, ...(await chatMeta(db, postac.id)) };
    if (io) {
      if (kanal === 'lokalny') io.to(`map_${postac.mapa}`).emit('chat_message', msg);
      else io.emit('chat_message', msg);
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
