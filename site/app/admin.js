// ============================================================
// PROJETO DELTA · painel administrativo
// Todas as leituras e ações passam por RPCs que exigem is_admin() no banco.
// ============================================================
import { sb, state, navigate, shell, page, isAdmin, LESSON } from "./core.js";
import { ic } from "./icons.js";
import { esc, toast, modal, sheet, countUp } from "./ui.js";
import { sfx } from "./sfx.js";

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

function bars(rows, key, { fmt = nf, cor = "var(--teal)", label = r => dia(r.dia), h2 = null } = {}) {
  const max = Math.max(1, ...rows.map(r => r[key] || 0));
  const step = Math.ceil(rows.length / 8);
  return `<div class="adm-bars" role="img" aria-label="Gráfico de barras por dia">${rows.map((r, i) => {
    const v = r[key] || 0, tip = `${label(r)}: ${fmt(v)}`;
    return `<div class="c" title="${esc(tip)}"><i style="height:${Math.max(v ? 4 : 1, Math.round(v / max * 100))}%;background:${cor}"></i><span>${i % step === 0 || i === rows.length - 1 ? esc(label(r)) : ""}</span></div>`;
  }).join("")}</div>`;
}
const hbars = (rows, nome, val, txt, cor = "var(--teal)") => {
  const max = Math.max(1, ...rows.map(r => r[val] || 0));
  return rows.length ? rows.map(r => `<div class="adm-hb"><span class="n">${esc(nome(r))}</span><span class="t"><i style="width:${Math.round((r[val] || 0) / max * 100)}%;background:${cor}"></i></span><span class="p">${txt(r)}</span></div>`).join("")
    : `<p class="muted" style="font-weight:700">Sem dados ainda.</p>`;
};

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
async function geral(box) {
  let days = 30;
  async function draw() {
    const o = await overview(days), t = o.totais, s = o.serie;
    const soma = k => s.reduce((a, r) => a + (r[k] || 0), 0);
    box.innerHTML = `
      <div class="adm-head"><span class="muted">Atualizado ${quando(o.gerado_em)}</span>
        <div class="segs adm-seg" style="margin:0">${[7, 30, 90].map(n => `<button data-d="${n}" class="${n === days ? "on" : ""}">${n} dias</button>`).join("")}</div>
        <button class="btn btn-sm" id="rf">${ic("cycle")} Atualizar</button></div>
      <div class="adm-kpis">
        ${kpi("Usuários", t.usuarios, `${nf(t.alunos)} alunos · ${nf(t.professores)} prof. · ${nf(t.admins)} admin`)}
        ${kpi("Ativos hoje", t.ativos_hoje, `${nf(t.ativos_7d)} em 7 dias · ${nf(t.ativos_30d)} em 30`, "var(--green)")}
        ${kpi("Novos (7 dias)", t.novos_7d, `${pct(t.onboarding_ok, t.usuarios)}% concluíram o onboarding`, "var(--gold)")}
        ${kpi("Questões respondidas", t.tentativas, `${pct(t.acertos, t.tentativas)}% de acerto geral`)}
        ${kpi("Lições concluídas", t.licoes_concluidas, `${nf(t.simulados)} simulados feitos`, "#c4b5fd")}
        ${kpi("XP total", t.xp_total, `${nf(t.deltas_total)} Deltas em circulação`, "var(--gold)")}
        ${kpi("Sequência média", Number(t.sequencia_media).toLocaleString("pt-BR", { minimumFractionDigits: 1 }), `${nf(t.conquistas)} conquistas · ${nf(t.itens_comprados)} itens comprados`, "var(--magenta, #ff00e5)")}
        ${kpi("Cadernos de erro abertos", t.erros_abertos, `${nf(t.com_cronograma)} usuários com cronograma`, "var(--red)")}
      </div>
      <h2 class="sec">Estudantes ativos por dia <small class="muted">· ${nf(soma("ativos"))} acessos-dia</small></h2>
      <div class="card pad">${bars(s, "ativos", { cor: "var(--green)" })}</div>
      <div class="adm-2">
        <div><h2 class="sec">Novos cadastros <small class="muted">· ${nf(soma("cadastros"))}</small></h2><div class="card pad">${bars(s, "cadastros", { cor: "var(--gold)" })}</div></div>
        <div><h2 class="sec">Questões por dia <small class="muted">· ${nf(soma("tentativas"))}</small></h2><div class="card pad">${bars(s, "tentativas", { cor: "var(--teal)" })}</div></div>
      </div>
      <h2 class="sec">XP ganho por dia <small class="muted">· ${nf(soma("xp"))}</small></h2>
      <div class="card pad">${bars(s, "xp", { cor: "#c4b5fd" })}</div>
      <div class="adm-2">
        <div><h2 class="sec">Onde está o esforço</h2><div class="card pad">${hbars(o.xp_fontes, r => FONTE[r.source] || r.source, "xp", r => `${nf(r.xp)} XP`, "var(--gold)")}</div></div>
        <div><h2 class="sec">Acerto por origem</h2><div class="card pad">${hbars(o.origens, r => ORIGEM[r.origem] || r.origem, "total", r => `${r.acerto}% · ${nf(r.total)}`)}</div></div>
      </div>
      <div class="adm-2">
        <div><h2 class="sec">Horário de estudo <small class="muted">· últimos 30 dias</small></h2><div class="card pad">${horas(o.horas)}</div></div>
        <div><h2 class="sec">Engajamento</h2><div class="card pad">
          ${hbars([
            { n: "Nunca estudaram", v: o.engajamento.nunca_estudaram, c: "var(--red)" },
            { n: "Sem sequência agora", v: o.engajamento.sem_streak, c: "var(--gold)" },
            { n: "Sequência de 3+ dias", v: o.engajamento.streak_3_mais, c: "var(--green)" },
            { n: "Sequência de 7+ dias", v: o.engajamento.streak_7_mais, c: "var(--teal)" }
          ], r => r.n, "v", r => nf(r.v), "var(--teal)")}</div></div>
      </div>
      <h2 class="sec">Escolas</h2><div class="card pad">${hbars(o.escolas, r => r.escola, "n", r => nf(r.n), "var(--gold)")}</div>
      <p class="muted" style="margin-top:1rem;font-weight:700">Feedback: ${nf(o.feedback.total)} respostas · nota média ${String(o.feedback.media).replace(".", ",")} de 5${t.suspensos ? ` · ${nf(t.suspensos)} conta(s) suspensa(s)` : ""}</p>`;
    box.querySelectorAll("[data-c]").forEach(el => countUp(el, +el.dataset.c));
    box.querySelectorAll("[data-d]").forEach(b => b.onclick = async () => { days = +b.dataset.d; sfx.tap(); await draw(); });
    box.querySelector("#rf").onclick = async () => { sfx.tap(); await draw(); toast("Dados atualizados."); };
  }
  await draw();
}
function horas(rows) {
  const m = Object.fromEntries(rows.map(r => [r.h, r.n])), max = Math.max(1, ...rows.map(r => r.n));
  return `<div class="adm-bars adm-h" role="img" aria-label="Questões por hora do dia">${Array.from({ length: 24 }, (_, h) => `<div class="c" title="${h}h: ${nf(m[h] || 0)} questões"><i style="height:${Math.max(m[h] ? 4 : 1, Math.round((m[h] || 0) / max * 100))}%;background:var(--teal)"></i><span>${h % 3 === 0 ? h + "h" : ""}</span></div>`).join("")}</div>`;
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
    <h3 class="adm-h3">Últimos 14 dias</h3><div class="card pad">${bars(d.serie, "tentativas", { cor: "var(--teal)" })}</div>
    <h3 class="adm-h3">Por tópico</h3><div class="card pad">${hbars(d.topicos, r => r.topico, "total", r => `${pct(r.acertos, r.total)}% · ${r.total}`)}</div>
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
  box.innerHTML = `
    <div class="adm-2">
      <div><h2 class="sec">Tópicos mais praticados</h2><div class="card pad">${hbars(o.topicos, r => r.topico, "total", r => `${r.acerto}% · ${nf(r.total)}`)}<p class="muted" style="font-weight:700;margin-top:.7rem">A porcentagem é o acerto geral no tópico. Tópicos com acerto baixo pedem reforço em sala.</p></div></div>
      <div><h2 class="sec">Tópicos com menor acerto <small class="muted">· 10+ respostas</small></h2><div class="card pad">${hbars(o.topicos.filter(t => t.total >= 10).sort((a, b) => a.acerto - b.acerto).slice(0, 10), r => r.topico, "total", r => `${r.acerto}% · ${nf(r.total)}`, "var(--red)")}</div></div>
    </div>
    <div class="adm-2">
      <div><h2 class="sec">Lições mais concluídas</h2><div class="card pad">${hbars(o.lic_top, r => lic(r.lesson_id), "n", r => `${nf(r.n)} · ${String(r.estrelas).replace(".", ",")}★`, "#c4b5fd")}</div></div>
      <div><h2 class="sec">Itens mais comprados na loja</h2><div class="card pad">${hbars(o.loja_top, r => r.nome || r.item_id, "n", r => nf(r.n), "var(--gold)")}</div></div>
    </div>`;
}

// ---------------- feedback ----------------
async function feedback(box) {
  const { data } = await sb.from("feedback").select("*").order("created_at", { ascending: false }).limit(200);
  const l = data || [], med = l.length ? (l.reduce((a, f) => a + f.nota, 0) / l.length) : 0;
  const dist = [5, 4, 3, 2, 1].map(n => ({ n, c: l.filter(f => f.nota === n).length }));
  box.innerHTML = `<div class="adm-2">
      <div class="card pad"><div class="adm-kpi" style="border:0;padding:0"><div class="l">Nota média</div><div class="v" style="color:var(--gold)">${l.length ? med.toFixed(1).replace(".", ",") : "—"}<small class="muted"> de 5</small></div><div class="s">${nf(l.length)} respostas</div></div></div>
      <div class="card pad">${hbars(dist, r => "★".repeat(r.n), "c", r => nf(r.c), "var(--gold)")}</div></div>
    <h2 class="sec">Respostas recentes</h2>
    ${l.map(f => `<div class="hist" style="flex-wrap:wrap"><b>${"★".repeat(f.nota)}${"☆".repeat(5 - f.nota)}</b><span class="muted">${quando(f.created_at)} · ${esc((f.categorias || []).join(", ") || "geral")}${f.pagina ? " · " + esc(f.pagina) : ""}</span>${f.texto ? `<p style="flex-basis:100%;font-weight:700;margin:0">${esc(f.texto)}</p>` : ""}</div>`).join("") || `<div class="empty">Nenhum feedback ainda.</div>`}`;
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
