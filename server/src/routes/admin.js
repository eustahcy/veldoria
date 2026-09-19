const express      = require('express');
const { logError } = require('../game/log');
const router       = express.Router();
const db           = require('../db');
const serverConfig = require('../game/serverConfig');
const { giveItem } = require('../game/inventory');

// ── Auth middleware ────────────────────────────────────────────────────────────
async function requireAdmin(req, res, next) {
  if (!req.session.postacId && !req.session.adminPostacId) {
    return res.status(401).json({ error: 'Nie zalogowany' });
  }
  try {
    const id = req.session.postacId || req.session.adminPostacId;
    if (!id) return res.status(401).json({ error: 'Brak sesji postaci' });
    const [[p]] = await db.query('SELECT id, nazwa, ranga FROM postac WHERE id=?', [id]);
    if (!p || p.ranga !== 'GameAdmin') return res.status(403).json({ error: 'Brak uprawnień' });
    req.adminPostac = p;
    next();
  } catch(e) { next(e); }
}

// Helper to log admin actions
function adminLog(req, action, target, details) {
  if (!req.adminPostac) return;
  serverConfig.log(db, req.adminPostac.id, req.adminPostac.nazwa, action, target, details).catch(logError('admin:26'));
}

// ── SERVER CONFIG ─────────────────────────────────────────────────────────────
router.get('/server-config', requireAdmin, (req, res) => {
  res.json(serverConfig.getAll());
});

router.post('/server-config', requireAdmin, async (req, res, next) => {
  try {
    const { changes } = req.body; // { key: value, ... }
    if (!changes || typeof changes !== 'object') return res.status(400).json({ error: 'Brak danych' });
    await serverConfig.setMany(db, changes, req.adminPostac.id, req.adminPostac.nazwa);
    adminLog(req, 'config_update', 'server_config', JSON.stringify(changes).slice(0, 200));
    res.json({ ok: true, config: serverConfig.getAll() });
  } catch(e) { next(e); }
});

// ── SERVER STATUS ─────────────────────────────────────────────────────────────
router.get('/server-status', requireAdmin, async (req, res, next) => {
  try {
    const [[{ total }]]   = await db.query('SELECT COUNT(*) AS total FROM postac');
    const [[{ online }]]  = await db.query('SELECT COUNT(*) AS online FROM postac WHERE zalogowany=1');
    const [[{ banned }]]  = await db.query('SELECT COUNT(*) AS banned FROM postac WHERE ban=1');
    const [[{ accounts }]]= await db.query('SELECT COUNT(*) AS accounts FROM accounts');
    const [[{ mobs }]]    = await db.query('SELECT COUNT(*) AS mobs FROM mob');
    const [[{ deadMobs }]]= await db.query('SELECT COUNT(*) AS deadMobs FROM mob WHERE zycie<=0');
    const [[{ msgs }]]    = await db.query('SELECT COUNT(*) AS msgs FROM chat');
    const [[{ maps }]]    = await db.query('SELECT COUNT(*) AS maps FROM mapa');
    const uptime = Math.floor(process.uptime());
    const mem    = process.memoryUsage();
    res.json({
      total, online, banned, accounts,
      mobs, deadMobs, msgs, maps,
      uptime, memMB: Math.round(mem.heapUsed / 1024 / 1024),
      config: {
        name: serverConfig.get('server_name'),
        maintenance: serverConfig.getBool('maintenance_mode'),
        xp: serverConfig.getNum('xp_multiplier'),
        loot: serverConfig.getNum('loot_chance'),
      },
    });
  } catch(e) { next(e); }
});

// ── SERVERS (multi-server management) ────────────────────────────────────────
router.get('/servers', requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM servers ORDER BY id');
    res.json(rows);
  } catch(e) { next(e); }
});

router.post('/servers', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, port, config } = req.body;
    if (!name) return res.status(400).json({ error: 'Brak nazwy' });
    const [r] = await db.query(
      `INSERT INTO servers (name, description, status, port, config) VALUES (?,?,?,?,?)`,
      [name, description||'', 'offline', port||3003, JSON.stringify(config||{})]
    );
    adminLog(req, 'server_create', name, `port=${port}`);
    res.json({ ok: true, id: r.insertId });
  } catch(e) { next(e); }
});

router.patch('/servers/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, status, port, config } = req.body;
    const fields = [], vals = [];
    if (name        !== undefined) { fields.push('name=?');        vals.push(name); }
    if (description !== undefined) { fields.push('description=?'); vals.push(description); }
    if (status      !== undefined) { fields.push('status=?');      vals.push(status); }
    if (port        !== undefined) { fields.push('port=?');        vals.push(port); }
    if (config      !== undefined) { fields.push('config=?');      vals.push(JSON.stringify(config)); }
    if (!fields.length) return res.status(400).json({ error: 'Brak zmian' });
    vals.push(req.params.id);
    await db.query(`UPDATE servers SET ${fields.join(',')} WHERE id=?`, vals);
    adminLog(req, 'server_update', req.params.id, fields.join(','));
    res.json({ ok: true });
  } catch(e) { next(e); }
});

router.delete('/servers/:id', requireAdmin, async (req, res, next) => {
  try {
    if (req.params.id === '1') return res.status(400).json({ error: 'Nie można usunąć głównego serwera' });
    await db.query('DELETE FROM servers WHERE id=?', [req.params.id]);
    adminLog(req, 'server_delete', req.params.id);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// ── PLAYERS ───────────────────────────────────────────────────────────────────
router.get('/players', requireAdmin, async (req, res, next) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    const cols = 'id,nazwa,poziom,profesja,ranga,ban,zalogowany,mapa,x,y,zycie,zycie_max,zloto,exp,prestige';
    const [rows] = search
      ? await db.query(`SELECT ${cols} FROM postac WHERE nazwa LIKE ? ORDER BY zalogowany DESC,id LIMIT 100`, [search])
      : await db.query(`SELECT ${cols} FROM postac ORDER BY zalogowany DESC,id LIMIT 100`);
    res.json(rows);
  } catch(e) { next(e); }
});

router.post('/ban/:id', requireAdmin, async (req, res, next) => {
  try {
    const [[t]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [req.params.id]);
    await db.query('UPDATE postac SET ban=1,zalogowany=0 WHERE id=?', [req.params.id]);
    adminLog(req, 'ban', t?.nazwa, req.body.reason || '');
    res.json({ ok: true });
  } catch(e) { next(e); }
});

router.post('/unban/:id', requireAdmin, async (req, res, next) => {
  try {
    const [[t]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [req.params.id]);
    await db.query('UPDATE postac SET ban=0 WHERE id=?', [req.params.id]);
    adminLog(req, 'unban', t?.nazwa);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

router.post('/kick/:id', requireAdmin, async (req, res, next) => {
  try {
    const [[t]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [req.params.id]);
    await db.query('UPDATE postac SET zalogowany=0 WHERE id=?', [req.params.id]);
    adminLog(req, 'kick', t?.nazwa);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

router.post('/set-rank', requireAdmin, async (req, res, next) => {
  try {
    const { id, ranga } = req.body;
    const valid = ['Gracz','Moderator','GameMaster','GameAdmin'];
    if (!valid.includes(ranga)) return res.status(400).json({ error: 'Nieprawidłowa ranga' });
    const [[t]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [id]);
    await db.query('UPDATE postac SET ranga=? WHERE id=?', [ranga, id]);
    adminLog(req, 'set_rank', t?.nazwa, ranga);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

router.post('/teleport', requireAdmin, async (req, res, next) => {
  try {
    const { id, mapa, x, y } = req.body;
    const [[t]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [id]);
    await db.query('UPDATE postac SET mapa=?,x=?,y=? WHERE id=?', [mapa, x, y, id]);
    adminLog(req, 'teleport', t?.nazwa, `map=${mapa} x=${x} y=${y}`);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// Teleport admin himself to map/coords
router.post('/teleport-self', requireAdmin, async (req, res, next) => {
  try {
    const { mapa, x, y } = req.body;
    const id = req.adminPostac.id;
    await db.query('UPDATE postac SET mapa=?,x=?,y=? WHERE id=?', [mapa, x, y, id]);
    adminLog(req, 'teleport_self', req.adminPostac.nazwa, `map=${mapa} x=${x} y=${y}`);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// Teleport admin to a specific player's position
router.post('/goto-player', requireAdmin, async (req, res, next) => {
  try {
    const { targetId } = req.body;
    const adminId = req.adminPostac.id;
    const [[target]] = await db.query('SELECT nazwa, mapa, x, y FROM postac WHERE id=?', [targetId]);
    if (!target) return res.status(404).json({ error: 'Gracz nie znaleziony' });
    await db.query('UPDATE postac SET mapa=?,x=?,y=? WHERE id=?', [target.mapa, target.x, target.y, adminId]);
    adminLog(req, 'goto_player', target.nazwa, `map=${target.mapa} x=${target.x} y=${target.y}`);
    res.json({ ok: true, mapa: target.mapa });
  } catch(e) { next(e); }
});

// Teleport a player to admin's current position
router.post('/pull-player', requireAdmin, async (req, res, next) => {
  try {
    const { targetId } = req.body;
    const [[admin]] = await db.query('SELECT mapa, x, y FROM postac WHERE id=?', [req.adminPostac.id]);
    const [[target]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [targetId]);
    if (!admin || !target) return res.status(404).json({ error: 'Nie znaleziono' });
    await db.query('UPDATE postac SET mapa=?,x=?,y=? WHERE id=?', [admin.mapa, admin.x, admin.y, targetId]);
    adminLog(req, 'pull_player', target.nazwa, `to map=${admin.mapa} x=${admin.x} y=${admin.y}`);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

router.post('/give-gold', requireAdmin, async (req, res, next) => {
  try {
    const { id, amount } = req.body;
    const [[t]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [id]);
    await db.query('UPDATE postac SET zloto=zloto+? WHERE id=?', [amount, id]);
    adminLog(req, 'give_gold', t?.nazwa, `+${amount}g`);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

router.post('/give-exp', requireAdmin, async (req, res, next) => {
  try {
    const { id, amount } = req.body;
    const [[t]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [id]);
    await db.query('UPDATE postac SET exp=exp+? WHERE id=?', [amount, id]);
    adminLog(req, 'give_exp', t?.nazwa, `+${amount}xp`);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

router.post('/set-level', requireAdmin, async (req, res, next) => {
  try {
    const { id, level } = req.body;
    if (level < 1 || level > 500) return res.status(400).json({ error: 'Nieprawidłowy poziom' });
    const [[t]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [id]);
    const newExp = Math.pow(level-1, 4) + 10;
    await db.query('UPDATE postac SET poziom=?, exp=? WHERE id=?', [level, newExp, id]);
    adminLog(req, 'set_level', t?.nazwa, `lvl=${level}`);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

router.post('/set-class', requireAdmin, async (req, res, next) => {
  try {
    const { id, profesja } = req.body;
    const KLASY = ['Wojownik', 'Paladyn', 'Mag', 'Lowca', 'Tropiciel', 'Tancerz Ostrzy'];
    if (!KLASY.includes(profesja)) return res.status(400).json({ error: 'Nieprawidłowa klasa' });
    const [[t]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [id]);
    await db.query('UPDATE postac SET profesja=? WHERE id=?', [profesja, id]);
    adminLog(req, 'set_class', t?.nazwa, `klasa=${profesja}`);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

router.post('/set-prestige', requireAdmin, async (req, res, next) => {
  try {
    const { id, prestige } = req.body;
    const p = parseInt(prestige);
    if (isNaN(p) || p < 0 || p > 20) return res.status(400).json({ error: 'Prestige musi być 0–20' });
    const [[t]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [id]);
    const bonusPct = Math.min(50, p * 5);
    // prestige_bonus_pct may not exist in older DB schemas — try with it, fall back without
    await db.query('UPDATE postac SET prestige=?, prestige_bonus_pct=? WHERE id=?', [p, bonusPct, id])
      .catch(() => db.query('UPDATE postac SET prestige=? WHERE id=?', [p, id]));
    adminLog(req, 'set_prestige', t?.nazwa, `prestige=${p}`);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

router.post('/heal-player', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.body;
    const [[t]] = await db.query('SELECT nazwa, zycie_max FROM postac WHERE id=?', [id]);
    await db.query('UPDATE postac SET zycie=zycie_max WHERE id=?', [id]);
    adminLog(req, 'heal', t?.nazwa);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// ── MOBS ──────────────────────────────────────────────────────────────────────
router.get('/mobs/:mapaId', requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM mob WHERE mapa=? ORDER BY id', [req.params.mapaId]);
    res.json(rows);
  } catch(e) { next(e); }
});

router.post('/reset-mobs', requireAdmin, async (req, res, next) => {
  try {
    const { mapaId } = req.body;
    await db.query('UPDATE mob SET zycie=zycie_max,respawn=0 WHERE mapa=?', [mapaId]);
    adminLog(req, 'reset_mobs', `map=${mapaId}`);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

router.post('/reset-all-mobs', requireAdmin, async (req, res, next) => {
  try {
    await db.query('UPDATE mob SET zycie=zycie_max,respawn=0');
    adminLog(req, 'reset_all_mobs', 'global');
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// ── MAPS ──────────────────────────────────────────────────────────────────────
router.get('/maps', requireAdmin, async (req, res, next) => {
  try {
    const [maps] = await db.query('SELECT id,nazwa,maks_x,maks_y,obrazek FROM mapa ORDER BY id');
    const [mobCounts] = await db.query('SELECT mapa, COUNT(*) AS cnt, SUM(zycie<=0) AS dead FROM mob GROUP BY mapa');
    const mobMap = Object.fromEntries(mobCounts.map(r => [r.mapa, { cnt:r.cnt, dead:r.dead }]));
    res.json(maps.map(m => ({ ...m, ...( mobMap[m.id] || { cnt:0, dead:0 }) })));
  } catch(e) { next(e); }
});

// ── ITEMS ─────────────────────────────────────────────────────────────────────
router.get('/items', requireAdmin, async (req, res, next) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    const [rows] = search
      ? await db.query('SELECT id,nazwa,typ,klasa,wym_poziom,wartosc_sprzedazy FROM przedmiot_loot WHERE nazwa LIKE ? LIMIT 100', [search])
      : await db.query('SELECT id,nazwa,typ,klasa,wym_poziom,wartosc_sprzedazy FROM przedmiot_loot ORDER BY id LIMIT 100');
    res.json(rows);
  } catch(e) { next(e); }
});

router.post('/give-item', requireAdmin, async (req, res, next) => {
  try {
    const { postacId, itemId } = req.body;
    const [[item]] = await db.query('SELECT * FROM przedmiot_loot WHERE id=?', [itemId]);
    if (!item) return res.status(404).json({ error: 'Brak przedmiotu' });
    const [[t]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [postacId]);
    await giveItem(db, postacId, item);
    adminLog(req, 'give_item', t?.nazwa, item.nazwa);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// ── CHAT ──────────────────────────────────────────────────────────────────────
router.get('/chat', requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM chat ORDER BY id DESC LIMIT 100');
    res.json(rows.reverse());
  } catch(e) { next(e); }
});

router.post('/clear-chat', requireAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM chat');
    adminLog(req, 'clear_chat', 'global');
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// ── BROADCAST (server announcement) ──────────────────────────────────────────
router.post('/broadcast', requireAdmin, async (req, res, next) => {
  try {
    const { message, chat = true, center = false, sound = false } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Brak wiadomości' });
    const text = message.trim().slice(0, 300);
    await serverConfig.set(db, 'announcement', text, req.adminPostac.id, req.adminPostac.nazwa);
    // Na czacie (kanał System) — zapis do historii i od razu do wszystkich zalogowanych
    const io = req.app.locals.io;
    if (chat) {
      const tresc = `📢 ${text}`;
      await db.query(
        'INSERT INTO chat (kto, tresc, mapa_id, postac_id, kanal) VALUES (?,?,?,?,?)',
        ['[SYSTEM]', tresc, 0, req.adminPostac.id, 'system']
      );
      io?.emit('chat_message', { kto: '[SYSTEM]', tresc, kanal: 'system', czas: new Date().toISOString() });
    }
    // Komunikat na środku ekranu (opcjonalnie z dźwiękiem) — dla wszystkich zalogowanych
    if (center) io?.emit('admin_announce', { message: text, sound: !!sound, from: req.adminPostac.nazwa });
    adminLog(req, 'broadcast', 'global', text.slice(0, 100));
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// ── STATS ─────────────────────────────────────────────────────────────────────
router.get('/stats', requireAdmin, async (req, res, next) => {
  try {
    const [[{ total }]]   = await db.query('SELECT COUNT(*) AS total FROM postac');
    const [[{ online }]]  = await db.query('SELECT COUNT(*) AS online FROM postac WHERE zalogowany=1');
    const [[{ banned }]]  = await db.query('SELECT COUNT(*) AS banned FROM postac WHERE ban=1');
    const [[{ mobs }]]    = await db.query('SELECT COUNT(*) AS mobs FROM mob');
    const [[{ deadMobs }]]= await db.query('SELECT COUNT(*) AS deadMobs FROM mob WHERE zycie<=0');
    const [[{ msgs }]]    = await db.query('SELECT COUNT(*) AS msgs FROM chat');
    const [[{ items }]]   = await db.query('SELECT COUNT(*) AS items FROM przedmiot_loot');
    const [[{ accounts }]]= await db.query('SELECT COUNT(*) AS accounts FROM accounts');
    res.json({ total, online, banned, mobs, deadMobs, msgs, items, accounts });
  } catch(e) { next(e); }
});

// ── AUDIT LOG ─────────────────────────────────────────────────────────────────
router.get('/audit-log', requireAdmin, async (req, res, next) => {
  try {
    const { action, admin, limit = 200 } = req.query;
    const lim = Math.min(500, parseInt(limit) || 200);
    const where = [];
    const params = [];
    if (action) { where.push('action=?'); params.push(action); }
    if (admin)  { where.push('admin_name LIKE ?'); params.push(`%${admin}%`); }
    const sql = `SELECT * FROM admin_log${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC LIMIT ?`;
    const [rows] = await db.query(sql, [...params, lim]);
    res.json(rows);
  } catch(e) { next(e); }
});

// ── PRE-GAME ADMIN ACCESS (sets session for pre-game dashboard) ───────────────
// Called after login to set admin session without selecting a character
router.post('/session-check', async (req, res, next) => {
  try {
    if (!req.session.accountId) return res.json({ isAdmin: false });
    const [chars] = await db.query(
      'SELECT id, ranga FROM postac WHERE account_id=? AND ranga="GameAdmin" LIMIT 1',
      [req.session.accountId]
    );
    if (!chars.length) return res.json({ isAdmin: false });
    // Set admin session so requireAdmin works without entering game
    req.session.adminPostacId = chars[0].id;
    res.json({ isAdmin: true, postacId: chars[0].id });
  } catch(e) { next(e); }
});

// ── PATCH player skin ─────────────────────────────────────────────────────────
router.patch('/player-skin', requireAdmin, async (req, res, next) => {
  try {
    const { postacId, obrazek } = req.body;
    if (!postacId || !obrazek) return res.status(400).json({ error: 'Brak danych' });
    // Sanitize path — no traversal
    if (obrazek.includes('..')) return res.status(400).json({ error: 'Nieprawidłowa ścieżka' });
    await db.query('UPDATE postac SET obrazek=? WHERE id=?', [obrazek, parseInt(postacId)]);
    adminLog(req, 'skin_change', postacId, obrazek);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// ── PATCH class skin (all players of given class) ─────────────────────────────
router.patch('/class-skin', requireAdmin, async (req, res, next) => {
  try {
    const { className, obrazek } = req.body;
    if (!className || !obrazek) return res.status(400).json({ error: 'Brak danych' });
    if (obrazek.includes('..')) return res.status(400).json({ error: 'Nieprawidłowa ścieżka' });
    const [result] = await db.query('UPDATE postac SET obrazek=? WHERE profesja=?', [obrazek, className]);
    adminLog(req, 'class_skin_change', className, `${obrazek} (${result.affectedRows} postaci)`);
    res.json({ ok: true, affected: result.affectedRows });
  } catch(e) { next(e); }
});

// ── PATCH mob sprite ──────────────────────────────────────────────────────────
router.patch('/mob-skin', requireAdmin, async (req, res, next) => {
  try {
    const { mobId, obrazek } = req.body;
    if (!mobId || !obrazek) return res.status(400).json({ error: 'Brak danych' });
    if (obrazek.includes('..')) return res.status(400).json({ error: 'Nieprawidłowa ścieżka' });
    await db.query('UPDATE mob SET obrazek=? WHERE id=?', [obrazek, parseInt(mobId)]);
    adminLog(req, 'mob_skin_change', mobId, obrazek);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// ── PATCH guild emblem ────────────────────────────────────────────────────────
router.patch('/guild-skin', requireAdmin, async (req, res, next) => {
  try {
    const { guildId, obrazek } = req.body;
    if (!guildId || !obrazek) return res.status(400).json({ error: 'Brak danych' });
    if (obrazek.includes('..')) return res.status(400).json({ error: 'Nieprawidłowa ścieżka' });
    await db.query('UPDATE gilde SET obrazek=? WHERE id=?', [obrazek, parseInt(guildId)]).catch(logError('admin:464'));
    adminLog(req, 'guild_skin_change', guildId, obrazek);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// ── PATCH NPC sprite ──────────────────────────────────────────────────────────
router.patch('/npc-skin', requireAdmin, async (req, res, next) => {
  try {
    const { npcId, obrazek } = req.body;
    if (!npcId || !obrazek) return res.status(400).json({ error: 'Brak danych' });
    if (obrazek.includes('..')) return res.status(400).json({ error: 'Nieprawidłowa ścieżka' });
    await db.query('UPDATE npc SET obrazek=? WHERE id=?', [obrazek, parseInt(npcId)]);
    adminLog(req, 'npc_skin_change', npcId, obrazek);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// ── HEAL ALL ──────────────────────────────────────────────────────────────────
router.post('/heal-all', requireAdmin, async (req, res, next) => {
  try {
    const [r] = await db.query('UPDATE postac SET zycie=zycie_max WHERE zalogowany=1');
    adminLog(req, 'heal_all', 'global', `${r.affectedRows} graczy`);
    res.json({ ok: true, healed: r.affectedRows });
  } catch(e) { next(e); }
});

// ── WORLD BOSS ────────────────────────────────────────────────────────────────
router.get('/boss-status', requireAdmin, async (req, res, next) => {
  try {
    const [bosses] = await db.query('SELECT * FROM world_boss ORDER BY id');
    const [[active]] = await db.query("SELECT * FROM world_boss WHERE status='aktywny' LIMIT 1");
    res.json({ bosses, active: active || null });
  } catch(e) { next(e); }
});

router.post('/spawn-boss', requireAdmin, async (req, res, next) => {
  try {
    const { bossId } = req.body;
    if (!bossId) return res.status(400).json({ error: 'Brak bossId' });

    const [[active]] = await db.query("SELECT id FROM world_boss WHERE status='aktywny' LIMIT 1");
    if (active) return res.json({ ok: false, error: 'Boss już aktywny — najpierw go zabij lub usuń' });

    const [[boss]] = await db.query('SELECT * FROM world_boss WHERE id=?', [bossId]);
    if (!boss) return res.json({ ok: false, error: 'Boss nie istnieje' });

    await db.query(
      `UPDATE world_boss SET
         status='aktywny', zycie=zycie_max,
         data_pojawienia=NOW(), data_smierci=NULL,
         data_ucieczki=DATE_ADD(NOW(), INTERVAL COALESCE(czas_zycia_min,60) MINUTE),
         aktywna_tarcza=0, tarcza_do=0,
         zdolnosci_specjalne=JSON_ARRAY(
           JSON_OBJECT('typ','sluzy','prog',0.50,'wyzwolona',0),
           JSON_OBJECT('typ','tarcza','prog',0.35,'wyzwolona',0),
           JSON_OBJECT('typ','regeneracja','prog',0.20,'wyzwolona',0)
         )
       WHERE id=?`,
      [bossId]
    );

    const io = global.margoIo;
    if (io) {
      io.emit('world_boss_spawned', { boss_id: bossId, nazwa: boss.nazwa, mapa_id: boss.mapa_id });
      io.emit('chat_message', { kto: '⚔ ADMIN', tresc: `Admin przywołał bossa ${boss.nazwa}! Macie ${boss.czas_zycia_min||60} minut!` });
    }

    adminLog(req, 'spawn_boss', boss.nazwa, `id=${bossId}`);
    res.json({ ok: true, boss: { id: boss.id, nazwa: boss.nazwa } });
  } catch(e) { next(e); }
});

router.post('/kill-boss', requireAdmin, async (req, res, next) => {
  try {
    const [[active]] = await db.query("SELECT id, nazwa FROM world_boss WHERE status='aktywny' LIMIT 1");
    if (!active) return res.json({ ok: false, error: 'Brak aktywnego bossa' });

    await db.query("UPDATE world_boss SET zycie=0, status='martwy', data_smierci=NOW() WHERE id=?", [active.id]);

    const io = global.margoIo;
    if (io) {
      io.emit('world_boss_died', { boss_id: active.id, nazwa: active.nazwa });
      io.emit('chat_message', { kto: '⚔ ADMIN', tresc: `Admin usunął bossa ${active.nazwa}.` });
    }

    adminLog(req, 'kill_boss', active.nazwa, `id=${active.id}`);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// ── EVENTS ────────────────────────────────────────────────────────────────────
router.get('/events-list', requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM eventy_sezonowe ORDER BY id');
    res.json(rows);
  } catch(e) { res.json([]); }
});

router.post('/activate-event', requireAdmin, async (req, res, next) => {
  try {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ error: 'Brak eventId' });

    const [[ev]] = await db.query('SELECT * FROM eventy_sezonowe WHERE id=?', [eventId]);
    if (!ev) return res.json({ ok: false, error: 'Event nie istnieje' });

    await db.query('UPDATE eventy_sezonowe SET aktywny=0');
    await db.query('UPDATE eventy_sezonowe SET aktywny=1 WHERE id=?', [eventId]);

    const io = global.margoIo;
    if (io) io.emit('chat_message', { kto: '🎉 SYSTEM', tresc: `Rozpoczął się event: ${ev.nazwa}!` });

    adminLog(req, 'activate_event', ev.nazwa, `id=${eventId}`);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

router.post('/deactivate-event', requireAdmin, async (req, res, next) => {
  try {
    await db.query('UPDATE eventy_sezonowe SET aktywny=0');
    const io = global.margoIo;
    if (io) io.emit('chat_message', { kto: '🎉 SYSTEM', tresc: 'Event zakończony.' });
    adminLog(req, 'deactivate_event', 'all');
    res.json({ ok: true });
  } catch(e) { next(e); }
});

module.exports = router;
