/* Projeto Delta: questão real de cada eixo, respondível na página inicial */
import { SUBJECTS } from "./app/content.js";

const host = document.getElementById("demo");
if (host) {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pool = SUBJECTS.map(s => s.unidades.flatMap(u => u.licoes.flatMap(l => l.questoes.map(q => ({ q, l })))));
  const seen = SUBJECTS.map(() => -1);
  let eixo = 0;

  function pick(i) {
    let k;
    do { k = Math.floor(Math.random() * pool[i].length); } while (pool[i].length > 1 && k === seen[i]);
    seen[i] = k;
    return pool[i][k];
  }

  function render(i, animate) {
    eixo = i;
    const s = SUBJECTS[i], { q, l } = pick(i);
    host.style.setProperty("--h", s.hue);
    host.innerHTML = `
      <div class="dh">
        <span class="sym" aria-hidden="true">${esc(s.simbolo)}</span>
        <span><b>${esc(s.nome)}</b><br><small>Lição: ${esc(l.titulo)}</small></span>
        <button class="again" type="button">Outra questão</button>
      </div>
      <p class="dq ${animate ? "swap" : ""}">${esc(q.q)}</p>
      <div class="dopts ${animate ? "swap" : ""}">${q.o.map((o, k) => `<button class="dopt" type="button" data-k="${k}"><span class="k">${"ABCD"[k]}</span><span>${esc(o)}</span></button>`).join("")}</div>
      <div class="dfb"><div><p></p><a class="go" href="app/#/trilha/${esc(s.id)}">Treinar ${esc(s.nome)} na plataforma</a></div></div>`;
    host.querySelector(".again").onclick = () => render(eixo, true);
    const opts = [...host.querySelectorAll(".dopt")], fb = host.querySelector(".dfb");
    opts.forEach(b => b.onclick = () => {
      const k = +b.dataset.k, ok = k === q.c;
      opts.forEach(x => x.disabled = true);
      opts[q.c].classList.add("ok");
      if (!ok) b.classList.add("no");
      fb.querySelector("p").textContent = (ok ? "Acertou. " : "Quase. A resposta é " + "ABCD"[q.c] + ". ") + q.e;
      fb.classList.add("show");
    });
  }

  document.addEventListener("eixo:change", e => render(e.detail.i, true));
  render(0, false);
}
