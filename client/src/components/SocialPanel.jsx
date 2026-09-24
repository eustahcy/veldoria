import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { IconX, IconCheck, IconUsers, IconChat, IconMail } from '../Icons';

// ── Friends tab ───────────────────────────────────────────────────────────────
function FriendsTab({ onViewProfile, onSendMsg }) {
  const [friends, setFriends] = useState([]);

  const load = useCallback(() => { api.social.friends().then(r => Array.isArray(r) && setFriends(r)); }, []);
  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    await api.social.removeFriend(id);
    load();
  };

  return (
    <div style={{ flex:1, overflowY:'auto', padding:10 }}>
      {friends.length === 0
        ? <div style={{ color:'#6b6456', textAlign:'center', paddingTop:30, fontSize:11 }}>Brak znajomych — kliknij na gracza na mapie by dodać</div>
        : friends.map(f => (
          <div key={f.id} style={{
            display:'flex', alignItems:'center', gap:8, padding:'8px 10px',
            background:'rgba(16,13,10,0.5)', border:'1px solid rgba(59,130,246,0.1)',
            borderRadius:6, marginBottom:5,
          }}>
            <div style={{ width:28, height:40, backgroundImage:`url(/assets/${f.obrazek})`, backgroundRepeat:'no-repeat', imageRendering:'pixelated', flexShrink:0 }} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background: f.zalogowany ? '#22C55E' : '#374151', flexShrink:0 }} />
                <span style={{ color:'#e8e2d4', fontWeight:'bold', fontSize:11 }}>{f.nazwa}</span>
                <span style={{ color:'#9a9182', fontSize:9 }}>poz.{f.poziom} {f.profesja}</span>
              </div>
              <div style={{ color: f.zalogowany ? '#22C55E' : '#374151', fontSize:8, marginTop:1 }}>{f.zalogowany ? 'Online' : 'Offline'}</div>
            </div>
            <button onClick={() => onViewProfile(f.id)} style={btnStyle('#e7c158')}>Profil</button>
            <button onClick={() => onSendMsg(f)} style={btnStyle('#A5B4FC')}><IconMail size={12} /></button>
            <button onClick={() => remove(f.id)} style={btnStyle('#F87171')}>✕</button>
          </div>
        ))
      }
    </div>
  );
}

// ── Messages tab ──────────────────────────────────────────────────────────────
function MessagesTab({ onViewProfile }) {
  const [msgs,   setMsgs]   = useState([]);
  const [compose,setCompose]= useState(null); // { toId, toName }
  const [text,   setText]   = useState('');
  const [flash,  setFlash]  = useState('');

  const load = useCallback(() => { api.social.messages().then(r => Array.isArray(r) && setMsgs(r)); }, []);
  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    await api.social.readMessage(id);
    setMsgs(prev => prev.map(m => m.id === id ? {...m, przeczytana:1} : m));
  };

  const markAll = async () => { await api.social.readAll(); load(); };

  const send = async () => {
    if (!compose || !text.trim()) return;
    const r = await api.social.sendMessage(compose.toId, text);
    if (r.ok) { setText(''); setFlash(`Wysłano do ${compose.toName}`); setCompose(null); setTimeout(()=>setFlash(''),3000); }
    else setFlash(r.error || 'Błąd');
  };

  const unread = msgs.filter(m => !m.przeczytana).length;

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'4px 10px', borderBottom:'1px solid rgba(200,150,32,0.08)', display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
        {unread > 0 && <span style={{ color:'#FCD34D', fontSize:9 }}>{unread} nieprzeczytanych</span>}
        {unread > 0 && <button onClick={markAll} style={{ ...btnStyle('#9a9182'), fontSize:8 }}>Odczytaj wszystkie</button>}
      </div>
      {flash && <div style={{ padding:'4px 10px', fontSize:10, color:'#4ADE80', background:'rgba(6,50,30,0.4)', flexShrink:0 }}>{flash}</div>}

      {compose ? (
        <div style={{ padding:12, flex:1, display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ color:'#f7e3a4', fontSize:11 }}>Do: <strong>{compose.toName}</strong></div>
          <textarea
            value={text} onChange={e=>setText(e.target.value)}
            placeholder="Treść wiadomości..."
            maxLength={500}
            style={{ flex:1, padding:'8px', background:'rgba(20,16,12,0.6)', color:'#e8e2d4', border:'1px solid rgba(59,130,246,0.2)', borderRadius:4, fontSize:11, outline:'none', resize:'none', fontFamily:'Verdana,sans-serif' }}
          />
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={send} style={btnStyle('#4ADE80')}><IconCheck size={10}/> Wyślij</button>
            <button onClick={()=>setCompose(null)} style={btnStyle('#9a9182')}>Anuluj</button>
          </div>
        </div>
      ) : (
        <div style={{ flex:1, overflowY:'auto', padding:8 }}>
          {msgs.length === 0
            ? <div style={{ color:'#6b6456', textAlign:'center', paddingTop:30, fontSize:11 }}>Brak wiadomości</div>
            : msgs.map(m => (
              <div key={m.id} onClick={() => !m.przeczytana && markRead(m.id)}
                style={{
                  padding:'8px 10px', marginBottom:4, borderRadius:6,
                  background: m.przeczytana ? 'rgba(20,16,12,0.4)' : 'rgba(32,26,17,0.7)',
                  border:`1px solid ${m.przeczytana ? 'rgba(200,150,32,0.08)' : 'rgba(200,150,32,0.3)'}`,
                  cursor: m.przeczytana ? 'default' : 'pointer',
                }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                  <span style={{ color: m.przeczytana ? '#9a9182' : '#f7e3a4', fontWeight:'bold', fontSize:10 }}>{m.od_nazwa}</span>
                  <span style={{ color:'#6b6456', fontSize:8 }}>{new Date(m.data).toLocaleString('pl-PL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</span>
                </div>
                <div style={{ color: m.przeczytana ? '#9a9182' : '#e8e2d4', fontSize:10, lineHeight:1.4 }}>{m.tresc}</div>
                <div style={{ display:'flex', gap:4, marginTop:4 }}>
                  <button onClick={e=>{e.stopPropagation();onViewProfile(m.od_id);}} style={{...btnStyle('#e7c158'),fontSize:8}}>Profil</button>
                  <button onClick={e=>{e.stopPropagation();setCompose({toId:m.od_id,toName:m.od_nazwa});}} style={{...btnStyle('#A5B4FC'),fontSize:8}}>Odpowiedz</button>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ── Main SocialPanel ──────────────────────────────────────────────────────────
export default function SocialPanel({ onClose, onViewProfile, defaultTab = 'friends' }) {
  const [tab, setTab] = useState(defaultTab);
  const [compose, setCompose] = useState(null);

  const handleSendMsg = (player) => {
    setTab('messages');
  };

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
      backdropFilter:'blur(4px)', display:'flex', alignItems:'center',
      justifyContent:'center', zIndex:200,
    }}>
      <div style={{
        width:480, maxWidth:'96vw', height:'75vh', maxHeight:580,
        background:'linear-gradient(160deg, rgba(22,18,13,0.99), rgba(14,12,9,0.99))',
        border:'1px solid rgba(200,150,32,0.25)', borderRadius:10,
        display:'flex', flexDirection:'column', overflow:'hidden',
        boxShadow:'0 12px 60px rgba(0,0,0,0.85)',
        fontFamily:'Verdana,sans-serif',
      }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', background:'rgba(20,16,12,0.5)', borderBottom:'1px solid rgba(200,150,32,0.15)', flexShrink:0 }}>
          <span style={{ color:'#e7c158' }}><IconUsers size={14}/></span>
          <span style={{ color:'#f7e3a4', fontWeight:'bold', fontSize:13 }}>Społeczność</span>
          <div style={{ display:'flex', gap:2, marginLeft:8 }}>
            {[['friends','Znajomi'],['messages','Wiadomości']].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                padding:'3px 12px', background:'none', border:'none', cursor:'pointer', fontSize:10,
                color:tab===t?'#f7e3a4':'#9a9182',
                borderBottom:tab===t?'2px solid #e7c158':'2px solid transparent',
                fontWeight:tab===t?'bold':'normal',
              }}>{l}</button>
            ))}
          </div>
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', color:'#9a9182', cursor:'pointer' }}>
            <IconX size={16}/>
          </button>
        </div>

        {tab === 'friends'  && <FriendsTab onViewProfile={onViewProfile} onSendMsg={f => { setTab('messages'); }} />}
        {tab === 'messages' && <MessagesTab onViewProfile={onViewProfile} />}
      </div>
    </div>
  );
}

function btnStyle(color) {
  return { padding:'2px 8px', background:`${color}18`, color, border:`1px solid ${color}44`, borderRadius:3, cursor:'pointer', fontSize:9, fontWeight:'bold' };
}
