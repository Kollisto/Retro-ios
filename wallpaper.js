// Wallpaper: hand-drawn "water drops on glass" by default, or a photo the user picked
// (stored only on this phone). Both are painted onto one full-screen canvas.

const WALL_KEY = "retro5-wallpaper";
const wall = document.getElementById("wall");

// Seeded random so the drops stay in the same places on every launch.
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawDrop(ctx, x, y, r) {
  const ry = r * 0.92;
  // soft shadow under the drop
  const sh = ctx.createRadialGradient(x, y + r * 0.35, r * 0.6, x, y + r * 0.35, r * 1.25);
  sh.addColorStop(0, "rgba(20, 35, 40, .22)");
  sh.addColorStop(1, "rgba(20, 35, 40, 0)");
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.arc(x, y + r * 0.35, r * 1.25, 0, Math.PI * 2);
  ctx.fill();
  // body: bright refracted light below, dark rim around
  const body = ctx.createRadialGradient(x, y + r * 0.35, 0, x, y, r);
  body.addColorStop(0, "rgba(255, 255, 255, .5)");
  body.addColorStop(0.55, "rgba(255, 255, 255, .12)");
  body.addColorStop(0.85, "rgba(30, 45, 50, .25)");
  body.addColorStop(1, "rgba(15, 25, 30, .6)");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(x, y, r, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  // darker upper rim
  ctx.strokeStyle = "rgba(10, 20, 25, .45)";
  ctx.lineWidth = Math.max(0.6, r * 0.12);
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.94, ry * 0.94, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  // specular highlight
  if (r > 2) {
    ctx.fillStyle = "rgba(255, 255, 255, .95)";
    ctx.beginPath();
    ctx.ellipse(x - r * 0.35, y - r * 0.42, r * 0.2, r * 0.13, -0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDrops(ctx, w, h, unit) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#3aa2b5");
  bg.addColorStop(0.12, "#8cc3cc");
  bg.addColorStop(0.3, "#c9cfd1");
  bg.addColorStop(0.65, "#b4b7b9");
  bg.addColorStop(1, "#6f7375");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const rnd = seeded(5);
  // Big drops gather at the top, tiny ones are spread everywhere.
  for (let i = 0; i < 520; i++) {
    const y = h * Math.pow(rnd(), 1.5);
    const top = 1 - y / h;
    const big = rnd() < 0.12 * top;
    const r = unit * (big ? 7 + rnd() * 9 * top : 0.8 + rnd() * 2.6 * top + rnd() * 0.8);
    drawDrop(ctx, rnd() * w, y, r);
  }
}

function paintWallpaper() {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
  wall.width = w;
  wall.height = h;
  const ctx = wall.getContext("2d");
  let photo = null;
  try { photo = localStorage.getItem(WALL_KEY); } catch {}
  if (!photo) return drawDrops(ctx, w, h, dpr);
  const img = new Image();
  img.onload = () => {
    const s = Math.max(w / img.width, h / img.height);
    ctx.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s);
  };
  img.onerror = () => drawDrops(ctx, w, h, dpr);
  img.src = photo;
}

// Shrinks the chosen photo to screen size so it fits in local storage.
function setPhotoWallpaper(file) {
  const img = new Image();
  img.onload = () => {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
    const s = Math.max(w / img.width, h / img.height);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    c.getContext("2d").drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s);
    URL.revokeObjectURL(img.src);
    try {
      localStorage.setItem(WALL_KEY, c.toDataURL("image/jpeg", 0.85));
    } catch {
      alert("Не удалось сохранить обои: картинка слишком большая.");
    }
    paintWallpaper();
  };
  img.src = URL.createObjectURL(file);
}

function resetWallpaper() {
  try { localStorage.removeItem(WALL_KEY); } catch {}
  paintWallpaper();
}

function hasPhotoWallpaper() {
  try { return !!localStorage.getItem(WALL_KEY); } catch { return false; }
}

paintWallpaper();
addEventListener("resize", paintWallpaper);
