# 🐎 **Hablando de Caballos - Plataforma Ecuestre Colombiana**

[![Next.js](https://i.ytimg.com/vi/f53RvUpUA8w/sddefault.jpg)
[![TypeScript](https://i.ytimg.com/vi/4cgpu9L2AE8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCzedb-c7IZSg8ZCib1APCJvLdWqw)
[![Supabase](https://i.pinimg.com/564x/8a/c8/01/8ac801b7dd095f8ce45777055903ef68.jpg)
[![Vercel](https://i.ytimg.com/vi/RAnJc4ZbBoU/sddefault.jpg)

## 🎯 **Descripción**

**Hablando de Caballos** es la plataforma ecuestre más completa para la comunidad del caballo criollo colombiano. Conecta criadores, jinetes, aficionados y expertos en un espacio digital moderno y funcional.

## ✨ **Características Principales**

### 🏆 **Hall de la Fama**
- **4 Andares**: Paso Fino, Trocha, Trocha y Galope, Trote y Galope
- **Gestión de Ejemplares**: CRUD completo con imágenes
- **Votación Comunitaria**: Sistema de likes y favoritos
- **Administración**: Panel admin para gestionar contenido

### 💬 **Sistema de Foros**
- **Categorías Especializadas**: Cuidados, Entrenamiento, Mercado, etc.
- **Threads y Respuestas**: Sistema completo de discusión
- **Moderación**: Herramientas para moderadores
- **Búsqueda Avanzada**: Filtros por categoría, fecha, popularidad

### 📸 **Galería Multimedia**
- **Álbumes Temáticos**: Organización por eventos, andares, etc.
- **Upload Sistema**: Integración con AWS S3
- **Gestión de Medios**: CRUD completo de imágenes
- **Responsive Gallery**: Visualización optimizada

### 🛒 **Marketplace**
- **Compra/Venta**: Caballos, monturas, accesorios
- **Gestión de Anuncios**: Sistema completo de clasificados
- **Búsqueda Filtrada**: Por precio, ubicación, categoría

### 📖 **Historias**
- **Artículos**: Cultura e historia ecuestre
- **Solo Admin**: Gestión centralizada de contenido
- **Rich Content**: Soporte para imágenes y texto enriquecido

### 👤 **Gestión de Usuarios**
- **Autenticación**: Supabase Auth completa
- **Perfiles**: Información personal y estadísticas
- **Roles**: Admin, Moderador, Usuario
- **Configuración**: Preferencias personalizables

## 🛠️ **Stack Tecnológico**

### **Frontend**
- **Framework**: Next.js 14.2.28 (App Router)
- **Lenguaje**: TypeScript 5.2.2
- **Estilos**: Tailwind CSS 3.3.3
- **Componentes**: Shadcn/ui + Radix UI
- **Estado**: Zustand + SWR
- **Iconos**: Lucide React

### **Backend & Base de Datos**
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **ORM**: Prisma 6.7.0
- **File Storage**: AWS S3 (integración completa)
- **Autenticación**: Supabase Auth con next-auth

### **DevOps & Deploy**
- **Hosting**: Vercel (recomendado)
- **CI/CD**: GitHub Actions
- **Monitoreo**: Built-in Next.js analytics
- **SSL**: Automático con Vercel

## 📂 **Estructura del Proyecto**

```
foro-criollo/
├── app/                          # Aplicación Next.js
│   ├── app/                      # App Router (Next.js 14)
│   │   ├── (auth)/              # Grupo de rutas de autenticación
│   │   ├── admin/               # Panel de administración
│   │   ├── api/                 # API Routes
│   │   ├── forums/              # Sistema de foros
│   │   ├── hall/                # Hall de la Fama
│   │   ├── galeria/             # Galería multimedia
│   │   ├── marketplace/         # Marketplace
│   │   └── historias/           # Historias y artículos
│   ├── components/              # Componentes reutilizables
│   │   ├── ui/                  # Shadcn/ui components
│   │   ├── auth/                # Componentes de autenticación
│   │   ├── forums/              # Componentes del foro
│   │   ├── gallery/             # Componentes de galería
│   │   └── profiles/            # Componentes de usuario
│   ├── lib/                     # Utilidades y configuraciones
│   │   ├── supabase.ts          # Cliente Supabase
│   │   ├── aws-config.ts        # Configuración AWS S3
│   │   └── utils.ts             # Utilidades generales
│   ├── public/                  # Archivos estáticos
│   └── prisma/                  # Esquema de base de datos
├── .env                         # Variables de entorno
└── README.md                    # Este archivo
```

## 🚀 **Instalación y Desarrollo**

### **Prerrequisitos**
- Node.js 18+ 
- Yarn (recomendado)
- Cuenta Supabase
- Cuenta AWS S3

### **Setup Local**

1. **Clonar repositorio**
```Bash Terminal
git clone https://github.com/Heblemosdecaballos/foro-criollo.git
cd foro-criollo/app
```

2. **Instalar dependencias**
```Bash Terminal
yarn install
```

3. **Configurar variables de entorno**
```Bash Terminal
cp .env.example .env
# Editar .env con tus credenciales
```

4. **Variables de entorno requeridas**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE=tu-service-role-key

# AWS S3
AWS_REGION=us-west-2
AWS_BUCKET_NAME=tu-bucket
AWS_FOLDER_PREFIX=tu-prefix/

# Admin
HALL_ADMIN_EMAIL=admin@hablandodecaballos.com
FORUM_MOD_EMAIL=moderator@hablandodecaballos.com
```

5. **Configurar base de datos**
```Bash Terminal
yarn prisma generate
yarn prisma db push
```

6. **Ejecutar en desarrollo**
```Bash Terminal
yarn dev
```

## 🌐 **Deploy a Producción**

### **Vercel (Recomendado)**

1. **Conectar repositorio en Vercel**
   - Importar desde GitHub
   - Framework: Next.js (auto-detected)

2. **Configurar variables de entorno**
   - Copiar todas las variables de `.env`
   - Verificar que estén correctas

3. **Deploy**
   - Push a main branch = Deploy automático
   - Vercel URL + Dominio personalizado

### **Alternativas**
- **Railway**: $20/mes
- **Render**: $7/mes  
- **DigitalOcean App Platform**: $5/mes

## 🔧 **Configuración Avanzada**

### **AWS S3 Setup**
```javascript
// lib/aws-config.ts
export const getBucketConfig = () => ({
  bucketName: process.env.AWS_BUCKET_NAME,
  folderPrefix: process.env.AWS_FOLDER_PREFIX || ""
})
```

### **Supabase Setup**
```sql
-- Tablas principales
CREATE TABLE horses (id, name, andar, description, image_url, votes)
CREATE TABLE forum_threads (id, title, content, category, author_id)  
CREATE TABLE media_items (id, title, url, album_id, cloud_storage_path)
CREATE TABLE user_profiles (id, user_id, display_name, bio)
```

## 📊 **Características Técnicas**

### **Performance**
- **SSG + ISR**: Páginas estáticas con revalidación
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Componentes y rutas
- **CDN**: Vercel Edge Network

### **SEO**
- **Metadata API**: Next.js 14 metadata
- **Open Graph**: Imágenes y descripciones automáticas
- **Sitemap**: Generación automática
- **Structured Data**: Schema.org markup

### **Seguridad**
- **Autenticación**: Supabase Auth + JWT
- **Autorización**: Role-based access control
- **CORS**: Configuración segura
- **Rate Limiting**: API protection

## 🐛 **Troubleshooting**

### **Problemas Comunes**

1. **Hydration Errors**
   - Solucionado con mounted state pattern
   - Loading placeholders durante SSR

2. **Supabase Connection**
   - Verificar variables de entorno
   - Comprobar network access

3. **AWS S3 Upload**
   - Verificar credentials
   - Comprobar bucket permissions

### **Logs y Debugging**
```Bash Terminal
# Logs de desarrollo
yarn dev

# Build logs
yarn build

# Logs de producción
vercel logs
```

## 👥 **Contribución**

### **Admin Users**
- **Admin**: `admin@hablandodecaballos.com`
- **Moderator**: `moderator@hablandodecaballos.com`

### **Features Implementadas**
- ✅ Hall de la Fama completo
- ✅ Sistema de foros
- ✅ Galería multimedia  
- ✅ Marketplace básico
- ✅ Sistema de usuarios
- ✅ Historias/artículos
- ✅ Panel admin
- ✅ Responsive design
- ✅ SEO optimization

### **Roadmap**
- 🔄 Notificaciones en tiempo real
- 🔄 Chat privado entre usuarios
- 🔄 Sistema de eventos
- 🔄 Integración con redes sociales
- 🔄 App móvil (React Native)

## 📄 **Licencia**

Proyecto privado para la comunidad ecuestre colombiana.

## 📞 **Contacto**

- **Dominio**: `hablandodecaballos.com`
- **GitHub**: `https://github.com/Heblemosdecaballos/foro-criollo`
- **Email**: `admin@hablandodecaballos.com`

---

**Desarrollado con ❤️ para la comunidad ecuestre colombiana** 🇨🇴🐎