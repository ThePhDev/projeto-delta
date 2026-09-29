-- Painel v2: série com o período anterior (2x dias) para comparação e mapa de calor dia x hora.
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
  with dias as (select generate_series(hoje - (2 * d - 1), hoje, interval '1 day')::date dia),
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
    'heatmap', (select coalesce(jsonb_agg(jsonb_build_object('d', dw, 'h', h, 'n', n)), '[]'::jsonb) from (
        select extract(dow from created_at at time zone tz)::int dw, extract(hour from created_at at time zone tz)::int h, count(*) n
        from question_attempts where created_at >= now() - make_interval(days => d) group by 1, 2) z),
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

