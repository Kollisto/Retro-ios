// Default home screen layout: up to 24 icons in the grid, 4 in the dock.
// Labels come from i18n.js in the phone's language; the names here are the fallback.
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
  { id: "refresh", name: "Обновить", gloss: true },
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
  { id: "goose", name: "Гусь", gloss: true },
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
        <span class="label">${appLabel(app)}</span>
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
  const RENAMED = { itunes: "refresh" }; // icons replaced in place keep their slot
  const pick = (ids) => ids.map((id) => byId.get(RENAMED[id] || id)).filter(Boolean);
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
  if (on) Goose.releaseIcon();
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

// Marks (or clears) the icon the dragged one will swap with when the finger lifts.
function setSwapTarget(target) {
  if (press.swapTarget === target) return;
  press.swapTarget?.classList.remove("swap-target");
  press.swapTarget = target;
  target?.classList.add("swap-target");
}

// Moves the dragged icon to a new slot and slides the others into place (FLIP).
// Over a full container nothing moves yet: the icon under the finger is marked and the two
// swap on release.
function moveTo(el, { container, index }) {
  const from = el.parentNode;
  const fromItems = [...from.children];
  const others = [...container.children].filter((n) => n !== el);
  if (container !== from && others.length >= capacity(container)) {
    setSwapTarget(others[Math.min(index, others.length - 1)]);
    return;
  }
  setSwapTarget(null);
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
    if (!el || Goose.blocks(el)) return; // no rearranging while the goose is on the rampage
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
    const target = press.swapTarget;
    if (target) {
      setSwapTarget(null);
      const was = el.getBoundingClientRect();
      const from = el.parentNode, to = target.parentNode;
      const next = target.nextSibling === el ? target : target.nextSibling;
      animateShift(() => {
        from.insertBefore(target, el);
        to.insertBefore(el, next);
      });
      // keep the icon under the finger, then let it glide into its new slot
      el.style.transform = "";
      const now = el.getBoundingClientRect();
      el.style.transition = "none";
      el.style.transform = `translate(${was.left - now.left}px, ${was.top - now.top}px)`;
      el.getBoundingClientRect();
    }
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
// The document is taller than iOS's window, so keep it from scrolling.
document.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
addEventListener("scroll", () => scrollTo(0, 0));

// --- Long press on the wallpaper opens the wallpaper sheet ---

// wallpaper sheet buttons in the phone's language
["pick-wall", "reset-wall", "cancel-sheet"].forEach((id, i) => (document.getElementById(id).textContent = T.sheet[i]));
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
  if (editing || e.target.closest(".app, .dock, .chin")) return;
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
  if (!link) return;
  e.preventDefault();
  if (Goose.blocks(link)) return deny(link);
  if (link.dataset.id === "refresh") refreshApp(link);
  else if (link.dataset.id === "goose") Goose.toggle();
  else if (link.getAttribute("href") !== "#") launch(link);
});

// --- Home button: a click you hear and (on iOS 18+) feel; it ends editing and closes the sheet ---

const homeBtn = document.getElementById("home-btn");
const hapticLabel = document.querySelector(".haptic");
let audio = null;

function clickSound() {
  try {
    if (navigator.audioSession) navigator.audioSession.type = "ambient"; // stays quiet in silent mode
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const t = audio.currentTime, rate = audio.sampleRate;
    // a soft, muffled tick: low-passed noise plus a short low thump
    const len = Math.floor(rate * 0.03);
    const buf = audio.createBuffer(1, len, rate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 8);
    const noise = audio.createBufferSource();
    noise.buffer = buf;
    const lowpass = audio.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 1200;
    const noiseGain = audio.createGain();
    noiseGain.gain.value = 0.35;
    noise.connect(lowpass).connect(noiseGain).connect(audio.destination);
    const thump = audio.createOscillator();
    thump.frequency.setValueAtTime(190, t);
    thump.frequency.exponentialRampToValueAtTime(90, t + 0.03);
    const thumpGain = audio.createGain();
    thumpGain.gain.setValueAtTime(0.25, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    thump.connect(thumpGain).connect(audio.destination);
    noise.start(t);
    thump.start(t);
    thump.stop(t + 0.05);
  } catch {}
}

// Safari gives no vibration API, but toggling a native switch plays the system haptic.
function haptic() {
  if (navigator.vibrate) navigator.vibrate(10);
  else hapticLabel.click();
}

homeBtn.addEventListener("pointerdown", () => {
  homeBtn.classList.add("pressed");
  clickSound();
  haptic();
});
for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
  homeBtn.addEventListener(type, () => homeBtn.classList.remove("pressed"));
}
homeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!sheet.hidden) closeSheet();
  else if (editing) setEditing(false);
  else Goose.feed();
});

// An icon the angry goose won't let you open gives a little "no" shake.
function deny(link) {
  const icon = link.querySelector(".icon");
  icon.classList.remove("denied");
  void icon.offsetWidth;
  icon.classList.add("denied");
}

// --- "Обновить": drop the offline cache and reload, so the newest version shows up ---
// The layout, wallpaper and weather settings live in local storage and are kept.

async function refreshApp(link) {
  link.querySelector(".icon").classList.add("spinning");
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    const reg = await navigator.serviceWorker?.getRegistration();
    await reg?.update();
  } catch {}
  location.reload();
}

// --- iOS 5 open / close animation ---

const launchEl = document.getElementById("launch");
let launched = null; // { link, timer }

function placeOver(rect, radius) {
  Object.assign(launchEl.style, {
    left: rect.left + "px", top: rect.top + "px",
    width: rect.width + "px", height: rect.height + "px", borderRadius: radius,
  });
}

function launch(link) {
  if (launched) return;
  const icon = link.querySelector(".icon");
  const rect = icon.getBoundingClientRect();
  launchEl.innerHTML = icon.outerHTML;
  launchEl.style.transition = "none";
  launchEl.classList.remove("full");
  placeOver(rect, "13px");
  launchEl.hidden = false;
  launchEl.getBoundingClientRect();
  launchEl.style.transition = "";
  placeOver({ left: 0, top: 0, width: innerWidth, height: appHeight() }, "0");
  launchEl.classList.add("full");
  Goose.noticeLaunch(link.dataset.id);
  launched = { link, timer: setTimeout(() => {
    location.href = link.href;
    // If nothing opened (or the user declined iOS's prompt), come back on our own.
    launched.timer = setTimeout(closeApp, 2500);
  }, 380) };
}

// Back on the home screen: the app shrinks into its icon.
function closeApp() {
  if (!launched) return;
  clearTimeout(launched.timer);
  const rect = launched.link.querySelector(".icon").getBoundingClientRect();
  launched = null;
  Goose.returned();
  launchEl.classList.remove("full");
  placeOver(rect, "13px");
  setTimeout(() => { launchEl.hidden = true; }, 380);
}

document.addEventListener("visibilitychange", () => {
  if (!launched) return;
  if (document.hidden) clearTimeout(launched.timer); // the app opened; wait for the user to return
  else setTimeout(closeApp, 150);
});
addEventListener("pageshow", () => setTimeout(closeApp, 150));

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
