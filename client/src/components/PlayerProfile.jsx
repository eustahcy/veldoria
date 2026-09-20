// Profil gracza: karta postaci, statystyki, ekwipunek, osiągnięcia, tytuły,
// PvP, gildia i historia. Oprawa jak reszta gry: kamień, brąz i złoto.
import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { hudColors as G } from './hud/GameHud';
import { rarityOf, typeLabel, fmtNum } from '../ui/kit';
import { DOLL, Slot } from './Inventory';

const FONT = "'Trebuchet MS', Verdana, sans-serif";
const RANK_COL = { GameAdmin: '#ff7a68', GameMaster: '#f0a24b', Moderator: '#6fb2ff' };
const GUILD_RANK = { mistrz: 'Mistrz', oficer: 'Oficer', czlonek: 'Członek' };

const fmtTime = (sec) => {
  if (!sec) return '0m';
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('pl-PL') : '—');
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const expInfo = (p) => {
  const l = p.poziom || 1;
  const a = l > 1 ? Math.pow(l - 1, 4) + 10 : 0;
  const b = Math.pow(l, 4) + 10;
  return { pct: b > a ? Math.max(0, Math.min(100, ((p.exp - a) / (b - a)) * 100)) : 0, teraz: Math.max(0, p.exp - a), cel: b - a };
};

// ── Elementy ─────────────────────────────────────────────────────────────────
function Box({ icon, title, children, style, right, pad = 14 }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg,#1a1611,#100d0a)', border: `1px solid ${G.bronze}aa`, borderRadius: 5, minWidth: 0,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 6px 18px rgba(0,0,0,0.35)', ...style,
    }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px 9px', borderBottom: `1px solid ${G.bronze}55` }}>
          <span style={{ fontSize: 17, color: G.gold }}>{icon}</span>
          <span style={{ fontFamily: G.serif, fontSize: 15, color: G.goldHi, flex: 1 }}>{title}</span>
          {right}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}

function Row({ icon, label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 0', fontSize: 13.5, minWidth: 0 }}>
      <span style={{ width: 17, textAlign: 'center', opacity: 0.85 }}>{icon}</span>
      <span style={{ color: G.muted, whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: 'repeating-linear-gradient(90deg, rgba(231,193,88,0.16) 0 2px, transparent 2px 5px)' }} />
      <span style={{ color: color || G.text, fontFamily: G.serif, whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

function Bar({ pct, from, to, height = 12, label }) {
  return (
    <div style={{
      position: 'relative', flex: 1, height, borderRadius: 3, overflow: 'hidden',
      background: '#08070a', border: '1px solid #000', boxShadow: `0 0 0 1px ${G.bronze}55, inset 0 2px 5px rgba(0,0,0,0.9)`,
    }}>
      <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', background: `linear-gradient(180deg,${to},${from})`, boxShadow: `0 0 10px ${to}55`, transition: 'width .3s' }}>
        <span style={{ display: 'block', height: '45%', background: 'linear-gradient(180deg,rgba(255,255,255,0.3),transparent)' }} />
      </div>
      {label && <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: height - 4, color: '#fff', textShadow: '0 1px 2px #000' }}>{label}</span>}
    </div>
  );
}

function Btn({ children, onClick, tone, disabled, style }) {
  const c = tone === 'red' ? ['#ff8b78', '#a8281c', 'linear-gradient(180deg,#3a1410,#1a0907)']
    : tone === 'green' ? ['#9be8ac', '#2f6b3a', 'linear-gradient(180deg,#14301c,#0b1a10)']
      : tone === 'blue' ? ['#9cc9ff', '#2d4d7a', 'linear-gradient(180deg,#15243a,#0b1220)']
        : [G.goldHi, G.gold, 'linear-gradient(180deg,#4a3818,#241a0b)'];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '10px 14px', borderRadius: 3, cursor: disabled ? 'not-allowed' : 'pointer', flex: 1, minWidth: 120,
      background: disabled ? '#0e0c0a' : c[2], border: `1px solid ${disabled ? '#3a3122' : c[1]}`, color: disabled ? G.dim : c[0],
      fontFamily: G.serif, fontSize: 13.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...style,
    }}>{children}</button>
  );
}

const TABS = [
  { id: 'stats', icon: '⚙', label: 'Statystyki' },
  { id: 'eq', icon: '🎒', label: 'Ekwipunek' },
  { id: 'ach', icon: '🏆', label: 'Osiągnięcia' },
  { id: 'titles', icon: '⭐', label: 'Tytuły' },
  { id: 'pvp', icon: '⚔', label: 'PvP' },
  { id: 'guild', icon: '⚜', label: 'Gildia' },
  { id: 'history', icon: '📜', label: 'Historia' },
];

// ── Lalka postaci z założonym zestawem ───────────────────────────────────────
function Doll({ profile, narrow }) {
  const eq = profile.ekwipunek || [];
  const inSlot = (d) => eq.find(i => d.types.includes(i.typ)) || null;
  return (
    <div style={{ display: 'flex', gap: 14, flexDirection: narrow ? 'column' : 'row' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '58px 1fr 58px', gridTemplateRows: 'repeat(4, 58px)', gap: 7, flexShrink: 0 }}>
        {DOLL.map(d => (
          <div key={d.id} style={{ gridColumn: d.col, gridRow: d.row, display: 'grid', placeItems: 'center' }}>
            <Slot item={inSlot(d)} label={d.label} size={58} />
          </div>
        ))}
        <div style={{
          gridColumn: 2, gridRow: '2 / 4', borderRadius: 4, display: 'grid', placeItems: 'center', minWidth: 96,
          background: 'radial-gradient(ellipse at 50% 85%, rgba(231,193,88,0.22), #0b0907 70%)',
          border: `1px solid ${G.bronze}`, boxShadow: 'inset 0 0 18px rgba(0,0,0,0.9)',
        }}>
          <span style={{
            width: 32, height: 48, transform: 'scale(2.2)', imageRendering: 'pixelated',
            backgroundImage: `url(/assets/${profile.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat',
            filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.8))',
          }} />
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: G.goldHi, fontFamily: G.serif, fontSize: 13.5 }}>
          <span>🗃</span> Założony zestaw
        </div>
        {eq.length === 0 && <div style={{ color: G.dim, fontSize: 13 }}>Nic nie założono.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {eq.map(it => {
            const r = rarityOf(it);
            return (
              <div key={it.id} title={typeLabel(it.typ)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '5px 8px', borderRadius: 3,
                background: 'rgba(0,0,0,0.3)', border: `1px solid ${G.bronze}55`,
              }}>
                <span style={{
                  width: 24, height: 24, flexShrink: 0, imageRendering: 'pixelated',
                  backgroundImage: `url(/assets/${it.obrazek})`, backgroundSize: 'contain',
                  backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                }} />
                <span style={{ color: r.color, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.nazwa}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function PlayerProfile({ postacId, myId, onClose, onSendMessage, onChallengePvp, onTradeRequest }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('stats');
  const [flash, setFlash] = useState(null);
  const [bio, setBio] = useState('');
  const [comment, setComment] = useState('');
  const [narrow, setNarrow] = useState(() => window.innerWidth < 900);

  useEffect(() => {
    const fn = () => setNarrow(window.innerWidth < 900);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const load = useCallback(() => {
    api.social.profile(postacId)
      .then(r => { if (r && !r.error) { setProfile(r); setBio(r.opis || ''); } else setProfile(null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [postacId]);
  useEffect(() => { setLoading(true); load(); }, [load]);

  useEffect(() => {
    const on = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [onClose]);

  const msg = (text, ok = true) => { setFlash({ text, ok }); setTimeout(() => setFlash(null), 3000); };
  const isSelf = postacId === myId;

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(3px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: narrow ? 0 : 20, fontFamily: FONT, color: G.text,
  };
  const card = {
    width: 1180, maxWidth: '100%', height: narrow ? '100%' : 'min(900px, 100%)', display: 'flex', flexDirection: 'column',
    background: 'linear-gradient(180deg,#15120e,#0b0907)', border: narrow ? 'none' : `1px solid ${G.gold}`,
    borderRadius: narrow ? 0 : 6, overflow: 'hidden',
    boxShadow: narrow ? 'none' : `0 0 0 1px #000, 0 0 0 4px #120e09, 0 0 0 5px ${G.bronze}, 0 30px 80px rgba(0,0,0,0.9)`,
    paddingTop: narrow ? 'env(safe-area-inset-top, 0px)' : 0, paddingBottom: narrow ? 'env(safe-area-inset-bottom, 0px)' : 0,
  };

  if (loading) return <div style={overlay}><div style={{ ...card, height: 'auto', padding: 40, textAlign: 'center', color: G.muted, fontFamily: G.serif }}>Wczytywanie profilu…</div></div>;
  if (!profile) return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...card, height: 'auto', padding: 30, textAlign: 'center' }}>
        <div style={{ color: '#ff8b78', marginBottom: 16 }}>Nie znaleziono gracza</div>
        <Btn onClick={onClose} style={{ maxWidth: 200, margin: '0 auto' }}>Zamknij</Btn>
      </div>
    </div>
  );

  const exp = expInfo(profile);
  const hpPct = profile.zycie_max > 0 ? (profile.zycie / profile.zycie_max) * 100 : 0;
  const enPct = profile.energia_max > 0 ? (profile.energia / profile.energia_max) * 100 : 0;
  const kd = profile.deaths > 0 ? (profile.kills / profile.deaths).toFixed(2) : (profile.kills > 0 ? '∞' : '0');
  const achPct = profile.osiagniecia_total > 0 ? Math.round((profile.osiagniecia_count / profile.osiagniecia_total) * 100) : 0;
  const rankCol = RANK_COL[profile.ranga];

  const saveBio = async () => {
    const r = await api.social.setBio(bio);
    r?.ok ? msg('Opis zapisany') : msg(r?.error || 'Nie udało się zapisać', false);
  };
  const addFriend = async () => {
    const r = await api.social.addFriend(postacId);
    r?.ok ? msg(`Dodano ${profile.nazwa} do znajomych`) : msg(r?.error || 'Nie udało się', false);
  };
  const sendComment = async () => {
    if (!comment.trim()) return;
    const r = await api.social.addComment(postacId, comment.trim());
    if (r?.ok) { setComment(''); load(); msg('Komentarz dodany'); } else msg(r?.error || 'Nie udało się', false);
  };
  const delComment = async (cid) => {
    const r = await api.social.deleteComment(cid);
    if (r?.ok) setProfile(p => ({ ...p, komentarze: p.komentarze.filter(c => c.id !== cid) }));
  };
  const setTitle = async (id) => {
    const r = id ? await api.character.equipTitle(id) : await api.character.unequipTitle();
    r?.ok || r?.nazwa !== undefined ? (load(), msg('Tytuł zmieniony')) : msg(r?.error || 'Nie udało się', false);
  };

  const twoCol = { display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: '0 22px' };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={card}>
        {/* ── Nagłówek ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: narrow ? '10px 12px' : '14px 20px', flexShrink: 0,
          borderBottom: `1px solid ${G.bronze}`, background: 'linear-gradient(180deg,#1f1a13,#110e0a)',
        }}>
          <span style={{ fontSize: 22 }}>👤</span>
          <span style={{ fontFamily: G.serif, fontSize: narrow ? 16 : 20, color: G.goldHi, letterSpacing: 0.5 }}>Profil gracza</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: profile.zalogowany ? '#5fd07a' : G.dim }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: profile.zalogowany ? '#5fd07a' : '#4a453c', boxShadow: profile.zalogowany ? '0 0 8px #5fd07a' : 'none' }} />
            {profile.zalogowany ? 'Online' : 'Offline'}
          </span>
          <button onClick={onClose} aria-label="Zamknij" style={{
            marginLeft: 'auto', width: 38, height: 38, borderRadius: 3, cursor: 'pointer',
            background: 'rgba(0,0,0,0.35)', border: `1px solid ${G.bronze}`, color: G.goldHi, fontSize: 18,
          }}>✕</button>
        </div>

        {flash && (
          <div style={{ padding: '8px 16px', fontSize: 13, background: flash.ok ? 'rgba(95,208,122,0.1)' : 'rgba(168,40,28,0.15)', color: flash.ok ? '#9be8ac' : '#ff9b8b', borderBottom: `1px solid ${G.bronze}55` }}>
            {flash.ok ? '✓' : '✕'} {flash.text}
          </div>
        )}

        {/* ── Karta postaci ── */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: narrow ? 14 : 24, alignItems: 'flex-start',
          padding: narrow ? '12px' : '16px 20px', borderBottom: `1px solid ${G.bronze}55`, flexShrink: 0,
        }}>
          <div style={{
            width: 96, height: 118, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 4,
            background: 'radial-gradient(ellipse at 50% 85%, rgba(231,193,88,0.22), #0b0907 72%)',
            border: `1px solid ${G.goldDim}`, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.9)',
          }}>
            <span style={{
              width: 32, height: 48, transform: 'scale(1.9)', imageRendering: 'pixelated',
              backgroundImage: `url(/assets/${profile.obrazek})`, backgroundPosition: '0 0', backgroundRepeat: 'no-repeat',
            }} />
          </div>

          <div style={{ minWidth: 190, flex: '1 1 210px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: G.serif, fontSize: 26, color: G.goldHi }}>{profile.nazwa}</span>
              {rankCol && <span title={profile.ranga} style={{ color: rankCol, fontSize: 19 }}>♛</span>}
              {profile.prestige > 0 && <span style={{ color: '#6fb2ff', fontSize: 14, fontFamily: G.serif }}>P{profile.prestige}</span>}
            </div>
            {profile.gildia_nazwa ? (
              <>
                <div style={{ color: '#6fb2ff', fontSize: 14, marginTop: 4 }}>[{profile.gildia_tag}] {profile.gildia_nazwa}</div>
                <div style={{ color: G.muted, fontSize: 13, marginTop: 2 }}>🛡 {GUILD_RANK[profile.gildia_ranga] || profile.gildia_ranga || 'Członek'} gildii</div>
              </>
            ) : <div style={{ color: G.dim, fontSize: 13, marginTop: 4 }}>Bez gildii</div>}
            {profile.tytul_nazwa && <div style={{ color: '#c79bff', fontSize: 13, marginTop: 4 }}>{profile.tytul_ikona} {profile.tytul_nazwa}</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <span style={{ fontFamily: G.serif, fontSize: 20, color: G.text }}>Lv. {profile.poziom}</span>
              <span style={{
                padding: '3px 12px', borderRadius: 999, fontSize: 12.5,
                background: 'linear-gradient(180deg,rgba(168,40,28,0.45),rgba(80,18,12,0.45))',
                border: '1px solid rgba(229,98,76,0.55)', color: '#ffb0a0',
              }}>{profile.profesja}</span>
            </div>
            <div style={{ color: profile.zalogowany ? '#5fd07a' : G.dim, fontSize: 12.5, marginTop: 6 }}>
              📍 {profile.mapa_nazwa || 'Nieznana kraina'} {profile.zalogowany ? `(X: ${profile.x}, Y: ${profile.y})` : ''}
            </div>
          </div>

          <div style={{ flex: '2 1 280px', minWidth: 240 }}>
            {[['❤️', 'HP', hpPct, G.hp, G.hpHi, `${fmtNum(profile.zycie)} / ${fmtNum(profile.zycie_max)}`],
              ['⚡', 'EN', enPct, G.en, G.enHi, `${profile.energia} / ${profile.energia_max}`],
              ['✨', 'EXP', exp.pct, G.exp, G.expHi, `${exp.pct.toFixed(2)}%`]].map(([ic, l, pct, from, to, val]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
                <span style={{ width: 18 }}>{ic}</span>
                <span style={{ width: 30, color: G.muted, fontSize: 12.5 }}>{l}</span>
                <Bar pct={pct} from={from} to={to} />
                <span style={{ width: 110, textAlign: 'right', fontSize: 12.5, color: G.text }}>{val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 10 }}>
              <span style={{ color: G.muted, fontSize: 12.5, whiteSpace: 'nowrap' }}>Do następnego poziomu</span>
              <Bar pct={exp.pct} from="#6b4f14" to={G.gold} height={9} />
              <span style={{ fontSize: 12, color: G.muted, whiteSpace: 'nowrap' }}>{fmtNum(exp.teraz)} / {fmtNum(exp.cel)}</span>
            </div>
          </div>

          {!narrow && (
            <div style={{ flex: '1 1 210px', minWidth: 200, borderLeft: `1px solid ${G.bronze}55`, paddingLeft: 18 }}>
              <Row icon="📅" label="Dołączył" value={fmtDate(profile.data_rejestracji)} />
              <Row icon="⏳" label="Czas gry" value={fmtTime(profile.czas_gry)} />
              <Row icon="🕒" label="Ostatnio" value={profile.zalogowany ? 'teraz' : fmtDateTime(profile.ostatnie_logowanie)} color={profile.zalogowany ? '#9be8ac' : undefined} />
              <Row icon="📍" label="Region" value={profile.mapa_nazwa || '—'} />
            </div>
          )}
        </div>

        {/* ── Zakładki ── */}
        <div style={{ display: 'flex', gap: 4, padding: '8px 10px', borderBottom: `1px solid ${G.bronze}55`, overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none' }}>
          {TABS.map(t => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 3, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                background: on ? 'linear-gradient(180deg,#4a3818,#241a0b)' : 'transparent',
                border: `1px solid ${on ? G.gold : 'transparent'}`, boxShadow: on ? '0 0 12px rgba(231,193,88,0.18)' : 'none',
                color: on ? G.goldHi : G.muted, fontFamily: G.serif, fontSize: 13.5,
              }}>
                <span style={{ fontSize: 15 }}>{t.icon}</span>{t.label}
              </button>
            );
          })}
        </div>

        {/* ── Treść ── */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: narrow ? 12 : '16px 20px' }}>
          {tab === 'stats' && (
            <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: 14, alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
                <Box icon="👤" title="Podstawowe informacje">
                  <div style={twoCol}>
                    <Row icon="📈" label="Poziom" value={profile.poziom} />
                    <Row icon="⚔" label="Zabójstwa" value={fmtNum(profile.kills)} />
                    <Row icon="🛡" label="Klasa" value={profile.profesja} />
                    <Row icon="💀" label="Śmierci" value={fmtNum(profile.deaths)} />
                    <Row icon="⚜" label="Gildia" value={profile.gildia_nazwa || '—'} />
                    <Row icon="⚖" label="K/D" value={kd} />
                    <Row icon="🎖" label="Ranga gildii" value={profile.gildia_nazwa ? (GUILD_RANK[profile.gildia_ranga] || profile.gildia_ranga || 'Członek') : '—'} />
                    <Row icon="👑" label="Bossy" value={fmtNum(profile.boss_kills)} />
                  </div>
                </Box>

                <Box icon="✨" title="Atrybuty">
                  <div style={twoCol}>
                    <Row icon="💪" label="Siła" value={profile.sila ?? '—'} />
                    <Row icon="🧠" label="Inteligencja" value={profile.intelekt ?? '—'} />
                    <Row icon="🏹" label="Zręczność" value={profile.zrecznosc ?? '—'} />
                    <Row icon="🛡" label="Obrona" value={profile.ac ?? '—'} />
                    <Row icon="❤️" label="Życie" value={fmtNum(profile.zycie_max)} />
                    <Row icon="⚔" label="Atak" value={`${profile.obrazenia_min ?? 0} - ${profile.obrazenia_max ?? 0}`} />
                    <Row icon="🎯" label="Celność" value={profile.sa ?? '—'} />
                    <Row icon="🪙" label="Zarobione" value={fmtNum(profile.zloto_zarobione)} />
                  </div>
                </Box>

                <Box icon="🏆" title="Osiągnięcia" right={<button onClick={() => setTab('ach')} style={{ background: 'none', border: `1px solid ${G.bronze}`, borderRadius: 3, color: G.goldHi, cursor: 'pointer', padding: '6px 12px', fontFamily: G.serif, fontSize: 12.5 }}>Zobacz wszystkie</button>}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, fontSize: 13.5 }}>
                    <span style={{ color: G.muted }}>Zdobyte osiągnięcia</span>
                    <span style={{ marginLeft: 'auto', fontFamily: G.serif, color: G.text }}>{profile.osiagniecia_count} / {profile.osiagniecia_total}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Bar pct={achPct} from="#6b4f14" to={G.gold} height={10} />
                    <span style={{ color: G.muted, fontSize: 12.5, width: 42, textAlign: 'right' }}>{achPct}%</span>
                  </div>
                </Box>

                <Box icon="⭐" title="Tytuły" right={isSelf ? <button onClick={() => setTab('titles')} style={{ background: 'none', border: `1px solid ${G.bronze}`, borderRadius: 3, color: G.goldHi, cursor: 'pointer', padding: '6px 12px', fontFamily: G.serif, fontSize: 12.5 }}>Zmień tytuł</button> : null}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13.5 }}>
                    <span style={{ color: G.muted }}>Aktywny tytuł</span>
                    <span style={{
                      marginLeft: 'auto', padding: '4px 14px', borderRadius: 999, fontSize: 13,
                      border: `1px solid ${profile.tytul_nazwa ? '#7c5bb0' : G.bronze}`, color: profile.tytul_nazwa ? '#c79bff' : G.dim,
                      background: profile.tytul_nazwa ? 'rgba(199,155,234,0.1)' : 'transparent',
                    }}>{profile.tytul_nazwa ? `${profile.tytul_ikona || ''} ${profile.tytul_nazwa}` : 'Brak'}</span>
                  </div>
                </Box>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
                <Box icon="👁" title="Wygląd postaci"><Doll profile={profile} narrow={narrow} /></Box>

                <Box icon="📋" title="Informacje dodatkowe">
                  {isSelf ? (
                    <>
                      <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={300} rows={3}
                        placeholder="Napisz kilka słów o sobie…"
                        style={{
                          width: '100%', boxSizing: 'border-box', padding: 11, borderRadius: 3, background: '#0b0907', color: G.text,
                          border: `1px solid ${G.bronze}`, fontSize: 13.5, fontFamily: FONT, resize: 'vertical', outline: 'none',
                        }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                        <span style={{ color: G.dim, fontSize: 12 }}>{bio.length}/300</span>
                        <Btn onClick={saveBio} style={{ flex: 'none', marginLeft: 'auto', minWidth: 140 }}>Zapisz opis</Btn>
                      </div>
                    </>
                  ) : (
                    <div style={{
                      minHeight: 64, padding: 11, borderRadius: 3, background: 'rgba(0,0,0,0.3)', border: `1px solid ${G.bronze}55`,
                      color: profile.opis ? G.text : G.dim, fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                    }}>{profile.opis || 'Ten gracz nie dodał jeszcze opisu.'}</div>
                  )}
                </Box>

                {!isSelf && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Btn tone="green" onClick={addFriend}>+ Dodaj do znajomych</Btn>
                    <Btn tone="blue" onClick={() => onSendMessage?.({ toId: postacId, toName: profile.nazwa })}>✉ Wyślij wiadomość</Btn>
                    {!!profile.zalogowany && <Btn tone="red" onClick={() => { onChallengePvp?.(postacId); onClose(); }}>⚔ Wyzwij na pojedynek</Btn>}
                    {!!profile.zalogowany && <Btn onClick={() => { onTradeRequest?.(postacId); onClose(); }}>🤝 Handluj</Btn>}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'eq' && (
            <Box icon="🎒" title="Założony ekwipunek"><Doll profile={profile} narrow={narrow} /></Box>
          )}

          {tab === 'ach' && (
            <Box icon="🏆" title={`Osiągnięcia (${profile.osiagniecia_count} / ${profile.osiagniecia_total})`}>
              {(profile.osiagniecia || []).length === 0 && <div style={{ color: G.dim, fontSize: 13.5 }}>Brak zdobytych osiągnięć.</div>}
              <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: 8 }}>
                {(profile.osiagniecia || []).map((o, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 11px', borderRadius: 3, background: 'rgba(0,0,0,0.3)', border: `1px solid ${G.bronze}66` }}>
                    <span style={{ fontSize: 22 }}>{o.ikona || '🏆'}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: G.goldHi, fontFamily: G.serif, fontSize: 14 }}>{o.nazwa}</div>
                      <div style={{ color: G.muted, fontSize: 12.5 }}>{o.opis}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', color: G.dim, fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(o.data)}</span>
                  </div>
                ))}
              </div>
            </Box>
          )}

          {tab === 'titles' && (
            <Box icon="⭐" title={`Tytuły (${profile.tytuly_count} / ${profile.tytuly_total})`}>
              {(profile.tytuly || []).length === 0 && <div style={{ color: G.dim, fontSize: 13.5 }}>Brak zdobytych tytułów.</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(profile.tytuly || []).map(t => {
                  const active = t.nazwa === profile.tytul_nazwa;
                  return (
                    <div key={t.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 3,
                      background: active ? 'rgba(199,155,234,0.08)' : 'rgba(0,0,0,0.3)', border: `1px solid ${active ? '#7c5bb0' : G.bronze + '66'}`,
                    }}>
                      <span style={{ fontSize: 20 }}>{t.ikona || '⭐'}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: active ? '#c79bff' : G.text, fontFamily: G.serif, fontSize: 14 }}>{t.nazwa}</div>
                        {t.opis && <div style={{ color: G.muted, fontSize: 12.5 }}>{t.opis}</div>}
                      </div>
                      {isSelf && (
                        <button onClick={() => setTitle(active ? null : t.id)} style={{
                          marginLeft: 'auto', padding: '7px 13px', borderRadius: 3, cursor: 'pointer', whiteSpace: 'nowrap',
                          background: active ? 'transparent' : 'linear-gradient(180deg,#4a3818,#241a0b)',
                          border: `1px solid ${active ? G.bronze : G.gold}`, color: active ? G.muted : G.goldHi, fontFamily: G.serif, fontSize: 12.5,
                        }}>{active ? 'Zdejmij' : 'Załóż'}</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Box>
          )}

          {tab === 'pvp' && (
            <Box icon="⚔" title="Statystyki walki">
              <div style={twoCol}>
                <Row icon="⚔" label="Zabójstwa" value={fmtNum(profile.kills)} color="#ff9b8b" />
                <Row icon="👑" label="Pokonane bossy" value={fmtNum(profile.boss_kills)} />
                <Row icon="💀" label="Śmierci" value={fmtNum(profile.deaths)} />
                <Row icon="🗡" label="Tryb PvP" value={profile.pvp ? 'Włączony' : 'Wyłączony'} color={profile.pvp ? '#ff9b8b' : G.muted} />
                <Row icon="⚖" label="Stosunek K/D" value={kd} color="#f7e3a4" />
                <Row icon="✦" label="Prestiż" value={`P${profile.prestige} (+${profile.prestige_bonus_pct}%)`} color="#6fb2ff" />
              </div>
              <div style={{ marginTop: 12, color: G.dim, fontSize: 12.5 }}>
                Licznik zabójstw obejmuje potwory i graczy — gra nie rozdziela tych statystyk.
              </div>
            </Box>
          )}

          {tab === 'guild' && (
            <Box icon="⚜" title="Gildia">
              {profile.gildia_nazwa ? (
                <div style={twoCol}>
                  <Row icon="⚜" label="Nazwa" value={profile.gildia_nazwa} />
                  <Row icon="🎖" label="Ranga" value={GUILD_RANK[profile.gildia_ranga] || profile.gildia_ranga || 'Członek'} />
                  <Row icon="🏷" label="Tag" value={`[${profile.gildia_tag}]`} color="#6fb2ff" />
                  <Row icon="📅" label="Od" value={fmtDate(profile.gildia_od)} />
                </div>
              ) : <div style={{ color: G.dim, fontSize: 13.5 }}>Ten gracz nie należy do żadnej gildii.</div>}
            </Box>
          )}

          {tab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Box icon="📜" title="Ukończone zadania">
                {(profile.historia || []).length === 0 && <div style={{ color: G.dim, fontSize: 13.5 }}>Brak ukończonych zadań.</div>}
                {(profile.historia || []).map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${G.bronze}33`, fontSize: 13.5 }}>
                    <span style={{ color: G.gold }}>✓</span>
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.quest_nazwa}</span>
                    <span style={{ marginLeft: 'auto', color: G.dim, fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(h.data_ukonczenia)}</span>
                  </div>
                ))}
              </Box>

              <Box icon="💬" title="Komentarze">
                {!isSelf && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendComment()}
                      placeholder="Napisz komentarz…" maxLength={500}
                      style={{ flex: 1, padding: '10px 12px', borderRadius: 3, background: '#0b0907', color: G.text, border: `1px solid ${G.bronze}`, fontSize: 13.5, outline: 'none' }} />
                    <Btn onClick={sendComment} style={{ flex: 'none', minWidth: 110 }}>Wyślij</Btn>
                  </div>
                )}
                {(profile.komentarze || []).length === 0 && <div style={{ color: G.dim, fontSize: 13.5 }}>Brak komentarzy.</div>}
                {(profile.komentarze || []).map(c => (
                  <div key={c.id} style={{ padding: '8px 10px', marginBottom: 6, borderRadius: 3, background: 'rgba(0,0,0,0.3)', border: `1px solid ${G.bronze}55` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                      <span style={{ color: G.goldHi }}>{c.autor_nazwa}</span>
                      <span style={{ marginLeft: 'auto', color: G.dim }}>{fmtDate(c.data)}</span>
                      {(c.autor_postac_id === myId || isSelf) && (
                        <button onClick={() => delComment(c.id)} style={{ background: 'none', border: 'none', color: '#a8281c', cursor: 'pointer', fontSize: 13 }}>✕</button>
                      )}
                    </div>
                    <div style={{ color: G.text, fontSize: 13.5, marginTop: 3 }}>{c.tresc}</div>
                  </div>
                ))}
              </Box>
            </div>
          )}
        </div>

        {/* ── Stopka z akcjami (na telefonie i poza zakładką Statystyki) ── */}
        {!isSelf && (narrow || tab !== 'stats') && (
          <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderTop: `1px solid ${G.bronze}88`, background: '#0d0b08', flexWrap: 'wrap', flexShrink: 0 }}>
            <Btn tone="green" onClick={addFriend}>+ Znajomi</Btn>
            <Btn tone="blue" onClick={() => onSendMessage?.({ toId: postacId, toName: profile.nazwa })}>✉ Wiadomość</Btn>
            {!!profile.zalogowany && <Btn tone="red" onClick={() => { onChallengePvp?.(postacId); onClose(); }}>⚔ PvP</Btn>}
          </div>
        )}
      </div>
    </div>
  );
}
