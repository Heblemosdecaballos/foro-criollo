"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const MOD_EMAIL = process.env.FORUM_MOD_EMAIL || "";

export async function addCommentAction(formData: FormData) {
  const supabase = supabaseServer();
  const thread_id = (formData.get("thread_id") as string) || "";
  const content = (formData.get("content") as string)?.trim() || "";

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Debes iniciar sesión para responder." };
  if (!thread_id || !content) return { ok: false, message: "Contenido obligatorio." };

  const { error } = await supabase.from("posts").insert({ thread_id, content, author_id: user.id });
  if (error) return { ok: false, message: "No se pudo publicar." };

  revalidatePath(`/foros`);
  return { ok: true };
}

export async function editThreadAction(formData: FormData) {
  const supabase = supabaseServer();
  const thread_id = (formData.get("thread_id") as string) || "";
  const title = (formData.get("title") as string)?.trim() || "";
  const content = (formData.get("content") as string)?.trim() || "";

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "No autenticado." };
  if (!thread_id || !title || !content) return { ok: false, message: "Campos obligatorios." };

  const { error } = await supabase.from("threads").update({ title, content }).eq("id", thread_id);
  if (error) return { ok: false, message: "No se pudo guardar." };

  revalidatePath(`/foros`);
  return { ok: true };
}

export async function deleteThreadAction(formData: FormData) {
  const supabase = supabaseServer();
  const thread_id = (formData.get("thread_id") as string) || "";

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "No autenticado." };
  if (!thread_id) return { ok: false, message: "Falta thread_id." };

  const { error } = await supabase.from("threads").update({ is_deleted: true }).eq("id", thread_id);
  if (error) return { ok: false, message: "No se pudo eliminar." };

  revalidatePath(`/foros`);
  return { ok: true, redirectTo: `/foros` };
}

export async function reportContentAction(formData: FormData) {
  const supabase = supabaseServer();
  const target_type = (formData.get("target_type") as "thread" | "post") || "thread";
  const target_id = (formData.get("target_id") as string) || "";
  const reason = (formData.get("reason") as string)?.trim() || "";

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "No autenticado." };
  if (!target_id || !reason) return { ok: false, message: "Motivo requerido." };

  const { error } = await supabase
    .from("forum_reports")
    .insert({ reporter_id: user.id, target_type, target_id, reason });

  if (error) return { ok: false, message: "No se pudo enviar el reporte." };

  // Email opcional a moderación
  if (resend && MOD_EMAIL) {
    try {
      await resend.emails.send({
        from: "Hablando de Caballos <noreply@tudominio.com>",
        to: [MOD_EMAIL],
        subject: `[Foro] Nuevo reporte: ${target_type}`,
        text: `Motivo: ${reason}\nTarget: ${target_type} (${target_id})\nReportado por: ${user.email || user.id}`,
      });
    } catch (_) {
      // no rompas el flujo por el email
    }
  }

  return { ok: true };
}

export async function editPostAction(formData: FormData) {
  const supabase = supabaseServer();
  const post_id = (formData.get("post_id") as string) || "";
  const content = (formData.get("content") as string)?.trim() || "";

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "No autenticado." };
  if (!post_id || !content) return { ok: false, message: "Contenido obligatorio." };

  const { error } = await supabase.from("posts").update({ content }).eq("id", post_id);
  if (error) return { ok: false, message: "No se pudo editar." };
  return { ok: true };
}

export async function deletePostAction(formData: FormData) {
  const supabase = supabaseServer();
  const post_id = (formData.get("post_id") as string) || "";

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "No autenticado." };
  if (!post_id) return { ok: false, message: "Falta post_id." };

  const { error } = await supabase.from("posts").update({ is_deleted: true }).eq("id", post_id);
  if (error) return { ok: false, message: "No se pudo eliminar." };
  return { ok: true };
}
