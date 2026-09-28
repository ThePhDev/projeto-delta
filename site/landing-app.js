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
