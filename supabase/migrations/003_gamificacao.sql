-- ============================================================
-- Projeto Delta — Migração 003: Gamificação server-side
-- XP auditável por evento, ranking por período, missões com
-- validação no backend, caderno de erros e simulados.
-- Não altera tabelas existentes; apenas adiciona.
-- ============================================================

-- ---------- 1) Eventos de XP (fonte de verdade p/ rankings) ----------
create table if not exists public.xp_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null check (amount > 0 and amount <= 500),
  source text not null check (source in ('acerto','licao','revisao','missao','simulado','enem')),
  ref text,
  created_at timestamptz not null default now()
);
create index if not exists xp_events_user_time_idx on public.xp_events (user_id, created_at desc);
create index if not exists xp_events_time_idx on public.xp_events (created_at desc);

alter table public.xp_events enable row level security;
drop policy if exists "xp_events_select_own" on public.xp_events;
create policy "xp_events_select_own" on public.xp_events
  for select using (auth.uid() = user_id);
-- sem policy de insert/update/delete: escrita apenas via funções security definer

-- ---------- 2) Tentativas de questão (analytics + desempenho) ----------
create table if not exists public.question_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  origem text not null check (origem in ('licao','enem','simulado','revisao')),
  question_ref text not null,
  materia text,
  topico text,
  correta boolean not null,
  resposta text,
  resposta_correta text,
  tempo_seg int check (tempo_seg is null or (tempo_seg >= 0 and tempo_seg <= 3600)),
  created_at timestamptz not null default now()
);
create index if not exists qa_user_time_idx on public.question_attempts (user_id, created_at desc);
create index if not exists qa_user_materia_idx on public.question_attempts (user_id, materia);

alter table public.question_attempts enable row level security;
drop policy if exists "qa_own_select" on public.question_attempts;
create policy "qa_own_select" on public.question_attempts
  for select using (auth.uid() = user_id);
drop policy if exists "qa_own_insert" on public.question_attempts;
create policy "qa_own_insert" on public.question_attempts
  for insert with check (auth.uid() = user_id);

-- ---------- 3) Caderno de erros ----------
create table if not exists public.error_notebook (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  origem text not null check (origem in ('licao','enem','simulado','revisao')),
  question_ref text not null,
  enunciado text not null,
  resposta_aluno text,
  resposta_correta text,
  explicacao text,
  materia text,
  topico text,
  motivo text check (motivo is null or motivo in
    ('nao_conhecia','esqueci_formula','interpretei_errado','errei_calculo','falta_atencao','chutei','sem_tempo')),
  tentativas int not null default 1,
  dominado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, question_ref)
);
create index if not exists err_user_idx on public.error_notebook (user_id, dominado, created_at desc);

alter table public.error_notebook enable row level security;
drop policy if exists "err_own" on public.error_notebook;
create policy "err_own" on public.error_notebook
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- 4) Simulados ----------
create table if not exists public.simulation_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('rapido','materia','personalizado')),
  filtros jsonb not null default '{}'::jsonb,
  total int not null check (total between 1 and 90),
  acertos int not null check (acertos >= 0),
  tempo_seg int not null default 0 check (tempo_seg >= 0),
  detalhes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  check (acertos <= total)
);
create index if not exists sim_user_idx on public.simulation_attempts (user_id, created_at desc);

alter table public.simulation_attempts enable row level security;
drop policy if exists "sim_own" on public.simulation_attempts;
create policy "sim_own" on public.simulation_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- 5) Missões ----------
create table if not exists public.missions (
  code text primary key,
  titulo text not null,
  descricao text not null,
  periodo text not null check (periodo in ('diaria','semanal')),
  metrica text not null check (metrica in ('xp','acertos','licoes','revisoes','materias','simulados')),
  alvo int not null check (alvo > 0),
  xp_recompensa int not null check (xp_recompensa between 1 and 200),
  emoji text not null default '✦',
  ativo boolean not null default true
);

alter table public.missions enable row level security;
drop policy if exists "missions_read" on public.missions;
create policy "missions_read" on public.missions
  for select using (auth.role() = 'authenticated');

insert into public.missions (code, titulo, descricao, periodo, metrica, alvo, xp_recompensa, emoji) values
  ('d_xp50',      'Aquecimento',        'Ganhe 50 XP hoje',                       'diaria',  'xp',        50,  25, '⚡'),
  ('d_acertos10', 'Mira calibrada',     'Acerte 10 questões hoje',                'diaria',  'acertos',   10,  30, '🎯'),
  ('d_licao1',    'Uma lição por dia',  'Conclua 1 lição hoje',                   'diaria',  'licoes',     1,  20, '📘'),
  ('d_revisao1',  'Memória de aço',     'Faça 1 revisão pendente hoje',           'diaria',  'revisoes',   1,  25, '🔁'),
  ('d_materias2', 'Órbita dupla',       'Estude 2 matérias diferentes hoje',      'diaria',  'materias',   2,  30, '🪐'),
  ('s_xp400',     'Semana turbinada',   'Ganhe 400 XP nesta semana',              'semanal', 'xp',       400,  80, '🚀'),
  ('s_acertos50', 'Precisão semanal',   'Acerte 50 questões nesta semana',        'semanal', 'acertos',   50, 100, '💎'),
  ('s_simulado1', 'Dia de prova',       'Conclua 1 simulado nesta semana',        'semanal', 'simulados',  1,  60, '⏱️')
on conflict (code) do nothing;

create table if not exists public.user_missions (
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_code text not null references public.missions(code) on delete cascade,
  period_key text not null,
  xp int not null,
  claimed_at timestamptz not null default now(),
  primary key (user_id, mission_code, period_key)
);
create index if not exists um_user_idx on public.user_missions (user_id, claimed_at desc);

alter table public.user_missions enable row level security;
drop policy if exists "um_own_select" on public.user_missions;
create policy "um_own_select" on public.user_missions
  for select using (auth.uid() = user_id);
-- claims apenas via claim_mission()

-- ---------- 6) Funções ----------

-- helpers de período (fuso do Brasil)
create or replace function public.sp_today()
returns date language sql stable as
$$ select (now() at time zone 'America/Sao_Paulo')::date $$;

create or replace function public.sp_period_start(p_period text)
returns timestamptz language sql stable as $$
  select case p_period
    when 'diario'  then (public.sp_today()::timestamp at time zone 'America/Sao_Paulo')
    when 'semanal' then (date_trunc('week', public.sp_today()::timestamp) at time zone 'America/Sao_Paulo')
    when 'mensal'  then (date_trunc('month', public.sp_today()::timestamp) at time zone 'America/Sao_Paulo')
    else '-infinity'::timestamptz
  end
$$;

-- concede XP com validação por fonte + teto diário (anti-manipulação)
create or replace function public.award_xp(p_amount int, p_source text, p_ref text default null)
returns int
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_amount int := p_amount;
  v_today_xp int;
  v_tent int;
  v_new_total int;
begin
  if v_uid is null then
    raise exception 'auth required';
  end if;

  -- limites por fonte
  if p_source = 'acerto' and (v_amount < 1 or v_amount > 13) then
    raise exception 'invalid amount';
  elsif p_source = 'enem' and (v_amount < 1 or v_amount > 13) then
    raise exception 'invalid amount';
  elsif p_source = 'revisao' and (v_amount < 1 or v_amount > 30) then
    raise exception 'invalid amount';
  elsif p_source = 'licao' and (v_amount < 1 or v_amount > 150) then
    raise exception 'invalid amount';
  elsif p_source = 'simulado' and (v_amount < 1 or v_amount > 450) then
    raise exception 'invalid amount';
  elsif p_source = 'missao' then
    raise exception 'missao XP only via claim_mission()';
  elsif p_source not in ('acerto','enem','revisao','licao','simulado') then
    raise exception 'invalid source';
  end if;

  -- redução para lições repetidas em excesso (anti-farm)
  if p_source = 'licao' and p_ref is not null then
    select tentativas into v_tent from lesson_progress
      where user_id = v_uid and lesson_id = p_ref;
    if coalesce(v_tent,0) >= 3 then
      v_amount := greatest(1, v_amount / 2);
    end if;
  end if;

  -- teto diário de 3000 XP
  select coalesce(sum(amount),0) into v_today_xp from xp_events
    where user_id = v_uid and created_at >= public.sp_period_start('diario');
  if v_today_xp + v_amount > 3000 then
    v_amount := greatest(0, 3000 - v_today_xp);
  end if;
  if v_amount = 0 then
    select xp into v_new_total from user_stats where user_id = v_uid;
    return coalesce(v_new_total, 0);
  end if;

  insert into xp_events (user_id, amount, source, ref) values (v_uid, v_amount, p_source, p_ref);
  update user_stats set xp = xp + v_amount, updated_at = now()
    where user_id = v_uid
    returning xp into v_new_total;
  return coalesce(v_new_total, v_amount);
end;
$$;
revoke execute on function public.award_xp(int, text, text) from public, anon;
grant execute on function public.award_xp(int, text, text) to authenticated;

-- resgata missão (verifica a condição no servidor)
create or replace function public.claim_mission(p_code text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  m record;
  v_key text;
  v_start timestamptz;
  v_val int := 0;
  v_new_total int;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  select * into m from missions where code = p_code and ativo;
  if not found then raise exception 'mission not found'; end if;

  if m.periodo = 'diaria' then
    v_key := public.sp_today()::text;
    v_start := public.sp_period_start('diario');
  else
    v_key := to_char(public.sp_today(), 'IYYY-"W"IW');
    v_start := public.sp_period_start('semanal');
  end if;

  if exists (select 1 from user_missions
             where user_id = v_uid and mission_code = p_code and period_key = v_key) then
    return jsonb_build_object('ok', false, 'reason', 'already_claimed');
  end if;

  if m.metrica = 'xp' then
    select coalesce(sum(amount),0) into v_val from xp_events
      where user_id = v_uid and created_at >= v_start and source <> 'missao';
  elsif m.metrica = 'acertos' then
    select count(*) into v_val from question_attempts
      where user_id = v_uid and correta and created_at >= v_start;
  elsif m.metrica = 'licoes' then
    select count(*) into v_val from xp_events
      where user_id = v_uid and source = 'licao' and created_at >= v_start;
  elsif m.metrica = 'revisoes' then
    select count(*) into v_val from xp_events
      where user_id = v_uid and source = 'revisao' and created_at >= v_start;
  elsif m.metrica = 'materias' then
    select count(distinct materia) into v_val from question_attempts
      where user_id = v_uid and created_at >= v_start and materia is not null;
  elsif m.metrica = 'simulados' then
    select count(*) into v_val from simulation_attempts
      where user_id = v_uid and created_at >= v_start;
  end if;

  if v_val < m.alvo then
    return jsonb_build_object('ok', false, 'reason', 'incomplete', 'progresso', v_val, 'alvo', m.alvo);
  end if;

  insert into user_missions (user_id, mission_code, period_key, xp)
    values (v_uid, p_code, v_key, m.xp_recompensa);
  insert into xp_events (user_id, amount, source, ref)
    values (v_uid, m.xp_recompensa, 'missao', p_code);
  update user_stats set xp = xp + m.xp_recompensa, updated_at = now()
    where user_id = v_uid
    returning xp into v_new_total;

  return jsonb_build_object('ok', true, 'xp', m.xp_recompensa, 'total', v_new_total);
end;
$$;
revoke execute on function public.claim_mission(text) from public, anon;
grant execute on function public.claim_mission(text) to authenticated;

-- progresso das missões do período (uma chamada só)
create or replace function public.mission_progress()
returns table (code text, titulo text, descricao text, periodo text, emoji text,
               alvo int, xp_recompensa int, progresso int, resgatada boolean)
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'auth required'; end if;
  return query
  select m.code, m.titulo, m.descricao, m.periodo, m.emoji, m.alvo, m.xp_recompensa,
    (case m.metrica
      when 'xp' then (select coalesce(sum(e.amount),0)::int from xp_events e
        where e.user_id = v_uid and e.source <> 'missao'
          and e.created_at >= public.sp_period_start(case m.periodo when 'diaria' then 'diario' else 'semanal' end))
      when 'acertos' then (select count(*)::int from question_attempts a
        where a.user_id = v_uid and a.correta
          and a.created_at >= public.sp_period_start(case m.periodo when 'diaria' then 'diario' else 'semanal' end))
      when 'licoes' then (select count(*)::int from xp_events e
        where e.user_id = v_uid and e.source = 'licao'
          and e.created_at >= public.sp_period_start(case m.periodo when 'diaria' then 'diario' else 'semanal' end))
      when 'revisoes' then (select count(*)::int from xp_events e
        where e.user_id = v_uid and e.source = 'revisao'
          and e.created_at >= public.sp_period_start(case m.periodo when 'diaria' then 'diario' else 'semanal' end))
      when 'materias' then (select count(distinct a.materia)::int from question_attempts a
        where a.user_id = v_uid and a.materia is not null
          and a.created_at >= public.sp_period_start(case m.periodo when 'diaria' then 'diario' else 'semanal' end))
      when 'simulados' then (select count(*)::int from simulation_attempts s
        where s.user_id = v_uid
          and s.created_at >= public.sp_period_start(case m.periodo when 'diaria' then 'diario' else 'semanal' end))
      else 0 end) as progresso,
    exists (select 1 from user_missions um
      where um.user_id = v_uid and um.mission_code = m.code
        and um.period_key = case when m.periodo = 'diaria' then public.sp_today()::text
                                 else to_char(public.sp_today(), 'IYYY-"W"IW') end) as resgatada
  from missions m where m.ativo
  order by m.periodo, m.code;
end;
$$;
revoke execute on function public.mission_progress() from public, anon;
grant execute on function public.mission_progress() to authenticated;

-- ranking por período (expõe apenas nome/escola/xp — nunca e-mail)
create or replace function public.leaderboard(p_period text, p_limit int default 50)
returns table (pos bigint, nome text, escola text, xp bigint, streak int, is_me boolean)
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_start timestamptz;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  if p_period not in ('diario','semanal','mensal','geral') then
    raise exception 'invalid period';
  end if;
  p_limit := least(greatest(p_limit, 1), 100);
  v_start := public.sp_period_start(p_period);

  if p_period = 'geral' then
    return query
    select row_number() over (order by s.xp desc, s.updated_at asc) as pos,
           coalesce(nullif(split_part(p.nome,' ',1),''), 'Estudante') as nome,
           coalesce(p.escola,'') as escola,
           s.xp::bigint as xp, s.streak_atual as streak,
           (s.user_id = v_uid) as is_me
    from user_stats s join profiles p on p.id = s.user_id
    where s.xp > 0
    order by s.xp desc, s.updated_at asc
    limit p_limit;
  else
    return query
    select row_number() over (order by t.total desc, t.first_at asc) as pos,
           coalesce(nullif(split_part(p.nome,' ',1),''), 'Estudante') as nome,
           coalesce(p.escola,'') as escola,
           t.total as xp,
           coalesce(s.streak_atual,0) as streak,
           (t.user_id = v_uid) as is_me
    from (
      select e.user_id, sum(e.amount)::bigint as total, min(e.created_at) as first_at
      from xp_events e
      where e.created_at >= v_start
      group by e.user_id
    ) t
    join profiles p on p.id = t.user_id
    left join user_stats s on s.user_id = t.user_id
    order by t.total desc, t.first_at asc
    limit p_limit;
  end if;
end;
$$;
revoke execute on function public.leaderboard(text, int) from public, anon;
grant execute on function public.leaderboard(text, int) to authenticated;

-- minha posição no período
create or replace function public.my_rank(p_period text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_start timestamptz;
  v_xp bigint := 0;
  v_pos bigint;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  if p_period not in ('diario','semanal','mensal','geral') then
    raise exception 'invalid period';
  end if;
  v_start := public.sp_period_start(p_period);

  if p_period = 'geral' then
    select s.xp into v_xp from user_stats s where s.user_id = v_uid;
    v_xp := coalesce(v_xp, 0);
    select count(*) + 1 into v_pos from user_stats s where s.xp > v_xp;
  else
    select coalesce(sum(amount),0) into v_xp from xp_events
      where user_id = v_uid and created_at >= v_start;
    select count(*) + 1 into v_pos from (
      select e.user_id, sum(e.amount) as total from xp_events e
      where e.created_at >= v_start group by e.user_id
    ) t where t.total > v_xp;
  end if;

  return jsonb_build_object('pos', v_pos, 'xp', v_xp);
end;
$$;
revoke execute on function public.my_rank(text) from public, anon;
grant execute on function public.my_rank(text) to authenticated;
