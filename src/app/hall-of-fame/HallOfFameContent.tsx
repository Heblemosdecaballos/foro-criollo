
// Client component for Hall of Fame content
'use client';

import { useState, useEffect } from 'react';
import { Horse } from '@/lib/hall-of-fame/types';
import { getHorses, searchHorses } from '@/lib/hall-of-fame/services';
import { useAuth } from '@/hooks/useAuth';
import HorseCard from '@/components/hall-of-fame/HorseCard';
import SearchBar from '@/components/hall-of-fame/SearchBar';
import Link from 'next/link';

type FilterType = 'all' | 'featured' | 'recent';

export default function HallOfFameContent() {
  const { isAdmin } = useAuth();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [filteredHorses, setFilteredHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHorses();
  }, []);

  useEffect(() => {
    filterHorses();
  }, [horses, activeFilter, searchQuery]);

  const loadHorses = async () => {
    try {
      setLoading(true);
      const data = await getHorses();
      setHorses(data);
    } catch (err) {
      setError('Error al cargar los caballos');
      console.error('Error loading horses:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterHorses = () => {
    let filtered = [...horses];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(horse =>
        horse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        horse.creator?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        horse.genealogy?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (activeFilter) {
      case 'featured':
        filtered = filtered.filter(horse => horse.featured);
        break;
      case 'recent':
        filtered = filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 12);
        break;
      default:
        // Sort featured first, then by creation date
        filtered = filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }

    setFilteredHorses(filtered);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const searchResults = await searchHorses(query);
        setHorses(searchResults);
      } catch (err) {
        console.error('Error searching horses:', err);
      }
    } else {
      loadHorses();
    }
  };

  const filters = [
    { key: 'all' as FilterType, label: 'Todos', count: horses.length },
    { key: 'featured' as FilterType, label: 'Destacados', count: horses.filter(h => h.featured).length },
    { key: 'recent' as FilterType, label: 'Recientes', count: horses.length }
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadHorses}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Admin Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="max-w-md mx-auto md:mx-0">
          <SearchBar onSearch={handleSearch} />
        </div>
        
        {isAdmin && (
          <Link
            href="/admin/hall-of-fame/new"
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Caballo
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          {filters.map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeFilter === filter.key
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:text-amber-600'
              }`}
            >
              {filter.label}
              <span className="ml-1 text-xs opacity-75">({filter.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filteredHorses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-30">🐎</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No se encontraron resultados' : 'No hay caballos registrados'}
          </h3>
          <p className="text-gray-600">
            {searchQuery 
              ? 'Intenta con otros términos de búsqueda'
              : 'Los caballos aparecerán aquí cuando sean agregados por los administradores'
            }
          </p>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="text-center text-sm text-gray-600">
            {searchQuery && (
              <p>
                Mostrando {filteredHorses.length} resultado{filteredHorses.length !== 1 ? 's' : ''} 
                para "{searchQuery}"
              </p>
            )}
          </div>

          {/* Horses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHorses.map(horse => (
              <HorseCard key={horse.id} horse={horse} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
