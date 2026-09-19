import { useState, useEffect } from 'react';
import Login from './components/Login';
import Game from './components/Game';
import ErrorBoundary from './components/ErrorBoundary';
import { api } from './api';

// Simple reconnect screen shown when user disconnects without logging out
function ReconnectScreen({ onReconnect, onLogout }) {
  const [checking, setChecking] = useState(false);

  const tryReconnect = async () => {
    setChecking(true);
    try {
      const data = await api.game.state();
      if (!data.error) { onReconnect(); return; }
    } catch (_) {}
    // Session gone — fall back to login
    onLogout();
  };

  return (
    <div style={{
      background:'#2A1A08', height:'100vh',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      gap:16, fontFamily:'Verdana,sans-serif',
    }}>
      <div style={{ color:'#3B82F6', fontSize:14, fontWeight:'bold', letterSpacing:1 }}>Rozłączono</div>
      <div style={{ color:'#2E5A7A', fontSize:11 }}>Sesja jest zachowana</div>
      <div style={{ display:'flex', gap:10 }}>
        <button
          onClick={tryReconnect}
          disabled={checking}
          style={{
            padding:'10px 20px',
            background: checking ? 'rgba(15,32,64,0.4)' : 'rgba(29,78,216,0.3)',
            color: checking ? '#2E5A7A' : '#93C5FD',
            border:'1px solid rgba(59,130,246,0.4)',
            borderRadius:6, cursor: checking ? 'not-allowed' : 'pointer',
            fontSize:12, fontWeight:'bold',
          }}
        >
          {checking ? 'Łączenie...' : 'Wróć do gry'}
        </button>
        <button
          onClick={onLogout}
          style={{
            padding:'10px 20px',
            background:'rgba(20,4,4,0.6)',
            color:'#F87171',
            border:'1px solid rgba(180,30,30,0.3)',
            borderRadius:6, cursor:'pointer',
            fontSize:12,
          }}
        >
          Wyloguj się
        </button>
      </div>
    </div>
  );
}

export default function App() {
  // null = checking, true = in game, false = logged out, 'disconnected' = reconnect screen
  const [loggedIn, setLoggedIn] = useState(null);

  useEffect(() => {
    api.game.state()
      .then(data => setLoggedIn(!data.error))
      .catch(() => setLoggedIn(false));
  }, []);

  if (loggedIn === null) return (
    <div style={{ background:'#2A1A08', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#2E5A7A', fontFamily:'Verdana,sans-serif', fontSize:12 }}>
      Łączenie z serwerem...
    </div>
  );

  if (loggedIn === 'disconnected') return (
    <ErrorBoundary>
      <ReconnectScreen
        onReconnect={() => setLoggedIn(true)}
        onLogout={async () => { await api.auth.logout().catch(()=>{}); setLoggedIn(false); }}
      />
    </ErrorBoundary>
  );

  return (
    <ErrorBoundary>
      {loggedIn
        ? <Game
            onLogout={async () => { await api.auth.logout().catch(()=>{}); setLoggedIn(false); }}
            onDisconnect={() => setLoggedIn('disconnected')}
          />
        : <Login onLogin={() => setLoggedIn(true)} />
      }
    </ErrorBoundary>
  );
}
