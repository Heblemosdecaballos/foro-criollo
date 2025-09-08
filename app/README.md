
# Hablando de Caballos - Foro Ecuestre

## Descripción

**Hablando de Caballos** es una plataforma web integral dedicada a la comunidad ecuestre de habla hispana, especializada en caballos criollos. La aplicación combina un **Hall of Fame** de ejemplares excepcionales con un **sistema completo de foros** de discusión temáticos.

### Funcionalidades Principales

#### 🏆 Hall of Fame
- Galería de ejemplares excepcionales de caballos criollos
- Organización por andares (Paso Fino, Trocha, Trocha y Galope, Trote y Galope)
- Sistema de votaciones y comentarios
- Subida de imágenes y gestión de medios
- Perfiles detallados de ejemplares con pedigrí

#### 💬 Sistema de Foros
- **6 categorías temáticas especializadas:**
  - Razas y cría
  - Cuidados y salud  
  - Monta y entrenamiento
  - Equipamiento y transporte
  - Mercado
  - Vida más allá de los caballos

- **Funcionalidades del foro:**
  - Creación de hilos y respuestas
  - Sistema de likes y favoritos
  - Hilos destacados y fijos
  - Contador de vistas
  - Navegación intuitiva entre categorías

#### 🎨 UI/UX Ecuestre
- Diseño responsivo con temática ecuestre
- Modo oscuro/claro con toggle
- Animaciones y efectos visuales
- Paleta de colores inspirada en el mundo equino
- Iconografía específica para cada andar

#### 🔐 Autenticación y Seguridad
- Sistema de registro e inicio de sesión con Supabase Auth
- Políticas RLS (Row Level Security) completas
- Gestión de permisos por usuario
- Protección contra accesos no autorizados

## Stack Tecnológico

### Frontend
- **Next.js 14** con App Router
- **React 18** con Server Components
- **TypeScript** para type safety
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **Shadcn/UI** como sistema de componentes

### Backend
- **Supabase** como BaaS (Backend as a Service)
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Storage para imágenes

### Deployment
- **Vercel** para el frontend
- **Supabase Cloud** para backend y base de datos

## Estructura de la Base de Datos

### Tablas Principales

#### Hall of Fame
- `andares` - Tipos de andares de caballos
- `horses` - Información de ejemplares
- `horse_media` - Imágenes y medios de ejemplares
- `hall_votes` - Votos de usuarios en ejemplares
- `hall_comments` - Comentarios en ejemplares

#### Foros
- `forum_categories` - Categorías de foros
- `forum_threads` - Hilos de discusión
- `forum_replies` - Respuestas a hilos
- `forum_likes` - Likes en hilos y respuestas
- `forum_favorites` - Hilos favoritos de usuarios

## Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE=tu_service_role_key
HALL_ADMIN_EMAIL=admin@hablandodecaballos.com
FORUM_MOD_EMAIL=moderator@hablandodecaballos.com
```

## Instalación y Desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/foro-criollo.git

# Instalar dependencias
cd foro-criollo/app
yarn install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar en modo desarrollo
yarn dev
```

## Configuración de la Base de Datos

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Ejecutar el script SQL de inicialización ubicado en `lib/db-setup.sql`
3. Configurar las políticas RLS según el script
4. Crear los buckets de storage necesarios:
   - `hall-public` (público)
   - `hall-originals` (privado)

## Estructura del Proyecto

```
app/
├── app/                    # App Router pages
│   ├── auth/              # Páginas de autenticación
│   ├── forums/            # Páginas del sistema de foros
│   ├── hall/              # Hall of Fame
│   └── globals.css        # Estilos globales
├── components/            # Componentes reutilizables
│   ├── auth/             # Componentes de autenticación
│   ├── forums/           # Componentes del foro
│   └── ui/               # Componentes UI base
├── lib/                  # Utilidades y configuración
│   ├── supabase.ts       # Cliente de Supabase
│   ├── types.ts          # Tipos TypeScript
│   └── constants.ts      # Constantes de la app
└── public/               # Assets estáticos
    └── andares/          # Iconos de andares
```

## Características Técnicas Destacadas

### Responsive Design
- Mobile-first approach
- Breakpoints optimizados para todos los dispositivos
- Navigation hamburger en móviles

### Performance
- Server-side rendering con Next.js 14
- Optimización de imágenes con Next.js Image
- Lazy loading y code splitting automático

### SEO & Accessibility
- Meta tags optimizados
- Estructura semántica
- Soporte para screen readers
- Focus management

### Real-time Features
- Actualizaciones en tiempo real con Supabase
- Notificaciones instantáneas (próximamente)

## Roadmap

### Fase 2 (Próximamente)
- [ ] Sistema de notificaciones en tiempo real
- [ ] Mensajería privada entre usuarios
- [ ] Sistema avanzado de moderación
- [ ] API REST completa
- [ ] App móvil React Native

### Fase 3 (Futuro)
- [ ] Integración con redes sociales
- [ ] Sistema de reputación de usuarios
- [ ] Marketplace integrado
- [ ] Eventos y calendario ecuestre
- [ ] Livestreaming de eventos

## Contribuir

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## Soporte

Para soporte técnico o consultas sobre el proyecto:
- Email: admin@hablandodecaballos.com
- Issues: [GitHub Issues](https://github.com/tu-usuario/foro-criollo/issues)

---

**Hablando de Caballos** - La comunidad ecuestre más completa de habla hispana 🐎

<!-- Build updated: Sept 8, 2025 - ESLint conflicts resolved -->
