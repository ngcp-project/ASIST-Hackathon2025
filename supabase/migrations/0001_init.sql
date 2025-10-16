-- 0001_init.sql
-- Combined migration for ASIST portal: extensions, enums, tables, helpers, RLS, policies, triggers

-- === extensions ===
create extension if not exists pgcrypto;

-- === ENUMS ===================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('MEMBER','STUDENT','STAFF','ADMIN');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'duration_type') then
    create type duration_type as enum ('GENERIC','SPECIFIC');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'visibility') then
    create type visibility as enum ('PUBLIC','MEMBERS_ONLY','STUDENTS_ONLY','INTERNAL');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'reg_status') then
    create type reg_status as enum ('PENDING','REGISTERED','WAITLISTED','CANCELED');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'txn_status') then
    create type txn_status as enum ('ACTIVE','EXPIRED','CANCELED');
  end if;
end $$;

-- === USERS ===================================================
create table if not exists public.users (
  id uuid primary key,
  email text unique not null,
  first_name text,
  last_name text,
  is_active boolean default true,
  role user_role default 'MEMBER',
  affiliation text,
  created_at timestamptz default now()
);

-- === PROGRAMS ================================================
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  capacity int check (capacity >= 0) default 0,
  start_at timestamptz,
  end_at timestamptz,
  visibility visibility default 'PUBLIC',
  publish_at timestamptz,
  unpublish_at timestamptz,
  waiver_url text,
  price_public int default 0,
  price_student int,
  price_member int,
  created_at timestamptz default now()
);

-- === REGISTRATIONS ===========================================
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  user_id uuid not null,
  status reg_status default 'PENDING',
  waitlist_position int,
  price_paid int,
  answers jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  canceled_at timestamptz
);

create unique index if not exists registrations_program_user_idx on public.registrations (program_id, user_id)
  where status <> 'CANCELED';

-- === CHECKINS ================================================
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  staff_user_id uuid not null,
  created_at timestamptz default now()
);

-- === MEMBERSHIP PLANS ========================================
create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration duration_type not null default 'GENERIC',
  duration_months int,
  start_date date,
  end_date date,
  sale_start timestamptz,
  sale_end timestamptz,
  active boolean default true,
  created_at timestamptz default now()
);

-- === TRANSACTIONS ============================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plan_id uuid references public.membership_plans(id) on delete set null,
  price int,
  purchased_at timestamptz default now(),
  start_date date,
  end_date date,
  status txn_status default 'ACTIVE'
);

-- === USER NOTES ==============================================
create table if not exists public.user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  author_id uuid not null,
  body text not null,
  created_at timestamptz default now()
);

-- === helper: auth_is_staff ==================================
-- Returns true when the current authenticated user has role STAFF or ADMIN in public.users
create or replace function public.auth_is_staff()
returns boolean
language sql
security definer
as $$
  select exists(
    select 1 from public.users u
    where u.id = auth.uid() and u.role in ('STAFF','ADMIN')
  );
$$;

-- === Enable RLS ==============================================
alter table public.users enable row level security;
alter table public.programs enable row level security;
alter table public.registrations enable row level security;
alter table public.transactions enable row level security;
alter table public.user_notes enable row level security;
alter table public.checkins enable row level security;

-- === POLICIES ================================================
-- USERS
drop policy if exists users_self_select on public.users;
create policy users_self_select
on public.users for select
to authenticated
using (id = auth.uid());

drop policy if exists users_self_update on public.users;
create policy users_self_update
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists users_staff_all on public.users;
create policy users_staff_all
on public.users for all
to authenticated
using (public.auth_is_staff())
with check (public.auth_is_staff());

-- PROGRAMS
drop policy if exists programs_public_read on public.programs;
create policy programs_public_read
on public.programs for select
to anon, authenticated
using (
  visibility = 'PUBLIC'
  and (publish_at is null or publish_at <= now())
  and (unpublish_at is null or unpublish_at > now())
);

drop policy if exists programs_members_read on public.programs;
create policy programs_members_read
on public.programs for select
to authenticated
using (
  visibility = 'MEMBERS_ONLY'
  and exists (
    select 1 from public.transactions t
    where t.user_id = auth.uid()
      and t.status = 'ACTIVE'
      and current_date between t.start_date and t.end_date
  )
);

drop policy if exists programs_students_read on public.programs;
create policy programs_students_read
on public.programs for select
to authenticated
using (
  visibility = 'STUDENTS_ONLY'
  and exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and (u.affiliation ilike '%student%' or u.email like '%.edu')
  )
);

drop policy if exists programs_staff_all on public.programs;
create policy programs_staff_all
on public.programs for all
to authenticated
using (public.auth_is_staff())
with check (public.auth_is_staff());

-- REGISTRATIONS
drop policy if exists regs_self_select on public.registrations;
create policy regs_self_select
on public.registrations for select
to authenticated
using (user_id = auth.uid());

drop policy if exists regs_self_insert on public.registrations;
create policy regs_self_insert
on public.registrations for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists regs_self_update on public.registrations;
create policy regs_self_update
on public.registrations for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- TRANSACTIONS
drop policy if exists txn_self_select on public.transactions;
create policy txn_self_select
on public.transactions for select
to authenticated
using (user_id = auth.uid());

drop policy if exists txn_self_insert on public.transactions;
create policy txn_self_insert
on public.transactions for insert
to authenticated
with check (user_id = auth.uid());

-- CHECKINS
drop policy if exists checkins_staff on public.checkins;
create policy checkins_staff
on public.checkins for all
to authenticated
using (public.auth_is_staff())
with check (public.auth_is_staff());

-- === TRIGGERS ================================================
-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, is_active)
  values (new.id, new.email, true)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Set membership dates from plan
create or replace function public.set_membership_dates()
returns trigger
language plpgsql
as $$
declare
  p record;
begin
  if new.plan_id is null then
    return new;
  end if;

  select * into p from public.membership_plans where id = new.plan_id;

  if p.duration = 'GENERIC' then
    if new.start_date is null then
      new.start_date := current_date;
    end if;
    if p.duration_months is null or p.duration_months <= 0 then
      raise exception 'GENERIC plan requires duration_months > 0';
    end if;
    new.end_date := (new.start_date + (p.duration_months || ' months')::interval)::date;
  else
    if p.start_date is null or p.end_date is null then
      raise exception 'SPECIFIC plan requires start_date and end_date';
    end if;
    new.start_date := p.start_date;
    new.end_date := p.end_date;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_set_membership_dates on public.transactions;
create trigger trg_set_membership_dates
before insert on public.transactions
for each row
execute function public.set_membership_dates();

-- Promote waitlist when someone cancels
create or replace function public.promote_waitlist()
returns trigger
language plpgsql
security definer
as $$
declare
  v_next uuid;
begin
  if (old.status <> 'CANCELED') and (new.status = 'CANCELED') then
    select id into v_next
    from public.registrations
    where program_id = new.program_id
      and status = 'WAITLISTED'
    order by waitlist_position asc
    limit 1
    for update skip locked;

    if v_next is not null then
      update public.registrations
         set status = 'REGISTERED', waitlist_position = null
       where id = v_next;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_promote_waitlist on public.registrations;
create trigger trg_promote_waitlist
after update on public.registrations
for each row
when (old.status is distinct from new.status)
execute function public.promote_waitlist();

-- End of migration
