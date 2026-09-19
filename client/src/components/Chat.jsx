import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';
import { T } from '../theme';

// mode: 'docked' (bottom panel, always visible) | 'floating' (mobile overlay)
export default function Chat({ socket, isMobile, onMessage, mode='floating', playerName }) {
  const [messages, setMessages]   = useState([]);
  const [input,    setInput]      = useState('');
  const [open,     setOpen]       = useState(!isMobile);
  const [unread,   setUnread]     = useState(0);
  const [dockOpen, setDockOpen]   = useState(true);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const mounted    = useRef(true);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    api.chat.get().then(msgs => { if (mounted.current) setMessages(msgs); });
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (!mounted.current) return;
      setMessages(prev => [...prev.slice(-99), msg]);
      onMessage?.(msg);
      if (!open && mode === 'floating') setUnread(p => p+1);
    };
    socket.on('chat_message', handler);
    return () => socket.off('chat_message', handler);
  }, [socket, open, onMessage, mode]);

  useEffect(() => {
    const isOpen = mode === 'docked' ? true : open;
    if (isOpen) { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); setUnread(0); }
  }, [messages, open, mode]);

  // Keyboard shortcut: Enter to focus chat
  useEffect(() => {
    if (mode !== 'docked') return;
    const fn = (e) => {
      if (e.key === 'Enter' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [mode]);

  const send = useCallback(async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    if (playerName) onMessage?.({ kto: playerName, tresc: text });
    if (socket?.connected) { socket.emit('chat_message', { tresc: text }); }
    else {
      await api.chat.send(text);
      api.chat.get().then(m => { if (mounted.current) setMessages(m); });
    }
  }, [input, socket, playerName]);

  // ── DOCKED MODE (desktop bottom panel) ───────────────────────────────────────
  if (mode === 'docked') {
    return (
      <div style={{
        height: dockOpen ? 130 : 26,
        flexShrink:0, overflow:'hidden',
        display:'flex', flexDirection:'column',
        background:'linear-gradient(180deg, #17130f 0%, #0d0b09 100%)',
        borderTop:'2px solid #7a5f2a',
        boxShadow:'inset 0 6px 16px rgba(0,0,0,0.6)',
        transition:'height 0.2s ease',
      }}>
        {/* Chat header — klikalne zwijanie */}
        <div
          onClick={() => setDockOpen(o => !o)}
          style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'3px 10px', cursor:'pointer', flexShrink:0,
            background:'linear-gradient(90deg, rgba(185,145,50,0.07), transparent)',
            borderBottom: dockOpen ? '1px solid rgba(185,145,50,0.12)' : 'none',
            userSelect:'none',
          }}
        >
          <span style={{ fontSize:7, fontWeight:'bold', letterSpacing:'2px', textTransform:'uppercase', color:'#7A5828' }}>
            ✦ Karczma — Czat globalny
          </span>
          <span style={{ fontSize:9, color:'#7A5828', lineHeight:1 }}>{dockOpen ? '▼' : '▲'}</span>
        </div>

        {dockOpen && <>
          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'3px 10px', display:'flex', flexDirection:'column', gap:1 }}>
            {messages.length===0 && (
              <div style={{ color:'#5A3A18', fontSize:9, textAlign:'center', marginTop:8, fontStyle:'italic' }}>Cisza w karczmie...</div>
            )}
            {messages.map((m,i) => {
              const own = m.kto === playerName;
              return (
                <div key={i} style={{ fontSize:10, lineHeight:1.4, display:'flex', gap:4, background: own ? 'rgba(74,122,42,0.08)' : 'transparent', borderRadius:2, padding:'1px 2px' }}>
                  <span style={{ color: own ? '#6CB83A' : '#F0C060', fontWeight:'bold', flexShrink:0 }}>[{m.kto}]</span>
                  <span style={{ color: own ? '#A0D880' : '#D4C8A0' }}>{m.tresc}</span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} style={{
            display:'flex', borderTop:'1px solid rgba(185,145,50,0.12)', flexShrink:0,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e=>setInput(e.target.value)}
              placeholder="Powiedz coś do podróżników... [Enter]"
              maxLength={250}
              style={{
                flex:1, background:'rgba(30,18,6,0.45)', color:'#C8A878',
                border:'none', padding:'5px 10px',
                fontSize:10, outline:'none',
                fontFamily:'"Palatino Linotype", Palatino, serif',
              }}
            />
            <button type="submit" style={{
              padding:'5px 12px',
              background:'rgba(185,145,50,0.18)', color:'#C8922A',
              border:'none', borderLeft:'1px solid rgba(185,145,50,0.15)',
              cursor:'pointer', fontSize:11, fontWeight:'bold',
            }}>➤</button>
          </form>
        </>}
      </div>
    );
  }

  // ── FLOATING MODE (mobile overlay) ────────────────────────────────────────────
  const hudOffset = isMobile ? 66 : 92;
  return (
    <div style={{ position:'absolute', bottom:hudOffset, left:0, width:isMobile?'100vw':300, zIndex:50 }}>
      {isMobile && (
        <button onClick={()=>{ setOpen(o=>!o); setUnread(0); }} style={{
          width:'100%', padding:'5px 12px',
          background:'linear-gradient(135deg, rgba(52,32,10,0.96), rgba(38,22,6,0.96))',
          color:'#E8D070', border:'1px solid rgba(200,150,32,0.3)', borderBottom:'none',
          textAlign:'left', cursor:'pointer', fontSize:11, fontWeight:'bold',
          fontFamily:'"Palatino Linotype",Palatino,serif',
        }}>
          ✦ Chat {!open && unread>0 && <span style={{ color:'#C0392B' }}>({unread})</span>}
        </button>
      )}

      {open && (
        <div style={{
          background:'linear-gradient(160deg, rgba(50,30,8,0.97), rgba(36,20,5,0.97))',
          border:'1px solid rgba(200,150,32,0.35)',
          backdropFilter:'blur(6px)',
          borderBottom:'none',
        }}>
          {!isMobile && (
            <div style={{ padding:'4px 10px', borderBottom:'1px solid rgba(200,150,32,0.15)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:'#7A5020', fontSize:9, fontWeight:'bold', letterSpacing:'1px', fontFamily:'"Palatino Linotype",Palatino,serif' }}>✦ CZAT</span>
            </div>
          )}
          <div style={{ height:isMobile?100:120, overflowY:'auto', padding:'4px 8px', display:'flex', flexDirection:'column', gap:1 }}>
            {messages.length===0 && <div style={{ color:'#3A4828', fontSize:10, textAlign:'center', marginTop:16, fontStyle:'italic' }}>Brak wiadomości...</div>}
            {messages.map((m,i) => {
              const own = m.kto === playerName;
              return (
                <div key={i} style={{ fontSize:isMobile?12:10, lineHeight:1.4, background: own ? 'rgba(74,122,42,0.08)' : 'transparent', borderRadius:2, padding:'1px 2px' }}>
                  <span style={{ color: own ? '#6CB83A' : '#F0C060', fontWeight:'bold' }}>[{m.kto}]</span>{' '}
                  <span style={{ color: own ? '#A0D880' : '#CDD4AA' }}>{m.tresc}</span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} style={{ display:'flex', borderTop:'1px solid rgba(200,150,32,0.12)' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e=>setInput(e.target.value)}
              placeholder="Wiadomość..."
              maxLength={250}
              style={{
                flex:1, background:'transparent', color:'#CDD4AA',
                border:'none', padding:isMobile?'9px 10px':'5px 8px',
                fontSize:isMobile?14:11, outline:'none',
                fontFamily:'"Palatino Linotype",Palatino,serif',
              }}
            />
            <button type="submit" style={{
              padding:isMobile?'9px 14px':'5px 12px',
              background:'rgba(74,122,42,0.25)', color:'#C8940A',
              border:'none', borderLeft:'1px solid rgba(200,150,32,0.15)',
              cursor:'pointer', fontSize:isMobile?14:11,
            }}>➤</button>
          </form>
        </div>
      )}
    </div>
  );
}
