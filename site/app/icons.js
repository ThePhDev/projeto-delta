// Ícones de linha do Projeto Delta (traço 2.2, cantos arredondados)
const P = {
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  bag: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8 20h8M10 17h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  fire: '<path d="M12 21c-4 0-7-3-7-7 0-3 2-5 3-6 0 2 1 3 2 3 0-4 2-7 5-9 0 3 1 5 3 7 1 1 1 3 1 5 0 4-3 7-7 7Z"/><path d="M12 21c-2 0-3-1.5-3-3.5S11 14 12 13c1 1 3 2.5 3 4.5S14 21 12 21Z"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
  bolt: '<path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M8 7h7M8 11h5"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  back: '<path d="m15 6-6 6 6 6"/>',
  sound: '<path d="M4 9h4l5-4v14l-5-4H4V9Z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4V9Z"/><path d="m17 9 5 5M22 9l-5 5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13 7 4 4"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  cycle: '<path d="M20 12a8 8 0 0 1-14 5.3M4 12A8 8 0 0 1 18 6.7"/><path d="M18 2v5h-5M6 22v-5h5"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13h18M12 9v12"/><path d="M12 9c-2-4-6-4-6-1 0 1 1 1 6 1Zm0 0c2-4 6-4 6-1 0 1-1 1-6 1Z"/>',
  crown: '<path d="m3 8 4 4 5-7 5 7 4-4-2 11H5L3 8Z"/>',
  medal: '<circle cx="12" cy="15" r="6"/><path d="M8 3h8l-2 6h-4L8 3Z"/><path d="m12 12 1 2h2l-1.5 1.3.5 2-2-1.2-2 1.2.5-2L9 14h2l1-2Z"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3Z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  rocket: '<path d="M5 15c-1 1-2 4-2 6 2 0 5-1 6-2"/><path d="M9 15 6 12c2-6 7-9 14-9 0 7-3 12-9 14l-2-2Z"/><circle cx="15" cy="9" r="2"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/>',
  hex: '<path d="M12 2 20.5 7v10L12 22 3.5 17V7L12 2Z"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  ice: '<path d="M12 2v20M4 7l16 10M20 7 4 17"/><path d="m9 4 3 2 3-2M9 20l3-2 3 2"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  logout: '<path d="M15 4h4v16h-4M10 12h10M13 8l-4 4 4 4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  at: '<circle cx="12" cy="12" r="4"/><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-4 7.5"/>',
  school: '<path d="M2 9 12 4l10 5-10 5L2 9Z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  play: '<path d="M7 4v16l13-8L7 4Z"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01"/>',
  admin: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>'
};
export function ic(name, cls = "") {
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[name] || ""}</svg>`;
}
export const STAR_SOLID = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3 1.1-6.5L2.6 9.3l6.5-.9L12 2.5Z"/></svg>';
export const HEART_SOLID = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-4.9-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 16.1 12 21 12 21Z"/></svg>';

// Medalhas de conquistas (moeda metálica com ícone)
export function medalSVG(icone, on = true) {
  const k = Math.random().toString(36).slice(2, 7);
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs>
    <linearGradient id="md${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${on ? "#00f0ff" : "#555"}"/><stop offset=".5" stop-color="${on ? "#8b5cf6" : "#777"}"/><stop offset="1" stop-color="${on ? "#ff00e5" : "#444"}"/></linearGradient></defs>
    <circle cx="50" cy="50" r="44" fill="url(#md${k})"/><circle cx="50" cy="50" r="36" fill="#0d0c16" stroke="rgba(255,255,255,.25)" stroke-width="2"/>
    <g transform="translate(29 29) scale(1.75)" stroke="${on ? "#fff" : "#999"}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P[{ alvo: "target", estrela: "star", fogo: "fire", livro: "book", raio: "bolt", medalha: "medal", relogio: "clock", ciclo: "cycle", sacola: "bag", coroa: "crown" }[icone] || "star"]}</g></svg>`;
}

// Gema da liga
export function gemSVG(c1 = "#00f0ff", c2 = "#2979ff") {
  return `<svg class="gem" viewBox="0 0 120 110" aria-hidden="true"><defs><linearGradient id="gm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <path d="M30 8h60l26 30-56 66L4 38 30 8Z" fill="url(#gm)"/><path d="M4 38h112M30 8l14 30 16-30 16 30 14-30M44 38l16 66 16-66" stroke="rgba(255,255,255,.55)" stroke-width="2" fill="none"/>
    <path d="M60 50 72 72H48L60 50Z" fill="none" stroke="#0b0b0f" stroke-width="4" stroke-linejoin="round" opacity=".7"/></svg>`;
}
