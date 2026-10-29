// Home screen layout: up to 24 icons in the grid, 4 in the dock.
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

// Restores the grid order the user arranged; new apps go to the end.
function savedGrid() {
  let order = [];
  try { order = JSON.parse(localStorage.getItem(ORDER_KEY)) || []; } catch {}
  const rank = (app) => (order.includes(app.id) ? order.indexOf(app.id) : order.length + GRID.indexOf(app));
  return [...GRID].sort((a, b) => rank(a) - rank(b));
}

function saveOrder() {
  const ids = [...grid.children].map((el) => el.dataset.id);
  try { localStorage.setItem(ORDER_KEY, JSON.stringify(ids)); } catch {}
}

const grid = document.getElementById("grid");
render(grid, savedGrid());
render(document.getElementById("dock"), DOCK);
setInterval(refreshLive, 1000);

// --- Edit mode: long press makes icons jiggle, then drag to rearrange the grid ---

const LONG_PRESS_MS = 500;
let editing = false;
let press = null; // { el, x, y, timer, dragging, grabX, grabY }

function setEditing(on) {
  editing = on;
  document.body.classList.toggle("editing", on);
  if (!on) saveOrder();
}

// Cell index under the finger, from the grid's 4x6 geometry.
function cellAt(x, y) {
  const r = grid.getBoundingClientRect();
  const cs = getComputedStyle(grid);
  const left = r.left + parseFloat(cs.paddingLeft), top = r.top + parseFloat(cs.paddingTop);
  const w = (r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) / 4;
  const h = (r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / 6;
  const col = Math.min(3, Math.max(0, Math.floor((x - left) / w)));
  const row = Math.min(5, Math.max(0, Math.floor((y - top) / h)));
  return Math.min(row * 4 + col, grid.children.length - 1);
}

// Moves the dragged icon to a new slot and slides the others into place (FLIP).
function moveTo(el, index) {
  const items = [...grid.children];
  if (items.indexOf(el) === index) return;
  const before = new Map(items.map((n) => [n, n.getBoundingClientRect()]));
  const rest = items.filter((n) => n !== el);
  grid.insertBefore(el, rest[index] || null);
  for (const n of rest) {
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

grid.addEventListener("pointerdown", (e) => {
  const el = e.target.closest(".app");
  if (!el) return;
  press = { el, x: e.clientX, y: e.clientY, dragging: false };
  if (editing) startDrag();
  else press.timer = setTimeout(() => { setEditing(true); startDrag(); }, LONG_PRESS_MS);
});

document.addEventListener("pointermove", (e) => {
  if (!press) return;
  if (!press.dragging) {
    if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) { clearTimeout(press.timer); press = null; }
    return;
  }
  e.preventDefault();
  moveTo(press.el, cellAt(e.clientX, e.clientY));
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
