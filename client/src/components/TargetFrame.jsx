import { T } from '../theme';
import { IconSword, IconX } from '../Icons';

export default function TargetFrame({ mob, liveMob, onAttack, onClose }) {
  const hp    = liveMob?.zycie    ?? mob.zycie;
  const hpMax = liveMob?.zycie_max ?? mob.zycie_max;
  const dead  = hp <= 0;
  const pct   = hpMax > 0 ? Math.min(1, Math.max(0, hp/hpMax)) : 0;
  const hpColor = pct > 0.5 ? '#22C55E' : pct > 0.25 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{
      position:'absolute', top:8, left:'50%', transform:'translateX(-50%)',
      width:230, zIndex:55,
      background:'linear-gradient(160deg, rgba(10,16,7,0.96), rgba(3,6,14,0.96))',
      border:'1px solid rgba(200,150,32,0.35)',
      borderRadius:6,
      boxShadow:'0 4px 20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(232,192,48,0.08)',
      pointerEvents:'all',
    }}>
      {/* Header bar */}
      <div style={{
        display:'flex', alignItems:'center', gap:6,
        padding:'5px 8px 4px',
        background:'linear-gradient(90deg, rgba(74,122,42,0.2), transparent)',
        borderBottom:'1px solid rgba(200,150,32,0.15)',
      }}>
        {/* Mob sprite */}
        <div style={{
          width:28, height:36, flexShrink:0,
          backgroundImage:`url(/assets/${mob.obrazek})`,
          backgroundPosition:'0 0', backgroundRepeat:'no-repeat', imageRendering:'pixelated',
          border:'1px solid rgba(200,150,32,0.25)', borderRadius:2,
          background: `rgba(8,13,5,0.6) url(/assets/${mob.obrazek}) 0 0 no-repeat`,
          opacity: dead ? 0.4 : 1,
          filter: dead ? 'grayscale(1)' : 'none',
        }} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color: dead ? '#7A8A5A' : '#F0A060', fontWeight:'bold', fontSize:11, lineHeight:1.2 }}>
            {mob.nazwa}
            {dead && <span style={{ color:'#5A6840', fontSize:9, fontWeight:'normal' }}> (martwy)</span>}
          </div>
          <div style={{ color:'#5A6840', fontSize:9 }}>Poziom {mob.poziom}</div>
          {mob.obr_min > 0 && (
            <div style={{ color:'#3A4828', fontSize:8 }}>
              ATK {mob.obr_min}–{mob.obr_max||mob.obr_min}
              {mob.ac > 0 && ` · AC ${mob.ac}`}
            </div>
          )}
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'#3A4828', cursor:'pointer', display:'flex', alignItems:'center', flexShrink:0 }}>
          <IconX size={12}/>
        </button>
      </div>

      {/* HP bar */}
      <div style={{ padding:'6px 8px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:8, color:'#5A6840', marginBottom:3 }}>
          <span>ŻYCIE</span>
          <span style={{ color: dead ? '#5A6840' : '#7FA8CC' }}>
            {dead ? 'Respawn...' : `${hp}/${hpMax}`}
          </span>
        </div>
        <div style={{
          height:12, background:'rgba(0,0,0,0.6)',
          border:'1px solid rgba(0,0,0,0.5)',
          borderRadius:2, overflow:'hidden', position:'relative',
        }}>
          <div style={{
            width:`${pct*100}%`, height:'100%',
            background:`linear-gradient(to bottom, ${hpColor}dd, ${hpColor}99)`,
            transition:'width 0.4s ease',
            boxShadow:`inset 0 1px 0 rgba(255,255,255,0.2)`,
          }} />
          {/* Tick marks */}
          {[25,50,75].map(p => (
            <div key={p} style={{ position:'absolute', top:0, bottom:0, left:`${p}%`, width:1, background:'rgba(0,0,0,0.35)' }} />
          ))}
        </div>
      </div>

      {/* Attack button */}
      {!dead && (
        <div style={{ padding:'0 8px 6px' }}>
          <button onClick={onAttack} style={{
            width:'100%', padding:'5px',
            display:'flex', alignItems:'center', justifyContent:'center', gap:5,
            background:'linear-gradient(135deg, rgba(74,122,42,0.3), rgba(15,32,64,0.3))',
            border:'1px solid rgba(200,150,32,0.4)',
            borderRadius:3, cursor:'pointer',
            color:'#E8D070', fontSize:11, fontWeight:'bold',
          }}>
            <IconSword size={12}/> Atakuj
          </button>
        </div>
      )}
    </div>
  );
}
