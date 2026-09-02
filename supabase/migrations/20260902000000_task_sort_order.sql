-- Persist drag-and-drop card order across browsers and devices.
alter table public.tasks
  add column if not exists sort_order integer not null default 0;

create index if not exists tasks_user_sort_order_idx
  on public.tasks(user_id, sort_order);
