const express      = require('express');
const router       = express.Router();
const db           = require('../db');
const { requireSession } = require('../middleware/auth');
const { computeStats }   = require('../game/stats');
const { fightRound }     = require('../game/combat');
const serverConfig       = require('../game/serverConfig');
const skills             = require('../game/skills');
const fx                 = require('../game/effects');
const { recordPvpFight } = require('./character');
const { createLimiter }  = require('../middleware/rateLimiter');
const worldCycle         = require('../game/worldCycle');
const { giveItem }       = require('../game/inventory');
const { logError }       = require('../game/log');

// Lazy-load to avoid circular dependency
function getCheckAchievements() {
  try { return require('./quests').checkAchievements; } catch(_) { return null; }
}

const combatLimit = createLimiter(5, 1000); // max 5 combat actions/s

// ── Wspólna obsługa zabicia moba (/action, /skill, /turn2) ─────────────────────
const MOB_ALREADY_DEAD = { ok: false, error: 'Ktoś inny pokonał tego przeciwnika', status: 'mob_dead' };

/**
 * Atomowo "przejmuje" zabicie moba i przyznaje nagrody.
 * UPDATE z warunkiem respawn<=now udaje się tylko pierwszemu zabójcy — dwóch graczy
 * (albo dwa równoległe żądania) nie dostanie podwójnego expa i lootu.
 * Zwraca null, jeśli mob był już martwy.
 */
async function awardMobKill({ postac, mob, expMult, now = Math.floor(Date.now() / 1000) }) {
  const respawnAt = now + (mob.respawn_time || 60);
  const [claim] = await db.query(
    'UPDATE mob SET zycie=0, respawn=? WHERE id=? AND respawn<=?',
    [respawnAt, mob.id, now]
  );
  if (claim.affectedRows !== 1) return null;

  // EXP — przyrostowo (exp=exp+?), żeby nie nadpisać równoległych zmian
  const expGained = Math.round((mob.exp || 0) * expMult);
  await db.query('UPDATE postac SET exp=exp+? WHERE id=?', [expGained, postac.id]);
  const [[fresh]] = await db.query('SELECT exp, poziom FROM postac WHERE id=?', [postac.id]);

  let newLevel = fresh.poziom;
  while (Math.pow(newLevel, 4) + 10 <= Number(fresh.exp)) newLevel++;
  const levelsGained = newLevel - fresh.poziom;

  // Awans — warunek poziom=? chroni przed podwójnym przyznaniem punktów
  let newZycieMax = null;
  if (levelsGained > 0) {
    const [lvl] = await db.query('UPDATE postac SET poziom=? WHERE id=? AND poziom=?', [newLevel, postac.id, fresh.poziom]);
    if (lvl.affectedRows === 1) {
      const hpGain = levelsGained * 5;
      newZycieMax = postac.zycie_max + hpGain; // efektywne max (z ekwipunkiem) + przyrost = pełne HP
      await db.query(
        `UPDATE postac SET um=um+?, punkty_talentow=COALESCE(punkty_talentow,0)+?,
         wolne_punkty_stat=COALESCE(wolne_punkty_stat,0)+?,
         zycie_max=zycie_max+?, zycie=?, obrazenia_min=obrazenia_min+?, obrazenia_max=obrazenia_max+?
         WHERE id=?`,
        [levelsGained, levelsGained, levelsGained * 3, hpGain, newZycieMax, levelsGained, levelsGained, postac.id]
      ).catch(async () => {
        // Baza bez kolumny wolne_punkty_stat (przed migracją phase7)
        await db.query(
          `UPDATE postac SET um=um+?, punkty_talentow=COALESCE(punkty_talentow,0)+?,
           zycie_max=zycie_max+?, zycie=?, obrazenia_min=obrazenia_min+?, obrazenia_max=obrazenia_max+? WHERE id=?`,
          [levelsGained, levelsGained, hpGain, newZycieMax, levelsGained, levelsGained, postac.id]
        );
      });
    }
  }

  // Loot (respects loot_chance multiplier)
  let loot = null;
  const lootChance = serverConfig.getNum('loot_chance', 1);
  if (mob.paczka > 0 && Math.random() < lootChance) {
    const [lootItems] = await db.query(
      `SELECT pp.*, pl.* FROM paczka_przedmiot pp
       JOIN przedmiot_loot pl ON pp.przedmiot_id=pl.id
       WHERE pp.paczka_id=?`, [mob.paczka]);
    if (lootItems.length) {
      const dropped = lootItems[Math.floor(Math.random() * lootItems.length)];
      await giveItem(db, postac.id, dropped);
      loot = { nazwa: dropped.nazwa, typ: dropped.typ, klasa: dropped.klasa, obrazek: dropped.obrazek };
    }
  }

  // Efekty poboczne — nie blokują walki, ale błędy są logowane
  await recordKillProgress(postac, mob).catch(logError('combat:killProgress'));

  return { expGained, levelUp: levelsGained > 0, newZycieMax, loot };
}

// Statystyki, questy, gildia, osiągnięcia i surowce po zabiciu moba
async function recordKillProgress(postac, mob) {
  const log = logError('combat:killProgress');
  db.query('UPDATE postac SET kills=COALESCE(kills,0)+1 WHERE id=?', [postac.id]).catch(log);
  db.query('UPDATE gildia_czlonkowie SET wklad_kills=wklad_kills+1 WHERE postac_id=?', [postac.id]).catch(log);
  db.query(
    `UPDATE gildia_misje gm
     JOIN gildia_czlonkowie gc ON gc.gildia_id=gm.gildia_id
     SET gm.postep=LEAST(gm.cel_ilosc, gm.postep+1)
     WHERE gc.postac_id=? AND gm.status='aktywna' AND gm.typ='kill'`,
    [postac.id]
  ).then(() => db.query(
    `UPDATE gildia_misje SET status='zakonczona'
     WHERE status='aktywna' AND typ='kill' AND postep>=cel_ilosc`
  )).catch(log);

  const [killQuests] = await db.query(
    `SELECT pq.quest_id FROM postac_questy pq JOIN questy q ON pq.quest_id=q.id
     WHERE pq.postac_id=? AND pq.status='aktywny' AND q.typ='kill'
       AND (q.cel_id=0 OR q.cel_id=?) AND pq.postep < q.cel_ilosc`,
    [postac.id, mob.id]
  );
  for (const kq of killQuests) {
    await db.query(
      `UPDATE postac_questy pq JOIN questy q ON pq.quest_id=q.id
       SET pq.postep=LEAST(q.cel_ilosc, pq.postep+1)
       WHERE pq.postac_id=? AND pq.quest_id=?`,
      [postac.id, kq.quest_id]
    );
  }

  const checkAch = getCheckAchievements();
  if (checkAch) checkAch(db, postac.id).catch(log);

  const [matRules] = await db.query(
    'SELECT * FROM mob_surowce WHERE mob_nazwa=? OR mob_nazwa="*"', [mob.nazwa]
  );
  for (const rule of matRules) {
    if (Math.random() * 100 < rule.szansa) {
      await db.query(
        'INSERT INTO postac_surowce (postac_id,surowiec_id,ilosc) VALUES (?,?,1) ON DUPLICATE KEY UPDATE ilosc=ilosc+1',
        [postac.id, rule.surowiec_id]
      );
    }
  }
}

// Zużycie mikstury — DELETE z warunkiem, żeby dwa równoległe żądania nie wypiły jej dwa razy
async function consumeItem(itemId, postacId) {
  const [del] = await db.query('DELETE FROM przedmiot_postac WHERE id=? AND postac=?', [itemId, postacId]);
  return del.affectedRows === 1;
}

// ── GET /api/combat/mob-info/:mobId ── initial mob data for battle modal ──────
router.get('/mob-info/:mobId', requireSession, async (req, res, next) => {
  try {
    const [[mob]] = await db.query('SELECT * FROM mob WHERE id = ?', [req.params.mobId]);
    if (!mob) return res.status(404).json({ error: 'Mob nie istnieje' });
    res.json(mob);
  } catch(e) { next(e); }
});

// ── POST /api/combat/action ── one turn of turn-based combat ──────────────────
router.post('/action', requireSession, combatLimit, async (req, res, next) => {
  try {
    const { mobId, action, itemId } = req.body; // action: 'attack'|'item'|'flee'
    const now = Math.floor(Date.now() / 1000);

    const [[rawPostac]] = await db.query('SELECT * FROM postac WHERE id = ?', [req.session.postacId]);
    if (!rawPostac || rawPostac.zycie <= 0)
      return res.json({ ok: false, error: 'Postać jest martwa' });

    // Apply weather modifiers to accuracy
    const ws = worldCycle.getState();
    let saModifier = 0;
    if (ws.pogoda === 'deszcz') saModifier = -10;
    if (ws.pogoda === 'burza')  saModifier = -15;

    const postacRaw2 = saModifier !== 0
      ? { ...rawPostac, sa: (rawPostac.sa || 100) + saModifier }
      : rawPostac;

    const postac = await computeStats(db, postacRaw2);

    const [[mob]] = await db.query(
      'SELECT * FROM mob WHERE id = ? AND mapa = ? AND respawn <= ?',
      [mobId, postac.mapa, now]
    );
    if (!mob) return res.json({ ok: false, error: 'Mob nie istnieje lub jest martwy', status: 'mob_dead' });

    // Allow up to 2 tiles (Chebyshev distance) to account for server-client sync lag
    const dist = Math.max(Math.abs(mob.x - postac.x), Math.abs(mob.y - postac.y));
    if (dist > 2) return res.json({ ok: false, error: 'Za daleko od moba' });

    const log = [];
    // HP przycięte do efektywnego max (computeStats) — nie surowe z bazy
    let heroHp = postac.zycie;
    let mobHp  = mob.zycie;
    let status = 'ongoing';
    let loot   = null;
    let expGained = 0;
    let levelUp   = false;
    let deathXpLoss = 0;

    // ── DEFEND ───────────────────────────────────────────────────────────────
    if (action === 'defend') {
      // Hero takes defensive stance — mob attacks with -40% damage, hero can't die from 1 hit
      log.push({ type: 'defend', actor: postac.nazwa });
      const mobAtk = fightRound(mob, { ...postac, zycie: heroHp });
      // Reduce mob damage by 40% when defending — każdy cios z logu, nie tylko pierwszy
      let hpLeft = heroHp;
      const defendedLog = mobAtk.log.map(e => {
        if (!e.dmg) return e;
        const dmg = Math.max(1, Math.floor(e.dmg * 0.6));
        hpLeft = Math.max(1, hpLeft - dmg); // can't die while defending
        return { ...e, dmg, newHp: hpLeft };
      });
      log.push(...defendedLog);
      heroHp = hpLeft;
      await db.query('UPDATE postac SET zycie=? WHERE id=?', [heroHp, postac.id]);
      return res.json({ ok:true, status:'ongoing', log, heroHp, mobHp, heroMaxHp: postac.zycie_max });
    }

    // ── FLEE ─────────────────────────────────────────────────────────────────
    if (action === 'flee') {
      const fled = Math.random() < 0.45;
      if (fled) {
        log.push({ type: 'flee_success' });
        fx.clearBattleEffects(req.session);
        return res.json({ ok: true, status: 'fled', log, heroHp, mobHp });
      }
      // Fail: mob gets free attack
      log.push({ type: 'flee_fail' });
      const mobAtk = fightRound(mob, { ...postac, zycie: heroHp });
      log.push(...mobAtk.log);
      heroHp = mobAtk.defenderHp;

      if (heroHp <= 0) {
        const [[dm]] = await db.query('SELECT * FROM mapa WHERE id = ?', [postac.mapa]);
        const xpLossPct = Math.max(2, 10 - Math.floor((rawPostac.poziom - 1) / 10));
        const xpLoss = Math.round(rawPostac.exp * xpLossPct / 100);
        const minXpForLevel = rawPostac.poziom > 1 ? Math.pow(rawPostac.poziom - 1, 4) + 10 : 0;
        const newExpAfterDeath = Math.max(minXpForLevel, rawPostac.exp - xpLoss);
        await db.query('UPDATE postac SET zycie=1, mapa=?, x=?, y=?, exp=?, deaths=COALESCE(deaths,0)+1 WHERE id=?',
          [dm.dead_map||1, dm.dead_x||35, dm.dead_y||37, newExpAfterDeath, postac.id]);
        log.push({ type: 'hero_dead', xpLoss });
        return res.json({ ok: true, status: 'lost', log, heroHp: 1, mobHp, xpLoss });
      }
      await db.query('UPDATE postac SET zycie=? WHERE id=?', [heroHp, postac.id]);
      return res.json({ ok: true, status: 'ongoing', log, heroHp, mobHp });
    }

    // ── ITEM (use consumable) ─────────────────────────────────────────────────
    if (action === 'item') {
      const [[item]] = await db.query(
        'SELECT * FROM przedmiot_postac WHERE id=? AND postac=? AND typ IN ("Konsupcyjne")',
        [itemId, postac.id]
      );
      if (!item) return res.json({ ok: false, error: 'Brak przedmiotu' });
      if (!(await consumeItem(item.id, postac.id))) return res.json({ ok: false, error: 'Brak przedmiotu' });

      let healed = 0;
      if (item.pelne_leczenie) {
        heroHp = postac.zycie_max;
        healed = postac.zycie_max - postac.zycie;
      } else if (item.mikstura_leczenie > 0) {
        heroHp = Math.min(postac.zycie_max, postac.zycie + item.mikstura_leczenie);
        healed = heroHp - postac.zycie;
      }
      log.push({ type: 'heal', actor: postac.nazwa, amount: healed });
      await db.query('UPDATE postac SET zycie=? WHERE id=?', [heroHp, postac.id]);

      // Mob attacks after item use
      const mobAtk = fightRound(mob, { ...postac, zycie: heroHp });
      log.push(...mobAtk.log);
      heroHp = mobAtk.defenderHp;

      if (heroHp <= 0) {
        const [[dm]] = await db.query('SELECT * FROM mapa WHERE id = ?', [postac.mapa]);
        const xpLossPct = Math.max(2, 10 - Math.floor((rawPostac.poziom - 1) / 10));
        const xpLoss = Math.round(rawPostac.exp * xpLossPct / 100);
        const minXpForLevel = rawPostac.poziom > 1 ? Math.pow(rawPostac.poziom - 1, 4) + 10 : 0;
        const newExpAfterDeath = Math.max(minXpForLevel, rawPostac.exp - xpLoss);
        await db.query('UPDATE postac SET zycie=1, mapa=?, x=?, y=?, exp=?, deaths=COALESCE(deaths,0)+1 WHERE id=?',
          [dm.dead_map||1, dm.dead_x||35, dm.dead_y||37, newExpAfterDeath, postac.id]);
        log.push({ type: 'hero_dead', xpLoss });
        return res.json({ ok: true, status: 'lost', log, heroHp: 1, mobHp, heroMaxHp: postac.zycie_max, xpLoss });
      }
      await db.query('UPDATE postac SET zycie=? WHERE id=?', [heroHp, postac.id]);
      return res.json({ ok: true, status: 'ongoing', log, heroHp, mobHp, heroMaxHp: postac.zycie_max });
    }

    // ── ATTACK ────────────────────────────────────────────────────────────────
    const { hero: heroEffects, mob: mobEffects } = fx.getBattleEffects(req.session, mob.id);
    const heroMods = fx.resolveHeroModifiers(heroEffects);
    const mobMods  = fx.resolveMobModifiers(mobEffects, mob.zycie_max);

    // Apply poison to mob before hero attacks
    if (mobMods.poisonDmg > 0) {
      mobHp = Math.max(0, mobHp - mobMods.poisonDmg);
      log.push({ type:'debuff', actor:'Trucizna', text:`Trucizna: −${mobMods.poisonDmg} HP` });
    }

    if (mobHp > 0) {
      // Hero attack with buffs applied
      let heroAtkPostac = postac;
      if (heroMods.atkMult !== 1) {
        const atkMin = Math.round(postac.obrazenia_min * heroMods.atkMult);
        const atkMax = Math.round(postac.obrazenia_max * heroMods.atkMult);
        heroAtkPostac = { ...postac, obrazenia_min: atkMin, obrazenia_max: atkMax };
      }
      if (heroMods.nextCritMult > 0) {
        const forcedDmg = Math.round(((postac.obrazenia_min + postac.obrazenia_max) / 2) * heroMods.nextCritMult);
        log.push({ type:'crit', actor: postac.nazwa, dmg: forcedDmg });
        mobHp = Math.max(0, mobHp - forcedDmg);
        // consume next_crit
        const nc = heroEffects.find(e => e.type === 'next_crit');
        if (nc) nc.turnsLeft = 0;
      } else {
        const heroAtk = fightRound(heroAtkPostac, { ...mob, zycie: mobHp });
        log.push(...heroAtk.log);
        mobHp = heroAtk.defenderHp;
      }
    }

    if (mobHp <= 0) {
      // Mob dies — nagrodę dostaje tylko pierwszy zabójca
      const xpMult = serverConfig.getNum('xp_multiplier', 1) * heroMods.expBonus;
      const reward = await awardMobKill({ postac, mob, expMult: xpMult, now });
      fx.clearBattleEffects(req.session);
      if (!reward) return res.json(MOB_ALREADY_DEAD);
      ({ expGained, levelUp, loot } = reward);
      if (reward.newZycieMax) heroHp = reward.newZycieMax;
      log.push({ type: 'mob_dead', mob: mob.nazwa, exp: expGained });
      status = 'won';
    } else {
      await db.query('UPDATE mob SET zycie=? WHERE id=?', [mobHp, mob.id]);

      // Mob counter-attacks (skip if stunned; absorb_next absorbs full damage)
      if (!mobMods.stunned) {
        const mobAtkObj = fightRound(mob, { ...postac, zycie: heroHp });
        if (heroMods.absorbNext) {
          log.push({ type:'defend', actor: postac.nazwa, text:'Aura ochronna absorbs cios!' });
          // don't apply damage
        } else {
          const incomingEntries = mobAtkObj.log;
          let totalMobDmg = 0;
          incomingEntries.forEach(e => { if (e.dmg) e.dmg = Math.max(1, Math.round(e.dmg * heroMods.defMult)); if (e.dmg) totalMobDmg += e.dmg; });
          log.push(...incomingEntries);
          heroHp = Math.max(0, heroHp - totalMobDmg);
        }
      } else {
        log.push({ type:'debuff', actor: mob.nazwa, text:`${mob.nazwa} jest ogłuszony!` });
      }

      if (heroHp <= 0) {
        const [[dm]] = await db.query('SELECT * FROM mapa WHERE id=?', [postac.mapa]);
        const xpLossPct = Math.max(2, 10 - Math.floor((rawPostac.poziom - 1) / 10));
        deathXpLoss = Math.round(rawPostac.exp * xpLossPct / 100);
        const minXpForLevel = rawPostac.poziom > 1 ? Math.pow(rawPostac.poziom - 1, 4) + 10 : 0;
        const newExpAfterDeath = Math.max(minXpForLevel, rawPostac.exp - deathXpLoss);
        await db.query('UPDATE postac SET zycie=1, mapa=?, x=?, y=?, exp=?, deaths=COALESCE(deaths,0)+1 WHERE id=?',
          [dm.dead_map||1, dm.dead_x||35, dm.dead_y||37, newExpAfterDeath, postac.id]);
        log.push({ type: 'hero_dead', xpLoss: deathXpLoss });
        status = 'lost'; heroHp = 1;
        fx.clearBattleEffects(req.session);
      } else {
        await db.query('UPDATE postac SET zycie=? WHERE id=?', [heroHp, postac.id]);
      }
    }

    const remainingEffects = status === 'ongoing'
      ? fx.tickAndSave(req.session, mob.id, heroEffects, mobEffects)
      : { hero: [], mob: [] };

    res.json({ ok: true, status, log, heroHp, mobHp, loot, expGained, levelUp,
      heroMaxHp: postac.zycie_max, mobMaxHp: mob.zycie_max,
      effects: remainingEffects, xpLoss: deathXpLoss || undefined });
  } catch(e) { next(e); }
});

// ── POST /api/combat/skill ────────────────────────────────────────────────────
router.post('/skill', requireSession, combatLimit, async (req, res, next) => {
  try {
    const { mobId, skillId } = req.body;
    const now = Math.floor(Date.now()/1000);

    const [[rawPostac]] = await db.query('SELECT * FROM postac WHERE id=?', [req.session.postacId]);
    if (!rawPostac || rawPostac.zycie <= 0) return res.json({ ok:false, error:'Postać martwa' });

    const postac = await computeStats(db, rawPostac);

    const [[mob]] = await db.query(
      'SELECT * FROM mob WHERE id=? AND mapa=? AND respawn<=?',
      [mobId, postac.mapa, now]
    );
    if (!mob) return res.json({ ok:false, error:'Mob nie istnieje lub martwy', status:'mob_dead' });

    const dist = Math.max(Math.abs(mob.x-postac.x), Math.abs(mob.y-postac.y));
    if (dist > 2) return res.json({ ok:false, error:'Za daleko' });

    // Sprawdź czy umiejętność jest dostępna dla klasy i poziomu
    const available = skills.getAvailable(postac.profesja, postac.poziom);
    const skill = available.find(s => s.id === skillId);
    if (!skill) return res.json({ ok:false, error:'Nieznana lub niedostępna umiejętność' });

    // Wykonaj umiejętność
    const result = skills.executeSkill(skillId, postac.profesja, postac, mob, {});
    if (!result.ok) return res.json({ ok:false, error: result.error });

    // Store skill effects in session
    if (result.effects && (result.effects.hero || result.effects.mob)) {
      fx.applySkillEffects(req.session, result.effects, mob.id);
    }

    const { hero: heroEffects2, mob: mobEffects2 } = fx.getBattleEffects(req.session, mob.id);
    const heroMods2 = fx.resolveHeroModifiers(heroEffects2);

    let heroHp = postac.zycie + result.heroHpDelta;
    heroHp = Math.min(postac.zycie_max, Math.max(0, heroHp));
    let mobHp  = mob.zycie + result.mobHpDelta;
    mobHp  = Math.max(0, mobHp);

    const log = result.log;
    let status = 'ongoing';
    let loot = null, expGained = 0, levelUp = false;

    if (mobHp <= 0) {
      const xpMult2 = serverConfig.getNum('xp_multiplier', 1) * heroMods2.expBonus;
      const reward = await awardMobKill({ postac, mob, expMult: xpMult2, now });
      fx.clearBattleEffects(req.session);
      if (!reward) return res.json(MOB_ALREADY_DEAD);
      ({ expGained, levelUp, loot } = reward);
      // Po awansie pełne HP — wcześniej nadpisywało je zycie sprzed awansu
      if (reward.newZycieMax) heroHp = reward.newZycieMax;
      log.push({ type:'mob_dead', mob:mob.nazwa, exp:expGained });
      status = 'won';
      await db.query('UPDATE postac SET zycie=? WHERE id=?', [heroHp, postac.id]);
    } else {
      await db.query('UPDATE mob SET zycie=? WHERE id=?', [mobHp, mob.id]);

      // Mob counter-attacks (modified by mob effects)
      const mobMods2 = fx.resolveMobModifiers(mobEffects2, mob.zycie_max);
      if (!mobMods2.stunned) {
        const mobAtk = fightRound(mob, { ...postac, zycie: heroHp });
        if (heroMods2.absorbNext) {
          log.push({ type:'defend', actor: postac.nazwa, text:'Aura ochronna pochłania cios!' });
        } else {
          log.push(...mobAtk.log);
          heroHp = mobAtk.defenderHp;
        }
      } else {
        log.push({ type:'debuff', actor: mob.nazwa, text:`${mob.nazwa} jest ogłuszony!` });
      }

      if (heroHp <= 0) {
        const [[dm]] = await db.query('SELECT * FROM mapa WHERE id=?', [postac.mapa]);
        const xpLossPct = Math.max(2, 10 - Math.floor((rawPostac.poziom - 1) / 10));
        const xpLoss = Math.round(rawPostac.exp * xpLossPct / 100);
        const minXpForLevel = rawPostac.poziom > 1 ? Math.pow(rawPostac.poziom - 1, 4) + 10 : 0;
        const newExpAfterDeath = Math.max(minXpForLevel, rawPostac.exp - xpLoss);
        await db.query('UPDATE postac SET zycie=1,mapa=?,x=?,y=?,exp=?,deaths=COALESCE(deaths,0)+1 WHERE id=?',
          [dm?.dead_map||1, dm?.dead_x||35, dm?.dead_y||37, newExpAfterDeath, postac.id]);
        log.push({ type:'hero_dead', xpLoss });
        status = 'lost'; heroHp = 1;
        fx.clearBattleEffects(req.session);
      } else {
        await db.query('UPDATE postac SET zycie=? WHERE id=?', [heroHp, postac.id]);
      }
    }

    const remainingEffects2 = status === 'ongoing'
      ? fx.tickAndSave(req.session, mob.id, heroEffects2, mobEffects2)
      : { hero: [], mob: [] };

    res.json({ ok:true, status, log, heroHp, mobHp, loot, expGained, levelUp,
      heroMaxHp: postac.zycie_max, mobMaxHp: mob.zycie_max, effects: remainingEffects2 });
  } catch(e) { next(e); }
});

// ── POST /api/combat/pvp ─────────────────────────────────────────────────────
router.post('/pvp', requireSession, combatLimit, async (req, res, next) => {
  try {
    const { targetId } = req.body;
    const [[rawPostac]] = await db.query('SELECT * FROM postac WHERE id=?', [req.session.postacId]);
    if (!rawPostac || rawPostac.zycie <= 0) return res.json({ ok:false, error:'Martwy' });

    const postac = await computeStats(db, rawPostac);
    const [[mapa]]  = await db.query('SELECT * FROM mapa WHERE id=?', [postac.mapa]);
    if (mapa.pvp === 0) return res.json({ ok:false, error:'PvP niedozwolone na tej mapie' });

    const [[rawTarget]] = await db.query('SELECT * FROM postac WHERE id=? AND mapa=?', [targetId, postac.mapa]);
    if (!rawTarget) return res.json({ ok:false, error:'Cel nie istnieje' });
    if (mapa.pvp===1 && rawTarget.pvp!==1) return res.json({ ok:false, error:'Cel nie wyraził zgody na PvP' });

    const target = await computeStats(db, rawTarget);
    const dx = Math.abs(target.x-postac.x), dy = Math.abs(target.y-postac.y);
    if (dx>1||dy>1) return res.json({ ok:false, error:'Za daleko' });

    const log=[];
    let heroHp=postac.zycie, targetHp=target.zycie;

    const a1 = fightRound(postac, {...target, zycie:targetHp});
    log.push(...a1.log); targetHp=a1.defenderHp;

    if (targetHp > 0) {
      const a2 = fightRound(target, {...postac, zycie:heroHp});
      log.push(...a2.log); heroHp=a2.defenderHp;
    }

    const targetWon = heroHp <= 0 && targetHp > 0;
    const heroWon   = targetHp <= 0;

    if (targetHp<=0) { await db.query('UPDATE postac SET zycie=1,mapa=1,x=31,y=47 WHERE id=?',[target.id]); log.push({type:'pvp_win',loser:target.nazwa}); }
    else await db.query('UPDATE postac SET zycie=? WHERE id=?',[targetHp,target.id]);
    if (heroHp<=0) { await db.query('UPDATE postac SET zycie=1,mapa=1,x=31,y=47 WHERE id=?',[postac.id]); log.push({type:'pvp_loss'}); }
    else await db.query('UPDATE postac SET zycie=? WHERE id=?',[heroHp,postac.id]);

    // Record PvP history
    if (heroWon)   recordPvpFight(postac, target, postac.nazwa, target.nazwa);
    if (targetWon) recordPvpFight(postac, target, target.nazwa, postac.nazwa);

    res.json({ ok:true, log, heroHp, targetHp });
  } catch(e) { next(e); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── NOWY SYSTEM WALKI TUROWEJ (v2) ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const c2       = require('../game/combat2');
const sk2      = require('../game/skills2');
const { createLimiter: createLimiter2 } = require('../middleware/rateLimiter');
const turnLimit = createLimiter2(3, 1000);

function parseCS(postac) {
  if (!postac.combat_state) return null;
  try { return JSON.parse(postac.combat_state); }
  catch { return null; }
}
async function saveCS(db, postacId, cs) {
  await db.query('UPDATE postac SET combat_state=? WHERE id=?', [JSON.stringify(cs), postacId]);
}
async function clearCS(db, postacId) {
  await db.query('UPDATE postac SET combat_state=NULL, furia=0, energia=energia_max WHERE id=?', [postacId]);
}

// ── POST /api/combat/start2 — init nowej walki lub wznów ────────────────────
// GET /api/combat/skills — umiejętności klasy (pasek skrótów 1–4)
router.get('/skills', requireSession, async (req, res, next) => {
  try {
    const [[p]] = await db.query('SELECT profesja, poziom FROM postac WHERE id=?', [req.session.postacId]);
    if (!p) return res.json([]);
    res.json(sk2.getSkills2(p.profesja, p.poziom).map(({ id, name, icon, desc, cost, cooldown, tier }) => ({ id, name, icon, desc, cost, cooldown, tier })));
  } catch (e) { next(e); }
});

// Podgląd do panelu akcji: szansa trafienia i zakres obrażeń (te same wzory co combat2)
function attackPreview(postac, mob) {
  const hit = Math.max(5, Math.min(95, (postac.sa || 100) - (mob.ac || 0)));
  const hitChance = Math.round(hit * (1 - Math.min(100, mob.unik || 0) / 100));
  const abs = Math.max(0, Math.round((mob.absorbcja || 0) * (1 - (postac.przebicie || 0) / 100)));
  const dmgMin = Math.max(1, (postac.obrazenia_min || 1) - abs);
  const dmgMax = Math.max(1, (postac.obrazenia_max || 2) - abs);
  const mobHit = Math.max(5, Math.min(95, (mob.sa || 85) - (postac.ac || 0)));
  return { hitChance, dmgMin, dmgMax, ck: postac.ck || 0, mobHitChance: Math.round(mobHit * (1 - Math.min(100, postac.unik || 0) / 100)) };
}

router.post('/start2', requireSession, async (req, res, next) => {
  try {
    const { mobId } = req.body;
    const now = Math.floor(Date.now() / 1000);
    const [[rawPostac]] = await db.query('SELECT * FROM postac WHERE id=?', [req.session.postacId]);
    if (!rawPostac || rawPostac.zycie <= 0) return res.json({ ok: false, error: 'Postać jest martwa' });

    const postac = await computeStats(db, rawPostac);

    // Sprawdź czy jest aktywna walka z TYM samym mobem
    const cs = parseCS(rawPostac);
    if (cs && cs.mob_snapshot?.id === mobId) {
      return res.json({
        ok: true, resumed: true,
        heroHp: cs.hero_hp, heroEn: cs.hero_en, heroFuria: cs.hero_furia,
        heroMaxHp: postac.zycie_max, heroMaxEn: postac.energia_max || 100,
        heroEffects: cs.hero_effects || [],
        mobHp: cs.mob_hp, mobMaxHp: cs.mob_snapshot.zycie_max,
        mobEffects: cs.mob_effects || [],
        mob: cs.mob_snapshot,
        turn: cs.turn || 0,
        cooldowns: cs.cooldowns || {},
        skills: sk2.getSkills2(postac.profesja, postac.poziom),
        preview: attackPreview(postac, cs.mob_snapshot),
      });
    }

    // Wymagaj moba w pobliżu
    const [[mob]] = await db.query(
      'SELECT * FROM mob WHERE id=? AND mapa=? AND respawn<=?',
      [mobId, postac.mapa, now]
    );
    if (!mob) return res.json({ ok: false, error: 'Mob nie istnieje lub jest martwy' });
    const dist = Math.max(Math.abs(mob.x - postac.x), Math.abs(mob.y - postac.y));
    if (dist > 2) return res.json({ ok: false, error: 'Za daleko od moba' });

    // Init stanu
    const heroEn    = rawPostac.energia     ?? rawPostac.energia_max ?? 100;
    const heroEnMax = rawPostac.energia_max ?? 100;
    const newCS = {
      mob_snapshot: {
        id: mob.id, nazwa: mob.nazwa, poziom: mob.poziom, obrazek: mob.obrazek,
        szerokosc: mob.szerokosc || 24, dlugosc: mob.dlugosc || 32,
        zycie_max: mob.zycie_max, paczka: mob.paczka, exp: mob.exp,
        respawn_time: mob.respawn_time || 60,
        obrazenia_min: mob.obrazenia_min || mob.obr_min || 5,
        obrazenia_max: mob.obrazenia_max || mob.obr_max || 10,
        sa: mob.sa || 85, ac: mob.ac || 0,
        absorbcja: mob.absorbcja || 0, mabsorbcja: mob.mabsorbcja || 0,
        ck: mob.ck || 5, ckf: mob.ckf || 150, unik: mob.unik || 0,
        przebicie: mob.przebicie || 0,
        szybkosc: mob.szybkosc || 8, pattern: mob.pattern || 'standard',
        en_max: mob.en_max || 50,
        intelekt: mob.intelekt || 0,
      },
      mob_hp: mob.zycie, mob_en: mob.en_max || 50,
      mob_effects: [], mob_blocking: false,
      hero_hp: postac.zycie, hero_en: heroEn, hero_furia: rawPostac.furia || 0,
      hero_hp_max: postac.zycie_max,
      hero_effects: [],
      turn: 0, cooldowns: {},
      started_at: new Date().toISOString(),
    };
    await saveCS(db, postac.id, newCS);
    await db.query('UPDATE postac SET energia=? WHERE id=?', [heroEn, postac.id]);

    res.json({
      ok: true, resumed: false,
      heroHp: newCS.hero_hp, heroEn: newCS.hero_en, heroFuria: newCS.hero_furia,
      heroMaxHp: postac.zycie_max, heroMaxEn: heroEnMax,
      heroEffects: [],
      mobHp: mob.zycie, mobMaxHp: mob.zycie_max, mobEffects: [],
      mob: newCS.mob_snapshot,
      turn: 0, cooldowns: {},
      skills: sk2.getSkills2(postac.profesja, postac.poziom),
      preview: attackPreview(postac, newCS.mob_snapshot),
    });
  } catch (e) { next(e); }
});

// ── POST /api/combat/turn2 — jedna tura nowego systemu ──────────────────────
router.post('/turn2', requireSession, turnLimit, async (req, res, next) => {
  try {
    const { mobId, action, skillId, itemId } = req.body;

    const [[rawPostac]] = await db.query('SELECT * FROM postac WHERE id=?', [req.session.postacId]);
    if (!rawPostac || rawPostac.zycie <= 0) return res.json({ ok: false, error: 'Postać martwa' });

    const postac = await computeStats(db, rawPostac);
    const cs = parseCS(rawPostac);

    if (!cs || cs.mob_snapshot?.id !== mobId)
      return res.json({ ok: false, error: 'Brak aktywnej walki — wywołaj /start2 najpierw' });

    const mob = cs.mob_snapshot;
    let { mob_hp, mob_en, mob_effects, hero_hp, hero_en, hero_furia, hero_effects, turn, cooldowns } = cs;
    const heroEnMax  = rawPostac.energia_max  ?? 100;
    const heroEnRegen = rawPostac.en_regen    ?? 15;

    const log = [];
    let status = 'ongoing';
    let loot = null, expGained = 0, levelUp = false, xpLoss = 0;

    // ── INICJATYWA ──────────────────────────────────────────────────────────
    const heroEffMods = c2.resolveHeroMods(hero_effects);
    const hasteOn     = hero_effects.some(e => e.type === 'haste');
    const { winner: initWinner } = hasteOn ? { winner: 'hero' } : c2.rollInitiative(postac, mob);
    log.push({
      type: 'initiative',
      winner: initWinner,
      text: initWinner === 'hero' ? '⚡ Ty atakujesz pierwszy!' : '⚠ Wróg idzie pierwszy!',
    });

    // ── MOB DECISION ─────────────────────────────────────────────────────────
    const mobMods    = c2.resolveMobMods(mob_effects);
    const mobDecision = c2.getMobDecision(mob, cs, turn);

    // ── HELPER: wykonaj atak MOBA na BOHATERA ────────────────────────────────
    const executeMobAttack = (opts = {}) => {
      if (mobMods.stunned) {
        log.push({ type: 'debuff', actor: mob.nazwa, text: `${mob.nazwa} jest ogłuszony!` });
        return;
      }
      const mobAttacker = {
        ...mob,
        obrazenia_min: Math.round((mob.obrazenia_min || 5) * (mobMods.atkMult || 1)),
        obrazenia_max: Math.round((mob.obrazenia_max || 10) * (mobMods.atkMult || 1)),
      };
      const defenderWeak = false; // hero nie ma weakness tu
      const defending    = action === 'block' || opts.defending;

      const missType = mobMods.blind ? 'miss' : c2.checkMiss(mobAttacker, postac);
      if (missType) {
        log.push({ type: missType, actor: mob.nazwa });
        return;
      }

      let dmg, isCrit;
      if (opts.dmgMult) {
        const r = c2.calcPhysical(mobAttacker, postac, { dmgMult: opts.dmgMult, defending });
        dmg = r.dmg; isCrit = r.isCrit;
      } else {
        const r = c2.calcPhysical(mobAttacker, postac, { defending });
        dmg = r.dmg; isCrit = r.isCrit;
      }

      // Shield absorption
      if (hero_effects.some(e => e.type === 'absorb_next') && !defending) {
        log.push({ type: 'defend', actor: postac.nazwa, text: 'Aura ochronna absorbuje cios!' });
        hero_effects = hero_effects.filter(e => e.type !== 'absorb_next');
        return;
      }

      const shieldRes = c2.absorbWithShield(hero_effects, dmg);
      if (shieldRes.absorbed > 0) {
        log.push({ type: 'defend', actor: postac.nazwa, text: `Tarcza pochłania ${shieldRes.absorbed} DMG` });
        hero_effects = shieldRes.newEffects || hero_effects;
        dmg = shieldRes.remaining;
      }

      // Barrier blocks first debuff application (nie obrażenia, ale efekty — handled in debuff section)

      hero_hp = Math.max(0, hero_hp - dmg);
      log.push({ type: isCrit ? 'crit' : 'hit', actor: mob.nazwa, dmg });
      // Furia rośnie gdy dostajemy obrażenia (mniejsze, +3)
      hero_furia = c2.updateFuria(hero_furia, -5, heroEffMods.furiaMult); // obrażenia redukują furia
    };

    // ── HELPER: wykonaj atak BOHATERA na MOBA ────────────────────────────────
    const executeHeroAttack = (opts = {}) => {
      const defenderWeak = mob_effects.some(e => e.type === 'weakness');
      const hasBerserk   = hero_furia >= 100;
      const berserkMult  = postac.profesja === 'Wojownik' ? 3 : 2;
      const dmgMult      = (opts.dmgMult || 1) * heroEffMods.atkMult * (hasBerserk ? berserkMult : 1);

      const missType = c2.checkMiss(postac, mob, { attackerBlind: false });
      if (missType) { log.push({ type: missType, actor: postac.nazwa }); return 0; }

      let dmg, isCrit;
      // Sprawdź next_crit buff
      const forceCrit = heroEffMods.nextCritMult > 0;
      const critMult  = heroEffMods.nextCritMult > 0 ? dmgMult * heroEffMods.nextCritMult : dmgMult;
      const r = c2.calcPhysical(postac, mob, {
        dmgMult: critMult, forceCrit, defenderWeak,
        armorPen: opts.armorPen || 0,
      });
      dmg = r.dmg; isCrit = r.isCrit;

      if (forceCrit) hero_effects = hero_effects.filter(e => e.type !== 'next_crit');
      if (hasBerserk) {
        hero_furia = 0;
        log.push({ type: 'berserk', text: `💥 BERSERK! Obrażenia × ${berserkMult}` });
      }

      mob_hp = Math.max(0, mob_hp - dmg);
      log.push({ type: isCrit ? 'crit' : 'hit', actor: postac.nazwa, dmg });
      hero_furia = c2.updateFuria(hero_furia, isCrit ? 15 : 8, heroEffMods.furiaMult);
      return dmg;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Jeśli MOB IDZIE PIERWSZY: mob atakuje przed graczem
    if (initWinner === 'mob' && action !== 'flee') {
      if (mobDecision.type === 'block') {
        log.push({ type: 'defend', actor: mob.nazwa, text: `${mob.nazwa} przyjmuje postawę obronną.` });
        cs.mob_blocking = true;
        mob_en = Math.min(mob.en_max || 50, mob_en + 10);
      } else {
        executeMobAttack({ dmgMult: mobDecision.dmgMult });
        if (mobDecision.type === 'debuff' && mobDecision.effect) {
          const defHasBarrier = hero_effects.some(e => e.type === 'barrier');
          if (defHasBarrier) {
            hero_effects = hero_effects.filter(e => e.type !== 'barrier');
            log.push({ type: 'defend', actor: postac.nazwa, text: 'Bariera blokuje debuff!' });
          } else {
            hero_effects = c2.addEffect(hero_effects, { type: mobDecision.effect, turns: 2 });
            log.push({ type: 'debuff', actor: mob.nazwa, text: `${mob.nazwa} nakłada ${mobDecision.effect}!` });
          }
        }
      }

      // Sprawdź czy gracz żyje po ataku moba (gdy mob szybszy)
      if (hero_hp <= 0) {
        const [[dm]] = await db.query('SELECT * FROM mapa WHERE id=?', [postac.mapa]);
        const xpLossPct = Math.max(2, 10 - Math.floor((rawPostac.poziom - 1) / 10));
        xpLoss = Math.round(rawPostac.exp * xpLossPct / 100);
        const minXp = rawPostac.poziom > 1 ? Math.pow(rawPostac.poziom - 1, 4) + 10 : 0;
        await db.query(
          'UPDATE postac SET zycie=1, mapa=?, x=?, y=?, exp=?, deaths=COALESCE(deaths,0)+1 WHERE id=?',
          [dm?.dead_map || 1, dm?.dead_x || 35, dm?.dead_y || 37, Math.max(minXp, rawPostac.exp - xpLoss), postac.id]
        );
        log.push({ type: 'hero_dead', xpLoss });
        await clearCS(db, postac.id);
        return res.json({ ok: true, status: 'lost', log, heroHp: 1, mobHp: mob_hp, heroMaxHp: postac.zycie_max, mobMaxHp: mob.zycie_max, heroEn: 0, heroFuria: 0, heroEffects: [], mobEffects: mob_effects, turn, cooldowns, xpLoss });
      }
    }

    // ── AKCJA GRACZA ──────────────────────────────────────────────────────────
    if (action === 'flee') {
      hero_en -= 30;
      const fleeChance = 0.55 + Math.max(-0.2, Math.min(0.25, (postac.szybkosc - (mob.szybkosc || 8)) * 0.02));
      if (Math.random() < fleeChance) {
        log.push({ type: 'flee_success', text: 'Udało się uciec!' });
        await db.query('UPDATE postac SET zycie=?, energia=? WHERE id=?', [hero_hp, hero_en, postac.id]);
        await clearCS(db, postac.id);
        return res.json({ ok: true, status: 'fled', log, heroHp: hero_hp, mobHp: mob_hp, heroMaxHp: postac.zycie_max, mobMaxHp: mob.zycie_max, heroEn: hero_en, heroFuria: hero_furia, heroEffects: hero_effects, mobEffects: mob_effects, turn, cooldowns });
      }
      log.push({ type: 'flee_fail', text: 'Ucieczka nieudana!' });
      hero_en = Math.max(0, hero_en - 10);
      // Mob dostaje darmowy atak
      executeMobAttack({ dmgMult: 1.0 });

    } else if (action === 'attack') {
      const en_cost = 0;
      executeHeroAttack();

    } else if (action === 'block') {
      hero_furia = c2.updateFuria(hero_furia, 5, heroEffMods.furiaMult);
      log.push({ type: 'defend', actor: postac.nazwa, text: 'Postawa obronna! (-60% obrażeń)' });
      // Paladyn specjalność: blok leczy 5% HP
      if (postac.profesja === 'Paladyn') {
        const heal = Math.round(postac.zycie_max * 0.05);
        hero_hp = Math.min(postac.zycie_max, hero_hp + heal);
        log.push({ type: 'heal', actor: postac.nazwa, amount: heal, text: 'Święty blok leczy!' });
      }

    } else if (action === 'skill') {
      const avail = sk2.getSkills2(postac.profesja, postac.poziom);
      const skDef = avail.find(s => s.id === skillId);
      if (!skDef) return res.json({ ok: false, error: 'Niedostępna umiejętność' });
      if ((cooldowns[skillId] || 0) > 0) return res.json({ ok: false, error: `Skill na CD: ${cooldowns[skillId]} tur` });

      const isMag = postac.profesja === 'Mag';
      const enCost = Math.max(5, (skDef.cost || 20) - (isMag ? 5 : 0));
      if (hero_en < enCost) return res.json({ ok: false, error: `Za mało energii (${enCost} EN)` });
      hero_en -= enCost;

      const skResult = sk2.executeSkill2(skillId, postac.profesja,
        { postac }, { mob }, { ...cs, hero_hp, hero_en, hero_furia, hero_effects, mob_hp, mob_effects }
      );
      if (!skResult.ok) return res.json({ ok: false, error: skResult.error });

      log.push(...skResult.log);
      hero_hp     = Math.min(postac.zycie_max, hero_hp + (skResult.heroHpDelta || 0));
      mob_hp      = Math.max(0, mob_hp + (skResult.mobHpDelta || 0));
      hero_furia  = c2.updateFuria(hero_furia, skResult.furiaBonus || 0, heroEffMods.furiaMult);
      hero_effects = skResult.newHeroEffs || hero_effects;
      mob_effects  = skResult.newMobEffs  || mob_effects;
      cooldowns    = { ...cooldowns, [skillId]: skDef.cooldown || 3 };

    } else if (action === 'item') {
      const [[item]] = await db.query(
        "SELECT * FROM przedmiot_postac WHERE id=? AND postac=? AND typ='Konsupcyjne'",
        [itemId, postac.id]
      );
      if (!item) return res.json({ ok: false, error: 'Brak przedmiotu' });
      if (!(await consumeItem(item.id, postac.id))) return res.json({ ok: false, error: 'Brak przedmiotu' });
      let healed = 0;
      if (item.pelne_leczenie) { healed = postac.zycie_max - hero_hp; hero_hp = postac.zycie_max; }
      else if (item.mikstura_leczenie > 0) { healed = item.mikstura_leczenie; hero_hp = Math.min(postac.zycie_max, hero_hp + healed); }
      log.push({ type: 'heal', actor: postac.nazwa, amount: healed });
      // Mob darmowy atak po eleksirze
      executeMobAttack({ dmgMult: 1.0 });
    }

    // Zabicie moba w walce v2 (po akcji gracza albo od DOT) — jedna ścieżka nagród
    const finishKill = async () => {
      const expMult = serverConfig.getNum('xp_multiplier', 1) * (heroEffMods.expBonus || 1);
      const reward = await awardMobKill({ postac, mob, expMult });
      await clearCS(db, postac.id);
      if (!reward) return res.json(MOB_ALREADY_DEAD);
      if (reward.newZycieMax) hero_hp = reward.newZycieMax;
      log.push({ type: 'mob_dead', mob: mob.nazwa, exp: reward.expGained });
      await db.query('UPDATE postac SET zycie=? WHERE id=?', [hero_hp, postac.id]);
      return res.json({
        ok: true, status: 'won', log, heroHp: hero_hp, mobHp: 0,
        heroMaxHp: postac.zycie_max, mobMaxHp: mob.zycie_max,
        heroEn: hero_en, heroFuria: Math.min(100, hero_furia),
        heroEffects: hero_effects, mobEffects: [], turn: turn + 1, cooldowns,
        loot: reward.loot, expGained: reward.expGained, levelUp: reward.levelUp,
      });
    };

    // ── SPRAWDŹ CZY MOB MARTWY (po akcji gracza) ──────────────────────────────
    if (mob_hp <= 0) return finishKill();

    // ── MOB KONTRATAKUJE (jeśli hero idzie pierwszy) ──────────────────────────
    if (initWinner === 'hero') {
      if (mobDecision.type === 'block' || cs.mob_blocking) {
        log.push({ type: 'defend', actor: mob.nazwa, text: `${mob.nazwa} blokuje ataki!` });
        mob_en = Math.min(mob.en_max || 50, mob_en + 10);
      } else {
        executeMobAttack({ dmgMult: mobDecision.dmgMult || 1 });
        if (mobDecision.type === 'debuff' && mobDecision.effect) {
          const defHasBarrier = hero_effects.some(e => e.type === 'barrier');
          if (defHasBarrier) {
            hero_effects = hero_effects.filter(e => e.type !== 'barrier');
            log.push({ type: 'defend', actor: postac.nazwa, text: 'Bariera blokuje debuff!' });
          } else {
            hero_effects = c2.addEffect(hero_effects, { type: mobDecision.effect, turns: 2 });
            log.push({ type: 'debuff', actor: mob.nazwa, text: `${mob.nazwa} nakłada ${mobDecision.effect}!` });
          }
        }
        if (mobDecision.type === 'power') {
          log.push({ type: 'hit', actor: mob.nazwa, text: `${mob.nazwa} wykonuje POTĘŻNY ATAK!` });
        }
      }
    }
    cs.mob_blocking = false;

    // ── SPRAWDŹ HERO DEAD ─────────────────────────────────────────────────────
    if (hero_hp <= 0) {
      const [[dm]] = await db.query('SELECT * FROM mapa WHERE id=?', [postac.mapa]);
      const xpLossPct = Math.max(2, 10 - Math.floor((rawPostac.poziom - 1) / 10));
      xpLoss = Math.round(rawPostac.exp * xpLossPct / 100);
      const minXp = rawPostac.poziom > 1 ? Math.pow(rawPostac.poziom - 1, 4) + 10 : 0;
      await db.query(
        'UPDATE postac SET zycie=1, mapa=?, x=?, y=?, exp=?, deaths=COALESCE(deaths,0)+1 WHERE id=?',
        [dm?.dead_map||1, dm?.dead_x||35, dm?.dead_y||37, Math.max(minXp, rawPostac.exp - xpLoss), postac.id]
      );
      log.push({ type: 'hero_dead', xpLoss });
      await clearCS(db, postac.id);
      return res.json({ ok:true, status:'lost', log, heroHp:1, mobHp:mob_hp, heroMaxHp:postac.zycie_max, mobMaxHp:mob.zycie_max, heroEn:0, heroFuria:0, heroEffects:[], mobEffects:mob_effects, turn:turn+1, cooldowns, xpLoss });
    }

    // ── DOT EFEKTY ────────────────────────────────────────────────────────────
    // DOT na moba
    const mobTick = c2.tickAllEffects(mob_effects, mob_hp, mob.zycie_max, log, mob.nazwa);
    mob_hp      = mobTick.hp;
    mob_effects = mobTick.effects;

    if (mob_hp <= 0) return finishKill(); // Mob zginął od DOT

    // DOT na bohatera
    const heroTick = c2.tickAllEffects(hero_effects, hero_hp, postac.zycie_max, log, postac.nazwa);
    hero_hp      = heroTick.hp;
    hero_effects = heroTick.effects;

    if (hero_hp <= 0) {
      const [[dm2]] = await db.query('SELECT * FROM mapa WHERE id=?',[postac.mapa]);
      const xpl = Math.max(2,10-Math.floor((rawPostac.poziom-1)/10));
      xpLoss = Math.round(rawPostac.exp*xpl/100);
      const minXp2 = rawPostac.poziom>1?Math.pow(rawPostac.poziom-1,4)+10:0;
      await db.query('UPDATE postac SET zycie=1,mapa=?,x=?,y=?,exp=?,deaths=COALESCE(deaths,0)+1 WHERE id=?',
        [dm2?.dead_map||1,dm2?.dead_x||35,dm2?.dead_y||37,Math.max(minXp2,rawPostac.exp-xpLoss),postac.id]);
      log.push({type:'hero_dead',xpLoss});
      await clearCS(db,postac.id);
      return res.json({ok:true,status:'lost',log,heroHp:1,mobHp:mob_hp,heroMaxHp:postac.zycie_max,mobMaxHp:mob.zycie_max,heroEn:0,heroFuria:0,heroEffects:[],mobEffects:mob_effects,turn:turn+1,cooldowns,xpLoss});
    }

    // ── REGEN EN + TICK COOLDOWNS ─────────────────────────────────────────────
    const enRegen  = heroEnRegen + (action === 'block' ? 5 : 0);
    hero_en = Math.min(heroEnMax, hero_en + enRegen);
    mob_en  = Math.min(mob.en_max || 50, mob_en + 8);
    hero_furia = Math.min(100, hero_furia); // cap

    // Tick haste (wygasa po 1 turze)
    hero_effects = hero_effects.map(e => e.type === 'haste' ? {...e, turns: (e.turns||1)-1} : e)
                               .filter(e => e.turns === undefined || e.turns > 0);

    // Tick cooldowns
    const newCooldowns = {};
    for (const [k, v] of Object.entries(cooldowns)) {
      if (v > 1) newCooldowns[k] = v - 1;
    }

    // Zapisz nowy stan
    const newCS = {
      ...cs,
      mob_hp, mob_en, mob_effects,
      hero_hp, hero_en, hero_furia, hero_effects,
      turn: turn + 1,
      cooldowns: newCooldowns,
    };
    await saveCS(db, postac.id, newCS);
    await db.query('UPDATE postac SET zycie=?, energia=?, furia=? WHERE id=?', [hero_hp, hero_en, hero_furia, postac.id]);
    await db.query('UPDATE mob SET zycie=? WHERE id=?', [mob_hp, mob.id]);

    return res.json({
      ok: true, status: 'ongoing', log,
      heroHp: hero_hp, heroEn: hero_en, heroFuria: Math.min(100, hero_furia),
      heroMaxHp: postac.zycie_max, heroMaxEn: heroEnMax,
      heroEffects: hero_effects,
      mobHp: mob_hp, mobMaxHp: mob.zycie_max,
      mobEffects: mob_effects,
      initiative: initWinner,
      turn: turn + 1,
      cooldowns: newCooldowns,
    });
  } catch (e) { next(e); }
});

// ── GET /api/combat/state2 — aktualny stan walki ──────────────────────────────
router.get('/state2', requireSession, async (req, res) => {
  try {
    const [[rawPostac]] = await db.query('SELECT * FROM postac WHERE id=?', [req.session.postacId]);
    const cs = parseCS(rawPostac);
    if (!cs) return res.json({ active: false });
    const postac = await computeStats(db, rawPostac);
    res.json({
      active: true,
      mob: cs.mob_snapshot,
      mobHp: cs.mob_hp, mobMaxHp: cs.mob_snapshot?.zycie_max,
      mobEffects: cs.mob_effects || [],
      heroHp: cs.hero_hp, heroEn: cs.hero_en, heroFuria: cs.hero_furia,
      heroMaxHp: postac.zycie_max, heroMaxEn: rawPostac.energia_max || 100,
      heroEffects: cs.hero_effects || [],
      turn: cs.turn, cooldowns: cs.cooldowns || {},
      skills: sk2.getSkills2(postac.profesja, postac.poziom),
    });
  } catch (e) { res.json({ active: false }); }
});

// ── DELETE /api/combat/abort2 — przerwij walkę ───────────────────────────────
router.delete('/abort2', requireSession, async (req, res) => {
  try {
    const [[raw]] = await db.query('SELECT combat_state FROM postac WHERE id=?', [req.session.postacId]);
    const cs = parseCS(raw);
    if (cs?.mob_snapshot?.id) {
      await db.query('UPDATE mob SET zycie=zycie_max WHERE id=?', [cs.mob_snapshot.id]).catch(logError('combat:998'));
    }
    await clearCS(db, req.session.postacId);
    res.json({ ok: true });
  } catch (e) { res.json({ ok: false }); }
});

module.exports = router;
