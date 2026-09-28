# Gauntlet · Projeto Delta (ambiente de teste)

Tier: **L** (site completo: landing + plataforma). Modo: Redesign com preservação.

## Rodada 1 (resultado: NEEDS WORK, continua na rodada 2)

| # | Portão | Status | Evidência |
|---|---|---|---|
| 1 | Fidelidade à direção | parcial | Segue `direction.md`; storyboard implementado exceto choreografia GSAP |
| 2 | Detalhes pixel a pixel | pendente | Crítico independente ainda não rodado |
| 3 | Responsivo | ok (1440 / 390) | Playwright desktop 1440 e iPhone 13, sem erros; faltam 1920, 1280, 360 |
| 4 | Motion | parcial | Cursor seta SVG com estados (idle, hover com etiqueta, press, ripple, rastro); 3D interativo; falta GSAP e animar todo SVG |
| 5 | Design humano | parcial | Removidos: travessões, rótulos numerados, dica de scroll, faixa de métricas, preto puro, cursor círculo. Restam: vidro decorativo e emojis na plataforma |
| 6 | Texto humano | ok | Zero travessões visíveis (landing, plataforma, conteúdo) |
| 7 | Qualidade | parcial | CSP estrita sem erros; carregamento adaptativo; falta medir LCP/CLS/TBT |
| 8 | Júri Awwwards | pendente | Não rodado |

## Contrato (one-shot) · status
1. Referências de estilo: N/A (redesign de site existente, sem referências Figma enviadas)
2. Storytelling contínuo: parcial (lavagem de cor entre faixas; falta morph entre cenas)
3. Construção na chegada: ok (loader Δ + título palavra a palavra)
4. Assets de motion (HyperFrames): N/A neste ambiente
5. Interatividade: ok (tetraedro com arrastar/toque; questão respondível)
6. Mobile = app: ok na plataforma (barra inferior); landing adaptada
7. Tipografia editorial: ok (serif reto + itálico + sans + chip Δ no título)
8. Cor e luz: parcial
9. Acabamento 3D (three.js, vidro): pendente (hoje é Canvas 2D leve)
10. Copy humanizada: ok
11. Revisão em 5 larguras: parcial
12. Mostrar o produto: ok (questão real da plataforma na landing)
13. UI taste pass: pendente

## Próxima rodada
- three.js com tetraedro de vidro (transmission) carregado sob demanda
- Coreografia GSAP + ScrollTrigger nas cenas
- Plataforma: trocar emojis por ícones SVG animados e remover texto em gradiente
- Medir Core Web Vitals e rodar crítico + júri

## Rodada 2 · nova plataforma e identidade (resultado: pronta para validação no teste)

- Plataforma reescrita em módulos (`core`, `auth`, `learn`, `pages`, `app`), estilo Duolingo, identidade nova (Orbitron + Inter, Δ iridescente, astronauta vetorial).
- Primeiro acesso animado (nome, @, cor do visor, item inicial, meta) e tutorial guiado que aparece uma única vez por tela.
- Lição com até 8 questões: 5 da plataforma, até 2 inspiradas em questões do ENEM e 1 oficial do INEP. Cada questão exibe o selo de origem.
- Recompensas: XP, Deltas, sequência, subida de nível e conquistas com animação e som; loja e guarda-roupa funcionais pelo servidor.
- Landing: rastro "buraco negro" removido (fica só a seta), nova copy, seção do app com mascote em 3D, botão "Instalar no celular" (PWA com manifest e service worker).
- Corrigido: `@media(max-width:900px)` sem fechamento na landing, que prendia regras (inclusive reduced-motion) só em telas pequenas.
- Testes: Playwright com Supabase simulado em iPhone 13 e 1440px (onboarding, tutorial, lição completa, loja, perfil, ranking, missões, simulado, treinos); zero erros de console.

## Rodada 3 · trilha maior e técnicas dentro das atividades

- Trilha: 4 eixos × 4 unidades × 4 lições = 64 lições (eram 24), com baú de desafio por unidade.
- 40 lições novas usam geradores de questões (`site/app/gen.js`): números novos a cada tentativa, resposta calculada, distratores de erros comuns e resolução em passos. Validação automática: 40 geradores × 500 execuções sem falha.
- Técnicas aplicadas dentro da lição (a página separada de Técnicas saiu): exemplo guiado, recordação ativa, intercalação, revisão espaçada, correção guiada com nova chance, confiança (metacognição) e pausa Pomodoro depois de 25 min de foco.
- Corrigido: a classe `.done` da tela de resultado esticava os nós concluídos da trilha (espaços enormes).
- Migração 008: conquista "Eixo dominado" passa a exigir as 16 lições do eixo.

## Rodada 4 · ideias do seminário 2026.2 (projeto_deltinha.pdf)

- Plataforma: cronograma personalizável com sugestão automática pelo desempenho, diagnóstico inicial por eixo, cartões "para você hoje" (cronograma, revisão vencida, ponto fraco), Banco ENEM com filtro de dificuldade estimada, feedback dos estudantes (pesquisa-ação) visível na administração e guia de uso.
- Site: integrantes com líder e vice-líder e Danilo Augusto do Nascimento Fortes; semestre 2026.2; CEMEP Osmar Passarelli Silveira (Paulínia/SP); ODS 4 e ODS 10; proposta de solução; objetivos; caráter qualitativo e exploratório com pesquisa-ação; cronograma do projeto em 6 fases; dados do ENEM; referencial teórico; agradecimentos.
- Migração 009: profiles.cronograma, tabela feedback com RLS e dificuldade estimada nas 169 questões oficiais.
