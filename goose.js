// The goose: wanders over the home screen, blocks the icons it stands on, honks when poked
// (and gets angry and grabs icons when poked three times; see "anger" below), carries icons off for a moment,
// leaves notes and footprints, and runs to food thrown with the Home button (food calms it). Toggled by the "Гусь" icon; the on/off choice is remembered.

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
  const BODY = "M10 40 Q9.5 35 14.5 33.5 Q20 30.5 29 31 Q40 32 43 39 Q45 50 34 53 Q20 55 13.5 48.5 Q9.5 45 10 40Z";
  const TAIL = "M15 37 Q7 31 4.2 34.2 Q4.2 39.8 13.5 44Z"; // side view, pointing up and back
  const BACK_TAIL = "M27.5 46.5 Q30.2 52.5 32 56.5 Q33.8 52.5 36.5 46.5Z";
  const NECK = "M31.5 41 Q35.5 28 36.8 19 Q38 9.5 45 9.5 Q51.5 9.5 51.5 16 Q51.5 21 47 24 Q44 31 41 45 L34 46Z";
  const INK = "#1d1d1d", WHITE = "#f6f2ee", ORANGE = "#ef5a24";
  // outline copy underneath, fill copy on top
  const outline = (d) => `<path d="${d}" fill="${INK}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>`;
  const fill = (d) => `<path d="${d}" fill="${WHITE}"/>`;
  // Goose legs: a short orange shank and a webbed three-toed foot.
  // The shank is a line from the hip (fixed to the body) to the ankle (moves with the foot),
  // so the leg always stays attached to the body however far the foot is from it.
  const shank = (x, hipY, ankleY) => `
      <line class="gs-shank-o" x1="${x}" y1="${hipY}" x2="${x}" y2="${ankleY}" stroke="${INK}" stroke-width="5.4" stroke-linecap="round"/>
      <line class="gs-shank" x1="${x}" y1="${hipY}" x2="${x}" y2="${ankleY}" stroke="${ORANGE}" stroke-width="2.8" stroke-linecap="round"/>`;
  const sideLeg = (cls, x) => `<g class="gs-leg ${cls}" data-hip="${x},48" data-ankle="${x},58.6">${shank(x, 48, 58.6)}
      <g class="gs-foot"><path d="M${x - 3} 61.4 L${x - 1.8} 58.4 L${x + 1.4} 57.9 L${x + 9.6} 59.7 Q${x + 10.4} 61 ${x + 9.1} 61.5
        Q${x + 7.7} 60.8 ${x + 6.6} 61.5 Q${x + 5.2} 60.8 ${x + 4.1} 61.5 Q${x + 2.8} 60.8 ${x + 1.7} 61.5Z"/></g></g>`;
  const frontLeg = (cls, x) => `<g class="gs-leg ${cls}" data-hip="${x},46" data-ankle="${x},56.5">${shank(x, 46, 56.5)}
      <g class="gs-foot"><path d="M${x} 56 L${x - 6} 61.6 Q${x - 4} 60.6 ${x - 2} 61.7 Q${x} 60.6 ${x + 2} 61.7 Q${x + 4} 60.6 ${x + 6} 61.6Z"/></g></g>`;
  const legs = (leg, xa, xb) => `<g fill="${ORANGE}" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round">${leg("gs-leg-a", xa)}${leg("gs-leg-b", xb)}</g>`;
  const shadow = `<ellipse cx="32" cy="61.6" rx="14" ry="2.2" fill="#000" opacity=".16"/>`;
  // front and back: an egg-shaped body with the neck rising from its middle
  const EGG = "M32 22 Q46.5 24 47 38.5 Q47 51 32 51.5 Q17 51 17 38.5 Q17.5 24 32 22Z";
  const NECK_UP = "M26.5 33 Q25.5 19 26.5 13.5 Q27.5 5.5 32 5.5 Q36.5 5.5 37.5 13.5 Q38.5 19 37.5 33Z";
  // pink flush over the head and neck, shown in a fury
  const blushGrad = (id) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff6f93"/><stop offset=".38" stop-color="#ff9bb3"/><stop offset=".75" stop-color="#ffc4d2" stop-opacity="0"/></linearGradient></defs>`;
  const blush = (d, id) => `<path class="gs-blush" d="${d}" fill="url(#${id})"/>`;
  el.innerHTML = `
    <div class="goose-sparks"></div>
    <svg class="gs-view view-side" viewBox="0 0 64 64">${blushGrad("gs-pink-s")}
      ${shadow}
      ${legs(sideLeg, 24, 32)}
      ${outline(BODY)}
      <g class="gs-tail">${outline(TAIL)}</g>
      <g class="gs-neck">${outline(NECK)}</g>
      ${fill(BODY)}
      <g class="gs-tail">${fill(TAIL)}</g>
      <g class="gs-neck">
        ${fill(NECK)}${blush(NECK, "gs-pink-s")}
        <g class="gs-beak" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round" fill="${ORANGE}">
          <path class="gs-beak-bottom" d="M50.5 16.5 Q55 16.5 57 17.6 Q54.5 19.6 50 19.2Z"/>
          <path class="gs-beak-top" d="M50 12.4 Q56 12 59 14.6 Q56.5 17.4 50.2 17.6Z"/>
        </g>
        <circle cx="46" cy="14.6" r="1.25" fill="${INK}"/>
        <path class="gs-brow" d="M43.6 10.8 L48.6 12.9" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
      </g>
    </svg>
    <svg class="gs-view view-front" viewBox="0 0 64 64">${blushGrad("gs-pink-f")}
      ${shadow}
      ${legs(frontLeg, 26, 38)}
      ${outline(EGG)}${outline(NECK_UP)}${fill(EGG)}${fill(NECK_UP)}${blush(NECK_UP, "gs-pink-f")}
      <path d="M19.5 36 Q20.5 44 26 48 M44.5 36 Q43.5 44 38 48" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="29.2" cy="11.2" r="1.15" fill="${INK}"/><circle cx="34.8" cy="11.2" r="1.15" fill="${INK}"/>
      <ellipse class="gs-mouth" cx="32" cy="17.6" rx="2.2" ry="2.6" fill="#7a1d0a" stroke="${INK}" stroke-width="1.2"/>
      <path class="gs-beak-front" d="M28.8 14 Q32 12.8 35.2 14 Q34.2 18.6 32 19.2 Q29.8 18.6 28.8 14Z" fill="${ORANGE}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
      <path class="gs-brow" d="M26.8 8.2 L30.6 9.6 M37.2 8.2 L33.4 9.6" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <svg class="gs-view view-back" viewBox="0 0 64 64">${blushGrad("gs-pink-b")}
      ${shadow}
      ${legs(frontLeg, 26, 38)}
      ${outline(EGG)}${outline(NECK_UP)}<g class="gs-tail gs-tail-back">${outline(BACK_TAIL)}</g>
      ${fill(EGG)}${fill(NECK_UP)}${blush(NECK_UP, "gs-pink-b")}<g class="gs-tail gs-tail-back">${fill(BACK_TAIL)}</g>
      <path d="M24.5 31 Q21.5 41 29.5 48 M39.5 31 Q42.5 41 34.5 48" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`;

  let on = false, raf = 0, last = 0;
  let x = 60, y = 300, dir = 1; // dir 1 = facing right
  let task = null; // { kind, ... }
  let carried = null; // the .app element in the beak
  let food = null; // { el, x, y }
  let gait = 0; // gait: position in the stride cycle, 0..1, advanced by distance walked
  const legsOf = {};
  let lastCarry = 0, lastNote = 0;
  let view = "side"; // side, front (walking down the screen) or back (walking up)
  let pokes = []; // recent poke times; several in a row make the goose angry
  let angryUntil = 0, lastAngryHonk = 0;

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
    el.querySelector(".view-side").style.transform = `scaleX(${dir})`;
    el.dataset.view = view;
    if (carried) {
      const { left, top, width } = carried.base;
      const reach = view === "side" ? (dir > 0 ? 50 : 14) : 32;
      const beakX = x + reach - width / 2, beakY = y + (view === "back" ? -14 : 4);
      const tilt = view === "side" ? dir * 8 : 0;
      carried.el.style.transform = `translate(${beakX - left}px, ${beakY - top}px) rotate(${tilt}deg)`;
    }
  }

  function setPose(pose) {
    el.classList.toggle("pecking", pose === "peck");
  }

  // ---- sound ----
  let audio = null, honkTimer = 0;
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
    clearTimeout(honkTimer);
    honkTimer = setTimeout(() => el.classList.remove("honking"), 420);
  }

  // ---- fury sparks: red and gold sparks crackle above the goose ----
  const sparksEl = el.querySelector(".goose-sparks");
  let lastSpark = 0;
  function spark() {
    const sp = document.createElement("i");
    sp.style.left = rand(8, 56) + "px";
    sp.style.setProperty("--drift", rand(-10, 10) + "px");
    sp.style.setProperty("--size", rand(6, 11) + "px");
    sp.style.background = Math.random() < 0.5 ? "#ffd23f" : "#ff2a1f";
    sparksEl.append(sp);
    setTimeout(() => sp.remove(), 750);
  }

  // ---- tail ----
  function wag() {
    el.classList.remove("wagging");
    void el.offsetWidth; // restart the animation
    el.classList.add("wagging");
  }

  // ---- walking ----
  // The stride is driven by the distance covered, so the planted foot stays still on the ground
  // while the body passes over it (no sliding), and faster movement means quicker, longer steps.
  const WALK_STRIDE = 16, RUN_STRIDE = 26; // px covered per full cycle (one step of each foot)

  function legsFor(v) {
    if (!legsOf[v]) {
      const svg = el.querySelector(".view-" + v);
      legsOf[v] = [svg.querySelector(".gs-leg-a"), svg.querySelector(".gs-leg-b"), svg];
    }
    return legsOf[v];
  }

  const LEG_X = { side: [24, 32], front: [26, 38], back: [26, 38] }; // hips, in the drawing
  const feet = [{ planted: false }, { planted: false }];

  // Moves a foot by (dx, dy) and stretches its shank from the hip to the new ankle position.
  function setLeg(leg, dx, dy) {
    leg.parts ||= {
      lines: leg.querySelectorAll("line"),
      foot: leg.querySelector(".gs-foot"),
      hip: leg.dataset.hip.split(",").map(Number),
      ankle: leg.dataset.ankle.split(",").map(Number),
    };
    const { lines, foot, hip, ankle } = leg.parts;
    dy = Math.max(dy, hip[1] + 3 - ankle[1]); // the foot never climbs up into the body
    for (const l of lines) {
      l.setAttribute("x2", ankle[0] + dx);
      l.setAttribute("y2", ankle[1] + dy);
    }
    foot.style.transform = dx || dy ? `translate(${dx}px, ${dy}px)` : "";
  }

  function stride(mx, my, speed) {
    const [a, b, svg] = legsFor(view);
    if (!speed) {
      setLeg(a, 0, 0);
      setLeg(b, 0, 0);
      svg.style.translate = "";
      feet.forEach((f) => (f.planted = false));
      return;
    }
    const side = view === "side";
    const running = speed > WALK * 1.5;
    // seen from the front or back, steps look shorter (and keep the legs from over-stretching)
    const len = side ? (running ? RUN_STRIDE : WALK_STRIDE) : (running ? 13 : 10);
    const reach = len / 4;
    // side view steps with the horizontal motion, front/back with the vertical
    const along = side ? Math.abs(mx) : Math.abs(my);
    gait = (gait + Math.max(along, Math.hypot(mx, my) * 0.3) / len) % 1;
    // the body bobs once per step; the feet don't (they are on the ground)
    const bob = Math.abs(Math.sin(gait * Math.PI * 2)) * 1.3;
    svg.style.translate = `0 ${-bob}px`;
    [a, b].forEach((leg, i) => {
      const p = (gait + i * 0.5) % 1, foot = feet[i];
      const hipX = x + (dir > 0 || !side ? LEG_X[view][i] : SIZE - LEG_X[view][i]);
      let dx, dy, lift = 0;
      if (p < 0.5) {
        // planted: the foot stays where it was put down while the body moves over it
        if (!foot.planted) {
          foot.planted = true;
          foot.wx = hipX + (side ? reach * dir : 0);
          foot.wy = y;
          footprint(foot.wx, y);
        }
        dx = side ? Math.max(-reach * 1.6, Math.min(reach * 1.6, (foot.wx - hipX) * dir)) : 0;
        dy = Math.max(-7, Math.min(7, foot.wy - y)); // the leg stretches only so far
      } else {
        // swinging forward through the air
        foot.planted = false;
        const t = (p - 0.5) / 0.5;
        dx = side ? -reach + t * 2 * reach : 0;
        dy = 0;
        lift = Math.sin(Math.PI * t) * (side ? 3 : 2.6);
      }
      setLeg(leg, dx, dy - lift + bob);
    });
  }

  // ---- footprints ----
  function footprint(fx, fy) {
    const p = document.createElement("div");
    p.className = "goose-print";
    p.style.transform = `translate(${fx - 5}px, ${fy + 57}px) rotate(${view === "side" ? (dir > 0 ? 90 : -90) : view === "front" ? 180 : 0}deg)`;
    tracks.append(p);
    setTimeout(() => p.remove(), 2600);
  }

  // ---- things the goose does ----
  function nextTask() {
    dropCarried(); // whatever happened, an icon never stays in the beak between tasks
    if (angryUntil) return rampage();
    const now = performance.now();
    const editing = document.body.classList.contains("editing");
    const r = Math.random();
    if (!editing && now - lastCarry > 40000 && r < 0.14) return startCarry();
    if (now - lastNote > 60000 && r < 0.24) return startNote();
    if (r < 0.45) return (task = { kind: "peck", until: now + rand(1200, 2600) });
    if (r < 0.52) { if (Math.random() < 0.6) wag(); return (task = { kind: "stand", until: now + rand(800, 2000) }); }
    if (Math.random() < 0.2) wag(); // now and then on the way somewhere
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
    if (angryUntil) {
      const b = box();
      task = {
        kind: "walk", speed: RUN,
        tx: Math.min(Math.max(x + rand(-90, 90), b.left), b.right),
        ty: Math.min(Math.max(y + rand(-60, 60), b.top), b.bottom - SIZE),
        then: () => { dropCarried(); rampage(); },
      };
      return;
    }
    const spot = randomSpot();
    task = { kind: "walk", tx: spot.x, ty: spot.y, speed: WALK, then: dropCarried };
  }

  function dropCarried() {
    if (!carried) return;
    const a = carried.el;
    carried = null;
    if (fury) { // in a fury the icon stays where the goose dropped it
      a.style.transform = a.style.transform.replace(/rotate\([^)]*\)/, "");
      a.classList.remove("carried");
      a.classList.add("scattered");
      scattered.add(a);
      return;
    }
    a.style.transition = "transform .45s ease";
    a.style.transform = "";
    setTimeout(() => { a.classList.remove("carried"); a.style.transition = ""; }, 460);
  }

  // icons left lying around after a fury slide back to their places
  let scatteredTimer = 0;
  const scattered = new Set();
  function restoreScattered() {
    clearTimeout(scatteredTimer);
    for (const a of scattered) {
      a.style.transition = "transform .6s ease";
      a.style.transform = "";
      setTimeout(() => { a.classList.remove("scattered"); a.style.transition = ""; }, 620);
    }
    scattered.clear();
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
  const PECK_REACH = 67, PECK_DROP = 59;

  function feed() {
    if (!on) return;
    calmDown(); // food always wins
    food?.el.remove();
    let spot;
    for (let i = 0; i < 10; i++) { // throw it somewhere away from the goose
      spot = randomSpot();
      if (Math.hypot(spot.x - x, spot.y - y) > 140) break;
    }
    const fx = spot.x + SIZE / 2, fy = spot.y + PECK_DROP; // where the crumbs land
    const f = document.createElement("div");
    f.className = "goose-food";
    const count = 1 + Math.floor(Math.random() * 4); // 1 to 4 crumbs, scattered a little
    f.innerHTML = Array.from({ length: count }, () =>
      `<i style="left:${rand(0, 15).toFixed(1)}px;top:${rand(0, 7).toFixed(1)}px"></i>`).join("");
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

  // Eating: each crumb disappears when the beak actually reaches it on a peck.
  function eat() {
    const f = food;
    if (!f) return;
    dir = f.x > x + SIZE / 2 ? 1 : -1; // turn to the food
    task = { kind: "peck", eating: f, bite: true, until: performance.now() + 6000 };
  }

  function bite(t, now) {
    const f = t.eating;
    const crumbs = [...f.el.children].filter((c) => !c.classList.contains("eaten"));
    const beak = el.querySelector(".view-side .gs-beak-top").getBoundingClientRect();
    const tipX = dir > 0 ? beak.right : beak.left, tipY = beak.bottom;
    const near = (c) => { const r = c.getBoundingClientRect(); return { c, r, d: Math.abs(r.left + r.width / 2 - tipX) }; };
    const lowest = Math.min(...crumbs.map((c) => c.getBoundingClientRect().top));
    if (!t.bite && tipY < lowest - 6) t.bite = true; // the head came back up: ready for the next peck
    let bitten = 0;
    if (t.bite && crumbs.length) {
      const hit = crumbs.map(near).filter((n) => n.d < 14 && tipY >= n.r.top - 2).sort((a, b) => a.d - b.d)[0];
      if (hit) { hit.c.classList.add("eaten"); t.bite = false; bitten = 1; }
    }
    const left = crumbs.length - bitten;
    if (left <= 0 || now > t.until) {
      setTimeout(() => f.el.remove(), 260);
      if (food === f) food = null;
      task = { kind: "stand", until: now + 900 };
      wag(); // happy goose
    }
  }

  // ---- anger: three pokes within three seconds ----
  // Anger lasts 5 s. Every time it is made angry again within a minute of the previous time,
  // later angers last 10 s longer; that bonus counts angers of the last hour and is remembered
  // across launches. At the 1-minute cap it is a fury: grabbed icons stay scattered for a
  // minute after it calms down.
  const ANGER_KEY = "retro5-goose-anger";
  const ANGRY_MS = 5000, ANGRY_STEP = 10000, ANGRY_MAX = 60000, SCATTER_MS = 60000;
  const HOUR = 3600000, MINUTE = 60000;
  let fury = false;

  function angerDuration() {
    const now = Date.now();
    let events = [];
    try { events = JSON.parse(localStorage.getItem(ANGER_KEY)) || []; } catch {}
    events = events.filter((e) => now - e.t < HOUR);
    const prev = events[events.length - 1];
    events.push({ t: now, quick: !!prev && now - prev.t < MINUTE });
    try { localStorage.setItem(ANGER_KEY, JSON.stringify(events)); } catch {}
    const quick = events.filter((e) => e.quick).length;
    return Math.min(ANGRY_MS + quick * ANGRY_STEP, ANGRY_MAX);
  }

  function enrage() {
    const ms = angerDuration();
    fury = ms >= ANGRY_MAX;
    angryUntil = performance.now() + ms;
    lastAngryHonk = performance.now();
    el.classList.add("angry");
    el.classList.toggle("fury", fury);
    dropCarried();
    // first it turns to face you and honks, then it starts wrecking the screen
    view = "front";
    honk();
    task = { kind: "stand", face: "front", until: performance.now() + 800, then: rampage };
  }

  function rampage() {
    if (!angryUntil) return;
    const s = screenEl.getBoundingClientRect();
    const icons = [...document.querySelectorAll("#grid .app, #dock .app")]
      .filter((a) => a.dataset.id !== "goose" && !scattered.has(a));
    // the nearest icon gets grabbed
    let target = null, best = Infinity;
    for (const a of icons) {
      const r = a.getBoundingClientRect();
      const d = Math.hypot(r.left - s.left - x, r.top - s.top - y);
      if (d < best && d > 20) { best = d; target = a; }
    }
    if (!target) { // nothing left to grab: storm around instead
      const spot = randomSpot();
      task = { kind: "walk", tx: spot.x, ty: spot.y, speed: RUN, then: rampage };
      return;
    }
    const r = target.getBoundingClientRect();
    task = { kind: "fetch", target, angry: true, tx: r.left - s.left + r.width / 2 - (dir > 0 ? 50 : 14), ty: r.top - s.top - 4, speed: RUN * 1.15 };
  }

  function calmDown() {
    if (!angryUntil) return;
    angryUntil = 0;
    pokes = [];
    el.classList.remove("angry", "fury");
    dropCarried();
    if (fury) { fury = false; scatteredTimer = setTimeout(restoreScattered, SCATTER_MS); }
    task = null;
  }

  function poke(e) {
    e.stopPropagation();
    e.preventDefault();
    const now = performance.now();
    pokes = [...pokes.filter((t) => now - t < 3000), now];
    if (angryUntil) return honk();
    if (pokes.length >= 3) return enrage();
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
    if (fury && now - lastSpark > 70) { lastSpark = now; spark(); }
    if (angryUntil) {
      if (now > angryUntil) calmDown();
      else if (now - lastAngryHonk > 1100) { lastAngryHonk = now; honk(); }
    }
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
        const mx = (dx / dist) * step, my = (dy / dist) * step;
        x += mx;
        y += my;
        if (Math.abs(dx) > 1) dir = dx > 0 ? 1 : -1;
        // mostly vertical moves show the goose from the front or from behind
        const nextView = Math.abs(dy) > Math.abs(dx) * 1.4 ? (dy > 0 ? "front" : "back") : "side";
        if (nextView !== view) { stride(0, 0, 0); view = nextView; }
        el.classList.add("walking");
        el.classList.toggle("running", task.speed > WALK * 1.5);
        stride(mx, my, task.speed);
      }
    } else {
      el.classList.remove("walking", "running");
      stride(0, 0, 0);
      if (task.kind === "peck") view = "side"; // pecking is drawn from the side
      if (task.face) view = task.face;
      setPose(task.kind === "peck" ? "peck" : "stand");
      if (task.eating) bite(task, now);
      else if (now > task.until) { const done = task; task = null; done.then?.(); }
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
    calmDown();
    dropCarried();
    restoreScattered();
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
    // edit mode needs every icon in its slot
    releaseIcon: () => { fury = false; dropCarried(); restoreScattered(); },
  };
})();
