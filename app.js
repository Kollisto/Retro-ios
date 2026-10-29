// Default home screen layout: up to 24 icons in the grid, 4 in the dock.
// url is the app's deep link. Apps without one open through a Shortcut named "Retro <name>"
// that the user creates once in the Shortcuts app (see README).

const sc = (name) => "shortcuts://run-shortcut?name=" + encodeURIComponent("Retro " + name);

const GRID = [
  { id: "messages", name: "Сообщения", gloss: true, url: "sms:" },
  { id: "calendar", name: "Календарь", gloss: true, url: "calshow:" },
  { id: "photos", name: "Фото", url: "photos-redirect://" },
  { id: "camera", name: "Камера", url: sc("Камера") },
  { id: "youtube", name: "YouTube", gloss: true, url: "youtube://" },
  { id: "maps", name: "Карты", gloss: true, url: "comgooglemaps://" },
  { id: "weather", name: "Погода", gloss: true, url: "weather://" },
  { id: "notes", name: "Заметки", gloss: true, url: "mobilenotes://" },
  { id: "reminders", name: "Напоминания", gloss: true, url: "x-apple-reminderkit://" },
  { id: "clock", name: "Часы", gloss: true, url: sc("Часы") },
  { id: "itunes", name: "iTunes Store", gloss: true, url: "itms://" },
  { id: "appstore", name: "App Store", gloss: true, url: "itms-apps://" },
  { id: "settings", name: "Настройки", url: sc("Настройки") },
  { id: "safari", name: "Safari", gloss: true, url: "x-safari-https://www.google.com" },
  { id: "instagram", name: "Instagram", gloss: true, url: "instagram://app" },
  { id: "telegram", name: "Telegram", gloss: true, url: "tg://" },
  { id: "reddit", name: "Reddit", gloss: true, url: "reddit://" },
  { id: "threads", name: "Threads", gloss: true, url: "barcelona://" },
  { id: "revolut", name: "Revolut", gloss: true, url: "revolut://" },
  { id: "trafi", name: "Trafi", gloss: true, url: sc("Trafi") },
  { id: "oura", name: "Oura", gloss: true, url: "oura://" },
  { id: "teams", name: "Teams", gloss: true, url: "msteams://" },
  { id: "focusfriend", name: "Focus Friend", gloss: true, url: sc("Focus Friend") },
];

const DOCK = [
  { id: "phone", name: "Телефон", gloss: true, url: sc("Телефон") },
  { id: "mail", name: "Почта", gloss: true, url: "message://" },
  { id: "chrome", name: "Chrome", gloss: true, url: "googlechrome://" },
  { id: "spotify", name: "Spotify", gloss: true, url: "spotify:" },
];

const LIVE = ["calendar", "clock"];

function iconSvg(app) {
  return ICONS[app.id]();
}

function render(container, apps) {
  container.innerHTML = apps
    .map((app) => `
      <a class="app" data-id="${app.id}" href="${app.url || "#"}">
        <div class="icon${app.gloss ? " gloss" : ""}">${iconSvg(app)}</div>
        <span class="label">${app.name}</span>
      </a>`)
    .join("");
}

function refreshLive() {
  for (const id of LIVE) {
    const el = document.querySelector(`[data-id="${id}"] .icon`);
    if (el) el.innerHTML = ICONS[id]();
  }
}

if (new URLSearchParams(location.search).has("preview")) {
  document.documentElement.classList.add("preview");
  document.querySelector(".sb-time").textContent = new Date()
    .toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

const ORDER_KEY = "retro5-order";
const ALL = [...GRID, ...DOCK];

// Restores where the user put each icon; apps the layout doesn't know keep their default place.
function savedLayout() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(ORDER_KEY)); } catch {}
  if (Array.isArray(saved)) saved = { grid: saved, dock: DOCK.map((a) => a.id) }; // older format
  if (!saved || !Array.isArray(saved.grid) || !Array.isArray(saved.dock)) {
    return { grid: GRID, dock: DOCK };
  }
  const byId = new Map(ALL.map((a) => [a.id, a]));
  const pick = (ids) => ids.map((id) => byId.get(id)).filter(Boolean);
  const dock = pick(saved.dock).slice(0, DOCK_SIZE);
  const placed = new Set([...dock, ...pick(saved.grid)].map((a) => a.id));
  const grid = pick(saved.grid).filter((a) => !dock.includes(a));
  for (const app of ALL) {
    if (placed.has(app.id)) continue;
    if (DOCK.includes(app) && dock.length < DOCK_SIZE) dock.push(app);
    else grid.push(app);
  }
  return { grid, dock };
}

function saveOrder() {
  const ids = (c) => [...c.children].map((el) => el.dataset.id);
  try { localStorage.setItem(ORDER_KEY, JSON.stringify({ grid: ids(grid), dock: ids(dock) })); } catch {}
}

const GRID_SIZE = 24, DOCK_SIZE = 4;
const grid = document.getElementById("grid");
const dock = document.getElementById("dock");
const layout = savedLayout();
render(grid, layout.grid);
render(dock, layout.dock);
setInterval(refreshLive, 1000);

// --- Edit mode: long press makes icons jiggle, then drag to rearrange the grid and the dock ---

const LONG_PRESS_MS = 500;
let editing = false;
let press = null; // { el, x, y, timer, dragging, grabX, grabY }

function setEditing(on) {
  editing = on;
  document.body.classList.toggle("editing", on);
  if (!on) saveOrder();
}

const capacity = (c) => (c === dock ? DOCK_SIZE : GRID_SIZE);

// Container and slot under the finger. The grid uses its 4x6 geometry; the dock is a single
// centered row, so its slot is the number of other dock icons left of the finger.
function slotAt(x, y, el) {
  if (y >= dock.getBoundingClientRect().top) {
    const others = [...dock.children].filter((n) => n !== el);
    const index = others.filter((n) => {
      const r = n.getBoundingClientRect();
      return r.left + r.width / 2 < x;
    }).length;
    return { container: dock, index };
  }
  const r = grid.getBoundingClientRect();
  const cs = getComputedStyle(grid);
  const left = r.left + parseFloat(cs.paddingLeft), top = r.top + parseFloat(cs.paddingTop);
  const w = (r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) / 4;
  const h = (r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / 6;
  const col = Math.min(3, Math.max(0, Math.floor((x - left) / w)));
  const row = Math.min(5, Math.max(0, Math.floor((y - top) / h)));
  return { container: grid, index: row * 4 + col };
}

// Moves the dragged icon to a new slot and slides the others into place (FLIP).
// Dropping onto a full container swaps with the icon in that slot.
function moveTo(el, { container, index }) {
  const from = el.parentNode;
  const fromItems = [...from.children];
  const others = [...container.children].filter((n) => n !== el);
  if (container !== from && others.length >= capacity(container)) {
    const target = others[Math.min(index, others.length - 1)];
    animateShift(() => {
      from.insertBefore(target, el);
      container.insertBefore(el, others[others.indexOf(target) + 1] || null);
    });
    return;
  }
  index = Math.min(index, others.length);
  if (container === from && fromItems.indexOf(el) === index) return;
  animateShift(() => container.insertBefore(el, others[index] || null));
}

function animateShift(change) {
  const items = [...grid.children, ...dock.children].filter((n) => n !== press.el);
  const before = new Map(items.map((n) => [n, n.getBoundingClientRect()]));
  change();
  for (const n of items) {
    const a = before.get(n), b = n.getBoundingClientRect();
    if (a.left === b.left && a.top === b.top) continue;
    n.style.transition = "none";
    n.style.transform = `translate(${a.left - b.left}px, ${a.top - b.top}px)`;
    requestAnimationFrame(() => {
      n.style.transition = "transform .25s ease";
      n.style.transform = "";
    });
  }
}

function follow(x, y) {
  const el = press.el;
  el.style.transform = "";
  const r = el.getBoundingClientRect();
  el.style.transform = `translate(${x - r.left - press.grabX}px, ${y - r.top - press.grabY}px)`;
}

function startDrag() {
  const el = press.el;
  const r = el.getBoundingClientRect();
  press.dragging = true;
  press.grabX = press.x - r.left;
  press.grabY = press.y - r.top;
  el.style.transition = "none";
  el.classList.add("dragging");
}

for (const container of [grid, dock]) {
  container.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(".app");
    if (!el) return;
    press = { el, x: e.clientX, y: e.clientY, dragging: false };
    if (editing) startDrag();
    else press.timer = setTimeout(() => { setEditing(true); startDrag(); }, LONG_PRESS_MS);
  });
}

document.addEventListener("pointermove", (e) => {
  if (!press) return;
  if (!press.dragging) {
    if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) { clearTimeout(press.timer); press = null; }
    return;
  }
  e.preventDefault();
  moveTo(press.el, slotAt(e.clientX, e.clientY, press.el));
  follow(e.clientX, e.clientY);
});

function endPress() {
  if (!press) return;
  clearTimeout(press.timer);
  if (press.dragging) {
    const el = press.el;
    el.classList.remove("dragging");
    el.style.transition = "transform .2s ease";
    el.style.transform = "";
    saveOrder();
  }
  press = null;
}
document.addEventListener("pointerup", endPress);
document.addEventListener("pointercancel", endPress);
document.addEventListener("contextmenu", (e) => e.preventDefault());

// --- Long press on the wallpaper opens the wallpaper sheet ---

const sheet = document.getElementById("sheet");
const wallFile = document.getElementById("wall-file");
let wallPress = null;
let sheetOpenedAt = 0;

function openSheet() {
  document.getElementById("reset-wall").hidden = !hasPhotoWallpaper();
  sheet.hidden = false;
  sheetOpenedAt = Date.now();
}
const closeSheet = () => { sheet.hidden = true; };

document.querySelector(".screen").addEventListener("pointerdown", (e) => {
  if (editing || e.target.closest(".app, .dock")) return;
  wallPress = { x: e.clientX, y: e.clientY, timer: setTimeout(openSheet, LONG_PRESS_MS + 100) };
});
document.addEventListener("pointermove", (e) => {
  if (wallPress && Math.hypot(e.clientX - wallPress.x, e.clientY - wallPress.y) > 10) {
    clearTimeout(wallPress.timer);
    wallPress = null;
  }
});
for (const type of ["pointerup", "pointercancel"]) {
  document.addEventListener(type, () => {
    if (wallPress) clearTimeout(wallPress.timer);
    wallPress = null;
  });
}

sheet.addEventListener("click", (e) => {
  if (Date.now() - sheetOpenedAt < 400) return; // the finger lifting after the long press
  if (e.target === sheet || e.target.id === "cancel-sheet") closeSheet();
});
document.getElementById("pick-wall").addEventListener("click", () => { closeSheet(); wallFile.click(); });
document.getElementById("reset-wall").addEventListener("click", () => { closeSheet(); resetWallpaper(); });
wallFile.addEventListener("change", () => {
  if (wallFile.files[0]) setPhotoWallpaper(wallFile.files[0]);
  wallFile.value = "";
});

document.addEventListener("click", (e) => {
  const link = e.target.closest(".app");
  if (editing) {
    e.preventDefault();
    if (!link) setEditing(false); // tap on the wallpaper finishes editing
    return;
  }
  if (link && link.getAttribute("href") === "#") e.preventDefault();
});

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
