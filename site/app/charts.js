// ============================================================
// PROJETO DELTA · gráficos SVG do painel (sem dependências)
// Área/linha com período anterior, barras, rosca, mapa de calor,
// funil, medidor e sparkline. Tudo com tooltip (mouse e toque),
// animação de entrada e respeito a prefers-reduced-motion.
// ============================================================
import { esc, reduceMotion } from "./ui.js";

const NS = "http://www.w3.org/2000/svg";
let uid = 0;
const nid = p => `${p}${++uid}`;
const nf = n => Number(n || 0).toLocaleString("pt-BR");
const EASE = "cubic-bezier(.22,.65,.35,1)";
// sem animação de entrada: movimento reduzido ou atualização silenciosa (modo ao vivo)
const calm = host => reduceMotion() || !!host.closest(".quiet");

// Paleta categórica validada (CVD e contraste) para o fundo dos cartões; ordem fixa.
export const CAT = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)"];

// ---------- utilidades ----------
function niceMax(v) {
  if (v <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(v)), m = v / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
}
// curva monotônica (Fritsch–Carlson): não inventa picos entre os pontos
function monotone(pts) {
  const n = pts.length;
  if (n < 2) return n ? `M${pts[0][0]},${pts[0][1]}` : "";
  const dx = [], dy = [], m = [], t = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; dy[i] = pts[i + 1][1] - pts[i][1]; m[i] = dy[i] / dx[i]; }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
  }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${pts[i][0] + h},${pts[i][1] + t[i] * h} ${pts[i + 1][0] - h},${pts[i + 1][1] - t[i + 1] * h} ${pts[i + 1][0]},${pts[i + 1][1]}`;
  }
  return d;
}
function anim(el, frames, opts) {
  if (reduceMotion() || !el.animate) return null;
  return el.animate(frames, { easing: EASE, fill: "both", ...opts });
}

// Tooltip único por gráfico, posicionado dentro do cartão
function tipFor(host) {
  let t = host.querySelector(":scope > .ch-tip");
  if (!t) { t = document.createElement("div"); t.className = "ch-tip"; t.setAttribute("role", "status"); host.appendChild(t); }
  return {
    show(html, x, y) {
      t.innerHTML = html; t.classList.add("on");
      const hw = host.clientWidth, tw = t.offsetWidth, th = t.offsetHeight;
      const left = Math.min(Math.max(8, x - tw / 2), hw - tw - 8);
      const top = y - th - 14 < 4 ? y + 18 : y - th - 14;
      t.style.transform = `translate(${left}px,${top}px)`;
    },
    hide() { t.classList.remove("on"); }
  };
}
const tipRow = (cor, nome, val) => `<div class="r"><i style="background:${cor}"></i><span>${esc(nome)}</span><b>${val}</b></div>`;

// Monta o gráfico agora e remonta (sem animação) quando o cartão muda de largura
function mount(host, draw) {
  host.classList.add("ch");
  let w = 0, first = true;
  const run = () => {
    const nw = Math.round(host.clientWidth);
    if (nw < 140 || nw === w) return;
    w = nw; host.querySelectorAll(":scope > svg, :scope > .ch-body").forEach(n => n.remove());
    draw(w, first && !calm(host)); first = false;
  };
  run();
  if ("ResizeObserver" in window) { const ro = new ResizeObserver(() => requestAnimationFrame(run)); ro.observe(host); }
}

// ---------- área / linha ----------
// series: [{ name, color, values }], labels: [...], prev: valores do período anterior (opcional)
export function areaChart(host, { labels, series, prev = null, height = 260, fmt = nf, prevName = "Período anterior" }) {
  mount(host, (W, first) => {
    const H = height, P = { l: 44, r: 16, t: 16, b: 30 }, iw = W - P.l - P.r, ih = H - P.t - P.b, n = labels.length;
    const all = series.flatMap(s => s.values).concat(prev || []);
    const max = niceMax(Math.max(1, ...all));
    const x = i => P.l + (n === 1 ? iw / 2 : i / (n - 1) * iw), y = v => P.t + ih - v / max * ih;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("width", W); svg.setAttribute("height", H);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", series.map(s => `${s.name}: total ${fmt(s.values.reduce((a, b) => a + b, 0))}`).join("; "));
    const clip = nid("cl");
    let g = `<defs><clipPath id="${clip}"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>`;
    series.forEach((s, k) => { g += `<linearGradient id="${clip}g${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.color}" stop-opacity=".34"/><stop offset=".7" stop-color="${s.color}" stop-opacity=".06"/><stop offset="1" stop-color="${s.color}" stop-opacity="0"/></linearGradient>`; });
    g += `</defs>`;
    for (let k = 0; k <= 4; k++) { const v = max / 4 * k, yy = y(v); g += `<line class="grid" x1="${P.l}" x2="${W - P.r}" y1="${yy}" y2="${yy}"/><text class="ax" x="${P.l - 8}" y="${yy + 4}" text-anchor="end">${fmt(Math.round(v))}</text>`; }
    const step = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 70))));
    labels.forEach((l, i) => { if ((i % step === 0 && (i === n - 1 || n - 1 - i >= step * .7)) || i === n - 1) g += `<text class="ax" x="${x(i)}" y="${H - 8}" text-anchor="${i === 0 ? "start" : i === n - 1 ? "end" : "middle"}">${esc(l)}</text>`; });
    g += `<g clip-path="url(#${clip})" class="plot">`;
    if (prev) g += `<path class="prev" d="${monotone(prev.map((v, i) => [x(i), y(v)]))}"/>`;
    series.forEach((s, k) => {
      const pts = s.values.map((v, i) => [x(i), y(v)]), line = monotone(pts);
      g += `<path d="${line}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z" fill="url(#${clip}g${k})"/><path class="ln" d="${line}" stroke="${s.color}"/>`;
    });
    g += `</g>`;
    series.forEach(s => { const lv = s.values[n - 1] || 0; g += `<circle class="pulse" cx="${x(n - 1)}" cy="${y(lv)}" r="5" fill="${s.color}"/><circle class="end" cx="${x(n - 1)}" cy="${y(lv)}" r="4" fill="${s.color}"/>`; });
    g += `<line class="xh" y1="${P.t}" y2="${P.t + ih}" x1="-10" x2="-10"/>` + series.map((s, k) => `<circle class="hd" data-k="${k}" r="5" cx="-10" cy="-10" fill="${s.color}"/>`).join("");
    g += `<rect class="hit" x="${P.l}" y="0" width="${iw}" height="${H}" fill="transparent"/>`;
    svg.innerHTML = g;
    host.prepend(svg);
    if (first) {
      const r = svg.querySelector(`#${clip} rect`);
      r.setAttribute("width", 0);
      { const t0 = performance.now(), dur = 1100; const tick = t => { const p = Math.max(0, Math.min(1, (t - t0) / dur)), e = 1 - (1 - p) ** 3; r.setAttribute("width", W * e); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
      svg.querySelectorAll(".end,.pulse").forEach(c => anim(c, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 1000 }));
    }
    const tip = tipFor(host), xh = svg.querySelector(".xh"), hd = [...svg.querySelectorAll(".hd")];
    const move = e => {
      const b = svg.getBoundingClientRect(), px = (e.clientX - b.left) * (W / b.width);
      const i = Math.max(0, Math.min(n - 1, Math.round((px - P.l) / (iw / Math.max(1, n - 1)))));
      xh.setAttribute("x1", x(i)); xh.setAttribute("x2", x(i));
      hd.forEach((c, k) => { c.setAttribute("cx", x(i)); c.setAttribute("cy", y(series[k].values[i] || 0)); });
      tip.show(`<div class="h">${esc(labels[i])}</div>` + series.map(s => tipRow(s.color, s.name, fmt(s.values[i] || 0))).join("") + (prev ? tipRow("var(--muted)", prevName, fmt(prev[i] || 0)) : ""),
        x(i) * (b.width / W), Math.min(...series.map(s => y(s.values[i] || 0))) * (b.height / H));
      svg.classList.add("hov");
    };
    const leave = () => { svg.classList.remove("hov"); tip.hide(); };
    const hit = svg.querySelector(".hit");
    hit.addEventListener("pointermove", move); hit.addEventListener("pointerdown", move); hit.addEventListener("pointerleave", leave);
  });
}

// ---------- barras verticais ----------
export function barChart(host, { labels, values, color = "var(--c1)", height = 200, fmt = nf, name = "" }) {
  mount(host, (W, first) => {
    const H = height, P = { l: 40, r: 8, t: 12, b: 28 }, iw = W - P.l - P.r, ih = H - P.t - P.b, n = values.length;
    const max = niceMax(Math.max(1, ...values)), bw = iw / n, gap = Math.max(2, Math.min(8, bw * .28)), w = Math.max(2, bw - gap);
    const y = v => P.t + ih - v / max * ih;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("width", W); svg.setAttribute("height", H); svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `${name}: total ${fmt(values.reduce((a, b) => a + b, 0))}`);
    let g = "";
    for (let k = 0; k <= 2; k++) { const v = max / 2 * k; g += `<line class="grid" x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${P.l - 8}" y="${y(v) + 4}" text-anchor="end">${fmt(Math.round(v))}</text>`; }
    const step = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 64))));
    values.forEach((v, i) => {
      const bx = P.l + i * bw + gap / 2, bh = Math.max(v ? 3 : 0, ih - (y(v) - P.t)), r = Math.min(4, w / 2, bh);
      const top = P.t + ih - bh;
      g += `<path class="bar" data-i="${i}" fill="${color}" d="M${bx},${P.t + ih}V${top + r}Q${bx},${top} ${bx + r},${top}H${bx + w - r}Q${bx + w},${top} ${bx + w},${top + r}V${P.t + ih}Z"/>`;
      if (i % step === 0 || i === n - 1) g += `<text class="ax" x="${bx + w / 2}" y="${H - 8}" text-anchor="middle">${esc(labels[i])}</text>`;
    });
    values.forEach((v, i) => { g += `<rect class="hitb" data-i="${i}" x="${P.l + i * bw}" y="0" width="${bw}" height="${H}" fill="transparent"/>`; });
    svg.innerHTML = g; host.prepend(svg);
    const bars = [...svg.querySelectorAll(".bar")];
    if (first) bars.forEach((b, i) => { b.style.transformOrigin = `0 ${P.t + ih}px`; anim(b, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: 650, delay: 60 + i * Math.min(35, 700 / n) }); });
    const tip = tipFor(host), sb = svg.getBoundingClientRect.bind(svg);
    svg.querySelectorAll(".hitb").forEach(h => {
      const on = () => { const i = +h.dataset.i, b = sb(); svg.classList.add("hov"); bars.forEach((x, k) => x.classList.toggle("on", k === i)); tip.show(`<div class="h">${esc(labels[i])}</div>${tipRow(color, name, fmt(values[i]))}`, (P.l + i * bw + bw / 2) * (b.width / W), y(values[i]) * (b.height / H)); };
      h.addEventListener("pointerenter", on); h.addEventListener("pointerdown", on);
      h.addEventListener("pointerleave", () => { svg.classList.remove("hov"); bars.forEach(x => x.classList.remove("on")); tip.hide(); });
    });
  });
}

// ---------- rosca ----------
export function donut(host, { items, center = "Total", fmt = nf }) {
  host.classList.add("ch", "ch-donut");
  const tot = items.reduce((a, b) => a + b.value, 0) || 1, R = 70, S = 18, C = 2 * Math.PI * R, gapLen = items.length > 1 ? 3 : 0;
  let off = 0;
  const segs = items.map((it, i) => {
    const len = Math.max(0, it.value / tot * C - gapLen), s = `<circle class="seg" data-i="${i}" r="${R}" cx="100" cy="100" fill="none" stroke="${it.color}" stroke-width="${S}" stroke-dasharray="${len} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 100 100)"/>`;
    off += it.value / tot * C; return s;
  }).join("");
  host.innerHTML = `<div class="ch-body"><svg viewBox="0 0 200 200" role="img" aria-label="${esc(items.map(i => `${i.label} ${Math.round(i.value / tot * 100)}%`).join(", "))}">
      <circle r="${R}" cx="100" cy="100" fill="none" stroke="var(--line)" stroke-width="${S}" opacity=".5"/>${segs}
      <text class="dn-v" x="100" y="100" text-anchor="middle">${fmt(items.reduce((a, b) => a + b.value, 0))}</text><text class="dn-l" x="100" y="122" text-anchor="middle">${esc(center)}</text></svg>
    <ul class="lg">${items.map((it, i) => `<li data-i="${i}"><i style="background:${it.color}"></i><span>${esc(it.label)}</span><b>${Math.round(it.value / tot * 100)}%</b><em>${fmt(it.value)}${it.extra ? " · " + esc(it.extra) : ""}</em></li>`).join("")}</ul></div>`;
  const segEls = [...host.querySelectorAll(".seg")], lis = [...host.querySelectorAll(".lg li")];
  if (!calm(host)) segEls.forEach((s, i) => { const L = parseFloat(s.getAttribute("stroke-dasharray")); anim(s, [{ strokeDasharray: `0 ${C}` }, { strokeDasharray: `${L} ${C}` }], { duration: 900, delay: 150 + i * 140 }); });
  const hi = i => { host.classList.toggle("hov", i != null); segEls.forEach((s, k) => s.classList.toggle("on", k === i)); lis.forEach((l, k) => l.classList.toggle("on", k === i)); };
  [...segEls, ...lis].forEach(el => { const i = +el.dataset.i; el.addEventListener("pointerenter", () => hi(i)); el.addEventListener("pointerdown", () => hi(i)); el.addEventListener("pointerleave", () => hi(null)); });
}

// ---------- mapa de calor dia x hora ----------
export function heatmap(host, cells, { fmt = nf, unit = "questões" } = {}) {
  host.classList.add("ch");
  const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"], m = {}, order = [1, 2, 3, 4, 5, 6, 0];
  cells.forEach(c => { m[c.d + "-" + c.h] = c.n; });
  const max = Math.max(1, ...cells.map(c => c.n));
  host.innerHTML = `<div class="hm" role="img" aria-label="Mapa de calor de ${unit} por dia da semana e hora">
    <span></span>${Array.from({ length: 24 }, (_, h) => `<span class="hh">${h % 3 === 0 ? h + "h" : ""}</span>`).join("")}
    ${order.map((d, r) => `<span class="hdia">${DIAS[d]}</span>` + Array.from({ length: 24 }, (_, h) => { const n = m[d + "-" + h] || 0, a = n ? .16 + .84 * Math.sqrt(n / max) : 0; return `<i data-d="${d}" data-h="${h}" data-n="${n}" style="--a:${a.toFixed(3)};--k:${r + h}"></i>`; }).join("")).join("")}
  </div><div class="hm-sc"><span>menos</span><b></b><span>mais</span></div>`;
  const tip = tipFor(host), grid = host.querySelector(".hm");
  if (!calm(host)) grid.classList.add("in");
  grid.addEventListener("pointerover", e => {
    const c = e.target.closest("i"); if (!c) return;
    const hb = host.getBoundingClientRect(), cb = c.getBoundingClientRect();
    tip.show(`<div class="h">${DIAS[c.dataset.d]}, ${c.dataset.h}h às ${+c.dataset.h + 1}h</div>${tipRow("var(--c1)", unit, fmt(+c.dataset.n))}`, cb.left - hb.left + cb.width / 2, cb.top - hb.top);
  });
  grid.addEventListener("pointerleave", () => tip.hide());
}

// ---------- funil ----------
export function funnel(host, steps, { fmt = nf } = {}) {
  host.classList.add("ch");
  const top = Math.max(1, steps[0]?.value || 0);
  host.innerHTML = `<div class="fn">${steps.map((s, i) => {
    const p = Math.round(s.value / top * 100), conv = i ? Math.round(s.value / Math.max(1, steps[i - 1].value) * 100) : null;
    return `${conv != null ? `<div class="fn-c">${Math.min(100, conv)}% seguiram</div>` : ""}<div class="fn-s" style="--w:${Math.max(4, p)}%;--d:${i * 120}ms;--col:${CAT[i % CAT.length]}"><div class="bar"><i></i></div><div class="tx"><span>${esc(s.label)}</span><b>${fmt(s.value)}</b><em>${p}%</em></div></div>`;
  }).join("")}</div>`;
  const fn = host.querySelector(".fn");
  if (calm(host)) fn.classList.add("go", "now"); else requestAnimationFrame(() => requestAnimationFrame(() => fn.classList.add("go")));
}

// ---------- medidor (0–100%) ----------
export function gauge(pctv, { color = "var(--c1)", label = "" } = {}) {
  const p = Math.max(0, Math.min(100, pctv || 0)), R = 52, L = Math.PI * R;
  return `<svg class="gauge" viewBox="0 0 128 76" role="img" aria-label="${esc(label)} ${p}%">
    <path d="M12 68a52 52 0 0 1 104 0" fill="none" stroke="var(--line)" stroke-width="10" stroke-linecap="round"/>
    <path class="gv" d="M12 68a52 52 0 0 1 104 0" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${L}" style="--to:${L * (1 - p / 100)}"/>
    <text x="64" y="64" text-anchor="middle" class="gt">${p}%</text></svg>`;
}

// ---------- sparkline para cartões ----------
export function sparkline(values, color = "var(--c1)") {
  if (!values || values.length < 2) return "";
  const W = 120, H = 34, max = Math.max(1, ...values), n = values.length;
  const lo = Math.min(...values), span = Math.max(1e-9, max - lo);
  const pts = values.map((v, i) => [i / (n - 1) * W, H - 3 - (v - lo) / span * (H - 8)]), d = monotone(pts), k = nid("sp");
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${k}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".3"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    <path d="${d}L${W},${H}L0,${H}Z" fill="url(#${k})" class="sa"/><path d="${d}" pathLength="1" class="sl" stroke="${color}"/></svg>`;
}
