// src/components/ThreadCard.tsx
import { MessageSquare, Users, Flame, CalendarDays, Tag } from "lucide-react";
import { AvatarText } from "./UI";
import {
  CATEGORIES,
  getCategory,
  getCategoryLabel,
  type CategoryDef,
} from "@/lib/utils";

export type Thread = {
  id: string;
  title: string;
  excerpt?: string | null;
  category?: string | null; // key o slug (ej: "competencias")
  posts?: number;
  members?: number;
  lastActivity?: string; // texto legible (ej: "Hace 2 horas")
  authorName?: string;
};

export default function ThreadCard({ t }: { t: Thread }) {
  const cat: CategoryDef = getCategory(t.category) ?? CATEGORIES.general;
  const label = getCategoryLabel(t.category);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition border border-neutral-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cat.color} ${cat.bgColor}`}
            >
              <Tag className="w-3.5 h-3.5 mr-1.5" />
              {label}
            </span>
          </div>

          <h3 className="mt-2 font-serif text-lg leading-tight text-brown-700">
            {t.title}
          </h3>

          {t.excerpt ? (
            <p className="mt-1 text-sm text-brown-700/80 line-clamp-2">
              {t.excerpt}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-brown-700/70">
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              {(t.posts ?? 0).toLocaleString()} posts
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {(t.members ?? 0).toLocaleString()} seguidores
            </span>
            {t.lastActivity ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                Última actividad: {t.lastActivity}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              Activo
            </span>
          </div>
        </div>

        <div className="shrink-0">
          {/* Cambiado: usar `name` en lugar de `label` */}
          <AvatarText name={t.authorName ?? "admin"} />
        </div>
      </div>
    </div>
  );
}
