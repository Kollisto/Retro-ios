// The goose: wanders over the home screen, blocks the icons it stands on, honks when poked,
// carries icons off for a moment, leaves notes and footprints, and runs to food thrown with
// the Home button. Toggled by the "Гусь" icon; the on/off choice is remembered.

const Goose = (() => {
  const KEY = "retro5-goose";
  const SIZE = 64;
  const WALK = 45, RUN = 150; // px per second
  const NOTES = ["Гусь был здесь", "Иди спать", "Га-га!", "Попей воды", "Я съел твой хлеб", "Не трогай меня", "Хлеб кончился"];

  const screenEl = document.querySelector(".screen");
  const tracks = document.createElement("div"); // footprints, under the icons
  tracks.className = "goose-tracks";
  screenEl.prepend(tracks);
  const layer = document.createElement("div"); // goose, food and notes, over the icons
  layer.className = "goose-layer";
  screenEl.append(layer);

  const el = document.createElement("div");
  el.className = "goose";
  // Flat, cute style: one dark outline around the whole silhouette, flat fills, dot eye.
  // Outlines are drawn first and fills on top, so joints between body and neck stay seamless.
  const BODY = "M9 40 Q6 37 10 36 Q16 30 29 31 Q40 32 43 39 Q45 50 34 53 Q20 55 13 48 Q8 45 9 40Z";
  const NECK = "M31.5 41 Q35.5 28 36.8 19 Q38 9.5 45 9.5 Q51.5 9.5 51.5 16 Q51.5 21 47 24 Q44 31 41 45 L34 46Z";
  el.innerHTML = `
    <svg viewBox="0 0 64 64">
      <ellipse cx="29" cy="59" rx="14" ry="2.2" fill="#000" opacity=".16"/>
      <g class="gs-legs" fill="#ef5a24" stroke="#1d1d1d" stroke-width="1.6" stroke-linejoin="round">
        <path class="gs-leg gs-leg-a" d="M21 52 h6 v4.5 h4 q1.2 0 1.2 1.2 v.8 h-11.2Z"/>
        <path class="gs-leg gs-leg-b" d="M30 52 h6 v4.5 h4 q1.2 0 1.2 1.2 v.8 h-11.2Z"/>
      </g>
      <path d="${BODY}" fill="#1d1d1d" stroke="#1d1d1d" stroke-width="3.2" stroke-linejoin="round"/>
      <g class="gs-neck"><path d="${NECK}" fill="#1d1d1d" stroke="#1d1d1d" stroke-width="3.2" stroke-linejoin="round"/></g>
      <path d="${BODY}" fill="#f6f2ee"/>
      <g class="gs-neck">
        <path d="${NECK}" fill="#f6f2ee"/>
        <g class="gs-beak" stroke="#1d1d1d" stroke-width="1.5" stroke-linejoin="round" fill="#ef5a24">
          <path class="gs-beak-bottom" d="M50.5 16.5 Q55 16.5 57 17.6 Q54.5 19.6 50 19.2Z"/>
          <path class="gs-beak-top" d="M50 12.4 Q56 12 59 14.6 Q56.5 17.4 50.2 17.6Z"/>
        </g>
        <circle cx="46" cy="14.6" r="1.25" fill="#1d1d1d"/>
      </g>
    </svg>`;

  let on = false, raf = 0, last = 0;
  let x = 60, y = 300, dir = 1; // dir 1 = facing right
  let task = null; // { kind, ... }
  let carried = null; // the .app element in the beak
  let food = null; // { el, x, y }
  let stepClock = 0, printClock = 0;
  let lastCarry = 0, lastNote = 0;

  // ---- geometry ----
  const box = () => {
    const s = screenEl.getBoundingClientRect();
    const g = document.getElementById("grid").getBoundingClientRect();
    const d = document.querySelector(".dock").getBoundingClientRect();
    return { left: 6, right: s.width - SIZE - 6, top: g.top - s.top, bottom: d.top - s.top + 30 };
  };
  const rand = (a, b) => a + Math.random() * (b - a);
  const randomSpot = () => {
    const b = box();
    return { x: rand(b.left, b.right), y: rand(b.top, b.bottom - SIZE) };
  };

  function place() {
    el.style.transform = `translate(${x}px, ${y}px)`;
    el.querySelector("svg").style.transform = `scaleX(${dir})`;
    if (carried) {
      const { left, top, width } = carried.base;
      const beakX = x + (dir > 0 ? 50 : 14) - width / 2, beakY = y + 4;
      carried.el.style.transform = `translate(${beakX - left}px, ${beakY - top}px) rotate(${dir * 8}deg)`;
    }
  }

  function setPose(pose) {
    el.classList.toggle("pecking", pose === "peck");
  }

  // ---- sound ----
  let audio = null;
  function honk() {
    try {
      if (navigator.audioSession) navigator.audioSession.type = "ambient";
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      const t0 = audio.currentTime;
      // a low, nasal honk with a slight tremble, like a real goose
      for (const [start, f] of [[0, 260], [0.2, 240]]) {
        const t = t0 + start, dur = 0.17;
        const osc = audio.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.exponentialRampToValueAtTime(f * 0.9, t + dur * 0.9);
        const tremble = audio.createOscillator();
        const trembleDepth = audio.createGain();
        tremble.frequency.value = 28;
        trembleDepth.gain.value = f * 0.04;
        tremble.connect(trembleDepth).connect(osc.frequency);
        const formant = audio.createBiquadFilter();
        formant.type = "bandpass";
        formant.frequency.value = 800;
        formant.Q.value = 3.5;
        const gain = audio.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.8, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(formant).connect(gain).connect(audio.destination);
        osc.start(t);
        tremble.start(t);
        osc.stop(t + dur + 0.02);
        tremble.stop(t + dur + 0.02);
      }
    } catch {}
    el.classList.add("honking");
    setTimeout(() => el.classList.remove("honking"), 380);
  }

  // ---- footprints ----
  function footprint() {
    const p = document.createElement("div");
    p.className = "goose-print";
    const side = (printClock++ % 2 ? 1 : -1) * 3;
    p.style.transform = `translate(${x + 32 - 4}px, ${y + 57 + side}px) rotate(${dir > 0 ? 90 : -90}deg)`;
    tracks.append(p);
    setTimeout(() => p.remove(), 2600);
  }

  // ---- things the goose does ----
  function nextTask() {
    dropCarried(); // whatever happened, an icon never stays in the beak between tasks
    const now = performance.now();
    const editing = document.body.classList.contains("editing");
    const r = Math.random();
    if (!editing && now - lastCarry > 40000 && r < 0.14) return startCarry();
    if (now - lastNote > 60000 && r < 0.24) return startNote();
    if (r < 0.45) return (task = { kind: "peck", until: now + rand(1200, 2600) });
    if (r < 0.52) return (task = { kind: "stand", until: now + rand(800, 2000) });
    const s = randomSpot();
    task = { kind: "walk", tx: s.x, ty: s.y, speed: WALK };
  }

  function startCarry() {
    const icons = [...document.querySelectorAll("#grid .app")].filter((a) => a.dataset.id !== "goose");
    const target = icons[Math.floor(Math.random() * icons.length)];
    if (!target) return nextTask();
    const s = screenEl.getBoundingClientRect(), r = target.getBoundingClientRect();
    lastCarry = performance.now();
    task = { kind: "fetch", target, tx: r.left - s.left + r.width / 2 - (dir > 0 ? 50 : 14), ty: r.top - s.top - 4, speed: WALK * 1.3 };
  }

  function grab(target) {
    const s = screenEl.getBoundingClientRect(), r = target.getBoundingClientRect();
    carried = { el: target, base: { left: r.left - s.left, top: r.top - s.top, width: r.width } };
    target.classList.add("carried");
    target.style.transition = "none";
    const spot = randomSpot();
    task = { kind: "walk", tx: spot.x, ty: spot.y, speed: WALK, then: dropCarried };
  }

  function dropCarried() {
    if (!carried) return;
    const a = carried.el;
    carried = null;
    a.style.transition = "transform .45s ease";
    a.style.transform = "";
    setTimeout(() => { a.classList.remove("carried"); a.style.transition = ""; }, 460);
  }

  function startNote() {
    if (carried) return;
    lastNote = performance.now();
    if (layer.querySelectorAll(".goose-note").length >= 2) return nextTask();
    const n = document.createElement("div");
    n.className = "goose-note";
    n.textContent = NOTES[Math.floor(Math.random() * NOTES.length)];
    n.style.left = Math.min(Math.max(x - 10, 8), box().right - 30) + "px";
    n.style.top = y + 30 + "px";
    n.style.setProperty("--tilt", rand(-9, 9) + "deg");
    n.addEventListener("pointerdown", (e) => e.stopPropagation());
    n.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      n.classList.add("gone");
      setTimeout(() => n.remove(), 300);
    });
    layer.append(n);
    honk();
    task = { kind: "stand", until: performance.now() + 900 };
  }

  // With the neck lowered, the beak tip sits this far from the goose's left edge (facing right).
  const PECK_REACH = 62, PECK_DROP = 57;

  function feed() {
    if (!on) return;
    food?.el.remove();
    let spot;
    for (let i = 0; i < 10; i++) { // throw it somewhere away from the goose
      spot = randomSpot();
      if (Math.hypot(spot.x - x, spot.y - y) > 140) break;
    }
    const fx = spot.x + SIZE / 2, fy = spot.y + PECK_DROP; // where the crumbs land
    const f = document.createElement("div");
    f.className = "goose-food";
    f.innerHTML = "<i></i><i></i><i></i><i></i>";
    f.style.left = fx - 11 + "px";
    f.style.top = fy - 6 + "px";
    layer.append(f);
    food = { el: f, x: fx, y: fy };
    dropCarried();
    // walk up so the beak, not the tail, ends at the crumbs
    const face = fx > x + SIZE / 2 ? 1 : -1;
    task = {
      kind: "walk", speed: RUN,
      tx: face > 0 ? fx - PECK_REACH : fx - (SIZE - PECK_REACH), ty: fy - PECK_DROP,
      then: () => { dir = face; eat(); },
    };
  }

  function eat() {
    const f = food;
    if (!f) return;
    dir = f.x > x + SIZE / 2 ? 1 : -1; // turn to the food
    task = { kind: "peck", until: performance.now() + 1800 };
    const crumbs = [...f.el.children];
    crumbs.forEach((c, i) => setTimeout(() => c.classList.add("eaten"), 350 + i * 360));
    setTimeout(() => { f.el.remove(); if (food === f) food = null; }, 1900);
  }

  function poke(e) {
    e.stopPropagation();
    e.preventDefault();
    honk();
    dropCarried();
    // run away from the finger
    const b = box();
    const away = x + SIZE / 2 < e.clientX - screenEl.getBoundingClientRect().left ? -1 : 1;
    task = {
      kind: "walk",
      tx: Math.min(Math.max(x + away * rand(120, 200), b.left), b.right),
      ty: Math.min(Math.max(y + rand(-90, 90), b.top), b.bottom - SIZE),
      speed: RUN,
    };
  }

  // ---- main loop ----
  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!task) nextTask();
    if (task.kind === "walk" || task.kind === "fetch") {
      const dx = task.tx - x, dy = task.ty - y, dist = Math.hypot(dx, dy);
      setPose("walk");
      if (dist < 2) {
        const done = task;
        task = null;
        el.classList.remove("walking", "running");
        if (done.kind === "fetch") grab(done.target);
        else done.then?.();
      } else {
        const step = Math.min(dist, task.speed * dt);
        x += (dx / dist) * step;
        y += (dy / dist) * step;
        if (Math.abs(dx) > 1) dir = dx > 0 ? 1 : -1;
        el.classList.add("walking");
        el.classList.toggle("running", task.speed > WALK * 1.5);
        stepClock += step;
        if (stepClock > 18) { stepClock = 0; footprint(); }
      }
    } else {
      el.classList.remove("walking", "running");
      setPose(task.kind === "peck" ? "peck" : "stand");
      if (now > task.until) task = null;
    }
    place();
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (on) return;
    on = true;
    try { localStorage.setItem(KEY, "on"); } catch {}
    const b = box();
    x = Math.random() < 0.5 ? -SIZE : b.right + SIZE; // waddles in from the side
    y = rand(b.top, b.bottom - SIZE);
    const s = randomSpot();
    task = { kind: "walk", tx: s.x, ty: s.y, speed: WALK };
    layer.append(el);
    last = performance.now();
    raf = requestAnimationFrame(tick);
    honk();
  }

  function stop() {
    if (!on) return;
    on = false;
    try { localStorage.setItem(KEY, "off"); } catch {}
    cancelAnimationFrame(raf);
    dropCarried();
    food?.el.remove();
    food = null;
    task = null;
    el.remove();
    layer.querySelectorAll(".goose-note").forEach((n) => n.remove());
  }

  el.addEventListener("pointerdown", (e) => e.stopPropagation());
  el.addEventListener("click", poke);

  document.addEventListener("visibilitychange", () => {
    if (!on) return;
    cancelAnimationFrame(raf);
    if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); }
  });

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch {}
  if (saved === "on") setTimeout(start, 600);

  return {
    toggle: () => (on ? stop() : start()),
    feed,
    get active() { return on; },
    releaseIcon: dropCarried,
  };
})();
