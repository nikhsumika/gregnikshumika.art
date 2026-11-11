/* front-sheet.js — the Index sheet of portfolio.nksh.
   Interactive works are scattered over a clean sheet as small windows of
   different sizes, in their own colours, and they stay where they are. Click
   one and it comes to the middle of the sheet, grows and plays; a
   dashed outline marks where it came from. Windows can be dragged to new
   places (press and hold on a touch screen); the browser remembers where
   they were left. A window's corner grip resizes it, and the sheet zooms out
   to 15% (the slider in the status bar, Ctrl or ⌘ + scroll, or a pinch) so
   there is room to spread works out. The + button adds works from the catalogue (everything in
   works.js), and a work dragged onto the trash can leaves the sheet. Click a
   window to open the work: it
   takes the whole sheet, the title bar takes its file name and the sheet tabs
   become its own sheets.
   Plugs into app.js the same way market-sheet.js does: window.FrontSheet. */
window.FrontSheet = (() => {
  "use strict";

  const PHRASE = "PRIVATEJOYISALWAYSPOSSIBLEEVENHERE";   // the column letters

  // `title` must match the entry in works.js: year, edition, notes and link come from there.
  // `aspect` is only a first guess; the poster's real proportions replace it once it loads.
  const DEFS = [
    {
      key: "attention", file: "aiatn.nksh", title: "Attention Is All They Need",
      aspect: 2.13,
      poster: "front/attention.jpg", video: "front/attention.mp4", hero: 12,
      sheet: "Art Mode", track: "Art Mode", showing: "Film of Art Mode, 30 seconds",
      note: "Twenty-nine souls after Malevich, who exist only while someone is looking at them.",
      fx: () => '=ATTENTION("everyone")',
    },
    {
      key: "mirum", file: "mirexmch.nksh", title: "Mirum Ex Machina",
      aspect: 1.99,
      poster: "front/mirum.jpg", video: "front/mirum.mp4", hero: 4,   // the opening, as on the SuperRare cover
      track: "Mirum Ex Machina", showing: "Film of the opening: Nox and Ianua",
      note: "A wonder brought out of a machine, refused by a world that has no measure for it.",
      acts: [["Nox", 0], ["Ianua", 32.8]],
      fx: (act, t) => `=MIRUM("${act}", ${t})`,
    },
    {
      key: "serpentine", file: "sff.nksh", title: "Serpentine Finance Future",
      aspect: 1.99,
      poster: "front/serpentine.jpg", video: "front/serpentine.mp4", hero: 3,
      t0: 67.2,   // the film starts this far into the piece; the formula bar shows the piece's own time
      track: "Enter Nikshumika – Finance Future (Academy)", showing: "Film of two sheets: Serpentine and Flame",
      note: "A spreadsheet dance. The performer is redrawn frame by frame across thousands of cells.",
      acts: [["Serpentine", 0], ["Flame", 16]],
      fx: (act, t) => `=SERPENTINE("${act}", ${t})`,
    },
    {
      key: "flowers", file: "Flower Shop.nksh", title: "Condolence Flower Shop",
      aspect: 2.0,
      poster: "front/flowers.jpg", video: "front/flowers.mp4", hero: 2,
      track: "Flower Shop", showing: "Film of six of its sheets",
      note: "In lieu of flowers, you are hereby granted a revocable license to execute the attached software.",
      acts: [["Accident", 0], ["Absurd Rose", 5], ["Bloom", 10], ["Monet", 15], ["Tulips", 20], ["Random", 25]],
      fx: (act) => ({
        Random: '=TAROT("…")',
        Accident: '=IF(ROSES*ACCIDENT > CONCRETE*INDIFFERENCE, "bloom", "gloom")',
        "Absurd Rose": "=ABSURD(ROSE, SKY, TABLE)",
        Bloom: "=BLOOM(NIGHT, RED, CORE)",
        Monet: "=MONET(POND, LILIES, LIGHT)",
        Tulips: "=TULIPS(ROW, STEM, CUP)",
      }[act] || "=BLOOM(NIGHT, RED, CORE)"),
    },
    {
      key: "house", file: "House Visit.nksh", title: "A House That Greg Built (Visiting Hours)",
      aspect: 1.28,
      poster: "front/house.jpg", video: "front/house.mp4", hero: 0,
      sheet: "House", track: "Visiting hours", showing: "Film of its Auto tour: the sheet, then two pictures inside",
      note: "A digital architectural seashell. It filters the chaos outside down into a continuous, comforting white noise.",
      fx: () => "=buildvsbuy()",
    },
    {
      key: "cosmology", file: "scos.nksh", title: "Spreadsheet Cosmology",
      aspect: 1.99,
      poster: "front/cosmology.jpg", video: "front/cosmology.mp4", hero: 24,
      track: "Gregory Nikshumika – Pixel Desert", showing: "Film excerpt: Phanes into Nyx",
      note: "In the beginning, there was a neat spreadsheet and an idea.",
      acts: [["Phanes", 0], ["Nyx", 4]],
      fx: (act, t) => (act === "Phanes" ? "=CRACK(EGG, NYX)" : `=SHEET("${act}")`),
    },
    {
      key: "cosmic", file: "co.nksh", title: "Cosmic Object",
      aspect: 1.21,
      poster: "front/cosmic.jpg", video: "front/cosmic.mp4", hero: 12,
      sheet: "Film", track: "Cosmic Object", showing: "Promo cut",
      note: "The moment you think you are judging me is also the moment I already hopelessly became someone else.",
      fx: () => '=SAY("Things were so clear to everyone around me that I looked fuzzy.")',
    },
    {
      key: "shinrin", file: "shinrin-yoku.nksh", title: "Shinrin Yoku 森林浴",
      aspect: 2.16,
      poster: "front/shinrin.jpg", video: "front/shinrin.mp4", hero: 16,
      sheet: "Film", track: "Shinrin Yoku", showing: "Promo film, 30 seconds",
      note: "Sometimes you are far away from nature, so I created this artificial forest for you.",
      fx: () => '=SHEET("Forest")',
    },
    {
      key: "poem", file: "mltfpoem.nksh", title: "A Multifamily Poem 2.0",
      aspect: 2.04,
      poster: "front/poem.jpg", video: "front/poem.mp4", hero: 24,
      sheet: "Film", track: "The sheet is the building", showing: "Film excerpt: the roof, then night",
      note: "The tenants think, and their thoughts surface in the lit windows one at a time through four seasons.",
      fx: () => "=EVICT()",
    },
    {
      key: "bluewave", file: "blue-wave-gradient.nksh", title: "The Blue Wave (Gradient)",
      aspect: 2.05,
      poster: "front/bluewave.jpg", video: "front/bluewave.mp4", hero: 24,
      sheet: "Blue Wave", track: "Blue Wave", showing: "Film, 30 seconds",
      note: "Do the blue wave y'all!",
      fx: () => "=BLUE(WAVE(3))",
    },
    {
      key: "mandalord", file: "Mandalord.nksh", title: "Mandalord",
      aspect: 2.07,
      poster: "front/mandalord.jpg", video: "front/mandalord.mp4", hero: 2,
      track: "Mandalord", showing: "Film of seven of its sheets",
      note: "Create a mandala that works for you right now. Stay on the noble eightfold path.",
      acts: [["Kalachakra", 0], ["Wheel of Life", 4.5], ["Lotus", 9], ["Sand Mandala", 13.5], ["Diamond Realm", 18], ["Dharma Wheel", 22.5], ["Mount Meru", 27]],
      fx: (act) => (act === "Kalachakra" ? "=KALACHAKRA(TIME, WHEEL, BREATH)" : `=SHEET("${act}")`),
    },
    {
      key: "window", file: "Window of a Lonely Person.nksh", title: "A Window of A Lonely Person v2",
      aspect: 2.07,
      poster: "front/window.jpg", video: "front/window.mp4", hero: 2,
      sheet: "Sky", track: "Window of a Lonely Person", showing: "Film of three moods",
      note: "A draft application of a window of a lonely person, after Viktor Pivovarov.",
      fx: () => '=WINDOW("Day", "Med")',
    },
  ];
  // Static works from objkt, best first by the catalogue's own ranking. Year, edition, notes and
  // link come from works.js by title; the pictures are front/static-1.jpg, static-2.jpg, …
  const STATIC = [
    "Observation",
    "Someone Still Loves You, Vera Molnar",
    "Rockefeller State Park Preserve",
    "Strange Hanami of 2025",
    "Vertumnus",
    "The Great Wave off the Coast of Manhattan",
    "Fireworks At Tappan Zee Bridge",
    "Float",
  ];
  STATIC.forEach((title, i) => DEFS.push({
    key: "s" + (i + 1), still: true, file: title, title, aspect: 1.3,
    poster: `front/static-${i + 1}.jpg`, sheet: "Picture",
    fx: () => `=IMAGE("${title}")`,
  }));

  // Order on the sheet (stills sit in between the interactive works), and how much room each
  // window takes in its row (larger = bigger window).
  const ORDER = [
    "attention", "s1", "mirum", "cosmic", "s2",
    "s3", "serpentine", "window", "s4", "house",
    "flowers", "bluewave", "s5", "cosmology", "s6",
    "poem", "s7", "mandalord", "s8", "shinrin",
  ];
  const SIZE = {
    attention: 1.5, cosmic: 0.8, mirum: 1.2, window: 0.85, bluewave: 0.9, serpentine: 1.35, poem: 0.8, house: 1.05,
    flowers: 1.2, mandalord: 0.9, cosmology: 1.05, shinrin: 0.85,
    s1: 0.9, s2: 0.75, s3: 0.8, s4: 0.7, s5: 0.85, s6: 0.75, s7: 0.8, s8: 0.7,
  };
  const SCATTER_SEED = 7;   // change this for a different scatter
  DEFS.sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
  const byKey = Object.fromEntries(DEFS.map((w) => [w.key, w]));

  // The catalogue is everything in works.js. A work with a film above keeps that film; any other
  // work joins the sheet as a still, under a key made from its link.
  function catalogue() {
    return (window.WORKS || []).map((x) => {
      const def = DEFS.find((d) => d.title === x.title);
      const key = def ? def.key : "u:" + x.url;
      if (!byKey[key]) {
        byKey[key] = {
          key, still: true, file: x.title, title: x.title, aspect: 1.3, poster: x.images[0], sheet: "Picture",
          meta: x, fx: () => `=IMAGE("${x.title}")`,
        };
      }
      return { key, w: byKey[key], x };
    });
  }
  let WORKS = DEFS.slice();   // the works on the sheet right now
  let BAR = 18, STAT = 34;                   // a window's own title bar and status strip (scaled with the site's text size)
  const SMALL_W = 330;                       // the picture in a resting window is no wider than this
  let ROW_H = 21;                            // the sheet's row height, read from the stylesheet
  const COLS = PHRASE.length;
  const LOOK_AWAY = 350;                     // ms off a window before it goes back
  const DWELL = 150;                         // ms on another window before it takes over

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (t) => { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0"); };
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const mqSmall = window.matchMedia("(max-width: 700px)");

  let root = null, api = null, els = {}, cells = {};
  let attn = null, entered = null, sound = false;
  let leaveT = 0, switchT = 0, pendingK = null, lastX = -1, lastY = -1, savedTitle = null, savedDocTitle = null, ro = null;
  let perRow = 4, range = "A1", openRect = null;
  // What the visitor has changed, kept in this browser: where windows were dragged to
  // ({ key: [x, y, z] } as fractions of the sheet) and, once works are added or removed, which are shown.
  const STORE = "nksh-index-v3";
  const ZOOM_MIN = 0.15, ZOOM_MAX = 1;
  let custom = {}, shown = null, zoom = 1, drag = null, dropLock = null, suppressClick = false, zTop = 1;
  let baseW = 1, sheetW = 1, sheetHt = 1, ROW_W = 36, COL_H = 21, savedZoomHTML = null, pinch = null;
  let catOpen = false, catQuery = "", catScroll = 0, fresh = null, trashArmed = false;
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || "{}") || {};
    custom = saved.places || {};
    shown = Array.isArray(saved.shown) ? saved.shown : null;
    zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, +saved.zoom || 1));
    localStorage.removeItem("nksh-index-layout"); localStorage.removeItem("nksh-index-v2");
  } catch (e) { custom = {}; shown = null; }
  const saveCustom = () => { try { localStorage.setItem(STORE, JSON.stringify({ places: custom, shown, zoom })); } catch (e) {} };
  function resolveShown() {
    if (!shown) { WORKS = DEFS.slice(); return; }
    catalogue();   // makes sure added works have their definitions
    WORKS = shown.map((k) => byKey[k]).filter(Boolean);
  }
  resolveShown();

  const isSmall = () => !!root && root.classList.contains("fs-sm");
  const meta = (w) => w.meta || (window.WORKS || []).find((x) => x.title === w.title) || {};

  /* ── Markup ───────────────────────────────────────────── */
  function html(small) {
    const wins = WORKS.map((w) => {
      const m = meta(w);
      const bar = w.still
        ? `<b>${esc(w.title)}</b><span class="fs-wtitle">— ${esc(m.year || "")}</span>`
        : `<span aria-hidden="true">✦</span><b>${esc(w.file)}</b><span class="fs-wtitle">— ${esc(w.title)}</span>`;
      // a label-style description ("Title: … Materials: …") reads best from its Materials line
      const materials = /^Materials:\s*(.+)$/m.exec(String(m.description || ""));
      const text = (materials ? materials[1] : String(m.description || "")).replace(/\s+/g, " ").trim();
      const note = w.note || (text.length > 150 ? text.slice(0, 149).replace(/\s+\S*$/, "") + "…" : text);
      return `
      <div class="fs-win${w.video ? " has-video" : ""}" data-k="${w.key}" tabindex="0" role="button" aria-label="${esc(w.title)}. Press Enter to open.">
        <div class="fs-wbar">${bar}</div>
        <div class="fs-wpic">
          <img class="fs-img" src="${w.poster}" alt="" decoding="async">
          <div class="fs-prog" aria-hidden="true"><i></i></div>
        </div>
        <i class="fs-grip" aria-hidden="true" title="Drag to resize"></i>
        <div class="fs-wstat"><span>${esc(note)}</span><em>${small ? "Tap" : "Click"} to open${w.still ? "" : " " + esc(w.file)}</em></div>
      </div>`;
    }).join("");
    return `<div class="fs${small ? " fs-sm" : ""}">
      <div class="fs-colh"><div class="col-headers fs-colh-in"><div class="corner"></div><div class="fs-cols"></div></div></div>
      <div class="fs-body">
        <div class="fs-main">
          <div class="fs-scroll"><div class="fs-zoom"><div class="fs-sheet">
            <div class="fs-rows"></div>
            <div class="fs-grid"><div class="fs-ghost" hidden aria-hidden="true"></div>${wins}</div>
          </div></div></div>
          <p class="fs-empty" hidden>A blank sheet is a cage waiting for birds.</p>
          <div class="fs-cat" hidden role="dialog" aria-label="Catalogue"></div>
          <div class="fs-tools">
            <button type="button" class="fs-tool" id="fsTrash" title="Click, then click a work to remove it. Or drag a work here" aria-label="Trash: click, then click a work to remove it" aria-pressed="false">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 1.5h4l.6 1.5H14v1.4H2V3h3.4zM3.2 5.6h9.6l-.7 8.9H3.9zm2.6 1.6.3 5.6h1.1l-.2-5.6zm3 0-.2 5.6h1.1l.3-5.6z"/></svg>
            </button>
            <button type="button" class="fs-tool" id="fsAdd" title="Add a work from the catalogue" aria-label="Add a work from the catalogue" aria-expanded="false">+</button>
          </div>
        </div>
        <aside class="fs-info" hidden aria-label="Artwork"></aside>
      </div>
    </div>`;
  }

  /* ── Layout: a loose scatter; the open window comes to the middle ─ */
  const colName = (i) => { let s = ""; i += 1; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };

  // The same three numbers for a work every time, so the scatter does not reshuffle on reload.
  function scatter(key) {
    let a = SCATTER_SEED * 2654435761 >>> 0;
    for (let i = 0; i < key.length; i++) a = Math.imul(a ^ key.charCodeAt(i), 2246822519) >>> 0;
    const next = () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    return [next(), next(), next()];
  }

  // The scatter: the works in rows, each window somewhere inside its own patch, in different sizes.
  // Sets every window's home and returns the height the rows take. A short list fills one screen;
  // a long one gets comfortable rows and the sheet scrolls.
  function scatterHomes(W, viewH, small) {
    const sizeOf = (w) => SIZE[w.key] || 0.85, pad = small ? 7 : 12;
    const lines = [];
    for (let i = 0; i < WORKS.length; i += perRow) lines.push(WORKS.slice(i, i + perRow));
    const lineSize = lines.map((ln) => Math.max(...ln.map(sizeOf)));
    const sizeSum = lineSize.reduce((x, y) => x + y, 0);
    if (!sizeSum) return 0;
    const fit = viewH / sizeSum, unit = fit >= 100 ? fit : Math.max(fit, small ? 115 : 150);
    let y = 0;
    lines.forEach((ln, li) => {
      const h = unit * lineSize[li], total = ln.reduce((t, w) => t + sizeOf(w), 0);
      // a short last row keeps the width of a full one, so its windows do not balloon
      const span = Math.max(total, perRow * 0.85);
      let x = 0;
      ln.forEach((w) => {
        const c = cells[w.key], a = c.aspect, cw = W * sizeOf(w) / span;
        const [rs, rx, ry] = scatter(w.key);
        const pw = Math.min(cw - 2 * pad, SMALL_W, (h - 2 * pad - BAR) * a) * (0.84 + 0.16 * rs);
        const ww = Math.round(pw) + 2, wh = Math.round(pw / a) + BAR + 2;
        c.home = { left: Math.round(x + pad + (cw - 2 * pad - ww) * rx), top: Math.round(y + pad + (h - 2 * pad - wh) * ry), ww, wh };
        x += cw;
      });
      y += h;
    });
    return Math.round(unit * sizeSum);
  }

  /* Everything on the sheet is placed in sheet units: pixels at 100% zoom. The headers and the sheet
     are then scaled by the zoom, so a zoomed-out sheet simply shows more columns and rows.
     W and viewH are the sheet's visible size at 100%; places are stored as fractions of W. */
  function layout(animate = true) {
    if (!root) return;
    const small = isSmall(), z = zoom, inv = 1 / z;
    const boxW = els.scroll.clientWidth, viewH = els.scroll.clientHeight;
    const W = baseW = Math.max(120, boxW - ROW_W);
    const visW = (boxW - ROW_W * z) / z, visH = viewH / z;                 // what is on screen now, in sheet units
    const left0 = els.scroll.scrollLeft / z, top0 = els.scroll.scrollTop / z;
    perRow = small ? 2 : W < 860 ? 4 : 5;
    const sizeOf = (w) => SIZE[w.key] || 0.85;
    const pad = small ? 7 : 12;
    const frozen = !!shown;   // works were added or removed: every window now keeps its own place and size
    // a place the visitor chose, [x, y, z, width] with x, y and width as fractions of W
    const placed = (c, cu) => {
      const ww = cu[3] ? Math.round(cu[3] * W) : c.home.ww, wh = Math.round((ww - 2) / c.aspect) + BAR + 2;
      c.home = { left: Math.max(0, Math.round(cu[0] * W)), top: Math.max(0, Math.round(cu[1] * W)), ww, wh };
    };
    let flowH = 0;

    if (!frozen) {
      flowH = scatterHomes(W, viewH, small);
      WORKS.forEach((w) => { if (custom[w.key]) placed(cells[w.key], custom[w.key]); });   // dragged or resized by the visitor
    } else {
      const waiting = [];
      WORKS.forEach((w) => { const c = cells[w.key]; if (custom[w.key]) { c.home = c.home || { ww: 0 }; placed(c, custom[w.key]); } else waiting.push(w); });
      // A work just added, sized like the scatter's own windows. It goes to the free spot nearest the
      // middle of what is on screen; if the screen is full, to the first free slot on the sheet in
      // reading order, which fills gaps and then new rows across the sheet's width.
      waiting.forEach((w) => {
        const c = cells[w.key], a = c.aspect, [rs] = scatter(w.key);
        if (!c.ready) {   // its picture is still loading: keep it out of the way until its shape is known
          c.home = { left: -10, top: 0, ww: 0, wh: 0 };
          c.el.style.visibility = "hidden";
          return;
        }
        c.el.style.visibility = "";
        const pw = Math.min(W / perRow * sizeOf(w) / 0.95 - 2 * pad, SMALL_W, ((small ? 120 : 165) - 2 * pad - BAR) * a) * (0.84 + 0.16 * rs);
        const ww = Math.round(pw) + 2, wh = Math.round(pw / a) + BAR + 2;
        const others = WORKS.filter((v) => v !== w && cells[v.key].home && cells[v.key].home.ww).map((v) => cells[v.key].home);
        const tools = { left: left0 + visW - 118 * inv, top: top0 + visH - 66 * inv, ww: 118 * inv, wh: 66 * inv };   // the + and trash buttons
        const gap = 10;
        const clash = (x, y, list) => list.some((o) => x < o.left + o.ww + gap && o.left < x + ww + gap && y < o.top + o.wh + gap && o.top < y + wh + gap);
        let best = null, bestD = Infinity;
        const stepU = 14 * inv, onScreen = others.concat(tools);
        for (let y = top0 + gap; y <= top0 + visH - wh - gap; y += stepU) {
          for (let x = left0 + gap; x <= left0 + visW - ww - gap; x += stepU) {
            if (clash(x, y, onScreen)) continue;
            const d = (x + ww / 2 - left0 - visW / 2) ** 2 + (y + wh / 2 - top0 - visH / 2) ** 2;
            if (d < bestD) { bestD = d; best = { left: Math.round(x), top: Math.round(y) }; }
          }
        }
        if (!best) {
          const floor = Math.max(0, ...others.map((o) => o.top + o.wh)) + gap;   // one free band below everything
          search: for (let y = pad; y <= floor; y += 14) {
            for (let x = pad; x <= W - ww - pad; x += 14) {
              if (!clash(x, y, others)) { best = { left: x, top: y }; break search; }
            }
          }
        }
        if (!best) best = { left: pad, top: Math.max(0, ...others.map((o) => o.top + o.wh)) + pad };
        c.home = { left: best.left, top: best.top, ww, wh };
        custom[w.key] = [+(best.left / W).toFixed(4), +(best.top / W).toFixed(4), 1, +(ww / W).toFixed(4)];
        saveCustom();
      });
    }
    WORKS.forEach((w) => { const c = cells[w.key]; c.z = custom[w.key] ? custom[w.key][2] || 1 : 1; c.el.style.setProperty("--z", c.z); });

    // The sheet is at least what is on screen. Only windows the visitor placed can make it larger;
    // the scatter always fits its own rows. (The scrollbars' tracks are always present, so none of
    // this can change the size of the box being measured.)
    const mine = WORKS.filter((w) => frozen || custom[w.key]).map((w) => cells[w.key].home);
    sheetW = Math.max(visW, ...mine.map((h) => h.left + h.ww + pad));
    sheetHt = Math.max(visH, flowH, ...mine.map((h) => h.top + h.wh + pad));
    const cw = W / COLS;
    root.classList.toggle("fs-still", !animate);
    root.style.setProperty("--inv", inv);
    els.empty.hidden = WORKS.length > 0 || !!entered;
    els.zoomBox.style.width = Math.floor((ROW_W + sheetW) * z) + "px";
    els.zoomBox.style.height = Math.floor(sheetHt * z) + "px";
    els.sheet.style.width = ROW_W + sheetW + "px";
    els.sheet.style.height = sheetHt + "px";
    els.sheet.style.transform = `scale(${z})`;
    els.grid.style.width = sheetW + "px";
    els.grid.style.backgroundSize = `${cw}px ${ROW_H}px`;
    els.colh.style.height = Math.round(COL_H * z) + "px";
    els.colIn.style.width = ROW_W + sheetW + "px";
    els.colIn.style.transform = `scale(${z})`;
    const rowCount = Math.ceil(sheetHt / ROW_H), colCount = Math.ceil(sheetW / cw);
    if (els.rows.childElementCount !== rowCount) {
      els.rows.innerHTML = Array.from({ length: rowCount }, (_, i) => `<span>${i + 1}</span>`).join("");
    }
    if (els.cols.childElementCount !== colCount) {
      els.cols.innerHTML = Array.from({ length: colCount }, (_, i) => `<span>${PHRASE[i % COLS]}</span>`).join("");
    }
    els.cols.style.setProperty("--cw", cw + "px");
    syncScroll();

    let open = null;
    const sW = boxW - ROW_W * z;                                            // the visible sheet in screen pixels
    WORKS.forEach((w) => {
      const c = cells[w.key], a = c.aspect;
      const isIn = entered === w.key, isOn = isIn || (!entered && attn === w.key);
      let r = c.home;
      // An enlarged or opened window keeps its usual size on screen whatever the zoom.
      if (isIn) {          // opened: the whole visible sheet
        const pw = Math.min(sW - 28, (viewH - 28) * a) * inv;
        const ww = pw + 2 * inv, wh = pw / a + 2 * inv;
        r = { left: left0 + (visW - ww) / 2, top: top0 + (visH - wh) / 2, ww, wh };
      } else if (isOn) {   // enlarged: the middle of the visible sheet
        const pw = Math.max(c.home.ww - 2, Math.min(small ? sW - 16 : sW * 0.72, 860, (viewH * 0.84 - BAR - STAT) * a) * inv);
        const ww = pw + 2 * inv, wh = pw / a + (BAR + STAT + 2) * inv;
        r = { left: left0 + (visW - ww) / 2, top: top0 + (visH - wh) / 2, ww, wh };
      }
      if (isOn) open = r;
      const s = c.el.style;
      s.left = Math.round(r.left) + "px"; s.top = Math.round(r.top) + "px";
      s.width = Math.round(r.ww) + "px"; s.height = Math.round(r.wh) + "px";
    });
    openRect = open;

    document.body.classList.toggle("fs-moved", Object.keys(custom).length > 0 || !!shown || zoom !== 1);

    // a dashed outline keeps the place the open window came from
    const g = els.ghost, home = attn && !entered ? cells[attn].home : null;
    g.hidden = !home;
    if (home) { g.style.left = home.left + "px"; g.style.top = home.top + "px"; g.style.width = home.ww + "px"; g.style.height = home.wh + "px"; }

    // the open window is the selected range: light its letters and numbers
    let c0 = -1, c1 = -1, r0 = -1, r1 = -1;
    if (open) {
      c0 = Math.max(0, Math.floor(open.left / cw)); c1 = Math.min(colCount - 1, Math.floor((open.left + open.ww - 1) / cw));
      r0 = Math.max(0, Math.floor(open.top / ROW_H)); r1 = Math.floor((open.top + open.wh - 1) / ROW_H);
    }
    range = open ? `${colName(c0)}${r0 + 1}:${colName(c1)}${r1 + 1}` : "A1";
    [...els.cols.children].forEach((el, i) => el.classList.toggle("on", i >= c0 && i <= c1));
    [...els.rows.children].forEach((el, i) => el.classList.toggle("on", i >= r0 && i <= r1));
    if (els.zoomVal) { els.zoomVal.textContent = Math.round(z * 100) + "%"; els.zoomRange.value = Math.round(z * 100); }
    if (!animate) { void els.grid.offsetWidth; root.classList.remove("fs-still"); }
  }

  // The column letters follow a sideways scroll, and the row numbers stay at the left edge.
  function syncScroll() {
    const x = els.scroll.scrollLeft / zoom;
    els.cols.style.transform = `translateX(${-x}px)`;
    els.rows.style.transform = `translateX(${x}px)`;
  }

  /* ── Zoom ─────────────────────────────────────────────── */
  // (ax, ay) is the point on screen that should stay still: the cursor, or the middle of the sheet.
  function setZoom(next, ax, ay) {
    if (!root) return;
    next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next));
    if (Math.abs(next - zoom) < 0.001) return;
    const box = els.scroll.getBoundingClientRect();
    const px = ax == null ? box.width / 2 : ax - box.left, py = ay == null ? box.height / 2 : ay - box.top;
    const ux = (els.scroll.scrollLeft + px - ROW_W * zoom) / zoom, uy = (els.scroll.scrollTop + py) / zoom;
    zoom = next;
    saveCustom();
    layout(false);
    els.scroll.scrollLeft = Math.max(0, ux * zoom + ROW_W * zoom - px);
    els.scroll.scrollTop = Math.max(0, uy * zoom - py);
    layout(false);   // the enlarged window and the headers follow the new scroll position
  }

  function onWheel(e) {
    if (!(e.ctrlKey || e.metaKey) || entered) return;   // a trackpad pinch arrives as Ctrl + wheel
    e.preventDefault();
    setZoom(zoom * Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY);
  }

  const spread = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  function onTouch(e) {
    if (entered) return;
    if (e.touches.length === 2) {
      if (drag) { clearTimeout(drag.timer); drag = null; }
      if (!pinch) pinch = { d: spread(e.touches), z: zoom };
      else setZoom(pinch.z * spread(e.touches) / pinch.d, (e.touches[0].clientX + e.touches[1].clientX) / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2);
      if (e.cancelable) e.preventDefault();
    } else pinch = null;
  }

  // Which work is under a point on the sheet: the open window first, then the places windows rest
  // (the one on top where they overlap).
  function point(e) { const b = els.grid.getBoundingClientRect(); return { x: (e.clientX - b.left) / zoom, y: (e.clientY - b.top) / zoom }; }
  const inside = (r, p) => !!r && p.x >= r.left && p.x <= r.left + r.ww && p.y >= r.top && p.y <= r.top + r.wh;
  function atHome(p) {
    const under = WORKS.filter((v) => inside(cells[v.key].home, p)).sort((a, b) => cells[b.key].z - cells[a.key].z);
    return under.length ? under[0].key : null;
  }
  function hit(e) {
    const p = point(e);
    if (attn && inside(openRect, p)) return attn;
    return atHome(p);
  }

  /* ── Media ────────────────────────────────────────────── */
  // Jumping to a sheet needs a server that answers byte-range requests. `python3 -m http.server`
  // does not, so there the film is loaded whole and played from memory instead.
  let rangeCheck = null;
  function videoSrc(url) {
    if (location.protocol === "file:") return Promise.resolve({ src: url });
    rangeCheck = rangeCheck || fetch(url, { method: "HEAD" })
      .then((r) => /bytes/i.test(r.headers.get("accept-ranges") || ""))
      .catch(() => true);
    return rangeCheck.then((ok) => ok ? { src: url }
      : fetch(url).then((r) => r.blob()).then((b) => { const src = URL.createObjectURL(b); return { src, blob: src }; }));
  }

  function ensureVideo(c) {
    if (c.video || !c.w.video) return;
    const v = c.video = document.createElement("video");
    v.className = "fs-vid";
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = "auto";
    v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
    v.addEventListener("loadedmetadata", () => { if (c.seekTo == null) v.currentTime = c.w.hero || 0; else { v.currentTime = c.seekTo; c.seekTo = null; } }, { once: true });
    v.addEventListener("playing", () => c.el.classList.add("playing"));
    v.addEventListener("timeupdate", () => onTime(c));
    v.addEventListener("pause", () => { if (entered === c.w.key) refresh(); });
    v.addEventListener("play", () => { if (entered === c.w.key) refresh(); });
    c.img.after(v);
    videoSrc(c.w.video).then(({ src, blob }) => {
      if (c.video !== v || !root) { if (blob) URL.revokeObjectURL(blob); return; }
      c.blob = blob || null;
      v.src = src;
      if (c.wantPlay) play(v);
    }).catch(() => {});
  }

  function play(v) {
    if (!v.getAttribute("src")) return;
    const p = v.play();
    if (p) p.catch(() => {});
  }

  function startMedia(c) {
    c.wantPlay = true;
    ensureVideo(c);
    if (c.video) { c.video.muted = !sound; play(c.video); }
  }

  function stopMedia(c) {
    c.wantPlay = false;
    if (c.video) c.video.pause();
  }

  /* ── Attention: which window is expanded and playing ──── */
  function attend(k) {
    if (!root || entered) return;
    clearTimeout(leaveT); leaveT = 0;
    clearTimeout(switchT); switchT = 0; pendingK = null;
    if (k === attn) return;
    if (attn) { cells[attn].el.classList.remove("on"); stopMedia(cells[attn]); }
    attn = k;
    if (k) { cells[k].el.classList.add("on"); startMedia(cells[k]); }
    layout();
    refresh();
  }

  function lookAway() {
    if (leaveT || !attn || entered) return;
    leaveT = setTimeout(() => { leaveT = 0; attend(null); }, LOOK_AWAY);
  }

  /* ── Opening a work ───────────────────────────────────── */
  function actIndex(w, t) {
    if (!w.acts) return 0;
    let i = 0;
    while (i + 1 < w.acts.length && t >= w.acts[i + 1][1] - 0.05) i++;
    return i;
  }

  function renderWorkTabs() {
    const w = byKey[entered], c = cells[entered];
    const cur = actIndex(w, c.video ? c.video.currentTime : 0);
    const tabs = w.acts
      ? w.acts.map((a, i) => `<span class="sheet-tab ${i === cur ? "active-tab" : "inactive"}" role="button" tabindex="0" data-fs-act="${i}">${esc(a[0])}</span>`).join("")
      : `<span class="sheet-tab active-tab">${esc(w.sheet || "Sheet1")}</span>`;
    els.tabs.innerHTML = `<span class="sheet-tab inactive fs-back" role="button" tabindex="0" data-fs-back>◁ portfolio.nksh</span>${tabs}`;
    c.act = cur;
  }

  function renderInfo() {
    const w = byKey[entered], m = meta(w);
    const sr = m.platform === "SuperRare";
    const rows = [
      ["Year", esc(m.year || "")],
      ["Platform", sr ? "Ethereum · SuperRare" : "Tezos · objkt"],
      w.still && !m.interactive ? ["Type", m.series ? `Series of ${m.series}` : "Image", m.series ? "cf-series" : ""] : ["Type", "Interactive", "cf-interactive"],
      ["Edition", m.editions === 1 ? "1/1" : m.editions ? `Edition of ${m.editions}` : "—"],
      w.still ? null : ["Showing", esc(w.showing)],
    ].filter(Boolean);
    const i = WORKS.indexOf(w);
    els.info.innerHTML = `
      <div class="pane-head"><span class="pane-ref">${esc(w.file)}</span><span class="pane-name">Artwork</span>
        <button type="button" class="pane-x" data-fs-close aria-label="Close ${esc(w.file)}">✕</button></div>
      <div class="pane-body">
        <h2>${esc(w.title)}</h2>
        <div class="kv">${rows.map(([k, v, cls]) => `<div><span>${k}</span><span class="${cls || ""}">${v}</span></div>`).join("")}</div>
        ${m.description ? `<p class="desc">${esc(m.description)}</p>` : ""}
        ${m.url ? `<a class="open-link" href="${esc(m.url)}" target="_blank" rel="noopener">${w.still && !m.interactive ? "View" : "Experience it"} on ${sr ? "SuperRare" : "objkt"} ↗</a>` : ""}
      </div>
      <div class="pane-nav"><button type="button" class="mode-btn" data-fs-step="-1">◁ Prev</button>
        <span>${i + 1} / ${WORKS.length}</span>
        <button type="button" class="mode-btn" data-fs-step="1">Next ▷</button></div>`;
    els.info.hidden = false;
    els.info.querySelector(".pane-body").scrollTop = 0;
  }

  function enter(k) {
    if (!root || !byKey[k] || entered === k) return;
    clearTimeout(leaveT); leaveT = 0;
    if (entered) cells[entered].el.classList.remove("is-in");
    entered = null;
    if (attn !== k) attend(k);
    entered = k;
    const w = byKey[k], c = cells[k];
    c.el.classList.add("on", "is-in");
    startMedia(c);
    root.classList.add("fs-in");
    document.body.classList.add("fs-entered");
    document.body.classList.toggle("fs-has-video", !!w.video);
    const h1 = document.querySelector(".title-bar .title");
    if (h1) {
      if (savedTitle == null) { savedTitle = h1.innerHTML; savedDocTitle = document.title; }
      h1.innerHTML = `<span class="file">${esc(w.file)}</span> — ${esc(w.still ? meta(w).year || "" : w.title)} <span class="by">by Gregory Nikshumika</span>`;
      document.title = `${w.title} — Gregory Nikshumika`;
    }
    renderInfo();
    renderWorkTabs();
    layout();
    refresh();
  }

  function restoreChrome() {
    const h1 = document.querySelector(".title-bar .title");
    if (h1 && savedTitle != null) { h1.innerHTML = savedTitle; document.title = savedDocTitle; }
    savedTitle = savedDocTitle = null;
    document.body.classList.remove("fs-entered", "fs-has-video");
  }

  function exit() {
    if (!root || !entered) return;
    const k = entered;
    entered = null;
    cells[k].el.classList.remove("is-in");
    root.classList.remove("fs-in");
    els.info.hidden = true;
    restoreChrome();
    api.renderTabs();
    layout();
    refresh();
    cells[k].el.focus({ preventScroll: true });
  }

  function togglePlay() {
    const c = cells[entered];
    if (!c || !c.video) return;
    if (c.video.paused) { c.wantPlay = true; play(c.video); } else { c.wantPlay = false; c.video.pause(); }
  }

  function seek(c, t) {
    ensureVideo(c);
    if (c.video.readyState >= 1) c.video.currentTime = t; else c.seekTo = t;
    c.wantPlay = true;
    play(c.video);
  }

  function onTime(c) {
    if (entered !== c.w.key) return;
    const v = c.video;
    if (v.duration) c.el.querySelector(".fs-prog i").style.width = (100 * v.currentTime / v.duration).toFixed(2) + "%";
    const i = actIndex(c.w, v.currentTime);
    if (c.w.acts && i !== c.act) {
      c.act = i;
      els.tabs.querySelectorAll("[data-fs-act]").forEach((t, j) => {
        t.classList.toggle("active-tab", j === i);
        t.classList.toggle("inactive", j !== i);
        if (j === i) t.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    }
    refresh();
  }

  function setSound(on) {
    sound = on;
    if (els.sound) { els.sound.classList.toggle("active", sound); els.sound.setAttribute("aria-pressed", String(sound)); }
    const c = cells[entered || attn];
    if (c && c.video) c.video.muted = !sound;
    refresh();
  }

  /* ── What app.js shows in the name box, formula bar and status bar ─ */
  function ref() { return range; }

  function formula() {
    const w = byKey[entered || attn];
    if (!WORKS.length) return '="A blank sheet is a cage waiting for birds."';
    if (!w) return '="Private joy is always possible. Even here."';
    if (!entered) return w.still ? w.fx() : `=OPEN("${w.file}")`;
    const c = cells[w.key], t = c && c.video ? c.video.currentTime : 0;
    return w.fx(w.acts ? w.acts[actIndex(w, t)][0] : "", fmt(t + (w.t0 || 0)));
  }

  function lead() {
    const c = cells[entered || attn];
    if (!c) return "Ready";
    return c.video && !c.video.paused ? "Playing" : entered && c.video ? "Paused" : "Ready";
  }

  function status() {
    const off = sound ? "" : " · sound off";
    const w = byKey[entered || attn];
    if (!w) return WORKS.length === 1 ? "1 work" : `${WORKS.length} works`;
    if (!entered) return w.still ? w.title : `${w.title}${off}`;
    const c = cells[w.key], v = c && c.video;
    if (!v) { const m = meta(w); return `${w.title} · ${m.editions === 1 ? "1/1" : m.editions ? "Edition of " + m.editions : "objkt"}`; }
    const sheets = w.acts ? `sheet ${actIndex(w, v.currentTime) + 1} of ${w.acts.length} · ` : "";
    const time = `${sheets}${fmt(v.currentTime)} / ${fmt(v.duration)}`;
    return isSmall() ? time : `${w.track} · ${time}${off}`;
  }

  function refresh() {
    if (!root || !api) return;
    if (els.play) { const c = cells[entered]; els.play.textContent = c && c.video && c.video.paused ? "Play" : "Pause"; }
    api.refresh();
  }

  /* ── Events ───────────────────────────────────────────── */
  const winOf = (e) => { const el = e.target.closest && e.target.closest(".fs-win"); return el ? el.dataset.k : null; };

  /* Dragging: press a window where it rests and move it. A mouse drag starts after a few pixels;
     on a touch screen it starts after a press and hold, so a swipe still scrolls the sheet. */
  function onDown(e) {
    if (entered || e.button > 0 || drag) return;
    const p = point(e);
    const grip = e.target.closest(".fs-grip");
    if (grip) {                                   // the corner grip: resize, keeping the proportions
      const k = grip.parentElement.dataset.k;
      if (trashArmed || attn === k) return;
      const h = cells[k].home;
      drag = { k, id: e.pointerId, size: true, x0: e.clientX, y0: e.clientY, px: p.x, w0: h.ww, ww: h.ww, left: h.left, top: h.top, active: false, touch: false, timer: 0 };
      e.preventDefault();
      startDrag();
      return;
    }
    if (attn && inside(openRect, p) && !inside(cells[attn].home, p)) return;   // on the enlarged window: a click
    const k = atHome(p);
    if (!k) return;
    const h = cells[k].home;
    drag = { k, id: e.pointerId, x0: e.clientX, y0: e.clientY, gx: p.x - h.left, gy: p.y - h.top, left: h.left, top: h.top, active: false, touch: e.pointerType === "touch", timer: 0 };
    if (drag.touch) drag.timer = setTimeout(startDrag, 380);
  }

  function startDrag() {
    if (!drag || drag.active || !root) return;
    clearTimeout(drag.timer);
    drag.active = true;
    clearTimeout(switchT); switchT = 0; pendingK = null;
    if (attn) attend(null);
    const c = cells[drag.k];
    c.el.classList.add("dragging");
    root.classList.add(drag.size ? "fs-sizing" : "fs-dragging");
    try { els.grid.setPointerCapture(drag.id); } catch (e) {}
  }

  function dragTo(e) {
    const p = point(e), c = cells[drag.k], h = c.home;
    if (drag.size) {
      drag.ww = Math.round(Math.max(64, Math.min(sheetW - h.left, drag.w0 + p.x - drag.px)));
      c.el.style.width = drag.ww + "px";
      c.el.style.height = Math.round((drag.ww - 2) / c.aspect) + BAR + 2 + "px";
      return;
    }
    drag.left = Math.max(0, Math.min(sheetW - h.ww, Math.round(p.x - drag.gx)));
    drag.top = Math.max(0, Math.min(sheetHt - h.wh, Math.round(p.y - drag.gy)));
    c.el.style.left = drag.left + "px";
    c.el.style.top = drag.top + "px";
    const t = els.trash.getBoundingClientRect();
    drag.trash = e.clientX >= t.left - 14 && e.clientX <= t.right + 14 && e.clientY >= t.top - 14 && e.clientY <= t.bottom + 14;
    els.trash.classList.toggle("hot", drag.trash);
    c.el.classList.toggle("to-trash", drag.trash);
  }

  function onUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    clearTimeout(drag.timer);
    const d = drag;
    drag = null;
    if (!d.active) return;                       // it was a click or a scroll, not a drag
    try { els.grid.releasePointerCapture(d.id); } catch (err) {}
    const c = cells[d.k];
    root.classList.remove("fs-dragging", "fs-sizing");
    els.trash.classList.remove("hot");
    if (e.type === "pointerup" && d.trash) {     // thrown away
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 80);
      c.el.classList.add("gone");
      setTimeout(() => removeWork(d.k), 170);
      return;
    }
    c.el.classList.remove("dragging", "to-trash");
    if (e.type === "pointerup") {
      zTop = Math.max(zTop, ...Object.values(custom).map((v) => v[2] || 1)) + 1;
      const W = baseW;
      custom[d.k] = [+(d.left / W).toFixed(4), +(d.top / W).toFixed(4), Math.min(zTop, 900), +((d.size ? d.ww : c.home.ww) / W).toFixed(4)];
      saveCustom();
    }
    dropLock = d.k;                              // do not enlarge it until the pointer has left it once
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 80);
    layout(false);
  }

  /* ── Adding and removing works ────────────────────────── */
  // Pin every window where it is now, so adding or removing one does not move the others.
  function freezePlaces() {
    const W = baseW;
    WORKS.forEach((w) => {
      const h = cells[w.key].home, cu = custom[w.key];
      custom[w.key] = [+(h.left / W).toFixed(4), +(h.top / W).toFixed(4), cu ? cu[2] || 1 : 1, +(h.ww / W).toFixed(4)];
    });
  }

  function removeWork(k) {
    if (!root) return;
    freezePlaces();
    shown = WORKS.map((w) => w.key).filter((x) => x !== k);
    delete custom[k];
    saveCustom();
    resolveShown();
    api.rerender();
  }

  function addWork(k) {
    if (!root || !byKey[k] || WORKS.some((w) => w.key === k)) return;
    freezePlaces();
    delete custom[k];
    shown = WORKS.map((w) => w.key).concat(k);
    saveCustom();
    resolveShown();
    fresh = k;
    const list = els.cat.querySelector(".fs-cat-list");
    catScroll = list ? list.scrollTop : 0;
    api.rerender();
  }

  // Like Excel's Arrange All: every work on the sheet goes back into tidy scattered rows.
  // Which works are shown is kept; only places and sizes change.
  function arrange() {
    if (!root || entered) return;
    if (attn) attend(null);
    custom = {};
    if (shown) {
      const W = baseW;
      scatterHomes(W, els.scroll.clientHeight, isSmall());
      WORKS.forEach((w) => { const h = cells[w.key].home; custom[w.key] = [+(h.left / W).toFixed(4), +(h.top / W).toFixed(4), 1, +(h.ww / W).toFixed(4)]; });
    }
    zTop = 1; dropLock = null;
    saveCustom();
    els.scroll.scrollTop = 0; els.scroll.scrollLeft = 0;
    layout();
  }

  function resetPlaces() {
    custom = {}; shown = null; zoom = 1; zTop = 1; dropLock = null;
    saveCustom();
    resolveShown();
    api.rerender();
  }

  function renderCatalogue() {
    const q = catQuery.trim().toLowerCase();
    const on = new Set(WORKS.map((w) => w.key)), seen = new Set();
    const all = catalogue().filter((c) => !on.has(c.key) && !seen.has(c.key) && seen.add(c.key));
    const items = all.filter((c) => !q || `${c.x.title} ${c.x.year} ${c.x.platform}`.toLowerCase().includes(q));
    const kind = (x) => (x.interactive ? "Interactive" : x.series ? `Series of ${x.series}` : "Image");
    els.cat.innerHTML = `
      <div class="fs-cat-head"><b>Catalogue</b><span>${all.length} not on the sheet</span>
        <button type="button" class="pane-x" data-cat-close aria-label="Close the catalogue">✕</button></div>
      <input type="search" class="fd-search" placeholder="Search the catalogue" aria-label="Search the catalogue" value="${esc(catQuery)}">
      <div class="fs-cat-list">${items.map((c) => `
        <button type="button" class="fs-cat-item" data-add="${esc(c.key)}">
          <img src="${esc(c.w.poster)}" alt="" loading="lazy" decoding="async">
          <span><b>${esc(c.x.title)}</b><i>${esc(c.x.year)} · ${esc(c.x.platform)} · ${kind(c.x)}</i></span>
          <em aria-hidden="true">+</em>
        </button>`).join("") || `<p class="fs-cat-none">${all.length ? "Nothing matches." : "Everything is on the sheet."}</p>`}</div>`;
  }

  function setCatalogue(open) {
    catOpen = open;
    els.cat.hidden = !open;
    els.add.classList.toggle("active", open);
    els.add.setAttribute("aria-expanded", String(open));
    if (open) { renderCatalogue(); els.cat.querySelector(".fs-cat-list").scrollTop = catScroll; }
  }

  function onMove(e) {
    if (drag && e.pointerId === drag.id) {
      const far = Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0);
      if (!drag.active) {
        if (drag.touch) { if (far > 8) { clearTimeout(drag.timer); drag = null; } return; }   // a swipe: let it scroll
        if (far < 5) return;
        startDrag();
      }
      dragTo(e);
      return;
    }
    // Works do not enlarge on hover: a click enlarges one, a second click opens it (see onClick).
  }

  function onLeave() {}

  function onClick(e) {
    if (suppressClick) { suppressClick = false; return; }   // the end of a drag is not a click
    if (e.target.closest(".fs-tools, .fs-cat")) return;
    if (e.target.closest("[data-fs-close]")) { exit(); return; }
    const stepBtn = e.target.closest("[data-fs-step]");
    if (stepBtn && entered) { const i = WORKS.indexOf(byKey[entered]); enter(WORKS[(i + +stepBtn.dataset.fsStep + WORKS.length) % WORKS.length].key); return; }
    const prog = e.target.closest(".fs-prog");
    if (prog && entered) {
      const c = cells[entered], r = prog.getBoundingClientRect();
      if (c.video && c.video.duration) seek(c, c.video.duration * Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
      return;
    }
    if (entered) { if (winOf(e) === entered) togglePlay(); return; }
    if (!e.target.closest(".fs-grid")) return;
    if (trashArmed) {                            // trash, then a work: that work leaves the sheet
      const gone = hit(e);
      armTrash(false);
      if (gone) { cells[gone].el.classList.add("gone"); setTimeout(() => removeWork(gone), 170); }
      return;
    }
    const k = hit(e);
    if (!k) attend(null);
    else if (attn === k) enter(k);
    else attend(k);
  }

  function onFocus(e) {
    const k = winOf(e);
    if (k && !entered && k !== attn && e.target.matches(":focus-visible")) attend(k);
  }

  // Sheet tabs and keys are listened to once; they only act while this sheet is mounted.
  function onTabs(e) {
    if (!root || !entered) return;
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    const back = e.target.closest("[data-fs-back]"), act = e.target.closest("[data-fs-act]");
    if (!back && !act) return;
    e.preventDefault(); e.stopPropagation();
    if (back) { exit(); return; }
    if (e.type === "click") act.blur();
    const c = cells[entered];
    seek(c, c.w.acts[+act.dataset.fsAct][1] + 0.05);
  }

  function onKey(e) {
    if (!root || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest("input, textarea") || document.querySelector(".menu-drop.open")) return;
    if ((e.key === "Enter" || e.key === " ") && e.target.closest("[data-fs-act], [data-fs-back], button, a")) return;
    if (e.key === "m" || e.key === "M") { setSound(!sound); return; }
    if (entered) {
      if (e.key === "Escape") exit();
      else if (e.key === " ") { e.preventDefault(); togglePlay(); }
      else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const i = WORKS.indexOf(byKey[entered]) + (e.key === "ArrowRight" ? 1 : -1);
        enter(WORKS[(i + WORKS.length) % WORKS.length].key);
      }
      return;
    }
    if (e.key === "Escape" && trashArmed) { armTrash(false); return; }
    if (e.key === "Escape" && catOpen) { setCatalogue(false); return; }
    if (e.key === "Escape" && attn) { attend(null); return; }
    if ((e.key === "Delete" || e.key === "Backspace") && attn) { e.preventDefault(); removeWork(attn); return; }
    if (e.key === "Enter" && attn) { e.preventDefault(); enter(attn); return; }
    if (!e.key.startsWith("Arrow")) return;
    e.preventDefault();
    const i = WORKS.indexOf(byKey[attn]);
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -perRow, ArrowDown: perRow }[e.key];
    const j = i < 0 ? 0 : i + step;
    const next = j >= 0 && j < WORKS.length ? WORKS[j].key : null;
    if (next) { attend(next); cells[next].el.focus({ preventScroll: true }); cells[next].el.scrollIntoView({ block: "nearest" }); }
  }

  function onBreakpoint() { if (root && api) api.rerender(); }

  document.addEventListener("keydown", onKey);
  mqSmall.addEventListener("change", onBreakpoint);

  /* ── Mount / unmount (called from app.js render) ──────── */
  function mount(g, appApi) {
    unmount();
    trashArmed = false;
    api = appApi;
    root = g.querySelector(".fs");
    if (!root) { root = null; return; }
    els = {
      grid: root.querySelector(".fs-grid"), cols: root.querySelector(".fs-cols"), rows: root.querySelector(".fs-rows"),
      scroll: root.querySelector(".fs-scroll"), sheet: root.querySelector(".fs-sheet"), zoomBox: root.querySelector(".fs-zoom"),
      colh: root.querySelector(".fs-colh"), colIn: root.querySelector(".fs-colh-in"),
      ghost: root.querySelector(".fs-ghost"), empty: root.querySelector(".fs-empty"),
      cat: root.querySelector(".fs-cat"), add: root.querySelector("#fsAdd"), trash: root.querySelector("#fsTrash"),
      info: root.querySelector(".fs-info"), tabs: document.getElementById("sheetTabs"),
    };
    document.body.classList.add("sheet-front");
    // follow the site's text scale (site.css --fs) and row height
    const css = getComputedStyle(root), scale = parseFloat(css.getPropertyValue("--fs")) || 1;
    BAR = Math.round(18 * scale); STAT = Math.round(34 * scale);
    ROW_H = parseFloat(css.getPropertyValue("--nk-h-row")) || 21;
    ROW_W = parseFloat(css.getPropertyValue("--nk-w-row-header")) || 36;
    COL_H = parseFloat(css.getPropertyValue("--nk-h-col-header")) || 21;

    // the status bar's zoom readout becomes this sheet's zoom control
    const zb = document.querySelector(".status-bar .zoom");
    if (zb) {
      savedZoomHTML = zb.innerHTML;
      zb.classList.add("fs-zoomer");
      zb.innerHTML = `<button type="button" data-zoom="-1" aria-label="Zoom out" title="Zoom out">−</button>` +
        `<input type="range" min="${ZOOM_MIN * 100}" max="${ZOOM_MAX * 100}" step="5" value="${Math.round(zoom * 100)}" aria-label="Zoom">` +
        `<button type="button" data-zoom="1" aria-label="Zoom in" title="Zoom in">+</button><span class="fs-zoom-val">${Math.round(zoom * 100)}%</span>`;
      els.zoomRange = zb.querySelector("input");
      els.zoomVal = zb.querySelector(".fs-zoom-val");
      els.zoomRange.oninput = () => setZoom(els.zoomRange.value / 100);
      zb.onclick = (e) => { const b = e.target.closest("[data-zoom]"); if (b) setZoom(Math.round(zoom * 20 + +b.dataset.zoom) / 20); };
    }

    const bar = document.querySelector(".mode-buttons");
    if (bar) {
      bar.insertAdjacentHTML("afterbegin",
        `<button type="button" class="mode-btn fs-btn" id="fsPlay" title="Play or pause (Space)">Pause</button>` +
        `<button type="button" class="mode-btn fs-btn" id="fsSound" title="Sound (M)" aria-pressed="false">Sound</button>` +
        `<button type="button" class="mode-btn fs-btn" id="fsClose" title="Back to the sheet (Esc)">Close</button>` +
        `<button type="button" class="mode-btn fs-btn" id="fsReset" title="Put the windows back where they started">Reset</button>`);
      document.getElementById("fsReset").onclick = resetPlaces;
      document.getElementById("fsReset").insertAdjacentHTML("beforebegin",
        `<button type="button" class="mode-btn fs-btn" id="fsArrange" title="Lay every work out again in rows, keeping the works you chose">Arrange</button>`);
      document.getElementById("fsArrange").onclick = arrange;
      els.play = document.getElementById("fsPlay");
      els.sound = document.getElementById("fsSound");
      els.close = document.getElementById("fsClose");
      els.play.onclick = togglePlay;
      els.sound.onclick = () => setSound(!sound);
      els.close.onclick = exit;
      els.sound.classList.toggle("active", sound);
      els.sound.setAttribute("aria-pressed", String(sound));
    }
    if (els.tabs && !els.tabs.dataset.fsBound) {
      els.tabs.dataset.fsBound = "1";
      els.tabs.addEventListener("click", onTabs, true);
      els.tabs.addEventListener("keydown", onTabs, true);
    }

    cells = {};
    WORKS.forEach((w) => {
      const el = root.querySelector(`.fs-win[data-k="${w.key}"]`);
      const c = cells[w.key] = { w, el, img: el.querySelector(".fs-img"), aspect: w.aspect, home: null, z: 1, ready: false, video: null, blob: null, seekTo: null, act: 0, wantPlay: false };
      // A window is placed once its picture has loaded and its real proportions are known.
      const sized = () => { if (c.img.naturalWidth) c.aspect = c.img.naturalWidth / c.img.naturalHeight; c.ready = true; };
      const loaded = () => { sized(); if (cells[w.key] !== c) return; layout(false); if (fresh === w.key) reveal(w.key); };
      if (c.img.complete) sized();
      else { c.img.addEventListener("load", loaded, { once: true }); c.img.addEventListener("error", loaded, { once: true }); }
    });

    els.add.onclick = () => setCatalogue(!catOpen);
    els.trash.onclick = () => armTrash(!trashArmed);   // click the trash, then the work to remove
    els.cat.addEventListener("click", (e) => {
      if (e.target.closest("[data-cat-close]")) { setCatalogue(false); return; }
      const item = e.target.closest("[data-add]");
      if (item) addWork(item.dataset.add);
    });
    els.cat.addEventListener("input", (e) => {
      if (!e.target.matches(".fd-search")) return;
      catQuery = e.target.value;
      const at = e.target.selectionStart;
      renderCatalogue();
      const box = els.cat.querySelector(".fd-search");
      box.focus(); box.setSelectionRange(at, at);
    });
    els.scroll.addEventListener("scroll", syncScroll, { passive: true });
    els.scroll.addEventListener("wheel", onWheel, { passive: false });
    els.scroll.addEventListener("touchstart", onTouch, { passive: false });
    els.scroll.addEventListener("touchmove", onTouch, { passive: false });
    els.scroll.addEventListener("touchend", onTouch, { passive: false });
    els.grid.addEventListener("pointerdown", onDown);
    els.grid.addEventListener("pointerup", onUp);
    els.grid.addEventListener("pointercancel", onUp);
    els.grid.addEventListener("touchmove", (e) => { if (drag && drag.active && e.cancelable) e.preventDefault(); }, { passive: false });
    els.grid.addEventListener("contextmenu", (e) => { if (drag) e.preventDefault(); });
    els.grid.addEventListener("pointermove", onMove);
    els.grid.addEventListener("pointerleave", onLeave);
    els.grid.addEventListener("focusin", onFocus);
    root.addEventListener("click", onClick);
    // Lay out again only when the sheet's own box really changed, so a layout can never retrigger itself.
    let boxW = els.scroll.clientWidth, boxH = els.scroll.clientHeight;
    ro = new ResizeObserver(() => {
      const w = els.scroll.clientWidth, h = els.scroll.clientHeight;
      if (w === boxW && h === boxH) return;
      boxW = w; boxH = h;
      layout(false);
    });
    ro.observe(els.scroll);

    layout(false);
    if (catOpen) setCatalogue(true);
    if (fresh && cells[fresh] && cells[fresh].ready) reveal(fresh);   // otherwise when its picture loads
    else if (!cells[fresh]) fresh = null;
    refresh();
  }

  function armTrash(on) {
    trashArmed = !!on && !!root;
    if (!root) return;
    if (trashArmed && attn) attend(null);
    root.classList.toggle("fs-trash-armed", trashArmed);
    els.trash.classList.toggle("armed", trashArmed);
    els.trash.setAttribute("aria-pressed", String(trashArmed));
    els.trash.title = trashArmed ? "Now click the work to remove (Esc to cancel)" : "Click, then click a work to remove it. Or drag a work here";
  }

  // The work just added: bring it into view and mark it for a moment.
  function reveal(k) {
    fresh = null;
    const el = cells[k] && cells[k].el;
    if (!el) return;
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
    el.classList.add("fresh");
    setTimeout(() => el.classList.remove("fresh"), 1400);
  }

  function flashTrash() {
    els.trash.classList.add("hint");
    setTimeout(() => { if (els.trash) els.trash.classList.remove("hint"); }, 900);
  }

  function unmount() {
    if (!root) return;
    clearTimeout(leaveT); leaveT = 0;
    clearTimeout(switchT); switchT = 0; pendingK = null; openRect = null;
    if (drag) { clearTimeout(drag.timer); drag = null; }
    dropLock = null; pinch = null;
    const zb = document.querySelector(".status-bar .zoom");
    if (zb && savedZoomHTML != null) { zb.innerHTML = savedZoomHTML; zb.classList.remove("fs-zoomer"); zb.onclick = null; }
    savedZoomHTML = null;
    document.body.classList.remove("fs-moved");
    Object.values(cells).forEach((c) => {
      stopMedia(c);
      if (c.video) { c.video.removeAttribute("src"); c.video.load(); c.video = null; }
      if (c.blob) URL.revokeObjectURL(c.blob);
    });
    if (ro) { ro.disconnect(); ro = null; }
    restoreChrome();
    document.body.classList.remove("sheet-front");
    document.querySelectorAll(".fs-btn").forEach((b) => b.remove());
    root = null; api = null; els = {}; cells = {};
    attn = entered = null;
  }

  return { html, mount, unmount, ref, formula, status, lead, works: WORKS };
})();
