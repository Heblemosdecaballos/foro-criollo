
"use client";

import { useState, useEffect } from "react";

interface VoteButtonProps {
  horseId: string;
  initialVotes?: number;
  className?: string;
}

interface VoteData {
  total_votes: number;
  up_votes: number;
  down_votes: number;
  user_vote: number | null;
}

export default function VoteButton({ horseId, initialVotes = 0, className = "" }: VoteButtonProps) {
  const [voteData, setVoteData] = useState<VoteData>({
    total_votes: initialVotes,
    up_votes: 0,
    down_votes: 0,
    user_vote: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadVotes();
  }, [horseId]);

  const loadVotes = async () => {
    if (!horseId) return;
    
    try {
      const response = await fetch(`/api/hall/votes?horse_id=${horseId}`);
      const result = await response.json();
      
      if (result?.success && result?.data) {
        setVoteData(result.data);
      }
    } catch (err) {
      console.error("Error loading votes:", err);
      setError("Error cargando votos");
    }
  };

  const handleVote = async (value: 1 | -1) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hall/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          horse_id: horseId,
          value
        }),
      });

      const result = await response.json();

      if (result?.success) {
        // Recargar votos después de votar
        await loadVotes();
      } else {
        setError(result?.error || "Error al votar");
      }
    } catch (err) {
      console.error("Vote error:", err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Evitar hydration mismatch
  if (!mounted) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
        <span className="text-sm text-gray-500">Cargando...</span>
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Botón de voto positivo */}
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`
          flex items-center justify-center w-8 h-8 rounded-full border transition-colors
          ${voteData?.user_vote === 1 
            ? 'bg-green-100 border-green-500 text-green-700' 
            : 'bg-white border-gray-300 hover:bg-green-50 text-gray-600'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title="Votar positivo"
      >
        {loading && voteData?.user_vote !== 1 ? (
          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          "👍"
        )}
      </button>

      {/* Contador de votos */}
      <div className="flex flex-col items-center text-xs">
        <span className="font-semibold text-gray-700">
          {voteData?.total_votes || 0}
        </span>
        <span className="text-gray-500">votos</span>
      </div>

      {/* Botón de voto negativo */}
      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`
          flex items-center justify-center w-8 h-8 rounded-full border transition-colors
          ${voteData?.user_vote === -1 
            ? 'bg-red-100 border-red-500 text-red-700' 
            : 'bg-white border-gray-300 hover:bg-red-50 text-gray-600'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title="Votar negativo"
      >
        {loading && voteData?.user_vote !== -1 ? (
          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          "👎"
        )}
      </button>

      {/* Mensaje de error */}
      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
