// Moby na poziomy 6–10 wokół osady + ich łupy.
// Dostawiamy je do istniejącej mapy, nie ruszając tego, co już na niej stoi.
//
// Uruchamiaj z katalogu projektu:  node server/src/migrations/moby_6_10.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true });
const db = require('../db');

const MAPA = 'Osada Veldoria';

// [nazwa, poziom, obrazek, ile sztuk, obszar x0,y0,x1,y1, paczka łupu]
const GATUNKI = [
  ['Leśny Zbójca',    6,  'mob/goblin1.gif',     8, [18, 48, 34, 60], 106],
  ['Górski Jeż',      7,  'mob/jez.gif',         8, [4, 20, 14, 40],  107],
  ['Czarny Wilk',     8,  'mob/czarny-wilk.gif', 7, [46, 38, 60, 54], 108],
  ['Nocny Pająk',     9,  'mob/nocny-pajak.gif', 7, [50, 6, 62, 22],  109],
  ['Skorpion Pustki', 10, 'mob/skorpion.gif',    6, [44, 52, 62, 62], 110],
];

// Co wypada z nowych gatunków (przedmioty z migracji start_1_10)
const LUPY = {
  106: [['Skórzany Kaftan', 10], ['Buty Traperskie', 10], ['Miecz Strażnika', 7], ['Hełm Skórzany', 9], ['Tarcza Drewniana', 8]],
  107: [['Lekka Kolczuga', 9], ['Hełm Kolczy', 9], ['Buty Wzmocnione', 9], ['Naszyjnik Wilka', 7], ['Łuk Leśnika', 6]],
  108: [['Topór Osady', 6], ['Zbroja Łuskowa', 8], ['Pierścień Celności', 8], ['Różdżka Mroźna', 6], ['Hełm Rycerski', 8]],
  109: [['Kusza Zwiadowcy', 6], ['Tarcza Herbowa', 8], ['Zbroja Łuskowa', 8], ['Hełm Rycerski', 8], ['Laska Iskry', 6]],
  110: [['Miecz Veldorii', 3], ['Laska Arcymaga', 3], ['Łuk Sokolego Oka', 3], ['Napierśnik Stali', 4], ['Amulet Świtu', 4], ['Topór Osady', 8]],
};

const staty = (lvl) => ({
  zycie: 30 + lvl * 18, sa: 88 + lvl, ac: lvl * 3,
  obr_min: 2 + lvl * 2, obr_max: 4 + lvl * 3,
  exp: 8 + lvl * 7, respawn_time: 50 + lvl * 6,
});

async function main() {
  const [[mapa]] = await db.query('SELECT id, maks_x, maks_y FROM mapa WHERE nazwa=? LIMIT 1', [MAPA]);
  if (!mapa) throw new Error(`Nie ma mapy „${MAPA}"`);

  // pola zajęte: kolizje, NPC i moby, które już stoją
  const [blok] = await db.query('SELECT x,y FROM blokadaprzejscia WHERE mapa=?', [mapa.id]);
  const [npc] = await db.query('SELECT x,y FROM npc WHERE mapa=?', [mapa.id]);
  const [moby] = await db.query('SELECT x,y FROM mob WHERE mapa=?', [mapa.id]);
  const zajete = new Set([...blok, ...npc, ...moby].map(r => `${r.x},${r.y}`));

  let ziarno = 20260929;
  const los = () => { ziarno = (ziarno * 1103515245 + 12345) % 2147483648; return ziarno / 2147483648; };
  const losInt = (a, b) => a + Math.floor(los() * (b - a + 1));

  let dodane = 0;
  for (const [nazwa, poziom, obrazek, ile, [x0, y0, x1, y1], paczka] of GATUNKI) {
    const [[jest]] = await db.query('SELECT COUNT(*) c FROM mob WHERE mapa=? AND nazwa=?', [mapa.id, nazwa]);
    if (jest.c > 0) { console.log(`  ${nazwa}: już stoi (${jest.c} szt.) — pomijam`); continue; }
    const s = staty(poziom);
    let postawione = 0, prob = 0;
    while (postawione < ile && prob < 800) {
      prob++;
      const x = losInt(x0, x1), y = losInt(y0, y1);
      if (x < 1 || y < 1 || x >= mapa.maks_x || y >= mapa.maks_y) continue;
      if (zajete.has(`${x},${y}`)) continue;
      await db.query(
        `INSERT INTO mob (obrazek,mapa,x,y,nazwa,poziom,typ,szerokosc,dlugosc,zycie,zycie_max,sa,ac,acm,obr_min,obr_max,exp,respawn_time,respawn,paczka)
         VALUES (?,?,?,?,?,?,0,32,32,?,?,?,?,0,?,?,?,?,0,?)`,
        [obrazek, mapa.id, x, y, nazwa, poziom, s.zycie, s.zycie, s.sa, s.ac, s.obr_min, s.obr_max, s.exp, s.respawn_time, paczka]);
      zajete.add(`${x},${y}`);
      postawione++; dodane++;
    }
    console.log(`  ${nazwa} (${poziom} lv): ${postawione} szt., exp ${s.exp}, HP ${s.zycie}`);
  }
  console.log(`Dodano mobów: ${dodane}`);

  for (const [paczka, wpisy] of Object.entries(LUPY)) {
    await db.query('DELETE FROM paczka_przedmiot WHERE paczka_id=?', [paczka]);
    let ok = 0;
    for (const [nazwa, waga] of wpisy) {
      const [[it]] = await db.query('SELECT id FROM przedmiot_loot WHERE nazwa=? LIMIT 1', [nazwa]);
      if (!it) { console.warn('  brak przedmiotu:', nazwa); continue; }
      await db.query('INSERT INTO paczka_przedmiot (paczka_id,przedmiot_id,szansa) VALUES (?,?,?)', [paczka, it.id, waga]);
      ok++;
    }
    console.log(`  paczka ${paczka}: ${ok} pozycji`);
  }

  const [[ile]] = await db.query('SELECT COUNT(*) c FROM mob WHERE mapa=?', [mapa.id]);
  console.log(`Mobów na mapie łącznie: ${ile.c}`);
}

main().then(() => process.exit(0)).catch(e => { console.error('Nieudane:', e.message); process.exit(1); });
