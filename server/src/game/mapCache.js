// In-memory cache for static/semi-static map data
const TTL = 30_000; // 30 s

class MapCache {
  constructor() {
    this._store = new Map(); // key → { data, ts }
  }

  _get(key) {
    const e = this._store.get(key);
    if (!e) return null;
    if (Date.now() - e.ts > TTL) { this._store.delete(key); return null; }
    return e.data;
  }

  _set(key, data) { this._store.set(key, { data, ts: Date.now() }); return data; }

  invalidate(mapId) {
    for (const key of this._store.keys()) {
      if (key.startsWith(`${mapId}:`)) this._store.delete(key);
    }
  }

  async get(db, mapId, table, columns = '*') {
    const key = `${mapId}:${table}`;
    return this._get(key) ?? this._set(key, (await db.query(`SELECT ${columns} FROM ${table} WHERE mapa=?`, [mapId]))[0]);
  }

  async getMap(db, mapId) {
    const key = `map:${mapId}`;
    return this._get(key) ?? this._set(key, (await db.query('SELECT * FROM mapa WHERE id=?', [mapId]))[0][0]);
  }
}

module.exports = new MapCache();
