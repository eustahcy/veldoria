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
