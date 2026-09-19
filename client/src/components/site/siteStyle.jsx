// Wspólny styl stron poza grą (start, logowanie, wybór postaci).
import bg from '../../assets/ui/bg.png';

export const BG = bg;

export const S = {
  gold:      '#e7c158',
  goldSoft:  '#c9a34a',
  goldDim:   '#8a7333',
  text:      '#e8e2d4',
  muted:     '#a79f8d',
  dim:       '#6d6858',
  night:     '#070b16',
  panel:     'rgba(10,14,26,0.82)',
  panelSolid:'rgba(9,13,24,0.95)',
  line:      'rgba(231,193,88,0.22)',
  lineSoft:  'rgba(231,193,88,0.12)',
  green:     '#5fd07a',
  red:       '#e5624c',
  serif:     "'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif",
  sans:      "'Trebuchet MS', Verdana, sans-serif",
};

// Tło z przyciemnieniem — używane na wszystkich trzech ekranach
export const pageBg = {
  position: 'fixed', inset: 0, zIndex: 0,
  background: `linear-gradient(180deg, rgba(4,7,14,0.55) 0%, rgba(4,7,14,0.35) 40%, rgba(4,7,14,0.92) 100%), url(${bg}) center/cover no-repeat`,
};

export const vignette = {
  position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
  background: 'radial-gradient(ellipse 90% 70% at 50% 45%, transparent 35%, rgba(3,5,11,0.75) 100%)',
};

export const panel = {
  background: S.panel,
  border: `1px solid ${S.line}`,
  borderRadius: 14,
  boxShadow: '0 30px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.05)',
  backdropFilter: 'blur(6px)',
};

export const goldBtn = (big = false) => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  padding: big ? '15px 30px' : '11px 20px',
  fontFamily: S.serif, fontSize: big ? 16 : 13, fontWeight: 700, letterSpacing: 0.5,
  color: '#2a1e05',
  background: 'linear-gradient(180deg,#f0d071 0%,#d8ab3d 55%,#b8862a 100%)',
  border: '1px solid #f2dd9a', borderRadius: 10, cursor: 'pointer',
  boxShadow: '0 8px 28px rgba(216,171,61,0.35), inset 0 1px 0 rgba(255,255,255,0.5)',
  textShadow: '0 1px 0 rgba(255,255,255,0.35)',
});

export const ghostBtn = (big = false) => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  padding: big ? '15px 30px' : '11px 20px',
  fontFamily: S.serif, fontSize: big ? 16 : 13, fontWeight: 600, letterSpacing: 0.5,
  color: S.gold, background: 'rgba(10,14,26,0.72)',
  border: `1px solid ${S.line}`, borderRadius: 10, cursor: 'pointer',
  backdropFilter: 'blur(4px)',
});

// Ozdobny romb-separator jak w nagłówkach
export function Diamond({ size = 7, color = S.goldSoft, style }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, transform: 'rotate(45deg)',
      border: `1px solid ${color}`, ...style,
    }} />
  );
}

export function Ornament({ children, color = S.goldSoft }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <span style={{ height: 1, width: 46, background: `linear-gradient(90deg, transparent, ${color})` }} />
      <Diamond color={color} />
      {children && <span style={{
        fontFamily: S.serif, fontSize: 11, letterSpacing: 4, color, textTransform: 'uppercase',
      }}>{children}</span>}
      <Diamond color={color} />
      <span style={{ height: 1, width: 46, background: `linear-gradient(270deg, transparent, ${color})` }} />
    </div>
  );
}

export function Logo({ size = 26, sub }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Diamond size={6} />
        <span style={{
          fontFamily: S.serif, fontSize: size, letterSpacing: size * 0.18, fontWeight: 700,
          background: 'linear-gradient(180deg,#f6e3a8,#d8ab3d 60%,#9a7526)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 18px rgba(216,171,61,0.25)',
        }}>VELDORIA</span>
        <Diamond size={6} />
      </div>
      {sub && <div style={{ fontFamily: S.serif, fontSize: 9, letterSpacing: 6, color: S.goldDim }}>{sub}</div>}
    </div>
  );
}

export function OnlineBadge({ online }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: S.muted, fontSize: 12, fontFamily: S.sans }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: S.green,
        boxShadow: `0 0 10px ${S.green}`,
      }} />
      {online ?? 0} online
    </span>
  );
}
