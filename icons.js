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

  // Shows the live weather (see weather.js); without data it is the classic iOS 5 "sun, 73°".
  weather: (w = WEATHER_NOW) => {
    const kind = w ? w.kind : "clear", day = w ? w.day : true;
    const temp = w ? `${Math.round(w.temp)}°` : "73°";
    const bgs = {
      day: [[0, "#6ebdf8"], [1, "#1c5fc0"]],
      night: [[0, "#34508a"], [1, "#0b1530"]],
      grey: [[0, "#a9bccf"], [1, "#4d6582"]],
      storm: [[0, "#5d6a7e"], [1, "#1b212c"]],
    };
    const tone = kind === "storm" ? "storm" : !day ? "night" : ["clear", "partly"].includes(kind) ? "day" : "grey";
    const rays = Array.from({ length: 12 }, (_, i) =>
      `<line x1="21" y1="8" x2="21" y2="11.5" transform="rotate(${i * 30} 21 21)"/>`).join("");
    const sun = `<g stroke="#ffe27a" stroke-width="2" stroke-linecap="round">${rays}</g>
      <circle cx="21" cy="21" r="8" fill="url(#wt-s)"/>`;
    const moon = `<path d="M24 10a10 10 0 1 0 6 17 8 8 0 0 1-6-17z" fill="#fdf3c0" stroke="#d9c98a" stroke-width=".5"/>
      <g fill="#fff"><circle cx="38" cy="11" r=".9"/><circle cx="45" cy="19" r=".7"/><circle cx="33" cy="22" r=".6"/></g>`;
    const cloud = (x, y, k = 1, fill = "url(#wt-c)") => `
      <g transform="translate(${x} ${y}) scale(${k})" fill="${fill}" stroke="rgba(40,60,80,.25)" stroke-width=".5">
        <circle cx="8" cy="8" r="6.5"/><circle cx="16.5" cy="4.5" r="8.5"/><circle cx="25" cy="9" r="6"/>
        <rect x="2" y="8" width="29" height="7" rx="3.5"/></g>`;
    const lines = (color, d) => `<g stroke="${color}" stroke-width="1.6" stroke-linecap="round">${d}</g>`;
    const rain = lines("#8fd0ff", [[11, 32], [17, 34], [23, 32], [14, 40], [20, 41]]
      .map(([x, y]) => `<line x1="${x}" y1="${y}" x2="${x - 2}" y2="${y + 6}"/>`).join(""));
    const snow = `<g fill="#fff">${[[10, 33], [17, 36], [24, 33], [8, 41], [15, 44], [22, 41]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5"/>`).join("")}</g>`;
    const art = {
      clear: day ? sun : moon,
      partly: (day ? sun : moon) + cloud(14, 18, 0.9),
      cloudy: cloud(16, 8, 0.75, "#c9d3de") + cloud(4, 14),
      fog: cloud(4, 10) + lines("rgba(255,255,255,.85)", "<line x1='6' y1='31' x2='34' y2='31'/><line x1='9' y1='35' x2='31' y2='35'/>"),
      rain: cloud(4, 12) + rain,
      snow: cloud(4, 12) + snow,
      storm: cloud(4, 10, 1, "url(#wt-d)") + rain +
        `<path d="M21 25 L15 35 L20 35 L16 45 L27 32 L21.5 32 L25 25Z" fill="#ffd93a" stroke="#c99400" stroke-width=".6"/>`,
    }[kind];
    return svg(`
      <defs>${lin(`wt-bg-${tone}`, bgs[tone])}
        ${rad("wt-s", [[0, "#fffbd0"], [0.6, "#ffd21f"], [1, "#f3a400"]])}
        ${lin("wt-c", [[0, "#ffffff"], [1, "#d8e1ea"]])}
        ${lin("wt-d", [[0, "#8a94a3"], [1, "#4a5361"]])}</defs>
      ${bg(`wt-bg-${tone}`)}
      ${art}
      <text x="40" y="51" text-anchor="middle" fill="#fff" font-size="${temp.length > 3 ? 16 : 19}" font-weight="700"
        font-family="Helvetica Neue, Helvetica, Arial" letter-spacing="-.5">${temp}</text>`);
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

  // Not an iOS 5 app: clears the cache and reloads Retro 5. Drawn like an iOS 5 utility icon.
  refresh: () => svg(`
    <defs>${lin("rf-bg", [[0, "#b3c9a3"], [1, "#58774c"]])}
      ${lin("rf-a", [[0, "#ffffff"], [1, "#e6ece2"]])}</defs>
    ${bg("rf-bg")}
    <g class="rf-arrows">
      <path d="M30 13 A17 17 0 0 1 46.6 26.5" fill="none" stroke="url(#rf-a)" stroke-width="5" stroke-linecap="round"/>
      <path d="M41 27 L50 29 L50.5 19.5 Z" fill="#fff"/>
      <path d="M30 47 A17 17 0 0 1 13.4 33.5" fill="none" stroke="url(#rf-a)" stroke-width="5" stroke-linecap="round"/>
      <path d="M19 33 L10 31 L9.5 40.5 Z" fill="#fff"/>
      <path d="M13.4 26.5 A17 17 0 0 1 22 15" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M46.6 33.5 A17 17 0 0 1 38 45" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/>
    </g>`),

  // Starts and stops the goose (goose.js).
  goose: () => svg(`
    <defs>${lin("gi-bg", [[0, "#8fd0ff"], [0.62, "#bfe6ff"], [0.63, "#7cc04a"], [1, "#3f8a22"]])}
      ${lin("gi-n", [[0, "#ffffff"], [1, "#dfe3e8"]], 1, 0)}</defs>
    ${bg("gi-bg")}
    <path d="M18 62 Q16 40 26 30 Q30 26 30 20" fill="none" stroke="#b9bfc7" stroke-width="13" stroke-linecap="round"/>
    <path d="M18 62 Q16 40 26 30 Q30 26 30 20" fill="none" stroke="url(#gi-n)" stroke-width="11" stroke-linecap="round"/>
    <circle cx="33" cy="17" r="10" fill="url(#gi-n)" stroke="#b9bfc7" stroke-width=".8"/>
    <path d="M41 13 L54 17 L41 21Z" fill="#f39a26" stroke="#c46f0c" stroke-width=".6"/>
    <path d="M41 19 L51 19.5 L41 23Z" fill="#e0861a" stroke="#c46f0c" stroke-width=".5"/>
    <circle cx="36" cy="14" r="1.8" fill="#111"/>
    <circle cx="36.6" cy="13.4" r=".6" fill="#fff"/>`),

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

  // --- Third-party apps, redrawn as if they shipped in 2011 ---

  instagram: () => {
    const rainbow = ["#e0393e", "#f5a623", "#f8e71c", "#4cb84c", "#3b8fd9"]
      .map((c, i) => `<rect x="${8 + i * 2.6}" y="0" width="2.6" height="20" fill="${c}"/>`).join("");
    return svg(`
      <defs>${lin("ig-t", [[0, "#8a5a3a"], [1, "#5e3b22"]])}
        ${lin("ig-b", [[0, "#efe3cf"], [1, "#cdb795"]])}
        ${rad("ig-l", [[0, "#5b8fd1"], [0.45, "#1d3b66"], [1, "#03070e"]], 0.4, 0.38, 0.62)}</defs>
      <rect width="60" height="60" fill="url(#ig-b)"/>
      <rect width="60" height="20" fill="url(#ig-t)"/>
      <rect width="60" height="20" fill="none" stroke="#3b2414" stroke-dasharray="1.4 1.4" stroke-width=".6" opacity=".5"/>
      ${rainbow}
      <rect y="20" width="60" height="1.2" fill="#3b2414" opacity=".45"/>
      <rect x="40" y="5" width="11" height="8" rx="2" fill="#1b1b1b" stroke="#c9b08d" stroke-width=".8"/>
      <rect x="42" y="6.8" width="7" height="4.4" rx="1" fill="#3a5d8f"/>
      <circle cx="30" cy="33" r="15" fill="#2a2a2a" stroke="#a89371" stroke-width="1.4"/>
      <circle cx="30" cy="33" r="12" fill="#111" stroke="#555" stroke-width=".6"/>
      <circle cx="30" cy="33" r="9.5" fill="url(#ig-l)"/>
      <circle cx="30" cy="33" r="4" fill="#04080f"/>
      <ellipse cx="26.5" cy="29.5" rx="3" ry="2" fill="#fff" opacity=".6" transform="rotate(-35 26.5 29.5)"/>`);
  },

  spotify: () => svg(`
    <defs>${lin("sp-bg", [[0, "#4a4a4a"], [1, "#0c0c0c"]])}
      ${rad("sp-c", [[0, "#a8e063"], [0.7, "#80c02c"], [1, "#5c9a12"]], 0.45, 0.35, 0.7)}</defs>
    ${bg("sp-bg")}
    <circle cx="30" cy="30" r="19" fill="url(#sp-c)" stroke="#2f5208" stroke-width=".8"/>
    <g fill="none" stroke="#1c1c1c" stroke-linecap="round">
      <path d="M17.5 24.5 Q30 20 43 26" stroke-width="3.6"/>
      <path d="M19 31 Q30 27.5 41 32.5" stroke-width="3"/>
      <path d="M20.5 37 Q30 34.5 38.5 38.5" stroke-width="2.5"/>
    </g>`),

  chrome: () => {
    const wedge = (rot, c1, c2, id) => `
      <defs>${lin(id, [[0, c1], [1, c2]])}</defs>
      <path d="M30 30 L30 8 A22 22 0 0 1 49.05 41 Z" fill="url(#${id})" transform="rotate(${rot} 30 30)"/>`;
    return svg(`
      <defs>${lin("cr-bg", [[0, "#ffffff"], [1, "#d9dde3"]])}
        ${rad("cr-c", [[0, "#8fc8ff"], [0.6, "#3a86e8"], [1, "#1d5fc4"]], 0.42, 0.36, 0.6)}</defs>
      ${bg("cr-bg")}
      <circle cx="30" cy="30.8" r="22.4" fill="#000" opacity=".18"/>
      ${wedge(-60, "#ff6e5a", "#c8231a", "cr-r")}
      ${wedge(60, "#ffe066", "#e8a800", "cr-y")}
      ${wedge(180, "#5fd36a", "#18923a", "cr-g")}
      <circle cx="30" cy="30" r="10.5" fill="#fff"/>
      <circle cx="30" cy="30" r="8.2" fill="url(#cr-c)"/>`);
  },

  telegram: () => svg(`
    <defs>${lin("tg-bg", [[0, "#6fd0ff"], [1, "#1a7fc8"]])}
      ${lin("tg-p", [[0, "#ffffff"], [1, "#dcecf7"]])}</defs>
    ${bg("tg-bg")}
    <path d="M11 29.5 L46 15.5 C47.6 14.9 48.9 16 48.5 17.7 L42.6 45 C42.2 46.8 40.6 47.4 39.1 46.4 L30.5 40 L26 44.2 C25.3 44.9 24.3 44.6 24.1 43.6 L22.6 36.3 L12.2 32.9 C10.4 32.3 10.2 30.3 11 29.5Z"
      fill="url(#tg-p)" stroke="rgba(0,0,0,.15)" stroke-width=".6"/>
    <path d="M22.6 36.3 L41.5 21 L28 38.2 L26 44.2" fill="#b9d4e8"/>`),

  reddit: () => svg(`
    <defs>${lin("rd-bg", [[0, "#ff8a4c"], [1, "#e23a00"]])}
      ${lin("rd-h", [[0, "#ffffff"], [1, "#e4e8ec"]])}</defs>
    ${bg("rd-bg")}
    <path d="M31 22 L33.5 11.5 L42 13.5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="44" cy="13.8" r="3.2" fill="url(#rd-h)"/>
    <circle cx="15.5" cy="28" r="4.5" fill="url(#rd-h)"/>
    <circle cx="44.5" cy="28" r="4.5" fill="url(#rd-h)"/>
    <ellipse cx="30" cy="35" rx="17" ry="12.5" fill="url(#rd-h)" stroke="rgba(0,0,0,.12)" stroke-width=".6"/>
    <circle cx="23.5" cy="33" r="3.2" fill="#ff4500"/>
    <circle cx="36.5" cy="33" r="3.2" fill="#ff4500"/>
    <path d="M23.5 40 Q30 44.5 36.5 40" fill="none" stroke="#7a2a0a" stroke-width="1.6" stroke-linecap="round"/>`),

  threads: () => svg(`
    <defs>${lin("th-bg", [[0, "#3c3c3c"], [1, "#050505"]])}</defs>
    ${bg("th-bg")}
    <text x="30" y="43" text-anchor="middle" fill="#fff" font-size="38" font-weight="700"
      font-family="Helvetica Neue, Helvetica, Arial">@</text>`),

  revolut: () => svg(`
    <defs>${lin("rv-bg", [[0, "#3a4a72"], [1, "#0b1226"]])}</defs>
    ${bg("rv-bg")}
    <path d="M19 15 H33 C40.2 15 44.5 19.2 44.5 25.4 C44.5 30.2 41.8 33.7 37.4 35 L45 46 H37.6 L30.6 35.6 H26 V46 H19 Z M26 21.2 V29.6 H32.6 C35.6 29.6 37.4 28 37.4 25.4 C37.4 22.8 35.6 21.2 32.6 21.2 Z"
      fill="#fff" fill-rule="evenodd"/>`),

  trafi: () => svg(`
    <defs>${lin("tf-bg", [[0, "#3fe0a0"], [1, "#0a9a68"]])}</defs>
    ${bg("tf-bg")}
    <path d="M16 44 C16 32 26 34 28 26 C30 18 40 18 44 16" fill="none" stroke="#fff" stroke-width="4"
      stroke-linecap="round" stroke-dasharray="0.1 7.5" opacity=".9"/>
    <circle cx="16" cy="44" r="5.5" fill="#fff"/>
    <circle cx="16" cy="44" r="2.4" fill="#0f9e6c"/>
    <path d="M44 9.5c-3.6 0-6.4 2.7-6.4 6.2 0 4.6 6.4 11.2 6.4 11.2s6.4-6.6 6.4-11.2c0-3.5-2.8-6.2-6.4-6.2z"
      fill="#fff"/>
    <circle cx="44" cy="15.7" r="2.4" fill="#0f9e6c"/>`),

  oura: () => svg(`
    <defs>${lin("or-bg", [[0, "#4b4f58"], [1, "#0d0e12"]])}
      ${lin("or-r", [[0, "#ffffff"], [0.5, "#c9ced6"], [1, "#8c939e"]], 1, 1)}</defs>
    ${bg("or-bg")}
    <rect x="21" y="12" width="18" height="3.2" rx="1.6" fill="url(#or-r)"/>
    <circle cx="30" cy="34" r="13.5" fill="none" stroke="url(#or-r)" stroke-width="4.6"/>`),

  teams: () => svg(`
    <defs>${lin("tm-bg", [[0, "#8b93ff"], [1, "#4049b8"]])}
      ${lin("tm-t", [[0, "#6a72e8"], [1, "#3b43a8"]])}</defs>
    ${bg("tm-bg")}
    <circle cx="44" cy="20" r="5" fill="#fff" opacity=".9"/>
    <path d="M36 27 H52 V38 C52 43 49 45.5 45 45.5 C41 45.5 38 43 37.5 39 Z" fill="#fff" opacity=".9"/>
    <circle cx="32" cy="16.5" r="6" fill="#fff"/>
    <rect x="8" y="19" width="26" height="26" rx="3" fill="url(#tm-t)" stroke="#fff" stroke-width="1.4"/>
    <path d="M14 25 H28 V29 H23.2 V40 H18.8 V29 H14 Z" fill="#fff"/>`),

  focusfriend: () => svg(`
    <defs>${lin("ff-bg", [[0, "#fde7c4"], [1, "#e9b87a"]])}
      ${rad("ff-b", [[0, "#c58a52"], [0.8, "#8f5a2c"], [1, "#6e4220"]], 0.4, 0.35, 0.7)}</defs>
    ${bg("ff-bg")}
    <ellipse cx="30" cy="34" rx="16" ry="17" fill="url(#ff-b)"/>
    <ellipse cx="25" cy="26" rx="4" ry="2.6" fill="#fff" opacity=".22" transform="rotate(-25 25 26)"/>
    <path d="M22.5 34 Q25 31.5 27.5 34 M32.5 34 Q35 31.5 37.5 34" fill="none" stroke="#2b1708" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="21" cy="38.5" rx="2.6" ry="1.6" fill="#f08a8a" opacity=".7"/>
    <ellipse cx="39" cy="38.5" rx="2.6" ry="1.6" fill="#f08a8a" opacity=".7"/>
    <path d="M27.5 39 Q30 41 32.5 39" fill="none" stroke="#2b1708" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M30 17.5 Q29 12 31.5 9" fill="none" stroke="#5c8a2e" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M31 11 Q37 7 40 11 Q35 15 31 11Z" fill="#7cc04a"/>`),
};
