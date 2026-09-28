// ============================================================
// PROJETO DELTA — Conteúdo das trilhas
// 4 matérias · 2 unidades · 3 lições · 5 questões por lição
// q: enunciado | o: alternativas | c: índice correto | e: explicação
// ============================================================

export const SUBJECTS = [
  {
    id: "mat", nome: "Matemática", simbolo: "∑",
    desc: "Da porcentagem à probabilidade — o essencial que mais cai.",
    hue: 258,
    unidades: [
      {
        id: "mat-u1", titulo: "Números no mundo real",
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
          { id: "mat-u1-l3", titulo: "Estatística básica", topico: "mat-estatistica", questoes: [
            { q: "As notas de um aluno foram 6, 8, 7 e 9. Sua média é:", o: ["7,0", "7,5", "8,0", "8,5"], c: 1, e: "(6+8+7+9)/4 = 30/4 = 7,5." },
            { q: "No conjunto {2, 3, 3, 5, 7, 8, 9}, a mediana é:", o: ["3", "5", "7", "8"], c: 1, e: "Com 7 valores ordenados, a mediana é o 4º: 5." },
            { q: "A moda do conjunto {4, 6, 6, 7, 9, 6, 4} é:", o: ["4", "6", "7", "9"], c: 1, e: "O valor mais frequente é 6 (aparece 3 vezes)." },
            { q: "Para ter média 7 em 4 provas, um aluno com notas 6, 7 e 6 precisa tirar na última:", o: ["7", "8", "9", "10"], c: 2, e: "Soma necessária: 28. Já tem 19. Falta 28 − 19 = 9." },
            { q: "Um gráfico mostra que 25% dos 200 entrevistados preferem ônibus. Quantas pessoas são?", o: ["25", "40", "50", "75"], c: 2, e: "25% de 200 = 50 pessoas." }
          ]}
        ]
      },
      {
        id: "mat-u2", titulo: "Funções e formas",
        licoes: [
          { id: "mat-u2-l1", titulo: "Função do 1º grau", topico: "mat-funcao1", questoes: [
            { q: "Um motorista de app cobra R$ 5 fixos + R$ 2 por km. Uma corrida de 8 km custa:", o: ["R$ 16", "R$ 19", "R$ 21", "R$ 26"], c: 2, e: "f(8) = 5 + 2×8 = R$ 21." },
            { q: "Na função f(x) = 3x − 6, a raiz (valor de x com f(x) = 0) é:", o: ["−2", "0", "2", "3"], c: 2, e: "3x − 6 = 0 → x = 2." },
            { q: "Se f(x) = 2x + 1, então f(5) vale:", o: ["9", "10", "11", "12"], c: 2, e: "f(5) = 2×5 + 1 = 11." },
            { q: "Uma função f(x) = ax + b tem gráfico decrescente quando:", o: ["a > 0", "a < 0", "b > 0", "b < 0"], c: 1, e: "O coeficiente angular negativo (a < 0) faz a reta descer." },
            { q: "Um plano de celular custa R$ 30 + R$ 0,50 por minuto extra. Com conta de R$ 45, os minutos extras foram:", o: ["20", "25", "30", "35"], c: 2, e: "45 − 30 = 15; 15/0,5 = 30 minutos." }
          ]},
          { id: "mat-u2-l2", titulo: "Áreas e perímetros", topico: "mat-geometria", questoes: [
            { q: "Um terreno retangular tem 20 m × 15 m. Sua área é:", o: ["35 m²", "70 m²", "150 m²", "300 m²"], c: 3, e: "Área = 20 × 15 = 300 m²." },
            { q: "Um quadrado tem perímetro 36 cm. Sua área é:", o: ["36 cm²", "72 cm²", "81 cm²", "144 cm²"], c: 2, e: "Lado = 36/4 = 9; área = 9² = 81 cm²." },
            { q: "Um triângulo tem base 10 cm e altura 6 cm. Sua área é:", o: ["16 cm²", "30 cm²", "60 cm²", "120 cm²"], c: 1, e: "Área = (10 × 6)/2 = 30 cm²." },
            { q: "Usando π ≈ 3, a área de um círculo de raio 4 cm é aproximadamente:", o: ["24 cm²", "36 cm²", "48 cm²", "64 cm²"], c: 2, e: "A = πr² ≈ 3 × 16 = 48 cm²." },
            { q: "Para cercar um terreno retangular de 30 m × 20 m com 3 voltas de arame, são necessários:", o: ["100 m", "150 m", "300 m", "600 m"], c: 2, e: "Perímetro = 2(30+20) = 100 m; 3 voltas = 300 m." }
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
  },
  {
    id: "fis", nome: "Física", simbolo: "⚡",
    desc: "Movimento, energia e eletricidade — a física do cotidiano.",
    hue: 195,
    unidades: [
      {
        id: "fis-u1", titulo: "Movimento e forças",
        licoes: [
          { id: "fis-u1-l1", titulo: "Cinemática", topico: "fis-cinematica", questoes: [
            { q: "Um ônibus percorre 180 km em 3 horas. Sua velocidade média é:", o: ["45 km/h", "50 km/h", "60 km/h", "90 km/h"], c: 2, e: "v = d/t = 180/3 = 60 km/h." },
            { q: "Um ciclista a 36 km/h tem velocidade, em m/s, igual a:", o: ["6 m/s", "10 m/s", "12 m/s", "36 m/s"], c: 1, e: "Divide-se por 3,6: 36/3,6 = 10 m/s." },
            { q: "Um carro parte do repouso com aceleração de 2 m/s². Após 5 s, sua velocidade é:", o: ["2,5 m/s", "5 m/s", "10 m/s", "25 m/s"], c: 2, e: "v = a×t = 2 × 5 = 10 m/s." },
            { q: "Em um gráfico posição × tempo, uma reta horizontal indica que o corpo está:", o: ["acelerando", "em repouso", "em velocidade constante", "caindo"], c: 1, e: "Posição constante no tempo = repouso." },
            { q: "Um trem a 20 m/s percorre, em 2 minutos:", o: ["240 m", "400 m", "1.200 m", "2.400 m"], c: 3, e: "2 min = 120 s; d = 20 × 120 = 2.400 m." }
          ]},
          { id: "fis-u1-l2", titulo: "Leis de Newton", topico: "fis-newton", questoes: [
            { q: "Uma força de 20 N atua num corpo de 4 kg. A aceleração é:", o: ["4 m/s²", "5 m/s²", "16 m/s²", "80 m/s²"], c: 1, e: "a = F/m = 20/4 = 5 m/s²." },
            { q: "O cinto de segurança protege o passageiro relacionando-se à:", o: ["3ª lei de Newton", "lei da inércia", "gravitação universal", "lei de Ohm"], c: 1, e: "Pela inércia, o corpo tende a continuar em movimento na freada." },
            { q: "Quando você empurra uma parede, ela te empurra de volta. Isso é a:", o: ["1ª lei de Newton", "2ª lei de Newton", "3ª lei de Newton", "lei de Hooke"], c: 2, e: "Ação e reação: forças iguais e opostas em corpos diferentes." },
            { q: "O peso de um corpo de 10 kg na Terra (g = 10 m/s²) é:", o: ["1 N", "10 N", "100 N", "1.000 N"], c: 2, e: "P = m×g = 10 × 10 = 100 N." },
            { q: "Se a força resultante sobre um corpo é nula, ele:", o: ["sempre para", "mantém sua velocidade", "acelera", "muda de direção"], c: 1, e: "Sem força resultante, mantém repouso ou velocidade constante (1ª lei)." }
          ]},
          { id: "fis-u1-l3", titulo: "Trabalho e energia", topico: "fis-energia", questoes: [
            { q: "Um corpo de 2 kg a 3 m/s tem energia cinética de:", o: ["3 J", "6 J", "9 J", "18 J"], c: 2, e: "Ec = mv²/2 = 2×9/2 = 9 J." },
            { q: "A energia potencial gravitacional de 5 kg a 4 m de altura (g = 10) é:", o: ["20 J", "50 J", "100 J", "200 J"], c: 3, e: "Ep = mgh = 5×10×4 = 200 J." },
            { q: "Numa usina hidrelétrica, a energia da água em queda se transforma principalmente em:", o: ["térmica", "elétrica", "química", "nuclear"], c: 1, e: "Energia potencial → cinética → elétrica nas turbinas/geradores." },
            { q: "Uma força de 50 N desloca um objeto por 4 m na mesma direção. O trabalho é:", o: ["12,5 J", "54 J", "200 J", "450 J"], c: 2, e: "W = F×d = 50 × 4 = 200 J." },
            { q: "Em uma montanha-russa (sem atrito), no ponto mais baixo o carrinho tem:", o: ["máxima energia potencial", "máxima energia cinética", "energia total menor", "velocidade nula"], c: 1, e: "A energia potencial se converteu em cinética: velocidade máxima." }
          ]}
        ]
      },
      {
        id: "fis-u2", titulo: "Eletricidade e ondas",
        licoes: [
          { id: "fis-u2-l1", titulo: "Circuitos elétricos", topico: "fis-eletricidade", questoes: [
            { q: "Pela lei de Ohm (U = R·i), uma resistência de 10 Ω com corrente de 2 A tem tensão de:", o: ["5 V", "8 V", "12 V", "20 V"], c: 3, e: "U = 10 × 2 = 20 V." },
            { q: "Um chuveiro de 5.500 W ligado por 0,5 h consome:", o: ["1,75 kWh", "2,75 kWh", "5,5 kWh", "11 kWh"], c: 1, e: "E = P×t = 5,5 kW × 0,5 h = 2,75 kWh." },
            { q: "O aparelho que mais pesa na conta de luz é geralmente o que:", o: ["fica mais tempo em standby", "tem maior potência e uso prolongado", "usa pilhas", "tem menor tensão"], c: 1, e: "Consumo = potência × tempo de uso." },
            { q: "Em um circuito em série, se uma lâmpada queima, as demais:", o: ["brilham mais", "continuam acesas", "apagam", "queimam também"], c: 2, e: "Em série, o circuito é interrompido para todas." },
            { q: "A corrente de um aparelho de 220 V e 1.100 W é:", o: ["0,2 A", "2 A", "5 A", "22 A"], c: 2, e: "i = P/U = 1100/220 = 5 A." }
          ]},
          { id: "fis-u2-l2", titulo: "Ondas e som", topico: "fis-ondas", questoes: [
            { q: "Uma onda com frequência 50 Hz e comprimento 2 m tem velocidade de:", o: ["25 m/s", "48 m/s", "52 m/s", "100 m/s"], c: 3, e: "v = λ×f = 2 × 50 = 100 m/s." },
            { q: "O som NÃO se propaga:", o: ["no ar", "na água", "no vácuo", "no aço"], c: 2, e: "Onda mecânica precisa de meio material." },
            { q: "A altura de um som (grave/agudo) está ligada à:", o: ["amplitude", "frequência", "velocidade", "intensidade"], c: 1, e: "Maior frequência = som mais agudo." },
            { q: "Micro-ondas, luz visível e raios X são exemplos de ondas:", o: ["mecânicas", "sonoras", "eletromagnéticas", "sísmicas"], c: 2, e: "Todas pertencem ao espectro eletromagnético." },
            { q: "O eco é consequência da:", o: ["refração do som", "reflexão do som", "difração do som", "polarização do som"], c: 1, e: "O som reflete em obstáculos e retorna ao ouvinte." }
          ]},
          { id: "fis-u2-l3", titulo: "Calor e temperatura", topico: "fis-calor", questoes: [
            { q: "Calor é:", o: ["a temperatura de um corpo", "energia térmica em trânsito", "o mesmo que frio", "uma substância"], c: 1, e: "Calor é energia transferida entre corpos com temperaturas diferentes." },
            { q: "O metal parece mais frio que a madeira ao toque porque:", o: ["está mais frio", "conduz calor mais rápido", "tem menos calor", "reflete a luz"], c: 1, e: "O metal é bom condutor e retira calor da mão rapidamente." },
            { q: "A transferência de calor por correntes de ar ou água é chamada:", o: ["condução", "convecção", "irradiação", "dilatação"], c: 1, e: "Convecção ocorre em fluidos pela diferença de densidade." },
            { q: "35 °C na escala Kelvin equivalem a:", o: ["238 K", "273 K", "308 K", "358 K"], c: 2, e: "K = °C + 273 = 35 + 273 = 308 K." },
            { q: "O calor do Sol chega à Terra por:", o: ["condução", "convecção", "irradiação", "evaporação"], c: 2, e: "No vácuo, só a radiação eletromagnética transporta calor." }
          ]}
        ]
      }
    ]
  },
  {
    id: "qui", nome: "Química", simbolo: "⚗",
    desc: "Matéria, reações e soluções — química que aparece na prova.",
    hue: 150,
    unidades: [
      {
        id: "qui-u1", titulo: "Matéria e transformações",
        licoes: [
          { id: "qui-u1-l1", titulo: "Estados e misturas", topico: "qui-misturas", questoes: [
            { q: "A passagem do estado líquido para o gasoso é chamada:", o: ["fusão", "vaporização", "condensação", "sublimação"], c: 1, e: "Líquido → gás = vaporização (evaporação/ebulição)." },
            { q: "Água + óleo formam uma mistura:", o: ["homogênea", "heterogênea", "gasosa", "pura"], c: 1, e: "Não se dissolvem: duas fases visíveis." },
            { q: "Para separar sal dissolvido em água, usa-se:", o: ["filtração", "decantação", "destilação", "catação"], c: 2, e: "A destilação evapora a água e a recupera, separando o sal." },
            { q: "O ar que respiramos é:", o: ["uma substância pura", "uma mistura homogênea", "uma mistura heterogênea", "um elemento"], c: 1, e: "Mistura uniforme de N₂, O₂ e outros gases." },
            { q: "Amassar uma latinha é uma transformação:", o: ["química", "física", "nuclear", "biológica"], c: 1, e: "Muda a forma, não a composição da matéria." }
          ]},
          { id: "qui-u1-l2", titulo: "Átomos e tabela periódica", topico: "qui-atomos", questoes: [
            { q: "O número atômico (Z) de um elemento indica o número de:", o: ["nêutrons", "prótons", "elétrons livres", "massas"], c: 1, e: "Z = quantidade de prótons no núcleo." },
            { q: "Na tabela periódica, elementos da mesma coluna (grupo) têm:", o: ["mesma massa", "propriedades químicas semelhantes", "mesmo número de prótons", "mesma cor"], c: 1, e: "Grupos reúnem elementos com comportamento químico parecido." },
            { q: "O átomo de sódio (Z = 11) neutro possui:", o: ["11 elétrons", "22 elétrons", "11 nêutrons", "23 prótons"], c: 0, e: "Átomo neutro: nº de elétrons = nº de prótons = 11." },
            { q: "Isótopos são átomos com mesmo número de prótons e diferente número de:", o: ["elétrons", "nêutrons", "cargas", "camadas"], c: 1, e: "Mesmo Z, massas diferentes por variação de nêutrons." },
            { q: "São metais típicos, bons condutores de eletricidade:", o: ["oxigênio e cloro", "ferro e cobre", "hélio e neônio", "carbono e enxofre"], c: 1, e: "Ferro e cobre são metais; os demais são não metais/gases nobres." }
          ]},
          { id: "qui-u1-l3", titulo: "Ligações químicas", topico: "qui-ligacoes", questoes: [
            { q: "O sal de cozinha (NaCl) é formado por ligação:", o: ["covalente", "metálica", "iônica", "de hidrogênio"], c: 2, e: "Metal (Na) + não metal (Cl) → transferência de elétrons: iônica." },
            { q: "Na molécula de água (H₂O), os átomos se unem por ligação:", o: ["iônica", "covalente", "metálica", "nuclear"], c: 1, e: "Compartilhamento de elétrons entre não metais." },
            { q: "A condução elétrica nos fios de cobre é explicada pela ligação:", o: ["iônica", "covalente", "metálica", "de van der Waals"], c: 2, e: "No metal há um 'mar de elétrons' livres." },
            { q: "Compostos iônicos, em geral:", o: ["têm baixo ponto de fusão", "conduzem eletricidade dissolvidos em água", "são gases", "não formam cristais"], c: 1, e: "Dissolvidos, os íons ficam livres e conduzem corrente." },
            { q: "O gás carbônico tem fórmula:", o: ["CO", "CO₂", "C₂O", "CaO"], c: 1, e: "Um carbono e dois oxigênios: CO₂." }
          ]}
        ]
      },
      {
        id: "qui-u2", titulo: "Reações e soluções",
        licoes: [
          { id: "qui-u2-l1", titulo: "Mol e estequiometria", topico: "qui-mol", questoes: [
            { q: "A massa molar da água (H = 1, O = 16) é:", o: ["17 g/mol", "18 g/mol", "20 g/mol", "34 g/mol"], c: 1, e: "2×1 + 16 = 18 g/mol." },
            { q: "Quantos mols há em 88 g de CO₂ (massa molar 44 g/mol)?", o: ["0,5 mol", "1 mol", "2 mol", "4 mol"], c: 2, e: "n = m/M = 88/44 = 2 mol." },
            { q: "Na reação 2H₂ + O₂ → 2H₂O, 2 mols de H₂ reagem com:", o: ["0,5 mol de O₂", "1 mol de O₂", "2 mols de O₂", "4 mols de O₂"], c: 1, e: "Proporção 2:1 da equação balanceada." },
            { q: "Balancear uma equação química garante a conservação:", o: ["da velocidade", "da massa", "da cor", "do volume"], c: 1, e: "Lei de Lavoisier: nada se perde, tudo se transforma." },
            { q: "1 mol de qualquer substância contém aproximadamente:", o: ["6×10²³ partículas", "3×10⁸ partículas", "10¹⁰ partículas", "100 partículas"], c: 0, e: "Constante de Avogadro ≈ 6,02×10²³." }
          ]},
          { id: "qui-u2-l2", titulo: "Soluções e concentração", topico: "qui-solucoes", questoes: [
            { q: "Dissolvendo 20 g de sal em água até completar 2 L, a concentração é:", o: ["5 g/L", "10 g/L", "20 g/L", "40 g/L"], c: 1, e: "C = m/V = 20/2 = 10 g/L." },
            { q: "No soro caseiro, a água é o:", o: ["soluto", "solvente", "precipitado", "catalisador"], c: 1, e: "O solvente dissolve; sal e açúcar são os solutos." },
            { q: "Adicionar água a um suco concentrado é uma:", o: ["diluição", "evaporação", "saturação", "titulação"], c: 0, e: "Diluir = adicionar solvente, reduzindo a concentração." },
            { q: "Uma solução que não dissolve mais soluto está:", o: ["diluída", "insaturada", "saturada", "destilada"], c: 2, e: "Atingiu o limite de solubilidade." },
            { q: "500 mL de solução com 25 g de açúcar tem concentração de:", o: ["12,5 g/L", "25 g/L", "50 g/L", "100 g/L"], c: 2, e: "25 g / 0,5 L = 50 g/L." }
          ]},
          { id: "qui-u2-l3", titulo: "Ácidos, bases e pH", topico: "qui-ph", questoes: [
            { q: "Uma solução com pH = 3 é:", o: ["neutra", "básica", "ácida", "salina"], c: 2, e: "pH < 7 indica acidez." },
            { q: "O 'leite de magnésia', usado contra azia, é:", o: ["um ácido", "uma base", "um sal neutro", "um óxido ácido"], c: 1, e: "Mg(OH)₂ é base e neutraliza o excesso de ácido do estômago." },
            { q: "A reação entre um ácido e uma base produz:", o: ["sal e água", "gás e fogo", "metal e óxido", "apenas água"], c: 0, e: "Neutralização: ácido + base → sal + água." },
            { q: "A chuva ácida está associada principalmente a óxidos de:", o: ["sódio e potássio", "enxofre e nitrogênio", "ferro e cobre", "cálcio e magnésio"], c: 1, e: "SOₓ e NOₓ reagem com a água da chuva formando ácidos." },
            { q: "O suco de limão tem pH próximo de 2. Comparado à água pura (pH 7), ele é:", o: ["mais básico", "mais ácido", "neutro", "mais alcalino"], c: 1, e: "Quanto menor o pH, maior a acidez." }
          ]}
        ]
      }
    ]
  },
  {
    id: "bio", nome: "Biologia", simbolo: "❋",
    desc: "Da célula aos ecossistemas — vida em todas as escalas.",
    hue: 330,
    unidades: [
      {
        id: "bio-u1", titulo: "A vida em escala micro",
        licoes: [
          { id: "bio-u1-l1", titulo: "Citologia", topico: "bio-celula", questoes: [
            { q: "A organela responsável pela respiração celular e produção de energia (ATP) é:", o: ["ribossomo", "mitocôndria", "lisossomo", "complexo golgiense"], c: 1, e: "A mitocôndria é a usina de energia da célula." },
            { q: "A principal característica de uma célula procarionte é:", o: ["ter núcleo organizado", "não ter núcleo delimitado por membrana", "ser sempre pluricelular", "não ter material genético"], c: 1, e: "Procariontes (bactérias) não possuem carioteca; o DNA fica disperso." },
            { q: "A estrutura que controla a entrada e saída de substâncias na célula é a:", o: ["parede celular", "membrana plasmática", "mitocôndria", "vacúolo"], c: 1, e: "A membrana plasmática é seletivamente permeável." },
            { q: "A fotossíntese ocorre em qual organela das células vegetais?", o: ["mitocôndria", "cloroplasto", "ribossomo", "lisossomo"], c: 1, e: "O cloroplasto contém clorofila e realiza a fotossíntese." },
            { q: "Os ribossomos são responsáveis pela:", o: ["digestão celular", "síntese de proteínas", "respiração", "fotossíntese"], c: 1, e: "Os ribossomos traduzem o RNA em proteínas." }
          ]},
          { id: "bio-u1-l2", titulo: "Genética básica", topico: "bio-genetica", questoes: [
            { q: "A molécula que carrega a informação genética é o:", o: ["ATP", "DNA", "lipídio", "glicogênio"], c: 1, e: "O DNA armazena o código genético dos seres vivos." },
            { q: "No cruzamento de dois heterozigotos (Aa x Aa), a proporção fenotípica esperada é:", o: ["1:1", "3:1", "9:3:3:1", "todos iguais"], c: 1, e: "Aa x Aa gera 3 dominantes para 1 recessivo (3:1)." },
            { q: "Um gene recessivo só se manifesta no fenótipo quando o indivíduo é:", o: ["heterozigoto", "homozigoto recessivo", "homozigoto dominante", "híbrido"], c: 1, e: "Precisa de dois alelos recessivos (aa) para se expressar." },
            { q: "Os cromossomos são formados principalmente por:", o: ["proteínas e DNA", "apenas água", "lipídios", "carboidratos"], c: 0, e: "Cromossomos são DNA associado a proteínas (histonas)." },
            { q: "Uma pessoa do grupo sanguíneo O pode doar sangue para:", o: ["apenas O", "apenas A", "todos os grupos ABO", "apenas AB"], c: 2, e: "O tipo O é doador universal (sem antígenos A e B)." }
          ]},
          { id: "bio-u1-l3", titulo: "Corpo humano", topico: "bio-fisiologia", questoes: [
            { q: "O órgão responsável por bombear o sangue pelo corpo é o:", o: ["pulmão", "fígado", "coração", "rim"], c: 2, e: "O coração impulsiona o sangue pelo sistema circulatório." },
            { q: "A troca de gases (O2 e CO2) ocorre nos:", o: ["rins", "alvéolos pulmonares", "intestinos", "músculos"], c: 1, e: "Os alvéolos realizam a hematose (troca gasosa)." },
            { q: "A principal função dos rins é:", o: ["digerir alimentos", "filtrar o sangue e produzir urina", "bombear sangue", "produzir insulina"], c: 1, e: "Os rins filtram o sangue e eliminam resíduos pela urina." },
            { q: "A insulina, hormônio que controla o açúcar no sangue, é produzida pelo:", o: ["fígado", "pâncreas", "estômago", "baço"], c: 1, e: "O pâncreas produz insulina; sua falta causa diabetes." },
            { q: "A digestão de alimentos começa na:", o: ["boca", "no estômago", "no intestino grosso", "no fígado"], c: 0, e: "Na boca, a mastigação e a saliva (amilase) iniciam a digestão." }
          ]}
        ]
      },
      {
        id: "bio-u2", titulo: "Vida em conjunto",
        licoes: [
          { id: "bio-u2-l1", titulo: "Ecologia", topico: "bio-ecologia", questoes: [
            { q: "Em uma cadeia alimentar, as plantas ocupam o papel de:", o: ["consumidores", "produtores", "decompositores", "predadores"], c: 1, e: "Plantas produzem seu alimento por fotossíntese: são produtoras." },
            { q: "Os fungos e bactérias que reciclam matéria orgânica morta são:", o: ["produtores", "consumidores primários", "decompositores", "herbívoros"], c: 2, e: "Decompositores devolvem nutrientes ao ambiente." },
            { q: "O conjunto de todos os seres vivos de uma mesma espécie numa área é uma:", o: ["comunidade", "população", "ecossistema", "bioma"], c: 1, e: "População = indivíduos da mesma espécie no mesmo local." },
            { q: "A relação entre a abelha e a flor, em que ambas se beneficiam, é um exemplo de:", o: ["predação", "competição", "mutualismo", "parasitismo"], c: 2, e: "Mutualismo: os dois lados ganham (néctar e polinização)." },
            { q: "O aumento do efeito estufa está ligado principalmente ao gás:", o: ["oxigênio", "gás carbônico (CO2)", "hidrogênio", "hélio"], c: 1, e: "O CO2 (e o metano) retêm calor, intensificando o aquecimento." }
          ]},
          { id: "bio-u2-l2", titulo: "Evolução", topico: "bio-evolucao", questoes: [
            { q: "A teoria da seleção natural foi proposta por:", o: ["Mendel", "Darwin", "Lamarck", "Pasteur"], c: 1, e: "Charles Darwin formulou a seleção natural." },
            { q: "Segundo a seleção natural, sobrevivem e se reproduzem mais os indivíduos:", o: ["maiores", "mais fortes sempre", "mais adaptados ao ambiente", "mais jovens"], c: 2, e: "A adaptação ao ambiente é o que favorece a sobrevivência." },
            { q: "Estruturas com origem comum, como o braço humano e a asa do morcego, são:", o: ["análogas", "homólogas", "vestigiais", "idênticas"], c: 1, e: "Órgãos homólogos têm mesma origem embrionária, funções diferentes." },
            { q: "A variabilidade genética de uma população é aumentada principalmente por:", o: ["mutações e reprodução sexuada", "alimentação", "clima", "tamanho dos indivíduos"], c: 0, e: "Mutações e recombinação sexual geram diversidade." },
            { q: "Fósseis são importantes para a evolução porque:", o: ["mostram o clima atual", "registram formas de vida do passado", "criam novas espécies", "não têm valor científico"], c: 1, e: "Fósseis evidenciam como os seres vivos mudaram ao longo do tempo." }
          ]},
          { id: "bio-u2-l3", titulo: "Saúde e biotecnologia", topico: "bio-saude", questoes: [
            { q: "As vacinas protegem o organismo porque:", o: ["matam todos os vírus do ar", "estimulam a produção de anticorpos", "substituem o sangue", "curam qualquer doença"], c: 1, e: "A vacina induz memória imunológica (anticorpos) contra o agente." },
            { q: "Doenças como dengue e zika são transmitidas por:", o: ["água contaminada", "mosquito Aedes aegypti", "contato de pele", "alimentos"], c: 1, e: "O mosquito Aedes aegypti é o vetor dessas arboviroses." },
            { q: "Os antibióticos são eficazes contra:", o: ["vírus", "bactérias", "fungos apenas", "qualquer doença"], c: 1, e: "Antibióticos combatem bactérias, não vírus (como a gripe)." },
            { q: "Organismos geneticamente modificados (transgênicos) têm em seu DNA:", o: ["nenhuma alteração", "genes de outra espécie inseridos", "apenas genes removidos", "só proteínas"], c: 1, e: "Transgênicos recebem genes de outro organismo por engenharia genética." },
            { q: "Uma alimentação equilibrada e a prática de exercícios ajudam a prevenir doenças:", o: ["genéticas hereditárias", "crônicas como obesidade e diabetes tipo 2", "infecciosas apenas", "causadas por vírus"], c: 1, e: "Hábitos saudáveis reduzem o risco de doenças crônicas não transmissíveis." }
          ]}
        ]
      }
    ]
  }
];
