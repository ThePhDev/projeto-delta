-- Painel administrativo: todas as leituras e ações passam por RPCs que exigem is_admin().
-- Nenhuma tabela ganha política nova; alunos não conseguem chamar (a função levanta exceção).

create or replace function public._admin_only() returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
end $$;
revoke all on function public._admin_only() from public, anon, authenticated;

-- ---------- visão geral ----------
create or replace function public.admin_overview(p_days int default 30)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  d int := least(greatest(coalesce(p_days, 30), 7), 90);
  tz constant text := 'America/Sao_Paulo';
  hoje date := (now() at time zone tz)::date;
  r jsonb;
begin
  perform public._admin_only();
  with dias as (select generate_series(hoje - (d - 1), hoje, interval '1 day')::date dia),
  cad as (select (created_at at time zone tz)::date dia, count(*) n from profiles group by 1),
  att as (select (created_at at time zone tz)::date dia, count(*) n, count(*) filter (where correta) ok, count(distinct user_id) u from question_attempts group by 1),
  xpd as (select (created_at at time zone tz)::date dia, sum(amount) xp, count(distinct user_id) u from xp_events group by 1),
  atv as (select dia, count(distinct user_id) u from (
      select user_id, (created_at at time zone tz)::date dia from question_attempts
      union select user_id, (created_at at time zone tz)::date from xp_events) x group by 1)
  select jsonb_build_object(
    'gerado_em', now(),
    'totais', jsonb_build_object(
      'usuarios', (select count(*) from profiles),
      'alunos', (select count(*) from profiles where tipo_usuario = 'aluno'),
      'professores', (select count(*) from profiles where tipo_usuario = 'professor'),
      'admins', (select count(*) from profiles where tipo_usuario = 'admin'),
      'onboarding_ok', (select count(*) from profiles where onboarding_ok),
      'com_cronograma', (select count(*) from profiles where cronograma is not null and cronograma <> '{}'::jsonb),
      'novos_7d', (select count(*) from profiles where created_at >= now() - interval '7 days'),
      'ativos_hoje', (select coalesce(u, 0) from atv where dia = hoje),
      'ativos_7d', (select count(distinct user_id) from xp_events where created_at >= now() - interval '7 days'),
      'ativos_30d', (select count(distinct user_id) from xp_events where created_at >= now() - interval '30 days'),
      'tentativas', (select count(*) from question_attempts),
      'acertos', (select count(*) from question_attempts where correta),
      'xp_total', (select coalesce(sum(xp), 0) from user_stats),
      'deltas_total', (select coalesce(sum(deltas), 0) from user_stats),
      'licoes_concluidas', (select count(*) from lesson_progress),
      'simulados', (select count(*) from simulation_attempts),
      'itens_comprados', (select count(*) from user_items),
      'conquistas', (select count(*) from user_achievements),
      'erros_abertos', (select count(*) from error_notebook where not dominado),
      'sequencia_media', (select coalesce(round(avg(streak_atual)::numeric, 1), 0) from user_stats),
      'suspensos', (select count(*) from auth.users where banned_until is not null and banned_until > now())
    ),
    'serie', (select coalesce(jsonb_agg(jsonb_build_object('dia', di.dia,
        'cadastros', coalesce(c.n, 0), 'ativos', coalesce(a.u, 0),
        'tentativas', coalesce(t.n, 0), 'acertos', coalesce(t.ok, 0), 'xp', coalesce(x.xp, 0)) order by di.dia), '[]'::jsonb)
      from dias di left join cad c using (dia) left join atv a using (dia) left join att t using (dia) left join xpd x using (dia)),
    'topicos', (select coalesce(jsonb_agg(t order by t.total desc), '[]'::jsonb) from (
        select coalesce(topico, '(sem tópico)') topico, count(*) total, round(100.0 * count(*) filter (where correta) / count(*), 1) acerto
        from question_attempts group by 1 order by count(*) desc limit 20) t),
    'origens', (select coalesce(jsonb_agg(o), '[]'::jsonb) from (
        select origem, count(*) total, round(100.0 * count(*) filter (where correta) / count(*), 1) acerto from question_attempts group by 1) o),
    'escolas', (select coalesce(jsonb_agg(e order by e.n desc), '[]'::jsonb) from (
        select coalesce(nullif(trim(escola), ''), '(não informada)') escola, count(*) n from profiles group by 1 order by 2 desc limit 15) e),
    'horas', (select coalesce(jsonb_agg(jsonb_build_object('h', h, 'n', n) order by h), '[]'::jsonb) from (
        select extract(hour from created_at at time zone tz)::int h, count(*) n from question_attempts
        where created_at >= now() - interval '30 days' group by 1) z),
    'xp_fontes', (select coalesce(jsonb_agg(f), '[]'::jsonb) from (
        select source, count(*) eventos, sum(amount) xp from xp_events group by 1 order by 3 desc) f),
    'lic_top', (select coalesce(jsonb_agg(l order by l.n desc), '[]'::jsonb) from (
        select lesson_id, count(*) n, round(avg(estrelas)::numeric, 1) estrelas from lesson_progress group by 1 order by 2 desc limit 12) l),
    'loja_top', (select coalesce(jsonb_agg(l order by l.n desc), '[]'::jsonb) from (
        select i.item_id, s.nome, count(*) n from user_items i left join shop_items s on s.id = i.item_id
        where coalesce(s.inicial, false) = false group by 1, 2 order by 3 desc limit 10) l),
    'engajamento', jsonb_build_object(
      'nunca_estudaram', (select count(*) from profiles p where not exists (select 1 from xp_events x where x.user_id = p.id)),
      'sem_streak', (select count(*) from user_stats where streak_atual = 0),
      'streak_3_mais', (select count(*) from user_stats where streak_atual >= 3),
      'streak_7_mais', (select count(*) from user_stats where streak_atual >= 7)),
    'feedback', jsonb_build_object(
      'total', (select count(*) from feedback),
      'media', (select coalesce(round(avg(nota)::numeric, 2), 0) from feedback))
  ) into r;
  return r;
end $$;

-- ---------- lista de usuários ----------
create or replace function public.admin_users(p_search text default null, p_order text default 'recentes', p_limit int default 25, p_offset int default 0)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare lim int := least(greatest(coalesce(p_limit, 25), 1), 100); off int := greatest(coalesce(p_offset, 0), 0);
        q text := nullif(trim(p_search), ''); total int; rows jsonb;
begin
  perform public._admin_only();
  select count(*) into total from profiles p
   where q is null or p.nome ilike '%' || q || '%' or p.email ilike '%' || q || '%' or p.username ilike '%' || q || '%' or p.escola ilike '%' || q || '%';
  select coalesce(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb) into rows from (
    select p.id, p.nome, p.username, p.email, p.escola, p.tipo_usuario, p.created_at, p.onboarding_ok,
           coalesce(s.xp, 0) xp, coalesce(s.deltas, 0) deltas, coalesce(s.streak_atual, 0) streak, s.ultimo_estudo,
           (select count(*) from question_attempts a where a.user_id = p.id) tentativas,
           (select count(*) from question_attempts a where a.user_id = p.id and a.correta) acertos,
           (select count(*) from lesson_progress l where l.user_id = p.id) licoes,
           (au.banned_until is not null and au.banned_until > now()) suspenso,
           au.last_sign_in_at
      from profiles p
      left join user_stats s on s.user_id = p.id
      left join auth.users au on au.id = p.id
     where q is null or p.nome ilike '%' || q || '%' or p.email ilike '%' || q || '%' or p.username ilike '%' || q || '%' or p.escola ilike '%' || q || '%'
     order by
       case when p_order = 'xp' then coalesce(s.xp, 0) end desc nulls last,
       case when p_order = 'streak' then coalesce(s.streak_atual, 0) end desc nulls last,
       case when p_order = 'nome' then p.nome end asc nulls last,
       case when p_order = 'ultimo' then au.last_sign_in_at end desc nulls last,
       p.created_at desc
     limit lim offset off) t;
  return jsonb_build_object('total', total, 'rows', rows);
end $$;

-- ---------- detalhe de um usuário ----------
create or replace function public.admin_user_detail(p_uid uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare tz constant text := 'America/Sao_Paulo'; hoje date := (now() at time zone 'America/Sao_Paulo')::date; r jsonb;
begin
  perform public._admin_only();
  select jsonb_build_object(
    'perfil', (select to_jsonb(p) - 'tutorial' from profiles p where p.id = p_uid),
    'stats', (select to_jsonb(s) from user_stats s where s.user_id = p_uid),
    'auth', (select jsonb_build_object('ultimo_login', last_sign_in_at, 'criado', created_at, 'suspenso', banned_until is not null and banned_until > now()) from auth.users where id = p_uid),
    'serie', (select coalesce(jsonb_agg(jsonb_build_object('dia', di.dia, 'tentativas', coalesce(t.n, 0), 'acertos', coalesce(t.ok, 0), 'xp', coalesce(x.xp, 0)) order by di.dia), '[]'::jsonb)
      from (select generate_series(hoje - 13, hoje, interval '1 day')::date dia) di
      left join (select (created_at at time zone tz)::date dia, count(*) n, count(*) filter (where correta) ok from question_attempts where user_id = p_uid group by 1) t on t.dia = di.dia
      left join (select (created_at at time zone tz)::date dia, sum(amount) xp from xp_events where user_id = p_uid group by 1) x on x.dia = di.dia),
    'topicos', (select coalesce(jsonb_agg(t order by t.total desc), '[]'::jsonb) from (
      select coalesce(topico, '(sem tópico)') topico, count(*) total, count(*) filter (where correta) acertos from question_attempts where user_id = p_uid group by 1 order by 2 desc limit 15) t),
    'licoes', (select coalesce(jsonb_agg(jsonb_build_object('lesson_id', lesson_id, 'estrelas', estrelas, 'melhor', melhor_pontuacao, 'tentativas', tentativas, 'em', concluida_em) order by concluida_em desc), '[]'::jsonb) from lesson_progress where user_id = p_uid),
    'recentes', (select coalesce(jsonb_agg(a), '[]'::jsonb) from (
      select created_at, origem, topico, correta, tempo_seg from question_attempts where user_id = p_uid order by created_at desc limit 15) a),
    'contagens', jsonb_build_object(
      'itens', (select count(*) from user_items where user_id = p_uid),
      'conquistas', (select count(*) from user_achievements where user_id = p_uid),
      'erros_abertos', (select count(*) from error_notebook where user_id = p_uid and not dominado),
      'simulados', (select count(*) from simulation_attempts where user_id = p_uid)),
    'feedback', (select coalesce(jsonb_agg(f order by f.created_at desc), '[]'::jsonb) from (select nota, categorias, texto, created_at from feedback where user_id = p_uid) f)
  ) into r;
  return r;
end $$;

-- ---------- ações ----------
create or replace function public.admin_set_role(p_uid uuid, p_role text)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_only();
  if p_role not in ('aluno', 'professor', 'admin') then raise exception 'papel invalido'; end if;
  if p_uid = auth.uid() then raise exception 'voce nao pode alterar o proprio papel'; end if;
  update profiles set tipo_usuario = p_role where id = p_uid;
  if not found then raise exception 'usuario nao encontrado'; end if;
  return jsonb_build_object('ok', true, 'papel', p_role);
end $$;

create or replace function public.admin_set_suspended(p_uid uuid, p_suspenso boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_only();
  if p_uid = auth.uid() then raise exception 'voce nao pode suspender a propria conta'; end if;
  if exists (select 1 from profiles where id = p_uid and tipo_usuario = 'admin') then raise exception 'rebaixe o admin antes de suspender'; end if;
  update auth.users set banned_until = case when p_suspenso then now() + interval '100 years' else null end where id = p_uid;
  if not found then raise exception 'usuario nao encontrado'; end if;
  if p_suspenso then delete from auth.sessions where user_id = p_uid; end if;
  return jsonb_build_object('ok', true, 'suspenso', p_suspenso);
end $$;

-- somente usuários logados (a função barra quem não é admin)
revoke all on function public.admin_overview(int), public.admin_users(text, text, int, int), public.admin_user_detail(uuid),
  public.admin_set_role(uuid, text), public.admin_set_suspended(uuid, boolean) from public, anon;
grant execute on function public.admin_overview(int), public.admin_users(text, text, int, int), public.admin_user_detail(uuid),
  public.admin_set_role(uuid, text), public.admin_set_suspended(uuid, boolean) to authenticated;
