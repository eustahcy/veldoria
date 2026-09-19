import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';
import { T } from '../theme';

// Kanały: lokalny (ta sama mapa), globalny i handel (wszyscy), gildia, system (komunikaty serwera)
const TABS = [
  { id: 'wszystkie', label: 'Wszystkie' },
  { id: 'lokalny',   label: 'Lokalny' },
  { id: 'globalny',  label: 'Globalny' },
  { id: 'handel',    label: 'Handel' },
  { id: 'gildia',    label: 'Gildia' },
  { id: 'system',    label: 'System' },
];
const KOLOR    = { lokalny: '#d8d0bc', globalny: '#7fd67a', handel: '#f0a24b', gildia: '#6fb2ff', system: '#ff7a68' };
const ETYKIETA = { lokalny: 'Lokalny', globalny: 'Globalny', handel: 'Handel', gildia: 'Gildia', system: 'System' };
const PLACEHOLDER = {
  lokalny: 'Napisz do graczy na tej mapie… [Enter]',
  wszystkie: 'Napisz do graczy na tej mapie… [Enter]',
  globalny: 'Napisz do wszystkich graczy…',
  handel: 'Kupię / sprzedam…',
  gildia: 'Napisz do gildii…',
};
// Komunikaty serwera (bossy, eventy, admin) nie mają kanału — rozpoznajemy je po nadawcy
const kanalOf = (m) => m.kanal || (/SYSTEM|BOSS|ADMIN/.test(m.kto || '') ? 'system' : 'lokalny');

// mode: 'docked' (bottom panel, always visible) | 'floating' (mobile overlay)
export default function Chat({ socket, isMobile, onMessage, mode='floating', playerName }) {
  const [messages, setMessages]   = useState([]);
  const [input,    setInput]      = useState('');
  const [open,     setOpen]       = useState(!isMobile);
  const [unread,   setUnread]     = useState(0);
  const [dockOpen, setDockOpen]   = useState(true);
  const [tab,      setTab]        = useState('wszystkie');
  const bottomRef  = useRef(null);
  const listRef    = useRef(null);
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
    const guild = (msg) => {
      if (!mounted.current) return;
      setMessages(prev => [...prev.slice(-99), { ...msg, kanal: 'gildia' }]);
    };
    socket.on('chat_message', handler);
    socket.on('guild_message', guild);
    return () => { socket.off('chat_message', handler); socket.off('guild_message', guild); };
  }, [socket, open, onMessage, mode]);

  useEffect(() => {
    const isOpen = mode === 'docked' || mode === 'overlay' ? true : open;
    // scrollTop zamiast scrollIntoView — ten drugi przewijałby też mapę pod nakładką
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    else if (isOpen) bottomRef.current?.scrollIntoView({ behavior:'smooth' });
    if (isOpen) setUnread(0);
  }, [messages, open, mode]);

  // Keyboard shortcut: Enter to focus chat
  useEffect(() => {
    if (mode !== 'docked' && mode !== 'overlay') return;
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
    if (tab === 'gildia') { socket?.emit('guild_message', { tresc: text }); return; }
    const kanal = ['globalny', 'handel'].includes(tab) ? tab : 'lokalny';
    if (playerName && kanal === 'lokalny') onMessage?.({ kto: playerName, tresc: text });
    if (socket?.connected) { socket.emit('chat_message', { tresc: text, kanal }); }
    else {
      await api.chat.send(text, kanal);
      api.chat.get().then(m => { if (mounted.current) setMessages(m); });
    }
  }, [input, socket, playerName, tab, onMessage]);

  // ── OVERLAY MODE (półprzezroczyste okno na mapie, lewy dolny róg) ─────────────
  if (mode === 'overlay') {
    const shown = tab === 'wszystkie' ? messages : messages.filter(m => kanalOf(m) === tab);
    const OV = { globalny: '#ff8a5c', handel: '#5ec8ff', gildia: '#7fd67a', system: '#c79bff', lokalny: '#e8e2d4' };
    const OT = TABS.filter(t => t.id !== 'lokalny');
    return (
      <div style={{
        width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(14,11,8,0.86), rgba(8,6,5,0.9))',
        border: '1px solid #7a5f2a', borderRadius: 4,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.8), 0 10px 26px rgba(0,0,0,0.6)',
        fontFamily: "'Trebuchet MS', Verdana, sans-serif", backdropFilter: 'blur(2px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid rgba(122,95,42,0.7)', flexShrink: 0 }}>
          {OT.map(t => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); setDockOpen(true); }} style={{
                flex: 1, padding: '6px 4px', cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
                borderRight: '1px solid rgba(122,95,42,0.35)',
                background: on ? 'linear-gradient(180deg, rgba(231,193,88,0.22), rgba(231,193,88,0.04))' : 'transparent',
                boxShadow: on ? 'inset 0 -2px 0 #e7c158' : 'none',
                color: on ? '#f7e3a4' : '#9a9182', fontSize: 11.5,
                fontFamily: "'Cinzel','Palatino Linotype',serif",
              }}><span style={{ color: on ? '#e7c158' : '#5e584c', fontSize: 8, marginRight: 4 }}>◆</span>{t.label}</button>
            );
          })}
          <button onClick={() => setDockOpen(o => !o)} title={dockOpen ? 'Zwiń' : 'Rozwiń'} style={{
            padding: '0 9px', border: 'none', background: 'none', cursor: 'pointer', color: '#9a9182', fontSize: 10,
          }}>{dockOpen ? '▼' : '▲'}</button>
        </div>
        {dockOpen && <>
          <div ref={listRef} style={{ height: 120, overflowY: 'auto', padding: '5px 10px', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {shown.length === 0 && <div style={{ color: '#5e584c', fontSize: 11.5, textAlign: 'center', marginTop: 12, fontStyle: 'italic' }}>{tab === 'system' ? 'Brak komunikatów' : 'Cisza…'}</div>}
            {shown.map((m, i) => {
              const k = kanalOf(m);
              const own = m.kto === playerName;
              return (
                <div key={i} style={{ fontSize: 12.5, lineHeight: 1.45, textShadow: '0 1px 2px #000' }}>
                  {k !== 'lokalny' && <span style={{ color: OV[k] }}>[{ETYKIETA[k]}] </span>}
                  <span style={{ color: own ? '#9be8ac' : k === 'system' ? OV.system : '#f0c060' }}>{m.kto}:</span>{' '}
                  <span style={{ color: k === 'system' ? '#d9c8f5' : '#e8e2d4' }}>{m.tresc}</span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          {tab !== 'system' && (
            <form onSubmit={send} style={{ display: 'flex', gap: 6, padding: '6px 8px', borderTop: '1px solid rgba(122,95,42,0.45)', flexShrink: 0 }}>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} maxLength={250}
                placeholder={tab === 'wszystkie' ? 'Napisz wiadomość… [Enter]' : PLACEHOLDER[tab]}
                style={{ flex: 1, minWidth: 0, background: 'rgba(0,0,0,0.55)', color: '#e8e2d4', border: '1px solid rgba(122,95,42,0.55)', borderRadius: 3, padding: '7px 10px', fontSize: 12.5, outline: 'none', fontFamily: 'inherit' }} />
              <button type="submit" style={{
                width: 38, borderRadius: 3, cursor: 'pointer', background: 'linear-gradient(180deg,#5a4520,#2d2210)',
                color: '#f7e3a4', border: '1px solid #e7c158', fontSize: 13,
              }}>➤</button>
            </form>
          )}
        </>}
      </div>
    );
  }

  // ── DOCKED MODE (desktop bottom panel) ───────────────────────────────────────
  if (mode === 'docked') {
    const shown = tab === 'wszystkie' ? messages : messages.filter(m => kanalOf(m) === tab);
    return (
      <div style={{
        height: dockOpen ? 150 : 30,
        flexShrink:0, overflow:'hidden',
        display:'flex', flexDirection:'column',
        background:'linear-gradient(180deg, #17130f 0%, #0d0b09 100%)',
        borderTop:'2px solid #7a5f2a',
        boxShadow:'inset 0 6px 16px rgba(0,0,0,0.6)',
        transition:'height 0.2s ease',
        fontFamily:"'Trebuchet MS', Verdana, sans-serif",
      }}>
        {/* Zakładki kanałów */}
        <div style={{ display:'flex', alignItems:'stretch', flexShrink:0, borderBottom:'1px solid rgba(122,95,42,0.5)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setDockOpen(true); }} style={{
              padding:'6px 12px', cursor:'pointer', border:'none',
              borderBottom: tab === t.id ? '2px solid #e7c158' : '2px solid transparent',
              background: tab === t.id ? 'rgba(231,193,88,0.1)' : 'transparent',
              color: tab === t.id ? '#f7e3a4' : '#8a8172',
              fontSize:11.5, fontFamily:"'Cinzel','Palatino Linotype',serif", letterSpacing:0.4,
            }}>{t.label}</button>
          ))}
          <button onClick={() => setDockOpen(o => !o)} title={dockOpen ? 'Zwiń' : 'Rozwiń'} style={{
            marginLeft:'auto', padding:'0 12px', border:'none', background:'none', cursor:'pointer', color:'#8a8172', fontSize:10,
          }}>{dockOpen ? '▼' : '▲'}</button>
        </div>

        {dockOpen && <>
          <div style={{ flex:1, overflowY:'auto', padding:'4px 12px', display:'flex', flexDirection:'column', gap:1 }}>
            {shown.length===0 && (
              <div style={{ color:'#5e584c', fontSize:11, textAlign:'center', marginTop:10, fontStyle:'italic' }}>
                {tab === 'system' ? 'Brak komunikatów' : 'Cisza…'}
              </div>
            )}
            {shown.map((m,i) => {
              const k = kanalOf(m);
              const own = m.kto === playerName;
              const kol = KOLOR[k];
              return (
                <div key={i} style={{ fontSize:12, lineHeight:1.45 }}>
                  {k !== 'lokalny' && <span style={{ color:kol, marginRight:4 }}>[{ETYKIETA[k]}]</span>}
                  <span style={{ color: own ? '#8fd67a' : (k === 'system' ? kol : '#f0c060'), fontWeight:'bold' }}>{m.kto}:</span>{' '}
                  <span style={{ color: k === 'system' ? '#d8b0a8' : '#d8d0bc' }}>{m.tresc}</span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {tab !== 'system' && (
            <form onSubmit={send} style={{ display:'flex', gap:6, padding:'5px 8px', borderTop:'1px solid rgba(122,95,42,0.35)', flexShrink:0 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e=>setInput(e.target.value)}
                placeholder={PLACEHOLDER[tab] || PLACEHOLDER.lokalny}
                maxLength={250}
                style={{
                  flex:1, background:'#0a0907', color:'#e8e2d4',
                  border:'1px solid rgba(122,95,42,0.6)', borderRadius:3, padding:'6px 10px',
                  fontSize:12, outline:'none', fontFamily:'inherit',
                }}
              />
              <button type="submit" style={{
                padding:'0 14px', borderRadius:3, cursor:'pointer',
                background:'linear-gradient(180deg,#2c2418,#171208)', color:'#e7c158',
                border:'1px solid #7a5f2a', fontSize:12, fontWeight:'bold',
              }}>➤</button>
            </form>
          )}
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
