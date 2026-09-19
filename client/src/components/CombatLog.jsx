import { useEffect, useRef, useState } from 'react';
import { T } from '../theme';
import { IconSword } from '../Icons';

const ENTRY = {
  hit:          { sym:'†',  color:'#E8D070', bg:'rgba(200,150,32,0.06)' },
  crit:         { sym:'!!', color:'#FDE047', bg:'rgba(250,200,0,0.06)'  },
  miss:         { sym:'–',  color:'#5A6840', bg:'transparent'            },
  dodge:        { sym:'◌',  color:'#818CF8', bg:'rgba(129,140,248,0.05)' },
  mob_dead:     { sym:'★',  color:'#4ADE80', bg:'rgba(34,197,94,0.06)'  },
  hero_dead:    { sym:'✗',  color:'#EF4444', bg:'rgba(239,68,68,0.06)'  },
  pvp_win:      { sym:'★',  color:'#FCD34D', bg:'rgba(250,200,80,0.06)' },
  pvp_loss:     { sym:'✗',  color:'#EF4444', bg:'rgba(239,68,68,0.06)'  },
  heal:         { sym:'+',  color:'#4ADE80', bg:'rgba(34,197,94,0.06)'  },
  defend:       { sym:'▣',  color:'#C8940A', bg:'rgba(200,150,32,0.05)' },
  start:        { sym:'►',  color:'#C8940A', bg:'rgba(200,150,32,0.08)' },
  flee_success: { sym:'→',  color:'#4ADE80', bg:'rgba(34,197,94,0.04)'  },
  flee_fail:    { sym:'✗',  color:'#EF4444', bg:'rgba(239,68,68,0.04)'  },
  skill_use:    { sym:'✦',  color:'#A5B4FC', bg:'rgba(129,140,248,0.06)' },
  buff:         { sym:'▲',  color:'#86EFAC', bg:'rgba(134,239,172,0.05)' },
  debuff:       { sym:'▼',  color:'#F87171', bg:'rgba(248,113,113,0.05)' },
};

function fmt(e) {
  switch(e.type) {
    case 'hit':          return `${e.actor} trafia za ${e.dmg} pkt`;
    case 'crit':         return `${e.actor} KRYTYK! ×${e.dmg} pkt`;
    case 'miss':         return `${e.actor} chybia`;
    case 'dodge':        return `${e.actor} unika!`;
    case 'defend':       return `${e.actor} przyjmuje postawę obronną`;
    case 'mob_dead':     return `${e.mob} poległ! +${e.exp} EXP`;
    case 'hero_dead':    return 'Zginąłeś! Respawn...';
    case 'pvp_win':      return `${e.loser} pokonany w PvP!`;
    case 'pvp_loss':     return 'Przegrana w PvP';
    case 'heal':         return `${e.actor} leczy ${e.amount} HP`;
    case 'flee_success': return 'Ucieczka udana!';
    case 'flee_fail':    return 'Ucieczka nieudana!';
    case 'skill_use':    return `${e.actor} używa: ${e.skill}`;
    case 'buff':         return e.text || 'Wzmocnienie aktywne';
    case 'debuff':       return e.text || 'Osłabienie aktywne';
    default:             return e.text || e.type;
  }
}

export default function CombatLog({ entries }) {
  const ref = useRef(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!collapsed) ref.current?.lastElementChild?.scrollIntoView({ behavior:'smooth' });
  }, [entries, collapsed]);

  if (!entries.length) return null;

  const last = entries[entries.length-1];
  const lastS = ENTRY[last.type] || { sym:'·', color:T.textMuted };

  return (
    <div style={{
      position:'absolute', top:8, left:8, width:collapsed?160:220, zIndex:55,
      background:'linear-gradient(160deg, rgba(10,16,7,0.96), rgba(6,10,4,0.96))',
      border:'1px solid rgba(200,150,32,0.28)',
      borderRadius:6,
      overflow:'hidden',
      boxShadow:'0 4px 20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(232,192,48,0.06)',
      transition:'width 0.2s ease',
    }}>
      {/* Header */}
      <button onClick={() => setCollapsed(c=>!c)} style={{
        display:'flex', alignItems:'center', gap:6, width:'100%',
        padding:'4px 8px',
        background:'linear-gradient(90deg, rgba(74,122,42,0.12), transparent)',
        border:'none', borderBottom:'1px solid rgba(200,150,32,0.15)',
        cursor:'pointer', textAlign:'left',
      }}>
        <span style={{ color:'#1E4A6A', display:'flex', alignItems:'center' }}><IconSword size={10}/></span>
        <span style={{ fontSize:8, fontWeight:'bold', letterSpacing:'1.5px', textTransform:'uppercase', color:'#1E4A6A', flex:1 }}>
          Log walki
        </span>
        {collapsed ? (
          <span style={{ color: lastS.color, fontSize:10, fontWeight:'bold' }}>{lastS.sym} {fmt(last).slice(0,14)}</span>
        ) : (
          <span style={{ color:'#3A4828', fontSize:8 }}>▲</span>
        )}
        <span style={{ color:'#3A4828', fontSize:8 }}>{collapsed?'▼':'▲'}</span>
      </button>

      {/* Entries */}
      {!collapsed && (
        <div ref={ref} style={{
          maxHeight:200, overflowY:'auto',
          display:'flex', flexDirection:'column',
        }}>
          {entries.slice(-24).map((e, i) => {
            const s = ENTRY[e.type] || { sym:'·', color:T.textMuted, bg:'transparent' };
            const text = fmt(e);
            return (
              <div key={e.key||i} style={{
                display:'flex', alignItems:'center', gap:4,
                padding:'2px 8px',
                background: s.bg,
                borderBottom:'1px solid rgba(200,150,32,0.04)',
                animation: i === entries.length-1 ? 'logIn 0.2s ease' : 'none',
              }}>
                <span style={{
                  flexShrink:0, width:14, textAlign:'center',
                  fontSize:10, fontWeight:'bold', color:s.color,
                  textShadow:`0 0 6px ${s.color}60`,
                }}>
                  {s.sym}
                </span>
                <span style={{ color: s.color, fontSize:9, lineHeight:1.5, opacity:0.9 }}>{text}</span>
              </div>
            );
          })}
          {/* Spacer at bottom */}
          <div style={{ height:2 }} />
        </div>
      )}

      <style>{`
        @keyframes logIn { from{opacity:0;transform:translateX(6px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  );
}
