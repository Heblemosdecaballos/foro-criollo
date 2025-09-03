
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

-- ============================================================================
-- GALLERY TABLES (PHASE 3)
-- ============================================================================

-- Create media albums table
CREATE TABLE IF NOT EXISTS public.media_albums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    cover_image_id UUID,
    media_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media items table
CREATE TABLE IF NOT EXISTS public.media_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    album_id UUID REFERENCES public.media_albums(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    storage_path VARCHAR(500) NOT NULL,
    public_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(10) CHECK (file_type IN ('image', 'video')),
    file_size INTEGER NOT NULL,
    dimensions VARCHAR(20),
    created_by UUID NOT NULL,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media ratings table
CREATE TABLE IF NOT EXISTS public.media_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    media_id UUID NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media comments table
CREATE TABLE IF NOT EXISTS public.media_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    media_id UUID NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- POLLS TABLES (PHASE 3)
-- ============================================================================

-- Create thread polls table
CREATE TABLE IF NOT EXISTS public.thread_polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    question VARCHAR(200) NOT NULL,
    max_choices INTEGER DEFAULT 1,
    allow_multiple BOOLEAN DEFAULT FALSE,
    allow_change_vote BOOLEAN DEFAULT TRUE,
    show_results_without_vote BOOLEAN DEFAULT TRUE,
    close_date TIMESTAMP WITH TIME ZONE,
    is_closed BOOLEAN DEFAULT FALSE,
    total_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll options table
CREATE TABLE IF NOT EXISTS public.poll_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID NOT NULL REFERENCES public.thread_polls(id) ON DELETE CASCADE,
    option_text VARCHAR(100) NOT NULL,
    vote_count INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0
);

-- Create poll votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID NOT NULL REFERENCES public.thread_polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FAQ TABLES (PHASE 3)
-- ============================================================================

-- Create FAQ categories table
CREATE TABLE IF NOT EXISTS public.faq_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'HelpCircle',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create FAQ items table
CREATE TABLE IF NOT EXISTS public.faq_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES public.faq_categories(id) ON DELETE CASCADE,
    question VARCHAR(300) NOT NULL,
    answer TEXT NOT NULL,
    slug VARCHAR(350) NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0,
    not_helpful_votes INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create FAQ votes table
CREATE TABLE IF NOT EXISTS public.faq_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    faq_id UUID NOT NULL REFERENCES public.faq_items(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PHASE 3 INDEXES
-- ============================================================================

-- Gallery indexes
CREATE UNIQUE INDEX IF NOT EXISTS media_albums_slug_idx ON public.media_albums(slug) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS media_albums_created_by_idx ON public.media_albums(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS media_items_album_created_idx ON public.media_items(album_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS media_ratings_user_media_idx ON public.media_ratings(created_by, media_id);
CREATE INDEX IF NOT EXISTS media_comments_media_created_idx ON public.media_comments(media_id, created_at DESC);

-- Polls indexes
CREATE UNIQUE INDEX IF NOT EXISTS thread_polls_thread_idx ON public.thread_polls(thread_id);
CREATE INDEX IF NOT EXISTS poll_options_poll_order_idx ON public.poll_options(poll_id, order_index);
CREATE UNIQUE INDEX IF NOT EXISTS poll_votes_user_poll_idx ON public.poll_votes(created_by, poll_id);
CREATE INDEX IF NOT EXISTS poll_votes_option_idx ON public.poll_votes(option_id);

-- FAQ indexes
CREATE UNIQUE INDEX IF NOT EXISTS faq_categories_slug_idx ON public.faq_categories(slug);
CREATE UNIQUE INDEX IF NOT EXISTS faq_items_category_slug_idx ON public.faq_items(category_id, slug);
CREATE INDEX IF NOT EXISTS faq_items_featured_idx ON public.faq_items(is_featured, order_index) WHERE is_featured = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS faq_votes_user_faq_idx ON public.faq_votes(created_by, faq_id);

-- ============================================================================
-- PHASE 3 DEFAULT DATA
-- ============================================================================

-- Insert FAQ categories
INSERT INTO public.faq_categories (slug, name, description, icon, order_index) VALUES
    ('primeros-pasos', 'Primeros pasos', 'Todo lo que necesitas saber para comenzar en la comunidad', 'Play', 1),
    ('foros-y-discusiones', 'Foros y discusiones', 'Cómo participar en los foros y crear discusiones', 'MessageSquare', 2),
    ('hall-of-fame', 'Hall of Fame', 'Guía para agregar y gestionar ejemplares', 'Trophy', 3),
    ('marketplace', 'Marketplace', 'Cómo comprar y vender en el mercado ecuestre', 'ShoppingCart', 4),
    ('galeria-multimedia', 'Galería multimedia', 'Subir imágenes, videos y crear álbumes', 'Image', 5),
    ('gamificacion', 'Sistema de puntos', 'Niveles, badges y rankings de la comunidad', 'Award', 6),
    ('cuenta-y-perfil', 'Cuenta y perfil', 'Gestión de tu cuenta y configuración', 'User', 7),
    ('soporte-tecnico', 'Soporte técnico', 'Problemas técnicos y soluciones', 'Settings', 8)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    order_index = EXCLUDED.order_index;

-- ============================================================================
-- PHASE 3 ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.media_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_votes ENABLE ROW LEVEL SECURITY;

-- Gallery policies
CREATE POLICY "media_albums_select" ON public.media_albums FOR SELECT USING (is_public = TRUE OR created_by = auth.uid());
CREATE POLICY "media_albums_insert" ON public.media_albums FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "media_albums_update" ON public.media_albums FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "media_albums_delete" ON public.media_albums FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "media_items_select" ON public.media_items FOR SELECT USING (
    album_id IS NULL OR 
    EXISTS (SELECT 1 FROM public.media_albums WHERE id = album_id AND (is_public = TRUE OR created_by = auth.uid()))
);
CREATE POLICY "media_items_insert" ON public.media_items FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "media_items_update" ON public.media_items FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "media_items_delete" ON public.media_items FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "media_ratings_select" ON public.media_ratings FOR SELECT USING (TRUE);
CREATE POLICY "media_ratings_insert" ON public.media_ratings FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "media_ratings_update" ON public.media_ratings FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "media_comments_select" ON public.media_comments FOR SELECT USING (TRUE);
CREATE POLICY "media_comments_insert" ON public.media_comments FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "media_comments_update" ON public.media_comments FOR UPDATE USING (auth.uid() = created_by);

-- Polls policies
CREATE POLICY "thread_polls_select" ON public.thread_polls FOR SELECT USING (TRUE);
CREATE POLICY "thread_polls_insert" ON public.thread_polls FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.forum_threads WHERE id = thread_id AND created_by = auth.uid())
);

CREATE POLICY "poll_options_select" ON public.poll_options FOR SELECT USING (TRUE);
CREATE POLICY "poll_options_insert" ON public.poll_options FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.thread_polls tp 
        JOIN public.forum_threads ft ON tp.thread_id = ft.id 
        WHERE tp.id = poll_id AND ft.created_by = auth.uid()
    )
);

CREATE POLICY "poll_votes_select" ON public.poll_votes FOR SELECT USING (TRUE);
CREATE POLICY "poll_votes_insert" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "poll_votes_delete" ON public.poll_votes FOR DELETE USING (auth.uid() = created_by);

-- FAQ policies
CREATE POLICY "faq_categories_select" ON public.faq_categories FOR SELECT USING (is_active = TRUE);

CREATE POLICY "faq_items_select" ON public.faq_items FOR SELECT USING (TRUE);
CREATE POLICY "faq_items_insert" ON public.faq_items FOR INSERT WITH CHECK (auth.email() = 'admin@hablandodecaballos.com');
CREATE POLICY "faq_items_update" ON public.faq_items FOR UPDATE USING (auth.email() = 'admin@hablandodecaballos.com');

CREATE POLICY "faq_votes_select" ON public.faq_votes FOR SELECT USING (TRUE);
CREATE POLICY "faq_votes_insert" ON public.faq_votes FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "faq_votes_update" ON public.faq_votes FOR UPDATE USING (auth.uid() = created_by);

-- ============================================================================
-- USER PROFILES SYSTEM (IMPLEMENTATION PHASE 1)
-- ============================================================================

-- Expand user profiles table
ALTER TABLE IF EXISTS public.user_profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location VARCHAR(200),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS website VARCHAR(500),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS specialties TEXT[],
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS show_location BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS allow_messages BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create user activities table
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'thread_created', 'reply_posted', 'horse_added', 'ad_published', etc.
    title VARCHAR(300) NOT NULL,
    description TEXT,
    reference_id UUID, -- ID of the related object (thread, horse, ad, etc.)
    reference_type VARCHAR(50), -- 'thread', 'horse', 'ad', 'media', etc.
    reference_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    points_earned INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    theme VARCHAR(20) DEFAULT 'light', -- 'light', 'dark', 'auto'
    language VARCHAR(10) DEFAULT 'es', -- 'es', 'en'
    timezone VARCHAR(50) DEFAULT 'America/Bogota',
    notifications_email BOOLEAN DEFAULT TRUE,
    notifications_push BOOLEAN DEFAULT TRUE,
    notifications_forum BOOLEAN DEFAULT TRUE,
    notifications_marketplace BOOLEAN DEFAULT TRUE,
    notifications_hall BOOLEAN DEFAULT TRUE,
    privacy_profile VARCHAR(20) DEFAULT 'public', -- 'public', 'registered', 'private'
    privacy_activity VARCHAR(20) DEFAULT 'public',
    privacy_stats VARCHAR(20) DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user follows table for social features
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL,
    following_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Create user badges earned table
CREATE TABLE IF NOT EXISTS public.user_earned_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT,
    is_displayed BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, badge_id)
);

-- ============================================================================
-- INDEXES FOR USER PROFILES SYSTEM
-- ============================================================================

CREATE INDEX IF NOT EXISTS user_activities_user_created_idx ON public.user_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS user_activities_type_idx ON public.user_activities(activity_type);
CREATE INDEX IF NOT EXISTS user_activities_reference_idx ON public.user_activities(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS user_activities_public_idx ON public.user_activities(is_public, created_at DESC) WHERE is_public = TRUE;

CREATE INDEX IF NOT EXISTS user_settings_user_idx ON public.user_settings(user_id);

CREATE INDEX IF NOT EXISTS user_follows_follower_idx ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS user_follows_following_idx ON public.user_follows(following_id);

CREATE INDEX IF NOT EXISTS user_earned_badges_user_idx ON public.user_earned_badges(user_id, earned_at DESC);
CREATE INDEX IF NOT EXISTS user_earned_badges_displayed_idx ON public.user_earned_badges(user_id, is_displayed) WHERE is_displayed = TRUE;

-- ============================================================================
-- ROW LEVEL SECURITY FOR USER PROFILES
-- ============================================================================

ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_earned_badges ENABLE ROW LEVEL SECURITY;

-- User activities policies
CREATE POLICY "user_activities_select" ON public.user_activities FOR SELECT USING (
    is_public = TRUE OR user_id = auth.uid()
);
CREATE POLICY "user_activities_insert" ON public.user_activities FOR INSERT WITH CHECK (
    auth.email() = 'admin@hablandodecaballos.com' OR user_id = auth.uid()
);

-- User settings policies  
CREATE POLICY "user_settings_select" ON public.user_settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_settings_insert" ON public.user_settings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_settings_update" ON public.user_settings FOR UPDATE USING (user_id = auth.uid());

-- User follows policies
CREATE POLICY "user_follows_select" ON public.user_follows FOR SELECT USING (TRUE);
CREATE POLICY "user_follows_insert" ON public.user_follows FOR INSERT WITH CHECK (follower_id = auth.uid());
CREATE POLICY "user_follows_delete" ON public.user_follows FOR DELETE USING (follower_id = auth.uid());

-- User earned badges policies
CREATE POLICY "user_earned_badges_select" ON public.user_earned_badges FOR SELECT USING (TRUE);
CREATE POLICY "user_earned_badges_insert" ON public.user_earned_badges FOR INSERT WITH CHECK (
    auth.email() = 'admin@hablandodecaballos.com'
);
CREATE POLICY "user_earned_badges_update" ON public.user_earned_badges FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- ADMIN PANEL SYSTEM (IMPLEMENTATION PHASE 2)
-- ============================================================================

-- Create admin roles table
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL, -- 'admin', 'moderator', 'content_manager'
    permissions JSONB DEFAULT '{}',
    assigned_by UUID,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Create system reports table
CREATE TABLE IF NOT EXISTS public.system_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID,
    reported_type VARCHAR(50) NOT NULL, -- 'thread', 'reply', 'horse', 'ad', 'user', 'media'
    reported_id UUID NOT NULL,
    report_category VARCHAR(50) NOT NULL, -- 'spam', 'inappropriate', 'harassment', 'fake', 'copyright', 'other'
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'dismissed'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    assigned_to UUID,
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin actions log table
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'user_suspend', 'content_delete', 'report_resolve', 'badge_assign', etc.
    target_type VARCHAR(50), -- 'user', 'thread', 'reply', 'horse', 'ad', 'report'
    target_id UUID,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSONB,
    setting_type VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'json', 'text'
    category VARCHAR(50) NOT NULL, -- 'general', 'security', 'notifications', 'features'
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user suspensions table
CREATE TABLE IF NOT EXISTS public.user_suspensions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    suspended_by UUID NOT NULL,
    reason TEXT NOT NULL,
    suspension_type VARCHAR(50) NOT NULL, -- 'temporary', 'permanent', 'warning'
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    appeal_status VARCHAR(20) DEFAULT 'none', -- 'none', 'pending', 'approved', 'denied'
    appeal_reason TEXT,
    appeal_submitted_at TIMESTAMP WITH TIME ZONE,
    appeal_reviewed_by UUID,
    appeal_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content moderation queue table
CREATE TABLE IF NOT EXISTS public.moderation_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL, -- 'thread', 'reply', 'horse', 'ad', 'media'
    content_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'flagged'
    flagged_reason TEXT,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high'
    assigned_to UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    reviewer_notes TEXT,
    auto_flagged BOOLEAN DEFAULT FALSE,
    flag_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin notifications table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'report', 'moderation', 'system', 'security'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- INDEXES FOR ADMIN SYSTEM
-- ============================================================================

CREATE INDEX IF NOT EXISTS admin_roles_user_idx ON public.admin_roles(user_id, is_active);
CREATE INDEX IF NOT EXISTS admin_roles_role_idx ON public.admin_roles(role, is_active);

CREATE INDEX IF NOT EXISTS system_reports_status_idx ON public.system_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS system_reports_assigned_idx ON public.system_reports(assigned_to, status);
CREATE INDEX IF NOT EXISTS system_reports_priority_idx ON public.system_reports(priority, created_at DESC);
CREATE INDEX IF NOT EXISTS system_reports_reporter_idx ON public.system_reports(reporter_id);

CREATE INDEX IF NOT EXISTS admin_actions_admin_idx ON public.admin_actions(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_actions_type_idx ON public.admin_actions(action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_actions_target_idx ON public.admin_actions(target_type, target_id);

CREATE INDEX IF NOT EXISTS site_settings_key_idx ON public.site_settings(setting_key);
CREATE INDEX IF NOT EXISTS site_settings_category_idx ON public.site_settings(category);

CREATE INDEX IF NOT EXISTS user_suspensions_user_idx ON public.user_suspensions(user_id, is_active);
CREATE INDEX IF NOT EXISTS user_suspensions_active_idx ON public.user_suspensions(is_active, expires_at) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS moderation_queue_status_idx ON public.moderation_queue(status, created_at DESC);
CREATE INDEX IF NOT EXISTS moderation_queue_assigned_idx ON public.moderation_queue(assigned_to, status);
CREATE INDEX IF NOT EXISTS moderation_queue_priority_idx ON public.moderation_queue(priority, created_at DESC);

CREATE INDEX IF NOT EXISTS admin_notifications_admin_read_idx ON public.admin_notifications(admin_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_notifications_type_idx ON public.admin_notifications(type, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY FOR ADMIN SYSTEM
-- ============================================================================

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_suspensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admin roles policies
CREATE POLICY "admin_roles_select" ON public.admin_roles FOR SELECT USING (
    auth.email() = 'admin@hablandodecaballos.com' OR 
    auth.email() = 'moderator@hablandodecaballos.com' OR
    user_id = auth.uid()
);
CREATE POLICY "admin_roles_insert" ON public.admin_roles FOR INSERT WITH CHECK (
    auth.email() = 'admin@hablandodecaballos.com'
);
CREATE POLICY "admin_roles_update" ON public.admin_roles FOR UPDATE USING (
    auth.email() = 'admin@hablandodecaballos.com'
);

-- System reports policies
CREATE POLICY "system_reports_select" ON public.system_reports FOR SELECT USING (
    auth.email() = 'admin@hablandodecaballos.com' OR 
    auth.email() = 'moderator@hablandodecaballos.com' OR
    reporter_id = auth.uid()
);
CREATE POLICY "system_reports_insert" ON public.system_reports FOR INSERT WITH CHECK (
    reporter_id = auth.uid()
);
CREATE POLICY "system_reports_update" ON public.system_reports FOR UPDATE USING (
    auth.email() = 'admin@hablandodecaballos.com' OR 
    auth.email() = 'moderator@hablandodecaballos.com'
);

-- Admin actions policies
CREATE POLICY "admin_actions_select" ON public.admin_actions FOR SELECT USING (
    auth.email() = 'admin@hablandodecaballos.com' OR 
    auth.email() = 'moderator@hablandodecaballos.com'
);
CREATE POLICY "admin_actions_insert" ON public.admin_actions FOR INSERT WITH CHECK (
    auth.email() = 'admin@hablandodecaballos.com' OR 
    auth.email() = 'moderator@hablandodecaballos.com'
);

-- Site settings policies
CREATE POLICY "site_settings_select" ON public.site_settings FOR SELECT USING (
    is_public = TRUE OR 
    auth.email() = 'admin@hablandodecaballos.com' OR 
    auth.email() = 'moderator@hablandodecaballos.com'
);
CREATE POLICY "site_settings_update" ON public.site_settings FOR UPDATE USING (
    auth.email() = 'admin@hablandodecaballos.com'
);

-- User suspensions policies
CREATE POLICY "user_suspensions_select" ON public.user_suspensions FOR SELECT USING (
    auth.email() = 'admin@hablandodecaballos.com' OR 
    auth.email() = 'moderator@hablandodecaballos.com' OR
    user_id = auth.uid()
);
CREATE POLICY "user_suspensions_insert" ON public.user_suspensions FOR INSERT WITH CHECK (
    auth.email() = 'admin@hablandodecaballos.com' OR 
    auth.email() = 'moderator@hablandodecaballos.com'
);
CREATE POLICY "user_suspensions_update" ON public.user_suspensions FOR UPDATE USING (
    auth.email() = 'admin@hablandodecaballos.com' OR 
    auth.email() = 'moderator@hablandodecaballos.com' OR
    (user_id = auth.uid() AND appeal_status = 'none')
);

-- Moderation queue policies
CREATE POLICY "moderation_queue_select" ON public.moderation_queue FOR SELECT USING (
    auth.email() = 'admin@hablandodecaballos.com' OR 
    auth.email() = 'moderator@hablandodecaballos.com' OR
    user_id = auth.uid()
);
CREATE POLICY "moderation_queue_insert" ON public.moderation_queue FOR INSERT WITH CHECK (
    auth.email() = 'admin@hablandodecaballos.com' OR 
    auth.email() = 'moderator@hablandodecaballos.com'
);
CREATE POLICY "moderation_queue_update" ON public.moderation_queue FOR UPDATE USING (
    auth.email() = 'admin@hablandodecaballos.com' OR 
    auth.email() = 'moderator@hablandodecaballos.com'
);

-- Admin notifications policies
CREATE POLICY "admin_notifications_select" ON public.admin_notifications FOR SELECT USING (
    admin_id = auth.uid()
);
CREATE POLICY "admin_notifications_insert" ON public.admin_notifications FOR INSERT WITH CHECK (
    auth.email() = 'admin@hablandodecaballos.com'
);
CREATE POLICY "admin_notifications_update" ON public.admin_notifications FOR UPDATE USING (
    admin_id = auth.uid()
);
