'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ThreadRow = {
  id: string;
  title: string;
  created_at: string;
  author_id: string | null;
  author_username: string | null;
  posts_count: number | null;
  last_post_by: string | null;
  last_post_at: string | null;
  has_pinned?: boolean | null;
  reports_count?: number | null;
};

export default function ThreadsPage() {
  const [items, setItems] = useState<ThreadRow[]>([]);
  const [cursor, setCursor] = useState<{ created_at: string; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [q, setQ] = useState('');
  const [title, setTitle] = useState('');
  const fetchingRef = useRef(false);

  async function ensureProfile(){ try{ await supabase.rpc('ensure_profile_min'); }catch{} }

  async function fetchPage(useCursor: boolean){
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try{
      let qy: any = supabase.from('v_threads_compact')
        .select('*')
        .order('created_at',{ascending:false})
        .order('id',{ascending:false})
        .limit(20);

      if (q.trim()) qy = qy.ilike('title', `%${q.trim()}%`);

      if (useCursor && cursor){
        qy = qy.lt('created_at', cursor.created_at)
               .or(`created_at.eq.${cursor.created_at},id.lt.${cursor.id}`);
      }

      const { data, error } = await qy;
      if (error) throw error;

      const list = (data ?? []) as ThreadRow[];
      const next = list.length ? {
        created_at: list[list.length-1].created_at,
        id: list[list.length-1].id
      } : null;

      setItems(prev => useCursor ? [...prev, ...list] : list);
      setCursor(next);
      setInitialized(true);
    }catch(e:any){
      console.error(e);
      alert('No se pudieron cargar los hilos.');
    }finally{
      setLoading(false);
      fetchingRef.current = false;
    }
  }

  async function createThread(){
    const clean = title.trim();
    if (!clean) return;
    setLoading(true);
    try{
      const { error } = await supabase.rpc('create_thread', { p_title: clean });
      if (error) throw error;
      setTitle('');
      await fetchPage(false);
    }catch(e:any){
      alert(e?.message || 'No se pudo crear el hilo.');
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{ ensureProfile(); fetchPage(false); },[]);
  useEffect(()=>{ fetchPage(false); },[q]);

  return (
    <main className="container-page py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="h1 font-cinzel">Hablemos de Caballos — Foros</h1>
        <p className="subtle">Busca por título, crea hilos y navega con paginación.</p>
      </header>

      <section className="section">
        <input
          className="input"
          placeholder="Buscar por título…"
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
      </section>

      <section className="flex gap-2 section">
        <input
          className="input"
          placeholder="Título del hilo…"
          value={title}
          onChange={e=>setTitle(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter') createThread(); }}
        />
        <button
          onClick={createThread}
          disabled={loading || !title.trim()}
          className="btn btn-primary disabled:opacity-50"
        >
          Publicar
        </button>
      </section>

      <ul className="space-y-4">
        {items.map(t=>{
          const rep = t.reports_count ?? 0;
          return (
            <li key={t.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <a href={`/threads/${t.id}`} className="font-medium hover:underline font-cinzel">
                  {t.title}
                </a>
                <div className="flex items-center gap-2">
                  {t.has_pinned ? (
                    <span className="text-xs px-2 py-1 rounded-full border"
                          style={{borderColor:'var(--brand-border)',background:'#FFF8E1',color:'#7A5A2F'}}>
                      📌 Anclado
                    </span>
                  ) : null}
                  {rep>0 ? (
                    <span className="text-xs px-2 py-1 rounded-full border"
                          style={{color:'#C63934',borderColor:'#F5B3B1',background:'#FDECEC'}}>
                      ⚠︎ {rep} reportes
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="text-sm subtle mt-1">
                por @{t.author_username ?? 'usuario'} • {new Date(t.created_at).toLocaleString()}
              </div>
              <div className="text-xs subtle mt-0.5">
                {(t.posts_count ?? 0)} respuestas
                {t.last_post_at ? <> • Última: @{t.last_post_by ?? 'usuario'} • {new Date(t.last_post_at).toLocaleString()}</> : null}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-center pt-2">
        <button
          onClick={()=>fetchPage(true)}
          disabled={loading || (initialized && cursor===null)}
          className="btn btn-primary disabled:opacity-50"
        >
          {loading ? 'Cargando…' : (initialized && cursor===null ? 'No hay más' : 'Cargar más')}
        </button>
      </div>
    </main>
  );
}
