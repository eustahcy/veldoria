import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';

const SERIF = '"Palatino Linotype",Palatino,serif';
const TYP_ICON  = { loch:'🏰', ruiny:'🔮', wulkan:'🌋', mrozny:'❄', podziemia:'⚙' };
const FLOOR_ICON = { arena:'⚔', elite:'👹', boss:'💀', treasure:'💎', shrine:'✦' };
const FLOOR_CLR  = { arena:'#C8940A', elite:'#F87171', boss:'#EF4444', treasure:'#FFD700', shrine:'#4ADE80' };
const MOD_CLR    = { dark_curse:'#6B7280', blessed:'#4ADE80', mutated:'#F97316', no_potions:'#EF4444', horde:'#F87171', golden:'#FFD700' };
const DIFF_CLR   = { normalny:'#4ADE80', heroiczny:'#F59E0B', legendarny:'#EF4444' };
const RATING_BG  = { S:'rgba(255,215,0,0.15)', A:'rgba(74,222,128,0.1)', B:'rgba(96,165,250,0.1)', C:'rgba(156,163,175,0.08)' };
const RATING_CLR = { S:'#FFD700', A:'#4ADE80', B:'#60A5FA', C:'#9CA3AF' };

function fmt(ms) {
  const s=Math.floor(ms/1000), m=Math.floor(s/60), se=s%60;
  return `${m}:${se.toString().padStart(2,'0')}`;
}

// ── Pasek HP bossa ────────────────────────────────────────────────────────────
function BossBar({ bossHp, bossMaxHp, bossFaza, nazwa }) {
  const pct = bossMaxHp > 0 ? Math.min(1, Math.max(0, bossHp / bossMaxHp)) : 0;
  const clr = pct > 0.6 ? '#E53E3E' : pct > 0.3 ? '#DD6B20' : '#9B2335';
  const fazaMarks = [0.6, 0.3];
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:8, marginBottom:2 }}>
        <span style={{ color:'#F87171', fontWeight:'bold' }}>💀 {nazwa}</span>
        <span style={{ color:'#E8B84B' }}>Faza {bossFaza} · {Math.round(pct*100)}%</span>
      </div>
      <div style={{ height:12, background:'rgba(60,10,10,0.8)', borderRadius:6, overflow:'hidden', border:'1px solid rgba(200,50,50,0.4)', position:'relative' }}>
        <div style={{ width:`${pct*100}%`, height:'100%', background:`linear-gradient(90deg,${clr}88,${clr})`, transition:'width 0.5s ease' }}/>
        {fazaMarks.map(m => (
          <div key={m} style={{
            position:'absolute', top:0, bottom:0, left:`${m*100}%`,
            width:2, background:'rgba(255,255,255,0.4)',
          }}/>
        ))}
      </div>
      <div style={{ fontSize:7, color:'rgba(200,100,100,0.5)', marginTop:2, textAlign:'right' }}>
        {Number(bossHp).toLocaleString()} / {Number(bossMaxHp).toLocaleString()}
      </div>
    </div>
  );
}

// ── Ekran ukończenia ──────────────────────────────────────────────────────────
function CompleteScreen({ result, onClose }) {
  const { rating, expReward, goldReward, czasSek, zgony, cele, score } = result;
  const m=Math.floor(czasSek/60), s=czasSek%60;
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:450,
      background:'rgba(2,5,1,0.92)', backdropFilter:'blur(6px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:SERIF,
    }}>
      <div style={{
        width:380, maxWidth:'95vw',
        background:'linear-gradient(160deg,rgba(14,10,3,0.99),rgba(8,5,2,0.99))',
        border:`1px solid ${RATING_CLR[rating]||'#C8940A'}55`,
        borderRadius:12, boxShadow:`0 0 60px ${RATING_CLR[rating]||'#C8940A'}20, 0 16px 50px rgba(0,0,0,0.9)`,
        overflow:'hidden', padding:0,
      }}>
        {/* Rating header */}
        <div style={{
          padding:'20px 0', textAlign:'center',
          background:`${RATING_BG[rating]||'rgba(200,150,32,0.08)'}`,
          borderBottom:`1px solid ${RATING_CLR[rating]||'#C8940A'}33`,
        }}>
          <div style={{ fontSize:64, lineHeight:1, marginBottom:4, filter:`drop-shadow(0 0 20px ${RATING_CLR[rating]})` }}>
            {rating==='S'?'🏆':rating==='A'?'⭐':rating==='B'?'✦':'◇'}
          </div>
          <div style={{ fontSize:28, fontWeight:'bold', color:RATING_CLR[rating], letterSpacing:4 }}>{rating}</div>
          <div style={{ fontSize:10, color:'rgba(200,150,32,0.5)', marginTop:2 }}>{score} pkt</div>
          <div style={{ color:'#E8D070', fontWeight:'bold', fontSize:14, marginTop:4 }}>DUNGEON UKOŃCZONY!</div>
        </div>

        <div style={{ padding:18, display:'flex', flexDirection:'column', gap:10 }}>
          {/* Statystyki */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[
              { label:'⏱ Czas', value:`${m}:${s.toString().padStart(2,'0')}`, color:'#CDD4AA' },
              { label:'💀 Zgony', value:zgony, color:zgony===0?'#4ADE80':'#F87171' },
              { label:'📋 Cele', value:`${cele?.length||0}`, color:'#C8940A' },
              { label:'🏅 Wynik', value:`${score}/100`, color:RATING_CLR[rating] },
            ].map(({label,value,color}) => (
              <div key={label} style={{
                background:'rgba(0,0,0,0.3)', border:'1px solid rgba(200,150,32,0.1)',
                borderRadius:6, padding:'8px 10px', textAlign:'center',
              }}>
                <div style={{ color:'rgba(200,150,32,0.5)', fontSize:8 }}>{label}</div>
                <div style={{ color, fontWeight:'bold', fontSize:13 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Nagrody */}
          <div style={{ background:'rgba(74,122,42,0.08)', border:'1px solid rgba(74,122,42,0.2)', borderRadius:8, padding:'10px 12px' }}>
            <div style={{ fontSize:8, color:'rgba(200,150,32,0.4)', letterSpacing:1, marginBottom:6 }}>NAGRODY</div>
            <div style={{ display:'flex', gap:14 }}>
              <span style={{ color:'#06B6D4', fontWeight:'bold', fontSize:13 }}>+{Number(expReward).toLocaleString()} EXP</span>
              <span style={{ color:'#E8B84B', fontWeight:'bold', fontSize:13 }}>+{Number(goldReward).toLocaleString()}g</span>
            </div>
          </div>

          {/* Ukończone cele */}
          {cele?.length > 0 && (
            <div style={{ fontSize:9, color:'rgba(200,150,32,0.5)' }}>
              Cele: {cele.map(c => <span key={c} style={{ marginRight:6, color:'#4ADE80' }}>✓ {c}</span>)}
            </div>
          )}

          <button onClick={onClose} style={{
            padding:'11px', background:'linear-gradient(135deg,rgba(40,26,8,0.8),rgba(20,13,3,0.8))',
            color:'#E8D070', border:`1px solid ${RATING_CLR[rating]||'#C8940A'}55`,
            borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:'bold', letterSpacing:'0.5px',
            fontFamily:SERIF,
          }}>Zamknij</button>
        </div>
      </div>
    </div>
  );
}

// ── Główny HUD ────────────────────────────────────────────────────────────────
export default function DungeonHUD({ addToast, onLeave }) {
  const [sesja,       setSesja]       = useState(null);
  const [advancing,   setAdvancing]   = useState(false);
  const [completing,  setCompleting]  = useState(false);
  const [claimingChest,setClaimingChest] = useState(false);
  const [timeLeft,    setTimeLeft]    = useState(0);
  const [result,      setResult]      = useState(null);
  const [collapsed,   setCollapsed]   = useState(false);
  const pollRef = useRef(null);

  const poll = useCallback(async () => {
    try {
      const s = await api.dungeons2.active();
      setSesja(s);
      if (s?.timeLeft !== undefined) setTimeLeft(s.timeLeft);
    } catch(_) {}
  }, []);

  useEffect(() => {
    poll();
    pollRef.current = setInterval(poll, 4000);
    return () => clearInterval(pollRef.current);
  }, [poll]);

  // Timer
  useEffect(() => {
    if (!sesja) return;
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t-1000)), 1000);
    return () => clearInterval(id);
  }, [sesja?.sesjaId]);

  const handleNextFloor = useCallback(async () => {
    setAdvancing(true);
    try {
      const r = await api.dungeons2.nextFloor();
      if (r.ok) {
        addToast?.(`Piętro ${r.newFloor}/${sesja?.totalFloors}: ${r.floorNazwa}`, 'success');
        await poll();
      } else {
        addToast?.(r.error||'Błąd','error');
      }
    } catch(_) {}
    setAdvancing(false);
  }, [sesja, addToast, poll]);

  const handleComplete = useCallback(async () => {
    setCompleting(true);
    try {
      const r = await api.dungeons2.complete();
      if (r.ok) {
        setResult(r);
        clearInterval(pollRef.current);
      } else {
        addToast?.(r.error||'Nie można ukończyć','error');
      }
    } catch(_) {}
    setCompleting(false);
  }, [addToast]);

  const handleClaimChest = useCallback(async () => {
    setClaimingChest(true);
    try {
      const r = await api.dungeons2.claimChest();
      if (r.ok) { addToast?.(`Skrzynia otwarta! +${r.gold}g`,'success'); await poll(); }
      else addToast?.(r.error||'Błąd','error');
    } catch(_) {}
    setClaimingChest(false);
  }, [addToast, poll]);

  const handleLeave = useCallback(async () => {
    if (!confirm('Opuścić dungeon? Postęp zostanie utracony.')) return;
    await api.dungeons2.leave().catch(()=>{});
    onLeave?.();
  }, [onLeave]);

  const handleResultClose = useCallback(() => {
    setResult(null);
    setSesja(null);
    onLeave?.();
  }, [onLeave]);

  if (!sesja) return null;

  const floorClr  = FLOOR_CLR[sesja.floorTyp]  || '#C8940A';
  const dungColor = TYP_CLR?.[sesja.dungeonTyp] || '#C8940A';
  const isTimeLow = timeLeft < 120000;
  const canAdvance = sesja.floorComplete && !sesja.isFinalFloor && sesja.floorTyp !== 'boss';
  const canComplete = sesja.floorComplete && sesja.isFinalFloor && sesja.isBossFloor && (sesja.bossHp||0)===0;

  if (result) return <CompleteScreen result={result} onClose={handleResultClose} />;

  return (
    <div style={{
      position:'fixed', top:90, left:16, zIndex:155,
      width: collapsed ? 180 : 230,
      background:'linear-gradient(160deg,rgba(18,12,3,0.97),rgba(10,6,2,0.97))',
      border:`1px solid ${dungColor}44`,
      borderRadius:8, fontFamily:SERIF, overflow:'hidden',
      boxShadow:`0 4px 20px rgba(0,0,0,0.8), 0 0 10px ${dungColor}12`,
      transition:'width 0.2s ease',
    }}>
      {/* Header */}
      <div onClick={() => setCollapsed(c=>!c)} style={{
        padding:'5px 10px', cursor:'pointer',
        background:`linear-gradient(90deg,${dungColor}22,transparent)`,
        borderBottom:`1px solid ${dungColor}22`,
        display:'flex', alignItems:'center', gap:6,
      }}>
        <span style={{ fontSize:12 }}>{TYP_ICON[sesja.dungeonTyp]||'⚔'}</span>
        <span style={{ color:'#E8B84B', fontSize:9, fontWeight:'bold', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {sesja.dungeonNazwa}
        </span>
        <span style={{ color:'rgba(200,146,42,0.5)', fontSize:10 }}>{collapsed?'▶':'▼'}</span>
      </div>

      {!collapsed && (
        <div style={{ padding:'8px 10px', display:'flex', flexDirection:'column', gap:6 }}>
          {/* Trudność + timer */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{
              fontSize:7, fontWeight:'bold', padding:'1px 6px', borderRadius:8,
              background:`${DIFF_CLR[sesja.trudnosc]||'#C8940A'}18`,
              border:`1px solid ${DIFF_CLR[sesja.trudnosc]||'#C8940A'}44`,
              color:DIFF_CLR[sesja.trudnosc]||'#C8940A',
            }}>{sesja.trudnosc?.toUpperCase()}</span>
            <span style={{
              fontSize:9, fontWeight:'bold',
              color:isTimeLow?'#F87171':'#C8940A',
              animation:isTimeLow?'furiaPulse 0.8s ease infinite':undefined,
            }}>⏱ {fmt(timeLeft)}</span>
          </div>

          {/* Piętro */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:8, marginBottom:3 }}>
              <span style={{ color:floorClr, fontWeight:'bold' }}>
                {FLOOR_ICON[sesja.floorTyp]||'⚔'} Piętro {sesja.currentFloor}/{sesja.totalFloors}
              </span>
              <span style={{ color:'rgba(200,150,32,0.45)' }}>{sesja.floorNazwa}</span>
            </div>
            {/* Pasek postępu pięter */}
            <div style={{ display:'flex', gap:2 }}>
              {Array.from({length:sesja.totalFloors}).map((_,i) => (
                <div key={i} style={{
                  flex:1, height:4, borderRadius:2,
                  background: i < sesja.currentFloor-1 ? '#4ADE80'
                    : i === sesja.currentFloor-1 ? floorClr
                    : 'rgba(0,0,0,0.4)',
                  border:'1px solid rgba(200,150,32,0.1)',
                }}/>
              ))}
            </div>
          </div>

          {/* Boss HP */}
          {sesja.isBossFloor && sesja.bossMaxHp > 0 && (
            <BossBar
              bossHp={sesja.bossHp||0}
              bossMaxHp={sesja.bossMaxHp}
              bossFaza={sesja.bossFaza}
              nazwa={`Boss ${sesja.dungeonTyp}`}
            />
          )}

          {/* Moby / Skrzynia / Kaplica */}
          {sesja.floorTyp === 'arena' || sesja.floorTyp === 'elite' ? (
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:8 }}>
              <span style={{ color:'rgba(200,150,32,0.5)' }}>Wrogowie:</span>
              <span style={{ color: sesja.mobsAlive===0 ? '#4ADE80' : '#F87171', fontWeight:'bold' }}>
                {sesja.mobsAlive} / {sesja.mobsTotal}
              </span>
            </div>
          ) : sesja.floorTyp === 'treasure' ? (
            <div style={{ color:'#FFD700', fontSize:9, textAlign:'center' }}>💎 Skarbiec {sesja.chestClaimed?'✓ Odebrano':'— otwórz skrzynię!'}</div>
          ) : sesja.floorTyp === 'shrine' ? (
            <div style={{ color:'#4ADE80', fontSize:9, textAlign:'center' }}>✦ Kaplica — HP/EN przywrócone</div>
          ) : null}

          {/* Zgony */}
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:8 }}>
            <span style={{ color:'rgba(200,150,32,0.5)' }}>Zgony drużyny:</span>
            <span style={{ color:sesja.zgony===0?'#4ADE80':sesja.zgony<=2?'#F59E0B':'#EF4444', fontWeight:'bold' }}>
              {sesja.zgony}
            </span>
          </div>

          {/* Modyfikatory */}
          {sesja.modifiers?.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:2 }}>
              {sesja.modifiers.map(m => (
                <span key={m.id} title={m.desc} style={{
                  fontSize:7, padding:'1px 5px', borderRadius:8,
                  background:`${MOD_CLR[m.id]||'#C8940A'}15`,
                  border:`1px solid ${MOD_CLR[m.id]||'#C8940A'}44`,
                  color:MOD_CLR[m.id]||'#C8940A',
                }}>{m.label}</span>
              ))}
            </div>
          )}

          {/* Akcje */}
          <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop:2 }}>
            {/* Skrzynia */}
            {sesja.floorTyp==='treasure' && !sesja.chestClaimed && (
              <button onClick={handleClaimChest} disabled={claimingChest} style={{
                padding:'6px', background:'rgba(255,215,0,0.15)', color:'#FFD700',
                border:'1px solid rgba(255,215,0,0.4)', borderRadius:5,
                cursor:claimingChest?'not-allowed':'pointer', fontSize:10, fontFamily:SERIF, fontWeight:'bold',
              }}>💎 Otwórz skrzynię</button>
            )}

            {/* Następne piętro */}
            {canAdvance && (
              <button onClick={handleNextFloor} disabled={advancing} style={{
                padding:'6px', background:'rgba(74,122,42,0.2)', color:'#4ADE80',
                border:'1px solid rgba(74,122,42,0.4)', borderRadius:5,
                cursor:advancing?'not-allowed':'pointer', fontSize:10, fontFamily:SERIF, fontWeight:'bold',
              }}>{advancing?'⏳ Przejście...':'→ Następne piętro'}</button>
            )}

            {/* Ukończ */}
            {canComplete && (
              <button onClick={handleComplete} disabled={completing} style={{
                padding:'6px', background:'rgba(255,215,0,0.15)', color:'#FFD700',
                border:'1px solid rgba(255,215,0,0.4)', borderRadius:5,
                cursor:completing?'not-allowed':'pointer', fontSize:10, fontFamily:SERIF, fontWeight:'bold',
                animation:'furiaPulse 0.8s ease infinite',
              }}>🏆 {completing?'Obliczam nagrody...':'Ukończ dungeon!'}</button>
            )}
          </div>
        </div>
      )}

      {/* Przycisk wyjścia — zawsze widoczny */}
      <button onClick={handleLeave} style={{
        width:'100%', padding:'6px 10px', textAlign:'center',
        background:'rgba(80,20,20,0.5)', color:'#F87171',
        border:'none', borderTop:`1px solid rgba(180,30,30,0.3)`,
        cursor:'pointer', fontSize:9, fontFamily:SERIF,
        WebkitTapHighlightColor:'transparent',
      }}>🚪 Opuść dungeon</button>

      <style>{`@keyframes furiaPulse{0%,100%{opacity:1}50%{opacity:0.55}}`}</style>
    </div>
  );
}
