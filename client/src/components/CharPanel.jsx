import { useState, useEffect } from 'react';
import { IconAward, IconStar } from '../Icons';
import { api } from '../api';
import {
  IconSword, IconShield, IconZap, IconRun, IconBrain,
  IconCoin, IconBag, IconHeart, IconCrosshair, IconLogout,
  IconScroll, IconUsers, IconCastle, IconTunic,
} from '../Icons';

// ── Ozdobne rogi panelu ───────────────────────────────────────────────────────
function OrnateCorners({ size = 10, color = 'rgba(232,184,75,0.7)' }) {
  const line = `2px solid ${color}`;
  return (
    <>
      {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
        <div key={v+h} style={{
          position:'absolute', [v]:0, [h]:0, width:size, height:size, zIndex:2, pointerEvents:'none',
          borderTop:   v==='top'    ? line : 'none',
          borderBottom:v==='bottom' ? line : 'none',
          borderLeft:  h==='left'   ? line : 'none',
          borderRight: h==='right'  ? line : 'none',
        }} />
      ))}
    </>
  );
}

// ── Ozdobny separator sekcji ──────────────────────────────────────────────────
function Divider({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px' }}>
      <div style={{ flex:1, height:1, background:'linear-gradient(to right, transparent, rgba(200,146,42,0.4))' }} />
      {label && (
        <span style={{ fontSize:10, fontWeight:'bold', letterSpacing:'2px', textTransform:'uppercase', color:'#8A7050' }}>
          {label}
        </span>
      )}
      <div style={{ flex:1, height:1, background:'linear-gradient(to left, transparent, rgba(200,146,42,0.4))' }} />
    </div>
  );
}

// ── Pasek HP/EXP ─────────────────────────────────────────────────────────────
function StatusBar({ value, max, colorA, colorB, glowColor, label, height = 14, pulse }) {
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const low = pct < 0.3;
  return (
    <div style={{ padding:'2px 10px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
        <span style={{ fontSize:7, color:'#8A7050', letterSpacing:'1.5px', textTransform:'uppercase' }}>{label}</span>
        <span style={{ fontSize:9, color: low ? colorB : '#D4C09A', fontWeight:'bold' }}>
          {value}<span style={{ color:'#4A3828', fontSize:8 }}>/{max}</span>
        </span>
      </div>
      <div style={{
        height, background:'rgba(0,0,0,0.6)', borderRadius:2,
        border:`1px solid rgba(0,0,0,0.8)`,
        boxShadow:`inset 0 1px 3px rgba(0,0,0,0.6)`,
        overflow:'hidden', position:'relative',
      }}>
        {/* Background pattern */}
        <div style={{ position:'absolute', inset:0, opacity:0.15,
          backgroundImage:'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.08) 8px, rgba(255,255,255,0.08) 9px)'
        }} />
        <div style={{
          height:'100%', width:`${pct*100}%`,
          background:`linear-gradient(to bottom, ${colorA}ee 0%, ${colorA}aa 50%, ${colorA}cc 100%)`,
          transition:'width 0.4s ease',
          boxShadow:`inset 0 1px 0 rgba(255,255,255,0.25), 0 0 6px ${glowColor}`,
          position:'relative',
          animation: pulse ? 'hpPulse 0.9s ease-in-out infinite' : 'none',
        }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'45%', background:'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)' }} />
        </div>
        {/* Tick marks */}
        {height >= 12 && [25,50,75].map(p => (
          <div key={p} style={{ position:'absolute', top:0, bottom:0, left:`${p}%`, width:1, background:'rgba(0,0,0,0.4)', zIndex:2 }} />
        ))}
      </div>
    </div>
  );
}

// ── Stat row ─────────────────────────────────────────────────────────────────
function StatRow({ icon, label, value, valueColor = '#D4C09A', onAssign }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5, padding:'2px 10px' }}>
      <span style={{ color:'#5A4020', width:12, display:'flex', justifyContent:'center', flexShrink:0 }}>{icon}</span>
      <span style={{ color:'#6A5030', fontSize:10, flex:1 }}>{label}</span>
      <span style={{ color:valueColor, fontSize:11, fontWeight:'bold' }}>{value}</span>
      {onAssign && (
        <button
          onClick={onAssign}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          title="Przydziel punkt statystyki"
          style={{
            marginLeft:3, width:16, height:16, padding:0,
            background: hov ? 'rgba(39,174,96,0.45)' : 'rgba(39,174,96,0.18)',
            border: `1px solid ${hov ? 'rgba(39,174,96,0.8)' : 'rgba(39,174,96,0.45)'}`,
            borderRadius:3, color:'#4ADE80', fontSize:11, fontWeight:'bold',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1,
            transition:'all 0.1s',
          }}
        >+</button>
      )}
    </div>
  );
}

// ── Przycisk akcji ────────────────────────────────────────────────────────────
function ActBtn({ icon, label, onClick, active, danger, small, title }) {
  const [hov, setHov] = useState(false);
  const col = danger ? '#C0392B' : active ? '#27AE60' : '#C8922A';
  const bg  = danger
    ? (hov ? 'rgba(130,20,20,0.95)' : 'rgba(80,10,10,0.7)')
    : active
    ? (hov ? 'rgba(15,85,32,0.95)'  : 'rgba(10,60,20,0.7)')
    : (hov ? 'rgba(58,40,14,0.95)'  : 'rgba(30,20,8,0.8)');
  const bdr = danger
    ? 'rgba(192,57,43,0.6)'
    : active
    ? 'rgba(39,174,96,0.6)'
    : (hov ? 'rgba(200,146,42,0.65)' : 'rgba(200,146,42,0.35)');
  return (
    <button
      onClick={onClick}
      title={title || label}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2,
        padding: small ? '5px 3px' : '7px 3px',
        background: bg,
        border:`1px solid ${bdr}`,
        borderRadius:3, cursor:'pointer', color:col,
        transition:'all 0.12s',
        transform: hov ? 'translateY(-1px)' : 'none',
        boxShadow: hov
          ? `0 3px 10px rgba(0,0,0,0.5), inset 0 0 10px ${col}25`
          : active || danger ? `inset 0 0 8px ${col}20` : 'none',
      }}
    >
      <span style={{ display:'flex', alignItems:'center' }}>{icon}</span>
      <span style={{ fontSize:9, color: active||danger||hov ? col : '#6A5030', whiteSpace:'nowrap', letterSpacing:'0.5px' }}>{label}</span>
    </button>
  );
}

// ── KOMPONENT GŁÓWNY ──────────────────────────────────────────────────────────
export default function CharPanel({
  postac, mapa, isAdmin,
  onInventory, onHeal, onPvpToggle, onAdmin, onLogout, onDisconnect,
  onQuests, onSocial, onGuild, onOutfit, onTalents, onStatAssigned,
}) {
  const [titles,       setTitles]       = useState([]);
  const [showTitles,   setShowTitles]   = useState(false);
  const [showPrestige, setShowPrestige] = useState(false);
  const [prestigeInfo, setPrestigeInfo] = useState(null);
  const [titleMsg,     setTitleMsg]     = useState('');

  const handleAssignStat = async (stat) => {
    const r = await api.character.assignStat(stat).catch(() => ({ ok: false }));
    if (r.ok && onStatAssigned) onStatAssigned();
  };

  useEffect(() => {
    if (!postac) return;
    api.character.titles().then(r => Array.isArray(r) && setTitles(r)).catch(() => {});
  }, [postac?.id, postac?.aktywny_tytul]);

  const handleEquipTitle = async (id) => {
    const r = await api.character.equipTitle(id).catch(() => ({ ok: false }));
    if (r.ok) {
      setTitleMsg('Tytuł aktywowany!');
      setTitles(prev => prev.map(t => ({ ...t, aktywny: t.id === id })));
      setTimeout(() => setTitleMsg(''), 2000);
    }
  };

  const handlePrestigeClick = async () => {
    const r = await api.character.prestigeInfo().catch(() => null);
    if (r) { setPrestigeInfo(r); setShowPrestige(true); }
  };

  const handlePrestigeConfirm = async () => {
    const r = await api.character.prestige().catch(() => ({ ok: false }));
    setShowPrestige(false);
    if (r.ok) { setTitleMsg(`✦ Prestige ${r.prestige}! Bonus: +${r.bonus_pct}%`); setTimeout(() => setTitleMsg(''), 4000); }
    else setTitleMsg(r.error || 'Błąd prestige');
  };

  if (!postac) return null;

  const fmtNum = (n) => {
    n = Number(n)||0;
    if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
    return String(n);
  };

  const lvl   = postac.poziom;
  const e1    = lvl > 1 ? Math.pow(lvl-1,4)+10 : 0;
  const e2    = Math.pow(lvl,4)+10;
  const expNow = postac.exp - e1;
  const expMax = e2 - e1;
  const hpPct  = postac.zycie_max > 0 ? postac.zycie/postac.zycie_max : 0;
  const hpColor = hpPct > 0.6 ? '#C0392B' : hpPct > 0.3 ? '#E67E22' : '#FF4444';

  const RANKA   = { GameAdmin:['#E74C3C','★ GA'], GameMaster:['#E67E22','✦ GM'], Moderator:['#3498DB','◈ Mod'] };
  const rankInfo = RANKA[postac.ranga];

  const KLASA_KOLOR = { Wojownik:'#C0392B', Paladyn:'#F39C12', Mag:'#8E44AD', Lowca:'#27AE60', Tropiciel:'#16A085', 'Tancerz Ostrzy':'#E74C3C' };
  const klasaColor = KLASA_KOLOR[postac.profesja] || '#C8922A';

  return (
    <>
    <style>{`@keyframes hpPulse { 0%,100%{opacity:1} 50%{opacity:0.55} }`}</style>
    <div style={{
      width: 208, flexShrink:0,
      display:'flex', flexDirection:'column',
      background:'linear-gradient(180deg, rgba(28,22,12,0.97) 0%, rgba(18,14,6,0.97) 100%)',
      borderRight:'1px solid rgba(200,146,42,0.35)',
      boxShadow:'inset -2px 0 20px rgba(0,0,0,0.8), 3px 0 12px rgba(0,0,0,0.6)',
      fontFamily:'"Palatino Linotype", "Book Antiqua", Palatino, Verdana, sans-serif',
      overflow:'hidden',
      position:'relative',
    }}>

      {/* Ozdobny nagłówek — herb postaci */}
      <div style={{
        padding:'14px 12px 10px',
        background:'linear-gradient(180deg, rgba(30,20,8,0.95), rgba(16,12,5,0.9))',
        borderBottom:'1px solid rgba(200,146,42,0.2)',
        textAlign:'center',
        position:'relative',
      }}>
        <OrnateCorners size={8} />

        {/* Portrait frame */}
        <div style={{
          width:76, height:92, margin:'0 auto 8px',
          position:'relative',
          background:'linear-gradient(160deg, rgba(30,20,8,0.95), rgba(10,7,3,0.98))',
          border:'2px solid rgba(200,146,42,0.5)',
          borderRadius:3,
          boxShadow:'0 0 20px rgba(200,146,42,0.15), inset 0 0 20px rgba(0,0,0,0.7)',
        }}>
          {/* Corner gems */}
          {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
            <div key={v+h} style={{
              position:'absolute', [v]:-4, [h]:-4, width:7, height:7, zIndex:3,
              background:'rgba(200,146,42,0.8)',
              borderRadius:'50%',
              boxShadow:'0 0 4px rgba(232,184,75,0.6)',
            }} />
          ))}

          {/* Avatar */}
          <div style={{
            position:'absolute', inset:0,
            background:`radial-gradient(ellipse at 50% 30%, rgba(200,146,42,0.06), transparent 70%)`,
          }} />
          <div style={{
            width:32, height:48,
            backgroundImage:`url(/assets/${postac.obrazek})`,
            backgroundPosition:'0 0', backgroundRepeat:'no-repeat', imageRendering:'pixelated',
            filter:`drop-shadow(0 0 6px ${klasaColor}60)`,
            margin:'18px auto 0',
          }} />
        </div>

        {/* Nazwa i ranga */}
        <div style={{ color:'#F0D080', fontWeight:'bold', fontSize:12, letterSpacing:'0.5px', textShadow:'0 0 12px rgba(200,146,42,0.4)' }}>
          {postac.nazwa}
        </div>
        {rankInfo && (
          <div style={{ color:rankInfo[0], fontSize:8, fontWeight:'bold', marginTop:1, textShadow:`0 0 8px ${rankInfo[0]}80` }}>
            {rankInfo[1]}
          </div>
        )}
        <div style={{ marginTop:3, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <span style={{ color:klasaColor, fontSize:9 }}>{postac.profesja}</span>
          <span style={{ color:'rgba(200,146,42,0.4)', fontSize:8 }}>·</span>
          <span style={{
            display:'inline-flex', alignItems:'center', gap:3,
            background:'rgba(200,146,42,0.12)', border:'1px solid rgba(200,146,42,0.3)',
            borderRadius:10, padding:'1px 8px', fontSize:9, color:'#E8B84B', fontWeight:'bold',
          }}>
            ✦ Poziom {postac.poziom}
          </span>
        </div>
        {/* Active title */}
        {postac.tytul_nazwa && (
          <div style={{
            marginTop:4, color:'#F0D060', fontSize:10, fontWeight:'bold',
            letterSpacing:'0.5px', textShadow:'0 0 10px rgba(232,200,75,0.6)',
          }}>
            {postac.tytul_ikona} {postac.tytul_nazwa}
          </div>
        )}
        {/* Prestige badge */}
        {postac.prestige > 0 && (
          <div style={{ marginTop:2, color:'#E8B84B', fontSize:8, fontWeight:'bold', letterSpacing:1 }}>
            {'⁽'+postac.prestige+'⁾'} Prestige
          </div>
        )}
        {titleMsg && <div style={{ marginTop:3, color:'#4ADE80', fontSize:8 }}>{titleMsg}</div>}
      </div>

      {/* HP / EXP */}
      <div style={{ paddingTop:6 }}>
        <StatusBar
          value={postac.zycie} max={postac.zycie_max}
          colorA={hpColor} colorB='#E74C3C' glowColor={`${hpColor}60`}
          label="Życie" height={14}
          pulse={hpPct < 0.3}
        />
        <StatusBar
          value={expNow} max={expMax}
          colorA='#27AE60' colorB='#2ECC71' glowColor='rgba(39,174,96,0.4)'
          label="Doświadczenie" height={7}
        />
      </div>

      <Divider label="Statystyki" />

      {/* Free stat points indicator */}
      {(postac.wolne_punkty_stat || 0) > 0 && (
        <div style={{
          margin:'0 10px 4px', padding:'3px 8px',
          background:'rgba(39,174,96,0.1)', border:'1px solid rgba(39,174,96,0.35)',
          borderRadius:3, display:'flex', alignItems:'center', gap:6,
        }}>
          <span style={{ color:'#4ADE80', fontSize:9, flex:1 }}>Wolne punkty stat.</span>
          <span style={{ color:'#4ADE80', fontSize:11, fontWeight:'bold' }}>{postac.wolne_punkty_stat}</span>
        </div>
      )}

      {/* Stats */}
      <div style={{ padding:'2px 0 4px' }}>
        <StatRow icon={<IconSword size={9}/>} label="Atak"
          value={`${postac.obrazenia_min}–${postac.obrazenia_max}`} valueColor='#C0392B' />
        <StatRow icon={<IconShield size={9}/>} label="Pancerz (AC)"
          value={postac.ac||0} valueColor='#2471A3' />
        <StatRow icon={<IconZap size={9}/>} label="Siła"
          value={postac.sila} valueColor='#E67E22'
          onAssign={(postac.wolne_punkty_stat||0) > 0 ? () => handleAssignStat('sila') : undefined} />
        <StatRow icon={<IconRun size={9}/>} label="Zręczność"
          value={postac.zrecznosc} valueColor='#27AE60'
          onAssign={(postac.wolne_punkty_stat||0) > 0 ? () => handleAssignStat('zrecznosc') : undefined} />
        <StatRow icon={<IconBrain size={9}/>} label="Intelekt"
          value={postac.intelekt} valueColor='#8E44AD'
          onAssign={(postac.wolne_punkty_stat||0) > 0 ? () => handleAssignStat('intelekt') : undefined} />
        <div style={{
          margin:'4px 10px 2px',
          padding:'3px 8px',
          background:'rgba(180,130,20,0.08)',
          border:'1px solid rgba(200,146,42,0.18)',
          borderRadius:3,
          display:'flex', alignItems:'center', gap:6,
        }}>
          <span style={{ color:'#7A5C1E' }}><IconCoin size={11}/></span>
          <span style={{ color:'#8A7050', fontSize:9, flex:1 }}>Złoto</span>
          <span style={{ color:'#E8B84B', fontSize:10, fontWeight:'bold' }}>{fmtNum(postac.zloto)}</span>
        </div>
      </div>

      <Divider label="Akcje" />

      {/* Action buttons row 1 */}
      <div style={{ display:'flex', gap:3, padding:'0 8px 3px' }}>
        <ActBtn icon={<IconBag size={13}/>} label="Plecak" onClick={onInventory} title="Ekwipunek [I]" />
        <ActBtn icon={<IconHeart size={13}/>} label="Ulecz" onClick={onHeal} title="Leczenie [H]" />
        <ActBtn
          icon={<IconCrosshair size={13}/>}
          label={postac.pvp ? 'PvP ON' : 'PvP OFF'}
          onClick={onPvpToggle} active={postac.pvp}
          title="Tryb PvP [P]"
        />
        {isAdmin && <ActBtn icon={<IconShield size={13}/>} label="Admin" onClick={onAdmin} danger />}
      </div>

      {/* Action buttons row 2 */}
      <div style={{ display:'flex', gap:3, padding:'0 8px 4px' }}>
        {onQuests && <ActBtn icon={<IconScroll size={13}/>} label="Questy" onClick={onQuests} title="Dziennik [Q]" />}
        {onSocial && <ActBtn icon={<IconUsers  size={13}/>} label="Znajomi" onClick={onSocial} title="Społeczność [U]" />}
        {onGuild  && <ActBtn icon={<IconCastle size={13}/>} label="Gildia" onClick={onGuild}  title="Gildia [G]" />}
        {onOutfit && <ActBtn icon={<IconTunic  size={13}/>} label="Wygląd" onClick={onOutfit} title="Zmień wygląd" />}
      </div>

      {/* Action buttons row 3: Titles + Prestige + Talents */}
      <div style={{ display:'flex', gap:3, padding:'0 8px 4px' }}>
        <ActBtn icon={<IconAward size={14} />} label="Tytuły" onClick={() => setShowTitles(v=>!v)} active={showTitles} small title="Tytuły postaci" />
        {onTalents && (
          <ActBtn
            icon={
              <span style={{ position:'relative', display:'inline-flex' }}>
                <IconStar size={14} />
                {postac.punkty_talentow > 0 && (
                  <span style={{
                    position:'absolute', top:-4, right:-6, width:8, height:8,
                    background:'#E74C3C', borderRadius:'50%', fontSize:5,
                    display:'flex', alignItems:'center', justifyContent:'center', color:'#fff',
                    fontWeight:'bold',
                  }}>{postac.punkty_talentow}</span>
                )}
              </span>
            }
            label="Talenty"
            onClick={onTalents}
            small
            title="Drzewko talentów [T]"
            active={postac.punkty_talentow > 0}
          />
        )}
        {postac.poziom >= 100 && (
          <ActBtn icon={<span>✦</span>} label="Prestige" onClick={handlePrestigeClick} small
            title="Wykonaj Prestige (poz.100)"
            style={{ animation:'prestigePulse 1.5s ease infinite' }}
          />
        )}
      </div>

      {/* Titles dropdown */}
      {showTitles && (
        <div style={{
          margin:'0 8px 4px', background:'rgba(0,0,0,0.5)',
          border:'1px solid rgba(200,146,42,0.2)', borderRadius:4,
          maxHeight:160, overflowY:'auto', fontSize:9,
        }}>
          <div style={{ padding:'4px 8px', color:'#5A4020', fontSize:7, letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid rgba(200,146,42,0.1)' }}>
            Twoje Tytuły ({titles.filter(t=>t.unlocked).length}/{titles.length})
          </div>
          {titles.filter(t => t.unlocked).map(t => (
            <div key={t.id} style={{
              display:'flex', alignItems:'center', gap:5, padding:'3px 8px',
              borderBottom:'1px solid rgba(200,146,42,0.06)',
              background: t.aktywny ? 'rgba(200,146,42,0.08)' : 'transparent',
            }}>
              <span>{t.ikona}</span>
              <span style={{ color: t.aktywny ? '#E8B84B' : '#8A7050', flex:1 }}>{t.nazwa}</span>
              {!t.aktywny && (
                <button onClick={() => handleEquipTitle(t.id)} style={{
                  padding:'1px 6px', fontSize:7, background:'rgba(200,146,42,0.15)',
                  border:'1px solid rgba(200,146,42,0.3)', borderRadius:2,
                  color:'#C8922A', cursor:'pointer',
                }}>Aktywuj</button>
              )}
              {t.aktywny && <span style={{ color:'#E8B84B', fontSize:7 }}>✓ aktywny</span>}
            </div>
          ))}
          {titles.filter(t => t.unlocked).length === 0 && (
            <div style={{ padding:'8px', color:'#3A2818', textAlign:'center', fontSize:9 }}>
              Brak odblokowanych tytułów
            </div>
          )}
        </div>
      )}

      {/* Prestige confirmation modal */}
      {showPrestige && prestigeInfo && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:300,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{
            background:'linear-gradient(160deg,rgba(20,14,6,0.99),rgba(10,7,3,0.99))',
            border:'1px solid rgba(200,146,42,0.5)', borderRadius:8,
            padding:20, maxWidth:320, width:'90vw', fontFamily:'Verdana,sans-serif',
          }}>
            <div style={{ color:'#E8B84B', fontWeight:'bold', fontSize:13, marginBottom:10, textAlign:'center' }}>✦ Prestige {prestigeInfo.prestige_aktualny + 1} ✦</div>
            <div style={{ color:'#8A7050', fontSize:10, marginBottom:8 }}>Po prestige Twoja postać zresetuje się do poziomu 1 z bonus {prestigeInfo.bonus_po}% do exp.</div>
            <div style={{ marginBottom:8 }}>
              <div style={{ color:'#4ADE80', fontSize:9, marginBottom:3 }}>Zachowujesz:</div>
              {prestigeInfo.zachowuje?.map((z,i) => <div key={i} style={{ color:'#22C55E', fontSize:9, paddingLeft:8 }}>✓ {z}</div>)}
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ color:'#F87171', fontSize:9, marginBottom:3 }}>Tracisz:</div>
              {prestigeInfo.traci?.map((z,i) => <div key={i} style={{ color:'#EF4444', fontSize:9, paddingLeft:8 }}>✗ {z}</div>)}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setShowPrestige(false)} style={{ flex:1, padding:'7px', background:'rgba(60,40,10,0.5)', border:'1px solid rgba(200,146,42,0.3)', borderRadius:4, color:'#8A7050', cursor:'pointer', fontSize:10 }}>Anuluj</button>
              <button onClick={handlePrestigeConfirm} style={{ flex:1, padding:'7px', background:'rgba(200,146,42,0.2)', border:'1px solid rgba(200,146,42,0.6)', borderRadius:4, color:'#E8B84B', cursor:'pointer', fontSize:10, fontWeight:'bold' }}>✦ Potwierdź</button>
            </div>
          </div>
        </div>
      )}

      <Divider label="Lokacja" />

      {/* Lokacja */}
      <div style={{ padding:'4px 10px 6px' }}>
        <div style={{ color:'#E8B84B', fontSize:10, fontWeight:'bold', marginBottom:2 }}>
          {mapa?.nazwa || '...'}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <span style={{ color:'#4A3828', fontSize:9 }}>X: <span style={{ color:'#8A7050' }}>{postac.x}</span></span>
          <span style={{ color:'#4A3828', fontSize:9 }}>Y: <span style={{ color:'#8A7050' }}>{postac.y}</span></span>
        </div>
      </div>

      <div style={{ flex:1 }} />

      {/* Disconnect / Logout */}
      <div style={{
        padding:'6px 8px',
        borderTop:'1px solid rgba(200,146,42,0.15)',
        background:'rgba(8,5,2,0.5)',
        display:'flex', flexDirection:'column', gap:3,
      }}>
        <button onClick={onDisconnect || onLogout} style={{
          width:'100%', padding:'6px',
          display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          background:'linear-gradient(135deg, rgba(80,10,10,0.8), rgba(50,5,5,0.8))',
          border:'1px solid rgba(192,57,43,0.4)',
          borderRadius:3, cursor:'pointer',
          color:'#E57373', fontSize:10, fontWeight:'bold',
          letterSpacing:'0.5px',
          boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          <IconLogout size={11}/> Rozłącz
        </button>
        {onLogout && onDisconnect && (
          <button onClick={onLogout} style={{
            width:'100%', padding:'3px',
            background:'none', border:'none',
            cursor:'pointer', color:'#4A3828', fontSize:9,
          }}>
            Wyloguj się
          </button>
        )}
      </div>
    </div>
    </>
  );
}
