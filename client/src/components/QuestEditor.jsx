import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

// ── Design tokens (same as WorldEditor) ──────────────────────────────────────
const T = {
  bg: 'rgba(4,8,16,0.98)', surface: 'rgba(6,12,20,0.97)', card: 'rgba(8,16,28,0.95)', raised: 'rgba(10,20,35,0.98)',
  border: 'rgba(59,130,246,0.16)', borderH: 'rgba(59,130,246,0.5)',
  text: '#CBD5E1', muted: '#4A7B9D', dim: '#1E3A5F',
  blue: '#60A5FA', blueDim: '#3B82F6', green: '#4ADE80', red: '#F87171', amber: '#FBBF24', purple: '#A78BFA', cyan: '#22D3EE',
};
const FF = 'Verdana,sans-serif';

// ── Quest metadata ────────────────────────────────────────────────────────────
const QUEST_TYPES = { kill: '⚔ Zabij X mobów', location: '🗺 Odwiedź lokację', item: '🎒 Zbierz przedmioty', level: '⭐ Osiągnij poziom', chain: '🔗 Quest chain' };
const RESET_TYPES = { brak: '⭕ Jednorazowy', dziennie: '🔄 Dzienny', tygodniowo: '📅 Tygodniowy' };
const ENDINGS     = ['neutralne', 'dobre', 'zle'];
const TRIGGERS    = ['', 'location', 'invasion', 'eclipse', 'season'];
const FACTIONS    = { 0: 'Brak', 1: 'Zakon Astralny', 2: 'Gildia Łupieżców', 3: 'Straż Miejska', 4: 'Natura Pierwotna' };

const BLANK = {
  nazwa: '', opis: '', typ: 'kill', cel_id: 0, cel_wartosc: '', cel_ilosc: 1,
  nagroda_exp: 0, nagroda_zloto: 0, nagroda_item_id: 0, wymagany_poziom: 1,
  wymagany_quest_id: 0, npc_start_id: 0, npc_end_id: 0,
  tekst_start: '', tekst_w_trakcie: '', tekst_koniec: '', aktywny: 1,
  lancuch_id: 0, kolejnosc: 0, czas_limit: 0, ukryty: 0, ukryty_warunek: '{}',
  reset_typ: 'brak', wymaga_party: 0, nagrody_wybor: '', typ_ranking: 0,
  skalowanie: 0, frakcja_id: 0, wyklucza_frakcje: 0, wyzwalacz: '', wskazowki: '', zakonczenie: 'neutralne',
};

// ── Micro-components ──────────────────────────────────────────────────────────
function Toast({ msg, ok }) {
  if (!msg) return null;
  const c = ok ? T.green : T.red;
  return (
    <div style={{ padding: '7px 12px', borderRadius: 7, fontSize: 10, background: ok ? 'rgba(6,40,16,0.85)' : 'rgba(50,4,4,0.85)', border: `1px solid ${c}44`, color: c, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <span>{ok ? '✓' : '✕'}</span> {msg}
    </div>
  );
}

function Inp({ value, onChange, type = 'text', placeholder, rows, style = {} }) {
  const [foc, setFoc] = useState(false);
  const base = { padding: '7px 10px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${foc ? T.borderH : T.border}`, borderRadius: 5, fontSize: 10, outline: 'none', fontFamily: FF, width: '100%', boxSizing: 'border-box', transition: 'border-color .12s', ...style };
  if (rows) return <textarea value={value ?? ''} onChange={onChange} placeholder={placeholder} rows={rows} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} style={{ ...base, resize: 'vertical' }} />;
  return <input type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} style={base} />;
}

function Lbl({ children, color }) {
  return <div style={{ fontSize: 8, color: color || T.dim, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 4, fontFamily: FF }}>{children}</div>;
}

function Fld({ label, value, onChange, type = 'text', small, rows, placeholder }) {
  const handleChange = e => onChange(type === 'number' ? Number(e.target.value) : e.target.value);
  return (
    <div>
      {label && <Lbl>{label}</Lbl>}
      <Inp value={value} onChange={handleChange} type={type} placeholder={placeholder} rows={rows} style={small ? { width: 80 } : {}} />
    </div>
  );
}

function Sel({ label, value, onChange, options }) {
  const [foc, setFoc] = useState(false);
  return (
    <div>
      {label && <Lbl>{label}</Lbl>}
      <select value={value ?? ''} onChange={e => onChange(e.target.value)} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
        style={{ width: '100%', padding: '7px 9px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${foc ? T.borderH : T.border}`, borderRadius: 5, fontSize: 10, outline: 'none', fontFamily: FF }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange, sublabel }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      <div onClick={() => onChange(!checked)} style={{ width: 36, height: 20, borderRadius: 10, background: checked ? 'rgba(59,130,246,0.5)' : 'rgba(6,12,20,0.7)', border: `1px solid ${checked ? T.borderH : T.border}`, position: 'relative', flexShrink: 0, transition: 'all .2s' }}>
        <div style={{ position: 'absolute', top: 2, left: checked ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: checked ? T.blue : T.muted, transition: 'left .2s' }} />
      </div>
      <div>
        <div style={{ fontSize: 10, color: checked ? T.text : T.muted }}>{label}</div>
        {sublabel && <div style={{ fontSize: 8, color: T.dim }}>{sublabel}</div>}
      </div>
    </label>
  );
}

function Btn({ children, onClick, v = 'default', disabled, style = {}, wide }) {
  const variants = { default: [T.blue, 'rgba(29,78,216,0.2)', T.borderH], ok: [T.green, 'rgba(6,40,20,0.75)', 'rgba(34,197,94,0.4)'], danger: [T.red, 'rgba(50,4,4,0.75)', 'rgba(220,38,38,0.4)'], ghost: [T.muted, 'rgba(6,12,20,0.5)', T.border] };
  const [col, bg, bd] = variants[v] || variants.default;
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: '5px 12px', borderRadius: 5, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 10, fontWeight: 'bold', border: `1px solid ${bd}`, background: disabled ? 'rgba(6,12,20,0.3)' : bg, color: disabled ? T.dim : col, opacity: disabled ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', fontFamily: FF, width: wide ? '100%' : undefined, justifyContent: wide ? 'center' : undefined, transition: 'all .12s', ...style }}>{children}</button>
  );
}

function Section({ icon, title, color, children }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${color ? color + '22' : T.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', background: T.raised, borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ fontSize: 8, fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', color: color || T.blue, fontFamily: FF }}>{title}</span>
      </div>
      <div style={{ padding: '12px 14px' }}>{children}</div>
    </div>
  );
}

// ── Choice reward editor ──────────────────────────────────────────────────────
function ChoiceEditor({ value, onChange }) {
  let choices = [];
  try { choices = JSON.parse(value || '[]'); } catch (_) { choices = []; }
  const update = arr => onChange(JSON.stringify(arr));
  const add    = () => update([...choices, { exp: 0, gold: 0, item: '' }]);
  const remove = i => { const a = [...choices]; a.splice(i, 1); update(a); };
  const set    = (i, k, v) => { const a = [...choices]; a[i] = { ...a[i], [k]: v }; update(a); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Lbl color={T.muted}>Opcje nagrody do wyboru (zostaw puste = brak wyboru)</Lbl>
        <Btn onClick={add} style={{ padding: '3px 8px', fontSize: 9 }}>+ Opcja</Btn>
      </div>
      {choices.map((c, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 5, padding: '6px 9px', background: 'rgba(4,8,16,0.5)', borderRadius: 5, border: `1px solid ${T.border}` }}>
          <span style={{ color: T.muted, fontSize: 9, flexShrink: 0, minWidth: 55 }}>Opcja {i + 1}</span>
          <input type="number" placeholder="EXP" value={c.exp || 0} onChange={e => set(i, 'exp', Number(e.target.value))} style={{ width: 65, padding: '5px 7px', background: 'rgba(4,8,16,0.85)', color: T.cyan, border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 9, outline: 'none', fontFamily: FF }} />
          <input type="number" placeholder="Złoto" value={c.gold || 0} onChange={e => set(i, 'gold', Number(e.target.value))} style={{ width: 65, padding: '5px 7px', background: 'rgba(4,8,16,0.85)', color: '#FCD34D', border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 9, outline: 'none', fontFamily: FF }} />
          <input placeholder="Przedmiot (nazwa)" value={c.item || ''} onChange={e => set(i, 'item', e.target.value)} style={{ flex: 1, padding: '5px 7px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 9, outline: 'none', fontFamily: FF }} />
          <Btn v="danger" onClick={() => remove(i)} style={{ padding: '3px 6px', fontSize: 9 }}>✕</Btn>
        </div>
      ))}
    </div>
  );
}

// ── Hints editor ──────────────────────────────────────────────────────────────
function HintsEditor({ value, onChange }) {
  let hints = [];
  try { hints = JSON.parse(value || '[]'); } catch (_) { hints = []; }
  const update = arr => onChange(JSON.stringify(arr));
  const add    = () => update([...hints, '']);
  const remove = i => { const a = [...hints]; a.splice(i, 1); update(a); };
  const set    = (i, v) => { const a = [...hints]; a[i] = v; update(a); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Lbl>Wskazówki w dzienniku</Lbl>
        <Btn onClick={add} style={{ padding: '3px 8px', fontSize: 9 }}>+ Wskazówka</Btn>
      </div>
      {hints.map((h, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5, alignItems: 'center' }}>
          <span style={{ color: T.dim, fontSize: 9, flexShrink: 0 }}>{i + 1}.</span>
          <Inp value={h} onChange={e => set(i, e.target.value)} placeholder={`Wskazówka ${i + 1}...`} style={{ flex: 1 }} />
          <Btn v="danger" onClick={() => remove(i)} style={{ padding: '3px 6px', fontSize: 9 }}>✕</Btn>
        </div>
      ))}
      {hints.length === 0 && <div style={{ color: T.dim, fontSize: 9, fontStyle: 'italic' }}>Brak wskazówek</div>}
    </div>
  );
}

// ── Quest type badge ──────────────────────────────────────────────────────────
function TypeBadge({ q }) {
  const icon = q.ukryty ? '🔍' : q.typ_ranking ? '🏆' : q.reset_typ !== 'brak' ? '🔄' : q.lancuch_id > 0 ? '🔗' : '📜';
  const COLOR = { kill: T.red, location: T.cyan, item: T.amber, level: T.purple, chain: T.green };
  return <span style={{ fontSize: 11, filter: q.aktywny ? 'none' : 'grayscale(1) opacity(0.5)' }}>{icon}</span>;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function QuestEditor() {
  const [quests,  setQuests]  = useState([]);
  const [chains,  setChains]  = useState([]);
  const [sel,     setSel]     = useState(null);
  const [form,    setForm]    = useState({});
  const [adding,  setAdding]  = useState(false);
  const [toast,   setToast]   = useState(null);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all'); // all | active | inactive | daily

  const load = useCallback(() => {
    api.quests.adminList().then(r => Array.isArray(r) && setQuests(r));
    api.quests.chains().then(r => Array.isArray(r) && setChains(r));
  }, []);
  useEffect(() => { load(); }, [load]);

  const msg = (m, ok = true) => { setToast({ m, ok }); setTimeout(() => setToast(null), 3000); };
  const f   = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const select   = q => { setSel(q); setForm({ ...BLANK, ...q }); setAdding(false); };
  const startAdd = () => { setSel(null); setForm({ ...BLANK }); setAdding(true); };

  const save = async () => {
    const r = adding ? await api.quests.adminCreate(form) : await api.quests.adminUpdate(sel.id, form);
    r.ok ? (msg(adding ? 'Quest dodany!' : 'Zapisano!'), load(), setSel(null), setAdding(false)) : msg(r.error || 'Błąd', false);
  };
  const del = async () => {
    if (!window.confirm(`Usunąć quest "${sel.nazwa}"?`)) return;
    const r = await api.quests.adminDelete(sel.id);
    r.ok && (msg('Usunięto!'), load(), setSel(null));
  };
  const clone = () => { setForm({ ...form, id: undefined, nazwa: form.nazwa + ' (kopia)' }); setAdding(true); setSel(null); };

  const shown = quests.filter(q => {
    if (search && !q.nazwa.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'active'   && !q.aktywny) return false;
    if (filter === 'inactive' && q.aktywny)  return false;
    if (filter === 'daily'    && q.reset_typ === 'brak') return false;
    return true;
  });

  const FILTERS = [['all', 'Wszystkie', quests.length], ['active', 'Aktywne', quests.filter(q => q.aktywny).length], ['inactive', 'Nieaktywne', quests.filter(q => !q.aktywny).length], ['daily', 'Cykliczne', quests.filter(q => q.reset_typ !== 'brak').length]];

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', fontFamily: FF, background: T.bg }}>

      {/* ── SIDEBAR ── */}
      <div style={{ width: 260, flexShrink: 0, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', background: T.surface }}>
        {/* Toolbar */}
        <div style={{ padding: '8px 10px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: T.raised, display: 'flex', gap: 5 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: T.dim, fontSize: 11 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj questów..."
              style={{ width: '100%', padding: '6px 8px 6px 24px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 9, outline: 'none', fontFamily: FF, boxSizing: 'border-box' }} />
          </div>
          <Btn onClick={startAdd} style={{ padding: '4px 9px', fontSize: 9 }}>+ Nowy</Btn>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 3, padding: '5px 8px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, flexWrap: 'wrap' }}>
          {FILTERS.map(([k, l, cnt]) => (
            <button key={k} onClick={() => setFilter(k)} style={{ padding: '3px 9px', borderRadius: 9999, cursor: 'pointer', fontSize: 8, fontFamily: FF, background: filter === k ? 'rgba(59,130,246,0.2)' : 'rgba(4,8,16,0.5)', border: `1px solid ${filter === k ? T.borderH : T.border}`, color: filter === k ? T.blue : T.muted }}>
              {l} <span style={{ opacity: 0.6 }}>({cnt})</span>
            </button>
          ))}
        </div>

        {/* Quest list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {shown.map(q => (
            <div key={q.id} onClick={() => select(q)}
              style={{ padding: '7px 12px', cursor: 'pointer', borderBottom: `1px solid ${T.border}14`, borderLeft: `3px solid ${sel?.id === q.id ? T.blueDim : 'transparent'}`, background: sel?.id === q.id ? 'rgba(29,78,216,0.1)' : 'transparent', transition: 'background .1s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TypeBadge q={q} />
                <span style={{ color: q.aktywny ? T.text : T.dim, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{q.nazwa}</span>
                {q.lancuch_id > 0 && <span style={{ color: T.green, fontSize: 7, flexShrink: 0 }}>#{q.lancuch_id}</span>}
              </div>
              <div style={{ color: T.dim, fontSize: 8, marginTop: 2, paddingLeft: 17 }}>
                {QUEST_TYPES[q.typ]?.split(' ').slice(1).join(' ') || q.typ} · poz.{q.wymagany_poziom}
                {q.reset_typ && q.reset_typ !== 'brak' && <span style={{ color: T.blue, marginLeft: 5 }}>🔄</span>}
              </div>
            </div>
          ))}
          {shown.length === 0 && (
            <div style={{ color: T.dim, textAlign: 'center', padding: '24px 16px', fontSize: 10 }}>
              {search ? `Brak wyników dla "${search}"` : 'Brak questów w tej kategorii'}
            </div>
          )}
        </div>

        {/* Stats footer */}
        <div style={{ padding: '6px 10px', borderTop: `1px solid ${T.border}`, flexShrink: 0, background: T.raised, display: 'flex', gap: 12 }}>
          {[['📜', quests.length, 'total'], ['✓', quests.filter(q => q.aktywny).length, T.green], ['🔗', chains.length, T.cyan]].map(([icon, v, c]) => (
            <span key={icon} style={{ fontSize: 9, color: T.dim }}>{icon} <span style={{ color: c || T.muted, fontWeight: 'bold' }}>{v}</span></span>
          ))}
        </div>
      </div>

      {/* ── FORM PANEL ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {toast && <Toast msg={toast.m} ok={toast.ok} />}

        {!(sel || adding) ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: T.dim, gap: 12 }}>
            <span style={{ fontSize: 40, opacity: 0.15 }}>📜</span>
            <span style={{ fontSize: 11 }}>Wybierz quest z listy lub utwórz nowy</span>
            <Btn onClick={startAdd}>+ Nowy quest</Btn>
          </div>
        ) : (
          <>
            {/* Page title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 22 }}>{adding ? '📜' : (form.ukryty ? '🔍' : form.typ_ranking ? '🏆' : form.reset_typ !== 'brak' ? '🔄' : '📜')}</span>
              <div>
                <div style={{ color: T.blue, fontWeight: 'bold', fontSize: 14 }}>{adding ? 'Nowy quest' : form.nazwa}</div>
                {!adding && <div style={{ color: T.dim, fontSize: 9, marginTop: 2 }}>ID: {sel.id}</div>}
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <Btn v="ok" onClick={save}>✓ {adding ? 'Utwórz' : 'Zapisz'}</Btn>
                {!adding && <Btn v="ghost" onClick={clone}>⎘ Klonuj</Btn>}
                {!adding && <Btn v="danger" onClick={del}>🗑 Usuń</Btn>}
                <Btn v="ghost" onClick={() => { setSel(null); setAdding(false); }}>✕</Btn>
              </div>
            </div>

            {/* ── BASIC INFO ── */}
            <Section icon="📋" title="Podstawowe informacje" color={T.blue}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ gridColumn: '1/-1' }}><Fld label="Nazwa questa" value={form.nazwa} onChange={v => f('nazwa', v)} placeholder="Np. Poszukiwacz Szczurów" /></div>
                <div style={{ gridColumn: '1/-1' }}><Fld label="Opis (widoczny dla gracza)" value={form.opis} onChange={v => f('opis', v)} rows={3} placeholder="Opis zadania..." /></div>
                <Sel label="Typ questa" value={form.typ} onChange={v => f('typ', v)} options={Object.entries(QUEST_TYPES).map(([k, l]) => [k, l])} />
                <Sel label="Reset" value={form.reset_typ} onChange={v => f('reset_typ', v)} options={Object.entries(RESET_TYPES).map(([k, l]) => [k, l])} />
                <Fld label="Min. poziom gracza" value={form.wymagany_poziom} onChange={v => f('wymagany_poziom', v)} type="number" small />
                <Sel label="Zakończenie" value={form.zakonczenie} onChange={v => f('zakonczenie', v)} options={ENDINGS.map(e => [e, e])} />
              </div>
            </Section>

            {/* ── GOAL ── */}
            <Section icon="🎯" title="Cel questa" color={T.amber}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Fld label={form.typ === 'kill' ? 'ID moba (0 = dowolny)' : form.typ === 'location' ? 'ID mapy' : form.typ === 'item' ? 'ID przedmiotu' : 'Wartość celu'} value={form.cel_id} onChange={v => f('cel_id', v)} type="number" />
                <Fld label="Wymagana ilość / poziom" value={form.cel_ilosc} onChange={v => f('cel_ilosc', v)} type="number" />
                {form.typ === 'location' && <div style={{ gridColumn: '1/-1' }}><Fld label="Koordynaty (X,Y np. 35,37)" value={form.cel_wartosc} onChange={v => f('cel_wartosc', v)} placeholder="35,37" /></div>}
                <Fld label="Limit czasu (min, 0 = brak)" value={form.czas_limit} onChange={v => f('czas_limit', v)} type="number" />
                <Fld label="Min. członków drużyny (0 = solo)" value={form.wymaga_party} onChange={v => f('wymaga_party', v)} type="number" />
              </div>
            </Section>

            {/* ── REWARDS ── */}
            <Section icon="🎁" title="Nagrody" color={T.green}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                <Fld label="EXP" value={form.nagroda_exp} onChange={v => f('nagroda_exp', v)} type="number" />
                <Fld label="Złoto" value={form.nagroda_zloto} onChange={v => f('nagroda_zloto', v)} type="number" />
                <Fld label="ID przedmiotu nagrody" value={form.nagroda_item_id} onChange={v => f('nagroda_item_id', v)} type="number" />
              </div>
              <ChoiceEditor value={form.nagrody_wybor || ''} onChange={v => f('nagrody_wybor', v)} />
            </Section>

            {/* ── CHAIN & NPC ── */}
            <Section icon="🔗" title="Łańcuch questów i NPC" color={T.cyan}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <Lbl>Łańcuch questów</Lbl>
                  <select value={form.lancuch_id || 0} onChange={e => f('lancuch_id', Number(e.target.value))}
                    style={{ width: '100%', padding: '7px 9px', background: 'rgba(4,8,16,0.85)', color: T.text, border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 10, outline: 'none', fontFamily: FF }}>
                    <option value={0}>Brak łańcucha</option>
                    {chains.map(c => <option key={c.id} value={c.id}>#{c.id} {c.nazwa}</option>)}
                  </select>
                </div>
                <Fld label="Kolejność w łańcuchu" value={form.kolejnosc} onChange={v => f('kolejnosc', v)} type="number" />
                <Fld label="Wymagany quest ID (warunek)" value={form.wymagany_quest_id} onChange={v => f('wymagany_quest_id', v)} type="number" />
                <div />
                <Fld label="NPC start (ID)" value={form.npc_start_id} onChange={v => f('npc_start_id', v)} type="number" />
                <Fld label="NPC oddanie (0 = start NPC)" value={form.npc_end_id} onChange={v => f('npc_end_id', v)} type="number" />
              </div>
            </Section>

            {/* ── DIALOGS ── */}
            <Section icon="💬" title="Dialogi NPC">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Fld label="Tekst przy przyjęciu questa" value={form.tekst_start} onChange={v => f('tekst_start', v)} rows={2} placeholder="Co NPC mówi gdy gracz akceptuje quest..." />
                <Fld label="Tekst w trakcie (quest nieukończony)" value={form.tekst_w_trakcie} onChange={v => f('tekst_w_trakcie', v)} rows={2} placeholder="Co NPC mówi zanim quest jest gotowy..." />
                <Fld label="Tekst przy oddaniu questa" value={form.tekst_koniec} onChange={v => f('tekst_koniec', v)} rows={2} placeholder="Co NPC mówi przy odbiorze nagród..." />
              </div>
            </Section>

            {/* ── FACTIONS ── */}
            <Section icon="⚜" title="Frakcje" color={T.purple}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Sel label="Wymagana frakcja gracza" value={form.frakcja_id} onChange={v => f('frakcja_id', Number(v))} options={Object.entries(FACTIONS).map(([k, l]) => [k, l])} />
                <Sel label="Wyklucza frakcję" value={form.wyklucza_frakcje} onChange={v => f('wyklucza_frakcje', Number(v))} options={Object.entries(FACTIONS).map(([k, l]) => [k, l])} />
              </div>
            </Section>

            {/* ── HIDDEN QUEST ── */}
            <Section icon="🔍" title="Quest ukryty" color={T.red}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Toggle label="Quest ukryty" sublabel="Pojawi się automatycznie po spełnieniu warunku" checked={!!form.ukryty} onChange={v => f('ukryty', v ? 1 : 0)} />
                {!!form.ukryty && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 6, borderTop: `1px solid ${T.border}` }}>
                    <Sel label="Wyzwalacz środowiskowy" value={form.wyzwalacz || ''} onChange={v => f('wyzwalacz', v)} options={TRIGGERS.map(t => [t, t || 'Brak'])} />
                    <div style={{ gridColumn: '1/-1' }}>
                      <Fld label='Warunek JSON (np. {"mapa":16,"x":60,"y":90})' value={form.ukryty_warunek} onChange={v => f('ukryty_warunek', v)} placeholder='{"mapa":16}' />
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* ── HINTS ── */}
            <Section icon="💡" title="Wskazówki">
              <HintsEditor value={form.wskazowki || ''} onChange={v => f('wskazowki', v)} />
            </Section>

            {/* ── FLAGS ── */}
            <Section icon="🚩" title="Flagi i opcje">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Toggle label="Quest aktywny" sublabel="Widoczny i dostępny dla graczy" checked={!!form.aktywny} onChange={v => f('aktywny', v ? 1 : 0)} />
                <Toggle label="Quest rankingowy" sublabel="Zapisuje kto ukończył jako pierwszy" checked={!!form.typ_ranking} onChange={v => f('typ_ranking', v ? 1 : 0)} />
                <Toggle label="Skalowanie z poziomem" sublabel="Nagrody rosną razem z poziomem gracza" checked={!!form.skalowanie} onChange={v => f('skalowanie', v ? 1 : 0)} />
              </div>
            </Section>

            {/* Bottom action bar */}
            <div style={{ display: 'flex', gap: 8, padding: '10px 0', borderTop: `1px solid ${T.border}`, flexWrap: 'wrap' }}>
              <Btn v="ok" onClick={save} style={{ padding: '8px 20px', fontSize: 11 }}>✓ {adding ? 'Utwórz quest' : 'Zapisz zmiany'}</Btn>
              {!adding && <Btn v="ghost" onClick={clone}>⎘ Klonuj quest</Btn>}
              {!adding && <Btn v="danger" onClick={del}>🗑 Usuń quest</Btn>}
              <Btn v="ghost" onClick={() => { setSel(null); setAdding(false); }} style={{ marginLeft: 'auto' }}>✕ Anuluj</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
