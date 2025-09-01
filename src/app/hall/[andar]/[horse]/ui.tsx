"use client";

import { useState, useTransition } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";

/* ======== VOTO ACTUALIZADO ======== */
export function VoteButton({ horseId }: { horseId: string }) {
  const [pending, setPending] = useState(false);
  const [voteData, setVoteData] = useState<{ total_votes: number; user_vote: number | null }>({
    total_votes: 0,
    user_vote: null
  });
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (value: 1 | -1) => {
    if (pending) return;
    
    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/hall/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horse_id: horseId, value }),
      });

      const result = await response.json();
      if (result?.success) {
        setVoteData({
          total_votes: result.data.total_votes,
          user_vote: result.data.user_vote
        });
      } else {
        setError(result?.error || "Error al votar");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={pending}
        onClick={() => handleVote(1)}
        className={`
          flex items-center justify-center w-10 h-8 rounded border transition-colors
          ${voteData.user_vote === 1 
            ? 'bg-green-100 border-green-500 text-green-700' 
            : 'bg-white border-gray-300 hover:bg-green-50'
          }
          ${pending ? 'opacity-50' : ''}
        `}
      >
        {pending ? <LoadingSpinner size="sm" /> : "👍"}
      </button>
      
      <span className="text-sm font-medium">{voteData.total_votes}</span>
      
      <button
        disabled={pending}
        onClick={() => handleVote(-1)}
        className={`
          flex items-center justify-center w-10 h-8 rounded border transition-colors
          ${voteData.user_vote === -1 
            ? 'bg-red-100 border-red-500 text-red-700' 
            : 'bg-white border-gray-300 hover:bg-red-50'
          }
          ${pending ? 'opacity-50' : ''}
        `}
      >
        {pending ? <LoadingSpinner size="sm" /> : "👎"}
      </button>

      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError(null)}
          className="absolute top-full left-0 mt-2 z-10"
        />
      )}
    </div>
  );
}

/* ======== COMENTARIOS ACTUALIZADO ======== */
export function CommentForm({ horseId }: { horseId: string }) {
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content?.trim()) {
      setError("El comentario no puede estar vacío");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/hall/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horse_id: horseId, content: content.trim() }),
      });

      const result = await response.json();
      if (result?.success) {
        setContent("");
        // Opcional: callback para actualizar lista de comentarios
      } else {
        setError(result?.error || "Error al enviar comentario");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe un comentario…"
          className="flex-1 rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={pending}
        />
        <button 
          type="submit"
          disabled={pending || !content?.trim()} 
          className={`
            rounded px-4 py-2 font-medium transition-colors
            ${pending || !content?.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-700 text-white hover:bg-green-800'
            }
          `}
        >
          {pending ? <LoadingSpinner size="sm" color="white" /> : "Publicar"}
        </button>
      </form>
      
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}
    </div>
  );
}

/* ======== ACCIONES SIMPLIFICADAS ======== */
export function MediaComments({ mediaId }: { mediaId: string }) {
  return (
    <div className="mt-3">
      <p className="text-sm text-gray-600">Comentarios sobre este media (próximamente)</p>
    </div>
  );
}

export function AdminMediaActions({
  horseId,
  mediaId,
  onDone,
}: {
  horseId: string;
  mediaId: string;
  onDone?: () => void;
}) {
  const [pending, setPending] = useState(false);

  return (
    <div className="flex gap-2 mt-2">
      <button
        disabled={pending}
        onClick={() => {
          setPending(true);
          // Placeholder para funcionalidad futura
          setTimeout(() => {
            setPending(false);
            onDone?.();
          }, 1000);
        }}
        className="text-xs rounded border px-2 py-1 bg-white hover:bg-amber-50 disabled:opacity-50"
      >
        {pending ? <LoadingSpinner size="sm" /> : "⭐ Portada"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          const ok = confirm("¿Eliminar archivo?");
          if (!ok) return;
          setPending(true);
          // Placeholder para funcionalidad futura
          setTimeout(() => {
            setPending(false);
            onDone?.();
          }, 1000);
        }}
        className="text-xs rounded border px-2 py-1 bg-white hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? <LoadingSpinner size="sm" /> : "🗑️ Eliminar"}
      </button>
    </div>
  );
}
