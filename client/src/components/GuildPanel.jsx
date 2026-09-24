import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';
import {
  IconX, IconCheck, IconPlus, IconUsers, IconCastle, IconCoin, IconChat,
  IconScroll, IconShield, IconSword, IconTrophy, IconFlag, IconGift,
  IconTrendingUp, IconAward, IconChevronRight, IconEdit, IconSave,
  IconArrowUp, IconArrowDown, IconClock, IconSparkles,
} from '../Icons';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtNum(n) {
  n = Number(n) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}
function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pl-PL', { day:'2-digit', month:'2-digit', year:'numeric' });
}

const RANGA_COLOR = { mistrz: '#FCD34D', oficer: '#e7c158', czlonek: '#8A9A6A' };
const RANGA_LABEL = { mistrz: '★ Mistrz', oficer: '◈ Oficer', czlonek: '· Członek' };

// ── Micro helpers ─────────────────────────────────────────────────────────────
function pill(color, text) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:3,
      padding:'1px 7px', borderRadius:9999,
      background:`${color}18`, border:`1px solid ${color}44`,
      color, fontSize:8, fontWeight:'bold', whiteSpace:'nowrap',
    }}>{text}</span>
  );
}

function Btn({ children, onClick, color = '#e7c158', danger, disabled, small, wide }) {
  const c = danger ? '#F87171' : color;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: small ? '3px 8px' : '6px 14px',
      background: `${c}1A`, border: `1px solid ${c}55`,
      borderRadius: 5, cursor: disabled ? 'not-allowed' : 'pointer',
      color: disabled ? '#4A5A30' : c, fontSize: small ? 9 : 10,
      fontWeight: 'bold', fontFamily: 'Verdana,sans-serif',
      opacity: disabled ? 0.5 : 1,
      width: wide ? '100%' : undefined,
      justifyContent: wide ? 'center' : undefined,
    }}>{children}</button>
  );
}

function Input({ value, onChange, placeholder, type = 'text', maxLength, rows, style = {} }) {
  const base = {
    width: '100%', padding: '6px 9px', boxSizing: 'border-box',
    background: 'rgba(20,16,12,0.7)', color: '#e8e2d4',
    border: '1px solid rgba(200,150,32,0.2)', borderRadius: 5,
    fontSize: 10, outline: 'none', fontFamily: 'Verdana,sans-serif',
    ...style,
  };
  if (rows) return <textarea value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength} rows={rows} style={{ ...base, resize: 'vertical' }} />;
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength} style={base} />;
}

function Label({ children }) {
  return <div style={{ fontSize: 8, color: '#9a9182', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{children}</div>;
}

function SectionTitle({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ color: '#e7c158', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{children}</span>
      {action}
    </div>
  );
}

function Card({ children, color, glow }) {
  return (
    <div style={{
      background: color ? `${color}0D` : 'rgba(0,0,0,0.25)',
      border: `1px solid ${color ? color + '30' : 'rgba(200,150,32,0.1)'}`,
      borderRadius: 8, padding: '10px 12px',
      boxShadow: glow ? `0 0 16px ${color}18` : undefined,
    }}>{children}</div>
  );
}

function ProgressBar({ pct, color = '#e7c158', height = 6 }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: height, height, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: `linear-gradient(90deg,${color}88,${color})`, borderRadius: height, transition: 'width .4s' }} />
    </div>
  );
}

// ── Guild Chat ─────────────────────────────────────────────────────────────────
function GuildChat({ socket }) {
  const [msgs, setMsgs]   = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    const h = msg => setMsgs(p => [...p.slice(-49), msg]);
    socket.on('guild_message', h);
    return () => socket.off('guild_message', h);
  }, [socket]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = e => {
    e.preventDefault();
    if (!input.trim() || !socket?.connected) return;
    socket.emit('guild_message', { tresc: input.trim() });
    setInput('');
  };

  return (
    <div style={{ borderTop: '1px solid rgba(200,150,32,0.1)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '4px 10px', fontSize: 8, color: '#9a9182', display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(20,16,12,0.3)' }}>
        <IconChat size={10} /> <span>Czat gildii</span>
      </div>
      <div style={{ height: 100, overflowY: 'auto', padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {msgs.length === 0
          ? <div style={{ color: '#6b6456', fontSize: 9, textAlign: 'center', marginTop: 10 }}>Brak wiadomości</div>
          : msgs.map((m, i) => (
            <div key={i} style={{ fontSize: 9, lineHeight: 1.4 }}>
              <span style={{ color: '#FCD34D', fontWeight: 'bold' }}>[{m.kto}]</span>
              {' '}<span style={{ color: '#e8e2d4' }}>{m.tresc}</span>
            </div>
          ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} style={{ display: 'flex', borderTop: '1px solid rgba(200,150,32,0.06)' }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          placeholder="Napisz do gildii..." maxLength={250}
          style={{ flex: 1, background: 'transparent', color: '#e8e2d4', border: 'none', padding: '5px 10px', fontSize: 10, outline: 'none', fontFamily: 'Verdana,sans-serif' }} />
        <button type="submit" style={{ padding: '5px 12px', background: 'rgba(231,193,88,0.2)', color: '#e7c158', border: 'none', borderLeft: '1px solid rgba(200,150,32,0.12)', cursor: 'pointer', fontSize: 13 }}>➤</button>
      </form>
    </div>
  );
}

// ── OVERVIEW TAB ──────────────────────────────────────────────────────────────
function OverviewTab({ guild, onUpdate, flashMsg, socket }) {
  const [editing, setEditing] = useState(false);
  const [bulletin, setBulletin] = useState(guild.ogloszenie || '');

  const save = async () => {
    const r = await api.social.guildBulletin(bulletin);
    if (r.ok) { flashMsg('Ogłoszenie zapisane!'); setEditing(false); onUpdate(); }
    else flashMsg(r.error || 'Błąd');
  };

  const online   = guild.members?.filter(m => m.zalogowany).length || 0;
  const total    = guild.members?.length || 0;
  const expToNext = Math.max(1, 10000 * (guild.lvl || 1));
  const expPct    = ((guild.gildia_exp || 0) % 10000) / 100;
  const questPct  = guild.activeQuest
    ? Math.min(100, Math.round((guild.activeQuest.postep / guild.activeQuest.cel_ilosc) * 100))
    : 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Hero card */}
        <Card color='#e7c158' glow>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            {/* Emblem */}
            <div style={{
              width: 56, height: 56, flexShrink: 0, borderRadius: 10,
              background: 'linear-gradient(135deg,rgba(200,150,32,0.25),rgba(0,0,0,0.6))',
              border: '2px solid rgba(200,150,32,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, color: '#FCD34D', fontWeight: 'bold',
              boxShadow: '0 0 20px rgba(200,150,32,0.2)',
            }}>
              {(guild.tag || 'G')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ color: '#FCD34D', fontSize: 11, fontWeight: 'bold' }}>[{guild.tag}]</span>
                <span style={{ color: '#f7e3a4', fontSize: 16, fontWeight: 'bold' }}>{guild.nazwa}</span>
                {pill(guild.otwarta ? '#22C55E' : '#F87171', guild.otwarta ? '🔓 Otwarta' : '🔒 Zamknięta')}
              </div>
              {guild.opis && <div style={{ color: '#9a9182', fontSize: 9, marginTop: 3, fontStyle: 'italic' }}>{guild.opis}</div>}
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <span style={{ color: '#4ADE80', fontSize: 9 }}>● {online}/{total} online</span>
                <span style={{ color: '#9a9182', fontSize: 9 }}>{RANGA_LABEL[guild.myRanga]}</span>
              </div>
            </div>
          </div>
          {/* EXP bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#9a9182', fontSize: 8 }}>EXP Gildii · Poz. {guild.lvl}</span>
              <span style={{ color: '#e7c158', fontSize: 8 }}>{fmtNum(guild.gildia_exp || 0)}</span>
            </div>
            <ProgressBar pct={expPct} color='#e7c158' height={7} />
          </div>
        </Card>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[
            { icon: <IconUsers size={16} />, label: 'Członkowie', value: total, color: '#60A5FA' },
            { icon: <span style={{ fontSize: 14 }}>🟢</span>, label: 'Online', value: online, color: '#22C55E' },
            { icon: <IconCoin size={16} />, label: 'Skarbiec', value: fmtNum(guild.skarbiec || 0) + 'g', color: '#FCD34D' },
            { icon: <IconTrophy size={16} />, label: 'Poziom', value: `Lv${guild.lvl}`, color: '#e7c158' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(200,150,32,0.1)', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ color, marginBottom: 4, display: 'flex', justifyContent: 'center' }}>{icon}</div>
              <div style={{ color, fontWeight: 'bold', fontSize: 14 }}>{value}</div>
              <div style={{ color: '#9a9182', fontSize: 7, textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Bulletin */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e7c158', fontSize: 10, fontWeight: 'bold' }}>
              <IconEdit size={12} /> 📌 Ogłoszenie
            </div>
            {guild.myRanga === 'mistrz' && (
              editing
                ? <div style={{ display: 'flex', gap: 5 }}>
                    <Btn onClick={save} small><IconSave size={10} /> Zapisz</Btn>
                    <Btn onClick={() => { setEditing(false); setBulletin(guild.ogloszenie || ''); }} small danger>Anuluj</Btn>
                  </div>
                : <Btn onClick={() => setEditing(true)} small><IconEdit size={10} /> Edytuj</Btn>
            )}
          </div>
          {editing
            ? <Input value={bulletin} onChange={e => setBulletin(e.target.value)} placeholder="Wpisz ogłoszenie..." maxLength={1000} rows={3} />
            : <div style={{ color: guild.ogloszenie ? '#e8e2d4' : '#6b6456', fontSize: 10, lineHeight: 1.6, fontStyle: guild.ogloszenie ? 'normal' : 'italic' }}>
                {guild.ogloszenie || 'Brak ogłoszenia. Mistrz może je dodać.'}
              </div>
          }
        </Card>

        {/* Active Quest */}
        {guild.activeQuest && (
          <Card color='#22C55E'>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ADE80', fontSize: 10, fontWeight: 'bold' }}>
                <IconScroll size={12} /> Aktywna misja
              </div>
              {pill('#22C55E', questPct + '%')}
            </div>
            <div style={{ color: '#e8e2d4', fontSize: 11, fontWeight: 'bold', marginBottom: 6 }}>{guild.activeQuest.nazwa}</div>
            <ProgressBar pct={questPct} color='#22C55E' />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, color: '#9a9182', fontSize: 8 }}>
              <span>{guild.activeQuest.postep} / {guild.activeQuest.cel_ilosc}</span>
              <span>Nagroda: {fmtNum(guild.activeQuest.nagroda_gold)}g + {fmtNum(guild.activeQuest.nagroda_exp)} EXP</span>
            </div>
          </Card>
        )}

        {/* Active War */}
        {guild.activeWar && (
          <Card color='#EF4444' glow>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F87171', fontSize: 10, fontWeight: 'bold', marginBottom: 10 }}>
              <IconFlag size={12} /> Aktywna Wojna Gildii
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#FCD34D', fontWeight: 'bold', fontSize: 11 }}>{guild.activeWar.nazwa_atakujacej}</div>
                <div style={{ color: '#F87171', fontSize: 26, fontWeight: 'bold', lineHeight: 1 }}>{guild.activeWar.punkty_atakujaca}</div>
              </div>
              <div style={{ color: '#9a9182', fontSize: 16, fontWeight: 'bold' }}>VS</div>
              <div>
                <div style={{ color: '#60A5FA', fontWeight: 'bold', fontSize: 11 }}>{guild.activeWar.nazwa_broniacej}</div>
                <div style={{ color: '#60A5FA', fontSize: 26, fontWeight: 'bold', lineHeight: 1 }}>{guild.activeWar.punkty_broniac}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Territory */}
        {guild.territory && <TerritoryBox territory={guild.territory} />}
      </div>
      <GuildChat socket={socket} />
    </div>
  );
}

// ── TERRITORY BOX ─────────────────────────────────────────────────────────────
function TerritoryBox({ territory }) {
  const [income, setIncome] = useState(null);
  useEffect(() => { api.social.guildTerritoryIncome().then(r => r.ok && setIncome(r)).catch(() => {}); }, []);
  const ZRODLO = { aukcja: '🏪 Aukcja', sklep_npc: '🛒 Sklep', handel: '🤝 Handel' };

  return (
    <Card color='#3B82F6'>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#60A5FA', fontSize: 10, fontWeight: 'bold', marginBottom: 6 }}>
        <IconCastle size={12} /> Terytorium · Mapa {territory.mapa_id}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#9a9182', fontSize: 9 }}>od {fmtDate(territory.data_zajecia)}</span>
        {income?.territory && (
          <span style={{ color: '#FCD34D', fontWeight: 'bold', fontSize: 10 }}>
            {fmtNum(income.territory.przychod_total)}g przychód
          </span>
        )}
      </div>
      {income?.log?.slice(0, 3).map((l, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#9a9182', marginTop: 3 }}>
          <span>{ZRODLO[l.zrodlo] || l.zrodlo}</span>
          <span style={{ color: '#4ADE80' }}>+{fmtNum(l.kwota)}g</span>
        </div>
      ))}
    </Card>
  );
}

// ── MEMBERS TAB ───────────────────────────────────────────────────────────────
function MembersTab({ guild, postacId, onUpdate, flashMsg }) {
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState('all');  // all | online | mistrz | oficer | czlonek
  const [customEdit, setCustomEdit]   = useState(null);
  const [customVal, setCustomVal]     = useState('');

  const kick = async (id, name) => {
    if (!window.confirm(`Wyrzucić ${name} z gildii?`)) return;
    const r = await api.social.guildKick(id);
    r.ok ? (flashMsg('Wyrzucono!'), onUpdate()) : flashMsg(r.error || 'Błąd');
  };

  const promote = async (id, ranga) => {
    const r = await api.social.guildPromote(id, ranga);
    r.ok ? (flashMsg('Zmieniono rangę!'), onUpdate()) : flashMsg(r.error || 'Błąd');
  };

  const saveCustom = async (rowId) => {
    const r = await api.social.guildMemberRank(rowId, customVal);
    r.ok ? (flashMsg('Ranga ustawiona!'), setCustomEdit(null), onUpdate()) : flashMsg(r.error || 'Błąd');
  };

  const RORDER = { mistrz: 0, oficer: 1, czlonek: 2 };
  const members = [...(guild.members || [])]
    .filter(m => {
      if (filter === 'online' && !m.zalogowany) return false;
      if (['mistrz', 'oficer', 'czlonek'].includes(filter) && m.ranga !== filter) return false;
      return !search || m.nazwa.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => b.zalogowany - a.zalogowany || (RORDER[a.ranga] ?? 3) - (RORDER[b.ranga] ?? 3));

  const online = guild.members?.filter(m => m.zalogowany).length || 0;
  const FILTERS = [
    { id: 'all', label: 'Wszyscy' },
    { id: 'online', label: `Online (${online})` },
    { id: 'mistrz', label: '★ Mistrz' },
    { id: 'oficer', label: '◈ Oficer' },
    { id: 'czlonek', label: 'Członek' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(200,150,32,0.08)', flexShrink: 0, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '3px 9px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 9,
              color: filter === f.id ? '#f7e3a4' : '#9a9182',
              borderBottom: filter === f.id ? '2px solid #e7c158' : '2px solid transparent',
              fontWeight: filter === f.id ? 'bold' : 'normal', whiteSpace: 'nowrap',
              fontFamily: 'Verdana,sans-serif',
            }}>{f.label}</button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj..."
            style={{ padding: '4px 8px 4px 24px', background: 'rgba(20,16,12,0.7)', color: '#e8e2d4', border: '1px solid rgba(200,150,32,0.2)', borderRadius: 5, fontSize: 9, outline: 'none', width: 130, fontFamily: 'Verdana,sans-serif' }} />
          <span style={{ position: 'absolute', left: 7, top: 5, color: '#9a9182', fontSize: 11 }}>🔍</span>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '10px 34px 1fr 55px 90px 80px', gap: 6, padding: '5px 14px', borderBottom: '1px solid rgba(200,150,32,0.06)', flexShrink: 0, background: 'rgba(12,10,8,0.4)' }}>
        {['', '', 'Postać', 'Poz.', 'Ranga', 'Akcje'].map((h, i) => (
          <div key={i} style={{ color: '#6b6456', fontSize: 7, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</div>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {members.length === 0
          ? <div style={{ padding: 24, textAlign: 'center', color: '#6b6456', fontSize: 10 }}>Brak wyników</div>
          : members.map(m => {
            const canManage = (guild.myRanga === 'mistrz' || guild.myRanga === 'oficer') && m.id !== postacId && m.ranga !== 'mistrz';
            const displayRank = m.niestandardowa_ranga || RANGA_LABEL[m.ranga];
            return (
              <div key={m.id} style={{
                display: 'grid', gridTemplateColumns: '10px 34px 1fr 55px 90px 80px',
                gap: 6, alignItems: 'center', padding: '7px 14px',
                borderBottom: '1px solid rgba(200,150,32,0.04)',
                background: m.id === postacId ? 'rgba(200,150,32,0.04)' : 'transparent',
              }}>
                {/* Online dot */}
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: m.zalogowany ? '#22C55E' : '#374151', boxShadow: m.zalogowany ? '0 0 5px #22C55E88' : 'none' }} />

                {/* Avatar */}
                <div style={{ width: 28, height: 36, backgroundImage: `url(/assets/${m.obrazek})`, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', backgroundPosition: 'top center' }} />

                {/* Name + info */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: RANGA_COLOR[m.ranga] || '#e8e2d4', fontWeight: 'bold', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nazwa}</span>
                    {m.id === postacId && pill('#e7c158', 'Ty')}
                  </div>
                  <div style={{ color: '#9a9182', fontSize: 8 }}>{m.profesja}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 1 }}>
                    <span style={{ color: '#374151', fontSize: 7 }}>💰{fmtNum(m.wklad_gold || 0)}</span>
                    <span style={{ color: '#374151', fontSize: 7 }}>⚔{fmtNum(m.wklad_kills || 0)}</span>
                    <span style={{ color: '#374151', fontSize: 7 }}>✨{fmtNum(m.wklad_exp || 0)}</span>
                  </div>
                </div>

                {/* Level */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#f7e3a4', fontSize: 13, fontWeight: 'bold' }}>{m.poziom}</div>
                  <div style={{ color: '#6b6456', fontSize: 7 }}>poziom</div>
                </div>

                {/* Rank */}
                <div>
                  {customEdit === m.member_row_id
                    ? <div style={{ display: 'flex', gap: 2 }}>
                        <input value={customVal} onChange={e => setCustomVal(e.target.value)} maxLength={30}
                          style={{ width: 55, padding: '2px 4px', background: 'rgba(20,16,12,0.8)', color: '#e8e2d4', border: '1px solid rgba(200,150,32,0.3)', borderRadius: 3, fontSize: 8, outline: 'none', fontFamily: 'Verdana,sans-serif' }} />
                        <button onClick={() => saveCustom(m.member_row_id)} style={{ padding: '2px 4px', background: 'rgba(34,197,94,0.2)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 3, cursor: 'pointer', fontSize: 10 }}>✓</button>
                        <button onClick={() => setCustomEdit(null)} style={{ padding: '2px 4px', background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 3, cursor: 'pointer', fontSize: 10 }}>✕</button>
                      </div>
                    : <span style={{ color: RANGA_COLOR[m.ranga] || '#e8e2d4', fontSize: 9 }}>{displayRank}</span>
                  }
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                  {guild.myRanga === 'mistrz' && customEdit !== m.member_row_id && (
                    <button onClick={() => { setCustomEdit(m.member_row_id); setCustomVal(m.niestandardowa_ranga || ''); }}
                      title="Ustaw rangę" style={{ padding: '3px 5px', background: 'rgba(200,150,32,0.15)', color: '#e7c158', border: '1px solid rgba(200,150,32,0.3)', borderRadius: 3, cursor: 'pointer' }}>
                      <IconEdit size={10} />
                    </button>
                  )}
                  {canManage && m.ranga === 'czlonek' && guild.myRanga === 'mistrz' && (
                    <button onClick={() => promote(m.id, 'oficer')} title="Awansuj na oficera"
                      style={{ padding: '3px 5px', background: 'rgba(200,150,32,0.15)', color: '#e7c158', border: '1px solid rgba(200,150,32,0.3)', borderRadius: 3, cursor: 'pointer' }}>
                      <IconArrowUp size={10} />
                    </button>
                  )}
                  {canManage && m.ranga === 'oficer' && guild.myRanga === 'mistrz' && (
                    <button onClick={() => promote(m.id, 'czlonek')} title="Zdegraduj"
                      style={{ padding: '3px 5px', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 3, cursor: 'pointer' }}>
                      <IconArrowDown size={10} />
                    </button>
                  )}
                  {canManage && (
                    <button onClick={() => kick(m.id, m.nazwa)} title="Wyrzuć z gildii"
                      style={{ padding: '3px 5px', background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 3, cursor: 'pointer' }}>
                      <IconX size={10} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ── CONTRIBUTIONS TAB ─────────────────────────────────────────────────────────
function ContributionsTab({ guild }) {
  const [sort, setSort] = useState('gold');
  const SORTS = [
    { id: 'gold',  icon: '💰', label: 'Złoto' },
    { id: 'kills', icon: '⚔',  label: 'Zabójstwa' },
    { id: 'exp',   icon: '✨', label: 'EXP' },
  ];
  const members = [...(guild.members || [])].sort((a, b) => (b[`wklad_${sort}`] || 0) - (a[`wklad_${sort}`] || 0));
  const maxVal = members[0]?.[`wklad_${sort}`] || 1;
  const MEDALS = ['🥇', '🥈', '🥉'];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Sort */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 14px', borderBottom: '1px solid rgba(200,150,32,0.08)', flexShrink: 0 }}>
        {SORTS.map(s => (
          <button key={s.id} onClick={() => setSort(s.id)} style={{
            padding: '4px 12px', background: sort === s.id ? 'rgba(200,150,32,0.15)' : 'none',
            border: `1px solid ${sort === s.id ? 'rgba(200,150,32,0.4)' : 'transparent'}`,
            borderRadius: 5, cursor: 'pointer', color: sort === s.id ? '#f7e3a4' : '#9a9182',
            fontSize: 9, fontWeight: sort === s.id ? 'bold' : 'normal', fontFamily: 'Verdana,sans-serif',
            display: 'flex', gap: 5, alignItems: 'center',
          }}>
            <span>{s.icon}</span><span>{s.label}</span>
          </button>
        ))}
        <div style={{ marginLeft: 'auto', color: '#9a9182', fontSize: 8, alignSelf: 'center' }}>
          {guild.members?.length || 0} członków
        </div>
      </div>
      {/* Ranking list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {members.map((m, i) => {
          const val = m[`wklad_${sort}`] || 0;
          const pct = (val / maxVal) * 100;
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: i < 3 ? 'rgba(200,150,32,0.06)' : 'rgba(0,0,0,0.2)', border: `1px solid ${i < 3 ? 'rgba(200,150,32,0.15)' : 'rgba(200,150,32,0.05)'}`, borderRadius: 7 }}>
              {/* Rank */}
              <div style={{ width: 24, textAlign: 'center', fontSize: i < 3 ? 18 : 11, color: '#9a9182', fontWeight: 'bold', flexShrink: 0 }}>
                {i < 3 ? MEDALS[i] : i + 1}
              </div>
              {/* Avatar */}
              <div style={{ width: 26, height: 34, backgroundImage: `url(/assets/${m.obrazek})`, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', backgroundPosition: 'top center', flexShrink: 0 }} />
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ color: RANGA_COLOR[m.ranga] || '#e8e2d4', fontWeight: 'bold', fontSize: 10 }}>{m.nazwa}</span>
                  <span style={{ color: '#f7e3a4', fontWeight: 'bold', fontSize: 11 }}>{fmtNum(val)}</span>
                </div>
                <ProgressBar pct={pct} color={i === 0 ? '#FCD34D' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#e7c158'} height={5} />
                <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
                  <span style={{ color: '#374151', fontSize: 7 }}>💰{fmtNum(m.wklad_gold || 0)}</span>
                  <span style={{ color: '#374151', fontSize: 7 }}>⚔{fmtNum(m.wklad_kills || 0)}</span>
                  <span style={{ color: '#374151', fontSize: 7 }}>✨{fmtNum(m.wklad_exp || 0)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TREASURY TAB ──────────────────────────────────────────────────────────────
function TreasuryTab({ guild, onUpdate, flashMsg }) {
  const [log, setLog]             = useState([]);
  const [depositAmt, setDeposit]  = useState('');
  const [withdrawAmt, setWithdraw] = useState('');
  const [withdrawOpi, setWithdrawOpi] = useState('');
  const canWithdraw = guild.myRanga === 'mistrz' || guild.myRanga === 'oficer';

  const loadLog = useCallback(() => { api.social.guildTreasuryLog().then(r => Array.isArray(r) && setLog(r)); }, []);
  useEffect(() => { loadLog(); }, [loadLog]);

  const deposit = async () => {
    const r = await api.social.guildDeposit(parseInt(depositAmt));
    r.ok ? (flashMsg('Wpłacono!'), setDeposit(''), onUpdate(), loadLog()) : flashMsg(r.error || 'Błąd');
  };
  const withdraw = async () => {
    const r = await api.social.guildWithdraw(parseInt(withdrawAmt), withdrawOpi);
    r.ok ? (flashMsg('Wypłacono!'), setWithdraw(''), setWithdrawOpi(''), onUpdate(), loadLog()) : flashMsg(r.error || 'Błąd');
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Balance */}
      <Card color='#FCD34D' glow>
        <div style={{ textAlign: 'center', padding: '6px 0 10px' }}>
          <div style={{ color: '#FCD34D', fontSize: 32, fontWeight: 'bold', lineHeight: 1 }}>{fmtNum(guild.skarbiec || 0)}</div>
          <div style={{ color: '#9a9182', fontSize: 9, marginTop: 4, letterSpacing: '2px', textTransform: 'uppercase' }}>💰 Złoto w Skarbcu</div>
        </div>
      </Card>

      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: canWithdraw ? '1fr 1fr' : '1fr', gap: 10 }}>
        <Card color='#22C55E'>
          <SectionTitle>Wpłata</SectionTitle>
          <Label>Kwota złota</Label>
          <Input type="number" value={depositAmt} onChange={e => setDeposit(e.target.value)} placeholder="np. 500" style={{ marginBottom: 8 }} />
          <Btn onClick={deposit} color='#22C55E' wide disabled={!depositAmt || isNaN(parseInt(depositAmt))}>
            <IconArrowUp size={12} /> Wpłać do skarbca
          </Btn>
        </Card>

        {canWithdraw && (
          <Card color='#F87171'>
            <SectionTitle>Wypłata <span style={{ color: '#9a9182', fontWeight: 'normal', fontSize: 8 }}>(oficer+)</span></SectionTitle>
            <Label>Kwota</Label>
            <Input type="number" value={withdrawAmt} onChange={e => setWithdraw(e.target.value)} placeholder="np. 200" style={{ marginBottom: 6 }} />
            <Label>Opis</Label>
            <Input value={withdrawOpi} onChange={e => setWithdrawOpi(e.target.value)} placeholder="Cel wypłaty..." style={{ marginBottom: 8 }} />
            <Btn onClick={withdraw} danger wide disabled={!withdrawAmt || isNaN(parseInt(withdrawAmt))}>
              <IconArrowDown size={12} /> Wypłać ze skarbca
            </Btn>
          </Card>
        )}
      </div>

      {/* Log */}
      <div>
        <SectionTitle><IconClock size={11} /> Historia transakcji</SectionTitle>
        {log.length === 0
          ? <div style={{ color: '#374151', fontSize: 9, textAlign: 'center', padding: 10 }}>Brak transakcji</div>
          : log.map(l => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 6, marginBottom: 4, border: '1px solid rgba(200,150,32,0.06)' }}>
              <span style={{ color: l.typ === 'wplata' ? '#4ADE80' : '#F87171', fontSize: 16 }}>{l.typ === 'wplata' ? '↑' : '↓'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#e8e2d4', fontSize: 9 }}><span style={{ color: '#e7c158' }}>{l.postac_nazwa}</span> {l.opis ? `— ${l.opis}` : ''}</div>
                <div style={{ color: '#374151', fontSize: 7 }}>{new Date(l.data).toLocaleString('pl-PL')}</div>
              </div>
              <span style={{ color: l.typ === 'wplata' ? '#4ADE80' : '#F87171', fontWeight: 'bold', fontSize: 11 }}>
                {l.typ === 'wplata' ? '+' : '-'}{fmtNum(l.kwota)}g
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

// ── RECRUITMENT TAB ───────────────────────────────────────────────────────────
function RecruitmentTab({ guild, onUpdate, flashMsg }) {
  const [apps, setApps]         = useState([]);
  const [myApps, setMyApps]     = useState([]);
  const [applyText, setApplyText] = useState('');
  const canManage = guild.myRanga === 'mistrz' || guild.myRanga === 'oficer';

  useEffect(() => {
    if (canManage) api.social.guildApplications().then(r => Array.isArray(r) && setApps(r));
    api.social.guildApplicationsMy().then(r => Array.isArray(r) && setMyApps(r));
  }, [canManage]);

  const toggleOpen = async () => {
    const r = await api.social.guildOpenClose(guild.otwarta ? 0 : 1);
    r.ok ? (flashMsg(guild.otwarta ? 'Gildia zamknięta' : 'Gildia otwarta'), onUpdate()) : flashMsg(r.error || 'Błąd');
  };
  const accept = async id => {
    const r = await api.social.guildAppAccept(id);
    r.ok ? (flashMsg('Zaakceptowano!'), setApps(p => p.filter(a => a.id !== id)), onUpdate()) : flashMsg(r.error || 'Błąd');
  };
  const reject = async id => {
    const r = await api.social.guildAppReject(id);
    r.ok ? (flashMsg('Odrzucono.'), setApps(p => p.filter(a => a.id !== id))) : flashMsg(r.error || 'Błąd');
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Status toggle */}
      {guild.myRanga === 'mistrz' && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#e8e2d4', fontSize: 10, fontWeight: 'bold' }}>Status rekrutacji</div>
              <div style={{ color: '#9a9182', fontSize: 9, marginTop: 2 }}>Kontroluje czy gracze mogą wysyłać podania</div>
            </div>
            <Btn onClick={toggleOpen} color={guild.otwarta ? '#22C55E' : '#F87171'}>
              {guild.otwarta ? '🔓 Otwarta' : '🔒 Zamknięta'}
            </Btn>
          </div>
        </Card>
      )}

      {/* Pending applications */}
      {canManage && (
        <div>
          <SectionTitle><IconUsers size={11} /> Oczekujące podania ({apps.length})</SectionTitle>
          {apps.length === 0
            ? <div style={{ color: '#374151', fontSize: 9, textAlign: 'center', padding: 10 }}>Brak podań</div>
            : apps.map(a => (
              <Card key={a.id} color='#e7c158'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#f7e3a4', fontWeight: 'bold', fontSize: 11 }}>{a.postac_nazwa}</div>
                    <div style={{ color: '#9a9182', fontSize: 8, marginTop: 2 }}>{fmtDate(a.data)}</div>
                    {a.tresc && <div style={{ color: '#e8e2d4', fontSize: 9, marginTop: 5, fontStyle: 'italic', borderLeft: '2px solid rgba(200,150,32,0.3)', paddingLeft: 6 }}>"{a.tresc}"</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    <Btn onClick={() => accept(a.id)} color='#22C55E' small><IconCheck size={10} /> Akceptuj</Btn>
                    <Btn onClick={() => reject(a.id)} danger small><IconX size={10} /> Odrzuć</Btn>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* My applications */}
      <div>
        <SectionTitle>Moje podania</SectionTitle>
        {myApps.length === 0
          ? <div style={{ color: '#374151', fontSize: 9, textAlign: 'center', padding: 10 }}>Nie złożono żadnych podań</div>
          : myApps.map(a => {
            const c = a.status === 'zaakceptowano' ? '#22C55E' : a.status === 'odrzucono' ? '#F87171' : '#F59E0B';
            return (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 6, marginBottom: 4, border: '1px solid rgba(200,150,32,0.06)' }}>
                <span style={{ color: c, fontSize: 12 }}>●</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#e8e2d4', fontSize: 9 }}>{a.gildia_nazwa}</div>
                  <div style={{ color: c, fontSize: 8, textTransform: 'capitalize' }}>{a.status}</div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ── DIPLOMACY TAB ─────────────────────────────────────────────────────────────
function DiplomacyTab({ guild, onUpdate, flashMsg }) {
  const [history, setHistory]         = useState([]);
  const [relTarget, setRelTarget]     = useState('');
  const [relTyp, setRelTyp]           = useState('przymierze');
  const [declareTarget, setDeclareTarget] = useState('');

  useEffect(() => { api.social.guildWarHistory().then(r => Array.isArray(r) && setHistory(r)); }, []);

  const setRelation  = async () => { const r = await api.social.guildRelationSet(parseInt(relTarget), relTyp); r.ok ? (flashMsg('Relacja ustawiona!'), setRelTarget(''), onUpdate()) : flashMsg(r.error || 'Błąd'); };
  const removeRel    = async id  => { const r = await api.social.guildRelationDelete(id); r.ok ? (flashMsg('Relacja usunięta'), onUpdate()) : flashMsg(r.error || 'Błąd'); };
  const declareWar   = async () => { if (!window.confirm('Wypowiedzieć wojnę? Koszt: 500g.')) return; const r = await api.social.guildWarDeclare(parseInt(declareTarget)); r.ok ? (flashMsg('Wojna wypowiedziana!'), setDeclareTarget(''), onUpdate()) : flashMsg(r.error || 'Błąd'); };
  const endWar       = async id  => { const r = await api.social.guildWarEnd(id); r.ok ? (flashMsg('Wojna zakończona'), onUpdate()) : flashMsg(r.error || 'Błąd'); };

  const relations = guild.relations || [];
  const gId = guild.id;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Active war */}
      {guild.activeWar && (
        <Card color='#EF4444' glow>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F87171', fontSize: 10, fontWeight: 'bold', marginBottom: 10 }}>
            <IconFlag size={12} /> Aktywna Wojna
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#FCD34D', fontWeight: 'bold', fontSize: 11 }}>{guild.activeWar.nazwa_atakujacej}</div>
              <div style={{ color: '#F87171', fontSize: 24, fontWeight: 'bold' }}>{guild.activeWar.punkty_atakujaca}</div>
            </div>
            <div style={{ color: '#9a9182', fontSize: 14, fontWeight: 'bold' }}>VS</div>
            <div>
              <div style={{ color: '#60A5FA', fontWeight: 'bold', fontSize: 11 }}>{guild.activeWar.nazwa_broniacej}</div>
              <div style={{ color: '#60A5FA', fontSize: 24, fontWeight: 'bold' }}>{guild.activeWar.punkty_broniac}</div>
            </div>
          </div>
          {guild.myRanga === 'mistrz' && <Btn onClick={() => endWar(guild.activeWar.id)} color='#F59E0B'>Zakończ wojnę</Btn>}
        </Card>
      )}

      {/* Declare war */}
      {guild.myRanga === 'mistrz' && !guild.activeWar && (
        <Card color='#EF4444'>
          <SectionTitle><IconSword size={11} /> Wypowiedz Wojnę <span style={{ color: '#9a9182', fontWeight: 'normal', fontSize: 8 }}>(koszt 500g)</span></SectionTitle>
          <div style={{ display: 'flex', gap: 6 }}>
            <Input value={declareTarget} onChange={e => setDeclareTarget(e.target.value)} placeholder="ID gildii wroga" style={{ flex: 1 }} />
            <Btn onClick={declareWar} danger disabled={!declareTarget}><IconFlag size={11} /> Atakuj</Btn>
          </div>
        </Card>
      )}

      {/* Relations */}
      <div>
        <SectionTitle><IconUsers size={11} /> Relacje dyplomatyczne ({relations.length})</SectionTitle>
        {relations.length === 0 && <div style={{ color: '#374151', fontSize: 9, textAlign: 'center', padding: 10 }}>Brak relacji</div>}
        {relations.map(r => {
          const isAlly = r.typ === 'przymierze';
          const other = r.gildia1_id === gId ? r.gildia2_nazwa : r.gildia1_nazwa;
          const otherId = r.gildia1_id === gId ? r.gildia2_id : r.gildia1_id;
          return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: isAlly ? 'rgba(231,193,88,0.08)' : 'rgba(239,68,68,0.06)', border: `1px solid ${isAlly ? 'rgba(231,193,88,0.2)' : 'rgba(239,68,68,0.15)'}`, borderRadius: 6, marginBottom: 5 }}>
              <span style={{ fontSize: 18 }}>{isAlly ? '🤝' : '⚔'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#e8e2d4', fontWeight: 'bold', fontSize: 10 }}>{other}</div>
                <div style={{ color: isAlly ? '#4ADE80' : '#F87171', fontSize: 8 }}>{isAlly ? 'Przymierze' : 'Wrogość'}</div>
              </div>
              {guild.myRanga === 'mistrz' && <Btn onClick={() => removeRel(otherId)} danger small><IconX size={10} /></Btn>}
            </div>
          );
        })}
      </div>

      {/* New relation */}
      {guild.myRanga === 'mistrz' && (
        <Card>
          <SectionTitle>Nowa relacja</SectionTitle>
          <div style={{ display: 'flex', gap: 6 }}>
            <Input value={relTarget} onChange={e => setRelTarget(e.target.value)} placeholder="ID gildii" style={{ flex: 1 }} />
            <select value={relTyp} onChange={e => setRelTyp(e.target.value)}
              style={{ padding: '6px 8px', background: 'rgba(20,16,12,0.7)', color: '#e8e2d4', border: '1px solid rgba(200,150,32,0.2)', borderRadius: 5, fontSize: 10, outline: 'none' }}>
              <option value="przymierze">Przymierze</option>
              <option value="wrogosc">Wrogość</option>
            </select>
            <Btn onClick={setRelation} disabled={!relTarget}><IconCheck size={11} /></Btn>
          </div>
        </Card>
      )}

      {/* War history */}
      {history.length > 0 && (
        <div>
          <SectionTitle><IconClock size={11} /> Historia wojen</SectionTitle>
          {history.map(w => (
            <div key={w.id} style={{ display: 'flex', gap: 8, padding: '5px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: 5, marginBottom: 3, border: '1px solid rgba(200,150,32,0.05)' }}>
              <div style={{ flex: 1, color: '#9a9182', fontSize: 9 }}>{w.nazwa_atakujacej} <span style={{ color: '#F87171' }}>{w.punkty_atakujaca}</span> vs <span style={{ color: '#60A5FA' }}>{w.punkty_broniac}</span> {w.nazwa_broniacej}</div>
              <div style={{ color: '#374151', fontSize: 7 }}>{fmtDate(w.data_koniec)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── QUESTS TAB ────────────────────────────────────────────────────────────────
function QuestsTab({ guild, onUpdate, flashMsg }) {
  const [form, setForm] = useState({ nazwa: '', opis: '', typ: 'kill', cel_ilosc: 100, nagroda_gold: 500, nagroda_exp: 200, hours: 24 });

  const createQuest = async () => {
    const r = await api.social.guildQuestCreate(form);
    r.ok ? (flashMsg('Misja utworzona!'), onUpdate()) : flashMsg(r.error || 'Błąd');
  };
  const collect = async () => {
    const r = await api.social.guildQuestCollect();
    r.ok ? (flashMsg(`Odebrano: +${r.gold}g +${r.exp}exp`), onUpdate()) : flashMsg(r.error || 'Błąd');
  };

  const q = guild.activeQuest;
  const pct = q ? Math.min(100, Math.round((q.postep / q.cel_ilosc) * 100)) : 0;
  const isDone = q?.status === 'zakonczona';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {q ? (
        <Card color='#22C55E' glow>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ADE80', fontSize: 10, fontWeight: 'bold', marginBottom: 8 }}>
            <IconScroll size={12} /> Aktywna Misja Gildii
          </div>
          <div style={{ color: '#e8e2d4', fontWeight: 'bold', fontSize: 13, marginBottom: 4 }}>{q.nazwa}</div>
          <div style={{ color: '#9a9182', fontSize: 9, marginBottom: 10 }}>{q.opis}</div>
          <ProgressBar pct={pct} color='#22C55E' height={8} />
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9a9182', fontSize: 8, marginTop: 5, marginBottom: 10 }}>
            <span>{q.postep} / {q.cel_ilosc} ({pct}%)</span>
            <span>💰 {fmtNum(q.nagroda_gold)}g · ✨ {fmtNum(q.nagroda_exp)} EXP</span>
          </div>
          {isDone && guild.myRanga === 'mistrz' && (
            <Btn onClick={collect} color='#FCD34D' wide><IconGift size={12} /> Odbierz nagrody dla gildii</Btn>
          )}
        </Card>
      ) : (
        <div style={{ color: '#374151', fontSize: 10, textAlign: 'center', padding: '20px 0' }}>Brak aktywnej misji</div>
      )}

      {guild.myRanga === 'mistrz' && !q && (
        <Card>
          <SectionTitle><IconPlus size={11} /> Utwórz nową misję</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div><Label>Nazwa misji</Label><Input value={form.nazwa} onChange={e => setForm(p => ({ ...p, nazwa: e.target.value }))} placeholder="np. Polowanie na Orków" /></div>
            <div><Label>Opis</Label><Input value={form.opis} onChange={e => setForm(p => ({ ...p, opis: e.target.value }))} placeholder="Opisz misję..." /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['cel_ilosc', 'Cel (ilość)', 'number'], ['nagroda_gold', 'Nagroda (g)', 'number'], ['nagroda_exp', 'Nagroda (EXP)', 'number'], ['hours', 'Czas (h)', 'number']].map(([k, l, t]) => (
                <div key={k}><Label>{l}</Label><Input type={t} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} /></div>
              ))}
            </div>
            <div>
              <Label>Typ misji</Label>
              <select value={form.typ} onChange={e => setForm(p => ({ ...p, typ: e.target.value }))}
                style={{ width: '100%', padding: '6px 9px', background: 'rgba(20,16,12,0.7)', color: '#e8e2d4', border: '1px solid rgba(200,150,32,0.2)', borderRadius: 5, fontSize: 10, outline: 'none' }}>
                <option value="kill">⚔ Zabójstwa</option>
                <option value="gold_collect">💰 Zbieranie złota</option>
                <option value="members_online">👥 Aktywni członkowie</option>
              </select>
            </div>
            <Btn onClick={createQuest} color='#22C55E' wide disabled={!form.nazwa}><IconCheck size={12} /> Utwórz misję</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── BUFFS TAB ─────────────────────────────────────────────────────────────────
function BuffsTab({ guild, onUpdate, flashMsg }) {
  const b = guild.buffs || { bonus_exp: 0, bonus_healing: 0, bonus_crit: 0, bonus_defense: 0 };
  const BUFFS = [
    { key: 'bonus_exp',     icon: '✨', name: 'Bonus EXP',   max: 15, step: 5,  color: '#A78BFA' },
    { key: 'bonus_healing', icon: '💚', name: 'Leczenie',    max: 10, step: 5,  color: '#34D399' },
    { key: 'bonus_crit',    icon: '⚡', name: 'Krit',       max: 5,  step: 2,  color: '#FCD34D' },
    { key: 'bonus_defense', icon: '🛡', name: 'Obrona',     max: 10, step: 2,  color: '#60A5FA' },
  ];

  const getCost = (cur, step) => {
    const lv = Math.floor(cur / step);
    return lv < 1 ? 500 : lv < 2 ? 1500 : 3000;
  };
  const upgrade = async type => {
    const r = await api.social.guildBuffUpgrade(type);
    r.ok ? (flashMsg(`Ulepszono! Koszt: ${r.cost}g`), onUpdate()) : flashMsg(r.error || 'Błąd');
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ color: '#9a9182', fontSize: 9, marginBottom: 4 }}>Bonusy gildii działają na wszystkich członków jednocześnie.</div>
      {BUFFS.map(({ key, icon, name, max, step, color }) => {
        const cur = b[key] || 0;
        const pct = (cur / max) * 100;
        const cost = getCost(cur, step);
        const canUpgrade = cur < max && (guild.myRanga === 'mistrz' || guild.myRanga === 'oficer');
        return (
          <Card key={key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ color: '#f7e3a4', fontWeight: 'bold', fontSize: 11 }}>{name}</span>
                  <span style={{ color, fontWeight: 'bold', fontSize: 16 }}>+{cur}%</span>
                </div>
                <ProgressBar pct={pct} color={color} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ color: '#9a9182', fontSize: 8 }}>{cur}/{max}% maks.</span>
                  {canUpgrade
                    ? <Btn onClick={() => upgrade(key)} color={color} small><IconTrendingUp size={10} /> Ulepsz ({fmtNum(cost)}g)</Btn>
                    : <span style={{ color: cur >= max ? color : '#374151', fontSize: 8 }}>{cur >= max ? '✓ MAX' : 'Brak uprawnień'}</span>
                  }
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── RANKING TAB ───────────────────────────────────────────────────────────────
function RankingTab() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.social.guildRanking().then(r => { Array.isArray(r) && setRanking(r); setLoading(false); }); }, []);

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9a9182', fontSize: 10 }}>Ładowanie...</div>;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 70px 52px 44px', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(200,150,32,0.1)', flexShrink: 0, background: 'rgba(12,10,8,0.4)' }}>
        {['#', 'Gildia', 'EXP', 'Czł.', 'Lv'].map(h => (
          <div key={h} style={{ color: '#6b6456', fontSize: 7, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</div>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {ranking.map((g, i) => (
          <div key={g.id} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 70px 52px 44px', gap: 6, padding: '8px 14px', borderBottom: '1px solid rgba(200,150,32,0.04)', background: i < 3 ? `rgba(200,150,32,${0.06 - i * 0.015})` : 'transparent' }}>
            <div style={{ color: i === 0 ? '#FCD34D' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#9a9182', fontWeight: 'bold', fontSize: i < 3 ? 16 : 11, lineHeight: 1 }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
            </div>
            <div>
              <div style={{ color: '#e8e2d4', fontWeight: 'bold', fontSize: 10 }}>[{g.tag}] {g.nazwa}</div>
              {i < 3 && pill('#e7c158', RANGA_LABEL.mistrz.replace('★ ', '') + ': ' + g.mistrz_nazwa)}
            </div>
            <div style={{ color: '#f7e3a4', fontSize: 9, alignSelf: 'center' }}>{fmtNum(g.gildia_exp || 0)}</div>
            <div style={{ color: '#4ADE80', fontSize: 9, alignSelf: 'center' }}>{g.member_count}</div>
            <div style={{ color: '#e7c158', fontSize: 9, alignSelf: 'center', fontWeight: 'bold' }}>Lv{g.lvl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── RAIDS TAB ─────────────────────────────────────────────────────────────────
function RaidsTab({ guild, postacId, onUpdate, flashMsg }) {
  const [raid, setRaid] = useState(null);
  const [form, setForm] = useState({ min_czlonkow: 3, nagroda_gold: 1000, nagroda_exp: 500 });
  const [loading, setLoading] = useState(true);

  const loadRaid = useCallback(() => { api.social.guildRaidActive().then(r => { setRaid(r || null); setLoading(false); }); }, []);
  useEffect(() => { loadRaid(); }, [loadRaid]);

  const startRaid    = async () => { const r = await api.social.guildRaidStart(form);         r.ok ? (flashMsg('Rajd rozpoczęty!'), loadRaid()) : flashMsg(r.error || 'Błąd'); };
  const joinRaid     = async () => { const r = await api.social.guildRaidJoin(raid.id);        r.ok ? (flashMsg('Dołączono!'), loadRaid()) : flashMsg(r.error || 'Błąd'); };
  const completeRaid = async () => { const r = await api.social.guildRaidComplete(raid.id);   r.ok ? (flashMsg(`Ukończono! ${r.goldPerMember}g i ${r.expPerMember}exp każdy`), loadRaid(), onUpdate()) : flashMsg(r.error || 'Błąd'); };

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9a9182', fontSize: 10 }}>Ładowanie...</div>;

  const uczestnicy = raid ? JSON.parse(raid.uczestnicy || '[]') : [];
  const joined = uczestnicy.includes(postacId);
  const readyPct = raid ? Math.min(100, (uczestnicy.length / raid.min_czlonkow) * 100) : 0;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {raid ? (
        <Card color='#3B82F6' glow>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#60A5FA', fontSize: 10, fontWeight: 'bold', marginBottom: 10 }}>
            <IconSword size={12} /> Aktywny Rajd Gildii
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            {[['Min. drużyna', raid.min_czlonkow + ' os.'], ['Uczestnicy', `${uczestnicy.length}/${raid.min_czlonkow}`], ['Pula złota', fmtNum(raid.nagroda_gold) + 'g'], ['Pula EXP', fmtNum(raid.nagroda_exp)]].map(([l, v]) => (
              <div key={l} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 5, padding: '6px 8px' }}>
                <div style={{ color: '#9a9182', fontSize: 8 }}>{l}</div>
                <div style={{ color: '#e8e2d4', fontWeight: 'bold', fontSize: 11 }}>{v}</div>
              </div>
            ))}
          </div>
          <ProgressBar pct={readyPct} color={readyPct >= 100 ? '#22C55E' : '#60A5FA'} height={6} />
          <div style={{ color: '#9a9182', fontSize: 8, marginTop: 4, marginBottom: 10 }}>
            {uczestnicy.length >= raid.min_czlonkow ? '✓ Gotowi do rajdu!' : `Potrzeba ${raid.min_czlonkow - uczestnicy.length} więcej uczestników`}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {!joined && <Btn onClick={joinRaid} color='#60A5FA'><IconPlus size={11} /> Dołącz</Btn>}
            {joined && <span style={{ color: '#4ADE80', fontSize: 9, alignSelf: 'center' }}>✓ Dołączyłeś</span>}
            {guild.myRanga === 'mistrz' && <Btn onClick={completeRaid} color='#FCD34D'><IconGift size={11} /> Zakończ & Rozdaj</Btn>}
          </div>
        </Card>
      ) : (
        <div style={{ color: '#374151', fontSize: 10, textAlign: 'center', padding: '16px 0' }}>Brak aktywnego rajdu</div>
      )}

      {guild.myRanga === 'mistrz' && !raid && (
        <Card>
          <SectionTitle><IconSword size={11} /> Rozpocznij Rajd</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['min_czlonkow', 'Min. uczestników'], ['nagroda_gold', 'Pula złota (g)'], ['nagroda_exp', 'Pula EXP']].map(([k, l]) => (
              <div key={k}><Label>{l}</Label><Input type="number" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} /></div>
            ))}
            <Btn onClick={startRaid} color='#60A5FA' wide><IconSword size={11} /> Rozpocznij Rajd</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',      Icon: IconCastle,    label: 'Przegląd' },
  { id: 'members',       Icon: IconUsers,     label: 'Członkowie' },
  { id: 'contributions', Icon: IconTrophy,    label: 'Wkłady' },
  { id: 'treasury',      Icon: IconCoin,      label: 'Skarbiec' },
  { id: 'recruitment',   Icon: IconPlus,      label: 'Rekrutacja' },
  { id: 'diplomacy',     Icon: IconFlag,      label: 'Dyplomacja' },
  { id: 'quests',        Icon: IconScroll,    label: 'Misje' },
  { id: 'buffs',         Icon: IconSparkles,  label: 'Bonusy' },
  { id: 'ranking',       Icon: IconAward,     label: 'Ranking' },
  { id: 'raids',         Icon: IconSword,     label: 'Rajdy' },
];

export default function GuildPanel({ onClose, socket, postacId }) {
  const [guild,     setGuild]   = useState(null);
  const [guildList, setGuildList] = useState([]);
  const [mainTab,   setMainTab] = useState('my');
  const [innerTab,  setInnerTab] = useState('overview');
  const [flash,     setFlash]   = useState('');
  const [flashType, setFlashType] = useState('ok');
  const [form,      setForm]    = useState({ nazwa: '', tag: '', opis: '' });
  const [view,      setView]    = useState('info');
  const [applyText, setApplyText] = useState('');

  const flashMsg = (msg, type = 'ok') => { setFlash(msg); setFlashType(type); setTimeout(() => setFlash(''), 3000); };

  const load = useCallback(async () => {
    const r = await api.social.guildMy();
    setGuild(r || false);
  }, []);
  const loadList = useCallback(() => { api.social.guildList().then(r => Array.isArray(r) && setGuildList(r)); }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (mainTab === 'list') loadList(); }, [mainTab, loadList]);

  const create = async () => {
    const r = await api.social.guildCreate(form);
    r.ok ? (flashMsg('Gildia założona!'), setView('info'), load()) : flashMsg(r.error || 'Błąd', 'err');
  };
  const join = async id => {
    const r = await api.social.guildJoin(id);
    r.ok ? (flashMsg(`Dołączono!`), setMainTab('my'), load()) : flashMsg(r.error || 'Błąd', 'err');
  };
  const apply = async id => {
    const r = await api.social.guildApply(id, applyText);
    r.ok ? flashMsg('Podanie złożone!') : flashMsg(r.error || 'Błąd', 'err');
  };
  const leave = async () => {
    if (!window.confirm('Opuścić gildię?')) return;
    const r = await api.social.guildLeave();
    r.ok ? (flashMsg(r.disbanded ? 'Gildia rozwiązana' : 'Opuściłeś gildię'), setGuild(false)) : flashMsg(r.error || 'Błąd', 'err');
  };

  const renderTab = () => {
    if (!guild) return null;
    const props = { guild, onUpdate: load, flashMsg };
    switch (innerTab) {
      case 'overview':      return <OverviewTab      {...props} socket={socket} />;
      case 'members':       return <MembersTab       {...props} postacId={postacId} />;
      case 'contributions': return <ContributionsTab guild={guild} />;
      case 'treasury':      return <TreasuryTab      {...props} />;
      case 'recruitment':   return <RecruitmentTab   {...props} />;
      case 'diplomacy':     return <DiplomacyTab     {...props} />;
      case 'quests':        return <QuestsTab        {...props} />;
      case 'buffs':         return <BuffsTab         {...props} />;
      case 'ranking':       return <RankingTab />;
      case 'raids':         return <RaidsTab         {...props} postacId={postacId} />;
      default:              return null;
    }
  };

  const onlineCount = guild && guild !== false ? (guild.members?.filter(m => m.zalogowany).length || 0) : 0;

  const styleGildii = `
    .veldoria-guild-overlay { overscroll-behavior: contain; -webkit-tap-highlight-color: transparent; }
    .veldoria-guild-panel { min-width: 0; }
    .veldoria-guild-my-layout, .veldoria-guild-main, .veldoria-guild-sidebar { min-width: 0; min-height: 0; }

    .veldoria-guild-nav::-webkit-scrollbar, .veldoria-guild-list::-webkit-scrollbar { height: 4px; width: 4px; }
    .veldoria-guild-nav::-webkit-scrollbar-thumb, .veldoria-guild-list::-webkit-scrollbar-thumb {
      background: rgba(200,150,32,.3); border-radius: 10px;
    }

    @media (max-width: 720px) {
      /* na telefonie panel zajmuje cały ekran, bez ramki i marginesów */
      .veldoria-guild-overlay {
        align-items: stretch !important; justify-content: stretch !important;
        background: rgba(0,0,0,.94) !important; backdrop-filter: blur(8px) !important;
      }
      .veldoria-guild-panel {
        width: 100vw !important; max-width: none !important;
        height: 100dvh !important; max-height: none !important;
        border-radius: 0 !important; border-left: 0 !important; border-right: 0 !important;
      }

      /* boczne menu zamienia się w pasek zakładek nad treścią */
      .veldoria-guild-my-layout { flex-direction: column !important; overflow: hidden !important; }
      .veldoria-guild-sidebar {
        width: 100% !important; height: auto !important; flex: 0 0 auto !important;
        flex-direction: row !important; border-right: 0 !important;
        border-bottom: 1px solid rgba(200,150,32,.14) !important; background: rgba(8,7,5,.95) !important;
      }
      .veldoria-guild-mini-card, .veldoria-guild-leave { display: none !important; }
      .veldoria-guild-nav {
        display: flex !important; flex: 1 !important; min-width: 0;
        overflow-x: auto !important; overflow-y: hidden !important;
        padding: 4px !important; gap: 3px; -webkit-overflow-scrolling: touch;
      }
      .veldoria-guild-nav button {
        width: auto !important; min-width: max-content !important; min-height: 42px;
        padding: 7px 10px !important; border-left: 0 !important;
        border-bottom: 2px solid transparent !important; border-radius: 5px;
        justify-content: center; white-space: nowrap;
      }
      .veldoria-guild-nav button > span:last-child { display: none; }

      .veldoria-guild-main { width: 100% !important; min-width: 0 !important; flex: 1 1 auto !important; overflow: hidden !important; }
      .veldoria-guild-list { padding: 8px !important; -webkit-overflow-scrolling: touch; }
      .veldoria-guild-list-card { padding: 10px !important; }
      .veldoria-guild-list-card > div:first-child { flex-wrap: wrap !important; }
      .veldoria-guild-list-card > div:first-child > div:nth-child(2) { flex: 1 1 calc(100% - 58px) !important; min-width: 0 !important; }
      .veldoria-guild-list-card > div:last-child { flex-wrap: wrap !important; }
      .veldoria-guild-main input, .veldoria-guild-main textarea { max-width: 100%; font-size: 12px !important; }

      /* siatki, które na telefonie nie mieszczą się w szerokości */
      .veldoria-guild-main [style*="repeat(4,1fr)"], .veldoria-guild-main [style*="repeat(4, 1fr)"] {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
      .veldoria-guild-main [style*="1fr auto 1fr"] { grid-template-columns: 1fr 1fr !important; }
      .veldoria-guild-main [style*="10px 34px 1fr 55px 90px 80px"] {
        grid-template-columns: 8px 26px minmax(0,1fr) 40px 62px 54px !important; gap: 4px !important; padding: 5px 8px !important;
      }
      .veldoria-guild-main [style*="36px 1fr 70px 52px 44px"] {
        grid-template-columns: 28px minmax(0,1fr) 54px 42px 38px !important; gap: 4px !important; padding: 5px 8px !important;
      }
    }

    @media (max-height: 620px) and (orientation: landscape) {
      .veldoria-guild-nav button { min-height: 38px; padding: 5px 9px !important; }
      .veldoria-guild-list { padding: 6px !important; }
      .veldoria-guild-list-card { margin-bottom: 6px !important; }
    }

    /* Telefon w poziomie: pełny ekran, ale boczne menu zostaje — przy 390 px
       wysokości pasek zakładek nad treścią zjadałby zbyt dużo miejsca. */
    @media (max-height: 520px) and (orientation: landscape) {
      .veldoria-guild-overlay { align-items: stretch !important; justify-content: stretch !important; }
      .veldoria-guild-panel {
        width: 100vw !important; max-width: none !important;
        height: 100dvh !important; max-height: none !important; border-radius: 0 !important;
      }
      .veldoria-guild-sidebar { width: 132px !important; }
      .veldoria-guild-mini-card { display: none !important; }
    }
  `;

  return (
    <>
    <style>{styleGildii}</style>
    <div className="veldoria-guild-overlay"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="veldoria-guild-panel" style={{
        width: 780, maxWidth: '99vw', height: '90vh', maxHeight: 820,
        background: 'linear-gradient(160deg,rgba(20,16,12,0.99),rgba(12,10,8,0.99))',
        border: '1px solid rgba(200,150,32,0.2)', borderRadius: 12,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 20px 80px rgba(0,0,0,0.9), inset 0 1px 0 rgba(200,150,32,0.08)',
        fontFamily: 'Verdana,sans-serif',
      }}>

        {/* ── TOPBAR ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(12,10,8,0.6)', borderBottom: '1px solid rgba(200,150,32,0.12)', flexShrink: 0 }}>
          <IconCastle size={16} style={{ color: '#e7c158' }} />
          <span style={{ color: '#f7e3a4', fontWeight: 'bold', fontSize: 14 }}>Gildie</span>
          <div style={{ display: 'flex', gap: 1, marginLeft: 8 }}>
            {[['my', 'Moja gildia'], ['list', 'Lista gildii']].map(([t, l]) => (
              <button key={t} onClick={() => setMainTab(t)} style={{
                padding: '3px 12px', background: mainTab === t ? 'rgba(200,150,32,0.1)' : 'none',
                border: 'none', borderBottom: mainTab === t ? '2px solid #e7c158' : '2px solid transparent',
                cursor: 'pointer', fontSize: 9, color: mainTab === t ? '#f7e3a4' : '#9a9182',
                fontWeight: mainTab === t ? 'bold' : 'normal', fontFamily: 'Verdana,sans-serif',
              }}>{l}</button>
            ))}
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#9a9182', cursor: 'pointer', display: 'flex' }}>
            <IconX size={18} />
          </button>
        </div>

        {/* ── FLASH ── */}
        {flash && (
          <div style={{
            padding: '5px 16px', fontSize: 9, flexShrink: 0,
            color: flashType === 'err' ? '#F87171' : '#4ADE80',
            background: flashType === 'err' ? 'rgba(50,6,6,0.6)' : 'rgba(6,50,20,0.6)',
            borderBottom: `1px solid ${flashType === 'err' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.2)'}`,
          }}>{flash}</div>
        )}

        {/* ── MY GUILD TAB ── */}
        {mainTab === 'my' && (
          guild === null
            ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9a9182', fontSize: 11 }}>Ładowanie...</div>
            : guild === false
              ? (
                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                  {view === 'info' && (
                    <div style={{ textAlign: 'center', paddingTop: 40 }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>🏰</div>
                      <div style={{ color: '#9a9182', fontSize: 11, marginBottom: 20 }}>Nie należysz do żadnej gildii</div>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        <Btn onClick={() => setView('create')} color='#FCD34D'><IconPlus size={12} /> Załóż gildię</Btn>
                        <Btn onClick={() => { setMainTab('list'); loadList(); }} color='#e7c158'><IconUsers size={12} /> Dołącz do gildii</Btn>
                      </div>
                    </div>
                  )}
                  {view === 'create' && (
                    <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ color: '#FCD34D', fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>Załóż Gildię</div>
                      {[['nazwa', 'Nazwa gildii', 50], ['tag', 'Tag [2-5 znaków]', 5], ['opis', 'Opis (opcjonalnie)', 200]].map(([k, l, max]) => (
                        <div key={k}>
                          <Label>{l}</Label>
                          {k === 'opis'
                            ? <Input value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={l} maxLength={max} rows={2} />
                            : <Input value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={l} maxLength={max} />
                          }
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Btn onClick={create} color='#22C55E' disabled={!form.nazwa || !form.tag}><IconCheck size={12} /> Utwórz gildię</Btn>
                        <Btn onClick={() => setView('info')} color='#9a9182'>Anuluj</Btn>
                      </div>
                    </div>
                  )}
                </div>
              )
              : (
                <div className="veldoria-guild-my-layout" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                  {/* ── LEFT SIDEBAR: nav ── */}
                  <div className="veldoria-guild-sidebar" style={{ width: 168, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(200,150,32,0.1)', background: 'rgba(12,10,8,0.5)' }}>
                    {/* Guild mini-card */}
                    <div className="veldoria-guild-mini-card" style={{ padding: '12px 12px 8px', borderBottom: '1px solid rgba(200,150,32,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 7, background: 'linear-gradient(135deg,rgba(200,150,32,0.2),rgba(0,0,0,0.6))', border: '1px solid rgba(200,150,32,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#FCD34D', fontWeight: 'bold' }}>
                          {(guild.tag || 'G')[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: '#FCD34D', fontSize: 9, fontWeight: 'bold' }}>[{guild.tag}]</div>
                          <div style={{ color: '#f7e3a4', fontSize: 10, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guild.nazwa}</div>
                        </div>
                      </div>
                      {/* EXP micro-bar */}
                      <ProgressBar pct={((guild.gildia_exp || 0) % 10000) / 100} color='#e7c158' height={3} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ color: '#9a9182', fontSize: 7 }}>Lv{guild.lvl}</span>
                        <span style={{ color: '#4ADE80', fontSize: 7 }}>● {onlineCount}/{guild.members?.length || 0}</span>
                      </div>
                    </div>

                    {/* Nav tabs */}
                    <div className="veldoria-guild-nav" style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
                      {TABS.map(({ id, Icon, label }) => {
                        const active = innerTab === id;
                        return (
                          <button key={id} onClick={() => setInnerTab(id)} style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 12px', background: active ? 'rgba(200,150,32,0.1)' : 'none',
                            border: 'none', borderLeft: active ? '3px solid #e7c158' : '3px solid transparent',
                            cursor: 'pointer', color: active ? '#f7e3a4' : '#9a9182',
                            fontSize: 9, fontWeight: active ? 'bold' : 'normal',
                            fontFamily: 'Verdana,sans-serif', textAlign: 'left',
                            transition: 'all 0.12s',
                          }}>
                            <span style={{ color: active ? '#e7c158' : '#4A5A30', flexShrink: 0 }}><Icon size={13} /></span>
                            <span>{label}</span>
                            {active && <span style={{ marginLeft: 'auto', color: '#e7c158', flexShrink: 0 }}><IconChevronRight size={10} /></span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Leave button */}
                    <div className="veldoria-guild-leave" style={{ padding: '8px 10px', borderTop: '1px solid rgba(200,150,32,0.08)', flexShrink: 0 }}>
                      <Btn onClick={leave} danger wide small><IconX size={10} /> Opuść gildię</Btn>
                    </div>
                  </div>

                  {/* ── MAIN CONTENT ── */}
                  <div className="veldoria-guild-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Tab header */}
                    <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(200,150,32,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {(() => { const t = TABS.find(t => t.id === innerTab); return t ? <><t.Icon size={14} style={{ color: '#e7c158' }} /><span style={{ color: '#e7c158', fontWeight: 'bold', fontSize: 11 }}>{t.label}</span></> : null; })()}
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 5, color: '#9a9182', fontSize: 8 }}>
                        {pill(RANGA_COLOR[guild.myRanga] || '#e8e2d4', RANGA_LABEL[guild.myRanga])}
                      </div>
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      {renderTab()}
                    </div>
                  </div>
                </div>
              )
        )}

        {/* ── LIST TAB ── */}
        {mainTab === 'list' && (
          <div className="veldoria-guild-list" style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
            {guildList.length === 0
              ? <div style={{ color: '#374151', textAlign: 'center', paddingTop: 40, fontSize: 11 }}>Brak gildii — bądź pierwszym Mistrzem!</div>
              : guildList.map(g => (
                <div key={g.id} className="veldoria-guild-list-card" style={{ padding: '12px 14px', background: 'rgba(16,13,10,0.5)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: g.otwarta ? 0 : 8 }}>
                    {/* Emblem */}
                    <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 7, background: 'linear-gradient(135deg,rgba(200,150,32,0.15),rgba(0,0,0,0.5))', border: '1px solid rgba(200,150,32,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#FCD34D', fontWeight: 'bold' }}>
                      {(g.tag || 'G')[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ color: '#FCD34D', fontWeight: 'bold', fontSize: 10 }}>[{g.tag}]</span>
                        <span style={{ color: '#e8e2d4', fontWeight: 'bold', fontSize: 12 }}>{g.nazwa}</span>
                        {pill(g.otwarta ? '#22C55E' : '#F87171', g.otwarta ? '🔓 Otwarta' : '🔒 Zamknięta')}
                      </div>
                      <div style={{ color: '#9a9182', fontSize: 8, marginTop: 3 }}>Mistrz: {g.mistrz_nazwa} · {g.czlonkowie} członków · Lv{g.lvl}</div>
                      {g.opis && <div style={{ color: '#374151', fontSize: 8, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.opis}</div>}
                    </div>
                    <Btn onClick={() => join(g.id)} color='#e7c158'><IconChevronRight size={11} /> Dołącz</Btn>
                  </div>
                  {!g.otwarta && (
                    <div style={{ display: 'flex', gap: 6, paddingTop: 8, borderTop: '1px solid rgba(200,150,32,0.07)', marginTop: 4 }}>
                      <Input value={applyText} onChange={e => setApplyText(e.target.value)} placeholder="Treść podania (opcjonalnie)..." style={{ flex: 1, fontSize: 9 }} />
                      <Btn onClick={() => apply(g.id)} color='#60A5FA' small><IconCheck size={10} /> Złóż podanie</Btn>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
