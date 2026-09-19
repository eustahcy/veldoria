const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const db = require('../db');

const MAP_NAME = 'Veldoria - Miasto';
const IMAGE_REL = 'mapy/veldoria-miasto.png';
// Grafiki gry leżą w <projekt>/original/MAEGONEM_pliki (na VPS: wolumen /app/original/MAEGONEM_pliki)
const IMAGE_PATH = path.join(__dirname, '../../../original/MAEGONEM_pliki', IMAGE_REL);
const COLLISIONS_PATH = path.join(__dirname, 'veldoria-collisions.json');

const NPCS = [
  { obrazek:'npc/teleporter.gif', x:31, y:18, shop:0, nazwa:'Mistrz Portali', poziom:50 },
  { obrazek:'npc/makatara.gif',   x:13, y:21, shop:1, nazwa:'Mira Handlarka', poziom:18 },
  { obrazek:'npc/garus.gif',      x:53, y:17, shop:7, nazwa:'Garus Tyrrak', poziom:100 },
  { obrazek:'npc/straznik.gif',   x:32, y:25, shop:0, nazwa:'Strażnik Veldorii', poziom:40 },
  { obrazek:'npc/psorkajarenia.gif', x:48, y:24, shop:10, nazwa:'Jarenia Zielarka', poziom:43 },
  { obrazek:'npc/unil.gif',       x:20, y:21, shop:0, nazwa:'Unil', poziom:25 },
];

const MOBS = [
  { obrazek:'mob/pajak.gif',      x:18, y:58, nazwa:'Leśny Pająk', poziom:5,  hp:90,  min:6,  max:10, exp:12 },
  { obrazek:'mob/szczur.gif',     x:25, y:68, nazwa:'Dziki Szczur', poziom:6,  hp:105, min:7,  max:12, exp:14 },
  { obrazek:'mob/szary-wilk.gif', x:39, y:62, nazwa:'Szary Wilk', poziom:8,  hp:140, min:10, max:16, exp:20 },
  { obrazek:'mob/zajac.gif',      x:50, y:73, nazwa:'Dziki Zając', poziom:3,  hp:55,  min:4,  max:7,  exp:8 },
  { obrazek:'mob/zmija.gif',      x:20, y:83, nazwa:'Leśna Żmija', poziom:10, hp:175, min:13, max:20, exp:26 },
  { obrazek:'mob/czarny-wilk.gif',x:42, y:87, nazwa:'Czarny Wilk', poziom:12, hp:220, min:16, max:24, exp:34 },
  { obrazek:'mob/z-ork1.gif',     x:55, y:91, nazwa:'Ork Pogranicza', poziom:15, hp:280, min:20, max:30, exp:45 },
];

const PORTALS = [
  { x:31, y:39, do_mapa:1, do_x:35, do_y:90 },
  { x:58, y:55, do_mapa:6, do_x:10, do_y:40 },
];

async function main() {
  if (!fs.existsSync(IMAGE_PATH)) throw new Error(`Brak mapy: ${IMAGE_PATH}`);
  if (!fs.existsSync(COLLISIONS_PATH)) throw new Error(`Brak kolizji: ${COLLISIONS_PATH}`);

  const collisions = JSON.parse(fs.readFileSync(COLLISIONS_PATH, 'utf8'));
  if (!Array.isArray(collisions)) throw new Error('Nieprawidłowy plik kolizji');

  const [existing] = await db.query('SELECT id FROM mapa WHERE nazwa=? LIMIT 1', [MAP_NAME]);
  let mapId;

  if (existing.length) {
    mapId = existing[0].id;
    await db.query(
      `UPDATE mapa SET pvp=0, obrazek=?, maks_x=63, maks_y=95, dead_map=?, dead_x=32, dead_y=42 WHERE id=?`,
      [IMAGE_REL, mapId, mapId]
    );
    console.log(`Mapa "${MAP_NAME}" już istnieje — aktualizuję ID ${mapId}.`);
  } else {
    const [r] = await db.query(
      `INSERT INTO mapa (nazwa,pvp,obrazek,maks_x,maks_y,dead_map,dead_x,dead_y)
       VALUES (?,?,?,?,?,?,?,?)`,
      [MAP_NAME, 0, IMAGE_REL, 63, 95, 1, 32, 42]
    );
    mapId = r.insertId;
    await db.query('UPDATE mapa SET dead_map=? WHERE id=?', [mapId, mapId]);
    console.log(`Utworzono mapę "${MAP_NAME}" — ID ${mapId}.`);
  }

  try {
    await db.query('UPDATE mapa SET iso=0, kafle=NULL WHERE id=?', [mapId]);
  } catch (_) {}

  await db.query('DELETE FROM blokadaprzejscia WHERE mapa=?', [mapId]);
  await db.query('DELETE FROM mapa_przenies WHERE mapa=?', [mapId]);
  await db.query('DELETE FROM npc WHERE mapa=?', [mapId]);
  await db.query('DELETE FROM mob WHERE mapa=?', [mapId]);

  for (const b of collisions) {
    if (Number.isInteger(b.x) && Number.isInteger(b.y) && b.x >= 0 && b.x <= 63 && b.y >= 0 && b.y <= 95) {
      await db.query(
        'INSERT INTO blokadaprzejscia (mapa,x,y) VALUES (?,?,?)',
        [mapId, b.x, b.y]
      );
    }
  }

  for (const n of NPCS) {
    await db.query(
      `INSERT INTO npc
       (obrazek,mapa,x,y,shop,nazwa,poziom,typ,procentodsprzedazy,szerokosc,dlugosc,cena,max_sprzedaz)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [n.obrazek,mapId,n.x,n.y,n.shop,n.nazwa,n.poziom,0,100,32,48,100,15000]
    );
  }

  for (const m of MOBS) {
    await db.query(
      `INSERT INTO mob
       (obrazek,mapa,x,y,nazwa,poziom,typ,szerokosc,dlugosc,zycie,zycie_max,sa,ac,acm,obr_min,obr_max,exp,respawn_time,respawn)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [m.obrazek,mapId,m.x,m.y,m.nazwa,m.poziom,0,24,32,m.hp,m.hp,100,0,0,m.min,m.max,m.exp,60,0]
    );
  }

  for (const p of PORTALS) {
    await db.query(
      `INSERT INTO mapa_przenies
       (nazwa_mapy,mapa,x,y,do_mapa,do_x,do_y)
       VALUES (?,?,?,?,?,?,?)`,
      [MAP_NAME,mapId,p.x,p.y,p.do_mapa,p.do_x,p.do_y]
    );
  }

  // Wejście z Ithan (tuż pod miejscem, w które trafia się po wyjściu z Veldorii)
  await db.query('DELETE FROM mapa_przenies WHERE mapa=1 AND do_mapa=?', [mapId]);
  await db.query(
    'INSERT INTO mapa_przenies (nazwa_mapy,mapa,x,y,do_mapa,do_x,do_y) VALUES (?,?,?,?,?,?,?)',
    ['Ithan', 1, 35, 91, mapId, 31, 37]
  );

  console.log(`Gotowe: ${collisions.length} pól kolizji, ${NPCS.length} NPC, ${MOBS.length} mobów, ${PORTALS.length} przejścia.`);
  console.log(`ID mapy: ${mapId}`);
  console.log(`Nazwa pliku: ${IMAGE_REL}`);
  console.log(`Teleport z mapy: ${mapId} 31,39 -> Ithan 1 35,90`);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Instalacja Veldorii nieudana:', err);
    process.exit(1);
  });
