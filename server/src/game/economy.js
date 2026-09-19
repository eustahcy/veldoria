// Operacje ekonomiczne podatne na wyścigi (race conditions).
// Zasada: każdy krok, który coś "zabiera" (złoto, przedmiot, aukcję), jest
// warunkowym UPDATE/DELETE i sprawdzamy affectedRows. Dzięki temu dwa równoległe
// żądania nie mogą obie przejść — nawet na tabelach MyISAM. Na InnoDB (po migracji
// phase12) całość dodatkowo idzie w jednej transakcji.
const { giveItem, itemSnapshot } = require('./inventory');

const MAX_PRICE = 2_000_000_000; // kolumna INT

class EconomyError extends Error {}

// ── Aukcje ───────────────────────────────────────────────────────────────────

async function listAuction(db, sellerId, przedmiotId, cena, godziny) {
  const price = Number(cena);
  if (!przedmiotId || !Number.isInteger(price) || price < 1 || price > MAX_PRICE) {
    return { ok: false, error: 'Nieprawidłowe dane' };
  }
  const hours = Math.min(48, Math.max(1, parseInt(godziny, 10) || 24));

  const [[item]] = await db.query(
    'SELECT * FROM przedmiot_postac WHERE id=? AND postac=? AND zalozony=0',
    [przedmiotId, sellerId]
  );
  if (!item) return { ok: false, error: 'Przedmiot nie znaleziony lub założony' };

  const [[seller]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [sellerId]);

  return db.withTransaction(async (conn) => {
    // Kto pierwszy usunie przedmiot, ten go wystawia — ten sam przedmiot nie trafi na 2 aukcje
    const [del] = await conn.query(
      'DELETE FROM przedmiot_postac WHERE id=? AND postac=? AND zalozony=0',
      [przedmiotId, sellerId]
    );
    if (del.affectedRows !== 1) return { ok: false, error: 'Przedmiot nie znaleziony lub założony' };

    await conn.query(
      `INSERT INTO aukcje (sprzedawca_id, sprzedawca_nazwa, przedmiot_snapshot, cena, data_wygasniecia)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))`,
      [sellerId, seller?.nazwa || '?', JSON.stringify(itemSnapshot(item)), price, hours]
    );
    return { ok: true };
  });
}

async function buyAuction(db, buyerId, auctionId) {
  const [[auction]] = await db.query(
    "SELECT * FROM aukcje WHERE id=? AND status='aktywna' AND data_wygasniecia>NOW()",
    [auctionId]
  );
  if (!auction) return { ok: false, error: 'Aukcja nie istnieje lub wygasła' };
  if (auction.sprzedawca_id === buyerId) return { ok: false, error: 'Nie możesz kupić własnej aukcji' };

  const [[buyer]] = await db.query('SELECT nazwa FROM postac WHERE id=?', [buyerId]);
  if (!buyer) return { ok: false, error: 'Brak postaci' };

  const snap = JSON.parse(auction.przedmiot_snapshot);

  return db.withTransaction(async (conn) => {
    // 1. Pobierz złoto tylko jeśli kupujący je ma
    const [pay] = await conn.query(
      'UPDATE postac SET zloto=zloto-? WHERE id=? AND zloto>=?',
      [auction.cena, buyerId, auction.cena]
    );
    if (pay.affectedRows !== 1) return { ok: false, error: 'Za mało złota' };

    // 2. Przejmij aukcję — udaje się tylko jednemu kupującemu
    const [claim] = await conn.query(
      "UPDATE aukcje SET status='sprzedana', kupiec_id=?, kupiec_nazwa=? WHERE id=? AND status='aktywna'",
      [buyerId, buyer.nazwa, auctionId]
    );
    if (claim.affectedRows !== 1) {
      // Ktoś był szybszy (albo aukcję anulowano/wygasła) — zwrot złota
      await conn.query('UPDATE postac SET zloto=zloto+? WHERE id=?', [auction.cena, buyerId]);
      return { ok: false, error: 'Aukcja nie jest już dostępna' };
    }

    // 3. Zapłata dla sprzedawcy i przedmiot dla kupującego
    await conn.query('UPDATE postac SET zloto=zloto+? WHERE id=?', [auction.cena, auction.sprzedawca_id]);
    await giveItem(conn, buyerId, snap);
    return { ok: true, auction, snap, buyer };
  });
}

// Zwrot przedmiotu sprzedawcy przy anulowaniu (sellerId) lub wygaśnięciu (sellerId=null)
async function closeAuction(db, auctionId, newStatus, sellerId = null) {
  return db.withTransaction(async (conn) => {
    const sql = sellerId === null
      ? "UPDATE aukcje SET status=? WHERE id=? AND status='aktywna'"
      : "UPDATE aukcje SET status=? WHERE id=? AND status='aktywna' AND sprzedawca_id=?";
    const params = sellerId === null ? [newStatus, auctionId] : [newStatus, auctionId, sellerId];

    // Najpierw zmiana statusu, dopiero potem zwrot — inaczej równoległy zakup dubluje przedmiot
    const [claim] = await conn.query(sql, params);
    if (claim.affectedRows !== 1) return { ok: false, error: 'Aukcja nie znaleziona' };

    const [[auction]] = await conn.query(
      'SELECT sprzedawca_id, przedmiot_snapshot FROM aukcje WHERE id=?',
      [auctionId]
    );
    await giveItem(conn, auction.sprzedawca_id, JSON.parse(auction.przedmiot_snapshot));
    return { ok: true };
  });
}

const cancelAuction = (db, sellerId, auctionId) => closeAuction(db, auctionId, 'anulowana', sellerId);
const expireAuction = (db, auctionId) => closeAuction(db, auctionId, 'wygasla');

// ── Handel gracz-gracz ───────────────────────────────────────────────────────

/**
 * Wykonuje wymianę dla sesji, w której obaj gracze potwierdzili.
 * Zwraca { ok: true, session } | { ok: false, reason } | { ok: false, alreadyDone: true }.
 */
async function executeTrade(db, sessionId) {
  try {
    return await db.withTransaction(async (conn) => {
      // Tylko jedno wywołanie może zamknąć sesję — gdy obaj gracze klikną
      // "potwierdź" jednocześnie, wymiana nie wykona się dwa razy
      const [claim] = await conn.query(
        `UPDATE handel_sesje SET status='zakonczona'
         WHERE id=? AND status='aktywna' AND gracz1_confirm=1 AND gracz2_confirm=1`,
        [sessionId]
      );
      if (claim.affectedRows !== 1) return { ok: false, alreadyDone: true };

      const [[s]] = await conn.query('SELECT * FROM handel_sesje WHERE id=?', [sessionId]);
      const [offers] = await conn.query(
        'SELECT gracz_id, przedmiot_id FROM handel_przedmioty WHERE sesja_id=?',
        [sessionId]
      );

      // Walidacja przed jakąkolwiek zmianą (na MyISAM nie ma rollbacku)
      for (const o of offers) {
        const [[it]] = await conn.query(
          'SELECT id FROM przedmiot_postac WHERE id=? AND postac=? AND zalozony=0',
          [o.przedmiot_id, o.gracz_id]
        );
        if (!it) throw new EconomyError('Przedmiot z oferty nie jest już dostępny');
      }
      const [[p1]] = await conn.query('SELECT zloto FROM postac WHERE id=?', [s.gracz1_id]);
      const [[p2]] = await conn.query('SELECT zloto FROM postac WHERE id=?', [s.gracz2_id]);
      if (!p1 || !p2 || p1.zloto < s.gracz1_gold || p2.zloto < s.gracz2_gold) {
        throw new EconomyError('Za mało złota');
      }

      // Złoto — warunkowo, na wypadek wydania go równolegle gdzie indziej
      const payments = [
        [s.gracz1_id, s.gracz2_id, s.gracz1_gold],
        [s.gracz2_id, s.gracz1_id, s.gracz2_gold],
      ];
      for (const [from, to, amount] of payments) {
        if (!(amount > 0)) continue;
        const [pay] = await conn.query(
          'UPDATE postac SET zloto=zloto-? WHERE id=? AND zloto>=?',
          [amount, from, amount]
        );
        if (pay.affectedRows !== 1) throw new EconomyError('Za mało złota');
        await conn.query('UPDATE postac SET zloto=zloto+? WHERE id=?', [amount, to]);
      }

      // Przedmioty — tylko jeśli wciąż należą do oddającego
      for (const o of offers) {
        const to = o.gracz_id === s.gracz1_id ? s.gracz2_id : s.gracz1_id;
        const [mv] = await conn.query(
          'UPDATE przedmiot_postac SET postac=? WHERE id=? AND postac=? AND zalozony=0',
          [to, o.przedmiot_id, o.gracz_id]
        );
        if (mv.affectedRows !== 1) throw new EconomyError('Przedmiot z oferty nie jest już dostępny');
      }

      return { ok: true, session: s };
    });
  } catch (e) {
    if (!(e instanceof EconomyError)) throw e;
    // Transakcja wycofana — zamknij sesję jako anulowaną
    await db.query("UPDATE handel_sesje SET status='anulowana' WHERE id=?", [sessionId]);
    return { ok: false, reason: e.message };
  }
}

module.exports = {
  listAuction, buyAuction, cancelAuction, expireAuction, executeTrade,
  EconomyError, MAX_PRICE,
};
