# Changelog

## v1.11.0 — 2026-09-28
- **Camada de produto e UX**: a CodeMakers-Design (Bueno / Code Makers) fica em `vendor/codemakers/`, só local e no .gitignore (não tem licença, então não é publicada). Traz contratos de 36 componentes com todos os estados, formulários e jornadas, playbooks de 12 tipos de produto, 14 receitas de layout, diagnóstico visual, estudos de 6 marcas e a biblioteca pesquisável (`search_design.py`) + `contrast_check.py`.

## v1.10.2 — 2026-09-27
- Item 4 do contrato aponta para a skill `no-slop-motion` (ferndesk, MIT) em filmes de lançamento/marca feitos no HyperFrames. O fio narrativo, as regras de mundo, os motivos da marca e a lista de defaults banidos também valem para o storytelling do site.

## v1.10.1 — 2026-09-27
- Contrato one-shot ganha os itens 12 e 13. Item 12: mostrar o produto em vez de metáfora (mini-cenas da interface nos cards, ícones em chip no meio do título, cor própria por item com brilho tingido, profundidade em camadas), a partir do antes/depois do Kirill para a Sider. Item 13: passada final com as skills `ui-taste` e `ios-design` (Uizze, Apache-2.0, instaladas via `npx skills add https://uizze.sh/`).

## v1.10.0 — 2026-09-27
- **Contrato one-shot** (topo do SKILL.md): 11 itens obrigatórios com status registrado no gauntlet. Estilo das referências Figma dele, storytelling com cenas que se transformam, construção na entrada, HyperFrames para motion/ícones, interatividade de mouse e dedo, mobile como app com barra, tipografia editorial misturando fontes na frase, cor (skills color-palette/color-expert) com camada de luz, 3D polido (skills threejs-*, HDRI, vidro real, peças sólidas), humanizer em toda copy e revisão com checagem de sobreposição e vídeo. Motivo: feedback em áudio sobre o NOVA (resultado com cara de IA, etapas da skill puladas).

## v1.9.2 — 2026-09-26
- **Path A fluido e cinematográfico**: a referência é composição, não largura fixa. O build ocupa a tela toda em qualquer monitor, cada seção vira uma cena fixa com coreografia no scroll e uma abertura monta a página. Motivo: no NOVA a cópia 1:1 ficou numa coluna estreita e "parada".

## v1.9.1 — 2026-09-26
- **Path A sem recortes**: nenhuma arte é cortada da referência. Toda ilustração, objeto 3D e cenário pintado é recriado em código (three.js com um renderer compartilhado, shader para paisagens com névoa e luz, SVG em camadas) e anima em loop. Exceções: fotos reais do cliente e logos. Motivo: no NOVA os recortes pareciam colados e deixaram a página parada.

## v1.9.0 — 2026-09-26
- **Referências reais como imagem de estilo** (`prompt-kit.md` §000): subir 2–3 das referências de Figma na FLORA e gerar no GPT Image 2.5 Sunburst (is2i, 2K) com elas em `image_urls`. O resultado herda o nível de acabamento delas: paleta pastel viva, família de ícones 3D, ilustração com personalidade, cards flutuantes, tiles, bento, botões com relevo, mix tipográfico e wordmark colorido.
- Corrige o exagero de contenção da v1.7/v1.8 (a v1.8 continua valendo para o build: tokens por baixo).

## v1.8.0 — 2026-09-26
- **Novo método padrão** (`prompt-kit.md` §00): a IA gera só as ilustrações (hero + vinhetas no mesmo traço, recortadas com máscara alfa), e o layout vira um frame de Figma em código com tokens (uma escala de tipo, espaçamento em grid de 8px, fontes reais com itálico verdadeiro). O frame é renderizado (PC + 4 iPhones) e aprovado antes do build. Motivo: layouts inteiros gerados por IA saem com tipografia e espaçamento inconsistentes.
- Regra de fonte: conferir se a família tem itálico de verdade (a Gambarino não tem; Zodiak, Erode e Sentient têm).

## v1.7.1 — 2026-09-26
- Prompt kit §0 (itens 9–11), aprendidos no teste com Qwen Image 2.1 na FLORA: aprovar o hero primeiro e gerar desktop e mobile com o hero como referência de imagem; a ilustração única vira vinhetas do mesmo desenho em todas as seções; em proporção alta a resolução é baixa (~416×1024), então a imagem serve de guia de layout.

## v1.7.0 — 2026-09-25
- **Premium craft** (`prompt-kit.md` §0), porque as imagens v2 saíram genéricas: paleta 1 cor em tons + neutros + 1 acento (<5 %), uma única ilustração autoral (axonométrica arquitetônica de traço fino, sem ícones 3D de clip-art), um só gesto tipográfico (serifa de alto contraste + neo-grotesca, com dois tamanhos que importam), microdetalhes de designer (linhas finas, legendas `Fig.`, números tabulares, cotas, setas ↗), 55–65 % de espaço vazio e uma dieta de decoração.
- **Uma seção por imagem** (§2.4) em vez da página inteira, para o gerador concentrar o detalhe. A entrega agora é hero + 3–5 seções + mobile.
- Vocabulário de ofício no prompt (editorial layout, Swiss grid, hairline rules, tabular figures) em vez de adjetivos.

## v1.6.0 — 2026-09-25
- **Camada de polimento**: `vendor/emil` (emil-design-eng) e `vendor/better` (better-ui, typography, colors, layout, accessibility, writing, break, interface-review, explain-interface, de Jakub Krehel, MIT), usados por tema e com valores exatos.
- **Cursor**: continua sendo uma seta de cursor, customizada com efeitos ao redor. Um cursor de bolinha ou blob agora reprova no portão 4.
- **Economia de tokens**: tiers S/M/L, leitura por seção, números antes de pixels (`shoot.py` gera `*.view.jpg` de 1000px), crítico combinado no tier M, júri de 3 no M, subagentes enxutos e correções em lote.
- O ecossistema Jev foi avaliado e não entrou: exige chave paga e serve para rotear ferramentas, não para design.

## v1.5.3 — 2026-09-25
- O prompt kit **voltou ao padrão v2 (v1.5.0)**, que o usuário aprovou como o melhor: faixas de cor lisas, paleta e fontes próprias, hero isométrico em vetor com hotspots "+", placeholders com legenda e conteúdo atrás de interação. As variantes com textura/papel (v1.5.1) e só tipografia (v1.5.2) foram descartadas.
- O prompt de **mobile agora usa mockups realistas de iPhone 16 Pro** (de frente, sem inclinar, moldura de titânio e Dynamic Island), com a interface plana e nítida dentro da tela.

## v1.5.2 — 2026-09-25
- Prompt kit: **sai toda a ideia de textura** (papel, grão, retícula, risograph, efeitos de impressão). O print passa a ser 100% digital, exportado do Figma, só com vetor nítido, gradiente limpo e sombra vetorial.
- **A tipografia é a arte**: cada seção abre com um lockup tipográfico customizado, com tamanhos e pesos misturados, palavras vazadas, palavra em curva, letras sobre a ilustração e ligadura própria.
- Todo prompt pede **texto em alta qualidade** (nítido, com kerning certo, sem letra derretida) e usa quality `xhigh` nas telas com muito texto.

## v1.5.1 — 2026-09-25
- Prompt kit: **conceito artístico com mundo material** (papel risograph, recorte, argila, feltro, resina, letterpress, folha de ouro…), seções como camadas físicas com textura visível e 3–4 efeitos mais ousados (raios em halftone, light leak, cáusticas, desfoque de profundidade, peças caindo com motion blur, tipo em relevo ou foil, tipo sobre a arte), mantendo a UI nítida.
- **Formato padrão para o GPT Image 2.5 Sunburst**, seguindo o guia oficial da OpenAI: DELIVERABLE / CONCEPT / SCENE / TEXT (todo texto entre aspas) / DETAILS / CONSTRAINTS / PROTECTED ANCHORS, com a linha de configurações (quality high/xhigh, 1024x1536 → 2160x3840) e iteração de uma mudança por vez.

## v1.5.0 — 2026-09-25
- **Prompt kit reescrito** (`prompt-kit.md`): as telas geradas agora parecem um print final de Figma/Dribbble, e toda foto vira um bloco em branco com legenda do que vai ali (o gerador não inventa mais o lugar). Paleta e tipografia próprias, fugindo do padrão de IA (dafont e fundições criativas primeiro), faixas de cor por seção com a transição descrita, ilustração vetorial com luz e profundidade mais objetos em 3D. Notas para geradores mais criativos (Midjourney v7, Ideogram 3, Recraft v3).
- **Prompt pack é obrigatório e bloqueante**: pesquisar o negócio, mandar os prompts e esperar a resposta antes de qualquer código, mesmo quando o cliente já tem fotos.
- **Conteúdo, espaço e fluxo de seções** (SKILL.md): todo fato do negócio tem lugar, mas a superfície é mínima e o resto fica atrás de interação (hotspots, cards que expandem, acordeões, sheets animados); 160–240px entre seções; cor de fundo que transiciona entre as seções no scroll.
- **Padrão de ilustração e SVG**: camadas, uma direção de luz, gradientes, sombra suave, profundidade, alguns elementos em 3D (three.js ou CSS 3D) e loop contínuo tipo GIF em toda ilustração, pausado fora da tela e parado com reduced motion.
- Gauntlet: portões 4 e 5 passam a cobrar essas regras.

## v1.4.1 — 2026-09-25
- `motion-craft.md` §4: efeitos assinatura para páginas Experiência/Persuadir: dither, renderização ASCII, malha 3D que dobra (three.js TSL + GSAP, verso com UV invertido), distorção por cursor e transições de página com View Transitions API. Com orçamento de 60fps no celular e fallback estático.

## v1.4.0 — 2026-09-25
- `motion-craft.md`: repertório de motion de nível Dribbble (uma forma só com morph, molas, bordas líquidas, manipulação direta, trocas com blur, ritmo, regras de engenharia seek-safe) + brief melhorado para reels de UI com HyperFrames.
- `scripts/motion/springs.js`: molas de forma fechada (duration/bounce), `retarget`, `liquidEdges`, `rubberBand`, `dragThenRelease`, `swap`, `beat`, `LiveSpring`. Testado numericamente e num demo real (`demo.html`).

## v1.3.0 — 2026-09-25
- **Gerador de prompts** (`prompt-kit.md`): em projetos sem referência, a skill entrega primeiro um conceito em 5 linhas e os prompts para gerar as telas de desktop, mobile e app no estilo minimalista criativo feito por humanos. O usuário gera as imagens e a skill clona (Path A), ou manda construir direto.
- **DNA de estilo** tirado de 7 referências estudadas (Wandor, Mugic, ShipSphere, FNJ, Finley, Odella, Oriel), salvas em `references/creative-minimal/` para servir de referência de estilo nos geradores de imagem.

## v1.2.0 — 2026-09-25
- **Júri Awwwards (portão 8):** 5 jurados independentes, com Design 40 % / Usabilidade 30 % / Criatividade 20 % / Conteúdo 10 % e o voto mais distante da média descartado em cada critério. Passa com ≥ 8,0 (nível SOTD) e nenhum critério abaixo de 7.
- **`vitals.py`:** LCP, CLS, TBT, tempo de carga e peso, no desktop e num celular com a CPU e a rede limitadas. Entrou no portão 7.
- **Técnicas do Impeccable:** 4 modos por tela, piso de artesanato (Verificar / Recusar, superfícies do navegador tematizadas), `impeccable detect` no portão 5 e nota de Nielsen ≥ 32/40 no portão 7.
- A inspeção agora é feita em lote (um render para todos os checks do portão).

## v1.1.0 — 2026-09-25
- A tasteskill original (`design-taste-frontend`) foi recuperada dos registros e incorporada como `taste-reference.md`: Design Read, 3 dials (8/10/4), diretriz cinematográfica (GSAP, cursor SVG animado, todo SVG animado), design systems oficiais, protocolo de redesign, AI tells e proibição do travessão.
- O gauntlet ganhou o método do Gauntlet Loop: contrato de aceite, construtor e crítico separados, A/B cego, registro de problemas com severidade e regras de parada PASS / UNVERIFIED / NEEDS WORK.
- Nova rota para redesign de sites que já existem.

## v1.0.0 — 2026-09-25
Primeira versão estável ("safe").
- Uma única skill para qualquer interface, com dois caminhos: com referência (clone pixel a pixel) e sem referência (direção visual).
- Gauntlet de 7 portões com restart e críticos independentes.
- Regras de tipografia (dafont primeiro, licença, cobertura de glifos) e de mobile com o mesmo cuidado do PC.
- Motion no padrão Emil Kowalski e catálogo React Bits (217 componentes).
- Scripts: `palette.py`, `shoot.py` (prints estáveis + auditoria), `diff.py` (mapa de calor, exclusões), `publish.py` (Cloudflare).
