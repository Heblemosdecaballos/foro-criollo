// src/app/foros/nuevo/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/src/lib/supabase/server";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createThreadAction(formData: FormData) {
  const supabase = createSupabaseServer();

  // 1) Auth obligatoria
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/foros/nuevo");

  // 2) Campos del formulario
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "").trim(); // general, entrenamiento, etc.
  const content = String(formData.get("content") || "").trim();
  const tagsRaw = String(formData.get("tags") || "").trim();      // csv
  const visibility = String(formData.get("visibility") || "public"); // public | private
  const file = formData.get("cover") as File | null;

  if (!title || !content) {
    redirect("/foros/nuevo?error=" + encodeURIComponent("Título y contenido son obligatorios."));
  }

  const tags = tagsRaw
    ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean)
    : [];

  const slugBase = slugify(title);
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  // 3) Subir imagen (opcional)
  let cover_url: string | null = null;
  if (file && file.size > 0) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${user.id}/${Date.now()}-${slug}.${ext}`;

    // Nota: el bucket debe existir y permitir lectura pública
    const { error: upErr } = await supabase.storage.from("forum").upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (upErr) {
      redirect("/foros/nuevo?error=" + encodeURIComponent("No se pudo subir la imagen: " + upErr.message));
    }
    const { data: pub } = supabase.storage.from("forum").getPublicUrl(path);
    cover_url = pub.publicUrl;
  }

  // 4) Insertar en la tabla (ajusta nombre de tabla/columnas si difiere)
  const author_name =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.email ? user.email.split("@")[0] : "usuario");

  const { error: insErr } = await supabase.from("threads").insert({
    title,
    slug,
    content,
    category,
    tags,              // si tu columna es text[] en Postgres, déjalo así; si es text, guarda tagsRaw
    visibility,
    cover_url,
    author_id: user.id,
    author_name,
  });

  if (insErr) {
    redirect("/foros/nuevo?error=" + encodeURIComponent("Error al crear el foro: " + insErr.message));
  }

  // 5) Ir al detalle (si ya tienes /foros/[slug]) o de vuelta al listado
  redirect(`/foros/${slug}`);
}
