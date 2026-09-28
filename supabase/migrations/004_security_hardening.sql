-- ============================================================
-- 004 — hardening de permissões (advisors do Supabase)
-- ============================================================

-- Funções de gatilho: só o próprio Postgres as executa via trigger.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.enforce_publication_rules() from public, anon, authenticated;
revoke execute on function public.enforce_single_correct() from public, anon, authenticated;

-- Validação de domínio escolar: usada apenas pelo hook de cadastro.
revoke execute on function public.is_school_email(text) from public, anon, authenticated;
grant execute on function public.is_school_email(text) to supabase_auth_admin;

-- is_admin() permanece executável: é avaliada dentro de políticas RLS
-- que valem para todos os papéis (revogar faria as consultas falharem).

-- search_path fixo impede sequestro de objetos via schemas do usuário.
alter function public.sp_today() set search_path = public, pg_temp;
alter function public.sp_period_start(text) set search_path = public, pg_temp;
revoke execute on function public.sp_today() from anon;
revoke execute on function public.sp_period_start(text) from anon;
