-- 006 — itens da loja adaptados ao mascote astronauta (novo visual)
update public.shop_items set nome = 'Capacete branco', descricao = 'O capacete clássico de astronauta, em branco brilhante.' where id = 'capacete-astro';
update public.shop_items set nome = 'Visor vermelho', descricao = 'Troca o brilho dos olhos para vermelho.' where id = 'oculos-vermelhos';
update public.shop_items set descricao = 'Macacão branco de missão espacial.' where id = 'traje-astro';
