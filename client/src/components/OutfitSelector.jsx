import { useState, useEffect } from 'react';
import { IconTunic, IconLock } from '../Icons';
import { api } from '../api';
import { IconX, IconCheck } from '../Icons';

export default function OutfitSelector({ postac, onClose, onChanged }) {
  const [outfits, setOutfits] = useState([]);
  const [locked,  setLocked]  = useState([]);
  const [flash,   setFlash]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.character.outfits().then(r => {
      if (r.outfits) { setOutfits(r.outfits); setLocked(r.locked||[]); }
    });
  }, []);

  const select = async (outfit) => {
    if (outfit.current) return;
    setLoading(true);
    try {
      const r = await api.character.setOutfit(outfit.id);
      if (r.ok) {
        setFlash(`Zmieniono wygląd na: ${outfit.label}`);
        setOutfits(p => p.map(o => ({ ...o, current: o.id === outfit.id })));
        onChanged?.(r.sprite);
        setTimeout(() => setFlash(''), 3000);
      } else {
        setFlash(r.error || 'Błąd');
        setTimeout(() => setFlash(''), 3000);
      }
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.78)',
      backdropFilter:'blur(4px)', display:'flex', alignItems:'center',
      justifyContent:'center', zIndex:300,
    }}>
      <div style={{
        width:480, maxWidth:'95vw',
        background:'linear-gradient(160deg, rgba(26,21,16,0.99), rgba(14,12,9,0.99))',
        border:'1px solid rgba(200,150,32,0.3)', borderRadius:10,
        overflow:'hidden',
        boxShadow:'0 12px 60px rgba(0,0,0,0.9), inset 0 1px 0 rgba(200,150,32,0.06)',
        fontFamily:'"Palatino Linotype",Palatino,serif',
      }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', background:'rgba(14,12,9,0.6)', borderBottom:'1px solid rgba(200,150,32,0.15)' }}>
          <span style={{ color:'#C8940A', display:'flex' }}><IconTunic size={15} /></span>
          <span style={{ color:'#f7e3a4', fontWeight:'bold', fontSize:13 }}>Wybór Wyglądu Postaci</span>
          <span style={{ color:'#6b6456', fontSize:10, marginLeft:4 }}>poz. {postac.poziom} · {postac.profesja}</span>
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', color:'#6b6456', cursor:'pointer' }}>
            <IconX size={16}/>
          </button>
        </div>

        {flash && (
          <div style={{ padding:'6px 16px', fontSize:10, color:'#e7c158', background:'rgba(58,45,20,0.6)', borderBottom:'1px solid rgba(231,193,88,0.2)' }}>
            ✦ {flash}
          </div>
        )}

        <div style={{ padding:'16px' }}>
          {/* Available outfits */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:9, color:'#9a9182', letterSpacing:'2px', textTransform:'uppercase', marginBottom:10 }}>Dostępne wyglądy</div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {outfits.map(outfit => (
                <div
                  key={outfit.id}
                  onClick={() => !loading && select(outfit)}
                  style={{
                    padding:'12px 14px', borderRadius:8, cursor: outfit.current ? 'default' : 'pointer',
                    background: outfit.current
                      ? 'linear-gradient(160deg, rgba(231,193,88,0.2), rgba(58,45,20,0.8))'
                      : 'rgba(26,21,16,0.7)',
                    border:`1px solid ${outfit.current ? 'rgba(200,150,32,0.5)' : 'rgba(200,150,32,0.15)'}`,
                    display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                    minWidth:100,
                    transition:'all 0.15s',
                    boxShadow: outfit.current ? '0 0 16px rgba(200,150,32,0.12)' : 'none',
                  }}
                >
                  <div style={{ position:'relative' }}>
                    <div style={{
                      width:32, height:48,
                      backgroundImage:`url(/assets/${outfit.sprite})`,
                      backgroundPosition:'0 0', backgroundRepeat:'no-repeat', imageRendering:'pixelated',
                      filter: outfit.current ? 'drop-shadow(0 0 6px rgba(200,150,32,0.7))' : 'none',
                    }} />
                    {outfit.current && (
                      <div style={{ position:'absolute', top:-6, right:-6, width:16, height:16, background:'#27AE60', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 6px rgba(39,174,96,0.5)' }}>
                        <IconCheck size={9}/>
                      </div>
                    )}
                  </div>
                  <div style={{ color: outfit.current ? '#f7e3a4' : '#9a9182', fontSize:10, fontWeight: outfit.current ? 'bold' : 'normal', textAlign:'center' }}>
                    {outfit.label}
                  </div>
                  {outfit.current && (
                    <div style={{ fontSize:8, color:'#e7c158', letterSpacing:'0.5px' }}>Aktywny</div>
                  )}
                </div>
              ))}
              {outfits.length === 0 && <div style={{ color:'#6b6456', fontSize:11, fontStyle:'italic' }}>Ładowanie...</div>}
            </div>
          </div>

          {/* Locked outfits */}
          {locked.length > 0 && (
            <div>
              <div style={{ fontSize:9, color:'#6b6456', letterSpacing:'2px', textTransform:'uppercase', marginBottom:10 }}>Zablokowane wyglądy</div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {locked.map(outfit => (
                  <div key={outfit.id} style={{
                    padding:'12px 14px', borderRadius:8,
                    background:'rgba(14,12,9,0.5)',
                    border:'1px solid rgba(200,150,32,0.06)',
                    display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                    minWidth:100, opacity:0.5,
                  }}>
                    <div style={{
                      width:32, height:48,
                      backgroundImage:`url(/assets/${outfit.sprite})`,
                      backgroundPosition:'0 0', backgroundRepeat:'no-repeat', imageRendering:'pixelated',
                      filter:'grayscale(1) brightness(0.4)',
                    }} />
                    <div style={{ color:'#6b6456', fontSize:10, textAlign:'center' }}>{outfit.label}</div>
                    <div style={{ fontSize:8, color:'#5e584c' }}><IconLock size={9} /> poz. {outfit.minLevel}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
