import { useState, useEffect, useRef, useCallback } from 'react';
import { IconZap, IconSkull, IconHeart, IconSword, IconFlask, IconTrophy, IconSparkles } from '../Icons';
import { api } from '../api';
import { T } from '../theme';

// ── Log styles ────────────────────────────────────────────────────────────────
const LOG_STYLE = {
  hit:          { color: '#E8D070', icon: '†' },
  crit:         { color: '#FDE047', icon: '!!' },
  miss:         { color: '#7A8A5A', icon: '–' },
  dodge:        { color: '#818CF8', icon: '◌' },
  heal:         { color: '#4ADE80', icon: '+' },
  defend:       { color: '#C8940A', icon: '▣' },
  flee_success: { color: '#4ADE80', icon: '→' },
  flee_fail:    { color: '#EF4444', icon: '✗' },
  boss_dead:    { color: '#FFD700', icon: '★' },
  hero_dead:    { color: '#EF4444', icon: '✗' },
  boss_ability: { color: '#F59E0B', icon: '◉' },
  boss_shield:  { color: '#A5B4FC', icon: '◈' },
  resist:       { color: '#818CF8', icon: '%' },
  debuff:       { color: '#F87171', icon: '▼' },
  buff:         { color: '#86EFAC', icon: '▲' },
  skill_use:    { color: '#A5B4FC', icon: '✦' },
};

function fmtLog(e) {
  const s = LOG_STYLE[e.type] || { color: T.text, icon: '•' };
  let text = e.text || '';
  if (!text) switch (e.type) {
    case 'hit':       text = `${e.actor} trafia za ${e.dmg} dmg`; break;
    case 'crit':      text = `${e.actor} KRYTYK! ${e.dmg} dmg`; break;
    case 'miss':      text = `${e.actor} chybia`; break;
    case 'dodge':     text = `${e.actor} unika!`; break;
    case 'heal':      text = `${e.actor} leczy ${e.amount} HP`; break;
    case 'defend':    text = `Postawa obronna`; break;
    case 'skill_use': text = `Użyto: ${e.skill}`; break;
    case 'boss_dead': text = `BOSS POLEGŁ!`; break;
    case 'hero_dead': text = `Poległeś! Respawn...`; break;
    case 'flee_success': text = 'Uciekłeś od bossa!'; break;
    case 'flee_fail':    text = 'Ucieczka nieudana!'; break;
    default: text = e.type;
  }
  return { color: s.color, icon: s.icon, text };
}

const EFFECT_META = {
  atk:         { label: 'ATK+',    color: '#FDE047', icon: <IconZap size={11} /> },
  def:         { label: 'DEF+',    color: '#C8940A', icon: '▣' },
  absorb_next: { label: 'Absorb',  color: '#A5B4FC', icon: '◈' },
  next_crit:   { label: 'Kryt×',   color: '#FCD34D', icon: '★' },
  exp_bonus:   { label: 'EXP+',    color: '#4ADE80', icon: '►' },
  poison:      { label: 'Trucizna',color: '#86EFAC', icon: '◌' },
  stun:        { label: 'Ogłusz',  color: '#F87171', icon: '✗' },
  slow:        { label: 'Spowol',  color: '#F59E0B', icon: '▼' },
};

function EffectBadge({ effect, side }) {
  const meta = EFFECT_META[effect.type] || { label: effect.type, color: '#CDD4AA', icon: '·' };
  return (
    <span title={`${meta.label} (${effect.turnsLeft} tur)`} style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      padding: '1px 5px', borderRadius: 8, marginRight: 3,
      background: side === 'hero' ? 'rgba(200,150,32,0.15)' : 'rgba(239,68,68,0.12)',
      border: `1px solid ${meta.color}44`,
      fontSize: 8, color: meta.color,
    }}>
      {meta.icon} {meta.label} {effect.turnsLeft}t
    </span>
  );
}

function HpBar({ value, max, color, label }) {
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.textMuted, marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color: T.text, fontWeight: 'bold' }}>{Number(value).toLocaleString()}<span style={{ color: T.textMuted }}>/{Number(max).toLocaleString()}</span></span>
      </div>
      <div style={{ height: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 6, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        <div style={{
          width: `${pct * 100}%`, height: '100%', background: color,
          borderRadius: 6, transition: 'width 0.4s ease',
          boxShadow: `0 0 6px ${color}60`,
        }} />
      </div>
    </div>
  );
}

function ActionBtn({ onClick, disabled, color, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      flex: 1, padding: '9px 6px',
      background: disabled ? 'rgba(0,0,0,0.25)' : `linear-gradient(135deg,${color}25,${color}10)`,
      color: disabled ? T.textDim : color,
      border: `1px solid ${disabled ? T.border : color + '66'}`,
      borderRadius: 7, cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 11, fontWeight: 'bold',
      transition: 'all 0.15s',
    }}>{children}</button>
  );
}

function TimerBadge({ dataUcieczki }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!dataUcieczki) return;
    const tick = () => {
      const diff = Math.max(0, new Date(dataUcieczki) - Date.now());
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dataUcieczki]);

  if (!timeLeft) return null;
  const isLow = timeLeft.startsWith('0:') || timeLeft.startsWith('1:') || timeLeft.startsWith('2:') || timeLeft.startsWith('3:') || timeLeft.startsWith('4:');
  return (
    <span style={{
      fontSize: 9, fontWeight: 'bold', padding: '1px 7px',
      background: isLow ? 'rgba(239,68,68,0.15)' : 'rgba(200,150,32,0.1)',
      border: `1px solid ${isLow ? 'rgba(239,68,68,0.4)' : 'rgba(200,150,32,0.25)'}`,
      color: isLow ? '#F87171' : '#C8940A',
      borderRadius: 8,
    }}>⏱ {timeLeft}</span>
  );
}

// ── Główny komponent ───────────────────────────────────────────────────────────
export default function WorldBossBattleModal({ boss: initBoss, postac, socket, onClose, onBossUpdate }) {
  const [bossHp,      setBossHp]      = useState(initBoss.zycie);
  const [bossHpMax]                   = useState(initBoss.zycie_max);
  const [heroHp,      setHeroHp]      = useState(postac.zycie);
  const heroHpMax                     = postac.zycie_max;
  const [log,         setLog]         = useState([{ type: 'start', key: 0, text: `Walka z ${initBoss.nazwa} (poziom ${initBoss.poziom})` }]);
  const [status,      setStatus]      = useState('ongoing');
  const [loading,     setLoading]     = useState(false);
  const [turn,        setTurn]        = useState(0);
  const [effects,     setEffects]     = useState({ hero: [], mob: [] });
  const [cooldowns,   setCooldowns]   = useState({});
  const [showSkills,  setShowSkills]  = useState(false);
  const [skillsList,  setSkillsList]  = useState([]);
  const [consumables, setConsumables] = useState([]);
  const [myDmg,       setMyDmg]       = useState(initBoss.myDmg || 0);
  const [myRank,      setMyRank]      = useState(initBoss.myRank || 0);
  const [activeAbilities, setActiveAbilities] = useState([]);
  const [lootRelic,   setLootRelic]   = useState(null);
  const [postKillRanking, setPostKillRanking] = useState(null);
  const [flashHero,   setFlashHero]   = useState(false);
  const [flashBoss,   setFlashBoss]   = useState(false);

  const logRef = useRef(null);
  const bossHpRef = useRef(bossHp);
  bossHpRef.current = bossHp;

  useEffect(() => {
    api.items.inventory().then(items =>
      setConsumables(items.filter(i => i.zalozony === 0 && i.typ === 'Konsupcyjne' && (i.mikstura_leczenie > 0 || i.pelne_leczenie)))
    );
    api.character.skills().then(r => { if (r.skills) setSkillsList(r.skills); });

    // Inicjalizuj HP z sesji jeśli gracz już walczył z bossem
    api.worldboss.mySession().then(ses => {
      if (ses.active && ses.heroHp > 0) setHeroHp(ses.heroHp);
      if (ses.effects) setEffects(ses.effects);
    });
  }, []);

  // Socket: aktualizacja HP bossa od innych graczy
  useEffect(() => {
    if (!socket) return;
    const onHpUpdate = ({ boss_id, zycie }) => {
      if (boss_id === initBoss.id) setBossHp(zycie);
    };
    const onBossDied = ({ boss_id }) => {
      if (boss_id === initBoss.id && status === 'ongoing') {
        setStatus('boss_dead');
        addLog([{ type: 'boss_dead', text: 'Boss poległ! Oczekiwanie na nagrody...' }]);
      }
    };
    const onAbility = ({ boss_id, typ }) => {
      if (boss_id === initBoss.id) {
        setActiveAbilities(prev => [...new Set([...prev, typ])]);
        addLog([{ type: 'boss_ability', typ, text: `Boss aktywuje zdolność: ${typ.toUpperCase()}!` }]);
      }
    };
    const onRanking = ({ boss_id, ranking }) => {
      if (boss_id === initBoss.id) setPostKillRanking(ranking);
    };
    const onRelic = ({ postac_nazwa, boss_nazwa }) => {
      setLootRelic({ postac_nazwa, boss_nazwa });
    };
    socket.on('world_boss_hp_update', onHpUpdate);
    socket.on('world_boss_died',      onBossDied);
    socket.on('world_boss_ability',   onAbility);
    socket.on('world_boss_ranking',   onRanking);
    socket.on('world_boss_relic',     onRelic);
    return () => {
      socket.off('world_boss_hp_update', onHpUpdate);
      socket.off('world_boss_died',      onBossDied);
      socket.off('world_boss_ability',   onAbility);
      socket.off('world_boss_ranking',   onRanking);
      socket.off('world_boss_relic',     onRelic);
    };
  }, [socket, initBoss.id, status]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const addLog = useCallback((entries) => {
    setLog(prev => [...prev, ...entries.map((e, i) => ({ ...e, key: Date.now() + i + Math.random() }))]);
  }, []);

  const tickTurn = useCallback(() => {
    setTurn(t => t + 1);
    setCooldowns(prev => {
      const next = {};
      Object.entries(prev).forEach(([k, v]) => { if (v > 1) next[k] = v - 1; });
      return next;
    });
  }, []);

  const handleResult = useCallback((res) => {
    if (res.log) {
      const heroTook = res.log.some(e => (e.type === 'hit' || e.type === 'crit') && e.actor === initBoss.nazwa);
      const bossTook = res.log.some(e => (e.type === 'hit' || e.type === 'crit') && e.actor !== initBoss.nazwa);
      if (heroTook) { setFlashHero(true); setTimeout(() => setFlashHero(false), 300); }
      if (bossTook) { setFlashBoss(true); setTimeout(() => setFlashBoss(false), 300); }
      addLog(res.log);
    }
    if (res.heroHp !== undefined) setHeroHp(res.heroHp);
    if (res.bossHp !== undefined) setBossHp(Math.max(0, res.bossHp));
    if (res.effects) setEffects(res.effects);
    if (res.dmgDealt > 0) {
      setMyDmg(prev => prev + res.dmgDealt);
      setMyRank(0); // reset rank (recalculate on close)
    }
    if (res.status && res.status !== 'ongoing') setStatus(res.status);
    if (res.status === 'boss_dead') onBossUpdate?.();
    tickTurn();
    // Odśwież listę ekwipuneku po użyciu przedmiotu
    if (res.status === 'ongoing') {
      api.items.inventory().then(items =>
        setConsumables(items.filter(i => i.zalozony === 0 && i.typ === 'Konsupcyjne' && (i.mikstura_leczenie > 0 || i.pelne_leczenie)))
      );
    }
  }, [initBoss.nazwa, addLog, tickTurn, onBossUpdate]);

  const doAttack = useCallback(async () => {
    if (loading || status !== 'ongoing') return;
    setLoading(true);
    try {
      const res = await api.worldboss.bossAttack();
      if (!res.ok) { addLog([{ type: 'miss', actor: 'System', text: res.error || 'Błąd ataku' }]); return; }
      handleResult(res);
    } finally { setLoading(false); }
  }, [loading, status, addLog, handleResult]);

  const doSkill = useCallback(async (skillId, cooldown) => {
    if (loading || status !== 'ongoing') return;
    setLoading(true);
    setCooldowns(prev => ({ ...prev, [skillId]: cooldown }));
    setShowSkills(false);
    try {
      const res = await api.worldboss.bossSkill(skillId);
      if (!res.ok) { addLog([{ type: 'miss', actor: 'System', text: res.error || 'Błąd umiejętności' }]); return; }
      handleResult(res);
    } finally { setLoading(false); }
  }, [loading, status, addLog, handleResult]);

  const doFlee = useCallback(async () => {
    if (loading || status !== 'ongoing') return;
    setLoading(true);
    try {
      const res = await api.worldboss.bossFlee();
      if (res.log) addLog(res.log);
      if (res.status === 'fled') { setStatus('fled'); return; }
      if (res.heroHp) setHeroHp(res.heroHp);
      tickTurn();
    } finally { setLoading(false); }
  }, [loading, status, addLog, tickTurn]);

  const doItem = useCallback(async (itemId) => {
    if (loading || status !== 'ongoing') return;
    setLoading(true);
    try {
      const res = await api.worldboss.bossItem(itemId);
      if (!res.ok) { addLog([{ type: 'miss', actor: 'System', text: res.error || 'Błąd' }]); return; }
      handleResult(res);
    } finally { setLoading(false); }
  }, [loading, status, addLog, handleResult]);

  const hpColor = bossHp / bossHpMax > 0.5 ? '#E53E3E' : bossHp / bossHpMax > 0.25 ? '#DD6B20' : '#C53030';
  const heroColor = heroHp / heroHpMax > 0.5 ? '#22C55E' : heroHp / heroHpMax > 0.25 ? '#F59E0B' : '#EF4444';

  // Aktywne zdolności z initBoss
  const knownAbilities = (() => {
    try { return JSON.parse(initBoss.zdolnosci_specjalne) || []; } catch { return []; }
  })();
  const triggeredTypes = knownAbilities.filter(z => z.wyzwolona).map(z => z.typ);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(10,3,3,0.88)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Palatino Linotype",Palatino,serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'linear-gradient(160deg, rgba(42,10,8,0.99), rgba(22,5,3,0.99))',
        border: '1px solid rgba(200,50,50,0.35)',
        borderRadius: 12,
        boxShadow: '0 12px 60px rgba(0,0,0,0.9)',
        overflow: 'hidden',
        maxHeight: '95vh', display: 'flex', flexDirection: 'column',
      }}>

        {/* ── HEADER ── */}
        <div style={{
          padding: '8px 14px', flexShrink: 0,
          background: 'linear-gradient(90deg,rgba(120,20,20,0.6),rgba(60,10,10,0.4))',
          borderBottom: '1px solid rgba(200,50,50,0.25)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color:'#F87171', display:'flex' }}><IconSkull size={13} /></span>
          <span style={{ color: '#FF6B6B', fontWeight: 'bold', fontSize: 12, flex: 1 }}>
            WORLD BOSS · Tura {turn}
          </span>
          <TimerBadge dataUcieczki={initBoss.data_ucieczki} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(200,100,100,0.6)', cursor: 'pointer', fontSize: 16, padding: '0 2px' }}>✕</button>
        </div>

        <div style={{ overflow: 'auto', flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* ── ARENA ── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(30,5,5,0.5)', borderRadius: 8,
            border: '1px solid rgba(150,30,30,0.2)', padding: '10px 14px',
          }}>
            {/* Bohater */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{
                width: 44, height: 64, margin: '0 auto 4px',
                backgroundImage: `url(/assets/${postac.obrazek})`,
                backgroundPosition: '0 0', backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated', transform: 'scale(1.2)', transformOrigin: 'bottom center',
                filter: flashHero ? 'drop-shadow(0 0 8px #EF4444)' : 'none',
                transition: 'filter 0.2s',
              }} />
              <span style={{ color: '#C8940A', fontSize: 9 }}>{postac.nazwa}</span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <HpBar value={heroHp} max={heroHpMax} color={heroColor} label="Twoje HP" />
              <HpBar value={bossHp} max={bossHpMax} color={hpColor} label={initBoss.nazwa} />
              {/* Moje obrażenia + rank */}
              <div style={{ display: 'flex', gap: 6, fontSize: 9 }}>
                <span style={{ color: '#E8B84B' }}><IconSword size={11} /> DMG: <b>{Number(myDmg).toLocaleString()}</b></span>
                {myRank > 0 && <span style={{ color: 'rgba(200,100,100,0.6)' }}>#{myRank}</span>}
              </div>
            </div>

            {/* Boss */}
            <div style={{ textAlign: 'center', flexShrink: 0, position: 'relative' }}>
              <div style={{
                width: 56, height: 72, margin: '0 auto 4px',
                background: `rgba(120,20,20,0.4)`, border: '1px solid rgba(200,50,50,0.3)',
                borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32,
                filter: flashBoss ? 'drop-shadow(0 0 10px #E53E3E)' : 'none',
                transition: 'filter 0.2s',
              }}><IconSkull size={30} /></div>
              <span style={{ color: '#FF6B6B', fontSize: 9 }}>{initBoss.nazwa}</span>
            </div>
          </div>

          {/* ── ZDOLNOŚCI BOSSA (badge'y) ── */}
          {(triggeredTypes.length > 0 || activeAbilities.length > 0) && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {[...new Set([...triggeredTypes, ...activeAbilities])].map(typ => (
                <span key={typ} style={{
                  fontSize: 8, padding: '2px 8px', borderRadius: 10, fontWeight: 'bold',
                  background: typ === 'tarcza' ? 'rgba(165,180,252,0.15)' : typ === 'regeneracja' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                  border: `1px solid ${typ === 'tarcza' ? 'rgba(165,180,252,0.4)' : typ === 'regeneracja' ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.35)'}`,
                  color: typ === 'tarcza' ? '#A5B4FC' : typ === 'regeneracja' ? '#4ADE80' : '#F87171',
                }}>
                  {typ === 'tarcza' ? '◈ TARCZA' : typ === 'regeneracja' ? '↑ REGEN' : 'SŁUGI'}
                </span>
              ))}
              {initBoss.aktywna_tarcza ? (
                <span style={{ fontSize: 8, padding: '2px 8px', borderRadius: 10, fontWeight: 'bold', background: 'rgba(165,180,252,0.15)', border: '1px solid rgba(165,180,252,0.4)', color: '#A5B4FC' }}>◈ TARCZA AKTYWNA</span>
              ) : null}
            </div>
          )}

          {/* ── EFEKTY GRACZA ── */}
          {(effects.hero?.length > 0 || effects.mob?.length > 0) && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 9 }}>
              <span style={{ color: T.textDim }}>Efekty:</span>
              {effects.hero?.map((e, i) => <EffectBadge key={i} effect={e} side="hero" />)}
              {effects.mob?.map((e, i)  => <EffectBadge key={i} effect={e} side="mob"  />)}
            </div>
          )}

          {/* ── LOG WALKI ── */}
          <div ref={logRef} style={{
            height: 130, overflowY: 'auto',
            background: 'rgba(10,3,3,0.6)',
            border: '1px solid rgba(150,30,30,0.2)',
            borderRadius: 6, padding: '4px 8px',
            display: 'flex', flexDirection: 'column', gap: 1,
          }}>
            {log.map((e) => {
              const { color, icon, text } = fmtLog(e);
              return (
                <div key={e.key || Math.random()} style={{ fontSize: 10, lineHeight: 1.45, display: 'flex', gap: 5 }}>
                  <span style={{ color, flexShrink: 0, minWidth: 14 }}>{icon}</span>
                  <span style={{ color }}>{text}</span>
                </div>
              );
            })}
          </div>

          {/* ── UMIEJĘTNOŚCI (dropdown) ── */}
          {showSkills && (
            <div style={{
              background: 'rgba(20,5,5,0.98)', border: '1px solid rgba(150,30,30,0.3)',
              borderRadius: 6, padding: 8, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 140, overflowY: 'auto',
            }}>
              {skillsList.length === 0
                ? <span style={{ color: T.textDim, fontSize: 10 }}>Brak umiejętności</span>
                : skillsList.map(sk => {
                  const cd = cooldowns[sk.id] || 0;
                  return (
                    <button key={sk.id} disabled={cd > 0 || loading} onClick={() => doSkill(sk.id, sk.cooldown || 4)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
                        background: cd > 0 ? 'rgba(0,0,0,0.3)' : 'rgba(120,20,20,0.2)',
                        border: `1px solid ${cd > 0 ? 'rgba(100,30,30,0.2)' : 'rgba(200,50,50,0.3)'}`,
                        borderRadius: 5, cursor: cd > 0 ? 'not-allowed' : 'pointer',
                        color: cd > 0 ? T.textDim : '#FF6B6B', fontSize: 10, textAlign: 'left',
                      }}>
                      <span style={{ fontSize: 14 }}>{sk.icon}</span>
                      <span style={{ flex: 1 }}>{sk.name}</span>
                      {cd > 0 && <span style={{ color: '#F59E0B', fontSize: 9 }}>CD: {cd}</span>}
                    </button>
                  );
                })}
            </div>
          )}

          {/* ── ELIKSIRY ── */}
          {consumables.length > 0 && status === 'ongoing' && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {consumables.slice(0, 4).map(item => (
                <button key={item.id} onClick={() => doItem(item.id)} disabled={loading}
                  style={{
                    padding: '3px 8px', fontSize: 9,
                    background: 'rgba(74,122,42,0.15)',
                    border: '1px solid rgba(74,122,42,0.35)',
                    borderRadius: 10, cursor: 'pointer', color: '#4ADE80',
                  }}>
                  <IconFlask size={12} /> {item.pelne_leczenie ? 'Pełne' : `+${item.mikstura_leczenie} HP`}
                </button>
              ))}
            </div>
          )}

          {/* ── PRZYCISKI AKCJI ── */}
          {status === 'ongoing' && (
            <div style={{ display: 'flex', gap: 6 }}>
              <ActionBtn onClick={doAttack} disabled={loading} color="#FF6B6B"><IconSword size={12} /> Atak</ActionBtn>
              <ActionBtn onClick={() => setShowSkills(s => !s)} disabled={loading || skillsList.length === 0} color="#A5B4FC">✦ Skill</ActionBtn>
              <ActionBtn onClick={doFlee} disabled={loading} color="#F59E0B">→ Uciekaj</ActionBtn>
            </div>
          )}

          {/* ── WYNIK WALKI ── */}
          {status !== 'ongoing' && (
            <div style={{
              background: status === 'boss_dead' ? 'rgba(74,222,128,0.08)' : status === 'fled' ? 'rgba(200,150,32,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${status === 'boss_dead' ? 'rgba(74,222,128,0.3)' : status === 'fled' ? 'rgba(200,150,32,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 8, padding: 12, textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>
                {status === 'boss_dead' ? <IconTrophy size={26} /> : status === 'fled' ? <IconRun size={26} /> : <IconSkull size={26} />}
              </div>
              <div style={{
                color: status === 'boss_dead' ? '#4ADE80' : status === 'fled' ? '#E8D070' : '#F87171',
                fontWeight: 'bold', fontSize: 13, marginBottom: 6,
              }}>
                {status === 'boss_dead' ? `${initBoss.nazwa} POKONANY!`
                  : status === 'fled' ? 'Uciekłeś od bossa'
                  : 'Poległeś w walce'}
              </div>
              {myDmg > 0 && (
                <div style={{ color: '#E8B84B', fontSize: 11, marginBottom: 4 }}>
                  Twoje obrażenia: <b>{Number(myDmg).toLocaleString()}</b>
                </div>
              )}
              {lootRelic && (
                <div style={{ color: '#FFD700', fontSize: 10, marginBottom: 4 }}>
                  <IconSparkles size={11} /> {lootRelic.postac_nazwa} zdobył Relikwię bossa!
                </div>
              )}
              {/* Ranking po śmierci */}
              {postKillRanking && (
                <div style={{ marginTop: 8, textAlign: 'left' }}>
                  <div style={{ fontSize: 8, color: '#7A4020', letterSpacing: 1, marginBottom: 4 }}>TOP RANKING</div>
                  {postKillRanking.slice(0, 5).map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, fontSize: 9, padding: '1px 0', borderBottom: '1px solid rgba(150,30,30,0.12)' }}>
                      <span style={{ color: i < 3 ? '#E8B84B' : 'rgba(200,100,100,0.5)', width: 20 }}>
                        {`#${i + 1}`}
                      </span>
                      <span style={{ color: '#CDD4AA', flex: 1 }}>{r.postac_nazwa}</span>
                      <span style={{ color: '#E8B84B' }}>{Number(r.obrazenia_zadane).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={onClose} style={{
                marginTop: 10, padding: '6px 20px',
                background: 'rgba(200,150,32,0.15)', color: '#C8940A',
                border: '1px solid rgba(200,150,32,0.35)', borderRadius: 6,
                cursor: 'pointer', fontSize: 11, fontWeight: 'bold',
              }}>Zamknij</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
