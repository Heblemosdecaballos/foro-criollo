create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'usuario' check (role in ('admin','moderador','usuario','anunciante')),
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('aprendizaje','debate','negocios','veterinaria','entrenamiento','noticias')),
  tags text[] default '{}',
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  replies_count int default 0,
  views int default 0,
  hot boolean default false,
  open_today boolean default true,
  last_activity timestamptz default now(),
  status text not null default 'open' check (status in ('open','archived'))
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  email text primary key,
  created_at timestamptz default now()
);

create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  blurb text,
  url text,
  created_at timestamptz default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.threads(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text,
  created_at timestamptz default now()
);

create index if not exists idx_threads_created_at on public.threads(created_at desc);
create index if not exists idx_threads_last_activity on public.threads(last_activity desc);
create index if not exists idx_threads_category on public.threads(category);
create index if not exists idx_threads_tags on public.threads using gin (tags);

create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists(select 1 from public.profiles p where p.id = uid and p.role = 'admin');
$$;

create or replace function public.bump_thread_activity()
returns trigger as $$
begin
  update public.threads set replies_count = replies_count + 1, last_activity = now() where id = new.thread_id;
  return new;
end;$$ language plpgsql;

drop trigger if exists on_post_insert on public.posts;
create trigger on_post_insert
  after insert on public.posts
  for each row execute procedure public.bump_thread_activity();

alter table public.profiles enable row level security;
alter table public.threads enable row level security;
alter table public.posts enable row level security;
alter table public.subscriptions enable row level security;
alter table public.sponsors enable row level security;
alter table public.reports enable row level security;

create policy if not exists "threads_read_all" on public.threads for select using (true);
create policy if not exists "posts_read_all" on public.posts for select using (true);
create policy if not exists "sponsors_read_all" on public.sponsors for select using (true);

create policy if not exists "threads_insert_auth" on public.threads for insert with check (auth.role() = 'authenticated');
create policy if not exists "posts_insert_auth" on public.posts for insert with check (auth.role() = 'authenticated');

create policy if not exists "threads_update_own_or_admin" on public.threads for update using ((select is_admin(auth.uid())) or author_id = auth.uid()) with check ((select is_admin(auth.uid())) or author_id = auth.uid());
create policy if not exists "threads_delete_admin" on public.threads for delete using ((select is_admin(auth.uid())));

create policy if not exists "posts_update_own_or_admin" on public.posts for update using ((select is_admin(auth.uid())) or author_id = auth.uid()) with check ((select is_admin(auth.uid())) or author_id = auth.uid());
create policy if not exists "posts_delete_own_or_admin" on public.posts for delete using ((select is_admin(auth.uid())) or author_id = auth.uid());

create policy if not exists "subs_insert_any" on public.subscriptions for insert with check (true);

create policy if not exists "sponsors_insert_admin" on public.sponsors for insert with check ((select is_admin(auth.uid())));
create policy if not exists "sponsors_update_admin" on public.sponsors for update using ((select is_admin(auth.uid()))) with check ((select is_admin(auth.uid())));

create policy if not exists "reports_insert_auth" on public.reports for insert with check (auth.role() = 'authenticated');

create or replace function public.increment_views(thread_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.threads set views = coalesce(views,0) + 1 where id = thread_id;
end;$$;

insert into public.sponsors (name, blurb, url) values ('Silla & Montura Co.', 'Accesorios premium para tu criollo.', '#') on conflict do nothing;
