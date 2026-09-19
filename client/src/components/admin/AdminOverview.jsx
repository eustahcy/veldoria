// „Przegląd serwera” — pierwsza strona panelu administratora.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../api';
import { A, Box, GoldBtn } from './AdminApp';

const cfgVal = (cfg, key) => cfg.find(c => c.key === key)?.value;
const onOff = (v, onTxt = 'Włączony', offTxt = 'Wyłączony') => (v === '1' || v === true ? onTxt : offTxt);

function StatCard({ icon, value, label, sub, color, bar, active }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6, padding: '14px 14px 12px', borderRadius: 4, minWidth: 0,
      background: active ? 'linear-gradient(180deg,rgba(95,208,122,0.12),rgba(16,14,11,0.95) 70%)' : A.panel,
      border: `1px solid ${active ? '#2f6b3a' : A.bronze + 'aa'}`,
      boxShadow: active ? '0 0 16px rgba(95,208,122,0.12)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 30, color, filter: `drop-shadow(0 0 8px ${color}66)` }}>{icon}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: A.serif, fontSize: 24, color: A.goldHi, lineHeight: 1 }}>{value ?? '—'}</div>
          <div style={{ fontSize: 13, color: A.text, marginTop: 5, whiteSpace: 'nowrap' }}>{label}</div>
        </div>
      </div>
      {sub && <div style={{ fontSize: 12, color: A.muted, textAlign: 'right' }}>{sub}</div>}
      {bar != null && (
        <div style={{ height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.6)', overflow: 'hidden', border: '1px solid #000' }}>
          <div style={{ width: `${Math.min(100, bar)}%`, minWidth: bar > 0 ? 6 : 0, height: '100%', background: `linear-gradient(90deg,#2f8a45,${A.green})`, boxShadow: `0 0 8px ${A.green}` }} />
        </div>
      )}
    </div>
  );
}

function QuickTile({ icon, label, onClick, color = A.goldHi }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      minHeight: 92, padding: '12px 6px', borderRadius: 3, cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9,
      background: hov ? 'linear-gradient(180deg,#2a2217,#120e09)' : 'linear-gradient(180deg,#1b1712,#0d0b08)',
      border: `1px solid ${hov ? A.gold : A.bronze}`, boxShadow: hov ? '0 0 14px rgba(231,193,88,0.2)' : 'inset 0 1px 0 rgba(255,255,255,0.05)',
      color: A.text, fontSize: 12.5, textAlign: 'center', lineHeight: 1.25, transition: 'all .12s',
    }}>
      <span style={{ fontSize: 26, color, filter: `drop-shadow(0 0 6px ${color}66)` }}>{icon}</span>
      {label}
    </button>
  );
}

const Select = ({ value, onChange, children, style }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{
    width: '100%', padding: '11px 12px', borderRadius: 3, background: '#0b0907', color: A.text,
    border: `1px solid ${A.bronze}`, fontSize: 13.5, fontFamily: A.font, outline: 'none', ...style,
  }}>{children}</select>
);
const Num = ({ value, onChange, placeholder }) => (
  <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
    width: '100%', padding: '11px 10px', borderRadius: 3, background: '#0b0907', color: A.text,
    border: `1px solid ${A.bronze}`, fontSize: 13.5, outline: 'none', boxSizing: 'border-box',
  }} />
);
const Check = ({ checked, onChange, children }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: A.text, cursor: 'pointer', padding: '4px 0' }}>
    <span onClick={() => onChange(!checked)} style={{
      width: 18, height: 18, borderRadius: 2, display: 'grid', placeItems: 'center', flexShrink: 0,
      border: `1px solid ${checked ? A.gold : A.bronze}`, background: checked ? 'linear-gradient(180deg,#e7c158,#9a7422)' : '#0b0907',
      color: '#1a1206', fontSize: 13, fontWeight: 900,
    }}>{checked ? '✓' : ''}</span>
    <span onClick={() => onChange(!checked)}>{children}</span>
  </label>
);

// Etykieta typu wpisu w dzienniku admina
const LOG_KIND = (action = '') =>
  /config|maintenance|server/.test(action) ? ['SYSTEM', A.blue]
    : /heal|kick|ban|unban/.test(action) ? ['GRACZ', A.green]
      : ['ADMIN', A.amber];
const LOG_ICON = (action = '') =>
  /teleport|goto|pull/.test(action) ? '➤' : /rank/.test(action) ? '♛' : /item|gold/.test(action) ? '🎁'
    : /boss|mob/.test(action) ? '👾' : /broadcast/.test(action) ? '📢' : /config/.test(action) ? '⚙' : '👤';
const ACTION_PL = {
  set_rank: 'Zmiana rangi', teleport: 'Teleport', teleport_self: 'Teleport (sam)', goto_player: 'Do gracza', pull_player: 'Przyciągnięcie',
  give_gold: 'Złoto', give_item: 'Przedmiot', give_exp: 'EXP', set_level: 'Zmień poziom', set_prestige: 'Zmień prestiż', set_class: 'Zmiana klasy',
  heal_player: 'Uleczenie', heal_all: 'Uleczenie wszystkich', kick: 'Wyrzucenie', ban: 'Ban', unban: 'Odbanowanie',
  broadcast: 'Komunikat', config_update: 'Zmiana konfiguracji', clear_chat: 'Czyszczenie czatu',
  reset_mobs: 'Respawn mobów', reset_all_mobs: 'Globalny respawn', spawn_boss: 'Przywołanie bossa', kill_boss: 'Zabicie bossa',
};

export default function AdminOverview({ ctx }) {
  const { status, go, narrow, reloadStatus } = ctx;
  const [stats, setStats] = useState(null);
  const [cfg, setCfg] = useState([]);
  const [players, setPlayers] = useState([]);
  const [maps, setMaps] = useState([]);
  const [logs, setLogs] = useState([]);
  const [flash, setFlash] = useState(null);

  const [tpMode, setTpMode] = useState('player');
  const [tpPlayer, setTpPlayer] = useState('');
  const [tpMap, setTpMap] = useState('');
  const [tpX, setTpX] = useState('');
  const [tpY, setTpY] = useState('');

  const [bc, setBc] = useState('');
  const [bcChat, setBcChat] = useState(true);
  const [bcCenter, setBcCenter] = useState(false);
  const [bcSound, setBcSound] = useState(false);

  const load = useCallback(() => {
    api.adminDash.stats().then(s => s && !s.error && setStats(s)).catch(() => {});
    api.adminDash.config().then(c => Array.isArray(c) && setCfg(c)).catch(() => {});
    api.adminDash.players().then(p => Array.isArray(p) && setPlayers(p)).catch(() => {});
    api.adminDash.maps().then(m => Array.isArray(m) && setMaps(m)).catch(() => {});
    api.adminDash.auditLog({ limit: 8 }).then(l => Array.isArray(l) && setLogs(l)).catch(() => {});
  }, []);
  useEffect(() => { load(); const id = setInterval(load, 20000); return () => clearInterval(id); }, [load]);

  const msg = (text, ok = true) => { setFlash({ text, ok }); setTimeout(() => setFlash(null), 3200); };
  const res = (r, okText) => { if (r?.ok) { msg(okText); load(); reloadStatus(); } else msg(r?.error || 'Nie udało się', false); };

  const online = players.filter(p => Number(p.zalogowany) === 1);
  const maxPlayers = Number(cfgVal(cfg, 'max_players')) || 200;
  const mapName = useMemo(() => Object.fromEntries(maps.map(m => [m.id, m.nazwa])), [maps]);
  const byMap = useMemo(() => {
    const cnt = {};
    online.forEach(p => { cnt[p.mapa] = (cnt[p.mapa] || 0) + 1; });
    return Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [online]);

  const teleport = async () => {
    if (tpMode === 'player') {
      if (!tpPlayer) return msg('Wybierz gracza', false);
      return res(await api.adminDash.gotoPlayer(Number(tpPlayer)), 'Przeniesiono do gracza — zamknij panel');
    }
    if (!tpMap) return msg('Wybierz mapę', false);
    const x = tpMode === 'coords' ? parseInt(tpX) : NaN, y = tpMode === 'coords' ? parseInt(tpY) : NaN;
    res(await api.adminDash.teleportSelf(Number(tpMap), Number.isFinite(x) ? x : 35, Number.isFinite(y) ? y : 35), 'Teleportowano — zamknij panel');
  };

  const sendBroadcast = async () => {
    if (!bc.trim()) return msg('Wpisz wiadomość', false);
    if (!bcChat && !bcCenter) return msg('Zaznacz, gdzie wysłać komunikat', false);
    const r = await api.adminDash.broadcast(bc.trim(), { chat: bcChat, center: bcCenter, sound: bcSound });
    if (r?.ok) setBc('');
    res(r, 'Komunikat wysłany');
  };

  const grid = (min) => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 10 });
  const tabBtn = (id, label) => (
    <button key={id} onClick={() => setTpMode(id)} style={{
      flex: 1, padding: '9px 6px', cursor: 'pointer', borderRadius: 3, fontSize: 13, whiteSpace: 'nowrap',
      background: tpMode === id ? 'linear-gradient(180deg,#4a3818,#241a0b)' : '#0d0b08',
      border: `1px solid ${tpMode === id ? A.gold : A.bronze}`, color: tpMode === id ? A.goldHi : A.muted,
    }}>{label}</button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: narrow ? 26 : 34 }}>⚙️</span>
        <div>
          <div style={{ fontFamily: A.serif, fontSize: narrow ? 18 : 22, color: A.goldHi }}>Przegląd serwera</div>
          <div style={{ fontSize: 13, color: A.muted }}>Szybki podgląd najważniejszych informacji o serwerze</div>
        </div>
        <button onClick={() => { load(); reloadStatus(); }} title="Odśwież" style={{ marginLeft: 'auto', background: 'none', border: `1px solid ${A.bronze}`, borderRadius: 3, color: A.gold, cursor: 'pointer', padding: '7px 11px', fontSize: 15 }}>↻</button>
      </div>

      {flash && (
        <div style={{ padding: '10px 14px', borderRadius: 3, fontSize: 13.5, border: `1px solid ${flash.ok ? '#2f6b3a' : '#a8281c'}`, background: flash.ok ? 'rgba(95,208,122,0.1)' : 'rgba(168,40,28,0.15)', color: flash.ok ? '#9be8ac' : '#ff9b8b' }}>
          {flash.ok ? '✓' : '✕'} {flash.text}
        </div>
      )}

      {/* Liczniki */}
      <div style={grid(narrow ? 140 : 128)}>
        <StatCard active icon="👥" color={A.green} value={status?.online ?? stats?.online} label="Gracze online" sub={`/ ${maxPlayers}`} bar={((status?.online || 0) / maxPlayers) * 100} />
        <StatCard icon="👤" color={A.blue} value={stats?.accounts} label="Konta" sub="Wszystkich" />
        <StatCard icon="🧙" color={A.amber} value={stats?.total} label="Postacie" sub={`Online: ${online.length}`} />
        <StatCard icon="⛔" color={A.red} value={stats?.banned} label="Bany" sub="Aktywnych" />
        <StatCard icon="👾" color={A.purple} value={stats?.mobs} label="Moby" sub={`Martwych: ${stats?.deadMobs ?? 0}`} />
        <StatCard icon="🗺" color={A.gold} value={status?.maps ?? maps.length} label="Mapy" sub="W bazie" />
        <StatCard icon="🎁" color={A.amber} value={stats?.items} label="Itemy" sub="W tabelach łupów" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0,1.45fr) minmax(0,1fr) minmax(0,1fr)', gap: 12 }}>
        <Box icon="🔨" title="Szybkie akcje" sub="Najczęściej używane funkcje administratora">
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${narrow ? 3 : 4}, 1fr)`, gap: 8 }}>
            <QuickTile icon="➤" label="Teleportuj gracza" onClick={() => go('players')} />
            <QuickTile icon="♛" label="Zmień rangę" onClick={() => go('players')} />
            <QuickTile icon="🎁" label="Dodaj item" onClick={() => go('players')} />
            <QuickTile icon="👾" label="Respawn mobów" onClick={() => go('mobs')} color={A.purple} />
            <QuickTile icon="💬" label="Czat i komunikaty" onClick={() => go('chat')} color={A.blue} />
            <QuickTile icon="📅" label="Eventy i bossy" onClick={() => go('events')} />
            <QuickTile icon="🧹" label="Wyczyść czat" onClick={async () => { if (window.confirm('Usunąć całą historię czatu?')) res(await api.adminDash.clearChat(), 'Czat wyczyszczony'); }} />
            <QuickTile icon="⚙" label="Ustawienia serwera" onClick={() => go('config')} />
          </div>
        </Box>

        <Box icon="➤" title="Teleportacja" sub="Szybki teleport do gracza lub na mapę">
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {tabBtn('player', 'Do gracza')}{tabBtn('map', 'Na mapę')}{tabBtn('coords', 'Współrzędne')}
          </div>
          {tpMode === 'player' ? (
            <Select value={tpPlayer} onChange={setTpPlayer}>
              <option value="">Wybierz gracza…</option>
              {online.map(p => <option key={p.id} value={p.id}>{p.nazwa} (poz. {p.poziom}) — {mapName[p.mapa] || `mapa ${p.mapa}`}</option>)}
              {online.length === 0 && <option disabled>Nikt nie jest online</option>}
            </Select>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Select value={tpMap} onChange={setTpMap}>
                <option value="">Wybierz mapę…</option>
                {maps.map(m => <option key={m.id} value={m.id}>#{m.id} {m.nazwa}</option>)}
              </Select>
              {tpMode === 'coords' && (
                <div style={{ display: 'flex', gap: 8 }}><Num value={tpX} onChange={setTpX} placeholder="X" /><Num value={tpY} onChange={setTpY} placeholder="Y" /></div>
              )}
            </div>
          )}
          <GoldBtn onClick={teleport} style={{ width: '100%', marginTop: 14 }}>➤ Teleportuj</GoldBtn>
        </Box>

        <Box icon="💬" title="Komunikat globalny" sub="Wyślij wiadomość do wszystkich graczy">
          <textarea value={bc} onChange={e => setBc(e.target.value)} placeholder="Wpisz wiadomość…" maxLength={300} rows={3} style={{
            width: '100%', boxSizing: 'border-box', padding: 11, borderRadius: 3, background: '#0b0907', color: A.text,
            border: `1px solid ${A.bronze}`, fontSize: 13.5, fontFamily: A.font, resize: 'vertical', outline: 'none', marginBottom: 8,
          }} />
          <Check checked={bcChat} onChange={setBcChat}>Ogłoszenie na czacie (kanał System)</Check>
          <Check checked={bcCenter} onChange={setBcCenter}>Wiadomość na środku ekranu</Check>
          <Check checked={bcSound} onChange={v => { setBcSound(v); if (v) setBcCenter(true); }}>Dźwięk powiadomienia</Check>
          <GoldBtn onClick={sendBroadcast} style={{ width: '100%', marginTop: 10 }}>📢 Wyślij do wszystkich</GoldBtn>
        </Box>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0,2fr) minmax(0,1fr)', gap: 12 }}>
        <Box icon="📋" title="Ostatnie logi" sub="Najnowsze działania administracji" pad={12}
          right={<button onClick={() => go('audit')} style={{ background: 'none', border: 'none', color: A.gold, cursor: 'pointer', fontSize: 13 }}>Wszystkie ›</button>}>
          {logs.length === 0 && <div style={{ color: A.dim, fontSize: 13, padding: 10 }}>Brak wpisów.</div>}
          {logs.map(l => {
            const [kind, col] = LOG_KIND(l.action);
            const t = l.created_at ? new Date(l.created_at) : null;
            return (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 6px', borderBottom: `1px solid ${A.bronze}33`, fontSize: 13.5 }}>
                <span style={{ width: 18, textAlign: 'center', color: A.muted }}>{LOG_ICON(l.action)}</span>
                <span style={{ color: A.muted, width: 62, flexShrink: 0 }}>{t ? t.toLocaleTimeString('pl-PL') : ''}</span>
                <span style={{ width: 64, flexShrink: 0, textAlign: 'center', padding: '2px 0', borderRadius: 2, fontSize: 10.5, letterSpacing: 1, color: col, border: `1px solid ${col}66`, background: `${col}14` }}>{kind}</span>
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ACTION_PL[l.action] || l.action} {l.target ? <>→ <b style={{ color: A.goldHi, fontWeight: 'normal' }}>{l.target}</b></> : null}
                  <span style={{ color: A.dim }}> · {l.admin_name}</span>
                </span>
              </div>
            );
          })}
        </Box>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Box icon="✚" title="Gracze na mapach" pad={12}>
            {byMap.length === 0 && <div style={{ color: A.dim, fontSize: 13 }}>Nikt nie jest teraz w grze.</div>}
            {byMap.map(([mapa, n], i) => (
              <div key={mapa} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', fontSize: 13.5, borderRadius: 2,
                background: i === 0 ? 'rgba(95,208,122,0.08)' : 'transparent',
              }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: A.green, boxShadow: `0 0 6px ${A.green}` }} />
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mapName[mapa] || `Mapa #${mapa}`}</span>
                <span style={{ color: A.green }}>{n} gracz(y)</span>
              </div>
            ))}
          </Box>
          <Box icon="🔍" title="Szybkie informacje" pad={12}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 16px', fontSize: 13 }}>
              {[
                ['EXP', `${cfgVal(cfg, 'xp_multiplier') ?? '1'}x`],
                ['Konserwacja', onOff(cfgVal(cfg, 'maintenance_mode')), cfgVal(cfg, 'maintenance_mode') === '1' ? A.red : A.green],
                ['Loot', `${cfgVal(cfg, 'loot_chance') ?? '1'}x`],
                ['Rejestracja', onOff(cfgVal(cfg, 'registration_enabled'), 'Otwarta', 'Zamknięta'), cfgVal(cfg, 'registration_enabled') === '1' ? A.green : A.red],
                ['Respawn', `${cfgVal(cfg, 'respawn_multiplier') ?? '1'}x`],
                ['PvP', onOff(cfgVal(cfg, 'pvp_enabled'), 'Włączone', 'Wyłączone'), cfgVal(cfg, 'pvp_enabled') === '1' ? A.red : A.muted],
                ['Złoto', `${cfgVal(cfg, 'gold_multiplier') ?? '1'}x`],
                ['Max poziom', cfgVal(cfg, 'max_level') ?? '—'],
              ].map(([k, v, c]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ color: A.muted }}>{k}:</span><span style={{ color: c || A.text }}>{v}</span>
                </div>
              ))}
            </div>
          </Box>
        </div>
      </div>
    </div>
  );
}
