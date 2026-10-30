// Live weather for the Weather icon, from the free Open-Meteo service (no account needed).
// Location is asked once and remembered; the last reading is kept for offline launches.

const WEATHER_KEY = "retro5-weather";
const COORDS_KEY = "retro5-coords";
const WEATHER_TTL = 15 * 60 * 1000;

let WEATHER_NOW = null;
try { WEATHER_NOW = JSON.parse(localStorage.getItem(WEATHER_KEY)); } catch {}

// WMO weather codes -> the picture on the icon
function weatherKind(code) {
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 51) return "rain";
  if (code === 45 || code === 48) return "fog";
  if (code === 3) return "cloudy";
  if (code === 1 || code === 2) return "partly";
  return "clear";
}

function getCoords() {
  try {
    const saved = JSON.parse(localStorage.getItem(COORDS_KEY));
    if (saved) return Promise.resolve(saved);
  } catch {}
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject();
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = { lat: +pos.coords.latitude.toFixed(2), lon: +pos.coords.longitude.toFixed(2) };
      try { localStorage.setItem(COORDS_KEY, JSON.stringify(coords)); } catch {}
      resolve(coords);
    }, reject, { timeout: 15000, maximumAge: 3600000 });
  });
}

async function updateWeather() {
  if (WEATHER_NOW && Date.now() - WEATHER_NOW.ts < WEATHER_TTL) return;
  try {
    const { lat, lon } = await getCoords();
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      "&current=temperature_2m,weather_code,is_day");
    const { current } = await res.json();
    WEATHER_NOW = {
      temp: current.temperature_2m,
      kind: weatherKind(current.weather_code),
      day: current.is_day === 1,
      ts: Date.now(),
    };
    try { localStorage.setItem(WEATHER_KEY, JSON.stringify(WEATHER_NOW)); } catch {}
    for (const el of document.querySelectorAll('[data-id="weather"] .icon')) el.innerHTML = ICONS.weather();
  } catch {
    // no permission or no internet: keep the last reading, or the classic 73°
  }
}

setTimeout(updateWeather, 500);
setInterval(updateWeather, WEATHER_TTL);
document.addEventListener("visibilitychange", () => { if (!document.hidden) updateWeather(); });
