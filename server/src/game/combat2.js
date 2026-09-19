'use strict';

const { roll } = require('./combat');

// ── Inicjatywa ────────────────────────────────────────────────────────────────
function rollInitiative(postac, mob) {
  const heroInit = (postac.szybkosc || 10) + roll(0, 20);
  const mobInit  = (mob.szybkosc   || 8)  + roll(0, 15);
  return { winner: heroInit >= mobInit ? 'hero' : 'mob', heroInit, mobInit };
}

// ── Obliczenie obrażeń fizycznych ─────────────────────────────────────────────
function calcPhysical(attacker, defender, opts = {}) {
  let dmg = roll(attacker.obrazenia_min || 1, attacker.obrazenia_max || 2);

  if (opts.dmgMult) dmg = Math.round(dmg * opts.dmgMult);

  // Berserk (Furia 100%) — podwójne obrażenia
  if (opts.berserk) dmg = Math.round(dmg * (opts.berserkMult || 2));

  // Krytek
  const ck = attacker.ck || 0;
  let isCrit = opts.forceCrit || false;
  if (!isCrit && ck > 0 && Math.random() * 100 < ck) isCrit = true;
  if (isCrit) dmg = Math.round(dmg * ((attacker.ckf || 150) / 100));

  // Penetracja pancerza
  const pen = opts.armorPen !== undefined ? opts.armorPen : (attacker.przebicie || 0);
  const effectiveAbs = Math.max(0, Math.round((defender.absorbcja || 0) * (1 - pen / 100)));
  dmg = Math.max(1, dmg - effectiveAbs);

  // Słabość na defensywnym
  if (opts.defenderWeak) dmg = Math.round(dmg * 1.25);

  // Obrona gracza (BLOK)
  if (opts.defending) dmg = Math.max(1, Math.round(dmg * 0.4));

  return { dmg: Math.max(1, Math.round(dmg)), isCrit };
}

// ── Obliczenie obrażeń magicznych ─────────────────────────────────────────────
function calcMagic(attacker, defender, magicMult, opts = {}) {
  const int = attacker.intelekt || 0;
  let dmg = Math.round(int * magicMult);

  if (opts.berserk) dmg = Math.round(dmg * (opts.berserkMult || 2));

  const acIgnore = opts.acIgnore || 0;
  const mabsorb  = Math.max(0, Math.round((defender.mabsorbcja || 0) * (1 - acIgnore)));
  dmg = Math.max(1, dmg - mabsorb);

  if (opts.defenderWeak) dmg = Math.round(dmg * 1.25);
  if (opts.defending)    dmg = Math.max(1, Math.round(dmg * 0.4));

  return { dmg: Math.max(1, Math.round(dmg)), isCrit: opts.forceCrit || false };
}

// ── Absorbcja przez shield_flat ───────────────────────────────────────────────
function absorbWithShield(heroEffects, incomingDmg) {
  const shIdx = heroEffects.findIndex(e => e.type === 'shield_flat' && e.value > 0);
  if (shIdx === -1) return { remaining: incomingDmg, shieldLeft: 0, absorbed: 0 };

  const sh = heroEffects[shIdx];
  const absorbed = Math.min(sh.value, incomingDmg);
  const newShield = sh.value - absorbed;

  // Zaktualizuj lub usuń shield
  const newEffects = [...heroEffects];
  if (newShield <= 0) newEffects.splice(shIdx, 1);
  else newEffects[shIdx] = { ...sh, value: newShield };

  return { remaining: incomingDmg - absorbed, shieldLeft: newShield, absorbed, newEffects };
}

// ── Unik / chybienie ─────────────────────────────────────────────────────────
function checkMiss(attacker, defender, opts = {}) {
  // Unik defendującego
  const unik = defender.unik || 0;
  if (unik > 0 && Math.random() * 100 < unik) return 'dodge';

  // Celność atakującego
  const sa  = attacker.sa  || 100;
  const ac  = defender.ac  || 0;
  const hit = Math.max(5, Math.min(95, sa - ac));
  if (Math.random() * 100 >= hit) return 'miss';

  // Ślepota na atakującym (mob blind)
  if (opts.attackerBlind && Math.random() < 0.5) return 'miss';

  return null;
}

// ── AI Moba — decyzja ────────────────────────────────────────────────────────
function getMobDecision(mob, cs, turn) {
  const pattern = mob.pattern || 'standard';
  const hpRatio = cs.mob_hp / mob.zycie_max;
  const heroHpRatio = cs.hero_hp / (cs.hero_hp_max || 200);

  switch (pattern) {
    case 'aggressive':
      if (heroHpRatio < 0.3) return { type: 'power', dmgMult: 2.0 };
      return { type: 'attack' };

    case 'defensive':
      if (hpRatio < 0.5 && turn % 2 === 0) return { type: 'block' };
      return { type: 'attack' };

    case 'debuffer': {
      // Aplykuj debuff jeśli nie ma go na graczu
      const hasDebuff = (cs.hero_effects || []).some(e => ['slow','blind','weakness'].includes(e.type));
      if (!hasDebuff) return { type: 'debuff', effect: ['slow','blind','weakness'][Math.floor(Math.random()*3)] };
      return { type: 'attack' };
    }

    case 'berserker': {
      const rageBonus = Math.min(0.6, (1 - hpRatio) * 0.6);
      return { type: 'attack', dmgMult: 1 + rageBonus };
    }

    case 'tactical': {
      const phase = turn % 3;
      if (phase === 0) return { type: 'attack' };
      if (phase === 1) return { type: 'block' };
      return { type: 'power', dmgMult: 1.5 };
    }

    case 'standard':
    default:
      return { type: 'attack' };
  }
}

// ── Tik efektów DOT i aktualizacja trwania ─────────────────────────────────────
function tickAllEffects(effects, targetHp, targetHpMax, log, targetName) {
  let hp = targetHp;
  const newEffects = [];

  for (const eff of effects) {
    let keep = true;
    const turns = (eff.turns || 1) - 1;

    // DOT damage
    if (eff.type === 'burn') {
      const dmg = Math.round((eff.value || 5) * (eff.stacks || 1));
      hp = Math.max(0, hp - dmg);
      log.push({ type: 'dot', actor: '🔥 Płomień', text: `Burn: −${dmg} HP`, dmg });
    }
    if (eff.type === 'bleed') {
      const dmg = Math.round(targetHpMax * 0.04 * (eff.stacks || 1));
      hp = Math.max(0, hp - dmg);
      log.push({ type: 'dot', actor: '◆ Krwawienie', text: `Krwawienie: −${dmg} HP`, dmg });
    }
    if (eff.type === 'poison') {
      const dmg = Math.round(targetHpMax * 0.03);
      hp = Math.max(0, hp - dmg);
      log.push({ type: 'dot', actor: '◌ Trucizna', text: `Trucizna: −${dmg} HP`, dmg });
    }

    // HOT heal
    if (eff.type === 'regen') {
      const heal = eff.value || 20;
      hp = Math.min(targetHpMax, hp + heal);
      log.push({ type: 'regen', actor: '❤ Regen', text: `Regeneracja: +${heal} HP`, heal });
    }

    if (turns > 0) newEffects.push({ ...eff, turns });
  }

  return { hp, effects: newEffects };
}

// ── Rozwiąż modyfikatory gracza z efektów ─────────────────────────────────────
function resolveHeroMods(heroEffects) {
  let atkMult     = 1;
  let defMult     = 1;
  let furiaMult   = 1;
  let hasteBonus  = 0;    // +999 = guaranteed first
  let nextCritMult= 0;
  let expBonus    = 1;
  let barrier     = false;
  let absorbNext  = false;

  for (const e of heroEffects) {
    switch (e.type) {
      case 'atk':          atkMult      *= (e.mult || 1); break;
      case 'def':          defMult      *= (e.mult || 1); break;
      case 'fury_boost':   furiaMult    = 2; break;
      case 'haste':        hasteBonus   = 999; break;
      case 'next_crit':    nextCritMult = (e.mult || 3); break;
      case 'exp_bonus':    expBonus     *= (e.mult || 2); break;
      case 'barrier':      barrier      = true; break;
      case 'absorb_next':  absorbNext   = true; break;
    }
  }

  return { atkMult, defMult, furiaMult, hasteBonus, nextCritMult, expBonus, barrier, absorbNext };
}

// ── Rozwiąż modyfikatory moba z efektów ───────────────────────────────────────
function resolveMobMods(mobEffects) {
  let stunned   = false;
  let blind     = false;
  let silenced  = false;
  let dmgTaken  = 1;     // weakness
  let atkMult   = 1;     // slow

  for (const e of mobEffects) {
    switch (e.type) {
      case 'stun':      stunned  = true; break;
      case 'blind':     blind    = true; break;
      case 'silence':   silenced = true; break;
      case 'weakness':  dmgTaken = 1.25; break;
      case 'slow':      atkMult *= 0.5; break;
    }
  }

  return { stunned, blind, silenced, dmgTaken, atkMult };
}

// ── Dodaj efekt (smart stacking) ──────────────────────────────────────────────
function addEffect(effects, newEff) {
  const def = newEff;
  const existing = effects.findIndex(e => e.type === def.type);

  // Stackowalne efekty
  if (['burn', 'bleed'].includes(def.type)) {
    if (existing !== -1) {
      const prev = effects[existing];
      return effects.map((e, i) => i === existing
        ? { ...e, stacks: Math.min(3, (e.stacks || 1) + 1), turns: Math.max(e.turns, def.turns || 3) }
        : e
      );
    }
    return [...effects, { ...def, stacks: 1 }];
  }

  // Nie-stackowalne — nadpisz istniejący
  if (existing !== -1) {
    return effects.map((e, i) => i === existing ? { ...def } : e);
  }
  return [...effects, { ...def }];
}

// ── Furia ─────────────────────────────────────────────────────────────────────
function updateFuria(currentFuria, delta, furiaMult = 1) {
  return Math.min(100, Math.max(0, Math.round(currentFuria + delta * furiaMult)));
}

module.exports = {
  rollInitiative,
  calcPhysical,
  calcMagic,
  absorbWithShield,
  checkMiss,
  getMobDecision,
  tickAllEffects,
  resolveHeroMods,
  resolveMobMods,
  addEffect,
  updateFuria,
};
