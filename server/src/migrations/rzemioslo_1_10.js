// Rzemiosło na poziomy 1–10: surowce z nowych gatunków + receptury na sprzęt,
// który do tej pory można było zdobyć wyłącznie z łupu albo od kupca.
//
// Uruchamiaj z katalogu projektu:  node server/src/migrations/rzemioslo_1_10.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true });
const db = require('../db');

// Surowce z mobów 6–10 — bez tego od 6 poziomu craft stoi w miejscu
const SUROWCE_Z_MOBOW = [
  ['Leśny Zbójca', 'Skóra Goblina', 55],
  ['Górski Jeż', 'Kość Szczura', 50],
  ['Czarny Wilk', 'Zęby Wilka', 55],
  ['Nocny Pająk', 'Pazur Pająka', 55],
  ['Skorpion Pustki', 'Łuska Żmii', 50],
];

// [nazwa receptury, przedmiot wynikowy, wymagany poziom, opis, składniki…]
const RECEPTURY = [
  ['Szycie kaftana', 'Skórzany Kaftan', 3, 'Twarda skóra zszyta rzemieniem — podstawa każdego osadnika.',
    [['Skóra Goblina', 4], ['Kość Szczura', 2]]],
  ['Wyprawa hełmu', 'Hełm Skórzany', 3, 'Skóra napięta na drewnianym stelażu.',
    [['Skóra Goblina', 3], ['Pazur Pająka', 1]]],
  ['Buty traperskie', 'Buty Traperskie', 3, 'Podeszwa z łusek trzyma się długo na kamieniach.',
    [['Skóra Goblina', 3], ['Łuska Żmii', 2]]],
  ['Tarcza z desek', 'Tarcza Drewniana', 3, 'Deski spięte kością — tanio i skutecznie.',
    [['Kość Szczura', 2], ['Pazur Pająka', 2]]],
  ['Naszyjnik z kłów', 'Naszyjnik Wilka', 5, 'Kły wilka na rzemieniu. Wataha wyczuwa to z daleka.',
    [['Zęby Wilka', 5], ['Kryształ Magii', 1]]],
  ['Pierścień celności', 'Pierścień Celności', 5, 'Pióro orła zatopione w krysztale.',
    [['Pióro Orła', 3], ['Kryształ Magii', 1]]],
  ['Plecenie kolczugi', 'Lekka Kolczuga', 5, 'Kółka wyklepane z tego, co zostało po zbójcach.',
    [['Skóra Goblina', 6], ['Zęby Wilka', 3], ['Kość Szczura', 2]]],
  ['Hełm kolczy', 'Hełm Kolczy', 5, 'Kaptur z drobnych kółek, lekki jak czapka.',
    [['Skóra Goblina', 4], ['Zęby Wilka', 2]]],
  ['Zbroja łuskowa', 'Zbroja Łuskowa', 7, 'Łuski żmij naszyte na skórę — giętkie i twarde.',
    [['Łuska Żmii', 8], ['Pazur Pająka', 3], ['Kryształ Magii', 2]]],
  ['Tarcza herbowa', 'Tarcza Herbowa', 7, 'Okuta tarcza z herbem osady.',
    [['Kość Szczura', 5], ['Zęby Wilka', 3], ['Kryształ Magii', 1]]],
  ['Amulet Świtu', 'Amulet Świtu', 10, 'Kryształy zestrojone o świcie. Wieńczy drogę osadnika.',
    [['Kryształ Magii', 3], ['Pióro Orła', 5], ['Pazur Pająka', 5]]],
];

async function main() {
  const [surowce] = await db.query('SELECT id, nazwa FROM surowce');
  const idSurowca = Object.fromEntries(surowce.map(s => [s.nazwa, s.id]));

  let dodaneSurowce = 0;
  for (const [mob, surowiec, szansa] of SUROWCE_Z_MOBOW) {
    const sid = idSurowca[surowiec];
    if (!sid) { console.warn(`  brak surowca „${surowiec}"`); continue; }
    const [[jest]] = await db.query(
      'SELECT COUNT(*) c FROM mob_surowce WHERE mob_nazwa=? AND surowiec_id=?', [mob, sid]);
    if (jest.c) { console.log(`  ${mob} → ${surowiec}: już jest`); continue; }
    await db.query('INSERT INTO mob_surowce (mob_nazwa, surowiec_id, szansa) VALUES (?,?,?)',
      [mob, sid, szansa]);
    dodaneSurowce++;
    console.log(`  ${mob} → ${surowiec} (${szansa}%)`);
  }
  console.log(`Nowych wpisów mob→surowiec: ${dodaneSurowce}`);

  let dodane = 0, pominiete = 0;
  for (const [nazwa, przedmiot, poziom, opis, skladniki] of RECEPTURY) {
    const [[item]] = await db.query('SELECT id FROM przedmiot_loot WHERE nazwa=? LIMIT 1', [przedmiot]);
    if (!item) { console.warn(`  brak przedmiotu „${przedmiot}" — pomijam recepturę`); pominiete++; continue; }

    const braki = skladniki.filter(([s]) => !idSurowca[s]).map(([s]) => s);
    if (braki.length) { console.warn(`  ${nazwa}: brak surowców ${braki.join(', ')}`); pominiete++; continue; }

    let [[rec]] = await db.query('SELECT id FROM receptury WHERE nazwa=? LIMIT 1', [nazwa]);
    if (rec) {
      await db.query('UPDATE receptury SET przedmiot_wynikowy_id=?, wymagany_poziom=?, opis=?, aktywna=1 WHERE id=?',
        [item.id, poziom, opis, rec.id]);
    } else {
      const [r] = await db.query(
        `INSERT INTO receptury (nazwa, opis, przedmiot_wynikowy_id, wynik_ilosc, wymagany_poziom, czas_craftu_s, aktywna)
         VALUES (?,?,?,1,?,0,1)`, [nazwa, opis, item.id, poziom]);
      rec = { id: r.insertId };
      dodane++;
    }

    await db.query('DELETE FROM receptury_skladniki WHERE receptura_id=?', [rec.id]);
    for (const [surowiec, ilosc] of skladniki) {
      await db.query('INSERT INTO receptury_skladniki (receptura_id, surowiec_id, ilosc) VALUES (?,?,?)',
        [rec.id, idSurowca[surowiec], ilosc]);
    }
    console.log(`  ${poziom} lv  ${nazwa} → ${przedmiot}  (${skladniki.map(([s, i]) => `${i}× ${s}`).join(', ')})`);
  }

  const [[ile]] = await db.query('SELECT COUNT(*) c FROM receptury WHERE aktywna=1');
  console.log(`Nowych receptur: ${dodane}, pominiętych: ${pominiete}, aktywnych w bazie: ${ile.c}`);
}

main().then(() => process.exit(0)).catch(e => { console.error('Nieudane:', e.message); process.exit(1); });
