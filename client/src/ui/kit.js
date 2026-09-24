// Veldoria UI — wspólne kolory i dane dla nowych okien (ciemny grafit + brąz + złoto).
import { useEffect, useState } from 'react';
import { createElement as h } from 'react';
import {
  IconSparkles, IconSkull, IconShield, IconHeart, IconMuscle, IconBow, IconBrain,
  IconStar, IconCrosshair, IconBurst, IconDagger, IconBox, IconRun, IconFlask,
  IconZap, IconSword,
} from '../Icons';

export const C = {
  bg:        '#14161b',
  bgPanel:   '#1b1e24',
  bgSlot:    '#0e1013',
  bgSlotHi:  '#191c22',
  bgHeader:  'linear-gradient(180deg,#2a2d35 0%,#1d2026 100%)',
  line:      '#3a3326',
  bronze:    '#8a6a2c',
  bronzeHi:  '#b8904a',
  gold:      '#e8c05a',
  goldDim:   '#9c7c34',
  text:      '#e6dfcf',
  textMuted: '#9a9282',
  textDim:   '#5f594d',
  ok:        '#6fd86f',
  bad:       '#ff5a4a',
  hp:        '#c23a2e',
  hpHi:      '#e2574a',
  mana:      '#2a62c4',
  manaHi:    '#4b8ef0',
  font:      "'Trebuchet MS', Verdana, sans-serif",
};

// Klasy przedmiotów w bazie → nazwa i kolor rzadkości
export const RARITY = {
  normal:    { label: 'Zwykły',     color: '#c9c2b2' },
  upgraded:  { label: 'Ulepszony',  color: '#6fd86f' },
  unique:    { label: 'Unikatowy',  color: '#e8c05a' },
  unikat:    { label: 'Unikatowy',  color: '#e8c05a' },
  heroic:    { label: 'Heroiczny',  color: '#4b9cff' },
  legendary: { label: 'Legendarny', color: '#ff9a2e' },
  legenda:   { label: 'Legendarny', color: '#ff9a2e' },
  artefact:  { label: 'Artefakt',   color: '#ff4f6d' },
};
export const rarityOf = (item) => RARITY[item?.klasa] || RARITY.normal;

export const TYPE_LABEL = {
  BronJednoreczna: 'Broń jednoręczna', BronDwureczna: 'Broń dwuręczna', BronPomocnicza: 'Broń pomocnicza',
  Laska: 'Laska', Rozdzka: 'Różdżka', BronDystansowa: 'Broń dystansowa', Strzaly: 'Strzały',
  Helm: 'Hełm', Zbroja: 'Zbroja', Tarcza: 'Tarcza', Rekawice: 'Rękawice', Buty: 'Buty',
  Pierscien: 'Pierścień', Naszyjnik: 'Naszyjnik', Talizman: 'Talizman',
  Konsupcyjne: 'Mikstura', Neutralne: 'Przedmiot', Ryba: 'Ryba',
};
export const typeLabel = (t) => TYPE_LABEL[t] || t || 'Przedmiot';

export const WEAPON_TYPES = ['BronJednoreczna', 'BronDwureczna', 'BronPomocnicza', 'Laska', 'Rozdzka', 'BronDystansowa'];

// Statystyki przedmiotu: [pole, etykieta, ikona, formatowanie]
const plus = (k) => (i) => `+${i[k]}`;
const pct = (k) => (i) => `+${i[k]}%`;
export const STAT_DEFS = [
  ['obr_mag',  'Obrażenia magiczne', h(IconSparkles, { size: 11 }), plus('obr_mag')],
  ['obr_poi',  'Obrażenia trucizną', h(IconSkull, { size: 11 }), plus('obr_poi')],
  ['ac',       'Pancerz',            h(IconShield, { size: 11 }), plus('ac')],
  ['acm',      'Odporność magiczna', h(IconSparkles, { size: 11 }), plus('acm')],
  ['zycie',    'Życie',              h(IconHeart, { size: 11 }), plus('zycie')],
  ['sila',     'Siła',               h(IconMuscle, { size: 11 }), plus('sila')],
  ['zrecznosc','Zręczność',          h(IconBow, { size: 11 }), plus('zrecznosc')],
  ['intelekt', 'Intelekt',           h(IconBrain, { size: 11 }), plus('intelekt')],
  ['wszystkie_cechy', 'Wszystkie cechy', h(IconStar, { size: 11 }), plus('wszystkie_cechy')],
  ['sa',       'Celność',            h(IconCrosshair, { size: 11 }), plus('sa')],
  ['ck',       'Szansa na krytyk',   h(IconBurst, { size: 11 }), pct('ck')],
  ['przebicie','Przebicie pancerza', h(IconDagger, { size: 11 }), pct('przebicie')],
  ['absorbcja','Absorpcja obrażeń',  h(IconBox, { size: 11 }), plus('absorbcja')],
  ['mabsorbcja','Absorpcja magii',   h(IconSparkles, { size: 11 }), plus('mabsorbcja')],
  ['unik',     'Unik',               h(IconRun, { size: 11 }), pct('unik')],
  ['blok',     'Blok',               h(IconShield, { size: 11 }), pct('blok')],
  ['leczenie', 'Leczenie',           h(IconHeart, { size: 11 }), plus('leczenie')],
  ['mana',     'Mana',               h(IconFlask, { size: 11 }), plus('mana')],
  ['energia',  'Energia',            h(IconZap, { size: 11 }), plus('energia')],
  ['mikstura_leczenie', 'Leczy',     h(IconFlask, { size: 11 }), (i) => `${i.mikstura_leczenie} HP`],
];

export function itemStats(item) {
  const rows = STAT_DEFS
    .filter(([k]) => Number(item?.[k]) > 0)
    .map(([k, label, icon, fmt]) => ({ key: k, label, icon, value: fmt(item), num: Number(item[k]) }));
  // Siła krytyka pokazujemy tylko gdy różni się od domyślnych 120%
  if (item?.ckf && Number(item.ckf) !== 120 && Number(item.ckf) > 0) {
    rows.push({ key: 'ckf', label: 'Siła krytyka', icon: h(IconBurst, { size: 11 }), value: `${item.ckf}%`, num: Number(item.ckf) });
  }
  if (item?.pelne_leczenie) rows.push({ key: 'pelne', label: 'Leczy', icon: h(IconFlask, { size: 11 }), value: 'całe HP', num: 1 });
  return rows;
}

// Główna wartość na karcie: atak dla broni, pancerz dla zbroi, inaczej brak
export function headline(item) {
  if (Number(item?.obr_max) > 0) return { label: 'ATAK', value: `${item.obr_min}–${item.obr_max}`, num: (Number(item.obr_min) + Number(item.obr_max)) / 2 };
  if (Number(item?.ac) > 0) return { label: 'PANCERZ', value: String(item.ac), num: Number(item.ac) };
  return null;
}

export function fmtNum(n) {
  n = Number(n) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1e4) return (n / 1e3).toFixed(1).replace('.0', '') + 'K';
  return n.toLocaleString('pl-PL');
}

// Telefon / wąskie okno
export function useIsNarrow(breakpoint = 720) {
  const get = () => typeof window !== 'undefined' && window.innerWidth < breakpoint;
  const [narrow, setNarrow] = useState(get);
  useEffect(() => {
    const on = () => setNarrow(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return narrow;
}
