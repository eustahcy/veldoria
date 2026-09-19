import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

// Modal shown when offline session is done — collect rewards
export function OfflineRewardModal({ session, onCollect }) {
  const [collecting, setCollecting] = useState(false);

  const handleCollect = useCallback(async () => {
    setCollecting(true);
    try {
      const res = await api.offline.collect();
      if (res.ok) {
        onCollect?.(res);
      }
    } catch (_) {}
    setCollecting(false);
  }, [onCollect]);

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 249 }} />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 250,
        width: 340,
        maxWidth: '90vw',
        background: 'linear-gradient(160deg, rgba(6,12,4,0.99), rgba(4,8,3,0.99))',
        border: '1px solid rgba(200,146,42,0.4)',
        borderRadius: 10,
        boxShadow: '0 8px 40px rgba(0,0,0,0.9), 0 0 20px rgba(100,180,60,0.1)',
        fontFamily: '"Palatino Linotype", Palatino, serif',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 16px 10px',
          background: 'linear-gradient(90deg, rgba(30,50,10,0.6), rgba(20,40,8,0.6))',
          borderBottom: '1px solid rgba(200,146,42,0.2)',
        }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>🌾</div>
          <div style={{ color: '#E8B84B', fontSize: 14, fontWeight: 'bold', letterSpacing: '1px' }}>
            Powrót do Przygody!
          </div>
          <div style={{ color: 'rgba(200,146,42,0.5)', fontSize: 9, letterSpacing: '2px', marginTop: 2 }}>
            WYNIKI AUTOFARMING
          </div>
        </div>

        {/* Results */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
            <div style={{
              background: 'rgba(10,20,6,0.6)',
              border: '1px solid rgba(100,180,60,0.3)',
              borderRadius: 6,
              padding: '10px 14px',
              minWidth: 70,
            }}>
              <div style={{ color: 'rgba(200,146,42,0.5)', fontSize: 8, marginBottom: 4 }}>EXP</div>
              <div style={{ color: '#6CB83A', fontSize: 16, fontWeight: 'bold' }}>
                +{Number(session?.wynik_exp || 0).toLocaleString()}
              </div>
            </div>
            <div style={{
              background: 'rgba(10,20,6,0.6)',
              border: '1px solid rgba(200,146,42,0.3)',
              borderRadius: 6,
              padding: '10px 14px',
              minWidth: 70,
            }}>
              <div style={{ color: 'rgba(200,146,42,0.5)', fontSize: 8, marginBottom: 4 }}>Złoto</div>
              <div style={{ color: '#E8B84B', fontSize: 16, fontWeight: 'bold' }}>
                +{Number(session?.wynik_gold || 0).toLocaleString()}
              </div>
            </div>
            <div style={{
              background: 'rgba(10,20,6,0.6)',
              border: '1px solid rgba(180,80,80,0.3)',
              borderRadius: 6,
              padding: '10px 14px',
              minWidth: 70,
            }}>
              <div style={{ color: 'rgba(200,146,42,0.5)', fontSize: 8, marginBottom: 4 }}>Zabójstwa</div>
              <div style={{ color: '#FF9999', fontSize: 16, fontWeight: 'bold' }}>
                {Number(session?.wynik_kills || 0).toLocaleString()}
              </div>
            </div>
          </div>

          <button
            onClick={handleCollect}
            disabled={collecting}
            style={{
              width: '100%',
              padding: '10px 0',
              background: collecting ? 'rgba(30,50,10,0.4)' : 'linear-gradient(135deg, rgba(74,122,42,0.7), rgba(50,90,25,0.7))',
              color: collecting ? 'rgba(100,180,60,0.4)' : '#4ADE80',
              border: '1px solid rgba(74,122,42,0.5)',
              borderRadius: 6,
              cursor: collecting ? 'not-allowed' : 'pointer',
              fontFamily: '"Palatino Linotype", Palatino, serif',
              fontSize: 12,
              fontWeight: 'bold',
              letterSpacing: '0.5px',
            }}
          >
            {collecting ? 'Odbieram...' : '✓ Odbierz nagrody'}
          </button>
        </div>
      </div>
    </>
  );
}

// Inline panel for CharPanel / sidebar use
export function OfflinePanel({ postacId, addToast, onCollected }) {
  const [status, setStatus] = useState(null);
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState('');
  const [selectedHours, setSelectedHours] = useState('1');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCollect, setShowCollect] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const s = await api.offline.status();
      setStatus(s);
      if (s?.remaining) setTimeLeft(s.remaining);
      if (s?.done && s.status === 'zakończony') setShowCollect(true);
    } catch (_) {}
  }, []);

  // Load available maps for selection
  const loadMaps = useCallback(async () => {
    try {
      const res = await fetch('/api/game/state', { credentials: 'include' });
      const data = await res.json();
      // Use current map as default option
      if (data?.mapa) {
        setMaps([{ id: data.mapa.id, nazwa: data.mapa.nazwa }]);
        setSelectedMap(String(data.mapa.id));
      }
    } catch (_) {}
  }, []);

  useEffect(() => { loadStatus(); loadMaps(); }, [loadStatus, loadMaps]);
  useEffect(() => {
    const id = setInterval(loadStatus, 15000);
    return () => clearInterval(id);
  }, [loadStatus]);

  useEffect(() => {
    if (!status || status.done) return;
    const id = setInterval(() => setTimeLeft(p => Math.max(0, p - 1000)), 1000);
    return () => clearInterval(id);
  }, [status]);

  const handleStart = useCallback(async () => {
    if (!selectedMap) return;
    setLoading(true);
    try {
      const res = await api.offline.start({ mapa_id: parseInt(selectedMap), godziny: parseFloat(selectedHours) });
      if (res.ok) {
        addToast?.(`Autofarming uruchomiony na ${selectedHours}h!`, 'success');
        await loadStatus();
      } else {
        addToast?.(res.error || 'Błąd startu', 'error');
      }
    } catch (_) {}
    setLoading(false);
  }, [selectedMap, selectedHours, addToast, loadStatus]);

  const handleCollect = useCallback(async (result) => {
    setShowCollect(false);
    setStatus(null);
    addToast?.(`Odebrano: +${result.exp} EXP, +${result.gold}g, ${result.kills} zabójstw`, 'success');
    onCollected?.();
  }, [addToast, onCollected]);

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const pct = status && status.remaining
    ? Math.round(100 - (status.remaining / (new Date(status.data_koniec) - new Date(status.data_start))) * 100)
    : 0;

  const containerStyle = {
    background: 'rgba(10,16,6,0.6)',
    border: '1px solid rgba(200,146,42,0.15)',
    borderRadius: 5,
    padding: '8px 10px',
    marginTop: 4,
    fontFamily: '"Palatino Linotype", Palatino, serif',
  };

  if (showCollect && status) {
    return (
      <>
        <div style={containerStyle}>
          <div style={{ color: '#6CB83A', fontSize: 9, letterSpacing: '1px', marginBottom: 4 }}>🌾 AUTOFARMING</div>
          <button
            onClick={() => setShowCollect(true)}
            style={{
              width: '100%', padding: '6px 0',
              background: 'rgba(74,122,42,0.4)', color: '#4ADE80',
              border: '1px solid rgba(74,122,42,0.5)', borderRadius: 4, cursor: 'pointer',
              fontFamily: '"Palatino Linotype", Palatino, serif', fontSize: 10, fontWeight: 'bold',
              animation: 'pulse 1.5s infinite',
            }}
          >
            🌾 Odbierz wyniki!
          </button>
        </div>
        {showCollect && (
          <OfflineRewardModal session={status} onCollect={handleCollect} />
        )}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
      </>
    );
  }

  if (status && status.status === 'aktywny' && !status.done) {
    const progressPct = Math.min(100, Math.max(0,
      status.data_start
        ? Math.round((1 - status.remaining / (new Date(status.data_koniec) - new Date(status.data_start))) * 100)
        : 0
    ));
    return (
      <div style={containerStyle}>
        <div style={{ color: 'rgba(200,146,42,0.6)', fontSize: 9, letterSpacing: '1px', marginBottom: 4 }}>🌾 AUTOFARMING AKTYWNY</div>
        <div style={{ height: 6, background: 'rgba(30,50,10,0.6)', borderRadius: 3, overflow: 'hidden', marginBottom: 4, border: '1px solid rgba(74,122,42,0.2)' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #2D6A1A, #4ADE80)', borderRadius: 3, transition: 'width 1s linear' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(200,146,42,0.5)', fontSize: 8 }}>Pozostało</span>
          <span style={{ color: '#E8B84B', fontSize: 9, fontWeight: 'bold' }}>{formatTime(timeLeft)}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ color: 'rgba(200,146,42,0.6)', fontSize: 9, letterSpacing: '1px', marginBottom: 6 }}>🌾 AUTOFARMING</div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        <select
          value={selectedHours}
          onChange={e => setSelectedHours(e.target.value)}
          style={{
            flex: 1, padding: '3px 4px', fontSize: 9,
            background: 'rgba(10,16,6,0.8)', color: '#CDD4AA',
            border: '1px solid rgba(200,146,42,0.2)', borderRadius: 3,
            fontFamily: '"Palatino Linotype", Palatino, serif',
          }}
        >
          <option value="0.5">30 min</option>
          <option value="1">1 godzina</option>
          <option value="1.5">1.5 godziny</option>
          <option value="2">2 godziny</option>
        </select>
        <button
          onClick={handleStart}
          disabled={loading || !selectedMap}
          style={{
            padding: '3px 8px',
            background: loading ? 'rgba(30,50,10,0.3)' : 'rgba(74,122,42,0.4)',
            color: loading ? 'rgba(74,122,42,0.4)' : '#4ADE80',
            border: '1px solid rgba(74,122,42,0.4)',
            borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: '"Palatino Linotype", Palatino, serif',
            fontSize: 9, fontWeight: 'bold',
          }}
        >
          {loading ? '...' : 'Start'}
        </button>
      </div>
      <div style={{ color: 'rgba(200,146,42,0.35)', fontSize: 8 }}>
        Farmuj na bieżącej mapie (maks. 2h)
      </div>
    </div>
  );
}

export default OfflineRewardModal;
