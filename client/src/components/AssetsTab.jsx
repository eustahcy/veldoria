/**
 * AssetsTab — shared between AdminPanel (in-game) and AdminDashboard (pre-game)
 * Handles PNG/GIF upload for: player skins, class skins, guild emblems, mob sprites, NPC sprites, custom files
 */
import { useState, useEffect, useCallback } from 'react';

const CLASSES = ['Wojownik', 'Paladyn', 'Mag', 'Lowca', 'Tropiciel', 'Tancerz Ostrzy'];

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg, ok, onDone }) {
  useEffect(() => { if (msg) { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); } }, [msg, onDone]);
  if (!msg) return null;
  const c = ok ? '#4ADE80' : '#F87171';
  return (
    <div style={{ padding: '8px 14px', borderRadius: 8, fontSize: 11, background: ok ? 'rgba(6,40,16,0.85)' : 'rgba(50,4,4,0.85)', border: `1px solid ${c}44`, color: c, display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
      <span style={{ fontSize: 14 }}>{ok ? '✓' : '✕'}</span> {msg}
    </div>
  );
}

// ── Inline search picker ───────────────────────────────────────────────────────
function Picker({ endpoint, label, placeholder, picked, onPick }) {
  const [search,  setSearch]  = useState('');
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    fetch(`/api/assets/search/${endpoint}?q=${encodeURIComponent(search)}`, { credentials: 'include' })
      .then(r => r.json()).then(r => { if (Array.isArray(r)) { setResults(r); setOpen(true); } }).catch(() => {});
  }, [search, endpoint]);

  const pick = item => { onPick(item); setSearch(item.nazwa || item.tag || `#${item.id}`); setResults([]); setOpen(false); };
  const clear = () => { onPick(null); setSearch(''); setResults([]); };

  return (
    <div>
      <div style={{ fontSize: 8, color: '#3A4828', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 5, fontFamily: 'Verdana,sans-serif' }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#3A4828', pointerEvents: 'none' }}>🔍</span>
        <input value={search} onChange={e => { setSearch(e.target.value); if (!e.target.value) clear(); }}
          placeholder={placeholder}
          style={{ width: '100%', padding: '7px 10px 7px 28px', background: 'rgba(6,10,4,0.8)', color: '#CDD4AA', border: `1px solid ${picked ? 'rgba(200,150,32,0.5)' : 'rgba(200,150,32,0.16)'}`, borderRadius: 6, fontSize: 10, outline: 'none', fontFamily: 'Verdana,sans-serif', boxSizing: 'border-box' }} />
      </div>
      {open && results.length > 0 && (
        <div style={{ maxHeight: 140, overflowY: 'auto', marginTop: 4, background: 'rgba(4,8,2,0.97)', border: '1px solid rgba(200,150,32,0.2)', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>
          {results.map(r => (
            <div key={r.id} onClick={() => pick(r)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', cursor: 'pointer', borderBottom: '1px solid rgba(200,150,32,0.06)', background: picked?.id === r.id ? 'rgba(200,150,32,0.08)' : 'transparent' }}>
              {r.obrazek && <div style={{ width: 18, height: 26, backgroundImage: `url(/assets/${r.obrazek})`, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#CDD4AA', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nazwa || r.tag}</div>
                {r.profesja && <div style={{ color: '#3A4828', fontSize: 8 }}>{r.profesja}</div>}
                {r.mapa !== undefined && <div style={{ color: '#3A4828', fontSize: 8 }}>Mapa {r.mapa}</div>}
              </div>
              <span style={{ color: '#3A4828', fontSize: 8 }}>#{r.id}</span>
            </div>
          ))}
        </div>
      )}
      {picked && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, padding: '6px 9px', background: 'rgba(200,150,32,0.06)', border: '1px solid rgba(200,150,32,0.35)', borderRadius: 6 }}>
          {picked.obrazek && <div style={{ width: 18, height: 26, backgroundImage: `url(/assets/${picked.obrazek})`, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', flexShrink: 0 }} />}
          <span style={{ color: '#E8D070', fontSize: 10, fontWeight: 'bold', flex: 1 }}>✓ {picked.nazwa || picked.tag || `#${picked.id}`}</span>
          <button onClick={clear} style={{ background: 'none', border: 'none', color: '#5A6840', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 2 }}>✕</button>
        </div>
      )}
    </div>
  );
}

// ── Drop zone ──────────────────────────────────────────────────────────────────
function DropZone({ onChange, uploading, disabled, hint }) {
  const [hover, setHover] = useState(false);

  const onDrop = e => {
    e.preventDefault(); setHover(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) onChange({ target: { files: [f] } });
  };

  return (
    <label
      onDragOver={e => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={onDrop}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '24px 16px', borderRadius: 10, cursor: uploading ? 'not-allowed' : 'pointer',
        border: `2px dashed ${hover ? 'rgba(200,150,32,0.6)' : 'rgba(200,150,32,0.2)'}`,
        background: hover ? 'rgba(200,150,32,0.05)' : 'rgba(6,10,4,0.5)',
        transition: 'all .15s', textAlign: 'center',
      }}
    >
      <input type="file" accept=".png,.gif" onChange={onChange} disabled={uploading || disabled}
        style={{ display: 'none' }} />
      {uploading ? (
        <><span style={{ fontSize: 28 }}>⏳</span><span style={{ color: '#FBBF24', fontSize: 11, fontWeight: 'bold' }}>Wgrywanie...</span></>
      ) : (
        <>
          <span style={{ fontSize: 32, opacity: hover ? 0.9 : 0.4 }}>📂</span>
          <span style={{ color: '#CDD4AA', fontSize: 11, fontWeight: 'bold' }}>Kliknij lub przeciągnij plik</span>
          <span style={{ color: '#5A6840', fontSize: 9 }}>PNG lub GIF · max 2 MB</span>
          {hint && <span style={{ color: '#FBBF24', fontSize: 9, marginTop: 2 }}>{hint}</span>}
        </>
      )}
    </label>
  );
}

// ── File gallery card ──────────────────────────────────────────────────────────
function FileCard({ f, section, picked, pickedCls, onMsg, onReload }) {
  const canAssign = (
    (section === 'player' && picked) ||
    (section === 'mob'    && picked) ||
    (section === 'npc'    && picked) ||
    (section === 'guild'  && picked) ||
    (section === 'class'  && pickedCls)
  );

  const assign = async () => {
    let endpoint, body;
    if (section === 'player') { endpoint = 'player-skin'; body = { postacId: picked.id, obrazek: f.path }; }
    else if (section === 'mob')   { endpoint = 'mob-skin';    body = { mobId: picked.id,   obrazek: f.path }; }
    else if (section === 'npc')   { endpoint = 'npc-skin';    body = { npcId: picked.id,   obrazek: f.path }; }
    else if (section === 'guild') { endpoint = 'guild-skin';  body = { guildId: picked.id, obrazek: f.path }; }
    else if (section === 'class') { endpoint = 'class-skin';  body = { className: pickedCls, obrazek: f.path }; }

    const r   = await fetch(`/api/admin/${endpoint}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j   = await r.json().catch(() => ({}));
    if (j.ok) {
      const who = section === 'class' ? `klasa ${pickedCls} (${j.affected || '?'} postaci)` : picked?.nazwa || picked?.tag || `#${picked?.id}`;
      onMsg(`✓ Sprite przypisany: ${who}`);
    } else onMsg(j.error || 'Błąd przypisania', false);
  };

  const del = async () => {
    if (!window.confirm(`Usunąć ${f.name}?`)) return;
    const r = await fetch('/api/assets/file', { method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filePath: f.path }) });
    const j = await r.json().catch(() => ({}));
    j.ok ? (onMsg('Usunięto!'), onReload()) : onMsg(j.error || 'Błąd usuwania', false);
  };

  const copyPath = () => { navigator.clipboard?.writeText(f.path).catch(() => {}); onMsg(`Skopiowano: ${f.path}`); };

  return (
    <div style={{ background: 'rgba(6,10,4,0.85)', border: '1px solid rgba(200,150,32,0.14)', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Sprite preview */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', padding: 6 }}>
        <img src={`/assets/${f.path}`} alt={f.name} loading="lazy"
          style={{ maxWidth: 56, maxHeight: 56, imageRendering: 'pixelated', objectFit: 'contain' }} />
      </div>

      {/* Meta */}
      <div style={{ padding: '4px 6px', flex: 1 }}>
        <div style={{ color: '#6A7A50', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.name}>{f.name}</div>
        <div style={{ color: '#3A4828', fontSize: 6, marginTop: 1 }}>{(f.size / 1024).toFixed(1)}KB</div>
        <div style={{ color: '#2A3820', fontSize: 6, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.path}</div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: canAssign ? '1fr 1fr 1fr' : '1fr 1fr', gap: 3, padding: '4px 5px 5px' }}>
        <button onClick={copyPath} title="Kopiuj ścieżkę"
          style={{ padding: '4px 2px', background: 'rgba(29,78,216,0.18)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 4, cursor: 'pointer', color: '#60A5FA', fontSize: 10, fontFamily: 'Verdana,sans-serif' }}>📋</button>
        {canAssign && (
          <button onClick={assign} title="Przypisz do wybranej encji"
            style={{ padding: '4px 2px', background: 'rgba(74,122,42,0.2)', border: '1px solid rgba(74,122,42,0.35)', borderRadius: 4, cursor: 'pointer', color: '#4ADE80', fontSize: 10, fontFamily: 'Verdana,sans-serif' }}>✓</button>
        )}
        <button onClick={del} title="Usuń plik"
          style={{ padding: '4px 2px', background: 'rgba(50,4,4,0.6)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 4, cursor: 'pointer', color: '#F87171', fontSize: 10, fontFamily: 'Verdana,sans-serif' }}>🗑</button>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AssetsTab() {
  const [section,   setSection]   = useState('player');
  const [files,     setFiles]     = useState([]);
  const [uploading, setUploading] = useState(false);
  const [toast,     setToast]     = useState(null);
  const [picked,    setPicked]    = useState(null);
  const [pickedCls, setPickedCls] = useState('');
  const [search,    setSearch]    = useState('');

  const msg = (m, ok = true) => setToast({ m, ok });

  const catFor = s => ({ player: 'avatar', class: 'avatar', mob: 'mob', npc: 'npc', guild: 'guild', custom: 'custom' }[s] || 'custom');

  const loadFiles = useCallback((s) => {
    fetch(`/api/assets/list/${catFor(s)}`, { credentials: 'include' })
      .then(r => r.json()).then(r => Array.isArray(r) && setFiles(r)).catch(() => {});
  }, []);

  useEffect(() => {
    setFiles([]); setPicked(null); setPickedCls(''); setSearch('');
    loadFiles(section);
  }, [section, loadFiles]);

  const upload = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['png', 'gif'].includes(ext)) { msg('Dozwolone tylko .png i .gif', false); return; }
    if (file.size > 2 * 1024 * 1024) { msg('Plik za duży (max 2 MB)', false); return; }

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    if (section === 'player' && picked)    fd.append('postacId',  picked.id);
    if (section === 'guild'  && picked)    fd.append('guildId',   picked.id);
    if (section === 'mob'    && picked)    fd.append('mobId',     picked.id);
    if (section === 'npc'    && picked)    fd.append('npcId',     picked.id);
    if (section === 'class'  && pickedCls) fd.append('className', pickedCls);

    const ep = { player: 'avatar', class: 'class', mob: 'mob', npc: 'npc', guild: 'guild', custom: 'custom' }[section];

    try {
      const r = await fetch(`/api/assets/upload/${ep}`, { method: 'POST', credentials: 'include', body: fd });
      const j = await r.json();
      if (j.ok) {
        let detail = j.name;
        if (section === 'player' && picked)    detail += ` → przypisano dla ${picked.nazwa}`;
        if (section === 'class'  && pickedCls) detail += ` → klasa ${pickedCls}`;
        if (section === 'mob'    && picked)    detail += ` → ${picked.nazwa}`;
        if (section === 'npc'    && picked)    detail += ` → ${picked.nazwa}`;
        if (section === 'guild'  && picked)    detail += ` → ${picked.nazwa}`;
        msg(`Wgrano: ${detail}`);
        loadFiles(section);
      } else msg(j.error || 'Błąd wgrywania', false);
    } catch { msg('Błąd połączenia z serwerem', false); }
    finally { setUploading(false); if (e.target) e.target.value = ''; }
  };

  const SECTIONS = [
    { id: 'player', icon: '👤', label: 'Skórka gracza',   desc: 'Przypisz sprite do konkretnej postaci',      pickerEndpoint: 'players', pickerPh: 'Szukaj gracza...' },
    { id: 'class',  icon: '⚔',  label: 'Skórka klasy',    desc: 'Zmień sprite dla całej klasy postaci',       pickerEndpoint: null },
    { id: 'guild',  icon: '🏰', label: 'Herb gildii',     desc: 'Wgraj emblemat/logo dla gildii',             pickerEndpoint: 'guilds',  pickerPh: 'Szukaj gildii...' },
    { id: 'mob',    icon: '👾', label: 'Sprite potwora',  desc: 'Zmień wygląd konkretnego potwora',           pickerEndpoint: 'mobs',    pickerPh: 'Szukaj potwora...' },
    { id: 'npc',    icon: '🧑', label: 'Sprite NPC',      desc: 'Zmień wygląd konkretnego NPC',               pickerEndpoint: 'npcs',    pickerPh: 'Szukaj NPC...' },
    { id: 'custom', icon: '📁', label: 'Własny plik',     desc: 'Wgraj dowolny PNG/GIF do biblioteki custom', pickerEndpoint: null },
  ];

  const cur = SECTIONS.find(s => s.id === section);

  const uploadHint = (() => {
    if (section === 'player' && !picked)    return '⚠ Wybierz postać aby od razu przypisać';
    if (section === 'class'  && !pickedCls) return '⚠ Wybierz klasę aby zastosować globalnie';
    if (section === 'mob'    && !picked)    return '⚠ Wybierz potwora aby od razu przypisać';
    if (section === 'npc'    && !picked)    return '⚠ Wybierz NPC aby od razu przypisać';
    if (section === 'guild'  && !picked)    return '⚠ Wybierz gildię aby od razu przypisać';
    return null;
  })();

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', fontFamily: 'Verdana,sans-serif' }}>

      {/* ── Left nav ── */}
      <div style={{ width: 174, flexShrink: 0, borderRight: '1px solid rgba(200,150,32,0.14)', display: 'flex', flexDirection: 'column', background: 'rgba(6,10,4,0.97)' }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(200,150,32,0.1)', flexShrink: 0 }}>
          <div style={{ color: '#C8940A', fontSize: 9, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase' }}>🖼 Assety</div>
        </div>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 10, color: section === s.id ? '#E8D070' : '#6A7A50', fontWeight: section === s.id ? 'bold' : 'normal', borderLeft: `3px solid ${section === s.id ? '#C8940A' : 'transparent'}`, background: section === s.id ? 'rgba(200,150,32,0.08)' : 'transparent', fontFamily: 'Verdana,sans-serif', transition: 'all .12s', width: '100%' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(200,150,32,0.08)', fontSize: 8, color: '#2A3820', textAlign: 'center', lineHeight: 1.5 }}>
          PNG · GIF · max 2 MB<br />Pliki w /assets/{catFor(section)}/
        </div>
      </div>

      {/* ── Right content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {toast && <Toast msg={toast.m} ok={toast.ok} onDone={() => setToast(null)} />}

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottom: '1px solid rgba(200,150,32,0.1)' }}>
          <span style={{ fontSize: 28, opacity: 0.85 }}>{cur?.icon}</span>
          <div>
            <div style={{ color: '#E8D070', fontWeight: 'bold', fontSize: 14 }}>{cur?.label}</div>
            <div style={{ color: '#5A6840', fontSize: 9, marginTop: 2 }}>{cur?.desc}</div>
          </div>
          <button onClick={() => loadFiles(section)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#5A6840', cursor: 'pointer', fontSize: 18 }} title="Odśwież">↻</button>
        </div>

        {/* Target picker */}
        {cur?.pickerEndpoint && (
          <div style={{ background: 'rgba(8,14,6,0.9)', border: '1px solid rgba(200,150,32,0.14)', borderRadius: 9, padding: '12px 14px' }}>
            <Picker
              endpoint={cur.pickerEndpoint}
              label={`Wybierz ${section === 'player' ? 'postać' : section === 'mob' ? 'potwora' : section === 'npc' ? 'NPC' : 'gildię'}`}
              placeholder={cur.pickerPh}
              picked={picked}
              onPick={setPicked}
            />
          </div>
        )}

        {/* Class selector */}
        {section === 'class' && (
          <div style={{ background: 'rgba(8,14,6,0.9)', border: '1px solid rgba(200,150,32,0.14)', borderRadius: 9, padding: '12px 14px' }}>
            <div style={{ fontSize: 8, color: '#3A4828', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8 }}>Wybierz klasę</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CLASSES.map(cls => (
                <button key={cls} onClick={() => setPickedCls(c => c === cls ? '' : cls)} style={{ padding: '6px 13px', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontFamily: 'Verdana,sans-serif', fontWeight: pickedCls === cls ? 'bold' : 'normal', background: pickedCls === cls ? 'rgba(200,150,32,0.15)' : 'rgba(6,10,4,0.7)', border: `1px solid ${pickedCls === cls ? 'rgba(200,150,32,0.55)' : 'rgba(200,150,32,0.16)'}`, color: pickedCls === cls ? '#E8D070' : '#6A7A50' }}>
                  {cls}
                </button>
              ))}
            </div>
            {pickedCls && (
              <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#FBBF24', fontSize: 9 }}>
                ⚠ Zmiana skórki klasy <strong>{pickedCls}</strong> zaktualizuje sprite <em>wszystkich</em> postaci tej klasy!
              </div>
            )}
          </div>
        )}

        {/* Drop zone */}
        <DropZone onChange={upload} uploading={uploading} hint={uploadHint} />

        {/* Gallery */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: '#3A4828', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Biblioteka — {files.length} {files.length === 1 ? 'plik' : 'plików'}
            </div>
            {files.length > 0 && (
              <div style={{ color: '#3A4828', fontSize: 8 }}>
                {canAssignLabel(section, picked, pickedCls)}
              </div>
            )}
          </div>

          {files.length === 0 ? (
            <div style={{ color: '#2A3820', textAlign: 'center', padding: '28px 0', fontSize: 10 }}>
              Brak plików w tej kategorii.<br />Wgraj pierwszy plik powyżej.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
              {files.map(f => (
                <FileCard
                  key={f.path} f={f} section={section}
                  picked={picked} pickedCls={pickedCls}
                  onMsg={msg} onReload={() => loadFiles(section)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function canAssignLabel(section, picked, pickedCls) {
  if (section === 'player' && picked)    return `✓ Klik na sprite → przypisz do ${picked.nazwa}`;
  if (section === 'mob'    && picked)    return `✓ Klik na sprite → przypisz do ${picked.nazwa}`;
  if (section === 'npc'    && picked)    return `✓ Klik na sprite → przypisz do ${picked.nazwa}`;
  if (section === 'guild'  && picked)    return `✓ Klik na sprite → przypisz do ${picked.nazwa}`;
  if (section === 'class'  && pickedCls) return `✓ Klik na sprite → zastosuj dla klasy ${pickedCls}`;
  if (section === 'custom')              return 'Pliki do użycia w edytorze';
  return '← Wybierz cel aby móc przypisać sprite';
}
