
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

-- ============================================================================
-- MARKETPLACE TABLES
-- ============================================================================

-- Create marketplace categories table
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'Package',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace ads table
CREATE TABLE IF NOT EXISTS public.marketplace_ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    location VARCHAR(200) NOT NULL,
    category_id UUID NOT NULL REFERENCES public.marketplace_categories(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    contact_whatsapp VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'paused', 'expired')),
    is_featured BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ad images table
CREATE TABLE IF NOT EXISTS public.ad_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ad_id UUID NOT NULL REFERENCES public.marketplace_ads(id) ON DELETE CASCADE,
    storage_path VARCHAR(500) NOT NULL,
    public_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ad comments table
CREATE TABLE IF NOT EXISTS public.ad_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    ad_id UUID NOT NULL REFERENCES public.marketplace_ads(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ad favorites table
CREATE TABLE IF NOT EXISTS public.ad_favorites (
    id SERIAL PRIMARY KEY,
    ad_id UUID NOT NULL REFERENCES public.marketplace_ads(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- GAMIFICATION TABLES
-- ============================================================================

-- Create user stats table
CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id UUID PRIMARY KEY,
    total_posts INTEGER DEFAULT 0,
    total_replies INTEGER DEFAULT 0,
    total_likes_received INTEGER DEFAULT 0,
    total_likes_given INTEGER DEFAULT 0,
    total_horses_submitted INTEGER DEFAULT 0,
    total_ads_published INTEGER DEFAULT 0,
    total_media_uploaded INTEGER DEFAULT 0,
    reputation_score DECIMAL(10,2) DEFAULT 0,
    level INTEGER DEFAULT 1,
    rank VARCHAR(50) DEFAULT 'Novato',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    badge_type VARCHAR(50) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'comment', 'reply', 'badge', 'ad_contact', 'follow')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Marketplace indexes
CREATE UNIQUE INDEX IF NOT EXISTS marketplace_categories_slug_idx ON public.marketplace_categories(slug);
CREATE UNIQUE INDEX IF NOT EXISTS marketplace_ads_category_slug_idx ON public.marketplace_ads(category_id, slug);
CREATE UNIQUE INDEX IF NOT EXISTS ad_favorites_user_ad_idx ON public.ad_favorites(created_by, ad_id);
CREATE UNIQUE INDEX IF NOT EXISTS ad_primary_image_idx ON public.ad_images(ad_id) WHERE is_primary = TRUE;

-- Performance indexes
CREATE INDEX IF NOT EXISTS marketplace_ads_category_created_idx ON public.marketplace_ads(category_id, created_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS marketplace_ads_price_idx ON public.marketplace_ads(price) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS marketplace_ads_location_idx ON public.marketplace_ads(location) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS ad_images_ad_order_idx ON public.ad_images(ad_id, order_index);

-- Gamification indexes
CREATE INDEX IF NOT EXISTS user_stats_reputation_idx ON public.user_stats(reputation_score DESC);
CREATE INDEX IF NOT EXISTS user_stats_level_idx ON public.user_stats(level DESC);
CREATE INDEX IF NOT EXISTS user_badges_user_earned_idx ON public.user_badges(user_id, earned_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON public.notifications(user_id, read_at) WHERE read_at IS NULL;

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert marketplace categories
INSERT INTO public.marketplace_categories (slug, name, description, icon, order_index) VALUES
    ('caballos', 'Caballos', 'Compra y venta de ejemplares equinos', 'Horse', 1),
    ('equipos-y-accesorios', 'Equipos y accesorios', 'Monturas, frenos, mantas y todo tipo de equipamiento', 'Package', 2),
    ('servicios', 'Servicios', 'Veterinarios, herradores, entrenadores y otros servicios', 'Users', 3),
    ('transporte', 'Transporte', 'Remolques, camiones y servicios de transporte equino', 'Truck', 4),
    ('inmuebles-ecuestres', 'Inmuebles ecuestres', 'Fincas, establos, arenas y propiedades con instalaciones', 'Home', 5),
    ('otros', 'Otros', 'Todo lo relacionado con el mundo ecuestre', 'MoreHorizontal', 6)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    order_index = EXCLUDED.order_index;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Marketplace policies
CREATE POLICY "marketplace_categories_select" ON public.marketplace_categories FOR SELECT USING (is_active = TRUE);

CREATE POLICY "marketplace_ads_select" ON public.marketplace_ads FOR SELECT USING (status IN ('active', 'sold') OR created_by = auth.uid());
CREATE POLICY "marketplace_ads_insert" ON public.marketplace_ads FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "marketplace_ads_update" ON public.marketplace_ads FOR UPDATE USING (auth.uid() = created_by OR auth.email() = 'admin@hablandodecaballos.com');

CREATE POLICY "ad_images_select" ON public.ad_images FOR SELECT USING (TRUE);
CREATE POLICY "ad_images_insert" ON public.ad_images FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.marketplace_ads WHERE id = ad_id AND created_by = auth.uid())
);
CREATE POLICY "ad_images_update" ON public.ad_images FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.marketplace_ads WHERE id = ad_id AND created_by = auth.uid())
);
CREATE POLICY "ad_images_delete" ON public.ad_images FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.marketplace_ads WHERE id = ad_id AND created_by = auth.uid())
);

CREATE POLICY "ad_comments_select" ON public.ad_comments FOR SELECT USING (is_deleted = FALSE);
CREATE POLICY "ad_comments_insert" ON public.ad_comments FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "ad_comments_update" ON public.ad_comments FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "ad_favorites_select" ON public.ad_favorites FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "ad_favorites_insert" ON public.ad_favorites FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "ad_favorites_delete" ON public.ad_favorites FOR DELETE USING (auth.uid() = created_by);

-- Gamification policies
CREATE POLICY "user_stats_select" ON public.user_stats FOR SELECT USING (TRUE);
CREATE POLICY "user_stats_insert" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_stats_update" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id OR auth.email() = 'admin@hablandodecaballos.com');

CREATE POLICY "user_badges_select" ON public.user_badges FOR SELECT USING (TRUE);
CREATE POLICY "user_badges_insert" ON public.user_badges FOR INSERT WITH CHECK (auth.email() = 'admin@hablandodecaballos.com');

CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (auth.email() = 'admin@hablandodecaballos.com');
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
