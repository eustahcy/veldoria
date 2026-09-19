// Combat effect application helpers

// Returns modifiers for the hero's actions this turn
function resolveHeroModifiers(heroEffects) {
  let atkMult    = 1;
  let defMult    = 1;   // multiplier on incoming damage (< 1 = reduced)
  let absorbNext = false;
  let nextCritMult = 0; // if > 0, next attack crits with this mult
  let expBonus   = 1;

  for (const e of heroEffects) {
    switch (e.type) {
      case 'atk':         atkMult   *= e.mult; break;
      case 'def':         defMult   *= e.mult; break;
      case 'absorb_next': absorbNext = true;   break;
      case 'dodge_atk':   atkMult   *= e.mult; break;
      case 'next_crit':   nextCritMult = e.mult; break;
      case 'exp_bonus':   expBonus  *= e.mult; break;
    }
  }
  return { atkMult, defMult, absorbNext, nextCritMult, expBonus };
}

// Returns modifiers restricting the mob's actions this turn
function resolveMobModifiers(mobEffects, mobMaxHp) {
  let stunned   = false;
  let atkMult   = 1;
  let poisonDmg = 0;

  for (const e of mobEffects) {
    switch (e.type) {
      case 'stun':   stunned   = true; break;
      case 'slow':   atkMult  *= 0.5; break;
      case 'poison': poisonDmg += Math.round((mobMaxHp || 20) * 0.03); break;
    }
  }
  return { stunned, atkMult, poisonDmg };
}

// Decrement turnsLeft and remove expired effects
function tickEffects(effects) {
  return effects
    .map(e => ({ ...e, turnsLeft: e.turnsLeft - 1 }))
    .filter(e => e.turnsLeft > 0);
}

// Add/replace effect (same type overwrites)
function addEffect(effects, effect) {
  const next = effects.filter(e => e.type !== effect.type);
  return [...next, { type: effect.type, mult: effect.mult || 1, turnsLeft: effect.duration || 1 }];
}

// Convert raw skill effects from executeSkill into session state
function applySkillEffects(session, skillEffects, activeMobId) {
  if (!session.battleEffects || session.battleEffects.mobId !== activeMobId) {
    session.battleEffects = { mobId: activeMobId, hero: [], mob: [] };
  }

  if (skillEffects.hero) {
    session.battleEffects.hero = addEffect(session.battleEffects.hero, skillEffects.hero);
  }
  if (skillEffects.mob) {
    session.battleEffects.mob = addEffect(session.battleEffects.mob, skillEffects.mob);
  }
}

// Clear battle effects when fight ends
function clearBattleEffects(session) {
  delete session.battleEffects;
}

// Get current effects for a battle (or empty if not this mob)
function getBattleEffects(session, mobId) {
  if (!session.battleEffects || session.battleEffects.mobId !== mobId) {
    return { hero: [], mob: [] };
  }
  return { hero: session.battleEffects.hero || [], mob: session.battleEffects.mob || [] };
}

// Tick effects and save back to session
function tickAndSave(session, mobId, heroEffects, mobEffects) {
  const newHero = tickEffects(heroEffects);
  const newMob  = tickEffects(mobEffects);

  if (newHero.length === 0 && newMob.length === 0) {
    delete session.battleEffects;
  } else {
    session.battleEffects = { mobId, hero: newHero, mob: newMob };
  }

  return { hero: newHero, mob: newMob };
}

module.exports = {
  resolveHeroModifiers,
  resolveMobModifiers,
  tickEffects,
  addEffect,
  applySkillEffects,
  clearBattleEffects,
  getBattleEffects,
  tickAndSave,
};
