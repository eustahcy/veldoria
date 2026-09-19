const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireSession } = require('../middleware/auth');

// GET /api/talents/tree
router.get('/tree', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[postac]] = await db.query('SELECT profesja, punkty_talentow FROM postac WHERE id=?', [postacId]);
    const klasa = postac.profesja; // talenty są przypisane do profesji

    const [talents] = await db.query(
      'SELECT * FROM talenty WHERE klasa=? ORDER BY sciezka, pozycja',
      [klasa]
    );
    const [myTalents] = await db.query(
      'SELECT talent_id, poziom FROM postac_talenty WHERE postac_id=?',
      [postacId]
    );
    const myMap = {};
    for (const mt of myTalents) myMap[mt.talent_id] = mt.poziom;

    // Count points per path
    const pathPoints = {};
    for (const t of talents) {
      const myLvl = myMap[t.id] || 0;
      if (!pathPoints[t.sciezka]) pathPoints[t.sciezka] = 0;
      pathPoints[t.sciezka] += myLvl;
    }

    // Group by path
    const pathsMap = {};
    for (const t of talents) {
      if (!pathsMap[t.sciezka]) pathsMap[t.sciezka] = [];
      const myLevel = myMap[t.id] || 0;
      const prereqOk = !t.wymaga_talent_id || (myMap[t.wymaga_talent_id] || 0) > 0;
      const pathOk = (pathPoints[t.sciezka] || 0) >= t.wymaga_sciezka_punkty;
      const available = prereqOk && pathOk && myLevel < t.max_poziom && (postac.punkty_talentow || 0) > 0;
      pathsMap[t.sciezka].push({ ...t, myLevel, available });
    }

    const paths = Object.entries(pathsMap).map(([name, talents]) => ({ name, talents }));
    res.json({ paths, punkty_dostepne: postac.punkty_talentow || 0, klasa });
  } catch(e) { next(e); }
});

// POST /api/talents/invest
router.post('/invest', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const { talent_id } = req.body;

    const [[postac]] = await db.query('SELECT profesja, punkty_talentow FROM postac WHERE id=?', [postacId]);
    if ((postac.punkty_talentow || 0) <= 0)
      return res.json({ ok: false, error: 'Brak punktów talentów' });

    const klasa = postac.profesja; // talenty są przypisane do profesji
    const [[talent]] = await db.query('SELECT * FROM talenty WHERE id=? AND klasa=?', [talent_id, klasa]);
    if (!talent) return res.json({ ok: false, error: 'Talent nie istnieje lub nie dla twojej klasy' });

    const [[myT]] = await db.query(
      'SELECT poziom FROM postac_talenty WHERE postac_id=? AND talent_id=?',
      [postacId, talent_id]
    );
    const myLevel = myT?.poziom || 0;
    if (myLevel >= talent.max_poziom) return res.json({ ok: false, error: 'Talent na max poziomie' });

    // Check prerequisite
    if (talent.wymaga_talent_id) {
      const [[prereq]] = await db.query(
        'SELECT poziom FROM postac_talenty WHERE postac_id=? AND talent_id=?',
        [postacId, talent.wymaga_talent_id]
      );
      if (!prereq || prereq.poziom <= 0)
        return res.json({ ok: false, error: 'Wymagany poprzedni talent w ścieżce' });
    }

    // Check path points
    if (talent.wymaga_sciezka_punkty > 0) {
      const [pathTalents] = await db.query(
        'SELECT id FROM talenty WHERE klasa=? AND sciezka=?',
        [klasa, talent.sciezka]
      );
      const pathIds = pathTalents.map(t => t.id);
      let pathPts = 0;
      if (pathIds.length) {
        const [invested] = await db.query(
          `SELECT SUM(poziom) as total FROM postac_talenty WHERE postac_id=? AND talent_id IN (${pathIds.map(()=>'?').join(',')})`,
          [postacId, ...pathIds]
        );
        pathPts = invested[0]?.total || 0;
      }
      if (pathPts < talent.wymaga_sciezka_punkty)
        return res.json({ ok: false, error: `Potrzeba ${talent.wymaga_sciezka_punkty} punktów w ścieżce` });
    }

    await db.query(
      'INSERT INTO postac_talenty (postac_id, talent_id, poziom) VALUES (?,?,1) ON DUPLICATE KEY UPDATE poziom=poziom+1',
      [postacId, talent_id]
    );
    await db.query('UPDATE postac SET punkty_talentow=punkty_talentow-1 WHERE id=?', [postacId]);

    res.json({ ok: true, msg: `Zainwestowano punkt w: ${talent.nazwa}` });
  } catch(e) { next(e); }
});

// POST /api/talents/reset — reset all talents
router.post('/reset', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[postac]] = await db.query('SELECT zloto, prestige, punkty_talentow FROM postac WHERE id=?', [postacId]);

    const cost = 500 + 500 * (postac.prestige || 0);
    if ((postac.zloto || 0) < cost)
      return res.json({ ok: false, error: `Potrzebujesz ${cost} złota` });

    // Count invested points
    const [[sumRow]] = await db.query(
      'SELECT COALESCE(SUM(poziom),0) as total FROM postac_talenty WHERE postac_id=?',
      [postacId]
    );
    const invested = sumRow.total || 0;

    await db.query('DELETE FROM postac_talenty WHERE postac_id=?', [postacId]);
    await db.query(
      'UPDATE postac SET zloto=zloto-?, punkty_talentow=punkty_talentow+? WHERE id=?',
      [cost, invested, postacId]
    );

    res.json({ ok: true, returned: invested, cost, msg: `Zresetowano talenty. Zwrócono ${invested} punktów.` });
  } catch(e) { next(e); }
});

// GET /api/talents/available-points
router.get('/available-points', requireSession, async (req, res, next) => {
  try {
    const [[postac]] = await db.query('SELECT punkty_talentow FROM postac WHERE id=?', [req.session.postacId]);
    res.json({ punkty: postac?.punkty_talentow || 0 });
  } catch(e) { next(e); }
});

module.exports = router;
