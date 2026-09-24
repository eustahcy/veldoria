import { useState, useEffect, useCallback } from 'react';
import {
  IconSword, IconMap, IconBag, IconStar, IconLink, IconRefresh, IconCalendar,
  IconGift, IconScroll, IconCheck, IconAward, IconTrophy, IconSkull,
  IconX, IconZap, IconClock, IconTrendingUp, IconChevronRight,
} from '../Icons';
import { api } from '../api';

// ── Constants ─────────────────────────────────────────────────────────────────
const TYPE_META = {
  kill:     { icon: <IconSword size={12} />, color: '#F87171', label: 'Zabij' },
  location: { icon: <IconMap size={12} />, color: '#e7c158', label: 'Odwiedź' },
  item:     { icon: <IconBag size={12} />, color: '#FCD34D', label: 'Zbierz' },
  level:    { icon: <IconStar size={12} />, color: '#A5B4FC', label: 'Poziom' },
  chain:    { icon: <IconLink size={12} />, color: '#4ADE80', label: 'Łańcuch' },
};

const REP_COLORS = {
  Wrogi: '#F87171', Neutralny: '#9CA3AF', Przyjazny: '#FCD34D',
  Szanowany: '#60A5FA', Czczony: '#A78BFA', Wybrany: '#F0ABFC',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function Bar({ pct, color = '#e7c158', h = 6 }) {
  return (
    <div style={{ height: h, background: 'rgba(0,0,0,0.5)', borderRadius: h, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, pct * 100)}%`, height: '100%', background: pct >= 1 ? '#4ADE80' : color, borderRadius: h, transition: 'width 0.3s', boxShadow: pct >= 1 ? '0 0 6px rgba(74,222,128,0.5)' : 'none' }} />
    </div>
  );
}

function pill(color, text) {
  return (
    <span style={{ padding: '1px 7px', borderRadius: 9999, background: `${color}18`, border: `1px solid ${color}44`, color, fontSize: 7, fontWeight: 'bold', whiteSpace: 'nowrap' }}>{text}</span>
  );
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Quest card ────────────────────────────────────────────────────────────────
function QuestCard({ q, onTurnIn }) {
  const meta = TYPE_META[q.typ] || TYPE_META.kill;
  const pct  = q.cel_ilosc > 0 ? q.postep / q.cel_ilosc : 0;
  const done = pct >= 1;

  return (
    <div style={{
      padding: '10px 12px',
      background: done
        ? 'linear-gradient(135deg,rgba(6,40,20,0.5),rgba(4,24,12,0.4))'
        : 'linear-gradient(135deg,rgba(16,13,10,0.6),rgba(2,6,14,0.5))',
      border: `1px solid ${done ? 'rgba(34,197,94,0.28)' : 'rgba(200,150,32,0.14)'}`,
      borderRadius: 9, marginBottom: 7,
      borderLeft: `3px solid ${done ? '#22C55E' : meta.color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1, marginTop: 2 }}>{meta.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ color: done ? '#4ADE80' : '#e8e2d4', fontWeight: 'bold', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.nazwa}</span>
            <span style={{ color: done ? '#4ADE80' : '#9a9182', fontSize: 9, flexShrink: 0, fontWeight: 'bold' }}>{q.postep}/{q.cel_ilosc}</span>
          </div>
          {/* Description */}
          <div style={{ color: '#9a9182', fontSize: 9, lineHeight: 1.45, marginBottom: 6 }}>{q.opis}</div>
          {/* Progress bar */}
          <Bar pct={pct} color={meta.color} />
          {/* Meta tags */}
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {q.nagroda_exp > 0  && pill('#06B6D4', `+${q.nagroda_exp} EXP`)}
            {q.nagroda_zloto > 0 && pill('#FCD34D', `+${q.nagroda_zloto}g`)}
            {q.reset_typ === 'dziennie'    && pill('#A78BFA', 'Dzienny')}
            {q.reset_typ === 'tygodniowo'  && pill('#60A5FA', 'Tygodniowy')}
          </div>
          {/* Turn-in */}
          {done && q.status === 'aktywny' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span style={{ color: '#4ADE80', fontSize: 9, fontWeight: 'bold' }}>★ Ukończony!</span>
              {onTurnIn && (
                <button onClick={() => onTurnIn(q)} style={{
                  padding: '4px 12px', background: 'rgba(6,40,20,0.8)', color: '#4ADE80',
                  border: '1px solid rgba(34,197,94,0.4)', borderRadius: 5,
                  cursor: 'pointer', fontSize: 9, fontWeight: 'bold',
                  boxShadow: '0 0 8px rgba(34,197,94,0.2)',
                }}>
                  Odbierz nagrody →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Achievement card ──────────────────────────────────────────────────────────
function AchCard({ a }) {
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '8px 10px',
      background: a.unlocked ? 'rgba(6,40,20,0.35)' : 'rgba(12,10,8,0.4)',
      border: `1px solid ${a.unlocked ? 'rgba(34,197,94,0.2)' : 'rgba(60,60,60,0.25)'}`,
      borderRadius: 7, marginBottom: 5,
      opacity: a.unlocked ? 1 : 0.55,
    }}>
      <span style={{ fontSize: 20, flexShrink: 0, filter: a.unlocked ? 'none' : 'grayscale(1) brightness(0.4)', lineHeight: 1, marginTop: 1 }}>{a.ikona}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <span style={{ color: a.unlocked ? '#4ADE80' : '#9a9182', fontWeight: 'bold', fontSize: 10 }}>{a.nazwa}</span>
          {a.unlocked && <span style={{ color: '#4ADE80', fontSize: 7 }}>✓ Odblokowane</span>}
        </div>
        <div style={{ color: '#9a9182', fontSize: 9 }}>{a.opis}</div>
        {!a.unlocked && (
          <div style={{ marginTop: 3, color: '#6b6456', fontSize: 8 }}>
            Nagroda:{a.nagroda_exp > 0 ? ` +${a.nagroda_exp} EXP` : ''}{a.nagroda_gold > 0 ? ` +${a.nagroda_gold}g` : ''}{a.nagroda_bonus_exp_pct > 0 ? ` +${a.nagroda_bonus_exp_pct}% EXP` : ''}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reward choice modal ───────────────────────────────────────────────────────
function RewardChoice({ choices, questId, onChoose, onClose }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: 12 }}>
      <div style={{ background: 'rgba(20,16,12,0.99)', border: '1px solid rgba(200,150,32,0.4)', borderRadius: 10, padding: '20px 24px', minWidth: 280, maxWidth: 360 }}>
        <div style={{ color: '#f7e3a4', fontWeight: 'bold', fontSize: 14, marginBottom: 5 }}><IconGift size={13} /> Wybierz nagrodę</div>
        <div style={{ color: '#9a9182', fontSize: 9, marginBottom: 14 }}>Wybierz jedną nagrodę za ukończenie questa:</div>
        {choices.map((c, i) => (
          <button key={i} onClick={() => onChoose(questId, i)} style={{
            display: 'flex', gap: 10, alignItems: 'center', width: '100%',
            padding: '9px 12px', marginBottom: 6,
            background: 'rgba(16,13,10,0.8)', border: '1px solid rgba(200,150,32,0.2)',
            borderRadius: 6, cursor: 'pointer', textAlign: 'left',
          }}>
            <span style={{ color: '#FCD34D', fontSize: 14, fontWeight: 'bold', flexShrink: 0 }}>{i + 1}</span>
            <div style={{ color: '#9CA3AF', fontSize: 9 }}>
              {c.exp > 0 && `+${c.exp} EXP`}{c.exp > 0 && c.gold > 0 && ' · '}{c.gold > 0 && `+${c.gold}g`}{c.item && ` · ${c.item}`}
            </div>
          </button>
        ))}
        <button onClick={onClose} style={{ marginTop: 4, padding: '4px 10px', background: 'none', border: '1px solid rgba(200,150,32,0.2)', borderRadius: 4, color: '#9a9182', cursor: 'pointer', fontSize: 9, fontFamily: 'Verdana,sans-serif' }}>Anuluj</button>
      </div>
    </div>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'active',       Icon: IconScroll,     label: 'Aktywne' },
  { id: 'done',         Icon: IconCheck,      label: 'Ukończone' },
  { id: 'daily',        Icon: IconClock,      label: 'Dzienne' },
  { id: 'weekly',       Icon: IconTrendingUp, label: 'Tygodniowe' },
  { id: 'chains',       Icon: IconZap,        label: 'Łańcuchy' },
  { id: 'history',      Icon: IconMap,        label: 'Dziennik' },
  { id: 'achievements', Icon: IconAward,      label: 'Osiągnięcia' },
  { id: 'reputation',   Icon: IconTrophy,     label: 'Reputacja' },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function QuestPanel({ onClose, onReward }) {
  const [quests,       setQuests]       = useState([]);
  const [tab,          setTab]          = useState('active');
  const [history,      setHistory]      = useState([]);
  const [chains,       setChains]       = useState([]);
  const [daily,        setDaily]        = useState([]);
  const [weekly,       setWeekly]       = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [reputation,   setReputation]   = useState([]);
  const [choiceModal,  setChoiceModal]  = useState(null);

  const load = useCallback(() => {
    api.quests.list().then(r => Array.isArray(r) && setQuests(r));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (tab === 'history')      api.quests.history().then(r => Array.isArray(r) && setHistory(r));
    if (tab === 'chains')       api.quests.chains().then(r => Array.isArray(r) && setChains(r));
    if (tab === 'daily')        api.quests.daily().then(r => Array.isArray(r) && setDaily(r));
    if (tab === 'weekly')       api.quests.weekly().then(r => Array.isArray(r) && setWeekly(r));
    if (tab === 'achievements') api.quests.achievements().then(r => Array.isArray(r) && setAchievements(r));
    if (tab === 'reputation')   api.quests.reputation().then(r => Array.isArray(r) && setReputation(r));
  }, [tab]);

  const turnIn = async q => {
    const r = await api.quests.turnin(q.quest_id || q.id);
    if (r.needsChoice) { setChoiceModal({ choices: r.choices, questId: r.questId }); return; }
    if (r.ok) {
      const parts = [];
      if (r.rewards?.exp)   parts.push(`+${r.rewards.exp} EXP`);
      if (r.rewards?.zloto) parts.push(`+${r.rewards.zloto}g`);
      if (r.levelUp)        parts.push(`☆ Poziom ${r.newLevel}!`);
      onReward?.(parts.join(' · ') || 'Nagrody odebrane!');
      r.newAchievements?.forEach((a, i) => setTimeout(() => onReward?.(`${a.ikona} ${a.nazwa}!`), (i + 1) * 500));
      load();
    }
  };

  const handleChoose = async (questId, idx) => {
    const r = await api.quests.chooseReward(questId, idx);
    setChoiceModal(null);
    if (r.ok) {
      const parts = [];
      if (r.rewards?.exp)  parts.push(`+${r.rewards.exp} EXP`);
      if (r.rewards?.gold) parts.push(`+${r.rewards.gold}g`);
      if (r.levelUp)       parts.push(`☆ Poziom ${r.newLevel}!`);
      onReward?.(parts.join(' · ') || 'Nagrody odebrane!');
      load();
    }
  };

  const active    = quests.filter(q => q.status === 'aktywny');
  const completed = quests.filter(q => q.status === 'oddane');

  const BADGE = {
    active: active.length > 0 ? active.length : null,
    done: completed.length > 0 ? completed.length : null,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{
        width: 680, maxWidth: '99vw', height: '88vh', maxHeight: 740,
        background: 'linear-gradient(160deg,rgba(20,16,12,0.99),rgba(12,10,8,0.99))',
        border: '1px solid rgba(200,150,32,0.2)', borderRadius: 12,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 20px 80px rgba(0,0,0,0.9)',
        fontFamily: 'Verdana,sans-serif', position: 'relative',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: 'rgba(12,10,8,0.6)', borderBottom: '1px solid rgba(200,150,32,0.12)', flexShrink: 0 }}>
          <span style={{ color: '#e7c158', display: 'flex' }}><IconScroll size={15} /></span>
          <span style={{ color: '#f7e3a4', fontWeight: 'bold', fontSize: 13 }}>Dziennik Questów</span>
          <span style={{ color: '#9a9182', fontSize: 9 }}>— {active.length} aktywnych</span>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#9a9182', cursor: 'pointer', display: 'flex' }}>
            <IconX size={17} />
          </button>
        </div>

        {/* Body: sidebar + content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* SIDEBAR */}
          <div style={{ width: 152, flexShrink: 0, borderRight: '1px solid rgba(200,150,32,0.1)', background: 'rgba(12,10,8,0.5)', display: 'flex', flexDirection: 'column', padding: '6px 0', overflowY: 'auto' }}>
            {TABS.map(({ id, Icon, label }) => {
              const active = tab === id;
              const badge  = BADGE[id];
              return (
                <button key={id} onClick={() => setTab(id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px',
                  background: active ? 'rgba(200,150,32,0.1)' : 'none',
                  border: 'none', borderLeft: active ? '3px solid #e7c158' : '3px solid transparent',
                  cursor: 'pointer', color: active ? '#f7e3a4' : '#9a9182',
                  fontSize: 9, fontWeight: active ? 'bold' : 'normal',
                  fontFamily: 'Verdana,sans-serif', textAlign: 'left',
                  position: 'relative',
                }}>
                  <span style={{ color: active ? '#e7c158' : '#6b6456', flexShrink: 0 }}><Icon size={12} /></span>
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge && (
                    <span style={{ background: '#EF4444', color: '#fff', fontSize: 7, fontWeight: 'bold', borderRadius: 9999, padding: '1px 5px', minWidth: 16, textAlign: 'center' }}>{badge}</span>
                  )}
                  {active && <IconChevronRight size={10} style={{ color: '#e7c158', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {/* CONTENT */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Tab header */}
            <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(200,150,32,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(12,10,8,0.3)' }}>
              {(() => { const t = TABS.find(t => t.id === tab); return t ? <><t.Icon size={13} style={{ color: '#e7c158' }} /><span style={{ color: '#e7c158', fontWeight: 'bold', fontSize: 10 }}>{t.label}</span></> : null; })()}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>

              {/* ── ACTIVE ── */}
              {tab === 'active' && (
                active.length === 0
                  ? <Empty icon={<IconScroll size={26} />} text="Brak aktywnych questów — porozmawiaj z NPC!" />
                  : active.map(q => <QuestCard key={q.id} q={q} onTurnIn={turnIn} />)
              )}

              {/* ── DONE ── */}
              {tab === 'done' && (
                completed.length === 0
                  ? <Empty icon="✓" text="Żaden quest nie jest jeszcze ukończony" />
                  : completed.map(q => (
                    <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(6,40,20,0.3)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 7, marginBottom: 5 }}>
                      <span style={{ color: '#22C55E', fontSize: 16 }}>✓</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#4ADE80', fontWeight: 'bold', fontSize: 10 }}>{q.nazwa}</div>
                        <div style={{ color: '#9a9182', fontSize: 8 }}>{q.data_ukon ? fmtDate(q.data_ukon) : 'Ukończono'}</div>
                      </div>
                    </div>
                  ))
              )}

              {/* ── DAILY ── */}
              {tab === 'daily' && (
                daily.length === 0
                  ? <Empty icon={<IconRefresh size={26} />} text="Brak dziennych questów" />
                  : daily.map(q => (
                    <div key={q.id} style={{ padding: '10px 12px', background: 'rgba(16,13,10,0.6)', border: '1px solid rgba(167,139,250,0.18)', borderRadius: 8, marginBottom: 6, borderLeft: '3px solid #A78BFA' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <span style={{ color: '#e8e2d4', fontWeight: 'bold', fontSize: 11 }}><IconRefresh size={11} /> {q.nazwa}</span>
                        {q.doneToday && pill('#4ADE80', '✓ Dziś ukończony')}
                      </div>
                      <div style={{ color: '#9a9182', fontSize: 9, marginBottom: 6 }}>{q.opis}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {q.nagroda_exp > 0  && pill('#06B6D4', `+${q.nagroda_exp} EXP`)}
                        {q.nagroda_zloto > 0 && pill('#FCD34D', `+${q.nagroda_zloto}g`)}
                      </div>
                      {q.myStatus === 'aktywny' && (
                        <div style={{ marginTop: 7 }}>
                          <Bar pct={(q.myPostep || 0) / q.cel_ilosc} color='#A78BFA' />
                          <div style={{ color: '#9a9182', fontSize: 8, marginTop: 2 }}>{q.myPostep || 0}/{q.cel_ilosc}</div>
                        </div>
                      )}
                    </div>
                  ))
              )}

              {/* ── WEEKLY ── */}
              {tab === 'weekly' && (
                weekly.length === 0
                  ? <Empty icon={<IconCalendar size={26} />} text="Brak tygodniowych questów" />
                  : weekly.map(q => (
                    <div key={q.id} style={{ padding: '10px 12px', background: 'rgba(16,13,10,0.6)', border: '1px solid rgba(96,165,250,0.18)', borderRadius: 8, marginBottom: 6, borderLeft: '3px solid #60A5FA' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <span style={{ color: '#e8e2d4', fontWeight: 'bold', fontSize: 11 }}><IconCalendar size={11} /> {q.nazwa}</span>
                        {q.doneThisWeek && pill('#4ADE80', '✓ Ten tydzień')}
                      </div>
                      <div style={{ color: '#9a9182', fontSize: 9, marginBottom: 6 }}>{q.opis}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {q.nagroda_exp > 0  && pill('#06B6D4', `+${q.nagroda_exp} EXP`)}
                        {q.nagroda_zloto > 0 && pill('#FCD34D', `+${q.nagroda_zloto}g`)}
                      </div>
                      {q.myStatus === 'aktywny' && (
                        <div style={{ marginTop: 7 }}>
                          <Bar pct={(q.myPostep || 0) / q.cel_ilosc} color='#60A5FA' />
                          <div style={{ color: '#9a9182', fontSize: 8, marginTop: 2 }}>{q.myPostep || 0}/{q.cel_ilosc}</div>
                        </div>
                      )}
                    </div>
                  ))
              )}

              {/* ── CHAINS ── */}
              {tab === 'chains' && (
                chains.length === 0
                  ? <Empty icon={<IconLink size={26} />} text="Brak łańcuchów questów" />
                  : chains.map(c => (
                    <div key={c.id} style={{ padding: '10px 12px', background: 'rgba(16,13,10,0.6)', border: '1px solid rgba(200,150,32,0.15)', borderRadius: 8, marginBottom: 6 }}>
                      <div style={{ color: '#f7e3a4', fontWeight: 'bold', fontSize: 11, marginBottom: 3 }}><IconLink size={11} /> {c.nazwa}</div>
                      {c.opis && <div style={{ color: '#9a9182', fontSize: 9, marginBottom: 6 }}>{c.opis}</div>}
                      <Bar pct={c.done / c.total} color='#e7c158' />
                      <div style={{ color: '#9a9182', fontSize: 8, marginTop: 3 }}>{c.done}/{c.total} questów ukończonych</div>
                      {c.nagroda_tytul && <div style={{ color: '#FCD34D', fontSize: 9, marginTop: 5 }}>Nagroda: <IconAward size={10} /> {c.nagroda_tytul}</div>}
                    </div>
                  ))
              )}

              {/* ── HISTORY ── */}
              {tab === 'history' && (
                history.length === 0
                  ? <Empty icon={<IconScroll size={26} />} text="Brak historii questów" />
                  : history.map(h => (
                    <div key={h.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 10px', background: 'rgba(20,16,12,0.4)', border: '1px solid rgba(34,197,94,0.08)', borderRadius: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>
                        {h.zakonczenie === 'dobre' ? <IconCheck size={12} /> : h.zakonczenie === 'zle' ? <IconSkull size={12} /> : <IconCheck size={12} />}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#e8e2d4', fontSize: 10, fontWeight: 'bold' }}>{h.quest_nazwa}</div>
                        <div style={{ color: '#9a9182', fontSize: 8 }}>
                          {h.data_ukonczenia ? new Date(h.data_ukonczenia).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    </div>
                  ))
              )}

              {/* ── ACHIEVEMENTS ── */}
              {tab === 'achievements' && (
                achievements.length === 0
                  ? <Empty icon={<IconTrophy size={26} />} text="Ładowanie osiągnięć..." />
                  : <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ color: '#9a9182', fontSize: 9 }}>{achievements.filter(a => a.unlocked).length}/{achievements.length} odblokowanych</span>
                      <div style={{ flex: 1, maxWidth: 200, marginLeft: 12 }}>
                        <Bar pct={achievements.filter(a => a.unlocked).length / achievements.length} color='#FCD34D' h={4} />
                      </div>
                    </div>
                    {achievements.map(a => <AchCard key={a.id} a={a} />)}
                  </>
              )}

              {/* ── REPUTATION ── */}
              {tab === 'reputation' && (
                reputation.length === 0
                  ? <Empty icon={<IconAward size={26} />} text="Ładowanie reputacji..." />
                  : reputation.map(f => {
                    const color = REP_COLORS[f.poziom] || '#9CA3AF';
                    const pct   = Math.min(1, f.punkty / 1000);
                    return (
                      <div key={f.id} style={{ padding: '10px 12px', background: 'rgba(16,13,10,0.5)', border: '1px solid rgba(200,150,32,0.12)', borderRadius: 8, marginBottom: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: f.kolor, boxShadow: `0 0 5px ${f.kolor}` }} />
                            <span style={{ color: '#e8e2d4', fontWeight: 'bold', fontSize: 11 }}>{f.nazwa}</span>
                          </div>
                          <span style={{ color, fontSize: 9, fontWeight: 'bold', padding: '2px 8px', background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 9999 }}>{f.poziom}</span>
                        </div>
                        <Bar pct={pct} color={color} h={5} />
                        <div style={{ color: '#9a9182', fontSize: 8, marginTop: 3 }}>{f.punkty} / 1000 punktów</div>
                      </div>
                    );
                  })
              )}

            </div>
          </div>
        </div>

        {/* Reward choice overlay */}
        {choiceModal && (
          <RewardChoice choices={choiceModal.choices} questId={choiceModal.questId} onChoose={handleChoose} onClose={() => setChoiceModal(null)} />
        )}
      </div>
    </div>
  );
}

function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 48, color: '#5e584c' }}>
      <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.3 }}>{icon}</div>
      <div style={{ fontSize: 10 }}>{text}</div>
    </div>
  );
}
