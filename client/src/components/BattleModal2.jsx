import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';

// ── Kolory i style logów ──────────────────────────────────────────────────────
const LOG_CFG = {
  hit:          { c: '#E8D070', i: '†' },
  crit:         { c: '#FDE047', i: '‼' },
  miss:         { c: '#6B7280', i: '–' },
  dodge:        { c: '#818CF8', i: '◌' },
  heal:         { c: '#4ADE80', i: '+' },
  regen:        { c: '#34D399', i: '↑' },
  defend:       { c: '#C8940A', i: '▣' },
  flee_success: { c: '#4ADE80', i: '→' },
  flee_fail:    { c: '#EF4444', i: '✗' },
  mob_dead:     { c: '#FFD700', i: '★' },
  hero_dead:    { c: '#EF4444', i: '✗' },
  buff:         { c: '#86EFAC', i: '▲' },
  debuff:       { c: '#F87171', i: '▼' },
  dot:          { c: '#FB923C', i: '◆' },
  skill_use:    { c: '#A5B4FC', i: '✦' },
  berserk:      { c: '#FF4500', i: '💥' },
  initiative:   { c: '#FCD34D', i: '⚡' },
  start:        { c: '#C8940A', i: '►' },
};

function fmtLog(e) {
  const cfg = LOG_CFG[e.type] || { c: '#CDD4AA', i: '•' };
  let text = e.text || '';
  if (!text) switch (e.type) {
    case 'hit':       text = `${e.actor} trafia za ${e.dmg}`; break;
    case 'crit':      text = `${e.actor} KRYTYK! ×${e.dmg}`; break;
    case 'miss':      text = `${e.actor} chybia`; break;
    case 'dodge':     text = `${e.actor} unika!`; break;
    case 'heal':      text = `${e.actor} leczy +${e.amount} HP`; break;
    case 'regen':     text = `Regeneracja: +${e.heal} HP`; break;
    case 'defend':    text = `Postawa obronna`; break;
    case 'dot':       text = e.text || `DOT: −${e.dmg} HP`; break;
    case 'skill_use': text = `${e.actor} → ${e.skill} ${e.icon || ''}`; break;
    case 'berserk':   text = `💥 BERSERK! Następny atak × ${e.mult || 2}`; break;
    case 'initiative': text = e.text; break;
    case 'mob_dead':  text = `${e.mob} poległ! +${e.exp} EXP`; break;
    case 'hero_dead': text = `Zginąłeś! Respawn...`; break;
    case 'flee_success': text = 'Uciekłeś!'; break;
    case 'flee_fail':    text = 'Ucieczka nieudana!'; break;
    default: text = e.text || e.type;
  }
  return { color: cfg.c, icon: cfg.i, text };
}

// ── Metadane efektów ─────────────────────────────────────────────────────────
const EFFECT_META = {
  shield_flat:  { label: 'Tarcza',    color: '#C8940A', icon: '▣' },
  regen:        { label: 'Regen',     color: '#4ADE80', icon: '❤' },
  haste:        { label: 'Pośpiech',  color: '#FDE047', icon: '⚡' },
  fury_boost:   { label: 'Furia×2',  color: '#F97316', icon: '🔥' },
  barrier:      { label: 'Bariera',   color: '#A5B4FC', icon: '◈' },
  absorb_next:  { label: 'Absorb',    color: '#A5B4FC', icon: '◈' },
  next_crit:    { label: 'Krytek×3',  color: '#FCD34D', icon: '★' },
  exp_bonus:    { label: 'EXP+',      color: '#4ADE80', icon: '►' },
  atk:          { label: 'ATK+',      color: '#FDE047', icon: '⚡' },
  burn:         { label: 'Płomień',   color: '#EF4444', icon: '🔥' },
  bleed:        { label: 'Krwaw.',    color: '#F87171', icon: '◆' },
  poison:       { label: 'Trucizna',  color: '#86EFAC', icon: '◌' },
  slow:         { label: 'Spowol.',   color: '#F59E0B', icon: '▼' },
  stun:         { label: 'Ogłusz.',   color: '#F87171', icon: '✗' },
  weakness:     { label: 'Słabość',   color: '#818CF8', icon: '⬇' },
  blind:        { label: 'Ślepota',   color: '#6B7280', icon: '○' },
  silence:      { label: 'Ucisz.',    color: '#8B5CF6', icon: '🔇' },
};

function EffBadge({ eff, side }) {
  const m = EFFECT_META[eff.type] || { label: eff.type, color: '#CDD4AA', icon: '·' };
  const stackTxt = eff.stacks > 1 ? `×${eff.stacks}` : '';
  const valTxt   = eff.value ? ` (${eff.value})` : '';
  const cdTxt    = eff.turns < 99 ? ` ${eff.turns}t` : '';
  return (
    <span title={`${m.label}${valTxt}${cdTxt}`} style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      padding: '1px 6px', borderRadius: 8, margin: '1px 2px',
      background: side === 'hero' ? 'rgba(200,150,32,0.12)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${m.color}44`,
      fontSize: 8, color: m.color, whiteSpace: 'nowrap',
    }}>
      {m.icon} {m.label}{stackTxt}{cdTxt}
    </span>
  );
}

// ── Oprawa ekranu walki (ciemny kamień + złoto, jak reszta HUD) ──────────────
const B = {
  gold: '#e7c158', goldHi: '#f7e3a4', goldDim: '#96793a', bronze: '#7a5f2a',
  text: '#e8e2d4', muted: '#9a9182', dim: '#5e584c',
  serif: "'Cinzel','Palatino Linotype',Palatino,serif",
  font: "'Trebuchet MS', Verdana, sans-serif",
};
const TILE_BG = 56; // skala tła areny (px na kafel mapy)

// Pasek zasobu z ikoną, wartością po prawej i połyskiem
function ResBar({ icon, value, max, from, to, text, height = 10, reverse }) {
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: B.text, marginBottom: 3, flexDirection: reverse ? 'row-reverse' : 'row' }}>
        <span style={{ width: 16, textAlign: 'center' }}>{icon}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontWeight: 600, textShadow: '0 1px 2px #000' }}>{text ?? `${Math.round(value)}/${Math.round(max)}`}</span>
      </div>
      <div style={{
        height, borderRadius: height / 2, overflow: 'hidden', background: 'rgba(0,0,0,0.65)',
        border: '1px solid rgba(0,0,0,0.9)', boxShadow: `0 0 0 1px ${B.bronze}55`,
        display: 'flex', justifyContent: reverse ? 'flex-end' : 'flex-start',
      }}>
        <div style={{
          width: `${pct * 100}%`, height: '100%', position: 'relative',
          background: `linear-gradient(180deg, ${to}, ${from})`, transition: 'width 0.4s ease',
          boxShadow: `0 0 10px ${to}66`,
        }}>
          <span style={{ position: 'absolute', inset: '0 0 55% 0', background: 'linear-gradient(180deg,rgba(255,255,255,0.35),transparent)' }} />
        </div>
      </div>
    </div>
  );
}

// Liczba obrażeń unosząca się nad celem
function FloatDmg({ value, color }) {
  return (
    <div style={{
      position: 'absolute', left: '50%', top: '15%', transform: 'translateX(-50%)',
      color, fontWeight: 900, fontSize: Math.abs(value) > 99 ? 28 : 24, fontFamily: B.serif,
      textShadow: `0 0 12px ${color}aa, 0 2px 0 #000, 0 0 4px #000`,
      pointerEvents: 'none', zIndex: 10, animation: 'floatUp 1s ease-out forwards',
    }}>{value > 0 ? `+${value}` : value}</div>
  );
}

function Portrait({ children, color, flash }) {
  return (
    <div style={{
      width: 64, height: 72, flexShrink: 0, display: 'grid', placeItems: 'center', overflow: 'hidden', borderRadius: 3,
      background: `radial-gradient(ellipse at 50% 80%, ${color}33, rgba(6,5,4,0.95) 70%)`,
      border: `1px solid ${flash ? '#ef4444' : color}`,
      boxShadow: flash ? '0 0 18px rgba(239,68,68,0.7)' : `inset 0 0 12px rgba(0,0,0,0.9), 0 0 0 1px #000`,
      transition: 'all .12s',
    }}>{children}</div>
  );
}

// Karta akcji na dole ekranu
const ACTIONS = [
  { id: 'attack', label: 'Atak',       icon: '🗡️', key: 'A', color: '#5fd07a' },
  { id: 'skill',  label: 'Skill',      icon: '✦',  key: 'S', color: '#7c8cff' },
  { id: 'block',  label: 'Blok',       icon: '🛡️', key: 'B', color: '#e7c158' },
  { id: 'item',   label: 'Przedmiot',  icon: '🧪', key: 'I', color: '#c792ea' },
  { id: 'flee',   label: 'Ucieczka',   icon: '🏃', key: 'F', color: '#9a9182' },
];

function ActionCard({ a, onClick, onHover, disabled, active, glow, compact }) {
  return (
    <button onClick={onClick} onMouseEnter={onHover} onFocus={onHover} disabled={disabled} style={{
      flex: 1, minWidth: 0, position: 'relative', height: compact ? 58 : 70, cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
      background: disabled ? 'rgba(10,9,8,0.8)' : `linear-gradient(180deg, ${a.color}${active ? '33' : '1c'}, rgba(10,9,8,0.92) 85%)`,
      border: `1px solid ${disabled ? '#2e2820' : a.color + (active ? 'ff' : '88')}`, borderRadius: 4,
      boxShadow: glow ? `0 0 18px ${a.color}aa` : active ? `0 0 14px ${a.color}55, inset 0 0 0 1px ${a.color}55` : 'inset 0 1px 0 rgba(255,255,255,0.05)',
      color: disabled ? B.dim : B.text, fontFamily: B.font, fontSize: compact ? 11.5 : 13, fontWeight: 600,
      transition: 'all .12s', WebkitTapHighlightColor: 'transparent',
    }}>
      <span style={{ fontSize: compact ? 19 : 23, lineHeight: 1, color: a.color, filter: disabled ? 'grayscale(1)' : `drop-shadow(0 0 6px ${a.color}88)` }}>{a.icon}</span>
      {a.label}
      {!compact && <span style={{ position: 'absolute', top: 4, right: 7, fontSize: 9, color: B.dim }}>[{a.key}]</span>}
    </button>
  );
}

const fmtTime = (d) => d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const PATTERN = { standard: 'Standard', aggressive: 'Agresywny', defensive: 'Obronny', caster: 'Mag', berserker: 'Szał', boss: 'Boss' };

// ─────────────────────────────────────────────────────────────────────────────
export default function BattleModal2({ mob: initMob, postac: initPostac, mapa, onClose, onEnd, onLog }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [loading,     setLoading]     = useState(true);
  const [initError,   setInitError]   = useState(null);
  const [status,      setStatus]      = useState('ongoing');
  const [turn,        setTurn]        = useState(0);

  const [heroHp,      setHeroHp]      = useState(initPostac.zycie);
  const [heroEn,      setHeroEn]      = useState(100);
  const [heroFuria,   setHeroFuria]   = useState(0);
  const [heroMaxHp,   setHeroMaxHp]   = useState(initPostac.zycie_max);
  const [heroMaxEn,   setHeroMaxEn]   = useState(100);
  const [heroEffects, setHeroEffects] = useState([]);

  const [mobHp,       setMobHp]       = useState(initMob.zycie);
  const [mobMaxHp,    setMobMaxHp]    = useState(initMob.zycie_max);
  const [mobEffects,  setMobEffects]  = useState([]);
  const [mobData,     setMobData]     = useState(initMob);

  const [log,         setLog]         = useState([]);
  const [skills,      setSkills]      = useState([]);
  const [cooldowns,   setCooldowns]   = useState({});
  const [consumables, setConsumables] = useState([]);
  const [panel,       setPanel]       = useState(null); // 'skill' | 'item' | null
  const [hover,       setHover]       = useState('attack');
  const [preview,     setPreview]     = useState(null);
  const [lastInit,    setLastInit]    = useState(null);
  const [loot,        setLoot]        = useState(null);
  const [expGained,   setExpGained]   = useState(0);
  const [levelUp,     setLevelUp]     = useState(false);
  const [xpLoss,      setXpLoss]      = useState(0);
  const [particles,   setParticles]   = useState([]);
  const [flashHero,   setFlashHero]   = useState(false);
  const [flashMob,    setFlashMob]    = useState(false);
  const [logOpen,     setLogOpen]     = useState(true);
  const [narrow,      setNarrow]      = useState(() => window.innerWidth < 760);

  const logRef = useRef(null);

  useEffect(() => {
    const fn = () => setNarrow(window.innerWidth < 760);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const addLog = useCallback((entries) => {
    const t = new Date();
    setLog(prev => [...prev, ...entries.map((e, i) => ({ ...e, t, key: Date.now() + i + Math.random() }))].slice(-120));
  }, []);

  const loadConsumables = useCallback(() => {
    api.items.inventory().then(items => Array.isArray(items) &&
      setConsumables(items.filter(i => i.zalozony === 0 && i.typ === 'Konsupcyjne' && (i.mikstura_leczenie > 0 || i.pelne_leczenie)))
    ).catch(() => {});
  }, []);

  // ── Init combat ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const r = await api.combat.start2(initMob.id);
        if (!r.ok) { setInitError(r.error || 'Błąd inicjalizacji walki'); setLoading(false); return; }
        setHeroHp(r.heroHp);     setHeroEn(r.heroEn);    setHeroFuria(r.heroFuria);
        setHeroMaxHp(r.heroMaxHp); setHeroMaxEn(r.heroMaxEn);
        setHeroEffects(r.heroEffects || []);
        setMobHp(r.mobHp);       setMobMaxHp(r.mobMaxHp); setMobEffects(r.mobEffects || []);
        setSkills(r.skills || []);
        setCooldowns(r.cooldowns || {});
        if (r.turn) setTurn(r.turn);
        if (r.preview) setPreview(r.preview);
        if (r.mob) setMobData(prev => ({ ...prev, ...r.mob }));
        addLog([{ type: 'start', text: r.resumed ? `Walka z ${initMob.nazwa} wznowiona.` : 'Rozpoczyna się walka!' }]);
      } catch (e) {
        setInitError('Błąd połączenia z serwerem');
      } finally {
        setLoading(false);
      }
    })();
    loadConsumables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log, logOpen]);

  const addParticle = useCallback((side, value, color) => {
    const id = Date.now() + Math.random();
    setParticles(p => [...p, { id, side, value, color }]);
    setTimeout(() => setParticles(p => p.filter(x => x.id !== id)), 1100);
  }, []);

  // ── Handle server response ─────────────────────────────────────────────────
  const handleResult = useCallback((r) => {
    if (!r.ok) {
      addLog([{ type: 'miss', actor: 'System', text: r.error || 'Błąd' }]);
      // Inny gracz zabił moba pierwszy — walka się kończy bez nagrody
      if (r.status === 'mob_dead') { setStatus('mob_dead'); onEnd?.(); }
      return;
    }

    if (r.log) {
      const iniEntry = r.log.find(e => e.type === 'initiative');
      if (iniEntry) setLastInit(iniEntry.winner);
    }

    const me = initPostac.nazwa;
    const heroGotHit = r.log?.some(e => (e.type === 'hit' || e.type === 'crit') && e.actor !== me && e.actor !== 'System' && !e.actor?.startsWith('◆') && !e.actor?.startsWith('🔥') && !e.actor?.startsWith('◌'));
    const mobGotHit  = r.log?.some(e => (e.type === 'hit' || e.type === 'crit') && e.actor === me);
    if (heroGotHit) { setFlashHero(true); setTimeout(() => setFlashHero(false), 280); }
    if (mobGotHit)  { setFlashMob(true);  setTimeout(() => setFlashMob(false), 280); }

    r.log?.forEach(e => {
      if ((e.type === 'hit' || e.type === 'crit') && e.dmg) {
        if (e.actor === me) addParticle('mob', -e.dmg, e.type === 'crit' ? '#fde047' : '#ff8a6b');
        else addParticle('hero', -e.dmg, '#ef4444');
      }
      if (e.type === 'heal' && e.amount) addParticle('hero', +e.amount, '#4ade80');
      if (e.type === 'miss' || e.type === 'dodge') addParticle(e.actor === me ? 'mob' : 'hero', 0, '#9ca3af');
    });

    if (r.log) {
      addLog(r.log);
      onLog?.(r.log.map((e, i) => ({ ...e, key: Date.now() + i + Math.random() })));
    }

    if (r.heroHp   !== undefined) setHeroHp(r.heroHp);
    if (r.heroEn   !== undefined) setHeroEn(r.heroEn);
    if (r.heroFuria !== undefined) setHeroFuria(Math.min(100, r.heroFuria));
    if (r.heroEffects) setHeroEffects(r.heroEffects);
    if (r.mobHp      !== undefined) setMobHp(Math.max(0, r.mobHp));
    if (r.mobEffects) setMobEffects(r.mobEffects);
    if (r.cooldowns) setCooldowns(r.cooldowns);
    if (r.turn !== undefined) setTurn(r.turn);

    if (r.status && r.status !== 'ongoing') {
      setStatus(r.status);
      setPanel(null);
      if (r.loot)      setLoot(r.loot);
      if (r.expGained) setExpGained(r.expGained);
      if (r.levelUp)   setLevelUp(true);
      if (r.xpLoss)    setXpLoss(r.xpLoss);
      onEnd?.();
    }
    loadConsumables();
  }, [addLog, addParticle, onLog, onEnd, initPostac.nazwa, loadConsumables]);

  const doAction = useCallback(async (action, skillId = null, itemId = null) => {
    if (loading || status !== 'ongoing') return;
    setLoading(true);
    setPanel(null);
    try {
      const r = await api.combat.turn2(initMob.id, action, skillId, itemId);
      handleResult(r);
    } catch (e) {
      addLog([{ type: 'miss', actor: 'System', text: 'Błąd połączenia' }]);
    } finally {
      setLoading(false);
    }
  }, [loading, status, initMob.id, handleResult, addLog]);

  const pressAction = useCallback((id) => {
    setHover(id);
    if (id === 'skill') { setPanel(p => (p === 'skill' ? null : 'skill')); return; }
    if (id === 'item') {
      if (consumables.length === 1) doAction('item', null, consumables[0].id);
      else setPanel(p => (p === 'item' ? null : 'item'));
      return;
    }
    doAction(id);
  }, [consumables, doAction]);

  // Skróty klawiszowe
  useEffect(() => {
    const fn = e => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'Escape') { if (panel) setPanel(null); else if (status !== 'ongoing') onClose(); return; }
      if (status !== 'ongoing' || loading) return;
      if (/^[1-9]$/.test(e.key)) {
        const sk = skills[Number(e.key) - 1];
        if (sk && !(cooldowns[sk.id] > 0) && heroEn >= (sk.cost || 0)) doAction('skill', sk.id);
        return;
      }
      const a = ACTIONS.find(x => x.key === e.key.toUpperCase());
      if (a) pressAction(a.id);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [status, loading, panel, pressAction, onClose, skills, cooldowns, heroEn, doAction]);

  // ── Wyliczenia ─────────────────────────────────────────────────────────────
  const isBerserk   = heroFuria >= 100;
  const berserkMult = initPostac.profesja === 'Wojownik' ? 3 : 2;
  const ended       = status !== 'ongoing';
  const heroFirst   = lastInit !== 'mob';

  const resultColor = status === 'won' ? '#4ADE80' : status === 'fled' || status === 'mob_dead' ? '#e7c158' : '#EF4444';
  const resultText  = status === 'won' ? 'ZWYCIĘSTWO!' : status === 'fled' ? 'UCIECZKA UDANA'
    : status === 'mob_dead' ? 'KTOŚ BYŁ SZYBSZY' : 'PORAŻKA';

  const info = (() => {
    const p = preview;
    switch (hover) {
      case 'skill': return {
        title: 'Skill', desc: `Umiejętności klasy ${initPostac.profesja}. Kosztują energię i mają czas odnowienia.`,
        right: [['Dostępne', `${skills.filter(s => !(cooldowns[s.id] > 0) && heroEn >= (s.cost || 0)).length} / ${skills.length}`], ['Energia', `${Math.round(heroEn)} / ${Math.round(heroMaxEn)}`]],
      };
      case 'block': return {
        title: 'Blok', desc: 'Przyjmujesz postawę obronną: otrzymujesz 60% mniej obrażeń i odzyskujesz 5 energii.',
        right: p ? [['Szansa trafienia wroga', `${p.mobHitChance}%`], ['Redukcja obrażeń', '60%']] : [],
      };
      case 'item': return {
        title: 'Przedmiot', desc: consumables.length ? 'Użyj mikstury leczącej. Zużywa turę.' : 'Nie masz mikstur leczących.',
        right: [['Mikstury', String(consumables.reduce((n, c) => n + (c.ilosc || 1), 0))]],
      };
      case 'flee': return {
        title: 'Ucieczka', desc: 'Próba wycofania się z walki. Gdy się nie uda, wróg wyprowadza atak.',
        right: [],
      };
      default: return {
        title: 'Atak', desc: isBerserk ? `BERSERK! Następny atak zada × ${berserkMult} obrażeń.` : 'Zadaje standardowe obrażenia bronią.',
        right: p ? [
          ['Szansa trafienia', `${p.hitChance}%`],
          ['Przewidywane obrażenia', `${p.dmgMin * (isBerserk ? berserkMult : 1)} - ${p.dmgMax * (isBerserk ? berserkMult : 1)}`],
        ] : [],
      };
    }
  })();

  // Tło areny: fragment mapy wokół gracza, przyciemniony
  const W = (mapa?.maks_x ?? 0) + 1, H = (mapa?.maks_y ?? 0) + 1;
  const px = initPostac.x ?? 0, py = initPostac.y ?? 0;

  const mobW = mobData.szerokosc || 32, mobH = mobData.dlugosc || 48;
  const mobScale = Math.max(1.5, Math.min(4, 130 / mobH));

  const effectsList = (list, side) => list.length === 0
    ? <span style={{ color: B.dim, fontSize: 11.5 }}>Brak efektów</span>
    : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>{list.map((e, i) => <EffBadge key={i} eff={e} side={side} />)}</div>;

  const logColor = (e) => {
    if (e.type === 'start') return '#8fb8ff';
    if (e.type === 'mob_dead' || e.type === 'crit') return '#fde047';
    if (e.type === 'hero_dead') return '#ef4444';
    if ((e.type === 'hit' || e.type === 'dot') && e.actor !== initPostac.nazwa) return '#ff6b5b';
    if (e.type === 'heal' || e.type === 'regen' || e.type === 'flee_success') return '#4ade80';
    return fmtLog(e).color === '#CDD4AA' ? B.text : fmtLog(e).color;
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  const sidebar = (
    <div style={{
      width: narrow ? '100%' : 180, flexShrink: 0, padding: narrow ? '8px 10px' : '12px 12px',
      borderLeft: narrow ? 'none' : `1px solid ${B.bronze}66`, borderTop: narrow ? `1px solid ${B.bronze}66` : 'none',
      background: 'linear-gradient(180deg,#14110d,#0c0a08)', display: narrow ? 'flex' : 'block', gap: 14,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: B.goldHi, fontFamily: B.serif, fontSize: 12.5, marginBottom: 8 }}>⚔ Kolejność tur</div>
        {[heroFirst ? 'hero' : 'mob', heroFirst ? 'mob' : 'hero'].map((s, i) => (
          <div key={s} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '5px 7px', marginBottom: 4, borderRadius: 3,
            background: i === 0 && !ended ? 'rgba(95,208,122,0.12)' : 'transparent',
            border: `1px solid ${i === 0 && !ended ? '#5fd07a66' : 'transparent'}`,
          }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 10.5, border: `1px solid ${B.bronze}`, color: B.text }}>{i + 1}</span>
            <span style={{ fontSize: 12, color: s === 'hero' ? '#9be8ac' : B.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {s === 'hero' ? `${initPostac.nazwa} (Ty)` : mobData.nazwa}
            </span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, marginTop: narrow ? 0 : 14 }}>
        <div style={{ color: B.goldHi, fontFamily: B.serif, fontSize: 12.5, marginBottom: 8 }}>✦ Efekty</div>
        <div style={{ fontSize: 12, color: B.text, marginBottom: 2 }}>{initPostac.nazwa}</div>
        {effectsList(heroEffects, 'hero')}
        <div style={{ fontSize: 12, color: B.text, margin: '8px 0 2px' }}>{mobData.nazwa}</div>
        {effectsList(mobEffects, 'mob')}
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 650,
      background: 'rgba(3,3,2,0.82)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: B.font, color: B.text, padding: narrow ? 0 : 12,
    }}>
      <div style={{
        width: 1020, maxWidth: '100%', maxHeight: '100%', height: narrow ? '100%' : 'auto',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(180deg,#15120e,#0b0907)',
        border: narrow ? 'none' : `1px solid ${B.bronze}`, borderRadius: narrow ? 0 : 4,
        boxShadow: '0 0 0 1px #000, 0 24px 70px rgba(0,0,0,0.9)',
      }}>
        {/* ── NAGŁÓWEK ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: narrow ? '9px 12px' : '11px 18px', flexShrink: 0,
          paddingTop: narrow ? 'calc(env(safe-area-inset-top, 0px) + 9px)' : undefined,
          background: 'linear-gradient(180deg,#1f1a13,#110e0a)', borderBottom: `1px solid ${B.bronze}`,
        }}>
          <span style={{ color: '#5fd07a', fontSize: 20 }}>⚔</span>
          <span style={{ fontFamily: B.serif, fontSize: narrow ? 14 : 18, color: B.goldHi, letterSpacing: 1, fontWeight: 700 }}>WALKA TUROWA</span>
          <span style={{ padding: '2px 11px', borderRadius: 999, fontSize: 11.5, color: '#9be8ac', border: '1px solid #5fd07a88', background: 'rgba(95,208,122,0.1)' }}>
            Tura {Math.max(1, turn + (ended ? 0 : 1))}
          </span>
          {loading && turn > 0 && <span style={{ fontSize: 11, color: B.dim }}>↻</span>}
          {!narrow && <span style={{ marginLeft: 'auto', color: B.muted, fontSize: 12.5 }}>{mapa?.nazwa || ''}</span>}
          <button onClick={onClose} title={ended ? 'Zamknij' : 'Schowaj okno (walka zostanie wznowiona po kliknięciu potwora)'} style={{
            marginLeft: narrow ? 'auto' : 12, width: 32, height: 32, background: 'none', border: 'none', color: B.gold, fontSize: 20, cursor: 'pointer',
          }}>✕</button>
        </div>

        {initError && (
          <div style={{ padding: 30, textAlign: 'center', color: '#F87171', fontSize: 14 }}>
            ✗ {initError}
            <button onClick={onClose} style={{ display: 'block', margin: '14px auto 0', padding: '8px 22px', background: '#1a0c0a', color: '#ff8b78', border: '1px solid #a8281c', borderRadius: 3, cursor: 'pointer' }}>Zamknij</button>
          </div>
        )}
        {!initError && loading && turn === 0 && log.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: B.muted, fontFamily: B.serif }}>Przygotowanie do walki…</div>
        )}

        {!initError && log.length > 0 && (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: narrow ? 'column' : 'row', flexShrink: 0 }}>
            {/* ── ARENA ── */}
            <div style={{ flex: 1, position: 'relative', height: narrow ? 300 : 330, overflow: 'hidden', background: 'linear-gradient(180deg,#1d2a17,#0f140b)' }}>
              {mapa?.obrazek && (
                <div style={{
                  position: 'absolute', left: '50%', top: '58%', width: W * TILE_BG, height: H * TILE_BG,
                  transform: `translate(${-(px + 0.5) * TILE_BG}px, ${-(py + 0.5) * TILE_BG}px)`,
                  backgroundImage: `url(/assets/${mapa.obrazek})`, backgroundSize: '100% 100%',
                  imageRendering: 'pixelated', filter: 'brightness(0.62) saturate(0.95) blur(0.6px)',
                }} />
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, transparent 35%, rgba(0,0,0,0.7) 100%), linear-gradient(180deg, rgba(0,0,0,0.45), transparent 40%, rgba(0,0,0,0.35))' }} />

              {/* Bohater: karta + pasek */}
              <div style={{ position: 'absolute', left: 12, top: 12, width: narrow ? '46%' : 260 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Portrait color={B.gold} flash={flashHero}>
                    <span style={{ width: 32, height: 48, transform: 'scale(1.35)', imageRendering: 'pixelated', backgroundImage: `url(/assets/${initPostac.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat' }} />
                  </Portrait>
                  {!narrow && (
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: B.serif, fontSize: 17, color: B.goldHi, textShadow: '0 2px 4px #000' }}>{initPostac.nazwa}</div>
                      <div style={{ fontSize: 12, color: B.muted }}>poz. {initPostac.poziom} • {initPostac.profesja}</div>
                    </div>
                  )}
                </div>
                {narrow && <div style={{ fontFamily: B.serif, fontSize: 13, color: B.goldHi, marginTop: 4, textShadow: '0 1px 3px #000' }}>{initPostac.nazwa}</div>}
                <ResBar icon="💚" value={heroHp} max={heroMaxHp} from="#15803d" to="#4ade80" height={9} />
                <ResBar icon="⚡" value={heroEn} max={heroMaxEn} from="#1d4ed8" to="#60a5fa" height={9} />
                <ResBar icon="🔥" value={heroFuria} max={100} from="#b45309" to={isBerserk ? '#ff4500' : '#f59e0b'} height={7} text={`${Math.round(heroFuria)}%${isBerserk ? ' BERSERK!' : ''}`} />
              </div>

              {/* Potwór: karta + pasek */}
              <div style={{ position: 'absolute', right: 12, top: 12, width: narrow ? '46%' : 260, textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexDirection: 'row-reverse' }}>
                  <Portrait color="#e5624c" flash={flashMob}>
                    <span style={{ width: mobW, height: mobH, transform: `scale(${Math.min(2, 60 / Math.max(mobW, mobH))})`, imageRendering: 'pixelated', backgroundImage: `url(/assets/${mobData.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat' }} />
                  </Portrait>
                  {!narrow && (
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: B.serif, fontSize: 17, color: '#ff9b7b', textShadow: '0 2px 4px #000' }}>{mobData.nazwa}</div>
                      <div style={{ fontSize: 12, color: B.muted }}>poz. {mobData.poziom} • {PATTERN[mobData.pattern] || 'Standard'}</div>
                    </div>
                  )}
                </div>
                {narrow && <div style={{ fontFamily: B.serif, fontSize: 13, color: '#ff9b7b', marginTop: 4, textShadow: '0 1px 3px #000' }}>{mobData.nazwa} <span style={{ color: B.muted, fontSize: 11 }}>poz. {mobData.poziom}</span></div>}
                <ResBar icon="❤️" value={mobHp} max={mobMaxHp} from="#991b1b" to="#ef4444" height={9} reverse />
              </div>

              {/* VS */}
              <div style={{
                position: 'absolute', left: '50%', top: narrow ? '56%' : '48%', transform: 'translate(-50%,-50%)',
                display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'none',
              }}>
                <span style={{ width: 50, height: 1, background: `linear-gradient(90deg,transparent,${B.gold})` }} />
                <span style={{
                  fontFamily: B.serif, fontSize: narrow ? 26 : 36, fontWeight: 700,
                  background: 'linear-gradient(180deg,#f7e3a4,#d8ab3d 60%,#9a7526)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 4px #000)',
                }}>VS</span>
                <span style={{ width: 50, height: 1, background: `linear-gradient(270deg,transparent,${B.gold})` }} />
              </div>

              {/* Postacie na arenie */}
              {[
                { side: 'hero', left: narrow ? '24%' : '30%', ring: B.gold, flash: flashHero,
                  sprite: <span style={{ width: 32, height: 48, transform: 'scale(2.6)', transformOrigin: 'bottom center', imageRendering: 'pixelated', backgroundImage: `url(/assets/${initPostac.obrazek})`, backgroundPosition: '0 -96px', backgroundRepeat: 'no-repeat', filter: flashHero ? 'brightness(3) saturate(3)' : isBerserk ? 'drop-shadow(0 0 6px #ff4500)' : 'none', display: 'block' }} /> },
                { side: 'mob', left: narrow ? '76%' : '70%', ring: '#e5624c', flash: flashMob,
                  sprite: <span style={{ width: mobW, height: mobH, transform: `scale(${mobScale})`, transformOrigin: 'bottom center', imageRendering: 'pixelated', backgroundImage: `url(/assets/${mobData.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat', filter: flashMob ? 'brightness(3) saturate(3)' : status === 'won' ? 'grayscale(1) brightness(0.35)' : 'none', display: 'block', transition: 'filter .15s' }} /> },
              ].map(f => (
                <div key={f.side} style={{ position: 'absolute', left: f.left, bottom: narrow ? 28 : 40, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{
                    position: 'absolute', left: '50%', bottom: -12, transform: 'translateX(-50%)', width: 90, height: 24, borderRadius: '50%',
                    border: `2px solid ${f.ring}`, boxShadow: `0 0 14px ${f.ring}aa, inset 0 0 10px ${f.ring}66`,
                    background: `radial-gradient(ellipse, ${f.ring}33, transparent 70%)`,
                  }} />
                  <div style={{ position: 'relative', animation: f.flash ? 'hitShake .25s' : 'idleBob 2.4s ease-in-out infinite' }}>
                    {f.sprite}
                    {particles.filter(p => p.side === f.side).map(p => (
                      <FloatDmg key={p.id} value={p.value === 0 ? 'Pudło' : p.value} color={p.color} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Wynik walki */}
              {ended && (
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', animation: 'fadeIn .3s' }}>
                  <div style={{ textAlign: 'center', padding: '16px 28px', background: 'rgba(12,10,8,0.9)', border: `1px solid ${resultColor}`, borderRadius: 4, boxShadow: `0 0 30px ${resultColor}55` }}>
                    <div style={{ fontFamily: B.serif, fontSize: narrow ? 22 : 30, color: resultColor, textShadow: `0 0 18px ${resultColor}` }}>{resultText}</div>
                    {expGained > 0 && <div style={{ color: '#67e8f9', fontSize: 15, fontWeight: 700, marginTop: 6 }}>+{expGained} EXP</div>}
                    {levelUp && <div style={{ color: '#fcd34d', fontSize: 15, fontWeight: 700, marginTop: 4 }}>★ Awans na poziom {initPostac.poziom + 1}!</div>}
                    {xpLoss > 0 && <div style={{ color: '#f87171', fontSize: 13, marginTop: 4 }}>−{xpLoss} EXP utracone</div>}
                    {loot && <div style={{ marginTop: 8, fontSize: 13 }}>🎁 Zdobyto: <b style={{ color: B.goldHi }}>{loot.nazwa}</b></div>}
                  </div>
                </div>
              )}
            </div>
            {sidebar}
          </div>

          {/* ── AKCJE ── */}
          <div style={{ padding: narrow ? '10px 10px 6px' : '14px 18px 8px', borderTop: `1px solid ${B.bronze}66`, flexShrink: 0, display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0, maxWidth: 660, margin: '0 auto' }}>
              {!ended && (
                <>
                  <div style={{ display: 'flex', gap: narrow ? 5 : 8 }}>
                    {ACTIONS.map(a => {
                      const disabled = loading || (a.id === 'skill' && skills.length === 0) || (a.id === 'item' && consumables.length === 0);
                      return (
                        <ActionCard key={a.id} a={a} compact={narrow} disabled={disabled}
                          active={hover === a.id || panel === a.id} glow={a.id === 'attack' && isBerserk}
                          onHover={() => setHover(a.id)} onClick={() => pressAction(a.id)} />
                      );
                    })}
                  </div>

                  {panel === 'skill' && (
                    <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 6, marginTop: 8 }}>
                      {skills.map(sk => {
                        const cd = cooldowns[sk.id] || 0;
                        const noEn = heroEn < (sk.cost || 0);
                        const off = cd > 0 || noEn || loading;
                        return (
                          <button key={sk.id} onClick={() => !off && doAction('skill', sk.id)} disabled={off} title={sk.desc} style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', textAlign: 'left', borderRadius: 3,
                            cursor: off ? 'not-allowed' : 'pointer', background: off ? '#0e0c0a' : 'linear-gradient(180deg,rgba(124,140,255,0.16),rgba(10,9,8,0.9))',
                            border: `1px solid ${off ? '#2e2820' : '#7c8cff88'}`, color: off ? B.dim : B.text,
                          }}>
                            <span style={{ fontSize: 18, color: '#a5b4fc' }}>{sk.icon}</span>
                            <span style={{ minWidth: 0 }}>
                              <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>{sk.name}</span>
                              <span style={{ display: 'block', fontSize: 10.5, color: cd > 0 ? '#f87171' : noEn ? '#f59e0b' : B.muted }}>
                                EN {sk.cost}{cd > 0 ? ` · odnowienie ${cd}` : noEn ? ' · za mało energii' : ''}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {panel === 'item' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {consumables.map(c => (
                        <button key={c.id} onClick={() => doAction('item', null, c.id)} disabled={loading} style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 3, cursor: 'pointer',
                          background: 'linear-gradient(180deg,rgba(199,146,234,0.16),rgba(10,9,8,0.9))', border: '1px solid #c792ea88', color: B.text,
                        }}>
                          <span style={{ width: 26, height: 26, backgroundImage: `url(/assets/${c.obrazek})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', imageRendering: 'pixelated' }} />
                          <span style={{ fontSize: 12.5 }}>{c.nazwa} <span style={{ color: '#4ade80' }}>{c.pelne_leczenie ? '(pełne)' : `+${c.mikstura_leczenie} HP`}</span>{c.ilosc > 1 ? ` ×${c.ilosc}` : ''}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{
                    display: 'flex', gap: 16, marginTop: 8, padding: '9px 12px', borderRadius: 3,
                    background: 'rgba(0,0,0,0.35)', border: `1px solid ${B.bronze}55`, flexWrap: narrow ? 'wrap' : 'nowrap',
                  }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: B.goldHi }}>{info.title}</div>
                      <div style={{ fontSize: 12, color: B.muted, marginTop: 2 }}>{info.desc}</div>
                    </div>
                    {info.right.length > 0 && (
                      <div style={{ fontSize: 12, color: B.muted, lineHeight: 1.7, whiteSpace: 'nowrap' }}>
                        {info.right.map(([k, v]) => <div key={k}>{k}: <b style={{ color: '#5fd07a' }}>{v}</b></div>)}
                      </div>
                    )}
                  </div>
                </>
              )}
              {ended && (
                <button onClick={onClose} style={{
                  width: '100%', padding: 13, borderRadius: 3, cursor: 'pointer', fontFamily: B.serif, fontSize: 15,
                  background: 'linear-gradient(180deg,#5a4520,#2d2210)', border: `1px solid ${B.gold}`, color: B.goldHi,
                }}>Wróć do gry</button>
              )}
            </div>
          </div>

          {/* ── LOG WALKI ── */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', padding: narrow ? '4px 10px 10px' : '6px 18px 14px', flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0, border: `1px solid ${B.bronze}66`, borderRadius: 3, background: 'rgba(0,0,0,0.3)' }}>
              <button onClick={() => setLogOpen(o => !o)} style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none',
                borderBottom: logOpen ? `1px solid ${B.bronze}44` : 'none', cursor: 'pointer', color: B.goldHi, fontFamily: B.serif, fontSize: 13,
              }}>
                <span style={{ fontSize: 9, color: B.gold }}>{logOpen ? '▼' : '▶'}</span> Log walki
              </button>
              {logOpen && (
                <div ref={logRef} style={{ height: narrow ? 92 : 104, overflowY: 'auto', padding: '5px 12px' }}>
                  {log.map(e => (
                    <div key={e.key} style={{ fontSize: 12, lineHeight: 1.55 }}>
                      <span style={{ color: '#6d7fae' }}>[{fmtTime(e.t)}]</span>{' '}
                      <span style={{ color: logColor(e) }}>{fmtLog(e).text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {!ended && !narrow && (
              <button onClick={() => doAction('flee')} disabled={loading} title="Próba ucieczki z walki" style={{
                width: 170, padding: '12px 10px', borderRadius: 3, cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
                background: 'linear-gradient(180deg,#3a1410,#1a0907)', border: '1px solid #a8281c', color: '#ff8b78',
              }}>✕ Zakończ walkę</button>
            )}
          </div>
        </div>
        )}
      </div>

      <style>{`
        @keyframes floatUp { 0%{opacity:1;transform:translate(-50%,0)} 100%{opacity:0;transform:translate(-50%,-60px)} }
        @keyframes idleBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes hitShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      `}</style>
    </div>
  );
}
