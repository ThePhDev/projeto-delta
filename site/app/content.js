// ============================================================
// PROJETO DELTA — Conteúdo das trilhas
// Matemática e suas Tecnologias · 2º dia do ENEM
// 4 eixos · 2 unidades · 3 lições · 5 questões por lição
// q: enunciado | o: alternativas | c: índice correto | e: explicação
// ============================================================

export const AREA = "Matemática";

export const SUBJECTS = [
  {
    id: "num", nome: "Números e Grandezas", simbolo: "%",
    desc: "Porcentagem, proporção, finanças e medidas: a base que mais cai.",
    hue: 258,
    unidades: [
      {
        id: "num-u1", titulo: "Porcentagem e proporção",
        licoes: [
          { id: "mat-u1-l1", titulo: "Porcentagem", topico: "mat-porcentagem", questoes: [
            { q: "Uma camiseta de R$ 80 está com desconto de 25%. Qual o preço final?", o: ["R$ 55", "R$ 60", "R$ 65", "R$ 70"], c: 1, e: "25% de 80 = 20. Logo, 80 − 20 = R$ 60." },
            { q: "Um produto de R$ 50 sofreu aumento de 10% e depois desconto de 10%. O preço final é:", o: ["R$ 50,00", "R$ 49,50", "R$ 51,00", "R$ 48,00"], c: 1, e: "50 × 1,10 = 55; 55 × 0,90 = 49,50. Aumentos e descontos iguais não se anulam." },
            { q: "Em uma escola de 400 alunos, 60% usam transporte público. Quantos alunos são?", o: ["180", "220", "240", "260"], c: 2, e: "60% de 400 = 0,6 × 400 = 240." },
            { q: "Um salário de R$ 2.000 foi reajustado para R$ 2.300. O aumento percentual foi de:", o: ["10%", "13%", "15%", "30%"], c: 2, e: "Aumento de 300 sobre 2000: 300/2000 = 0,15 = 15%." },
            { q: "Se 30% de um número é 45, esse número é:", o: ["135", "150", "155", "160"], c: 1, e: "0,30x = 45 → x = 45/0,3 = 150." }
          ]},
          { id: "mat-u1-l2", titulo: "Proporção e regra de três", topico: "mat-proporcao", questoes: [
            { q: "Um carro percorre 240 km com 20 L de gasolina. Quantos litros gastará em 360 km?", o: ["25 L", "28 L", "30 L", "32 L"], c: 2, e: "240/20 = 12 km/L; 360/12 = 30 L." },
            { q: "Uma receita para 4 pessoas usa 300 g de arroz. Para 10 pessoas serão necessários:", o: ["600 g", "700 g", "750 g", "800 g"], c: 2, e: "300/4 = 75 g por pessoa; 75 × 10 = 750 g." },
            { q: "Se 6 operários constroem um muro em 10 dias, 4 operários (no mesmo ritmo) levarão:", o: ["12 dias", "15 dias", "18 dias", "20 dias"], c: 1, e: "Grandezas inversas: 6 × 10 = 60 'operário-dias'; 60/4 = 15 dias." },
            { q: "A escala de um mapa é 1:100.000. Uma distância de 3 cm no mapa equivale a:", o: ["3 km", "30 km", "300 m", "30 m"], c: 0, e: "3 cm × 100.000 = 300.000 cm = 3 km." },
            { q: "Na proporção 3/4 = x/20, o valor de x é:", o: ["12", "15", "16", "18"], c: 1, e: "x = (3 × 20)/4 = 15." }
          ]},
          { id: "num-u1-l3", titulo: "Matemática financeira", topico: "num-financeira", questoes: [
            { q: "R$ 1.000 aplicados a juros simples de 2% ao mês durante 5 meses rendem de juros:", o: ["R$ 50", "R$ 100", "R$ 105", "R$ 110"], c: 1, e: "Juros simples: J = C·i·t = 1000 × 0,02 × 5 = R$ 100." },
            { q: "R$ 1.000 aplicados a juros compostos de 10% ao ano, após 2 anos, geram um montante de:", o: ["R$ 1.200", "R$ 1.210", "R$ 1.220", "R$ 1.100"], c: 1, e: "M = C·(1 + i)^t = 1000 × 1,1² = 1000 × 1,21 = R$ 1.210." },
            { q: "Uma TV de R$ 1.500 tem 10% de desconto para pagamento à vista. O preço à vista é:", o: ["R$ 1.350", "R$ 1.400", "R$ 1.450", "R$ 1.490"], c: 0, e: "10% de 1500 = 150. Logo, 1500 − 150 = R$ 1.350." },
            { q: "R$ 2.000 aplicados a juros simples de 3% ao mês, por 4 meses, resultam em um montante de:", o: ["R$ 2.060", "R$ 2.120", "R$ 2.240", "R$ 2.400"], c: 2, e: "J = 2000 × 0,03 × 4 = 240. M = 2000 + 240 = R$ 2.240." },
            { q: "Um produto teve dois aumentos sucessivos de 10%. O aumento total foi de:", o: ["20%", "21%", "22%", "11%"], c: 1, e: "1,10 × 1,10 = 1,21 → aumento total de 21%, não 20%." }
          ]}
        ]
      },
      {
        id: "num-u2", titulo: "Medidas e números",
        licoes: [
          { id: "num-u2-l1", titulo: "Unidades e conversões", topico: "num-unidades", questoes: [
            { q: "2,5 km equivalem a:", o: ["25 m", "250 m", "2.500 m", "25.000 m"], c: 2, e: "1 km = 1.000 m, então 2,5 × 1.000 = 2.500 m." },
            { q: "Uma caixa-d'água de 1 m³ comporta:", o: ["10 L", "100 L", "1.000 L", "10.000 L"], c: 2, e: "1 m³ = 1.000 dm³ e 1 dm³ = 1 L. Logo, 1 m³ = 1.000 L." },
            { q: "90 minutos correspondem a:", o: ["1,3 h", "1,5 h", "1,9 h", "0,9 h"], c: 1, e: "90 ÷ 60 = 1,5 h (uma hora e meia)." },
            { q: "Uma sala de 4 m × 5 m tem área, em cm², de:", o: ["2.000 cm²", "20.000 cm²", "200.000 cm²", "2.000.000 cm²"], c: 2, e: "Área = 20 m². Como 1 m² = 10.000 cm², 20 × 10.000 = 200.000 cm²." },
            { q: "Enchendo 3 vezes uma garrafa de 500 mL, obtém-se:", o: ["0,15 L", "1,5 L", "15 L", "150 L"], c: 1, e: "3 × 500 mL = 1.500 mL = 1,5 L." }
          ]},
          { id: "num-u2-l2", titulo: "Potências e notação científica", topico: "num-potencias", questoes: [
            { q: "O valor de 2⁵ é:", o: ["10", "25", "32", "64"], c: 2, e: "2⁵ = 2 × 2 × 2 × 2 × 2 = 32." },
            { q: "3.000.000 em notação científica é:", o: ["3 × 10⁵", "3 × 10⁶", "30 × 10⁶", "3 × 10⁷"], c: 1, e: "3.000.000 tem 6 zeros após o 3: 3 × 10⁶." },
            { q: "10³ × 10⁴ é igual a:", o: ["10⁷", "10¹²", "100⁷", "10¹"], c: 0, e: "Na multiplicação de potências de mesma base, somam-se os expoentes: 3 + 4 = 7." },
            { q: "0,0005 em notação científica é:", o: ["5 × 10⁻³", "5 × 10⁻⁴", "5 × 10⁴", "0,5 × 10⁻⁵"], c: 1, e: "A vírgula anda 4 casas para a direita até o 5: 5 × 10⁻⁴." },
            { q: "(2³)² é igual a:", o: ["32", "36", "64", "128"], c: 2, e: "Potência de potência: multiplicam-se os expoentes. 2^(3×2) = 2⁶ = 64." }
          ]},
          { id: "num-u2-l3", titulo: "Múltiplos, divisores e MMC", topico: "num-mmc", questoes: [
            { q: "O MMC de 4 e 6 é:", o: ["2", "10", "12", "24"], c: 2, e: "Múltiplos de 4: 4, 8, 12… Múltiplos de 6: 6, 12… O menor comum é 12." },
            { q: "O MDC de 18 e 24 é:", o: ["2", "3", "6", "12"], c: 2, e: "18 = 2 × 3² e 24 = 2³ × 3. Fatores comuns com menor expoente: 2 × 3 = 6." },
            { q: "Dois ônibus saem juntos do terminal. Um parte a cada 12 min e o outro a cada 18 min. Eles voltam a sair juntos após:", o: ["30 min", "36 min", "54 min", "216 min"], c: 1, e: "Encontro simultâneo = MMC(12, 18) = 36 minutos." },
            { q: "Quantos divisores positivos tem o número 12?", o: ["4", "5", "6", "8"], c: 2, e: "Divisores de 12: 1, 2, 3, 4, 6 e 12, seis ao todo." },
            { q: "Fitas de 24 cm e 36 cm serão cortadas em pedaços iguais, do maior tamanho possível, sem sobras. Cada pedaço terá:", o: ["6 cm", "8 cm", "12 cm", "18 cm"], c: 2, e: "Maior pedaço que divide as duas medidas = MDC(24, 36) = 12 cm." }
          ]}
        ]
      }
    ]
  },
  {
    id: "alg", nome: "Álgebra e Funções", simbolo: "ƒ",
    desc: "Funções, sequências e logaritmos para modelar o mundo com equações.",
    hue: 195,
    unidades: [
      {
        id: "alg-u1", titulo: "Funções",
        licoes: [
          { id: "mat-u2-l1", titulo: "Função do 1º grau", topico: "mat-funcao1", questoes: [
            { q: "Um motorista de app cobra R$ 5 fixos + R$ 2 por km. Uma corrida de 8 km custa:", o: ["R$ 16", "R$ 19", "R$ 21", "R$ 26"], c: 2, e: "f(8) = 5 + 2×8 = R$ 21." },
            { q: "Na função f(x) = 3x − 6, a raiz (valor de x com f(x) = 0) é:", o: ["−2", "0", "2", "3"], c: 2, e: "3x − 6 = 0 → x = 2." },
            { q: "Se f(x) = 2x + 1, então f(5) vale:", o: ["9", "10", "11", "12"], c: 2, e: "f(5) = 2×5 + 1 = 11." },
            { q: "Uma função f(x) = ax + b tem gráfico decrescente quando:", o: ["a > 0", "a < 0", "b > 0", "b < 0"], c: 1, e: "O coeficiente angular negativo (a < 0) faz a reta descer." },
            { q: "Um plano de celular custa R$ 30 + R$ 0,50 por minuto extra. Com conta de R$ 45, os minutos extras foram:", o: ["20", "25", "30", "35"], c: 2, e: "45 − 30 = 15; 15/0,5 = 30 minutos." }
          ]},
          { id: "alg-u1-l2", titulo: "Função do 2º grau", topico: "alg-quadratica", questoes: [
            { q: "As raízes de x² − 5x + 6 = 0 são:", o: ["1 e 6", "2 e 3", "−2 e −3", "−1 e 6"], c: 1, e: "Soma = 5 e produto = 6: os números são 2 e 3." },
            { q: "O vértice da parábola f(x) = x² − 4x + 3 tem abscissa x igual a:", o: ["−2", "1", "2", "4"], c: 2, e: "x do vértice = −b/(2a) = 4/2 = 2." },
            { q: "O gráfico de f(x) = −x² + 4 tem concavidade voltada:", o: ["para cima", "para baixo", "para a direita", "indefinida"], c: 1, e: "Como a = −1 < 0, a parábola tem concavidade para baixo." },
            { q: "O valor máximo de f(x) = −x² + 6x é:", o: ["3", "6", "9", "12"], c: 2, e: "x do vértice = −6/(−2) = 3. f(3) = −9 + 18 = 9." },
            { q: "A equação x² + 2x + 5 = 0 possui:", o: ["duas raízes reais distintas", "uma raiz real dupla", "nenhuma raiz real", "infinitas raízes"], c: 2, e: "Δ = b² − 4ac = 4 − 20 = −16 < 0: não há raízes reais." }
          ]},
          { id: "alg-u1-l3", titulo: "Função exponencial", topico: "alg-exponencial", questoes: [
            { q: "Uma cultura com 100 bactérias dobra a cada hora. Após 3 horas, haverá:", o: ["300", "600", "800", "900"], c: 2, e: "100 × 2³ = 100 × 8 = 800 bactérias." },
            { q: "Se 2ˣ = 16, então x vale:", o: ["2", "3", "4", "8"], c: 2, e: "16 = 2⁴, logo x = 4." },
            { q: "Um carro de R$ 50.000 desvaloriza 10% ao ano. Após 2 anos, ele vale:", o: ["R$ 40.000", "R$ 40.500", "R$ 41.000", "R$ 45.000"], c: 1, e: "50.000 × 0,9² = 50.000 × 0,81 = R$ 40.500." },
            { q: "Se f(x) = 3ˣ, então f(2) vale:", o: ["5", "6", "8", "9"], c: 3, e: "f(2) = 3² = 9." },
            { q: "A função f(x) = (1/2)ˣ é:", o: ["crescente", "decrescente", "constante", "do 1º grau"], c: 1, e: "Base entre 0 e 1: a exponencial é decrescente." }
          ]}
        ]
      },
      {
        id: "alg-u2", titulo: "Sequências e logaritmos",
        licoes: [
          { id: "alg-u2-l1", titulo: "Progressão aritmética", topico: "alg-pa", questoes: [
            { q: "A razão da PA (3, 7, 11, …) é:", o: ["3", "4", "7", "11"], c: 1, e: "r = 7 − 3 = 4." },
            { q: "O 10º termo da PA (2, 5, 8, …) é:", o: ["27", "29", "30", "32"], c: 1, e: "aₙ = a₁ + (n − 1)·r = 2 + 9 × 3 = 29." },
            { q: "A soma dos 10 primeiros números naturais positivos (1 + 2 + … + 10) é:", o: ["45", "50", "55", "100"], c: 2, e: "S = (a₁ + aₙ)·n/2 = (1 + 10) × 10/2 = 55." },
            { q: "Uma pessoa guarda R$ 10 na 1ª semana, R$ 15 na 2ª, R$ 20 na 3ª e assim por diante. Na 8ª semana, ela guarda:", o: ["R$ 40", "R$ 45", "R$ 50", "R$ 55"], c: 1, e: "PA com a₁ = 10 e r = 5: a₈ = 10 + 7 × 5 = R$ 45." },
            { q: "Numa PA com a₁ = 5 e razão −2, o 4º termo é:", o: ["−3", "−1", "1", "3"], c: 1, e: "a₄ = 5 + 3 × (−2) = −1." }
          ]},
          { id: "alg-u2-l2", titulo: "Progressão geométrica", topico: "alg-pg", questoes: [
            { q: "A razão da PG (2, 6, 18, …) é:", o: ["2", "3", "4", "12"], c: 1, e: "q = 6 ÷ 2 = 3." },
            { q: "O 5º termo da PG (1, 2, 4, …) é:", o: ["8", "10", "16", "32"], c: 2, e: "aₙ = a₁·qⁿ⁻¹ = 1 × 2⁴ = 16." },
            { q: "Um vírus de computador infecta 2 máquinas no 1º dia, e o número de novas infecções triplica a cada dia. No 4º dia, serão infectadas:", o: ["18", "24", "54", "162"], c: 2, e: "PG com a₁ = 2 e q = 3: a₄ = 2 × 3³ = 54." },
            { q: "A soma dos 4 primeiros termos da PG (1, 2, 4, 8) é:", o: ["14", "15", "16", "30"], c: 1, e: "1 + 2 + 4 + 8 = 15." },
            { q: "A razão da PG (81, 27, 9, …) é:", o: ["−3", "1/3", "3", "1/9"], c: 1, e: "q = 27 ÷ 81 = 1/3." }
          ]},
          { id: "alg-u2-l3", titulo: "Logaritmos", topico: "alg-log", questoes: [
            { q: "log₂ 8 é igual a:", o: ["2", "3", "4", "6"], c: 1, e: "2³ = 8, logo log₂ 8 = 3." },
            { q: "log 1000 (base 10) é igual a:", o: ["2", "3", "10", "100"], c: 1, e: "10³ = 1000, logo log 1000 = 3." },
            { q: "log₃ 1 é igual a:", o: ["0", "1", "3", "−1"], c: 0, e: "Qualquer base elevada a 0 vale 1: log₃ 1 = 0." },
            { q: "Sabendo que log 2 ≈ 0,3, o valor aproximado de log 4 é:", o: ["0,09", "0,6", "0,9", "1,2"], c: 1, e: "log 4 = log 2² = 2 × log 2 ≈ 0,6." },
            { q: "Na escala Richter, cada ponto a mais multiplica a amplitude das ondas por 10. Um tremor de magnitude 6, comparado a um de magnitude 4, tem amplitude:", o: ["2 vezes maior", "20 vezes maior", "100 vezes maior", "1.000 vezes maior"], c: 2, e: "Diferença de 2 pontos: 10² = 100 vezes." }
          ]}
        ]
      }
    ]
  },
  {
    id: "geo", nome: "Geometria", simbolo: "△",
    desc: "Áreas, volumes, Pitágoras e trigonometria: o espaço em números.",
    hue: 165,
    unidades: [
      {
        id: "geo-u1", titulo: "Geometria plana",
        licoes: [
          { id: "mat-u2-l2", titulo: "Áreas e perímetros", topico: "mat-geometria", questoes: [
            { q: "Um terreno retangular tem 20 m × 15 m. Sua área é:", o: ["35 m²", "70 m²", "150 m²", "300 m²"], c: 3, e: "Área = 20 × 15 = 300 m²." },
            { q: "Um quadrado tem perímetro 36 cm. Sua área é:", o: ["36 cm²", "72 cm²", "81 cm²", "144 cm²"], c: 2, e: "Lado = 36/4 = 9; área = 9² = 81 cm²." },
            { q: "Um triângulo tem base 10 cm e altura 6 cm. Sua área é:", o: ["16 cm²", "30 cm²", "60 cm²", "120 cm²"], c: 1, e: "Área = (10 × 6)/2 = 30 cm²." },
            { q: "Usando π ≈ 3, a área de um círculo de raio 4 cm é aproximadamente:", o: ["24 cm²", "36 cm²", "48 cm²", "64 cm²"], c: 2, e: "A = πr² ≈ 3 × 16 = 48 cm²." },
            { q: "Para cercar um terreno retangular de 30 m × 20 m com 3 voltas de arame, são necessários:", o: ["100 m", "150 m", "300 m", "600 m"], c: 2, e: "Perímetro = 2(30+20) = 100 m; 3 voltas = 300 m." }
          ]},
          { id: "geo-u1-l2", titulo: "Pitágoras e semelhança", topico: "geo-pitagoras", questoes: [
            { q: "Um triângulo retângulo tem catetos 6 e 8. A hipotenusa mede:", o: ["10", "12", "14", "48"], c: 0, e: "h² = 6² + 8² = 36 + 64 = 100 → h = 10." },
            { q: "Uma escada de 5 m está apoiada numa parede, com o pé a 3 m da parede. Ela alcança a altura de:", o: ["2 m", "3 m", "4 m", "8 m"], c: 2, e: "5² = 3² + h² → h² = 16 → h = 4 m." },
            { q: "A diagonal de um quadrado de lado 1 mede:", o: ["1", "√2", "2", "√3"], c: 1, e: "d² = 1² + 1² = 2 → d = √2." },
            { q: "Um poste projeta uma sombra de 6 m no mesmo instante em que uma pessoa de 1,8 m projeta 1,2 m. A altura do poste é:", o: ["7,2 m", "8 m", "9 m", "10 m"], c: 2, e: "Triângulos semelhantes: h/6 = 1,8/1,2 = 1,5 → h = 9 m." },
            { q: "Dois triângulos semelhantes têm razão de semelhança 2. Se o menor tem área 5 cm², o maior tem área:", o: ["10 cm²", "15 cm²", "20 cm²", "25 cm²"], c: 2, e: "Áreas variam com o quadrado da razão: 5 × 2² = 20 cm²." }
          ]},
          { id: "geo-u1-l3", titulo: "Trigonometria no triângulo retângulo", topico: "geo-trigonometria", questoes: [
            { q: "O valor de sen 30° é:", o: ["1/2", "√2/2", "√3/2", "1"], c: 0, e: "Ângulo notável: sen 30° = 1/2." },
            { q: "Uma rampa de 10 m de comprimento tem inclinação de 30° com o chão. Ela atinge a altura de:", o: ["3 m", "5 m", "8,6 m", "10 m"], c: 1, e: "altura = 10 × sen 30° = 10 × 1/2 = 5 m." },
            { q: "Num triângulo retângulo, o cateto oposto a um ângulo mede 3 e a hipotenusa mede 5. O seno desse ângulo é:", o: ["3/4", "3/5", "4/5", "5/3"], c: 1, e: "sen = cateto oposto / hipotenusa = 3/5." },
            { q: "O valor de tg 45° é:", o: ["0", "1/2", "1", "√3"], c: 2, e: "Em 45°, os catetos são iguais: tg 45° = 1." },
            { q: "Uma pessoa a 20 m de um prédio vê o topo sob um ângulo de 45° (despreze a altura dos olhos). A altura do prédio é:", o: ["10 m", "20 m", "20√2 m", "40 m"], c: 1, e: "tg 45° = h/20 = 1 → h = 20 m." }
          ]}
        ]
      },
      {
        id: "geo-u2", titulo: "Geometria espacial",
        licoes: [
          { id: "geo-u2-l1", titulo: "Volume de prismas e cilindros", topico: "geo-volumes", questoes: [
            { q: "Uma caixa de 2 m × 3 m × 1 m tem volume de:", o: ["5 m³", "6 m³", "11 m³", "12 m³"], c: 1, e: "V = 2 × 3 × 1 = 6 m³." },
            { q: "Um cubo de aresta 3 cm tem volume de:", o: ["9 cm³", "18 cm³", "27 cm³", "81 cm³"], c: 2, e: "V = a³ = 3³ = 27 cm³." },
            { q: "Usando π ≈ 3, o volume de um cilindro de raio 2 cm e altura 5 cm é:", o: ["30 cm³", "60 cm³", "120 cm³", "150 cm³"], c: 1, e: "V = π·r²·h ≈ 3 × 4 × 5 = 60 cm³." },
            { q: "Uma piscina de 10 m × 5 m × 2 m comporta:", o: ["1.000 L", "10.000 L", "100.000 L", "1.000.000 L"], c: 2, e: "V = 100 m³ e 1 m³ = 1.000 L → 100.000 L." },
            { q: "Se a aresta de um cubo dobrar, o volume fica multiplicado por:", o: ["2", "4", "6", "8"], c: 3, e: "(2a)³ = 8a³: o volume fica 8 vezes maior." }
          ]},
          { id: "geo-u2-l2", titulo: "Pirâmide, cone e esfera", topico: "geo-solidos", questoes: [
            { q: "Uma pirâmide de base quadrada com lado 3 cm e altura 4 cm tem volume de:", o: ["12 cm³", "24 cm³", "36 cm³", "48 cm³"], c: 0, e: "V = (área da base × altura)/3 = (9 × 4)/3 = 12 cm³." },
            { q: "Usando π ≈ 3, o volume de um cone de raio 3 cm e altura 4 cm é:", o: ["12 cm³", "36 cm³", "48 cm³", "108 cm³"], c: 1, e: "V = π·r²·h/3 ≈ 3 × 9 × 4/3 = 36 cm³." },
            { q: "Usando π ≈ 3, o volume de uma esfera de raio 3 cm é:", o: ["36 cm³", "81 cm³", "108 cm³", "324 cm³"], c: 2, e: "V = (4/3)·π·r³ ≈ (4/3) × 3 × 27 = 108 cm³." },
            { q: "Um cone e um cilindro têm a mesma base e a mesma altura. O volume do cone é:", o: ["igual ao do cilindro", "metade do cilindro", "um terço do cilindro", "o dobro do cilindro"], c: 2, e: "V(cone) = π·r²·h/3, ou seja, 1/3 do cilindro." },
            { q: "Quantas faces tem uma pirâmide de base hexagonal?", o: ["6", "7", "8", "12"], c: 1, e: "6 faces laterais triangulares + 1 base = 7 faces." }
          ]},
          { id: "geo-u2-l3", titulo: "Planificações e vistas", topico: "geo-planificacao", questoes: [
            { q: "A planificação de um cubo é formada por:", o: ["4 quadrados", "6 quadrados", "6 retângulos e 2 quadrados", "8 triângulos"], c: 1, e: "O cubo tem 6 faces quadradas." },
            { q: "Pela relação de Euler (V − A + F = 2), um cubo com 8 vértices e 6 faces tem quantas arestas?", o: ["10", "12", "14", "16"], c: 1, e: "8 − A + 6 = 2 → A = 12." },
            { q: "A planificação de um cilindro reto resulta em:", o: ["dois círculos e um retângulo", "um círculo e um triângulo", "três retângulos", "dois retângulos"], c: 0, e: "As bases são círculos e a lateral desenrolada vira um retângulo." },
            { q: "A vista superior de um cone reto apoiado pela base é:", o: ["um triângulo", "um círculo", "um quadrado", "um trapézio"], c: 1, e: "De cima, vê-se o contorno circular da base (com o vértice no centro)." },
            { q: "Quantas faces tem um prisma de base triangular?", o: ["3", "5", "6", "9"], c: 1, e: "2 bases triangulares + 3 faces laterais retangulares = 5 faces." }
          ]}
        ]
      }
    ]
  },
  {
    id: "est", nome: "Estatística e Probabilidade", simbolo: "σ",
    desc: "Médias, gráficos, contagem e chance para ler dados como o ENEM pede.",
    hue: 330,
    unidades: [
      {
        id: "est-u1", titulo: "Tratamento da informação",
        licoes: [
          { id: "mat-u1-l3", titulo: "Estatística básica", topico: "mat-estatistica", questoes: [
            { q: "As notas de um aluno foram 6, 8, 7 e 9. Sua média é:", o: ["7,0", "7,5", "8,0", "8,5"], c: 1, e: "(6+8+7+9)/4 = 30/4 = 7,5." },
            { q: "No conjunto {2, 3, 3, 5, 7, 8, 9}, a mediana é:", o: ["3", "5", "7", "8"], c: 1, e: "Com 7 valores ordenados, a mediana é o 4º: 5." },
            { q: "A moda do conjunto {4, 6, 6, 7, 9, 6, 4} é:", o: ["4", "6", "7", "9"], c: 1, e: "O valor mais frequente é 6 (aparece 3 vezes)." },
            { q: "Para ter média 7 em 4 provas, um aluno com notas 6, 7 e 6 precisa tirar na última:", o: ["7", "8", "9", "10"], c: 2, e: "Soma necessária: 28. Já tem 19. Falta 28 − 19 = 9." },
            { q: "Um gráfico mostra que 25% dos 200 entrevistados preferem ônibus. Quantas pessoas são?", o: ["25", "40", "50", "75"], c: 2, e: "25% de 200 = 50 pessoas." }
          ]},
          { id: "est-u1-l2", titulo: "Gráficos e tabelas", topico: "est-graficos", questoes: [
            { q: "Para mostrar como um todo se divide em partes percentuais, o gráfico mais adequado é o de:", o: ["linhas", "setores (pizza)", "dispersão", "histograma"], c: 1, e: "O gráfico de setores representa partes de um todo (100%)." },
            { q: "Para mostrar a variação da temperatura ao longo dos dias, o gráfico mais adequado é o de:", o: ["setores", "linhas", "pictograma", "tabela de dupla entrada"], c: 1, e: "Gráficos de linha evidenciam tendências ao longo do tempo." },
            { q: "Uma loja vendeu 120 peças em janeiro e 150 em fevereiro. O aumento percentual foi de:", o: ["20%", "25%", "30%", "150%"], c: 1, e: "Aumento de 30 sobre 120: 30/120 = 0,25 = 25%." },
            { q: "Num gráfico de setores, um setor de 90° representa:", o: ["10%", "25%", "50%", "90%"], c: 1, e: "90° de 360° = 1/4 = 25%." },
            { q: "As vendas de uma loja foram 120, 150 e 90 peças em três meses. A média mensal foi:", o: ["100", "110", "120", "130"], c: 2, e: "(120 + 150 + 90)/3 = 360/3 = 120." }
          ]},
          { id: "est-u1-l3", titulo: "Dispersão e desvio", topico: "est-dispersao", questoes: [
            { q: "A amplitude do conjunto {3, 8, 5, 12, 7} é:", o: ["5", "7", "9", "12"], c: 2, e: "Amplitude = maior − menor = 12 − 3 = 9." },
            { q: "Os alunos A {7, 7, 7} e B {4, 7, 10} têm média 7. O desempenho mais regular é o de:", o: ["A", "B", "ambos iguais", "não é possível saber"], c: 0, e: "As notas de A não variam: desvio padrão zero, mais regular." },
            { q: "A variância do conjunto {2, 4, 6} é:", o: ["2", "8/3", "4", "8"], c: 1, e: "Média 4; desvios ao quadrado: 4, 0, 4. Variância = 8/3." },
            { q: "O desvio padrão é a raiz quadrada da:", o: ["média", "mediana", "variância", "amplitude"], c: 2, e: "Desvio padrão = √variância." },
            { q: "Somar 5 a todos os valores de um conjunto altera:", o: ["a média e o desvio padrão", "apenas a média", "apenas o desvio padrão", "nenhum dos dois"], c: 1, e: "Todos os valores se deslocam igualmente: a média sobe 5 e a dispersão não muda." }
          ]}
        ]
      },
      {
        id: "est-u2", titulo: "Contagem e chance",
        licoes: [
          { id: "est-u2-l1", titulo: "Princípio da contagem", topico: "est-contagem", questoes: [
            { q: "Com 3 camisetas e 4 calças, quantas combinações de roupa são possíveis?", o: ["7", "12", "16", "24"], c: 1, e: "Princípio multiplicativo: 3 × 4 = 12." },
            { q: "Quantas senhas de 3 dígitos (0 a 9) existem, permitindo repetição?", o: ["30", "720", "999", "1.000"], c: 3, e: "10 × 10 × 10 = 1.000 senhas." },
            { q: "Quantos anagramas tem a palavra AMOR?", o: ["12", "16", "24", "256"], c: 2, e: "4 letras distintas: 4! = 24." },
            { q: "Quantos códigos existem com 2 letras (26 opções cada) seguidas de 1 algarismo?", o: ["520", "676", "6.760", "67.600"], c: 2, e: "26 × 26 × 10 = 6.760." },
            { q: "De quantas formas 5 pessoas podem se sentar em 5 cadeiras em fila?", o: ["25", "60", "120", "3.125"], c: 2, e: "Permutação: 5! = 120." }
          ]},
          { id: "est-u2-l2", titulo: "Arranjos e combinações", topico: "est-combinatoria", questoes: [
            { q: "Quantas duplas diferentes podem ser formadas com 5 pessoas?", o: ["10", "20", "25", "60"], c: 0, e: "A ordem não importa: C(5, 2) = 5 × 4/2 = 10." },
            { q: "De quantas formas pode ser montado o pódio (1º, 2º e 3º) de uma corrida com 8 atletas?", o: ["24", "56", "336", "512"], c: 2, e: "A ordem importa: 8 × 7 × 6 = 336." },
            { q: "Quantas comissões de 3 pessoas podem ser formadas a partir de 6 pessoas?", o: ["18", "20", "120", "216"], c: 1, e: "C(6, 3) = (6 × 5 × 4)/(3 × 2 × 1) = 20." },
            { q: "A principal diferença entre arranjo e combinação é que, no arranjo:", o: ["a ordem importa", "a ordem não importa", "sempre há repetição", "nunca há elementos iguais"], c: 0, e: "Arranjo: ordem importa. Combinação: ordem não importa." },
            { q: "Num campeonato com 10 times em turno único (todos contra todos uma vez), quantos jogos acontecem?", o: ["20", "45", "90", "100"], c: 1, e: "Cada jogo é um par de times: C(10, 2) = 45." }
          ]},
          { id: "mat-u2-l3", titulo: "Probabilidade", topico: "mat-probabilidade", questoes: [
            { q: "Ao lançar um dado comum, a probabilidade de sair um número par é:", o: ["1/6", "1/3", "1/2", "2/3"], c: 2, e: "Pares: {2,4,6} → 3/6 = 1/2." },
            { q: "Numa urna com 3 bolas vermelhas e 7 azuis, a chance de tirar uma vermelha é:", o: ["3%", "30%", "37%", "70%"], c: 1, e: "3/10 = 30%." },
            { q: "A probabilidade de sair cara duas vezes seguidas ao lançar uma moeda é:", o: ["1/2", "1/3", "1/4", "1/8"], c: 2, e: "1/2 × 1/2 = 1/4." },
            { q: "Num grupo de 5 meninas e 3 meninos, sorteando 1 pessoa, a chance de ser menino é:", o: ["3/8", "3/5", "5/8", "1/3"], c: 0, e: "3 meninos em 8 pessoas = 3/8." },
            { q: "Ao lançar um dado, a probabilidade de sair número maior que 4 é:", o: ["1/6", "1/3", "1/2", "2/3"], c: 1, e: "Maiores que 4: {5,6} → 2/6 = 1/3." }
          ]}
        ]
      }
    ]
  }
];
