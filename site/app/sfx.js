// ============================================================
// PROJETO DELTA — efeitos sonoros sintetizados (Web Audio, sem arquivos)
// ============================================================
let ctx = null;
let muted = false;
try { muted = localStorage.getItem("delta-mute") === "1"; } catch (e) {}

function ac() {
  if (muted) return null;
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, start, dur, type = "sine", gain = 0.18, slideTo = null) {
  const a = ac(); if (!a) return;
  const t0 = a.currentTime + start;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0); o.stop(t0 + dur + 0.05);
}

function noise(start, dur, gain = 0.08) {
  const a = ac(); if (!a) return;
  const t0 = a.currentTime + start;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
  f.type = "highpass"; f.frequency.value = 1800;
  g.gain.value = gain; s.buffer = buf;
  s.connect(f).connect(g).connect(a.destination); s.start(t0);
}

export const sfx = {
  tap() { tone(660, 0, 0.06, "triangle", 0.08); },
  select() { tone(520, 0, 0.05, "triangle", 0.07); tone(780, 0.03, 0.06, "triangle", 0.06); },
  correct() { tone(660, 0, 0.12, "sine", 0.16); tone(880, 0.09, 0.12, "sine", 0.16); tone(1320, 0.18, 0.22, "sine", 0.12); },
  wrong() { tone(220, 0, 0.18, "sawtooth", 0.08, 160); tone(180, 0.12, 0.22, "sawtooth", 0.07, 120); },
  coin() { [988, 1319, 1760].forEach((f, i) => tone(f, i * 0.06, 0.12, "square", 0.05)); noise(0, 0.08, 0.03); },
  purchase() { tone(784, 0, 0.1, "square", 0.06); tone(1047, 0.08, 0.1, "square", 0.06); tone(1568, 0.16, 0.25, "triangle", 0.08); noise(0.02, 0.12, 0.04); },
  whoosh() { noise(0, 0.25, 0.05); tone(300, 0, 0.25, "sine", 0.05, 900); },
  levelup() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.2, "triangle", 0.12)); },
  achievement() { [659, 830, 988, 1319].forEach((f, i) => tone(f, i * 0.08, 0.3, "sine", 0.12)); noise(0.3, 0.3, 0.03); },
  streak() { tone(440, 0, 0.3, "sawtooth", 0.05, 880); tone(880, 0.2, 0.25, "triangle", 0.1); },
  heart() { tone(300, 0, 0.12, "sine", 0.12, 200); tone(200, 0.12, 0.25, "sine", 0.1, 120); },
  talk() { const n = 3 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) tone(420 + Math.random() * 260, i * 0.07, 0.05, "triangle", 0.035); },
  finish() { [523, 659, 784].forEach((f, i) => tone(f, i * 0.12, 0.35, "triangle", 0.13)); tone(1047, 0.4, 0.6, "sine", 0.12); },
  land() { tone(140, 0, 0.25, "sine", 0.22, 50); noise(0, 0.18, 0.05); },
  pop() { tone(600, 0, 0.08, "sine", 0.14, 1200); },
  rise() { tone(220, 0, 0.9, "sawtooth", 0.05, 1400); noise(0, 0.9, 0.03); },
  shake() { tone(300 + Math.random() * 120, 0, 0.07, "square", 0.05); },
  burst() { noise(0, 0.35, 0.08); [784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.05 + i * 0.05, 0.25, "triangle", 0.09)); },
  isMuted() { return muted; },
  setMuted(v) { muted = !!v; try { localStorage.setItem("delta-mute", muted ? "1" : "0"); } catch (e) {} },
  unlock() { const a = ac(); if (a && a.state === "suspended") a.resume(); }
};
