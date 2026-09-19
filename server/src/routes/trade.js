const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { requireSession } = require('../middleware/auth');
const { executeTrade } = require('../game/economy');
const { logError } = require('../game/log');

// GET /api/trade/session — get my active trade session
router.get('/session', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[session]] = await db.query(
      "SELECT * FROM handel_sesje WHERE (gracz1_id=? OR gracz2_id=?) AND status='aktywna' LIMIT 1",
      [postacId, postacId]
    );
    if (!session) return res.json({ session: null });

    const [items] = await db.query(
      'SELECT hp.*, pp.nazwa, pp.klasa, pp.typ, pp.obrazek FROM handel_przedmioty hp JOIN przedmiot_postac pp ON pp.id=hp.przedmiot_id WHERE hp.sesja_id=?',
      [session.id]
    );
    res.json({ session, items });
  } catch (e) { next(e); }
});

// POST /api/trade/cancel — cancel current session
router.post('/cancel', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    await db.query(
      "UPDATE handel_sesje SET status='anulowana' WHERE (gracz1_id=? OR gracz2_id=?) AND status='aktywna'",
      [postacId, postacId]
    );
    res.json({ ok: true });
  } catch (e) { next(e); }
});

/**
 * Register all socket.io trade events.
 * Usage in index.js:
 *   const { registerTradeSocket } = require('./routes/trade');
 *   // Inside io.on('connection', socket => {
 *   registerTradeSocket(io, db)(socket, socketToPlayer);
 */
function registerTradeSocket(io, dbConn) {
  return function handler(socket, socketToPlayer) {
    const postacId = socket.request.session?.postacId;
    if (!postacId) return;

    // Helper — get active session for this player
    async function getMySession() {
      const [[s]] = await dbConn.query(
        "SELECT * FROM handel_sesje WHERE (gracz1_id=? OR gracz2_id=?) AND status='aktywna' LIMIT 1",
        [postacId, postacId]
      );
      return s || null;
    }

    // Helper — build offer for one player in a session
    async function buildOffer(sesjaId, gracjId) {
      const [items] = await dbConn.query(
        'SELECT hp.przedmiot_id, pp.nazwa, pp.klasa, pp.typ, pp.obrazek FROM handel_przedmioty hp JOIN przedmiot_postac pp ON pp.id=hp.przedmiot_id WHERE hp.sesja_id=? AND hp.gracz_id=?',
        [sesjaId, gracjId]
      );
      return items;
    }

    // Helper — emit trade_updated to both players
    async function emitUpdated(session) {
      const g1Items = await buildOffer(session.id, session.gracz1_id);
      const g2Items = await buildOffer(session.id, session.gracz2_id);
      const payload = {
        sessionId: session.id,
        gracz1: { id: session.gracz1_id, items: g1Items, gold: session.gracz1_gold, confirmed: !!session.gracz1_confirm },
        gracz2: { id: session.gracz2_id, items: g2Items, gold: session.gracz2_gold, confirmed: !!session.gracz2_confirm },
      };
      io.to(`player_${session.gracz1_id}`).emit('trade_updated', payload);
      io.to(`player_${session.gracz2_id}`).emit('trade_updated', payload);
    }

    // ── trade_request ─────────────────────────────────────────────────────────
    socket.on('trade_request', async ({ targetId }) => {
      try {
        if (!targetId || targetId === postacId) return;

        // Check both on same map, dist ≤ 3
        const [[me]] = await dbConn.query('SELECT nazwa, mapa, x, y FROM postac WHERE id=?', [postacId]);
        const [[target]] = await dbConn.query('SELECT nazwa, mapa, x, y FROM postac WHERE id=? AND zalogowany=1', [targetId]);
        if (!me || !target) return socket.emit('trade_error', { message: 'Gracz offline' });
        if (me.mapa !== target.mapa) return socket.emit('trade_error', { message: 'Gracz jest na innej mapie' });
        if (Math.abs(me.x - target.x) > 3 || Math.abs(me.y - target.y) > 3) {
          return socket.emit('trade_error', { message: 'Gracz jest za daleko (max 3 pola)' });
        }

        // Create pending session (reuse if already one between these two)
        const [[existing]] = await dbConn.query(
          "SELECT id FROM handel_sesje WHERE ((gracz1_id=? AND gracz2_id=?) OR (gracz1_id=? AND gracz2_id=?)) AND status='aktywna' LIMIT 1",
          [postacId, targetId, targetId, postacId]
        );
        if (existing) return socket.emit('trade_error', { message: 'Sesja handlu już istnieje' });

        const [result] = await dbConn.query(
          'INSERT INTO handel_sesje (gracz1_id, gracz2_id) VALUES (?,?)',
          [postacId, targetId]
        );
        const sessionId = result.insertId;

        io.to(`player_${targetId}`).emit('trade_request_received', {
          sessionId,
          from: { id: postacId, nazwa: me.nazwa },
        });
      } catch (e) {
        socket.emit('trade_error', { message: 'Błąd serwera' });
      }
    });

    // ── trade_accept ──────────────────────────────────────────────────────────
    socket.on('trade_accept', async ({ sessionId }) => {
      try {
        const [[session]] = await dbConn.query(
          "SELECT * FROM handel_sesje WHERE id=? AND gracz2_id=? AND status='aktywna'",
          [sessionId, postacId]
        );
        if (!session) return socket.emit('trade_error', { message: 'Brak sesji' });

        const [[g1]] = await dbConn.query('SELECT nazwa FROM postac WHERE id=?', [session.gracz1_id]);
        const [[g2]] = await dbConn.query('SELECT nazwa FROM postac WHERE id=?', [session.gracz2_id]);

        io.to(`player_${session.gracz1_id}`).emit('trade_started', {
          sessionId,
          partner: { id: session.gracz2_id, nazwa: g2?.nazwa || '?' },
        });
        io.to(`player_${session.gracz2_id}`).emit('trade_started', {
          sessionId,
          partner: { id: session.gracz1_id, nazwa: g1?.nazwa || '?' },
        });
        await emitUpdated(session);
      } catch (e) {
        socket.emit('trade_error', { message: 'Błąd serwera' });
      }
    });

    // ── trade_decline ─────────────────────────────────────────────────────────
    socket.on('trade_decline', async ({ sessionId }) => {
      try {
        const [[session]] = await dbConn.query(
          "SELECT * FROM handel_sesje WHERE id=? AND gracz2_id=? AND status='aktywna'",
          [sessionId, postacId]
        );
        if (!session) return;
        await dbConn.query("UPDATE handel_sesje SET status='anulowana' WHERE id=?", [sessionId]);
        io.to(`player_${session.gracz1_id}`).emit('trade_cancelled', { sessionId, reason: 'Odmowa handlu' });
      } catch (e) { logError('trade:153')(e); }
    });

    // ── trade_add_item ────────────────────────────────────────────────────────
    socket.on('trade_add_item', async ({ sessionId, przedmiotId }) => {
      try {
        const session = await getMySession();
        if (!session || session.id !== sessionId) return socket.emit('trade_error', { message: 'Brak sesji' });
        if (session.gracz1_confirm || session.gracz2_confirm) {
          // Reset confirmations
          await dbConn.query('UPDATE handel_sesje SET gracz1_confirm=0, gracz2_confirm=0 WHERE id=?', [sessionId]);
          session.gracz1_confirm = 0; session.gracz2_confirm = 0;
        }

        // Verify item belongs to this player and is not equipped
        const [[item]] = await dbConn.query(
          'SELECT id FROM przedmiot_postac WHERE id=? AND postac=? AND zalozony=0',
          [przedmiotId, postacId]
        );
        if (!item) return socket.emit('trade_error', { message: 'Nie możesz dodać tego przedmiotu' });

        // Check max 8 items
        const [[cnt]] = await dbConn.query(
          'SELECT COUNT(*) as c FROM handel_przedmioty WHERE sesja_id=? AND gracz_id=?',
          [sessionId, postacId]
        );
        if (cnt.c >= 8) return socket.emit('trade_error', { message: 'Maksymalnie 8 przedmiotów' });

        // Check not already added
        const [[dup]] = await dbConn.query(
          'SELECT id FROM handel_przedmioty WHERE sesja_id=? AND przedmiot_id=?',
          [sessionId, przedmiotId]
        );
        if (dup) return socket.emit('trade_error', { message: 'Przedmiot już w ofercie' });

        await dbConn.query(
          'INSERT INTO handel_przedmioty (sesja_id, gracz_id, przedmiot_id) VALUES (?,?,?)',
          [sessionId, postacId, przedmiotId]
        );
        await emitUpdated(session);
      } catch (e) {
        socket.emit('trade_error', { message: 'Błąd serwera' });
      }
    });

    // ── trade_remove_item ─────────────────────────────────────────────────────
    socket.on('trade_remove_item', async ({ sessionId, przedmiotId }) => {
      try {
        const session = await getMySession();
        if (!session || session.id !== sessionId) return;
        if (session.gracz1_confirm || session.gracz2_confirm) {
          await dbConn.query('UPDATE handel_sesje SET gracz1_confirm=0, gracz2_confirm=0 WHERE id=?', [sessionId]);
          session.gracz1_confirm = 0; session.gracz2_confirm = 0;
        }
        await dbConn.query(
          'DELETE FROM handel_przedmioty WHERE sesja_id=? AND gracz_id=? AND przedmiot_id=?',
          [sessionId, postacId, przedmiotId]
        );
        await emitUpdated(session);
      } catch (e) { logError('trade:212')(e); }
    });

    // ── trade_set_gold ────────────────────────────────────────────────────────
    socket.on('trade_set_gold', async ({ sessionId, amount }) => {
      try {
        const session = await getMySession();
        if (!session || session.id !== sessionId) return;
        const gold = Math.max(0, parseInt(amount) || 0);

        // Verify player has enough gold
        const [[postac]] = await dbConn.query('SELECT zloto FROM postac WHERE id=?', [postacId]);
        if (!postac || postac.zloto < gold) return socket.emit('trade_error', { message: 'Za mało złota' });

        if (session.gracz1_confirm || session.gracz2_confirm) {
          await dbConn.query('UPDATE handel_sesje SET gracz1_confirm=0, gracz2_confirm=0 WHERE id=?', [sessionId]);
        }

        const field = session.gracz1_id === postacId ? 'gracz1_gold' : 'gracz2_gold';
        await dbConn.query(`UPDATE handel_sesje SET ${field}=?, gracz1_confirm=0, gracz2_confirm=0 WHERE id=?`, [gold, sessionId]);

        const [[updated]] = await dbConn.query('SELECT * FROM handel_sesje WHERE id=?', [sessionId]);
        await emitUpdated(updated);
      } catch (e) { logError('trade:235')(e); }
    });

    // ── trade_confirm ─────────────────────────────────────────────────────────
    socket.on('trade_confirm', async ({ sessionId }) => {
      try {
        const session = await getMySession();
        if (!session || session.id !== sessionId) return;

        const field = session.gracz1_id === postacId ? 'gracz1_confirm' : 'gracz2_confirm';
        await dbConn.query(`UPDATE handel_sesje SET ${field}=1 WHERE id=?`, [sessionId]);

        io.to(`player_${session.gracz1_id}`).emit('trade_confirmed', { sessionId, who: postacId });
        io.to(`player_${session.gracz2_id}`).emit('trade_confirmed', { sessionId, who: postacId });

        // Reload session
        const [[fresh]] = await dbConn.query('SELECT * FROM handel_sesje WHERE id=?', [sessionId]);
        if (fresh.gracz1_confirm && fresh.gracz2_confirm) {
          // Obaj potwierdzili — wymiana w jednej transakcji (game/economy.js)
          const result = await executeTrade(dbConn, sessionId);
          if (result.alreadyDone) return; // drugie równoległe potwierdzenie — wymianę wykonało pierwsze
          if (result.ok) {
            io.to(`player_${fresh.gracz1_id}`).emit('trade_completed', { sessionId });
            io.to(`player_${fresh.gracz2_id}`).emit('trade_completed', { sessionId });
          } else {
            io.to(`player_${fresh.gracz1_id}`).emit('trade_cancelled', { sessionId, reason: result.reason });
            io.to(`player_${fresh.gracz2_id}`).emit('trade_cancelled', { sessionId, reason: result.reason });
          }
        } else {
          await emitUpdated(fresh);
        }
      } catch (e) {
        logError('trade:confirm')(e);
        socket.emit('trade_error', { message: 'Błąd serwera' });
      }
    });

    // ── trade_unconfirm ───────────────────────────────────────────────────────
    socket.on('trade_unconfirm', async ({ sessionId }) => {
      try {
        const session = await getMySession();
        if (!session || session.id !== sessionId) return;
        const field = session.gracz1_id === postacId ? 'gracz1_confirm' : 'gracz2_confirm';
        await dbConn.query(`UPDATE handel_sesje SET ${field}=0 WHERE id=?`, [sessionId]);
        const [[updated]] = await dbConn.query('SELECT * FROM handel_sesje WHERE id=?', [sessionId]);
        await emitUpdated(updated);
      } catch (e) { logError('trade:281')(e); }
    });

    // ── trade_cancel ──────────────────────────────────────────────────────────
    socket.on('trade_cancel', async ({ sessionId }) => {
      try {
        const [[session]] = await dbConn.query(
          "SELECT * FROM handel_sesje WHERE id=? AND (gracz1_id=? OR gracz2_id=?) AND status='aktywna'",
          [sessionId, postacId, postacId]
        );
        if (!session) return;
        await dbConn.query("UPDATE handel_sesje SET status='anulowana' WHERE id=?", [sessionId]);
        io.to(`player_${session.gracz1_id}`).emit('trade_cancelled', { sessionId, reason: 'Anulowano' });
        io.to(`player_${session.gracz2_id}`).emit('trade_cancelled', { sessionId, reason: 'Anulowano' });
      } catch (e) { logError('trade:295')(e); }
    });
  };
}

module.exports = router;
module.exports.registerTradeSocket = registerTradeSocket;
