import { useState, useEffect, useCallback } from 'react';
import {
  IconCastle, IconSparkles, IconFlame, IconSnowflake, IconSettings, IconSword,
  IconMoon, IconSkull, IconLock, IconUsers, IconCoin, IconScroll,
} from '../Icons';
import { api } from '../api';

const SERIF = '"Palatino Linotype",Palatino,serif';

const TYP_ICON = { loch:<IconCastle size={13} />, ruiny:<IconSparkles size={13} />, wulkan:<IconFlame size={13} />, mrozny:<IconSnowflake size={13} />, podziemia:<IconSettings size={13} /> };
const TYP_CLR  = { loch:'#e7c158', ruiny:'#A78BFA', wulkan:'#F97316', mrozny:'#60A5FA', podziemia:'#34D399' };
const DIFF_CLR = { normalny:'#4ADE80', heroiczny:'#F59E0B', legendarny:'#EF4444' };
const DIFF_ICN = { normalny:'★', heroiczny:'★★', legendarny:'★★★' };
const MOD_ICN  = { dark_curse:<IconMoon size={11} />, blessed:<IconSparkles size={11} />, mutated:<IconSkull size={11} />, no_potions:<IconLock size={11} />, horde:'', golden:'' };

function fmt(ms) {
  const s=Math.floor(ms/1000), m=Math.floor(s/60), se=s%60;
  return `${m}:${se.toString().padStart(2,'0')}`;
}
function fmtCd(wygasa) {
  const d = Math.max(0, new Date(wygasa)-Date.now());
  if (d < 3600000) return fmt(d);
  return `${Math.ceil(d/3600000)}h`;
}

// ── Karta dungeonu ────────────────────────────────────────────────────────────
function DungeonCard({ dung, onEnter, postacPoziom }) {
  const [diff, setDiff] = useState('normalny');
  const icon  = TYP_ICON[dung.typ]  || <IconSword size={13} />;
  const color = TYP_CLR[dung.typ]   || '#e7c158';
  const cd    = dung.cooldowns?.[diff];
  const canEnter = !cd && postacPoziom >= dung.min_poziom;

  return (
    <div style={{
      background: `linear-gradient(160deg, rgba(20,14,5,0.95), rgba(12,8,3,0.95))`,
      border: `1px solid ${color}33`,
      borderRadius: 10, marginBottom: 10, overflow: 'hidden',
    }}>
      {/* Nagłówek */}
      <div style={{
        display:'flex', alignItems:'center', gap:8, padding:'10px 14px',
        background: `linear-gradient(90deg,${color}18,transparent)`,
        borderBottom: `1px solid ${color}22`,
      }}>
        <span style={{ fontSize:18 }}>{icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ color:'#f7e3a4', fontWeight:'bold', fontSize:12 }}>{dung.nazwa}</div>
          <div style={{ color:'rgba(200,150,32,0.45)', fontSize:8 }}>{dung.opis}</div>
        </div>
        <div style={{ textAlign:'right', fontSize:8, color:'rgba(200,150,32,0.5)' }}>
          <div>Poz. min: <span style={{ color:'#e8e2d4' }}>{dung.min_poziom}</span></div>
          <div>Piętra: <span style={{ color:'#e8e2d4' }}>{dung.pietra}</span></div>
          <div>Max: <span style={{ color:'#e8e2d4' }}>{dung.max_graczy}★</span></div>
        </div>
      </div>

      <div style={{ padding:'10px 14px', display:'flex', flexDirection:'column', gap:8 }}>
        {/* Wybór trudności */}
        <div style={{ display:'flex', gap:5 }}>
          {['normalny','heroiczny','legendarny'].map(d => {
            const hasCd = !!dung.cooldowns?.[d];
            const active = diff === d;
            return (
              <button key={d} onClick={() => setDiff(d)}
                style={{
                  flex:1, padding:'5px 4px', borderRadius:6, cursor:'pointer',
                  background: active ? `${DIFF_CLR[d]}20` : 'rgba(0,0,0,0.2)',
                  border: `1px solid ${active ? DIFF_CLR[d]+'88' : 'rgba(200,150,32,0.1)'}`,
                  color: active ? DIFF_CLR[d] : hasCd ? 'rgba(200,150,32,0.3)' : 'rgba(200,150,32,0.5)',
                  fontSize:9, fontFamily:SERIF, fontWeight:active?'bold':'normal',
                }}>
                {DIFF_ICN[d]} {d.charAt(0).toUpperCase()+d.slice(1)}
                {hasCd && <div style={{ fontSize:7, color:'#EF4444', marginTop:1 }}>⏱ {fmtCd(dung.cooldowns[d])}</div>}
              </button>
            );
          })}
        </div>

        {/* Nagrody + czas */}
        <div style={{ display:'flex', gap:10, fontSize:8 }}>
          <span style={{ color:'rgba(200,150,32,0.5)' }}>⏱ {dung.czas_limit_min}min</span>
          <span style={{ color:'#06B6D4' }}>+{dung.exp_base} EXP</span>
          <span style={{ color:'#E8B84B' }}>+{dung.gold_base}g</span>
        </div>

        {/* Przycisk */}
        <button
          onClick={() => canEnter && onEnter(dung.id, diff)}
          disabled={!canEnter}
          style={{
            padding:'8px 0', borderRadius:7, fontFamily:SERIF, fontWeight:'bold', fontSize:11,
            cursor: canEnter ? 'pointer' : 'not-allowed',
            background: canEnter ? `linear-gradient(135deg,${color}22,${color}10)` : 'rgba(0,0,0,0.2)',
            color: canEnter ? color : 'rgba(200,150,32,0.25)',
            border: `1px solid ${canEnter ? color+'55' : 'rgba(200,150,32,0.1)'}`,
          }}>
          {!dung.eligible ? `Wymagany poz. ${dung.min_poziom}`
            : cd ? `⏱ Cooldown: ${fmtCd(cd)}`
            : <><IconSword size={12} /> Wejdź do dungeonu</>}
        </button>
      </div>
    </div>
  );
}

// ── Główny komponent ───────────────────────────────────────────────────────────
export default function DungeonFinder2({ onClose, addToast, onTeleport, postac }) {
  const [dungeons,    setDungeons]   = useState([]);
  const [history,     setHistory]    = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [entering,    setEntering]   = useState(false);
  const [tab,         setTab]        = useState('list'); // list | history

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, hist] = await Promise.all([api.dungeons2.list(), api.dungeons2.history()]);
      setDungeons(list||[]);
      setHistory(hist||[]);
    } catch(_) {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleEnter = useCallback(async (dungeon_id, trudnosc) => {
    setEntering(true);
    try {
      const r = await api.dungeons2.enter(dungeon_id, trudnosc);
      if (r.ok) {
        addToast?.(`${r.resumed?'Wznowiono':'Wchodzisz do'} dungeonu!`, 'success');
        onTeleport?.();
        onClose?.();
      } else {
        addToast?.(r.error||'Błąd', 'error');
      }
    } catch(_) { addToast?.('Błąd połączenia','error'); }
    setEntering(false);
  }, [addToast, onTeleport, onClose]);

  const RATING_CLR = { S:'#FFD700', A:'#4ADE80', B:'#60A5FA', C:'#9CA3AF' };

  return (
    <>
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:199 }} onClick={onClose} />
      <div style={{
        position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        zIndex:200, width:440, maxWidth:'97vw', maxHeight:'88vh',
        display:'flex', flexDirection:'column',
        background:'linear-gradient(160deg,rgba(14,10,3,0.99),rgba(8,5,2,0.99))',
        border:'1px solid rgba(200,146,42,0.3)',
        borderRadius:10, boxShadow:'0 8px 50px rgba(0,0,0,0.9)',
        fontFamily:SERIF, overflow:'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding:'10px 14px', flexShrink:0,
          background:'linear-gradient(90deg,rgba(40,25,5,0.8),rgba(20,14,4,0.6))',
          borderBottom:'1px solid rgba(200,146,42,0.22)',
          display:'flex', alignItems:'center', gap:8,
        }}>
          <span style={{ display:'flex', color:'#C8940A' }}><IconSword size={15} /></span>
          <span style={{ color:'#E8B84B', fontWeight:'bold', fontSize:13, flex:1, letterSpacing:'1px' }}>
            Dungeony Instancyjne
          </span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(200,146,42,0.5)', cursor:'pointer', fontSize:16 }}>✕</button>
        </div>

        {/* Zakładki */}
        <div style={{ display:'flex', borderBottom:'1px solid rgba(200,146,42,0.12)', flexShrink:0 }}>
          {[['list','Dungeony'],['history','Historia']].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex:1, padding:'7px', fontSize:10, fontFamily:SERIF,
              background: tab===key ? 'rgba(200,146,42,0.08)' : 'transparent',
              border:'none', borderBottom: tab===key ? '2px solid #e7c158' : '2px solid transparent',
              color: tab===key ? '#E8B84B' : 'rgba(200,146,42,0.45)',
              cursor:'pointer',
            }}>{label}</button>
          ))}
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:14 }}>
          {loading && (
            <div style={{ color:'rgba(200,146,42,0.45)', fontSize:11, textAlign:'center', padding:30 }}>Ładowanie...</div>
          )}
          {entering && (
            <div style={{ color:'#4ADE80', fontSize:11, textAlign:'center', padding:20 }}>⏳ Generowanie dungeonu...</div>
          )}

          {/* Lista dungeonów */}
          {!loading && !entering && tab==='list' && (
            dungeons.length===0
              ? <div style={{ color:'rgba(200,146,42,0.4)', fontSize:11, textAlign:'center', padding:30 }}>Brak dostępnych dungeonów</div>
              : dungeons.map(d => (
                <DungeonCard key={d.id} dung={d} onEnter={handleEnter} postacPoziom={postac?.poziom||1} />
              ))
          )}

          {/* Historia */}
          {!loading && tab==='history' && (
            history.length===0
              ? <div style={{ color:'rgba(200,146,42,0.4)', fontSize:11, textAlign:'center', padding:30 }}>Brak historii ukończeń</div>
              : history.map((h,i) => {
                const fmt2 = s => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
                return (
                  <div key={i} style={{
                    display:'flex', gap:8, padding:'8px 10px', marginBottom:6,
                    background:'rgba(14,10,3,0.6)', border:'1px solid rgba(200,146,42,0.1)',
                    borderRadius:7, alignItems:'center',
                  }}>
                    <span style={{ fontSize:20, color:RATING_CLR[h.wynik]||'#e8e2d4', fontWeight:'bold', minWidth:28, textAlign:'center' }}>
                      {h.wynik}
                    </span>
                    <div style={{ flex:1 }}>
                      <div style={{ color:'#f7e3a4', fontSize:11, fontWeight:'bold' }}>{h.dung_nazwa}</div>
                      <div style={{ color:'rgba(200,146,42,0.5)', fontSize:8 }}>
                        {h.trudnosc} · {fmt2(h.czas_s)} · {h.zgony} zgon{h.zgony===1?'':'y/ów'}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', fontSize:9 }}>
                      <div style={{ color:'#06B6D4' }}>+{h.exp_zdobyte} EXP</div>
                      <div style={{ color:'#E8B84B' }}>+{h.gold_zdobyte}g</div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </>
  );
}
