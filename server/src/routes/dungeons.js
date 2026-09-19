const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireSession } = require('../middleware/auth');
const { serverError } = require('../game/log');

// Simple dungeon map generator
function generateDungeon(seed, sizeX, sizeY) {
  const rng = (s) => { let x = Math.sin(s) * 10000; return x - Math.floor(x); };
  const blockers = [];
  // Border walls
  for (let x = 0; x <= sizeX; x++) {
    blockers.push({ x, y: 0 });
    blockers.push({ x, y: sizeY });
  }
  for (let y = 1; y < sizeY; y++) {
    blockers.push({ x: 0, y });
    blockers.push({ x: sizeX, y });
  }
  // Random interior walls (avoid entrance and boss room)
  for (let x = 2; x < sizeX - 2; x++) {
    for (let y = 2; y < sizeY - 2; y++) {
      if (rng(seed + x * 100 + y) < 0.25 && !(x === 1 && y === 1) && !(x >= sizeX - 3 && y >= sizeY - 3)) {
        blockers.push({ x, y });
      }
    }
  }
  return blockers;
}

// POST /dungeons/create { szablon_id }
router.post('/create', requireSession, async (req, res) => {
  try {
    const { szablon_id } = req.body;
    const [[tmpl]] = await db.query('SELECT * FROM dungeony_szablony WHERE id=?', [szablon_id]);
    if (!tmpl) return res.json({ ok: false, error: 'Szablon nie istnieje' });

    const [[postac]] = await db.query('SELECT * FROM postac WHERE id=?', [req.session.postacId]);
    if (!postac) return res.json({ ok: false, error: 'Postać nie znaleziona' });
    if (postac.poziom < tmpl.min_poziom) return res.json({ ok: false, error: `Wymagany poziom ${tmpl.min_poziom}` });

    const seed = Math.floor(Math.random() * 999999);
    const sizeX = 20, sizeY = 20;

    // Create temporary map
    const [mapResult] = await db.query(
      'INSERT INTO mapa (nazwa, obrazek, maks_x, maks_y, pvp) VALUES (?,?,?,?,0)',
      [`[Dungeon] ${tmpl.nazwa}`, 'mapy/zniszcze-opactwo.2.png', sizeX, sizeY]
    );
    const mapaId = mapResult.insertId;

    // Add blockers
    const blockers = generateDungeon(seed, sizeX, sizeY);
    for (const b of blockers) {
      await db.query('INSERT IGNORE INTO blokadaprzejscia (mapa,x,y) VALUES (?,?,?)', [mapaId, b.x, b.y]);
    }

    // Add mobs scaled to player level
    const mobLevel = Math.min(500, postac.poziom + 3);
    const hp = 30 + mobLevel * 8;
    const mobPositions = [[5,5],[8,3],[12,8],[16,12],[4,14],[10,10],[6,17],[14,5],[3,8],[17,16]];
    for (const [mx, my] of mobPositions) {
      await db.query(
        'INSERT INTO mob (mapa,nazwa,obrazek,poziom,zycie,zycie_max,obr_min,obr_max,ac,sa,exp,respawn_time,x,y,szerokosc,dlugosc,respawn,sila,zrecznosc,intelekt) VALUES (?,?,?,?,?,?,?,?,?,80,?,999,?,?,24,32,0,1,1,1)',
        [mapaId, 'Strażnik Dungeonu', 'mob/goblin3.gif', mobLevel, hp, hp,
         Math.floor(mobLevel * 0.8), mobLevel * 2, Math.floor(mobLevel * 0.5), mobLevel * 15,
         mx, my]
      );
    }

    // Set expiry timestamp
    const koniec = new Date(Date.now() + tmpl.czas_limit_min * 60 * 1000);
    const [sesjaRes] = await db.query(
      'INSERT INTO dungeony_sesje (szablon_id, mapa_id, seed, status, data_koniec) VALUES (?,?,?,\'aktywna\',?)',
      [szablon_id, mapaId, seed, koniec]
    );
    const sesjaId = sesjaRes.insertId;

    // Add creator as participant + teleport
    await db.query('INSERT INTO dungeony_gracze (sesja_id, postac_id) VALUES (?,?)', [sesjaId, postac.id]);
    await db.query('UPDATE postac SET mapa=?,x=1,y=1 WHERE id=?', [mapaId, postac.id]);

    res.json({ ok: true, sesjaId, mapaId, expires: koniec });
  } catch (e) {
    res.json({ ok: false, error: serverError(e, 'dungeons') });
  }
});

// POST /dungeons/join/:sesjaId
router.post('/join/:sesjaId', requireSession, async (req, res) => {
  try {
    const [[sesja]] = await db.query("SELECT * FROM dungeony_sesje WHERE id=? AND status='aktywna'", [req.params.sesjaId]);
    if (!sesja) return res.json({ ok: false, error: 'Sesja nie istnieje lub wygasła' });
    await db.query('INSERT IGNORE INTO dungeony_gracze (sesja_id,postac_id) VALUES (?,?)', [sesja.id, req.session.postacId]);
    await db.query('UPDATE postac SET mapa=?,x=1,y=1 WHERE id=?', [sesja.mapa_id, req.session.postacId]);
    res.json({ ok: true, mapaId: sesja.mapa_id });
  } catch (e) {
    res.json({ ok: false, error: serverError(e, 'dungeons') });
  }
});

// POST /dungeons/complete/:sesjaId
router.post('/complete/:sesjaId', requireSession, async (req, res) => {
  try {
    const [[sesja]] = await db.query('SELECT * FROM dungeony_sesje WHERE id=? AND status=\'aktywna\'', [req.params.sesjaId]);
    if (!sesja) return res.json({ ok: false, error: 'Sesja nie istnieje' });
    const [[tmpl]] = await db.query('SELECT * FROM dungeony_szablony WHERE id=?', [sesja.szablon_id]);
    const [players] = await db.query('SELECT postac_id FROM dungeony_gracze WHERE sesja_id=?', [sesja.id]);

    if (players.length < (tmpl?.min_graczy || 1)) return res.json({ ok: false, error: 'Za mało graczy' });

    const expReward = tmpl?.nagroda_exp_base || 500;
    const goldReward = tmpl?.nagroda_gold_base || 200;

    for (const p of players) {
      await db.query('UPDATE postac SET exp=exp+?, zloto=zloto+?, mapa=1, x=31, y=47 WHERE id=?',
        [expReward, goldReward, p.postac_id]);
    }

    await db.query("UPDATE dungeony_sesje SET status='zakonczona', ukonczone=1, data_koniec=NOW() WHERE id=?", [sesja.id]);

    // Clean up temporary map
    await db.query('DELETE FROM blokadaprzejscia WHERE mapa=?', [sesja.mapa_id]);
    await db.query('DELETE FROM mob WHERE mapa=?', [sesja.mapa_id]);
    await db.query('DELETE FROM mapa WHERE id=?', [sesja.mapa_id]);

    res.json({ ok: true, expReward, goldReward, players: players.length });
  } catch (e) {
    res.json({ ok: false, error: serverError(e, 'dungeons') });
  }
});

// POST /dungeons/leave
router.post('/leave', requireSession, async (req, res) => {
  try {
    const [[player]] = await db.query('SELECT mapa FROM postac WHERE id=?', [req.session.postacId]);
    if (player) {
      const [[sesja]] = await db.query('SELECT * FROM dungeony_sesje WHERE mapa_id=? AND status=\'aktywna\'', [player.mapa]);
      if (sesja) {
        await db.query('DELETE FROM dungeony_gracze WHERE sesja_id=? AND postac_id=?', [sesja.id, req.session.postacId]);
      }
    }
    await db.query('UPDATE postac SET mapa=1, x=31, y=47 WHERE id=?', [req.session.postacId]);
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false, error: serverError(e, 'dungeons') });
  }
});

// GET /dungeons/list — available templates
router.get('/list', async (req, res) => {
  try {
    const [tmpl] = await db.query('SELECT * FROM dungeony_szablony ORDER BY min_poziom');
    res.json(tmpl);
  } catch (e) {
    res.json([]);
  }
});

// GET /dungeons/active — my current dungeon session
router.get('/active', requireSession, async (req, res) => {
  try {
    const [[postac]] = await db.query('SELECT mapa FROM postac WHERE id=?', [req.session.postacId]);
    if (!postac) return res.json(null);
    const [[sesja]] = await db.query(
      'SELECT ds.*, dt.nazwa as tmpl_nazwa, dt.czas_limit_min FROM dungeony_sesje ds JOIN dungeony_szablony dt ON dt.id=ds.szablon_id WHERE ds.mapa_id=? AND ds.status=\'aktywna\'',
      [postac.mapa]
    );
    if (!sesja) return res.json(null);
    const [[playerCount]] = await db.query('SELECT COUNT(*) as c FROM dungeony_gracze WHERE sesja_id=?', [sesja.id]);
    const [[mobCount]] = await db.query('SELECT COUNT(*) as c FROM mob WHERE mapa=? AND zycie>0', [sesja.mapa_id]);
    res.json({ ...sesja, playerCount: playerCount?.c || 0, mobsAlive: mobCount?.c || 0 });
  } catch (e) {
    res.json(null);
  }
});

module.exports = router;
