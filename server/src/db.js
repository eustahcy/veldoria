const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'oldmargonem',
  // utf8mb4 — pełny Unicode (emoji itp.). Kolumny konwertuje migracja phase12.
  charset: 'utf8mb4_general_ci',
  // Kod robi JSON.parse na kolumnach JSON (combat_state, zdolnosci_specjalne...).
  // MariaDB 11 oznacza je jako JSON i sterownik zwracałby gotowe obiekty — wymuszamy tekst.
  jsonStrings: true,
  waitForConnections: true,
  // Crony + socket + ruch graczy — 10 połączeń to za mało przy kilkunastu graczach
  connectionLimit: parseInt(process.env.DB_POOL_SIZE, 10) || 30,
  queueLimit: 0,
});

/**
 * Wykonuje fn(conn) w transakcji na JEDNYM połączeniu.
 * Uwaga: działa tylko na tabelach InnoDB (MyISAM ignoruje transakcje) —
 * patrz migrations/phase12_innodb_utf8mb4.js.
 */
pool.withTransaction = async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (e) {
    await conn.rollback().catch(() => {});
    throw e;
  } finally {
    conn.release();
  }
};

module.exports = pool;
