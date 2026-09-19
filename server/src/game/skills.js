// Definicje umiejętności per klasa
// type: 'attack' | 'heal' | 'buff' | 'debuff'
const SKILLS = {
  Wojownik: [
    {
      id: 'smash', name: 'Miażdżący Cios', icon: '†',
      desc: 'Zadaj 3× normalne obrażenia. Ignoruje 50% zbroi.',
      type: 'attack', dmgMult: 3, acIgnore: 0.5,
      cooldown: 4, level: 1,
    },
    {
      id: 'rage', name: 'Szał Bojowy', icon: '⚡',
      desc: '+70% ATK przez 2 tury.',
      type: 'buff', stat: 'atk', mult: 1.7, duration: 2,
      cooldown: 5, level: 5,
    },
    {
      id: 'iron_skin', name: 'Żelazna Skóra', icon: '▣',
      desc: 'Zmniejsz otrzymywane obrażenia o 60% przez 2 tury.',
      type: 'buff', stat: 'def', mult: 0.4, duration: 2,
      cooldown: 5, level: 10,
    },
  ],
  Paladyn: [
    {
      id: 'holy_heal', name: 'Święte Uzdrowienie', icon: '+',
      desc: 'Odbuduj 35% maksymalnych HP.',
      type: 'heal', healPct: 0.35,
      cooldown: 4, level: 1,
    },
    {
      id: 'judgment', name: 'Osąd Boski', icon: '★',
      desc: 'Atak magiczny oparty na INT × 8.',
      type: 'attack', magicMult: 8,
      cooldown: 3, level: 5,
    },
    {
      id: 'shield_aura', name: 'Aura Ochronna', icon: '◈',
      desc: 'Następny atak wroga zadaje 0 obrażeń (1 tura).',
      type: 'buff', stat: 'absorb_next', mult: 1, duration: 1,
      cooldown: 6, level: 10,
    },
  ],
  'Tancerz Ostrzy': [
    {
      id: 'double_slash', name: 'Podwójne Cięcie', icon: '‡',
      desc: 'Uderz dwa razy w jednej turze.',
      type: 'attack', hits: 2,
      cooldown: 3, level: 1,
    },
    {
      id: 'poison', name: 'Otrucie', icon: '◌',
      desc: 'Zatruwa wroga — 3% HP jako obrażenia przez 3 tury.',
      type: 'debuff', effect: 'poison', duration: 3,
      cooldown: 4, level: 5,
    },
    {
      id: 'shadow_step', name: 'Cień', icon: '○',
      desc: 'Unik gwarantowany przez 1 turę + atak 2×.',
      type: 'buff', stat: 'dodge_atk', mult: 2, duration: 1,
      cooldown: 5, level: 10,
    },
  ],
  Lowca: [
    {
      id: 'power_shot', name: 'Potężny Strzał', icon: '»',
      desc: 'Zadaj 2.5× obrażenia z szansą 100% na krytyk.',
      type: 'attack', dmgMult: 2.5, forceCrit: true,
      cooldown: 3, level: 1,
    },
    {
      id: 'trap', name: 'Pułapka', icon: '△',
      desc: 'Ogłusz wroga — pomija atak przez 1 turę.',
      type: 'debuff', effect: 'stun', duration: 1,
      cooldown: 5, level: 5,
    },
    {
      id: 'rain_arrows', name: 'Deszcz Strzał', icon: '↓',
      desc: 'Atakuj 4 razy (każdy atak normalny).',
      type: 'attack', hits: 4,
      cooldown: 6, level: 10,
    },
  ],
  Tropiciel: [
    {
      id: 'precise', name: 'Celne Uderzenie', icon: '◎',
      desc: 'Ignoruj całą zbroję AC wroga.',
      type: 'attack', dmgMult: 1.5, acIgnore: 1.0,
      cooldown: 3, level: 1,
    },
    {
      id: 'blood_trail', name: 'Ślad Krwi', icon: '◆',
      desc: 'Następny atak to automatyczny krytyk × 3.',
      type: 'buff', stat: 'next_crit', mult: 3, duration: 1,
      cooldown: 4, level: 5,
    },
    {
      id: 'hunt', name: 'Polowanie', icon: '►',
      desc: '+100% EXP z następnego zabicia.',
      type: 'buff', stat: 'exp_bonus', mult: 2, duration: 3,
      cooldown: 6, level: 10,
    },
  ],
  Mag: [
    {
      id: 'fireball', name: 'Kula Ognia', icon: '✦',
      desc: 'Magiczne obrażenia = INT × 10.',
      type: 'attack', magicMult: 10,
      cooldown: 3, level: 1,
    },
    {
      id: 'ice_bolt', name: 'Lodowy Pocisk', icon: '◇',
      desc: 'Zadaj INT × 6 obrażeń i spowolnij (wróg -50% ATK przez 2 tury).',
      type: 'attack', magicMult: 6, apply: { effect: 'slow', duration: 2 },
      cooldown: 4, level: 5,
    },
    {
      id: 'lightning', name: 'Piorun', icon: '⚡',
      desc: 'Błyskawice — INT × 15, pomija całą zbroję.',
      type: 'attack', magicMult: 15, acIgnore: 1.0,
      cooldown: 5, level: 10,
    },
  ],
};

// Pobierz umiejętności dostępne dla postaci
function getAvailable(profesja, poziom) {
  const all = SKILLS[profesja] || [];
  return all.filter(s => poziom >= s.level);
}

// Wykonaj umiejętność w walce — zwraca { log, heroHpDelta, mobHpDelta, statusEffects }
function executeSkill(skillId, profesja, postac, mob, battleState) {
  const all = SKILLS[profesja] || [];
  const skill = all.find(s => s.id === skillId);
  if (!skill) return { ok: false, error: 'Nieznana umiejętność' };

  const log = [];
  let heroHpDelta = 0;
  let mobHpDelta  = 0;
  const effects = {};

  switch (skill.type) {
    case 'attack': {
      let dmg = 0;

      if (skill.magicMult) {
        // Obrażenia magiczne oparte na INT
        dmg = Math.round(postac.intelekt * skill.magicMult);
      } else {
        const base = Math.round(((postac.obrazenia_min + postac.obrazenia_max) / 2));
        dmg = Math.round(base * (skill.dmgMult || 1));
        if (skill.forceCrit) dmg = Math.round(dmg * 1.5);
      }

      // Ignorowanie zbroi
      const acIgnore = skill.acIgnore || 0;
      const effectiveAc = Math.round(mob.ac * (1 - acIgnore));
      dmg = Math.max(1, dmg - effectiveAc);

      // Zatrucie po ataku (np. Tancerz Ostrzy - ice_bolt z apply)
      if (skill.apply) {
        effects.mob = { type: skill.apply.effect, duration: skill.apply.duration };
      }

      if (skill.hits && skill.hits > 1) {
        // Wiele uderzeń
        let totalDmg = 0;
        for (let i = 0; i < skill.hits; i++) {
          const hitDmg = Math.max(1, Math.round(postac.obrazenia_min + Math.random() * (postac.obrazenia_max - postac.obrazenia_min)) - effectiveAc);
          totalDmg += hitDmg;
          log.push({ type:'hit', actor: postac.nazwa, dmg: hitDmg });
        }
        mobHpDelta = -totalDmg;
        log.unshift({ type:'skill_use', actor: postac.nazwa, skill: skill.name, icon: skill.icon });
      } else {
        mobHpDelta = -dmg;
        log.push({ type:'skill_use', actor: postac.nazwa, skill: skill.name, icon: skill.icon });
        log.push({ type: skill.forceCrit ? 'crit' : 'hit', actor: postac.nazwa, dmg });
      }
      break;
    }

    case 'heal': {
      const healAmount = Math.round(postac.zycie_max * skill.healPct);
      heroHpDelta = healAmount;
      log.push({ type:'skill_use', actor: postac.nazwa, skill: skill.name, icon: skill.icon });
      log.push({ type:'heal', actor: postac.nazwa, amount: healAmount });
      break;
    }

    case 'buff': {
      effects.hero = { type: skill.stat, mult: skill.mult, duration: skill.duration };
      log.push({ type:'skill_use', actor: postac.nazwa, skill: skill.name, icon: skill.icon });
      log.push({ type:'buff', actor: postac.nazwa, text: skill.desc });
      break;
    }

    case 'debuff': {
      effects.mob = { type: skill.effect, duration: skill.duration };
      log.push({ type:'skill_use', actor: postac.nazwa, skill: skill.name, icon: skill.icon });
      log.push({ type:'debuff', actor: postac.nazwa, target: mob.nazwa, text: skill.desc });
      break;
    }
  }

  return { ok: true, log, heroHpDelta, mobHpDelta, effects, skill };
}

module.exports = { SKILLS, getAvailable, executeSkill };
