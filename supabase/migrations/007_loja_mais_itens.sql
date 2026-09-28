-- ============================================================
-- 007 — Loja: 20 itens novos (cabeça, moletons, acessórios e fundos)
-- ============================================================
insert into public.shop_items (id, nome, descricao, categoria, raridade, preco, nivel_min, inicial, ordem) values
  ('bandana',              'Bandana',               'Amarrada no capacete, pronta para a prova.',      'cabeca', 'comum',     70, 1, false, 19),
  ('antena',               'Antena Δ',              'Capta sinais de fórmulas a anos-luz.',            'cabeca', 'comum',     90, 1, false, 20),
  ('aureola',              'Auréola',               'Para quem nunca chuta uma alternativa.',          'cabeca', 'raro',     260, 2, false, 21),
  ('capacete-dourado',     'Capacete dourado',      'Brilha como nota máxima.',                        'cabeca', 'epico',    800, 4, false, 22),
  ('coroa-delta',          'Coroa Δ',               'Realeza da Matemática, com joia triangular.',     'cabeca', 'lendario',1200, 4, false, 23),
  ('capacete-holografico', 'Capacete holográfico',  'Muda de cor conforme a luz.',                     'cabeca', 'lendario',1400, 5, false, 24),
  ('moletom-branco',       'Moletom branco',        'O clássico Delta em versão clara.',               'corpo',  'raro',     260, 1, false, 24),
  ('moletom-roxo',         'Moletom Nébula',        'Roxo Nébula, direto da paleta oficial.',          'corpo',  'raro',     260, 1, false, 25),
  ('moletom-ciano',        'Moletom Pulsar',        'Ciano Pulsar para quem estuda de madrugada.',     'corpo',  'raro',     260, 2, false, 26),
  ('jaqueta-varsity',      'Jaqueta universitária', 'Com o Δ bordado. Treino para o vestibular.',      'corpo',  'epico',    550, 2, false, 27),
  ('regua',                'Régua',                 'Trinta centímetros de precisão.',                 'acessorio', 'comum',  70, 1, false, 34),
  ('livro-formulas',       'Livro de fórmulas',     'Bhaskara, Pitágoras e companhia.',                'acessorio', 'comum',  90, 1, false, 35),
  ('balao-delta',          'Balão Δ',               'Um balão iridescente que nunca murcha.',          'acessorio', 'raro',  240, 1, false, 36),
  ('skate',                'Skate neon',            'Rodinhas ciano e magenta.',                       'acessorio', 'raro',  320, 2, false, 37),
  ('trofeu',               'Troféu',                'Para comemorar cada simulado.',                   'acessorio', 'epico', 650, 3, false, 38),
  ('sala-aula',            'Sala de aula',          'Lousa cheia de fórmulas.',                        'fundo',  'comum',    120, 1, false, 45),
  ('lua',                  'Superfície lunar',      'A Terra lá no alto.',                             'fundo',  'raro',     300, 1, false, 46),
  ('por-do-sol',           'Pôr do sol',            'Horizonte laranja e magenta.',                    'fundo',  'raro',     280, 1, false, 47),
  ('cidade-neon',          'Cidade neon',           'Prédios com janelas ciano e magenta.',            'fundo',  'epico',    500, 2, false, 48),
  ('matrix',               'Chuva de números',      'Δ, π e √ caindo na tela.',                        'fundo',  'epico',    520, 3, false, 49)
on conflict (id) do update set nome = excluded.nome, descricao = excluded.descricao, categoria = excluded.categoria,
  raridade = excluded.raridade, preco = excluded.preco, nivel_min = excluded.nivel_min, inicial = excluded.inicial, ordem = excluded.ordem;
