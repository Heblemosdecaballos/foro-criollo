
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import BannerStatscard from "@/components/admin/BannerStatsCard";

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

export default async function BannerStatsPage() {
  const adminUser = await checkAdminAuth();
  
  if (!adminUser) {
    redirect("/login?return=/admin/banners/stats");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics de Banners</h1>
            <p className="text-gray-600 mt-1">
              Métricas detalladas de rendimiento de la publicidad
            </p>
          </div>
          <div className="flex gap-3">
            <select className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              📊 Exportar Reporte
            </button>
          </div>
        </div>
      </div>

      <BannerStatscard />
    </div>
  );
}
