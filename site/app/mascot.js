// ============================================================
// PROJETO DELTA — Mascote oficial: o micro astronauta "Delta"
// Capacete preto, visor com olhos Δ Δ, moletom e tênis iridescentes.
// Tudo vetorial: expressões, itens vestíveis e fundos.
// ============================================================

// `cor` controla o brilho dos olhos e os detalhes neon
export const CORES = {
  teal:    { g: "#00f0ff", n: "Ciano" },
  violeta: { g: "#a78bfa", n: "Violeta" },
  coral:   { g: "#ff7a59", n: "Coral" },
  lima:    { g: "#b6f23a", n: "Lima" },
  azul:    { g: "#2979ff", n: "Azul" },
  rosa:    { g: "#ff00e5", n: "Magenta" }
};

let uid = 0;

// chapéus foram desenhados com a base em y≈44; o grupo é ajustado ao capacete
const HAT_T = "translate(0,-15) translate(100 44) scale(1.45) translate(-100 -44)";
const HATS = {
  "bone-azul": () => `
    <path d="M70 46 C72 18 128 18 130 46 Z" fill="#2563eb"/><path d="M70 46 C72 18 128 18 130 46" fill="none" stroke="#1e40af" stroke-width="3"/>
    <path d="M122 44 C140 42 156 46 160 52 C146 54 130 52 118 49 Z" fill="#1e3a8a"/><circle cx="100" cy="21" r="4" fill="#1e3a8a"/>`,
  "bone-estudante": () => `
    <path d="M70 46 C72 18 128 18 130 46 Z" fill="#f1f5f9"/><path d="M70 46 C72 18 128 18 130 46" fill="none" stroke="#94a3b8" stroke-width="3"/>
    <path d="M122 44 C140 42 156 46 160 52 C146 54 130 52 118 49 Z" fill="#64748b"/>
    <path d="M100 28 L108 42 L92 42 Z" fill="none" stroke="#0891b2" stroke-width="3" stroke-linejoin="round"/>`,
  "tiara": () => `
    <path d="M76 46 Q100 30 124 46" fill="none" stroke="#f5c542" stroke-width="5" stroke-linecap="round"/>
    <path d="M86 40 L90 30 L96 38 L100 26 L104 38 L110 30 L114 40" fill="#fcd34d" stroke="#d4a017" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="100" cy="33" r="4" fill="#ec4899"/>`,
  "cartola": () => `
    <rect x="80" y="2" width="40" height="40" rx="4" fill="#0f0f16"/><rect x="80" y="30" width="40" height="7" fill="#3b3a4f"/>
    <ellipse cx="100" cy="43" rx="34" ry="7" fill="#0f0f16"/>`,
  "cartola-gauss": () => `
    <rect x="80" y="0" width="40" height="42" rx="4" fill="#0b0b12"/><rect x="80" y="28" width="40" height="8" fill="#00c2d1"/>
    <circle cx="112" cy="32" r="3" fill="#fcd34d"/><ellipse cx="100" cy="43" rx="35" ry="7" fill="#0b0b12"/>`,
  "gorro-natal": () => `
    <path d="M72 46 C76 20 104 6 128 20 C134 24 140 30 142 38 L128 46 Z" fill="#dc2626"/>
    <rect x="68" y="40" width="64" height="12" rx="6" fill="#f8fafc"/><circle cx="144" cy="40" r="8" fill="#f8fafc"/>`,
  "chapeu-junino": () => `
    <ellipse cx="100" cy="44" rx="52" ry="10" fill="#e8c77a" stroke="#b8923c" stroke-width="2"/>
    <path d="M76 44 C78 18 122 18 124 44 Z" fill="#f1d58f" stroke="#b8923c" stroke-width="2"/><rect x="77" y="34" width="46" height="6" fill="#dc2626"/>`,
  "chapeu-bruxa": () => `
    <ellipse cx="100" cy="44" rx="46" ry="9" fill="#3b0764"/>
    <path d="M78 44 L104 -6 C110 -8 112 0 108 6 L122 44 Z" fill="#6d28d9"/><rect x="80" y="34" width="42" height="7" fill="#f97316"/>`,
  "chapeu-mago": () => `
    <ellipse cx="100" cy="44" rx="44" ry="8" fill="#1e1b4b"/><path d="M76 44 L100 -10 L124 44 Z" fill="#4338ca"/>
    <path d="M94 16 l2 4 4 1 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -1 Z" fill="#fde047"/>
    <circle cx="108" cy="30" r="2.5" fill="#fde047"/><circle cx="90" cy="34" r="2" fill="#fde047"/>`,
  "louros-pitagoras": () => `
    <g fill="#eab308" stroke="#a16207" stroke-width="1.2">
      ${[0,1,2,3,4].map(i => `<ellipse cx="${72 + i*7}" cy="${46 - i*4}" rx="6" ry="3.2" transform="rotate(${-40 + i*10} ${72 + i*7} ${46 - i*4})"/>`).join("")}
      ${[0,1,2,3,4].map(i => `<ellipse cx="${128 - i*7}" cy="${46 - i*4}" rx="6" ry="3.2" transform="rotate(${40 - i*10} ${128 - i*7} ${46 - i*4})"/>`).join("")}
    </g><circle cx="100" cy="27" r="3" fill="#fde047"/>`
};

const EULER = `<g fill="#f8fafc" stroke="#cbd5e1" stroke-width="2">
  <circle cx="100" cy="14" r="15"/><circle cx="78" cy="20" r="14"/><circle cx="122" cy="20" r="14"/>
  <circle cx="56" cy="34" r="14"/><circle cx="144" cy="34" r="14"/><circle cx="40" cy="56" r="13"/><circle cx="160" cy="56" r="13"/>
  <circle cx="30" cy="100" r="12"/><circle cx="170" cy="100" r="12"/></g>`;

function eyes(expr, color) {
  const tri = (cx, cy, s = 12.5) => `M${cx} ${cy - s} L${cx + s * 0.95} ${cy + s * 0.65} L${cx - s * 0.95} ${cy + s * 0.65} Z`;
  let d = "", extra = "";
  switch (expr) {
    case "feliz": case "comemorando":
      d = `M72 86 Q84 68 96 86 M104 86 Q116 68 128 86`; break;
    case "dormindo":
      d = `M72 82 L96 82 M104 82 L128 82`; break;
    case "vida":
      d = `M74 70 L94 90 M94 70 L74 90 M106 70 L126 90 M126 70 L106 90`; color = "#ff4d6d"; break;
    case "triste":
      d = `${tri(84, 86, 9)} ${tri(116, 86, 9)}`; extra = `<path d="M72 70 L94 74 M128 70 L106 74" stroke="${color}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`; color = "#7cc4ff"; break;
    case "pensando":
      d = `${tri(80, 76, 10)} ${tri(112, 76, 10)}`; break;
    case "surpreso":
      d = `M84 80 m-11 0 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0 M116 80 m-11 0 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0`; break;
    default:
      d = `${tri(84, 80)} ${tri(116, 80)}`;
  }
  return `<g class="dm-eyes" filter="url(#dmglow)">
    <path d="${d}" fill="none" stroke="${color}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>${extra}</g>`;
}

export function deltaSVG(o = {}) {
  const k = ++uid;
  const glow = (CORES[o.cor] || CORES.teal).g;
  const expr = o.expr || "idle";
  const eyeColor = o.acessorio === "oculos-vermelhos" ? "#ff3b3b" : glow;
  const white = o.cabeca === "capacete-astro";
  const suit = o.corpo === "traje-astro";
  const up = expr === "comemorando";
  const think = expr === "pensando";
  const hat = o.cabeca && HATS[o.cabeca] ? `<g transform="${HAT_T}">${HATS[o.cabeca]()}</g>` : o.cabeca === "peruca-euler" ? EULER : "";
  const IRI = `url(#dmiri${k})`, CL = `url(#dmcl${k})`, CLS = `url(#dmcls${k})`;
  const base = suit ? "#e7e8f0" : "#17161f", deep = suit ? "#aeb2c3" : "#07070b", lite = suit ? "#ffffff" : "#34324a";
  const seam = suit ? "#9ea3b6" : "#2b2a3b";

  // mangas: mãos no bolso (padrão), braços para cima (comemorando) ou mão no queixo (pensando)
  const sleeveDown = side => {
    const m = side < 0 ? "" : ` transform="translate(200 0) scale(-1 1)"`;
    return `<g${m}>
      <path d="M60 134 C47 142 42 158 45 172 C47 180 55 184 63 182 L76 177 C73 166 69 152 69 138 Z" fill="${CLS}" stroke="${deep}" stroke-width="1.5"/>
      <path d="M52 146 C50 156 51 166 55 174" stroke="${lite}" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>
      <path d="M49 168 C52 176 58 180 66 179" stroke="${deep}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/></g>`;
  };
  const sleeveUp = (side, tx, ty) => {
    const sx = 100 + side * 40, ex = 100 + side * tx;
    return `<path d="M${sx} 138 C${sx + side * 16} 126 ${ex - side * 4} ${ty + 22} ${ex} ${ty + 8}" stroke="${deep}" stroke-width="24" stroke-linecap="round" fill="none"/>
      <path d="M${sx} 138 C${sx + side * 16} 126 ${ex - side * 4} ${ty + 22} ${ex} ${ty + 8}" stroke="${base}" stroke-width="20" stroke-linecap="round" fill="none"/>
      <path d="M${sx + side * 6} 132 C${sx + side * 16} 124 ${ex - side * 8} ${ty + 22} ${ex - side * 4} ${ty + 12}" stroke="${lite}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".35"/>
      <ellipse cx="${ex}" cy="${ty + 6}" rx="11" ry="4" fill="none" stroke="${IRI}" stroke-width="3"/>
      <circle cx="${ex}" cy="${ty - 2}" r="10" fill="#0c0b12" stroke="#2c2a3c" stroke-width="1.5"/><path d="M${ex - 5} ${ty - 7} a6 6 0 0 1 7 -2" stroke="#fff" stroke-width="1.6" fill="none" opacity=".3" stroke-linecap="round"/>`;
  };
  const armsBack = up ? sleeveUp(-1, 66, 76) + sleeveUp(1, 66, 76) : "";
  const armsFront = up ? "" : sleeveDown(-1) + (think ? "" : sleeveDown(1));
  const armThink = think ? sleeveUp(1, 40, 112) : "";
  const pocket = side => { const x = side < 0 ? 0 : 200, f = side < 0 ? 1 : -1;
    return `<path d="M${x + f * 62} 160 C${x + f * 64} 168 ${x + f * 68} 176 ${x + f * 76} 180" stroke="${IRI}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`; };

  const handAcc = o.acessorio === "calculadora" ? `<g transform="translate(${up ? 8 : 4} ${up ? -94 : 4})"><rect x="140" y="150" width="22" height="30" rx="4" fill="#334155" stroke="#94a3b8" stroke-width="1.5"/><rect x="143" y="153" width="16" height="7" rx="1.5" fill="#a7f3d0"/>
      ${[0,1,2].map(r => [0,1,2].map(c => `<rect x="${143 + c*5.5}" y="${163 + r*5}" width="4" height="3.4" rx="1" fill="#e2e8f0"/>`).join("")).join("")}</g>`
    : o.acessorio === "lapis-dourado" ? `<g transform="translate(${up ? 20 : 2} ${up ? -92 : 0}) rotate(-30 150 165)"><rect x="146" y="130" width="9" height="40" rx="2" fill="#facc15" stroke="#a16207" stroke-width="1.5"/>
      <path d="M146 170 L150.5 181 L155 170 Z" fill="#fde68a" stroke="#a16207" stroke-width="1.2"/><rect x="146" y="126" width="9" height="6" rx="2" fill="#f472b6"/></g>` : "";
  const mask = o.acessorio === "mascara-carnaval" ? `<g transform="translate(0,-22)">
      <path d="M58 96 C66 84 86 84 96 98 C100 102 100 102 104 98 C114 84 134 84 142 96 C144 112 128 122 116 116 C108 112 104 108 100 108 C96 108 92 112 84 116 C72 122 56 112 58 96 Z" fill="#a855f7" stroke="#7e22ce" stroke-width="2" opacity=".92"/>
      <path d="M138 90 C148 70 160 66 168 60 M142 92 C156 78 166 78 174 74" stroke="#f472b6" stroke-width="4" stroke-linecap="round" fill="none"/></g>` : "";
  const cape = o.corpo === "capa-super" ? `<path d="M60 128 C42 160 38 196 46 222 L154 222 C162 196 158 160 140 128 Z" fill="#dc2626"/><path d="M60 128 C48 160 46 196 52 222" stroke="#991b1b" stroke-width="3" fill="none"/>` : "";
  const capeFront = o.corpo === "capa-super" ? `<path d="M70 130 L100 122 L130 130 L126 138 L100 130 L74 138 Z" fill="#b91c1c"/>` : "";
  const coat = o.corpo === "jaleco" ? `<path d="M50 186 L56 136 C64 128 80 126 88 128 L100 170 L112 128 C120 126 136 128 144 136 L150 186 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2.5"/>
      <path d="M100 170 L100 188" stroke="#cbd5e1" stroke-width="2"/><rect x="118" y="150" width="16" height="11" rx="2" fill="none" stroke="#cbd5e1" stroke-width="2"/><path d="M123 144 L125 152" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/>` : "";
  const bag = o.corpo === "mochila-enem" ? `<path d="M66 132 L80 186 M134 132 L120 186" stroke="#f97316" stroke-width="6" stroke-linecap="round"/>
      <rect x="148" y="140" width="22" height="42" rx="7" fill="#fb923c" stroke="#c2410c" stroke-width="2"/><text x="159" y="165" font-size="8" font-weight="800" text-anchor="middle" fill="#fff" font-family="Inter,sans-serif">ENEM</text>` : "";
  const suitPanel = `<rect x="84" y="146" width="32" height="20" rx="5" fill="#cbd0dc" stroke="#9ea3b6"/><circle cx="93" cy="156" r="3.5" fill="#ef4444"/><circle cx="104" cy="156" r="3.5" fill="#22c55e"/><rect x="109" y="153" width="5" height="6" rx="1" fill="#3b82f6"/>`;

  const leg = side => { const m = side < 0 ? "" : ` transform="translate(200 0) scale(-1 1)"`;
    return `<g${m}>
      <path d="M63 184 L99 184 L99 210 C99 216 94 218 84 218 C72 218 64 216 63 210 Z" fill="${CL}" stroke="${deep}" stroke-width="1.5"/>
      <path d="M65 188 L66 212" stroke="${IRI}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M78 190 C78 197 86 197 86 190" stroke="#6f6c86" stroke-width="1.8" fill="none"/><rect x="77" y="187" width="10" height="3" rx="1.5" fill="${seam}"/>
      <path d="M68 200 C76 203 90 203 97 200" stroke="${deep}" stroke-width="1.6" fill="none"/>
<g transform="translate(0 7)">      <path d="M58 212 C58 204 66 200 80 200 C93 200 101 204 101 212 L101 222 L56 222 C55 218 56 215 58 212 Z" fill="#0e0d15" stroke="#26243a" stroke-width="1.5"/>
      <path d="M60 214 C70 208 84 208 99 213" stroke="${IRI}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M72 202 L88 202 M73 206 L89 206" stroke="#cfc6ff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>
      <path d="M60 206 C62 203 66 202 70 202" stroke="#fff" stroke-width="1.6" fill="none" opacity=".25" stroke-linecap="round"/>
      <rect x="54" y="220" width="49" height="9" rx="4.5" fill="${IRI}"/><path d="M57 224.5 L100 224.5" stroke="#fff" stroke-width="1" opacity=".55"/></g></g>`; };

  return `<svg class="dm-svg" viewBox="-12 -20 224 262" role="img" aria-label="Delta, o micro astronauta do Projeto Delta" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dmiri${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5ee7ff"/><stop offset=".3" stop-color="#4f7bff"/><stop offset=".6" stop-color="#9b5cff"/><stop offset=".85" stop-color="#e055ff"/><stop offset="1" stop-color="#7df3ff"/></linearGradient>
    <radialGradient id="dmhel${k}" cx=".34" cy=".26" r=".85"><stop offset="0" stop-color="${white ? "#ffffff" : "#4a4760"}"/><stop offset=".35" stop-color="${white ? "#eceef5" : "#1d1c28"}"/><stop offset=".8" stop-color="${white ? "#b9bdcc" : "#0a0a10"}"/><stop offset="1" stop-color="${white ? "#9096aa" : "#030305"}"/></radialGradient>
    <linearGradient id="dmvis${k}" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#2a2838"/><stop offset=".45" stop-color="#0b0b12"/><stop offset="1" stop-color="#010103"/></linearGradient>
    <linearGradient id="dmcl${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lite}"/><stop offset=".25" stop-color="${base}"/><stop offset="1" stop-color="${deep}"/></linearGradient>
    <linearGradient id="dmcls${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${deep}"/><stop offset=".45" stop-color="${base}"/><stop offset=".7" stop-color="${lite}"/><stop offset="1" stop-color="${base}"/></linearGradient>
    <radialGradient id="dmbody${k}" cx=".5" cy=".2" r=".9"><stop offset="0" stop-color="${lite}"/><stop offset=".45" stop-color="${base}"/><stop offset="1" stop-color="${deep}"/></radialGradient>
    <filter id="dmglow" filterUnits="userSpaceOnUse" x="-20" y="-30" width="240" height="280"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <ellipse class="dm-shadow" cx="100" cy="239" rx="56" ry="7" fill="#000" opacity=".35"/>
  <g class="dm-all">
    ${cape}
    <g class="dm-legs">${leg(-1)}${leg(1)}</g>
    <g class="dm-arm">${armsBack}</g>
    <g class="dm-body">
      <path d="M56 134 C66 126 84 123 100 123 C116 123 134 126 144 134 C152 148 154 168 151 182 C134 190 66 190 49 182 C46 168 48 148 56 134 Z" fill="url(#dmbody${k})" stroke="${deep}" stroke-width="2"/>
      <path d="M50 178 C68 186 132 186 150 178 L150 188 C132 195 68 195 50 188 Z" fill="${deep}"/>
      ${Array.from({ length: 16 }, (_, i) => `<path d="M${56 + i * 5.8} ${182 + Math.sin(i / 15 * Math.PI) * 3} l0 8" stroke="${lite}" stroke-width="1" opacity=".22"/>`).join("")}
      ${suit ? suitPanel : `
      <path d="M100 126 L100 184" stroke="#7d7a90" stroke-width="1.4"/><path d="M100 128 L100 183" stroke="#4a4860" stroke-width="3.2" stroke-dasharray="1.2 1.8"/>
      <rect x="97.6" y="129" width="4.8" height="8" rx="1.4" fill="#b9b6c9"/><circle cx="100" cy="138.5" r="1.4" fill="#b9b6c9"/>
      <path d="M92 128 C91 136 91 144 90 151 M108 128 C109 136 109 144 110 151" stroke="#d9d5ea" stroke-width="1.7" fill="none" stroke-linecap="round"/>
      <rect x="88.6" y="150" width="3" height="5" rx="1" fill="#9d9ab0"/><rect x="108.4" y="150" width="3" height="5" rx="1" fill="#9d9ab0"/>
      <g filter="url(#dmglow)"><path d="M124 140 L131.5 153 L116.5 153 Z" fill="none" stroke="${IRI}" stroke-width="2.4" stroke-linejoin="round"/></g>
      <path d="M72 132 C80 128 92 127 98 127" stroke="${lite}" stroke-width="2" fill="none" opacity=".4" stroke-linecap="round"/>`}
      ${pocket(-1)}${pocket(1)}
      ${coat}${bag}${capeFront}
    </g>
    <g class="dm-arm dm-arm-f">${armsFront}
      ${up || suit ? "" : `<text x="0" y="0" transform="translate(52 170) rotate(-78)" font-family="Orbitron,Inter,sans-serif" font-size="5.2" font-weight="800" fill="#d9d5ea" letter-spacing=".5">DELTA</text>`}</g>
    ${handAcc}
    <g class="dm-head">
      <path d="M50 128 C48 112 62 106 74 112 C84 104 116 104 126 112 C138 106 152 112 150 128 C140 138 60 138 50 128 Z" fill="url(#dmbody${k})" stroke="${deep}" stroke-width="1.5"/>
      <path d="M58 124 C74 132 126 132 142 124" stroke="${lite}" stroke-width="2" fill="none" opacity=".35"/>
      <g class="dm-phones">
        <circle cx="40" cy="80" r="17" fill="#0c0b12" stroke="#23212f" stroke-width="2"/><circle cx="40" cy="80" r="12" fill="none" stroke="${IRI}" stroke-width="4" filter="url(#dmglow)"/><circle cx="40" cy="80" r="7.5" fill="#15141e"/>
        <circle cx="160" cy="80" r="17" fill="#0c0b12" stroke="#23212f" stroke-width="2"/><circle cx="160" cy="80" r="12" fill="none" stroke="${IRI}" stroke-width="4" filter="url(#dmglow)"/><circle cx="160" cy="80" r="7.5" fill="#15141e"/>
        <path d="M31 72 a11 11 0 0 1 8 -4 M151 72 a11 11 0 0 1 8 -4" stroke="#fff" stroke-width="1.5" fill="none" opacity=".35" stroke-linecap="round"/>
      </g>
      <circle cx="100" cy="72" r="60" fill="url(#dmhel${k})" stroke="${white ? "#8f95a8" : "#1f1e2b"}" stroke-width="2"/>
      <path d="M100 12.5 C130 16 152 36 158 62" stroke="${seam}" stroke-width="1.6" fill="none" opacity=".8"/>
      <path d="M100 12.5 C70 16 48 36 42 62" stroke="${seam}" stroke-width="1.6" fill="none" opacity=".5"/>
      <path d="M54 80 C54 50 74 38 100 38 C126 38 146 50 146 80 C146 108 126 120 100 120 C74 120 54 108 54 80 Z" fill="#050508"/>
      <path d="M58 80 C58 54 76 42 100 42 C124 42 142 54 142 80 C142 104 124 115 100 115 C76 115 58 104 58 80 Z" fill="url(#dmvis${k})" stroke="#cdbfff" stroke-width="1.8" filter="url(#dmglow)"/>
      <path d="M66 62 C72 52 84 47 98 46" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".2"/>
      <ellipse cx="74" cy="56" rx="5" ry="3" fill="#fff" opacity=".22" transform="rotate(-30 74 56)"/>
      <path d="M126 106 C132 102 137 96 139 89" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".12"/>
      <path d="M50 42 C58 28 74 18 92 15" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity="${white ? ".75" : ".3"}"/>
      <circle cx="46" cy="52" r="2.2" fill="#fff" opacity="${white ? ".6" : ".3"}"/>
      ${eyes(expr, eyeColor)}
      ${mask}${hat}
    </g>
    <g class="dm-arm dm-arm-t">${armThink}</g>
    ${think ? `<g class="dm-think"><circle cx="170" cy="30" r="4" fill="#fff"/><circle cx="182" cy="14" r="6" fill="#fff"/>
      <circle cx="196" cy="-6" r="15" fill="#fff"/><text x="196" y="1" text-anchor="middle" font-size="20" font-weight="800" fill="#7c3aed" font-family="Inter,sans-serif">?</text></g>` : ""}
    ${expr === "dormindo" ? `<g class="dm-zzz" font-family="Orbitron,Inter,sans-serif" font-weight="800" fill="${glow}"><text x="150" y="24" font-size="18">z</text><text x="166" y="8" font-size="14">z</text><text x="178" y="-6" font-size="11">z</text></g>` : ""}
    ${up ? `<g class="dm-spark" fill="${glow}">${[[16,30],[186,40],[6,120],[194,116]].map(([x,y]) => `<path d="M${x} ${y-8} L${x+2.5} ${y-2.5} L${x+8} ${y} L${x+2.5} ${y+2.5} L${x} ${y+8} L${x-2.5} ${y+2.5} L${x-8} ${y} L${x-2.5} ${y-2.5} Z"/>`).join("")}</g>` : ""}
    ${expr === "vida" ? `<g class="dm-heart"><path d="M176 14 C170 4 154 6 154 20 C154 32 176 42 176 42 C176 42 198 32 198 20 C198 6 182 4 176 14 Z" fill="#ff4d6d"/><path d="M176 16 L170 26 L180 30 L174 40" stroke="#0b0b0f" stroke-width="3" fill="none"/></g>` : ""}
  </g>
</svg>`;
}

export function fundoSVG(id) {
  const k = ++uid;
  const f = {
    espaco: `<rect width="200" height="200" fill="url(#fs${k})"/><ellipse cx="60" cy="60" rx="80" ry="40" fill="#4b0082" opacity=".45"/><ellipse cx="150" cy="150" rx="70" ry="30" fill="#2979ff" opacity=".18"/>${stars(22, "#fff")}`,
    lousa: `<rect width="200" height="200" fill="#16392a"/><rect x="0" y="186" width="200" height="14" fill="#6b4423"/>
      <g font-family="Inter,sans-serif" fill="#e7f5ec" opacity=".6"><text x="14" y="36" font-size="18">a² + b² = c²</text>
      <text x="110" y="74" font-size="16">x = 2</text><text x="20" y="150" font-size="16">π ≈ 3,14</text></g>
      <path d="M140 120 L180 160 L140 160 Z" fill="none" stroke="#e7f5ec" stroke-width="2" opacity=".55"/>`,
    festa: `<rect width="200" height="200" fill="#1a0f2e"/>${confetti(30)}`,
    galaxia: `<rect width="200" height="200" fill="#0d0620"/><ellipse cx="80" cy="90" rx="90" ry="40" fill="#7c3aed" opacity=".5" transform="rotate(-20 80 90)"/>
      <ellipse cx="130" cy="120" rx="70" ry="28" fill="#ff00e5" opacity=".3" transform="rotate(-20 130 120)"/>${stars(24, "#fde68a")}`,
    aurora: `<rect width="200" height="200" fill="#05121f"/><path d="M-10 90 C40 40 90 120 210 60 L210 110 C120 150 60 90 -10 140 Z" fill="#00f0ff" opacity=".35"/>
      <path d="M-10 60 C50 20 110 90 210 30 L210 60 C120 100 60 50 -10 90 Z" fill="#b6f23a" opacity=".25"/>${stars(12, "#fff")}`
  }[id] || "";
  return `<svg class="dm-bg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><radialGradient id="fs${k}" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#1b1140"/><stop offset="1" stop-color="#0b0b0f"/></radialGradient></defs>${f}</svg>`;
}

function stars(n, color) {
  let s = "", x = 7;
  for (let i = 0; i < n; i++) { x = (x * 9301 + 49297) % 233280; const a = x / 233280; x = (x * 9301 + 49297) % 233280; const b = x / 233280;
    s += `<circle cx="${(a * 200).toFixed(1)}" cy="${(b * 200).toFixed(1)}" r="${(0.6 + ((a + b) % 1) * 1.4).toFixed(2)}" fill="${color}" opacity="${(0.4 + b * 0.6).toFixed(2)}"/>`; }
  return s;
}
function confetti(n) {
  const cols = ["#00f0ff", "#ff00e5", "#2979ff", "#b6f23a", "#a855f7", "#ffc53d"];
  let s = "", x = 3;
  for (let i = 0; i < n; i++) { x = (x * 9301 + 49297) % 233280; const a = x / 233280; x = (x * 9301 + 49297) % 233280; const b = x / 233280;
    s += `<rect x="${(a * 196).toFixed(1)}" y="${(b * 196).toFixed(1)}" width="6" height="3" rx="1" fill="${cols[i % cols.length]}" transform="rotate(${Math.round(a * 360)} ${(a * 196 + 3).toFixed(1)} ${(b * 196 + 1.5).toFixed(1)})"/>`; }
  return s;
}

export function avatarHTML(av = {}, o = {}) {
  const bg = av.fundo || "espaco";
  return `<div class="dm-avatar ${o.cls || ""}">${o.nobg ? "" : fundoSVG(bg)}
    <div class="dm ${o.anim === false ? "" : "dm-live"}">${deltaSVG({ ...av, expr: o.expr })}</div></div>`;
}

// Logo oficial: Δ iridescente com o corte na base
export function logoSVG(o = {}) {
  const k = ++uid;
  const mark = `<defs><linearGradient id="lg${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff00e5"/><stop offset=".3" stop-color="#8b5cf6"/><stop offset=".55" stop-color="#00f0ff"/><stop offset=".8" stop-color="#2979ff"/><stop offset="1" stop-color="#ff00e5"/></linearGradient></defs>
    <path d="M50 8 L94 84 L8 84 Z" fill="none" stroke="url(#lg${k})" stroke-width="12" stroke-linejoin="miter"/>
    <path d="M78 90 L66 70" stroke="${o.bg || "#0b0b0f"}" stroke-width="3"/>`;
  if (!o.word) return `<svg class="logo-mark" viewBox="0 0 100 92" aria-hidden="true">${mark}</svg>`;
  return `<svg class="logo-full" viewBox="0 0 316 92" role="img" aria-label="Projeto Delta">${mark}
    <text x="118" y="38" font-family="Orbitron,sans-serif" font-weight="500" font-size="17" textLength="150" lengthAdjust="spacing" fill="currentColor">PROJETO</text>
    <text x="116" y="82" font-family="Orbitron,sans-serif" font-weight="800" font-size="40" textLength="150" lengthAdjust="spacing" fill="currentColor">DELT</text>
    <path d="M276 82 L292 45 L308 82" fill="none" stroke="currentColor" stroke-width="7.5" stroke-linejoin="miter"/></svg>`;
}

// Moeda Δ (vetorial, independe da fonte)
export const COIN = `<svg class="coin" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2 L21.2 19.4 H2.8 Z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/></svg>`;
