// Zawartość na poziomy 1–10: przedmioty, paczki łupów, zaopatrzenie sklepów,
// surowce z naszych mobów i kapłanka lecząca w osadzie.
//
// Skrypt jest idempotentny — można go puszczać wielokrotnie.
// Uruchamiaj z katalogu projektu:  node server/src/migrations/start_1_10.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true });
const db = require('../db');

const MAPA = 'Osada Veldoria';

// ── Przedmioty 1–10 ──────────────────────────────────────────────────────────
// [nazwa, typ, obrazek, poziom, rzadkość, cena, {statystyki}, [klasy]]
// Klasy: pusta lista = dla każdego. prof1 Wojownik, prof2 Paladyn,
// prof3 Tancerz Ostrzy, prof4 Lowca, prof5 Tropiciel, prof6 Mag.
const PRZEDMIOTY = [
  // poziom 1 — to, w czym zaczyna się przygodę
  ['Drewniany Miecz',     'BronJednoreczna', 'przedmiot/lhand/bj1.gif',    1, 'normal',   18,  { obr_min: 2, obr_max: 4 },                        ['prof1', 'prof2', 'prof3']],
  ['Wierzbowa Różdżka',   'Rozdzka',         'przedmiot/roz/1.gif',        1, 'normal',   18,  { obr_mag: 3, intelekt: 1 },                       ['prof6']],
  ['Prosty Łuk',          'BronDystansowa',  'przedmiot/lhand/luk1.gif',   1, 'normal',   18,  { obr_min: 2, obr_max: 5 },                        ['prof4', 'prof5']],
  ['Lniana Koszula',      'Zbroja',          'przedmiot/armor/1.gif',      1, 'normal',   14,  { ac: 3 },                                         []],
  ['Skórzany Kaptur',     'Helm',            'przedmiot/cap/1.gif',        1, 'normal',   12,  { ac: 2 },                                         []],
  ['Chodaki',             'Buty',            'przedmiot/but/1.gif',        1, 'normal',   10,  { ac: 1 },                                         []],
  ['Rzemienne Rękawice',  'Rekawice',        'przedmiot/rek/1.gif',        1, 'normal',   10,  { ac: 1 },                                         []],

  // poziom 3
  ['Żelazny Sztylet',     'BronJednoreczna', 'przedmiot/lhand/bj2.gif',    3, 'normal',   60,  { obr_min: 3, obr_max: 6, zrecznosc: 1 },          ['prof1', 'prof3', 'prof4', 'prof5']],
  ['Kij Wędrowca',        'Laska',           'przedmiot/roz/2.gif',        3, 'normal',   60,  { obr_mag: 5, intelekt: 1 },                       ['prof6']],
  ['Łuk Myśliwski',       'BronDystansowa',  'przedmiot/lhand/luk2.gif',   3, 'normal',   60,  { obr_min: 3, obr_max: 7 },                        ['prof4', 'prof5']],
  ['Skórzany Kaftan',     'Zbroja',          'przedmiot/armor/2.gif',      3, 'normal',   52,  { ac: 6, zycie: 5 },                               []],
  ['Hełm Skórzany',       'Helm',            'przedmiot/cap/2.gif',        3, 'normal',   40,  { ac: 4 },                                         []],
  ['Buty Traperskie',     'Buty',            'przedmiot/but/2.gif',        3, 'normal',   38,  { ac: 3, unik: 1 },                                []],
  ['Tarcza Drewniana',    'Tarcza',          'przedmiot/rhand/mtarcza1.gif', 3, 'normal', 46,  { ac: 5, blok: 2 },                                ['prof1', 'prof2', 'prof5']],

  // poziom 5
  ['Miecz Strażnika',     'BronJednoreczna', 'przedmiot/lhand/bj3.gif',    5, 'upgraded', 150, { obr_min: 5, obr_max: 9, sila: 2 },               ['prof1', 'prof2', 'prof3']],
  ['Laska Iskry',         'Laska',           'przedmiot/roz/3.gif',        5, 'upgraded', 150, { obr_mag: 8, intelekt: 2 },                       ['prof6']],
  ['Łuk Leśnika',         'BronDystansowa',  'przedmiot/lhand/luk3.gif',   5, 'upgraded', 150, { obr_min: 5, obr_max: 10, zrecznosc: 2 },         ['prof4', 'prof5']],
  ['Lekka Kolczuga',      'Zbroja',          'przedmiot/armor/3.gif',      5, 'upgraded', 130, { ac: 10, zycie: 10 },                             []],
  ['Hełm Kolczy',         'Helm',            'przedmiot/cap/3.gif',        5, 'upgraded', 105, { ac: 7 },                                         []],
  ['Buty Wzmocnione',     'Buty',            'przedmiot/but/3.gif',        5, 'upgraded', 100, { ac: 5, zycie: 4 },                               []],
  ['Naszyjnik Wilka',     'Naszyjnik',       'przedmiot/nas/1.gif',        5, 'upgraded', 120, { zycie: 12, sila: 1 },                            []],
  ['Pierścień Celności',  'Pierscien',       'przedmiot/pie/24_1.gif',     5, 'upgraded', 120, { sa: 5, ck: 2 },                                  []],

  // poziom 7
  ['Topór Osady',         'BronJednoreczna', 'przedmiot/lhand/bj4.gif',    7, 'upgraded', 300, { obr_min: 7, obr_max: 13, sila: 3 },              ['prof1', 'prof2']],
  ['Różdżka Mroźna',      'Rozdzka',         'przedmiot/roz/4.gif',        7, 'upgraded', 300, { obr_mag: 12, intelekt: 3 },                      ['prof6']],
  ['Kusza Zwiadowcy',     'BronDystansowa',  'przedmiot/lhand/kusza1.gif', 7, 'upgraded', 300, { obr_min: 7, obr_max: 14, zrecznosc: 2 },         ['prof4', 'prof5']],
  ['Zbroja Łuskowa',      'Zbroja',          'przedmiot/armor/4.gif',      7, 'upgraded', 265, { ac: 15, zycie: 15 },                             []],
  ['Hełm Rycerski',       'Helm',            'przedmiot/cap/4.gif',        7, 'upgraded', 215, { ac: 10, zycie: 5 },                              []],
  ['Tarcza Herbowa',      'Tarcza',          'przedmiot/rhand/mtarcza1.gif', 7, 'upgraded', 240, { ac: 9, blok: 4 },                              ['prof1', 'prof2', 'prof5']],

  // poziom 10 — nagroda za przejście przedziału
  ['Miecz Veldorii',      'BronJednoreczna', 'przedmiot/lhand/bj5.gif',   10, 'unique',   620, { obr_min: 10, obr_max: 18, sila: 4, ck: 3 },      ['prof1', 'prof2', 'prof3']],
  ['Laska Arcymaga',      'Laska',           'przedmiot/roz/5.gif',       10, 'unique',   620, { obr_mag: 18, intelekt: 5 },                      ['prof6']],
  ['Łuk Sokolego Oka',    'BronDystansowa',  'przedmiot/lhand/luk4.gif',  10, 'unique',   620, { obr_min: 10, obr_max: 19, zrecznosc: 4, sa: 5 }, ['prof4', 'prof5']],
  ['Napierśnik Stali',    'Zbroja',          'przedmiot/armor/5.gif',     10, 'unique',   560, { ac: 22, zycie: 25 },                             []],
  ['Amulet Świtu',        'Naszyjnik',       'przedmiot/nas/2.gif',       10, 'unique',   520, { zycie: 20, wszystkie_cechy: 1 },                 []],
];

// ── Paczki łupów: gatunek moba → przedmioty z wagami ────────────────────────
const PACZKI = [
  { id: 101, mob: 'Dziki Królik', wpisy: [['Drewniany Miecz', 10], ['Lniana Koszula', 12], ['Chodaki', 14], ['Rzemienne Rękawice', 14], ['Skórzany Kaptur', 10], ['Wierzbowa Różdżka', 8], ['Prosty Łuk', 8]] },
  { id: 102, mob: 'Polny Szczur', wpisy: [['Skórzany Kaptur', 12], ['Rzemienne Rękawice', 12], ['Żelazny Sztylet', 8], ['Lniana Koszula', 10], ['Buty Traperskie', 8], ['Prosty Łuk', 8]] },
  { id: 103, mob: 'Leśny Pająk',  wpisy: [['Kij Wędrowca', 8], ['Buty Traperskie', 10], ['Tarcza Drewniana', 9], ['Skórzany Kaftan', 9], ['Żelazny Sztylet', 8], ['Łuk Myśliwski', 7]] },
  { id: 104, mob: 'Szary Wilk',   wpisy: [['Miecz Strażnika', 6], ['Lekka Kolczuga', 7], ['Naszyjnik Wilka', 8], ['Hełm Skórzany', 9], ['Skórzany Kaftan', 9], ['Buty Wzmocnione', 7]] },
  { id: 105, mob: 'Leśna Żmija',  wpisy: [['Laska Iskry', 6], ['Hełm Kolczy', 7], ['Pierścień Celności', 7], ['Łuk Leśnika', 6], ['Lekka Kolczuga', 7], ['Miecz Strażnika', 6]] },
];

// ── Zaopatrzenie sklepów ────────────────────────────────────────────────────
// Mara Kupcowa (sklep 1) — podstawowy sprzęt i tani prowiant.
const SKLEP_MARY = [
  'Drewniany Miecz', 'Wierzbowa Różdżka', 'Prosty Łuk', 'Lniana Koszula', 'Skórzany Kaptur',
  'Chodaki', 'Rzemienne Rękawice', 'Skórzany Kaftan', 'Hełm Skórzany', 'Buty Traperskie',
  'Tarcza Drewniana', 'Żelazny Sztylet', 'Kij Wędrowca', 'Łuk Myśliwski',
];
// Jarenia Zielarka (sklep 10) — prowiant na starcie, bo mikstury są za drogie
const PROWIANT = [
  ['Chleb Podróżny',  'przedmiot/pot/mikstura2.gif', 9,  30],
  ['Suszone Mięso',   'przedmiot/pot/mikstura3.gif', 22, 80],
];

// Surowce z naszych gatunków (rzemiosło ma z czego korzystać)
const SUROWCE = [
  ['Dziki Królik', 4, 35], ['Polny Szczur', 1, 40], ['Leśny Pająk', 9, 45],
  ['Szary Wilk', 5, 40], ['Leśna Żmija', 7, 45],
];

const flagi = (klasy) => {
  const o = { prof1: 0, prof2: 0, prof3: 0, prof4: 0, prof5: 0, prof6: 0 };
  for (const k of klasy) o[k] = 1;
  return o;
};

async function wstawPrzedmioty() {
  const idki = {};
  for (const [nazwa, typ, obrazek, poziom, klasa, cena, staty, klasy] of PRZEDMIOTY) {
    const f = flagi(klasy);
    const pola = {
      nazwa, klasa, typ, obrazek, wym_poziom: poziom,
      wartosc_kupna: cena, wartosc_sprzedazy: Math.max(1, Math.round(cena * 0.25)),
      opis: '', ...f, ...staty,
    };
    const [[jest]] = await db.query('SELECT id FROM przedmiot_loot WHERE nazwa=? LIMIT 1', [nazwa]);
    if (jest) {
      const set = Object.keys(pola).map(k => `${k}=?`).join(',');
      await db.query(`UPDATE przedmiot_loot SET ${set} WHERE id=?`, [...Object.values(pola), jest.id]);
      idki[nazwa] = jest.id;
    } else {
      const kol = Object.keys(pola).join(',');
      const zn = Object.keys(pola).map(() => '?').join(',');
      const [r] = await db.query(`INSERT INTO przedmiot_loot (${kol}) VALUES (${zn})`, Object.values(pola));
      idki[nazwa] = r.insertId;
    }
  }
  console.log(`Przedmioty 1–10: ${Object.keys(idki).length}`);
  return idki;
}

async function wstawPaczki(idki) {
  let wpisow = 0;
  for (const paczka of PACZKI) {
    await db.query('DELETE FROM paczka_przedmiot WHERE paczka_id=?', [paczka.id]);
    for (const [nazwa, waga] of paczka.wpisy) {
      if (!idki[nazwa]) { console.warn('  brak przedmiotu:', nazwa); continue; }
      await db.query('INSERT INTO paczka_przedmiot (paczka_id,przedmiot_id,szansa) VALUES (?,?,?)',
        [paczka.id, idki[nazwa], waga]);
      wpisow++;
    }
    const [r] = await db.query('UPDATE mob SET paczka=? WHERE nazwa=?', [paczka.id, paczka.mob]);
    console.log(`  paczka ${paczka.id} (${paczka.mob}): ${paczka.wpisy.length} poz., mobów: ${r.affectedRows}`);
  }
  console.log(`Wpisów w paczkach: ${wpisow}`);
}

async function zaopatrzSklepy() {
  // sprzęt u Mary — kasujemy tylko to, co sami wstawiamy, mikstur nie ruszamy
  await db.query('DELETE FROM przedmiot_sklep WHERE sklep=1 AND nazwa IN (?)', [SKLEP_MARY]);
  let ile = 0;
  for (const nazwa of SKLEP_MARY) {
    const [[wzor]] = await db.query('SELECT * FROM przedmiot_loot WHERE nazwa=? LIMIT 1', [nazwa]);
    if (!wzor) continue;
    const { id: _id, ...reszta } = wzor;
    const pola = { ...reszta, sklep: 1, poz_x: 0, poz_y: 0, ilosc: 0, sl: 0 };
    const kol = Object.keys(pola).join(',');
    const zn = Object.keys(pola).map(() => '?').join(',');
    await db.query(`INSERT INTO przedmiot_sklep (${kol}) VALUES (${zn})`, Object.values(pola));
    ile++;
  }
  console.log(`Sklep Mary: ${ile} pozycji sprzętu`);

  for (const [nazwa, obrazek, cena, leczy] of PROWIANT) {
    const [[jest]] = await db.query('SELECT id FROM przedmiot_sklep WHERE sklep=10 AND nazwa=? LIMIT 1', [nazwa]);
    const pola = {
      sklep: 10, nazwa, klasa: 'normal', typ: 'Konsupcyjne', obrazek, wym_poziom: 0,
      wartosc_kupna: cena, wartosc_sprzedazy: Math.round(cena * 0.25), mikstura_leczenie: leczy,
      poz_x: 0, poz_y: 0, ilosc: 0, sl: 0,
    };
    if (jest) {
      const set = Object.keys(pola).map(k => `${k}=?`).join(',');
      await db.query(`UPDATE przedmiot_sklep SET ${set} WHERE id=?`, [...Object.values(pola), jest.id]);
    } else {
      const kol = Object.keys(pola).join(',');
      const zn = Object.keys(pola).map(() => '?').join(',');
      await db.query(`INSERT INTO przedmiot_sklep (${kol}) VALUES (${zn})`, Object.values(pola));
    }
  }
  console.log(`Jarenia: prowiant (${PROWIANT.map(p => p[0]).join(', ')})`);
}

async function surowceMobow() {
  for (const [mob, surowiec, szansa] of SUROWCE) {
    await db.query('DELETE FROM mob_surowce WHERE mob_nazwa=?', [mob]);
    await db.query('INSERT INTO mob_surowce (mob_nazwa,surowiec_id,szansa) VALUES (?,?,?)', [mob, surowiec, szansa]);
  }
  console.log(`Surowce przypisane do ${SUROWCE.length} gatunków`);
}

async function kaplanka(mapId) {
  const [[jest]] = await db.query('SELECT id FROM npc WHERE mapa=? AND typ=3 LIMIT 1', [mapId]);
  if (jest) { console.log('Kapłanka już stoi w osadzie'); return; }
  await db.query(
    `INSERT INTO npc (obrazek,mapa,x,y,shop,nazwa,poziom,typ,procentodsprzedazy,szerokosc,dlugosc,cena,max_sprzedaz)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ['npc/makatara.gif', mapId, 35, 27, 0, 'Kapłanka Elara', 10, 3, 100, 32, 48, 100, 15000]);
  console.log('Dodano Kapłankę Elarę (leczenie) na rynku');
}

async function main() {
  const [[mapa]] = await db.query('SELECT id FROM mapa WHERE nazwa=? LIMIT 1', [MAPA]);
  if (!mapa) throw new Error(`Nie ma mapy „${MAPA}"`);

  const idki = await wstawPrzedmioty();
  await wstawPaczki(idki);
  await zaopatrzSklepy();
  await surowceMobow();
  await kaplanka(mapa.id);

  // ustawienia ekonomii — łatwo podkręcić bez zmiany kodu
  for (const [k, v] of Object.entries({ drop_base: '0.34', gold_mult: '1' })) {
    await db.query(
      'INSERT INTO server_config (config_key, config_value) VALUES (?,?) ON DUPLICATE KEY UPDATE config_value=VALUES(config_value)',
      [k, v]);
  }
  console.log('Gotowe. Zrestartuj serwer, żeby odświeżyć pamięć map i konfigurację.');
}

main().then(() => process.exit(0)).catch(e => { console.error('Nieudane:', e.message); process.exit(1); });
