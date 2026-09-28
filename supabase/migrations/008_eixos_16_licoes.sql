-- ============================================================
-- 008 — Trilha maior: cada eixo tem 4 unidades x 4 lições (16).
-- A conquista "Eixo dominado" passa a exigir as 16 lições do eixo.
-- ============================================================
create or replace function public.claim_achievements()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); s record; a record; ok boolean; novos jsonb := '[]'::jsonb; ganho int := 0;
  eixos text[][] := array[
    array['mat-u1-l1','mat-u1-l2','num-u1-l3','num-u1-l4','num-u2-l1','num-u2-l2','num-u2-l3','num-u2-l4','num-u3-l1','num-u3-l2','num-u3-l3','num-u3-l4','num-u4-l1','num-u4-l2','num-u4-l3','num-u4-l4'],
    array['mat-u2-l1','alg-u1-l2','alg-u1-l3','alg-u1-l4','alg-u2-l1','alg-u2-l2','alg-u2-l3','alg-u2-l4','alg-u3-l1','alg-u3-l2','alg-u3-l3','alg-u3-l4','alg-u4-l1','alg-u4-l2','alg-u4-l3','alg-u4-l4'],
    array['mat-u2-l2','geo-u1-l2','geo-u1-l3','geo-u1-l4','geo-u2-l1','geo-u2-l2','geo-u2-l3','geo-u2-l4','geo-u3-l1','geo-u3-l2','geo-u3-l3','geo-u3-l4','geo-u4-l1','geo-u4-l2','geo-u4-l3','geo-u4-l4'],
    array['mat-u1-l3','est-u1-l2','est-u1-l3','est-u1-l4','est-u2-l1','est-u2-l2','mat-u2-l3','est-u2-l4','est-u3-l1','est-u3-l2','est-u3-l3','est-u3-l4','est-u4-l1','est-u4-l2','est-u4-l3','est-u4-l4']];
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
        if (select count(*) from lesson_progress where user_id = v_uid and estrelas > 0 and lesson_id = any(eixos[i:i][1:16])) = 16 then
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
update public.achievements set descricao = 'Conclua as 16 lições de um eixo.' where code = 'eixo_completo';
