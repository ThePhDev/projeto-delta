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
// Camada de preenchimento (duotone): dá volume ao traço sem trocar o sistema de linha
const D = {
  home: '<path d="M5 10v10h5v-6h4v6h5V10l-7-5.5L5 10Z"/>',
  target: '<circle cx="12" cy="12" r="8"/>',
  bag: '<path d="M5 8h14l-1 12H6L5 8Z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0Z"/>',
  fire: '<path d="M12 21c-4 0-7-3-7-7 0-3 2-5 3-6 0 2 1 3 2 3 0-4 2-7 5-9 0 3 1 5 3 7 1 1 1 3 1 5 0 4-3 7-7 7Z"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
  bolt: '<path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/>', timer: '<circle cx="12" cy="13" r="8"/>', question: '<circle cx="12" cy="12" r="9"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  sound: '<path d="M4 9h4l5-4v14l-5-4H4V9Z"/>', mute: '<path d="M4 9h4l5-4v14l-5-4H4V9Z"/>',
  gear: '<circle cx="12" cy="12" r="6"/>', pencil: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/>',
  chart: '<path d="M8.5 20V4h3v16ZM14.5 20v-7h3v7ZM2.5 20v-10h3v10Z"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="2"/>', crown: '<path d="m3 8 4 4 5-7 5 7 4-4-2 11H5L3 8Z"/>',
  medal: '<circle cx="12" cy="15" r="6"/>', bulb: '<path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  rocket: '<path d="M9 15 6 12c2-6 7-9 14-9 0 7-3 12-9 14l-2-2Z"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/>', admin: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/>',
  hex: '<path d="M12 2 20.5 7v10L12 22 3.5 17V7L12 2Z"/>', flag: '<path d="M5 4h11l-2 4 2 4H5Z"/>',
  logout: '<path d="M15 4h4v16h-4Z"/>', moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/>', eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/>', school: '<path d="M2 9 12 4l10 5-10 5L2 9Z"/>',
  calendar: '<path d="M5 5h14a2 2 0 0 1 2 2v3H3V7a2 2 0 0 1 2-2Z"/>', play: '<path d="M7 4v16l13-8L7 4Z"/>'
};
export function ic(name, cls = "") {
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${D[name] ? `<g class="du">${D[name]}</g>` : ""}${P[name] || ""}</svg>`;
}

// Gradientes compartilhados (moeda, estrela, coração). O SVG de definições fica
// renderizado com tamanho zero: gradientes dentro de display:none deixam de pintar.
function defs() {
  if (typeof document === "undefined" || document.getElementById("delta-defs")) return;
  const d = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  d.id = "delta-defs"; d.setAttribute("aria-hidden", "true"); d.setAttribute("width", "0"); d.setAttribute("height", "0");
  d.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
  d.innerHTML = `<defs>
    <linearGradient id="dg-coin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6ff8ff"/><stop offset=".45" stop-color="#00c8e0"/><stop offset="1" stop-color="#2979ff"/></linearGradient>
    <linearGradient id="dg-coin-in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1a3a"/><stop offset="1" stop-color="#16104a"/></linearGradient>
    <linearGradient id="dg-star" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset=".55" stop-color="#ffc53d"/><stop offset="1" stop-color="#e29400"/></linearGradient>
    <linearGradient id="dg-heart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7d95"/><stop offset=".6" stop-color="#ff4d6d"/><stop offset="1" stop-color="#d42a4d"/></linearGradient>
  </defs>`;
  const put = () => document.body.prepend(d);
  document.body ? put() : addEventListener("DOMContentLoaded", put, { once: true });
}
defs();

export const STAR_SOLID = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3 1.1-6.5L2.6 9.3l6.5-.9L12 2.5Z"/><path class="hl" style="fill:#fff;opacity:.38" d="M12 5.6 13.9 9.4l3.4.5-2.6 1.1-2.7-.2-2.7.2-2.6-1.1 3.4-.5L12 5.6Z"/></svg>';
export const HEART_SOLID = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-4.9-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 16.1 12 21 12 21Z"/><path class="hl" style="fill:#fff;opacity:.4" d="M7.4 7.9c-1.6.4-2.4 1.7-2.3 3 .4-.9 1.3-1.7 2.5-1.9.6-.1.7-1.3-.2-1.1Z"/></svg>';

const MEDAL_IC = { alvo: "target", estrela: "star", fogo: "fire", livro: "book", raio: "bolt", medalha: "medal", relogio: "clock", ciclo: "cycle", sacola: "bag", coroa: "crown" };
// Medalha de conquista: aro serrilhado de metal, disco com bisel, ícone com brilho,
// fitas atrás, reflexo especular e um brilho que atravessa o disco em loop.
export function medalSVG(icone, on = true) {
  const k = Math.random().toString(36).slice(2, 7), name = MEDAL_IC[icone] || "star";
  const c = on ? ["#7ff9ff", "#00d4ea", "#8b5cf6", "#ff00e5", "#5b21b6"] : ["#9a98ad", "#6f6c86", "#56536b", "#46435a", "#34324a"];
  const ink = on ? "#ffffff" : "#b9b6cc", glow = on ? "#00f0ff" : "transparent";
  return `<svg class="medal-svg ${on ? "on" : "off"}" viewBox="0 0 100 112" aria-hidden="true"><defs>
    <linearGradient id="rb${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${on ? "#2979ff" : "#4a4760"}"/><stop offset="1" stop-color="${on ? "#4b0082" : "#2b293b"}"/></linearGradient>
    <linearGradient id="rim${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset=".35" stop-color="${c[1]}"/><stop offset=".68" stop-color="${c[2]}"/><stop offset="1" stop-color="${c[3]}"/></linearGradient>
    <radialGradient id="disc${k}" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="${on ? "#2a2150" : "#2a2838"}"/><stop offset=".6" stop-color="${on ? "#140f2e" : "#1a1924"}"/><stop offset="1" stop-color="#0a0913"/></radialGradient>
    <linearGradient id="bev${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
    <clipPath id="cp${k}"><circle cx="50" cy="48" r="33"/></clipPath>
    <filter id="gl${k}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>
    <path d="M33 70 26 108l11-7 7 10 6-37Z" fill="url(#rb${k})"/><path d="M67 70l7 38-11-7-7 10-6-37Z" fill="url(#rb${k})"/>
    <path d="M33 70 26 108l11-7M67 70l7 38-11-7" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.2"/>
    <circle cx="50" cy="50" r="45" fill="#000" opacity=".35"/>
    <circle cx="50" cy="48" r="44" fill="url(#rim${k})"/>
    <circle cx="50" cy="48" r="41.5" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2.6" stroke-dasharray="1.6 3.3"/>
    <circle cx="50" cy="48" r="44" fill="none" stroke="url(#bev${k})" stroke-width="1.6"/>
    <circle cx="50" cy="48" r="35.5" fill="#050409" opacity=".55"/>
    <circle cx="50" cy="48" r="34" fill="url(#disc${k})"/>
    <circle cx="50" cy="48" r="34" fill="none" stroke="url(#bev${k})" stroke-width="1.4" transform="rotate(180 50 48)"/>
    <circle cx="50" cy="48" r="27" fill="none" stroke="${on ? "#00f0ff" : "#fff"}" stroke-opacity="${on ? ".22" : ".08"}" stroke-dasharray="2 4"/>
    <g transform="translate(29 27) scale(1.75)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="${glow}" stroke-width="3.4" opacity=".7" filter="url(#gl${k})">${P[name]}</g>
      <g style="fill:${ink};opacity:.14;stroke:none">${D[name] || ""}</g>
      <g stroke="${ink}" stroke-width="2">${P[name]}</g></g>
    <g clip-path="url(#cp${k})"><path d="M22 30C30 18 44 13 58 16 46 17 34 22 26 34Z" fill="#fff" opacity=".16"/>${on ? `<rect class="glint" x="-30" y="0" width="16" height="100" fill="#fff" opacity=".22" transform="rotate(22 50 48)"/>` : ""}</g>
    ${on ? `<path class="twk" d="M80 14l1.6 4.4L86 20l-4.4 1.6L80 26l-1.6-4.4L74 20l4.4-1.6Z" fill="#fff"/>` : `<g transform="translate(66 64)"><circle r="11" fill="#1c1a29" stroke="#46435a" stroke-width="2"/><g transform="translate(-6 -7) scale(.5)" fill="none" stroke="#b9b6cc" stroke-width="2.6" stroke-linecap="round">${P.lock}</g></g>`}
  </svg>`;
}

// Gema da liga: coroa e pavilhão facetados, cada face com seu tom, reflexo e brilhos.
export function gemSVG(c1 = "#00f0ff", c2 = "#2979ff") {
  const k = Math.random().toString(36).slice(2, 7);
  return `<svg class="gem" viewBox="0 0 120 116" aria-hidden="true"><defs>
    <linearGradient id="ga${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <linearGradient id="gb${k}" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <radialGradient id="gs${k}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="60" cy="108" rx="34" ry="6" fill="url(#gs${k})"/>
    <g class="gem-body">
      <path d="M30 8h60l26 30H4Z" fill="url(#ga${k})"/>
      <path d="M30 8 44 38H4Z" fill="#fff" opacity=".28"/><path d="M30 8h30L44 38Z" fill="#fff" opacity=".42"/>
      <path d="M60 8h30L76 38Z" fill="#fff" opacity=".18"/><path d="M90 8l26 30H76Z" fill="#000" opacity=".12"/>
      <path d="M60 8 76 38H44Z" fill="#fff" opacity=".08"/>
      <path d="M4 38h40l16 66Z" fill="url(#gb${k})"/><path d="M4 38h40l16 66Z" fill="#fff" opacity=".12"/>
      <path d="M44 38h32l-16 66Z" fill="url(#ga${k})"/><path d="M44 38h32l-16 66Z" fill="#fff" opacity=".22"/>
      <path d="M76 38h40l-56 66Z" fill="url(#gb${k})"/><path d="M76 38h40l-56 66Z" fill="#000" opacity=".26"/>
      <path d="M30 8h60l26 30-56 66L4 38Z" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M4 38h112M30 8l14 30 16-30 16 30 14-30M44 38l16 66 16-66" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/>
      <path d="M36 13h18l-9 19Z" fill="#fff" opacity=".55"/>
      <path class="gtw" d="M92 2l2 5.5L99.5 9.5 94 11.5 92 17l-2-5.5L84.5 9.5 90 7.5Z" fill="#fff"/>
      <path class="gtw g2" d="M18 52l1.2 3.3 3.3 1.2-3.3 1.2L18 61l-1.2-3.3-3.3-1.2 3.3-1.2Z" fill="#fff"/>
    </g></svg>`;
}
