"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

async function assertModerator() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isMod: false };

  const { data: me } = await supabase
    .from("profiles")
    .select("is_moderator")
    .eq("id", user.id)
    .single();

  return { supabase, user, isMod: !!me?.is_moderator };
}

export async function updateReportStatusAction(formData: FormData) {
  const { supabase, isMod } = await assertModerator();
  if (!isMod) return { ok: false, message: "No autorizado" };

  const report_id = (formData.get("report_id") as string) || "";
  const status = (formData.get("status") as string) || "open";
  const valid = ["open", "reviewing", "resolved", "dismissed"];
  if (!report_id || !valid.includes(status)) return { ok: false, message: "Datos inválidos" };

  const { error } = await supabase
    .from("forum_reports")
    .update({ status })
    .eq("id", report_id);

  if (error) return { ok: false, message: "No se pudo actualizar" };

  revalidatePath("/foros/moderacion");
  return { ok: true };
}

export async function moderateThreadAction(formData: FormData) {
  const { supabase, isMod } = await assertModerator();
  if (!isMod) return { ok: false, message: "No autorizado" };

  const thread_id = (formData.get("thread_id") as string) || "";
  const hide = (formData.get("hide") as string) === "true";
  if (!thread_id) return { ok: false, message: "Falta thread_id" };

  const { error } = await supabase
    .from("threads")
    .update({ is_deleted: hide })
    .eq("id", thread_id);

  if (error) return { ok: false, message: "No se pudo aplicar la acción" };

  revalidatePath("/foros/moderacion");
  return { ok: true };
}

export async function moderatePostAction(formData: FormData) {
  const { supabase, isMod } = await assertModerator();
  if (!isMod) return { ok: false, message: "No autorizado" };

  const post_id = (formData.get("post_id") as string) || "";
  const hide = (formData.get("hide") as string) === "true";
  if (!post_id) return { ok: false, message: "Falta post_id" };

  const { error } = await supabase
    .from("posts")
    .update({ is_deleted: hide })
    .eq("id", post_id);

  if (error) return { ok: false, message: "No se pudo aplicar la acción" };

  revalidatePath("/foros/moderacion");
  return { ok: true };
}
