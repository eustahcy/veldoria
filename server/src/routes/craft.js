const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireSession } = require('../middleware/auth');
const { giveItem } = require('../game/inventory');

// GET /api/craft/materials — my crafting materials
router.get('/materials', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const [rows] = await db.query(
      `SELECT ps.surowiec_id, s.nazwa, s.opis, s.rzadkosc, s.obrazek, ps.ilosc
       FROM postac_surowce ps
       JOIN surowce s ON s.id = ps.surowiec_id
       WHERE ps.postac_id = ? AND ps.ilosc > 0
       ORDER BY s.rzadkosc DESC, s.nazwa ASC`,
      [postacId]
    );
    res.json(rows);
  } catch(e) { next(e); }
});

// GET /api/craft/recipes — all recipes with ingredient availability
router.get('/recipes', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;

    // My materials map
    const [myMats] = await db.query(
      'SELECT surowiec_id, ilosc FROM postac_surowce WHERE postac_id=?',
      [postacId]
    );
    const matMap = {};
    for (const m of myMats) matMap[m.surowiec_id] = m.ilosc;

    const [[postac]] = await db.query('SELECT poziom FROM postac WHERE id=?', [postacId]);

    // All active recipes + result item info
    const [recipes] = await db.query(
      `SELECT r.*, pl.nazwa as item_nazwa, pl.klasa as item_klasa, pl.typ as item_typ, pl.obrazek as item_obrazek
       FROM receptury r
       LEFT JOIN przedmiot_loot pl ON pl.id = r.przedmiot_wynikowy_id
       WHERE r.aktywna = 1 AND r.wymagany_poziom <= ?
       ORDER BY r.wymagany_poziom ASC`,
      [postac.poziom]
    );

    // Ingredients per recipe
    const [allIngreds] = await db.query(
      `SELECT rs.receptura_id, rs.surowiec_id, rs.ilosc as potrzebna, s.nazwa, s.rzadkosc
       FROM receptury_skladniki rs
       JOIN surowce s ON s.id = rs.surowiec_id`
    );
    const ingredMap = {};
    for (const ing of allIngreds) {
      if (!ingredMap[ing.receptura_id]) ingredMap[ing.receptura_id] = [];
      ingredMap[ing.receptura_id].push({
        ...ing,
        posiadam: matMap[ing.surowiec_id] || 0,
        wystarczy: (matMap[ing.surowiec_id] || 0) >= ing.potrzebna,
      });
    }

    const result = recipes.map(r => {
      const ingredients = ingredMap[r.id] || [];
      const canCraft = ingredients.length > 0 && ingredients.every(i => i.wystarczy);
      return { ...r, ingredients, canCraft };
    });

    res.json(result);
  } catch(e) { next(e); }
});

// POST /api/craft/create/:recepturaId — craft item
router.post('/create/:recepturaId', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const recepturaId = parseInt(req.params.recepturaId);

    const [[postac]] = await db.query('SELECT poziom FROM postac WHERE id=?', [postacId]);
    const [[recipe]] = await db.query(
      'SELECT r.*, pl.* FROM receptury r LEFT JOIN przedmiot_loot pl ON pl.id=r.przedmiot_wynikowy_id WHERE r.id=? AND r.aktywna=1',
      [recepturaId]
    );
    if (!recipe) return res.json({ ok: false, error: 'Receptura nie istnieje' });
    if (postac.poziom < recipe.wymagany_poziom)
      return res.json({ ok: false, error: `Wymagany poziom ${recipe.wymagany_poziom}` });

    const [ingredients] = await db.query(
      'SELECT * FROM receptury_skladniki WHERE receptura_id=?',
      [recepturaId]
    );
    if (!ingredients.length) return res.json({ ok: false, error: 'Receptura bez składników' });

    // Check materials
    const [myMats] = await db.query(
      'SELECT surowiec_id, ilosc FROM postac_surowce WHERE postac_id=?',
      [postacId]
    );
    const matMap = {};
    for (const m of myMats) matMap[m.surowiec_id] = m.ilosc;

    for (const ing of ingredients) {
      if ((matMap[ing.surowiec_id] || 0) < ing.ilosc)
        return res.json({ ok: false, error: 'Za mało surowców' });
    }

    // Surowce odejmowane warunkowo (ilosc >= potrzebne) — dwa równoległe crafty
    // nie zejdą poniżej zera ani nie dadzą dwóch przedmiotów z jednego zestawu
    const crafted = await db.withTransaction(async (conn) => {
      const taken = [];
      for (const ing of ingredients) {
        const [r] = await conn.query(
          'UPDATE postac_surowce SET ilosc=ilosc-? WHERE postac_id=? AND surowiec_id=? AND ilosc>=?',
          [ing.ilosc, postacId, ing.surowiec_id, ing.ilosc]
        );
        if (r.affectedRows !== 1) {
          // Zwrot już pobranych (na MyISAM nie ma rollbacku)
          for (const t of taken) {
            await conn.query(
              'UPDATE postac_surowce SET ilosc=ilosc+? WHERE postac_id=? AND surowiec_id=?',
              [t.ilosc, postacId, t.surowiec_id]
            );
          }
          return false;
        }
        taken.push(ing);
      }

      await giveItem(conn, postacId, recipe, {
        nazwa: recipe.nazwa || recipe.item_nazwa,
        typ: recipe.typ || 'Inne',
        obrazek: recipe.obrazek || 'items/default.gif',
        wartosc_sprzedazy: recipe.wartosc_sprzedazy || 50,
        ilosc: recipe.wynik_ilosc || 1,
        opis: `Stworzony przez gracza — ${recipe.nazwa}`,
      });
      return true;
    });
    if (!crafted) return res.json({ ok: false, error: 'Za mało surowców' });

    res.json({ ok: true, msg: `Stworzono: ${recipe.nazwa || recipe.item_nazwa}` });
  } catch(e) { next(e); }
});

// POST /api/craft/upgrade/:itemId — upgrade item +1 level
router.post('/upgrade/:itemId', requireSession, async (req, res, next) => {
  try {
    const postacId = req.session.postacId;
    const itemId = parseInt(req.params.itemId);

    const [[item]] = await db.query(
      'SELECT * FROM przedmiot_postac WHERE id=? AND postac=? AND zalozony=0',
      [itemId, postacId]
    );
    if (!item) return res.json({ ok: false, error: 'Przedmiot nie znaleziony lub założony' });

    // Parse current upgrade level from name
    const matchLevel = item.nazwa.match(/ \+(\d+)$/);
    const curLevel = matchLevel ? parseInt(matchLevel[1]) : 0;
    if (curLevel >= 5) return res.json({ ok: false, error: 'Maksymalny poziom ulepszenia (+5)' });

    const newLevel = curLevel + 1;
    const chances = [90, 75, 60, 40, 20];
    const successChance = chances[curLevel]; // chance for newLevel

    // Cost: 2x item's wartosc_sprzedazy in generic crafting materials (surowiec_id=3 — Kryształ Magii)
    const matCost = Math.max(1, Math.floor((item.wartosc_sprzedazy || 50) / 25));
    const [myMat] = await db.query(
      'SELECT ilosc FROM postac_surowce WHERE postac_id=? AND surowiec_id=3',
      [postacId]
    );
    const matHave = myMat[0]?.ilosc || 0;
    if (matHave < matCost)
      return res.json({ ok: false, error: `Potrzebujesz ${matCost}x Kryształ Magii (masz ${matHave})` });

    // Deduct materials regardless of success — warunkowo, bez schodzenia poniżej zera
    const [paid] = await db.query(
      'UPDATE postac_surowce SET ilosc=ilosc-? WHERE postac_id=? AND surowiec_id=3 AND ilosc>=?',
      [matCost, postacId, matCost]
    );
    if (paid.affectedRows !== 1)
      return res.json({ ok: false, error: `Potrzebujesz ${matCost}x Kryształ Magii` });

    const success = Math.random() * 100 < successChance;
    if (success) {
      const baseName = item.nazwa.replace(/ \+\d+$/, '');
      const newName = `${baseName} +${newLevel}`;
      const mult = 1 + newLevel * 0.1;

      const [upg] = await db.query(
        `UPDATE przedmiot_postac SET
          nazwa=?,
          zycie=ROUND(zycie * ?),
          sa=ROUND(sa * ?),
          ac=ROUND(ac * ?),
          acm=ROUND(acm * ?),
          obr_min=ROUND(obr_min * ?),
          obr_max=ROUND(obr_max * ?),
          sila=ROUND(sila * ?),
          zrecznosc=ROUND(zrecznosc * ?),
          intelekt=ROUND(intelekt * ?),
          ck=ROUND(ck * ?),
          absorbcja=ROUND(absorbcja * ?),
          obr_mag=ROUND(obr_mag * ?),
          wartosc_sprzedazy=ROUND(wartosc_sprzedazy * ?)
         WHERE id=? AND postac=? AND nazwa=?`,
        [newName, mult, mult, mult, mult, mult, mult, mult, mult, mult, mult, mult, mult, mult,
         itemId, postacId, item.nazwa]
      );
      // Warunek nazwa=? (stary poziom) — dwa równoległe ulepszenia nie pomnożą statystyk dwa razy
      if (upg.affectedRows !== 1) {
        await db.query(
          'UPDATE postac_surowce SET ilosc=ilosc+? WHERE postac_id=? AND surowiec_id=3',
          [matCost, postacId]
        );
        return res.json({ ok: false, error: 'Przedmiot został zmieniony w międzyczasie — spróbuj ponownie' });
      }

      return res.json({ ok: true, success: true, newLevel, msg: `Ulepszenie udane! +${newLevel}` });
    } else {
      return res.json({ ok: true, success: false, newLevel: curLevel, msg: 'Ulepszenie nieudane. Materiały utracone.' });
    }
  } catch(e) { next(e); }
});

module.exports = router;
