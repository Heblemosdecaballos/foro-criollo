"use client";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function LogoutButton() {
  const onClick = async () => {
    const supa = createSupabaseBrowserClient();
    await supa.auth.signOut();
    window.location.reload();
  };
  return (
    <button onClick={onClick} className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:opacity-90">
      Salir
    </button>
  );
}
