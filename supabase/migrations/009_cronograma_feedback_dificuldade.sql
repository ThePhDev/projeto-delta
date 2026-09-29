-- ============================================================
-- 009 — Ideias do seminário 2026.2: cronograma personalizável,
--        feedback dos estudantes (pesquisa-ação) e dificuldade estimada
-- ============================================================

-- cronograma e diagnóstico do aluno (guardados no próprio perfil)
alter table public.profiles add column if not exists cronograma jsonb not null default '{}'::jsonb;
do $$ begin
  alter table public.profiles add constraint profiles_cronograma_small check (pg_column_size(cronograma) < 4096);
exception when duplicate_object then null; end $$;
grant update (cronograma) on public.profiles to authenticated;

-- feedback dos estudantes: cada um envia e vê só o seu; administração vê tudo
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nota smallint not null check (nota between 1 and 5),
  categorias text[] not null default '{}' check (cardinality(categorias) <= 6),
  texto text check (texto is null or char_length(texto) <= 1000),
  pagina text check (pagina is null or char_length(pagina) <= 60),
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
drop policy if exists "feedback_insert_own" on public.feedback;
create policy "feedback_insert_own" on public.feedback for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "feedback_select" on public.feedback;
create policy "feedback_select" on public.feedback for select to authenticated using (auth.uid() = user_id or public.is_admin());
revoke update, delete on public.feedback from anon, authenticated;
revoke all on public.feedback from anon;

-- dificuldade estimada das questões oficiais de Matemática
-- (tamanho do enunciado e das alternativas, imagem, tabela e fórmula; dividida em terços)
with sc as (
  select q.id,
    char_length(q.statement) / 100.0
    + coalesce((select avg(char_length(a.content)) from public.question_alternatives a where a.question_id = q.id), 0) / 40.0
    + case when q.has_image then 2 else 0 end + case when q.has_table then 1.5 else 0 end + case when q.has_formula then 1 else 0 end as s
  from public.questions q where q.primary_subject = 'Matemática' and q.publication_status = 'published'
), t as (select id, ntile(3) over (order by s) as n from sc)
update public.questions q set difficulty = case t.n when 1 then 'facil' when 2 then 'media' else 'dificil' end
from t where q.id = t.id and q.difficulty is null;
