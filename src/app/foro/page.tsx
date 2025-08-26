// src/app/foros/page.tsx
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* --- util: icono caballo (mismo PNG del logo) --- */
function IconHorse({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/horse.png"
      alt="Caballo"
      width={size}
      height={size}
      className={className}
      priority={false}
    />
  );
}

/* --- datos de ejemplo (puedes reemplazar luego por tu fetch a Supabase) --- */
const CATEGORIES = [
  { id: "todos", label: "Todos los Foros" },
  { id: "crianza", label: "Crianza y Genética" },
  { id: "entrenamiento", label: "Entrenamiento" },
  { id: "Ferias y festivales", label: "Ferias y festivales" },
  { id: "salud", label: "Salud Veterinaria" },
  { id: "historia", label: "Historia y Tradición" },
  { id: "comercial", label: "Comercialización" },
  { id: "general", label: "General" },
];

type Forum = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  lastActivity: string; // “Hace 2 horas”, etc.
  posts: number;
  members?: number;
  badge?: string;
};

const FORUMS: Forum[] = [
  {
    id: "general-discusion",
    title: "La Más Importante - Discusión General",
    excerpt:
      "El foro principal de nuestra comunidad donde hablamos de todo lo relacionado con caballos criollos colombianos. Comparte tus experiencias, haz preguntas y conecta con otros apasionados.",
    category: "general",
    author: "AdminHC",
    lastActivity: "Hace 2 horas",
    posts: 247,
    members: 89,
    badge: "General",
  },
  {
    id: "tecnicas-paso-fino",
    title: "Técnicas de Entrenamiento Paso Fino",
    excerpt:
      "Comparte y aprende técnicas específicas para el entrenamiento del paso fino colombiano. Desde fundamentos básicos hasta técnicas avanzadas.",
    category: "entrenamiento",
    author: "MaestroCarlos",
    lastActivity: "Hace 4 horas",
    posts: 156,
    members: 67,
    badge: "Entrenamiento",
  },
  {
    id: "doma-tradicional",
    title: "Técnicas de Doma Tradicional",
    excerpt:
      "Discusión sobre métodos tradicionales de doma del caballo criollo colombiano, técnicas ancestrales y enfoques modernos respetuosos.",
    category: "entrenamiento",
    author: "admin",
    lastActivity: "Ayer",
    posts: 0,
    members: 0,
    badge: "Entrenamiento",
  },
  {
    id: "bienvenidos-hablando",
    title: "Bienvenidos a Hablando de Caballos",
    excerpt:
      "Espacio de bienvenida para nuevos miembros de nuestra comunidad del caballo criollo colombiano. Preséntate y conoce a otros.",
    category: "historia",
    author: "admin",
    lastActivity: "Hoy",
    posts: 1,
    members: 0,
    badge: "Historia",
  },
  {
    id: "nutricion-equina",
    title: "Nutrición Equina Especializada",
    excerpt:
      "Consejos sobre alimentación específica para caballos criollos colombianos, suplementos y dietas según la actividad.",
    category: "salud",
    author: "admin",
    lastActivity: "Reciente",
    posts: 0,
    members: 0,
    badge: "Salud",
  },
  {
    id: "competencias-2025",
    title: "Competencias Paso Fino 2025",
    excerpt:
      "Calendario de competencias, eventos y exposiciones de paso fino para el año 2025. Compartamos información sobre fechas y lugares.",
    category: "competencias",
    author: "admin",
    lastActivity: "Reciente",
    posts: 0,
    members: 0,
    badge: "Competencias",
  },
];

/* --- chip reutilizable --- */
function Chip({
  active,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm",
        active
          ? "bg-olive-600 text-white border-olive-600"
          : "bg-white text-brown-700 border-brown-700/20 hover:bg-cream-100",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

/* --- tarjeta de foro --- */
function ForumCard({ f }: { f: Forum }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition border border-neutral-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-brown-700/70 mb-1">
            {f.badge ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-olive-600/15 text-olive-700 px-2.5 py-1 text-xs">
                {f.badge}
              </span>
            ) : null}
          </div>
          <Link
            href={`/foros/${f.id}`}
            className="font-serif text-brown-800 text-lg leading-snug hover:underline block"
          >
            {f.title}
          </Link>
          <p className="text-brown-700/80 mt-1 line-clamp-2">{f.excerpt}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-brown-700/70">
            <span>
              Por <span className="font-medium">{f.author}</span>
            </span>
            <span>•</span>
            <span>{f.lastActivity}</span>
            <span className="ml-auto">{f.posts} publicaciones</span>
            {typeof f.members === "number" ? (
              <>
                <span>•</span>
                <span>{f.members} miembros</span>
              </>
            ) : null}
          </div>
        </div>

        {/* avatar/símbolo */}
        <div className="shrink-0">
          <IconHorse size={28} />
        </div>
      </div>
    </div>
  );
}

export default function ForosPage() {
  return (
    <>
      {/* HERO de Foros (franja café) */}
      <section className="hero-cafe text-white">
        <div className="container py-10 md:py-12">
          <div className="flex items-center gap-3">
            <IconHorse size={32} />
            <h1 className="font-serif text-3xl md:text-4xl font-bold">
              Foros de Discusión
            </h1>
          </div>
          <p className="mt-3 text-white/90 max-w-3xl">
            Conecta con la comunidad ecuestre más grande de Colombia
          </p>
        </div>
      </section>

      {/* Filtros / Categorías */}
      <section className="container py-6">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c, idx) => (
            <button key={c.id} className="ui-chip ui-chip--muted">
              {/* Solo el primero “Todos los Foros” activo en esta versión estática */}
              <span className={idx === 0 ? "ui-chip--active" : ""}>
                {idx === 0 ? <Chip active>{c.label}</Chip> : <>{c.label}</>}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Lista de foros destacados */}
      <section className="container grid grid-cols-1 gap-5">
        {/* Primer bloque “grande” como en la captura */}
        <ForumCard f={FORUMS[0]} />
        <ForumCard f={FORUMS[1]} />

        {/* Dos tarjetas pequeñas lado a lado (md:grid para columnas) */}
        <div className="grid md:grid-cols-2 gap-5">
          <ForumCard f={FORUMS[2]} />
          <ForumCard f={FORUMS[3]} />
        </div>

        {/* Título sección “Foros Activos” + botón verde */}
        <div className="text-center mt-6">
          <h2 className="font-serif text-xl text-brown-800">Foros Activos</h2>
          <p className="text-brown-700/80 mt-1">
            Únete a las conversaciones más populares de nuestra comunidad
          </p>
          <Link href="/foros/crear" className="btn btn-olive mt-4 inline-flex">
            + Crear Nuevo Foro
          </Link>
        </div>

        {/* Tres tarjetas horizontales (como en la segunda fila de tu captura) */}
        <div className="grid md:grid-cols-2 gap-5 mt-4">
          <ForumCard f={FORUMS[4]} />
          <ForumCard f={FORUMS[5]} />
        </div>
      </section>
    </>
  );
}
