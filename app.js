// Home screen layout: 24 icons in the grid, 4 in the dock.
// url is filled in at stage 4 (deep links / Shortcuts).

const GRID = [
  { id: "messages", name: "Сообщения", gloss: true },
  { id: "calendar", name: "Календарь", gloss: true },
  { id: "photos", name: "Фото" },
  { id: "camera", name: "Камера" },
  { id: "youtube", name: "YouTube", gloss: true },
  { id: "maps", name: "Карты", gloss: true },
  { id: "weather", name: "Погода", gloss: true },
  { id: "notes", name: "Заметки", gloss: true },
  { id: "reminders", name: "Напоминания", gloss: true },
  { id: "clock", name: "Часы", gloss: true },
  { id: "itunes", name: "iTunes Store", gloss: true },
  { id: "appstore", name: "App Store", gloss: true },
  { id: "settings", name: "Настройки" },
  { id: "safari", name: "Safari", gloss: true },
  { id: "instagram", name: "Instagram", ph: ["I", "#8a5a3c"] },
  { id: "telegram", name: "Telegram", ph: ["T", "#2a9fd8"] },
  { id: "reddit", name: "Reddit", ph: ["R", "#ff4500"] },
  { id: "threads", name: "Threads", ph: ["@", "#111"] },
  { id: "revolut", name: "Revolut", ph: ["R", "#222"] },
  { id: "trafi", name: "Trafi", ph: ["T", "#18b26b"] },
  { id: "oura", name: "Oura", ph: ["O", "#333"] },
  { id: "teams", name: "Teams", ph: ["T", "#5059c9"] },
  { id: "focusfriend", name: "Focus Friend", ph: ["F", "#d99a5b"] },
];

const DOCK = [
  { id: "phone", name: "Телефон", gloss: true },
  { id: "mail", name: "Почта", gloss: true },
  { id: "chrome", name: "Chrome", ph: ["C", "#4285f4"] },
  { id: "spotify", name: "Spotify", ph: ["S", "#1db954"] },
];

const LIVE = ["calendar", "clock"];

function iconSvg(app) {
  return app.ph ? ICONS.placeholder(...app.ph) : ICONS[app.id]();
}

function render(container, apps) {
  container.innerHTML = apps
    .map((app) => `
      <a class="app" data-id="${app.id}" href="${app.url || "#"}">
        <div class="icon${app.gloss || app.ph ? " gloss" : ""}">${iconSvg(app)}</div>
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

render(document.getElementById("grid"), GRID);
render(document.getElementById("dock"), DOCK);
setInterval(refreshLive, 1000);

document.addEventListener("click", (e) => {
  const link = e.target.closest(".app");
  if (link && link.getAttribute("href") === "#") e.preventDefault();
});

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
