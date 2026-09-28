// ============================================================
// PROJETO DELTA · entrada (login, cadastro, senha) e primeiro acesso
// ============================================================
import { sb, state, root, navigate, loadUserData, updateTop } from "./core.js";
import { deltaSVG, fundoSVG, logoSVG, CORES } from "./mascot.js";
import { ic } from "./icons.js";
import { h, esc, sleep, typeText, react, confetti, coinBurst, reduceMotion } from "./ui.js";
import { sfx } from "./sfx.js";
import { csChegada } from "./cutscene.js";

const redirect = p => location.origin + location.pathname + "#" + p;

function authShell(title, fala, inner) {
  const w = h(`<div class="auth">
    <div class="auth-hero">
      <a class="brand" href="../" aria-label="Voltar ao site do Projeto Delta">${logoSVG({ word: true, bg: "#2a0a5c" })}</a>
      <div class="dm dm-live" id="hdm">${deltaSVG({ cor: "teal", expr: "feliz" })}</div>
      <p>${fala}</p>
    </div>
    <div class="auth-card"><h1>${title}</h1><div class="msg" role="alert"></div>${inner}</div>
  </div>`);
  root().replaceChildren(w);
  w.querySelectorAll("[data-eye]").forEach(b => b.onclick = () => {
    const i = b.parentElement.querySelector("input"); const show = i.type === "password";
    i.type = show ? "text" : "password"; b.innerHTML = ic(show ? "x" : "eye"); b.setAttribute("aria-label", show ? "Esconder senha" : "Mostrar senha");
  });
  return w;
}
const field = (id, label, icon, type, ph, ac, extra = "") => `<div class="field"><label for="${id}">${label}</label>
  <div class="input">${ic(icon)}<input id="${id}" type="${type}" placeholder="${ph}" autocomplete="${ac}" ${extra} />${type === "password" ? `<button type="button" class="eye" data-eye aria-label="Mostrar senha">${ic("eye")}</button>` : ""}</div></div>`;

function msg(w, kind, text) {
  const m = w.querySelector(".msg"); m.className = "msg show " + kind; m.textContent = text;
  const d = w.querySelector("#hdm"); if (d) react(d, { cor: "teal" }, kind === "err" ? "triste" : "comemorando", kind === "err" ? "shake" : "jump");
}
const limitado = e => !!e && (e.status === 429 || /rate.?limit|too many|over_.*_rate|security purposes|throttl/i.test((e.code || "") + " " + (e.message || "")));
// Muitos alunos saem pelo mesmo IP da escola: em vez de falhar, espera e tenta de novo.
async function comRetentativa(w, fn, tentativas = 4) {
  let r;
  for (let i = 0; i < tentativas; i++) {
    r = await fn();
    if (!limitado(r.error) || i === tentativas - 1) return r;
    msg(w, "ok", "Muita gente entrando agora, tentando de novo…");
    await sleep(1500 * 2 ** i + Math.random() * 1000);
  }
  return r;
}
function busy(b, on, label) { b.disabled = on; if (label) b.textContent = label; }

export function viewLogin() {
  const w = authShell("Bom te ver de novo", "Sua trilha de Matemática continua de onde você parou.", `
    <form id="f" novalidate>
      ${field("email", "E-mail escolar", "mail", "email", "voce@escola.edu.br", "email", 'inputmode="email" required')}
      ${field("senha", "Senha", "lock", "password", "Sua senha", "current-password", "required")}
      <button class="btn btn-lime btn-block" id="go" type="submit">Entrar</button>
    </form>
    <p class="auth-alt"><a class="link" href="#/esqueci">Esqueci minha senha</a></p>
    <p class="auth-alt">Primeira vez aqui? <a class="link" href="#/cadastro">Criar conta grátis</a></p>`);
  const go = w.querySelector("#go");
  w.querySelector("#f").onsubmit = async e => {
    e.preventDefault(); sfx.unlock();
    const email = w.querySelector("#email").value.trim(), senha = w.querySelector("#senha").value;
    if (!email || !senha) return msg(w, "err", "Preencha e-mail e senha.");
    busy(go, true, "Entrando...");
    const { error } = await comRetentativa(w, () => sb.auth.signInWithPassword({ email, password: senha }));
    busy(go, false, "Entrar");
    if (limitado(error)) return msg(w, "err", "Muitos acessos ao mesmo tempo. Espere um minutinho e tente de novo.");
    if (error) return msg(w, "err", /not confirmed/i.test(error.message) ? "Seu e-mail ainda não foi confirmado. Abra o link que enviamos para ativar a conta." : "E-mail ou senha incorretos.");
    sfx.correct();
  };
}

export function viewCadastro() {
  const w = authShell("Crie sua conta", "Grátis, feita para o 2º dia do ENEM. Leva menos de um minuto.", `
    <form id="f" novalidate>
      ${field("nome", "Seu nome", "user", "text", "Como você se chama", "name", 'maxlength="60" required')}
      ${field("escola", "Escola", "school", "text", "Ex.: CEMEP", "organization", 'maxlength="80"')}
      ${field("email", "E-mail escolar", "mail", "email", "voce@escola.edu.br", "email", 'inputmode="email" required')}
      <p class="field hint" style="margin-top:-.5rem">Aceitamos e-mails escolares: .edu, .edu.br, .escola.br e .aluno.br.</p>
      ${field("senha", "Senha", "lock", "password", "Mínimo de 8 caracteres", "new-password", 'minlength="8" required')}
      <button class="btn btn-lime btn-block" id="go" type="submit">Criar conta</button>
    </form>
    <p class="auth-alt">Já tem conta? <a class="link" href="#/login">Entrar</a></p>`);
  const go = w.querySelector("#go");
  w.querySelector("#f").onsubmit = async e => {
    e.preventDefault(); sfx.unlock();
    const v = id => w.querySelector("#" + id).value.trim();
    const nome = v("nome"), escola = v("escola"), email = v("email"), senha = w.querySelector("#senha").value;
    if (!nome || !email || !senha) return msg(w, "err", "Preencha nome, e-mail e senha.");
    if (senha.length < 8) return msg(w, "err", "A senha precisa de pelo menos 8 caracteres.");
    busy(go, true, "Criando...");
    const { data, error } = await comRetentativa(w, () => sb.auth.signUp({ email, password: senha, options: { data: { nome, escola }, emailRedirectTo: redirect("/confirmar") } }));
    busy(go, false, "Criar conta");
    if (limitado(error)) return msg(w, "err", "Muitos cadastros ao mesmo tempo. Espere um minutinho e tente de novo; sua conta ainda não foi criada.");
    if (!error && data && data.session) { sfx.correct(); return; } // sem confirmação por e-mail: o listener de auth leva ao onboarding
    if (error) return msg(w, "err", /school|escolar|403|not allowed|invalid/i.test(error.message + (error.status || "")) ?
      "Use um e-mail escolar válido (.edu, .edu.br, .escola.br ou .aluno.br)." : (error.message || "Não deu para criar a conta agora."));
    try { sessionStorage.setItem("delta-signup-email", email); } catch (x) {}
    navigate("/confirmar");
  };
}

export function viewConfirmar() {
  let email = ""; try { email = sessionStorage.getItem("delta-signup-email") || ""; } catch (x) {}
  const w = authShell("Confirme seu e-mail", "Falta só um clique para a gente decolar.", `
    <p class="muted" style="font-weight:700;margin-bottom:1rem">Enviamos um link de ativação${email ? ` para <b>${esc(email)}</b>` : ""}. Abra o e-mail e toque no link. Se não achar, confira o spam.</p>
    <button class="btn btn-block" id="re">${ic("mail")} Reenviar e-mail</button>
    <p class="auth-alt">Já confirmou? <a class="link" href="#/login">Entrar</a></p>`);
  w.querySelector("#re").onclick = async e => {
    if (!email) return msg(w, "err", "Volte ao cadastro e informe seu e-mail.");
    e.currentTarget.disabled = true;
    const { error } = await sb.auth.resend({ type: "signup", email, options: { emailRedirectTo: redirect("/confirmar") } });
    if (error) { msg(w, "err", "Não deu para reenviar agora. Tente de novo em instantes."); e.target.disabled = false; }
    else msg(w, "ok", "Pronto, reenviamos. Olhe também a caixa de spam.");
  };
}

export function viewEsqueci() {
  const w = authShell("Recuperar senha", "Acontece com todo mundo. Vamos resolver.", `
    <form id="f" novalidate>${field("email", "E-mail da conta", "mail", "email", "voce@escola.edu.br", "email", 'inputmode="email"')}
    <button class="btn btn-lime btn-block" id="go" type="submit">Enviar link</button></form>
    <p class="auth-alt"><a class="link" href="#/login">Voltar para o login</a></p>`);
  const go = w.querySelector("#go");
  w.querySelector("#f").onsubmit = async e => {
    e.preventDefault();
    const email = w.querySelector("#email").value.trim(); if (!email) return msg(w, "err", "Informe seu e-mail.");
    busy(go, true, "Enviando...");
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: redirect("/redefinir") });
    busy(go, false, "Enviar link");
    if (error) msg(w, "err", "Não deu para enviar agora. Tente de novo.");
    else msg(w, "ok", "Se esse e-mail tiver conta, o link de redefinição já está a caminho.");
  };
}

export function viewRedefinir() {
  const w = authShell("Nova senha", "Escolha uma senha forte e siga em frente.", `
    <form id="f" novalidate>${field("s1", "Nova senha", "lock", "password", "Mínimo de 8 caracteres", "new-password")}
    ${field("s2", "Repita a senha", "lock", "password", "Igual à de cima", "new-password")}
    <button class="btn btn-lime btn-block" id="go" type="submit">Salvar senha</button></form>
    <p class="auth-alt"><a class="link" href="#/login">Voltar para o login</a></p>`);
  if (!state.session) msg(w, "err", "Abra esta tela pelo link enviado ao seu e-mail.");
  const go = w.querySelector("#go");
  w.querySelector("#f").onsubmit = async e => {
    e.preventDefault();
    const s1 = w.querySelector("#s1").value, s2 = w.querySelector("#s2").value;
    if (s1.length < 8) return msg(w, "err", "A senha precisa de pelo menos 8 caracteres.");
    if (s1 !== s2) return msg(w, "err", "As senhas não são iguais.");
    busy(go, true, "Salvando...");
    const { error } = await sb.auth.updateUser({ password: s1 });
    busy(go, false, "Salvar senha");
    if (error) return msg(w, "err", error.message || "Não deu para salvar.");
    msg(w, "ok", "Senha nova salva. Entrando...");
    setTimeout(() => navigate("/inicio"), 1100);
  };
}

// ============================================================
// PRIMEIRO ACESSO: criar o astronauta, nome, @ e meta
// ============================================================
const INICIAIS = [[null, "Visual oficial"], ["capacete-astro", "Capacete branco"], ["bone-azul", "Boné azul"], ["tiara", "Tiara"]];
const METAS = [[20, "Casual", "5 min por dia", "idle"], [50, "Regular", "10 min por dia", "feliz"], [100, "Intenso", "20 min por dia", "comemorando"]];

export function viewOnboarding(onDone) {
  const nome0 = (state.profile?.nome || "").trim();
  const d = { nome: nome0, user: "", cor: "teal", ini: null, meta: 50 };
  let step = 0, userOk = false, chkT;
  const TOTAL = 6;
  const w = h(`<div class="ob"><div class="ob-top"><button class="back" aria-label="Voltar" hidden>${ic("back")}</button><div class="pbar"><i></i></div></div><div class="ob-body"></div></div>`);
  root().replaceChildren(w);
  const body = w.querySelector(".ob-body"), back = w.querySelector(".back");
  back.onclick = () => { if (step > 0) { step--; sfx.whoosh(); render(); } };
  body.style.cssText = "flex:1;display:flex;flex-direction:column";
  const look = () => ({ cor: d.cor, cabeca: d.ini === "tiara" || d.ini === "bone-azul" || d.ini === "capacete-astro" ? d.ini : null, fundo: "espaco" });

  function tilt(stage) {
    if (reduceMotion() || !stage) return;
    const m = stage.querySelector(".dm"); stage.style.perspective = "700px"; m.style.transition = "transform .25s";
    stage.addEventListener("pointermove", e => { const r = stage.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      m.style.transform = `rotateY(${x * 28}deg) rotateX(${-y * 16}deg) translateZ(20px)`; });
    stage.addEventListener("pointerleave", () => m.style.transform = "");
  }

  async function render() {
    back.hidden = step <= 1 || step === TOTAL - 1;
    w.querySelector(".pbar i").style.width = Math.round(step / (TOTAL - 1) * 100) + "%";
    const S = [intro, nome, cor, item, meta, fim][step];
    body.innerHTML = `<div class="ob-step">${S.html()}</div>`;
    S.bind && S.bind(body.firstElementChild);
  }
  const next = () => { sfx.whoosh(); step++; render(); };

  const intro = {
    html: () => `<div class="big-talk"><div class="dm dm-live popin" id="m">${deltaSVG({ cor: "teal", expr: "feliz" })}</div><div class="bubble" id="t"></div></div>
      <div class="ob-foot"><button class="btn btn-lime btn-block" id="n">Bora montar</button></div>`,
    async bind(el) { sfx.unlock(); sfx.whoosh(); await sleep(250);
      typeText(el.querySelector("#t"), `Oi${nome0 ? ", " + nome0.split(" ")[0] : ""}! Eu sou o Delta, seu parceiro de Matemática para o ENEM. Antes da primeira missão, vamos montar o seu astronauta.`);
      el.querySelector("#n").onclick = next; }
  };
  const nome = {
    html: () => `<h1>Como a gente te chama?</h1><p class="lead">Seu nome aparece no perfil. O @ aparece no ranking.</p>
      <div style="margin-top:1.2rem">
      <div class="field"><label for="nm">Nome</label><div class="input">${ic("user")}<input id="nm" maxlength="60" autocomplete="given-name" value="${esc(d.nome)}" placeholder="Seu nome" /></div></div>
      <div class="field"><label for="us">Nome de usuário</label><div class="input">${ic("at")}<input id="us" maxlength="20" autocapitalize="off" autocomplete="username" spellcheck="false" value="${esc(d.user)}" placeholder="ex.: ana_delta" /></div>
      <p class="hint" id="uh">3 a 20 caracteres: letras minúsculas, números e _</p></div></div>
      <div class="talk" style="margin-top:auto"><div class="dm dm-live" id="m">${deltaSVG({ cor: d.cor, expr: "pensando" })}</div><div class="bubble left" id="b">Escolha um @ curto. Fica mais fácil de achar no ranking.</div></div>
      <div class="ob-foot"><button class="btn btn-lime btn-block" id="n" disabled>Continuar</button></div>`,
    bind(el) {
      const nm = el.querySelector("#nm"), us = el.querySelector("#us"), uh = el.querySelector("#uh"), n = el.querySelector("#n");
      if (!d.user && nome0) d.user = nome0.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 14) + "_" + Math.floor(Math.random() * 90 + 10);
      us.value = d.user;
      const valid = () => { n.disabled = !(nm.value.trim() && userOk); };
      async function check() {
        const v = us.value.trim().toLowerCase(); d.user = v; userOk = false; valid();
        if (!/^[a-z0-9_]{3,20}$/.test(v)) { uh.className = "hint bad"; uh.textContent = "Use 3 a 20 caracteres: letras minúsculas, números e _"; return; }
        uh.className = "hint"; uh.textContent = "Conferindo...";
        const { data, error } = await sb.rpc("username_available", { p_username: v });
        if (v !== d.user) return;
        if (error) { uh.className = "hint bad"; uh.textContent = "Não deu para conferir agora. Tente de novo."; return; }
        userOk = !!data; uh.className = "hint " + (data ? "ok" : "bad"); uh.textContent = data ? `@${v} está livre` : `@${v} já tem dono. Tente outro.`;
        if (data) sfx.select(); valid();
      }
      us.oninput = () => { us.value = us.value.toLowerCase().replace(/[^a-z0-9_]/g, ""); clearTimeout(chkT); chkT = setTimeout(check, 350); };
      nm.oninput = () => { d.nome = nm.value; valid(); };
      check();
      n.onclick = () => { d.nome = nm.value.trim(); next(); };
    }
  };
  const cor = {
    html: () => `<h1>Escolha o brilho do seu visor</h1><p class="lead">A cor aparece nos olhos Δ Δ e nos detalhes neon.</p>
      <div class="stage">${fundoSVG("espaco")}<div class="dm dm-live" id="m">${deltaSVG({ ...look(), cabeca: null, expr: "feliz" })}</div></div>
      <div class="swatches" role="radiogroup" aria-label="Cor">${Object.entries(CORES).map(([k, c]) => `<button role="radio" aria-checked="${k === d.cor}" aria-label="${c.n}" class="${k === d.cor ? "on" : ""}" data-c="${k}" style="--c:${c.g}"></button>`).join("")}</div>
      <p class="lead" style="text-align:center" id="cn">${CORES[d.cor].n}</p>
      <div class="ob-foot"><button class="btn btn-lime btn-block" id="n">Gostei desse</button></div>`,
    bind(el) {
      tilt(el.querySelector(".stage"));
      el.querySelectorAll("[data-c]").forEach(b => b.onclick = () => {
        d.cor = b.dataset.c; sfx.select();
        el.querySelectorAll("[data-c]").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); });
        el.querySelector("#cn").textContent = CORES[d.cor].n;
        react(el.querySelector("#m"), { ...look(), cabeca: null }, "comemorando", "jump");
      });
      el.querySelector("#n").onclick = next;
    }
  };
  const item = {
    html: () => `<h1>Quer um item de presente?</h1><p class="lead">Fique com o visual oficial ou escolha um item grátis. Depois você compra muito mais na loja.</p>
      <div class="stage">${fundoSVG("espaco")}<div class="dm dm-live" id="m">${deltaSVG({ ...look(), expr: "feliz" })}</div></div>
      <div class="picks">${INICIAIS.map(([id, n]) => `<button class="pick ${d.ini === id ? "on" : ""}" data-i="${id || ""}"><div class="dm">${deltaSVG({ cor: d.cor, cabeca: id, expr: "idle" })}</div>${n}</button>`).join("")}</div>
      <div class="ob-foot"><button class="btn btn-lime btn-block" id="n">Continuar</button></div>`,
    bind(el) {
      tilt(el.querySelector(".stage"));
      el.querySelectorAll("[data-i]").forEach(b => b.onclick = () => {
        d.ini = b.dataset.i || null; sfx.select();
        el.querySelectorAll("[data-i]").forEach(x => x.classList.toggle("on", x === b));
        react(el.querySelector("#m"), look(), "surpreso", "popin");
      });
      el.querySelector("#n").onclick = next;
    }
  };
  const meta = {
    html: () => `<h1>Qual o seu ritmo?</h1><p class="lead">A meta diária é de XP. Dá para mudar quando quiser.</p>
      <div class="goals">${METAS.map(([v, n, t, e]) => `<button class="goal ${d.meta === v ? "on" : ""}" data-m="${v}"><div class="dm">${deltaSVG({ ...look(), expr: e })}</div><div><b>${n}</b><small>${t}</small></div><span class="xp">${v} XP</span></button>`).join("")}</div>
      <p class="muted" style="font-weight:700;margin-top:1rem">Quem estuda um pouco todo dia lembra mais na prova do que quem estuda muito de uma vez.</p>
      <div class="ob-foot" style="margin-top:auto"><button class="btn btn-lime btn-block" id="n">Tudo pronto</button></div>`,
    bind(el) {
      el.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { d.meta = +b.dataset.m; sfx.select(); el.querySelectorAll("[data-m]").forEach(x => x.classList.toggle("on", x === b)); });
      el.querySelector("#n").onclick = save;
    }
  };
  async function save(e) {
    const b = e.currentTarget; b.disabled = true; b.textContent = "Preparando a nave...";
    const { data, error } = await sb.rpc("complete_onboarding", { p_nome: d.nome, p_username: d.user, p_cor: d.cor, p_inicial: d.ini, p_meta: d.meta });
    if (error || !data?.ok) {
      b.disabled = false; b.textContent = "Tudo pronto";
      const r = data?.reason;
      if (r === "username_taken" || r === "username_fmt") { step = 1; userOk = false; render(); return; }
      if (r === "done") { await loadUserData(); onDone(); return; }
      const m = h(`<p class="hint bad" style="text-align:center;margin-top:.6rem">Não deu para salvar agora. Confira a conexão e tente de novo.</p>`); b.after(m); return;
    }
    await loadUserData();
    next();
  }
  const fim = {
    html: () => `<div class="big-talk"><div class="stage" style="width:min(320px,80vw)">${fundoSVG("galaxia")}<div class="dm dm-live" id="m">${deltaSVG({ ...state.profile.avatar, expr: "comemorando" })}</div></div>
      <div class="bubble" id="t"></div></div>
      <div class="ob-foot"><button class="btn btn-lime btn-block" id="n">Começar a primeira lição</button></div>`,
    async bind(el) {
      sfx.levelup(); confetti(160);
      const stage = el.querySelector(".stage"); stage.style.cssText += ";aspect-ratio:1;display:grid;place-items:end center;border-radius:28px;overflow:hidden;position:relative;border:2px solid var(--line)";
      stage.querySelector(".dm").style.cssText = "width:62%;margin-bottom:-3%";
      tilt(stage);
      await typeText(el.querySelector("#t"), `Ficou incrível, @${d.user}! Aqui vão 100 Deltas de boas-vindas. Use na loja ou para pedir dicas nas questões.`);
      const fake = h(`<span class="chip coins" style="position:fixed;top:16px;right:16px;z-index:90">Δ 100</span>`); document.body.appendChild(fake);
      coinBurst(100, el.querySelector(".bubble")); setTimeout(() => fake.remove(), 1600);
      el.querySelector("#n").onclick = () => { sfx.tap(); onDone(); updateTop(); };
    }
  };
  csChegada({ cor: "teal" }, nome0.split(" ")[0]).then(() => { step = 1; render(); });
}
