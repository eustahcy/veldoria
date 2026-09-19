'use strict';

// 36 umiejętności — 6 klas × 6 skilli (2 na tier)
// type: attack | heal | buff | debuff | combo
// heroEffect / mobEffect: obiekt dodawany do effects[]

const SKILLS2 = {

  // ── WOJOWNIK ─────────────────────────────────────────────────────────────────
  // Specjalność: FURIA rośnie 2× szybciej; Berserk = 3× zamiast 2×
  Wojownik: [
    {
      id: 'smash2', name: 'Miażdżący Cios', icon: '†', tier: 1,
      desc: '2.5× obrażenia fizyczne, ignoruje 60% pancerza.',
      type: 'attack', cost: 20, cooldown: 3, level: 1,
      dmgMult: 2.5, armorPen: 60,
    },
    {
      id: 'war_cry', name: 'Okrzyk Wojenny', icon: '📣', tier: 1,
      desc: 'Wróg dostaje SŁABOŚĆ — przyjmuje +25% obrażeń przez 3 tury.',
      type: 'debuff', cost: 15, cooldown: 3, level: 1,
      mobEffect: { type: 'weakness', turns: 3 },
    },
    {
      id: 'berserk2', name: 'Szał Bojowy', icon: '⚡', tier: 2,
      desc: '+80% ATK przez 3 tury. Natychmiast +30 Furii.',
      type: 'buff', cost: 35, cooldown: 5, level: 8,
      heroEffect: { type: 'atk', mult: 1.8, turns: 3 },
      furiaBonus: 30,
    },
    {
      id: 'iron_skin2', name: 'Żelazna Skóra', icon: '▣', tier: 2,
      desc: 'Tarcza pochłaniająca level × 8 obrażeń (flat).',
      type: 'buff', cost: 30, cooldown: 4, level: 8,
      heroEffect: { type: 'shield_flat', turns: 999, valueFormula: 'level*8' },
    },
    {
      id: 'last_breath', name: 'Ostatni Oddech', icon: '☆', tier: 3,
      desc: 'Jeśli HP < 35%: przywraca do 65% maks HP. CD: 10.',
      type: 'heal', cost: 50, cooldown: 10, level: 18,
      conditional: 'hp_below_35',
      healPct: 0.65,
    },
    {
      id: 'bone_crush', name: 'Łamacz Kości', icon: '💥', tier: 3,
      desc: '4× obrażenia fizyczne + SŁABOŚĆ na wroga 3 tury.',
      type: 'attack', cost: 45, cooldown: 6, level: 18,
      dmgMult: 4, armorPen: 20,
      mobEffect: { type: 'weakness', turns: 3 },
    },
  ],

  // ── PALADYN ───────────────────────────────────────────────────────────────────
  // Specjalność: każdy BLOK leczy 5% HP; magia święta ignoruje pancerz magiczny
  Paladyn: [
    {
      id: 'holy_heal2', name: 'Święte Uzdrowienie', icon: '+', tier: 1,
      desc: 'Leczy 35% maksymalnego HP.',
      type: 'heal', cost: 25, cooldown: 4, level: 1,
      healPct: 0.35,
    },
    {
      id: 'judgment2', name: 'Osąd Boski', icon: '★', tier: 1,
      desc: 'Magiczny atak: INT × 10, ignoruje pancerz magiczny.',
      type: 'attack', cost: 20, cooldown: 3, level: 1,
      magicMult: 10, acIgnore: 1.0,
    },
    {
      id: 'shield_aura2', name: 'Aura Ochronna', icon: '◈', tier: 2,
      desc: 'BARIERA (blokuje 1 debuff) + tarcza flat INT×3.',
      type: 'buff', cost: 30, cooldown: 5, level: 8,
      heroEffect: { type: 'barrier', turns: 99 },
      heroEffect2: { type: 'shield_flat', turns: 999, valueFormula: 'int*3' },
    },
    {
      id: 'holy_regen', name: 'Błogosławieństwo', icon: '❤', tier: 2,
      desc: 'Regeneracja 50 HP na turę przez 3 tury.',
      type: 'buff', cost: 35, cooldown: 5, level: 8,
      heroEffect: { type: 'regen', value: 50, turns: 3 },
    },
    {
      id: 'divine_ray', name: 'Boski Promień', icon: '☀', tier: 3,
      desc: 'INT × 20 obrażeń magicznych + ŚLEPOTA na wroga 2 tury.',
      type: 'attack', cost: 50, cooldown: 8, level: 18,
      magicMult: 20, acIgnore: 1.0,
      mobEffect: { type: 'blind', turns: 2 },
    },
    {
      id: 'resurrection', name: 'Boski Powrót', icon: '✦', tier: 3,
      desc: 'Jeśli HP < 15%: przywraca 75% HP i aktywuje BARIERĘ. CD: 12.',
      type: 'heal', cost: 60, cooldown: 12, level: 18,
      conditional: 'hp_below_15',
      healPct: 0.75,
      heroEffect: { type: 'barrier', turns: 99 },
    },
  ],

  // ── TANCERZ OSTRZY ────────────────────────────────────────────────────────────
  // Specjalność: BLEED stackuje się 2× szybciej; CIEŃ daje podwójny atak
  'Tancerz Ostrzy': [
    {
      id: 'double2', name: 'Podwójne Cięcie', icon: '‡', tier: 1,
      desc: 'Dwa uderzenia w jednej turze.',
      type: 'attack', cost: 20, cooldown: 3, level: 1,
      hits: 2,
    },
    {
      id: 'bleed_strike', name: 'Krwawe Cięcie', icon: '◆', tier: 1,
      desc: 'Normalny atak + nakłada KRWAWIENIE (stack) na wroga 3 tury.',
      type: 'attack', cost: 18, cooldown: 3, level: 1,
      dmgMult: 1.0,
      mobEffect: { type: 'bleed', turns: 3 },
    },
    {
      id: 'shadow2', name: 'Cień', icon: '○', tier: 2,
      desc: 'Gwarantowana inicjatywa tej tury + uderzenie 2× tego samego obrotu.',
      type: 'buff', cost: 30, cooldown: 5, level: 8,
      heroEffect: { type: 'haste', turns: 1 },
      bonusAttack: true, bonusAttackMult: 2.0,
    },
    {
      id: 'blade_dance', name: 'Taniec Ostrzy', icon: '❋', tier: 2,
      desc: '5 szybkich uderzeń (każde 0.6× normalnych obrażeń).',
      type: 'attack', cost: 40, cooldown: 5, level: 8,
      hits: 5, hitMult: 0.6,
    },
    {
      id: 'killer_instinct', name: 'Instynkt Zabójcy', icon: '⚔', tier: 3,
      desc: 'Jeśli wróg ma KRWAWIENIE: 5× DMG; w przeciwnym razie 2× DMG.',
      type: 'combo', cost: 45, cooldown: 7, level: 18,
      dmgMultBase: 2, dmgMultIfBleed: 5,
    },
    {
      id: 'darkness', name: 'Zasłona Ciemności', icon: '🌑', tier: 3,
      desc: 'UCISZENIE na wroga 3 tury (brak skilli) + SPOWOLNIENIE 2 tury.',
      type: 'debuff', cost: 35, cooldown: 6, level: 18,
      mobEffect:  { type: 'silence', turns: 3 },
      mobEffect2: { type: 'slow', turns: 2 },
    },
  ],

  // ── ŁOWCA ─────────────────────────────────────────────────────────────────────
  // Specjalność: Pułapki trwają 2 tury; strzały zawsze trafią jeśli hero ma haste
  Lowca: [
    {
      id: 'power_shot2', name: 'Potężny Strzał', icon: '»', tier: 1,
      desc: '2.5× DMG, wymuszony krytyk.',
      type: 'attack', cost: 20, cooldown: 3, level: 1,
      dmgMult: 2.5, forceCrit: true,
    },
    {
      id: 'trap2', name: 'Pułapka', icon: '△', tier: 1,
      desc: 'Ogłusza wroga — pomija jego atak przez 1 turę.',
      type: 'debuff', cost: 25, cooldown: 5, level: 1,
      mobEffect: { type: 'stun', turns: 1 },
    },
    {
      id: 'rain2', name: 'Deszcz Strzał', icon: '↓', tier: 2,
      desc: '4 strzały (każdy normalny atak).',
      type: 'attack', cost: 40, cooldown: 6, level: 8,
      hits: 4,
    },
    {
      id: 'mark', name: 'Znacznik', icon: '◎', tier: 2,
      desc: 'Wróg dostaje SŁABOŚĆ (+25% obrażeń) 4 tury.',
      type: 'debuff', cost: 15, cooldown: 3, level: 8,
      mobEffect: { type: 'weakness', turns: 4 },
    },
    {
      id: 'sniper', name: 'Strzał Snajpera', icon: '🎯', tier: 3,
      desc: '3× DMG, 100% penetracja pancerza, zawsze trafia.',
      type: 'attack', cost: 50, cooldown: 8, level: 18,
      dmgMult: 3, armorPen: 100, alwaysHit: true,
    },
    {
      id: 'beast_instinct', name: 'Instynkt Bestii', icon: '🐾', tier: 3,
      desc: 'POŚPIECH (inicjatywa) + FURIA_BOOST (Furia rośnie 2× szybciej) przez 2 tury.',
      type: 'buff', cost: 30, cooldown: 5, level: 18,
      heroEffect:  { type: 'haste', turns: 2 },
      heroEffect2: { type: 'fury_boost', turns: 2 },
    },
  ],

  // ── TROPICIEL ─────────────────────────────────────────────────────────────────
  // Specjalność: zabija zawsze z krytykiem gdy FURIA > 60%; +EXP pasywnie
  Tropiciel: [
    {
      id: 'precise2', name: 'Celne Uderzenie', icon: '◎', tier: 1,
      desc: '1.5× DMG, ignoruje CAŁĄ zbroję.',
      type: 'attack', cost: 20, cooldown: 3, level: 1,
      dmgMult: 1.5, armorPen: 100,
    },
    {
      id: 'blood_trail2', name: 'Ślad Krwi', icon: '◆', tier: 1,
      desc: 'Następny atak jest automatycznym krytykiem × 3.',
      type: 'buff', cost: 20, cooldown: 4, level: 1,
      heroEffect: { type: 'next_crit', mult: 3, turns: 3 },
    },
    {
      id: 'hunt2', name: 'Polowanie', icon: '►', tier: 2,
      desc: '+100% EXP z tego zabicia (przez 3 tury).',
      type: 'buff', cost: 25, cooldown: 6, level: 8,
      heroEffect: { type: 'exp_bonus', mult: 2, turns: 3 },
    },
    {
      id: 'nature_poison', name: 'Trucizna Natury', icon: '🌿', tier: 2,
      desc: 'Nakłada PŁOMIEŃ (magiczny DOT) × 2 stacki przez 4 tury.',
      type: 'debuff', cost: 30, cooldown: 4, level: 8,
      mobEffect: { type: 'burn', value: 20, turns: 4, stacks: 2 },
    },
    {
      id: 'hunter_instinct', name: 'Instynkt Łowcy', icon: '⚔', tier: 3,
      desc: 'Jeśli FURIA ≥ 50%: 4× DMG i reset Furii; w przeciwnym razie 2.5× DMG.',
      type: 'combo', cost: 40, cooldown: 7, level: 18,
      dmgMultBase: 2.5, dmgMultIfFuria: 4, furiaThreshold: 50, resetFuria: true,
    },
    {
      id: 'camouflage', name: 'Kamuflarz', icon: '🎭', tier: 3,
      desc: 'BARIERA + następny atak to wymuszony krytyk × 3.',
      type: 'buff', cost: 35, cooldown: 5, level: 18,
      heroEffect:  { type: 'barrier', turns: 99 },
      heroEffect2: { type: 'next_crit', mult: 3, turns: 3 },
    },
  ],

  // ── MAG ───────────────────────────────────────────────────────────────────────
  // Specjalność: skille kosztują -5 EN; INT×magicMult zawsze ignoruje pancerz
  Mag: [
    {
      id: 'fireball2', name: 'Kula Ognia', icon: '✦', tier: 1,
      desc: 'INT × 10 obrażeń magicznych + PŁOMIEŃ 2 tury.',
      type: 'attack', cost: 18, cooldown: 3, level: 1,
      magicMult: 10, acIgnore: 1.0,
      mobEffect: { type: 'burn', value: 15, turns: 2 },
    },
    {
      id: 'ice_bolt2', name: 'Lodowy Pocisk', icon: '◇', tier: 1,
      desc: 'INT × 7 obrażeń + SPOWOLNIENIE na wroga 2 tury.',
      type: 'attack', cost: 22, cooldown: 4, level: 1,
      magicMult: 7, acIgnore: 1.0,
      mobEffect: { type: 'slow', turns: 2 },
    },
    {
      id: 'lightning2', name: 'Piorun', icon: '⚡', tier: 2,
      desc: 'INT × 16, ignoruje CAŁĄ zbroję. Szansa ogłuszenia 30%.',
      type: 'attack', cost: 38, cooldown: 5, level: 8,
      magicMult: 16, acIgnore: 1.0,
      stunChance: 0.30,
    },
    {
      id: 'arcane_shield', name: 'Tarcza Arcany', icon: '◈', tier: 2,
      desc: 'Tarcza pochłaniająca INT × 5 obrażeń.',
      type: 'buff', cost: 28, cooldown: 4, level: 8,
      heroEffect: { type: 'shield_flat', turns: 999, valueFormula: 'int*5' },
    },
    {
      id: 'meteor', name: 'Meteoryt', icon: '☄', tier: 3,
      desc: 'INT × 26, zawsze krytek, ignoruje zbroję.',
      type: 'attack', cost: 55, cooldown: 8, level: 18,
      magicMult: 26, acIgnore: 1.0, forceCrit: true,
    },
    {
      id: 'time_freeze', name: 'Zamrożenie Czasu', icon: '⏸', tier: 3,
      desc: 'OGŁUSZENIE 2 tury + SPOWOLNIENIE 3 tury.',
      type: 'debuff', cost: 50, cooldown: 10, level: 18,
      mobEffect:  { type: 'stun', turns: 2 },
      mobEffect2: { type: 'slow', turns: 3 },
    },
  ],
};

// ── Pobierz dostępne umiejętności ─────────────────────────────────────────────
function getSkills2(profesja, poziom) {
  const all = SKILLS2[profesja] || [];
  return all.filter(s => poziom >= (s.level || 1));
}

// ── Wykonaj umiejętność ───────────────────────────────────────────────────────
function executeSkill2(skillId, profesja, heroState, mobState, combatState) {
  const all  = SKILLS2[profesja] || [];
  const sk   = all.find(s => s.id === skillId);
  if (!sk) return { ok: false, error: 'Nieznana umiejętność' };

  const postac   = heroState.postac;   // pełne statystyki
  const heroEffs = combatState.hero_effects || [];
  const mobEffs  = combatState.mob_effects  || [];
  const log = [];

  log.push({ type: 'skill_use', actor: postac.nazwa, skill: sk.name, icon: sk.icon });

  let heroHpDelta  = 0;
  let mobHpDelta   = 0;
  let furiaBonus   = sk.furiaBonus || 0;
  let newHeroEffs  = [...heroEffs];
  let newMobEffs   = [...mobEffs];
  const { addEffect } = require('./combat2');

  // ── SKILL TYPES ──────────────────────────────────────────────────────────────
  switch (sk.type) {

    case 'attack': {
      let totalDmg = 0;
      const hasBerserk = combatState.hero_furia >= 100;
      const berserkMult = (profesja === 'Wojownik') ? 3 : 2;
      const heroMods = require('./combat2').resolveHeroMods(heroEffs);
      const mobMods  = require('./combat2').resolveMobMods(mobEffs);
      const defenderWeak = mobEffs.some(e => e.type === 'weakness');

      const hits = sk.hits || 1;
      for (let i = 0; i < hits; i++) {
        const hitMult = (sk.hitMult || 1) * (sk.dmgMult || 1) * heroMods.atkMult;
        let result;
        if (sk.magicMult) {
          result = require('./combat2').calcMagic(postac, mobState.mob, sk.magicMult * heroMods.atkMult, {
            acIgnore: sk.acIgnore || 0, forceCrit: sk.forceCrit,
            berserk: hasBerserk, berserkMult, defenderWeak,
          });
        } else {
          // Sprawdź next_crit
          const forceCrit = sk.forceCrit || heroMods.nextCritMult > 0;
          const mult = heroMods.nextCritMult > 0 ? hitMult * heroMods.nextCritMult : hitMult;
          result = require('./combat2').calcPhysical(postac, mobState.mob, {
            dmgMult: mult, armorPen: sk.armorPen || 0,
            forceCrit, berserk: hasBerserk, berserkMult, defenderWeak,
          });
        }
        totalDmg += result.dmg;
        log.push({ type: result.isCrit ? 'crit' : 'hit', actor: postac.nazwa, dmg: result.dmg });
        furiaBonus += result.isCrit ? 15 : 8;
      }
      if (hasBerserk) { furiaBonus -= 100; log.push({ type: 'berserk', text: '💥 BERSERK!' }); }
      mobHpDelta = -totalDmg;
      // next_crit consumed
      if (heroMods.nextCritMult > 0) newHeroEffs = newHeroEffs.filter(e => e.type !== 'next_crit');
      break;
    }

    case 'heal': {
      const isCondHP35 = sk.conditional === 'hp_below_35' && (combatState.hero_hp / (combatState.hero_hp_max || 1)) >= 0.35;
      const isCondHP15 = sk.conditional === 'hp_below_15' && (combatState.hero_hp / (combatState.hero_hp_max || 1)) >= 0.15;
      if (isCondHP35 || isCondHP15) {
        log.push({ type: 'miss', actor: 'System', text: 'Warunek użycia niespełniony (HP za wysokie)' });
        break;
      }
      const targetHp = sk.healPct ? Math.round((combatState.hero_hp_max || 200) * sk.healPct) : 0;
      const healAmt  = sk.conditional ? Math.round((combatState.hero_hp_max || 200) * sk.healPct) - combatState.hero_hp : targetHp;
      heroHpDelta = Math.max(0, healAmt);
      log.push({ type: 'heal', actor: postac.nazwa, amount: heroHpDelta });
      break;
    }

    case 'buff': {
      if (sk.heroEffect) {
        let eff = { ...sk.heroEffect };
        if (eff.valueFormula) {
          eff.value = evalFormula(eff.valueFormula, postac);
          delete eff.valueFormula;
        }
        newHeroEffs = addEffect(newHeroEffs, eff);
      }
      if (sk.heroEffect2) {
        let eff2 = { ...sk.heroEffect2 };
        if (eff2.valueFormula) {
          eff2.value = evalFormula(eff2.valueFormula, postac);
          delete eff2.valueFormula;
        }
        newHeroEffs = addEffect(newHeroEffs, eff2);
      }
      if (sk.bonusAttack) {
        const res = require('./combat2').calcPhysical(postac, mobState.mob, { dmgMult: sk.bonusAttackMult || 2 });
        mobHpDelta = -res.dmg;
        furiaBonus += 10;
        log.push({ type: res.isCrit ? 'crit' : 'hit', actor: postac.nazwa, dmg: res.dmg });
      }
      log.push({ type: 'buff', actor: postac.nazwa, text: sk.desc });
      break;
    }

    case 'debuff': {
      if (sk.mobEffect) {
        newMobEffs = addEffect(newMobEffs, { ...sk.mobEffect });
        log.push({ type: 'debuff', actor: postac.nazwa, target: mobState.mob.nazwa, text: sk.desc });
      }
      if (sk.mobEffect2) newMobEffs = addEffect(newMobEffs, { ...sk.mobEffect2 });
      break;
    }

    case 'combo': {
      const hasFuria = combatState.hero_furia >= (sk.furiaThreshold || 50);
      const hasBleed = mobEffs.some(e => e.type === 'bleed');
      const mult = (sk.dmgMultIfBleed && hasBleed) ? sk.dmgMultIfBleed
        : (sk.dmgMultIfFuria && hasFuria) ? sk.dmgMultIfFuria
        : (sk.dmgMultBase || 2);
      const heroMods = require('./combat2').resolveHeroMods(heroEffs);
      const res = require('./combat2').calcPhysical(postac, mobState.mob, { dmgMult: mult * heroMods.atkMult });
      mobHpDelta = -res.dmg;
      furiaBonus += res.isCrit ? 15 : 8;
      log.push({ type: res.isCrit ? 'crit' : 'hit', actor: postac.nazwa, dmg: res.dmg,
        text: hasFuria || hasBleed ? `COMBO AKTYWNY! ${mult}×` : undefined });
      if (sk.resetFuria && hasFuria) { furiaBonus -= combatState.hero_furia; log.push({ type: 'berserk', text: 'Furia zużyta!' }); }
      break;
    }
  }

  // Aplikuj efekty na moba / gracza ze skilla (poza 'buff' / 'debuff' które już obsłużone)
  if (sk.type === 'attack') {
    if (sk.mobEffect) newMobEffs = addEffect(newMobEffs, { ...sk.mobEffect });
    if (sk.mobEffect2) newMobEffs = addEffect(newMobEffs, { ...sk.mobEffect2 });
    if (sk.stunChance && Math.random() < sk.stunChance) {
      newMobEffs = addEffect(newMobEffs, { type: 'stun', turns: 1 });
      log.push({ type: 'debuff', actor: postac.nazwa, text: `⚡ Ogłuszenie z błyskawicy!` });
    }
    if (sk.heroEffect) newHeroEffs = addEffect(newHeroEffs, { ...sk.heroEffect });
    if (sk.heroEffect2) newHeroEffs = addEffect(newHeroEffs, { ...sk.heroEffect2 });
  }
  if (sk.type === 'heal') {
    if (sk.heroEffect) newHeroEffs = addEffect(newHeroEffs, { ...sk.heroEffect });
  }

  return {
    ok: true, log,
    heroHpDelta, mobHpDelta,
    furiaBonus,
    newHeroEffs, newMobEffs,
    skill: sk,
  };
}

function evalFormula(formula, postac) {
  if (formula === 'level*8') return (postac.poziom || 1) * 8;
  if (formula === 'int*3')   return (postac.intelekt || 0) * 3;
  if (formula === 'int*5')   return (postac.intelekt || 0) * 5;
  return 0;
}

module.exports = { SKILLS2, getSkills2, executeSkill2 };
