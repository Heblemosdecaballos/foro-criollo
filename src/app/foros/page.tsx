import Link from "next/link";
import Image from "next/image";
import { supabaseServer } from "@/lib/supabase/server";
import ThreadCard from "./_components/ThreadCard";
import SidebarLayout from "@/components/layouts/SidebarLayout";
import { BannerSlot } from "@/components/ads";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { 
  MessageSquare, 
  Plus, 
  TrendingUp, 
  Users,
  Clock,
  Eye,
  ChevronRight,
  Filter,
  Search
} from "lucide-react";

type ThreadRow = {
  id: string;
  slug: string | null;
  title: string;
  content: string;
  created_at: string;
  author_id: string | null;
  views: number;
  posts_count: number;
};

// Categorías populares con iconos
const POPULAR_CATEGORIES = [
  {
    title: "Entrenamiento Básico",
    description: "Fundamentos y técnicas",
    icon: "🏇",
    count: "234 temas",
    href: "/foros/categoria/entrenamiento"
  },
  {
    title: "Crianza y Reproducción", 
    description: "Genética y mejoramiento",
    icon: "🐎",
    count: "156 temas",
    href: "/foros/categoria/crianza"
  },
  {
    title: "Competencias",
    description: "Torneos y eventos",
    icon: "🏆",
    count: "89 temas", 
    href: "/foros/categoria/competencias"
  },
  {
    title: "Salud Equina",
    description: "Veterinaria especializada",
    icon: "⚕️",
    count: "178 temas",
    href: "/foros/categoria/salud"
  },
  {
    title: "Andares Criollos",
    description: "Paso fino y trocha",
    icon: "✨",
    count: "267 temas",
    href: "/foros/categoria/andares"
  },
  {
    title: "Equipamiento",
    description: "Monturas y accesorios",
    icon: "🏇",
    count: "134 temas",
    href: "/foros/categoria/equipamiento"
  }
];

// Estadísticas del foro
const FORUM_STATS = [
  { label: "Temas Activos", value: "1,234", icon: MessageSquare },
  { label: "Miembros", value: "15,847", icon: Users },
  { label: "Respuestas Hoy", value: "89", icon: TrendingUp },
];

export default async function ForosPage() {
  const supabase = supabaseServer();

  let threads: ThreadRow[] = [];
  let authError = false;

  try {
    const { data, error } = await supabase
      .from("threads")
      .select("id, slug, title, content, created_at, author_id, views, posts_count")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(20);
    
    if (!error && data) {
      threads = data;
    }
  } catch (error) {
    console.log("Error loading threads:", error);
    authError = true;
  }

  // Obtener perfiles de autores de forma segura
  const authorIds = Array.from(new Set(threads.map(t => t.author_id).filter(Boolean))) as string[];
  const profilesMap = new Map<string, any>();
  
  if (authorIds.length > 0) {
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", authorIds);
      for (const p of profiles ?? []) profilesMap.set(p.id, p);
    } catch (error) {
      console.log("Error loading profiles:", error);
    }
  }

  const sidebarContent = (
    <div className="space-y-6">
      {/* Estadísticas del foro */}
      <Card variant="hero">
        <CardHeader title="📊 Estadísticas del Foro" />
        <CardBody>
          <div className="space-y-4">
            {FORUM_STATS.map((stat, index) => (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <stat.icon className="w-4 h-4 text-primary-brown" />
                  <span className="text-sm text-warm-gray-600">{stat.label}</span>
                </div>
                <span className="font-bold text-primary-brown">{stat.value}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Banner móvil de contenido en sidebar */}
      <div className="md:hidden flex justify-center">
        <BannerSlot slot="content-mobile" />
      </div>
    </div>
  );

  return (
    <>
      {/* Hero Section del Foro */}
      <section className="gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Triple-Spiral-Symbol.svg/1097px-Triple-Spiral-Symbol.svg.png fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        <div className="container-unified py-12 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-8 h-8" />
                <h1 className="text-h1 font-display font-bold">
                  Foros de Discusión
                </h1>
              </div>
              <p className="text-white/90 text-body-lg mb-6 max-w-2xl">
                Únete a miles de jinetes, criadores y amantes de los caballos criollos. 
                Comparte conocimientos, resuelve dudas y conecta con la comunidad.
              </p>
              
              {/* Estadísticas rápidas */}
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>{threads?.length || 0} temas activos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>15,847 miembros</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Actualizado hoy</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 text-center lg:text-right">
              <Link href="/foros/nuevo" className="btn-accent inline-flex items-center gap-2 text-lg px-8 py-4">
                <Plus className="w-5 h-5" />
                Crear Nuevo Foro
              </Link>
              <p className="text-white/70 text-sm mt-2">
                Comparte tu experiencia con la comunidad
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <SidebarLayout sidebarContent={sidebarContent}>
        <div className="space-y-8">
          
          {/* Categorías populares */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h2 font-display font-semibold text-warm-gray-900">
                Categorías Populares
              </h2>
              <Link href="/foros/categorias" className="btn-ghost">
                Ver todas
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {POPULAR_CATEGORIES.map((category, index) => (
                <Card 
                  key={category.title} 
                  className="hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardBody>
                    <Link href={category.href} className="block">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{category.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-warm-gray-900 mb-1">
                            {category.title}
                          </h3>
                          <p className="text-sm text-warm-gray-600 mb-2">
                            {category.description}
                          </p>
                          <span className="text-xs text-primary-brown font-medium">
                            {category.count}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          {/* Lista de foros activos */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h2 font-display font-semibold text-warm-gray-900">
                Discusiones Recientes
              </h2>
              <div className="flex items-center gap-2">
                <button className="btn-ghost">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </button>
                <button className="btn-ghost">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </button>
              </div>
            </div>

            {authError && (
              <Card variant="glass" className="mb-6">
                <CardBody>
                  <div className="text-center py-4">
                    <div className="text-warning-yellow text-4xl mb-2">⚠️</div>
                    <h3 className="font-semibold text-lg mb-2">Configuración Pendiente</h3>
                    <p className="text-warm-gray-600">
                      La base de datos está en configuración. Los foros estarán disponibles pronto.
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}

            <div className="space-y-4">
              {threads?.map((thread: ThreadRow, index: number) => (
                <div 
                  key={thread.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ThreadCard 
                    thread={thread} 
                    profile={profilesMap.get(thread.author_id ?? "")} 
                  />
                </div>
              ))}
            </div>
            
            {(!threads || threads.length === 0) && !authError && (
              <Card variant="hero" className="text-center animate-fade-in-up">
                <CardBody padding="xl">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-h3 font-display font-semibold text-warm-gray-900 mb-3">
                    ¡Sé el primero en crear un foro!
                  </h3>
                  <p className="text-warm-gray-600 mb-6 max-w-md mx-auto">
                    La comunidad está esperando tu primera contribución. Comparte tu conocimiento y experiencia con otros entusiastas de los caballos.
                  </p>
                  <Link href="/foros/nuevo" className="btn-primary">
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Primer Foro
                  </Link>
                </CardBody>
              </Card>
            )}

            {threads && threads.length > 0 && (
              <div className="text-center mt-8">
                <Link href="/foros/todas" className="btn-secondary">
                  Ver Más Foros
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </SidebarLayout>
    </>
  );
}
