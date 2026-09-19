import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:     'rgba(4,8,16,0.98)', surface: 'rgba(6,12,20,0.97)',
  card:   'rgba(8,16,28,0.95)', raised: 'rgba(10,20,35,0.98)',
  border: 'rgba(59,130,246,0.16)', borderH: 'rgba(59,130,246,0.5)',
  text: '#CBD5E1', muted: '#4A7B9D', dim: '#1E3A5F',
  blue: '#60A5FA', blueDim: '#3B82F6',
  green: '#4ADE80', red: '#F87171', amber: '#FBBF24',
  purple: '#A78BFA', cyan: '#22D3EE',
};
const FF = 'Verdana,sans-serif';
const RC = { unique: '#DAA520', heroic: '#2090FE', legendary: '#FA9A20', artefact: '#f0032a', upgraded: '#FFD700', normal: '#3A5A7A' };

// ── Shared micro-components ───────────────────────────────────────────────────
function Toast({ msg, ok }) {
  if (!msg) return null;
  const c = ok ? T.green : T.red;
  return (
    <div style={{ padding: '7px 12px', borderRadius: 7, fontSize: 10, background: ok ? 'rgba(6,40,16,0.85)' : 'rgba(50,4,4,0.85)', border: `1px solid ${c}44`, color: c, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <span>{ok ? '✓' : '✕'}</span> {msg}
    </div>
  );
}

function Inp({ value, onChange, placeholder, type = 'text', style = {}, rows }) {
  const [f, setF] = useState(false);
  const base = { padding: '7px 10px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${f ? T.borderH : T.border}`, borderRadius: 5, fontSize: 10, outline: 'none', fontFamily: FF, width: '100%', boxSizing: 'border-box', transition: 'border-color .12s', ...style };
  if (rows) return <textarea value={value ?? ''} onChange={onChange} placeholder={placeholder} rows={rows} onFocus={() => setF(true)} onBlur={() => setF(false)} style={{ ...base, resize: 'vertical' }} />;
  return <input type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder} onFocus={() => setF(true)} onBlur={() => setF(false)} style={base} />;
}

function Lbl({ children }) {
  return <div style={{ fontSize: 8, color: T.dim, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 4, fontFamily: FF }}>{children}</div>;
}

function Fld({ label, value, onChange, type = 'text', small, rows, placeholder }) {
  const handleChange = e => onChange(type === 'number' ? Number(e.target.value) : e.target.value);
  return (
    <div>
      {label && <Lbl>{label}</Lbl>}
      <Inp value={value} onChange={handleChange} type={type} placeholder={placeholder} rows={rows} style={small ? { width: 72 } : {}} />
    </div>
  );
}

function Btn({ children, onClick, v = 'default', disabled, style = {}, wide }) {
  const variants = {
    default: [T.blue,   'rgba(29,78,216,0.2)',  T.borderH],
    ok:      [T.green,  'rgba(6,40,20,0.75)',   'rgba(34,197,94,0.4)'],
    danger:  [T.red,    'rgba(50,4,4,0.75)',    'rgba(220,38,38,0.4)'],
    ghost:   [T.muted,  'rgba(6,12,20,0.5)',    T.border],
    amber:   [T.amber,  'rgba(80,50,4,0.4)',    'rgba(251,191,36,0.4)'],
  };
  const [col, bg, bd] = variants[v] || variants.default;
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: '5px 12px', borderRadius: 5, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 10, fontWeight: 'bold', border: `1px solid ${bd}`, background: disabled ? 'rgba(6,12,20,0.3)' : bg, color: disabled ? T.dim : col, opacity: disabled ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', fontFamily: FF, width: wide ? '100%' : undefined, justifyContent: wide ? 'center' : undefined, transition: 'all .12s', ...style }}>{children}</button>
  );
}

function Card({ children, style = {}, color }) {
  return <div style={{ background: T.card, border: `1px solid ${color ? color + '22' : T.border}`, borderRadius: 8, overflow: 'hidden', ...style }}>{children}</div>;
}

function CardHead({ icon, title, action, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', background: T.raised, borderBottom: `1px solid ${T.border}` }}>
      {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
      <span style={{ fontSize: 8, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', color: color || T.blue, fontFamily: FF }}>{title}</span>
      {action && <div style={{ marginLeft: 'auto' }}>{action}</div>}
    </div>
  );
}

function MapSelect({ maps, mapId, onSelect }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: T.raised }}>
      <span style={{ fontSize: 10 }}>🗺</span>
      <span style={{ color: T.muted, fontSize: 9 }}>Mapa:</span>
      <select value={mapId || ''} onChange={e => onSelect(Number(e.target.value))}
        style={{ flex: 1, padding: '5px 8px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 10, outline: 'none', fontFamily: FF }}>
        <option value="">— wybierz mapę —</option>
        {maps.map(m => <option key={m.id} value={m.id}>#{m.id} {m.nazwa} ({m.maks_x + 1}×{m.maks_y + 1})</option>)}
      </select>
    </div>
  );
}

// ── Sidebar list ──────────────────────────────────────────────────────────────
function SideList({ items, selId, onSelect, renderItem, header, selectable, selectedIds, onToggleSelect }) {
  return (
    <div style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', background: T.surface }}>
      {header}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {items.map(item => {
          const isChecked = selectedIds?.has(item.id) || false;
          return (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${T.border}14`, borderLeft: `3px solid ${selId === item.id ? T.blueDim : isChecked ? 'rgba(59,130,246,0.4)' : 'transparent'}`, background: isChecked ? 'rgba(29,78,216,0.07)' : selId === item.id ? 'rgba(29,78,216,0.1)' : 'transparent', transition: 'background .1s' }}>
              {selectable && (
                <div onClick={e => { e.stopPropagation(); onToggleSelect?.(item.id); }}
                  style={{ padding: '7px 4px 7px 8px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" checked={isChecked} onChange={() => {}}
                    style={{ cursor: 'pointer', width: 12, height: 12, accentColor: T.blue, pointerEvents: 'none' }} />
                </div>
              )}
              <div onClick={() => onSelect(item)} style={{ flex: 1, padding: '7px 12px 7px 6px', cursor: 'pointer', minWidth: 0 }}>
                {renderItem(item)}
              </div>
            </div>
          );
        })}
        {items.length === 0 && <div style={{ color: T.dim, textAlign: 'center', padding: 20, fontSize: 10 }}>Brak elementów</div>}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function Empty({ icon, text }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: T.dim, gap: 10 }}>
      <span style={{ fontSize: 36, opacity: 0.2 }}>{icon}</span>
      <span style={{ fontSize: 11 }}>{text}</span>
    </div>
  );
}

// ── MOB EDITOR ────────────────────────────────────────────────────────────────
function MobEditor({ mapId, onRequestPick, pendingPos, onPosConsumed }) {
  const [mobs,        setMobs]        = useState([]);
  const [sel,         setSel]         = useState(null);
  const [form,        setForm]        = useState({});
  const [adding,      setAdding]      = useState(false);
  const [toast,       setToast]       = useState(null);
  const [selected,      setSelected]      = useState(new Set());
  const [bulkRespawn,   setBulkRespawn]   = useState('');
  const [bulkPaczka,    setBulkPaczka]    = useState('');
  const [templates,     setTemplates]     = useState(() => { try { return JSON.parse(localStorage.getItem('mob_templates_v1') || '[]'); } catch { return []; } });
  const [showTemplates, setShowTemplates] = useState(false);
  const [undoCount,     setUndoCount]     = useState(0);
  const [previewLevel,  setPreviewLevel]  = useState(null);
  const undoStack  = useRef([]);
  const execUndoRef = useRef(null);

  const load = useCallback(() => { if (mapId) api.world.mobs(mapId).then(r => Array.isArray(r) && setMobs(r)); }, [mapId]);
  useEffect(() => { load(); setSel(null); setSelected(new Set()); undoStack.current = []; setUndoCount(0); }, [mapId, load]);
  useEffect(() => {
    const handler = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); execUndoRef.current?.(); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
  useEffect(() => {
    if (!pendingPos || (!sel && !adding)) return;
    setForm(p => ({ ...p, x: pendingPos.x, y: pendingPos.y }));
    onPosConsumed?.();
  }, [pendingPos]); // eslint-disable-line

  const msg = (m, ok = true) => { setToast({ m, ok }); setTimeout(() => setToast(null), 3000); };
  const f   = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleSelect = id => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll    = () => setSelected(p => p.size === mobs.length ? new Set() : new Set(mobs.map(m => m.id)));

  const saveTemplate = () => {
    const t = { ...form, id: undefined, mapa: undefined, _name: form.nazwa, _savedAt: Date.now() };
    const next = [t, ...templates].slice(0, 20);
    setTemplates(next);
    localStorage.setItem('mob_templates_v1', JSON.stringify(next));
    msg('Szablon zapisany!');
  };
  const applyTemplate = t => {
    setForm(p => ({ ...p, ...t, id: undefined, mapa: mapId, _name: undefined, _savedAt: undefined }));
    setShowTemplates(false);
  };
  const deleteTemplate = idx => {
    const next = templates.filter((_, i) => i !== idx);
    setTemplates(next);
    localStorage.setItem('mob_templates_v1', JSON.stringify(next));
  };

  const pushUndo = (label, fn) => { undoStack.current.push({ label, fn }); setUndoCount(undoStack.current.length); };

  const bulkDelete = async () => {
    if (!window.confirm(`Usunąć ${selected.size} moba(ów)?`)) return;
    const saved = mobs.filter(m => selected.has(m.id));
    let done = 0;
    await Promise.all([...selected].map(async id => { const r = await api.world.deleteMob(id); if (r.ok !== false) done++; }));
    if (done > 0) pushUndo(`Usunięcie ${done} mobów`, () => Promise.all(saved.map(m => api.world.createMob({ ...m, id: undefined }))));
    msg(`Usunięto ${done}`);
    if (sel && selected.has(sel.id)) { setSel(null); setAdding(false); }
    setSelected(new Set());
    load();
  };

  const bulkSave = async () => {
    const patch = {};
    if (bulkRespawn !== '') patch.respawn_time = Number(bulkRespawn);
    if (bulkPaczka  !== '') patch.paczka       = Number(bulkPaczka);
    if (!Object.keys(patch).length) return;
    await Promise.all([...selected].map(id => api.world.updateMob(id, patch)));
    msg(`Zaktualizowano ${selected.size} mobów!`);
    setBulkRespawn(''); setBulkPaczka('');
    load();
  };

  const select   = m  => { setSel(m); setForm({ ...m }); setAdding(false); };
  const startAdd = () => { setSel(null); setForm({ mapa: mapId, nazwa: 'Nowy Mob', obrazek: 'avatar/m_bd28.gif', poziom: 1, zycie_max: 30, obr_min: 1, obr_max: 3, ac: 0, exp: 5, respawn_time: 60, paczka: 0, x: 35, y: 37, szerokosc: 24, dlugosc: 32 }); setAdding(true); };

  const save = async () => {
    const prev = sel ? { ...sel } : null;
    const r = adding ? await api.world.createMob(form) : await api.world.updateMob(sel.id, form);
    if (!r.ok) { msg(r.error || 'Błąd', false); return; }
    if (adding)  pushUndo(`Dodanie: ${form.nazwa}`,  () => api.world.deleteMob(r.id));
    else         pushUndo(`Edycja: ${prev.nazwa}`,   () => api.world.updateMob(prev.id, prev));
    msg(adding ? 'Mob dodany!' : 'Zapisano!'); load(); setSel(null); setAdding(false);
  };
  const del = async id => {
    if (!window.confirm('Usunąć moba?')) return;
    const saved = { ...sel };
    const r = await api.world.deleteMob(id);
    if (!r.ok) { msg(r.error || 'Błąd', false); return; }
    pushUndo(`Usunięcie: ${saved.nazwa}`, () => api.world.createMob({ ...saved, id: undefined }));
    msg('Usunięto!'); load(); setSel(null);
  };
  const respawn = async id => { await api.world.respawnMob(id); msg('Respawn!'); load(); };

  execUndoRef.current = async () => {
    const action = undoStack.current.pop();
    if (!action) return;
    try { await action.fn(); setToast({ m: `↩ Cofnięto: ${action.label}`, ok: true }); setTimeout(() => setToast(null), 3000); }
    catch { setToast({ m: 'Błąd cofania', ok: false }); setTimeout(() => setToast(null), 3000); }
    setUndoCount(undoStack.current.length);
    load(); setSel(null); setAdding(false);
  };

  const alive = mobs.filter(m => m.zycie > 0).length;

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <SideList
        items={mobs} selId={sel?.id} onSelect={select}
        selectable selectedIds={selected} onToggleSelect={toggleSelect}
        header={
          <div style={{ padding: '8px 10px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: T.raised }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                <input type="checkbox" checked={mobs.length > 0 && selected.size === mobs.length}
                  onChange={selectAll}
                  style={{ cursor: 'pointer', width: 12, height: 12, accentColor: T.blue }} />
                <span style={{ color: selected.size > 0 ? T.blue : T.muted, fontSize: 9 }}>
                  {selected.size > 0 ? `${selected.size} zaznaczonych` : `${alive}✓ · ${mobs.length - alive}☠`}
                </span>
              </label>
              <Btn onClick={startAdd} style={{ padding: '4px 8px', fontSize: 9 }}>+ Dodaj</Btn>
            </div>
          </div>
        }
        renderItem={m => (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 18, height: 18, backgroundImage: `url(/assets/${m.obrazek})`, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', flexShrink: 0 }} />
              <span style={{ color: m.zycie > 0 ? T.text : '#374151', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{m.nazwa}</span>
              {m.zycie <= 0 && <span style={{ color: T.red, fontSize: 8 }}>☠</span>}
            </div>
            <div style={{ color: T.dim, fontSize: 8, marginTop: 2, paddingLeft: 25 }}>poz.{m.poziom} · ({m.x},{m.y}) · HP:{m.zycie_max}</div>
          </>
        )}
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toast && <Toast msg={toast.m} ok={toast.ok} />}

        {selected.size > 0 && (
          <Card color={T.blue}>
            <CardHead icon="☑" title={`Zaznaczono ${selected.size} z ${mobs.length} mobów`} color={T.blue}
              action={<Btn v="ghost" onClick={() => setSelected(new Set())} style={{ padding: '2px 8px', fontSize: 9 }}>✕ Odznacz</Btn>} />
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <Lbl>Respawn (s) — puste = bez zmian</Lbl>
                  <Inp type="number" value={bulkRespawn} onChange={e => setBulkRespawn(e.target.value)} placeholder="bez zmian" />
                </div>
                <div>
                  <Lbl>Loot pack ID — puste = bez zmian</Lbl>
                  <Inp type="number" value={bulkPaczka} onChange={e => setBulkPaczka(e.target.value)} placeholder="bez zmian" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Btn v="ok" onClick={bulkSave} disabled={bulkRespawn === '' && bulkPaczka === ''}>✓ Zastosuj do zaznaczonych</Btn>
                <Btn v="danger" onClick={bulkDelete} style={{ marginLeft: 'auto' }}>🗑 Usuń zaznaczone ({selected.size})</Btn>
              </div>
            </div>
          </Card>
        )}

        {!(sel || adding) ? (
          !mapId ? <Empty icon="🗺" text="Wybierz mapę" /> : <Empty icon="👾" text="Wybierz moba lub dodaj nowego" />
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {form.obrazek && <div style={{ width: form.szerokosc || 24, height: form.dlugosc || 32, backgroundImage: `url(/assets/${form.obrazek})`, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', border: `1px solid ${T.border}`, borderRadius: 4, flexShrink: 0 }} />}
              <div>
                <div style={{ color: T.blue, fontWeight: 'bold', fontSize: 13 }}>{adding ? '+ Nowy mob' : form.nazwa}</div>
                {!adding && <div style={{ color: T.muted, fontSize: 9, marginTop: 2 }}>ID: {sel.id} · Mapa {mapId} · ({sel.x},{sel.y})</div>}
              </div>
            </div>

            {/* Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ gridColumn: '1/-1' }}><Fld label="Nazwa" value={form.nazwa} onChange={v => f('nazwa', v)} /></div>
              <Fld label="Obrazek (ścieżka)" value={form.obrazek} onChange={v => f('obrazek', v)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <Fld label="Poziom" value={form.poziom} onChange={v => f('poziom', v)} type="number" small />
                <Fld label="Max HP" value={form.zycie_max} onChange={v => f('zycie_max', v)} type="number" small />
              </div>
            </div>

            <Card>
              <CardHead icon="⚔" title="Bojowe" color={T.red} />
              <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                <Fld label="ATK min" value={form.obr_min}  onChange={v => f('obr_min', v)}  type="number" />
                <Fld label="ATK max" value={form.obr_max}  onChange={v => f('obr_max', v)}  type="number" />
                <Fld label="AC"      value={form.ac}       onChange={v => f('ac', v)}        type="number" />
                <Fld label="EXP"     value={form.exp}      onChange={v => f('exp', v)}       type="number" />
              </div>
            </Card>

            <Card>
              <CardHead icon="📍" title="Pozycja i spawning" color={T.cyan}
                action={onRequestPick ? <Btn onClick={onRequestPick} style={{ padding: '3px 8px', fontSize: 9 }}>📍 Ustaw na mapie</Btn> : null} />
              <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                <Fld label="X" value={form.x} onChange={v => f('x', v)} type="number" />
                <Fld label="Y" value={form.y} onChange={v => f('y', v)} type="number" />
                <Fld label="Respawn (s)" value={form.respawn_time} onChange={v => f('respawn_time', v)} type="number" />
                <Fld label="Loot pack ID" value={form.paczka} onChange={v => f('paczka', v)} type="number" />
              </div>
            </Card>

            <Card>
              <CardHead icon="🖼" title="Sprite" />
              <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Fld label="Szerokość px" value={form.szerokosc} onChange={v => f('szerokosc', v)} type="number" />
                <Fld label="Wysokość px"  value={form.dlugosc}   onChange={v => f('dlugosc', v)}   type="number" />
              </div>
            </Card>

            {/* Level scaling preview */}
            {previewLevel !== null && form.poziom > 0 && (() => {
              const ratio = previewLevel / (form.poziom || 1);
              const sc = v => Math.round((v || 0) * ratio);
              const zt = ZONE_TYPES?.[0]; // just using for style reference — unused here
              const pct = v => Math.min(100, Math.round(ratio * 100));
              const barC = ratio >= 2 ? T.red : ratio >= 1 ? T.amber : T.green;
              return (
                <Card color={T.amber}>
                  <CardHead icon="📊" title={`Podgląd skalowania — poz. ${previewLevel}`} color={T.amber}
                    action={<Btn v="ghost" onClick={() => setPreviewLevel(null)} style={{ padding: '2px 6px', fontSize: 9 }}>✕</Btn>} />
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: T.dim, fontSize: 9, flexShrink: 0 }}>Poz. {previewLevel}</span>
                      <input type="range" min={1} max={500} value={previewLevel} onChange={e => setPreviewLevel(Number(e.target.value))}
                        style={{ flex: 1, accentColor: T.amber }} />
                      <input type="number" value={previewLevel} onChange={e => setPreviewLevel(Math.max(1, Math.min(500, Number(e.target.value) || 1)))} min={1} max={500}
                        style={{ width: 52, padding: '3px 6px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 9, outline: 'none', fontFamily: FF }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                      {[['HP', sc(form.zycie_max), T.green], ['ATK avg', Math.round(sc(form.obr_min + form.obr_max) / 2), T.red], ['AC', sc(form.ac), T.blue], ['EXP', sc(form.exp), T.amber]].map(([l, v, c]) => (
                        <div key={l} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                          <div style={{ fontSize: 7, color: T.dim, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 3 }}>{l}</div>
                          <div style={{ color: c, fontSize: 14, fontWeight: 'bold' }}>{v}</div>
                          <div style={{ fontSize: 7, color: T.dim }}>← {l === 'ATK avg' ? Math.round((form.obr_min + form.obr_max) / 2) : form[['zycie_max','obr_max','ac','exp'][['HP','ATK avg','AC','EXP'].indexOf(l)]]}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: T.dim, fontSize: 9 }}>Mnożnik: <span style={{ color: barC, fontWeight: 'bold' }}>×{ratio.toFixed(2)}</span></span>
                      <div style={{ flex: 1, height: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 2 }}>
                        <div style={{ width: `${Math.min(100, ratio * 50)}%`, height: '100%', background: barC, borderRadius: 2, transition: 'width .15s' }} />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* Template picker — visible when adding + showTemplates */}
            {adding && showTemplates && (
              <Card color={T.amber}>
                <CardHead icon="📋" title={`Szablony (${templates.length})`} color={T.amber}
                  action={<Btn v="ghost" onClick={() => setShowTemplates(false)} style={{ padding: '2px 6px', fontSize: 9 }}>✕</Btn>} />
                {templates.length === 0
                  ? <div style={{ padding: '12px', color: T.dim, textAlign: 'center', fontSize: 10 }}>Brak zapisanych szablonów</div>
                  : <div style={{ maxHeight: 170, overflowY: 'auto' }}>
                      {templates.map((t, i) => (
                        <div key={i} onClick={() => applyTemplate(t)}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderBottom: `1px solid ${T.border}14`, cursor: 'pointer' }}
                          onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(251,191,36,0.07)'}
                          onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                          <span style={{ color: T.text, fontSize: 10, flex: 1 }}>{t._name || t.nazwa}</span>
                          <span style={{ color: T.dim, fontSize: 8 }}>poz.{t.poziom} · HP:{t.zycie_max} · ATK:{t.obr_min}-{t.obr_max}</span>
                          <Btn v="danger" onClick={e => { e.stopPropagation(); deleteTemplate(i); }} style={{ padding: '2px 5px', fontSize: 8 }}>✕</Btn>
                        </div>
                      ))}
                    </div>
                }
              </Card>
            )}

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Btn v="ok" onClick={save}>✓ {adding ? 'Utwórz moba' : 'Zapisz zmiany'}</Btn>
              {adding && (
                <Btn v="ghost" onClick={() => setShowTemplates(p => !p)} style={{ fontSize: 9 }}>
                  📋 {showTemplates ? 'Ukryj szablony' : `Z szablonu${templates.length ? ` (${templates.length})` : ''}`}
                </Btn>
              )}
              {!adding && <Btn onClick={() => respawn(sel.id)}>↺ Respawn</Btn>}
              {!adding && <Btn v="amber" onClick={async () => {
                const r = await api.world.createMob({ ...sel, id: undefined, nazwa: sel.nazwa + ' (kopia)', x: sel.x + 2 });
                r.ok ? (msg('Sklonowano!'), load(), setSel(null)) : msg(r.error || 'Błąd', false);
              }}>📋 Klonuj</Btn>}
              {!adding && <Btn v="ghost" onClick={saveTemplate} style={{ fontSize: 9 }}>💾 Szablon</Btn>}
              {!adding && <Btn v="danger" onClick={() => del(sel.id)}>🗑 Usuń</Btn>}
              {undoCount > 0 && <Btn v="ghost" onClick={() => execUndoRef.current?.()} style={{ fontSize: 9, borderColor: 'rgba(251,191,36,0.4)', color: T.amber }}>↩ Cofnij ({undoCount})</Btn>}
              <Btn v="ghost" onClick={() => setPreviewLevel(p => p === null ? (form.poziom || 1) : null)} style={{ fontSize: 9, borderColor: 'rgba(251,191,36,0.3)', color: T.amber }}>
                {previewLevel !== null ? '📊 Ukryj' : '📊 Podgląd'}
              </Btn>
              <Btn v="ghost" onClick={() => { setSel(null); setAdding(false); setShowTemplates(false); setPreviewLevel(null); }} style={{ marginLeft: 'auto' }}>Anuluj</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── NPC EDITOR ────────────────────────────────────────────────────────────────
function NpcEditor({ mapId, onRequestPick, pendingPos, onPosConsumed }) {
  const [npcs,      setNpcs]      = useState([]);
  const [sel,       setSel]       = useState(null);
  const [form,      setForm]      = useState({});
  const [adding,    setAdding]    = useState(false);
  const [shopItems, setShopItems] = useState([]);
  const [shopForm,  setShopForm]  = useState({ nazwa: '', klasa: 'normal', typ: 'Konsupcyjne', obrazek: '', wym_poziom: 0, wartosc_kupna: 0, obr_min: 0, obr_max: 0, ac: 0, zycie: 0, sa: 0, sila: 0, zrecznosc: 0, intelekt: 0, ck: 0, ckf: 120, mana: 0, leczenie: 0, mikstura_leczenie: 0, pelne_leczenie: 0, opis: '' });
  const [shopTab,   setShopTab]   = useState('list');
  const [toast,     setToast]     = useState(null);
  const [selected,  setSelected]  = useState(new Set());
  const [undoCount, setUndoCount] = useState(0);
  const undoStack   = useRef([]);
  const execUndoRef = useRef(null);

  const load = useCallback(() => { if (mapId) api.world.npcs(mapId).then(r => Array.isArray(r) && setNpcs(r)); }, [mapId]);
  useEffect(() => { load(); setSel(null); setSelected(new Set()); undoStack.current = []; setUndoCount(0); }, [mapId, load]);
  useEffect(() => {
    const handler = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); execUndoRef.current?.(); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
  useEffect(() => {
    if (!pendingPos || (!sel && !adding)) return;
    setForm(p => ({ ...p, x: pendingPos.x, y: pendingPos.y }));
    onPosConsumed?.();
  }, [pendingPos]); // eslint-disable-line
  useEffect(() => { if (sel?.shop > 0) api.world.shopItems(sel.shop).then(r => Array.isArray(r) && setShopItems(r)); else setShopItems([]); }, [sel]);

  const msg = (m, ok = true) => { setToast({ m, ok }); setTimeout(() => setToast(null), 3000); };
  const f   = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sf  = (k, v) => setShopForm(p => ({ ...p, [k]: v }));

  const toggleSelect = id => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll    = () => setSelected(p => p.size === npcs.length ? new Set() : new Set(npcs.map(n => n.id)));

  const pushUndo = (label, fn) => { undoStack.current.push({ label, fn }); setUndoCount(undoStack.current.length); };

  const bulkDelete = async () => {
    if (!window.confirm(`Usunąć ${selected.size} NPC?`)) return;
    const saved = npcs.filter(n => selected.has(n.id));
    let done = 0;
    await Promise.all([...selected].map(async id => { const r = await api.world.deleteNpc(id); if (r.ok !== false) done++; }));
    if (done > 0) pushUndo(`Usunięcie ${done} NPC`, () => Promise.all(saved.map(n => api.world.createNpc({ ...n, id: undefined }))));
    msg(`Usunięto ${done}`);
    if (sel && selected.has(sel.id)) { setSel(null); setAdding(false); }
    setSelected(new Set());
    load();
  };

  const select   = n  => { setSel(n); setForm({ ...n }); setAdding(false); };
  const startAdd = () => { setSel(null); setForm({ mapa: mapId, nazwa: 'Nowy NPC', obrazek: 'avatar/m_pal21.gif', x: 35, y: 37, shop: 0, szerokosc: 32, dlugosc: 48 }); setAdding(true); };

  const save = async () => {
    const prev = sel ? { ...sel } : null;
    const r = adding ? await api.world.createNpc(form) : await api.world.updateNpc(sel.id, form);
    if (!r.ok) { msg(r.error || 'Błąd', false); return; }
    if (adding)  pushUndo(`Dodanie: ${form.nazwa}`,  () => api.world.deleteNpc(r.id));
    else         pushUndo(`Edycja: ${prev.nazwa}`,   () => api.world.updateNpc(prev.id, prev));
    msg(adding ? 'NPC dodany!' : 'Zapisano!'); load(); setSel(null); setAdding(false);
  };
  const del = async () => {
    if (!window.confirm('Usunąć NPC?')) return;
    const saved = { ...sel };
    const r = await api.world.deleteNpc(sel.id);
    if (!r.ok) { msg(r.error || 'Błąd', false); return; }
    pushUndo(`Usunięcie: ${saved.nazwa}`, () => api.world.createNpc({ ...saved, id: undefined }));
    msg('Usunięto!'); load(); setSel(null);
  };

  execUndoRef.current = async () => {
    const action = undoStack.current.pop();
    if (!action) return;
    try { await action.fn(); setToast({ m: `↩ Cofnięto: ${action.label}`, ok: true }); setTimeout(() => setToast(null), 3000); }
    catch { setToast({ m: 'Błąd cofania', ok: false }); setTimeout(() => setToast(null), 3000); }
    setUndoCount(undoStack.current.length);
    load(); setSel(null); setAdding(false);
  };
  const addShopItem = async () => {
    if (!sel?.shop) return;
    const r = await api.world.createShopItem({ ...shopForm, sklep: sel.shop });
    r.ok ? (msg('Dodano do sklepu!'), api.world.shopItems(sel.shop).then(r => Array.isArray(r) && setShopItems(r))) : msg(r.error || 'Błąd', false);
  };
  const delShopItem = async id => {
    await api.world.deleteShopItem(id);
    api.world.shopItems(sel.shop).then(r => Array.isArray(r) && setShopItems(r));
  };

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <SideList
        items={npcs} selId={sel?.id} onSelect={select}
        selectable selectedIds={selected} onToggleSelect={toggleSelect}
        header={
          <div style={{ padding: '8px 10px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: T.raised }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                <input type="checkbox" checked={npcs.length > 0 && selected.size === npcs.length}
                  onChange={selectAll}
                  style={{ cursor: 'pointer', width: 12, height: 12, accentColor: T.blue }} />
                <span style={{ color: selected.size > 0 ? T.blue : T.muted, fontSize: 9 }}>
                  {selected.size > 0 ? `${selected.size} zaznaczonych` : `${npcs.length} NPC`}
                </span>
              </label>
              <Btn onClick={startAdd} style={{ padding: '4px 8px', fontSize: 9 }}>+ Dodaj</Btn>
            </div>
          </div>
        }
        renderItem={n => (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 16, height: 24, backgroundImage: `url(/assets/${n.obrazek})`, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', flexShrink: 0 }} />
              <span style={{ color: T.text, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{n.nazwa}</span>
              {n.shop > 0 && <span style={{ color: T.amber, fontSize: 8 }}>🛒</span>}
            </div>
            <div style={{ color: T.dim, fontSize: 8, marginTop: 2, paddingLeft: 23 }}>({n.x},{n.y}){n.shop > 0 ? ` · Sklep #${n.shop}` : ''}</div>
          </>
        )}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toast && <Toast msg={toast.m} ok={toast.ok} />}

        {selected.size > 0 && (
          <Card color={T.blue}>
            <CardHead icon="☑" title={`Zaznaczono ${selected.size} z ${npcs.length} NPC`} color={T.blue}
              action={<Btn v="ghost" onClick={() => setSelected(new Set())} style={{ padding: '2px 8px', fontSize: 9 }}>✕ Odznacz</Btn>} />
            <div style={{ padding: '10px 12px' }}>
              <Btn v="danger" onClick={bulkDelete}>🗑 Usuń zaznaczone ({selected.size})</Btn>
            </div>
          </Card>
        )}

        {!(sel || adding) ? (
          !mapId ? <Empty icon="🗺" text="Wybierz mapę" /> : <Empty icon="🧑" text="Wybierz NPC z listy lub dodaj nowego" />
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {form.obrazek && <div style={{ width: 24, height: 36, backgroundImage: `url(/assets/${form.obrazek})`, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', border: `1px solid ${T.border}`, borderRadius: 3 }} />}
              <div>
                <div style={{ color: T.green, fontWeight: 'bold', fontSize: 13 }}>{adding ? '+ Nowy NPC' : form.nazwa}</div>
                {!adding && <div style={{ color: T.muted, fontSize: 9, marginTop: 2 }}>ID: {sel.id} · ({sel.x},{sel.y})</div>}
              </div>
            </div>

            <Card>
              <CardHead icon="🧑" title="Dane NPC" color={T.green} />
              <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ gridColumn: '1/-1' }}><Fld label="Nazwa" value={form.nazwa} onChange={v => f('nazwa', v)} /></div>
                <Fld label="Obrazek" value={form.obrazek} onChange={v => f('obrazek', v)} />
                <Fld label="Shop ID (0=brak)" value={form.shop} onChange={v => f('shop', v)} type="number" />
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', gridColumn: '1/-1' }}>
                  <div style={{ flex: 1 }}><Fld label="X" value={form.x} onChange={v => f('x', v)} type="number" /></div>
                  <div style={{ flex: 1 }}><Fld label="Y" value={form.y} onChange={v => f('y', v)} type="number" /></div>
                  {onRequestPick && <Btn onClick={onRequestPick} style={{ padding: '5px 10px', fontSize: 9, flexShrink: 0 }}>📍 Mapa</Btn>}
                </div>
              </div>
            </Card>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Btn v="ok" onClick={save}>✓ {adding ? 'Utwórz NPC' : 'Zapisz'}</Btn>
              {!adding && <Btn v="amber" onClick={async () => {
                const r = await api.world.createNpc({ ...sel, id: undefined, nazwa: sel.nazwa + ' (kopia)', x: sel.x + 2 });
                r.ok ? (msg('Sklonowano!'), load(), setSel(null)) : msg(r.error || 'Błąd', false);
              }}>📋 Klonuj</Btn>}
              {!adding && <Btn v="danger" onClick={del}>🗑 Usuń</Btn>}
              {undoCount > 0 && <Btn v="ghost" onClick={() => execUndoRef.current?.()} style={{ fontSize: 9, borderColor: 'rgba(251,191,36,0.4)', color: T.amber }}>↩ Cofnij ({undoCount})</Btn>}
              <Btn v="ghost" onClick={() => { setSel(null); setAdding(false); }} style={{ marginLeft: 'auto' }}>Anuluj</Btn>
            </div>

            {/* Shop management */}
            {!adding && sel?.shop > 0 && (
              <Card color={T.amber}>
                <CardHead icon="🛒" title={`Sklep #${sel.shop} — ${shopItems.length} towarów`} color={T.amber}
                  action={
                    <div style={{ display: 'flex', gap: 3 }}>
                      {['list', 'add'].map(t => (
                        <button key={t} onClick={() => setShopTab(t)} style={{ padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 9, fontFamily: FF, background: shopTab === t ? `${T.amber}22` : 'rgba(6,12,20,0.5)', border: `1px solid ${shopTab === t ? T.amber + '55' : T.border}`, color: shopTab === t ? T.amber : T.muted }}>
                          {t === 'list' ? '📋 Lista' : '+ Dodaj'}
                        </button>
                      ))}
                    </div>
                  }
                />
                {shopTab === 'list' && (
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {shopItems.length === 0 && <div style={{ padding: '14px', color: T.dim, textAlign: 'center', fontSize: 10 }}>Pusty sklep</div>}
                    {shopItems.map(si => (
                      <div key={si.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderBottom: `1px solid ${T.border}14` }}>
                        {si.obrazek && <div style={{ width: 20, height: 20, backgroundImage: `url(/assets/${si.obrazek})`, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated' }} />}
                        <span style={{ color: RC[si.klasa] || T.text, fontSize: 10, flex: 1 }}>{si.nazwa}</span>
                        <span style={{ color: T.dim, fontSize: 9 }}>{si.typ}</span>
                        <span style={{ color: '#FCD34D', fontWeight: 'bold', fontSize: 9 }}>{si.wartosc_kupna}g</span>
                        <Btn v="danger" onClick={() => delShopItem(si.id)} style={{ padding: '2px 6px', fontSize: 9 }}>✕</Btn>
                      </div>
                    ))}
                  </div>
                )}
                {shopTab === 'add' && (
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <Fld label="Nazwa towaru" value={shopForm.nazwa} onChange={v => sf('nazwa', v)} />
                      <div>
                        <Lbl>Rzadkość</Lbl>
                        <select value={shopForm.klasa} onChange={e => sf('klasa', e.target.value)} style={{ width: '100%', padding: '7px 8px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 10, outline: 'none', fontFamily: FF }}>
                          {['normal', 'unique', 'heroic', 'legendary', 'artefact', 'upgraded'].map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                      </div>
                      <div>
                        <Lbl>Typ</Lbl>
                        <select value={shopForm.typ} onChange={e => sf('typ', e.target.value)} style={{ width: '100%', padding: '7px 8px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 10, outline: 'none', fontFamily: FF }}>
                          {['Konsupcyjne','Zbroja','Helm','BronJednoreczna','BronDwureczna','Tarcza','Buty','Rekawice','Naszyjnik','Pierscien'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <Fld label="Obrazek" value={shopForm.obrazek} onChange={v => sf('obrazek', v)} />
                      <Fld label="Cena (złoto)" value={shopForm.wartosc_kupna} onChange={v => sf('wartosc_kupna', v)} type="number" />
                      <Fld label="Min. poziom" value={shopForm.wym_poziom} onChange={v => sf('wym_poziom', v)} type="number" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                      {[['ATK min','obr_min'],['ATK max','obr_max'],['AC','ac'],['HP','zycie'],['SA%','sa'],['STR','sila'],['DEX','zrecznosc'],['INT','intelekt']].map(([l,k]) => (
                        <Fld key={k} label={l} value={shopForm[k] || 0} onChange={v => sf(k, Number(v))} type="number" />
                      ))}
                    </div>
                    <Fld label="Opis" value={shopForm.opis} onChange={v => sf('opis', v)} rows={2} placeholder="Opis przedmiotu..." />
                    <Btn v="ok" onClick={addShopItem}>+ Dodaj do sklepu</Btn>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── PORTALS EDITOR ────────────────────────────────────────────────────────────
function PortalsEditor({ mapId, maps }) {
  const [portals, setPortals] = useState([]);
  const [form,    setForm]    = useState({ x: 35, y: 37, do_mapa: 1, do_x: 35, do_y: 37 });
  const [toast,   setToast]   = useState(null);

  const load = useCallback(() => { if (mapId) api.world.portals(mapId).then(r => Array.isArray(r) && setPortals(r)); }, [mapId]);
  useEffect(() => { load(); }, [mapId, load]);

  const msg = (m, ok = true) => { setToast({ m, ok }); setTimeout(() => setToast(null), 3000); };
  const f   = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const add = async () => {
    const r = await api.world.createPortal({ ...form, mapa: mapId });
    r.ok ? (msg('Portal dodany!'), load()) : msg(r.error || 'Błąd', false);
  };
  const del = async id => {
    const r = await api.world.deletePortal(id);
    r.ok && (msg('Usunięto!'), load());
  };

  if (!mapId) return <Empty icon="🗺" text="Wybierz mapę" />;

  return (
    <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: 1 }}>
      {toast && <Toast msg={toast.m} ok={toast.ok} />}

      {/* List */}
      <Card>
        <CardHead icon="🔮" title={`Portale na mapie (${portals.length})`} color={T.purple} />
        <div>
          {portals.length === 0 && <div style={{ padding: '14px', color: T.dim, textAlign: 'center', fontSize: 10 }}>Brak portali</div>}
          {portals.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: `1px solid ${T.border}14` }}>
              <span style={{ color: T.purple, fontSize: 18 }}>🔮</span>
              <div style={{ flex: 1 }}>
                <span style={{ color: T.text, fontSize: 10 }}>({p.x},{p.y})</span>
                <span style={{ color: T.dim, fontSize: 9, margin: '0 8px' }}>→</span>
                <span style={{ color: T.blue, fontSize: 10 }}>Mapa {p.do_mapa} ({p.do_x},{p.do_y})</span>
                <span style={{ color: T.dim, fontSize: 9, marginLeft: 6 }}>{maps.find(m => m.id === p.do_mapa)?.nazwa || ''}</span>
              </div>
              <Btn v="danger" onClick={() => del(p.id)} style={{ padding: '3px 8px', fontSize: 9 }}>✕</Btn>
            </div>
          ))}
        </div>
      </Card>

      {/* Add form */}
      <Card color={T.purple}>
        <CardHead icon="+" title="Dodaj portal" color={T.purple} />
        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 10 }}>
            <Fld label="Z X" value={form.x} onChange={v => f('x', Number(v))} type="number" />
            <Fld label="Z Y" value={form.y} onChange={v => f('y', Number(v))} type="number" />
            <div style={{ gridColumn: 'span 1' }}>
              <Lbl>Do mapy</Lbl>
              <select value={form.do_mapa} onChange={e => f('do_mapa', Number(e.target.value))}
                style={{ width: '100%', padding: '7px 6px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 9, outline: 'none', fontFamily: FF }}>
                {maps.map(m => <option key={m.id} value={m.id}>#{m.id} {m.nazwa}</option>)}
              </select>
            </div>
            <Fld label="Do X" value={form.do_x} onChange={v => f('do_x', Number(v))} type="number" />
            <Fld label="Do Y" value={form.do_y} onChange={v => f('do_y', Number(v))} type="number" />
          </div>
          <Btn v="ok" onClick={add}>+ Dodaj portal</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── ITEM LOOT EDITOR ──────────────────────────────────────────────────────────
function ItemLootEditor() {
  const [items,   setItems]   = useState([]);
  const [sel,     setSel]     = useState(null);
  const [form,    setForm]    = useState({});
  const [adding,  setAdding]  = useState(false);
  const [search,  setSearch]  = useState('');
  const [toast,   setToast]   = useState(null);

  const BLANK = { nazwa: '', klasa: 'normal', typ: 'Zbroja', obrazek: 'items/default.png', wym_poziom: 0, wartosc_sprzedazy: 0, zycie: 0, sa: 0, ac: 0, acm: 0, obr_min: 0, obr_max: 0, sila: 0, zrecznosc: 0, intelekt: 0, wszystkie_cechy: 0, ck: 0, ckf: 120, unik: 0, blok: 0, absorbcja: 0, mabsorbcja: 0, przebicie: 0, obr_mag: 0, mana: 0, leczenie: 0, mikstura_leczenie: 0, pelne_leczenie: 0, opis: '' };
  const TYPES = ['Zbroja','Helm','BronJednoreczna','BronDwureczna','BronDystansowa','Tarcza','Buty','Rekawice','Naszyjnik','Pierscien','Talizman','Laska','Rozdzka','Konsupcyjne','Strzaly'];
  const STATS = [['zycie','HP'],['sa','SA%'],['ac','AC'],['acm','ACM'],['obr_min','ATK min'],['obr_max','ATK max'],['sila','STR'],['zrecznosc','DEX'],['intelekt','INT'],['wszystkie_cechy','Cechy'],['ck','Kryt%'],['ckf','Kryt×'],['unik','Unik'],['blok','Blok'],['absorbcja','Absorb'],['mabsorbcja','M.Absorb'],['przebicie','Przebicie'],['obr_mag','Mag.ATK'],['mana','Mana'],['leczenie','Lecz'],['mikstura_leczenie','Leczy HP']];

  const load = useCallback(s => api.world.itemsLoot(s).then(r => Array.isArray(r) && setItems(r)), []);
  useEffect(() => { load(''); }, [load]);

  const msg = (m, ok = true) => { setToast({ m, ok }); setTimeout(() => setToast(null), 3000); };
  const f   = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const select   = i => { setSel(i); setForm({ ...BLANK, ...i }); setAdding(false); };
  const startAdd = () => { setSel(null); setForm({ ...BLANK }); setAdding(true); };
  const clone    = () => { setForm({ ...form, nazwa: form.nazwa + ' (kopia)' }); setAdding(true); setSel(null); };

  const save = async () => {
    const r = adding ? await api.world.createItemLoot(form) : await api.world.updateItemLoot(sel.id, form);
    r.ok ? (msg(adding ? 'Przedmiot dodany!' : 'Zapisano!'), load(search), setSel(null), setAdding(false)) : msg(r.error || 'Błąd', false);
  };
  const del = async () => {
    if (!window.confirm('Usunąć przedmiot?')) return;
    const r = await api.world.deleteItemLoot(sel.id);
    r.ok && (msg('Usunięto!'), load(search), setSel(null));
  };

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', background: T.surface }}>
        <div style={{ padding: '8px 10px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: T.raised, display: 'flex', gap: 5 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: T.dim, fontSize: 11 }}>🔍</span>
            <input value={search} onChange={e => { setSearch(e.target.value); load(e.target.value); }}
              placeholder="Szukaj..." style={{ width: '100%', padding: '6px 8px 6px 24px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 9, outline: 'none', fontFamily: FF, boxSizing: 'border-box' }} />
          </div>
          <Btn onClick={startAdd} style={{ padding: '4px 8px', fontSize: 9 }}>+</Btn>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {items.map(i => (
            <div key={i.id} onClick={() => select(i)}
              style={{ padding: '6px 10px', cursor: 'pointer', borderBottom: `1px solid ${T.border}14`, borderLeft: `3px solid ${sel?.id === i.id ? RC[i.klasa] || T.blueDim : 'transparent'}`, background: sel?.id === i.id ? 'rgba(29,78,216,0.08)' : 'transparent' }}>
              <div style={{ color: RC[i.klasa] || T.text, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.nazwa}</div>
              <div style={{ color: T.dim, fontSize: 8 }}>{i.typ} · poz.{i.wym_poziom}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toast && <Toast msg={toast.m} ok={toast.ok} />}
        {!(sel || adding) ? <Empty icon="🎒" text="Wybierz przedmiot lub stwórz nowy" /> : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {form.obrazek && <div style={{ width: 40, height: 40, backgroundImage: `url(/assets/${form.obrazek})`, backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', border: `1px solid ${RC[form.klasa] || T.border}44`, borderRadius: 5 }} />}
              <div>
                <div style={{ color: RC[form.klasa] || T.blue, fontWeight: 'bold', fontSize: 13 }}>{adding ? '+ Nowy przedmiot' : form.nazwa}</div>
                {!adding && <div style={{ color: T.muted, fontSize: 9, marginTop: 2 }}>ID: {sel.id}</div>}
              </div>
            </div>

            <Card>
              <CardHead icon="📋" title="Podstawowe" />
              <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ gridColumn: '1/-1' }}><Fld label="Nazwa" value={form.nazwa} onChange={v => f('nazwa', v)} /></div>
                <div>
                  <Lbl>Typ</Lbl>
                  <select value={form.typ || ''} onChange={e => f('typ', e.target.value)} style={{ width: '100%', padding: '7px 8px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 10, outline: 'none', fontFamily: FF }}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Lbl>Rzadkość</Lbl>
                  <select value={form.klasa || 'normal'} onChange={e => f('klasa', e.target.value)} style={{ width: '100%', padding: '7px 8px', background: 'rgba(4,8,16,0.85)', color: RC[form.klasa] || T.text, border: `1px solid ${RC[form.klasa] || T.border}44`, borderRadius: 5, fontSize: 10, outline: 'none', fontFamily: FF }}>
                    {['normal','unique','heroic','legendary','artefact','upgraded'].map(k => <option key={k} style={{ color: RC[k] }}>{k}</option>)}
                  </select>
                </div>
                <Fld label="Obrazek (ścieżka)" value={form.obrazek} onChange={v => f('obrazek', v)} />
                <Fld label="Min. poziom" value={form.wym_poziom} onChange={v => f('wym_poziom', v)} type="number" />
                <Fld label="Cena sprzedaży" value={form.wartosc_sprzedazy} onChange={v => f('wartosc_sprzedazy', v)} type="number" />
              </div>
            </Card>

            <Card>
              <CardHead icon="⚔" title="Statystyki" color={T.red} />
              <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                {STATS.map(([k, l]) => (
                  <div key={k}>
                    <Lbl>{l}</Lbl>
                    <input type="number" value={form[k] || 0} onChange={e => f(k, Number(e.target.value))} style={{ padding: '5px 7px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 10, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: FF }} />
                  </div>
                ))}
              </div>
              <div style={{ padding: '0 12px 10px' }}>
                <Fld label="Opis / efekt" value={form.opis} onChange={v => f('opis', v)} rows={2} placeholder="Opis wyświetlany graczom..." />
              </div>
            </Card>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Btn v="ok" onClick={save}>✓ {adding ? 'Utwórz' : 'Zapisz'}</Btn>
              {!adding && <Btn v="amber" onClick={clone}>⎘ Klonuj</Btn>}
              {!adding && <Btn v="danger" onClick={del}>🗑 Usuń</Btn>}
              <Btn v="ghost" onClick={() => { setSel(null); setAdding(false); }} style={{ marginLeft: 'auto' }}>Anuluj</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── LOOT PACK EDITOR ──────────────────────────────────────────────────────────
function LootPackEditor() {
  const [packs,     setPacks]     = useState([]);
  const [selPack,   setSelPack]   = useState(null);
  const [allItems,  setAllItems]  = useState([]);
  const [search,    setSearch]    = useState('');
  const [selItemId, setSelItemId] = useState('');
  const [chance,    setChance]    = useState(100);
  const [newPackId, setNewPackId] = useState('');
  const [toast,     setToast]     = useState(null);

  const msg = (m, ok = true) => { setToast({ m, ok }); setTimeout(() => setToast(null), 3000); };
  const loadPacks = useCallback(() => { api.world.lootPacks().then(r => Array.isArray(r) && setPacks(r)); }, []);
  useEffect(() => { loadPacks(); api.world.itemsLoot('').then(r => Array.isArray(r) && setAllItems(r)); }, [loadPacks]);

  const pack = packs.find(p => p.id === selPack);
  const filtered = allItems.filter(i => !search || i.nazwa.toLowerCase().includes(search.toLowerCase()));

  const addItem = async () => {
    if (!selPack || !selItemId) return;
    const r = await api.world.addLootPackItem(selPack, { przedmiot_id: Number(selItemId), szansa: chance });
    r.ok ? (msg('Dodano!'), loadPacks(), setSelItemId('')) : msg(r.error || 'Błąd', false);
  };
  const removeEntry = async id => { await api.world.removeLootEntry(id); loadPacks(); };

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Packs sidebar */}
      <div style={{ width: 180, flexShrink: 0, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', background: T.surface }}>
        <div style={{ padding: '8px 10px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: T.raised }}>
          <span style={{ color: T.muted, fontSize: 9 }}>{packs.length} paczek loot</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {packs.map(p => (
            <div key={p.id} onClick={() => setSelPack(p.id)}
              style={{ padding: '7px 10px', cursor: 'pointer', borderBottom: `1px solid ${T.border}14`, borderLeft: `3px solid ${selPack === p.id ? T.blueDim : 'transparent'}`, background: selPack === p.id ? 'rgba(29,78,216,0.1)' : 'transparent' }}>
              <div style={{ color: T.text, fontSize: 10, fontWeight: 'bold' }}>Paczka #{p.id}</div>
              <div style={{ color: T.dim, fontSize: 8, marginTop: 1 }}>{p.items.length} przedmiotów</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '7px', borderTop: `1px solid ${T.border}`, flexShrink: 0, display: 'flex', gap: 4 }}>
          <input value={newPackId} onChange={e => setNewPackId(e.target.value)} placeholder="Nr. paczki" style={{ flex: 1, padding: '5px 7px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 9, outline: 'none', fontFamily: FF, minWidth: 0 }} />
          <Btn v="ok" style={{ padding: '4px 7px' }} onClick={async () => {
            if (!newPackId || !allItems.length) return;
            const r = await api.world.addLootPackItem(newPackId, { przedmiot_id: allItems[0].id, szansa: 100 });
            r.ok ? (msg(`Paczka #${newPackId}!`), loadPacks(), setNewPackId('')) : msg(r.error || 'Błąd', false);
          }}>+</Btn>
        </div>
      </div>

      {/* Detail */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toast && <Toast msg={toast.m} ok={toast.ok} />}
        {!pack ? <Empty icon="📦" text="Wybierz paczkę loot z listy" /> : (
          <>
            <div style={{ color: T.blue, fontWeight: 'bold', fontSize: 13 }}>Paczka loot #{selPack}</div>

            {/* Items in pack */}
            <Card>
              <CardHead icon="📦" title={`Zawartość (${pack.items.length} przedmiotów)`} color={T.amber} />
              <div>
                {pack.items.length === 0 && <div style={{ padding: 14, color: T.dim, textAlign: 'center', fontSize: 10 }}>Pusta paczka</div>}
                {[...pack.items].sort((a, b) => (b.szansa || 100) - (a.szansa || 100)).map(e => {
                  const pct = e.szansa || 100;
                  const barC = pct >= 50 ? T.green : pct >= 15 ? T.amber : T.red;
                  return (
                    <div key={e.id} style={{ borderBottom: `1px solid ${T.border}14` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 2px' }}>
                        <span style={{ color: RC[e.klasa] || T.text, fontSize: 10, flex: 1 }}>{e.nazwa}</span>
                        <span style={{ color: T.dim, fontSize: 9 }}>{e.typ}</span>
                        <span style={{ color: barC, fontWeight: 'bold', fontSize: 10, minWidth: 35, textAlign: 'right' }}>{pct}%</span>
                        <Btn v="danger" onClick={() => removeEntry(e.id)} style={{ padding: '2px 6px', fontSize: 9 }}>✕</Btn>
                      </div>
                      <div style={{ height: 3, background: 'rgba(0,0,0,0.35)', margin: '0 12px 4px', borderRadius: 2 }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: barC, borderRadius: 2, transition: 'width .25s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Add item */}
            <Card color={T.green}>
              <CardHead icon="+" title="Dodaj przedmiot do paczki" color={T.green} />
              <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: T.dim, fontSize: 11 }}>🔍</span>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj przedmiotu..."
                    style={{ width: '100%', padding: '7px 10px 7px 28px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 10, outline: 'none', fontFamily: FF, boxSizing: 'border-box' }} />
                </div>
                <div style={{ maxHeight: 130, overflowY: 'auto', border: `1px solid ${T.border}`, borderRadius: 5 }}>
                  {filtered.slice(0, 40).map(i => (
                    <div key={i.id} onClick={() => setSelItemId(String(i.id))}
                      style={{ padding: '4px 9px', cursor: 'pointer', background: selItemId === String(i.id) ? 'rgba(29,78,216,0.18)' : 'transparent', borderBottom: `1px solid ${T.border}14`, display: 'flex', gap: 6 }}>
                      <span style={{ color: RC[i.klasa] || T.text, fontSize: 9 }}>{i.nazwa}</span>
                      <span style={{ color: T.dim, fontSize: 8, marginLeft: 'auto' }}>{i.typ}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div>
                    <Lbl>Szansa (%)</Lbl>
                    <input type="number" value={chance} onChange={e => setChance(Number(e.target.value))} min={1} max={100}
                      style={{ width: 70, padding: '6px 8px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 10, outline: 'none', fontFamily: FF }} />
                  </div>
                  <Btn v="ok" disabled={!selItemId} onClick={addItem}>+ Dodaj do paczki</Btn>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// ── MAP TILE EDITOR ───────────────────────────────────────────────────────────
const CELL = 10;
const ZONE_TYPES = [
  { id: 'no_pvp',  label: 'Brak PvP',         fill: 'rgba(74,222,128,0.2)',   stroke: 'rgba(74,222,128,0.7)',  dot: '#4ADE80'  },
  { id: 'safe',    label: 'Bezpieczna',        fill: 'rgba(59,130,246,0.18)',  stroke: 'rgba(59,130,246,0.65)', dot: '#60A5FA'  },
  { id: 'danger',  label: 'Walki',             fill: 'rgba(239,68,68,0.2)',    stroke: 'rgba(239,68,68,0.65)',  dot: '#F87171'  },
  { id: 'event',   label: 'Event',             fill: 'rgba(168,85,247,0.2)',   stroke: 'rgba(168,85,247,0.7)',  dot: '#A78BFA'  },
  { id: 'fog',     label: 'Mgła',              fill: 'rgba(148,163,184,0.25)', stroke: 'rgba(148,163,184,0.6)', dot: '#94A3B8'  },
];

function MapTileEditor({ mapId, maps, pickMode, onPick }) {
  const canvasRef  = useRef(null);
  const drawStart  = useRef(null);
  const [mapData,      setMapData]      = useState(null);
  const [blockers,     setBlockers]     = useState(new Set());
  const [mobs,         setMobs]         = useState([]);
  const [npcs,         setNpcs]         = useState([]);
  const [portals,      setPortals]      = useState([]);
  const [hovered,      setHovered]      = useState(null);
  const [mode,         setMode]         = useState('blocker');
  const [info,         setInfo]         = useState(null);
  const [toast,        setToast]        = useState(null);
  const [zones,        setZones]        = useState([]);
  const [drawingZone,  setDrawingZone]  = useState(null);
  const [newZone,      setNewZone]      = useState(null);
  const [newZoneType,  setNewZoneType]  = useState('no_pvp');
  const [newZoneLabel, setNewZoneLabel] = useState('');

  const msg = (m, ok = true) => { setToast({ m, ok }); setTimeout(() => setToast(null), 2500); };

  const loadAll = useCallback(async () => {
    if (!mapId) return;
    const [bR, mR, nR, pR] = await Promise.all([api.world.blockers(mapId), api.world.mobs(mapId), api.world.npcs(mapId), api.world.portals(mapId)]);
    if (Array.isArray(bR)) setBlockers(new Set(bR.map(r => `${r.x},${r.y}`)));
    if (Array.isArray(mR)) setMobs(mR);
    if (Array.isArray(nR)) setNpcs(nR);
    if (Array.isArray(pR)) setPortals(pR);
  }, [mapId]);

  useEffect(() => {
    if (!mapId) { setMapData(null); return; }
    setMapData(maps.find(m => m.id === mapId) || null);
    loadAll();
  }, [mapId, maps, loadAll]);

  useEffect(() => {
    try { setZones(mapData?.strefy ? JSON.parse(mapData.strefy) : []); } catch { setZones([]); }
  }, [mapData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapData) return;
    const W = mapData.maks_x + 1, H = mapData.maks_y + 1;
    canvas.width = W * CELL; canvas.height = H * CELL;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#060E18'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(59,130,246,0.07)'; ctx.lineWidth = 0.5;
      for (let x = 0; x <= W; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H * CELL); ctx.stroke(); }
      for (let y = 0; y <= H; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W * CELL, y * CELL); ctx.stroke(); }

      // Draw zones (below all overlays)
      zones.forEach(z => {
        const zt = ZONE_TYPES.find(t => t.id === z.type);
        const zx = z.x1 * CELL, zy = z.y1 * CELL;
        const zw = (z.x2 - z.x1 + 1) * CELL, zh = (z.y2 - z.y1 + 1) * CELL;
        ctx.fillStyle = zt?.fill || 'rgba(255,255,255,0.1)';
        ctx.fillRect(zx, zy, zw, zh);
        ctx.strokeStyle = zt?.stroke || 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1; ctx.strokeRect(zx + 0.5, zy + 0.5, zw - 1, zh - 1);
        ctx.fillStyle = zt?.stroke || 'rgba(255,255,255,0.8)';
        ctx.font = '7px sans-serif';
        ctx.fillText((z.label || zt?.label || '').substring(0, 14), zx + 2, zy + 9);
      });

      // Zone draw preview
      if (drawingZone) {
        const px = Math.min(drawingZone.x1, drawingZone.x2) * CELL, py = Math.min(drawingZone.y1, drawingZone.y2) * CELL;
        const pw = (Math.abs(drawingZone.x2 - drawingZone.x1) + 1) * CELL, ph = (Math.abs(drawingZone.y2 - drawingZone.y1) + 1) * CELL;
        ctx.fillStyle = 'rgba(251,191,36,0.15)'; ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = '#FBBF24'; ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]); ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1); ctx.setLineDash([]);
      }

      ctx.fillStyle = 'rgba(239,68,68,0.5)';
      blockers.forEach(k => { const [bx, by] = k.split(',').map(Number); ctx.fillRect(bx * CELL, by * CELL, CELL, CELL); });

      ctx.fillStyle = 'rgba(139,92,246,0.75)';
      portals.forEach(p => { ctx.fillRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2); });

      npcs.forEach(n => { ctx.fillStyle = '#4ADE80'; ctx.beginPath(); ctx.arc(n.x * CELL + CELL / 2, n.y * CELL + CELL / 2, CELL / 2 - 1, 0, Math.PI * 2); ctx.fill(); });
      mobs.forEach(m => { ctx.fillStyle = m.zycie > 0 ? '#F59E0B' : 'rgba(100,60,10,0.4)'; ctx.beginPath(); ctx.arc(m.x * CELL + CELL / 2, m.y * CELL + CELL / 2, CELL / 2 - 1, 0, Math.PI * 2); ctx.fill(); });

      if (hovered) { ctx.strokeStyle = '#60A5FA'; ctx.lineWidth = 1.5; ctx.strokeRect(hovered.x * CELL, hovered.y * CELL, CELL, CELL); }
    };

    if (mapData.obrazek) {
      const img = new Image(); img.src = `/assets/${mapData.obrazek}`;
      img.onload  = () => { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); draw(); };
      img.onerror = draw;
      if (img.complete && img.naturalWidth) { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); draw(); }
    } else draw();
  }, [mapData, blockers, mobs, npcs, portals, hovered, zones, drawingZone]);

  const getCoords = e => {
    const canvas = canvasRef.current; if (!canvas || !mapData) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width) / CELL);
    const y = Math.floor((e.clientY - rect.top)  * (canvas.height / rect.height) / CELL);
    if (x < 0 || y < 0 || x > mapData.maks_x || y > mapData.maks_y) return null;
    return { x, y };
  };

  const handleClick = async e => {
    const pos = getCoords(e); if (!pos || !mapId) return;
    if (pickMode) { onPick?.(pos); return; }
    if (mode === 'zone') return;
    const key = `${pos.x},${pos.y}`;
    if (mode === 'blocker') {
      if (blockers.has(key)) { const r = await api.world.removeBlocker({ mapa: mapId, x: pos.x, y: pos.y }); if (r.ok !== false) setBlockers(p => { const n = new Set(p); n.delete(key); return n; }); }
      else                    { const r = await api.world.addBlocker({ mapa: mapId, x: pos.x, y: pos.y });    if (r.ok !== false) setBlockers(p => new Set([...p, key])); }
    } else {
      const zone = zones.find(z => pos.x >= z.x1 && pos.x <= z.x2 && pos.y >= z.y1 && pos.y <= z.y2);
      setInfo({ pos, mob: mobs.find(m => m.x === pos.x && m.y === pos.y), npc: npcs.find(n => n.x === pos.x && n.y === pos.y), portal: portals.find(p => p.x === pos.x && p.y === pos.y), blocked: blockers.has(key), zone });
    }
  };

  const saveZones = async next => {
    setZones(next);
    await api.world.updateMap(mapId, { strefy: JSON.stringify(next) });
  };

  if (!mapId) return <Empty icon="🗺" text="Wybierz mapę aby edytować" />;
  if (!mapData) return <Empty icon="⏳" text="Ładowanie mapy..." />;

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Canvas */}
      <div style={{ flex: 1, overflow: 'auto', background: 'rgba(2,5,10,0.9)', display: 'flex', flexDirection: 'column' }}>
        {toast && <div style={{ flexShrink: 0, padding: '4px 12px' }}><Toast msg={toast.m} ok={toast.ok} /></div>}

        {/* Pick mode banner */}
        {pickMode && (
          <div style={{ padding: '8px 14px', background: 'rgba(34,197,94,0.1)', borderBottom: `1px solid rgba(74,222,128,0.3)`, color: T.green, fontSize: 10, display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 14 }}>📍</span>
            <span>Kliknij kafel na mapie aby ustawić pozycję {pickMode === 'mobs' ? 'moba' : 'NPC'}</span>
            <Btn v="ghost" onClick={() => onPick?.(null)} style={{ marginLeft: 'auto', padding: '3px 8px', fontSize: 9 }}>✕ Anuluj</Btn>
          </div>
        )}

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 6, padding: '7px 10px', alignItems: 'center', borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: T.raised, flexWrap: 'wrap' }}>
          {[['blocker', '🔴 Blokery'], ['view', '🔍 Podgląd'], ['zone', '🟩 Strefy']].map(([m, l]) => (
            <button key={m} onClick={() => { setMode(m); setInfo(null); setNewZone(null); drawStart.current = null; setDrawingZone(null); }} style={{ padding: '4px 12px', fontSize: 9, borderRadius: 5, cursor: 'pointer', fontFamily: FF, background: mode === m ? 'rgba(29,78,216,0.25)' : 'rgba(4,8,16,0.5)', color: mode === m ? T.blue : T.muted, border: `1px solid ${mode === m ? T.borderH : T.border}` }}>{l}</button>
          ))}
          <span style={{ color: T.dim, fontSize: 9 }}>{mapData.nazwa} · {mapData.maks_x + 1}×{mapData.maks_y + 1} · {blockers.size} blokery</span>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
            {[['rgba(239,68,68,0.7)', 'Bloker'], ['rgba(139,92,246,0.8)', 'Portal'], ['#4ADE80', 'NPC'], ['#F59E0B', 'Mob']].map(([c, l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, color: T.dim }}>
                <span style={{ width: 10, height: 10, background: c, borderRadius: 2, display: 'inline-block' }} />{l}
              </span>
            ))}
          </div>
          <Btn onClick={loadAll} v="ghost" style={{ marginLeft: 'auto', padding: '3px 8px', fontSize: 9 }}>↺</Btn>
        </div>

        <div style={{ overflow: 'auto', padding: 8 }}>
          <canvas ref={canvasRef}
            onClick={handleClick}
            onMouseMove={e => {
              const pos = getCoords(e); setHovered(pos);
              if (drawStart.current && mode === 'zone' && pos) setDrawingZone({ x1: drawStart.current.x, y1: drawStart.current.y, x2: pos.x, y2: pos.y });
            }}
            onMouseLeave={() => { setHovered(null); if (mode === 'zone') { drawStart.current = null; setDrawingZone(null); } }}
            onMouseDown={e => { if (mode !== 'zone') return; const pos = getCoords(e); if (!pos) return; drawStart.current = pos; setDrawingZone({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y }); }}
            onMouseUp={e => {
              if (mode !== 'zone' || !drawStart.current) return;
              const pos = getCoords(e) || drawStart.current;
              const z = { x1: Math.min(drawStart.current.x, pos.x), y1: Math.min(drawStart.current.y, pos.y), x2: Math.max(drawStart.current.x, pos.x), y2: Math.max(drawStart.current.y, pos.y) };
              drawStart.current = null; setDrawingZone(null);
              if (!(z.x1 === z.x2 && z.y1 === z.y2)) { setNewZone(z); setInfo(null); }
            }}
            style={{ cursor: mode === 'zone' || mode === 'blocker' ? 'crosshair' : 'pointer', display: 'block', imageRendering: 'pixelated', maxWidth: '100%', userSelect: 'none' }} />
        </div>
      </div>

      {/* Info panel */}
      {info && (
        <div style={{ width: 190, flexShrink: 0, borderLeft: `1px solid ${T.border}`, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 8, background: T.surface }}>
          <div style={{ color: T.blue, fontWeight: 'bold', fontSize: 11 }}>Kafel ({info.pos.x},{info.pos.y})</div>
          {info.blocked && <span style={{ color: T.red, fontSize: 9 }}>🚫 Zablokowany</span>}

          {info.mob && (
            <Card color={T.amber}>
              <CardHead icon="👾" title="Mob" color={T.amber} />
              <div style={{ padding: '8px 10px' }}>
                <div style={{ color: T.amber, fontWeight: 'bold', fontSize: 11 }}>{info.mob.nazwa}</div>
                <div style={{ color: T.muted, fontSize: 9, marginTop: 3 }}>poz.{info.mob.poziom}</div>
                <div style={{ height: 4, background: 'rgba(0,0,0,0.4)', borderRadius: 2, overflow: 'hidden', marginTop: 5 }}>
                  <div style={{ width: `${info.mob.zycie_max > 0 ? (info.mob.zycie / info.mob.zycie_max) * 100 : 0}%`, height: '100%', background: T.green, borderRadius: 2 }} />
                </div>
                <div style={{ color: T.dim, fontSize: 8, marginTop: 2 }}>{info.mob.zycie}/{info.mob.zycie_max} HP</div>
              </div>
            </Card>
          )}
          {info.npc && (
            <Card color={T.green}>
              <CardHead icon="🧑" title="NPC" color={T.green} />
              <div style={{ padding: '8px 10px' }}>
                <div style={{ color: T.green, fontWeight: 'bold', fontSize: 11 }}>{info.npc.nazwa}</div>
                {info.npc.shop > 0 && <div style={{ color: T.amber, fontSize: 9, marginTop: 3 }}>🛒 Sklep #{info.npc.shop}</div>}
              </div>
            </Card>
          )}
          {info.portal && (
            <Card color={T.purple}>
              <CardHead icon="🔮" title="Portal" color={T.purple} />
              <div style={{ padding: '8px 10px', color: T.muted, fontSize: 10 }}>
                → Mapa {info.portal.do_mapa} ({info.portal.do_x},{info.portal.do_y})
              </div>
            </Card>
          )}
          {!info.mob && !info.npc && !info.portal && !info.blocked && !info.zone && (
            <div style={{ color: T.dim, fontSize: 10 }}>Pusty kafel</div>
          )}
          {info.zone && (
            <Card color={ZONE_TYPES.find(t => t.id === info.zone.type)?.dot}>
              <CardHead icon="🟩" title="Strefa" color={ZONE_TYPES.find(t => t.id === info.zone.type)?.dot} />
              <div style={{ padding: '8px 10px' }}>
                <div style={{ color: ZONE_TYPES.find(t => t.id === info.zone.type)?.dot, fontWeight: 'bold', fontSize: 10 }}>{info.zone.label || ZONE_TYPES.find(t => t.id === info.zone.type)?.label}</div>
                <div style={{ color: T.dim, fontSize: 8, marginTop: 3 }}>({info.zone.x1},{info.zone.y1})→({info.zone.x2},{info.zone.y2})</div>
              </div>
            </Card>
          )}
          <Btn v="ghost" onClick={() => setInfo(null)} style={{ marginTop: 'auto', padding: '4px 8px', fontSize: 9 }}>✕ Zamknij</Btn>
        </div>
      )}

      {/* Zone editor panel */}
      {mode === 'zone' && (
        <div style={{ width: 200, flexShrink: 0, borderLeft: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', background: T.surface }}>
          <div style={{ padding: '7px 12px', background: T.raised, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
            <span style={{ color: T.muted, fontSize: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>Strefy · {zones.length}</span>
            <div style={{ color: T.dim, fontSize: 8, marginTop: 2 }}>Przeciągnij aby narysować</div>
          </div>

          {newZone ? (
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ color: T.amber, fontSize: 10, fontWeight: 'bold' }}>
                Nowa strefa ({newZone.x1},{newZone.y1})→({newZone.x2},{newZone.y2})
              </div>
              <div>
                <Lbl>Typ</Lbl>
                <select value={newZoneType} onChange={e => setNewZoneType(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 10, outline: 'none', fontFamily: FF }}>
                  {ZONE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <Lbl>Etykieta (opcjonalnie)</Lbl>
                <Inp value={newZoneLabel} onChange={e => setNewZoneLabel(e.target.value)} placeholder="np. Baza drużyny A" />
              </div>
              <Btn v="ok" onClick={async () => {
                const z = { id: Date.now(), ...newZone, type: newZoneType, label: newZoneLabel };
                await saveZones([...zones, z]);
                msg('Strefa dodana!'); setNewZone(null); setNewZoneLabel('');
              }}>+ Dodaj strefę</Btn>
              <Btn v="ghost" onClick={() => setNewZone(null)}>Anuluj</Btn>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {zones.length === 0 && <div style={{ color: T.dim, textAlign: 'center', padding: 20, fontSize: 10 }}>Brak stref<br/>Przeciągnij na mapie</div>}
              {zones.map((z, i) => {
                const zt = ZONE_TYPES.find(t => t.id === z.type);
                return (
                  <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderBottom: `1px solid ${T.border}14`, borderLeft: `3px solid ${zt?.dot || T.dim}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: T.text, fontSize: 9, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{z.label || zt?.label}</div>
                      <div style={{ color: T.dim, fontSize: 7, marginTop: 1 }}>({z.x1},{z.y1})→({z.x2},{z.y2})</div>
                    </div>
                    <Btn v="danger" onClick={async () => { await saveZones(zones.filter((_, j) => j !== i)); msg('Strefa usunięta!'); }} style={{ padding: '2px 5px', fontSize: 8 }}>✕</Btn>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── GLOBAL SEARCH TAB ─────────────────────────────────────────────────────────
function SearchTab({ maps, onNavigate }) {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async () => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return;
    setLoading(true); setSearched(false);
    try {
      const [mobsAll, npcsAll] = await Promise.all([
        Promise.all(maps.map(m => api.world.mobs(m.id).then(r => Array.isArray(r) ? r.map(e => ({ ...e, _mapId: m.id, _mapName: m.nazwa, _type: 'mob' })) : []))),
        Promise.all(maps.map(m => api.world.npcs(m.id).then(r =>  Array.isArray(r) ? r.map(e => ({ ...e, _mapId: m.id, _mapName: m.nazwa, _type: 'npc' })) : []))),
      ]);
      const flat = [...mobsAll.flat(), ...npcsAll.flat()].filter(e => e.nazwa.toLowerCase().includes(q));
      const grouped = {};
      flat.forEach(e => { const k = e._mapId; if (!grouped[k]) grouped[k] = { mapId: e._mapId, mapName: e._mapName, items: [] }; grouped[k].items.push(e); });
      setResults(Object.values(grouped).sort((a, b) => a.mapId - b.mapId));
    } catch { setResults([]); }
    setLoading(false); setSearched(true);
  };

  const total = results.reduce((s, g) => s + g.items.length, 0);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Inp value={query} onChange={e => setQuery(e.target.value)} placeholder="Szukaj po nazwie (min. 2 znaki)..."
          onKeyDown={e => e.key === 'Enter' && doSearch()} style={{ fontSize: 12 }} />
        <Btn onClick={doSearch} disabled={query.trim().length < 2 || loading} style={{ flexShrink: 0 }}>
          {loading ? '⏳' : '🔍'} Szukaj
        </Btn>
      </div>

      {loading && <div style={{ color: T.muted, textAlign: 'center', fontSize: 10, padding: 20 }}>Przeszukuję {maps.length} map...</div>}

      {!loading && searched && results.length === 0 && (
        <div style={{ color: T.dim, textAlign: 'center', fontSize: 10, padding: 20 }}>Brak wyników dla „{query}"</div>
      )}

      {!loading && searched && results.length > 0 && (
        <div style={{ color: T.muted, fontSize: 9 }}>Znaleziono <span style={{ color: T.blue }}>{total}</span> wyników na <span style={{ color: T.blue }}>{results.length}</span> mapach</div>
      )}

      {results.map(group => (
        <Card key={group.mapId}>
          <CardHead icon="🗺" title={`#${group.mapId} ${group.mapName} · ${group.items.length} wyniki`} color={T.blue} />
          <div>
            {group.items.map(e => (
              <div key={`${e._type}-${e.id}`} onClick={() => onNavigate(group.mapId, e._type === 'mob' ? 'mobs' : 'npcs')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderBottom: `1px solid ${T.border}14`, cursor: 'pointer', transition: 'background .1s' }}
                onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(29,78,216,0.08)'}
                onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: 12 }}>{e._type === 'mob' ? '👾' : '🧑'}</span>
                <span style={{ color: T.text, fontSize: 10, flex: 1 }}>{e.nazwa}</span>
                <span style={{ color: T.dim, fontSize: 8 }}>({e.x},{e.y})</span>
                {e._type === 'mob' && <span style={{ color: T.amber, fontSize: 8, marginLeft: 4 }}>poz.{e.poziom}</span>}
                <span style={{ color: T.blue, fontSize: 9, marginLeft: 6 }}>→</span>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {!searched && !loading && (
        <Empty icon="🔍" text="Wpisz nazwę i naciśnij Szukaj lub Enter" />
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'map',     icon: '🗺',  label: 'Edytor mapy'  },
  { id: 'mobs',    icon: '👾',  label: 'Wrogowie'     },
  { id: 'npcs',    icon: '🧑',  label: 'NPC'          },
  { id: 'portals', icon: '🔮',  label: 'Portale'      },
  { id: 'items',   icon: '🎒',  label: 'Przedmioty'   },
  { id: 'loot',    icon: '📦',  label: 'Loot paczki'  },
  { id: 'search',  icon: '🔍',  label: 'Szukaj'       },
];

export default function WorldEditor({ currentMapId }) {
  const [maps,          setMaps]          = useState([]);
  const [mapId,         setMapId]         = useState(currentMapId || null);
  const [tab,           setTab]           = useState('mobs');
  const [pickMode,      setPickMode]      = useState(null);
  const [pickedPos,     setPickedPos]     = useState(null);
  const [importData,    setImportData]    = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importMode,    setImportMode]    = useState('add');
  const [importing,     setImporting]     = useState(false);
  const [importMsg,     setImportMsg]     = useState(null);
  const importRef = useRef(null);

  useEffect(() => { api.world.maps().then(r => Array.isArray(r) && setMaps(r)); }, []);
  useEffect(() => { if (currentMapId && !mapId) setMapId(currentMapId); }, [currentMapId, mapId]);

  const needsMap = tab !== 'items' && tab !== 'loot' && tab !== 'search';

  const handleRequestPick = fromTab => { setPickedPos(null); setPickMode(fromTab); setTab('map'); };
  const handlePick        = pos => { if (pos) setPickedPos(pos); setTab(pickMode); setPickMode(null); };
  const handleNavigate    = (mId, tabId) => { setMapId(mId); setTab(tabId); };

  const exportMap = async () => {
    if (!mapId) return;
    const mapInfo = maps.find(m => m.id === mapId);
    const [mobs, npcs, portals, blockers] = await Promise.all([
      api.world.mobs(mapId), api.world.npcs(mapId),
      api.world.portals(mapId), api.world.blockers(mapId),
    ]);
    const data = {
      version: 1, exportDate: new Date().toISOString(), sourceMap: mapInfo,
      mobs:    Array.isArray(mobs)    ? mobs    : [],
      npcs:    Array.isArray(npcs)    ? npcs    : [],
      portals: Array.isArray(portals) ? portals : [],
      blockers: Array.isArray(blockers) ? blockers : [],
    };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = `mapa_${mapId}_${(mapInfo?.nazwa || 'export').replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
  };

  const handleImportFile = e => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        setImportData(d);
        setImportPreview({ mobs: (d.mobs||[]).length, npcs: (d.npcs||[]).length, portals: (d.portals||[]).length, blockers: (d.blockers||[]).length, sourceName: d.sourceMap?.nazwa });
        setImportMsg(null);
      } catch { setImportMsg({ ok: false, text: 'Nieprawidłowy plik JSON' }); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const doImport = async () => {
    if (!importData || !mapId) return;
    setImporting(true);
    try {
      if (importMode === 'replace') {
        const [em, en, ep, eb] = await Promise.all([api.world.mobs(mapId), api.world.npcs(mapId), api.world.portals(mapId), api.world.blockers(mapId)]);
        await Promise.all([
          ...(Array.isArray(em) ? em.map(x => api.world.deleteMob(x.id)) : []),
          ...(Array.isArray(en) ? en.map(x => api.world.deleteNpc(x.id)) : []),
          ...(Array.isArray(ep) ? ep.map(x => api.world.deletePortal(x.id)) : []),
          ...(Array.isArray(eb) ? eb.map(x => api.world.removeBlocker({ mapa: mapId, x: x.x, y: x.y })) : []),
        ]);
      }
      const { mobs = [], npcs = [], portals = [], blockers = [] } = importData;
      await Promise.all([
        ...mobs.map(m    => api.world.createMob(    { ...m, id: undefined, mapa: mapId })),
        ...npcs.map(n    => api.world.createNpc(    { ...n, id: undefined, mapa: mapId })),
        ...portals.map(p => api.world.createPortal( { ...p, id: undefined, mapa: mapId })),
        ...blockers.map(b => api.world.addBlocker(  { mapa: mapId, x: b.x, y: b.y })),
      ]);
      setImportMsg({ ok: true, text: `✓ Zaimportowano ${mobs.length} mobów, ${npcs.length} NPC, ${portals.length} portali, ${blockers.length} blokerów` });
      setImportPreview(null); setImportData(null);
    } catch { setImportMsg({ ok: false, text: 'Błąd podczas importu' }); }
    setImporting(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', fontFamily: FF, background: T.bg }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: T.raised, flexShrink: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: 'none', flexShrink: 0, cursor: 'pointer', fontSize: 10, color: tab === t.id ? T.blue : T.muted, fontWeight: tab === t.id ? 'bold' : 'normal', borderBottom: `2px solid ${tab === t.id ? T.blueDim : 'transparent'}`, background: tab === t.id ? 'rgba(29,78,216,0.08)' : 'transparent', fontFamily: FF, transition: 'all .12s' }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Map selector */}
      {needsMap && <MapSelect maps={maps} mapId={mapId} onSelect={setMapId} />}

      {/* Export / Import toolbar */}
      {needsMap && mapId && (
        <div style={{ padding: '5px 12px', borderBottom: `1px solid ${T.border}`, background: T.raised, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: T.dim, fontSize: 8, letterSpacing: '1px', textTransform: 'uppercase' }}>Narzędzia mapy:</span>
            <Btn v="ghost" onClick={exportMap} style={{ fontSize: 9, padding: '3px 10px' }}>⬇ Eksportuj JSON</Btn>
            <div onClick={() => importRef.current?.click()}
              style={{ padding: '3px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 10, fontWeight: 'bold', border: `1px solid ${T.border}`, background: 'rgba(6,12,20,0.5)', color: T.muted, display: 'inline-flex', alignItems: 'center', fontFamily: FF, transition: 'all .12s' }}>
              ⬆ Importuj JSON
            </div>
            <input ref={importRef} type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
            {importMsg && <span style={{ fontSize: 9, color: importMsg.ok ? T.green : T.red }}>{importMsg.text}</span>}
          </div>
          {importPreview && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', paddingTop: 4, borderTop: `1px solid ${T.border}` }}>
              <span style={{ color: T.text, fontSize: 9 }}>
                {importPreview.sourceName && <span style={{ color: T.muted }}>„{importPreview.sourceName}" → </span>}
                <span style={{ color: T.amber }}>{importPreview.mobs} mobów</span> · {importPreview.npcs} NPC · {importPreview.portals} portali · {importPreview.blockers} blokerów
              </span>
              {[['add', '➕ Dodaj'], ['replace', '🔄 Zastąp wszystko']].map(([m, l]) => (
                <button key={m} onClick={() => setImportMode(m)} style={{ padding: '3px 8px', fontSize: 9, borderRadius: 4, cursor: 'pointer', fontFamily: FF, background: importMode === m ? 'rgba(29,78,216,0.2)' : 'rgba(6,12,20,0.5)', border: `1px solid ${importMode === m ? T.borderH : T.border}`, color: importMode === m ? T.blue : T.muted }}>
                  {l}
                </button>
              ))}
              <Btn v="ok" onClick={doImport} disabled={importing} style={{ fontSize: 9, padding: '4px 12px' }}>
                {importing ? '⏳ Importuję...' : `✓ Importuj do mapy #${mapId}`}
              </Btn>
              <Btn v="ghost" onClick={() => { setImportPreview(null); setImportData(null); setImportMsg(null); }} style={{ fontSize: 9, padding: '3px 8px' }}>✕</Btn>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'map'     && <MapTileEditor mapId={mapId} maps={maps} pickMode={pickMode} onPick={handlePick} />}
        {tab === 'mobs'    && <MobEditor    mapId={mapId} onRequestPick={() => handleRequestPick('mobs')} pendingPos={pickMode === null ? pickedPos : null} onPosConsumed={() => setPickedPos(null)} />}
        {tab === 'npcs'    && <NpcEditor    mapId={mapId} onRequestPick={() => handleRequestPick('npcs')} pendingPos={pickMode === null ? pickedPos : null} onPosConsumed={() => setPickedPos(null)} />}
        {tab === 'portals' && <PortalsEditor mapId={mapId} maps={maps} />}
        {tab === 'items'   && <ItemLootEditor />}
        {tab === 'loot'    && <LootPackEditor />}
        {tab === 'search'  && <SearchTab maps={maps} onNavigate={handleNavigate} />}
      </div>
    </div>
  );
}
