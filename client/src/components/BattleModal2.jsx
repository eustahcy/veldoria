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

// ── Pasek zasobu ─────────────────────────────────────────────────────────────
function ResBar({ value, max, color, label, height = 10 }) {
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#7A8A5A', marginBottom: 2 }}>
        <span>{label}</span>
        <span style={{ color: '#CDD4AA' }}>{Math.round(value)}/{Math.round(max)}</span>
      </div>
      <div style={{ height, background: 'rgba(0,0,0,0.45)', borderRadius: height / 2, overflow: 'hidden', border: `1px solid ${color}33` }}>
        <div style={{
          width: `${pct * 100}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: height / 2, transition: 'width 0.4s ease',
          boxShadow: `0 0 6px ${color}40`,
        }} />
      </div>
    </div>
  );
}

// ── Floating damage number ────────────────────────────────────────────────────
function FloatDmg({ value, color, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1000); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: 'absolute', top: '30%', left: '50%',
      transform: 'translate(-50%,-50%)',
      color, fontWeight: 'bold', fontSize: Math.abs(value) > 99 ? 22 : 18,
      textShadow: `0 0 10px ${color}80, 1px 1px 0 #000`,
      pointerEvents: 'none', zIndex: 10,
      animation: 'floatUp 1s ease-out forwards',
    }}>
      {value > 0 ? `+${value}` : value}
    </div>
  );
}

// ── Tier label ────────────────────────────────────────────────────────────────
const TIER_COLORS = ['', '#C8940A', '#818CF8', '#FDE047'];
const TIER_NAMES  = ['', 'I', 'II', 'III'];

// ── Przycisk akcji ────────────────────────────────────────────────────────────
function ActBtn({ label, icon, onClick, disabled, color = '#6CB83A', shortcut, glow }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      flex: 1, padding: '10px 6px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 2,
      background: disabled ? 'rgba(0,0,0,0.2)' : `linear-gradient(160deg,${color}22,${color}08)`,
      color: disabled ? '#3A4828' : color,
      border: `1px solid ${disabled ? 'rgba(200,150,32,0.08)' : color + '55'}`,
      borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 13, fontWeight: 'bold', transition: 'all 0.15s',
      boxShadow: glow ? `0 0 14px ${color}60` : 'none',
      position: 'relative',
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 8, fontWeight: 'normal', opacity: 0.8 }}>{label}</span>
      {shortcut && (
        <span style={{ position: 'absolute', top: 3, right: 5, fontSize: 7, opacity: 0.4 }}>[{shortcut}]</span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function BattleModal2({ mob: initMob, postac: initPostac, onClose, onEnd, onLog }) {
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
  const [showSkills,  setShowSkills]  = useState(false);
  const [lastInit,    setLastInit]    = useState(null);
  const [loot,        setLoot]        = useState(null);
  const [expGained,   setExpGained]   = useState(0);
  const [levelUp,     setLevelUp]     = useState(false);
  const [xpLoss,      setXpLoss]      = useState(0);
  const [particles,   setParticles]   = useState([]);
  const [berserking,  setBerserking]  = useState(false);
  const [flashHero,   setFlashHero]   = useState(false);
  const [flashMob,    setFlashMob]    = useState(false);

  const logRef = useRef(null);

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
        if (r.mob) setMobData(prev => ({ ...prev, ...r.mob }));
        addLog([{ type: 'start', text: `Walka z ${initMob.nazwa} (poz.${initMob.poziom})${r.resumed ? ' — WZNOWIONA' : ''}` }]);
      } catch (e) {
        setInitError('Błąd połączenia z serwerem');
      } finally {
        setLoading(false);
      }
    })();
    // Load consumables
    api.items.inventory().then(items =>
      setConsumables(items.filter(i => i.zalozony === 0 && i.typ === 'Konsupcyjne' && (i.mikstura_leczenie > 0 || i.pelne_leczenie)))
    );
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const addLog = useCallback((entries) => {
    setLog(prev => [...prev, ...entries.map((e, i) => ({ ...e, key: Date.now() + i + Math.random() }))]);
  }, []);

  const addParticle = useCallback((value, color) => {
    const id = Date.now() + Math.random();
    setParticles(p => [...p, { id, value, color }]);
    setTimeout(() => setParticles(p => p.filter(x => x.id !== id)), 1100);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (status !== 'ongoing' || loading) return;
    const fn = e => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'a' || e.key === 'A') doAction('attack');
      if (e.key === 'b' || e.key === 'B') doAction('block');
      if (e.key === 'f' || e.key === 'F') doAction('flee');
      if (e.key === 's' || e.key === 'S') setShowSkills(v => !v);
      if (e.key === 'Escape') setShowSkills(false);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [status, loading]);

  // ── Handle server response ─────────────────────────────────────────────────
  const handleResult = useCallback((r) => {
    if (!r.ok) {
      addLog([{ type: 'miss', actor: 'System', text: r.error || 'Błąd' }]);
      // Inny gracz zabił moba pierwszy — walka się kończy bez nagrody
      if (r.status === 'mob_dead') { setStatus('mob_dead'); onEnd?.(); }
      return;
    }

    // Inicijatywa flash
    if (r.log) {
      const iniEntry = r.log.find(e => e.type === 'initiative');
      if (iniEntry) setLastInit(iniEntry.winner);
    }

    // Flash trafień
    const heroGotHit = r.log?.some(e => (e.type === 'hit' || e.type === 'crit') && e.actor !== initPostac.nazwa && e.actor !== 'System' && !e.actor?.startsWith('◆') && !e.actor?.startsWith('🔥') && !e.actor?.startsWith('◌'));
    const mobGotHit  = r.log?.some(e => (e.type === 'hit' || e.type === 'crit') && e.actor === initPostac.nazwa);
    if (heroGotHit) { setFlashHero(true); setTimeout(() => setFlashHero(false), 280); }
    if (mobGotHit)  { setFlashMob(true);  setTimeout(() => setFlashMob(false), 280); }

    // Particles
    r.log?.forEach(e => {
      if ((e.type === 'hit' || e.type === 'crit') && e.dmg) {
        if (e.actor === initPostac.nazwa) addParticle(-e.dmg, '#F87171');
        else addParticle(-e.dmg, '#EF4444');
      }
      if (e.type === 'heal' && e.amount) addParticle(+e.amount, '#4ADE80');
    });

    if (r.log) {
      addLog(r.log);
      onLog?.(r.log.map((e, i) => ({ ...e, key: Date.now() + i + Math.random() })));
    }

    if (r.heroHp   !== undefined) setHeroHp(r.heroHp);
    if (r.heroEn   !== undefined) setHeroEn(r.heroEn);
    if (r.heroFuria !== undefined) {
      const wasBelow = r.heroFuria < 100;
      const isBerserk = r.heroFuria >= 100;
      setHeroFuria(Math.min(100, r.heroFuria));
      if (isBerserk && wasBelow) setBerserking(true);
      if (r.heroFuria === 0) setBerserking(false);
    }
    if (r.heroEffects) setHeroEffects(r.heroEffects);
    if (r.mobHp      !== undefined) setMobHp(Math.max(0, r.mobHp));
    if (r.mobEffects) setMobEffects(r.mobEffects);
    if (r.cooldowns) setCooldowns(r.cooldowns);
    if (r.turn !== undefined) setTurn(r.turn);

    if (r.status && r.status !== 'ongoing') {
      setStatus(r.status);
      if (r.loot)      setLoot(r.loot);
      if (r.expGained) setExpGained(r.expGained);
      if (r.levelUp)   setLevelUp(true);
      if (r.xpLoss)    setXpLoss(r.xpLoss);
      onEnd?.();
    }

    // Refresh consumables
    api.items.inventory().then(items =>
      setConsumables(items.filter(i => i.zalozony === 0 && i.typ === 'Konsupcyjne' && (i.mikstura_leczenie > 0 || i.pelne_leczenie)))
    );
  }, [addLog, addParticle, onLog, onEnd, initPostac.nazwa]);

  const doAction = useCallback(async (action, skillId = null, itemId = null) => {
    if (loading || status !== 'ongoing') return;
    setLoading(true);
    if (action === 'skill') setShowSkills(false);
    try {
      const r = await api.combat.turn2(initMob.id, action, skillId, itemId);
      handleResult(r);
    } catch (e) {
      addLog([{ type: 'miss', actor: 'System', text: 'Błąd połączenia' }]);
    } finally {
      setLoading(false);
    }
  }, [loading, status, initMob.id, handleResult, addLog]);

  // ── Wyliczenie kolorów ────────────────────────────────────────────────────
  const heroHpPct  = heroMaxHp > 0 ? heroHp / heroMaxHp : 0;
  const heroHpClr  = heroHpPct > 0.5 ? '#22C55E' : heroHpPct > 0.25 ? '#F59E0B' : '#EF4444';
  const mobHpPct   = mobMaxHp  > 0 ? mobHp  / mobMaxHp  : 0;
  const mobHpClr   = mobHpPct  > 0.5 ? '#E53E3E' : mobHpPct > 0.25 ? '#DD6B20' : '#9B2335';
  const furiaClr   = heroFuria >= 100 ? '#FF4500' : heroFuria >= 60 ? '#F97316' : '#C8940A';
  const enPct      = heroMaxEn > 0 ? heroEn / heroMaxEn : 0;

  // Berserker UI
  const isBerserk  = heroFuria >= 100;
  const berserkMult = initPostac.profesja === 'Wojownik' ? '× 3' : '× 2';

  // Wynik walki
  const resultColor = status === 'won' ? '#4ADE80' : status === 'fled' || status === 'mob_dead' ? '#C8940A' : '#EF4444';
  const resultText  = status === 'won' ? '★ ZWYCIĘSTWO!' : status === 'fled' ? '→ UCIEKŁEŚ'
    : status === 'mob_dead' ? '✗ KTOŚ BYŁ SZYBSZY' : '✗ PORAŻKA';

  // Grupuj skille po tierach
  const skillsByTier = skills.reduce((acc, sk) => {
    const t = sk.tier || 1;
    if (!acc[t]) acc[t] = [];
    acc[t].push(sk);
    return acc;
  }, {});

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(3,5,2,0.92)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Palatino Linotype",Palatino,serif',
    }}>
      <div style={{
        width: 580, maxWidth: '98vw', maxHeight: '97vh',
        display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(160deg,rgba(12,18,8,0.99),rgba(5,8,14,0.99))',
        border: '1px solid rgba(200,150,32,0.35)',
        borderRadius: 10,
        boxShadow: '0 0 60px rgba(200,150,32,0.08), 0 16px 60px rgba(0,0,0,0.95)',
        overflow: 'hidden', position: 'relative',
      }}>

        {/* Corner decorations */}
        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
          <div key={v+h} style={{
            position:'absolute',[v]:0,[h]:0,width:14,height:14,zIndex:2,
            borderTop:   v==='top'    ?'2px solid rgba(200,150,32,0.5)':'none',
            borderBottom:v==='bottom' ?'2px solid rgba(200,150,32,0.5)':'none',
            borderLeft:  h==='left'   ?'2px solid rgba(200,150,32,0.5)':'none',
            borderRight: h==='right'  ?'2px solid rgba(200,150,32,0.5)':'none',
          }}/>
        ))}

        {/* ── HEADER ── */}
        <div style={{
          display:'flex', alignItems:'center', padding:'8px 16px',
          background:'linear-gradient(90deg,rgba(74,122,42,0.15),rgba(15,30,60,0.08))',
          borderBottom:'1px solid rgba(200,150,32,0.18)', flexShrink:0, gap:8,
        }}>
          <span style={{ color:'#6CB83A', fontSize:14 }}>⚔</span>
          <span style={{ color:'#E8D070', fontWeight:'bold', fontSize:12, letterSpacing:'1px' }}>WALKA TUROWA v2</span>
          <div style={{
            background:'rgba(74,122,42,0.2)', border:'1px solid rgba(200,150,32,0.3)',
            borderRadius:8, padding:'1px 8px', fontSize:9, color:'#6CB83A',
          }}>Tura {turn}</div>

          {/* Inicjatywa badge */}
          {lastInit && (
            <div style={{
              padding:'1px 8px', borderRadius:8, fontSize:9, fontWeight:'bold',
              background: lastInit==='hero'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)',
              border:`1px solid ${lastInit==='hero'?'rgba(34,197,94,0.4)':'rgba(239,68,68,0.4)'}`,
              color: lastInit==='hero'?'#4ADE80':'#F87171',
            }}>
              {lastInit==='hero' ? '⚡ Ty pierwszy' : '⚠ Wróg pierwszy'}
            </div>
          )}

          {loading && <span style={{ fontSize:9, color:'#3A4828', marginLeft:'auto' }}>↻ przetwarzam...</span>}

          {status !== 'ongoing' && (
            <button onClick={onClose} style={{
              marginLeft:'auto', background:'rgba(20,5,5,0.6)',
              border:'1px solid rgba(180,30,30,0.3)', borderRadius:4,
              padding:'3px 12px', cursor:'pointer', color:'#F87171', fontSize:10, fontWeight:'bold',
            }}>Zamknij ✕</button>
          )}
        </div>

        {/* ── LOADING / ERROR ── */}
        {loading && turn === 0 && (
          <div style={{ padding:40, textAlign:'center', color:'#3A4828', fontSize:11 }}>
            Inicjalizacja walki...
          </div>
        )}
        {initError && (
          <div style={{ padding:20, textAlign:'center', color:'#F87171', fontSize:11 }}>
            ✗ {initError}
            <button onClick={onClose} style={{ display:'block', margin:'12px auto 0', padding:'6px 20px', background:'rgba(20,5,5,0.6)', color:'#F87171', border:'1px solid rgba(180,30,30,0.3)', borderRadius:4, cursor:'pointer' }}>Zamknij</button>
          </div>
        )}

        {!initError && (!loading || turn > 0) && (
        <>

        {/* ── ARENA ── */}
        <div style={{ display:'flex', padding:'12px 16px 8px', gap:0, flexShrink:0, position:'relative' }}>

          {/* Floating particles - hero side */}
          <div style={{ position:'absolute', top:0, left:0, right:'50%', bottom:0, pointerEvents:'none', overflow:'hidden' }}>
            {particles.map(p => (
              <FloatDmg key={p.id} value={p.value} color={p.color} onDone={()=>{}} />
            ))}
          </div>

          {/* HERO */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
              {/* Portret */}
              <div style={{
                width:48, height:64, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                background:'rgba(8,14,5,0.8)',
                border:`2px solid ${flashHero?'#EF4444':isBerserk?'#FF4500':'rgba(200,150,32,0.35)'}`,
                borderRadius:5,
                boxShadow: flashHero?'0 0 20px rgba(239,68,68,0.6)':isBerserk?'0 0 20px rgba(255,69,0,0.5)':'none',
                transition:'all 0.12s', position:'relative',
              }}>
                <div style={{
                  width:32, height:48,
                  backgroundImage:`url(/assets/${initPostac.obrazek})`,
                  backgroundPosition:'0 0', backgroundRepeat:'no-repeat', imageRendering:'pixelated',
                  filter: flashHero?'brightness(3) saturate(3)':isBerserk?'hue-rotate(-20deg) saturate(2)':'none',
                  transition:'filter 0.1s',
                }}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color: isBerserk?'#FF4500':'#E8D070', fontWeight:'bold', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {initPostac.nazwa}
                  {isBerserk && <span style={{ color:'#FF4500', fontSize:9, marginLeft:4 }}> 💥BERSERK!</span>}
                </div>
                <div style={{ color:'#5A6840', fontSize:8 }}>poz.{initPostac.poziom} · {initPostac.profesja}</div>
              </div>
            </div>
            <ResBar value={heroHp}    max={heroMaxHp} color={heroHpClr} label="❤ HP"      height={11}/>
            <ResBar value={heroEn}    max={heroMaxEn} color='#3B82F6'   label="⚡ Energia" height={8}/>
            {/* FURIA */}
            <div style={{ marginBottom:4 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'#7A8A5A', marginBottom:2 }}>
                <span style={{ color:furiaClr }}>🔥 Furia</span>
                <span style={{ color:furiaClr, fontWeight:'bold' }}>{Math.round(heroFuria)}%</span>
              </div>
              <div style={{ height:7, background:'rgba(0,0,0,0.45)', borderRadius:4, overflow:'hidden', border:`1px solid ${furiaClr}44` }}>
                <div style={{
                  width:`${heroFuria}%`, height:'100%',
                  background:`linear-gradient(90deg,${furiaClr}88,${furiaClr})`,
                  borderRadius:4, transition:'width 0.4s ease',
                  boxShadow: isBerserk?`0 0 10px ${furiaClr}`:undefined,
                  animation: isBerserk?'furiaPulse 0.6s ease infinite':undefined,
                }}/>
              </div>
              {isBerserk && (
                <div style={{ fontSize:8, color:'#FF4500', fontWeight:'bold', marginTop:2, animation:'furiaPulse 0.6s ease infinite' }}>
                  💥 BERSERK! Następny atak {berserkMult}!
                </div>
              )}
            </div>
            {/* Efekty bohatera */}
            {heroEffects.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:1 }}>
                {heroEffects.map((e,i) => <EffBadge key={i} eff={e} side="hero"/>)}
              </div>
            )}
          </div>

          {/* VS */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'4px 14px', flexShrink:0 }}>
            <div style={{ flex:1, width:1, background:'rgba(200,150,32,0.2)' }}/>
            <span style={{ color:'rgba(200,150,32,0.35)', fontSize:11, fontWeight:'bold', letterSpacing:2 }}>VS</span>
            <div style={{ flex:1, width:1, background:'rgba(200,150,32,0.2)' }}/>
          </div>

          {/* MOB */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8, flexDirection:'row-reverse' }}>
              {/* Sprite */}
              <div style={{
                width: Math.max(48, mobData.szerokosc||48),
                height: Math.max(64, mobData.dlugosc||64),
                flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                background:'rgba(14,5,5,0.8)',
                border:`2px solid ${flashMob?'#EF4444':status==='won'?'rgba(100,100,100,0.3)':'rgba(180,60,30,0.35)'}`,
                borderRadius:5,
                boxShadow:flashMob?'0 0 20px rgba(239,68,68,0.6)':undefined,
                transition:'all 0.12s',
              }}>
                <div style={{
                  width:mobData.szerokosc||24, height:mobData.dlugosc||32,
                  backgroundImage:`url(/assets/${mobData.obrazek})`,
                  backgroundPosition:'0 0', backgroundRepeat:'no-repeat', imageRendering:'pixelated',
                  filter:flashMob?'brightness(3) saturate(3)':status==='won'?'grayscale(1) brightness(0.3)':undefined,
                  transition:'filter 0.12s',
                }}/>
              </div>
              <div style={{ flex:1, minWidth:0, textAlign:'right' }}>
                <div style={{ color:'#F0A060', fontWeight:'bold', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{mobData.nazwa}</div>
                <div style={{ color:'#5A6840', fontSize:8 }}>poz.{mobData.poziom} · {mobData.pattern || 'standard'}</div>
              </div>
            </div>
            <ResBar value={mobHp} max={mobMaxHp} color={mobHpClr} label="❤ HP" height={11}/>
            {/* Efekty moba */}
            {mobEffects.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:1, marginTop:4, justifyContent:'flex-end' }}>
                {mobEffects.map((e,i) => <EffBadge key={i} eff={e} side="mob"/>)}
              </div>
            )}
          </div>
        </div>

        {/* ── LOG WALKI ── */}
        <div ref={logRef} style={{
          height:145, overflowY:'auto', flexShrink:0,
          background:'rgba(2,4,1,0.5)',
          borderTop:'1px solid rgba(200,150,32,0.1)',
          borderBottom:'1px solid rgba(200,150,32,0.1)',
        }}>
          {log.map((e, i) => {
            const { color, icon, text } = fmtLog(e);
            return (
              <div key={e.key||i} style={{
                display:'flex', alignItems:'flex-start', gap:6,
                padding:'3px 14px',
                background: e.type==='crit'?'rgba(253,224,71,0.04)':e.type==='berserk'?'rgba(255,69,0,0.06)':i%2===0?'rgba(200,150,32,0.02)':'transparent',
                borderBottom:'1px solid rgba(200,150,32,0.04)',
              }}>
                <span style={{ flexShrink:0, width:16, textAlign:'center', fontSize:11, color, fontWeight:'bold' }}>{icon}</span>
                <span style={{ color, fontSize:10, lineHeight:1.5 }}>{text}</span>
              </div>
            );
          })}
        </div>

        {/* ── WYNIK ── */}
        {status !== 'ongoing' && (
          <div style={{
            flexShrink:0, padding:'12px 16px', textAlign:'center',
            background:`linear-gradient(160deg,${resultColor}05,transparent)`,
            borderBottom:'1px solid rgba(200,150,32,0.1)',
          }}>
            <div style={{ fontSize:20, fontWeight:'bold', color:resultColor, marginBottom:4, textShadow:`0 0 20px ${resultColor}80` }}>
              {resultText}
            </div>
            {expGained > 0 && <div style={{ color:'#06B6D4', fontSize:12, fontWeight:'bold' }}>+{expGained} EXP</div>}
            {levelUp     && <div style={{ color:'#FCD34D', fontSize:13, fontWeight:'bold', marginTop:4, animation:'furiaPulse 0.8s ease infinite' }}>★ AWANS NA POZIOM {initPostac.poziom+1}!</div>}
            {xpLoss > 0  && <div style={{ color:'#F87171', fontSize:11 }}>−{xpLoss} EXP utracone</div>}
            {loot        && (
              <div style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:8,
                padding:'5px 14px', background:'rgba(74,122,42,0.1)', border:'1px solid rgba(200,150,32,0.3)', borderRadius:5 }}>
                <span style={{ color:'#6CB83A', fontSize:10 }}>🎁 Zdobyto:</span>
                <span style={{ color:'#E8D070', fontWeight:'bold', fontSize:12 }}>{loot.nazwa}</span>
              </div>
            )}
          </div>
        )}

        {/* ── PANEL UMIEJĘTNOŚCI ── */}
        {status==='ongoing' && showSkills && skills.length > 0 && (
          <div style={{
            padding:'8px 14px', flexShrink:0,
            background:'rgba(5,9,3,0.6)',
            borderBottom:'1px solid rgba(200,150,32,0.12)',
            maxHeight:200, overflowY:'auto',
          }}>
            {[1,2,3].map(tier => {
              const tierSkills = skillsByTier[tier];
              if (!tierSkills) return null;
              return (
                <div key={tier} style={{ marginBottom:6 }}>
                  <div style={{ fontSize:7, color:TIER_COLORS[tier], letterSpacing:'2px', textTransform:'uppercase', marginBottom:4 }}>
                    Tier {TIER_NAMES[tier]}
                  </div>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                    {tierSkills.map(sk => {
                      const cd = cooldowns[sk.id] || 0;
                      const noEn = heroEn < (sk.cost || 0);
                      const off = cd > 0 || noEn;
                      return (
                        <button key={sk.id}
                          onClick={() => !off && doAction('skill', sk.id)}
                          disabled={off}
                          title={`${sk.name} | ${sk.desc} | EN: ${sk.cost}`}
                          style={{
                            position:'relative', padding:'6px 10px', borderRadius:6,
                            background:off?'rgba(6,10,4,0.5)':'rgba(74,122,42,0.15)',
                            border:`1px solid ${off?'rgba(200,150,32,0.1)':TIER_COLORS[tier]+'55'}`,
                            color:off?'#3A4828':TIER_COLORS[tier],
                            cursor:off?'not-allowed':'pointer',
                            fontSize:10, fontWeight:'bold',
                            display:'flex', alignItems:'center', gap:5, minWidth:90,
                          }}>
                          <span style={{ fontSize:13 }}>{sk.icon}</span>
                          <div style={{ textAlign:'left' }}>
                            <div style={{ fontSize:10 }}>{sk.name}</div>
                            <div style={{ fontSize:7, opacity:0.6 }}>EN:{sk.cost}{cd>0?` · CD:${cd}`:''}
                              {noEn && !cd?' · BRAK EN':''}</div>
                          </div>
                          {cd > 0 && (
                            <span style={{ position:'absolute', top:3, right:5, fontSize:8, color:'#EF4444', fontWeight:'bold' }}>{cd}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── AKCJE ── */}
        {status==='ongoing' && (
          <div style={{ padding:'10px 14px', display:'flex', gap:6, flexShrink:0 }}>
            <ActBtn icon="⚔" label="Atak" shortcut="A"
              onClick={() => doAction('attack')} disabled={loading} color="#6CB83A"
              glow={isBerserk}/>
            <ActBtn icon="✦" label="Skill" shortcut="S"
              onClick={() => setShowSkills(v=>!v)} disabled={loading||skills.length===0}
              color={showSkills?'#A5B4FC':'#818CF8'}/>
            <ActBtn icon="🛡" label="Blok" shortcut="B"
              onClick={() => doAction('block')} disabled={loading} color="#C8940A"/>

            {/* Eliksir */}
            {consumables.length > 0 ? (
              <button
                disabled={loading}
                onClick={() => {
                  if (consumables.length===1) doAction('item',null,consumables[0].id);
                }}
                title={consumables.map(c=>`${c.nazwa} ${c.pelne_leczenie?'(pełne)':`(+${c.mikstura_leczenie}HP)`}`).join('\n')}
                style={{
                  flex:1, padding:'10px 6px', display:'flex', flexDirection:'column', alignItems:'center', gap:2,
                  background:'rgba(74,122,42,0.15)', color:'#4ADE80',
                  border:'1px solid rgba(34,197,94,0.4)', borderRadius:8,
                  cursor:loading?'not-allowed':'pointer', fontSize:13, fontWeight:'bold',
                }}>
                <span>🧪</span>
                <span style={{ fontSize:7, opacity:0.8 }}>Eliksir ({consumables.length})</span>
              </button>
            ) : (
              <ActBtn icon="🧪" label="—" onClick={()=>{}} disabled color="#3A4828"/>
            )}

            <ActBtn icon="→" label="Uciekaj" shortcut="F"
              onClick={() => doAction('flee')} disabled={loading} color="#7A8A5A"/>
          </div>
        )}

        {status!=='ongoing' && (
          <div style={{ padding:'10px 14px', flexShrink:0 }}>
            <button onClick={onClose} style={{
              width:'100%', padding:'11px',
              background:'linear-gradient(135deg,rgba(15,32,64,0.8),rgba(10,22,40,0.8))',
              color:'#E8D070', border:'1px solid rgba(200,150,32,0.4)',
              borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:'bold', letterSpacing:'0.5px',
            }}>Zamknij walkę</button>
          </div>
        )}

        {status==='ongoing' && !loading && (
          <div style={{ padding:'2px 14px 7px', textAlign:'center', fontSize:7, color:'#2A3820', flexShrink:0 }}>
            [A] Atak · [S] Skille · [B] Blok · [F] Uciekaj
          </div>
        )}

        </>)}
      </div>

      <style>{`
        @keyframes floatUp     { 0%{opacity:1;transform:translate(-50%,-50%)} 100%{opacity:0;transform:translate(-50%,-150%)} }
        @keyframes furiaPulse  { 0%,100%{opacity:1} 50%{opacity:0.55} }
      `}</style>
    </div>
  );
}
