'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function SupabaseListener() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'SIGNED_OUT' ||
          event === 'USER_DELETED'
        ) {
          await fetch('/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event }),
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
