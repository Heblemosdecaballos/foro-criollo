
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps<T> {
  items: T[];
  loadMore: () => Promise<T[]>;
  hasMore: boolean;
  loading: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  threshold?: number;
  loadingComponent?: React.ReactNode;
  endMessage?: React.ReactNode;
}

export function InfiniteScroll<T>({
  items,
  loadMore,
  hasMore,
  loading,
  renderItem,
  className = '',
  threshold = 0.8,
  loadingComponent,
  endMessage
}: InfiniteScrollProps<T>) {
  const [allItems, setAllItems] = useState<T[]>(items);
  const observerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  // Actualizar items cuando cambien las props
  useEffect(() => {
    setAllItems(items);
  }, [items]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || loading) return;
    
    isLoadingRef.current = true;
    
    try {
      const newItems = await loadMore();
      setAllItems(prev => [...prev, ...newItems]);
    } catch (error) {
      console.error('Error cargando más elementos:', error);
    } finally {
      isLoadingRef.current = false;
    }
  }, [loadMore, hasMore, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          handleLoadMore();
        }
      },
      {
        threshold,
        rootMargin: '100px'
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [handleLoadMore, hasMore, loading, threshold]);

  const defaultLoadingComponent = (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      <span className="ml-2 text-gray-600">Cargando más contenido...</span>
    </div>
  );

  const defaultEndMessage = (
    <div className="text-center py-8 text-gray-500">
      <p>No hay más contenido para mostrar</p>
    </div>
  );

  return (
    <div className={className}>
      {/* Renderizar elementos */}
      {allItems.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}

      {/* Indicador de carga */}
      {loading && (loadingComponent || defaultLoadingComponent)}

      {/* Mensaje de fin */}
      {!hasMore && !loading && allItems.length > 0 && (
        endMessage || defaultEndMessage
      )}

      {/* Observer target */}
      {hasMore && !loading && (
        <div ref={observerRef} className="h-4" />
      )}

      {/* Mensaje cuando no hay elementos */}
      {!loading && allItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay elementos para mostrar</p>
        </div>
      )}
    </div>
  );
}
