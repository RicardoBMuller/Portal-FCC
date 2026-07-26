-- ============================================================
-- PORTAL FCC V13
-- Estrutura: PROJETO -> PERÍODO (MANHÃ/TARDE) -> SALA -> CARTÃO
-- Projeto Supabase sugerido: calculadora-fcc
-- ============================================================
--
-- Este script usa novas tabelas com prefixo fcc_ para NÃO apagar
-- nem alterar as tabelas da versão anterior.
--
-- Execute TODO este arquivo em:
-- Supabase > SQL Editor > New query > Run
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. PROJETOS
-- Os períodos não precisam de tabela própria porque são regra fixa:
-- todo projeto possui MANHÃ e TARDE.
-- ------------------------------------------------------------
create table if not exists public.fcc_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fcc_projects_name_len check (char_length(trim(name)) between 2 and 120),
  constraint fcc_projects_slug_len check (char_length(trim(slug)) between 1 and 120)
);

-- ------------------------------------------------------------
-- 2. SALAS
-- Uma sala pertence a UM projeto e UM dos períodos fixos.
-- A mesma sala pode existir na Manhã e na Tarde.
-- ------------------------------------------------------------
create table if not exists public.fcc_rooms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.fcc_projects(id) on delete cascade,
  period text not null,
  room_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fcc_rooms_period_check check (period in ('manha', 'tarde')),
  constraint fcc_rooms_code_len check (char_length(trim(room_code)) between 1 and 40),
  constraint fcc_rooms_unique_context unique (project_id, period, room_code)
);

-- ------------------------------------------------------------
-- 2.1 MIGRAÇÃO DA V12 ANTERIOR (TARDE/NOITE)
-- Se você já executou a versão anterior, este bloco converte
-- automaticamente registros de "noite" para "manha" e troca
-- a regra do campo period para MANHÃ/TARDE.
-- É seguro executar também em instalação nova.
-- ------------------------------------------------------------
alter table public.fcc_rooms drop constraint if exists fcc_rooms_period_check;

update public.fcc_rooms
set period = 'manha'
where period = 'noite';

alter table public.fcc_rooms
  add constraint fcc_rooms_period_check
  check (period in ('manha', 'tarde'));

-- ------------------------------------------------------------
-- 3. CARTÕES / REGISTROS
-- O campo "Término" lido do papel NÃO é usado.
-- O encerramento é sempre calculado pelo site:
-- início + duração.
-- ------------------------------------------------------------
create table if not exists public.fcc_exam_cards (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.fcc_rooms(id) on delete cascade,
  modules text not null,
  start_time time not null,
  duration_minutes integer not null,
  end_time time not null,
  end_next_day boolean not null default false,
  minimum_stay_minutes integer not null,
  minimum_exit_time time not null,
  minimum_exit_next_day boolean not null default false,
  source text not null default 'ocr_space',
  captured_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fcc_exam_cards_modules_len check (char_length(trim(modules)) between 1 and 120),
  constraint fcc_exam_cards_duration_check check (duration_minutes between 1 and 720),
  constraint fcc_exam_cards_minimum_check check (minimum_stay_minutes between 1 and 720),
  constraint fcc_exam_cards_source_check check (source in ('ocr_space', 'manual')),
  constraint fcc_exam_cards_unique_entry unique (room_id, modules, start_time)
);

-- ------------------------------------------------------------
-- 4. updated_at automático
-- ------------------------------------------------------------
create or replace function public.fcc_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_fcc_projects_updated_at on public.fcc_projects;
create trigger trg_fcc_projects_updated_at
before update on public.fcc_projects
for each row execute function public.fcc_set_updated_at();

drop trigger if exists trg_fcc_rooms_updated_at on public.fcc_rooms;
create trigger trg_fcc_rooms_updated_at
before update on public.fcc_rooms
for each row execute function public.fcc_set_updated_at();

drop trigger if exists trg_fcc_exam_cards_updated_at on public.fcc_exam_cards;
create trigger trg_fcc_exam_cards_updated_at
before update on public.fcc_exam_cards
for each row execute function public.fcc_set_updated_at();

-- ------------------------------------------------------------
-- 5. ÍNDICES
-- ------------------------------------------------------------
create index if not exists idx_fcc_rooms_project_period
  on public.fcc_rooms(project_id, period);

create index if not exists idx_fcc_exam_cards_room
  on public.fcc_exam_cards(room_id);

create index if not exists idx_fcc_exam_cards_captured_at
  on public.fcc_exam_cards(captured_at desc);

-- ------------------------------------------------------------
-- 6. RLS
-- Esta versão não possui login. O frontend do GitHub Pages usa
-- a Publishable Key e opera como anon.
-- ------------------------------------------------------------
alter table public.fcc_projects enable row level security;
alter table public.fcc_rooms enable row level security;
alter table public.fcc_exam_cards enable row level security;

drop policy if exists "fcc_projects_select" on public.fcc_projects;
drop policy if exists "fcc_projects_insert" on public.fcc_projects;
drop policy if exists "fcc_projects_update" on public.fcc_projects;

drop policy if exists "fcc_rooms_select" on public.fcc_rooms;
drop policy if exists "fcc_rooms_insert" on public.fcc_rooms;
drop policy if exists "fcc_rooms_update" on public.fcc_rooms;

drop policy if exists "fcc_exam_cards_select" on public.fcc_exam_cards;
drop policy if exists "fcc_exam_cards_insert" on public.fcc_exam_cards;
drop policy if exists "fcc_exam_cards_update" on public.fcc_exam_cards;

create policy "fcc_projects_select"
on public.fcc_projects for select
to anon, authenticated
using (true);

create policy "fcc_projects_insert"
on public.fcc_projects for insert
to anon, authenticated
with check (
  char_length(trim(name)) between 2 and 120
  and char_length(trim(slug)) between 1 and 120
);

create policy "fcc_projects_update"
on public.fcc_projects for update
to anon, authenticated
using (true)
with check (
  char_length(trim(name)) between 2 and 120
  and char_length(trim(slug)) between 1 and 120
);

create policy "fcc_rooms_select"
on public.fcc_rooms for select
to anon, authenticated
using (true);

create policy "fcc_rooms_insert"
on public.fcc_rooms for insert
to anon, authenticated
with check (
  period in ('manha', 'tarde')
  and char_length(trim(room_code)) between 1 and 40
);

create policy "fcc_rooms_update"
on public.fcc_rooms for update
to anon, authenticated
using (true)
with check (
  period in ('manha', 'tarde')
  and char_length(trim(room_code)) between 1 and 40
);

create policy "fcc_exam_cards_select"
on public.fcc_exam_cards for select
to anon, authenticated
using (true);

create policy "fcc_exam_cards_insert"
on public.fcc_exam_cards for insert
to anon, authenticated
with check (
  char_length(trim(modules)) between 1 and 120
  and duration_minutes between 1 and 720
  and minimum_stay_minutes between 1 and 720
);

create policy "fcc_exam_cards_update"
on public.fcc_exam_cards for update
to anon, authenticated
using (true)
with check (
  char_length(trim(modules)) between 1 and 120
  and duration_minutes between 1 and 720
  and minimum_stay_minutes between 1 and 720
);

-- ------------------------------------------------------------
-- 7. GRANTS PARA A DATA API
-- ------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update on table public.fcc_projects to anon, authenticated;
grant select, insert, update on table public.fcc_rooms to anon, authenticated;
grant select, insert, update on table public.fcc_exam_cards to anon, authenticated;

revoke delete on table public.fcc_projects from anon, authenticated;
revoke delete on table public.fcc_rooms from anon, authenticated;
revoke delete on table public.fcc_exam_cards from anon, authenticated;

notify pgrst, 'reload schema';

-- ------------------------------------------------------------
-- 8. TESTES OPCIONAIS
-- ------------------------------------------------------------
-- select * from public.fcc_projects order by created_at desc;
-- select * from public.fcc_rooms order by created_at desc;
-- select * from public.fcc_exam_cards order by captured_at desc;
