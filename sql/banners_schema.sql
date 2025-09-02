
-- =============================================
-- SISTEMA DE BANNERS PUBLICITARIOS
-- Esquema completo para Supabase
-- =============================================

-- 1. TABLA PRINCIPAL DE BANNERS
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Archivo multimedia
    image_url TEXT,
    video_url TEXT,
    html_content TEXT,
    banner_type VARCHAR(20) NOT NULL CHECK (banner_type IN ('image', 'video', 'html')),
    
    -- Configuración de posición
    position VARCHAR(30) NOT NULL CHECK (position IN (
        'header-leaderboard', 'sidebar-rectangle', 'content-mobile', 
        'footer-leaderboard', 'mobile-sticky', 'interstitial'
    )),
    
    -- URLs y tracking
    click_url TEXT NOT NULL,
    target_blank BOOLEAN DEFAULT true,
    
    -- Segmentación
    device_targeting VARCHAR(20) CHECK (device_targeting IN ('all', 'mobile', 'desktop')),
    location_targeting TEXT[], -- array de países/ciudades
    category_targeting TEXT[], -- array de categorías del foro
    
    -- Estado y configuración
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1, -- mayor número = mayor prioridad
    max_impressions INTEGER, -- límite de impresiones
    max_clicks INTEGER, -- límite de clicks
    
    -- Fechas
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata del anunciante
    advertiser_name VARCHAR(255),
    advertiser_email VARCHAR(255),
    campaign_budget DECIMAL(10,2),
    pricing_model VARCHAR(10) CHECK (pricing_model IN ('cpm', 'cpc', 'premium'))
);

-- 2. TABLA DE CAMPAÑAS PUBLICITARIAS
CREATE TABLE IF NOT EXISTS banner_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Relación con banners
    banner_ids UUID[] NOT NULL, -- array de IDs de banners
    
    -- Configuración de campaña
    budget DECIMAL(10,2) NOT NULL,
    spent_amount DECIMAL(10,2) DEFAULT 0,
    pricing_model VARCHAR(10) NOT NULL CHECK (pricing_model IN ('cpm', 'cpc', 'premium')),
    bid_amount DECIMAL(6,4), -- precio por impresión/click
    
    -- Fechas de campaña
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Estado
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    
    -- Metadata
    advertiser_name VARCHAR(255) NOT NULL,
    advertiser_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE ESTADÍSTICAS DE IMPRESIONES
CREATE TABLE IF NOT EXISTS banner_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banner_id UUID NOT NULL REFERENCES banners(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES banner_campaigns(id) ON DELETE CASCADE,
    
    -- Datos de la impresión
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    page_url TEXT NOT NULL,
    referrer_url TEXT,
    
    -- Información del usuario
    user_agent TEXT,
    device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    browser VARCHAR(50),
    operating_system VARCHAR(50),
    
    -- Ubicación geográfica (opcional)
    country VARCHAR(100),
    city VARCHAR(100),
    ip_address INET,
    
    -- Contexto de la página
    page_category VARCHAR(100), -- foro, noticia, historia, etc.
    user_authenticated BOOLEAN DEFAULT false,
    
    -- Metadata
    session_id VARCHAR(255),
    view_duration INTEGER -- tiempo en segundos que estuvo visible
);

-- 4. TABLA DE CLICKS EN BANNERS
CREATE TABLE IF NOT EXISTS banner_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banner_id UUID NOT NULL REFERENCES banners(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES banner_campaigns(id) ON DELETE CASCADE,
    
    -- Datos del click
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    page_url TEXT NOT NULL,
    referrer_url TEXT,
    
    -- Información del usuario (similar a banner_stats)
    user_agent TEXT,
    device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    browser VARCHAR(50),
    operating_system VARCHAR(50),
    
    -- Ubicación geográfica
    country VARCHAR(100),
    city VARCHAR(100),
    ip_address INET,
    
    -- Contexto
    page_category VARCHAR(100),
    user_authenticated BOOLEAN DEFAULT false,
    session_id VARCHAR(255),
    
    -- Tracking de conversión (opcional)
    conversion_tracked BOOLEAN DEFAULT false,
    conversion_value DECIMAL(8,2)
);

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN DE PERFORMANCE
-- =============================================

-- Índices para banners
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active, priority) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_banners_dates ON banners(start_date, end_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_banners_targeting ON banners USING GIN(device_targeting, location_targeting, category_targeting);

-- Índices para campañas
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON banner_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON banner_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser ON banner_campaigns(advertiser_email);

-- Índices para estadísticas (críticos para performance)
CREATE INDEX IF NOT EXISTS idx_banner_stats_banner_id ON banner_stats(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_stats_timestamp ON banner_stats(timestamp);
CREATE INDEX IF NOT EXISTS idx_banner_stats_page_category ON banner_stats(page_category);
CREATE INDEX IF NOT EXISTS idx_banner_stats_device ON banner_stats(device_type);

-- Índices para clicks
CREATE INDEX IF NOT EXISTS idx_banner_clicks_banner_id ON banner_clicks(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_timestamp ON banner_clicks(timestamp);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_session ON banner_clicks(session_id);

-- =============================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =============================================

-- Trigger para actualizar updated_at en banners
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_banners_updated_at 
    BEFORE UPDATE ON banners 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at 
    BEFORE UPDATE ON banner_campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCIONES ÚTILES PARA ANALYTICS
-- =============================================

-- Función para obtener métricas de banner por período
CREATE OR REPLACE FUNCTION get_banner_metrics(
    p_banner_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE(
    total_impressions BIGINT,
    total_clicks BIGINT,
    click_through_rate DECIMAL,
    avg_view_duration DECIMAL,
    unique_sessions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM banner_stats s 
         WHERE s.banner_id = p_banner_id 
         AND (p_start_date IS NULL OR s.timestamp >= p_start_date)
         AND (p_end_date IS NULL OR s.timestamp <= p_end_date)
        )::BIGINT as total_impressions,
        
        (SELECT COUNT(*) FROM banner_clicks c 
         WHERE c.banner_id = p_banner_id
         AND (p_start_date IS NULL OR c.timestamp >= p_start_date)
         AND (p_end_date IS NULL OR c.timestamp <= p_end_date)
        )::BIGINT as total_clicks,
        
        CASE WHEN (SELECT COUNT(*) FROM banner_stats s WHERE s.banner_id = p_banner_id) > 0
            THEN (SELECT COUNT(*)::DECIMAL FROM banner_clicks c WHERE c.banner_id = p_banner_id) * 100.0 / 
                 (SELECT COUNT(*)::DECIMAL FROM banner_stats s WHERE s.banner_id = p_banner_id)
            ELSE 0
        END as click_through_rate,
        
        (SELECT COALESCE(AVG(view_duration), 0) FROM banner_stats s 
         WHERE s.banner_id = p_banner_id AND s.view_duration IS NOT NULL
        )::DECIMAL as avg_view_duration,
        
        (SELECT COUNT(DISTINCT session_id) FROM banner_stats s 
         WHERE s.banner_id = p_banner_id
         AND (p_start_date IS NULL OR s.timestamp >= p_start_date)
         AND (p_end_date IS NULL OR s.timestamp <= p_end_date)
        )::BIGINT as unique_sessions;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DATOS DEMO PARA DESARROLLO
-- =============================================

-- Banner de ejemplo 1: Header Leaderboard
INSERT INTO banners (title, description, banner_type, image_url, position, click_url, advertiser_name, pricing_model, is_active, priority)
VALUES (
    'Suplementos Premium para Caballos',
    'Los mejores suplementos nutricionales para el rendimiento de tu caballo',
    'image',
    'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=728&h=90&fit=crop',
    'header-leaderboard',
    'https://ejemplo-suplementos.com',
    'Suplementos Equinos S.A.',
    'cpm',
    true,
    5
);

-- Banner de ejemplo 2: Sidebar Rectangle  
INSERT INTO banners (title, description, banner_type, image_url, position, click_url, advertiser_name, pricing_model, is_active, priority)
VALUES (
    'Escuela de Equitación Profesional',
    'Aprende técnicas avanzadas de equitación con nuestros instructores certificados',
    'image', 
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/USMC-01918.jpg/640px-USMC-01918.jpg',
    'sidebar-rectangle',
    'https://escuela-equitacion-ejemplo.com',
    'Academia Ecuestre Elite',
    'cpc',
    true,
    3
);

-- Banner de ejemplo 3: Mobile Banner
INSERT INTO banners (title, description, banner_type, html_content, position, click_url, advertiser_name, pricing_model, is_active, priority)
VALUES (
    'Veterinario Especializado',
    'Consultas veterinarias especializadas en caballos de competición',
    'html',
    '<div style="background: linear-gradient(45deg, #8B4513, #D2691E); color: white; padding: 10px; text-align: center; border-radius: 8px;"><strong>🩺 Dr. Veterinario</strong><br><small>Consultas 24/7</small></div>',
    'content-mobile',
    'https://vet-caballos-ejemplo.com',
    'Clínica Veterinaria Equina',
    'premium', 
    true,
    4
);

-- Campaña de ejemplo
INSERT INTO banner_campaigns (name, description, banner_ids, budget, pricing_model, bid_amount, start_date, end_date, status, advertiser_name, advertiser_email)
VALUES (
    'Campaña Suplementos Q1 2025',
    'Campaña promocional de productos nutricionales para el primer trimestre',
    ARRAY[(SELECT id FROM banners WHERE title = 'Suplementos Premium para Caballos' LIMIT 1)],
    500.00,
    'cpm',
    3.50,
    NOW(),
    NOW() + INTERVAL '30 days',
    'active',
    'Suplementos Equinos S.A.',
    'marketing@suplementos-ejemplo.com'
);

-- Estadísticas de ejemplo (últimos 7 días)
DO $$
DECLARE 
    banner_record RECORD;
    i INTEGER;
    random_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
    FOR banner_record IN SELECT id FROM banners LOOP
        FOR i IN 1..50 LOOP  -- 50 impresiones por banner
            random_timestamp := NOW() - (random() * INTERVAL '7 days');
            
            INSERT INTO banner_stats (
                banner_id, timestamp, page_url, device_type, page_category,
                session_id, view_duration
            ) VALUES (
                banner_record.id,
                random_timestamp,
                '/foros/trocha-y-galope',
                (ARRAY['mobile', 'desktop', 'tablet'])[1 + floor(random() * 3)::int],
                'foros',
                'session_' || substr(md5(random()::text), 1, 10),
                5 + floor(random() * 30)::int  -- 5-35 segundos
            );
            
            -- 5% de las impresiones generan clicks
            IF random() < 0.05 THEN
                INSERT INTO banner_clicks (
                    banner_id, timestamp, page_url, device_type, page_category,
                    session_id
                ) VALUES (
                    banner_record.id,
                    random_timestamp + INTERVAL '2 seconds',
                    '/foros/trocha-y-galope', 
                    (ARRAY['mobile', 'desktop', 'tablet'])[1 + floor(random() * 3)::int],
                    'foros',
                    'session_' || substr(md5(random()::text), 1, 10)
                );
            END IF;
        END LOOP;
    END LOOP;
END $$;

COMMIT;

-- =============================================
-- PERMISOS Y SEGURIDAD
-- =============================================

-- Solo usuarios autenticados pueden ver estadísticas
ALTER TABLE banner_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_clicks ENABLE ROW LEVEL SECURITY;

-- Los banners públicos son visibles para todos
CREATE POLICY "Banners públicos visibles" ON banners 
    FOR SELECT USING (is_active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));

-- Solo administradores pueden gestionar banners
CREATE POLICY "Solo admins gestionan banners" ON banners 
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@hablandodecaballos.com');

-- Políticas similares para campañas
CREATE POLICY "Solo admins gestionan campañas" ON banner_campaigns 
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@hablandodecaballos.com');
