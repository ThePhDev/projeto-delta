// ============================================================
// PROJETO DELTA · cutscenes em JavaScript (Web Animations + canvas)
// Todas podem ser puladas e respeitam "reduzir movimento".
// ============================================================
import { deltaSVG, fundoSVG, COIN } from "./mascot.js";
import { medalSVG } from "./icons.js";
import { h, esc, sleep, reduceMotion } from "./ui.js";
import { sfx } from "./sfx.js";

const EASE = "cubic-bezier(.22,.65,.35,1)", SPRING = "cubic-bezier(.34,1.56,.64,1)";
const RAR = { comum: "#8b8aa8", raro: "#2979ff", epico: "#9b5cf6", lendario: "#f5b400" };

// ---------- motor ----------
function run(build) {
  return new Promise(resolve => {
    const root = h(`<div class="cs" role="dialog" aria-modal="true" aria-label="Animação"><canvas class="cs-fx"></canvas><div class="cs-stage"></div><button class="cs-skip" type="button">Pular</button></div>`);
    document.body.appendChild(root);
    const stage = root.querySelector(".cs-stage"), cv = root.querySelector(".cs-fx"), ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const fit = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    fit(); addEventListener("resize", fit);
    let skipped = reduceMotion(), alive = true;
    const running = new Set(), waits = new Set(), fx = [];
    const api = {
      stage, root,
      get skipped() { return skipped; },
      add(html, parent = stage) { const el = h(html); parent.appendChild(el); return el; },
      anim(el, frames, o = {}) {
        const a = el.animate(frames, { fill: "forwards", easing: EASE, ...o });
        running.add(a); if (skipped) a.finish();
        return a.finished.catch(() => {}).then(() => running.delete(a));
      },
      wait(ms) { return skipped ? Promise.resolve() : new Promise(r => { const w = { t: setTimeout(() => { waits.delete(w); r(); }, ms), r }; waits.add(w); }); },
      sound(n) { if (!skipped && sfx[n]) sfx[n](); },
      async type(el, text, speed = 24) {
        if (skipped) { el.textContent = text; return; }
        el.textContent = ""; sfx.talk();
        for (let i = 0; i < text.length && !skipped; i++) { el.textContent += text[i]; await sleep(speed); }
        el.textContent = text;
      },
      // partículas no canvas (JS puro, requestAnimationFrame)
      burst(x, y, { n = 60, colors = ["#00f0ff", "#2979ff", "#8b5cf6", "#ff00e5", "#ffc53d"], speed = 7, gravity = .18, life = 70, tri = true } = {}) {
        if (skipped) return;
        for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = speed * (.35 + Math.random());
          fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - speed * .3, g: gravity, life, t: 0, s: 3 + Math.random() * 5, c: colors[i % colors.length], r: Math.random() * 6, tri }); }
      },
      stars(mode = "drift") { starMode = mode; },
      buttons(list) {
        return new Promise(res => {
          const bar = api.add(`<div class="cs-acts">${list.map(([k, t, cls]) => `<button class="btn ${cls || "btn-lime"}" data-k="${k}">${esc(t)}</button>`).join("")}</div>`);
          api.anim(bar, [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }], { duration: 350 });
          root.querySelector(".cs-skip").hidden = true;
          bar.querySelectorAll("button").forEach(b => b.onclick = () => { sfx.tap(); res(b.dataset.k); });
          setTimeout(() => bar.querySelector("button")?.focus({ preventScroll: true }), 60);
        });
      }
    };
    // campo de estrelas animado
    let starMode = "drift";
    const stars = Array.from({ length: 140 }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() }));
    (function loop() {
      if (!alive) return;
      const W = innerWidth, H = innerHeight;
      ctx.clearRect(0, 0, W, H);
      const warp = starMode === "warp", fall = starMode === "fall";
      stars.forEach(s => {
        if (warp) { s.z -= .022; if (s.z <= .02) { s.z = 1; s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; } }
        else if (fall) { s.y += .03 * (1.2 - s.z); if (s.y > 1) { s.y = -1; s.x = Math.random() * 2 - 1; } }
        else { s.z -= .0015; if (s.z <= .02) s.z = 1; }
        const px = W / 2 + s.x / s.z * W * .25, py = H / 2 + s.y / s.z * H * .25, r = (1 - s.z) * 2.2;
        ctx.globalAlpha = Math.min(1, (1 - s.z) * 1.4);
        if (warp) { const px2 = W / 2 + s.x / (s.z + .06) * W * .25, py2 = H / 2 + s.y / (s.z + .06) * H * .25;
          ctx.strokeStyle = "#cfe9ff"; ctx.lineWidth = r; ctx.beginPath(); ctx.moveTo(px2, py2); ctx.lineTo(px, py); ctx.stroke(); }
        else if (fall) { ctx.strokeStyle = "#cfe9ff"; ctx.lineWidth = r * .8; ctx.beginPath(); ctx.moveTo(px, py - 30 * (1 - s.z)); ctx.lineTo(px, py); ctx.stroke(); }
        else { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill(); }
      });
      for (let i = fx.length - 1; i >= 0; i--) { const p = fx[i]; p.t++; p.vy += p.g; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += .1;
        if (p.t > p.life) { fx.splice(i, 1); continue; }
        ctx.globalAlpha = 1 - p.t / p.life; ctx.fillStyle = p.c; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        if (p.tri) { ctx.beginPath(); ctx.moveTo(0, -p.s); ctx.lineTo(p.s * .9, p.s * .7); ctx.lineTo(-p.s * .9, p.s * .7); ctx.closePath(); ctx.fill(); } else ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
        ctx.restore(); }
      ctx.globalAlpha = 1;
      requestAnimationFrame(loop);
    })();
    const skip = () => { if (skipped) return; skipped = true; fx.length = 0; running.forEach(a => a.finish()); waits.forEach(w => { clearTimeout(w.t); w.r(); }); waits.clear(); };
    const key = e => { if (e.key === "Escape") skip(); };
    root.querySelector(".cs-skip").onclick = skip;
    document.addEventListener("keydown", key);
    root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: "forwards" });
    build(api).then(async result => {
      document.removeEventListener("keydown", key);
      await root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: "forwards" }).finished.catch(() => {});
      alive = false; removeEventListener("resize", fit); root.remove(); resolve(result);
    });
  });
}

const dm = (av, expr, cls = "") => `<div class="cs-dm dm dm-live ${cls}">${deltaSVG({ ...av, expr })}</div>`;
const setExpr = (el, av, expr) => { el.innerHTML = deltaSVG({ ...av, expr }); };

// ============================================================
// 1) CHEGADA: a cápsula Δ pousa e o Delta se apresenta
// ============================================================
export function csChegada(av, nome) {
  return run(async s => {
    s.stage.classList.add("cs-space");
    s.stars("warp"); s.sound("whoosh");
    const title = s.add(`<div class="cs-title">PROJETO DELTΛ</div>`);
    await s.anim(title, [{ opacity: 0, letterSpacing: ".8em", filter: "blur(8px)" }, { opacity: 1, letterSpacing: ".25em", filter: "blur(0)" }], { duration: 900 });
    await s.wait(500);
    s.anim(title, [{ opacity: 1 }, { opacity: 0, transform: "translateY(-30px)" }], { duration: 400 });
    s.stars("drift");
    const ground = s.add(`<div class="cs-ground"></div>`);
    s.anim(ground, [{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], { duration: 900 });
    const pod = s.add(`<div class="cs-pod"><svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="csp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5ee7ff"/><stop offset=".5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#ff00e5"/></linearGradient></defs>
      <path d="M60 8 L112 102 L8 102 Z" fill="#15141e" stroke="url(#csp)" stroke-width="8" stroke-linejoin="round"/><circle class="cs-win" cx="60" cy="68" r="17" fill="#0b0b12" stroke="#cdbfff" stroke-width="3"/>
      <path d="M30 104 L22 116 M90 104 L98 116" stroke="#3a3850" stroke-width="5" stroke-linecap="round"/></svg><div class="cs-flame"></div></div>`);
    s.sound("rise");
    await s.anim(pod, [{ transform: "translate(60vw,-70vh) rotate(35deg) scale(.4)" }, { transform: "translate(8vw,-18vh) rotate(10deg) scale(.85)", offset: .7 }, { transform: "translate(0,0) rotate(0) scale(1)" }], { duration: 1500, easing: "cubic-bezier(.3,.1,.3,1)" });
    s.sound("land");
    const r = pod.getBoundingClientRect(); s.burst(r.left + r.width / 2, r.bottom - 6, { n: 36, colors: ["#8a86a8", "#b9b6cf", "#5e5b78"], speed: 5, gravity: .12, tri: false, life: 50 });
    pod.querySelector(".cs-flame").remove();
    await s.anim(pod, [{ transform: "scale(1.08,.9)" }, { transform: "scale(.96,1.05)" }, { transform: "none" }], { duration: 420, easing: SPRING });
    await s.wait(250);
    const win = pod.querySelector(".cs-win");
    s.sound("pop");
    await s.anim(win, [{ fill: "#0b0b12" }, { fill: "#fff" }, { fill: "#0b0b12" }], { duration: 380 });
    const d = s.add(dm(av, "surpreso", "cs-hero"));
    await s.anim(d, [{ transform: "translate(-50%,0) translateY(10vh) scale(.2)", opacity: 0 }, { transform: "translate(-50%,0) translateY(-22vh) scale(1)", opacity: 1, offset: .55 }, { transform: "translate(-50%,0) translate(26vw,0) scale(1)" }], { duration: 1100, easing: "cubic-bezier(.3,.7,.4,1)" });
    s.sound("land");
    await s.anim(d, [{ transform: "translate(-50%,0) translate(26vw,0) scale(1.1,.88)" }, { transform: "translate(-50%,0) translate(26vw,0)" }], { duration: 320, easing: SPRING });
    setExpr(d, av, "comemorando"); s.sound("correct");
    const say = s.add(`<div class="cs-say"></div>`);
    s.anim(say, [{ opacity: 0, transform: "translate(-50%,10px) scale(.9)" }, { opacity: 1, transform: "translate(-50%,0)" }], { duration: 300, easing: SPRING });
    await s.type(say, `Oi${nome ? ", " + nome : ""}! Eu sou o Delta. Acabei de pousar para ser seu parceiro de Matemática no ENEM.`);
    await s.wait(900);
    setExpr(d, av, "feliz");
    await s.type(say, "Antes da primeira missão, vamos montar o seu astronauta?");
    return s.buttons([["go", "Bora montar"]]);
  });
}

// ============================================================
// 2) SUBIU DE NÍVEL: decolagem, anel de energia e itens liberados
// ============================================================
export function csLevelUp(av, nivel, novos = []) {
  return run(async s => {
    s.stage.classList.add("cs-space", "cs-lv");
    const d = s.add(dm(av, "feliz", "cs-center"));
    await s.anim(d, [{ transform: "translate(-50%,-50%) scale(.6)", opacity: 0 }, { transform: "translate(-50%,-50%) scale(1)", opacity: 1 }], { duration: 450, easing: SPRING });
    await s.anim(d, [{ transform: "translate(-50%,-50%)" }, { transform: "translate(-50%,-50%) scale(1.08,.86)" }], { duration: 380 });
    s.stars("fall"); s.sound("rise"); setExpr(d, av, "comemorando");
    const trail = s.add(`<div class="cs-trail"></div>`);
    s.anim(trail, [{ opacity: 0, transform: "translateX(-50%) scaleY(.2)" }, { opacity: 1, transform: "translateX(-50%) scaleY(1)" }], { duration: 500 });
    await s.anim(d, [{ transform: "translate(-50%,-50%) scale(1.08,.86)" }, { transform: "translate(-50%,-50%) translateY(-8vh) scale(.95,1.1)", offset: .3 }, { transform: "translate(-50%,-50%) translateY(-4vh)" }], { duration: 900, easing: "cubic-bezier(.2,.9,.3,1)" });
    for (let i = 0; i < 3; i++) await s.anim(d, [{ transform: "translate(-50%,-50%) translateY(-4vh)" }, { transform: "translate(-50%,-50%) translateY(-6vh) rotate(" + (i % 2 ? -4 : 4) + "deg)" }, { transform: "translate(-50%,-50%) translateY(-4vh)" }], { duration: 300 });
    s.stars("drift"); s.anim(trail, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
    const ring = s.add(`<div class="cs-ring"><div class="cs-ring-in"><small>NÍVEL</small><b>${nivel}</b></div></div>`);
    s.sound("levelup");
    s.anim(d, [{ transform: "translate(-50%,-50%) translateY(-4vh)", opacity: 1 }, { transform: "translate(-50%,-50%) translateY(-80vh) scale(.6)", opacity: 0 }], { duration: 700, easing: "cubic-bezier(.5,0,.8,.4)" });
    await s.anim(ring, [{ transform: "translate(-50%,-50%) scale(0) rotate(-90deg)", opacity: 0 }, { transform: "translate(-50%,-50%) scale(1.15) rotate(10deg)", opacity: 1, offset: .7 }, { transform: "translate(-50%,-50%) scale(1)" }], { duration: 800, easing: SPRING });
    const rr = ring.getBoundingClientRect(); s.burst(rr.left + rr.width / 2, rr.top + rr.height / 2, { n: 90, speed: 9 });
    const t = s.add(`<div class="cs-caption">Você subiu de nível!</div>`);
    s.anim(t, [{ opacity: 0, transform: "translate(-50%,16px)" }, { opacity: 1, transform: "translate(-50%,0)" }], { duration: 400 });
    if (novos.length) {
      const row = s.add(`<div class="cs-items">${novos.slice(0, 3).map(i => `<div class="cs-item" style="--rc:${RAR[i.raridade]}"><div class="p">${i.categoria === "fundo" ? fundoSVG(i.id) : `<div class="dm">${deltaSVG({ ...av, [i.categoria]: i.id, expr: "feliz" })}</div>`}</div><span>${esc(i.nome)}</span></div>`).join("")}</div>
        <div class="cs-sub">Liberado na loja</div>`);
      [...s.stage.querySelectorAll(".cs-item")].forEach((el, i) => s.anim(el, [{ opacity: 0, transform: "translateY(40px) scale(.8)" }, { opacity: 1, transform: "none" }], { duration: 500, delay: 200 + i * 150, easing: SPRING }));
      void row;
      await s.wait(700);
    }
    return s.buttons([["ok", "Continuar"]]);
  });
}

// ============================================================
// 3) SEQUÊNCIA: a semana acende e o fogo cresce
// ============================================================
export function csStreak(av, n, congelou) {
  return run(async s => {
    s.stage.classList.add("cs-night");
    const dias = ["D", "S", "T", "Q", "Q", "S", "S"], hoje = new Date().getDay();
    const week = s.add(`<div class="cs-week">${dias.map((l, i) => { const past = (hoje - i + 7) % 7, on = past > 0 && past < n;
      return `<div class="cs-day ${i === hoje ? "today" : on ? "on" : ""}"><span>${l}</span><i></i></div>`; }).join("")}</div>`);
    [...week.children].forEach((el, i) => s.anim(el, [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }], { duration: 400, delay: i * 70 }));
    await s.wait(700);
    if (congelou) {
      const prev = week.children[(hoje + 6) % 7]; prev.classList.add("ice"); s.sound("shake");
      await s.anim(prev, [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 500, easing: SPRING });
    }
    const flame = s.add(`<div class="cs-flame-big"><svg viewBox="0 0 100 130" aria-hidden="true"><defs><linearGradient id="csf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff00e5"/><stop offset=".45" stop-color="#ff8a1f"/><stop offset="1" stop-color="#ffe08a"/></linearGradient></defs>
      <path class="o" d="M50 126 C18 126 6 100 12 76 C18 54 34 46 34 20 C48 30 56 44 56 60 C62 52 66 44 66 34 C84 50 94 72 90 94 C86 114 72 126 50 126 Z" fill="url(#csf)"/>
      <path class="i" d="M50 124 C34 124 28 110 32 96 C36 84 44 80 46 66 C56 76 62 86 60 98 C66 94 68 88 68 82 C76 92 76 106 70 114 C66 120 58 124 50 124 Z" fill="#fff4c2"/></svg></div>`);
    s.sound("streak");
    await s.anim(flame, [{ transform: "translate(-50%,0) scale(0)", opacity: 0 }, { transform: "translate(-50%,0) scale(1.15)", opacity: 1, offset: .7 }, { transform: "translate(-50%,0) scale(1)" }], { duration: 800, easing: SPRING });
    if (!s.skipped) flame.querySelector("svg").animate([{ transform: "scale(1,1) skewX(0)" }, { transform: "scale(1.04,.96) skewX(3deg)" }, { transform: "scale(.97,1.05) skewX(-3deg)" }, { transform: "scale(1,1)" }], { duration: 700, iterations: Infinity });
    const today = week.children[hoje]; today.classList.add("lit");
    s.anim(today, [{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }], { duration: 500, easing: SPRING });
    const num = s.add(`<div class="cs-big">${Math.max(0, n - 1)}</div>`);
    await s.wait(350);
    await s.anim(num, [{ transform: "translate(-50%,0) rotateX(0)" }, { transform: "translate(-50%,0) rotateX(90deg)" }], { duration: 200 });
    num.textContent = n; s.sound("coin");
    await s.anim(num, [{ transform: "translate(-50%,0) rotateX(-90deg)" }, { transform: "translate(-50%,0) rotateX(0)" }], { duration: 260, easing: SPRING });
    const fr = flame.getBoundingClientRect(); s.burst(fr.left + fr.width / 2, fr.top + fr.height / 3, { n: 50, colors: ["#ff8a1f", "#ffe08a", "#ff00e5"], speed: 6 });
    const d = s.add(dm(av, "comemorando", "cs-side"));
    s.anim(d, [{ transform: "translateX(40vw)" }, { transform: "none" }], { duration: 600, easing: SPRING });
    const cap = s.add(`<div class="cs-caption">${n} ${n === 1 ? "dia" : "dias"} de sequência!</div>`);
    s.anim(cap, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
    const sub = s.add(`<div class="cs-sub">${congelou ? "Seu congelamento salvou o dia de ontem." : n === 1 ? "Sequência acesa. Volte amanhã para ela crescer." : "Constância vence talento. Continue assim."}</div>`);
    s.anim(sub, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 200 });
    await s.wait(500);
    return s.buttons([["ok", "Continuar"]]);
  });
}

// ============================================================
// 4) ABRIR ITEM DA LOJA: a caixa cai, treme e explode em luz
// ============================================================
export function csUnbox(item, av) {
  return run(async s => {
    const c = RAR[item.raridade] || RAR.comum;
    s.stage.classList.add("cs-space"); s.stage.style.setProperty("--rc", c);
    const rays = s.add(`<div class="cs-rays"></div>`);
    const box = s.add(`<div class="cs-box"><svg viewBox="0 0 120 120" aria-hidden="true">
      <g class="lid"><rect x="10" y="30" width="100" height="22" rx="6" fill="${c}"/><rect x="54" y="30" width="12" height="22" fill="#fff" opacity=".85"/>
        <path d="M60 30 C44 6 26 14 36 26 C40 30 52 30 60 30 C68 30 80 30 84 26 C94 14 76 6 60 30 Z" fill="#fff" opacity=".9"/></g>
      <rect x="16" y="52" width="88" height="60" rx="6" fill="${c}"/><rect x="16" y="52" width="88" height="60" rx="6" fill="#000" opacity=".22"/><rect x="54" y="52" width="12" height="60" fill="#fff" opacity=".85"/>
      <path d="M52 76 L60 62 L68 76 Z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg></div>`);
    s.sound("whoosh");
    await s.anim(box, [{ transform: "translate(-50%,-50%) translateY(-70vh) rotate(-20deg)" }, { transform: "translate(-50%,-50%) rotate(4deg)", offset: .75 }, { transform: "translate(-50%,-50%)" }], { duration: 800, easing: "cubic-bezier(.5,0,.3,1.3)" });
    s.sound("land");
    for (let i = 1; i <= 3; i++) {
      await s.wait(260); s.sound("shake");
      const a = 4 + i * 4;
      await s.anim(box, [{ transform: "translate(-50%,-50%)" }, { transform: `translate(-50%,-50%) rotate(${a}deg) scale(${1 + i * .03})` }, { transform: `translate(-50%,-50%) rotate(${-a}deg) scale(${1 + i * .03})` }, { transform: "translate(-50%,-50%)" }], { duration: 300 + i * 40 });
    }
    s.sound("burst");
    s.anim(box.querySelector(".lid"), [{ transform: "none" }, { transform: "translate(40px,-160px) rotate(60deg)", opacity: 0 }], { duration: 600, easing: "cubic-bezier(.2,.8,.3,1)" });
    s.anim(rays, [{ opacity: 0, transform: "translate(-50%,-50%) scale(.2) rotate(0)" }, { opacity: 1, transform: "translate(-50%,-50%) scale(1) rotate(90deg)" }], { duration: 900 });
    if (!s.skipped) rays.animate([{ rotate: "0deg" }, { rotate: "360deg" }], { duration: 14000, iterations: Infinity, composite: "add" });
    const br = box.getBoundingClientRect(); s.burst(br.left + br.width / 2, br.top + br.height / 3, { n: 100, colors: [c, "#fff", "#00f0ff", "#ff00e5"], speed: 10 });
    await s.anim(box, [{ opacity: 1 }, { opacity: 0, transform: "translate(-50%,-50%) scale(.6) translateY(40px)" }], { duration: 450 });
    const look = item.categoria === "poder" ? null : { ...av, [item.categoria]: item.id };
    const prev = s.add(`<div class="cs-prize" style="--rc:${c}">${look ? `${fundoSVG(item.categoria === "fundo" ? item.id : (av.fundo || "espaco"))}<div class="dm dm-live">${deltaSVG({ ...look, expr: "comemorando" })}</div>`
      : `<svg viewBox="0 0 24 24" class="ic" style="width:60%;height:60%;margin:auto;stroke:#7fe7ff"><path d="M12 2v20M4 7l16 10M20 7 4 17"/><path d="m9 4 3 2 3-2M9 20l3-2 3 2"/></svg>`}</div>`);
    await s.anim(prev, [{ opacity: 0, transform: "translate(-50%,-50%) scale(.2) translateY(60px)" }, { opacity: 1, transform: "translate(-50%,-50%) scale(1.1)", offset: .7 }, { opacity: 1, transform: "translate(-50%,-50%) scale(1)" }], { duration: 700, easing: SPRING });
    const rar = { comum: "Comum", raro: "Raro", epico: "Épico", lendario: "Lendário" }[item.raridade];
    const cap = s.add(`<div class="cs-caption">${esc(item.nome)}</div>`);
    const sub = s.add(`<div class="cs-sub"><span class="cs-rar" style="--rc:${c}">${rar}</span> ${item.categoria === "poder" ? "Guardado para proteger sua sequência." : "Novo no seu guarda-roupa."}</div>`);
    s.anim(cap, [{ opacity: 0, transform: "translate(-50%,12px)" }, { opacity: 1, transform: "translate(-50%,0)" }], { duration: 400 });
    s.anim(sub, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 150 });
    await s.wait(400);
    return s.buttons(item.categoria === "poder" ? [["ok", "Boa!"]] : [["later", "Depois", "btn"], ["equip", "Usar agora"]]);
  });
}

// ============================================================
// 5) CONQUISTA: a medalha gira, pousa e brilha
// ============================================================
export function csConquista(a, av) {
  return run(async s => {
    s.stage.classList.add("cs-space");
    const m = s.add(`<div class="cs-medal">${medalSVG(a.icone)}<i class="shine"></i></div>`);
    s.sound("whoosh");
    await s.anim(m, [{ transform: "translate(-50%,-50%) translateY(-60vh) rotateY(0)" }, { transform: "translate(-50%,-50%) rotateY(720deg)" }], { duration: 1100, easing: "cubic-bezier(.3,.1,.3,1)" });
    s.sound("achievement");
    await s.anim(m, [{ transform: "translate(-50%,-50%) scale(1)" }, { transform: "translate(-50%,-50%) scale(1.18)" }, { transform: "translate(-50%,-50%) scale(1)" }], { duration: 450, easing: SPRING });
    s.anim(m.querySelector(".shine"), [{ transform: "translateX(-140%) rotate(20deg)" }, { transform: "translateX(140%) rotate(20deg)" }], { duration: 800 });
    const r = m.getBoundingClientRect(); s.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 70, colors: ["#ffc53d", "#fff", "#00f0ff", "#ff00e5"] });
    const cap = s.add(`<div class="cs-caption">${esc(a.titulo)}</div>`);
    const sub = s.add(`<div class="cs-sub">${esc(a.descricao)}${a.recompensa ? ` <span class="price">+${a.recompensa} ${COIN}</span>` : ""}</div>`);
    s.anim(cap, [{ opacity: 0, transform: "translate(-50%,12px)" }, { opacity: 1, transform: "translate(-50%,0)" }], { duration: 400 });
    s.anim(sub, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 150 });
    const d = s.add(dm(av, "comemorando", "cs-side"));
    s.anim(d, [{ transform: "translateX(40vw)" }, { transform: "none" }], { duration: 600, easing: SPRING });
    if (a.recompensa) s.sound("coin");
    await s.wait(400);
    return s.buttons([["ok", "Continuar"]]);
  });
}
