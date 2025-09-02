
// Layout para páginas de administración
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

export default function AdminLayout({ children, title = 'Panel de Administración' }: AdminLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      // Verificar rol de administrador
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        router.push('/unauthorized');
        return;
      }

      setProfile(profile);
    } catch (err) {
      console.error('Error verificando autenticación:', err);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-800">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null; // El useEffect manejará la redirección
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg border-b border-amber-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-2xl font-bold text-amber-800">
                🐎 Admin Panel
              </Link>
              <span className="text-amber-600">|</span>
              <span className="text-amber-700">{title}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                👑 {profile.full_name}
              </span>
              <Link 
                href="/" 
                className="text-amber-600 hover:text-amber-800 transition-colors"
              >
                Ver Foro
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-amber-100 border-b border-amber-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center space-x-2 text-sm text-amber-700">
            <Link href="/admin" className="hover:text-amber-900">Inicio</Link>
            <span>›</span>
            <span>{title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
