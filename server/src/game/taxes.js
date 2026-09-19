const db = require('../db');

/**
 * Collect tax from a transaction on a given map.
 * @param {number} mapaId  — map where transaction occurred
 * @param {number} kwota   — transaction amount (tax is % of this)
 * @param {string} zrodlo  — 'aukcja' | 'sklep_npc' | 'handel'
 * @returns {number} tax amount collected (0 if no territory or no owner)
 */
async function collectTax(mapaId, kwota, zrodlo) {
  try {
    const [[territory]] = await db.query(
      'SELECT gildia_id, podatek_pct FROM gildia_terytorium WHERE mapa_id=?',
      [mapaId]
    );
    if (!territory) return 0;
    const pct = territory.podatek_pct || 3;
    const tax = Math.floor(kwota * pct / 100);
    if (tax <= 0) return 0;
    await db.query('UPDATE gilde SET skarbiec=skarbiec+? WHERE id=?', [tax, territory.gildia_id]);
    await db.query(
      'UPDATE gildia_terytorium SET przychod_total=przychod_total+? WHERE mapa_id=?',
      [tax, mapaId]
    );
    await db.query(
      'INSERT INTO podatki_log (gildia_id,mapa_id,zrodlo,kwota) VALUES (?,?,?,?)',
      [territory.gildia_id, mapaId, zrodlo, tax]
    );
    return tax;
  } catch (_) {
    return 0;
  }
}

module.exports = { collectTax };
