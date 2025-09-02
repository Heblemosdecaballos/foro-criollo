
// Hook personalizado para verificar permisos de administrador
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

interface UseAdminReturn {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export function useAdmin(): UseAdminReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }

      if (!user) {
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(user);

      // Obtener perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(profile);
    } catch (err: any) {
      setError(err.message || 'Error verificando autenticación');
      console.error('Error en useAdmin:', err);
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = profile?.role === 'admin';

  return {
    user,
    profile,
    isAdmin,
    loading,
    error
  };
}
