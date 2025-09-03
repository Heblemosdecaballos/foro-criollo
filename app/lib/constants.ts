
export const FORUM_CATEGORIES = [
  {
    slug: 'razas-y-cria',
    name: 'Razas y cría',
    description: 'Discusión sobre razas, linajes, cría responsable y genética equina',
    icon: 'Users',
    order_index: 1
  },
  {
    slug: 'cuidados-y-salud',
    name: 'Cuidados y salud',
    description: 'Veterinaria, nutrición, cuidados diarios y bienestar animal',
    icon: 'Heart',
    order_index: 2
  },
  {
    slug: 'monta-y-entrenamiento',
    name: 'Monta y entrenamiento',
    description: 'Técnicas de doma, entrenamiento, disciplinas ecuestres y andares',
    icon: 'Trophy',
    order_index: 3
  },
  {
    slug: 'equipamiento-y-transporte',
    name: 'Equipamiento y transporte',
    description: 'Monturas, frenos, equipos de seguridad y transporte de caballos',
    icon: 'Truck',
    order_index: 4
  },
  {
    slug: 'mercado',
    name: 'Mercado',
    description: 'Compra, venta, intercambio de caballos y equipamiento',
    icon: 'ShoppingCart',
    order_index: 5
  },
  {
    slug: 'vida-mas-alla-de-los-caballos',
    name: 'Vida más allá de los caballos',
    description: 'Charla general, eventos, noticias y todo lo relacionado con el mundo ecuestre',
    icon: 'Coffee',
    order_index: 6
  }
]

export const ANDARES = [
  { slug: 'paso-fino', name: 'Paso Fino' },
  { slug: 'trocha', name: 'Trocha' },
  { slug: 'trocha-y-galope', name: 'Trocha y Galope' },
  { slug: 'trote-y-galope', name: 'Trote y Galope' }
]

export const HALL_ADMIN_EMAIL = 'admin@hablandodecaballos.com'

export const MARKETPLACE_CATEGORIES = [
  {
    slug: 'caballos',
    name: 'Caballos',
    description: 'Compra y venta de ejemplares equinos',
    icon: 'Horse',
    order_index: 1
  },
  {
    slug: 'equipos-y-accesorios',
    name: 'Equipos y accesorios',
    description: 'Monturas, frenos, mantas y todo tipo de equipamiento',
    icon: 'Package',
    order_index: 2
  },
  {
    slug: 'servicios',
    name: 'Servicios',
    description: 'Veterinarios, herradores, entrenadores y otros servicios',
    icon: 'Users',
    order_index: 3
  },
  {
    slug: 'transporte',
    name: 'Transporte',
    description: 'Remolques, camiones y servicios de transporte equino',
    icon: 'Truck',
    order_index: 4
  },
  {
    slug: 'inmuebles-ecuestres',
    name: 'Inmuebles ecuestres',
    description: 'Fincas, establos, arenas y propiedades con instalaciones',
    icon: 'Home',
    order_index: 5
  },
  {
    slug: 'otros',
    name: 'Otros',
    description: 'Todo lo relacionado con el mundo ecuestre',
    icon: 'MoreHorizontal',
    order_index: 6
  }
]

export const USER_LEVELS = [
  {
    level: 1,
    name: 'Novato',
    min_points: 0,
    max_points: 99,
    color: '#9CA3AF',
    benefits: ['Participación básica en foros', 'Subir 1 imagen por caballo']
  },
  {
    level: 2,
    name: 'Aficionado',
    min_points: 100,
    max_points: 499,
    color: '#10B981',
    benefits: ['Crear hilos en foros', 'Subir 3 imágenes por caballo', 'Comentar en marketplace']
  },
  {
    level: 3,
    name: 'Experto',
    min_points: 500,
    max_points: 1999,
    color: '#3B82F6',
    benefits: ['Publicar en marketplace', 'Subir 5 imágenes por caballo', 'Marcar favoritos']
  },
  {
    level: 4,
    name: 'Maestro',
    min_points: 2000,
    max_points: 4999,
    color: '#8B5CF6',
    benefits: ['Anuncios destacados', 'Subir 10 imágenes', 'Contacto prioritario']
  },
  {
    level: 5,
    name: 'Leyenda',
    min_points: 5000,
    color: '#E6B31E',
    benefits: ['Todos los beneficios', 'Badge exclusivo', 'Moderación básica']
  }
]

export const BADGE_TYPES = [
  {
    type: 'first_post',
    name: 'Primer Paso',
    description: 'Publicaste tu primer mensaje',
    icon: 'MessageCircle',
    points: 10
  },
  {
    type: 'first_horse',
    name: 'Hall of Fame',
    description: 'Agregaste tu primer caballo al Hall of Fame',
    icon: 'Trophy',
    points: 50
  },
  {
    type: 'first_ad',
    name: 'Comerciante',
    description: 'Publicaste tu primer anuncio',
    icon: 'ShoppingCart',
    points: 25
  },
  {
    type: 'social_butterfly',
    name: 'Mariposa Social',
    description: '100 likes recibidos',
    icon: 'Heart',
    points: 100
  },
  {
    type: 'active_member',
    name: 'Miembro Activo',
    description: '30 días consecutivos de actividad',
    icon: 'Calendar',
    points: 200
  },
  {
    type: 'horse_expert',
    name: 'Experto Equino',
    description: '10 caballos en Hall of Fame',
    icon: 'Star',
    points: 500
  }
]

export const REPUTATION_POINTS = {
  THREAD_CREATED: 5,
  REPLY_POSTED: 2,
  LIKE_RECEIVED: 1,
  LIKE_GIVEN: 0.5,
  HORSE_SUBMITTED: 20,
  AD_PUBLISHED: 10,
  MEDIA_UPLOADED: 3,
  PROFILE_COMPLETED: 25,
  ALBUM_CREATED: 15,
  POLL_CREATED: 5,
  POLL_VOTED: 1,
  MEDIA_RATED: 1,
  FAQ_HELPFUL: 2
}

export const FAQ_CATEGORIES = [
  {
    slug: 'primeros-pasos',
    name: 'Primeros pasos',
    description: 'Todo lo que necesitas saber para comenzar en la comunidad',
    icon: 'Play',
    order_index: 1
  },
  {
    slug: 'foros-y-discusiones',
    name: 'Foros y discusiones',
    description: 'Cómo participar en los foros y crear discusiones',
    icon: 'MessageSquare',
    order_index: 2
  },
  {
    slug: 'hall-of-fame',
    name: 'Hall of Fame',
    description: 'Guía para agregar y gestionar ejemplares',
    icon: 'Trophy',
    order_index: 3
  },
  {
    slug: 'marketplace',
    name: 'Marketplace',
    description: 'Cómo comprar y vender en el mercado ecuestre',
    icon: 'ShoppingCart',
    order_index: 4
  },
  {
    slug: 'galeria-multimedia',
    name: 'Galería multimedia',
    description: 'Subir imágenes, videos y crear álbumes',
    icon: 'Image',
    order_index: 5
  },
  {
    slug: 'gamificacion',
    name: 'Sistema de puntos',
    description: 'Niveles, badges y rankings de la comunidad',
    icon: 'Award',
    order_index: 6
  },
  {
    slug: 'cuenta-y-perfil',
    name: 'Cuenta y perfil',
    description: 'Gestión de tu cuenta y configuración',
    icon: 'User',
    order_index: 7
  },
  {
    slug: 'soporte-tecnico',
    name: 'Soporte técnico',
    description: 'Problemas técnicos y soluciones',
    icon: 'Settings',
    order_index: 8
  }
]

export const SEARCH_TYPES = [
  { value: 'all', label: 'Todo el contenido' },
  { value: 'threads', label: 'Temas del foro' },
  { value: 'replies', label: 'Respuestas' },
  { value: 'horses', label: 'Caballos (Hall of Fame)' },
  { value: 'ads', label: 'Anuncios del marketplace' },
  { value: 'media', label: 'Fotos y videos' }
]

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Más relevante' },
  { value: 'date', label: 'Más reciente' },
  { value: 'popularity', label: 'Más popular' },
  { value: 'rating', label: 'Mejor valorado' }
]

export const MEDIA_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  VIDEO: ['mp4', 'webm', 'ogg', 'mov']
}

export const POLL_LIMITS = {
  MAX_OPTIONS: 10,
  MIN_OPTIONS: 2,
  MAX_QUESTION_LENGTH: 200,
  MAX_OPTION_LENGTH: 100
}
