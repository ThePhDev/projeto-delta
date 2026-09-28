// ============================================================
// PROJETO DELTA · praticar, loja, perfil, ranking, missões,
// caderno de erros, painel, técnicas e administração
// ============================================================
import { SUBJECTS } from "./content.js";
import {
  sb, state, navigate, shell, page, TOPIC, EIXO, eixoDoTopico, av, nivelDe, ligaDe, LIGAS, LESSON,
  revisoesHoje, seen, markSeen, resetTutorial, setTheme, refreshStats, updateTop, isAdmin, claimAchievements
} from "./core.js";
import { deltaSVG, avatarHTML, fundoSVG, CORES, COIN } from "./mascot.js";
import { ic, medalSVG, gemSVG, STAR_SOLID } from "./icons.js";
import { h, esc, toast, modal, sheet, confetti, coinBurst, flyText, react, coach, countUp } from "./ui.js";
import { sfx } from "./sfx.js";
import { csUnbox, csConquista, csChegada } from "./cutscene.js";
import { abrirFeedback, abrirGuia, plano } from "./plan.js";

// ============================================================
// PRATICAR
// ============================================================
export function viewPraticar() {
  const due = revisoesHoje();
  const v = shell("praticar", `${page("Praticar", "Treinos rápidos que fixam o que você já viu.")}
    <div class="revcard"><div class="dm dm-live">${deltaSVG({ ...av(), expr: due.length ? "pensando" : "feliz" })}</div>
      <h2>Revisão de hoje</h2>
      ${due.length ? `<ul>${due.slice(0, 4).map(r => `<li>${ic("cycle")}${esc(TOPIC[r.topic_id].l.titulo)}</li>`).join("")}</ul><a class="btn" href="#/treino/revisao">Revisar agora</a>`
        : `<ul><li>${ic("check")}Nada vencido hoje</li><li>${ic("bulb")}Reforce seus pontos fracos</li></ul><a class="btn" href="#/treino/revisao">Reforçar mesmo assim</a>`}
    </div>
    <h2 class="sec">Organizar os estudos</h2>
    <div class="hub">
      <a href="#/cronograma" style="--ib:#0f1a36;--ic:#7fb0ff"><span class="i">${ic("calendar")}</span><div><b>Cronograma</b><small>Escolha o que estudar em cada dia da semana</small></div></a>
      <a href="#/diagnostico" style="--ib:#1f1238;--ic:#c4b5fd"><span class="i">${ic("target")}</span><div><b>Diagnóstico ${plano().diag ? "(refazer)" : "inicial"}</b><small>8 questões para achar seus pontos fracos</small></div></a>
    </div>
    <h2 class="sec">Treino por eixo</h2>
    <div class="hub">${SUBJECTS.map(s => `<a href="#/treino/${s.id}" style="--ib:hsl(${s.hue} 60% 20%);--ic:hsl(${s.hue} 90% 72%)"><span class="i">${esc(s.simbolo)}</span><div><b>${esc(s.nome)}</b><small>Variações estilo ENEM + questões oficiais</small></div></a>`).join("")}</div>
    <h2 class="sec">Modo prova</h2>
    <div class="hub">
      <a href="#/enem" style="--ib:#2e2506;--ic:#ffe08a"><span class="i">${ic("star")}</span><div><b>Banco ENEM</b><small>Questões oficiais do INEP por ano e assunto</small></div></a>
      <a href="#/simulados" style="--ib:#2a0f2e;--ic:#ff7ef0"><span class="i">${ic("timer")}</span><div><b>Simulado</b><small>Tempo corrido e gabarito no final</small></div></a>
      <a href="#/treino/mix" style="--ib:#0b2830;--ic:#00f0ff"><span class="i">${ic("grid")}</span><div><b>Treino intercalado</b><small>Mistura os quatro eixos, como na prova</small></div></a>
      <a href="#/treino/erros" style="--ib:#3a1220;--ic:#ff8fa3"><span class="i">${ic("cycle")}</span><div><b>Refazer erros</b><small>Questões do seu caderno de erros</small></div></a>
    </div>
    <h2 class="sec">Acompanhar</h2>
    <div class="hub">
      <a href="#/missoes" style="--ib:#2e2506;--ic:var(--gold)"><span class="i">${ic("flag")}</span><div><b>Missões</b><small>Metas diárias e semanais com recompensa</small></div></a>
      <a href="#/erros" style="--ib:#1f1238;--ic:#c4b5fd"><span class="i">${ic("book")}</span><div><b>Caderno de erros</b><small>Anote o motivo e marque o que dominou</small></div></a>
      <a href="#/painel" style="--ib:#0f1a36;--ic:#7fb0ff"><span class="i">${ic("chart")}</span><div><b>Painel</b><small>Seu desempenho por eixo e por dia</small></div></a>
      <button id="guia" style="--ib:#0e3322;--ic:#6ee7a8"><span class="i">${ic("question")}</span><div><b>Como usar o Delta</b><small>Guia rápido de cada função</small></div></button>
    </div>`);
  v.querySelector("#guia").onclick = () => abrirGuia();
  if (!seen("praticar")) setTimeout(() => document.body.contains(v) && coach([
    { el: ".revcard", text: "Aqui entra a revisão espaçada: eu te lembro do assunto no dia certo, antes de você esquecer." },
    { el: '.hub a[href="#/enem"]', text: "E aqui tem prova de verdade: só questões oficiais do ENEM, com gabarito do INEP." }
  ], { av: av(), onDone: () => markSeen("praticar") }), 500);
}

// ============================================================
// LOJA
// ============================================================
const CATS = [["tudo", "Tudo"], ["cabeca", "Cabeça"], ["corpo", "Corpo"], ["acessorio", "Acessório"], ["fundo", "Fundo"], ["poder", "Poderes"]];
const RAR = { comum: ["Comum", "#4a4866"], raro: ["Raro", "#2979ff"], epico: ["Épico", "#9b5cf6"], lendario: ["Lendário", "#e0a800"] };
const RAR_IC = { comum: "hex", raro: "sparkle", epico: "star", lendario: "crown" };
let catAtual = "tudo";

function preview(it) {
  if (it.categoria === "poder") return `<div class="prev"><div class="pw" style="color:#7fe7ff">${ic("ice").replace('class="ic ', 'style="width:100%;height:auto" class="ic ')}</div></div>`;
  const look = { ...av(), [it.categoria]: it.id };
  return `<div class="prev">${fundoSVG(it.categoria === "fundo" ? it.id : look.fundo || "espaco")}<div class="dm">${deltaSVG({ ...look, expr: "feliz" })}</div></div>`;
}
const owned = it => it.categoria === "poder" ? false : it.id === "espaco" || state.items.has(it.id);
const equipped = it => it.categoria !== "poder" && (av()[it.categoria] || (it.categoria === "fundo" ? "espaco" : null)) === it.id;

export function viewLoja() {
  const nivel = nivelDe(state.stats.xp || 0).nivel;
  const list = state.shop.filter(i => catAtual === "tudo" || i.categoria === catAtual);
  const v = shell("loja", `${page("Loja", "Troque seus Deltas por visuais para o seu astronauta.")}
    <div class="card pad" style="display:flex;align-items:center;gap:1rem"><div class="dm dm-live" style="width:78px" id="lm">${deltaSVG({ ...av(), expr: "feliz" })}</div>
      <div><b style="font-size:1.4rem;display:flex;align-items:center;gap:.4rem;color:#00f0ff">${COIN}<span id="saldo">${state.stats.deltas}</span></b><small class="muted" style="font-weight:700">Ganhe Deltas com lições (40% do XP), missões e conquistas.</small></div></div>
    <div class="filters" role="tablist">${CATS.map(([k, n]) => `<button role="tab" aria-selected="${k === catAtual}" class="${k === catAtual ? "on" : ""}" data-c="${k}">${n}</button>`).join("")}</div>
    <div class="rar-legend">${Object.values(RAR).map(([n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join("")}</div>
    <div class="shop-grid">${list.map((it, k) => {
      const lock = it.nivel_min > nivel, own = owned(it), eq = equipped(it);
      const btn = it.categoria === "poder" ? (state.stats.congelamentos >= 2 ? `<button class="btn btn-sm" disabled>Máximo: 2</button>` : `<button class="btn btn-sm btn-teal" data-buy="${it.id}">Comprar</button>`)
        : lock ? `<button class="btn btn-sm" disabled>${ic("lock")}Nível ${it.nivel_min}</button>`
        : eq ? `<button class="btn btn-sm" data-off="${it.id}">Equipado</button>`
        : own ? `<button class="btn btn-sm btn-teal" data-eq="${it.id}">Equipar</button>`
        : `<button class="btn btn-sm btn-lime" data-buy="${it.id}">Comprar</button>`;
      return `<div class="item r-${it.raridade}" style="--d:${Math.min(k, 12) * 0.04}s"><span class="rtag" title="${RAR[it.raridade][0]}">${ic(RAR_IC[it.raridade])}</span>${preview(it)}
        <h3>${esc(it.nome)}</h3>${own || eq ? `<small class="muted" style="font-weight:800">${eq ? "Em uso" : "Seu"}</small>` : `<span class="price">${COIN}${it.preco}</span>`}
        ${it.categoria === "poder" ? `<small class="muted" style="font-weight:700;margin-top:.3rem">Você tem ${state.stats.congelamentos || 0}/2</small>` : ""}${btn}</div>`;
    }).join("")}</div>`);
  v.querySelectorAll("[data-c]").forEach(b => b.onclick = () => { sfx.select(); catAtual = b.dataset.c; viewLoja(); });
  v.querySelectorAll("[data-buy]").forEach(b => b.onclick = () => comprar(state.shop.find(i => i.id === b.dataset.buy), b));
  v.querySelectorAll("[data-eq]").forEach(b => b.onclick = () => equipar(state.shop.find(i => i.id === b.dataset.eq)));
  v.querySelectorAll("[data-off]").forEach(b => b.onclick = () => { const it = state.shop.find(i => i.id === b.dataset.off); if (it.categoria !== "fundo") equipar(it, true); });
  if (!seen("loja")) setTimeout(() => document.body.contains(v) && coach([
    { el: ".shop-grid .item", text: "Cada item mostra o seu astronauta já vestido. Quanto mais raro, mais Deltas custa." },
    { el: ".filters", text: "Filtre por tipo. Em Poderes tem o congelamento, que protege sua sequência num dia sem estudo." }
  ], { av: av(), onDone: () => markSeen("loja") }), 500);
}

function comprar(it, btn) {
  if (!it) return;
  sfx.tap();
  const falta = it.preco - (state.stats.deltas || 0);
  const m = modal(`<div style="width:170px;margin:0 auto" class="item r-${it.raridade}">${preview(it)}</div>
    <h2 style="margin-top:.8rem">${esc(it.nome)}</h2><p>${esc(it.descricao || "")}</p>
    ${falta > 0 ? `<p style="color:var(--red)">Faltam ${falta} Δ. Complete lições e missões para juntar.</p><button class="btn btn-block" id="n">Entendi</button>`
      : `<div class="row2"><button class="btn" id="n">Agora não</button><button class="btn btn-lime" id="y">${COIN}${it.preco} Comprar</button></div>`}`);
  m.querySelector("#n").onclick = () => m.close();
  const y = m.querySelector("#y"); if (!y) return;
  y.onclick = async () => {
    y.disabled = true;
    const { data, error } = await sb.rpc("buy_item", { p_item: it.id });
    if (error || !data?.ok) {
      y.disabled = false;
      const r = data?.reason;
      toast(r === "saldo" ? "Deltas insuficientes." : r === "level" ? `Disponível a partir do nível ${data.nivel}.` : r === "owned" ? "Você já tem este item." : r === "max" ? "Você já tem 2 congelamentos." : "Não deu para comprar agora.");
      return;
    }
    m.close(); sfx.purchase(); confetti(90);
    state.stats.deltas = data.deltas;
    if (it.categoria === "poder") state.stats.congelamentos = (state.stats.congelamentos || 0) + 1; else state.items.add(it.id);
    updateTop();
    const ach = await claimAchievements();
    const r = await csUnbox(it, av());
    if (r === "equip") await equipar(it, false, true);
    for (const a of ach.novos || []) await csConquista(a, av());
    viewLoja();
  };
}

async function equipar(it, off = false, quiet = false) {
  const { data, error } = await sb.rpc("equip_item", { p_slot: it.categoria, p_item: off ? null : it.id });
  if (error || !data) return toast("Não deu para equipar agora.");
  state.profile.avatar = data; sfx.select(); updateTop();
  if (!quiet) { toast(off ? `${it.nome} guardado.` : `${it.nome} equipado.`); viewLoja(); }
}

// ============================================================
// PERFIL
// ============================================================
function radarSVG(vals) {
  const cx = 150, cy = 120, R = 82, n = vals.length;
  const pt = (k, r) => { const a = -Math.PI / 2 + k * 2 * Math.PI / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  const ring = f => vals.map((_, k) => pt(k, R * f).join(",")).join(" ");
  const poly = vals.map((v, k) => pt(k, R * Math.max(.04, v.p / 100)).join(",")).join(" ");
  return `<svg viewBox="0 0 300 250" role="img" aria-label="Acerto por eixo">
    ${[.25, .5, .75, 1].map(f => `<polygon points="${ring(f)}" fill="none" stroke="var(--line-2)" stroke-width="1.2"/>`).join("")}
    ${vals.map((_, k) => `<line x1="${cx}" y1="${cy}" x2="${pt(k, R)[0]}" y2="${pt(k, R)[1]}" stroke="var(--line-2)"/>`).join("")}
    <polygon points="${poly}" fill="rgba(0,240,255,.22)" stroke="#00f0ff" stroke-width="2.5" stroke-linejoin="round"/>
    ${vals.map((v, k) => { const [x, y] = pt(k, R + 20); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${esc(v.n)} ${v.t ? v.p + "%" : "-"}</text>`; }).join("")}
  </svg>`;
}
export function eixoStats() {
  return SUBJECTS.map(s => {
    let a = 0, e = 0;
    Object.values(state.topics).forEach(t => { if (TOPIC[t.topic_id]?.s.id === s.id) { a += t.acertos || 0; e += t.erros || 0; } });
    return { n: s.nome.split(" ")[0], p: a + e ? Math.round(a / (a + e) * 100) : 0, t: a + e };
  });
}

export function viewPerfil() {
  const s = state.stats, p = state.profile, n = nivelDe(s.xp || 0);
  const licoes = Object.values(state.lessons).filter(l => l.estrelas > 0).length;
  const v = shell("perfil", `
    <div class="hero-card">
      <button class="cfg" id="cfg" aria-label="Ajustes">${ic("gear")}</button><button class="edit" id="edit" aria-label="Editar astronauta">${ic("pencil")}</button>
      <div class="av iri-border">${avatarHTML(av())}</div>
      <h1>${esc(p.nome || "Estudante")}</h1><div class="nm">@${esc(p.username || "sem_usuario")}${p.escola ? " · " + esc(p.escola) : ""}</div>
      <div class="lv"><span>NV ${n.nivel}</span><span class="b"><i style="width:${Math.round(n.atual / n.necessario * 100)}%"></i></span><span>${n.atual}/${n.necessario}</span></div>
    </div>
    <div class="stats4">
      <div class="stat" style="--ib:#2e2506;--ic:var(--gold)"><span class="i">${ic("bolt")}</span><div><div class="v" data-c="${s.xp || 0}">0</div><div class="l">XP total</div></div></div>
      <div class="stat" style="--ib:#3a1a06;--ic:var(--orange)"><span class="i">${ic("fire")}</span><div><div class="v">${s.streak_atual || 0}</div><div class="l">Sequência · recorde ${s.melhor_streak || 0}</div></div></div>
      <div class="stat" style="--ib:#0b2830;--ic:#00f0ff"><span class="i">${COIN}</span><div><div class="v" data-c="${s.deltas || 0}">0</div><div class="l">Deltas</div></div></div>
      <div class="stat" style="--ib:#1f1238;--ic:#c4b5fd"><span class="i">${ic("check")}</span><div><div class="v">${licoes}/${Object.keys(LESSON).length}</div><div class="l">Lições concluídas</div></div></div>
    </div>
    <h2 class="sec">Conquistas · ${state.myAch.size}/${state.ach.length}</h2>
    <div class="card pad"><div class="medals">${state.ach.map(a => `<button class="medal-c ${state.myAch.has(a.code) ? "" : "off"}" data-a="${a.code}">${medalSVG(a.icone, state.myAch.has(a.code))}${esc(a.titulo)}</button>`).join("")}</div></div>
    <h2 class="sec">Acerto por eixo</h2>
    <div class="card radar">${radarSVG(eixoStats())}</div>`);
  v.querySelectorAll("[data-c]").forEach(el => countUp(el, +el.dataset.c));
  v.querySelector("#edit").onclick = guardaRoupa;
  v.querySelector("#cfg").onclick = ajustes;
  v.querySelectorAll("[data-a]").forEach(b => b.onclick = () => {
    const a = state.ach.find(x => x.code === b.dataset.a), on = state.myAch.has(a.code); sfx.tap();
    const m = modal(`<div class="medal">${medalSVG(a.icone, on)}</div><h2>${esc(a.titulo)}</h2><p>${esc(a.descricao)}</p><p><span class="price">${on ? "Conquistada" : `Vale +${a.recompensa}`} ${on ? "" : COIN}</span></p><button class="btn btn-block" id="ok">Fechar</button>`);
    m.querySelector("#ok").onclick = () => m.close();
  });
}

function guardaRoupa() {
  sfx.tap();
  const SLOTS = [["cor", "Cor"], ["cabeca", "Cabeça"], ["corpo", "Corpo"], ["acessorio", "Acessório"], ["fundo", "Fundo"]];
  let slot = "cor";
  const s = sheet("Seu astronauta", `<div class="stage" style="position:relative;border-radius:24px;overflow:hidden;aspect-ratio:1.5;display:grid;place-items:end center;border:2px solid var(--line)" id="st"></div>
    <div class="tabs2" style="margin-top:.8rem">${SLOTS.map(([k, n]) => `<button data-s="${k}" class="${k === slot ? "on" : ""}">${n}</button>`).join("")}</div><div id="opts"></div>`);
  const st = s.querySelector("#st"), opts = s.querySelector("#opts");
  const stage = expr => { st.innerHTML = `${fundoSVG(av().fundo || "espaco")}<div class="dm dm-live" style="width:40%;margin-bottom:-2%">${deltaSVG({ ...av(), expr })}</div>`; };
  function draw() {
    s.querySelectorAll("[data-s]").forEach(b => b.classList.toggle("on", b.dataset.s === slot));
    if (slot === "cor") {
      opts.innerHTML = `<div class="swatches">${Object.entries(CORES).map(([k, c]) => `<button aria-label="${c.n}" data-cor="${k}" class="${av().cor === k ? "on" : ""}" style="--c:${c.g}"></button>`).join("")}</div>`;
      opts.querySelectorAll("[data-cor]").forEach(b => b.onclick = async () => {
        const { data, error } = await sb.rpc("set_avatar_color", { p_cor: b.dataset.cor });
        if (error) return toast("Não deu para salvar a cor.");
        state.profile.avatar = data; sfx.select(); stage("comemorando"); draw(); updateTop();
      });
      return;
    }
    const mine = state.shop.filter(i => i.categoria === slot && (state.items.has(i.id) || i.id === "espaco"));
    const cur = av()[slot] || (slot === "fundo" ? "espaco" : null);
    opts.innerHTML = `<div class="picks">${slot !== "fundo" ? `<button class="pick ${!cur ? "on" : ""}" data-i=""><div class="dm">${deltaSVG({ ...av(), [slot]: null })}</div>Nada</button>` : ""}
      ${mine.map(i => `<button class="pick ${cur === i.id ? "on" : ""}" data-i="${i.id}">${slot === "fundo" ? `<div style="aspect-ratio:1;border-radius:12px;overflow:hidden;position:relative;margin-bottom:.3rem">${fundoSVG(i.id)}</div>` : `<div class="dm">${deltaSVG({ ...av(), [slot]: i.id })}</div>`}${esc(i.nome)}</button>`).join("")}</div>
      ${mine.length ? "" : `<p class="muted" style="font-weight:700;margin-top:.6rem">Você ainda não tem itens deste tipo.</p>`}
      <a class="btn btn-block" href="#/loja" style="margin-top:.8rem">${ic("bag")}Ver mais na loja</a>`;
    opts.querySelectorAll("[data-i]").forEach(b => b.onclick = async () => {
      const { data, error } = await sb.rpc("equip_item", { p_slot: slot, p_item: b.dataset.i || null });
      if (error) return toast("Não deu para equipar.");
      state.profile.avatar = data; sfx.select(); stage("surpreso"); react(st.querySelector(".dm"), av(), "comemorando", "jump"); draw(); updateTop();
    });
  }
  s.querySelectorAll("[data-s]").forEach(b => b.onclick = () => { slot = b.dataset.s; sfx.tap(); draw(); });
  stage("feliz"); draw();
  const obs = new MutationObserver(() => { if (!document.body.contains(s)) { obs.disconnect(); if (location.hash === "#/perfil") viewPerfil(); } });
  obs.observe(document.body, { childList: true });
}

function ajustes() {
  sfx.tap();
  const p = state.profile, dark = document.documentElement.getAttribute("data-theme") !== "light";
  const s = sheet("Ajustes", `<div class="settings">
    <div class="row"><span>${ic("moon")} Tema escuro</span><button class="switch ${dark ? "on" : ""}" id="th" role="switch" aria-checked="${dark}" aria-label="Tema escuro"></button></div>
    <div class="row"><span>${ic("sound")} Efeitos sonoros</span><button class="switch ${sfx.isMuted() ? "" : "on"}" id="snd" role="switch" aria-checked="${!sfx.isMuted()}" aria-label="Efeitos sonoros"></button></div>
    <div class="row" style="flex-direction:column;align-items:stretch"><span>${ic("target")} Meta diária</span><div class="segs">${[[20, "Casual"], [50, "Regular"], [100, "Intenso"]].map(([m, n]) => `<button data-m="${m}" class="${p.meta_diaria === m ? "on" : ""}" aria-label="${n}, ${m} XP">${m} XP</button>`).join("")}</div></div>
    <div class="row" style="flex-direction:column;align-items:stretch;gap:.5rem"><span>${ic("user")} Dados</span>
      <div class="input"><input id="nome" maxlength="60" value="${esc(p.nome || "")}" placeholder="Nome" aria-label="Nome" /></div>
      <div class="input"><input id="esc" maxlength="80" value="${esc(p.escola || "")}" placeholder="Escola" aria-label="Escola" /></div>
      <button class="btn btn-sm" id="sv">Salvar dados</button></div>
    <div class="row"><span>${ic("question")} Ver o tutorial de novo</span><button class="btn btn-sm" id="tut">Rever</button></div>
    <div class="row"><span>${ic("book")} Guia de uso</span><button class="btn btn-sm" id="guiaA">Abrir</button></div>
    <div class="row"><span>${ic("mail")} Enviar feedback para a equipe</span><button class="btn btn-sm btn-teal" id="fbA">Opinar</button></div>
    <div class="row"><span>${ic("rocket")} Cena de chegada do Delta</span><button class="btn btn-sm" id="cena">Assistir</button></div>
    ${isAdmin() ? `<div class="row"><span>${ic("admin")} Administração</span><a class="btn btn-sm" href="#/admin">Abrir</a></div>` : ""}
    <div class="row"><span>${ic("logout")} Sair da conta</span><button class="btn btn-sm btn-red" id="out">Sair</button></div>
  </div>`);
  s.querySelector("#th").onclick = e => { const on = !e.currentTarget.classList.contains("on"); e.currentTarget.classList.toggle("on", on); e.currentTarget.setAttribute("aria-checked", on); setTheme(on ? "dark" : "light"); sfx.tap(); };
  s.querySelector("#snd").onclick = e => { const on = !e.currentTarget.classList.contains("on"); sfx.setMuted(!on); e.currentTarget.classList.toggle("on", on); e.currentTarget.setAttribute("aria-checked", on); sfx.tap(); };
  s.querySelectorAll("[data-m]").forEach(b => b.onclick = async () => {
    const m = +b.dataset.m; const { error } = await sb.from("profiles").update({ meta_diaria: m }).eq("id", state.session.user.id);
    if (error) return toast("Não deu para salvar a meta.");
    p.meta_diaria = m; sfx.select(); s.querySelectorAll("[data-m]").forEach(x => x.classList.toggle("on", x === b)); updateTop();
  });
  s.querySelector("#sv").onclick = async () => {
    const nome = s.querySelector("#nome").value.trim(), escola = s.querySelector("#esc").value.trim();
    if (!nome) return toast("O nome não pode ficar vazio.");
    const { error } = await sb.from("profiles").update({ nome, escola: escola || null }).eq("id", state.session.user.id);
    if (error) return toast("Não deu para salvar.");
    p.nome = nome; p.escola = escola; toast("Dados salvos."); sfx.correct();
  };
  s.querySelector("#tut").onclick = async () => { await resetTutorial(); s.close(); toast("Tutorial reiniciado."); navigate("/inicio"); };
  s.querySelector("#guiaA").onclick = () => { s.close(); abrirGuia(); };
  s.querySelector("#fbA").onclick = () => { s.close(); abrirFeedback("ajustes"); };
  s.querySelector("#cena").onclick = () => { s.close(); csChegada(av(), primeiroNomeP()); };
  s.querySelector("#out").onclick = async () => { s.close(); await sb.auth.signOut(); };
}

// ============================================================
// RANKING
// ============================================================
export function viewRanking() {
  let period = "semanal";
  const v = shell("ranking", `<div class="league" id="lg"><div class="spin"></div></div>
    <div class="segs" role="tablist">${[["diario", "Hoje"], ["semanal", "Semana"], ["mensal", "Mês"], ["geral", "Geral"]].map(([k, n]) => `<button data-p="${k}" class="${k === period ? "on" : ""}">${n}</button>`).join("")}</div>
    <div id="rk"><div class="spin"></div></div>`);
  sb.rpc("my_rank", { p_period: "semanal" }).then(({ data }) => {
    const xp = data?.xp || 0, l = ligaDe(xp), nx = LIGAS[LIGAS.indexOf(l) + 1];
    v.querySelector("#lg").innerHTML = `<h2>${l.nome}</h2>${gemSVG(l.c[0], l.c[1])}<small>${xp} XP nesta semana${data?.pos ? ` · ${data.pos}º lugar` : ""}</small>
      <small>${nx ? `Faltam ${Math.max(0, nx.min - xp)} XP para a ${nx.nome}` : "Você está na liga mais alta."}</small>`;
  });
  async function load() {
    const host = v.querySelector("#rk"); host.innerHTML = `<div class="spin"></div>`;
    const [{ data: rows, error }, { data: me }] = await Promise.all([sb.rpc("leaderboard", { p_period: period, p_limit: 50 }), sb.rpc("my_rank", { p_period: period })]);
    if (error) { host.innerHTML = `<div class="empty">Não deu para carregar o ranking agora.</div>`; return; }
    if (!rows?.length) { host.innerHTML = `<div class="empty">Ninguém pontuou neste período ainda. A primeira posição está livre.</div>`; return; }
    const nome = r => r.username ? "@" + r.username : (r.nome || "Estudante");
    const top3 = rows.slice(0, 3), rest = rows.slice(3);
    const pod = [top3[1], top3[0], top3[2]].map((r, k) => r ? `<div class="pod p${[2, 1, 3][k]}" style="--d:${[.15, 0, .3][k]}s"><div class="av">${avatarHTML(r.avatar || {}, { anim: false })}</div>
      <div class="base"><div class="n">${r.pos}</div></div><div class="u">${esc(nome(r))}</div><div class="x">${r.xp} XP</div></div>` : "<div></div>").join("");
    const inList = rows.some(r => r.is_me);
    host.innerHTML = `<div class="podium">${pod}</div>` + rest.map((r, k) => `<div class="rrow ${r.is_me ? "me" : ""}" style="--d:${Math.min(k, 10) * .04}s"><span class="pos">${r.pos}</span>
      <span class="av">${avatarHTML(r.avatar || {}, { anim: false })}</span><span class="u">${esc(nome(r))}${r.escola ? `<small>${esc(r.escola)}</small>` : ""}</span>
      <span class="muted" style="font-weight:800;display:flex;align-items:center;gap:.2rem">${ic("fire")}${r.streak}</span><span class="x">${r.xp} XP</span></div>`).join("")
      + (!inList && me?.pos ? `<div class="rrow me"><span class="pos">${me.pos}</span><span class="av">${avatarHTML(av(), { anim: false })}</span><span class="u">Você</span><span class="x">${me.xp} XP</span></div>` : "");
  }
  v.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { period = b.dataset.p; sfx.select(); v.querySelectorAll("[data-p]").forEach(x => x.classList.toggle("on", x === b)); load(); });
  load();
}

// ============================================================
// MISSÕES
// ============================================================
export async function viewMissoes() {
  const v = shell("missoes", `${page("Missões", "Complete, resgate e ganhe XP e Deltas.")}<div id="mh"><div class="spin"></div></div>`);
  const { data, error } = await sb.rpc("mission_progress");
  const host = v.querySelector("#mh");
  if (error || !data) { host.innerHTML = `<div class="empty">Não deu para carregar as missões agora.</div>`; return; }
  const bloco = (per, tit) => { const l = data.filter(m => m.periodo === per); if (!l.length) return "";
    return `<h2 class="sec">${tit} · ${l.filter(m => m.resgatada).length}/${l.length}</h2><div class="card pad">` + l.map(m => {
      const pct = Math.min(100, Math.round(m.progresso / m.alvo * 100)), ok = m.progresso >= m.alvo;
      return `<div class="mission"><span class="i">${ic(m.resgatada ? "check" : ok ? "gift" : "flag")}</span><div class="b"><b>${esc(m.titulo)}</b><small>${esc(String(m.descricao || "").replace(/matérias/g, "eixos"))}</small>
        <div class="t"><i style="width:${pct}%"></i></div><small>${Math.min(m.progresso, m.alvo)}/${m.alvo} · +${m.xp_recompensa} XP</small></div>
        ${m.resgatada ? `<span class="tag">${ic("check")}Feito</span>` : ok ? `<button class="btn btn-sm btn-lime" data-c="${esc(m.code)}">Resgatar</button>` : ""}</div>`; }).join("") + `</div>`; };
  host.innerHTML = bloco("diaria", "Hoje") + bloco("semanal", "Esta semana");
  host.querySelectorAll("[data-c]").forEach(b => b.onclick = async () => {
    b.disabled = true;
    const { data: r, error: e } = await sb.rpc("claim_mission", { p_code: b.dataset.c });
    if (e || !r?.ok) { b.disabled = false; return toast(r?.reason === "already_claimed" ? "Missão já resgatada." : "Missão ainda não concluída."); }
    const before = state.stats.deltas; await refreshStats(); state.xpHoje += r.xp || 0;
    sfx.achievement(); confetti(90); flyText(`+${r.xp} XP`, b.getBoundingClientRect().left, b.getBoundingClientRect().top - 20);
    coinBurst(state.stats.deltas - before, b);
    setTimeout(() => location.hash === "#/missoes" && viewMissoes(), 1300);
  });
}

// ============================================================
// CADERNO DE ERROS
// ============================================================
const MOTIVOS = [["nao_conhecia", "Não conhecia o conteúdo"], ["esqueci_formula", "Esqueci a fórmula"], ["interpretei_errado", "Interpretei errado"],
  ["errei_calculo", "Errei o cálculo"], ["falta_atencao", "Falta de atenção"], ["chutei", "Chutei"], ["sem_tempo", "Não tive tempo"]];
export async function viewErros() {
  const v = shell("erros", `${page("Caderno de erros", "Cada erro é um mapa do que estudar. Anote o motivo e refaça.")}
    <a class="btn btn-lime btn-block" href="#/treino/erros">${ic("cycle")}Refazer meus erros</a><div id="eh" style="margin-top:1rem"><div class="spin"></div></div>`);
  const { data, error } = await sb.from("error_notebook").select("*").eq("dominado", false).order("updated_at", { ascending: false }).limit(60);
  const host = v.querySelector("#eh");
  if (error) { host.innerHTML = `<div class="empty">Não deu para carregar agora.</div>`; return; }
  if (!data?.length) { host.innerHTML = `<div class="talk"><div class="dm dm-live">${deltaSVG({ ...av(), expr: "comemorando" })}</div><div class="bubble left">Caderno limpo! Quando errar uma questão, ela aparece aqui para você revisar.</div></div>`; return; }
  host.innerHTML = data.map(e => `<div class="card err-card" data-id="${e.id}">
    <div class="qmeta" style="margin:0">${e.origem === "enem" || e.origem === "simulado" ? `<span class="tag oficial">${ic("star")}Oficial ENEM</span>` : `<span class="tag plat">${ic("sparkle")}Plataforma</span>`}
      ${e.topico ? `<span class="tag">${esc(TOPIC[e.topico]?.l.titulo || e.topico)}</span>` : ""}<span class="tag">${e.tentativas}x</span></div>
    <p class="q">${esc(String(e.enunciado || "").slice(0, 320))}${(e.enunciado || "").length > 320 ? "..." : ""}</p>
    <div class="a"><span class="w">Você: ${esc(e.resposta_aluno || "-")}</span><span class="r">Certa: ${esc(e.resposta_correta || "-")}</span></div>
    ${e.explicacao ? `<p class="e">${esc(e.explicacao)}</p>` : ""}
    <div class="f"><select aria-label="Motivo do erro"><option value="">Por que errei?</option>${MOTIVOS.map(([k, n]) => `<option value="${k}" ${e.motivo === k ? "selected" : ""}>${n}</option>`).join("")}</select>
      <button class="btn btn-sm btn-green">${ic("check")}Dominei</button></div></div>`).join("");
  host.querySelectorAll(".err-card").forEach(c => {
    c.querySelector("select").onchange = async ev => { await sb.from("error_notebook").update({ motivo: ev.target.value || null, updated_at: new Date().toISOString() }).eq("id", c.dataset.id); sfx.select(); toast("Motivo anotado."); };
    c.querySelector(".btn-green").onclick = async () => {
      await sb.from("error_notebook").update({ dominado: true, updated_at: new Date().toISOString() }).eq("id", c.dataset.id);
      sfx.correct(); c.style.transition = "opacity .3s, transform .3s"; c.style.opacity = "0"; c.style.transform = "translateX(40px)"; setTimeout(() => c.remove(), 300);
    };
  });
}

// ============================================================
// PAINEL
// ============================================================
export async function viewPainel() {
  const v = shell("painel", `${page("Painel", "Seu desempenho real, calculado a partir das suas respostas.")}
    <div class="card pad"><h3 style="font-weight:900">XP nos últimos 7 dias</h3><div class="bars" id="bars"><div class="spin"></div></div></div>
    <h2 class="sec">Acerto por eixo</h2><div class="card radar">${radarSVG(eixoStats())}</div>
    <h2 class="sec">Pontos a reforçar</h2><div class="card pad" id="weak"></div>
    <h2 class="sec">Totais</h2><div class="stats4" id="tot"><div class="spin"></div></div>`);
  const since = new Date(); since.setHours(0, 0, 0, 0); since.setDate(since.getDate() - 6);
  const [{ data: xs }, { data: qa }] = await Promise.all([
    sb.from("xp_events").select("amount,created_at").gte("created_at", since.toISOString()),
    sb.from("question_attempts").select("origem,correta,topico").order("created_at", { ascending: false }).limit(2000)
  ]);
  const days = Array.from({ length: 7 }, (_, k) => { const d = new Date(since); d.setDate(d.getDate() + k); return d; });
  const sum = days.map(d => (xs || []).filter(x => new Date(x.created_at).toDateString() === d.toDateString()).reduce((a, x) => a + x.amount, 0));
  const max = Math.max(20, ...sum);
  v.querySelector("#bars").innerHTML = days.map((d, k) => `<div class="b ${k === 6 ? "today" : ""}"><em>${sum[k] || ""}</em><i style="height:${Math.round(sum[k] / max * 100)}%;--d:${k * .06}s"></i><span>${"DSTQQSS"[d.getDay()]}</span></div>`).join("");
  const weak = Object.values(state.topics).filter(t => TOPIC[t.topic_id] && (t.acertos + t.erros) >= 3).map(t => ({ t, p: Math.round(t.acertos / (t.acertos + t.erros) * 100) })).sort((a, b) => a.p - b.p).slice(0, 5);
  v.querySelector("#weak").innerHTML = weak.length ? weak.map(({ t, p }) => `<div class="weak"><span class="n">${esc(TOPIC[t.topic_id].l.titulo)}</span><span class="t"><i style="width:${p}%;background:${p >= 70 ? "var(--green)" : p >= 45 ? "var(--gold)" : "var(--red)"}"></i></span><span class="p">${p}%</span></div>`).join("")
    + `<a class="btn btn-block btn-teal" style="margin-top:.8rem" href="#/treino/revisao">${ic("cycle")}Treinar pontos fracos</a>` : `<p class="muted" style="font-weight:700">Responda mais algumas questões para eu achar seus pontos fracos.</p>`;
  const tot = qa || [], ok = tot.filter(x => x.correta).length, of = tot.filter(x => x.origem === "enem" || x.origem === "simulado");
  v.querySelector("#tot").innerHTML = `
    <div class="stat" style="--ib:#0b2830;--ic:#00f0ff"><span class="i">${ic("question")}</span><div><div class="v">${tot.length}</div><div class="l">Questões respondidas</div></div></div>
    <div class="stat" style="--ib:#0e3322;--ic:var(--green)"><span class="i">${ic("target")}</span><div><div class="v">${tot.length ? Math.round(ok / tot.length * 100) : 0}%</div><div class="l">Acerto geral</div></div></div>
    <div class="stat" style="--ib:#2e2506;--ic:#ffe08a"><span class="i">${ic("star")}</span><div><div class="v">${of.length}</div><div class="l">Oficiais do ENEM</div></div></div>
    <div class="stat" style="--ib:#2e2506;--ic:#ffe08a"><span class="i">${ic("check")}</span><div><div class="v">${of.length ? Math.round(of.filter(x => x.correta).length / of.length * 100) : 0}%</div><div class="l">Acerto nas oficiais</div></div></div>`;
}

// ============================================================
// ADMIN
// ============================================================
export async function viewAdmin() {
  if (!isAdmin()) return navigate("/inicio");
  const v = shell("admin", `${page("Domínios autorizados", "Só e-mails com estes sufixos conseguem criar conta. A regra vale no banco, não só na tela.")}
    <h2 class="sec">Feedback dos estudantes</h2><div id="fbl"><div class="spin"></div></div>
    <h2 class="sec">Adicionar domínio</h2>
    <div class="card pad"><div class="input"><input id="nd" placeholder="ex.: escola.pr.gov.br" aria-label="Novo domínio" /></div><button class="btn btn-lime btn-block" id="add" style="margin-top:.6rem">Adicionar domínio</button></div><div id="dl"></div>`);
  async function load() {
    const { data } = await sb.from("allowed_email_domains").select("*").order("domain");
    v.querySelector("#dl").innerHTML = (data || []).map(d => `<div class="dom-row"><span>@${esc(d.domain)}</span><button class="btn btn-sm" data-id="${esc(d.id)}" aria-label="Remover">${ic("x")}</button></div>`).join("") || `<div class="empty" style="margin-top:1rem">Nenhum domínio cadastrado.</div>`;
    v.querySelectorAll("[data-id]").forEach(b => b.onclick = async () => { const { error } = await sb.from("allowed_email_domains").delete().eq("id", b.dataset.id); if (error) toast("Não deu para remover."); load(); });
  }
  sb.from("feedback").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => {
    const l = data || [], med = l.length ? (l.reduce((a, f) => a + f.nota, 0) / l.length).toFixed(1).replace(".", ",") : "-";
    v.querySelector("#fbl").innerHTML = `<div class="card pad"><b>${l.length} respostas · nota média ${med} de 5</b>${l.slice(0, 30).map(f => `<div class="hist" style="flex-wrap:wrap"><b>${"★".repeat(f.nota)}${"☆".repeat(5 - f.nota)}</b><span class="muted">${new Date(f.created_at).toLocaleDateString("pt-BR")} · ${esc((f.categorias || []).join(", ") || "geral")}</span>${f.texto ? `<p style="flex-basis:100%;font-weight:700">${esc(f.texto)}</p>` : ""}</div>`).join("")}</div>`;
  });
  v.querySelector("#add").onclick = async () => {
    const dom = v.querySelector("#nd").value.trim().toLowerCase().replace(/^@/, "");
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(dom)) return toast("Domínio inválido.");
    const { error } = await sb.from("allowed_email_domains").insert({ domain: dom });
    if (error) return toast("Não deu para adicionar.");
    v.querySelector("#nd").value = ""; load();
  };
  load();
}
const primeiroNomeP = () => (state.profile?.nome || "").trim().split(/\s+/)[0];
