// ============================================================
// PROJETO DELTA · painel administrativo
// Todas as leituras e ações passam por RPCs que exigem is_admin() no banco.
// ============================================================
import { sb, state, navigate, shell, page, isAdmin, LESSON } from "./core.js";
import { ic } from "./icons.js";
import { esc, toast, modal, sheet, countUp } from "./ui.js";
import { sfx } from "./sfx.js";
import { areaChart, barChart, donut, heatmap, funnel, gauge, sparkline, CAT } from "./charts.js";

const nf = n => Number(n || 0).toLocaleString("pt-BR");
const pct = (a, b) => (b ? Math.round(a / b * 100) : 0);
const dia = d => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
const quando = t => (t ? new Date(t).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "nunca");
const PAPEL = { aluno: "Aluno", professor: "Professor", admin: "Admin" };
const FONTE = { acerto: "Questões da trilha", enem: "Questões ENEM", revisao: "Revisão", licao: "Lições", simulado: "Simulados", missao: "Missões" };
const ORIGEM = { licao: "Lições", enem: "ENEM", simulado: "Simulados", revisao: "Revisão" };
const lic = id => LESSON[id]?.l?.titulo || id;

const kpi = (rot, val, sub = "", cor = "var(--teal)") =>
  `<div class="adm-kpi"><div class="l">${rot}</div><div class="v" style="color:${cor}" ${typeof val === "number" ? `data-c="${val}"` : ""}>${typeof val === "number" ? nf(val) : esc(val)}</div>${sub ? `<div class="s">${sub}</div>` : ""}</div>`;

// Barras horizontais animadas (ranking): uma cor, valor sempre em texto
const hbars = (rows, nome, val, txt, cor = "var(--c1)") => {
  const max = Math.max(1, ...rows.map(r => r[val] || 0));
  return rows.length ? `<div class="hbl">${rows.map((r, i) => `<div class="adm-hb" style="--i:${i}"><span class="n" title="${esc(nome(r))}">${esc(nome(r))}</span><span class="t"><i style="--w:${Math.round((r[val] || 0) / max * 100)}%;background:${cor}"></i></span><span class="p">${txt(r)}</span></div>`).join("")}</div>`
    : `<p class="muted adm-empty">Sem dados ainda.</p>`;
};
const tile = (i, titulo, corpo, { cls = "", sub = "", acts = "" } = {}) =>
  `<section class="tile ${cls}" style="--i:${i}"><header><div><h3>${titulo}</h3>${sub ? `<p>${sub}</p>` : ""}</div>${acts}</header>${corpo}</section>`;
function delta(cur, prev, { pp = false } = {}) {
  if (prev == null) return "";
  const d = pp ? cur - prev : prev ? (cur - prev) / prev * 100 : (cur ? 100 : 0);
  if (!isFinite(d)) return "";
  const r = Math.round(d * 10) / 10, up = r > 0, zero = r === 0;
  const txt = `${up ? "+" : ""}${r.toLocaleString("pt-BR")}${pp ? " p.p." : "%"}`;
  return `<span class="dl ${zero ? "eq" : up ? "up" : "dn"}" title="Comparado ao período anterior"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="${zero ? "M2 6h8" : up ? "M6 10V2M2.5 5.5 6 2l3.5 3.5" : "M6 2v8M2.5 6.5 6 10l3.5-3.5"}"/></svg>${txt}<em class="sr">em relação ao período anterior</em></span>`;
}
const card = (i, { icone, rot, val, fmtv, sub = "", dl = "", spark = "", cor }) =>
  `<article class="kc" style="--i:${i};--kc:${cor}"><div class="kc-top"><span class="kc-ic">${ic(icone)}</span><span class="kc-l">${rot}</span>${dl}</div>
   <div class="kc-v" ${typeof val === "number" && !fmtv ? `data-c="${val}"` : ""}>${fmtv || nf(val)}</div><div class="kc-s">${sub}</div>${spark}</article>`;

export async function viewAdmin(parts) {
  if (!isAdmin()) return navigate("/inicio");
  let tab = parts?.[1] || "geral";
  const TABS = [["geral", "Visão geral"], ["usuarios", "Usuários"], ["conteudo", "Conteúdo"], ["feedback", "Feedback"], ["acesso", "Acesso"]];
  if (!TABS.some(t => t[0] === tab)) tab = "geral";
  const v = shell("admin", `${page("Painel administrativo", "Movimento, desempenho e controle de usuários da plataforma.")}
    <div class="adm-tabs" role="tablist">${TABS.map(([k, n]) => `<a href="#/admin/${k}" role="tab" aria-selected="${k === tab}" class="${k === tab ? "on" : ""}">${n}</a>`).join("")}</div>
    <div id="adm"><div class="spin" style="margin:2rem auto"></div></div>`, { rail: false });
  const box = v.querySelector("#adm");
  const fail = () => { box.innerHTML = `<div class="empty">Não consegui carregar os dados agora. <button class="btn btn-sm" id="rt">Tentar de novo</button></div>`; box.querySelector("#rt").onclick = () => viewAdmin(parts); };
  try {
    if (tab === "geral") await geral(box);
    else if (tab === "usuarios") await usuarios(box);
    else if (tab === "conteudo") await conteudo(box);
    else if (tab === "feedback") await feedback(box);
    else await acesso(box);
  } catch (e) { console.error(e); fail(); }
}

async function overview(days = 30) {
  const { data, error } = await sb.rpc("admin_overview", { p_days: days });
  if (error) throw error;
  return data;
}

// ---------------- visão geral ----------------
const METRICAS = [
  ["tentativas", "Questões", "var(--c1)"], ["ativos", "Estudantes ativos", "var(--c4)"],
  ["xp", "XP ganho", "var(--c2)"], ["cadastros", "Cadastros", "var(--c3)"]
];
async function geral(box) {
  let days = 30, metrica = "tentativas", vivo = false, timer = null, carregando = false;
  const stop = () => { clearInterval(timer); timer = null; };
  addEventListener("hashchange", stop, { once: true });
  async function draw(quiet = false) {
    if (carregando) return; carregando = true;
    let o; try { o = await overview(days); } finally { carregando = false; }
    const t = o.totais, all = o.serie, cur = all.slice(-days), prev = all.slice(0, all.length - days);
    const soma = (rows, k) => rows.reduce((a, r) => a + (r[k] || 0), 0);
    const acc = rows => { const tt = soma(rows, "tentativas"); return tt ? soma(rows, "acertos") / tt * 100 : 0; };
    const med = (rows, k) => rows.length ? soma(rows, k) / rows.length : 0;
    const lab = cur.map(r => dia(r.dia));
    const accSerie = cur.map(r => r.tentativas ? r.acertos / r.tentativas * 100 : 0);
    const estudaram = t.usuarios - o.engajamento.nunca_estudaram;
    box.classList.toggle("quiet", quiet);
    box.innerHTML = `
      <div class="adm-bar">
        <div class="segs adm-seg" role="group" aria-label="Período">${[7, 30, 90].map(n => `<button data-d="${n}" class="${n === days ? "on" : ""}" aria-pressed="${n === days}">${n} dias</button>`).join("")}</div>
        <button class="live ${vivo ? "on" : ""}" id="live" aria-pressed="${vivo}"><i></i>${vivo ? "Ao vivo" : "Ao vivo desligado"}</button>
        <span class="upd">Atualizado às ${new Date(o.gerado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
        <button class="btn btn-sm" id="rf">${ic("cycle")} Atualizar</button>
      </div>
      <div class="kcs">
        ${card(0, { icone: "user", rot: "Presença média por dia", val: 0, fmtv: med(cur, "ativos").toLocaleString("pt-BR", { maximumFractionDigits: 1 }), sub: `${nf(t.ativos_hoje)} estudando hoje`, dl: delta(med(cur, "ativos"), med(prev, "ativos")), spark: sparkline(cur.map(r => r.ativos), "var(--c4)"), cor: "var(--c4)" })}
        ${card(1, { icone: "question", rot: "Questões respondidas", val: soma(cur, "tentativas"), sub: `nos últimos ${days} dias`, dl: delta(soma(cur, "tentativas"), soma(prev, "tentativas")), spark: sparkline(cur.map(r => r.tentativas), "var(--c1)"), cor: "var(--c1)" })}
        ${card(2, { icone: "target", rot: "Taxa de acerto", val: 0, fmtv: Math.round(acc(cur)) + "%", sub: `${nf(soma(cur, "acertos"))} acertos no período`, dl: delta(acc(cur), acc(prev), { pp: true }), spark: sparkline(accSerie, "var(--c5)"), cor: "var(--c5)" })}
        ${card(3, { icone: "school", rot: "Novos cadastros", val: soma(cur, "cadastros"), sub: `${nf(t.usuarios)} contas no total`, dl: delta(soma(cur, "cadastros"), soma(prev, "cadastros")), spark: sparkline(cur.map(r => r.cadastros), "var(--c3)"), cor: "var(--c3)" })}
      </div>
      <div class="dash">
        ${tile(4, "Atividade da plataforma", "", { cls: "t-wide", sub: `Linha tracejada: os ${days} dias anteriores`, acts: `<div class="chips" role="group" aria-label="Métrica">${METRICAS.map(([k, n, c]) => `<button data-m="${k}" class="${k === metrica ? "on" : ""}" style="--cc:${c}" aria-pressed="${k === metrica}"><i></i>${n}</button>`).join("")}</div>` })}
        ${tile(5, "Saúde da turma", `<div class="gauges">
            <div>${gauge(pct(t.acertos, t.tentativas), { color: "var(--c5)", label: "Acerto geral" })}<span>Acerto geral</span></div>
            <div>${gauge(pct(t.onboarding_ok, t.usuarios), { color: "var(--c4)", label: "Concluíram o primeiro acesso" })}<span>Primeiro acesso concluído</span></div>
            <div>${gauge(pct(t.ativos_7d, t.usuarios), { color: "var(--c1)", label: "Ativos na semana" })}<span>Ativos na semana</span></div>
          </div>
          <dl class="mini">
            <div><dt>Usuários</dt><dd data-c="${t.usuarios}">${nf(t.usuarios)}</dd></div><div><dt>Lições concluídas</dt><dd data-c="${t.licoes_concluidas}">${nf(t.licoes_concluidas)}</dd></div>
            <div><dt>Simulados</dt><dd data-c="${t.simulados}">${nf(t.simulados)}</dd></div><div><dt>Sequência média</dt><dd>${Number(t.sequencia_media).toLocaleString("pt-BR", { minimumFractionDigits: 1 })} dias</dd></div>
            <div><dt>Erros a revisar</dt><dd data-c="${t.erros_abertos}">${nf(t.erros_abertos)}</dd></div><div><dt>Deltas em circulação</dt><dd data-c="${t.deltas_total}">${nf(t.deltas_total)}</dd></div>
          </dl>`, { sub: `${nf(t.alunos)} alunos · ${nf(t.professores)} professores · ${nf(t.admins)} admin${t.suspensos ? ` · ${nf(t.suspensos)} suspensa(s)` : ""}` })}
        ${tile(6, "Jornada do estudante", "", { sub: "Quantos avançam em cada etapa", cls: "t-fun" })}
        ${tile(7, "Volume por origem", "", { sub: "Onde as questões são respondidas e quanto acertam", cls: "t-don" })}
        ${tile(8, "Quando a turma estuda", "", { cls: "t-wide t-hm", sub: `Questões por dia da semana e hora, últimos ${days} dias` })}
        ${tile(9, "De onde vem o XP", hbars(o.xp_fontes, r => FONTE[r.source] || r.source, "xp", r => `${nf(r.xp)} XP`, "var(--c2)"), { sub: "Soma de todo o histórico" })}
        ${tile(10, "Escolas", hbars(o.escolas, r => r.escola, "n", r => `${nf(r.n)} aluno${r.n === 1 ? "" : "s"}`, "var(--c4)"), { sub: "Cadastros por escola informada", cls: "t-full" })}
      </div>
      <p class="adm-foot">Feedback: ${nf(o.feedback.total)} respostas, nota média ${Number(o.feedback.media).toLocaleString("pt-BR")} de 5. Veja na aba Feedback.</p>`;
    const [tAt, , tFn, tDn, tHm] = box.querySelectorAll(".tile");
    const drawArea = () => {
      const [k, n, c] = METRICAS.find(m => m[0] === metrica);
      tAt.querySelector(".ch")?.remove();
      const host = document.createElement("div"); tAt.appendChild(host);
      areaChart(host, { labels: lab, series: [{ name: n, color: c, values: cur.map(r => r[k] || 0) }], prev: prev.length === cur.length ? prev.map(r => r[k] || 0) : null });
    };
    drawArea();
    const fnHost = document.createElement("div"); tFn.appendChild(fnHost);
    funnel(fnHost, [
      { label: "Criaram conta", value: t.usuarios }, { label: "Concluíram o primeiro acesso", value: t.onboarding_ok },
      { label: "Já estudaram", value: estudaram }, { label: "Sequência de 3+ dias", value: o.engajamento.streak_3_mais },
      { label: "Sequência de 7+ dias", value: o.engajamento.streak_7_mais }
    ]);
    const dnHost = document.createElement("div"); tDn.appendChild(dnHost);
    const origens = ["licao", "enem", "revisao", "simulado"].map((k, i) => { const r = o.origens.find(x => x.origem === k); return r ? { label: ORIGEM[k], value: r.total, extra: `${String(r.acerto).replace(".", ",")}% de acerto`, color: CAT[i] } : null; }).filter(Boolean);
    if (origens.length) donut(dnHost, { items: origens, center: "questões" }); else dnHost.innerHTML = `<p class="muted adm-empty">Sem questões respondidas ainda.</p>`;
    const hmHost = document.createElement("div"); tHm.appendChild(hmHost);
    heatmap(hmHost, o.heatmap || []);
    if (!quiet) box.querySelectorAll("[data-c]").forEach(el => { el.dataset.v = "0"; countUp(el, +el.dataset.c, 1100); });
    box.querySelectorAll("[data-d]").forEach(b => b.onclick = () => { days = +b.dataset.d; sfx.tap(); draw(); });
    box.querySelectorAll("[data-m]").forEach(b => b.onclick = () => {
      metrica = b.dataset.m; sfx.tap();
      box.querySelectorAll("[data-m]").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
      drawArea();
    });
    box.querySelector("#rf").onclick = async () => { sfx.tap(); await draw(true); toast("Dados atualizados."); };
    box.querySelector("#live").onclick = () => {
      vivo = !vivo; sfx.tap(); stop();
      if (vivo) timer = setInterval(() => { if (document.visibilityState === "visible" && location.hash.startsWith("#/admin")) draw(true); }, 30000);
      const b = box.querySelector("#live"); b.classList.toggle("on", vivo); b.setAttribute("aria-pressed", vivo); b.lastChild.textContent = vivo ? "Ao vivo" : "Ao vivo desligado";
      if (vivo) toast("Atualizando a cada 30 segundos.");
    };
  }
  await draw();
}

// ---------------- usuários ----------------
async function usuarios(box) {
  let q = "", ord = "recentes", off = 0; const LIM = 25; let tm;
  box.innerHTML = `
    <div class="adm-head">
      <div class="input" style="flex:1;min-width:180px"><input id="q" type="search" placeholder="Buscar aluno, e-mail ou escola" aria-label="Buscar usuários" /></div>
      <select id="ord" class="adm-sel" aria-label="Ordenar"><option value="recentes">Mais recentes</option><option value="xp">Mais XP</option><option value="streak">Maior sequência</option><option value="ultimo">Último acesso</option><option value="nome">Nome (A–Z)</option></select>
      <button class="btn btn-sm" id="csv">${ic("book")} Exportar CSV</button>
    </div>
    <div id="lst"><div class="spin" style="margin:1.5rem auto"></div></div>`;
  const lst = box.querySelector("#lst");
  async function load() {
    const { data, error } = await sb.rpc("admin_users", { p_search: q || null, p_order: ord, p_limit: LIM, p_offset: off });
    if (error) { lst.innerHTML = `<div class="empty">Erro ao carregar usuários.</div>`; return; }
    const { total, rows } = data;
    lst.innerHTML = `<p class="muted" style="font-weight:800;margin:.2rem 0 .6rem">${nf(total)} usuário(s)</p>
      <div class="adm-table" role="table">${rows.map(u => `
        <button class="adm-row ${u.suspenso ? "susp" : ""}" data-id="${esc(u.id)}" role="row">
          <span class="who"><b>${esc(u.nome || "(sem nome)")}</b><em>${u.username ? "@" + esc(u.username) + " · " : ""}${esc(u.email || "")}</em><em>${esc(u.escola || "sem escola")}</em></span>
          <span class="tag ${u.tipo_usuario}">${PAPEL[u.tipo_usuario] || u.tipo_usuario}${u.suspenso ? " · suspenso" : ""}</span>
          <span class="num"><b>${nf(u.xp)}</b><em>XP</em></span>
          <span class="num"><b>${u.streak}</b><em>sequência</em></span>
          <span class="num"><b>${nf(u.tentativas)}</b><em>${pct(u.acertos, u.tentativas)}% acerto</em></span>
          <span class="num"><b>${u.licoes}</b><em>lições</em></span>
          <span class="num wide"><b>${quando(u.last_sign_in_at)}</b><em>último acesso</em></span>
        </button>`).join("") || `<div class="empty">Nenhum usuário encontrado.</div>`}</div>
      <div class="row2" style="margin-top:1rem"><button class="btn" id="pv" ${off === 0 ? "disabled" : ""}>Anterior</button><button class="btn" id="nx" ${off + LIM >= total ? "disabled" : ""}>Próxima</button></div>`;
    lst.querySelectorAll(".adm-row").forEach(b => b.onclick = () => { sfx.tap(); detalhe(b.dataset.id, load); });
    lst.querySelector("#pv").onclick = () => { off = Math.max(0, off - LIM); load(); };
    lst.querySelector("#nx").onclick = () => { off += LIM; load(); };
  }
  box.querySelector("#q").oninput = e => { clearTimeout(tm); tm = setTimeout(() => { q = e.target.value.trim(); off = 0; load(); }, 300); };
  box.querySelector("#ord").onchange = e => { ord = e.target.value; off = 0; load(); };
  box.querySelector("#csv").onclick = async e => {
    const b = e.currentTarget; b.disabled = true;
    try {
      let all = [], o = 0, total = 1;
      while (o < total && o < 5000) { const { data, error } = await sb.rpc("admin_users", { p_search: q || null, p_order: ord, p_limit: 100, p_offset: o }); if (error) throw error; total = data.total; all = all.concat(data.rows); o += 100; }
      const cols = [["nome", "Nome"], ["username", "Usuário"], ["email", "E-mail"], ["escola", "Escola"], ["tipo_usuario", "Papel"], ["created_at", "Cadastro"], ["last_sign_in_at", "Último acesso"], ["xp", "XP"], ["deltas", "Deltas"], ["streak", "Sequência"], ["tentativas", "Questões"], ["acertos", "Acertos"], ["licoes", "Lições"], ["suspenso", "Suspenso"]];
      // prefixo ' evita que planilhas executem fórmulas vindas de nomes digitados pelos alunos
      const cel = x => { let s = x == null ? "" : String(x); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
      const csv = "﻿" + [cols.map(c => c[1]).join(";")].concat(all.map(u => cols.map(c => cel(u[c[0]])).join(";"))).join("\r\n");
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      a.download = `projeto-delta-usuarios-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast(`${all.length} usuários exportados.`);
    } catch (x) { toast("Não deu para exportar agora."); }
    b.disabled = false;
  };
  await load();
}

async function detalhe(uid, refresh) {
  const { data: d, error } = await sb.rpc("admin_user_detail", { p_uid: uid });
  if (error || !d?.perfil) return toast("Não consegui abrir este usuário.");
  const p = d.perfil, s = d.stats || {}, a = d.auth || {}, eu = uid === state.session.user.id;
  const ac = d.topicos.reduce((x, t) => x + t.acertos, 0), tot = d.topicos.reduce((x, t) => x + t.total, 0);
  const sh = sheet(p.nome || "Usuário", `<div class="adm-det">
    <p class="muted" style="font-weight:700">${p.username ? "@" + esc(p.username) + " · " : ""}${esc(p.email || "")}<br>${esc(p.escola || "sem escola")} · cadastro em ${quando(p.created_at)} · último acesso ${quando(a.ultimo_login)}${a.suspenso ? " · <b style='color:var(--red)'>conta suspensa</b>" : ""}</p>
    <div class="adm-kpis small">
      ${kpi("XP", s.xp || 0)}${kpi("Deltas", s.deltas || 0, "", "var(--gold)")}${kpi("Sequência", s.streak_atual || 0, `melhor: ${s.melhor_streak || 0}`, "var(--green)")}
      ${kpi("Questões", tot, `${pct(ac, tot)}% de acerto`)}${kpi("Lições", d.licoes.length, "", "#c4b5fd")}${kpi("Erros abertos", d.contagens.erros_abertos, "", "var(--red)")}
    </div>
    <h3 class="adm-h3">Questões nos últimos 14 dias</h3><div class="card pad"><div id="dsr"></div></div>
    <h3 class="adm-h3">Por tópico</h3><div class="card pad">${hbars(d.topicos, r => r.topico, "total", r => `${pct(r.acertos, r.total)}% de acerto · ${r.total}`)}</div>
    <h3 class="adm-h3">Lições concluídas</h3><div class="card pad">${d.licoes.length ? d.licoes.slice(0, 12).map(l => `<div class="adm-hb"><span class="n">${esc(lic(l.lesson_id))}</span><span class="p">${"★".repeat(l.estrelas || 0)}${"☆".repeat(3 - (l.estrelas || 0))} · ${l.tentativas}x</span></div>`).join("") : `<p class="muted" style="font-weight:700">Nenhuma ainda.</p>`}</div>
    <h3 class="adm-h3">Atividade recente</h3><div class="card pad">${d.recentes.map(r => `<div class="adm-hb"><span class="n">${esc(r.topico || "—")} <em class="muted">· ${esc(ORIGEM[r.origem] || r.origem)}</em></span><span class="p" style="color:${r.correta ? "var(--green)" : "var(--red)"}">${r.correta ? "acertou" : "errou"} · ${quando(r.created_at)}</span></div>`).join("") || `<p class="muted" style="font-weight:700">Sem atividade.</p>`}</div>
    ${d.feedback.length ? `<h3 class="adm-h3">Feedback enviado</h3><div class="card pad">${d.feedback.map(f => `<p style="font-weight:700"><b>${"★".repeat(f.nota)}</b> ${esc(f.texto || "")}</p>`).join("")}</div>` : ""}
    <h3 class="adm-h3">Controle da conta</h3>
    <div class="card pad" style="display:grid;gap:.7rem">
      <label class="muted" for="papel" style="font-weight:800">Papel</label>
      <select id="papel" class="adm-sel" ${eu ? "disabled" : ""}>${Object.entries(PAPEL).map(([k, n]) => `<option value="${k}" ${p.tipo_usuario === k ? "selected" : ""}>${n}</option>`).join("")}</select>
      <button class="btn ${a.suspenso ? "btn-lime" : "btn-red"}" id="susp" ${eu || p.tipo_usuario === "admin" ? "disabled" : ""}>${a.suspenso ? "Reativar conta" : "Suspender conta"}</button>
      ${eu ? `<p class="muted" style="font-weight:700">Esta é a sua conta: papel e suspensão ficam travados.</p>` : ""}
    </div></div>`);
  sh.querySelectorAll("[data-c]").forEach(el => countUp(el, +el.dataset.c, 600));
  requestAnimationFrame(() => barChart(sh.querySelector("#dsr"), { labels: d.serie.map(r => dia(r.dia)), values: d.serie.map(r => r.tentativas), name: "Questões", height: 170 }));
  const papel = sh.querySelector("#papel");
  papel.onchange = () => {
    const novo = papel.value;
    const m = modal(`<h2>Mudar papel?</h2><p>${esc(p.nome)} passará a ser <b>${PAPEL[novo]}</b>.${novo === "admin" ? " Administradores veem os dados de todos os alunos." : ""}</p><div class="row2"><button class="btn" id="n">Cancelar</button><button class="btn btn-lime" id="s">Confirmar</button></div>`);
    m.querySelector("#n").onclick = () => { m.close(); papel.value = p.tipo_usuario; };
    m.querySelector("#s").onclick = async () => {
      m.close(); const { error } = await sb.rpc("admin_set_role", { p_uid: uid, p_role: novo });
      if (error) { papel.value = p.tipo_usuario; return toast("Não deu para alterar o papel."); }
      p.tipo_usuario = novo; toast("Papel atualizado."); sfx.correct(); refresh();
    };
  };
  sh.querySelector("#susp").onclick = () => {
    const alvo = !a.suspenso;
    const m = modal(`<h2>${alvo ? "Suspender" : "Reativar"} a conta?</h2><p>${alvo ? `${esc(p.nome)} será desconectado e não poderá entrar até você reativar.` : `${esc(p.nome)} poderá entrar de novo.`}</p><div class="row2"><button class="btn" id="n">Cancelar</button><button class="btn ${alvo ? "btn-red" : "btn-lime"}" id="s">Confirmar</button></div>`);
    m.querySelector("#n").onclick = () => m.close();
    m.querySelector("#s").onclick = async () => {
      m.close(); const { error } = await sb.rpc("admin_set_suspended", { p_uid: uid, p_suspenso: alvo });
      if (error) return toast("Não deu para alterar a conta.");
      toast(alvo ? "Conta suspensa." : "Conta reativada."); sfx.correct(); sh.close(); refresh();
    };
  };
}

// ---------------- conteúdo ----------------
async function conteudo(box) {
  const o = await overview(30);
  const fracos = o.topicos.filter(t => t.total >= 10).sort((a, b) => a.acerto - b.acerto).slice(0, 8);
  const tabela = rows => rows.length ? `<table class="tb"><thead><tr><th>Tópico</th><th class="nm">Respostas</th><th>Acerto</th></tr></thead><tbody>${rows.map((r, i) => `
      <tr style="--i:${i}"><td>${esc(r.topico)}</td><td class="nm">${nf(r.total)}</td>
      <td><span class="acb"><i style="--w:${r.acerto}%"></i></span><b class="nm">${String(r.acerto).replace(".", ",")}%</b>${r.acerto < 50 && r.total >= 10 ? `<span class="warn" title="Acerto abaixo de 50%">${ic("bolt")}reforçar</span>` : ""}</td></tr>`).join("")}</tbody></table>` : `<p class="muted adm-empty">Sem dados ainda.</p>`;
  box.innerHTML = `<div class="dash">
    ${tile(0, "Tópicos mais praticados", tabela(o.topicos.slice(0, 12)), { cls: "t-wide", sub: "Volume de respostas e taxa de acerto por tópico" })}
    ${tile(1, "Onde a turma mais erra", hbars(fracos.map(r => ({ ...r, erro: Math.round((100 - r.acerto) * 10) / 10 })), r => r.topico, "erro", r => `${String(r.erro).replace(".", ",")}% de erro`, "var(--c3)"), { sub: "Tópicos com 10+ respostas e maior taxa de erro. Bons candidatos para revisar em sala." })}
    ${tile(2, "Lições mais concluídas", hbars(o.lic_top, r => lic(r.lesson_id), "n", r => `${nf(r.n)} · média ${String(r.estrelas).replace(".", ",")} estrelas`, "var(--c1)"), { cls: "t-half" })}
    ${tile(3, "Itens mais comprados", hbars(o.loja_top, r => r.nome || r.item_id, "n", r => `${nf(r.n)} compra${r.n === 1 ? "" : "s"}`, "var(--c2)"), { sub: "Itens iniciais gratuitos ficam de fora", cls: "t-half" })}
  </div>`;
}

// ---------------- feedback ----------------
async function feedback(box) {
  const { data } = await sb.from("feedback").select("*").order("created_at", { ascending: false }).limit(200);
  const l = data || [], med = l.length ? (l.reduce((a, f) => a + f.nota, 0) / l.length) : 0;
  const dist = [5, 4, 3, 2, 1].map(n => ({ n, c: l.filter(f => f.nota === n).length }));
  const cats = {}; l.forEach(f => (f.categorias || []).forEach(c => { cats[c] = (cats[c] || 0) + 1; }));
  const catRows = Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([c, n]) => ({ c, n }));
  box.innerHTML = `<div class="dash">
    ${tile(0, "Satisfação", `<div class="fb-score">${l.length ? `<div class="big">${med.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}<small> de 5</small></div>` : `<div class="big none">Sem notas</div>`}
        <div class="stars" aria-hidden="true">${[1, 2, 3, 4, 5].map(k => `<i class="${med >= k - .25 ? "on" : med >= k - .75 ? "half" : ""}"></i>`).join("")}</div><p>${nf(l.length)} respostas</p></div>`)}
    ${tile(1, "Distribuição das notas", hbars(dist, r => `${r.n} estrela${r.n === 1 ? "" : "s"}`, "c", r => nf(r.c), "var(--c2)"))}
    ${tile(2, "Assuntos citados", hbars(catRows, r => r.c, "n", r => nf(r.n), "var(--c1)"), { sub: "Categorias marcadas pelos estudantes" })}
    ${tile(3, "Respostas recentes", `<div class="fb-list">${l.map((f, i) => `<article style="--i:${Math.min(i, 12)}"><header><span class="st" aria-label="${f.nota} de 5">${"★".repeat(f.nota)}<s>${"★".repeat(5 - f.nota)}</s></span><time>${quando(f.created_at)}</time></header>
        <div class="tg">${(f.categorias || []).map(c => `<span>${esc(c)}</span>`).join("") || "<span>geral</span>"}${f.pagina ? `<span class="pg">${esc(f.pagina)}</span>` : ""}</div>${f.texto ? `<p>${esc(f.texto)}</p>` : ""}</article>`).join("") || `<p class="muted adm-empty">Nenhum feedback ainda.</p>`}</div>`, { cls: "t-full" })}
  </div>`;
}

// ---------------- acesso (domínios) ----------------
async function acesso(box) {
  box.innerHTML = `<p class="muted" style="font-weight:700">Só e-mails com estes sufixos conseguem criar conta. A regra vale no banco, não só na tela.</p>
    <h2 class="sec">Adicionar domínio</h2>
    <div class="card pad"><div class="input"><input id="nd" placeholder="ex.: escola.pr.gov.br" aria-label="Novo domínio" /></div><button class="btn btn-lime btn-block" id="add" style="margin-top:.6rem">Adicionar domínio</button></div>
    <h2 class="sec">Domínios autorizados</h2><div id="dl"></div>`;
  async function load() {
    const { data } = await sb.from("allowed_email_domains").select("*").order("domain");
    box.querySelector("#dl").innerHTML = (data || []).map(d => `<div class="dom-row"><span>@${esc(d.domain)}</span><button class="btn btn-sm" data-id="${esc(d.id)}" aria-label="Remover @${esc(d.domain)}">${ic("x")}</button></div>`).join("") || `<div class="empty">Nenhum domínio cadastrado.</div>`;
    box.querySelectorAll("[data-id]").forEach(b => b.onclick = async () => { const { error } = await sb.from("allowed_email_domains").delete().eq("id", b.dataset.id); if (error) toast("Não deu para remover."); load(); });
  }
  box.querySelector("#add").onclick = async () => {
    const dom = box.querySelector("#nd").value.trim().toLowerCase().replace(/^@/, "");
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(dom)) return toast("Domínio inválido.");
    const { error } = await sb.from("allowed_email_domains").insert({ domain: dom });
    if (error) return toast("Não deu para adicionar.");
    box.querySelector("#nd").value = ""; load();
  };
  await load();
}
