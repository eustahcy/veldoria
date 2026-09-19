const express = require('express');
const { logError } = require('../game/log');
const router  = express.Router();
const db      = require('../db');
const { createLimiter } = require('../middleware/rateLimiter');
const { computeStats } = require('../game/stats');

// Ochrona przed zgadywaniem haseł / masową rejestracją — liczone po IP
const loginLimit    = createLimiter(10, 15 * 60 * 1000, { byIp: true }); // 10 prób / 15 min
const registerLimit = createLimiter(5, 60 * 60 * 1000, { byIp: true });  // 5 kont / h

const CLASSES = {
  Wojownik:         { sila:8,  zrecznosc:4, intelekt:2,  obrazek:'avatar/m_bd28.gif',    opis:'Mistrz walki wręcz, nieustępliwy i twardy.' },
  Paladyn:          { sila:6,  zrecznosc:4, intelekt:5,  obrazek:'avatar/m_pal21.gif',   opis:'Święty rycerz łączący moc i magię świętą.' },
  'Tancerz Ostrzy': { sila:5,  zrecznosc:9, intelekt:2,  obrazek:'avatar/m_bd06.gif',    opis:'Zabójca walczący dwoma ostrzami, szybki jak wiatr.' },
  Lowca:            { sila:3,  zrecznosc:8, intelekt:4,  obrazek:'avatar/m_lowca08.gif', opis:'Snajper i łowca zwierząt, mistrz zasięgu.' },
  Tropiciel:        { sila:4,  zrecznosc:7, intelekt:4,  obrazek:'avatar/m_tr17.gif',    opis:'Zwiadowca i łowca potworów, ekspert przetrwania.' },
  Mag:              { sila:2,  zrecznosc:3, intelekt:10, obrazek:'avatar/m_magmrozu.gif', opis:'Władca magii i żywiołów, potężny lecz kruchy.' },
};

const SERVERS = [{ id:'test', name:'Test', status:'online', players:0 }];

// GET /api/auth/classes
router.get('/classes', (_req, res) => {
  res.json(Object.entries(CLASSES).map(([name, d]) => ({ name, ...d })));
});

// GET /api/auth/servers
router.get('/servers', (_req, res) => res.json(SERVERS));

// POST /api/auth/register
router.post('/register', registerLimit, async (req, res, next) => {
  try {
    const { login, haslo, powtorzHaslo } = req.body;
    if (!login || !haslo || !powtorzHaslo) return res.status(400).json({ error: 'Wypełnij wszystkie pola' });

    const trimmed = login.trim();
    if (trimmed.length < 3 || trimmed.length > 24) return res.status(400).json({ error: 'Login musi mieć 3–24 znaki' });
    if (!/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9_-]+$/.test(trimmed)) return res.status(400).json({ error: 'Login zawiera niedozwolone znaki' });
    if (haslo.length < 4) return res.status(400).json({ error: 'Hasło musi mieć co najmniej 4 znaki' });
    if (haslo !== powtorzHaslo) return res.status(400).json({ error: 'Hasła nie są identyczne' });

    const [[existing]] = await db.query('SELECT id FROM accounts WHERE login=? LIMIT 1', [trimmed]);
    if (existing) return res.status(409).json({ error: 'Ta nazwa konta jest już zajęta' });

    const [result] = await db.query('INSERT INTO accounts (login,haslo) VALUES (?,?)', [trimmed, haslo]);
    req.session.accountId = result.insertId;
    req.session.accountLogin = trimmed;
    res.status(201).json({ ok: true, accountId: result.insertId });
  } catch(e) { next(e); }
});

// POST /api/auth/login
router.post('/login', loginLimit, async (req, res, next) => {
  try {
    const { login, haslo, rememberMe } = req.body;
    if (!login || !haslo) return res.status(400).json({ error: 'Podaj login i hasło' });

    const [[account]] = await db.query('SELECT * FROM accounts WHERE login=? AND haslo=? LIMIT 1', [login.trim(), haslo]);
    if (!account) return res.status(401).json({ error: 'Nieprawidłowy login lub hasło' });

    req.session.accountId    = account.id;
    req.session.accountLogin = account.login;
    delete req.session.postacId;

    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    // Check if account has an admin character
    const [[adminChar]] = await db.query(
      'SELECT id FROM postac WHERE account_id=? AND ranga="GameAdmin" LIMIT 1',
      [account.id]
    );
    const isAdmin = !!adminChar;
    if (isAdmin) req.session.adminPostacId = adminChar.id;

    res.json({ ok: true, accountId: account.id, login: account.login, isAdmin });
  } catch(e) { next(e); }
});

// GET /api/auth/my-characters
router.get('/my-characters', async (req, res, next) => {
  try {
    if (!req.session.accountId) return res.status(401).json({ error: 'Nie zalogowany' });
    const [chars] = await db.query(
      // Limit 3 dotyczy tworzenia nowych postaci; wyświetlamy wszystkie przypisane do konta
      'SELECT * FROM postac WHERE account_id=? ORDER BY id ASC LIMIT 10',
      [req.session.accountId]
    );
    // zycie_max w tabeli to wartość bazowa — ekran wyboru pokazuje maksimum z ekwipunkiem
    const out = [];
    for (const c of chars) {
      let zycieMax = c.zycie_max;
      try { zycieMax = (await computeStats(db, c)).zycie_max; } catch (e) { logError('auth:my-characters')(e); }
      const { haslo: _h, combat_state: _cs, ...safe } = c;
      out.push({ ...safe, zycie_max: zycieMax, zycie: Math.min(c.zycie, zycieMax) });
    }
    res.json(out);
  } catch(e) { next(e); }
});

// GET /api/auth/me — kto jest zalogowany (ekran wyboru postaci)
router.get('/me', async (req, res, next) => {
  try {
    if (!req.session.accountId) return res.status(401).json({ error: 'Nie zalogowany' });
    const [[acc]] = await db.query('SELECT id, login, data_rejestracji FROM accounts WHERE id=?', [req.session.accountId]);
    if (!acc) return res.status(401).json({ error: 'Nie zalogowany' });
    const [[{ ile }]] = await db.query('SELECT COUNT(*) AS ile FROM postac WHERE account_id=?', [acc.id]);
    const [[admin]] = await db.query(
      "SELECT id FROM postac WHERE account_id=? AND ranga='GameAdmin' LIMIT 1", [acc.id]
    );
    res.json({ login: acc.login, od: acc.data_rejestracji, postaci: ile, isAdmin: !!admin });
  } catch (e) { next(e); }
});

// POST /api/auth/create-character
router.post('/create-character', async (req, res, next) => {
  try {
    if (!req.session.accountId) return res.status(401).json({ error: 'Nie zalogowany' });

    const [[{ count }]] = await db.query('SELECT COUNT(*) AS count FROM postac WHERE account_id=?', [req.session.accountId]);
    if (count >= 3) return res.status(400).json({ error: 'Możesz mieć maksymalnie 3 postacie' });

    const { nazwa, profesja } = req.body;
    if (!nazwa || !profesja) return res.status(400).json({ error: 'Brak danych' });

    const trimmed = nazwa.trim();
    if (trimmed.length < 3 || trimmed.length > 24) return res.status(400).json({ error: 'Nazwa musi mieć 3–24 znaki' });
    if (!/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9 _-]+$/.test(trimmed)) return res.status(400).json({ error: 'Nazwa zawiera niedozwolone znaki' });

    const classData = CLASSES[profesja];
    if (!classData) return res.status(400).json({ error: 'Nieznana klasa' });

    const [[existing]] = await db.query('SELECT id FROM postac WHERE nazwa=? LIMIT 1', [trimmed]);
    if (existing) return res.status(409).json({ error: 'Ta nazwa postaci jest już zajęta' });

    const [[acc]] = await db.query('SELECT haslo FROM accounts WHERE id=?', [req.session.accountId]);
    const { sila, zrecznosc, intelekt, obrazek } = classData;
    const hpMax = 20 + sila * 5;

    const [result] = await db.query(
      `INSERT INTO postac (account_id,nazwa,haslo,poziom,zycie,zycie_max,exp,zloto,
        sila,zrecznosc,intelekt,obrazenia_min,obrazenia_max,
        mapa,x,y,sa,ac,acm,profesja,obrazek,zalogowany,ban,pvp,um,grupa,ranga)
       VALUES (?,?,?,1,?,?,0,0, ?,?,?,0,2, 1,31,47,100,0,0,?,?, 0,0,0,0,0,'Gracz')`,
      [req.session.accountId, trimmed, acc.haslo, hpMax, hpMax, sila, zrecznosc, intelekt, profesja, obrazek]
    );

    res.status(201).json({ ok: true, id: result.insertId, nazwa: trimmed });
  } catch(e) { next(e); }
});

// POST /api/auth/select-character
router.post('/select-character', async (req, res, next) => {
  try {
    if (!req.session.accountId) return res.status(401).json({ error: 'Nie zalogowany' });
    const { postacId } = req.body;

    const [[postac]] = await db.query(
      'SELECT * FROM postac WHERE id=? AND account_id=? LIMIT 1',
      [postacId, req.session.accountId]
    );
    if (!postac) return res.status(403).json({ error: 'Brak dostępu do tej postaci' });
    if (postac.ban) return res.status(403).json({ error: 'Postać zablokowana' });

    req.session.postacId = postac.id;
    await db.query('UPDATE postac SET zalogowany=1 WHERE id=?', [postac.id]);

    res.json({ ok: true, id: postac.id, nazwa: postac.nazwa });
  } catch(e) { next(e); }
});

// POST /api/auth/delete-character
router.post('/delete-character', async (req, res, next) => {
  try {
    if (!req.session.accountId) return res.status(401).json({ error: 'Nie zalogowany' });
    const { postacId, confirm } = req.body;
    if (confirm !== 'USUŃ') return res.status(400).json({ error: 'Wpisz USUŃ aby potwierdzić' });

    // Przedmioty kasujemy tylko jeśli postać naprawdę należała do tego konta
    const [del] = await db.query('DELETE FROM postac WHERE id=? AND account_id=?', [postacId, req.session.accountId]);
    if (del.affectedRows !== 1) return res.status(403).json({ error: 'Brak dostępu do tej postaci' });
    await db.query('DELETE FROM przedmiot_postac WHERE postac=?', [postacId]);
    if (req.session.postacId === Number(postacId)) delete req.session.postacId;
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    if (req.session.postacId) await db.query('UPDATE postac SET zalogowany=0 WHERE id=?', [req.session.postacId]);
    req.session.destroy();
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// POST /api/auth/logout-beacon
router.post('/logout-beacon', (req, res) => {
  if (req.session?.postacId) db.query('UPDATE postac SET zalogowany=0 WHERE id=?', [req.session.postacId]).catch(logError('auth:177'));
  req.session?.destroy?.(() => {});
  res.status(204).end();
});

// POST /api/auth/heartbeat
router.post('/heartbeat', (req, res) => {
  if (req.session?.postacId) db.query('UPDATE postac SET zalogowany=1 WHERE id=?', [req.session.postacId]).catch(logError('auth:184'));
  res.json({ ok: true });
});

// POST /api/auth/heartbeat-offline — oznacz offline bez niszczenia sesji (sendBeacon przy zamknięciu)
router.post('/heartbeat-offline', (req, res) => {
  if (req.session?.postacId) db.query('UPDATE postac SET zalogowany=0 WHERE id=?', [req.session.postacId]).catch(logError('auth:190'));
  res.status(204).end();
});

// GET /api/auth/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [[{ total }]]  = await db.query('SELECT COUNT(*) AS total FROM accounts');
    const [[{ online }]] = await db.query('SELECT COUNT(*) AS online FROM postac WHERE zalogowany=1');
    res.json({ total, online });
  } catch(e) { next(e); }
});

module.exports = router;
