
// Script para crear el esquema de banners en Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno SUPABASE no encontradas');
  console.error('Asegúrate de que .env.local contenga:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=...');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL para crear las tablas (dividido en comandos individuales)
const createTables = [
  // Tabla principal de banners
  `CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    html_content TEXT,
    banner_type VARCHAR(20) NOT NULL CHECK (banner_type IN ('image', 'video', 'html')),
    position VARCHAR(30) NOT NULL CHECK (position IN (
        'header-leaderboard', 'sidebar-rectangle', 'content-mobile', 
        'footer-leaderboard', 'mobile-sticky', 'interstitial'
    )),
    click_url TEXT NOT NULL,
    target_blank BOOLEAN DEFAULT true,
    device_targeting VARCHAR(20) CHECK (device_targeting IN ('all', 'mobile', 'desktop')),
    location_targeting TEXT[],
    category_targeting TEXT[],
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    max_impressions INTEGER,
    max_clicks INTEGER,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    advertiser_name VARCHAR(255),
    advertiser_email VARCHAR(255),
    campaign_budget DECIMAL(10,2),
    pricing_model VARCHAR(10) CHECK (pricing_model IN ('cpm', 'cpc', 'premium'))
  )`,

  // Tabla de campañas
  `CREATE TABLE IF NOT EXISTS banner_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    banner_ids UUID[] NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    spent_amount DECIMAL(10,2) DEFAULT 0,
    pricing_model VARCHAR(10) NOT NULL CHECK (pricing_model IN ('cpm', 'cpc', 'premium')),
    bid_amount DECIMAL(6,4),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    advertiser_name VARCHAR(255) NOT NULL,
    advertiser_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,

  // Tabla de estadísticas
  `CREATE TABLE IF NOT EXISTS banner_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banner_id UUID NOT NULL,
    campaign_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    page_url TEXT NOT NULL,
    referrer_url TEXT,
    user_agent TEXT,
    device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    browser VARCHAR(50),
    operating_system VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    ip_address INET,
    page_category VARCHAR(100),
    user_authenticated BOOLEAN DEFAULT false,
    session_id VARCHAR(255),
    view_duration INTEGER
  )`,

  // Tabla de clicks
  `CREATE TABLE IF NOT EXISTS banner_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banner_id UUID NOT NULL,
    campaign_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    page_url TEXT NOT NULL,
    referrer_url TEXT,
    user_agent TEXT,
    device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    browser VARCHAR(50),
    operating_system VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    ip_address INET,
    page_category VARCHAR(100),
    user_authenticated BOOLEAN DEFAULT false,
    session_id VARCHAR(255),
    conversion_tracked BOOLEAN DEFAULT false,
    conversion_value DECIMAL(8,2)
  )`
];

// Índices para optimización
const createIndexes = [
  'CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active, priority) WHERE is_active = true',
  'CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position) WHERE is_active = true',
  'CREATE INDEX IF NOT EXISTS idx_banners_dates ON banners(start_date, end_date) WHERE is_active = true',
  'CREATE INDEX IF NOT EXISTS idx_campaigns_status ON banner_campaigns(status)',
  'CREATE INDEX IF NOT EXISTS idx_banner_stats_banner_id ON banner_stats(banner_id)',
  'CREATE INDEX IF NOT EXISTS idx_banner_stats_timestamp ON banner_stats(timestamp)',
  'CREATE INDEX IF NOT EXISTS idx_banner_clicks_banner_id ON banner_clicks(banner_id)',
  'CREATE INDEX IF NOT EXISTS idx_banner_clicks_timestamp ON banner_clicks(timestamp)'
];

// Función para ejecutar migración
async function migrateBanners() {
  console.log('🚀 Iniciando migración del sistema de banners...\n');

  try {
    // Crear tablas
    console.log('📋 Creando tablas...');
    for (let i = 0; i < createTables.length; i++) {
      const sql = createTables[i];
      console.log(`  └─ Creando tabla ${i + 1}/${createTables.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.warn(`    ⚠️  Warning en tabla ${i + 1}:`, error.message);
        // Continuar con las siguientes tablas
      } else {
        console.log(`    ✅ Tabla ${i + 1} creada exitosamente`);
      }
    }

    // Crear índices
    console.log('\n🔧 Creando índices...');
    for (let i = 0; i < createIndexes.length; i++) {
      const sql = createIndexes[i];
      console.log(`  └─ Creando índice ${i + 1}/${createIndexes.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.warn(`    ⚠️  Warning en índice ${i + 1}:`, error.message);
      } else {
        console.log(`    ✅ Índice ${i + 1} creado exitosamente`);
      }
    }

    console.log('\n🎯 Insertando datos de ejemplo...');
    
    // Insertar banners de ejemplo
    const { data: bannerData, error: bannerError } = await supabase
      .from('banners')
      .insert([
        {
          title: 'Suplementos Premium para Caballos',
          description: 'Los mejores suplementos nutricionales para el rendimiento de tu caballo',
          banner_type: 'image',
          image_url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=728&h=90&fit=crop',
          position: 'header-leaderboard',
          click_url: 'https://ejemplo-suplementos.com',
          advertiser_name: 'Suplementos Equinos S.A.',
          pricing_model: 'cpm',
          is_active: true,
          priority: 5
        },
        {
          title: 'Escuela de Equitación Profesional',
          description: 'Aprende técnicas avanzadas de equitación con nuestros instructores certificados',
          banner_type: 'image',
          image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/USMC-01918.jpg/640px-USMC-01918.jpg',
          position: 'sidebar-rectangle',
          click_url: 'https://escuela-equitacion-ejemplo.com',
          advertiser_name: 'Academia Ecuestre Elite',
          pricing_model: 'cpc',
          is_active: true,
          priority: 3
        },
        {
          title: 'Veterinario Especializado',
          description: 'Consultas veterinarias especializadas en caballos de competición',
          banner_type: 'html',
          html_content: '<div style="background: linear-gradient(45deg, #8B4513, #D2691E); color: white; padding: 10px; text-align: center; border-radius: 8px;"><strong>🩺 Dr. Veterinario</strong><br><small>Consultas 24/7</small></div>',
          position: 'content-mobile',
          click_url: 'https://vet-caballos-ejemplo.com',
          advertiser_name: 'Clínica Veterinaria Equina',
          pricing_model: 'premium',
          is_active: true,
          priority: 4
        }
      ])
      .select();

    if (bannerError) {
      console.warn('  ⚠️  Warning insertando banners:', bannerError.message);
    } else {
      console.log(`  ✅ Insertados ${bannerData?.length || 0} banners de ejemplo`);
    }

    // Verificar que las tablas se crearon correctamente
    console.log('\n🔍 Verificando tablas creadas...');
    const tables = ['banners', 'banner_campaigns', 'banner_stats', 'banner_clicks'];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`  ❌ Error verificando tabla ${table}:`, error.message);
      } else {
        console.log(`  ✅ Tabla ${table}: ${count} registros`);
      }
    }

    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('📊 El sistema de banners está listo para usar.');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateBanners();
