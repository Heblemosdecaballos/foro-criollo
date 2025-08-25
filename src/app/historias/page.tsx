// src/app/historias/page.tsx
import { Card, CardBody } from "@/src/components/ui/Card";
import Link from "next/link";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HistoriasPage() {
  return (
    <div className="container py-10">
      <h1 className="font-serif text-4xl font-bold">📚 Historias del Caballo Criollo</h1>
      <p className="text-brown-700/80 mt-1">Experiencias reales, tradiciones familiares y aventuras…</p>
      <Card className="mt-6">
        <div className="h-48 bg-cream-100" />
        <CardBody>
          <div className="flex items-center gap-3">
            <span className="badge bg-cream-200">Historia Destacada</span>
            <span className="text-sm text-brown-700/70">📖 5 min</span>
          </div>
          <h3 className="font-serif text-2xl mt-2">Mi Primer Caballo Criollo: Una Historia de Amor</h3>
          <p className="text-brown-700/80 mt-1">
            Nunca olvidaré el día que conocí a Marengo…
          </p>
          <div className="text-sm text-brown-700/70 mt-3">
            María Elena Rodríguez • 22 de agosto de 2025
          </div>
          <Link href="#" className="btn btn-ghost mt-3">Leer Historia Completa</Link>
        </CardBody>
      </Card>
    </div>
  );
}
