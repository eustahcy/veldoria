import { useState, useEffect } from 'react';

const RAIN_CSS = `
@keyframes mglaDryf { from { transform: translateX(-6%); } to { transform: translateX(6%); } }

@keyframes rainFall {
  0%   { transform: translateY(-10px); opacity: 0; }
  10%  { opacity: 0.7; }
  90%  { opacity: 0.5; }
  100% { transform: translateY(100vh); opacity: 0; }
}
@keyframes lightningFlash {
  0%, 89%, 91%, 93%, 100% { opacity: 0; }
  90%, 92%                 { opacity: 0.85; }
}
`;

function RainDrop({ style }) {
  return (
    <div style={{
      position: 'absolute',
      width: 1,
      height: 14,
      background: 'rgba(140,190,255,0.55)',
      borderRadius: 1,
      animation: `rainFall ${style.duration}s linear ${style.delay}s infinite`,
      left: style.left,
      top: -20,
    }} />
  );
}

const RAIN_DROPS = Array.from({ length: 60 }, (_, i) => ({
  left: `${(i * 1.67) % 100}%`,
  duration: 0.6 + (i % 5) * 0.08,
  delay: -(i * 0.11) % 1,
}));

const STARS = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 3.7 + 2) % 98}%`,
  top:  `${(i * 4.1 + 5) % 45}%`,
  size: i % 3 === 0 ? 2 : 1,
  opacity: 0.5 + (i % 4) * 0.12,
}));

export default function WorldOverlay({ pora, pogoda }) {
  const [lightning, setLightning] = useState(false);

  // Burza: random lightning flashes
  useEffect(() => {
    if (pogoda !== 'burza') return;
    let timer;
    function scheduleNext() {
      const delay = 8000 + Math.random() * 18000;
      timer = setTimeout(() => {
        setLightning(true);
        setTimeout(() => { setLightning(false); scheduleNext(); }, 400);
      }, delay);
    }
    scheduleNext();
    return () => clearTimeout(timer);
  }, [pogoda]);

  // Base overlay by pora
  let poraBg = null;
  if (pora === 'noc')               poraBg = 'rgba(8,14,46,0.28)';
  else if (pora === 'swit' || pora === 'zmierzch') poraBg = 'rgba(110,58,8,0.17)';
  // dzien = no overlay

  // Weather overlay
  let weatherBg = null;
  let weatherFilter = undefined;
  if (pogoda === 'deszcz' || pogoda === 'burza') weatherBg = 'rgba(30,60,100,0.18)';
  // Mgła bez rozmywania obrazu: rozmycie całego ekranu zjadało detale kafli
  // i sprite'ów, zwłaszcza na telefonach (3 piksele na punkt).
  if (pogoda === 'mgla') weatherBg = 'rgba(206,214,230,0.16)';

  const hasOverlay = poraBg || weatherBg || pora === 'noc' || pogoda === 'burza' || pogoda === 'mgla';
  if (!hasOverlay) return null;

  return (
    <>
      <style>{RAIN_CSS}</style>
      {/* Pora overlay */}
      {poraBg && (
        <div style={{
          position: 'absolute', inset: 0,
          background: poraBg,
          pointerEvents: 'none', zIndex: 28,
        }} />
      )}

      {/* Stars at night */}
      {pora === 'noc' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 29 }}>
          {STARS.map((s, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: s.left, top: s.top,
              width: s.size, height: s.size,
              borderRadius: '50%',
              background: '#fff',
              opacity: s.opacity,
            }} />
          ))}
        </div>
      )}

      {/* Rain */}
      {(pogoda === 'deszcz' || pogoda === 'burza') && (
        <div style={{
          position: 'absolute', inset: 0,
          background: weatherBg,
          pointerEvents: 'none', zIndex: 30,
          overflow: 'hidden',
        }}>
          {RAIN_DROPS.map((d, i) => <RainDrop key={i} style={d} />)}
        </div>
      )}

      {/* Mgła — welon i dwie przesuwające się smugi zamiast rozmycia */}
      {pogoda === 'mgla' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: weatherBg }} />
          <div style={{
            position: 'absolute', left: '-50%', top: '10%', width: '200%', height: '45%',
            background: 'radial-gradient(ellipse at 30% 50%, rgba(226,233,244,0.30), transparent 62%),' +
                        'radial-gradient(ellipse at 72% 40%, rgba(226,233,244,0.24), transparent 58%)',
            animation: 'mglaDryf 46s linear infinite',
          }} />
          <div style={{
            position: 'absolute', left: '-50%', top: '48%', width: '200%', height: '50%',
            background: 'radial-gradient(ellipse at 55% 50%, rgba(214,224,240,0.26), transparent 60%),' +
                        'radial-gradient(ellipse at 18% 60%, rgba(214,224,240,0.20), transparent 55%)',
            animation: 'mglaDryf 68s linear infinite reverse',
          }} />
        </div>
      )}

      {/* Lightning flash */}
      {lightning && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(200,220,255,0.85)',
          pointerEvents: 'none', zIndex: 31,
          animation: 'lightningFlash 0.4s ease-out forwards',
        }} />
      )}
    </>
  );
}
