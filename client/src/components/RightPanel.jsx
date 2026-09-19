import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { IconScroll, IconUsers, IconCastle, IconMail } from '../Icons';

const SERIF = '"Palatino Linotype",Palatino,serif';

// ── Nagłówek sekcji z chevronem ───────────────────────────────────────────────
function SectionHeader({ icon, label, count, open, onToggle, badge }) {
  return (
    <button onClick={onToggle} style={{
      width:'100%', display:'flex', alignItems:'center', gap:8,
      padding:'9px 12px',
      background: open
        ? 'linear-gradient(90deg,rgba(74,122,42,0.18),rgba(74,122,42,0.06))'
        : 'transparent',
      border:'none',
      borderBottom:`1px solid rgba(200,150,32,${open?'0.2':'0.08'})`,
      borderLeft: open ? '2px solid rgba(200,150,32,0.5)' : '2px solid transparent',
      cursor:'pointer', textAlign:'left',
      transition:'all 0.15s',
    }}>
      <span style={{ fontSize:13, color: open ? '#C8922A' : '#5A6840', display:'flex', alignItems:'center', transition:'color 0.15s' }}>{icon}</span>
      <span style={{ flex:1, fontSize:11, fontWeight:'bold', color: open ? '#E8D070' : '#8A9A6A', letterSpacing:'0.5px', fontFamily: SERIF }}>{label}</span>
      {count !== undefined && count > 0 && (
        <span style={{ fontSize:8, color:'#fff', background:'rgba(200,150,32,0.7)', borderRadius:10, padding:'1px 6px', fontWeight:'bold' }}>{count}</span>
      )}
      {badge > 0 && (
        <span style={{ fontSize:8, color:'#fff', background:'#C0392B', borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', flexShrink:0 }}>{badge}</span>
      )}
      <span style={{ color: open ? '#C8922A' : '#3A4828', fontSize:9, transition:'transform 0.2s', display:'inline-block', transform: open ? 'rotate(0)' : 'rotate(-90deg)' }}>▼</span>
    </button>
  );
}

// ── Sekcja questów ────────────────────────────────────────────────────────────
function QuestsSection({ onTurnIn }) {
  const [quests, setQuests] = useState([]);
  const load = useCallback(() => { api.quests.list().then(r => Array.isArray(r) && setQuests(r)); }, []);
  useEffect(() => { load(); }, [load]);

  const active    = quests.filter(q => q.status==='aktywny');
  const completed = quests.filter(q => q.status==='oddane').slice(0,3);

  const turnIn = async (q) => {
    const r = await api.quests.turnin(q.quest_id||q.id);
    if (r.ok) { onTurnIn?.(`+${r.rewards?.exp||0} EXP · +${r.rewards?.zloto||0}g`); load(); }
  };

  return (
    <div style={{ padding:'8px 0' }}>
      {active.length === 0 && <div style={emptyTxt}>Brak aktywnych questów</div>}
      {active.map(q => {
        const pct = q.cel_ilosc > 0 ? Math.min(1, q.postep/q.cel_ilosc) : 0;
        const done = pct >= 1;
        return (
          <div key={q.id} style={{
            margin:'0 8px 5px', padding:'7px 8px',
            background:'rgba(6,10,4,0.5)',
            border:`1px solid ${done?'rgba(200,150,32,0.3)':'rgba(74,122,42,0.15)'}`,
            borderRadius:5,
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
              <span style={{ color: done?'#E8D070':'#A09070', fontSize:10, fontWeight:'bold', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{q.nazwa}</span>
              <span style={{ color:'#5A6840', fontSize:8, flexShrink:0, marginLeft:4 }}>{q.postep}/{q.cel_ilosc}</span>
            </div>
            <div style={{ height:4, background:'rgba(0,0,0,0.5)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ width:`${pct*100}%`, height:'100%', background: done?'#E8C030':'#4A7A2A', borderRadius:2, transition:'width 0.3s' }} />
            </div>
            {done && (
              <button onClick={()=>turnIn(q)} style={{ marginTop:5, width:'100%', padding:'3px 0', background:'rgba(74,122,42,0.25)', color:'#6CB83A', border:'1px solid rgba(74,122,42,0.4)', borderRadius:3, cursor:'pointer', fontSize:9, fontWeight:'bold' }}>
                ★ Odbierz nagrody
              </button>
            )}
          </div>
        );
      })}
      {completed.length > 0 && (
        <div style={{ margin:'5px 8px 0', padding:'4px 8px', background:'rgba(6,10,4,0.3)', borderRadius:4 }}>
          <div style={{ fontSize:8, color:'#3A4828', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:3 }}>Ukończone</div>
          {completed.map(q => (
            <div key={q.id} style={{ fontSize:9, color:'#4A7A2A', display:'flex', alignItems:'center', gap:4, paddingBottom:2 }}>
              <span>✓</span><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{q.nazwa}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sekcja znajomych ──────────────────────────────────────────────────────────
function FriendsSection({ onViewProfile }) {
  const [friends, setFriends] = useState([]);
  useEffect(() => { api.social.friends().then(r => Array.isArray(r) && setFriends(r)); }, []);

  if (friends.length === 0) return <div style={emptyTxt}>Brak znajomych</div>;
  return (
    <div style={{ padding:'6px 0' }}>
      {friends.map(f => (
        <div key={f.id}
          onClick={() => onViewProfile?.(f.id)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', cursor:'pointer', borderBottom:'1px solid rgba(200,150,32,0.04)', transition:'background 0.1s' }}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(74,122,42,0.08)'}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}
        >
          <div style={{ width:3, height:3, borderRadius:'50%', background: f.zalogowany?'#27AE60':'#374151', flexShrink:0 }} />
          <div style={{ width:22, height:30, backgroundImage:`url(/assets/${f.obrazek})`, backgroundRepeat:'no-repeat', imageRendering:'pixelated', flexShrink:0 }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:'#A09070', fontSize:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.nazwa}</div>
            <div style={{ color: f.zalogowany?'#27AE60':'#3A4828', fontSize:8 }}>{f.zalogowany?'Online':'Offline'} · poz.{f.poziom}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Sekcja gildii ─────────────────────────────────────────────────────────────
function GuildSection({ socket, postacId, onOpenGuild }) {
  const [guild, setGuild] = useState(null);
  const [msgs,  setMsgs]  = useState([]);
  const [input, setInput] = useState('');
  useEffect(() => { api.social.guildMy().then(r => setGuild(r || false)); }, []);
  useEffect(() => {
    if (!socket) return;
    const h = m => setMsgs(p => [...p.slice(-19), m]);
    socket.on('guild_message', h);
    return () => socket.off('guild_message', h);
  }, [socket]);

  if (guild === false) return (
    <div style={{ padding:'12px 10px', textAlign:'center' }}>
      <div style={emptyTxt}>Nie należysz do gildii</div>
      <button onClick={onOpenGuild} style={{ marginTop:6, padding:'4px 14px', background:'rgba(74,122,42,0.2)', color:'#6CB83A', border:'1px solid rgba(74,122,42,0.3)', borderRadius:4, cursor:'pointer', fontSize:9 }}>
        Przeglądaj gildie [G]
      </button>
    </div>
  );
  if (!guild) return <div style={emptyTxt}>Ładowanie...</div>;

  const send = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket?.connected) return;
    socket.emit('guild_message', { tresc: input.trim() });
    setInput('');
  };

  return (
    <div>
      <div style={{ padding:'6px 10px', borderBottom:'1px solid rgba(200,150,32,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
          <span style={{ background:'rgba(160,200,255,0.12)', border:'1px solid rgba(160,200,255,0.3)', borderRadius:3, padding:'1px 5px', color:'#A0C8FF', fontSize:8, fontWeight:'bold', flexShrink:0 }}>
            {guild.tag}
          </span>
          <span style={{ color:'#E8D070', fontWeight:'bold', fontSize:11 }}>{guild.nazwa}</span>
        </div>
        <div style={{ color:'#5A6840', fontSize:9 }}>{guild.members?.length||0} członków · {guild.myRanga}</div>
      </div>
      {/* Members online */}
      <div style={{ padding:'4px 10px', borderBottom:'1px solid rgba(200,150,32,0.06)' }}>
        <div style={{ fontSize:7, color:'#3A4828', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:3 }}>Członkowie online</div>
        {guild.members?.filter(m=>m.zalogowany).slice(0,5).map(m=>(
          <div key={m.id} style={{ display:'flex', alignItems:'center', gap:5, padding:'2px 0', fontSize:9, color:'#5A6840' }}>
            <span style={{ width:4, height:4, borderRadius:'50%', background:'#27AE60', display:'inline-block' }} />
            {m.nazwa} <span style={{ color:'#3A4828' }}>poz.{m.poziom}</span>
          </div>
        ))}
        {!guild.members?.some(m=>m.zalogowany) && <div style={{ fontSize:9, color:'#3A4828', fontStyle:'italic' }}>Brak online</div>}
      </div>
      {/* Guild chat */}
      <div style={{ maxHeight:90, overflowY:'auto', padding:'4px 10px' }}>
        {msgs.length===0 && <div style={{ fontSize:8, color:'#2A3820', textAlign:'center', paddingTop:6, fontStyle:'italic' }}>Cisza w gildii...</div>}
        {msgs.map((m,i)=>(
          <div key={i} style={{ fontSize:9, lineHeight:1.4 }}>
            <span style={{ color:'#C8940A', fontWeight:'bold' }}>[{m.kto}]</span>{' '}
            <span style={{ color:'#7A8A5A' }}>{m.tresc}</span>
          </div>
        ))}
      </div>
      <form onSubmit={send} style={{ display:'flex', borderTop:'1px solid rgba(200,150,32,0.1)', background:'rgba(0,0,0,0.2)' }}>
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Wiadomość do gildii..." maxLength={200}
          style={{ flex:1, background:'transparent', color:'#C8B890', border:'none', padding:'5px 8px', fontSize:9, outline:'none' }}
        />
        <button type="submit" style={{ padding:'5px 10px', background:'rgba(200,150,32,0.15)', color:'#C8940A', border:'none', borderLeft:'1px solid rgba(200,150,32,0.15)', cursor:'pointer', fontSize:11 }}>✦</button>
      </form>
    </div>
  );
}

// ── Sekcja wiadomości ─────────────────────────────────────────────────────────
function MessagesSection({ onViewProfile }) {
  const [msgs,  setMsgs]  = useState([]);
  const [unread,setUnread]= useState(0);

  const load = useCallback(() => {
    api.social.messages().then(r => { if (Array.isArray(r)) { setMsgs(r.slice(0,8)); setUnread(r.filter(m=>!m.przeczytana).length); } });
  }, []);
  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    await api.social.readMessage(id);
    setMsgs(prev => prev.map(m => m.id===id ? {...m,przeczytana:1} : m));
    setUnread(p => Math.max(0,p-1));
  };

  return (
    <div>
      {unread > 0 && (
        <div style={{ display:'flex', justifyContent:'flex-end', padding:'3px 8px' }}>
          <button onClick={async()=>{ await api.social.readAll(); load(); }} style={{ fontSize:8, color:'#5A6840', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>
            Odczytaj wszystkie
          </button>
        </div>
      )}
      {msgs.length === 0 && <div style={emptyTxt}>Brak wiadomości</div>}
      {msgs.map(m => (
        <div key={m.id}
          onClick={()=>{ if(!m.przeczytana) markRead(m.id); onViewProfile?.(m.od_id); }}
          style={{
            padding:'6px 10px', cursor:'pointer', borderBottom:'1px solid rgba(200,150,32,0.04)',
            background: m.przeczytana ? 'transparent' : 'rgba(74,122,42,0.07)',
          }}
        >
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:1 }}>
            <span style={{ color: m.przeczytana?'#5A6840':'#A09070', fontWeight: m.przeczytana?'normal':'bold', fontSize:10 }}>
              {!m.przeczytana && <span style={{ color:'#C0392B', marginRight:4 }}>●</span>}
              {m.od_nazwa}
            </span>
            <span style={{ color:'#2A3820', fontSize:7 }}>{new Date(m.data).toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'})}</span>
          </div>
          <div style={{ color:'#3A4828', fontSize:9, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.tresc}</div>
        </div>
      ))}
    </div>
  );
}

// ── GŁÓWNY KOMPONENT ──────────────────────────────────────────────────────────
export default function RightPanel({ socket, postacId, onViewProfile, onTurnInReward, onGuild }) {
  const [open,     setOpen]     = useState(false);
  const [sections, setSections] = useState({ quests:true, friends:false, guild:false, messages:false });
  const [unreadMsg,setUnreadMsg]= useState(0);

  const toggle = (key) => setSections(p => ({ ...p, [key]:!p[key] }));

  useEffect(() => {
    const checkUnread = () => { api.social.unreadCount().then(r => { if (r.count !== undefined) setUnreadMsg(r.count); }); };
    checkUnread();
    const id = setInterval(checkUnread, 15000);
    return () => clearInterval(id);
  }, []);

  // Quest count
  const [activeQuestCount, setActiveQuestCount] = useState(0);
  useEffect(() => {
    api.quests.list().then(r => Array.isArray(r) && setActiveQuestCount(r.filter(q=>q.status==='aktywny').length));
  }, []);

  const SECTIONS = [
    { key:'quests',   icon:<IconScroll size={14}/>,  label:'Questy',       count: activeQuestCount||0 },
    { key:'friends',  icon:<IconUsers  size={14}/>,  label:'Znajomi',      count: 0 },
    { key:'guild',    icon:<IconCastle size={14}/>,  label:'Gildia',       count: 0 },
    { key:'messages', icon:<IconMail   size={14}/>,  label:'Wiadomości',   badge: unreadMsg },
  ];

  return (
    <div style={{
      display:'flex', flexDirection:'row', flexShrink:0,
      transition:'width 0.25s ease',
      width: open ? 240 : 36,
      overflow:'hidden',
      borderLeft:'1px solid rgba(200,150,32,0.2)',
      background:'linear-gradient(180deg,rgba(14,22,10,0.99),rgba(6,10,4,0.99))',
      boxShadow: open ? 'inset 2px 0 12px rgba(0,0,0,0.5)' : 'none',
    }}>

      {/* ── Toggle tab strip (36px) ── */}
      <div style={{ width:36, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:8, gap:6, borderRight: open ? '1px solid rgba(200,150,32,0.12)' : 'none' }}>
        {/* Toggle button */}
        <button
          onClick={() => setOpen(o => !o)}
          title={open ? 'Zwiń panel' : 'Rozwiń panel'}
          style={{
            width:28, height:28, borderRadius:5,
            background: open ? 'rgba(200,150,32,0.2)' : 'rgba(20,32,14,0.8)',
            border:`1px solid ${open ? 'rgba(200,150,32,0.5)' : 'rgba(200,150,32,0.2)'}`,
            color: open ? '#E8D070' : '#6A7A5A',
            cursor:'pointer', fontSize:12,
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.15s',
            boxShadow: open ? '0 0 8px rgba(200,150,32,0.15)' : 'none',
          }}
        >
          {open ? '›' : '‹'}
        </button>

        {/* Mini icon buttons (collapsed state) */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, marginTop:4 }}>
          {SECTIONS.map(s => {
            const cnt = s.badge ?? s.count;
            return (
              <button
                key={s.key}
                title={s.label}
                onClick={() => { setOpen(true); setSections(p => ({ ...p, [s.key]: true })); }}
                style={{ position:'relative', cursor:'pointer', color: '#6A8A5A', display:'flex', alignItems:'center', transition:'color 0.15s', background:'none', border:'none', padding:0 }}
                onMouseEnter={e => e.currentTarget.style.color='#C8922A'}
                onMouseLeave={e => e.currentTarget.style.color='#6A8A5A'}
              >
                {s.icon}
                {cnt > 0 && (
                  <span style={{ position:'absolute', top:-4, right:-5, minWidth:12, height:12, background:'#C0392B', borderRadius:6, fontSize:7, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', padding:'0 2px' }}>
                    {cnt > 9 ? '9+' : cnt}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Panel content (visible when open) ── */}
      {open && (
        <div style={{ width:204, display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0 }}>
          {/* Header */}
          <div style={{
            padding:'10px 12px 8px',
            background:'linear-gradient(180deg,rgba(20,30,14,0.95),rgba(10,16,7,0.9))',
            borderBottom:'1px solid rgba(200,150,32,0.2)',
            flexShrink:0, position:'relative',
          }}>
            {/* Top golden accent */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(200,150,32,0.5),transparent)' }} />
            <div style={{ fontSize:8, letterSpacing:'3px', textTransform:'uppercase', color:'#C8922A', fontFamily: SERIF }}>
              ✦ Panel Gracza
            </div>
          </div>

          <div style={{ flex:1, overflowY:'auto' }}>
            <SectionHeader icon={<IconScroll size={13}/>} label="Questy" count={activeQuestCount||undefined} open={sections.quests} onToggle={()=>toggle('quests')} />
            {sections.quests && <QuestsSection onTurnIn={onTurnInReward} />}

            <SectionHeader icon={<IconUsers size={13}/>} label="Znajomi" open={sections.friends} onToggle={()=>toggle('friends')} />
            {sections.friends && <FriendsSection onViewProfile={onViewProfile} />}

            <SectionHeader icon={<IconCastle size={13}/>} label="Gildia / Klan" open={sections.guild} onToggle={()=>toggle('guild')} />
            {sections.guild && <GuildSection socket={socket} postacId={postacId} onOpenGuild={onGuild} />}

            <SectionHeader icon={<IconMail size={13}/>} label="Wiadomości" open={sections.messages} onToggle={()=>toggle('messages')} badge={unreadMsg} />
            {sections.messages && <MessagesSection onViewProfile={onViewProfile} />}
          </div>
        </div>
      )}
    </div>
  );
}

const emptyTxt = { padding:'10px 10px', color:'#2A3820', fontSize:10, textAlign:'center', fontStyle:'italic' };
