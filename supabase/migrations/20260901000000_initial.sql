-- Personal Todo cloud schema. Run with the Supabase SQL editor or CLI.
create table if not exists public.categories (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  name text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.tasks (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  title text not null check (char_length(title) between 1 and 500),
  deadline date,
  content text check (content is null or char_length(content) <= 20000),
  image_url text check (image_url is null or char_length(image_url) <= 2000),
  status text not null check (status in ('todo', 'doing', 'done')),
  category_id text not null,
  classification text not null default '' check (char_length(classification) <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, category_id) references public.categories(user_id, id) on delete cascade
);

create table if not exists public.notices (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  text text not null check (char_length(text) between 1 and 2000),
  date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists tasks_user_deadline_idx on public.tasks(user_id, deadline);
create index if not exists tasks_user_status_idx on public.tasks(user_id, status);
create index if not exists notices_user_date_idx on public.notices(user_id, date);

alter table public.categories enable row level security;
alter table public.tasks enable row level security;
alter table public.notices enable row level security;

revoke all on public.categories, public.tasks, public.notices from anon;
grant select, insert, update, delete on public.categories, public.tasks, public.notices to authenticated;

drop policy if exists "categories_owner_only" on public.categories;
drop policy if exists "tasks_owner_only" on public.tasks;
drop policy if exists "notices_owner_only" on public.notices;

create policy "categories_owner_only" on public.categories for all to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
create policy "tasks_owner_only" on public.tasks for all to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
create policy "notices_owner_only" on public.notices for all to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
