import type { Metadata } from 'next';
import { getSupabaseServerAnon } from '../../../lib/supabaseServerAnon';
import React from 'react';

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const supabase = getSupabaseServerAnon();

  // Título del hilo
  const { data: th } = await supabase
    .from('v_threads_compact')
    .select('title')
    .eq('id', params.id)
    .maybeSingle();

  // Primer post para description (si existe)
  const { data: fp } = await supabase
    .from('v_posts_with_author')
    .select('body')
    .eq('thread_id', params.id)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  const title = th?.title ? `${th.title} — Hablemos de Caballos` : 'Hilo — Hablemos de Caballos';
  const desc =
    (fp?.body || '')
      .replace(/\s+/g, ' ')
      .slice(0, 160) || 'Participa en el hilo del foro.';

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://foro-criollo.vercel.app';
  const url = `${base}/threads/${params.id}`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url,
      siteName: 'Hablemos de Caballos',
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description: desc,
    },
    alternates: { canonical: url },
  };
}

// Layout simple que envuelve la page cliente
export default function ThreadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
