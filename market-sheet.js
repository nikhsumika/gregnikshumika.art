/* Market sheet for portfolio.nksh (collector-facing): sales summary, charts and
   an outlook. The outlook's assumptions are not shown on the page; they live in
   scripts/build_market.py and MARKET-NOTES.md. History can be shown in USD, ETH or
   XTZ (each sale valued on its own date). The forecast is built in USD and
   converted with assumed coin growth rates.
   Data: window.MARKET from scripts/build_market.py. app.js calls
   MarketSheet.html() / .formula() / .setInput() / .setCurrency(). */
(() => {
  "use strict";
  const ALL = window.MARKET;
  if (!ALL || !ALL.views) return;

  const CURS = ["usd", "eth", "xtz"];
  const NAME = { usd: "USD", eth: "ETH", xtz: "XTZ" };
  let cur = "usd";
  try { const c = localStorage.getItem("nksh-currency"); if (CURS.includes(c)) cur = c; } catch (e) { /* storage blocked */ }
  const V = () => ALL.views[cur];
  const COLM = () => ({ usd: "F", eth: "I", xtz: "J" })[cur];   // money column on the imaginary Sales sheet

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const letter = (i) => String.fromCharCode(65 + i);
  const C = { usd: "#217346", eth: "#ED7D31", xtz: "#4472C4", tz: "#4472C4", avg: "#595959",
    range: "#8c8c8c", grid: "#e6e6e6", axis: "#bfbfbf" };

  /* ── Formatting ───────────────────────────────────────── */
  const sig = (v, d = 2) => {
    const a = Math.abs(v);
    if (a >= 1000) return Math.round(v).toLocaleString("en-US");
    if (a >= 100) return v.toFixed(0);
    if (a >= 10) return v.toFixed(1).replace(/\.0$/, "");
    if (a >= 1) return v.toFixed(2);
    if (a === 0) return "0";
    return v.toPrecision(d).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  };
  const big = (v, f) => {   // 1.2M / 3.4B for very large values
    const a = Math.abs(v);
    if (a >= 1e9) return f((v / 1e9).toFixed(1).replace(/\.0$/, "")) + "B";
    if (a >= 1e6) return f((v / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace(/\.0$/, "")) + "M";
    return null;
  };
  const usd = (v) => big(v, (x) => "$" + x) ?? (Math.abs(v) >= 100 ? "$" + Math.round(v).toLocaleString("en-US") : Math.abs(v) >= 10 ? "$" + v.toFixed(0) : "$" + v.toFixed(2));
  const fmt = {
    usd,
    eth: (v) => big(v, (x) => "Ξ" + x) ?? "Ξ" + sig(v),
    xtz: (v) => (big(v, (x) => x) ?? sig(v, 2)) + " ꜩ",
  };
  const money = (v, c = cur) => (v == null || !isFinite(v) ? "—" : fmt[c](v));
  const pct = (v, plus = true) => (v > 0 && plus ? "+" : v < 0 ? "−" : "") + Math.round(Math.abs(v) * 100) + "%";
  const times = (x) => (x >= 100 ? Math.round(x).toLocaleString("en-US") : x >= 10 ? x.toFixed(0) : x >= 1 ? x.toFixed(1) : x.toFixed(2)) + "×";
  const int = (v) => Math.round(v).toLocaleString("en-US");
  const monthName = (m) => new Date(m + "-15").toLocaleString("en-US", { month: "short" });

  /* ── Forecast model (USD first) ───────────────────────── */
  // Price level: growth starts at g0 a year and fades toward gL with an
  // e-folding time of `fade` years.
  //   M(t) = exp(t·ln(1+gL) + (ln(1+g0) − ln(1+gL))·fade·(1 − e^(−t/fade)))
  // Tezos catch-up: a whole Tezos work (all its editions summed) moves from its
  // current share of a SuperRare 1/1 toward a target share; single editions
  // and Tezos sales volume rise with it.  U(t) = (target/now)^(1 − e^(−t/years))
  // Conversion: value in ETH/XTZ = USD / (coin price today · (1+coin growth)^t)
  const F = ALL.forecast;
  const fresh = () => ({
    scen: F.scenarios.map((s) => ({ ...s })),
    coin: { eth: ALL.coins.eth.growth, xtz: ALL.coins.xtz.growth },
    catchUp: { target: F.catchUp.target, years: F.catchUp.years },
  });
  let A = fresh();
  const HORIZONS = [10, 20, 50];
  const LABEL = { bear: "Conservative", base: "Base", bull: "Optimistic" };
  const now = new Date(ALL.asOf);
  const yearNow = now.getFullYear() + (now.getMonth() + 0.5) / 12;

  function mult(s, t) {
    const l0 = Math.log(1 + s.g0), lL = Math.log(1 + s.gL), f = Math.max(0.1, s.fade);
    return Math.exp(t * lL + (l0 - lL) * f * (1 - Math.exp(-t / f)));
  }
  const uplift = (t) => Math.pow(A.catchUp.target / F.catchUp.now, 1 - Math.exp(-t / Math.max(0.1, A.catchUp.years)));
  const coinAt = (c, t) => (c === "usd" ? 1 : ALL.coins[c].now * Math.pow(1 + A.coin[c], t));
  const conv = (usdV, t, c = cur) => usdV / coinAt(c, t);
  function usdAt(key, s, t) {
    const b = F.base.find((x) => x.key === key).usd;
    if (key === "sr") return b * mult(s, t);
    if (key === "vol") return (F.volTz * uplift(t) + F.volEth) * mult(s, t);
    return b * mult(s, t) * uplift(t);
  }

  /* ── Grid building ────────────────────────────────────── */
  // Columns: A label, B–G numbers, H notes. Widths live in CSS (--m-a, --m-n, --m-h).
  const COLW = ["var(--m-a)", ...Array(6).fill("var(--m-n)"), "var(--m-h)"];
  const span = (a, b) => `calc(${COLW.slice(a, b + 1).join(" + ")})`;
  let rowN, cellsF;

  function row(cells, cls = "") {
    const n = ++rowN;
    let col = 0, h = "";
    for (const c of cells) {
      const w = c.span || 1;
      const ref = letter(col) + n;
      if (c.v != null && c.v !== "" || c.input) cellsF[ref] = c.f ?? String(c.v);
      const classes = ["cell", "mk-c", c.cls || "", c.num ? "num" : ""].join(" ");
      let body;
      if (c.input) body = `<input class="mk-in" data-s="${c.input.s}" data-k="${c.input.k}" value="${esc(c.v)}" aria-label="${esc(c.input.label)}" inputmode="decimal" spellcheck="false">`;
      else if (c.select) body = `<select class="mk-cur" aria-label="Show prices in">${CURS.map((x) => `<option value="${x}"${x === cur ? " selected" : ""}>${NAME[x]}</option>`).join("")}</select>`;
      else body = c.html ?? esc(c.v ?? "");
      h += `<div class="${classes}" data-ref="${ref}" style="width:${span(col, col + w - 1)}">${body}</div>`;
      col += w;
    }
    while (col < 8) { h += `<div class="cell mk-c" style="width:${COLW[col]}"></div>`; col++; }
    return `<div class="grid-row mk-row ${cls}"><div class="cell rh">${n}</div>${h}<div class="cell filler"></div></div>`;
  }
  const blank = () => row([]);
  const head = (labels, cls = "") => row(labels.map((l) => (typeof l === "string" ? { v: l, cls: "mk-h" } : { ...l, cls: "mk-h " + (l.cls || "") })), "mk-head " + cls);
  const section = (title, sub) => row([{ v: title, cls: "mk-title", span: 3 }, { v: sub || "", cls: "mk-sub", span: 5 }], "mk-section");

  function block(rows, inner) {
    const start = rowN + 1;
    rowN += rows;
    const nums = Array.from({ length: rows }, (_, i) => `<div>${start + i}</div>`).join("");
    return `<div class="mk-block" style="--rows:${rows}"><div class="mk-rh">${nums}</div><div class="mk-canvas">${inner}</div></div>`;
  }

  /* ── SVG helpers ──────────────────────────────────────── */
  function niceTicks(max, n = 4) {
    const raw = max / n, mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
    const out = [];
    for (let i = 0; i * step <= max + step * 0.001; i++) out.push(+(i * step).toPrecision(6));
    if (out[out.length - 1] < max) out.push(+(out.length * step).toPrecision(6));
    return out;
  }
  const axisMoney = (v) => (cur === "usd"
    ? (v >= 1000 ? "$" + (v / 1000).toLocaleString("en-US") + "K" : "$" + v)
    : cur === "eth" ? "Ξ" + sig(v) : (v >= 1000 ? v / 1000 + "K" : sig(v)) + " ꜩ");
  function colPath(x, y, w, h, round) {   // column: square at the baseline, 4px round top
    if (h <= 0) return "";
    const r = round ? Math.min(4, w / 2, h) : 0;
    return `M${x},${y + h}V${y + r}${r ? `Q${x},${y} ${x + r},${y}` : ""}H${x + w - r}${r ? `Q${x + w},${y} ${x + w},${y + r}` : ""}V${y + h}Z`;
  }
  const keyMark = (color, line) => `<span class="tk${line ? " line" : ""}" style="--c:${color}"></span>`;
  const tipRow = (color, label, value, line) => `<div>${keyMark(color, line)}<span>${esc(label)}</span><b>${value}</b></div>`;
  const legendItem = (color, label, line, dash) => `<span><span class="tk${line ? " line" : ""}${dash ? " dash" : ""}" style="--c:${color}"></span>${esc(label)}</span>`;
  const HANDLES = ["0% 0%", "50% 0%", "100% 0%", "0% 50%", "100% 50%", "0% 100%", "50% 100%", "100% 100%"]
    .map((p) => { const [x, y] = p.split(" "); return `<i class="h" style="left:${x};top:${y}"></i>`; }).join("");

  function card(id, title, subtitle, svg, legend) {
    return `<figure class="mk-chart" data-chart="${id}">
      <figcaption><b>${esc(title)}</b>${subtitle ? `<span>${subtitle}</span>` : ""}</figcaption>
      ${svg}${legend ? `<div class="mk-legend">${legend}</div>` : ""}${HANDLES}</figure>`;
  }

  /* Chart 1: number of sales by month, stacked by chain, with a 3-month moving average.
     Counts, not money, so the monthly figures don't add up to a total. */
  function chartMonthly(W) {
    const H = 250, L = 44, R = 14, T = 12, B = 26;
    const data = ALL.monthly, n = data.length;
    const tot = data.map((d) => d.ntz + d.neth);
    const avg = tot.map((_, i) => (i < 2 ? null : (tot[i] + tot[i - 1] + tot[i - 2]) / 3));
    const ticks = niceTicks(Math.max(...tot));
    const top = ticks[ticks.length - 1];
    const pw = W - L - R, ph = H - T - B, band = pw / n;
    const bw = Math.max(3, Math.min(24, band * 0.68));
    const y = (v) => T + ph - (v / top) * ph;
    let s = `<svg class="mk-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Number of sales by month, ${data[0].m} to ${data[n - 1].m}">`;
    ticks.forEach((t) => { s += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" stroke="${t ? C.grid : C.axis}"/><text x="${L - 6}" y="${y(t) + 3.5}" class="ax" text-anchor="end">${int(t)}</text>`; });
    const every = band < 20 ? 6 : band < 46 ? 3 : 1;   // month labels need ~45px each
    data.forEach((d, i) => {
      const x = L + i * band + (band - bw) / 2;
      const hTz = (d.ntz / top) * ph, hEth = (d.neth / top) * ph, base = T + ph;
      s += `<path d="${colPath(x, base - hTz, bw, hTz, !d.neth)}" fill="${C.tz}"/>`;
      if (d.neth) s += `<path d="${colPath(x, base - hTz - hEth - (hTz ? 2 : 0), bw, Math.max(hEth, 3), true)}" fill="${C.eth}"/>`;
      const mm = +d.m.slice(5);
      if ((mm - 1) % every === 0) s += `<text x="${L + i * band + band / 2}" y="${H - 8}" class="ax" text-anchor="middle">${monthName(d.m)}${mm === 1 || i === 0 ? " ’" + d.m.slice(2, 4) : ""}</text>`;
    });
    s += `<polyline points="${avg.map((v, i) => (v == null ? null : `${L + i * band + band / 2},${y(v)}`)).filter(Boolean).join(" ")}" fill="none" stroke="${C.avg}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    const pk = tot.indexOf(Math.max(...tot));
    s += `<text x="${L + pk * band + band / 2 + bw / 2 + 4}" y="${y(tot[pk]) + 10}" class="lbl">${int(tot[pk])} sales</text>`;
    data.forEach((d, i) => {
      const tip = `<div class="tt-h">${monthName(d.m)} ${d.m.slice(0, 4)}</div>${tipRow(C.tz, "Tezos", int(d.ntz))}${d.neth ? tipRow(C.eth, "Ethereum", int(d.neth)) : ""}${avg[i] != null ? tipRow(C.avg, "3-month average", avg[i].toFixed(0), true) : ""}`;
      s += `<rect class="hit" x="${L + i * band}" y="${T}" width="${band}" height="${ph}" data-tip="${esc(tip)}"/>`;
    });
    s += "</svg>";
    const legend = legendItem(C.tz, "Tezos") + legendItem(C.eth, "Ethereum") + legendItem(C.avg, "3-month average", true);
    return card(1, "Sales by month", "Number of sales", s, legend);
  }

  /* Chart 2: normalized price index in USD, ETH and XTZ, with exponential trendlines */
  function chartIndex(W) {
    const H = 250, L = 44, R = 84, T = 14, B = 26;
    const d = ALL.index, n = d.length;
    const ticks = niceTicks(Math.max(...d.flatMap((p) => CURS.map((c) => p[c]))));
    const top = ticks[ticks.length - 1];
    const pw = W - L - R, ph = H - T - B;
    const x = (i) => L + (n === 1 ? pw / 2 : (i / (n - 1)) * pw);
    const y = (v) => T + ph - (v / top) * ph;
    let s = `<svg class="mk-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Normalized price index by quarter in USD, ETH and XTZ, first quarter = 100">`;
    ticks.forEach((t) => { s += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" stroke="${t ? C.grid : C.axis}"/><text x="${L - 6}" y="${y(t) + 3.5}" class="ax" text-anchor="end">${t}</text>`; });
    d.forEach((p, i) => { if (i % (pw / n < 60 ? 2 : 1) === 0) s += `<text x="${x(i)}" y="${H - 8}" class="ax" text-anchor="middle">${p.q.replace(/^20(\d\d) (Q\d)/, "$2 ’$1")}</text>`; });
    const order = CURS.slice().sort((a, b) => (a === cur ? 1 : 0) - (b === cur ? 1 : 0));   // selected currency on top
    for (const k of order) {
      const tr = ALL.trend[k], col = C[k], on = k === cur;
      const tl = Array.from({ length: 41 }, (_, j) => { const xi = (j / 40) * (n - 1); return `${x(xi)},${y(tr.a * Math.exp(tr.b * xi))}`; });
      s += `<polyline points="${tl.join(" ")}" fill="none" stroke="${col}" stroke-width="1.25" stroke-dasharray="2 3" opacity="${on ? 0.9 : 0.5}"/>`;
      s += `<polyline points="${d.map((p, i) => `${x(i)},${y(p[k])}`).join(" ")}" fill="none" stroke="${col}" stroke-width="${on ? 2.5 : 2}" stroke-linejoin="round" stroke-linecap="round" opacity="${on ? 1 : 0.75}"/>`;
      d.forEach((p, i) => { s += `<circle cx="${x(i)}" cy="${y(p[k])}" r="4" fill="${col}" stroke="#fff" stroke-width="2"/>`; });
    }
    const last = d[n - 1];
    const ends = CURS.map((c) => ({ c, y: y(last[c]) })).sort((a, b) => a.y - b.y);
    for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 13) ends[i].y = ends[i - 1].y + 13;
    ends.forEach((e) => { s += `<text x="${x(n - 1) + 9}" y="${e.y + 4}" class="lbl">In ${NAME[e.c]} ${Math.round(last[e.c])}</text>`; });
    d.forEach((p, i) => {
      const tip = `<div class="tt-h">${p.q}</div>${CURS.map((c) => tipRow(C[c], "In " + NAME[c], Math.round(p[c]))).join("")}<div class="tt-f">${int(p.n)} sales · ${d[0].q} = 100</div>`;
      const w = n === 1 ? pw : pw / (n - 1);
      s += `<rect class="hit" x="${x(i) - w / 2}" y="${T}" width="${w}" height="${ph}" data-tip="${esc(tip)}"/>`;
    });
    s += "</svg>";
    const yr = (k) => pct(Math.exp(ALL.trend[k].b * 4) - 1);
    const legend = CURS.map((c) => legendItem(C[c], "In " + NAME[c])).join("") +
      `<span class="eq">Trend per year: ${CURS.map((c) => `${NAME[c]} ${yr(c)} (R² ${ALL.trend[c].r2.toFixed(2)})`).join(" · ")}</span>`;
    return card(2, "Normalized price index", `Adjusted for which works sold each quarter · ${d[0].q} = 100`, s, legend);
  }

  /* Chart 3: forecast of a SuperRare 1/1 vs a whole Tezos work (editions summed),
     base case as a line, bear-to-bull as a band, log scale, selected currency */
  function chartForecast(W) {
    const narrow = W < 520;   // phones: no end labels, the legend names the lines
    const H = 290, L = 64, R = narrow ? 16 : 140, T = 14, B = 26;
    const pw = W - L - R, ph = H - T - B;
    const SERIES = [
      { key: "sr", label: "SuperRare 1/1", color: C.eth },
      { key: "tzw", label: "Tezos edition run", color: C.tz },
    ];
    const byKey = (k) => A.scen.find((q) => q.key === k);
    const bear = byKey("bear") || A.scen[0], base = byKey("base") || A.scen[1] || A.scen[0], bull = byKey("bull") || A.scen[A.scen.length - 1];
    const val = (key, s, t) => conv(usdAt(key, s, t), t);
    const ts = Array.from({ length: 51 }, (_, i) => i);
    const all = SERIES.flatMap((se) => [bear, base, bull].flatMap((s) => ts.map((t) => val(se.key, s, t)))).filter((v) => v > 0);
    const lo = Math.floor(Math.log10(Math.min(...all))), hi = Math.max(lo + 1, Math.ceil(Math.log10(Math.max(...all))));
    const step = hi - lo > 6 ? 2 : 1;
    const x = (t) => L + (t / 50) * pw;
    const y = (v) => T + ph - ((Math.log10(v) - lo) / (hi - lo)) * ph;
    const line = (key, s) => ts.map((t) => `${x(t)},${y(val(key, s, t))}`);
    let s = `<svg class="mk-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Forecast in ${NAME[cur]} of a SuperRare 1/1 and a whole Tezos work, ${Math.floor(yearNow)} to ${Math.floor(yearNow + 50)}">`;
    for (let e = lo; e <= hi; e += step) s += `<line x1="${L}" x2="${W - R}" y1="${y(10 ** e)}" y2="${y(10 ** e)}" stroke="${C.grid}"/><text x="${L - 6}" y="${y(10 ** e) + 3.5}" class="ax" text-anchor="end">${money(10 ** e)}</text>`;
    s += `<line x1="${L}" x2="${L}" y1="${T}" y2="${T + ph}" stroke="${C.axis}"/>`;
    if (x(10) - x(0) > 44) s += `<text x="${L}" y="${H - 8}" class="ax" text-anchor="start">${Math.floor(yearNow)}</text>`;
    let lastLabel = x(10) - x(0) > 44 ? x(0) + 40 : -Infinity;
    HORIZONS.forEach((h) => {
      s += `<line x1="${x(h)}" x2="${x(h)}" y1="${T}" y2="${T + ph}" stroke="${C.grid}"/>`;
      const room = h === 50 || x(h) - lastLabel > 46;   // skip a year label that would collide
      if (room) { s += `<text x="${x(h)}" y="${H - 8}" class="ax" text-anchor="${h === 50 ? "end" : "middle"}">${Math.floor(yearNow + h)}</text>`; lastLabel = x(h); }
    });
    const ends = [];
    SERIES.forEach((se) => {
      const up = line(se.key, bull), down = line(se.key, bear).reverse();
      s += `<path d="M${up.join("L")}L${down.join("L")}Z" fill="${se.color}" opacity=".1"/>`;
      s += `<polyline points="${up.join(" ")}" fill="none" stroke="${se.color}" stroke-width="1" opacity=".55"/>`;
      s += `<polyline points="${down.join(" ")}" fill="none" stroke="${se.color}" stroke-width="1" opacity=".55"/>`;
      s += `<polyline points="${line(se.key, base).join(" ")}" fill="none" stroke="${se.color}" stroke-width="2" stroke-linejoin="round"/>`;
      s += `<circle cx="${x(0)}" cy="${y(val(se.key, base, 0))}" r="4" fill="${se.color}" stroke="#fff" stroke-width="2"/>`;
      HORIZONS.forEach((h) => { s += `<circle cx="${x(h)}" cy="${y(val(se.key, base, h))}" r="4" fill="${se.color}" stroke="#fff" stroke-width="2"/>`; });
      ends.push({ y: y(val(se.key, base, 50)), a: se.label, b: money(val(se.key, base, 50)) });
    });
    ends.sort((a, b) => a.y - b.y);
    for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 36) ends[i].y = ends[i - 1].y + 36;
    if (!narrow) ends.forEach((e) => { s += `<text x="${W - R + 8}" y="${e.y - 2}" class="lbl">${esc(e.a)}</text><text x="${W - R + 8}" y="${e.y + 11}" class="ax">${esc(e.b)} base</text>`; });
    ts.forEach((t) => {
      const yr = Math.floor(yearNow + t);
      let tip = `<div class="tt-h">${yr}${t ? ` · in ${t} year${t > 1 ? "s" : ""}` : " · today"}</div>`;
      SERIES.forEach((se) => {
        tip += tipRow(se.color, se.label, `${money(val(se.key, base, t))}`, true);
        if (t) tip += `<div class="tt-f">conservative ${money(val(se.key, bear, t))} · optimistic ${money(val(se.key, bull, t))}</div>`;
      });
      tip += `<div class="tt-f">Tezos edition run = ${(100 * usdAt("tzw", base, t) / usdAt("sr", base, t)).toFixed(1)}% of a SuperRare 1/1</div>`;
      const w = pw / 50;
      s += `<rect class="hit" x="${x(t) - w / 2}" y="${T}" width="${w}" height="${ph}" data-tip="${esc(tip)}"/>`;
    });
    s += "</svg>";
    const legend = SERIES.map((se) => legendItem(se.color, se.label, true)).join("") +
      `<span><span class="tk band" style="--c:${C.range}"></span>Shaded: conservative to optimistic</span>`;
    const sub = `Log scale · ${NAME[cur]} · line = base case`;
    return card(3, "Optimistic outlook: SuperRare 1/1 and a Tezos edition run", sub, s, legend);
  }

  /* ── The sheet ────────────────────────────────────────── */
  function html(width, small) {
    rowN = 0;
    cellsF = {};
    const k = V().kpi, N = ALL.sales + 1, M = COLM();
    const chartW = Math.max(280, Math.min(960, width - 20 - 26));
    const ROW = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nk-h-row")) || 21) + 1;   // row + 1px border
    const rowsFor = (px) => Math.ceil((px + 20 + (small ? 44 : 0)) / ROW);
    const g = ALL.growth, coins = ALL.coins;
    let h = `<div class="sheet mk-sheet">`;
    h += `<div class="col-headers"><div class="corner"></div>${COLW.map((w, i) => `<div class="col-h" style="width:${w}">${letter(i)}</div>`).join("")}<div class="col-h filler"></div></div>`;

    // Summary
    h += section("Sales summary", `As of ${ALL.asOf} · prices in ${NAME[cur]} at the time of each sale`);
    h += row([{ v: "Show prices in", cls: "mk-k" }, { v: NAME[cur], select: true, cls: "mk-input mk-select", f: `=${NAME[cur]}` },
      { v: "Switch currency and the whole sheet follows", span: 6, cls: "mk-note" }]);
    h += head(["Metric", { v: "Value", cls: "r" }, { v: "", span: 6 }]);
    const kpi = (label, v, note, f, cls = "") => row([{ v: label, cls: "mk-k" }, { v, f, num: true, cls }, { v: note, span: 6, cls: "mk-note" }]);
    const others = CURS.filter((c) => c !== cur).map((c) => `${NAME[c]} ${pct(g[c].g)}`).join(" · ");
    h += kpi("Sales recorded", int(ALL.sales), `On Tezos and Ethereum since ${ALL.firstSale}`, `=COUNTA(Sales!A2:A${N})`);
    h += kpi("Collectors", int(ALL.collectors), "Different wallets that have collected the work", `=COUNTA(UNIQUE(Sales!G2:G${N}))`);
    h += kpi("Sales growth, 12 months", pct(k.yoy), "The last 12 months compared with the 12 months before", `=SUMIFS(Sales!${M}:${M},Sales!A:A,">="&EDATE(TODAY(),-12))/SUMIFS(Sales!${M}:${M},Sales!A:A,">="&EDATE(TODAY(),-24),Sales!A:A,"<"&EDATE(TODAY(),-12))-1`, k.yoy >= 0 ? "cf-good" : "");
    h += kpi("Median sale", money(k.median), `${ALL.worksSold} different works have sold`, `=MEDIAN(Sales!${M}2:${M}${N})`);
    h += kpi("Highest sale", money(k.best.v), `${k.best.title} · ${k.best.date}`, `=MAX(Sales!${M}2:${M}${N})`);
    h += kpi(`Normalized price growth (${NAME[cur]})`, pct(g[cur].g) + "/yr", `Yearly price growth, adjusted for which works sold · ${others} · from ${int(ALL.pairs)} sales`, `=EXP(SLOPE(LN(Sales!${M}2:${M}${N}),Sales!YEARS))-1`, g[cur].g >= 0 ? "cf-good" : "");
    h += kpi("XTZ price", usd(coins.xtz.now), `${usd(coins.xtz.first)} at the first sale · prices in tez rose faster than the coin fell`, `=COINBASE("XTZ-USD","${coins.xtz.date}")`);
    h += kpi("ETH price", usd(coins.eth.now), `${usd(coins.eth.first)} at the first sale`, `=COINBASE("ETH-USD","${coins.eth.date}")`);
    h += kpi("First mint", "2022", `Market records start ${ALL.firstSale}`, `="2022"`);
    h += blank();

    // Charts
    h += section("Trends", "Hover a chart for values");
    h += block(rowsFor(250 + 64), chartMonthly(chartW));
    h += blank();
    h += block(rowsFor(250 + (small ? 120 : 76)), chartIndex(chartW));
    h += blank();

    // Outlook: projected values only; the assumptions behind them stay private (MARKET-NOTES.md)
    h += section("Optimistic outlook", "Where the sales trends above lead");
    h += block(rowsFor(290 + 80), chartForecast(chartW));
    h += blank();
    const yr = (t) => Math.floor(yearNow + t);
    const toCur = cur === "usd" ? "" : `/${NAME[cur]}_USD`;
    const Y0 = now.getFullYear();
    const inYear = `(YEAR(Sales!A:A)=${Y0})`;
    const n = (key) => (F.base.find((b) => b.key === key) || {}).n;
    const ABOUT_ROW = {
      sr: { note: `Median of ${n("sr")} SuperRare 1/1 sales in ${Y0}`, f: `=MEDIAN(IF((Sales!C:C="Ethereum")*${inYear},Sales!F:F))${toCur}` },
      tzw: { note: `Median of ${n("tzw")} Tezos edition runs sold in ${Y0}, all editions together`, f: `=MEDIAN(Works${Y0}!PRICE*Works${Y0}!EDITIONS)${toCur}` },
      ed: { note: `Median of ${n("ed")} Tezos edition sales in ${Y0}`, f: `=MEDIAN(IF((Sales!C:C="Tezos")*(Sales!D:D>1)*${inYear},Sales!F:F))${toCur}` },
    };
    h += head([`Value (${NAME[cur]})`, { v: `${Y0} median`, cls: "r" }, ...HORIZONS.map((t) => ({ v: String(yr(t)), cls: "r" })), { v: "", span: 3 }]);
    F.base.filter((b) => ABOUT_ROW[b.key]).forEach((b) => {
      h += row([{ v: b.key === "tzw" ? "Tezos edition run" : b.label, cls: "mk-k" }, { v: money(conv(b.usd, 0)), num: true, f: ABOUT_ROW[b.key].f }, { v: "", span: 3 }, { v: ABOUT_ROW[b.key].note, span: 3, cls: "mk-note" }], "mk-group");
      A.scen.forEach((s) => {
        h += row([
          { v: `   ${LABEL[s.key] || s.label}`, cls: "mk-k mk-indent" },
          { v: "" },
          ...HORIZONS.map((t) => { const v = money(conv(usdAt(b.key, s, t), t)); return { v, f: v, num: true, cls: s.key === "base" ? "mk-base" : "" }; }),
          { v: "", span: 3 },
        ]);
      });
    });
    h += row([{ v: "Projections extend past sales trends. They illustrate where prices could go; they are not a promise of future value.", span: 8, cls: "mk-note" }]);
    h += blank();

    // Yearly table
    h += section("By year", `In ${NAME[cur]}`);
    h += head(["Year", { v: "Sales", cls: "r" }, { v: "Collectors", cls: "r" }, { v: "Median sale", cls: "r" }, { v: "Top sale", cls: "r" }, { v: "", span: 3 }]);
    V().yearly.forEach((y) => {
      const partial = y.year === ALL.firstSale.slice(0, 4) ? " (from Aug)" : y.year === ALL.asOf.slice(0, 4) ? " (to date)" : "";
      h += row([{ v: y.year + partial, cls: "mk-k" }, { v: int(y.sales), num: true }, { v: int(y.collectors), num: true }, { v: money(y.median), num: true }, { v: money(y.top), num: true }, { v: "", span: 3 }]);
    });
    h += blank();

    // Top works
    h += section("Top works by sales volume", `In ${NAME[cur]}`);
    h += head(["Work", "Chain", { v: "Sales", cls: "r" }, { v: "Volume", cls: "r" }, { v: "Highest", cls: "r" }, { v: "Last sale", cls: "r" }, { v: "", span: 2 }]);
    V().topWorks.forEach((w) => {
      h += row([
        { v: w.title, html: `<a href="${esc(w.url)}" target="_blank" rel="noopener" class="ellip">${esc(w.title)}</a>`, f: `=HYPERLINK("${w.url}", "${w.title}")`, cls: "mk-k" },
        { v: w.chain }, { v: int(w.sales), num: true }, { v: money(w.volume), num: true }, { v: money(w.high), num: true }, { v: w.last, num: true }, { v: "", span: 2 },
      ]);
    });
    h += blank();

    for (let i = 0; i < 8; i++) h += blank();
    return h + "</div>";
  }

  /* ── API for app.js ───────────────────────────────────── */
  const formula = (r) => cellsF[r] || "";
  function seriesFormula(id) {
    const n = (id === 1 ? ALL.monthly.length : id === 2 ? ALL.index.length : 51) + 1;
    return id === 1 ? `=SERIES("Tezos",Monthly!$A$2:$A$${n},Monthly!$B$2:$B$${n},1)`
      : id === 2 ? `=SERIES("In ${NAME[cur]}",Index!$A$2:$A$${n},Index!$B$2:$B$${n},1)`
      : `=SERIES("Base",Forecast!$A$2:$A$${n},Forecast!$B$2:$B$${n},2)`;
  }
  function parseInput(k, raw) {
    const t = String(raw).replace(/[−–]/g, "-");
    let v = parseFloat(t.replace(/[,%\s]/g, ""));
    if (!isFinite(v)) return null;
    if (k === "fade" || k === "years") return Math.min(50, Math.max(0.5, v));
    if (/%/.test(t) || Math.abs(v) >= 1.5) v /= 100;   // "34", "34%" or "0.34"
    if (k === "target") return Math.min(10, Math.max(0.001, v));
    return Math.min(10, Math.max(-0.95, v));
  }
  function setInput(group, k, raw) {
    const v = parseInput(k, raw);
    if (v == null) return false;
    if (group === "coin") A.coin[k] = v;
    else if (group === "catch") A.catchUp[k] = v;
    else { const s = A.scen.find((x) => x.key === group); if (!s) return false; s[k] = v; }
    return true;
  }
  function setCurrency(c) {
    if (!CURS.includes(c)) return;
    cur = c;
    try { localStorage.setItem("nksh-currency", c); } catch (e) { /* storage blocked */ }
  }
  const reset = () => { A = fresh(); };
  const status = () => `As of ${ALL.asOf} · ${int(ALL.sales)} sales · prices in ${NAME[cur]}`;

  window.MarketSheet = { html, formula, seriesFormula, setInput, setCurrency, currency: () => cur, reset, status, CURRENCIES: CURS.map((c) => [c, NAME[c]]) };
})();
