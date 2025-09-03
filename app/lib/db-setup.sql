
-- Create forum categories table
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'MessageSquare',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum threads table
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL,
    content TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum replies table
CREATE TABLE IF NOT EXISTS public.forum_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.forum_replies(id) ON DELETE SET NULL,
    created_by UUID NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum likes table
CREATE TABLE IF NOT EXISTS public.forum_likes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    thread_id UUID REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT forum_likes_target_check CHECK (
        (thread_id IS NOT NULL AND reply_id IS NULL) OR 
        (thread_id IS NULL AND reply_id IS NOT NULL)
    )
);

-- Create forum favorites table
CREATE TABLE IF NOT EXISTS public.forum_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS forum_categories_slug_idx ON public.forum_categories(slug);
CREATE UNIQUE INDEX IF NOT EXISTS forum_threads_category_slug_idx ON public.forum_threads(category_id, slug) WHERE is_deleted = FALSE;
CREATE UNIQUE INDEX IF NOT EXISTS forum_likes_user_thread_idx ON public.forum_likes(user_id, thread_id) WHERE thread_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS forum_likes_user_reply_idx ON public.forum_likes(user_id, reply_id) WHERE reply_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS forum_favorites_user_thread_idx ON public.forum_favorites(user_id, thread_id);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS forum_threads_category_created_idx ON public.forum_threads(category_id, created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS forum_threads_pinned_updated_idx ON public.forum_threads(is_pinned DESC, updated_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS forum_replies_thread_created_idx ON public.forum_replies(thread_id, created_at) WHERE is_deleted = FALSE;

-- Insert default categories
INSERT INTO public.forum_categories (slug, name, description, icon, order_index) VALUES
    ('razas-y-cria', 'Razas y cría', 'Discusión sobre razas, linajes, cría responsable y genética equina', 'Users', 1),
    ('cuidados-y-salud', 'Cuidados y salud', 'Veterinaria, nutrición, cuidados diarios y bienestar animal', 'Heart', 2),
    ('monta-y-entrenamiento', 'Monta y entrenamiento', 'Técnicas de doma, entrenamiento, disciplinas ecuestres y andares', 'Trophy', 3),
    ('equipamiento-y-transporte', 'Equipamiento y transporte', 'Monturas, frenos, equipos de seguridad y transporte de caballos', 'Truck', 4),
    ('mercado', 'Mercado', 'Compra, venta, intercambio de caballos y equipamiento', 'ShoppingCart', 5),
    ('vida-mas-alla-de-los-caballos', 'Vida más allá de los caballos', 'Charla general, eventos, noticias y todo lo relacionado con el mundo ecuestre', 'Coffee', 6)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    order_index = EXCLUDED.order_index;

-- Insert default andares (if not exists)
INSERT INTO public.andares (slug, name) VALUES
    ('paso-fino', 'Paso Fino'),
    ('trocha', 'Trocha'),
    ('trocha-y-galope', 'Trocha y Galope'),
    ('trote-y-galope', 'Trote y Galope')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Enable RLS on new tables
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_categories
CREATE POLICY "forum_categories_select" ON public.forum_categories FOR SELECT USING (is_active = TRUE);

-- RLS Policies for forum_threads
CREATE POLICY "forum_threads_select" ON public.forum_threads FOR SELECT USING (is_deleted = FALSE);
CREATE POLICY "forum_threads_insert" ON public.forum_threads FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "forum_threads_update" ON public.forum_threads FOR UPDATE USING (auth.uid() = created_by OR auth.email() = 'admin@hablandodecaballos.com');

-- RLS Policies for forum_replies
CREATE POLICY "forum_replies_select" ON public.forum_replies FOR SELECT USING (is_deleted = FALSE);
CREATE POLICY "forum_replies_insert" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "forum_replies_update" ON public.forum_replies FOR UPDATE USING (auth.uid() = created_by OR auth.email() = 'admin@hablandodecaballos.com');

-- RLS Policies for forum_likes
CREATE POLICY "forum_likes_select" ON public.forum_likes FOR SELECT USING (TRUE);
CREATE POLICY "forum_likes_insert" ON public.forum_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_likes_delete" ON public.forum_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for forum_favorites
CREATE POLICY "forum_favorites_select" ON public.forum_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "forum_favorites_insert" ON public.forum_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_favorites_delete" ON public.forum_favorites FOR DELETE USING (auth.uid() = user_id);
