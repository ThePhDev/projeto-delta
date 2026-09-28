// ============================================================
// PROJETO DELTA · cronograma personalizável, diagnóstico inicial,
// sugestões automáticas, feedback dos estudantes e guia de uso
// ============================================================
import { SUBJECTS } from "./content.js";
import { sb, state, navigate, shell, page, LESSON, TOPIC, EIXO, av, revisoesHoje, today, updateTopic, touchStreak, refreshStats } from "./core.js";
import { lessonQs, runSession } from "./learn.js";
import { deltaSVG } from "./mascot.js";
import { ic } from "./icons.js";
import { h, esc, toast, modal, sheet, confetti, shuffle } from "./ui.js";
import { sfx } from "./sfx.js";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MINS = [10, 20, 30, 45, 60];

// ---------- dados do cronograma (no perfil) ----------
export const plano = () => state.profile?.cronograma || {};
export async function salvarPlano(p) {
  state.profile.cronograma = p;
  const { error } = await sb.from("profiles").update({ cronograma: p }).eq("id", state.session.user.id);
  if (error) { console.error(error); toast("Não deu para salvar o cronograma."); return false; }
  return true;
}

// ---------- minutos estudados hoje (medidos nas sessões) ----------
export function somarMinutos(seg) {
  const k = "delta-min-" + today();
  try { localStorage.setItem(k, String((+localStorage.getItem(k) || 0) + seg)); } catch (e) {}
}
export function minutosHoje() { try { return Math.round((+localStorage.getItem("delta-min-" + today()) || 0) / 60); } catch (e) { return 0; } }

// acerto por eixo: diagnóstico + histórico de tópicos
function forcaEixos() {
  const d = plano().diag || {};
  return SUBJECTS.map(s => {
    let a = 0, e = 0;
    Object.values(state.topics).forEach(t => { if (TOPIC[t.topic_id]?.s.id === s.id) { a += t.acertos || 0; e += t.erros || 0; } });
    const hist = a + e >= 3 ? a / (a + e) * 100 : null;
    const p = d[s.id] != null && hist != null ? (d[s.id] + hist) / 2 : d[s.id] ?? hist ?? 50;
    return { id: s.id, p };
  });
}

// sugestão automática: eixos mais fracos ganham mais dias
export function sugerirPlano(diasAtivos, min) {
  const f = forcaEixos().sort((a, b) => a.p - b.p);
  const pesos = f.map(x => ({ id: x.id, w: Math.max(1, Math.round((110 - x.p) / 20)) }));
  const fila = []; pesos.forEach(x => { for (let i = 0; i < x.w; i++) fila.push(x.id); });
  const ordem = []; while (fila.length) { const i = ordem.length ? fila.findIndex(x => x !== ordem[ordem.length - 1]) : 0; ordem.push(...fila.splice(i < 0 ? 0 : i, 1)); }
  const dias = {}; let k = 0;
  for (let d = 0; d < 7; d++) {
    if (!diasAtivos.includes(d)) { dias[d] = { min: 0, eixos: [] }; continue; }
    const e1 = ordem[k++ % ordem.length]; let e2 = ordem[k % ordem.length];
    dias[d] = { min, eixos: min >= 30 && e2 !== e1 ? (k++, [e1, e2]) : [e1] };
  }
  return dias;
}

// próxima lição de um eixo
function proximaDoEixo(eixo) {
  const flat = EIXO[eixo].unidades.flatMap(u => u.licoes);
  return (flat.find(l => !(state.lessons[l.id]?.estrelas > 0)) || flat[0]).id;
}

// ============================================================
// CARTÕES DA TELA INICIAL: cronograma de hoje, sugestões, diagnóstico
// ============================================================
export function cartoesHoje() {
  const p = plano(), hoje = p.dias?.[new Date().getDay()];
  const cards = [];
  if (!p.diag) cards.push(`<a class="pcard diag" href="#/diagnostico"><span class="pi">${ic("target")}</span><div><b>Diagnóstico inicial</b><small>8 questões para descobrir por onde começar</small></div></a>`);
  if (!p.dias) cards.push(`<a class="pcard" href="#/cronograma"><span class="pi">${ic("calendar")}</span><div><b>Monte seu cronograma</b><small>Escolha os dias e o Delta sugere o que estudar</small></div></a>`);
  else if (hoje?.min) {
    const feito = minutosHoje(), pct = Math.min(100, Math.round(feito / hoje.min * 100));
    const e = hoje.eixos[0];
    cards.push(`<a class="pcard hoje" href="#/licao/${proximaDoEixo(e)}" data-eixo="${e}"><span class="pi ring" style="--p:${pct}">${ic("calendar")}</span><div><b>Hoje: ${hoje.min} min de ${hoje.eixos.map(x => esc(EIXO[x].nome.split(" ")[0])).join(" e ")}</b><small>${feito >= hoje.min ? "Cronograma de hoje cumprido!" : `${feito} de ${hoje.min} min feitos · toque para estudar`}</small></div></a>`);
  } else cards.push(`<a class="pcard" href="#/cronograma"><span class="pi">${ic("moon")}</span><div><b>Hoje é folga no cronograma</b><small>Quer adiantar? Qualquer lição conta.</small></div></a>`);
  // sugestões automáticas pelo desempenho
  const due = revisoesHoje();
  if (due.length) cards.push(`<a class="pcard" href="#/treino/revisao"><span class="pi">${ic("cycle")}</span><div><b>Revisar ${esc(TOPIC[due[0].topic_id].l.titulo)}</b><small>${due.length > 1 ? `e mais ${due.length - 1} no ponto de revisão` : "Está no dia certo de revisar"}</small></div></a>`);
  const fraco = Object.values(state.topics).filter(t => TOPIC[t.topic_id] && (t.acertos + t.erros) >= 3).map(t => ({ t, p: t.acertos / (t.acertos + t.erros) })).sort((a, b) => a.p - b.p)[0];
  if (fraco && fraco.p < .7) cards.push(`<a class="pcard" href="#/licao/${TOPIC[fraco.t.topic_id].l.id}"><span class="pi">${ic("bolt")}</span><div><b>Reforçar ${esc(TOPIC[fraco.t.topic_id].l.titulo)}</b><small>Seu acerto aqui está em ${Math.round(fraco.p * 100)}%</small></div></a>`);
  return cards.length ? `<div class="pcards" aria-label="Para você hoje">${cards.join("")}</div>` : "";
}
export function ligarCartoes(v, setEixo) {
  v.querySelectorAll(".pcard[data-eixo]").forEach(a => a.addEventListener("click", () => setEixo(a.dataset.eixo)));
}

// ============================================================
// CRONOGRAMA
// ============================================================
export function viewCronograma() {
  const p = plano();
  let dias = p.dias || sugerirPlano([1, 2, 3, 4, 5], { 20: 20, 50: 20, 100: 30 }[state.profile.meta_diaria] || 20);
  const hoje = new Date().getDay();
  const v = shell("cronograma", `${page("Cronograma", "Organize o que estudar em cada dia. O Delta sugere com base no seu desempenho.")}
    <div class="card pad crono-top">
      <div class="talk"><div class="dm dm-live">${deltaSVG({ ...av(), expr: "pensando" })}</div><div class="bubble left" id="dica"></div></div>
      <div class="row2" style="display:flex;gap:.6rem;margin-top:.8rem;flex-wrap:wrap"><button class="btn btn-teal" id="sug">${ic("sparkle")}Sugerir pelo meu desempenho</button>${p.diag ? "" : `<a class="btn" href="#/diagnostico">${ic("target")}Fazer diagnóstico</a>`}</div>
    </div>
    <div id="semana"></div>
    <div class="card pad" id="resumo" style="margin-top:1rem"></div>`);
  const fr = forcaEixos().sort((a, b) => a.p - b.p);
  v.querySelector("#dica").textContent = p.diag || Object.keys(state.topics).length
    ? `Pelo que vi, ${EIXO[fr[0].id].nome} precisa de mais atenção. Coloquei esse eixo em mais dias.`
    : "Escolha os dias em que você pode estudar. Depois do diagnóstico, eu ajusto os eixos para os seus pontos fracos.";
  let t;
  const salvar = () => { clearTimeout(t); t = setTimeout(async () => { if (await salvarPlano({ ...plano(), dias, atualizado: today() })) { sfx.tap(); toast("Cronograma salvo."); } }, 500); };
  function draw() {
    v.querySelector("#semana").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => { const x = dias[d] || { min: 0, eixos: [] }, on = x.min > 0;
      return `<div class="dia card ${on ? "" : "off"} ${d === hoje ? "hoje" : ""}" data-d="${d}">
        <div class="dh"><b>${DIAS[d]}${d === hoje ? ' <span class="tag tec">Hoje</span>' : ""}</b><button class="switch ${on ? "on" : ""}" role="switch" aria-checked="${on}" aria-label="Estudar ${DIAS[d]}" data-t></button></div>
        ${on ? `<div class="segs mins">${MINS.map(m => `<button data-m="${m}" class="${x.min === m ? "on" : ""}">${m} min</button>`).join("")}</div>
          <div class="echips">${SUBJECTS.map(s => `<button data-e="${s.id}" class="${x.eixos.includes(s.id) ? "on" : ""}" style="--h:${s.hue}"><span>${esc(s.simbolo)}</span>${esc(s.nome.split(" ")[0])}</button>`).join("")}</div>` : `<small class="muted">Folga</small>`}
      </div>`; }).join("");
    const tot = Object.values(dias).reduce((a, x) => a + (x.min || 0), 0);
    const por = {}; Object.values(dias).forEach(x => x.eixos.forEach(e => por[e] = (por[e] || 0) + x.min / x.eixos.length));
    v.querySelector("#resumo").innerHTML = `<h3 style="font-weight:900;margin-bottom:.5rem">${ic("chart")} Sua semana: ${Math.floor(tot / 60)} h ${tot % 60} min</h3>` +
      SUBJECTS.map(s => { const m = Math.round(por[s.id] || 0); return `<div class="weak"><span class="n">${esc(s.nome)}</span><span class="t"><i style="width:${tot ? m / tot * 100 : 0}%;background:hsl(${s.hue} 80% 60%)"></i></span><span class="p">${m}m</span></div>`; }).join("");
    v.querySelectorAll(".dia").forEach(el => { const d = +el.dataset.d;
      el.querySelector("[data-t]").onclick = () => { const x = dias[d] || { min: 0, eixos: [] }; dias[d] = x.min ? { min: 0, eixos: [] } : { min: 20, eixos: [fr[0].id] }; sfx.select(); draw(); salvar(); };
      el.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { dias[d].min = +b.dataset.m; sfx.tap(); draw(); salvar(); });
      el.querySelectorAll("[data-e]").forEach(b => b.onclick = () => { const x = dias[d], e = b.dataset.e; x.eixos = x.eixos.includes(e) ? x.eixos.filter(y => y !== e) : [...x.eixos, e].slice(-2); if (!x.eixos.length) x.eixos = [e]; sfx.tap(); draw(); salvar(); });
    });
  }
  v.querySelector("#sug").onclick = () => { const ativos = Object.keys(dias).filter(d => dias[d].min).map(Number); dias = sugerirPlano(ativos.length ? ativos : [1, 2, 3, 4, 5], Math.max(...Object.values(dias).map(x => x.min), 20)); sfx.correct(); draw(); salvar(); };
  draw();
  if (!p.dias) salvar();
}

// ============================================================
// DIAGNÓSTICO INICIAL (2 questões por eixo, sem vidas)
// ============================================================
export function viewDiagnostico() {
  const w = shell("praticar", `<div class="intro-hero" style="margin-top:-1rem">
      <div class="dm dm-live popin">${deltaSVG({ ...av(), expr: "pensando" })}</div>
      <h1>Diagnóstico inicial</h1><p>8 questões, 2 de cada eixo. Sem vidas e sem pressão: é só para eu entender por onde você deve começar.</p></div>
    <div class="meta-chips"><div>${ic("question")}8 questões</div><div>${ic("clock")}~8 min</div><div>${ic("heart")}Sem vidas</div><div>${ic("calendar")}Monta o cronograma</div></div>
    <div class="card learn"><h3>${ic("target")}O que acontece depois</h3><ul>
      <li>${ic("check")}Você vê seu nível em cada eixo</li><li>${ic("check")}Os assuntos que você errou entram na revisão</li><li>${ic("check")}O cronograma prioriza seus pontos fracos</li></ul></div>
    <button class="btn btn-lime btn-block" id="go" style="margin-top:1rem">Começar diagnóstico</button>`, { rail: false });
  w.querySelector("#go").onclick = () => {
    sfx.whoosh();
    const items = SUBJECTS.flatMap(s => shuffle(s.unidades.slice(0, 3)).slice(0, 2).map(u => ({ ...lessonQs(u.licoes[Math.random() * u.licoes.length | 0], 1)[0] })));
    runSession(shuffle(items), { mode: "diagnostico", noHearts: true, noRetry: true, exit: "/inicio", custom: resultadoDiag });
  };
}

async function resultadoDiag(r) {
  const diag = {};
  SUBJECTS.forEach(s => { let a = 0, n = 0; Object.entries(r.porTopico).forEach(([t, [x, y]]) => { if (TOPIC[t]?.s.id === s.id) { a += x; n += y; } }); diag[s.id] = n ? Math.round(a / n * 100) : 50; });
  await salvarPlano({ ...plano(), diag, diag_em: today() });
  for (const [t, [a, n]] of Object.entries(r.porTopico)) if (TOPIC[t]) await updateTopic(t, a, n);
  await r.xpChain; await touchStreak(); await refreshStats();
  somarMinutos(r.tempo);
  const nivel = p => p >= 100 ? ["Forte", "var(--green)"] : p >= 50 ? ["Em construção", "var(--gold)"] : ["Comece por aqui", "var(--red)"];
  const fraco = SUBJECTS.slice().sort((a, b) => diag[a.id] - diag[b.id])[0];
  const v = shell("praticar", `<div class="done" style="min-height:auto;padding-top:0">
      <div class="dm dm-live popin">${deltaSVG({ ...av(), expr: "comemorando" })}</div>
      <h1>Diagnóstico pronto!</h1><p class="sub">${r.acertos} de ${r.total} certas. Agora eu sei por onde começar.</p></div>
    <div class="card pad">${SUBJECTS.map(s => { const [n, c] = nivel(diag[s.id]); return `<div class="weak"><span class="n">${esc(s.nome)}</span><span class="t"><i style="width:${Math.max(6, diag[s.id])}%;background:${c}"></i></span><span class="p" style="width:auto;color:${c}">${n}</span></div>`; }).join("")}</div>
    <div class="talk" style="margin-top:1rem"><div class="dm dm-live">${deltaSVG({ ...av(), expr: "feliz" })}</div><div class="bubble left">Sugiro começar por ${esc(fraco.nome)}. Montei um cronograma que dá mais dias para ele.</div></div>
    <div class="row2" style="display:flex;gap:.6rem;margin-top:1rem"><a class="btn" style="flex:1" href="#/cronograma">${ic("calendar")}Ver cronograma</a><button class="btn btn-lime" style="flex:1" id="ir">Começar por ${esc(fraco.nome.split(" ")[0])}</button></div>`, { rail: false });
  sfx.finish(); confetti(100);
  const p = plano();
  const ativos = p.dias ? Object.keys(p.dias).filter(d => p.dias[d].min).map(Number) : [1, 2, 3, 4, 5];
  await salvarPlano({ ...p, dias: sugerirPlano(ativos.length ? ativos : [1, 2, 3, 4, 5], 20), atualizado: today() });
  v.querySelector("#ir").onclick = () => { try { localStorage.setItem("delta-eixo", fraco.id); } catch (e) {} navigate("/licao/" + proximaDoEixo(fraco.id)); };
}

// ============================================================
// FEEDBACK DOS ESTUDANTES (pesquisa-ação)
// ============================================================
const CATS = ["Conteúdo", "Visual", "Facilidade de uso", "Questões", "Velocidade", "Outro"];
export function abrirFeedback(pagina = "app") {
  let nota = 0; const cats = new Set();
  const s = sheet("Sua opinião melhora o Delta", `<p class="muted" style="font-weight:700">O Projeto Delta é construído com os estudantes. Conte o que achou: a equipe lê tudo e ajusta a plataforma.</p>
    <div class="stars5" role="radiogroup" aria-label="Nota">${[1, 2, 3, 4, 5].map(n => `<button data-n="${n}" aria-label="${n} de 5">${ic("star")}</button>`).join("")}</div>
    <p style="font-weight:900;margin:.8rem 0 .4rem">Sobre o quê?</p>
    <div class="fchips">${CATS.map(c => `<button data-c="${c}">${c}</button>`).join("")}</div>
    <textarea id="ft" maxlength="1000" rows="4" placeholder="O que ajudou? O que poderia melhorar?"></textarea>
    <button class="btn btn-lime btn-block" id="env" disabled>Enviar</button>`);
  s.querySelectorAll("[data-n]").forEach(b => b.onclick = () => { nota = +b.dataset.n; sfx.select(); s.querySelectorAll("[data-n]").forEach(x => x.classList.toggle("on", +x.dataset.n <= nota)); s.querySelector("#env").disabled = false; });
  s.querySelectorAll("[data-c]").forEach(b => b.onclick = () => { cats.has(b.dataset.c) ? cats.delete(b.dataset.c) : cats.add(b.dataset.c); b.classList.toggle("on"); sfx.tap(); });
  s.querySelector("#env").onclick = async e => {
    e.currentTarget.disabled = true;
    const { error } = await sb.from("feedback").insert({ user_id: state.session.user.id, nota, categorias: [...cats], texto: s.querySelector("#ft").value.trim() || null, pagina });
    if (error) { e.currentTarget.disabled = false; return toast("Não deu para enviar agora."); }
    s.close(); sfx.achievement(); toast("Obrigado! Seu feedback chegou à equipe.");
    salvarPlano({ ...plano(), fb: today() });
  };
}
// pede feedback uma vez, depois da 3ª lição concluída
export function talvezPedirFeedback() {
  const n = Object.values(state.lessons).filter(l => l.estrelas > 0).length;
  if (n < 3 || plano().fb || plano().fb_pedido) return Promise.resolve();
  return new Promise(res => {
    salvarPlano({ ...plano(), fb_pedido: today() });
    const m = modal(`<div class="dm dm-live">${deltaSVG({ ...av(), expr: "feliz" })}</div><h2>Posso te pedir uma ajuda?</h2><p>Você já fez ${n} lições. Em 30 segundos, conte para a equipe o que está achando do Delta.</p>
      <div class="row2"><button class="btn" id="n">Agora não</button><button class="btn btn-lime" id="y">Dar opinião</button></div>`, { onClose: res });
    m.querySelector("#n").onclick = () => m.close();
    m.querySelector("#y").onclick = () => { m.close(); abrirFeedback("pos-licao"); };
  });
}

// ============================================================
// GUIA DE USO (capacitação)
// ============================================================
export function abrirGuia() {
  const secs = [
    ["home", "Trilha", "Cada eixo tem 4 unidades com 4 lições. Complete uma lição para liberar a próxima e abra o baú de desafio no fim da unidade."],
    ["book", "Lições", "Começam com um exemplo guiado e misturam recordação ativa, intercalação e revisão espaçada. Errou? Use \"Refazer comigo\" e a questão volta com uma nova chance."],
    ["star", "Origem das questões", "Oficial ENEM é prova real do INEP. Plataforma é criada pela equipe Delta, muitas inspiradas em questões do ENEM."],
    ["calendar", "Cronograma", "Escolha os dias e minutos de estudo. O Delta sugere os eixos pelo seu desempenho e mostra o que fazer hoje."],
    ["target", "Praticar", "Revisão do dia, treinos por eixo, Banco ENEM com filtro por ano, assunto e dificuldade, e simulados cronometrados."],
    ["bag", "Deltas e loja", "Você ganha Deltas estudando. Troque por itens para o seu astronauta ou por dicas nas questões."],
    ["fire", "Sequência", "Estude um pouco todo dia. O congelamento, comprado na loja, protege a sequência num dia de folga."],
    ["chart", "Painel e caderno de erros", "Veja seu acerto por eixo e revise os erros anotando o motivo de cada um."]
  ];
  sheet("Como usar o Delta", secs.map(([i, t, d]) => `<div class="tech card" style="margin-top:.6rem"><h3>${ic(i)}${t}</h3><p>${d}</p></div>`).join("") + `<button class="btn btn-block" id="fbg" style="margin-top:1rem">${ic("mail")}Enviar feedback para a equipe</button>`)
    .querySelector("#fbg").onclick = () => { document.querySelector(".sheet")?.close?.(); abrirFeedback("guia"); };
}
