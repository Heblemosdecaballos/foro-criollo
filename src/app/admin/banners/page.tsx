
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BannerAdminTable from "@/components/admin/BannerAdminTable";

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

export default async function AdminBannersPage() {
  const adminUser = await checkAdminAuth();
  
  if (!adminUser) {
    redirect("/login?return=/admin/banners");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Banners</h1>
            <p className="text-gray-600 mt-1">
              Gestiona los banners publicitarios de la plataforma
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/admin/banners/new"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              + Crear Banner
            </Link>
            <Link 
              href="/admin/banners/stats"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📊 Estadísticas
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="text-2xl">📊</div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Banners Activos</div>
              <div className="text-2xl font-bold text-gray-900">5</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="text-2xl">👁️</div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Impresiones (7d)</div>
              <div className="text-2xl font-bold text-gray-900">15.4K</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="text-2xl">👆</div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Clicks (7d)</div>
              <div className="text-2xl font-bold text-gray-900">342</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <div className="text-2xl">💰</div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Ingresos (7d)</div>
              <div className="text-2xl font-bold text-gray-900">$127.50</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Banners */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Banners Registrados</h3>
        </div>
        <BannerAdminTable />
      </div>
    </div>
  );
}
