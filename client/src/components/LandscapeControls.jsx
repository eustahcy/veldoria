/**
 * LandscapeControls — Landscape HUD (dark fantasy cinematic redesign)
 * position:absolute — mapa wypełnia 100% ekranu.
 */
import { useCallback, useRef, useState, useEffect } from 'react';
import { api } from '../api';
import { IconLogout, IconShield } from '../Icons';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:     'rgba(4,8,15,0.90)',
  border: 'rgba(200,150,40,0.22)',
  borderB:'rgba(200,150,40,0.4)',
  gold:   '#E8C040',
  goldD:  'rgba(200,150,40,0.5)',
  text:   '#E8E0CC',
  muted:  'rgba(180,160,120,0.6)',
  blur:   'blur(20px)',
  green:  '#3DBB6A',
  SB:     'env(safe-area-inset-bottom, 0px)',
  SL:     'env(safe-area-inset-left, 0px)',
  SR:     'env(safe-area-inset-right, 0px)',
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
const PORA  = {dzien:'☀',swit:'🌅',zmierzch:'🌇',noc:'🌙'};
const POGOD = {deszcz:'🌧',mgla:'🌫',burza:'⛈'};

// ── D-pad directional button ──────────────────────────────────────────────────
function DBtn({label,top,left,onStart,onStop}) {
  return (
    <button
      onPointerDown={e=>{e.preventDefault();onStart(label);}}
      onPointerUp={onStop} onPointerLeave={onStop} onPointerCancel={onStop}
      style={{
        position:'absolute',top,left,width:38,height:38,borderRadius:7,
        background:'rgba(4,8,16,0.88)',backdropFilter:C.blur,
        border:C.border,color:C.gold,fontSize:16,fontWeight:700,
        display:'flex',alignItems:'center',justifyContent:'center',
        cursor:'pointer',touchAction:'none',
        WebkitTapHighlightColor:'transparent',userSelect:'none',
        boxShadow:'0 2px 10px rgba(0,0,0,0.6)',
      }}
    >{label}</button>
  );
}

// ── Circle action button ──────────────────────────────────────────────────────
function CBtn({icon,label,onClick,active,danger,badge,size=34}) {
  const col=danger?'#E05050':active?C.green:C.goldD;
  const bg =danger?'rgba(40,4,4,0.88)':active?'rgba(6,30,14,0.88)':C.bg;
  const bd =danger?'rgba(200,60,60,0.45)':active?'rgba(40,180,80,0.45)':C.border;
  return (
    <button onClick={onClick} style={{
      width:size,height:size,borderRadius:'50%',
      background:bg,backdropFilter:C.blur,border:`1px solid ${bd}`,
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1,
      cursor:'pointer',touchAction:'manipulation',color:col,flexShrink:0,
      WebkitTapHighlightColor:'transparent',userSelect:'none',
      boxShadow:active?`0 0 12px ${col}55,0 2px 8px rgba(0,0,0,0.5)`:'0 2px 8px rgba(0,0,0,0.5)',
      position:'relative',
    }}>
      {badge>0&&<span style={{position:'absolute',top:1,right:1,width:7,height:7,borderRadius:'50%',background:'#E84040'}}/>}
      <span style={{fontSize:size*.42,lineHeight:1}}>{typeof icon==='string'?icon:<span style={{display:'flex',transform:'scale(.85)'}}>{icon}</span>}</span>
      {label&&<span style={{fontSize:Math.max(4,size*.14),color:col,whiteSpace:'nowrap',opacity:.75}}>{label}</span>}
    </button>
  );
}

// ── Status bar (top strip) ────────────────────────────────────────────────────
function StatusBar({postac,mapa,worldState,pillTxt,activeEvent}) {
  const pct=postac.zycie_max>0?postac.zycie/postac.zycie_max:0;
  const col=hpColor(pct);
  const xp =xpPct(postac);
  const low=pct<.3;

  return (
    <div style={{
      position:'absolute',top:0,left:0,right:0,zIndex:62,height:32,
      background:'linear-gradient(180deg,rgba(2,4,10,0.96),rgba(4,8,16,0.88))',
      backdropFilter:C.blur,
      borderBottom:`1px solid ${C.border}`,
      display:'flex',alignItems:'center',gap:10,padding:'0 12px',
      pointerEvents:'none',
    }}>
      <style>{`@keyframes lsPulse{0%,100%{opacity:.8}50%{opacity:1;filter:brightness(1.4)}}`}</style>

      {/* Avatar micro */}
      <div style={{width:20,height:28,flexShrink:0,border:`1px solid ${C.borderB}`,borderRadius:3,overflow:'hidden',background:'rgba(4,8,16,0.9)'}}>
        <div style={{width:20,height:32,backgroundImage:`url(/assets/${postac.obrazek})`,backgroundPosition:'0 0',backgroundRepeat:'no-repeat',imageRendering:'pixelated'}}/>
      </div>

      {/* Name + level */}
      <span style={{color:C.gold,fontSize:10,fontWeight:700,fontFamily:SERIF,flexShrink:0}}>{postac.nazwa}</span>
      <span style={{color:C.goldD,fontSize:8,fontFamily:SERIF,flexShrink:0}}>Lv.{postac.poziom}</span>

      {/* HP bar */}
      <div style={{display:'flex',alignItems:'center',gap:5,flexShrink:0}}>
        <span style={{color:col,fontSize:8}}>❤</span>
        <div style={{width:52,height:4,background:'rgba(0,0,0,0.5)',borderRadius:2,overflow:'hidden'}}>
          <div style={{width:`${pct*100}%`,height:'100%',background:`linear-gradient(90deg,${col}88,${col})`,borderRadius:2,transition:'width .3s',animation:low?'lsPulse 1.1s ease-in-out infinite':'none'}}/>
        </div>
        <span style={{color:col,fontSize:7.5,fontWeight:700}}>{postac.zycie}<span style={{color:C.goldD,fontSize:6}}>/{postac.zycie_max}</span></span>
      </div>

      {/* XP micro */}
      <div style={{width:36,height:3,background:'rgba(0,0,0,0.5)',borderRadius:1,overflow:'hidden',flexShrink:0}}>
        <div style={{width:`${xp*100}%`,height:'100%',background:`linear-gradient(90deg,#1A4020,${C.green})`,borderRadius:1}}/>
      </div>

      {/* Separator */}
      <div style={{width:1,height:18,background:C.border,flexShrink:0}}/>

      {/* Map */}
      <span style={{color:'rgba(200,150,40,0.65)',fontSize:9,fontFamily:SERIF,fontWeight:700,flexShrink:0}}>{mapa?.nazwa||'…'}</span>
      <span style={{color:'rgba(200,150,40,0.22)',fontSize:7,flexShrink:0}}>({postac.x},{postac.y})</span>

      {/* World state */}
      {worldState?.pora&&<span style={{fontSize:13,flexShrink:0}}>{PORA[worldState.pora]||'☀'}{POGOD[worldState.pogoda]||''}</span>}

      {/* Gold */}
      <div style={{display:'flex',alignItems:'center',gap:4,color:'#E8C040',fontSize:9,fontWeight:700,flexShrink:0,fontFamily:SERIF}}>
        🪙 {fmtNum(postac.zloto)}
      </div>

      {/* Active event */}
      {activeEvent&&<span style={{color:activeEvent.kolor||C.gold,fontSize:7,border:`1px solid ${(activeEvent.kolor||C.gold)+'44'}`,borderRadius:3,padding:'1px 5px',flexShrink:0}}>✦ {activeEvent.nazwa}</span>}

      {/* Combat pill */}
      {pillTxt&&<span style={{marginLeft:'auto',color:'#E8D070',fontSize:8,fontWeight:700,background:'rgba(0,0,0,0.7)',border:C.border,borderRadius:8,padding:'1px 7px',flexShrink:0}}>{pillTxt}</span>}
    </div>
  );
}

// ── Chat panel ────────────────────────────────────────────────────────────────
function ChatPanel({open,messages,chatInput,setChatInput,onSend,bottomRef,onClose}) {
  if(!open) return null;
  return (
    <div style={{
      position:'absolute',left:10,bottom:`calc(${C.SB} + 138px)`,width:256,zIndex:65,
      background:'linear-gradient(170deg,rgba(4,8,16,0.97),rgba(2,4,10,0.98))',
      backdropFilter:C.blur,border:`1px solid ${C.border}`,
      borderRadius:12,boxShadow:'0 8px 28px rgba(0,0,0,0.8)',overflow:'hidden',
    }}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 10px',borderBottom:`1px solid ${C.border}`}}>
        <span style={{color:C.goldD,fontSize:8,letterSpacing:'1.5px',textTransform:'uppercase',fontFamily:SERIF}}>💬 Czat</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:C.goldD,cursor:'pointer',fontSize:14,padding:1}}>✕</button>
      </div>
      <div style={{height:84,overflowY:'auto',padding:'4px 10px',display:'flex',flexDirection:'column',gap:2}}>
        {messages.length===0
          ?<div style={{color:'rgba(200,150,40,0.2)',fontSize:8,textAlign:'center',paddingTop:12}}>Cisza…</div>
          :messages.map((m,i)=>(
            <div key={i} style={{fontSize:9,lineHeight:1.35}}>
              <span style={{color:C.gold,fontWeight:700,fontFamily:SERIF}}>[{m.kto}]</span>
              {' '}<span style={{color:C.text}}>{m.tresc}</span>
            </div>
          ))
        }
        <div ref={bottomRef}/>
      </div>
      <form onSubmit={onSend} style={{display:'flex',borderTop:`1px solid ${C.border}`}}>
        <input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Wiadomość…" maxLength={250}
          style={{flex:1,background:'transparent',color:C.text,border:'none',padding:'5px 8px',fontSize:11,outline:'none',fontFamily:'inherit'}}/>
        <button type="submit" style={{padding:'5px 10px',background:'rgba(60,40,4,0.5)',color:C.gold,border:'none',borderLeft:`1px solid ${C.border}`,cursor:'pointer',fontSize:12}}>➤</button>
      </form>
    </div>
  );
}

// ── MAIN: LANDSCAPE HUD ───────────────────────────────────────────────────────
const DIRS_MAP = {
  '▲':'gora','◀':'lewo','▼':'dol','▶':'prawo',
};

export function LandscapeHUD({
  postac,mapa,worldState,pillTxt,activeEvent,
  onMove,onLogout,onDisconnect,
  socket,isAdmin,
  onInventory,onPvpToggle,onAdmin,
  onQuests,onSocial,onGuild,
  onAuction,onCraft,onFishing,onTalents,onDungeon,onOutfit,
  onChatMessage,
  lsChatOpen,setLsChatOpen,
  lsMessages,lsChatInput,setLsChatInput,lsSendChat,lsBottomRef,
}) {
  const intervalRef=useRef(null);
  const startMove=useCallback(label=>{
    const dir=DIRS_MAP[label];
    onMove(dir); intervalRef.current=setInterval(()=>onMove(dir),215);
  },[onMove]);
  const stopMove=useCallback(()=>clearInterval(intervalRef.current),[]);

  const BOTTOM=`calc(${C.SB} + 8px)`;

  const ROW1=[
    {icon:'🎒',label:'Plecak',   onClick:onInventory},
    {icon:'🗡', label:postac.pvp?'PvP✓':'PvP', onClick:onPvpToggle, active:postac.pvp},
    {icon:'💬',label:'Czat',    onClick:()=>setLsChatOpen(o=>!o), active:lsChatOpen},
    {icon:'📜',label:'Questy',  onClick:onQuests},
    {icon:'👥',label:'Znajomi', onClick:onSocial},
    {icon:'⚜', label:'Gildia', onClick:onGuild},
  ];
  const ROW2=[
    {icon:'⚒', label:'Craft',   onClick:onCraft},
    {icon:'🏪',label:'Aukcje',  onClick:onAuction},
    {icon:'⭐',label:'Talenty', onClick:onTalents, badge:postac.punkty_talentow},
    {icon:'⚔', label:'Dungeon', onClick:onDungeon},
    {icon:'🎣',label:'Wędka',   onClick:onFishing},
    {icon:'👗',label:'Strój',   onClick:onOutfit},
  ];

  return (
    <>
      <StatusBar postac={postac} mapa={mapa} worldState={worldState} pillTxt={pillTxt} activeEvent={activeEvent}/>

      <ChatPanel
        open={lsChatOpen} messages={lsMessages}
        chatInput={lsChatInput} setChatInput={setLsChatInput}
        onSend={lsSendChat} bottomRef={lsBottomRef}
        onClose={()=>setLsChatOpen(false)}
      />

      {/* D-PAD — bottom-left */}
      <div style={{position:'absolute',bottom:BOTTOM,left:`calc(${C.SL} + 8px)`,zIndex:62,width:116,height:116}}>
        <DBtn label="▲" top={0}  left={39} onStart={startMove} onStop={stopMove}/>
        <DBtn label="◀" top={39} left={0}  onStart={startMove} onStop={stopMove}/>
        {/* Center gem */}
        <div style={{position:'absolute',top:39,left:39,width:38,height:38,borderRadius:8,background:'rgba(4,8,16,0.7)',border:C.border,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:`radial-gradient(circle,${C.gold},rgba(200,150,40,0.3))`,boxShadow:`0 0 8px ${C.gold}`}}/>
        </div>
        <DBtn label="▶" top={39} left={78} onStart={startMove} onStop={stopMove}/>
        <DBtn label="▼" top={78} left={39} onStart={startMove} onStop={stopMove}/>
      </div>

      {/* Logout — above D-pad */}
      <button onClick={onDisconnect||onLogout} style={{
        position:'absolute',bottom:`calc(${C.SB} + 132px)`,left:`calc(${C.SL} + 8px)`,
        zIndex:62,width:116,height:26,borderRadius:13,
        background:'rgba(30,4,4,0.88)',backdropFilter:C.blur,
        border:'1px solid rgba(180,30,30,0.4)',
        display:'flex',alignItems:'center',justifyContent:'center',gap:5,
        cursor:'pointer',color:'#E05050',fontSize:9,fontFamily:SERIF,
        WebkitTapHighlightColor:'transparent',
      }}>
        <IconLogout size={11}/> Wyjdź
      </button>

      {/* ACTION GRID — bottom-right (2 rows × 6 cols) */}
      <div style={{
        position:'absolute',bottom:BOTTOM,right:`calc(${C.SR} + 8px)`,
        zIndex:62,display:'flex',flexDirection:'column',gap:5,
      }}>
        <div style={{display:'flex',gap:5}}>
          {ROW1.map((b,i)=><CBtn key={i} {...b} size={34}/>)}
        </div>
        <div style={{display:'flex',gap:5}}>
          {ROW2.map((b,i)=><CBtn key={i} {...b} size={34}/>)}
          {isAdmin&&<CBtn icon={<IconShield size={13}/>} label="Admin" onClick={onAdmin} danger size={34}/>}
        </div>
      </div>
    </>
  );
}

// ── useLandscapeControls hook (unchanged) ─────────────────────────────────────
export function useLandscapeControls({socket,onChatMessage,postac}) {
  const [messages,  setMessages]  = useState([]);
  const [chatInput, setChatInput] = useState('');
  const bottomRef = useRef(null);
  const mounted   = useRef(true);

  useEffect(()=>{
    mounted.current=true;
    api.chat.get().then(m=>{if(mounted.current)setMessages(m);});
    return ()=>{mounted.current=false;};
  },[]);

  useEffect(()=>{
    if(!socket) return;
    const h=msg=>{if(mounted.current){setMessages(p=>[...p.slice(-49),msg]);onChatMessage?.(msg);}};
    socket.on('chat_message',h);
    return ()=>socket.off('chat_message',h);
  },[socket,onChatMessage]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[messages]);

  const sendChat=async e=>{
    e.preventDefault();
    const text=chatInput.trim(); if(!text) return;
    setChatInput('');
    onChatMessage?.({kto:postac.nazwa,tresc:text});
    if(socket?.connected) socket.emit('chat_message',{tresc:text});
    else{await api.chat.send(text);api.chat.get().then(m=>{if(mounted.current)setMessages(m);});}
  };

  return {messages,chatInput,setChatInput,bottomRef,sendChat};
}
