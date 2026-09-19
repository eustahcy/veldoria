import { useState, useEffect } from 'react';
import { api } from '../api';
import { IconX, IconSword, IconShield, IconHeart, IconUsers } from '../Icons';

const RC = { unique:'#DAA520', heroic:'#2090FE', legendary:'#FA9A20', artefact:'#f0032a', normal:'#3A5A7A' };

function fmtTime(sec) {
  if (!sec) return '0m';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtNum(n) {
  n = Number(n) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ padding:'8px 10px', background:'rgba(8,13,5,0.5)', borderRadius:5, border:'1px solid rgba(200,150,32,0.12)', textAlign:'center' }}>
      <div style={{ color: color || '#8A7050', fontSize:9, marginBottom:3 }}>{label}</div>
      <div style={{ color:'#E8D070', fontWeight:'bold', fontSize:13 }}>{value}</div>
    </div>
  );
}

export default function PlayerProfile({ postacId, myId, onClose, onSendMessage, onChallengePvp, socket }) {
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [flash,    setFlash]    = useState('');
  const [tab,      setTab]      = useState('stats');
  const [comment,  setComment]  = useState('');
  const [sending,  setSending]  = useState(false);

  useEffect(() => {
    setLoading(true);
    api.social.profile(postacId)
      .then(r => { setProfile(r.error ? null : r); setLoading(false); })
      .catch(() => setLoading(false));
  }, [postacId]);

  const addFriend = async () => {
    const r = await api.social.addFriend(postacId);
    setFlash(r.ok ? `Dodano ${profile.nazwa} do znajomych!` : r.error || 'Błąd');
    setTimeout(() => setFlash(''), 3000);
  };

  const submitComment = async () => {
    if (!comment.trim()) return;
    setSending(true);
    const r = await api.social.addComment(postacId, comment).catch(() => ({ ok: false }));
    setSending(false);
    if (r.ok) {
      setComment('');
      // Reload profile to get new comment
      api.social.profile(postacId).then(r2 => r2 && !r2.error && setProfile(r2)).catch(() => {});
      setFlash('Komentarz dodany!');
      setTimeout(() => setFlash(''), 2000);
    } else {
      setFlash(r.error || 'Błąd');
    }
  };

  const deleteComment = async (cid) => {
    const r = await api.social.deleteComment(cid).catch(() => ({ ok: false }));
    if (r.ok) {
      setProfile(prev => prev ? { ...prev, komentarze: (prev.komentarze || []).filter(c => c.id !== cid) } : prev);
    }
  };

  if (loading) return (
    <div style={overlay}>
      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, color:'#5A6840', fontSize:11 }}>Ładowanie profilu...</div>
      </div>
    </div>
  );

  if (!profile) return (
    <div style={overlay}>
      <div style={card}>
        <div style={{ padding:20, textAlign:'center', color:'#F87171' }}>Nie znaleziono gracza</div>
        <button onClick={onClose} style={{ ...closeBtn, margin:'0 auto 16px', display:'block' }}>Zamknij</button>
      </div>
    </div>
  );

  const lvl     = profile.poziom;
  const e1      = lvl > 1 ? Math.pow(lvl-1,4)+10 : 0;
  const e2      = Math.pow(lvl,4)+10;
  const expPct  = (e2-e1) > 0 ? Math.min(1,(profile.exp-e1)/(e2-e1)) : 0;
  const hpPct   = profile.zycie_max > 0 ? profile.zycie/profile.zycie_max : 0;
  const hpClr   = hpPct > 0.5 ? '#22C55E' : hpPct > 0.25 ? '#F59E0B' : '#EF4444';
  const isSelf  = postacId === myId;
  const kd      = profile.deaths > 0 ? (profile.kills / profile.deaths).toFixed(1) : (profile.kills > 0 ? '∞' : '0');

  const TABS = ['stats', 'osiagniecia', 'tytuly', 'komentarze'];
  const TAB_LABEL = { stats:'Statystyki', osiagniecia:'Osiągnięcia', tytuly:'Tytuły', komentarze:'Komentarze' };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={card}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', background:'rgba(8,13,5,0.5)', borderBottom:'1px solid rgba(200,150,32,0.15)', flexShrink:0 }}>
          <span style={{ color:'#C8940A', display:'flex' }}><IconUsers size={14}/></span>
          <span style={{ color:'#E8D070', fontWeight:'bold', fontSize:12 }}>Profil gracza</span>
          {profile.zalogowany
            ? <span style={{ fontSize:9, color:'#22C55E' }}>● Online</span>
            : <span style={{ fontSize:9, color:'#374151' }}>● Offline</span>
          }
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', color:'#5A6840', cursor:'pointer' }}>
            <IconX size={16}/>
          </button>
        </div>

        {flash && <div style={{ padding:'4px 12px', fontSize:10, color:'#4ADE80', background:'rgba(6,50,30,0.5)' }}>{flash}</div>}

        {/* Hero section */}
        <div style={{ padding:'12px 16px', display:'flex', gap:12, alignItems:'flex-start', borderBottom:'1px solid rgba(200,150,32,0.1)' }}>
          <div style={{
            width:48, height:64, flexShrink:0,
            backgroundImage:`url(/assets/${profile.obrazek})`,
            backgroundRepeat:'no-repeat', backgroundPosition:'0 0', imageRendering:'pixelated',
            border:'2px solid rgba(200,150,32,0.3)', borderRadius:4,
            background:`rgba(4,8,16,0.8) url(/assets/${profile.obrazek}) 0 0 no-repeat`,
          }} />
          <div style={{ flex:1 }}>
            <div style={{ color:'#E8D070', fontWeight:'bold', fontSize:14 }}>
              {profile.nazwa}
              {profile.prestige > 0 && (
                <span style={{ color:'#E8B84B', fontSize:10, marginLeft:6 }}>⁽{profile.prestige}⁾</span>
              )}
            </div>
            {profile.tytul_nazwa && (
              <div style={{ color:'#DAA520', fontSize:9, fontStyle:'italic', marginBottom:2 }}>
                {profile.tytul_ikona} {profile.tytul_nazwa}
              </div>
            )}
            {profile.gildia_nazwa && (
              <div style={{ color:'#FCD34D', fontSize:10 }}>[{profile.gildia_tag}] {profile.gildia_nazwa}</div>
            )}
            <div style={{ color:'#7A8A5A', fontSize:10 }}>{profile.profesja}</div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:4, background:'rgba(74,122,42,0.15)', border:'1px solid rgba(200,150,32,0.3)', borderRadius:10, padding:'1px 10px', fontSize:10, color:'#C8940A', fontWeight:'bold' }}>
              Poziom {profile.poziom}
            </div>
          </div>
          {/* HP bar */}
          <div style={{ minWidth:90 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:8, color:'#5A6840', marginBottom:2 }}>
              <span>HP</span>
              <span style={{ color:hpClr }}>{profile.zycie}/{profile.zycie_max}</span>
            </div>
            <div style={{ height:6, background:'rgba(0,0,0,0.5)', borderRadius:3, overflow:'hidden', marginBottom:4 }}>
              <div style={{ width:`${hpPct*100}%`, height:'100%', background:hpClr, borderRadius:3 }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:7, color:'#3A4828', marginBottom:2 }}>
              <span>EXP</span><span>{Math.round(expPct*100)}%</span>
            </div>
            <div style={{ height:3, background:'rgba(0,0,0,0.5)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ width:`${expPct*100}%`, height:'100%', background:'#06B6D4', borderRadius:2 }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid rgba(200,150,32,0.15)', background:'rgba(4,6,3,0.3)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:'6px 4px', background:'none',
              border:'none', borderBottom: tab === t ? '2px solid #C8940A' : '2px solid transparent',
              color: tab === t ? '#E8B84B' : '#3A4828',
              cursor:'pointer', fontSize:9, fontWeight: tab === t ? 'bold' : 'normal',
              transition:'color 0.15s',
            }}>{TAB_LABEL[t]}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding:'10px 14px', overflowY:'auto', maxHeight:220 }}>
          {tab === 'stats' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
              <StatCard label="Zabicia"       value={fmtNum(profile.kills)}           color='#F87171' />
              <StatCard label="Śmierci"       value={fmtNum(profile.deaths)}          color='#7A8A5A' />
              <StatCard label="K/D"           value={kd}                              color='#FCD34D' />
              <StatCard label="Czas gry"      value={fmtTime(profile.czas_gry)}       color='#60A5FA' />
              <StatCard label="Questy"        value={fmtNum(profile.questy_count)}    color='#4ADE80' />
              <StatCard label="Złoto zar."    value={fmtNum(profile.zloto_zarobione)} color='#E8B84B' />
              <StatCard label="Osiągnięcia"   value={`${profile.osiagniecia_count||0}`} color='#A78BFA' />
              <StatCard label="Tytuły"        value={`${profile.tytuly_count||0}`}    color='#DAA520' />
              {profile.prestige > 0 && <StatCard label="Prestige" value={profile.prestige} color='#E8B84B' />}
            </div>
          )}

          {tab === 'osiagniecia' && (
            <div style={{ color:'#5A6840', fontSize:10, textAlign:'center', paddingTop:20 }}>
              Osiągnięcia odblokowane: {profile.osiagniecia_count || 0}<br/>
              <span style={{ fontSize:9, color:'#3A4828' }}>Szczegółowa lista dostępna w dzienniku questów</span>
            </div>
          )}

          {tab === 'tytuly' && (
            <div>
              {profile.tytul_nazwa && (
                <div style={{ marginBottom:8, padding:'5px 10px', background:'rgba(200,146,42,0.1)', border:'1px solid rgba(200,146,42,0.3)', borderRadius:4, color:'#E8B84B', fontSize:10 }}>
                  Aktywny: {profile.tytul_ikona} {profile.tytul_nazwa}
                </div>
              )}
              <div style={{ color:'#5A6840', fontSize:10 }}>
                Tytuły odblokowane: {profile.tytuly_count || 0}
              </div>
            </div>
          )}

          {tab === 'komentarze' && (
            <div>
              {!isSelf && (
                <div style={{ marginBottom:8, display:'flex', gap:5 }}>
                  <input
                    value={comment} onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitComment()}
                    placeholder="Napisz komentarz..."
                    maxLength={500}
                    style={{ flex:1, padding:'5px 8px', background:'rgba(0,0,0,0.4)', border:'1px solid rgba(200,150,32,0.25)', borderRadius:4, color:'#D4C09A', fontSize:10, outline:'none' }}
                  />
                  <button onClick={submitComment} disabled={sending} style={{ padding:'5px 10px', background:'rgba(200,146,42,0.2)', border:'1px solid rgba(200,146,42,0.4)', borderRadius:4, color:'#E8B84B', cursor:'pointer', fontSize:9 }}>
                    Wyślij
                  </button>
                </div>
              )}
              {(profile.komentarze || []).length === 0 && (
                <div style={{ color:'#3A4828', fontSize:10, textAlign:'center', paddingTop:10 }}>Brak komentarzy</div>
              )}
              {(profile.komentarze || []).map(c => (
                <div key={c.id} style={{ padding:'5px 8px', background:'rgba(8,13,5,0.4)', borderRadius:4, border:'1px solid rgba(200,150,32,0.08)', marginBottom:4 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ color:'#C8940A', fontSize:9, fontWeight:'bold' }}>{c.autor_nazwa}</span>
                    <span style={{ color:'#3A4828', fontSize:8, marginLeft:'auto' }}>{new Date(c.data).toLocaleDateString('pl-PL')}</span>
                    {(c.autor_postac_id === myId || isSelf) && (
                      <button onClick={() => deleteComment(c.id)} style={{ background:'none', border:'none', color:'#5A3030', cursor:'pointer', fontSize:9, padding:'0 2px' }}>✕</button>
                    )}
                  </div>
                  <div style={{ color:'#8A7050', fontSize:10, marginTop:2 }}>{c.tresc}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isSelf && (
          <div style={{ padding:'8px 16px', borderTop:'1px solid rgba(59,130,246,0.1)', display:'flex', gap:6, flexWrap:'wrap' }}>
            <button onClick={addFriend} style={actionBtn('#4ADE80')}>+ Znajomy</button>
            <button onClick={() => onSendMessage?.({ toId: postacId, toName: profile.nazwa })} style={actionBtn('#A5B4FC')}>✉ Wiadomość</button>
            {profile.zalogowany && (
              <button onClick={() => { onChallengePvp?.(postacId); onClose(); }} style={actionBtn('#F87171')}>⚔ Wyzwij PvP</button>
            )}
            {profile.zalogowany && (
              <button onClick={() => { onTradeRequest?.(postacId); onClose(); }} style={actionBtn('#C8940A')}>🤝 Handluj</button>
            )}
          </div>
        )}
        {isSelf && (
          <div style={{ padding:'8px 16px', borderTop:'1px solid rgba(59,130,246,0.1)', fontSize:9, color:'#3A4828', textAlign:'center' }}>To Twój profil</div>
        )}
      </div>
    </div>
  );
}

const overlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:250 };
const card    = { width:380, maxWidth:'96vw', maxHeight:'90vh', background:'linear-gradient(160deg, rgba(10,16,7,0.99), rgba(6,10,4,0.99))', border:'1px solid rgba(59,130,246,0.28)', borderRadius:10, overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 12px 50px rgba(0,0,0,0.85)', fontFamily:'Verdana,sans-serif' };
const closeBtn = { padding:'5px 14px', background:'rgba(15,32,64,0.5)', color:'#7A8A5A', border:'1px solid rgba(59,130,246,0.2)', borderRadius:4, cursor:'pointer', fontSize:10 };
function actionBtn(color) {
  return { flex:1, padding:'7px 8px', background:`${color}18`, color, border:`1px solid ${color}44`, borderRadius:4, cursor:'pointer', fontSize:10, fontWeight:'bold', minWidth:80 };
}
