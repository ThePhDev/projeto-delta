/* Instalar o Projeto Delta como app (PWA): Android usa o prompt nativo, iOS mostra o passo a passo */
(function () {
  var standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  var ua = navigator.userAgent;
  var ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var mobile = ios || /android/i.test(ua) || matchMedia("(pointer:coarse)").matches;
  var deferred = null;

  if ("serviceWorker" in navigator) addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
  if (standalone) return;

  function enable() { document.documentElement.classList.add("can-install"); }
  if (mobile) enable();
  addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; enable(); });
  addEventListener("appinstalled", function () { deferred = null; document.documentElement.classList.remove("can-install"); });

  function sheet(title, steps) {
    var s = document.createElement("div");
    s.className = "isheet"; s.setAttribute("role", "dialog"); s.setAttribute("aria-modal", "true"); s.setAttribute("aria-label", title);
    s.innerHTML = '<div class="p"><h3></h3><ol></ol><button class="x" type="button">Entendi</button></div>';
    s.querySelector("h3").textContent = title;
    var ol = s.querySelector("ol");
    steps.forEach(function (st) { var li = document.createElement("li"); li.innerHTML = st; ol.appendChild(li); });
    function close() { s.remove(); document.removeEventListener("keydown", key); }
    function key(e) { if (e.key === "Escape") close(); }
    s.addEventListener("click", function (e) { if (e.target === s) close(); });
    s.querySelector(".x").addEventListener("click", close);
    document.addEventListener("keydown", key);
    document.body.appendChild(s);
    s.querySelector(".x").focus();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-install]"); if (!b) return;
    e.preventDefault();
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.finally(function () { deferred = null; });
      return;
    }
    if (ios) sheet("Instalar no iPhone", [
      "Abra este site no <b>Safari</b>.",
      "Toque em <b>Compartilhar</b>, o quadrado com a seta para cima.",
      "Escolha <b>Adicionar à Tela de Início</b> e confirme em <b>Adicionar</b>.",
      "Pronto: o Delta aparece na sua tela como um app."
    ]);
    else sheet("Instalar no celular", [
      "Abra este site no <b>Chrome</b>.",
      "Toque no menu <b>⋮</b> no canto superior.",
      "Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.",
      "Pronto: o Delta aparece na sua tela como um app."
    ]);
  });
})();
