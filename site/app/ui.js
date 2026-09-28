// ============================================================
// PROJETO DELTA — utilitários de interface e animação
// ============================================================
import { deltaSVG, COIN } from "./mascot.js";
import { sfx } from "./sfx.js";

export const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function h(html) { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
export function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
export function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
export const sleep = ms => new Promise(r => setTimeout(r, ms));

let toastT;
export function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) { el = h(`<div id="toast" class="toast" role="status" aria-live="polite"></div>`); document.body.appendChild(el); }
  el.textContent = msg; el.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2800);
}

// Enunciado do banco oficial: escapa tudo e reconstrói só imagens do Storage do projeto e negrito
export function mdStatement(md) {
  let t = esc(md || "");
  t = t.replace(/!\[([^\]]*)\]\((https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/questoes\/[^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />');
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, "");
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return t.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
}

export function modal(inner, { onClose, dismiss = true } = {}) {
  const m = h(`<div class="modal" role="dialog" aria-modal="true"><div class="box">${inner}</div></div>`);
  const close = () => { m.remove(); document.removeEventListener("keydown", key); onClose && onClose(); };
  const key = e => { if (e.key === "Escape" && dismiss) close(); };
  if (dismiss) m.addEventListener("click", e => { if (e.target === m) close(); });
  document.addEventListener("keydown", key);
  document.body.appendChild(m);
  const f = m.querySelector("button, a, input"); f && f.focus({ preventScroll: true });
  m.close = close;
  return m;
}

export function sheet(title, inner) {
  const s = h(`<div class="sheet" role="dialog" aria-modal="true"><div class="panel"><div class="grab"></div>${title ? `<h2>${esc(title)}</h2>` : ""}${inner}</div></div>`);
  const close = () => { s.remove(); document.removeEventListener("keydown", key); };
  const key = e => { if (e.key === "Escape") close(); };
  s.addEventListener("click", e => { if (e.target === s || e.target.closest("a[href]")) close(); });
  document.addEventListener("keydown", key);
  document.body.appendChild(s);
  s.close = close;
  return s;
}

export function confetti(n = 140) {
  if (reduceMotion()) return;
  const c = h(`<canvas class="confetti"></canvas>`); document.body.appendChild(c);
  const ctx = c.getContext("2d"); const dpr = Math.min(devicePixelRatio || 1, 2);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; ctx.scale(dpr, dpr);
  const cols = ["#00f0ff", "#2979ff", "#8b5cf6", "#ff00e5", "#ffc53d", "#ffffff"];
  const parts = Array.from({ length: n }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35, vx: (Math.random() - .5) * 16, vy: -Math.random() * 14 - 4,
    s: 5 + Math.random() * 6, c: cols[Math.random() * cols.length | 0], r: Math.random() * 6, vr: (Math.random() - .5) * .4, a: 1, tri: Math.random() < .35 }));
  let t = 0;
  (function loop() {
    ctx.clearRect(0, 0, innerWidth, innerHeight); t++;
    parts.forEach(p => { p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; if (t > 60) p.a -= .015;
      ctx.globalAlpha = Math.max(0, p.a); ctx.fillStyle = p.c; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      if (p.tri) { ctx.beginPath(); ctx.moveTo(0, -p.s / 1.4); ctx.lineTo(p.s / 1.4, p.s / 1.6); ctx.lineTo(-p.s / 1.4, p.s / 1.6); ctx.closePath(); ctx.fill(); }
      else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore(); });
    if (t < 170) requestAnimationFrame(loop); else c.remove();
  })();
}

export function flyText(text, x, y) {
  const el = h(`<div class="fly">${text}</div>`);
  el.style.left = (x ?? innerWidth / 2 - 40) + "px"; el.style.top = (y ?? innerHeight * .4) + "px";
  document.body.appendChild(el); setTimeout(() => el.remove(), 1100);
}

// Moedas Δ voando até o saldo no topo
export function coinBurst(n, from) {
  const target = document.querySelector(".chip.coins");
  if (!target || reduceMotion()) { sfx.coin(); return; }
  const tr = target.getBoundingClientRect();
  const fx = from ? from.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  const count = Math.min(10, Math.max(3, Math.round(n / 8)));
  for (let i = 0; i < count; i++) {
    const c = h(`<div class="coin-fx">${COIN}</div>`); document.body.appendChild(c);
    const sx = fx.left + fx.width / 2 + (Math.random() - .5) * 80, sy = fx.top + fx.height / 2 + (Math.random() - .5) * 40;
    const ex = tr.left + tr.width / 2 - 14, ey = tr.top + tr.height / 2 - 14;
    c.animate([{ transform: `translate(${sx}px,${sy}px) scale(.4)`, opacity: 0 }, { transform: `translate(${sx + (Math.random() - .5) * 60}px,${sy - 60}px) scale(1.1)`, opacity: 1, offset: .35 },
      { transform: `translate(${ex}px,${ey}px) scale(.6)`, opacity: .9 }], { duration: 900 + i * 60, easing: "cubic-bezier(.5,0,.2,1)" }).onfinish = () => {
      c.remove(); if (i === 0) sfx.coin(); target.classList.remove("bump"); void target.offsetWidth; target.classList.add("bump"); };
    c.style.left = "0"; c.style.top = "0";
  }
}

export function countUp(el, to, dur = 900, fmt = v => v.toLocaleString("pt-BR")) {
  if (!el) return;
  const from = parseInt(String(el.dataset.v || el.textContent).replace(/\D/g, "")) || 0;
  el.dataset.v = to;
  if (reduceMotion() || from === to) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  (function tick(now) { const k = Math.min(1, (now - t0) / dur), v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
    el.textContent = fmt(v); if (k < 1) requestAnimationFrame(tick); })(t0);
}

export async function typeText(el, text, speed = 18) {
  if (reduceMotion()) { el._tt = null; el.textContent = text; return; }
  const tok = el._tt = {};
  el.textContent = ""; el.classList.add("caret"); sfx.talk();
  for (let i = 0; i < text.length; i++) { if (el._tt !== tok) return; el.textContent += text[i]; if (i % 3 === 0) await sleep(speed); }
  el.classList.remove("caret");
}

// Reação do mascote (troca expressão com uma pequena animação)
export function react(host, av, expr, anim) {
  if (!host) return;
  host.innerHTML = deltaSVG({ ...av, expr });
  host.classList.remove("jump", "shake", "popin"); void host.offsetWidth;
  if (anim && !reduceMotion()) host.classList.add(anim);
}

// ---------- tutorial (coach marks) ----------
export function coach(steps, { onDone, av } = {}) {
  let i = 0;
  const root = h(`<div class="coach" role="dialog" aria-modal="true" aria-label="Tutorial"><div class="hole"></div><div class="tip">
    <div class="talk"><div class="dm dm-live">${deltaSVG({ ...(av || {}), expr: "feliz" })}</div><div class="txt"></div></div>
    <div class="acts"><button class="btn btn-ghost btn-sm skip">Pular</button><span class="step"></span><button class="btn btn-teal btn-sm next">Entendi</button></div></div></div>`);
  document.body.appendChild(root);
  const hole = root.querySelector(".hole"), tip = root.querySelector(".tip"), txt = root.querySelector(".txt");
  const finish = () => { root.remove(); removeEventListener("resize", place); removeEventListener("scroll", place); onDone && onDone(); };
  const target = () => { const s = steps[i]; return s.el ? document.querySelector(s.el) : null; };
  function place() {
    const el = target(), pad = 8, tw = Math.min(340, innerWidth - 24);
    if (el) {
      const r = el.getBoundingClientRect();
      Object.assign(hole.style, { left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px", display: "block" });
      const th = tip.offsetHeight || 180;
      const below = r.bottom + 16 + th < innerHeight;
      tip.style.left = Math.min(innerWidth - tw - 12, Math.max(12, r.left + r.width / 2 - tw / 2)) + "px";
      tip.style.top = Math.max(12, Math.min(innerHeight - th - 12, below ? r.bottom + 16 : r.top - 16 - th)) + "px";
    } else {
      Object.assign(hole.style, { left: "50%", top: "50%", width: "0px", height: "0px" });
      tip.style.left = (innerWidth - tw) / 2 + "px"; tip.style.top = Math.max(12, innerHeight / 2 - 100) + "px";
    }
  }
  async function show() {
    const s = steps[i], el = target();
    root.querySelector(".step").textContent = steps.length > 1 ? `${i + 1} de ${steps.length}` : "";
    root.querySelector(".next").textContent = i === steps.length - 1 ? "Entendi" : "Próximo";
    if (el) { const r = el.getBoundingClientRect(); if (r.top < 80 || r.bottom > innerHeight - 90) el.scrollIntoView({ block: "center" }); }
    place(); requestAnimationFrame(place);
    await typeText(txt, s.text, 12);
    place();
    root.querySelector(".next").focus({ preventScroll: true });
  }
  root.querySelector(".next").onclick = () => { sfx.tap(); i++; if (i >= steps.length) finish(); else show(); };
  root.querySelector(".skip").onclick = () => finish();
  addEventListener("resize", place); addEventListener("scroll", place, { passive: true });
  show();
}
