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
