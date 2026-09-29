// ============================================================
// PROJETO DELTA · geradores de questões da plataforma
// Cada chamada cria uma versão nova (números diferentes), com a resposta
// calculada, alternativas erradas vindas de erros comuns e a resolução em passos.
// ============================================================

const R = (a, b, step = 1) => a + step * Math.floor(Math.random() * (Math.floor((b - a) / step) + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const nf = (n, d = 0) => Number(n).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
const num = n => { const r = Math.round(n * 100) / 100; return Number.isInteger(r) ? nf(r) : nf(r, Math.round(r * 10) / 10 === r ? 1 : 2); };
const sup = v => String(v).split("").map(d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]).join("");
const brl = n => "R$ " + nf(Math.round(n * 100) / 100, 2);
const pct = n => num(n) + "%";
const frac = (a, b) => { const g = gcd(a, b); return `${a / g}/${b / g}`; };
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// monta a questão: resposta certa + erros comuns (sem repetir), completa até 4 alternativas
function Q(q, certa, erradas, passos, fmt = num) {
  const set = [fmt(certa)];
  for (const w of erradas) { if (set.length >= 4) break; if (w == null || (typeof w === "number" && (!isFinite(w) || w < 0))) continue; const f = fmt(w); if (!set.includes(f)) set.push(f); }
  let k = 1;
  while (set.length < 4 && typeof certa === "number" && k < 40) {
    const delta = Math.max(1, Math.round(Math.abs(certa) * 0.1)) * Math.ceil(k / 2) * (k % 2 ? 1 : -1);
    const v = certa + delta; if (v >= 0) { const f = fmt(v); if (!set.includes(f)) set.push(f); } k++;
  }
  const o = shuffle(set);
  return { q, o, c: o.indexOf(set[0]), e: passos.join(" "), passos };
}

export const GEN = {
  // ---------------- Números e Grandezas ----------------
  "num-sucessivos": () => pick([
    () => { const P = R(100, 600, 20), a = pick([10, 20, 25, 30]), d = pick([10, 20, 25]); const f = P * (1 + a / 100) * (1 - d / 100);
      return Q(`Um produto de ${brl(P)} teve aumento de ${a}% e, depois, desconto de ${d}%. Qual é o preço final?`, f, [P * (1 + (a - d) / 100), P, P * (1 + a / 100) - d],
        [`Aumento de ${a}%: ${brl(P)} × ${nf(1 + a / 100, 2)} = ${brl(P * (1 + a / 100))}.`, `Desconto de ${d}% sobre o novo valor: × ${nf(1 - d / 100, 2)}.`, `Preço final: ${brl(f)}. Porcentagens sucessivas se multiplicam, não se somam.`], brl); },
    () => { const a = pick([10, 20, 30, 50]), b = pick([10, 20, 25]); const t = ((1 + a / 100) * (1 + b / 100) - 1) * 100;
      return Q(`Um salário teve dois aumentos seguidos: ${a}% e depois ${b}%. O aumento total foi de`, t, [a + b, a * b / 100, Math.max(a, b)],
        [`Multiplique os fatores: ${nf(1 + a / 100, 2)} × ${nf(1 + b / 100, 2)} = ${nf(1 + t / 100, 3)}.`, `O fator ${nf(1 + t / 100, 3)} significa aumento de ${pct(t)}.`, `Por isso o total é maior que ${a + b}%.`], pct); }
  ])(),
  "num-fracoes": () => pick([
    () => { const b = pick([4, 5, 6, 8, 10]), a = R(1, b - 1); const k = R(3, 12), T = b * k; const r = a * k;
      return Q(`Uma turma tem ${T} alunos e ${a}/${b} deles fizeram o simulado. Quantos alunos fizeram?`, r, [T / b, T * a, T - r],
        [`Divida o total pelo denominador: ${T} ÷ ${b} = ${k}.`, `Multiplique pelo numerador: ${k} × ${a} = ${r}.`, `Resposta: ${r} alunos.`]); },
    () => { const [a, b] = pick([[1, 4], [3, 4], [2, 5], [3, 5], [7, 10], [9, 20], [3, 25], [1, 8]]); const p = a / b * 100;
      return Q(`A fração ${a}/${b} corresponde a qual porcentagem?`, p, [a * 10, b, a / b * 10],
        [`Porcentagem é fração com denominador 100.`, `${a} ÷ ${b} = ${nf(a / b, 3)}.`, `${nf(a / b, 3)} × 100 = ${pct(p)}.`], pct); }
  ])(),
  "num-escalas": () => pick([
    () => { const k = pick([50000, 100000, 200000, 250000, 500000]), d = R(2, 12); const km = d * k / 100000;
      return Q(`Em um mapa na escala 1:${nf(k)}, duas cidades estão a ${d} cm. A distância real é de`, km, [km * 10, km / 10, d * k / 1000],
        [`Na escala 1:${nf(k)}, 1 cm no mapa vale ${nf(k)} cm reais.`, `${d} × ${nf(k)} = ${nf(d * k)} cm.`, `Divida por 100.000 para ter km: ${num(km)} km.`], v => num(v) + " km"); },
    () => { const k = pick([100000, 200000, 500000]), cm = R(2, 9); const km = cm * k / 100000;
      return Q(`Uma estrada de ${num(km)} km será desenhada num mapa de escala 1:${nf(k)}. Quantos centímetros ela terá no mapa?`, cm, [cm * 10, km, cm / 10],
        [`Passe a distância real para cm: ${num(km)} km = ${nf(km * 100000)} cm.`, `Divida pela escala: ${nf(km * 100000)} ÷ ${nf(k)} = ${cm}.`, `No mapa: ${cm} cm.`], v => num(v) + " cm"); }
  ])(),
  "num-velocidade": () => pick([
    () => { const v = R(40, 120, 10), t = R(2, 6); const d = v * t;
      return Q(`Um ônibus percorreu ${d} km em ${t} horas, sempre na mesma velocidade. Qual foi a velocidade média?`, v, [d * t, d / (t + 1), v + 10],
        [`Velocidade média = distância ÷ tempo.`, `${d} ÷ ${t} = ${v}.`, `Resposta: ${v} km/h.`], x => num(x) + " km/h"); },
    () => { const v = pick([60, 90, 120]), m = pick([20, 30, 40, 50, 80]); const d = v * m / 60;
      return Q(`A ${v} km/h, quantos minutos um carro leva para percorrer ${num(d)} km?`, m, [d / v, m + 10, v / d * 60],
        [`Tempo em horas = ${num(d)} ÷ ${v} = ${nf(d / v, 3)} h.`, `Em minutos: ${nf(d / v, 3)} × 60 = ${m}.`, `Resposta: ${m} minutos.`], x => num(x) + " min"); }
  ])(),
  "num-consumo": () => pick([
    () => { const c = R(8, 15), L = R(20, 60, 5); const D = c * L;
      return Q(`Um carro faz ${c} km por litro. Quantos litros ele gasta numa viagem de ${nf(D)} km?`, L, [D * c, D - c, L + c],
        [`Litros = distância ÷ consumo.`, `${nf(D)} ÷ ${c} = ${L}.`, `Resposta: ${L} litros.`], x => num(x) + " L"); },
    () => { const c = pick([10, 12, 15]), L = R(10, 40, 5), p = pick([5.2, 5.5, 5.8, 6, 6.2]); const D = c * L, custo = L * p;
      return Q(`Um carro faz ${c} km/L e a gasolina custa ${brl(p)} o litro. Quanto custa a gasolina para rodar ${nf(D)} km?`, custo, [D * p, L * c, custo + p * 5],
        [`Litros: ${nf(D)} ÷ ${c} = ${L} L.`, `Custo: ${L} × ${brl(p)} = ${brl(custo)}.`], brl); }
  ])(),
  "num-composta": () => { const w = pick([2, 3, 4, 5]), d = pick([2, 3, 4, 5, 6]), k = R(2, 6); const u = w * d * k; const w2 = w + R(1, 4), d2 = d + R(-1, 3) || d; const r = w2 * d2 * k;
    return Q(`${w} máquinas iguais produzem ${u} peças em ${d} dias. Quantas peças ${w2} máquinas produzem em ${d2} dias?`, r, [Math.round(u * w / w2 * d2 / d), u * w2 / w, u * d2 / d],
      [`Cada máquina faz ${u} ÷ (${w} × ${d}) = ${k} peças por dia.`, `Mais máquinas e mais dias produzem mais: grandezas diretas.`, `${w2} × ${d2} × ${k} = ${r} peças.`]); },
  "num-tempo": () => pick([
    () => { const h = R(7, 15), m = R(10, 55, 5), dh = R(1, 4), dm = R(20, 55, 5); const tot = h * 60 + m + dh * 60 + dm; const hh = Math.floor(tot / 60), mm = tot % 60;
      const f = x => typeof x === "string" ? x : `${Math.floor(x / 60)}h${String(x % 60).padStart(2, "0")}`;
      return Q(`Uma prova começou às ${h}h${String(m).padStart(2, "0")} e durou ${dh} h ${dm} min. A que horas terminou?`, tot, [tot - 60, tot + 60, (h + dh) * 60 + (m + dm) % 60],
        [`Some as horas: ${h} + ${dh} = ${h + dh}.`, `Some os minutos: ${m} + ${dm} = ${m + dm}${m + dm >= 60 ? `, que é 1 h e ${m + dm - 60} min` : ""}.`, `Terminou às ${hh}h${String(mm).padStart(2, "0")}.`], f); },
    () => { const t = R(75, 290, 5); const f = x => `${Math.floor(x / 60)} h ${x % 60} min`;
      return Q(`${t} minutos correspondem a`, t, [Math.floor(t / 100) * 60 + t % 100, t + 10, t - 20],
        [`Cada hora tem 60 minutos.`, `${t} ÷ 60 = ${Math.floor(t / 60)} com resto ${t % 60}.`, `Resposta: ${f(t)}.`], f); }
  ])(),
  "num-arredonda": () => pick([
    () => { const x = R(1000, 9999) / 1000; const r = Math.round(x * 10) / 10;
      return Q(`Arredondando ${nf(x, 3)} para uma casa decimal, obtemos`, r, [Math.floor(x * 10) / 10 === r ? r + 0.1 : Math.floor(x * 10) / 10, Math.round(x * 100) / 100, Math.round(x)],
        [`Olhe a segunda casa decimal de ${nf(x, 3)}.`, `Se ela for 5 ou mais, arredonde a primeira para cima; senão, mantenha.`, `Resultado: ${nf(r, 1)}.`], v => nf(v, Math.round(v * 100) % 10 ? 2 : 1)); },
    () => { const m = pick([1.2, 2.5, 2.9, 3.5, 4.3, 6, 7.8]), e = R(3, 8); const og = m >= 3.16 ? e + 1 : e;
      const f = v => "10" + sup(v);
      return Q(`A ordem de grandeza de ${nf(m, 1)} × 10${sup(e)} é`, og, [og === e ? e + 1 : e, e - 1, e + 2],
        [`Compare ${nf(m, 1)} com √10 ≈ 3,16.`, m >= 3.16 ? `Como ${nf(m, 1)} ≥ 3,16, a ordem sobe uma potência.` : `Como ${nf(m, 1)} < 3,16, a ordem fica na mesma potência.`, `Ordem de grandeza: ${f(og)}.`], f); }
  ])(),
  "num-compostos": () => pick([
    () => { const C = R(1, 8) * 1000, i = pick([5, 10, 20]), t = pick([2, 3]); const M = C * Math.pow(1 + i / 100, t);
      return Q(`${brl(C)} são aplicados a juros compostos de ${i}% ao mês por ${t} meses. Qual o montante?`, M, [C * (1 + i * t / 100), C * i * t / 100, C * Math.pow(1 + i / 100, t - 1)],
        [`Juros compostos: M = C × (1 + i)^t.`, `M = ${brl(C)} × ${nf(1 + i / 100, 2)}^${t} = ${brl(C)} × ${nf(Math.pow(1 + i / 100, t), 4)}.`, `M = ${brl(M)}.`], brl); },
    () => { const P = R(8, 30) * 100, n = pick([6, 10, 12]), extra = R(5, 25) * 10; const x = (P + extra) / n; const tot = x * n;
      return Q(`Uma TV custa ${brl(P)} à vista ou ${n} parcelas de ${brl(x)}. Quanto se paga a mais no parcelado?`, tot - P, [x, tot, (tot - P) / n],
        [`Total parcelado: ${n} × ${brl(x)} = ${brl(tot)}.`, `Diferença: ${brl(tot)} − ${brl(P)} = ${brl(tot - P)}.`], brl); }
  ])(),
  "num-divisao": () => { let a = R(1, 5), b = R(2, 7); if (a === b) b++; const g = gcd(a, b); a /= g; b /= g; const k = R(20, 150, 10); const T = (a + b) * k; const big = Math.max(a, b) * k;
    return Q(`Dois sócios dividem um lucro de ${brl(T)} na razão ${a}:${b}. Quanto recebe quem fica com a maior parte?`, big, [T / 2, Math.min(a, b) * k, T * Math.max(a, b) / Math.min(a, b) / (a + b)],
      [`Some as partes da razão: ${a} + ${b} = ${a + b}.`, `Cada parte vale ${brl(T)} ÷ ${a + b} = ${brl(k)}.`, `A maior parte: ${Math.max(a, b)} × ${brl(k)} = ${brl(big)}.`], brl); },

  // ---------------- Álgebra e Funções ----------------
  "alg-graficos": () => pick([
    () => { const a = R(2, 9), b = R(1, 12), x = R(4, 10); const y = a * x + b;
      return Q(`Uma função afim tem f(0) = ${b} e f(1) = ${a + b}. Qual é o valor de f(${x})?`, y, [a * x, (a + b) * x, a + b * x],
        [`f(0) = ${b} é o coeficiente linear.`, `A taxa é f(1) − f(0) = ${a}. Logo f(x) = ${a}x + ${b}.`, `f(${x}) = ${a} × ${x} + ${b} = ${y}.`]); },
    () => { const x1 = R(0, 4), dx = R(2, 5), m = R(-4, 6) || 3, y1 = R(2, 20); const x2 = x1 + dx, y2 = y1 + m * dx;
      return Q(`O gráfico de uma reta passa por (${x1}, ${y1}) e (${x2}, ${y2}). Qual é a taxa de variação?`, m, [(y2 - y1) + dx, dx / (y2 - y1), y2 / x2],
        [`Taxa = (y₂ − y₁) ÷ (x₂ − x₁).`, `(${y2} − ${y1}) ÷ (${x2} − ${x1}) = ${y2 - y1} ÷ ${dx}.`, `Taxa de variação: ${m}.`], v => (v < 0 ? "−" : "") + num(Math.abs(Math.round(v * 100) / 100))); }
  ])(),
  "alg-padroes": () => pick([
    () => { const a1 = R(3, 6), r = R(2, 5), n = R(12, 30); const an = a1 + (n - 1) * r;
      return Q(`Na figura 1 há ${a1} palitos, na figura 2 há ${a1 + r} e na figura 3 há ${a1 + 2 * r}. Quantos palitos terá a figura ${n}?`, an, [a1 * n, r * n, a1 + n * r],
        [`A cada figura aumentam ${r} palitos: é uma PA de razão ${r}.`, `aₙ = a₁ + (n − 1) × r = ${a1} + ${n - 1} × ${r}.`, `a${n} = ${an}.`]); },
    () => { const k = R(0, 5), n = R(8, 15); const v = n * n + k;
      return Q(`Observe a sequência ${[1, 2, 3, 4].map(i => i * i + k).join(", ")}, ... Qual é o ${n}º termo?`, v, [n * n, 2 * n + k, (n + 1) * (n + 1) + k],
        [`Os termos são quadrados perfeitos somados a ${k}: n² + ${k}.`, `Para n = ${n}: ${n}² + ${k} = ${n * n} + ${k}.`, `Resposta: ${v}.`]); }
  ])(),
  "alg-eq1": () => pick([
    () => { const a = R(2, 9), x = R(2, 15), b = R(1, 30); const c = a * x + b;
      return Q(`Resolva: ${a}x + ${b} = ${c}. O valor de x é`, x, [(c + b) / a, c / a, (c - b) * a],
        [`Passe o ${b} para o outro lado: ${a}x = ${c} − ${b} = ${c - b}.`, `Divida por ${a}: x = ${c - b} ÷ ${a}.`, `x = ${x}.`]); },
    () => { const m = pick([2, 3, 4, 5]), x = R(4, 20), b = R(3, 25); const c = m * x + b; const nome = { 2: "O dobro", 3: "O triplo", 4: "O quádruplo", 5: "O quíntuplo" }[m];
      return Q(`${nome} de um número, somado a ${b}, dá ${c}. Que número é esse?`, x, [(c + b) / m, c - b, c / m],
        [`Monte a equação: ${m}x + ${b} = ${c}.`, `${m}x = ${c - b}.`, `x = ${x}.`]); }
  ])(),
  "alg-sistemas": () => pick([
    () => { const c = R(5, 30), m = R(5, 30); const V = c + m, Rr = 4 * c + 2 * m;
      return Q(`Num estacionamento há ${V} veículos entre carros e motos, somando ${Rr} rodas. Quantas são as motos?`, m, [c, V / 2, Rr / 4],
        [`c + m = ${V} e 4c + 2m = ${Rr}.`, `Se todos fossem motos: ${2 * V} rodas. Sobram ${Rr - 2 * V} rodas, 2 a mais por carro, então c = ${c}.`, `Motos: ${V} − ${c} = ${m}.`]); },
    () => { const x = R(10, 40), y = R(1, x - 1); const S = x + y, D = x - y;
      return Q(`A soma de dois números é ${S} e a diferença entre eles é ${D}. O maior número é`, x, [y, S / 2, S - y + 1],
        [`x + y = ${S} e x − y = ${D}.`, `Somando as equações: 2x = ${S + D}.`, `x = ${x}.`]); }
  ])(),
  "alg-eq2": () => { const r1 = R(-6, 9), r2 = R(1, 10); const s = r1 + r2, p = r1 * r2;
    const t = (v, first) => v === 0 ? "" : (v > 0 ? (first ? "" : " + ") : " − ") + Math.abs(v);
    const eq = `x²${s === 0 ? "" : (s > 0 ? " − " : " + ") + (Math.abs(s) === 1 ? "" : Math.abs(s)) + "x"}${t(p)} = 0`;
    return pick([
      () => Q(`Qual é a soma das raízes da equação ${eq}?`, s, [-s, p, Math.max(r1, r2)], [`Em x² + bx + c = 0, a soma das raízes é −b.`, `Aqui b = ${-s}, então a soma é ${s}.`, `De fato, as raízes são ${r1} e ${r2}.`], v => (v < 0 ? "−" : "") + Math.abs(v)),
      () => Q(`Qual é a maior raiz da equação ${eq}?`, Math.max(r1, r2), [Math.min(r1, r2), s, p], [`Procure dois números com soma ${s} e produto ${p}.`, `São ${r1} e ${r2}.`, `A maior raiz é ${Math.max(r1, r2)}.`], v => (v < 0 ? "−" : "") + Math.abs(v))
    ])(); },
  "alg-ineq": () => pick([
    () => { const a = R(2, 6), b = R(1, 20), c = b + R(5, 40); const lim = (c - b) / a; const x = Math.floor(lim) + 1;
      return Q(`Qual é o menor número inteiro x tal que ${a}x + ${b} > ${c}?`, x, [Math.floor(lim), x + 1, Math.ceil((c + b) / a)],
        [`${a}x > ${c} − ${b} = ${c - b}.`, `x > ${num(lim)}.`, `O menor inteiro maior que ${num(lim)} é ${x}.`]); },
    () => { const f = R(20, 60, 5), g = pick([5, 8, 10, 12]), gb = R(3, 12); const c = f + g * gb + R(0, g - 1);
      return Q(`Um plano de internet cobra ${brl(f)} fixos mais ${brl(g)} por GB extra. Com ${brl(c)}, quantos GB extras dá para usar, no máximo?`, gb, [gb + 1, Math.round(c / g), Math.floor((c + f) / g)],
        [`${f} + ${g}·x ≤ ${c}.`, `${g}·x ≤ ${c - f}, então x ≤ ${num((c - f) / g)}.`, `No máximo ${gb} GB inteiros.`], v => num(v) + " GB"); }
  ])(),
  "alg-lucro": () => pick([
    () => { const v = R(5, 30), m = R(4, 20), q = R(20, 200, 10); const p = v + m, F = m * q;
      return Q(`Uma fábrica tem custo fixo de ${brl(F)} e gasta ${brl(v)} por peça. Vendendo cada peça a ${brl(p)}, quantas peças ela precisa vender para não ter prejuízo?`, q, [F / p, F / v, q * 2],
        [`Cada peça deixa ${brl(p)} − ${brl(v)} = ${brl(m)} de margem.`, `Para cobrir o fixo: ${brl(F)} ÷ ${brl(m)} = ${q}.`, `Ponto de equilíbrio: ${q} peças.`], x => num(x) + " peças"); },
    () => { const v = R(3, 15), m = R(3, 12), F = R(2, 10) * 100, q = R(100, 400, 20); const L = m * q - F; const p = v + m;
      return Q(`Custo: C(x) = ${F} + ${v}x. Receita: R(x) = ${p}x. Qual o lucro vendendo ${q} unidades?`, L, [p * q - v * q, p * q - F, L + F],
        [`Lucro = Receita − Custo.`, `R(${q}) = ${nf(p * q)} e C(${q}) = ${nf(F + v * q)}.`, `Lucro = ${brl(L)}.`], brl); }
  ])(),
  "alg-maxmin": () => pick([
    () => { const t = R(1, 5), v = 10 * t; const h = -5 * t * t + v * t;
      return Q(`A altura de uma bola, em metros, é h(t) = −5t² + ${v}t. Qual é a altura máxima?`, h, [v * t, h * 2, v],
        [`O máximo ocorre no vértice: t = −b ÷ 2a = ${v} ÷ 10 = ${t} s.`, `h(${t}) = −5 × ${t * t} + ${v} × ${t}.`, `Altura máxima: ${h} m.`], x => num(x) + " m"); },
    () => { const xv = R(2, 9), k = R(1, 20); const b = 2 * xv, c = k - xv * xv; const ymax = k;
      return Q(`Para qual valor de x a função f(x) = −x² + ${b}x ${c >= 0 ? "+ " + c : "− " + Math.abs(c)} atinge seu valor máximo?`, xv, [b, ymax, xv * 2 + 1],
        [`O vértice fica em x = −b ÷ 2a.`, `x = −${b} ÷ (2 × (−1)) = ${xv}.`, `Nesse ponto, f(${xv}) = ${ymax}.`]); }
  ])(),
  "alg-crescimento": () => pick([
    () => { const P = R(1, 9) * 100, k = pick([2, 3, 4, 5]), n = R(2, 5); const Pf = P * Math.pow(2, n);
      return Q(`Uma cultura de bactérias começa com ${nf(P)} e dobra a cada ${k} horas. Quantas haverá após ${k * n} horas?`, Pf, [P * 2 * n, P * n, P * Math.pow(2, n - 1)],
        [`Em ${k * n} h cabem ${n} períodos de ${k} h.`, `Cada período multiplica por 2: ${nf(P)} × 2^${n}.`, `Resultado: ${nf(Pf)}.`], v => nf(v)); },
    () => { const M = pick([160, 320, 640, 800]), n = R(2, 4), meia = pick([5, 8, 10, 30]); const f = M / Math.pow(2, n);
      return Q(`Uma substância tem meia-vida de ${meia} anos. De ${M} g, quanto restará após ${meia * n} anos?`, f, [M - M / 2 * n, M / (2 * n), M / Math.pow(2, n - 1)],
        [`${meia * n} anos são ${n} meias-vidas.`, `Divida por 2 a cada meia-vida: ${M} ÷ 2^${n}.`, `Restam ${num(f)} g.`], v => num(v) + " g"); }
  ])(),
  "alg-expressoes": () => pick([
    () => { const a = R(30, 90), b = a - 2 * R(1, 10); const r = a * a - b * b;
      return Q(`Sem calculadora: ${a}² − ${b}² é igual a`, r, [(a - b) * (a - b), a - b, (a + b) * (a + b) / 10],
        [`Use a diferença de quadrados: a² − b² = (a + b)(a − b).`, `(${a} + ${b})(${a} − ${b}) = ${a + b} × ${a - b}.`, `Resultado: ${nf(r)}.`], v => nf(v)); },
    () => { const x = R(2, 9), a = R(1, 8); const r = (x + a) * (x + a);
      return Q(`Para x = ${x}, quanto vale (x + ${a})²?`, r, [x * x + a * a, 2 * (x + a), x * x + a],
        [`(x + ${a})² = x² + 2·${a}·x + ${a * a}.`, `Com x = ${x}: ${x * x} + ${2 * a * x} + ${a * a}.`, `Resultado: ${r}. Cuidado: não é x² + ${a * a}.`]); }
  ])(),

  // ---------------- Geometria ----------------
  "geo-angulos": () => pick([
    () => { const n = R(5, 12); const s = (n - 2) * 180; const nome = { 5: "pentágono", 6: "hexágono", 7: "heptágono", 8: "octógono", 9: "eneágono", 10: "decágono", 11: "undecágono", 12: "dodecágono" }[n];
      return Q(`Qual é a soma dos ângulos internos de um ${nome}?`, s, [n * 180, (n - 1) * 180, 360],
        [`Um polígono de n lados pode ser dividido em n − 2 triângulos.`, `${nome}: ${n} − 2 = ${n - 2} triângulos.`, `${n - 2} × 180° = ${nf(s)}°.`], v => nf(v) + "°"); },
    () => { const n = R(5, 12); const d = n * (n - 3) / 2;
      return Q(`Quantas diagonais tem um polígono de ${n} lados?`, d, [n * (n - 3), n * (n - 1) / 2, n - 3],
        [`De cada vértice saem ${n} − 3 = ${n - 3} diagonais.`, `${n} × ${n - 3} conta cada diagonal duas vezes.`, `${n * (n - 3)} ÷ 2 = ${d}.`]); }
  ])(),
  "geo-capacidade": () => pick([
    () => { const a = R(2, 6) * 10, b = R(2, 5) * 10, c = R(1, 4) * 10; const L = a * b * c / 1000;
      return Q(`Uma caixa tem ${a} cm × ${b} cm × ${c} cm por dentro. Quantos litros ela comporta?`, L, [L * 10, L / 10, a + b + c],
        [`Volume: ${a} × ${b} × ${c} = ${nf(a * b * c)} cm³.`, `1 L = 1.000 cm³.`, `${nf(a * b * c)} ÷ 1.000 = ${num(L)} L.`], v => num(v) + " L"); },
    () => { const a = R(4, 10), b = R(2, 5), h = pick([1, 1.5, 2]); const L = a * b * h * 1000;
      return Q(`Uma piscina tem ${a} m de comprimento, ${b} m de largura e ${nf(h, h % 1 ? 1 : 0)} m de profundidade. Quantos litros cabem nela?`, L, [a * b * h * 100, a * b * h, L * 10],
        [`Volume: ${a} × ${b} × ${nf(h, h % 1 ? 1 : 0)} = ${num(a * b * h)} m³.`, `1 m³ = 1.000 L.`, `Cabem ${nf(L)} litros.`], v => nf(v) + " L"); }
  ])(),
  "geo-circulo": () => pick([
    () => { const r = R(2, 12); const A = 3 * r * r;
      return Q(`Qual é a área de um círculo de raio ${r} m? Use π = 3.`, A, [2 * 3 * r, 3 * (2 * r) * (2 * r), 3 * r],
        [`Área do círculo: A = π·r².`, `A = 3 × ${r}² = 3 × ${r * r}.`, `A = ${A} m².`], v => num(v) + " m²"); },
    () => { const d = R(2, 20) * 2; const C = 3 * d;
      return Q(`Uma roda tem ${d} cm de diâmetro. Quanto ela anda em uma volta completa? Use π = 3.`, C, [3 * (d / 2), 3 * (d / 2) * (d / 2), 2 * 3 * d],
        [`Uma volta é o comprimento da circunferência: C = π·d.`, `C = 3 × ${d}.`, `C = ${C} cm.`], v => num(v) + " cm"); }
  ])(),
  "geo-compostas": () => { const a = R(8, 20), b = R(6, 16), c = R(2, Math.min(a, b) - 2); const A = a * b - c * c;
    return Q(`Um terreno retangular de ${a} m × ${b} m tem um canto quadrado de ${c} m × ${c} m que não será usado. Qual a área útil?`, A, [a * b, a * b + c * c, (a - c) * (b - c)],
      [`Área total: ${a} × ${b} = ${a * b} m².`, `Área do canto: ${c} × ${c} = ${c * c} m².`, `Área útil: ${a * b} − ${c * c} = ${A} m².`], v => num(v) + " m²"); },
  "geo-semelhanca": () => pick([
    () => { const h1 = pick([1, 1.5, 2]), s1 = pick([0.5, 1, 2, 3]), k = R(4, 12); const s2 = s1 * k, h2 = h1 * k;
      return Q(`Uma vara de ${num(h1)} m faz uma sombra de ${num(s1)} m. No mesmo instante, um prédio faz sombra de ${num(s2)} m. Qual a altura do prédio?`, h2, [s2 / h1, h1 + s2 - s1, s2 * s1],
        [`Os triângulos de luz e sombra são semelhantes.`, `Altura ÷ sombra é igual: ${num(h1)} ÷ ${num(s1)} = h ÷ ${num(s2)}.`, `h = ${num(h2)} m.`], v => num(v) + " m"); },
    () => { const k = R(2, 5), A = R(3, 20);
      return Q(`Uma foto de ${A} cm² de área é ampliada, e todos os lados ficam ${k} vezes maiores. Qual a nova área?`, A * k * k, [A * k, A * 2 * k, A + k * k],
        [`Se os lados multiplicam por ${k}, a área multiplica por ${k}² = ${k * k}.`, `${A} × ${k * k} = ${A * k * k}.`], v => num(v) + " cm²"); }
  ])(),
  "geo-transform": () => { const x = R(1, 9), y = R(1, 9); const f = p => `(${p[0] < 0 ? "−" + Math.abs(p[0]) : p[0]}, ${p[1] < 0 ? "−" + Math.abs(p[1]) : p[1]})`;
    return pick([
      () => Q(`O ponto (${x}, ${y}) é refletido em relação ao eixo y. Qual é a nova posição?`, [-x, y], [[x, -y], [-x, -y], [y, x]], [`Na reflexão no eixo y, o x troca de sinal.`, `O y continua igual.`, `Resultado: ${f([-x, y])}.`], f),
      () => Q(`O ponto (${x}, ${y}) é transladado 3 unidades para a esquerda e 2 para cima. Onde ele fica?`, [x - 3, y + 2], [[x + 3, y + 2], [x - 3, y - 2], [x + 2, y - 3]], [`Esquerda diminui o x: ${x} − 3 = ${x - 3}.`, `Para cima aumenta o y: ${y} + 2 = ${y + 2}.`, `Resultado: ${f([x - 3, y + 2])}.`], f)
    ])(); },
  "geo-distancia": () => { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]); const x1 = R(-3, 5), y1 = R(-3, 5);
    return Q(`Qual a distância entre os pontos (${x1}, ${y1}) e (${x1 + a}, ${y1 + b})?`, c, [a + b, b - a, a * b / 2],
      [`Diferenças: Δx = ${a} e Δy = ${b}.`, `d = √(${a}² + ${b}²) = √${a * a + b * b}.`, `d = ${c}.`]); },
  "geo-pontomedio": () => { const x1 = R(-6, 8), y1 = R(-6, 8), x2 = x1 + 2 * R(1, 6), y2 = y1 + 2 * R(-5, 5); const m = [(x1 + x2) / 2, (y1 + y2) / 2];
    const f = p => `(${p[0] < 0 ? "−" + Math.abs(p[0]) : p[0]}, ${p[1] < 0 ? "−" + Math.abs(p[1]) : p[1]})`;
    return Q(`Qual é o ponto médio entre A(${x1}, ${y1}) e B(${x2}, ${y2})?`, m, [[x2 - x1, y2 - y1], [x1 + x2, y1 + y2], [(x2 - x1) / 2, (y2 - y1) / 2], [m[1], m[0]], [m[0] + 1, m[1] - 1], [m[0] - 1, m[1] + 2]],
      [`Ponto médio: média dos x e média dos y.`, `x = (${x1} + ${x2}) ÷ 2 = ${m[0]}; y = (${y1} + ${y2}) ÷ 2 = ${m[1]}.`, `M = ${f(m)}.`], f); },
  "geo-reta": () => pick([
    () => { const m = R(-4, 5) || 2, b = R(-8, 10), x = R(2, 9); const y = m * x + b;
      return Q(`A reta y = ${m}x ${b >= 0 ? "+ " + b : "− " + Math.abs(b)} passa pelo ponto de abscissa x = ${x}. Qual é a ordenada?`, y, [m + b * x, m * x - b, m * (x + b)],
        [`Substitua x por ${x}.`, `y = ${m} × ${x} ${b >= 0 ? "+ " + b : "− " + Math.abs(b)}.`, `y = ${y}.`], v => (v < 0 ? "−" : "") + Math.abs(v)); },
    () => { const m = R(1, 6), b = m + R(1, 8);
      return Q(`Uma corrida de aplicativo custa ${brl(b)} de bandeirada mais ${brl(m)} por km. Qual equação dá o preço y para x km?`, `y = ${m}x + ${b}`, [`y = ${b}x + ${m}`, `y = ${m + b}x`, `y = ${m}x − ${b}`],
        [`O valor fixo é o coeficiente linear: ${b}.`, `O valor por km é o coeficiente angular: ${m}.`, `y = ${m}x + ${b}.`], v => v); }
  ])(),
  "geo-mapa": () => { const x1 = R(0, 4), y1 = R(0, 4), dx = R(2, 7), dy = R(2, 7);
    return Q(`Numa cidade em grade, Ana está na esquina (${x1}, ${y1}) e a escola na (${x1 + dx}, ${y1 + dy}). Andando só pelas ruas, quantos quarteirões no mínimo ela percorre?`, dx + dy, [Math.max(dx, dy), Math.round(Math.sqrt(dx * dx + dy * dy)), dx * dy],
      [`Pelas ruas não dá para cortar na diagonal.`, `Ela anda ${dx} na horizontal e ${dy} na vertical.`, `Total: ${dx} + ${dy} = ${dx + dy} quarteirões.`], v => num(v)); },

  // ---------------- Estatística e Probabilidade ----------------
  "est-ponderada": () => { const w = pick([[2, 3, 5], [1, 2, 7], [3, 3, 4], [1, 4, 5]]), n = [R(4, 10), R(4, 10), R(4, 10)]; const m = (n[0] * w[0] + n[1] * w[1] + n[2] * w[2]) / 10;
    return Q(`Um aluno tirou ${n.join(", ")} em três provas com pesos ${w.join(", ")}. Qual a média ponderada?`, m, [(n[0] + n[1] + n[2]) / 3, m + 1, (n[0] * w[0] + n[1] * w[1] + n[2] * w[2])],
      [`Multiplique cada nota pelo peso: ${n.map((x, i) => `${x}×${w[i]}`).join(" + ")} = ${n[0] * w[0] + n[1] * w[1] + n[2] * w[2]}.`, `Some os pesos: ${w[0] + w[1] + w[2]}.`, `Média: ${num(m)}.`], v => nf(Math.round(v * 10) / 10, 1)); },
  "est-condicional": () => { const A = pick([20, 25, 40, 50]), B = Math.round(A * pick([0.2, 0.4, 0.6, 0.8])), N = A + R(20, 60, 10);
    return Q(`Numa escola, ${N} alunos responderam uma pesquisa: ${A} gostam de Matemática e, desses, ${B} são meninas. Escolhendo ao acaso um aluno que gosta de Matemática, qual a chance de ser menina?`, B / A * 100, [B / N * 100, A / N * 100, (A - B) / A * 100],
      [`Sabemos que o aluno gosta de Matemática: o espaço agora tem ${A} alunos.`, `Meninas nesse grupo: ${B}.`, `${B} ÷ ${A} = ${pct(B / A * 100)}.`], pct); },
  "est-mediana": () => pick([
    () => { const n = pick([5, 7]); const v = Array.from({ length: n }, () => R(2, 30)); const s = v.slice().sort((a, b) => a - b); const med = s[(n - 1) / 2]; const mean = v.reduce((a, b) => a + b) / n;
      return Q(`Qual é a mediana dos valores ${v.join(", ")}?`, med, [v[(n - 1) / 2], Math.round(mean), s[n - 1] - s[0]],
        [`Coloque em ordem: ${s.join(", ")}.`, `Com ${n} valores, a mediana é o ${(n + 1) / 2}º.`, `Mediana: ${med}.`]); },
    () => { const m = R(3, 9); const v = shuffle([m, m, m, R(1, 12), R(1, 12), R(1, 12)].map((x, i) => i > 2 && x === m ? x + 1 : x)); const others = v.filter(x => x !== m);
      return Q(`Nas notas ${v.join(", ")}, qual é a moda?`, m, [others[0], Math.round(v.reduce((a, b) => a + b) / v.length), Math.max(...v)],
        [`Moda é o valor que mais aparece.`, `${m} aparece 3 vezes.`, `Moda: ${m}.`]); }
  ])(),
  "est-graficopct": () => pick([
    () => { const p = pick([10, 15, 20, 25, 30, 40, 45]); const g = p * 3.6;
      return Q(`Num gráfico de setores, uma fatia representa ${p}% do total. Qual é o ângulo dessa fatia?`, g, [p, p * 1.8, 360 - g],
        [`O círculo inteiro tem 360°.`, `${p}% de 360° = ${p / 100} × 360.`, `Ângulo: ${num(g)}°.`], v => num(v) + "°"); },
    () => { const N = R(4, 20) * 50, p = pick([12, 18, 24, 35, 42, 64]); const r = N * p / 100;
      return Q(`Numa pesquisa com ${nf(N)} pessoas, o gráfico mostra que ${p}% preferem estudar à noite. Quantas pessoas são?`, r, [N - r, p * 10, N / p],
        [`${p}% = ${p}/100.`, `${nf(N)} × ${p} ÷ 100 = ${num(r)}.`], v => num(v)); }
  ])(),
  "est-frequencia": () => { const vals = [R(1, 3), R(4, 6), R(7, 9)], f = [R(1, 5), R(1, 5), R(1, 5)]; const tot = f[0] + f[1] + f[2]; const s = vals[0] * f[0] + vals[1] * f[1] + vals[2] * f[2]; const m = s / tot;
    return Q(`Na tabela, o valor ${vals[0]} aparece ${f[0]} vezes, o valor ${vals[1]} aparece ${f[1]} vezes e o valor ${vals[2]} aparece ${f[2]} vezes. Qual é a média?`, m, [(vals[0] + vals[1] + vals[2]) / 3, s, tot],
      [`Multiplique valor × frequência: ${s} no total.`, `Total de observações: ${tot}.`, `Média: ${s} ÷ ${tot} = ${nf(Math.round(m * 100) / 100, 2)}.`], v => nf(Math.round(v * 100) / 100, 2)); },
  "est-pesquisa": () => pick([
    () => { const [a, b] = pick([[40, 50], [20, 25], [50, 60], [30, 45], [60, 75]]); const r = (b - a) / a * 100;
      return Q(`A aprovação de um projeto subiu de ${a}% para ${b}%. Qual foi o aumento percentual?`, r, [b - a, (b - a) / b * 100, b / a],
        [`A diferença é de ${b - a} pontos percentuais.`, `Aumento percentual compara com o valor inicial: ${b - a} ÷ ${a}.`, `${pct(r)}.`], pct); },
    () => { const N = R(4, 30) * 100, p = pick([35, 42, 55, 68, 72]); const nao = N * (100 - p) / 100;
      return Q(`Numa pesquisa com ${nf(N)} pessoas, ${p}% responderam "sim" e o restante "não". Quantas responderam "não"?`, nao, [N * p / 100, 100 - p, N - p],
        [`"Não" corresponde a 100% − ${p}% = ${100 - p}%.`, `${nf(N)} × ${100 - p} ÷ 100 = ${nf(nao)}.`], v => nf(v)); }
  ])(),
  "est-complementar": () => pick([
    () => { const n = R(2, 5); const d = Math.pow(2, n);
      return Q(`Uma moeda é lançada ${n} vezes. Qual a probabilidade de sair cara pelo menos uma vez?`, `${d - 1}/${d}`, [`1/${d}`, `${n}/${d}`, `1/2`],
        [`O contrário de "pelo menos uma cara" é "nenhuma cara".`, `Nenhuma cara: (1/2)^${n} = 1/${d}.`, `Logo: 1 − 1/${d} = ${d - 1}/${d}.`], v => v); },
    () => { const p = R(5, 45);
      return Q(`A chance de chover amanhã é de ${p}%. Qual a chance de não chover?`, 100 - p, [p, 50, 100 + p],
        [`Os eventos "chover" e "não chover" são complementares.`, `As chances somam 100%.`, `100% − ${p}% = ${100 - p}%.`], pct); }
  ])(),
  "est-independentes": () => { const ev = pick([[["tirar número par no dado", 1, 2], ["sair cara na moeda", 1, 2]], [["tirar 6 no dado", 1, 6], ["sair coroa na moeda", 1, 2]], [["tirar número maior que 4 no dado", 1, 3], ["tirar número ímpar no outro dado", 1, 2]], [["acertar um chute com 5 alternativas", 1, 5], ["acertar outro chute com 5 alternativas", 1, 5]]]);
    const [[t1, a1, b1], [t2, a2, b2]] = ev; const n = a1 * a2, d = b1 * b2;
    return Q(`Qual a probabilidade de ${t1} e também ${t2}?`, frac(n, d), [frac(a1 + a2, b1 * b2), frac(1, b1 + b2), frac(n, d * 2), frac(n * 2, d), frac(a1 + a2, b1 + b2), frac(n, d + 1)],
      [`Os eventos são independentes: um não interfere no outro.`, `Multiplique: ${a1}/${b1} × ${a2}/${b2}.`, `Resultado: ${frac(n, d)}.`], v => v); },
  "est-permutacao": () => { const w = pick(["AMOR", "PROVA", "LIVRO", "ENEM2", "DELTA", "NOTAS", "CANETA"]).replace(/2/, "S"); const L = [...new Set(w)].length === w.length ? w : "PROVA"; const n = L.length; const fat = k => (k <= 1 ? 1 : k * fat(k - 1));
    return pick([
      () => Q(`Quantos anagramas tem a palavra ${L}?`, fat(n), [n * n, n * (n - 1), fat(n - 1)], [`Todas as ${n} letras são diferentes.`, `Anagramas = ${n}! = ${[...Array(n)].map((_, i) => n - i).join(" × ")}.`, `Total: ${fat(n)}.`], v => nf(v)),
      () => Q(`Quantos anagramas da palavra ${L} começam com a letra ${L[0]}?`, fat(n - 1), [fat(n), n - 1, fat(n) - 1], [`Fixe a letra ${L[0]} na primeira posição.`, `Sobram ${n - 1} letras para permutar: ${n - 1}!.`, `Total: ${fat(n - 1)}.`], v => nf(v))
    ])(); },
  "est-esperado": () => { const k = pick([4, 5, 10]), w = k * R(3, 10), c = R(1, Math.max(1, w / k - 1));
    return pick([
      () => Q(`Num jogo, a chance de ganhar ${brl(w)} é 1 em ${k}; senão, não se ganha nada. Em média, quanto se recebe por jogada?`, w / k, [w, w / 2, w * k], [`Valor esperado = prêmio × probabilidade.`, `${brl(w)} × 1/${k}.`, `Média: ${brl(w / k)} por jogada.`], brl),
      () => Q(`Uma rifa custa ${brl(c)}, e há chance de 1 em ${k} de ganhar ${brl(w)}. Em média, quanto se ganha por rifa, já descontando o preço?`, w / k - c, [w / k, w - c, c], [`Ganho médio bruto: ${brl(w)} ÷ ${k} = ${brl(w / k)}.`, `Desconte o preço: ${brl(w / k)} − ${brl(c)}.`, `Resultado: ${brl(w / k - c)}.`], brl)
    ])(); }
};

export const genKeys = Object.keys(GEN);
