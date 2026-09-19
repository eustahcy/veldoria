'use strict';
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { requireSession } = require('../middleware/auth');
const { serverError } = require('../game/log');

// ── Stałe ─────────────────────────────────────────────────────────────────────
const MODIFIERS_POOL = [
  { id:'dark_curse',    label:'Przekleństwo Ciemności', desc:'-20% celności',      effect:'sa_penalty',  value:-20 },
  { id:'blessed',       label:'Błogosławiony Teren',    desc:'+15% obrażeń',       effect:'dmg_bonus',   value:0.15 },
  { id:'mutated',       label:'Zmutowane Stworzenia',   desc:'Moby mają +40% HP',  effect:'mob_hp_mult', value:1.4 },
  { id:'no_potions',    label:'Zakaz Eliksirów',        desc:'Eliksiry zablokowane',effect:'no_potions', value:1 },
  { id:'horde',         label:'Horda',                  desc:'+50% liczby mobów',  effect:'mob_count',   value:1.5 },
  { id:'golden',        label:'Złote Moby',             desc:'Gold drop ×3',       effect:'gold_mult',   value:3 },
];

const DUNGEON_MOB_DEFS = {
  loch:      { regular:{ obrazek:'mob/goblin3.gif',     nazwa:'Goblin Jaskiniowy' },
               elite:  { obrazek:'mob/orck.gif',         nazwa:'Strażnik Lochu',    hp_mult:2.2, dmg_mult:1.8 },
               boss:   { obrazek:'mob/kosc.gif',         nazwa:'Władca Podziemi',   hp_mult:8, dmg_mult:2.5, pattern:'berserker' } },
  ruiny:     { regular:{ obrazek:'mob/wiedzma.gif',     nazwa:'Upiór Ruin' },
               elite:  { obrazek:'mob/wiedzma.gif',      nazwa:'Archanioł Ruin',    hp_mult:2.0, dmg_mult:1.9 },
               boss:   { obrazek:'mob/wiedzma.gif',      nazwa:'Arcymag Zmroku',    hp_mult:7, dmg_mult:2.2, pattern:'debuffer' } },
  wulkan:    { regular:{ obrazek:'mob/golem.gif',       nazwa:'Ognisty Golem' },
               elite:  { obrazek:'mob/golem.gif',        nazwa:'Golem Magmy',        hp_mult:2.5, dmg_mult:2.0 },
               boss:   { obrazek:'mob/golem.gif',        nazwa:'Strażnik Ognia',     hp_mult:9, dmg_mult:2.8, pattern:'aggressive' } },
  mrozny:    { regular:{ obrazek:'mob/yeti.gif',        nazwa:'Mroźny Troll' },
               elite:  { obrazek:'mob/yeti.gif',         nazwa:'Lodowy Olbrzym',     hp_mult:2.2, dmg_mult:1.7 },
               boss:   { obrazek:'mob/yeti.gif',         nazwa:'Pani Lodu',          hp_mult:8, dmg_mult:2.4, pattern:'tactical' } },
  podziemia: { regular:{ obrazek:'mob/golem.gif',       nazwa:'Strażnik Mechaniczny' },
               elite:  { obrazek:'mob/golem.gif',        nazwa:'Mech Bojowy',        hp_mult:2.8, dmg_mult:2.2 },
               boss:   { obrazek:'mob/golem.gif',        nazwa:'Golem Mechaniczny',  hp_mult:10, dmg_mult:3.0, pattern:'tactical' } },
};

const DIFFICULTY_MULT = { normalny:1.0, heroiczny:1.8, legendarny:3.0 };
const COOLDOWN_HOURS  = { normalny:4,   heroiczny:12,  legendarny:24 };

const FLOOR_POSITIONS = [
  [3,3],[8,3],[14,3],[18,3],[3,8],[8,8],[14,8],[18,8],
  [3,14],[8,14],[14,14],[18,14],[5,11],[15,5],[11,16],[6,6],[16,14],[10,5],
];
const BOSS_POS = [10,10];

// ── Generuj ściany ─────────────────────────────────────────────────────────────
function generateWalls(seed, sizeX=20, sizeY=20) {
  const rng = s => { let x=Math.sin(s)*10000; return x-Math.floor(x); };
  const walls=[];
  for(let x=0;x<=sizeX;x++){ walls.push([x,0]); walls.push([x,sizeY]); }
  for(let y=1;y<sizeY;y++){  walls.push([0,y]); walls.push([sizeX,y]); }
  for(let x=2;x<sizeX-2;x++) for(let y=2;y<sizeY-2;y++)
    if(rng(seed+x*100+y)<0.18 && !(x<=2&&y<=2) && !(x>=sizeX-3&&y>=sizeY-3))
      walls.push([x,y]);
  return walls;
}

// ── Spawning mobów ────────────────────────────────────────────────────────────
async function spawnMobs(mapaId, floorDef, dungeonTyp, playerLevel, difficulty, modifiers, seed) {
  const defs       = DUNGEON_MOB_DEFS[dungeonTyp] || DUNGEON_MOB_DEFS.loch;
  const diffMult   = DIFFICULTY_MULT[difficulty] || 1.0;
  const mobHpMod   = modifiers.find(m=>m.effect==='mob_hp_mult')?.value || 1.0;
  const mobCountMod= modifiers.find(m=>m.effect==='mob_count')?.value   || 1.0;
  const typ        = floorDef.typ;
  const level      = Math.max(1, playerLevel + (floorDef.mob_level_bonus||0));
  const mobCount   = Math.round((floorDef.mob_count||5) * mobCountMod);
  const spawnedIds = [];
  const rng = s => Math.sin(s*997.3)*43758.5453%1;

  if (typ === 'shrine') return spawnedIds; // brak mobów

  if (typ === 'boss') {
    const bd     = defs.boss;
    const hp     = Math.round(level * 20 * bd.hp_mult * diffMult);
    const obrMin = Math.round(level * 1.2 * bd.dmg_mult * diffMult);
    const obrMax = Math.round(level * 2.4 * bd.dmg_mult * diffMult);
    // Kolumny: mapa,nazwa,obrazek,poziom,zycie,zycie_max,obr_min,obr_max,
    //          ac,sa(=90),absorbcja,ck(=15),ckf(=160),unik(=5),exp,respawn_time(=9999),
    //          x,y,szerokosc(=32),dlugosc(=48),respawn(=0),sila(=1),zrecznosc(=1),intelekt(=1),
    //          pattern,szybkosc(=12)
    // ? placeholdery (14): ac,absorbcja,exp,x,y,pattern + pierwsze 8
    const [r] = await db.query(
      `INSERT INTO mob (mapa,nazwa,obrazek,poziom,zycie,zycie_max,obr_min,obr_max,
         ac,sa,absorbcja,ck,ckf,unik,exp,respawn_time,x,y,szerokosc,dlugosc,respawn,
         sila,zrecznosc,intelekt,pattern,szybkosc)
       VALUES(?,?,?,?,?,?,?,?,?,90,?,15,160,5,?,9999,?,?,32,48,0,1,1,1,?,12)`,
      [
        mapaId, bd.nazwa, bd.obrazek, level, hp, hp, obrMin, obrMax,
        Math.round(level * diffMult * 2),          // ac
        Math.round(level * diffMult),              // absorbcja
        Math.round(level * 30 * diffMult),         // exp
        BOSS_POS[0],                               // x
        BOSS_POS[1],                               // y
        bd.pattern || 'aggressive',                // pattern
      ]
    );
    spawnedIds.push({ id: r.insertId, is_boss: 1, hp, hp_max: hp });
    return spawnedIds;
  }

  // Losowe pozycje na mapie
  const positions = [...FLOOR_POSITIONS].sort(() => rng(seed + spawnedIds.length) - 0.5);

  for (let i = 0; i < Math.min(mobCount, positions.length); i++) {
    const isElite = (typ === 'elite' && i === 0);
    const md      = isElite ? defs.elite : defs.regular;
    const hpMult  = (isElite ? (md.hp_mult || 2.0) : 1.0) * diffMult * mobHpMod;
    const dmgMult = (isElite ? (md.dmg_mult || 1.5) : 1.0) * diffMult;
    const hp      = Math.round((20 + level * 6) * hpMult);
    const obrMin  = Math.max(1, Math.round(level * 0.8 * dmgMult));
    const obrMax  = Math.round(level * 1.8 * dmgMult);
    const expVal  = Math.round((level * 8 + (isElite ? level * 4 : 0)) * diffMult);
    // Kolumny: mapa,nazwa,obrazek,poziom,zycie,zycie_max,obr_min,obr_max,
    //          ac,sa(=85),absorbcja,ck(=5),ckf(=130),exp,respawn_time(=9999),
    //          x,y,szerokosc(=24),dlugosc(=32),respawn(=0),sila(=1),zrecznosc(=1),intelekt(=1),
    //          pattern,szybkosc
    // ? placeholdery (15): pierwsze 8 + ac,absorbcja,exp,x,y,pattern,szybkosc
    const [r] = await db.query(
      `INSERT INTO mob (mapa,nazwa,obrazek,poziom,zycie,zycie_max,obr_min,obr_max,
         ac,sa,absorbcja,ck,ckf,exp,respawn_time,x,y,szerokosc,dlugosc,respawn,
         sila,zrecznosc,intelekt,pattern,szybkosc)
       VALUES(?,?,?,?,?,?,?,?,?,85,?,5,130,?,9999,?,?,24,32,0,1,1,1,?,?)`,
      [
        mapaId, md.nazwa + (isElite ? ' [ELITA]' : ''), md.obrazek,
        level, hp, hp, obrMin, obrMax,
        Math.round(level * 0.4 * diffMult),        // ac
        Math.round(level * 0.3 * diffMult),        // absorbcja (mała wartość)
        expVal,                                    // exp
        positions[i][0],                           // x
        positions[i][1],                           // y
        isElite ? 'aggressive' : 'standard',       // pattern
        Math.max(3, Math.round(level * 0.6)),      // szybkosc
      ]
    );
    spawnedIds.push({ id: r.insertId, is_boss: 0 });
  }
  return spawnedIds;
}

// ── Losuj modyfikatory ─────────────────────────────────────────────────────────
function rollModifiers(difficulty) {
  const count = difficulty==='legendarny' ? 2 : difficulty==='heroiczny' ? 1 : Math.random()<0.4?1:0;
  const shuffled = [...MODIFIERS_POOL].sort(()=>Math.random()-0.5);
  return shuffled.slice(0, count);
}

// ── Oblicz wynik i rating ──────────────────────────────────────────────────────
function calcScore(czasSek, limitMin, zgony, celaCount, difficulty) {
  const limitSek = limitMin*60;
  let pts = 0;
  if (czasSek < limitSek*0.3) pts+=30; else if (czasSek < limitSek*0.6) pts+=15;
  if (zgony===0) pts+=30; else if (zgony<=2) pts+=10;
  pts += celaCount*20;
  const mult = difficulty==='legendarny'?2.0:difficulty==='heroiczny'?1.5:1.0;
  return Math.min(100, Math.round(pts*mult));
}
function calcRating(score) {
  if (score>=90) return 'S';
  if (score>=70) return 'A';
  if (score>=50) return 'B';
  return 'C';
}

// ── GET /list ─────────────────────────────────────────────────────────────────
router.get('/list', requireSession, async (req,res) => {
  try {
    const [defs] = await db.query('SELECT * FROM dungeon_def WHERE aktywny=1 ORDER BY min_poziom');
    const postacId = req.session.postacId;
    const [cds] = await db.query(
      'SELECT dungeon_id, trudnosc, wygasa FROM dungeon_cooldowns WHERE postac_id=? AND wygasa > NOW()',
      [postacId]
    );
    const cdMap = {};
    for (const cd of cds) cdMap[`${cd.dungeon_id}_${cd.trudnosc}`] = cd.wygasa;
    const [[p]] = await db.query('SELECT poziom FROM postac WHERE id=?', [postacId]);
    const result = defs.map(d => ({
      ...d,
      loot_boss: tryParse(d.loot_boss),
      cooldowns: {
        normalny:   cdMap[`${d.id}_normalny`]   || null,
        heroiczny:  cdMap[`${d.id}_heroiczny`]  || null,
        legendarny: cdMap[`${d.id}_legendarny`] || null,
      },
      eligible: (p?.poziom||1) >= d.min_poziom,
    }));
    res.json(result);
  } catch(e) { res.json([]); }
});

function tryParse(v) { try { return JSON.parse(v); } catch { return v; } }

// ── POST /enter ───────────────────────────────────────────────────────────────
router.post('/enter', requireSession, async (req,res) => {
  try {
    const { dungeon_id, trudnosc='normalny' } = req.body;
    const [[dunDef]] = await db.query('SELECT * FROM dungeon_def WHERE id=? AND aktywny=1', [dungeon_id]);
    if (!dunDef) return res.json({ ok:false, error:'Dungeon nie istnieje' });

    const [[postac]] = await db.query('SELECT * FROM postac WHERE id=?', [req.session.postacId]);
    if (!postac) return res.json({ ok:false, error:'Brak postaci' });
    if (postac.poziom < dunDef.min_poziom)
      return res.json({ ok:false, error:`Wymagany poziom ${dunDef.min_poziom}` });

    // Cooldown
    const [[cd]] = await db.query(
      'SELECT wygasa FROM dungeon_cooldowns WHERE postac_id=? AND dungeon_id=? AND trudnosc=? AND wygasa>NOW()',
      [postac.id, dungeon_id, trudnosc]
    );
    if (cd) return res.json({ ok:false, error:'Dungeon na cooldownie', cooldown: cd.wygasa });

    // Sprawdź aktywną sesję
    const [[activeSesja]] = await db.query(
      "SELECT ds.* FROM dungeon_sesje2 ds JOIN dungeon_gracze2 dg ON dg.sesja_id=ds.id WHERE dg.postac_id=? AND ds.status='aktywna' LIMIT 1",
      [postac.id]
    );
    if (activeSesja) {
      await db.query('UPDATE postac SET mapa=?,x=1,y=1 WHERE id=?', [activeSesja.mapa_id, postac.id]);
      return res.json({ ok:true, resumed:true, sesjaId:activeSesja.id, mapaId:activeSesja.mapa_id });
    }

    const seed    = Math.floor(Math.random()*999999);
    const modifiers = rollModifiers(trudnosc);
    const sizeX=20, sizeY=20;

    // Utwórz tymczasową mapę
    const [mapRes] = await db.query(
      'INSERT INTO mapa (nazwa, obrazek, maks_x, maks_y, pvp) VALUES (?,?,?,?,0)',
      [`[D2] ${dunDef.nazwa}`, dunDef.image||'mapy/zniszcze-opactwo.2.png', sizeX, sizeY]
    );
    const mapaId = mapRes.insertId;
    const walls  = generateWalls(seed, sizeX, sizeY);
    for (const [wx,wy] of walls)
      await db.query('INSERT IGNORE INTO blokadaprzejscia(mapa,x,y) VALUES(?,?,?)',[mapaId,wx,wy]);

    // Sesja
    const wygasniecia = new Date(Date.now() + dunDef.czas_limit_min*60*1000);
    const [sesRes] = await db.query(
      `INSERT INTO dungeon_sesje2
         (dungeon_id,mapa_id,trudnosc,pietro_obecne,modyfikatory,data_wygasniecia)
       VALUES(?,?,?,1,?,?)`,
      [dungeon_id, mapaId, trudnosc, JSON.stringify(modifiers), wygasniecia]
    );
    const sesjaId = sesRes.insertId;

    await db.query(
      'INSERT INTO dungeon_gracze2(sesja_id,postac_id,postac_nazwa) VALUES(?,?,?)',
      [sesjaId, postac.id, postac.nazwa]
    );

    // Pierwsze piętro
    const [floors] = await db.query(
      'SELECT * FROM dungeon_floor_def WHERE dungeon_id=? ORDER BY floor_num',
      [dungeon_id]
    );
    const floor1 = floors[0];
    if (floor1) await initFloor(sesjaId, floor1, mapaId, dunDef.typ, postac.poziom, trudnosc, modifiers, seed);

    // Teleport
    await db.query('UPDATE postac SET mapa=?,x=1,y=1 WHERE id=?', [mapaId, postac.id]);

    // Shrine: od razu lecz
    if (floor1?.typ === 'shrine') await healShrine(postac.id, postac.zycie_max);

    res.json({ ok:true, sesjaId, mapaId, expires:wygasniecia, floor:floor1, modifiers });
  } catch(e) { console.error('dungeon enter:',e.message); res.json({ ok:false, error: serverError(e, 'dungeons2') }); }
});

async function initFloor(sesjaId, floorDef, mapaId, dungeonTyp, playerLevel, difficulty, modifiers, seed) {
  const spawnedIds = await spawnMobs(mapaId, floorDef, dungeonTyp, playerLevel, difficulty, modifiers, seed+floorDef.floor_num*777);
  const bossEntry  = spawnedIds.find(s=>s.is_boss);
  await db.query(
    `INSERT INTO dungeon_floor_state(sesja_id,floor_num,mob_ids,total,boss_mob_id,boss_hp,boss_max_hp,chest_claimed)
     VALUES(?,?,?,?,?,?,?,0)`,
    [sesjaId, floorDef.floor_num, JSON.stringify(spawnedIds.map(s=>s.id)),
     floorDef.typ==='shrine'?0:spawnedIds.length,
     bossEntry?.id||null, bossEntry?.hp||null, bossEntry?.hp_max||null]
  );
  return spawnedIds;
}

async function healShrine(postacId, hpMax) {
  await db.query('UPDATE postac SET zycie=zycie_max, energia=energia_max WHERE id=?',[postacId]);
}

// ── GET /active ───────────────────────────────────────────────────────────────
router.get('/active', requireSession, async (req,res) => {
  try {
    const postacId = req.session.postacId;
    const [[sesja]] = await db.query(
      `SELECT ds.*, dd.nazwa as dung_nazwa, dd.typ, dd.pietra, dd.czas_limit_min, dd.exp_base, dd.gold_base
       FROM dungeon_sesje2 ds
       JOIN dungeon_gracze2 dg ON dg.sesja_id=ds.id
       JOIN dungeon_def dd ON dd.id=ds.dungeon_id
       WHERE dg.postac_id=? AND ds.status='aktywna' LIMIT 1`,
      [postacId]
    );
    if (!sesja) return res.json(null);

    const [[floorState]] = await db.query(
      'SELECT * FROM dungeon_floor_state WHERE sesja_id=? AND floor_num=?',
      [sesja.id, sesja.pietro_obecne]
    );
    const [[floorDef]] = await db.query(
      'SELECT * FROM dungeon_floor_def WHERE dungeon_id=? AND floor_num=?',
      [sesja.dungeon_id, sesja.pietro_obecne]
    );

    // Zlicz żywe moby
    const [[mc]] = await db.query('SELECT COUNT(*) as c FROM mob WHERE mapa=? AND zycie>0', [sesja.mapa_id]);
    const mobsAlive = mc?.c || 0;

    // Boss HP jeśli boss piętro
    let bossHp = null, bossMaxHp = null, bossFaza = 1;
    if (floorDef?.typ==='boss' && floorState?.boss_mob_id) {
      const [[bm]] = await db.query('SELECT zycie,zycie_max FROM mob WHERE id=?', [floorState.boss_mob_id]);
      bossHp    = bm?.zycie    || 0;
      bossMaxHp = bm?.zycie_max|| floorState?.boss_max_hp || 1;
      // Fazy
      const ratio = bossHp / (bossMaxHp||1);
      bossFaza = ratio > 0.6 ? 1 : ratio > 0.3 ? 2 : 3;
    }

    const [players] = await db.query(
      'SELECT postac_nazwa, zgony FROM dungeon_gracze2 WHERE sesja_id=?',
      [sesja.id]
    );

    const timeLeft = Math.max(0, new Date(sesja.data_wygasniecia) - Date.now());
    const floorComplete = (mobsAlive===0 && floorDef?.typ!=='treasure') ||
                          (floorDef?.typ==='shrine') ||
                          (floorDef?.typ==='treasure' && floorState?.chest_claimed);

    res.json({
      sesjaId: sesja.id,
      dungeonId: sesja.dungeon_id,
      dungeonNazwa: sesja.dung_nazwa,
      dungeonTyp: sesja.typ,
      trudnosc: sesja.trudnosc,
      mapaId: sesja.mapa_id,
      totalFloors: sesja.pietra,
      currentFloor: sesja.pietro_obecne,
      floorTyp: floorDef?.typ || 'arena',
      floorNazwa: floorDef?.nazwa || '',
      mobsAlive,
      mobsTotal: floorState?.total || 0,
      bossHp, bossMaxHp, bossFaza,
      chestClaimed: floorState?.chest_claimed||0,
      modifiers: tryParse(sesja.modyfikatory)||[],
      celaUkonczone: tryParse(sesja.cele_ukonczone)||[],
      zgony: sesja.zgony,
      players,
      timeLeft,
      floorComplete,
      isFinalFloor: sesja.pietro_obecne >= sesja.pietra,
      isBossFloor: floorDef?.typ === 'boss',
    });
  } catch(e) { res.json(null); }
});

// ── POST /next-floor ──────────────────────────────────────────────────────────
router.post('/next-floor', requireSession, async (req,res) => {
  try {
    const postacId = req.session.postacId;
    const [[sesja]] = await db.query(
      `SELECT ds.*, dd.typ as dung_typ, dd.pietra, dd.czas_limit_min
       FROM dungeon_sesje2 ds JOIN dungeon_gracze2 dg ON dg.sesja_id=ds.id
       JOIN dungeon_def dd ON dd.id=ds.dungeon_id
       WHERE dg.postac_id=? AND ds.status='aktywna' LIMIT 1`,
      [postacId]
    );
    if (!sesja) return res.json({ ok:false, error:'Brak aktywnej sesji' });

    // Sprawdź czy piętro ukończone
    const [[mc]] = await db.query('SELECT COUNT(*) as c FROM mob WHERE mapa=? AND zycie>0', [sesja.mapa_id]);
    const [[fs]]  = await db.query(
      'SELECT * FROM dungeon_floor_state WHERE sesja_id=? AND floor_num=?',
      [sesja.id, sesja.pietro_obecne]
    );
    const [[fd]]  = await db.query(
      'SELECT * FROM dungeon_floor_def WHERE dungeon_id=? AND floor_num=?',
      [sesja.dungeon_id, sesja.pietro_obecne]
    );

    const isShrine   = fd?.typ==='shrine';
    const isTreasure = fd?.typ==='treasure' && fs?.chest_claimed;
    const isClear    = (mc?.c||0)===0 || isShrine || isTreasure;
    if (!isClear) return res.json({ ok:false, error:'Piętro nie jest jeszcze oczyszczone!' });

    if (sesja.pietro_obecne >= sesja.pietra)
      return res.json({ ok:false, error:'To jest ostatnie piętro — użyj /complete' });

    // Oznacz piętro jako done
    await db.query('UPDATE dungeon_floor_state SET status=\'ukonczone\' WHERE sesja_id=? AND floor_num=?',
      [sesja.id, sesja.pietro_obecne]);

    // Usuń stare moby
    await db.query('DELETE FROM mob WHERE mapa=?', [sesja.mapa_id]);

    const nextFloor = sesja.pietro_obecne + 1;
    await db.query('UPDATE dungeon_sesje2 SET pietro_obecne=? WHERE id=?', [nextFloor, sesja.id]);

    // Następne piętro
    const [[nextFd]] = await db.query(
      'SELECT * FROM dungeon_floor_def WHERE dungeon_id=? AND floor_num=?',
      [sesja.dungeon_id, nextFloor]
    );
    if (!nextFd) return res.json({ ok:false, error:'Brak definicji następnego piętra' });

    const [[postac]] = await db.query('SELECT poziom,zycie_max FROM postac WHERE id=?',[postacId]);
    const modifiers  = tryParse(sesja.modyfikatory)||[];
    const seed = Date.now();

    await initFloor(sesja.id, nextFd, sesja.mapa_id, sesja.dung_typ, postac.poziom, sesja.trudnosc, modifiers, seed);

    // Teleport gracza na start
    await db.query('UPDATE postac SET x=1,y=1 WHERE id=?',[postacId]);

    // Shrine: natychmiast lecz
    if (nextFd.typ==='shrine') await healShrine(postacId, postac.zycie_max);

    res.json({ ok:true, newFloor:nextFloor, floorTyp:nextFd.typ, floorNazwa:nextFd.nazwa });
  } catch(e) { res.json({ ok:false, error: serverError(e, 'dungeons2') }); }
});

// ── POST /claim-chest ─────────────────────────────────────────────────────────
router.post('/claim-chest', requireSession, async (req,res) => {
  try {
    const postacId = req.session.postacId;
    const [[sesja]] = await db.query(
      `SELECT ds.*, dd.typ as dung_typ, dd.gold_base
       FROM dungeon_sesje2 ds JOIN dungeon_gracze2 dg ON dg.sesja_id=ds.id
       JOIN dungeon_def dd ON dd.id=ds.dungeon_id
       WHERE dg.postac_id=? AND ds.status='aktywna' LIMIT 1`,
      [postacId]
    );
    if (!sesja) return res.json({ ok:false, error:'Brak sesji' });

    const [[fs]] = await db.query(
      'SELECT * FROM dungeon_floor_state WHERE sesja_id=? AND floor_num=?',
      [sesja.id, sesja.pietro_obecne]
    );
    if (!fs || fs.chest_claimed) return res.json({ ok:false, error:'Skrzynia już odebrana' });

    const [[fd]] = await db.query(
      'SELECT * FROM dungeon_floor_def WHERE dungeon_id=? AND floor_num=?',
      [sesja.dungeon_id, sesja.pietro_obecne]
    );
    if (fd?.typ !== 'treasure') return res.json({ ok:false, error:'To piętro nie ma skrzyni' });

    await db.query('UPDATE dungeon_floor_state SET chest_claimed=1 WHERE sesja_id=? AND floor_num=?',
      [sesja.id, sesja.pietro_obecne]);

    // Nagroda ze skrzyni
    const mult   = DIFFICULTY_MULT[sesja.trudnosc]||1;
    const gold   = Math.round((sesja.gold_base||200)*0.5*mult);
    await db.query('UPDATE postac SET zloto=zloto+? WHERE id=?',[gold,postacId]);

    // Cel dodatkowy — znajdź skrzynię
    const cele = tryParse(sesja.cele_ukonczone)||[];
    if (!cele.includes('chest')) {
      cele.push('chest');
      await db.query('UPDATE dungeon_sesje2 SET cele_ukonczone=? WHERE id=?',[JSON.stringify(cele),sesja.id]);
    }

    res.json({ ok:true, gold, cele });
  } catch(e) { res.json({ ok:false, error: serverError(e, 'dungeons2') }); }
});

// ── POST /complete ────────────────────────────────────────────────────────────
router.post('/complete', requireSession, async (req,res) => {
  try {
    const postacId = req.session.postacId;
    const [[sesja]] = await db.query(
      `SELECT ds.*, dd.pietra, dd.czas_limit_min, dd.exp_base, dd.gold_base, dd.typ as dung_typ
       FROM dungeon_sesje2 ds JOIN dungeon_gracze2 dg ON dg.sesja_id=ds.id
       JOIN dungeon_def dd ON dd.id=ds.dungeon_id
       WHERE dg.postac_id=? AND ds.status='aktywna' LIMIT 1`,
      [postacId]
    );
    if (!sesja) return res.json({ ok:false, error:'Brak sesji' });

    // Sprawdź warunki ukończenia
    const isFinal = sesja.pietro_obecne >= sesja.pietra;
    if (!isFinal) return res.json({ ok:false, error:'Nie jesteś na ostatnim piętrze' });
    const [[mc]] = await db.query('SELECT COUNT(*) as c FROM mob WHERE mapa=? AND zycie>0',[sesja.mapa_id]);
    if ((mc?.c||0) > 0) return res.json({ ok:false, error:'Nie wszyscy wrogowie zostali pokonani' });

    // Oblicz wynik
    const czasSek   = Math.floor((Date.now()-new Date(sesja.data_start).getTime())/1000);
    const cele      = tryParse(sesja.cele_ukonczone)||[];
    const score     = calcScore(czasSek, sesja.czas_limit_min, sesja.zgony, cele.length, sesja.trudnosc);
    const rating    = calcRating(score);
    const mult      = DIFFICULTY_MULT[sesja.trudnosc]||1;
    const timeMult  = czasSek < sesja.czas_limit_min*60*0.3 ? 1.5 : czasSek < sesja.czas_limit_min*60*0.6 ? 1.2 : 1;
    const deathMult = sesja.zgony===0 ? 1.3 : sesja.zgony<=2 ? 1.0 : 0.8;
    const expReward  = Math.round(sesja.exp_base  * mult * timeMult * deathMult);
    const goldReward = Math.round(sesja.gold_base * mult * timeMult * deathMult);

    // Nagrody dla wszystkich graczy
    const [players] = await db.query('SELECT postac_id FROM dungeon_gracze2 WHERE sesja_id=?',[sesja.id]);
    for (const p of players) {
      await db.query('UPDATE postac SET exp=exp+?, zloto=zloto+?, mapa=1, x=31, y=47 WHERE id=?',
        [expReward, goldReward, p.postac_id]);
      // Cooldown
      const cdExpiry = new Date(Date.now() + (COOLDOWN_HOURS[sesja.trudnosc]||4)*3600*1000);
      await db.query(
        'INSERT INTO dungeon_cooldowns(postac_id,dungeon_id,trudnosc,wygasa) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE wygasa=?',
        [p.postac_id, sesja.dungeon_id, sesja.trudnosc, cdExpiry, cdExpiry]
      );
      // Historia
      await db.query(
        'INSERT INTO dungeon_historia(postac_id,dungeon_id,trudnosc,wynik,czas_s,zgony,exp_zdobyte,gold_zdobyte) VALUES(?,?,?,?,?,?,?,?)',
        [p.postac_id, sesja.dungeon_id, sesja.trudnosc, rating, czasSek, sesja.zgony, expReward, goldReward]
      );
    }

    // Zamknij sesję
    await db.query(
      'UPDATE dungeon_sesje2 SET status=\'ukonczona\',czas_ukonczenia=?,wynik=? WHERE id=?',
      [czasSek, rating, sesja.id]
    );

    // Cleanup mapy
    await db.query('DELETE FROM blokadaprzejscia WHERE mapa=?',[sesja.mapa_id]);
    await db.query('DELETE FROM mob WHERE mapa=?',[sesja.mapa_id]);
    await db.query('DELETE FROM mapa WHERE id=?',[sesja.mapa_id]);

    res.json({ ok:true, rating, score, expReward, goldReward, czasSek, zgony:sesja.zgony,
      cele, players:players.length });
  } catch(e) { res.json({ ok:false, error: serverError(e, 'dungeons2') }); }
});

// ── POST /leave ───────────────────────────────────────────────────────────────
router.post('/leave', requireSession, async (req,res) => {
  try {
    const postacId = req.session.postacId;
    const [[sesja]] = await db.query(
      `SELECT ds.* FROM dungeon_sesje2 ds JOIN dungeon_gracze2 dg ON dg.sesja_id=ds.id
       WHERE dg.postac_id=? AND ds.status='aktywna' LIMIT 1`,
      [postacId]
    );
    if (sesja) {
      await db.query('DELETE FROM dungeon_gracze2 WHERE sesja_id=? AND postac_id=?',[sesja.id,postacId]);
      const [[cnt]] = await db.query('SELECT COUNT(*) as c FROM dungeon_gracze2 WHERE sesja_id=?',[sesja.id]);
      if ((cnt?.c||0)===0) {
        // Ostatni gracz wyszedł — usuń sesję i mapę
        await db.query("UPDATE dungeon_sesje2 SET status='nieudana' WHERE id=?",[sesja.id]);
        await db.query('DELETE FROM blokadaprzejscia WHERE mapa=?',[sesja.mapa_id]);
        await db.query('DELETE FROM mob WHERE mapa=?',[sesja.mapa_id]);
        await db.query('DELETE FROM mapa WHERE id=?',[sesja.mapa_id]);
      }
    }
    await db.query('UPDATE postac SET mapa=1,x=31,y=47 WHERE id=?',[postacId]);
    res.json({ ok:true });
  } catch(e) { res.json({ ok:false, error: serverError(e, 'dungeons2') }); }
});

// ── GET /history ──────────────────────────────────────────────────────────────
router.get('/history', requireSession, async (req,res) => {
  try {
    const [rows] = await db.query(
      `SELECT dh.*, dd.nazwa as dung_nazwa, dd.typ
       FROM dungeon_historia dh JOIN dungeon_def dd ON dd.id=dh.dungeon_id
       WHERE dh.postac_id=? ORDER BY dh.data DESC LIMIT 20`,
      [req.session.postacId]
    );
    res.json(rows);
  } catch(e) { res.json([]); }
});

// ── POST /report-death (wywołane po śmierci gracza w dungeonie) ───────────────
router.post('/report-death', requireSession, async (req,res) => {
  try {
    const postacId = req.session.postacId;
    const [[sesja]] = await db.query(
      `SELECT ds.id, ds.zgony FROM dungeon_sesje2 ds JOIN dungeon_gracze2 dg ON dg.sesja_id=ds.id
       WHERE dg.postac_id=? AND ds.status='aktywna' LIMIT 1`,
      [postacId]
    );
    if (!sesja) return res.json({ ok:false });
    await db.query('UPDATE dungeon_sesje2 SET zgony=zgony+1 WHERE id=?',[sesja.id]);
    await db.query('UPDATE dungeon_gracze2 SET zgony=zgony+1 WHERE sesja_id=? AND postac_id=?',[sesja.id,postacId]);
    const newZgony = (sesja.zgony||0)+1;
    // Respawn w dungeonie przy wejściu
    const [[s2]] = await db.query('SELECT mapa_id FROM dungeon_sesje2 WHERE id=?',[sesja.id]);
    if (s2) await db.query('UPDATE postac SET zycie=FLOOR(zycie_max*0.5),mapa=?,x=1,y=1 WHERE id=?',
      [s2.mapa_id, postacId]);
    res.json({ ok:true, zgony:newZgony });
  } catch(e) { res.json({ ok:false }); }
});

module.exports = router;
