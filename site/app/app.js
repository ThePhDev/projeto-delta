// ============================================================
// PROJETO DELTA · APP — roteador e inicialização
// ============================================================
import { sb, state, root, navigate, loadUserData, initTheme } from "./core.js";
import { viewLogin, viewCadastro, viewConfirmar, viewEsqueci, viewRedefinir, viewOnboarding } from "./auth.js";
import { viewInicio, viewLicao, startTreino, viewEnem, viewSimulados } from "./learn.js";
import { viewPraticar, viewLoja, viewPerfil, viewRanking, viewMissoes, viewErros, viewPainel } from "./pages.js";
import { viewAdmin } from "./admin.js";
import { viewCronograma, viewDiagnostico } from "./plan.js";
import { deltaSVG } from "./mascot.js";
import { h, reduceMotion } from "./ui.js";
import { sfx } from "./sfx.js";

const PUBLIC = ["/login", "/cadastro", "/confirmar", "/esqueci", "/redefinir"];
const ROUTES = {
  "/inicio": () => viewInicio(), "/licao": p => viewLicao(p[1]), "/treino": p => startTreino(p[1] || "mix"),
  "/praticar": () => viewPraticar(), "/enem": () => viewEnem(), "/simulados": () => viewSimulados(),
  "/loja": () => viewLoja(), "/perfil": () => viewPerfil(), "/ranking": () => viewRanking(), "/missoes": () => viewMissoes(),
  "/erros": () => viewErros(), "/cronograma": () => viewCronograma(), "/diagnostico": () => viewDiagnostico(), "/painel": () => viewPainel(), "/tecnicas": () => navigate("/praticar"), "/admin": p => viewAdmin(p),
  // rotas antigas
  "/materias": () => navigate("/inicio"), "/trilha": () => navigate("/inicio"), "/revisao": () => navigate("/erros"), "/desempenho": () => navigate("/painel")
};

function route() {
  const parts = (location.hash.replace(/^#/, "") || "/").split("/").filter(Boolean);
  return { path: "/" + (parts[0] || ""), parts };
}

async function router() {
  document.querySelectorAll(".modal, .sheet, .coach").forEach(el => el.remove());
  const { path, parts } = route();
  if (path === "/redefinir") return viewRedefinir();
  if (!state.session) {
    if (!PUBLIC.includes(path)) return navigate("/login");
    return { "/login": viewLogin, "/cadastro": viewCadastro, "/confirmar": viewConfirmar, "/esqueci": viewEsqueci }[path]();
  }
  if (!state.loaded) { try { await loadUserData(); } catch (e) { console.error(e); return offline(); } }
  if (!state.profile.onboarding_ok) return viewOnboarding(() => navigate("/inicio"));
  const fn = ROUTES[path];
  if (!fn) return navigate("/inicio");
  try { await fn(parts); } catch (e) { console.error(e); offline(); }
}

function offline() {
  root().replaceChildren(h(`<div class="boot"><div style="text-align:center;padding:1rem;max-width:360px">
    <div class="dm dm-live" style="width:140px;margin:0 auto">${deltaSVG({ expr: "triste" })}</div>
    <h1 style="font-family:var(--display);font-size:1.3rem;margin-top:1rem">Perdi o sinal da base</h1>
    <p class="muted" style="font-weight:700;margin:.5rem 0 1rem">Não consegui falar com o servidor. Confira sua conexão e tente de novo.</p>
    <button class="btn btn-lime btn-block" id="rt">Tentar de novo</button></div></div>`));
  document.getElementById("rt").onclick = () => { state.loaded = false; router(); };
}

function go() {
  const run = () => { router(); window.scrollTo(0, 0); };
  if (document.startViewTransition && !reduceMotion()) document.startViewTransition(run); else run();
}

async function boot() {
  initTheme();
  addEventListener("pointerdown", () => sfx.unlock(), { once: true });
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  const { data: { session } } = await sb.auth.getSession();
  state.session = session;
  sb.auth.onAuthStateChange((event, s) => {
    const was = !!state.session;
    state.session = s;
    if (s && !was) { state.loaded = false; if (!location.hash || /^#\/(login|cadastro|confirmar|esqueci)?$/.test(location.hash)) navigate("/inicio"); else router(); }
    else if (!s && was) { Object.assign(state, { profile: null, stats: null, lessons: {}, topics: {}, loaded: false }); navigate("/login"); }
  });
  addEventListener("hashchange", go);
  router();
}

boot();
