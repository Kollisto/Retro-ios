// Hand-drawn iOS 5 style icons. Each one is a 60x60 SVG; rounding and gloss come from CSS.
// Gradient ids are prefixed with the icon id because inline SVGs share one id namespace.

const svg = (body) =>
  `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

const lin = (id, stops, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join("")}</linearGradient>`;

const rad = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join("")}</radialGradient>`;

const bg = (id) => `<rect width="60" height="60" fill="url(#${id})"/>`;

const WEEKDAYS = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];

const ICONS = {
  phone: () => svg(`
    <defs>${lin("ph-bg", [[0, "#8fe866"], [1, "#2a9c1a"]])}</defs>
    ${bg("ph-bg")}
    <path d="M20.5 13.5c1.4-.9 3-.5 3.8.8l3.3 5.6c.8 1.4.3 3-.9 3.9l-2.1 1.5c1.6 3.9 4.6 7.5 8.4 10l2-1.4c1.3-.9 3-.7 3.9.6l3.8 5.3c.9 1.3.6 3-.6 3.9l-2.6 1.9c-2.1 1.5-5 1.6-7.3.3-8.6-4.8-15-12.3-17.8-21.4-.8-2.6 0-5.3 2.1-6.8z"
      fill="#fff" stroke="rgba(0,0,0,.18)" stroke-width=".6"/>`),

  messages: () => svg(`
    <defs>${lin("ms-bg", [[0, "#86e35f"], [1, "#24961a"]])}
      ${lin("ms-b", [[0, "#ffffff"], [1, "#dfe9dc"]])}</defs>
    ${bg("ms-bg")}
    <path d="M30 13c11.6 0 20 6.9 20 15.4S41.6 43.8 30 43.8c-1.9 0-3.7-.2-5.4-.6-2.4 2.3-6.2 3.9-10.4 3.8 2.1-1.6 3.4-3.5 3.8-5.6C13 38.6 10 33.8 10 28.4 10 19.9 18.4 13 30 13z"
      fill="url(#ms-b)" stroke="rgba(0,0,0,.15)" stroke-width=".6"/>`),

  mail: () => svg(`
    <defs>${lin("ml-bg", [[0, "#8cccf8"], [0.55, "#3f8fe2"], [1, "#1a60c4"]])}
      ${lin("ml-e", [[0, "#ffffff"], [1, "#dbe4ee"]])}</defs>
    ${bg("ml-bg")}
    <ellipse cx="12" cy="52" rx="12" ry="5" fill="#fff" opacity=".18"/>
    <ellipse cx="46" cy="55" rx="15" ry="5" fill="#fff" opacity=".15"/>
    <rect x="9" y="18" width="42" height="26" rx="2" fill="url(#ml-e)" stroke="rgba(0,0,0,.2)" stroke-width=".6"/>
    <path d="M9.5 19l20.5 15 20.5-15" fill="none" stroke="#9fb1c6" stroke-width="1.6"/>
    <path d="M9.5 43.5l15-12M50.5 43.5l-15-12" fill="none" stroke="#b9c7d6" stroke-width="1.2"/>`),

  safari: () => {
    const ticks = Array.from({ length: 36 }, (_, i) =>
      `<line x1="30" y1="${i % 3 ? 9.5 : 8.5}" x2="30" y2="12" transform="rotate(${i * 10} 30 30)"/>`
    ).join("");
    return svg(`
      <defs>${lin("sf-bg", [[0, "#f4f7fb"], [1, "#b8c6d8"]])}
        ${rad("sf-f", [[0, "#7fd0ff"], [0.7, "#2b7fe0"], [1, "#1650b0"]], 0.45, 0.35, 0.65)}</defs>
      ${bg("sf-bg")}
      <circle cx="30" cy="30" r="24" fill="#c9d2dd" stroke="#8d99a8" stroke-width="1"/>
      <circle cx="30" cy="30" r="22" fill="url(#sf-f)"/>
      <g stroke="#fff" stroke-width="1" opacity=".85">${ticks}</g>
      <g transform="rotate(45 30 30)">
        <polygon points="30,12 33,30 27,30" fill="#e8322a"/>
        <polygon points="30,48 33,30 27,30" fill="#fff"/>
      </g>
      <circle cx="30" cy="30" r="1.6" fill="#ddd" stroke="#888" stroke-width=".5"/>`);
  },

  calendar: (now = new Date()) => svg(`
    <defs>${lin("cl-bg", [[0, "#ffffff"], [1, "#e2e2e2"]])}
      ${lin("cl-h", [[0, "#f0584c"], [1, "#b8231b"]])}</defs>
    ${bg("cl-bg")}
    <rect width="60" height="17" fill="url(#cl-h)"/>
    <rect y="17" width="60" height="1" fill="#7f1510" opacity=".5"/>
    <text x="30" y="12.4" text-anchor="middle" fill="#fff" font-size="8.6" font-weight="700"
      font-family="Helvetica Neue, Helvetica, Arial">${WEEKDAYS[now.getDay()]}</text>
    <text x="30" y="51" text-anchor="middle" fill="#1d1d1d" font-size="33" font-weight="700"
      font-family="Helvetica Neue, Helvetica, Arial" letter-spacing="-1">${now.getDate()}</text>`),

  photos: () => {
    const petals = Array.from({ length: 14 }, (_, i) =>
      `<ellipse cx="30" cy="15" rx="4.4" ry="9.5" transform="rotate(${i * (360 / 14)} 30 30)"/>`
    ).join("");
    return svg(`
      <defs>${lin("pt-bg", [[0, "#a6dcff"], [1, "#3c8fdc"]])}
        ${rad("pt-c", [[0, "#7a4a1c"], [1, "#2e1606"]])}</defs>
      ${bg("pt-bg")}
      <g fill="#ffcf24" stroke="#e39a00" stroke-width=".7">${petals}</g>
      <circle cx="30" cy="30" r="9" fill="url(#pt-c)"/>
      <circle cx="30" cy="30" r="9" fill="none" stroke="#4a2a0c" stroke-dasharray="1 1.2" stroke-width="2"/>`);
  },

  camera: () => svg(`
    <defs>${lin("cm-bg", [[0, "#f2f2f2"], [0.5, "#b9b9b9"], [1, "#8a8a8a"]])}
      ${rad("cm-l", [[0, "#3f6aa8"], [0.5, "#152844"], [1, "#03060c"]], 0.42, 0.38, 0.6)}</defs>
    ${bg("cm-bg")}
    <circle cx="30" cy="30" r="22" fill="#2b2b2b" stroke="#6e6e6e" stroke-width="1.5"/>
    <circle cx="30" cy="30" r="19" fill="none" stroke="#555" stroke-width="1" stroke-dasharray="1 1"/>
    <circle cx="30" cy="30" r="15.5" fill="url(#cm-l)" stroke="#111" stroke-width="1.5"/>
    <circle cx="30" cy="30" r="7" fill="#05080f"/>
    <circle cx="30" cy="30" r="11" fill="none" stroke="#5b7fb5" stroke-width=".6" opacity=".7"/>
    <ellipse cx="24.5" cy="24" rx="4.5" ry="3" fill="#fff" opacity=".55" transform="rotate(-35 24.5 24)"/>
    <circle cx="35" cy="35.5" r="1.4" fill="#fff" opacity=".35"/>`),

  youtube: () => svg(`
    <defs>${lin("yt-bg", [[0, "#ececec"], [1, "#a9a9a9"]])}
      ${lin("yt-tv", [[0, "#5a5a5a"], [1, "#262626"]])}
      ${lin("yt-s", [[0, "#ffffff"], [1, "#d8d8d8"]])}
      ${lin("yt-r", [[0, "#ff4a3d"], [1, "#c00f0a"]])}</defs>
    ${bg("yt-bg")}
    <rect x="6" y="11" width="48" height="37" rx="8" fill="url(#yt-tv)"/>
    <rect x="10" y="15" width="40" height="27" rx="6" fill="url(#yt-s)"/>
    <text x="21" y="32.5" text-anchor="middle" fill="#222" font-size="10" font-weight="700"
      font-family="Helvetica Neue, Helvetica, Arial">You</text>
    <rect x="29" y="23" width="19" height="12.5" rx="3.5" fill="url(#yt-r)"/>
    <text x="38.5" y="32.3" text-anchor="middle" fill="#fff" font-size="8.6" font-weight="700"
      font-family="Helvetica Neue, Helvetica, Arial">Tube</text>
    <rect x="16" y="48" width="5" height="4" rx="1" fill="#3a3a3a"/>
    <rect x="39" y="48" width="5" height="4" rx="1" fill="#3a3a3a"/>`),

  maps: () => svg(`
    <defs>${lin("mp-bg", [[0, "#f3efe2"], [1, "#ddd6c2"]])}
      ${lin("mp-pin", [[0, "#ff5a4e"], [1, "#b5140d"]])}</defs>
    ${bg("mp-bg")}
    <path d="M-2 4 L24 0 L30 22 L-2 26Z" fill="#c5e0a5"/>
    <path d="M40 40 L62 34 L62 62 L46 62Z" fill="#a9cdef"/>
    <path d="M-4 40 L64 18" stroke="#e3a832" stroke-width="8"/>
    <path d="M-4 40 L64 18" stroke="#f9d66b" stroke-width="6"/>
    <path d="M18 -2 L36 64" stroke="#c8c0aa" stroke-width="5"/>
    <path d="M18 -2 L36 64" stroke="#ffffff" stroke-width="3.6"/>
    <path d="M-2 52 L40 46 L64 50" stroke="#ffffff" stroke-width="2.4" fill="none"/>
    <path d="M27 48 Q32 38 42 34" stroke="#2f7cf6" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".9"/>
    <g transform="translate(9 31)">
      <path d="M0 2 Q6 -1 12 2 L12 9 Q12 14 6 16 Q0 14 0 9Z" fill="#1d4fa8" stroke="#fff" stroke-width="1.1"/>
      <path d="M0 2 Q6 -1 12 2 L12 4.5 L0 4.5Z" fill="#d22a22"/>
      <text x="6" y="11.4" text-anchor="middle" fill="#fff" font-size="5.6" font-weight="700"
        font-family="Helvetica Neue, Helvetica, Arial">280</text>
    </g>
    <path d="M44 6c-4.3 0-7.5 3.2-7.5 7.3 0 5.4 7.5 13.2 7.5 13.2s7.5-7.8 7.5-13.2C51.5 9.2 48.3 6 44 6z"
      fill="url(#mp-pin)" stroke="#7d0a05" stroke-width=".6"/>
    <circle cx="44" cy="13.3" r="2.7" fill="#7d0a05"/>`),

  weather: () => {
    const rays = Array.from({ length: 12 }, (_, i) =>
      `<line x1="21" y1="8" x2="21" y2="11.5" transform="rotate(${i * 30} 21 21)"/>`
    ).join("");
    return svg(`
      <defs>${lin("wt-bg", [[0, "#6ebdf8"], [1, "#1c5fc0"]])}
        ${rad("wt-s", [[0, "#fffbd0"], [0.6, "#ffd21f"], [1, "#f3a400"]])}</defs>
      ${bg("wt-bg")}
      <g stroke="#ffe27a" stroke-width="2" stroke-linecap="round">${rays}</g>
      <circle cx="21" cy="21" r="8" fill="url(#wt-s)"/>
      <text x="38" y="50" text-anchor="middle" fill="#fff" font-size="19" font-weight="700"
        font-family="Helvetica Neue, Helvetica, Arial" letter-spacing="-.5">73°</text>`);
  },

  notes: () => {
    const lines = [26, 32, 38, 44, 50, 56].map((y) => `<line x1="0" y1="${y}" x2="60" y2="${y}"/>`).join("");
    return svg(`
      <defs>${lin("nt-bg", [[0, "#fff8b8"], [1, "#efd86a"]])}
        ${lin("nt-l", [[0, "#9a6533"], [1, "#5e3714"]])}</defs>
      ${bg("nt-bg")}
      <g stroke="#c9b25c" stroke-width=".7">${lines}</g>
      <line x1="12" y1="18" x2="12" y2="60" stroke="#e98e7a" stroke-width=".8"/>
      <rect width="60" height="15" fill="url(#nt-l)"/>
      <line x1="0" y1="11.5" x2="60" y2="11.5" stroke="#e8cfa6" stroke-width=".8" stroke-dasharray="2 1.6"/>
      <rect y="15" width="60" height="2" fill="#000" opacity=".2"/>
      <text x="17" y="31" fill="#3b3326" font-size="6" font-family="Marker Felt, Noteworthy, cursive">Купить…</text>`);
  },

  reminders: () => svg(`
    <defs>${lin("rm-bg", [[0, "#ffffff"], [1, "#e3e3e3"]])}</defs>
    ${bg("rm-bg")}
    <g stroke="#cfd3d9" stroke-width=".8">
      <line x1="0" y1="21" x2="60" y2="21"/><line x1="0" y1="33" x2="60" y2="33"/><line x1="0" y1="45" x2="60" y2="45"/>
    </g>
    <g fill="none" stroke="#9aa1ab" stroke-width="1.4">
      <circle cx="12" cy="15" r="3.6"/><circle cx="12" cy="27" r="3.6"/><circle cx="12" cy="39" r="3.6"/><circle cx="12" cy="51" r="3.6"/>
    </g>
    <path d="M9.8 14.6l1.8 2 4.4-5" fill="none" stroke="#2c7be5" stroke-width="1.8" stroke-linecap="round"/>
    <g stroke="#6d7580" stroke-width="2" stroke-linecap="round">
      <line x1="20" y1="15" x2="44" y2="15" opacity=".45"/><line x1="20" y1="27" x2="50" y2="27"/>
      <line x1="20" y1="39" x2="40" y2="39"/><line x1="20" y1="51" x2="47" y2="51"/>
    </g>`),

  clock: (now = new Date()) => {
    const m = now.getMinutes(), h = (now.getHours() % 12) + m / 60;
    const ticks = Array.from({ length: 12 }, (_, i) =>
      `<line x1="30" y1="10.5" x2="30" y2="${i % 3 ? 13 : 14.5}" transform="rotate(${i * 30} 30 30)"/>`
    ).join("");
    return svg(`
      <defs>${lin("ck-bg", [[0, "#4b4b4b"], [1, "#050505"]])}
        ${rad("ck-f", [[0, "#ffffff"], [0.85, "#f0f0f0"], [1, "#c9c9c9"]])}</defs>
      ${bg("ck-bg")}
      <circle cx="30" cy="30" r="22.5" fill="url(#ck-f)" stroke="#000" stroke-width="1"/>
      <g stroke="#111" stroke-width="1.6" stroke-linecap="round">${ticks}</g>
      <line x1="30" y1="30" x2="30" y2="18.5" stroke="#111" stroke-width="3" stroke-linecap="round"
        transform="rotate(${h * 30} 30 30)"/>
      <line x1="30" y1="30" x2="30" y2="12.5" stroke="#111" stroke-width="2" stroke-linecap="round"
        transform="rotate(${m * 6} 30 30)"/>
      <line x1="30" y1="34" x2="30" y2="11" stroke="#e0261d" stroke-width=".9"
        transform="rotate(${now.getSeconds() * 6} 30 30)"/>
      <circle cx="30" cy="30" r="1.8" fill="#e0261d"/>`);
  },

  itunes: () => svg(`
    <defs>${lin("it-bg", [[0, "#d27eff"], [1, "#6d17b8"]])}</defs>
    ${bg("it-bg")}
    <circle cx="30" cy="30" r="20" fill="none" stroke="#fff" stroke-width="2.6" opacity=".95"/>
    <g fill="#fff">
      <path d="M25 22.5 L40 18.5 V22.5 L25 26.5Z"/>
      <rect x="25" y="22.5" width="2.4" height="15"/>
      <rect x="37.6" y="18.5" width="2.4" height="15"/>
      <ellipse cx="22.6" cy="38.3" rx="4.4" ry="3.4" transform="rotate(-22 22.6 38.3)"/>
      <ellipse cx="35.2" cy="34.3" rx="4.4" ry="3.4" transform="rotate(-22 35.2 34.3)"/>
    </g>`),

  appstore: () => svg(`
    <defs>${lin("as-bg", [[0, "#7cc6fb"], [1, "#1458c4"]])}</defs>
    ${bg("as-bg")}
    <g stroke-linecap="round">
      <line x1="18" y1="47" x2="30.5" y2="13" stroke="#fff" stroke-width="5.4"/>
      <line x1="30.5" y1="13" x2="31.6" y2="10" stroke="#3b3b3b" stroke-width="2"/>
      <line x1="42" y1="47" x2="34" y2="25" stroke="#fff" stroke-width="5.4"/>
      <line x1="34" y1="25" x2="30.5" y2="15.5" stroke="#f6c343" stroke-width="3.6"/>
    </g>
    <rect x="12" y="34" width="36" height="5.2" rx="1" fill="#fff"/>
    <g stroke="#7ab0e6" stroke-width=".7">
      <line x1="16" y1="34" x2="16" y2="36.4"/><line x1="20" y1="34" x2="20" y2="35.6"/><line x1="24" y1="34" x2="24" y2="36.4"/>
      <line x1="28" y1="34" x2="28" y2="35.6"/><line x1="32" y1="34" x2="32" y2="36.4"/><line x1="36" y1="34" x2="36" y2="35.6"/>
      <line x1="40" y1="34" x2="40" y2="36.4"/><line x1="44" y1="34" x2="44" y2="35.6"/>
    </g>`),

  settings: () => svg(`
    <defs>${lin("se-bg", [[0, "#d7dade"], [1, "#7c828b"]])}
      ${lin("se-g", [[0, "#e3e6ea"], [1, "#8d939c"]])}</defs>
    ${bg("se-bg")}
    <circle cx="30" cy="30" r="18.5" fill="none" stroke="#4b5058" stroke-width="7" stroke-dasharray="4.84 4.84"/>
    <circle cx="30" cy="30" r="17" fill="url(#se-g)" stroke="#4b5058" stroke-width="1.2"/>
    <circle cx="30" cy="30" r="11" fill="none" stroke="#5e646d" stroke-width="1.2"/>
    <g stroke="#5e646d" stroke-width="2.4">
      <line x1="30" y1="19" x2="30" y2="41"/><line x1="19" y1="30" x2="41" y2="30"/>
      <line x1="22.2" y1="22.2" x2="37.8" y2="37.8"/><line x1="37.8" y1="22.2" x2="22.2" y2="37.8"/>
    </g>
    <circle cx="30" cy="30" r="5.5" fill="url(#se-g)" stroke="#4b5058" stroke-width="1"/>
    <circle cx="30" cy="30" r="2.2" fill="#4b5058"/>`),

  // Stage 3 will replace these with hand-drawn icons.
  placeholder: (letter, color) => svg(`
    <rect width="60" height="60" fill="${color}"/>
    <text x="30" y="40" text-anchor="middle" fill="#fff" font-size="28" font-weight="700"
      font-family="Helvetica Neue, Helvetica, Arial">${letter}</text>`),
};
