// src/app/noticias/page.tsx
import { Card, CardBody } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NewsPage() {
  return (
    <div className="container py-10">
      <h1 className="font-serif text-4xl font-bold">📰 Noticias del Caballo Criollo</h1>
      <p className="text-brown-700/80 mt-1">Mantente informado sobre las últimas noticias del mundo ecuestre colombiano</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {[1,2,3].map((i)=>(
          <Card key={i}>
            <div className="h-40 bg-cream-100" />
            <CardBody>
              <Badge>Competencias</Badge>
              <h3 className="font-serif text-xl mt-2">Campeonato Nacional de Caballo Criollo Colombiano 2025</h3>
              <p className="text-brown-700/80 mt-1">
                El próximo mes se realizará el campeonato más importante del año…
              </p>
              <div className="flex items-center gap-4 text-sm text-brown-700/70 mt-3">
                <span>Redacción Hablando de Caballos</span>
                <span>• 23 de agosto de 2025</span>
                <span>❤️ 42</span>
                <span>💬 15</span>
              </div>
              <Link href="#" className="btn btn-ghost mt-3">Leer más →</Link>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
