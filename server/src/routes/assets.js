/**
 * /api/assets — Admin asset upload routes
 * Handles PNG/GIF uploads for: player skins, guild emblems, class sprites, mobs, NPCs
 */
const express   = require('express');
const { logError } = require('../game/log');
const multer    = require('multer');
const path      = require('path');
const fs        = require('fs');
const db        = require('../db');

const router    = express.Router();
const ASSETS    = path.join(__dirname, '../../../original/MAEGONEM_pliki');

// ── Auth ──────────────────────────────────────────────────────────────────────
async function requireAdmin(req, res, next) {
  const id = req.session.postacId || req.session.adminPostacId;
  if (!id) return res.status(401).json({ error: 'Nie zalogowany' });
  const [[p]] = await db.query('SELECT ranga FROM postac WHERE id=?', [id]);
  if (!p || p.ranga !== 'GameAdmin') return res.status(403).json({ error: 'Brak uprawnień' });
  req.adminId = id;
  next();
}

// ── Multer factory — per category ─────────────────────────────────────────────
function makeUpload(subdir, prefix = '') {
  const destDir = path.join(ASSETS, subdir);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, destDir),
    filename: (req, file, cb) => {
      const ext  = path.extname(file.originalname).toLowerCase();
      const base = prefix
        ? `${prefix}_${Date.now()}${ext}`
        : `${path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}${ext}`;
      cb(null, base);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ok = ['.png', '.gif'].includes(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Dozwolone tylko PNG i GIF'), ok);
  };

  return multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
}

// ── Helper: return asset URL relative to /assets/ ────────────────────────────
function relPath(fullPath) {
  return path.relative(ASSETS, fullPath).replace(/\\/g, '/');
}

// ── LIST uploaded assets by category ─────────────────────────────────────────
router.get('/list/:category', requireAdmin, (req, res) => {
  const MAP = {
    avatar: 'avatar',
    mob:    'mob',
    npc:    'npc',
    guild:  'guild',
    custom: 'custom',
  };
  const subdir = MAP[req.params.category];
  if (!subdir) return res.status(400).json({ error: 'Nieznana kategoria' });

  const dir = path.join(ASSETS, subdir);
  if (!fs.existsSync(dir)) return res.json([]);

  const files = fs.readdirSync(dir)
    .filter(f => /\.(png|gif)$/i.test(f))
    .map(f => ({
      name: f,
      path: `${subdir}/${f}`,
      size: fs.statSync(path.join(dir, f)).size,
      mtime: fs.statSync(path.join(dir, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  res.json(files);
});

// ── DELETE asset ──────────────────────────────────────────────────────────────
router.delete('/file', requireAdmin, (req, res) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ error: 'Brak ścieżki' });

  // Safety: only allow deleting from allowed dirs
  const allowed = ['avatar/', 'mob/', 'npc/', 'guild/', 'custom/'];
  if (!allowed.some(a => filePath.startsWith(a))) {
    return res.status(403).json({ error: 'Niedozwolona ścieżka' });
  }

  const full = path.join(ASSETS, filePath);
  if (!full.startsWith(ASSETS)) return res.status(403).json({ error: 'Próba path traversal' });

  try {
    fs.unlinkSync(full);
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Plik nie istnieje' });
  }
});

// ── UPLOAD: player avatar ─────────────────────────────────────────────────────
// POST /api/assets/upload/avatar  (also applies to a specific player if postacId given)
router.post('/upload/avatar', requireAdmin, (req, res, next) => {
  makeUpload('avatar').single('file')(req, res, async err => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Brak pliku' });

    const filePath = relPath(req.file.path);

    // If postacId given, apply to that player
    if (req.body.postacId) {
      await db.query('UPDATE postac SET obrazek=? WHERE id=?', [filePath, parseInt(req.body.postacId)]).catch(logError('assets:115'));
    }

    res.json({ ok: true, path: filePath, name: req.file.filename });
  });
});

// ── UPLOAD: guild emblem ──────────────────────────────────────────────────────
router.post('/upload/guild', requireAdmin, (req, res, next) => {
  // Create guild dir if needed
  const destDir = path.join(ASSETS, 'guild');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  makeUpload('guild').single('file')(req, res, async err => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Brak pliku' });

    const filePath = relPath(req.file.path);

    // If guildId given, apply to that guild
    if (req.body.guildId) {
      await db.query('UPDATE gilde SET obrazek=? WHERE id=?', [filePath, parseInt(req.body.guildId)]).catch(logError('assets:136'));
    }

    res.json({ ok: true, path: filePath, name: req.file.filename });
  });
});

// ── UPLOAD: class sprite ──────────────────────────────────────────────────────
router.post('/upload/class', requireAdmin, (req, res, next) => {
  makeUpload('avatar').single('file')(req, res, async err => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Brak pliku' });

    const filePath = relPath(req.file.path);

    // If className given, update all players of that class
    if (req.body.className) {
      await db.query('UPDATE postac SET obrazek=? WHERE profesja=?', [filePath, req.body.className]).catch(logError('assets:153'));
    }

    res.json({ ok: true, path: filePath, name: req.file.filename });
  });
});

// ── UPLOAD: mob sprite ────────────────────────────────────────────────────────
router.post('/upload/mob', requireAdmin, (req, res, next) => {
  makeUpload('mob').single('file')(req, res, async err => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Brak pliku' });

    const filePath = relPath(req.file.path);

    // If mobId given, apply to that mob
    if (req.body.mobId) {
      await db.query('UPDATE mob SET obrazek=? WHERE id=?', [filePath, parseInt(req.body.mobId)]).catch(logError('assets:170'));
    }

    res.json({ ok: true, path: filePath, name: req.file.filename });
  });
});

// ── UPLOAD: NPC sprite ────────────────────────────────────────────────────────
router.post('/upload/npc', requireAdmin, (req, res, next) => {
  makeUpload('npc').single('file')(req, res, async err => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Brak pliku' });

    const filePath = relPath(req.file.path);

    // If npcId given, apply to that NPC
    if (req.body.npcId) {
      await db.query('UPDATE npc SET obrazek=? WHERE id=?', [filePath, parseInt(req.body.npcId)]).catch(logError('assets:187'));
    }

    res.json({ ok: true, path: filePath, name: req.file.filename });
  });
});

// ── UPLOAD: custom / generic ──────────────────────────────────────────────────
router.post('/upload/custom', requireAdmin, (req, res, next) => {
  makeUpload('custom').single('file')(req, res, err => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Brak pliku' });
    res.json({ ok: true, path: relPath(req.file.path), name: req.file.filename });
  });
});

// ── Search players / mobs / npcs / guilds for picker ─────────────────────────
router.get('/search/players', requireAdmin, async (req, res) => {
  const q = req.query.q || '';
  const [rows] = await db.query('SELECT id, nazwa, profesja, obrazek FROM postac WHERE nazwa LIKE ? LIMIT 20', [`%${q}%`]);
  res.json(rows);
});

router.get('/search/mobs', requireAdmin, async (req, res) => {
  const q = req.query.q || '';
  const [rows] = await db.query('SELECT id, nazwa, obrazek, mapa FROM mob WHERE nazwa LIKE ? LIMIT 30', [`%${q}%`]);
  res.json(rows);
});

router.get('/search/npcs', requireAdmin, async (req, res) => {
  const q = req.query.q || '';
  const [rows] = await db.query('SELECT id, nazwa, obrazek, mapa FROM npc WHERE nazwa LIKE ? LIMIT 30', [`%${q}%`]);
  res.json(rows);
});

router.get('/search/guilds', requireAdmin, async (req, res) => {
  const [rows] = await db.query('SELECT id, nazwa, tag FROM gilde LIMIT 50');
  res.json(rows);
});

module.exports = router;
