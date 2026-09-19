import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export default function DungeonFinder({ onClose, addToast, onTeleport }) {
  const [templates, setTemplates] = useState([]);
  const [activeSesja, setActiveSesja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [tmpl, active] = await Promise.all([
        api.dungeons.list(),
        api.dungeons.active(),
      ]);
      setTemplates(tmpl || []);
      setActiveSesja(active || null);
      if (active?.data_koniec) {
        setTimeLeft(Math.max(0, new Date(active.data_koniec) - Date.now()));
      }
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Countdown timer
  useEffect(() => {
    if (!activeSesja) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        const next = Math.max(0, prev - 1000);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [activeSesja]);

  const handleCreate = useCallback(async (szablon_id) => {
    setCreating(szablon_id);
    try {
      const res = await api.dungeons.create({ szablon_id });
      if (res.ok) {
        addToast?.('Dungeon stworzony! Teleportujesz się...', 'success');
        await loadData();
        onTeleport?.();
      } else {
        addToast?.(res.error || 'Błąd tworzenia dungeona', 'error');
      }
    } catch (_) {
      addToast?.('Błąd połączenia', 'error');
    }
    setCreating(null);
  }, [addToast, loadData, onTeleport]);

  const handleLeave = useCallback(async () => {
    try {
      await api.dungeons.leave();
      addToast?.('Opuściłeś dungeona', 'info');
      await loadData();
      onTeleport?.();
    } catch (_) {}
  }, [addToast, loadData, onTeleport]);

  const handleComplete = useCallback(async () => {
    if (!activeSesja) return;
    try {
      const res = await api.dungeons.complete(activeSesja.id);
      if (res.ok) {
        addToast?.(`Dungeon ukończony! +${res.expReward} EXP, +${res.goldReward}g`, 'success');
        await loadData();
        onTeleport?.();
      } else {
        addToast?.(res.error || 'Nie można ukończyć', 'error');
      }
    } catch (_) {}
  }, [activeSesja, addToast, loadData, onTeleport]);

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const panelStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    zIndex: 200,
    width: 400,
    maxWidth: '95vw',
    maxHeight: '80vh',
    overflowY: 'auto',
    background: 'linear-gradient(160deg, rgba(6,10,4,0.99), rgba(4,7,3,0.99))',
    border: '1px solid rgba(200,146,42,0.3)',
    borderRadius: 8,
    boxShadow: '0 8px 40px rgba(0,0,0,0.9)',
    fontFamily: '"Palatino Linotype", Palatino, serif',
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 199 }} onClick={onClose} />
      <div style={panelStyle}>
        {/* Header */}
        <div style={{
          padding: '10px 14px',
          background: 'linear-gradient(90deg, rgba(30,20,5,0.8), rgba(20,14,4,0.8))',
          borderBottom: '1px solid rgba(200,146,42,0.2)',
          display: 'flex',
          alignItems: 'center',
        }}>
          <span style={{ color: '#E8B84B', fontSize: 13, fontWeight: 'bold', letterSpacing: '1px', flex: 1 }}>
            ⚔ Dungeony Instancyjne
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(200,146,42,0.5)', cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>

        <div style={{ padding: 14 }}>
          {loading && (
            <div style={{ color: 'rgba(200,146,42,0.5)', fontSize: 11, textAlign: 'center', padding: 20 }}>Ładowanie...</div>
          )}

          {/* Active session */}
          {!loading && activeSesja && (
            <div style={{
              background: 'rgba(20,40,10,0.5)',
              border: '1px solid rgba(74,122,42,0.4)',
              borderRadius: 6,
              padding: '10px 12px',
              marginBottom: 12,
            }}>
              <div style={{ color: '#6CB83A', fontSize: 10, letterSpacing: '1px', marginBottom: 6 }}>
                ✦ AKTYWNA SESJA
              </div>
              <div style={{ color: '#E8B84B', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
                {activeSesja.tmpl_nazwa}
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                <div>
                  <span style={{ color: 'rgba(200,146,42,0.5)', fontSize: 8 }}>Gracze: </span>
                  <span style={{ color: '#CDD4AA', fontSize: 9 }}>{activeSesja.playerCount}</span>
                </div>
                <div>
                  <span style={{ color: 'rgba(200,146,42,0.5)', fontSize: 8 }}>Moby: </span>
                  <span style={{ color: '#CDD4AA', fontSize: 9 }}>{activeSesja.mobsAlive}</span>
                </div>
                <div>
                  <span style={{ color: 'rgba(200,146,42,0.5)', fontSize: 8 }}>Czas: </span>
                  <span style={{ color: timeLeft < 60000 ? '#FF6B6B' : '#CDD4AA', fontSize: 9, fontWeight: 'bold' }}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={handleComplete} style={{
                  flex: 1, padding: '5px 0', background: 'rgba(74,122,42,0.3)', color: '#4ADE80',
                  border: '1px solid rgba(74,122,42,0.5)', borderRadius: 4, cursor: 'pointer',
                  fontFamily: '"Palatino Linotype", Palatino, serif', fontSize: 10, fontWeight: 'bold',
                }}>
                  ✓ Ukończ (+EXP/Gold)
                </button>
                <button onClick={handleLeave} style={{
                  padding: '5px 10px', background: 'rgba(120,30,30,0.3)', color: '#F87171',
                  border: '1px solid rgba(180,30,30,0.4)', borderRadius: 4, cursor: 'pointer',
                  fontFamily: '"Palatino Linotype", Palatino, serif', fontSize: 10,
                }}>
                  Opuść
                </button>
              </div>
            </div>
          )}

          {/* Template list */}
          {!loading && !activeSesja && (
            <div>
              <div style={{ color: 'rgba(200,146,42,0.6)', fontSize: 9, letterSpacing: '1.5px', marginBottom: 8, textTransform: 'uppercase' }}>
                Dostępne dungeony
              </div>
              {templates.map(tmpl => (
                <div key={tmpl.id} style={{
                  background: 'rgba(16,12,5,0.6)',
                  border: '1px solid rgba(200,146,42,0.15)',
                  borderRadius: 6,
                  padding: '10px 12px',
                  marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#E8B84B', fontSize: 11, fontWeight: 'bold' }}>{tmpl.nazwa}</div>
                      <div style={{ color: 'rgba(200,146,42,0.5)', fontSize: 9, marginTop: 2 }}>{tmpl.opis}</div>
                    </div>
                    <button
                      onClick={() => handleCreate(tmpl.id)}
                      disabled={creating === tmpl.id}
                      style={{
                        padding: '5px 10px',
                        background: creating === tmpl.id ? 'rgba(30,20,5,0.5)' : 'rgba(60,40,10,0.6)',
                        color: creating === tmpl.id ? 'rgba(200,146,42,0.3)' : '#E8B84B',
                        border: '1px solid rgba(200,146,42,0.3)',
                        borderRadius: 4,
                        cursor: creating === tmpl.id ? 'not-allowed' : 'pointer',
                        fontFamily: '"Palatino Linotype", Palatino, serif',
                        fontSize: 10,
                        fontWeight: 'bold',
                        flexShrink: 0,
                      }}
                    >
                      {creating === tmpl.id ? '...' : 'Stwórz'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ color: 'rgba(200,146,42,0.5)', fontSize: 8 }}>
                      Poz. min: <span style={{ color: '#CDD4AA' }}>{tmpl.min_poziom}</span>
                    </span>
                    <span style={{ color: 'rgba(200,146,42,0.5)', fontSize: 8 }}>
                      Gracze: <span style={{ color: '#CDD4AA' }}>{tmpl.min_graczy}-{tmpl.max_graczy}</span>
                    </span>
                    <span style={{ color: 'rgba(200,146,42,0.5)', fontSize: 8 }}>
                      Czas: <span style={{ color: '#CDD4AA' }}>{tmpl.czas_limit_min} min</span>
                    </span>
                    <span style={{ color: 'rgba(200,146,42,0.5)', fontSize: 8 }}>
                      Nagroda: <span style={{ color: '#6CB83A' }}>+{tmpl.nagroda_exp_base} EXP</span>
                      {' '}/ <span style={{ color: '#E8B84B' }}>+{tmpl.nagroda_gold_base}g</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && templates.length === 0 && !activeSesja && (
            <div style={{ color: 'rgba(200,146,42,0.4)', fontSize: 11, textAlign: 'center', padding: '20px 0' }}>
              Brak dostępnych dungeonów
            </div>
          )}
        </div>
      </div>
    </>
  );
}
