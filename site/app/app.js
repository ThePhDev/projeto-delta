// ============================================================
// PROJETO DELTA · APP — SPA gamificada (Supabase Auth + gamificação)
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";
import { SUBJECTS } from "./content.js";

const sb = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

// ---------- estado global ----------
const state = {
  session: null,
  profile: null,
  stats: null,
  lessons: {},   // lesson_id -> {estrelas, melhor_pontuacao}
  topics: {},    // topic_id  -> {acertos, erros, intervalo_dias, proxima_revisao}
  domains: [],
};

const XP_POR_ACERTO = 10;
const XP_BONUS_LICAO = 20;
const LESSON_INDEX = {};   // lesson_id -> {subject, unidade, licao, uIdx, lIdx}
const TOPIC_LESSON = {};   // topic_id -> lesson meta
SUBJECTS.forEach(s => s.unidades.forEach((u, uIdx) => u.licoes.forEach((l, lIdx) => {
  LESSON_INDEX[l.id] = { subject: s, unidade: u, licao: l, uIdx, lIdx };
  TOPIC_LESSON[l.topico] = { subject: s, unidade: u, licao: l };
})));

// ---------- helpers ----------
const $ = sel => document.querySelector(sel);
const root = () => document.getElementById("root");
function h(html){ const t=document.createElement("template"); t.innerHTML=html.trim(); return t.content.firstElementChild; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }
function today(){ return new Date().toISOString().slice(0,10); }
function addDays(d, n){ const x=new Date(d+"T00:00:00"); x.setDate(x.getDate()+n); return x.toISOString().slice(0,10); }

let toastTimer;
function toast(msg){
  const el = document.getElementById("toast");
  el.textContent = msg; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>el.classList.remove("show"), 2600);
}

// tema
function initTheme(){
  const saved = localStorage.getItem("delta-theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("delta-theme", next);
  document.querySelector('meta[name="theme-color"]').setAttribute("content", next==="dark"?"#07080d":"#eef0f6");
}

// nível a partir do XP (curva suave)
function nivelDe(xp){
  let nivel = 1, need = 100, acc = 0;
  while (xp >= acc + need){ acc += need; nivel++; need = Math.round(need * 1.35); }
  return { nivel, atual: xp - acc, necessario: need, base: acc };
}

const SUBJ_COLOR = hue => `hsl(${hue} 85% 62%)`;
const SUBJ_GRAD = hue => `linear-gradient(135deg,hsl(${hue} 90% 64%),hsl(${(hue+40)%360} 85% 58%))`;

// ============================================================
// CAMADA DE DADOS
// ============================================================
async function loadUserData(){
  const uid = state.session.user.id;
  const [prof, stats, lessons, topics] = await Promise.all([
    sb.from("profiles").select("*").eq("id", uid).maybeSingle(),
    sb.from("user_stats").select("*").eq("user_id", uid).maybeSingle(),
    sb.from("lesson_progress").select("*").eq("user_id", uid),
    sb.from("topic_stats").select("*").eq("user_id", uid),
  ]);
  state.profile = prof.data;
  state.stats = stats.data || { xp:0, streak_atual:0, melhor_streak:0, ultimo_estudo:null };
  state.lessons = {};
  (lessons.data||[]).forEach(r => state.lessons[r.lesson_id] = r);
  state.topics = {};
  (topics.data||[]).forEach(r => state.topics[r.topic_id] = r);
}

async function loadDomains(){
  const { data } = await sb.from("allowed_email_domains").select("*").order("domain");
  state.domains = data || [];
}

// atualiza streak diária
async function bumpStreak(){
  const uid = state.session.user.id;
  const t = today();
  const last = state.stats.ultimo_estudo;
  if (last === t) return;
  let streak = 1;
  if (last === addDays(t, -1)) streak = (state.stats.streak_atual||0) + 1;
  const melhor = Math.max(state.stats.melhor_streak||0, streak);
  state.stats.streak_atual = streak;
  state.stats.melhor_streak = melhor;
  state.stats.ultimo_estudo = t;
  await sb.from("user_stats").update({ streak_atual:streak, melhor_streak:melhor, ultimo_estudo:t, updated_at:new Date().toISOString() }).eq("user_id", uid);
}

// XP é concedido pelo backend (award_xp valida fonte, limites e teto diário)
async function addXP(amount, source="acerto", ref=null){
  if (!amount || amount<=0) return;
  try{
    const { data, error } = await sb.rpc("award_xp", { p_amount: amount, p_source: source, p_ref: ref });
    if (error){ console.error("award_xp", error); return; }
    if (typeof data === "number") state.stats.xp = data;
  }catch(e){ console.error(e); }
}

// registra tentativa de questão (desempenho + missões)
function logAttempt(a){
  const uid = state.session?.user?.id; if (!uid) return;
  sb.from("question_attempts").insert({
    user_id: uid, origem: a.origem, question_ref: String(a.ref),
    materia: a.materia||null, topico: a.topico||null, correta: !!a.correta,
    resposta: a.resposta||null, resposta_correta: a.correta_resp||null,
    tempo_seg: a.tempo??null
  }).then(({error})=>{ if(error) console.error("attempt", error); });
}

// caderno de erros
async function logError(e){
  const uid = state.session?.user?.id; if (!uid) return;
  try{
    const { data: prev } = await sb.from("error_notebook").select("id,tentativas")
      .eq("user_id", uid).eq("question_ref", String(e.ref)).maybeSingle();
    const row = {
      user_id: uid, origem: e.origem, question_ref: String(e.ref),
      enunciado: e.enunciado, resposta_aluno: e.resposta_aluno||null,
      resposta_correta: e.resposta_correta||null, explicacao: e.explicacao||null,
      materia: e.materia||null, topico: e.topico||null,
      tentativas: (prev?.tentativas||0)+1, dominado: false,
      updated_at: new Date().toISOString()
    };
    if (prev) await sb.from("error_notebook").update(row).eq("id", prev.id);
    else await sb.from("error_notebook").insert(row);
  }catch(err){ console.error("logError", err); }
}

// grava progresso da lição + revisão espaçada por tópico
async function saveLesson(lessonId, topico, acertos, total){
  const uid = state.session.user.id;
  const pct = Math.round((acertos/total)*100);
  const estrelas = pct>=100?3 : pct>=80?2 : pct>=50?1 : 0;
  const prev = state.lessons[lessonId];
  const melhor = Math.max(prev?.melhor_pontuacao||0, pct);
  const estrFinal = Math.max(prev?.estrelas||0, estrelas);
  const row = { user_id:uid, lesson_id:lessonId, estrelas:estrFinal, melhor_pontuacao:melhor,
    tentativas:(prev?.tentativas||0)+1, concluida_em:new Date().toISOString() };
  await sb.from("lesson_progress").upsert(row);
  state.lessons[lessonId] = row;

  // revisão espaçada (SM-2 simplificado): intervalos 1,3,7,14...
  const erros = total - acertos;
  const tprev = state.topics[topico] || { acertos:0, erros:0, intervalo_dias:1 };
  let intervalo = tprev.intervalo_dias || 1;
  const escala = [1,3,7,14,30];
  if (pct >= 80){
    const i = escala.indexOf(intervalo);
    intervalo = i>=0 && i<escala.length-1 ? escala[i+1] : (intervalo<30?escala.find(x=>x>intervalo)||30:30);
  } else {
    intervalo = 1; // errou muito → revisar amanhã
  }
  const trow = { user_id:uid, topic_id:topico,
    acertos:(tprev.acertos||0)+acertos, erros:(tprev.erros||0)+erros,
    intervalo_dias:intervalo, proxima_revisao:addDays(today(), intervalo),
    atualizado_em:new Date().toISOString() };
  await sb.from("topic_stats").upsert(trow);
  state.topics[topico] = trow;

  return { pct, estrelas: estrFinal };
}

// recomendações inteligentes: tópicos fracos + revisões vencidas
function recommendations(){
  const recs = [];
  const t = today();
  // revisões vencidas
  Object.values(state.topics).forEach(ts => {
    if (ts.proxima_revisao && ts.proxima_revisao <= t){
      const meta = TOPIC_LESSON[ts.topic_id];
      if (meta) recs.push({ tipo:"revisao", meta, peso: 3 });
    }
  });
  // tópicos fracos (taxa de acerto < 70%)
  Object.values(state.topics).forEach(ts => {
    const tot = (ts.acertos||0)+(ts.erros||0);
    if (tot>=3 && ts.acertos/tot < 0.7){
      const meta = TOPIC_LESSON[ts.topic_id];
      if (meta && !recs.find(r=>r.meta.licao.id===meta.licao.id)) recs.push({ tipo:"reforco", meta, peso: 2 });
    }
  });
  // se nada, sugerir próxima lição não concluída
  if (recs.length === 0){
    outer:
    for (const s of SUBJECTS) for (const u of s.unidades) for (const l of u.licoes){
      if (!state.lessons[l.id] || (state.lessons[l.id].estrelas||0)===0){
        recs.push({ tipo:"novo", meta:{ subject:s, unidade:u, licao:l }, peso:1 });
        break outer;
      }
    }
  }
  recs.sort((a,b)=>b.peso-a.peso);
  return recs.slice(0,3);
}

// ============================================================
// ROTEADOR (hash routing)
// ============================================================
const PUBLIC_ROUTES = ["/login","/cadastro","/confirmar","/esqueci","/redefinir"];

function currentRoute(){
  const hash = location.hash.replace(/^#/, "") || "/";
  const parts = hash.split("/").filter(Boolean);
  return { path: "/" + (parts[0]||""), parts };
}

function navigate(path){ location.hash = path; }

async function router(){
  const { path, parts } = currentRoute();
  const isPublic = PUBLIC_ROUTES.includes(path) || path === "/redefinir";

  // proteção de rotas
  if (!state.session && !isPublic){ navigate("/login"); return; }
  if (state.session && (path==="/login" || path==="/cadastro" || path==="/")){ navigate("/inicio"); return; }
  if (!state.session && path==="/"){ navigate("/login"); return; }

  switch(path){
    case "/login": return viewLogin();
    case "/cadastro": return viewCadastro();
    case "/confirmar": return viewConfirmar();
    case "/esqueci": return viewEsqueci();
    case "/redefinir": return viewRedefinir();
    case "/inicio": return viewInicio();
    case "/materias": return viewMaterias();
    case "/loja": return viewLoja();
    case "/revisao": return viewRevisao();
    case "/missoes": return viewMissoes();
    case "/ranking": return viewRanking();
    case "/simulados": return viewSimulados();
    case "/desempenho": return viewDesempenho();
    case "/trilha": return viewTrilha(parts[1]);
    case "/licao": return viewLicao(parts[1]);
    case "/tecnicas": return viewTecnicas();
    case "/perfil": return viewPerfil();
    case "/admin": return viewAdmin();
    case "/enem": return viewEnem();
    default: return state.session ? viewInicio() : viewLogin();
  }
}

// ============================================================
// VIEWS — AUTH
// ============================================================
const DELTA_LOGO = `<span class="auth-logo"><img class="tri-img" src="../brand/delta-mark@2x.png" alt="Projeto Delta" /><span class="nm serif">Projeto Delta</span></span>`;

function authShell(inner){
  root().innerHTML = "";
  const wrap = h(`<div class="auth-wrap"><div class="auth-card glass">${inner}</div></div>`);
  root().appendChild(wrap);
  const tt = h(`<button class="icon-btn" style="position:fixed;top:16px;right:16px;z-index:60" title="Alternar tema">◐</button>`);
  tt.onclick = toggleTheme; root().appendChild(tt);
  return wrap;
}
function showMsg(el, kind, text){
  const m = el.querySelector(".auth-msg");
  m.className = "auth-msg show " + kind; m.textContent = text;
}

function viewLogin(){
  const w = authShell(`
    ${DELTA_LOGO}
    <h1 class="serif">Bem-vindo de volta</h1>
    <p class="lead">Entre para continuar sua travessia rumo ao ENEM.</p>
    <div class="auth-msg"></div>
    <div class="field"><label>E-mail escolar</label><input type="email" id="email" autocomplete="email" placeholder="voce@escola.edu.br" /></div>
    <div class="field"><label>Senha</label><input type="password" id="senha" autocomplete="current-password" placeholder="••••••••" /></div>
    <button class="btn btn-primary" id="go">Entrar</button>
    <button class="auth-link" id="esqueci">Esqueci minha senha</button>
    <p class="auth-alt">Ainda não tem conta? <a href="#/cadastro">Criar conta</a></p>
  `);
  const go = w.querySelector("#go");
  const submit = async () => {
    const email = w.querySelector("#email").value.trim();
    const senha = w.querySelector("#senha").value;
    if (!email || !senha){ showMsg(w,"err","Preencha e-mail e senha."); return; }
    go.disabled = true; go.textContent = "Entrando…";
    const { error } = await sb.auth.signInWithPassword({ email, password: senha });
    go.disabled = false; go.textContent = "Entrar";
    if (error){
      if (/not confirmed/i.test(error.message)){
        showMsg(w,"err","Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.");
      } else {
        showMsg(w,"err","E-mail ou senha inválidos.");
      }
      return;
    }
    // onAuthStateChange cuidará do redirecionamento
  };
  go.onclick = submit;
  w.querySelector("#senha").addEventListener("keydown", e=>{ if(e.key==="Enter") submit(); });
  w.querySelector("#esqueci").onclick = ()=>navigate("/esqueci");
}

function viewCadastro(){
  const w = authShell(`
    ${DELTA_LOGO}
    <h1 class="serif">Criar conta</h1>
    <p class="lead">Exclusivo para estudantes com e-mail escolar.</p>
    <div class="auth-msg"></div>
    <div class="field"><label>Nome completo</label><input type="text" id="nome" autocomplete="name" placeholder="Seu nome" /></div>
    <div class="field"><label>Escola</label><input type="text" id="escola" placeholder="Ex.: CEMEP" /></div>
    <div class="field"><label>E-mail escolar</label><input type="email" id="email" autocomplete="email" placeholder="voce@escola.edu.br" />
      <div class="hint">Aceitamos apenas domínios escolares (.edu, .edu.br, .escola.br, .aluno.br).</div></div>
    <div class="field"><label>Senha</label><input type="password" id="senha" autocomplete="new-password" placeholder="Mínimo 6 caracteres" /></div>
    <button class="btn btn-primary" id="go">Criar conta</button>
    <p class="auth-alt">Já tem conta? <a href="#/login">Entrar</a></p>
  `);
  const go = w.querySelector("#go");
  go.onclick = async () => {
    const nome = w.querySelector("#nome").value.trim();
    const escola = w.querySelector("#escola").value.trim();
    const email = w.querySelector("#email").value.trim();
    const senha = w.querySelector("#senha").value;
    if (!nome || !email || !senha){ showMsg(w,"err","Preencha nome, e-mail e senha."); return; }
    if (senha.length < 6){ showMsg(w,"err","A senha deve ter ao menos 6 caracteres."); return; }
    go.disabled = true; go.textContent = "Criando…";
    const { data, error } = await sb.auth.signUp({
      email, password: senha,
      options: { data: { nome, escola }, emailRedirectTo: location.origin + location.pathname + "#/confirmar" }
    });
    go.disabled = false; go.textContent = "Criar conta";
    if (error){
      if (/school|escolar|403|not allowed|invalid/i.test(error.message + (error.status||""))){
        showMsg(w,"err","Cadastro permitido apenas com e-mail escolar válido (.edu, .edu.br, .escola.br, .aluno.br).");
      } else {
        showMsg(w,"err", error.message || "Não foi possível criar a conta.");
      }
      return;
    }
    sessionStorage.setItem("delta-signup-email", email);
    navigate("/confirmar");
  };
}

function viewConfirmar(){
  const email = sessionStorage.getItem("delta-signup-email") || "";
  const w = authShell(`
    ${DELTA_LOGO}
    <span class="email-icon">📬</span>
    <h1 class="serif">Confirme seu e-mail</h1>
    <p class="lead">Enviamos um link de confirmação${email?` para <b>${esc(email)}</b>`:""}. Abra o e-mail e clique no link para ativar sua conta.</p>
    <div class="auth-msg"></div>
    <button class="btn btn-ghost auto" id="reenviar" style="width:100%">Reenviar e-mail de confirmação</button>
    <p class="auth-alt">Já confirmou? <a href="#/login">Fazer login</a></p>
  `);
  w.querySelector("#reenviar").onclick = async (e) => {
    if (!email){ showMsg(w,"err","Volte ao cadastro e informe seu e-mail."); return; }
    e.target.disabled = true;
    const { error } = await sb.auth.resend({ type:"signup", email, options:{ emailRedirectTo: location.origin+location.pathname+"#/confirmar" } });
    if (error){ showMsg(w,"err","Não foi possível reenviar agora. Tente em instantes."); e.target.disabled=false; }
    else showMsg(w,"ok","E-mail reenviado! Verifique também a caixa de spam.");
  };
}

function viewEsqueci(){
  const w = authShell(`
    ${DELTA_LOGO}
    <h1 class="serif">Recuperar senha</h1>
    <p class="lead">Informe seu e-mail e enviaremos um link para redefinir a senha.</p>
    <div class="auth-msg"></div>
    <div class="field"><label>E-mail</label><input type="email" id="email" autocomplete="email" placeholder="voce@escola.edu.br" /></div>
    <button class="btn btn-primary" id="go">Enviar link</button>
    <p class="auth-alt"><a href="#/login">Voltar ao login</a></p>
  `);
  w.querySelector("#go").onclick = async (e) => {
    const email = w.querySelector("#email").value.trim();
    if (!email){ showMsg(w,"err","Informe seu e-mail."); return; }
    e.target.disabled = true; e.target.textContent = "Enviando…";
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin+location.pathname+"#/redefinir" });
    e.target.disabled = false; e.target.textContent = "Enviar link";
    if (error) showMsg(w,"err","Não foi possível enviar agora. Tente novamente.");
    else showMsg(w,"ok","Se este e-mail existir, enviamos um link de redefinição. Verifique sua caixa de entrada.");
  };
}

function viewRedefinir(){
  const w = authShell(`
    ${DELTA_LOGO}
    <h1 class="serif">Nova senha</h1>
    <p class="lead">Defina sua nova senha de acesso.</p>
    <div class="auth-msg"></div>
    <div class="field"><label>Nova senha</label><input type="password" id="senha" autocomplete="new-password" placeholder="Mínimo 6 caracteres" /></div>
    <div class="field"><label>Confirmar senha</label><input type="password" id="senha2" autocomplete="new-password" placeholder="Repita a senha" /></div>
    <button class="btn btn-primary" id="go">Salvar nova senha</button>
    <p class="auth-alt"><a href="#/login">Voltar ao login</a></p>
  `);
  if (!state.session) showMsg(w,"err","Abra esta página pelo link enviado ao seu e-mail para redefinir a senha.");
  w.querySelector("#go").onclick = async (e) => {
    const s1 = w.querySelector("#senha").value, s2 = w.querySelector("#senha2").value;
    if (s1.length<6){ showMsg(w,"err","A senha deve ter ao menos 6 caracteres."); return; }
    if (s1!==s2){ showMsg(w,"err","As senhas não coincidem."); return; }
    e.target.disabled = true; e.target.textContent="Salvando…";
    const { error } = await sb.auth.updateUser({ password: s1 });
    e.target.disabled = false; e.target.textContent="Salvar nova senha";
    if (error){ showMsg(w,"err", error.message || "Não foi possível salvar."); return; }
    showMsg(w,"ok","Senha redefinida! Redirecionando…");
    setTimeout(()=>navigate("/inicio"), 1200);
  };
}

// ============================================================
// SHELL DO APP — layout "mission control" (sidebar + trilha + rail)
// ============================================================
const NAV_ITEMS = [
  { t:"inicio",   ic:"⌂", label:"Aprender", href:"#/inicio" },
  { t:"materias", ic:"⬡", label:"Matérias", href:"#/materias" },
  { t:"ranking",  ic:"⛨", label:"Ligas",    href:"#/ranking" },
  { t:"missoes",  ic:"◎", label:"Missões",  href:"#/missoes" },
  { t:"loja",     ic:"▣", label:"Loja",     href:"#/loja" },
  { t:"perfil",   ic:"◔", label:"Perfil",   href:"#/perfil" },
];
const MORE_ITEMS = [
  { t:"revisao",    ic:"↻", label:"Revisão",    href:"#/revisao" },
  { t:"simulados",  ic:"⏱", label:"Simulados",  href:"#/simulados" },
  { t:"enem",       ic:"◈", label:"Banco ENEM", href:"#/enem" },
  { t:"desempenho", ic:"∿", label:"Desempenho", href:"#/desempenho" },
  { t:"tecnicas",   ic:"✦", label:"Técnicas",   href:"#/tecnicas" },
];
const coinsDe = xp => Math.floor((xp||0)*0.4);

function appShell(activeTab, innerHTML, opts={}){
  const admin = state.profile?.tipo_usuario === "admin";
  const more = MORE_ITEMS.concat(admin?[{t:"admin",ic:"⚙",label:"Admin",href:"#/admin"}]:[]);
  const moreActive = more.some(i=>i.t===activeTab);
  root().innerHTML = "";
  const navA = i=>`<a href="${i.href}" class="${i.t===activeTab?'active':''}"><span class="nic">${i.ic}</span>${i.label}</a>`;
  const xp = state.stats.xp||0, streak = state.stats.streak_atual||0;
  const tabs = [NAV_ITEMS[0],NAV_ITEMS[2],NAV_ITEMS[3],NAV_ITEMS[5]]
    .map(i=>`<a href="${i.href}" class="${i.t===activeTab?'active':''}"><span class="ic">${i.ic}</span>${i.label}</a>`).join("")
    + `<button id="mMore" class="${(moreActive||["materias","loja"].includes(activeTab))?'active':''}"><span class="ic">⋯</span>Mais</button>`;
  const shell = h(`
    <div class="dshell">
      <header class="dtop">
        <a class="brand" href="#/inicio"><img src="../brand/delta-mark@2x.png" alt="" /> Projeto Delta</a>
        <div class="stats">
          <span class="chip streak">🔥 ${streak}</span>
          <span class="chip xp">△ ${xp} XP</span>
        </div>
      </header>
      <div class="dgrid ${opts.rail?'has-rail':''} ${opts.bare?'bare':''}">
        <aside class="dside">
          <div class="logo"><img src="../brand/delta-mark@2x.png" alt=""/><div><div class="a">PROJETO</div><div class="b">DELTA</div></div></div>
          <nav>
            ${NAV_ITEMS.map(navA).join("")}
            <button class="navbtn ${moreActive?'active':''}" id="moreBtn"><span class="nic">⋯</span>Mais</button>
            <div class="more-list ${moreActive?'open':''}">${more.map(navA).join("")}</div>
          </nav>
          <div class="promo">
            <img src="../brand/delta-mark@2x.png" alt=""/>
            <div class="t">PRONTO PARA EVOLUIR?</div>
            <div class="d">Domine o ENEM com o Projeto Delta.</div>
            <a class="btn btn-primary" href="#/simulados">Desafio diário ›</a>
          </div>
        </aside>
        <main class="dmain"><div class="view">${innerHTML}</div></main>
        ${opts.rail?`<aside class="drail">${railHtml()}</aside>`:""}
      </div>
      <nav class="dtabs">${tabs}</nav>
    </div>`);
  root().appendChild(shell);
  const mb = shell.querySelector("#moreBtn");
  if (mb) mb.onclick = ()=> shell.querySelector(".more-list").classList.toggle("open");
  const mm = shell.querySelector("#mMore");
  if (mm) mm.onclick = ()=> openSheet("Mais opções",
    [NAV_ITEMS[1],NAV_ITEMS[4]].concat(more).map(i=>`<a class="gl" href="${i.href}"><span class="s">${i.ic}</span>${i.label}</a>`).join(""));
  if (opts.rail) fillRail(shell);
  return shell.querySelector(".view");
}

function openSheet(title, innerHTML){
  const ov = h(`<div class="gsheet"><div class="gcard"><h2>${esc(title)}</h2>${innerHTML}</div></div>`);
  document.body.appendChild(ov);
  ov.addEventListener("click", e=>{ if (e.target===ov || e.target.closest("a")) ov.remove(); });
  return ov;
}

// ---- painel lateral (rail) ----
function railHtml(){
  const xp = state.stats.xp||0;
  const nome = (state.profile?.nome||"Delta").trim();
  const spark = seed=>{
    let x=seed, pts=[];
    for(let i=0;i<9;i++){ x=(x*9301+49297)%233280; pts.push(`${i*12},${20-4-(x/233280)*14}`); }
    return `<svg viewBox="0 0 96 22" preserveAspectRatio="none"><polyline points="${pts.join(" ")}" fill="none" stroke="url(#g${seed})" stroke-width="1.6"/><defs><linearGradient id="g${seed}" x1="0" x2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs></svg>`;
  };
  return `
  <div class="rail-card rail-stats">
    <span class="st"><span class="e">🔥</span><span><div class="v">${state.stats.streak_atual||0}</div><div class="l">Sequência</div></span></span>
    <span class="st"><span class="e">💠</span><span><div class="v">${coinsDe(xp).toLocaleString("pt-BR")}</div><div class="l">Delta Coins</div></span></span>
    <span class="st"><span class="e" style="filter:none;color:var(--iris-2)">△</span><span><div class="v">${xp.toLocaleString("pt-BR")}</div><div class="l">XP</div></span></span>
    <span class="ava">${esc((nome[0]||"D").toUpperCase())}</span>
  </div>
  <div class="rail-card premium">
    <div>
      <div class="k">DELTA PREMIUM</div>
      <h3>TURBINE SEUS RESULTADOS</h3>
      <p>Acesso ilimitado, relatórios avançados e muito mais.</p>
      <button class="btn btn-primary" id="railPrem">Em breve</button>
    </div>
    <img src="../brand/delta-prism.png" alt=""/>
  </div>
  <a class="rail-card liga-card" href="#/ranking">
    <span class="shield">⛨</span>
    <span><div class="t" id="railLigaT">Sua liga</div><div class="d" id="railLigaD">Ganhe XP esta semana para competir!</div></span>
    <span class="go">›</span>
  </a>
  <div class="rail-card">
    <div class="rail-head"><span class="t">Missões do dia</span><a href="#/missoes">Ver todas</a></div>
    <div id="railMis"><div class="rrank-note">Carregando…</div></div>
  </div>
  <div class="rail-card">
    <div class="rail-head"><span class="t">Desempenho</span><a href="#/desempenho">Detalhes</a></div>
    <div class="rperf">
      <div class="pc"><div class="l">◎ Precisão</div><div class="v" id="railPrec">—</div>${spark(7)}</div>
      <div class="pc"><div class="l">✓ Acertos</div><div class="v" id="railAc">—</div>${spark(23)}</div>
      <div class="pc"><div class="l">∿ Hoje</div><div class="v" id="railHoje">—</div>${spark(51)}</div>
    </div>
  </div>
  <div class="rail-card">
    <div class="rail-head"><span class="t">Ranking semanal</span><a href="#/ranking">Ver ranking</a></div>
    <div class="rrank-you"><span>🏆</span><span class="pos" id="railPos">#—</span><span class="nm">Você</span><span class="xp" id="railXp">— XP</span></div>
    <div class="rrank-note">Continue assim e suba no ranking!</div>
  </div>
  <div class="rail-foot">
    <a href="../index.html">Sobre</a><a href="#/tecnicas">Técnicas</a><a href="#/enem">Banco ENEM</a>
    <a href="#/simulados">Simulados</a><a href="#/revisao">Revisão</a><a href="#/desempenho">Desempenho</a>
  </div>`;
}

function fillRail(shell){
  const q = s=>shell.querySelector(s);
  const prem = q("#railPrem"); if (prem) prem.onclick = ()=>toast("Delta Premium chega em breve. Por enquanto, tudo é grátis! 🚀");
  // missões do dia (3 primeiras)
  sb.rpc("mission_progress").then(({data})=>{
    const host = q("#railMis"); if (!host||!data) return;
    const d = data.filter(m=>m.periodo==="diaria").slice(0,3);
    host.innerHTML = d.map(m=>{
      const pct = Math.min(100, Math.round(m.progresso/m.alvo*100));
      return `<div class="rmis"><span class="e">${m.emoji}</span>
        <span class="bx"><div class="n">${esc(m.titulo)}</div><div class="bar"><i style="width:${pct}%"></i></div></span>
        <span class="v">${Math.min(m.progresso,m.alvo)} / ${m.alvo}</span>
        <span class="xpb">${m.resgatada?"✓":"XP"}</span></div>`;
    }).join("") || '<div class="rrank-note">Sem missões hoje.</div>';
  }).catch(()=>{});
  // ranking + liga
  sb.rpc("my_rank",{p_period:"semanal"}).then(({data})=>{
    if (!data) return;
    const l = ligaDe(data.xp||0);
    if (q("#railPos")) q("#railPos").textContent = "#"+data.pos;
    if (q("#railXp")) q("#railXp").textContent = (data.xp||0).toLocaleString("pt-BR")+" XP";
    if (q("#railLigaT")) q("#railLigaT").textContent = l.nome.toUpperCase();
    const next = LIGAS[LIGAS.indexOf(l)+1];
    if (q("#railLigaD")) q("#railLigaD").textContent = next
      ? `Faltam ${Math.max(0,next.min-(data.xp||0))} XP para a ${next.nome}!`
      : "Você está na liga máxima. Lendário! 🔺";
  }).catch(()=>{});
  // precisão / acertos (dados locais) + XP de hoje
  let t=0,a=0; Object.values(state.topics||{}).forEach(r=>{ a+=r.acertos||0; t+=(r.acertos||0)+(r.erros||0); });
  if (q("#railPrec")) q("#railPrec").textContent = t? Math.round(a/t*100)+"%" : "—";
  if (q("#railAc")) q("#railAc").textContent = a;
  const d0 = new Date(); d0.setHours(0,0,0,0);
  sb.from("xp_events").select("amount").gte("created_at", d0.toISOString()).then(({data})=>{
    const s = (data||[]).reduce((x,r)=>x+r.amount,0);
    if (q("#railHoje")) q("#railHoje").textContent = "+"+s+" XP";
  }).catch(()=>{});
}

// nível de conclusão de uma matéria (0..1)
function subjectProgress(s){
  let done=0, total=0;
  s.unidades.forEach(u=>u.licoes.forEach(l=>{ total++; if((state.lessons[l.id]?.estrelas||0)>0) done++; }));
  return total? done/total : 0;
}

function currentSubject(){
  return SUBJECTS.find(s=>s.id===localStorage.getItem("delta-subj")) || SUBJECTS[0];
}

// ============================================================
// APRENDER — trilha central estilo Duolingo
// ============================================================
function viewInicio(){
  const s = currentSubject();
  const si = SUBJECTS.indexOf(s);
  let prevDone = true, curFound = false, curUnit = 1, curTitle = s.unidades[0]?.titulo || "";

  const unitsHtml = s.unidades.map((u,ui)=>{
    const unitLockedAtStart = !prevDone;
    const nodes = [];
    if (unitLockedAtStart){
      nodes.push(`<div class="pnode skip"><span class="ptip2">Pular pra cá?</span><button data-skip="${u.licoes[0].id}">»</button></div>`);
    }
    u.licoes.forEach((l,li)=>{
      const st = state.lessons[l.id]?.estrelas||0;
      const done = st>0;
      const locked = !prevDone && !done;
      const isCur = !done && !locked && !curFound;
      if (isCur){ curFound=true; curUnit=ui+1; curTitle=u.titulo; }
      prevDone = done;
      const off = ["","px-1","","px-2"][li%4];
      const stars = `<div class="pstars">${[0,1,2].map(i=>`<span class="st ${i<st?'on':''}">★</span>`).join("")}</div>`;
      if (isCur)
        nodes.push(`<div class="pnode cur ${off}"><span class="ptip">Começar</span><button data-l="${l.id}">★</button>${stars}<div class="plbl">${esc(l.titulo)}</div></div>`);
      else if (done)
        nodes.push(`<div class="pnode done ${off}"><button class="hexwrap" data-l="${l.id}"><span class="hexb">△</span></button>${stars}<div class="plbl">${esc(l.titulo)}</div></div>`);
      else
        nodes.push(`<div class="pnode lock ${off}"><button class="hexwrap" data-locked="1"><span class="hexb">🔒</span></button><div class="plbl">${esc(l.titulo)}</div></div>`);
    });
    const unitDone = u.licoes.every(l=>(state.lessons[l.id]?.estrelas||0)>0);
    nodes.push(`<div class="pnode chest ${unitDone?'open':'closed'}"><button data-chest="${unitDone?1:0}">🎁</button><div class="plbl">${unitDone?"Baú da unidade":"Complete a unidade"}</div></div>`);
    const bot = `<img class="path-bot ${ui%2?'l':'r'}" style="top:${ui%2?110:70}px" src="../brand/delta-bot-${(ui%2)+1}.png" alt=""/>`;
    return `<div class="pcol">
      <div class="path-div"><span>Unidade ${ui+1} — ${esc(u.titulo)}</span></div>
      ${bot}
      ${nodes.join('<div class="pnode"><span class="seg"></span></div>')}
    </div>`;
  }).join("");

  const pills = SUBJECTS.map(x=>`<button data-s="${x.id}" class="${x.id===s.id?'on':''}"><span style="color:${SUBJ_COLOR(x.hue)}">${x.simbolo}</span>${esc(x.nome)}</button>`).join("");

  const v = appShell("inicio", `
    <div class="path-wrap">
      <div class="subj-pills">${pills}</div>
      <div class="sec-banner">
        <div><div class="k">Seção ${si+1}, Unidade ${curUnit}</div><h1>${esc(curTitle)}</h1></div>
        <button class="guia" id="guiaBtn">☰ Guia</button>
      </div>
      <div class="path">${unitsHtml}</div>
    </div>
  `, { rail:true });

  v.querySelectorAll(".subj-pills button").forEach(b=>b.onclick=()=>{ localStorage.setItem("delta-subj", b.dataset.s); viewInicio(); });
  v.querySelectorAll("[data-l]").forEach(n=>n.onclick=()=>navigate("/licao/"+n.dataset.l));
  v.querySelectorAll("[data-locked]").forEach(n=>n.onclick=()=>toast("Conclua a lição anterior para desbloquear 🔒"));
  v.querySelectorAll("[data-skip]").forEach(n=>n.onclick=()=>navigate("/licao/"+n.dataset.skip));
  v.querySelectorAll("[data-chest]").forEach(n=>n.onclick=()=>toast(n.dataset.chest==="1" ? "Baú aberto! O bônus de XP já foi somado nas lições. 🎉" : "Complete todas as lições da unidade para abrir o baú. 🎁"));
  const gb = v.querySelector("#guiaBtn");
  if (gb) gb.onclick = ()=>{
    const inner = s.unidades.map((u,ui)=>`<div class="gu"><div class="ut">Unidade ${ui+1} — ${esc(u.titulo)}</div>${
      u.licoes.map(l=>{
        const st = state.lessons[l.id]?.estrelas||0;
        return `<a class="gl" href="#/licao/${l.id}"><span class="s">${st>0?"△":"○"}</span>${esc(l.titulo)}<span style="margin-left:auto;color:var(--iris-5)">${"★".repeat(st)}</span></a>`;
      }).join("")}</div>`).join("");
    openSheet(`Guia — ${s.nome}`, inner);
  };
}

// ============================================================
// MATÉRIAS — escolha de trilha + recomendações
// ============================================================
function viewMaterias(){
  const recs = recommendations();
  const recHtml = recs.map(r=>{
    const {subject,unidade,licao} = r.meta;
    const rot = r.tipo==="revisao" ? "Revisão" : r.tipo==="reforco" ? "Reforço" : "Nova lição";
    const ic = r.tipo==="revisao" ? "↻" : r.tipo==="reforco" ? "!" : "→";
    return `<button class="rec" data-l="${licao.id}">
      <span class="badge" style="background:${SUBJ_GRAD(subject.hue)}">${subject.simbolo}</span>
      <span><span class="t">${esc(licao.titulo)}</span><br><span class="d">${esc(subject.nome)} · ${rot}</span></span>
      <span class="go">${ic}</span>
    </button>`;
  }).join("");
  const subjHtml = SUBJECTS.map(s=>{
    const p = Math.round(subjectProgress(s)*100);
    const nlic = s.unidades.reduce((a,u)=>a+u.licoes.length,0);
    return `<div class="subj-card glass holo-border" data-s="${s.id}">
      <div class="aura" style="background:radial-gradient(70% 70% at 70% 10%,${SUBJ_COLOR(s.hue)},transparent)"></div>
      <span class="sym" style="color:${SUBJ_COLOR(s.hue)}">${s.simbolo}</span>
      <h3>${esc(s.nome)}</h3>
      <div class="meta">${nlic} lições · ${p}%</div>
      <div class="prog"><i style="width:${p}%;background:${SUBJ_GRAD(s.hue)}"></i></div>
    </div>`;
  }).join("");
  const v = appShell("materias", `
    <div class="hello"><p class="k">Escolha sua trilha</p><h1 class="serif">Matérias</h1></div>
    <div class="today glass">
      <div class="glowring"></div>
      <h3>Para você hoje</h3>
      <p>Selecionamos o que mais rende agora — revisões no ponto certo e tópicos para reforçar.</p>
      <div class="rec-list">${recHtml || '<div class="empty">Comece uma trilha abaixo para receber recomendações inteligentes. ✨</div>'}</div>
    </div>
    <div class="section-title"><h2>Trilhas</h2><span class="s">4 matérias</span></div>
    <div class="subj-grid">${subjHtml}</div>
    <div class="enem-banner glass holo-border" id="goEnem">
      <span class="enem-word">ENEM</span>
      <div><h3>Banco de questões oficiais</h3><p>Pratique com questões reais das provas do ENEM, com gabarito oficial e filtros por matéria, ano e assunto.</p></div>
      <span class="go">→</span>
    </div>
  `);
  v.querySelectorAll(".subj-card").forEach(c=>c.onclick=()=>{ localStorage.setItem("delta-subj", c.dataset.s); navigate("/inicio"); });
  v.querySelectorAll(".rec").forEach(c=>c.onclick=()=>navigate("/licao/"+c.dataset.l));
  const ge = v.querySelector("#goEnem"); if (ge) ge.onclick = ()=>navigate("/enem");
}

// ============================================================
// LOJA — Delta Coins (cosméticos em breve)
// ============================================================
function viewLoja(){
  const coins = coinsDe(state.stats.xp||0);
  const items = [
    { e:"🧊", n:"Congelamento de Sequência", d:"Proteja sua sequência por 1 dia sem estudar.", tag:"EM BREVE" },
    { e:"👨‍🚀", n:"Traje do Explorador", d:"Visual exclusivo para seu avatar astronauta.", tag:"EM BREVE" },
    { e:"🌌", n:"Aura Quântica", d:"Efeito de brilho animado no seu perfil e no ranking.", tag:"EM BREVE" },
    { e:"🔺", n:"Tema Plasma", d:"Interface com paleta alternativa magenta/plasma.", tag:"EM BREVE" },
    { e:"⚡", n:"Impulso de XP", d:"Dobre o XP ganho por 15 minutos de estudo.", tag:"EM BREVE" },
    { e:"🎯", n:"Missão Extra", d:"Desbloqueie uma missão diária adicional.", tag:"EM BREVE" },
  ];
  const v = appShell("loja", `
    <div class="shop-head">
      <div class="hello" style="margin:0"><p class="k">Recompensas</p><h1 class="serif">Loja</h1></div>
      <span class="coins">💠 ${coins.toLocaleString("pt-BR")}</span>
    </div>
    <p style="color:var(--text-dim);font-size:.86rem;margin-bottom:1.1rem">Seus <b>Delta Coins</b> crescem junto com o XP que você conquista estudando. Os itens da loja estão chegando — continue acumulando!</p>
    <div class="shop-grid">${items.map(i=>`
      <div class="shop-card soon">
        <div class="se">${i.e}</div>
        <h3>${i.n}</h3>
        <p>${i.d}</p>
        <span class="tagp">${i.tag}</span>
      </div>`).join("")}
    </div>
  `);
}

// rota antiga /trilha/:id → define matéria e vai para a trilha
function viewTrilha(subjId){
  const s = SUBJECTS.find(x=>x.id===subjId);
  if (s) localStorage.setItem("delta-subj", s.id);
  navigate("/inicio");
}

// ============================================================
// LIÇÃO (quiz)
// ============================================================
function viewLicao(lessonId){
  const meta = LESSON_INDEX[lessonId];
  if (!meta){ navigate("/inicio"); return; }
  const { subject, licao } = meta;
  const questoes = licao.questoes;
  let idx = 0, acertos = 0, vidas = 3, answered = false;

  const v = appShell("inicio", `<div class="lesson">
    <div class="lesson-top">
      <a class="x" href="#/inicio">✕</a>
      <div class="progressbar"><i id="pbar" style="width:0%"></i></div>
      <span class="hearts" id="hearts">❤️❤️❤️</span>
    </div>
    <div id="qhost"></div>
    <div class="lesson-foot"><button class="btn btn-primary" id="next" disabled>Confirmar</button></div>
  </div>`, { bare:true });

  const qhost = v.querySelector("#qhost");
  const nextBtn = v.querySelector("#next");
  const pbar = v.querySelector("#pbar");
  const heartsEl = v.querySelector("#hearts");

  function renderQ(){
    answered = false;
    const q = questoes[idx];
    pbar.style.width = ((idx)/questoes.length*100)+"%";
    qhost.innerHTML = "";
    const block = h(`<div class="q-block">
      <div class="qk">Questão ${idx+1} de ${questoes.length} · ${esc(subject.nome)}</div>
      <div class="q">${esc(q.q)}</div>
      <div class="options">${q.o.map((op,i)=>`<button class="opt" data-i="${i}"><span class="key">${String.fromCharCode(65+i)}</span><span>${esc(op)}</span></button>`).join("")}</div>
      <div class="feedback"><div class="h"></div><p></p></div>
    </div>`);
    qhost.appendChild(block);
    nextBtn.disabled = true; nextBtn.textContent = "Confirmar";
    let chosen = -1;
    block.querySelectorAll(".opt").forEach(o=>{
      o.onclick = ()=>{
        if (answered) return;
        block.querySelectorAll(".opt").forEach(x=>x.style.borderColor="");
        chosen = parseInt(o.dataset.i);
        o.style.borderColor = "var(--iris-2)";
        nextBtn.disabled = false;
      };
    });
    nextBtn.onclick = ()=>{
      if (!answered){
        if (chosen<0) return;
        answered = true;
        const q = questoes[idx];
        const opts = block.querySelectorAll(".opt");
        opts.forEach(x=>x.disabled=true);
        const fb = block.querySelector(".feedback");
        if (chosen===q.c){
          acertos++;
          opts[chosen].classList.add("correct");
          fb.className="feedback show correct";
          fb.querySelector(".h").innerHTML="✓ Correto!";
          flyXP("+"+XP_POR_ACERTO+" XP");
        } else {
          opts[chosen].classList.add("wrong");
          opts[q.c].classList.add("correct");
          fb.className="feedback show wrong";
          fb.querySelector(".h").innerHTML="✕ Ops!";
          vidas = Math.max(0, vidas-1);
          heartsEl.textContent = "❤️".repeat(vidas) + "🤍".repeat(3-vidas);
        }
        fb.querySelector("p").textContent = q.e;
        logAttempt({ origem:"licao", ref:licao.id+"#"+idx, materia:subject.nome, topico:licao.topico,
          correta: chosen===q.c, resposta:String.fromCharCode(65+chosen), correta_resp:String.fromCharCode(65+q.c) });
        if (chosen!==q.c) logError({ origem:"licao", ref:licao.id+"#"+idx, enunciado:q.q,
          resposta_aluno:q.o[chosen], resposta_correta:q.o[q.c], explicacao:q.e,
          materia:subject.nome, topico:licao.topico });
        nextBtn.textContent = idx<questoes.length-1 ? "Continuar" : "Finalizar";
      } else {
        idx++;
        if (idx<questoes.length) renderQ();
        else finish();
      }
    };
  }

  async function finish(){
    pbar.style.width = "100%";
    await bumpStreak();
    const dueRev = state.topics[licao.topico]?.proxima_revisao || null;
    const wasDue = dueRev && dueRev <= today();
    await addXP(acertos*XP_POR_ACERTO + (acertos===questoes.length?XP_BONUS_LICAO:0), "licao", licao.id);
    if (wasDue && acertos/questoes.length >= 0.6) await addXP(15, "revisao", licao.topico);
    const { pct, estrelas } = await saveLesson(licao.id, licao.topico, acertos, questoes.length);
    confetti();
    v.innerHTML = `<div class="done-screen">
      <div class="trophy">${estrelas===3?"🏆":estrelas>=2?"🎉":estrelas>=1?"✨":"💪"}</div>
      <h1 class="serif">${estrelas>=2?"Excelente!":estrelas>=1?"Boa!":"Continue tentando!"}</h1>
      <div class="stars-big">${[0,1,2].map(i=>`<span class="st ${i<estrelas?'on':''}">★</span>`).join("")}</div>
      <div class="done-stats">
        <div class="box glass"><div class="v holo-text">${pct}%</div><div class="l">Acertos</div></div>
        <div class="box glass"><div class="v" style="color:var(--iris-2)">+${acertos*XP_POR_ACERTO+(acertos===questoes.length?XP_BONUS_LICAO:0)}</div><div class="l">XP</div></div>
        <div class="box glass"><div class="v" style="color:var(--iris-5)">🔥 ${state.stats.streak_atual}</div><div class="l">Streak</div></div>
      </div>
      <button class="btn btn-primary" id="cont">Continuar travessia</button>
      <button class="btn btn-ghost" id="redo" style="margin-top:.6rem">Refazer lição</button>
    </div>`;
    v.querySelector("#cont").onclick = ()=>{ localStorage.setItem("delta-subj", subject.id); navigate("/inicio"); };
    v.querySelector("#redo").onclick = ()=>viewLicao(lessonId);
  }

  renderQ();
}

function flyXP(text){
  const el = h(`<div class="xp-fly">${text}</div>`);
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 1200);
}

function confetti(){
  const c = h(`<canvas id="confetti"></canvas>`);
  document.body.appendChild(c);
  const ctx = c.getContext("2d");
  c.width = innerWidth; c.height = innerHeight;
  const cols = ["#7b5cff","#39d0ff","#2bf5c8","#ff5ccf","#ffd166"];
  const parts = Array.from({length:120}, ()=>({
    x:innerWidth/2, y:innerHeight/2,
    vx:(Math.random()-.5)*14, vy:(Math.random()-.5)*14-4,
    s:4+Math.random()*6, c:cols[Math.random()*cols.length|0], a:1, r:Math.random()*6
  }));
  let t=0;
  (function loop(){
    ctx.clearRect(0,0,c.width,c.height);
    t++;
    parts.forEach(p=>{ p.vy+=.3; p.x+=p.vx; p.y+=p.vy; p.a-=.012; p.r+=.2;
      ctx.globalAlpha=Math.max(0,p.a); ctx.fillStyle=p.c;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6); ctx.restore();
    });
    if (t<140) requestAnimationFrame(loop); else c.remove();
  })();
}

// ============================================================
// BANCO ENEM (questões oficiais — Supabase)
// ============================================================
// enunciado vem em markdown simplificado: escapamos tudo e reconstruímos
// apenas imagens (que apontam para o Storage público do projeto) e parágrafos.
function mdStatement(md){
  let t = esc(md||"");
  t = t.replace(/!\[([^\]]*)\]\((https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/questoes\/[^)\s]+)\)/g,
    '<img class="q-img" src="$2" alt="$1" loading="lazy" />');
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ""); // qualquer outra imagem: remove
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return t.split(/\n{2,}/).map(p=>`<p>${p.replace(/\n/g,"<br>")}</p>`).join("");
}

async function viewEnem(){
  const v = appShell("enem", `<div class="enem-home">
    <div class="hello"><p class="k">Questões oficiais · INEP</p>
      <h1 class="serif">Banco ENEM</h1></div>
    <div class="filters glass" id="filters">
      <div class="f"><label>Matéria</label><select id="fMat"><option value="">Todas</option>
        <option>Matemática</option><option>Física</option><option>Química</option><option>Biologia</option></select></div>
      <div class="f"><label>Ano</label><select id="fAno"><option value="">Todos</option></select></div>
      <div class="f"><label>Assunto</label><select id="fTop"><option value="">Todos</option></select></div>
      <div class="f"><label>Questões</label><select id="fN"><option>5</option><option selected>10</option><option>15</option></select></div>
      <button class="btn btn-primary" id="start">Praticar ✦</button>
      <div class="count" id="qcount">…</div>
    </div>
    <div id="enemHost"></div>
  </div>`);

  const fMat=v.querySelector("#fMat"), fAno=v.querySelector("#fAno"),
        fTop=v.querySelector("#fTop"), fN=v.querySelector("#fN"),
        qcount=v.querySelector("#qcount"), host=v.querySelector("#enemHost");

  async function meta(){
    const { data } = await sb.from("questions").select("year,topic,primary_subject").eq("publication_status","published").limit(2000);
    const rows = data||[];
    const anos=[...new Set(rows.map(r=>r.year))].sort((a,b)=>b-a);
    fAno.innerHTML = '<option value="">Todos</option>' + anos.map(a=>`<option>${a}</option>`).join("");
    refreshTopics(rows); updateCount(rows);
    fMat.onchange = ()=>{ refreshTopics(rows); updateCount(rows); };
    fAno.onchange = fTop.onchange = ()=>updateCount(rows);
    return rows;
  }
  function refreshTopics(rows){
    const m=fMat.value;
    const tops=[...new Set(rows.filter(r=>!m||r.primary_subject===m).map(r=>r.topic).filter(Boolean))].sort();
    fTop.innerHTML = '<option value="">Todos</option>' + tops.map(t=>`<option>${esc(t)}</option>`).join("");
  }
  function filtered(rows){
    return rows.filter(r=>(!fMat.value||r.primary_subject===fMat.value)
      &&(!fAno.value||r.year===parseInt(fAno.value))
      &&(!fTop.value||r.topic===fTop.value));
  }
  function updateCount(rows){
    qcount.textContent = filtered(rows).length + " questões oficiais disponíveis";
  }
  const rows = await meta();

  v.querySelector("#start").onclick = async ()=>{
    let q = sb.from("questions").select("id").eq("publication_status","published");
    if (fMat.value) q = q.eq("primary_subject", fMat.value);
    if (fAno.value) q = q.eq("year", parseInt(fAno.value));
    if (fTop.value) q = q.eq("topic", fTop.value);
    const { data: ids, error } = await q;
    if (error || !ids?.length){ toast("Nenhuma questão para esses filtros."); return; }
    const n = Math.min(parseInt(fN.value), ids.length);
    const pick = ids.map(x=>x.id).sort(()=>Math.random()-.5).slice(0,n);
    const { data: qs } = await sb.from("questions")
      .select("id,external_id,year,original_number,primary_subject,topic,statement,correct_answer,question_alternatives(letter,content,is_correct,display_order)")
      .in("id", pick);
    if (!qs?.length){ toast("Erro ao carregar questões."); return; }
    runEnemSession(host, qs.sort(()=>Math.random()-.5));
    v.querySelector("#filters").style.display="none";
    v.querySelector(".hello").style.display="none";
  };
}

function runEnemSession(host, qs){
  let idx=0, acertos=0, answered=false;
  host.innerHTML = `<div class="lesson">
    <div class="lesson-top">
      <a class="x" href="#/enem" onclick="location.reload()">✕</a>
      <div class="progressbar"><i id="pbar" style="width:0%"></i></div>
      <span class="hearts" id="score">0/${qs.length}</span>
    </div>
    <div id="qhost"></div>
    <div class="lesson-foot"><button class="btn btn-primary" id="next" disabled>Confirmar</button></div>
  </div>`;
  const qhost=host.querySelector("#qhost"), nextBtn=host.querySelector("#next"),
        pbar=host.querySelector("#pbar"), scoreEl=host.querySelector("#score");

  function renderQ(){
    answered=false;
    const q=qs[idx];
    const alts=(q.question_alternatives||[]).sort((a,b)=>a.display_order-b.display_order);
    pbar.style.width=(idx/qs.length*100)+"%";
    qhost.innerHTML="";
    const block=h(`<div class="q-block">
      <div class="qk">Questão ${idx+1} de ${qs.length} · ${esc(q.primary_subject)} · ENEM ${q.year}${q.topic?" · "+esc(q.topic):""}</div>
      <div class="q q-enem">${mdStatement(q.statement)}</div>
      <div class="options">${alts.map(a=>`<button class="opt" data-l="${a.letter}"><span class="key">${a.letter}</span><span>${esc(a.content)}</span></button>`).join("")}</div>
      <div class="feedback"><div class="h"></div><p></p></div>
    </div>`);
    qhost.appendChild(block);
    nextBtn.disabled=true; nextBtn.textContent="Confirmar";
    let chosen=null;
    block.querySelectorAll(".opt").forEach(o=>{ o.onclick=()=>{
      if(answered) return;
      block.querySelectorAll(".opt").forEach(x=>x.style.borderColor="");
      chosen=o.dataset.l; o.style.borderColor="var(--iris-2)"; nextBtn.disabled=false;
    };});
    nextBtn.onclick=async ()=>{
      if(!answered){
        if(!chosen) return;
        answered=true;
        const opts=[...block.querySelectorAll(".opt")];
        opts.forEach(x=>x.disabled=true);
        const fb=block.querySelector(".feedback");
        const ok = chosen===q.correct_answer;
        const chosenEl=opts.find(x=>x.dataset.l===chosen);
        const rightEl=opts.find(x=>x.dataset.l===q.correct_answer);
        if(ok){ acertos++; chosenEl.classList.add("correct");
          fb.className="feedback show correct"; fb.querySelector(".h").innerHTML="✓ Correto!";
          flyXP("+"+XP_POR_ACERTO+" XP");
        } else { chosenEl.classList.add("wrong"); rightEl?.classList.add("correct");
          fb.className="feedback show wrong"; fb.querySelector(".h").innerHTML="✗ Não foi dessa vez";
        }
        fb.querySelector("p").textContent = `Gabarito oficial: ${q.correct_answer} — ENEM ${q.year}, questão ${q.original_number} (aplicação regular, INEP).`;
        const altText = {}; alts.forEach(a=>altText[a.letter]=a.content);
        logAttempt({ origem:"enem", ref:q.external_id||q.id, materia:q.primary_subject, topico:q.topic,
          correta:ok, resposta:chosen, correta_resp:q.correct_answer });
        if (ok) addXP(XP_POR_ACERTO, "enem", q.external_id||String(q.id));
        else logError({ origem:"enem", ref:String(q.id), enunciado:q.statement,
          resposta_aluno:chosen+") "+(altText[chosen]||""), resposta_correta:q.correct_answer+") "+(altText[q.correct_answer]||""),
          explicacao:`ENEM ${q.year}, questão ${q.original_number} — gabarito oficial INEP.`,
          materia:q.primary_subject, topico:q.topic });
        scoreEl.textContent = acertos+"/"+qs.length;
        nextBtn.textContent = idx===qs.length-1 ? "Finalizar" : "Próxima →";
      } else if (idx < qs.length-1){ idx++; renderQ(); }
      else {
        pbar.style.width="100%";
        const ganho = acertos*XP_POR_ACERTO;
        await bumpStreak();
        if (acertos/qs.length >= 0.7) confetti();
        qhost.innerHTML = `<div class="lesson-done">
          <div class="big">${acertos===qs.length?"🏆":acertos/qs.length>=0.7?"🎉":"💪"}</div>
          <h2 class="serif">${acertos} de ${qs.length}</h2>
          <p>Questões oficiais do ENEM — gabarito INEP.</p>
          <div class="boxes">
            <div class="box glass"><div class="v" style="color:var(--iris-2)">+${ganho}</div><div class="l">XP</div></div>
            <div class="box glass"><div class="v">${Math.round(acertos/qs.length*100)}%</div><div class="l">Aproveitamento</div></div>
          </div>
          <button class="btn btn-primary" onclick="location.reload()">Praticar novamente</button>
        </div>`;
        host.querySelector(".lesson-foot").style.display="none";
      }
    };
  }
  renderQ();
}

// ============================================================
// TÉCNICAS DE ESTUDO
// ============================================================
const TECNICAS = [
  { e:"🍅", t:"Técnica Pomodoro", d:"Estude em blocos de 25 minutos com pausas de 5. A cada 4 blocos, uma pausa longa de 15–30 min.", how:"Foco total no bloco, sem celular. A pausa é sagrada — levante, beba água, respire." },
  { e:"🔁", t:"Revisão espaçada", d:"Revise o conteúdo em intervalos crescentes (1, 3, 7, 14 dias). Combate o esquecimento no ponto certo.", how:"O app já agenda suas revisões automaticamente na seção 'Para você hoje'." },
  { e:"🧠", t:"Recordação ativa", d:"Em vez de reler, tente lembrar o conteúdo de memória. Responder questões vale mais que grifar.", how:"Feche o material e explique o tópico em voz alta ou por escrito. Depois confira." },
  { e:"🔗", t:"Interleaving", d:"Misture matérias e tipos de questão no mesmo dia em vez de estudar um só assunto em bloco.", how:"Alterne, por exemplo, Matemática e Física — o cérebro aprende a escolher a estratégia certa." },
  { e:"👩‍🏫", t:"Técnica Feynman", d:"Explique o assunto como se ensinasse a uma criança. Se travar, achou sua lacuna.", how:"Escreva a explicação simples, identifique os pontos confusos e volte ao conteúdo." },
  { e:"🎯", t:"Metas SMART", d:"Defina metas específicas, mensuráveis e com prazo. 'Estudar mais' não é meta; '3 lições de Química até sexta' é.", how:"Quebre o edital em pequenas metas semanais e comemore cada conclusão." },
];

function viewTecnicas(){
  const cards = TECNICAS.map(t=>`<div class="tech glass holo-border">
    <h3><span class="e">${t.e}</span>${esc(t.t)}</h3>
    <p>${esc(t.d)}</p>
    <div class="how">${esc(t.how)}</div>
  </div>`).join("");
  const v = appShell("tecnicas", `
    <div class="hello"><p class="k">Aprenda a aprender</p><h1 class="serif">Técnicas de estudo</h1></div>
    <div class="tech glass" style="margin-bottom:.9rem">
      <div class="pomo">
        <div class="mode" id="pmode">Foco</div>
        <div class="clock serif" id="pclock">25:00</div>
        <div class="ctrls">
          <button class="btn btn-primary auto" id="pstart">Iniciar</button>
          <button class="btn btn-ghost auto" id="preset">Reiniciar</button>
        </div>
      </div>
    </div>
    <div class="tech-list">${cards}</div>
  `);
  // pomodoro
  let running=false, focus=true, remaining=25*60, timer=null;
  const clock=v.querySelector("#pclock"), modeEl=v.querySelector("#pmode"), startBtn=v.querySelector("#pstart");
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  function tick(){
    remaining--;
    if (remaining<0){
      focus=!focus; remaining=(focus?25:5)*60;
      modeEl.textContent=focus?"Foco":"Pausa"; toast(focus?"Hora de focar! 🍅":"Pausa merecida ☕");
    }
    clock.textContent=fmt(remaining);
  }
  startBtn.onclick=()=>{
    running=!running;
    if (running){ startBtn.textContent="Pausar"; timer=setInterval(tick,1000); }
    else { startBtn.textContent="Continuar"; clearInterval(timer); }
  };
  v.querySelector("#preset").onclick=()=>{ clearInterval(timer); running=false; focus=true; remaining=25*60; clock.textContent="25:00"; modeEl.textContent="Foco"; startBtn.textContent="Iniciar"; };
}

// ============================================================
// PERFIL
// ============================================================
const ACHIEVEMENTS = [
  { id:"first", e:"🎓", n:"Primeira lição", test:()=>Object.keys(state.lessons).length>=1 },
  { id:"streak3", e:"🔥", n:"3 dias seguidos", test:()=>(state.stats.melhor_streak||0)>=3 },
  { id:"xp100", e:"⚡", n:"100 XP", test:()=>(state.stats.xp||0)>=100 },
  { id:"xp500", e:"🌟", n:"500 XP", test:()=>(state.stats.xp||0)>=500 },
  { id:"perf", e:"💯", n:"Nota máxima", test:()=>Object.values(state.lessons).some(l=>l.melhor_pontuacao===100) },
  { id:"tenl", e:"📚", n:"10 lições", test:()=>Object.keys(state.lessons).length>=10 },
];

function viewPerfil(){
  const p = state.profile||{};
  const lvl = nivelDe(state.stats.xp||0);
  const inicial = (p.nome||p.email||"D").trim()[0].toUpperCase();
  const licoesFeitas = Object.keys(state.lessons).length;
  const totalEstrelas = Object.values(state.lessons).reduce((a,l)=>a+(l.estrelas||0),0);
  const achv = ACHIEVEMENTS.map(a=>`<div class="achv ${a.test()?'on':''}"><div class="e">${a.e}</div><div class="n">${esc(a.n)}</div></div>`).join("");

  const v = appShell("perfil", `
    <div class="profile-head">
      <div class="avatar">${esc(inicial)}</div>
      <div>
        <h1 class="serif">${esc(p.nome||"Estudante")}</h1>
        <div class="em">${esc(p.email||"")}</div>
        <div class="em">Nível ${lvl.nivel} · ${p.tipo_usuario||"aluno"}</div>
      </div>
    </div>
    <div class="stat-grid">
      <div class="box glass"><div class="v holo-text">${state.stats.xp||0}</div><div class="l">XP total</div></div>
      <div class="box glass"><div class="v" style="color:var(--iris-5)">${state.stats.melhor_streak||0}</div><div class="l">Melhor streak</div></div>
      <div class="box glass"><div class="v" style="color:var(--iris-3)">${licoesFeitas}</div><div class="l">Lições</div></div>
    </div>
    <div class="section-title"><h2>Nível ${lvl.nivel}</h2><span class="s">${lvl.atual}/${lvl.necessario} XP</span></div>
    <div class="prog" style="height:10px;border-radius:9999px;background:var(--surface-2);overflow:hidden"><i style="display:block;height:100%;width:${Math.round(lvl.atual/lvl.necessario*100)}%;background:var(--holo)"></i></div>
    <div class="section-title"><h2>Conquistas</h2><span class="s">${ACHIEVEMENTS.filter(a=>a.test()).length}/${ACHIEVEMENTS.length}</span></div>
    <div class="achv-grid">${achv}</div>
    <div class="form-card glass" style="margin-top:1.6rem">
      <h2>Meus dados</h2>
      <div class="auth-msg"></div>
      <div class="field"><label>Nome</label><input type="text" id="nome" value="${esc(p.nome||"")}" /></div>
      <div class="field"><label>Escola</label><input type="text" id="escola" value="${esc(p.escola||"")}" /></div>
      <button class="btn btn-primary" id="save">Salvar alterações</button>
    </div>
    <button class="btn btn-ghost" id="logout" style="margin-top:1rem">Sair da conta</button>
  `);

  v.querySelector("#save").onclick = async (e)=>{
    const nome=v.querySelector("#nome").value.trim(), escola=v.querySelector("#escola").value.trim();
    e.target.disabled=true;
    const { error } = await sb.from("profiles").update({ nome, escola }).eq("id", state.session.user.id);
    e.target.disabled=false;
    if (error){ showMsg(v,"err","Não foi possível salvar."); }
    else { state.profile.nome=nome; state.profile.escola=escola; showMsg(v,"ok","Dados atualizados!"); toast("Perfil salvo ✓"); }
  };
  v.querySelector("#logout").onclick = async ()=>{ await sb.auth.signOut(); toast("Você saiu da conta."); };
}

// ============================================================
// ADMIN (domínios autorizados)
// ============================================================
async function viewAdmin(){
  if (state.profile?.tipo_usuario !== "admin"){ navigate("/inicio"); return; }
  await loadDomains();
  const rows = state.domains.map(d=>`<div class="dom-row"><span class="d">@${esc(d.domain)}</span><button class="rm" data-id="${d.id}" title="Remover">✕</button></div>`).join("");
  const v = appShell("admin", `
    <div class="hello"><p class="k">Administração</p><h1 class="serif">Domínios autorizados</h1></div>
    <p class="trail-sub">Apenas e-mails com estes sufixos podem se cadastrar. A regra é aplicada no backend (hook do banco), não só na interface.</p>
    <div class="auth-msg"></div>
    <div id="domlist">${rows||'<div class="empty">Nenhum domínio cadastrado.</div>'}</div>
    <div class="add-dom">
      <input type="text" id="newdom" placeholder="ex.: edu.br" />
      <button class="btn btn-primary" id="add">Adicionar</button>
    </div>
  `);
  function bindRemove(){
    v.querySelectorAll(".rm").forEach(b=>b.onclick=async()=>{
      const { error } = await sb.from("allowed_email_domains").delete().eq("id", b.dataset.id);
      if (error){ showMsg(v,"err","Sem permissão ou erro ao remover."); return; }
      toast("Domínio removido"); await refresh();
    });
  }
  async function refresh(){
    await loadDomains();
    v.querySelector("#domlist").innerHTML = state.domains.map(d=>`<div class="dom-row"><span class="d">@${esc(d.domain)}</span><button class="rm" data-id="${d.id}" title="Remover">✕</button></div>`).join("") || '<div class="empty">Nenhum domínio cadastrado.</div>';
    bindRemove();
  }
  v.querySelector("#add").onclick = async ()=>{
    let dom = v.querySelector("#newdom").value.trim().toLowerCase().replace(/^@/,"");
    if (!dom || dom.includes("@")){ showMsg(v,"err","Informe um domínio válido (ex.: edu.br)."); return; }
    const { error } = await sb.from("allowed_email_domains").insert({ domain: dom });
    if (error){ showMsg(v,"err", /duplicate/i.test(error.message)?"Domínio já existe.":"Sem permissão ou erro ao adicionar."); return; }
    v.querySelector("#newdom").value=""; toast("Domínio adicionado ✓"); await refresh();
  };
  bindRemove();
}

// ============================================================
// REVISÃO — Central de revisão + Caderno de erros
// ============================================================
const MOTIVOS = [
  ["nao_conhecia","Não conhecia o conteúdo"], ["esqueci_formula","Esqueci a fórmula"],
  ["interpretei_errado","Interpretei errado"], ["errei_calculo","Errei o cálculo"],
  ["falta_atencao","Falta de atenção"], ["chutei","Chutei"], ["sem_tempo","Não tive tempo"]
];

async function viewRevisao(){
  const t = today();
  const due = Object.values(state.topics)
    .filter(ts => ts.proxima_revisao && ts.proxima_revisao <= t)
    .map(ts => ({ ts, meta: TOPIC_LESSON[ts.topic_id] }))
    .filter(x => x.meta);

  const dueHtml = due.length ? due.map(({ts,meta})=>{
    const tot=(ts.acertos||0)+(ts.erros||0);
    const taxa= tot? Math.round(ts.acertos/tot*100) : 0;
    return `<button class="rec" data-l="${meta.licao.id}">
      <span class="badge" style="background:${SUBJ_GRAD(meta.subject.hue)}">${meta.subject.simbolo}</span>
      <span><span class="t">${esc(meta.licao.titulo)}</span><br>
        <span class="d">${esc(meta.subject.nome)} · taxa de acerto ${taxa}% · vence hoje</span></span>
      <span class="go">↻</span>
    </button>`;
  }).join("") : '<div class="empty">Nenhuma revisão pendente hoje. Continue as trilhas para alimentar sua agenda de revisão espaçada. ✨</div>';

  const v = appShell("revisao", `
    <div class="hello"><p class="k">Repetição espaçada</p><h1 class="serif">Central de Revisão</h1></div>
    <div class="today glass"><div class="glowring"></div>
      <h3>Revisões de hoje ${due.length?`<span class="cnt">${due.length}</span>`:""}</h3>
      <p>Revisar no intervalo certo multiplica a retenção. Revisões concluídas com 60%+ de acerto rendem <b>+15 XP</b> de bônus.</p>
      <div class="rec-list">${dueHtml}</div>
    </div>
    <div class="section-title"><h2>Caderno de erros</h2><span class="s" id="errCount">carregando…</span></div>
    <div id="errHost"><div class="loading-inline"><div class="spinner"></div></div></div>
  `);
  v.querySelectorAll(".rec").forEach(c=>c.onclick=()=>navigate("/licao/"+c.dataset.l));

  const host = v.querySelector("#errHost");
  const { data: errs, error } = await sb.from("error_notebook").select("*")
    .eq("dominado", false).order("created_at", { ascending:false }).limit(40);
  if (error){ host.innerHTML = '<div class="empty">Não foi possível carregar seus erros agora.</div>'; return; }
  v.querySelector("#errCount").textContent = (errs?.length||0) + " para dominar";
  if (!errs?.length){
    host.innerHTML = '<div class="empty">Nenhum erro pendente — cada erro que você comete nas lições e no banco ENEM entra aqui automaticamente para virar aprendizado. 💪</div>';
    return;
  }
  host.innerHTML = errs.map(e=>`
    <div class="err-card glass" data-id="${e.id}">
      <div class="err-top">
        <span class="tag">${esc(e.materia||"—")}</span>
        <span class="tag dim">${e.origem==="enem"?"ENEM oficial":e.origem==="simulado"?"Simulado":"Lição"}</span>
        <span class="tag dim">${e.tentativas}× errada</span>
      </div>
      <div class="err-q">${esc(e.enunciado).slice(0,400)}${e.enunciado.length>400?"…":""}</div>
      <div class="err-a"><span class="wrong">✕ ${esc(e.resposta_aluno||"—")}</span><span class="right">✓ ${esc(e.resposta_correta||"—")}</span></div>
      ${e.explicacao?`<div class="err-e">${esc(e.explicacao)}</div>`:""}
      <div class="err-foot">
        <select class="motivo">
          <option value="">Por que errei?</option>
          ${MOTIVOS.map(([k,l])=>`<option value="${k}" ${e.motivo===k?"selected":""}>${l}</option>`).join("")}
        </select>
        <button class="btn btn-ghost auto dominei">Dominei ✓</button>
      </div>
    </div>`).join("");
  host.querySelectorAll(".err-card").forEach(card=>{
    card.querySelector(".motivo").onchange = async (ev)=>{
      await sb.from("error_notebook").update({ motivo: ev.target.value||null, updated_at:new Date().toISOString() }).eq("id", card.dataset.id);
      toast("Motivo registrado ✓");
    };
    card.querySelector(".dominei").onclick = async ()=>{
      await sb.from("error_notebook").update({ dominado:true, updated_at:new Date().toISOString() }).eq("id", card.dataset.id);
      card.style.opacity=".35"; card.style.pointerEvents="none"; toast("Erro dominado! 🎉");
    };
  });
}

// ============================================================
// MISSÕES — diárias e semanais (validação no backend)
// ============================================================
async function viewMissoes(){
  const v = appShell("missoes", `
    <div class="hello"><p class="k">Constância diária</p><h1 class="serif">Missões</h1></div>
    <div id="misHost"><div class="loading-inline"><div class="spinner"></div></div></div>
  `);
  const host = v.querySelector("#misHost");
  const { data, error } = await sb.rpc("mission_progress");
  if (error || !data){ host.innerHTML = '<div class="empty">Não foi possível carregar as missões agora. Tente novamente em instantes.</div>'; return; }

  function block(periodo, titulo){
    const list = data.filter(m=>m.periodo===periodo);
    if (!list.length) return "";
    return `<div class="section-title"><h2>${titulo}</h2><span class="s">${list.filter(m=>m.resgatada).length}/${list.length} concluídas</span></div>` +
      list.map(m=>{
        const pct = Math.min(100, Math.round(m.progresso/m.alvo*100));
        const done = m.progresso >= m.alvo;
        return `<div class="mission glass ${m.resgatada?'claimed':''}">
          <span class="me">${m.emoji}</span>
          <div class="mi">
            <div class="mt">${esc(m.titulo)} <span class="mx">+${m.xp_recompensa} XP</span></div>
            <div class="md">${esc(m.descricao)}</div>
            <div class="mbar"><i style="width:${pct}%"></i></div>
            <div class="mp">${Math.min(m.progresso,m.alvo)}/${m.alvo}</div>
          </div>
          ${m.resgatada
            ? `<span class="mdone">✓ Resgatada</span>`
            : done ? `<button class="btn btn-primary auto claim" data-c="${m.code}">Resgatar</button>`
                   : `<span class="mlock">Em progresso</span>`}
        </div>`;
      }).join("");
  }
  host.innerHTML = block("diaria","Missões de hoje") + block("semanal","Missões da semana");
  host.querySelectorAll(".claim").forEach(b=>b.onclick = async ()=>{
    b.disabled = true; b.textContent = "…";
    const { data: res, error: err } = await sb.rpc("claim_mission", { p_code: b.dataset.c });
    if (err || !res?.ok){
      toast(res?.reason==="already_claimed" ? "Missão já resgatada." : "Missão ainda não concluída.");
      b.disabled=false; b.textContent="Resgatar"; return;
    }
    state.stats.xp = res.total; confetti(); flyXP("+"+res.xp+" XP");
    toast("Missão concluída! +"+res.xp+" XP 🎉");
    viewMissoes();
  });
}

// ============================================================
// RANKING — ligas + períodos reais (dados do Supabase)
// ============================================================
const LIGAS = [
  { nome:"Liga Carbono",  min:0,    emoji:"⚫" },
  { nome:"Liga Cobre",    min:100,  emoji:"🟤" },
  { nome:"Liga Titânio",  min:300,  emoji:"⚪" },
  { nome:"Liga Plasma",   min:700,  emoji:"🟣" },
  { nome:"Liga Quântica", min:1500, emoji:"🔵" },
  { nome:"Liga Cósmica",  min:3000, emoji:"🌌" },
  { nome:"Liga Delta",    min:6000, emoji:"🔺" },
];
function ligaDe(xpSemana){
  let l = LIGAS[0];
  LIGAS.forEach(x=>{ if (xpSemana>=x.min) l=x; });
  return l;
}

async function viewRanking(){
  const v = appShell("ranking", `
    <div class="hello"><p class="k">Comunidade Delta</p><h1 class="serif">Ranking</h1></div>
    <div class="rank-liga glass" id="ligaBox"><div class="loading-inline"><div class="spinner"></div></div></div>
    <div class="rank-tabs" id="rtabs">
      <button data-p="diario">Hoje</button>
      <button data-p="semanal" class="active">Semana</button>
      <button data-p="mensal">Mês</button>
      <button data-p="geral">Geral</button>
    </div>
    <div id="rankHost"><div class="loading-inline"><div class="spinner"></div></div></div>
  `);
  const host = v.querySelector("#rankHost");

  // liga do usuário (XP da semana)
  sb.rpc("my_rank", { p_period:"semanal" }).then(({data})=>{
    const xpSem = data?.xp||0;
    const liga = ligaDe(xpSem);
    const next = LIGAS[LIGAS.indexOf(liga)+1];
    v.querySelector("#ligaBox").innerHTML = `
      <span class="lg">${liga.emoji}</span>
      <div><b>${liga.nome}</b><div class="ld">${xpSem} XP nesta semana${next?` · faltam ${next.min-xpSem>0?next.min-xpSem:0} XP para a ${next.nome}`:" · liga máxima!"}</div></div>
      <span class="lp">#${data?.pos||"—"} da semana</span>`;
  });

  async function load(period){
    host.innerHTML = '<div class="loading-inline"><div class="spinner"></div></div>';
    const [{ data: rows, error }, { data: me }] = await Promise.all([
      sb.rpc("leaderboard", { p_period: period, p_limit: 50 }),
      sb.rpc("my_rank", { p_period: period }),
    ]);
    if (error){ host.innerHTML = '<div class="empty">Não foi possível carregar o ranking.</div>'; return; }
    if (!rows?.length){ host.innerHTML = '<div class="empty">Ninguém pontuou neste período ainda — seja a primeira pessoa! 🚀</div>'; return; }
    const inList = rows.some(r=>r.is_me);
    host.innerHTML = `<div class="rank-list glass">` + rows.map(r=>{
      const medal = r.pos===1?"🥇":r.pos===2?"🥈":r.pos===3?"🥉":null;
      return `<div class="rank-row ${r.is_me?'me':''}">
        <span class="rp">${medal||("#"+r.pos)}</span>
        <span class="rn">${esc(r.nome)}${r.escola?`<span class="rs">${esc(r.escola)}</span>`:""}</span>
        <span class="rst">🔥 ${r.streak}</span>
        <span class="rx">${r.xp} XP</span>
      </div>`;
    }).join("") + `</div>` +
    (!inList && me ? `<div class="rank-me glass"><span class="rp">#${me.pos}</span><span class="rn">Você</span><span class="rx">${me.xp} XP</span></div>` : "");
  }
  v.querySelectorAll("#rtabs button").forEach(b=>b.onclick=()=>{
    v.querySelectorAll("#rtabs button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active"); load(b.dataset.p);
  });
  load("semanal");
}

// ============================================================
// SIMULADOS — cronômetro + cartão-resposta + relatório
// ============================================================
async function viewSimulados(){
  const v = appShell("simulados", `
    <div class="hello"><p class="k">Modo prova</p><h1 class="serif">Simulados</h1></div>
    <div class="filters glass" id="simCfg">
      <div class="f"><label>Matéria</label><select id="sMat"><option value="">Todas (mix ENEM)</option>
        <option>Matemática</option><option>Física</option><option>Química</option><option>Biologia</option></select></div>
      <div class="f"><label>Questões</label><select id="sN"><option>5</option><option selected>10</option><option>20</option><option>45</option></select></div>
      <div class="f"><label>Tempo</label><select id="sT"><option value="180" selected>3 min/questão</option><option value="120">2 min/questão</option><option value="0">Sem limite</option></select></div>
      <button class="btn btn-primary" id="sGo">Iniciar simulado ⏱</button>
      <div class="count">Questões oficiais do ENEM (INEP), gabarito oficial. Sem dicas, feedback só no final.</div>
    </div>
    <div id="simHost"></div>
    <div class="section-title"><h2>Histórico</h2><span class="s" id="shCount"></span></div>
    <div id="simHist"><div class="loading-inline"><div class="spinner"></div></div></div>
  `);
  const host = v.querySelector("#simHost");

  // histórico
  const { data: hist } = await sb.from("simulation_attempts").select("*").order("created_at",{ascending:false}).limit(10);
  const hh = v.querySelector("#simHist");
  v.querySelector("#shCount").textContent = (hist?.length||0)+" simulados";
  hh.innerHTML = hist?.length ? hist.map(x=>{
    const pct = Math.round(x.acertos/x.total*100);
    const min = Math.round(x.tempo_seg/60);
    const d = new Date(x.created_at).toLocaleDateString("pt-BR");
    return `<div class="sim-row glass"><span class="sd">${d}</span>
      <span class="sm">${esc(x.filtros?.materia||"Mix")} · ${x.total} questões</span>
      <span class="st">${min} min</span>
      <span class="sp ${pct>=70?'good':pct>=50?'mid':'low'}">${x.acertos}/${x.total} · ${pct}%</span></div>`;
  }).join("") : '<div class="empty">Nenhum simulado ainda. O primeiro é o mais importante — ele vira sua linha de base. 📊</div>';

  v.querySelector("#sGo").onclick = async ()=>{
    const mat = v.querySelector("#sMat").value;
    const n = parseInt(v.querySelector("#sN").value);
    const perQ = parseInt(v.querySelector("#sT").value);
    let q = sb.from("questions").select("id").eq("publication_status","published");
    if (mat) q = q.eq("primary_subject", mat);
    const { data: ids, error } = await q;
    if (error || !ids?.length){ toast("Sem questões para esse filtro."); return; }
    const pick = ids.map(x=>x.id).sort(()=>Math.random()-.5).slice(0, Math.min(n, ids.length));
    const { data: qs } = await sb.from("questions")
      .select("id,external_id,year,original_number,primary_subject,topic,statement,correct_answer,question_alternatives(letter,content,display_order)")
      .in("id", pick);
    if (!qs?.length){ toast("Erro ao carregar questões."); return; }
    v.querySelector("#simCfg").style.display="none";
    v.querySelector(".hello").style.display="none";
    v.querySelector(".section-title").style.display="none";
    hh.style.display="none";
    runSimulado(host, qs.sort(()=>Math.random()-.5), { materia: mat||"Mix", perQ });
  };
}

function runSimulado(host, qs, cfg){
  const answers = new Array(qs.length).fill(null);
  const marked = new Set();
  let idx = 0;
  const totalSec = cfg.perQ ? cfg.perQ * qs.length : 0;
  let remaining = totalSec;
  const t0 = Date.now();
  let timer = null;

  host.innerHTML = `<div class="lesson sim">
    <div class="lesson-top">
      <button class="x" id="sQuit" title="Abandonar">✕</button>
      <div class="progressbar"><i id="pbar"></i></div>
      <span class="hearts timer" id="sClock">${totalSec?fmtClock(totalSec):"livre"}</span>
    </div>
    <div class="sheet" id="sheet"></div>
    <div id="qhost"></div>
    <div class="lesson-foot sim-foot">
      <button class="btn btn-ghost auto" id="sPrev">‹ Anterior</button>
      <button class="btn btn-ghost auto" id="sMark">⚑ Marcar</button>
      <button class="btn btn-primary auto" id="sNext">Próxima ›</button>
      <button class="btn btn-primary auto" id="sFinish" style="display:none">Entregar prova</button>
    </div>
  </div>`;

  const sheet=host.querySelector("#sheet"), qhost=host.querySelector("#qhost"),
        pbar=host.querySelector("#pbar"), clock=host.querySelector("#sClock");

  function fmtClock(s){ return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; }

  if (totalSec){
    timer = setInterval(()=>{
      remaining--;
      clock.textContent = fmtClock(Math.max(0,remaining));
      if (remaining === 60) toast("⏰ 1 minuto restante!");
      if (remaining <= 0){ clearInterval(timer); finish(); }
    }, 1000);
  }

  function renderSheet(){
    sheet.innerHTML = qs.map((_,i)=>`<button class="cell ${i===idx?'cur':''} ${answers[i]?'ok':''} ${marked.has(i)?'mk':''}" data-i="${i}">${i+1}</button>`).join("");
    sheet.querySelectorAll(".cell").forEach(c=>c.onclick=()=>{ idx=parseInt(c.dataset.i); renderQ(); });
  }

  function renderQ(){
    const q = qs[idx];
    const alts = (q.question_alternatives||[]).sort((a,b)=>a.display_order-b.display_order);
    pbar.style.width = (answers.filter(Boolean).length/qs.length*100)+"%";
    qhost.innerHTML = "";
    const block = h(`<div class="q-block">
      <div class="qk">Questão ${idx+1} de ${qs.length} · ${esc(q.primary_subject)} · ENEM ${q.year}</div>
      <div class="q q-enem">${mdStatement(q.statement)}</div>
      <div class="options">${alts.map(a=>`<button class="opt ${answers[idx]===a.letter?'picked':''}" data-l="${a.letter}"><span class="key">${a.letter}</span><span>${esc(a.content)}</span></button>`).join("")}</div>
    </div>`);
    qhost.appendChild(block);
    block.querySelectorAll(".opt").forEach(o=>o.onclick=()=>{
      answers[idx] = o.dataset.l;
      block.querySelectorAll(".opt").forEach(x=>x.classList.remove("picked"));
      o.classList.add("picked");
      renderSheet();
      pbar.style.width = (answers.filter(Boolean).length/qs.length*100)+"%";
      host.querySelector("#sFinish").style.display = answers.every(Boolean) ? "" : "none";
    });
    renderSheet();
    host.querySelector("#sPrev").disabled = idx===0;
    host.querySelector("#sNext").disabled = idx===qs.length-1;
  }

  host.querySelector("#sPrev").onclick=()=>{ if(idx>0){idx--; renderQ();} };
  host.querySelector("#sNext").onclick=()=>{ if(idx<qs.length-1){idx++; renderQ();} };
  host.querySelector("#sMark").onclick=()=>{ marked.has(idx)?marked.delete(idx):marked.add(idx); renderSheet(); };
  host.querySelector("#sQuit").onclick=()=>{ if(confirm("Abandonar o simulado? Seu progresso não será salvo.")){ clearInterval(timer); location.reload(); } };
  // entregar mesmo sem responder tudo (após 50%)
  const foot=host.querySelector(".sim-foot");
  const early=h(`<button class="btn btn-ghost auto" id="sEarly">Entregar</button>`);
  foot.appendChild(early);
  early.onclick=()=>{ if(confirm("Entregar a prova agora? Questões em branco contam como erro.")) finish(); };

  async function finish(){
    clearInterval(timer);
    const tempo = Math.min(Math.round((Date.now()-t0)/1000), 3600*3);
    let acertos = 0;
    const detalhes = qs.map((q,i)=>{
      const ok = answers[i]===q.correct_answer;
      if (ok) acertos++;
      const alts=(q.question_alternatives||[]);
      const altText={}; alts.forEach(a=>altText[a.letter]=a.content);
      logAttempt({ origem:"simulado", ref:q.external_id||q.id, materia:q.primary_subject, topico:q.topic,
        correta:ok, resposta:answers[i], correta_resp:q.correct_answer });
      if (!ok) logError({ origem:"simulado", ref:String(q.id), enunciado:q.statement,
        resposta_aluno: answers[i]?answers[i]+") "+(altText[answers[i]]||""):"(em branco)",
        resposta_correta:q.correct_answer+") "+(altText[q.correct_answer]||""),
        explicacao:`ENEM ${q.year}, questão ${q.original_number} — gabarito oficial INEP.`,
        materia:q.primary_subject, topico:q.topic });
      return { q:q.external_id||q.id, materia:q.primary_subject, topico:q.topic, resp:answers[i], gab:q.correct_answer, ok };
    });
    const uid = state.session.user.id;
    await sb.from("simulation_attempts").insert({
      user_id: uid, tipo: cfg.materia==="Mix"?"rapido":"materia",
      filtros: { materia: cfg.materia }, total: qs.length, acertos,
      tempo_seg: tempo, detalhes
    });
    const ganho = acertos*10;
    if (ganho>0) await addXP(ganho, "simulado", "sim-"+Date.now());
    await bumpStreak();
    const pct = Math.round(acertos/qs.length*100);
    if (pct>=70) confetti();

    // relatório por matéria
    const byMat = {};
    detalhes.forEach(d=>{ byMat[d.materia]=byMat[d.materia]||{t:0,a:0}; byMat[d.materia].t++; if(d.ok) byMat[d.materia].a++; });
    const matHtml = Object.entries(byMat).map(([m,x])=>{
      const p=Math.round(x.a/x.t*100);
      return `<div class="perf-row"><span class="pm">${esc(m)}</span><div class="pbar"><i style="width:${p}%"></i></div><span class="pv">${x.a}/${x.t}</span></div>`;
    }).join("");

    host.innerHTML = `<div class="done-screen">
      <div class="trophy">${pct>=90?"🏆":pct>=70?"🎉":pct>=50?"👊":"📚"}</div>
      <h1 class="serif">${acertos} de ${qs.length}</h1>
      <p style="color:var(--text-dim)">Tempo: ${Math.floor(tempo/60)}min ${tempo%60}s · média ${Math.round(tempo/qs.length)}s por questão</p>
      <div class="done-stats">
        <div class="box glass"><div class="v holo-text">${pct}%</div><div class="l">Aproveitamento</div></div>
        <div class="box glass"><div class="v" style="color:var(--iris-2)">+${ganho}</div><div class="l">XP</div></div>
      </div>
      <div class="perf-block glass">${matHtml}</div>
      <p style="font-size:.85rem;color:var(--text-dim);margin:.8rem 0">Os erros foram adicionados ao seu Caderno de Erros para revisão. 📓</p>
      <button class="btn btn-primary" onclick="location.hash='#/revisao'">Revisar erros</button>
      <button class="btn btn-ghost" onclick="location.reload()" style="margin-top:.6rem">Novo simulado</button>
    </div>`;
  }

  renderQ();
}

// ============================================================
// DESEMPENHO — mapa de domínio + evolução
// ============================================================
async function viewDesempenho(){
  const v = appShell("desempenho", `
    <div class="hello"><p class="k">Seus números reais</p><h1 class="serif">Desempenho</h1></div>
    <div id="perfHost"><div class="loading-inline"><div class="spinner"></div></div></div>
  `);
  const host = v.querySelector("#perfHost");
  const since = new Date(Date.now()-6*864e5); since.setHours(0,0,0,0);
  const [{ data: attempts }, { data: events }] = await Promise.all([
    sb.from("question_attempts").select("materia,topico,correta,created_at").order("created_at",{ascending:false}).limit(2000),
    sb.from("xp_events").select("amount,created_at").gte("created_at", since.toISOString()),
  ]);

  const at = attempts||[];
  if (!at.length){
    host.innerHTML = '<div class="empty">Ainda não há dados suficientes. Resolva algumas lições ou questões do banco ENEM e volte aqui. 📈</div>';
    return;
  }

  // por matéria
  const byMat={};
  at.forEach(a=>{ if(!a.materia) return; byMat[a.materia]=byMat[a.materia]||{t:0,a:0}; byMat[a.materia].t++; if(a.correta) byMat[a.materia].a++; });
  const matHtml = Object.entries(byMat).sort((x,y)=>y[1].t-x[1].t).map(([m,x])=>{
    const p=Math.round(x.a/x.t*100);
    const s=SUBJECTS.find(s=>s.nome===m);
    return `<div class="perf-row"><span class="pm">${s?s.simbolo+" ":""}${esc(m)}</span>
      <div class="pbar"><i style="width:${p}%;background:${s?SUBJ_GRAD(s.hue):'var(--holo)'}"></i></div>
      <span class="pv">${p}% · ${x.t}q</span></div>`;
  }).join("");

  // XP últimos 7 dias
  const days=[...Array(7)].map((_,i)=>{ const d=new Date(Date.now()-(6-i)*864e5); return d.toISOString().slice(0,10); });
  const xpByDay={}; days.forEach(d=>xpByDay[d]=0);
  (events||[]).forEach(e=>{ const d=e.created_at.slice(0,10); if(d in xpByDay) xpByDay[d]+=e.amount; });
  const maxXp=Math.max(...Object.values(xpByDay),1);
  const chartHtml = days.map(d=>{
    const val=xpByDay[d];
    const label=["D","S","T","Q","Q","S","S"][new Date(d+"T12:00:00").getDay()];
    return `<div class="bar"><i style="height:${Math.max(4,Math.round(val/maxXp*100))}%" title="${val} XP"></i><span>${label}</span></div>`;
  }).join("");

  // mapa de domínio (topic_stats + nome da lição)
  const domHtml = Object.values(state.topics).map(ts=>{
    const meta=TOPIC_LESSON[ts.topic_id]; if(!meta) return "";
    const tot=(ts.acertos||0)+(ts.erros||0); if(!tot) return "";
    const taxa=ts.acertos/tot;
    const cls = taxa>=0.8?"dom":taxa>=0.5?"dev":"rev";
    const lbl = taxa>=0.8?"Dominado":taxa>=0.5?"Em desenvolvimento":"Precisa revisar";
    return `<div class="dom-cell ${cls}" data-l="${meta.licao.id}" title="${lbl} · ${Math.round(taxa*100)}%">
      <span class="dn">${esc(meta.licao.titulo)}</span><span class="dl">${esc(meta.subject.nome)} · ${Math.round(taxa*100)}%</span></div>`;
  }).filter(Boolean).join("");

  const taxaGeral = Math.round(at.filter(a=>a.correta).length/at.length*100);
  host.innerHTML = `
    <div class="stat-grid">
      <div class="box glass"><div class="v holo-text">${at.length}</div><div class="l">Questões</div></div>
      <div class="box glass"><div class="v" style="color:var(--iris-3)">${taxaGeral}%</div><div class="l">Taxa de acerto</div></div>
      <div class="box glass"><div class="v" style="color:var(--iris-5)">🔥 ${state.stats.melhor_streak||0}</div><div class="l">Melhor streak</div></div>
    </div>
    <div class="section-title"><h2>Por matéria</h2></div>
    <div class="perf-block glass">${matHtml}</div>
    <div class="section-title"><h2>XP nos últimos 7 dias</h2></div>
    <div class="chart glass">${chartHtml}</div>
    <div class="section-title"><h2>Mapa de domínio</h2>
      <span class="s"><i class="lg dom"></i> dominado <i class="lg dev"></i> desenvolvendo <i class="lg rev"></i> revisar</span></div>
    <div class="dom-grid">${domHtml||'<div class="empty">Complete lições para mapear seu domínio por assunto.</div>'}</div>
  `;
  host.querySelectorAll(".dom-cell").forEach(c=>c.onclick=()=>navigate("/licao/"+c.dataset.l));
}

// ============================================================
// BOOT
// ============================================================
async function boot(){
  initTheme();
  const { data:{ session } } = await sb.auth.getSession();
  state.session = session;
  if (session){ try{ await loadUserData(); }catch(e){ console.error(e); } }

  sb.auth.onAuthStateChange(async (event, session)=>{
    const wasLogged = !!state.session;
    state.session = session;
    if (session && !wasLogged){
      try{ await loadUserData(); }catch(e){ console.error(e); }
      if (/^#\/(login|cadastro|confirmar|esqueci)?$/.test(location.hash) || !location.hash) navigate("/inicio");
      else router();
    } else if (!session && wasLogged){
      state.profile=null; state.stats=null; state.lessons={}; state.topics={};
      navigate("/login");
    } else {
      router();
    }
  });

  window.addEventListener("hashchange", router);
  router();
}

boot();
