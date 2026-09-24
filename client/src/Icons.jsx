// Inline SVG icon set — Heroicons outline style
function Svg({ children, size = 14, style = {} }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ display:'inline-block', verticalAlign:'middle', flexShrink:0, ...style }}
    >
      {children}
    </svg>
  );
}

export function IconSword({ size }) {
  return (
    <Svg size={size}>
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5M10 14L3 21M18 3l3 3-9 9M14.5 6.5l3 3" />
    </Svg>
  );
}
export function IconShield({ size }) {
  return (
    <Svg size={size}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}
export function IconHeart({ size }) {
  return (
    <Svg size={size}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </Svg>
  );
}
export function IconStar({ size }) {
  return (
    <Svg size={size}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Svg>
  );
}
export function IconZap({ size }) {
  return (
    <Svg size={size}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </Svg>
  );
}
export function IconBrain({ size }) {
  return (
    <Svg size={size}>
      <path d="M9.5 2a2.5 2.5 0 015 0M9.5 2C7 2 5 4 5 6.5c0 1.5.6 2.8 1.6 3.7C5.1 11 4 12.4 4 14c0 2.8 2.4 5 5.5 5H11m2.5-17C16 2 18 4 18 6.5c0 1.5-.6 2.8-1.6 3.7C17.9 11 19 12.4 19 14c0 2.8-2.4 5-5.5 5H13m-2 0v3m0-3a1 1 0 012 0m-2 0a1 1 0 00-2 0v3m4-3a1 1 0 012 0v3" />
    </Svg>
  );
}
export function IconCoin({ size }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M9 10.5c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5-1.3 2.5-3 2.5-3 1.1-3 2.5S10.7 18 12 18s3-1.1 3-2.5" />
    </Svg>
  );
}
export function IconBag({ size }) {
  return (
    <Svg size={size}>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </Svg>
  );
}
export function IconPlus({ size }) {
  return (
    <Svg size={size}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}
export function IconTrash({ size }) {
  return (
    <Svg size={size}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
    </Svg>
  );
}
export function IconChat({ size }) {
  return (
    <Svg size={size}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
    </Svg>
  );
}
export function IconCart({ size }) {
  return (
    <Svg size={size}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
    </Svg>
  );
}
export function IconGlobe({ size }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </Svg>
  );
}
export function IconLogout({ size }) {
  return (
    <Svg size={size}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </Svg>
  );
}
export function IconArrowLeft({ size }) {
  return (
    <Svg size={size}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </Svg>
  );
}
export function IconCheck({ size }) {
  return (
    <Svg size={size}>
      <polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}
export function IconX({ size }) {
  return (
    <Svg size={size}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  );
}
export function IconUser({ size }) {
  return (
    <Svg size={size}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Svg>
  );
}
export function IconUsers({ size }) {
  return (
    <Svg size={size}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      <circle cx="9" cy="7" r="4" />
    </Svg>
  );
}
export function IconMap({ size }) {
  return (
    <Svg size={size}>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </Svg>
  );
}
export function IconSparkles({ size }) {
  return (
    <Svg size={size}>
      <path d="M12 3L13.5 8.5H19L14.5 12L16 17.5L12 14L8 17.5L9.5 12L5 8.5H10.5L12 3z" />
      <path d="M5 3l.5 2 .5-2M19 15l.5 2 .5-2" />
    </Svg>
  );
}
export function IconCrosshair({ size }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="10" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </Svg>
  );
}
export function IconRun({ size }) {
  return (
    <Svg size={size}>
      <circle cx="13" cy="4" r="2" />
      <path d="M7 22L9.5 15 12 17l3-8M17 10l-5-2-2 5 2 2M5 12l2-4" />
    </Svg>
  );
}
export function IconScroll({ size }) {
  return (
    <Svg size={size}>
      <path d="M8 21h12a2 2 0 002-2V7a2 2 0 00-2-2H8a2 2 0 00-2 2v14z" />
      <path d="M4 7a2 2 0 012-2h2M4 7a2 2 0 000 4h2M6 11V7" />
      <line x1="11" y1="9" x2="16" y2="9" />
      <line x1="11" y1="13" x2="16" y2="13" />
      <line x1="11" y1="17" x2="14" y2="17" />
    </Svg>
  );
}
export function IconBanner({ size }) {
  return (
    <Svg size={size}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </Svg>
  );
}
export function IconTunic({ size }) {
  return (
    <Svg size={size}>
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
    </Svg>
  );
}
export function IconMail({ size }) {
  return (
    <Svg size={size}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </Svg>
  );
}
export function IconSearch({ size }) {
  return (
    <Svg size={size}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}
export function IconTrophy({ size }) {
  return (
    <Svg size={size}>
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0012 0V2z" />
    </Svg>
  );
}
export function IconFlag({ size }) {
  return (
    <Svg size={size}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </Svg>
  );
}
export function IconGift({ size }) {
  return (
    <Svg size={size}>
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </Svg>
  );
}
export function IconTrendingUp({ size }) {
  return (
    <Svg size={size}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </Svg>
  );
}
export function IconAward({ size }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </Svg>
  );
}
export function IconChevronRight({ size }) {
  return (
    <Svg size={size}>
      <polyline points="9 18 15 12 9 6" />
    </Svg>
  );
}
export function IconEdit({ size }) {
  return (
    <Svg size={size}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Svg>
  );
}
export function IconSave({ size }) {
  return (
    <Svg size={size}>
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </Svg>
  );
}
export function IconArrowUp({ size }) {
  return (
    <Svg size={size}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </Svg>
  );
}
export function IconArrowDown({ size }) {
  return (
    <Svg size={size}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </Svg>
  );
}
export function IconClock({ size }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </Svg>
  );
}
export function IconCastle({ size }) {
  return (
    <Svg size={size}>
      <path d="M22 20v-9H2v9a2 2 0 002 2h16a2 2 0 002-2z" />
      <path d="M18 11V4h-4v3h-4V4H6v7" />
      <line x1="2" y1="11" x2="22" y2="11" />
      <line x1="12" y1="11" x2="12" y2="22" />
      <line x1="6" y1="15" x2="6" y2="20" />
      <line x1="18" y1="15" x2="18" y2="20" />
    </Svg>
  );
}

// ── Uzupełnienie zestawu: ikony w miejsce emoji ──────────────────────────────
export function IconMapPin({ size }) {
  return (
    <Svg size={size}>
      <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  );
}
export function IconCompass({ size }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" />
      <polygon points="15.5 8.5 10.5 10.5 8.5 15.5 13.5 13.5" />
    </Svg>
  );
}
export function IconBow({ size }) {
  return (
    <Svg size={size}>
      <path d="M4 20L20 4" />
      <path d="M14 4h6v6" />
      <path d="M6 4a14 14 0 0114 14" />
    </Svg>
  );
}
export function IconDagger({ size }) {
  return (
    <Svg size={size}>
      <path d="M12 2l3 6-3 9-3-9 3-6z" />
      <line x1="7" y1="17" x2="17" y2="17" />
      <line x1="12" y1="17" x2="12" y2="22" />
    </Svg>
  );
}
export function IconHammer({ size }) {
  return (
    <Svg size={size}>
      <path d="M14 4l6 6-3 3-6-6 3-3z" />
      <path d="M11 7L3 15v6h6l8-8" />
    </Svg>
  );
}
export function IconCrown({ size }) {
  return (
    <Svg size={size}>
      <path d="M3 18h18l-1.5-9-4.5 4-3-6-3 6-4.5-4L3 18z" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </Svg>
  );
}
export function IconLock({ size }) {
  return (
    <Svg size={size}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 118 0v3" />
    </Svg>
  );
}
export function IconUnlock({ size }) {
  return (
    <Svg size={size}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 017-2.6" />
    </Svg>
  );
}
export function IconEye({ size }) {
  return (
    <Svg size={size}>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}
export function IconEyeOff({ size }) {
  return (
    <Svg size={size}>
      <path d="M4.5 7.5C2.9 9.2 2 12 2 12s3.6 6.5 10 6.5c1.9 0 3.5-.6 4.9-1.4" />
      <path d="M9.9 5.7A9.8 9.8 0 0112 5.5c6.4 0 10 6.5 10 6.5s-1 1.8-2.8 3.5" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </Svg>
  );
}
export function IconGem({ size }) {
  return (
    <Svg size={size}>
      <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
      <path d="M2 9h20M9 3l3 18M15 3l-3 18" />
    </Svg>
  );
}
export function IconStore({ size }) {
  return (
    <Svg size={size}>
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M4 9v11h16V9" />
      <path d="M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0" />
      <path d="M10 20v-6h4v6" />
    </Svg>
  );
}
export function IconSettings({ size }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.6 1.6 0 009 19.4a1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1A1.6 1.6 0 004.6 9a1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" />
    </Svg>
  );
}
export function IconFish({ size }) {
  return (
    <Svg size={size}>
      <path d="M2 12c3-4 7-6 11-6 3 0 6 2 9 6-3 4-6 6-9 6-4 0-8-2-11-6z" />
      <circle cx="16" cy="11" r="1" />
      <path d="M7 9l-3-3v12l3-3" />
    </Svg>
  );
}
export function IconFlask({ size }) {
  return (
    <Svg size={size}>
      <path d="M10 3h4v6l5 8a2 2 0 01-1.7 3H6.7A2 2 0 015 17l5-8V3z" />
      <line x1="9" y1="3" x2="15" y2="3" />
      <line x1="7.5" y1="14" x2="16.5" y2="14" />
    </Svg>
  );
}
export function IconPalette({ size }) {
  return (
    <Svg size={size}>
      <path d="M12 3a9 9 0 100 18c1.1 0 2-.9 2-2 0-.5-.2-1-.6-1.4-.3-.4-.4-.8-.4-1.1 0-.8.7-1.5 1.5-1.5H16a5 5 0 005-5c0-3.9-4-7-9-7z" />
      <circle cx="7.5" cy="12" r="1" />
      <circle cx="10" cy="8" r="1" />
      <circle cx="15" cy="8" r="1" />
    </Svg>
  );
}
export function IconMegaphone({ size }) {
  return (
    <Svg size={size}>
      <path d="M3 10v4a1 1 0 001 1h3l8 5V4L7 9H4a1 1 0 00-1 1z" />
      <path d="M18 9a3 3 0 010 6" />
    </Svg>
  );
}
export function IconPlay({ size }) {
  return (
    <Svg size={size}>
      <polygon points="6 4 20 12 6 20 6 4" />
    </Svg>
  );
}
export function IconRefresh({ size }) {
  return (
    <Svg size={size}>
      <path d="M20 11a8 8 0 10-2.3 6.3" />
      <polyline points="20 4 20 11 13 11" />
    </Svg>
  );
}
export function IconMuscle({ size }) {
  return (
    <Svg size={size}>
      <path d="M4 18v-4a4 4 0 014-4h2.5a2.5 2.5 0 000-5H8" />
      <path d="M10.5 10c3.5 0 6.5 1.8 6.5 4.5S14.5 21 11 21H4" />
    </Svg>
  );
}
export function IconAnvil({ size }) {
  return (
    <Svg size={size}>
      <path d="M4 8h9l3 3h4l-2 4H8l-4-4V8z" />
      <path d="M9 15v3H6l-1 3h14l-1-3h-3v-3" />
    </Svg>
  );
}
export function IconSkull({ size }) {
  return (
    <Svg size={size}>
      <path d="M12 3a8 8 0 00-8 8c0 2.6 1.3 4.4 3 5.5V20a1 1 0 001 1h8a1 1 0 001-1v-3.5c1.7-1.1 3-2.9 3-5.5a8 8 0 00-8-8z" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
    </Svg>
  );
}
