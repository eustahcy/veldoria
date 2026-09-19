// Apply equipped item bonuses to character stats + guild buffs
const { logError } = require('./log');
async function computeStats(db, postac) {
  const [items] = await db.query(
    'SELECT * FROM przedmiot_postac WHERE postac = ? AND zalozony = 1',
    [postac.id]
  );

  const bonuses = {
    zycie_max: 0,
    sa: 0, ac: 0, acm: 0,
    sila: 0, zrecznosc: 0, intelekt: 0,
    ck: 0, ckf: 0, ckm: 0,
    acp: 0, absorbcja: 0, mabsorbcja: 0,
    leczenie: 0, unik: 0, blok: 0,
    przebicie: 0, obr_mag: 0, obr_poi: 0,
    glebokarana: 0, atak_gr: 0, kontra: 0,
    obnizac: 0, obnizacm: 0, obnizsa: 0,
    mana: 0, energia: 0,
  };

  for (const item of items) {
    bonuses.zycie_max += item.zycie || 0;
    bonuses.sa += item.sa || 0;
    bonuses.ac += item.ac || 0;
    bonuses.acm += item.acm || 0;
    bonuses.sila += (item.sila || 0) + (item.wszystkie_cechy || 0);
    bonuses.zrecznosc += (item.zrecznosc || 0) + (item.wszystkie_cechy || 0);
    bonuses.intelekt += (item.intelekt || 0) + (item.wszystkie_cechy || 0);
    bonuses.ck += item.ck || 0;
    bonuses.ckf += item.ckf || 0;
    bonuses.ckm += item.ckm || 0;
    bonuses.acp += item.acp || 0;
    bonuses.absorbcja += item.absorbcja || 0;
    bonuses.mabsorbcja += item.mabsorbcja || 0;
    bonuses.leczenie += item.leczenie || 0;
    bonuses.unik += item.unik || 0;
    bonuses.blok += item.blok || 0;
    bonuses.przebicie += item.przebicie || 0;
    bonuses.obr_mag += item.obr_mag || 0;
    bonuses.obr_poi += item.obr_poi || 0;
    bonuses.mana += item.mana || 0;
    bonuses.energia += item.energia || 0;
    bonuses.obnizsa += (item.obnizsa || 0) / 100;
  }

  const totalSila = postac.sila + bonuses.sila;
  const totalZrecznosc = postac.zrecznosc + bonuses.zrecznosc;
  const totalIntelekt = postac.intelekt + bonuses.intelekt;

  let obrazeniaMin = postac.obrazenia_min + Math.min(totalSila, 100);
  let obrazeniaMax = postac.obrazenia_max + Math.min(totalSila, 100);

  for (const item of items) {
    if (item.mnoznik_typ === 1) {
      obrazeniaMin += (item.obr_min || 0) + totalSila * ((item.mnoznik - 1) / 500);
      obrazeniaMax += (item.obr_max || 0) + totalSila * ((item.mnoznik - 1) / 500);
    } else if (item.mnoznik_typ === 2) {
      obrazeniaMin += (item.obr_min || 0) + totalZrecznosc * ((item.mnoznik - 1) / 500);
      obrazeniaMax += (item.obr_max || 0) + totalZrecznosc * ((item.mnoznik - 1) / 500);
    } else if (item.mnoznik_typ === 3) {
      obrazeniaMin += (item.obr_min || 0) + totalIntelekt * ((item.mnoznik - 1) / 500);
      obrazeniaMax += (item.obr_max || 0) + totalIntelekt * ((item.mnoznik - 1) / 500);
      bonuses.obr_mag += totalIntelekt * ((item.mnoznik - 1) / 500);
    }
  }

  // Guild buff bonuses
  let guildBonusExp = 0;
  let guildBonusHealing = 0;
  let guildBonusCrit = 0;
  let guildBonusDefense = 0;
  let guildTerritoryBonus = false;

  try {
    const [[gc]] = await db.query('SELECT gildia_id FROM gildia_czlonkowie WHERE postac_id=?', [postac.id]);
    if (gc) {
      const [[guildBuffs]] = await db.query('SELECT * FROM gildia_bonusy WHERE gildia_id=?', [gc.gildia_id]);
      if (guildBuffs) {
        guildBonusExp     = guildBuffs.bonus_exp     || 0;
        guildBonusHealing = guildBuffs.bonus_healing || 0;
        guildBonusCrit    = guildBuffs.bonus_crit    || 0;
        guildBonusDefense = guildBuffs.bonus_defense || 0;
      }
      // Check if player's current map is guild territory
      if (postac.mapa) {
        const [[territory]] = await db.query(
          'SELECT mapa_id FROM gildia_terytorium WHERE mapa_id=? AND gildia_id=?',
          [postac.mapa, gc.gildia_id]
        );
        guildTerritoryBonus = !!territory;
      }
    }
  } catch(e) {
    // Non-fatal: guild tables may not exist yet
  }

  // Title bonuses
  let titleBonusCk = 0, titleBonusAc = 0, titleBonusExpPct = 0;
  try {
    if (postac.aktywny_tytul) {
      const [[titleRow]] = await db.query(
        'SELECT bonus_typ, bonus_wartosc FROM tytuly WHERE id=?',
        [postac.aktywny_tytul]
      );
      if (titleRow && titleRow.bonus_typ) {
        if (titleRow.bonus_typ === 'ck')            titleBonusCk     = titleRow.bonus_wartosc || 0;
        if (titleRow.bonus_typ === 'ac')            titleBonusAc     = titleRow.bonus_wartosc || 0;
        if (titleRow.bonus_typ === 'bonus_exp_pct') titleBonusExpPct = titleRow.bonus_wartosc || 0;
      }
    }
  } catch (e) { logError('stats:112')(e); }

  // Prestige bonus multiplier
  const prestigeBonusPct = postac.prestige_bonus_pct || 0;
  const bonusExpMultiplier = (1 + prestigeBonusPct / 100) * (1 + titleBonusExpPct / 100);

  // Talent bonuses
  try {
    const [myTalents] = await db.query(
      `SELECT t.efekt_typ, t.efekt_wartosc_per_lvl, pt.poziom
       FROM postac_talenty pt
       JOIN talenty t ON t.id=pt.talent_id
       WHERE pt.postac_id=? AND pt.poziom>0`,
      [postac.id]
    );
    for (const tal of myTalents) {
      const bonus = tal.efekt_wartosc_per_lvl * tal.poziom;
      switch(tal.efekt_typ) {
        case 'bonus_ac':        bonuses.ac += bonus; break;
        case 'bonus_hp':        bonuses.zycie_max += bonus; break;
        case 'bonus_dmg':       bonuses.obr_min = (bonuses.obr_min||0)+bonus; bonuses.obr_max = (bonuses.obr_max||0)+bonus; break;
        case 'bonus_crit':      bonuses.ck += bonus; break;
        case 'bonus_sa':        bonuses.sa += bonus; break;
        case 'bonus_obr_mag':   bonuses.obr_mag += bonus; break;
        case 'bonus_przebicie': bonuses.przebicie += bonus; break;
        case 'bonus_blok':      bonuses.blok += bonus; break;
        case 'bonus_exp':       break; // handled via talent_bonus_exp field
      }
    }
  } catch (e) { logError('stats:141')(e); }

  const computedZycieMax = postac.zycie_max + bonuses.zycie_max + totalSila * 5;

  return {
    ...postac,
    zycie: Math.min(postac.zycie, computedZycieMax),
    sila: totalSila,
    zrecznosc: totalZrecznosc,
    intelekt: totalIntelekt,
    zycie_max: computedZycieMax,
    sa: postac.sa + bonuses.sa,
    ac: postac.ac + bonuses.ac + guildBonusDefense + titleBonusAc,
    acm: postac.acm + bonuses.acm,
    obrazenia_min: Math.round(obrazeniaMin) + (bonuses.obr_min || 0),
    obrazenia_max: Math.round(obrazeniaMax) + (bonuses.obr_max || 0),
    obr_mag: bonuses.obr_mag,
    ck: bonuses.ck + guildBonusCrit + titleBonusCk,
    ckf: postac.ckf + bonuses.ckf,
    ckm: postac.ckm + bonuses.ckm,
    unik: bonuses.unik,
    blok: bonuses.blok,
    przebicie: bonuses.przebicie,
    absorbcja: bonuses.absorbcja,
    mabsorbcja: bonuses.mabsorbcja,
    leczenie: bonuses.leczenie + guildBonusHealing,
    mana: bonuses.mana,
    energia: 100 + bonuses.energia,
    equippedItems: items,
    guildBonusExp,
    guildBonusHealing,
    guildBonusCrit,
    guildBonusDefense,
    guildTerritoryBonus,
    bonusExpMultiplier,
  };
}

// Calculate exp thresholds for a given level
function expThresholds(poziom) {
  const exp1 = poziom > 1 ? Math.pow(poziom - 1, 4) + 10 : 0;
  const exp2 = Math.pow(poziom, 4) + 10;
  return { exp1, exp2, range: exp2 - exp1 };
}

// Kolumna `zycie` trzyma bieżące HP względem efektywnego maksimum (z ekwipunkiem).
// Po zdjęciu przedmiotu z +HP trzeba je przyciąć, inaczej walka startuje z nadwyżką.
async function clampStoredHp(db, postacId) {
  const [[raw]] = await db.query('SELECT * FROM postac WHERE id=?', [postacId]);
  if (!raw) return null;
  const stats = await computeStats(db, raw);
  if (raw.zycie > stats.zycie_max) {
    await db.query('UPDATE postac SET zycie=LEAST(zycie, ?) WHERE id=?', [stats.zycie_max, postacId]);
  }
  return stats;
}

module.exports = { computeStats, expThresholds, clampStoredHp };
