
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
  PROFILE_COMPLETED: 25
}
