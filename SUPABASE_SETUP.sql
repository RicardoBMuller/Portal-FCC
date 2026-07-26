-- ============================================================
-- PORTAL FCC - Tabelas para concursos, períodos, salas e cartões
-- Projeto alvo sugerido: calculadora-fcc
-- ============================================================
--
-- Execute TODO este arquivo no Supabase:
-- Dashboard > SQL Editor > New query > Run
--
-- O site é público (GitHub Pages) e não usa login nesta versão.
-- Por isso, as policies abaixo permitem SELECT / INSERT / UPDATE
-- para o papel anon. Não há permissão de DELETE.
--
-- Se futuramente você adicionar autenticação, revise essas policies.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. CONCURSOS
-- ------------------------------------------------------------
create table if not exists public.contests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contests_name_len check (char_length(trim(name)) between 2 and 120),
  constraint contests_slug_len check (char_length(trim(slug)) between 1 and 120)
);

-- ------------------------------------------------------------
-- 2. SALAS
-- Cada sala pertence a um concurso + período.
-- A combinação concurso/período/sala é única.
-- ------------------------------------------------------------
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  period text not null,
  room_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_period_check check (period in ('manha', 'tarde')),
  constraint rooms_code_len check (char_length(trim(room_code)) between 1 and 40),
  constraint rooms_unique_context unique (contest_id, period, room_code)
);

-- ------------------------------------------------------------
-- 3. CARTÕES / REGISTROS DE PROVA
-- IMPORTANTE: o término é o resultado calculado pelo site a partir de
-- início + duração. O valor manuscrito/impresso em "Término" no cartão
-- não é utilizado nem armazenado.
-- ------------------------------------------------------------
create table if not exists public.exam_cards (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
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
  constraint exam_cards_modules_len check (char_length(trim(modules)) between 1 and 120),
  constraint exam_cards_duration_check check (duration_minutes between 1 and 720),
  constraint exam_cards_minimum_check check (minimum_stay_minutes between 1 and 720),
  constraint exam_cards_source_check check (source in ('ocr_space', 'manual')),
  constraint exam_cards_unique_entry unique (room_id, modules, start_time)
);

-- ------------------------------------------------------------
-- 4. updated_at automático
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_contests_updated_at on public.contests;
create trigger trg_contests_updated_at
before update on public.contests
for each row execute function public.set_updated_at();

drop trigger if exists trg_rooms_updated_at on public.rooms;
create trigger trg_rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

drop trigger if exists trg_exam_cards_updated_at on public.exam_cards;
create trigger trg_exam_cards_updated_at
before update on public.exam_cards
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 5. ÍNDICES
-- ------------------------------------------------------------
create index if not exists idx_rooms_contest_period
  on public.rooms(contest_id, period);

create index if not exists idx_exam_cards_room
  on public.exam_cards(room_id);

create index if not exists idx_exam_cards_captured_at
  on public.exam_cards(captured_at desc);

-- ------------------------------------------------------------
-- 6. RLS
-- ------------------------------------------------------------
alter table public.contests enable row level security;
alter table public.rooms enable row level security;
alter table public.exam_cards enable row level security;

-- Remove policies antigas com estes nomes para o script poder ser reexecutado.
drop policy if exists "fcc_contests_select" on public.contests;
drop policy if exists "fcc_contests_insert" on public.contests;
drop policy if exists "fcc_contests_update" on public.contests;

drop policy if exists "fcc_rooms_select" on public.rooms;
drop policy if exists "fcc_rooms_insert" on public.rooms;
drop policy if exists "fcc_rooms_update" on public.rooms;

drop policy if exists "fcc_exam_cards_select" on public.exam_cards;
drop policy if exists "fcc_exam_cards_insert" on public.exam_cards;
drop policy if exists "fcc_exam_cards_update" on public.exam_cards;

create policy "fcc_contests_select"
on public.contests for select
to anon, authenticated
using (true);

create policy "fcc_contests_insert"
on public.contests for insert
to anon, authenticated
with check (
  char_length(trim(name)) between 2 and 120
  and char_length(trim(slug)) between 1 and 120
);

create policy "fcc_contests_update"
on public.contests for update
to anon, authenticated
using (true)
with check (
  char_length(trim(name)) between 2 and 120
  and char_length(trim(slug)) between 1 and 120
);

create policy "fcc_rooms_select"
on public.rooms for select
to anon, authenticated
using (true);

create policy "fcc_rooms_insert"
on public.rooms for insert
to anon, authenticated
with check (
  period in ('manha', 'tarde')
  and char_length(trim(room_code)) between 1 and 40
);

create policy "fcc_rooms_update"
on public.rooms for update
to anon, authenticated
using (true)
with check (
  period in ('manha', 'tarde')
  and char_length(trim(room_code)) between 1 and 40
);

create policy "fcc_exam_cards_select"
on public.exam_cards for select
to anon, authenticated
using (true);

create policy "fcc_exam_cards_insert"
on public.exam_cards for insert
to anon, authenticated
with check (
  char_length(trim(modules)) between 1 and 120
  and duration_minutes between 1 and 720
  and minimum_stay_minutes between 1 and 720
);

create policy "fcc_exam_cards_update"
on public.exam_cards for update
to anon, authenticated
using (true)
with check (
  char_length(trim(modules)) between 1 and 120
  and duration_minutes between 1 and 720
  and minimum_stay_minutes between 1 and 720
);

-- ------------------------------------------------------------
-- 7. GRANTS PARA DATA API
-- ------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update on table public.contests to anon, authenticated;
grant select, insert, update on table public.rooms to anon, authenticated;
grant select, insert, update on table public.exam_cards to anon, authenticated;

-- Sem DELETE nesta versão.
revoke delete on table public.contests from anon, authenticated;
revoke delete on table public.rooms from anon, authenticated;
revoke delete on table public.exam_cards from anon, authenticated;

-- Recarrega o schema do PostgREST/Data API.
notify pgrst, 'reload schema';

-- ------------------------------------------------------------
-- 8. TESTES OPCIONAIS
-- ------------------------------------------------------------
-- Execute depois do script para verificar se as tabelas existem:
-- select * from public.contests order by created_at desc;
-- select * from public.rooms order by created_at desc;
-- select * from public.exam_cards order by captured_at desc;
