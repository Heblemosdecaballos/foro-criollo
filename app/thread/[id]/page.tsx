'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';

// ⚠️ Asegúrese de tener en .env.local:
// NEXT_PUBLIC_SUPABASE_URL=...
// NEXT_PUBLIC_SUPABASE_ANON_KEY=...
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnon);

type PostRow = {
  id: string;
  thread_id: string;
  body: string;
  created_at: string;
  author_id: string | null;
  author_username: string | null;
  is_hidden?: boolean;
  reports_count?: number | null;
};

export default function ThreadDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState<string>('Hilo');
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [cursor, setCursor] = useState<{ created_at: string; id: string } | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState('');
  const fetchingRef = useRef(false);

  // Moderación / anclado
  const [isMod, setIsMod] = useState(false);
  const [pinned, setPinned] = useState<PostRow | null>(null);

  // ─────────────────────────────
  // Helpers de datos
  // ─────────────────────────────
  async function checkMod() {
    try {
      const { data, error } = await supabase.rpc('is_moderator');
      if (!error) setIsMod(!!data);
    } catch {
      // silencioso
    }
  }

  async function loadMeta() {
    try {
      const { data, error } = await supabase
        .from('v_threads_compact')
        .select('titl
