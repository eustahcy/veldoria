require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express      = require('express');
const http         = require('http');
const { Server }   = require('socket.io');
const session      = require('express-session');
const cors         = require('cors');
const path         = require('path');
const serverConfig   = require('./game/serverConfig');
const db             = require('./db');
const characterRoute = require('./routes/character');
const MySQLStore     = require('./middleware/sessionStore');
const worldCycle     = require('./game/worldCycle');
const { chatMeta } = require('./game/chatMeta');
const { logError }   = require('./game/log');
const { expireAuction } = require('./game/economy');

// Bez sekretu z .env każdy znający kod mógłby podrobić ciasteczko sesji
if (!process.env.SESSION_SECRET) {
  console.error('Brak SESSION_SECRET w server/.env — serwer nie wystartuje bez niego.');
  process.exit(1);
}

const app    = express();
const server = http.createServer(app);

// Za reverse proxy (nginx itp.) ustaw TRUST_PROXY=1 — inaczej req.ip to IP proxy
// i limiter logowania policzy wszystkich graczy razem
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);

const sessionMiddleware = session({
  store: new MySQLStore(db),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    // COOKIE_SECURE=1 po przejściu na HTTPS
    secure: process.env.COOKIE_SECURE === '1',
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
});

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'capacitor://localhost',
  'http://localhost',
  'ionic://localhost',
  null, // native app (no origin header)
];
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || ALLOWED_ORIGINS.includes(origin)),
  credentials: true,
}));
app.use(express.json());
app.use(sessionMiddleware);

app.use('/assets', express.static(path.join(__dirname, '../../original/MAEGONEM_pliki')));

app.use(express.static(path.join(__dirname, '../../client/dist')));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/game',      require('./routes/game'));
app.use('/api/combat',    require('./routes/combat'));
app.use('/api/chat',      require('./routes/chat'));
app.use('/api/items',     require('./routes/items'));
app.use('/api/character', require('./routes/character'));
app.use('/api/admin',      require('./routes/admin'));
app.use('/api/world',      require('./routes/worldEditor'));
app.use('/api/quests',     require('./routes/quests'));
const socialRouter = require('./routes/social');
app.use('/api/social', socialRouter);
app.use('/api/events', require('./routes/events'));
app.use('/api/auction', require('./routes/auction'));
app.use('/api/trade',   require('./routes/trade'));
app.use('/api/craft',   require('./routes/craft'));
app.use('/api/fishing', require('./routes/fishing'));
app.use('/api/talents', require('./routes/talents'));
app.use('/api/worldboss', require('./routes/worldboss'));
app.use('/api/dungeons',  require('./routes/dungeons'));
app.use('/api/dungeons2', require('./routes/dungeons2'));
app.use('/api/offline',  require('./routes/offline'));
app.use('/api/assets',   require('./routes/assets'));
// Run guild succession check on startup and every 12 hours
const { checkGuildSuccession } = socialRouter;
if (checkGuildSuccession) {
  checkGuildSuccession(db).catch(logError('cron:guildSuccession'));
  setInterval(() => checkGuildSuccession(db).catch(logError('cron:guildSuccession')), 12 * 60 * 60 * 1000);
}

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true },
  pingTimeout:  15000,
  pingInterval:  8000,
});

io.engine.use(sessionMiddleware);
app.locals.io = io;
const { registerTradeSocket } = require('./routes/trade');

// Init world cycle (day/night + weather)
worldCycle.init(db, io);

// Expose io globally for world boss route
global.margoIo = io;

// ── World Boss spawn — co 6 godzin, harmonogram trzymany w bazie ─────────────
// Wcześniej setInterval liczył 6h od startu procesu, więc każdy restart
// serwera przesuwał (albo kasował) najbliższy spawn.
const BOSS_TEMPLATES = [1, 2, 3];
const BOSS_SPAWN_EVERY_H = 6;

async function spawnWorldBoss(bossId) {
  // Ustaw timer ucieczki, zresetuj zdolności specjalne
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
  const [[boss]] = await db.query('SELECT nazwa, mapa_id, czas_zycia_min FROM world_boss WHERE id=?', [bossId]);
  if (boss) {
    io.emit('world_boss_spawned', { boss_id: bossId, nazwa: boss.nazwa, mapa_id: boss.mapa_id });
    io.emit('chat_message', {
      kto: '⚔ SYSTEM',
      tresc: `Boss ${boss.nazwa} pojawił się w świecie! Macie ${boss.czas_zycia_min || 60} minut!`,
    });
  }
}

async function initBossSchedule() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS world_boss_harmonogram (
      id TINYINT PRIMARY KEY,
      nastepny_spawn DATETIME NOT NULL,
      nastepny_idx INT NOT NULL DEFAULT 0
    )
  `);
  // Pierwszy start: spawn za 6h (tak jak dotychczas)
  await db.query(
    `INSERT IGNORE INTO world_boss_harmonogram (id, nastepny_spawn, nastepny_idx)
     VALUES (1, DATE_ADD(NOW(), INTERVAL ? HOUR), 0)`,
    [BOSS_SPAWN_EVERY_H]
  );
}

async function bossScheduleTick() {
  // Przejmij termin atomowo i od razu zaplanuj następny
  const [[due]] = await db.query(
    'SELECT nastepny_spawn, nastepny_idx FROM world_boss_harmonogram WHERE id=1 AND nastepny_spawn <= NOW()'
  );
  if (!due) return;
  const [claim] = await db.query(
    `UPDATE world_boss_harmonogram
     SET nastepny_spawn=DATE_ADD(NOW(), INTERVAL ? HOUR), nastepny_idx=nastepny_idx+1
     WHERE id=1 AND nastepny_idx=?`,
    [BOSS_SPAWN_EVERY_H, due.nastepny_idx]
  );
  if (claim.affectedRows !== 1) return;

  // Jak dotąd: gdy poprzedni boss wciąż żyje, ten termin przepada
  const [[active]] = await db.query("SELECT id FROM world_boss WHERE status='aktywny' LIMIT 1");
  if (active) return;
  await spawnWorldBoss(BOSS_TEMPLATES[due.nastepny_idx % BOSS_TEMPLATES.length]);
}

initBossSchedule()
  .then(() => setInterval(() => bossScheduleTick().catch(logError('cron:bossSpawn')), 60 * 1000))
  .catch(logError('cron:bossSchedule:init'));

// ── World Boss escape cron — every 60 seconds ─────────────────────────────────
setInterval(async () => {
  try {
    const [[boss]] = await db.query(
      "SELECT id, nazwa FROM world_boss WHERE status='aktywny' AND data_ucieczki IS NOT NULL AND data_ucieczki < NOW() LIMIT 1"
    );
    if (boss) {
      await db.query("UPDATE world_boss SET status='uciekl', data_smierci=NOW() WHERE id=?", [boss.id]);
      io.emit('world_boss_escaped', { boss_id: boss.id, nazwa: boss.nazwa });
      io.emit('chat_message', { kto: '💨 SYSTEM', tresc: `Boss ${boss.nazwa} uciekł! Nie zdążyliście go pokonać.` });
    }
  } catch (e) { logError('cron:bossEscape')(e); }
}, 60 * 1000);

// ── World Boss regen cron — every 30 seconds (gdy regeneracja aktywna) ────────
setInterval(async () => {
  try {
    const [[boss]] = await db.query(
      "SELECT id, zycie, zycie_max, zdolnosci_specjalne FROM world_boss WHERE status='aktywny' LIMIT 1"
    );
    if (!boss || boss.zycie <= 0) return;
    let zdolnosci = [];
    try { zdolnosci = JSON.parse(boss.zdolnosci_specjalne) || []; } catch {}
    const hasRegen = zdolnosci.some(z => z.typ === 'regeneracja' && z.wyzwolona === 1);
    if (hasRegen) {
      const regenAmt = Math.max(1, Math.floor(boss.zycie_max * 0.01));
      const newHp = Math.min(boss.zycie_max, boss.zycie + regenAmt);
      await db.query('UPDATE world_boss SET zycie=? WHERE id=?', [newHp, boss.id]);
      io.emit('world_boss_hp_update', { boss_id: boss.id, zycie: newHp, zycie_max: boss.zycie_max });
    }
  } catch (e) { logError('cron:bossRegen')(e); }
}, 30 * 1000);

// ── World Boss shield expiry cron — every 5 seconds ──────────────────────────
setInterval(async () => {
  try {
    const now = Math.floor(Date.now() / 1000);
    await db.query(
      "UPDATE world_boss SET aktywna_tarcza=0 WHERE status='aktywny' AND aktywna_tarcza=1 AND tarcza_do < ?",
      [now]
    );
  } catch (e) { logError('cron:bossShield')(e); }
}, 5 * 1000);

// ── Dungeon session expiry cron — every 5 minutes ────────────────────────────
setInterval(async () => {
  try {
    const [expired] = await db.query(
      "SELECT * FROM dungeony_sesje WHERE status='aktywna' AND data_koniec < NOW()"
    );
    for (const s of expired) {
      // Teleport remaining players out
      await db.query(
        'UPDATE postac SET mapa=1,x=31,y=47 WHERE id IN (SELECT postac_id FROM dungeony_gracze WHERE sesja_id=?)',
        [s.id]
      );
      await db.query("UPDATE dungeony_sesje SET status='wygasla' WHERE id=?", [s.id]);
      await db.query('DELETE FROM blokadaprzejscia WHERE mapa=?', [s.mapa_id]);
      await db.query('DELETE FROM mob WHERE mapa=?', [s.mapa_id]);
      await db.query('DELETE FROM mapa WHERE id=?', [s.mapa_id]);
    }
  } catch (e) { logError('cron:dungeonExpire')(e); }
}, 5 * 60 * 1000);

// ── Offline progress finalization cron — every 5 minutes ─────────────────────
const { finalizeOfflineSession } = require('./routes/offline');
setInterval(async () => {
  try {
    const [done] = await db.query(
      "SELECT * FROM offline_progress WHERE status='aktywny' AND data_koniec < NOW()"
    );
    for (const s of done) {
      await finalizeOfflineSession(s, db);
    }
  } catch (e) { logError('cron:offlineFinalize')(e); }
}, 5 * 60 * 1000);

// Expire auctions every 15 minutes
setInterval(async () => {
  try {
    const [expired] = await db.query(
      "SELECT id FROM aukcje WHERE status='aktywna' AND data_wygasniecia < NOW()"
    );
    for (const a of expired) {
      // Status zmieniany atomowo przed zwrotem — równoległy zakup nie zdubluje przedmiotu
      await expireAuction(db, a.id).catch(logError(`cron:auctionExpire#${a.id}`));
    }
  } catch (e) { logError('cron:auctionExpire')(e); }
}, 15 * 60 * 1000);

// Track socket → postacId for fast lookup
const socketToPlayer = new Map();
// Track connect time for playtime calculation
const socketConnectTimes = new Map();
// Pending PvP challenges: challengedId → { challengerId, challengerName, socketId, ts }
const pvpChallenges  = new Map();

io.on('connection', (socket) => {
  const postacId = socket.request.session?.postacId;
  if (!postacId) { socket.disconnect(); return; }

  socketToPlayer.set(socket.id, postacId);
  socketConnectTimes.set(socket.id, Date.now());
  socket.join(`player_${postacId}`);

  const db = require('./db');

  // Mark online + join guild channel
  db.query('UPDATE postac SET zalogowany=1 WHERE id=?', [postacId]).catch(logError('socket:online'));
  db.query('SELECT gildia_id FROM gildia_czlonkowie WHERE postac_id=?', [postacId])
    .then(([[gc]]) => { if (gc) socket.join(`guild_${gc.gildia_id}`); })
    .catch(logError('socket:guildJoin'));

  // Pokój podglądu edytora — zmiany kafli na żywo, bez ruszania pokoju mapy gracza
  socket.on('join_edit', async (mapId) => {
    try {
      const [[p]] = await db.query('SELECT ranga FROM postac WHERE id=?', [postacId]);
      if (!p || p.ranga !== 'GameAdmin') return;
      socket.rooms.forEach(r => { if (r.startsWith('edit_')) socket.leave(r); });
      if (mapId) socket.join(`edit_${mapId}`);
    } catch (e) { logError('socket:join_edit')(e); }
  });

  socket.on('join_map', (mapId) => {
    socket.rooms.forEach(r => { if (r.startsWith('map_')) socket.leave(r); });
    if (mapId) socket.join(`map_${mapId}`);
  });

  socket.on('guild_message', async (data) => {
    try {
      if (!data?.tresc?.trim()) return;
      const tresc = String(data.tresc).trim().slice(0, 250);
      const [[postac]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [postacId]);
      const [[gc]] = await db.query('SELECT gildia_id FROM gildia_czlonkowie WHERE postac_id=?', [postacId]);
      if (!gc) return;
      io.to(`guild_${gc.gildia_id}`).emit('guild_message', { kto: postac?.nazwa, tresc, ...(await chatMeta(db, postacId)) });
    } catch(e) { logError('socket:guild_message')(e); }
  });

  // Kanały: lokalny (gracze na tej samej mapie), globalny i handel (wszyscy)
  const CHAT_KANALY = ['lokalny', 'globalny', 'handel'];
  let lastChatAt = 0;
  socket.on('chat_message', async (data) => {
    try {
      if (!data?.tresc?.trim()) return;
      const now = Date.now();
      if (now - lastChatAt < 800) return;   // prosty limit: ~1 wiadomość na 0,8 s
      lastChatAt = now;

      const tresc = String(data.tresc).trim().slice(0, 250);
      const kanal = CHAT_KANALY.includes(data.kanal) ? data.kanal : 'lokalny';
      const [[postac]] = await db.query('SELECT nazwa, mapa, zablokowany_chat FROM postac WHERE id=?', [postacId]);
      if (!postac) return;
      if (postac.zablokowany_chat > Math.floor(now / 1000)) return;

      await db.query(
        'INSERT INTO chat (kto,tresc,mapa_id,postac_id,kanal) VALUES (?,?,?,?,?)',
        [postac.nazwa, tresc, postac.mapa, postacId, kanal]
      );

      const msg = { kto: postac.nazwa, tresc, kanal, ...(await chatMeta(db, postacId)) };
      if (kanal === 'lokalny') io.to(`map_${postac.mapa}`).emit('chat_message', msg);
      else io.emit('chat_message', msg);
    } catch(e) { logError('socket:chat_message')(e); }
  });

  // ── PvP Challenge ─────────────────────────────────────────────────────────
  socket.on('pvp_challenge', async (data) => {
    try {
      const { targetId } = data;
      if (!targetId || targetId === postacId) return;

      // Check both players on same map
      const [[challenger]] = await db.query('SELECT nazwa, poziom, mapa FROM postac WHERE id=?', [postacId]);
      const [[defender]]   = await db.query('SELECT nazwa, poziom, mapa FROM postac WHERE id=? AND zalogowany=1', [targetId]);
      if (!challenger || !defender || challenger.mapa !== defender.mapa) return;

      // Store challenge (expires in 30s)
      pvpChallenges.set(targetId, { challengerId: postacId, challengerName: challenger.nazwa, socketId: socket.id, ts: Date.now() });

      // Notify defender
      io.to(`player_${targetId}`).emit('pvp_challenge_received', {
        challengerId: postacId,
        challengerName: challenger.nazwa,
        challengerLevel: challenger.poziom,
      });
    } catch(e) { logError('socket:pvp_challenge')(e); }
  });

  socket.on('pvp_accept', async (data) => {
    try {
      const { challengerId } = data;
      const challenge = pvpChallenges.get(postacId);
      if (!challenge || challenge.challengerId !== challengerId) return;
      if (Date.now() - challenge.ts > 30000) { pvpChallenges.delete(postacId); return; }

      pvpChallenges.delete(postacId);

      // Notify challenger that duel was accepted
      io.to(`player_${challengerId}`).emit('pvp_accepted', { defenderId: postacId });
    } catch(e) { logError('socket:pvp_accept')(e); }
  });

  socket.on('pvp_decline', async (data) => {
    try {
      const challenge = pvpChallenges.get(postacId);
      if (!challenge) return;
      pvpChallenges.delete(postacId);
      io.to(`player_${challenge.challengerId}`).emit('pvp_declined', { defenderName: (await db.query('SELECT nazwa FROM postac WHERE id=?', [postacId]))[0][0]?.nazwa || '?' });
    } catch(e) { logError('socket:pvp_decline')(e); }
  });

  // Register trade socket events
  registerTradeSocket(io, db)(socket, socketToPlayer);

  socket.on('disconnect', async () => {
    socketToPlayer.delete(socket.id);
    // Cancel any pending PvP challenge from this player
    for (const [defenderId, ch] of pvpChallenges.entries()) {
      if (ch.socketId === socket.id) pvpChallenges.delete(defenderId);
    }
    // Track playtime
    try {
      const sessionMs = Date.now() - (socketConnectTimes.get(socket.id) || Date.now());
      socketConnectTimes.delete(socket.id);
      const sessionSec = Math.floor(sessionMs / 1000);
      if (sessionSec > 0) {
        db.query('UPDATE postac SET czas_gry = czas_gry + ? WHERE id=?', [sessionSec, postacId]).catch(logError('socket:playtime'));
      }
    } catch(e) { logError('socket:playtime')(e); }
    try {
      const otherSocket = [...socketToPlayer.values()].find(id => id === postacId);
      if (!otherSocket) {
        await db.query('UPDATE postac SET zalogowany=0 WHERE id=?', [postacId]);
      }
    } catch(e) { logError('socket:disconnect')(e); }
  });
});

// Periodic cleanup — mark offline if no socket (backup for ungraceful disconnects)
setInterval(async () => {
  try {
    const db = require('./db');
    const activePlayers = new Set(socketToPlayer.values());
    if (activePlayers.size === 0) {
      await db.query('UPDATE postac SET zalogowany=0 WHERE zalogowany=1');
    } else {
      await db.query('UPDATE postac SET zalogowany=0 WHERE zalogowany=1 AND id NOT IN (?)', [[...activePlayers]]);
    }
  } catch(e) { logError('cron:onlineCleanup')(e); }
}, 30000);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.use((err, req, res, next) => {
  // Szczegóły (np. treść błędu SQL) tylko w logu serwera, nie w odpowiedzi
  console.error(`[${new Date().toISOString()}] API Error ${req.method} ${req.originalUrl}:`, err.stack || err.message);
  res.status(500).json({ error: 'Błąd serwera' });
});

process.on('unhandledRejection', (reason) => { console.error('Unhandled rejection:', reason); });

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', async () => {
  await serverConfig.init(db);
  console.log(`Veldoria server running on http://0.0.0.0:${PORT}`);
});
