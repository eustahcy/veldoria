// Combat calculation engine
function roll(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calcHit(attacker, defender) {
  const sa = attacker.sa || 100;
  const ac = defender.ac || 0;
  const hitChance = Math.max(5, Math.min(95, sa - ac));
  return Math.random() * 100 < hitChance;
}

function calcDamage(attacker, defender) {
  let dmg = roll(attacker.obrazenia_min || 0, attacker.obrazenia_max || 1);

  // Critical hit
  const ck = attacker.ck || 0;
  const isCrit = ck > 0 && Math.random() * 100 < ck;
  if (isCrit) {
    const ckf = (attacker.ckf || 120) / 100;
    dmg = Math.round(dmg * ckf);
  }

  // Armor absorption
  const absorbcja = defender.absorbcja || 0;
  const acm = defender.acm || 0;
  const przebicie = attacker.przebicie || 0;

  dmg -= Math.max(0, absorbcja - przebicie);

  // Magic damage
  const magDmg = attacker.obr_mag || 0;
  if (magDmg > 0) {
    const mabsorbcja = defender.mabsorbcja || 0;
    dmg += Math.max(0, magDmg - mabsorbcja);
  }

  return { dmg: Math.max(1, Math.round(dmg)), isCrit };
}

function calcDodge(attacker, defender) {
  const unik = defender.unik || 0;
  return unik > 0 && Math.random() * 100 < unik;
}

function fightRound(attacker, defender) {
  const log = [];

  if (calcDodge(attacker, defender)) {
    log.push({ type: 'dodge', actor: defender.nazwa });
    return { log, defenderHp: defender.zycie };
  }

  if (!calcHit(attacker, defender)) {
    log.push({ type: 'miss', actor: attacker.nazwa });
    return { log, defenderHp: defender.zycie };
  }

  const { dmg, isCrit } = calcDamage(attacker, defender);
  const newHp = Math.max(0, (defender.zycie || defender.zycie_max) - dmg);
  log.push({ type: isCrit ? 'crit' : 'hit', actor: attacker.nazwa, dmg, newHp });

  return { log, defenderHp: newHp };
}

module.exports = { fightRound, roll };
