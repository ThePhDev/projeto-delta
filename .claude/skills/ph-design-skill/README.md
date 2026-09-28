<div align="center">

# 🎨 PH_Design_Skill

**O padrão de design do PH para o Claude Code.**
Qualquer interface, com ou sem referência: medida pixel a pixel, pensada para celular desde o início, com animação caprichada e revisada por um gauntlet de 8 portões, que termina num júri no estilo Awwwards, antes de chegar em você com link de preview.

`v1.9.0` · Claude Code skill · Python + Playwright

</div>

---

## ✨ O que ela faz

A skill é carregada sozinha em **qualquer tarefa com interface**: sites, landing pages, portfólios, web apps, telas de app, PWAs, dashboards, apps de estudo, componentes soltos e até "deixa esse botão mais bonito". Ela entra antes da primeira linha de código.

| | Com imagem de referência | Sem referência |
|---|---|---|
| **Começo** | Lê a imagem como uma especificação: cores em hex, grid, espaçamentos, tipografia, raios, sombras | Define a direção: público, clima, paleta, fontes e uma ideia assinatura |
| **Construção** | Copia na largura exata da referência | Desktop e mobile desenhados juntos |
| **Prova** | Comparação pixel a pixel até **≥ 97 %** de igualdade | Crítico confere se o resultado segue a direção |
| **Depois** | Mobile → Motion → Textos → Gauntlet → Link de preview | Mobile → Motion → Textos → Gauntlet → Link de preview |

## 🧭 Como funciona

```
imagem? ──sim──► spec.md ─► clone estático ─► loop de medição (print → diff → corrige a pior região) ─┐
   │                                                                                                  │
   └──não──► direction.md ─► desktop + mobile juntos ─────────────────────────────────────────────────┤
                                                                                                      ▼
                         mobile caprichado ─► motion (padrão Emil) ─► textos (humanizer) ─► GAUNTLET ─► link + prints
                                                                                               ▲   │
                                                                                               └───┘ falhou? corrige e recomeça do portão 1
```

### 🖼️ Gerador de prompts (quando não há referência)
Pediu um site ou app sem imagem? A skill começa entregando um **pacote de prompts** ([`prompt-kit.md`](prompt-kit.md)) no estilo **minimalista criativo, feito por humanos**, extraído de 7 referências estudadas ([`references/creative-minimal/`](references/creative-minimal)): Wandor, Mugic, ShipSphere, FNJ, Finley, Odella e Oriel.
- **Conceito em 5 linhas:** marca, modo, cor, metáfora do herói e sistema de ilustração.
- **Prompts** da landing completa no desktop, das telas de celular e das telas de app, todos com o mesmo bloco de estilo e o mesmo bloco negativo.
- **Dicas por ferramenta:** GPT Image, Nano Banana, Midjourney, Figma Make/Stitch.
- **Premium craft (v1.7)**: paleta contida (1 cor + neutros + 1 acento), uma ilustração autoral só, microdetalhes de designer, 60 % de espaço vazio e **uma seção por imagem** para o gerador não sair genérico.
- Depois você escolhe: **gera as imagens** e manda de volta (a skill clona pixel a pixel) **ou** responde "build" e ela constrói direto a partir do pacote.

### 🧠 Camada de gosto (a tasteskill original do PH)
A antiga skill `design-taste-frontend` foi recuperada por inteiro em [`taste-reference.md`](taste-reference.md) e continua sempre ativa:
- **Design Read + 3 dials** antes de construir: `DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY`, com base **8 / 10 / 4**.
- **Diretriz cinematográfica** para sites: coreografia com GSAP, **cursor SVG animado próprio** e **todo SVG visível animado**.
- **Design systems oficiais** quando o briefing pede um (Material, Fluent, Carbon, Radix, shadcn, Primer, GOV.UK, USWDS, Polaris, Atlassian, Bootstrap).
- **Protocolo de redesign** para sites que já existem: auditar antes de mexer e preservar o que importa.
- **AI tells proibidos**, incluindo a **proibição do travessão (—)**, o conteúdo "Jane Doe" e a prova social falsa.

### 🔤 Tipografia
- Identifica a fonte real (WhatTheFont, Matcherator) e procura **primeiro no [dafont](https://www.dafont.com/pt/)**, conferindo a licença. Depois vai para a fundição, o Fontshare ou o Font Squirrel. **Google Fonts só como reserva.**
- Com referência, testa 2 ou 3 fontes candidatas e fica com a que tiver a menor diferença pixel a pixel.
- Confere se a fonte tem acentos e símbolos (Ω, Δ, Σ). Usa uma família por papel e hospeda os arquivos no projeto.

### 📱 Mobile com o mesmo cuidado do PC
- O celular é planejado **antes** do código, mesmo quando a referência só mostra o desktop.
- Prints em 5 tamanhos (1440, 1280, 768, 390 e 360) com auditoria automática: rolagem lateral, texto abaixo de 12px, alvos de toque pequenos, imagens sem `alt` e erros de console.
- Apps ganham cara de nativo: áreas seguras, `100dvh`, sem flash ao tocar, inputs que não dão zoom.

### 🎬 Motion no padrão Emil Kowalski
| Superfície | Orçamento de movimento |
|---|---|
| Hero, seções, primeira carga | **Expressivo**: coreografia, scroll, WebGL, cursor |
| Botões, menus, abas, formulários | **Rápido e sutil**: 150–250 ms, interrompível |
| Ações repetidas ou de teclado | Nenhum ou instantâneo |

- Consulta primeiro o **catálogo React Bits** com 217 componentes animados ([`react-bits-catalog.md`](react-bits-catalog.md)). Também adapta para sites sem React.
- **Repertório de motion humano** ([`motion-craft.md`](motion-craft.md) + [`scripts/motion/springs.js`](scripts/motion/springs.js)): uma forma só que se transforma em vez de cortar; molas matemáticas (bounce ≤ 0,2); soma de molas para mudar de alvo sem pular; indicador líquido com duas bordas; arrasto 1:1 com rubber-band e soltura com velocidade; troca de conteúdo sem sobreposição. Tem demo em `scripts/motion/demo.html` e um brief de reel de UI (HyperFrames) no ritmo da música.
- Anima só transform, opacity e filter. Respeita `prefers-reduced-motion` e termina com `review-animations`.

### ✨ Camada de polimento (Emil Kowalski + Jakub Krehel)
Valores exatos, sempre ativos, lidos por tema e só na etapa em que são usados ([`vendor/`](vendor)):
- **emil-design-eng**: a filosofia dos detalhes invisíveis, de quando animar e do polimento de componentes.
- **better-ui**: raio concêntrico (externo = interno + padding), alinhamento óptico, sombra para elevação e borda para estrutura, troca de ícone (escala 0,25→1, blur 4px→0), contorno de 1px nas imagens, `scale(0.96)` ao clicar, saídas sutis, transição sem "manchar" na troca de tema.
- **better-typography / colors / layout / accessibility / writing**: tipografia, paletas OKLCH e contraste, agrupamento e revelação progressiva, foco e áreas de toque, microcopy.
- **break** (componente testado em todos os estados), **interface-review** (formato do crítico) e **explain-interface** (desmontar a referência).

### 🖱️ Cursor personalizado (que continua sendo cursor)
Sempre uma **seta** (a ponta é o ponto exato do clique) com a cor e o estilo do site. Os efeitos ficam **ao redor** dela: rastro suave, ondinha ao clicar, encolhe ao pressionar, etiqueta no hover ("Ver", "Abrir"), atração magnética e inclinação no movimento. Bolinha, blob ou círculo no lugar da seta reprova no portão 4.

### 🪙 Economia de tokens
- **Tamanho da execução**: S (ajuste pequeno, sem subagentes), M (uma página: um crítico combinado e júri de 3) e L (site ou app completo: tudo).
- **Leitura por seção**: os arquivos grandes nunca são lidos inteiros.
- **Números antes de pixels**: os scripts decidem primeiro, e as imagens são vistas em cópias JPEG de 1000px (`*.view.jpg`).
- **Subagentes enxutos**: recebem caminhos em vez de conteúdo, respondem em formato curto e usam sonnet ou haiku.
- **Correções em lote** por round.
### 🧩 Modo e piso de artesanato (técnicas do [Impeccable](https://github.com/pbakaus/impeccable))
- **4 modos por tela**:
  - **Persuadir** (landing, marketing) e **Experiência** (portfólio): motion cinematográfico.
  - **Ler** (docs, estudo) e **Operar** (apps, dashboards): clareza primeiro, e a marca vive nos detalhes.
- **Piso de artesanato** lido antes de qualquer edição de interface:
  - *Verificar*: contraste, profundidade, espaçamento, medida do texto, estados e **superfícies do navegador tematizadas** (seleção, cursor de texto, barra de rolagem, anel de foco).
  - *Recusar*: rótulo acima do título, texto em gradiente, cards iguais de ícone + título, vidro decorativo, emoji como ícone, grade falsa de fundo.
- **Detector automático** (`impeccable detect`): acha anti-padrões de IA e de qualidade com arquivo e linha.

### 🥊 Gauntlet de 8 portões ([`gauntlet.md`](gauntlet.md))
| # | Portão | Passa quando |
|---|---|---|
| 1 | Fidelidade | diff ≥ 97 %, deslocamento vertical ≤ 8px, nenhuma célula > 10 % (sem referência: segue a direção e os dials) |
| 2 | Detalhes pixel a pixel | crítico compara zooms 2x: peso da fonte, raios, bordas, sombras, ícones |
| 3 | Responsivo | `shoot.py` em 5 tamanhos sem nenhum problema |
| 4 | Motion | `review-animations` aprova; GSAP + cursor SVG + todo SVG animado, conferido rodando de verdade |
| 5 | Design humano | `impeccable detect` limpo + crítico sem nenhum sinal de template de IA |
| 6 | Texto humano | passou pelo humanizer, sem travessão e sem frases prontas |
| 7 | Qualidade | `vitals.py` ok (LCP ≤ 2,5s / 3s no celular, CLS ≤ 0,1, TBT ≤ 300ms), acessibilidade, Nielsen ≥ 32/40 |
| 8 | **Júri Awwwards** | 5 jurados independentes; nota ponderada **≥ 8,0** (nível Site of the Day) e nenhum critério abaixo de 7 |

#### 🏆 O júri (portão 8)
Imita a avaliação real do [Awwwards](https://www.awwwards.com/about-evaluation/): **Design 40 % · Usabilidade 30 % · Criatividade 20 % · Conteúdo 10 %**, com notas de 1 a 10.
- São 5 jurados com olhares diferentes: designer visual, especialista em UX, diretor criativo, estrategista de conteúdo e dev front-end. Eles veem só o site, como um visitante veria.
- Em cada critério, o voto mais distante da média é descartado, como o Awwwards faz.
- Cada jurado justifica cada nota e diz a única mudança que mais subiria a pior nota dele. Isso vira correção no round seguinte.
- A menção honrosa começa em 6,5. A PH_Design_Skill só entrega a partir de **8,0**.

Baseado no [Gauntlet Loop](https://github.com/duolahypercho/gauntlet-loop):
- **Contrato de aceite** escrito antes do primeiro round.
- **Construtor e crítico separados.** O crítico vê a referência e o resultado lado a lado, sem saber qual é qual (A/B cego), e cada problema vira um item com severidade e reteste.
- Um round só vale se **todos** os portões passarem juntos. Os portões 2, 5 e 7 são julgados por agentes críticos independentes, e o 8 pelo júri.
- Termina em **PASS**, **UNVERIFIED** ou **NEEDS WORK**. Chega a NEEDS WORK com 8 rounds, ou com 2 rounds seguidos sem melhora. Você é o freio: um "pare" encerra na hora.

### 🔗 Entrega
Build → túnel do Cloudflare → você recebe o **link público** e os prints de desktop e mobile, e também o % de igualdade quando tem referência.

## 🛠️ Ferramentas

| Script | O que faz |
|---|---|
| `scripts/palette.py` | Tamanho, cores dominantes em hex, cor exata de um ponto, zoom de regiões e extração de logos e fotos |
| `scripts/shoot.py` | Prints estáveis (espera as animações e o GSAP terminarem) em qualquer tamanho, mais a auditoria de responsividade |
| `scripts/diff.py` | Porcentagem de igualdade, deslocamento de altura, piores regiões, mapa de calor e comparação lado a lado |
| `scripts/publish.py` | Publica uma pasta ou porta num link `trycloudflare.com` e confere se o link responde |
| `scripts/vitals.py` | Desempenho medido: LCP, CLS, TBT, tempo de carga e peso, no desktop e num celular lento (CPU 4x, 4G) |
| `impeccable detect` | Detector de anti-padrões do Impeccable (vem com a skill impeccable) |

```bash
python scripts/palette.py ref.png --at 120,40 --crop 0,0,600,300 zoom.png
python scripts/shoot.py http://localhost:5173 qa --viewports 1920x1080,mobile --no-scroll
python scripts/diff.py ref.png qa/1920x1080.png qa/round1 --exclude 900,100,1400,600
python scripts/publish.py dist        # publica
python scripts/publish.py stop        # derruba os túneis
```

## 📦 Instalação

```bash
git clone https://github.com/ThePhDev/PH_Design_Skill ~/.claude/skills/ph-design-skill
pip install playwright numpy pillow && python -m playwright install chromium
# cloudflared no PATH (ou em ~/bin) para o link de preview
```

**Skills que ela usa como apoio:**
```bash
npx skills add emilkowalski/skills -s emil-design-eng animate animation-vocabulary apple-design find-animation-opportunities improve-animations mobile-native pick-ui-library prototype review-animations -g -a claude-code -y
npx skills add pbakaus/impeccable -g -a claude-code -y
npx skills add https://github.com/anthropics/skills --skill frontend-design -g -a claude-code -y
```
Também usa `humanizer` para os textos e, opcionalmente, `web-design-guidelines` no portão 7.

## 🗂️ Estrutura
```
ph-design-skill/
├── SKILL.md               # a skill (o que o Claude lê)
├── gauntlet.md            # os 8 portões + júri Awwwards + contrato, papéis e regras de parada
├── taste-reference.md     # a tasteskill original (dials, diretriz cinematográfica, AI tells, design systems)
├── motion-craft.md        # repertório de motion humano + brief de reel
├── vendor/                # emil-design-eng + pacote better-* (MIT, Jakub Krehel)
├── prompt-kit.md          # DNA de estilo + prompts de telas desktop/mobile/app
├── references/creative-minimal/  # as 7 referências de estilo
├── react-bits-catalog.md  # 217 componentes animados, por categoria
├── scripts/               # palette · shoot · diff · publish
├── CHANGELOG.md
└── README.md
```

## 🛟 Versões e backup
Cada versão estável ganha uma **tag** e uma **release** com o `.zip` da skill. Para voltar a uma versão segura:
```bash
cd ~/.claude/skills/ph-design-skill
git fetch --tags && git checkout v1.0.0     # só para olhar
git reset --hard v1.0.0                     # para voltar de vez
```

## 🙏 Créditos
- tasteskill (design-taste-frontend): a base de gosto anti-slop do PH
- [Gauntlet Loop](https://github.com/duolahypercho/gauntlet-loop): o método de construir e criticar em rounds
- [Emil Kowalski / skills](https://github.com/emilkowalski/skills): a filosofia de motion e de polimento
- [React Bits](https://github.com/DavidHDev/react-bits): o catálogo de componentes animados
- [Impeccable](https://github.com/pbakaus/impeccable) e o [frontend-design](https://github.com/anthropics/skills) da Anthropic: direção estética
