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
-- Hall of Fame Migration
-- Crear tablas para el sistema de Hall of Fame

-- Tabla de caballos
CREATE TABLE IF NOT EXISTS public.horses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creator TEXT,
  genealogy TEXT,
  additional_notes TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de galería de medios para caballos
CREATE TABLE IF NOT EXISTS public.horse_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id UUID NOT NULL REFERENCES public.horses(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  title TEXT,
  description TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de comentarios para elementos de la galería
CREATE TABLE IF NOT EXISTS public.gallery_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES public.horse_gallery(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.gallery_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de likes para elementos de galería
CREATE TABLE IF NOT EXISTS public.gallery_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES public.horse_gallery(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gallery_id, user_id)
);

-- Tabla de likes para comentarios
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.gallery_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_horses_featured ON public.horses(featured);
CREATE INDEX IF NOT EXISTS idx_horses_created_at ON public.horses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_horse_gallery_horse_id ON public.horse_gallery(horse_id);
CREATE INDEX IF NOT EXISTS idx_horse_gallery_created_at ON public.horse_gallery(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_gallery_id ON public.gallery_comments(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_parent_id ON public.gallery_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_created_at ON public.gallery_comments(created_at DESC);

-- Función para actualizar el contador de likes en galería
CREATE OR REPLACE FUNCTION update_gallery_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.horse_gallery 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.gallery_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.horse_gallery 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.gallery_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar el contador de likes en comentarios
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.gallery_comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.gallery_comments 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para mantener contadores actualizados
DROP TRIGGER IF EXISTS gallery_likes_count_trigger ON public.gallery_likes;
CREATE TRIGGER gallery_likes_count_trigger
  AFTER INSERT OR DELETE ON public.gallery_likes
  FOR EACH ROW EXECUTE FUNCTION update_gallery_likes_count();

DROP TRIGGER IF EXISTS comment_likes_count_trigger ON public.comment_likes;
CREATE TRIGGER comment_likes_count_trigger
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS horses_updated_at_trigger ON public.horses;
CREATE TRIGGER horses_updated_at_trigger
  BEFORE UPDATE ON public.horses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS gallery_comments_updated_at_trigger ON public.gallery_comments;
CREATE TRIGGER gallery_comments_updated_at_trigger
  BEFORE UPDATE ON public.gallery_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS en todas las tablas
ALTER TABLE public.horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horse_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para horses
CREATE POLICY "horses_read_all" ON public.horses FOR SELECT USING (true);
CREATE POLICY "horses_insert_admin" ON public.horses FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "horses_update_admin" ON public.horses FOR UPDATE USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "horses_delete_admin" ON public.horses FOR DELETE USING (is_admin(auth.uid()));

-- Políticas RLS para horse_gallery
CREATE POLICY "horse_gallery_read_all" ON public.horse_gallery FOR SELECT USING (true);
CREATE POLICY "horse_gallery_insert_admin" ON public.horse_gallery FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "horse_gallery_update_admin" ON public.horse_gallery FOR UPDATE USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "horse_gallery_delete_admin" ON public.horse_gallery FOR DELETE USING (is_admin(auth.uid()));

-- Políticas RLS para gallery_comments
CREATE POLICY "gallery_comments_read_all" ON public.gallery_comments FOR SELECT USING (true);
CREATE POLICY "gallery_comments_insert_auth" ON public.gallery_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "gallery_comments_update_own_or_admin" ON public.gallery_comments FOR UPDATE USING (user_id = auth.uid() OR is_admin(auth.uid())) WITH CHECK (user_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "gallery_comments_delete_own_or_admin" ON public.gallery_comments FOR DELETE USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- Políticas RLS para gallery_likes
CREATE POLICY "gallery_likes_read_all" ON public.gallery_likes FOR SELECT USING (true);
CREATE POLICY "gallery_likes_insert_auth" ON public.gallery_likes FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());
CREATE POLICY "gallery_likes_delete_own" ON public.gallery_likes FOR DELETE USING (user_id = auth.uid());

-- Políticas RLS para comment_likes
CREATE POLICY "comment_likes_read_all" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "comment_likes_insert_auth" ON public.comment_likes FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());
CREATE POLICY "comment_likes_delete_own" ON public.comment_likes FOR DELETE USING (user_id = auth.uid());

-- Datos de ejemplo para desarrollo
INSERT INTO public.horses (name, creator, genealogy, additional_notes, featured) VALUES 
('Relámpago de Oro', 'Hacienda El Dorado', 'Hijo de Trueno Real x Estrella Dorada', 'Campeón nacional de paso fino 2023. Ejemplar excepcional con gran temperamento y elegancia en su andar.', true),
('Majestuoso', 'Criadero Los Andes', 'Descendiente de Emperador x Bella Vista', 'Reconocido por su perfecta conformación y suavidad en el paso. Múltiples premios en competencias regionales.', true),
('Diamante Negro', 'Finca La Esperanza', 'Linaje de Carbón Real x Perla Negra', 'Ejemplar de gran alzada y presencia. Destacado reproductor con excelente descendencia.', false)
ON CONFLICT DO NOTHING;
