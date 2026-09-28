-- ============================================================
-- Projeto Delta — Migração 002: Banco de Questões oficiais do ENEM
-- Staging → validação → publicação, com constraints, triggers e RLS
-- ============================================================

-- ---------- lotes de importação ----------
create table if not exists public.question_import_batches (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_detail text,
  year int,
  application text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  stats jsonb not null default '{}'::jsonb,
  notes text
);

-- ---------- staging (dados brutos, nunca expostos) ----------
create table if not exists public.staging_questions (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.question_import_batches(id) on delete set null,
  external_id text not null,
  raw jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists staging_questions_ext_idx on public.staging_questions (external_id);

-- ---------- questões (tabela pública canônica) ----------
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  exam text not null default 'ENEM',
  year int not null check (year between 1998 and 2100),
  application text not null default 'regular',
  booklet text,
  original_number int,
  pdf_page int,
  area text,
  primary_subject text check (primary_subject in ('Matemática','Física','Química','Biologia')),
  secondary_subjects text[] not null default '{}',
  topic text,
  subtopic text,
  statement text not null,
  support_text text,
  correct_answer char(1) check (correct_answer in ('A','B','C','D','E')),
  has_image boolean not null default false,
  has_table boolean not null default false,
  has_formula boolean not null default false,
  difficulty text check (difficulty is null or difficulty in ('facil','media','dificil')),
  competency text,
  skill text,
  source_name text not null default 'INEP',
  source_url text,
  answer_key_url text,
  quality_score int check (quality_score between 0 and 100),
  validation_status text not null default 'pending'
    check (validation_status in ('pending','approved','rejected','needs_review','extraction_error')),
  publication_status text not null default 'draft'
    check (publication_status in ('draft','published','hidden','archived')),
  is_annulled boolean not null default false,
  is_duplicate boolean not null default false,
  rejection_reason text,
  review_notes text,
  classification_confidence int check (classification_confidence is null or classification_confidence between 0 and 100),
  statement_hash text,
  batch_id uuid references public.question_import_batches(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists questions_subject_year_idx on public.questions (primary_subject, year);
create index if not exists questions_pub_idx on public.questions (publication_status, validation_status);
create index if not exists questions_topic_idx on public.questions (topic);
create index if not exists questions_hash_idx on public.questions (statement_hash);

-- ---------- alternativas ----------
create table if not exists public.question_alternatives (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  letter char(1) not null check (letter in ('A','B','C','D','E')),
  content text not null,
  is_correct boolean not null default false,
  display_order int not null,
  unique (question_id, letter)
);
create index if not exists question_alternatives_q_idx on public.question_alternatives (question_id);

-- ---------- assets visuais (Storage) ----------
create table if not exists public.question_assets (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  storage_path text not null,
  asset_type text not null default 'image',
  original_page int,
  alt_text text,
  width int,
  height int,
  extraction_status text not null default 'ok'
);
create index if not exists question_assets_q_idx on public.question_assets (question_id);

-- ---------- fontes oficiais ----------
create table if not exists public.question_sources (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  source_name text not null,
  source_url text,
  answer_key_url text,
  notes text
);

-- ---------- auditoria de revisão ----------
create table if not exists public.question_reviews (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions(id) on delete set null,
  external_id text,
  action text not null,
  reason text,
  quality_score int,
  reviewer text not null default 'pipeline',
  created_at timestamptz not null default now()
);

-- ---------- erros de importação ----------
create table if not exists public.question_import_errors (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.question_import_batches(id) on delete set null,
  external_id text,
  error text not null,
  raw jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Triggers de validação
-- ============================================================

-- Regras obrigatórias para publicar
create or replace function public.enforce_publication_rules()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  alt_count int;
  correct_count int;
begin
  new.updated_at = now();
  if new.publication_status = 'published' then
    if new.validation_status <> 'approved' then
      raise exception 'publicação exige validation_status = approved';
    end if;
    if coalesce(new.quality_score, 0) < 85 then
      raise exception 'publicação exige quality_score >= 85';
    end if;
    if new.is_annulled then
      raise exception 'questão anulada não pode ser publicada';
    end if;
    if new.is_duplicate then
      raise exception 'questão duplicada não pode ser publicada';
    end if;
    if new.correct_answer is null then
      raise exception 'publicação exige gabarito confirmado';
    end if;
    if new.primary_subject is null then
      raise exception 'publicação exige matéria definida';
    end if;
    select count(*), count(*) filter (where is_correct)
      into alt_count, correct_count
      from public.question_alternatives where question_id = new.id;
    if alt_count <> 5 then
      raise exception 'publicação exige exatamente 5 alternativas (encontradas: %)', alt_count;
    end if;
    if correct_count <> 1 then
      raise exception 'publicação exige exatamente 1 alternativa correta (encontradas: %)', correct_count;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_questions_publish on public.questions;
create trigger trg_questions_publish
  before insert or update on public.questions
  for each row execute function public.enforce_publication_rules();

-- Apenas uma alternativa correta por questão
create or replace function public.enforce_single_correct()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_correct then
    if exists (
      select 1 from public.question_alternatives
      where question_id = new.question_id and is_correct
        and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) then
      raise exception 'já existe alternativa correta para esta questão';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_alt_single_correct on public.question_alternatives;
create trigger trg_alt_single_correct
  before insert or update on public.question_alternatives
  for each row execute function public.enforce_single_correct();

-- ============================================================
-- RLS — leitura pública somente do que está publicado e aprovado
-- ============================================================
alter table public.questions enable row level security;
alter table public.question_alternatives enable row level security;
alter table public.question_assets enable row level security;
alter table public.question_sources enable row level security;
alter table public.question_reviews enable row level security;
alter table public.staging_questions enable row level security;
alter table public.question_import_batches enable row level security;
alter table public.question_import_errors enable row level security;

drop policy if exists "questoes publicadas sao publicas" on public.questions;
create policy "questoes publicadas sao publicas" on public.questions
  for select using (
    publication_status = 'published'
    and validation_status = 'approved'
    and coalesce(quality_score, 0) >= 85
    and not is_annulled
    and not is_duplicate
  );

drop policy if exists "admin le todas as questoes" on public.questions;
create policy "admin le todas as questoes" on public.questions
  for select using (public.is_admin());

drop policy if exists "alternativas de questoes publicadas" on public.question_alternatives;
create policy "alternativas de questoes publicadas" on public.question_alternatives
  for select using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and q.publication_status = 'published'
        and q.validation_status = 'approved'
    )
  );

drop policy if exists "assets de questoes publicadas" on public.question_assets;
create policy "assets de questoes publicadas" on public.question_assets
  for select using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and q.publication_status = 'published'
        and q.validation_status = 'approved'
    )
  );

drop policy if exists "fontes de questoes publicadas" on public.question_sources;
create policy "fontes de questoes publicadas" on public.question_sources
  for select using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and q.publication_status = 'published'
        and q.validation_status = 'approved'
    )
  );

drop policy if exists "admin le revisoes" on public.question_reviews;
create policy "admin le revisoes" on public.question_reviews
  for select using (public.is_admin());

drop policy if exists "admin le lotes" on public.question_import_batches;
create policy "admin le lotes" on public.question_import_batches
  for select using (public.is_admin());

drop policy if exists "admin le erros" on public.question_import_errors;
create policy "admin le erros" on public.question_import_errors
  for select using (public.is_admin());

-- staging: nenhuma policy → acesso somente via service_role

-- Sem policies de escrita: escrita apenas via service_role (pipeline auditado)
