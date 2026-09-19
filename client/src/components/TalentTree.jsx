import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

function TalentCard({ talent, onInvest, canSpend }) {
  const isMaxed   = talent.myLevel >= talent.max_poziom;
  const isLocked  = !talent.available && talent.myLevel === 0;
  const isAvail   = talent.available && !isMaxed;

  let borderColor = '#333';
  let bgColor     = 'rgba(20,16,10,0.8)';
  let opacity     = 1;

  if (isMaxed)    { borderColor = '#e7c158'; bgColor = 'rgba(200,146,42,0.15)'; }
  else if (isAvail) { borderColor = 'rgba(200,146,42,0.7)'; bgColor = 'rgba(200,146,42,0.06)'; }
  else if (isLocked) { opacity = 0.4; }

  return (
    <div
      onClick={() => isAvail && canSpend && onInvest(talent.id)}
      title={`${talent.nazwa}\n${talent.opis}\nEfekt: +${talent.efekt_wartosc_per_lvl} ${talent.efekt_typ} na poziom\nMaks: ${talent.max_poziom} poziomów`}
      style={{
        width: 80, opacity,
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 4, padding: '6px 4px',
        textAlign: 'center', cursor: (isAvail && canSpend) ? 'pointer' : 'default',
        position: 'relative',
        transition: 'all 0.15s',
        boxShadow: isAvail && canSpend ? `0 0 8px ${borderColor}50` : 'none',
      }}
    >
      <div style={{ fontSize: 18, lineHeight: 1, marginBottom: 3 }}>{talent.ikona || '⭐'}</div>
      <div style={{ fontSize: 7, color: '#e8e2d4', lineHeight: 1.3, marginBottom: 2 }}>{talent.nazwa}</div>
      <div style={{ fontSize: 7, color: isMaxed ? '#e7c158' : '#6B5530' }}>
        {talent.myLevel}/{talent.max_poziom}
      </div>
      {isAvail && canSpend && (
        <div style={{
          position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)',
          background: '#e7c158', color: '#000', fontSize: 8, fontWeight: 'bold',
          borderRadius: 3, padding: '1px 5px',
        }}>+</div>
      )}
    </div>
  );
}

export default function TalentTree({ postac, onClose }) {
  const [data, setData]     = useState(null);
  const [loading, setLoad]  = useState(true);
  const [msg, setMsg]       = useState(null);
  const [resetting, setRes] = useState(false);

  const load = useCallback(async () => {
    setLoad(true);
    const r = await api.talents.tree();
    if (r && r.paths) setData(r);
    setLoad(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleInvest = async (talentId) => {
    const r = await api.talents.invest(talentId);
    if (r.ok) { showMsg(r.msg || 'Punkt zainwestowany!', true); load(); }
    else showMsg(r.error || 'Błąd', false);
  };

  const handleReset = async () => {
    if (!resetting) { setRes(true); return; }
    const r = await api.talents.reset();
    setRes(false);
    if (r.ok) { showMsg(r.msg, true); load(); }
    else showMsg(r.error || 'Błąd resetu', false);
  };

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 200, fontFamily: 'Verdana,sans-serif',
  };
  const panel = {
    maxWidth: 600, width: '96vw', maxHeight: '85vh',
    background: 'linear-gradient(160deg,rgba(20,16,12,0.99),rgba(12,10,8,0.99))',
    border: '1px solid rgba(200,146,42,0.35)', borderRadius: 6,
    boxShadow: '0 8px 50px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column',
  };

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={panel}>
        {/* Header */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(200,146,42,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ color: '#E8B84B', fontSize: 13, fontWeight: 'bold', fontFamily: '"Palatino Linotype",Palatino,serif', letterSpacing: '1px' }}>
              ⭐ Drzewko Talentów
            </span>
            {data && (
              <span style={{ color: '#6B5530', fontSize: 9, marginLeft: 10 }}>{data.klasa}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {data && (
              <span style={{ color: data.punkty_dostepne > 0 ? '#E8B84B' : '#6B5530', fontSize: 11, fontWeight: 'bold' }}>
                Dostępne punkty: <span style={{ fontSize: 14 }}>{data.punkty_dostepne}</span>
              </span>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B5530', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div style={{ padding: '5px 14px', fontSize: 10, color: msg.ok ? '#4ADE80' : '#F87171', background: msg.ok ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.07)' }}>
            {msg.text}
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
          {loading && <div style={{ color: '#6B5530', textAlign: 'center', padding: 20 }}>Ładowanie...</div>}

          {!loading && !data && (
            <div style={{ color: '#4A3828', textAlign: 'center', padding: 20, fontSize: 11 }}>
              Brak drzewka talentów dla twojej klasy. Skontaktuj się z administratorem.
            </div>
          )}

          {!loading && data && (
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {data.paths.map((path) => (
                <div key={path.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  {/* Path header */}
                  <div style={{
                    color: '#e7c158', fontSize: 8, fontWeight: 'bold', letterSpacing: '1.5px',
                    textTransform: 'uppercase', marginBottom: 6, textAlign: 'center',
                  }}>{path.name}</div>

                  {/* Talents connected by lines */}
                  {path.talents.map((t, idx) => (
                    <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <TalentCard
                        talent={t}
                        onInvest={handleInvest}
                        canSpend={data.punkty_dostepne > 0}
                      />
                      {idx < path.talents.length - 1 && (
                        <div style={{
                          width: 2, height: 14,
                          background: t.myLevel > 0 ? 'rgba(200,146,42,0.5)' : 'rgba(80,60,20,0.3)',
                        }} />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(200,146,42,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#4A3828', fontSize: 8 }}>
            Kliknij dostępny talent, aby zainwestować punkt. Punkty za każdy poziom.
          </div>
          <button onClick={handleReset} style={{
            padding: '4px 12px', fontSize: 9, cursor: 'pointer',
            background: resetting ? 'rgba(248,113,113,0.2)' : 'rgba(50,30,10,0.4)',
            color: resetting ? '#F87171' : '#6B5530',
            border: `1px solid ${resetting ? 'rgba(248,113,113,0.5)' : 'rgba(80,50,20,0.3)'}`,
            borderRadius: 3, fontFamily: 'Verdana,sans-serif',
          }}>
            {resetting ? '⚠ Potwierdź reset (500g+)' : 'Reset talentów'}
          </button>
        </div>
      </div>
    </div>
  );
}
