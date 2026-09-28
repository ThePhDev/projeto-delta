// ============================================================
// PROJETO DELTA · núcleo: Supabase, estado, dados, navegação e casca
// ============================================================
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";
import { SUBJECTS, OBJETIVOS } from "./content.js";
import { VARIACOES } from "./bank.js";
import { avatarHTML, deltaSVG, logoSVG, COIN } from "./mascot.js";
import { ic } from "./icons.js";
import { h, esc, countUp } from "./ui.js";
import { sfx } from "./sfx.js";

export const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

export const state = {
  session: null, profile: null, stats: null,
  lessons: {}, topics: {}, items: new Set(), shop: [], ach: [], myAch: new Set(),
  xpHoje: 0, loaded: false
};

// ---------- índices do conteúdo ----------
export const LESSON = {};   // id -> {s, u, l, uIdx, lIdx, n}
export const TOPIC = {};    // topico -> {s, u, l}
SUBJECTS.forEach(s => s.unidades.forEach((u, uIdx) => u.licoes.forEach((l, lIdx) => {
  LESSON[l.id] = { s, u, l, uIdx, lIdx, n: uIdx * 3 + lIdx + 1 };
  TOPIC[l.topico] = { s, u, l };
})));
export const EIXO = Object.fromEntries(SUBJECTS.map(s => [s.id, s]));
export { OBJETIVOS };

// tópico da lição -> assunto do banco oficial
export const TOPICO_OFICIAL = {
  "mat-porcentagem": "Porcentagem e juros", "num-financeira": "Porcentagem e juros",
  "mat-proporcao": "Escalas, razão e proporção", "num-unidades": "Escalas, razão e proporção",
  "num-potencias": "Escalas, razão e proporção", "num-mmc": "Escalas, razão e proporção",
  "mat-funcao1": "Funções", "alg-quadratica": "Funções", "alg-exponencial": "Funções", "alg-log": "Funções",
  "alg-pa": "Progressões", "alg-pg": "Progressões",
  "mat-geometria": "Geometria", "geo-pitagoras": "Geometria", "geo-trigonometria": "Geometria",
  "geo-volumes": "Geometria", "geo-solidos": "Geometria", "geo-planificacao": "Geometria",
  "mat-estatistica": "Estatística", "est-graficos": "Estatística", "est-dispersao": "Estatística",
  "est-contagem": "Probabilidade", "est-combinatoria": "Probabilidade", "mat-probabilidade": "Probabilidade",
  "num-sucessivos": "Porcentagem e juros", "num-compostos": "Porcentagem e juros",
  "num-fracoes": "Escalas, razão e proporção", "num-escalas": "Escalas, razão e proporção", "num-velocidade": "Escalas, razão e proporção", "num-consumo": "Escalas, razão e proporção",
  "num-composta": "Escalas, razão e proporção", "num-tempo": "Escalas, razão e proporção", "num-arredonda": "Escalas, razão e proporção", "num-divisao": "Escalas, razão e proporção",
  "alg-graficos": "Funções", "alg-eq1": "Funções", "alg-sistemas": "Funções", "alg-eq2": "Funções", "alg-ineq": "Funções", "alg-lucro": "Funções", "alg-maxmin": "Funções",
  "alg-crescimento": "Funções", "alg-expressoes": "Funções", "alg-padroes": "Progressões",
  "geo-angulos": "Geometria", "geo-capacidade": "Geometria", "geo-circulo": "Geometria", "geo-compostas": "Geometria", "geo-semelhanca": "Geometria", "geo-transform": "Geometria",
  "geo-distancia": "Geometria", "geo-pontomedio": "Geometria", "geo-reta": "Geometria", "geo-mapa": "Geometria",
  "est-ponderada": "Estatística", "est-mediana": "Estatística", "est-graficopct": "Estatística", "est-frequencia": "Estatística", "est-pesquisa": "Estatística",
  "est-condicional": "Probabilidade", "est-complementar": "Probabilidade", "est-independentes": "Probabilidade", "est-permutacao": "Probabilidade", "est-esperado": "Probabilidade"
};
export const OFICIAL_EIXO = { "Porcentagem e juros": "num", "Escalas, razão e proporção": "num", "Funções": "alg",
  "Progressões": "alg", "Geometria": "geo", "Estatística": "est", "Probabilidade": "est" };
export const eixoDoTopico = t => TOPIC[t]?.s.id || OFICIAL_EIXO[t] || null;
export const VAR_BY_ID = Object.fromEntries(VARIACOES.map(v => [v.id, v]));

// ---------- utilidades ----------
export function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
export function addDays(d, n) { const x = new Date(d + "T12:00:00"); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); }
export function nivelDe(xp) {
  let nivel = 1, need = 100, acc = 0;
  while (xp >= acc + need) { acc += need; nivel++; need = Math.round(need * 1.35); }
  return { nivel, atual: xp - acc, necessario: need };
}
export const LIGAS = [
  { nome: "Liga Ponto", min: 0, c: ["#9aa3b5", "#5b6275"] },
  { nome: "Liga Reta", min: 100, c: ["#cd8a4a", "#8a4f1f"] },
  { nome: "Liga Plano", min: 300, c: ["#e2e8f0", "#94a3b8"] },
  { nome: "Liga Prisma", min: 600, c: ["#ffd84d", "#e0a800"] },
  { nome: "Liga Fractal", min: 1000, c: ["#00f0ff", "#2979ff"] },
  { nome: "Liga Delta", min: 1600, c: ["#ff00e5", "#8b5cf6"] }
];
export function ligaDe(xpSemana) { let l = LIGAS[0]; LIGAS.forEach(x => { if (xpSemana >= x.min) l = x; }); return l; }
export const av = () => state.profile?.avatar || { cor: "teal", fundo: "espaco" };
export const isAdmin = () => state.profile?.tipo_usuario === "admin";
export const primeiroNome = () => (state.profile?.nome || "").trim().split(/\s+/)[0] || "você";

// ---------- preferências ----------
export function initTheme() {
  let t = "dark"; try { t = localStorage.getItem("delta-theme") || "dark"; } catch (e) {}
  setTheme(t, false);
}
export function setTheme(t, save = true) {
  document.documentElement.setAttribute("data-theme", t);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t === "dark" ? "#0b0b0f" : "#f5f4fa";
  if (save) try { localStorage.setItem("delta-theme", t); } catch (e) {}
}

// ---------- tutorial: cada dica aparece uma única vez ----------
export const seen = k => !!(state.profile?.tutorial || {})[k];
export function markSeen(k) {
  if (!state.profile) return;
  state.profile.tutorial = { ...(state.profile.tutorial || {}), [k]: 1 };
  sb.from("profiles").update({ tutorial: state.profile.tutorial }).eq("id", state.session.user.id).then(({ error }) => error && console.error("tutorial", error));
}
export function resetTutorial() {
  state.profile.tutorial = {};
  return sb.from("profiles").update({ tutorial: {} }).eq("id", state.session.user.id);
}

// ============================================================
// DADOS
// ============================================================
export async function loadUserData() {
  const uid = state.session.user.id;
  const d0 = new Date(); d0.setHours(0, 0, 0, 0);
  const [prof, stats, lessons, topics, items, shop, ach, myAch, xpH] = await Promise.all([
    sb.from("profiles").select("*").eq("id", uid).maybeSingle(),
    sb.from("user_stats").select("*").eq("user_id", uid).maybeSingle(),
    sb.from("lesson_progress").select("*").eq("user_id", uid),
    sb.from("topic_stats").select("*").eq("user_id", uid),
    sb.from("user_items").select("item_id").eq("user_id", uid),
    sb.from("shop_items").select("*").order("ordem"),
    sb.from("achievements").select("*").order("ordem"),
    sb.from("user_achievements").select("code").eq("user_id", uid),
    sb.from("xp_events").select("amount").eq("user_id", uid).gte("created_at", d0.toISOString())
  ]);
  state.profile = prof.data || { id: uid, nome: "", avatar: { cor: "teal", fundo: "espaco" }, tutorial: {}, meta_diaria: 50, onboarding_ok: false };
  state.stats = stats.data || { xp: 0, deltas: 0, streak_atual: 0, melhor_streak: 0, congelamentos: 0, ultimo_estudo: null };
  state.lessons = {}; (lessons.data || []).forEach(r => state.lessons[r.lesson_id] = r);
  state.topics = {}; (topics.data || []).forEach(r => state.topics[r.topic_id] = r);
  state.items = new Set((items.data || []).map(r => r.item_id));
  state.shop = shop.data || [];
  state.ach = ach.data || [];
  state.myAch = new Set((myAch.data || []).map(r => r.code));
  state.xpHoje = (xpH.data || []).reduce((a, r) => a + r.amount, 0);
  state.loaded = true;
}

export async function refreshStats() {
  const { data } = await sb.from("user_stats").select("*").eq("user_id", state.session.user.id).maybeSingle();
  if (data) state.stats = data;
  updateTop();
  return state.stats;
}

// XP só é concedido pelo servidor (award_xp valida fonte, limite e teto diário)
export async function addXP(amount, source, ref = null) {
  amount = Math.round(amount);
  if (!amount || amount <= 0) return state.stats.xp;
  const { data, error } = await sb.rpc("award_xp", { p_amount: amount, p_source: source, p_ref: ref });
  if (error) { console.error("award_xp", error); return state.stats.xp; }
  if (typeof data === "number") { const ganho = data - state.stats.xp; if (ganho > 0) state.xpHoje += ganho; }
  await refreshStats();
  return state.stats.xp;
}

export async function touchStreak() {
  const { data, error } = await sb.rpc("touch_streak");
  if (error || !data) { console.error("touch_streak", error); return null; }
  state.stats.streak_atual = data.streak; state.stats.melhor_streak = data.melhor;
  state.stats.congelamentos = data.congelamentos; state.stats.ultimo_estudo = today();
  updateTop();
  return data;
}

export async function claimAchievements() {
  const { data, error } = await sb.rpc("claim_achievements");
  if (error || !data) return { novos: [], ganho: 0 };
  (data.novos || []).forEach(a => state.myAch.add(a.code));
  if (data.ganho) await refreshStats();
  return data;
}

export function logAttempt(a) {
  const uid = state.session?.user?.id; if (!uid) return;
  sb.from("question_attempts").insert({
    user_id: uid, origem: a.origem, question_ref: String(a.ref), materia: "Matemática", topico: a.topico || null,
    correta: !!a.correta, resposta: a.resposta || null, resposta_correta: a.correta_resp || null, tempo_seg: a.tempo ?? null
  }).then(({ error }) => error && console.error("attempt", error));
}

export async function logError(e) {
  const uid = state.session?.user?.id; if (!uid) return;
  try {
    const { data: prev } = await sb.from("error_notebook").select("id,tentativas").eq("user_id", uid).eq("question_ref", String(e.ref)).maybeSingle();
    const row = { user_id: uid, origem: e.origem, question_ref: String(e.ref), enunciado: String(e.enunciado || "").slice(0, 4000),
      resposta_aluno: e.resposta_aluno || null, resposta_correta: e.resposta_correta || null, explicacao: e.explicacao || null,
      materia: "Matemática", topico: e.topico || null, tentativas: (prev?.tentativas || 0) + 1, dominado: false, updated_at: new Date().toISOString() };
    if (prev) await sb.from("error_notebook").update(row).eq("id", prev.id);
    else await sb.from("error_notebook").insert(row);
  } catch (err) { console.error("logError", err); }
}

// revisão espaçada por tópico: 1, 3, 7, 14, 30 dias
export async function updateTopic(topico, acertos, total) {
  if (!topico || !total) return;
  const pct = acertos / total * 100;
  const p = state.topics[topico] || { acertos: 0, erros: 0, intervalo_dias: 1 };
  const escala = [1, 3, 7, 14, 30];
  let intervalo = p.intervalo_dias || 1;
  intervalo = pct >= 80 ? (escala.find(x => x > intervalo) || 30) : 1;
  const row = { user_id: state.session.user.id, topic_id: topico, acertos: (p.acertos || 0) + acertos, erros: (p.erros || 0) + (total - acertos),
    intervalo_dias: intervalo, proxima_revisao: addDays(today(), intervalo), atualizado_em: new Date().toISOString() };
  state.topics[topico] = row;
  const { error } = await sb.from("topic_stats").upsert(row);
  if (error) console.error("topic", error);
}

export async function saveLesson(lessonId, topico, acertos, total) {
  const pct = Math.round(acertos / total * 100);
  const estrelas = pct >= 100 ? 3 : pct >= 80 ? 2 : pct >= 50 ? 1 : 0;
  const prev = state.lessons[lessonId];
  const row = { user_id: state.session.user.id, lesson_id: lessonId, estrelas: Math.max(prev?.estrelas || 0, estrelas),
    melhor_pontuacao: Math.max(prev?.melhor_pontuacao || 0, pct), tentativas: (prev?.tentativas || 0) + 1, concluida_em: new Date().toISOString() };
  state.lessons[lessonId] = row;
  const { error } = await sb.from("lesson_progress").upsert(row);
  if (error) console.error("lesson", error);
  await updateTopic(topico, acertos, total);
  return { pct, estrelas };
}

export function revisoesHoje() {
  const t = today();
  return Object.values(state.topics).filter(r => r.proxima_revisao && r.proxima_revisao <= t && TOPIC[r.topic_id]);
}

// ============================================================
// NAVEGAÇÃO
// ============================================================
export function navigate(path) { if (location.hash === "#" + path) window.dispatchEvent(new HashChangeEvent("hashchange")); else location.hash = path; }
export const root = () => document.getElementById("root");

// ============================================================
// CASCA DO APP
// ============================================================
const TABS = [
  ["inicio", "Trilha", "home"], ["praticar", "Praticar", "target"], ["loja", "Loja", "bag"],
  ["ranking", "Ranking", "trophy"], ["perfil", "Perfil", "user"]
];
const SIDE_EXTRA = [["cronograma", "Cronograma", "calendar"], ["missoes", "Missões", "flag"], ["erros", "Caderno de erros", "book"], ["painel", "Painel", "chart"]];

function topHTML() {
  const s = state.stats, n = nivelDe(s.xp || 0);
  return `<header class="top"><div class="top-row">
      <a class="me" href="#/perfil" aria-label="Seu perfil">${avatarHTML(av(), { anim: false })}</a>
      <div class="stats">
        <span class="chip fire" title="Sequência de dias">${ic("fire")}<b data-k="streak">${s.streak_atual || 0}</b></span>
        <a class="chip coins" href="#/loja" title="Deltas">${COIN}<b data-k="deltas">${(s.deltas || 0).toLocaleString("pt-BR")}</b></a>
        <span class="chip lvl" title="Seu nível">NV <b data-k="nivel">${n.nivel}</b></span>
      </div></div>
    <div class="xpbar" role="progressbar" aria-label="XP do nível" aria-valuenow="${n.atual}" aria-valuemax="${n.necessario}"><i style="width:${Math.round(n.atual / n.necessario * 100)}%"></i><span data-k="xpt">${n.atual} / ${n.necessario} XP</span></div>
  </header>`;
}

export function updateTop() {
  const t = document.querySelector(".top"); if (!t || !state.stats) return;
  const s = state.stats, n = nivelDe(s.xp || 0);
  const q = k => t.querySelector(`[data-k="${k}"]`);
  countUp(q("deltas"), s.deltas || 0);
  q("streak").textContent = s.streak_atual || 0;
  q("nivel").textContent = n.nivel;
  q("xpt").textContent = `${n.atual} / ${n.necessario} XP`;
  t.querySelector(".xpbar i").style.width = Math.round(n.atual / n.necessario * 100) + "%";
  const me = t.querySelector(".me"); if (me) me.innerHTML = avatarHTML(av(), { anim: false });
  const ring = document.querySelector("[data-goal]"); if (ring) ring.outerHTML = goalCard();
}

export function goalRing(v, max, size = 62) {
  const r = 26, C = 2 * Math.PI * r, p = Math.min(1, v / max);
  return `<svg class="goal-ring" viewBox="0 0 62 62" style="width:${size}px;height:${size}px" aria-hidden="true"><circle class="bg" cx="31" cy="31" r="${r}"/><circle class="fg" cx="31" cy="31" r="${r}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - p)).toFixed(1)}"/></svg>`;
}
export function goalCard() {
  const meta = state.profile?.meta_diaria || 50, v = state.xpHoje || 0;
  return `<div class="goal-line" data-goal>${goalRing(v, meta)}<div><b>${v >= meta ? "Meta do dia batida" : "Meta do dia"}</b><small>${Math.min(v, meta)} de ${meta} XP hoje</small></div></div>`;
}

function railHTML() {
  const s = state.stats, rev = revisoesHoje().length;
  return `<aside class="rail">
    ${goalCard()}
    <div class="card"><h3>Sequência</h3><div class="talk"><div class="dm dm-live" style="width:64px">${deltaSVG({ ...av(), expr: s.streak_atual ? "feliz" : "idle" })}</div>
      <p class="muted" style="font-weight:700">${s.streak_atual ? `<b style="color:var(--orange)">${s.streak_atual} ${s.streak_atual === 1 ? "dia" : "dias"}</b> seguidos. Estude hoje para manter.` : "Faça uma lição hoje e acenda sua sequência."}${s.congelamentos ? `<br>${ic("ice")} ${s.congelamentos} congelamento${s.congelamentos > 1 ? "s" : ""} guardado${s.congelamentos > 1 ? "s" : ""}.` : ""}</p></div></div>
    <div class="card"><h3>Revisão</h3><p class="muted" style="font-weight:700;margin-bottom:.7rem">${rev ? `${rev} assunto${rev > 1 ? "s" : ""} no ponto certo de revisar.` : "Nada vencido hoje. Seu cérebro agradece."}</p>
      <a class="btn btn-sm btn-block ${rev ? "btn-teal" : ""}" href="#/praticar">${ic("cycle")} Praticar</a></div>
    <div class="card" id="railMis"><h3>Missões do dia</h3><div class="spin" style="margin:.6rem auto"></div></div>
  </aside>`;
}

function fillRail(v) {
  const box = v.querySelector("#railMis"); if (!box) return;
  sb.rpc("mission_progress").then(({ data }) => {
    const list = (data || []).filter(m => m.periodo === "diaria").slice(0, 3);
    box.innerHTML = `<h3>Missões do dia</h3>` + (list.length ? list.map(m => `<div class="mission"><span class="i">${ic(m.resgatada ? "check" : "flag")}</span><div class="b"><b>${esc(m.titulo)}</b>
      <div class="t"><i style="width:${Math.min(100, Math.round(m.progresso / m.alvo * 100))}%"></i></div></div></div>`).join("") + `<a class="link" href="#/missoes" style="display:block;margin-top:.6rem">Ver todas</a>`
      : `<p class="muted">Sem missões agora.</p>`);
  });
}

export function shell(tab, inner, { rail = true } = {}) {
  const side = TABS.map(([r, n, i]) => `<a href="#/${r}" class="${tab === r ? "on" : ""}">${ic(i)}${n}</a>`).join("")
    + `<div class="sep"></div>` + SIDE_EXTRA.map(([r, n, i]) => `<a href="#/${r}" class="${tab === r ? "on" : ""}">${ic(i)}${n}</a>`).join("")
    + (isAdmin() ? `<a href="#/admin" class="${tab === "admin" ? "on" : ""}">${ic("admin")}Administração</a>` : "");
  const v = h(`<div class="shell">
    <nav class="side" aria-label="Navegação principal"><a class="brand" href="#/inicio" aria-label="Início">${logoSVG({ word: true })}</a>${side}</nav>
    <div class="center">${topHTML()}<main class="main" id="view">${inner}</main></div>
    ${rail ? railHTML() : "<aside class=\"rail\"></aside>"}
    <nav class="tabs" aria-label="Navegação">${TABS.map(([r, n, i]) => `<a href="#/${r}" data-tab="${r}" class="${tab === r ? "on" : ""}" ${tab === r ? 'aria-current="page"' : ""}>${ic(i)}<span>${n}</span></a>`).join("")}</nav>
  </div>`);
  v.querySelectorAll(".tabs a, .side a").forEach(a => a.addEventListener("click", () => sfx.tap()));
  root().replaceChildren(v);
  if (rail) fillRail(v);
  return v;
}

export function page(title, sub) { return `<div class="ph"><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div>`; }
