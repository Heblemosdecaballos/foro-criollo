'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ReportedPost = {
  id: string;
  thread_id: string;
  body: string;
  created_at: string;
  author_id: string | null;
  author_username: string | null;
  is_hidden?: boolean;
  reports_count?: number | null;
};

type Cursor = { created_at: string; id: string } | null;

export default function ReportsPage() {
  const [isMod, setIsMod] = useState<boolean | null>(null);
  const [items, setItems] = useState<ReportedPost[]>([]);
  const [cursor, setCursor] = useState<Cursor>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const fetchingRef = useRef(false);

  // Filtros
  const [q, setQ] = useState('');
  const [hidden, setHidden] = useState<'all' | 'hidden' | 'visible'>('all');
  const [minReports, setMinReports] = useState(1);
  const [from, setFrom] = useState<string>(''); // YYYY-MM-DD
  const [to, setTo] = useState<string>('');     // YYYY-MM-DD

  async function checkMod() {
    try {
      const { data, error } = await supabase.rpc('is_moderator');
      if (error) throw error;
      setIsMod(!!data);
    } catch {
      setIsMod(false);
    }
  }

  // Construye filtros para Supabase — tipado laxo para evitar conflicto TS
  function applyFilters(query: any): any {
    let qy = query;

    // Sólo posts con reportes (desde la vista)
    qy = qy.gte('reports_count', minReports);

    if (hidden === 'hidden') qy = qy.eq('is_hidden', true);
    if (hidden === 'visible') qy = qy.eq('is_hidden', false);

    if (q.trim()) {
      const text = q.trim();
      // OR en body o autor
      qy = qy.or(`body.ilike.%${text}%,author_username.ilike.%${text}%`);
    }

    if (from) qy = qy.gte('created_at', new Date(from).toISOString());
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      qy = qy.lte('created_at', end.toISOString());
    }

    return qy;
  }

  async function fetchPage(useCursor: boolean) {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      let qy: any = supabase
        .from('v_posts_with_author')
        .select('*')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(30);

      qy = applyFilters(qy);

      if (useCursor && cursor) {
        qy = qy.lt('created_at', cursor.created_at)
               .or(`created_at.eq.${cursor.created_at},id.lt.${cursor.id}`);
      }

      const { data, error } = await qy;
      if (error) throw error;

      const list = (data ?? []) as ReportedPost[];
      const next: Cursor = list.length
        ? { created_at: list[list.length - 1].created_at, id: list[list.length - 1].id }
        : null;

      setItems(prev => (useCursor ? [...prev, ...list] : list));
      setCursor(next);
      setInitialized(true);
    } catch (e: any) {
      console.error('Error listando reportes:', e?.message || e);
      alert('No se pudieron cargar los reportes. Intenta nuevamente.');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }

  // Acciones (vía handlers server-side ya creados)
  async function toggleHide(postId: string, currentHidden?: boolean) {
    const res = await fetch('/api/moderate-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, hidden: !currentHidden }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || 'Acción no permitida.');
      return;
    }
    await fetchPage(false);
  }

  async function pinPost(threadId: string, postId: string) {
    const res = await fetch('/api/pin-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, postId }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || 'No se pudo anclar.');
      return;
    }
    alert('Post anclado.');
  }

  async function unpinThread(threadId: string) {
    const res = await fetch('/api/unpin-thread', {
      method: 'POST',
      headers
