const express  = require('express');
const router   = express.Router();
const db       = require('../db');
const { requireSession } = require('../middleware/auth');
const { logError, serverError } = require('../game/log');
const { getAvailable }   = require('../game/skills');
const { computeStats }   = require('../game/stats');

// Definicje outfitów per klasa — odblokowania na poziomach
const OUTFIT_DEFS = {
  Wojownik:         [
    { id:'w1', label:'Wojownik',      sprite:'avatar/m_bd28.gif', minLevel:0   },
    { id:'w2', label:'Weteran',       sprite:'avatar/m_bd06.gif', minLevel:20  },
  ],
  Paladyn:          [
    { id:'p1', label:'Paladyn',       sprite:'avatar/m_pal21.gif', minLevel:0  },
    { id:'p2', label:'Święty Rycerz', sprite:'avatar/m_pal24.gif', minLevel:20 },
  ],
  'Tancerz Ostrzy': [
    { id:'t1', label:'Tancerz Ostrzy',sprite:'avatar/m_bd06.gif', minLevel:0  },
    { id:'t2', label:'Mistrz Ostrzy', sprite:'avatar/m_bd28.gif', minLevel:20 },
  ],
  Lowca:            [
    { id:'l1', label:'Łowca',         sprite:'avatar/m_lowca08.gif', minLevel:0  },
    { id:'l2', label:'Tropiciela Cień',sprite:'avatar/m_lowce05.gif', minLevel:20 },
  ],
  Tropiciel:        [
    { id:'tr1', label:'Tropiciel',    sprite:'avatar/m_tr17.gif', minLevel:0  },
    { id:'tr2', label:'Wędrowiec',    sprite:'avatar/m_tr17.gif', minLevel:20 },
  ],
  Mag:              [
    { id:'m1', label:'Mag',           sprite:'avatar/m_magmrozu.gif', minLevel:0   },
    { id:'m2', label:'Arcymag',       sprite:'avatar/m_magmrozu.gif', minLevel:20  },
  ],
};

// POST /api/character/heal — heal to effective max HP (with equipment bonuses)
router.post('/heal', requireSession, async (req, res) => {
  try {
    const [[rawPostac]] = await db.query('SELECT * FROM postac WHERE id = ?', [req.session.postacId]);
    const computed = await computeStats(db, rawPostac);
    const effectiveMax = computed.zycie_max;
    await db.query('UPDATE postac SET zycie=? WHERE id=?', [effectiveMax, rawPostac.id]);
    res.json({ ok: true, zycie: effectiveMax });
  } catch(e) {
    res.json({ ok: false, error: serverError(e, 'character') });
  }
});

// POST /api/character/assign-stat — spend a free stat point on sila/zrecznosc/intelekt
router.post('/assign-stat', requireSession, async (req, res) => {
  try {
    const { stat } = req.body;
    if (!['sila', 'zrecznosc', 'intelekt'].includes(stat))
      return res.json({ ok: false, error: 'Nieprawidłowy atrybut' });
    const [[postac]] = await db.query(
      'SELECT wolne_punkty_stat, sila, zrecznosc, intelekt FROM postac WHERE id=?',
      [req.session.postacId]
    );
    if (!postac || (postac.wolne_punkty_stat || 0) <= 0)
      return res.json({ ok: false, error: 'Brak wolnych punktów statystyk' });
    await db.query(
      `UPDATE postac SET wolne_punkty_stat=wolne_punkty_stat-1, ${stat}=${stat}+1 WHERE id=?`,
      [req.session.postacId]
    );
    res.json({ ok: true, [stat]: postac[stat] + 1, wolne_punkty_stat: (postac.wolne_punkty_stat || 0) - 1 });
  } catch (e) { res.status(500).json({ error: serverError(e, 'character') }); }
});

// POST /api/character/pvp-toggle — toggle PvP mode
router.post('/pvp-toggle', requireSession, async (req, res) => {
  const [[postac]] = await db.query('SELECT pvp FROM postac WHERE id = ?', [req.session.postacId]);
  const newPvp = postac.pvp ? 0 : 1;
  await db.query('UPDATE postac SET pvp = ? WHERE id = ?', [newPvp, req.session.postacId]);
  res.json({ ok: true, pvp: newPvp });
});

// GET /api/character/outfits — available outfits for this character
router.get('/outfits', requireSession, async (req, res) => {
  const [[postac]] = await db.query('SELECT profesja, poziom, obrazek FROM postac WHERE id=?', [req.session.postacId]);
  const all = OUTFIT_DEFS[postac.profesja] || [];
  const available = all.filter(o => postac.poziom >= o.minLevel).map(o => ({
    ...o,
    current: postac.obrazek === o.sprite,
  }));
  const locked = all.filter(o => postac.poziom < o.minLevel);
  // If current sprite doesn't appear in available outfits, prepend it as custom entry
  const anyAvailableMatch = available.some(o => postac.obrazek === o.sprite);
  if (!anyAvailableMatch && postac.obrazek) {
    available.unshift({ id: '_custom', label: 'Skórka admina', sprite: postac.obrazek, minLevel: 0, current: true });
  }
  res.json({ outfits: available, locked });
});

// POST /api/character/outfit — change outfit
router.post('/outfit', requireSession, async (req, res) => {
  const { outfitId } = req.body;
  const [[postac]] = await db.query('SELECT profesja, poziom, obrazek FROM postac WHERE id=?', [req.session.postacId]);
  if (outfitId === '_custom') return res.json({ ok:true, sprite: postac.obrazek });
  const all = OUTFIT_DEFS[postac.profesja] || [];
  const outfit = all.find(o => o.id === outfitId);
  if (!outfit) return res.json({ ok:false, error:'Nieznany outfit' });
  if (postac.poziom < outfit.minLevel) return res.json({ ok:false, error:`Wymagany poziom ${outfit.minLevel}` });
  await db.query('UPDATE postac SET obrazek=? WHERE id=?', [outfit.sprite, req.session.postacId]);
  res.json({ ok:true, sprite: outfit.sprite });
});

// GET /api/character/skills — get character skills (static definitions + level check)
router.get('/skills', requireSession, async (req, res) => {
  const [[postac]] = await db.query('SELECT profesja, poziom, um FROM postac WHERE id = ?', [req.session.postacId]);
  const available = getAvailable(postac.profesja, postac.poziom);
  res.json({ skills: available, skillPoints: postac.um, profesja: postac.profesja, poziom: postac.poziom });
});

// POST /api/character/learn-skill
router.post('/learn-skill', requireSession, async (req, res) => {
  const { skillId } = req.body;
  const [[postac]] = await db.query('SELECT * FROM postac WHERE id = ?', [req.session.postacId]);
  if (postac.um <= 0) return res.json({ ok: false, error: 'Brak punktów umiejętności' });

  const [[skill]] = await db.query('SELECT * FROM umiejetnosci WHERE id = ?', [skillId]);
  if (!skill) return res.json({ ok: false, error: 'Brak umiejętności' });
  if (postac.poziom < skill.wym_poziom) return res.json({ ok: false, error: 'Za niski poziom' });

  await db.query('UPDATE postac SET um = um - 1 WHERE id = ?', [postac.id]);
  res.json({ ok: true });
});

// ── Titles system ─────────────────────────────────────────────────────────────

// GET /api/character/titles
router.get('/titles', requireSession, async (req, res) => {
  try {
    const postacId = req.session.postacId;
    const [allTitles] = await db.query('SELECT * FROM tytuly ORDER BY id');
    const [owned] = await db.query(
      'SELECT tytul_id, data FROM postac_tytuly WHERE postac_id=?',
      [postacId]
    );
    const [[postac]] = await db.query('SELECT aktywny_tytul FROM postac WHERE id=?', [postacId]);
    const ownedSet = new Set(owned.map(o => o.tytul_id));
    const ownedDates = Object.fromEntries(owned.map(o => [o.tytul_id, o.data]));
    const result = allTitles.map(t => ({
      ...t,
      unlocked: ownedSet.has(t.id),
      data_odblokowania: ownedDates[t.id] || null,
      aktywny: postac?.aktywny_tytul === t.id,
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ error: serverError(e, 'character') }); }
});

// POST /api/character/titles/:id/equip
router.post('/titles/:id/equip', requireSession, async (req, res) => {
  try {
    const postacId = req.session.postacId;
    const titleId  = Number(req.params.id);
    // Verify ownership
    const [[owned]] = await db.query(
      'SELECT tytul_id FROM postac_tytuly WHERE postac_id=? AND tytul_id=?',
      [postacId, titleId]
    );
    if (!owned) return res.json({ ok: false, error: 'Nie posiadasz tego tytułu' });
    await db.query('UPDATE postac SET aktywny_tytul=? WHERE id=?', [titleId, postacId]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: serverError(e, 'character') }); }
});

// POST /api/character/titles/unequip
router.post('/titles/unequip', requireSession, async (req, res) => {
  try {
    await db.query('UPDATE postac SET aktywny_tytul=NULL WHERE id=?', [req.session.postacId]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: serverError(e, 'character') }); }
});

// Exported helper: grant title by klucz
async function grantTitle(dbConn, postacId, klucz) {
  try {
    const [[tytul]] = await dbConn.query('SELECT id FROM tytuly WHERE klucz=?', [klucz]);
    if (!tytul) return null;
    await dbConn.query(
      'INSERT IGNORE INTO postac_tytuly (postac_id, tytul_id) VALUES (?,?)',
      [postacId, tytul.id]
    );
    return tytul;
  } catch (_) { return null; }
}
module.exports.grantTitle = grantTitle;

// GET /api/character/friends
router.get('/friends', requireSession, async (req, res) => {
  const [friends] = await db.query(
    `SELECT p.id, p.nazwa, p.poziom, p.profesja, p.zalogowany, p.obrazek
     FROM przyjaciele f JOIN postac p ON f.przyjaciel_id = p.id
     WHERE f.postac_id = ?`,
    [req.session.postacId]
  );
  res.json(friends);
});

// ── Prestige system ───────────────────────────────────────────────────────────

// GET /api/character/prestige-info
router.get('/prestige-info', requireSession, async (req, res) => {
  try {
    const [[postac]] = await db.query(
      'SELECT poziom, prestige, prestige_bonus_pct FROM postac WHERE id=?',
      [req.session.postacId]
    );
    if (!postac) return res.status(404).json({ error: 'Brak postaci' });
    res.json({
      moze: postac.poziom >= 100,
      poziom: postac.poziom,
      prestige_aktualny: postac.prestige || 0,
      bonus_po: Math.min(50, (postac.prestige_bonus_pct || 0) + 5),
      zachowuje: ['złoto 50%', 'wyposażone przedmioty', 'tytuły', 'osiągnięcia', 'gildia'],
      traci: ['poziom → 1', 'exp', 'plecak (niezałożone)', 'złoto 50%', 'punkty talentów'],
    });
  } catch (e) { res.status(500).json({ error: serverError(e, 'character') }); }
});

// POST /api/character/prestige
router.post('/prestige', requireSession, async (req, res) => {
  try {
    const postacId = req.session.postacId;
    const [[postac]] = await db.query('SELECT * FROM postac WHERE id=?', [postacId]);
    if (!postac) return res.json({ ok: false, error: 'Brak postaci' });
    if (postac.poziom < 100) return res.json({ ok: false, error: 'Wymagany poziom 100' });

    const goldKeep   = Math.floor((postac.zloto || 0) * 0.5);
    const newPrestige = (postac.prestige || 0) + 1;
    const newBonusPct = Math.min(50, (postac.prestige_bonus_pct || 0) + 5);

    // Delete unequipped items
    await db.query('DELETE FROM przedmiot_postac WHERE postac=? AND zalozony=0', [postacId]);
    // Reset character
    await db.query(
      `UPDATE postac SET poziom=1, exp=0, zycie=zycie_max, zloto=?, prestige=?, prestige_bonus_pct=?, punkty_talentow=0 WHERE id=?`,
      [goldKeep, newPrestige, newBonusPct, postacId]
    ).catch(async () => {
      // punkty_talentow may not exist yet
      await db.query(
        'UPDATE postac SET poziom=1, exp=0, zycie=zycie_max, zloto=?, prestige=?, prestige_bonus_pct=? WHERE id=?',
        [goldKeep, newPrestige, newBonusPct, postacId]
      );
    });

    // Grant prestige titles
    const { grantTitle } = module.exports;
    if (newPrestige === 1) await grantTitle(db, postacId, 'pierwsze_prestige');

    // Log
    await db.query(
      'INSERT INTO prestige_log (postac_id, stary_poziom, prestige_numer) VALUES (?,?,?)',
      [postacId, postac.poziom, newPrestige]
    ).catch(logError('character:257'));

    res.json({ ok: true, prestige: newPrestige, bonus_pct: newBonusPct, zloto: goldKeep });
  } catch (e) { res.status(500).json({ error: serverError(e, 'character') }); }
});

// In-memory PvP history (last 100 fights, cleared on server restart)
const pvpHistory = [];

function recordPvpFight(attacker, defender, winner, loser) {
  pvpHistory.unshift({
    id: Date.now(),
    attackerName: attacker.nazwa, attackerLevel: attacker.poziom,
    defenderName: defender.nazwa, defenderLevel: defender.poziom,
    winnerName: winner, loserName: loser,
    timestamp: new Date().toISOString(),
  });
  if (pvpHistory.length > 100) pvpHistory.pop();
}

// GET /api/character/pvp-history
router.get('/pvp-history', requireSession, async (req, res) => {
  res.json(pvpHistory.slice(0, 50));
});

module.exports.recordPvpFight = recordPvpFight;

const _grantTitle = module.exports.grantTitle;
module.exports = router;
module.exports.recordPvpFight = recordPvpFight;
module.exports.grantTitle = _grantTitle;
