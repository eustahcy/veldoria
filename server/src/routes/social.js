const express = require('express');
const { logError } = require('../game/log');
const router  = express.Router();
const db      = require('../db');
const { requireSession } = require('../middleware/auth');

// ── Auto-create tables ────────────────────────────────────────────────────────
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS gilde (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nazwa VARCHAR(50) NOT NULL,
        tag VARCHAR(5) NOT NULL,
        mistrz_id INT NOT NULL,
        opis TEXT,
        data_zal TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS gildia_czlonkowie (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gildia_id INT NOT NULL,
        postac_id INT NOT NULL,
        ranga ENUM('mistrz','oficer','czlonek') DEFAULT 'czlonek',
        UNIQUE KEY uq_postac (postac_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS wiadomosci (
        id INT AUTO_INCREMENT PRIMARY KEY,
        od_id INT NOT NULL,
        do_id INT NOT NULL,
        tresc TEXT NOT NULL,
        przeczytana TINYINT(1) DEFAULT 0,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci
    `);
    // Add kill/death tracking columns to postac if missing
    for (const col of ['kills INT DEFAULT 0', 'deaths INT DEFAULT 0']) {
      const name = col.split(' ')[0];
      await db.query(`ALTER TABLE postac ADD COLUMN IF NOT EXISTS ${col}`).catch(() =>
        db.query(`ALTER TABLE postac ADD COLUMN ${col}`).catch(logError('social:43'))
      );
    }
  } catch(e) {
    console.error('Social tables init error:', e.message);
  }
})();

// ── PROFIL GRACZA ─────────────────────────────────────────────────────────────
router.get('/profile/:postacId', requireSession, async (req, res, next) => {
  try {
    const targetId = req.params.postacId;
    const [[p]] = await db.query(
      `SELECT p.id, p.nazwa, p.poziom, p.profesja, p.obrazek, p.ranga,
              p.exp, p.zycie, p.zycie_max, p.zalogowany,
              COALESCE(p.kills,0) AS kills, COALESCE(p.deaths,0) AS deaths,
              COALESCE(p.czas_gry,0) AS czas_gry,
              COALESCE(p.zloto_zarobione,0) AS zloto_zarobione,
              COALESCE(p.prestige,0) AS prestige,
              COALESCE(p.prestige_bonus_pct,0) AS prestige_bonus_pct,
              p.aktywny_tytul,
              g.nazwa AS gildia_nazwa, g.tag AS gildia_tag,
              t.nazwa AS tytul_nazwa, t.ikona AS tytul_ikona
       FROM postac p
       LEFT JOIN gildia_czlonkowie gc ON gc.postac_id = p.id
       LEFT JOIN gilde g ON g.id = gc.gildia_id
       LEFT JOIN tytuly t ON t.id = p.aktywny_tytul
       WHERE p.id = ?`,
      [targetId]
    ).catch(async () => {
      // fallback without tytuly join
      return db.query(
        `SELECT p.id, p.nazwa, p.poziom, p.profesja, p.obrazek, p.ranga,
                p.exp, p.zycie, p.zycie_max, p.zalogowany,
                COALESCE(p.kills,0) AS kills, COALESCE(p.deaths,0) AS deaths,
                g.nazwa AS gildia_nazwa, g.tag AS gildia_tag
         FROM postac p
         LEFT JOIN gildia_czlonkowie gc ON gc.postac_id = p.id
         LEFT JOIN gilde g ON g.id = gc.gildia_id
         WHERE p.id = ?`,
        [targetId]
      );
    });
    if (!p) return res.status(404).json({ error: 'Nie znaleziono' });

    // Extra stats
    let tytuly_count = 0, osiagniecia_count = 0, questy_count = 0;
    let komentarze = [];
    try {
      [[{ cnt: tytuly_count }]] = await db.query('SELECT COUNT(*) AS cnt FROM postac_tytuly WHERE postac_id=?', [targetId]);
    } catch (e) { logError('social:93')(e); }
    try {
      [[{ cnt: osiagniecia_count }]] = await db.query('SELECT COUNT(*) AS cnt FROM postac_osiagniecia WHERE postac_id=?', [targetId]);
    } catch (e) { logError('social:96')(e); }
    try {
      [[{ cnt: questy_count }]] = await db.query('SELECT COUNT(*) AS cnt FROM postac_questy_history WHERE postac_id=?', [targetId]);
    } catch (e) { logError('social:99')(e); }
    try {
      [komentarze] = await db.query(
        'SELECT * FROM profil_komentarze WHERE profil_postac_id=? ORDER BY data DESC LIMIT 20',
        [targetId]
      );
    } catch (e) { logError('social:105')(e); }

    res.json({ ...p, tytuly_count, osiagniecia_count, questy_count, komentarze });
  } catch(e) { next(e); }
});

// POST /api/social/profile/comment/:id — add comment
router.post('/profile/comment/:id', requireSession, async (req, res, next) => {
  try {
    const profileId = req.params.id;
    const autorId   = req.session.postacId;
    const { tresc } = req.body;
    if (!tresc || !String(tresc).trim()) return res.json({ ok: false, error: 'Brak treści' });
    const text = String(tresc).trim().slice(0, 500);
    const [[autor]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [autorId]);
    await db.query(
      'INSERT INTO profil_komentarze (profil_postac_id, autor_postac_id, autor_nazwa, tresc) VALUES (?,?,?,?)',
      [profileId, autorId, autor?.nazwa || '?', text]
    );
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// DELETE /api/social/profile/comment/:cid — delete own comment
router.delete('/profile/comment/:cid', requireSession, async (req, res, next) => {
  try {
    const autorId = req.session.postacId;
    const [[comment]] = await db.query('SELECT * FROM profil_komentarze WHERE id=?', [req.params.cid]);
    if (!comment) return res.json({ ok: false, error: 'Nie znaleziono' });
    // Allow own comments or admins
    const [[postac]] = await db.query('SELECT ranga FROM postac WHERE id=?', [autorId]);
    if (comment.autor_postac_id !== autorId && !['GameAdmin','GameMaster'].includes(postac?.ranga))
      return res.json({ ok: false, error: 'Brak uprawnień' });
    await db.query('DELETE FROM profil_komentarze WHERE id=?', [req.params.cid]);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// ── GILDIE ────────────────────────────────────────────────────────────────────
router.get('/guild/my', requireSession, async (req, res, next) => {
  try {
    const [[gc]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [req.session.postacId]);
    if (!gc) return res.json(null);
    const [[guild]] = await db.query('SELECT * FROM gilde WHERE id=?', [gc.gildia_id]);
    const [members] = await db.query(
      `SELECT gc.id AS member_row_id, gc.ranga, gc.wklad_gold, gc.wklad_kills, gc.wklad_exp,
              gc.data_dolaczenia, gc.niestandardowa_ranga,
              p.id, p.nazwa, p.poziom, p.profesja, p.obrazek, p.zalogowany
       FROM gildia_czlonkowie gc JOIN postac p ON gc.postac_id=p.id
       WHERE gc.gildia_id=? ORDER BY FIELD(gc.ranga,'mistrz','oficer','czlonek'), p.poziom DESC`,
      [gc.gildia_id]
    );
    // Extra guild data
    const [[buffs]] = await db.query('SELECT * FROM gildia_bonusy WHERE gildia_id=?', [gc.gildia_id]);
    const [[activeWar]] = await db.query(
      "SELECT * FROM gildia_wojny WHERE status='aktywna' AND (gildia_atakujaca=? OR gildia_broniac=?) LIMIT 1",
      [gc.gildia_id, gc.gildia_id]
    );
    const [[activeQuest]] = await db.query(
      "SELECT * FROM gildia_misje WHERE gildia_id=? AND status='aktywna' LIMIT 1",
      [gc.gildia_id]
    );
    const [[territory]] = await db.query('SELECT * FROM gildia_terytorium WHERE gildia_id=?', [gc.gildia_id]);
    const [relations] = await db.query(
      'SELECT * FROM gildia_relacje WHERE gildia1_id=? OR gildia2_id=?',
      [gc.gildia_id, gc.gildia_id]
    );
    res.json({
      ...guild,
      members,
      myRanga: gc.ranga,
      myMemberRowId: gc.id,
      myWklad: { gold: gc.wklad_gold, kills: gc.wklad_kills, exp: gc.wklad_exp },
      buffs: buffs || { bonus_exp:0, bonus_healing:0, bonus_crit:0, bonus_defense:0 },
      activeWar: activeWar || null,
      activeQuest: activeQuest || null,
      territory: territory || null,
      relations,
    });
  } catch(e) { next(e); }
});

router.post('/guild/create', requireSession, async (req, res, next) => {
  try {
    const { nazwa, tag, opis } = req.body;
    const postacId = req.session.postacId;
    if (!nazwa || !tag) return res.json({ ok:false, error:'Podaj nazwę i tag' });
    if (tag.length > 5) return res.json({ ok:false, error:'Tag max 5 znaków' });

    const [[existing]] = await db.query('SELECT id FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (existing) return res.json({ ok:false, error:'Już należysz do gildii' });

    const [[nameTaken]] = await db.query('SELECT id FROM gilde WHERE nazwa=?', [nazwa]);
    if (nameTaken) return res.json({ ok:false, error:'Nazwa gildii zajęta' });

    const [r] = await db.query(
      'INSERT INTO gilde (nazwa,tag,mistrz_id,opis) VALUES (?,?,?,?)',
      [nazwa, tag.toUpperCase(), postacId, opis||'']
    );
    await db.query(
      'INSERT INTO gildia_czlonkowie (gildia_id,postac_id,ranga) VALUES (?,?,?)',
      [r.insertId, postacId, 'mistrz']
    );
    res.json({ ok:true, id: r.insertId });
  } catch(e) { next(e); }
});

router.post('/guild/join', requireSession, async (req, res, next) => {
  try {
    const { guildId } = req.body;
    const postacId = req.session.postacId;

    const [[existing]] = await db.query('SELECT id FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (existing) return res.json({ ok:false, error:'Już należysz do gildii' });

    const [[guild]] = await db.query('SELECT id,nazwa,otwarta FROM gilde WHERE id=?', [guildId]);
    if (!guild) return res.json({ ok:false, error:'Gildia nie istnieje' });

    // Check if guild is open or player has accepted application
    if (!guild.otwarta) {
      const [[accepted]] = await db.query(
        "SELECT id FROM gildia_podania WHERE gildia_id=? AND postac_id=? AND status='zaakceptowano'",
        [guildId, postacId]
      );
      if (!accepted) return res.json({ ok:false, error:'Gildia jest zamknięta. Złóż podanie o przyjęcie.' });
    }

    await db.query('INSERT INTO gildia_czlonkowie (gildia_id,postac_id,ranga) VALUES (?,?,?)', [guildId, postacId, 'czlonek']);
    res.json({ ok:true, guildName: guild.nazwa });
  } catch(e) { next(e); }
});

router.post('/guild/leave', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[gc]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!gc) return res.json({ ok:false, error:'Nie należysz do gildii' });
    if (gc.ranga === 'mistrz') {
      // Transfer to another officer or member, or disband
      const [others] = await db.query(
        'SELECT postac_id FROM gildia_czlonkowie WHERE gildia_id=? AND postac_id!=? ORDER BY FIELD(ranga,"oficer","czlonek") LIMIT 1',
        [gc.gildia_id, postacId]
      );
      if (others.length > 0) {
        await db.query('UPDATE gildia_czlonkowie SET ranga="mistrz" WHERE postac_id=?', [others[0].postac_id]);
        await db.query('UPDATE gilde SET mistrz_id=? WHERE id=?', [others[0].postac_id, gc.gildia_id]);
      } else {
        // Disband guild
        await db.query('DELETE FROM gilde WHERE id=?', [gc.gildia_id]);
        await db.query('DELETE FROM gildia_czlonkowie WHERE gildia_id=?', [gc.gildia_id]);
        return res.json({ ok:true, disbanded:true });
      }
    }
    await db.query('DELETE FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.get('/guild/list', requireSession, async (req, res, next) => {
  try {
    const [guilds] = await db.query(
      `SELECT g.*, p.nazwa AS mistrz_nazwa,
              (SELECT COUNT(*) FROM gildia_czlonkowie WHERE gildia_id=g.id) AS czlonkowie
       FROM gilde g JOIN postac p ON g.mistrz_id=p.id
       ORDER BY czlonkowie DESC, g.id ASC LIMIT 50`
    );
    res.json(guilds);
  } catch(e) { next(e); }
});

router.post('/guild/promote', requireSession, async (req, res, next) => {
  try {
    const { targetId, ranga } = req.body;
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });
    await db.query('UPDATE gildia_czlonkowie SET ranga=? WHERE postac_id=? AND gildia_id=?', [ranga, targetId, my.gildia_id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.post('/guild/kick', requireSession, async (req, res, next) => {
  try {
    const { targetId } = req.body;
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || !['mistrz','oficer'].includes(my.ranga)) return res.json({ ok:false, error:'Brak uprawnień' });
    const [[target]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=? AND gildia_id=?', [targetId, my.gildia_id]);
    if (!target || target.ranga === 'mistrz') return res.json({ ok:false, error:'Nie można wykopać mistrza' });
    await db.query('DELETE FROM gildia_czlonkowie WHERE postac_id=? AND gildia_id=?', [targetId, my.gildia_id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

// ── GUILD RANKS ───────────────────────────────────────────────────────────────
router.get('/guild/ranks/:guildId', requireSession, async (req, res, next) => {
  try {
    const [ranks] = await db.query('SELECT * FROM gildia_rangi WHERE gildia_id=? ORDER BY poziom DESC', [req.params.guildId]);
    res.json(ranks);
  } catch(e) { next(e); }
});

router.post('/guild/ranks', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });
    const { gildia_id, nazwa, poziom, moze_zapraszac, moze_kickowac, moze_skarbiec } = req.body;
    if (my.gildia_id !== gildia_id) return res.json({ ok:false, error:'Brak uprawnień' });
    const [r] = await db.query(
      'INSERT INTO gildia_rangi (gildia_id,nazwa,poziom,moze_zapraszac,moze_kickowac,moze_skarbiec) VALUES (?,?,?,?,?,?)',
      [gildia_id, nazwa, poziom||0, moze_zapraszac||0, moze_kickowac||0, moze_skarbiec||0]
    );
    res.json({ ok:true, id: r.insertId });
  } catch(e) { next(e); }
});

router.put('/guild/ranks/:id', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });
    const { nazwa, poziom, moze_zapraszac, moze_kickowac, moze_skarbiec } = req.body;
    await db.query(
      'UPDATE gildia_rangi SET nazwa=?,poziom=?,moze_zapraszac=?,moze_kickowac=?,moze_skarbiec=? WHERE id=? AND gildia_id=?',
      [nazwa, poziom, moze_zapraszac, moze_kickowac, moze_skarbiec, req.params.id, my.gildia_id]
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.delete('/guild/ranks/:id', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });
    await db.query('DELETE FROM gildia_rangi WHERE id=? AND gildia_id=?', [req.params.id, my.gildia_id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.put('/guild/member-rank/:memberId', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });
    const { niestandardowa_ranga } = req.body;
    await db.query(
      'UPDATE gildia_czlonkowie SET niestandardowa_ranga=? WHERE id=? AND gildia_id=?',
      [niestandardowa_ranga || null, req.params.memberId, my.gildia_id]
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

// ── TREASURY ──────────────────────────────────────────────────────────────────
router.post('/guild/treasury/deposit', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const amount = parseInt(req.body.amount);
    if (!amount || amount <= 0) return res.json({ ok:false, error:'Nieprawidłowa kwota' });

    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my) return res.json({ ok:false, error:'Nie należysz do gildii' });

    const [[postac]] = await db.query('SELECT id,nazwa,zloto FROM postac WHERE id=?', [postacId]);
    if (!postac || postac.zloto < amount) return res.json({ ok:false, error:'Brak złota' });

    await db.query('UPDATE postac SET zloto=zloto-? WHERE id=?', [amount, postacId]);
    await db.query('UPDATE gilde SET skarbiec=skarbiec+? WHERE id=?', [amount, my.gildia_id]);
    await db.query('UPDATE gildia_czlonkowie SET wklad_gold=wklad_gold+? WHERE postac_id=? AND gildia_id=?', [amount, postacId, my.gildia_id]);
    await db.query(
      'INSERT INTO gildia_skarbiec_log (gildia_id,postac_id,postac_nazwa,typ,kwota,opis) VALUES (?,?,?,?,?,?)',
      [my.gildia_id, postacId, postac.nazwa, 'wplata', amount, '']
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.post('/guild/treasury/withdraw', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const amount = parseInt(req.body.amount);
    const opis = req.body.opis || '';
    if (!amount || amount <= 0) return res.json({ ok:false, error:'Nieprawidłowa kwota' });

    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || !['mistrz','oficer'].includes(my.ranga)) return res.json({ ok:false, error:'Brak uprawnień' });

    const [[guild]] = await db.query('SELECT skarbiec FROM gilde WHERE id=?', [my.gildia_id]);
    if (!guild || guild.skarbiec < amount) return res.json({ ok:false, error:'Brak środków w skarbcu' });

    const [[postac]] = await db.query('SELECT id,nazwa FROM postac WHERE id=?', [postacId]);
    await db.query('UPDATE gilde SET skarbiec=skarbiec-? WHERE id=?', [amount, my.gildia_id]);
    await db.query('UPDATE postac SET zloto=zloto+? WHERE id=?', [amount, postacId]);
    await db.query(
      'INSERT INTO gildia_skarbiec_log (gildia_id,postac_id,postac_nazwa,typ,kwota,opis) VALUES (?,?,?,?,?,?)',
      [my.gildia_id, postacId, postac.nazwa, 'wyplata', amount, opis.slice(0,200)]
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.get('/guild/treasury/log', requireSession, async (req, res, next) => {
  try {
    const [[my]] = await db.query('SELECT gildia_id FROM gildia_czlonkowie WHERE postac_id=?', [req.session.postacId]);
    if (!my) return res.json([]);
    const [log] = await db.query(
      'SELECT * FROM gildia_skarbiec_log WHERE gildia_id=? ORDER BY data DESC LIMIT 50',
      [my.gildia_id]
    );
    res.json(log);
  } catch(e) { next(e); }
});

// ── BULLETIN BOARD ────────────────────────────────────────────────────────────
router.put('/guild/bulletin', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });
    const ogloszenie = String(req.body.ogloszenie || '').slice(0, 1000);
    await db.query('UPDATE gilde SET ogloszenie=? WHERE id=?', [ogloszenie, my.gildia_id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

// ── RECRUITMENT ───────────────────────────────────────────────────────────────
router.put('/guild/open-close', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });
    const otwarta = req.body.otwarta ? 1 : 0;
    await db.query('UPDATE gilde SET otwarta=? WHERE id=?', [otwarta, my.gildia_id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.post('/guild/apply', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const { gildia_id, tresc } = req.body;

    const [[existing]] = await db.query('SELECT id FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (existing) return res.json({ ok:false, error:'Już należysz do gildii' });

    const [[guild]] = await db.query('SELECT id,otwarta FROM gilde WHERE id=?', [gildia_id]);
    if (!guild) return res.json({ ok:false, error:'Gildia nie istnieje' });

    const [[postac]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [postacId]);

    // Check for existing pending application
    const [[pending]] = await db.query(
      "SELECT id FROM gildia_podania WHERE gildia_id=? AND postac_id=? AND status='oczekuje'",
      [gildia_id, postacId]
    );
    if (pending) return res.json({ ok:false, error:'Już złożyłeś podanie do tej gildii' });

    await db.query(
      'INSERT INTO gildia_podania (gildia_id,postac_id,postac_nazwa,tresc) VALUES (?,?,?,?)',
      [gildia_id, postacId, postac.nazwa, String(tresc||'').slice(0,500)]
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.get('/guild/applications', requireSession, async (req, res, next) => {
  try {
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [req.session.postacId]);
    if (!my || !['mistrz','oficer'].includes(my.ranga)) return res.json({ ok:false, error:'Brak uprawnień' });
    const [apps] = await db.query(
      "SELECT * FROM gildia_podania WHERE gildia_id=? AND status='oczekuje' ORDER BY data DESC",
      [my.gildia_id]
    );
    res.json(apps);
  } catch(e) { next(e); }
});

router.get('/guild/applications/my', requireSession, async (req, res, next) => {
  try {
    const [apps] = await db.query(
      'SELECT gp.*, g.nazwa AS gildia_nazwa FROM gildia_podania gp JOIN gilde g ON gp.gildia_id=g.id WHERE gp.postac_id=? ORDER BY gp.data DESC',
      [req.session.postacId]
    );
    res.json(apps);
  } catch(e) { next(e); }
});

router.post('/guild/applications/:id/accept', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || !['mistrz','oficer'].includes(my.ranga)) return res.json({ ok:false, error:'Brak uprawnień' });

    const [[app]] = await db.query(
      "SELECT * FROM gildia_podania WHERE id=? AND gildia_id=? AND status='oczekuje'",
      [req.params.id, my.gildia_id]
    );
    if (!app) return res.json({ ok:false, error:'Nie znaleziono podania' });

    // Check if applicant already in a guild
    const [[alreadyIn]] = await db.query('SELECT id FROM gildia_czlonkowie WHERE postac_id=?', [app.postac_id]);
    if (alreadyIn) {
      await db.query("UPDATE gildia_podania SET status='odrzucono' WHERE id=?", [app.id]);
      return res.json({ ok:false, error:'Gracz już należy do gildii' });
    }

    await db.query('INSERT INTO gildia_czlonkowie (gildia_id,postac_id,ranga) VALUES (?,?,?)', [my.gildia_id, app.postac_id, 'czlonek']);
    await db.query("UPDATE gildia_podania SET status='zaakceptowano' WHERE id=?", [app.id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.post('/guild/applications/:id/reject', requireSession, async (req, res, next) => {
  try {
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [req.session.postacId]);
    if (!my || !['mistrz','oficer'].includes(my.ranga)) return res.json({ ok:false, error:'Brak uprawnień' });
    await db.query(
      "UPDATE gildia_podania SET status='odrzucono' WHERE id=? AND gildia_id=?",
      [req.params.id, my.gildia_id]
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

// ── GUILD RANKING ─────────────────────────────────────────────────────────────
router.get('/guild/ranking', requireSession, async (req, res, next) => {
  try {
    const [guilds] = await db.query(`
      SELECT g.id, g.nazwa, g.tag, g.lvl, g.gildia_exp, g.terytorium_mapa,
             COUNT(gc.postac_id) AS member_count,
             (COUNT(gc.postac_id) * 10 + FLOOR(g.gildia_exp / 1000)) AS score
      FROM gilde g
      LEFT JOIN gildia_czlonkowie gc ON gc.gildia_id=g.id
      GROUP BY g.id
      ORDER BY score DESC LIMIT 20
    `);
    res.json(guilds);
  } catch(e) { next(e); }
});

// ── MEMBER CONTRIBUTIONS ──────────────────────────────────────────────────────
router.get('/guild/contributions', requireSession, async (req, res, next) => {
  try {
    const [[my]] = await db.query('SELECT gildia_id FROM gildia_czlonkowie WHERE postac_id=?', [req.session.postacId]);
    if (!my) return res.json([]);
    const [members] = await db.query(
      `SELECT gc.id, gc.postac_id, gc.ranga, gc.wklad_gold, gc.wklad_kills, gc.wklad_exp,
              gc.data_dolaczenia, gc.niestandardowa_ranga, p.nazwa, p.poziom, p.profesja, p.obrazek, p.zalogowany
       FROM gildia_czlonkowie gc JOIN postac p ON gc.postac_id=p.id
       WHERE gc.gildia_id=? ORDER BY gc.wklad_exp DESC`,
      [my.gildia_id]
    );
    res.json(members);
  } catch(e) { next(e); }
});

// ── GUILD WARS ────────────────────────────────────────────────────────────────
router.post('/guild/war/declare', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const { target_guild_id } = req.body;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });
    if (my.gildia_id === target_guild_id) return res.json({ ok:false, error:'Nie możesz wypowiedzieć wojny własnej gildii' });

    const [[guild]] = await db.query('SELECT id,nazwa,skarbiec FROM gilde WHERE id=?', [my.gildia_id]);
    if (guild.skarbiec < 500) return res.json({ ok:false, error:'Potrzebujesz 500 złota w skarbcu' });

    const [[target]] = await db.query('SELECT id,nazwa FROM gilde WHERE id=?', [target_guild_id]);
    if (!target) return res.json({ ok:false, error:'Gildia nie istnieje' });

    // Check no active war between them
    const [[existingWar]] = await db.query(
      "SELECT id FROM gildia_wojny WHERE status='aktywna' AND ((gildia_atakujaca=? AND gildia_broniac=?) OR (gildia_atakujaca=? AND gildia_broniac=?))",
      [my.gildia_id, target_guild_id, target_guild_id, my.gildia_id]
    );
    if (existingWar) return res.json({ ok:false, error:'Już toczy się wojna między tymi gildiami' });

    await db.query('UPDATE gilde SET skarbiec=skarbiec-500 WHERE id=?', [my.gildia_id]);
    await db.query(
      'INSERT INTO gildia_wojny (gildia_atakujaca,nazwa_atakujacej,gildia_broniac,nazwa_broniacej) VALUES (?,?,?,?)',
      [my.gildia_id, guild.nazwa, target_guild_id, target.nazwa]
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.get('/guild/war/active', requireSession, async (req, res, next) => {
  try {
    const [[my]] = await db.query('SELECT gildia_id FROM gildia_czlonkowie WHERE postac_id=?', [req.session.postacId]);
    if (!my) return res.json([]);
    const [wars] = await db.query(
      "SELECT * FROM gildia_wojny WHERE status='aktywna' AND (gildia_atakujaca=? OR gildia_broniac=?) ORDER BY data_start DESC",
      [my.gildia_id, my.gildia_id]
    );
    res.json(wars);
  } catch(e) { next(e); }
});

router.post('/guild/war/end/:warId', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });

    const [[war]] = await db.query(
      "SELECT * FROM gildia_wojny WHERE id=? AND status='aktywna' AND (gildia_atakujaca=? OR gildia_broniac=?)",
      [req.params.warId, my.gildia_id, my.gildia_id]
    );
    if (!war) return res.json({ ok:false, error:'Nie znaleziono wojny' });

    await db.query(
      "UPDATE gildia_wojny SET status='zakonczona', data_koniec=NOW() WHERE id=?",
      [war.id]
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.get('/guild/war/history', requireSession, async (req, res, next) => {
  try {
    const [[my]] = await db.query('SELECT gildia_id FROM gildia_czlonkowie WHERE postac_id=?', [req.session.postacId]);
    if (!my) return res.json([]);
    const [wars] = await db.query(
      "SELECT * FROM gildia_wojny WHERE status='zakonczona' AND (gildia_atakujaca=? OR gildia_broniac=?) ORDER BY data_koniec DESC LIMIT 20",
      [my.gildia_id, my.gildia_id]
    );
    res.json(wars);
  } catch(e) { next(e); }
});

// Guild war kill tracking helper (called internally from combat)
async function trackGuildWarKill(attackerGuildId, defenderGuildId) {
  try {
    await db.query(
      "UPDATE gildia_wojny SET punkty_atakujaca=punkty_atakujaca+1 WHERE status='aktywna' AND gildia_atakujaca=? AND gildia_broniac=?",
      [attackerGuildId, defenderGuildId]
    );
    // Also track defender kills if they killed an attacker
    await db.query(
      "UPDATE gildia_wojny SET punkty_broniac=punkty_broniac+1 WHERE status='aktywna' AND gildia_atakujaca=? AND gildia_broniac=?",
      [defenderGuildId, attackerGuildId]
    );
  } catch (e) { logError('social:650')(e); }
}

// ── GUILD QUESTS ──────────────────────────────────────────────────────────────
router.post('/guild/quest/create', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });

    // Check no active quest
    const [[active]] = await db.query("SELECT id FROM gildia_misje WHERE gildia_id=? AND status='aktywna'", [my.gildia_id]);
    if (active) return res.json({ ok:false, error:'Gildia ma już aktywną misję' });

    const { nazwa, opis, typ, cel_ilosc, nagroda_gold, nagroda_exp, hours } = req.body;
    const dataKoniec = hours ? new Date(Date.now() + hours * 3600000).toISOString().slice(0,19).replace('T',' ') : null;
    const [r] = await db.query(
      'INSERT INTO gildia_misje (gildia_id,nazwa,opis,typ,cel_ilosc,nagroda_gold,nagroda_exp,data_koniec) VALUES (?,?,?,?,?,?,?,?)',
      [my.gildia_id, nazwa||'Misja gildii', opis||'', typ||'kill', cel_ilosc||100, nagroda_gold||500, nagroda_exp||200, dataKoniec]
    );
    res.json({ ok:true, id: r.insertId });
  } catch(e) { next(e); }
});

router.get('/guild/quest/active', requireSession, async (req, res, next) => {
  try {
    const [[my]] = await db.query('SELECT gildia_id FROM gildia_czlonkowie WHERE postac_id=?', [req.session.postacId]);
    if (!my) return res.json(null);
    const [[quest]] = await db.query(
      "SELECT * FROM gildia_misje WHERE gildia_id=? AND status='aktywna' ORDER BY data_start DESC LIMIT 1",
      [my.gildia_id]
    );
    res.json(quest || null);
  } catch(e) { next(e); }
});

router.post('/guild/quest/progress', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT gildia_id FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my) return res.json({ ok:false });
    const amount = parseInt(req.body.amount) || 1;
    await db.query(
      "UPDATE gildia_misje SET postep=postep+? WHERE gildia_id=? AND status='aktywna'",
      [amount, my.gildia_id]
    );
    // Auto-complete if goal reached
    await db.query(
      "UPDATE gildia_misje SET status='zakonczona' WHERE gildia_id=? AND status='aktywna' AND postep>=cel_ilosc",
      [my.gildia_id]
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.post('/guild/quest/collect', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });

    const [[quest]] = await db.query(
      "SELECT * FROM gildia_misje WHERE gildia_id=? AND status='zakonczona' ORDER BY data_start DESC LIMIT 1",
      [my.gildia_id]
    );
    if (!quest) return res.json({ ok:false, error:'Brak ukończonej misji do odebrania' });

    await db.query('UPDATE gilde SET skarbiec=skarbiec+?, gildia_exp=gildia_exp+? WHERE id=?', [quest.nagroda_gold, quest.nagroda_exp, my.gildia_id]);
    await db.query("UPDATE gildia_misje SET status='wygasla' WHERE id=?", [quest.id]);
    res.json({ ok:true, gold: quest.nagroda_gold, exp: quest.nagroda_exp });
  } catch(e) { next(e); }
});

// ── TERRITORY ─────────────────────────────────────────────────────────────────
router.post('/guild/territory/claim', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });

    const [[guild]] = await db.query('SELECT id,nazwa,skarbiec FROM gilde WHERE id=?', [my.gildia_id]);
    if (guild.skarbiec < 1000) return res.json({ ok:false, error:'Potrzebujesz 1000 złota w skarbcu' });

    const mapa_id = parseInt(req.body.mapa_id);
    if (!mapa_id) return res.json({ ok:false, error:'Nieprawidłowe ID mapy' });

    // Check if already claimed
    const [[existing]] = await db.query('SELECT gildia_id FROM gildia_terytorium WHERE mapa_id=?', [mapa_id]);
    if (existing) return res.json({ ok:false, error:'Mapa już jest zajęta przez inną gildię' });

    await db.query('UPDATE gilde SET skarbiec=skarbiec-1000 WHERE id=?', [my.gildia_id]);
    await db.query(
      'INSERT INTO gildia_terytorium (mapa_id,gildia_id,gildia_nazwa) VALUES (?,?,?) ON DUPLICATE KEY UPDATE gildia_id=?, gildia_nazwa=?, data_zajecia=NOW()',
      [mapa_id, my.gildia_id, guild.nazwa, my.gildia_id, guild.nazwa]
    );
    await db.query('UPDATE gilde SET terytorium_mapa=? WHERE id=?', [mapa_id, my.gildia_id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.post('/guild/territory/abandon', requireSession, async (req, res, next) => {
  try {
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [req.session.postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });
    await db.query('DELETE FROM gildia_terytorium WHERE gildia_id=?', [my.gildia_id]);
    await db.query('UPDATE gilde SET terytorium_mapa=0 WHERE id=?', [my.gildia_id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.get('/guild/territory/all', requireSession, async (req, res, next) => {
  try {
    const [territories] = await db.query('SELECT * FROM gildia_terytorium ORDER BY data_zajecia DESC');
    res.json(territories);
  } catch(e) { next(e); }
});

// ── GUILD BUFFS ───────────────────────────────────────────────────────────────
router.get('/guild/buffs', requireSession, async (req, res, next) => {
  try {
    const [[my]] = await db.query('SELECT gildia_id FROM gildia_czlonkowie WHERE postac_id=?', [req.session.postacId]);
    if (!my) return res.json(null);
    const [[buffs]] = await db.query('SELECT * FROM gildia_bonusy WHERE gildia_id=?', [my.gildia_id]);
    if (!buffs) {
      // Return default zeros
      return res.json({ gildia_id: my.gildia_id, bonus_exp:0, bonus_healing:0, bonus_crit:0, bonus_defense:0 });
    }
    res.json(buffs);
  } catch(e) { next(e); }
});

const BUFF_MAX = { bonus_exp:15, bonus_healing:10, bonus_crit:5, bonus_defense:10 };
const BUFF_STEP = { bonus_exp:5, bonus_healing:5, bonus_crit:2, bonus_defense:2 };
function buffUpgradeCost(currentLevel) {
  if (currentLevel < 1) return 500;
  if (currentLevel < 2) return 1500;
  return 3000;
}

router.post('/guild/buffs/upgrade', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || !['mistrz','oficer'].includes(my.ranga)) return res.json({ ok:false, error:'Brak uprawnień' });

    const type = req.body.type;
    const validTypes = ['bonus_exp','bonus_healing','bonus_crit','bonus_defense'];
    if (!validTypes.includes(type)) return res.json({ ok:false, error:'Nieprawidłowy typ bonusu' });

    // Ensure row exists
    await db.query('INSERT IGNORE INTO gildia_bonusy (gildia_id) VALUES (?)', [my.gildia_id]);
    const [[buffs]] = await db.query('SELECT * FROM gildia_bonusy WHERE gildia_id=?', [my.gildia_id]);

    const current = buffs[type] || 0;
    const max = BUFF_MAX[type];
    if (current >= max) return res.json({ ok:false, error:'Osiągnięto maksymalny poziom' });

    // Cost is based on current level relative to step size
    const costLevel = Math.floor(current / BUFF_STEP[type]);
    const cost = buffUpgradeCost(costLevel);

    const [[guild]] = await db.query('SELECT skarbiec FROM gilde WHERE id=?', [my.gildia_id]);
    if (guild.skarbiec < cost) return res.json({ ok:false, error:`Potrzebujesz ${cost} złota w skarbcu` });

    const newVal = Math.min(max, current + BUFF_STEP[type]);
    await db.query('UPDATE gilde SET skarbiec=skarbiec-? WHERE id=?', [cost, my.gildia_id]);
    await db.query(`UPDATE gildia_bonusy SET ${type}=? WHERE gildia_id=?`, [newVal, my.gildia_id]);
    res.json({ ok:true, newValue: newVal, cost });
  } catch(e) { next(e); }
});

// ── ALLIANCES & HOSTILITIES ───────────────────────────────────────────────────
router.post('/guild/relation', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });

    const { target_guild_id, typ } = req.body;
    if (!['przymierze','wrogosc'].includes(typ)) return res.json({ ok:false, error:'Nieprawidłowy typ relacji' });
    if (my.gildia_id === parseInt(target_guild_id)) return res.json({ ok:false, error:'Nie możesz ustawić relacji z własną gildią' });

    const [[myGuild]] = await db.query('SELECT nazwa FROM gilde WHERE id=?', [my.gildia_id]);
    const [[target]] = await db.query('SELECT id,nazwa FROM gilde WHERE id=?', [target_guild_id]);
    if (!target) return res.json({ ok:false, error:'Gildia nie istnieje' });

    // Ensure g1 < g2 for uniqueness
    const g1 = Math.min(my.gildia_id, target_guild_id);
    const g2 = Math.max(my.gildia_id, target_guild_id);
    const g1n = g1 === my.gildia_id ? myGuild.nazwa : target.nazwa;
    const g2n = g2 === my.gildia_id ? myGuild.nazwa : target.nazwa;

    await db.query(
      'INSERT INTO gildia_relacje (gildia1_id,gildia1_nazwa,gildia2_id,gildia2_nazwa,typ) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE typ=?, gildia1_nazwa=?, gildia2_nazwa=?',
      [g1, g1n, g2, g2n, typ, typ, g1n, g2n]
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.delete('/guild/relation/:targetGuildId', requireSession, async (req, res, next) => {
  try {
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [req.session.postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });
    const tId = parseInt(req.params.targetGuildId);
    const g1 = Math.min(my.gildia_id, tId);
    const g2 = Math.max(my.gildia_id, tId);
    await db.query('DELETE FROM gildia_relacje WHERE gildia1_id=? AND gildia2_id=?', [g1, g2]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.get('/guild/relations', requireSession, async (req, res, next) => {
  try {
    const [[my]] = await db.query('SELECT gildia_id FROM gildia_czlonkowie WHERE postac_id=?', [req.session.postacId]);
    if (!my) return res.json([]);
    const [relations] = await db.query(
      'SELECT * FROM gildia_relacje WHERE gildia1_id=? OR gildia2_id=? ORDER BY data DESC',
      [my.gildia_id, my.gildia_id]
    );
    res.json(relations);
  } catch(e) { next(e); }
});

// ── GUILD RAIDS ───────────────────────────────────────────────────────────────
router.post('/guild/raid/start', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });

    const [[active]] = await db.query("SELECT id FROM gildia_rajdy WHERE gildia_id=? AND status='aktywny'", [my.gildia_id]);
    if (active) return res.json({ ok:false, error:'Gildia ma już aktywny rajd' });

    const [[guild]] = await db.query('SELECT nazwa FROM gilde WHERE id=?', [my.gildia_id]);
    const { min_czlonkow, nagroda_gold, nagroda_exp } = req.body;

    const [r] = await db.query(
      'INSERT INTO gildia_rajdy (gildia_id,gildia_nazwa,min_czlonkow,nagroda_gold,nagroda_exp,uczestnicy) VALUES (?,?,?,?,?,?)',
      [my.gildia_id, guild.nazwa, min_czlonkow||3, nagroda_gold||1000, nagroda_exp||500, JSON.stringify([postacId])]
    );
    res.json({ ok:true, id: r.insertId });
  } catch(e) { next(e); }
});

router.post('/guild/raid/join/:raidId', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT gildia_id FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my) return res.json({ ok:false, error:'Nie należysz do gildii' });

    const [[raid]] = await db.query("SELECT * FROM gildia_rajdy WHERE id=? AND gildia_id=? AND status='aktywny'", [req.params.raidId, my.gildia_id]);
    if (!raid) return res.json({ ok:false, error:'Nie znaleziono rajdu' });

    const uczestnicy = JSON.parse(raid.uczestnicy || '[]');
    if (uczestnicy.includes(postacId)) return res.json({ ok:false, error:'Już dołączyłeś do rajdu' });
    uczestnicy.push(postacId);

    await db.query('UPDATE gildia_rajdy SET uczestnicy=? WHERE id=?', [JSON.stringify(uczestnicy), raid.id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.post('/guild/raid/complete/:raidId', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[my]] = await db.query('SELECT * FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!my || my.ranga !== 'mistrz') return res.json({ ok:false, error:'Brak uprawnień' });

    const [[raid]] = await db.query("SELECT * FROM gildia_rajdy WHERE id=? AND gildia_id=? AND status='aktywny'", [req.params.raidId, my.gildia_id]);
    if (!raid) return res.json({ ok:false, error:'Nie znaleziono rajdu' });

    const uczestnicy = JSON.parse(raid.uczestnicy || '[]');
    if (uczestnicy.length < raid.min_czlonkow) {
      return res.json({ ok:false, error:`Potrzebujesz co najmniej ${raid.min_czlonkow} uczestników` });
    }

    // Distribute rewards
    const goldPerMember = Math.floor(raid.nagroda_gold / uczestnicy.length);
    const expPerMember = Math.floor(raid.nagroda_exp / uczestnicy.length);
    for (const uid of uczestnicy) {
      await db.query('UPDATE postac SET zloto=zloto+?, exp=exp+? WHERE id=?', [goldPerMember, expPerMember, uid]).catch(logError('social:931'));
    }

    await db.query("UPDATE gildia_rajdy SET status='zakończony', data_koniec=NOW() WHERE id=?", [raid.id]);
    res.json({ ok:true, goldPerMember, expPerMember, members: uczestnicy.length });
  } catch(e) { next(e); }
});

router.get('/guild/raid/active', requireSession, async (req, res, next) => {
  try {
    const [[my]] = await db.query('SELECT gildia_id FROM gildia_czlonkowie WHERE postac_id=?', [req.session.postacId]);
    if (!my) return res.json(null);
    const [[raid]] = await db.query("SELECT * FROM gildia_rajdy WHERE gildia_id=? AND status='aktywny' ORDER BY data_start DESC LIMIT 1", [my.gildia_id]);
    res.json(raid || null);
  } catch(e) { next(e); }
});

// ── GUILD SUCCESSION ──────────────────────────────────────────────────────────
async function checkGuildSuccession(dbConn) {
  try {
    // Find guilds where master has been offline for 7+ days
    // Check if postac has ostatnie_logowanie column first
    const [cols] = await dbConn.query("SHOW COLUMNS FROM postac LIKE 'ostatnie_logowanie'");
    if (cols.length === 0) return; // Column doesn't exist, skip

    const [guilds] = await dbConn.query(`
      SELECT gc.gildia_id, gc.postac_id AS mistrz_postac_id
      FROM gildia_czlonkowie gc
      JOIN postac p ON p.id = gc.postac_id
      WHERE gc.ranga = 'mistrz'
        AND (p.ostatnie_logowanie IS NULL OR p.ostatnie_logowanie < DATE_SUB(NOW(), INTERVAL 7 DAY))
    `);

    for (const g of guilds) {
      // Find oldest officer to promote
      const [[officer]] = await dbConn.query(
        "SELECT postac_id FROM gildia_czlonkowie WHERE gildia_id=? AND ranga='oficer' ORDER BY data_dolaczenia ASC LIMIT 1",
        [g.gildia_id]
      );
      if (!officer) continue;

      await dbConn.query("UPDATE gildia_czlonkowie SET ranga='czlonek' WHERE postac_id=? AND gildia_id=?", [g.mistrz_postac_id, g.gildia_id]);
      await dbConn.query("UPDATE gildia_czlonkowie SET ranga='mistrz' WHERE postac_id=? AND gildia_id=?", [officer.postac_id, g.gildia_id]);
      await dbConn.query('UPDATE gilde SET mistrz_id=? WHERE id=?', [officer.postac_id, g.gildia_id]);
    }
  } catch(e) {
    console.error('Guild succession check error:', e.message);
  }
}

// ── WIADOMOŚCI PRYWATNE ───────────────────────────────────────────────────────
router.get('/messages', requireSession, async (req, res, next) => {
  try {
    const [msgs] = await db.query(
      `SELECT w.*, p.nazwa AS od_nazwa, p.obrazek AS od_obrazek
       FROM wiadomosci w JOIN postac p ON w.od_id=p.id
       WHERE w.do_id=? ORDER BY w.data DESC LIMIT 50`,
      [req.session.postacId]
    );
    res.json(msgs);
  } catch(e) { next(e); }
});

router.get('/messages/unread-count', requireSession, async (req, res, next) => {
  try {
    const [[{ cnt }]] = await db.query(
      'SELECT COUNT(*) AS cnt FROM wiadomosci WHERE do_id=? AND przeczytana=0',
      [req.session.postacId]
    );
    res.json({ count: cnt });
  } catch(e) { next(e); }
});

router.post('/messages/send', requireSession, async (req, res, next) => {
  try {
    const { toId, tresc } = req.body;
    const fromId = req.session.postacId;
    if (!toId || !tresc?.trim()) return res.json({ ok:false, error:'Brak danych' });
    if (toId === fromId) return res.json({ ok:false, error:'Nie możesz pisać do siebie' });
    const [[target]] = await db.query('SELECT id, nazwa FROM postac WHERE id=?', [toId]);
    if (!target) return res.json({ ok:false, error:'Gracz nie istnieje' });
    await db.query('INSERT INTO wiadomosci (od_id,do_id,tresc) VALUES (?,?,?)', [fromId, toId, tresc.trim().slice(0,500)]);
    res.json({ ok:true, toName: target.nazwa });
  } catch(e) { next(e); }
});

router.post('/messages/read', requireSession, async (req, res, next) => {
  try {
    const { messageId } = req.body;
    await db.query('UPDATE wiadomosci SET przeczytana=1 WHERE id=? AND do_id=?', [messageId, req.session.postacId]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.post('/messages/read-all', requireSession, async (req, res, next) => {
  try {
    await db.query('UPDATE wiadomosci SET przeczytana=1 WHERE do_id=?', [req.session.postacId]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

// ── ZNAJOMI ───────────────────────────────────────────────────────────────────
router.get('/friends', requireSession, async (req, res, next) => {
  try {
    const [friends] = await db.query(
      `SELECT p.id, p.nazwa, p.poziom, p.profesja, p.obrazek, p.zalogowany
       FROM przyjaciele f JOIN postac p ON f.przyjaciel=p.id
       WHERE f.postac=? ORDER BY p.zalogowany DESC, p.nazwa`,
      [req.session.postacId]
    );
    res.json(friends);
  } catch(e) { next(e); }
});

router.post('/friends/add', requireSession, async (req, res, next) => {
  try {
    const { targetId } = req.body;
    const postacId = req.session.postacId;
    if (targetId === postacId) return res.json({ ok:false, error:'Nie możesz dodać siebie' });
    const [[target]] = await db.query('SELECT id,nazwa FROM postac WHERE id=?', [targetId]);
    if (!target) return res.json({ ok:false, error:'Gracz nie istnieje' });
    await db.query('INSERT IGNORE INTO przyjaciele (postac,przyjaciel) VALUES (?,?)', [postacId, targetId]);
    res.json({ ok:true, name: target.nazwa });
  } catch(e) { next(e); }
});

router.post('/friends/remove', requireSession, async (req, res, next) => {
  try {
    const { targetId } = req.body;
    await db.query('DELETE FROM przyjaciele WHERE postac=? AND przyjaciel=?', [req.session.postacId, targetId]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

// ── TERRITORIAL TAX INCOME ────────────────────────────────────────────────────
router.get('/guild/territory/income', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [[gc]] = await db.query('SELECT gildia_id FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
    if (!gc) return res.json({ ok: false, error: 'Nie jesteś w gildii' });

    const [[territory]] = await db.query(
      'SELECT mapa_id, podatek_pct, przychod_total FROM gildia_terytorium WHERE gildia_id=?',
      [gc.gildia_id]
    );
    if (!territory) return res.json({ ok: true, territory: null, log: [] });

    const [log] = await db.query(
      'SELECT zrodlo, kwota, data FROM podatki_log WHERE gildia_id=? ORDER BY data DESC LIMIT 20',
      [gc.gildia_id]
    );

    res.json({ ok: true, territory, log });
  } catch (e) { next(e); }
});

module.exports = router;
module.exports.trackGuildWarKill = trackGuildWarKill;
module.exports.checkGuildSuccession = checkGuildSuccession;
