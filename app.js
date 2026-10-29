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
  { id: "clock", name: "Часы", gloss: true, url: "clock-alarm://" },
  { id: "itunes", name: "iTunes Store", gloss: true, url: "itms://" },
  { id: "appstore", name: "App Store", gloss: true, url: "itms-apps://" },
  { id: "settings", name: "Настройки", url: "App-prefs:" },
  { id: "safari", name: "Safari", gloss: true, url: "x-safari-https://www.google.com" },
  { id: "instagram", name: "Instagram", gloss: true, url: "instagram://app" },
  { id: "telegram", name: "Telegram", gloss: true, url: "tg://" },
  { id: "reddit", name: "Reddit", gloss: true, url: "reddit://" },
  { id: "threads", name: "Threads", gloss: true, url: "barcelona://" },
  { id: "revolut", name: "Revolut", gloss: true, url: "revolut://" },
  { id: "trafi", name: "Trafi", gloss: true, url: "trafi://" },
  { id: "oura", name: "Oura", gloss: true, url: "oura://" },
  { id: "teams", name: "Teams", gloss: true, url: "msteams://" },
  { id: "focusfriend", name: "Focus Friend", gloss: true, url: sc("Focus Friend") },
];

const DOCK = [
  { id: "phone", name: "Телефон", gloss: true, url: "mobilephone://" },
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

render(document.getElementById("grid"), GRID);
render(document.getElementById("dock"), DOCK);
setInterval(refreshLive, 1000);

document.addEventListener("click", (e) => {
  const link = e.target.closest(".app");
  if (link && link.getAttribute("href") === "#") e.preventDefault();
});

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
