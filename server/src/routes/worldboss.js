const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { requireSession } = require('../middleware/auth');
const { logError, serverError } = require('../game/log');
const { giveItem } = require('../game/inventory');
const { computeStats }   = require('../game/stats');
const { fightRound }     = require('../game/combat');
const skills             = require('../game/skills');
const fx                 = require('../game/effects');

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseSesja(row) {
  if (!row) return { hero: [], mob: [] };
  try { return JSON.parse(row.debuff_session) || { hero: [], mob: [] }; }
  catch { return { hero: [], mob: [] }; }
}

function emitBossHp(boss) {
  try {
    const io = global.margoIo;
    if (io) io.emit('world_boss_hp_update', { boss_id: boss.id, zycie: boss.zycie, zycie_max: boss.zycie_max });
  } catch (e) { logError('worldboss:24')(e); }
}

function bossAsMob(boss) {
  return {
    nazwa:        boss.nazwa,
    sa:           boss.sa        ?? 110,
    ac:           boss.ac        ?? 20,
    absorbcja:    boss.aktywna_tarcza && Date.now() / 1000 < boss.tarcza_do ? 99999 : (boss.absorbcja ?? 80),
    mabsorbcja:   boss.mabsorbcja ?? 40,
    obrazenia_min:boss.obrazenia_min ?? 80,
    obrazenia_max:boss.obrazenia_max ?? 200,
    ck:           boss.ck  ?? 10,
    ckf:          boss.ckf ?? 200,
    unik:         boss.unik ?? 5,
    przebicie:    0,
    obr_mag:      0,
    zycie:        boss.zycie,
    zycie_max:    boss.zycie_max,
  };
}

async function getParticipant(bossId, postacId) {
  const [[row]] = await db.query(
    'SELECT * FROM world_boss_uczestnicy WHERE boss_id=? AND postac_id=?',
    [bossId, postacId]
  );
  return row;
}

async function upsertParticipant(bossId, postac, dmg, heroHp, heroHpMax, debuffJson, gildiaId, gildiaNazwa) {
  await db.query(
    `INSERT INTO world_boss_uczestnicy
       (boss_id,postac_id,postac_nazwa,obrazenia_zadane,gildia_id,gildia_nazwa,hero_hp,hero_hp_max,debuff_session)
     VALUES (?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       obrazenia_zadane=obrazenia_zadane+?,
       hero_hp=VALUES(hero_hp), hero_hp_max=VALUES(hero_hp_max),
       debuff_session=VALUES(debuff_session),
       gildia_id=COALESCE(gildia_id,VALUES(gildia_id)),
       gildia_nazwa=COALESCE(gildia_nazwa,VALUES(gildia_nazwa))`,
    [bossId, postac.id, postac.nazwa, dmg, gildiaId, gildiaNazwa, heroHp, heroHpMax, debuffJson,
     dmg]
  );
}

async function getPlayerGuild(postacId) {
  const [[gc]] = await db.query(
    'SELECT gc.gildia_id, g.nazwa FROM gildia_czlonkowie gc JOIN gilde g ON g.id=gc.gildia_id WHERE gc.postac_id=?',
    [postacId]
  );
  return gc || null;
}

// Sprawdź i wyzwól zdolności specjalne po zmianie HP bossa
async function checkAbilities(boss, bossHp, io) {
  let zdolnosci;
  try { zdolnosci = JSON.parse(boss.zdolnosci_specjalne) || []; }
  catch { zdolnosci = []; }

  const hpRatio = bossHp / boss.zycie_max;
  let changed = false;
  const triggered = [];

  for (const z of zdolnosci) {
    if (z.wyzwolona) continue;
    if (hpRatio <= z.prog) {
      z.wyzwolona = 1;
      changed = true;
      triggered.push(z);
    }
  }

  if (!changed) return { zdolnosci, triggered: [] };

  // Wykonaj efekty zdolności
  for (const z of triggered) {
    if (z.typ === 'tarcza') {
      const tarczaDo = Math.floor(Date.now() / 1000) + 30;
      await db.query('UPDATE world_boss SET aktywna_tarcza=1, tarcza_do=? WHERE id=?', [tarczaDo, boss.id]);
      if (io) io.emit('world_boss_ability', { boss_id: boss.id, typ: 'tarcza', prog: z.prog });
      if (io) io.emit('chat_message', { kto: '💀 BOSS', tresc: `${boss.nazwa} aktywuje TARCZĘ MOCY!` });
    }
    if (z.typ === 'sluzy') {
      // Spawn 3 sług bossa na mapie bossa
      const minHp = 100 + boss.poziom * 5;
      for (let i = 0; i < 3; i++) {
        const ox = Math.floor(Math.random() * 5) - 2;
        const oy = Math.floor(Math.random() * 5) - 2;
        await db.query(
          `INSERT INTO mob (nazwa, mapa, x, y, zycie, zycie_max, poziom, exp, obrazenia_min, obrazenia_max, sa, ac, respawn, respawn_time, obrazek)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 180, 'potwor1.gif')`,
          [`Sługa ${boss.nazwa}`, boss.mapa_id,
           Math.max(0, (boss.x_pos || 30) + ox),
           Math.max(0, (boss.y_pos || 30) + oy),
           minHp, minHp,
           Math.max(1, boss.poziom - 5),
           boss.poziom * 20,
           Math.floor((boss.obrazenia_min ?? 80) * 0.3),
           Math.floor((boss.obrazenia_max ?? 200) * 0.3),
           90, 10]
        ).catch(logError('worldboss:125'));
      }
      if (io) io.emit('world_boss_ability', { boss_id: boss.id, typ: 'sluzy', prog: z.prog });
      if (io) io.emit('chat_message', { kto: '💀 BOSS', tresc: `${boss.nazwa} przywołuje sługi!` });
    }
    if (z.typ === 'regeneracja') {
      if (io) io.emit('world_boss_ability', { boss_id: boss.id, typ: 'regeneracja', prog: z.prog });
      if (io) io.emit('chat_message', { kto: '💀 BOSS', tresc: `${boss.nazwa} rozpoczyna regenerację!` });
    }
  }

  if (changed) {
    await db.query('UPDATE world_boss SET zdolnosci_specjalne=? WHERE id=?',
      [JSON.stringify(zdolnosci), boss.id]);
  }

  return { zdolnosci, triggered };
}

async function rewardBossKill(bossId, db) {
  try {
    const [[boss]] = await db.query('SELECT * FROM world_boss WHERE id=?', [bossId]);
    if (!boss) return;

    const [participants] = await db.query(
      'SELECT * FROM world_boss_uczestnicy WHERE boss_id=? ORDER BY obrazenia_zadane DESC',
      [bossId]
    );
    if (!participants.length) return;

    const totalDmg = participants.reduce((s, p) => s + Number(p.obrazenia_zadane), 0) || 1;
    const io = global.margoIo;

    // Relikwia — top DPS
    const topPlayer = participants[0];
    if (boss.relikwia_id && topPlayer) {
      try {
        const [[relikwia]] = await db.query('SELECT * FROM przedmiot_loot WHERE id=?', [boss.relikwia_id]);
        if (relikwia) {
          await giveItem(db, topPlayer.postac_id, {
            nazwa: `Relikwia: ${boss.nazwa}`, klasa: 'legenda', typ: relikwia.typ || 'Inny',
            obrazek: relikwia.obrazek || 'item.gif', wym_poziom: boss.poziom,
            wartosc_sprzedazy: boss.poziom * 500,
            zycie: boss.poziom * 20,
            obr_min: Math.floor(boss.obrazenia_min * 0.2), obr_max: Math.floor(boss.obrazenia_max * 0.2),
            sila: 5, zrecznosc: 5, intelekt: 5, ck: 20, ckf: 180, ckm: 120,
            absorbcja: Math.floor(boss.absorbcja * 0.1),
            przebicie: Math.floor(boss.absorbcja * 0.05),
            ilosc: 1, opis: `Zdobyta po pokonaniu ${boss.nazwa}`,
          });
          if (io) io.emit('world_boss_relic', { postac_nazwa: topPlayer.postac_nazwa, boss_nazwa: boss.nazwa });
          if (io) io.emit('chat_message', { kto: '✨ SYSTEM', tresc: `${topPlayer.postac_nazwa} zdobył RELIKWIĘ ${boss.nazwa}!` });
        }
      } catch (e) { logError('worldboss:178')(e); }
    }

    // Nagrody dla wszystkich uczestników (proporcjonalne do DMG)
    const baseExp  = boss.poziom * 400;
    const baseGold = boss.poziom * 150;

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      const share = Math.min(1, Number(p.obrazenia_zadane) / totalDmg);
      const expR  = Math.max(100, Math.round(baseExp  * share * 5));
      const goldR = Math.max(20,  Math.round(baseGold * share * 3));
      const isTop = i === 0;

      await db.query('UPDATE postac SET exp=exp+?, zloto=zloto+?, boss_kills=COALESCE(boss_kills,0)+1 WHERE id=?',
        [expR, goldR, p.postac_id]).catch(logError('worldboss:193'));

      await db.query(
        `INSERT INTO worldboss_kills (postac_id,boss_id,boss_nazwa,obrazenia_zadane,top_dps)
         VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE obrazenia_zadane=obrazenia_zadane+?`,
        [p.postac_id, bossId, boss.nazwa, p.obrazenia_zadane, isTop ? 1 : 0, p.obrazenia_zadane]
      ).catch(logError('worldboss:199'));

      // Achievement przy 10 kills
      const [[kRow]] = await db.query(
        'SELECT COUNT(*) as cnt FROM worldboss_kills WHERE postac_id=? AND boss_id=?',
        [p.postac_id, bossId]
      ).catch(() => [[{ cnt: 0 }]]);
      if (kRow.cnt === 10) {
        await db.query('UPDATE postac SET zloto=zloto+5000 WHERE id=?', [p.postac_id]).catch(logError('worldboss:207'));
        if (io) io.emit('chat_message', { kto: '🏆 SYSTEM', tresc: `${p.postac_nazwa} pokonał ${boss.nazwa} po raz 10! Nagroda: 5000 złota!` });
      }
    }

    // Nagroda gildii z największym wkładem
    try {
      const [[topGuild]] = await db.query(
        'SELECT * FROM worldboss_gildie WHERE boss_id=? ORDER BY obrazenia_laczne DESC LIMIT 1',
        [bossId]
      );
      if (topGuild) {
        const guildBonus = Math.round(baseGold * 2);
        await db.query(
          'UPDATE postac SET zloto=zloto+? WHERE id IN (SELECT postac_id FROM gildia_czlonkowie WHERE gildia_id=?)',
          [guildBonus, topGuild.gildia_id]
        );
        if (io) io.emit('chat_message', { kto: '⚜ SYSTEM', tresc: `Gildia "${topGuild.gildia_nazwa}" zadała największe obrażenia bossowi! Bonus: ${guildBonus}g dla każdego!` });
      }
    } catch (e) { logError('worldboss:226')(e); }

    // Emit ranking
    const [ranking] = await db.query(
      'SELECT postac_nazwa, obrazenia_zadane FROM world_boss_uczestnicy WHERE boss_id=? ORDER BY obrazenia_zadane DESC LIMIT 10',
      [bossId]
    );
    if (io) io.emit('world_boss_ranking', { boss_id: bossId, boss_nazwa: boss.nazwa, ranking });

  } catch (e) {
    console.error('rewardBossKill error:', e.message);
  }
}

// ── GET /worldboss/active ─────────────────────────────────────────────────────
router.get('/active', async (req, res) => {
  try {
    const [[boss]] = await db.query("SELECT * FROM world_boss WHERE status='aktywny' LIMIT 1");
    if (!boss) return res.json(null);

    const postacId = req.session?.postacId;
    let myDmg = 0, myRank = 0, heroHp = null, heroHpMax = null, debuffSession = null;

    if (postacId) {
      const participant = await getParticipant(boss.id, postacId);
      if (participant) {
        myDmg        = participant.obrazenia_zadane || 0;
        heroHp       = participant.hero_hp;
        heroHpMax    = participant.hero_hp_max;
        debuffSession = parseSesja(participant);
      }
      const [[rank]] = await db.query(
        'SELECT COUNT(*)+1 AS pos FROM world_boss_uczestnicy WHERE boss_id=? AND obrazenia_zadane>?',
        [boss.id, myDmg]
      );
      myRank = rank?.pos || 1;
    }

    const hpPct = boss.zycie_max > 0 ? Math.round((boss.zycie / boss.zycie_max) * 100) : 0;
    let zdolnosci = [];
    try { zdolnosci = JSON.parse(boss.zdolnosci_specjalne) || []; } catch {}

    const isTarczaActive = boss.aktywna_tarcza && Math.floor(Date.now() / 1000) < boss.tarcza_do;

    res.json({
      ...boss,
      hpPct,
      myDmg,
      myRank,
      heroHp,
      heroHpMax,
      debuffSession,
      zdolnosci,
      aktywna_tarcza: isTarczaActive ? 1 : 0,
    });
  } catch (e) {
    res.json(null);
  }
});

// ── GET /worldboss/my-session ──────────────────────────────────────────────────
router.get('/my-session', requireSession, async (req, res) => {
  try {
    const [[boss]] = await db.query("SELECT id,zycie,zycie_max FROM world_boss WHERE status='aktywny' LIMIT 1");
    if (!boss) return res.json({ active: false });

    const participant = await getParticipant(boss.id, req.session.postacId);
    if (!participant) return res.json({ active: false, bossHp: boss.zycie, bossHpMax: boss.zycie_max });

    return res.json({
      active: true,
      bossHp: boss.zycie,
      bossHpMax: boss.zycie_max,
      heroHp: participant.hero_hp,
      heroHpMax: participant.hero_hp_max,
      effects: parseSesja(participant),
    });
  } catch (e) {
    res.json({ active: false });
  }
});

// ── POST /worldboss/boss-attack — turowa walka z bossem ───────────────────────
router.post('/boss-attack', requireSession, async (req, res) => {
  try {
    const [[boss]] = await db.query("SELECT * FROM world_boss WHERE status='aktywny' LIMIT 1");
    if (!boss || boss.zycie <= 0) return res.json({ ok: false, error: 'Brak aktywnego bossa' });

    // Sprawdź timer
    if (boss.data_ucieczki && new Date(boss.data_ucieczki) < new Date()) {
      return res.json({ ok: false, error: 'Boss uciekł!', status: 'escaped' });
    }

    const [[rawPostac]] = await db.query('SELECT * FROM postac WHERE id=?', [req.session.postacId]);
    if (!rawPostac || rawPostac.zycie <= 0) return res.json({ ok: false, error: 'Postać jest martwa' });

    const postac = await computeStats(db, rawPostac);
    const io = global.margoIo;

    // Gildия gracza
    const gc = await getPlayerGuild(postac.id);

    // Wczytaj sesję debuffów z tabeli
    let participant = await getParticipant(boss.id, postac.id);
    const effects = participant ? parseSesja(participant) : { hero: [], mob: [] };

    // Inicjalizuj HP gracza w sesji
    const heroHpCurrent = (participant && participant.hero_hp > 0) ? participant.hero_hp : rawPostac.zycie;
    const heroHpMax = postac.zycie_max;

    const heroMods = fx.resolveHeroModifiers(effects.hero);
    const mobMods  = fx.resolveMobModifiers(effects.mob, boss.zycie_max);

    const log = [];
    let heroHp  = heroHpCurrent;
    let bossHpNow = boss.zycie;
    let status = 'ongoing';
    let dmgDealt = 0;

    // Odporności bossa na klasę gracza
    let resistMult = 1.0;
    if (boss.odpornosci) {
      try {
        const odp = JSON.parse(boss.odpornosci);
        if (odp[postac.profesja] !== undefined) resistMult = odp[postac.profesja];
      } catch (e) { logError('worldboss:351')(e); }
    }

    // Poison bossa (jeśli gracz zatruł bossa przez skill)
    if (mobMods.poisonDmg > 0) {
      const poisDmg = Math.round(mobMods.poisonDmg * resistMult);
      bossHpNow = Math.max(0, bossHpNow - poisDmg);
      dmgDealt += poisDmg;
      log.push({ type: 'debuff', actor: 'Trucizna', text: `Trucizna niszczy bossa: −${poisDmg} HP` });
    }

    // ── Atak GRACZA na BOSSA ──────────────────────────────────────────────────
    if (bossHpNow > 0) {
      const bossObj = bossAsMob(boss);
      bossObj.zycie = bossHpNow;

      let attackerPostac = { ...postac };
      if (heroMods.atkMult !== 1) {
        attackerPostac = {
          ...attackerPostac,
          obrazenia_min: Math.round(postac.obrazenia_min * heroMods.atkMult),
          obrazenia_max: Math.round(postac.obrazenia_max * heroMods.atkMult),
        };
      }

      if (heroMods.nextCritMult > 0) {
        const forcedDmg = Math.round(((postac.obrazenia_min + postac.obrazenia_max) / 2) * heroMods.nextCritMult * resistMult);
        log.push({ type: 'crit', actor: postac.nazwa, dmg: forcedDmg });
        bossHpNow = Math.max(0, bossHpNow - forcedDmg);
        dmgDealt += forcedDmg;
        effects.hero = effects.hero.filter(e => e.type !== 'next_crit');
      } else {
        const heroAtk = fightRound(attackerPostac, bossObj);
        // Skaluj obrażenia przez odporność
        const scaledLog = heroAtk.log.map(e => {
          if ((e.type === 'hit' || e.type === 'crit') && e.dmg) {
            const scaled = Math.max(1, Math.round(e.dmg * resistMult));
            return { ...e, dmg: scaled };
          }
          return e;
        });
        log.push(...scaledLog);
        const totalHeroDmg = scaledLog.reduce((s, e) => s + (e.dmg || 0), 0);
        bossHpNow = Math.max(0, bossHpNow - totalHeroDmg);
        dmgDealt += totalHeroDmg;
        if (scaledLog.length === 0) log.push({ type: 'miss', actor: postac.nazwa });
      }

      if (resistMult !== 1.0) {
        const label = resistMult > 1 ? `⬆ słabość × ${resistMult}` : `⬇ odporność × ${resistMult}`;
        log.push({ type: 'resist', actor: boss.nazwa, text: label });
      }
    }

    // ── Aktualizuj HP bossa i ZAPISZ obrażenia ────────────────────────────────
    await db.query('UPDATE world_boss SET zycie=? WHERE id=?', [bossHpNow, boss.id]);
    emitBossHp({ ...boss, zycie: bossHpNow });

    // Update participant (dmgDealt=0 przy check, ale i tak upsert żeby hero_hp było aktualne)
    await upsertParticipant(boss.id, postac, dmgDealt, heroHp, heroHpMax,
      JSON.stringify({ hero: effects.hero, mob: effects.mob }),
      gc?.gildia_id || null, gc?.nazwa || null
    );

    // Guild contribution
    if (gc && dmgDealt > 0) {
      await db.query(
        `INSERT INTO worldboss_gildie (boss_id,gildia_id,gildia_nazwa,obrazenia_laczne) VALUES (?,?,?,?)
         ON DUPLICATE KEY UPDATE obrazenia_laczne=obrazenia_laczne+?`,
        [boss.id, gc.gildia_id, gc.nazwa, dmgDealt, dmgDealt]
      ).catch(logError('worldboss:421'));
      await db.query('UPDATE gildia_czlonkowie SET wklad_boss_dmg=wklad_boss_dmg+? WHERE postac_id=?',
        [dmgDealt, postac.id]).catch(logError('worldboss:423'));
    }

    // ── Sprawdź zdolności specjalne ───────────────────────────────────────────
    const { triggered } = await checkAbilities(boss, bossHpNow, io);
    for (const z of triggered) {
      log.push({ type: 'boss_ability', typ: z.typ, text: `Boss aktywuje: ${z.typ.toUpperCase()}!` });
    }

    // ── BOSS martwy? ──────────────────────────────────────────────────────────
    if (bossHpNow <= 0) {
      await db.query("UPDATE world_boss SET zycie=0, status='martwy', data_smierci=NOW() WHERE id=?", [boss.id]);
      log.push({ type: 'boss_dead', text: `${boss.nazwa} poległ!` });
      await rewardBossKill(boss.id, db);
      if (io) {
        io.emit('world_boss_died', { boss_id: boss.id, nazwa: boss.nazwa });
        io.emit('chat_message', { kto: '⚔ SYSTEM', tresc: `Boss ${boss.nazwa} pokonany! Gratulacje uczestnikom!` });
      }
      // Wyczyść debuffs gracza
      await db.query('UPDATE world_boss_uczestnicy SET debuff_session=NULL, hero_hp=? WHERE boss_id=? AND postac_id=?',
        [heroHp, boss.id, postac.id]).catch(logError('worldboss:443'));
      return res.json({ ok: true, status: 'boss_dead', log, heroHp, bossHp: 0, bossHpMax: boss.zycie_max, dmgDealt });
    }

    // ── Kontratak BOSSA na GRACZA ─────────────────────────────────────────────
    const bossObjAtk = bossAsMob(boss);
    bossObjAtk.zycie = bossHpNow;

    // Boss nie atakuje gdy tarcza jest aktywna (regeneruje)
    const isTarczaActive = boss.aktywna_tarcza && Math.floor(Date.now() / 1000) < boss.tarcza_do;
    if (isTarczaActive) {
      log.push({ type: 'boss_shield', text: `${boss.nazwa} chowa się za TARCZĄ — brak kontrataku!` });
    } else if (!mobMods.stunned) {
      const bossAtk = fightRound(bossObjAtk, { ...postac, zycie: heroHp });

      if (heroMods.absorbNext) {
        log.push({ type: 'defend', actor: postac.nazwa, text: 'Aura ochronna pochłania cios bossa!' });
        effects.hero = effects.hero.filter(e => e.type !== 'absorb_next');
      } else {
        // Skaluj obrażenia bossa przez defMult
        const scaledBossLog = bossAtk.log.map(e => {
          if ((e.type === 'hit' || e.type === 'crit') && e.dmg) {
            return { ...e, dmg: Math.max(1, Math.round(e.dmg * heroMods.defMult)) };
          }
          return e;
        });
        log.push(...scaledBossLog);
        const totalBossDmg = scaledBossLog.reduce((s, e) => s + (e.dmg || 0), 0);
        heroHp = Math.max(0, heroHp - totalBossDmg);
      }

      // Debuff od bossa (30% trucizna, 20% spowolnienie)
      const debuffRoll = Math.random();
      if (debuffRoll < 0.30) {
        effects.hero = fx.addEffect(effects.hero, { type: 'poison', mult: 1, duration: 3 });
        log.push({ type: 'debuff', actor: boss.nazwa, text: `${boss.nazwa} zatruwa! Trucizna (3 tury)` });
      } else if (debuffRoll < 0.50) {
        effects.hero = fx.addEffect(effects.hero, { type: 'slow', mult: 0.7, duration: 2 });
        log.push({ type: 'debuff', actor: boss.nazwa, text: `${boss.nazwa} spowalnia! Spowolnienie (2 tury)` });
      }
    } else {
      log.push({ type: 'debuff', actor: boss.nazwa, text: `${boss.nazwa} jest ogłuszony!` });
    }

    // Trucizna od bossa na gracza (jeśli hero ma poison w hero effects)
    const heroPoison = effects.hero.find(e => e.type === 'poison');
    if (heroPoison) {
      const poisDmg = Math.round(heroHpMax * 0.03);
      heroHp = Math.max(0, heroHp - poisDmg);
      log.push({ type: 'debuff', actor: 'Trucizna', text: `Trucizna: −${poisDmg} HP` });
    }

    // ── GRACZ ginie? ──────────────────────────────────────────────────────────
    if (heroHp <= 0) {
      const [[dm]] = await db.query('SELECT * FROM mapa WHERE id=?', [postac.mapa]);
      const xpLossPct = Math.max(2, 10 - Math.floor((rawPostac.poziom - 1) / 10));
      const xpLoss = Math.round(rawPostac.exp * xpLossPct / 100);
      const minXp  = rawPostac.poziom > 1 ? Math.pow(rawPostac.poziom - 1, 4) + 10 : 0;
      await db.query(
        'UPDATE postac SET zycie=1, mapa=?, x=?, y=?, exp=?, deaths=COALESCE(deaths,0)+1 WHERE id=?',
        [dm?.dead_map || 1, dm?.dead_x || 35, dm?.dead_y || 37, Math.max(minXp, rawPostac.exp - xpLoss), postac.id]
      );
      log.push({ type: 'hero_dead', text: `Poległeś w walce z ${boss.nazwa}! Respawn...` });
      await db.query('UPDATE world_boss_uczestnicy SET debuff_session=NULL, hero_hp=0 WHERE boss_id=? AND postac_id=?',
        [boss.id, postac.id]).catch(logError('worldboss:507'));
      return res.json({ ok: true, status: 'lost', log, heroHp: 1, bossHp: bossHpNow, bossHpMax: boss.zycie_max, xpLoss, dmgDealt });
    }

    // ── Tick efektów po turze ─────────────────────────────────────────────────
    const newHeroEff = fx.tickEffects(effects.hero);
    const newMobEff  = fx.tickEffects(effects.mob);

    // Zapisz HP gracza i efekty
    await db.query('UPDATE postac SET zycie=? WHERE id=?', [heroHp, postac.id]);
    await db.query(
      'UPDATE world_boss_uczestnicy SET hero_hp=?, debuff_session=? WHERE boss_id=? AND postac_id=?',
      [heroHp, JSON.stringify({ hero: newHeroEff, mob: newMobEff }), boss.id, postac.id]
    ).catch(logError('worldboss:520'));

    res.json({
      ok: true, status, log,
      heroHp, bossHp: bossHpNow, bossHpMax: boss.zycie_max,
      effects: { hero: newHeroEff, mob: newMobEff },
      dmgDealt,
    });
  } catch (e) {
    console.error('boss-attack error:', e.message);
    res.json({ ok: false, error: serverError(e, 'worldboss') });
  }
});

// ── POST /worldboss/boss-skill ────────────────────────────────────────────────
router.post('/boss-skill', requireSession, async (req, res) => {
  try {
    const { skillId } = req.body;
    const [[boss]] = await db.query("SELECT * FROM world_boss WHERE status='aktywny' LIMIT 1");
    if (!boss || boss.zycie <= 0) return res.json({ ok: false, error: 'Brak aktywnego bossa' });

    if (boss.data_ucieczki && new Date(boss.data_ucieczki) < new Date()) {
      return res.json({ ok: false, error: 'Boss uciekł!', status: 'escaped' });
    }

    const [[rawPostac]] = await db.query('SELECT * FROM postac WHERE id=?', [req.session.postacId]);
    if (!rawPostac || rawPostac.zycie <= 0) return res.json({ ok: false, error: 'Postać jest martwa' });

    const postac = await computeStats(db, rawPostac);
    const io = global.margoIo;
    const gc = await getPlayerGuild(postac.id);

    const participant = await getParticipant(boss.id, postac.id);
    const effects = participant ? parseSesja(participant) : { hero: [], mob: [] };
    const heroHpCurrent = (participant && participant.hero_hp > 0) ? participant.hero_hp : rawPostac.zycie;
    const heroHpMax = postac.zycie_max;

    // Sprawdź dostępność umiejętności
    const available = skills.getAvailable(postac.profesja, postac.poziom);
    const skill = available.find(s => s.id === skillId);
    if (!skill) return res.json({ ok: false, error: 'Niedostępna umiejętność' });

    const bossObj = bossAsMob(boss);
    const result = skills.executeSkill(skillId, postac.profesja, postac, bossObj, {});
    if (!result.ok) return res.json({ ok: false, error: result.error });

    // Aplikuj efekty skilla
    if (result.effects) {
      if (result.effects.hero) effects.hero = fx.addEffect(effects.hero, result.effects.hero);
      if (result.effects.mob)  effects.mob  = fx.addEffect(effects.mob, result.effects.mob);
    }

    let heroHp  = heroHpCurrent + (result.heroHpDelta || 0);
    heroHp = Math.min(heroHpMax, Math.max(0, heroHp));
    let bossHpNow = boss.zycie + (result.mobHpDelta || 0);
    bossHpNow = Math.max(0, bossHpNow);

    const log = result.log || [];
    let dmgDealt = Math.max(0, -(result.mobHpDelta || 0));

    // Odporności
    if (boss.odpornosci && dmgDealt > 0) {
      try {
        const odp = JSON.parse(boss.odpornosci);
        if (odp[postac.profesja] !== undefined) {
          const scaled = Math.round(dmgDealt * odp[postac.profesja]);
          bossHpNow = Math.min(boss.zycie, boss.zycie - scaled + (boss.zycie - bossHpNow - dmgDealt));
          dmgDealt = scaled;
        }
      } catch (e) { logError('worldboss:589')(e); }
    }

    await db.query('UPDATE world_boss SET zycie=? WHERE id=?', [bossHpNow, boss.id]);
    emitBossHp({ ...boss, zycie: bossHpNow });

    await upsertParticipant(boss.id, postac, dmgDealt, heroHp, heroHpMax,
      JSON.stringify({ hero: effects.hero, mob: effects.mob }),
      gc?.gildia_id || null, gc?.nazwa || null);

    if (gc && dmgDealt > 0) {
      await db.query(
        `INSERT INTO worldboss_gildie (boss_id,gildia_id,gildia_nazwa,obrazenia_laczne) VALUES (?,?,?,?)
         ON DUPLICATE KEY UPDATE obrazenia_laczne=obrazenia_laczne+?`,
        [boss.id, gc.gildia_id, gc.nazwa, dmgDealt, dmgDealt]
      ).catch(logError('worldboss:604'));
    }

    const { triggered } = await checkAbilities(boss, bossHpNow, io);
    for (const z of triggered) log.push({ type: 'boss_ability', typ: z.typ, text: `Boss aktywuje: ${z.typ.toUpperCase()}!` });

    if (bossHpNow <= 0) {
      await db.query("UPDATE world_boss SET zycie=0, status='martwy', data_smierci=NOW() WHERE id=?", [boss.id]);
      log.push({ type: 'boss_dead', text: `${boss.nazwa} poległ!` });
      await rewardBossKill(boss.id, db);
      if (io) {
        io.emit('world_boss_died', { boss_id: boss.id, nazwa: boss.nazwa });
        io.emit('chat_message', { kto: '⚔ SYSTEM', tresc: `Boss ${boss.nazwa} pokonany!` });
      }
      return res.json({ ok: true, status: 'boss_dead', log, heroHp, bossHp: 0, bossHpMax: boss.zycie_max, dmgDealt });
    }

    // Kontratak bossa po skilu
    const heroMods = fx.resolveHeroModifiers(effects.hero);
    const mobMods  = fx.resolveMobModifiers(effects.mob, boss.zycie_max);
    const isTarcza = boss.aktywna_tarcza && Math.floor(Date.now() / 1000) < boss.tarcza_do;
    if (!isTarcza && !mobMods.stunned) {
      const bossAtk = fightRound(bossObj, { ...postac, zycie: heroHp });
      if (!heroMods.absorbNext) {
        const scaledBoss = bossAtk.log.map(e =>
          (e.type === 'hit' || e.type === 'crit') && e.dmg
            ? { ...e, dmg: Math.max(1, Math.round(e.dmg * heroMods.defMult)) } : e
        );
        log.push(...scaledBoss);
        heroHp = Math.max(0, heroHp - scaledBoss.reduce((s,e) => s+(e.dmg||0), 0));
      } else {
        log.push({ type: 'defend', actor: postac.nazwa, text: 'Aura pochłania kontratak bossa!' });
        effects.hero = effects.hero.filter(e => e.type !== 'absorb_next');
      }
    }

    if (heroHp <= 0) {
      const [[dm]] = await db.query('SELECT * FROM mapa WHERE id=?', [postac.mapa]);
      const xpLossPct = Math.max(2, 10 - Math.floor((rawPostac.poziom - 1) / 10));
      const xpLoss = Math.round(rawPostac.exp * xpLossPct / 100);
      const minXp  = rawPostac.poziom > 1 ? Math.pow(rawPostac.poziom - 1, 4) + 10 : 0;
      await db.query(
        'UPDATE postac SET zycie=1, mapa=?, x=?, y=?, exp=?, deaths=COALESCE(deaths,0)+1 WHERE id=?',
        [dm?.dead_map || 1, dm?.dead_x || 35, dm?.dead_y || 37, Math.max(minXp, rawPostac.exp - xpLoss), postac.id]
      );
      log.push({ type: 'hero_dead', text: `Poległeś! Respawn...` });
      return res.json({ ok: true, status: 'lost', log, heroHp: 1, bossHp: bossHpNow, bossHpMax: boss.zycie_max, dmgDealt });
    }

    const newHeroEff = fx.tickEffects(effects.hero);
    const newMobEff  = fx.tickEffects(effects.mob);
    await db.query('UPDATE postac SET zycie=? WHERE id=?', [heroHp, postac.id]);
    await db.query('UPDATE world_boss_uczestnicy SET hero_hp=?, debuff_session=? WHERE boss_id=? AND postac_id=?',
      [heroHp, JSON.stringify({ hero: newHeroEff, mob: newMobEff }), boss.id, postac.id]).catch(logError('worldboss:657'));

    res.json({ ok: true, status: 'ongoing', log, heroHp, bossHp: bossHpNow, bossHpMax: boss.zycie_max,
      effects: { hero: newHeroEff, mob: newMobEff }, dmgDealt });
  } catch (e) {
    console.error('boss-skill error:', e.message);
    res.json({ ok: false, error: 'Błąd serwera' });
  }
});

// ── POST /worldboss/boss-flee ─────────────────────────────────────────────────
router.post('/boss-flee', requireSession, async (req, res) => {
  try {
    const [[boss]] = await db.query("SELECT * FROM world_boss WHERE status='aktywny' LIMIT 1");
    if (!boss) return res.json({ ok: true, status: 'fled', log: [] });

    const postacId = req.session.postacId;
    const fled = Math.random() < 0.65;
    const log = [];

    if (fled) {
      log.push({ type: 'flee_success', text: 'Udało się uciec od bossa!' });
      await db.query('UPDATE world_boss_uczestnicy SET debuff_session=NULL WHERE boss_id=? AND postac_id=?',
        [boss.id, postacId]).catch(logError('worldboss:680'));
      // Przywróć HP gracza z sesji
      const [[part]] = await db.query('SELECT hero_hp FROM world_boss_uczestnicy WHERE boss_id=? AND postac_id=?',
        [boss.id, postacId]).catch(() => [[null]]);
      if (part && part.hero_hp > 0) {
        await db.query('UPDATE postac SET zycie=? WHERE id=?', [part.hero_hp, postacId]);
      }
      return res.json({ ok: true, status: 'fled', log });
    }

    log.push({ type: 'flee_fail', text: 'Ucieczka nieudana — boss blokuje drogę!' });
    // Boss atakuje przy nieudanej ucieczce
    const [[rawPostac]] = await db.query('SELECT * FROM postac WHERE id=?', [postacId]);
    const postac = await computeStats(db, rawPostac);
    const bossAtk = fightRound(bossAsMob(boss), { ...postac, zycie: rawPostac.zycie });
    log.push(...bossAtk.log);
    const heroHp = Math.max(1, bossAtk.defenderHp); // nie może zginąć przy ucieczce
    await db.query('UPDATE postac SET zycie=? WHERE id=?', [heroHp, postacId]);
    await db.query('UPDATE world_boss_uczestnicy SET hero_hp=? WHERE boss_id=? AND postac_id=?',
      [heroHp, boss.id, postacId]).catch(logError('worldboss:699'));

    res.json({ ok: true, status: 'ongoing', log, heroHp, bossHp: boss.zycie, bossHpMax: boss.zycie_max });
  } catch (e) {
    res.json({ ok: false, error: serverError(e, 'worldboss') });
  }
});

// ── POST /worldboss/boss-item (use consumable during boss fight) ──────────────
router.post('/boss-item', requireSession, async (req, res) => {
  try {
    const { itemId } = req.body;
    const [[boss]] = await db.query("SELECT * FROM world_boss WHERE status='aktywny' LIMIT 1");
    if (!boss) return res.json({ ok: false, error: 'Brak bossa' });

    const [[rawPostac]] = await db.query('SELECT * FROM postac WHERE id=?', [req.session.postacId]);
    const postac = await computeStats(db, rawPostac);
    const [[item]] = await db.query(
      "SELECT * FROM przedmiot_postac WHERE id=? AND postac=? AND typ='Konsupcyjne'", [itemId, postac.id]
    );
    if (!item) return res.json({ ok: false, error: 'Brak przedmiotu' });

    const participant = await getParticipant(boss.id, postac.id);
    let heroHp = (participant && participant.hero_hp > 0) ? participant.hero_hp : rawPostac.zycie;

    let healed = 0;
    if (item.pelne_leczenie) { healed = postac.zycie_max - heroHp; heroHp = postac.zycie_max; }
    else if (item.mikstura_leczenie > 0) { healed = item.mikstura_leczenie; heroHp = Math.min(postac.zycie_max, heroHp + healed); }

    await db.query('DELETE FROM przedmiot_postac WHERE id=?', [item.id]);
    await db.query('UPDATE postac SET zycie=? WHERE id=?', [heroHp, postac.id]);
    if (participant) {
      await db.query('UPDATE world_boss_uczestnicy SET hero_hp=? WHERE boss_id=? AND postac_id=?',
        [heroHp, boss.id, postac.id]);
    }

    const log = [{ type: 'heal', actor: postac.nazwa, amount: healed }];

    // Boss atakuje po użyciu przedmiotu
    const bossAtk = fightRound(bossAsMob(boss), { ...postac, zycie: heroHp });
    log.push(...bossAtk.log);
    const finalHp = Math.max(1, bossAtk.defenderHp);
    await db.query('UPDATE postac SET zycie=? WHERE id=?', [finalHp, postac.id]);
    if (participant) {
      await db.query('UPDATE world_boss_uczestnicy SET hero_hp=? WHERE boss_id=? AND postac_id=?',
        [finalHp, boss.id, postac.id]);
    }

    res.json({ ok: true, status: 'ongoing', log, heroHp: finalHp, bossHp: boss.zycie, bossHpMax: boss.zycie_max });
  } catch (e) {
    res.json({ ok: false, error: serverError(e, 'worldboss') });
  }
});

// ── GET /worldboss/ranking/:bossId ───────────────────────────────────────────
router.get('/ranking/:bossId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT postac_nazwa, obrazenia_zadane, gildia_nazwa
       FROM world_boss_uczestnicy WHERE boss_id=?
       ORDER BY obrazenia_zadane DESC LIMIT 10`,
      [req.params.bossId]
    );
    res.json(rows);
  } catch (e) { res.json([]); }
});

// ── GET /worldboss/leaderboard/:bossId (alias) ────────────────────────────────
router.get('/leaderboard/:bossId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT postac_nazwa, obrazenia_zadane FROM world_boss_uczestnicy WHERE boss_id=? ORDER BY obrazenia_zadane DESC LIMIT 10',
      [req.params.bossId]
    );
    res.json(rows);
  } catch (e) { res.json([]); }
});

// ── GET /worldboss/achievements ───────────────────────────────────────────────
router.get('/achievements', requireSession, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT boss_nazwa, COUNT(*) as kills, SUM(obrazenia_zadane) as total_dmg, MAX(top_dps) as top_dps
       FROM worldboss_kills WHERE postac_id=? GROUP BY boss_nazwa`,
      [req.session.postacId]
    );
    res.json(rows);
  } catch (e) { res.json([]); }
});

// ── GET /worldboss/guild-contribution/:bossId ─────────────────────────────────
router.get('/guild-contribution/:bossId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT gildia_nazwa, obrazenia_laczne FROM worldboss_gildie WHERE boss_id=? ORDER BY obrazenia_laczne DESC LIMIT 10',
      [req.params.bossId]
    );
    res.json(rows);
  } catch (e) { res.json([]); }
});

// ── GET /worldboss/history ────────────────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id,nazwa,mapa_id,data_pojawienia,data_smierci,zycie_max FROM world_boss WHERE status IN ('martwy','uciekl') ORDER BY data_smierci DESC LIMIT 10"
    );
    res.json(rows);
  } catch (e) { res.json([]); }
});

module.exports = router;
module.exports.rewardBossKill = rewardBossKill;
