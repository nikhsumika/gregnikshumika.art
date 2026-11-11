/* portfolio.nksh — a workbook of Gregory Nikshumika's works.
   Sheets: Works (table + AutoFilter), Gallery, Market, About, Contact.
   The formula bar shows the selected cell and doubles as search. */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const letter = (i) => { let s = ""; i += 1; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  const small = () => window.matchMedia("(max-width: 700px)").matches;

  /* ── Data ─────────────────────────────────────────────── */
  const works = (window.WORKS || []).map((w, i) => ({
    ...w,
    id: i,
    type: w.interactive ? "Interactive" : w.series ? "Series" : "Image",
    edition: w.editions === 1 ? "1/1" : w.editions ? String(w.editions) : "—",
    yearNum: parseInt(w.year, 10) || 0,
    description: w.description || "",
  }));
  const TOTAL = works.length;
  const count = (fn) => works.filter(fn).length;

  const COLS = [
    { key: "preview", label: "Preview" },
    { key: "title", label: "Title", filter: true },
    { key: "year", label: "Year", filter: true, numeric: true },
    { key: "platform", label: "Platform", filter: true, sm: false },
    { key: "type", label: "Type", filter: true, sm: false },
    { key: "edition", label: "Edition", filter: true, numeric: true, sm: false },
    { key: "description", label: "Notes", sm: false },
    { key: "link", label: "Link", sm: false },
  ];

  const SHEETS = [
    ...(window.FrontSheet ? [{ key: "front", label: "Index" }] : []),
    { key: "works", label: "Works" },
    { key: "gallery", label: "Gallery" },
    ...(window.MarketSheet ? [{ key: "market", label: "Market" }] : []),
    { key: "about", label: "About" },
  ];

  const BIO = "Above average future Sotheby’s artist. Maybe. Sarcastic. Chaotic good. Dark arts. Attempts at hope. My eyes were connected directly to my heart in a bizarre birth accident.";
  const PRACTICE = "I work across three mediums: spreadsheet software as a visual art tool, AI-assisted interactive games and art pages, and pixel collage. The work explores beauty, metanoia, loneliness, consciousness, and the quiet tragicomedy of my own life, treating corporate and digital tools for contemplation rather than productivity.";
  const years = works.map((w) => w.yearNum).filter(Boolean);

  const ABOUT = [
    { k: "Artist", v: "Gregory Nikshumika", cls: "big", tall: true },
    { k: "Bio", v: BIO, wrap: true },
    { k: "Practice", v: PRACTICE, wrap: true },
    { k: "Works listed", v: TOTAL, f: `=COUNTA(Works!B2:B${TOTAL + 1})`, num: true },
    { k: "Interactive", v: count((w) => w.interactive), f: '=COUNTIF(Works!E:E,"Interactive")', num: true },
    { k: "On SuperRare", v: count((w) => w.platform === "SuperRare"), f: '=COUNTIF(Works!D:D,"SuperRare")', num: true },
    { k: "On Tezos", v: count((w) => w.platform === "Tezos"), f: '=COUNTIF(Works!D:D,"Tezos")', num: true },
    { k: "First mint", v: "2022 (since lost)", f: '="2022 (first piece, since lost)"' },
    { k: "Latest mint", v: Math.max(...years), f: "=MAX(Works!C:C)", num: true },
  ];

  // CV: one row per item, the year in the Field column. Exhibition years follow the
  // mint date of the work shown.
  const cv = (k, v, href) => ({ k, v, wrap: true, cls: "cv-v", ...(href ? { href } : {}) });
  const CV = [
    { k: "Exhibitions", v: "", section: true },
    cv("2026", "PONDER: We Are Still Alive! Group exhibition by the PONDER collective, objkt"),
    cv("2026", "PONDER: Essential Threads. Group exhibition by the PONDER collective, objkt"),
    cv("2026", "Solarchi Curates // 24. Curated by Solarchi with Unknown Collector"),
    cv("2026", "Proof of Palm 2026. Organised by Absurdeity"),
    cv("2025", "Carnival Dharmas. Curated by Absurdeity, Accomparts"),
    cv("2025", "Tai Mei’s Guide to the Glitch Galaxy. Curated by Tai Mei for the “Sociology of the Image” lecture on glitch art, National Taiwan University"),
    cv("2025", "RARE Gallery. Curated by the Accomparts team"),
    cv("2025", "#objkt4objkt 2025. objkt’s yearly event"),
    cv("2025", "Proof of Palm 2025. Organised by Absurdeity"),
    cv("2024–25", "Seasons. Curated by Absurdeity"),
    cv("2024–25", "Interface Theory, The Glitch Garden, Space is the Place, TXT.ART and Singularities. Curated by Kyle Flemmer, KF Archive"),
    cv("2024", "ART MARKET DAY: X-Mas Edition. Fakewhale Gallery, objkt", "https://log.fakewhale.xyz/fakewhale-gallery-presents-art-market-day-x-mas-edition-on-objkt"),
    cv("2024", "#Fear4Tez 2024. Friday the 13th open call by Tez_Town"),
    { k: "", v: "", blank: true },
    { k: "Curated release", v: "", section: true },
    cv("2026", "SuperRare. Nine 1/1 works released through SuperRare curation, all sold", "https://superrare.com/gregorynikshumika"),
    { k: "", v: "", blank: true },
    { k: "Publication", v: "", section: true },
    cv("2025", "TzAR (Tezos Art Review): Pixel Art Anthology. Edited by Kyle Flemmer, The Blasted Tree. One of the featured artists, with three works in print", "http://www.theblastedtree.com/store/tzar-pixel-art-anthology"),
    { k: "", v: "", blank: true },
    { k: "Press", v: "", section: true },
    cv("2025", "“TzAR: Pixel Art Profiles #12” by Kyle Flemmer. Electric Chronicles", "https://www.electric-chronicles.com/articles/pixel-art-profiles-12"),
    { k: "", v: "", blank: true },
    { k: "Collections", v: "", section: true },
    cv("2026", "Tezos community art collection. Selected by Kika Nicolela"),
    cv("2024", "NFTARCH permanent collection. Andrea Balestrero"),
    cv("—", "KF Archive and KF Vault. Kyle Flemmer"),
    { k: "", v: "", blank: true },
    { k: "Writing", v: "", section: true },
    cv("2026", "“Misha Ilin / Asphodels / AILSA, NYC, 2026.” Exhibition review, Substack", "https://gregorynikshumika.substack.com/p/misha-ilin-asphodels-ailsa-nyc-2026"),
  ];
  const CONTACT = [
    { k: "Email", v: "gregorynikshumika@gmail.com", href: "mailto:gregorynikshumika@gmail.com" },
    { k: "SuperRare", v: "superrare.com/gregorynikshumika", href: "https://superrare.com/gregorynikshumika" },
    { k: "objkt", v: "objkt.com/@gregnikshumika.bsky.social", href: "https://objkt.com/@gregnikshumika.bsky.social/created" },
    { k: "X", v: "@GregNikshumika", href: "https://x.com/GregNikshumika" },
    { k: "Bluesky", v: "@gregnikshumika.bsky.social", href: "https://bsky.app/profile/gregnikshumika.bsky.social" },
    { k: "Substack", v: "gregorynikshumika.substack.com", href: "https://gregorynikshumika.substack.com" },
    { k: "Accomparts", v: "accomparts.com/artist/greg-nikshumika", href: "https://accomparts.com/artist/greg-nikshumika" },
    { k: "Raster", v: "raster.art/artist/greg-nikshumika", href: "https://www.raster.art/artist/greg-nikshumika/about" },
    { k: "Tezos", v: "tz1g9jiDLMcadVEfMxMhToUWNB6hvMcMsFKY", mono: true },
    { k: "Ethereum", v: "0x2Bf0fDF931C81C056b0A4910061CF582e9F517a1", mono: true },
  ];

  /* ── State ────────────────────────────────────────────── */
  const state = {
    sheet: "works",
    filters: {},        // key -> Set of allowed values
    sort: null,         // { key, dir }
    query: "",
    sel: null,          // selected work id
    selCol: 1,
    kvSel: null,        // { row, col } on About/Contact
    mkSel: null,        // { ref, f } on Market
    mkW: 0,
    view: [],
    galCols: 4,
  };
  const isFiltered = () => Object.keys(state.filters).length > 0 || !!state.query;

  function passes(w, skipKey) {
    for (const [k, set] of Object.entries(state.filters)) {
      if (k !== skipKey && !set.has(String(w[k]))) return false;
    }
    if (state.query) {
      const hay = `${w.title} ${w.description} ${w.platform} ${w.type} ${w.year}`.toLowerCase();
      if (!hay.includes(state.query.toLowerCase())) return false;
    }
    return true;
  }

  function sortValue(w, key) {
    if (key === "year") return w.yearNum;
    if (key === "edition") return w.editions || 0;
    return String(w[key]).toLowerCase();
  }

  function compute() {
    let v = works.filter((w) => passes(w));
    if (state.sort) {
      const { key, dir } = state.sort;
      v = v.slice().sort((a, b) => {
        const A = sortValue(a, key), B = sortValue(b, key);
        return ((A < B ? -1 : A > B ? 1 : 0) * dir) || a.id - b.id;
      });
    }
    state.view = v;
  }

  /* ── Rendering: Works ─────────────────────────────────── */
  const FUNNEL = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M0 0h10L6 4.6V10L4 8.6V4.6z"/></svg>';
  const CARET = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3h8L5 8z"/></svg>';
  const smCls = (c) => (c.sm === false ? " hide-sm" : "");

  function colHeaders(cols, selCol) {
    return `<div class="col-headers"><div class="corner"></div>${cols.map((c, i) =>
      `<div class="col-h${smCls(c)}${i === selCol ? " sel" : ""}" data-col="${i}" style="width:var(--w-${c.key})">${letter(i)}<span class="col-resize-handle" data-key="${c.key}"></span></div>`
    ).join("")}<div class="col-h filler"></div></div>`;
  }

  function rowNum(w, r) { return isFiltered() ? w.id + 2 : r + 2; }

  function cellHTML(w, key) {
    switch (key) {
      case "preview": return `<span class="pixwrap" data-cols="18"><img src="${esc(w.images[0])}" alt="" loading="lazy" decoding="async"></span>`;
      case "title": return `<span class="ellip">${esc(w.title)}</span>${w.series ? `<span class="sub">×${w.series}</span>` : ""}`;
      case "year": return esc(w.year);
      case "platform": return esc(w.platform);
      case "type": return esc(w.type);
      case "edition": return esc(w.edition);
      case "description": return `<span class="ellip">${esc(w.description.replace(/\s+/g, " "))}</span>`;
      case "link": return `<a href="${esc(w.url)}" target="_blank" rel="noopener">${w.platform === "SuperRare" ? "superrare" : "objkt"} ↗</a>`;
    }
    return "";
  }

  function cellClass(w, c) {
    let cls = `cell c-${c.key}${smCls(c)}`;
    if (c.key === "type" && w.type !== "Image") cls += ` cf-${w.type.toLowerCase()}`;
    if (c.key === "year" && /^\d{4}$/.test(w.year)) cls += " num";
    if (c.key === "edition" && /^\d+$/.test(w.edition)) cls += " num";
    return cls;
  }

  function worksSheet() {
    const filtered = isFiltered();
    let h = `<div class="sheet works-sheet" role="grid" aria-label="Works" aria-rowcount="${state.view.length + 1}">`;
    h += colHeaders(COLS, state.sel != null ? state.selCol : -1);
    h += `<div class="grid-row hdr-row" role="row"><div class="cell rh">1</div>${COLS.map((c) => {
      const on = !!state.filters[c.key] || (state.sort && state.sort.key === c.key);
      const btn = c.filter ? `<button type="button" class="af${on ? " on" : ""}" data-filter="${c.key}" aria-label="Filter ${c.label}">${state.filters[c.key] ? FUNNEL : CARET}</button>` : "";
      return `<div class="cell header-cell${smCls(c)}" role="columnheader" style="width:var(--w-${c.key})"><span class="ellip">${c.label}</span>${btn}</div>`;
    }).join("")}<div class="cell filler header-cell"></div></div>`;

    state.view.forEach((w, r) => {
      const n = rowNum(w, r);
      h += `<div class="grid-row work-row" role="row" data-id="${w.id}" data-n="${n}"><div class="cell rh${filtered ? " filtered" : ""}">${n}</div>${COLS.map((c, i) =>
        `<div class="${cellClass(w, c)}" role="gridcell" data-col="${i}" style="width:var(--w-${c.key})">${cellHTML(w, c.key)}</div>`
      ).join("")}<div class="cell filler"></div></div>`;
    });
    if (!state.view.length) {
      h += `<div class="grid-row empty-row"><div class="cell rh">2</div><div class="cell c-description" style="width:calc(var(--w-preview) + var(--w-title) + var(--w-year))"><span class="ellip">#N/A: no works match. Clear the filters from the Data menu.</span></div><div class="cell filler"></div></div>`;
    }
    const start = (filtered ? TOTAL : state.view.length) + 2;
    for (let k = 0; k < 14; k++) {
      h += `<div class="grid-row empty-row"><div class="cell rh">${start + k}</div>${COLS.map((c) => `<div class="cell${smCls(c)}" style="width:var(--w-${c.key})"></div>`).join("")}<div class="cell filler"></div></div>`;
    }
    return h + "</div>";
  }

  /* ── Rendering: Gallery ───────────────────────────────── */
  function galleryColumns() {
    const width = $("gridArea").clientWidth - (small() ? 30 : 36);
    const min = small() ? 160 : 230;
    return Math.max(1, Math.floor(width / min));
  }

  function gallerySheet() {
    const n = state.galCols = galleryColumns();
    const rows = Math.max(1, Math.ceil(state.view.length / n));
    let h = `<div class="sheet gal" style="--gcols:${n}">`;
    h += `<div class="col-headers"><div class="corner"></div><div class="gal-cols">${Array.from({ length: n }, (_, i) => `<div class="col-h" data-col="${i}">${letter(i)}</div>`).join("")}</div></div>`;
    h += `<div class="gal-body"><div class="gal-rh">${Array.from({ length: rows }, (_, r) => `<div data-r="${r}">${r + 1}</div>`).join("")}</div><div class="gal-grid">`;
    h += state.view.map((w, i) => `
      <div class="tile" data-id="${w.id}" data-i="${i}" role="button" tabindex="-1" aria-label="${esc(w.title)}">
        <div class="tile-img pixwrap" data-cols="40"><img src="${esc(w.images[0])}" alt="${esc(w.title)}" loading="lazy" decoding="async"></div>
        <div class="tile-cap">${w.interactive ? '<span class="dot" title="Interactive"></span>' : ""}<span class="ellip">${esc(w.title)}</span><span class="yr">${esc(w.yearNum || w.year)}</span></div>
      </div>`).join("");
    if (!state.view.length) h += `<div class="tile" style="cursor:default"><div class="tile-cap"><span class="ellip">#N/A: no works match</span></div></div>`;
    return h + "</div></div></div>";
  }

  /* ── Rendering: About (with the contact details below) ── */
  const ABOUT_SHEET = [...ABOUT, { k: "", v: "", blank: true }, ...CV, { k: "", v: "", blank: true }, { k: "Contact", v: "", section: true }, ...CONTACT];
  function kvRows() { return ABOUT_SHEET; }
  const PORTRAIT = {
    src: "works/self-portrait.jpg",
    title: "Self-Portrait",
    year: "2024",
    url: "https://objkt.com/tokens/KT1U1Jnybr3ziLAsbGbWvXFms2kLLs1iYw5H/57",
  };

  function kvSheet() {
    const rows = kvRows();
    const cols = [{ key: "k", label: "" }, { key: "v", label: "" }];
    const sel = state.kvSel;
    let h = `<div class="sheet kv-sheet">${colHeaders(cols, sel ? sel.col : -1)}`;
    h += `<div class="grid-row hdr-row"><div class="cell rh">1</div><div class="cell header-cell" style="width:var(--w-k)">Field</div><div class="cell header-cell" style="width:var(--w-v)">Value</div><div class="cell filler header-cell"></div></div>`;
    // Self-portrait floats to the right of the table, like a picture placed on the sheet
    h += `<figure class="kv-portrait"><a href="${esc(PORTRAIT.url)}" target="_blank" rel="noopener"><img src="${esc(PORTRAIT.src)}" alt="${esc(PORTRAIT.title)}, ${PORTRAIT.year}, by Gregory Nikshumika" loading="lazy" decoding="async"></a><figcaption><a href="${esc(PORTRAIT.url)}" target="_blank" rel="noopener">${esc(PORTRAIT.title)}</a>, ${PORTRAIT.year}</figcaption></figure>`;
    rows.forEach((r, i) => {
      const tgt = r.href && r.href.startsWith("mailto:") ? "" : ` target="_blank" rel="noopener"`;
      const v = r.href ? `<a href="${esc(r.href)}"${tgt}>${esc(r.v)}</a>` : esc(r.v);
      const vCls = ["cell", "c-v", r.wrap ? "wrap" : "", r.num ? "num" : "", r.mono ? "mono" : "", r.cls || ""].join(" ");
      const isSel = (c) => (sel && sel.row === i && sel.col === c ? " sel" : "");
      if (r.blank) {
        h += `<div class="grid-row kv-row kv-blank" data-r="${i}"><div class="cell rh${sel && sel.row === i ? " sel-rh" : ""}">${i + 2}</div><div class="cell${isSel(0)}" data-col="0" style="width:var(--w-k)"></div><div class="cell${isSel(1)}" data-col="1" style="width:var(--w-v)"></div><div class="cell filler"></div></div>`;
        return;
      }
      if (r.section) {   // a header row like row 1: same fill across the whole row
        h += `<div class="grid-row kv-row kv-section" data-r="${i}"><div class="cell rh${sel && sel.row === i ? " sel-rh" : ""}">${i + 2}</div><div class="cell c-k header-cell${isSel(0)}" data-col="0" style="width:var(--w-k)">${esc(r.k)}</div><div class="cell c-v header-cell${isSel(1)}" data-col="1" style="width:var(--w-v)"></div><div class="cell filler header-cell"></div></div>`;
        return;
      }
      h += `<div class="grid-row kv-row${r.wrap || r.tall ? " tall" : ""}" data-r="${i}"><div class="cell rh${sel && sel.row === i ? " sel-rh" : ""}">${i + 2}</div><div class="cell c-k${isSel(0)}" data-col="0" style="width:var(--w-k)">${esc(r.k)}</div><div class="${vCls}${isSel(1)}" data-col="1" style="width:var(--w-v)">${v}</div><div class="cell filler"></div></div>`;
    });
    for (let k = 0; k < 24; k++) {
      h += `<div class="grid-row empty-row"><div class="cell rh">${rows.length + 2 + k}</div><div class="cell" style="width:var(--w-k)"></div><div class="cell" style="width:var(--w-v)"></div><div class="cell filler"></div></div>`;
    }
    return h + "</div>";
  }

  /* ── Rendering: Market (market-sheet.js) ─────────────── */
  function marketSheet() {
    state.mkW = $("gridArea").clientWidth;
    return window.MarketSheet.html(state.mkW - (small() ? 30 : 36), small());
  }

  function selectMarket(target) {
    const g = $("gridArea");
    g.querySelectorAll(".sel, .sel-rh, .mk-chart.chart-sel").forEach((el) => el.classList.remove("sel", "sel-rh", "chart-sel"));
    const chart = target.closest(".mk-chart");
    if (chart) {
      chart.classList.add("chart-sel");
      state.mkSel = { ref: "Chart " + chart.dataset.chart, f: window.MarketSheet.seriesFormula(+chart.dataset.chart) };
    } else {
      const cell = target.closest(".mk-c[data-ref]");
      if (!cell) return;
      cell.classList.add("sel");
      cell.parentElement.querySelector(".rh")?.classList.add("sel-rh");
      const ref = cell.dataset.ref;
      state.mkSel = { ref, f: window.MarketSheet.formula(ref) };
    }
    updateFormula();
  }

  /* ── Render dispatcher ────────────────────────────────── */
  function render({ keepScroll = true } = {}) {
    compute();
    const g = $("gridArea");
    const top = g.scrollTop, left = g.scrollLeft;
    if (window.FrontSheet && state.sheet !== "front") window.FrontSheet.unmount();
    g.innerHTML = state.sheet === "front" ? window.FrontSheet.html(small())
      : state.sheet === "works" ? worksSheet()
      : state.sheet === "gallery" ? gallerySheet()
      : state.sheet === "market" ? marketSheet()
      : kvSheet();
    if (keepScroll) { g.scrollTop = top; g.scrollLeft = left; } else { g.scrollTop = 0; g.scrollLeft = 0; }
    if (state.sheet === "front") {
      window.FrontSheet.mount(g, {
        refresh: () => { updateStatus(); updateFormula(); },
        renderTabs,
        rerender: () => render({ keepScroll: false }),
      });
    }
    paintSelection();
    renderTabs();
    updateStatus();
    updateFormula();
    if (!$("pane").hidden) updatePanePos();
  }

  function renderTabs() {
    $("sheetTabs").innerHTML = SHEETS.map((s) =>
      `<a href="#${s.key}" class="sheet-tab ${s.key === state.sheet ? "active-tab" : "inactive"}" data-sheet="${s.key}"${s.key === state.sheet ? ' aria-current="page"' : ""}>${s.label}</a>`
    ).join("") + '<span class="sheet-tab add" aria-hidden="true">+</span>';
  }

  function updateStatus() {
    $("statusText").textContent = state.sheet === "front" ? window.FrontSheet.lead() : isFiltered() ? "Filter Mode" : "Ready";
    let info;
    if (state.sheet === "front") {
      info = window.FrontSheet.status();
    } else if (state.sheet === "works" || state.sheet === "gallery") {
      info = isFiltered() ? `${state.view.length} of ${TOTAL} records found` : `Count: ${TOTAL}`;
      if (state.sort) info += ` · Sorted by ${COLS.find((c) => c.key === state.sort.key).label} ${state.sort.dir > 0 ? "↑" : "↓"}`;
    } else if (state.sheet === "market") {
      info = window.MarketSheet.status();
    } else {
      info = `${kvRows().length} rows`;
    }
    $("statusInfo").textContent = info;
  }

  /* ── Selection, name box, formula bar ─────────────────── */
  function ref() {
    if (state.sheet === "works" && state.sel != null) {
      const row = $("gridArea").querySelector(`.work-row[data-id="${state.sel}"]`);
      return row ? letter(state.selCol) + row.dataset.n : "";
    }
    if (state.sheet === "gallery" && state.sel != null) {
      const i = state.view.findIndex((w) => w.id === state.sel);
      return i < 0 ? "" : letter(i % state.galCols) + (Math.floor(i / state.galCols) + 1);
    }
    if (state.sheet === "front") return window.FrontSheet.ref();
    if (state.sheet === "market") return state.mkSel ? state.mkSel.ref : "A1";
    if (state.kvSel) return letter(state.kvSel.col) + (state.kvSel.row + 2);
    return "A1";
  }

  function formulaFor(w, key) {
    switch (key) {
      case "preview": return `=IMAGE("${w.images[0]}")`;
      case "title": return `=HYPERLINK("${w.url}", "${w.title}")`;
      case "year": return w.year;
      case "platform": return w.platform;
      case "type": return w.type;
      case "edition": return w.edition;
      case "description": return w.description.replace(/\s+/g, " ");
      case "link": return `=HYPERLINK("${w.url}")`;
    }
    return "";
  }

  function currentFormula() {
    if ((state.sheet === "works" || state.sheet === "gallery") && state.sel != null) {
      const w = works[state.sel];
      return state.sheet === "gallery" ? formulaFor(w, "preview") : formulaFor(w, COLS[state.selCol].key);
    }
    if ((state.sheet === "about" || state.sheet === "contact") && state.kvSel) {
      const r = kvRows()[state.kvSel.row];
      if (state.kvSel.col === 0) return r.k;
      if (r.f) return r.f;
      if (r.href) return `=HYPERLINK("${r.href}", "${r.v}")`;
      return String(r.v);
    }
    if (state.sheet === "front") return window.FrontSheet.formula();
    if (state.sheet === "market") {
      if (state.mkSel) return state.mkSel.f;
      return '="Sales and forecasts for Gregory Nikshumika"';
    }
    return `="Selected works by Gregory Nikshumika, ${Math.min(...years)}–${Math.max(...years)}"`;
  }

  function updateFormula() {
    const input = $("formulaContent");
    const searching = !!state.query || document.activeElement === input && input.dataset.typed === "1";
    $("nameBox").textContent = searching ? "FILTER" : (ref() || "A1");
    input.closest(".formula-bar").classList.toggle("searching", searching);
    if (!searching && document.activeElement !== input) input.value = currentFormula();
  }

  function paintSelection() {
    const g = $("gridArea");
    g.querySelectorAll(".sel, .sel-rh, .work-row.active").forEach((el) => el.classList.remove("sel", "sel-rh", "active"));
    if (state.sheet === "works" && state.sel != null) {
      const row = g.querySelector(`.work-row[data-id="${state.sel}"]`);
      if (row) {
        row.classList.add("active");
        row.querySelector(".rh").classList.add("sel-rh");
        row.querySelector(`[data-col="${state.selCol}"]`)?.classList.add("sel");
        g.querySelector(`.col-headers .col-h[data-col="${state.selCol}"]`)?.classList.add("sel");
      }
    } else if (state.sheet === "gallery" && state.sel != null) {
      const tile = g.querySelector(`.tile[data-id="${state.sel}"]`);
      if (tile) {
        tile.classList.add("sel");
        const i = +tile.dataset.i;
        g.querySelector(`.gal-cols .col-h[data-col="${i % state.galCols}"]`)?.classList.add("sel");
        g.querySelector(`.gal-rh [data-r="${Math.floor(i / state.galCols)}"]`)?.classList.add("sel-rh");
      }
    }
  }

  function selectWork(id, { col = state.selCol, open = true, scroll = false } = {}) {
    state.sel = id;
    state.selCol = col;
    paintSelection();
    updateFormula();
    if (open) openPane(id);
    if (scroll) {
      const el = $("gridArea").querySelector(`.work-row[data-id="${id}"], .tile[data-id="${id}"]`);
      el?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  function step(delta) {
    if (!state.view.length) return;
    let i = state.view.findIndex((w) => w.id === state.sel);
    i = i < 0 ? 0 : Math.min(state.view.length - 1, Math.max(0, i + delta));
    selectWork(state.view[i].id, { open: !$("pane").hidden, scroll: true });
  }

  /* ── Task pane ────────────────────────────────────────── */
  function openPane(id) {
    const w = works[id];
    const handles = ["0% 0%", "50% 0%", "100% 0%", "0% 50%", "100% 50%", "0% 100%", "50% 100%", "100% 100%"]
      .map((p) => { const [x, y] = p.split(" "); return `<i class="h" style="left:${x};top:${y}"></i>`; }).join("");
    const rows = [
      ["Year", esc(w.year)],
      ["Platform", esc(w.platform === "Tezos" ? "Tezos · objkt" : "Ethereum · SuperRare")],
      ["Type", esc(w.type), w.type !== "Image" ? `cf-${w.type.toLowerCase()}` : ""],
      w.series ? ["Series", `${w.series} works`] : null,
      ["Edition", w.edition === "1/1" ? "1/1" : w.editions ? `Edition of ${w.editions}` : "—"],
    ].filter(Boolean);
    const verb = w.interactive ? "Experience it" : "View";
    $("paneBody").innerHTML = `
      <div class="picture${w.images.length > 1 ? " multi" : ""}">
        ${w.images.map((src) => `<span class="pixwrap" data-cols="64"><img src="${esc(src)}" alt="${esc(w.title)}"></span>`).join("")}
        ${handles}<i class="rot"></i>
      </div>
      <h2>${esc(w.title)}</h2>
      <div class="kv">${rows.map(([k, v, c]) => `<div><span>${k}</span><span class="${c || ""}">${v}</span></div>`).join("")}</div>
      ${w.description ? `<p class="desc">${esc(w.description)}</p>` : ""}
      <a class="open-link" href="${esc(w.url)}" target="_blank" rel="noopener">${verb} on ${w.platform === "SuperRare" ? "SuperRare" : "objkt"} ↗</a>`;
    $("paneBody").scrollTop = 0;
    const wasHidden = $("pane").hidden;
    $("pane").hidden = false;
    updatePanePos();
    if (wasHidden && state.sheet === "gallery") requestAnimationFrame(relayoutGallery);
  }

  function updatePanePos() {
    const i = state.view.findIndex((w) => w.id === state.sel);
    $("paneRef").textContent = ref() || "—";
    $("panePos").textContent = i < 0 ? "filtered out" : `${i + 1} / ${state.view.length}`;
  }

  function closePane() {
    $("pane").hidden = true;
    if (state.sheet === "gallery") requestAnimationFrame(relayoutGallery);
  }

  function randomWork() {
    if (!state.view.length) return;
    if (state.sheet !== "works" && state.sheet !== "gallery") go("works");
    const pool = state.view.filter((w) => w.id !== state.sel);
    const w = pool[Math.floor(Math.random() * pool.length)] || state.view[0];
    selectWork(w.id, { scroll: true });
  }

  /* ── Sheets & navigation ──────────────────────────────── */
  function go(sheet) {
    if (sheet === "contact") sheet = "about";
    if (!SHEETS.some((s) => s.key === sheet)) sheet = "works";
    const workSheet = sheet === "works" || sheet === "gallery";
    if (!workSheet && !$("pane").hidden) { state.paneWasOpen = true; $("pane").hidden = true; }
    state.sheet = sheet;
    state.kvSel = null;
    state.mkSel = null;
    if (location.hash !== "#" + sheet) history.replaceState(null, "", "#" + sheet);
    render({ keepScroll: false });
    if (workSheet && state.paneWasOpen && state.sel != null) { state.paneWasOpen = false; openPane(state.sel); }
    if (state.sel != null && (sheet === "works" || sheet === "gallery")) {
      $("gridArea").querySelector(`[data-id="${state.sel}"]`)?.scrollIntoView({ block: "nearest" });
    }
  }

  function relayoutGallery() {
    if (state.sheet === "gallery" && galleryColumns() !== state.galCols) render();
  }

  /* ── Sorting & filtering ──────────────────────────────── */
  function setSort(sort) { state.sort = sort; render(); }
  function clearAll() {
    state.filters = {};
    state.query = "";
    $("formulaContent").dataset.typed = "";
    render();
  }

  function openFilter(key, btn) {
    closeMenus();
    const col = COLS.find((c) => c.key === key);
    const pool = works.filter((w) => passes(w, key));
    const counts = new Map();
    pool.forEach((w) => counts.set(String(w[key]), (counts.get(String(w[key])) || 0) + 1));
    const values = [...counts.keys()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const cur = state.filters[key];
    const asc = col.numeric ? "Sort Smallest to Largest" : "Sort A to Z";
    const desc = col.numeric ? "Sort Largest to Smallest" : "Sort Z to A";
    const drop = $("filterDrop");
    drop.innerHTML = `
      <button type="button" class="mi" data-sort="1"><span class="chk">${state.sort?.key === key && state.sort.dir === 1 ? "✓" : "↑"}</span>${asc}</button>
      <button type="button" class="mi" data-sort="-1"><span class="chk">${state.sort?.key === key && state.sort.dir === -1 ? "✓" : "↓"}</span>${desc}</button>
      <div class="msep"></div>
      <button type="button" class="mi" data-clear ${cur ? "" : "disabled"}><span class="chk">${FUNNEL}</span>Clear Filter From “${col.label}”</button>
      <div class="msep"></div>
      <input type="search" class="fd-search" placeholder="Search" aria-label="Search values">
      <div class="fd-list">
        <label><input type="checkbox" data-all> (Select All)</label>
        ${values.map((v) => `<label data-v="${esc(v.toLowerCase())}"><input type="checkbox" value="${esc(v)}" ${!cur || cur.has(v) ? "checked" : ""}> <span class="ellip">${esc(v)}</span><span class="n">${counts.get(v)}</span></label>`).join("")}
      </div>
      <div class="fd-actions"><button type="button" class="mode-btn active" data-ok>OK</button><button type="button" class="mode-btn" data-cancel>Cancel</button></div>`;
    const boxes = () => [...drop.querySelectorAll(".fd-list input[value]")];
    const all = drop.querySelector("[data-all]");
    const syncAll = () => {
      const vis = boxes().filter((b) => b.closest("label").style.display !== "none");
      const n = vis.filter((b) => b.checked).length;
      all.checked = n === vis.length && n > 0;
      all.indeterminate = n > 0 && n < vis.length;
    };
    syncAll();
    all.addEventListener("change", () => boxes().forEach((b) => { if (b.closest("label").style.display !== "none") b.checked = all.checked; }));
    drop.querySelector(".fd-list").addEventListener("change", (e) => { if (e.target.value !== undefined && !e.target.dataset.all) syncAll(); });
    drop.querySelector(".fd-search").addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      boxes().forEach((b) => {
        const lab = b.closest("label");
        const show = !q || lab.dataset.v.includes(q);
        lab.style.display = show ? "" : "none";
        b.checked = show;   // like Excel: searching selects only the matches
      });
      syncAll();
    });
    drop.onclick = (e) => {
      const t = e.target.closest("button");
      if (!t) return;
      if (t.dataset.sort) { closeMenus(); setSort({ key, dir: +t.dataset.sort }); }
      else if (t.hasAttribute("data-clear")) { delete state.filters[key]; closeMenus(); render(); }
      else if (t.hasAttribute("data-cancel")) closeMenus();
      else if (t.hasAttribute("data-ok")) {
        const checked = boxes().filter((b) => b.checked).map((b) => b.value);
        if (checked.length === values.length) delete state.filters[key];
        else state.filters[key] = new Set(checked);
        closeMenus();
        render();
      }
    };
    btn.classList.add("open");
    placeMenu(drop, btn.getBoundingClientRect());
    drop.querySelector(".fd-search").focus({ preventScroll: true });
  }

  /* ── Ribbon menus ─────────────────────────────────────── */
  const ext = (label, href) => ({ label, href, kbd: "↗" });
  // Quick filters replace whatever was filtered before, so "Only X" shows exactly X
  const only = (label, key, value) => ({
    label,
    check: Object.keys(state.filters).length === 1 && state.filters[key]?.size === 1 && state.filters[key].has(value) && !state.query,
    act: () => { state.filters = { [key]: new Set([value]) }; state.query = ""; $("formulaContent").dataset.typed = ""; render(); },
  });
  const MENUS = {
    file: () => [
      ext("SuperRare profile", "https://superrare.com/gregorynikshumika"),
      ext("objkt profile", "https://objkt.com/@gregnikshumika.bsky.social/created"),
      ext("X", "https://x.com/GregNikshumika"),
      ext("Bluesky", "https://bsky.app/profile/gregnikshumika.bsky.social"),
      { label: "Email", href: "mailto:gregorynikshumika@gmail.com", kbd: "✉" },
      "-",
      { label: "About this workbook", act: () => go("about") },
      { label: "Contact", act: () => { go("about"); [...$("gridArea").querySelectorAll(".kv-section")].find((r) => r.textContent.trim() === "Contact")?.scrollIntoView({ block: "start" }); } },
    ],
    home: () => [
      { label: "Random work", kbd: "R", act: randomWork },
      "-",
      { label: "Clear all filters", disabled: !isFiltered(), act: clearAll },
    ],
    data: () => [
      { label: "Sort newest → oldest", check: !state.sort, act: () => setSort(null) },
      { label: "Sort oldest → newest", check: state.sort?.key === "year" && state.sort.dir === 1, act: () => setSort({ key: "year", dir: 1 }) },
      { label: "Sort title A → Z", check: state.sort?.key === "title" && state.sort.dir === 1, act: () => setSort({ key: "title", dir: 1 }) },
      "-",
      only("Only interactive works", "type", "Interactive"),
      only("Only SuperRare", "platform", "SuperRare"),
      only("Only Tezos", "platform", "Tezos"),
      "-",
      { label: "Clear all filters", disabled: !isFiltered(), act: clearAll },
    ],
    view: () => [
      ...SHEETS.map((s) => ({ label: `${s.label} sheet`, check: state.sheet === s.key, act: () => go(s.key) })),
      "-",
      { label: "Artwork pane", check: !$("pane").hidden, act: () => ($("pane").hidden ? (state.sel != null ? openPane(state.sel) : randomWork()) : closePane()) },
      ...(window.MarketSheet ? ["-", ...window.MarketSheet.CURRENCIES.map(([c, n]) => ({
        label: `Market prices in ${n}`, check: state.sheet === "market" && window.MarketSheet.currency() === c, act: () => setCurrency(c),
      }))] : []),
    ],
  };
  let menuItems = [];

  function openMenu(name, tab) {
    const wasOpen = tab.classList.contains("open");
    closeMenus();
    if (wasOpen) return;
    menuItems = MENUS[name]();
    const drop = $("menuDrop");
    drop.innerHTML = menuItems.map((m, i) => m === "-" ? '<div class="msep"></div>'
      : m.href ? `<a class="mi" role="menuitem" href="${m.href}"${m.href.startsWith("mailto:") ? "" : ' target="_blank" rel="noopener"'}><span class="chk"></span>${m.label}<span class="kbd">${m.kbd}</span></a>`
      : `<button type="button" class="mi" role="menuitemcheckbox" aria-checked="${!!m.check}" data-i="${i}" ${m.disabled ? "disabled" : ""}><span class="chk">${m.check ? "✓" : ""}</span>${m.label}${m.kbd ? `<span class="kbd">${m.kbd}</span>` : ""}</button>`
    ).join("");
    tab.classList.add("open");
    placeMenu(drop, tab.getBoundingClientRect());
    drop.querySelector(".mi:not(:disabled)")?.focus({ preventScroll: true });
  }

  function placeMenu(drop, rect) {
    drop.classList.add("open");
    const w = drop.offsetWidth;
    drop.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - w - 8)) + "px";
    drop.style.top = rect.bottom + 1 + "px";
  }

  function closeMenus() {
    document.querySelectorAll(".menu-drop.open").forEach((d) => d.classList.remove("open"));
    document.querySelectorAll(".ribbon-tabs .open, .af.open").forEach((t) => t.classList.remove("open"));
  }

  /* ── Events ───────────────────────────────────────────── */
  $("menuDrop").addEventListener("click", (e) => {
    const b = e.target.closest("button.mi");
    const a = e.target.closest("a.mi");
    if (a) { closeMenus(); return; }
    if (!b) return;
    const m = menuItems[+b.dataset.i];
    closeMenus();
    m?.act?.();
  });

  $("ribbonTabs").addEventListener("click", (e) => {
    const t = e.target.closest("[data-menu]");
    if (t) openMenu(t.dataset.menu, t);
  });
  $("ribbonTabs").addEventListener("keydown", (e) => {
    const t = e.target.closest("[data-menu]");
    if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openMenu(t.dataset.menu, t); }
  });

  document.addEventListener("pointerdown", (e) => {
    if (!e.target.closest(".menu-drop, .ribbon-tabs [data-menu], .af")) closeMenus();
  });

  $("gridArea").addEventListener("click", (e) => {
    const af = e.target.closest(".af");
    if (af) { e.stopPropagation(); af.classList.contains("open") ? closeMenus() : openFilter(af.dataset.filter, af); return; }
    if (e.target.closest("a")) return;
    if (state.sheet === "market") {
      if (e.target.closest("[data-reset]")) { window.MarketSheet.reset(); render(); return; }
      selectMarket(e.target);
      return;
    }
    const row = e.target.closest(".work-row");
    if (row) {
      const cell = e.target.closest("[data-col]");
      selectWork(+row.dataset.id, { col: cell ? +cell.dataset.col : state.selCol });
      return;
    }
    const tile = e.target.closest(".tile[data-id]");
    if (tile) { selectWork(+tile.dataset.id); return; }
    const kv = e.target.closest(".kv-row");
    if (kv) {
      const cell = e.target.closest("[data-col]");
      state.kvSel = { row: +kv.dataset.r, col: cell ? +cell.dataset.col : 1 };
      const g = $("gridArea");
      g.querySelectorAll(".sel, .sel-rh").forEach((el) => el.classList.remove("sel", "sel-rh"));
      kv.querySelector(`[data-col="${state.kvSel.col}"]`)?.classList.add("sel");
      kv.querySelector(".rh").classList.add("sel-rh");
      g.querySelector(`.col-headers .col-h[data-col="${state.kvSel.col}"]`)?.classList.add("sel");
      updateFormula();
    }
  });

  // Column resizing on the Works sheet (drag the edge of a column letter)
  $("gridArea").addEventListener("pointerdown", (e) => {
    const h = e.target.closest(".col-resize-handle");
    if (!h) return;
    e.preventDefault();
    const key = h.dataset.key;
    const start = h.parentElement.getBoundingClientRect().width;
    const x0 = e.clientX;
    h.classList.add("dragging");
    const move = (ev) => document.documentElement.style.setProperty(`--w-${key}`, Math.max(36, Math.round(start + ev.clientX - x0)) + "px");
    const up = () => { h.classList.remove("dragging"); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  });

  // Market: scenario inputs recalculate the forecast
  $("gridArea").addEventListener("focusin", (e) => { if (e.target.matches(".mk-in")) { selectMarket(e.target); e.target.select(); } });
  function setCurrency(c) {
    window.MarketSheet.setCurrency(c);
    if (state.sheet !== "market") go("market"); else render();
  }
  $("gridArea").addEventListener("change", (e) => {
    const t = e.target;
    if (t.matches(".mk-cur")) { setCurrency(t.value); return; }
    if (!t.matches(".mk-in")) return;
    window.MarketSheet.setInput(t.dataset.s, t.dataset.k, t.value);
    const ref = t.closest("[data-ref]").dataset.ref;
    render();
    $("gridArea").querySelector(`[data-ref="${ref}"]`)?.classList.add("sel");
  });
  $("gridArea").addEventListener("keydown", (e) => {
    if (e.target.matches(".mk-in") && (e.key === "Enter" || e.key === "Escape")) e.target.blur();
  });

  // Chart tooltips
  const tip = $("chartTip");
  $("gridArea").addEventListener("pointermove", (e) => {
    const hit = e.target.closest("[data-tip]");
    $("gridArea").querySelectorAll(".hit.hot").forEach((h) => h !== hit && h.classList.remove("hot"));
    if (!hit) { tip.hidden = true; return; }
    hit.classList.add("hot");
    if (tip.dataset.for !== hit.dataset.tip) { tip.innerHTML = hit.dataset.tip; tip.dataset.for = hit.dataset.tip; }
    tip.hidden = false;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let x = e.clientX + 14, y = e.clientY + 14;
    if (x + w > window.innerWidth - 8) x = e.clientX - w - 14;
    if (y + h > window.innerHeight - 8) y = e.clientY - h - 14;
    tip.style.left = Math.max(8, x) + "px";
    tip.style.top = Math.max(8, y) + "px";
  });
  $("gridArea").addEventListener("pointerleave", () => { tip.hidden = true; });
  $("gridArea").addEventListener("scroll", () => { tip.hidden = true; }, { passive: true });

  $("sheetTabs").addEventListener("click", (e) => {
    const t = e.target.closest("[data-sheet]");
    if (!t) return;
    e.preventDefault();
    go(t.dataset.sheet);
  });

  $("paneClose").onclick = closePane;
  $("panePrev").onclick = () => step(-1);
  $("paneNext").onclick = () => step(1);
  $("btnRandom").onclick = randomWork;

  // Formula bar: shows the selected cell; typing turns it into a search
  const input = $("formulaContent");
  function parseQuery(v) {
    let q = v.trim();
    if (q.startsWith("=")) {
      const m = q.slice(1).match(/^\s*\w*\s*\(\s*"?([^"]*)"?\s*\)?\s*$/);
      q = m ? m[1] : q.slice(1);
    }
    return q.trim();
  }
  input.addEventListener("focus", () => { if (!state.query) input.select(); });
  input.addEventListener("input", () => {
    input.dataset.typed = "1";
    state.query = parseQuery(input.value);
    if (state.sheet !== "works" && state.sheet !== "gallery") { state.sheet = "works"; history.replaceState(null, "", "#works"); }
    render();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { input.value = ""; input.dataset.typed = ""; state.query = ""; render(); input.blur(); }
    if (e.key === "Enter") { input.blur(); if (state.view.length === 1) selectWork(state.view[0].id); }
  });
  input.addEventListener("blur", () => { if (!state.query) { input.dataset.typed = ""; } updateFormula(); });

  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return;
    if (e.key === "Escape") {
      if (document.querySelector(".menu-drop.open")) closeMenus();
      else if (!$("pane").hidden) closePane();
      return;
    }
    if (document.querySelector(".menu-drop.open") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (state.sheet === "front") return;   // front-sheet.js has its own keys
    const onWorks = state.sheet === "works", onGal = state.sheet === "gallery";
    if (onWorks || onGal) {
      const n = onGal ? state.galCols : 1;
      if (e.key === "ArrowDown") { e.preventDefault(); step(n); }
      else if (e.key === "ArrowUp") { e.preventDefault(); step(-n); }
      else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (onGal) step(1);
        else if (state.sel != null) { state.selCol = Math.min(COLS.length - 1, state.selCol + 1); paintSelection(); updateFormula(); }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (onGal) step(-1);
        else if (state.sel != null) { state.selCol = Math.max(0, state.selCol - 1); paintSelection(); updateFormula(); }
      } else if (e.key === "Enter" && state.sel != null) openPane(state.sel);
    }
    if (e.key === "r" || e.key === "R") randomWork();
  });

  window.addEventListener("hashchange", () => go(location.hash.slice(1)));
  new ResizeObserver(() => {
    relayoutGallery();
    if (state.sheet === "market" && Math.abs($("gridArea").clientWidth - state.mkW) > 8) render();
  }).observe($("gridArea"));
  window.addEventListener("resize", closeMenus);

  /* ── Start ────────────────────────────────────────────── */
  const startHash = location.hash.slice(1) === "contact" ? "about" : location.hash.slice(1);
  state.sheet = SHEETS.some((s) => s.key === startHash) ? startHash : SHEETS[0].key;
  render({ keepScroll: false });
  if (!small() && works.length && (state.sheet === "works" || state.sheet === "gallery")) {
    selectWork(works[0].id, { col: 1 });
  }
})();
