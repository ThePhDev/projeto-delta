// ============================================================
// PROJETO DELTA · aprender: trilha, lição, player, recompensas,
// treinos, banco ENEM e simulado
// ============================================================
import { SUBJECTS } from "./content.js";
import { VARIACOES, origemLabel } from "./bank.js";
import { GEN } from "./gen.js";
import {
  sb, state, root, navigate, shell, page, LESSON, TOPIC, EIXO, OBJETIVOS, TOPICO_OFICIAL, OFICIAL_EIXO, VAR_BY_ID,
  av, nivelDe, addXP, touchStreak, claimAchievements, saveLesson, updateTopic, logAttempt, logError, refreshStats,
  revisoesHoje, seen, markSeen, goalRing, primeiroNome, updateTop
} from "./core.js";
import { deltaSVG, avatarHTML, COIN } from "./mascot.js";
import { ic, STAR_SOLID, HEART_SOLID, medalSVG } from "./icons.js";
import { h, esc, shuffle, sleep, toast, mdStatement, modal, sheet, confetti, flyText, coinBurst, countUp, typeText, react, coach, reduceMotion } from "./ui.js";
import { sfx } from "./sfx.js";
import { csStreak, csLevelUp, csConquista } from "./cutscene.js";
import { cartoesHoje, ligarCartoes, somarMinutos, talvezPedirFeedback } from "./plan.js";

const LETRAS = "ABCDE";
const pick = a => a[Math.random() * a.length | 0];
const fmtT = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ============================================================
// NORMALIZAÇÃO DAS QUESTÕES
// ============================================================
const passosDe = e => String(e || "").split(/(?<=[.;:])\s+(?=[A-ZÀ-Ú0-9(])/).filter(Boolean);
function fromLesson(lessonId, i) {
  const L = LESSON[lessonId], q = L.l.questoes[i];
  const order = shuffle(q.o.map((_, k) => k));
  return { ref: `${lessonId}:${i}`, kind: "plat", label: "Questão da plataforma", topico: L.l.topico, eixo: L.s.id,
    stmt: `<p>${esc(q.q)}</p>`, opts: order.map(k => esc(q.o[k])), c: order.indexOf(q.c), e: q.e, passos: passosDe(q.e) };
}
// questão gerada: números novos a cada vez
export function fromGen(topico) {
  const g = GEN[topico]; if (!g) return null;
  const q = g(), T = TOPIC[topico];
  return { ref: `gen:${topico}`, kind: "plat", label: "Questão da plataforma", topico, eixo: T?.s.id || null, gen: true,
    stmt: `<p>${esc(q.q)}</p>`, opts: q.o.map(esc), c: q.c, e: q.e, passos: q.passos };
}
// todas as questões possíveis de uma lição (autorais ou geradas)
export function lessonQs(l, n = 5) {
  if (l.gen) return Array.from({ length: n }, () => fromGen(l.topico));
  return shuffle(l.questoes.map((_, i) => fromLesson(l.id, i))).slice(0, n);
}
const concluidas = () => Object.keys(state.lessons).filter(id => state.lessons[id]?.estrelas > 0 && LESSON[id]);
function fromVar(v) {
  return { ref: v.id, kind: "var", label: origemLabel(v), topico: v.topico, eixo: v.eixo,
    stmt: `<p>${esc(v.q)}</p>`, opts: v.o.map(esc), c: v.c, e: v.e, passos: passosDe(v.e) };
}
function fromOficial(q) {
  const alts = (q.question_alternatives || []).slice().sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || a.letter.localeCompare(b.letter));
  const c = alts.findIndex(a => a.letter === q.correct_answer);
  const topico = Object.keys(TOPICO_OFICIAL).find(k => TOPICO_OFICIAL[k] === q.topic) || null;
  return { ref: String(q.id), kind: "oficial", label: `ENEM ${q.year} · questão ${q.original_number}`, dif: DIF[q.difficulty] || null, topico, topicoOficial: q.topic, eixo: OFICIAL_EIXO[q.topic] || null,
    stmt: mdStatement(q.statement), opts: alts.map(a => mdStatement(a.content).replace(/^<p>|<\/p>$/g, "")), c, letras: alts.map(a => a.letter),
    e: `Gabarito oficial do INEP: letra ${q.correct_answer}.${q.topic ? " Assunto: " + q.topic + "." : ""}`, ano: q.year };
}

const SEL_Q = "id,year,original_number,primary_subject,topic,difficulty,statement,correct_answer,question_alternatives(letter,content,display_order)";
const DIF = { facil: "Fácil", media: "Média", dificil: "Difícil" };
export async function fetchOficiais({ topics, n = 1, ano, ids, dif } = {}) {
  try {
    let pool = ids;
    if (!pool) {
      let q = sb.from("questions").select("id").eq("publication_status", "published").eq("primary_subject", "Matemática");
      if (topics?.length) q = q.in("topic", topics);
      if (ano) q = q.eq("year", ano);
      if (dif) q = q.eq("difficulty", dif);
      const { data, error } = await q.limit(1000);
      if (error || !data?.length) return [];
      pool = shuffle(data.map(r => r.id)).slice(0, n);
    }
    if (!pool.length) return [];
    const { data: qs, error } = await sb.from("questions").select(SEL_Q).in("id", pool);
    if (error) return [];
    return shuffle(qs || []).map(fromOficial).filter(x => x.c >= 0 && x.opts.length >= 2);
  } catch (e) { console.error(e); return []; }
}

// ============================================================
// TRILHA (início)
// ============================================================
function lessonState(eixo) {
  const flat = eixo.unidades.flatMap(u => u.licoes);
  const cur = flat.find(l => !(state.lessons[l.id]?.estrelas > 0));
  return { flat, cur: cur?.id || null };
}
let eixoAtual = null;

export function viewInicio() {
  if (!eixoAtual) { try { eixoAtual = localStorage.getItem("delta-eixo"); } catch (e) {} }
  if (!EIXO[eixoAtual]) eixoAtual = SUBJECTS[0].id;
  const s = EIXO[eixoAtual];
  const { flat, cur } = lessonState(s);
  const done = flat.filter(l => state.lessons[l.id]?.estrelas > 0).length;
  const hora = new Date().getHours();
  const saud = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  const eixos = `<div class="eixos" role="tablist" aria-label="Eixos da Matemática">${SUBJECTS.map(x => {
    const d = x.unidades.flatMap(u => u.licoes).filter(l => state.lessons[l.id]?.estrelas > 0).length;
    return `<button role="tab" aria-selected="${x.id === s.id}" class="${x.id === s.id ? "on" : ""}" data-e="${x.id}" style="--h:${x.hue}"><span class="s">${esc(x.simbolo)}</span>${esc(x.nome)}<small class="muted">${d}/${x.unidades.flatMap(u => u.licoes).length}</small></button>`;
  }).join("")}</div>`;

  let idx = 0;
  const units = s.unidades.map((u, ui) => {
    const nodes = u.licoes.map((l, li) => {
      const st = state.lessons[l.id], isDone = st?.estrelas > 0, isCur = l.id === cur;
      const cls = isDone ? "done" : isCur ? "cur" : "lock";
      const x = [0, -58, 34, 62][(idx++) % 4];
      return `<div class="node ${cls}" style="--x:${x}px;--d:${idx * 0.06}s">
        ${isCur ? `<span class="start-bubble">${done ? "Continuar" : "Começar"}</span>` : ""}
        <button class="nb" data-l="${l.id}" aria-label="${esc(l.titulo)}${isDone ? ", concluída" : isCur ? ", atual" : ", bloqueada"}"><span>${ic(isDone ? "check" : isCur ? "star" : "lock")}</span></button>
        <div class="lbl">${esc(l.titulo)}</div>
        ${isDone ? `<div class="stars">${[1, 2, 3].map(k => STAR_SOLID.replace("<svg", `<svg class="${k <= st.estrelas ? "on" : ""}"`)).join("")}</div>` : ""}
      </div>`;
    }).join("");
    const allDone = u.licoes.every(l => state.lessons[l.id]?.estrelas > 0);
    const chestX = [0, -58, 34, 62][(idx++) % 4];
    return `<section aria-label="Unidade ${ui + 1}">
      <div class="unit-head" style="--h:${s.hue + ui * 18}"><div><h2>${esc(u.titulo)}</h2><div class="k">Unidade ${ui + 1} de ${s.unidades.length}</div></div>
        <button class="guia" data-g="${ui}">${ic("book")}Guia</button></div>
      <div class="path">${nodes}
        <div class="node chest ${allDone ? "" : "lock"}" style="--x:${chestX}px;--d:${idx * 0.06}s">
          <button class="nb" data-chest="${ui}" aria-label="Desafio da unidade ${ui + 1}${allDone ? "" : ", bloqueado"}"><span>${ic(allDone ? "gift" : "lock")}</span></button>
          <div class="lbl">Desafio da unidade</div></div>
      </div></section>`;
  }).join("");

  const v = shell("inicio", `
    <div class="ph"><h1>${saud}, ${esc(primeiroNome())}</h1><p>${done === flat.length ? "Eixo completo. Que tal outro?" : `${esc(s.nome)} · ${done} de ${flat.length} lições`}</p></div>
    ${cartoesHoje()}
    ${eixos}
    <div id="trail">${units}</div>`);

  const trail = v.querySelector("#trail");
  ligarCartoes(v, e => { eixoAtual = e; try { localStorage.setItem("delta-eixo", e); } catch (x) {} });
  v.querySelectorAll("[data-e]").forEach(b => b.onclick = () => {
    sfx.select(); eixoAtual = b.dataset.e; try { localStorage.setItem("delta-eixo", eixoAtual); } catch (e) {}
    viewInicio();
  });
  v.querySelectorAll("[data-g]").forEach(b => b.onclick = () => {
    sfx.tap();
    const u = s.unidades[+b.dataset.g];
    sheet(`Guia · ${u.titulo}`, u.licoes.map(l => `<div class="learn card" style="margin-top:.6rem"><h3>${ic("book")}${esc(l.titulo)}</h3><ul>${(OBJETIVOS[l.id] || []).map(o => `<li>${ic("check")}${esc(o)}</li>`).join("")}</ul></div>`).join(""));
  });
  trail.addEventListener("click", e => {
    const b = e.target.closest(".nb"); if (!b) return;
    const node = b.closest(".node");
    const open = node.querySelector(".pop");
    trail.querySelectorAll(".pop").forEach(p => p.remove());
    if (open) return;
    sfx.tap();
    let html;
    if (b.dataset.chest != null) {
      const ui = +b.dataset.chest, locked = node.classList.contains("lock");
      html = locked ? `<div class="pop lock"><h3>Desafio da unidade</h3><p>Conclua as 3 lições desta unidade para abrir o desafio.</p><button class="btn" disabled>${ic("lock")} Bloqueado</button></div>`
        : `<div class="pop"><h3>Desafio da unidade</h3><p>8 questões misturando a unidade, variações inspiradas no ENEM e uma questão oficial.</p><a class="btn" href="#/treino/unidade-${s.id}-${ui}">Encarar +XP</a></div>`;
    } else {
      const L = LESSON[b.dataset.l], st = state.lessons[L.l.id];
      if (node.classList.contains("lock")) html = `<div class="pop lock"><h3>${esc(L.l.titulo)}</h3><p>Conclua a lição anterior para liberar esta.</p><button class="btn" disabled>${ic("lock")} Bloqueada</button></div>`;
      else html = `<div class="pop"><h3>${esc(L.l.titulo)}</h3><p>Lição ${L.n} de ${L.s.unidades.flatMap(u => u.licoes).length}${st ? ` · recorde ${st.melhor_pontuacao}%` : ""}</p><a class="btn" href="#/licao/${L.l.id}">${st?.estrelas ? "Praticar de novo" : "Começar"}</a></div>`;
    }
    const pop = h(html); node.appendChild(pop);
    trail.querySelectorAll(".node.open").forEach(n => n.classList.remove("open")); node.classList.add("open");
    const r = pop.getBoundingClientRect(), dx = r.left < 12 ? 12 - r.left : r.right > innerWidth - 12 ? innerWidth - 12 - r.right : 0;
    if (dx) { pop.style.marginLeft = dx + "px"; pop.style.setProperty("--ax", dx + "px"); }
  });
  document.addEventListener("click", function off(e) {
    if (!document.body.contains(trail)) return document.removeEventListener("click", off);
    if (!e.target.closest(".node")) trail.querySelectorAll(".pop").forEach(p => p.remove());
  });

  // linhas tracejadas entre os nós e o astronauta ao lado da lição atual
  requestAnimationFrame(() => {
    v.querySelectorAll(".path").forEach(path => {
      const pr = path.getBoundingClientRect();
      const pts = [...path.querySelectorAll(".nb")].map(n => { const r = n.getBoundingClientRect(); return [r.left - pr.left + r.width / 2, r.top - pr.top + r.height / 2]; });
      if (pts.length < 2) return;
      let d = `M${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) { const [a, b] = pts[i - 1], [c, dd] = pts[i]; d += ` C${a} ${(b + dd) / 2} ${c} ${(b + dd) / 2} ${c} ${dd}`; }
      path.insertAdjacentHTML("afterbegin", `<svg class="links" aria-hidden="true"><path d="${d}" fill="none" stroke="var(--line-2)" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 14"/></svg>`);
      const c = path.querySelector(".node.cur");
      if (c) {
        const r = c.getBoundingClientRect(), left = r.left - pr.left + r.width / 2;
        const buddy = h(`<div class="path-buddy"><div class="dm dm-live">${deltaSVG({ ...av(), expr: "feliz" })}</div></div>`);
        buddy.style.top = (r.top - pr.top - 10) + "px";
        buddy.style.left = (left > pr.width / 2 ? left - 190 : left + 70) + "px";
        path.appendChild(buddy);
      }
    });
    const cur = v.querySelector(".node.cur");
    if (cur && seen("home") && cur.getBoundingClientRect().bottom > innerHeight - 110) cur.scrollIntoView({ block: "center", behavior: reduceMotion() ? "auto" : "smooth" });
  });

  if (!seen("home")) setTimeout(() => {
    if (!document.body.contains(trail)) return;
    const wide = innerWidth >= 1024;
    coach([
      { el: ".node.cur .nb", text: `Esta é a sua trilha, ${primeiroNome()}. Toque no círculo brilhante para começar a lição.` },
      { el: ".eixos", text: "A Matemática do ENEM tem quatro eixos. Troque aqui para estudar outro." },
      { el: ".chip.coins", text: "Estes são seus Deltas. Você ganha estudando e troca por itens na loja ou por dicas." },
      { el: ".chip.fire", text: "Sua sequência de dias. Estude um pouco todo dia para ela crescer." },
      { el: wide ? '.side a[href="#/praticar"]' : '.tabs a[data-tab="praticar"]', text: "Em Praticar ficam a revisão do dia, o Banco ENEM oficial e os simulados." }
    ], { av: av(), onDone: () => markSeen("home") });
  }, 700);
}

// ============================================================
// INTRODUÇÃO DA LIÇÃO
// ============================================================
export function viewLicao(id) {
  const L = LESSON[id]; if (!L) return navigate("/inicio");
  const st = state.lessons[id];
  const plano = planoLicao(id);
  const syms = ["%", "Δ", "π", "√", "x²", "∑", "÷", "σ"];
  const TEC = {
    exemplo: ["book", "Exemplo guiado", "Você vê um problema resolvido passo a passo antes de tentar."],
    recall: ["cycle", "Recordação ativa", "Começa puxando da memória algo que você já estudou."],
    inter: ["grid", "Intercalação", "Uma questão de outro eixo no meio, como na prova."],
    revisao: ["calendar", "Revisão espaçada", "Traz um assunto que está no ponto certo de revisar."],
    correcao: ["pencil", "Correção guiada", "Errou? Refazemos juntos e a questão volta com números novos."],
    confianca: ["target", "Confiança", "Você diz se tinha certeza. Acerto no chute volta para revisão."],
    pomodoro: ["timer", "Pausa na hora certa", "Depois de 25 minutos de foco, o Delta sugere 5 de pausa."]
  };
  const tecs = ["exemplo", plano.recall && "recall", plano.inter && "inter", plano.revisao && "revisao", "correcao", "confianca", "pomodoro"].filter(Boolean);
  const w = h(`<div class="main" style="padding-top:0">
    <div class="intro-hero">
      ${syms.slice(0, 4).map((sy, i) => `<span class="floaty" style="left:${[4, 86, 6, 88][i]}%;top:${[16, 20, 44, 48][i]}%;animation-delay:${i * .7}s">${sy}</span>`).join("")}
      <div class="bar"><a class="x" href="#/inicio" aria-label="Fechar">${ic("x")}</a><span>${esc(L.s.nome)} · Unidade ${L.uIdx + 1}</span><span style="width:44px"></span></div>
      <div class="dm dm-live popin" id="m">${deltaSVG({ ...av(), expr: "pensando" })}</div>
      <h1>${esc(L.l.titulo)}</h1>
      <p>${st ? `Seu recorde aqui é ${st.melhor_pontuacao}%. Bora bater?` : esc(L.u.titulo)}</p>
    </div>
    <div class="meta-chips">
      <div>${ic("question")}${plano.total} questões</div>
      <div>${ic("clock")}~${Math.round(plano.total * 1.3)} min</div>
      <div>${ic("bolt")}até 150 XP</div>
      <div>${ic("heart")}5 vidas</div>
    </div>
    <div class="card learn"><h3>${ic("target")}Nesta lição você vai</h3><ul>${(OBJETIVOS[id] || []).map(o => `<li>${ic("check")}${esc(o)}</li>`).join("")}</ul></div>
    <div class="card learn" style="margin-top:.8rem"><h3>${ic("bulb")}Como esta lição te ensina</h3>
      <div class="tecs">${tecs.map(k => `<div class="tec"><span class="ti">${ic(TEC[k][0])}</span><div><b>${TEC[k][1]}</b><small>${TEC[k][2]}</small></div></div>`).join("")}</div></div>
    <div class="card learn" style="margin-top:.8rem"><h3>${ic("shield")}De onde vêm as questões</h3>
      <p class="muted" style="font-weight:700"><span class="tag oficial">${ic("star")}Oficial ENEM</span> é prova real do INEP. <span class="tag plat">${ic("sparkle")}Plataforma</span> é criada pela equipe Delta, muitas inspiradas no ENEM.</p></div>
    <div class="intro-foot"><button class="btn btn-lime btn-block" id="go">Começar lição</button><small>Você tem ${state.stats.deltas} Δ para usar em dicas.</small></div>
  </div>`);
  root().replaceChildren(w);
  w.querySelector("#go").onclick = async e => {
    sfx.unlock(); sfx.whoosh();
    const b = e.currentTarget; b.disabled = true; b.textContent = "Montando a lição...";
    runSession(await montarLicao(id, plano), { mode: "licao", lessonId: id, topico: L.l.topico, title: L.l.titulo, exit: "/inicio" });
  };
}

// o que entra na lição, além das questões do assunto
function planoLicao(id) {
  const L = LESSON[id], feitas = concluidas().filter(x => x !== id);
  const mesmoEixo = feitas.filter(x => LESSON[x].s.id === L.s.id);
  const outroEixo = feitas.filter(x => LESSON[x].s.id !== L.s.id);
  const due = revisoesHoje().map(r => r.topic_id).filter(t => t !== L.l.topico);
  const recall = mesmoEixo.length ? pick(mesmoEixo) : null;
  const inter = outroEixo.length ? pick(outroEixo) : pick(SUBJECTS.filter(x => x.id !== L.s.id)).unidades[0].licoes[0].id;
  const revisao = due.length ? pick(due) : null;
  const vars = Math.min(1, VARIACOES.filter(x => x.topico === L.l.topico).length);
  return { recall, inter, revisao, vars, total: 4 + vars + 1 + (recall ? 1 : 0) + 1 + (revisao ? 1 : 0) };
}

async function montarLicao(id, plano) {
  const L = LESSON[id];
  const base = lessonQs(L.l, 5);
  const exemplo = { ...base.pop(), tipo: "exemplo" };
  const tag = (q, t) => q && Object.assign(q, { tec: t });
  const items = [exemplo];
  if (plano.recall) items.push(tag(lessonQs(LESSON[plano.recall].l, 1)[0], "recall"));
  items.push(...base.slice(0, 2));
  shuffle(VARIACOES.filter(x => x.topico === L.l.topico)).slice(0, plano.vars).forEach(v => items.push(fromVar(v)));
  items.push(tag(lessonQs(LESSON[plano.inter].l, 1)[0], "inter"));
  items.push(...base.slice(2));
  if (plano.revisao && TOPIC[plano.revisao]) items.push(tag(lessonQs(TOPIC[plano.revisao].l, 1)[0], "revisao"));
  items.push(...await fetchOficiais({ topics: [TOPICO_OFICIAL[L.l.topico]], n: 1 }));
  return items.filter(Boolean);
}

// ============================================================
// SESSÕES DE TREINO
// ============================================================
export async function startTreino(kind) {
  const load = h(`<div class="boot"><div><div class="dm dm-live" style="width:120px;margin:0 auto">${deltaSVG({ ...av(), expr: "pensando" })}</div><p class="muted" style="font-weight:800;text-align:center;margin-top:1rem">Montando seu treino...</p></div></div>`);
  root().replaceChildren(load);
  let items = [], cfg = { mode: "treino", exit: "/praticar" };
  const lessonsOf = eixo => EIXO[eixo].unidades.flatMap(u => u.licoes);
  const randLessonQs = (ls, n) => Array.from({ length: n }, () => { const l = pick(ls); return lessonQs(l, 1)[0]; });
  if (kind === "revisao") {
    const due = revisoesHoje().map(r => r.topic_id);
    const topics = due.length ? due : Object.values(state.topics).sort((a, b) => (a.acertos / (a.acertos + a.erros || 1)) - (b.acertos / (b.acertos + b.erros || 1))).slice(0, 3).map(r => r.topic_id).filter(t => TOPIC[t]);
    if (!topics.length) { toast("Faça uma lição primeiro. A revisão nasce do que você já estudou."); return navigate("/praticar"); }
    topics.slice(0, 4).forEach(t => {
      items.push(...randLessonQs([TOPIC[t].l], 1));
      const v = shuffle(VARIACOES.filter(x => x.topico === t))[0]; if (v) items.push(fromVar(v)); else items.push(...randLessonQs([TOPIC[t].l], 1));
    });
    const usados = new Set(items.map(q => q.ref));
    for (let k = 0; items.length < 6 && k < 30; k++) {
      const q = randLessonQs([TOPIC[topics[k % topics.length]].l], 1)[0];
      if (!usados.has(q.ref)) { usados.add(q.ref); items.push(q); }
    }
    cfg = { mode: "revisao", title: "Revisão do dia", exit: "/praticar", topics };
  } else if (kind === "mix") {
    items = [...randLessonQs(SUBJECTS.flatMap(s => s.unidades.flatMap(u => u.licoes)), 3), ...shuffle(VARIACOES).slice(0, 3).map(fromVar),
      ...await fetchOficiais({ n: 2 })];
    cfg.title = "Treino intercalado";
  } else if (kind.startsWith("unidade-")) {
    const [, eixo, ui] = kind.split("-"); const u = EIXO[eixo]?.unidades[+ui]; if (!u) return navigate("/inicio");
    const tops = u.licoes.map(l => l.topico);
    items = [...randLessonQs(u.licoes, 4), ...shuffle(VARIACOES.filter(x => tops.includes(x.topico))).slice(0, 3).map(fromVar)];
    items.push(...await fetchOficiais({ topics: [...new Set(tops.map(t => TOPICO_OFICIAL[t]))], n: 8 - items.length }));
    cfg = { mode: "treino", title: "Desafio · " + u.titulo, exit: "/inicio" };
  } else if (EIXO[kind]) {
    const tops = [...new Set(lessonsOf(kind).map(l => TOPICO_OFICIAL[l.topico]))];
    items = [...shuffle(VARIACOES.filter(x => x.eixo === kind)).slice(0, 4).map(fromVar), ...randLessonQs(lessonsOf(kind), 2)];
    items.push(...await fetchOficiais({ topics: tops, n: 8 - items.length }));
    cfg.title = "Treino · " + EIXO[kind].nome;
  } else if (kind === "erros") {
    const { data } = await sb.from("error_notebook").select("question_ref").eq("dominado", false).order("updated_at", { ascending: false }).limit(30);
    const refs = [...new Set((data || []).map(r => r.question_ref))];
    const ofIds = [];
    refs.forEach(r => {
      const m = /^([a-z0-9-]+):(\d+)$/.exec(r);
      if (r.startsWith("gen:") && GEN[r.slice(4)]) items.push(fromGen(r.slice(4)));
      else if (m && LESSON[m[1]]?.l.questoes?.[+m[2]]) items.push(fromLesson(m[1], +m[2]));
      else if (VAR_BY_ID[r]) items.push(fromVar(VAR_BY_ID[r]));
      else if (/^\d+$|^[0-9a-f-]{36}$/.test(r)) ofIds.push(r);
    });
    if (ofIds.length && items.length < 8) items.push(...await fetchOficiais({ ids: ofIds.slice(0, 8 - items.length) }));
    if (!items.length) { toast("Seu caderno de erros está limpo."); return navigate("/erros"); }
    cfg = { mode: "erros", title: "Refazer erros", exit: "/erros" };
  }
  items = shuffle(items).slice(0, 8);
  if (!items.length) { toast("Não deu para montar o treino agora."); return navigate("/praticar"); }
  runSession(items, cfg);
}

// ============================================================
// PLAYER DE QUESTÕES
// ============================================================
const FALA_OK = ["Mandou bem!", "Isso aí!", "Na mosca!", "Perfeito!", "Show de bola!", "Você está voando!", "Exatamente!", "Brilhou!"];
const FALA_NO = ["Quase! Olha a resolução.", "Errar faz parte. Bora entender.", "Não foi dessa vez.", "Respira. A próxima é sua.", "Tudo bem, isso também ensina."];

const TEC_TAG = { recall: ["cycle", "Recordação ativa"], inter: ["grid", "Intercalação"], revisao: ["calendar", "Revisão espaçada"], retry: ["pencil", "Nova chance"] };
const CONF = [["certeza", "Tenho certeza"], ["acho", "Acho que sim"], ["chute", "Chutei"]];

export function runSession(items, cfg) {
  const HEARTS = 5;
  const S = { i: 0, acertos: 0, total: 0, hearts: HEARTS, combo: 0, maxCombo: 0, t0: Date.now(), tq: Date.now(), sel: -1, conf: null, checked: false, hinted: false,
    xpChain: Promise.resolve(), porTopico: {}, retries: 0, chutes: [], calib: { certeza: [0, 0], acho: [0, 0], chute: [0, 0] }, tecs: new Set() };
  const scored = () => items.filter(q => q.tipo !== "exemplo" && !q.retry).length;
  const w = h(`<div class="play">
    <div class="play-top"><button class="x" aria-label="Sair">${ic("x")}</button><div class="pbar"><i></i></div>
      <div class="hearts" aria-label="Vidas">${Array.from({ length: HEARTS }, () => HEART_SOLID).join("")}</div></div>
    <div class="combo" aria-live="polite"></div>
    <div class="qwrap"></div>
    <div class="play-foot"><button class="btn hint" id="hint">${ic("bulb")}<span>10</span>${COIN}</button><button class="btn btn-lime go" id="go" disabled>Verificar</button></div>
    <div class="fb" role="status" aria-live="assertive"><div class="in"><div class="face dm"></div><h3></h3><p class="expl"></p><div class="guia"></div>
      <div class="fb-acts"><button class="btn" id="refazer" hidden>${ic("pencil")}Refazer comigo</button><button class="btn btn-block" id="cont">Continuar</button></div></div></div>
  </div>`);
  root().replaceChildren(w); window.scrollTo(0, 0);
  const qwrap = w.querySelector(".qwrap"), go = w.querySelector("#go"), hint = w.querySelector("#hint"), fb = w.querySelector(".fb"), cont = w.querySelector("#cont"), refazer = w.querySelector("#refazer");

  function drawHearts(lost) {
    w.querySelectorAll(".hearts svg").forEach((s, k) => { s.classList.toggle("off", k >= S.hearts); if (lost && k === S.hearts) { s.classList.remove("popx"); void s.offsetWidth; s.classList.add("popx"); } });
  }
  const tagHTML = q => {
    const origem = q.kind === "oficial" ? `<span class="tag oficial">${ic("star")}Oficial ENEM</span><span class="tag">${esc(q.label)}</span>${q.dif ? `<span class="tag">${ic("chart")}${q.dif}</span>` : ""}`
      : q.kind === "var" ? `<span class="tag plat">${ic("sparkle")}Plataforma</span><span class="tag">${esc(q.label.replace(/^Plataforma · /, ""))}</span>`
      : `<span class="tag plat">${ic("sparkle")}Plataforma</span>`;
    const t = q.retry ? TEC_TAG.retry : TEC_TAG[q.tec];
    return (t ? `<span class="tag tec">${ic(t[0])}${t[1]}</span>` : "") + origem;
  };
  const numero = () => items.slice(0, S.i + 1).filter(q => q.tipo !== "exemplo").length;

  function show() {
    const q = items[S.i];
    S.sel = -1; S.conf = null; S.checked = false; S.hinted = false; S.tq = Date.now();
    w.querySelector(".pbar i").style.width = (S.i / items.length * 100) + "%";
    fb.classList.remove("show", "ok", "no"); fb.querySelector(".guia").innerHTML = ""; refazer.hidden = true; refazer.innerHTML = `${ic("pencil")}Refazer comigo`;
    if (q.tipo === "exemplo") return showExemplo(q);
    if (q.tec) S.tecs.add(q.tec);
    const fala = q.tec === "recall" ? "Aquecimento: puxe da memória, sem medo. Aqui você não perde vida."
      : q.tec === "inter" ? "Mudança de assunto! Misturar eixos treina você para a prova de verdade."
      : q.tec === "revisao" ? "Este assunto estava no ponto de revisar. Lembra dele?"
      : q.retry ? "Nova chance! Mesmo raciocínio, agora é com você." : "";
    qwrap.innerHTML = `<div class="qmeta">${tagHTML(q)}<span class="muted" style="margin-left:auto;font-weight:800;font-size:.85rem">${q.retry ? "extra" : `${numero()} de ${scored()}`}</span></div>
      ${fala ? `<div class="talk mini"><div class="dm dm-live">${deltaSVG({ ...av(), expr: "feliz" })}</div><div class="bubble left">${fala}</div></div>` : ""}
      <div class="qcard"><div class="qtext">${q.stmt}</div><div class="buddy dm dm-live">${deltaSVG({ ...av(), expr: "pensando" })}</div></div>
      <div class="opts" role="radiogroup" aria-label="Alternativas">${q.opts.map((o, k) => `<button class="opt" role="radio" aria-checked="false" data-k="${k}" style="--i:${k}"><span class="k">${(q.letras || LETRAS)[k]}</span><span>${o}</span></button>`).join("")}</div>
      <div class="conf" hidden><span>Quão seguro você está?</span>${CONF.map(([k, t]) => `<button data-c="${k}">${t}</button>`).join("")}</div>`;
    go.disabled = true; go.textContent = "Verificar"; go.className = "btn btn-lime go"; go.hidden = false;
    hint.disabled = false; hint.hidden = q.opts.length < 4;
    qwrap.querySelectorAll(".opt").forEach(b => b.onclick = () => choose(+b.dataset.k));
    qwrap.querySelectorAll(".conf button").forEach(b => b.onclick = () => { S.conf = b.dataset.c; sfx.tap(); qwrap.querySelectorAll(".conf button").forEach(x => x.classList.toggle("on", x === b)); S.tecs.add("confianca"); });
    if (numero() === 1 && !seen("play")) setTimeout(() => coach([
      { el: ".qmeta", text: "Aqui você vê a origem da questão: Oficial ENEM é prova real do INEP. Plataforma é criada pela equipe Delta." },
      { el: "#hint", text: "Travou? A dica custa 10 Deltas e elimina duas alternativas erradas." },
      { el: ".hearts", text: "Você tem 5 vidas por lição. Cada erro custa uma, então leia com calma." }
    ], { av: av(), onDone: () => markSeen("play") }), 500);
  }

  // exemplo guiado: o Delta resolve, passo a passo, antes de você tentar
  function showExemplo(q) {
    S.tecs.add("exemplo");
    const passos = (q.passos && q.passos.length ? q.passos : [q.e]).filter(Boolean);
    let k = 0;
    hint.hidden = true; go.hidden = false; go.disabled = false; go.className = "btn btn-teal go";
    qwrap.innerHTML = `<div class="qmeta"><span class="tag tec">${ic("book")}Exemplo guiado</span><span class="tag plat">${ic("sparkle")}Plataforma</span></div>
      <div class="talk mini"><div class="dm dm-live" id="exm">${deltaSVG({ ...av(), expr: "feliz" })}</div><div class="bubble left">Antes de você tentar, eu resolvo uma com você. Acompanhe cada passo.</div></div>
      <div class="qcard"><div class="qtext" style="padding-right:0">${q.stmt}</div></div>
      <ol class="passos"></ol>
      <div class="opts ex">${q.opts.map((o, i) => `<div class="opt${i === q.c ? " alvo" : ""}" style="--i:${i}"><span class="k">${LETRAS[i]}</span><span>${o}</span></div>`).join("")}</div>`;
    const ol = qwrap.querySelector(".passos");
    const step = () => {
      if (k < passos.length) {
        const li = h(`<li><span class="n">${k + 1}</span><span></span></li>`); ol.appendChild(li);
        typeText(li.lastElementChild, passos[k], 10); sfx.pop && sfx.pop(); k++;
        go.textContent = k < passos.length ? "Próximo passo" : "Ver a resposta";
        li.scrollIntoView({ block: "nearest", behavior: reduceMotion() ? "auto" : "smooth" });
      } else if (k === passos.length) {
        const alvo = qwrap.querySelector(".opt.alvo"); alvo.classList.add("ok"); sfx.correct(); k++;
        react(qwrap.querySelector("#exm"), av(), "comemorando", "jump");
        alvo.scrollIntoView({ block: "center", behavior: reduceMotion() ? "auto" : "smooth" });
        go.textContent = "Agora é sua vez"; go.className = "btn btn-lime go";
      } else { go.onclick = check; S.i++; show(); }
    };
    go.onclick = step; step();
  }

  function choose(k) {
    if (S.checked) return;
    const b = qwrap.querySelector(`.opt[data-k="${k}"]`); if (!b || b.classList.contains("gone")) return;
    S.sel = k; sfx.select();
    qwrap.querySelectorAll(".opt").forEach(x => { x.classList.toggle("sel", x === b); x.setAttribute("aria-checked", x === b); });
    go.disabled = false;
    const cf = qwrap.querySelector(".conf"); if (cf && cf.hidden) { cf.hidden = false; cf.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 250 }); }
  }
  function check() {
    const q = items[S.i];
    if (q.tipo === "exemplo" || S.sel < 0 || S.checked) return;
    S.checked = true;
    const ok = S.sel === q.c, tempo = Math.round((Date.now() - S.tq) / 1000), livre = q.tec === "recall" || q.retry;
    const optEls = qwrap.querySelectorAll(".opt");
    optEls.forEach(x => { x.disabled = true; x.classList.remove("sel"); });
    optEls[q.c].classList.add("ok");
    qwrap.querySelectorAll(".conf button").forEach(b => b.disabled = true);
    const buddy = qwrap.querySelector(".buddy");
    if (!q.retry) { const pt = S.porTopico[q.topico] = S.porTopico[q.topico] || [0, 0]; pt[1]++; if (ok) pt[0]++; S.total++; if (ok) S.acertos++; }
    if (S.conf) { S.calib[S.conf][1]++; if (ok) S.calib[S.conf][0]++; }
    const origem = q.kind === "oficial" ? "enem" : cfg.mode === "licao" ? "licao" : "revisao";
    const letra = i => (q.letras || LETRAS)[i];
    logAttempt({ origem, ref: q.ref, topico: q.topicoOficial || q.topico, correta: ok, resposta: letra(S.sel), correta_resp: letra(q.c), tempo });
    let face = "comemorando", titulo, extra = "";
    if (ok) {
      S.combo++; S.maxCombo = Math.max(S.maxCombo, S.combo);
      sfx.correct(); react(buddy, av(), "comemorando", "jump");
      titulo = S.combo >= 3 ? `Combo de ${S.combo}! Ninguém te segura.` : pick(FALA_OK);
      if (S.conf === "chute") { S.chutes.push(q.topico); extra = " Acertou no chute? Vou trazer esse assunto de volta na revisão para virar certeza."; face = "pensando"; }
      if (cfg.mode !== "licao" && !q.retry) S.xpChain = S.xpChain.then(() => addXP(10, q.kind === "oficial" ? "enem" : "acerto", q.ref));
      const r = optEls[q.c].getBoundingClientRect(); flyText(q.retry ? "Boa!" : `+10 XP`, r.right - 90, r.top - 10);
    } else {
      S.combo = 0;
      if (!livre && !cfg.noHearts) { S.hearts--; drawHearts(true); setTimeout(() => sfx.heart(), 180); }
      optEls[S.sel].classList.add("no");
      sfx.wrong(); react(buddy, av(), "triste", "shake"); face = "triste";
      titulo = S.conf === "certeza" ? "Errar com certeza ensina muito." : pick(FALA_NO);
      logError({ origem, ref: q.ref, enunciado: q.stmt.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), resposta_aluno: `${letra(S.sel)}) ${q.opts[S.sel].replace(/<[^>]+>/g, "")}`,
        resposta_correta: `${letra(q.c)}) ${q.opts[q.c].replace(/<[^>]+>/g, "")}`, explicacao: q.e, topico: q.topicoOficial || q.topico });
      if (!seen("erro1")) { extra = " Guardei esta no seu Caderno de erros."; markSeen("erro1"); }
      // correção guiada + nova chance no fim da lição
      if (!cfg.noRetry && !q.retry && S.retries < 3 && q.kind !== "oficial") {
        const nova = q.gen ? fromGen(q.topico) : q.kind === "plat" && /:\d+$/.test(q.ref) ? fromLesson(...q.ref.split(":").map((x, i) => i ? +x : x)) : { ...q, opts: q.opts.slice() };
        if (nova) { nova.retry = true; items.push(nova); S.retries++; S.tecs.add("correcao"); extra += " Ela volta no fim da lição" + (q.gen ? " com números novos." : "."); }
      }
      if ((q.passos || []).length > 1) refazer.hidden = false;
      if (livre) extra = " Sem perder vida: isto era " + (q.retry ? "uma nova chance." : "aquecimento.") + extra;
    }
    const cb = w.querySelector(".combo");
    cb.innerHTML = S.combo >= 2 ? `${ic("fire")}Combo x${S.combo}` : ""; if (S.combo >= 2) { cb.classList.remove("bump"); void cb.offsetWidth; cb.classList.add("bump"); }
    fb.className = "fb show " + (ok ? "ok" : "no");
    fb.querySelector(".face").innerHTML = deltaSVG({ ...av(), expr: face });
    fb.querySelector("h3").textContent = titulo;
    fb.querySelector(".expl").textContent = (ok ? "" : `Resposta: ${letra(q.c)}. `) + (ok || refazer.hidden ? (q.e || "") : "") + extra;
    cont.className = "btn btn-block " + (ok ? "btn-green" : "btn-red");
    hint.disabled = true; go.disabled = true;
    setTimeout(() => (refazer.hidden ? cont : refazer).focus({ preventScroll: true }), 50);
  }
  // correção guiada: revela a resolução um passo por vez
  refazer.onclick = () => {
    const q = items[S.i], g = fb.querySelector(".guia"), passos = q.passos || [];
    S.tecs.add("correcao");
    const feitos = g.children.length;
    if (feitos < passos.length) {
      const d = h(`<div class="gp"><span class="n">${feitos + 1}</span><span></span></div>`); g.appendChild(d); typeText(d.lastElementChild, passos[feitos], 10);
      refazer.innerHTML = feitos + 1 < passos.length ? `${ic("pencil")}Próximo passo` : `${ic("check")}Entendi`;
    } else { refazer.hidden = true; cont.focus({ preventScroll: true }); }
  };
  function next() {
    sfx.tap();
    if (S.hearts <= 0) return outOfHearts();
    S.i++;
    if (S.i >= items.length) return end();
    show();
  }
  function outOfHearts() {
    fb.classList.remove("show");
    const m = modal(`<div class="dm dm-live">${deltaSVG({ ...av(), expr: "vida" })}</div><h2>Suas vidas acabaram</h2>
      <p>Sem problema. Os erros já estão no seu caderno. Tente de novo com calma: as questões geradas voltam com números novos.</p>
      <div class="row2"><button class="btn" id="sair">Sair</button><button class="btn btn-lime" id="de-novo">Tentar de novo</button></div>`, { dismiss: false });
    m.querySelector("#sair").onclick = () => { m.close(); navigate(cfg.exit); };
    m.querySelector("#de-novo").onclick = () => { m.close(); if (cfg.lessonId) viewLicao(cfg.lessonId); else navigate(cfg.exit); };
  }
  async function useHint() {
    if (S.checked || S.hinted) return;
    const q = items[S.i];
    if ((state.stats.deltas || 0) < 10) { toast("Você precisa de 10 Δ para a dica. Ganhe Deltas completando lições."); return; }
    hint.disabled = true;
    const { data, error } = await sb.rpc("use_hint", { p_ref: q.ref });
    if (error || !data?.ok) { hint.disabled = false; toast("Saldo insuficiente para a dica."); return; }
    state.stats.deltas = data.deltas; updateTop(); S.hinted = true; sfx.coin();
    const wrongs = shuffle(q.opts.map((_, k) => k).filter(k => k !== q.c)).slice(0, 2);
    wrongs.forEach(k => { const el = qwrap.querySelector(`.opt[data-k="${k}"]`); el.classList.add("gone"); el.classList.remove("sel"); if (S.sel === k) { S.sel = -1; go.disabled = true; } });
    react(qwrap.querySelector(".buddy"), av(), "surpreso", "popin");
  }
  function quit() {
    const m = modal(`<div class="dm dm-live">${deltaSVG({ ...av(), expr: "triste" })}</div><h2>Vai sair agora?</h2><p>O progresso desta sessão vai se perder.</p>
      <div class="row2"><button class="btn" id="s">Sair</button><button class="btn btn-lime" id="f">Continuar</button></div>`);
    m.querySelector("#s").onclick = () => { m.close(); navigate(cfg.exit); };
    m.querySelector("#f").onclick = () => m.close();
  }
  async function end() {
    document.removeEventListener("keydown", keys);
    const tempo = Math.round((Date.now() - S.t0) / 1000);
    if (cfg.custom) return cfg.custom({ acertos: S.acertos, total: Math.max(1, S.total), tempo, porTopico: S.porTopico, xpChain: S.xpChain });
    await finish({ ...cfg, acertos: S.acertos, total: Math.max(1, S.total), tempo, maxCombo: S.maxCombo, xpChain: S.xpChain, porTopico: S.porTopico, chutes: S.chutes, calib: S.calib, tecs: [...S.tecs] });
  }
  function keys(e) {
    if (!document.body.contains(w)) return document.removeEventListener("keydown", keys);
    if (document.querySelector(".modal, .coach, .sheet, .cs")) return;
    const q = items[S.i];
    if (q.tipo === "exemplo") { if (e.key === "Enter") { e.preventDefault(); go.click(); } return; }
    if (!S.checked) {
      const k = "12345".indexOf(e.key) >= 0 ? "12345".indexOf(e.key) : (q.letras || LETRAS).toLowerCase().indexOf(e.key.toLowerCase());
      if (e.key.length === 1 && k >= 0 && k < q.opts.length) { choose(k); return; }
      if (e.key === "Enter" && S.sel >= 0) { e.preventDefault(); check(); }
    } else if (e.key === "Enter") { e.preventDefault(); next(); }
  }
  document.addEventListener("keydown", keys);
  go.onclick = check; cont.onclick = next; hint.onclick = useHint; w.querySelector(".x").onclick = quit;
  if (cfg.noHearts) w.querySelector(".hearts").hidden = true;
  drawHearts(); show();
}

// ============================================================
// FIM DA SESSÃO + RECOMPENSAS
// ============================================================
async function finish(ctx) {
  const pct = Math.round(ctx.acertos / ctx.total * 100);
  const bom = pct >= 70;
  const before = { xp: state.stats.xp || 0, deltas: state.stats.deltas || 0 };
  const titulo = pct === 100 ? "Nota máxima!" : bom ? (ctx.mode === "licao" ? "Lição concluída!" : "Treino concluído!") : "Você chegou ao fim!";
  const w = h(`<div class="done">
    <div class="dm dm-live popin" id="m">${deltaSVG({ ...av(), expr: bom ? "comemorando" : "feliz" })}</div>
    <h1>${titulo}</h1><p class="sub" id="fala"></p>
    <div class="done-stats">
      <div class="stat-tile" style="--c:var(--gold);--d:.1s"><div class="h">XP ganho</div><div class="v">${ic("bolt")}<span id="vx">0</span></div></div>
      <div class="stat-tile" style="--c:var(--green);--d:.25s"><div class="h">Precisão</div><div class="v">${ic("target")}<span id="vp">0</span>%</div></div>
      <div class="stat-tile" style="--c:var(--teal);--d:.4s"><div class="h">Tempo</div><div class="v">${ic("clock")}${fmtT(ctx.tempo)}</div></div>
    </div>
    <div id="goal" style="width:100%"></div>
    ${(ctx.tecs || []).length ? `<div class="tecs-done">${ctx.tecs.map(t => { const T = { exemplo: ["book", "Exemplo guiado"], recall: ["cycle", "Recordação ativa"], inter: ["grid", "Intercalação"], revisao: ["calendar", "Revisão espaçada"], correcao: ["pencil", "Correção guiada"], confianca: ["target", "Confiança"] }[t]; return T ? `<span class="tag tec">${ic(T[0])}${T[1]}</span>` : ""; }).join("")}</div>` : ""}
    ${calibHTML(ctx.calib)}
    <button class="btn btn-lime btn-block" id="cont" disabled>Salvando...</button>
  </div>`);
  root().replaceChildren(w); window.scrollTo(0, 0);
  sfx.finish(); if (bom) confetti();
  countUp(w.querySelector("#vp"), pct, 1000);
  typeText(w.querySelector("#fala"), pct === 100 ? "Acertou tudo. Isso é nível ENEM!" : bom ? `${ctx.acertos} de ${ctx.total} certas. Tá ficando forte nisso.` : `${ctx.acertos} de ${ctx.total} certas. Revise os erros e volte mais forte.`);

  // --- servidor: XP, sequência, progresso e conquistas ---
  let streak = null, ach = { novos: [] };
  try {
    await ctx.xpChain;
    if (ctx.mode === "licao") {
      const xp = Math.min(150, ctx.acertos * 10 + 20 + (pct === 100 ? 20 : 0) + Math.floor(ctx.maxCombo / 3) * 5);
      await addXP(xp, "licao", ctx.lessonId);
      await saveLesson(ctx.lessonId, ctx.topico, ctx.acertos, ctx.total);
    } else {
      if (ctx.mode === "revisao") await addXP(Math.min(30, 10 + ctx.acertos * 2), "revisao", "rev-" + new Date().toISOString().slice(0, 10));
      for (const [t, [a, n]] of Object.entries(ctx.porTopico)) if (TOPIC[t]) await updateTopic(t, a, n);
    }
    // acerto no chute não conta como domínio: o assunto volta amanhã
    for (const t of new Set(ctx.chutes || [])) if (TOPIC[t]) await updateTopic(t, 0, 1);
    streak = await touchStreak();
    ach = await claimAchievements();
    await refreshStats();
  } catch (e) { console.error(e); toast("Parte do progresso não foi salva. Confira sua conexão."); }

  somarMinutos(ctx.tempo);
  const ganhoXP = Math.max(0, (state.stats.xp || 0) - before.xp);
  const ganhoD = Math.max(0, (state.stats.deltas || 0) - before.deltas);
  countUp(w.querySelector("#vx"), ganhoXP, 1000);
  const meta = state.profile.meta_diaria || 50;
  w.querySelector("#goal").innerHTML = `<div class="goal-line">${goalRing(state.xpHoje, meta)}<div><b>${state.xpHoje >= meta ? "Meta do dia batida!" : "Meta do dia"}</b><small>${Math.min(state.xpHoje, meta)} de ${meta} XP · +${ganhoD} Δ nesta sessão</small></div></div>`;
  if (ganhoD > 0) setTimeout(() => { const f = h(`<span class="chip coins" style="position:fixed;top:14px;right:14px;z-index:90">${COIN}<b>${state.stats.deltas}</b></span>`); document.body.appendChild(f); coinBurst(ganhoD, w.querySelector(".stat-tile")); setTimeout(() => f.remove(), 1700); }, 700);

  const cont = w.querySelector("#cont"); cont.disabled = false; cont.textContent = "Continuar";
  cont.focus({ preventScroll: true });
  cont.onclick = async () => {
    sfx.tap(); cont.disabled = true;
    const nv0 = nivelDe(before.xp).nivel, nv1 = nivelDe(state.stats.xp || 0).nivel;
    if (streak?.mudou) await csStreak(av(), streak.streak, streak.congelou);
    if (nv1 > nv0) await csLevelUp(av(), nv1, state.shop.filter(i => i.nivel_min > nv0 && i.nivel_min <= nv1));
    for (const a of ach.novos || []) await csConquista(a, av());
    if (focoPrecisaPausa(ctx.tempo)) await pausaPomodoro();
    await talvezPedirFeedback();
    navigate(ctx.exit || "/inicio");
  };
}


function calibHTML(c) {
  if (!c) return "";
  const rows = [["certeza", "Com certeza"], ["acho", "Achando"], ["chute", "No chute"]].filter(([k]) => c[k][1]);
  if (!rows.length) return "";
  return `<div class="calib card"><b>${ic("target")} Sua confiança</b>${rows.map(([k, n]) => `<div class="cr"><span>${n}</span><span class="t"><i style="width:${Math.round(c[k][0] / c[k][1] * 100)}%"></i></span><span>${c[k][0]}/${c[k][1]}</span></div>`).join("")}
    <small>${c.certeza[1] && c.certeza[0] < c.certeza[1] ? "Você errou algumas que tinha certeza: são as melhores para revisar." : c.chute[0] ? "Os acertos no chute voltam na revisão até virarem certeza." : "Sua confiança está bem calibrada."}</small></div>`;
}

// ---------- Pomodoro dentro do estudo: 25 min de foco pedem 5 de pausa ----------
function focoPrecisaPausa(seg) {
  let f = { acc: 0, last: 0 }; try { f = JSON.parse(localStorage.getItem("delta-foco")) || f; } catch (e) {}
  const now = Date.now();
  if (now - f.last > 10 * 60 * 1000 + seg * 1000) f.acc = 0;
  f.acc += seg; f.last = now;
  const pausa = f.acc >= 25 * 60;
  if (pausa) f.acc = 0;
  try { localStorage.setItem("delta-foco", JSON.stringify(f)); } catch (e) {}
  return pausa;
}
function pausaPomodoro() {
  return new Promise(res => {
    let t = 5 * 60, id;
    const m = modal(`<div class="dm dm-live">${deltaSVG({ ...av(), expr: "dormindo" })}</div><h2>Hora da pausa</h2>
      <p>Você completou 25 minutos de foco. Uma pausa de 5 minutos ajuda o cérebro a guardar o que aprendeu. Levante, beba água, olhe para longe.</p>
      <div class="pomo-clock" id="pc">05:00</div><div class="row2"><button class="btn" id="pular">Pular pausa</button><button class="btn btn-lime" id="ok" hidden>Voltar a estudar</button></div>`, { dismiss: false, onClose: () => { clearInterval(id); res(); } });
    const pc = m.querySelector("#pc");
    id = setInterval(() => { t--; pc.textContent = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; if (t <= 0) { clearInterval(id); sfx.achievement(); m.querySelector("#ok").hidden = false; m.querySelector("#pular").hidden = true; } }, 1000);
    m.querySelector("#pular").onclick = () => m.close();
    m.querySelector("#ok").onclick = () => m.close();
  });
}

// ============================================================
// BANCO ENEM (somente questões oficiais de Matemática)
// ============================================================
export async function viewEnem() {
  const v = shell("praticar", `${page("Banco ENEM", "Questões oficiais do INEP, só de Matemática (2º dia).")}
    <div class="card pad"><div class="sel-row">
      <label>Ano<select id="ano"><option value="">Todos</option></select></label>
      <label>Assunto<select id="top"><option value="">Todos</option></select></label>
      <label>Dificuldade<select id="dif"><option value="">Todas</option><option value="facil">Fácil</option><option value="media">Média</option><option value="dificil">Difícil</option></select></label>
      <label>Questões<select id="n"><option>5</option><option selected>8</option><option>12</option></select></label></div>
      <p class="muted" style="font-weight:700" id="cnt">Contando questões...</p>
      <button class="btn btn-lime btn-block" id="go" style="margin-top:.8rem">${ic("play")}Praticar</button></div>
    <div class="talk" style="margin-top:1.2rem"><div class="dm dm-live">${deltaSVG({ ...av(), expr: "feliz" })}</div><div class="bubble left">Cada acerto aqui vale 10 XP. As questões são exatamente as da prova, com o gabarito oficial.</div></div>`);
  const ano = v.querySelector("#ano"), top = v.querySelector("#top"), cnt = v.querySelector("#cnt"), dif = v.querySelector("#dif");
  const { data } = await sb.from("questions").select("year,topic,difficulty").eq("publication_status", "published").eq("primary_subject", "Matemática").limit(2000);
  const rows = data || [];
  [...new Set(rows.map(r => r.year))].sort((a, b) => b - a).forEach(a => ano.add(new Option(a, a)));
  [...new Set(rows.map(r => r.topic).filter(Boolean))].sort().forEach(t => top.add(new Option(t, t)));
  const count = () => { const n = rows.filter(r => (!ano.value || r.year == ano.value) && (!top.value || r.topic === top.value) && (!dif.value || r.difficulty === dif.value)).length; cnt.textContent = `${n} questões oficiais disponíveis`; return n; };
  ano.onchange = top.onchange = dif.onchange = count; count();
  v.querySelector("#go").onclick = async e => {
    if (!count()) return toast("Nenhuma questão para esse filtro.");
    e.currentTarget.disabled = true;
    const items = await fetchOficiais({ topics: top.value ? [top.value] : null, ano: ano.value ? +ano.value : null, dif: dif.value || null, n: +v.querySelector("#n").value });
    if (!items.length) { e.currentTarget.disabled = false; return toast("Não deu para carregar as questões."); }
    runSession(items, { mode: "enem", title: "Banco ENEM", exit: "/enem" });
  };
}

// ============================================================
// SIMULADO (cronometrado, sem correção imediata)
// ============================================================
export async function viewSimulados() {
  const v = shell("praticar", `${page("Simulado", "Condições de prova: tempo corrido e gabarito só no final.")}
    <div class="card pad"><div class="sel-row">
      <label>Questões<select id="n"><option value="10">10 questões</option><option value="20">20 questões</option><option value="45">45 questões (prova inteira)</option></select></label>
      <label>Tempo por questão<select id="t"><option value="3">3 min · ritmo ENEM</option><option value="4">4 min</option><option value="0">Sem limite</option></select></label></div>
      <button class="btn btn-lime btn-block" id="go">${ic("timer")}Começar simulado</button></div>
    <h2 class="sec">Seus últimos simulados</h2><div id="hist"><div class="spin"></div></div>`);
  sb.from("simulation_attempts").select("*").order("created_at", { ascending: false }).limit(10).then(({ data }) => {
    v.querySelector("#hist").innerHTML = (data || []).length ? data.map(s => { const p = Math.round(s.acertos / s.total * 100);
      return `<div class="hist">${ic("calendar")}<span>${new Date(s.created_at).toLocaleDateString("pt-BR")}: ${s.total} questões em ${fmtT(s.tempo_seg || 0)}</span><span class="p ${p >= 70 ? "good" : p >= 45 ? "mid" : "low"}">${s.acertos}/${s.total}</span></div>`; }).join("")
      : `<div class="empty">Nenhum simulado ainda. O primeiro vale conquista.</div>`;
  });
  v.querySelector("#go").onclick = async e => {
    e.currentTarget.disabled = true; e.currentTarget.textContent = "Preparando a prova...";
    const n = +v.querySelector("#n").value, perQ = +v.querySelector("#t").value;
    const items = await fetchOficiais({ n });
    if (!items.length) { toast("Não deu para carregar as questões."); return viewSimulados(); }
    runSimulado(items, perQ);
  };
}

function runSimulado(qs, perQ) {
  const ans = new Array(qs.length).fill(null), mk = new Set();
  let i = 0; const t0 = Date.now(), limite = perQ ? perQ * 60 * qs.length : 0;
  const w = h(`<div class="play">
    <div class="play-top"><button class="x" aria-label="Sair">${ic("x")}</button><div class="pbar"><i></i></div><span class="cnt" id="clk">0:00</span></div>
    <div class="qwrap"></div>
    <div class="play-foot"><button class="btn" id="prev" aria-label="Anterior">${ic("back")}</button><button class="btn" id="folha">${ic("grid")}Folha</button><button class="btn btn-lime go" id="nx">Próxima</button></div>
  </div>`);
  root().replaceChildren(w);
  const qwrap = w.querySelector(".qwrap"), clk = w.querySelector("#clk");
  const tick = setInterval(() => {
    if (!document.body.contains(w)) return clearInterval(tick);
    const s = Math.round((Date.now() - t0) / 1000);
    clk.textContent = limite ? fmtT(Math.max(0, limite - s)) : fmtT(s);
    if (limite && s >= limite) { clearInterval(tick); toast("Tempo esgotado. Entregando a prova."); entregar(); }
  }, 1000);
  function show() {
    const q = qs[i];
    w.querySelector(".pbar i").style.width = (ans.filter(a => a != null).length / qs.length * 100) + "%";
    qwrap.innerHTML = `<div class="qmeta"><span class="tag oficial">${ic("star")}Oficial ENEM</span><span class="tag">${esc(q.label)}</span>
      <button class="tag" id="mk" style="margin-left:auto">${ic("flag")}${mk.has(i) ? "Marcada" : "Marcar"}</button></div>
      <div class="qcard"><div class="qtext" style="padding-right:0">${q.stmt}</div></div>
      <div class="opts">${q.opts.map((o, k) => `<button class="opt ${ans[i] === k ? "sel" : ""}" data-k="${k}" style="--i:${k}"><span class="k">${q.letras[k]}</span><span>${o}</span></button>`).join("")}</div>`;
    qwrap.querySelectorAll(".opt").forEach(b => b.onclick = () => { sfx.select(); ans[i] = +b.dataset.k; show(); });
    qwrap.querySelector("#mk").onclick = () => { mk.has(i) ? mk.delete(i) : mk.add(i); sfx.tap(); show(); };
    w.querySelector("#prev").disabled = i === 0;
    w.querySelector("#nx").textContent = i === qs.length - 1 ? "Entregar" : "Próxima";
  }
  function folha() {
    const s = sheet("Folha de respostas", `<p class="muted" style="font-weight:700">${ans.filter(a => a != null).length} de ${qs.length} respondidas${mk.size ? ` · ${mk.size} marcadas` : ""}</p>
      <div class="sheet-cells">${qs.map((_, k) => `<button data-k="${k}" class="${k === i ? "cur" : ""} ${ans[k] != null ? "ans" : ""} ${mk.has(k) ? "mk" : ""}">${k + 1}</button>`).join("")}</div>
      <button class="btn btn-lime btn-block" id="ent">Entregar prova</button>`);
    s.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { i = +b.dataset.k; s.close(); show(); });
    s.querySelector("#ent").onclick = () => { s.close(); confirmar(); };
  }
  function confirmar() {
    const falta = ans.filter(a => a == null).length;
    const m = modal(`<div class="dm dm-live">${deltaSVG({ ...av(), expr: "pensando" })}</div><h2>Entregar a prova?</h2><p>${falta ? `Ainda faltam ${falta} questões em branco.` : "Todas respondidas. Boa!"}</p>
      <div class="row2"><button class="btn" id="v">Revisar</button><button class="btn btn-lime" id="e">Entregar</button></div>`);
    m.querySelector("#v").onclick = () => m.close();
    m.querySelector("#e").onclick = () => { m.close(); entregar(); };
  }
  let entregue = false;
  async function entregar() {
    if (entregue) return; entregue = true; clearInterval(tick);
    const tempo = Math.round((Date.now() - t0) / 1000);
    let acertos = 0;
    const detalhes = qs.map((q, k) => {
      const ok = ans[k] === q.c; if (ok) acertos++;
      logAttempt({ origem: "simulado", ref: q.ref, topico: q.topicoOficial, correta: ok, resposta: ans[k] != null ? q.letras[ans[k]] : null, correta_resp: q.letras[q.c] });
      if (!ok) logError({ origem: "simulado", ref: q.ref, enunciado: q.stmt.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
        resposta_aluno: ans[k] != null ? `${q.letras[ans[k]]}) ${q.opts[ans[k]].replace(/<[^>]+>/g, "")}` : "(em branco)", resposta_correta: `${q.letras[q.c]}) ${q.opts[q.c].replace(/<[^>]+>/g, "")}`,
        explicacao: `${q.label}. Gabarito oficial do INEP.`, topico: q.topicoOficial });
      return { q: q.ref, topico: q.topicoOficial, resp: ans[k] != null ? q.letras[ans[k]] : null, gab: q.letras[q.c], ok };
    });
    root().replaceChildren(h(`<div class="boot"><div class="spin"></div></div>`));
    const before = { xp: state.stats.xp, deltas: state.stats.deltas };
    await sb.from("simulation_attempts").insert({ user_id: state.session.user.id, tipo: "rapido", filtros: { materia: "Matemática", perQ }, total: qs.length, acertos, tempo_seg: tempo, detalhes });
    if (acertos) await addXP(Math.min(450, acertos * 10), "simulado", "sim-" + Date.now());
    const streak = await touchStreak(); const ach = await claimAchievements(); await refreshStats();
    const pct = Math.round(acertos / qs.length * 100);
    const porT = {}; detalhes.forEach(d => { const k = d.topico || "Outros"; porT[k] = porT[k] || [0, 0]; porT[k][1]++; if (d.ok) porT[k][0]++; });
    const v = shell("praticar", `<div class="done" style="min-height:auto;padding-top:1rem">
      <div class="dm dm-live popin">${deltaSVG({ ...av(), expr: pct >= 60 ? "comemorando" : "feliz" })}</div>
      <h1>${acertos} de ${qs.length}</h1><p class="sub">${pct}% de acerto em ${fmtT(tempo)}.<br>Você ganhou ${Math.max(0, state.stats.xp - before.xp)} XP e ${Math.max(0, state.stats.deltas - before.deltas)} Δ.</p></div>
      <h2 class="sec">Por assunto</h2><div class="card pad">${Object.entries(porT).map(([t, [a, n]]) => { const p = Math.round(a / n * 100);
        return `<div class="weak"><span class="n">${esc(t)}</span><span class="t"><i style="width:${p}%;background:${p >= 70 ? "var(--green)" : p >= 45 ? "var(--gold)" : "var(--red)"}"></i></span><span class="p">${a}/${n}</span></div>`; }).join("")}</div>
      <h2 class="sec">Gabarito</h2><div class="sheet-cells">${detalhes.map((d, k) => `<button class="${d.ok ? "ans" : ""}" title="Sua: ${d.resp || "-"} · Gabarito: ${d.gab}" style="${d.ok ? "" : "border-color:var(--red);color:var(--red)"}">${k + 1}</button>`).join("")}</div>
      <p class="muted" style="font-weight:700">Os erros já estão no seu Caderno de erros.</p>
      <div class="row2" style="display:flex;gap:.6rem;margin-top:1rem"><a class="btn" style="flex:1" href="#/erros">Ver erros</a><a class="btn btn-lime" style="flex:1" href="#/praticar">Concluir</a></div>`, { rail: false });
    sfx.finish(); if (pct >= 60) confetti();
    if (streak?.mudou) await csStreak(av(), streak.streak, streak.congelou);
    for (const a of ach.novos || []) await csConquista(a, av());
    void v;
  }
  w.querySelector("#prev").onclick = () => { if (i > 0) { i--; sfx.tap(); show(); } };
  w.querySelector("#nx").onclick = () => { sfx.tap(); if (i < qs.length - 1) { i++; show(); } else confirmar(); };
  w.querySelector("#folha").onclick = folha;
  w.querySelector(".x").onclick = () => {
    const m = modal(`<h2>Abandonar o simulado?</h2><p>As respostas não serão salvas.</p><div class="row2"><button class="btn" id="s">Abandonar</button><button class="btn btn-lime" id="f">Voltar à prova</button></div>`);
    m.querySelector("#s").onclick = () => { clearInterval(tick); m.close(); navigate("/simulados"); };
    m.querySelector("#f").onclick = () => m.close();
  };
  show();
}
