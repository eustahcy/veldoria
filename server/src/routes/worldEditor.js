const express = require('express');
const router  = express.Router();
const db      = require('../db');
const serverConfig = require('../game/serverConfig');
const mapCache = require('../game/mapCache');

// Middleware — tylko GameAdmin (in-game lub pre-game)
async function requireAdmin(req, res, next) {
  const id = req.session.postacId || req.session.adminPostacId;
  if (!id) return res.status(401).json({ error: 'Nie zalogowany' });
  const [[p]] = await db.query('SELECT ranga FROM postac WHERE id=?', [id]);
  if (!p || p.ranga !== 'GameAdmin') return res.status(403).json({ error: 'Brak uprawnień' });
  next();
}

// ── MAPY ─────────────────────────────────────────────────────────────────────
router.get('/maps', requireAdmin, async (req, res, next) => {
  try {
    const [maps] = await db.query('SELECT * FROM mapa ORDER BY id');
    res.json(maps);
  } catch(e) { next(e); }
});

router.put('/maps/:id', requireAdmin, async (req, res, next) => {
  try {
    const { strefy } = req.body;
    const val = typeof strefy === 'string' ? strefy : JSON.stringify(strefy || []);
    await db.query('UPDATE mapa SET strefy=? WHERE id=?', [val, req.params.id]);
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// ── MOBY ─────────────────────────────────────────────────────────────────────
router.get('/mobs/:mapaId', requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM mob WHERE mapa=? ORDER BY id', [req.params.mapaId]);
    res.json(rows);
  } catch(e) { next(e); }
});

router.post('/mobs', requireAdmin, async (req, res, next) => {
  try {
    const { mapa, nazwa, obrazek, poziom, zycie_max, obr_min, obr_max, ac, exp, respawn_time, paczka, x, y } = req.body;
    if (!mapa || !nazwa) return res.status(400).json({ error: 'Brak wymaganych pól' });
    const hp = zycie_max || (20 + (poziom||1) * 10);
    const [r] = await db.query(
      `INSERT INTO mob (mapa, nazwa, obrazek, poziom, zycie, zycie_max, obr_min, obr_max,
        ac, acm, sa, exp, respawn_time, paczka, x, y, szerokosc, dlugosc, respawn)
       VALUES (?,?,?,?,?,?,?,?,?,0,80,?,?,?,?,?,24,32,0)`,
      [mapa, nazwa, obrazek||'avatar/m_bd28.gif', poziom||1, hp, hp,
       obr_min||1, obr_max||3, ac||0, exp||((poziom||1)*5), respawn_time||60, paczka||0, x||35, y||37]
    );
    res.json({ ok:true, id: r.insertId });
  } catch(e) { next(e); }
});

router.put('/mobs/:id', requireAdmin, async (req, res, next) => {
  try {
    const { nazwa, obrazek, poziom, zycie_max, obr_min, obr_max, ac, exp, respawn_time, paczka, x, y, szerokosc, dlugosc } = req.body;
    await db.query(
      `UPDATE mob SET nazwa=?,obrazek=?,poziom=?,zycie_max=?,obr_min=?,obr_max=?,
        ac=?,exp=?,respawn_time=?,paczka=?,x=?,y=?,szerokosc=?,dlugosc=? WHERE id=?`,
      [nazwa, obrazek, poziom, zycie_max, obr_min, obr_max,
       ac||0, exp, respawn_time||60, paczka||0, x, y, szerokosc||24, dlugosc||32, req.params.id]
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.delete('/mobs/:id', requireAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM mob WHERE id=?', [req.params.id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

// Respawn konkretnego moba
router.post('/mobs/:id/respawn', requireAdmin, async (req, res, next) => {
  try {
    await db.query('UPDATE mob SET zycie=zycie_max, respawn=0 WHERE id=?', [req.params.id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

// ── NPC ──────────────────────────────────────────────────────────────────────
router.get('/npcs/:mapaId', requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM npc WHERE mapa=? ORDER BY id', [req.params.mapaId]);
    res.json(rows);
  } catch(e) { next(e); }
});

router.post('/npcs', requireAdmin, async (req, res, next) => {
  try {
    const { mapa, nazwa, obrazek, x, y, shop } = req.body;
    if (!mapa || !nazwa) return res.status(400).json({ error: 'Brak wymaganych pól' });
    const [r] = await db.query(
      `INSERT INTO npc (mapa, nazwa, obrazek, x, y, shop, szerokosc, dlugosc)
       VALUES (?,?,?,?,?,?,32,48)`,
      [mapa, nazwa, obrazek||'avatar/m_pal21.gif', x||35, y||37, shop||0]
    );
    res.json({ ok:true, id: r.insertId });
  } catch(e) { next(e); }
});

router.put('/npcs/:id', requireAdmin, async (req, res, next) => {
  try {
    const { nazwa, obrazek, x, y, shop, szerokosc, dlugosc } = req.body;
    await db.query(
      'UPDATE npc SET nazwa=?,obrazek=?,x=?,y=?,shop=?,szerokosc=?,dlugosc=? WHERE id=?',
      [nazwa, obrazek, x, y, shop||0, szerokosc||32, dlugosc||48, req.params.id]
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.delete('/npcs/:id', requireAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM npc WHERE id=?', [req.params.id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

// ── PORTALE ───────────────────────────────────────────────────────────────────
router.get('/portals/:mapaId', requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM mapa_przenies WHERE mapa=? ORDER BY id', [req.params.mapaId]);
    res.json(rows);
  } catch(e) { next(e); }
});

router.post('/portals', requireAdmin, async (req, res, next) => {
  try {
    const { mapa, x, y, do_mapa, do_x, do_y } = req.body;
    const [r] = await db.query(
      'INSERT INTO mapa_przenies (mapa,x,y,do_mapa,do_x,do_y) VALUES (?,?,?,?,?,?)',
      [mapa, x, y, do_mapa, do_x||35, do_y||37]
    );
    res.json({ ok:true, id: r.insertId });
  } catch(e) { next(e); }
});

router.delete('/portals/:id', requireAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM mapa_przenies WHERE id=?', [req.params.id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

// ── BLOKERY PRZEJŚĆ ───────────────────────────────────────────────────────────
router.get('/blockers/:mapaId', requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM blokadaprzejscia WHERE mapa=?', [req.params.mapaId]);
    res.json(rows);
  } catch(e) { next(e); }
});

router.post('/blockers', requireAdmin, async (req, res, next) => {
  try {
    const { mapa, x, y } = req.body;
    await db.query('INSERT IGNORE INTO blokadaprzejscia (mapa,x,y) VALUES (?,?,?)', [mapa, x, y]);
    mapCache.invalidate(mapa);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.delete('/blockers', requireAdmin, async (req, res, next) => {
  try {
    const { mapa, x, y } = req.body;
    await db.query('DELETE FROM blokadaprzejscia WHERE mapa=? AND x=? AND y=?', [mapa, x, y]);
    mapCache.invalidate(mapa);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

// ── PRZEDMIOTY LOOT ───────────────────────────────────────────────────────────
router.get('/items-loot', requireAdmin, async (req, res, next) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    const [rows] = search
      ? await db.query('SELECT * FROM przedmiot_loot WHERE nazwa LIKE ? ORDER BY id LIMIT 100', [search])
      : await db.query('SELECT * FROM przedmiot_loot ORDER BY id LIMIT 100');
    res.json(rows);
  } catch(e) { next(e); }
});

router.post('/items-loot', requireAdmin, async (req, res, next) => {
  try {
    const d = req.body;
    const [r] = await db.query(
      `INSERT INTO przedmiot_loot (nazwa,klasa,typ,obrazek,wym_poziom,wartosc_sprzedazy,
        zycie,sa,ac,acm,obr_min,obr_max,sila,zrecznosc,intelekt,wszystkie_cechy,
        ck,ckf,unik,blok,absorbcja,mabsorbcja,przebicie,obr_mag,mana,opis)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.nazwa||'Nowy przedmiot', d.klasa||'normal', d.typ||'Zbroja',
       d.obrazek||'items/default.png', d.wym_poziom||0, d.wartosc_sprzedazy||0,
       d.zycie||0, d.sa||0, d.ac||0, d.acm||0, d.obr_min||0, d.obr_max||0,
       d.sila||0, d.zrecznosc||0, d.intelekt||0, d.wszystkie_cechy||0,
       d.ck||0, d.ckf||120, d.unik||0, d.blok||0, d.absorbcja||0, d.mabsorbcja||0,
       d.przebicie||0, d.obr_mag||0, d.mana||0, d.opis||'']
    );
    res.json({ ok:true, id: r.insertId });
  } catch(e) { next(e); }
});

router.put('/items-loot/:id', requireAdmin, async (req, res, next) => {
  try {
    const d = req.body;
    await db.query(
      `UPDATE przedmiot_loot SET nazwa=?,klasa=?,typ=?,obrazek=?,wym_poziom=?,wartosc_sprzedazy=?,
        zycie=?,sa=?,ac=?,acm=?,obr_min=?,obr_max=?,sila=?,zrecznosc=?,intelekt=?,
        wszystkie_cechy=?,ck=?,ckf=?,unik=?,blok=?,absorbcja=?,mabsorbcja=?,
        przebicie=?,obr_mag=?,mana=?,opis=? WHERE id=?`,
      [d.nazwa, d.klasa||'normal', d.typ, d.obrazek, d.wym_poziom||0, d.wartosc_sprzedazy||0,
       d.zycie||0, d.sa||0, d.ac||0, d.acm||0, d.obr_min||0, d.obr_max||0,
       d.sila||0, d.zrecznosc||0, d.intelekt||0, d.wszystkie_cechy||0,
       d.ck||0, d.ckf||120, d.unik||0, d.blok||0, d.absorbcja||0, d.mabsorbcja||0,
       d.przebicie||0, d.obr_mag||0, d.mana||0, d.opis||'', req.params.id]
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.delete('/items-loot/:id', requireAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM przedmiot_loot WHERE id=?', [req.params.id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

// ── SKLEP — przedmioty ────────────────────────────────────────────────────────
router.get('/shop-items/:shopId', requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM przedmiot_sklep WHERE sklep=? ORDER BY id', [req.params.shopId]);
    res.json(rows);
  } catch(e) { next(e); }
});

router.post('/shop-items', requireAdmin, async (req, res, next) => {
  try {
    const d = req.body;
    const [r] = await db.query(
      `INSERT INTO przedmiot_sklep (sklep,nazwa,klasa,typ,obrazek,wym_poziom,wartosc_kupna,
        wartosc_sprzedazy,zycie,sa,ac,acm,obr_min,obr_max,sila,zrecznosc,intelekt,
        wszystkie_cechy,ck,ckf,unik,blok,absorbcja,mabsorbcja,przebicie,obr_mag,mana,opis)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.sklep, d.nazwa, d.klasa||'normal', d.typ||'Konsupcyjne',
       d.obrazek||'items/default.png', d.wym_poziom||0, d.wartosc_kupna||0,
       Math.floor((d.wartosc_kupna||0)/2),
       d.zycie||0, d.sa||0, d.ac||0, d.acm||0, d.obr_min||0, d.obr_max||0,
       d.sila||0, d.zrecznosc||0, d.intelekt||0, d.wszystkie_cechy||0,
       d.ck||0, d.ckf||120, d.unik||0, d.blok||0, d.absorbcja||0, d.mabsorbcja||0,
       d.przebicie||0, d.obr_mag||0, d.mana||0, d.opis||'']
    );
    res.json({ ok:true, id: r.insertId });
  } catch(e) { next(e); }
});

router.put('/shop-items/:id', requireAdmin, async (req, res, next) => {
  try {
    const d = req.body;
    await db.query(
      'UPDATE przedmiot_sklep SET nazwa=?,klasa=?,typ=?,wartosc_kupna=?,wym_poziom=?,zycie=?,sa=?,ac=?,acm=?,obr_min=?,obr_max=?,sila=?,zrecznosc=?,intelekt=?,opis=? WHERE id=?',
      [d.nazwa,d.klasa||'normal',d.typ,d.wartosc_kupna||0,d.wym_poziom||0,d.zycie||0,d.sa||0,d.ac||0,d.acm||0,d.obr_min||0,d.obr_max||0,d.sila||0,d.zrecznosc||0,d.intelekt||0,d.opis||'',req.params.id]
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.delete('/shop-items/:id', requireAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM przedmiot_sklep WHERE id=?', [req.params.id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

// ── PACZKI LOOT (loot table editor) ──────────────────────────────────────────
router.get('/loot-packs', requireAdmin, async (req, res, next) => {
  try {
    const [packs] = await db.query('SELECT DISTINCT paczka_id FROM paczka_przedmiot ORDER BY paczka_id');
    const result = [];
    for (const p of packs) {
      const [items] = await db.query(
        `SELECT pp.paczka_id, pp.przedmiot_id, pp.szansa, pl.id as item_id, pl.nazwa, pl.klasa, pl.typ
         FROM paczka_przedmiot pp JOIN przedmiot_loot pl ON pp.przedmiot_id=pl.id
         WHERE pp.paczka_id=?`, [p.paczka_id]
      );
      result.push({ id: p.paczka_id, items });
    }
    res.json(result);
  } catch(e) { next(e); }
});

router.post('/loot-packs/:packId/items', requireAdmin, async (req, res, next) => {
  try {
    const { przedmiot_id, szansa } = req.body;
    await db.query(
      'INSERT INTO paczka_przedmiot (paczka_id, przedmiot_id, szansa) VALUES (?,?,?)',
      [req.params.packId, przedmiot_id, szansa||100]
    );
    res.json({ ok:true });
  } catch(e) { next(e); }
});

router.delete('/loot-packs/entries/:id', requireAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM paczka_przedmiot WHERE id=?', [req.params.id]);
    res.json({ ok:true });
  } catch(e) { next(e); }
});

module.exports = router;
