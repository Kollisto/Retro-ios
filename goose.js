// The goose: wanders over the home screen, blocks the icons it stands on, honks when poked
// (and gets angry and grabs icons when poked three times; see "anger" below), carries icons off for a moment,
// leaves notes and footprints, and runs to food thrown with the Home button (food calms it).
// It also sleeps (at night, or naps when left alone), gets jealous of the apps you open, and
// splashes in puddles. Toggled by the "Гусь" icon; the on/off choice is remembered.

const Goose = (() => {
  const KEY = "retro5-goose";
  const SIZE = 64;
  const WALK = 45, RUN = 150; // px per second
  const NOTES = T.gooseNotes;

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
  // Goose legs: a thin orange shank and a soft rounded triangle of a foot, drawn as one shape:
  // both outlines underneath, both fills on top, so there is no seam where the foot meets the leg.
  // The shank is a line from the hip (fixed to the body) to the ankle (moves with the foot),
  // so the leg always stays attached to the body however far the foot is from it.
  const SIDE_FOOT = "M-2.2 4.4 Q-3.4 1 -0.4 -0.3 Q4 -0.2 10.2 2 Q13.6 3.4 12.6 4.9 Q12 5.6 10.4 5.6 L0.2 5.6 Q-1.8 5.5 -2.2 4.4Z";
  const FRONT_FOOT = "M0 -0.6 Q-1.6 -0.6 -4.6 3 Q-7.8 6.6 -5.6 6.9 L5.6 6.9 Q7.8 6.6 4.6 3 Q1.6 -0.6 0 -0.6Z";
  const leg = (cls, x, hipY, ankleY, foot, k) => {
    const t = `translate(${x} ${ankleY}) scale(${k})`;
    const line = (c, w, extra) => `<line ${extra} x1="${x}" y1="${hipY}" x2="${x}" y2="${ankleY}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
    return `<g class="gs-leg ${cls}" data-hip="${x},${hipY}" data-ankle="${x},${ankleY}">
      ${line(INK, 5.4, 'class="gs-shank-o"')}
      <g class="gs-foot"><path d="${foot}" transform="${t}" fill="${INK}" stroke="${INK}" stroke-width="${(3 / k).toFixed(2)}" stroke-linejoin="round"/></g>
      ${line(ORANGE, 2.8, 'class="gs-shank"')}
      <g class="gs-foot"><path d="${foot}" transform="${t}" fill="${ORANGE}"/></g></g>`;
  };
  const sideLeg = (cls, x) => leg(cls, x, 48, 57.8, SIDE_FOOT, 0.85);
  const frontLeg = (cls, x) => leg(cls, x, 46, 55.4, FRONT_FOOT, 0.8);
  const legs = (make, xa, xb) => `<g>${make("gs-leg-a", xa)}${make("gs-leg-b", xb)}</g>`;
  // front and back: an egg-shaped body with the neck rising from its middle
  const EGG = "M32 22 Q46.5 24 47 38.5 Q47 51 32 51.5 Q17 51 17 38.5 Q17.5 24 32 22Z";
  const NECK_UP = "M26.5 33 Q25.5 19 26.5 13.5 Q27.5 5.5 32 5.5 Q36.5 5.5 37.5 13.5 Q38.5 19 37.5 33Z";
  // pink flush over the head and neck, shown in a fury
  const blushGrad = (id) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff6f93"/><stop offset=".38" stop-color="#ff9bb3"/><stop offset=".75" stop-color="#ffc4d2" stop-opacity="0"/></linearGradient></defs>`;
  const blush = (d, id) => `<path class="gs-blush" d="${d}" fill="url(#${id})"/>`;

  // ---- Halloween costume (24 October - 1 November): a long Dracula cape with a torn hem,
  // black outside and blood-red inside, a tall stand-up collar, a jewel clasp and little fangs ----
  const CAPE = "#2a2830", SHEEN = "#47454f", RED = "#a3121f", RED_D = "#6f0912";
  const cst = `stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"`;
  const fold = (d) => `<path d="${d}" fill="none" stroke="${SHEEN}" stroke-width="1" stroke-linecap="round"/>`;
  const mirrorX = (d) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, px, py) => `${+(64 - px).toFixed(2)} ${py}`);
  const rag = (pts) => pts.map(([px, py]) => `L${px} ${py}`).join(" "); // a torn, zigzag hem
  const costume = (inner) => `<g class="gs-costume">${inner}</g>`;
  const gem = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="2" fill="${RED}" stroke="${INK}" stroke-width="1"/>
      <circle cx="${cx - 0.6}" cy="${cy - 0.6}" r="0.6" fill="#ff8f8f"/>`;
  const WHITE_TUFT = (d) => `<path d="${d}" fill="${WHITE}" ${cst}/>`;

  // side, standing and walking: the cape hangs from the shoulders almost to the feet,
  // the tail feathers poke out from under it at the back
  const SIDE_COLLAR = costume(`<path d="M34.6 31 L29.8 15.6 Q33.8 17.6 37.6 20.6 L38 28Z" fill="${CAPE}" ${cst}/>
      <path d="M35.2 28.8 L31.6 18.4 Q34.6 20 36.9 22.2Z" fill="${RED}"/>`);
  const SIDE_CAPE = costume(`<g class="gs-cape-side">
      ${WHITE_TUFT("M7.4 48.6 Q1.6 50 -3.4 53.2 Q-0.2 53.8 -2 56.4 Q1.8 55.8 2.2 58.2 Q4.6 56.4 6.6 58.2 Q7.8 56 10.2 56.6 L12 50Z")}
      <path d="M37 26.6 Q24 27.4 14.6 32.4 Q7.6 35.6 5 41.6 Q3 47.6 2.4 54.6 ${rag([[5, 53], [6.8, 56], [9.6, 53.8], [12.2, 56.6], [15, 54.2], [17.8, 56.8], [20.8, 54.4], [23.4, 56.4], [26.2, 54], [28.6, 55.8], [31, 53.4]])} Q34.4 41.4 38.8 28.6Z" fill="${CAPE}" ${cst}/>
      <path d="M38.8 28.6 Q34.4 41.4 31 53.4 L28.6 55.8 L27.6 54.4 Q31 41 36.4 28.2Z" fill="${RED}" ${cst}/>
      ${fold("M21 30 Q17 42 17.8 55.6 M30 28.6 Q27 41 26.2 53 M11 35.6 Q8 45 6.8 55")}</g>
    <g class="gs-cape-run">
      <path d="M43 27.4 Q30 22.4 16 22 Q5 21.8 -4.4 23.6 ${rag([[-2, 26], [-5.6, 28.4], [-2.4, 30.4], [-5.2, 33.2], [-1.6, 35], [-3.8, 38.4]])} Q6 40.6 14 37.6 Q24 33.8 31 34.6 Q37 33.6 43 31Z" fill="${CAPE}" ${cst}/>
      <path d="M-3.8 38.4 Q6 40.6 14 37.6 Q24 33.8 31 34.6 L31.6 32.4 Q23.4 31.4 13.6 35.2 Q5 38.2 -1.8 36.2Z" fill="${RED}" ${cst}/>
      ${fold("M13 22.6 Q6 28.6 1.4 35.6 M26 23.4 Q19 28.6 15 35.4 M4 22.4 Q0 25.6 -2.6 29")}</g>`);
  const SIDE_CLASP = costume(`<path d="M35 26.4 Q40.5 28.4 45.6 28.6" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>${gem(44.8, 28.6)}`);
  const SIDE_FANG = costume(`<path d="M54.3 16.9 L55.1 20.4 L56.1 16.8Z" fill="#fff" stroke="${INK}" stroke-width="0.7"/>`);

  // front: a tall collar framing the head, the cape open down the front over the white chest
  const F_COLLAR = "M27 27.5 L15 9.6 Q22 12.6 26.9 18.4Z", F_COLLAR_IN = "M26.3 25.2 L18 12.4 Q22.8 14.8 26.4 19.4Z";
  const F_PANEL = `M27.2 25.6 Q17.6 26.6 14.6 33.6 Q11.4 43 10 55.6 ${rag([[12, 53.8], [13.8, 56.4], [16, 54.2], [18.2, 56.6], [20.4, 54.4], [22.6, 56.2]])} Q20.6 40 27.2 27Z`;
  const F_LINING = "M27.2 27 Q20.6 40 22.6 56.2 L24.8 54.6 Q23 40 27.8 29.2Z";
  const COLLAR_FRONT = costume(`<path d="${F_COLLAR}" fill="${CAPE}" ${cst}/><path d="${mirrorX(F_COLLAR)}" fill="${CAPE}" ${cst}/>
      <path d="${F_COLLAR_IN}" fill="${RED}"/><path d="${mirrorX(F_COLLAR_IN)}" fill="${RED}"/>`);
  const panel = (m) => `<path d="${m(F_PANEL)}" fill="${CAPE}" ${cst}/><path d="${m(F_LINING)}" fill="${RED}" ${cst}/>${fold(m("M17.8 31 Q14.6 42 15 54.4"))}`;
  // the scare: white wings flung up, the cape stretched under them like a bat's
  const MEMBRANE = "M25 29 L-9 6.4 Q-12.6 16 -12.4 26 Q-7.4 25.4 -5.4 31.4 Q-0.4 30.6 1.6 37 Q6.4 36.6 8.6 42.6 Q13.6 42.4 15.4 48 Q19.6 47.4 22 51 L24.6 40Z";
  const WING_UP = "M25.6 28.2 Q12 17 -9.4 5.6 Q-9.8 8 -7.4 8.8 Q-9 10.4 -5.6 10.8 Q-6.6 12.6 -2.6 12.8 Q-3 14.8 1 14.6 Q1.2 16.8 5.4 16.4 Q10 21 16 25 Q20 29 23.4 32.4Z";
  const FRONT_CAPE = costume(`<g class="gs-cape-panels"><g class="gs-cape-l">${panel((d) => d)}</g><g class="gs-cape-r">${panel(mirrorX)}</g></g>
      <path d="M26.8 27.4 Q32 29.6 37.2 27.4" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>${gem(32, 28.8)}
      <g class="gs-cape-spread">${[(d) => d, mirrorX].map((m) => `<path d="${m(MEMBRANE)}" fill="${RED}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="${m("M24.4 30.4 L-12.4 26 M24.4 31.4 L-5.4 31.4 M24.4 32.6 L1.6 37 M24.2 34 L8.6 42.6 M24 36 L15.4 48")}" stroke="${RED_D}" stroke-width="1" stroke-linecap="round"/>
        <path d="${m(WING_UP)}" fill="${WHITE}" ${cst}/>`).join("")}</g>`);
  // lurking: wrapped up to the beak, a wing holding the edge, a sly sideways look and a glint
  const WRAP = `M11.6 55.6 L12 36 Q13 25 20 20.6 Q26 17.8 32 17 Q37.4 16.4 41.6 16.8 Q50.4 26 52 55.6 ${rag([[49.8, 53.8], [47.6, 56.4], [45.2, 54.2], [42.8, 56.6], [40.4, 54.4], [38, 56.6], [35.6, 54.4], [33.2, 56.6], [30.8, 54.4], [28.4, 56.6], [26, 54.4], [23.6, 56.6], [21.2, 54.4], [18.8, 56.6], [16.4, 54.4], [14, 56.4]])}Z`;
  const FRONT_WRAP = costume(`<g class="gs-cape-wrap"><path d="${WRAP}" fill="${CAPE}" ${cst}/>
      <path d="M20 20.6 Q26 17.8 32 17 Q37.4 16.4 41.6 16.8 L40.8 19 Q36.8 18.8 32 19.6 Q26.4 20.4 21.4 22.8Z" fill="${RED}" ${cst}/>
      ${fold("M40 21 Q30 34 25 54.4 M44.4 22 Q42 38 42.8 55.6 M18 27 Q15 40 16.4 54.4")}
      <path d="M33.6 19.8 Q33.4 15.6 37.6 14 Q42 13 43.6 15.6 Q41.8 15.8 42.8 17.6 Q40.8 17.6 41.6 19.6 Q39.6 19.4 39.6 21.2 Q36.4 22.6 33.6 19.8Z" fill="${WHITE}" ${cst}/>
      <g class="gs-sly"><circle cx="30.1" cy="11.4" r="1.1" fill="${INK}"/><circle cx="35.7" cy="11.4" r="1.1" fill="${INK}"/>
        <path d="M28.2 10.5 L31.8 10.9 M33.8 10.9 L37.4 10.5" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/></g>
      <path class="gs-glint" d="M47 1.4 Q47.6 4.2 50.4 4.8 Q47.6 5.4 47 8.2 Q46.4 5.4 43.6 4.8 Q46.4 4.2 47 1.4Z" fill="#f4b733" stroke="${INK}" stroke-width="0.8" stroke-linejoin="round"/></g>`);
  const FRONT_FANGS = costume(`<path class="gs-fangs-front" d="M30.2 17.4 L31 20.9 L31.9 17.8Z M33.8 17.4 L33 20.9 L32.1 17.8Z" fill="#fff" stroke="${INK}" stroke-width="0.7"/>`);
  // back: the stand-up collar hides the neck; the cape is cut away over the tail feathers
  const BACK_CAPE = costume(`${WHITE_TUFT("M25 46 Q22.4 52 24.4 56.2 Q26.6 54.8 27.6 57.4 Q29.6 55.4 31 57.8 Q32.4 55.6 34.2 57.8 Q35.4 55.2 37.6 57 Q39.4 54.6 40.6 55.4 Q41.6 51 39 46Z")}
      <path d="M24.6 28.4 L19 13.4 Q32 17.6 45 13.4 L39.4 28.4Z" fill="${CAPE}" ${cst}/>
      <path d="M20.4 14.8 Q32 18.6 43.6 14.8" fill="none" stroke="${RED}" stroke-width="1.3" stroke-linecap="round"/>
      ${fold("M32 20 L32 27 M26 18.6 L27.6 27 M38 18.6 L36.4 27")}
      <g class="gs-cape-back"><path d="M26.8 25.4 Q16.4 26.4 13.4 34 Q10.6 44 9.6 55.8 ${rag([[11.8, 54], [13.8, 56.6], [16.2, 54.4], [18.6, 56.8], [21, 54.6], [23.4, 56.4], [25.8, 54.4]])} Q26.4 44.6 32 44.2 Q37.6 44.6 38.2 54.4 ${rag([[40.6, 56.4], [43, 54.6], [45.4, 56.8], [47.8, 54.4], [50.2, 56.6], [52.2, 54], [54.4, 55.8]])} Q53.4 44 50.6 34 Q47.6 26.4 37.2 25.4Z" fill="${CAPE}" ${cst}/>
      <path d="M26.4 50.4 Q27.6 46 32 45.6 Q36.4 46 37.6 50.4" fill="none" stroke="${RED}" stroke-width="1.2" stroke-linecap="round"/>
      ${fold("M27 28 Q21.6 40 21 54.6 M37 28 Q42.4 40 43 54.6 M17 33 Q14 44 13.8 55.6 M47 33 Q50 44 50.2 55.6")}</g>`);
  // asleep: lying down in a round heap, the big round head resting in front, eyes shut
  // (in the Halloween season wrapped up in the cape, the head peeking out as from a hood)
  const SLEEP_BODY = "M3.4 60 Q1.4 46 12.4 39.4 Q24 33 38 35 Q51.6 37.6 54.8 50 Q56.2 55.8 54.6 60Z";
  const SLEEP_TAIL = "M6.4 45.6 Q2 42.4 0.6 44.6 Q0.8 47.6 4.6 49.4Z";
  const SLEEP_HEAD = "M40 43.2 Q48.4 43.2 48.4 51 Q48.4 58.8 40 58.8 Q31.6 58.8 31.6 51 Q31.6 43.2 40 43.2Z";
  const SLEEP_BLANKET = costume(`<path d="M3 60.4 Q0.6 46 12 39 Q24 32.4 38 34.6 Q52 37.4 55.4 50 Q57 56 55 60.4 ${rag([[52.4, 59], [49.8, 60.8], [47.2, 59.2], [44.6, 60.8], [42, 59.2], [39.4, 60.8], [36.8, 59.2], [34.2, 60.8], [31.6, 59.2], [29, 60.8], [26.4, 59.2], [23.8, 60.8], [21.2, 59.2], [18.6, 60.8], [16, 59.2], [13.4, 60.8], [10.8, 59.2], [8.2, 60.8], [5.6, 59.4]])}Z" fill="${CAPE}" ${cst}/>
      ${fold("M14 40 Q12 50 13 59.4 M24 35.4 Q22 47 23 59.4 M50.6 43 Q54 50 52.6 59")}
      <path d="M40 40.8 Q51 40.8 51 51 Q51 60.6 40 60.6 Q29 60.6 29 51 Q29 40.8 40 40.8Z" fill="${RED}" ${cst}/>
      <path d="M30.4 45 L26.4 34.8 Q31.4 37 34.2 41Z" fill="${CAPE}" ${cst}/><path d="M30.8 42.6 L28.4 37 Q31.2 38.6 32.8 40.8Z" fill="${RED}"/>`);
  const SLEEPING = `<g class="gs-sleep">
      ${outline(SLEEP_BODY)}${outline(SLEEP_TAIL)}${fill(SLEEP_BODY)}${fill(SLEEP_TAIL)}
      <path d="M29.4 47.6 Q30.6 40.4 40 40 Q49.6 40.2 51 49 M12 47 Q17 41.4 25.4 40.6 M9.4 53.6 Q14 48 21.4 47.6" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
      ${SLEEP_BLANKET}${outline(SLEEP_HEAD)}${fill(SLEEP_HEAD)}
      <path d="M46 52.6 Q51.4 52.4 53.4 55 Q50.4 57.6 46 56.8Z" fill="${ORANGE}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M39.4 50.2 Q41.6 52.4 43.8 50.2" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/></g>`;
  el.innerHTML = `
    <div class="goose-shadow"></div>
    <div class="goose-sparks"></div>
    <div class="goose-zzz"></div>
    <svg class="gs-view view-side" viewBox="0 0 64 64">${blushGrad("gs-pink-s")}
      ${legs(sideLeg, 24, 32)}
      ${outline(BODY)}
      <g class="gs-tail">${outline(TAIL)}</g>
      <g class="gs-neck">${SIDE_COLLAR}${outline(NECK)}</g>
      ${fill(BODY)}
      <g class="gs-tail">${fill(TAIL)}</g>
      ${SIDE_CAPE}
      <g class="gs-neck">
        ${fill(NECK)}${blush(NECK, "gs-pink-s")}${SIDE_CLASP}
        <g class="gs-beak" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round" fill="${ORANGE}">
          <path class="gs-beak-bottom" d="M50.5 16.5 Q55 16.5 57 17.6 Q54.5 19.6 50 19.2Z"/>
          ${SIDE_FANG}
          <path class="gs-beak-top" d="M50 12.4 Q56 12 59 14.6 Q56.5 17.4 50.2 17.6Z"/>
        </g>
        <circle class="gs-eye" cx="46" cy="14.6" r="1.25" fill="${INK}"/>
        <path class="gs-eye-shut" d="M44.4 14.4 Q46 16.2 47.6 14.4" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/>
        <path class="gs-brow" d="M43.6 10.8 L48.6 12.9" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
      </g>
      ${SLEEPING}
    </svg>
    <svg class="gs-view view-front" viewBox="0 0 64 64">${blushGrad("gs-pink-f")}
      ${legs(frontLeg, 26, 38)}${COLLAR_FRONT}
      ${outline(EGG)}${outline(NECK_UP)}${fill(EGG)}${fill(NECK_UP)}${blush(NECK_UP, "gs-pink-f")}
      <path d="M19.5 36 Q20.5 44 26 48 M44.5 36 Q43.5 44 38 48" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>${FRONT_CAPE}
      <g class="gs-eyes-front"><circle cx="29.2" cy="11.2" r="1.15" fill="${INK}"/><circle cx="34.8" cy="11.2" r="1.15" fill="${INK}"/></g>
      <ellipse class="gs-mouth" cx="32" cy="17.6" rx="2.2" ry="2.6" fill="#7a1d0a" stroke="${INK}" stroke-width="1.2"/>
      ${FRONT_FANGS}
      <path class="gs-beak-front" d="M28.8 14 Q32 12.8 35.2 14 Q34.2 18.6 32 19.2 Q29.8 18.6 28.8 14Z" fill="${ORANGE}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
      ${FRONT_WRAP}
      <path class="gs-brow" d="M26.8 8.2 L30.6 9.6 M37.2 8.2 L33.4 9.6" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <svg class="gs-view view-back" viewBox="0 0 64 64">${blushGrad("gs-pink-b")}
      ${legs(frontLeg, 26, 38)}
      ${outline(EGG)}${outline(NECK_UP)}<g class="gs-tail gs-tail-back">${outline(BACK_TAIL)}</g>
      ${fill(EGG)}${fill(NECK_UP)}${blush(NECK_UP, "gs-pink-b")}<g class="gs-tail gs-tail-back">${fill(BACK_TAIL)}</g>
      <path d="M24.5 31 Q21.5 41 29.5 48 M39.5 31 Q42.5 41 34.5 48" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>${BACK_CAPE}
    </svg>`;

  let on = false, raf = 0, last = 0;
  let x = 60, y = 300, dir = 1; // dir 1 = facing right
  let task = null; // { kind, ... }
  let carried = null; // the .app element in the beak
  let food = null; // { el, x, y }
  const legsOf = {};
  let lastCarry = 0, lastNote = 0;
  let lastInteraction = performance.now(); // pokes, food, coming back from an app
  let view = "side"; // side, front (walking down the screen) or back (walking up)
  let pokes = []; // recent poke times; several in a row make the goose angry
  let angryUntil = 0, lastAngryHonk = 0;
  // an angry goose honks after one of three pauses, picked at random, so it isn't a steady drone
  const ANGRY_HONK_GAPS = [650, 1500, 2800];
  let angryHonkGap = ANGRY_HONK_GAPS[1];

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
  function honk(pitch = 1) {
    try {
      if (navigator.audioSession) navigator.audioSession.type = "ambient";
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      const t0 = audio.currentTime;
      // a low, nasal honk with a slight tremble, like a real goose
      for (const [start, base] of [[0, 260], [0.2, 240]]) {
        const f = base * pitch;
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
    sp.style.setProperty("--size", rand(11, 16) + "px");
    sp.style.background = Math.random() < 0.5 ? "#ffd23f" : "#ff2a1f";
    sparksEl.append(sp);
    setTimeout(() => sp.remove(), 1000);
  }

  // The pink flush is animated here (not with CSS transitions) so it fades smoothly
  // whichever view - side, front or back - is showing at the moment.
  let flushLevel = 0, blushEls = null;
  function flush(dt) {
    const calming = el.classList.contains("calming");
    const target = fury || el.classList.contains("flushed") ? 1 : 0;
    const rate = fury ? 1 / 1.2 : calming ? 1 / 5 : 1 / 0.4; // per second
    const next = flushLevel < target ? Math.min(target, flushLevel + rate * dt) : Math.max(target, flushLevel - rate * dt);
    if (next === flushLevel) {
      if (calming && !flushLevel) el.classList.remove("calming");
      return;
    }
    flushLevel = next;
    blushEls ||= el.querySelectorAll(".gs-blush");
    blushEls.forEach((b) => (b.style.opacity = flushLevel));
  }

  // ---- tail ----
  function wag() {
    el.classList.remove("wagging");
    void el.offsetWidth; // restart the animation
    el.classList.add("wagging");
  }

  // ---- walking ----
  // Each foot on the ground stays exactly where it was put down. When the body has moved on so far
  // that a foot is left too far behind (or ahead), that foot takes a step: it lifts, swings along
  // an arc and lands a little ahead, where the body is going. Only one foot is in the air at a time
  // (unless the goose is in a real hurry), and faster movement makes quicker, longer steps.
  function legsFor(v) {
    if (!legsOf[v]) {
      const svg = el.querySelector(".view-" + v);
      legsOf[v] = [svg.querySelector(".gs-leg-a"), svg.querySelector(".gs-leg-b"), svg];
    }
    return legsOf[v];
  }

  const feet = [{}, {}]; // world position of each ankle, and its step in progress
  let feetView = "";

  // Moves a foot by (dx, dy) in the drawing, tips it while it is in the air, and stretches
  // its shank from the hip to the new ankle position.
  function setLeg(leg, dx, dy, tilt = 0) {
    leg.parts ||= {
      lines: leg.querySelectorAll("line"),
      feet: leg.querySelectorAll(".gs-foot"),
      hip: leg.dataset.hip.split(",").map(Number),
      ankle: leg.dataset.ankle.split(",").map(Number),
    };
    const { lines, feet: footEls, hip, ankle } = leg.parts;
    dy = Math.max(dy, hip[1] + 0.3 - ankle[1]); // the foot never climbs up into the body
    for (const l of lines) {
      l.setAttribute("x2", ankle[0] + dx);
      l.setAttribute("y2", ankle[1] + dy);
    }
    const tf = dx || dy || tilt ? `translate(${dx}px, ${dy}px) rotate(${tilt}deg)` : "";
    for (const f of footEls) {
      f.style.transformOrigin = `${ankle[0]}px ${ankle[1]}px`;
      f.style.transform = tf;
    }
  }

  // where an ankle sits when the foot is right under its hip
  function homeOf(leg) {
    const [ax, ay] = leg.dataset.ankle.split(",").map(Number);
    const mirrored = view === "side" && dir < 0;
    return { x: x + (mirrored ? SIZE - ax : ax), y: y + ay };
  }

  function updateFeet(dt, vx, vy) {
    const [a, b, svg] = legsFor(view);
    const legsNow = [a, b];
    const speed = Math.hypot(vx, vy);
    if (feetView !== view) { // another drawing: put both feet down under it
      feetView = view;
      legsNow.forEach((l, i) => { const h = homeOf(l); Object.assign(feets(i), { wx: h.x, wy: h.y, swing: null }); });
    }
    const side = view === "side";
    const reach = side ? Math.min(13, 6.5 + speed * 0.045) : Math.min(8, 4 + speed * 0.028);
    const RISE = 7; // how far a planted foot may end up above its hip line before it must step
    const ux = speed ? vx / speed : 0, uy = speed ? vy / speed : 0;
    let bob = 0;
    // first move the feet (steps start, swing, land) ...
    legsNow.forEach((l, i) => {
      const f = feets(i), other = feets(1 - i), h = homeOf(l);
      if (f.swing) { // in the air: follow an arc to the landing spot
        const sw = f.swing;
        sw.t = Math.min(1, sw.t + dt / sw.dur);
        const e = sw.t < 0.5 ? 2 * sw.t * sw.t : 1 - (-2 * sw.t + 2) ** 2 / 2;
        f.wx = sw.fx + (sw.tx - sw.fx) * e;
        f.wy = sw.fy + (sw.ty - sw.fy) * e;
        f.lift = Math.sin(Math.PI * sw.t) * (side ? 3.4 : 2.8);
        if (sw.t >= 1) { f.swing = null; f.lift = 0; footprint(f.wx, f.wy, ux, uy); }
      } else {
        const off = Math.hypot(f.wx - h.x, f.wy - h.y);
        const settling = speed < 5 && off > 2.5;
        const due = off > reach || h.y - f.wy > RISE || settling;
        const urgent = off > reach * 2.2 || h.y - f.wy > RISE + 2; // only then may both feet be in the air
        if (due && (!other.swing || urgent) && (!settling || !other.swing)) {
          // land ahead of where the hip will be by then
          const dur = settling ? 0.16 : Math.max(0.07, Math.min(0.26, (reach * 1.5) / Math.max(speed, 25)));
          const lead = settling ? 0 : reach * 0.6;
          f.swing = { t: 0, dur, fx: f.wx, fy: f.wy, tx: h.x + vx * dur + ux * lead, ty: h.y + vy * dur + uy * lead };
        }
      }
      if (f.swing) bob = Math.max(bob, Math.sin(Math.PI * f.swing.t) * 1.3);
    });
    // ... then draw them: the offset from the hip, in the drawing's own (possibly mirrored)
    // coordinates, cancelling the body's bob so a planted foot stays exactly where it is
    const mirror = side && dir < 0 ? -1 : 1;
    legsNow.forEach((l, i) => {
      const f = feets(i), h = homeOf(l);
      const dx = (f.wx - h.x) * mirror, dy = f.wy - h.y - (f.lift || 0);
      setLeg(l, dx, dy + bob, side ? -(f.lift || 0) * 7 : 0);
    });
    svg.style.translate = bob ? `0 ${-bob}px` : "";
    shadowEl.style.scale = bob ? `${1 - bob * 0.04}` : "";
  }
  const feets = (i) => feet[i];
  const shadowEl = el.querySelector(".goose-shadow");

  // ---- speed: tempos, speeding up and slowing down ----
  const TEMPOS = [28, 45, 65]; // strolling, normal, brisk (running is RUN)
  const tempo = () => { const r = Math.random(); return r < 0.3 ? TEMPOS[0] : r < 0.75 ? TEMPOS[1] : TEMPOS[2]; };
  let curSpeed = 0, lastHeading = null;

  // ---- footprints ----
  function footprint(fx, fy, ux, uy) {
    const p = document.createElement("div");
    p.className = "goose-print" + (performance.now() < wetUntil ? " wet" : "");
    const angle = (ux || uy ? Math.atan2(uy, ux) * 180 / Math.PI : (dir > 0 ? 0 : 180)) + 90; // toes forward
    const toe = view === "side" ? dir * 3.5 : 0;
    p.style.transform = `translate(${fx + toe - 4.5}px, ${fy + 1}px) rotate(${angle}deg)`;
    tracks.append(p);
    setTimeout(() => p.remove(), 4200);
  }

  // ---- sleep ----
  // At night (23:00-7:00) the goose sleeps; in the daytime it naps after 3 quiet minutes.
  // Woken by a poke it is startled and touchy (two pokes are enough to anger it for 30 s).
  const NAP_AFTER = 3 * 60000, DROWSY_MS = 30000;
  const WOKE_KEY = "retro5-goose-woke";
  let sleeping = false, sleepKind = "", wakeAt = 0, noSleepUntil = 0, drowsyUntil = 0, lastZ = 0;
  const isNight = () => { const h = new Date().getHours(); return h >= 23 || h < 7; };
  const zzzEl = el.querySelector(".goose-zzz");

  function sleepy(now) {
    return !angryUntil && !food && !carried && !puddle && now > noSleepUntil &&
      (isNight() || now - lastInteraction > NAP_AFTER);
  }

  function fallAsleep(now) {
    sleeping = true;
    sleepKind = isNight() ? "night" : "nap";
    wakeAt = sleepKind === "nap" ? now + rand(60000, 120000) : 0;
    view = "side";
    el.classList.add("sleeping");
    task = { kind: "sleep" };
  }

  function wakeUp(how) {
    if (!sleeping) return;
    const now = performance.now();
    sleeping = false;
    el.classList.remove("sleeping");
    zzzEl.replaceChildren();
    noSleepUntil = now + (isNight() ? 60000 : 0);
    lastInteraction = now;
    if (how === "poke") { // startled awake, and touchy for a while
      drowsyUntil = now + DROWSY_MS;
      el.classList.add("startled");
      setTimeout(() => el.classList.remove("startled"), 450);
      honk(1.15);
      task = { kind: "stand", until: now + 700 };
    } else if (how === "food") {
      task = null;
    } else { // morning or the end of a nap: a good stretch
      stretch();
    }
  }

  function stretch() {
    el.classList.add("stretching");
    wag();
    setTimeout(() => { el.classList.remove("stretching"); honk(0.95); }, 1600);
    task = { kind: "stand", until: performance.now() + 2000 };
    try { localStorage.setItem(WOKE_KEY, new Date().toDateString()); } catch {}
  }

  function snooze(now) {
    if (halloween) {
      if (!zzzEl.querySelector(".goose-bat")) {
        const bat = document.createElement("i");
        bat.className = "goose-bat";
        bat.innerHTML = BAT;
        zzzEl.append(bat);
      }
    } else if (now - lastZ > 1400) {
      lastZ = now;
      const z = document.createElement("i");
      z.textContent = "z";
      z.style.left = (dir > 0 ? 38 : 12) + "px"; // over the head
      zzzEl.append(z);
      setTimeout(() => z.remove(), 2600);
    }
    if (sleepKind === "nap" && now > wakeAt) wakeUp("nap");
    if (sleepKind === "night" && !isNight()) wakeUp("morning");
  }

  // ---- jealousy ----
  // Coming back from an app, the goose runs to that app's icon and hisses at it, and sometimes
  // drags the rival off into a corner. The app opened most this week gets guarded now and then.
  const JEALOUS_KEY = "retro5-goose-jealous";
  const WEEK = 7 * 24 * 3600000;
  let pendingJealous = null, lastGuard = 0;

  function launches() {
    let data = {};
    try { data = JSON.parse(localStorage.getItem(JEALOUS_KEY)) || {}; } catch {}
    const now = Date.now();
    for (const id of Object.keys(data)) {
      data[id] = data[id].filter((t) => now - t < WEEK);
      if (!data[id].length) delete data[id];
    }
    return data;
  }

  function noticeLaunch(id) {
    if (!on || id === "goose" || id === "refresh") return;
    const data = launches();
    (data[id] ||= []).push(Date.now());
    try { localStorage.setItem(JEALOUS_KEY, JSON.stringify(data)); } catch {}
    pendingJealous = id;
  }

  function favourite() {
    const data = launches();
    const [id, times] = Object.entries(data).sort((a, b) => b[1].length - a[1].length)[0] || [];
    return times && times.length >= 5 ? id : null;
  }

  function onReturn() {
    const id = pendingJealous;
    pendingJealous = null;
    if (!on || !id) return;
    lastInteraction = performance.now();
    if (angryUntil || sleeping) return;
    setTimeout(() => confront(id, Math.random() < 0.35), 500);
  }

  // walks up beside an icon, facing it
  function approach(target, speed, then) {
    const s = screenEl.getBoundingClientRect(), r = target.getBoundingClientRect();
    const iconX = r.left - s.left, iconY = r.top - s.top;
    const fromLeft = x + SIZE / 2 < iconX + r.width / 2;
    const face = fromLeft ? 1 : -1;
    task = {
      kind: "walk", speed,
      tx: fromLeft ? iconX - 50 : iconX + r.width - 14, ty: iconY + r.height / 2 - 34,
      then: () => { dir = face; then(); },
    };
  }

  function confront(id, dragOff) {
    const target = document.querySelector(`.app[data-id="${id}"]`);
    if (!target || angryUntil || sleeping || scattered.has(target)) return;
    dropCarried();
    approach(target, RUN, () => {
      hiss();
      task = { kind: "stand", hissing: true, until: performance.now() + 1500,
        then: () => { if (dragOff) dragToCorner(target); } };
    });
  }

  function dragToCorner(target) {
    const s = screenEl.getBoundingClientRect(), r = target.getBoundingClientRect();
    carried = { el: target, base: { left: r.left - s.left, top: r.top - s.top, width: r.width } };
    target.classList.add("carried");
    target.style.transition = "none";
    const b = box();
    const corner = { x: x < (b.left + b.right) / 2 ? b.left : b.right, y: b.bottom - SIZE };
    task = { kind: "walk", tx: corner.x, ty: corner.y, speed: WALK * 1.4,
      then: () => { honk(); task = { kind: "stand", until: performance.now() + 2500, then: dropCarried }; } };
  }

  function guard(id) {
    const target = document.querySelector(`.app[data-id="${id}"]`);
    if (!target) return false;
    lastGuard = performance.now();
    approach(target, WALK * 1.3, () => {
      task = { kind: "stand", until: performance.now() + 3500, then: () => {
        hiss();
        task = { kind: "stand", hissing: true, until: performance.now() + 1200 };
      } };
    });
    return true;
  }

  function hiss() {
    el.classList.add("hissing");
    setTimeout(() => el.classList.remove("hissing"), 1300);
    try {
      if (navigator.audioSession) navigator.audioSession.type = "ambient";
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      const t = audio.currentTime, len = Math.floor(audio.sampleRate * 0.9);
      const buf = audio.createBuffer(1, len, audio.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = audio.createBufferSource();
      src.buffer = buf;
      const band = audio.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 3200;
      band.Q.value = 0.8;
      const gain = audio.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.35, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
      src.connect(band).connect(gain).connect(audio.destination);
      src.start(t);
    } catch {}
  }

  // ---- puddles ----
  // Now and then (more often when it is raining outside) a puddle appears; the goose hops in,
  // splashes about, leaves wet footprints for a while, and the puddle dries up.
  let puddle = null, lastPuddle = performance.now(), wetUntil = 0, lastDrop = 0;
  const raining = () => typeof WEATHER_NOW !== "undefined" && !!WEATHER_NOW && ["rain", "storm"].includes(WEATHER_NOW.kind);

  function makePuddle() {
    const spot = randomSpot();
    const p = document.createElement("div");
    p.className = "goose-puddle";
    const px = spot.x + 28, py = spot.y + 60; // where the goose's feet will be
    p.style.left = px - 30 + "px";
    p.style.top = py - 9 + "px";
    tracks.append(p);
    puddle = { el: p, x: px, y: py };
    lastPuddle = performance.now();
    setTimeout(() => dryUp(puddle && puddle.el === p ? puddle : null), 40000); // nobody came
    return puddle;
  }

  function dryUp(pd) {
    if (!pd) return;
    pd.el.classList.add("drying");
    setTimeout(() => pd.el.remove(), 5000);
    if (puddle === pd) puddle = null;
  }

  function goSplash() {
    const pd = puddle || makePuddle();
    task = { kind: "walk", tx: pd.x - 28, ty: pd.y - 60, speed: WALK * 1.4, then: () => splash(pd) };
  }

  function splash(pd) {
    view = "side";
    el.classList.add("splashing");
    honk(1.05);
    task = { kind: "stand", splash: true, until: performance.now() + 2600, then: () => {
      el.classList.remove("splashing");
      wetUntil = performance.now() + 9000;
      wag();
      dryUp(pd);
    } };
  }

  function droplet() {
    const d = document.createElement("i");
    d.className = "goose-drop";
    d.style.left = x + 28 + rand(-8, 8) + "px";
    d.style.top = y + 56 + "px";
    d.style.setProperty("--dx", rand(-34, 34) + "px");
    d.style.setProperty("--dy", -rand(10, 26) + "px");
    layer.append(d);
    setTimeout(() => d.remove(), 650);
  }


  // ---- Halloween (24 October - 1 November) ----
  // The goose wears its Dracula cape. The cape streams out behind it as it goes, and now and then
  // it wraps itself up to the eyes, lurks ... and flings the cape open with a scream. At night a
  // little bat flutters over the sleeping goose instead of the z's. ?halloween shows it any day.
  const isHalloween = () => {
    const d = new Date(), m = d.getMonth(), day = d.getDate();
    return (m === 9 && day >= 24) || (m === 10 && day === 1) || /[?&]halloween\b/.test(location.search);
  };
  let halloween = false, lastSeasonCheck = -Infinity, flap = 0, lastLurk = performance.now(), spooky = false;
  const LURK_GAP = 45000;

  function checkSeason(now) {
    if (now - lastSeasonCheck < 60000) return;
    lastSeasonCheck = now;
    halloween = isHalloween();
    el.classList.toggle("halloween", halloween);
  }

  // the cape streams out with speed and ripples a little
  function capeFlap(dt, now) {
    if (!halloween) return;
    const moving = el.classList.contains("walking");
    const target = moving ? Math.min(1, curSpeed / 110) : 0;
    flap += (target - flap) * Math.min(1, dt * 5);
    const ripple = flap > 0.02 ? Math.sin(now / 75) * 0.12 * flap : 0;
    el.style.setProperty("--flap", (flap + ripple).toFixed(3));
  }

  let lastDust = 0;
  function dust(now) {
    if (!halloween || view !== "side" || !el.classList.contains("running") || now - lastDust < 150) return;
    lastDust = now;
    const d = document.createElement("div");
    d.className = "goose-dust";
    d.innerHTML = "<i></i>".repeat(3);
    d.style.transform = `translate(${x + (dir > 0 ? 4 : 42)}px, ${y + 50}px)`;
    d.style.setProperty("--dx", -dir * 10 + "px");
    layer.prepend(d);
    setTimeout(() => d.remove(), 700);
  }

  function lurk() {
    lastLurk = performance.now();
    spooky = true;
    el.classList.add("lurking");
    task = { kind: "stand", face: "front", spooky: true, until: lastLurk + rand(2200, 3600), then: scare };
  }

  function scare() {
    const now = performance.now();
    spooky = true;
    el.classList.remove("lurking");
    el.classList.add("scaring");
    scream();
    // the icons nearby jump with fright
    const s = screenEl.getBoundingClientRect(), cx = s.left + x + SIZE / 2, cy = s.top + y + SIZE / 2;
    document.querySelectorAll(".app:not(.carried)").forEach((a) => {
      const r = a.getBoundingClientRect();
      if (Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy) > 150) return;
      a.classList.remove("spooked");
      void a.offsetWidth;
      a.classList.add("spooked");
      setTimeout(() => a.classList.remove("spooked"), 700);
    });
    task = { kind: "stand", face: "front", spooky: true, until: now + 1500, then: () => { unspook(); wag(); } };
  }

  function unspook() {
    spooky = false;
    el.classList.remove("lurking", "scaring");
  }

  // "AAAAA!": a long, wobbling, rising and falling goose scream
  function scream() {
    try {
      if (navigator.audioSession) navigator.audioSession.type = "ambient";
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      const t = audio.currentTime, dur = 0.95;
      const osc = audio.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(470, t + 0.18);
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.6);
      osc.frequency.exponentialRampToValueAtTime(260, t + dur);
      const tremble = audio.createOscillator(), depth = audio.createGain();
      tremble.frequency.value = 9;
      depth.gain.value = 22;
      tremble.connect(depth).connect(osc.frequency);
      const formant = audio.createBiquadFilter();
      formant.type = "bandpass";
      formant.frequency.value = 900;
      formant.Q.value = 2.5;
      const gain = audio.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.85, t + 0.04);
      gain.gain.setValueAtTime(0.85, t + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(formant).connect(gain).connect(audio.destination);
      osc.start(t);
      tremble.start(t);
      osc.stop(t + dur + 0.02);
      tremble.stop(t + dur + 0.02);
    } catch {}
    el.classList.add("honking"); // beak wide open, fangs out
    clearTimeout(honkTimer);
    honkTimer = setTimeout(() => el.classList.remove("honking"), 1000);
  }

  const BAT = `<svg viewBox="0 0 24 12" width="24" height="12">
      <g class="bat-wing"><path d="M12 6 Q8 1 1 2 Q3 4 2.5 6.5 Q5 5.6 6 8 Q8 6.4 9.5 8.5Z"/><path d="M12 6 Q16 1 23 2 Q21 4 21.5 6.5 Q19 5.6 18 8 Q16 6.4 14.5 8.5Z"/></g>
      <path d="M10.4 4.2 L10.6 2.4 L11.6 3.6 L12.4 3.6 L13.4 2.4 L13.6 4.2 Q14.4 6 13.6 8.2 Q12 10 10.4 8.2 Q9.6 6 10.4 4.2Z"/>
      <circle cx="11.3" cy="5" r=".55" fill="#ff3b30"/><circle cx="12.7" cy="5" r=".55" fill="#ff3b30"/></svg>`;

  // A flock of 3-5 bats appears somewhere on the screen. The goose runs over, then dashes about
  // with them flapping around it for a couple of seconds, and they vanish in a puff of smoke.
  const BATS_GAP = 60000, BAT_PLAY_MS = 2600;
  let bats = [], lastBats = performance.now() - BATS_GAP + 15000, batPlayUntil = 0;

  function batParty() {
    lastBats = performance.now();
    const s = randomSpot(), n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const b = document.createElement("i");
      b.className = "goose-flybat";
      b.innerHTML = BAT;
      layer.append(b);
      const hx = s.x + SIZE / 2 + rand(-34, 34), hy = s.y + rand(-6, 34);
      bats.push({ el: b, hx, hy, x: hx, y: hy, ph: rand(0, Math.PI * 2), r: rand(22, 38), follow: false });
    }
    honk(1.1);
    task = { kind: "walk", bats: true, tx: s.x, ty: s.y, speed: RUN, then: () => {
      bats.forEach((b) => (b.follow = true));
      batPlayUntil = performance.now() + BAT_PLAY_MS;
      wag();
      honk(1.05);
      batDash();
    } };
  }

  // short happy dashes back and forth, the bats circling along
  function batDash() {
    if (performance.now() > batPlayUntil) { poofBats(); task = { kind: "stand", until: performance.now() + 600 }; return; }
    const b = box();
    task = { kind: "walk", bats: true, speed: RUN,
      tx: Math.min(Math.max(x + rand(-110, 110), b.left), b.right),
      ty: Math.min(Math.max(y + rand(-70, 70), b.top), b.bottom - SIZE),
      then: batDash };
  }

  function moveBats(dt, now) {
    if (!bats.length) return;
    if (!task?.bats) return poofBats(); // food, a poke or anger: the bats are gone
    const k = Math.min(1, dt * 7);
    for (const b of bats) {
      let tx, ty;
      if (b.follow) { // circling the goose
        const a = now / 230 + b.ph;
        tx = x + SIZE / 2 + Math.cos(a) * b.r;
        ty = y + 10 + Math.sin(a) * b.r * 0.45 + Math.sin(now / 90 + b.ph) * 3;
      } else { // hovering where they appeared
        tx = b.hx + Math.sin(now / 420 + b.ph) * 9;
        ty = b.hy + Math.cos(now / 330 + b.ph) * 6;
      }
      b.x += (tx - b.x) * k;
      b.y += (ty - b.y) * k;
      b.el.style.transform = `translate(${b.x - 15}px, ${b.y - 8}px) scaleX(${tx < b.x ? -1 : 1})`;
    }
  }

  function poofBats() {
    for (const b of bats) {
      const p = document.createElement("div");
      p.className = "goose-puff";
      p.style.transform = `translate(${b.x - 20}px, ${b.y - 20}px)`;
      p.innerHTML = "<i></i>".repeat(6);
      layer.append(p);
      setTimeout(() => p.remove(), 800);
      b.el.remove();
    }
    if (bats.length) puff();
    bats = [];
  }

  // a soft "pffff": a short burst of filtered noise
  function puff() {
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      const t = audio.currentTime, dur = 0.45;
      const buf = audio.createBuffer(1, Math.floor(audio.sampleRate * dur), audio.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = audio.createBufferSource();
      src.buffer = buf;
      const lp = audio.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(2400, t);
      lp.frequency.exponentialRampToValueAtTime(500, t + dur);
      const gain = audio.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.35, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(lp).connect(gain).connect(audio.destination);
      src.start(t);
    } catch {}
  }

  // ---- things the goose does ----
  function nextTask() {
    dropCarried(); // whatever happened, an icon never stays in the beak between tasks
    if (angryUntil) return rampage();
    const now = performance.now();
    if (sleepy(now)) return fallAsleep(now);
    const editing = document.body.classList.contains("editing");
    const r = Math.random();
    const puddleGap = raining() ? 40000 : 120000;
    if (!editing && now - lastPuddle > puddleGap && r < (raining() ? 0.3 : 0.1)) return goSplash();
    const fav = favourite();
    if (!editing && fav && now - lastGuard > 60000 && r > 0.9 && guard(fav)) return;
    if (halloween && !editing && now - lastLurk > LURK_GAP && r > 0.8 && r < 0.9) return lurk();
    if (halloween && !editing && now - lastBats > BATS_GAP && r >= 0.6 && r < 0.75) return batParty();
    if (!editing && now - lastCarry > 40000 && r < 0.14) return startCarry();
    if (now - lastNote > 60000 && r < 0.24) return startNote();
    if (r < 0.45) return (task = { kind: "peck", until: now + rand(1200, 2600) });
    if (r < 0.52) { if (Math.random() < 0.6) wag(); return (task = { kind: "stand", until: now + rand(800, 2000) }); }
    if (Math.random() < 0.2) wag(); // now and then on the way somewhere
    const s = randomSpot();
    task = { kind: "walk", tx: s.x, ty: s.y, speed: tempo(), pauseHalfway: Math.random() < 0.2 };
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
  let scatteredTimer = 0, scatterDeadline = 0;
  function scheduleScatterReturn(ms) {
    clearTimeout(scatteredTimer);
    scatterDeadline = performance.now() + ms;
    scatteredTimer = setTimeout(restoreScattered, ms);
  }
  const scattered = new Set();
  function restoreScattered(ms = 600) {
    clearTimeout(scatteredTimer);
    scatterDeadline = 0;
    for (const a of scattered) {
      a.style.transition = `transform ${ms}ms ease-in-out`;
      a.style.transform = "";
      setTimeout(() => { a.classList.remove("scattered"); a.style.transition = ""; }, ms + 20);
    }
    scattered.clear();
    if (on) saveMood(); // nothing left lying around to remember
  }

  function startNote() {
    if (carried) return;
    lastNote = performance.now();
    if (layer.querySelectorAll(".goose-note").length >= 2) return nextTask();
    const n = document.createElement("div");
    n.className = "goose-note";
    // in the Halloween season spooky phrases come first; never outside it
    const pool = halloween && Math.random() < 0.75 ? T.halloweenNotes || NOTES : NOTES;
    n.textContent = pool[Math.floor(Math.random() * pool.length)];
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
    lastInteraction = performance.now();
    if (sleeping) wakeUp("food");
    // a goose sulking its way to the food it was given won't be bought off with more
    if (food && el.classList.contains("grumpy")) return honk(0.85);
    const grumpy = !!angryUntil;
    if (grumpy) soothe(); // food always wins, but an angry goose takes its time
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
    // walk up so the beak, not the tail, ends at the crumbs; a grumpy goose shuffles slowly
    const face = fx > x + SIZE / 2 ? 1 : -1;
    task = {
      kind: "walk", speed: grumpy ? WALK * 0.65 : RUN,
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
    if (scattered.size) restoreScattered(2600); // the icons creep back while it eats
    el.classList.replace("flushed", "calming"); // and the pink starts to fade
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
      el.classList.remove("grumpy", "fury", "flushed"); // "calming" goes once the pink is gone
      wag(); // happy goose
    }
  }

  // ---- anger: three pokes within three seconds ----
  // Anger lasts 5 s. Every time it is made angry again within a minute after the previous anger ended,
  // later angers last 10 s longer; that bonus counts angers of the last 15 minutes and is remembered
  // across launches. At the 1-minute cap it is a fury: grabbed icons stay scattered for a
  // minute after it calms down.
  const ANGER_KEY = "retro5-goose-anger";
  const ANGRY_MS = 5000, ANGRY_STEP = 10000, ANGRY_MAX = 60000, SCATTER_MS = 60000;
  const ANGER_WINDOW = 15 * 60000, MINUTE = 60000;
  const ANGRY_POKE_MS = 5000, POKE_BONUS_MAX = 15000; // pokes add at most +15 s to one anger
  let fury = false, angerStart = 0, angryPokes = 0, pokeBonus = 0;

  function angerDuration() {
    const now = Date.now();
    let events = [];
    try { events = JSON.parse(localStorage.getItem(ANGER_KEY)) || []; } catch {}
    events = events.filter((e) => now - e.t < ANGER_WINDOW);
    const prev = events[events.length - 1];
    events.push({ t: now, quick: !!prev && now - (prev.end || prev.t) < MINUTE });
    try { localStorage.setItem(ANGER_KEY, JSON.stringify(events)); } catch {}
    const quick = events.filter((e) => e.quick).length;
    return Math.min(ANGRY_MS + quick * ANGRY_STEP, ANGRY_MAX);
  }

  // remembers when the anger ended, for the "again within a minute" rule
  function markAngerEnd() {
    try {
      const events = JSON.parse(localStorage.getItem(ANGER_KEY)) || [];
      if (events.length) events[events.length - 1].end = Date.now();
      localStorage.setItem(ANGER_KEY, JSON.stringify(events));
    } catch {}
  }

  function enrage() {
    const ms = angerDuration();
    fury = ms >= ANGRY_MAX;
    angerStart = performance.now();
    angryPokes = 0;
    pokeBonus = 0;
    el.classList.remove("grumpy", "calming", "flushed");
    angryUntil = angerStart + ms;
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

  // Food calms an angry goose gradually: it frowns, its head slowly fades back to white,
  // and the anger timer stops (icons it scattered are put back once it eats).
  function soothe() {
    angryUntil = 0;
    pokes = [];
    angryPokes = 0;
    el.classList.remove("angry");
    el.classList.add("grumpy");
    dropCarried(); // in a fury this leaves the icon lying with the others
    if (fury) {
      clearTimeout(scatteredTimer);
      scatterDeadline = 0;
      el.classList.add("flushed"); // still pink until it starts eating
      fury = false;
    }
    markAngerEnd();
    saveMood();
    honk();
  }

  function calmDown() {
    if (!angryUntil) return;
    angryUntil = 0;
    pokes = [];
    angryPokes = 0;
    el.classList.remove("angry", "fury", "grumpy", "calming", "flushed");
    setTimeout(saveMood, 0);
    dropCarried();
    if (fury) { fury = false; scheduleScatterReturn(SCATTER_MS); }
    markAngerEnd();
    task = null;
  }

  function poke(e) {
    e.stopPropagation();
    e.preventDefault();
    const now = performance.now();
    lastInteraction = now;
    pokes = [...pokes.filter((t) => now - t < 3000), now];
    if (sleeping) return wakeUp("poke");
    if (el.classList.contains("lurking")) return scare(); // caught it lurking: it jumps out at you
    if (angryUntil) { // poking an angry goose: every 2 pokes add 5 s, up to a minute ahead
      if (++angryPokes % 2 === 0 && pokeBonus < POKE_BONUS_MAX) {
        pokeBonus += ANGRY_POKE_MS;
        angryUntil = Math.min(angryUntil + ANGRY_POKE_MS, now + ANGRY_MAX);
        if (!fury && angryUntil - angerStart >= ANGRY_MAX) { fury = true; el.classList.add("fury"); }
      }
      return honk();
    }
    if (pokes.length >= (now < drowsyUntil ? 2 : 3)) return enrage(); // a just-woken goose is touchy
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
    checkSeason(now);
    if (spooky && !task?.spooky) unspook(); // interrupted: food, anger, a poke
    if (fury && now - lastSpark > rand(650, 950)) { lastSpark = now; spark(); }
    if ((angryUntil || scattered.size) && now - lastMoodSave > 1000) saveMood();
    flush(dt);
    if (angryUntil) {
      if (now > angryUntil) calmDown();
      else if (now - lastAngryHonk > angryHonkGap) {
        lastAngryHonk = now;
        angryHonkGap = ANGRY_HONK_GAPS[Math.floor(Math.random() * ANGRY_HONK_GAPS.length)];
        honk(rand(0.9, 1.1)); // and a slightly different voice each time
      }
    }
    if (!task) nextTask();
    if (task.kind === "walk" || task.kind === "fetch") {
      const dx = task.tx - x, dy = task.ty - y, dist = Math.hypot(dx, dy);
      setPose("walk");
      task.total ??= dist;
      if (task.pauseHalfway && dist < task.total / 2) { // stops on the way to look around
        const rest = task;
        rest.pauseHalfway = false;
        task = { kind: "stand", until: now + rand(600, 1400), then: () => { task = rest; } };
      } else if (dist < 1.5) {
        const done = task;
        task = null;
        el.classList.remove("walking", "running");
        updateFeet(dt, 0, 0);
        if (done.kind === "fetch") grab(done.target);
        else done.then?.();
      } else {
        // speed up gently, slow down before arriving, and ease off on sharp turns
        const heading = Math.atan2(dy, dx);
        if (lastHeading !== null) {
          let turn = Math.abs(heading - lastHeading);
          if (turn > Math.PI) turn = 2 * Math.PI - turn;
          if (turn > 1) curSpeed *= 0.5;
        }
        lastHeading = heading;
        const hurry = task.speed > 100;
        const want = Math.min(task.speed, Math.sqrt(2 * (hurry ? 420 : 160) * dist) + 6);
        const accel = hurry ? 600 : 140;
        curSpeed += Math.max(-420 * dt, Math.min(accel * dt, want - curSpeed));
        const step = Math.min(dist, Math.max(curSpeed, 6) * dt);
        const mx = (dx / dist) * step, my = (dy / dist) * step;
        x += mx;
        y += my;
        if (Math.abs(dx) > 1) dir = dx > 0 ? 1 : -1;
        // mostly vertical moves show the goose from the front or from behind
        view = Math.abs(dy) > Math.abs(dx) * 1.4 ? (dy > 0 ? "front" : "back") : "side";
        el.classList.add("walking");
        el.classList.toggle("running", curSpeed > 95);
        updateFeet(dt, mx / dt, my / dt);
      }
    } else {
      el.classList.remove("walking", "running");
      curSpeed = 0;
      lastHeading = null;
      if (task.kind === "peck" || task.kind === "sleep" || task.hissing || task.splash) view = "side";
      if (task.face) view = task.face;
      updateFeet(dt, 0, 0); // feet settle under the body
      if (task.kind === "sleep") snooze(now);
      if (task.splash && now - lastDrop > 90) { lastDrop = now; droplet(); }
      setPose(task.kind === "peck" ? "peck" : "stand");
      if (task.eating) bite(task, now);
      else if (task.until && now > task.until) { const done = task; task = null; done.then?.(); }
    }
    capeFlap(dt, now);
    dust(now);
    moveBats(dt, now);
    place();
    raf = requestAnimationFrame(tick);
  }

  // ---- mood memory ----
  // The current anger (time left, fury, poke bonus, pink head) and the scattered icons are saved,
  // so closing Retro 5 doesn't make the goose forget. Time is frozen while the app is closed;
  // after 15 minutes away it is all forgotten, like the anger counter.
  const MOOD_KEY = "retro5-goose-mood";
  let lastMoodSave = 0;

  function saveMood() {
    const now = performance.now();
    lastMoodSave = now;
    const mood = {
      savedAt: Date.now(),
      angryLeft: angryUntil ? Math.max(0, angryUntil - now) : 0,
      angerElapsed: angryUntil ? now - angerStart : 0,
      fury, pokeBonus, angryPokes,
      flushed: el.classList.contains("flushed"),
      flushLevel,
      scattered: [...scattered].map((a) => ({ id: a.dataset.id, t: a.style.transform })),
      scatterLeft: scatterDeadline ? Math.max(0, scatterDeadline - now) : 0,
    };
    const empty = !mood.angryLeft && !mood.scattered.length;
    try { empty ? localStorage.removeItem(MOOD_KEY) : localStorage.setItem(MOOD_KEY, JSON.stringify(mood)); } catch {}
  }

  function restoreMood() {
    let mood = null;
    try { mood = JSON.parse(localStorage.getItem(MOOD_KEY)); } catch {}
    if (!mood || Date.now() - mood.savedAt > ANGER_WINDOW) return false;
    const now = performance.now();
    for (const { id, t } of mood.scattered || []) {
      const a = document.querySelector(`.app[data-id="${id}"]`);
      if (!a) continue;
      a.style.transform = t;
      a.classList.add("scattered");
      scattered.add(a);
    }
    flushLevel = mood.flushLevel || 0;
    el.querySelectorAll(".gs-blush").forEach((b) => (b.style.opacity = flushLevel));
    if (mood.angryLeft > 0) {
      // it remembers: turns to you, honks, and carries on where it left off
      angryUntil = now + mood.angryLeft;
      angerStart = now - mood.angerElapsed;
      fury = !!mood.fury;
      pokeBonus = mood.pokeBonus || 0;
      angryPokes = mood.angryPokes || 0;
      lastAngryHonk = now;
      el.classList.add("angry");
      el.classList.toggle("fury", fury);
      view = "front";
      task = { kind: "stand", face: "front", until: now + 800, then: rampage };
    } else if (scattered.size) {
      scheduleScatterReturn(mood.scatterLeft || SCATTER_MS);
    }
    return mood.angryLeft > 0;
  }

  function start() {
    if (on) return;
    on = true;
    try { localStorage.setItem(KEY, "on"); } catch {}
    const b = box();
    x = Math.random() < 0.5 ? -SIZE : b.right + SIZE; // waddles in from the side
    y = rand(b.top, b.bottom - SIZE);
    const s = randomSpot();
    lastInteraction = performance.now();
    let woke = null;
    try { woke = localStorage.getItem(WOKE_KEY); } catch {}
    const morning = new Date().getHours() >= 7 && new Date().getHours() < 11 && woke !== new Date().toDateString();
    task = { kind: "walk", tx: s.x, ty: s.y, speed: WALK, then: morning ? stretch : undefined };
    if (restoreMood()) { // still angry: no waddling in, it is right there
      x = s.x;
      y = s.y;
    }
    lastSeasonCheck = -Infinity;
    checkSeason(performance.now());
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
    try { localStorage.removeItem(MOOD_KEY); } catch {}
    food?.el.remove();
    food = null;
    task = null;
    sleeping = false;
    el.classList.remove("sleeping", "hissing", "splashing", "stretching");
    zzzEl.replaceChildren();
    if (puddle) { puddle.el.remove(); puddle = null; }
    el.remove();
    layer.querySelectorAll(".goose-note").forEach((n) => n.remove());
    bats.forEach((b) => b.el.remove());
    bats = [];
  }

  el.addEventListener("pointerdown", (e) => e.stopPropagation());
  el.addEventListener("click", poke);

  // While Retro 5 is in the background the goose's clock stands still.
  let hiddenAt = 0;
  function freeze() {
    if (!on || hiddenAt) return;
    saveMood();
    hiddenAt = performance.now();
    cancelAnimationFrame(raf);
    clearTimeout(scatteredTimer);
  }
  function thaw() {
    if (!on || !hiddenAt) return;
    const shift = performance.now() - hiddenAt;
    hiddenAt = 0;
    if (angryUntil) { angryUntil += shift; angerStart += shift; lastAngryHonk += shift; }
    if (scatterDeadline) scheduleScatterReturn(Math.max(0, scatterDeadline + shift - performance.now()));
    if (wakeAt) wakeAt += shift;
    last = performance.now();
    raf = requestAnimationFrame(tick);
    onReturn();
  }
  document.addEventListener("visibilitychange", () => (document.hidden ? freeze() : thaw()));
  addEventListener("pagehide", freeze);

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch {}
  if (saved === "on") setTimeout(start, 600);

  return {
    toggle: () => (on ? stop() : start()),
    // emergency exit: the goose leaves at once and forgets everything, icons go back in place
    emergencyExit: () => {
      if (!on) return;
      try { localStorage.removeItem(ANGER_KEY); } catch {}
      el.classList.add("leaving");
      setTimeout(() => { el.classList.remove("leaving"); stop(); }, 350);
    },
    feed,
    get active() { return on; },
    noticeLaunch,
    returned: onReturn,
    // while it is angry no icon opens, and icons it scattered stay shut until they're back
    blocks: (link) => (on && angryUntil > 0) || link.classList.contains("scattered") || link.classList.contains("carried"),
    // edit mode needs every icon in its slot
    releaseIcon: () => { fury = false; dropCarried(); restoreScattered(); },
  };
})();
