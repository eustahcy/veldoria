import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';
import { T } from '../theme';
import { IconSword, IconShield, IconHeart } from '../Icons';
import { useSound } from '../hooks/useSound';

const LOG_STYLE = {
  hit:          { color:'#E8D070', icon:'†' },
  crit:         { color:'#FDE047', icon:'!!' },
  miss:         { color:'#7A8A5A', icon:'–' },
  dodge:        { color:'#818CF8', icon:'◌' },
  heal:         { color:'#4ADE80', icon:'+' },
  defend:       { color:'#C8940A', icon:'▣' },
  flee_success: { color:'#4ADE80', icon:'→' },
  flee_fail:    { color:'#EF4444', icon:'✗' },
  mob_dead:     { color:'#4ADE80', icon:'★' },
  hero_dead:    { color:'#EF4444', icon:'✗' },
  start:        { color:'#C8940A', icon:'►' },
  skill_use:    { color:'#A5B4FC', icon:'✦' },
  buff:         { color:'#86EFAC', icon:'▲' },
  debuff:       { color:'#F87171', icon:'▼' },
};

function fmtLog(e) {
  const s = LOG_STYLE[e.type] || { color:T.text, icon:'•' };
  let text = e.text || '';
  if (!text) switch(e.type) {
    case 'hit':       text = `${e.actor} trafia za ${e.dmg} dmg`; break;
    case 'crit':      text = `${e.actor} KRYTYK × ${e.dmg} dmg!`; break;
    case 'miss':      text = `${e.actor} chybia`; break;
    case 'dodge':     text = `${e.actor} unika!`; break;
    case 'heal':      text = `${e.actor} leczy ${e.amount} HP`; break;
    case 'defend':    text = `${e.actor} przyjmuje postawę obronną`; break;
    case 'skill_use': text = `${e.actor} używa: ${e.skill}`; break;
    case 'buff':      text = e.text || 'Wzmocnienie aktywne'; break;
    case 'debuff':    text = `${e.actor} → ${e.target}: ${e.text||'osłabiony'}`; break;
    case 'flee_success': text = 'Udało się uciec!'; break;
    case 'flee_fail':    text = 'Ucieczka nieudana!'; break;
    case 'mob_dead': text = `${e.mob} poległ! +${e.exp} EXP`; break;
    case 'hero_dead':text = 'Zginąłeś! Respawn...'; break;
    default: text = e.type;
  }
  return { color:s.color, icon:s.icon, text };
}

const EFFECT_META = {
  atk:          { label:'ATK+',   color:'#FDE047', icon:'⚡' },
  def:          { label:'DEF+',   color:'#C8940A', icon:'▣' },
  absorb_next:  { label:'Absorb', color:'#A5B4FC', icon:'◈' },
  dodge_atk:    { label:'Cień',   color:'#818CF8', icon:'○' },
  next_crit:    { label:'Kryt×',  color:'#FCD34D', icon:'★' },
  exp_bonus:    { label:'EXP+',   color:'#4ADE80', icon:'►' },
  poison:       { label:'Trucizna',color:'#86EFAC',icon:'◌' },
  stun:         { label:'Ogłusz', color:'#F87171', icon:'✗' },
  slow:         { label:'Spowol', color:'#F59E0B', icon:'▼' },
};

function EffectBadge({ effect, side }) {
  const meta = EFFECT_META[effect.type] || { label: effect.type, color:'#CDD4AA', icon:'·' };
  const isBuff = side === 'hero';
  return (
    <div title={`${meta.label} (${effect.turnsLeft} tur)`} style={{
      display:'flex', alignItems:'center', gap:3,
      padding:'2px 6px', borderRadius:10,
      background: isBuff ? 'rgba(200,150,32,0.15)' : 'rgba(239,68,68,0.1)',
      border:`1px solid ${meta.color}44`,
      fontSize:8, color: meta.color,
    }}>
      <span>{meta.icon}</span>
      <span style={{ fontWeight:'bold' }}>{meta.label}</span>
      <span style={{ opacity:0.7 }}>{effect.turnsLeft}</span>
    </div>
  );
}

function CombatBar({ value, max, color, label, flash }) {
  const pct = max > 0 ? Math.min(1, Math.max(0, value/max)) : 0;
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:T.textMuted, marginBottom:3 }}>
        <span>{label}</span>
        <span style={{ color:T.text, fontWeight:'bold' }}>{value}<span style={{ color:T.textMuted }}>/{max}</span></span>
      </div>
      <div style={{ height:14, background:'rgba(0,0,0,0.6)', borderRadius:7, border:`1px solid ${T.border}`, overflow:'hidden', position:'relative' }}>
        <div style={{
          width:`${pct*100}%`, height:'100%', background:color,
          borderRadius:7, transition:'width 0.5s ease',
          boxShadow:`0 0 8px ${color}60`,
        }}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(255,255,255,0.2),transparent)' }} />
        </div>
        {flash && <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.3)', animation:'none', borderRadius:7 }} />}
      </div>
    </div>
  );
}

function ActionBtn({ onClick, disabled, color, border, children, shortcut }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      flex:1, padding:'10px 8px',
      background: disabled ? 'rgba(0,0,0,0.3)' : `linear-gradient(135deg, ${color}30, ${color}10)`,
      color: disabled ? T.textDim : color,
      border: `1px solid ${disabled ? T.border : border}`,
      borderRadius:7, cursor: disabled?'not-allowed':'pointer',
      fontSize:12, fontWeight:'bold',
      transition:'all 0.15s',
      position:'relative',
      display:'flex', alignItems:'center', justifyContent:'center', gap:5,
      boxShadow: disabled ? 'none' : `0 2px 8px ${color}20`,
    }}>
      {children}
      {shortcut && !disabled && (
        <span style={{ position:'absolute', top:3, right:5, fontSize:8, color:`${color}60`, fontWeight:'normal' }}>[{shortcut}]</span>
      )}
    </button>
  );
}

// Floating damage number particle
function DmgFloat({ value, color, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1100); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:'absolute', top:'50%', left:'50%',
      transform:'translate(-50%,-50%)',
      color, fontWeight:'bold', fontSize: value > 99 ? 22 : 18,
      textShadow:`0 0 8px ${color}80, 1px 1px 0 #000`,
      pointerEvents:'none', zIndex:10,
      animation:'dmgFloat 1.1s ease-out forwards',
    }}>{value}</div>
  );
}

export default function BattleModal({ mob: initMob, postac: initPostac, onClose, onEnd, onLog }) {
  const [mob,        setMob]        = useState(initMob);
  const [heroHp,     setHeroHp]     = useState(initPostac.zycie);
  const [mobHp,      setMobHp]      = useState(initMob.zycie);
  const [log,        setLog]        = useState([{ type:'start', key:0, text:`Walka z ${initMob.nazwa} (poz.${initMob.poziom})` }]);
  const [status,     setStatus]     = useState('ongoing');
  const [loading,    setLoading]    = useState(false);
  const [loot,       setLoot]       = useState(null);
  const [expGained,  setExpGained]  = useState(0);
  const [levelUp,    setLevelUp]    = useState(false);
  const [consumables,setConsumables]= useState([]);
  const [defended,   setDefended]   = useState(false);
  const [flashHero,  setFlashHero]  = useState(false);
  const [flashMob,   setFlashMob]   = useState(false);
  const [turn,       setTurn]       = useState(0);
  const [skillsList, setSkillsList] = useState([]);
  const [cooldowns,  setCooldowns]  = useState({}); // { skillId: turnsRemaining }
  const [activeEffects, setActiveEffects] = useState({ hero:{}, mob:{} });
  const [showSkills, setShowSkills] = useState(false);
  const [particles,  setParticles]  = useState([]);
  const logRef = useRef(null);
  const { play, muted, toggleMute } = useSound();

  const heroMaxHp = initPostac.zycie_max;
  const mobMaxHp  = initMob.zycie_max;

  useEffect(() => {
    api.items.inventory().then(items =>
      setConsumables(items.filter(i => i.zalozony===0 && i.typ==='Konsupcyjne' && (i.mikstura_leczenie>0||i.pelne_leczenie)))
    );
    api.character.skills().then(res => {
      if (res.skills) setSkillsList(res.skills);
    });
  }, []);

  useEffect(() => {
    if (logRef.current) {
      const el = logRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [log]);

  const addLog = useCallback((entries) => {
    setLog(prev => [...prev, ...entries.map((e,i) => ({ ...e, key: Date.now()+i+Math.random() }))]);
  }, []);

  const addParticle = (value, color, side) => {
    const id = Date.now() + Math.random();
    setParticles(p => [...p, { id, value, color, side }]);
  };

  // Tick cooldowns and effects after each turn
  const tickTurn = useCallback(() => {
    setTurn(t => t+1);
    setCooldowns(prev => {
      const next = {};
      Object.entries(prev).forEach(([k,v]) => { if (v > 1) next[k] = v-1; });
      return next;
    });
  }, []);

  const handleResult = useCallback((res) => {
    const mobTook  = res.log.some(e => (e.type==='hit'||e.type==='crit') && e.actor === initPostac.nazwa);
    const heroTook = res.log.some(e => (e.type==='hit'||e.type==='crit') && e.actor === initMob.nazwa);
    if (mobTook)  { setFlashMob(true);  setTimeout(()=>setFlashMob(false),300); }
    if (heroTook) { setFlashHero(true); setTimeout(()=>setFlashHero(false),300); }

    // Sounds and particles
    res.log.forEach(e => {
      if (e.type==='crit')      { play('crit');  addParticle(e.dmg, '#FDE047', 'mob'); }
      else if (e.type==='hit' && e.actor===initPostac.nazwa) { play('hit'); addParticle(e.dmg, '#E8D070', 'mob'); }
      else if (e.type==='hit' && e.actor===initMob.nazwa)    { play('hit'); addParticle(e.dmg, '#F87171', 'hero'); }
      else if (e.type==='heal') play('heal');
      else if (e.type==='mob_dead') { play('mobDeath'); }
      else if (e.type==='flee_success') play('flee');
    });
    if (res.levelUp) setTimeout(()=>play('levelUp'), 600);

    addLog(res.log);
    setHeroHp(res.heroHp);
    setMobHp(Math.max(0, res.mobHp));
    setStatus(res.status);
    if (res.effects) setActiveEffects(res.effects);
    tickTurn();
    onLog?.(res.log.map((e,i) => ({ ...e, key: Date.now()+i+Math.random() })));

    if (res.status !== 'ongoing') {
      if (res.loot)      setLoot(res.loot);
      if (res.expGained) setExpGained(res.expGained);
      if (res.levelUp)   setLevelUp(true);
      onEnd?.();
      api.items.inventory().then(items =>
        setConsumables(items.filter(i => i.zalozony===0 && i.typ==='Konsupcyjne' && (i.mikstura_leczenie>0||i.pelne_leczenie)))
      );
    }
  }, [initPostac.nazwa, initMob.nazwa, addLog, tickTurn, onEnd]);

  const doAction = useCallback(async (action, itemId) => {
    if (loading || status !== 'ongoing') return;
    setLoading(true);
    try {
      const res = await api.combat.action(mob.id, action, itemId);
      if (!res.ok) {
        addLog([{ type:'miss', actor:'System', text: res.error }]);
        if (res.status === 'mob_dead') { setStatus('won'); onEnd?.(); }
        return;
      }
      if (action === 'defend') setDefended(true);
      else setDefended(false);
      handleResult(res);
    } finally { setLoading(false); }
  }, [loading, status, mob.id, addLog, handleResult, onEnd]);

  const doSkill = useCallback(async (skillId) => {
    if (loading || status !== 'ongoing') return;
    if (cooldowns[skillId] > 0) return;
    setLoading(true);
    try {
      const res = await api.combat.skill(mob.id, skillId);
      if (!res.ok) {
        addLog([{ type:'miss', actor:'System', text: res.error }]);
        return;
      }
      // Set cooldown for this skill
      const sk = skillsList.find(s => s.id === skillId);
      if (sk?.cooldown) setCooldowns(prev => ({ ...prev, [skillId]: sk.cooldown }));
      setDefended(false);
      handleResult(res);
    } finally { setLoading(false); }
  }, [loading, status, mob.id, cooldowns, skillsList, addLog, handleResult]);

  // Keyboard shortcuts
  useEffect(() => {
    if (status !== 'ongoing' || loading) return;
    const onKey = e => {
      if (e.key==='a'||e.key==='A') doAction('attack');
      if (e.key==='d'||e.key==='D') doAction('defend');
      if (e.key==='f'||e.key==='F') doAction('flee');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doAction, status, loading]);

  const heroHpPct = heroMaxHp > 0 ? heroHp / heroMaxHp : 0;
  const heroHpClr = heroHpPct > 0.5 ? '#22C55E' : heroHpPct > 0.25 ? '#F59E0B' : '#EF4444';
  const mobHpPct  = mobMaxHp  > 0 ? mobHp  / mobMaxHp  : 0;
  const mobHpClr  = mobHpPct  > 0.5 ? '#EF4444' : mobHpPct > 0.25 ? '#F59E0B' : '#991B1B';

  const resultColor = status==='won' ? '#4ADE80' : status==='fled' ? '#C8940A' : '#EF4444';
  const resultText  = status==='won' ? '★ ZWYCIĘSTWO!' : status==='fled' ? '→ UCIEKŁEŚ' : '✗ PORAŻKA';

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:400,
      background:'rgba(2,4,10,0.88)',
      backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div style={{
        width:560, maxWidth:'97vw', maxHeight:'96vh',
        display:'flex', flexDirection:'column',
        background:'linear-gradient(160deg, rgba(10,16,7,0.99), rgba(2,6,14,0.99))',
        border:'1px solid rgba(200,150,32,0.38)',
        borderRadius:8,
        boxShadow:'0 0 80px rgba(200,150,32,0.12), 0 12px 50px rgba(0,0,0,0.9), inset 0 1px 0 rgba(232,192,48,0.08)',
        overflow:'hidden',
        position:'relative',
      }}>

        {/* Corner decorations */}
        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
          <div key={v+h} style={{
            position:'absolute', [v]:0, [h]:0, width:12, height:12, zIndex:2,
            borderTop:   v==='top'    ? '2px solid rgba(200,150,32,0.6)' : 'none',
            borderBottom:v==='bottom' ? '2px solid rgba(200,150,32,0.6)' : 'none',
            borderLeft:  h==='left'   ? '2px solid rgba(200,150,32,0.6)' : 'none',
            borderRight: h==='right'  ? '2px solid rgba(200,150,32,0.6)' : 'none',
          }} />
        ))}

        {/* ── HEADER ── */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'8px 16px',
          background:'linear-gradient(90deg, rgba(74,122,42,0.18), rgba(15,32,64,0.1))',
          borderBottom:'1px solid rgba(200,150,32,0.2)',
          flexShrink:0,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ color:'#6CB83A' }}><IconSword size={13}/></span>
            <span style={{ color:'#E8D070', fontWeight:'bold', fontSize:12, letterSpacing:'1px' }}>WALKA TUROWA</span>
            <span style={{
              background:'rgba(74,122,42,0.2)', border:'1px solid rgba(200,150,32,0.3)',
              borderRadius:8, padding:'1px 7px', fontSize:9, color:'#6CB83A',
            }}>Tura {turn}</span>
          </div>
          {loading && (
            <span style={{ fontSize:9, color:'#3A4828', animation:'pulse 0.8s ease infinite' }}>przetwarzam...</span>
          )}
          <button onClick={toggleMute} title={muted?'Włącz dźwięk':'Wycisz'} style={{ background:'none', border:'none', color:'#3A4828', cursor:'pointer', fontSize:12, padding:2 }}>
            {muted ? '🔇' : '🔊'}
          </button>
          {status !== 'ongoing' && (
            <button onClick={onClose} style={{
              display:'flex', alignItems:'center', gap:4,
              background:'rgba(20,5,5,0.6)', border:'1px solid rgba(180,30,30,0.3)',
              borderRadius:4, padding:'3px 10px', cursor:'pointer',
              color:'#F87171', fontSize:10, fontWeight:'bold',
            }}>
              Zamknij ✕
            </button>
          )}
        </div>

        {/* ── ARENA ── */}
        <div style={{ display:'flex', gap:0, padding:'14px 16px 10px', alignItems:'flex-start', flexShrink:0, position:'relative' }}>
          {/* Damage particles */}
          {particles.map(p => (
            <div key={p.id} style={{ position:'absolute', top:0, bottom:0, left: p.side==='hero'?'0':'50%', right: p.side==='mob'?'0':'50%', pointerEvents:'none', overflow:'hidden' }}>
              <DmgFloat value={p.value} color={p.color} onDone={() => setParticles(ps => ps.filter(x => x.id !== p.id))} />
            </div>
          ))}

          {/* Hero side */}
          <div style={{ flex:1 }}>
            {/* Portrait */}
            <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{
                  width:44, height:60,
                  background:'rgba(8,13,5,0.8)',
                  border:`2px solid ${flashHero ? '#EF4444' : 'rgba(200,150,32,0.35)'}`,
                  borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow: flashHero ? '0 0 20px rgba(239,68,68,0.5)' : '0 0 8px rgba(200,150,32,0.15)',
                  transition:'all 0.1s',
                }}>
                  <div style={{
                    width:32, height:48,
                    backgroundImage:`url(/assets/${initPostac.obrazek})`,
                    backgroundPosition:'0 0', backgroundRepeat:'no-repeat', imageRendering:'pixelated',
                    filter: flashHero ? 'brightness(2.5) hue-rotate(0deg) saturate(3)' : 'none',
                    transition:'filter 0.1s',
                  }} />
                </div>
                {defended && (
                  <div style={{
                    position:'absolute', bottom:-4, right:-4, width:16, height:16,
                    background:'rgba(200,150,32,0.8)', borderRadius:'50%',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    border:'1px solid #60A5FA', boxShadow:'0 0 8px #3B82F6',
                  }}>
                    <span style={{ color:'#fff', display:'flex' }}><IconShield size={9}/></span>
                  </div>
                )}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:'#E8D070', fontWeight:'bold', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{initPostac.nazwa}</div>
                <div style={{ color:'#5A6840', fontSize:9 }}>poz.{initPostac.poziom} · {initPostac.profesja}</div>
                <div style={{ color:'#3A4828', fontSize:8, marginTop:1 }}>
                  ATK {initPostac.obrazenia_min}–{initPostac.obrazenia_max}
                </div>
              </div>
            </div>
            {/* HP bar */}
            <CombatBar value={heroHp} max={heroMaxHp} color={heroHpClr} label="ŻYCIE" flash={flashHero} />
          </div>

          {/* VS divider */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'8px 16px', flexShrink:0 }}>
            <div style={{ width:1, height:20, background:'rgba(200,150,32,0.2)' }} />
            <div style={{ color:'rgba(200,150,32,0.4)', fontSize:11, fontWeight:'bold', letterSpacing:'2px' }}>VS</div>
            <div style={{ width:1, height:20, background:'rgba(200,150,32,0.2)' }} />
          </div>

          {/* Mob side */}
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10, flexDirection:'row-reverse' }}>
              <div style={{
                width:Math.max(44,mob.szerokosc||44), height:Math.max(60,mob.dlugosc||60),
                background:'rgba(8,13,5,0.8)',
                border:`2px solid ${flashMob ? '#EF4444' : 'rgba(180,60,30,0.35)'}`,
                borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow: flashMob ? '0 0 20px rgba(239,68,68,0.5)' : '0 0 8px rgba(180,60,30,0.12)',
                transition:'all 0.1s', flexShrink:0,
              }}>
                <div style={{
                  width:mob.szerokosc||24, height:mob.dlugosc||32,
                  backgroundImage:`url(/assets/${mob.obrazek})`,
                  backgroundPosition:'0 0', backgroundRepeat:'no-repeat', imageRendering:'pixelated',
                  filter: flashMob ? 'brightness(2.5) saturate(3)' : status==='won' ? 'grayscale(1) brightness(0.35)' : 'none',
                  transition:'filter 0.15s',
                }} />
              </div>
              <div style={{ flex:1, minWidth:0, textAlign:'right' }}>
                <div style={{ color:'#F0A060', fontWeight:'bold', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{mob.nazwa}</div>
                <div style={{ color:'#5A6840', fontSize:9 }}>poz.{mob.poziom}</div>
                <div style={{ color:'#3A4828', fontSize:8, marginTop:1 }}>
                  ATK {mob.obr_min||0}–{mob.obr_max||mob.obr_min||0}
                  {mob.ac>0 && ` · AC ${mob.ac}`}
                </div>
              </div>
            </div>
            <CombatBar value={mobHp} max={mobMaxHp} color={mobHpClr} label="ŻYCIE" flash={flashMob} />
          </div>
        </div>

        {/* ── ACTIVE EFFECTS ── */}
        {(activeEffects.hero?.length > 0 || activeEffects.mob?.length > 0) && (
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'4px 14px', flexShrink:0,
            background:'rgba(0,0,0,0.2)',
            borderTop:'1px solid rgba(200,150,32,0.08)',
          }}>
            <div style={{ display:'flex', gap:4, flex:1 }}>
              {(activeEffects.hero || []).map((e,i) => (
                <EffectBadge key={i} effect={e} side="hero" />
              ))}
            </div>
            <div style={{ display:'flex', gap:4, flex:1, justifyContent:'flex-end' }}>
              {(activeEffects.mob || []).map((e,i) => (
                <EffectBadge key={i} effect={e} side="mob" />
              ))}
            </div>
          </div>
        )}

        {/* ── COMBAT LOG ── */}
        <div ref={logRef} style={{
          height:140, overflowY:'auto', flexShrink:0,
          background:'rgba(0,0,0,0.35)',
          borderTop:'1px solid rgba(200,150,32,0.12)',
          borderBottom:'1px solid rgba(200,150,32,0.12)',
        }}>
          {log.map((e, i) => {
            const { color, icon, text } = fmtLog(e);
            const even = i % 2 === 0;
            return (
              <div key={e.key||i} style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'3px 14px',
                background: even ? 'rgba(200,150,32,0.02)' : 'transparent',
                borderBottom:'1px solid rgba(200,150,32,0.04)',
              }}>
                <span style={{
                  flexShrink:0, width:16, textAlign:'center',
                  fontSize:10, fontWeight:'bold', color,
                  textShadow:`0 0 6px ${color}60`,
                }}>
                  {icon}
                </span>
                <span style={{ color, fontSize:10, lineHeight:1.5 }}>{text}</span>
              </div>
            );
          })}
        </div>

        {/* ── RESULT ── */}
        {status !== 'ongoing' && (
          <div style={{
            flexShrink:0, padding:'14px 16px', textAlign:'center',
            background:`linear-gradient(160deg, ${resultColor}06, transparent)`,
            borderBottom:'1px solid rgba(200,150,32,0.12)',
          }}>
            <div style={{
              fontSize:20, fontWeight:'bold', color: resultColor, marginBottom:6,
              textShadow:`0 0 20px ${resultColor}80`,
              letterSpacing:'1px',
            }}>
              {resultText}
            </div>
            {expGained > 0 && (
              <div style={{ color:'#06B6D4', fontSize:12, fontWeight:'bold' }}>+{expGained} EXP zdobyte</div>
            )}
            {levelUp && (
              <div style={{
                color:'#FCD34D', fontSize:14, fontWeight:'bold', marginTop:6,
                textShadow:'0 0 12px rgba(250,200,80,0.6)',
                animation:'pulse 0.8s ease infinite',
              }}>
                ★ AWANS NA POZIOM {initPostac.poziom + 1}!
              </div>
            )}
            {loot && (
              <div style={{
                marginTop:8, padding:'6px 14px', display:'inline-flex', alignItems:'center', gap:8,
                background:'rgba(74,122,42,0.1)', border:'1px solid rgba(200,150,32,0.3)',
                borderRadius:5,
              }}>
                <span style={{ color:'#6CB83A', fontSize:10 }}>Zdobyto:</span>
                <span style={{ color:'#E8D070', fontWeight:'bold', fontSize:12 }}>{loot.nazwa}</span>
              </div>
            )}
          </div>
        )}

        {/* ── SKILLS PANEL ── */}
        {status === 'ongoing' && showSkills && skillsList.length > 0 && (
          <div style={{
            padding:'8px 14px', borderTop:'1px solid rgba(200,150,32,0.1)', flexShrink:0,
            background:'rgba(8,13,5,0.4)',
          }}>
            <div style={{ fontSize:8, color:'#1E4A6A', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:6 }}>Umiejętności</div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              {skillsList.map(sk => {
                const cd = cooldowns[sk.id] || 0;
                const unavail = loading || cd > 0;
                return (
                  <button key={sk.id} onClick={()=>doSkill(sk.id)} disabled={unavail}
                    title={`${sk.name} — ${sk.desc}${cd>0?` (cooldown: ${cd})`:''}`}
                    style={{
                      position:'relative', padding:'6px 10px', borderRadius:5,
                      background: unavail ? 'rgba(8,13,5,0.5)' : 'rgba(74,122,42,0.2)',
                      border:`1px solid ${unavail?'rgba(200,150,32,0.1)':'rgba(129,140,248,0.45)'}`,
                      color: unavail ? '#3A4828' : '#A5B4FC',
                      cursor: unavail ? 'not-allowed' : 'pointer',
                      fontSize:11, fontWeight:'bold',
                      display:'flex', alignItems:'center', gap:5,
                      minWidth:80,
                    }}
                  >
                    <span style={{ fontSize:13 }}>{sk.icon}</span>
                    <span>{sk.name}</span>
                    {cd > 0 && (
                      <span style={{ position:'absolute', top:2, right:4, fontSize:8, color:'#EF4444', fontWeight:'bold' }}>
                        {cd}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ACTIONS ── */}
        {status === 'ongoing' && (
          <div style={{ padding:'10px 14px', display:'flex', gap:6, flexShrink:0 }}>
            <ActionBtn onClick={()=>doAction('attack')} disabled={loading} color='#6CB83A' border='rgba(200,150,32,0.45)' shortcut='A'>
              <IconSword size={13}/> Atak
            </ActionBtn>

            <ActionBtn onClick={()=>doAction('defend')} disabled={loading||defended} color='#C8940A' border='rgba(232,192,48,0.45)' shortcut='D'>
              <IconShield size={13}/> Obroń
            </ActionBtn>

            {/* Skills toggle */}
            {skillsList.length > 0 && (
              <ActionBtn onClick={()=>setShowSkills(s=>!s)} disabled={loading} color={showSkills?'#A5B4FC':'#818CF8'} border='rgba(129,140,248,0.4)'>
                ✦ Skille {skillsList.length > 0 ? `(${skillsList.length})` : ''}
              </ActionBtn>
            )}

            {consumables.length > 0 ? (
              <div style={{ flex:1 }}>
                <select
                  defaultValue=""
                  onChange={e=>{if(e.target.value){doAction('item',parseInt(e.target.value));e.target.value='';}}}
                  disabled={loading}
                  style={{
                    width:'100%', height:'100%', padding:'10px 6px',
                    background:'linear-gradient(135deg, rgba(6,50,35,0.4), rgba(4,30,20,0.4))',
                    color:'#4ADE80', border:'1px solid rgba(34,197,94,0.35)',
                    borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:'bold',
                    outline:'none',
                  }}
                >
                  <option value="" disabled style={{ background:'#0A1628' }}>◈ Eliksir...</option>
                  {consumables.map(i=>(
                    <option key={i.id} value={i.id} style={{ background:'#0A1628' }}>
                      {i.nazwa} {i.pelne_leczenie?'(pełne)':`(+${i.mikstura_leczenie}HP)`}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <ActionBtn onClick={()=>{}} disabled color='#5A6840' border='rgba(30,60,80,0.3)'>
                ◈ —
              </ActionBtn>
            )}

            <ActionBtn onClick={()=>doAction('flee')} disabled={loading} color='#7A8A5A' border='rgba(74,123,157,0.35)' shortcut='F'>
              → Uciekaj
            </ActionBtn>
          </div>
        )}

        {status !== 'ongoing' && (
          <div style={{ padding:'10px 14px', flexShrink:0 }}>
            <button onClick={onClose} style={{
              width:'100%', padding:'10px',
              background:'linear-gradient(135deg, rgba(15,32,64,0.8), rgba(10,22,40,0.8))',
              color:'#E8D070', border:'1px solid rgba(200,150,32,0.4)',
              borderRadius:5, cursor:'pointer', fontSize:13, fontWeight:'bold',
              letterSpacing:'0.5px',
            }}>
              Zamknij walkę
            </button>
          </div>
        )}

        {status === 'ongoing' && (
          <div style={{ padding:'3px 14px 7px', textAlign:'center', fontSize:8, color:'#3A4828', flexShrink:0 }}>
            [A] Atak · [D] Obroń · [F] Uciekaj
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes dmgFloat { 0%{opacity:1;transform:translate(-50%,-50%)} 100%{opacity:0;transform:translate(-50%,-160%)} }
      `}</style>
    </div>
  );
}
