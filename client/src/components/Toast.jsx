const COLORS = {
  success: { bg: 'rgba(6,78,59,0.5)',  border: 'rgba(34,197,94,0.4)',   color: '#4ADE80' },
  loot:    { bg: 'rgba(74,122,42,0.2)',border: 'rgba(232,192,48,0.45)', color: '#E8D070' },
  info:    { bg: 'rgba(15,32,64,0.7)', border: 'rgba(200,150,32,0.4)',  color: '#C8940A' },
  error:   { bg: 'rgba(60,10,10,0.6)', border: 'rgba(220,38,38,0.4)',   color: '#F87171' },
};

export default function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position:'fixed', top:16, left:'50%', transform:'translateX(-50%)', zIndex:999, display:'flex', flexDirection:'column', gap:6, pointerEvents:'none' }}>
      {toasts.map(t => {
        const c = COLORS[t.type] || COLORS.info;
        return (
          <div key={t.id} style={{
            padding:'7px 16px', borderRadius:8, fontSize:13, fontWeight:'bold',
            background: c.bg, border:`1px solid ${c.border}`, color: c.color,
            boxShadow:'0 4px 20px rgba(0,0,0,0.5)',
            animation:'slideDown 0.2s ease',
            whiteSpace:'nowrap',
          }}>
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}
