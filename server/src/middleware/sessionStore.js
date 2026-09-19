const session = require('express-session');

const { logError } = require('../game/log');
// Custom MySQL session store — uses mysql2 (already in deps), no extra packages
class MySQLStore extends session.Store {
  constructor(db) {
    super();
    this.db = db;
    this._init();
  }

  async _init() {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          sid     VARCHAR(128)  NOT NULL PRIMARY KEY,
          sess    MEDIUMTEXT    NOT NULL,
          expired BIGINT        NOT NULL,
          INDEX idx_expired (expired)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci
      `);
      // Clear expired sessions on startup
      await this.db.query('DELETE FROM sessions WHERE expired < ?', [Date.now()]);
    } catch(e) {
      console.error('SessionStore init error:', e.message);
    }
    // Periodic cleanup every 10 minutes
    setInterval(() => {
      this.db.query('DELETE FROM sessions WHERE expired < ?', [Date.now()]).catch(logError('sessionStore:29'));
    }, 600_000);
  }

  get(sid, cb) {
    this.db.query('SELECT sess FROM sessions WHERE sid=? AND expired>=?', [sid, Date.now()])
      .then(([[row]]) => cb(null, row ? JSON.parse(row.sess) : null))
      .catch(cb);
  }

  set(sid, sess, cb) {
    const ttl = sess.cookie?.maxAge ? Date.now() + sess.cookie.maxAge : Date.now() + 86_400_000;
    this.db.query(
      'REPLACE INTO sessions (sid, sess, expired) VALUES (?,?,?)',
      [sid, JSON.stringify(sess), ttl]
    ).then(() => cb(null)).catch(cb);
  }

  destroy(sid, cb) {
    this.db.query('DELETE FROM sessions WHERE sid=?', [sid])
      .then(() => cb(null)).catch(cb);
  }

  touch(sid, sess, cb) { this.set(sid, sess, cb); }
}

module.exports = MySQLStore;
