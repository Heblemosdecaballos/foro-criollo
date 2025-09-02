
// Script para crear usuario administrador
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createAdminUser() {
  console.log('🚀 Iniciando creación de usuario administrador...');
  
  // Verificar si tenemos credenciales reales
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Variables de entorno de Supabase no configuradas');
    return;
  }
  
  if (supabaseUrl.includes('demo-project') || supabaseAnonKey.includes('demo-key')) {
    console.log('⚠️  Detectadas credenciales de demo. Para crear el usuario administrador real, necesitas:');
    console.log('1. Configurar un proyecto real en Supabase (https://supabase.com)');
    console.log('2. Actualizar las variables de entorno en .env.local:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co');
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role');
    console.log('');
    console.log('📝 Creando configuración de ejemplo para cuando tengas credenciales reales...');
    
    // Crear archivo de configuración de ejemplo
    const fs = require('fs');
    const exampleConfig = `
# CONFIGURACIÓN PARA USUARIO ADMINISTRADOR
# Reemplaza estas credenciales con las reales de tu proyecto Supabase

# Credenciales de Supabase (REEMPLAZAR)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-real.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-real
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role-real

# Datos del administrador (YA CONFIGURADOS)
ADMIN_EMAIL=admin@hablandodecaballos.com
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=Admin1234
ADMIN_FULL_NAME=Administrador del Foro

# Otras configuraciones existentes
HALL_ADMIN_EMAIL=admin@hablandodecaballos.com
JWT_SECRET=hablando-de-caballos-super-secret-jwt-key-2024
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=UC_HablandoDeCaballos
NEXT_PUBLIC_SITE_URL=http://localhost:3000
`;
    
    fs.writeFileSync('.env.admin.example', exampleConfig);
    console.log('✅ Archivo .env.admin.example creado con la configuración necesaria');
    return;
  }
  
  // Si tenemos credenciales reales, proceder con la creación
  const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
  
  try {
    console.log('📧 Creando usuario administrador...');
    
    // Crear usuario con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@hablandodecaballos.com',
      password: 'Admin1234',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador del Foro',
        username: 'Admin'
      }
    });
    
    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log('👤 Usuario ya existe, actualizando rol...');
        
        // Buscar el usuario existente
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingUser = users.users.find(u => u.email === 'admin@hablandodecaballos.com');
        if (existingUser) {
          // Actualizar perfil a admin
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
              id: existingUser.id,
              full_name: 'Administrador del Foro',
              role: 'admin'
            });
          
          if (updateError) throw updateError;
          console.log('✅ Usuario administrador actualizado correctamente');
        }
      } else {
        throw authError;
      }
    } else {
      console.log('👤 Usuario creado en Auth, configurando perfil...');
      
      // Crear/actualizar perfil con rol de admin
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: 'Administrador del Foro',
          role: 'admin'
        });
      
      if (profileError) throw profileError;
      console.log('✅ Usuario administrador creado correctamente');
    }
    
    console.log('');
    console.log('🎉 USUARIO ADMINISTRADOR CONFIGURADO:');
    console.log('📧 Email: admin@hablandodecaballos.com');
    console.log('👤 Usuario: Admin');
    console.log('🔑 Contraseña: Admin1234');
    console.log('🛡️  Rol: Administrador');
    console.log('');
    console.log('El usuario puede ahora:');
    console.log('- Administrar y editar foros');
    console.log('- Gestionar todo el contenido');
    console.log('- Subir contenido al Hall of Fame');
    console.log('- Acceder al panel de administración');
    
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error.message);
    console.log('');
    console.log('💡 Posibles soluciones:');
    console.log('1. Verificar que las credenciales de Supabase sean correctas');
    console.log('2. Asegurar que la tabla "profiles" existe en la base de datos');
    console.log('3. Verificar que tienes permisos de Service Role');
  }
}

createAdminUser();
