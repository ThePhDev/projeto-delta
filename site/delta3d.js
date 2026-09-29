/* Projeto Delta — tetraedro 3D interativo (Canvas 2D, sem dependências) */
(function () {
  "use strict";
  var canvas = document.getElementById("delta3d");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var stage = canvas.parentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var buttons = Array.prototype.slice.call(document.querySelectorAll(".eixo"));

  var EIXOS = [
    { sym: "%", hue: 258 },
    { sym: "ƒ", hue: 195 },
    { sym: "△", hue: 165 },
    { sym: "σ", hue: 330 }
  ];
  var GLYPHS = ["π", "Σ", "√", "∞", "Δ", "x²", "%", "θ", "∫", "≈", "÷", "ƒ(x)", "log", "σ", "n!", "³√"];

  var V = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
  var F = [[1, 2, 3], [0, 3, 2], [0, 1, 3], [0, 2, 1]];
  F = F.map(function (f) {
    var n = normal(V[f[0]], V[f[1]], V[f[2]]);
    var c = centroid(f);
    return dot(n, c) < 0 ? [f[0], f[2], f[1]] : f;
  });

  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function normal(a, b, c) { return norm(cross(sub(b, a), sub(c, a))); }
  function centroid(f) { return [0, 1, 2].map(function (k) { return (V[f[0]][k] + V[f[1]][k] + V[f[2]][k]) / 3; }); }

  function rot(p, yaw, pitch) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    var x = p[0] * cy + p[2] * sy, z = -p[0] * sy + p[2] * cy;
    var y = p[1] * cp - z * sp;
    z = p[1] * sp + z * cp;
    return [x, y, z];
  }

  var particles = GLYPHS.map(function (g, i) {
    var t = (i / GLYPHS.length) * Math.PI * 2;
    return { g: g, r: 2.1 + (i % 3) * 0.35, a: t, y: ((i * 37) % 17) / 17 * 2.2 - 1.1, s: 0.0016 + (i % 5) * 0.0005 };
  });

  var W = 0, H = 0, dpr = 1;
  function resize() {
    var r = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  var yaw = 0.6, pitch = -0.35, vyaw = reduce ? 0 : 0.004, vpitch = 0;
  var target = null, active = -1, hover = -1, dragging = false, lastX = 0, lastY = 0, lastMove = 0;
  var px = 0, py = 0;
  var projected = [];

  function project(p) {
    var scale = Math.min(W, H) * 0.25, cam = 5.2;
    var k = cam / (cam - p[2]);
    return [W / 2 + p[0] * scale * k + px * 10, H / 2 - p[1] * scale * k + py * 10, k];
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    var light = norm([-0.4, 0.6, 1]);

    var glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.46);
    var gh = EIXOS[active >= 0 ? active : hover >= 0 ? hover : 0].hue;
    glow.addColorStop(0, "hsla(" + gh + ",90%,60%,.28)");
    glow.addColorStop(1, "hsla(" + gh + ",90%,60%,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    var back = [], front = [];
    particles.forEach(function (p) {
      if (!reduce) p.a += p.s;
      var pos = rot([Math.cos(p.a) * p.r, p.y, Math.sin(p.a) * p.r], yaw * 0.35, pitch * 0.4);
      (pos[2] < 0 ? back : front).push({ p: p, pos: pos });
    });
    function drawGlyphs(list) {
      list.forEach(function (o) {
        var s = project(o.pos);
        var depth = (o.pos[2] + 2.6) / 5.2;
        ctx.globalAlpha = 0.18 + depth * 0.55;
        ctx.fillStyle = "#fff";
        ctx.font = "500 " + Math.round(12 + depth * 10) + "px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(o.p.g, s[0], s[1]);
      });
      ctx.globalAlpha = 1;
    }
    drawGlyphs(back);

    var rv = V.map(function (v) { return rot(v, yaw, pitch); });
    var faces = F.map(function (f, i) {
      var a = rv[f[0]], b = rv[f[1]], c = rv[f[2]];
      var n = normal(a, b, c);
      return { i: i, f: f, n: n, z: (a[2] + b[2] + c[2]) / 3, pts: [project(a), project(b), project(c)] };
    }).filter(function (fc) { return fc.n[2] > 0.02; }).sort(function (x, y) { return x.z - y.z; });
    projected = faces;

    faces.forEach(function (fc) {
      var e = EIXOS[fc.i];
      var lit = Math.max(0, dot(fc.n, light));
      var hi = fc.i === active || fc.i === hover;
      var L = 22 + lit * 34 + (hi ? 10 : 0);
      var p = fc.pts;
      var g = ctx.createLinearGradient(p[0][0], p[0][1], (p[1][0] + p[2][0]) / 2, (p[1][1] + p[2][1]) / 2);
      g.addColorStop(0, "hsla(" + e.hue + ",85%," + (L + 14) + "%,.92)");
      g.addColorStop(1, "hsla(" + (e.hue + 30) + ",80%," + L + "%,.92)");
      ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); ctx.lineTo(p[1][0], p[1][1]); ctx.lineTo(p[2][0], p[2][1]); ctx.closePath();
      ctx.fillStyle = g; ctx.fill();
      ctx.lineJoin = "round";
      ctx.strokeStyle = hi ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.45)";
      ctx.lineWidth = hi ? 2.2 : 1.2; ctx.stroke();

      var cx = (p[0][0] + p[1][0] + p[2][0]) / 3, cy = (p[0][1] + p[1][1] + p[2][1]) / 3;
      var size = Math.max(14, Math.min(W, H) * 0.075 * fc.n[2]);
      ctx.globalAlpha = Math.min(1, fc.n[2] * 1.6);
      ctx.fillStyle = "#fff";
      ctx.font = "600 " + Math.round(size) + "px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(e.sym, cx, cy);
      ctx.globalAlpha = 1;
    });
    drawGlyphs(front);
  }

  function shortest(from, to) {
    var d = (to - from) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return from + d;
  }
  function focusFace(i) {
    var f = F[i];
    var n = normal(V[f[0]], V[f[1]], V[f[2]]);
    var a = Math.atan2(-n[0], n[2]);
    var z1 = Math.hypot(n[0], n[2]);
    var b = Math.atan2(n[1], z1);
    target = { yaw: shortest(yaw, a + 0.45), pitch: b - 0.3 };
    lastMove = performance.now();
    vyaw = 0; vpitch = 0;
    setActive(i);
  }
  function setActive(i) {
    if (active !== i) document.dispatchEvent(new CustomEvent("eixo:change", { detail: { i: i } }));
    active = i;
    buttons.forEach(function (bt, k) {
      bt.classList.toggle("on", k === i);
      bt.setAttribute("aria-pressed", k === i ? "true" : "false");
    });
  }

  var running = false, visible = false;
  function frame(now) {
    if (!running) return;
    if (target) {
      yaw += (target.yaw - yaw) * 0.09;
      pitch += (target.pitch - pitch) * 0.09;
      if (Math.abs(target.yaw - yaw) < 0.002 && Math.abs(target.pitch - pitch) < 0.002) target = null;
    } else if (!dragging) {
      yaw += vyaw; pitch += vpitch;
      vpitch *= 0.94;
      var hold = active >= 0 && now - lastMove < 6000;
      var base = reduce || hold ? 0 : 0.004;
      vyaw += (base - vyaw) * 0.03;
      if (!hold) pitch += (-0.35 - pitch) * 0.01;
    }
    draw(now);
    requestAnimationFrame(frame);
  }
  function start() { if (!running && visible && !document.hidden) { running = true; requestAnimationFrame(frame); } }
  function stop() { running = false; }

  function pick(x, y) {
    for (var k = projected.length - 1; k >= 0; k--) {
      var p = projected[k].pts;
      if (inTri(x, y, p[0], p[1], p[2])) return projected[k].i;
    }
    return -1;
  }
  function inTri(x, y, a, b, c) {
    var d1 = (x - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (y - b[1]);
    var d2 = (x - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (y - c[1]);
    var d3 = (x - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (y - a[1]);
    var neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(neg && pos);
  }

  var downX = 0, downY = 0;
  stage.addEventListener("pointerdown", function (e) {
    dragging = true; target = null; lastX = downX = e.clientX; lastY = downY = e.clientY;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", function (e) {
    var r = stage.getBoundingClientRect();
    px = ((e.clientX - r.left) / r.width - 0.5); py = ((e.clientY - r.top) / r.height - 0.5);
    if (dragging) {
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      vyaw = dx * 0.008; vpitch = dy * 0.008;
      yaw += vyaw; pitch = Math.max(-1.3, Math.min(1.3, pitch + vpitch));
      lastMove = performance.now();
    } else if (e.pointerType === "mouse") {
      var h = pick(e.clientX - r.left, e.clientY - r.top);
      if (h !== hover) { hover = h; stage.style.cursor = h >= 0 ? "pointer" : ""; }
    }
  });
  function end(e) {
    if (!dragging) return;
    dragging = false;
    if (Math.hypot(e.clientX - downX, e.clientY - downY) < 6) {
      var r = stage.getBoundingClientRect();
      var i = pick(e.clientX - r.left, e.clientY - r.top);
      if (i >= 0) focusFace(i);
    }
  }
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", function () { dragging = false; });
  stage.addEventListener("pointerleave", function () { hover = -1; px = py = 0; });

  buttons.forEach(function (bt, i) {
    bt.setAttribute("aria-pressed", "false");
    bt.addEventListener("click", function () { focusFace(i); lastMove = performance.now(); });
    bt.addEventListener("mouseenter", function () { hover = i; });
    bt.addEventListener("mouseleave", function () { hover = -1; });
  });

  new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    visible ? start() : stop();
  }, { rootMargin: "100px" }).observe(stage);
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  window.addEventListener("resize", function () { resize(); draw(performance.now()); });
  resize();
  draw(0);
})();
