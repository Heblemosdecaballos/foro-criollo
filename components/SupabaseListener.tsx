// components/SupabaseListener.tsx
'use client';

import { useEffect } from 'react';
import { createSupabaseBrowser } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SupabaseListener() {
  const supabase = createSupabaseBrowser();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, _session) => {
      // Cuando cambie el estado de auth, refrescamos la UI
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return null;
}
