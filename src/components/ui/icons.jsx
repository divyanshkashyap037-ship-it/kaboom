// Vector icon set — stroke-based, 24x24 grid, colored via currentColor.
// No emojis anywhere in the UI; every glyph is an SVG vector.
const G = {
  cloud: <path d="M7 18.5h10.2a3.8 3.8 0 0 0 .6-7.55A5.5 5.5 0 0 0 7.15 9.6 4.5 4.5 0 0 0 7 18.5Z" />,
  dashboard: (
    <>
      <rect x="3" y="3" width="7.5" height="9" rx="1.8" />
      <rect x="13.5" y="3" width="7.5" height="5.5" rx="1.8" />
      <rect x="3" y="15" width="7.5" height="6" rx="1.8" />
      <rect x="13.5" y="11.5" width="7.5" height="9.5" rx="1.8" />
    </>
  ),
  kanban: (
    <>
      <rect x="3" y="4" width="5.5" height="16" rx="1.8" />
      <rect x="9.25" y="4" width="5.5" height="11" rx="1.8" />
      <rect x="15.5" y="4" width="5.5" height="14" rx="1.8" />
    </>
  ),
  tasks: (
    <>
      <path d="M4 5.5h9M4 12h9M4 18.5h6" />
      <path d="m14.5 17 2.2 2.2 4-4.4" />
      <circle cx="4" cy="5.5" r="0.01" />
    </>
  ),
  projects: (
    <>
      <path d="M3 7.5V6a2 2 0 0 1 2-2h3.6a2 2 0 0 1 1.6.8l.9 1.2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.5Z" />
      <path d="M3 9h18" />
    </>
  ),
  analytics: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M20 20H2.5" />
      <path d="M20 13V4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.64 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.07 4.14l.06.06a1.7 1.7 0 0 0 1.87.34h.08A1.7 1.7 0 0 0 10.11 3V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.55 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.03Z" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  chevronsRight: <path d="m7 6 5 6-5 6M14 6l5 6-5 6" />,
  chevronLeft: <path d="m14.5 6-5.5 6 5.5 6" />,
  chevronRight: <path d="m9.5 6 5.5 6-5.5 6" />,
  chevronDown: <path d="m6 9.5 6 5.5 6-5.5" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4.6-4.6" />
    </>
  ),
  filter: <path d="M4 5h16l-6.3 7.4v5.1L10.3 19v-6.6L4 5Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  pencil: (
    <>
      <path d="M4 20h4.2L19.5 8.7a2.1 2.1 0 0 0-3-3L5.2 17 4 20Z" />
      <path d="m14.8 6.4 2.8 2.8" />
    </>
  ),
  trash: (
    <>
      <path d="M4 6.5h16M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5" />
      <path d="M6.5 6.5 7.4 19a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9l.9-12.5" />
      <path d="M10 10.5v6M14 10.5v6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 2.8V6.5M16 2.8V6.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  flag: <path d="M5 21V4m0 1h12.5l-2.4 4 2.4 4H5" />,
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2.2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  grip: (
    <>
      <circle cx="9" cy="6" r="1" />
      <circle cx="15" cy="6" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="18" r="1" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
    </>
  ),
  journal: (
    <>
      <rect x="5" y="3.5" width="14.5" height="17" rx="2.4" />
      <path d="M8.5 7.5h7.5M8.5 11h7.5M8.5 14.5h4.5" />
    </>
  ),
  note: (
    <>
      <path d="M5 3.5h14v13.8L14.3 21H5V3.5Z" />
      <path d="M14 20.5v-4h4.5M8.5 8h7M8.5 11.5h5" />
    </>
  ),
  whiteboard: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2.2" />
      <path d="M12 17v3.5M8.5 20.5h7" />
      <path d="m6.5 13.5 3.2-4.2 2.4 2.4 3.4-4.6" />
    </>
  ),
  moon: <path d="M20.5 13.5A8.5 8.5 0 0 1 10.5 3.5a8.5 8.5 0 1 0 10 10Z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v5M12 16.2v.01" />
    </>
  ),
  archive: (
    <>
      <rect x="3" y="4" width="18" height="4.5" rx="1.5" />
      <path d="M4.8 8.5V19a2 2 0 0 0 2 2h10.4a2 2 0 0 0 2-2V8.5M10 12.5h4" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 4h16v16H4V4Z" opacity="0" />
      <path d="M4 13.5h4.8a3.2 3.2 0 0 0 6.4 0H20V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v13h14" opacity="0" />
      <path d="M20 13.5V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.5Z" />
      <path d="M4 13.5h4.8a3.2 3.2 0 0 0 6.4 0H20" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  palette: (
    <>
      <path d="M12 21a9 9 0 1 1 9-9c0 2.2-1.8 3-3.2 3H16a2 2 0 0 0-1.5 3.3c.4.5.2 2.7-2.5 2.7Z" />
      <circle cx="8" cy="10" r="0.6" />
      <circle cx="12" cy="7.5" r="0.6" />
      <circle cx="16" cy="9.5" r="0.6" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="8" ry="2.8" />
      <path d="M4 5.5V12c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8V5.5" />
      <path d="M4 12v6.5c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8V12" />
    </>
  ),
  activity: <path d="M3 12h4l3 8 4-16 3 8h4" />,
  rocket: (
    <>
      <path d="M12 15c-1-4.5.5-9 5.5-11 1.5 5.5-1 9.5-5.5 11Z" />
      <path d="M12 15l-3-3M9.5 13.5C8 12 5.5 12 3.5 13c2 .5 2.5 1.5 3 3M10.5 14.5C12 16 12 18.5 11 20.5c-.5-2-1.5-2.5-3-3" />
      <circle cx="15" cy="9" r="1.2" />
    </>
  ),
}

export function Icon({ name, size = 20, strokeWidth = 1.7, className = '', filled = false }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {G[name] || null}
    </svg>
  )
}
