// app/login/GoogleButton.tsx
'use client';

import { createSupabaseBrowser } from '@/utils/supabase/client';

export default function GoogleButton() {
  const supabase = createSupabaseBrowser();

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    });
  };

  return (
    <button onClick={handleGoogle} className="btn">
      Continuar con Google
    </button>
  );
}
