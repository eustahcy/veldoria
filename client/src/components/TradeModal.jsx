import { useState, useEffect, useCallback } from 'react';

const KLASA_COLOR = {
  unique:    '#DAA520',
  heroic:    '#2090FE',
  legendary: '#FA9A20',
  artefact:  '#f0032a',
  normal:    '#e8e2d4',
};

function ItemIcon({ item, onRemove, size = 40 }) {
  const color = KLASA_COLOR[item.klasa] || KLASA_COLOR.normal;
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      border: `1px solid ${color}55`,
      borderRadius: 3,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', cursor: onRemove ? 'pointer' : 'default',
      overflow: 'hidden',
    }}
    title={`${item.nazwa} (${item.klasa})`}
    >
      {item.obrazek ? (
        <img
          src={`/assets/${item.obrazek}`}
          alt={item.nazwa}
          style={{ width: size - 4, height: size - 4, imageRendering: 'pixelated', objectFit: 'contain' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      ) : (
        <span style={{ fontSize: 18 }}>📦</span>
      )}
      {onRemove && (
        <div onClick={onRemove} style={{
          position: 'absolute', top: 0, right: 0,
          width: 14, height: 14,
          background: 'rgba(180,30,30,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, color: '#fff', cursor: 'pointer', borderRadius: '0 2px 0 2px',
        }}>✕</div>
      )}
    </div>
  );
}

function ItemSlotGrid({ items, onRemove, max = 8 }) {
  const slots = Array.from({ length: max });
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, minHeight: 44 }}>
      {slots.map((_, i) => {
        const item = items[i];
        if (item) {
          return (
            <ItemIcon key={item.przedmiot_id || i} item={item} size={40}
              onRemove={onRemove ? () => onRemove(item.przedmiot_id) : undefined}
            />
          );
        }
        return (
          <div key={i} style={{
            width: 40, height: 40,
            border: '1px solid rgba(200,150,32,0.1)',
            borderRadius: 3, background: 'rgba(0,0,0,0.2)',
          }} />
        );
      })}
    </div>
  );
}

export default function TradeModal({ socket, postacId, myInventory = [], onClose }) {
  const [tradeData, setTradeData]   = useState(null); // { sessionId, gracz1, gracz2 }
  const [partner,   setPartner]     = useState(null); // { id, nazwa }
  const [goldInput, setGoldInput]   = useState('0');
  const [showInvPicker, setShowInvPicker] = useState(false);
  const [myConfirmed, setMyConfirmed] = useState(false);
  const [partnerConfirmed, setPartnerConfirmed] = useState(false);
  const [sessionId, setSessionId]   = useState(null);

  const isGracz1 = tradeData && tradeData.gracz1?.id === postacId;
  const myOffer  = tradeData ? (isGracz1 ? tradeData.gracz1 : tradeData.gracz2) : null;
  const hisOffer = tradeData ? (isGracz1 ? tradeData.gracz2 : tradeData.gracz1) : null;

  useEffect(() => {
    if (!socket) return;

    const onStarted = ({ sessionId: sid, partner: p }) => {
      setSessionId(sid);
      setPartner(p);
    };
    const onUpdated = (data) => {
      setTradeData(data);
      setMyConfirmed(data.gracz1?.id === postacId ? !!data.gracz1?.confirmed : !!data.gracz2?.confirmed);
      setPartnerConfirmed(data.gracz1?.id === postacId ? !!data.gracz2?.confirmed : !!data.gracz1?.confirmed);
    };
    const onConfirmed = ({ who }) => {
      // visual feedback only — trade_updated follows
    };

    socket.on('trade_started',   onStarted);
    socket.on('trade_updated',   onUpdated);
    socket.on('trade_confirmed', onConfirmed);

    return () => {
      socket.off('trade_started',   onStarted);
      socket.off('trade_updated',   onUpdated);
      socket.off('trade_confirmed', onConfirmed);
    };
  }, [socket, postacId]);

  const handleAddItem = useCallback((przedmiotId) => {
    if (!sessionId) return;
    socket?.emit('trade_add_item', { sessionId, przedmiotId });
    setShowInvPicker(false);
  }, [socket, sessionId]);

  const handleRemoveItem = useCallback((przedmiotId) => {
    if (!sessionId) return;
    socket?.emit('trade_remove_item', { sessionId, przedmiotId });
  }, [socket, sessionId]);

  const handleSetGold = useCallback(() => {
    if (!sessionId) return;
    socket?.emit('trade_set_gold', { sessionId, amount: parseInt(goldInput) || 0 });
  }, [socket, sessionId, goldInput]);

  const handleConfirm = useCallback(() => {
    if (!sessionId) return;
    if (myConfirmed) {
      socket?.emit('trade_unconfirm', { sessionId });
    } else {
      socket?.emit('trade_confirm', { sessionId });
    }
  }, [socket, sessionId, myConfirmed]);

  const handleCancel = useCallback(() => {
    if (sessionId) {
      socket?.emit('trade_cancel', { sessionId });
    }
    onClose();
  }, [socket, sessionId, onClose]);

  // Filter inventory to items not in trade and not equipped
  const tradedIds = new Set((myOffer?.items || []).map(i => i.przedmiot_id));
  const availableItems = myInventory.filter(i => !tradedIds.has(i.id) && !i.zalozony);

  const modalStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400,
    fontFamily: 'Verdana,sans-serif',
  };
  const boxStyle = {
    width: 560, maxWidth: '98vw',
    background: 'linear-gradient(160deg,rgba(22,18,13,0.99),rgba(14,12,9,0.99))',
    border: '1px solid rgba(200,150,32,0.3)', borderRadius: 10,
    boxShadow: '0 12px 60px rgba(0,0,0,0.9)',
    overflow: 'hidden',
  };
  const panelStyle = {
    flex: 1, padding: '10px', background: 'rgba(12,10,8,0.5)',
    border: '1px solid rgba(200,150,32,0.15)', borderRadius: 6,
  };
  const labelStyle = { fontSize: 9, color: '#9a9182', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 };
  const goldInputStyle = {
    width: 80, padding: '3px 6px', background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(200,150,32,0.3)', borderRadius: 3,
    color: '#f7e3a4', fontSize: 11, outline: 'none',
  };
  const btnStyle = (color, disabled) => ({
    padding: '6px 14px', background: disabled ? 'rgba(40,40,40,0.5)' : `${color}22`,
    color: disabled ? '#6b6456' : color, border: `1px solid ${disabled ? '#5e584c' : color+'44'}`,
    borderRadius: 4, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 10, fontWeight: 'bold',
  });

  return (
    <div style={modalStyle} onClick={e => e.target === e.currentTarget && handleCancel()}>
      <div style={boxStyle}>
        {/* Header */}
        <div style={{
          padding: '8px 14px', background: 'rgba(20,16,12,0.8)',
          borderBottom: '1px solid rgba(200,150,32,0.2)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>🤝</span>
          <span style={{ color: '#E8B84B', fontWeight: 'bold', fontSize: 12 }}>
            Handel z {partner?.nazwa || '...'}
          </span>
          <button onClick={handleCancel} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#9a9182', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        {/* Panels */}
        <div style={{ display: 'flex', gap: 8, padding: 10 }}>
          {/* My offer */}
          <div style={panelStyle}>
            <div style={labelStyle}>Twoja oferta</div>
            <ItemSlotGrid
              items={(myOffer?.items || [])}
              onRemove={handleRemoveItem}
              max={8}
            />
            {/* Gold row */}
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#e7c158', fontSize: 10 }}>💰</span>
              <input
                type="number" min="0"
                value={goldInput}
                onChange={e => setGoldInput(e.target.value)}
                onBlur={handleSetGold}
                onKeyDown={e => e.key === 'Enter' && handleSetGold()}
                style={goldInputStyle}
              />
              <span style={{ fontSize: 9, color: '#9a9182' }}>złota</span>
            </div>
            {/* Confirm indicator */}
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 14 }}>{myConfirmed ? '✅' : '⬜'}</span>
              <span style={{ fontSize: 9, color: myConfirmed ? '#4ADE80' : '#9a9182' }}>
                {myConfirmed ? 'Potwierdzono' : 'Nie potwierdzone'}
              </span>
            </div>
          </div>

          {/* Partner's offer */}
          <div style={panelStyle}>
            <div style={labelStyle}>Oferta {partner?.nazwa || 'partnera'}</div>
            <ItemSlotGrid
              items={(hisOffer?.items || [])}
              onRemove={null}
              max={8}
            />
            {/* Gold */}
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#e7c158', fontSize: 10 }}>💰</span>
              <span style={{ color: '#f7e3a4', fontSize: 11 }}>{hisOffer?.gold || 0}</span>
              <span style={{ fontSize: 9, color: '#9a9182' }}>złota</span>
            </div>
            {/* Confirm indicator */}
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 14 }}>{partnerConfirmed ? '✅' : '⬜'}</span>
              <span style={{ fontSize: 9, color: partnerConfirmed ? '#4ADE80' : '#9a9182' }}>
                {partnerConfirmed ? 'Potwierdził' : 'Czeka na potwierdzenie'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: '8px 10px', borderTop: '1px solid rgba(200,150,32,0.15)',
          display: 'flex', gap: 6, alignItems: 'center',
        }}>
          <button onClick={() => setShowInvPicker(v => !v)} style={btnStyle('#e7c158', false)}>
            + Dodaj przedmiot
          </button>
          <button onClick={handleConfirm} style={btnStyle(myConfirmed ? '#F59E0B' : '#4ADE80', false)}>
            {myConfirmed ? '↩ Cofnij' : '✓ Potwierdź'}
          </button>
          <button onClick={handleCancel} style={{ ...btnStyle('#F87171', false), marginLeft: 'auto' }}>
            Anuluj handel
          </button>
        </div>

        {/* Inventory picker */}
        {showInvPicker && (
          <div style={{
            padding: '8px 10px', borderTop: '1px solid rgba(200,150,32,0.1)',
            maxHeight: 160, overflowY: 'auto',
          }}>
            <div style={{ fontSize: 9, color: '#9a9182', marginBottom: 6 }}>Wybierz przedmiot z plecaka:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {availableItems.length === 0 && (
                <div style={{ color: '#6b6456', fontSize: 10 }}>Brak dostępnych przedmiotów</div>
              )}
              {availableItems.map(item => (
                <div key={item.id} onClick={() => handleAddItem(item.id)}
                  title={item.nazwa}
                  style={{
                    width: 40, height: 40, cursor: 'pointer',
                    border: `1px solid ${KLASA_COLOR[item.klasa] || '#e8e2d4'}55`,
                    borderRadius: 3, background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                  }}>
                  {item.obrazek ? (
                    <img src={`/assets/${item.obrazek}`} alt={item.nazwa}
                      style={{ width: 36, height: 36, imageRendering: 'pixelated', objectFit: 'contain' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : <span style={{ fontSize: 16 }}>📦</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
