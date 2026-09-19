// In-memory cache of server_config table
let cache = {};

const DEFAULTS = {
  server_name:          { value:'Veldoria',        label:'Nazwa serwera',           type:'text'    },
  server_description:   { value:'Klasyczne MMORPG', label:'Opis serwera',            type:'textarea'},
  xp_multiplier:        { value:'1.0',              label:'Mnożnik EXP',             type:'number'  },
  loot_chance:          { value:'1.0',              label:'Mnożnik szansy na loot',   type:'number'  },
  respawn_multiplier:   { value:'1.0',              label:'Mnożnik czasu respawnu',   type:'number'  },
  gold_multiplier:      { value:'1.0',              label:'Mnożnik złota',           type:'number'  },
  max_players:          { value:'200',              label:'Max graczy online',        type:'number'  },
  maintenance_mode:     { value:'0',                label:'Tryb konserwacji',         type:'boolean' },
  maintenance_message:  { value:'Serwer w trakcie prac konserwacyjnych. Wróć później!', label:'Komunikat konserwacji', type:'textarea' },
  registration_enabled: { value:'1',                label:'Rejestracja otwarta',      type:'boolean' },
  pvp_enabled:          { value:'1',                label:'PvP włączone',             type:'boolean' },
  starting_gold:        { value:'0',                label:'Złoto startowe',           type:'number'  },
  starting_map:         { value:'1',                label:'Mapa startowa (ID)',        type:'number'  },
  starting_x:           { value:'35',               label:'Pozycja startowa X',       type:'number'  },
  starting_y:           { value:'37',               label:'Pozycja startowa Y',       type:'number'  },
  announcement:         { value:'',                 label:'Ogłoszenie serwera',        type:'textarea'},
  heal_cost:            { value:'0',                label:'Koszt leczenia (złoto)',    type:'number'  },
  max_level:            { value:'200',              label:'Max poziom postaci',        type:'number'  },
  dead_respawn_map:     { value:'1',                label:'Mapa po śmierci (ID)',      type:'number'  },
};

async function init(db) {
  // Create tables if they don't exist
  await db.query(`
    CREATE TABLE IF NOT EXISTS server_config (
      config_key VARCHAR(64) PRIMARY KEY,
      config_value TEXT NOT NULL DEFAULT '',
      label VARCHAR(128),
      type VARCHAR(16) DEFAULT 'text'
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS servers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(64) NOT NULL,
      description TEXT,
      status ENUM('active','maintenance','offline') DEFAULT 'offline',
      port INT DEFAULT 3001,
      config JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT NOT NULL,
      admin_name VARCHAR(64),
      action VARCHAR(128),
      target VARCHAR(256),
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert defaults for missing keys
  for (const [key, { value, label, type }] of Object.entries(DEFAULTS)) {
    await db.query(
      `INSERT IGNORE INTO server_config (config_key, config_value, label, type) VALUES (?,?,?,?)`,
      [key, value, label, type]
    );
  }

  // Ensure current server is in servers table
  const [[existing]] = await db.query('SELECT id FROM servers WHERE id=1 LIMIT 1');
  if (!existing) {
    await db.query(
      `INSERT INTO servers (id, name, description, status, port, config) VALUES (1,?,?,?,?,?)`,
      ['Veldoria', 'Główny serwer gry', 'active', 3002, JSON.stringify({})]
    );
  } else {
    await db.query(`UPDATE servers SET status='active', updated_at=NOW() WHERE id=1`);
  }

  await reload(db);
}

async function reload(db) {
  const [rows] = await db.query('SELECT config_key, config_value FROM server_config');
  cache = Object.fromEntries(rows.map(r => [r.config_key, r.config_value]));
}

function get(key) {
  return cache[key] !== undefined ? cache[key] : (DEFAULTS[key]?.value ?? '');
}

function getNum(key, def = 1) {
  const v = parseFloat(cache[key]);
  return isNaN(v) ? def : v;
}

function getBool(key) {
  return get(key) === '1' || get(key) === 'true';
}

function getAll() {
  return Object.entries(DEFAULTS).map(([key, meta]) => ({
    key,
    value: cache[key] !== undefined ? cache[key] : meta.value,
    label: meta.label,
    type: meta.type,
  }));
}

async function set(db, key, value, adminId, adminName) {
  cache[key] = String(value);
  await db.query(
    `INSERT INTO server_config (config_key, config_value, label, type) VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE config_value=?`,
    [key, String(value), DEFAULTS[key]?.label || key, DEFAULTS[key]?.type || 'text', String(value)]
  );
  if (adminId) {
    await db.query(
      `INSERT INTO admin_log (admin_id, admin_name, action, target, details) VALUES (?,?,?,?,?)`,
      [adminId, adminName, 'config_change', key, `${key} = ${value}`]
    );
  }
}

async function setMany(db, pairs, adminId, adminName) {
  for (const [key, value] of Object.entries(pairs)) {
    await set(db, key, value, adminId, adminName);
  }
}

async function log(db, adminId, adminName, action, target, details) {
  await db.query(
    `INSERT INTO admin_log (admin_id, admin_name, action, target, details) VALUES (?,?,?,?,?)`,
    [adminId, adminName, action, target || '', details || '']
  );
}

module.exports = { init, reload, get, getNum, getBool, getAll, set, setMany, log };
