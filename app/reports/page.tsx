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
  const [from, setFrom] = useState<string>(''); // ISO date (YYYY-MM-DD)
  const [to, setTo] = useState<string>('');

  async function checkMod() {
    try {
      const { data, error } = await supabase.rpc('is_moderator');
      if (error) throw error;
      setIsMod(!!data);
    } catch {
      setIsMod(false);
    }
  }

  // Construye filtros para Supabase
  function applyFilters(query: ReturnType<typeof supabase.from<any>>) {
    let qy = query;

    // Sólo posts con reportes (el reporte viene desde la vista)
    qy = qy.gte('reports_count', minReports);

    if (hidden === 'hidden') qy = qy.eq('is_hidden', true);
    if (hidden === 'visible') qy = qy.eq('is_hidden', false);

    if (q.trim()) {
      // Búsqueda básica en body y autor (OR)
      const text = q.trim();
      qy = qy.or(`body.ilike.%${text}%,author_username.ilike.%${text}%`);
    }

    if (from) qy = qy.gte('created_at', new Date(from).toISOString());
    if (to) {
      // incluir todo el día "to"
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
