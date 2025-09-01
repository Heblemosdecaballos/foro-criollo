
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import BannerForm from "@/components/admin/BannerForm";

export const dynamic = "force-dynamic";

async function checkAdminAuth() {
  try {
    const supabase = supabaseServer();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (!user || error) {
      return null;
    }
    
    const isAdmin = user.email === process.env.HALL_ADMIN_EMAIL || 
                    user.email === 'admin@hablandodecaballos.com';
    
    return isAdmin ? user : null;
  } catch {
    return null;
  }
}

export default async function NewBannerPage() {
  const adminUser = await checkAdminAuth();
  
  if (!adminUser) {
    redirect("/login?return=/admin/banners/new");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Banner</h1>
        <p className="text-gray-600 mt-1">
          Configura un nuevo banner publicitario para la plataforma
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <BannerForm />
      </div>
    </div>
  );
}
