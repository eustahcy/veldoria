// Interfejs na telefon (pionowo): HUD rozgrywki + pełnoekranowe ekrany
// (menu, ekwipunek, postać, umiejętności, zadania, mapa świata).
// Oprawa jak na komputerze: ciemny kamień, brązowe ramki, złote akcenty.
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  IconCoin, IconGem, IconStore, IconTrophy, IconMail, IconSettings, IconMoon, IconSun,
  IconSword, IconShield, IconMuscle, IconBow, IconBrain, IconCrosshair, IconFlask,
  IconMegaphone, IconX, IconMenu, IconScroll, IconBag, IconStar, IconMap, IconChat,
  IconMessages, IconUser, IconBanner, IconHammer, IconFish, IconCastle, IconPalette,
  IconDagger, IconLogout, IconLock, IconCheck, IconCompass, IconRefresh, IconTrash, IconMapPin,
} from '../../Icons';
import { api } from '../../api';
import { hudColors as G } from '../hud/GameHud';
import { rarityOf, fmtNum } from '../../ui/kit';
import { DOLL, GEAR, CATS, Icon, Slot, ItemDetails, Bar, expPct } from '../Inventory';

const FONT = "'Trebuchet MS', Verdana, sans-serif";
const SAFE_T = 'env(safe-area-inset-top, 0px)';
const SAFE_B = 'env(safe-area-inset-bottom, 0px)';
const PANEL = 'linear-gradient(180deg,#1b1712 0%,#120f0b 50%,#0b0907 100%)';

// ── Drobne elementy ──────────────────────────────────────────────────────────
function Diamond({ size = 9 }) {
  return <span style={{ width: size, height: size, flexShrink: 0, transform: 'rotate(45deg)', border: `1.5px solid ${G.gold}`, display: 'inline-block' }} />;
}

function Logo({ size = 19 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
      <span style={{
        fontFamily: G.serif, fontSize: size, letterSpacing: size * 0.22, fontWeight: 700,
        background: 'linear-gradient(180deg,#f7e3a4,#d8ab3d 60%,#9a7526)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>◆ VELDORIA ◆</span>
      <span style={{ fontFamily: G.serif, fontSize: 6.5, letterSpacing: 3, color: G.goldDim, marginTop: 2 }}>ONLINE RPG</span>
    </div>
  );
}

function ClassBadge({ children, small }) {
  return (
    <span style={{
      padding: small ? '1px 7px' : '2px 10px', borderRadius: 999, fontSize: small ? 9.5 : 11, whiteSpace: 'nowrap',
      background: 'linear-gradient(180deg,rgba(168,40,28,0.45),rgba(80,18,12,0.45))',
      border: '1px solid rgba(229,98,76,0.55)', color: '#ffb0a0',
    }}>{children}</span>
  );
}

function Btn({ children, onClick, disabled, primary, tone, style }) {
  const col = tone === 'red' ? '#ff8b78' : G.goldHi;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '11px 12px', borderRadius: 4, cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? '#0e0c0a' : primary ? 'linear-gradient(180deg,#5a4520,#2d2210)' : 'linear-gradient(180deg,#221c14,#110d09)',
      border: `1px solid ${disabled ? '#3a3122' : primary ? G.gold : G.bronze}`,
      color: disabled ? G.dim : col, fontFamily: G.serif, fontSize: 14, letterSpacing: 0.4,
      boxShadow: primary && !disabled ? '0 0 12px rgba(231,193,88,0.2), inset 0 1px 0 rgba(255,255,255,0.12)' : 'inset 0 1px 0 rgba(255,255,255,0.06)',
      WebkitTapHighlightColor: 'transparent', ...style,
    }}>{children}</button>
  );
}

function Tabs({ tabs, value, onChange }) {
  return (
    <div style={{ display: 'flex', border: `1px solid ${G.bronze}`, borderRadius: 4, overflow: 'hidden', marginBottom: 12, flexShrink: 0 }}>
      {tabs.map((t, i) => {
        const on = value === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            flex: 1, padding: '9px 4px', cursor: 'pointer', whiteSpace: 'nowrap',
            background: on ? 'linear-gradient(180deg,#5a4520,#2d2210)' : 'linear-gradient(180deg,#17130f,#0c0a08)',
            border: 'none', borderLeft: i ? `1px solid ${G.bronze}88` : 'none',
            boxShadow: on ? `inset 0 0 0 1px ${G.gold}` : 'none',
            color: on ? G.goldHi : G.muted, fontFamily: G.serif, fontSize: 12.5,
          }}>{t.label}</button>
        );
      })}
    </div>
  );
}

// Pełnoekranowy ekran z nagłówkiem „◆ Tytuł ✕”
export function Sheet({ title, onClose, children, footer, header, pad = 12 }) {
  useEffect(() => {
    const on = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [onClose]);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600, display: 'flex', flexDirection: 'column',
      background: PANEL, color: G.text, fontFamily: FONT,
      paddingTop: SAFE_T, paddingBottom: SAFE_B,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', flexShrink: 0,
        borderBottom: `1px solid ${G.bronze}`, background: 'linear-gradient(180deg,#1f1a13,#110e0a)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
      }}>
        {header || <><Diamond /><span style={{ fontFamily: G.serif, fontSize: 18, color: G.goldHi, letterSpacing: 0.6 }}>{title}</span></>}
        <button onClick={onClose} aria-label="Zamknij" style={{
          marginLeft: 'auto', width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer',
          color: G.gold, fontSize: 22, lineHeight: 1,
        }}><IconX size={16} /></button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: pad, WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
      {footer && (
        <div style={{ flexShrink: 0, padding: '10px 12px', borderTop: `1px solid ${G.bronze}88`, background: '#0d0b08' }}>{footer}</div>
      )}
    </div>
  );
}

function Card({ children, style, onClick, active }) {
  return (
    <div onClick={onClick} style={{
      background: 'linear-gradient(180deg,#1a1611,#0f0c09)',
      border: `1px solid ${active ? G.gold : G.bronze + 'aa'}`, borderRadius: 4,
      boxShadow: active ? `0 0 14px rgba(231,193,88,0.2), inset 0 0 0 1px ${G.gold}55` : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      cursor: onClick ? 'pointer' : 'default', ...style,
    }}>{children}</div>
  );
}

// ── Rysowanie mapy (minimapa i mapa świata) ─────────────────────────────────
const IMG = {};
function mapImage(src) {
  if (!src) return null;
  if (!IMG[src]) { const i = new Image(); i.src = `/assets/${src}`; IMG[src] = i; }
  return IMG[src].complete && IMG[src].naturalWidth ? IMG[src] : null;
}

// cx, cy — środek widoku w kaflach; s — piksele na kafel
function drawWorld(canvas, state, { cx, cy, s, show = {}, focus, round }) {
  if (!canvas || !state?.mapa) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  const { mapa, postac } = state;
  const W = mapa.maks_x + 1, H = mapa.maks_y + 1;
  const ox = w / 2 - (cx + 0.5) * s, oy = h / 2 - (cy + 0.5) * s;
  const P = (x, y) => [ox + (x + 0.5) * s, oy + (y + 0.5) * s];

  ctx.fillStyle = '#07060a'; ctx.fillRect(0, 0, w, h);
  const img = mapImage(mapa.obrazek);
  if (img) ctx.drawImage(img, ox, oy, W * s, H * s);
  else { ctx.fillStyle = '#1f2a16'; ctx.fillRect(ox, oy, W * s, H * s); }
  ctx.strokeStyle = 'rgba(231,193,88,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(ox, oy, W * s, H * s);

  const r = Math.max(2.5, Math.min(7, s * 0.45));
  const dot = (x, y, fill, stroke, rad = r) => {
    const [px, py] = P(x, y);
    ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke(); }
  };
  if (show.portale !== false) (state.portals || []).forEach(p => dot(p.x, p.y, 'rgba(167,139,250,0.95)', '#2a1850'));
  if (show.moby !== false) (state.mobs || []).forEach(m => m.zycie > 0 && dot(m.x, m.y, '#e5624c', '#3a0d08', r * 0.85));
  if (show.npc !== false) (state.npcs || []).forEach(n => dot(n.x, n.y, '#5fd07a', '#0d2a12'));
  if (show.gracze !== false) (state.players || []).forEach(p => dot(p.x, p.y, '#6fb2ff', '#0b1f3a', r * 0.85));

  if (focus && focus.mapa === mapa.id) {
    const [fx, fy] = P(focus.x, focus.y);
    ctx.fillStyle = G.gold; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx - 7, fy - 13); ctx.arc(fx, fy - 15, 7.5, Math.PI * 0.8, Math.PI * 0.2); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1a1206'; ctx.beginPath(); ctx.arc(fx, fy - 15, 3, 0, Math.PI * 2); ctx.fill();
  }

  const [hx, hy] = P(postac.x, postac.y);
  const pulse = (Math.sin(Date.now() / 260) + 1) / 2;
  ctx.beginPath(); ctx.arc(hx, hy, r + 3 + pulse * 4, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(247,227,164,${0.15 + pulse * 0.2})`; ctx.fill();
  dot(postac.x, postac.y, '#fff', G.gold, r + 1);

  if (round) {
    const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.52);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
}

function useAnimatedDraw(ref, draw, deps) {
  useEffect(() => {
    let id;
    const loop = () => { draw(ref.current); id = requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ══════════════════════════════════════════════════════════════════════════════
// HUD ROZGRYWKI
// ══════════════════════════════════════════════════════════════════════════════
function HudBar({ pct, from, to, label, h = 11 }) {
  return (
    <div style={{
      position: 'relative', height: h, borderRadius: 2, overflow: 'hidden', background: '#08070a',
      border: '1px solid #000', boxShadow: `0 0 0 1px ${G.bronze}66, inset 0 2px 4px rgba(0,0,0,0.9)`,
    }}>
      <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', background: `linear-gradient(180deg,${to},${from})`, transition: 'width .3s', position: 'relative' }}>
        <span style={{ position: 'absolute', inset: '0 0 55% 0', background: 'linear-gradient(180deg,rgba(255,255,255,0.3),transparent)' }} />
      </div>
      <span style={{
        position: 'absolute', left: 5, top: 0, bottom: 0, display: 'flex', alignItems: 'center',
        fontSize: h - 2.5, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px #000, 0 0 4px #000',
      }}>{label}</span>
    </div>
  );
}

function RoundBtn({ icon, label, onClick, size = 50, badge, active }) {
  return (
    <button onClick={onClick} aria-label={label} style={{
      width: size, height: size, borderRadius: '50%', position: 'relative', flexShrink: 0,
      display: 'grid', placeItems: 'center', cursor: 'pointer', padding: 0,
      background: active ? 'radial-gradient(circle at 50% 35%,#5a4520,#1a140b)' : 'radial-gradient(circle at 50% 35%,#2a231a,#0c0a08)',
      border: `2px solid ${active ? G.gold : G.bronze}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 0 0 1px rgba(0,0,0,0.8)',
      color: G.goldHi, fontSize: size * 0.42, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
    }}>
      <span style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.8))' }}>{icon}</span>
      {badge ? (
        <span style={{
          position: 'absolute', top: -2, right: -2, minWidth: 17, height: 17, borderRadius: 9, padding: '0 4px',
          background: '#a8281c', border: '1px solid #e5624c', color: '#fff', fontSize: 10, display: 'grid', placeItems: 'center',
        }}>{badge === true ? '!' : badge}</span>
      ) : null}
    </button>
  );
}

function Joystick({ onMove, landscape = false }) {
  const baseRef = useRef(null);
  const timer = useRef(null);
  const dirRef = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const R = landscape ? 64 : 56;   // w poziomie joystick nie może zjadać pół ekranu

  const stop = useCallback(() => {
    clearInterval(timer.current); timer.current = null; dirRef.current = null; setKnob({ x: 0, y: 0 });
  }, []);
  useEffect(() => stop, [stop]);

  const track = (e) => {
    const b = baseRef.current.getBoundingClientRect();
    let dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > R - 18) { dx = dx / d * (R - 18); dy = dy / d * (R - 18); }
    setKnob({ x: dx, y: dy });
    const dir = d < 14 ? null : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'prawo' : 'lewo') : (dy > 0 ? 'dol' : 'gora');
    if (dir === dirRef.current) return;
    clearInterval(timer.current); dirRef.current = dir;
    if (dir) { onMove(dir); timer.current = setInterval(() => onMove(dir), 210); }
  };

  return (
    <div ref={baseRef}
      onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); track(e); }}
      onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) track(e); }}
      onPointerUp={stop} onPointerCancel={stop}
      style={{
        width: R * 2, height: R * 2, borderRadius: '50%', position: 'relative', touchAction: 'none',
        background: 'radial-gradient(circle,rgba(20,16,11,0.55),rgba(8,6,4,0.8))',
        border: `2px solid ${G.bronze}cc`, boxShadow: '0 6px 18px rgba(0,0,0,0.6), inset 0 0 18px rgba(0,0,0,0.8)',
      }}>
      {['▲', '▶', '▼', '◀'].map((a, i) => (
        <span key={a} style={{
          position: 'absolute', color: `${G.goldDim}`, fontSize: 9,
          ...[{ top: 5, left: '50%', transform: 'translateX(-50%)' }, { right: 6, top: '50%', transform: 'translateY(-50%)' },
            { bottom: 5, left: '50%', transform: 'translateX(-50%)' }, { left: 6, top: '50%', transform: 'translateY(-50%)' }][i],
        }}>{a}</span>
      ))}
      <span style={{
        position: 'absolute', left: '50%', top: '50%', width: landscape ? 54 : 46, height: landscape ? 54 : 46, borderRadius: '50%',
        transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
        background: 'radial-gradient(circle at 40% 35%,#6b6358,#2c2822 60%,#15120f)',
        border: `1px solid ${G.bronze}`, boxShadow: '0 4px 10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.2)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

function RoundMinimap({ state, size, onClick }) {
  const ref = useRef(null);
  useAnimatedDraw(ref, (c) => drawWorld(c, state, { cx: state.postac.x, cy: state.postac.y, s: 4, round: true }), [state]);
  return (
    <button onClick={onClick} aria-label="Mapa" style={{
      width: size, height: size, borderRadius: '50%', padding: 0, cursor: 'pointer', position: 'relative', overflow: 'hidden',
      border: `2px solid ${G.gold}`, background: '#07060a',
      boxShadow: `0 0 0 3px #120e09, 0 0 0 4px ${G.bronze}, 0 6px 16px rgba(0,0,0,0.8)`,
    }}>
      <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />
      {[['N', { top: 2, left: '50%', transform: 'translateX(-50%)' }], ['S', { bottom: 2, left: '50%', transform: 'translateX(-50%)' }],
        ['W', { left: 4, top: '50%', transform: 'translateY(-50%)' }], ['E', { right: 4, top: '50%', transform: 'translateY(-50%)' }]].map(([l, p]) => (
        <span key={l} style={{ position: 'absolute', ...p, color: G.goldHi, fontSize: 8.5, fontFamily: G.serif, fontWeight: 700, textShadow: '0 1px 2px #000' }}>{l}</span>
      ))}
    </button>
  );
}

function BottomSlot({ children, label, onClick, active, count, disabled, landscape = false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      flex: 1, minWidth: 0, height: landscape ? 54 : 58, position: 'relative', padding: 0, cursor: disabled ? 'default' : 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
      background: active ? 'linear-gradient(180deg,#4a3818,#1d160b)' : 'linear-gradient(180deg,#221c14,#0c0a08)',
      border: `1px solid ${active ? G.gold : G.bronze}`, borderRadius: 4,
      boxShadow: active ? '0 0 12px rgba(231,193,88,0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -6px 10px rgba(0,0,0,0.6)',
      color: G.goldHi, opacity: disabled ? 0.5 : 1, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
    }}>
      <span style={{ fontSize: 22, lineHeight: 1, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.8))' }}>{children}</span>
      {label && <span style={{ fontSize: 10, fontFamily: G.serif, color: active ? G.goldHi : G.muted }}>{label}</span>}
      {count != null && (
        <span style={{ position: 'absolute', right: 4, bottom: 2, fontSize: 11, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px #000' }}>{count}</span>
      )}
    </button>
  );
}

export function MobileHud({
  landscape, state, potions = [], unread = 0, pillTxt, autoHunt, chatOpen,
  onMove, onScreen, onChat, onAttack, onTalk, onPotion, onAuto,
}) {
  const p = state.postac;
  const hpPct = p.zycie_max > 0 ? (p.zycie / p.zycie_max) * 100 : 0;
  const enMax = p.energia_max ?? 100;
  const exp = expPct(p);
  const potion = potions[0];
  const potionCount = potions.reduce((n, x) => n + (x.ilosc || 1), 0);
  const low = hpPct < 30;
  // Poziomo: joystick i przyciski schodzą na dół po bokach, pasek akcji jest węższy i wyśrodkowany
  const SAFE_L = 'env(safe-area-inset-left, 0px)', SAFE_R = 'env(safe-area-inset-right, 0px)';

  return (
    <>
      {/* Górny pasek */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500, paddingTop: SAFE_T,
        height: landscape ? 52 : undefined,
        background: 'linear-gradient(180deg,rgba(12,9,6,0.98),rgba(10,8,6,0.86))',
        borderBottom: `1px solid ${G.bronze}`, boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', height: landscape ? 50 : 46, padding: landscape ? '0 12px' : '0 8px' }}>
          <button onClick={() => onScreen('menu')} aria-label="Menu" style={{
            width: landscape ? 42 : 40, height: landscape ? 42 : 40, background: 'none', border: 'none',
            color: G.gold, fontSize: landscape ? 25 : 24, cursor: 'pointer',
          }}><IconMenu size={18} /></button>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}><Logo size={landscape ? 19 : 17} /></div>
          <button onClick={() => onScreen('zadania')} aria-label="Zadania" style={{
            width: landscape ? 42 : 40, height: landscape ? 42 : 40, background: 'none', border: 'none',
            color: G.gold, fontSize: landscape ? 21 : 21, cursor: 'pointer',
          }}><IconScroll size={16} /></button>
        </div>
      </div>

      {/* Karta bohatera */}
      <div style={{
        position: 'fixed', top: landscape ? `calc(${SAFE_T} + 60px)` : `calc(${SAFE_T} + 54px)`,
        left: `calc(${SAFE_L} + ${landscape ? 12 : 8}px)`, zIndex: 480,
        width: landscape ? 'clamp(220px, 31vw, 285px)' : 'min(58vw, 230px)',
        display: 'flex', gap: landscape ? 9 : 7, padding: landscape ? 8 : 6, borderRadius: 5,
        background: 'linear-gradient(180deg,rgba(26,21,15,0.88),rgba(10,8,6,0.88))', border: `1px solid ${G.bronze}`,
        boxShadow: '0 6px 16px rgba(0,0,0,0.6)',
      }} onClick={() => onScreen('postac')}>
        <div style={{
          width: landscape ? 48 : 44, height: landscape ? 58 : 54, flexShrink: 0, borderRadius: 3, border: `1px solid ${G.goldDim}`,
          background: 'radial-gradient(ellipse at 50% 85%, rgba(231,193,88,0.25), #0b0907 70%)', display: 'grid', placeItems: 'center', overflow: 'hidden',
        }}>
          <span style={{ width: 32, height: 48, imageRendering: 'pixelated', transform: landscape ? 'scale(1.05)' : 'none', backgroundImage: `url(/assets/${p.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontFamily: G.serif, fontSize: landscape ? 13 : 12, color: G.goldHi, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Lv. {p.poziom} {p.nazwa}
          </div>
          <div style={{ animation: low ? 'mHudPulse 1s ease-in-out infinite' : 'none' }}>
            <HudBar pct={hpPct} from={G.hp} to={G.hpHi} label={`${Math.round(hpPct)}%`} />
          </div>
          <HudBar pct={enMax > 0 ? ((p.energia ?? 0) / enMax) * 100 : 0} from={G.en} to={G.enHi} label={`${Math.round(enMax > 0 ? ((p.energia ?? 0) / enMax) * 100 : 0)}%`} />
          <HudBar pct={exp} from="#1f6b2c" to="#5fd07a" label={`${exp.toFixed(2)}%`} h={9} />
          <div><ClassBadge small>{p.profesja}</ClassBadge></div>
        </div>
      </div>

      {/* Minimapa + położenie */}
      <div style={{ position: 'fixed', top: landscape ? `calc(${SAFE_T} + 60px)` : `calc(${SAFE_T} + 54px)`,
          right: `calc(${SAFE_R} + ${landscape ? 12 : 8}px)`, zIndex: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <RoundMinimap state={state} size={landscape ? 92 : 96} onClick={() => onScreen('mapa')} />
        <div style={{
          padding: landscape ? '4px 10px' : '3px 8px', borderRadius: 3, textAlign: 'center', maxWidth: landscape ? 150 : 120,
          background: 'rgba(10,8,6,0.82)', border: `1px solid ${G.bronze}99`,
        }}>
          <div style={{ fontFamily: G.serif, fontSize: landscape ? 11.5 : 10.5, color: G.goldHi, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{state.mapa?.nazwa}</div>
          <div style={{ fontSize: 9.5, color: G.muted }}>X: {p.x} Y: {p.y}</div>
        </div>
        {pillTxt && (
          <span style={{ padding: '2px 9px', borderRadius: 10, background: 'rgba(0,0,0,0.75)', border: `1px solid ${G.bronze}`, color: G.goldHi, fontSize: 10.5, fontWeight: 700 }}>{pillTxt}</span>
        )}
      </div>

      {/* Szybkie przyciski po prawej */}
      <div style={{ position: 'fixed', right: `calc(${SAFE_R} + ${landscape ? 14 : 10}px)`,
        bottom: landscape ? `calc(${SAFE_B} + 12px)` : `calc(${SAFE_B} + 150px)`, zIndex: 480, display: 'flex', flexDirection: 'column', gap: landscape ? 8 : 10 }}>
        <RoundBtn size={landscape ? 56 : 50} icon={<IconBag size={22} />} label="Ekwipunek" onClick={() => onScreen('ekwipunek')} />
        <RoundBtn size={landscape ? 56 : 50} icon={<IconStar size={22} />} label="Umiejętności" onClick={() => onScreen('umiejetnosci')} badge={p.punkty_talentow > 0 ? p.punkty_talentow : null} />
        <RoundBtn size={landscape ? 56 : 50} icon={<IconMap size={22} />} label="Mapa" onClick={() => onScreen('mapa')} />
      </div>

      {/* Joystick */}
      <div style={{ position: 'fixed', left: `calc(${SAFE_L} + ${landscape ? 18 : 16}px)`, bottom: landscape ? `calc(${SAFE_B} + 12px)` : `calc(${SAFE_B} + 84px)`, zIndex: 480 }}>
        <Joystick landscape={landscape} onMove={onMove} />
      </div>

      {/* Dolny pasek akcji */}
      <div style={{
        position: 'fixed', left: landscape ? '50%' : 0, right: landscape ? 'auto' : 0, bottom: 0, zIndex: 490,
        width: landscape ? 'min(500px, calc(100vw - 330px))' : undefined, transform: landscape ? 'translateX(-50%)' : undefined,
        paddingBottom: `calc(${SAFE_B} + 6px)`,
        background: landscape ? 'none' : 'linear-gradient(180deg,rgba(18,14,10,0.0),rgba(10,8,6,0.92) 30%)',
      }}>
        <div style={{ display: 'flex', gap: landscape ? 7 : 6, padding: landscape ? '0' : '10px 8px 0',
          transform: landscape ? 'scale(0.96)' : 'none', transformOrigin: 'center bottom' }}>
          <BottomSlot landscape={landscape} label="Czat" onClick={onChat} active={chatOpen} count={unread > 0 && !chatOpen ? unread : null}><IconMessages size={20} /></BottomSlot>
          <BottomSlot landscape={landscape} label="Atak" onClick={onAttack}><IconSword size={20} /></BottomSlot>
          <BottomSlot landscape={landscape} label="Rozmowa" onClick={onTalk}><IconChat size={20} /></BottomSlot>
          <BottomSlot landscape={landscape} label={potion ? 'Mikstura' : 'Brak'} onClick={() => potion && onPotion(potion)} disabled={!potion} count={potion ? potionCount : null}>
            {potion ? <Icon item={potion} size={26} /> : <IconFlask size={20} />}
          </BottomSlot>
          <BottomSlot landscape={landscape} label="Auto" onClick={onAuto} active={autoHunt}><IconRefresh size={20} /></BottomSlot>
        </div>
      </div>
      <style>{`@keyframes mHudPulse{0%,100%{filter:none}50%{filter:brightness(1.6)}}`}</style>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MENU GŁÓWNE
// ══════════════════════════════════════════════════════════════════════════════
export function MenuScreen({ postac, isAdmin, unread, onClose, onPick }) {
  const exp = expPct(postac);
  const rows = [
    ['postac', <IconUser size={17} />, 'Postać'],
    ['ekwipunek', <IconBag size={17} />, 'Ekwipunek'],
    ['umiejetnosci', <IconStar size={17} />, 'Umiejętności', postac.punkty_talentow > 0 ? postac.punkty_talentow : null],
    ['zadania', <IconScroll size={17} />, 'Zadania'],
    ['mapa', <IconMap size={17} />, 'Mapa świata'],
    ['gildia', <IconBanner size={17} />, 'Gildia'],
    ['aukcja', <IconStore size={17} />, 'Sklep i aukcje'],
    ['ranking', <IconTrophy size={17} />, 'Ranking gildii'],
    ['poczta', <IconMail size={17} />, 'Poczta i znajomi', unread > 0 ? unread : null],
    ['rzemioslo', <IconHammer size={17} />, 'Rzemiosło'],
    ['lowienie', <IconFish size={17} />, 'Wędkarstwo'],
    ['lochy', <IconCastle size={17} />, 'Lochy'],
    ['wyglad', <IconPalette size={17} />, 'Wygląd postaci'],
    ['pvp', <IconDagger size={17} />, `Tryb PvP: ${postac.pvp ? 'włączony' : 'wyłączony'}`],
    ...(isAdmin ? [['admin', <IconShield size={17} />, 'Panel admina']] : []),
    ['wyloguj', <IconLogout size={17} />, 'Wyjdź do wyboru postaci'],
  ];
  return (
    <Sheet onClose={onClose} header={<Logo size={20} />}>
      <Card style={{ display: 'flex', gap: 12, padding: 12, marginBottom: 12 }}>
        <div style={{
          width: 64, height: 76, flexShrink: 0, borderRadius: 3, border: `1px solid ${G.goldDim}`, display: 'grid', placeItems: 'center',
          background: 'radial-gradient(ellipse at 50% 85%, rgba(231,193,88,0.25), #0b0907 70%)',
        }}>
          <span style={{ width: 32, height: 48, transform: 'scale(1.45)', imageRendering: 'pixelated', backgroundImage: `url(/assets/${postac.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: G.serif, fontSize: 18, color: G.goldHi }}>{postac.nazwa}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ color: G.muted, fontFamily: G.serif, fontSize: 13 }}>Lv. {postac.poziom}</span>
            <ClassBadge small>{postac.profesja}</ClassBadge>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: G.muted, margin: '7px 0 4px' }}>
            <span>Doświadczenie</span><span style={{ color: G.text }}>{exp.toFixed(2)}%</span>
          </div>
          <Bar pct={exp} from={G.exp} to={G.expHi} height={8} />
        </div>
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map(([id, icon, label, badge]) => (
          <button key={id} onClick={() => onPick(id)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px', cursor: 'pointer', textAlign: 'left',
            background: 'linear-gradient(180deg,#1a1611,#0f0c09)', border: `1px solid ${G.bronze}99`, borderRadius: 4,
            color: id === 'wyloguj' ? '#ff9b8b' : G.text, fontFamily: G.serif, fontSize: 14.5, WebkitTapHighlightColor: 'transparent',
          }}>
            <span style={{ width: 26, display: 'flex', justifyContent: 'center', color: G.goldDim }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {badge ? <span style={{ minWidth: 20, height: 20, borderRadius: 10, padding: '0 6px', background: '#a8281c', color: '#fff', fontSize: 11, display: 'grid', placeItems: 'center' }}>{badge}</span> : null}
            <span style={{ color: G.goldDim, fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EKWIPUNEK + KARTA PRZEDMIOTU
// ══════════════════════════════════════════════════════════════════════════════
function useInventory(onRefresh) {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState(null);
  const load = useCallback(async () => {
    const data = await api.items.inventory();
    if (Array.isArray(data)) setItems(data);
  }, []);
  useEffect(() => { load(); }, [load]);
  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 2600); };
  const after = async (r, okText) => {
    if (r?.error || r?.ok === false) { flash(r.error || 'Nie udało się', false); return false; }
    await load(); onRefresh?.(); flash(okText); return true;
  };
  return { items, load, msg, flash, after };
}

function useLabelFor(it) {
  if (!it) return 'Użyj';
  if (it.typ === 'Konsupcyjne') return 'Użyj';
  if (it.zalozony === 1) return 'Zdejmij';
  return GEAR.includes(it.typ) ? 'Załóż' : 'Użyj';
}

function ItemSheet({ item, compare, postac, onClose, onUse, onDrop, onSell }) {
  const [more, setMore] = useState(false);
  const canUse = item.typ === 'Konsupcyjne' || GEAR.includes(item.typ);
  const r = rarityOf(item);
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: `calc(${SAFE_T} + 16px) 14px calc(${SAFE_B} + 16px)`,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 420, maxHeight: '100%', overflowY: 'auto', position: 'relative',
        background: PANEL, border: `1px solid ${G.gold}`, borderRadius: 4, padding: '16px 14px 14px',
        boxShadow: `0 0 0 1px #000, 0 0 30px ${r.color}33, 0 20px 50px rgba(0,0,0,0.8)`,
      }}>
        <button onClick={onClose} aria-label="Zamknij" style={{ position: 'absolute', top: 6, right: 6, width: 34, height: 34, background: 'none', border: 'none', color: G.gold, fontSize: 20, cursor: 'pointer' }}><IconX size={16} /></button>
        <ItemDetails item={item} compare={compare} postac={postac} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          <Btn primary onClick={onUse} disabled={!canUse}>{useLabelFor(item)}</Btn>
          <Btn tone="red" onClick={onDrop} disabled={item.zalozony === 1}>Wyrzuć</Btn>
          <Btn onClick={() => setMore(m => !m)}>{more ? 'Mniej' : 'Więcej'}</Btn>
          {more && (
            <Btn onClick={onSell} disabled={item.zalozony === 1 || !(item.wartosc_sprzedazy > 0)}>
              Sprzedaj{item.wartosc_sprzedazy > 0 ? ` (${fmtNum(item.wartosc_sprzedazy)} zł.)` : ''}
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

function slotOf(it) { return DOLL.find(d => d.types.includes(it?.typ)); }

function useItemActions({ inv, sel, setSel }) {
  const { items, after } = inv;
  const equipped = items.filter(i => i.zalozony === 1);
  const compare = sel && sel.zalozony !== 1 ? equipped.find(e => slotOf(e) && slotOf(e) === slotOf(sel)) || null : null;
  const use = async () => {
    if (!sel) return;
    if (sel.typ === 'Konsupcyjne') { if (await after(await api.items.use(sel.id), `Użyto: ${sel.nazwa}`)) setSel(null); return; }
    if (sel.zalozony === 1) { if (await after(await api.items.equip(sel.id, 'zdejmij'), `Zdjęto: ${sel.nazwa}`)) setSel(null); return; }
    if (GEAR.includes(sel.typ)) { if (await after(await api.items.equip(sel.id, 'zaloz'), `Założono: ${sel.nazwa}`)) setSel(null); }
  };
  const drop = async () => {
    if (!sel || !window.confirm(`Wyrzucić „${sel.nazwa}"? Przedmiot zniknie bezpowrotnie.`)) return;
    if (await after(await api.items.drop(sel.id), `Wyrzucono: ${sel.nazwa}`)) setSel(null);
  };
  const sell = async () => {
    if (!sel || !window.confirm(`Sprzedać „${sel.nazwa}" za ${sel.wartosc_sprzedazy}?`)) return;
    if (await after(await api.items.sell(sel.id), `Sprzedano za ${fmtNum(sel.wartosc_sprzedazy)}`)) setSel(null);
  };
  return { compare, use, drop, sell };
}

function Flash({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: 'fixed', left: 16, right: 16, bottom: `calc(${SAFE_B} + 84px)`, zIndex: 700, textAlign: 'center',
      padding: '9px 12px', borderRadius: 4, background: 'rgba(10,8,6,0.95)', border: `1px solid ${msg.ok ? '#5fd07a' : '#e5624c'}`,
      color: msg.ok ? '#9be8ac' : '#ff8b78', fontSize: 13,
    }}>{msg.text}</div>
  );
}

const SORTS = [['typ', 'typ'], ['poziom', 'poziom'], ['rzadkosc', 'rzadkość'], ['nazwa', 'A–Z']];

export function InventoryScreen({ postac, onClose, onRefresh }) {
  const inv = useInventory(onRefresh);
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState(0);
  const [sel, setSel] = useState(null);
  const [open, setOpen] = useState(false);
  const act = useItemActions({ inv, sel, setSel });

  const bag = useMemo(() => inv.items.filter(i => i.zalozony !== 1), [inv.items]);
  const shown = useMemo(() => {
    const c = CATS.find(x => x.id === cat) || CATS[0];
    const k = SORTS[sort][0];
    return bag.filter(c.test).sort((a, b) =>
      k === 'poziom' ? (b.wym_poziom || 0) - (a.wym_poziom || 0)
        : k === 'nazwa' ? a.nazwa.localeCompare(b.nazwa, 'pl')
          : k === 'rzadkosc' ? rarityOf(b).label.localeCompare(rarityOf(a).label, 'pl')
            : (a.typ || '').localeCompare(b.typ || '', 'pl'));
  }, [bag, cat, sort]);
  const empty = Math.max(0, Math.ceil(Math.max(shown.length, 20) / 4) * 4 - shown.length);
  const selLive = sel && inv.items.find(i => i.id === sel.id);

  return (
    <Sheet
      onClose={onClose}
      header={<>
        <Diamond /><span style={{ fontFamily: G.serif, fontSize: 18, color: G.goldHi }}>Ekwipunek</span>
        <span style={{ marginLeft: 'auto', color: G.muted, fontSize: 12.5 }}><IconBag size={13} /> {bag.length}</span>
      </>}
      footer={<>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 15 }}>
          <span style={{ color: G.goldHi }}><IconCoin size={13} /> {Number(postac.zloto || 0).toLocaleString('pl-PL')}</span>
          <span style={{ color: '#ff8fa3' }}><IconGem size={13} /> {fmtNum(postac.event_tokeny || 0)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Btn onClick={() => setSort(s => (s + 1) % SORTS.length)}>⇅ Sortuj: {SORTS[sort][1]}</Btn>
          <Btn primary disabled={!selLive || !(selLive.typ === 'Konsupcyjne' || GEAR.includes(selLive.typ))} onClick={act.use}>
            {useLabelFor(selLive)}
          </Btn>
        </div>
      </>}
    >
      <Tabs value={cat} onChange={setCat} tabs={CATS.map(c => ({ id: c.id, label: c.label }))} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {shown.map(it => (
          <Slot key={it.id} item={it} size={200} selected={sel?.id === it.id}
            onClick={() => { setSel(it); setOpen(true); }} />
        ))}
        {Array.from({ length: empty }, (_, i) => <Slot key={`e${i}`} size={200} />)}
      </div>
      {open && selLive && (
        <ItemSheet item={selLive} compare={act.compare} postac={postac} onClose={() => setOpen(false)}
          onUse={async () => { await act.use(); setOpen(false); }}
          onDrop={async () => { await act.drop(); }}
          onSell={async () => { await act.sell(); }} />
      )}
      <Flash msg={inv.msg} />
    </Sheet>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// POSTAĆ
// ══════════════════════════════════════════════════════════════════════════════
export function CharacterScreen({ postac, onClose, onRefresh, onOutfit }) {
  const inv = useInventory(onRefresh);
  const [sel, setSel] = useState(null);
  const act = useItemActions({ inv, sel, setSel });
  const equipped = inv.items.filter(i => i.zalozony === 1);
  const inSlot = (d) => equipped.find(i => d.types.includes(i.typ)) || null;
  const exp = expPct(postac);
  const selLive = sel && inv.items.find(i => i.id === sel.id);

  return (
    <Sheet title="Postać" onClose={onClose}>
      <Card style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gridTemplateRows: 'repeat(4, auto)', gap: 8 }}>
          {DOLL.map(d => {
            const it = inSlot(d);
            return (
              <div key={d.id} style={{ gridColumn: d.col, gridRow: d.row, display: 'grid', placeItems: 'center' }}>
                <Slot item={it} label={d.label} size={68} onClick={() => it && setSel(it)} />
              </div>
            );
          })}
          <div style={{
            gridColumn: 2, gridRow: '2 / 4', borderRadius: 4, display: 'grid', placeItems: 'center', minHeight: 140,
            background: 'radial-gradient(ellipse at 50% 85%, rgba(231,193,88,0.22), #0b0907 70%)',
            border: `1px solid ${G.bronze}`, boxShadow: 'inset 0 0 18px rgba(0,0,0,0.9)',
          }}>
            <span style={{
              width: 32, height: 48, transform: 'scale(2.6)', imageRendering: 'pixelated',
              backgroundImage: `url(/assets/${postac.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat',
              filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.8))',
            }} />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <div style={{ fontFamily: G.serif, fontSize: 20, color: G.goldHi }}>{postac.nazwa}</div>
          <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <span style={{ color: G.muted, fontFamily: G.serif, fontSize: 13 }}>Lv. {postac.poziom}</span>
            <ClassBadge>{postac.profesja}</ClassBadge>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: G.muted, marginBottom: 5 }}>
            <span>Doświadczenie</span><span style={{ color: G.text }}>{exp.toFixed(2)}%</span>
          </div>
          <Bar pct={exp} from={G.exp} to={G.expHi} />
          {[
            ['HP', postac.zycie, postac.zycie_max, G.hp, G.hpHi, '#ff9b8b'],
            ['EN', postac.energia ?? 0, postac.energia_max ?? 100, G.en, G.enHi, '#8fbaff'],
          ].map(([l, v, m, f, t, c]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 9 }}>
              <span style={{ width: 24, color: c, fontFamily: G.serif }}>{l}</span>
              <Bar pct={m > 0 ? (v / m) * 100 : 0} from={f} to={t} />
              <span style={{ minWidth: 88, textAlign: 'right', color: c }}>{fmtNum(v)} / {fmtNum(m)}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, borderTop: `1px solid ${G.bronze}66`, paddingTop: 10 }}>
          {[
            [<IconSword size={13} />, 'Atak', `${postac.obrazenia_min} – ${postac.obrazenia_max}`],
            [<IconShield size={13} />, 'Obrona', postac.ac ?? 0],
            [<IconMuscle size={13} />, 'Siła', postac.sila ?? 0],
            [<IconBow size={13} />, 'Zręczność', postac.zrecznosc ?? 0],
            [<IconBrain size={13} />, 'Inteligencja', postac.intelekt ?? 0],
            [<IconCrosshair size={13} />, 'Celność', postac.sa ?? 0],
          ].map(([ic, l, v]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, padding: '4px 0' }}>
              <span style={{ width: 18, textAlign: 'center', opacity: 0.85 }}>{ic}</span>
              <span style={{ color: G.muted, flex: 1 }}>{l}</span>
              <span style={{ color: G.text, fontFamily: G.serif }}>{v}</span>
            </div>
          ))}
        </div>
        <Btn onClick={onOutfit} style={{ width: '100%', marginTop: 12 }}>Wygląd postaci</Btn>
      </Card>
      {selLive && (
        <ItemSheet item={selLive} compare={null} postac={postac} onClose={() => setSel(null)}
          onUse={act.use} onDrop={act.drop} onSell={act.sell} />
      )}
      <Flash msg={inv.msg} />
    </Sheet>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// UMIEJĘTNOŚCI (drzewko talentów jako lista)
// ══════════════════════════════════════════════════════════════════════════════
export function SkillsScreen({ postac, onClose, onRefresh }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [msg, setMsg] = useState(null);
  const load = useCallback(async () => {
    const r = await api.talents.tree();
    setData(r?.paths ? r : null); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const all = useMemo(() => (data?.paths || []).flatMap(p => p.talents.map(t => ({ ...t, sciezka: p.name }))), [data]);
  const avail = all.filter(t => t.available && t.myLevel < t.max_poziom);
  const list = tab === 'all' ? all : avail;
  const points = data?.punkty_dostepne || 0;

  const invest = async (t) => {
    const r = await api.talents.invest(t.id);
    setMsg({ text: r?.ok ? (r.msg || `${t.nazwa}: +1`) : (r?.error || 'Nie udało się'), ok: !!r?.ok });
    setTimeout(() => setMsg(null), 2400);
    if (r?.ok) { load(); onRefresh?.(); }
  };

  return (
    <Sheet title="Umiejętności" onClose={onClose}>
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: 'all', label: data?.klasa || postac.profesja },
        { id: 'avail', label: `Dostępne (${avail.length})` },
      ]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', color: G.muted, fontSize: 13, margin: '0 2px 10px' }}>
        <span>Punkty do rozdania</span>
        <b style={{ color: points > 0 ? G.goldHi : G.muted, fontFamily: G.serif }}>{points}</b>
      </div>
      {loading && <div style={{ color: G.dim, textAlign: 'center', padding: 30 }}>Ładowanie…</div>}
      {!loading && !data && <div style={{ color: G.dim, textAlign: 'center', padding: 30 }}>Brak drzewka umiejętności dla tej klasy.</div>}
      {!loading && data && list.length === 0 && <div style={{ color: G.dim, textAlign: 'center', padding: 30 }}>Nic tu nie ma.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map(t => {
          const max = t.myLevel >= t.max_poziom;
          const can = !max && t.available && points > 0;
          const locked = !t.available && t.myLevel === 0;
          return (
            <Card key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, opacity: locked ? 0.5 : 1 }}>
              <div style={{
                width: 54, height: 54, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 28, borderRadius: 3,
                background: 'radial-gradient(circle at 50% 40%, rgba(229,98,76,0.45), #1a0806 75%)',
                border: `1px solid ${max ? G.gold : G.bronze}`, boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
              }}>{t.ikona || <IconSword size={18} />}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: G.serif, fontSize: 14.5, color: G.text }}>{t.nazwa}</div>
                <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>Lv. {t.myLevel} / {t.max_poziom}</div>
                {t.opis && <div style={{ fontSize: 11, color: G.dim, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.opis}</div>}
              </div>
              {max ? (
                <span style={{ padding: '6px 10px', border: `1px solid ${G.gold}`, borderRadius: 3, color: G.goldHi, fontFamily: G.serif, fontSize: 12.5, background: 'rgba(231,193,88,0.1)' }}>Max</span>
              ) : (
                <button onClick={() => can && invest(t)} disabled={!can} aria-label="Rozwiń" style={{
                  width: 40, height: 40, borderRadius: 3, fontSize: 22, cursor: can ? 'pointer' : 'default',
                  background: can ? 'linear-gradient(180deg,#5a4520,#2d2210)' : '#0e0c0a',
                  border: `1px solid ${can ? G.gold : '#3a3122'}`, color: can ? G.goldHi : G.dim,
                }}>{locked ? <IconLock size={13} /> : '+'}</button>
              )}
            </Card>
          );
        })}
      </div>
      <Flash msg={msg} />
    </Sheet>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ZADANIA
// ══════════════════════════════════════════════════════════════════════════════
function questMark(q, tab) {
  if (tab === 'done') return { icon: <IconCheck size={13} />, bg: '#1d4a26', bd: '#5fd07a', fg: '#c6f5cf' };
  if (tab === 'avail') return { icon: '!', bg: '#6b5114', bd: G.gold, fg: '#fff3c4' };
  if (q.status === 'ukonczone') return { icon: '?', bg: '#1d6b2c', bd: '#5fd07a', fg: '#fff' };
  if (q.typ === 'kill') return { icon: '!', bg: '#8e1f18', bd: '#e5624c', fg: '#fff' };
  return { icon: '!', bg: '#9a7422', bd: G.gold, fg: '#fff' };
}

function questLine(q, tab) {
  if (tab === 'avail') return `Od poziomu ${q.wymagany_poziom || 1}${q.nagroda_exp ? ` · +${fmtNum(q.nagroda_exp)} EXP` : ''}${q.nagroda_zloto ? ` · 🪙 ${fmtNum(q.nagroda_zloto)}` : ''}`;
  if (q.status === 'ukonczone') return 'Gotowe — wróć po nagrodę';
  if ((q.typ === 'kill' || q.typ === 'item') && q.cel_ilosc) return `${q.typ === 'kill' ? 'Pokonaj' : 'Zbierz'} (${q.postep}/${q.cel_ilosc})`;
  return q.opis ? q.opis.slice(0, 60) : 'W toku';
}

// Gdzie wskazać na mapie: dostępne → NPC, który daje zadanie; aktywne → NPC, któremu się oddaje
const questPlace = (q, tab) => (tab === 'avail' ? q.start : q.koniec || q.start);

export function QuestsScreen({ onClose, onShowOnMap }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('active');
  const [sel, setSel] = useState(null);
  useEffect(() => {
    api.quests.overview().then(r => setData(r && r.active ? r : { active: [], available: [], done: [] })).catch(() => setData({ active: [], available: [], done: [] }));
  }, []);
  const list = !data ? [] : tab === 'active' ? data.active : tab === 'avail' ? data.available : data.done;
  const selQ = list.find(q => q.quest_id === sel);
  const place = selQ && questPlace(selQ, tab);

  return (
    <Sheet title="Zadania" onClose={onClose} footer={
      <Btn style={{ width: '100%' }} disabled={!place} onClick={() => onShowOnMap({ ...place, label: place.nazwa, quest: selQ.nazwa })}>
        <IconCompass size={13} /> Pokaż na mapie
      </Btn>
    }>
      <Tabs value={tab} onChange={(t) => { setTab(t); setSel(null); }} tabs={[
        { id: 'active', label: 'Aktywne' }, { id: 'avail', label: 'Dostępne' }, { id: 'done', label: 'Zakończone' },
      ]} />
      {!data && <div style={{ color: G.dim, textAlign: 'center', padding: 30 }}>Ładowanie…</div>}
      {data && list.length === 0 && (
        <div style={{ color: G.dim, textAlign: 'center', padding: 30, fontSize: 13 }}>
          {tab === 'active' ? 'Nie masz aktywnych zadań. Porozmawiaj z NPC oznaczonymi „!”.' : tab === 'avail' ? 'Brak nowych zadań na twój poziom.' : 'Nie ukończono jeszcze żadnego zadania.'}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map(q => {
          const m = questMark(q, tab);
          const pl = questPlace(q, tab);
          return (
            <Card key={q.quest_id} active={sel === q.quest_id} onClick={() => setSel(sel === q.quest_id ? null : q.quest_id)}
              style={{ display: 'flex', gap: 12, padding: 12 }}>
              <span style={{
                width: 34, height: 38, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 4,
                background: `linear-gradient(180deg,${m.bd},${m.bg})`, border: `1px solid ${m.bd}`, color: m.fg,
                fontSize: 20, fontWeight: 900, boxShadow: `0 0 10px ${m.bd}55`,
              }}>{m.icon}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: G.serif, fontSize: 14.5, color: G.goldHi }}>{q.nazwa}</div>
                <div style={{ fontSize: 12.5, color: G.text, marginTop: 3 }}>{questLine(q, tab)}</div>
                {pl && <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>– {pl.nazwa}, {pl.mapa_nazwa || 'nieznana mapa'}</div>}
                {sel === q.quest_id && q.opis && (
                  <div style={{ fontSize: 12, color: G.muted, marginTop: 8, lineHeight: 1.5, borderTop: `1px solid ${G.bronze}55`, paddingTop: 6 }}>{q.opis}</div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </Sheet>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAPA ŚWIATA
// ══════════════════════════════════════════════════════════════════════════════
export function MapScreen({ state, focus, onClose, onWalk, onNpc }) {
  const [tab, setTab] = useState('lokalna');
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState(null); // null = podążaj za graczem
  const [show, setShow] = useState({ npc: true, moby: true, portale: true, gracze: true });
  const [maps, setMaps] = useState(null);
  const ref = useRef(null);
  const drag = useRef(null);
  const view = useRef({ s: 4, cx: 0, cy: 0 });
  const { mapa, postac } = state;
  const W = mapa.maks_x + 1, H = mapa.maks_y + 1;
  const focusHere = focus && focus.mapa === mapa.id;

  useEffect(() => {
    if (tab === 'swiat' && !maps) api.game.mapList().then(r => setMaps(Array.isArray(r) ? r : [])).catch(() => setMaps([]));
  }, [tab, maps]);

  useAnimatedDraw(ref, (c) => {
    if (!c) return;
    const fit = Math.min(c.clientWidth / W, c.clientHeight / H);
    const s = Math.max(1, fit * zoom);
    const cx = center ? center.x : zoom <= 1 ? (W - 1) / 2 : postac.x;
    const cy = center ? center.y : zoom <= 1 ? (H - 1) / 2 : postac.y;
    view.current = { s, cx, cy };
    drawWorld(c, state, { cx, cy, s, show, focus });
  }, [state, zoom, center, show, focus, tab]);

  const toTile = (e) => {
    const c = ref.current, b = c.getBoundingClientRect(), { s, cx, cy } = view.current;
    return {
      x: Math.floor((e.clientX - b.left - b.width / 2) / s + cx + 0.5),
      y: Math.floor((e.clientY - b.top - b.height / 2) / s + cy + 0.5),
    };
  };
  const down = (e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, moved: false, ...view.current }; };
  const moveP = (e) => {
    const d = drag.current; if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 8) return;
    d.moved = true;
    setCenter({ x: d.cx - dx / d.s, y: d.cy - dy / d.s });
  };
  const up = (e) => {
    const d = drag.current; drag.current = null;
    if (d && !d.moved) {
      const t = toTile(e);
      if (t.x >= 0 && t.y >= 0 && t.x < W && t.y < H) { onWalk(t.x, t.y); onClose(); }
    }
  };

  const ctrl = (icon, label, onClick, style) => (
    <button onClick={onClick} aria-label={label} style={{
      position: 'absolute', width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer',
      background: 'radial-gradient(circle at 50% 35%,#2a231a,#0c0a08)', border: `2px solid ${G.bronze}`, color: G.goldHi, fontSize: 20,
      boxShadow: '0 4px 12px rgba(0,0,0,0.7)', ...style,
    }}>{icon}</button>
  );

  return (
    <Sheet title="Mapa świata" onClose={onClose} pad={10}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Tabs value={tab} onChange={setTab} tabs={[
          { id: 'lokalna', label: 'Lokalna' }, { id: 'swiat', label: 'Świat' }, { id: 'npc', label: 'NPC' }, { id: 'filtry', label: 'Filtry' },
        ]} />

        {tab === 'lokalna' && (
          <>
            <div style={{ position: 'relative', flex: 1, minHeight: 280, borderRadius: 4, overflow: 'hidden', border: `1px solid ${G.bronze}` }}>
              <canvas ref={ref} onPointerDown={down} onPointerMove={moveP} onPointerUp={up} onPointerCancel={() => { drag.current = null; }}
                style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }} />
              {ctrl(<IconCrosshair size={15} />, 'Do mnie', () => { setCenter(null); setZoom(z => Math.max(z, 2.5)); }, { top: 10, right: 10, transform: 'rotate(-45deg)' })}
              {ctrl('+', 'Przybliż', () => setZoom(z => Math.min(8, z * 1.5)), { top: '50%', right: 10, marginTop: -50 })}
              {ctrl('−', 'Oddal', () => { setZoom(z => { const n = Math.max(1, z / 1.5); if (n === 1) setCenter(null); return n; }); }, { top: '50%', right: 10, marginTop: 4 })}
              <span style={{ position: 'absolute', left: 8, bottom: 8, padding: '3px 8px', borderRadius: 3, background: 'rgba(0,0,0,0.7)', color: G.text, fontSize: 12 }}>
                X: {postac.x} Y: {postac.y}
              </span>
              <span style={{ position: 'absolute', left: 8, top: 8, padding: '3px 8px', borderRadius: 3, background: 'rgba(0,0,0,0.6)', color: G.muted, fontSize: 11 }}>
                Dotknij, aby tam pójść
              </span>
            </div>
            <Card style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, marginTop: 10, flexShrink: 0 }}>
              <span style={{ color: G.goldHi, display: 'flex' }}>{mapa.pvp ? <IconSword size={22} /> : <IconCastle size={22} />}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: G.serif, fontSize: 15, color: G.goldHi }}>{mapa.nazwa}</div>
                <div style={{ fontSize: 12, color: mapa.pvp ? '#ff9b8b' : '#9be8ac' }}>{mapa.pvp ? 'Strefa PvP' : 'Bezpieczna strefa'}</div>
                {focus && (
                  <div style={{ fontSize: 12, color: G.text, marginTop: 4 }}>
                    <IconMapPin size={13} /> {focus.label}{focusHere ? ` (${focus.x}, ${focus.y})` : ` — ${focus.mapa_nazwa || 'inna mapa'}`}
                  </div>
                )}
              </div>
              {focusHere && <Btn primary onClick={() => { onWalk(focus.x, focus.y); onClose(); }}>Idź do celu</Btn>}
            </Card>
          </>
        )}

        {tab === 'swiat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {!maps && <div style={{ color: G.dim, textAlign: 'center', padding: 30 }}>Ładowanie…</div>}
            {(maps || []).map(m => (
              <Card key={m.id} active={m.id === mapa.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
                <span style={{ display: 'flex', color: G.goldDim }}>{m.id === mapa.id ? <IconMapPin size={13} /> : <IconMap size={13} />}</span>
                <span style={{ flex: 1, fontFamily: G.serif, fontSize: 14, color: m.id === mapa.id ? G.goldHi : G.text }}>{m.nazwa}</span>
                {m.id === mapa.id && <span style={{ fontSize: 11, color: G.gold }}>Tu jesteś</span>}
                {focus?.mapa === m.id && m.id !== mapa.id && <span style={{ fontSize: 11, color: G.gold }}>Cel zadania</span>}
              </Card>
            ))}
          </div>
        )}

        {tab === 'npc' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(state.npcs || []).length === 0 && <div style={{ color: G.dim, textAlign: 'center', padding: 30 }}>Na tej mapie nie ma NPC.</div>}
            {(state.npcs || []).map(n => {
              const d = Math.abs(n.x - postac.x) + Math.abs(n.y - postac.y);
              return (
                <Card key={n.id} onClick={() => { onNpc(n); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
                  <span style={{ width: 32, height: 40, flexShrink: 0, imageRendering: 'pixelated', backgroundImage: `url(/assets/${n.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat', backgroundSize: '32px auto' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: G.serif, fontSize: 14, color: G.text }}>{n.nazwa}</div>
                    <div style={{ fontSize: 11.5, color: G.muted }}>X: {n.x} Y: {n.y} · {d} kr.</div>
                  </div>
                  <span style={{ color: G.gold, fontSize: 13 }}>Idź ›</span>
                </Card>
              );
            })}
          </div>
        )}

        {tab === 'filtry' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[['npc', '#5fd07a', 'NPC'], ['moby', '#e5624c', 'Potwory'], ['portale', '#a78bfa', 'Przejścia'], ['gracze', '#6fb2ff', 'Gracze']].map(([k, col, l]) => (
              <Card key={k} onClick={() => setShow(s => ({ ...s, [k]: !s[k] }))} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: col }} />
                <span style={{ flex: 1, fontFamily: G.serif, fontSize: 14 }}>{l}</span>
                <span style={{
                  width: 42, height: 24, borderRadius: 12, position: 'relative', background: show[k] ? '#5a4520' : '#1a1611',
                  border: `1px solid ${show[k] ? G.gold : G.bronze}`,
                }}>
                  <span style={{ position: 'absolute', top: 2, left: show[k] ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: show[k] ? G.goldHi : G.dim, transition: 'left .15s' }} />
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  );
}
