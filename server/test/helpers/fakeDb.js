// Atrapa bazy w pamięci dla testów ekonomii.
// Każde zapytanie wykonuje się atomowo, ale przed każdym oddajemy sterowanie
// (setImmediate), więc równoległe operacje przeplatają się między zapytaniami —
// dokładnie tak, jak w prawdziwym wyścigu. withTransaction NIE ma rollbacku
// (jak MyISAM), więc testy sprawdzają najgorszy przypadek.

function norm(sql) {
  return sql.replace(/\s+/g, ' ').trim();
}

function createFakeDb(initial = {}) {
  const t = {
    postac: [], przedmiot_postac: [], aukcje: [],
    handel_sesje: [], handel_przedmioty: [],
    ...structuredClone(initial),
  };
  const nextId = { przedmiot_postac: 1000, aukcje: 1 };
  for (const a of t.aukcje) nextId.aukcje = Math.max(nextId.aukcje, a.id + 1);
  const log = [];

  const byId = (table, id) => t[table].find(r => r.id === Number(id));
  const ok = (affectedRows, extra = {}) => [{ affectedRows, ...extra }];
  const rows = (list) => [list.map(r => ({ ...r }))];

  const rules = [
    // ── postac ──
    [/^SELECT nazwa FROM postac WHERE id=\?$/, ([id]) => rows([byId('postac', id)].filter(Boolean))],
    [/^SELECT zloto FROM postac WHERE id=\?$/, ([id]) => rows([byId('postac', id)].filter(Boolean))],
    [/^UPDATE postac SET zloto=zloto-\? WHERE id=\? AND zloto>=\?$/, ([amt, id, min]) => {
      const p = byId('postac', id);
      if (!p || p.zloto < min) return ok(0);
      p.zloto -= amt; return ok(1);
    }],
    [/^UPDATE postac SET zloto=zloto\+\? WHERE id=\?$/, ([amt, id]) => {
      const p = byId('postac', id);
      if (!p) return ok(0);
      p.zloto += amt; return ok(1);
    }],

    // ── przedmiot_postac ──
    [/^SELECT (\*|id) FROM przedmiot_postac WHERE id=\? AND postac=\? AND zalozony=0$/, ([id, postac]) =>
      rows(t.przedmiot_postac.filter(i => i.id === Number(id) && i.postac === postac && !i.zalozony))],
    [/^DELETE FROM przedmiot_postac WHERE id=\? AND postac=\? AND zalozony=0$/, ([id, postac]) => {
      const idx = t.przedmiot_postac.findIndex(i => i.id === Number(id) && i.postac === postac && !i.zalozony);
      if (idx < 0) return ok(0);
      t.przedmiot_postac.splice(idx, 1); return ok(1);
    }],
    [/^UPDATE przedmiot_postac SET postac=\? WHERE id=\? AND postac=\? AND zalozony=0$/, ([to, id, from]) => {
      const it = t.przedmiot_postac.find(i => i.id === Number(id) && i.postac === from && !i.zalozony);
      if (!it) return ok(0);
      it.postac = to; return ok(1);
    }],
    [/^INSERT INTO przedmiot_postac \(([^)]+)\) VALUES/, (params, m) => {
      const cols = m[1].split(',');
      const row = Object.fromEntries(cols.map((c, i) => [c, params[i]]));
      row.id = nextId.przedmiot_postac++;
      t.przedmiot_postac.push(row);
      return ok(1, { insertId: row.id });
    }],

    // ── aukcje ──
    [/^INSERT INTO aukcje \(sprzedawca_id, sprzedawca_nazwa, przedmiot_snapshot, cena, data_wygasniecia\)/,
      ([sid, snazwa, snap, cena]) => {
        const row = { id: nextId.aukcje++, sprzedawca_id: sid, sprzedawca_nazwa: snazwa,
          przedmiot_snapshot: snap, cena, status: 'aktywna' };
        t.aukcje.push(row);
        return ok(1, { insertId: row.id });
      }],
    [/^SELECT \* FROM aukcje WHERE id=\? AND status='aktywna' AND data_wygasniecia>NOW\(\)$/, ([id]) =>
      rows(t.aukcje.filter(a => a.id === Number(id) && a.status === 'aktywna'))],
    [/^SELECT sprzedawca_id, przedmiot_snapshot FROM aukcje WHERE id=\?$/, ([id]) =>
      rows([byId('aukcje', id)].filter(Boolean))],
    [/^UPDATE aukcje SET status='sprzedana', kupiec_id=\?, kupiec_nazwa=\? WHERE id=\? AND status='aktywna'$/,
      ([kid, knazwa, id]) => {
        const a = byId('aukcje', id);
        if (!a || a.status !== 'aktywna') return ok(0);
        Object.assign(a, { status: 'sprzedana', kupiec_id: kid, kupiec_nazwa: knazwa }); return ok(1);
      }],
    [/^UPDATE aukcje SET status=\? WHERE id=\? AND status='aktywna'( AND sprzedawca_id=\?)?$/,
      ([status, id, sid], m) => {
        const a = byId('aukcje', id);
        if (!a || a.status !== 'aktywna') return ok(0);
        if (m[1] && a.sprzedawca_id !== sid) return ok(0);
        a.status = status; return ok(1);
      }],

    // ── handel ──
    [/^UPDATE handel_sesje SET status='zakonczona' WHERE id=\? AND status='aktywna' AND gracz1_confirm=1 AND gracz2_confirm=1$/,
      ([id]) => {
        const s = byId('handel_sesje', id);
        if (!s || s.status !== 'aktywna' || !s.gracz1_confirm || !s.gracz2_confirm) return ok(0);
        s.status = 'zakonczona'; return ok(1);
      }],
    [/^UPDATE handel_sesje SET status='anulowana' WHERE id=\?$/, ([id]) => {
      const s = byId('handel_sesje', id);
      if (!s) return ok(0);
      s.status = 'anulowana'; return ok(1);
    }],
    [/^SELECT \* FROM handel_sesje WHERE id=\?$/, ([id]) => rows([byId('handel_sesje', id)].filter(Boolean))],
    [/^SELECT gracz_id, przedmiot_id FROM handel_przedmioty WHERE sesja_id=\?$/, ([id]) =>
      rows(t.handel_przedmioty.filter(h => h.sesja_id === Number(id)))],
  ];

  async function query(sql, params = []) {
    await new Promise(r => setImmediate(r)); // punkt przeplotu
    const s = norm(sql);
    log.push(s);
    for (const [re, fn] of rules) {
      const m = s.match(re);
      if (m) return fn(params, m);
    }
    throw new Error(`fakeDb: nieobsługiwane zapytanie: ${s}`);
  }

  const db = {
    query,
    tables: t,
    log,
    // Bez rollbacku — jak MyISAM
    withTransaction: async (fn) => fn(db),
  };
  return db;
}

module.exports = { createFakeDb };
