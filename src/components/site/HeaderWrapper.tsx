
import Header from "./Header";
import { supabaseServer } from "@/lib/supabase/server";

export default async function HeaderWrapper() {
  // Manejo seguro de autenticación con fallback
  let user = null;
  let authError = false;
  
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      user = data.user;
    }
  } catch (error) {
    console.log("Auth check failed in HeaderWrapper:", error instanceof Error ? error.message : "Unknown error");
    authError = true;
    // Continuar sin usuario autenticado
  }

  return <Header user={user} authError={authError} />;
}
