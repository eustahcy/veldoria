// Karta zaznaczonego przeciwnika: portret, poziom, typ, dystans, życie i atak.
import { useState, useEffect } from 'react';
import { hudColors as G } from './hud/GameHud';

const PATTERN = {
  standard: 'Zwykły', aggressive: 'Agresywny', defensive: 'Obronny',
  caster: 'Magiczny', berserker: 'Szał', boss: 'Boss',
};
const SEGMENTS = 4;

export default function TargetFrame({ mob, liveMob, dist, onAttack, onClose }) {
  // na telefonie karta schodzi pod kartę bohatera i minimapę
  const [narrow, setNarrow] = useState(() => window.innerWidth < 760);
  useEffect(() => {
    const fn = () => setNarrow(window.innerWidth < 760);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  const hp = liveMob?.zycie ?? mob.zycie;
  const hpMax = liveMob?.zycie_max ?? mob.zycie_max;
  const dead = hp <= 0;
  const pct = hpMax > 0 ? Math.min(100, Math.max(0, (hp / hpMax) * 100)) : 0;
  const typ = PATTERN[mob.pattern] || 'Zwykły';
  const kraty = dist == null ? null : dist === 1 ? '1 krata' : dist < 5 ? `${dist} kraty` : `${dist} krat`;

  return (
    <div style={{
      position: 'absolute', top: narrow ? 'calc(env(safe-area-inset-top, 0px) + 208px)' : 10, left: '50%', transform: 'translateX(-50%)', zIndex: 55,
      width: 'min(330px, calc(100vw - 24px))', pointerEvents: 'all',
      background: 'linear-gradient(180deg,#1b1712,#0c0a08)',
      border: `1px solid ${G.gold}`, borderRadius: 5,
      boxShadow: '0 0 0 1px #000, 0 14px 34px rgba(0,0,0,0.75)',
      fontFamily: "'Trebuchet MS', Verdana, sans-serif",
    }}>
      <div style={{ display: 'flex', gap: 12, padding: '12px 12px 10px' }}>
        {/* Portret */}
        <div style={{
          width: 58, height: 66, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 4,
          background: `radial-gradient(ellipse at 50% 80%, ${dead ? 'rgba(90,90,90,0.2)' : 'rgba(229,98,76,0.25)'}, #0b0907 72%)`,
          border: `1px solid ${dead ? '#4a453c' : '#a8503c'}`,
        }}>
          <span style={{
            width: mob.szerokosc || 32, height: mob.dlugosc || 40, imageRendering: 'pixelated',
            backgroundImage: `url(/assets/${mob.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat',
            transform: 'scale(1.15)', opacity: dead ? 0.45 : 1, filter: dead ? 'grayscale(1)' : 'none',
          }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontFamily: G.serif, fontSize: 17, color: dead ? G.muted : '#ff9b7b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {mob.nazwa}{dead && <span style={{ color: G.dim, fontSize: 13 }}> (pokonany)</span>}
              </div>
              <div style={{ color: G.muted, fontSize: 12.5, marginTop: 1 }}>Poziom {mob.poziom}</div>
            </div>
            <button onClick={onClose} aria-label="Odznacz" style={{
              width: 26, height: 26, flexShrink: 0, borderRadius: 3, cursor: 'pointer',
              background: 'rgba(0,0,0,0.35)', border: `1px solid ${G.bronze}`, color: G.gold, fontSize: 13, lineHeight: 1,
            }}>✕</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 7, fontSize: 12, flexWrap: 'wrap' }}>
            <span style={{ color: G.muted }}>Typ: <span style={{ color: G.text }}>{typ}</span></span>
            {kraty && <span style={{ color: G.muted }}>📍 Dystans: <span style={{ color: dist <= 1 ? '#9be8ac' : G.text }}>{kraty}</span></span>}
          </div>
          {mob.obr_min > 0 && (
            <div style={{ color: G.dim, fontSize: 11.5, marginTop: 3 }}>
              Atak {mob.obr_min}–{mob.obr_max || mob.obr_min}{mob.ac > 0 ? ` · Obrona ${mob.ac}` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Życie — pasek z segmentami */}
      <div style={{ padding: '0 12px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
          <span style={{ color: G.muted, letterSpacing: 1 }}>ŻYCIE</span>
          <span style={{ color: dead ? G.dim : '#8fb8ff' }}>{hp} / {hpMax}</span>
        </div>
        <div style={{
          position: 'relative', height: 14, borderRadius: 3, overflow: 'hidden',
          background: '#08070a', border: '1px solid #000', boxShadow: `0 0 0 1px ${G.bronze}66, inset 0 2px 5px rgba(0,0,0,0.9)`,
        }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: dead ? '#3a3a3a' : 'linear-gradient(180deg,#5fd07a,#1f7a3a)',
            boxShadow: dead ? 'none' : '0 0 10px rgba(95,208,122,0.4)', transition: 'width .3s',
          }}>
            <span style={{ display: 'block', height: '45%', background: 'linear-gradient(180deg,rgba(255,255,255,0.28),transparent)' }} />
          </div>
          {/* podziałka */}
          {Array.from({ length: SEGMENTS - 1 }, (_, i) => (
            <span key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${((i + 1) / SEGMENTS) * 100}%`, width: 1, background: 'rgba(0,0,0,0.75)' }} />
          ))}
        </div>
      </div>

      {/* Atak */}
      <div style={{ padding: '0 12px 12px' }}>
        <button onClick={onAttack} disabled={dead} style={{
          width: '100%', padding: '11px', borderRadius: 4, cursor: dead ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: dead ? '#0e0c0a' : 'linear-gradient(180deg,#5a4520,#2d2210)',
          border: `1px solid ${dead ? '#3a3122' : G.gold}`, color: dead ? G.dim : G.goldHi,
          fontFamily: G.serif, fontSize: 16, letterSpacing: 0.5,
          boxShadow: dead ? 'none' : '0 0 14px rgba(231,193,88,0.2), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}>
          <span style={{ fontSize: 17 }}>⚔️</span> {dead ? 'Pokonany' : 'Atakuj'}
        </button>
      </div>
    </div>
  );
}
