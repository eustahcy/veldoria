// Dane nadawcy dołączane do wiadomości czatu: poziom, prestiż i tag gildii.
async function chatMeta(db, postacId) {
  const [[r]] = await db.query(
    `SELECT p.poziom, p.prestige, g.tag AS gildia
     FROM postac p
     LEFT JOIN gildia_czlonkowie gm ON gm.postac_id = p.id
     LEFT JOIN gilde g ON g.id = gm.gildia_id
     WHERE p.id = ? LIMIT 1`,
    [postacId]
  );
  return { poziom: r?.poziom ?? null, prestige: r?.prestige ?? 0, gildia: r?.gildia ?? null, czas: new Date().toISOString() };
}

module.exports = { chatMeta };
