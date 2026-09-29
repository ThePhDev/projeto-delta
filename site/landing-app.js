// Landing: o mascote Delta ao vivo (fala, reage ao toque e inclina em 3D com o ponteiro)
import { deltaSVG, fundoSVG } from "./app/mascot.js";

const stage = document.getElementById("appStage");
if (stage) {
  const say = document.getElementById("appSay");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LOOK = { cor: "teal", fundo: "galaxia" };
  const FALAS = [
    ["feliz", "Oi! Eu sou o Delta, seu parceiro de Matemática."],
    ["pensando", "Porcentagem, funções, geometria... a gente vê tudo por partes."],
    ["comemorando", "Acertou? Combo! Eu comemoro junto."],
    ["triste", "Errou? Tudo bem. Eu explico e a questão volta na hora certa."],
    ["surpreso", "Essa aqui caiu no ENEM de verdade. Tem selo de Oficial."],
    ["feliz", "Me toca que eu pulo."]
  ];
  stage.insertAdjacentHTML("afterbegin", fundoSVG(LOOK.fundo));
  const dm = document.createElement("div");
  dm.className = "dm dm-live";
  stage.appendChild(dm);
  let i = 0, typing = 0;
  const draw = expr => { dm.innerHTML = deltaSVG({ ...LOOK, expr }); };
  function falar(k) {
    const [expr, txt] = FALAS[k % FALAS.length];
    draw(expr);
    const tok = ++typing;
    if (reduce) { say.textContent = txt; return; }
    say.textContent = "";
    let n = 0;
    (function tick() { if (tok !== typing) return; say.textContent = txt.slice(0, ++n); if (n < txt.length) setTimeout(tick, 22); })();
  }
  let timer = null;
  const start = () => { if (!timer) timer = setInterval(() => falar(++i), 4200); };
  const stop = () => { clearInterval(timer); timer = null; };
  new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), { threshold: .3 }).observe(stage);
  falar(0);
  dm.addEventListener("click", () => {
    falar(2); dm.classList.remove("jump"); void dm.offsetWidth; dm.classList.add("jump");
  });
  dm.style.cursor = "pointer";
  if (!reduce && matchMedia("(hover:hover)").matches) {
    stage.addEventListener("pointermove", e => {
      const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      dm.style.transform = `translateX(-50%) rotateY(${x * 30}deg) rotateX(${-y * 16}deg) translateZ(30px)`;
    });
    stage.addEventListener("pointerleave", () => { dm.style.transform = ""; });
  }
}

// mini cenas reais da plataforma nos cartões do app
{
  const tri = document.querySelector('[data-mini="trilha"]');
  if (tri) {
    const node = (bg, sh, icon) => `<span class="nd" style="background:${bg};--s:${sh}"><svg viewBox="0 0 24 24">${icon}</svg></span>`;
    const ok = '<path d="m5 12 5 5 9-10"/>', star = '<path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.3 7.2 18.9l.9-5.4L4.2 9.7l5.4-.8L12 4Z"/>', lock = '<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8.5 11V8.5a3.5 3.5 0 0 1 7 0V11"/>';
    tri.innerHTML = node("linear-gradient(140deg,#8b5cf6,#d946ef)", "#5b21b6", ok) + '<span class="ln"></span>' + node("linear-gradient(140deg,#8b5cf6,#d946ef)", "#5b21b6", ok)
      + '<span class="ln"></span>' + node("linear-gradient(140deg,#00f0ff,#2979ff)", "#1e40af", star) + '<span class="ln"></span>' + node("#2a2840", "#15141f", lock);
  }
  const loja = document.querySelector('[data-mini="loja"]');
  if (loja) loja.innerHTML = [["espaco", {}], ["lua", { cabeca: "coroa-delta" }], ["cidade-neon", { cabeca: "antena", corpo: "moletom-roxo", cor: "rosa" }]]
    .map(([f, o]) => `<span class="av">${fundoSVG(f)}<span class="dm">${deltaSVG({ cor: "teal", ...o, expr: "feliz" })}</span></span>`).join("");
  const sem = document.querySelector('[data-mini="semana"]');
  if (sem) sem.innerHTML = `<div class="wk">${["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => `<span>${d}<i class="${[0, 2, 4].includes(i) ? "on" : i === 3 ? "rv" : ""}"></i></span>`).join("")}</div>`;
}
