/**
 * MobileControls — Portrait HUD (dark fantasy cinematic redesign)
 * position:fixed — mapa wypełnia 100% ekranu.
 */
import { useCallback, useRef, useState, useEffect } from 'react';
import { api } from '../api';
import { IconLogout } from '../Icons';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:     'rgba(4,8,15,0.92)',
  bgDark: 'rgba(2,4,10,0.97)',
  border: 'rgba(200,150,40,0.22)',
  borderB:'rgba(200,150,40,0.4)',
  gold:   '#E8C040',
  goldD:  'rgba(200,150,40,0.5)',
  text:   '#E8E0CC',
  muted:  'rgba(180,160,120,0.6)',
  blur:   'blur(20px)',
  green:  '#3DBB6A',
  SAFE_B: 'env(safe-area-inset-bottom, 0px)',
  SAFE_T: 'env(safe-area-inset-top, 0px)',
};
const SERIF = '"Cinzel","Palatino Linotype",serif';

function fmtNum(n) {
  n=Number(n)||0;
  if(n>=1e6) return (n/1e6).toFixed(1)+'M';
  if(n>=1e3) return (n/1e3).toFixed(1)+'K';
  return String(n);
}
function hpColor(pct) { return pct>.5?'#3DBB6A':pct>.25?'#D4900A':'#C84040'; }
function xpPct(p) {
  const l=p.poziom,e1=l>1?Math.pow(l-1,4)+10:0,e2=Math.pow(l,4)+10;
  return (e2-e1)>0?(p.exp-e1)/(e2-e1):0;
}
const PORA_ICON  = {dzien:'☀',swit:'🌅',zmierzch:'🌇',noc:'🌙'};
const POGOD_ICON = {deszcz:'🌧',mgla:'🌫',burza:'⛈'};

// ── Glass circle button ───────────────────────────────────────────────────────
function GBtn({icon,label,onClick,active,danger,highlight,size=46}) {
  const col  = danger?'#E05050':active?C.green:highlight?'#E8C040':C.goldD;
  const bg   = danger?'rgba(40,4,4,0.88)':active?'rgba(6,30,14,0.9)':highlight?'rgba(40,28,4,0.9)':C.bg;
  const bd   = danger?'rgba(200,60,60,0.45)':active?'rgba(40,180,80,0.45)':highlight?'rgba(200,150,40,0.55)':C.border;
  const glow = active?`0 0 14px ${C.green}55`:highlight?`0 0 12px #E8C04055`:'none';
  return (
    <button onClick={onClick} style={{
      width:size,height:size,borderRadius:'50%',
      background:bg,backdropFilter:C.blur,border:`1px solid ${bd}`,
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1,
      cursor:'pointer',touchAction:'manipulation',color:col,
      WebkitTapHighlightColor:'transparent',userSelect:'none',flexShrink:0,
      boxShadow:`${glow},0 2px 12px rgba(0,0,0,0.5)`,position:'relative',
    }}>
      {highlight&&<span style={{position:'absolute',top:3,right:3,width:7,height:7,borderRadius:'50%',background:'#E84040',boxShadow:'0 0 5px #E84040'}}/>}
      <span style={{fontSize:size*.38,lineHeight:1}}>{icon}</span>
      {label&&<span style={{fontSize:Math.max(5,size*.12),color:col,whiteSpace:'nowrap',opacity:.8}}>{label}</span>}
    </button>
  );
}

// ── D-pad button ──────────────────────────────────────────────────────────────
function DBtn({label,onStart,onStop,style={}}) {
  return (
    <button
      onPointerDown={e=>{e.preventDefault();onStart();}}
      onPointerUp={onStop} onPointerLeave={onStop} onPointerCancel={onStop}
      style={{
        position:'absolute',width:44,height:44,borderRadius:8,
        background:'rgba(4,8,16,0.9)',backdropFilter:C.blur,
        border:C.border,color:C.gold,fontSize:18,fontWeight:700,
        display:'flex',alignItems:'center',justifyContent:'center',
        cursor:'pointer',touchAction:'none',
        WebkitTapHighlightColor:'transparent',userSelect:'none',
        boxShadow:'0 2px 12px rgba(0,0,0,0.6)',...style,
      }}
    >{label}</button>
  );
}

// ── TOP STATUS BAR ────────────────────────────────────────────────────────────
function TopBar({postac,mapa,onLogout,onDisconnect,worldState,pillTxt}) {
  const pct=postac.zycie_max>0?postac.zycie/postac.zycie_max:0;
  const col=hpColor(pct);
  const xp=xpPct(postac);
  const low=pct<.3;
  const RANKA={GameAdmin:['#E05050','GA'],GameMaster:['#D09020','GM'],Moderator:['#4080C0','Mod']};
  const rank=RANKA[postac.ranga];

  return (
    <>
      <style>{`
        @keyframes hudPulse{0%,100%{opacity:.8}50%{opacity:1;filter:brightness(1.4)}}
        @keyframes hudFadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
      `}</style>
      <div style={{
        position:'fixed',top:0,left:0,right:0,zIndex:500,
        paddingTop:C.SAFE_T,
        background:'linear-gradient(180deg,rgba(2,4,10,0.97),rgba(4,8,16,0.92))',
        backdropFilter:C.blur,
        borderBottom:`1px solid ${C.border}`,
        boxShadow:'0 4px 24px rgba(0,0,0,0.8)',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:9,padding:'7px 12px',height:52}}>
          {/* Avatar */}
          <div style={{width:30,height:42,flexShrink:0,border:`1px solid ${C.borderB}`,borderRadius:4,overflow:'hidden',background:'rgba(4,8,16,0.9)',boxShadow:`0 0 10px rgba(200,150,40,0.2)`}}>
            <div style={{width:32,height:48,backgroundImage:`url(/assets/${postac.obrazek})`,backgroundPosition:'0 0',backgroundRepeat:'no-repeat',imageRendering:'pixelated'}}/>
          </div>

          {/* Name + bars */}
          <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:3}}>
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <span style={{color:C.gold,fontSize:11,fontWeight:700,fontFamily:SERIF,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:110}}>{postac.nazwa}</span>
              <span style={{color:C.goldD,fontSize:8,fontFamily:SERIF}}>Lv.{postac.poziom}</span>
              {rank&&<span style={{color:rank[0],fontSize:7,fontWeight:700}}>{rank[1]}</span>}
              {postac.prestige>0&&<span style={{color:'#22D3EE',fontSize:7,fontWeight:700}}>✦{postac.prestige}</span>}
            </div>
            <div style={{height:5,background:'rgba(0,0,0,0.55)',borderRadius:3,overflow:'hidden'}}>
              <div style={{width:`${Math.min(100,pct*100)}%`,height:'100%',background:`linear-gradient(90deg,${col}88,${col})`,borderRadius:3,transition:'width .3s',boxShadow:low?`0 0 8px ${col}`:'none',animation:low?'hudPulse 1.1s ease-in-out infinite':'none'}}/>
            </div>
            <div style={{height:2,background:'rgba(0,0,0,0.5)',borderRadius:1,overflow:'hidden'}}>
              <div style={{width:`${xp*100}%`,height:'100%',background:`linear-gradient(90deg,#1A4020,${C.green})`,borderRadius:1}}/>
            </div>
          </div>

          {/* HP value */}
          <div style={{textAlign:'right',flexShrink:0}}>
            <div style={{color:col,fontSize:9,fontWeight:700,lineHeight:1}}>{postac.zycie}<span style={{color:C.goldD,fontSize:7}}>/{postac.zycie_max}</span></div>
            <div style={{color:C.goldD,fontSize:7,marginTop:1}}>HP</div>
          </div>

          <div style={{width:1,height:28,background:C.border,flexShrink:0}}/>

          {/* Gold */}
          <div style={{textAlign:'center',flexShrink:0}}>
            <div style={{color:'#E8C040',fontSize:11,fontWeight:700,fontFamily:SERIF}}>🪙 {fmtNum(postac.zloto)}</div>
            <div style={{color:C.goldD,fontSize:7}}>złoto</div>
          </div>

          {/* Weather */}
          {worldState?.pora&&<span style={{fontSize:15,flexShrink:0,lineHeight:1}}>{PORA_ICON[worldState.pora]||'☀'}{POGOD_ICON[worldState.pogoda]||''}</span>}

          {/* Combat pill */}
          {pillTxt&&<span style={{color:'#E8D070',fontSize:9,fontWeight:700,background:'rgba(0,0,0,0.7)',border:C.border,borderRadius:10,padding:'2px 8px',flexShrink:0,animation:'hudFadeUp .2s ease'}}>{pillTxt}</span>}

          {/* Logout */}
          <button onClick={onDisconnect||onLogout} style={{width:32,height:32,borderRadius:'50%',flexShrink:0,background:'rgba(30,4,4,0.9)',border:'1px solid rgba(200,60,60,0.4)',backdropFilter:C.blur,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#E05050',WebkitTapHighlightColor:'transparent'}}>
            <IconLogout size={13}/>
          </button>
        </div>

        {/* Bottom accent */}
        <div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(200,150,40,0.3),transparent)'}}/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'2px 12px',background:'rgba(200,150,40,0.03)'}}>
          <span style={{color:C.goldD,fontSize:8}}>✦</span>
          <span style={{color:'rgba(200,150,40,0.55)',fontSize:8,fontFamily:SERIF,letterSpacing:'.5px'}}>{mapa?.nazwa||'…'}</span>
          <span style={{color:C.goldD,fontSize:8}}>✦</span>
          <span style={{color:'rgba(200,150,40,0.22)',fontSize:7}}>({postac.x},{postac.y})</span>
        </div>
      </div>
    </>
  );
}

// ── CHAT PANEL ────────────────────────────────────────────────────────────────
function ChatPanel({messages,chatInput,setChatInput,onSend,bottomRef,onClose}) {
  return (
    <div style={{
      position:'fixed',left:8,right:8,
      bottom:`calc(${C.SAFE_B} + 162px)`,
      zIndex:490,
      background:'linear-gradient(170deg,rgba(4,8,16,0.97),rgba(2,4,10,0.98))',
      backdropFilter:C.blur,border:`1px solid ${C.border}`,
      borderRadius:14,boxShadow:'0 8px 32px rgba(0,0,0,0.8)',overflow:'hidden',
      animation:'hudFadeUp .2s ease',
    }}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 12px',borderBottom:`1px solid ${C.border}`}}>
        <span style={{color:C.goldD,fontSize:9,letterSpacing:'2px',textTransform:'uppercase',fontFamily:SERIF}}>💬 Czat</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:C.goldD,cursor:'pointer',fontSize:16,padding:2}}>✕</button>
      </div>
      <div style={{height:120,overflowY:'auto',padding:'6px 12px',display:'flex',flexDirection:'column',gap:3,WebkitOverflowScrolling:'touch'}}>
        {messages.length===0
          ?<div style={{color:'rgba(200,150,40,0.2)',fontSize:9,textAlign:'center',paddingTop:20}}>Cisza…</div>
          :messages.map((m,i)=>(
            <div key={i} style={{fontSize:10,lineHeight:1.4}}>
              <span style={{color:C.gold,fontWeight:700,fontFamily:SERIF}}>[{m.kto}]</span>
              {' '}<span style={{color:C.text}}>{m.tresc}</span>
            </div>
          ))
        }
        <div ref={bottomRef}/>
      </div>
      <form onSubmit={onSend} style={{display:'flex',borderTop:`1px solid ${C.border}`}}>
        <input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Wiadomość…" maxLength={250}
          style={{flex:1,background:'transparent',color:C.text,border:'none',padding:'8px 12px',fontSize:12,outline:'none',fontFamily:'inherit'}}/>
        <button type="submit" style={{padding:'8px 14px',background:'rgba(60,40,4,0.5)',color:C.gold,border:'none',borderLeft:`1px solid ${C.border}`,cursor:'pointer',fontSize:14}}>➤</button>
      </form>
    </div>
  );
}

// ── MENU DRAWER ───────────────────────────────────────────────────────────────
function MenuDrawer({onClose,isAdmin,postac,onInventory,onQuests,onSocial,onGuild,onAuction,onCraft,onFishing,onTalents,onDungeon,onOutfit,onAdmin,onHeal}) {
  const SECTIONS=[
    {label:'Postać',items:[
      {icon:'🎒',name:'Plecak',   col:'#E8C040',fn:onInventory},
      {icon:'🧪',name:'Eliksir',  col:'#E05050',fn:onHeal,    hl:postac.zycie<postac.zycie_max*.4},
      {icon:'👗',name:'Wygląd',   col:'#A07AF0',fn:onOutfit},
      {icon:'⭐',name:'Talenty',  col:'#FCD34D',fn:onTalents, badge:postac.punkty_talentow>0},
    ]},
    {label:'Świat',items:[
      {icon:'📜',name:'Questy',   col:'#E8C040',fn:onQuests},
      {icon:'👥',name:'Znajomi',  col:C.green,  fn:onSocial},
      {icon:'⚜', name:'Gildia',  col:'#F0D060',fn:onGuild},
      {icon:'⚔', name:'Dungeon', col:'#E05050',fn:onDungeon},
    ]},
    {label:'Aktywności',items:[
      {icon:'🎣',name:'Wędka',   col:'#60A5FA',fn:onFishing},
      {icon:'⚒', name:'Craft',  col:'#FB923C',fn:onCraft},
      {icon:'🏪',name:'Aukcje', col:'#A07AF0',fn:onAuction},
      ...(isAdmin?[{icon:'🛡',name:'Admin',col:'#E05050',fn:onAdmin}]:[]),
    ]},
  ];

  return (
    <div style={{
      position:'fixed',left:0,right:0,bottom:0,zIndex:495,
      background:'linear-gradient(170deg,rgba(4,8,16,0.98),rgba(2,4,10,0.99))',
      backdropFilter:C.blur,borderTop:`1px solid ${C.borderB}`,
      borderRadius:'18px 18px 0 0',
      boxShadow:'0 -12px 50px rgba(0,0,0,0.85)',
      paddingBottom:C.SAFE_B,maxHeight:'74vh',overflowY:'auto',
      WebkitOverflowScrolling:'touch',
    }}>
      {/* Handle + header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px 8px',borderBottom:`1px solid rgba(200,150,40,0.1)`}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:3,borderRadius:2,background:`linear-gradient(90deg,transparent,${C.borderB},transparent)`}}/>
          <span style={{color:C.goldD,fontSize:9,letterSpacing:'3px',textTransform:'uppercase',fontFamily:SERIF}}>◈ Menu ◈</span>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:C.goldD,cursor:'pointer',fontSize:20,padding:'2px 8px',lineHeight:1}}>✕</button>
      </div>

      {/* Character preview */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',borderBottom:`1px solid rgba(200,150,40,0.07)`}}>
        <div style={{width:32,height:44,border:`1px solid ${C.border}`,borderRadius:4,background:'rgba(4,8,16,0.9)',overflow:'hidden',flexShrink:0}}>
          <div style={{width:32,height:48,backgroundImage:`url(/assets/${postac.obrazek})`,backgroundPosition:'0 0',backgroundRepeat:'no-repeat',imageRendering:'pixelated'}}/>
        </div>
        <div style={{flex:1}}>
          <div style={{color:C.gold,fontSize:12,fontWeight:700,fontFamily:SERIF}}>{postac.nazwa}</div>
          <div style={{color:C.muted,fontSize:9,marginTop:1}}>{postac.profesja} · Lv.{postac.poziom}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{color:'#E8C040',fontSize:11,fontWeight:700}}>🪙 {fmtNum(postac.zloto)}</div>
          <div style={{color:C.muted,fontSize:8}}>złoto</div>
        </div>
      </div>

      {/* Sections */}
      <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:14}}>
        {SECTIONS.map(sec=>(
          <div key={sec.label}>
            <div style={{color:'rgba(200,150,40,0.35)',fontSize:7.5,textTransform:'uppercase',letterSpacing:'2px',marginBottom:8,fontFamily:SERIF,paddingLeft:2}}>✦ {sec.label}</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
              {sec.items.map(item=>(
                <button key={item.name} onClick={()=>{item.fn?.();onClose();}} style={{
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                  gap:6,padding:'14px 4px 12px',borderRadius:12,minHeight:72,
                  background:'rgba(4,8,16,0.85)',backdropFilter:C.blur,
                  border:`1px solid ${(item.badge||item.hl)?'rgba(200,150,40,0.45)':C.border}`,
                  cursor:'pointer',color:item.col||C.gold,
                  WebkitTapHighlightColor:'transparent',position:'relative',
                  boxShadow:item.hl?`0 0 12px ${item.col}44`:'none',
                }}>
                  {(item.badge||item.hl)&&<span style={{position:'absolute',top:5,right:6,width:8,height:8,borderRadius:'50%',background:item.hl?'#E84040':'#E8C040',boxShadow:`0 0 5px ${item.hl?'#E84040':'#E8C040'}`}}/>}
                  <span style={{fontSize:24}}>{item.icon}</span>
                  <span style={{fontSize:8,color:'rgba(200,150,40,0.6)',textAlign:'center',fontFamily:SERIF}}>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function MobileControls({
  onMove,onInventory,onPvpToggle,isAdmin,onAdmin,onLogout,onDisconnect,
  postac,mapa,worldState,pillTxt,socket,onChatMessage,
  onQuests,onSocial,onGuild,onAuction,onCraft,onFishing,onTalents,onDungeon,onOutfit,
  onHeal,
}) {
  const [showChat, setShowChat] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [chatInput,setChatInput]= useState('');
  const [messages, setMessages] = useState([]);
  const bottomRef  = useRef(null);
  const intervalRef= useRef(null);

  useEffect(()=>{
    if(showChat) api.chat.get().then(m=>Array.isArray(m)&&setMessages(m)).catch(()=>{});
  },[showChat]);

  useEffect(()=>{
    if(!socket) return;
    const fn=msg=>setMessages(prev=>[...prev.slice(-60),msg]);
    socket.on('chat_message',fn);
    return ()=>socket.off('chat_message',fn);
  },[socket]);

  useEffect(()=>{
    if(showChat) bottomRef.current?.scrollIntoView({behavior:'smooth'});
  },[messages,showChat]);

  const sendChat=async e=>{
    e.preventDefault();
    const t=chatInput.trim(); if(!t) return;
    setChatInput('');
    if(socket?.connected) socket.emit('chat_message',{tresc:t});
    else{await api.chat.send(t);api.chat.get().then(m=>Array.isArray(m)&&setMessages(m));}
    onChatMessage?.({kto:postac.nazwa,tresc:t});
  };

  const startMove=useCallback(dir=>{onMove(dir);intervalRef.current=setInterval(()=>onMove(dir),210);},[onMove]);
  const stopMove =useCallback(()=>clearInterval(intervalRef.current),[]);
  const BOTTOM=`calc(${C.SAFE_B} + 8px)`;

  return (
    <>
      <TopBar postac={postac} mapa={mapa} onLogout={onLogout} onDisconnect={onDisconnect} worldState={worldState} pillTxt={pillTxt}/>

      {/* D-PAD — bottom left */}
      <div style={{position:'fixed',left:14,bottom:BOTTOM,zIndex:480}}>
        <div style={{position:'relative',width:132,height:132}}>
          <DBtn label="▲" onStart={()=>startMove('gora')}  onStop={stopMove} style={{top:0,left:44}}/>
          <DBtn label="◀" onStart={()=>startMove('lewo')}  onStop={stopMove} style={{top:44,left:0}}/>
          <div style={{position:'absolute',top:44,left:44,width:44,height:44,borderRadius:8,background:'rgba(4,8,16,0.7)',border:C.border,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:`radial-gradient(circle,${C.gold},rgba(200,150,40,0.3))`,boxShadow:`0 0 8px ${C.gold}`}}/>
          </div>
          <DBtn label="▶" onStart={()=>startMove('prawo')} onStop={stopMove} style={{top:44,left:88}}/>
          <DBtn label="▼" onStart={()=>startMove('dol')}   onStop={stopMove} style={{top:88,left:44}}/>
        </div>
      </div>

      {/* ACTION BUTTONS — bottom right */}
      <div style={{position:'fixed',right:12,bottom:BOTTOM,zIndex:480,display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
        <div style={{display:'flex',gap:8}}>
          <GBtn icon="🗡" label="PvP"    onClick={onPvpToggle} active={postac?.pvp} size={42}/>
          <GBtn icon="💬" label="Czat"   onClick={()=>setShowChat(v=>!v)} active={showChat} size={42}/>
        </div>
        <div style={{display:'flex',gap:8}}>
          <GBtn icon="🧪" label="Heal"   onClick={onHeal} highlight={postac?.zycie<(postac?.zycie_max||1)*.4} size={42}/>
          <GBtn icon="🎒" label="Plecak" onClick={onInventory} size={42}/>
        </div>
        <GBtn icon="☰" label="Menu" onClick={()=>setShowMenu(v=>!v)} active={showMenu} size={54}/>
      </div>

      {showChat&&<ChatPanel messages={messages} chatInput={chatInput} setChatInput={setChatInput} onSend={sendChat} bottomRef={bottomRef} onClose={()=>setShowChat(false)}/>}

      {showMenu&&(
        <MenuDrawer
          onClose={()=>setShowMenu(false)}
          isAdmin={isAdmin} postac={postac}
          onInventory={()=>{onInventory();setShowMenu(false);}}
          onHeal={()=>{onHeal?.();setShowMenu(false);}}
          onQuests={()=>{onQuests();setShowMenu(false);}}
          onSocial={()=>{onSocial();setShowMenu(false);}}
          onGuild={()=>{onGuild();setShowMenu(false);}}
          onAuction={()=>{onAuction();setShowMenu(false);}}
          onCraft={()=>{onCraft();setShowMenu(false);}}
          onFishing={()=>{onFishing();setShowMenu(false);}}
          onTalents={()=>{onTalents();setShowMenu(false);}}
          onDungeon={()=>{onDungeon();setShowMenu(false);}}
          onOutfit={()=>{onOutfit?.();setShowMenu(false);}}
          onAdmin={()=>{onAdmin?.();setShowMenu(false);}}
        />
      )}
    </>
  );
}
