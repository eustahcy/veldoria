// Wspólne elementy okien: ramka z nagłówkiem, slot na przedmiot, karta przedmiotu, pasek.
import { C, rarityOf, typeLabel, itemStats, headline, fmtNum } from './kit';

// ── Okno z ozdobną ramką ─────────────────────────────────────────────────────
export function Frame({ title, icon, onClose, right, children, width = 880, narrow, style }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: narrow ? 'stretch' : 'center', justifyContent: 'center',
      padding: narrow ? 0 : 16, fontFamily: C.font,
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width, maxWidth: '100%', maxHeight: narrow ? '100%' : '92vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: C.bgPanel,
          border: `2px solid ${C.bronze}`,
          borderRadius: narrow ? 0 : 10,
          boxShadow: '0 24px 70px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(0,0,0,0.6)',
          ...style,
        }}
      >
        <header style={{
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          padding: '10px 12px', background: C.bgHeader,
          borderBottom: `2px solid ${C.bronze}`,
        }}>
          {icon && <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>}
          <h2 style={{ margin: 0, fontSize: 15, color: C.gold, letterSpacing: 0.5, textShadow: '0 1px 0 #000' }}>{title}</h2>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {right}
            {onClose && (
              <button onClick={onClose} aria-label="Zamknij" style={{
                width: 28, height: 28, display: 'grid', placeItems: 'center',
                background: C.bgSlot, color: C.textMuted, cursor: 'pointer',
                border: `1px solid ${C.line}`, borderRadius: 6, fontSize: 15, lineHeight: 1,
              }}>✕</button>
            )}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

// ── Ikona przedmiotu ─────────────────────────────────────────────────────────
export function ItemIcon({ item, size = 34 }) {
  if (!item) return null;
  return (
    <div style={{
      width: size, height: size,
      backgroundImage: `url(/assets/${item.obrazek})`,
      backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'contain',
      imageRendering: 'pixelated', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.6))',
    }} />
  );
}

// ── Slot ─────────────────────────────────────────────────────────────────────
export function Slot({
  item, size = 54, selected, equipped, label, count, locked,
  onClick, onHover, onLeave, style,
}) {
  const r = item ? rarityOf(item) : null;
  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover} onMouseLeave={onLeave}
      title={item ? item.nazwa : label || ''}
      style={{
        width: size, height: size, position: 'relative', flexShrink: 0,
        background: item ? `radial-gradient(ellipse at 50% 0%, ${r.color}1c, ${C.bgSlot} 70%)` : C.bgSlot,
        border: `1px solid ${selected ? C.gold : item ? r.color + '80' : C.line}`,
        borderRadius: 6,
        boxShadow: selected
          ? `0 0 0 1px ${C.gold}, 0 0 12px ${C.gold}55`
          : 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -2px 6px rgba(0,0,0,0.6)',
        display: 'grid', placeItems: 'center',
        cursor: item || onClick ? 'pointer' : 'default',
        opacity: locked ? 0.45 : 1,
        transition: 'border-color .12s, box-shadow .12s',
        ...style,
      }}
    >
      {item ? <ItemIcon item={item} size={size - 18} /> : label ? (
        <span style={{ fontSize: 8, color: C.textDim, textAlign: 'center', padding: 2, lineHeight: 1.2 }}>{label}</span>
      ) : null}

      {count > 1 && (
        <span style={{
          position: 'absolute', left: 3, top: 2, fontSize: 9, fontWeight: 'bold',
          color: C.text, textShadow: '0 1px 2px #000',
        }}>{count}</span>
      )}
      {equipped && (
        <span style={{
          position: 'absolute', right: 2, bottom: 1, fontSize: 11, color: C.ok,
          textShadow: '0 1px 2px #000', lineHeight: 1,
        }}>✓</span>
      )}
      {item?.wym_poziom > 0 && (
        <span style={{
          position: 'absolute', right: 3, top: 2, fontSize: 8, fontWeight: 'bold',
          color: C.goldDim, textShadow: '0 1px 2px #000',
        }}>{item.wym_poziom}</span>
      )}
    </div>
  );
}

// ── Karta przedmiotu (dymek / panel szczegółów) ──────────────────────────────
export function ItemCard({ item, compare, postac, actions, style }) {
  if (!item) return null;
  const r = rarityOf(item);
  const stats = itemStats(item);
  const head = headline(item);
  const cmpStats = compare ? itemStats(compare) : [];
  const meetsLvl = !item.wym_poziom || (postac?.poziom ?? 99) >= item.wym_poziom;
  const profReq = ['Wojownik', 'Paladyn', 'Tancerz Ostrzy', 'Lowca', 'Tropiciel', 'Mag']
    .filter((_, i) => Number(item[`prof${i + 1}`]) === 1);
  const meetsProf = !profReq.length || profReq.includes(postac?.profesja);

  return (
    <div style={{
      width: '100%', background: C.bg, border: `2px solid ${r.color}`, borderRadius: 8,
      boxShadow: `0 10px 30px rgba(0,0,0,0.7), inset 0 0 22px ${r.color}14`,
      overflow: 'hidden', fontFamily: C.font, ...style,
    }}>
      {/* Nagłówek */}
      <div style={{ display: 'flex', gap: 10, padding: 10, background: `linear-gradient(180deg, ${r.color}1f, transparent)` }}>
        <div style={{
          width: 48, height: 48, flexShrink: 0, display: 'grid', placeItems: 'center',
          background: C.bgSlot, border: `1px solid ${r.color}88`, borderRadius: 6,
        }}>
          <ItemIcon item={item} size={34} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: r.color, fontWeight: 'bold', fontSize: 15, lineHeight: 1.2 }}>{item.nazwa}</div>
          <div style={{ color: C.textMuted, fontSize: 11 }}>{r.label} · {typeLabel(item.typ)}</div>
          {item.wym_poziom > 0 && (
            <div style={{ fontSize: 11, color: meetsLvl ? C.textMuted : C.bad }}>
              Wymagany poziom: {item.wym_poziom}
            </div>
          )}
          {profReq.length > 0 && (
            <div style={{ fontSize: 11, color: meetsProf ? C.textMuted : C.bad }}>
              Wymagana profesja: {profReq.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Główna wartość */}
      {head && (
        <div style={{ padding: '6px 12px', borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, background: C.bgSlot }}>
          <div style={{ color: C.textMuted, fontSize: 10, letterSpacing: 1 }}>{head.label}</div>
          <div style={{ color: C.gold, fontSize: 24, fontWeight: 'bold', lineHeight: 1.1, textShadow: '0 2px 0 #000' }}>{head.value}</div>
        </div>
      )}

      {/* Statystyki */}
      <div style={{ padding: '8px 12px' }}>
        {stats.length > 0 ? (
          <>
            <div style={{ color: C.goldDim, fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>STATYSTYKI</div>
            {stats.map(s => {
              const c = cmpStats.find(x => x.key === s.key);
              const diff = compare ? s.num - (c?.num || 0) : 0;
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '1px 0' }}>
                  <span style={{ width: 14, textAlign: 'center' }}>{s.icon}</span>
                  <span style={{ color: C.textMuted, flex: 1 }}>{s.label}</span>
                  <span style={{ color: C.text, fontWeight: 'bold' }}>{s.value}</span>
                  {compare && diff !== 0 && (
                    <span style={{ color: diff > 0 ? C.ok : C.bad, fontSize: 11, minWidth: 34, textAlign: 'right' }}>
                      {diff > 0 ? '▲' : '▼'}{Math.abs(diff)}
                    </span>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <div style={{ color: C.textDim, fontSize: 11 }}>Brak statystyk</div>
        )}

        {compare && (
          <div style={{ marginTop: 6, fontSize: 10, color: C.textDim }}>
            Porównanie z założonym: <span style={{ color: rarityOf(compare).color }}>{compare.nazwa}</span>
          </div>
        )}

        {item.opis && (
          <div style={{
            marginTop: 8, padding: '6px 8px', borderLeft: `2px solid ${C.bronze}`,
            background: 'rgba(0,0,0,0.35)', color: C.textMuted, fontSize: 11, fontStyle: 'italic', lineHeight: 1.45,
          }}>{item.opis}</div>
        )}

        {item.wartosc_sprzedazy > 0 && (
          <div style={{ marginTop: 8, color: C.gold, fontSize: 11 }}>
            🪙 Wartość sprzedaży: <strong>{fmtNum(item.wartosc_sprzedazy)}</strong>
          </div>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', gap: 6, padding: 10, borderTop: `1px solid ${C.line}`, background: C.bgSlot, flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
}

// ── Przycisk ─────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, disabled, tone = 'gold', style }) {
  const tones = {
    gold:   { fg: C.gold,  bd: C.bronze,          bg: 'linear-gradient(180deg,#2e2a20,#1a1813)' },
    green:  { fg: C.ok,    bd: 'rgba(111,216,111,0.45)', bg: 'linear-gradient(180deg,#1c2a1c,#121a12)' },
    red:    { fg: C.bad,   bd: 'rgba(255,90,74,0.45)',   bg: 'linear-gradient(180deg,#2a1815,#1a100e)' },
    plain:  { fg: C.text,  bd: C.line,            bg: C.bgSlot },
  }[tone];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      flex: 1, minWidth: 92, padding: '9px 10px',
      background: disabled ? C.bgSlot : tones.bg,
      color: disabled ? C.textDim : tones.fg,
      border: `1px solid ${disabled ? C.line : tones.bd}`,
      borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 12, fontWeight: 'bold', fontFamily: C.font,
      ...style,
    }}>{children}</button>
  );
}

// ── Pasek (HP / mana / exp) ──────────────────────────────────────────────────
export function Bar({ value, max, color, glow, label, height = 16 }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div style={{
      position: 'relative', height, flex: 1, background: '#0a0b0d',
      border: `1px solid ${C.line}`, borderRadius: 4, overflow: 'hidden',
      boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)',
    }}>
      <div style={{
        width: `${pct}%`, height: '100%',
        background: `linear-gradient(180deg, ${glow}, ${color})`,
        boxShadow: `0 0 10px ${glow}80`, transition: 'width .25s',
      }} />
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        fontSize: Math.max(9, height - 7), color: '#fff', textShadow: '0 1px 2px #000', fontWeight: 'bold',
      }}>{label ?? `${value}/${max}`}</div>
    </div>
  );
}
