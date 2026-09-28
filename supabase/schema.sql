-- ============================================================
-- PROJETO DELTA — schema completo (auth + gamificação)
-- ============================================================

-- 1) Domínios de e-mail escolares autorizados (configurável)
create table if not exists public.allowed_email_domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique check (domain = lower(domain) and domain <> '' and domain not like '%@%'),
  created_at timestamptz not null default now()
);

insert into public.allowed_email_domains (domain) values
  ('edu'), ('edu.br'), ('escola.br'), ('aluno.br')
on conflict (domain) do nothing;

-- 2) Perfis (1:1 com auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  email text not null,
  escola text not null default '',
  tipo_usuario text not null default 'aluno' check (tipo_usuario in ('aluno','professor','admin')),
  created_at timestamptz not null default now()
);

-- 3) Gamificação
create table if not exists public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  streak_atual integer not null default 0 check (streak_atual >= 0),
  melhor_streak integer not null default 0 check (melhor_streak >= 0),
  ultimo_estudo date,
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  estrelas integer not null default 0 check (estrelas between 0 and 3),
  melhor_pontuacao integer not null default 0 check (melhor_pontuacao between 0 and 100),
  tentativas integer not null default 0,
  concluida_em timestamptz,
  primary key (user_id, lesson_id)
);

create table if not exists public.topic_stats (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  acertos integer not null default 0,
  erros integer not null default 0,
  intervalo_dias integer not null default 1,
  proxima_revisao date,
  atualizado_em timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create index if not exists idx_topic_stats_revisao on public.topic_stats (user_id, proxima_revisao);

-- ============================================================
-- Funções
-- ============================================================

-- e-mail escolar? (suffix match contra lista configurável)
create or replace function public.is_school_email(p_email text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.allowed_email_domains d
    where lower(split_part(p_email, '@', 2)) = d.domain
       or lower(split_part(p_email, '@', 2)) like '%.' || d.domain
  );
$$;

-- admin?
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and tipo_usuario = 'admin'
  );
$$;

-- HOOK: before user created — bloqueia cadastro fora dos domínios (backend)
create or replace function public.before_user_created(event jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  em text := lower(coalesce(event->'user'->>'email', ''));
begin
  if em = '' or not public.is_school_email(em) then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Cadastro permitido apenas com e-mail escolar (ex.: .edu, .edu.br, .escola.br, .aluno.br).'
      )
    );
  end if;
  return '{}'::jsonb;
end;
$$;

revoke execute on function public.before_user_created(jsonb) from public, anon, authenticated;
grant execute on function public.before_user_created(jsonb) to supabase_auth_admin;
grant usage on schema public to supabase_auth_admin;

-- cria perfil + stats automaticamente após cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email, escola)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data->>'nome', ''), 120),
    new.email,
    left(coalesce(new.raw_user_meta_data->>'escola', ''), 120)
  )
  on conflict (id) do nothing;

  insert into public.user_stats (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- RLS
-- ============================================================
alter table public.allowed_email_domains enable row level security;
alter table public.profiles enable row level security;
alter table public.user_stats enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.topic_stats enable row level security;

-- domínios: leitura pública (UX de cadastro), escrita só admin
drop policy if exists "domains_select" on public.allowed_email_domains;
create policy "domains_select" on public.allowed_email_domains
  for select using (true);

drop policy if exists "domains_insert_admin" on public.allowed_email_domains;
create policy "domains_insert_admin" on public.allowed_email_domains
  for insert with check (public.is_admin());

drop policy if exists "domains_delete_admin" on public.allowed_email_domains;
create policy "domains_delete_admin" on public.allowed_email_domains
  for delete using (public.is_admin());

-- perfis: cada um vê/edita o seu (admin vê todos)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- impede escalada de privilégio: usuário só edita nome/escola
revoke update on public.profiles from anon, authenticated;
grant update (nome, escola) on public.profiles to authenticated;

-- stats/progresso: apenas o dono
drop policy if exists "stats_own" on public.user_stats;
create policy "stats_own" on public.user_stats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "lesson_own" on public.lesson_progress;
create policy "lesson_own" on public.lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "topics_own" on public.topic_stats;
create policy "topics_own" on public.topic_stats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
