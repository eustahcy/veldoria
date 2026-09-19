// Veldoria Design System — Leśny MMORPG: trawiasta zieleń · ziemny brąz · złota żółć
export const T = {
  // ── Tła (ziemia, las, mech) ───────────────────────────────────────────────
  bgDeep:    '#2A1A08',   // głęboka ziemia
  bgPanel:   '#3A2410',   // ciemny humus
  bgRaised:  '#4A3018',   // ziemia/kora
  bgHover:   '#5A3D22',   // polana w słońcu
  bgCard:    'rgba(52,32,14,0.97)',

  // ── Zielenie (trawnik, las, natura) ──────────────────────────────────────
  green:       '#4A7A2A',
  greenBright: '#6CB83A',
  greenDim:    '#2D4A1A',
  greenGlow:   'rgba(74,122,42,0.22)',
  greenDark:   '#1A2E0E',

  // ── Brązy (ziemia, drewno, kamień) ────────────────────────────────────────
  brown:       '#7A5020',
  brownBright: '#A67840',
  brownDim:    '#4A3010',
  brownGlow:   'rgba(122,80,32,0.25)',

  // ── Złoto (słońce, monety, ozdoby) ────────────────────────────────────────
  gold:        '#C89620',
  goldBright:  '#E8C030',
  goldDim:     '#7A5A10',
  goldGlow:    'rgba(200,150,32,0.28)',

  // ── Obramowania ───────────────────────────────────────────────────────────
  border:       'rgba(200,150,32,0.28)',
  borderBright: 'rgba(232,192,48,0.58)',
  borderGreen:  'rgba(74,122,42,0.38)',
  borderBrown:  'rgba(122,80,32,0.42)',
  borderGold:   'rgba(232,192,48,0.85)',

  // ── Tekst (pergamin z zielonym odcieniem) ─────────────────────────────────
  text:      '#CDD4AA',   // jasny pergamin
  textMuted: '#7A8A5A',   // mech
  textDim:   '#3A4828',   // ciemny mech
  textTitle: '#E8D070',   // złoty tytuł

  // ── Status ────────────────────────────────────────────────────────────────
  hp:         '#8B0000',
  hpBright:   '#C0392B',
  hpGlow:     'rgba(192,57,43,0.5)',
  exp:        '#2D5A1B',
  expBright:  '#4A7A2A',
  mana:       '#1A3A6B',
  manaBright: '#2471A3',
  red:        '#C0392B',
  orange:     '#D4680A',
  blue:       '#2471A3',
  purple:     '#6A2A8A',

  // ── Efekty ────────────────────────────────────────────────────────────────
  shadow: '0 6px 32px rgba(0,0,0,0.85)',
  glow:   (c) => `0 0 20px ${c}40, 0 0 40px ${c}20`,

  // ── Gradienty ─────────────────────────────────────────────────────────────
  panelGrad: 'linear-gradient(160deg, rgba(58,38,16,0.99) 0%, rgba(38,22,8,0.99) 100%)',
  barGrad:   (c) => `linear-gradient(90deg, ${c}cc, ${c})`,
};

export const panelStyle = {
  background: T.panelGrad,
  border:     `1px solid ${T.borderBright}`,
  borderRadius: 6,
  boxShadow:  `${T.shadow}, inset 0 1px 0 rgba(232,192,48,0.07)`,
};

export const btnGold = {
  background:  'linear-gradient(135deg, #4A3A18 0%, #2A2010 100%)',
  color:       T.goldBright,
  border:      `1px solid ${T.borderBright}`,
  borderRadius: 4,
  cursor:      'pointer',
  fontWeight:  'bold',
  boxShadow:   '0 2px 12px rgba(200,150,32,0.25)',
};

export const btnDanger = {
  background:  'linear-gradient(135deg, #5a1810 0%, #3a0c08 100%)',
  color:       '#f08080',
  border:      '1px solid rgba(192,57,43,0.5)',
  borderRadius: 4,
  cursor:      'pointer',
};
