/* Projeto Delta — scroll-film engine */
(function () {
  "use strict";

  var FRAME_COUNT = 143;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- smooth scroll (Lenis) ---------- */
  if (!reduceMotion && window.Lenis) {
    var lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 1.0, smoothWheel: true });
    window.lenisRef = lenis;
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  /* ---------- anchor navigation (works with/without Lenis, closes the menu first) ---------- */
  // alvos dentro do filme (capitulos ficam em posicoes de progresso do scroll, nao em ancoras)
  var CHAPTER_TARGETS = { "#problema": 0.25, "#plataforma": 0.50 };
  function smoothTo(target, dur) {
    if (window.lenisRef) window.lenisRef.scrollTo(target, { offset: 0, duration: dur || 1.6 });
    else if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
    else target.scrollIntoView({ behavior: "smooth" });
  }
  function goToAnchor(id) {
    if (CHAPTER_TARGETS[id]) {
      var j = document.getElementById("journey");
      var y = j.offsetTop + CHAPTER_TARGETS[id] * (j.offsetHeight - window.innerHeight);
      smoothTo(y, 1.9);
      return true;
    }
    var el = document.querySelector(id);
    if (el) { smoothTo(el, 1.6); return true; }
    return false;
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length <= 1) return;
      e.preventDefault();
      var ov = document.getElementById("overlay");
      var wasOpen = ov && ov.classList.contains("open");
      if (wasOpen && window.setMenuRef) window.setMenuRef(false);
      // espera o overlay liberar o scroll antes de navegar
      setTimeout(function () { goToAnchor(id); }, wasOpen ? 80 : 0);
    });
  });

  /* ---------- hero word split ---------- */
  var heroTitle = document.getElementById("heroTitle");
  var heroParts = [];
  Array.prototype.forEach.call(heroTitle.childNodes, function (n) {
    if (n.nodeType === 3) {
      n.textContent.trim().split(/\s+/).forEach(function (w) { if (w) heroParts.push(w); });
    } else if (n.nodeType === 1) {
      heroParts.push(n.outerHTML); // keep inline elements (ex.: logo do ENEM) intact
    }
  });
  heroTitle.innerHTML = heroParts.map(function (w, i) {
    return '<span class="w" style="--d:' + (0.35 + i * 0.1).toFixed(2) + 's">' + w + "</span>";
  }).join("");

  /* ---------- canvas ---------- */
  var canvas = document.getElementById("film");
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 820 ? 1.5 : 2);
  var curFrame = -1, pendingFrame = 0;

  function sizeCanvas() {
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    curFrame = -1; // force redraw
    drawFrame(pendingFrame);
  }

  var images = new Array(FRAME_COUNT);
  var loadedFlags = new Array(FRAME_COUNT);
  var loadedCount = 0;

  function src(i) { return "frames/f" + String(i).padStart(3, "0") + ".webp"; }

  function drawFrame(i) {
    pendingFrame = i;
    // fall back to the nearest loaded frame
    var j = i;
    if (!loadedFlags[j]) {
      for (var d = 1; d < FRAME_COUNT; d++) {
        if (loadedFlags[j - d]) { j = j - d; break; }
        if (loadedFlags[j + d]) { j = j + d; break; }
      }
      if (!loadedFlags[j]) return;
    }
    if (j === curFrame) return;
    curFrame = j;
    var img = images[j];
    var cw = canvas.width, ch = canvas.height;
    var s = Math.max(cw / img.width, ch / img.height);
    var w = img.width * s, h = img.height * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  /* ---------- loader ---------- */
  var loader = document.getElementById("loader");
  var loadbar = document.getElementById("loadbar");
  var loadpct = document.getElementById("loadpct");
  var released = false;

  function release() {
    if (released) return;
    released = true;
    loader.classList.add("done");
    document.getElementById("ch-hero").classList.add("armed");
    setTimeout(function () { loader.remove(); }, 1000);
  }

  function onImgLoad(i) {
    loadedFlags[i] = true;
    loadedCount++;
    var pct = Math.round((loadedCount / FRAME_COUNT) * 100);
    if (!released) {
      loadbar.style.width = pct + "%";
      loadpct.textContent = pct + "%";
    }
    if (i === pendingFrame || curFrame === -1) drawFrame(pendingFrame);
    // release once the opening stretch is ready
    var ready = true;
    for (var k = 0; k < 24; k++) { if (!loadedFlags[k]) { ready = false; break; } }
    if (ready) release();
  }

  // priority order: first 24 sequential, then spread, then fill
  var order = [];
  for (var i = 0; i < 24; i++) order.push(i);
  for (var i = 24; i < FRAME_COUNT; i += 6) order.push(i);
  for (var i = 24; i < FRAME_COUNT; i++) if ((i - 24) % 6 !== 0) order.push(i);

  var cursor = 0, inFlight = 0, MAX_PARALLEL = 8;
  function pump() {
    while (inFlight < MAX_PARALLEL && cursor < order.length) {
      (function (idx) {
        inFlight++;
        var img = new Image();
        img.decoding = "async";
        img.onload = function () { inFlight--; onImgLoad(idx); pump(); };
        img.onerror = function () { inFlight--; pump(); };
        img.src = src(idx);
        images[idx] = img;
      })(order[cursor++]);
    }
  }
  pump();
  setTimeout(release, 12000); // safety: never trap the user on the loader

  /* ---------- scroll orchestration ---------- */
  var journey = document.getElementById("journey");
  var chapters = Array.prototype.slice.call(document.querySelectorAll(".chapter")).map(function (el) {
    return {
      el: el,
      tIn: parseFloat(el.dataset.in),
      tHold: parseFloat(el.dataset.hold),
      tOut: parseFloat(el.dataset.out)
    };
  });
  var nav = document.getElementById("nav");
  var lightEl = document.getElementById("light");
  var fimEl = document.getElementById("fim");

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { return x * x * (3 - 2 * x); }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function update() {
    ticking = false;
    var rect = journey.getBoundingClientRect();
    var total = journey.offsetHeight - window.innerHeight;
    var p = clamp01(-rect.top / total);

    scrollFrame = Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1)));

    // chapters
    for (var c = 0; c < chapters.length; c++) {
      var ch = chapters[c];
      var o;
      if (p < ch.tIn) o = 0;
      else if (p < ch.tHold) o = ease(clamp01((p - ch.tIn) / (ch.tHold - ch.tIn)));
      else if (p < ch.tOut - 0.05) o = 1;
      else o = ease(clamp01((ch.tOut - p) / 0.05));
      ch.el.style.opacity = o.toFixed(3);
      ch.el.style.visibility = o < 0.02 ? "hidden" : "visible";
      if (!reduceMotion) {
        var drift = (p - ch.tIn) / (ch.tOut - ch.tIn); // 0..1 across life
        ch.el.querySelector(".inner").style.transform = "translateY(" + ((0.5 - drift) * 40).toFixed(1) + "px)";
      }
    }

    // nav theme + visibility
    var overLightFrames = rect.top <= 0 && rect.bottom > window.innerHeight && p > 0.7;
    var lr = lightEl.getBoundingClientRect();
    var fr = fimEl.getBoundingClientRect();
    var overLightWorld = lr.top < 70 && lr.bottom > 70;
    var overFim = fr.top < 70;
    nav.classList.toggle("on-light", (overLightFrames || overLightWorld) && !overFim);
    // hide nav mid-journey to let the film breathe, show at start/end
    var hideNav = rect.top <= 0 && p > 0.06 && p < 0.85 && rect.bottom > window.innerHeight;
    nav.classList.toggle("hidden-nav", hideNav);
  }

  window.addEventListener("scroll", function () { lastInteract = performance.now(); onScroll(); }, { passive: true });
  window.addEventListener("resize", function () { dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 820 ? 1.5 : 2); sizeCanvas(); update(); });
  sizeCanvas();
  update();

  /* ---------- film player: loop automatico quando ocioso, segue o scroll quando usado ---------- */
  var scrollFrame = 0, displayFrame = 0, lastInteract = 0;
  var IDLE_DELAY = 2400, IDLE_SPEED = 0.30; // ~18fps de avanco em 60hz
  function filmLoop(now) {
    if (reduceMotion) { drawFrame(scrollFrame); requestAnimationFrame(filmLoop); return; }
    var idle = (now - lastInteract) > IDLE_DELAY;
    if (idle) {
      displayFrame = (displayFrame + IDLE_SPEED) % FRAME_COUNT;
    } else {
      var diff = scrollFrame - displayFrame;
      if (Math.abs(diff) < 0.5) displayFrame = scrollFrame;
      else displayFrame += diff * 0.16; // entra na ordem suavemente
    }
    drawFrame(Math.round(displayFrame) % FRAME_COUNT);
    requestAnimationFrame(filmLoop);
  }
  requestAnimationFrame(filmLoop);

  /* ---------- blur-text split ---------- */
  document.querySelectorAll(".blur-text").forEach(function (el) {
    var ws = el.textContent.trim().split(/\s+/);
    el.innerHTML = ws.map(function (w, i) {
      return '<span class="w" style="transition-delay:' + (i * 0.06).toFixed(2) + 's">' + w + "</span>";
    }).join(" ");
  });

  /* ---------- reveals + blur-text trigger ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  var bio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); bio.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll(".blur-text").forEach(function (el) { bio.observe(el); });

  /* ---------- fullscreen menu ---------- */
  var burger = document.getElementById("burger");
  var overlay = document.getElementById("overlay");
  var closeMenu = document.getElementById("closeMenu");
  function setMenu(open) {
    overlay.classList.toggle("open", open);
    overlay.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "";
    if (window.lenisRef) { open ? window.lenisRef.stop() : window.lenisRef.start(); }
  }
  window.setMenuRef = setMenu;
  if (burger) burger.addEventListener("click", function () { setMenu(true); });
  if (closeMenu) closeMenu.addEventListener("click", function () { setMenu(false); });
  if (overlay) overlay.querySelectorAll('.links a:not([href^="#"])').forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- black-hole cursor ---------- */
  var coarse = window.matchMedia("(hover:none),(pointer:coarse)").matches;
  if (!coarse && !reduceMotion) {
    var bh = document.getElementById("bh");
    if (bh) {
      document.body.classList.add("bh-on");
      var tx = window.innerWidth / 2, ty = window.innerHeight / 2, cx = tx, cy = ty;
      window.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
      window.addEventListener("mousedown", function () { bh.classList.add("grow"); });
      window.addEventListener("mouseup", function () { bh.classList.remove("grow"); });
      document.addEventListener("mouseover", function (e) {
        if (e.target.closest("a,button,.subj-card,input")) bh.classList.add("grow");
        else bh.classList.remove("grow");
      }, { passive: true });
      (function follow() {
        cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
        bh.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
        requestAnimationFrame(follow);
      })();
    }
  }
})();

/* ---------- typography interactions (holo sheen + letter wave) ---------- */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia("(hover:none),(pointer:coarse)").matches;
  if (reduce || coarse) return;

  // holographic ink that follows the cursor on serif headings
  document.querySelectorAll(".chapter h1.serif, .chapter h2.serif, #light h2.serif, #light .n.serif").forEach(function (h) {
    h.classList.add("holo-ink");
    h.addEventListener("mousemove", function (e) {
      var r = h.getBoundingClientRect();
      h.style.setProperty("--tx", (e.clientX - r.left) + "px");
      h.style.setProperty("--ty", (e.clientY - r.top) + "px");
    }, { passive: true });
  });

  // per-letter wave on nav + overlay menu links
  function splitChars(a) {
    var idx = 0;
    Array.prototype.slice.call(a.childNodes).forEach(function (n) {
      if (n.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      n.textContent.split("").forEach(function (c) {
        if (c.trim() === "") { frag.appendChild(document.createTextNode(c)); return; }
        var s = document.createElement("span");
        s.className = "ch";
        s.style.setProperty("--i", idx++);
        s.textContent = c;
        frag.appendChild(s);
      });
      a.replaceChild(frag, n);
    });
  }
  document.querySelectorAll("#overlay .links a, nav .menu a:not(.cta)").forEach(splitChars);
})();
