const express = require('express');
const { logError } = require('../game/log');
const router = express.Router();
const db = require('../db');
const { requireSession } = require('../middleware/auth');
const { computeStats } = require('../game/stats');
const { createLimiter } = require('../middleware/rateLimiter');
const mapCache = require('../game/mapCache');
const worldCycle = require('../game/worldCycle');
const { parseTiles } = require('../game/tiles');

const moveLimit = createLimiter(20, 1000); // max 20 moves/s

// GET /api/game/state — full world state for current player
router.get('/state', requireSession, async (req, res, next) => {
  try {
    const now = Math.floor(Date.now() / 1000);

    const [[rawPostac]] = await db.query('SELECT * FROM postac WHERE id = ?', [req.session.postacId]);
    if (!rawPostac) return res.status(404).json({ error: 'Nie znaleziono postaci' });
    if (!rawPostac.zalogowany) return res.status(401).json({ error: 'Sesja wygasła' });

    const [[guildRow]] = await db.query(
      'SELECT g.tag FROM gildia_czlonkowie gm JOIN gilde g ON g.id = gm.gildia_id WHERE gm.postac_id = ?',
      [rawPostac.id]
    );
    rawPostac.gildia_tag = guildRow?.tag || null;

    const postac = await computeStats(db, rawPostac);

    // Use cache for static map data
    const mapa     = await mapCache.getMap(db, postac.mapa);
    const npcs     = await mapCache.get(db, postac.mapa, 'npc');
    const portals  = await mapCache.get(db, postac.mapa, 'mapa_przenies', 'id,mapa,x,y,do_mapa,do_x,do_y');
    const blockers = await mapCache.get(db, postac.mapa, 'blokadaprzejscia', 'x,y');

    // Mobs and players always fresh (they move/change)
    await db.query('UPDATE mob SET zycie = zycie_max WHERE zycie <= 0 AND respawn <= ?', [now]);
    const [mobs]    = await db.query('SELECT * FROM mob WHERE mapa = ? AND respawn <= ?', [postac.mapa, now]);
    const [players] = await db.query(
      `SELECT p.id, p.nazwa, p.x, p.y, p.obrazek, p.poziom, p.profesja, p.ranga, p.prestige,
              g.tag AS gildia_tag, t.nazwa AS tytul_nazwa, t.ikona AS tytul_ikona
       FROM postac p
       LEFT JOIN gildia_czlonkowie gm ON gm.postac_id = p.id
       LEFT JOIN gilde g ON g.id = gm.gildia_id
       LEFT JOIN tytuly t ON t.id = p.aktywny_tytul
       WHERE p.mapa = ? AND p.zalogowany = 1 AND p.id != ?`,
      [postac.mapa, postac.id]
    ).catch(async () => {
      // Fallback if tytuly table not yet visible
      const [rows] = await db.query(
        `SELECT p.id, p.nazwa, p.x, p.y, p.obrazek, p.poziom, p.profesja, p.ranga, p.prestige, g.tag AS gildia_tag
         FROM postac p
         LEFT JOIN gildia_czlonkowie gm ON gm.postac_id = p.id
         LEFT JOIN gilde g ON g.id = gm.gildia_id
         WHERE p.mapa = ? AND p.zalogowany = 1 AND p.id != ?`,
        [postac.mapa, postac.id]
      );
      return [rows];
    });

    // Get active title for hero
    let tytulNazwa = null, tytulIkona = null;
    try {
      if (rawPostac.aktywny_tytul) {
        const [[t]] = await db.query('SELECT nazwa, ikona FROM tytuly WHERE id=?', [rawPostac.aktywny_tytul]);
        tytulNazwa = t?.nazwa || null;
        tytulIkona = t?.ikona || null;
      }
    } catch (e) { logError('game:69')(e); }

    const { haslo: _h, equippedItems: _eq, ...safePostac } = postac;
    // kafle izometryczne bywają duże — klient pobiera je osobno (/game/tiles) i trzyma w pamięci
    const { kafle: _k, ...safeMapa } = mapa;
    res.json({
      postac: { ...safePostac, tytul_nazwa: tytulNazwa, tytul_ikona: tytulIkona },
      mapa: safeMapa, mobs, npcs, portals, blockers, players,
      worldState: worldCycle.getState(),
    });
  } catch (e) { next(e); }
});

// POST /api/game/move
router.post('/move', requireSession, moveLimit, async (req, res, next) => {
  try {
    const { direction } = req.body;
    const [[postac]] = await db.query('SELECT * FROM postac WHERE id = ?', [req.session.postacId]);
    if (!postac || !postac.zalogowany || postac.zycie <= 0) return res.json({ ok: false });

    const [[mapa]] = await db.query('SELECT * FROM mapa WHERE id = ?', [postac.mapa]);
    const now = Math.floor(Date.now() / 1000);

    const dirs = {
      lewo: { dx: -1, dy: 0 },
      prawo: { dx: 1, dy: 0 },
      gora: { dx: 0, dy: -1 },
      dol: { dx: 0, dy: 1 },
    };

    const d = dirs[direction];
    if (!d) return res.json({ ok: false });

    const nx = postac.x + d.dx;
    const ny = postac.y + d.dy;

    if (nx < 0 || ny < 0 || nx > mapa.maks_x || ny > mapa.maks_y)
      return res.json({ ok: false, reason: 'granica' });

    const [[blocked]] = await db.query(
      'SELECT mapa FROM blokadaprzejscia WHERE mapa = ? AND x = ? AND y = ? LIMIT 1',
      [postac.mapa, nx, ny]
    );
    if (blocked) return res.json({ ok: false, reason: 'blokada' });

    const [[npcBlock]] = await db.query(
      'SELECT id FROM npc WHERE mapa = ? AND x = ? AND y = ? LIMIT 1',
      [postac.mapa, nx, ny]
    );
    if (npcBlock) return res.json({ ok: false, reason: 'npc' });

    const [[mobBlock]] = await db.query(
      'SELECT id FROM mob WHERE mapa = ? AND x = ? AND y = ? AND respawn <= ? LIMIT 1',
      [postac.mapa, nx, ny, now]
    );
    if (mobBlock) return res.json({ ok: false, reason: 'mob' });

    await db.query('UPDATE postac SET x = ?, y = ? WHERE id = ?', [nx, ny, postac.id]);

    // Check location quests
    try {
      const [locQuests] = await db.query(
        `SELECT pq.quest_id, q.cel_id, q.cel_wartosc, q.cel_ilosc, q.nazwa
         FROM postac_questy pq JOIN questy q ON pq.quest_id=q.id
         WHERE pq.postac_id=? AND pq.status='aktywny' AND q.typ='location'
           AND pq.postep=0 AND q.cel_id=?`,
        [postac.id, postac.mapa]
      );
      for (const lq of locQuests) {
        const [tx, ty] = (lq.cel_wartosc||'').split(',').map(Number);
        if (nx === tx && ny === ty) {
          await db.query(
            'UPDATE postac_questy SET postep=1 WHERE postac_id=? AND quest_id=?',
            [postac.id, lq.quest_id]
          );
        }
      }
    } catch (e) { logError('game:144')(e); }

    // Check hidden quests triggered by location
    try {
      const [hiddenLoc] = await db.query(
        "SELECT * FROM questy WHERE ukryty=1 AND wyzwalacz='location' AND aktywny=1",
      );
      for (const hq of hiddenLoc) {
        try {
          const warunek = JSON.parse(hq.ukryty_warunek || '{}');
          if (warunek.mapa == postac.mapa && warunek.x == nx && warunek.y == ny) {
            const [[existing]] = await db.query('SELECT id FROM postac_questy WHERE postac_id=? AND quest_id=?', [postac.id, hq.id]);
            if (!existing) {
              await db.query('INSERT INTO postac_questy (postac_id,quest_id,postep,status,data_przyjecia) VALUES (?,?,0,"aktywny",NOW())', [postac.id, hq.id]);
            }
          }
        } catch (e) { logError('game:160')(e); }
      }
    } catch (e) { logError('game:162')(e); }

    const [[teleport]] = await db.query(
      'SELECT * FROM mapa_przenies WHERE mapa = ? AND x = ? AND y = ? LIMIT 1',
      [postac.mapa, nx, ny]
    );
    if (teleport) {
      await db.query('UPDATE postac SET mapa = ?, x = ?, y = ? WHERE id = ?', [
        teleport.do_mapa, teleport.do_x, teleport.do_y, postac.id,
      ]);
      return res.json({ ok: true, teleported: true, newMap: teleport.do_mapa });
    }

    res.json({ ok: true, x: nx, y: ny });
  } catch (e) { next(e); }
});

// GET /api/game/tiles/:mapaId — kafle izometryczne mapy (pobierane raz na wejście na mapę)
router.get('/tiles/:mapaId', requireSession, async (req, res, next) => {
  try {
    const mapa = await mapCache.getMap(db, Number(req.params.mapaId));
    if (!mapa) return res.status(404).json({ error: 'Mapa nie istnieje' });
    res.json({
      mapa_id: mapa.id, iso: mapa.iso || 0,
      maks_x: mapa.maks_x, maks_y: mapa.maks_y,
      kafle: parseTiles(mapa.kafle),
    });
  } catch (e) { next(e); }
});

// GET /api/game/world-state
router.get('/world-state', (req, res) => {
  res.json(worldCycle.getState());
});

// GET /api/game/map-list
router.get('/map-list', async (req, res, next) => {
  try {
    const [maps] = await db.query('SELECT id, nazwa FROM mapa ORDER BY id');
    res.json(maps);
  } catch (e) { next(e); }
});

module.exports = router;
