'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ReportButton({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const canSend = reason.trim().length > 2;

  async function submit() {
    try {
      setSending(true);
      const { data: { user }, error: uErr } = await supabase.auth.getUser();
      if (uErr) throw uErr;
      if (!user) throw new Error('Debes iniciar sesión');

      const { error } = await supabase.from('reports').insert({
        post_id: postId,
        reporter_id: user.id,
        reason: reason.trim(),
      });
      if (error) throw error;

      setOpen(false);
      setReason('');
      alert('Gracias. Tu reporte fue enviado.');
    } catch (e: any) {
      alert(e.message ?? 'No se pudo enviar el reporte');
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <button className="underline text-sm" onClick={() => setOpen(true)}>
        Reportar
      </button>
    );
  }

  return (
    <div className="mt-2 p-2 border rounded space-y-2">
      <textarea
        className="w-full border rounded p-2 min-h-[80px]"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Cuéntanos brevemente el motivo…"
      />
      <div className="flex gap-2">
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          onClick={submit}
          disabled={!canSend || sending}
        >
          Enviar
        </button>
        <button className="px-3 py-1 rounded border" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
