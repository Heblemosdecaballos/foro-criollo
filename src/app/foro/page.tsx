// src/app/foros/page.tsx
import { Card, CardBody } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TAGS = ["Todos los Foros","Crianza y Genética","Entrenamiento","🏆 Competencias","🪴 Salud Veterinaria","📜 Historia y Tradición","💰 Comercialización","💬 General"];

export default function ForosPage() {
  return (
    <div className="container py-10">
      <h1 className="font-serif text-4xl font-bold text-center">💬 Foros de Discusión</h1>
      <p className="text-center text-brown-700/80 mt-1">
        Conecta con la comunidad ecuestre más grande de Colombia
      </p>

      <div className="mt-5 flex flex-wrap gap-2 justify-center">
        {TAGS.map((t,i)=>(
          <span key={t} className={`ui-chip ${i===0 ? "ui-chip--active" : "ui-chip--muted"}`}>{t}</span>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        {[1,2].map((i)=>(
          <Card key={i}>
            <CardBody className="flex items-start gap-4">
              <div className="text-rose-600 text-lg">📌</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-serif font-semibold">La Más Importante - Discusión General</div>
                  <Badge className="ml-2">General</Badge>
                </div>
                <p className="text-brown-700/80 mt-1">
                  El foro principal… comparte tus experiencias, haz preguntas y conecta con otros apasionados.
                </p>
                <div className="text-xs text-brown-700/70 mt-2">Creado por <b>AdminHC</b> • 26 jul 2025</div>
              </div>
              <div className="text-right min-w-[120px]">
                <div className="text-sm">247 Publicaciones</div>
                <div className="text-sm">89 Miembros</div>
                <Link href="#" className="btn btn-ghost mt-2">Ver Foro</Link>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link href="#" className="btn btn-olive">+ Crear Nuevo Foro</Link>
      </div>
    </div>
  );
}
