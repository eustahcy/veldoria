const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireSession } = require('../middleware/auth');

// GET /api/chat — get last 25 messages for current map
router.get('/', requireSession, async (req, res) => {
  const [[postac]] = await db.query('SELECT mapa, id FROM postac WHERE id = ?', [req.session.postacId]);
  const [rows] = await db.query(
    'SELECT kto, tresc FROM chat WHERE mapa_id = ? OR postac_id = ? ORDER BY id DESC LIMIT 25',
    [postac.mapa, postac.id]
  );
  res.json(rows.reverse());
});

// POST /api/chat — send message
router.post('/', requireSession, async (req, res) => {
  const { tresc } = req.body;
  if (!tresc || !tresc.trim()) return res.json({ ok: false });

  const now = Math.floor(Date.now() / 1000);
  const [[postac]] = await db.query('SELECT * FROM postac WHERE id = ?', [req.session.postacId]);

  if (postac.zablokowany_chat > now) return res.json({ ok: false, error: 'Chat zablokowany' });

  // Admin commands
  if (postac.id === 3) {
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

  await db.query(
    'INSERT INTO chat (kto, tresc, mapa_id, postac_id) VALUES (?, ?, ?, ?)',
    [postac.nazwa, tresc.trim(), postac.mapa, postac.id]
  );
  res.json({ ok: true });
});

module.exports = router;
