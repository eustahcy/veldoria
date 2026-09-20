// Autorski silnik kafli 2D (widok z góry) — grafika w stylu 16-bitowym.
//
// Kafle i obiekty są rysowane kodem, nie z kupionych grafik. Żeby wyglądały jak
// porządny tileset, a nie jak kolorowe kwadraty, stosujemy tu cztery rzeczy:
//   1. paleta rampowa — każdy materiał ma 6 odcieni od cienia do światła,
//   2. bezszwowy szum — tekstura powtarza się co 128 px (4 kafle), więc kafle
//      stykają się bez widocznych szwów, a kafel można trzymać w pamięci,
//   3. dithering 2×2 (macierz Bayera) na przejściach odcieni — klasyczny chwyt
//      z SNES-a, daje miękkie cieniowanie bez gradientów,
//   4. światło z góry-lewej: górne krawędzie rozjaśniamy, dolne przyciemniamy.
//
// Obiekty rysujemy na płótnie 48×56 zakotwiczonym dołem kafla, dzięki czemu
// drzewa, posągi i latarnie mogą być wyższe niż kafel i rzucać cień na sąsiada.
//
// Dane mapy zostają w tym samym formacie co wcześniej:
//   { "x,y": { t: 'trawa', o: 'drzewo' } }
// więc zapis różnicowy, edytor i kolizje na serwerze działają bez zmian.

export const TILE = 32;

// ── Palety materiałów (od najciemniejszego do najjaśniejszego) ───────────────
const P_TRAWA   = ['#1d3a1b', '#254a20', '#2f5f27', '#3a7530', '#478b3a', '#57a446'];
const P_TRAWA2  = ['#3b421b', '#4d5524', '#61692c', '#757e36', '#899341', '#9ea84f'];
const P_ZIEMIA  = ['#33220f', '#432d16', '#54391d', '#654726', '#76562f', '#87663b'];
const P_DROGA   = ['#4c3c26', '#5e4b31', '#6f5b3c', '#816b48', '#927b55', '#a38c64'];
const P_BRUK    = ['#31353a', '#3f444a', '#4e535a', '#5d636a', '#6d737b', '#7e858d'];
const P_PIASEK  = ['#806a3e', '#97804e', '#ac945f', '#c0a771', '#d2b984', '#e3cb98'];
const P_DESKI   = ['#402813', '#52341a', '#644121', '#764f29', '#885d33', '#9a6c3e'];
const P_SKALA   = ['#2c3034', '#3a3f44', '#494e54', '#585e65', '#686f76', '#7a8189'];
const P_SNIEG   = ['#8fa2b4', '#a6b6c5', '#bbc8d5', '#cedae4', '#e0eaf1', '#f3f8fc'];
const P_WODA    = ['#0e2a49', '#13375e', '#194677', '#20558f', '#2966a7', '#357abe'];
const P_LAWA    = ['#511305', '#751f08', '#9a2e0c', '#c04314', '#e2651f', '#ff9a35'];
const P_POLE    = ['#2b2214', '#39301c', '#473d25', '#554a2e', '#635838', '#726643'];
const P_ZWIR    = ['#3e4144', '#4e5255', '#5e6367', '#6e7479', '#7f858b', '#91979d'];

// ── Teren ────────────────────────────────────────────────────────────────────
// war      = warstwa (wyższa „wygrywa" na styku i przyjmuje obrzeże niższej)
// kontrast = jak mocno szum rozjeżdża odcienie, srodek = jasność bazowa
export const TERENY = [
  { id: 'trawa',  nazwa: 'Trawa',       war: 1, ramp: P_TRAWA,  wzor: 'trawa',  kontrast: 1.5, srodek: 0.52 },
  { id: 'trawa2', nazwa: 'Trawa sucha', war: 1, ramp: P_TRAWA2, wzor: 'trawa',  kontrast: 1.4, srodek: 0.54 },
  { id: 'ziemia', nazwa: 'Ziemia',      war: 2, ramp: P_ZIEMIA, wzor: 'ziemia', kontrast: 1.3, srodek: 0.50 },
  { id: 'pole',   nazwa: 'Pole uprawne',war: 2, ramp: P_POLE,   wzor: 'pole',   kontrast: 1.1, srodek: 0.50 },
  { id: 'droga',  nazwa: 'Droga',       war: 3, ramp: P_DROGA,  wzor: 'droga',  kontrast: 1.2, srodek: 0.52 },
  { id: 'zwir',   nazwa: 'Żwir',        war: 3, ramp: P_ZWIR,   wzor: 'zwir',   kontrast: 1.4, srodek: 0.50 },
  { id: 'bruk',   nazwa: 'Bruk',        war: 4, ramp: P_BRUK,   wzor: 'bruk',   kontrast: 0.8, srodek: 0.48 },
  { id: 'piasek', nazwa: 'Piasek',      war: 2, ramp: P_PIASEK, wzor: 'piasek', kontrast: 1.1, srodek: 0.54 },
  { id: 'deski',  nazwa: 'Deski',       war: 4, ramp: P_DESKI,  wzor: 'deski',  kontrast: 0.9, srodek: 0.52 },
  { id: 'kamien', nazwa: 'Skała',       war: 3, ramp: P_SKALA,  wzor: 'skala',  kontrast: 1.5, srodek: 0.50 },
  { id: 'snieg',  nazwa: 'Śnieg',       war: 3, ramp: P_SNIEG,  wzor: 'snieg',  kontrast: 0.9, srodek: 0.60 },
  { id: 'woda',   nazwa: 'Woda',        war: 0, ramp: P_WODA,   wzor: 'woda',   kontrast: 1.2, srodek: 0.48, woda: true, blok: true },
  { id: 'lawa',   nazwa: 'Lawa',        war: 0, ramp: P_LAWA,   wzor: 'lawa',   kontrast: 1.6, srodek: 0.46, woda: true, blok: true, swieci: true },
];
// „kolory"/„plamy" zostawiamy dla zgodności ze starszym kodem (minimapa, podglądy)
for (const t of TERENY) {
  t.kolory = [t.ramp[2], t.ramp[3], t.ramp[4]];
  t.plamy  = t.ramp[1];
}
export const TEREN_PO_ID = Object.fromEntries(TERENY.map(t => [t.id, t]));
export const TEREN_DOMYSLNY = 'trawa';

// ── Obiekty ──────────────────────────────────────────────────────────────────
// rys = sposób rysowania, blok = zatrzymuje gracza, laczy = autokafelkowanie,
// wysoki = sprite wystaje ponad kafel (drzewa, posągi, latarnie)
export const OBIEKTY = [
  { id: 'drzewo',   nazwa: 'Świerk',    rys: 'swierk',  blok: true,  wysoki: true, grupa: 'Natura' },
  { id: 'drzewo2',  nazwa: 'Dąb',       rys: 'dab',     blok: true,  wysoki: true, grupa: 'Natura' },
  { id: 'krzak',    nazwa: 'Krzak',     rys: 'krzak',   blok: false, grupa: 'Natura' },
  { id: 'kwiaty',   nazwa: 'Kwiaty',    rys: 'kwiaty',  blok: false, grupa: 'Natura' },
  { id: 'paproc',   nazwa: 'Paprocie',  rys: 'paproc',  blok: false, grupa: 'Natura' },
  { id: 'grzyby',   nazwa: 'Grzyby',    rys: 'grzyby',  blok: false, grupa: 'Natura' },
  { id: 'trzcina',  nazwa: 'Trzcina',   rys: 'trzcina', blok: false, grupa: 'Natura' },
  { id: 'kamyki',   nazwa: 'Kamyki',    rys: 'kamyki',  blok: false, grupa: 'Natura' },
  { id: 'glaz',     nazwa: 'Głaz',      rys: 'glaz',    blok: true,  grupa: 'Natura' },
  { id: 'pniak',    nazwa: 'Pniak',     rys: 'pniak',   blok: true,  grupa: 'Natura' },

  { id: 'mur',      nazwa: 'Mur',       rys: 'mur',     blok: true,  laczy: true, grupa: 'Budowle' },
  { id: 'dach',     nazwa: 'Dach',      rys: 'dach',    blok: true,  laczy: true, grupa: 'Budowle' },
  { id: 'dach2',    nazwa: 'Dach niebieski', rys: 'dach2', blok: true, laczy: true, grupa: 'Budowle' },
  { id: 'sciana',   nazwa: 'Ściana domu', rys: 'sciana', blok: true, laczy: true, grupa: 'Budowle' },
  { id: 'drzwi',    nazwa: 'Drzwi',     rys: 'drzwi',   blok: true,  grupa: 'Budowle' },
  { id: 'okno',     nazwa: 'Okno',      rys: 'okno',    blok: true,  grupa: 'Budowle' },
  { id: 'plot',     nazwa: 'Płot',      rys: 'plot',    blok: true,  laczy: true, grupa: 'Budowle' },
  { id: 'brama',    nazwa: 'Brama',     rys: 'brama',   blok: false, wysoki: true, grupa: 'Budowle' },
  { id: 'schody',   nazwa: 'Schody',    rys: 'schody',  blok: false, grupa: 'Budowle' },
  { id: 'most',     nazwa: 'Most',      rys: 'most',    blok: false, laczy: true, grupa: 'Budowle' },

  { id: 'studnia',  nazwa: 'Studnia',   rys: 'studnia', blok: true,  wysoki: true, grupa: 'Dekoracje' },
  { id: 'beczka',   nazwa: 'Beczka',    rys: 'beczka',  blok: true,  grupa: 'Dekoracje' },
  { id: 'skrzynia', nazwa: 'Skrzynia',  rys: 'skrzynia',blok: true,  grupa: 'Dekoracje' },
  { id: 'ognisko',  nazwa: 'Ognisko',   rys: 'ognisko', blok: true,  grupa: 'Dekoracje' },
  { id: 'latarnia', nazwa: 'Latarnia',  rys: 'latarnia',blok: true,  wysoki: true, grupa: 'Dekoracje' },
  { id: 'stragan',  nazwa: 'Stragan',   rys: 'stragan', blok: true,  wysoki: true, grupa: 'Dekoracje' },
  { id: 'tablica',  nazwa: 'Tablica',   rys: 'tablica', blok: true,  grupa: 'Dekoracje' },
  { id: 'posag',    nazwa: 'Posąg',     rys: 'posag',   blok: true,  wysoki: true, grupa: 'Dekoracje' },
  { id: 'ruiny',    nazwa: 'Ruiny',     rys: 'ruiny',   blok: true,  wysoki: true, grupa: 'Dekoracje' },
  { id: 'grob',     nazwa: 'Nagrobek',  rys: 'grob',    blok: true,  grupa: 'Dekoracje' },
  { id: 'siano',    nazwa: 'Bela siana',rys: 'siano',   blok: true,  grupa: 'Dekoracje' },
  { id: 'woz',      nazwa: 'Wóz',       rys: 'woz',     blok: true,  grupa: 'Dekoracje' },
];
export const OBIEKT_PO_ID = Object.fromEntries(OBIEKTY.map(o => [o.id, o]));
export const GRUPY_OBIEKTOW = [...new Set(OBIEKTY.map(o => o.grupa))];

export const blokujeKafel = (kafel) => {
  if (!kafel) return false;
  const t = TEREN_PO_ID[kafel.t];
  const o = OBIEKT_PO_ID[kafel.o];
  return !!(t?.blok || o?.blok);
};

// ── Szum ─────────────────────────────────────────────────────────────────────
// Deterministyczny hash — ten sam kafel zawsze wygląda tak samo
export function szum(x, y, s = 0) {
  const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

// Pole szumu 128×128 px zawijane na brzegach — dzięki temu tekstura powtarza się
// co 4 kafle bez widocznego szwu. Liczone raz, potem tylko odczyt z tablicy.
const DOMENA = 256;   // 8 kafli - tyle wystarczy, by oko nie lapalo powtorki
const POLA = new Map();
const wygladz = (t) => t * t * (3 - 2 * t);
function pole(seed, komorka) {
  const klucz = `${seed}|${komorka}`;
  const gotowe = POLA.get(klucz);
  if (gotowe) return gotowe;
  const n = DOMENA / komorka;
  const krata = new Float32Array(n * n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) krata[j * n + i] = szum(i, j, seed);
  const p = new Float32Array(DOMENA * DOMENA);
  for (let y = 0; y < DOMENA; y++) {
    const gy = y / komorka, j0 = Math.floor(gy) % n, j1 = (j0 + 1) % n, v = wygladz(gy - Math.floor(gy));
    for (let x = 0; x < DOMENA; x++) {
      const gx = x / komorka, i0 = Math.floor(gx) % n, i1 = (i0 + 1) % n, u = wygladz(gx - Math.floor(gx));
      const a = krata[j0 * n + i0], b = krata[j0 * n + i1], c = krata[j1 * n + i0], d = krata[j1 * n + i1];
      p[y * DOMENA + x] = (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
    }
  }
  POLA.set(klucz, p);
  return p;
}
const wDom = (v) => ((v % DOMENA) + DOMENA) % DOMENA;

// ── Kolory ───────────────────────────────────────────────────────────────────
// ImageData trzyma piksele jako 0xAABBGGRR, więc rampę zamieniamy raz na liczby
const U32 = new Map();
function rampaU32(ramp) {
  const k = ramp.join();
  const gotowa = U32.get(k);
  if (gotowa) return gotowa;
  const t = new Uint32Array(ramp.length);
  ramp.forEach((hex, i) => {
    const v = parseInt(hex.slice(1), 16);
    t[i] = 0xff000000 | ((v & 0xff) << 16) | (v & 0xff00) | ((v >> 16) & 0xff);
  });
  U32.set(k, t);
  return t;
}
// przyciemnienie / rozjaśnienie odcienia (do obrysów i świateł)
function zmieszaj(hex, docelowy, ile) {
  const a = parseInt(hex.slice(1), 16), b = parseInt(docelowy.slice(1), 16);
  const m = (p) => Math.round((((a >> p) & 0xff) * (1 - ile)) + (((b >> p) & 0xff) * ile));
  return `#${((m(16) << 16) | (m(8) << 8) | m(0)).toString(16).padStart(6, '0')}`;
}
const ciemniej = (hex, ile = 0.3) => zmieszaj(hex, '#000000', ile);
const jasniej  = (hex, ile = 0.3) => zmieszaj(hex, '#ffffff', ile);

// macierz Bayera 2×2 — progi dla ditheringu między odcieniami rampy
const BAYER = [0.125, 0.625, 0.875, 0.375];

// ── Baza terenu (ImageData — najszybsza droga na 1024 piksele) ───────────────
function rysujTerenBazowy(ctx, t, tx, ty) {
  const img = ctx.createImageData(TILE, TILE);
  const buf = new Uint32Array(img.data.buffer);
  const ramp = rampaU32(t.ramp);
  const ost = ramp.length - 1;
  const P1 = pole(1, 16), P2 = pole(2, 8), P3 = pole(3, 4), P4 = pole(4, 2);

  for (let py = 0; py < TILE; py++) {
    const wy = wDom(ty * TILE + py);
    for (let px = 0; px < TILE; px++) {
      const wx = wDom(tx * TILE + px);
      const i = wy * DOMENA + wx;
      let n = P1[i] * 0.42 + P2[i] * 0.30 + P3[i] * 0.19 + P4[i] * 0.09;

      switch (t.wzor) {                                   // modulacja materiałowa
        case 'piasek': n += Math.sin((wy + P2[i] * 7) * 0.85) * 0.07; break;
        case 'pole':   n += Math.sin(wy * 0.85) * 0.16 + Math.sin(wx * 0.11) * 0.04; break;
        case 'woda':   n += Math.sin((wx * 0.42 + wy * 0.83)) * 0.05; break;
        case 'lawa':   n = n * 0.55 + 0.40 + Math.sin((wx * 0.3 + wy * 0.5)) * 0.05; break;
        case 'snieg':  n = 0.5 + (n - 0.5) * 0.55; break;
        case 'deski':  n = 0.5 + (n - 0.5) * 0.7 + (((wy % 8) === 7) ? -0.35 : 0); break;
        case 'bruk':   n = 0.5 + (n - 0.5) * 0.5; break;
        default: break;
      }

      let v = (n - 0.5) * t.kontrast + t.srodek;
      v = v < 0 ? 0 : v > 1 ? 1 : v;
      const f = v * ost;
      let k = Math.floor(f);
      if (f - k > BAYER[((py & 1) << 1) | (px & 1)]) k++;
      buf[py * TILE + px] = ramp[k < 0 ? 0 : k > ost ? ost : k];
    }
  }
  ctx.putImageData(img, 0, 0);
}

// Rozsypanie drobiazgów (kępki trawy, kamyki) w siatce co „krok" pikseli.
// Pozycje liczymy ze współrzędnych świata mod 128, więc na styku kafli detal
// się zgadza — dlatego przechodzimy też blok przed kaflem i za nim.
function rozsyp(ctx, tx, ty, krok, seed, prog, rysuj) {
  for (let by = -krok; by <= TILE; by += krok) {
    for (let bx = -krok; bx <= TILE; bx += krok) {
      const wx = wDom(tx * TILE + bx), wy = wDom(ty * TILE + by);
      const s = szum(wx, wy, seed);
      if (s < prog) continue;
      const ox = Math.floor(szum(wx, wy, seed + 101) * krok);
      const oy = Math.floor(szum(wx, wy, seed + 202) * krok);
      rysuj(bx + ox, by + oy, s, wx, wy);
    }
  }
}

const pix = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

// ── Detal materiałowy rysowany na bazie ──────────────────────────────────────
function rysujDetalTerenu(ctx, t, tx, ty) {
  const R = t.ramp;
  switch (t.wzor) {
    case 'trawa': {
      // kępki: ciemna podstawa + jasne źdźbła, rzadkie kwiatki
      rozsyp(ctx, tx, ty, 8, 11, 0.34, (x, y, s) => {
        const h = 2 + Math.floor(s * 3);
        const skos = s > 0.66 ? 1 : s > 0.33 ? 0 : -1;       // kępka pochylona w losową stronę
        for (let i = 0; i < h; i++) {
          const dx = Math.round((i / h) * skos);
          pix(ctx, x + dx, y + h - i, 1, 1, i === h - 1 ? R[5] : R[3]);
          if (i < h - 1) pix(ctx, x + dx - skos, y + h - i, 1, 1, R[1]);
        }
        if (s > 0.8) pix(ctx, x + 2, y + h - 1, 1, 2, R[4]);
      });
      rozsyp(ctx, tx, ty, 16, 13, 0.955, (x, y, s) => {      // rzadkie kwiatki, nie konfetti
        const barwy = ['#c9bc4a', '#bf6a80', '#a888c4', '#d8d2c2'];
        const c = barwy[Math.floor(s * 997) % barwy.length];
        pix(ctx, x, y, 2, 1, c);
        pix(ctx, x, y + 1, 2, 1, ciemniej(c, 0.35));
      });
      break;
    }
    case 'ziemia': {
      rozsyp(ctx, tx, ty, 8, 21, 0.62, (x, y, s) => {
        const w = 2 + Math.floor(s * 2);
        pix(ctx, x, y, w, 2, R[1]);
        pix(ctx, x, y, w - 1, 1, R[4]);
      });
      rozsyp(ctx, tx, ty, 16, 23, 0.8, (x, y) => { pix(ctx, x, y, 2, 2, R[5]); pix(ctx, x, y + 2, 2, 1, R[0]); });
      break;
    }
    case 'pole': {
      // skiby: grzbiet w świetle, rowek w cieniu, do tego grudy i rządek sadzonek
      // grzbiet skiby rozjaśniamy tylko miejscami, żeby nie wyszły z tego deski
      for (let y = 0; y < TILE; y++) {
        const wy = wDom(ty * TILE + y);
        const faza = wy % 7;
        for (let x = 0; x < TILE; x++) {
          const wx = wDom(tx * TILE + x);
          const r = szum(wx, wy, 34);
          if (faza === 0 && r > 0.35) pix(ctx, x, y, 1, 1, R[4]);
          if (faza === 4 && r > 0.30) pix(ctx, x, y, 1, 1, R[1]);
          if (faza === 5 && r > 0.55) pix(ctx, x, y, 1, 1, R[0]);
        }
      }
      rozsyp(ctx, tx, ty, 5, 31, 0.5, (x, y, sv) => {          // grudy ziemi
        const w = 2 + Math.floor(sv * 2);
        pix(ctx, x, y, w, 1, R[4]);
        pix(ctx, x, y + 1, w, 1, R[1]);
      });
      rozsyp(ctx, tx, ty, 7, 33, 0.55, (x, y, sv) => {          // rządek sadzonek
        const h = 2 + Math.floor(sv * 2);
        pix(ctx, x, y - h, 1, h + 1, '#3f6b25');
        pix(ctx, x - 1, y - h + 1, 1, 1, '#517f2e');
        pix(ctx, x + 1, y - h, 1, 1, '#5d8f34');
      });
      break;
    }
    case 'droga': {
      rozsyp(ctx, tx, ty, 6, 41, 0.55, (x, y, s) => {
        pix(ctx, x, y, 2, 1, s > 0.8 ? R[5] : R[2]);
        pix(ctx, x, y + 1, 2, 1, R[1]);
      });
      break;
    }
    case 'zwir': {
      rozsyp(ctx, tx, ty, 4, 43, 0.35, (x, y, s) => {
        pix(ctx, x, y, 2, 2, R[Math.floor(s * 3) + 2]);
        pix(ctx, x, y + 2, 2, 1, R[0]);
      });
      break;
    }
    case 'piasek': {
      rozsyp(ctx, tx, ty, 8, 51, 0.72, (x, y) => pix(ctx, x, y, 3, 1, R[5]));
      rozsyp(ctx, tx, ty, 16, 53, 0.85, (x, y) => { pix(ctx, x, y, 2, 2, R[1]); pix(ctx, x, y, 1, 1, R[4]); });
      break;
    }
    case 'bruk': {
      // kostka 8×8 w przewiązce, każda z własnym odcieniem, fugą i światłem
      for (let r = -1; r < 5; r++) {
        const przes = (wDom(ty * TILE + r * 8) / 8) % 2 ? 4 : 0;
        for (let c = -1; c < 5; c++) {
          const bx = c * 8 + przes, by = r * 8;
          const wx = wDom(tx * TILE + bx), wy = wDom(ty * TILE + by);
          const s = szum(wx, wy, 61);
          const baza = R[2 + (Math.floor(s * 100) % 3)];
          pix(ctx, bx + 1, by + 1, 6, 6, baza);
          pix(ctx, bx + 1, by + 1, 6, 1, jasniej(baza, 0.22));
          pix(ctx, bx + 1, by + 6, 6, 1, ciemniej(baza, 0.3));
          pix(ctx, bx + 6, by + 2, 1, 5, ciemniej(baza, 0.18));
          if (s > 0.82) pix(ctx, bx + 3, by + 3, 2, 1, ciemniej(baza, 0.4));   // ubytek
        }
      }
      break;
    }
    case 'deski': {
      for (let r = -1; r < 5; r++) {
        const by = r * 8;
        pix(ctx, 0, by, TILE, 1, jasniej(R[3], 0.18));      // górna faza deski
        pix(ctx, 0, by + 7, TILE, 1, ciemniej(R[0], 0.2));  // szpara
        for (let g = 0; g < 3; g++) {                        // słoje
          const wx = wDom(tx * TILE + g * 11), wy = wDom(ty * TILE + by);
          const s = szum(wx, wy, 71);
          pix(ctx, Math.floor(s * 26) + 2, by + 2 + (g % 3), 6 + Math.floor(s * 8), 1, ciemniej(R[2], 0.25));
        }
        const gwozdz = wDom(tx * TILE) % 32 === 0;
        if (gwozdz) { pix(ctx, 2, by + 3, 2, 2, R[0]); pix(ctx, 27, by + 3, 2, 2, R[0]); }
      }
      break;
    }
    case 'skala': {
      rozsyp(ctx, tx, ty, 16, 81, 0.5, (x, y, s) => {       // pęknięcia
        const dl = 6 + Math.floor(s * 8);
        for (let i = 0; i < dl; i++) {
          const px = x + i, py = y + Math.floor(Math.sin(i * 0.7 + s * 6) * 2);
          pix(ctx, px, py, 1, 1, R[0]);
          pix(ctx, px, py + 1, 1, 1, R[4]);
        }
      });
      rozsyp(ctx, tx, ty, 8, 83, 0.75, (x, y) => pix(ctx, x, y, 2, 2, R[5]));
      break;
    }
    case 'snieg': {
      rozsyp(ctx, tx, ty, 8, 91, 0.78, (x, y) => pix(ctx, x, y, 2, 1, '#ffffff'));
      rozsyp(ctx, tx, ty, 16, 93, 0.7, (x, y) => pix(ctx, x, y, 4, 1, R[1]));
      break;
    }
    case 'woda': {
      rozsyp(ctx, tx, ty, 16, 101, 0.62, (x, y) => pix(ctx, x, y, 5, 1, R[0]));   // głębia
      break;
    }
    case 'lawa': {
      // ciemna skorupa pływa po lawie, a w szczelinach widać rozżarzone brzegi
      const PA = pole(2, 16), PB = pole(3, 8);
      for (let py = 0; py < TILE; py++) {
        const wy = wDom(ty * TILE + py);
        for (let px = 0; px < TILE; px++) {
          const wx = wDom(tx * TILE + px);
          const v = PA[wy * DOMENA + wx] * 0.72 + PB[wy * DOMENA + wx] * 0.28;
          if (v > 0.60) pix(ctx, px, py, 1, 1, v > 0.70 ? '#251005' : '#3d1706');
          else if (v > 0.565) pix(ctx, px, py, 1, 1, '#ffbe52');
          else if (v > 0.55) pix(ctx, px, py, 1, 1, '#ff8a22');
        }
      }
      break;
    }
    default: break;
  }
}

// ── Przejścia między terenami ────────────────────────────────────────────────
// Teren o niższej warstwie „wchodzi" na nasz kafel poszarpanym brzegiem, a styk
// podkreślamy ciemną kreską. Brzeg wody dostaje dodatkowo mokry pas i pianę.
const BOKI = [
  ['n', (i, d) => [i, d]],
  ['s', (i, d) => [i, TILE - 1 - d]],
  ['w', (i, d) => [d, i]],
  ['e', (i, d) => [TILE - 1 - d, i]],
];

function rysujKrawedzie(ctx, t, sasiedzi, tx, ty) {
  for (const [kier, punkt] of BOKI) {
    const s = TEREN_PO_ID[sasiedzi[kier]];
    if (!s || s.id === t.id || s.war >= t.war) continue;
    const ziarno = kier.charCodeAt(0);
    const wodny = !!s.woda;
    for (let i = 0; i < TILE; i++) {
      const os = (kier === 'n' || kier === 's') ? wDom(tx * TILE + i) : wDom(ty * TILE + i);
      const glebokosc = 2 + Math.floor(szum(os, ziarno * 7, 121) * 4);
      for (let d = 0; d < glebokosc; d++) {
        // ostatni piksel rozsypujemy, żeby brzeg nie był linijkowy
        if (d === glebokosc - 1 && szum(os, d, 131) < 0.45) continue;
        const [px, py] = punkt(i, d);
        pix(ctx, px, py, 1, 1, s.ramp[d === 0 ? 2 : 3]);
      }
      const [rx, ry] = punkt(i, glebokosc);
      pix(ctx, rx, ry, 1, 1, 'rgba(0,0,0,0.20)');                     // kreska styku
      if (wodny) {
        const [fx, fy] = punkt(i, glebokosc + 1);
        if (szum(os, 3, 141) > 0.55) pix(ctx, fx, fy, 1, 1, 'rgba(190,225,245,0.45)');  // piana
      }
    }
  }
  // narożniki — gdy po skosie jest niższy teren, ścinamy róg
  const rogi = [
    ['nw', 0, 0, 1, 1], ['ne', TILE - 1, 0, -1, 1],
    ['sw', 0, TILE - 1, 1, -1], ['se', TILE - 1, TILE - 1, -1, -1],
  ];
  for (const [id, x0, y0, kx, ky] of rogi) {
    const s = TEREN_PO_ID[sasiedzi[id]];
    if (!s || s.id === t.id || s.war >= t.war) continue;
    const g = 2 + Math.floor(szum(tx + x0, ty + y0, 151) * 2);
    for (let a = 0; a < g; a++)
      for (let b = 0; b < g - a; b++)
        pix(ctx, x0 + kx * a, y0 + ky * b, 1, 1, s.ramp[3]);
  }
}

// ── Obiekty ──────────────────────────────────────────────────────────────────
// Płótno obiektu: 48×56, kafel zaczyna się w (8,16) — sprite może wystawać
// 16 px w górę, 8 px na boki i 8 px w dół (na cień).
export const OBJ_W = 48, OBJ_H = 56, OBJ_OX = 8, OBJ_OY = 16;

const KORA    = ['#241608', '#3a2412', '#4e311b', '#623d22', '#75492a'];
const LISCIE  = ['#132b16', '#1c3f20', '#26542a', '#316a34', '#3f8240', '#529c50'];
const LISCIE2 = ['#1a2c12', '#26411a', '#335624', '#426d2e', '#52843a', '#649c48'];
const DREWNO  = ['#2c1b0e', '#452a15', '#5c391d', '#744826', '#8b5830', '#a2683b'];
const KAM     = ['#2b2f33', '#3b4045', '#4b5157', '#5c6268', '#6d747a', '#80878e'];
const METAL   = ['#23262c', '#383d46', '#4e5561', '#6a7280', '#8d95a4'];
const TYNK    = ['#6a5a42', '#8a7659', '#a89272', '#c2ad8c', '#d8c6a6', '#ece0c8'];
const ZLOTO   = ['#5f420f', '#8d6318', '#bb8a22', '#dfb040', '#f6d97c'];
const OGIEN   = ['#7a1e05', '#b83c09', '#e06a12', '#f59a28', '#ffd166', '#fff3bd'];

// miękki cień kontaktowy (dwie warstwy elipsy)
function cien(ctx, cx, cy, rx, ry) {
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.beginPath(); ctx.ellipse(cx + 2, cy + 1, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.26)';
  ctx.beginPath(); ctx.ellipse(cx + 1, cy, rx * 0.72, ry * 0.72, 0, 0, Math.PI * 2); ctx.fill();
}
const kolo = (ctx, cx, cy, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); };
// pionowy słupek z trzema odcieniami — podstawa większości drewna i kamienia
function slup(ctx, x, y, w, h, ramp) {
  pix(ctx, x, y, w, h, ramp[2]);
  pix(ctx, x, y, 1, h, ramp[3]);
  pix(ctx, x + w - 1, y, 1, h, ramp[0]);
  pix(ctx, x, y, w, 1, ramp[4]);
}

function rysujObiekt(ctx, o, x, y, maska) {
  ctx.save();
  ctx.translate(OBJ_OX, OBJ_OY);      // dalej pracujemy w układzie kafla 0..32
  const s = (a) => szum(x, y, a);
  switch (o.rys) {

    case 'swierk': {
      cien(ctx, 16, 28, 11, 4.5);
      slup(ctx, 14, 16, 4, 13, KORA);
      // cztery piętra igliwia: cień, korpus, światło od góry-lewej
      const pietra = [[-14, 9], [-6, 12], [2, 15], [10, 18]];
      pietra.forEach(([yy, w], i) => {
        const c = LISCIE[1 + (i % 2)];
        ctx.fillStyle = ciemniej(c, 0.25);
        ctx.beginPath(); ctx.moveTo(16, yy - 6); ctx.lineTo(16 + w, yy + 8); ctx.lineTo(16 - w, yy + 8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.moveTo(16, yy - 4); ctx.lineTo(16 + w - 2, yy + 7); ctx.lineTo(16 - w + 2, yy + 7); ctx.closePath(); ctx.fill();
        ctx.fillStyle = LISCIE[4];
        ctx.beginPath(); ctx.moveTo(16, yy - 4); ctx.lineTo(16 - 3, yy + 3); ctx.lineTo(16 - w + 3, yy + 6); ctx.closePath(); ctx.fill();
        pix(ctx, 16 - w + 2, yy + 7, w * 2 - 4, 1, LISCIE[0]);
      });
      pix(ctx, 15, -18, 2, 5, LISCIE[3]);                 // czubek
      if (s(2) > 0.7) pix(ctx, 20, 4, 2, 2, LISCIE[5]);   // prześwit
      break;
    }

    case 'dab': {
      cien(ctx, 16, 28, 13, 5);
      slup(ctx, 13, 12, 6, 17, KORA);
      pix(ctx, 12, 16, 2, 2, KORA[1]);                    // konar
      pix(ctx, 19, 14, 2, 2, KORA[1]);
      const kule = [[16, 0, 13], [7, 6, 8], [25, 6, 8], [16, 9, 11]];
      kule.forEach(([cx, cy, r]) => kolo(ctx, cx, cy, r, LISCIE2[1]));      // sylwetka
      kule.forEach(([cx, cy, r]) => kolo(ctx, cx, cy - 1, r - 1, LISCIE2[3]));
      kolo(ctx, 11, -2, 6, LISCIE2[4]);                    // światło
      kolo(ctx, 19, -4, 4, LISCIE2[5]);
      ctx.fillStyle = 'rgba(12,28,14,0.35)';               // cień pod koroną (miękki, nie dziura)
      ctx.beginPath(); ctx.ellipse(18, 10, 10, 5, 0, 0, Math.PI); ctx.fill();
      for (let i = 0; i < 5; i++) {                        // listki
        const px = 4 + Math.floor(s(i) * 24), py = -6 + Math.floor(s(i + 9) * 18);
        pix(ctx, px, py, 2, 1, LISCIE2[5]);
      }
      break;
    }

    case 'krzak': {
      cien(ctx, 16, 28, 10, 4);
      [[11, 22, 8], [21, 22, 7], [16, 17, 8]].forEach(([cx, cy, r]) => kolo(ctx, cx, cy, r, LISCIE[1]));
      [[11, 21, 7], [21, 21, 6], [16, 16, 7]].forEach(([cx, cy, r]) => kolo(ctx, cx, cy, r, LISCIE[3]));
      kolo(ctx, 13, 15, 4, LISCIE[4]);
      ctx.fillStyle = 'rgba(12,28,14,0.32)';
      ctx.beginPath(); ctx.ellipse(17, 23, 8, 4, 0, 0, Math.PI); ctx.fill();
      if (s(3) > 0.5) [[10, 20], [20, 19], [15, 24]].forEach(([bx, by]) => pix(ctx, bx, by, 2, 2, '#b8324a'));
      break;
    }

    case 'kwiaty': {
      const barwy = [['#e6d75a', '#fff3bd'], ['#d95f83', '#f0a8bd'], ['#9a6ed0', '#c7a8ee'], ['#e8e2d2', '#ffffff']];
      for (let i = 0; i < 6; i++) {
        const px = 3 + Math.floor(s(i) * 25), py = 11 + Math.floor(s(i + 9) * 16);
        const [c, j] = barwy[Math.floor(s(i + 21) * 100) % barwy.length];
        pix(ctx, px, py + 2, 1, 5, '#2f5a25');
        pix(ctx, px - 1, py + 4, 3, 1, '#3a7030');
        pix(ctx, px - 1, py, 3, 3, c);
        pix(ctx, px, py, 1, 1, j);
        pix(ctx, px - 1, py + 2, 3, 1, ciemniej(c, 0.3));
      }
      break;
    }

    case 'paproc': {
      // trzy pióropusze: łodyga + pary listków, im wyżej tym krótsze
      for (let i = 0; i < 3; i++) {
        const px = 7 + i * 9 + Math.floor(s(i) * 3);
        const h = 14 + Math.floor(s(i + 4) * 7);
        const skos = s(i + 2) > 0.5 ? 1 : -1;
        const c = LISCIE[3 + (i % 2)];
        for (let j = 0; j < h; j++) {
          const yy = 29 - j;
          const dx = Math.round((j / h) * (j / h) * 4 * skos);
          pix(ctx, px + dx, yy, 1, 1, LISCIE[2]);
          if (j % 3 !== 1 || j < 2) continue;
          const w = Math.max(2, Math.round((h - j) / 2.2));
          for (let k = 1; k <= w; k++) {
            const oy = Math.round(k * 0.6);
            pix(ctx, px + dx - k, yy + oy, 1, 1, k >= w - 1 ? LISCIE[5] : c);
            pix(ctx, px + dx + k, yy + oy, 1, 1, k >= w - 1 ? c : ciemniej(c, 0.25));
          }
        }
        pix(ctx, px + Math.round(4 * skos), 29 - h, 1, 2, LISCIE[5]);   // zwinięty czubek
      }
      break;
    }
    case 'grzyby': {
      for (let i = 0; i < 4; i++) {
        const px = 5 + Math.floor(s(i) * 22), py = 16 + Math.floor(s(i + 7) * 10);
        const duzy = s(i + 3) > 0.5;
        const kap = duzy ? '#b03a2a' : '#8a6a44';
        pix(ctx, px + 1, py + 3, 2, 4, '#e0d8c0');
        pix(ctx, px - 1, py, 6, 3, kap);
        pix(ctx, px, py - 1, 4, 1, jasniej(kap, 0.25));
        pix(ctx, px - 1, py + 3, 6, 1, ciemniej(kap, 0.35));
        if (duzy) { pix(ctx, px, py + 1, 1, 1, '#f0e4d0'); pix(ctx, px + 3, py, 1, 1, '#f0e4d0'); }
      }
      break;
    }

    case 'trzcina': {
      for (let i = 0; i < 7; i++) {
        const px = 2 + i * 4 + Math.floor(s(i) * 2);
        const h = 12 + Math.floor(s(i + 3) * 12);
        const przechyl = s(i + 5) > 0.5 ? 1 : -1;
        for (let j = 0; j < h; j++) {                          // łodyga lekko wygięta
          const dx = Math.round((j / h) * 2 * przechyl);
          pix(ctx, px + dx, 29 - j, 1, 1, j > h * 0.6 ? '#6d9636' : '#3f6b25');
          if (j % 5 === 2) pix(ctx, px + dx + przechyl, 29 - j, 2, 1, '#57812c');   // listek
        }
        if (s(i + 7) > 0.35) {                                  // kolba pałki wodnej
          const kx = px + Math.round(2 * przechyl), ky = 29 - h - 4;
          pix(ctx, kx - 1, ky, 3, 6, '#6e4a22');
          pix(ctx, kx - 1, ky, 1, 6, '#8a6030');
          pix(ctx, kx, ky - 2, 1, 2, '#3f6b25');
        }
      }
      break;
    }

    case 'kamyki': {
      for (let i = 0; i < 5; i++) {
        const px = 3 + Math.floor(s(i) * 23), py = 13 + Math.floor(s(i + 6) * 13);
        const w = 3 + Math.floor(s(i + 2) * 3);
        pix(ctx, px, py + 3, w + 1, 1, 'rgba(0,0,0,0.22)');   // cień
        pix(ctx, px, py + 1, w, 2, KAM[3]);
        pix(ctx, px, py, w, 1, KAM[5]);
        pix(ctx, px + w - 1, py + 1, 1, 2, KAM[1]);
      }
      break;
    }

    case 'glaz': {
      cien(ctx, 16, 28, 13, 5);
      ctx.fillStyle = KAM[1];
      ctx.beginPath(); ctx.moveTo(4, 28); ctx.lineTo(6, 14); ctx.lineTo(14, 6); ctx.lineTo(24, 11); ctx.lineTo(28, 22); ctx.lineTo(26, 28); ctx.closePath(); ctx.fill();
      ctx.fillStyle = KAM[3];
      ctx.beginPath(); ctx.moveTo(7, 20); ctx.lineTo(9, 13); ctx.lineTo(15, 8); ctx.lineTo(21, 12); ctx.lineTo(20, 22); ctx.closePath(); ctx.fill();
      ctx.fillStyle = KAM[5];
      ctx.beginPath(); ctx.moveTo(10, 14); ctx.lineTo(15, 9); ctx.lineTo(19, 12); ctx.lineTo(14, 16); ctx.closePath(); ctx.fill();
      pix(ctx, 9, 22, 10, 1, KAM[0]);
      pix(ctx, 20, 17, 6, 1, KAM[0]);
      if (s(4) > 0.45) { pix(ctx, 6, 16, 4, 2, '#3f6b2c'); pix(ctx, 22, 20, 4, 2, '#3f6b2c'); }   // mech
      break;
    }

    case 'pniak': {
      cien(ctx, 16, 28, 10, 4);
      pix(ctx, 10, 17, 12, 11, KORA[1]);
      pix(ctx, 10, 17, 2, 11, KORA[3]);
      pix(ctx, 20, 17, 2, 11, KORA[0]);
      ctx.fillStyle = '#8a6136'; ctx.beginPath(); ctx.ellipse(16, 17, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6e4b28'; ctx.beginPath(); ctx.ellipse(16, 17, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9a7246'; ctx.beginPath(); ctx.ellipse(16, 17, 2, 1, 0, 0, Math.PI * 2); ctx.fill();
      pix(ctx, 9, 26, 14, 2, 'rgba(0,0,0,0.22)');
      break;
    }

    case 'mur': case 'sciana': {
      const kamienny = o.rys === 'mur';
      const R = kamienny ? KAM : TYNK;
      pix(ctx, 0, 0, TILE, TILE, R[1]);
      for (let r = 0; r < 4; r++) {
        const przes = r % 2 ? 5 : 0;
        for (let c = -1; c < 4; c++) {
          const bx = c * 10 + przes, by = r * 8;
          const odc = R[2 + (Math.floor(szum(x * 5 + c, y * 5 + r, 161) * 100) % 3)];
          pix(ctx, bx + 1, by + 1, 9, 6, odc);
          pix(ctx, bx + 1, by + 1, 9, 1, jasniej(odc, 0.2));
          pix(ctx, bx + 1, by + 6, 9, 1, ciemniej(odc, 0.28));
          pix(ctx, bx + 9, by + 1, 1, 6, ciemniej(odc, 0.18));
        }
      }
      if (!kamienny) {                                   // belki szachulcowe
        pix(ctx, 0, 0, TILE, 3, DREWNO[2]);
        pix(ctx, 0, 0, TILE, 1, DREWNO[4]);
        pix(ctx, 0, TILE - 4, TILE, 4, DREWNO[1]);
        pix(ctx, 0, TILE - 4, TILE, 1, DREWNO[3]);
        if (!(maska & 2)) { pix(ctx, TILE - 3, 0, 3, TILE, DREWNO[2]); pix(ctx, TILE - 3, 0, 1, TILE, DREWNO[3]); }
        if (!(maska & 8)) { pix(ctx, 0, 0, 3, TILE, DREWNO[2]); pix(ctx, 0, 0, 1, TILE, DREWNO[4]); }
      }
      if (!(maska & 1)) pix(ctx, 0, 0, TILE, 3, kamienny ? KAM[4] : DREWNO[4]);          // światło z góry
      if (!(maska & 4)) pix(ctx, 0, TILE - 5, TILE, 5, 'rgba(0,0,0,0.34)');              // cień u dołu
      if (!(maska & 8)) pix(ctx, 0, 0, 1, TILE, 'rgba(255,255,255,0.10)');
      if (!(maska & 2)) pix(ctx, TILE - 1, 0, 1, TILE, 'rgba(0,0,0,0.25)');
      break;
    }

    case 'dach': case 'dach2': {
      const R = o.rys === 'dach'
        ? ['#4a180f', '#6b2414', '#8c321a', '#a84423', '#c2582f', '#d8703f']
        : ['#131f3a', '#1d2f57', '#284075', '#345293', '#4265ad', '#5a7dc4'];
      pix(ctx, 0, 0, TILE, TILE, R[2]);
      for (let r = -1; r < 5; r++) {
        const przes = r % 2 ? 4 : 0;
        for (let c = -1; c < 5; c++) {
          const cx = c * 8 + przes + 4, cy = r * 8 + 4;
          const odc = R[2 + (Math.floor(szum(x * 4 + c, y * 4 + r, 171) * 100) % 3)];
          ctx.fillStyle = odc;
          ctx.beginPath(); ctx.arc(cx, cy, 4.6, Math.PI, 0); ctx.fill();
          ctx.fillRect(cx - 4, cy, 9, 4);
          ctx.fillStyle = jasniej(odc, 0.22);
          ctx.beginPath(); ctx.arc(cx, cy, 4.6, Math.PI, Math.PI * 1.45); ctx.fill();
          pix(ctx, cx - 4, cy + 3, 9, 1, ciemniej(odc, 0.35));
        }
      }
      if (!(maska & 1)) {                                   // kalenica
        pix(ctx, 0, 0, TILE, 4, TYNK[4]);
        pix(ctx, 0, 0, TILE, 1, TYNK[5]);
        pix(ctx, 0, 4, TILE, 1, 'rgba(0,0,0,0.3)');
      }
      if (!(maska & 4)) {                                   // okap + cień
        pix(ctx, 0, TILE - 4, TILE, 3, DREWNO[1]);
        pix(ctx, 0, TILE - 1, TILE, 1, 'rgba(0,0,0,0.45)');
      }
      if (!(maska & 8)) pix(ctx, 0, 0, 1, TILE, 'rgba(255,255,255,0.10)');
      if (!(maska & 2)) pix(ctx, TILE - 1, 0, 1, TILE, 'rgba(0,0,0,0.28)');
      break;
    }

    case 'okno': {
      pix(ctx, 0, 0, TILE, TILE, TYNK[2]);
      for (let r = 0; r < 4; r++) pix(ctx, 0, r * 8 + 7, TILE, 1, ciemniej(TYNK[1], 0.2));
      pix(ctx, 5, 6, 22, 19, DREWNO[1]);
      pix(ctx, 7, 8, 18, 15, '#2a2418');
      const g = ctx.createLinearGradient(7, 8, 25, 23);
      g.addColorStop(0, '#ffe7a8'); g.addColorStop(0.5, '#f0c86a'); g.addColorStop(1, '#c79a3c');
      ctx.fillStyle = g; ctx.fillRect(8, 9, 16, 13);
      pix(ctx, 9, 10, 5, 4, 'rgba(255,255,255,0.35)');       // odblask szyby
      pix(ctx, 15, 9, 2, 13, DREWNO[1]);
      pix(ctx, 8, 14, 16, 2, DREWNO[1]);
      pix(ctx, 4, 24, 24, 3, DREWNO[3]);                     // parapet
      pix(ctx, 4, 27, 24, 1, 'rgba(0,0,0,0.35)');
      pix(ctx, 5, 6, 22, 1, DREWNO[4]);
      break;
    }

    case 'drzwi': {
      pix(ctx, 0, 0, TILE, TILE, TYNK[2]);
      pix(ctx, 5, 4, 22, 28, DREWNO[0]);                     // futryna
      pix(ctx, 7, 6, 18, 26, DREWNO[2]);
      for (let i = 0; i < 4; i++) {
        pix(ctx, 8 + i * 4, 6, 1, 26, DREWNO[1]);
        pix(ctx, 9 + i * 4, 6, 1, 26, DREWNO[3]);
      }
      pix(ctx, 7, 11, 18, 2, METAL[2]);                      // okucia
      pix(ctx, 7, 11, 18, 1, METAL[4]);
      pix(ctx, 7, 25, 18, 2, METAL[2]);
      pix(ctx, 7, 25, 18, 1, METAL[4]);
      pix(ctx, 21, 18, 2, 3, ZLOTO[3]);                      // klamka
      pix(ctx, 21, 18, 1, 1, ZLOTO[4]);
      pix(ctx, 5, 4, 22, 1, DREWNO[4]);
      pix(ctx, 6, 30, 20, 2, 'rgba(0,0,0,0.35)');
      break;
    }

    case 'plot': {
      const poziom = (maska & 2) || (maska & 8);
      const pion = (maska & 1) || (maska & 4);
      const belka = (bx, by, w, h) => { pix(ctx, bx, by, w, h, DREWNO[2]); pix(ctx, bx, by, w, 1, DREWNO[4]); pix(ctx, bx, by + h - 1, w, 1, DREWNO[0]); };
      if (poziom || !pion) { belka(0, 13, TILE, 3); belka(0, 21, TILE, 3); }
      if (pion) { pix(ctx, 14, 0, 4, TILE, DREWNO[2]); pix(ctx, 14, 0, 1, TILE, DREWNO[4]); pix(ctx, 17, 0, 1, TILE, DREWNO[0]); }
      for (let i = 0; i < 3; i++) {
        const px = 2 + i * 11;
        pix(ctx, px, 7, 4, 21, DREWNO[3]);
        pix(ctx, px, 7, 1, 21, DREWNO[4]);
        pix(ctx, px + 3, 7, 1, 21, DREWNO[1]);
        pix(ctx, px, 6, 4, 1, DREWNO[5]);                    // ścięty czubek
        pix(ctx, px - 1, 28, 6, 2, 'rgba(0,0,0,0.22)');
      }
      break;
    }

    case 'brama': {
      cien(ctx, 16, 30, 15, 4);
      slup(ctx, -1, -6, 7, 36, KAM);
      slup(ctx, 26, -6, 7, 36, KAM);
      for (let r = 0; r < 5; r++) {                          // ciosy w filarach
        pix(ctx, -1, -6 + r * 7, 7, 1, KAM[0]);
        pix(ctx, 26, -6 + r * 7, 7, 1, KAM[0]);
      }
      pix(ctx, 4, -10, 24, 6, DREWNO[2]);                    // nadproże
      pix(ctx, 4, -10, 24, 1, DREWNO[4]);
      pix(ctx, 4, -5, 24, 1, 'rgba(0,0,0,0.4)');
      pix(ctx, 12, -4, 8, 9, '#8c2f26');                     // proporzec
      pix(ctx, 12, -4, 8, 1, '#b04036');
      pix(ctx, 15, -1, 2, 3, ZLOTO[3]);
      break;
    }

    case 'schody': {
      pix(ctx, 0, 0, TILE, TILE, KAM[1]);
      for (let i = 0; i < 4; i++) {
        const sy = i * 8;
        const jasnosc = 4 - Math.floor(i / 2);                  // wyższy stopień = jaśniejszy
        pix(ctx, 3, sy + 1, 26, 6, KAM[jasnosc]);
        pix(ctx, 3, sy + 1, 26, 1, KAM[5]);
        pix(ctx, 3, sy + 6, 26, 2, 'rgba(0,0,0,0.38)');
        pix(ctx, 3, sy + 1, 1, 6, KAM[5]);
        pix(ctx, 28, sy + 1, 1, 6, KAM[0]);
      }
      pix(ctx, 0, 0, 3, TILE, KAM[2]);                          // policzki schodów
      pix(ctx, 0, 0, 1, TILE, KAM[4]);
      pix(ctx, 29, 0, 3, TILE, KAM[1]);
      pix(ctx, 31, 0, 1, TILE, KAM[0]);
      break;
    }

    case 'most': {
      pix(ctx, 0, 0, TILE, TILE, DREWNO[1]);
      for (let i = 0; i < 4; i++) {
        pix(ctx, i * 8, 2, 7, 28, DREWNO[3]);
        pix(ctx, i * 8, 2, 7, 1, DREWNO[5]);
        pix(ctx, i * 8 + 7, 2, 1, 28, DREWNO[0]);
        pix(ctx, i * 8 + 2, 4, 3, 1, DREWNO[2]);
      }
      pix(ctx, 0, 0, TILE, 3, DREWNO[2]);                    // poręcze
      pix(ctx, 0, 0, TILE, 1, DREWNO[4]);
      pix(ctx, 0, 29, TILE, 3, DREWNO[1]);
      pix(ctx, 0, 31, TILE, 1, 'rgba(0,0,0,0.4)');
      break;
    }

    case 'studnia': {
      cien(ctx, 16, 29, 14, 5);
      ctx.fillStyle = KAM[1]; ctx.beginPath(); ctx.ellipse(16, 22, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = KAM[3]; ctx.beginPath(); ctx.ellipse(16, 21, 12, 7, 0, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 8; i++) {                          // ciosy w kręgu
        const a = (i / 8) * Math.PI * 2;
        pix(ctx, Math.round(16 + Math.cos(a) * 10) - 1, Math.round(21 + Math.sin(a) * 6), 2, 2, KAM[Math.floor(szum(i, 0, 181) * 3) + 1]);
      }
      ctx.fillStyle = '#0d2438'; ctx.beginPath(); ctx.ellipse(16, 21, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#16405e'; ctx.beginPath(); ctx.ellipse(16, 22, 5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      slup(ctx, 5, -6, 4, 24, DREWNO);
      slup(ctx, 23, -6, 4, 24, DREWNO);
      pix(ctx, 2, -12, 28, 4, '#8c321a');                    // daszek
      pix(ctx, 2, -12, 28, 1, '#c2582f');
      pix(ctx, 3, -8, 26, 2, DREWNO[1]);
      pix(ctx, 15, -7, 2, 10, DREWNO[4]);                    // lina
      pix(ctx, 13, 3, 6, 5, DREWNO[2]);                      // wiadro
      pix(ctx, 13, 3, 6, 1, DREWNO[4]);
      pix(ctx, 13, 7, 6, 1, METAL[2]);
      break;
    }

    case 'beczka': {
      cien(ctx, 16, 28, 9, 4);
      pix(ctx, 9, 11, 14, 17, DREWNO[2]);
      pix(ctx, 9, 11, 2, 17, DREWNO[3]);
      pix(ctx, 11, 11, 2, 17, DREWNO[4]);
      pix(ctx, 20, 11, 3, 17, DREWNO[0]);
      for (const hy of [14, 24]) { pix(ctx, 9, hy, 14, 2, METAL[2]); pix(ctx, 9, hy, 14, 1, METAL[4]); }
      ctx.fillStyle = DREWNO[4]; ctx.beginPath(); ctx.ellipse(16, 11, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = DREWNO[2]; ctx.beginPath(); ctx.ellipse(16, 11, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }

    case 'skrzynia': {
      cien(ctx, 16, 28, 11, 4);
      pix(ctx, 6, 16, 20, 12, DREWNO[2]);
      pix(ctx, 6, 16, 20, 1, DREWNO[4]);
      pix(ctx, 6, 27, 20, 1, DREWNO[0]);
      ctx.fillStyle = DREWNO[3];                              // wypukłe wieko
      ctx.beginPath(); ctx.moveTo(6, 16); ctx.quadraticCurveTo(16, 6, 26, 16); ctx.closePath(); ctx.fill();
      ctx.fillStyle = DREWNO[5];
      ctx.beginPath(); ctx.moveTo(8, 15); ctx.quadraticCurveTo(15, 8, 20, 11); ctx.lineTo(9, 16); ctx.closePath(); ctx.fill();
      pix(ctx, 13, 9, 3, 19, METAL[2]);
      pix(ctx, 13, 9, 1, 19, METAL[4]);
      pix(ctx, 12, 19, 5, 5, ZLOTO[2]);                       // zamek
      pix(ctx, 13, 20, 3, 1, ZLOTO[4]);
      pix(ctx, 14, 21, 1, 2, '#3a2a08');
      break;
    }

    case 'ognisko': {
      cien(ctx, 16, 28, 12, 4);
      for (let i = 0; i < 7; i++) {                           // krąg kamieni
        const a = (i / 7) * Math.PI * 2;
        const kx = Math.round(16 + Math.cos(a) * 11), ky = Math.round(24 + Math.sin(a) * 5);
        pix(ctx, kx - 2, ky - 1, 5, 4, KAM[2]);
        pix(ctx, kx - 2, ky - 1, 5, 1, KAM[4]);
        pix(ctx, kx - 2, ky + 2, 5, 1, KAM[0]);
      }
      pix(ctx, 8, 20, 16, 3, DREWNO[1]);                      // polana
      pix(ctx, 8, 20, 16, 1, DREWNO[3]);
      pix(ctx, 11, 17, 12, 3, DREWNO[2]);
      ctx.fillStyle = OGIEN[1];                               // płomień (statyczna baza)
      ctx.beginPath(); ctx.moveTo(16, 2); ctx.lineTo(23, 20); ctx.lineTo(9, 20); ctx.closePath(); ctx.fill();
      ctx.fillStyle = OGIEN[3];
      ctx.beginPath(); ctx.moveTo(16, 7); ctx.lineTo(21, 20); ctx.lineTo(11, 20); ctx.closePath(); ctx.fill();
      ctx.fillStyle = OGIEN[5];
      ctx.beginPath(); ctx.moveTo(16, 13); ctx.lineTo(19, 20); ctx.lineTo(13, 20); ctx.closePath(); ctx.fill();
      pix(ctx, 8, 22, 16, 2, '#3a1a08');                      // żar
      pix(ctx, 12, 22, 3, 1, OGIEN[2]);
      break;
    }

    case 'latarnia': {
      cien(ctx, 16, 29, 8, 3.5);
      pix(ctx, 13, 26, 6, 3, KAM[2]);                         // podstawa
      pix(ctx, 13, 26, 6, 1, KAM[4]);
      slup(ctx, 14, 2, 4, 25, METAL);
      pix(ctx, 12, 1, 8, 2, METAL[1]);
      pix(ctx, 10, -10, 12, 11, METAL[1]);                    // korpus lampy
      pix(ctx, 11, -9, 10, 9, '#2a2a20');
      const g = ctx.createLinearGradient(11, -9, 21, 0);
      g.addColorStop(0, '#fff0b8'); g.addColorStop(1, '#e0a63a');
      ctx.fillStyle = g; ctx.fillRect(12, -8, 8, 7);
      pix(ctx, 13, -7, 2, 3, 'rgba(255,255,255,0.5)');
      pix(ctx, 9, -13, 14, 3, METAL[0]);                      // daszek
      pix(ctx, 9, -13, 14, 1, METAL[3]);
      pix(ctx, 15, -16, 2, 3, METAL[2]);
      break;
    }

    case 'stragan': {
      cien(ctx, 16, 29, 14, 4);
      slup(ctx, 3, 6, 3, 23, DREWNO);
      slup(ctx, 26, 6, 3, 23, DREWNO);
      for (let i = 0; i < 5; i++) {                           // pasiasta markiza
        pix(ctx, i * 7 - 1, -4, 7, 10, i % 2 ? '#b83c2c' : '#e8dcc0');
        pix(ctx, i * 7 - 1, -4, 7, 1, i % 2 ? '#d45a45' : '#f6efdd');
      }
      pix(ctx, -1, 5, 34, 2, 'rgba(0,0,0,0.3)');
      pix(ctx, 4, 17, 24, 10, DREWNO[2]);                     // blat
      pix(ctx, 4, 17, 24, 1, DREWNO[4]);
      pix(ctx, 4, 26, 24, 1, DREWNO[0]);
      pix(ctx, 6, 13, 6, 4, ZLOTO[2]);                        // towar
      pix(ctx, 6, 13, 6, 1, ZLOTO[4]);
      pix(ctx, 14, 12, 5, 5, '#a8412f');
      pix(ctx, 14, 12, 5, 1, '#c2583f');
      pix(ctx, 21, 14, 6, 3, '#3f7a31');
      break;
    }

    case 'tablica': {
      cien(ctx, 16, 29, 9, 3.5);
      slup(ctx, 14, 16, 4, 13, DREWNO);
      pix(ctx, 4, 3, 24, 16, DREWNO[1]);
      pix(ctx, 6, 5, 20, 12, DREWNO[3]);
      pix(ctx, 4, 3, 24, 1, DREWNO[4]);
      pix(ctx, 4, 18, 24, 1, 'rgba(0,0,0,0.35)');
      pix(ctx, 8, 7, 9, 8, '#e4dcc4');                        // kartka
      pix(ctx, 8, 7, 9, 1, '#f4eeda');
      ctx.fillStyle = '#6b5a3a';
      for (let i = 0; i < 4; i++) pix(ctx, 9, 9 + i * 2, 7 - i, 1);
      pix(ctx, 19, 8, 6, 6, '#d8cbb0');
      pix(ctx, 19, 8, 6, 1, '#efe6cf');
      break;
    }

    case 'posag': {
      cien(ctx, 16, 30, 13, 4.5);
      pix(ctx, 6, 24, 20, 6, KAM[2]);                         // cokół
      pix(ctx, 6, 24, 20, 1, KAM[4]);
      pix(ctx, 6, 29, 20, 1, KAM[0]);
      pix(ctx, 9, 19, 14, 5, KAM[3]);
      pix(ctx, 9, 19, 14, 1, KAM[5]);
      pix(ctx, 12, 2, 8, 18, KAM[4]);                         // tułów
      pix(ctx, 12, 2, 3, 18, KAM[5]);
      pix(ctx, 19, 2, 2, 18, KAM[2]);
      kolo(ctx, 16, -2, 4, KAM[5]);                            // głowa
      kolo(ctx, 15, -3, 2, '#9aa2aa');
      pix(ctx, 20, 3, 3, 14, KAM[4]);                          // ramię z mieczem
      pix(ctx, 21, -8, 2, 12, KAM[5]);
      pix(ctx, 19, 3, 6, 2, KAM[3]);
      pix(ctx, 9, 14, 14, 1, 'rgba(0,0,0,0.25)');
      break;
    }

    case 'ruiny': {
      cien(ctx, 16, 29, 14, 4);
      const kolumna = (bx, by, w, h) => {
        pix(ctx, bx, by, w, h, KAM[2]);
        pix(ctx, bx, by, 2, h, KAM[4]);
        pix(ctx, bx + w - 1, by, 1, h, KAM[0]);
        pix(ctx, bx, by, w, 1, KAM[5]);
        for (let i = by + 5; i < by + h; i += 6) pix(ctx, bx, i, w, 1, KAM[1]);
      };
      kolumna(2, 6, 8, 23);
      kolumna(12, 16, 7, 13);
      kolumna(21, -6, 9, 35);
      pix(ctx, 12, 14, 7, 2, KAM[1]);                          // ułamana korona
      pix(ctx, 3, 25, 26, 1, 'rgba(0,0,0,0.25)');
      pix(ctx, 6, 27, 5, 2, KAM[1]);                           // gruz
      pix(ctx, 18, 28, 4, 2, KAM[2]);
      if (s(6) > 0.4) pix(ctx, 4, 20, 4, 2, '#3f6b2c');
      break;
    }

    case 'grob': {
      cien(ctx, 16, 29, 10, 4);
      pix(ctx, 7, 26, 18, 3, '#4a3a22');                       // kopczyk
      pix(ctx, 7, 26, 18, 1, '#5c4a2c');
      ctx.fillStyle = KAM[2];
      ctx.beginPath(); ctx.moveTo(10, 27); ctx.lineTo(10, 13); ctx.arc(16, 13, 6, Math.PI, 0); ctx.lineTo(22, 27); ctx.closePath(); ctx.fill();
      ctx.fillStyle = KAM[4];
      ctx.beginPath(); ctx.moveTo(10, 27); ctx.lineTo(10, 13); ctx.arc(16, 13, 6, Math.PI, Math.PI * 1.5); ctx.lineTo(13, 27); ctx.closePath(); ctx.fill();
      pix(ctx, 15, 9, 2, 11, KAM[0]);                          // krzyż
      pix(ctx, 12, 12, 8, 2, KAM[0]);
      pix(ctx, 21, 13, 1, 14, KAM[1]);
      break;
    }

    case 'siano': {
      cien(ctx, 16, 28, 11, 4);
      ctx.fillStyle = '#9a7a32'; ctx.beginPath(); ctx.ellipse(16, 20, 11, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#b2913f'; ctx.beginPath(); ctx.ellipse(15, 19, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c9a850'; ctx.beginPath(); ctx.ellipse(13, 17, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        pix(ctx, Math.round(16 + Math.cos(a) * 8), Math.round(20 + Math.sin(a) * 6), 3, 1, '#7c6224');
      }
      pix(ctx, 6, 26, 20, 2, 'rgba(0,0,0,0.22)');
      break;
    }

    case 'woz': {
      cien(ctx, 16, 29, 14, 4);
      pix(ctx, 3, 12, 26, 9, DREWNO[2]);                       // skrzynia
      pix(ctx, 3, 12, 26, 1, DREWNO[4]);
      pix(ctx, 3, 20, 26, 1, DREWNO[0]);
      for (let i = 0; i < 6; i++) pix(ctx, 4 + i * 4, 13, 1, 7, DREWNO[1]);
      pix(ctx, 5, 8, 22, 4, '#8a6a32');                        // ładunek
      pix(ctx, 5, 8, 22, 1, '#a88848');
      for (const kx of [9, 23]) {                              // koła
        kolo(ctx, kx, 24, 5, DREWNO[1]);
        kolo(ctx, kx, 24, 3, DREWNO[3]);
        kolo(ctx, kx, 24, 1, METAL[2]);
        pix(ctx, kx - 5, 24, 10, 1, DREWNO[0]);
        pix(ctx, kx, 19, 1, 10, DREWNO[0]);
      }
      pix(ctx, 27, 15, 5, 2, DREWNO[3]);                       // dyszel
      break;
    }

    default: {
      pix(ctx, 8, 8, 16, 16, 'rgba(231,193,88,0.5)');
      pix(ctx, 8, 8, 16, 1, 'rgba(255,255,255,0.4)');
    }
  }
  ctx.restore();
}

// ── Pamięć podręczna kafli ───────────────────────────────────────────────────
const pamiec = new Map();
const MAX_PAMIEC = 6000;

function plotno(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { c, ctx };
}

function zPamieci(klucz, w, h, rysuj) {
  const gotowe = pamiec.get(klucz);
  if (gotowe) return gotowe;
  const { c, ctx } = plotno(w, h);
  rysuj(ctx);
  if (pamiec.size > MAX_PAMIEC) pamiec.clear();
  pamiec.set(klucz, c);
  return c;
}

// maska sąsiadów tego samego obiektu: 1=N 2=E 4=S 8=W
export function maskaSasiadow(kafle, x, y, oid) {
  let m = 0;
  if (kafle[`${x},${y - 1}`]?.o === oid) m |= 1;
  if (kafle[`${x + 1},${y}`]?.o === oid) m |= 2;
  if (kafle[`${x},${y + 1}`]?.o === oid) m |= 4;
  if (kafle[`${x - 1},${y}`]?.o === oid) m |= 8;
  return m;
}

// ── Rysowanie pojedynczego kafla na ekranie ──────────────────────────────────
export function rysujKafelTerenu(ctx, px, py, kafle, x, y, anim = 0) {
  const kafel = kafle[`${x},${y}`];
  const tid = kafel?.t || TEREN_DOMYSLNY;
  const t = TEREN_PO_ID[tid] || TEREN_PO_ID[TEREN_DOMYSLNY];
  const sas = {
    n:  kafle[`${x},${y - 1}`]?.t || TEREN_DOMYSLNY,
    e:  kafle[`${x + 1},${y}`]?.t || TEREN_DOMYSLNY,
    s:  kafle[`${x},${y + 1}`]?.t || TEREN_DOMYSLNY,
    w:  kafle[`${x - 1},${y}`]?.t || TEREN_DOMYSLNY,
    nw: kafle[`${x - 1},${y - 1}`]?.t || TEREN_DOMYSLNY,
    ne: kafle[`${x + 1},${y - 1}`]?.t || TEREN_DOMYSLNY,
    sw: kafle[`${x - 1},${y + 1}`]?.t || TEREN_DOMYSLNY,
    se: kafle[`${x + 1},${y + 1}`]?.t || TEREN_DOMYSLNY,
  };
  // tekstura powtarza się co 8 kafli, więc do klucza wystarczy reszta z 8
  const klucz = `t|${tid}|${x & 7},${y & 7}|${sas.n},${sas.e},${sas.s},${sas.w}|${sas.nw},${sas.ne},${sas.sw},${sas.se}`;
  const canvas = zPamieci(klucz, TILE, TILE, (c) => {
    rysujTerenBazowy(c, t, x, y);
    rysujDetalTerenu(c, t, x, y);
    rysujKrawedzie(c, t, sas, x, y);
  });
  ctx.drawImage(canvas, px, py);

  if (t.woda) {                     // animowane fale rysujemy na wierzchu
    const f  = Math.sin(anim / 520 + (x * 0.9 + y * 1.3)) * 0.5 + 0.5;
    const f2 = Math.sin(anim / 330 + (x * 1.7 - y * 0.8)) * 0.5 + 0.5;
    if (t.swieci) {
      ctx.fillStyle = `rgba(255,170,60,${0.10 + f * 0.20})`;
      ctx.fillRect(px + 3, py + 5 + Math.round(f * 5), TILE - 9, 2);
      ctx.fillStyle = `rgba(255,225,140,${0.08 + f2 * 0.16})`;
      ctx.fillRect(px + 10, py + 19 + Math.round(f2 * 4), TILE - 17, 2);
    } else {
      ctx.fillStyle = `rgba(150,205,240,${0.07 + f * 0.13})`;
      ctx.fillRect(px + 2, py + 6 + Math.round(f * 4), TILE - 8, 1);
      ctx.fillRect(px + 5, py + 7 + Math.round(f * 4), TILE - 14, 1);
      ctx.fillStyle = `rgba(200,230,255,${0.05 + f2 * 0.12})`;
      ctx.fillRect(px + 9, py + 20 + Math.round(f2 * 4), TILE - 17, 1);
      if (f > 0.85) ctx.fillRect(px + 22, py + 12, 2, 1);
    }
  }
}

export function rysujKafelObiektu(ctx, px, py, kafle, x, y, anim = 0) {
  const oid = kafle[`${x},${y}`]?.o;
  if (!oid) return;
  const o = OBIEKT_PO_ID[oid];
  if (!o) return;
  const maska = o.laczy ? maskaSasiadow(kafle, x, y, oid) : 0;
  const klucz = `o|${oid}|${maska}|${x & 3},${y & 3}`;
  const canvas = zPamieci(klucz, OBJ_W, OBJ_H, (c) => rysujObiekt(c, o, x, y, maska));
  ctx.drawImage(canvas, px - OBJ_OX, py - OBJ_OY);

  if (o.rys === 'ognisko' || o.rys === 'latarnia') {   // migotanie światła
    const f = Math.sin(anim / 180 + x * 3 + y) * 0.5 + 0.5;
    const cy = o.rys === 'latarnia' ? py + 4 : py + 16;
    const g = ctx.createRadialGradient(px + 16, cy, 2, px + 16, cy, 30);
    g.addColorStop(0, `rgba(255,190,95,${0.20 + f * 0.14})`);
    g.addColorStop(0.5, `rgba(255,160,60,${0.07 + f * 0.06})`);
    g.addColorStop(1, 'rgba(255,160,60,0)');
    ctx.fillStyle = g;
    ctx.fillRect(px - 14, cy - 30, TILE + 28, 60);
    if (o.rys === 'ognisko') {                          // drgający rdzeń płomienia
      const h = 4 + Math.round(f * 4);
      ctx.fillStyle = `rgba(255,236,170,${0.5 + f * 0.3})`;
      ctx.fillRect(px + 14, py + 20 - h, 3, h);
    }
  }
}

// Podgląd obiektu do palety w edytorze (rysuje cały sprite, także to, co wystaje)
export function rysujPodgladObiektu(ctx, oid, tid = TEREN_DOMYSLNY) {
  const kafle = { '0,0': { t: tid, o: oid } };
  rysujKafelTerenu(ctx, OBJ_OX, OBJ_OY, kafle, 0, 0, 0);
  rysujKafelObiektu(ctx, OBJ_OX, OBJ_OY, kafle, 0, 0, 0);
}

// Liczba kafli wystarczająca, by uznać mapę za narysowaną tym silnikiem
export const czyMapaKaflowa = (kafle, mapa) => {
  const ile = kafle ? Object.keys(kafle).length : 0;
  const pol = ((mapa?.maks_x || 0) + 1) * ((mapa?.maks_y || 0) + 1);
  return ile >= Math.max(64, pol * 0.2);
};
