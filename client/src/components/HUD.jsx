import { T } from '../theme';
import { IconHeart, IconSword, IconShield, IconZap, IconRun, IconBrain, IconCoin, IconLogout } from '../Icons';

const BAR_W = 140;

function fmtNum(n) {
  n = Number(n) || 0;
  if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
  return String(n);
}

function expThresholds(lvl) {
  const e1 = lvl > 1 ? Math.pow(lvl-1,4)+10 : 0;
  const e2 = Math.pow(lvl,4)+10;
  return { e1, e2 };
}

function OrnateBar({ value, max, colorA, label, icon, w = BAR_W, h = 12 }) {
  const pct = max > 0 ? Math.min(1, Math.max(0, value/max)) : 0;
  const low = pct < 0.3;
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:8, color:T.textMuted, marginBottom:2, alignItems:'center', gap:4 }}>
        <span style={{ display:'flex', alignItems:'center', gap:3, color: low ? colorA : T.textMuted }}>{icon}{label}</span>
        <span style={{ color:T.text, fontWeight:'bold', fontSize:9 }}>{fmtNum(value)}<span style={{ color:T.textDim }}>/{fmtNum(max)}</span></span>
      </div>
      <div style={{ width:w, height:h, background:'rgba(0,0,0,0.65)', borderRadius:2, border:'1px solid rgba(0,0,0,0.8)', overflow:'hidden', boxShadow:'inset 0 1px 3px rgba(0,0,0,0.6)', position:'relative' }}>
        <div style={{
          position:'absolute', inset:0, opacity:0.12,
          backgroundImage:'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.06) 10px, rgba(255,255,255,0.06) 11px)'
        }} />
        <div style={{
          width:`${pct*100}%`, height:'100%',
          background:`linear-gradient(to bottom, ${colorA}f0 0%, ${colorA}b0 50%, ${colorA}d0 100%)`,
          transition:'width 0.3s ease', position:'relative',
          boxShadow:`inset 0 1px 0 rgba(255,255,255,0.2)`,
        }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'40%', background:'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)' }} />
        </div>
        {[25,50,75].map(p => <div key={p} style={{ position:'absolute', top:0, bottom:0, left:`${p}%`, width:1, background:'rgba(0,0,0,0.35)' }} />)}
      </div>
    </div>
  );
}

function StatChip({ icon, value, title, color }) {
  return (
    <div title={title} style={{
      display:'flex', alignItems:'center', gap:4,
      background:'rgba(0,0,0,0.45)', borderRadius:3, padding:'3px 8px',
      border:`1px solid rgba(200,146,42,0.2)`,
    }}>
      <span style={{ color: color || T.textMuted, display:'flex', alignItems:'center' }}>{icon}</span>
      <span style={{ fontSize:10, color:T.text, fontWeight:'bold' }}>{value}</span>
    </div>
  );
}

function getPoraIcon(pora, pogoda) {
  const weatherIcons = { deszcz:'🌧', mgla:'🌫', burza:'⛈' };
  const poraIcons    = { dzien:'☀️', swit:'🌅', zmierzch:'🌅', noc:'🌙' };
  const w = weatherIcons[pogoda] || '';
  const p = poraIcons[pora] || '☀️';
  return w ? `${p} ${w}` : p;
}

export default function HUD({ postac, mapa, isMobile, onLogout, pora, pogoda }) {
  if (!postac) return null;
  const { e1, e2 } = expThresholds(postac.poziom);
  const hpPct = postac.zycie_max > 0 ? postac.zycie/postac.zycie_max : 0;
  const hpColor = hpPct > 0.5 ? '#C0392B' : hpPct > 0.25 ? '#E67E22' : '#8B0000';

  const RANKA = { GameAdmin:['#E74C3C','★ GA'], GameMaster:['#E67E22','✦ GM'], Moderator:['#3498DB','◈ Mod'] };
  const rankInfo = RANKA[postac.ranga];

  if (isMobile) {
    return (
      <>
        <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:100, background:'rgba(8,6,3,0.92)', borderBottom:`1px solid rgba(200,146,42,0.3)`, padding:'5px 10px', pointerEvents:'none' }}>
          <div style={{ display:'flex', gap:10, marginBottom:3, alignItems:'center' }}>
            <OrnateBar value={postac.zycie} max={postac.zycie_max} colorA={hpColor} label="HP" icon={<IconHeart size={9}/>} w={110} h={7} />
            <OrnateBar value={postac.exp-e1} max={e2-e1} colorA='#27AE60' label="EXP" w={90} h={7} />
            <span style={{ fontSize:9, color:T.textMuted, marginLeft:'auto' }}>{mapa?.nazwa}</span>
          </div>
        </div>
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, zIndex:100, height:60,
          background:'linear-gradient(180deg, rgba(16,12,5,0.98), rgba(8,6,3,0.98))',
          borderTop:`1px solid rgba(200,146,42,0.35)`,
          display:'flex', alignItems:'center', padding:'0 10px', gap:10,
        }}>
          <div>
            <div style={{ color:'#F0D080', fontWeight:'bold', fontSize:12 }}>
              {postac.nazwa}
              {rankInfo && <span style={{ marginLeft:6, color:rankInfo[0], fontSize:9 }}>{rankInfo[1]}</span>}
            </div>
            <div style={{ color:T.textMuted, fontSize:9 }}>poz.{postac.poziom} · {postac.profesja}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:3, color:'#E8B84B', fontSize:11, marginLeft:'auto' }}>
            <IconCoin size={11} />{fmtNum(postac.zloto)}
          </div>
          {(pora || pogoda) && (
            <span style={{ fontSize:13, lineHeight:1 }} title={`${pora || ''} · ${pogoda || ''}`}>
              {getPoraIcon(pora, pogoda)}
            </span>
          )}
          <button onClick={onLogout} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 12px', background:'rgba(80,10,10,0.7)', color:'#E57373', border:'1px solid rgba(192,57,43,0.4)', borderRadius:4, cursor:'pointer', fontSize:11 }}>
            <IconLogout size={12} />
          </button>
        </div>
      </>
    );
  }

  // Desktop — bottom HUD bar
  return (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0, zIndex:100, height:88,
      background:'linear-gradient(180deg, rgba(16,12,5,0.98) 0%, rgba(8,6,3,0.98) 100%)',
      borderTop:`1px solid rgba(200,146,42,0.4)`,
      boxShadow:`0 -4px 24px rgba(0,0,0,0.8), inset 0 1px 0 rgba(200,146,42,0.08)`,
      display:'flex', alignItems:'center', padding:'0 18px', gap:18,
    }}>
      {/* Avatar + name */}
      <div style={{ display:'flex', gap:10, alignItems:'center', flexShrink:0 }}>
        <div style={{
          width:42, height:58, position:'relative',
          border:'2px solid rgba(200,146,42,0.5)', borderRadius:3,
          background:'rgba(10,7,3,0.9)',
          boxShadow:'0 0 12px rgba(200,146,42,0.15)',
        }}>
          <div style={{ width:32, height:48, margin:'4px auto 0',
            backgroundImage:`url(/assets/${postac.obrazek})`,
            backgroundPosition:'0 0', backgroundRepeat:'no-repeat', imageRendering:'pixelated',
          }} />
        </div>
        <div>
          <div style={{ color:'#F0D080', fontWeight:'bold', fontSize:13, lineHeight:1.2 }}>{postac.nazwa}</div>
          {rankInfo && <div style={{ color:rankInfo[0], fontSize:9, fontWeight:'bold' }}>{rankInfo[1]}</div>}
          <div style={{ color:T.textMuted, fontSize:9 }}>{postac.profesja}</div>
          <div style={{ color:'#E8B84B', fontSize:10, marginTop:1 }}>
            <span style={{ color:T.textDim }}>poz. </span>{postac.poziom}
          </div>
        </div>
      </div>

      <div style={{ width:1, height:60, background:'rgba(200,146,42,0.2)', flexShrink:0 }} />

      {/* Bars */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
        <OrnateBar value={postac.zycie} max={postac.zycie_max} colorA={hpColor} label="Życie" icon={<IconHeart size={9}/>} w={BAR_W} h={13} />
        <OrnateBar value={postac.exp-e1} max={e2-e1} colorA='#27AE60' label="Doświadczenie" w={BAR_W} h={8} />
      </div>

      <div style={{ width:1, height:60, background:'rgba(200,146,42,0.2)', flexShrink:0 }} />

      {/* Stats */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, maxWidth:230 }}>
        <StatChip icon={<IconSword size={10}/>} value={`${postac.obrazenia_min}–${postac.obrazenia_max}`} title="Obrażenia" color='#C0392B' />
        <StatChip icon={<IconShield size={10}/>} value={postac.ac||0} title="Pancerz (AC)" color='#2471A3' />
        <StatChip icon={<IconZap size={10}/>} value={postac.sila} title="Siła" color='#E67E22' />
        <StatChip icon={<IconRun size={10}/>} value={postac.zrecznosc} title="Zręczność" color='#27AE60' />
        <StatChip icon={<IconBrain size={10}/>} value={postac.intelekt} title="Intelekt" color='#8E44AD' />
        <StatChip icon={<IconCoin size={10}/>} value={fmtNum(postac.zloto)} title="Złoto" color='#E8B84B' />
      </div>

      <div style={{ marginLeft:'auto', textAlign:'right', flexShrink:0 }}>
        <div style={{ color:'#E8B84B', fontSize:12, fontWeight:'bold', display:'flex', alignItems:'center', gap:5, justifyContent:'flex-end' }}>
          {(pora || pogoda) && (
            <span style={{ fontSize:14 }} title={`${pora || ''} · ${pogoda || ''}`}>
              {getPoraIcon(pora, pogoda)}
            </span>
          )}
          {mapa?.nazwa || '...'}
        </div>
        <div style={{ color:T.textMuted, fontSize:10 }}>({postac.x}, {postac.y})</div>
        <button onClick={onLogout} style={{
          marginTop:6, padding:'4px 12px',
          display:'flex', alignItems:'center', gap:5, marginLeft:'auto',
          background:'rgba(80,10,10,0.7)', color:'#E57373',
          border:'1px solid rgba(192,57,43,0.4)', borderRadius:4,
          cursor:'pointer', fontSize:11,
        }}>
          <IconLogout size={11}/> Wyloguj
        </button>
      </div>
    </div>
  );
}
