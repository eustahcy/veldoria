import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';
import WorldBossBattleModal from './WorldBossBattleModal';

export default function WorldBossUI({ boss, postac, socket, onBossUpdate, onBossDied, addToast }) {
  const [localBoss,       setLocalBoss]       = useState(boss);
  const [showBattle,      setShowBattle]       = useState(false);
  const [showLeaderboard, setShowLeaderboard]  = useState(false);
  const [leaderboard,     setLeaderboard]      = useState([]);
  const [timeLeft,        setTimeLeft]         = useState('');

  useEffect(() => { setLocalBoss(boss); }, [boss]);

  // Real-time HP update via socket
  useEffect(() => {
    if (!socket) return;
    const onHp = ({ boss_id, zycie, zycie_max }) => {
      if (boss_id === localBoss?.id) {
        setLocalBoss(prev => prev ? { ...prev, zycie, zycie_max, hpPct: Math.round((zycie / zycie_max) * 100) } : prev);
      }
    };
    const onAbility = ({ boss_id, typ }) => {
      if (boss_id === localBoss?.id) {
        setLocalBoss(prev => {
          if (!prev) return prev;
          let zdolnosci = [];
          try { zdolnosci = JSON.parse(prev.zdolnosci_specjalne) || []; } catch {}
          const updated = zdolnosci.map(z => z.typ === typ ? { ...z, wyzwolona: 1 } : z);
          return { ...prev, zdolnosci_specjalne: JSON.stringify(updated), zdolnosci: updated };
        });
      }
    };
    socket.on('world_boss_hp_update', onHp);
    socket.on('world_boss_ability',   onAbility);
    return () => {
      socket.off('world_boss_hp_update', onHp);
      socket.off('world_boss_ability',   onAbility);
    };
  }, [socket, localBoss?.id]);

  // Timer ucieczki bossa
  useEffect(() => {
    if (!localBoss?.data_ucieczki) return;
    const tick = () => {
      const diff = Math.max(0, new Date(localBoss.data_ucieczki) - Date.now());
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
      if (diff === 0) { onBossDied?.(); }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [localBoss?.data_ucieczki]);

  const loadLeaderboard = useCallback(async () => {
    if (!localBoss) return;
    const rows = await api.worldboss.ranking(localBoss.id);
    setLeaderboard(rows || []);
  }, [localBoss]);

  const toggleLeaderboard = useCallback(() => {
    const next = !showLeaderboard;
    setShowLeaderboard(next);
    if (next) loadLeaderboard();
  }, [showLeaderboard, loadLeaderboard]);

  if (!localBoss) return null;

  const hpPct   = localBoss.hpPct ?? Math.round((localBoss.zycie / localBoss.zycie_max) * 100);
  const hpColor = hpPct > 50 ? '#E53E3E' : hpPct > 25 ? '#DD6B20' : '#C53030';

  // Aktywne zdolności
  const zdolnosci = localBoss.zdolnosci || (() => {
    try { return JSON.parse(localBoss.zdolnosci_specjalne) || []; } catch { return []; }
  })();
  const isShield = localBoss.aktywna_tarcza;
  const isRegen  = zdolnosci.some(z => z.typ === 'regeneracja' && z.wyzwolona);
  const isSluzy  = zdolnosci.some(z => z.typ === 'sluzy' && z.wyzwolona);
  const isTimerLow = timeLeft && (timeLeft.startsWith('0:') || timeLeft.startsWith('1:') || timeLeft.startsWith('2:') || timeLeft.startsWith('3:') || timeLeft.startsWith('4:'));

  return (
    <>
      <div style={{
        position: 'fixed', top: 80, right: 16, zIndex: 150, width: 226,
        background: 'linear-gradient(160deg,rgba(42,10,8,0.97),rgba(22,5,3,0.97))',
        border: '1px solid rgba(200,50,50,0.38)',
        borderRadius: 6,
        boxShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 12px rgba(180,30,30,0.12)',
        fontFamily: '"Palatino Linotype",Palatino,serif',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '5px 10px',
          background: 'linear-gradient(90deg,rgba(120,20,20,0.55),rgba(60,10,10,0.4))',
          borderBottom: '1px solid rgba(200,50,50,0.25)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 12 }}>💀</span>
          <span style={{ color: '#E8B84B', fontSize: 10, fontWeight: 'bold', letterSpacing: '0.5px', flex: 1 }}>WORLD BOSS</span>
          <span style={{ color: '#FF4444', fontSize: 8, fontWeight: 'bold' }}>AKTYWNY</span>
        </div>

        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Boss name */}
          <div style={{ color: '#FF6B6B', fontSize: 11, fontWeight: 'bold', textAlign: 'center' }}>
            {localBoss.nazwa}
            {localBoss.poziom ? <span style={{ color: 'rgba(200,100,100,0.5)', fontWeight: 'normal', fontSize: 9 }}> poz.{localBoss.poziom}</span> : null}
          </div>

          {/* HP bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ color: 'rgba(200,100,100,0.7)', fontSize: 8 }}>HP</span>
              <span style={{ color: '#E8B84B', fontSize: 8 }}>{hpPct}%</span>
            </div>
            <div style={{ height: 8, background: 'rgba(60,10,10,0.8)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(150,30,30,0.3)' }}>
              <div style={{ height: '100%', width: `${hpPct}%`, background: `linear-gradient(90deg,${hpColor},${hpColor}88)`, borderRadius: 4, transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ color: 'rgba(200,100,100,0.45)', fontSize: 7, marginTop: 2, textAlign: 'right' }}>
              {Number(localBoss.zycie).toLocaleString()} / {Number(localBoss.zycie_max).toLocaleString()}
            </div>
          </div>

          {/* Timer + zdolności */}
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            {timeLeft && (
              <span style={{ fontSize: 8, padding: '1px 6px', borderRadius: 8, fontWeight: 'bold',
                background: isTimerLow ? 'rgba(239,68,68,0.12)' : 'rgba(200,150,32,0.08)',
                border: `1px solid ${isTimerLow ? 'rgba(239,68,68,0.35)' : 'rgba(200,150,32,0.2)'}`,
                color: isTimerLow ? '#F87171' : '#C8940A',
              }}>⏱ {timeLeft}</span>
            )}
            {isShield && <span style={{ fontSize: 7, padding: '1px 5px', borderRadius: 8, background: 'rgba(165,180,252,0.12)', border: '1px solid rgba(165,180,252,0.35)', color: '#A5B4FC' }}>◈ Tarcza</span>}
            {isRegen  && <span style={{ fontSize: 7, padding: '1px 5px', borderRadius: 8, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ADE80' }}>↑ Regen</span>}
            {isSluzy  && <span style={{ fontSize: 7, padding: '1px 5px', borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', color: '#F87171' }}>☠ Sługi</span>}
          </div>

          {/* Moje obrażenia + rank */}
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, background: 'rgba(30,10,10,0.5)', border: '1px solid rgba(150,30,30,0.18)', borderRadius: 3, padding: '4px 6px' }}>
              <div style={{ color: 'rgba(200,100,100,0.55)', fontSize: 7 }}>Moje obrażenia</div>
              <div style={{ color: '#E8B84B', fontSize: 10, fontWeight: 'bold' }}>{Number(localBoss.myDmg || 0).toLocaleString()}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(30,10,10,0.5)', border: '1px solid rgba(150,30,30,0.18)', borderRadius: 3, padding: '4px 6px' }}>
              <div style={{ color: 'rgba(200,100,100,0.55)', fontSize: 7 }}>Miejsce</div>
              <div style={{ color: '#E8B84B', fontSize: 10, fontWeight: 'bold' }}>#{localBoss.myRank || '?'}</div>
            </div>
          </div>

          {/* Przycisk walki turowej */}
          <button
            onClick={() => setShowBattle(true)}
            style={{
              padding: '7px 0',
              background: 'linear-gradient(135deg,rgba(150,20,20,0.8),rgba(100,10,10,0.8))',
              color: '#FF6B6B',
              border: '1px solid rgba(200,50,50,0.5)',
              borderRadius: 4, cursor: 'pointer',
              fontFamily: '"Palatino Linotype",Palatino,serif',
              fontSize: 11, fontWeight: 'bold', letterSpacing: '0.5px',
              boxShadow: '0 0 12px rgba(200,30,30,0.2)',
            }}
          >
            ⚔ Walcz z bossem
          </button>

          {/* Ranking toggle */}
          <button onClick={toggleLeaderboard} style={{
            padding: '3px 0', background: 'transparent', cursor: 'pointer',
            color: 'rgba(200,100,100,0.55)', border: '1px solid rgba(150,30,30,0.18)',
            borderRadius: 3, fontFamily: '"Palatino Linotype",Palatino,serif', fontSize: 9,
          }}>
            {showLeaderboard ? '▲ Ukryj ranking' : '📊 Top 10'}
          </button>

          {showLeaderboard && (
            <div style={{ maxHeight: 130, overflowY: 'auto' }}>
              {leaderboard.length === 0
                ? <div style={{ color: 'rgba(200,100,100,0.35)', fontSize: 9, textAlign: 'center', padding: '4px 0' }}>Brak danych</div>
                : leaderboard.map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0', borderBottom: '1px solid rgba(150,30,30,0.1)' }}>
                    <span style={{ color: i < 3 ? '#E8B84B' : 'rgba(200,100,100,0.4)', fontSize: 8, width: 16, textAlign: 'right', flexShrink: 0 }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <span style={{ color: '#CDD4AA', fontSize: 9, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.postac_nazwa}</span>
                    {row.gildia_nazwa && <span style={{ color: 'rgba(200,150,32,0.45)', fontSize: 7, flexShrink: 0 }}>[{row.gildia_nazwa.slice(0,8)}]</span>}
                    <span style={{ color: '#E8B84B', fontSize: 8, flexShrink: 0 }}>{Number(row.obrazenia_zadane).toLocaleString()}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Modalna walka turowa */}
      {showBattle && postac && (
        <WorldBossBattleModal
          boss={localBoss}
          postac={postac}
          socket={socket}
          onClose={() => {
            setShowBattle(false);
            onBossUpdate?.();
          }}
          onBossUpdate={() => {
            onBossUpdate?.();
            setShowBattle(false);
            onBossDied?.();
          }}
        />
      )}
    </>
  );
}
