-- ============================================================
-- 005 — Gamificação v2: Deltas (Δ), loja, avatar, conquistas,
--        onboarding, sequência no servidor e correções de segurança
-- Compatível com o app de produção atual (mesmo banco).
-- ============================================================

-- ---------- estatísticas: moeda e congelamentos ----------
alter table public.user_stats add column if not exists deltas integer not null default 0 check (deltas >= 0);
alter table public.user_stats add column if not exists congelamentos integer not null default 0 check (congelamentos between 0 and 2);
update public.user_stats set deltas = floor(xp * 0.4)::int where deltas = 0 and xp > 0;

-- ninguém cria/apaga a própria linha de estatísticas (evita recriar com XP inflado)
revoke insert, delete on public.user_stats from anon, authenticated;
revoke update (xp, deltas, congelamentos) on public.user_stats from anon, authenticated;
revoke insert, update, delete on public.xp_events from anon, authenticated;
revoke insert, update, delete on public.user_missions from anon, authenticated;

-- ---------- perfil: identidade do jogador ----------
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists avatar jsonb not null
  default '{"cor":"teal","cabeca":null,"corpo":null,"acessorio":null,"fundo":"espaco"}'::jsonb;
alter table public.profiles add column if not exists meta_diaria integer not null default 50;
alter table public.profiles add column if not exists onboarding_ok boolean not null default false;
alter table public.profiles add column if not exists tutorial jsonb not null default '{}'::jsonb;
do $$ begin
  alter table public.profiles add constraint profiles_username_fmt check (username is null or username ~ '^[a-z0-9_]{3,20}$');
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.profiles add constraint profiles_meta_ok check (meta_diaria in (20, 50, 100));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.profiles add constraint profiles_tutorial_small check (pg_column_size(tutorial) < 2048);
exception when duplicate_object then null; end $$;
create unique index if not exists profiles_username_key on public.profiles (lower(username));
grant update (tutorial, meta_diaria) on public.profiles to authenticated;

-- ---------- catálogo da loja ----------
create table if not exists public.shop_items (
  id text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  nome text not null,
  descricao text not null default '',
  categoria text not null check (categoria in ('cabeca','corpo','acessorio','fundo','poder')),
  raridade text not null check (raridade in ('comum','raro','epico','lendario')),
  preco integer not null check (preco >= 0),
  nivel_min integer not null default 1,
  inicial boolean not null default false,
  ordem integer not null default 0,
  ativo boolean not null default true
);
alter table public.shop_items enable row level security;
drop policy if exists "shop_read" on public.shop_items;
create policy "shop_read" on public.shop_items for select using (auth.role() = 'authenticated' and ativo);

create table if not exists public.user_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.shop_items(id),
  comprado_em timestamptz not null default now(),
  primary key (user_id, item_id)
);
alter table public.user_items enable row level security;
drop policy if exists "user_items_own" on public.user_items;
create policy "user_items_own" on public.user_items for select using (auth.uid() = user_id);
revoke insert, update, delete on public.user_items from anon, authenticated;

insert into public.shop_items (id, nome, descricao, categoria, raridade, preco, nivel_min, inicial, ordem) values
  ('capacete-astro',  'Capacete de astronauta', 'O visual clássico do micro astronauta.', 'cabeca', 'comum', 0, 1, true, 1),
  ('bone-azul',       'Boné azul',              'Para quem estuda com estilo.',           'cabeca', 'comum', 0, 1, true, 2),
  ('tiara',           'Tiara',                  'Brilho discreto para dias de prova.',    'cabeca', 'comum', 0, 1, true, 3),
  ('bone-estudante',  'Boné Estudante',         'Com o Δ bordado na frente.',             'cabeca', 'comum', 50, 1, false, 10),
  ('cartola',         'Cartola preta',          'Elegância para resolver equações.',      'cabeca', 'raro', 150, 2, false, 11),
  ('gorro-natal',     'Gorro de Natal',         'Edição de fim de ano.',                  'cabeca', 'raro', 220, 1, false, 12),
  ('chapeu-junino',   'Chapéu de palha',        'Arraiá da Matemática.',                  'cabeca', 'raro', 220, 1, false, 13),
  ('chapeu-bruxa',    'Chapéu de Halloween',    'Assustador só para as questões.',        'cabeca', 'raro', 220, 1, false, 14),
  ('chapeu-mago',     'Chapéu do Mago da Álgebra','Transforma x em resposta.',            'cabeca', 'epico', 600, 3, false, 15),
  ('peruca-euler',    'Peruca de Euler',        'e^(iπ) + 1 = 0, com classe.',            'cabeca', 'lendario', 1500, 5, false, 16),
  ('cartola-gauss',   'Cartola de Gauss',       'Soma de 1 a 100 em segundos.',           'cabeca', 'lendario', 1500, 5, false, 17),
  ('louros-pitagoras','Louros de Pitágoras',    'a² + b² = coroa.',                       'cabeca', 'lendario', 1500, 5, false, 18),
  ('mochila-enem',    'Mochila ENEM',           'Cabe caneta preta e documento com foto.','corpo', 'raro', 150, 1, false, 20),
  ('jaleco',          'Jaleco de cientista',    'Para experimentos com números.',         'corpo', 'raro', 200, 2, false, 21),
  ('traje-astro',     'Traje espacial',         'Completa o visual de astronauta.',       'corpo', 'epico', 500, 3, false, 22),
  ('capa-super',      'Capa Super Delta',       'Poder de acertar sob pressão.',          'corpo', 'epico', 700, 4, false, 23),
  ('oculos-vermelhos','Óculos vermelhos',       'Troca a armação do Delta.',              'acessorio', 'comum', 80, 1, false, 30),
  ('calculadora',     'Calculadora',            'Proibida na prova, liberada aqui.',      'acessorio', 'comum', 60, 1, false, 31),
  ('lapis-dourado',   'Lápis dourado',          'Só marca alternativa certa (quase).',    'acessorio', 'raro', 180, 2, false, 32),
  ('mascara-carnaval','Máscara de Carnaval',    'Samba no pé, conta na cabeça.',          'acessorio', 'raro', 220, 1, false, 33),
  ('espaco',          'Espaço',                 'O fundo padrão da travessia.',           'fundo', 'comum', 0, 1, false, 40),
  ('lousa',           'Lousa verde',            'Clássico de sala de aula.',              'fundo', 'comum', 60, 1, false, 41),
  ('festa',           'Festa',                  'Confete para cada acerto.',              'fundo', 'raro', 200, 1, false, 42),
  ('galaxia',         'Galáxia',                'Nebulosa violeta em movimento.',         'fundo', 'raro', 250, 2, false, 43),
  ('aurora',          'Aurora',                 'Luz boreal para dias de foco.',          'fundo', 'epico', 450, 3, false, 44),
  ('congelar',        'Congelar sequência',     'Protege sua sequência se você faltar um dia. Máximo de 2.', 'poder', 'comum', 120, 1, false, 50)
on conflict (id) do update set nome = excluded.nome, descricao = excluded.descricao, categoria = excluded.categoria,
  raridade = excluded.raridade, preco = excluded.preco, nivel_min = excluded.nivel_min, inicial = excluded.inicial, ordem = excluded.ordem;

-- ---------- conquistas ----------
create table if not exists public.achievements (
  code text primary key,
  titulo text not null,
  descricao text not null,
  icone text not null,
  recompensa integer not null default 0,
  ordem integer not null default 0
);
alter table public.achievements enable row level security;
drop policy if exists "achievements_read" on public.achievements;
create policy "achievements_read" on public.achievements for select using (auth.role() = 'authenticated');

create table if not exists public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null references public.achievements(code),
  em timestamptz not null default now(),
  primary key (user_id, code)
);
alter table public.user_achievements enable row level security;
drop policy if exists "user_achievements_own" on public.user_achievements;
create policy "user_achievements_own" on public.user_achievements for select using (auth.uid() = user_id);
revoke insert, update, delete on public.user_achievements from anon, authenticated;

insert into public.achievements (code, titulo, descricao, icone, recompensa, ordem) values
  ('primeira_licao', 'Primeiro passo',   'Conclua sua primeira lição.',                 'alvo',     20, 1),
  ('nota_maxima',    'Gabaritou',        'Acerte todas as questões de uma lição.',      'estrela',  30, 2),
  ('streak_3',       'Três dias seguidos','Estude 3 dias seguidos.',                    'fogo',     30, 3),
  ('streak_7',       'Semana completa',  'Estude 7 dias seguidos.',                     'fogo',     80, 4),
  ('dez_licoes',     'Maratonista',      'Conclua 10 lições diferentes.',               'livro',    60, 5),
  ('xp_500',         'Meio milhar',      'Some 500 XP.',                                'raio',     50, 6),
  ('xp_2000',        'Dois mil',         'Some 2.000 XP.',                              'raio',    150, 7),
  ('enem_10',        'Nível ENEM',       'Acerte 10 questões oficiais do ENEM.',        'medalha',  60, 8),
  ('simulado_1',     'Dia de prova',     'Conclua um simulado.',                        'relogio',  40, 9),
  ('revisao_5',      'Memória de aço',   'Faça 5 revisões no tempo certo.',             'ciclo',    40, 10),
  ('primeira_compra','Estiloso',         'Compre seu primeiro item na loja.',           'sacola',   20, 11),
  ('eixo_completo',  'Eixo dominado',    'Conclua todas as lições de um eixo.',         'coroa',   120, 12)
on conflict (code) do update set titulo = excluded.titulo, descricao = excluded.descricao,
  icone = excluded.icone, recompensa = excluded.recompensa, ordem = excluded.ordem;

-- ---------- funções auxiliares ----------
create or replace function public.sp_level(p_xp integer)
returns integer language plpgsql immutable set search_path = public, pg_temp as $$
declare lvl int := 1; need int := 100; acc int := 0;
begin
  while p_xp >= acc + need loop
    acc := acc + need; lvl := lvl + 1; need := round(need * 1.35);
  end loop;
  return lvl;
end $$;

-- XP também rende Deltas (40%)
create or replace function public.award_xp(p_amount integer, p_source text, p_ref text default null)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_amount int := p_amount;
  v_today_xp int;
  v_tent int;
  v_new_total int;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  if p_source = 'acerto' and (v_amount < 1 or v_amount > 13) then raise exception 'invalid amount';
  elsif p_source = 'enem' and (v_amount < 1 or v_amount > 13) then raise exception 'invalid amount';
  elsif p_source = 'revisao' and (v_amount < 1 or v_amount > 30) then raise exception 'invalid amount';
  elsif p_source = 'licao' and (v_amount < 1 or v_amount > 150) then raise exception 'invalid amount';
  elsif p_source = 'simulado' and (v_amount < 1 or v_amount > 450) then raise exception 'invalid amount';
  elsif p_source = 'missao' then raise exception 'missao XP only via claim_mission()';
  elsif p_source not in ('acerto','enem','revisao','licao','simulado') then raise exception 'invalid source';
  end if;

  if p_source = 'licao' and p_ref is not null then
    select tentativas into v_tent from lesson_progress where user_id = v_uid and lesson_id = p_ref;
    if coalesce(v_tent,0) >= 3 then v_amount := greatest(1, v_amount / 2); end if;
  end if;

  select coalesce(sum(amount),0) into v_today_xp from xp_events
    where user_id = v_uid and created_at >= public.sp_period_start('diario');
  if v_today_xp + v_amount > 3000 then v_amount := greatest(0, 3000 - v_today_xp); end if;
  if v_amount = 0 then
    select xp into v_new_total from user_stats where user_id = v_uid;
    return coalesce(v_new_total, 0);
  end if;

  insert into xp_events (user_id, amount, source, ref) values (v_uid, v_amount, p_source, p_ref);
  update user_stats set xp = xp + v_amount, deltas = deltas + round(v_amount * 0.4)::int, updated_at = now()
    where user_id = v_uid returning xp into v_new_total;
  return coalesce(v_new_total, v_amount);
end $$;

create or replace function public.claim_mission(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid(); m record; v_key text; v_start timestamptz; v_val int := 0; v_new_total int;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  select * into m from missions where code = p_code and ativo;
  if not found then raise exception 'mission not found'; end if;
  if m.periodo = 'diaria' then
    v_key := public.sp_today()::text; v_start := public.sp_period_start('diario');
  else
    v_key := to_char(public.sp_today(), 'IYYY-"W"IW'); v_start := public.sp_period_start('semanal');
  end if;
  if exists (select 1 from user_missions where user_id = v_uid and mission_code = p_code and period_key = v_key) then
    return jsonb_build_object('ok', false, 'reason', 'already_claimed');
  end if;
  if m.metrica = 'xp' then
    select coalesce(sum(amount),0) into v_val from xp_events where user_id = v_uid and created_at >= v_start and source <> 'missao';
  elsif m.metrica = 'acertos' then
    select count(*) into v_val from question_attempts where user_id = v_uid and correta and created_at >= v_start;
  elsif m.metrica = 'licoes' then
    select count(*) into v_val from xp_events where user_id = v_uid and source = 'licao' and created_at >= v_start;
  elsif m.metrica = 'revisoes' then
    select count(*) into v_val from xp_events where user_id = v_uid and source = 'revisao' and created_at >= v_start;
  elsif m.metrica = 'materias' then
    select count(distinct materia) into v_val from question_attempts where user_id = v_uid and created_at >= v_start and materia is not null;
  elsif m.metrica = 'simulados' then
    select count(*) into v_val from simulation_attempts where user_id = v_uid and created_at >= v_start;
  end if;
  if v_val < m.alvo then
    return jsonb_build_object('ok', false, 'reason', 'incomplete', 'progresso', v_val, 'alvo', m.alvo);
  end if;
  insert into user_missions (user_id, mission_code, period_key, xp) values (v_uid, p_code, v_key, m.xp_recompensa);
  insert into xp_events (user_id, amount, source, ref) values (v_uid, m.xp_recompensa, 'missao', p_code);
  update user_stats set xp = xp + m.xp_recompensa, deltas = deltas + round(m.xp_recompensa * 0.4)::int, updated_at = now()
    where user_id = v_uid returning xp into v_new_total;
  return jsonb_build_object('ok', true, 'xp', m.xp_recompensa, 'total', v_new_total);
end $$;

-- sequência diária calculada no servidor (com congelamento automático)
create or replace function public.touch_streak()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); s record; t date := public.sp_today(); v_streak int; v_frozen boolean := false;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  select * into s from user_stats where user_id = v_uid for update;
  if not found then raise exception 'stats not found'; end if;
  if s.ultimo_estudo = t then
    return jsonb_build_object('streak', s.streak_atual, 'melhor', s.melhor_streak, 'mudou', false, 'congelou', false, 'congelamentos', s.congelamentos);
  end if;
  if s.ultimo_estudo = t - 1 then
    v_streak := s.streak_atual + 1;
  elsif s.ultimo_estudo = t - 2 and s.congelamentos > 0 then
    v_streak := s.streak_atual + 1; v_frozen := true;
  else
    v_streak := 1;
  end if;
  update user_stats set streak_atual = v_streak, melhor_streak = greatest(melhor_streak, v_streak),
    ultimo_estudo = t, congelamentos = congelamentos - (case when v_frozen then 1 else 0 end), updated_at = now()
    where user_id = v_uid;
  return jsonb_build_object('streak', v_streak, 'melhor', greatest(s.melhor_streak, v_streak), 'mudou', true,
    'congelou', v_frozen, 'congelamentos', s.congelamentos - (case when v_frozen then 1 else 0 end));
end $$;

create or replace function public.buy_item(p_item text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); it record; s record;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  select * into it from shop_items where id = p_item and ativo;
  if not found then return jsonb_build_object('ok', false, 'reason', 'not_found'); end if;
  select * into s from user_stats where user_id = v_uid for update;
  if public.sp_level(s.xp) < it.nivel_min then return jsonb_build_object('ok', false, 'reason', 'level', 'nivel', it.nivel_min); end if;
  if it.categoria = 'poder' then
    if s.congelamentos >= 2 then return jsonb_build_object('ok', false, 'reason', 'max'); end if;
  elsif exists (select 1 from user_items where user_id = v_uid and item_id = p_item) or (it.id = 'espaco') then
    return jsonb_build_object('ok', false, 'reason', 'owned');
  end if;
  if s.deltas < it.preco then return jsonb_build_object('ok', false, 'reason', 'saldo', 'falta', it.preco - s.deltas); end if;
  update user_stats set deltas = deltas - it.preco,
    congelamentos = congelamentos + (case when it.categoria = 'poder' then 1 else 0 end), updated_at = now()
    where user_id = v_uid;
  if it.categoria <> 'poder' then
    insert into user_items (user_id, item_id) values (v_uid, p_item);
  end if;
  return jsonb_build_object('ok', true, 'deltas', s.deltas - it.preco);
end $$;

create or replace function public.equip_item(p_slot text, p_item text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_cat text; v_av jsonb;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  if p_slot not in ('cabeca','corpo','acessorio','fundo') then raise exception 'invalid slot'; end if;
  if p_item is not null then
    select categoria into v_cat from shop_items where id = p_item;
    if v_cat is distinct from p_slot then raise exception 'invalid item'; end if;
    if p_item <> 'espaco' and not exists (select 1 from user_items where user_id = v_uid and item_id = p_item) then
      raise exception 'not owned';
    end if;
  end if;
  update profiles set avatar = jsonb_set(avatar, array[p_slot], coalesce(to_jsonb(p_item), 'null'::jsonb))
    where id = v_uid returning avatar into v_av;
  return v_av;
end $$;

create or replace function public.set_avatar_color(p_cor text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_av jsonb;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  if p_cor not in ('teal','violeta','coral','lima','azul','rosa') then raise exception 'invalid color'; end if;
  update profiles set avatar = jsonb_set(avatar, '{cor}', to_jsonb(p_cor)) where id = v_uid returning avatar into v_av;
  return v_av;
end $$;

create or replace function public.complete_onboarding(p_nome text, p_username text, p_cor text, p_inicial text, p_meta integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_user text := lower(trim(p_username)); v_nome text := left(trim(coalesce(p_nome,'')), 60);
  v_cat text; v_av jsonb;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  if exists (select 1 from profiles where id = v_uid and onboarding_ok) then
    return jsonb_build_object('ok', false, 'reason', 'done');
  end if;
  if v_nome = '' then return jsonb_build_object('ok', false, 'reason', 'nome'); end if;
  if v_user !~ '^[a-z0-9_]{3,20}$' then return jsonb_build_object('ok', false, 'reason', 'username_fmt'); end if;
  if exists (select 1 from profiles where lower(username) = v_user and id <> v_uid) then
    return jsonb_build_object('ok', false, 'reason', 'username_taken');
  end if;
  if p_cor not in ('teal','violeta','coral','lima','azul','rosa') then return jsonb_build_object('ok', false, 'reason', 'cor'); end if;
  if p_meta not in (20, 50, 100) then return jsonb_build_object('ok', false, 'reason', 'meta'); end if;
  v_av := jsonb_build_object('cor', p_cor, 'cabeca', null, 'corpo', null, 'acessorio', null, 'fundo', 'espaco');
  if p_inicial is not null then
    select categoria into v_cat from shop_items where id = p_inicial and inicial;
    if v_cat is null then return jsonb_build_object('ok', false, 'reason', 'item'); end if;
    insert into user_items (user_id, item_id) values (v_uid, p_inicial) on conflict do nothing;
    v_av := jsonb_set(v_av, array[v_cat], to_jsonb(p_inicial));
  end if;
  update profiles set nome = v_nome, username = v_user, avatar = v_av, meta_diaria = p_meta, onboarding_ok = true
    where id = v_uid;
  update user_stats set deltas = deltas + 100, updated_at = now() where user_id = v_uid;
  return jsonb_build_object('ok', true, 'bonus', 100, 'avatar', v_av);
end $$;

create or replace function public.username_available(p_username text)
returns boolean language sql stable security definer set search_path = public as $$
  select lower(trim(p_username)) ~ '^[a-z0-9_]{3,20}$'
     and not exists (select 1 from profiles where lower(username) = lower(trim(p_username)) and id <> auth.uid())
$$;

-- dica: gasta 10 Δ
create or replace function public.use_hint(p_ref text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_saldo int;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  update user_stats set deltas = deltas - 10, updated_at = now()
    where user_id = v_uid and deltas >= 10 returning deltas into v_saldo;
  if v_saldo is null then return jsonb_build_object('ok', false, 'reason', 'saldo'); end if;
  return jsonb_build_object('ok', true, 'deltas', v_saldo);
end $$;

-- verifica e concede conquistas (recompensa em Δ)
create or replace function public.claim_achievements()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); s record; a record; ok boolean; novos jsonb := '[]'::jsonb; ganho int := 0;
  eixos text[][] := array[
    array['mat-u1-l1','mat-u1-l2','num-u1-l3','num-u2-l1','num-u2-l2','num-u2-l3'],
    array['mat-u2-l1','alg-u1-l2','alg-u1-l3','alg-u2-l1','alg-u2-l2','alg-u2-l3'],
    array['mat-u2-l2','geo-u1-l2','geo-u1-l3','geo-u2-l1','geo-u2-l2','geo-u2-l3'],
    array['mat-u1-l3','est-u1-l2','est-u1-l3','est-u2-l1','est-u2-l2','mat-u2-l3']];
  i int;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  select * into s from user_stats where user_id = v_uid;
  for a in select * from achievements order by ordem loop
    continue when exists (select 1 from user_achievements where user_id = v_uid and code = a.code);
    ok := case a.code
      when 'primeira_licao' then exists (select 1 from lesson_progress where user_id = v_uid and estrelas > 0)
      when 'nota_maxima' then exists (select 1 from lesson_progress where user_id = v_uid and melhor_pontuacao = 100)
      when 'streak_3' then s.melhor_streak >= 3
      when 'streak_7' then s.melhor_streak >= 7
      when 'dez_licoes' then (select count(*) from lesson_progress where user_id = v_uid and estrelas > 0) >= 10
      when 'xp_500' then s.xp >= 500
      when 'xp_2000' then s.xp >= 2000
      when 'enem_10' then (select count(*) from question_attempts where user_id = v_uid and origem = 'enem' and correta) >= 10
      when 'simulado_1' then exists (select 1 from simulation_attempts where user_id = v_uid)
      when 'revisao_5' then (select count(*) from xp_events where user_id = v_uid and source = 'revisao') >= 5
      when 'primeira_compra' then exists (select 1 from user_items ui join shop_items si on si.id = ui.item_id
                                          where ui.user_id = v_uid and not si.inicial)
      when 'eixo_completo' then false
      else false end;
    if a.code = 'eixo_completo' then
      for i in 1..4 loop
        if (select count(*) from lesson_progress where user_id = v_uid and estrelas > 0 and lesson_id = any(eixos[i:i][1:6])) = 6 then
          ok := true;
        end if;
      end loop;
    end if;
    if ok then
      insert into user_achievements (user_id, code) values (v_uid, a.code);
      ganho := ganho + a.recompensa;
      novos := novos || jsonb_build_object('code', a.code, 'titulo', a.titulo, 'descricao', a.descricao, 'icone', a.icone, 'recompensa', a.recompensa);
    end if;
  end loop;
  if ganho > 0 then update user_stats set deltas = deltas + ganho, updated_at = now() where user_id = v_uid; end if;
  return jsonb_build_object('novos', novos, 'ganho', ganho);
end $$;

-- ranking com @usuário e avatar
drop function if exists public.leaderboard(text, integer);
create function public.leaderboard(p_period text, p_limit integer default 50)
returns table(pos bigint, nome text, escola text, xp bigint, streak integer, is_me boolean, username text, avatar jsonb)
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_start timestamptz;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  if p_period not in ('diario','semanal','mensal','geral') then raise exception 'invalid period'; end if;
  p_limit := least(greatest(p_limit, 1), 100);
  v_start := public.sp_period_start(p_period);
  if p_period = 'geral' then
    return query
    select row_number() over (order by s.xp desc, s.updated_at asc),
           coalesce(nullif(split_part(p.nome,' ',1),''), 'Estudante'), coalesce(p.escola,''),
           s.xp::bigint, s.streak_atual, (s.user_id = v_uid), p.username, p.avatar
    from user_stats s join profiles p on p.id = s.user_id
    where s.xp > 0 order by s.xp desc, s.updated_at asc limit p_limit;
  else
    return query
    select row_number() over (order by t.total desc, t.first_at asc),
           coalesce(nullif(split_part(p.nome,' ',1),''), 'Estudante'), coalesce(p.escola,''),
           t.total, coalesce(s.streak_atual,0), (t.user_id = v_uid), p.username, p.avatar
    from (select e.user_id, sum(e.amount)::bigint total, min(e.created_at) first_at
          from xp_events e where e.created_at >= v_start group by e.user_id) t
    join profiles p on p.id = t.user_id left join user_stats s on s.user_id = t.user_id
    order by t.total desc, t.first_at asc limit p_limit;
  end if;
end $$;

-- permissões das funções novas
revoke execute on function public.touch_streak(), public.buy_item(text), public.equip_item(text, text),
  public.set_avatar_color(text), public.complete_onboarding(text, text, text, text, integer),
  public.use_hint(text), public.claim_achievements(), public.username_available(text),
  public.leaderboard(text, integer), public.sp_level(integer) from public, anon;
grant execute on function public.touch_streak(), public.buy_item(text), public.equip_item(text, text),
  public.set_avatar_color(text), public.complete_onboarding(text, text, text, text, integer),
  public.use_hint(text), public.claim_achievements(), public.username_available(text),
  public.leaderboard(text, integer), public.sp_level(integer) to authenticated;

-- correção de dados: questões de Ciências da Natureza marcadas como Matemática (2º dia: 91-135 = CN)
update public.questions set primary_subject = 'Física'  where year = 2023 and original_number in (128, 132) and primary_subject = 'Matemática';
update public.questions set primary_subject = 'Química' where year = 2023 and original_number in (129, 130, 131) and primary_subject = 'Matemática';
