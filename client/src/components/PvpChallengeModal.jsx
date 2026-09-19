import { useEffect, useState } from 'react';
import { IconSword, IconX } from '../Icons';

export default function PvpChallengeModal({ challenge, onAccept, onDecline }) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { onDecline(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onDecline]);

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:500,
      background:'rgba(2,4,10,0.75)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div style={{
        width:340, background:'linear-gradient(160deg, rgba(10,16,7,0.99), rgba(2,6,14,0.99))',
        border:'1px solid rgba(239,68,68,0.4)', borderRadius:10,
        boxShadow:'0 0 60px rgba(239,68,68,0.15), 0 12px 40px rgba(0,0,0,0.8)',
        padding:'20px 20px 16px',
        fontFamily:'Verdana,sans-serif',
        textAlign:'center',
      }}>
        {/* Icon */}
        <div style={{ color:'#EF4444', display:'flex', justifyContent:'center', marginBottom:10 }}>
          <IconSword size={28} />
        </div>

        <div style={{ color:'#F87171', fontWeight:'bold', fontSize:13, letterSpacing:1, marginBottom:6 }}>
          WYZWANIE PvP!
        </div>

        <div style={{ color:'#E8D070', fontSize:12, marginBottom:4 }}>
          <span style={{ color:'#FCD34D', fontWeight:'bold' }}>{challenge.challengerName}</span>
          <span style={{ color:'#7A8A5A' }}> (poz.{challenge.challengerLevel})</span>
        </div>
        <div style={{ color:'#7A8A5A', fontSize:10, marginBottom:16 }}>wyzwał Cię do walki!</div>

        {/* Timer bar */}
        <div style={{ height:4, background:'rgba(0,0,0,0.5)', borderRadius:2, marginBottom:16, overflow:'hidden' }}>
          <div style={{
            height:'100%', width:`${(timeLeft/30)*100}%`,
            background:'linear-gradient(to right, #EF4444, #F87171)',
            borderRadius:2, transition:'width 1s linear',
          }} />
        </div>
        <div style={{ color:'#5A6840', fontSize:9, marginBottom:14 }}>Automatyczna odmowa za {timeLeft}s</div>

        <div style={{ display:'flex', gap:10 }}>
          <button
            onClick={onAccept}
            style={{
              flex:1, padding:'10px',
              background:'linear-gradient(135deg, rgba(220,38,38,0.35), rgba(127,29,29,0.35))',
              color:'#FCA5A5', border:'1px solid rgba(239,68,68,0.5)',
              borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:'bold',
            }}
          >
            <IconSword size={11} /> Walcz!
          </button>
          <button
            onClick={onDecline}
            style={{
              flex:1, padding:'10px',
              background:'rgba(15,32,64,0.5)',
              color:'#7A8A5A', border:'1px solid rgba(59,130,246,0.2)',
              borderRadius:6, cursor:'pointer', fontSize:12,
            }}
          >
            <IconX size={11} /> Odmów
          </button>
        </div>
      </div>
    </div>
  );
}
