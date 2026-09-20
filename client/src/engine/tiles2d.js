// Autorski silnik kafli 2D (widok z góry).
//
// Kafle i obiekty są rysowane kodem — nie potrzebujemy kupionych grafik.
// Każdy kafel jest rysowany raz do pamięci podręcznej (offscreen canvas) i dalej
// tylko kopiowany, więc rysowanie dużej mapy jest tanie.
//
// Dane mapy trzymamy w tym samym formacie co edytor izometryczny:
//   { "x,y": { t: 'trawa', o: 'drzewo' } }
// dzięki czemu zapis różnicowy i kolizje na serwerze działają bez zmian.

export const TILE = 32;

// ── Teren ────────────────────────────────────────────────────────────────────
// war = warstwa (wyższa zamalowuje krawędź niższej), woda = animacja + blok
export const TERENY = [
  { id: 'trawa',  nazwa: 'Trawa',       war: 1, kolory: ['#3f6b2e', '#487733', '#54853c'], plamy: '#355f27' },
  { id: 'trawa2', nazwa: 'Trawa sucha', war: 1, kolory: ['#6f7c35', '#7d8a3c', '#879444'], plamy: '#626e2d' },
  { id: 'ziemia', nazwa: 'Ziemia',      war: 2, kolory: ['#5d4128', '#6b4b2e', '#745234'], plamy: '#4e3621' },
  { id: 'droga',  nazwa: 'Droga',       war: 3, kolory: ['#7d6848', '#8a7350', '#937c58'], plamy: '#6d5a3e' },
  { id: 'bruk',   nazwa: 'Bruk',        war: 4, kolory: ['#63636a', '#6e6e75', '#7a7a82'], plamy: '#55555b', cegly: true },
  { id: 'piasek', nazwa: 'Piasek',      war: 2, kolory: ['#bfa66e', '#c9b077', '#d3bb84'], plamy: '#ae9660' },
  { id: 'deski',  nazwa: 'Deski',       war: 4, kolory: ['#7c5530', '#8a5f33', '#97683a'], plamy: '#6a4828', deski: true },
  { id: 'kamien', nazwa: 'Skała',       war: 3, kolory: ['#51555a', '#5b5f63', '#666a6f'], plamy: '#45484c' },
  { id: 'snieg',  nazwa: 'Śnieg',       war: 3, kolory: ['#cfd9e2', '#d8e2ea', '#e6eef4'], plamy: '#bcc7d2' },
  { id: 'woda',   nazwa: 'Woda',        war: 0, kolory: ['#2b619b', '#2f6aa8', '#3579bd'], plamy: '#27578c', woda: true, blok: true },
  { id: 'lawa',   nazwa: 'Lawa',        war: 0, kolory: ['#b03f18', '#c2481c', '#e0602a'], plamy: '#8e3312', woda: true, blok: true, swieci: true },
];
export const TEREN_PO_ID = Object.fromEntries(TERENY.map(t => [t.id, t]));
export const TEREN_DOMYSLNY = 'trawa';

// ── Obiekty ──────────────────────────────────────────────────────────────────
// rys = sposób rysowania, blok = zatrzymuje gracza, laczy = autokafelkowanie
export const OBIEKTY = [
  { id: 'drzewo',   nazwa: 'Świerk',    rys: 'swierk',  blok: true,  grupa: 'Natura' },
  { id: 'drzewo2',  nazwa: 'Dąb',       rys: 'dab',     blok: true,  grupa: 'Natura' },
  { id: 'krzak',    nazwa: 'Krzak',     rys: 'krzak',   blok: false, grupa: 'Natura' },
  { id: 'kwiaty',   nazwa: 'Kwiaty',    rys: 'kwiaty',  blok: false, grupa: 'Natura' },
  { id: 'trzcina',  nazwa: 'Trzcina',   rys: 'trzcina', blok: false, grupa: 'Natura' },
  { id: 'glaz',     nazwa: 'Głaz',      rys: 'glaz',    blok: true,  grupa: 'Natura' },
  { id: 'pniak',    nazwa: 'Pniak',     rys: 'pniak',   blok: true,  grupa: 'Natura' },

  { id: 'mur',      nazwa: 'Mur',       rys: 'mur',     blok: true,  laczy: true, grupa: 'Budowle' },
  { id: 'dach',     nazwa: 'Dach',      rys: 'dach',    blok: true,  laczy: true, grupa: 'Budowle' },
  { id: 'dach2',    nazwa: 'Dach niebieski', rys: 'dach2', blok: true, laczy: true, grupa: 'Budowle' },
  { id: 'sciana',   nazwa: 'Ściana domu', rys: 'sciana', blok: true, laczy: true, grupa: 'Budowle' },
  { id: 'drzwi',    nazwa: 'Drzwi',     rys: 'drzwi',   blok: true,  grupa: 'Budowle' },
  { id: 'okno',     nazwa: 'Okno',      rys: 'okno',    blok: true,  grupa: 'Budowle' },
  { id: 'plot',     nazwa: 'Płot',      rys: 'plot',    blok: true,  laczy: true, grupa: 'Budowle' },
  { id: 'brama',    nazwa: 'Brama',     rys: 'brama',   blok: false, grupa: 'Budowle' },
  { id: 'schody',   nazwa: 'Schody',    rys: 'schody',  blok: false, grupa: 'Budowle' },
  { id: 'most',     nazwa: 'Most',      rys: 'most',    blok: false, laczy: true, grupa: 'Budowle' },

  { id: 'studnia',  nazwa: 'Studnia',   rys: 'studnia', blok: true,  grupa: 'Dekoracje' },
  { id: 'beczka',   nazwa: 'Beczka',    rys: 'beczka',  blok: true,  grupa: 'Dekoracje' },
  { id: 'skrzynia', nazwa: 'Skrzynia',  rys: 'skrzynia',blok: true,  grupa: 'Dekoracje' },
  { id: 'ognisko',  nazwa: 'Ognisko',   rys: 'ognisko', blok: true,  grupa: 'Dekoracje' },
  { id: 'latarnia', nazwa: 'Latarnia',  rys: 'latarnia',blok: true,  grupa: 'Dekoracje' },
  { id: 'stragan',  nazwa: 'Stragan',   rys: 'stragan', blok: true,  grupa: 'Dekoracje' },
  { id: 'tablica',  nazwa: 'Tablica',   rys: 'tablica', blok: true,  grupa: 'Dekoracje' },
  { id: 'posag',    nazwa: 'Posąg',     rys: 'posag',   blok: true,  grupa: 'Dekoracje' },
  { id: 'ruiny',    nazwa: 'Ruiny',     rys: 'ruiny',   blok: true,  grupa: 'Dekoracje' },
  { id: 'grob',     nazwa: 'Nagrobek',  rys: 'grob',    blok: true,  grupa: 'Dekoracje' },
];
export const OBIEKT_PO_ID = Object.fromEntries(OBIEKTY.map(o => [o.id, o]));
export const GRUPY_OBIEKTOW = [...new Set(OBIEKTY.map(o => o.grupa))];

export const blokujeKafel = (kafel) => {
  if (!kafel) return false;
  const t = TEREN_PO_ID[kafel.t];
  const o = OBIEKT_PO_ID[kafel.o];
  return !!(t?.blok || o?.blok);
};

// ── Pomocnicze ───────────────────────────────────────────────────────────────
// Deterministyczny szum — ten sam kafel zawsze wygląda tak samo
export function szum(x, y, s = 0) {
  const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return n - Math.floor(n);
}
const wybierz = (tab, x, y, s = 0) => tab[Math.floor(szum(x, y, s) * tab.length) % tab.length];

// ── Rysowanie terenu ─────────────────────────────────────────────────────────
function rysujTerenBazowy(ctx, t, x, y) {
  ctx.fillStyle = wybierz(t.kolory, x, y, 1);
  ctx.fillRect(0, 0, TILE, TILE);

  if (t.cegly) {                       // bruk — kostka z fugami
    ctx.fillStyle = t.plamy;
    for (let r = 0; r < 4; r++) {
      const przes = r % 2 ? 4 : 0;
      for (let c = 0; c < 4; c++) {
        const bx = c * 8 + przes - 8, by = r * 8;
        ctx.fillStyle = wybierz(t.kolory, x * 4 + c, y * 4 + r, 2);
        ctx.fillRect(bx + 1, by + 1, 7, 7);
      }
    }
    return;
  }
  if (t.deski) {                       // podłoga z desek
    for (let r = 0; r < 4; r++) {
      ctx.fillStyle = wybierz(t.kolory, x, y * 4 + r, 3);
      ctx.fillRect(0, r * 8, TILE, 7);
      ctx.fillStyle = t.plamy;
      ctx.fillRect(0, r * 8 + 7, TILE, 1);
    }
    return;
  }
  // trawa, ziemia, piasek… — drobne plamki
  const ile = t.woda ? 0 : 9;
  ctx.fillStyle = t.plamy;
  for (let i = 0; i < ile; i++) {
    const px = Math.floor(szum(x * 31 + i, y * 17, 4) * TILE);
    const py = Math.floor(szum(x * 13, y * 29 + i, 5) * TILE);
    ctx.fillRect(px, py, 2, 2);
  }
  ctx.fillStyle = t.kolory[2];
  for (let i = 0; i < ile - 4; i++) {
    const px = Math.floor(szum(x * 7 + i, y * 43, 6) * TILE);
    const py = Math.floor(szum(x * 53, y * 11 + i, 7) * TILE);
    ctx.fillRect(px, py, 2, 1);
  }
}

// Miękkie przejście do sąsiada o niższej warstwie (rozsypane piksele)
function rysujKrawedzie(ctx, t, sasiedzi, x, y) {
  const boki = [
    ['n', (i) => [i, 0], (i, d) => [i, d]],
    ['s', (i) => [i, TILE - 1], (i, d) => [i, TILE - 1 - d]],
    ['w', (i) => [0, i], (i, d) => [d, i]],
    ['e', (i) => [TILE - 1, i], (i, d) => [TILE - 1 - d, i]],
  ];
  for (const [kier, , punkt] of boki) {
    const s = TEREN_PO_ID[sasiedzi[kier]];
    if (!s || s.id === t.id || s.war >= t.war) continue;   // rysujemy tylko „nasz” brzeg na niższym terenie
    ctx.fillStyle = s.kolory[1];
    for (let i = 0; i < TILE; i += 2) {
      const glebokosc = 2 + Math.floor(szum(x * 61 + i, y * 17, kier.charCodeAt(0)) * 4);
      for (let d = 0; d < glebokosc; d += 2) {
        const [px, py] = punkt(i, d);
        ctx.fillRect(px, py, 2, 2);
      }
    }
  }
}

// ── Rysowanie obiektów ───────────────────────────────────────────────────────
const cien = (ctx, w = 20, h = 8, oy = 0) => {
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(TILE / 2, TILE - 5 + oy, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
};
const prostokat = (ctx, x, y, w, h, kolor) => { ctx.fillStyle = kolor; ctx.fillRect(x, y, w, h); };

function rysujObiekt(ctx, o, x, y, maska) {
  const s = (a, b = 0) => szum(x, y, a + b);
  switch (o.rys) {
    case 'swierk': {
      cien(ctx, 18, 7);
      prostokat(ctx, 15, 20, 3, 9, '#4a3423');
      for (let i = 0; i < 3; i++) {
        const w = 20 - i * 5, yy = 16 - i * 6;
        ctx.fillStyle = i === 2 ? '#2f5a28' : i === 1 ? '#2a5124' : '#24471f';
        ctx.beginPath();
        ctx.moveTo(TILE / 2, yy - 7);
        ctx.lineTo(TILE / 2 + w / 2, yy + 6);
        ctx.lineTo(TILE / 2 - w / 2, yy + 6);
        ctx.closePath(); ctx.fill();
      }
      prostokat(ctx, 12, 2, 3, 3, '#376b2e');
      break;
    }
    case 'dab': {
      cien(ctx, 22, 8);
      prostokat(ctx, 14, 19, 5, 10, '#57391f');
      const kolory = ['#3d7030', '#457c36', '#356428'];
      const kule = [[16, 12, 11], [10, 15, 7], [22, 15, 7], [16, 7, 7]];
      kule.forEach(([cx, cy, r], i) => {
        ctx.fillStyle = kolory[i % 3];
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      });
      break;
    }
    case 'krzak': {
      cien(ctx, 16, 6);
      ctx.fillStyle = '#356b2c';
      [[12, 22, 7], [20, 22, 6], [16, 18, 7]].forEach(([cx, cy, r]) => {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#3f7d34';
      ctx.beginPath(); ctx.arc(14, 19, 4, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'kwiaty': {
      const barwy = ['#e2d44a', '#e06a8a', '#b98ae0', '#e9e3d0'];
      for (let i = 0; i < 5; i++) {
        const px = 4 + Math.floor(s(i) * 24), py = 12 + Math.floor(s(i, 9) * 16);
        prostokat(ctx, px, py + 2, 1, 4, '#3a6b2c');
        prostokat(ctx, px - 1, py, 3, 3, barwy[i % barwy.length]);
      }
      break;
    }
    case 'trzcina': {
      for (let i = 0; i < 6; i++) {
        const px = 3 + i * 5 + Math.floor(s(i) * 2);
        const h = 10 + Math.floor(s(i, 3) * 10);
        prostokat(ctx, px, TILE - 4 - h, 2, h, '#6f8a3a');
        prostokat(ctx, px - 1, TILE - 6 - h, 4, 3, '#8a6a32');
      }
      break;
    }
    case 'glaz': {
      cien(ctx, 22, 8);
      ctx.fillStyle = '#6a6e73';
      ctx.beginPath();
      ctx.moveTo(6, 27); ctx.lineTo(9, 14); ctx.lineTo(18, 9); ctx.lineTo(26, 16); ctx.lineTo(25, 27);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7d8187';
      ctx.beginPath(); ctx.moveTo(10, 15); ctx.lineTo(18, 10); ctx.lineTo(22, 16); ctx.closePath(); ctx.fill();
      prostokat(ctx, 12, 20, 6, 2, '#565a5e');
      break;
    }
    case 'pniak': {
      cien(ctx, 18, 7);
      prostokat(ctx, 10, 18, 12, 10, '#5b3d22');
      ctx.fillStyle = '#7a5531';
      ctx.beginPath(); ctx.ellipse(16, 18, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#5b3d22'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(16, 18, 3, 1.5, 0, 0, Math.PI * 2); ctx.stroke();
      break;
    }
    case 'mur': case 'sciana': {
      const kam = o.rys === 'mur';
      const baza = kam ? ['#6f7378', '#7b7f85', '#63676b'] : ['#9a8468', '#a68e70', '#8b765d'];
      ctx.fillStyle = baza[0]; ctx.fillRect(0, 0, TILE, TILE);
      for (let r = 0; r < 4; r++) {
        const przes = r % 2 ? 5 : 0;
        for (let c = -1; c < 4; c++) {
          ctx.fillStyle = wybierz(baza, x * 5 + c, y * 5 + r, 11);
          ctx.fillRect(c * 9 + przes + 1, r * 8 + 1, 8, 7);
        }
      }
      if (!(maska & 1)) prostokat(ctx, 0, 0, TILE, 3, 'rgba(255,255,255,0.14)');   // światło od góry
      if (!(maska & 4)) prostokat(ctx, 0, TILE - 4, TILE, 4, 'rgba(0,0,0,0.35)');  // cień u dołu
      break;
    }
    case 'dach': case 'dach2': {
      const czerwony = o.rys === 'dach';
      const jasny = czerwony ? '#a8412f' : '#3d5d99';
      const sredni = czerwony ? '#8e3526' : '#33507f';
      const ciemny = czerwony ? '#6f281d' : '#27406a';
      ctx.fillStyle = sredni; ctx.fillRect(0, 0, TILE, TILE);
      for (let r = 0; r < 4; r++) {
        const przes = r % 2 ? 4 : 0;
        for (let c = -1; c < 5; c++) {
          ctx.fillStyle = wybierz([jasny, sredni, ciemny], x * 4 + c, y * 4 + r, 12);
          ctx.beginPath();
          ctx.arc(c * 8 + przes + 4, r * 8 + 4, 4.4, Math.PI, 0);
          ctx.fill();
        }
      }
      if (!(maska & 1)) prostokat(ctx, 0, 0, TILE, 4, '#d8cdbb');                  // kalenica
      if (!(maska & 4)) prostokat(ctx, 0, TILE - 3, TILE, 3, 'rgba(0,0,0,0.4)');   // okap
      break;
    }
    case 'okno': {
      ctx.fillStyle = '#9a8468'; ctx.fillRect(0, 0, TILE, TILE);
      prostokat(ctx, 6, 7, 20, 17, '#3a2d1f');
      prostokat(ctx, 8, 9, 16, 13, '#e8c86a');
      prostokat(ctx, 15, 9, 2, 13, '#3a2d1f');
      prostokat(ctx, 8, 14, 16, 2, '#3a2d1f');
      break;
    }
    case 'drzwi': {
      ctx.fillStyle = '#9a8468'; ctx.fillRect(0, 0, TILE, TILE);
      prostokat(ctx, 7, 6, 18, 26, '#4a3120');
      prostokat(ctx, 9, 8, 14, 24, '#6b4527');
      for (let i = 0; i < 3; i++) prostokat(ctx, 10 + i * 5, 8, 1, 24, '#4a3120');
      prostokat(ctx, 19, 20, 2, 2, '#e0c060');
      break;
    }
    case 'plot': {
      const poziom = (maska & 2) || (maska & 8);
      const pion = (maska & 1) || (maska & 4);
      ctx.fillStyle = '#6b4527';
      if (poziom || !pion) { ctx.fillRect(0, 13, TILE, 3); ctx.fillRect(0, 21, TILE, 3); }
      if (pion) { ctx.fillRect(14, 0, 3, TILE); }
      for (let i = 0; i < 3; i++) {
        const px = 3 + i * 11;
        prostokat(ctx, px, 8, 3, 18, '#7c5530');
        prostokat(ctx, px, 8, 3, 2, '#8d6337');
      }
      break;
    }
    case 'brama': {
      prostokat(ctx, 0, 6, 5, 26, '#6f7378');
      prostokat(ctx, 27, 6, 5, 26, '#6f7378');
      prostokat(ctx, 5, 6, 22, 4, '#5b3d22');
      prostokat(ctx, 9, 2, 14, 4, '#8a6a32');
      break;
    }
    case 'schody': {
      for (let i = 0; i < 4; i++) {
        prostokat(ctx, 2, 4 + i * 7, 28, 5, i % 2 ? '#7a7e83' : '#8a8e93');
        prostokat(ctx, 2, 9 + i * 7, 28, 2, '#5f6367');
      }
      break;
    }
    case 'most': {
      prostokat(ctx, 0, 2, TILE, 28, '#8a5f33');
      for (let i = 0; i < 4; i++) prostokat(ctx, i * 8 + 1, 2, 6, 28, '#97683a');
      prostokat(ctx, 0, 0, TILE, 3, '#6b4527');
      prostokat(ctx, 0, 29, TILE, 3, '#6b4527');
      break;
    }
    case 'studnia': {
      cien(ctx, 24, 9);
      ctx.fillStyle = '#6f7378';
      ctx.beginPath(); ctx.ellipse(16, 22, 11, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#14304a';
      ctx.beginPath(); ctx.ellipse(16, 22, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
      prostokat(ctx, 6, 4, 3, 16, '#6b4527');
      prostokat(ctx, 23, 4, 3, 16, '#6b4527');
      prostokat(ctx, 4, 2, 24, 4, '#8e3526');
      break;
    }
    case 'beczka': {
      cien(ctx, 16, 6);
      prostokat(ctx, 10, 12, 12, 16, '#7c5530');
      prostokat(ctx, 10, 15, 12, 2, '#4a3120');
      prostokat(ctx, 10, 23, 12, 2, '#4a3120');
      ctx.fillStyle = '#8d6337';
      ctx.beginPath(); ctx.ellipse(16, 12, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'skrzynia': {
      cien(ctx, 18, 6);
      prostokat(ctx, 7, 14, 18, 14, '#7c5530');
      prostokat(ctx, 7, 14, 18, 4, '#8d6337');
      prostokat(ctx, 14, 14, 4, 14, '#c9a227');
      break;
    }
    case 'ognisko': {
      cien(ctx, 20, 7);
      ctx.fillStyle = '#5b5f63';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath(); ctx.arc(16 + Math.cos(a) * 10, 24 + Math.sin(a) * 5, 3, 0, Math.PI * 2); ctx.fill();
      }
      prostokat(ctx, 10, 20, 12, 3, '#5b3d22');
      ctx.fillStyle = '#e0762a';
      ctx.beginPath(); ctx.moveTo(16, 8); ctx.lineTo(21, 21); ctx.lineTo(11, 21); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f0c040';
      ctx.beginPath(); ctx.moveTo(16, 13); ctx.lineTo(19, 21); ctx.lineTo(13, 21); ctx.closePath(); ctx.fill();
      break;
    }
    case 'latarnia': {
      cien(ctx, 12, 5);
      prostokat(ctx, 14, 12, 4, 17, '#4a4a4e');
      prostokat(ctx, 10, 4, 12, 10, '#5b5f63');
      prostokat(ctx, 12, 6, 8, 6, '#ffd77a');
      prostokat(ctx, 9, 2, 14, 3, '#3f4245');
      break;
    }
    case 'stragan': {
      cien(ctx, 26, 8);
      prostokat(ctx, 3, 10, 26, 5, '#8e3526');
      prostokat(ctx, 3, 10, 26, 2, '#a8412f');
      prostokat(ctx, 4, 15, 3, 14, '#6b4527');
      prostokat(ctx, 25, 15, 3, 14, '#6b4527');
      prostokat(ctx, 6, 20, 20, 8, '#7c5530');
      prostokat(ctx, 8, 17, 5, 4, '#c9a227');
      prostokat(ctx, 17, 17, 6, 4, '#a8412f');
      break;
    }
    case 'tablica': {
      cien(ctx, 14, 5);
      prostokat(ctx, 14, 16, 4, 13, '#6b4527');
      prostokat(ctx, 5, 5, 22, 14, '#8d6337');
      prostokat(ctx, 7, 7, 18, 10, '#d8cdbb');
      ctx.fillStyle = '#6b4527';
      for (let i = 0; i < 4; i++) prostokat(ctx, 9, 9 + i * 2, 12 - i * 2, 1);
      break;
    }
    case 'posag': {
      cien(ctx, 22, 8);
      prostokat(ctx, 8, 24, 16, 5, '#6f7378');
      prostokat(ctx, 11, 20, 10, 5, '#7b7f85');
      prostokat(ctx, 13, 8, 6, 13, '#8f939a');
      ctx.fillStyle = '#9aa0a6';
      ctx.beginPath(); ctx.arc(16, 6, 4, 0, Math.PI * 2); ctx.fill();
      prostokat(ctx, 19, 10, 3, 9, '#8f939a');
      break;
    }
    case 'ruiny': {
      cien(ctx, 24, 8);
      prostokat(ctx, 4, 12, 7, 17, '#787c81');
      prostokat(ctx, 13, 18, 6, 11, '#6f7378');
      prostokat(ctx, 21, 8, 7, 21, '#7b7f85');
      prostokat(ctx, 4, 12, 7, 3, '#8a8e93');
      prostokat(ctx, 21, 8, 7, 3, '#8a8e93');
      break;
    }
    case 'grob': {
      cien(ctx, 16, 6);
      ctx.fillStyle = '#7b7f85';
      ctx.beginPath();
      ctx.moveTo(10, 28); ctx.lineTo(10, 14); ctx.arc(16, 14, 6, Math.PI, 0); ctx.lineTo(22, 28);
      ctx.closePath(); ctx.fill();
      prostokat(ctx, 15, 10, 2, 10, '#5f6367');
      prostokat(ctx, 12, 13, 8, 2, '#5f6367');
      break;
    }
    default: {
      ctx.fillStyle = 'rgba(231,193,88,0.5)';
      ctx.fillRect(6, 6, 20, 20);
    }
  }
}

// ── Pamięć podręczna kafli ───────────────────────────────────────────────────
const pamiec = new Map();
const MAX_PAMIEC = 4000;

function plotno() {
  const c = document.createElement('canvas');
  c.width = TILE; c.height = TILE;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { c, ctx };
}

// Klucz musi zawierać wszystko, co wpływa na wygląd kafla
function zPamieci(klucz, rysuj) {
  let c = pamiec.get(klucz);
  if (c) return c;
  const { c: canvas, ctx } = plotno();
  rysuj(ctx);
  if (pamiec.size > MAX_PAMIEC) pamiec.clear();
  pamiec.set(klucz, canvas);
  return canvas;
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
  const sasiedzi = {
    n: kafle[`${x},${y - 1}`]?.t || TEREN_DOMYSLNY,
    e: kafle[`${x + 1},${y}`]?.t || TEREN_DOMYSLNY,
    s: kafle[`${x},${y + 1}`]?.t || TEREN_DOMYSLNY,
    w: kafle[`${x - 1},${y}`]?.t || TEREN_DOMYSLNY,
  };
  const klucz = `t|${tid}|${x % 8},${y % 8}|${sasiedzi.n},${sasiedzi.e},${sasiedzi.s},${sasiedzi.w}`;
  const canvas = zPamieci(klucz, (c) => {
    rysujTerenBazowy(c, t, x, y);
    rysujKrawedzie(c, t, sasiedzi, x, y);
  });
  ctx.drawImage(canvas, px, py);

  if (t.woda) {                     // animowane refleksy rysujemy na wierzchu
    const f = Math.sin(anim / 520 + (x * 0.9 + y * 1.3)) * 0.5 + 0.5;
    ctx.fillStyle = t.swieci ? `rgba(255,190,90,${0.10 + f * 0.18})` : `rgba(180,220,255,${0.06 + f * 0.12})`;
    ctx.fillRect(px + 2, py + 6 + Math.round(f * 4), TILE - 8, 2);
    ctx.fillRect(px + 8, py + 18 + Math.round((1 - f) * 4), TILE - 16, 2);
  }
}

export function rysujKafelObiektu(ctx, px, py, kafle, x, y, anim = 0) {
  const oid = kafle[`${x},${y}`]?.o;
  if (!oid) return;
  const o = OBIEKT_PO_ID[oid];
  if (!o) return;
  const maska = o.laczy ? maskaSasiadow(kafle, x, y, oid) : 0;
  const klucz = `o|${oid}|${maska}|${x % 8},${y % 8}`;
  const canvas = zPamieci(klucz, (c) => rysujObiekt(c, o, x, y, maska));
  ctx.drawImage(canvas, px, py);

  if (o.rys === 'ognisko' || o.rys === 'latarnia') {   // migotanie światła
    const f = Math.sin(anim / 180 + x * 3 + y) * 0.5 + 0.5;
    const g = ctx.createRadialGradient(px + 16, py + 16, 2, px + 16, py + 16, 26);
    g.addColorStop(0, `rgba(255,180,80,${0.18 + f * 0.12})`);
    g.addColorStop(1, 'rgba(255,180,80,0)');
    ctx.fillStyle = g;
    ctx.fillRect(px - 10, py - 10, TILE + 20, TILE + 20);
  }
}

// Liczba kafli wystarczająca, by uznać mapę za narysowaną tym silnikiem
export const czyMapaKaflowa = (kafle, mapa) => {
  const ile = kafle ? Object.keys(kafle).length : 0;
  const pol = ((mapa?.maks_x || 0) + 1) * ((mapa?.maks_y || 0) + 1);
  return ile >= Math.max(64, pol * 0.2);
};
