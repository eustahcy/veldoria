const express = require('express');
const { logError } = require('../game/log');
const router  = express.Router();
const db      = require('../db');
const { requireSession } = require('../middleware/auth');
const { giveItem } = require('../game/inventory');

// ── Auto-create tables on first load ─────────────────────────────────────────
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS questy (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nazwa VARCHAR(150) NOT NULL,
        opis TEXT,
        typ ENUM('kill','location','item','level','chain') NOT NULL DEFAULT 'kill',
        cel_id INT DEFAULT 0,
        cel_wartosc VARCHAR(100) DEFAULT '',
        cel_ilosc INT DEFAULT 1,
        nagroda_exp INT DEFAULT 0,
        nagroda_zloto INT DEFAULT 0,
        nagroda_item_id INT DEFAULT 0,
        wymagany_poziom INT DEFAULT 1,
        wymagany_quest_id INT DEFAULT 0,
        npc_start_id INT DEFAULT 0,
        npc_end_id INT DEFAULT 0,
        tekst_start TEXT,
        tekst_w_trakcie TEXT,
        tekst_koniec TEXT,
        aktywny TINYINT(1) DEFAULT 1
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS postac_questy (
        id INT AUTO_INCREMENT PRIMARY KEY,
        postac_id INT NOT NULL,
        quest_id INT NOT NULL,
        postep INT DEFAULT 0,
        status ENUM('aktywny','ukonczone','oddane') DEFAULT 'aktywny',
        data_przyj TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_ukon TIMESTAMP NULL,
        UNIQUE KEY uq_postac_quest (postac_id, quest_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci
    `);
  } catch(e) {
    console.error('Quest tables init error:', e.message);
  }
})();

// ── Helpers ───────────────────────────────────────────────────────────────────
async function requireAdmin(req, res, next) {
  const id = req.session.postacId || req.session.adminPostacId;
  if (!id) return res.status(401).json({ error: 'Nie zalogowany' });
  const [[p]] = await db.query('SELECT ranga FROM postac WHERE id=?', [id]);
  if (!p || (p.ranga !== 'GameAdmin' && p.ranga !== 'GameMaster'))
    return res.status(403).json({ error: 'Brak uprawnień' });
  next();
}

// Check if quest requirements are met for a character
async function canAccept(postacId, quest) {
  if (!quest.aktywny) return false;
  const [[postac]] = await db.query('SELECT poziom FROM postac WHERE id=?', [postacId]);
  if (!postac || postac.poziom < quest.wymagany_poziom) return false;
  if (quest.wymagany_quest_id > 0) {
    const [[prereq]] = await db.query(
      "SELECT id FROM postac_questy WHERE postac_id=? AND quest_id=? AND status='oddane'",
      [postacId, quest.wymagany_quest_id]
    );
    if (!prereq) return false;
  }
  // Chain order check
  if (quest.lancuch_id > 0 && quest.kolejnosc > 1) {
    const [[prevQuest]] = await db.query(
      'SELECT id FROM questy WHERE lancuch_id=? AND kolejnosc=?',
      [quest.lancuch_id, quest.kolejnosc - 1]
    );
    if (prevQuest) {
      const [[prevDone]] = await db.query(
        "SELECT id FROM postac_questy WHERE postac_id=? AND quest_id=? AND status='oddane'",
        [postacId, prevQuest.id]
      );
      if (!prevDone) return false;
    }
  }
  // Not already active or completed
  const [[existing]] = await db.query(
    'SELECT status FROM postac_questy WHERE postac_id=? AND quest_id=?',
    [postacId, quest.id]
  );
  // For daily/weekly quests allow re-accept if old completed row exists
  if (existing && (quest.reset_typ === 'dziennie' || quest.reset_typ === 'tygodniowo')) {
    return existing.status === 'oddane'; // can re-accept completed ones
  }
  return !existing;
}

// Check quest completion criteria
async function checkCompletion(postacId, pq, quest) {
  if (pq.status !== 'aktywny') return false;
  switch (quest.typ) {
    case 'kill':
    case 'item':
      return pq.postep >= quest.cel_ilosc;
    case 'level': {
      const [[p]] = await db.query('SELECT poziom FROM postac WHERE id=?', [postacId]);
      return p && p.poziom >= quest.cel_id;
    }
    case 'location':
    case 'chain':
      return pq.postep >= 1;
    default:
      return false;
  }
}

// ── Achievement checker ───────────────────────────────────────────────────────
async function checkAchievements(db, postacId) {
  const newlyUnlocked = [];
  try {
    // Get all achievements not yet unlocked by this character
    const [allAch] = await db.query(
      `SELECT o.* FROM osiagniecia o
       WHERE o.id NOT IN (
         SELECT osiagniecie_id FROM postac_osiagniecia WHERE postac_id=?
       )`,
      [postacId]
    );
    if (!allAch.length) return newlyUnlocked;

    // Get current stats
    const [[postac]] = await db.query('SELECT poziom, zloto, kills FROM postac WHERE id=?', [postacId]);
    if (!postac) return newlyUnlocked;

    const [[questsDoneRow]] = await db.query(
      'SELECT COUNT(*) as cnt FROM postac_questy_history WHERE postac_id=?',
      [postacId]
    );
    const questsDone = questsDoneRow?.cnt || 0;

    const [[chainsDoneRow]] = await db.query(
      `SELECT COUNT(DISTINCT q.lancuch_id) as cnt
       FROM postac_questy_history pqh
       JOIN questy q ON q.id=pqh.quest_id
       WHERE pqh.postac_id=? AND q.lancuch_id>0`,
      [postacId]
    );
    const chainsDone = chainsDoneRow?.cnt || 0;

    const [[factionMaxRow]] = await db.query(
      'SELECT MAX(punkty) as mx FROM postac_reputacja WHERE postac_id=?',
      [postacId]
    );
    const factionMax = factionMaxRow?.mx || 0;

    const [[hiddenRow]] = await db.query(
      `SELECT COUNT(*) as cnt FROM postac_questy_history pqh
       JOIN questy q ON q.id=pqh.quest_id
       WHERE pqh.postac_id=? AND q.ukryty=1`,
      [postacId]
    );
    const hiddenDone = hiddenRow?.cnt || 0;

    const [[partyRow]] = await db.query(
      `SELECT COUNT(*) as cnt FROM postac_questy_history pqh
       JOIN questy q ON q.id=pqh.quest_id
       WHERE pqh.postac_id=? AND q.wymaga_party>0`,
      [postacId]
    );
    const partyDone = partyRow?.cnt || 0;

    const [[rankingFirstRow]] = await db.query(
      `SELECT COUNT(DISTINCT quest_id) as cnt FROM quest_ranking
       WHERE postac_id=? AND id=(SELECT MIN(id) FROM quest_ranking qr2 WHERE qr2.quest_id=quest_ranking.quest_id)`,
      [postacId]
    );
    const rankingFirst = rankingFirstRow?.cnt || 0;

    const [[choiceRow]] = await db.query(
      `SELECT COUNT(*) as cnt FROM postac_questy pq
       JOIN questy q ON q.id=pq.quest_id
       WHERE pq.postac_id=? AND pq.nagroda_wybrana IS NOT NULL`,
      [postacId]
    );
    const rewardChoices = choiceRow?.cnt || 0;

    const statMap = {
      quests_done:    questsDone,
      kills:          postac.kills || 0,
      level:          postac.poziom || 1,
      gold_earned:    postac.zloto || 0,
      maps_visited:   0, // not tracked yet
      pvp_wins:       0, // not tracked yet
      chains_done:    chainsDone,
      faction_max:    factionMax,
      hidden_quests:  hiddenDone,
      party_quests:   partyDone,
      ranking_first:  rankingFirst,
      reward_choices: rewardChoices,
    };

    for (const ach of allAch) {
      const val = statMap[ach.warunek_typ] ?? 0;
      if (val >= ach.warunek_wartosc) {
        try {
          await db.query(
            'INSERT IGNORE INTO postac_osiagniecia (postac_id, osiagniecie_id) VALUES (?,?)',
            [postacId, ach.id]
          );
          // Grant rewards
          if (ach.nagroda_exp > 0 || ach.nagroda_gold > 0) {
            await db.query(
              'UPDATE postac SET exp=exp+?, zloto=zloto+? WHERE id=?',
              [ach.nagroda_exp || 0, ach.nagroda_gold || 0, postacId]
            );
          }
          newlyUnlocked.push({ id: ach.id, klucz: ach.klucz, nazwa: ach.nazwa, ikona: ach.ikona });
        } catch (e) { logError('quests:218')(e); }
      }
    }
  } catch(e) {
    console.error('checkAchievements error:', e.message);
  }
  return newlyUnlocked;
}

// ── GET /api/quests — active quests for character ─────────────────────────────
router.get('/', requireSession, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT pq.*, q.nazwa, q.opis, q.typ, q.cel_id, q.cel_wartosc, q.cel_ilosc,
              q.nagroda_exp, q.nagroda_zloto, q.wymagany_poziom, q.nagrody_wybor,
              q.lancuch_id, q.frakcja_id, q.reset_typ
       FROM postac_questy pq
       JOIN questy q ON pq.quest_id = q.id
       WHERE pq.postac_id = ?
       ORDER BY pq.status, pq.data_przyj DESC`,
      [req.session.postacId]
    );
    res.json(rows);
  } catch(e) { next(e); }
});

// ── GET /api/quests/npc/:npcId — quests available or active for this NPC ─────
router.get('/npc/:npcId', requireSession, async (req, res, next) => {
  try {
    const npcId = Number(req.params.npcId);
    const postacId = req.session.postacId;

    // Quests given by this NPC
    const [available] = await db.query(
      "SELECT * FROM questy WHERE (npc_start_id=? OR npc_end_id=?) AND aktywny=1 AND ukryty=0",
      [npcId, npcId]
    );

    const result = { give: [], turnin: [], active: [] };

    for (const q of available) {
      const [[pq]] = await db.query(
        'SELECT * FROM postac_questy WHERE postac_id=? AND quest_id=?',
        [postacId, q.id]
      );

      if (!pq) {
        // Can we accept?
        if (q.npc_start_id === npcId && await canAccept(postacId, q)) {
          result.give.push(q);
        }
      } else if (pq.status === 'aktywny') {
        const done = await checkCompletion(postacId, pq, q);
        if (done && (q.npc_end_id === npcId || (q.npc_end_id === 0 && q.npc_start_id === npcId))) {
          result.turnin.push({ ...q, postep: pq.postep });
        } else {
          result.active.push({ ...q, postep: pq.postep });
        }
      }
    }

    res.json(result);
  } catch(e) { next(e); }
});

// ── POST /api/quests/accept ───────────────────────────────────────────────────
router.post('/accept', requireSession, async (req, res, next) => {
  try {
    const { questId } = req.body;
    const postacId = req.session.postacId;

    const [[quest]] = await db.query('SELECT * FROM questy WHERE id=?', [questId]);
    if (!quest) return res.json({ ok:false, error:'Quest nie istnieje' });

    // Daily/weekly: check if already completed today/this week
    if (quest.reset_typ === 'dziennie') {
      const [[doneToday]] = await db.query(
        `SELECT pq.id FROM postac_questy pq
         WHERE pq.postac_id=? AND pq.quest_id=? AND pq.status='oddane'
           AND DATE(pq.data_ukon) = CURDATE()`,
        [postacId, questId]
      );
      if (doneToday) return res.json({ ok:false, error:'Już ukończyłeś ten quest dzisiaj' });
    }
    if (quest.reset_typ === 'tygodniowo') {
      const [[doneWeek]] = await db.query(
        `SELECT pq.id FROM postac_questy pq
         WHERE pq.postac_id=? AND pq.quest_id=? AND pq.status='oddane'
           AND YEARWEEK(pq.data_ukon,1) = YEARWEEK(CURDATE(),1)`,
        [postacId, questId]
      );
      if (doneWeek) return res.json({ ok:false, error:'Już ukończyłeś ten quest w tym tygodniu' });
      // Delete old completed row so we can accept fresh
      await db.query("DELETE FROM postac_questy WHERE postac_id=? AND quest_id=? AND status='oddane'", [postacId, questId]);
    }

    if (!await canAccept(postacId, quest)) return res.json({ ok:false, error:'Nie możesz przyjąć tego questu' });

    // For daily: delete previous completed row before re-inserting
    if (quest.reset_typ === 'dziennie') {
      await db.query("DELETE FROM postac_questy WHERE postac_id=? AND quest_id=? AND status='oddane'", [postacId, questId]);
    }

    await db.query(
      'INSERT INTO postac_questy (postac_id, quest_id, postep, status, data_przyjecia) VALUES (?,?,0,"aktywny",NOW())',
      [postacId, questId]
    );
    res.json({ ok:true, quest });
  } catch(e) { next(e); }
});

// ── POST /api/quests/turnin ───────────────────────────────────────────────────
router.post('/turnin', requireSession, async (req, res, next) => {
  try {
    const { questId, zakonczenie: zakEnding } = req.body;
    const postacId = req.session.postacId;

    const [[quest]] = await db.query('SELECT * FROM questy WHERE id=?', [questId]);
    if (!quest) return res.json({ ok:false, error:'Quest nie istnieje' });

    const [[pq]] = await db.query(
      'SELECT * FROM postac_questy WHERE postac_id=? AND quest_id=?',
      [postacId, questId]
    );
    if (!pq || pq.status !== 'aktywny') return res.json({ ok:false, error:'Quest nieaktywny' });
    if (!await checkCompletion(postacId, pq, quest)) return res.json({ ok:false, error:'Quest niezakończony' });

    // Choice rewards: if quest has choices and player hasn't chosen yet, return choices
    if (quest.nagrody_wybor && pq.nagroda_wybrana === null) {
      let choices = [];
      try { choices = JSON.parse(quest.nagrody_wybor); } catch(_) {}
      if (choices.length > 0) {
        return res.json({ ok: false, needsChoice: true, choices, questId });
      }
    }

    const ending = zakEnding || quest.zakonczenie || 'neutralne';

    // Apply rewards
    const [[postac]] = await db.query('SELECT * FROM postac WHERE id=?', [postacId]);
    let newExp = Number(postac.exp) + (quest.nagroda_exp || 0);
    let newLevel = postac.poziom;
    let levelUp = false;
    while (Math.pow(newLevel, 4) + 10 <= newExp) { newLevel++; levelUp = true; }

    await db.query(
      'UPDATE postac SET exp=?, poziom=?, zloto=zloto+? WHERE id=?',
      [newExp, newLevel, quest.nagroda_zloto||0, postacId]
    );
    if (levelUp) await db.query('UPDATE postac SET um=um+1 WHERE id=?', [postacId]);

    // Give item reward if specified
    if (quest.nagroda_item_id > 0) {
      const [[item]] = await db.query('SELECT * FROM przedmiot_loot WHERE id=?', [quest.nagroda_item_id]);
      if (item) {
        // Pełna kopia szablonu — wcześniej nagroda traciła m.in. mnożnik obrażeń i flagi profesji
        await giveItem(db, postacId, item);
      }
    }

    await db.query(
      "UPDATE postac_questy SET status='oddane', data_ukon=NOW(), zakonczenie=? WHERE postac_id=? AND quest_id=?",
      [ending, postacId, questId]
    );

    // Save to history
    try {
      await db.query(
        'INSERT INTO postac_questy_history (postac_id, quest_id, quest_nazwa, zakonczenie) VALUES (?,?,?,?)',
        [postacId, questId, quest.nazwa, ending]
      );
    } catch (e) { logError('quests:389')(e); }

    // Faction reputation gain
    if (quest.frakcja_id > 0) {
      try {
        await db.query(
          `INSERT INTO postac_reputacja (postac_id, frakcja_id, punkty) VALUES (?,?,100)
           ON DUPLICATE KEY UPDATE punkty=punkty+100`,
          [postacId, quest.frakcja_id]
        );
      } catch (e) { logError('quests:399')(e); }
    }

    // Ranking quest: insert if first time
    if (quest.typ_ranking) {
      try {
        const [[postacNazwa]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [postacId]);
        await db.query(
          'INSERT IGNORE INTO quest_ranking (quest_id, postac_id, postac_nazwa) VALUES (?,?,?)',
          [questId, postacId, postacNazwa?.nazwa || '']
        );
      } catch (e) { logError('quests:410')(e); }
    }

    // Check achievements
    const newAchievements = await checkAchievements(db, postacId);

    res.json({
      ok:true,
      rewards: { exp: quest.nagroda_exp||0, zloto: quest.nagroda_zloto||0, item: quest.nagroda_item_id||0 },
      levelUp, newLevel, newAchievements,
    });
  } catch(e) { next(e); }
});

// ── POST /api/quests/turnin/:questId/choose — pick reward choice ──────────────
router.post('/turnin/:questId/choose', requireSession, async (req, res, next) => {
  try {
    const questId = Number(req.params.questId);
    const { choice_index } = req.body;
    const postacId = req.session.postacId;

    const [[quest]] = await db.query('SELECT * FROM questy WHERE id=?', [questId]);
    if (!quest) return res.json({ ok:false, error:'Quest nie istnieje' });

    const [[pq]] = await db.query(
      'SELECT * FROM postac_questy WHERE postac_id=? AND quest_id=?',
      [postacId, questId]
    );
    if (!pq || pq.status !== 'aktywny') return res.json({ ok:false, error:'Quest nieaktywny' });
    if (!await checkCompletion(postacId, pq, quest)) return res.json({ ok:false, error:'Quest niezakończony' });

    let choices = [];
    try { choices = JSON.parse(quest.nagrody_wybor); } catch(_) {}
    if (choice_index < 0 || choice_index >= choices.length)
      return res.json({ ok:false, error:'Nieprawidłowy wybór' });

    const chosen = choices[choice_index];
    const ending = quest.zakonczenie || 'neutralne';

    // Apply chosen reward
    const [[postac]] = await db.query('SELECT * FROM postac WHERE id=?', [postacId]);
    let newExp = Number(postac.exp) + (chosen.exp || 0);
    let newLevel = postac.poziom;
    let levelUp = false;
    while (Math.pow(newLevel, 4) + 10 <= newExp) { newLevel++; levelUp = true; }

    await db.query(
      'UPDATE postac SET exp=?, poziom=?, zloto=zloto+? WHERE id=?',
      [newExp, newLevel, chosen.gold || 0, postacId]
    );
    if (levelUp) await db.query('UPDATE postac SET um=um+1 WHERE id=?', [postacId]);

    await db.query(
      "UPDATE postac_questy SET status='oddane', data_ukon=NOW(), nagroda_wybrana=?, zakonczenie=? WHERE postac_id=? AND quest_id=?",
      [choice_index, ending, postacId, questId]
    );

    try {
      await db.query(
        'INSERT INTO postac_questy_history (postac_id, quest_id, quest_nazwa, zakonczenie) VALUES (?,?,?,?)',
        [postacId, questId, quest.nazwa, ending]
      );
    } catch (e) { logError('quests:472')(e); }

    const newAchievements = await checkAchievements(db, postacId);

    res.json({
      ok:true,
      chosen,
      rewards: { exp: chosen.exp||0, gold: chosen.gold||0 },
      levelUp, newLevel, newAchievements,
    });
  } catch(e) { next(e); }
});

// ── POST /api/quests/progress — internal: update kill/item/location progress ──
router.post('/progress', requireSession, async (req, res, next) => {
  try {
    const { typ, cel_id, amount = 1 } = req.body;
    const postacId = req.session.postacId;
    const completed = [];

    const [activeQuests] = await db.query(
      `SELECT pq.*, q.* FROM postac_questy pq
       JOIN questy q ON pq.quest_id = q.id
       WHERE pq.postac_id=? AND pq.status='aktywny' AND q.typ=?`,
      [postacId, typ]
    );

    for (const pq of activeQuests) {
      let matches = false;
      if (typ === 'kill'  && (pq.cel_id === 0 || pq.cel_id === cel_id)) matches = true;
      if (typ === 'item'  && pq.cel_id === cel_id) matches = true;
      if (typ === 'location' && pq.cel_id === cel_id) matches = true;

      if (matches && pq.postep < pq.cel_ilosc) {
        const newPostep = Math.min(pq.cel_ilosc, pq.postep + amount);
        await db.query(
          'UPDATE postac_questy SET postep=? WHERE postac_id=? AND quest_id=?',
          [newPostep, postacId, pq.quest_id]
        );
        if (newPostep >= pq.cel_ilosc) {
          completed.push({ id: pq.quest_id, nazwa: pq.nazwa });
        }
      }
    }

    // Auto-check level quests
    if (typ === 'level') {
      const [levelQuests] = await db.query(
        `SELECT pq.*, q.* FROM postac_questy pq
         JOIN questy q ON pq.quest_id = q.id
         WHERE pq.postac_id=? AND pq.status='aktywny' AND q.typ='level' AND q.cel_id<=?`,
        [postacId, cel_id]
      );
      for (const pq of levelQuests) {
        if (pq.postep < 1) {
          await db.query(
            'UPDATE postac_questy SET postep=1 WHERE postac_id=? AND quest_id=?',
            [postacId, pq.quest_id]
          );
          completed.push({ id: pq.quest_id, nazwa: pq.nazwa });
        }
      }
    }

    res.json({ ok:true, completed });
  } catch(e) { next(e); }
});

// ── GET /api/quests/chains — list all quest chains with progress ──────────────
router.get('/chains', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [chains] = await db.query('SELECT * FROM quest_chain ORDER BY id');
    const result = [];
    for (const chain of chains) {
      const [[total]] = await db.query(
        'SELECT COUNT(*) as cnt FROM questy WHERE lancuch_id=? AND aktywny=1',
        [chain.id]
      );
      const [[done]] = await db.query(
        `SELECT COUNT(*) as cnt FROM postac_questy pq
         JOIN questy q ON q.id=pq.quest_id
         WHERE pq.postac_id=? AND q.lancuch_id=? AND pq.status='oddane'`,
        [postacId, chain.id]
      );
      result.push({ ...chain, total: total.cnt, done: done.cnt });
    }
    res.json(result);
  } catch(e) { next(e); }
});

// ── GET /api/quests/chains/:chainId/quests — quests in a chain ───────────────
router.get('/chains/:chainId/quests', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const chainId = Number(req.params.chainId);
    const [quests] = await db.query(
      'SELECT * FROM questy WHERE lancuch_id=? ORDER BY kolejnosc',
      [chainId]
    );
    const result = [];
    for (const q of quests) {
      const [[pq]] = await db.query(
        'SELECT status, postep FROM postac_questy WHERE postac_id=? AND quest_id=?',
        [postacId, q.id]
      );
      result.push({ ...q, myStatus: pq?.status || null, myPostep: pq?.postep || 0 });
    }
    res.json(result);
  } catch(e) { next(e); }
});

// ── GET /api/quests/daily — daily quests ─────────────────────────────────────
router.get('/daily', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [quests] = await db.query(
      "SELECT * FROM questy WHERE reset_typ='dziennie' AND aktywny=1"
    );
    const result = [];
    for (const q of quests) {
      const [[pq]] = await db.query(
        'SELECT status, postep, data_ukon FROM postac_questy WHERE postac_id=? AND quest_id=?',
        [postacId, q.id]
      );
      const doneToday = pq?.status === 'oddane' && pq.data_ukon &&
        new Date(pq.data_ukon).toDateString() === new Date().toDateString();
      result.push({ ...q, myStatus: pq?.status || null, myPostep: pq?.postep || 0, doneToday });
    }
    res.json(result);
  } catch(e) { next(e); }
});

// ── GET /api/quests/weekly — weekly quests ───────────────────────────────────
router.get('/weekly', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [quests] = await db.query(
      "SELECT * FROM questy WHERE reset_typ='tygodniowo' AND aktywny=1"
    );
    const result = [];
    for (const q of quests) {
      const [[pq]] = await db.query(
        'SELECT status, postep, data_ukon FROM postac_questy WHERE postac_id=? AND quest_id=?',
        [postacId, q.id]
      );
      // Check if done this week
      let doneThisWeek = false;
      if (pq?.status === 'oddane' && pq.data_ukon) {
        const d = new Date(pq.data_ukon);
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        doneThisWeek = d >= weekStart;
      }
      result.push({ ...q, myStatus: pq?.status || null, myPostep: pq?.postep || 0, doneThisWeek });
    }
    res.json(result);
  } catch(e) { next(e); }
});

// ── GET /api/quests/reputation — my reputation with all factions ──────────────
router.get('/reputation', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [frakcje] = await db.query('SELECT * FROM frakcje ORDER BY id');
    const result = [];
    for (const f of frakcje) {
      const [[rep]] = await db.query(
        'SELECT punkty FROM postac_reputacja WHERE postac_id=? AND frakcja_id=?',
        [postacId, f.id]
      );
      const punkty = rep?.punkty || 0;
      let poziom = 'Neutralny';
      if (punkty < 0) poziom = 'Wrogi';
      else if (punkty < 100) poziom = 'Neutralny';
      else if (punkty < 300) poziom = 'Przyjazny';
      else if (punkty < 600) poziom = 'Szanowany';
      else if (punkty < 1000) poziom = 'Czczony';
      else poziom = 'Wybrany';
      result.push({ ...f, punkty, poziom });
    }
    res.json(result);
  } catch(e) { next(e); }
});

// ── GET /api/quests/reputation/:frakcjaId — specific faction ─────────────────
router.get('/reputation/:frakcjaId', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const frakcjaId = Number(req.params.frakcjaId);
    const [[frakcja]] = await db.query('SELECT * FROM frakcje WHERE id=?', [frakcjaId]);
    if (!frakcja) return res.status(404).json({ error: 'Frakcja nie istnieje' });
    const [[rep]] = await db.query(
      'SELECT punkty FROM postac_reputacja WHERE postac_id=? AND frakcja_id=?',
      [postacId, frakcjaId]
    );
    const punkty = rep?.punkty || 0;
    let poziom = 'Neutralny';
    if (punkty < 0) poziom = 'Wrogi';
    else if (punkty < 100) poziom = 'Neutralny';
    else if (punkty < 300) poziom = 'Przyjazny';
    else if (punkty < 600) poziom = 'Szanowany';
    else if (punkty < 1000) poziom = 'Czczony';
    else poziom = 'Wybrany';
    const [quests] = await db.query(
      'SELECT * FROM questy WHERE frakcja_id=? AND aktywny=1',
      [frakcjaId]
    );
    res.json({ ...frakcja, punkty, poziom, quests });
  } catch(e) { next(e); }
});

// ── POST /api/quests/reputation/gain — add reputation points ─────────────────
router.post('/reputation/gain', requireSession, async (req, res, next) => {
  try {
    const { frakcja_id, amount } = req.body;
    const postacId = req.session.postacId;
    await db.query(
      `INSERT INTO postac_reputacja (postac_id, frakcja_id, punkty) VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE punkty=punkty+?`,
      [postacId, frakcja_id, amount, amount]
    );
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// ── GET /api/quests/ranking/:questId — leaderboard for ranking quest ──────────
router.get('/ranking/:questId', requireSession, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM quest_ranking WHERE quest_id=? ORDER BY data ASC LIMIT 100',
      [Number(req.params.questId)]
    );
    res.json(rows);
  } catch(e) { next(e); }
});

// ── GET /api/quests/history — quest completion history ────────────────────────
router.get('/history', requireSession, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM postac_questy_history WHERE postac_id=? ORDER BY data_ukonczenia DESC LIMIT 50',
      [req.session.postacId]
    );
    res.json(rows);
  } catch(e) { next(e); }
});

// ── GET /api/quests/events/active — active server events ─────────────────────
router.get('/events/active', requireSession, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM server_events WHERE aktywny=1 AND (data_koniec IS NULL OR data_koniec > NOW())"
    );
    res.json(rows);
  } catch(e) { next(e); }
});

// ── POST /api/quests/events/toggle — admin: activate/deactivate event ─────────
router.post('/events/toggle', requireAdmin, async (req, res, next) => {
  try {
    const { typ, aktywny, hours } = req.body;
    const [[existing]] = await db.query('SELECT id FROM server_events WHERE typ=?', [typ]);
    const data_koniec = hours ? new Date(Date.now() + hours * 3600000) : null;
    if (existing) {
      await db.query(
        'UPDATE server_events SET aktywny=?, data_start=NOW(), data_koniec=? WHERE typ=?',
        [aktywny ? 1 : 0, data_koniec, typ]
      );
    } else {
      await db.query(
        'INSERT INTO server_events (typ, aktywny, data_start, data_koniec) VALUES (?,?,NOW(),?)',
        [typ, aktywny ? 1 : 0, data_koniec]
      );
    }
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// ── GET /api/quests/achievements — all achievements with my unlock status ─────
router.get('/achievements', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [all] = await db.query('SELECT * FROM osiagniecia ORDER BY warunek_wartosc');
    const [unlocked] = await db.query(
      'SELECT osiagniecie_id, data FROM postac_osiagniecia WHERE postac_id=?',
      [postacId]
    );
    const unlockedMap = {};
    for (const u of unlocked) unlockedMap[u.osiagniecie_id] = u.data;
    const result = all.map(a => ({
      ...a,
      unlocked: !!unlockedMap[a.id],
      data_odblokowania: unlockedMap[a.id] || null,
    }));
    res.json(result);
  } catch(e) { next(e); }
});

// ── POST /api/quests/achievements/check — check and unlock achievements ────────
router.post('/achievements/check', requireSession, async (req, res, next) => {
  try {
    const newAchievements = await checkAchievements(db, req.session.postacId);
    res.json({ ok: true, newAchievements });
  } catch(e) { next(e); }
});

// ── POST /api/quests/hidden/trigger — auto-accept hidden quest ────────────────
router.post('/hidden/trigger', requireSession, async (req, res, next) => {
  try {
    const { warunek_typ, warunek_wartosc } = req.body;
    const postacId = req.session.postacId;
    const accepted = [];

    const [hiddenQuests] = await db.query(
      "SELECT * FROM questy WHERE ukryty=1 AND aktywny=1"
    );
    for (const hq of hiddenQuests) {
      try {
        let warunek = {};
        try { warunek = JSON.parse(hq.ukryty_warunek || '{}'); } catch(_) {}
        if (warunek.typ !== warunek_typ) continue;
        if (String(warunek.wartosc) !== String(warunek_wartosc)) continue;
        const [[existing]] = await db.query(
          'SELECT id FROM postac_questy WHERE postac_id=? AND quest_id=?',
          [postacId, hq.id]
        );
        if (!existing) {
          await db.query(
            'INSERT INTO postac_questy (postac_id, quest_id, postep, status, data_przyjecia) VALUES (?,?,0,"aktywny",NOW())',
            [postacId, hq.id]
          );
          accepted.push({ id: hq.id, nazwa: hq.nazwa });
        }
      } catch (e) { logError('quests:808')(e); }
    }
    res.json({ ok: true, accepted });
  } catch(e) { next(e); }
});

// ── ADMIN CRUD ────────────────────────────────────────────────────────────────
router.get('/admin', requireAdmin, async (req, res, next) => {
  try {
    const [quests] = await db.query('SELECT * FROM questy ORDER BY id');
    res.json(quests);
  } catch(e) { next(e); }
});

router.post('/admin', requireAdmin, async (req, res, next) => {
  try {
    const d = req.body;
    const [r] = await db.query(
      `INSERT INTO questy (nazwa,opis,typ,cel_id,cel_wartosc,cel_ilosc,nagroda_exp,nagroda_zloto,
         nagroda_item_id,wymagany_poziom,wymagany_quest_id,npc_start_id,npc_end_id,
         tekst_start,tekst_w_trakcie,tekst_koniec,aktywny,
         lancuch_id,kolejnosc,czas_limit,ukryty,ukryty_warunek,reset_typ,wymaga_party,
         nagrody_wybor,typ_ranking,skalowanie,frakcja_id,wyklucza_frakcje,wyzwalacz,
         wskazowki,zakonczenie)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.nazwa||'Nowy quest', d.opis||'', d.typ||'kill',
       d.cel_id||0, d.cel_wartosc||'', d.cel_ilosc||1,
       d.nagroda_exp||0, d.nagroda_zloto||0, d.nagroda_item_id||0,
       d.wymagany_poziom||1, d.wymagany_quest_id||0,
       d.npc_start_id||0, d.npc_end_id||0,
       d.tekst_start||'', d.tekst_w_trakcie||'', d.tekst_koniec||'',
       d.lancuch_id||0, d.kolejnosc||0, d.czas_limit||0, d.ukryty||0,
       d.ukryty_warunek||'', d.reset_typ||'brak', d.wymaga_party||0,
       d.nagrody_wybor||null, d.typ_ranking||0, d.skalowanie||0,
       d.frakcja_id||0, d.wyklucza_frakcje||0, d.wyzwalacz||'',
       d.wskazowki||null, d.zakonczenie||'neutralne']
    );
    res.json({ ok:true, id: r.insertId });
  } catch(e) { next(e); }
});

router.put('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const d = req.body;
    await db.query(
      `UPDATE questy SET nazwa=?,opis=?,typ=?,cel_id=?,cel_wartosc=?,cel_ilosc=?,
         nagroda_exp=?,nagroda_zloto=?,nagroda_item_id=?,wymagany_poziom=?,wymagany_quest_id=?,
         npc_start_id=?,npc_end_id=?,tekst_start=?,tekst_w_trakcie=?,tekst_koniec=?,aktywny=?,
         lancuch_id=?,kolejnosc=?,czas_limit=?,ukryty=?,ukryty_warunek=?,reset_typ=?,
         wymaga_party=?,nagrody_wybor=?,typ_ranking=?,skalowanie=?,frakcja_id=?,
         wyklucza_frakcje=?,wyzwalacz=?,wskazowki=?,zakonczenie=?
       WHERE id=?`,
      [d.nazwa, d.opis||'', d.typ||'kill',
       d.cel_id||0, d.cel_wartosc||'', d.cel_ilosc||1,
       d.nagroda_exp||0, d.nagroda_zloto||0, d.nagroda_item_id||0,
       d.wymagany_poziom||1, d.wymagany_quest_id||0,
       d.npc_start_id||0, d.npc_end_id||0,
       d.tekst_start||'', d.tekst_w_trakcie||'', d.tekst_koniec||'',
       d.aktywny ?? 1,
       d.lancuch_id||0, d.kolejnosc||0, d.czas_limit||0, d.ukryty||0,
       d.ukryty_warunek||'', d.reset_typ||'brak', d.wymaga_party||0,
       d.nagrody_wybor||null, d.typ_ranking||0, d.skalowanie||0,
       d.frakcja_id||0, d.wyklucza_frakcje||0, d.wyzwalacz||'',
       d.wskazowki||null, d.zakonczenie||'neutralne',
       req.params.id]
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.delete('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM questy WHERE id=?', [req.params.id]);
    await db.query('DELETE FROM postac_questy WHERE quest_id=?', [req.params.id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

module.exports = router;
module.exports.checkAchievements = checkAchievements;
