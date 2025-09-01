
"use client";

import { useState } from "react";

interface HallCommentFormProps {
  horseId: string;
  onCommentAdded?: (comment: any) => void;
}

export default function HallCommentForm({ horseId, onCommentAdded }: HallCommentFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content?.trim()) {
      setError("El comentario no puede estar vacío");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hall/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          horse_id: horseId,
          content: content.trim()
        }),
      });

      const result = await response.json();

      if (result?.success) {
        setContent("");
        onCommentAdded?.(result.data);
      } else {
        setError(result?.error || "Error al enviar comentario");
      }
    } catch (err) {
      console.error("Comment error:", err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Agregar comentario
        </label>
        <textarea
          id="comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Comparte tu opinión sobre este ejemplar..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={loading}
        />
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !content?.trim()}
        className={`
          px-4 py-2 rounded-lg font-medium transition-colors
          ${loading || !content?.trim()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
            Enviando...
          </div>
        ) : (
          "Comentar"
        )}
      </button>
    </form>
  );
}
