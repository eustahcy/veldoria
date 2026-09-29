// Łańcuch zadań „Droga Osadnika" na poziomy 1–10 plus dwa zadania dzienne.
// Zadania typu kill celują w GATUNEK moba (kolumna cel_wartosc), a nie w jedną sztukę.
//
// Uruchamiaj z katalogu projektu:  node server/src/migrations/questy_1_10.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true });
const db = require('../db');

const MAPA = 'Osada Veldoria';
const LANCUCH = 1;

// NPC po nazwie — id bierzemy z bazy, żeby skrypt przeżył przebudowę mapy
const N = {
  mara: 'Mara Kupcowa', jarenia: 'Jarenia Zielarka', straznik: 'Strażnik Bramy',
  unil: 'Unil Wędrowiec', galien: 'Sir Galien', kaplanka: 'Kapłanka Elara',
};

// [nazwa, poziom, typ, cel(gatunek|"x,y"), ilość, exp, złoto, nagroda, npcStart, npcKoniec, teksty…]
const ZADANIA = [
  {
    nazwa: 'Pierwsze kroki', poziom: 1, typ: 'location', cel: '32,35', ilosc: 1,
    exp: 25, zloto: 20, npc: 'straznik', koniec: 'straznik',
    opis: 'Strażnik radzi, byś poznał okolicę. Dojdź do południowej bramy osady.',
    start: 'Nowy w Veldorii? Zejdź na południe, do bramy — stamtąd zaczyna się cały świat. Wróć, jak zobaczysz trakt.',
    trakcie: 'Brama jest na południe od rynku, nie sposób jej przegapić.',
    koniecTekst: 'No proszę, żyjesz. To dobry początek. Weź parę groszy na zapas.',
  },
  {
    nazwa: 'Plaga królików', poziom: 1, typ: 'kill', cel: 'Dziki Królik', ilosc: 5,
    exp: 70, zloto: 45, npc: 'mara', koniec: 'mara',
    opis: 'Króliki wyjadają zapasy z targu. Przerzedź je — pięć sztuk wystarczy.',
    start: 'Te króliki zjadają mi pół straganu! Ubij pięć, a nie pożałujesz.',
    trakcie: 'Króliki kicają po łąkach na południe od murów.',
    koniecTekst: 'Odetchnęłam z ulgą. Masz, należy ci się.',
  },
  {
    nazwa: 'Szczury w spichlerzu', poziom: 2, typ: 'kill', cel: 'Polny Szczur', ilosc: 6,
    exp: 110, zloto: 70, nagroda: 'Skórzany Kaptur', npc: 'mara', koniec: 'mara',
    opis: 'Szczury dobrały się do zboża. Wybij sześć sztuk.',
    start: 'Po królikach przyszły szczury. Sześć sztuk i uznam, że mamy spokój.',
    trakcie: 'Szczury kręcą się przy polach na wschodzie.',
    koniecTekst: 'Weź ten kaptur — po deszczu docenisz.',
  },
  {
    nazwa: 'Pajęcze gniazdo', poziom: 3, typ: 'kill', cel: 'Leśny Pająk', ilosc: 6,
    exp: 160, zloto: 95, npc: 'unil', koniec: 'unil',
    opis: 'W zachodnim lesie zrobiło się gęsto od pajęczyn. Rozpraw się z sześcioma pająkami.',
    start: 'Nie przejdę tamtędy, wszędzie sieci. Sześć pająków mniej i trakt znów będzie mój.',
    trakcie: 'Pająki siedzą w zagajnikach na zachód od osady.',
    koniecTekst: 'Droga wolna. Trzymaj, zarobiłeś uczciwie.',
  },
  {
    nazwa: 'Wilcze kły', poziom: 4, typ: 'kill', cel: 'Szary Wilk', ilosc: 5,
    exp: 230, zloto: 130, nagroda: 'Naszyjnik Wilka', npc: 'galien', koniec: 'galien',
    opis: 'Wilki podchodzą pod zagrody. Ubij pięć sztuk.',
    start: 'Wilki zaczęły podchodzić pod chałupy. Pięć sztuk, a dam ci coś ze swojego.',
    trakcie: 'Wataha trzyma się południowych lasów.',
    koniecTekst: 'Noś to z honorem. Wilk szanuje tylko silniejszego.',
  },
  {
    nazwa: 'Żmije w trzcinach', poziom: 5, typ: 'kill', cel: 'Leśna Żmija', ilosc: 5,
    exp: 320, zloto: 180, npc: 'jarenia', koniec: 'jarenia',
    opis: 'Zbieranie ziół nad jeziorem stało się niebezpieczne. Przerzedź żmije.',
    start: 'Nad jeziorem aż się roi od żmij, a ja potrzebuję ziół. Pięć sztuk i będę spokojna.',
    trakcie: 'Żmije wygrzewają się przy trzcinach nad jeziorem.',
    koniecTekst: 'Nareszcie. Weź zapłatę i uważaj na siebie.',
  },
  {
    nazwa: 'Zbójcy na trakcie', poziom: 6, typ: 'kill', cel: 'Leśny Zbójca', ilosc: 6,
    exp: 430, zloto: 240, nagroda: 'Lekka Kolczuga', npc: 'straznik', koniec: 'straznik',
    opis: 'Na południowym trakcie rabują kupców. Rozgoń bandę — sześciu zbójców.',
    start: 'Kupcy skarżą się na zbójców z południa. Sześciu mniej i znów będzie spokój.',
    trakcie: 'Obozują przy trakcie na południe od osady.',
    koniecTekst: 'Dobra robota. Kolczugę zdjęliśmy z herszta — teraz twoja.',
  },
  {
    nazwa: 'Kolce z gór', poziom: 7, typ: 'kill', cel: 'Górski Jeż', ilosc: 6,
    exp: 560, zloto: 320, npc: 'jarenia', koniec: 'jarenia',
    opis: 'Kolce górskich jeży to składnik maści. Przynieś ślad po sześciu.',
    start: 'Potrzebuję kolców. Sześć jeży z zachodnich wzgórz i mamy interes.',
    trakcie: 'Jeże żerują na zachodnich zboczach.',
    koniecTekst: 'Wystarczy na całą zimę. Dziękuję.',
  },
  {
    nazwa: 'Czarne wilki', poziom: 8, typ: 'kill', cel: 'Czarny Wilk', ilosc: 6,
    exp: 720, zloto: 420, nagroda: 'Hełm Rycerski', npc: 'galien', koniec: 'galien',
    opis: 'Za polami grasuje czarna wataha. Sześć sztuk.',
    start: 'Czarne wilki to nie zwykłe zwierzęta. Jeśli dasz radę sześciu, dostaniesz mój stary hełm.',
    trakcie: 'Wataha trzyma się pól i lasów na wschodzie.',
    koniecTekst: 'Zasłużyłeś. Hełm już mi nie pasuje, a tobie posłuży.',
  },
  {
    nazwa: 'Nocne łowy', poziom: 9, typ: 'kill', cel: 'Nocny Pająk', ilosc: 6,
    exp: 900, zloto: 520, npc: 'kaplanka', koniec: 'kaplanka',
    opis: 'W ruinach na północy lęgną się nocne pająki. Oczyść je.',
    start: 'Z ruin idzie zła noc. Sześć nocnych pająków mniej, a światło wróci na cmentarzysko.',
    trakcie: 'Ruiny leżą na północny wschód od osady.',
    koniecTekst: 'Ruiny znów milczą. Niech cię strzeże światło.',
  },
  {
    nazwa: 'Skorpiony Pustki', poziom: 10, typ: 'kill', cel: 'Skorpion Pustki', ilosc: 5,
    exp: 1200, zloto: 750, nagroda: 'Amulet Świtu', npc: 'kaplanka', koniec: 'kaplanka',
    opis: 'Z pustkowi nadciągnęły skorpiony. Pokonaj pięć i zakończ Drogę Osadnika.',
    start: 'To ostatnia próba na tej ziemi. Pięć skorpionów z pustkowi — i osada będzie ci winna.',
    trakcie: 'Skorpiony przyszły z południowo-wschodnich pustkowi.',
    koniecTekst: 'Osada ma wobec ciebie dług. Ten amulet nosili jej obrońcy.',
  },
];

const DZIENNE = [
  {
    nazwa: 'Codzienne łowy', poziom: 1, typ: 'kill', cel: '', ilosc: 10,
    exp: 150, zloto: 90, npc: 'straznik', koniec: 'straznik', reset: 'dziennie',
    opis: 'Osada płaci za każdą upolowaną bestię. Dziesięć sztuk dziennie.',
    start: 'Płacimy za każdą bestię. Dziesięć sztuk i zgłoś się po zapłatę.',
    trakcie: 'Licz się z tym, że bestie odradzają się szybciej, niż giną.',
    koniecTekst: 'Zapłata jak co dzień. Do jutra.',
  },
  {
    nazwa: 'Obchód osady', poziom: 2, typ: 'location', cel: '20,21', ilosc: 1,
    exp: 90, zloto: 60, npc: 'straznik', koniec: 'straznik', reset: 'dziennie',
    opis: 'Sprawdź zachodnią bramę i wróć z raportem.',
    start: 'Zajrzyj do zachodniej bramy, czy warta stoi. Dostaniesz za fatygę.',
    trakcie: 'Zachodnia brama jest przy murze, po lewej stronie osady.',
    koniecTekst: 'Warta stoi, dobrze. Masz swoją dniówkę.',
  },
];

async function main() {
  const [[mapa]] = await db.query('SELECT id FROM mapa WHERE nazwa=? LIMIT 1', [MAPA]);
  if (!mapa) throw new Error(`Nie ma mapy „${MAPA}"`);

  const [npcRows] = await db.query('SELECT id, nazwa FROM npc WHERE mapa=?', [mapa.id]);
  const npcId = {};
  for (const [klucz, nazwa] of Object.entries(N)) {
    const r = npcRows.find(n => n.nazwa === nazwa);
    if (!r) console.warn(`  uwaga: brak NPC „${nazwa}" — zadania od niego pominę`);
    npcId[klucz] = r ? r.id : 0;
  }

  const [przedmioty] = await db.query('SELECT id, nazwa FROM przedmiot_loot');
  const itemId = (nazwa) => (przedmioty.find(p => p.nazwa === nazwa) || {}).id || 0;

  let poprzedni = 0, kolejnosc = 1, dodane = 0;
  for (const z of [...ZADANIA, ...DZIENNE]) {
    const dzienne = !!z.reset;
    const pola = {
      nazwa: z.nazwa, opis: z.opis, typ: z.typ,
      // dla zabójstw celem jest gatunek (cel_wartosc); dla lokacji — współrzędne
      cel_id: z.typ === 'location' ? mapa.id : 0,
      cel_wartosc: z.cel || '',
      cel_ilosc: z.ilosc,
      nagroda_exp: z.exp, nagroda_zloto: z.zloto,
      nagroda_item_id: z.nagroda ? itemId(z.nagroda) : 0,
      wymagany_poziom: z.poziom,
      wymagany_quest_id: dzienne ? 0 : poprzedni,
      npc_start_id: npcId[z.npc] || 0,
      npc_end_id: npcId[z.koniec] || 0,
      tekst_start: z.start, tekst_w_trakcie: z.trakcie, tekst_koniec: z.koniecTekst,
      aktywny: 1,
      lancuch_id: dzienne ? 0 : LANCUCH,
      kolejnosc: dzienne ? 0 : kolejnosc,
      reset_typ: z.reset || '',
    };
    if (z.nagroda && !pola.nagroda_item_id) console.warn(`  uwaga: brak przedmiotu „${z.nagroda}" dla „${z.nazwa}"`);

    const [[jest]] = await db.query('SELECT id FROM questy WHERE nazwa=? LIMIT 1', [z.nazwa]);
    let id;
    if (jest) {
      const set = Object.keys(pola).map(k => `${k}=?`).join(',');
      await db.query(`UPDATE questy SET ${set} WHERE id=?`, [...Object.values(pola), jest.id]);
      id = jest.id;
    } else {
      const kol = Object.keys(pola).join(',');
      const zn = Object.keys(pola).map(() => '?').join(',');
      const [r] = await db.query(`INSERT INTO questy (${kol}) VALUES (${zn})`, Object.values(pola));
      id = r.insertId;
    }
    dodane++;
    if (!dzienne) { poprzedni = id; kolejnosc++; }
    console.log(`  ${z.poziom} lv · ${z.nazwa} (${z.typ}${z.cel ? ': ' + z.cel : ''}) → ${z.exp} exp, ${z.zloto} zł${z.nagroda ? ', ' + z.nagroda : ''}`);
  }

  // łańcuch „Droga Osadnika" — jeśli tabela quest_chain istnieje
  await db.query(
    'INSERT INTO quest_chain (id, nazwa, opis) VALUES (?,?,?) ON DUPLICATE KEY UPDATE nazwa=VALUES(nazwa), opis=VALUES(opis)',
    [LANCUCH, 'Droga Osadnika', 'Od pierwszych kroków przy bramie po skorpiony z pustkowi.']
  ).catch(() => console.log('  (pomijam quest_chain — inna struktura tabeli)'));

  console.log(`Zadań w bazie: ${dodane}`);
}

main().then(() => process.exit(0)).catch(e => { console.error('Nieudane:', e.message); process.exit(1); });
