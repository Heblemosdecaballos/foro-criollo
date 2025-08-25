// src/app/hall/page.tsx
import Chip from "@/src/components/ui/Chip";
import Alert from "@/src/components/ui/Alert";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CATS = [
  { key: "all", label: "Todas" },
  { key: "trocha-galope", label: "Trocha y Galope" },
  { key: "trote-galope", label: "Trote y Galope" },
  { key: "trocha", label: "Trocha Colombiana" },
  { key: "paso-fino", label: "Paso Fino Colombiano" },
];

export default async function HallLanding() {
  // aquí iría tu fetch real; para el layout clonamos la UI
  const error = false; // muestra la caja rosa si lo pones true

  return (
    <div className="container py-10">
      <h1 className="font-serif text-4xl font-bold flex items-center gap-2">
        <span>🏆</span> Hall of Fame
      </h1>
      <p className="mt-2 text-brown-700/80 max-w-2xl">
        Un reconocimiento a los ejemplares que han hecho grande la historia del Caballo Criollo Colombiano
      </p>

      {/* Filtros + Orden */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {CATS.map((c, i) => (
          <Chip key={c.key} active={i===0}>{c.label}</Chip>
        ))}
        <div className="ml-auto">
          <label className="text-sm mr-2">Ordenar por</label>
          <select className="ui-chip ui-chip--muted">
            <option>Más Recientes</option>
            <option>Más Votados</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="mt-6">
          <Alert
            title="Error al cargar contenido"
            message={`Unexpected token '<', "<!doctype "... is not valid JSON`}
          />
        </div>
      ) : null}

      {/* Grid de tarjetas demo (idéntico estilo a tus cards) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map((i) => (
          <div key={i} className="card">
            <div className="h-48 bg-white grid place-items-center text-brown-700/40">
              {/* placeholder de imagen/video */}
              <div className="text-5xl">🖼️</div>
            </div>
            <div className="card-body">
              <div className="text-sm text-brown-700/70 mb-2">Trocha y Galope</div>
              <div className="font-serif text-lg">Campeón de Trocha y Galope</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
