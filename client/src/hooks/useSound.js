import { useRef, useCallback, useEffect, useState } from 'react';

// Procedural sound synthesis via Web Audio API — no audio files needed
let _ctx = null;
function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function playTone(freq, type, duration, vol, attack = 0.01, decay = 0) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + attack);
    if (decay > 0) gain.gain.setTargetAtTime(0, ctx.currentTime + attack, decay);
    else           gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.05);
  } catch(_) {}
}

function playNoise(duration, vol) {
  try {
    const ctx = getCtx();
    const buf  = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    const src  = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    src.buffer = buf;
    filt.type  = 'bandpass';
    filt.frequency.value = 400;
    src.connect(filt);
    filt.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    src.start();
  } catch(_) {}
}

const SOUNDS = {
  hit:      () => { playTone(220, 'square', 0.08, 0.15, 0.005, 0.02); playNoise(0.04, 0.1); },
  crit:     () => { playTone(440, 'sawtooth', 0.12, 0.22, 0.003, 0.03); playTone(660, 'sine', 0.1, 0.12, 0.005, 0.02); },
  heal:     () => { [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.18, 0.1, 0.01, 0.04), i * 60)); },
  mobDeath: () => { [330, 220, 165].forEach((f, i) => setTimeout(() => playTone(f, 'triangle', 0.15, 0.12, 0.005, 0.04), i * 80)); },
  levelUp:  () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.3, 0.18, 0.01, 0.05), i * 100)); },
  flee:     () => { playTone(330, 'sine', 0.12, 0.1, 0.005, 0.05); playTone(262, 'sine', 0.1, 0.08, 0.005, 0.04); },
  questDone:() => { [392, 523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.25, 0.15, 0.01, 0.06), i * 90)); },
};

export function useSound() {
  const [muted, setMuted] = useState(() => localStorage.getItem('sound_muted') === 'true');
  const mutedRef = useRef(muted);

  useEffect(() => { mutedRef.current = muted; localStorage.setItem('sound_muted', muted); }, [muted]);

  const play = useCallback((name) => {
    if (mutedRef.current) return;
    SOUNDS[name]?.();
  }, []);

  const toggleMute = useCallback(() => setMuted(m => !m), []);

  return { play, muted, toggleMute };
}
